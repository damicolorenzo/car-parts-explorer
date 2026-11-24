
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "part_components")
public class PartComponent {

    @EmbeddedId
    private PartComponentId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("partId")
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("componentId")
    @JoinColumn(name = "component_id", nullable = false)
    private Component component;

    protected PartComponent() {
    }

    public PartComponent(Part part, Component component) {
        this.part = part;
        this.component = component;
        this.id = new PartComponentId(
                part.getId(),
                component.getId()
        );
    }

    public PartComponentId getId() {
        return id;
    }

    public Part getPart() {
        return part;
    }

    public Component getComponent() {
        return component;
    }
}
