
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

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
let selectedMesh: THREE.Mesh | null = null

const componentNames: Record<string, string> = {
  bonnet_ok1: 'Hood',
  door_lf_ok1: 'Front Left Door',
  bump_fro01_1: 'Front Bumper',
  bump_rea01_1: 'Rear Bumper',
  windscre01_1: 'Windshield',
}

function createPart(
  name: string,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  rotation?: [number, number, number]
) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)

  if (rotation) mesh.rotation.set(...rotation)

  mesh.castShadow = true
  mesh.receiveShadow = true

  scene.add(mesh)
  selectableParts.push(mesh)
  return mesh
}

function createDemoCar() {
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    metalness: 0.5,
    roughness: 0.3
  })

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    metalness: 0.2,
    roughness: 0.15
  })

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x171717,
    roughness: 0.9
  })

  createPart(
    'Car Body',
    new THREE.BoxGeometry(4, 0.7, 1.8),
    bodyMaterial,
    [0, 0.9, 0]
  )

  createPart(
    'Cabin',
    new THREE.BoxGeometry(2, 0.75, 1.5),
    glassMaterial,
    [-0.25, 1.6, 0]
  )

  const wheelPositions: [string, number, number, number][] = [
    ['Front Left Wheel', 1.25, 0.45, 0.95],
    ['Front Right Wheel', 1.25, 0.45, -0.95],
    ['Rear Left Wheel', -1.25, 0.45, 0.95],
    ['Rear Right Wheel', -1.25, 0.45, -0.95]
  ]

  for (const [name, x, y, z] of wheelPositions) {
    createPart(
      name,
      new THREE.CylinderGeometry(0.45, 0.45, 0.25, 32),
      tireMaterial,
      [x, y, z],
      [Math.PI / 2, 0, 0]
    )
  }
}


function onPointerClick(event: MouseEvent) {
  if (!container.value) return

  const bounds =
    renderer.domElement.getBoundingClientRect()

  pointer.x =
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1

  pointer.y =
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)

  const intersections = raycaster.intersectObjects(
    selectableParts,
    false
  )

  // Restore previously selected mesh
  if (selectedMesh) {
  const original = originalMaterials.get(selectedMesh)

  if (original) {
    const highlighted = selectedMesh.material

    selectedMesh.material = original

    const highlightedArray = Array.isArray(highlighted)
      ? highlighted
      : [highlighted]

    const originalArray = Array.isArray(original)
      ? original
      : [original]

    highlightedArray.forEach(material => {
      if (!originalArray.includes(material)) {
        material.dispose()
      }
    })
  }
}

  selectedMesh = null
  selectedPart.value = null

  if (intersections.length === 0) return

  const mesh = intersections[0].object as THREE.Mesh

  // Clone materials so only this mesh is highlighted
  const originals = originalMaterials.get(mesh)
  if (!originals) return

  const highlight = (material: THREE.Material) => {
    const clone = material.clone()

    if (clone instanceof THREE.MeshStandardMaterial) {
      clone.emissive.setHex(0x3366ff)
      clone.emissiveIntensity = 0.6
    }

    return clone
  }

  mesh.material = Array.isArray(originals)
    ? originals.map(highlight)
    : highlight(originals)

  selectedMesh = mesh
  const hierarchy: string[] = []

  let current: THREE.Object3D | null = mesh

  while (current) {
    hierarchy.unshift(
      `${current.name || '(unnamed)'} [${current.type}]`
    )
    current = current.parent
  }

  console.log('Selected mesh:', mesh.name)
  console.log('Mesh hierarchy:', hierarchy.join(' → '))

  selectedPart.value = getComponentName(mesh)
}


onMounted(() => {
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
    controls.update()
    renderer.render(scene, camera)
  }

  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  renderer?.domElement.removeEventListener('click', onPointerClick)
  controls?.dispose()
  scene?.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material]
      materials.forEach(material => material.dispose())
    }
  })
  renderer?.dispose()
  renderer?.domElement.remove()
})


async function loadCarModel() {
  const loader = new GLTFLoader()

  try {
    const gltf = await loader.loadAsync(
      '/models/golf7/exterior.glb'
    )

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

    // Look for a known automotive component
    if (name && componentNames[name]) {
      return componentNames[name]
    }

    current = current.parent
  }

  // Fallback: show the first meaningful object name
  current = mesh

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
    </div>
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
</style>
