
import type { ExplodedViewConfig } from '../../types/explodedView'

export const brakeExplodedView: ExplodedViewConfig = {
  parts: [
    {
      meshName: 'brake-disc',
      direction: [0, 0, 1],
      distance: 0.8
    },
    {
      meshName: 'wheel-hub',
      direction: [0, 0, -1],
      distance: 0.8
    },
    {
      meshName: 'brake-caliper',
      direction: [1, 0, 0],
      distance: 1.2
    }
  ]
}
