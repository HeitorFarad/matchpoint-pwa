import { Link } from 'react-router-dom'
import { Plus, MapPin, Clock } from 'lucide-react'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import { currentUser, peladas, treinos } from '../data/mock'

const hoje = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function Home() {
  const destaque = peladas[0]
  const outras = peladas.slice(1)

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <p className="muted" style={{ margin: 0, fontSize: 12, textTransform: 'capitalize' }}>
            {hoje}
          </p>
          <h1 style={{ fontSize: 22, marginTop: 4 }}>Peladas 🏐</h1>
        </div>
        <Avatar name={currentUser.name} size={44} />
      </div>

      <div className="app-content" style={{ paddingTop: 4 }}>
        <Link
          to={`/pelada/${destaque.id}`}
          className="card"
          style={{
            display: 'block',
            background: 'var(--primary)',
            border: 'none',
            color: '#fff',
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, opacity: 0.85, fontWeight: 600 }}>
            PRÓXIMA PELADA
          </p>
          <h2 style={{ margin: '8px 0 12px', fontSize: 19 }}>{destaque.nome}</h2>
          <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
            <span className="row" style={{ gap: 6, fontSize: 13 }}>
              <MapPin size={16} /> {destaque.local}
            </span>
            <span className="row" style={{ gap: 6, fontSize: 13 }}>
              <Clock size={16} /> {destaque.data} · {destaque.horario}
            </span>
          </div>
          <div className="row" style={{ marginTop: 14, gap: 10 }}>
            <div className="avatar-stack">
              {destaque.confirmados.slice(0, 4).map((c) => (
                <Avatar key={c.id} name={c.name} size={28} />
              ))}
            </div>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
              {destaque.confirmados.length}/{destaque.vagas} confirmados
            </span>
          </div>
        </Link>

        <div className="row-between" style={{ marginBottom: 12 }}>
          <p className="card-title" style={{ margin: 0 }}>
            Peladas abertas
          </p>
          <Link to="/criar-pelada" className="btn-outline">
            <Plus size={16} /> Nova
          </Link>
        </div>

        {outras.map((p) => {
          const lotada = p.confirmados.length >= p.vagas
          return (
            <Link key={p.id} to={`/pelada/${p.id}`} className="card" style={{ display: 'block' }}>
              <div className="row-between">
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{p.nome}</p>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {p.data} · {p.horario}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {lotada ? (
                    <Badge color="red">Lotada</Badge>
                  ) : (
                    <Badge color="green">
                      {p.confirmados.length}/{p.vagas}
                    </Badge>
                  )}
                  {p.espera > 0 && (
                    <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
                      {p.espera} na espera
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        <div className="row-between" style={{ margin: '20px 0 12px' }}>
          <p className="card-title" style={{ margin: 0 }}>
            Treinos fixos
          </p>
          <Link to="/criar-treino" className="btn-outline">
            <Plus size={16} /> Novo
          </Link>
        </div>

        {treinos.map((t) => (
          <Link key={t.id} to={`/treino/${t.id}`} className="card" style={{ display: 'block' }}>
            <div className="row-between">
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{t.nome}</p>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                  {t.dias.join(' e ')} · {t.inicio}–{t.fim}
                </p>
              </div>
              <Badge color="green">
                {t.confirmados.length}/{t.vagas} confirmados
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
