import { createResourceApi } from "./api"

const api = createResourceApi(
  "services",
  "Nao foi possivel concluir a operacao com servicos."
)

export const listServices = api.list
export const createService = api.create
export const updateService = api.update
export const removeService = api.remove