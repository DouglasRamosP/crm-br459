const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error("Nao foi possivel concluir a operacao.")
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

const withTimestamps = (payload) => {
  const timestamp = new Date().toISOString()

  return {
    ...payload,
    createdAt: payload.createdAt ?? timestamp,
    updatedAt: timestamp,
  }
}

export const createResourceApi = (resourceName, errorMessage) => {
  const baseUrl = `/api/${resourceName}`

  const call = async (url, options = {}) => {
    try {
      return await request(url, options)
    } catch {
      throw new Error(errorMessage)
    }
  }

  return {
    list: () => call(baseUrl),
    create: (payload) =>
      call(baseUrl, {
        method: "POST",
        body: JSON.stringify(withTimestamps(payload)),
      }),
    update: (id, payload) =>
      call(`${baseUrl}/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...payload,
          updatedAt: new Date().toISOString(),
        }),
      }),
    remove: (id) =>
      call(`${baseUrl}/${id}`, {
        method: "DELETE",
      }),
  }
}