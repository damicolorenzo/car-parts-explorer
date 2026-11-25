
import {
  ref,
  watch,
  readonly,
  onScopeDispose,
  type Ref,
} from 'vue'

import type { PartResponse } from '../types/catalog'
import { getComponentParts } from '../services/partCatalogApi'
import { ApiError } from '../services/httpClient'

export function useReplacementParts(
  componentId: Readonly<Ref<string | null>>,
  variantId: Readonly<Ref<string | null>>,
) {
  const parts = ref<PartResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let abortController: AbortController | null = null
  let requestId = 0

  function cancelRequest(): void {
    requestId++

    abortController?.abort()
    abortController = null
  }

  function clearParts(): void {
    cancelRequest()

    parts.value = []
    loading.value = false
    error.value = null
  }

  async function loadParts(): Promise<void> {
    cancelRequest()

    const currentComponentId = componentId.value
    const currentVariantId = variantId.value

    parts.value = []
    error.value = null

    if (!currentComponentId) {
      loading.value = false
      return
    }

    const currentRequestId = requestId
    const controller = new AbortController()

    abortController = controller
    loading.value = true

    try {
      const result = await getComponentParts(
        currentComponentId,
        currentVariantId,
        controller.signal,
      )

      if (currentRequestId !== requestId) {
        return
      }

      parts.value = result
    } catch (cause: unknown) {
      if (
        controller.signal.aborted ||
        currentRequestId !== requestId
      ) {
        return
      }

      if (cause instanceof ApiError) {
        if (cause.status === 404) {
          error.value =
            'The selected component or vehicle could not be found.'
        } else {
          error.value =
            `Unable to load replacement parts (HTTP ${cause.status}).`
        }
      } else {
        error.value = 'Unable to load replacement parts.'
      }
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
        abortController = null
      }
    }
  }

  watch(
    [componentId, variantId],
    () => {
      void loadParts()
    },
    {
      immediate: true,
      flush: 'sync',
    },
  )

  onScopeDispose(clearParts)

  return {
    parts: readonly(parts),
    loading: readonly(loading),
    error: readonly(error),
    refresh: loadParts,
  }
}
