import { createResourceApi } from "./api"

const api = createResourceApi(
  "products",
  "Nao foi possivel concluir a operacao com estoque."
)

export const listProducts = api.list
export const createProduct = api.create
export const updateProduct = api.update
export const removeProduct = api.remove