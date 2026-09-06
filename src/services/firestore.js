import {
  collection, doc, addDoc, updateDoc, deleteDoc,
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