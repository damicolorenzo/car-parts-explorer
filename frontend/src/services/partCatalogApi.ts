
import type { PartResponse } from '../types/catalog'
import { getJson } from './httpClient'

export function getParts(
  signal?: AbortSignal,
): Promise<PartResponse[]> {
  return getJson<PartResponse[]>(
    '/parts',
    signal,
  )
}

export function getPart(
  partId: string,
  signal?: AbortSignal,
): Promise<PartResponse> {
  return getJson<PartResponse>(
    `/parts/${encodeURIComponent(partId)}`,
    signal,
  )
}

export function getComponentParts(
  componentId: string,
  variantId?: string | null,
  signal?: AbortSignal,
): Promise<PartResponse[]> {
  const params = new URLSearchParams()

  if (variantId) {
    params.set('variantId', variantId)
  }

  const query = params.toString()

  const path =
    `/components/${encodeURIComponent(componentId)}/parts`

  return getJson<PartResponse[]>(
    query ? `${path}?${query}` : path,
    signal,
  )
}