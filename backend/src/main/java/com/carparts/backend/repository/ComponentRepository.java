package com.carparts.backend.repository;

import com.carparts.backend.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ComponentRepository
        extends JpaRepository<Component, UUID> {

    List<Component> findByAssemblyId(UUID assemblyId);
}