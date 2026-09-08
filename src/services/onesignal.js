const ONESIGNAL_APP_ID = 'e886018e-dc6d-4aa4-be0e-d87553b5c815'
const ONESIGNAL_REST_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY

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

// ATENÇÃO: isto chama a API REST do OneSignal diretamente do navegador usando a
// REST API Key. Essa chave é secreta — qualquer pessoa pode lê-la no bundle JS
// público e usá-la para mandar notificação para toda a base de usuários. Isso é
// aceitável apenas enquanto VITE_ONESIGNAL_REST_API_KEY continuar como placeholder.
// Antes de colocar a chave real, mova esta chamada para um backend/Cloud Function
// e faça o cliente chamar esse endpoint em vez da API do OneSignal diretamente.
export async function enviarNotificacao(titulo, mensagem, userIds) {
  if (!userIds || userIds.length === 0) return
  if (!ONESIGNAL_REST_API_KEY || ONESIGNAL_REST_API_KEY === 'ADICIONAR_DEPOIS') {
    console.warn('VITE_ONESIGNAL_REST_API_KEY não configurada — notificação não enviada.')
    return
  }
  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_aliases: { external_id: userIds },
        target_channel: 'push',
        headings: { en: titulo },
        contents: { en: mensagem },
      }),
    })
  } catch (e) {
    console.error('Erro ao enviar notificação OneSignal:', e)
  }
}
