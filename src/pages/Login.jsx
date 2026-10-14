import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Dumbbell } from 'lucide-react'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isRegistro, setIsRegistro] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const entrarGoogle = () => {
    setErro('')
    signInWithGoogle().catch((e) => {
      console.error('Erro ao entrar com Google:', e)
      setErro('Erro ao entrar com Google')
    })
  }

  const entrarEmail = async (e) => {
    e.preventDefault()
    if (salvando) return
    setErro('')
    if (isRegistro && senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }
    setSalvando(true)
    try {
      if (isRegistro) await createUserWithEmailAndPassword(auth, email, senha)
      else await signInWithEmailAndPassword(auth, email, senha)
    } catch {
      setErro(isRegistro ? 'Erro ao criar conta' : 'E-mail ou senha incorretos')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="login">
      <div className="logo"><Dumbbell size={34} /></div>
      <h1>Treino</h1>
      <p className="sub">Futevôlei + academia · 12 semanas</p>

      <div className="card">
        <button className="btn-outline" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={entrarGoogle}>
          Entrar com Google
        </button>

        <p className="ou">ou</p>

        <form onSubmit={entrarEmail}>
          <div className="field">
            <input type="email" placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <input type="password" placeholder="Senha" autoComplete={isRegistro ? 'new-password' : 'current-password'} value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          {erro && <p style={{ color: 'var(--red)', fontSize: 14, margin: '0 0 12px' }}>{erro}</p>}
          <button className="btn-primary" type="submit" disabled={salvando}>
            {salvando ? 'Aguarde...' : isRegistro ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button className="trocar" onClick={() => { setIsRegistro(!isRegistro); setErro('') }}>
          {isRegistro ? 'Já tenho conta' : 'Criar conta nova'}
        </button>
      </div>
    </div>
  )
}
