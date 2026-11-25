
import type { AutomotiveComponent } from '../../types/automotive'

export const suspensionComponents: AutomotiveComponent[] = [
  {
    id: 'shock-absorber',
    name: 'Shock Absorber',
    category: 'suspension',
    meshNames: ['shock-absorber'],
    technicalInfo: {
      description:
        'A damping device incorporated into the suspension strut.',
      function:
        'Controls suspension oscillations by dissipating motion energy.',
      material: 'Steel housing with hydraulic damping components',
      maintenance: [
        'Inspect for fluid leakage',
        'Check for abnormal noise and reduced damping',
        'Inspect mounting points and bushings'
      ],
      compatibilityNotes:
        'Schematic representation; fitment is not vehicle-specific.'
    }
  },
  {
    id: 'coil-spring',
    name: 'Coil Spring',
    category: 'suspension',
    meshNames: ['coil-spring'],
    technicalInfo: {
      description:
        'A helical spring used to support the vehicle and absorb suspension movement.',
      function:
        'Supports vehicle load and allows controlled vertical wheel travel.',
      material: 'Spring steel',
      maintenance: [
        'Inspect for cracks or broken coils',
        'Check for corrosion',
        'Inspect spring seats and isolators'
      ],
      compatibilityNotes:
        'Spring specifications vary by vehicle and axle load.'
    }
  },
  {
    id: 'strut-mount',
    name: 'Strut Mount',
    category: 'suspension',
    meshNames: ['strut-mount'],
    technicalInfo: {
      description:
        'The upper mounting interface between the suspension strut and vehicle body.',
      function:
        'Transfers suspension loads to the body and may incorporate a steering bearing.',
      material: 'Steel and elastomeric components',
      maintenance: [
        'Inspect for excessive movement',
        'Check for noise during steering',
        'Inspect rubber deterioration'
      ],
      compatibilityNotes:
        'Mount designs differ between suspension configurations.'
    }
  },
  {
    id: 'steering-knuckle',
    name: 'Steering Knuckle',
    category: 'suspension',
    meshNames: ['steering-knuckle'],
    technicalInfo: {
      description:
        'A structural component connecting the wheel-end assembly to the suspension.',
      function:
        'Supports wheel-bearing and steering connections while transferring road loads.',
      material: 'Typically cast iron, steel, or aluminum alloy',
      maintenance: [
        'Inspect for cracks or deformation',
        'Check bearing mounting surfaces',
        'Inspect suspension attachment points'
      ],
      compatibilityNotes:
        'Geometry and attachment points are vehicle-specific.'
    }
  },
  {
    id: 'lower-control-arm',
    name: 'Lower Control Arm',
    category: 'suspension',
    meshNames: ['lower-control-arm'],
    technicalInfo: {
      description:
        'A suspension linkage connecting the wheel-end assembly to the chassis or subframe.',
      function:
        'Controls wheel positioning and transfers forces through bushings and joints.',
      material: 'Typically stamped steel, cast steel, or aluminum alloy',
      maintenance: [
        'Inspect bushings for wear',
        'Check ball-joint play where applicable',
        'Inspect for corrosion or deformation'
      ],
      compatibilityNotes:
        'Actual control-arm geometry varies by vehicle.'
    }
  }
]
