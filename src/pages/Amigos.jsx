import { useState } from 'react'
import { Search, UserPlus, Check, X } from 'lucide-react'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { friends, friendRequests, addFriendSuggestions } from '../data/mock'

export default function Amigos() {
  const [busca, setBusca] = useState('')
  const [requests, setRequests] = useState(friendRequests)
  const [list, setList] = useState(friends)

  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [buscaAdicionar, setBuscaAdicionar] = useState('')
  const [adicionados, setAdicionados] = useState([])

  function aceitar(r) {
    setRequests((rs) => rs.filter((x) => x.id !== r.id))
    setList((ls) => [...ls, { ...r, level: 'Iniciante', fixo: false }])
  }

  function recusar(r) {
    setRequests((rs) => rs.filter((x) => x.id !== r.id))
  }

  function adicionarSugestao(s) {
    setAdicionados((ids) => [...ids, s.id])
    setList((ls) => [...ls, { ...s, level: 'Iniciante', fixo: false }])
  }

  function fecharModalAdicionar() {
    setModalAdicionar(false)
    setBuscaAdicionar('')
  }

  const sugestoesFiltradas = addFriendSuggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(buscaAdicionar.toLowerCase()) ||
      s.username.toLowerCase().includes(buscaAdicionar.toLowerCase()),
  )

  const filtrados = list.filter((f) =>
    f.name.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div>
      <div className="page-header">
        <h1>Amigos</h1>
        <button
          className="icon-btn"
          aria-label="Adicionar amigo"
          onClick={() => setModalAdicionar(true)}
        >
          <UserPlus size={18} color="var(--primary)" />
        </button>
      </div>

      <div className="app-content" style={{ paddingTop: 4 }}>
        <div className="search-wrap">
          <Search size={18} />
          <input
            placeholder="Buscar amigos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {requests.length > 0 && (
          <>
            <div className="row" style={{ marginBottom: 10 }}>
              <p className="section-title" style={{ margin: 0 }}>
                Solicitações
              </p>
              <Badge color="green">{requests.length}</Badge>
            </div>
            <div className="card" style={{ marginBottom: 20 }}>
              {requests.map((r) => (
                <div className="list-row" key={r.id}>
                  <Avatar name={r.name} size={40} />
                  <div className="info">
                    <p className="name">{r.name}</p>
                    <p className="sub">
                      @{r.username} · {r.mutualFriends}{' '}
                      {r.mutualFriends === 1 ? 'amigo em comum' : 'amigos em comum'}
                    </p>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <button
                      className="icon-btn"
                      style={{ background: 'var(--green-bg)', borderColor: 'var(--green-bg)' }}
                      onClick={() => aceitar(r)}
                      aria-label="Aceitar"
                    >
                      <Check size={16} color="var(--primary)" />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => recusar(r)}
                      aria-label="Recusar"
                    >
                      <X size={16} color="var(--text-secondary)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="section-title">Meus amigos</p>
        <div className="card">
          {filtrados.map((f) => (
            <div className="list-row" key={f.id}>
              <Avatar name={f.name} size={40} />
              <div className="info">
                <p className="name">
                  {f.name}
                  {f.fixo && <Badge color="green">Fixo</Badge>}
                </p>
                <p className="sub">
                  @{f.username} · {f.level}
                </p>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && <p className="empty-state">Nenhum amigo encontrado.</p>}
        </div>
      </div>

      <Modal open={modalAdicionar} onClose={fecharModalAdicionar} title="Adicionar amigo">
        <div className="search-wrap">
          <Search size={18} />
          <input
            placeholder="Buscar pelo nome ou @"
            value={buscaAdicionar}
            onChange={(e) => setBuscaAdicionar(e.target.value)}
          />
        </div>

        {sugestoesFiltradas.map((s) => {
          const jaAdicionado = adicionados.includes(s.id)
          return (
            <div className="list-row" key={s.id}>
              <Avatar name={s.name} size={40} />
              <div className="info">
                <p className="name">{s.name}</p>
                <p className="sub">@{s.username}</p>
              </div>
              <button
                className="btn-outline"
                style={{
                  background: jaAdicionado ? 'var(--green-bg)' : 'var(--primary)',
                  borderColor: jaAdicionado ? 'var(--green-bg)' : 'var(--primary)',
                  color: jaAdicionado ? 'var(--primary)' : '#fff',
                }}
                disabled={jaAdicionado}
                onClick={() => adicionarSugestao(s)}
              >
                {jaAdicionado ? 'Adicionado ✓' : 'Adicionar'}
              </button>
            </div>
          )
        })}
        {sugestoesFiltradas.length === 0 && (
          <p className="empty-state">Nenhuma sugestão encontrada.</p>
        )}
      </Modal>
    </div>
  )
}
