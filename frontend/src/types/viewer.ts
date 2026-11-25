import type { AutomotiveComponent } from './automotive'
import type { ExplodedViewConfig } from './explodedView'

export interface ViewerModelConfig {
  id: string
  name: string
  components: AutomotiveComponent[]
  modelPath?: string
  modelType: 'gltf' | 'procedural'
  explodedView?: ExplodedViewConfig
  showLabelsByDefault?: boolean
}
