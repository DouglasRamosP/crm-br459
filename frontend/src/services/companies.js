import { createResourceApi } from "./api"

const api = createResourceApi(
  "companies",
  "Nao foi possivel concluir a operacao com empresas."
)

export const listCompanies = api.list
export const createCompany = api.create
export const updateCompany = api.update
export const removeCompany = api.remove