import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let auth = null

function getAdminAuth() {
  if (auth) return auth
  const chaveServico = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!chaveServico || chaveServico === 'ADICIONAR_DEPOIS') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY não configurada.')
  }
  const credenciais = JSON.parse(chaveServico)
  if (!getApps().length) {
    initializeApp({ credential: cert(credenciais) })
  }
  auth = getAuth()
  return auth
}

// Lê o header "Authorization: Bearer <idToken>" e retorna o usuário do
// Firebase decodificado, ou null se o token estiver ausente/inválido.
export async function verificarToken(req) {
  const cabecalho = req.headers.authorization || ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null
  if (!token) return null
  try {
    return await getAdminAuth().verifyIdToken(token)
  } catch (e) {
    console.error('Erro ao verificar token do Firebase:', e)
    return null
  }
}
