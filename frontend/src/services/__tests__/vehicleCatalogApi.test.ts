
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  getManufacturers,
  getVehicleModels,
  getVehicleGenerations,
  getVehicleVariants,
} from '../vehicleCatalogApi'

function mockResponse(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  )

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('vehicleCatalogApi', () => {
  it('retrieves manufacturers', async () => {
    const manufacturers = [
      {
        id: 'manufacturer-1',
        name: 'Volkswagen',
      },
    ]

    const fetchMock = mockResponse(manufacturers)

    expect(await getManufacturers())
      .toEqual(manufacturers)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/manufacturers',
      expect.any(Object),
    )
  })

  it('retrieves models for a manufacturer', async () => {
    const fetchMock = mockResponse([])

    await getVehicleModels('manufacturer-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/manufacturers/manufacturer-1/models',
      expect.any(Object),
    )
  })

  it('retrieves generations for a model', async () => {
    const fetchMock = mockResponse([])

    await getVehicleGenerations('model-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/models/model-1/generations',
      expect.any(Object),
    )
  })

  it('retrieves variants for a generation', async () => {
    const fetchMock = mockResponse([])

    await getVehicleVariants('generation-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/generations/generation-1/variants',
      expect.any(Object),
    )
  })

  it('forwards the abort signal', async () => {
    const fetchMock = mockResponse([])
    const controller = new AbortController()

    await getVehicleVariants(
      'generation-1',
      controller.signal,
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/generations/generation-1/variants',
      expect.objectContaining({
        signal: controller.signal,
      }),
    )
  })
})