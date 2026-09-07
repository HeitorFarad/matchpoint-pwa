import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'
import { sincronizarUsuario, getUsuario, atualizarUsuario, gerarUsernameDisponivel } from '../services/firestore'

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
    getRedirectResult(auth).catch((e) => {
      console.error('Erro ao processar redirect do login:', e)
    })

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        sincronizarUsuario(user)
          .then(() => garantirUsername(user))
          .catch((e) => {
            console.error('Erro ao sincronizar usuário:', e)
          })
      }
    })

    return unsubscribe
  }, [])

  const logout = () => signOut(auth)

  const value = { user, logout, loading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}