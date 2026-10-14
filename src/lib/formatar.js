import { parseISO } from './progressao'

const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// '2026-10-13' → '13 out'
export function dataCurta(iso) {
  const d = parseISO(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

// '2026-10-13' → 'terça, 13 out'
export function dataLonga(iso) {
  const d = parseISO(iso)
  return `${DIAS_SEMANA[d.getDay()]}, ${dataCurta(iso)}`
}

export function duracao(inicio, fim) {
  if (!inicio || !fim) return ''
  const min = Math.round((fim - inicio) / 60000)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`
}

export function num(v) {
  if (v === '' || v == null) return ''
  return String(v).replace('.', ',')
}

// Aceita vírgula ou ponto; vazio → null.
export function lerNumero(texto) {
  if (texto === '' || texto == null) return null
  const n = Number(String(texto).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
