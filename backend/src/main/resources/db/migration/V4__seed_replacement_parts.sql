
-- V4: Synthetic replacement parts for development/testing.
-- These are NOT verified automotive fitments.

-- Ensure that the seeded vehicle variant exists uniquely.
DO $$
DECLARE
    variant_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO variant_count
    FROM vehicle_variants
    WHERE displacement_cc = 1598
      AND power_kw = 77
      AND name ILIKE '%1.6%TDI%';

    IF variant_count <> 1 THEN
        RAISE EXCEPTION
            'Expected exactly one Golf VII 1.6 TDI variant, found %',
            variant_count;
    END IF;
END $$;

-- 1. Insert demonstration replacement parts.

INSERT INTO parts (
    brand,
    part_number,
    oem_reference,
    name,
    description
)
VALUES
(
    'DemoBrake',
    'DEMO-BD-001',
    NULL,
    'Front Brake Disc',
    'Synthetic front brake disc for development.'
),
(
    'DemoBrake',
    'DEMO-BD-002',
    NULL,
    'Rear Brake Disc',
    'Synthetic rear brake disc for development.'
),
(
    'DemoBrake',
    'DEMO-BC-001',
    NULL,
    'Front Left Brake Caliper',
    'Synthetic brake caliper for development.'
),
(
    'DemoSuspension',
    'DEMO-SA-001',
    NULL,
    'Front Shock Absorber',
    'Synthetic shock absorber for development.'
),
(
    'DemoSuspension',
    'DEMO-CS-001',
    NULL,
    'Front Coil Spring',
    'Synthetic coil spring for development.'
),
(
    'DemoSuspension',
    'DEMO-LCA-001',
    NULL,
    'Front Left Lower Control Arm',
    'Synthetic control arm for development.'
);

-- 2. Associate products with automotive components.

INSERT INTO part_components (
    part_id,
    component_id
)
SELECT
    p.id,
    c.id
FROM (
    VALUES
        ('DEMO-BD-001', 'BRAKE_DISC'),
        ('DEMO-BD-002', 'BRAKE_DISC'),
        ('DEMO-BC-001', 'BRAKE_CALIPER'),
        ('DEMO-SA-001', 'SHOCK_ABSORBER'),
        ('DEMO-CS-001', 'COIL_SPRING'),
        ('DEMO-LCA-001', 'LOWER_CONTROL_ARM')
) AS mapping(part_number, component_code)
JOIN parts p
    ON p.part_number = mapping.part_number
   AND p.brand IN ('DemoBrake', 'DemoSuspension')
JOIN components c
    ON c.code = mapping.component_code;

-- 3. Add synthetic fitments for the seeded vehicle variant.

INSERT INTO part_fitments (
    part_id,
    vehicle_variant_id,
    position,
    notes
)
SELECT
    p.id,
    v.id,
    mapping.position,
    'Synthetic fitment for API testing only'
FROM (
    VALUES
        ('DemoBrake', 'DEMO-BD-001', 'FRONT'),
        ('DemoBrake', 'DEMO-BD-002', 'REAR'),
        ('DemoBrake', 'DEMO-BC-001', 'FRONT_LEFT'),
        ('DemoSuspension', 'DEMO-SA-001', 'FRONT'),
        ('DemoSuspension', 'DEMO-CS-001', 'FRONT'),
        ('DemoSuspension', 'DEMO-LCA-001', 'FRONT_LEFT')
) AS mapping(brand, part_number, position)
JOIN parts p
    ON p.brand = mapping.brand
   AND p.part_number = mapping.part_number
CROSS JOIN vehicle_variants v
WHERE v.displacement_cc = 1598
  AND v.power_kw = 77
  AND v.name ILIKE '%1.6%TDI%';
