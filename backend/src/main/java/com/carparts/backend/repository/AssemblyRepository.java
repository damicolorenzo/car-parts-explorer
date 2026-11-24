package com.carparts.backend.repository;

import com.carparts.backend.entity.Assembly;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AssemblyRepository
        extends JpaRepository<Assembly, UUID> {
}