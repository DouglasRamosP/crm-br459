import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createCompany, listCompanies } from "../services/companies"
import { listDeals, updateDeal } from "../services/deals"
import { createPerson, listPeople } from "../services/people"
import { createProduct, listProducts, removeProduct, updateProduct } from "../services/products"
import { createService, listServices } from "../services/serviceRecords"
import {
  buildProductRecommendation,
  formatCurrency,
  formatCurrencyInput,
  formatPercent,
  getDaysInStock,
  getProductBaseCost,
  getProductEstimatedSale,
  getProductLinkedServices,
  getProductStatusTone,
  normalizeProductStatus,
  parsePercent,
  toCurrencyInputValue,
} from "../utils/business"
import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"
import Select from "./Select"
import { ServiceDialog } from "./ServicesModule"

const statusOptions = ["Disponível", "Negociando", "Reservado", "Vendido"]
const statusToneClasses = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
}

const getToday = () => new Date().toISOString().slice(0, 10)

const baseForm = {
  modelo: "",
  dataEntrada: getToday(),
  valorAquisicao: "",
  margemEsperada: "10",
  status: statusOptions[0],
  linkedDealId: "",
  serviceIds: [],
  recomendacao: "",
}

const createFormState = (initialValues = {}) => ({
  ...baseForm,
  ...initialValues,
  dataEntrada: (initialValues.dataEntrada || initialValues.createdAt || getToday()).slice(0, 10),
  valorAquisicao: toCurrencyInputValue(initialValues.valorAquisicao || initialValues.capital),
  margemEsperada: initialValues.margemEsperada || String(initialValues.margem || "10").replace("%", ""),
  linkedDealId: initialValues.linkedDealId || initialValues.currentDealId || "",
  serviceIds: initialValues.serviceIds || [],
})

const ProductDialog = ({
  isOpen,
  isSaving,
  onClose,
  onSave,
  deals,
  services,
  people,
  companies,
  onQuickCreateService,
  onQuickCreatePerson,
  onQuickCreateCompany,
  initialValues = baseForm,
  title = "Cadastrar produto",
  subtitle = "Cadastre custo, margem, servicos atrelados e potencial de venda.",
  submitText = "Salvar produto",
}) => {
  const [form, setForm] = useState(() => createFormState(initialValues))
  const [isServiceDialogOpen, setServiceDialogOpen] = useState(false)
  const [isQuickSavingService, setQuickSavingService] = useState(false)

  const handleClose = () => {
    setForm(createFormState(initialValues))
    setServiceDialogOpen(false)
    onClose?.()
  }

  const selectedServices = services.filter((service) => form.serviceIds.includes(service.id))
  const acquisition = getProductBaseCost({ valorAquisicao: form.valorAquisicao, serviceIds: form.serviceIds }, selectedServices)
  const estimatedSale = acquisition * (1 + parsePercent(form.margemEsperada) / 100)
  const resolvedStatus = form.linkedDealId ? "Negociando" : form.status
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

  const handleMoneyChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: formatCurrencyInput(event.target.value) }))
  }

  const toggleService = (serviceId) => {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((item) => item !== serviceId)
        : [...current.serviceIds, serviceId],
    }))
  }

  const handleQuickServiceSave = async (payload) => {
    setQuickSavingService(true)

    try {
      const saved = await onQuickCreateService(payload)
      setForm((current) => ({
        ...current,
        serviceIds: current.serviceIds.includes(saved.id) ? current.serviceIds : [...current.serviceIds, saved.id],
      }))
      setServiceDialogOpen(false)
    } finally {
      setQuickSavingService(false)
    }
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
      <Button text="Cancelar" size="lg" onClick={handleClose} disabled={isSaving} />
      <Button text={isSaving ? "Salvando..." : submitText} size="lg" onClick={handleSubmit} disabled={isSaving} />
    </div>
  )

  return (
    <>
      <Dialog isOpen={isOpen} onClose={isSaving ? undefined : handleClose} title={title} subtitle={subtitle} footer={footer}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input id="product-model" label="Modelo" value={form.modelo} onChange={handleChange("modelo")} placeholder="Ex.: Volvo FH 540 2021" />
          <Input id="product-entry" label="Data de entrada" type="date" value={form.dataEntrada} onChange={handleChange("dataEntrada")} />
          <Input id="product-acquisition" label="Valor de aquisicao" value={form.valorAquisicao} onChange={handleMoneyChange("valorAquisicao")} placeholder="R$ 610 mil" />
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
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{selectedServices.length} atrelados</span>
              <Button text="Registrar servico" size="sm" className="bg-slate-900 text-white" onClick={() => setServiceDialogOpen(true)} />
            </div>
          </div>
          {selectedServices.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{service.nome}</p>
                      <p className="mt-1">{service.tipo || "Sem tipo"} | {service.status || "Sem status"}</p>
                      <p className="mt-1 text-slate-500">{service.custo || formatCurrency(service.custoValor || 0)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-sm text-slate-500">
              Nenhum servico atrelado a este produto ainda. Use "Registrar servico" para adicionar um novo servico e vinculá-lo automaticamente.
            </div>
          )}
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

      <ServiceDialog
        key={`product-service-${isServiceDialogOpen ? "open" : "closed"}`}
        isOpen={isServiceDialogOpen}
        isSaving={isQuickSavingService}
        onClose={() => setServiceDialogOpen(false)}
        onSave={handleQuickServiceSave}
        people={people}
        companies={companies}
        products={[]}
        deals={deals}
        onQuickCreatePerson={onQuickCreatePerson}
        onQuickCreateCompany={onQuickCreateCompany}
        title="Registrar servico rapido"
        subtitle="O servico sera salvo no modulo Servicos e ja aparecera na previa deste produto."
        submitText="Salvar servico"
      />
    </>
  )
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [services, setServices] = useState([])
  const [people, setPeople] = useState([])
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const loadProducts = async () => {
    setIsLoading(true)

    try {
      const [productsData, dealsData, servicesData, peopleData, companiesData] = await Promise.all([
        listProducts(),
        listDeals(),
        listServices(),
        listPeople(),
        listCompanies(),
      ])

      setProducts(productsData)
      setDeals(dealsData)
      setPeople(peopleData)
      setCompanies(companiesData)
      setServices(servicesData.map((service) => ({ ...service, custoValor: service.custoValor ?? 0 })))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

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

  const syncDealLink = async (productId, modelo, linkedDealId, previousDealId = "") => {
    if (previousDealId && previousDealId !== linkedDealId) {
      await updateDeal(previousDealId, {
        productId: "",
        produtoStatus: "Sem produto",
        produtoOrigem: "Manual",
      })
    }

    if (linkedDealId) {
      await updateDeal(linkedDealId, {
        productId,
        produtoNegociado: modelo,
        produtoStatus: "Associado",
        produtoOrigem: "Estoque",
      })
    }
  }

  const handleSave = async (payload) => {
    setIsSaving(true)

    try {
      if (selectedProduct) {
        const saved = await updateProduct(selectedProduct.id, payload)
        await syncDealLink(saved.id, saved.modelo, payload.linkedDealId, selectedProduct.linkedDealId || selectedProduct.currentDealId || "")
        setProducts((current) => current.map((item) => (item.id === selectedProduct.id ? saved : item)))
        toast.success("Produto atualizado com sucesso")
      } else {
        const saved = await createProduct(payload)
        await syncDealLink(saved.id, saved.modelo, payload.linkedDealId)
        setProducts((current) => [saved, ...current])
        toast.success("Produto adicionado com sucesso")
      }

      setDialogOpen(false)
      setSelectedProduct(null)
      await loadProducts()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickCreateService = async (payload) => {
    const saved = await createService(payload)
    setServices((current) => [saved, ...current])
    toast.success("Servico adicionado com sucesso")
    return saved
  }

  const handleQuickCreatePerson = async (payload) => {
    const saved = await createPerson(payload)
    setPeople((current) => [saved, ...current])
    toast.success("Pessoa adicionada com sucesso")
    return saved
  }

  const handleQuickCreateCompany = async (payload) => {
    const saved = await createCompany(payload)
    setCompanies((current) => [saved, ...current])
    toast.success("Empresa adicionada com sucesso")
    return saved
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const averageMargin = products.length ? formatPercent(products.reduce((sum, product) => sum + parsePercent(product.margemEsperada || product.margem), 0) / products.length) : "0,0%"

  const summaryCards = [
    { label: "Disponível", value: products.filter((product) => normalizeProductStatus(product.status) === "Disponível").length, detail: "Produtos prontos para abordagem comercial.", tone: "emerald" },
    { label: "Negociando", value: products.filter((product) => normalizeProductStatus(product.status) === "Negociando").length, detail: "Itens ja puxados para algum negocio.", tone: "amber" },
    { label: "Reservado", value: products.filter((product) => normalizeProductStatus(product.status) === "Reservado").length, detail: "Produtos separados aguardando conclusao.", tone: "sky" },
    { label: "Vendido", value: products.filter((product) => normalizeProductStatus(product.status) === "Vendido").length, detail: `Margem media esperada: ${averageMargin}`, tone: "rose" },
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
          <Button onClick={openCreate} text="Adicionar produto" icon={<PlusIcon className="h-4 w-4" />} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className={`rounded-[24px] border p-4 ${card.tone === "emerald" ? "border-emerald-200 bg-emerald-50/80" : card.tone === "amber" ? "border-amber-200 bg-amber-50/80" : card.tone === "sky" ? "border-sky-200 bg-sky-50/80" : "border-rose-200 bg-rose-50/80"}`}>
            <div className="flex items-center gap-3"><div className={`rounded-2xl bg-white p-2 shadow-sm ${card.tone === "emerald" ? "text-emerald-600" : card.tone === "amber" ? "text-amber-600" : card.tone === "sky" ? "text-sky-600" : "text-rose-600"}`}><TruckIcon className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p></div></div>
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

                const normalizedStatus = normalizeProductStatus(product.status)
                const statusTone = statusToneClasses[getProductStatusTone(normalizedStatus)] || statusToneClasses.slate

                return (
                  <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-4"><p className="font-medium text-slate-800">{product.modelo}</p><p className="mt-1 text-slate-500">{recommendation}</p></td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>{normalizedStatus}</span></td>
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
      <ProductDialog
        key={selectedProduct?.id || "new-product"}
        isOpen={isDialogOpen}
        isSaving={isSaving}
        onClose={() => {
          setDialogOpen(false)
          setSelectedProduct(null)
        }}
        onSave={handleSave}
        deals={deals}
        services={services}
        people={people}
        companies={companies}
        onQuickCreateService={handleQuickCreateService}
        onQuickCreatePerson={handleQuickCreatePerson}
        onQuickCreateCompany={handleQuickCreateCompany}
        initialValues={selectedProduct || undefined}
        title={selectedProduct ? `Detalhes de ${selectedProduct.modelo}` : "Cadastrar produto"}
        subtitle={selectedProduct ? "Revise custos, servicos, recomendacao e negocio vinculado deste produto." : "Cadastre custo, margem, servicos atrelados e potencial de venda."}
        submitText={selectedProduct ? "Salvar alteracoes" : "Salvar produto"}
      />
    </section>
  )
}

export default Products
