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
    </Dialog>
  )
}

export default CompanieDialog