
import * as THREE from 'three'
import type { AutomotiveComponent } from '../types/automotive'
import { resolveComponent } from '../utils/componentResolver'

export class ComponentController {
  private readonly originalMaterials = new Map<
    THREE.Mesh,
    THREE.Material | THREE.Material[]
  >()

  private readonly selectedMeshes: THREE.Mesh[] = []
  private readonly selectableMeshes: THREE.Mesh[] = []

  private selectedComponentId: string | null = null
  private isolatedComponentId: string | null = null
  private readonly hiddenComponentIds = new Set<string>()

  private readonly model: THREE.Group
private readonly components: AutomotiveComponent[]

constructor(
  model: THREE.Group,
  components: AutomotiveComponent[]
) {
  this.model = model
  this.components = components
  this.registerMeshes()
}

  private registerMeshes(): void {
    this.model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return

      object.castShadow = true
      object.receiveShadow = true

      this.originalMaterials.set(object, object.material)
      this.selectableMeshes.push(object)
    })
  }

  getSelectableMeshes(): THREE.Mesh[] {
    return this.selectableMeshes.filter(mesh => mesh.visible)
  }

  resolve(mesh: THREE.Mesh): AutomotiveComponent | null {
    return resolveComponent(mesh, this.model, this.components)
  }

  findMeshes(component: AutomotiveComponent): THREE.Mesh[] {
    return this.selectableMeshes.filter(mesh => {
      return this.resolve(mesh)?.id === component.id
    })
  }

  clearSelection(): void {
    for (const mesh of this.selectedMeshes) {
      const original = this.originalMaterials.get(mesh)
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

    this.selectedMeshes.length = 0
    this.selectedComponentId = null
  }

  private highlightMesh(mesh: THREE.Mesh): void {
    const original = this.originalMaterials.get(mesh)
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

    this.selectedMeshes.push(mesh)
  }

  select(component: AutomotiveComponent): void {
    this.clearSelection()

    this.selectedComponentId = component.id

    const meshes = this.findMeshes(component)
    meshes.forEach(mesh => this.highlightMesh(mesh))
  }

  selectMesh(mesh: THREE.Mesh): AutomotiveComponent | null {
    const component = this.resolve(mesh)

    if (component) {
      this.select(component)
    } else {
      this.clearSelection()
      this.highlightMesh(mesh)
    }

    return component
  }

  setVisibility(
    component: AutomotiveComponent,
    visible: boolean
  ): void {
    if (visible) {
      this.hiddenComponentIds.delete(component.id)
    } else {
      this.hiddenComponentIds.add(component.id)

      if (this.selectedComponentId === component.id) {
        this.clearSelection()
      }
    }

    this.applyVisibility()
  }

  isHidden(componentId: string): boolean {
    return this.hiddenComponentIds.has(componentId)
  }

  isolate(component: AutomotiveComponent): void {
    if (this.findMeshes(component).length === 0) return

    this.isolatedComponentId = component.id
    this.select(component)
    this.applyVisibility()
  }

  exitIsolation(): void {
    this.isolatedComponentId = null
    this.applyVisibility()
  }

  isIsolated(): boolean {
    return this.isolatedComponentId !== null
  }

  private applyVisibility(): void {
    for (const mesh of this.selectableMeshes) {
      const component = this.resolve(mesh)

      if (this.isolatedComponentId !== null) {
        mesh.visible =
          component?.id === this.isolatedComponentId
      } else {
        mesh.visible =
          !component ||
          !this.hiddenComponentIds.has(component.id)
      }
    }
  }

  dispose(): void {
    this.clearSelection()
    this.originalMaterials.clear()
    this.selectedMeshes.length = 0
    this.selectableMeshes.length = 0
    this.hiddenComponentIds.clear()
    this.isolatedComponentId = null
  }
}