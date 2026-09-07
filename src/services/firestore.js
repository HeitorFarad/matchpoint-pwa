import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDoc, getDocs, query, where, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

function ordenarPorCriadoEmDesc(a, b) {
  return (b.criadoEm?.toMillis?.() ?? 0) - (a.criadoEm?.toMillis?.() ?? 0)
}

function combinarSemDuplicatas(...listas) {
  const mapa = new Map()
  for (const lista of listas) {
    for (const item of lista) mapa.set(item.id, item)
  }
  return [...mapa.values()].sort(ordenarPorCriadoEmDesc)
}

// ── PELADAS ──────────────────────────────────────────

export async function getPeladasDoUsuario(uid) {
  const q = query(collection(db, 'peladas'), where('organizadorId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getPeladasConfirmadas(uid) {
  const snap = await getDocs(collection(db, 'peladas'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => (p.confirmados || []).some((c) => (c.uid || c.id) === uid))
}

export async function getPeladasRelevantesDoUsuario(uid) {
  const [organizadas, confirmadas] = await Promise.all([
    getPeladasDoUsuario(uid),
    getPeladasConfirmadas(uid),
  ])
  return combinarSemDuplicatas(organizadas, confirmadas)
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
  if (!snap.exists()) throw new Error('Pelada não encontrada.')
  const pelada = snap.data()
  const jaConfirmado = pelada.confirmados?.some(c => c.id === user.uid)
  if (jaConfirmado) return
  const nome = user.displayName || user.email
  await updateDoc(ref, {
    confirmados: [...(pelada.confirmados || []), {
      id: user.uid,
      uid: user.uid,
      name: nome,
      nome,
      email: user.email,
      tipo: 'Convidado',
    }]
  })
}

export async function cancelarPresencaPelada(peladaId, uid) {
  const ref = doc(db, 'peladas', peladaId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Pelada não encontrada.')
  const pelada = snap.data()
  const confirmados = (pelada.confirmados || []).filter((c) => (c.uid || c.id) !== uid)
  await updateDoc(ref, { confirmados })
}

// ── TREINOS ──────────────────────────────────────────

export async function getTreinosDoUsuario(uid) {
  const q = query(collection(db, 'treinos'), where('organizadorId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getTreinosConfirmados(uid) {
  const snap = await getDocs(collection(db, 'treinos'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((t) => (t.confirmados || []).some((c) => (c.uid || c.id) === uid))
}

export async function getTreinosRelevantesDoUsuario(uid) {
  const [organizados, confirmados] = await Promise.all([
    getTreinosDoUsuario(uid),
    getTreinosConfirmados(uid),
  ])
  return combinarSemDuplicatas(organizados, confirmados)
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

export async function confirmarTreino(treinoId, user) {
  const ref = doc(db, 'treinos', treinoId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Treino não encontrado.')
  const treino = snap.data()
  const jaConfirmado = treino.confirmados?.some(c => c.id === user.uid)
  if (jaConfirmado) return
  const nome = user.displayName || user.email
  await updateDoc(ref, {
    confirmados: [...(treino.confirmados || []), {
      id: user.uid,
      uid: user.uid,
      name: nome,
      nome,
      email: user.email,
      tipo: 'Convidado',
      status: 'confirmou',
    }]
  })
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

export async function buscarUsuarioPorEmail(email) {
  if (!email) return null
  const q = query(collection(db, 'usuarios'), where('email', '==', email))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function deletarUsuario(uid) {
  await deleteDoc(doc(db, 'usuarios', uid))
}

export async function buscarUsuariosPorIds(ids) {
  const unicos = [...new Set(ids)].filter(Boolean)
  const pares = await Promise.all(unicos.map(async (id) => [id, await getUsuario(id)]))
  return Object.fromEntries(pares)
}

export async function gerarUsernameDisponivel(base) {
  const limpo = (base || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!limpo) return null
  let username = limpo
  let contador = 1
  while (await buscarUsuarioPorUsername(username)) {
    contador += 1
    username = `${limpo}${contador}`
  }
  return username
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