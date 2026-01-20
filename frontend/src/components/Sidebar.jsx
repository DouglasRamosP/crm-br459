import SidebarButton from "./SidebarButton"

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

      <div className="flex flex-col gap 2 p-2">
        <SidebarButton variant="selected">Início</SidebarButton>
        <SidebarButton variant="unselected">Tarefas</SidebarButton>
        <SidebarButton variant="unselected">Empresas</SidebarButton>
        <SidebarButton variant="unselected">Pessoas</SidebarButton>
        <SidebarButton variant="unselected">Negócios</SidebarButton>
        <SidebarButton variant="unselected">Relatórios</SidebarButton>
      </div>
    </div>
  )
}

export default Sidebar
