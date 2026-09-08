import { verificarToken } from './_firebaseAdmin.js'

// Vercel serverless function — mantém a REST API Key do OneSignal só no
// servidor. Nunca leia essa chave via VITE_* (isso a colocaria no bundle
// público do cliente); use process.env.ONESIGNAL_REST_API_KEY, configurada
// nas variáveis de ambiente do projeto no dashboard da Vercel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  let usuario
  try {
    usuario = await verificarToken(req)
  } catch (e) {
    console.error('Erro ao configurar verificação de token do Firebase:', e)
    res.status(500).json({ error: 'Autenticação não configurada no servidor.' })
    return
  }
  if (!usuario) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  const { titulo, mensagem, userIds } = req.body || {}

  if (!titulo || !mensagem || !Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({ error: 'titulo, mensagem e userIds são obrigatórios' })
    return
  }

  const restApiKey = process.env.ONESIGNAL_REST_API_KEY
  const appId = process.env.ONESIGNAL_APP_ID || 'e886018e-dc6d-4aa4-be0e-d87553b5c815'

  if (!restApiKey) {
    console.error('ONESIGNAL_REST_API_KEY não configurada no servidor.')
    res.status(500).json({ error: 'Notificações não configuradas no servidor.' })
    return
  }

  try {
    const resposta = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_aliases: { external_id: userIds },
        target_channel: 'push',
        headings: { en: titulo },
        contents: { en: mensagem },
      }),
    })

    const dados = await resposta.json().catch(() => ({}))

    if (!resposta.ok) {
      console.error('Erro do OneSignal:', dados)
      res.status(resposta.status).json({ error: 'Falha ao enviar notificação.' })
      return
    }

    res.status(200).json({ ok: true, id: dados.id })
  } catch (e) {
    console.error('Erro ao enviar notificação OneSignal:', e)
    res.status(500).json({ error: 'Erro ao enviar notificação.' })
  }
}
