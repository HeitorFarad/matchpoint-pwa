import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDoc, getDocs, onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

// ── PELADAS ──────────────────────────────────────────

export function subscribePeladas(userId, callback) {
  const q = query(collection(db, 'peladas'), orderBy('criadoEm', 'desc'))
  return onSnapshot(q, (snap) => {
    const peladas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(peladas)
  })
}

export async function criarPelada(dados, user) {
  return await addDoc(collection(db, 'peladas'), {
    ...dados,
    organizadorId: user.uid,
    organizador: user.displayName || user.email,
    confirmados: [{ id: user.uid, name: user.displayName || user.email, organizador: true }],
    pendentes: [],
    espera: 0,
    criadoEm: serverTimestamp(),
  })
}

export async function getPelada(id) {
  const snap = await getDoc(doc(db, 'peladas', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function atualizarPelada(id, dados) {
  await updateDoc(doc(db, 'peladas', id), dados)
}

export async function deletarPelada(id) {
  await deleteDoc(doc(db, 'peladas', id))
}

export async function getPeladasConfirmadasDoUsuario(uid) {
  const snap = await getDocs(collection(db, 'peladas'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => (p.confirmados || []).some((c) => c.id === uid))
}

export async function confirmarPelada(peladaId, user) {
  const ref = doc(db, 'peladas', peladaId)
  const snap = await getDoc(ref)
  const pelada = snap.data()
  const jaConfirmado = pelada.confirmados?.some(c => c.id === user.uid)
  if (jaConfirmado) return
  await updateDoc(ref, {
    confirmados: [...(pelada.confirmados || []), { id: user.uid, name: user.displayName || user.email }]
  })
}

// ── TREINOS ──────────────────────────────────────────

export function subscribeTreinos(userId, callback) {
  const q = query(collection(db, 'treinos'), orderBy('criadoEm', 'desc'))
  return onSnapshot(q, (snap) => {
    const treinos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(treinos)
  })
}

export async function criarTreino(dados, user) {
  return await addDoc(collection(db, 'treinos'), {
    ...dados,
    organizadorId: user.uid,
    organizador: user.displayName || user.email,
    confirmados: [{ id: user.uid, name: user.displayName || user.email, tipo: 'Fixo', status: 'confirmou' }],
    cancelaram: [],
    aguardando: [],
    criadoEm: serverTimestamp(),
  })
}

export async function getTreino(id) {
  const snap = await getDoc(doc(db, 'treinos', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function atualizarTreino(id, dados) {
  await updateDoc(doc(db, 'treinos', id), dados)
}

export async function deletarTreino(id) {
  await deleteDoc(doc(db, 'treinos', id))
}

// ── USUARIOS ─────────────────────────────────────────

export async function atualizarUsuario(uid, dados) {
  await setDoc(doc(db, 'usuarios', uid), dados, { merge: true })
}

export async function getUsuario(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function sincronizarUsuario(user) {
  await setDoc(doc(db, 'usuarios', user.uid), {
    nome: user.displayName || user.email,
    email: user.email,
  }, { merge: true })
}

export async function buscarUsuarioPorUsername(username) {
  const q = query(collection(db, 'usuarios'), where('username', '==', username))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

// ── AMIZADES ─────────────────────────────────────────

export async function buscarAmizadeEntre(uid1, uid2) {
  const q1 = query(collection(db, 'amizades'), where('de', '==', uid1), where('para', '==', uid2))
  const q2 = query(collection(db, 'amizades'), where('de', '==', uid2), where('para', '==', uid1))
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
  const d = snap1.docs[0] || snap2.docs[0]
  return d ? { id: d.id, ...d.data() } : null
}

export async function enviarSolicitacaoAmizade(deUid, paraUid) {
  return await addDoc(collection(db, 'amizades'), {
    de: deUid,
    para: paraUid,
    status: 'pendente',
    criadoEm: serverTimestamp(),
  })
}

export async function buscarSolicitacoesPendentes(uid) {
  const q = query(collection(db, 'amizades'), where('para', '==', uid), where('status', '==', 'pendente'))
  const snap = await getDocs(q)
  const solicitacoes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return await Promise.all(
    solicitacoes.map(async (s) => ({ ...s, usuario: await getUsuario(s.de) }))
  )
}

export async function buscarSolicitacoesEnviadas(uid) {
  const q = query(collection(db, 'amizades'), where('de', '==', uid), where('status', '==', 'pendente'))
  const snap = await getDocs(q)
  const solicitacoes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return await Promise.all(
    solicitacoes.map(async (s) => ({ ...s, usuario: await getUsuario(s.para) }))
  )
}

export async function buscarAmigos(uid) {
  const qDe = query(collection(db, 'amizades'), where('de', '==', uid), where('status', '==', 'aceito'))
  const qPara = query(collection(db, 'amizades'), where('para', '==', uid), where('status', '==', 'aceito'))
  const [snapDe, snapPara] = await Promise.all([getDocs(qDe), getDocs(qPara)])
  const amizades = [
    ...snapDe.docs.map((d) => ({ id: d.id, amigoUid: d.data().para })),
    ...snapPara.docs.map((d) => ({ id: d.id, amigoUid: d.data().de })),
  ]
  return await Promise.all(
    amizades.map(async (a) => ({ id: a.id, uid: a.amigoUid, ...(await getUsuario(a.amigoUid)) }))
  )
}

export async function responderSolicitacao(amizadeId, status) {
  await updateDoc(doc(db, 'amizades', amizadeId), { status })
}

export async function cancelarSolicitacao(amizadeId) {
  await deleteDoc(doc(db, 'amizades', amizadeId))
}