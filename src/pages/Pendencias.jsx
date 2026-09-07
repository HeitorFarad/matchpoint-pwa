import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import { useAuth } from '../contexts/AuthContext'
import {
  buscarSolicitacoesPendentes,
  buscarSolicitacoesEnviadas,
  responderSolicitacao,
  cancelarSolicitacao,
} from '../services/firestore'

export default function Pendencias() {
  const { user } = useAuth()
  const [recebidas, setRecebidas] = useState([])
  const [enviadas, setEnviadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(null)

  useEffect(() => {
    let ativo = true
    Promise.all([buscarSolicitacoesPendentes(user.uid), buscarSolicitacoesEnviadas(user.uid)])
      .then(([r, e]) => {
        if (!ativo) return
        setRecebidas(r)
        setEnviadas(e)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao carregar pendências:', e)
        if (!ativo) return
        setLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [user.uid])

  async function aceitar(s) {
    if (processando) return
    setProcessando(s.id)
    try {
      await responderSolicitacao(s.id, 'aceito')
      setRecebidas((list) => list.filter((x) => x.id !== s.id))
    } catch (e) {
      console.error('Erro ao aceitar solicitação:', e)
    } finally {
      setProcessando(null)
    }
  }

  async function recusar(s) {
    if (processando) return
    setProcessando(s.id)
    try {
      await responderSolicitacao(s.id, 'recusado')
      setRecebidas((list) => list.filter((x) => x.id !== s.id))
    } catch (e) {
      console.error('Erro ao recusar solicitação:', e)
    } finally {
      setProcessando(null)
    }
  }

  async function cancelar(s) {
    if (processando) return
    setProcessando(s.id)
    try {
      await cancelarSolicitacao(s.id)
      setEnviadas((list) => list.filter((x) => x.id !== s.id))
    } catch (e) {
      console.error('Erro ao cancelar solicitação:', e)
    } finally {
      setProcessando(null)
    }
  }

  return (
    <div>
      <PageHeader title="Pendências" />

      <div className="app-content" style={{ paddingTop: 4 }}>
        {loading ? (
          <p className="empty-state">Carregando...</p>
        ) : (
          <>
            <p className="section-title" style={{ marginTop: 0 }}>
              Solicitações recebidas
            </p>
            {recebidas.length === 0 ? (
              <p className="empty-state">Nenhuma solicitação recebida.</p>
            ) : (
              <Card>
                {recebidas.map((s) => (
                  <div className="list-row" key={s.id}>
                    <Avatar name={s.usuario?.nome || s.usuario?.username || '?'} size={40} />
                    <div className="info">
                      <p className="name">{s.usuario?.nome || s.usuario?.username}</p>
                      {s.usuario?.username && <p className="sub">@{s.usuario.username}</p>}
                    </div>
                    <div className="row" style={{ flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => aceitar(s)}
                        disabled={processando === s.id}
                        aria-label="Aceitar"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: 'none',
                          background: 'var(--green-bg)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recusar(s)}
                        disabled={processando === s.id}
                        aria-label="Recusar"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: 'none',
                          background: 'var(--red-bg)',
                          color: 'var(--red)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            <p className="section-title">Solicitações enviadas</p>
            {enviadas.length === 0 ? (
              <p className="empty-state">Nenhuma solicitação enviada.</p>
            ) : (
              <Card>
                {enviadas.map((s) => (
                  <div className="list-row" key={s.id}>
                    <Avatar name={s.usuario?.nome || s.usuario?.username || '?'} size={40} muted />
                    <div className="info">
                      <p className="name">{s.usuario?.nome || s.usuario?.username}</p>
                      {s.usuario?.username && <p className="sub">@{s.usuario.username}</p>}
                    </div>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ flexShrink: 0, color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => cancelar(s)}
                      disabled={processando === s.id}
                    >
                      Cancelar
                    </button>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
