const Button = ({ text, icon }) => {
  return (
    <button className="bg-yellow-100 text-yellow-600 flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold transition hover:opacity-75 ">
      {icon}
      {text}
    </button>
  )
}

export default Button
