
import type { ExplodedViewConfig } from '../../types/explodedView'

export const suspensionExplodedView: ExplodedViewConfig = {
  parts: [
    {
      meshName: 'shock-absorber',
      direction: [0, 0, 1],
      distance: 0.8
    },
    {
      meshName: 'coil-spring',
      direction: [1, 0, 0],
      distance: 1.4
    },
    {
      meshName: 'strut-mount',
      direction: [0, 1, 0],
      distance: 1.2
    },
    {
      meshName: 'steering-knuckle',
      direction: [0, -1, 0],
      distance: 0.8
    },
    {
      meshName: 'lower-control-arm',
      direction: [-1, -0.3, 0],
      distance: 1.2
    }
  ]
}
