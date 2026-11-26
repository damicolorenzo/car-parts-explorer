
package com.carparts.backend.entity;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "generation_viewer_models")
public class GenerationViewerModel {

    @EmbeddedId
    private GenerationViewerModelId id;

    @MapsId("generationId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generation_id", nullable = false)
    private VehicleGeneration generation;

    @MapsId("viewerModelId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "viewer_model_id", nullable = false)
    private ViewerModel viewerModel;

    protected GenerationViewerModel() {
    }

    public GenerationViewerModel(
            VehicleGeneration generation,
            ViewerModel viewerModel
    ) {
        this.generation = Objects.requireNonNull(generation);
        this.viewerModel = Objects.requireNonNull(viewerModel);

        this.id = new GenerationViewerModelId(
            Objects.requireNonNull(generation.getId()),
            Objects.requireNonNull(viewerModel.getId())
        );
    }

    public GenerationViewerModelId getId() {
        return id;
    }

    public VehicleGeneration getGeneration() {
        return generation;
    }

    public ViewerModel getViewerModel() {
        return viewerModel;
    }
}
