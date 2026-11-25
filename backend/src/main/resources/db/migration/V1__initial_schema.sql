
-- =============================================
-- Car Parts Explorer
-- V1: Initial database schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Vehicle manufacturers
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL UNIQUE,
    country VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Vehicle models
CREATE TABLE vehicle_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID NOT NULL
        REFERENCES manufacturers(id),
    name VARCHAR(120) NOT NULL,

    CONSTRAINT uq_vehicle_model
        UNIQUE (manufacturer_id, name)
);

-- 3. Vehicle generations
CREATE TABLE vehicle_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_model_id UUID NOT NULL
        REFERENCES vehicle_models(id),
    name VARCHAR(120) NOT NULL,
    production_start_year INTEGER,
    production_end_year INTEGER,

    CONSTRAINT uq_vehicle_generation
        UNIQUE (vehicle_model_id, name),

    CONSTRAINT chk_generation_years
        CHECK (
            production_start_year IS NULL
            OR production_end_year IS NULL
            OR production_end_year >= production_start_year
        )
);

-- 4. Vehicle variants
CREATE TABLE vehicle_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id UUID NOT NULL
        REFERENCES vehicle_generations(id),
    name VARCHAR(150) NOT NULL,
    engine_code VARCHAR(50),
    fuel_type VARCHAR(40),
    displacement_cc INTEGER,
    power_kw INTEGER,
    transmission VARCHAR(50),
    drivetrain VARCHAR(50),

    CONSTRAINT chk_engine_displacement
        CHECK (displacement_cc IS NULL OR displacement_cc > 0),

    CONSTRAINT chk_engine_power
        CHECK (power_kw IS NULL OR power_kw > 0)
);

-- 5. Assemblies
CREATE TABLE assemblies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- 6. Logical automotive components
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assembly_id UUID NOT NULL
        REFERENCES assemblies(id),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    function_description TEXT,
    material VARCHAR(150)
);

-- 7. 3D viewer mesh mappings
CREATE TABLE viewer_meshes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL
        REFERENCES components(id) ON DELETE CASCADE,
    viewer_model_id VARCHAR(120) NOT NULL,
    mesh_name VARCHAR(150) NOT NULL,

    CONSTRAINT uq_viewer_mesh
        UNIQUE (viewer_model_id, mesh_name)
);

-- 8. Replacement parts
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(120) NOT NULL,
    part_number VARCHAR(120) NOT NULL,
    oem_reference VARCHAR(120),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_part_brand_number
        UNIQUE (brand, part_number)
);

-- 9. Part-to-component relationship
CREATE TABLE part_components (
    part_id UUID NOT NULL
        REFERENCES parts(id) ON DELETE CASCADE,
    component_id UUID NOT NULL
        REFERENCES components(id) ON DELETE CASCADE,

    PRIMARY KEY (part_id, component_id)
);

-- 10. Part-to-vehicle compatibility
CREATE TABLE part_fitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL
        REFERENCES parts(id) ON DELETE CASCADE,
    vehicle_variant_id UUID NOT NULL
        REFERENCES vehicle_variants(id) ON DELETE CASCADE,
    position VARCHAR(80) NOT NULL DEFAULT 'UNSPECIFIED',
    notes TEXT,

    CONSTRAINT uq_part_fitment
        UNIQUE (part_id, vehicle_variant_id, position)
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_vehicle_models_manufacturer
    ON vehicle_models(manufacturer_id);

CREATE INDEX idx_generations_model
    ON vehicle_generations(vehicle_model_id);

CREATE INDEX idx_variants_generation
    ON vehicle_variants(generation_id);

CREATE INDEX idx_components_assembly
    ON components(assembly_id);

CREATE INDEX idx_viewer_meshes_component
    ON viewer_meshes(component_id);

CREATE INDEX idx_part_components_component
    ON part_components(component_id);

CREATE INDEX idx_fitments_variant
    ON part_fitments(vehicle_variant_id);
