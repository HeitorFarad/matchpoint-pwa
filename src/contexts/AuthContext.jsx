import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = () => {}

    async function init() {
      try {
        await getRedirectResult(auth)
      } catch (e) {
        console.error('Erro ao processar redirect do login:', e)
      }
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      })
    }

    init()

    return () => unsubscribe()
  }, [])

  const logout = () => signOut(auth)

  const value = { user, logout, loading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}