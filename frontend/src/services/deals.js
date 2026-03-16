import { createResourceApi } from "./api"

const api = createResourceApi(
  "deals",
  "Nao foi possivel concluir a operacao com negocios."
)

export const listDeals = api.list
export const createDeal = api.create
export const updateDeal = api.update
export const removeDeal = api.remove