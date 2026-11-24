
/* ComponentResponse.java */
package com.carparts.backend.dto;

import java.util.UUID;

public record ComponentResponse(
        UUID id,
        UUID assemblyId,
        String code,
        String name,
        String description,
        String functionDescription,
        String material
) {}
