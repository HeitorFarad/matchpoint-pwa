// Treino em andamento fica no aparelho (localStorage) até ser finalizado,
// para não perder nada se o app fechar no meio do treino.

const chave = (uid) => `treino:rascunho:${uid}`

export function lerRascunho(uid) {
  try {
    const bruto = localStorage.getItem(chave(uid))
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function salvarRascunho(uid, rascunho) {
  try {
    localStorage.setItem(chave(uid), JSON.stringify(rascunho))
  } catch {
    // sem espaço ou bloqueado: segue só em memória
  }
}

export function apagarRascunho(uid) {
  try {
    localStorage.removeItem(chave(uid))
  } catch {
    // ignora
  }
}

export function rascunhoTemDados(r) {
  return !!r && Object.values(r.itens || {}).some((i) => i.series?.some((s) => s.ok) || i.extra != null)
}
