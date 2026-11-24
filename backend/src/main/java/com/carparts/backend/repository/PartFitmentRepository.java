
package com.carparts.backend.repository;

import com.carparts.backend.entity.PartFitment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PartFitmentRepository
        extends JpaRepository<PartFitment, UUID> {

    List<PartFitment> findByVehicleVariantId(UUID vehicleVariantId);

    List<PartFitment> findByPartId(UUID partId);

    boolean existsByPartIdAndVehicleVariantId(
            UUID partId,
            UUID vehicleVariantId
    );
}
