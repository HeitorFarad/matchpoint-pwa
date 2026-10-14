import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CloudOff } from 'lucide-react'
import { useDados } from '../contexts/DadosContext'
import { getDia } from '../data/programa'
import { dataLonga, duracao } from '../lib/formatar'

export default function Historico() {
  const { sessoes, carregado, pendente } = useDados()

  const porSemana = []
  for (const s of sessoes) {
    const grupo = porSemana[porSemana.length - 1]
    if (grupo?.semana === s.semana) grupo.lista.push(s)
    else porSemana.push({ semana: s.semana, lista: [s] })
  }

  return (
    <main className="app-content">
      <div className="row-between">
        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>Histórico</h1>
        {pendente && <span className="sync"><CloudOff size={14} /> aguardando internet</span>}
      </div>
      <p className="muted small" style={{ margin: 0 }}>{sessoes.length} treino{sessoes.length === 1 ? '' : 's'} registrado{sessoes.length === 1 ? '' : 's'}</p>

      {carregado && !sessoes.length && (
        <p className="empty-state">Nenhum treino ainda. Abra o treino do dia, marque as séries e toque em Finalizar.</p>
      )}

      {porSemana.map((g) => (
        <Fragment key={`${g.semana}-${g.lista[0].id}`}>
          <p className="section-title">Semana {g.semana}</p>
          <div className="card" style={{ padding: '4px 16px' }}>
            {g.lista.map((s) => {
              const dia = getDia(s.diaId)
              const qtd = Object.keys(s.itens || {}).length
              return (
                <Link key={s.id} to={`/sessao/${s.id}`} className="list-row">
                  <div className="info">
                    <div className="nome">{dia?.nome} · {dia?.titulo}</div>
                    <div className="sub">
                      {dataLonga(s.data)} · {qtd} exercício{qtd === 1 ? '' : 's'}
                      {s.fim && s.inicio ? ` · ${duracao(s.inicio, s.fim)}` : ''}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </Link>
              )
            })}
          </div>
        </Fragment>
      ))}
    </main>
  )
}
