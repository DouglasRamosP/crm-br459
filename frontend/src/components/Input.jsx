const Input = ({ label, ...rest }) => {
  return (
    <div className="mb-3 flex flex-col space-y-1 text-left">
      <label
        htmlFor={rest.id}
        className="rounded-lg text-sm font-semibold text-[#35383E]"
      >
        {label}
      </label>
      <input
        {...rest}
        className="rounded-lg border border-solid border-[#ECECEC] px-4 py-3 outline-yellow-600 placeholder:text-sm placeholder:text-[#9A9C9F]"
      />
    </div>
  )
}

export default Input
