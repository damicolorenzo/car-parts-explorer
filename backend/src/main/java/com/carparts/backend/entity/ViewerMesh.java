
package com.carparts.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "viewer_meshes")
public class ViewerMesh {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "component_id", nullable = false)
    private Component component;

    @Column(name = "viewer_model_id", nullable = false, length = 120)
    private String viewerModelId;

    @Column(name = "mesh_name", nullable = false, length = 150)
    private String meshName;

    protected ViewerMesh() {}

    public ViewerMesh(
            Component component,
            String viewerModelId,
            String meshName
    ) {
        this.component = component;
        this.viewerModelId = viewerModelId;
        this.meshName = meshName;
    }

    public UUID getId() { return id; }
    public Component getComponent() { return component; }
    public String getViewerModelId() { return viewerModelId; }
    public String getMeshName() { return meshName; }
}
