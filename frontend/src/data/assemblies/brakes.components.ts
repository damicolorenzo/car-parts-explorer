
import type { AutomotiveComponent } from '../../types/automotive'

export const brakeComponents: AutomotiveComponent[] = [
  {
    id: 'brake-disc',
    name: 'Brake Disc',
    category: 'brakes',
    meshNames: ['brake-disc'],
    technicalInfo: {
      description:
        'A rotating metal disc connected to the wheel hub.',
      function:
        'Provides the friction surface against which brake pads act to slow the vehicle.',
      material: 'Typically cast iron',
      maintenance: [
        'Inspect disc thickness and wear',
        'Check for scoring, cracks, and corrosion',
        'Replace when below the specified minimum thickness'
      ],
      compatibilityNotes:
        'Schematic component. Vehicle-specific fitment has not been verified.'
    }
  },
  {
    id: 'wheel-hub',
    name: 'Wheel Hub',
    category: 'brakes',
    meshNames: ['wheel-hub'],
    technicalInfo: {
      description:
        'The central mounting component connecting the wheel to the rotating wheel-end assembly.',
      function:
        'Supports wheel mounting and transfers rotational forces through the wheel-end assembly.',
      material: 'Typically steel or a steel alloy',
      maintenance: [
        'Inspect mounting surfaces and fasteners',
        'Check for excessive play or abnormal noise',
        'Inspect associated bearings where applicable'
      ],
      compatibilityNotes:
        'Schematic component. Actual hub design varies by vehicle.'
    }
  },
  {
    id: 'brake-caliper',
    name: 'Brake Caliper',
    category: 'brakes',
    meshNames: ['brake-caliper'],
    technicalInfo: {
      description:
        'A housing containing the mechanism that applies the brake pads to the disc.',
      function:
        'Converts hydraulic pressure into clamping force on the brake disc.',
      material: 'Typically cast iron or aluminum alloy',
      maintenance: [
        'Inspect for fluid leaks',
        'Check piston and sliding mechanism operation',
        'Inspect dust boots and corrosion'
      ],
      compatibilityNotes:
        'Schematic component. Not associated with a verified OEM part number.'
    }
  }
]
