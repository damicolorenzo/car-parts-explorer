
import * as THREE from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class CameraController {
  private readonly camera: THREE.PerspectiveCamera
  private readonly controls: OrbitControls

  private readonly targetPosition = new THREE.Vector3()
  private readonly targetLookAt = new THREE.Vector3()

  private animating = false
  private readonly speed = 0.08

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls
  ) {
    this.camera = camera
    this.controls = controls
  }

  focusOnObjects(objects: THREE.Object3D[]): boolean {
    if (objects.length === 0) return false

    const bounds = new THREE.Box3()

    for (const object of objects) {
      object.updateWorldMatrix(true, true)
      bounds.union(new THREE.Box3().setFromObject(object))
    }

    if (bounds.isEmpty()) return false

    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())

    const maxDimension = Math.max(
      size.x,
      size.y,
      size.z
    )

    const verticalFov = THREE.MathUtils.degToRad(
      this.camera.fov
    )

    const horizontalFov = 2 * Math.atan(
      Math.tan(verticalFov / 2) * this.camera.aspect
    )

    const limitingFov = Math.min(
      verticalFov,
      horizontalFov
    )

    const distance = Math.max(
      (maxDimension / 2) /
        Math.tan(limitingFov / 2) * 1.8,
      0.2
    )

    // Preserve the current viewing direction.
    const direction = this.camera.position
      .clone()
      .sub(this.controls.target)

    if (direction.lengthSq() < 0.0001) {
      direction.set(1, 0.5, 1)
    }

    direction.normalize()

    this.targetLookAt.copy(center)

    this.targetPosition
      .copy(center)
      .addScaledVector(direction, distance)

    this.animating = true
    return true
  }

  update(): void {
    if (!this.animating) return

    this.camera.position.lerp(
      this.targetPosition,
      this.speed
    )

    this.controls.target.lerp(
      this.targetLookAt,
      this.speed
    )

    const cameraDone =
      this.camera.position.distanceTo(
        this.targetPosition
      ) < 0.01

    const targetDone =
      this.controls.target.distanceTo(
        this.targetLookAt
      ) < 0.01

    if (cameraDone && targetDone) {
      this.camera.position.copy(this.targetPosition)
      this.controls.target.copy(this.targetLookAt)
      this.animating = false
    }
  }

  stop(): void {
    this.animating = false
  }

  dispose(): void {
    this.stop()
  }
}
