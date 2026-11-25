
package com.carparts.backend.service;

import com.carparts.backend.dto.*;
import com.carparts.backend.entity.*;
import com.carparts.backend.exception.ResourceNotFoundException;
import com.carparts.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ComponentCatalogService {

    private final AssemblyRepository assemblyRepository;
    private final ComponentRepository componentRepository;
    private final ViewerMeshRepository viewerMeshRepository;

    public ComponentCatalogService(
            AssemblyRepository assemblyRepository,
            ComponentRepository componentRepository,
            ViewerMeshRepository viewerMeshRepository
    ) {
        this.assemblyRepository = assemblyRepository;
        this.componentRepository = componentRepository;
        this.viewerMeshRepository = viewerMeshRepository;
    }

    public List<AssemblyResponse> getAssemblies() {
        return assemblyRepository.findAll().stream()
                .map(this::toAssemblyResponse)
                .toList();
    }

    public List<ComponentResponse> getComponents(UUID assemblyId) {
        if (!assemblyRepository.existsById(assemblyId)) {
            throw new ResourceNotFoundException(
                    "Assembly not found: " + assemblyId
            );
        }

        return componentRepository.findByAssemblyId(assemblyId)
                .stream()
                .map(this::toComponentResponse)
                .toList();
    }

    public ComponentResponse getComponent(UUID componentId) {
        Component component = componentRepository
                .findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Component not found: " + componentId
                ));

        return toComponentResponse(component);
    }

    public ViewerMeshResponse resolveMesh(
            String viewerModelId,
            String meshName
    ) {
        ViewerMesh mesh = viewerMeshRepository
                .findByViewerModelIdAndMeshName(
                        viewerModelId, meshName
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Viewer mesh not found: "
                                + viewerModelId + "/" + meshName
                ));

        return new ViewerMeshResponse(
                mesh.getViewerModelId(),
                mesh.getMeshName(),
                toComponentResponse(mesh.getComponent())
        );
    }

    private AssemblyResponse toAssemblyResponse(Assembly assembly) {
        return new AssemblyResponse(
                assembly.getId(),
                assembly.getCode(),
                assembly.getName(),
                assembly.getDescription()
        );
    }

    private ComponentResponse toComponentResponse(Component component) {
        return new ComponentResponse(
                component.getId(),
                component.getAssembly().getId(),
                component.getCode(),
                component.getName(),
                component.getDescription(),
                component.getFunctionDescription(),
                component.getMaterial()
        );
    }
}
