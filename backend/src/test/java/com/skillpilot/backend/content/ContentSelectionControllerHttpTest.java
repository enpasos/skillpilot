package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

class ContentSelectionControllerHttpTest {
    private static final String LEARNER_A = "synthetic-learner-a";
    private static final String LEARNER_B = "synthetic-learner-b";
    private static final String VALID_REQUEST =
            "{\"expectedRevision\":0,\"selectedPackageIds\":[\"package-one\"]}";

    private ContentSelectionService selections;
    private ContentCatalog catalog;
    private ContentMaterialResolver materials;
    private LearnerService learners;
    private LearnerLifecycleService lifecycle;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        selections = mock(ContentSelectionService.class);
        catalog = mock(ContentCatalog.class);
        materials = mock(ContentMaterialResolver.class);
        learners = mock(LearnerService.class);
        lifecycle = mock(LearnerLifecycleService.class);
        doAnswer(invocation -> ((Supplier<?>) invocation.getArgument(1)).get())
                .when(lifecycle).withActivity(anyString(), org.mockito.ArgumentMatchers.<Supplier<Object>>any());
        mvc = controller(true);
    }

    private MockMvc controller(boolean enabled) {
        return MockMvcBuilders.standaloneSetup(new ContentSelectionController(
                        new ContentAvailability(enabled),
                        selections, catalog, materials, learners, lifecycle))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(new ObjectMapper()))
                .build();
    }

    @Test
    void cockpitSelectionCanBeSavedWithoutAnotherKeyAndResponsesAreNotCacheable() throws Exception {
        when(selections.update(LEARNER_A, 0, List.of("package-one")))
                .thenReturn(new ContentSelectionService.Selection(1, Set.of("package-one")));
        mvc.perform(put("/api/ui/learners/{id}/content-selection", LEARNER_A)
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_REQUEST))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revision").value(1))
                .andExpect(jsonPath("$.selectedPackageIds[0]").value("package-one"))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
        verify(learners).assertWritableLearningSession(LEARNER_A);
        verify(lifecycle).withActivity(eq(LEARNER_A), org.mockito.ArgumentMatchers.<Supplier<Object>>any());
        verify(selections).update(LEARNER_A, 0, List.of("package-one"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{\"expectedRevision\":0,\"selectedPackageIds\":[],\"feedback\":\"chat text\"}",
            "{\"expectedRevision\":0,\"selectedPackageIds\":[{\"id\":\"package-one\"}]}",
            "{\"expectedRevision\":0,\"selectedPackageIds\":[\"Invalid Package\"]}",
            "{\"expectedRevision\":-1,\"selectedPackageIds\":[]}",
            "{\"expectedRevision\":1.5,\"selectedPackageIds\":[]}",
            "{\"expectedRevision\":9223372036854775808,\"selectedPackageIds\":[]}",
            "{\"expectedRevision\":0,\"unknown\":[]}",
            "[]", "null"
    })
    void unsupportedInputIsRejectedBeforeAnyPersistenceOrActivity(String request) throws Exception {
        mvc.perform(put("/api/ui/learners/{id}/content-selection", LEARNER_A)
                        .contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(selections, catalog, materials, learners, lifecycle);
    }

    @Test
    void disabledMaterialsReturn404WithoutReadingLearnerState() throws Exception {
        MockMvc disabled = controller(false);
        disabled.perform(get("/api/ui/learners/{id}/content-selection", LEARNER_A))
                .andExpect(status().isNotFound())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
        disabled.perform(get("/api/ui/learners/{id}/content-materials", LEARNER_A)
                        .queryParam("goalId", "goal-a"))
                .andExpect(status().isNotFound());
        disabled.perform(put("/api/ui/learners/{id}/content-selection", LEARNER_A)
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_REQUEST))
                .andExpect(status().isNotFound());
        verifyNoInteractions(selections, catalog, materials, learners, lifecycle);
    }

    @Test
    void selectionReadIsNoStoreAndDoesNotExposeLearnerIdentity() throws Exception {
        when(selections.selection(LEARNER_A)).thenReturn(new ContentSelectionService.Selection(2, Set.of("package-one")));
        when(catalog.packages("en")).thenReturn(List.of());
        var result = mvc.perform(get("/api/ui/learners/{id}/content-selection", LEARNER_A).queryParam("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.revision").value(2))
                .andExpect(jsonPath("$.selectedPackageIds[0]").value("package-one"))
                .andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain(LEARNER_A, LEARNER_B);
        verify(learners).assertActiveLearnerRouteAccess(LEARNER_A);
        verifyNoInteractions(lifecycle, materials);
    }

    @Test
    void onlyGoalsInTheFilteredLearnerClosureCanResolveMaterials() throws Exception {
        Learner learner = new Learner();
        learner.setSelectedCurriculum("curriculum");
        LearningGoal visible = new LearningGoal();
        visible.setId("visible-goal");
        SkillLandscape filtered = new SkillLandscape();
        filtered.setGoals(List.of(visible));
        when(learners.getLearner(LEARNER_A)).thenReturn(learner);
        when(learners.getLearnerLandscapeClosure(LEARNER_A, "curriculum", "de")).thenReturn(List.of(filtered));

        mvc.perform(get("/api/ui/learners/{id}/content-materials", LEARNER_A).queryParam("goalId", "hidden-goal"))
                .andExpect(status().isOk()).andExpect(content().json("[]"))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
        verifyNoInteractions(materials);

        var links = List.of(new ContentMaterialResolver.ResolvedMaterial(
                "Motion", "https://provider.example/motion", "Provider", "article", "de", List.of(),
                "public-link", "link-only"));
        when(materials.resolve(LEARNER_A, "visible-goal", "de")).thenReturn(links);
        var result = mvc.perform(get("/api/ui/learners/{id}/content-materials", LEARNER_A)
                        .queryParam("goalId", "visible-goal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].url").value("https://provider.example/motion"))
                .andExpect(jsonPath("$[0].aiUsage").value("link-only"))
                .andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain(LEARNER_A, LEARNER_B);
        verify(materials).resolve(LEARNER_A, "visible-goal", "de");
        verifyNoMoreInteractions(materials);
        verifyNoInteractions(selections, lifecycle);
    }

    @Test
    void deselectionUsesTheAddressedLearnerWithOrdinaryLifecycleAndWritableGuards() throws Exception {
        when(selections.update(LEARNER_B, 1, List.of()))
                .thenReturn(new ContentSelectionService.Selection(2, Set.of()));
        when(catalog.packages("de")).thenReturn(List.of());
        var result = mvc.perform(put("/api/ui/learners/{id}/content-selection", LEARNER_B)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":1,\"selectedPackageIds\":[]}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.revision").value(2))
                .andExpect(jsonPath("$.selectedPackageIds").isEmpty())
                .andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain(LEARNER_A, LEARNER_B);
        verify(selections).update(LEARNER_B, 1, List.of());
        verify(learners).assertWritableLearningSession(LEARNER_B);
        verify(lifecycle).withActivity(eq(LEARNER_B), org.mockito.ArgumentMatchers.<Supplier<Object>>any());
        verifyNoMoreInteractions(selections, learners, lifecycle);
        verifyNoInteractions(materials);
    }

    @Test
    void readOnlyLearnerCannotChangeMaterials() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Read-only session"))
                .when(learners).assertWritableLearningSession(LEARNER_A);
        mvc.perform(put("/api/ui/learners/{id}/content-selection", LEARNER_A)
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_REQUEST))
                .andExpect(status().isConflict())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
        verifyNoInteractions(selections, catalog, materials);
    }

    @Test
    void inaccessibleLearnerCannotReadSelectionOrMaterials() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found"))
                .when(learners).assertActiveLearnerRouteAccess(LEARNER_A);
        mvc.perform(get("/api/ui/learners/{id}/content-selection", LEARNER_A))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/ui/learners/{id}/content-materials", LEARNER_A).queryParam("goalId", "goal-a"))
                .andExpect(status().isNotFound());
        verifyNoInteractions(selections, catalog, materials, lifecycle);
    }
}
