import Button from "./Button"
import { PlusIcon } from "@heroicons/react/24/solid"
import CompaniesTable from "./CompaniesTable"

const Companies = () => {
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
        <CompaniesTable />
      </div>
    </div>
  )
}

export default Companies
