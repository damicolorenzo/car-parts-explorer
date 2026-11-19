
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "vehicle_variants")
public class VehicleVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generation_id", nullable = false)
    private VehicleGeneration generation;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "engine_code", length = 50)
    private String engineCode;

    @Column(name = "fuel_type", length = 40)
    private String fuelType;

    @Column(name = "displacement_cc")
    private Integer displacementCc;

    @Column(name = "power_kw")
    private Integer powerKw;

    @Column(length = 50)
    private String transmission;

    @Column(length = 50)
    private String drivetrain;

    protected VehicleVariant() {
    }

    public VehicleVariant(
            VehicleGeneration generation,
            String name,
            String engineCode,
            String fuelType,
            Integer displacementCc,
            Integer powerKw,
            String transmission,
            String drivetrain
    ) {
        this.generation = generation;
        this.name = name;
        this.engineCode = engineCode;
        this.fuelType = fuelType;
        this.displacementCc = displacementCc;
        this.powerKw = powerKw;
        this.transmission = transmission;
        this.drivetrain = drivetrain;
    }

    public UUID getId() {
        return id;
    }

    public VehicleGeneration getGeneration() {
        return generation;
    }

    public String getName() {
        return name;
    }

    public String getEngineCode() {
        return engineCode;
    }

    public String getFuelType() {
        return fuelType;
    }

    public Integer getDisplacementCc() {
        return displacementCc;
    }

    public Integer getPowerKw() {
        return powerKw;
    }

    public String getTransmission() {
        return transmission;
    }

    public String getDrivetrain() {
        return drivetrain;
    }
}
