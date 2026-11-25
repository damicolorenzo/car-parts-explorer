
package com.carparts.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ComponentCatalogIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:17")
                    .withDatabaseName("car_parts_test")
                    .withUsername("test")
                    .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnTwoAssemblies() throws Exception {
        mockMvc.perform(get("/api/v1/assemblies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath(
                        "$[*].code",
                        containsInAnyOrder(
                                "BRAKE_SYSTEM",
                                "FRONT_SUSPENSION"
                        )
                ));
    }

    @Test
    void shouldResolveBrakeDisc() throws Exception {
        mockMvc.perform(
                get("/api/v1/viewer-meshes/resolve")
                        .param("viewerModelId", "brake-assembly")
                        .param("meshName", "brake-disc")
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$.component.code",
                        is("BRAKE_DISC")
                ))
                .andExpect(jsonPath(
                        "$.component.name",
                        is("Brake Disc")
                ));
    }

    @Test
    void shouldResolveCoilSpring() throws Exception {
        mockMvc.perform(
                get("/api/v1/viewer-meshes/resolve")
                        .param("viewerModelId", "suspension-assembly")
                        .param("meshName", "coil-spring")
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$.component.code",
                        is("COIL_SPRING")
                ));
    }

    @Test
    void shouldReturnNotFoundForUnknownMesh() throws Exception {
        mockMvc.perform(
                get("/api/v1/viewer-meshes/resolve")
                        .param("viewerModelId", "brake-assembly")
                        .param("meshName", "unknown-mesh")
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundForUnknownComponent() throws Exception {
        mockMvc.perform(
                get("/api/v1/components/"
                        + "00000000-0000-0000-0000-000000000001")
        )
                .andExpect(status().isNotFound());
    }
}
