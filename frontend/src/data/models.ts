
import type { ViewerModelConfig } from '../types/viewer'

import { golf7Components } from './vehicles/golf7.components'
import { brakeComponents } from './assemblies/brakes.components'
import { brakeExplodedView } from './assemblies/brakes.exploded'
import { suspensionComponents } from './assemblies/suspension.components'
import { suspensionExplodedView } from './assemblies/suspension.exploded'

export const viewerModels: ViewerModelConfig[] = [
  {
    id: 'golf7-exterior',
    name: 'Volkswagen Golf 7 — Exterior',
    modelType: 'gltf',
    modelPath: '/models/golf7/exterior.glb',
    components: golf7Components,
    showLabelsByDefault: false
  },
  {
    id: 'brake-assembly',
    name: 'Brake Assembly — Schematic',
    modelType: 'procedural',
    components: brakeComponents,
    explodedView: brakeExplodedView,
    showLabelsByDefault: true
  },
  {
    id: 'suspension-assembly',
    name: 'Front Suspension — MacPherson Schematic',
    modelType: 'procedural',
    components: suspensionComponents,
    explodedView: suspensionExplodedView,
    showLabelsByDefault: true
  }
]
