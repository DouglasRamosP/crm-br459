import { PlusIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import { toast } from "sonner"

import companiesMock from "../constants/companies"
import Button from "./Button"
import CompaniesTable from "./CompaniesTable"

const Companies = () => {
  const [companies, setCompanies] = useState(companiesMock)

  const handleDelete = (id) => {
    toast.warning("Confirmar exclusão?", {
      action: {
        label: "Excluir",
        onClick: () => {
          setCompanies((prevCompanies) =>
            prevCompanies.filter((company) => company.id !== id)
          )
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
          <h2 className="text-xl font-semibold">Empresas cadastradas</h2>
        </div>

        <div>
          <Button
            text="Adicionar empresa"
            icon={<PlusIcon className="h-6 w-6 text-yellow-600" />}
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
