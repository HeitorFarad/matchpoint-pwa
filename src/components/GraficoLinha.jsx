import { useState } from 'react'
import { dataCurta, num } from '../lib/formatar'

// Linha única (um exercício). pontos = [{ data: 'YYYY-MM-DD', valor, rotulo }]
// Toque/hover mostra o valor do ponto mais próximo.
const W = 340
const H = 170
const M = { top: 16, right: 12, bottom: 24, left: 36 }

function escalaY(min, max) {
  if (min === max) return { lo: Math.max(0, min - 5), hi: max + 5 }
  const folga = (max - min) * 0.15
  return { lo: Math.max(0, min - folga), hi: max + folga }
}

function ticks(lo, hi) {
  const passoBruto = (hi - lo) / 3
  const mag = 10 ** Math.floor(Math.log10(passoBruto))
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= passoBruto) || passoBruto
  const lista = []
  for (let v = Math.ceil(lo / passo) * passo; v <= hi; v += passo) lista.push(Math.round(v * 10) / 10)
  return lista
}

export default function GraficoLinha({ pontos, unidade }) {
  const [ativo, setAtivo] = useState(null)
  if (pontos.length < 2) return null

  const valores = pontos.map((p) => p.valor)
  const { lo, hi } = escalaY(Math.min(...valores), Math.max(...valores))
  const iw = W - M.left - M.right
  const ih = H - M.top - M.bottom
  const x = (i) => M.left + (pontos.length === 1 ? iw / 2 : (i / (pontos.length - 1)) * iw)
  const y = (v) => M.top + ih - ((v - lo) / (hi - lo)) * ih
  const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join('')

  const escolher = (e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    let melhor = 0
    pontos.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(melhor) - px)) melhor = i })
    setAtivo(melhor)
  }

  const ultimo = pontos.length - 1
  const marcado = ativo ?? null

  return (
    <div className="grafico">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Evolução de ${num(pontos[0].valor)} para ${num(pontos[ultimo].valor)} ${unidade}`}
        onPointerMove={escolher}
        onPointerDown={escolher}
        onPointerLeave={() => setAtivo(null)}
        style={{ touchAction: 'pan-y' }}
      >
        {ticks(lo, hi).map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="#e6e3dd" strokeWidth="1" />
            <text x={M.left - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#9a968f">{num(t)}</text>
          </g>
        ))}
        <text x={M.left} y={H - 6} fontSize="11" fill="#9a968f">{dataCurta(pontos[0].data)}</text>
        <text x={W - M.right} y={H - 6} fontSize="11" fill="#9a968f" textAnchor="end">{dataCurta(pontos[ultimo].data)}</text>

        {marcado != null && (
          <line x1={x(marcado)} x2={x(marcado)} y1={M.top} y2={M.top + ih} stroke="#9a968f" strokeWidth="1" strokeDasharray="3 3" />
        )}
        <path d={d} fill="none" stroke="#15803d" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pontos.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.valor)}
            r={i === marcado ? 6 : 4}
            fill="#15803d"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {marcado == null && (
          <text x={x(ultimo)} y={y(pontos[ultimo].valor) - 10} textAnchor="end" fontSize="12" fontWeight="600" fill="#1d1f23">
            {num(pontos[ultimo].valor)} {unidade}
          </text>
        )}
      </svg>
      {marcado != null && (
        <div className="tooltip" style={{ left: `${Math.min(80, Math.max(20, (x(marcado) / W) * 100))}%` }}>
          <b>{num(pontos[marcado].valor)} {unidade}</b> · {dataCurta(pontos[marcado].data)}
          {pontos[marcado].rotulo ? ` · ${pontos[marcado].rotulo}` : ''}
        </div>
      )}
    </div>
  )
}
