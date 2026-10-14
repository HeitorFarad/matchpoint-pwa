import { EXERCICIOS, SEMANAS_LEVES, TOTAL_SEMANAS } from '../data/programa'

const DIA_MS = 24 * 60 * 60 * 1000

// Datas são guardadas como 'YYYY-MM-DD' no fuso local.
export function hojeISO(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function segundaDaSemana(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = (d.getDay() + 6) % 7 // segunda = 0
  d.setDate(d.getDate() - dow)
  return d
}

// Semana do programa (1 a 12). Antes do início → 0; depois do fim → 13+.
export function semanaDoPrograma(inicioISO, data = new Date()) {
  if (!inicioISO) return null
  const inicio = segundaDaSemana(parseISO(inicioISO))
  const atual = segundaDaSemana(data)
  const dias = Math.round((atual - inicio) / DIA_MS)
  if (dias < 0) return 0
  return Math.floor(dias / 7) + 1
}

// Data de início que faz `semana` ser a semana atual.
export function inicioParaSemana(semana, data = new Date()) {
  const seg = segundaDaSemana(data)
  seg.setDate(seg.getDate() - (semana - 1) * 7)
  return hojeISO(seg)
}

export function faseDaSemana(semana) {
  if (semana <= 4) return 1
  if (semana <= 8) return 2
  return 3
}

export function ehSemanaLeve(semana) {
  return SEMANAS_LEVES.includes(semana)
}

export function semanaValida(semana) {
  return Math.min(Math.max(semana || 1, 1), TOTAL_SEMANAS)
}

// Prescrição de um exercício numa semana, já com a semana leve aplicada:
// metade das séries; nos explosivos, metade dos saltos também.
export function prescricao(exId, semana) {
  const ex = EXERCICIOS[exId]
  const s = semanaValida(semana)
  const base = ex.semanas?.[s] ?? ex.fases[faseDaSemana(s) - 1]
  const p = { ...base }
  if (ehSemanaLeve(s) && p.series > 1) {
    p.series = Math.ceil(p.series / 2)
    if (ex.explosivo && p.reps >= 10) p.reps = Math.round(p.reps / 2)
    p.leve = true
  }
  return p
}

export function textoPrescricao(p) {
  const lado = p.porLado ? ` por ${p.porLado}` : ''
  let volume
  if (p.min) volume = `${p.series} × ${p.min}–${p.max}`
  else if (p.reps) volume = `${p.series} × ${p.reps}`
  else if (p.seg) volume = `${p.series} × ${p.seg} s`
  else if (p.metros) volume = `${p.series} × ${p.metros} m`
  else return p.texto || ''
  return volume + lado
}

export function textoDescanso(seg) {
  if (!seg) return ''
  if (seg < 60) return `${seg} s`
  if (seg % 60 === 0) return `${seg / 60} min`
  return `${Math.floor(seg / 60)} min ${seg % 60} s`
}

export function alvoReps(p) {
  return p.max ?? p.reps ?? null
}

// Último registro do exercício (com pelo menos uma série feita) em sessões
// ordenadas da mais recente para a mais antiga.
export function ultimoRegistro(exId, sessoes, ignorarId) {
  for (const s of sessoes) {
    if (s.id === ignorarId) continue
    const item = s.itens?.[exId]
    if (item?.series?.some((x) => x.ok)) return { ...item, data: s.data, semana: s.semana }
  }
  return null
}

export function cargaDoRegistro(item) {
  const cargas = (item?.series || []).filter((x) => x.ok && x.kg > 0).map((x) => Number(x.kg))
  return cargas.length ? Math.max(...cargas) : null
}

const arred = (n) => Math.round(n * 10) / 10

// Sugestão de carga para hoje, seguindo as regras do PDF de progressão.
// Retorna { kg, texto, subir }.
export function sugestao(exId, semana, sessoes, ignorarId) {
  const ex = EXERCICIOS[exId]
  const p = prescricao(exId, semana)
  if (!p.carga) return null

  const ultimo = ultimoRegistro(exId, sessoes, ignorarId)
  const kg = cargaDoRegistro(ultimo)
  if (!ultimo || kg == null) {
    const folga = faseDaSemana(semana) === 3 ? '1 repetição' : '2–3 repetições'
    return { kg: null, texto: `Primeira vez: escolha uma carga em que sobrem ${folga}.` }
  }

  if (p.leve) return { kg, texto: `Semana leve: mesma carga (${kg} kg), metade das séries.` }

  const inc = ex.incremento || 2
  const proximo = ex.halter ? `o próximo halter (~${arred(kg + inc)} kg)` : `${arred(kg + inc)} kg`
  const feitas = (ultimo.series || []).filter((x) => x.ok)
  const reps = feitas.map((x) => Number(x.reps) || 0)
  const alvoAnterior = ultimo.alvo || p
  const completouSeries = feitas.length >= (alvoAnterior.series || p.series)

  if (ex.tipo === 'faixa') {
    const topo = alvoAnterior.max ?? p.max
    if (completouSeries && reps.every((r) => r >= topo)) {
      return { kg: arred(kg + inc), subir: true, texto: `Bateu ${topo} em todas: sobe para ${proximo} e volta a buscar ${p.min}.` }
    }
    const fase3 = faseDaSemana(semana) === 3 ? ' Na fase 3, deixe só 1 repetição sobrando.' : ''
    return { kg, texto: `Mantém ${kg} kg e tenta somar repetições (última: ${reps.join(', ')}).${fase3}` }
  }

  if (ex.tipo === 'fixa') {
    const alvo = alvoAnterior.reps ?? p.reps
    if (completouSeries && reps.every((r) => r >= alvo)) {
      const regra = ex.regra ? ` (${ex.regra.split(': ')[1]})` : ''
      return { kg: arred(kg + inc), subir: true, texto: `Completou tudo: se sobraram 1–2 repetições, sobe para ${proximo}${regra}.` }
    }
    return { kg, texto: `Não completou da última vez: repete ${kg} kg até completar.` }
  }

  return { kg, texto: `Última carga: ${kg} kg.` }
}
