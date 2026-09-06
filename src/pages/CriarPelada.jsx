import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Minus, Plus, UserPlus } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const niveis = ['Iniciante', 'Intermediário', 'Avançado', 'Aberto']

export default function CriarPelada() {
  const navigate = useNavigate()
  const [local, setLocal] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [limite, setLimite] = useState(0)
  const [nivel, setNivel] = useState('')
  const [convidados, setConvidados] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div>
      <PageHeader title="Nova pelada" />
      <form className="app-content" style={{ paddingTop: 4 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Local</label>
          <div className="input-wrap">
            <MapPin size={18} />
            <input
              placeholder="Onde vai rolar a pelada?"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Data</label>
            <div className="input-wrap">
              <Calendar size={18} />
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Horário</label>
            <div className="input-wrap">
              <Clock size={18} />
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label>Limite de jogadores</label>
          <div className="stepper">
            <button type="button" onClick={() => setLimite((v) => Math.max(0, v - 1))}>
              <Minus size={18} />
            </button>
            <span>{limite}</span>
            <button type="button" className="plus" onClick={() => setLimite((v) => v + 1)}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="field">
          <label>Nível</label>
          <div className="chip-scroll">
            {niveis.map((n) => (
              <button
                type="button"
                key={n}
                className={`chip${nivel === n ? ' active' : ''}`}
                onClick={() => setNivel(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Convidar jogadores</label>
          <div className="input-wrap">
            <UserPlus size={18} />
            <input
              placeholder="Buscar amigos..."
              value={convidados}
              onChange={(e) => setConvidados(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
          Criar pelada 🏐
        </button>
      </form>
    </div>
  )
}
