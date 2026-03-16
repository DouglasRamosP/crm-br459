import { ArrowPathIcon, BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createCompany, listCompanies, removeCompany, updateCompany } from "../services/companies"
import { listDeals } from "../services/deals"
import { createPerson, listPeople } from "../services/people"
import { listServices } from "../services/serviceRecords"
import CompanieDialog from "./AddCompanieDialog"
import Button from "./Button"
import CompaniesTable from "./CompaniesTable"
import PersonDialog from "./PersonDialog"

const historyForCompany = (company, people, deals, services) => ({
  people: people.filter((person) => person.empresaId === company.id).length,
  deals: deals.filter((deal) => deal.companyId === company.id || deal.empresa === company.nome).length,
  services: services.filter((service) => service.companyId === company.id || service.providerCompanyId === company.id).length,
})

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [people, setPeople] = useState([])
  const [deals, setDeals] = useState([])
  const [services, setServices] = useState([])
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isPersonDialogOpen, setPersonDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPerson, setIsSavingPerson] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)

  const loadCompanies = async () => {
    setIsLoading(true)

    try {
      const [companiesData, peopleData, dealsData, servicesData] = await Promise.all([
        listCompanies(),
        listPeople(),
        listDeals(),
        listServices(),
      ])

      setCompanies(companiesData)
      setPeople(peopleData)
      setDeals(dealsData)
      setServices(servicesData)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleDelete = (company) => {
    const history = historyForCompany(company, people, deals, services)

    if (history.people || history.deals || history.services) {
      toast.error("Essa empresa possui historico vinculado e nao pode ser excluida agora.")
      return
    }

    toast.warning("Confirmar exclusao?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await removeCompany(company.id)
            setCompanies((prevCompanies) => prevCompanies.filter((item) => item.id !== company.id))
            toast.success("Empresa excluida com sucesso")
          } catch (error) {
            toast.error(error.message)
          }
        },
      },
    })
  }

  const handleView = (company) => {
    setSelectedCompany(company)
    setDialogOpen(true)
  }

  const handleSaveCompany = async (company) => {
    setIsSaving(true)

    try {
      if (selectedCompany) {
        const savedCompany = await updateCompany(selectedCompany.id, company)
        setCompanies((prevCompanies) => prevCompanies.map((item) => (item.id === selectedCompany.id ? savedCompany : item)))
        toast.success("Empresa atualizada com sucesso")
      } else {
        const savedCompany = await createCompany(company)
        setCompanies((prevCompanies) => [savedCompany, ...prevCompanies])
        toast.success("Empresa adicionada com sucesso")
      }

      setDialogOpen(false)
      setSelectedCompany(null)
      await loadCompanies()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePerson = async (person) => {
    setIsSavingPerson(true)

    try {
      const savedPerson = await createPerson(person)
      setPeople((current) => [savedPerson, ...current])
      toast.success("Pessoa adicionada com sucesso")
      setPersonDialogOpen(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSavingPerson(false)
    }
  }

  const openCreate = () => {
    setSelectedCompany(null)
    setDialogOpen(true)
  }

  const categoryCount = (category) => companies.filter((company) => company.categoria === category).length

  const summaryCards = [
    {
      label: "Empresas cadastradas",
      value: companies.length,
      detail: "Base institucional consolidada para o relacionamento comercial.",
    },
    {
      label: "Clientes",
      value: categoryCount("Cliente"),
      detail: "Contas com potencial de recorrencia e recompra.",
    },
    {
      label: "Prestadores e fornecedores",
      value: categoryCount("Prestador de servico") + categoryCount("Fornecedor"),
      detail: "Ecossistema que sustenta compra, servico e negociacao.",
    },
  ]

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Ecossistema</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Empresas conectadas a pessoas, negocios e servicos</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">O responsavel sempre aponta para uma pessoa existente, evitando cadastro solto e perda de contexto.</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadCompanies} text="Atualizar" size="md" className="bg-white text-slate-700 ring-1 ring-slate-200" icon={<ArrowPathIcon className="h-4 w-4" />} disabled={isLoading} />
          <Button onClick={openCreate} text="Adicionar empresa" icon={<PlusIcon className="h-4 w-4" />} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-2 text-amber-600 shadow-sm">
                <BuildingOffice2Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Carregando empresas do json-server...
          </div>
        ) : (
          <CompaniesTable
            companies={companies}
            onDelete={handleDelete}
            onView={handleView}
            historyForCompany={(company) => historyForCompany(company, people, deals, services)}
          />
        )}
      </div>

      <CompanieDialog
        key={selectedCompany?.id || "new-company"}
        isOpen={isDialogOpen}
        isSaving={isSaving}
        onClose={() => {
          setDialogOpen(false)
          setSelectedCompany(null)
        }}
        onSave={handleSaveCompany}
        people={people}
        onRequestNewPerson={() => setPersonDialogOpen(true)}
        initialValues={selectedCompany || undefined}
        title={selectedCompany ? `Detalhes de ${selectedCompany.nome}` : "Cadastrar empresa"}
        subtitle={selectedCompany ? "Revise o responsavel, categoria e dados de contato desta empresa." : "Empresa organiza o historico institucional e aponta para pessoas reais."}
        submitText={selectedCompany ? "Salvar alteracoes" : "Salvar empresa"}
      />

      <PersonDialog
        isOpen={isPersonDialogOpen}
        isSaving={isSavingPerson}
        onClose={() => setPersonDialogOpen(false)}
        onSave={handleSavePerson}
        companies={companies}
      />
    </section>
  )
}

export default Companies