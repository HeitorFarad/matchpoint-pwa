import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volleyball } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { useAuth } from '../contexts/AuthContext'
import { getPeladasConfirmadasDoUsuario, getUsuario } from '../services/firestore'
import { formatarData } from '../utils/formatarData'

export default function Perfil() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const nome = user.displayName || user.email
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [dadosUsuario, setDadosUsuario] = useState(null)

  useEffect(() => {
    let ativo = true
    getPeladasConfirmadasDoUsuario(user.uid).then((peladas) => {
      if (!ativo) return
      setHistorico(peladas)
      setLoading(false)
    })
    return () => {
      ativo = false
    }
  }, [user.uid])

  useEffect(() => {
    let ativo = true
    getUsuario(user.uid).then((res) => {
      if (!ativo) return
      setDadosUsuario(res)
    })
    return () => {
      ativo = false
    }
  }, [user.uid])

  const totalConfirmadas = historico.length
  const organizadas = historico.filter((p) => p.organizadorId === user.uid).length
  const subtitulo = [user.displayName ? user.email : null, dadosUsuario?.cidade]
    .filter(Boolean)
    .join(' · ')

  return (
    <div>
      <div className="header-green" style={{ textAlign: 'center' }}>
        <div
          className="avatar"
          style={{
            width: 64,
            height: 64,
            fontSize: 24,
            margin: '0 auto 10px',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
          }}
        >
          {nome[0]?.toUpperCase()}
        </div>
        <h1 style={{ fontSize: 19, marginBottom: 2 }}>{nome}</h1>
        {subtitulo && (
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{subtitulo}</p>
        )}
        {dadosUsuario?.nivel && (
          <div style={{ marginTop: 10 }}>
            <span className="badge badge-white">{dadosUsuario.nivel}</span>
          </div>
        )}
      </div>

      <div className="app-content">
        <Card>
          <div className="row-between" style={{ textAlign: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                {totalConfirmadas}
              </p>
              <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                Peladas
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                {organizadas}
              </p>
              <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                Organizadas
              </p>
            </div>
          </div>
        </Card>

        <Card title="Histórico" style={{ marginTop: 12 }}>
          {loading ? (
            <p className="empty-state">Carregando...</p>
          ) : historico.length === 0 ? (
            <p className="empty-state">Nenhuma pelada ainda.</p>
          ) : (
            historico.map((p) => (
              <div className="list-row" key={p.id}>
                <div
                  className="icon-btn"
                  style={{ border: 'none', background: 'var(--green-bg)' }}
                >
                  <Volleyball size={18} color="var(--primary)" />
                </div>
                <div className="info">
                  <p className="name">{p.nome}</p>
                  <p className="sub">{formatarData(p.data)}</p>
                </div>
                <Badge color="green">Confirmado</Badge>
              </div>
            ))
          )}
        </Card>

        <button
          className="btn-outline btn-outline-full"
          style={{ marginTop: 16 }}
          onClick={() => navigate('/editar-perfil')}
        >
          Editar perfil
        </button>
      </div>
    </div>
  )
}
