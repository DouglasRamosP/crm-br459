import SidebarButton from "./SidebarButton"

const Sidebar = ({ activeView, items, onSelect }) => {
  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-white/60 bg-[#f8f3ea]/90 px-4 py-5 backdrop-blur lg:block">
      <div className="rounded-[24px] border border-white/80 bg-white/80 px-4 py-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">
          BR-459
        </p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          CRM orientado a demanda
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Negocio primeiro, produto depois.
        </p>
      </div>

      <div className="mt-6">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Modulos
        </p>
        <div className="mt-3 space-y-1 rounded-[20px] border border-white/80 bg-white/70 p-2 shadow-sm">
          {items.map((item) => (
            <SidebarButton
              key={item.id}
              description={item.description}
              icon={<item.icon className="h-5 w-5" />}
              isSelected={activeView === item.id}
              label={item.label}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 px-2">
        <p className="text-xs leading-5 text-slate-500">
          Estoque deixa de ser o centro e passa a responder a demanda ativa.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
