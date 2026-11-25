
export interface ExplodedPart {
  meshName: string
  direction: [number, number, number]
  distance: number
}

export interface ExplodedViewConfig {
  parts: ExplodedPart[]
}
