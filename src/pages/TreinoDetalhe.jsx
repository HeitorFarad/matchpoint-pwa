import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, UserPlus, MoreVertical, Pencil, XCircle } from 'lucide-react'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import InviteFriendsModal from '../components/InviteFriendsModal'
import { useAuth } from '../contexts/AuthContext'
import { getTreino, atualizarTreino, deletarTreino, confirmarTreino } from '../services/firestore'

export default function TreinoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)

  const [modalConvidar, setModalConvidar] = useState(false)
  const [modalMenu, setModalMenu] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)
  const [editNome, setEditNome] = useState('')
  const [editLocal, setEditLocal] = useState('')
  const [editInicio, setEditInicio] = useState('')
  const [editFim, setEditFim] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    if (!user) return
    let ativo = true
    setLoading(true)
    getTreino(id)
      .then((res) => {
        if (!ativo) return
        setTreino(res)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao buscar treino:', e)
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

  if (!treino) {
    return (
      <div className="app-content">
        <p className="empty-state">Treino não encontrado.</p>
      </div>
    )
  }

  const dias = treino.dias || []
  const confirmadosTreino = treino.confirmados || []
  const cancelaram = treino.cancelaram || []
  const aguardando = treino.aguardando || []
  const vagaAberta = cancelaram[0]

  async function confirmarCancelamento() {
    if (cancelando) return
    setCancelando(true)
    try {
      await deletarTreino(treino.id)
      setModalCancelar(false)
      navigate('/')
    } finally {
      setCancelando(false)
    }
  }

  async function convidarAmigo(amigo) {
    await confirmarTreino(treino.id, { uid: amigo.uid, displayName: amigo.nome, email: amigo.email })
    setTreino((t) => ({
      ...t,
      confirmados: [
        ...(t.confirmados || []),
        { id: amigo.uid, name: amigo.nome || amigo.username, tipo: 'Convidado', status: 'confirmou' },
      ],
    }))
  }

  function abrirEdicaoTreino() {
    setEditNome(treino.nome)
    setEditLocal(treino.local)
    setEditInicio(treino.inicio)
    setEditFim(treino.fim)
    setModalMenu(false)
    setModalEditar(true)
  }

  async function salvarEdicaoTreino() {
    if (salvandoEdicao) return
    setSalvandoEdicao(true)
    try {
      const dados = { nome: editNome, local: editLocal, inicio: editInicio, fim: editFim }
      await atualizarTreino(treino.id, dados)
      setTreino((t) => ({ ...t, ...dados }))
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
          <h1 style={{ fontSize: 19, marginBottom: 6 }}>{treino.nome}</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
            {dias.join(' e ')} · {treino.inicio}-{treino.fim} · {treino.local}
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className="badge badge-white">
              {confirmadosTreino.length}/{treino.vagas} confirmados
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

        <Card title={`Confirmados (${confirmadosTreino.length})`}>
          {confirmadosTreino.map((c) => (
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

        {cancelaram.length > 0 && (
          <Card title={`Cancelaram (${cancelaram.length})`}>
            {cancelaram.map((c) => (
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

        {aguardando.length > 0 && (
          <Card title={`Aguardando resposta (${aguardando.length})`}>
            {aguardando.map((c) => (
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
        excludeIds={confirmadosTreino.map((c) => c.id)}
        onConvidar={convidarAmigo}
      />

      <Modal open={modalMenu} onClose={() => setModalMenu(false)} variant="center">
        <div className="action-sheet">
          <button onClick={abrirEdicaoTreino}>
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
            <input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Local</label>
          <div className="input-wrap">
            <input value={editLocal} onChange={(e) => setEditLocal(e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Início</label>
            <div className="input-wrap">
              <input
                type="time"
                value={editInicio}
                onChange={(e) => setEditInicio(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Fim</label>
            <div className="input-wrap">
              <input type="time" value={editFim} onChange={(e) => setEditFim(e.target.value)} />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 8 }}
          onClick={salvarEdicaoTreino}
          disabled={salvandoEdicao}
        >
          {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </Modal>

      <Modal open={modalCancelar} onClose={() => setModalCancelar(false)} variant="center">
        <div className="confirm-dialog">
          <p>Tem certeza que deseja cancelar este treino?</p>
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
