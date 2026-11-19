
/* VehicleModelRepository.java */
package com.carparts.backend.repository;

import com.carparts.backend.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface VehicleModelRepository
        extends JpaRepository<VehicleModel, UUID> {

    List<VehicleModel> findByManufacturerId(UUID manufacturerId);
}
