import * as THREE from 'three'
import type { AutomotiveComponent } from '../types/automotive'

export function resolveComponent(
  mesh: THREE.Mesh,
  modelRoot: THREE.Object3D,
  components: AutomotiveComponent[]
): AutomotiveComponent | null {
  let current: THREE.Object3D | null = mesh

  while (current && current !== modelRoot) {
    const match = components.find(component =>
      component.meshNames.includes(current!.name)
    )

    if (match) return match

    current = current.parent
  }

  return null
}