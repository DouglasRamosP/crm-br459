import {
  ArrowTopRightOnSquareIcon,
  BuildingOfficeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid"

const CompaniesTable = ({ companies, onDelete, onView }) => {
  return (
    <div className="overflow-x-auto rounded-lg bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b bg-gray-50">
          <tr className="text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Empresa</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Responsável</th>
            <th className="px-4 py-3 font-medium">E-mail</th>
            <th className="px-4 py-3 font-medium">Telefone</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium text-gray-800">
                <div className="flex items-center justify-between gap-3">
                  {/* Ícone + Nome */}
                  <div className="flex min-w-0 items-center gap-1">
                    <BuildingOfficeIcon className="h-4 w-4 shrink-0 text-yellow-600 opacity-60" />

                    <span className="truncate">{company.nome}</span>
                  </div>

                  {/* Ações */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="shrink-0"
                      title="Ver detalhes"
                      onClick={() => onView(company)}
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5 text-yellow-600 transition hover:bg-yellow-100 hover:text-yellow-700" />
                    </button>

                    <button
                      type="button"
                      className="shrink-0"
                      title="Excluir"
                      onClick={() => onDelete(company.id)}
                    >
                      <TrashIcon className="h-5 w-5 text-yellow-600" />
                    </button>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                  {company.categoria}
                </span>
              </td>
              <td className="px-4 py-3">{company.responsavel}</td>
              <td className="px-4 py-3 text-gray-600">{company.email}</td>
              <td className="px-4 py-3">{company.telefone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CompaniesTable
