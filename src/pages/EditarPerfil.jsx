import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { User, AtSign, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../firebase'

const niveis = ['Iniciante', 'Intermediário', 'Avançado']

export default function EditarPerfil() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [nome, setNome] = useState(user.displayName || '')
  const [username, setUsername] = useState(user.email ? user.email.split('@')[0] : '')
  const [cidade, setCidade] = useState('')
  const [nivel, setNivel] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (salvando) return
    setSalvando(true)
    try {
      await updateProfile(auth.currentUser, { displayName: nome })
      navigate('/perfil')
    } finally {
      setSalvando(false)
    }
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

        <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
