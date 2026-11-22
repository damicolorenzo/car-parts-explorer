
import type {
  AssemblyResponse,
  ComponentResponse,
  ViewerMeshResponse,
} from '../types/catalog'

const API_BASE = '/api/v1'

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API request failed: ${response.status}`,
    )
  }

  return (await response.json()) as T
}

export function getAssemblies(
  signal?: AbortSignal,
): Promise<AssemblyResponse[]> {
  return getJson('/assemblies', signal)
}

export function getAssemblyComponents(
  assemblyId: string,
  signal?: AbortSignal,
): Promise<ComponentResponse[]> {
  return getJson(
    `/assemblies/${encodeURIComponent(assemblyId)}/components`,
    signal,
  )
}

export function resolveViewerMesh(
  viewerModelId: string,
  meshName: string,
  signal?: AbortSignal,
): Promise<ViewerMeshResponse> {
  const params = new URLSearchParams({
    viewerModelId,
    meshName,
  })

  return getJson(
    `/viewer-meshes/resolve?${params.toString()}`,
    signal,
  )
}
