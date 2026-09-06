import { Users } from 'lucide-react'

export default function Amigos() {
  return (
    <div>
      <div className="page-header">
        <h1>Amigos</h1>
      </div>

      <div className="app-content" style={{ paddingTop: 4 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px 20px',
          }}
        >
          <div
            className="icon-btn"
            style={{ width: 64, height: 64, border: 'none', background: 'var(--green-bg)', marginBottom: 16 }}
          >
            <Users size={28} color="var(--primary)" />
          </div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-title)' }}>
            Em breve
          </p>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
            O sistema de amigos ainda está em construção.
          </p>
        </div>
      </div>
    </div>
  )
}
