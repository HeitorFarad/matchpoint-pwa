import { useState } from 'react'
import { Check } from 'lucide-react'
import Modal from './Modal'
import Avatar from './Avatar'
import { friends } from '../data/mock'

export default function InviteFriendsModal({ open, onClose, excludeIds = [] }) {
  const [selecionados, setSelecionados] = useState([])

  const disponiveis = friends.filter((f) => !excludeIds.includes(f.id))

  function toggle(id) {
    setSelecionados((list) =>
      list.includes(id) ? list.filter((i) => i !== id) : [...list, id],
    )
  }

  function handleClose() {
    setSelecionados([])
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Convidar amigos">
      <div>
        {disponiveis.map((f) => {
          const ativo = selecionados.includes(f.id)
          return (
            <div
              key={f.id}
              className="list-row"
              style={{ cursor: 'pointer' }}
              onClick={() => toggle(f.id)}
            >
              <Avatar name={f.name} size={38} />
              <div className="info">
                <p className="name">{f.name}</p>
                <p className="sub">@{f.username}</p>
              </div>
              <div className={`check-circle${ativo ? ' active' : ''}`}>
                {ativo && <Check size={14} color="#fff" />}
              </div>
            </div>
          )
        })}
        {disponiveis.length === 0 && (
          <p className="empty-state">Nenhum amigo disponível para convidar.</p>
        )}
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 16 }}
        disabled={selecionados.length === 0}
        onClick={handleClose}
      >
        Convidar {selecionados.length > 0 ? `(${selecionados.length})` : ''}
      </button>
    </Modal>
  )
}
