const Button = ({ text, icon, ...rest }) => {
  return (
    <button
      className="flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-600 transition hover:opacity-75"
      {...rest}
    >
      {icon}
      {text}
    </button>
  )
}

export default Button
