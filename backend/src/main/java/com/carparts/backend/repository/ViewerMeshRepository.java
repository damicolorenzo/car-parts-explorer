package com.carparts.backend.repository;

import com.carparts.backend.entity.ViewerMesh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ViewerMeshRepository
        extends JpaRepository<ViewerMesh, UUID> {

    Optional<ViewerMesh> findByViewerModelIdAndMeshName(
            String viewerModelId,
            String meshName
    );
}