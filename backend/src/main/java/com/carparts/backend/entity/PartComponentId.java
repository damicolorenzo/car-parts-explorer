
package com.carparts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class PartComponentId implements Serializable {

    @Column(name = "part_id", nullable = false)
    private UUID partId;

    @Column(name = "component_id", nullable = false)
    private UUID componentId;

    protected PartComponentId() {
    }

    public PartComponentId(UUID partId, UUID componentId) {
        this.partId = partId;
        this.componentId = componentId;
    }

    public UUID getPartId() {
        return partId;
    }

    public UUID getComponentId() {
        return componentId;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;

        if (!(object instanceof PartComponentId other)) {
            return false;
        }

        return Objects.equals(partId, other.partId)
                && Objects.equals(componentId, other.componentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(partId, componentId);
    }
}
