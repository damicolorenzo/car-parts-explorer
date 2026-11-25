
package com.carparts.backend.service;

import com.carparts.backend.dto.*;
import com.carparts.backend.entity.*;
import com.carparts.backend.exception.ResourceNotFoundException;
import com.carparts.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class VehicleCatalogService {

    private final ManufacturerRepository manufacturerRepository;
    private final VehicleModelRepository modelRepository;
    private final VehicleGenerationRepository generationRepository;
    private final VehicleVariantRepository variantRepository;

    public VehicleCatalogService(
            ManufacturerRepository manufacturerRepository,
            VehicleModelRepository modelRepository,
            VehicleGenerationRepository generationRepository,
            VehicleVariantRepository variantRepository
    ) {
        this.manufacturerRepository = manufacturerRepository;
        this.modelRepository = modelRepository;
        this.generationRepository = generationRepository;
        this.variantRepository = variantRepository;
    }

    public List<ManufacturerResponse> getManufacturers() {
        return manufacturerRepository.findAll().stream()
                .map(m -> new ManufacturerResponse(
                        m.getId(),
                        m.getName(),
                        m.getCountry()
                ))
                .toList();
    }

    public List<VehicleModelResponse> getModels(UUID manufacturerId) {
        if (!manufacturerRepository.existsById(manufacturerId)) {
            throw new ResourceNotFoundException(
                    "Manufacturer not found: " + manufacturerId
            );
        }

        return modelRepository.findByManufacturerId(manufacturerId)
                .stream()
                .map(m -> new VehicleModelResponse(
                        m.getId(),
                        manufacturerId,
                        m.getName()
                ))
                .toList();
    }

    public List<VehicleGenerationResponse> getGenerations(
            UUID modelId
    ) {
        if (!modelRepository.existsById(modelId)) {
            throw new ResourceNotFoundException(
                    "Vehicle model not found: " + modelId
            );
        }

        return generationRepository.findByVehicleModelId(modelId)
                .stream()
                .map(g -> new VehicleGenerationResponse(
                        g.getId(),
                        modelId,
                        g.getName(),
                        g.getProductionStartYear(),
                        g.getProductionEndYear()
                ))
                .toList();
    }

    public List<VehicleVariantResponse> getVariants(
            UUID generationId
    ) {
        if (!generationRepository.existsById(generationId)) {
            throw new ResourceNotFoundException(
                    "Vehicle generation not found: " + generationId
            );
        }

        return variantRepository.findByGenerationId(generationId)
                .stream()
                .map(v -> new VehicleVariantResponse(
                        v.getId(),
                        generationId,
                        v.getName(),
                        v.getEngineCode(),
                        v.getFuelType(),
                        v.getDisplacementCc(),
                        v.getPowerKw(),
                        v.getTransmission(),
                        v.getDrivetrain()
                ))
                .toList();
    }
}
