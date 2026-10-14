import { SEMANAS_LEVES, TOTAL_SEMANAS } from '../data/programa'
import { faseDaSemana } from '../lib/progressao'

export default function Calendario({ atual }) {
  return (
    <div className="semanas" aria-label={`Semana ${atual} de ${TOTAL_SEMANAS}`}>
      {Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1).map((n) => {
        const leve = SEMANAS_LEVES.includes(n)
        const cls = [
          'semana',
          leve ? 'leve' : `f${faseDaSemana(n)}`,
          n === atual && 'atual',
          n < atual && 'passada',
        ].filter(Boolean).join(' ')
        return (
          <div key={n} className={cls}>
            {n}
            <small>{n < atual ? '✓' : leve ? 'leve' : ''}</small>
          </div>
        )
      })}
    </div>
  )
}
