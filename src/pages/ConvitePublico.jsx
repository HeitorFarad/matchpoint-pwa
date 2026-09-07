import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import { useAuth } from '../contexts/AuthContext'
import { getPelada, confirmarPelada } from '../services/firestore'
import { formatarData } from '../utils/formatarData'

export default function ConvitePublico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pelada, setPelada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const [erroConfirmar, setErroConfirmar] = useState('')

  useEffect(() => {
    let ativo = true
    setLoading(true)
    setErro(null)
    getPelada(id)
      .then((res) => {
        if (!ativo) return
        if (!res) {
          setErro('nao-encontrado')
        } else {
          setPelada(res)
          if (user && res.confirmados?.some((c) => c.id === user.uid)) {
            setConfirmado(true)
          }
        }
        setLoading(false)
      })
      .catch((e) => {
        console.error('Erro ao buscar convite:', e)
        if (!ativo) return
        setErro(e.code === 'permission-denied' ? 'permissao' : 'nao-encontrado')
        setLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [id, user])

  function handleEntrar() {
    sessionStorage.setItem('convite_redirect', `/convite/${id}`)
    navigate('/login')
  }

  async function handleConfirmar() {
    if (!user || confirmando || confirmado) return
    setConfirmando(true)
    setErroConfirmar('')
    try {
      await confirmarPelada(pelada.id, user)
      // Confere no servidor se a confirmação realmente foi persistida antes de
      // marcar como confirmado na tela, em vez de assumir sucesso de forma otimista.
      const atualizada = await getPelada(pelada.id)
      const persistiu = atualizada?.confirmados?.some((c) => c.id === user.uid)
      if (!persistiu) {
        throw new Error('Confirmação não foi salva no servidor.')
      }
      setPelada(atualizada)
      setConfirmado(true)
    } catch (e) {
      console.error('Erro ao confirmar presença:', e)
      setErroConfirmar('Não foi possível confirmar sua presença. Tente novamente.')
    } finally {
      setConfirmando(false)
    }
  }

  if (loading) {
    return (
      <div className="app-content">
        <p className="empty-state">Carregando...</p>
      </div>
    )
  }

  if (erro === 'permissao') {
    return (
      <div
        className="app-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          textAlign: 'center',
          gap: 16,
        }}
      >
        <p className="empty-state" style={{ padding: 0 }}>
          Não foi possível carregar este convite sem estar logado.
        </p>
        <button className="btn-primary" style={{ maxWidth: 260 }} onClick={handleEntrar}>
          Fazer login para ver o convite
        </button>
      </div>
    )
  }

  if (erro === 'nao-encontrado' || !pelada) {
    return (
      <div className="app-content">
        <p className="empty-state">Convite não encontrado.</p>
      </div>
    )
  }

  const confirmadosPelada = pelada.confirmados || []
  const vagasRestantes = Math.max(pelada.vagas - confirmadosPelada.length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <div className="header-green" style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9, fontWeight: 600 }}>
          Você foi convidado 🏐
        </p>
        <h1 style={{ fontSize: 22, margin: '8px 0 4px' }}>{pelada.nome}</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>por {pelada.organizador}</p>
      </div>

      <div className="app-content" style={{ flex: 1 }}>
        <div className="card">
          <div className="list-row">
            <div className="icon-btn" style={{ border: 'none', background: 'var(--green-bg)' }}>
              <Calendar size={18} color="var(--primary)" />
            </div>
            <div className="info">
              <p className="name" style={{ fontWeight: 600 }}>
                {formatarData(pelada.data)} às {pelada.horario}
              </p>
            </div>
          </div>
          <div className="list-row">
            <div className="icon-btn" style={{ border: 'none', background: 'var(--green-bg)' }}>
              <MapPin size={18} color="var(--primary)" />
            </div>
            <div className="info">
              <p className="name" style={{ fontWeight: 600 }}>{pelada.local}</p>
            </div>
          </div>
          <div className="list-row">
            <div className="icon-btn" style={{ border: 'none', background: 'var(--green-bg)' }}>
              <Users size={18} color="var(--primary)" />
            </div>
            <div className="info">
              <p className="name" style={{ fontWeight: 600 }}>
                {confirmadosPelada.length}/{pelada.vagas} vagas · {vagasRestantes} restantes
              </p>
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 16, justifyContent: 'center', gap: 10 }}>
          <div className="avatar-stack">
            {confirmadosPelada.slice(0, 5).map((c) => (
              <Avatar key={c.id} name={c.name} size={32} />
            ))}
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {confirmadosPelada.length} confirmados
          </span>
        </div>

        <div style={{ marginTop: 28 }}>
          {confirmado ? (
            <>
              <button className="btn-primary" disabled>
                Presença confirmada ✓
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
                Você confirmou presença! Nos vemos lá 🏐
              </p>
            </>
          ) : user ? (
            <>
              <button className="btn-primary" onClick={handleConfirmar} disabled={confirmando}>
                {confirmando ? 'Confirmando...' : 'Quero ir! Confirmar presença'}
              </button>
              {erroConfirmar && (
                <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--red)' }}>
                  {erroConfirmar}
                </p>
              )}
            </>
          ) : (
            <button className="btn-primary" onClick={handleEntrar}>
              Fazer login para confirmar
            </button>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px 20px 28px' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
          MatchPoint 🏐
        </p>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
          Organize suas peladas de futevôlei
        </p>
      </div>
    </div>
  )
}
