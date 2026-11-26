
package com.carparts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class VariantViewerModelId implements Serializable {

    @Column(name = "vehicle_variant_id")
    private UUID vehicleVariantId;

    @Column(name = "viewer_model_id")
    private UUID viewerModelId;

    protected VariantViewerModelId() {
    }

    public VariantViewerModelId(
            UUID vehicleVariantId,
            UUID viewerModelId
    ) {
        this.vehicleVariantId = vehicleVariantId;
        this.viewerModelId = viewerModelId;
    }

    public UUID getVehicleVariantId() {
        return vehicleVariantId;
    }

    public UUID getViewerModelId() {
        return viewerModelId;
    }

    @Override
    public boolean equals(Object object) {

        if (this == object) {
            return true;
        }

        if (!(object instanceof VariantViewerModelId other)) {
            return false;
        }

        return Objects.equals(
                vehicleVariantId, other.vehicleVariantId
            ) && Objects.equals(
                viewerModelId, other.viewerModelId
            );
    }

    @Override
    public int hashCode() {
        return Objects.hash(vehicleVariantId, viewerModelId);
    }
}
