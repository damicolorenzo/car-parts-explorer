
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createProceduralModel } from '../models/procedural/registry'
import type { ViewerModelConfig } from '../types/viewer'

export class ModelManager {
  private readonly loader = new GLTFLoader()

  async load(config: ViewerModelConfig): Promise<THREE.Group> {
    let model: THREE.Group

    if (config.modelType === 'procedural') {
      model = createProceduralModel(config.id)
    } else {
      if (!config.modelPath) {
        throw new Error(`Missing model path for ${config.id}`)
      }

      const gltf = await this.loader.loadAsync(config.modelPath)
      model = gltf.scene
    }

    // Center the model around the world origin.
    const bounds = new THREE.Box3().setFromObject(model)

    if (!bounds.isEmpty()) {
      const center = bounds.getCenter(new THREE.Vector3())
      model.position.sub(center)
    }

    return model
  }

  frameModel(
    model: THREE.Group,
    camera: THREE.PerspectiveCamera,
    controls: { target: THREE.Vector3; update: () => void }
  ): void {
    const bounds = new THREE.Box3().setFromObject(model)

    if (bounds.isEmpty()) return

    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())

    const maxDimension = Math.max(size.x, size.y, size.z)

    const verticalFov = THREE.MathUtils.degToRad(camera.fov)
    const horizontalFov = 2 * Math.atan(
      Math.tan(verticalFov / 2) * camera.aspect
    )

    const limitingFov = Math.min(verticalFov, horizontalFov)

    const distance = Math.max(
      (maxDimension / 2) / Math.tan(limitingFov / 2) * 1.8,
      0.5
    )

    camera.position.set(
      center.x + distance,
      center.y + distance * 0.6,
      center.z + distance
    )

    camera.near = Math.max(distance / 1000, 0.01)
    camera.far = distance * 20
    camera.updateProjectionMatrix()

    controls.target.copy(center)
    controls.update()
  }

  dispose(model: THREE.Object3D): void {
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    const textures = new Set<THREE.Texture>()

    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return

      geometries.add(object.geometry)

      const meshMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material]

      for (const material of meshMaterials) {
        materials.add(material)

        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) {
            textures.add(value)
          }
        }
      }
    })

    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
    textures.forEach(texture => texture.dispose())
  }
}
