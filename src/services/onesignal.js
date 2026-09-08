import { auth } from '../firebase'

const ONESIGNAL_APP_ID = 'e886018e-dc6d-4aa4-be0e-d87553b5c815'

export function initOneSignal() {
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: { enable: false },
    })
  })
}

// No iOS (PWA instalada na tela de início, iOS 16.4+), o navegador só mostra o
// prompt de permissão quando a chamada está associada a um gesto direto do
// usuário (clique). Por isso este helper é usado tanto automaticamente após o
// login (best-effort, pode ser ignorado silenciosamente pelo navegador) quanto
// a partir do botão "Ativar notificações" em Perfil.jsx, chamado direto no
// onClick, sem await antes — esse é o caminho que realmente funciona no iOS.
export function solicitarPermissaoNotificacao() {
  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission()
        resolve(true)
      } catch (e) {
        console.error('Erro ao solicitar permissão de notificações:', e)
        resolve(false)
      }
    })
  })
}

export function salvarTokenUsuario(userId) {
  if (!userId) return
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.login(userId)
    } catch (e) {
      console.error('Erro ao associar dispositivo ao usuário no OneSignal:', e)
    }
  })
}

// Passa pela função serverless em api/enviar-notificacao.js em vez de chamar a
// API do OneSignal direto do navegador — a REST API Key fica só no servidor,
// nunca no bundle público do cliente. O endpoint exige um usuário do Firebase
// autenticado, então manda o ID token no header Authorization.
export async function enviarNotificacao(titulo, mensagem, userIds) {
  if (!userIds || userIds.length === 0) return
  const usuarioAtual = auth.currentUser
  if (!usuarioAtual) {
    console.warn('Usuário não autenticado — notificação não enviada.')
    return
  }
  try {
    const idToken = await usuarioAtual.getIdToken()
    const resposta = await fetch('/api/enviar-notificacao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ titulo, mensagem, userIds }),
    })
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}))
      console.error('Erro ao enviar notificação:', erro)
    }
  } catch (e) {
    console.error('Erro ao enviar notificação OneSignal:', e)
  }
}
