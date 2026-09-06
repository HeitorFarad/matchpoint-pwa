import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function PageHeader({ title, green = false, right = null }) {
  const navigate = useNavigate()
  return (
    <div className={`page-header${green ? ' header-green' : ''}`}>
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
        <ChevronLeft size={24} />
      </button>
      <h1>{title}</h1>
      {right}
    </div>
  )
}
