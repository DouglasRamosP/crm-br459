import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  SparklesIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid"
import { useState } from "react"
import { Toaster } from "sonner"

import DemandCommandCenter from "./components/DemandCommandCenter.jsx"
import Sidebar from "./components/Sidebar.jsx"

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "KPIs, filtros, alertas e leitura executiva",
    icon: ChartBarSquareIcon,
  },
  {
    id: "negocios",
    label: "Negócios",
    description: "Funil comercial guiado por demanda",
    icon: BriefcaseIcon,
  },
  {
    id: "estoque",
    label: "Estoque",
    description: "Giro, capital parado e precificacao",
    icon: TruckIcon,
  },
  {
    id: "pessoas",
    label: "Pessoas",
    description: "Identidade unica com papeis dinamicos",
    icon: UserGroupIcon,
  },
  {
    id: "empresas",
    label: "Empresas",
    description: "Clientes PJ, parceiros e fornecedores",
    icon: BuildingOffice2Icon,
  },
  {
    id: "servicos",
    label: "Servicos",
    description: "Custos que alteram a margem real",
    icon: WrenchScrewdriverIcon,
  },
  {
    id: "inteligencia",
    label: "IA e alertas",
    description: "Sugestoes, sinais e automacoes proativas",
    icon: SparklesIcon,
  },
]

export default function App() {
  const [activeView, setActiveView] = useState("dashboard")

  return (
    <div className="min-h-screen bg-transparent lg:flex">
      <Toaster richColors position="top-center" />
      <Sidebar
        activeView={activeView}
        items={navigationItems}
        onSelect={setActiveView}
      />

      <div className="lg:hidden">
        <div className="sticky top-0 z-20 border-b border-white/70 bg-[#fbf7ef]/90 px-4 py-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            BR-459
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            CRM orientado a demanda
          </h1>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeView === item.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DemandCommandCenter activeView={activeView} />
    </div>
  )
}
