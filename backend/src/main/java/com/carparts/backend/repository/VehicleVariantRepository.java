
/* VehicleVariantRepository.java */
package com.carparts.backend.repository;

import com.carparts.backend.entity.VehicleVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface VehicleVariantRepository
        extends JpaRepository<VehicleVariant, UUID> {

    List<VehicleVariant> findByGenerationId(UUID generationId);
}
