import Button from "./Button"
import Dialog from "./Dialog"
import Input from "./Input"

const CompanieDialog = ({ isOpen, onClose }) => {
  const footer = (
    <div className="mt-10 flex gap-3">
      <Button onClick={onClose} size="lg" text="Cancelar" />
      <Button size="lg" text="Salvar" />
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastre uma nova empresa"
      subtitle="Insira as informações abaixo"
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mt-1 mb-4 text-gray-400">Informações da empresa</h2>
          <Input id="companie" label="Empresa" placeholder="Nome da empresa" />
          <Input
            id="category"
            label="Categoria"
            placeholder="Informe a categoria"
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
          />
          <Input
            id="email"
            label="E-mail"
            placeholder="E-mail do responsável"
          />
          <Input
            id="phone"
            label="Telefone"
            placeholder="telefone do responsável"
          />
        </div>
      </div>
    </Dialog>
  )
}

export default CompanieDialog
