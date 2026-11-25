
import {
  ref,
  computed,
  readonly,
} from 'vue'

import type {
  ManufacturerResponse,
  VehicleModelResponse,
  VehicleGenerationResponse,
  VehicleVariantResponse,
} from '../types/catalog'

import {
  getManufacturers,
  getVehicleModels,
  getVehicleGenerations,
  getVehicleVariants,
} from '../services/vehicleCatalogApi'

// --------------------------------------------------
// Global reactive state
// --------------------------------------------------

const manufacturers = ref<ManufacturerResponse[]>([])
const models = ref<VehicleModelResponse[]>([])
const generations = ref<VehicleGenerationResponse[]>([])
const variants = ref<VehicleVariantResponse[]>([])

const selectedManufacturerId = ref<string | null>(null)
const selectedModelId = ref<string | null>(null)
const selectedGenerationId = ref<string | null>(null)
const selectedVariantId = ref<string | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)

const initialized = ref(false)

let abortController: AbortController | null = null
let requestId = 0

// --------------------------------------------------
// Computed vehicle information
// --------------------------------------------------

const selectedManufacturer = computed(() =>
  manufacturers.value.find(
    item => item.id === selectedManufacturerId.value,
  ) ?? null,
)

const selectedModel = computed(() =>
  models.value.find(
    item => item.id === selectedModelId.value,
  ) ?? null,
)

const selectedGeneration = computed(() =>
  generations.value.find(
    item => item.id === selectedGenerationId.value,
  ) ?? null,
)

const selectedVariant = computed(() =>
  variants.value.find(
    item => item.id === selectedVariantId.value,
  ) ?? null,
)

const hasSelectedVehicle = computed(
  () => selectedVariant.value !== null,
)

// --------------------------------------------------
// Request management
// --------------------------------------------------

function cancelRequest(): void {
  requestId++

  abortController?.abort()
  abortController = null

  loading.value = false
}

async function executeRequest<T>(
  request: (signal: AbortSignal) => Promise<T>,
  onSuccess: (result: T) => void,
  errorMessage: string,
): Promise<void> {
  cancelRequest()

  const currentRequestId = requestId
  const controller = new AbortController()

  abortController = controller

  loading.value = true
  error.value = null

  try {
    const result = await request(controller.signal)

    if (currentRequestId !== requestId) {
      return
    }

    onSuccess(result)
  } catch {
    if (
      controller.signal.aborted ||
      currentRequestId !== requestId
    ) {
      return
    }

    error.value = errorMessage
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
      abortController = null
    }
  }
}

// --------------------------------------------------
// Initialization
// --------------------------------------------------

async function initialize(): Promise<void> {
  if (initialized.value || loading.value) {
    return
  }

  await executeRequest(
    signal => getManufacturers(signal),
    result => {
      manufacturers.value = result
      initialized.value = true
    },
    'Unable to load vehicle manufacturers.',
  )
}

// --------------------------------------------------
// Vehicle selection
// --------------------------------------------------

async function selectManufacturer(
  manufacturerId: string | null,
): Promise<void> {
  if (
    manufacturerId !== null &&
    !manufacturers.value.some(
      item => item.id === manufacturerId,
    )
  ) {
    return
  }

  cancelRequest()

  selectedVariantId.value = null
  selectedGenerationId.value = null
  selectedModelId.value = null
  selectedManufacturerId.value = manufacturerId

  models.value = []
  generations.value = []
  variants.value = []

  error.value = null

  if (!manufacturerId) {
    return
  }

  await executeRequest(
    signal => getVehicleModels(manufacturerId, signal),
    result => {
      models.value = result
    },
    'Unable to load vehicle models.',
  )
}

async function selectModel(
  modelId: string | null,
): Promise<void> {
  if (
    modelId !== null &&
    !models.value.some(item => item.id === modelId)
  ) {
    return
  }

  cancelRequest()

  selectedVariantId.value = null
  selectedGenerationId.value = null
  selectedModelId.value = modelId

  generations.value = []
  variants.value = []

  error.value = null

  if (!modelId) {
    return
  }

  await executeRequest(
    signal => getVehicleGenerations(modelId, signal),
    result => {
      generations.value = result
    },
    'Unable to load vehicle generations.',
  )
}

async function selectGeneration(
  generationId: string | null,
): Promise<void> {
  if (
    generationId !== null &&
    !generations.value.some(
      item => item.id === generationId,
    )
  ) {
    return
  }

  cancelRequest()

  selectedVariantId.value = null
  selectedGenerationId.value = generationId

  variants.value = []

  error.value = null

  if (!generationId) {
    return
  }

  await executeRequest(
    signal => getVehicleVariants(generationId, signal),
    result => {
      variants.value = result
    },
    'Unable to load vehicle variants.',
  )
}

function selectVariant(
  variantId: string | null,
): void {
  if (
    variantId !== null &&
    !variants.value.some(item => item.id === variantId)
  ) {
    return
  }

  selectedVariantId.value = variantId
}

// --------------------------------------------------
// Reset and retry
// --------------------------------------------------

function clearSelection(): void {
  cancelRequest()

  selectedVariantId.value = null
  selectedGenerationId.value = null
  selectedModelId.value = null
  selectedManufacturerId.value = null

  models.value = []
  generations.value = []
  variants.value = []

  error.value = null
}

async function retry(): Promise<void> {
  if (!initialized.value) {
    await initialize()
    return
  }

  if (selectedGenerationId.value) {
    await selectGeneration(selectedGenerationId.value)
    return
  }

  if (selectedModelId.value) {
    await selectModel(selectedModelId.value)
    return
  }

  if (selectedManufacturerId.value) {
    await selectManufacturer(
      selectedManufacturerId.value,
    )
  }
}

// --------------------------------------------------
// Public store interface
// --------------------------------------------------

export function useVehicleStore() {
  return {
    manufacturers: readonly(manufacturers),
    models: readonly(models),
    generations: readonly(generations),
    variants: readonly(variants),

    selectedManufacturerId: readonly(
      selectedManufacturerId,
    ),
    selectedModelId: readonly(selectedModelId),
    selectedGenerationId: readonly(selectedGenerationId),
    selectedVariantId: readonly(selectedVariantId),

    selectedManufacturer,
    selectedModel,
    selectedGeneration,
    selectedVariant,

    hasSelectedVehicle,

    loading: readonly(loading),
    error: readonly(error),

    initialize,
    selectManufacturer,
    selectModel,
    selectGeneration,
    selectVariant,
    clearSelection,
    retry,
  }
}
