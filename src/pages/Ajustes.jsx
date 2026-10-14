import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDados } from '../contexts/DadosContext'
import { FASES, REGRAS, TOTAL_SEMANAS } from '../data/programa'
import { inicioParaSemana } from '../lib/progressao'
import { useSemana } from '../lib/useSemana'
import { dataLonga } from '../lib/formatar'

export default function Ajustes() {
  const { user, logout } = useAuth()
  const { salvarInicio } = useDados()
  const { configurado, semana, bruta, inicio } = useSemana()

  return (
    <main className="app-content">
      <h1 style={{ fontSize: 24, margin: '8px 0 16px' }}>Ajustes</h1>

      <div className="card">
        <p className="card-title">Semana do programa</p>
        <p className="muted small" style={{ margin: '0 0 12px' }}>
          {configurado
            ? `Começou na semana de ${dataLonga(inicio)}. A semana avança sozinha toda segunda.`
            : 'Ainda não configurado.'}
        </p>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="semana">Esta semana é a</label>
          <select
            id="semana"
            value={configurado && bruta >= 1 && bruta <= TOTAL_SEMANAS ? semana : ''}
            onChange={(e) => salvarInicio(inicioParaSemana(Number(e.target.value)))}
          >
            <option value="" disabled>Escolha…</option>
            {Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>Semana {n}</option>
            ))}
          </select>
        </div>
        <p className="muted small" style={{ margin: '10px 0 0' }}>
          Ficou uma semana sem treinar ou quer repetir uma fase? É só escolher a semana aqui. Para recomeçar o ciclo, escolha a semana 1.
        </p>
      </div>

      <p className="section-title">Fases</p>
      {FASES.map((f) => (
        <div key={f.n} className={`aviso`} style={{ background: `var(--fase${f.n}-bg)`, color: `var(--fase${f.n})`, marginTop: 8 }}>
          <b>Semanas {f.semanas} · {f.nome}</b><br />{f.texto}
        </div>
      ))}

      <p className="section-title">Regras do programa</p>
      {REGRAS.map((r) => (
        <div key={r.titulo} className="aviso neutro" style={{ marginTop: 8 }}>
          <b>{r.titulo}</b><br />{r.texto}
        </div>
      ))}

      <p className="section-title">Conta</p>
      <div className="card">
        <div className="row-between">
          <span className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
          <button className="btn-outline" onClick={logout}><LogOut size={16} /> Sair</button>
        </div>
      </div>
    </main>
  )
}
