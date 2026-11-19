
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "vehicle_generations")
public class VehicleGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_model_id", nullable = false)
    private VehicleModel vehicleModel;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "production_start_year")
    private Integer productionStartYear;

    @Column(name = "production_end_year")
    private Integer productionEndYear;

    protected VehicleGeneration() {
    }

    public VehicleGeneration(
            VehicleModel vehicleModel,
            String name,
            Integer productionStartYear,
            Integer productionEndYear
    ) {
        this.vehicleModel = vehicleModel;
        this.name = name;
        this.productionStartYear = productionStartYear;
        this.productionEndYear = productionEndYear;
    }

    public UUID getId() {
        return id;
    }

    public VehicleModel getVehicleModel() {
        return vehicleModel;
    }

    public String getName() {
        return name;
    }

    public Integer getProductionStartYear() {
        return productionStartYear;
    }

    public Integer getProductionEndYear() {
        return productionEndYear;
    }
}
