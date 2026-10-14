import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useDados } from '../contexts/DadosContext'
import { ABERTURA, EXERCICIOS, getDia } from '../data/programa'
import { textoPrescricao } from '../lib/progressao'
import { dataLonga, duracao, num } from '../lib/formatar'
import PageHeader from '../components/PageHeader'
import Confirmar from '../components/Confirmar'

function resumoSeries(item) {
  const series = item.series || []
  if (!series.length) return null
  const valor = (s) => (s.reps != null ? `${s.reps}` : s.seg != null ? `${s.seg} s` : '✓')
  const kgs = [...new Set(series.map((s) => s.kg ?? null))]
  // Mesma carga em todas as séries: "130 kg · 5, 5, 5, 5"
  if (kgs.length === 1) {
    const reps = series.map(valor)
    const texto = reps.every((r) => r === '✓') ? `${series.length} série${series.length === 1 ? '' : 's'}` : reps.join(', ')
    return kgs[0] ? `${num(kgs[0])} kg · ${texto}` : texto
  }
  return series.map((s) => (s.kg ? `${num(s.kg)} kg × ${valor(s)}` : valor(s))).join('  ·  ')
}

export default function SessaoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessoes, carregado, excluirSessao } = useDados()
  const [confirmar, setConfirmar] = useState(false)
  const sessao = sessoes.find((s) => s.id === id)

  if (!carregado) return <main className="app-content"><p className="empty-state">Carregando…</p></main>
  if (!sessao) {
    return (
      <>
        <PageHeader title="Treino" />
        <main className="app-content com-header"><p className="empty-state">Treino não encontrado.</p></main>
      </>
    )
  }

  const dia = getDia(sessao.diaId)
  const ordem = [...ABERTURA, ...dia.blocos.flatMap((b) => b.itens)]
  const itens = ordem.filter((exId) => sessao.itens?.[exId])
  const qtd = itens.filter((x) => !ABERTURA.includes(x)).length
  const aberturaFeita =ABERTURA.filter((exId) => sessao.itens?.[exId]?.series?.length).length

  return (
    <>
      <PageHeader
        title={dia.nome}
        right={(
          <>
            <button className="back-btn" aria-label="Editar" onClick={() => navigate(`/dia/${sessao.diaId}?sessao=${sessao.id}`)}>
              <Pencil size={20} />
            </button>
            <button className="back-btn" aria-label="Excluir" onClick={() => setConfirmar(true)}>
              <Trash2 size={20} />
            </button>
          </>
        )}
      />
      <main className="app-content com-header">
        <div className="hero">
          <p className="eyebrow">Semana {sessao.semana} · {dataLonga(sessao.data)}</p>
          <h1>{dia.titulo}</h1>
          <p>
            {qtd} exercício{qtd === 1 ? '' : 's'}
            {sessao.inicio && sessao.fim ? ` · ${duracao(sessao.inicio, sessao.fim)}` : ''}
            {` · abertura ${aberturaFeita}/${ABERTURA.length}`}
          </p>
        </div>

        <div className="card" style={{ padding: '4px 16px' }}>
          {itens.filter((x) => !ABERTURA.includes(x) || sessao.itens[x].extra != null).map((exId) => {
            const ex = EXERCICIOS[exId]
            const item = sessao.itens[exId]
            const resumo = ABERTURA.includes(exId) ? null : resumoSeries(item)
            return (
              <div key={exId} className="list-row" style={{ alignItems: 'flex-start' }}>
                <div className="info">
                  <div className="nome">{item.alvo?.nome || ex.nome}</div>
                  {item.alvo && !ABERTURA.includes(exId) && <div className="sub">Meta: {textoPrescricao(item.alvo)}</div>}
                  {resumo && <div style={{ fontSize: 14, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{resumo}</div>}
                  {item.extra != null && <div className="sub">{ex.extra.label}: {num(item.extra)} {ex.extra.unidade}</div>}
                </div>
              </div>
            )
          })}
          {!itens.length && <p className="empty-state">Nada anotado neste treino.</p>}
        </div>
      </main>

      <Confirmar
        open={confirmar}
        texto="Excluir este treino do histórico?"
        confirmar="Excluir"
        perigo
        onConfirmar={() => { excluirSessao(sessao.id); navigate('/historico', { replace: true }) }}
        onCancelar={() => setConfirmar(false)}
      />
    </>
  )
}
