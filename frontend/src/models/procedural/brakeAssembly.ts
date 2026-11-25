
import * as THREE from 'three'

export function createBrakeAssembly(): THREE.Group {
  const assembly = new THREE.Group()
  assembly.name = 'brake-assembly'

  // Brake disc
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.18, 64),
    new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.8,
      roughness: 0.3
    })
  )

  disc.name = 'brake-disc'
  disc.rotation.x = Math.PI / 2
  assembly.add(disc)

  // Central hub
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32),
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.7,
      roughness: 0.4
    })
  )

  hub.name = 'wheel-hub'
  hub.rotation.x = Math.PI / 2
  assembly.add(hub)

  // Brake caliper (simplified representation)
  const caliper = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.5,
      roughness: 0.4
    })
  )

  caliper.name = 'brake-caliper'
  caliper.position.set(1.25, 0, 0)
  assembly.add(caliper)

  return assembly
}
