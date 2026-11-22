package com.carparts.backend.dto;

import java.util.UUID;

public record VehicleGenerationResponse(
        UUID id,
        UUID vehicleModelId,
        String name,
        Integer productionStartYear,
        Integer productionEndYear
) {}