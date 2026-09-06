import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import { getPelada } from '../services/firestore'

export default function ConvitePublico() {
  const { id } = useParams()
  const [pelada, setPelada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmado, setConfirmado] = useState(false)

  useEffect(() => {
    let ativo = true
    setLoading(true)
    getPelada(id).then((res) => {
      if (!ativo) return
      setPelada(res)
      setLoading(false)
    })
    return () => {
      ativo = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="app-content">
        <p className="empty-state">Carregando...</p>
      </div>
    )
  }

  if (!pelada) {
    return (
      <div className="app-content">
        <p className="empty-state">Convite não encontrado.</p>
      </div>
    )
  }

  const confirmadosPelada = pelada.confirmados || []
  const vagasRestantes = Math.max(pelada.vagas - confirmadosPelada.length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <div className="header-green" style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9, fontWeight: 600 }}>
          Você foi convidado 🏐
        </p>
        <h1 style={{ fontSize: 22, margin: '8px 0 4px' }}>{pelada.nome}</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>por {pelada.organizador}</p>
      </div>

      <div className="app-content" style={{ flex: 1 }}>
        <div className="card">
          <div className="list-row">
            <div className="icon-btn" style={{ border: 'none', background: 'var(--green-bg)' }}>
              <Calendar size={18} color="var(--primary)" />
            </div>
            <div className="info">
              <p className="name" style={{ fontWeight: 600 }}>
                {pelada.data} às {pelada.horario}
              </p>
            </div>
          </div>
          <div className="list-row">
            <div className="icon-btn" style={{ border: 'none', background: 'var(--green-bg)' }}>
              <MapPin size={18} color="var(--primary)" />
            </div>
            <div className="info">
              <p className="name" style={{ fontWeight: 600 }}>{pelada.local}</p>
            </div>
          </div>
          <div className="list-row">
            <div className="icon-btn" style={{ border: 'none', background: 'var(--green-bg)' }}>
              <Users size={18} color="var(--primary)" />
            </div>
            <div className="info">
              <p className="name" style={{ fontWeight: 600 }}>
                {confirmadosPelada.length}/{pelada.vagas} vagas · {vagasRestantes} restantes
              </p>
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 16, justifyContent: 'center', gap: 10 }}>
          <div className="avatar-stack">
            {confirmadosPelada.slice(0, 5).map((c) => (
              <Avatar key={c.id} name={c.name} size={32} />
            ))}
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {confirmadosPelada.length} confirmados
          </span>
        </div>

        <div style={{ marginTop: 28 }}>
          {confirmado ? (
            <button className="btn-primary" disabled>
              Presença confirmada ✓
            </button>
          ) : (
            <button className="btn-primary" onClick={() => setConfirmado(true)}>
              Quero ir! Confirmar presença
            </button>
          )}
          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
              Já tem conta? Entrar
            </Link>
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px 20px 28px' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
          MatchPoint 🏐
        </p>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
          Organize suas peladas de futevôlei
        </p>
      </div>
    </div>
  )
}
