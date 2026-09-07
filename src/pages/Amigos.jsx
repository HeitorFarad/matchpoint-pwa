import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus, Search, AtSign, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../contexts/AuthContext'
import {
  buscarAmigos,
  buscarSolicitacoesPendentes,
  buscarUsuarioPorUsername,
  buscarAmizadeEntre,
  enviarSolicitacaoAmizade,
} from '../services/firestore'

export default function Amigos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [amigos, setAmigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [pendentesCount, setPendentesCount] = useState(0)

  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [usernameBusca, setUsernameBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [erroBusca, setErroBusca] = useState('')
  const [resultadoBusca, setResultadoBusca] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let ativo = true
    Promise.all([buscarAmigos(user.uid), buscarSolicitacoesPendentes(user.uid)])
      .then(([listaAmigos, pendentes]) => {
        if (!ativo) return
        setAmigos(listaAmigos)
        setPendentesCount(pendentes.length)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao carregar amigos:', e)
        if (!ativo) return
        setLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [user.uid])

  const amigosFiltrados = amigos.filter((a) => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return true
    return (a.nome || '').toLowerCase().includes(termo) || (a.username || '').toLowerCase().includes(termo)
  })

  function fecharModal() {
    setModalAdicionar(false)
    setUsernameBusca('')
    setErroBusca('')
    setResultadoBusca(null)
  }

  async function handleBuscarUsername() {
    const uname = usernameBusca.trim().toLowerCase().replace(/^@/, '')
    if (!uname || buscando) return
    setBuscando(true)
    setErroBusca('')
    setResultadoBusca(null)
    try {
      const usuario = await buscarUsuarioPorUsername(uname)
      if (!usuario) {
        setErroBusca('Usuário não encontrado.')
        return
      }
      if (usuario.id === user.uid) {
        setErroBusca('Esse é o seu próprio usuário.')
        return
      }
      const amizade = await buscarAmizadeEntre(user.uid, usuario.id)
      const status = amizade?.status === 'aceito' ? 'aceito' : amizade?.status === 'pendente' ? 'pendente' : 'nenhum'
      setResultadoBusca({ usuario, status })
    } catch (e) {
      console.error('Erro ao buscar usuário:', e)
      setErroBusca('Erro ao buscar usuário.')
    } finally {
      setBuscando(false)
    }
  }

  async function handleAdicionar() {
    if (!resultadoBusca || enviando) return
    setEnviando(true)
    try {
      await enviarSolicitacaoAmizade(user.uid, resultadoBusca.usuario.id)
      setResultadoBusca((r) => ({ ...r, status: 'pendente' }))
    } catch (e) {
      console.error('Erro ao enviar solicitação:', e)
      setErroBusca('Erro ao enviar solicitação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Amigos</h1>
        <button
          className="icon-btn"
          style={{ position: 'relative', flexShrink: 0 }}
          onClick={() => navigate('/pendencias')}
          aria-label="Pendências"
        >
          <Bell size={18} />
          {pendentesCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                padding: '0 3px',
                borderRadius: 8,
                background: 'var(--red)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pendentesCount}
            </span>
          )}
        </button>
        <button
          className="icon-btn"
          style={{ flexShrink: 0 }}
          onClick={() => setModalAdicionar(true)}
          aria-label="Adicionar amigo"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="app-content" style={{ paddingTop: 4 }}>
        <div className="search-wrap">
          <Search size={18} />
          <input
            placeholder="Buscar amigos"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="empty-state">Carregando...</p>
        ) : amigos.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <div
              className="icon-btn"
              style={{ width: 64, height: 64, border: 'none', background: 'var(--green-bg)', marginBottom: 16 }}
            >
              <Users size={28} color="var(--primary)" />
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-title)' }}>
              Nenhum amigo ainda
            </p>
            <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
              Toque em + e busque pelo @username para adicionar.
            </p>
          </div>
        ) : amigosFiltrados.length === 0 ? (
          <p className="empty-state">Nenhum amigo encontrado.</p>
        ) : (
          <Card>
            {amigosFiltrados.map((a) => (
              <div className="list-row" key={a.id}>
                <Avatar name={a.nome || a.username || '?'} size={40} />
                <div className="info">
                  <p className="name">{a.nome || a.username}</p>
                  {a.username && <p className="sub">@{a.username}</p>}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <Modal open={modalAdicionar} onClose={fecharModal} title="Adicionar amigo">
        <div className="input-wrap" style={{ marginBottom: 12 }}>
          <AtSign size={18} />
          <input
            placeholder="username"
            value={usernameBusca}
            onChange={(e) => setUsernameBusca(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBuscarUsername()
            }}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleBuscarUsername}
          disabled={!usernameBusca || buscando}
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>

        {erroBusca && (
          <p className="empty-state" style={{ padding: '16px 0 0' }}>
            {erroBusca}
          </p>
        )}

        {resultadoBusca && (
          <div className="list-row" style={{ marginTop: 16 }}>
            <Avatar name={resultadoBusca.usuario.nome || resultadoBusca.usuario.username || '?'} size={44} />
            <div className="info">
              <p className="name">{resultadoBusca.usuario.nome || resultadoBusca.usuario.username}</p>
              {resultadoBusca.usuario.username && <p className="sub">@{resultadoBusca.usuario.username}</p>}
            </div>
            {resultadoBusca.status === 'aceito' ? (
              <Badge color="green">Amigos</Badge>
            ) : resultadoBusca.status === 'pendente' ? (
              <Badge color="yellow">Enviado</Badge>
            ) : (
              <button type="button" className="btn-outline" onClick={handleAdicionar} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Adicionar'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
