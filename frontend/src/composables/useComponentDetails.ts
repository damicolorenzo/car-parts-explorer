
import { ref, onScopeDispose } from 'vue'

import {
  ApiError,
  resolveViewerMesh,
} from '../services/componentCatalogApi'

import type {
  ComponentResponse,
} from '../types/catalog'

export function useComponentDetails() {
  const component = ref<ComponentResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let controller: AbortController | null = null
  let requestId = 0

  async function loadComponent(
    viewerModelId: string,
    meshName: string,
  ): Promise<void> {
    controller?.abort()

    const currentRequest = ++requestId
    const currentController = new AbortController()

    controller = currentController
    component.value = null
    error.value = null
    loading.value = true

    try {
      const result = await resolveViewerMesh(
        viewerModelId,
        meshName,
        currentController.signal,
      )

      if (currentRequest !== requestId) return

      component.value = result.component
    } catch (err) {
      if (currentRequest !== requestId) return

      if (
        err instanceof DOMException &&
        err.name === 'AbortError'
      ) {
        return
      }

      if (err instanceof ApiError && err.status === 404) {
        error.value = 'No catalog information for this component.'
      } else {
        error.value = 'Unable to load component information.'
      }
    } finally {
      if (currentRequest === requestId) {
        loading.value = false
        controller = null
      }
    }
  }

  function clearComponent(): void {
    ++requestId
    controller?.abort()
    controller = null

    component.value = null
    error.value = null
    loading.value = false
  }

  onScopeDispose(clearComponent)

  return {
    component,
    loading,
    error,
    loadComponent,
    clearComponent,
  }
}
