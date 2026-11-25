
package com.carparts.backend.repository;

import com.carparts.backend.entity.Part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartRepository extends JpaRepository<Part, UUID> {

    Optional<Part> findByBrandAndPartNumber(
            String brand,
            String partNumber
    );

    List<Part> findAllByOrderByBrandAscPartNumberAsc();

    @Query("""
        SELECT DISTINCT pc.part
        FROM PartComponent pc
        WHERE pc.component.id = :componentId
        ORDER BY pc.part.brand, pc.part.partNumber
        """)
    List<Part> findByComponent(
            @Param("componentId") UUID componentId
    );

    @Query("""
        SELECT DISTINCT pc.part
        FROM PartComponent pc
        WHERE pc.component.id = :componentId
          AND EXISTS (
              SELECT pf.id
              FROM PartFitment pf
              WHERE pf.part = pc.part
                AND pf.vehicleVariant.id = :variantId
          )
        ORDER BY pc.part.brand, pc.part.partNumber
        """)
    List<Part> findByComponentAndVehicleVariant(
            @Param("componentId") UUID componentId,
            @Param("variantId") UUID variantId
    );
}
