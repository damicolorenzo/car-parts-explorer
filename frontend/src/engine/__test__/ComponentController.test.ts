
import { describe, it, expect, afterEach } from 'vitest'
import * as THREE from 'three'

import { ComponentController } from '../ComponentController'
import type { AutomotiveComponent } from '../../types/automotive'

describe('ComponentController', () => {
  const controllers: ComponentController[] = []
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []

  afterEach(() => {
    controllers.forEach(controller => controller.dispose())
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())

    controllers.length = 0
    geometries.length = 0
    materials.length = 0
  })

  function createFixture() {
    const model = new THREE.Group()

    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888
    })

    const caliperMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc3333
    })

    const discGeometry = new THREE.BoxGeometry(1, 1, 1)
    const caliperGeometry = new THREE.BoxGeometry(1, 1, 1)

    const disc = new THREE.Mesh(discGeometry, discMaterial)
    disc.name = 'brake-disc'

    const caliper = new THREE.Mesh(
      caliperGeometry,
      caliperMaterial
    )
    caliper.name = 'brake-caliper'

    model.add(disc, caliper)

    const components: AutomotiveComponent[] = [
      {
        id: 'disc',
        name: 'Brake Disc',
        category: 'brakes',
        meshNames: ['brake-disc']
      },
      {
        id: 'caliper',
        name: 'Brake Caliper',
        category: 'brakes',
        meshNames: ['brake-caliper']
      }
    ]

    const controller = new ComponentController(
      model,
      components
    )

    controllers.push(controller)
    geometries.push(discGeometry, caliperGeometry)
    materials.push(discMaterial, caliperMaterial)

    return {
      model,
      disc,
      caliper,
      discMaterial,
      caliperMaterial,
      components,
      controller
    }
  }

  it('resolves meshes to their components', () => {
    const { disc, caliper, components, controller } =
      createFixture()

    expect(controller.resolve(disc)).toEqual(components[0])
    expect(controller.resolve(caliper)).toEqual(components[1])
  })

  it('finds meshes belonging to a component', () => {
    const { disc, components, controller } = createFixture()

    const meshes = controller.findMeshes(components[0]!)

    expect(meshes).toContain(disc)
    expect(meshes).toHaveLength(1)
  })

  it('highlights the selected component', () => {
    const { disc, components, controller } = createFixture()

    const originalMaterial = disc.material

    controller.select(components[0]!)

    expect(disc.material).not.toBe(originalMaterial)
  })

  it('restores original materials after clearing selection', () => {
    const {
      disc,
      components,
      controller
    } = createFixture()

    const originalMaterial = disc.material

    controller.select(components[0]!)
    controller.clearSelection()

    expect(disc.material).toBe(originalMaterial)
  })

  it('hides a component', () => {
    const { disc, components, controller } = createFixture()

    controller.setVisibility(components[0]!, false)

    expect(disc.visible).toBe(false)
    expect(controller.isHidden('disc')).toBe(true)
    expect(controller.getSelectableMeshes()).not.toContain(disc)
  })

  it('restores component visibility', () => {
    const { disc, components, controller } = createFixture()

    controller.setVisibility(components[0]!, false)
    controller.setVisibility(components[0]!, true)

    expect(disc.visible).toBe(true)
    expect(controller.isHidden('disc')).toBe(false)
  })

  it('isolates a component', () => {
    const {
      disc,
      caliper,
      components,
      controller
    } = createFixture()

    controller.isolate(components[0]!)

    expect(disc.visible).toBe(true)
    expect(caliper.visible).toBe(false)
    expect(controller.isIsolated()).toBe(true)
  })

  it('restores visibility after exiting isolation', () => {
    const {
      disc,
      caliper,
      components,
      controller
    } = createFixture()

    controller.isolate(components[0]!)
    controller.exitIsolation()

    expect(disc.visible).toBe(true)
    expect(caliper.visible).toBe(true)
    expect(controller.isIsolated()).toBe(false)
  })

  it('restores original materials when disposed', () => {
    const { disc, components, controller } = createFixture()

    const originalMaterial = disc.material

    controller.select(components[0]!)
    controller.dispose()

    expect(disc.material).toBe(originalMaterial)
  })
})
