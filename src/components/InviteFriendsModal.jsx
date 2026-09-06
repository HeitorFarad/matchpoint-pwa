import Modal from './Modal'

export default function InviteFriendsModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Convidar amigos">
      <p className="empty-state">
        Nenhum amigo cadastrado ainda. O sistema de amigos está em desenvolvimento.
      </p>
    </Modal>
  )
}
