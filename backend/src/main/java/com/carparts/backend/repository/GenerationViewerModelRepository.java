
package com.carparts.backend.repository;

import com.carparts.backend.entity.GenerationViewerModel;
import com.carparts.backend.entity.GenerationViewerModelId;
import com.carparts.backend.entity.ViewerModel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GenerationViewerModelRepository
        extends JpaRepository<
            GenerationViewerModel,
            GenerationViewerModelId
        > {

    @Query("""
        SELECT association.viewerModel
        FROM GenerationViewerModel association
        WHERE association.generation.id = :generationId
          AND association.viewerModel.enabled = true
        ORDER BY association.viewerModel.name,
                 association.viewerModel.code
        """)
    List<ViewerModel> findEnabledModelsByGenerationId(
        @Param("generationId") UUID generationId
    );
}
