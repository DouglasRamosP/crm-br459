import {
  ArrowTopRightOnSquareIcon,
  BuildingOfficeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid"

const CompaniesTable = ({ companies, onDelete, onView, historyForCompany }) => {
  if (!companies.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Nenhuma empresa cadastrada ainda.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr className="text-left text-slate-500">
            <th className="px-4 py-3 font-medium">Empresa</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Responsavel</th>
            <th className="px-4 py-3 font-medium">Contato</th>
            <th className="px-4 py-3 font-medium">Historico</th>
            <th className="px-4 py-3 font-medium">Acoes</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => {
            const history = historyForCompany(company)

            return (
              <tr key={company.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-4 font-medium text-slate-800">
                  <div className="flex min-w-0 items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 shrink-0 text-amber-600 opacity-70" />
                    <span className="truncate">{company.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {company.categoria}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-700">{company.responsavel}</td>
                <td className="px-4 py-4 text-slate-600">{company.email || company.telefone || "-"}</td>
                <td className="px-4 py-4 text-slate-600">{history.people} pessoas, {history.deals} negocios, {history.services} servicos</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full p-2 text-amber-600 transition hover:bg-amber-50"
                      title="Ver detalhes"
                      onClick={() => onView(company)}
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50"
                      title="Excluir"
                      onClick={() => onDelete(company)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default CompaniesTable