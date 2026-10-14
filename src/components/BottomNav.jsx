import { NavLink } from 'react-router-dom'
import { Dumbbell, History, TrendingUp, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Treino', icon: Dumbbell, end: true },
  { to: '/historico', label: 'Histórico', icon: History, end: false },
  { to: '/progresso', label: 'Progresso', icon: TrendingUp, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, end: false },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <Icon size={22} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
