import { ILUSTRACAO_VIEWBOX, ILUSTRACOES } from '../data/ilustracoes'

// SVG gerado a partir do PDF do programa — conteúdo estático, sem entrada do usuário.
export default function Ilustracao({ exId, className = '' }) {
  const svg = ILUSTRACOES[exId]
  if (!svg) return null
  return (
    <svg
      className={`ilustracao ${className}`}
      viewBox={ILUSTRACAO_VIEWBOX}
      role="img"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
