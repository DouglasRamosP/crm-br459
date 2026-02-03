import "./addCompanie.css"

import { useRef } from "react"
import { createPortal } from "react-dom"
import { CSSTransition } from "react-transition-group"

import Button from "./Button"
import Input from "./Input"

const CompanieDialog = ({ isOpen, onClose }) => {
  const nodeRef = useRef()

  // if (!isOpen) return null

  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={isOpen}
      timeout={500}
      classNames="fade"
      unmountOnExit
    >
      <div>
        {createPortal(
          <div
            ref={nodeRef}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="rounded-lg bg-white p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-black">
                  Cadastre uma nova empresa{" "}
                </h2>
                <p className="mt-1 mb-4 text-sm text-yellow-600">
                  Insira as informações abaixo
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="mt-1 mb-4 text-gray-400">
                    Informações da empresa
                  </h2>
                  <Input
                    id="companie"
                    label="Empresa"
                    placeholder="Nome da empresa"
                  />
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

              <div className="mt-10 flex gap-3">
                <Button onClick={onClose} size="lg" text="Cancelar" />
                <Button size="lg" text="Salvar" />
              </div>
            </div>
          </div>,
          document.getElementById("portal-root")
        )}
      </div>
    </CSSTransition>
  )
}

export default CompanieDialog
