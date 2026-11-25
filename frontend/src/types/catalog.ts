
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


export interface PartResponse {
  id: string
  brand: string
  partNumber: string
  oemReference: string | null
  name: string
  description: string | null
  createdAt: string
}

export interface ManufacturerResponse {
  id: string
  name: string
}

export interface VehicleModelResponse {
  id: string
  name: string
}

export interface VehicleGenerationResponse {
  id: string
  name: string
}

export interface VehicleVariantResponse {
  id: string
  name: string
  engineCode: string | null
  fuelType: string | null
  displacementCc: number | null
  powerKw: number | null
  transmission: string | null
  drivetrain: string | null
}