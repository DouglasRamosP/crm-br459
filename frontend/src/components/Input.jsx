const Input = ({ label, error, hint, className = "", ...rest }) => {
  const messageId = rest.id ? `${rest.id}-message` : undefined

  return (
    <div className="mb-3 flex flex-col space-y-1 text-left">
      <label htmlFor={rest.id} className="rounded-lg text-sm font-semibold text-[#35383E]">
        {label}
      </label>
      <input
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        className={`rounded-lg border border-solid px-4 py-3 outline-yellow-600 placeholder:text-sm placeholder:text-[#9A9C9F] ${error ? "border-rose-400 bg-rose-50/40" : "border-[#ECECEC]"} ${rest.disabled ? "bg-slate-50 text-slate-500" : ""} ${className}`.trim()}
      />
      {error ? (
        <p id={messageId} className="text-sm font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default Input