
/* AssemblyResponse.java */
package com.carparts.backend.dto;

import java.util.UUID;

public record AssemblyResponse(
        UUID id,
        String code,
        String name,
        String description
) {}
