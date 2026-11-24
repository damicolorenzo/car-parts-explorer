
package com.carparts.backend.dto;

import com.carparts.backend.entity.Part;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PartResponse(
        UUID id,
        String brand,
        String partNumber,
        String oemReference,
        String name,
        String description,
        OffsetDateTime createdAt
) {
    public static PartResponse from(Part part) {
        return new PartResponse(
                part.getId(),
                part.getBrand(),
                part.getPartNumber(),
                part.getOemReference(),
                part.getName(),
                part.getDescription(),
                part.getCreatedAt()
        );
    }
}
