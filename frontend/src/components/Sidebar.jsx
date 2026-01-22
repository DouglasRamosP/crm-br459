import {
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid"

import SidebarButton from "./SidebarButton"

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white">
      <div className="px-8 py-6">
        <h1 className="text-xl font-semibold text-yellow-600">BR 459</h1>
        <p>
          Sistema{" "}
          <span className="font-semibold text-yellow-600">
            Gestão e Negócios
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 p-2">
        <SidebarButton variant="unselected">
          <HomeIcon className="h-6 w-6 text-yellow-600" />
          Início
        </SidebarButton>
        <SidebarButton variant="unselected">
          <DocumentCheckIcon className="h-6 w-6 text-yellow-600" />
          Tarefas
        </SidebarButton>
        <SidebarButton variant="selected">
          <BuildingOffice2Icon className="h-6 w-6 text-yellow-600" />
          Empresas
        </SidebarButton>
        <SidebarButton variant="unselected">
          <UserGroupIcon className="h-6 w-6 text-yellow-600" />
          Pessoas
        </SidebarButton>
        <SidebarButton variant="unselected">
          <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
          Negócios
        </SidebarButton>
        <SidebarButton variant="unselected">
          <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
          Relatórios
        </SidebarButton>
      </div>
    </div>
  )
}

export default Sidebar
