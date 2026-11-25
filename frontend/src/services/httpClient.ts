
const API_BASE_URL = '/api/v1'

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = 'ApiError'
    this.status = status
  }
}

export async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed with HTTP ${response.status}`,
    )
  }

  return (await response.json()) as T
}