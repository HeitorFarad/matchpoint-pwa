# Treino · Futevôlei + Academia

PWA para acompanhar o programa de 12 semanas (segunda, quarta e sexta): mostra o
treino do dia com as séries certas de cada fase, registra cargas e repetições,
sugere quando subir o peso e mostra a evolução.

- **Programa**: `src/data/programa.js` (exercícios, fases, semanas leves, regras)
- **Regras de progressão**: `src/lib/progressao.js`
- **Dados**: Firebase Auth + Firestore com cache offline
  (`usuarios/{uid}`, `usuarios/{uid}/sessoes`, `usuarios/{uid}/medidas`)
- **Regras do Firestore**: `firestore.rules`

## Rodar

```
npm install
cp .env.example .env   # preencher com as chaves do Firebase
npm run dev
```

Deploy na Vercel (`vercel.json`): `npm run build`, saída em `dist/`.
