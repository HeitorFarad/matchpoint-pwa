import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, MapPin, Minus, Plus, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'
import { friends } from '../data/mock'
import { useAuth } from '../contexts/AuthContext'
import { criarTreino } from '../services/firestore'

const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const diasSemanaCompletos = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CriarTreino() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [nome, setNome] = useState('')
  const [local, setLocal] = useState('')
  const [diasAtivos, setDiasAtivos] = useState([])
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [vagas, setVagas] = useState(0)
  const [lembreteOn, setLembreteOn] = useState(false)
  const [lembreteValor, setLembreteValor] = useState('')
  const [lembreteUnidade, setLembreteUnidade] = useState('horas')
  const [busca, setBusca] = useState('')
  const [participantes, setParticipantes] = useState([])
  const [salvando, setSalvando] = useState(false)

  function toggleDia(i) {
    setDiasAtivos((list) =>
      list.includes(i) ? list.filter((d) => d !== i) : [...list, i],
    )
  }

  function addParticipante(f) {
    if (!participantes.some((p) => p.id === f.id)) {
      setParticipantes((list) => [...list, f])
    }
    setBusca('')
  }

  const sugestoes = busca
    ? friends.filter(
        (f) =>
          f.name.toLowerCase().includes(busca.toLowerCase()) &&
          !participantes.some((p) => p.id === f.id),
      )
    : []

  async function handleSubmit(e) {
    e.preventDefault()
    if (salvando) return
    setSalvando(true)
    try {
      await criarTreino(
        {
          nome,
          local,
          dias: diasAtivos.map((i) => diasSemanaCompletos[i]),
          inicio,
          fim,
          vagas,
          lembrete: lembreteOn
            ? { valor: Number(lembreteValor) || 0, unidade: lembreteUnidade }
            : null,
          participantesFixos: participantes.map((p) => ({ id: p.id, name: p.name })),
        },
        user,
      )
      navigate('/')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <PageHeader title="Novo treino fixo" />
      <form className="app-content" style={{ paddingTop: 4 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Nome do treino</label>
          <div className="input-wrap">
            <Trophy size={18} />
            <input
              placeholder="Ex: Treino da Praça"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Local</label>
          <div className="input-wrap">
            <MapPin size={18} />
            <input
              placeholder="Onde acontece o treino?"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Dias da semana</label>
          <div className="day-circles">
            {diasSemana.map((d, i) => (
              <button
                type="button"
                key={i}
                className={`day-circle${diasAtivos.includes(i) ? ' active' : ''}`}
                onClick={() => toggleDia(i)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Início</label>
            <div className="input-wrap">
              <input type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Fim</label>
            <div className="input-wrap">
              <input type="time" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="field">
          <label>Limite de vagas</label>
          <div className="stepper">
            <button type="button" onClick={() => setVagas((v) => Math.max(0, v - 1))}>
              <Minus size={18} />
            </button>
            <span>{vagas}</span>
            <button type="button" className="plus" onClick={() => setVagas((v) => v + 1)}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="field">
          <div className="row-between" style={{ marginBottom: lembreteOn ? 10 : 0 }}>
            <label style={{ margin: 0 }}>Lembrete</label>
            <button
              type="button"
              className={`toggle${lembreteOn ? ' on' : ''}`}
              onClick={() => setLembreteOn((v) => !v)}
              aria-label="Ativar lembrete"
            />
          </div>

          {lembreteOn && (
            <>
              <div className="row" style={{ gap: 8 }}>
                <div className="input-wrap" style={{ maxWidth: 70 }}>
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={lembreteValor}
                    onChange={(e) =>
                      setLembreteValor(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </div>
                <div className="unit-toggle">
                  <button
                    type="button"
                    className={`unit-chip${lembreteUnidade === 'horas' ? ' active' : ''}`}
                    onClick={() => setLembreteUnidade('horas')}
                  >
                    horas
                  </button>
                  <button
                    type="button"
                    className={`unit-chip${lembreteUnidade === 'dias' ? ' active' : ''}`}
                    onClick={() => setLembreteUnidade('dias')}
                  >
                    dias
                  </button>
                </div>
                <span className="muted" style={{ fontSize: 14 }}>antes</span>
              </div>
              {lembreteValor !== '' && (
                <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Os participantes fixos receberão uma notificação {lembreteValor}{' '}
                  {lembreteUnidade} antes do treino.
                </p>
              )}
            </>
          )}
        </div>

        <div className="field" style={{ position: 'relative' }}>
          <label>Participantes fixos</label>
          <div className="input-wrap">
            <Search size={18} />
            <input
              placeholder="Buscar amigos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          {sugestoes.length > 0 && (
            <div className="card" style={{ marginTop: 6, padding: 6 }}>
              {sugestoes.map((f) => (
                <div
                  key={f.id}
                  className="list-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => addParticipante(f)}
                >
                  <Avatar name={f.name} size={32} />
                  <div className="info">
                    <p className="name">{f.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {participantes.length > 0 && (
            <div className="row" style={{ marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
              {participantes.map((p) => (
                <div key={p.id} style={{ textAlign: 'center' }}>
                  <Avatar name={p.name} size={36} />
                  <p className="muted" style={{ fontSize: 11, margin: '4px 0 0', maxWidth: 50 }}>
                    {p.name.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={salvando}>
          {salvando ? 'Criando...' : 'Criar treino fixo 📅'}
        </button>
      </form>
    </div>
  )
}
