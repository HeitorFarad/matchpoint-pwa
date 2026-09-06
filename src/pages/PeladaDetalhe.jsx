import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, UserPlus, Pencil, Share2, XCircle, Crown, MapPin, Calendar, Clock, Minus, Plus } from 'lucide-react'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import InviteFriendsModal from '../components/InviteFriendsModal'
import { getPeladaById, currentUser } from '../data/mock'

export default function PeladaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pelada = getPeladaById(id)
  const [confirmados, setConfirmados] = useState(pelada?.confirmados ?? [])
  const [local, setLocal] = useState(pelada?.local ?? '')
  const [data, setData] = useState(pelada?.data ?? '')
  const [horario, setHorario] = useState(pelada?.horario ?? '')
  const [vagas, setVagas] = useState(pelada?.vagas ?? 0)

  const [modalConvidar, setModalConvidar] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)

  if (!pelada) {
    return (
      <div className="app-content">
        <p className="empty-state">Pelada não encontrada.</p>
      </div>
    )
  }

  const souOrganizador = pelada.organizadorId === currentUser.id
  const jaConfirmado = confirmados.some((c) => c.id === currentUser.id)
  const lotada = confirmados.length >= vagas

  function toggleConfirmacao() {
    if (jaConfirmado) {
      setConfirmados((list) => list.filter((c) => c.id !== currentUser.id))
    } else {
      setConfirmados((list) => [...list, { id: currentUser.id, name: currentUser.name }])
    }
  }

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
          <h1 style={{ fontSize: 19, marginBottom: 6 }}>{pelada.nome}</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
            {data} · {horario} · Org: {pelada.organizador}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 13, opacity: 0.9 }}>{local}</p>
          <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className="badge badge-white">
              {confirmados.length} confirmados
            </span>
            <span className="badge badge-white">
              {lotada ? 'Lotada' : `${vagas - confirmados.length} vagas`}
            </span>
          </div>
        </div>
      </div>

      {souOrganizador && (
        <div className="action-bar">
          <button onClick={() => setModalConvidar(true)}>
            <UserPlus size={16} /> Convidar
          </button>
          <button onClick={() => setModalEditar(true)}>
            <Pencil size={16} /> Editar
          </button>
          <button onClick={() => navigate(`/convite/${pelada.id}`)}>
            <Share2 size={16} /> Compartilhar
          </button>
          <button className="danger" onClick={() => setModalCancelar(true)}>
            <XCircle size={16} /> Cancelar
          </button>
        </div>
      )}

      <div className="app-content" style={{ paddingTop: souOrganizador ? 4 : 16 }}>
        <Card title={`Confirmados (${confirmados.length})`}>
          {confirmados.map((c) => (
            <div className="list-row" key={c.id}>
              <Avatar name={c.name} size={38} />
              <div className="info">
                <p className="name">
                  {c.name}
                  {c.organizador && (
                    <Badge color="yellow" icon={<Crown size={12} />}>
                      Organizador
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          ))}
        </Card>

        {pelada.pendentes.length > 0 && (
          <Card title={`Convidados pendentes (${pelada.pendentes.length})`}>
            {pelada.pendentes.map((c) => (
              <div className="list-row" key={c.id}>
                <Avatar name={c.name} size={38} muted />
                <div className="info">
                  <p className="name">{c.name}</p>
                </div>
                <Badge color="yellow">Pendente</Badge>
              </div>
            ))}
          </Card>
        )}

        <div style={{ marginTop: 16 }}>
          {jaConfirmado ? (
            <button className="btn-danger" onClick={toggleConfirmacao}>
              Cancelar presença
            </button>
          ) : (
            <button className="btn-primary" onClick={toggleConfirmacao} disabled={lotada}>
              {lotada ? 'Entrar na lista de espera' : 'Confirmar presença'}
            </button>
          )}
        </div>
      </div>

      <InviteFriendsModal
        open={modalConvidar}
        onClose={() => setModalConvidar(false)}
        excludeIds={[...confirmados.map((c) => c.id), ...pelada.pendentes.map((c) => c.id)]}
      />

      <Modal open={modalEditar} onClose={() => setModalEditar(false)} title="Editar pelada">
        <div className="field">
          <label>Local</label>
          <div className="input-wrap">
            <MapPin size={18} />
            <input value={local} onChange={(e) => setLocal(e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Data</label>
            <div className="input-wrap">
              <Calendar size={18} />
              <input value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Horário</label>
            <div className="input-wrap">
              <Clock size={18} />
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="field">
          <label>Limite de vagas</label>
          <div className="stepper">
            <button type="button" onClick={() => setVagas((v) => Math.max(1, v - 1))}>
              <Minus size={18} />
            </button>
            <span>{vagas}</span>
            <button type="button" className="plus" onClick={() => setVagas((v) => v + 1)}>
              <Plus size={18} />
            </button>
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

      <Modal
        open={modalCancelar}
        onClose={() => setModalCancelar(false)}
        variant="center"
      >
        <div className="confirm-dialog">
          <p>Tem certeza que deseja cancelar esta pelada?</p>
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
