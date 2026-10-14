import Modal from './Modal'

export default function Confirmar({ open, texto, confirmar = 'Confirmar', perigo = false, onConfirmar, onCancelar }) {
  return (
    <Modal open={open} onClose={onCancelar} variant="center">
      <div className="confirm-dialog">
        <p>{texto}</p>
        <div className="row">
          <button className="btn-outline" onClick={onCancelar}>Cancelar</button>
          <button className={perigo ? 'btn-danger' : 'btn-primary'} style={perigo ? undefined : { padding: 10, fontSize: 14 }} onClick={onConfirmar}>
            {confirmar}
          </button>
        </div>
      </div>
    </Modal>
  )
}
