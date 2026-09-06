import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import CriarPelada from './pages/CriarPelada'
import PeladaDetalhe from './pages/PeladaDetalhe'
import ConvitePublico from './pages/ConvitePublico'
import CriarTreino from './pages/CriarTreino'
import TreinoDetalhe from './pages/TreinoDetalhe'
import Amigos from './pages/Amigos'
import Perfil from './pages/Perfil'
import EditarPerfil from './pages/EditarPerfil'
import Login from './pages/Login'

function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const semNav = location.pathname.startsWith('/convite/')

  if (!user) return <Login />

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/criar-pelada" element={<CriarPelada />} />
        <Route path="/pelada/:id" element={<PeladaDetalhe />} />
        <Route path="/convite/:id" element={<ConvitePublico />} />
        <Route path="/criar-treino" element={<CriarTreino />} />
        <Route path="/treino/:id" element={<TreinoDetalhe />} />
        <Route path="/amigos" element={<Amigos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
      </Routes>
      {!semNav && <BottomNav />}
    </>
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