const Select = ({ label, options = [], ...rest }) => {
  return (
    <div className="mb-3 flex flex-col space-y-1 text-left">
      <label
        htmlFor={rest.id}
        className="rounded-lg text-sm font-semibold text-[#35383E]"
      >
        {label}
      </label>
      <select
        {...rest}
        className="rounded-lg border border-solid border-[#ECECEC] bg-white px-4 py-3 outline-yellow-600"
      >
        {options.map((option) => {
          const normalizedOption =
            typeof option === "string"
              ? { label: option, value: option }
              : option

          return (
            <option key={normalizedOption.value} value={normalizedOption.value}>
              {normalizedOption.label}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default Select
