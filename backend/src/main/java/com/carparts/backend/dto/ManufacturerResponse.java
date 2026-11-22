package com.carparts.backend.dto;

import java.util.UUID;

public record ManufacturerResponse(
        UUID id,
        String name,
        String country
) {}