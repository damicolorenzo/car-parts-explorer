
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  getParts,
  getPart,
  getComponentParts,
} from '../partCatalogApi'

import { ApiError } from '../httpClient'

const mockPart = {
  id: 'part-1',
  brand: 'DemoBrake',
  partNumber: 'DEMO-BD-001',
  oemReference: null,
  name: 'Front Brake Disc',
  description: 'Synthetic test product',
  createdAt: '2026-11-24T12:00:00Z',
}

function mockResponse(
  body: unknown,
  status = 200,
) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
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

describe('partCatalogApi', () => {
  it('retrieves all replacement parts', async () => {
    const fetchMock = mockResponse([mockPart])

    const result = await getParts()

    expect(result).toEqual([mockPart])

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/parts',
      expect.objectContaining({
        method: 'GET',
      }),
    )
  })

  it('retrieves a specific replacement part', async () => {
    const fetchMock = mockResponse(mockPart)

    const result = await getPart('part-1')

    expect(result).toEqual(mockPart)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/parts/part-1',
      expect.any(Object),
    )
  })

  it('retrieves parts without vehicle filtering', async () => {
    const fetchMock = mockResponse([mockPart])

    await getComponentParts('component-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/components/component-1/parts',
      expect.any(Object),
    )
  })

  it('includes the selected vehicle variant', async () => {
    const fetchMock = mockResponse([mockPart])

    await getComponentParts(
      'component-1',
      'variant-1',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/components/component-1/parts?variantId=variant-1',
      expect.any(Object),
    )
  })

  it('forwards the abort signal', async () => {
    const fetchMock = mockResponse([])
    const controller = new AbortController()

    await getComponentParts(
      'component-1',
      null,
      controller.signal,
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/components/component-1/parts',
      expect.objectContaining({
        signal: controller.signal,
      }),
    )
  })

  it('throws ApiError for failed requests', async () => {
    mockResponse({}, 404)

    await expect(
      getPart('unknown-part'),
    ).rejects.toBeInstanceOf(ApiError)

    await expect(
      getPart('unknown-part'),
    ).rejects.toMatchObject({
      status: 404,
    })
  })
})