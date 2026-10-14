import { useEffect, useRef, useState } from 'react'
import { Timer, X } from 'lucide-react'

function formatar(seg) {
  const s = Math.max(0, Math.ceil(seg))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function bipar(audio) {
  if (!audio) return
  try {
    const t = audio.currentTime
    for (const atraso of [0, 0.35]) {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.25, t + atraso)
      gain.gain.exponentialRampToValueAtTime(0.001, t + atraso + 0.25)
      osc.connect(gain).connect(audio.destination)
      osc.start(t + atraso)
      osc.stop(t + atraso + 0.26)
    }
  } catch {
    // sem áudio: só vibra
  }
}

// `timer` = { fim: timestamp, total: segundos } ou null; `audio` = ref do AudioContext.
export default function TimerDescanso({ timer, onAjustar, onFechar, audio }) {
  const [agora, setAgora] = useState(() => Date.now())
  const avisado = useRef(null)

  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => setAgora(Date.now()), 250)
    return () => clearInterval(id)
  }, [timer])

  const restante = timer ? (timer.fim - agora) / 1000 : 0
  const acabou = !!timer && restante <= 0

  useEffect(() => {
    if (!acabou || avisado.current === timer.fim) return
    avisado.current = timer.fim
    navigator.vibrate?.([250, 120, 250])
    bipar(audio?.current)
  }, [acabou, timer, audio])

  if (!timer) return null

  const pct = Math.min(100, Math.max(0, (1 - restante / timer.total) * 100))

  return (
    <div className={`timer${acabou ? ' acabou' : ''}`} role="timer">
      <Timer size={22} />
      <div className="tempo">
        <small>{acabou ? 'Descanso acabou' : 'Descanso'}</small>
        {acabou ? 'Próxima série!' : formatar(restante)}
      </div>
      {!acabou && <button onClick={() => onAjustar(-15)}>−15</button>}
      {!acabou && <button onClick={() => onAjustar(15)}>+15</button>}
      <button onClick={onFechar} aria-label="Fechar timer"><X size={16} /></button>
      <div className="progresso" style={{ width: `${pct}%` }} />
    </div>
  )
}
