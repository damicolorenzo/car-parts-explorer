
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { golf7Components } from '../../data/vehicles/golf7.components'
import { resolveComponent } from '../../utils/componentResolver'
import ComponentList from '../explorer/ComponentList.vue'
import type { AutomotiveComponent } from '../../types/automotive'

const container = ref<HTMLDivElement | null>(null)
const selectedPart = ref<string | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let animationId = 0
let resizeObserver: ResizeObserver

let carModel: THREE.Group | null = null

const originalMaterials = new Map<
  THREE.Mesh,
  THREE.Material | THREE.Material[]
>()

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const selectableParts: THREE.Object3D[] = []
const selectedMeshes: THREE.Mesh[] = []

let isDisposed = false
const selectedComponentId = ref<string | null>(null)
const hiddenComponentIds = ref<string[]>([])
const isolatedComponentId = ref<string | null>(null)
const focusTarget = new THREE.Vector3()
const focusCameraPosition = new THREE.Vector3()

let isCameraAnimating = false

function clearSelection() {
  for (const mesh of selectedMeshes) {
    const original = originalMaterials.get(mesh)
    if (!original) continue

    const highlighted = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]

    mesh.material = original

    const originalArray = Array.isArray(original)
      ? original
      : [original]

    highlighted.forEach(material => {
      if (!originalArray.includes(material)) {
        material.dispose()
      }
    })
  }

  selectedMeshes.length = 0
  selectedPart.value = null
  selectedComponentId.value = null
}



function highlightMesh(mesh: THREE.Mesh) {
  const original = originalMaterials.get(mesh)
  if (!original) return

  const createHighlight = (material: THREE.Material) => {
    const clone = material.clone()

    if (clone instanceof THREE.MeshStandardMaterial) {
      clone.emissive.setHex(0x3366ff)
      clone.emissiveIntensity = 0.6
    }

    return clone
  }

  mesh.material = Array.isArray(original)
    ? original.map(createHighlight)
    : createHighlight(original)

  selectedMeshes.push(mesh)
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
  selectableParts,
  false
)

if (intersections.length === 0) {
  clearSelection()
  return
}

const mesh = intersections[0].object as THREE.Mesh

const component = resolveComponent(
  mesh,
  carModel,
  golf7Components
)

if (component) {
  selectComponent(component)
} else {
  clearSelection()
  highlightMesh(mesh)
  selectedPart.value = getComponentName(mesh)
}

}


function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()

  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return

    geometries.add(object.geometry)

    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material]

    meshMaterials.forEach(material => {
      materials.add(material)

      Object.values(material).forEach(value => {
        if (value instanceof THREE.Texture) {
          textures.add(value)
        }
      })
    })
  })

  geometries.forEach(geometry => geometry.dispose())
  materials.forEach(material => material.dispose())
  textures.forEach(texture => texture.dispose())
}



onMounted(() => {
  isDisposed = false

  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x101827)

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(6, 4, 6)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('start', stopCameraAnimation)
  controls.enableDamping = true
  controls.target.set(0, 1, 0)
  controls.update()

  scene.add(new THREE.AmbientLight(0xffffff, 1.5))

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(5, 10, 5)
  light.castShadow = true
  scene.add(light)

  const grid = new THREE.GridHelper(20, 20, 0x475569, 0x334155)
  scene.add(grid)

  void loadCarModel()

  renderer.domElement.addEventListener('click', onPointerClick)

  resizeObserver = new ResizeObserver(() => {
    if (!container.value) return
    const w = container.value.clientWidth
    const h = container.value.clientHeight
    if (!w || !h) return

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(container.value)

  
function animate() {
  animationId = requestAnimationFrame(animate)

  if (isCameraAnimating) {
    const speed = 0.08

    camera.position.lerp(focusCameraPosition, speed)
    controls.target.lerp(focusTarget, speed)

    const cameraDone =
      camera.position.distanceTo(focusCameraPosition) < 0.01

    const targetDone =
      controls.target.distanceTo(focusTarget) < 0.01

    if (cameraDone && targetDone) {
      camera.position.copy(focusCameraPosition)
      controls.target.copy(focusTarget)

      isCameraAnimating = false
    }
  }

  controls.update()
  renderer.render(scene, camera)
}


  animate()
})

function stopCameraAnimation() {
  isCameraAnimating = false
}

onBeforeUnmount(() => {
  isDisposed = true

  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()

  renderer?.domElement.removeEventListener(
    'click',
    onPointerClick
  )

controls?.removeEventListener('start', stopCameraAnimation)
  controls?.dispose()

  clearSelection()

  if (scene) {
    disposeModel(scene)

    scene.traverse(object => {
      if (object instanceof THREE.GridHelper) {
        object.geometry.dispose()

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]

        materials.forEach(material => material.dispose())
      }
    })
  }

  originalMaterials.clear()
  selectableParts.length = 0
  carModel = null

  renderer?.dispose()
  renderer?.domElement.remove()
})




async function loadCarModel() {
  const loader = new GLTFLoader()

  try {
    const gltf = await loader.loadAsync(
      '/models/golf7/exterior.glb'
    )

    if (isDisposed) {
  disposeModel(gltf.scene)
  return
}

    carModel = gltf.scene

    // Register selectable meshes
    carModel.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return

      object.castShadow = true
      object.receiveShadow = true

      originalMaterials.set(object, object.material)
      selectableParts.push(object)
    })

    scene.add(carModel)

    // Center the model
    const box = new THREE.Box3().setFromObject(carModel)
    const center = box.getCenter(new THREE.Vector3())

    carModel.position.sub(center)

    // Calculate bounds after centering
    const bounds = new THREE.Box3().setFromObject(carModel)
    const size = bounds.getSize(new THREE.Vector3())

    const maxDimension = Math.max(
      size.x, size.y, size.z
    )

    // Position the camera
    const distance =
      maxDimension /
      (2 * Math.tan(THREE.MathUtils.degToRad(
        camera.fov / 2
      ))) * 1.8

    camera.position.set(
      distance,
      distance * 0.6,
      distance
    )

    camera.near = Math.max(distance / 1000, 0.01)
    camera.far = distance * 20
    camera.updateProjectionMatrix()

    controls.target.set(0, 0, 0)
    controls.update()

    console.log('Golf 7 loaded successfully!')

    // Inspect hierarchy
    carModel.traverse((object) => {
      console.log(object.name, object.type)
    })

  } catch (error) {
    console.error('Failed to load Golf 7:', error)
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
  if (!carModel) return []

  const matches: THREE.Mesh[] = []

  carModel.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return

    const resolved = resolveComponent(
      object,
      carModel!,
      golf7Components
    )

    if (resolved?.id === component.id) {
      matches.push(object)
    }
  })

  return matches
}



function selectComponent(component: AutomotiveComponent) {
  clearSelection()

  selectedComponentId.value = component.id
  selectedPart.value = component.name

  const meshes = findComponentMeshes(component)

  meshes.forEach(highlightMesh)

  if (meshes.length === 0) {
    console.warn(
      `No meshes found for component: ${component.id}`
    )
  }
}



function setComponentVisibility(
  component: AutomotiveComponent,
  visible: boolean
) {
  if (visible) {
    hiddenComponentIds.value =
      hiddenComponentIds.value.filter(
        id => id !== component.id
      )
  } else {
    hiddenComponentIds.value = [
      ...new Set([
        ...hiddenComponentIds.value,
        component.id
      ])
    ]

    if (selectedComponentId.value === component.id) {
      clearSelection()
    }
  }

  applyComponentVisibility()
}


function toggleComponentVisibility(
  component: AutomotiveComponent
) {
  const isHidden =
    hiddenComponentIds.value.includes(component.id)

  setComponentVisibility(component, isHidden)
}


function applyComponentVisibility() {
  if (!carModel) return

  carModel.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return

    const component = resolveComponent(
      object,
      carModel!,
      golf7Components
    )

    if (isolatedComponentId.value !== null) {
      // Hide everything except the isolated component,
      // including unregistered meshes.
      object.visible =
        component?.id === isolatedComponentId.value
    } else {
      // Restore normal visibility preferences.
      object.visible =
        !component ||
        !hiddenComponentIds.value.includes(component.id)
    }
  })
}

function isolateComponent(component: AutomotiveComponent) {
  // Ensure that the component exists in the model.
  const meshes = findComponentMeshes(component)

  if (meshes.length === 0) {
    console.warn(`Cannot isolate ${component.name}: no meshes found`)
    return
  }

  isolatedComponentId.value = component.id

  selectComponent(component)
  applyComponentVisibility()
}

function exitIsolation() {
  isolatedComponentId.value = null
  applyComponentVisibility()
}

function isolateSelectedComponent() {
  const component = golf7Components.find(
    c => c.id === selectedComponentId.value
  )

  if (component) {
    isolateComponent(component)
  }
}


function focusOnComponent(component: AutomotiveComponent) {
  if (!carModel) return

  const meshes = findComponentMeshes(component)

  if (meshes.length === 0) {
    console.warn(`Cannot focus on ${component.name}`)
    return
  }

  // Calculate the bounding box of all component meshes.
  const bounds = new THREE.Box3()

  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false)

    const meshBounds = new THREE.Box3().setFromObject(mesh)
    bounds.union(meshBounds)
  }

  if (bounds.isEmpty()) return

  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())

  const maxDimension = Math.max(size.x, size.y, size.z)

  // Calculate a suitable camera distance.
  const verticalFov = THREE.MathUtils.degToRad(camera.fov)
  const horizontalFov = 2 * Math.atan(
    Math.tan(verticalFov / 2) * camera.aspect
  )

  const limitingFov = Math.min(verticalFov, horizontalFov)

  const distance = Math.max(
    (maxDimension / 2) / Math.tan(limitingFov / 2) * 1.8,
    0.2
  )

  // Preserve the current viewing direction.
  const direction = camera.position
    .clone()
    .sub(controls.target)
    .normalize()

  if (direction.lengthSq() < 0.0001) {
    direction.set(1, 0.5, 1).normalize()
  }

  focusTarget.copy(center)

  focusCameraPosition
    .copy(center)
    .addScaledVector(direction, distance)

  isCameraAnimating = true
}

function focusSelectedComponent() {
  const component = golf7Components.find(
    c => c.id === selectedComponentId.value
  )

  if (component) {
    focusOnComponent(component)
  }
}

</script>

<template>
  <div class="viewer">
    <div ref="container" class="canvas-container"></div>

    <div class="part-panel">
      <h2>Car Parts Explorer</h2>
      <p>Click on a component to inspect it.</p>

      <div v-if="selectedPart" class="selected">
        <strong>Selected component</strong>
        <p>{{ selectedPart }}</p>
      </div>
      <p v-else>No component selected</p>
      <h3>Components</h3>

<ComponentList
  :components="golf7Components"
  :selected-id="selectedComponentId"
  :hidden-ids="hiddenComponentIds"
  @select="selectFromList"
  @toggle-visibility="toggleComponentVisibility"
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
</div>    </div>
  </div>
</template>

<style scoped>
.viewer {
  display: flex;
  width: 100%;
  height: 100vh;
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
</style>
