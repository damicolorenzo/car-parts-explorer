
import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'

import { ModelManager } from '../ModelManager'

describe('ModelManager', () => {
  it('centers a model at the world origin', async () => {
    const manager = new ModelManager()

    const model = await manager.load({
      id: 'brake-assembly',
      name: 'Brake Assembly',
      modelType: 'procedural',
      components: []
    })

    const bounds = new THREE.Box3().setFromObject(model)
    const center = bounds.getCenter(new THREE.Vector3())

    expect(center.length()).toBeLessThan(0.001)

    manager.dispose(model)
  })

  it('disposes geometries and materials', () => {
    const manager = new ModelManager()

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial()

    const geometrySpy = vi.spyOn(geometry, 'dispose')
    const materialSpy = vi.spyOn(material, 'dispose')

    const model = new THREE.Group()
    model.add(new THREE.Mesh(geometry, material))

    manager.dispose(model)

    expect(geometrySpy).toHaveBeenCalledOnce()
    expect(materialSpy).toHaveBeenCalledOnce()
  })

  it('disposes shared resources only once', () => {
    const manager = new ModelManager()

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial()

    const geometrySpy = vi.spyOn(geometry, 'dispose')
    const materialSpy = vi.spyOn(material, 'dispose')

    const model = new THREE.Group()

    model.add(new THREE.Mesh(geometry, material))
    model.add(new THREE.Mesh(geometry, material))

    manager.dispose(model)

    expect(geometrySpy).toHaveBeenCalledOnce()
    expect(materialSpy).toHaveBeenCalledOnce()
  })
})
