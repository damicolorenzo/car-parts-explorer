
import type {
  AssemblyResponse,
  ComponentResponse,
  ViewerMeshResponse,
} from '../types/catalog'

import { getJson } from './httpClient'

export { ApiError } from './httpClient'

export function getAssemblies(
  signal?: AbortSignal,
): Promise<AssemblyResponse[]> {
  return getJson<AssemblyResponse[]>(
    '/assemblies',
    signal,
  )
}

export function getAssemblyComponents(
  assemblyId: string,
  signal?: AbortSignal,
): Promise<ComponentResponse[]> {
  return getJson<ComponentResponse[]>(
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

  return getJson<ViewerMeshResponse>(
    `/viewer-meshes/resolve?${params.toString()}`,
    signal,
  )
}