import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Check, ChevronDown, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDados } from '../contexts/DadosContext'
import { ABERTURA, EXERCICIOS, FASES, getDia } from '../data/programa'
import { faseDaSemana, hojeISO, prescricao, sugestao, ultimoRegistro } from '../lib/progressao'
import { useSemana } from '../lib/useSemana'
import { apagarRascunho, lerRascunho, rascunhoTemDados, salvarRascunho } from '../lib/rascunho'
import { lerNumero, num } from '../lib/formatar'
import PageHeader from '../components/PageHeader'
import ExercicioCard, { itemCompleto } from '../components/ExercicioCard'
import Ilustracao from '../components/Ilustracao'
import TimerDescanso from '../components/TimerDescanso'
import Confirmar from '../components/Confirmar'

// Sessão salva → formato editável (valores como texto).
function paraEdicao(sessao) {
  const itens = {}
  for (const [exId, item] of Object.entries(sessao.itens || {})) {
    itens[exId] = {
      extra: item.extra != null ? num(item.extra) : undefined,
      series: (item.series || []).map((s) => ({ kg: num(s.kg), reps: num(s.reps), seg: num(s.seg), ok: !!s.ok })),
    }
  }
  return { diaId: sessao.diaId, semana: sessao.semana, data: sessao.data, inicio: sessao.inicio, fim: sessao.fim, sessaoId: sessao.id, itens }
}

// Formato editável → documento salvo (só séries feitas, números de verdade).
function paraSalvar(rascunho) {
  const itens = {}
  for (const [exId, item] of Object.entries(rascunho.itens)) {
    const series = (item.series || []).filter((s) => s.ok).map((s) => ({
      ok: true, kg: lerNumero(s.kg) ?? undefined, reps: lerNumero(s.reps) ?? undefined, seg: lerNumero(s.seg) ?? undefined,
    }))
    const extra = lerNumero(item.extra)
    if (!series.length && extra == null) continue
    itens[exId] = { series, extra: extra ?? undefined, alvo: prescricao(exId, rascunho.semana) }
  }
  return itens
}

function useTelaLigada() {
  useEffect(() => {
    let lock = null
    const pedir = () => {
      if (document.visibilityState !== 'visible') return
      navigator.wakeLock?.request('screen').then((l) => { lock = l }).catch(() => {})
    }
    pedir()
    document.addEventListener('visibilitychange', pedir)
    return () => {
      document.removeEventListener('visibilitychange', pedir)
      lock?.release().catch(() => {})
    }
  }, [])
}

function Abertura({ semana, itens, onChange }) {
  const feitos = ABERTURA.filter((id) => itens[id]?.series?.[0]?.ok).length
  const joelho = itens['joelho-parede']

  const alternar = (id) => {
    const atual = itens[id]
    const ok = !atual?.series?.[0]?.ok
    onChange(id, { ...atual, series: [{ kg: '', reps: '', seg: '', ok }] })
  }

  return (
    <details className="card" open={feitos < ABERTURA.length}>
      <summary className="row-between" style={{ listStyle: 'none', cursor: 'pointer' }}>
        <div>
          <p className="card-title">Abertura: cardio + mobilidade</p>
          <span className="muted small">~10 min · {feitos} de {ABERTURA.length} feitos</span>
        </div>
        <ChevronDown size={20} color="var(--text-muted)" />
      </summary>
      <div style={{ marginTop: 8 }}>
        {ABERTURA.map((id) => {
          const ex = EXERCICIOS[id]
          const ok = !!itens[id]?.series?.[0]?.ok
          return (
            <Fragment key={id}>
              <button className="check-row" onClick={() => alternar(id)} aria-pressed={ok}>
                <span className={`bolinha${ok ? ' on' : ''}`}>{ok && <Check size={15} />}</span>
                <span className="info">
                  <span className="nome" style={{ display: 'block' }}>{ex.nome}</span>
                  <span className="sub">{prescricao(id, semana).texto}</span>
                </span>
                <Ilustracao exId={id} className="mini" />
              </button>
              {id === 'joelho-parede' && (
                <label className="extra" style={{ margin: '0 0 10px 38px' }}>
                  Pé a
                  <input
                    inputMode="decimal"
                    placeholder="cm"
                    value={joelho?.extra ?? ''}
                    onChange={(e) => onChange(id, { series: [], ...joelho, extra: e.target.value.replace(/[^\d.,]/g, '') })}
                  />
                  cm da parede
                </label>
              )}
            </Fragment>
          )
        })}
        <p className="muted small" style={{ margin: '6px 0 0' }}>
          Meta: tocar a parede com o pé a mais de 10 cm dela e ficar de cócoras sem apoio, calcanhar no chão.
        </p>
      </div>
    </details>
  )
}

function TreinoConteudo({ dia, sessaoEditada }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { sessoes, salvarSessao } = useDados()
  const { semana: semanaAtual } = useSemana()
  const editando = !!sessaoEditada

  const [rascunho, setRascunho] = useState(() => {
    if (sessaoEditada) return paraEdicao(sessaoEditada)
    const salvo = lerRascunho(user.uid)
    if (salvo?.diaId === dia.id) return salvo
    return { diaId: dia.id, semana: semanaAtual, data: hojeISO(), inicio: null, itens: {} }
  })
  const [timer, setTimer] = useState(null)
  const [confirmar, setConfirmar] = useState(null)
  const audio = useRef(null)

  const outroEmAndamento = (() => {
    if (editando) return null
    const salvo = lerRascunho(user.uid)
    return salvo && salvo.diaId !== dia.id && rascunhoTemDados(salvo) ? salvo : null
  })()

  useTelaLigada()

  useEffect(() => {
    if (editando) return
    if (rascunhoTemDados(rascunho)) salvarRascunho(user.uid, rascunho)
    else if (lerRascunho(user.uid)?.diaId === rascunho.diaId) apagarRascunho(user.uid)
  }, [rascunho, editando, user.uid])

  const semana = rascunho.semana
  const fase = faseDaSemana(semana)
  const p = (id) => prescricao(id, semana)

  const mudarItem = (exId, item) => {
    setRascunho((r) => ({ ...r, inicio: r.inicio || Date.now(), itens: { ...r.itens, [exId]: item } }))
  }

  const iniciarDescanso = (segundos) => {
    if (!segundos) return
    if (!audio.current) {
      try {
        audio.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch {
        audio.current = null
      }
    }
    audio.current?.resume?.()
    setTimer({ fim: Date.now() + segundos * 1000, total: segundos })
  }

  const exerciciosDoDia = dia.blocos.flatMap((b) => b.itens)
  const feitos = exerciciosDoDia.filter((id) => itemCompleto(rascunho.itens[id], p(id))).length
  const temDados = rascunhoTemDados(rascunho)

  const finalizar = () => {
    const id = salvarSessao({
      id: rascunho.sessaoId,
      data: rascunho.data,
      diaId: dia.id,
      semana,
      fase,
      inicio: rascunho.inicio || Date.now(),
      fim: rascunho.fim || Date.now(),
      itens: paraSalvar(rascunho),
    })
    if (!editando) apagarRascunho(user.uid)
    navigate(`/sessao/${id}`, { replace: true })
  }

  const descartar = () => {
    if (!editando) apagarRascunho(user.uid)
    navigate(editando ? -1 : '/', { replace: !editando })
  }

  const numero = Object.fromEntries(exerciciosDoDia.map((id, i) => [id, i + 1]))

  return (
    <>
      <PageHeader
        title={editando ? 'Editar treino' : dia.nome}
        right={temDados && (
          <button className="back-btn" aria-label="Descartar treino" onClick={() => setConfirmar('descartar')}>
            <Trash2 size={20} />
          </button>
        )}
      />
      <main className="app-content com-header" style={{ paddingBottom: 'calc(170px + env(safe-area-inset-bottom))' }}>
        <div className="hero">
          <p className="eyebrow">{dia.nome} · Semana {semana} · {p(exerciciosDoDia[0]).leve ? 'Semana leve' : FASES[fase - 1].nome}</p>
          <h1>{dia.titulo}</h1>
          <p>{dia.resumo}</p>
        </div>

        {outroEmAndamento && (
          <div className="aviso amber" style={{ marginBottom: 12 }}>
            Você tem um treino de <b>{getDia(outroEmAndamento.diaId).nome.toLowerCase()}</b> em andamento.{' '}
            <Link to={`/dia/${outroEmAndamento.diaId}`}><b>Voltar para ele</b></Link>. Se começar este, aquele é descartado.
          </div>
        )}
        {p(exerciciosDoDia[0]).leve && (
          <div className="aviso neutro" style={{ marginBottom: 12 }}>
            <b>Semana leve:</b> mesma carga, metade das séries e metade dos saltos. As séries abaixo já estão ajustadas.
          </div>
        )}
        {(dia.id === 'segunda' || dia.id === 'sexta') && (
          <div className="aviso amber" style={{ marginBottom: 12 }}>
            Jogo puxado amanhã? Evite {dia.id === 'sexta' ? 'o Nórdico e os saltos' : 'os saltos'} hoje.
          </div>
        )}

        <Abertura semana={semana} itens={rascunho.itens} onChange={mudarItem} />

        {dia.blocos.map((bloco) => (
          <Fragment key={bloco.titulo}>
            <p className="section-title">{bloco.titulo}</p>
            {bloco.itens.map((exId) => (
                <ExercicioCard
                  key={exId}
                  exId={exId}
                  n={numero[exId]}
                  p={p(exId)}
                  item={rascunho.itens[exId]}
                  sugestao={sugestao(exId, semana, sessoes, rascunho.sessaoId)}
                  ultimo={ultimoRegistro(exId, sessoes, rascunho.sessaoId)}
                  onChange={(item) => mudarItem(exId, item)}
                  onSerieFeita={iniciarDescanso}
                />
            ))}
          </Fragment>
        ))}
      </main>

      <div className="barra-inferior">
        <TimerDescanso
          timer={timer}
          audio={audio}
          onAjustar={(d) => setTimer((t) => t && { ...t, fim: Math.max(Date.now(), t.fim + d * 1000), total: Math.max(1, t.total + d) })}
          onFechar={() => setTimer(null)}
        />
        <button className="btn-primary" disabled={!temDados} onClick={() => setConfirmar('finalizar')}>
          <Check size={18} /> {editando ? 'Salvar alterações' : `Finalizar treino · ${feitos}/${exerciciosDoDia.length}`}
        </button>
      </div>

      <Confirmar
        open={confirmar === 'finalizar'}
        texto={feitos < exerciciosDoDia.length
          ? `Você completou ${feitos} de ${exerciciosDoDia.length} exercícios. Salvar mesmo assim?`
          : 'Salvar o treino?'}
        confirmar="Salvar"
        onConfirmar={finalizar}
        onCancelar={() => setConfirmar(null)}
      />
      <Confirmar
        open={confirmar === 'descartar'}
        texto={editando ? 'Descartar as alterações?' : 'Descartar este treino? O que você anotou será perdido.'}
        confirmar="Descartar"
        perigo
        onConfirmar={descartar}
        onCancelar={() => setConfirmar(null)}
      />
    </>
  )
}

export default function Treino() {
  const { diaId } = useParams()
  const [params] = useSearchParams()
  const { sessoes, carregado } = useDados()
  const dia = getDia(diaId)
  const editId = params.get('sessao')

  if (!dia) return <main className="app-content"><p className="empty-state">Treino não encontrado.</p></main>
  if (!carregado) return <main className="app-content"><p className="empty-state">Carregando…</p></main>

  const sessaoEditada = editId ? sessoes.find((s) => s.id === editId) : null
  if (editId && !sessaoEditada) return <main className="app-content"><p className="empty-state">Treino não encontrado.</p></main>

  return <TreinoConteudo key={`${diaId}:${editId || ''}`} dia={dia} sessaoEditada={sessaoEditada} />
}
