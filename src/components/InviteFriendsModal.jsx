import { useState, useEffect } from 'react'
import Modal from './Modal'
import Avatar from './Avatar'
import { useAuth } from '../contexts/AuthContext'
import { buscarAmigos } from '../services/firestore'

export default function InviteFriendsModal({ open, onClose, excludeIds = [], onConvidar }) {
  const { user } = useAuth()
  const [amigos, setAmigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [convidando, setConvidando] = useState(null)
  const [convidados, setConvidados] = useState([])

  useEffect(() => {
    if (!open) return
    let ativo = true
    setLoading(true)
    buscarAmigos(user.uid)
      .then((lista) => {
        if (!ativo) return
        setAmigos(lista)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao carregar amigos:', e)
        if (!ativo) return
        setLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [open, user.uid])

  useEffect(() => {
    if (!open) setConvidados([])
  }, [open])

  async function handleConvidar(amigo) {
    if (convidando) return
    setConvidando(amigo.uid)
    try {
      await onConvidar(amigo)
      setConvidados((list) => [...list, amigo.uid])
    } catch (e) {
      console.error('Erro ao convidar amigo:', e)
    } finally {
      setConvidando(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Convidar amigos">
      {loading ? (
        <p className="empty-state">Carregando...</p>
      ) : amigos.length === 0 ? (
        <p className="empty-state">
          Você ainda não tem amigos adicionados. Vá em Amigos para adicionar.
        </p>
      ) : (
        amigos.map((a) => {
          const jaParticipa = excludeIds.includes(a.uid) || convidados.includes(a.uid)
          return (
            <div className="list-row" key={a.id}>
              <Avatar name={a.nome || a.username || '?'} size={40} />
              <div className="info">
                <p className="name">{a.nome || a.username}</p>
                {a.username && <p className="sub">@{a.username}</p>}
              </div>
              <button
                type="button"
                className="btn-outline"
                style={{ flexShrink: 0 }}
                disabled={jaParticipa || convidando === a.uid}
                onClick={() => handleConvidar(a)}
              >
                {jaParticipa ? 'Já confirmado' : convidando === a.uid ? 'Convidando...' : 'Convidar'}
              </button>
            </div>
          )
        })
      )}
    </Modal>
  )
}
