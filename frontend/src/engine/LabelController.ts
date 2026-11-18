
import * as THREE from 'three'
import type { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import type { AutomotiveComponent } from '../types/automotive'
import { createComponentLabel } from '../utils/componentLabels'
import type { ComponentController } from './ComponentController'

interface LabelEntry {
  label: CSS2DObject
  meshes: THREE.Mesh[]
}

export class LabelController {
  private readonly entries = new Map<string, LabelEntry>()
  private visible = false

  constructor(
    components: AutomotiveComponent[],
    componentController: ComponentController,
    visibleByDefault = false
  ) {
    this.visible = visibleByDefault

    for (const component of components) {
      const meshes = componentController.findMeshes(component)
      if (meshes.length === 0) continue

      const anchor = meshes[0]!

      // Calculate the component's initial world-space bounds.
      anchor.updateWorldMatrix(true, false)

      const bounds = new THREE.Box3().setFromObject(anchor)
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())

      center.y += Math.max(size.y * 0.6, 0.15)

      // CSS2D labels are attached to their component meshes.
      const localPosition = anchor.worldToLocal(center)

      const label = createComponentLabel(component)
      label.position.copy(localPosition)

      anchor.add(label)

      this.entries.set(component.id, {
        label,
        meshes
      })
    }

    this.updateVisibility()
  }

  setVisible(visible: boolean): void {
    this.visible = visible
    this.updateVisibility()
  }

  toggle(): boolean {
    this.setVisible(!this.visible)
    return this.visible
  }

  updateVisibility(): void {
    for (const entry of this.entries.values()) {
      const hasVisibleMesh = entry.meshes.some(
        mesh => this.isEffectivelyVisible(mesh)
      )

      entry.label.visible =
        this.visible && hasVisibleMesh
    }
  }

  private isEffectivelyVisible(
    object: THREE.Object3D
  ): boolean {
    let current: THREE.Object3D | null = object

    while (current) {
      if (!current.visible) return false
      current = current.parent
    }

    return true
  }

  dispose(): void {
    for (const entry of this.entries.values()) {
      entry.label.removeFromParent()

      // CSS2DObject does not require GPU disposal,
      // but its DOM element should be detached.
      entry.label.element.remove()
    }

    this.entries.clear()
  }
}
