
package com.carparts.backend.repository;

import com.carparts.backend.entity.VariantViewerModel;
import com.carparts.backend.entity.VariantViewerModelId;
import com.carparts.backend.entity.ViewerModel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface VariantViewerModelRepository
        extends JpaRepository<
            VariantViewerModel,
            VariantViewerModelId
        > {

    @Query("""
        SELECT association.viewerModel
        FROM VariantViewerModel association
        WHERE association.vehicleVariant.id = :variantId
          AND association.viewerModel.enabled = true
        ORDER BY association.viewerModel.name,
                 association.viewerModel.code
        """)
    List<ViewerModel> findEnabledModelsByVariantId(
        @Param("variantId") UUID variantId
    );
}
