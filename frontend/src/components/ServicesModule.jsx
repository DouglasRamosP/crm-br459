import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createCompany, listCompanies } from "../services/companies"
import { listDeals } from "../services/deals"
import { createPerson, listPeople } from "../services/people"
import { listProducts } from "../services/products"
import { createService, listServices, removeService, updateService } from "../services/serviceRecords"
import {
  formatCurrency,
  formatCurrencyInput,
  getServiceStatusTone,
  parseMoney,
  toCurrencyInputValue,
} from "../utils/business"
import CompanieDialog from "./AddCompanieDialog"
import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"
import PersonDialog from "./PersonDialog"
import Select from "./Select"

const statusOptions = ["Em andamento", "Agendado", "Concluído", "Pendente"]
const typeOptions = ["Mecanica", "Regularizacao", "Transporte", "Vistoria", "Outro"]
const statusToneClasses = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  slate: "bg-slate-100 text-slate-700",
}

const baseForm = {
  nome: "",
  tipo: typeOptions[0],
  status: statusOptions[0],
  custo: "",
  prazoDias: "",
  impacto: "",
  providerPersonId: "",
  providerCompanyId: "",
  personId: "",
  companyId: "",
  productId: "",
  dealId: "",
}

const createFormState = (initialValues = {}) => ({
  ...baseForm,
  ...initialValues,
  custo: toCurrencyInputValue(initialValues.custo || initialValues.custoValor),
  prazoDias: initialValues.prazoDias != null ? String(initialValues.prazoDias) : "",
})

export const ServiceDialog = ({
  isOpen,
  isSaving,
  onClose,
  onSave,
  people,
  companies,
  products,
  deals,
  onQuickCreatePerson,
  onQuickCreateCompany,
  initialValues = baseForm,
  title = "Cadastrar servico",
  subtitle = "Relacione custo, prestador e impacto com os modulos corretos.",
  submitText = "Salvar servico",
}) => {
  const [form, setForm] = useState(() => createFormState(initialValues))
  const [isPersonDialogOpen, setPersonDialogOpen] = useState(false)
  const [isCompanyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [isQuickSavingPerson, setQuickSavingPerson] = useState(false)
  const [isQuickSavingCompany, setQuickSavingCompany] = useState(false)

  const handleClose = () => {
    setForm(createFormState(initialValues))
    setPersonDialogOpen(false)
    setCompanyDialogOpen(false)
    onClose?.()
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleMoneyChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: formatCurrencyInput(event.target.value) }))
  }

  const handleSubmit = () => {
    if (!form.nome || !form.custo) return

    const providerPerson = people.find((person) => person.id === form.providerPersonId)
    const providerCompany = companies.find((company) => company.id === form.providerCompanyId)
    const linkedPerson = people.find((person) => person.id === form.personId)
    const linkedCompany = companies.find((company) => company.id === form.companyId)
    const linkedProduct = products.find((product) => product.id === form.productId)
    const linkedDeal = deals.find((deal) => deal.id === form.dealId)

    onSave?.({
      ...form,
      prazoDias: Number(form.prazoDias || 0),
      custoValor: parseMoney(form.custo),
      prestador: providerCompany?.nome || providerPerson?.nome || "",
      providerType: providerCompany ? "Empresa" : providerPerson ? "Pessoa" : "",
      vinculo: [linkedProduct?.modelo, linkedDeal?.descricao, linkedCompany?.nome, linkedPerson?.nome]
        .filter(Boolean)
        .join(" | "),
    })
  }

  const handleQuickPersonSave = async (payload) => {
    setQuickSavingPerson(true)

    try {
      const saved = await onQuickCreatePerson(payload)
      setForm((current) => ({ ...current, providerPersonId: saved.id }))
      setPersonDialogOpen(false)
    } finally {
      setQuickSavingPerson(false)
    }
  }

  const handleQuickCompanySave = async (payload) => {
    setQuickSavingCompany(true)

    try {
      const saved = await onQuickCreateCompany(payload)
      setForm((current) => ({ ...current, providerCompanyId: saved.id }))
      setCompanyDialogOpen(false)
    } finally {
      setQuickSavingCompany(false)
    }
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
          <Input id="service-name" label="Servico" value={form.nome} onChange={handleChange("nome")} placeholder="Nome do servico" />
          <Select id="service-type" label="Tipo" value={form.tipo} onChange={handleChange("tipo")} options={typeOptions} />
          <Input id="service-cost" label="Custo" value={form.custo} onChange={handleMoneyChange("custo")} placeholder="R$ 3.200" />
          <Input id="service-deadline" label="Prazo (dias)" type="number" value={form.prazoDias} onChange={handleChange("prazoDias")} placeholder="Ex.: 5" />
          <Input id="service-impact" label="Impacto / observacao" value={form.impacto} onChange={handleChange("impacto")} placeholder="Como isso afeta margem ou entrega" />
          <Select id="service-status" label="Status" value={form.status} onChange={handleChange("status")} options={statusOptions} />
          <div>
            <Select id="service-provider-person" label="Prestador pessoa (opcional)" value={form.providerPersonId} onChange={handleChange("providerPersonId")} options={[{ label: "Selecione uma pessoa", value: "" }, ...people.map((person) => ({ label: person.nome, value: person.id }))]} />
            <button type="button" onClick={() => setPersonDialogOpen(true)} className="mt-2 text-sm font-medium text-amber-700 transition hover:text-amber-800">Pessoa nao encontrada? Cadastrar agora.</button>
          </div>
          <div>
            <Select id="service-provider-company" label="Prestador empresa (opcional)" value={form.providerCompanyId} onChange={handleChange("providerCompanyId")} options={[{ label: "Selecione uma empresa", value: "" }, ...companies.map((company) => ({ label: company.nome, value: company.id }))]} />
            <button type="button" onClick={() => setCompanyDialogOpen(true)} className="mt-2 text-sm font-medium text-amber-700 transition hover:text-amber-800">Empresa nao encontrada? Cadastrar agora.</button>
          </div>
          <Select id="service-person" label="Pessoa vinculada (opcional)" value={form.personId} onChange={handleChange("personId")} options={[{ label: "Sem pessoa vinculada", value: "" }, ...people.map((person) => ({ label: person.nome, value: person.id }))]} />
          <Select id="service-company" label="Empresa vinculada (opcional)" value={form.companyId} onChange={handleChange("companyId")} options={[{ label: "Sem empresa vinculada", value: "" }, ...companies.map((company) => ({ label: company.nome, value: company.id }))]} />
          <Select id="service-product" label="Produto vinculado (opcional)" value={form.productId} onChange={handleChange("productId")} options={[{ label: "Sem produto vinculado", value: "" }, ...products.map((product) => ({ label: product.modelo, value: product.id }))]} />
          <Select id="service-deal" label="Negocio vinculado (opcional)" value={form.dealId} onChange={handleChange("dealId")} options={[{ label: "Sem negocio vinculado", value: "" }, ...deals.map((deal) => ({ label: `${deal.empresa || deal.contato || "Negocio"} - ${deal.descricao}`, value: deal.id }))]} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Custo em valor</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(parseMoney(form.custo))}</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prazo estimado</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{form.prazoDias || 0} dias</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Impacto</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{form.impacto || "Sem observacao"}</p>
          </article>
        </div>
      </Dialog>

      <PersonDialog isOpen={isPersonDialogOpen} isSaving={isQuickSavingPerson} onClose={() => setPersonDialogOpen(false)} onSave={handleQuickPersonSave} companies={companies} />
      <CompanieDialog isOpen={isCompanyDialogOpen} isSaving={isQuickSavingCompany} onClose={() => setCompanyDialogOpen(false)} onSave={handleQuickCompanySave} people={people} onRequestNewPerson={() => setPersonDialogOpen(true)} />
    </>
  )
}

const Services = () => {
  const [services, setServices] = useState([])
  const [people, setPeople] = useState([])
  const [companies, setCompanies] = useState([])
  const [products, setProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  const loadServices = async () => {
    setIsLoading(true)

    try {
      const [servicesData, peopleData, companiesData, productsData, dealsData] = await Promise.all([
        listServices(),
        listPeople(),
        listCompanies(),
        listProducts(),
        listDeals(),
      ])

      setServices(servicesData)
      setPeople(peopleData)
      setCompanies(companiesData)
      setProducts(productsData)
      setDeals(dealsData)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleDelete = (service) => {
    toast.warning("Confirmar exclusao do servico?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await removeService(service.id)
            setServices((current) => current.filter((item) => item.id !== service.id))
            toast.success("Servico excluido com sucesso")
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
      if (selectedService) {
        const saved = await updateService(selectedService.id, payload)
        setServices((current) => current.map((item) => (item.id === selectedService.id ? saved : item)))
        toast.success("Servico atualizado com sucesso")
      } else {
        const saved = await createService(payload)
        setServices((current) => [saved, ...current])
        toast.success("Servico adicionado com sucesso")
      }

      setDialogOpen(false)
      setSelectedService(null)
      await loadServices()
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

  const handleView = (service) => {
    setSelectedService(service)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setSelectedService(null)
    setDialogOpen(true)
  }

  const summaryCards = [
    { label: "Servicos registrados", value: services.length, detail: "Custos e prestacoes ligados a produto, negocio, pessoa ou empresa." },
    { label: "Em andamento", value: services.filter((service) => service.status === "Em andamento").length, detail: "Itens que ainda podem alterar a margem final." },
    { label: "Custos em aberto", value: formatCurrency(services.filter((service) => service.status !== "Concluído").reduce((sum, service) => sum + parseMoney(service.custoValor || service.custo), 0)), detail: "Volume financeiro ainda pressionando o resultado." },
  ]

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Servicos</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Prestacoes com custo, prazo e vinculo direto ao dominio</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cada servico pode apontar para produto, negocio, pessoa, empresa e prestador, mantendo o impacto financeiro rastreavel.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadServices} text="Atualizar" size="md" className="bg-white text-slate-700 ring-1 ring-slate-200" icon={<ArrowPathIcon className="h-4 w-4" />} disabled={isLoading} />
          <Button onClick={openCreate} text="Adicionar servico" icon={<PlusIcon className="h-4 w-4" />} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-white p-2 text-amber-600 shadow-sm"><WrenchScrewdriverIcon className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p></div></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
        {isLoading ? <div className="px-6 py-12 text-center text-sm text-slate-500">Carregando servicos do json-server...</div> : !services.length ? <div className="px-6 py-12 text-center text-sm text-slate-500">Nenhum servico cadastrado ainda.</div> : (
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3 font-medium">Servico</th><th className="px-4 py-3 font-medium">Vinculos</th><th className="px-4 py-3 font-medium">Prestador</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Acoes</th></tr></thead>
            <tbody>
              {services.map((service) => {
                const statusTone = statusToneClasses[getServiceStatusTone(service.status)] || statusToneClasses.slate

                return (
                  <tr key={service.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-4"><p className="font-medium text-slate-800">{service.nome}</p><p className="mt-1 text-slate-500">{service.custo || formatCurrency(service.custoValor || 0)}</p></td>
                    <td className="px-4 py-4 text-slate-700">{service.vinculo || "Sem vinculo"}</td>
                    <td className="px-4 py-4 text-slate-700">{service.prestador || "Sem prestador"}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>{service.status}</span></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><button type="button" className="rounded-full p-2 text-amber-600 transition hover:bg-amber-50" onClick={() => handleView(service)}><ArrowTopRightOnSquareIcon className="h-4 w-4" /></button><button type="button" className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50" onClick={() => handleDelete(service)}><TrashIcon className="h-4 w-4" /></button></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <ServiceDialog
        key={selectedService?.id || "new-service"}
        isOpen={isDialogOpen}
        isSaving={isSaving}
        onClose={() => {
          setDialogOpen(false)
          setSelectedService(null)
        }}
        onSave={handleSave}
        people={people}
        companies={companies}
        products={products}
        deals={deals}
        onQuickCreatePerson={handleQuickCreatePerson}
        onQuickCreateCompany={handleQuickCreateCompany}
        initialValues={selectedService || undefined}
        title={selectedService ? `Detalhes de ${selectedService.nome}` : "Cadastrar servico"}
        subtitle={selectedService ? "Revise custo, prazo, prestador e vinculos deste servico." : "Relacione custo, prestador e impacto com os modulos corretos."}
        submitText={selectedService ? "Salvar alteracoes" : "Salvar servico"}
      />
    </section>
  )
}

export default Services
