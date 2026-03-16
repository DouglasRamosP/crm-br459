export const filters = [
  "Periodo: 30 dias",
  "Vendedor: todos",
  "Tipo: demanda ativa",
  "Modelo: pesados",
  "Regiao: Sudeste",
  "Status: operacao completa",
]

export const spotlightKpis = [
  {
    title: "Negocios ativos",
    value: "24",
    change: "+18%",
    tone: "amber",
    description: "Demandas acompanhadas no funil comercial",
  },
  {
    title: "Lucro real",
    value: "R$ 482 mil",
    change: "+9,4%",
    tone: "emerald",
    description: "Receita menos aquisicao, servicos e despesas",
  },
  {
    title: "Capital parado",
    value: "R$ 1,36 mi",
    change: "11 veiculos > 45 dias",
    tone: "slate",
    description: "Estoque que exige giro, revisao de preco ou ativacao comercial",
  },
  {
    title: "Demandas sem produto",
    value: "9",
    change: "3 criticas",
    tone: "rose",
    description: "Oportunidades validas ainda sem caminhao vinculado",
  },
]

export const monthlyPerformance = [
  { label: "Out", sales: 42, profit: 24 },
  { label: "Nov", sales: 48, profit: 27 },
  { label: "Dez", sales: 44, profit: 22 },
  { label: "Jan", sales: 53, profit: 30 },
  { label: "Fev", sales: 59, profit: 35 },
  { label: "Mar", sales: 63, profit: 38 },
]

export const funnelStages = [
  { label: "Interesse", count: 8, share: 100 },
  { label: "Busca no mercado", count: 6, share: 75 },
  { label: "Proposta", count: 5, share: 63 },
  { label: "Negociacao", count: 3, share: 38 },
  { label: "Ganhou", count: 2, share: 25 },
]

export const stockStatus = [
  { label: "Disponivel", count: 17, share: 52, tone: "amber" },
  { label: "Em negociacao", count: 9, share: 28, tone: "sky" },
  { label: "Reservado", count: 4, share: 12, tone: "emerald" },
  { label: "Vendido", count: 3, share: 8, tone: "slate" },
]

export const strategicAlerts = [
  {
    level: "Critico",
    title: "Demanda recorrente por FH 540 sem estoque aderente",
    detail:
      "Quatro negocios estao procurando o mesmo perfil ha mais de 7 dias.",
    action: "Priorizar sourcing com fornecedores premium.",
  },
  {
    level: "Atencao",
    title: "Lucro real caiu no segmento seminovo 6x2",
    detail:
      "Descontos e custo de regularizacao consumiram 6,2 p.p. de margem.",
    action: "Revisar politica comercial e checklist de entrega.",
  },
  {
    level: "Oportunidade",
    title: "Scania R450 encontrado abaixo da media de mercado",
    detail:
      "Preco 8% inferior ao benchmark e aderente a uma demanda futura.",
    action: "Acionar fornecedor e reservar janela de compra.",
  },
]

export const activeDeals = [
  {
    account: "Transvale Logistica",
    contact: "Juliana Prado",
    demandType: "Compra imediata",
    requested: "Volvo FH 540 6x4, 2021+",
    budget: "R$ 690 mil",
    daysOpen: 3,
    priority: "Alta",
    status: "Busca no mercado",
    productStatus: "Sem produto",
    nextStep: "Mapear 3 opcoes ate amanha",
  },
  {
    account: "Cafe Mantiqueira",
    contact: "Leandro Furtado",
    demandType: "Futura",
    requested: "Bitrem para safra em 30 dias",
    budget: "R$ 540 mil",
    daysOpen: 11,
    priority: "Media",
    status: "Proposta",
    productStatus: "Produto sinalizado",
    nextStep: "Validar laudo e custo de transporte",
  },
  {
    account: "Rota Sul Transportes",
    contact: "Marcos Teles",
    demandType: "Busca no mercado",
    requested: "Scania R450, teto alto, unico dono",
    budget: "R$ 610 mil",
    daysOpen: 8,
    priority: "Alta",
    status: "Negociacao",
    productStatus: "Em avaliacao",
    nextStep: "Fechar proposta com fornecedor Z",
  },
  {
    account: "Pedreira Horizonte",
    contact: "Aline Costa",
    demandType: "Compra imediata",
    requested: "Cacamba 8x4 com baixa quilometragem",
    budget: "R$ 780 mil",
    daysOpen: 5,
    priority: "Critica",
    status: "Interesse",
    productStatus: "Sem produto",
    nextStep: "Acionar carteira de parceiros do Centro-Oeste",
  },
]

export const stockInsights = [
  {
    product: "Volvo VM 270 2020",
    daysInStock: 63,
    capital: "R$ 312 mil",
    margin: "8,1%",
    recommendation: "Revisar preco e disparar campanha para compradores regionais",
  },
  {
    product: "DAF XF 480 2021",
    daysInStock: 18,
    capital: "R$ 455 mil",
    margin: "14,7%",
    recommendation: "Manter preco e priorizar demandas de longa rota",
  },
  {
    product: "Scania G 440 2019",
    daysInStock: 49,
    capital: "R$ 368 mil",
    margin: "6,4%",
    recommendation: "Checar custo de reforma antes de nova oferta",
  },
]

export const peopleInsights = [
  {
    name: "Juliana Prado",
    role: "Compradora + Financeiro",
    company: "Transvale Logistica",
    region: "Pouso Alegre/MG",
    preference: "WhatsApp e retorno em ate 1h",
    signal: "Busca recorrente por cavalos pesados 6x4",
  },
  {
    name: "Rafael Abreu",
    role: "Fornecedor",
    company: "Rodobras Seminovos",
    region: "Goiania/GO",
    preference: "Ligacao comercial no fim da tarde",
    signal: "Melhor custo-beneficio em linha pesada premium",
  },
  {
    name: "Aline Costa",
    role: "Decisora tecnica",
    company: "Pedreira Horizonte",
    region: "Belo Horizonte/MG",
    preference: "Email com laudo e historico de manutencao",
    signal: "Valoriza procedencia e baixa quilometragem",
  },
]

export const companyEcosystem = [
  {
    name: "Transvale Logistica",
    type: "Cliente PJ",
    activeDeals: 3,
    linkedPeople: 4,
    lastMove: "Cotacao aberta para FH 540",
  },
  {
    name: "Rodobras Seminovos",
    type: "Fornecedor",
    activeDeals: 2,
    linkedPeople: 2,
    lastMove: "Oferta abaixo da media para Scania R450",
  },
  {
    name: "Grupo Estrada Forte",
    type: "Parceiro",
    activeDeals: 1,
    linkedPeople: 3,
    lastMove: "Indicacao de comprador para carga seca",
  },
]

export const servicesOverview = [
  {
    name: "Regularizacao documental",
    link: "Negocio Transvale + FH 540",
    provider: "Despachante Serra Azul",
    cost: "R$ 4.800",
    impact: "Reduz margem em 0,7 p.p.",
    status: "Em andamento",
  },
  {
    name: "Vistoria cautelar",
    link: "Scania R450 em avaliacao",
    provider: "CheckTruck",
    cost: "R$ 1.350",
    impact: "Necessario para liberar proposta",
    status: "Agendado",
  },
  {
    name: "Transporte entre patios",
    link: "Estoque + DAF XF 480",
    provider: "Rota Express",
    cost: "R$ 3.900",
    impact: "Considerado no lucro real",
    status: "Concluido",
  },
]

export const aiInsights = [
  "Ha 6 negocios ativos pedindo modelos que nao existem hoje no estoque.",
  "O estoque ideal para o proximo ciclo aponta maior exposicao em 6x4 premium.",
  "Fornecedor Rodobras esta 5% abaixo da media nas ultimas tres ofertas aderentes.",
  "Dois produtos acima de 45 dias precisam revisao de preco para liberar capital.",
]

export const businessPrinciples = [
  "Negocio nasce da demanda e pode existir sem produto.",
  "Pessoa e identidade unica com papeis dinamicos e acumulaveis.",
  "Empresa concentra historico, pessoas e multiplos negocios.",
  "Servico e despesa entram no calculo da margem real.",
  "Alertas devem conectar demanda, oportunidade e produto.",
]
