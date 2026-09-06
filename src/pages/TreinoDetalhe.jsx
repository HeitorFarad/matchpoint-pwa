import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, UserPlus, MoreVertical, Pencil, XCircle } from 'lucide-react'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import InviteFriendsModal from '../components/InviteFriendsModal'
import { getTreinoById } from '../data/mock'

export default function TreinoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const treino = getTreinoById(id)

  const [modalConvidar, setModalConvidar] = useState(false)
  const [modalMenu, setModalMenu] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)

  if (!treino) {
    return (
      <div className="app-content">
        <p className="empty-state">Treino não encontrado.</p>
      </div>
    )
  }

  const vagaAberta = treino.cancelaram[0]

  function confirmarCancelamento() {
    setModalCancelar(false)
    navigate('/')
  }

  return (
    <div>
      <div className="header-green" style={{ position: 'relative' }}>
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          style={{ position: 'absolute', top: 20, left: 16 }}
        >
          <ChevronLeft size={24} />
        </button>
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <h1 style={{ fontSize: 19, marginBottom: 6 }}>{treino.nome}</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
            {treino.dias.join(' e ')} · {treino.inicio}-{treino.fim} · {treino.local}
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className="badge badge-white">
              {treino.confirmados.length}/{treino.vagas} confirmados
            </span>
            <span className="badge badge-white">Hoje</span>
          </div>
        </div>
      </div>

      <div className="action-bar" style={{ justifyContent: 'flex-end' }}>
        <button
          style={{ flex: 'none', width: 40, padding: 0 }}
          onClick={() => setModalConvidar(true)}
          aria-label="Convidar pessoa"
        >
          <UserPlus size={16} />
        </button>
        <button
          style={{ flex: 'none', width: 40, padding: 0 }}
          onClick={() => setModalMenu(true)}
          aria-label="Mais opções"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="app-content" style={{ paddingTop: 4 }}>
        {vagaAberta && (
          <div className="alert-yellow">
            <span className="text">
              <strong>{vagaAberta.name}</strong> cancelou — ficou 1 vaga aberta
            </span>
            <button className="btn-outline" style={{ flexShrink: 0 }}>
              Convidar
            </button>
          </div>
        )}

        <Card title={`Confirmados (${treino.confirmados.length})`}>
          {treino.confirmados.map((c) => (
            <div className="list-row" key={c.id}>
              <Avatar name={c.name} size={38} />
              <div className="info">
                <p className="name">
                  {c.name}
                  <Badge color={c.tipo === 'Fixo' ? 'green' : 'yellow'}>{c.tipo}</Badge>
                </p>
                <p className="sub">✓ Confirmou</p>
              </div>
            </div>
          ))}
        </Card>

        {treino.cancelaram.length > 0 && (
          <Card title={`Cancelaram (${treino.cancelaram.length})`}>
            {treino.cancelaram.map((c) => (
              <div className="list-row" key={c.id}>
                <Avatar name={c.name} size={38} muted />
                <div className="info">
                  <p className="name" style={{ color: 'var(--text-secondary)' }}>
                    {c.name}
                  </p>
                  <p className="sub">Cancelou às {c.horario}</p>
                </div>
              </div>
            ))}
          </Card>
        )}

        {treino.aguardando.length > 0 && (
          <Card title={`Aguardando resposta (${treino.aguardando.length})`}>
            {treino.aguardando.map((c) => (
              <div className="list-row" key={c.id}>
                <Avatar name={c.name} size={38} muted />
                <div className="info">
                  <p className="name" style={{ color: 'var(--text-secondary)' }}>
                    {c.name}
                  </p>
                  <p className="sub">Lembrete enviado</p>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <InviteFriendsModal
        open={modalConvidar}
        onClose={() => setModalConvidar(false)}
        excludeIds={treino.confirmados.map((c) => c.id)}
      />

      <Modal open={modalMenu} onClose={() => setModalMenu(false)} variant="center">
        <div className="action-sheet">
          <button
            onClick={() => {
              setModalMenu(false)
              setModalEditar(true)
            }}
          >
            <Pencil size={16} /> Editar treino
          </button>
          <button
            className="danger"
            onClick={() => {
              setModalMenu(false)
              setModalCancelar(true)
            }}
          >
            <XCircle size={16} /> Cancelar treino
          </button>
        </div>
      </Modal>

      <Modal open={modalEditar} onClose={() => setModalEditar(false)} title="Editar treino">
        <div className="field">
          <label>Nome do treino</label>
          <div className="input-wrap">
            <input defaultValue={treino.nome} />
          </div>
        </div>
        <div className="field">
          <label>Local</label>
          <div className="input-wrap">
            <input defaultValue={treino.local} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Início</label>
            <div className="input-wrap">
              <input type="time" defaultValue={treino.inicio} />
            </div>
          </div>
          <div className="field">
            <label>Fim</label>
            <div className="input-wrap">
              <input type="time" defaultValue={treino.fim} />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 8 }}
          onClick={() => setModalEditar(false)}
        >
          Salvar alterações
        </button>
      </Modal>

      <Modal open={modalCancelar} onClose={() => setModalCancelar(false)} variant="center">
        <div className="confirm-dialog">
          <p>Tem certeza que deseja cancelar este treino?</p>
          <div className="row">
            <button className="btn-outline" onClick={() => setModalCancelar(false)}>
              Não
            </button>
            <button className="btn-danger" onClick={confirmarCancelamento}>
              Sim
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
