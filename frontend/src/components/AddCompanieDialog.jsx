import { useState } from "react"

import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"

const initialForm = {
  nome: "",
  categoria: "",
  responsavel: "",
  email: "",
  telefone: "",
}

const CompanieDialog = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(initialForm)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleClose = () => {
    setForm(initialForm)
    onClose?.()
  }

  const handleSubmit = () => {
    if (!form.nome || !form.categoria || !form.responsavel) return
    onSave?.(form)
    setForm(initialForm)
  }

  const footer = (
    <div className="mt-10 flex gap-3">
      <Button onClick={handleClose} size="lg" text="Cancelar" />
      <Button onClick={handleSubmit} size="lg" text="Salvar" />
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Cadastre uma nova empresa"
      subtitle="Insira as informações abaixo"
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mt-1 mb-4 text-gray-400">Informações da empresa</h2>
          <Input
            id="companie"
            label="Empresa"
            placeholder="Nome da empresa"
            value={form.nome}
            onChange={handleChange("nome")}
          />
          <Input
            id="category"
            label="Categoria"
            placeholder="Informe a categoria"
            value={form.categoria}
            onChange={handleChange("categoria")}
          />
        </div>
        <div>
          <h2 className="mt-1 mb-4 text-gray-400">
            Informações do responsável pela empresa
          </h2>
          <Input
            id="responsible"
            label="Responsável"
            placeholder="Nome do responsável"
            value={form.responsavel}
            onChange={handleChange("responsavel")}
          />
          <Input
            id="email"
            label="E-mail"
            placeholder="E-mail do responsável"
            value={form.email}
            onChange={handleChange("email")}
          />
          <Input
            id="phone"
            label="Telefone"
            placeholder="telefone do responsável"
            value={form.telefone}
            onChange={handleChange("telefone")}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default CompanieDialog
