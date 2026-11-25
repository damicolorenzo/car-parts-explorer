
-- ============================================================
-- V5: Viewer model registry
-- ============================================================

-- ------------------------------------------------------------
-- 1. Viewer models
-- ------------------------------------------------------------

CREATE TABLE viewer_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,

    model_type VARCHAR(30) NOT NULL,
    category VARCHAR(40) NOT NULL,

    asset_path VARCHAR(500),
    procedural_key VARCHAR(120),

    accuracy_level VARCHAR(30) NOT NULL,

    source_url VARCHAR(1000),
    license VARCHAR(255),

    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    global_fallback BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_viewer_model_type
        CHECK (
            model_type IN (
                'GLTF',
                'PROCEDURAL'
            )
        ),

    CONSTRAINT chk_viewer_model_category
        CHECK (
            category IN (
                'EXTERIOR',
                'INTERIOR',
                'ENGINE',
                'TRANSMISSION',
                'BRAKES',
                'SUSPENSION',
                'STEERING',
                'ELECTRICAL',
                'OTHER'
            )
        ),

    CONSTRAINT chk_viewer_model_accuracy
        CHECK (
            accuracy_level IN (
                'GENERIC',
                'REPRESENTATIVE',
                'VERIFIED'
            )
        ),

    CONSTRAINT chk_viewer_model_configuration
        CHECK (
            (
                model_type = 'GLTF'
                AND asset_path IS NOT NULL
                AND BTRIM(asset_path) <> ''
                AND procedural_key IS NULL
            )
            OR
            (
                model_type = 'PROCEDURAL'
                AND procedural_key IS NOT NULL
                AND BTRIM(procedural_key) <> ''
                AND asset_path IS NULL
            )
        ),

    CONSTRAINT chk_viewer_model_fallback
        CHECK (
            global_fallback = FALSE
            OR accuracy_level = 'GENERIC'
        ),

    CONSTRAINT chk_viewer_model_code
        CHECK (
            code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        )
);

-- ------------------------------------------------------------
-- 2. Generation-level associations
-- ------------------------------------------------------------

CREATE TABLE generation_viewer_models (
    generation_id UUID NOT NULL
        REFERENCES vehicle_generations(id)
        ON DELETE CASCADE,

    viewer_model_id UUID NOT NULL
        REFERENCES viewer_models(id)
        ON DELETE CASCADE,

    PRIMARY KEY (
        generation_id,
        viewer_model_id
    )
);

-- ------------------------------------------------------------
-- 3. Variant-level associations
-- ------------------------------------------------------------

CREATE TABLE variant_viewer_models (
    vehicle_variant_id UUID NOT NULL
        REFERENCES vehicle_variants(id)
        ON DELETE CASCADE,

    viewer_model_id UUID NOT NULL
        REFERENCES viewer_models(id)
        ON DELETE CASCADE,

    PRIMARY KEY (
        vehicle_variant_id,
        viewer_model_id
    )
);

-- ------------------------------------------------------------
-- 4. Indexes
-- ------------------------------------------------------------

CREATE INDEX idx_generation_viewer_models_model
    ON generation_viewer_models(viewer_model_id);

CREATE INDEX idx_variant_viewer_models_model
    ON variant_viewer_models(viewer_model_id);

CREATE INDEX idx_viewer_models_enabled_category
    ON viewer_models(category)
    WHERE enabled = TRUE;

CREATE INDEX idx_viewer_models_global_fallback
    ON viewer_models(category)
    WHERE enabled = TRUE
      AND global_fallback = TRUE;

-- ------------------------------------------------------------
-- 5. Register existing procedural models
--
-- Required before introducing the foreign key on viewer_meshes.
-- Complete catalog metadata and vehicle associations will be
-- populated in a subsequent migration.
-- ------------------------------------------------------------

INSERT INTO viewer_models (
    code,
    name,
    description,
    model_type,
    category,
    procedural_key,
    accuracy_level,
    enabled,
    global_fallback
)
VALUES
(
    'brake-assembly',
    'Brake System',
    'Generic educational disc brake assembly.',
    'PROCEDURAL',
    'BRAKES',
    'brakes',
    'GENERIC',
    TRUE,
    FALSE
),
(
    'suspension-assembly',
    'Front Suspension',
    'Generic educational front suspension assembly.',
    'PROCEDURAL',
    'SUSPENSION',
    'suspension',
    'GENERIC',
    TRUE,
    FALSE
);

-- ------------------------------------------------------------
-- 6. Preserve and enforce existing mesh associations
-- ------------------------------------------------------------

ALTER TABLE viewer_meshes
    ADD CONSTRAINT fk_viewer_mesh_model_code
    FOREIGN KEY (viewer_model_id)
    REFERENCES viewer_models(code)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;
