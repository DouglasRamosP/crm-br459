import { createResourceApi } from "./api"

const api = createResourceApi(
  "people",
  "Nao foi possivel concluir a operacao com pessoas."
)

export const listPeople = api.list
export const createPerson = api.create
export const updatePerson = api.update
export const removePerson = api.remove