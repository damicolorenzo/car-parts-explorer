
-- ============================================================
-- Car Parts Explorer
-- V7: Golf VII exterior components and procedural key correction
-- ============================================================

-- ------------------------------------------------------------
-- 1. Correct procedural model registry keys
-- ------------------------------------------------------------

UPDATE viewer_models
SET procedural_key = 'brake-assembly'
WHERE code = 'brake-assembly';

UPDATE viewer_models
SET procedural_key = 'suspension-assembly'
WHERE code = 'suspension-assembly';

-- ------------------------------------------------------------
-- 2. Register exterior assemblies
-- ------------------------------------------------------------

INSERT INTO assemblies (
    code,
    name,
    description
)
VALUES
(
    'BODY',
    'Body',
    'Exterior body panels and body-related components.'
),
(
    'GLASS',
    'Glass',
    'Automotive glazing and transparent exterior components.'
);

-- ------------------------------------------------------------
-- 3. Register logical automotive components
-- ------------------------------------------------------------

INSERT INTO components (
    assembly_id,
    code,
    name,
    description,
    function_description,
    material
)
SELECT
    a.id,
    data.code,
    data.name,
    data.description,
    data.function_description,
    data.material
FROM (
    VALUES
    (
        'BODY',
        'HOOD',
        'Hood',
        'A hinged exterior panel covering the front compartment.',
        'Provides access to the engine compartment and protects internal components.',
        NULL
    ),
    (
        'BODY',
        'FRONT_LEFT_DOOR',
        'Front Left Door',
        'The movable exterior door on the front left side of the vehicle.',
        'Provides access to the passenger compartment.',
        NULL
    ),
    (
        'BODY',
        'FRONT_BUMPER',
        'Front Bumper',
        'The visible exterior bumper component at the front of the vehicle.',
        'Covers and integrates with the front bumper system.',
        NULL
    ),
    (
        'BODY',
        'REAR_BUMPER',
        'Rear Bumper',
        'The visible exterior bumper component at the rear of the vehicle.',
        'Covers and integrates with the rear bumper system.',
        NULL
    ),
    (
        'GLASS',
        'WINDSHIELD',
        'Windshield',
        'The transparent glazing located at the front of the passenger compartment.',
        'Provides forward visibility while protecting occupants from external elements.',
        NULL
    )
) AS data (
    assembly_code,
    code,
    name,
    description,
    function_description,
    material
)
JOIN assemblies a
    ON a.code = data.assembly_code;

-- ------------------------------------------------------------
-- 4. Register Golf VII exterior mesh mappings
-- ------------------------------------------------------------

INSERT INTO viewer_meshes (
    component_id,
    viewer_model_id,
    mesh_name
)
SELECT
    c.id,
    'golf7-exterior',
    data.mesh_name
FROM (
    VALUES
        ('HOOD', 'bonnet_ok1'),
        ('FRONT_LEFT_DOOR', 'door_lf_ok1'),
        ('FRONT_BUMPER', 'bump_fro01_1'),
        ('REAR_BUMPER', 'bump_rea01_1'),
        ('WINDSHIELD', 'windscre01_1')
) AS data (
    component_code,
    mesh_name
)
JOIN components c
    ON c.code = data.component_code;

-- ------------------------------------------------------------
-- 5. Validate migration results
-- ------------------------------------------------------------

DO $$
DECLARE
    mapping_count INTEGER;
    component_count INTEGER;
    procedural_count INTEGER;
BEGIN

    SELECT COUNT(*)
    INTO mapping_count
    FROM viewer_meshes
    WHERE viewer_model_id = 'golf7-exterior';

    IF mapping_count <> 5 THEN
        RAISE EXCEPTION
            'Expected 5 Golf VII exterior mappings, found %',
            mapping_count;
    END IF;

    SELECT COUNT(*)
    INTO component_count
    FROM components
    WHERE code IN (
        'HOOD',
        'FRONT_LEFT_DOOR',
        'FRONT_BUMPER',
        'REAR_BUMPER',
        'WINDSHIELD'
    );

    IF component_count <> 5 THEN
        RAISE EXCEPTION
            'Expected 5 exterior components, found %',
            component_count;
    END IF;

    SELECT COUNT(*)
    INTO procedural_count
    FROM viewer_models
    WHERE code IN (
        'brake-assembly',
        'suspension-assembly'
    )
    AND model_type = 'PROCEDURAL'
    AND procedural_key = code;

    IF procedural_count <> 2 THEN
        RAISE EXCEPTION
            'Procedural model registry correction failed';
    END IF;

END $$;
