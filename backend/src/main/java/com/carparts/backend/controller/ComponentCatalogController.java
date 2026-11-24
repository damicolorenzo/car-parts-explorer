
package com.carparts.backend.controller;

import com.carparts.backend.dto.*;
import com.carparts.backend.service.ComponentCatalogService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ComponentCatalogController {

    private final ComponentCatalogService catalogService;

    public ComponentCatalogController(
            ComponentCatalogService catalogService
    ) {
        this.catalogService = catalogService;
    }

    @GetMapping("/assemblies")
    public List<AssemblyResponse> getAssemblies() {
        return catalogService.getAssemblies();
    }

    @GetMapping("/assemblies/{id}/components")
    public List<ComponentResponse> getComponents(
            @PathVariable UUID id
    ) {
        return catalogService.getComponents(id);
    }

    @GetMapping("/components/{id}")
    public ComponentResponse getComponent(
            @PathVariable UUID id
    ) {
        return catalogService.getComponent(id);
    }

    @GetMapping("/viewer-meshes/resolve")
    public ViewerMeshResponse resolveMesh(
            @RequestParam String viewerModelId,
            @RequestParam String meshName
    ) {
        return catalogService.resolveMesh(viewerModelId, meshName);
    }
}
