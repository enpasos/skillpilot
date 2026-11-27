package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.LearnerProjectionTestFixture.LEARNER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.completion.LearningPlanCompletionProjection;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

class VoluntaryPlanProjectionLookupTest {
    private static final String LANDSCAPE = "physics";
    private static final String ATOM = "regular";
    private static final String SECTION = "composition:physics-gk:structure:topic";
    private static final LocalDate DAY = LocalDate.of(2026, 11, 27);

    private CompositionViewService views;
    private LearnerService learners;
    private LandscapeService catalog;

    @BeforeEach
    void loadARepositoryWithoutOffers(@TempDir Path directory) throws IOException {
        Path view = directory.resolve("DE/Gymnasium/composition-views/physik/physics-gk.view.json");
        Files.createDirectories(view.getParent());
        Files.writeString(view, """
                {"viewId":"physics-gk","landscapeId":"physics",
                 "scope":{"schoolForm":"Gymnasium","stage":"SekII","courseProfile":"GK"},
                 "rootNodes":[{"kind":"structure","id":"topic","label":"Topic","children":[
                   {"kind":"goalEntry","goalId":"regular"}]}]}
                """);
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        views = spy(new CompositionViewService(properties, new ObjectMapper()));
        views.loadRepositoryViews();
        var landscape = new SkillLandscape();
        landscape.setLandscapeId(LANDSCAPE);
        landscape.setGoals(List.of());
        learners = spy(LearnerProjectionTestFixture.service(landscape, List.of(landscape), views));
        catalog = (LandscapeService) ReflectionTestUtils.getField(learners, "landscapeService");
    }

    @Test
    void rootedCaptureChecksTheLegacyPolicyWithoutLoadingALearnerProjectionWhenViewsHaveNoOffers() {
        var materials = mock(UnitLearningMaterialService.class);
        ReflectionTestUtils.setField(learners, "unitLearningMaterialService", materials);
        var captured = List.of(ATOM);
        assertThat(learners.implicitlyCapturedPlanOffers(learners.getLearner(LEARNER), List.of(SECTION), captured)).isEmpty();

        var policyThenOfferCheck = inOrder(materials, views);
        policyThenOfferCheck.verify(materials).hasIndividualOfferIn(captured);
        policyThenOfferCheck.verify(views).hasVoluntaryOffers();
        verifyNoInteractions(catalog);
    }

    @Test
    void fulfillmentOfCompatibleRootlessWorkAddsNoProjectionWhenViewsHaveNoOffers() {
        var block = new LearnerLearningPlanApi.Block("one", "learning", null, "Regular work", DAY, DAY,
                null, List.of(ATOM), null, true);
        var plan = new LearnerLearningPlan();
        plan.setCurriculumId(LANDSCAPE);
        plan.setLandscapeId(LANDSCAPE);
        doReturn(true).when(learners).isLearningPlanCompatible(LEARNER, LANDSCAPE, LANDSCAPE, List.of(block));

        var fulfillment = LearnerLearningPlanService.planFulfillment(learners, learners.getLearner(LEARNER),
                List.of(plan), Map.of(), ignored -> List.of(block), id -> id, new LearningPlanCompletionProjection());
        assertThat(fulfillment.waived(LANDSCAPE)).isEmpty();
        verify(catalog, never()).getClosure(LANDSCAPE);
    }
}
