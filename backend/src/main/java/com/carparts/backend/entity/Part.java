
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "parts")
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(name = "part_number", nullable = false, length = 120)
    private String partNumber;

    @Column(name = "oem_reference", length = 120)
    private String oemReference;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Part() {
    }

    public Part(
            String brand,
            String partNumber,
            String oemReference,
            String name,
            String description
    ) {
        this.brand = brand;
        this.partNumber = partNumber;
        this.oemReference = oemReference;
        this.name = name;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public String getBrand() {
        return brand;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public String getOemReference() {
        return oemReference;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
