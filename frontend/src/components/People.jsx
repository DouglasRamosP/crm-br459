import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { listCompanies } from "../services/companies"
import { listDeals } from "../services/deals"
import { createPerson, listPeople, removePerson, updatePerson } from "../services/people"
import { listServices } from "../services/serviceRecords"
import Button from "./Button"
import PersonDialog from "./PersonDialog"

const historyForPerson = (person, deals, services, companies) => {
  const relatedDeals = deals.filter((deal) => deal.personId === person.id || deal.contato === person.nome)
  const relatedServices = services.filter((service) => service.personId === person.id || service.providerPersonId === person.id)
  const responsibleCompanies = companies.filter((company) => company.responsavelId === person.id)

  return {
    deals: relatedDeals.length,
    services: relatedServices.length,
    companies: responsibleCompanies.length,
  }
}

const People = () => {
  const [people, setPeople] = useState([])
  const [companies, setCompanies] = useState([])
  const [deals, setDeals] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const loadPeople = async () => {
    setIsLoading(true)

    try {
      const [peopleData, companiesData, dealsData, servicesData] = await Promise.all([
        listPeople(),
        listCompanies(),
        listDeals(),
        listServices(),
      ])

      setPeople(peopleData)
      setCompanies(companiesData)
      setDeals(dealsData)
      setServices(servicesData)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPeople()
  }, [])

  const handleDelete = (person) => {
    const history = historyForPerson(person, deals, services, companies)

    if (history.deals || history.services || history.companies) {
      toast.error("Essa pessoa ja possui historico vinculado e nao pode ser excluida agora.")
      return
    }

    toast.warning("Confirmar exclusao da pessoa?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await removePerson(person.id)
            setPeople((current) => current.filter((item) => item.id !== person.id))
            toast.success("Pessoa excluida com sucesso")
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
      if (selectedPerson) {
        const saved = await updatePerson(selectedPerson.id, payload)
        setPeople((current) => current.map((item) => (item.id === selectedPerson.id ? saved : item)))
        toast.success("Pessoa atualizada com sucesso")
      } else {
        const saved = await createPerson(payload)
        setPeople((current) => [saved, ...current])
        toast.success("Pessoa adicionada com sucesso")
      }

      setDialogOpen(false)
      setSelectedPerson(null)
      await loadPeople()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleView = (person) => {
    setSelectedPerson(person)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setSelectedPerson(null)
    setDialogOpen(true)
  }

  const summaryCards = [
    {
      label: "Pessoas cadastradas",
      value: people.length,
      detail: "Base de contatos ativa para vendas, compra e operacao.",
    },
    {
      label: "Clientes",
      value: people.filter((person) => person.papeis.includes("Cliente")).length,
      detail: "Compradores e decisores acompanhados pelo time.",
    },
    {
      label: "Prestadores e fornecedores",
      value: people.filter((person) => person.papeis.includes("Prestador de servico") || person.papeis.includes("Fornecedor")).length,
      detail: "Rede operacional e de sourcing conectada ao negocio.",
    },
  ]

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Pessoas</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Contatos com papeis dinamicos e historico visivel</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A pessoa pode ser cliente, fornecedora e prestadora ao mesmo tempo, sem duplicar cadastro.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPeople} text="Atualizar" size="md" className="bg-white text-slate-700 ring-1 ring-slate-200" icon={<ArrowPathIcon className="h-4 w-4" />} disabled={isLoading} />
          <Button onClick={openCreate} text="Adicionar pessoa" icon={<PlusIcon className="h-4 w-4" />} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-2 text-amber-600 shadow-sm">
                <UserGroupIcon className="h-5 w-5" />
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

      <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Carregando pessoas do json-server...</div>
        ) : !people.length ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Nenhuma pessoa cadastrada ainda.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Papeis</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Historico</th>
                <th className="px-4 py-3 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const history = historyForPerson(person, deals, services, companies)

                return (
                  <tr key={person.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">{person.nome}</p>
                      <p className="mt-1 text-slate-500">{person.email || person.telefone || "Sem contato informado"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {person.papeis.map((role) => (
                          <span key={role} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{person.empresa || "Sem empresa vinculada"}</td>
                    <td className="px-4 py-4 text-slate-600">{history.deals} negocios, {history.services} servicos, {history.companies} empresas</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button type="button" className="rounded-full p-2 text-amber-600 transition hover:bg-amber-50" onClick={() => handleView(person)}>
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50" onClick={() => handleDelete(person)}>
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <PersonDialog
        key={selectedPerson?.id || "new-person"}
        isOpen={isDialogOpen}
        isSaving={isSaving}
        onClose={() => {
          setDialogOpen(false)
          setSelectedPerson(null)
        }}
        onSave={handleSave}
        companies={companies}
        initialValues={selectedPerson || undefined}
        title={selectedPerson ? `Detalhes de ${selectedPerson.nome}` : "Cadastrar pessoa"}
        subtitle={selectedPerson ? "Revise o cadastro, historico e papeis desta pessoa." : "Pessoa tem identidade unica e pode acumular multiplos papeis."}
        submitText={selectedPerson ? "Salvar alteracoes" : "Salvar pessoa"}
      />
    </section>
  )
}

export default People