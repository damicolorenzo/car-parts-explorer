package com.carparts.backend.dto;

import java.util.UUID;

public record VehicleModelResponse(
        UUID id,
        UUID manufacturerId,
        String name
) {}