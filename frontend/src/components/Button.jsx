const Button = ({ text, icon }) => {
  return (
    <button className="flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-600 transition hover:opacity-75">
      {icon}
      {text}
    </button>
  )
}

export default Button
