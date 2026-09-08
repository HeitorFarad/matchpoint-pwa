import { createPublicKey, verify as verificarAssinatura } from 'node:crypto'

// Não secreto — mesmo valor de VITE_FIREBASE_PROJECT_ID.
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'matchpoint-pwa'
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

let certsCache = null
let certsCacheExpiraEm = 0

function base64UrlDecode(valor) {
  return Buffer.from(valor.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

async function buscarCertificadosGoogle() {
  if (certsCache && Date.now() < certsCacheExpiraEm) return certsCache
  const resposta = await fetch(GOOGLE_CERTS_URL)
  if (!resposta.ok) throw new Error('Falha ao buscar certificados do Google.')
  certsCache = await resposta.json()
  certsCacheExpiraEm = Date.now() + 60 * 60 * 1000 // cache 1h — mesmas chaves valem por horas
  return certsCache
}

// Verifica um ID token do Firebase Auth (assinatura RS256 + claims) sem
// depender do firebase-admin — esse pacote puxa o "jose" (ESM-only) e quebra
// o bundler Node da Vercel com ERR_REQUIRE_ESM. Usa só node:crypto, nativo do
// runtime, então não tem esse conflito.
export async function verificarToken(req) {
  const cabecalho = req.headers.authorization || ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null
  if (!token) return null

  const partes = token.split('.')
  if (partes.length !== 3) return null
  const [headerB64, payloadB64, assinaturaB64] = partes

  let header
  let payload
  try {
    header = JSON.parse(base64UrlDecode(headerB64).toString('utf8'))
    payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8'))
  } catch {
    return null
  }

  if (header.alg !== 'RS256') return null
  if (payload.aud !== FIREBASE_PROJECT_ID) return null
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null
  if (!payload.sub) return null
  if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null
  if (typeof payload.iat !== 'number' || payload.iat * 1000 > Date.now() + 60_000) return null

  try {
    const certs = await buscarCertificadosGoogle()
    const certPem = certs[header.kid]
    if (!certPem) return null

    const publicKey = createPublicKey(certPem)
    const dadosAssinados = Buffer.from(`${headerB64}.${payloadB64}`)
    const assinatura = base64UrlDecode(assinaturaB64)
    const valido = verificarAssinatura('RSA-SHA256', dadosAssinados, publicKey, assinatura)
    if (!valido) return null
  } catch (e) {
    console.error('Erro ao verificar assinatura do token:', e)
    return null
  }

  return { uid: payload.sub, email: payload.email }
}
