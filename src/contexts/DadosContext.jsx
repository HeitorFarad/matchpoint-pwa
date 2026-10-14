import { createContext, useContext, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

// Dados do usuário no Firestore:
//   usuarios/{uid}                 → { programaInicio: 'YYYY-MM-DD' }
//   usuarios/{uid}/sessoes/{id}    → treino registrado
//   usuarios/{uid}/medidas/sem{n}  → medidas das semanas 1, 4, 8 e 12
//
// As gravações não esperam o servidor responder: com o cache offline elas
// valem na hora no aparelho e sobem para a nuvem quando houver conexão.

const DadosContext = createContext()

export function useDados() {
  return useContext(DadosContext)
}

export function DadosProvider({ children }) {
  const { user } = useAuth()
  const uid = user.uid
  const [perfil, setPerfil] = useState(null)
  const [sessoes, setSessoes] = useState([])
  const [medidas, setMedidas] = useState({})
  const [carregado, setCarregado] = useState(false)
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const falhou = (e) => {
      console.error(e)
      setErro(e.code === 'permission-denied'
        ? 'Sem permissão para acessar o banco. Confira as regras do Firestore.'
        : 'Erro ao carregar os dados.')
      setCarregado(true)
    }

    const unsubPerfil = onSnapshot(doc(db, 'usuarios', uid), (snap) => {
      setPerfil(snap.data() || {})
    }, falhou)

    const unsubSessoes = onSnapshot(
      query(collection(db, 'usuarios', uid, 'sessoes'), orderBy('data', 'desc')),
      { includeMetadataChanges: true },
      (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        // Mesmo dia: o mais recente primeiro.
        lista.sort((a, b) => (b.data.localeCompare(a.data)) || ((b.fim || 0) - (a.fim || 0)))
        setSessoes(lista)
        setPendente(snap.metadata.hasPendingWrites)
        setCarregado(true)
      },
      falhou,
    )

    const unsubMedidas = onSnapshot(collection(db, 'usuarios', uid, 'medidas'), (snap) => {
      const mapa = {}
      snap.docs.forEach((d) => { mapa[d.data().semana] = d.data() })
      setMedidas(mapa)
    }, falhou)

    return () => {
      unsubPerfil()
      unsubSessoes()
      unsubMedidas()
    }
  }, [uid])

  const gravar = (promessa) => {
    promessa.catch((e) => {
      console.error(e)
      setErro(e.code === 'permission-denied'
        ? 'Não foi possível salvar: sem permissão no Firestore.'
        : 'Erro ao salvar na nuvem.')
    })
  }

  const salvarInicio = (programaInicio) => {
    setPerfil((p) => ({ ...p, programaInicio }))
    gravar(setDoc(doc(db, 'usuarios', uid), { programaInicio }, { merge: true }))
  }

  const salvarSessao = (sessao) => {
    const ref = sessao.id
      ? doc(db, 'usuarios', uid, 'sessoes', sessao.id)
      : doc(collection(db, 'usuarios', uid, 'sessoes'))
    const { id: _id, ...dados } = sessao
    gravar(setDoc(ref, { ...dados, atualizadoEm: serverTimestamp() }))
    return ref.id
  }

  const excluirSessao = (id) => {
    gravar(deleteDoc(doc(db, 'usuarios', uid, 'sessoes', id)))
  }

  const salvarMedida = (semana, dados) => {
    gravar(setDoc(doc(db, 'usuarios', uid, 'medidas', `sem${semana}`), { ...dados, semana }, { merge: true }))
  }

  const value = {
    perfil, sessoes, medidas, carregado, pendente, erro,
    limparErro: () => setErro(''),
    salvarInicio, salvarSessao, excluirSessao, salvarMedida,
  }

  return <DadosContext.Provider value={value}>{children}</DadosContext.Provider>
}
