
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'

import { ExplodedViewController } from '../ExplodedViewController'

describe('ExplodedViewController', () => {
  function createFixture() {
    const model = new THREE.Group()

    const disc = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial()
    )

    disc.name = 'brake-disc'
    model.add(disc)

    const controller = new ExplodedViewController(
      model,
      {
        parts: [
          {
            meshName: 'brake-disc',
            direction: [1, 0, 0],
            distance: 2
          }
        ]
      }
    )

    return { model, disc, controller }
  }

  it('moves parts toward their exploded positions', () => {
    const { disc, controller } = createFixture()

    controller.setAmount(1)

    for (let i = 0; i < 100; i++) {
      controller.update()
    }

    expect(disc.position.x).toBeCloseTo(2, 3)
    expect(disc.position.y).toBeCloseTo(0, 3)

    controller.dispose()
  })

  it('returns parts to their original positions', () => {
    const { disc, controller } = createFixture()

    controller.setAmount(1)

    for (let i = 0; i < 100; i++) {
      controller.update()
    }

    controller.reset()

    for (let i = 0; i < 100; i++) {
      controller.update()
    }

    expect(disc.position.x).toBeCloseTo(0, 3)

    controller.dispose()
  })

  it('clamps explosion amount to the valid range', () => {
    const { disc, controller } = createFixture()

    controller.setAmount(5)

    for (let i = 0; i < 100; i++) {
      controller.update()
    }

    expect(disc.position.x).toBeCloseTo(2, 3)

    controller.dispose()
  })

  it('handles missing parts without throwing', () => {
    const model = new THREE.Group()

    const controller = new ExplodedViewController(
      model,
      {
        parts: [
          {
            meshName: 'missing-part',
            direction: [1, 0, 0],
            distance: 1
          }
        ]
      }
    )

    expect(() => controller.update()).not.toThrow()
    controller.dispose()
  })
})
