# Plano: MatchPoint → app de treino da academia

Status: **pausado** (aguardando aprovação). Branch `treino-academia`; a `main` continua com o MatchPoint original intacto.

## Objetivo
App (PWA, abre no celular como app) para acessar na academia e ver o treino do dia, com base em
`treino_heitor_v2.pdf` (exercícios) e `progressao_12_semanas.pdf` (progressão de 12 semanas).

## O que já foi feito nesta branch
- Removido o que era só de peladas: páginas (Home, Pelada, Convite, Amigos, Pendências, Perfil...),
  `services/firestore.js`, OneSignal (push), `api/` (função da Vercel), `data/mock.js`, componentes
  `Avatar`, `Badge`, `Card`, `InviteFriendsModal`, `ParticipanteModal`.
- Criado `src/data/programa.js`: o programa inteiro em dados — abertura, segunda, quarta, sexta;
  séries/reps/descanso/dicas; prescrição por fase (sem 1–4, 5–8, 9–12) e exceções por semana
  (nórdica sem 1–2, salto lateral sem 4); regras gerais.

## O que é preservado do projeto antigo
- Estrutura React + Vite + `vite-plugin-pwa` (instalável, funciona offline)
- Deploy na Vercel (`vercel.json`)
- Firebase: `firebase.js`, login Google/e-mail (`AuthContext`) — só se for registrar treinos
- Componentes: `BottomNav`, `Modal`, `PageHeader`, `Toast`
- `global.css` (variáveis, botões, campos, listas, modal, barra inferior)

## Próximos passos (em ordem)
1. `src/lib/progressao.js`: semana atual (1–12) a partir da data de início, fase, semana leve
   (8 e 12: metade das séries; explosivos também metade dos saltos), prescrição da semana.
2. Telas para **ver o treino** (sem login, sem banco):
   - Hoje: semana X de 12, fase, treino do dia (seg/qua/sex) e atalhos para os outros dias
   - Dia: abertura + blocos de exercícios com séries × reps da semana, descanso, dicas, link de vídeo
   - Regras e progressão
3. Opcional — **registrar treino**: anotar carga/reps por série, timer de descanso, sugestão de carga
   (faixa: bateu o topo em todas → próximo peso; fixa: completou → +carga), histórico, gráfico de
   evolução e medidas das semanas 1, 4, 8 e 12. Usa Firebase (Firestore em
   `usuarios/{uid}/sessoes` e `usuarios/{uid}/medidas`, exige regra nova no Firestore).
4. Ajustar nome/ícone/cores do PWA no `vite.config.js` e `index.html`; remover script do OneSignal.
