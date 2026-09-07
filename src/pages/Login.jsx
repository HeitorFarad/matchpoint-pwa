import { useState } from 'react'
import { signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { atualizarUsuario, buscarUsuarioPorUsername } from '../services/firestore'

function isIOSSafari() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [username, setUsername] = useState('')
  const [isRegistro, setIsRegistro] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const loginGoogle = async () => {
    try {
      if (isIOSSafari()) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        await signInWithPopup(auth, googleProvider)
      }
    } catch (e) {
      setErro('Erro ao entrar com Google')
    }
  }

  const loginEmail = async () => {
    if (salvando) return
    setErro('')

    if (isRegistro) {
      if (!username.trim()) {
        setErro('Escolha um nome de usuário.')
        return
      }
      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem.')
        return
      }
    }

    setSalvando(true)
    try {
      if (isRegistro) {
        const existente = await buscarUsuarioPorUsername(username)
        if (existente) {
          setErro('Esse nome de usuário já está em uso.')
          return
        }
        const cred = await createUserWithEmailAndPassword(auth, email, senha)
        await updateProfile(cred.user, { displayName: username })
        await atualizarUsuario(cred.user.uid, { nome: username, email, username })
      } else {
        await signInWithEmailAndPassword(auth, email, senha)
      }
    } catch (e) {
      setErro(isRegistro ? 'Erro ao criar conta' : 'E-mail ou senha incorretos')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#f5f5f5' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#1db954', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px', fontWeight: 'bold', color: 'white' }}>MP</div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a' }}>MatchPoint</h1>
        <p style={{ color: '#666', marginTop: '4px' }}>Organize suas peladas</p>
      </div>

      <div style={{ width: '100%', maxWidth: '360px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <button onClick={loginGoogle} style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: 'white', fontSize: '16px', fontWeight: '500', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          🔵 Entrar com Google
        </button>

        <div style={{ textAlign: 'center', color: '#999', marginBottom: '20px', fontSize: '14px' }}>ou</div>

        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box' }} />

        {isRegistro && (
          <input type="text" placeholder="Nome de usuário (sem @)" value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box' }} />
        )}

        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px', marginBottom: isRegistro ? '12px' : '16px', boxSizing: 'border-box' }} />

        {isRegistro && (
          <input type="password" placeholder="Confirmar senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box' }} />
        )}

        {erro && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{erro}</p>}

        <button onClick={loginEmail} disabled={salvando} style={{ width: '100%', padding: '14px', backgroundColor: '#1db954', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          {salvando ? 'Aguarde...' : isRegistro ? 'Criar conta' : 'Entrar'}
        </button>

        <p onClick={() => { setIsRegistro(!isRegistro); setErro('') }} style={{ textAlign: 'center', marginTop: '16px', color: '#1db954', cursor: 'pointer', fontSize: '14px' }}>
          {isRegistro ? 'Já tenho conta' : 'Criar conta nova'}
        </p>
      </div>
    </div>
  )
}
