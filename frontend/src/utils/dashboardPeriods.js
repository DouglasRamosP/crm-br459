export const dashboardPeriodOptions = [
  { value: "current_month", label: "Mes corrente" },
  { value: "previous_month", label: "Mes anterior" },
  { value: "last_three_months", label: "Ultimos 3 meses" },
  { value: "year", label: "Anual" },
  { value: "custom", label: "Personalizado" },
]

const startOfDay = (date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date) => endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))

const parseInputDate = (value) => {
  if (!value) return null

  const parsed = new Date(`${value}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const formatDateInput = (date) => {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10)
}

export const resolveDashboardRange = (
  { period, customStart, customEnd },
  now = new Date()
) => {
  const currentDate = new Date(now)

  switch (period) {
    case "previous_month": {
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      return {
        start: startOfMonth(previousMonth),
        end: endOfMonth(previousMonth),
      }
    }
    case "last_three_months": {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1)
      return {
        start: startOfDay(start),
        end: endOfDay(currentDate),
      }
    }
    case "year": {
      const start = new Date(currentDate.getFullYear(), 0, 1)
      return {
        start: startOfDay(start),
        end: endOfDay(currentDate),
      }
    }
    case "custom": {
      const start = parseInputDate(customStart) ?? startOfMonth(currentDate)
      const end = parseInputDate(customEnd) ?? currentDate
      const normalizedStart = start <= end ? start : end
      const normalizedEnd = start <= end ? end : start

      return {
        start: startOfDay(normalizedStart),
        end: endOfDay(normalizedEnd),
      }
    }
    case "current_month":
    default:
      return {
        start: startOfDay(startOfMonth(currentDate)),
        end: endOfDay(currentDate),
      }
  }
}

export const formatDashboardRangeLabel = (range) => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return `${formatter.format(range.start)} ate ${formatter.format(range.end)}`
}

export const filterItemsByRange = (items, getDate, range) =>
  items.filter((item) => {
    const date = getDate(item)
    return date >= range.start && date <= range.end
  })

const getMonthBuckets = (range) => {
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short" })
  const buckets = []
  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1)
  const limit = new Date(range.end.getFullYear(), range.end.getMonth(), 1)

  while (cursor <= limit) {
    buckets.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: formatter.format(cursor),
      wins: 0,
      losses: 0,
      negotiatedProducts: 0,
      profit: 0,
      deals: [],
    })

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return buckets
}

export const buildSalesTimeline = ({ deals, range, getDate, getProfit }) => {
  const months = getMonthBuckets(range)
  const monthMap = new Map(months.map((month) => [month.key, month]))

  deals.forEach((deal) => {
    const date = getDate(deal)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const month = monthMap.get(key)

    if (!month) return

    month.deals.push(deal)

    if (deal.status === "Ganhou") {
      month.wins += 1
      month.profit += getProfit(deal)
    }

    if (deal.status === "Perdeu") {
      month.losses += 1
    }

    if (deal.produtoNegociado) {
      month.negotiatedProducts += 1
    }
  })

  const maxValue = Math.max(
    1,
    ...months.flatMap((month) => [month.wins, month.losses, month.negotiatedProducts])
  )

  return months.map((month) => ({
    ...month,
    winHeight: Math.max(16, (month.wins / maxValue) * 100),
    lossHeight: Math.max(16, (month.losses / maxValue) * 100),
    productHeight: Math.max(16, (month.negotiatedProducts / maxValue) * 100),
  }))
}