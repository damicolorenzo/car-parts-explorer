
package com.carparts.backend.service;

import com.carparts.backend.entity.VehicleVariant;
import com.carparts.backend.entity.ViewerModel;
import com.carparts.backend.entity.ViewerModelCategory;

import com.carparts.backend.exception.ResourceNotFoundException;

import com.carparts.backend.repository.VehicleVariantRepository;
import com.carparts.backend.repository.ViewerModelRepository;
import com.carparts.backend.repository.GenerationViewerModelRepository;
import com.carparts.backend.repository.VariantViewerModelRepository;

import com.carparts.backend.service.model.ResolvedViewerModel;
import com.carparts.backend.service.model.ViewerModelAssociationLevel;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ViewerModelService {

    private final ViewerModelRepository viewerModelRepository;

    private final GenerationViewerModelRepository
        generationViewerModelRepository;

    private final VariantViewerModelRepository
        variantViewerModelRepository;

    private final VehicleVariantRepository vehicleVariantRepository;

    public ViewerModelService(
            ViewerModelRepository viewerModelRepository,
            GenerationViewerModelRepository
                generationViewerModelRepository,
            VariantViewerModelRepository
                variantViewerModelRepository,
            VehicleVariantRepository vehicleVariantRepository
    ) {
        this.viewerModelRepository = viewerModelRepository;

        this.generationViewerModelRepository =
            generationViewerModelRepository;

        this.variantViewerModelRepository =
            variantViewerModelRepository;

        this.vehicleVariantRepository =
            vehicleVariantRepository;
    }

    public List<ViewerModel> getViewerModels() {

        return viewerModelRepository
            .findByEnabledTrueOrderByNameAscCodeAsc();
    }

    public ViewerModel getViewerModel(String code) {

        return viewerModelRepository
            .findByCodeAndEnabledTrue(code)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "Viewer model not found: " + code
                )
            );
    }

    public List<ResolvedViewerModel> resolveForVariant(
            UUID variantId
    ) {
        VehicleVariant variant = vehicleVariantRepository
            .findById(variantId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "Vehicle variant not found: " + variantId
                )
            );

        UUID generationId = variant.getGeneration().getId();

        Map<String, ResolvedViewerModel> resolvedModels =
            new LinkedHashMap<>();

        // Priority 1: variant-specific associations.

        List<ViewerModel> variantModels =
            variantViewerModelRepository
                .findEnabledModelsByVariantId(variantId);

        addModels(
            resolvedModels,
            variantModels,
            ViewerModelAssociationLevel.VARIANT
        );

        // Priority 2: generation-level associations.

        List<ViewerModel> generationModels =
            generationViewerModelRepository
                .findEnabledModelsByGenerationId(generationId);

        addModels(
            resolvedModels,
            generationModels,
            ViewerModelAssociationLevel.GENERATION
        );

        // Capture categories covered by explicit associations.

        Set<ViewerModelCategory> explicitlyCoveredCategories =
            EnumSet.noneOf(ViewerModelCategory.class);

        for (ResolvedViewerModel resolved : resolvedModels.values()) {

            explicitlyCoveredCategories.add(
                resolved.model().getCategory()
            );
        }

        // Priority 3: global generic fallbacks.

        List<ViewerModel> fallbackModels =
            viewerModelRepository
                .findByEnabledTrueAndGlobalFallbackTrueOrderByNameAscCodeAsc();

        for (ViewerModel model : fallbackModels) {

            if (explicitlyCoveredCategories.contains(
                    model.getCategory()
            )) {
                continue;
            }

            resolvedModels.putIfAbsent(
                model.getCode(),
                new ResolvedViewerModel(
                    model,
                    ViewerModelAssociationLevel.GLOBAL_FALLBACK
                )
            );
        }

        return List.copyOf(resolvedModels.values());
    }

    private void addModels(
            Map<String, ResolvedViewerModel> resolvedModels,
            List<ViewerModel> models,
            ViewerModelAssociationLevel associationLevel
    ) {
        for (ViewerModel model : models) {

            resolvedModels.putIfAbsent(
                model.getCode(),
                new ResolvedViewerModel(
                    model,
                    associationLevel
                )
            );
        }
    }
}
