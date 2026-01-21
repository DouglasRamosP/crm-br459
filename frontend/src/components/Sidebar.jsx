import SidebarButton from "./SidebarButton"
import { HomeIcon, DocumentCheckIcon, BuildingOffice2Icon, UserGroupIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid"

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white">
      <div className="px-8 py-6">
        <h1 className="text-xl font-semibold text-yellow-600">BR 459</h1>
        <p>
          Sistema{" "}
          <span className="text-yellow-600 font-semibold">
            Gestão e Negócios
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 p-2">
        <SidebarButton variant="unselected">
          <HomeIcon className="w-6 h-6 text-yellow-600" />
          Início
        </SidebarButton>
        <SidebarButton variant="unselected">
          <DocumentCheckIcon className="w-6 h-6 text-yellow-600" />
          Tarefas
        </SidebarButton>
        <SidebarButton variant="selected">
          <BuildingOffice2Icon className="w-6 h-6 text-yellow-600" />
          Empresas
        </SidebarButton>
        <SidebarButton variant="unselected">
          <UserGroupIcon className="w-6 h-6 text-yellow-600" />
          Pessoas
        </SidebarButton>
        <SidebarButton variant="unselected">
          <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
          Negócios
        </SidebarButton>
        <SidebarButton variant="unselected">
          <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600" />
          Relatórios
        </SidebarButton>
      </div>
    </div>
  )
}

export default Sidebar
