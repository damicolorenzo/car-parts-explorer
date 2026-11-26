
package com.carparts.backend.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "viewer_models")
public class ViewerModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 120)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "model_type", nullable = false, length = 30)
    private ViewerModelType modelType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ViewerModelCategory category;

    @Column(name = "asset_path", length = 500)
    private String assetPath;

    @Column(name = "procedural_key", length = 120)
    private String proceduralKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "accuracy_level", nullable = false, length = 30)
    private ViewerModelAccuracy accuracyLevel;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(length = 255)
    private String license;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "global_fallback", nullable = false)
    private boolean globalFallback = false;

    @Column(
        name = "created_at",
        insertable = false,
        updatable = false
    )
    private OffsetDateTime createdAt;

    protected ViewerModel() {
    }

    public ViewerModel(
            String code,
            String name,
            String description,
            ViewerModelType modelType,
            ViewerModelCategory category,
            String assetPath,
            String proceduralKey,
            ViewerModelAccuracy accuracyLevel,
            String sourceUrl,
            String license,
            boolean enabled,
            boolean globalFallback
    ) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.modelType = modelType;
        this.category = category;
        this.assetPath = assetPath;
        this.proceduralKey = proceduralKey;
        this.accuracyLevel = accuracyLevel;
        this.sourceUrl = sourceUrl;
        this.license = license;
        this.enabled = enabled;
        this.globalFallback = globalFallback;

        validateConfiguration();
    }

    @PrePersist
    @PreUpdate
    private void validateConfiguration() {

        Objects.requireNonNull(modelType, "Model type is required");
        Objects.requireNonNull(category, "Category is required");
        Objects.requireNonNull(accuracyLevel, "Accuracy is required");

        if (code == null ||
                !code.matches("^[a-z0-9]+(-[a-z0-9]+)*$")) {
            throw new IllegalArgumentException(
                "Invalid viewer model code"
            );
        }

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                "Viewer model name is required"
            );
        }

        if (modelType == ViewerModelType.GLTF) {

            if (assetPath == null ||
                    assetPath.isBlank() ||
                    proceduralKey != null) {

                throw new IllegalArgumentException(
                    "GLTF models require an asset path "
                    + "and cannot define a procedural key"
                );
            }
        }

        if (modelType == ViewerModelType.PROCEDURAL) {

            if (proceduralKey == null ||
                    proceduralKey.isBlank() ||
                    assetPath != null) {

                throw new IllegalArgumentException(
                    "Procedural models require a procedural key "
                    + "and cannot define an asset path"
                );
            }
        }

        if (globalFallback &&
                accuracyLevel != ViewerModelAccuracy.GENERIC) {

            throw new IllegalArgumentException(
                "Only generic models can be global fallbacks"
            );
        }
    }

    public UUID getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public ViewerModelType getModelType() {
        return modelType;
    }

    public ViewerModelCategory getCategory() {
        return category;
    }

    public String getAssetPath() {
        return assetPath;
    }

    public String getProceduralKey() {
        return proceduralKey;
    }

    public ViewerModelAccuracy getAccuracyLevel() {
        return accuracyLevel;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getLicense() {
        return license;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isGlobalFallback() {
        return globalFallback;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
