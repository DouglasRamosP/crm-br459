const SidebarButton = ({ children, variant }) => {
  const getVariantClasses = () => {
    if (variant === "unselected") {
      return "text-[#35383E]"
    }
    if (variant === "selected") {
      return "bg-yellow-100 text-yellow-600"
    }
  }

  return (
    <a
      href="#"
      className={`flex gap-2 rounded-lg px-6 py-3 ${getVariantClasses()}`}
    >
      {children}
    </a>
  )
}

export default SidebarButton
