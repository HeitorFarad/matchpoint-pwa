import { useState, useEffect } from 'react'
import Modal from './Modal'
import Avatar from './Avatar'
import { useAuth } from '../contexts/AuthContext'
import { buscarAmizadeEntre, buscarUsuarioPorEmail, enviarSolicitacaoAmizade } from '../services/firestore'

export default function ParticipanteModal({ open, onClose, participante }) {
  const { user } = useAuth()
  const [uidAlvo, setUidAlvo] = useState(null)
  const [status, setStatus] = useState('carregando')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!open || !participante) return
    let ativo = true
    setStatus('carregando')
    setMensagem('')
    setUidAlvo(null)

    async function resolver() {
      let uid = participante.uid || participante.id
      if (!uid && participante.email) {
        try {
          const usuario = await buscarUsuarioPorEmail(participante.email)
          uid = usuario?.id || null
        } catch (e) {
          console.error('Erro ao buscar usuário por e-mail:', e)
        }
      }
      if (!ativo) return
      setUidAlvo(uid)

      if (!uid) {
        setStatus('desconhecido')
        return
      }
      if (uid === user.uid) {
        setStatus('voce')
        return
      }
      try {
        const amizade = await buscarAmizadeEntre(user.uid, uid)
        if (!ativo) return
        if (amizade?.status === 'aceito') setStatus('amigo')
        else if (amizade?.status === 'pendente') setStatus('pendente')
        else setStatus('nenhum')
      } catch (e) {
        console.error('Erro ao verificar amizade:', e)
        if (!ativo) return
        setStatus('nenhum')
      }
    }

    resolver()

    return () => {
      ativo = false
    }
  }, [open, participante, user.uid])

  async function adicionarAmigo() {
    if (enviando || !uidAlvo) return
    setEnviando(true)
    setMensagem('')
    try {
      await enviarSolicitacaoAmizade(user.uid, uidAlvo)
      setStatus('pendente')
      setMensagem('Solicitação enviada! ✓')
    } catch (e) {
      console.error('Erro ao enviar solicitação de amizade:', e)
      setMensagem('Erro ao enviar solicitação. Tente novamente.')
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
          {status === 'carregando' || status === 'voce' ? null : status === 'desconhecido' ? (
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Esse participante ainda não tem conta no MatchPoint.
            </p>
          ) : status === 'amigo' ? (
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

          {mensagem && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                fontWeight: 600,
                color: mensagem.startsWith('Erro') ? 'var(--red)' : 'var(--primary)',
              }}
            >
              {mensagem}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
