
package com.carparts.backend.controller;

import com.carparts.backend.dto.*;
import com.carparts.backend.service.VehicleCatalogService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class VehicleCatalogController {

    private final VehicleCatalogService catalogService;

    public VehicleCatalogController(
            VehicleCatalogService catalogService
    ) {
        this.catalogService = catalogService;
    }

    @GetMapping("/manufacturers")
    public List<ManufacturerResponse> getManufacturers() {
        return catalogService.getManufacturers();
    }

    @GetMapping("/manufacturers/{id}/models")
    public List<VehicleModelResponse> getModels(
            @PathVariable UUID id
    ) {
        return catalogService.getModels(id);
    }

    @GetMapping("/models/{id}/generations")
    public List<VehicleGenerationResponse> getGenerations(
            @PathVariable UUID id
    ) {
        return catalogService.getGenerations(id);
    }

    @GetMapping("/generations/{id}/variants")
    public List<VehicleVariantResponse> getVariants(
            @PathVariable UUID id
    ) {
        return catalogService.getVariants(id);
    }
}
