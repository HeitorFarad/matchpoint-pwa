import { useNavigate } from 'react-router-dom'
import { Volleyball, CalendarCheck } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { currentUser, historico } from '../data/mock'

export default function Perfil() {
  const navigate = useNavigate()
  const presenca = Math.round(
    (historico.filter((h) => h.status === 'Confirmado').length / historico.length) * 100,
  )

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
          {currentUser.name[0]}
        </div>
        <h1 style={{ fontSize: 19, marginBottom: 2 }}>{currentUser.name}</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
          @{currentUser.username} · {currentUser.city}
        </p>
        <div style={{ marginTop: 10 }}>
          <span className="badge badge-white">{currentUser.level}</span>
        </div>
      </div>

      <div className="app-content">
        <Card>
          <div className="row-between" style={{ textAlign: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                24
              </p>
              <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                Peladas
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                6
              </p>
              <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                Organizadas
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                {presenca}%
              </p>
              <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                Presença
              </p>
            </div>
          </div>
        </Card>

        <Card title="Histórico" style={{ marginTop: 12 }}>
          {historico.map((h) => (
            <div className="list-row" key={h.id}>
              <div
                className="icon-btn"
                style={{ border: 'none', background: 'var(--green-bg)' }}
              >
                {h.nome.includes('Treino') ? (
                  <CalendarCheck size={18} color="var(--primary)" />
                ) : (
                  <Volleyball size={18} color="var(--primary)" />
                )}
              </div>
              <div className="info">
                <p className="name">{h.nome}</p>
                <p className="sub">{h.data}</p>
              </div>
              <Badge color={h.status === 'Confirmado' ? 'green' : 'red'}>{h.status}</Badge>
            </div>
          ))}
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
