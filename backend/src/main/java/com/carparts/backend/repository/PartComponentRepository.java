
package com.carparts.backend.repository;

import com.carparts.backend.entity.PartComponent;
import com.carparts.backend.entity.PartComponentId;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PartComponentRepository
        extends JpaRepository<PartComponent, PartComponentId> {

    List<PartComponent> findByComponentId(UUID componentId);
}
