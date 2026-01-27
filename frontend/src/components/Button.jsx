const Button = ({ text, icon, size = "md", className = "", ...rest }) => {
  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  }

  return (
    <button
      {...rest}
      className={`flex items-center gap-2 rounded-md bg-yellow-100 text-xs font-semibold text-yellow-600 transition hover:opacity-75 ${sizes[size]} ${className} `}
    >
      {icon}
      {text}
    </button>
  )
}

export default Button
