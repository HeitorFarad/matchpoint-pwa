import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById('root'))

function Falha({ titulo, detalhe }) {
  return (
    <main className="app-content">
      <div className="aviso red">
        <b>{titulo}</b>
        <br />
        {detalhe}
      </div>
    </main>
  )
}

// Sem as variáveis VITE_FIREBASE_* o Firebase quebra ao iniciar e a tela
// fica branca; melhor dizer o que falta. App é importado depois da checagem
// porque firebase.js inicializa no import.
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  root.render(
    <Falha
      titulo="Configuração do Firebase ausente"
      detalhe="As variáveis VITE_FIREBASE_* não estavam definidas neste build. Na Vercel: Settings → Environment Variables → marque o ambiente deste deploy (Preview ou Production) e faça um novo deploy."
    />,
  )
} else {
  import('./App.jsx')
    .then(({ default: App }) => {
      root.render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    })
    .catch((e) => {
      console.error(e)
      root.render(<Falha titulo="Erro ao iniciar o app" detalhe={String(e?.message || e)} />)
    })
}
