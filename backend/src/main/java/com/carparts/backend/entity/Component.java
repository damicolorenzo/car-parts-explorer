
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "components")
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assembly_id", nullable = false)
    private Assembly assembly;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "function_description", columnDefinition = "text")
    private String functionDescription;

    @Column(length = 150)
    private String material;

    protected Component() {}

    public Component(
            Assembly assembly,
            String code,
            String name,
            String description,
            String functionDescription,
            String material
    ) {
        this.assembly = assembly;
        this.code = code;
        this.name = name;
        this.description = description;
        this.functionDescription = functionDescription;
        this.material = material;
    }

    public UUID getId() { return id; }
    public Assembly getAssembly() { return assembly; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getFunctionDescription() { return functionDescription; }
    public String getMaterial() { return material; }
}
