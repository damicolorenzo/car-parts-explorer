
/* ManufacturerRepository.java */
package com.carparts.backend.repository;

import com.carparts.backend.entity.Manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ManufacturerRepository
        extends JpaRepository<Manufacturer, UUID> {
}
