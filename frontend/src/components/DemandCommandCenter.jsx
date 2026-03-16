import {
  ArrowPathIcon,
  BanknotesIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid"
import { useEffect, useEffectEvent, useState } from "react"

import { aiInsights, businessPrinciples, peopleInsights } from "../constants/businessData"
import { listCompanies } from "../services/companies"
import { listDeals } from "../services/deals"
import { listPeople } from "../services/people"
import { listProducts } from "../services/products"
import { listServices } from "../services/serviceRecords"
import {
  buildSalesTimeline,
  dashboardPeriodOptions,
  filterItemsByRange,
  formatDashboardRangeLabel,
  formatDateInput,
  resolveDashboardRange,
} from "../utils/dashboardPeriods"
import Button from "./Button"
import Companies from "./Companies.jsx"
import Deals from "./Deals.jsx"
import People from "./People.jsx"
import Products from "./Products.jsx"
import ServicesModule from "./ServicesModule.jsx"

const toneMap = {
  amber: {
    card: "border-amber-200 bg-amber-50/80",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    text: "text-amber-700",
  },
  emerald: {
    card: "border-emerald-200 bg-emerald-50/80",
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
    text: "text-emerald-700",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/80",
    badge: "bg-rose-100 text-rose-700",
    bar: "bg-rose-500",
    text: "text-rose-700",
  },
  sky: {
    card: "border-sky-200 bg-sky-50/80",
    badge: "bg-sky-100 text-sky-700",
    bar: "bg-sky-500",
    text: "text-sky-700",
  },
  slate: {
    card: "border-slate-200 bg-slate-50/80",
    badge: "bg-slate-200 text-slate-700",
    bar: "bg-slate-500",
    text: "text-slate-700",
  },
}

const viewMeta = {
  dashboard: {
    eyebrow: "Dashboard executivo",
    title: "Central de comando da operacao",
    description:
      "Leitura rapida do funil, margem real e sinais que exigem acao comercial.",
  },
  negocios: {
    eyebrow: "Modulo de negocios",
    title: "Oportunidades nascem da demanda",
    description:
      "O produto entra quando fizer sentido. O objetivo aqui e mover demandas pelo funil sem travar o cadastro.",
  },
  estoque: {
    eyebrow: "Modulo de estoque",
    title: "Estoque como resposta estrategica",
    description:
      "Cada caminhao precisa ser tratado como capital em movimento, com alerta para parada e apoio a giro.",
  },
  pessoas: {
    eyebrow: "Modulo de pessoas",
    title: "Identidade unica com papeis dinamicos",
    description:
      "Cada pessoa acumula contexto comercial, tecnico e financeiro sem duplicar cadastro.",
  },
  empresas: {
    eyebrow: "Modulo de empresas",
    title: "Historico centralizado por organizacao",
    description:
      "Clientes PJ, parceiros e fornecedores compartilham uma visao unica com pessoas e negocios ligados.",
  },
  servicos: {
    eyebrow: "Modulo de servicos",
    title: "Custos operacionais que afetam a margem",
    description:
      "Servico nao e detalhe administrativo: ele altera lucro real e decisao comercial.",
  },
  inteligencia: {
    eyebrow: "Modulo de inteligencia",
    title: "IA, alertas e recomendacoes acionaveis",
    description:
      "A inteligencia precisa conectar demanda, oportunidade, produto, fornecedor e risco de margem.",
  },
}

const sectionIcons = {
  dashboard: ChartBarIcon,
  negocios: BriefcaseIcon,
  estoque: TruckIcon,
  pessoas: UserGroupIcon,
  empresas: BuildingOffice2Icon,
  servicos: WrenchScrewdriverIcon,
  inteligencia: SparklesIcon,
}

const funnelOrder = [
  "Interesse",
  "Busca no mercado",
  "Proposta",
  "Negociacao",
  "Ganhou",
  "Perdeu",
]

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)

const parseMoney = (value) => {
  if (typeof value === "number") return value
  if (!value) return 0

  const text = String(value).trim().toLowerCase()
  const multiplier = text.includes("mi") ? 1000000 : text.includes("mil") ? 1000 : 1
  const raw = text.replace(/[^\d,.-]/g, "")

  if (!raw) return 0

  let normalized = raw

  if (raw.includes(",")) {
    normalized = raw.replace(/\./g, "").replace(",", ".")
  } else if ((raw.match(/\./g) || []).length > 1) {
    normalized = raw.replace(/\./g, "")
  } else if (multiplier > 1 && raw.includes(".")) {
    normalized = raw.replace(/\./g, "")
  }

  const parsed = Number.parseFloat(normalized)
  return Number.isNaN(parsed) ? 0 : parsed * multiplier
}

const getResourceDate = (item) => {
  const date = item?.dataNegocio ?? item?.createdAt
  const parsed = date ? new Date(date) : new Date()
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const getProductServiceCost = (product, services = []) =>
  services
    .filter(
      (service) =>
        service.productId === product.id || (product.serviceIds || []).includes(service.id)
    )
    .reduce((sum, service) => sum + parseMoney(service.custoValor ?? service.custo), 0)

const getProductTotalCost = (product, services = []) =>
  parseMoney(product.valorAquisicao || product.capital) +
  getProductServiceCost(product, services)

const getProductDays = (product) => {
  const date = product?.dataEntrada ?? product?.createdAt
  const parsed = date ? new Date(date) : new Date()

  if (Number.isNaN(parsed.getTime())) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)

  return Math.max(0, Math.floor((today - parsed) / 86400000))
}

const buildFunnelStages = (deals) => {
  const total = deals.length || 1

  return funnelOrder.map((label) => {
    const count = deals.filter((deal) => deal.status === label).length

    return {
      label,
      count,
      share: Math.round((count / total) * 100),
      tone:
        label === "Ganhou"
          ? "emerald"
          : label === "Perdeu"
            ? "rose"
            : "amber",
    }
  })
}

const buildSpotlightKpis = ({ companies, deals, products, people, services }) => {
  const stockCapital = products.reduce(
    (sum, product) => sum + getProductTotalCost(product, services),
    0
  )
  const openServices = services.filter((service) => service.status !== "Concluido")
  const activeDeals = deals.filter((deal) => !["Ganhou", "Perdeu"].includes(deal.status))
  const wonSales = deals.filter(
    (deal) => deal.tipoDemanda === "Compra" && deal.status === "Ganhou"
  )

  return [
    {
      title: "Negocios ativos",
      value: String(activeDeals.length),
      change: `${deals.filter((deal) => deal.tipoDemanda === "Venda").length} oportunidades de compra`,
      tone: "amber",
      description: "Demandas e avaliacoes em aberto acompanhadas em tempo real.",
    },
    {
      title: "Capital em estoque",
      value: formatCurrency(stockCapital),
      change: `${products.filter((product) => product.status === "Disponivel").length} disponiveis`,
      tone: "emerald",
      description: "Soma do custo real dos produtos, incluindo servicos atrelados.",
    },
    {
      title: "Pessoas no ecossistema",
      value: String(people.length),
      change: `${companies.length} empresas`,
      tone: "sky",
      description: "Relacionamentos ativos ligados a empresas, compra, servico e fornecimento.",
    },
    {
      title: "Lucro realizado",
      value: formatCurrency(
        wonSales.reduce((sum, deal) => sum + parseMoney(deal.lucroValor ?? deal.lucroReal), 0)
      ),
      change: `${wonSales.length} vendas ganhas`,
      tone: wonSales.length ? "emerald" : "slate",
      description: "Resultado das vendas comerciais fechadas no periodo monitorado.",
    },
    {
      title: "Servicos abertos",
      value: String(openServices.length),
      change: formatCurrency(
        openServices.reduce((sum, service) => sum + parseMoney(service.custoValor ?? service.custo), 0)
      ),
      tone: openServices.length ? "rose" : "slate",
      description: "Prestacoes ainda em andamento ou agendadas que podem afetar a margem.",
    },
  ]
}
const buildStrategicAlerts = ({ deals, products, services, companies }) => {
  const alerts = []
  const dealsWithoutProduct = deals.filter(
    (deal) =>
      deal.tipoDemanda === "Compra" &&
      !["Ganhou", "Perdeu"].includes(deal.status) &&
      !deal.productId
  )
  const longStandingProducts = products.filter((product) => getProductDays(product) > 45)
  const openServices = services.filter((service) => service.status !== "Concluido")
  const acquisitionLeads = deals.filter(
    (deal) => deal.tipoDemanda === "Venda" && !["Ganhou", "Perdeu"].includes(deal.status)
  )

  if (dealsWithoutProduct.length) {
    alerts.push({
      level: "Critico",
      title: `${dealsWithoutProduct.length} negocios de compra seguem sem produto em estoque`,
      detail: `Demandas abertas em ${new Set(dealsWithoutProduct.map((deal) => deal.empresa)).size} empresas ainda dependem de sourcing ou entrada de ativo.`,
      action: "Priorizar busca de mercado e vincular produtos aderentes.",
    })
  }

  if (longStandingProducts.length) {
    const mostDelayed = longStandingProducts.sort((a, b) => getProductDays(b) - getProductDays(a))[0]

    alerts.push({
      level: "Atencao",
      title: `${longStandingProducts.length} produtos estao acima de 45 dias em estoque`,
      detail: `O item mais parado e ${mostDelayed.modelo}, com ${getProductDays(mostDelayed)} dias em patio.`,
      action: "Revisar preco e acionar carteira de compradores aderentes.",
    })
  }

  if (openServices.length) {
    alerts.push({
      level: "Operacao",
      title: `${openServices.length} servicos ainda estao impactando a margem`,
      detail: `Custos abertos somam ${formatCurrency(openServices.reduce((sum, service) => sum + parseMoney(service.custoValor ?? service.custo), 0))}.`,
      action: "Acompanhar conclusao e refletir esses custos nas negociacoes abertas.",
    })
  }

  if (acquisitionLeads.length) {
    alerts.push({
      level: "Compra",
      title: `${acquisitionLeads.length} oportunidades de compra aguardam avaliacao`,
      detail: "Essas entradas podem virar estoque orientado por demanda se a margem prevista se confirmar.",
      action: "Comparar valor pedido pelo cliente com a revenda estimada e custo de preparacao.",
    })
  }

  if (!alerts.length) {
    alerts.push({
      level: "Visao geral",
      title: `${companies.length} empresas e ${deals.length} negocios monitorados`,
      detail: "Nao ha alertas criticos neste momento com base nas colecoes atuais do json-server.",
      action: "Manter rotina de cadastro e revisao para enriquecer o painel.",
    })
  }

  return alerts.slice(0, 4)
}
const SectionCard = ({ eyebrow, title, description, children }) => (
  <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
    </div>
    {children}
  </section>
)

const KpiCard = ({ item }) => {
  const tone = toneMap[item.tone] ?? toneMap.slate

  return (
    <article className={`rounded-[24px] border p-5 shadow-sm ${tone.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{item.title}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
          {item.change}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
    </article>
  )
}

const ProgressList = ({ items, suffix = "" }) => (
  <div className="space-y-4">
    {items.map((item) => {
      const tone = toneMap[item.tone] ?? toneMap.amber

      return (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-800">{item.label}</p>
              <p className="text-sm text-slate-500">{item.count} registros</p>
            </div>
            <span className={`text-sm font-semibold ${tone.text}`}>{item.share}{suffix}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className={`h-2 rounded-full ${tone.bar}`} style={{ width: `${item.share}%` }} />
          </div>
        </div>
      )
    })}
  </div>
)

const AlertStack = ({ alerts }) => (
  <div className="space-y-4">
    {alerts.map((alert) => (
      <article key={alert.title} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-rose-100 p-2 text-rose-600">
            <ExclamationTriangleIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{alert.level}</p>
            <h4 className="mt-2 font-semibold text-slate-900">{alert.title}</h4>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{alert.detail}</p>
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700">Proxima acao: {alert.action}</p>
      </article>
    ))}
  </div>
)

const QuarterlySummaryCard = ({ label, value, detail, tone = "slate" }) => {
  const colors = toneMap[tone] ?? toneMap.slate

  return (
    <article className={`rounded-3xl border p-4 ${colors.card}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  )
}

const SalesPerformanceChart = ({ months }) => (
  <div className="grid gap-4 lg:grid-cols-3">
    {months.map((month) => (
      <article key={month.key} className="rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{month.label}</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">Performance mensal</h4>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {month.deals.length} negocios
          </span>
        </div>

        <div className="mt-6 flex h-44 items-end justify-between gap-4 rounded-[24px] bg-white/80 px-4 py-4">
          {[
            { label: "Vendas", value: month.wins, height: month.winHeight, color: "bg-emerald-500" },
            { label: "Perdidas", value: month.losses, height: month.lossHeight, color: "bg-rose-500" },
            { label: "Produtos", value: month.negotiatedProducts, height: month.productHeight, color: "bg-amber-500" },
          ].map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center justify-end gap-3">
              <span className="text-sm font-semibold text-slate-700">{bar.value}</span>
              <div className="flex h-28 w-full items-end rounded-full bg-slate-100 px-2 py-2">
                <div className={`w-full rounded-full ${bar.color}`} style={{ height: `${bar.height}%` }} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{bar.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lucro do mes</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(month.profit)}</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ticket fechado</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{month.wins ? formatCurrency(month.profit / month.wins) : formatCurrency(0)}</p>
          </div>
        </div>
      </article>
    ))}
  </div>
)

const WonDealsTable = ({ deals }) => {
  if (!deals.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Ainda nao existem vendas ganhas no periodo selecionado.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Mes</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Produto negociado</th>
            <th className="px-4 py-3">Venda</th>
            <th className="px-4 py-3">Lucro real</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {deals.map((deal) => (
            <tr key={deal.id}>
              <td className="px-4 py-4 text-slate-600">
                {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(getResourceDate(deal))}
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-slate-900">{deal.empresa}</p>
                <p className="mt-1 text-slate-500">{deal.contato}</p>
              </td>
              <td className="px-4 py-4 text-slate-700">{deal.produtoNegociado || deal.descricao}</td>
              <td className="px-4 py-4 text-slate-700">{deal.valorVenda || "-"}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{deal.lucroReal || formatCurrency(0)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const InsightList = ({ items, icon: Icon, accent = "amber" }) => {
  const tone = toneMap[accent] ?? toneMap.amber

  return (
    <div className="space-y-3">
      {items.map((text) => (
        <div key={text} className="flex items-start gap-3 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4">
          <div className={`rounded-2xl p-2 ${tone.badge}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm leading-6 text-slate-700">{text}</p>
        </div>
      ))}
    </div>
  )
}

const DashboardView = () => {
  const today = new Date()
  const [snapshot, setSnapshot] = useState({
    companies: [],
    deals: [],
    products: [],
    people: [],
    services: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("current_month")
  const [customStart, setCustomStart] = useState(
    formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1))
  )
  const [customEnd, setCustomEnd] = useState(formatDateInput(today))

  const loadSnapshot = useEffectEvent(async () => {
    setIsLoading(true)
    setError("")

    try {
      const [companies, deals, products, people, services] = await Promise.all([
        listCompanies(),
        listDeals(),
        listProducts(),
        listPeople(),
        listServices(),
      ])

      setSnapshot({ companies, deals, products, people, services })
    } catch (loadError) {
      setError(loadError.message || "Nao foi possivel carregar o dashboard.")
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    loadSnapshot()
  }, [])

  const periodRange = resolveDashboardRange({ period, customStart, customEnd }, today)
  const filteredSnapshot = {
    companies: filterItemsByRange(snapshot.companies, getResourceDate, periodRange),
    deals: filterItemsByRange(snapshot.deals, getResourceDate, periodRange),
    products: filterItemsByRange(
      snapshot.products,
      (product) => getResourceDate({ createdAt: product.dataEntrada ?? product.createdAt }),
      periodRange
    ),
    people: filterItemsByRange(snapshot.people, getResourceDate, periodRange),
    services: filterItemsByRange(snapshot.services, getResourceDate, periodRange),
  }
  const commercialDeals = filteredSnapshot.deals.filter(
    (deal) => deal.tipoDemanda === "Compra"
  )
  const kpis = buildSpotlightKpis(filteredSnapshot)
  const funnel = buildFunnelStages(commercialDeals)
  const alerts = buildStrategicAlerts(filteredSnapshot)
  const quarter = buildSalesTimeline({
    deals: commercialDeals,
    range: periodRange,
    getDate: getResourceDate,
    getProfit: (deal) => parseMoney(deal.lucroValor ?? deal.lucroReal),
  })
  const wonDeals = quarter.flatMap((month) =>
    month.deals.filter((deal) => deal.status === "Ganhou")
  )
  const totalWins = quarter.reduce((sum, month) => sum + month.wins, 0)
  const totalLosses = quarter.reduce((sum, month) => sum + month.losses, 0)
  const totalProducts = quarter.reduce(
    (sum, month) => sum + month.negotiatedProducts,
    0
  )
  const totalProfit = quarter.reduce((sum, month) => sum + month.profit, 0)
  const rangeLabel = formatDashboardRangeLabel(periodRange)

  return (
    <div className="space-y-6">
      <SectionCard eyebrow="Regra ativa" title="O negocio nasce da demanda e o estoque responde" description="A tela inicial agora consome as colecoes reais do json-server para refletir o estado atual da operacao.">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {dashboardPeriodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                    period === option.value
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button onClick={loadSnapshot} text="Atualizar painel" icon={<ArrowPathIcon className="h-4 w-4" />} className="bg-white text-slate-700 ring-1 ring-slate-200" disabled={isLoading} />
          </div>

          {period === "custom" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:max-w-xl">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Data inicial
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Data final
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0"
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              Periodo aplicado: {rangeLabel}
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              Negocios no recorte: {filteredSnapshot.deals.length}
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              Produtos no recorte: {filteredSnapshot.products.length}
            </div>
          </div>
        </div>
      </SectionCard>

      {error ? (
        <SectionCard eyebrow="Falha de leitura" title="Nao foi possivel carregar o dashboard" description={error}>
          <Button onClick={loadSnapshot} text="Tentar novamente" icon={<ArrowPathIcon className="h-4 w-4" />} />
        </SectionCard>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        {kpis.map((item) => <KpiCard key={item.title} item={item} />)}
      </div>

      <SectionCard eyebrow="Evolucao" title="Vendas realizadas no periodo selecionado" description="Painel comercial baseado nas demandas de compra do recorte escolhido, com lucro por venda, produtos negociados e vendas perdidas por mes.">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Carregando desempenho comercial...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-5">
              <QuarterlySummaryCard label="Vendas realizadas" value={String(totalWins)} detail={`Demandas de compra convertidas em venda dentro de ${rangeLabel}.`} tone="emerald" />
              <QuarterlySummaryCard label="Lucro acumulado" value={formatCurrency(totalProfit)} detail="Soma do lucro real registrado nas vendas ganhas do periodo filtrado." tone="amber" />
              <QuarterlySummaryCard label="Produtos negociados" value={String(totalProducts)} detail="Demandas comerciais em que o caminhao ficou claramente definido." tone="sky" />
              <QuarterlySummaryCard label="Vendas perdidas" value={String(totalLosses)} detail="Demandas comerciais encerradas como Perdeu dentro do periodo filtrado." tone="rose" />
            </div>

            <SalesPerformanceChart months={quarter} />

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lucro por venda</p>
                <WonDealsTable deals={wonDeals} />
              </div>
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Leitura do funil</p>
                <ProgressList items={funnel} suffix="%" />
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard eyebrow="Oportunidades ativas" title="Negocios comerciais mais recentes" description="Leitura direta das demandas de compra mais recentes dentro do periodo selecionado.">
          {isLoading ? <div className="py-16 text-center text-sm text-slate-500">Carregando negocios...</div> : <WonDealsTable deals={commercialDeals.slice().sort((a, b) => getResourceDate(b) - getResourceDate(a)).slice(0, 5)} />}
        </SectionCard>
        <SectionCard eyebrow="Alertas proativos" title="O que exige acao agora" description="Alertas gerados a partir de demandas sem produto, estoque parado, servicos ainda abertos e oportunidades de compra.">
          {isLoading ? <div className="py-16 text-center text-sm text-slate-500">Carregando alertas...</div> : <AlertStack alerts={alerts} />}
        </SectionCard>
      </div>
    </div>
  )
}

const BusinessView = () => (
  <div className="space-y-6">
    <Deals />
    <SectionCard eyebrow="Principios" title="Regras que guiam o modulo" description="Essas regras evitam que o fluxo volte a ser centrado em estoque.">
      <InsightList items={businessPrinciples} icon={BriefcaseIcon} accent="amber" />
    </SectionCard>
  </div>
)

const StockView = () => (
  <div className="space-y-6">
    <Products />
    <SectionCard eyebrow="IA de estoque" title="Sugestoes para precificacao e compra" description="A inteligencia observa a demanda aberta e indica quando vale girar, comprar ou reposicionar.">
      <InsightList items={aiInsights} icon={TruckIcon} accent="amber" />
    </SectionCard>
  </div>
)

const PeopleView = () => (
  <div className="space-y-6">
    <People />
    <SectionCard eyebrow="Visao de relacionamento" title="Comportamentos que ajudam a vender melhor" description="Preferencia de contato, regiao, papel e sinal de compra precisam guiar a rotina comercial.">
      <InsightList items={peopleInsights.map((person) => `${person.name}: ${person.preference}. Papel atual: ${person.role}.`)} icon={UserGroupIcon} accent="emerald" />
    </SectionCard>
  </div>
)

const CompaniesView = () => (
  <div className="space-y-6">
    <Companies />
    <SectionCard eyebrow="Regras" title="Como empresa participa do dominio" description="Empresa nao substitui pessoa; ela organiza contexto, historico e relacionamento institucional.">
      <InsightList items={[
        "Uma empresa pode ter varias pessoas com papeis distintos no mesmo negocio.",
        "Uma empresa pode originar multiplas oportunidades ao longo do tempo.",
        "Historico comercial, operacional e financeiro deve ficar centralizado na empresa.",
      ]} icon={BuildingOffice2Icon} accent="slate" />
    </SectionCard>
  </div>
)

const ServicesView = () => (
  <div className="space-y-6">
    <ServicesModule />
    <SectionCard eyebrow="Lucro real" title="Margem so faz sentido com servico incluido" description="Venda menos compra nao basta. O sistema precisa expor o impacto real de cada prestacao.">
      <InsightList items={[
        "Regularizacao, transporte e vistoria entram no calculo financeiro da venda.",
        "Servicos podem existir antes de o produto estar oficialmente em estoque.",
        "O dashboard precisa mostrar quando servicos estao consumindo a margem acima do esperado.",
      ]} icon={WrenchScrewdriverIcon} accent="rose" />
    </SectionCard>
  </div>
)

const IntelligenceView = () => (
  <div className="space-y-6">
    <SectionCard eyebrow="Camada inteligente" title="Alertas e recomendacoes com contexto de negocio" description="A IA nao deve apenas consultar preco de mercado; ela precisa orientar compra, venda, follow-up e revisao de margem.">
      <InsightList items={aiInsights} icon={SparklesIcon} accent="amber" />
    </SectionCard>

    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <SectionCard eyebrow="Acionadores" title="Notificacoes prioritarias" description="Eventos que valem alerta automatico, bot e lembrete proativo.">
        <InsightList items={[
          "Negocio ativo sem produto associado acima de 5 dias.",
          "Demanda recorrente sem cobertura no estoque atual.",
          "Produto encontrado aderente a uma demanda critica.",
          "Queda de lucro real causada por servicos ou descontos fora do padrao.",
        ]} icon={ExclamationTriangleIcon} accent="rose" />
      </SectionCard>
      <SectionCard eyebrow="Decisao" title="Onde a inteligencia deve ajudar o gestor" description="O painel precisa sugerir acao, nao apenas mostrar numero.">
        <InsightList items={[
          "Sugerir compra quando houver demanda ativa recorrente por um mesmo perfil.",
          "Recomendar revisao de preco em estoque parado acima do limite desejado.",
          "Apontar fornecedores acima ou abaixo do benchmark recente.",
          "Relacionar perda de margem com servico, desconto, frete ou regularizacao.",
        ]} icon={BanknotesIcon} accent="emerald" />
      </SectionCard>
    </div>
  </div>
)

const viewContent = {
  dashboard: <DashboardView />,
  negocios: <BusinessView />,
  estoque: <StockView />,
  pessoas: <PeopleView />,
  empresas: <CompaniesView />,
  servicos: <ServicesView />,
  inteligencia: <IntelligenceView />,
}

const DemandCommandCenter = ({ activeView }) => {
  const currentView = viewMeta[activeView]
  const Icon = sectionIcons[activeView] ?? ChartBarIcon

  return (
    <main className="min-h-screen flex-1 px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[32px] bg-[#111827] px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.3)] md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">{currentView.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{currentView.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{currentView.description}</p>
            </div>
            <div className="min-w-[220px] rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-300/20 p-3 text-amber-300"><Icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-300">Fonte de verdade</p>
                  <p className="text-lg font-semibold">Negocio orientado a demanda</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">Pessoa, empresa, produto e servico orbitam a oportunidade. O sistema precisa conectar tudo com contexto e proxima acao.</p>
            </div>
          </div>
        </section>

        {viewContent[activeView]}
      </div>
    </main>
  )
}

export default DemandCommandCenter
