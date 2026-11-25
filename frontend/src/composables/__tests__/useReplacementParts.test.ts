
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  effectScope,
  ref,
  type EffectScope,
} from 'vue'

import type { PartResponse } from '../../types/catalog'

import { getComponentParts } from '../../services/partCatalogApi'
import { ApiError } from '../../services/httpClient'
import { useReplacementParts } from '../useReplacementParts'

vi.mock('../../services/partCatalogApi', () => ({
  getComponentParts: vi.fn(),
}))

const getComponentPartsMock =
  vi.mocked(getComponentParts)

const mockPart: PartResponse = {
  id: 'part-1',
  brand: 'DemoBrake',
  partNumber: 'DEMO-BD-001',
  oemReference: null,
  name: 'Front Brake Disc',
  description: null,
  createdAt: '2026-11-24T12:00:00Z',
}

let scope: EffectScope

function createComposable(
  initialComponentId: string | null = null,
  initialVariantId: string | null = null,
) {
  const componentId = ref(initialComponentId)
  const variantId = ref(initialVariantId)

  const state = scope.run(() =>
    useReplacementParts(componentId, variantId),
  )!

  return {
    componentId,
    variantId,
    ...state,
  }
}

beforeEach(() => {
  vi.resetAllMocks()

  getComponentPartsMock.mockResolvedValue([])

  scope = effectScope()
})

afterEach(() => {
  scope.stop()
})

describe('useReplacementParts', () => {
  it('does not fetch without a selected component', () => {
    const state = createComposable()

    expect(state.parts.value).toEqual([])
    expect(state.loading.value).toBe(false)
    expect(state.error.value).toBeNull()

    expect(getComponentPartsMock)
      .not.toHaveBeenCalled()
  })

  it('loads parts when a component is selected', async () => {
    getComponentPartsMock.mockResolvedValue([mockPart])

    const state = createComposable()

    state.componentId.value = 'component-1'

    await vi.waitFor(() => {
      expect(state.parts.value).toEqual([mockPart])
      expect(state.loading.value).toBe(false)
    })

    expect(getComponentPartsMock).toHaveBeenCalledWith(
      'component-1',
      null,
      expect.any(AbortSignal),
    )
  })

  it('refreshes when the vehicle changes', async () => {
    const state = createComposable('component-1')

    state.variantId.value = 'variant-1'

    await vi.waitFor(() => {
      expect(state.loading.value).toBe(false)
    })

    expect(getComponentPartsMock)
      .toHaveBeenLastCalledWith(
        'component-1',
        'variant-1',
        expect.any(AbortSignal),
      )
  })

  it('clears results when the component is deselected', async () => {
    getComponentPartsMock.mockResolvedValue([mockPart])

    const state = createComposable('component-1')

    await vi.waitFor(() => {
      expect(state.parts.value).toEqual([mockPart])
    })

    state.componentId.value = null

    expect(state.parts.value).toEqual([])
    expect(state.loading.value).toBe(false)
    expect(state.error.value).toBeNull()
  })

  it('handles API errors', async () => {
    getComponentPartsMock.mockRejectedValue(
      new ApiError(503, 'Service unavailable'),
    )

    const state = createComposable('component-1')

    await vi.waitFor(() => {
      expect(state.error.value).toContain('503')
      expect(state.loading.value).toBe(false)
    })

    expect(state.parts.value).toEqual([])
  })

  it('supports retrying a failed request', async () => {
    getComponentPartsMock
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([mockPart])

    const state = createComposable('component-1')

    await vi.waitFor(() => {
      expect(state.error.value).not.toBeNull()
    })

    await state.refresh()

    expect(state.parts.value).toEqual([mockPart])
    expect(state.error.value).toBeNull()
    expect(state.loading.value).toBe(false)
  })

  it('ignores obsolete responses and aborts old requests', async () => {
    let resolveFirst!: (parts: PartResponse[]) => void

    const firstResponse = new Promise<PartResponse[]>(
      resolve => {
        resolveFirst = resolve
      },
    )

    const latestPart: PartResponse = {
      ...mockPart,
      id: 'part-2',
      name: 'Brake Caliper',
    }

    getComponentPartsMock
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce([latestPart])

    const state = createComposable('component-1')

    const firstSignal =
      getComponentPartsMock.mock.calls[0]?.[2]

    expect(state.loading.value).toBe(true)

    state.componentId.value = 'component-2'

    expect(firstSignal?.aborted).toBe(true)

    await vi.waitFor(() => {
      expect(state.parts.value).toEqual([latestPart])
      expect(state.loading.value).toBe(false)
    })

    // Simulate an obsolete request completing despite cancellation.
    resolveFirst([mockPart])

    await firstResponse
    await Promise.resolve()

    expect(state.parts.value).toEqual([latestPart])
  })

  it('aborts pending requests when disposed', () => {
    getComponentPartsMock.mockReturnValue(
      new Promise<PartResponse[]>(() => {}),
    )

    createComposable('component-1')

    const signal =
      getComponentPartsMock.mock.calls[0]?.[2]

    expect(signal?.aborted).toBe(false)

    scope.stop()

    expect(signal?.aborted).toBe(true)
  })
})