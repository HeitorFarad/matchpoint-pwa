export function formatarData(data) {
  if (!data) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(data)
  if (!match) return data
  const [, ano, mes, dia] = match
  return `${dia}/${mes}/${ano}`
}
