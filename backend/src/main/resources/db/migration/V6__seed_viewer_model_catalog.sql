
-- ============================================================
-- V6: Seed viewer model catalog and vehicle associations
-- ============================================================

-- ------------------------------------------------------------
-- 1. Register Volkswagen Golf VII exterior
-- ------------------------------------------------------------

INSERT INTO viewer_models (
    code,
    name,
    description,
    model_type,
    category,
    asset_path,
    procedural_key,
    accuracy_level,
    source_url,
    license,
    enabled,
    global_fallback
)
VALUES (
    'golf7-exterior',
    'Volkswagen Golf VII Exterior',
    'Representative 3D exterior model of the Volkswagen Golf VII.',
    'GLTF',
    'EXTERIOR',
    '/models/golf7/exterior.glb',
    NULL,
    'REPRESENTATIVE',
    NULL,
    NULL,
    TRUE,
    FALSE
);

-- ------------------------------------------------------------
-- 2. Enable generic brake model fallback
-- ------------------------------------------------------------

UPDATE viewer_models
SET
    description =
        'Generic educational disc brake assembly. '
        'Not a verified vehicle-specific mechanical model.',
    global_fallback = TRUE
WHERE code = 'brake-assembly';

-- ------------------------------------------------------------
-- 3. Enable generic suspension model fallback
-- ------------------------------------------------------------

UPDATE viewer_models
SET
    description =
        'Generic educational MacPherson front suspension assembly. '
        'Not a verified vehicle-specific mechanical model.',
    global_fallback = TRUE
WHERE code = 'suspension-assembly';

-- ------------------------------------------------------------
-- 4. Validate catalog prerequisites
-- ------------------------------------------------------------

DO $$
DECLARE
    generation_count INTEGER;
    model_count INTEGER;
BEGIN

    SELECT COUNT(*)
    INTO generation_count
    FROM vehicle_generations vg
    JOIN vehicle_models vm
        ON vm.id = vg.vehicle_model_id
    JOIN manufacturers mf
        ON mf.id = vm.manufacturer_id
    WHERE mf.name = 'Volkswagen'
      AND vm.name = 'Golf'
      AND vg.name = 'Golf VII';

    IF generation_count <> 1 THEN
        RAISE EXCEPTION
            'Expected exactly one Volkswagen Golf VII generation, found %',
            generation_count;
    END IF;

    SELECT COUNT(*)
    INTO model_count
    FROM viewer_models
    WHERE code IN (
        'golf7-exterior',
        'brake-assembly',
        'suspension-assembly'
    )
    AND enabled = TRUE;

    IF model_count <> 3 THEN
        RAISE EXCEPTION
            'Expected three enabled viewer models, found %',
            model_count;
    END IF;

END $$;

-- ------------------------------------------------------------
-- 5. Associate models with Volkswagen Golf VII generation
-- ------------------------------------------------------------

INSERT INTO generation_viewer_models (
    generation_id,
    viewer_model_id
)
SELECT
    vg.id,
    viewer.id
FROM vehicle_generations vg
JOIN vehicle_models vm
    ON vm.id = vg.vehicle_model_id
JOIN manufacturers mf
    ON mf.id = vm.manufacturer_id
CROSS JOIN viewer_models viewer
WHERE mf.name = 'Volkswagen'
  AND vm.name = 'Golf'
  AND vg.name = 'Golf VII'
  AND viewer.code IN (
      'golf7-exterior',
      'brake-assembly',
      'suspension-assembly'
  );

-- ------------------------------------------------------------
-- 6. Variant associations
-- ------------------------------------------------------------

-- Intentionally empty.
--
-- Current models are inherited from the vehicle generation.
-- Variant-level associations will be introduced when dedicated
-- engine, transmission or mechanical assets become available.
