
package com.carparts.backend.repository;

import com.carparts.backend.entity.ViewerModel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ViewerModelRepository
        extends JpaRepository<ViewerModel, UUID> {

    Optional<ViewerModel> findByCode(String code);

    Optional<ViewerModel> findByCodeAndEnabledTrue(String code);

    List<ViewerModel> findByEnabledTrueOrderByNameAscCodeAsc();

    List<ViewerModel>
        findByEnabledTrueAndGlobalFallbackTrueOrderByNameAscCodeAsc();
}
