// Programa de treino (treino_heitor_v2.pdf) + progressão de 12 semanas
// (progressao_12_semanas.pdf).
//
// Cada exercício tem `fases`: a prescrição das semanas 1–4, 5–8 e 9–12.
// `semanas` sobrescreve a fase em semanas específicas.
//
// tipo:
//   'faixa' → faixa de repetições (8–10, 10–12…): soma reps até bater o topo
//             em todas as séries, aí sobe o peso e volta ao mínimo
//   'fixa'  → repetição fixa com carga: completou todas as séries, sobe a carga
//   'livre' → explosivos, prevenção, core: progride pela fase, não pela carga
//
// registro (o que se anota em cada série): 'reps' | 'seg' | 'check'
// fase.carga = true → também anota o peso (kg)

export const TOTAL_SEMANAS = 12
export const SEMANAS_LEVES = [8, 12]
export const SEMANAS_MEDIDA = [1, 4, 8, 12]

export const FASES = [
  { n: 1, nome: 'Adaptação', semanas: '1–4', texto: 'Cargas em que sobram 2–3 repetições. Aprender os movimentos e acertar os pesos.' },
  { n: 2, nome: 'Progressão', semanas: '5–8', texto: 'Sobe a carga sempre que a regra mandar. A semana 8 é leve.' },
  { n: 3, nome: 'Intensificação', semanas: '9–12', texto: 'Cargas mais pesadas e explosivos mais exigentes. Semana 12 leve, com reteste.' },
]

const video = (termo) => `https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`

const faixa = (series, min, max) => [1, 2, 3].map(() => ({ series, min, max, carga: true }))
const fixa = (series, reps) => [1, 2, 3].map(() => ({ series, reps, carga: true }))

export const EXERCICIOS = {
  // ── ABERTURA ─────────────────────────────────────
  'cardio': {
    nome: 'Cardio leve', registro: 'check', tipo: 'livre',
    fases: [1, 2, 3].map(() => ({ series: 1, texto: '5 min · esteira ou bike' })),
    dicas: ['Ritmo em que dá para conversar, só para aquecer'],
  },
  'joelho-parede': {
    nome: 'Joelho na parede', registro: 'check', tipo: 'livre',
    fases: [1, 2, 3].map(() => ({ series: 1, texto: '10 repetições por lado' })),
    extra: { label: 'Distância do pé à parede', unidade: 'cm' },
    dicas: ['Calcanhar não sai do chão', 'Leva o joelho até tocar a parede e segura 2 s', 'Ficou fácil? Afasta o pé 1 cm da parede', 'Meta: tocar a parede com o pé a mais de 10 cm dela'],
    musculo: 'Tornozelo e panturrilha',
    video: video('knee to wall ankle mobility'),
  },
  'avanco-gluteo': {
    nome: 'Avanço com ativação de glúteo', registro: 'check', tipo: 'livre',
    fases: [1, 2, 3].map(() => ({ series: 1, texto: '2 × 40 s por lado' })),
    dicas: ['Joelho de trás no chão, joelho da frente a 90°', 'Contrai o glúteo de trás antes de levar o quadril à frente', 'Tronco reto, sem arquear a lombar'],
    musculo: 'Flexor do quadril (psoas)',
    video: video('half kneeling hip flexor stretch glute squeeze'),
  },
  'agachamento-assistido': {
    nome: 'Agachamento assistido', registro: 'check', tipo: 'livre',
    fases: [1, 2, 3].map(() => ({ series: 1, texto: '5 × 5 s no fundo' })),
    dicas: ['Segura em algo firme (rack ou máquina)', 'Calcanhar no chão o tempo todo', 'Meta: ficar de cócoras sem segurar em nada, com o calcanhar no chão'],
    video: video('assisted deep squat hold mobility'),
  },
  'band-lateral': {
    nome: 'Band: agachamento com saída lateral', registro: 'check', tipo: 'livre',
    fases: [1, 2, 3].map(() => ({ series: 1, texto: '1 × 15 passos por lado' })),
    dicas: ['Band logo acima dos joelhos', 'Meio agachamento o tempo todo', 'Joelhos empurrando a band para fora'],
    musculo: 'Glúteo médio',
    video: video('banded lateral walk squat'),
  },

  // ── SEGUNDA ──────────────────────────────────────
  'pogo-hops': {
    nome: 'Pogo hops', registro: 'check', tipo: 'livre', explosivo: true, descanso: 60,
    fases: [
      { series: 3, reps: 15 },
      { series: 3, reps: 20, texto: 'mais rápido' },
      { series: 3, reps: 10, porLado: 'perna', texto: 'em uma perna só' },
    ],
    dicas: ['Pernas quase retas, salta só com o tornozelo', 'Tempo mínimo no chão, como se o chão estivesse quente', 'Saltos baixos e rápidos, não altos'],
    musculo: 'Panturrilha e tendão de Aquiles',
    video: video('pogo hops plyometric'),
  },
  'salto-caixa': {
    nome: 'Salto na caixa', registro: 'check', tipo: 'livre', explosivo: true, descanso: 90,
    fases: [
      { series: 4, reps: 3, texto: 'caixa média' },
      { series: 4, reps: 3, texto: 'caixa mais alta se ainda cair macio' },
      { series: 4, reps: 3, nome: 'Drop jump', texto: 'desce de uma caixa baixa (~30 cm) e salta no instante em que toca o chão. Só se as aterrissagens estiverem firmes; se não, continua no salto na caixa' },
    ],
    extra: { label: 'Altura da caixa', unidade: 'cm' },
    dicas: ['Salto máximo, aterrissa suave em cima da caixa', 'Desce da caixa andando, nunca pulando', 'Escolhe uma altura em que você caia em pé, não agachado'],
    video: video('box jump technique'),
  },
  'leg-press': {
    nome: 'Leg press', registro: 'reps', tipo: 'fixa', descanso: 180, incremento: 10,
    fases: fixa(4, 5),
    dicas: ['Carga máxima com técnica', 'Desce controlado até 90° no joelho', 'Lombar colada no banco o tempo todo'],
    musculo: 'Quadríceps e glúteo',
    regra: 'Leg press: +5 a 10 kg por vez',
    video: video('leg press técnica'),
  },
  'bulgaro': {
    nome: 'Agachamento búlgaro com halteres', registro: 'reps', tipo: 'fixa', descanso: 120, incremento: 2, halter: true,
    fases: fixa(3, 6).map((f) => ({ ...f, porLado: 'perna' })),
    dicas: ['Pé de trás apoiado no banco', 'Joelho da frente alinhado com o pé', 'Desce reto e sobe empurrando o chão'],
    musculo: 'Quadríceps e glúteo',
    video: video('agachamento búlgaro halteres'),
  },
  'stiff': {
    nome: 'Stiff com halteres', registro: 'reps', tipo: 'fixa', descanso: 120, incremento: 2, halter: true,
    fases: fixa(3, 8),
    dicas: ['Joelhos levemente dobrados e fixos', 'Leva o quadril para trás com as costas retas', 'Halteres descem rentes às pernas até a canela'],
    musculo: 'Posterior de coxa',
    video: video('stiff com halteres'),
  },
  'remada-unilateral': {
    nome: 'Remada unilateral com halter', registro: 'reps', tipo: 'faixa', descanso: 90, incremento: 2, halter: true,
    fases: faixa(3, 8, 10).map((f) => ({ ...f, porLado: 'lado' })),
    dicas: ['Joelho e mão de apoio no banco', 'Puxa o halter em direção ao quadril', 'Tronco parado, sem girar'],
    obs: 'Banco ocupado? Faça remada no cabo ou na máquina.',
    musculo: 'Costas',
    video: video('remada unilateral halter'),
  },
  'puxada-pulley': {
    nome: 'Puxada no pulley', registro: 'reps', tipo: 'faixa', descanso: 90, incremento: 5,
    fases: faixa(3, 8, 10),
    dicas: ['Puxa a barra até o alto do peito', 'Peito para cima, sem jogar o tronco para trás', 'Sobe controlando até esticar os braços'],
    obs: 'Ocupado? Barra fixa assistida.',
    musculo: 'Costas (dorsal)',
    video: video('puxada frente pulley'),
  },

  // ── QUARTA ───────────────────────────────────────
  'supino-halteres': {
    nome: 'Supino com halteres', registro: 'reps', tipo: 'faixa', descanso: 120, incremento: 2, halter: true,
    fases: faixa(4, 8, 10),
    dicas: ['Desce em 2 s até sentir o alongamento do peito', 'Pés firmes no chão', 'Sobe sem bater os halteres'],
    musculo: 'Peitoral',
    video: video('supino reto halteres'),
  },
  'remada-cabo': {
    nome: 'Remada sentada no cabo', registro: 'reps', tipo: 'faixa', descanso: 120, incremento: 5,
    fases: faixa(4, 8, 10),
    dicas: ['Tronco parado e reto', 'Puxa o pegador até a barriga', 'Junta as escápulas no final'],
    obs: 'Ocupado? Remada na máquina ou com halter.',
    musculo: 'Costas',
    video: video('remada sentada cabo'),
  },
  'desenvolvimento': {
    nome: 'Desenvolvimento com halteres', registro: 'reps', tipo: 'faixa', descanso: 90, incremento: 2, halter: true,
    fases: faixa(3, 8, 10),
    dicas: ['Sentado, costas apoiadas', 'Começa com os halteres na altura das orelhas', 'Empurra para cima sem arquear a lombar'],
    musculo: 'Ombros',
    video: video('desenvolvimento halteres sentado'),
  },
  'elevacao-lateral': {
    nome: 'Elevação lateral', registro: 'reps', tipo: 'faixa', descanso: 60, incremento: 1, halter: true,
    fases: faixa(3, 12, 15),
    dicas: ['Sobe até a altura dos ombros', 'Cotovelos levemente dobrados', 'Peso moderado, sem embalo'],
    musculo: 'Ombro (deltoide lateral)',
    video: video('elevação lateral halteres'),
  },
  'rosca-direta': {
    nome: 'Rosca direta com halteres', registro: 'reps', tipo: 'faixa', descanso: 60, incremento: 2, halter: true,
    fases: faixa(3, 10, 12),
    dicas: ['Cotovelos colados ao corpo', 'Sem balançar o tronco', 'Desce até esticar o braço'],
    musculo: 'Bíceps',
    video: video('rosca direta halteres'),
  },
  'triceps-corda': {
    nome: 'Tríceps na corda', registro: 'reps', tipo: 'faixa', descanso: 60, incremento: 5,
    fases: faixa(3, 10, 12),
    dicas: ['Cotovelos fixos ao lado do corpo', 'Separa as pontas da corda embaixo', 'Volta controlando'],
    musculo: 'Tríceps',
    video: video('tríceps corda polia'),
  },
  'pallof': {
    nome: 'Pallof press', registro: 'reps', tipo: 'livre', descanso: 45,
    fases: [
      { series: 2, reps: 10, porLado: 'lado', carga: true, texto: 'segura 2 s' },
      { series: 2, reps: 10, porLado: 'lado', carga: true, texto: 'segura 4 s' },
      { series: 2, reps: 10, porLado: 'lado', carga: true, texto: 'mais carga, segura 4 s' },
    ],
    dicas: ['De lado para o cabo, na altura do peito', 'Empurra as mãos à frente e segura', 'Não deixa o tronco girar'],
    musculo: 'Core (anti-rotação)',
    video: video('pallof press'),
  },
  'dead-bug': {
    nome: 'Dead bug', registro: 'reps', tipo: 'livre', descanso: 45,
    fases: [
      { series: 2, reps: 8, porLado: 'lado' },
      { series: 2, reps: 10, porLado: 'lado' },
      { series: 2, reps: 8, porLado: 'lado', carga: true, texto: 'com halter leve nas mãos' },
    ],
    dicas: ['Lombar colada no chão o tempo todo', 'Estende braço e perna opostos ao mesmo tempo', 'Devagar, soltando o ar ao estender'],
    musculo: 'Abdômen (anti-extensão)',
    video: video('dead bug exercise'),
  },
  'prancha-lateral': {
    nome: 'Prancha lateral', registro: 'seg', tipo: 'livre', descanso: 45,
    fases: [
      { series: 2, seg: 30, porLado: 'lado' },
      { series: 2, seg: 40, porLado: 'lado' },
      { series: 2, seg: 30, porLado: 'lado', texto: 'com a perna de cima elevada' },
    ],
    dicas: ['Corpo reto da cabeça aos pés', 'Quadril alto, sem deixar cair', 'Cotovelo embaixo do ombro'],
    musculo: 'Oblíquos',
    video: video('prancha lateral'),
  },
  'carregada': {
    nome: 'Carregada unilateral', registro: 'check', tipo: 'livre', descanso: 60, incremento: 2, halter: true,
    fases: [
      { series: 2, metros: 20, porLado: 'lado', carga: true, texto: 'halter que mantém o tronco reto' },
      { series: 2, metros: 20, porLado: 'lado', carga: true, texto: 'sobe o halter a cada 2 semanas' },
      { series: 2, metros: 20, porLado: 'lado', carga: true, texto: 'continua subindo, sempre com o tronco reto' },
    ],
    dicas: ['Halter pesado em uma mão só', 'Tronco reto, sem inclinar para o lado', 'Passos normais, ombros nivelados'],
    musculo: 'Oblíquos (lado oposto ao halter)',
    video: video('suitcase carry'),
  },

  // ── SEXTA ────────────────────────────────────────
  'salto-lateral': {
    nome: 'Salto lateral', registro: 'check', tipo: 'livre', explosivo: true, descanso: 60,
    fases: [
      { series: 3, reps: 5, porLado: 'lado', texto: 'estabilizado: cai e trava 2 s' },
      { series: 4, reps: 5, porLado: 'lado', texto: '1 série estabilizada + 3 reativas' },
      { series: 4, reps: 5, porLado: 'lado', texto: '1 estabilizada + 3 reativas, saltando mais longe' },
    ],
    semanas: { 4: { series: 3, reps: 5, porLado: 'lado', texto: '1 série estabilizada + 2 reativas' } },
    dicas: ['Cai numa perna só', 'Joelho alinhado com o pé, nunca caindo para dentro', 'Na versão reativa, cai e já sai para o outro lado'],
    video: video('lateral bound stick landing'),
  },
  'nordica': {
    nome: 'Flexão nórdica', registro: 'reps', tipo: 'livre', descanso: 90,
    fases: [{ series: 3, reps: 4 }, { series: 3, reps: 5 }, { series: 3, reps: 6 }],
    semanas: { 1: { series: 2, reps: 4, texto: 'só 2 séries: o Nórdico deixa o posterior muito dolorido nas primeiras vezes' }, 2: { series: 2, reps: 4 } },
    dicas: ['Pés presos, corpo reto do joelho à cabeça', 'Desce o mais devagar possível', 'Usa as mãos para voltar'],
    obs: 'Evite na véspera do jogo mais puxado da semana.',
    musculo: 'Posterior de coxa',
    video: video('nordic hamstring curl'),
  },
  'hip-thrust': {
    nome: 'Hip thrust', registro: 'reps', tipo: 'fixa', descanso: 120, incremento: 5,
    fases: fixa(3, 8),
    dicas: ['Escápulas apoiadas no banco', 'Sobe até o quadril alinhar com o tronco', 'Pausa de 1 s no topo'],
    musculo: 'Glúteo',
    video: video('hip thrust'),
  },
  'copenhagen': {
    nome: 'Copenhagen', registro: 'reps', tipo: 'livre', descanso: 60,
    fases: [
      { series: 2, reps: 6, porLado: 'lado', texto: 'joelho apoiado no banco' },
      { series: 2, reps: 8, porLado: 'lado', texto: 'joelho apoiado' },
      { series: 2, reps: 6, porLado: 'lado', texto: 'pé apoiado (mais difícil)' },
    ],
    dicas: ['Corpo reto da cabeça ao joelho', 'Joelho de cima apertando o banco', 'Sobe e desce devagar, sem girar o tronco'],
    musculo: 'Adutor',
    video: video('copenhagen adductor plank'),
  },
  'step-down': {
    nome: 'Step-down excêntrico', registro: 'reps', tipo: 'livre', descanso: 60,
    fases: [
      { series: 2, reps: 8, porLado: 'perna', texto: 'sem peso' },
      { series: 2, reps: 10, porLado: 'perna', texto: 'sem peso' },
      { series: 2, reps: 8, porLado: 'perna', carga: true, texto: 'com halteres' },
    ],
    dicas: ['Step baixo, cerca de 20 cm', 'Desce em 3 s até o calcanhar quase tocar o chão', 'Joelho alinhado com o pé'],
    musculo: 'Quadríceps e tendão patelar',
    video: video('eccentric step down'),
  },
  'panturrilha': {
    nome: 'Panturrilha excêntrica unilateral', registro: 'reps', tipo: 'livre', descanso: 60,
    fases: [
      { series: 3, reps: 10, porLado: 'perna', texto: 'sem peso' },
      { series: 3, reps: 10, porLado: 'perna', carga: true, texto: 'com halter na mão' },
      { series: 3, reps: 12, porLado: 'perna', carga: true, texto: 'halter mais pesado' },
    ],
    dicas: ['Sobe com as duas pernas', 'Desce com uma só, em 3 a 4 s', 'Calcanhar termina abaixo da linha do step'],
    musculo: 'Panturrilha e tendão de Aquiles',
    video: video('eccentric calf raise single leg'),
  },
  'supino-inclinado': {
    nome: 'Supino inclinado com halteres', registro: 'reps', tipo: 'faixa', descanso: 90, incremento: 2, halter: true,
    fases: faixa(3, 8, 10),
    dicas: ['Banco a cerca de 30°', 'Desce controlando até a linha do peito', 'Sobe sem bater os halteres'],
    musculo: 'Peitoral superior',
    video: video('supino inclinado halteres'),
  },
  'puxada-neutra': {
    nome: 'Puxada com pegada neutra', registro: 'reps', tipo: 'fixa', descanso: 90, incremento: 5,
    fases: fixa(3, 10),
    dicas: ['Triângulo ou pegada com as palmas uma de frente para a outra', 'Puxa até o alto do peito', 'Sobe controlando'],
    musculo: 'Costas (dorsal)',
    video: video('puxada triângulo pegada neutra'),
  },
}

export const ABERTURA = ['cardio', 'joelho-parede', 'avanco-gluteo', 'agachamento-assistido', 'band-lateral']

export const DIAS = [
  {
    id: 'segunda', diaSemana: 1, nome: 'Segunda', titulo: 'Perna força + Costas',
    resumo: 'Saltos primeiro, com as pernas descansadas. Na força, descanso longo: qualidade antes de carga.',
    blocos: [
      { titulo: 'Explosivo', itens: ['pogo-hops', 'salto-caixa'] },
      { titulo: 'Força', itens: ['leg-press', 'bulgaro', 'stiff', 'remada-unilateral', 'puxada-pulley'] },
    ],
  },
  {
    id: 'quarta', diaSemana: 3, nome: 'Quarta', titulo: 'Superior completo + Core',
    resumo: 'Dia de hipertrofia de superior. O core vem no final, focado em estabilidade.',
    blocos: [
      { titulo: 'Superior', itens: ['supino-halteres', 'remada-cabo', 'desenvolvimento', 'elevacao-lateral', 'rosca-direta', 'triceps-corda'] },
      { titulo: 'Core: estabilidade', itens: ['pallof', 'dead-bug', 'prancha-lateral', 'carregada'] },
    ],
  },
  {
    id: 'sexta', diaSemana: 5, nome: 'Sexta', titulo: 'Potência + Prevenção + Superior',
    resumo: 'Saltos e Nórdico primeiro. Os fortalecimentos são sua prevenção para o futevôlei: não pule.',
    blocos: [
      { titulo: 'Potência', itens: ['salto-lateral'] },
      { titulo: 'Prevenção', itens: ['nordica', 'hip-thrust', 'copenhagen', 'step-down', 'panturrilha'] },
      { titulo: 'Superior', itens: ['supino-inclinado', 'puxada-neutra', 'elevacao-lateral'] },
    ],
  },
]

export function getDia(id) {
  return DIAS.find((d) => d.id === id)
}

export const REGRAS = [
  { titulo: 'Progressão', texto: 'Quando fizer o topo da faixa de repetições em todas as séries, aumente a carga na próxima vez.' },
  { titulo: 'Saltos', texto: 'Sempre com intenção máxima. Se a qualidade cair, pare a série.' },
  { titulo: 'Véspera de jogo', texto: 'Evite Nórdico e saltos no dia anterior ao jogo mais puxado da semana.' },
  { titulo: 'Aparelho ocupado', texto: 'Troque por um equivalente em vez de fazer superset: remada no cabo, na máquina ou com halter; puxada ou barra fixa assistida; leg press ou hack.' },
  { titulo: 'Semana leve (8 e 12)', texto: 'Mesma carga, metade das séries e metade dos saltos.' },
  { titulo: 'Quando segurar a progressão', texto: 'Repete a carga, ou antecipa a semana leve, se aparecer dor na articulação (dor no músculo é normal), salto piorando dois treinos seguidos, ou semana de sono ruim ou jogos muito puxados.' },
]
