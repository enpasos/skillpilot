package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.controller.PackageCurriculumResourceController;
import com.skillpilot.backend.controller.PackageCurriculumSourceEvidenceController;
import com.skillpilot.backend.landscape.RepositoryCurriculumConfiguration;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.ui.CompositionViewUiController;
import com.skillpilot.backend.ui.CurriculumCatalogUiController;
import java.nio.file.Path;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PackageCurriculumRuntimeApiConformanceTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(ObjectMapper.class, () -> objectMapper)
            .withUserConfiguration(
                    CurriculumSourceConfiguration.class,
                    CurriculumPackageConfiguration.class,
                    RepositoryCurriculumConfiguration.class);

    @Test
    void catalogLinksResolveDefaultOfferingDeckAndEmbeddedImageWithoutRepositoryFallback() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        contextRunner
                .withPropertyValues(
                        "skillpilot.curriculum.source=package",
                        "skillpilot.curriculum.packages.store-directory=" + store.root(),
                        "skillpilot.curriculum.packages.active-lock=locks/active.json")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
                                    new CurriculumCatalogUiController(
                                            context.getBean(CurriculumCatalogService.class)),
                                    new CompositionViewUiController(
                                            context.getBean(CompositionViewService.class)),
                                    new PackageCurriculumResourceController(
                                            context.getBean(PackageCurriculumResourceState.class)),
                                    new PackageCurriculumSourceEvidenceController(
                                            context.getBean(PackageSourceEvidenceState.class)))
                            .build();

                    MvcResult catalogResult = mockMvc.perform(get("/api/ui/curriculum-catalog"))
                            .andExpect(status().isOk())
                            .andExpect(content().contentTypeCompatibleWith("application/json"))
                            .andExpect(jsonPath("$.catalogApiVersion").value("1.2"))
                            .andReturn();
                    JsonNode catalog = objectMapper.readTree(
                            catalogResult.getResponse().getContentAsByteArray());
                    String generation = catalog.path("generationSha256").asText();

                    String rootLandscapeId = catalog.path("rootLandscapeIds").get(0).asText();
                    JsonNode rootLandscape = findByText(
                            catalog.path("landscapes"), "landscapeId", rootLandscapeId);
                    String defaultOfferingId = rootLandscape.path("defaultOfferingId").asText();
                    JsonNode offering = findByText(
                            catalog.path("offerings"), "offeringId", defaultOfferingId);
                    assertThat(offering.path("landscapeId").asText()).isEqualTo(rootLandscapeId);

                    mockMvc.perform(get("/api/ui/composition-views/offerings/{offeringId}", defaultOfferingId))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.viewId").value("view-alpha"));
                    mockMvc.perform(get("/api/ui/composition-views/offerings/{offeringId}", "unknown"))
                            .andExpect(status().isNotFound());

                    JsonNode deck = findByText(catalog.path("decks"), "landscapeId", rootLandscapeId);
                    assertThat(deck.path("locale").asText()).isEqualTo("de-DE");
                    mockMvc.perform(get(deck.path("href").asText()))
                            .andExpect(status().isOk())
                            .andExpect(content().contentTypeCompatibleWith("application/json"))
                            .andExpect(jsonPath("$.deckId").value("deck-alpha"))
                            .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("immutable")));

                    JsonNode embeddedImage = StreamSupport.stream(
                                    catalog.path("resources").spliterator(), false)
                            .filter(resource -> resource.path("landscapeId").asText().equals(rootLandscapeId))
                            .filter(resource -> resource.path("delivery").asText().equals("embedded"))
                            .filter(resource -> resource.path("resourceKind").asText().equals("goal-visualization"))
                            .findFirst()
                            .orElseThrow();
                    mockMvc.perform(get(embeddedImage.path("href").asText()))
                            .andExpect(status().isOk())
                            .andExpect(content().contentType("image/png"))
                            .andExpect(content().bytes(new byte[] {1, 2, 3, 4}))
                            .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("immutable")));

                    mockMvc.perform(get("/data/cards/fixture.de.json"))
                            .andExpect(status().isNotFound());

                    JsonNode sourceEvidence = catalog.path("sourceEvidence").get(0);
                    assertThat(sourceEvidence.path("packageId").asText()).isEqualTo("org.example.alpha");
                    assertThat(sourceEvidence.path("packageVersion").asText()).isEqualTo("1.0.0");
                    assertThat(sourceEvidence.path("targetLandscapeId").asText())
                            .isEqualTo(rootLandscapeId);
                    assertThat(sourceEvidence.path("sourceCollectionCount").asInt()).isOne();
                    assertThat(sourceEvidence.path("sourceDocumentCount").asInt()).isOne();
                    assertThat(sourceEvidence.path("sourceGoalCount").asInt()).isOne();
                    assertThat(sourceEvidence.path("mappingEdgeCount").asInt()).isOne();
                    assertThat(sourceEvidence.path("goals").get(0).path("goalId").asText())
                            .isEqualTo("goal-alpha");
                    assertThat(sourceEvidence.path("goals").get(0).path("jurisdictions").get(0).asText())
                            .isEqualTo("DE-BY");
                    String sourceHref = sourceEvidence.path("href").asText() + "/goal-alpha";
                    mockMvc.perform(get(sourceHref)
                                    .queryParam("generation", generation)
                                    .queryParam("jurisdiction", "DE-BY"))
                            .andExpect(status().isOk())
                            .andExpect(header().string(
                                    "Cache-Control", org.hamcrest.Matchers.containsString("immutable")))
                            .andExpect(header().string(
                                    "ETag", org.hamcrest.Matchers.matchesPattern("\"[a-f0-9]{64}\"")))
                            .andExpect(jsonPath("$.generationSha256").value(generation))
                            .andExpect(jsonPath("$.goalId").value("goal-alpha"))
                            .andExpect(jsonPath("$.matchType").value("exact"))
                            .andExpect(jsonPath("$.sourceGoal.sourceGoalId").value("source-goal-alpha"))
                            .andExpect(jsonPath("$.sourceDocument.sourceDocumentId")
                                    .value("source-collection-alpha:core"));
                    mockMvc.perform(get(sourceHref)).andExpect(status().isBadRequest());
                    mockMvc.perform(get(sourceHref)
                                    .queryParam("generation", generation)
                                    .queryParam("jurisdiction", "DE-HE"))
                            .andExpect(status().isNoContent());
                    mockMvc.perform(get(sourceEvidence.path("href").asText() + "/unmapped-goal-alpha")
                                    .queryParam("generation", generation))
                            .andExpect(status().isNoContent());
                    mockMvc.perform(get(sourceEvidence.path("href").asText() + "/unknown-goal")
                                    .queryParam("generation", generation))
                            .andExpect(status().isNotFound());
                    mockMvc.perform(get(sourceHref)
                                    .queryParam("generation", generation)
                                    .queryParam("jurisdiction", "de-by"))
                            .andExpect(status().isBadRequest());
                });
    }

    private static JsonNode findByText(JsonNode array, String field, String value) {
        return StreamSupport.stream(array.spliterator(), false)
                .filter(entry -> entry.path(field).asText().equals(value))
                .findFirst()
                .orElseThrow();
    }
}
