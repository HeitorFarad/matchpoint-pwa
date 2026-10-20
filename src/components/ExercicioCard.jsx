import { Check, ChevronDown, CirclePlay, Plus } from 'lucide-react'
import { EXERCICIOS } from '../data/programa'
import { alvoReps, textoDescanso, textoPrescricao } from '../lib/progressao'
import { num } from '../lib/formatar'
import Ilustracao from './Ilustracao'

// item = { series: [{ kg, reps, seg, ok }], extra } — valores como texto
// enquanto o treino está aberto.
export function novoItem(p) {
  return { series: Array.from({ length: p.series }, () => ({ kg: '', reps: '', seg: '', ok: false })) }
}

export function itemCompleto(item, p) {
  return !!item && item.series.filter((s) => s.ok).length >= p.series
}

function textoUltimo(ultimo, ex) {
  const feitas = ultimo.series.filter((s) => s.ok)
  const kgs = [...new Set(feitas.map((s) => s.kg).filter((k) => k > 0))]
  const valores = feitas.some((s) => s.reps != null || s.seg != null)
    ? feitas.map((s) => s.reps ?? (s.seg ? `${s.seg}s` : '✓')).join(', ')
    : `${feitas.length} série${feitas.length === 1 ? '' : 's'}`
  const extra = ultimo.extra != null && ex.extra ? ` · ${ex.extra.label.toLowerCase()} ${num(ultimo.extra)} ${ex.extra.unidade}` : ''
  return `${kgs.length ? `${kgs.map(num).join('/')} kg · ` : ''}${valores}${extra}`
}

export default function ExercicioCard({ exId, n, p, item, sugestao, ultimo, onChange, onSerieFeita }) {
  const ex = EXERCICIOS[exId]
  const nome = p.nome || ex.nome
  const alvo = alvoReps(p)
  const completo = itemCompleto(item, p)
  const series = item?.series || novoItem(p).series

  const atualizarSerie = (i, mudanca) => {
    const novas = series.map((s, j) => (j === i ? { ...s, ...mudanca } : s))
    onChange({ ...item, series: novas })
  }

  const placeholderKg = (i) => {
    for (let j = i - 1; j >= 0; j--) if (series[j].kg !== '') return series[j].kg
    return sugestao?.kg != null ? num(sugestao.kg) : ''
  }

  const alternar = (i) => {
    const s = series[i]
    if (s.ok) {
      atualizarSerie(i, { ok: false })
      return
    }
    const mudanca = { ok: true }
    if (p.carga && s.kg === '' && placeholderKg(i) !== '') mudanca.kg = placeholderKg(i)
    if (ex.registro === 'reps' && s.reps === '' && alvo) mudanca.reps = String(alvo)
    if (ex.registro === 'seg' && s.seg === '' && p.seg) mudanca.seg = String(p.seg)
    atualizarSerie(i, mudanca)
    const ultimaSerie = series.every((x, j) => j === i || x.ok)
    if (!ultimaSerie) onSerieFeita(ex.descanso)
  }

  const segundaColuna = ex.registro === 'reps' ? 'reps' : ex.registro === 'seg' ? 'seg' : ''
  const alvoTexto = p.reps ? `${p.reps}` : p.metros ? `${p.metros} m` : p.seg ? `${p.seg} s` : '✓'

  return (
    <div className={`ex-card${completo ? ' completo' : ''}`}>
      <div className="ex-head">
        <span className="num">{completo ? <Check size={15} /> : n}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ex-nome">{nome}</p>
          <span className="chip">
            {textoPrescricao(p)}{ex.descanso ? ` · descanso ${textoDescanso(ex.descanso)}` : ''}
          </span>
          {p.texto && <p className="ex-texto">{p.texto[0].toUpperCase() + p.texto.slice(1)}</p>}
        </div>
      </div>

      <Ilustracao exId={exId} />

      {sugestao && (
        <div className={`sugestao${sugestao.subir ? ' subir' : ''}`}>
          {sugestao.texto}
          {ultimo && <div className="muted" style={{ marginTop: 4 }}>Última vez: {textoUltimo(ultimo, ex)}</div>}
        </div>
      )}
      {!sugestao && ultimo && (
        <div className="sugestao">Última vez: {textoUltimo(ultimo, ex)}</div>
      )}

      <div className="series">
        <div className="serie-head">
          <span style={{ textAlign: 'center' }}>#</span>
          {p.carga && <span style={{ textAlign: 'center' }}>{ex.halter ? 'kg (cada)' : 'kg'}</span>}
          <span style={{ textAlign: 'center', gridColumn: p.carga ? undefined : 'span 2' }}>
            {segundaColuna || 'meta'}{p.porLado ? ` / ${p.porLado}` : ''}
          </span>
          <span />
        </div>
        {series.map((s, i) => (
          <div key={i} className={`serie${s.ok ? ' ok' : ''}`}>
            <span className="idx">{i + 1}</span>
            {p.carga && (
              <input
                inputMode="decimal"
                aria-label={`Carga série ${i + 1}`}
                placeholder={placeholderKg(i)}
                value={s.kg}
                onChange={(e) => atualizarSerie(i, { kg: e.target.value.replace(/[^\d.,]/g, '') })}
              />
            )}
            {segundaColuna ? (
              <input
                inputMode="numeric"
                aria-label={`${segundaColuna} série ${i + 1}`}
                placeholder={segundaColuna === 'reps' ? (p.min ? `${p.min}–${p.max}` : String(alvo ?? '')) : String(p.seg ?? '')}
                value={s[segundaColuna]}
                style={{ gridColumn: p.carga ? undefined : 'span 2' }}
                onChange={(e) => atualizarSerie(i, { [segundaColuna]: e.target.value.replace(/\D/g, '') })}
              />
            ) : (
              <span className="vazio" style={{ gridColumn: p.carga ? undefined : 'span 2' }}>{alvoTexto}</span>
            )}
            <button className={`check-btn${s.ok ? ' on' : ''}`} onClick={() => alternar(i)} aria-label={`Série ${i + 1} feita`} aria-pressed={s.ok}>
              <Check size={22} />
            </button>
          </div>
        ))}
        <button
          className="btn-link"
          style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 13 }}
          onClick={() => onChange({ ...item, series: [...series, { kg: '', reps: '', seg: '', ok: false }] })}
        >
          <Plus size={14} /> série
        </button>
      </div>

      {ex.extra && (
        <label className="extra">
          {ex.extra.label}
          <input
            inputMode="decimal"
            value={item?.extra ?? ''}
            placeholder={ex.extra.unidade}
            onChange={(e) => onChange({ ...item, series, extra: e.target.value.replace(/[^\d.,]/g, '') })}
          />
          {ex.extra.unidade}
        </label>
      )}

      <details className="detalhes">
        <summary><ChevronDown size={16} /> Como fazer</summary>
        {ex.musculo && (
          <p className="muted small musculo" style={{ margin: '10px 0 0' }}>
            <span className="musculo-marca" />Músculo: {ex.musculo}
          </p>
        )}
        <ul className="dicas">
          {ex.dicas.map((d) => <li key={d}><Check size={15} />{d}</li>)}
        </ul>
        {ex.obs && <div className="aviso amber" style={{ marginBottom: 10 }}>{ex.obs}</div>}
        {ex.video && (
          <a className="btn-link" href={ex.video} target="_blank" rel="noreferrer">
            <CirclePlay size={16} /> Ver vídeos do exercício
          </a>
        )}
      </details>
    </div>
  )
}
