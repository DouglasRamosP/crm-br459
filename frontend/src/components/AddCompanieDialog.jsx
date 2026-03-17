import { useState } from "react"

import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"
import Select from "./Select"

const categoryOptions = ["Cliente", "Prestador de servico", "Fornecedor"]

const baseForm = {
  nome: "",
  categoria: categoryOptions[0],
  responsavelId: "",
  cidade: "",
  email: "",
  telefone: "",
}

const createFormState = (initialValues = {}) => ({
  ...baseForm,
  ...initialValues,
  categoria: initialValues.categoria || baseForm.categoria,
  responsavelId: initialValues.responsavelId || "",
})

const CompanieDialog = ({
  isOpen,
  isSaving = false,
  onClose,
  onSave,
  people = [],
  historySummary = null,
  onRequestNewPerson,
  initialValues = baseForm,
  title = "Cadastrar empresa",
  subtitle = "Empresa organiza o historico institucional e aponta para pessoas reais.",
  submitText = "Salvar empresa",
}) => {
  const [form, setForm] = useState(() => createFormState(initialValues))

  const handleClose = () => {
    setForm(createFormState(initialValues))
    onClose?.()
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleResponsibleChange = (event) => {
    const responsavelId = event.target.value
    const person = people.find((item) => item.id === responsavelId)

    setForm((current) => ({
      ...current,
      responsavelId,
      email: person?.email || current.email,
      telefone: person?.telefone || current.telefone,
    }))
  }

  const handleSubmit = () => {
    if (isSaving || !form.nome || !form.categoria || !form.responsavelId) return

    const person = people.find((item) => item.id === form.responsavelId)

    onSave?.({
      ...form,
      responsavel: person?.nome || initialValues.responsavel || "",
      email: form.email || person?.email || initialValues.email || "",
      telefone: form.telefone || person?.telefone || initialValues.telefone || "",
    })
  }

  const footer = (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button onClick={handleClose} size="lg" text="Cancelar" disabled={isSaving} />
      <Button onClick={handleSubmit} size="lg" text={isSaving ? "Salvando..." : submitText} disabled={isSaving} />
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSaving ? undefined : handleClose}
      title={title}
      subtitle={subtitle}
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input id="company-name" label="Nome da empresa" placeholder="Nome da empresa" value={form.nome} onChange={handleChange("nome")} />
        <Select id="company-category" label="Categoria" value={form.categoria} onChange={handleChange("categoria")} options={categoryOptions} />
        <div>
          <Select
            id="company-responsible"
            label="Responsavel"
            value={form.responsavelId}
            onChange={handleResponsibleChange}
            options={[
              { label: "Selecione uma pessoa existente", value: "" },
              ...people.map((person) => ({ label: person.nome, value: person.id })),
            ]}
          />
          {onRequestNewPerson ? (
            <button type="button" onClick={onRequestNewPerson} className="mt-2 text-sm font-medium text-amber-700 transition hover:text-amber-800">
              Responsavel nao encontrado? Cadastrar pessoa agora.
            </button>
          ) : null}
        </div>
        <Input id="company-city" label="Cidade / regiao" placeholder="Cidade/UF" value={form.cidade} onChange={handleChange("cidade")} />
        <Input id="company-email" label="E-mail do responsavel" placeholder="email@empresa.com.br" value={form.email} onChange={handleChange("email")} />
        <Input id="company-phone" label="Contato do responsavel" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange("telefone")} />
      </div>

      {historySummary ? (
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Historico essencial</p>
              <p className="text-sm text-slate-500">Resumo rapido da participacao dessa empresa na operacao.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {initialValues.responsavel || "Sem responsavel"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pessoas</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{historySummary.people}</p>
            </article>
            <article className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Negocios</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{historySummary.deals}</p>
            </article>
            <article className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Servicos</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{historySummary.services}</p>
            </article>
          </div>
        </div>
      ) : null}
    </Dialog>
  )
}

export default CompanieDialog
