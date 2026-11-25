
import type {
  ManufacturerResponse,
  VehicleModelResponse,
  VehicleGenerationResponse,
  VehicleVariantResponse,
} from '../types/catalog'

import { getJson } from './httpClient'

export function getManufacturers(
  signal?: AbortSignal,
): Promise<ManufacturerResponse[]> {
  return getJson<ManufacturerResponse[]>(
    '/manufacturers',
    signal,
  )
}

export function getVehicleModels(
  manufacturerId: string,
  signal?: AbortSignal,
): Promise<VehicleModelResponse[]> {
  return getJson<VehicleModelResponse[]>(
    `/manufacturers/${encodeURIComponent(manufacturerId)}/models`,
    signal,
  )
}

export function getVehicleGenerations(
  modelId: string,
  signal?: AbortSignal,
): Promise<VehicleGenerationResponse[]> {
  return getJson<VehicleGenerationResponse[]>(
    `/models/${encodeURIComponent(modelId)}/generations`,
    signal,
  )
}

export function getVehicleVariants(
  generationId: string,
  signal?: AbortSignal,
): Promise<VehicleVariantResponse[]> {
  return getJson<VehicleVariantResponse[]>(
    `/generations/${encodeURIComponent(generationId)}/variants`,
    signal,
  )
}