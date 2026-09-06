// Dados mockados do MatchPoint — substituir por Firestore quando integrado

export const currentUser = {
  id: 'u1',
  name: 'Heitor',
  username: 'heitor',
  city: 'Vitória ES',
  level: 'Intermediário',
}

export const friends = [
  {
    id: 'f1',
    name: 'Rafael Lima',
    username: 'rafalima',
    level: 'Avançado',
    fixo: true,
    mutualFriends: 4,
  },
  {
    id: 'f2',
    name: 'Bruno Alves',
    username: 'brunoalves',
    level: 'Intermediário',
    fixo: true,
    mutualFriends: 2,
  },
  {
    id: 'f3',
    name: 'Marina Costa',
    username: 'marinacosta',
    level: 'Iniciante',
    fixo: false,
    mutualFriends: 6,
  },
  {
    id: 'f4',
    name: 'João Pedro',
    username: 'joaopedro',
    level: 'Intermediário',
    fixo: false,
    mutualFriends: 1,
  },
  {
    id: 'f5',
    name: 'Lucas Silva',
    username: 'lucassilva',
    level: 'Avançado',
    fixo: true,
    mutualFriends: 3,
  },
]

export const addFriendSuggestions = [
  { id: 's1', name: 'Carlos Souza', username: 'carloss' },
  { id: 's2', name: 'Ana Paula', username: 'anapaula' },
  { id: 's3', name: 'Pedro Costa', username: 'pedrocosta' },
]

export const friendRequests = [
  {
    id: 'r1',
    name: 'Marina Costa',
    username: 'marinacosta',
    mutualFriends: 6,
  },
  {
    id: 'r2',
    name: 'João Pedro',
    username: 'joaopedro',
    mutualFriends: 1,
  },
]

export const peladas = [
  {
    id: 'p1',
    nome: 'Arena Praia Quadra 2',
    local: 'Arena Praia Quadra 2',
    data: '12/09',
    horario: '18:00',
    organizador: 'Heitor',
    organizadorId: 'u1',
    vagas: 4,
    confirmados: [
      { id: 'u1', name: 'Heitor', organizador: true },
      { id: 'f1', name: 'Rafael Lima' },
      { id: 'f2', name: 'Bruno Alves' },
    ],
    pendentes: [{ id: 'f5', name: 'Lucas Silva' }],
    espera: 0,
    nivel: 'Intermediário',
  },
  {
    id: 'p2',
    nome: 'Praia do Leme',
    local: 'Praia do Leme',
    data: '13/09',
    horario: '17:30',
    organizador: 'Rafael Lima',
    organizadorId: 'f1',
    vagas: 4,
    confirmados: [
      { id: 'f1', name: 'Rafael Lima', organizador: true },
      { id: 'f2', name: 'Bruno Alves' },
      { id: 'f3', name: 'Marina Costa' },
      { id: 'u1', name: 'Heitor' },
    ],
    pendentes: [],
    espera: 2,
    nivel: 'Avançado',
  },
  {
    id: 'p3',
    nome: 'Beach Club Barra',
    local: 'Beach Club Barra',
    data: '14/09',
    horario: '19:00',
    organizador: 'Lucas Silva',
    organizadorId: 'f5',
    vagas: 6,
    confirmados: [{ id: 'f5', name: 'Lucas Silva', organizador: true }],
    pendentes: [{ id: 'f4', name: 'João Pedro' }],
    espera: 0,
    nivel: 'Aberto',
  },
]

export const treinos = [
  {
    id: 't1',
    nome: 'Treino da Praça',
    local: 'Praça do Mirante',
    dias: ['Seg', 'Qua'],
    inicio: '17:00',
    fim: '19:00',
    vagas: 6,
    confirmados: [
      { id: 'u1', name: 'Heitor', tipo: 'Fixo', status: 'confirmou' },
      { id: 'f1', name: 'Rafael Lima', tipo: 'Fixo', status: 'confirmou' },
      { id: 'f2', name: 'Bruno Alves', tipo: 'Fixo', status: 'confirmou' },
      { id: 'f5', name: 'Lucas Silva', tipo: 'Convidado', status: 'confirmou' },
    ],
    cancelaram: [{ id: 'f3', name: 'Marina Costa', horario: '08:12' }],
    aguardando: [{ id: 'f4', name: 'João Pedro' }],
  },
]

export const historico = [
  { id: 'h1', nome: 'Arena Praia Quadra 2', data: '05/09', status: 'Confirmado' },
  { id: 'h2', nome: 'Treino da Praça', data: '03/09', status: 'Confirmado' },
  { id: 'h3', nome: 'Praia do Canto', data: '30/08', status: 'Cancelou' },
  { id: 'h4', nome: 'Beach Club Barra', data: '27/08', status: 'Confirmado' },
  { id: 'h5', nome: 'Treino da Praça', data: '25/08', status: 'Confirmado' },
]

export function getPeladaById(id) {
  return peladas.find((p) => p.id === id)
}

export function getTreinoById(id) {
  return treinos.find((t) => t.id === id)
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
