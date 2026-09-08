import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { sincronizarUsuario, getUsuario, atualizarUsuario, gerarUsernameDisponivel } from '../services/firestore'
import { salvarTokenUsuario, solicitarPermissaoNotificacao } from '../services/onesignal'

async function garantirUsername(user) {
  const dados = await getUsuario(user.uid)
  if (dados?.username) return
  const username = await gerarUsernameDisponivel((user.email || '').split('@')[0])
  if (!username) return
  await atualizarUsuario(user.uid, { username })
}

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        sincronizarUsuario(user)
          .then(() => garantirUsername(user))
          .catch((e) => {
            console.error('Erro ao sincronizar usuário:', e)
          })
        salvarTokenUsuario(user.uid)
        solicitarPermissaoNotificacao()
      }
    })

    return unsubscribe
  }, [])

  const logout = () => signOut(auth)

  // Precisa ser chamada diretamente no handler de clique, sem await/async antes,
  // senão o Safari (principalmente em PWA standalone) bloqueia o popup por não
  // considerar a chamada originada de um gesto do usuário.
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

  const value = { user, logout, loading, signInWithGoogle }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}