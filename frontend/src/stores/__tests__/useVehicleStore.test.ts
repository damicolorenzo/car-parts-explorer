
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type {
  VehicleVariantResponse,
} from '../../types/catalog'

const api = vi.hoisted(() => ({
  getManufacturers: vi.fn(),
  getVehicleModels: vi.fn(),
  getVehicleGenerations: vi.fn(),
  getVehicleVariants: vi.fn(),
}))

vi.mock('../../services/vehicleCatalogApi', () => api)

const manufacturer = {
  id: 'manufacturer-1',
  name: 'Volkswagen',
}

const secondManufacturer = {
  id: 'manufacturer-2',
  name: 'Test Manufacturer',
}

const model = {
  id: 'model-1',
  name: 'Golf',
}

const generation = {
  id: 'generation-1',
  name: 'Golf VII',
}

const variant: VehicleVariantResponse = {
  id: 'variant-1',
  name: 'Golf VII 1.6 TDI',
  engineCode: 'TEST',
  fuelType: 'DIESEL',
  displacementCc: 1598,
  powerKw: 77,
  transmission: 'MANUAL',
  drivetrain: 'FWD',
}

async function createStore() {
  const { useVehicleStore } =
    await import('../useVehicleStore')

  return useVehicleStore()
}

async function selectFullVehicle(
  store: Awaited<ReturnType<typeof createStore>>,
) {
  await store.initialize()
  await store.selectManufacturer(manufacturer.id)
  await store.selectModel(model.id)
  await store.selectGeneration(generation.id)

  store.selectVariant(variant.id)
}

beforeEach(() => {
  vi.resetModules()
  vi.resetAllMocks()

  api.getManufacturers.mockResolvedValue([
    manufacturer,
    secondManufacturer,
  ])

  api.getVehicleModels.mockResolvedValue([model])
  api.getVehicleGenerations.mockResolvedValue([generation])
  api.getVehicleVariants.mockResolvedValue([variant])
})

describe('useVehicleStore', () => {
  it('initializes the manufacturer catalog once', async () => {
    const store = await createStore()

    await store.initialize()
    await store.initialize()

    expect(store.manufacturers.value).toEqual([
      manufacturer,
      secondManufacturer,
    ])

    expect(api.getManufacturers)
      .toHaveBeenCalledTimes(1)
  })

  it('supports the full vehicle selection hierarchy', async () => {
    const store = await createStore()

    await selectFullVehicle(store)

    expect(store.selectedManufacturer.value)
      .toEqual(manufacturer)

    expect(store.selectedModel.value)
      .toEqual(model)

    expect(store.selectedGeneration.value)
      .toEqual(generation)

    expect(store.selectedVariant.value)
      .toEqual(variant)

    expect(store.hasSelectedVehicle.value)
      .toBe(true)
  })

  it('resets descendants when the manufacturer changes', async () => {
    const store = await createStore()

    await selectFullVehicle(store)

    await store.selectManufacturer(
      secondManufacturer.id,
    )

    expect(store.selectedManufacturerId.value)
      .toBe(secondManufacturer.id)

    expect(store.selectedModelId.value).toBeNull()
    expect(store.selectedGenerationId.value).toBeNull()
    expect(store.selectedVariantId.value).toBeNull()

    expect(store.generations.value).toEqual([])
    expect(store.variants.value).toEqual([])

    expect(store.hasSelectedVehicle.value)
      .toBe(false)
  })

  it('clears the entire vehicle selection', async () => {
    const store = await createStore()

    await selectFullVehicle(store)

    store.clearSelection()

    expect(store.selectedManufacturerId.value)
      .toBeNull()

    expect(store.selectedModelId.value).toBeNull()
    expect(store.selectedGenerationId.value).toBeNull()
    expect(store.selectedVariantId.value).toBeNull()

    expect(store.models.value).toEqual([])
    expect(store.generations.value).toEqual([])
    expect(store.variants.value).toEqual([])

    expect(store.manufacturers.value).toHaveLength(2)
  })

  it('shares state between consumers', async () => {
    const firstStore = await createStore()
    const secondStore = await createStore()

    await selectFullVehicle(firstStore)

    expect(secondStore.selectedVariantId.value)
      .toBe(variant.id)

    expect(secondStore.hasSelectedVehicle.value)
      .toBe(true)

    secondStore.clearSelection()

    expect(firstStore.selectedVariantId.value)
      .toBeNull()
  })

  it('handles catalog failures and supports retry', async () => {
    api.getManufacturers
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([manufacturer])

    const store = await createStore()

    await store.initialize()

    expect(store.error.value).not.toBeNull()
    expect(store.loading.value).toBe(false)

    await store.retry()

    expect(store.error.value).toBeNull()

    expect(store.manufacturers.value)
      .toEqual([manufacturer])
  })

  it('ignores obsolete manufacturer responses', async () => {
    const store = await createStore()

    await store.initialize()

    let resolveFirst!: (
      models: typeof model[],
    ) => void

    const firstResponse = new Promise<typeof model[]>(
      resolve => {
        resolveFirst = resolve
      },
    )

    const latestModel = {
      id: 'model-2',
      name: 'Test Model',
    }

    api.getVehicleModels
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce([latestModel])

    const firstRequest =
      store.selectManufacturer(manufacturer.id)

    const firstSignal =
      api.getVehicleModels.mock.calls[0]?.[1]

    await store.selectManufacturer(
      secondManufacturer.id,
    )

    expect(firstSignal?.aborted).toBe(true)

    resolveFirst([model])

    await firstRequest

    expect(store.models.value).toEqual([latestModel])

    expect(store.selectedManufacturerId.value)
      .toBe(secondManufacturer.id)
  })
})