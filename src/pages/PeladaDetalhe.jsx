import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, UserPlus, Pencil, Share2, XCircle, Crown, MapPin, Calendar, Clock, Minus, Plus } from 'lucide-react'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import InviteFriendsModal from '../components/InviteFriendsModal'
import { useAuth } from '../contexts/AuthContext'
import { getPelada, atualizarPelada, deletarPelada } from '../services/firestore'

const niveis = ['Iniciante', 'Intermediário', 'Avançado', 'Aberto']

export default function PeladaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pelada, setPelada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmados, setConfirmados] = useState([])
  const [nome, setNome] = useState('')
  const [local, setLocal] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [vagas, setVagas] = useState(0)
  const [nivel, setNivel] = useState('')

  const [modalConvidar, setModalConvidar] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    if (!user) return
    let ativo = true
    setLoading(true)
    getPelada(id)
      .then((res) => {
        if (!ativo) return
        setPelada(res)
        setConfirmados(res?.confirmados ?? [])
        setNome(res?.nome ?? '')
        setLocal(res?.local ?? '')
        setData(res?.data ?? '')
        setHorario(res?.horario ?? '')
        setVagas(res?.vagas ?? 0)
        setNivel(res?.nivel ?? '')
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao buscar pelada:', e)
        if (!ativo) return
        setLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [id, user])

  if (loading) {
    return (
      <div className="app-content">
        <p className="empty-state">Carregando...</p>
      </div>
    )
  }

  if (!pelada) {
    return (
      <div className="app-content">
        <p className="empty-state">Pelada não encontrada.</p>
      </div>
    )
  }

  const souOrganizador = pelada.organizadorId === user.uid
  const jaConfirmado = confirmados.some((c) => c.id === user.uid)
  const lotada = confirmados.length >= vagas

  function toggleConfirmacao() {
    if (jaConfirmado) {
      setConfirmados((list) => list.filter((c) => c.id !== user.uid))
    } else {
      setConfirmados((list) => [...list, { id: user.uid, name: user.displayName || user.email }])
    }
  }

  async function confirmarCancelamento() {
    if (cancelando) return
    setCancelando(true)
    try {
      await deletarPelada(pelada.id)
      setModalCancelar(false)
      navigate('/')
    } finally {
      setCancelando(false)
    }
  }

  async function salvarEdicaoPelada() {
    if (salvandoEdicao) return
    setSalvandoEdicao(true)
    try {
      await atualizarPelada(pelada.id, { nome, local, data, horario, vagas, nivel })
      setPelada((p) => ({ ...p, nome, local, data, horario, vagas, nivel }))
      setModalEditar(false)
    } finally {
      setSalvandoEdicao(false)
    }
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
            {pelada.nivel && <span className="badge badge-white">{pelada.nivel}</span>}
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

        {(pelada.pendentes || []).length > 0 && (
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
        excludeIds={[...confirmados.map((c) => c.id), ...(pelada.pendentes || []).map((c) => c.id)]}
      />

      <Modal open={modalEditar} onClose={() => setModalEditar(false)} title="Editar pelada">
        <div className="field">
          <label>Nome da pelada</label>
          <div className="input-wrap">
            <input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        </div>
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
        <div className="field">
          <label>Nível</label>
          <div className="chip-scroll">
            {niveis.map((n) => (
              <button
                type="button"
                key={n}
                className={`chip${nivel === n ? ' active' : ''}`}
                onClick={() => setNivel(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 8 }}
          onClick={salvarEdicaoPelada}
          disabled={salvandoEdicao}
        >
          {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
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
            <button
              className="btn-outline"
              onClick={() => setModalCancelar(false)}
              disabled={cancelando}
            >
              Não
            </button>
            <button className="btn-danger" onClick={confirmarCancelamento} disabled={cancelando}>
              {cancelando ? 'Cancelando...' : 'Sim'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
