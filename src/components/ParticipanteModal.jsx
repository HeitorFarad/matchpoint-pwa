import { useState, useEffect } from 'react'
import Modal from './Modal'
import Avatar from './Avatar'
import { useAuth } from '../contexts/AuthContext'
import { buscarAmizadeEntre, enviarSolicitacaoAmizade } from '../services/firestore'

export default function ParticipanteModal({ open, onClose, participante }) {
  const { user } = useAuth()
  const [status, setStatus] = useState('carregando')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!open || !participante) return
    let ativo = true
    setStatus('carregando')

    if (participante.id === user.uid) {
      setStatus('voce')
      return
    }

    buscarAmizadeEntre(user.uid, participante.id)
      .then((amizade) => {
        if (!ativo) return
        if (amizade?.status === 'aceito') setStatus('amigo')
        else if (amizade?.status === 'pendente') setStatus('pendente')
        else setStatus('nenhum')
      })
      .catch((e) => {
        console.error('Erro ao verificar amizade:', e)
        if (!ativo) return
        setStatus('nenhum')
      })

    return () => {
      ativo = false
    }
  }, [open, participante, user.uid])

  async function adicionarAmigo() {
    if (enviando || !participante) return
    setEnviando(true)
    try {
      await enviarSolicitacaoAmizade(user.uid, participante.id)
      setStatus('pendente')
    } catch (e) {
      console.error('Erro ao enviar solicitação de amizade:', e)
    } finally {
      setEnviando(false)
    }
  }

  if (!participante) return null

  const nome = participante.nome || participante.name || '?'
  const username = participante.username

  return (
    <Modal open={open} onClose={onClose} variant="center">
      <div style={{ textAlign: 'center', padding: '8px 4px' }}>
        <Avatar name={nome} size={64} style={{ margin: '0 auto 12px', fontSize: 24 }} />
        <p style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>{nome}</p>
        {username && (
          <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
            @{username}
          </p>
        )}

        <div style={{ marginTop: 20 }}>
          {status === 'carregando' || status === 'voce' ? null : status === 'amigo' ? (
            <p style={{ color: 'var(--primary)', fontWeight: 600, margin: 0 }}>Já é seu amigo ✓</p>
          ) : status === 'pendente' ? (
            <button type="button" className="btn-outline btn-outline-full" disabled>
              Solicitação enviada
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={adicionarAmigo} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Adicionar como amigo'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
