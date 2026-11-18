
import * as THREE from 'three'
import type { ExplodedViewConfig } from '../types/explodedView'

interface ExplodedObject {
  object: THREE.Object3D
  originalPosition: THREE.Vector3
  displacement: THREE.Vector3
}

export class ExplodedViewController {
  private readonly parts: ExplodedObject[] = []
  private readonly target = new THREE.Vector3()

  private amount = 0
  private readonly speed = 0.1

  constructor(
    model: THREE.Object3D,
    config: ExplodedViewConfig
  ) {
    this.initialize(model, config)
  }

  private initialize(
    model: THREE.Object3D,
    config: ExplodedViewConfig
  ): void {
    for (const part of config.parts) {
      const object = model.getObjectByName(part.meshName)

      if (!object) {
        console.warn(
          `Exploded-view object not found: ${part.meshName}`
        )
        continue
      }

      const direction = new THREE.Vector3(...part.direction)

      if (direction.lengthSq() === 0) {
        console.warn(
          `Invalid explosion direction: ${part.meshName}`
        )
        continue
      }

      const displacement = direction
        .normalize()
        .multiplyScalar(part.distance)

      this.parts.push({
        object,
        originalPosition: object.position.clone(),
        displacement
      })
    }
  }

  setAmount(value: number): void {
    this.amount = THREE.MathUtils.clamp(value, 0, 1)
  }

  update(): void {
    for (const part of this.parts) {
      this.target
        .copy(part.originalPosition)
        .addScaledVector(part.displacement, this.amount)

      part.object.position.lerp(this.target, this.speed)
    }
  }

  reset(): void {
    this.setAmount(0)
  }

  dispose(): void {
    this.parts.length = 0
    this.amount = 0
  }
}
