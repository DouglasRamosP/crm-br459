import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/24/solid"

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
                  <span className="min-w-0 truncate">{company.nome}</span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="shrink-0"
                      title="Ver detalhes"
                    >
                      <ArrowTopRightOnSquareIcon
                        className="transition hover:bg-yellow-100 hover:text-yellow-700 h-5 w-5 text-yellow-600 shrink-0"
                        onClick={() => onView(company)}
                      />
                    </button>
                    <button type="button" className=" shrink-0" title="Excluir">
                      <TrashIcon
                        className="h-5 w-5 text-yellow-600 shrink-0"
                        onClick={() => onDelete(company.id)}
                      />
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
