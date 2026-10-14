import { useDados } from '../contexts/DadosContext'
import { ehSemanaLeve, faseDaSemana, semanaDoPrograma, semanaValida } from './progressao'
import { TOTAL_SEMANAS } from '../data/programa'

// Semana atual do programa. `semana` é a usada para montar os treinos (1–12);
// `bruta` pode ser 0 (ainda não começou) ou > 12 (programa concluído).
export function useSemana() {
  const { perfil } = useDados()
  const inicio = perfil?.programaInicio
  const bruta = semanaDoPrograma(inicio)
  const semana = semanaValida(bruta)
  return {
    configurado: !!inicio,
    inicio,
    bruta,
    semana,
    fase: faseDaSemana(semana),
    leve: ehSemanaLeve(semana),
    concluido: bruta > TOTAL_SEMANAS,
  }
}
