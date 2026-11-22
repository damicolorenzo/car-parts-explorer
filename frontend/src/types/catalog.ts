
export interface AssemblyResponse {
  id: string
  code: string
  name: string
  description: string | null
}

export interface ComponentResponse {
  id: string
  assemblyId: string
  code: string
  name: string
  description: string | null
  functionDescription: string | null
  material: string | null
}

export interface ViewerMeshResponse {
  viewerModelId: string
  meshName: string
  component: ComponentResponse
}
