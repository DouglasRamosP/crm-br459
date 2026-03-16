import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid"
import { useEffect, useEffectEvent, useState } from "react"
import { toast } from "sonner"

import { createCompany, listCompanies } from "../services/companies"
import { createDeal, listDeals, removeDeal } from "../services/deals"
import { createPerson, listPeople } from "../services/people"
import { listProducts, updateProduct } from "../services/products"
import { listServices } from "../services/serviceRecords"
import {
  computeDealMetrics,
  formatCurrency,
  formatPercent,
  getProductBaseCost,
  parseMoney,
} from "../utils/business"
import CompanieDialog from "./AddCompanieDialog"
import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"
import PersonDialog from "./PersonDialog"
import Select from "./Select"

const demandOptions = ["Compra", "Venda"]
const priorityOptions = ["Baixa", "Media", "Alta", "Critica"]
const statusOptions = [
  "Interesse",
  "Busca no mercado",
  "Proposta",
  "Negociacao",
  "Ganhou",
  "Perdeu",
]

const getToday = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  personId: "",
  companyId: "",
  tipoDemanda: demandOptions[0],
  descricao: "",
  dataNegocio: getToday(),
  prazoDias: "",
  productId: "",
  descricaoProdutoManual: "",
  propostaCliente: "",
  custoBaseEstimado: "",
  valorReferenciaVenda: "",
  prioridade: priorityOptions[1],
  status: statusOptions[0],
}

const DealDialog = ({
  isOpen,
  isSaving,
  onClose,
  onSave,
  people,
  companies,
  products,
  services,
  onQuickCreatePerson,
  onQuickCreateCompany,
}) => {
  const [form, setForm] = useState(initialForm)
  const [isPersonDialogOpen, setPersonDialogOpen] = useState(false)
  const [isCompanyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [isQuickSavingPerson, setQuickSavingPerson] = useState(false)
  const [isQuickSavingCompany, setQuickSavingCompany] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm)
      setPersonDialogOpen(false)
      setCompanyDialogOpen(false)
    }
  }, [isOpen])

  const selectedPerson = people.find((person) => person.id === form.personId)
  const selectedCompany = companies.find((company) => company.id === form.companyId)
  const selectedProduct = products.find((product) => product.id === form.productId)
  const availableProducts = products.filter((product) => product.status !== "Vendido")
  const baseCostFromStock = selectedProduct
    ? getProductBaseCost(selectedProduct, services)
    : 0
  const metrics = computeDealMetrics({
    dealType: form.tipoDemanda,
    proposalValue: form.propostaCliente,
    referenceValue:
      form.tipoDemanda === "Venda"
        ? form.valorReferenciaVenda
        : form.propostaCliente,
    baseCost:
      form.tipoDemanda === "Compra"
        ? selectedProduct
          ? baseCostFromStock
          : form.custoBaseEstimado
        : form.propostaCliente,
  })

  useEffect(() => {
    if (selectedPerson?.empresaId && !form.companyId) {
      setForm((current) => ({ ...current, companyId: selectedPerson.empresaId }))
    }
  }, [selectedPerson?.empresaId, form.companyId])

  useEffect(() => {
    if (form.tipoDemanda === "Venda") {
      setForm((current) => ({ ...current, productId: "" }))
    }
  }, [form.tipoDemanda])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = () => {
    if (!form.tipoDemanda || !form.dataNegocio || !form.descricao || !form.propostaCliente) return

    const productDescription = selectedProduct?.modelo || form.descricaoProdutoManual

    if (!selectedPerson && !selectedCompany) return
    if (form.tipoDemanda === "Compra" && !selectedProduct && !productDescription) return
    if (form.tipoDemanda === "Venda" && !form.valorReferenciaVenda) return
    if (form.tipoDemanda === "Compra" && !selectedProduct && !form.custoBaseEstimado) return

    const isoDate = new Date(`${form.dataNegocio}T12:00:00`).toISOString()

    onSave?.({
      personId: selectedPerson?.id || "",
      contato: selectedPerson?.nome || "",
      companyId: selectedCompany?.id || selectedPerson?.empresaId || "",
      empresa: selectedCompany?.nome || selectedPerson?.empresa || "",
      tipoDemanda: form.tipoDemanda,
      descricao: form.descricao,
      dataNegocio: isoDate,
      createdAt: isoDate,
      prazoDias: Number(form.prazoDias || 0),
      productId: selectedProduct?.id || "",
      produtoNegociado: productDescription,
      descricaoProdutoManual: form.descricaoProdutoManual,
      produtoOrigem: selectedProduct ? "Estoque" : "Manual",
      produtoStatus: selectedProduct ? "Associado" : "Sem produto",
      propostaCliente: form.propostaCliente,
      valorVenda: form.tipoDemanda === "Compra" ? form.propostaCliente : form.valorReferenciaVenda,
      custoBase: metrics.custoBase,
      custoBaseFormatado: formatCurrency(metrics.custoBase),
      valorReferencia: metrics.valorReferencia,
      valorReferenciaFormatado: formatCurrency(metrics.valorReferencia),
      lucroValor: metrics.lucroValor,
      lucroPercentual: metrics.lucroPercentual,
      lucroReal: formatCurrency(metrics.lucroValor),
      margemReal: formatPercent(metrics.lucroPercentual),
      prioridade: form.prioridade,
      status: form.status,
    })
  }

  const handleQuickPersonSave = async (payload) => {
    setQuickSavingPerson(true)

    try {
      const saved = await onQuickCreatePerson(payload)
      setForm((current) => ({
        ...current,
        personId: saved.id,
        companyId: current.companyId || saved.empresaId || "",
      }))
      setPersonDialogOpen(false)
    } finally {
      setQuickSavingPerson(false)
    }
  }

  const handleQuickCompanySave = async (payload) => {
    setQuickSavingCompany(true)

    try {
      const saved = await onQuickCreateCompany(payload)
      setForm((current) => ({ ...current, companyId: saved.id }))
      setCompanyDialogOpen(false)
    } finally {
      setQuickSavingCompany(false)
    }
  }

  const footer = (
    <div className="mt-8 flex gap-3">
      <Button text="Cancelar" size="lg" onClick={onClose} disabled={isSaving} />
      <Button
        text={isSaving ? "Salvando..." : "Salvar negocio"}
        size="lg"
        onClick={handleSubmit}
        disabled={isSaving}
      />
    </div>
  )

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={isSaving ? undefined : onClose}
        title="Cadastrar negocio"
        subtitle="Selecione quem originou a demanda, defina o produto e veja o lucro estimado antes de salvar."
        footer={footer}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Select
              id="deal-person"
              label="Pessoa (opcional)"
              value={form.personId}
              onChange={handleChange("personId")}
              options={[
                { label: "Selecione uma pessoa", value: "" },
                ...people.map((person) => ({ label: person.nome, value: person.id })),
              ]}
            />
            <button type="button" onClick={() => setPersonDialogOpen(true)} className="mt-2 text-sm font-medium text-amber-700 transition hover:text-amber-800">
              Pessoa nao encontrada? Cadastrar agora.
            </button>
          </div>
          <div>
            <Select
              id="deal-company"
              label="Empresa (opcional)"
              value={form.companyId}
              onChange={handleChange("companyId")}
              options={[
                { label: "Selecione uma empresa", value: "" },
                ...companies.map((company) => ({ label: company.nome, value: company.id })),
              ]}
            />
            <button type="button" onClick={() => setCompanyDialogOpen(true)} className="mt-2 text-sm font-medium text-amber-700 transition hover:text-amber-800">
              Empresa nao encontrada? Cadastrar agora.
            </button>
          </div>
          <Select id="deal-type" label="Tipo de demanda" value={form.tipoDemanda} onChange={handleChange("tipoDemanda")} options={demandOptions} />
          <Input id="deal-date" label="Data do negocio" type="date" value={form.dataNegocio} onChange={handleChange("dataNegocio")} />
          <Input id="deal-deadline" label="Prazo (dias)" type="number" value={form.prazoDias} onChange={handleChange("prazoDias")} placeholder="Ex.: 15" />
          <Select id="deal-priority" label="Prioridade" value={form.prioridade} onChange={handleChange("prioridade")} options={priorityOptions} />
          <Input id="deal-description" label="Descricao da demanda" value={form.descricao} onChange={handleChange("descricao")} placeholder="O que o cliente quer comprar ou vender" />
          <Select id="deal-status" label="Status do funil" value={form.status} onChange={handleChange("status")} options={statusOptions} />

          {form.tipoDemanda === "Compra" ? (
            <>
              <Select
                id="deal-stock-product"
                label="Produto do estoque (opcional)"
                value={form.productId}
                onChange={handleChange("productId")}
                options={[
                  { label: "Digitar caminhao manualmente", value: "" },
                  ...availableProducts.map((product) => ({
                    label: `${product.modelo} - ${product.status}`,
                    value: product.id,
                  })),
                ]}
              />
              <Input id="deal-manual-product" label="Descricao manual do caminhao" value={form.descricaoProdutoManual} onChange={handleChange("descricaoProdutoManual")} placeholder="Se o produto nao estiver no estoque, descreva aqui" disabled={Boolean(form.productId)} />
            </>
          ) : (
            <>
              <Input id="deal-manual-product-sale" label="Caminhao que o cliente quer nos vender" value={form.descricaoProdutoManual} onChange={handleChange("descricaoProdutoManual")} placeholder="Modelo, ano, configuracao e observacoes" />
              <Input id="deal-reference-value" label="Valor estimado de revenda" value={form.valorReferenciaVenda} onChange={handleChange("valorReferenciaVenda")} placeholder="R$ 690 mil" />
            </>
          )}

          <Input
            id="deal-proposal"
            label={form.tipoDemanda === "Compra" ? "Proposta do cliente para comprar" : "Proposta do cliente para nos vender"}
            value={form.propostaCliente}
            onChange={handleChange("propostaCliente")}
            placeholder="R$ 650 mil"
          />

          {form.tipoDemanda === "Compra" ? (
            <Input
              id="deal-base-cost"
              label={selectedProduct ? "Custo base do produto (calculado)" : "Custo base estimado"}
              value={selectedProduct ? formatCurrency(baseCostFromStock) : form.custoBaseEstimado}
              onChange={handleChange("custoBaseEstimado")}
              placeholder="R$ 610 mil"
              disabled={Boolean(selectedProduct)}
            />
          ) : (
            <Input
              id="deal-reference-helper"
              label="Lucro estimado na revenda"
              value={formatCurrency(metrics.lucroValor)}
              readOnly
            />
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Produto negociado</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{selectedProduct?.modelo || form.descricaoProdutoManual || "A definir"}</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Base do negocio</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(metrics.custoBase)}</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lucro estimado</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(metrics.lucroValor)}</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Margem estimada</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{formatPercent(metrics.lucroPercentual)}</p>
          </article>
        </div>
      </Dialog>

      <PersonDialog
        isOpen={isPersonDialogOpen}
        isSaving={isQuickSavingPerson}
        onClose={() => setPersonDialogOpen(false)}
        onSave={handleQuickPersonSave}
        companies={companies}
      />

      <CompanieDialog
        isOpen={isCompanyDialogOpen}
        isSaving={isQuickSavingCompany}
        onClose={() => setCompanyDialogOpen(false)}
        onSave={handleQuickCompanySave}
        people={people}
        onRequestNewPerson={() => setPersonDialogOpen(true)}
      />
    </>
  )
}

const Deals = () => {
  const [deals, setDeals] = useState([])
  const [people, setPeople] = useState([])
  const [companies, setCompanies] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const loadDeals = useEffectEvent(async () => {
    setIsLoading(true)

    try {
      const [dealsData, peopleData, companiesData, productsData, servicesData] = await Promise.all([
        listDeals(),
        listPeople(),
        listCompanies(),
        listProducts(),
        listServices(),
      ])

      setDeals(dealsData)
      setPeople(peopleData)
      setCompanies(companiesData)
      setProducts(productsData)
      setServices(servicesData)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    loadDeals()
  }, [])

  const handleDelete = (deal) => {
    toast.warning("Confirmar exclusao do negocio?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            if (deal.productId) {
              const product = products.find((item) => item.id === deal.productId)

              if (product && product.status === "Em negociacao") {
                await updateProduct(product.id, {
                  status: "Disponivel",
                  currentDealId: null,
                })
              }
            }

            await removeDeal(deal.id)
            setDeals((current) => current.filter((item) => item.id !== deal.id))
            toast.success("Negocio excluido com sucesso")
            await loadDeals()
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
      const saved = await createDeal(payload)

      if (payload.productId) {
        await updateProduct(payload.productId, {
          status: "Em negociacao",
          currentDealId: saved.id,
        })
      }

      setDeals((current) => [saved, ...current])
      setDialogOpen(false)
      toast.success("Negocio adicionado com sucesso")
      await loadDeals()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
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

  const handleView = (deal) => {
    toast(
      `${deal.empresa || deal.contato} | ${deal.tipoDemanda} | Produto: ${deal.produtoNegociado || "-"} | Lucro: ${deal.lucroReal || formatCurrency(deal.lucroValor || 0)}`
    )
  }

  const summaryCards = [
    { label: "Negocios ativos", value: deals.length, detail: "Demandas abertas, em negociacao ou encerradas com historico." },
    { label: "Compra", value: deals.filter((deal) => deal.tipoDemanda === "Compra").length, detail: "Clientes buscando caminhao ou oportunidade de venda." },
    { label: "Venda", value: deals.filter((deal) => deal.tipoDemanda === "Venda").length, detail: "Leads oferecendo caminhao para compra da loja." },
  ]

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Negocios</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Demandas ligadas a pessoas, empresas, estoque e margem</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Agora o negocio conecta quem demandou, prazo, proposta, produto em estoque ou descricao manual e lucro estimado antes do fechamento.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDeals} text="Atualizar" size="md" className="bg-white text-slate-700 ring-1 ring-slate-200" icon={<ArrowPathIcon className="h-4 w-4" />} disabled={isLoading} />
          <Button onClick={() => setDialogOpen(true)} text="Adicionar negocio" icon={<PlusIcon className="h-4 w-4" />} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-white p-2 text-amber-600 shadow-sm"><BriefcaseIcon className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p></div></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
        {isLoading ? <div className="px-6 py-12 text-center text-sm text-slate-500">Carregando negocios do json-server...</div> : !deals.length ? <div className="px-6 py-12 text-center text-sm text-slate-500">Nenhum negocio cadastrado ainda.</div> : (
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3 font-medium">Origem</th><th className="px-4 py-3 font-medium">Tipo e prazo</th><th className="px-4 py-3 font-medium">Produto</th><th className="px-4 py-3 font-medium">Proposta e lucro</th><th className="px-4 py-3 font-medium">Acoes</th></tr></thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-4"><p className="font-medium text-slate-800">{deal.empresa || deal.contato || "Sem identificacao"}</p><p className="mt-1 text-slate-500">{deal.contato || "Sem pessoa vinculada"}</p></td>
                  <td className="px-4 py-4"><p className="font-medium text-slate-800">{deal.tipoDemanda}</p><p className="mt-1 text-slate-500">{deal.prazoDias ? `${deal.prazoDias} dias` : "Sem prazo"} - {deal.status}</p></td>
                  <td className="px-4 py-4"><p className="font-medium text-slate-800">{deal.produtoNegociado || "A definir"}</p><p className="mt-1 text-slate-500">{deal.produtoOrigem === "Estoque" ? "Vindo do estoque" : "Descricao manual"}</p></td>
                  <td className="px-4 py-4"><p className="font-medium text-slate-800">Proposta: {deal.propostaCliente}</p><p className="mt-1 text-slate-500">Lucro: {deal.lucroReal || formatCurrency(parseMoney(deal.lucroValor))} - {deal.margemReal || formatPercent(deal.lucroPercentual)}</p></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><button type="button" className="rounded-full p-2 text-amber-600 transition hover:bg-amber-50" onClick={() => handleView(deal)}><ArrowTopRightOnSquareIcon className="h-4 w-4" /></button><button type="button" className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50" onClick={() => handleDelete(deal)}><TrashIcon className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <DealDialog
        isOpen={isDialogOpen}
        isSaving={isSaving}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        people={people}
        companies={companies}
        products={products}
        services={services}
        onQuickCreatePerson={handleQuickCreatePerson}
        onQuickCreateCompany={handleQuickCreateCompany}
      />
    </section>
  )
}

export default Deals