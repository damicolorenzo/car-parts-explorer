package com.carparts.backend.service.model;

import com.carparts.backend.entity.ViewerModel;

public record ResolvedViewerModel(
    ViewerModel model,
    ViewerModelAssociationLevel associationLevel
) {
}