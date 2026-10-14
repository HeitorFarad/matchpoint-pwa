import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useDados } from '../contexts/DadosContext'
import { DIAS, EXERCICIOS, SEMANAS_MEDIDA } from '../data/programa'
import { cargaDoRegistro, hojeISO } from '../lib/progressao'
import { useSemana } from '../lib/useSemana'
import { dataCurta, lerNumero, num } from '../lib/formatar'
import GraficoLinha from '../components/GraficoLinha'
import Modal from '../components/Modal'

// Exercícios na ordem do programa, sem repetir (elevação lateral aparece 2×).
const ORDEM = [...new Set(DIAS.flatMap((d) => d.blocos.flatMap((b) => b.itens)))]
const COM_CARGA = ORDEM.filter((id) => EXERCICIOS[id].fases.some((f) => f.carga))

const OPCOES = [
  ...COM_CARGA.map((id) => ({ id, nome: EXERCICIOS[id].nome, unidade: 'kg' })),
  { id: 'joelho-parede', nome: 'Joelho na parede', unidade: 'cm', extra: true },
  { id: 'salto-caixa', nome: 'Altura da caixa', unidade: 'cm', extra: true },
]

function pontosDe(opcao, sessoes) {
  const pontos = []
  for (const s of [...sessoes].reverse()) {
    const item = s.itens?.[opcao.id]
    if (!item) continue
    if (opcao.extra) {
      if (item.extra != null) pontos.push({ data: s.data, valor: item.extra, semana: s.semana })
      continue
    }
    const kg = cargaDoRegistro(item)
    if (kg == null) continue
    const reps = item.series.filter((x) => x.ok).map((x) => x.reps ?? (x.seg ? `${x.seg}s` : '✓'))
    pontos.push({ data: s.data, valor: kg, semana: s.semana, rotulo: `${reps.join(', ')}` })
  }
  return pontos
}

function maxNaSemana(sessoes, exId, semana, extra = false) {
  const valores = sessoes
    .filter((s) => s.semana === semana && s.itens?.[exId])
    .map((s) => (extra ? s.itens[exId].extra : cargaDoRegistro(s.itens[exId])))
    .filter((v) => v != null)
  return valores.length ? Math.max(...valores) : null
}

function EditarMedida({ semana, atual, onSalvar, onFechar }) {
  const [salto, setSalto] = useState(num(atual?.salto))
  const [joelho, setJoelho] = useState(num(atual?.joelhoParede))
  const [peso, setPeso] = useState(num(atual?.peso))
  const limpar = (v) => v.replace(/[^\d.,]/g, '')

  return (
    <Modal open onClose={onFechar} title={`Medidas da semana ${semana}`}>
      <div className="field">
        <label>Altura do salto (cm) — marca na parede com a ponta dos dedos</label>
        <input inputMode="decimal" value={salto} onChange={(e) => setSalto(limpar(e.target.value))} />
      </div>
      <div className="field">
        <label>Joelho na parede: distância do pé à parede (cm)</label>
        <input inputMode="decimal" value={joelho} onChange={(e) => setJoelho(limpar(e.target.value))} />
      </div>
      <div className="field">
        <label>Peso corporal (kg)</label>
        <input inputMode="decimal" value={peso} onChange={(e) => setPeso(limpar(e.target.value))} />
      </div>
      <p className="muted small" style={{ margin: '0 0 14px' }}>Leg press e supino entram sozinhos, pela maior carga da semana.</p>
      <button
        className="btn-primary"
        onClick={() => {
          onSalvar({ salto: lerNumero(salto), joelhoParede: lerNumero(joelho), peso: lerNumero(peso), data: hojeISO() })
          onFechar()
        }}
      >
        Salvar
      </button>
    </Modal>
  )
}

export default function Progresso() {
  const { sessoes, medidas, salvarMedida } = useDados()
  const { semana: semanaAtual } = useSemana()
  const location = useLocation()
  const comDados = OPCOES.filter((o) => pontosDe(o, sessoes).length > 0)
  const [escolhido, setEscolhido] = useState(null)
  const [editando, setEditando] = useState(null)

  const opcao = comDados.find((o) => o.id === escolhido) || comDados[0]
  const pontos = opcao ? pontosDe(opcao, sessoes) : []

  useEffect(() => {
    if (location.hash === '#medidas') document.getElementById('medidas')?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  const linhas = [
    { nome: 'Salto (cm)', valor: (n) => medidas[n]?.salto },
    { nome: 'Joelho na parede (cm)', valor: (n) => medidas[n]?.joelhoParede ?? maxNaSemana(sessoes, 'joelho-parede', n, true) },
    { nome: 'Peso corporal (kg)', valor: (n) => medidas[n]?.peso },
    { nome: 'Leg press (kg)', valor: (n) => maxNaSemana(sessoes, 'leg-press', n) },
    { nome: 'Supino (kg, cada)', valor: (n) => maxNaSemana(sessoes, 'supino-halteres', n) },
  ]

  const primeiro = pontos[0]
  const ultimo = pontos[pontos.length - 1]
  const diferenca = primeiro && ultimo ? ultimo.valor - primeiro.valor : 0

  return (
    <main className="app-content">
      <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>Progresso</h1>
      <p className="muted small" style={{ margin: 0 }}>Carga máxima de cada treino</p>

      {!comDados.length ? (
        <p className="empty-state">Quando você registrar treinos com carga, a evolução aparece aqui.</p>
      ) : (
        <>
          <div className="chip-scroll" style={{ marginTop: 16 }}>
            {comDados.map((o) => (
              <button key={o.id} className={`chip-btn${o.id === opcao.id ? ' active' : ''}`} onClick={() => setEscolhido(o.id)}>
                {o.nome}
              </button>
            ))}
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="row-between">
              <p className="card-title" style={{ margin: 0 }}>{opcao.nome}</p>
              {pontos.length > 1 && (
                <span className="small" style={{ fontWeight: 600, color: diferenca > 0 ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
                  {diferenca > 0 ? '+' : ''}{num(Math.round(diferenca * 10) / 10)} {opcao.unidade}
                </span>
              )}
            </div>
            {pontos.length > 1
              ? <GraficoLinha pontos={pontos} unidade={opcao.unidade} />
              : <p className="muted small">Só um registro até agora. O gráfico aparece a partir do segundo.</p>}

            <div className="tabela-wrap" style={{ marginTop: 12 }}>
              <table className="tabela">
                <thead>
                  <tr><th>Data</th><th>Sem.</th><th>{opcao.unidade}</th>{!opcao.extra && <th>Reps</th>}</tr>
                </thead>
                <tbody>
                  {[...pontos].reverse().slice(0, 8).map((p, i) => (
                    <tr key={i}>
                      <td>{dataCurta(p.data)}</td>
                      <td>{p.semana}</td>
                      <td>{num(p.valor)}</td>
                      {!opcao.extra && <td>{p.rotulo}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <p className="section-title" id="medidas">Medidas · semanas 1, 4, 8 e 12</p>
      <div className="card">
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th />
                {SEMANAS_MEDIDA.map((n) => <th key={n} style={n === semanaAtual ? { color: 'var(--primary-dark)' } : undefined}>Sem {n}</th>)}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.nome}>
                  <td style={{ whiteSpace: 'normal' }}>{l.nome}</td>
                  {SEMANAS_MEDIDA.map((n) => {
                    const v = l.valor(n)
                    return <td key={n}>{v != null ? num(v) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6, marginTop: 12 }}>
          {SEMANAS_MEDIDA.map((n) => (
            <button key={n} className="btn-outline" style={{ padding: '10px 4px' }} onClick={() => setEditando(n)}>
              <Pencil size={14} /> Sem {n}
            </button>
          ))}
        </div>
      </div>

      <div className="aviso neutro" style={{ marginTop: 12 }}>
        <b>Quando segurar a progressão:</b> repete a carga, ou antecipa a semana leve, se aparecer dor na articulação
        (dor no músculo é normal), salto piorando dois treinos seguidos, ou semana de sono ruim ou jogos muito puxados.
      </div>

      {editando && (
        <EditarMedida
          semana={editando}
          atual={medidas[editando]}
          onSalvar={(dados) => salvarMedida(editando, dados)}
          onFechar={() => setEditando(null)}
        />
      )}
    </main>
  )
}
