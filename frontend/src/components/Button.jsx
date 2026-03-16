const Button = ({
  text,
  icon,
  size = "md",
  className = "",
  disabled = false,
  ...rest
}) => {
  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  }

  return (
    <button
      {...rest}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-md bg-yellow-100 text-xs font-semibold text-yellow-700 transition ${disabled ? "cursor-not-allowed opacity-50" : "hover:opacity-75"} ${sizes[size]} ${className}`}
    >
      {icon}
      {text}
    </button>
  )
}

export default Button
