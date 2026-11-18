
import * as THREE from 'three'
import { createBrakeAssembly } from './brakeAssembly'
import { createSuspensionAssembly } from './suspensionAssembly'

type ProceduralModelFactory = () => THREE.Group

const proceduralModelRegistry: Record<string, ProceduralModelFactory> = {
  'brake-assembly': createBrakeAssembly,
  'suspension-assembly': createSuspensionAssembly
}

export function createProceduralModel(id: string): THREE.Group {
  const factory = proceduralModelRegistry[id]

  if (!factory) {
    throw new Error(`Unknown procedural model: ${id}`)
  }

  return factory()
}
