
package com.carparts.backend.service;

import com.carparts.backend.dto.PartResponse;
import com.carparts.backend.entity.Part;

import com.carparts.backend.repository.ComponentRepository;
import com.carparts.backend.repository.PartRepository;
import com.carparts.backend.repository.VehicleVariantRepository;

import com.carparts.backend.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PartCatalogService {

    private final PartRepository partRepository;
    private final ComponentRepository componentRepository;
    private final VehicleVariantRepository vehicleVariantRepository;

    public PartCatalogService(
            PartRepository partRepository,
            ComponentRepository componentRepository,
            VehicleVariantRepository vehicleVariantRepository
    ) {
        this.partRepository = partRepository;
        this.componentRepository = componentRepository;
        this.vehicleVariantRepository = vehicleVariantRepository;
    }

    public List<PartResponse> getParts() {
        return partRepository
                .findAllByOrderByBrandAscPartNumberAsc()
                .stream()
                .map(PartResponse::from)
                .toList();
    }

    public PartResponse getPart(UUID id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Part not found: " + id
                        )
                );

        return PartResponse.from(part);
    }

    public List<PartResponse> getPartsForComponent(
            UUID componentId,
            UUID variantId
    ) {
        if (!componentRepository.existsById(componentId)) {
            throw new ResourceNotFoundException(
                    "Component not found: " + componentId
            );
        }

        if (variantId != null) {
            if (!vehicleVariantRepository.existsById(variantId)) {
                throw new ResourceNotFoundException(
                        "Vehicle variant not found: " + variantId
                );
            }

            return partRepository
                    .findByComponentAndVehicleVariant(
                            componentId,
                            variantId
                    )
                    .stream()
                    .map(PartResponse::from)
                    .toList();
        }

        return partRepository
                .findByComponent(componentId)
                .stream()
                .map(PartResponse::from)
                .toList();
    }
}
