
package com.carparts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class GenerationViewerModelId implements Serializable {

    @Column(name = "generation_id")
    private UUID generationId;

    @Column(name = "viewer_model_id")
    private UUID viewerModelId;

    protected GenerationViewerModelId() {
    }

    public GenerationViewerModelId(
            UUID generationId,
            UUID viewerModelId
    ) {
        this.generationId = generationId;
        this.viewerModelId = viewerModelId;
    }

    public UUID getGenerationId() {
        return generationId;
    }

    public UUID getViewerModelId() {
        return viewerModelId;
    }

    @Override
    public boolean equals(Object object) {

        if (this == object) {
            return true;
        }

        if (!(object instanceof GenerationViewerModelId other)) {
            return false;
        }

        return Objects.equals(
                generationId, other.generationId
            ) && Objects.equals(
                viewerModelId, other.viewerModelId
            );
    }

    @Override
    public int hashCode() {
        return Objects.hash(generationId, viewerModelId);
    }
}
