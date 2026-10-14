import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Dumbbell } from 'lucide-react'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const MENSAGENS = {
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Toque em "Já tenho conta" para entrar (ou use o Google, se foi assim que você criou).',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não existe conta com esse e-mail. Toque em "Criar conta nova".',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem internet. O primeiro login precisa de conexão.',
  'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase (Authentication → Configurações → Domínios autorizados).',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Libere pop-ups para este site.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
}

function mensagem(e, padrao) {
  const m = MENSAGENS[e?.code]
  return m ?? `${padrao} (${e?.code || 'erro desconhecido'})`
}

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
      setErro(mensagem(e, 'Erro ao entrar com Google'))
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
    } catch (e) {
      console.error(e)
      setErro(mensagem(e, isRegistro ? 'Erro ao criar conta' : 'Erro ao entrar'))
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
