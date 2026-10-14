import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, CloudOff, Play, Ruler } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDados } from '../contexts/DadosContext'
import { DIAS, FASES, SEMANAS_MEDIDA, TOTAL_SEMANAS, getDia } from '../data/programa'
import { hojeISO, inicioParaSemana, segundaDaSemana } from '../lib/progressao'
import { useSemana } from '../lib/useSemana'
import { lerRascunho, rascunhoTemDados } from '../lib/rascunho'
import Calendario from '../components/Calendario'

function diaDeHoje() {
  const dow = new Date().getDay()
  const hoje = DIAS.find((d) => d.diaSemana === dow)
  if (hoje) return { dia: hoje, hoje: true }
  const proximo = DIAS.find((d) => d.diaSemana > dow) || DIAS[0]
  return { dia: proximo, hoje: false }
}

function Configurar() {
  const { salvarInicio } = useDados()
  const [semana, setSemana] = useState(1)

  return (
    <div className="card">
      <p className="card-title">Em que semana do programa você está?</p>
      <p className="muted small" style={{ margin: '0 0 14px' }}>
        O app usa isso para mostrar as séries certas de cada fase. Dá para mudar depois em Ajustes.
      </p>
      <div className="field">
        <select value={semana} onChange={(e) => setSemana(Number(e.target.value))}>
          {Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n === 1 ? 'Semana 1 (começando agora)' : `Semana ${n}`}</option>
          ))}
        </select>
      </div>
      <button className="btn-primary" onClick={() => salvarInicio(inicioParaSemana(semana))}>
        Começar
      </button>
    </div>
  )
}

export default function Hoje() {
  const { user } = useAuth()
  const { sessoes, medidas, carregado, pendente, erro } = useDados()
  const { configurado, semana, fase, leve, bruta, concluido } = useSemana()
  const rascunho = lerRascunho(user.uid)
  const emAndamento = rascunhoTemDados(rascunho) ? rascunho : null
  const { dia: sugerido, hoje: treinoHoje } = diaDeHoje()

  const inicioSemana = hojeISO(segundaDaSemana())
  const feitosNaSemana = new Set(sessoes.filter((s) => s.data >= inicioSemana).map((s) => s.diaId))
  const faseInfo = FASES[fase - 1]
  const medirAgora = configurado && !concluido && SEMANAS_MEDIDA.includes(semana) && !medidas[semana]

  if (!carregado) return <main className="app-content"><p className="empty-state">Carregando…</p></main>

  return (
    <main className="app-content">
      <div className="hero">
        {configurado ? (
          <>
            <p className="eyebrow">
              {bruta === 0 ? 'Começa na segunda' : concluido ? 'Programa concluído' : `Semana ${semana} de ${TOTAL_SEMANAS}`}
            </p>
            <h1>{leve ? 'Semana leve' : `Fase ${fase} · ${faseInfo.nome}`}</h1>
            <p>{leve ? 'Mesma carga, metade das séries e metade dos saltos.' : faseInfo.texto}</p>
            <Calendario atual={semana} />
          </>
        ) : (
          <>
            <p className="eyebrow">Futevôlei + academia</p>
            <h1>Programa de treino</h1>
            <p>Segunda, quarta e sexta · ~65 min por treino</p>
          </>
        )}
      </div>

      {erro && <div className="aviso red">{erro}</div>}
      {pendente && (
        <div className="aviso neutro row" style={{ marginBottom: 12 }}>
          <CloudOff size={16} /> Treino salvo no aparelho. Sobe para a nuvem quando tiver internet.
        </div>
      )}

      {!configurado && <Configurar />}

      {concluido && (
        <div className="aviso green">
          Você terminou as 12 semanas. Veja sua evolução em <Link to="/progresso"><b>Progresso</b></Link> e
          recomece o ciclo em <Link to="/ajustes"><b>Ajustes</b></Link>.
        </div>
      )}

      {emAndamento && (
        <Link to={`/dia/${emAndamento.diaId}`} className="dia-card destaque" style={{ marginBottom: 12 }}>
          <Play size={22} color="var(--primary-dark)" />
          <div className="info">
            <div className="eyebrow">Treino em andamento</div>
            <div className="nome">{getDia(emAndamento.diaId)?.nome} · {getDia(emAndamento.diaId)?.titulo}</div>
            <div className="sub">Toque para continuar</div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </Link>
      )}

      {medirAgora && (
        <Link to="/progresso#medidas" className="dia-card" style={{ marginBottom: 12 }}>
          <Ruler size={22} color="var(--amber)" />
          <div className="info">
            <div className="eyebrow">Semana de medir</div>
            <div className="nome">Anote as medidas da semana {semana}</div>
            <div className="sub">Salto, joelho na parede e peso</div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </Link>
      )}

      <p className="section-title">{treinoHoje ? 'Treino de hoje' : `Hoje é descanso · próximo: ${sugerido.nome.toLowerCase()}`}</p>
      {DIAS.map((d) => (
        <Link key={d.id} to={`/dia/${d.id}`} className={`dia-card${d.id === sugerido.id ? ' destaque' : ''}`}>
          <div className="info">
            <div className="eyebrow">{d.nome}</div>
            <div className="nome">{d.titulo}</div>
            {feitosNaSemana.has(d.id)
              ? <span className="feito"><Check size={14} /> Feito esta semana</span>
              : <div className="sub">{d.blocos.flatMap((b) => b.itens).length} exercícios + abertura</div>}
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </Link>
      ))}

      {configurado && SEMANAS_MEDIDA.includes(semana) && !medirAgora && !concluido && (
        <p className="muted small" style={{ textAlign: 'center', marginTop: 16 }}>Medidas da semana {semana} anotadas ✓</p>
      )}
    </main>
  )
}
