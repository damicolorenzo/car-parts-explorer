
-- ============================================================
-- V3: Seed automotive assemblies, components and viewer meshes
-- ============================================================

-- 1. Assemblies

INSERT INTO assemblies (code, name, description)
VALUES
(
    'BRAKE_SYSTEM',
    'Brake System',
    'Disc brake assembly responsible for slowing and stopping the vehicle.'
),
(
    'FRONT_SUSPENSION',
    'Front Suspension',
    'MacPherson strut suspension assembly supporting vehicle weight, steering and wheel movement.'
);

-- 2. Components

INSERT INTO components (
    assembly_id,
    code,
    name,
    description,
    function_description,
    material
)
VALUES

-- Brake system

(
    (SELECT id FROM assemblies WHERE code = 'BRAKE_SYSTEM'),
    'BRAKE_DISC',
    'Brake Disc',
    'Rotating friction disc attached to the wheel hub.',
    'Provides a friction surface for the brake pads, converting vehicle kinetic energy into heat during braking.',
    'Cast iron or carbon-ceramic composite'
),
(
    (SELECT id FROM assemblies WHERE code = 'BRAKE_SYSTEM'),
    'WHEEL_HUB',
    'Wheel Hub',
    'Central rotating component connecting the wheel to the vehicle.',
    'Supports wheel mounting and transfers rotational loads through the wheel bearing.',
    'Forged steel or cast iron'
),
(
    (SELECT id FROM assemblies WHERE code = 'BRAKE_SYSTEM'),
    'BRAKE_CALIPER',
    'Brake Caliper',
    'Hydraulic assembly containing pistons that act on the brake pads.',
    'Applies clamping force to the brake disc to generate braking friction.',
    'Cast iron or aluminum alloy'
),

-- Front suspension

(
    (SELECT id FROM assemblies WHERE code = 'FRONT_SUSPENSION'),
    'SHOCK_ABSORBER',
    'Shock Absorber',
    'Hydraulic damper integrated into the MacPherson strut.',
    'Controls suspension oscillations by dissipating motion energy.',
    'Steel, hydraulic fluid and elastomer seals'
),
(
    (SELECT id FROM assemblies WHERE code = 'FRONT_SUSPENSION'),
    'COIL_SPRING',
    'Coil Spring',
    'Helical spring supporting the vehicle through the suspension.',
    'Stores and releases elastic energy while supporting vehicle weight and absorbing road irregularities.',
    'Spring steel'
),
(
    (SELECT id FROM assemblies WHERE code = 'FRONT_SUSPENSION'),
    'STRUT_MOUNT',
    'Strut Mount',
    'Upper attachment connecting the suspension strut to the vehicle body.',
    'Transfers suspension loads to the body while isolating vibration and, where applicable, allowing steering rotation.',
    'Steel, rubber and bearing components'
),
(
    (SELECT id FROM assemblies WHERE code = 'FRONT_SUSPENSION'),
    'STEERING_KNUCKLE',
    'Steering Knuckle',
    'Structural component connecting the wheel hub, suspension and steering linkage.',
    'Supports the wheel bearing and transmits steering, braking and suspension forces.',
    'Cast iron, forged steel or aluminum alloy'
),
(
    (SELECT id FROM assemblies WHERE code = 'FRONT_SUSPENSION'),
    'LOWER_CONTROL_ARM',
    'Lower Control Arm',
    'Suspension link connecting the steering knuckle to the vehicle subframe.',
    'Controls wheel positioning and transmits lateral and longitudinal suspension loads.',
    'Stamped steel, forged steel or aluminum alloy'
);

-- 3. Three.js viewer mesh mappings

INSERT INTO viewer_meshes (
    component_id,
    viewer_model_id,
    mesh_name
)
VALUES
(
    (SELECT id FROM components WHERE code = 'BRAKE_DISC'),
    'brake-assembly',
    'brake-disc'
),
(
    (SELECT id FROM components WHERE code = 'WHEEL_HUB'),
    'brake-assembly',
    'wheel-hub'
),
(
    (SELECT id FROM components WHERE code = 'BRAKE_CALIPER'),
    'brake-assembly',
    'brake-caliper'
),
(
    (SELECT id FROM components WHERE code = 'SHOCK_ABSORBER'),
    'suspension-assembly',
    'shock-absorber'
),
(
    (SELECT id FROM components WHERE code = 'COIL_SPRING'),
    'suspension-assembly',
    'coil-spring'
),
(
    (SELECT id FROM components WHERE code = 'STRUT_MOUNT'),
    'suspension-assembly',
    'strut-mount'
),
(
    (SELECT id FROM components WHERE code = 'STEERING_KNUCKLE'),
    'suspension-assembly',
    'steering-knuckle'
),
(
    (SELECT id FROM components WHERE code = 'LOWER_CONTROL_ARM'),
    'suspension-assembly',
    'lower-control-arm'
);
