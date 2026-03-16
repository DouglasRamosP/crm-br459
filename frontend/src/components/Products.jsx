import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/solid"
import { useEffect, useEffectEvent, useState } from "react"
import { toast } from "sonner"

import { listDeals, updateDeal } from "../services/deals"
import { createProduct, listProducts, removeProduct } from "../services/products"
import { listServices } from "../services/serviceRecords"
import {
  buildProductRecommendation,
  formatCurrency,
  formatPercent,
  getDaysInStock,
  getProductBaseCost,
  getProductEstimatedSale,
  getProductLinkedServices,
  parsePercent,
} from "../utils/business"
import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"
import Select from "./Select"

const statusOptions = ["Disponivel", "Em negociacao", "Reservado", "Vendido"]

const getToday = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  modelo: "",
  dataEntrada: getToday(),
  valorAquisicao: "",
  margemEsperada: "10",
  status: statusOptions[0],
  linkedDealId: "",
  serviceIds: [],
  recomendacao: "",
}

const ProductDialog = ({ isOpen, isSaving, onClose, onSave, deals, services }) => {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm)
    }
  }, [isOpen])

  const selectedServices = services.filter((service) => form.serviceIds.includes(service.id))
  const acquisition = getProductBaseCost({ valorAquisicao: form.valorAquisicao, serviceIds: form.serviceIds }, selectedServices)
  const estimatedSale = acquisition * (1 + parsePercent(form.margemEsperada) / 100)
  const resolvedStatus = form.linkedDealId ? "Em negociacao" : form.status
  const recommendation =
    form.recomendacao ||
    buildProductRecommendation(
      {
        dataEntrada: form.dataEntrada,
        status: resolvedStatus,
        valorAquisicao: form.valorAquisicao,
        margemEsperada: form.margemEsperada,
      },
      selectedServices
    )

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const toggleService = (serviceId) => {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((item) => item !== serviceId)
        : [...current.serviceIds, serviceId],
    }))
  }

  const handleSubmit = () => {
    if (!form.modelo || !form.valorAquisicao || !form.dataEntrada) return

    onSave?.({
      ...form,
      status: resolvedStatus,
      totalServicos: selectedServices.reduce((sum, service) => sum + Number(service.custoValor || 0), 0),
      custoTotal: acquisition,
      precoEstimadoVenda: estimatedSale,
      recomendacao: recommendation,
      diasEmEstoque: getDaysInStock({ dataEntrada: form.dataEntrada }),
    })
  }

  const footer = (
    <div className="mt-8 flex gap-3">
      <Button text="Cancelar" size="lg" onClick={onClose} disabled={isSaving} />
      <Button text={isSaving ? "Salvando..." : "Salvar produto"} size="lg" onClick={handleSubmit} disabled={isSaving} />
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSaving ? undefined : onClose}
      title="Cadastrar produto"
      subtitle="Cadastre custo, margem, servicos atrelados e potencial de venda."
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input id="product-model" label="Modelo" value={form.modelo} onChange={handleChange("modelo")} placeholder="Ex.: Volvo FH 540 2021" />
        <Input id="product-entry" label="Data de entrada" type="date" value={form.dataEntrada} onChange={handleChange("dataEntrada")} />
        <Input id="product-acquisition" label="Valor de aquisicao" value={form.valorAquisicao} onChange={handleChange("valorAquisicao")} placeholder="R$ 610 mil" />
        <Input id="product-margin" label="Margem esperada (%)" value={form.margemEsperada} onChange={handleChange("margemEsperada")} placeholder="10" />
        <Select id="product-status" label="Status" value={resolvedStatus} onChange={handleChange("status")} options={statusOptions} disabled={Boolean(form.linkedDealId)} />
        <Select
          id="product-deal"
          label="Negocio vinculado (opcional)"
          value={form.linkedDealId}
          onChange={handleChange("linkedDealId")}
          options={[
            { label: "Sem negocio vinculado", value: "" },
            ...deals.map((deal) => ({
              label: `${deal.empresa || deal.pessoa || "Negocio"} - ${deal.descricao}`,
              value: deal.id,
            })),
          ]}
        />
        <Input id="product-recommendation" label="Recomendacao comercial" value={form.recomendacao} onChange={handleChange("recomendacao")} placeholder="Sugestao para acelerar a venda" />
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Servicos atrelados</p>
            <p className="text-sm text-slate-500">Esses custos entram automaticamente no custo total do produto.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {selectedServices.length} selecionados
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {services.length ? (
            services.map((service) => {
              const active = form.serviceIds.includes(service.id)

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <p className="font-semibold">{service.nome}</p>
                  <p className="mt-1 text-xs opacity-80">{service.custo || formatCurrency(service.custoValor || 0)}</p>
                </button>
              )
            })
          ) : (
            <p className="text-sm text-slate-500">Cadastre servicos antes de vincular custos ao produto.</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dias em estoque</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{getDaysInStock({ dataEntrada: form.dataEntrada })}</p>
        </article>
        <article className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Custo total</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(acquisition)}</p>
        </article>
        <article className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Margem</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatPercent(parsePercent(form.margemEsperada))}</p>
        </article>
        <article className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Venda estimada</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(estimatedSale)}</p>
        </article>
      </div>
    </Dialog>
  )
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const loadProducts = useEffectEvent(async () => {
    setIsLoading(true)

    try {
      const [productsData, dealsData, servicesData] = await Promise.all([
        listProducts(),
        listDeals(),
        listServices(),
      ])

      setProducts(productsData)
      setDeals(dealsData)
      setServices(
        servicesData.map((service) => ({
          ...service,
          custoValor: service.custoValor ?? 0,
        }))
      )
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = (product) => {
    const linkedDeals = deals.filter((deal) => deal.productId === product.id)
    const linkedServices = services.filter((service) => service.productId === product.id)

    if (linkedDeals.length || linkedServices.length) {
      toast.error("Esse produto possui negocio ou servico vinculado e nao pode ser excluido agora.")
      return
    }

    toast.warning("Confirmar exclusao do produto?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await removeProduct(product.id)
            setProducts((current) => current.filter((item) => item.id !== product.id))
            toast.success("Produto excluido com sucesso")
          } catch (error) {
            toast.error(error.message)
          }
        },
      },
    })
  }

  const handleSave = async (payload) => {
    setIsSaving(true)

    try {
      const saved = await createProduct(payload)

      if (payload.linkedDealId) {
        await updateDeal(payload.linkedDealId, {
          productId: saved.id,
          produtoNegociado: saved.modelo,
          produtoStatus: "Associado",
          produtoOrigem: "Estoque",
        })
      }

      setProducts((current) => [saved, ...current])
      setDialogOpen(false)
      toast.success("Produto adicionado com sucesso")
      await loadProducts()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleView = (product) => {
    const cost = getProductBaseCost(product, services)
    const estimatedSale = getProductEstimatedSale(product, services)

    toast(
      `${product.modelo} | ${product.status} | Custo total: ${formatCurrency(cost)} | Venda estimada: ${formatCurrency(estimatedSale)}`
    )
  }

  const averageMargin = products.length
    ? formatPercent(
        products.reduce((sum, product) => sum + parsePercent(product.margemEsperada || product.margem), 0) /
          products.length
      )
    : "0,0%"

  const summaryCards = [
    { label: "Produtos em estoque", value: products.length, detail: "Ativos acompanhados com custo total e potencial de venda." },
    { label: "Em negociacao", value: products.filter((product) => product.status === "Em negociacao").length, detail: "Itens ja puxados para algum negocio." },
    { label: "Parados > 45 dias", value: products.filter((product) => getDaysInStock(product) > 45).length, detail: `Margem media esperada: ${averageMargin}` },
  ]

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Estoque</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Estoque com custo real, margem esperada e recomendacao</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">O produto considera aquisicao, servicos atrelados, dias em estoque e negocio vinculado antes de virar decisao comercial.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadProducts} text="Atualizar" size="md" className="bg-white text-slate-700 ring-1 ring-slate-200" icon={<ArrowPathIcon className="h-4 w-4" />} disabled={isLoading} />
          <Button onClick={() => setDialogOpen(true)} text="Adicionar produto" icon={<PlusIcon className="h-4 w-4" />} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-white p-2 text-amber-600 shadow-sm"><TruckIcon className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p></div></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
        {isLoading ? <div className="px-6 py-12 text-center text-sm text-slate-500">Carregando estoque do json-server...</div> : !products.length ? <div className="px-6 py-12 text-center text-sm text-slate-500">Nenhum produto cadastrado ainda.</div> : (
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3 font-medium">Modelo</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Dias</th><th className="px-4 py-3 font-medium">Financeiro</th><th className="px-4 py-3 font-medium">Acoes</th></tr></thead>
            <tbody>
              {products.map((product) => {
                const linkedServices = getProductLinkedServices(product, services)
                const totalCost = getProductBaseCost(product, services)
                const estimatedSale = getProductEstimatedSale(product, services)
                const recommendation = product.recomendacao || buildProductRecommendation(product, services)

                return (
                  <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-4"><p className="font-medium text-slate-800">{product.modelo}</p><p className="mt-1 text-slate-500">{recommendation}</p></td>
                    <td className="px-4 py-4"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{product.status}</span></td>
                    <td className="px-4 py-4 text-slate-700">{getDaysInStock(product)} dias</td>
                    <td className="px-4 py-4 text-slate-700">{formatCurrency(totalCost)} custo total | {formatCurrency(estimatedSale)} venda estimada | {linkedServices.length} servicos</td>
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><button type="button" className="rounded-full p-2 text-amber-600 transition hover:bg-amber-50" onClick={() => handleView(product)}><ArrowTopRightOnSquareIcon className="h-4 w-4" /></button><button type="button" className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50" onClick={() => handleDelete(product)}><TrashIcon className="h-4 w-4" /></button></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <ProductDialog isOpen={isDialogOpen} isSaving={isSaving} onClose={() => setDialogOpen(false)} onSave={handleSave} deals={deals} services={services} />
    </section>
  )
}

export default Products