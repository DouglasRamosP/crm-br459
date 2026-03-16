import { useState } from "react"

import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"
import Select from "./Select"

const roleOptions = ["Cliente", "Prestador de servico", "Fornecedor"]

const initialForm = {
  nome: "",
  empresaId: "",
  email: "",
  telefone: "",
  cidade: "",
  observacoes: "",
  papeis: ["Cliente"],
}

const PersonDialog = ({
  isOpen,
  isSaving = false,
  onClose,
  onSave,
  companies = [],
  onRequestNewCompany,
}) => {
  const [form, setForm] = useState(initialForm)

  const handleClose = () => {
    setForm(initialForm)
    onClose?.()
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const toggleRole = (role) => {
    setForm((current) => {
      const hasRole = current.papeis.includes(role)
      const papeis = hasRole
        ? current.papeis.filter((item) => item !== role)
        : [...current.papeis, role]

      return {
        ...current,
        papeis: papeis.length ? papeis : [role],
      }
    })
  }

  const handleSubmit = () => {
    if (isSaving || !form.nome || !form.papeis.length) return

    const company = companies.find((item) => item.id === form.empresaId)

    onSave?.({
      ...form,
      empresa: company?.nome || "",
    })
  }

  const footer = (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button text="Cancelar" size="lg" onClick={handleClose} disabled={isSaving} />
      <Button
        text={isSaving ? "Salvando..." : "Salvar pessoa"}
        size="lg"
        onClick={handleSubmit}
        disabled={isSaving}
      />
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSaving ? undefined : handleClose}
      title="Cadastrar pessoa"
      subtitle="Pessoa tem identidade unica e pode acumular multiplos papeis."
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          id="person-name"
          label="Nome"
          value={form.nome}
          onChange={handleChange("nome")}
          placeholder="Nome completo"
        />
        <div>
          <Select
            id="person-company"
            label="Empresa vinculada (opcional)"
            value={form.empresaId}
            onChange={handleChange("empresaId")}
            options={[
              { label: "Sem empresa vinculada", value: "" },
              ...companies.map((company) => ({
                label: company.nome,
                value: company.id,
              })),
            ]}
          />
          {onRequestNewCompany ? (
            <button
              type="button"
              onClick={onRequestNewCompany}
              className="mt-2 text-sm font-medium text-amber-700 transition hover:text-amber-800"
            >
              Empresa nao encontrada? Cadastrar agora.
            </button>
          ) : null}
        </div>
        <Input
          id="person-email"
          label="E-mail"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="email@empresa.com.br"
        />
        <Input
          id="person-phone"
          label="Contato"
          value={form.telefone}
          onChange={handleChange("telefone")}
          placeholder="(00) 00000-0000"
        />
        <Input
          id="person-city"
          label="Cidade / regiao"
          value={form.cidade}
          onChange={handleChange("cidade")}
          placeholder="Cidade/UF"
        />
        <Input
          id="person-notes"
          label="Observacoes"
          value={form.observacoes}
          onChange={handleChange("observacoes")}
          placeholder="Preferencias, perfil de compra ou detalhe relevante"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-700">Papeis no ecossistema</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {roleOptions.map((role) => {
            const active = form.papeis.includes(role)

            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {role}
              </button>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}

export default PersonDialog