package com.carparts.backend.dto;

import java.util.UUID;

public record VehicleVariantResponse(
        UUID id,
        UUID generationId,
        String name,
        String engineCode,
        String fuelType,
        Integer displacementCc,
        Integer powerKw,
        String transmission,
        String drivetrain
) {}