
-- Initial demonstration catalog
-- Example records for development, not verified OEM fitment data.

INSERT INTO manufacturers (name, country)
VALUES ('Volkswagen', 'Germany')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vehicle_models (manufacturer_id, name)
SELECT id, 'Golf'
FROM manufacturers
WHERE name = 'Volkswagen'
ON CONFLICT (manufacturer_id, name) DO NOTHING;

INSERT INTO vehicle_generations (
    vehicle_model_id,
    name,
    production_start_year,
    production_end_year
)
SELECT vm.id, 'Golf VII', 2012, 2020
FROM vehicle_models vm
JOIN manufacturers m ON vm.manufacturer_id = m.id
WHERE m.name = 'Volkswagen'
  AND vm.name = 'Golf'
ON CONFLICT (vehicle_model_id, name) DO NOTHING;

INSERT INTO vehicle_variants (
    generation_id,
    name,
    engine_code,
    fuel_type,
    displacement_cc,
    power_kw,
    transmission,
    drivetrain
)
SELECT
    vg.id,
    'Golf VII 1.6 TDI',
    NULL,
    'DIESEL',
    1598,
    77,
    'MANUAL',
    'FWD'
FROM vehicle_generations vg
JOIN vehicle_models vm ON vg.vehicle_model_id = vm.id
JOIN manufacturers m ON vm.manufacturer_id = m.id
WHERE m.name = 'Volkswagen'
  AND vm.name = 'Golf'
  AND vg.name = 'Golf VII';
