import Button from "./Button"
import { PlusIcon } from "@heroicons/react/24/solid"
import CompaniesTable from "./CompaniesTable"
import { useState } from "react"
import companiesMock from "../constants/companies"
import { toast } from "sonner"

const Companies = () => {
  const [companies, setCompanies] = useState(companiesMock)

  const handleDelete = (id) => {
    toast.warning("Confirmar exclusão?", {
      action: {
        label: "Excluir",
        onClick: () => {
          setCompanies((prev) => prev.filter((c) => c.id !== id))
          toast.success("Empresa excluída com sucesso")
        },
      },
    })
  }

  const handleView = (company) => {
    toast(
      `
      Detalhes: ${company.nome} 
      Categoria: ${company.categoria} 
      Responsável: ${company.responsavel} 
      Email: ${company.email} 
      Telefone: ${company.telefone}
      `
    )
  }

  return (
    <div className="w-full px-8 py-16">
      <div className="flex justify-between pb-6">
        <div>
          <span className="text-xs font-semibold text-yellow-600">
            Parceiros e clientes
          </span>
          <h2 className="font-semibold text-xl">Empresas cadastradas</h2>
        </div>

        <div>
          <Button
            text="Adicionar empresa"
            icon={<PlusIcon className="w-6 h-6 text-yellow-600" />}
          />
        </div>
      </div>

      <div>
        <CompaniesTable
          companies={companies}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>
    </div>
  )
}

export default Companies
