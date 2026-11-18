
import * as THREE from 'three'

export function createSuspensionAssembly(): THREE.Group {
  const assembly = new THREE.Group()
  assembly.name = 'suspension-assembly'

  // Materials
  const steel = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.8,
    roughness: 0.3
  })

  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.4
  })

  const springMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    metalness: 0.6,
    roughness: 0.3
  })

  // 1. Shock absorber
  const shock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 3, 32),
    darkSteel
  )
  shock.name = 'shock-absorber'
  shock.position.set(0, 1.8, 0)
  assembly.add(shock)

  // 2. Coil spring
  const springPoints: THREE.Vector3[] = []
  const turns = 7
  const segments = 280

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = t * Math.PI * 2 * turns

    springPoints.push(
      new THREE.Vector3(
        Math.cos(angle) * 0.55,
        0.8 + t * 2,
        Math.sin(angle) * 0.55
      )
    )
  }

  const springCurve = new THREE.CatmullRomCurve3(springPoints)

  const spring = new THREE.Mesh(
    new THREE.TubeGeometry(
      springCurve,
      segments,
      0.075,
      10,
      false
    ),
    springMaterial
  )
  spring.name = 'coil-spring'
  assembly.add(spring)

  // 3. Upper strut mount
  const mount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.22, 32),
    steel
  )
  mount.name = 'strut-mount'
  mount.position.set(0, 3.4, 0)
  assembly.add(mount)

  // 4. Steering knuckle (schematic)
  const knuckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.1, 0.6),
    steel
  )
  knuckle.name = 'steering-knuckle'
  knuckle.position.set(0, -0.15, 0)
  assembly.add(knuckle)

  // 5. Lower control arm (schematic)
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.22, 0.45),
    darkSteel
  )
  arm.name = 'lower-control-arm'
  arm.position.set(-0.9, -0.9, 0)
  arm.rotation.z = -0.15
  assembly.add(arm)

  return assembly
}
