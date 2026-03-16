const SidebarButton = ({
  description,
  icon,
  isSelected,
  label,
  onClick,
}) => {
  const variantClasses = isSelected
    ? "bg-slate-900 text-white"
    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"

  return (
    <button
      type="button"
      onClick={onClick}
      title={description}
      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${variantClasses}`}
    >
      <span
        className={`absolute bottom-2 left-0 top-2 w-1 rounded-full bg-amber-400 transition ${
          isSelected ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`rounded-xl p-2 ${
          isSelected ? "bg-white/10 text-amber-300" : "bg-white text-amber-600"
        }`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium">{label}</p>
    </button>
  )
}

export default SidebarButton
