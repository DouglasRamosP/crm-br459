const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))

const moneyDigitsOnly = (value) => String(value || "").replace(/\D/g, "")

export const formatCurrencyInput = (value) => {
  const digits = moneyDigitsOnly(value)

  if (!digits) return ""

  return formatCurrency(Number(digits) / 100)
}

export const toCurrencyInputValue = (value) => {
  if (value == null || value === "") return ""
  return formatCurrency(parseMoney(value))
}

export const parseMoney = (value) => {
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

export const parsePercent = (value) => {
  if (typeof value === "number") return value
  if (!value) return 0

  const parsed = Number.parseFloat(
    String(value).replace("%", "").replace(/\s/g, "").replace(",", ".")
  )

  return Number.isNaN(parsed) ? 0 : parsed
}

export const formatPercent = (value) => `${Number(value || 0).toFixed(1).replace(".", ",")}%`

export const safeDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export const getDaysBetween = (startDate, endDate = new Date()) => {
  const start = safeDate(startDate)
  const end = safeDate(endDate)
  const diff = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor(diff / 86400000))
}

export const getDaysInStock = (product) => getDaysBetween(product?.dataEntrada || product?.createdAt)

export const getProductLinkedServices = (product, services = []) => {
  const selectedIds = new Set(product?.serviceIds || [])
  return services.filter(
    (service) => service.productId === product?.id || selectedIds.has(service.id)
  )
}

export const sumServiceCosts = (services = []) =>
  services.reduce((sum, service) => sum + parseMoney(service.custoValor ?? service.custo), 0)

export const getProductBaseCost = (product, services = []) => {
  const acquisition = parseMoney(product?.valorAquisicao || product?.capital)
  const serviceTotal = sumServiceCosts(getProductLinkedServices(product, services))
  return acquisition + serviceTotal
}

export const getProductEstimatedSale = (product, services = []) => {
  const baseCost = getProductBaseCost(product, services)
  const margin = parsePercent(product?.margemEsperada || product?.margem)
  return baseCost * (1 + margin / 100)
}

export const buildProductRecommendation = (product, services = []) => {
  const days = getDaysInStock(product)
  const serviceCount = getProductLinkedServices(product, services).length

  if (product?.status === "Negociando") {
    return "Acompanhar proposta e reduzir atrito para fechamento."
  }

  if (days > 45) {
    return "Revisar preco e acionar carteira aderente para acelerar giro."
  }

  if (serviceCount > 0) {
    return "Usar historico de servicos como argumento de valor na venda."
  }

  return "Produto pronto para abordagem comercial orientada por demanda."
}

export const getDealDate = (deal) => safeDate(deal?.dataNegocio || deal?.createdAt)

export const computeDealMetrics = ({
  dealType,
  proposalValue,
  referenceValue,
  baseCost,
}) => {
  const proposal = parseMoney(proposalValue)
  const reference = parseMoney(referenceValue)
  const base = parseMoney(baseCost)

  if (dealType === "Venda") {
    const profit = reference - proposal
    const margin = reference > 0 ? (profit / reference) * 100 : 0

    return {
      lucroValor: profit,
      lucroPercentual: margin,
      custoBase: proposal,
      valorReferencia: reference,
    }
  }

  const profit = proposal - base
  const margin = proposal > 0 ? (profit / proposal) * 100 : 0

  return {
    lucroValor: profit,
    lucroPercentual: margin,
    custoBase: base,
    valorReferencia: proposal,
  }
}

export const slugStatusTone = (status) => {
  if (status === "Ganhou" || status === "Concluído") return "emerald"
  if (status === "Perdeu" || status === "Cancelado") return "rose"
  if (status === "Negociando" || status === "Proposta" || status === "Negociação") return "amber"
  return "slate"
}

export const getProductStatusTone = (status) => {
  if (status === "Negociando") return "amber"
  if (status === "Disponível") return "emerald"
  if (status === "Reservado") return "sky"
  if (status === "Vendido") return "rose"
  return "slate"
}

export const getServiceStatusTone = (status) => {
  if (status === "Em andamento") return "amber"
  if (status === "Agendado") return "sky"
  if (status === "Concluído") return "emerald"
  return "slate"
}
