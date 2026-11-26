
package com.carparts.backend.entity;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "variant_viewer_models")
public class VariantViewerModel {

    @EmbeddedId
    private VariantViewerModelId id;

    @MapsId("vehicleVariantId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_variant_id", nullable = false)
    private VehicleVariant vehicleVariant;

    @MapsId("viewerModelId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "viewer_model_id", nullable = false)
    private ViewerModel viewerModel;

    protected VariantViewerModel() {
    }

    public VariantViewerModel(
            VehicleVariant vehicleVariant,
            ViewerModel viewerModel
    ) {
        this.vehicleVariant = Objects.requireNonNull(vehicleVariant);
        this.viewerModel = Objects.requireNonNull(viewerModel);

        this.id = new VariantViewerModelId(
            Objects.requireNonNull(vehicleVariant.getId()),
            Objects.requireNonNull(viewerModel.getId())
        );
    }

    public VariantViewerModelId getId() {
        return id;
    }

    public VehicleVariant getVehicleVariant() {
        return vehicleVariant;
    }

    public ViewerModel getViewerModel() {
        return viewerModel;
    }
}
