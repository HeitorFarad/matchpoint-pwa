import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { User, AtSign, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../firebase'
import { atualizarUsuario, buscarUsuarioPorUsername, getUsuario } from '../services/firestore'

const niveis = ['Iniciante', 'Intermediário', 'Avançado']

export default function EditarPerfil() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [nome, setNome] = useState(user.displayName || '')
  const [username, setUsername] = useState('')
  const [cidade, setCidade] = useState('')
  const [nivel, setNivel] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    getUsuario(user.uid).then((res) => {
      if (!ativo || !res) return
      if (res.cidade) setCidade(res.cidade)
      if (res.nivel) setNivel(res.nivel)
      if (res.username) setUsername(res.username)
    })
    return () => {
      ativo = false
    }
  }, [user.uid])

  async function handleSubmit(e) {
    e.preventDefault()
    if (salvando) return
    setErro('')
    setSalvando(true)
    try {
      if (username) {
        const existente = await buscarUsuarioPorUsername(username)
        if (existente && existente.id !== user.uid) {
          setErro('Esse nome de usuário já está em uso.')
          return
        }
      }
      await updateProfile(auth.currentUser, { displayName: nome })
      await atualizarUsuario(user.uid, { cidade, nivel, username })
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
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="seuusuario"
            />
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

        {erro && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{erro}</p>}

        <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
