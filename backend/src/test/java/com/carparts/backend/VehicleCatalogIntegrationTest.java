
package com.carparts.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class VehicleCatalogIntegrationTest {

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
    void shouldReturnManufacturers() throws Exception {
        mockMvc.perform(get("/api/v1/manufacturers"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$[0].name").value("Volkswagen"))
                .andExpect(jsonPath("$[0].country").value("Germany"));
    }

    @Test
    void shouldReturnModelsForManufacturer() throws Exception {
        // Seeded manufacturer ID is discovered via the API
        String response = mockMvc.perform(
                        get("/api/v1/manufacturers"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String manufacturerId = com.jayway.jsonpath.JsonPath.read(response, "$[0].id");

        mockMvc.perform(get(
                        "/api/v1/manufacturers/{id}/models",
                        manufacturerId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Golf"));
    }

    @Test
    void shouldReturnNotFoundForUnknownManufacturer() throws Exception {
        mockMvc.perform(get(
                        "/api/v1/manufacturers/{id}/models",
                        UUID.randomUUID()
                ))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundForUnknownModel() throws Exception {
        mockMvc.perform(get(
                        "/api/v1/models/{id}/generations",
                        UUID.randomUUID()
                ))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundForUnknownGeneration() throws Exception {
        mockMvc.perform(get(
                        "/api/v1/generations/{id}/variants",
                        UUID.randomUUID()
                ))
                .andExpect(status().isNotFound());
    }


    @Test
    void shouldNavigateCompleteVehicleHierarchy() throws Exception {

        String manufacturersJson = mockMvc.perform(
                        get("/api/v1/manufacturers"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String manufacturerId =
                com.jayway.jsonpath.JsonPath.read(
                        manufacturersJson, "$[0].id"
                );

        String modelsJson = mockMvc.perform(
                        get("/api/v1/manufacturers/{id}/models",
                                manufacturerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Golf"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String modelId =
                com.jayway.jsonpath.JsonPath.read(
                        modelsJson, "$[0].id"
                );

        String generationsJson = mockMvc.perform(
                        get("/api/v1/models/{id}/generations",
                                modelId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Golf VII"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String generationId =
                com.jayway.jsonpath.JsonPath.read(
                        generationsJson, "$[0].id"
                );

        mockMvc.perform(
                        get("/api/v1/generations/{id}/variants",
                                generationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name")
                        .value("Golf VII 1.6 TDI"))
                .andExpect(jsonPath("$[0].fuelType")
                        .value("DIESEL"));
    }

}
