
/* VehicleGenerationRepository.java */
package com.carparts.backend.repository;

import com.carparts.backend.entity.VehicleGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface VehicleGenerationRepository
        extends JpaRepository<VehicleGeneration, UUID> {

    List<VehicleGeneration> findByVehicleModelId(UUID vehicleModelId);
}
