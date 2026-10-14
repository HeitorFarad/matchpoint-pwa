import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DadosProvider } from './contexts/DadosContext'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Hoje from './pages/Hoje'
import Treino from './pages/Treino'
import Historico from './pages/Historico'
import SessaoDetalhe from './pages/SessaoDetalhe'
import Progresso from './pages/Progresso'
import Ajustes from './pages/Ajustes'

function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  // Na tela do treino a barra de baixo dá lugar ao timer e ao botão de finalizar.
  const semNav = location.pathname.startsWith('/dia/')

  if (!user) return <Login />

  return (
    <DadosProvider>
      <Routes>
        <Route path="/" element={<Hoje />} />
        <Route path="/dia/:diaId" element={<Treino />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/sessao/:id" element={<SessaoDetalhe />} />
        <Route path="/progresso" element={<Progresso />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="*" element={<Hoje />} />
      </Routes>
      {!semNav && <BottomNav />}
    </DadosProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}
