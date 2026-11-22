
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import ComponentList from '../explorer/ComponentList.vue'
import type { AutomotiveComponent } from '../../types/automotive'
import type { ViewerModelConfig } from '../../types/viewer'
import ComponentInfoPanel from '../explorer/ComponentInfoPanel.vue'
import { ThreeEngine } from '../../engine/ThreeEngine'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ModelManager } from '../../engine/ModelManager'
import { ComponentController } from '../../engine/ComponentController'
import { CameraController } from '../../engine/CameraController'
import { ExplodedViewController } from '../../engine/ExplodedViewController'
import { LabelController } from '../../engine/LabelController'
import ComponentDetailsPanel from './ComponentDetailsPanel.vue'
import { useComponentDetails } from '../../composables/useComponentDetails'

const props = defineProps<{
  model: ViewerModelConfig
}>()

const container = ref<HTMLDivElement | null>(null)
const selectedPart = ref<string | null>(null)

let engine: ThreeEngine

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls

let carModel: THREE.Group | null = null

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

let isDisposed = false
const selectedComponentId = ref<string | null>(null)
const hiddenComponentIds = ref<string[]>([])
const isolatedComponentId = ref<string | null>(null)

const explosionAmount = ref(0)

const showLabels = ref(props.model.showLabelsByDefault ?? false)

const selectedComponent = computed(() =>
  props.model.components.find(
    component => component.id === selectedComponentId.value
  ) ?? null
)

const modelManager = new ModelManager()

let componentController: ComponentController | null = null

let cameraController: CameraController | null = null

let explodedViewController: ExplodedViewController | null = null

let labelController: LabelController | null = null

const {
  component: apiComponent,
  loading: apiLoading,
  error: apiError,
  loadComponent,
  clearComponent,
} = useComponentDetails()

function clearSelection() {
  componentController?.clearSelection()
  selectedComponentId.value = null
  selectedPart.value = null

  clearComponent()
}

function onPointerClick(event: MouseEvent) {
  if (!container.value || !carModel) return

  const bounds = renderer.domElement.getBoundingClientRect()

  pointer.x =
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1

  pointer.y =
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)

  
  const intersections = raycaster.intersectObjects(
  componentController?.getSelectableMeshes() ?? [],
  false
)

if (intersections.length === 0) {
  clearSelection()
  return
}

const mesh = intersections[0].object as THREE.Mesh
const component = componentController?.selectMesh(mesh) ?? null

selectedComponentId.value = component?.id ?? null
selectedPart.value = component?.name ?? getComponentName(mesh)

loadMeshDetails(mesh)

}

onMounted(() => {
  isDisposed = false

  if (!container.value) return

  engine = new ThreeEngine(container.value)

  renderer = engine.renderer
  scene = engine.scene
  camera = engine.camera
  controls = engine.controls
  cameraController = new CameraController(camera, controls)

  controls.addEventListener('start', onControlsStart)

  renderer.domElement.addEventListener(
    'click',
    onPointerClick
  )

  void loadCarModel()

  engine.start(() => {
  cameraController?.update()

  explodedViewController?.setAmount(explosionAmount.value)
  explodedViewController?.update()
})
})

function onControlsStart() {
  cameraController?.stop()
}


function disposeLoadedModel(): void {
  clearSelection()

  explodedViewController?.dispose()
  explodedViewController = null

  labelController?.dispose()
  labelController = null

  componentController?.dispose()
  componentController = null

  if (carModel) {
    scene.remove(carModel)
    modelManager.dispose(carModel)
    carModel = null
  }

  selectedComponentId.value = null
  selectedPart.value = null
  hiddenComponentIds.value = []
  isolatedComponentId.value = null
  explosionAmount.value = 0
}


onBeforeUnmount(() => {
  isDisposed = true

  if (!engine) return

  renderer.domElement.removeEventListener(
    'click',
    onPointerClick
  )

  controls.removeEventListener(
    'start',
    onControlsStart
  )

  clearSelection()

  cameraController?.dispose()
  cameraController = null
  
  engine.dispose()
})



async function loadCarModel(): Promise<void> {
  try {
    const model = await modelManager.load(props.model)

    if (isDisposed) {
      modelManager.dispose(model)
      return
    }

    // Release an existing model before installing a new one.
    disposeLoadedModel()

    carModel = model

    scene.add(carModel)

    componentController = new ComponentController(
      carModel,
      props.model.components
    )

    labelController = new LabelController(
      props.model.components,
      componentController,
      showLabels.value
    )

    if (props.model.explodedView) {
      explodedViewController = new ExplodedViewController(
        carModel,
        props.model.explodedView
      )
    }

    modelManager.frameModel(carModel, camera, controls)

    console.log(
      `${props.model.name} loaded successfully!`
    )
  } catch (error) {
    console.error(
      `Failed to load ${props.model.name}:`,
      error
    )

    if (!isDisposed) {
      disposeLoadedModel()
    }
  }
}


function getComponentName(mesh: THREE.Mesh): string {
  let current: THREE.Object3D | null = mesh

  while (current && current !== carModel) {
    const name = current.name

    if (
      name &&
      !/^Mesh\d+$/i.test(name) &&
      !/^Object_\d+$/i.test(name)
    ) {
      return name
    }

    current = current.parent
  }

  return mesh.name || 'Unknown component'
}

function selectFromList(component: AutomotiveComponent) {
  if (isolatedComponentId.value !== null) {
    // Leave isolation when choosing a different component.
    exitIsolation()
  }

  if (hiddenComponentIds.value.includes(component.id)) {
    setComponentVisibility(component, true)
  }

  selectComponent(component)
}

function findComponentMeshes(
  component: AutomotiveComponent
): THREE.Mesh[] {
  return componentController?.findMeshes(component) ?? []
}


function selectComponent(component: AutomotiveComponent) {
  if (!componentController) return

  componentController.select(component)

  selectedComponentId.value = component.id
  selectedPart.value = component.name

  const meshes = findComponentMeshes(component)

  if (meshes.length > 0) {
    loadMeshDetails(meshes[0])
  } else {
    clearComponent()
  }
}



function setComponentVisibility(
  component: AutomotiveComponent,
  visible: boolean
) {
  componentController?.setVisibility(component, visible)

  if (visible) {
    hiddenComponentIds.value =
      hiddenComponentIds.value.filter(id => id !== component.id)
  } else {
    hiddenComponentIds.value = [
      ...new Set([...hiddenComponentIds.value, component.id])
    ]

    if (selectedComponentId.value === component.id) {
      clearSelection()
    }
  }

  labelController?.updateVisibility()
}


function toggleComponentVisibility(
  component: AutomotiveComponent
) {
  const isHidden =
    hiddenComponentIds.value.includes(component.id)

  setComponentVisibility(component, isHidden)
}

function isolateComponent(component: AutomotiveComponent) {
  if (!componentController) return

  componentController.isolate(component)

  selectedComponentId.value = component.id
  selectedPart.value = component.name
  isolatedComponentId.value = component.id

  const meshes = findComponentMeshes(component)

  if (meshes.length > 0) {
    loadMeshDetails(meshes[0])
  } else {
    clearComponent()
  }

  labelController?.updateVisibility()
}

function exitIsolation() {
  componentController?.exitIsolation()
  isolatedComponentId.value = null
  labelController?.updateVisibility()
}

function isolateSelectedComponent() {
  const component = props.model.components.find(
  c => c.id === selectedComponentId.value
)

  if (component) {
    isolateComponent(component)
  }
}


function focusOnComponent(component: AutomotiveComponent) {
  if (!cameraController || !carModel) return

  const meshes = findComponentMeshes(component)

  if (!cameraController.focusOnObjects(meshes)) {
    console.warn(`Cannot focus on ${component.name}`)
  }
}

function focusSelectedComponent() {
  const component = props.model.components.find(
    c => c.id === selectedComponentId.value
  )

  if (component) {
    focusOnComponent(component)
  }
}

function toggleLabels() {
  showLabels.value = !showLabels.value
  labelController?.setVisible(showLabels.value)
}

function resolveViewerModelId(
  object: THREE.Object3D
): string | null {
  let current: THREE.Object3D | null = object

  while (current) {
    if (
      current.name === 'brake-assembly' ||
      current.name === 'suspension-assembly'
    ) {
      return current.name
    }

    if (current === carModel) break

    current = current.parent
  }

  return null
}

function loadMeshDetails(mesh: THREE.Mesh): void {
  const viewerModelId = resolveViewerModelId(mesh)

  if (!viewerModelId || !mesh.name) {
    clearComponent()
    return
  }

  void loadComponent(viewerModelId, mesh.name)
}

</script>

<template>
  <div class="viewer">
    <div ref="container" class="canvas-container"></div>

    <div class="part-panel">
      <h2>Car Parts Explorer</h2>
      <div class="label-controls">
  <button @click="toggleLabels">
    {{ showLabels ? 'Hide Labels' : 'Show Labels' }}
  </button>
</div>
      <p>Click on a component to inspect it.</p>

      <div v-if="selectedPart" class="selected">
        <strong>Selected component</strong>
        <p>{{ selectedPart }}</p>
      </div>
      <p v-else>No component selected</p>
      <h3>Components</h3>

<ComponentList
  :components="props.model.components"
  :selected-id="selectedComponentId"
  :hidden-ids="hiddenComponentIds"
  @select="selectFromList"
  @toggle-visibility="toggleComponentVisibility"
/>

<ComponentInfoPanel :component="selectedComponent" />

<ComponentDetailsPanel
  :component="apiComponent"
  :loading="apiLoading"
  :error="apiError"
/>

<div class="isolation-controls">
  <button
    v-if="isolatedComponentId"
    @click="exitIsolation"
  >
    Show Full Car
  </button>

  <button
    v-else-if="selectedComponentId"
    @click="isolateSelectedComponent"
  >
    Isolate Component
  </button>
  
  <button
  v-if="selectedComponentId"
  class="focus-button"
  @click="focusSelectedComponent"
>
  Focus on Component
</button>
</div>    

<div
  v-if="props.model.explodedView"
  class="explosion-controls"
>
  <label for="explosion-slider">
    Exploded View: {{ Math.round(explosionAmount * 100) }}%
  </label>

  <input
    id="explosion-slider"
    v-model.number="explosionAmount"
    type="range"
    min="0"
    max="1"
    step="0.01"
  />

  <button @click="explosionAmount = 0">
    Reset Assembly
  </button>

</div>
</div>
  </div>
</template>

<style scoped>
.viewer {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #101827;
  color: white;
}

.canvas-container {
  flex: 1;
  min-width: 0;
  position: relative;
}

.part-panel {
  width: 300px;
  padding: 24px;
  background: #1e293b;
  box-sizing: border-box;
  overflow-y: auto;
}

.selected {
  margin-top: 24px;
  padding: 16px;
  background: #334155;
  border-radius: 8px;
}

@media (max-width: 700px) {
  .viewer {
    flex-direction: column;
  }

  .canvas-container {
    min-height: 60vh;
  }

  .part-panel {
    width: 100%;
  }
}

.isolation-controls {
  margin-top: 16px;
}

.isolation-controls button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.isolation-controls button:hover {
  background: #1d4ed8;
}

.focus-button {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #0d9488;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.focus-button:hover {
  background: #0f766e;
}

.explosion-controls {
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  background: #334155;
}

.explosion-controls label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
}

.explosion-controls input {
  width: 100%;
  cursor: pointer;
}

.explosion-controls button {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border: 1px solid #64748b;
  border-radius: 6px;
  background: #1e293b;
  color: white;
  cursor: pointer;
}


.label-controls {
  margin: 16px 0;
}

.label-controls button {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #334155;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.label-controls button:hover {
  background: #475569;
}

</style>
