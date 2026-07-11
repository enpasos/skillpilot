package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.api.CurriculumSourceEvidenceResponse;
import com.skillpilot.backend.curriculumpackage.PackageSourceEvidenceState;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PackageCurriculumSourceEvidenceControllerTest {

    private static final String GENERATION = "a".repeat(64);
    private static final String ETAG = "b".repeat(64);

    private final PackageSourceEvidenceState state = mock(PackageSourceEvidenceState.class);
    private final PackageCurriculumSourceEvidenceController controller =
            new PackageCurriculumSourceEvidenceController(state);

    @Test
    void mapsLookupStatesToImmutableGenerationBoundHttpResponses() {
        CurriculumSourceEvidenceResponse evidence = evidence();
        when(state.lookup("org.example.math", "1.2.3", "goal-1", GENERATION, "DE-BY"))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.FOUND, evidence, ETAG));
        when(state.lookup("org.example.math", "1.2.3", "goal-empty", GENERATION, null))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.NO_CONTENT, null, null));
        when(state.lookup("org.example.math", "1.2.3", "goal-unknown", GENERATION, null))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.NOT_FOUND, null, null));
        when(state.lookup("org.example.math", "1.2.3", "goal-1", null, null))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.INVALID, null, null));
        when(state.generationSha256()).thenReturn(GENERATION);

        var found = controller.getGoalEvidence(
                "org.example.math", "1.2.3", "goal-1", GENERATION, "DE-BY");
        assertThat(found.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(found.getBody()).isSameAs(evidence);
        assertThat(found.getHeaders().getETag()).isEqualTo('"' + ETAG + '"');
        assertThat(found.getHeaders().getCacheControl())
                .contains("max-age=31536000")
                .contains("immutable");

        var noContent = controller.getGoalEvidence(
                "org.example.math", "1.2.3", "goal-empty", GENERATION, null);
        assertThat(noContent.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(noContent.getBody()).isNull();
        assertThat(noContent.getHeaders().getETag()).isEqualTo('"' + GENERATION + '"');
        assertThat(noContent.getHeaders().getCacheControl()).contains("immutable");

        assertThat(controller.getGoalEvidence(
                        "org.example.math", "1.2.3", "goal-unknown", GENERATION, null)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(controller.getGoalEvidence(
                        "org.example.math", "1.2.3", "goal-1", null, null)
                .getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void springRoutesGenerationJurisdictionAndAllFourStatusCodes() throws Exception {
        when(state.lookup("org.example.math", "1.2.3", "goal-1", GENERATION, "DE-BY"))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.FOUND, evidence(), ETAG));
        when(state.lookup("org.example.math", "1.2.3", "goal-empty", GENERATION, null))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.NO_CONTENT, null, null));
        when(state.lookup("org.example.math", "1.2.3", "goal-missing", GENERATION, null))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.NOT_FOUND, null, null));
        when(state.lookup("org.example.math", "1.2.3", "goal-1", null, null))
                .thenReturn(new PackageSourceEvidenceState.LookupResult(
                        PackageSourceEvidenceState.LookupStatus.INVALID, null, null));
        when(state.generationSha256()).thenReturn(GENERATION);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get(
                                "/api/ui/curriculum-source-evidence/packages/"
                                        + "org.example.math/1.2.3/goals/goal-1")
                        .queryParam("generation", GENERATION)
                        .queryParam("jurisdiction", "DE-BY"))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", '"' + ETAG + '"'))
                .andExpect(header().string(
                        "Cache-Control", org.hamcrest.Matchers.containsString("immutable")))
                .andExpect(jsonPath("$.goalId").value("goal-1"))
                .andExpect(jsonPath("$.sourceGoal.sourceGoalId").value("source-goal-1"))
                .andExpect(jsonPath("$.sourceDocument.url")
                        .value("https://example.org/curriculum"));
        mockMvc.perform(get(
                                "/api/ui/curriculum-source-evidence/packages/"
                                        + "org.example.math/1.2.3/goals/goal-empty")
                        .queryParam("generation", GENERATION))
                .andExpect(status().isNoContent())
                .andExpect(header().string("ETag", '"' + GENERATION + '"'));
        mockMvc.perform(get(
                                "/api/ui/curriculum-source-evidence/packages/"
                                        + "org.example.math/1.2.3/goals/goal-missing")
                        .queryParam("generation", GENERATION))
                .andExpect(status().isNotFound());
        mockMvc.perform(get(
                        "/api/ui/curriculum-source-evidence/packages/"
                                + "org.example.math/1.2.3/goals/goal-1"))
                .andExpect(status().isBadRequest());

        verify(state).lookup("org.example.math", "1.2.3", "goal-1", GENERATION, "DE-BY");
    }

    private static CurriculumSourceEvidenceResponse evidence() {
        return new CurriculumSourceEvidenceResponse(
                GENERATION,
                "org.example.math",
                "1.2.3",
                "landscape-math",
                "goal-1",
                "DE-BY",
                "exact",
                new CurriculumSourceEvidenceResponse.SourceCollection(
                        "source-collection-1",
                        "source-landscape-1",
                        "Mathematik",
                        "SekI",
                        List.of("G9")),
                new CurriculumSourceEvidenceResponse.SourceGoal(
                        "source-goal-1",
                        "Source goal",
                        "Source goal description",
                        "Source wording",
                        "sha256:" + "c".repeat(64),
                        "Parent bullet",
                        new CurriculumSourceEvidenceResponse.SourceLocator(
                                "passage-1", "TOPIC-1", "Source span", "Section 1", 7, null),
                        new CurriculumSourceEvidenceResponse.SourceClassification(
                                "officialContentStandard",
                                null,
                                "SekI",
                                null,
                                null,
                                null,
                                "Algebra",
                                null),
                        null),
                new CurriculumSourceEvidenceResponse.SourceDocument(
                        "source-document-1",
                        "core",
                        "Official curriculum",
                        "binding-core",
                        "curriculum",
                        "https://example.org/curriculum",
                        null,
                        "G9"));
    }
}
