
/* ViewerMeshResponse.java */
package com.carparts.backend.dto;

public record ViewerMeshResponse(
        String viewerModelId,
        String meshName,
        ComponentResponse component
) {}
