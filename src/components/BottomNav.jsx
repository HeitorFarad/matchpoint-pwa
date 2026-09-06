import { NavLink } from 'react-router-dom'
import { Home, Users, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/amigos', label: 'Amigos', icon: Users, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
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
