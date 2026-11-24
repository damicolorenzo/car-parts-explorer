
package com.carparts.backend;

import com.carparts.backend.entity.Part;
import com.carparts.backend.entity.PartFitment;
import com.carparts.backend.entity.VehicleVariant;

import com.carparts.backend.repository.ComponentRepository;
import com.carparts.backend.repository.PartRepository;
import com.carparts.backend.repository.PartFitmentRepository;
import com.carparts.backend.repository.VehicleVariantRepository;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
class PartCatalogIntegrationTest {

    private static final String BASE_URL = "/api/v1";

    @Container
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:17")
                    .withDatabaseName("car_parts_test")
                    .withUsername("test")
                    .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(
            DynamicPropertyRegistry registry
    ) {
        registry.add(
                "spring.datasource.url",
                postgres::getJdbcUrl
        );

        registry.add(
                "spring.datasource.username",
                postgres::getUsername
        );

        registry.add(
                "spring.datasource.password",
                postgres::getPassword
        );
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private ComponentRepository componentRepository;

    @Autowired
    private PartFitmentRepository partFitmentRepository;

    @Autowired
    private VehicleVariantRepository vehicleVariantRepository;

    // --------------------------------------------------
    // Helper methods
    // --------------------------------------------------

    private Part getDemoBrakeDisc() {
        return partRepository
                .findByBrandAndPartNumber(
                        "DemoBrake",
                        "DEMO-BD-001"
                )
                .orElseThrow();
    }

    private UUID getComponentId(String code) {
        return componentRepository.findAll()
                .stream()
                .filter(component ->
                        component.getCode().equals(code))
                .findFirst()
                .orElseThrow()
                .getId();
    }

    private VehicleVariant getSeededVariant() {
        return vehicleVariantRepository.findAll()
                .stream()
                .filter(variant ->
                        variant.getName().contains("1.6 TDI"))
                .findFirst()
                .orElseThrow();
    }

    // --------------------------------------------------
    // Part retrieval
    // --------------------------------------------------

    @Test
    void shouldReturnAllParts() throws Exception {
        mockMvc.perform(get(BASE_URL + "/parts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));
    }

    @Test
    void shouldReturnPartById() throws Exception {
        Part part = getDemoBrakeDisc();

        mockMvc.perform(
                        get(BASE_URL + "/parts/{id}", part.getId())
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id")
                        .value(part.getId().toString()))
                .andExpect(jsonPath("$.brand")
                        .value("DemoBrake"))
                .andExpect(jsonPath("$.partNumber")
                        .value("DEMO-BD-001"))
                .andExpect(jsonPath("$.name")
                        .value("Front Brake Disc"));
    }

    @Test
    void shouldReturn404ForUnknownPart() throws Exception {
        mockMvc.perform(
                        get(BASE_URL + "/parts/{id}",
                                UUID.randomUUID())
                )
                .andExpect(status().isNotFound());
    }

    // --------------------------------------------------
    // Component filtering
    // --------------------------------------------------

    @Test
    void shouldReturnPartsForComponent() throws Exception {
        UUID componentId = getComponentId("BRAKE_DISC");

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].partNumber")
                        .value("DEMO-BD-001"))
                .andExpect(jsonPath("$[1].partNumber")
                        .value("DEMO-BD-002"));
    }

    @Test
    void shouldReturnEmptyListForComponentWithoutParts()
            throws Exception {

        UUID componentId = getComponentId("WHEEL_HUB");

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void shouldReturn404ForUnknownComponent()
            throws Exception {

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                UUID.randomUUID())
                )
                .andExpect(status().isNotFound());
    }

    // --------------------------------------------------
    // Vehicle compatibility
    // --------------------------------------------------

    @Test
    void shouldReturnPartsCompatibleWithVehicleVariant()
            throws Exception {

        UUID componentId = getComponentId("BRAKE_DISC");
        UUID variantId = getSeededVariant().getId();

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                                .param("variantId",
                                        variantId.toString())
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void shouldReturnEmptyListForIncompatibleVariant()
            throws Exception {

        VehicleVariant seededVariant = getSeededVariant();

        VehicleVariant incompatibleVariant =
                new VehicleVariant(
                        seededVariant.getGeneration(),
                        "Integration Test Variant",
                        "TEST_ENGINE",
                        "PETROL",
                        1400,
                        90,
                        "MANUAL",
                        "FWD"
                );

        incompatibleVariant =
                vehicleVariantRepository.saveAndFlush(
                        incompatibleVariant
                );

        UUID componentId = getComponentId("BRAKE_DISC");

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                                .param(
                                        "variantId",
                                        incompatibleVariant
                                                .getId()
                                                .toString()
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void shouldReturn404ForUnknownVehicleVariant()
            throws Exception {

        UUID componentId = getComponentId("BRAKE_DISC");

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                                .param(
                                        "variantId",
                                        UUID.randomUUID().toString()
                                )
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldNotReturnDuplicatePartsForMultipleFitments()
            throws Exception {

        Part part = getDemoBrakeDisc();
        VehicleVariant variant = getSeededVariant();

        PartFitment additionalFitment = new PartFitment(
                part,
                variant,
                "FRONT_LEFT",
                "Additional synthetic test fitment"
        );

        partFitmentRepository.saveAndFlush(additionalFitment);

        UUID componentId = getComponentId("BRAKE_DISC");

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                                .param(
                                        "variantId",
                                        variant.getId().toString()
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].partNumber")
                        .value("DEMO-BD-001"))
                .andExpect(jsonPath("$[1].partNumber")
                        .value("DEMO-BD-002"));
    }

    // --------------------------------------------------
    // Request validation
    // --------------------------------------------------

    @Test
    void shouldReturn400ForInvalidPartId()
            throws Exception {

        mockMvc.perform(
                        get(BASE_URL + "/parts/{id}",
                                "invalid-uuid")
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturn400ForInvalidVariantId()
            throws Exception {

        UUID componentId = getComponentId("BRAKE_DISC");

        mockMvc.perform(
                        get(BASE_URL + "/components/{id}/parts",
                                componentId)
                                .param("variantId", "invalid-uuid")
                )
                .andExpect(status().isBadRequest());
    }
}
