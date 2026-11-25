
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "part_fitments")
public class PartFitment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_variant_id", nullable = false)
    private VehicleVariant vehicleVariant;

    @Column(nullable = false, length = 80)
    private String position = "UNSPECIFIED";

    @Column(columnDefinition = "text")
    private String notes;

    protected PartFitment() {
    }

    public PartFitment(
            Part part,
            VehicleVariant vehicleVariant,
            String position,
            String notes
    ) {
        this.part = part;
        this.vehicleVariant = vehicleVariant;
        this.position = position == null
                ? "UNSPECIFIED"
                : position;
        this.notes = notes;
    }

    public UUID getId() {
        return id;
    }

    public Part getPart() {
        return part;
    }

    public VehicleVariant getVehicleVariant() {
        return vehicleVariant;
    }

    public String getPosition() {
        return position;
    }

    public String getNotes() {
        return notes;
    }
}
