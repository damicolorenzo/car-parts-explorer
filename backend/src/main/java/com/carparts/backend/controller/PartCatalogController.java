
package com.carparts.backend.controller;

import com.carparts.backend.dto.PartResponse;
import com.carparts.backend.service.PartCatalogService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PartCatalogController {

    private final PartCatalogService partCatalogService;

    public PartCatalogController(
            PartCatalogService partCatalogService
    ) {
        this.partCatalogService = partCatalogService;
    }

    @GetMapping("/parts")
    public List<PartResponse> getParts() {
        return partCatalogService.getParts();
    }

    @GetMapping("/parts/{id}")
    public PartResponse getPart(
            @PathVariable UUID id
    ) {
        return partCatalogService.getPart(id);
    }

    @GetMapping("/components/{componentId}/parts")
    public List<PartResponse> getPartsForComponent(
            @PathVariable UUID componentId,
            @RequestParam(required = false) UUID variantId
    ) {
        return partCatalogService.getPartsForComponent(
                componentId,
                variantId
        );
    }
}
