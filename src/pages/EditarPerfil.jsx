import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, AtSign, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { currentUser } from '../data/mock'

const niveis = ['Iniciante', 'Intermediário', 'Avançado']

export default function EditarPerfil() {
  const navigate = useNavigate()
  const [nome, setNome] = useState(currentUser.name)
  const [username, setUsername] = useState(currentUser.username)
  const [cidade, setCidade] = useState(currentUser.city)
  const [nivel, setNivel] = useState(currentUser.level)

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/perfil')
  }

  return (
    <div>
      <PageHeader title="Editar perfil" />
      <form className="app-content" style={{ paddingTop: 4 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Nome</label>
          <div className="input-wrap">
            <User size={18} />
            <input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>@usuário</label>
          <div className="input-wrap">
            <AtSign size={18} />
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Cidade</label>
          <div className="input-wrap">
            <MapPin size={18} />
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} />
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

        <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
          Salvar alterações
        </button>
      </form>
    </div>
  )
}
