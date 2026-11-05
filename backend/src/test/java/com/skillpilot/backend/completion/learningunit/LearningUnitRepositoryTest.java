package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

/** Real authored first unit; source, archive and runtime all use the same committed revision. */
class LearningUnitRepositoryTest {
    private static final String A = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String Q = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void actualFirstUnitAdmitsAndRecognizesOnlyItsOwnCompetence() throws Exception {
        var service = service();
        assertThat(service.catalog().quarantined()).isEmpty();
        assertThat(service.catalog().definitions()).anyMatch(definition -> "math-dot-product-projection".equals(definition.contractId()));
        assertThat(service.evaluate("real-unit", Set.of()).recognizedGoalIds()).doesNotContain(A);
        var passed = service.evaluate("real-unit", Set.of(Q));
        assertThat(passed.recognizedGoalIds()).contains(A);
        var first = service.catalog().definitions().stream().filter(definition -> "math-dot-product-projection".equals(definition.contractId())).findFirst().orElseThrow();
        var unit = passed.units().get(first.ref());
        assertThat(unit.complete()).isTrue();
        assertThat(unit.targetCount()).isEqualTo(2);
        assertThat(unit.explicitTargetCount()).isEqualTo(1);
        assertThat(unit.recognizedTargetCount()).isEqualTo(1);
        assertThat(service.readModel(passed, Set.of(A, Q)).units()).isEmpty();
        assertThat(service.readModel(passed, Set.of(A, Q)).offerBinding().status()).isEqualTo("unresolved");
        assertThat(service.readModel(passed, Set.of("another-curriculum-target")).recognizedGoalIds()).contains(A);
        assertThat(service.readModel(passed, Set.of("another-curriculum-target")).units()).isEmpty();
    }

    @Test
    void newGymnasiumBoundaryDoesNotCaptureAnUnrelatedMathematicsProduct() throws Exception {
        var service = service();
        assertThat(service.governedGoalIds()).contains(A, Q);
        assertThat(service.governedGoalIds()).doesNotContain("unrelated-university-mathematics");
        var first = service.catalog().definitions().stream().filter(definition -> "math-dot-product-projection".equals(definition.contractId())).findFirst().orElseThrow();
        assertThat(service.catalog().compiled().targetGoalIds(first.ref())).containsExactlyInAnyOrder(A, Q);
    }

    @Test
    void removingAllCurrentUnitRolesCannotRestoreLegacyCreditOutsideHistoricalOwn() throws Exception {
        var service = service(true);
        assertThat(service.catalog().quarantined()).isEmpty();
        assertThat(service.catalog().currentReadinessFailures()).isNotEmpty();
        assertThat(service.governedGoalIds()).contains("new-unowned-math-atom", A, Q)
                .doesNotContain("unrelated-university-mathematics");
        assertThat(service.evaluate("learner", Set.of(Q)).recognizedGoalIds()).contains(A)
                .doesNotContain("new-unowned-math-atom");
        var binding = service.catalog().currentOfferBinding();
        assertThat(binding).isNotNull();
        var offerDocument = mapper.readTree(Files.readAllBytes(Path.of("../curricula").resolve(binding.path())));
        com.fasterxml.jackson.databind.JsonNode selectedRow = java.util.stream.StreamSupport.stream(offerDocument.path("offers").spliterator(), false)
                .filter(row -> !row.path("rootContractRefs").isEmpty()).findFirst().orElseThrow();
        var scope = mapper.treeToValue(selectedRow.path("scope"), LearningUnitOfferBindings.ScopeKey.class);
        assertThat(service.readModel(service.evaluate("learner", Set.of(Q)),
                new LearningUnitOfferBindings.ResolvedOfferContext(scope, Set.of(A, Q), Set.of(), Set.of()), Set.of())
                .offerBinding().status()).isEqualTo("unavailable");
        var learner = new com.skillpilot.backend.domain.Learner(); learner.setSkillpilotId("learner");
        var learners = mock(com.skillpilot.backend.repository.LearnerRepository.class);
        when(learners.findById("learner")).thenReturn(java.util.Optional.of(learner));
        var results = mock(com.skillpilot.backend.repository.MasteryRepository.class);
        when(results.findByLearner_SkillpilotId("learner")).thenReturn(List.of(new com.skillpilot.backend.domain.Mastery(learner, Q, 1.0)));
        var runtime = new com.skillpilot.backend.service.LearnerService(learners,
                mock(com.skillpilot.backend.repository.LearnerClientStateRepository.class), results,
                mock(com.skillpilot.backend.repository.PlannedGoalRepository.class), mock(LandscapeService.class),
                mock(com.skillpilot.backend.landscape.GoalMappingService.class), mock(com.skillpilot.backend.service.DeckResourceService.class),
                mapper, mock(org.springframework.context.ApplicationEventPublisher.class));
        org.springframework.test.util.ReflectionTestUtils.setField(runtime, "learningUnitApplicationService", service);
        assertThat(runtime.reconcileLearningUnitPlanRecognition("learner", Map.of(Q, 1.0), Set.of("new-unowned-math-atom")))
                .contains(A).doesNotContain("new-unowned-math-atom");
        verify(results, never()).save(any());
    }

    private LearningUnitApplicationService service() throws Exception { return service(false); }

    private LearningUnitApplicationService service(boolean removeRoles) throws Exception {
        Path root = Path.of("..").toAbsolutePath().normalize();
        if (!Files.isDirectory(root.resolve("curricula"))) root = Path.of("").toAbsolutePath().normalize();
        SkillLandscape math = mapper.readValue(Files.readAllBytes(root.resolve("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json")), SkillLandscape.class);
        if (removeRoles) {
            math.getProgramUnits().forEach(unit -> unit.setLearningUnit(null));
            var newlyUnowned = new com.skillpilot.backend.landscape.LearningGoal();
            newlyUnowned.setId("new-unowned-math-atom"); newlyUnowned.setType("atomic");
            newlyUnowned.setSemanticKind("curricularAtomic"); newlyUnowned.setContains(List.of());
            var currentGoals = new java.util.ArrayList<>(math.getGoals()); currentGoals.add(newlyUnowned); math.setGoals(currentGoals);
        }
        SkillLandscape unrelated = new SkillLandscape();
        unrelated.setLandscapeId("university");
        unrelated.setSubject("Mathematik");
        var goal = new com.skillpilot.backend.landscape.LearningGoal();
        goal.setId("unrelated-university-mathematics");
        goal.setType("atomic");
        unrelated.setGoals(List.of(goal));
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(List.of(math, unrelated));
        when(landscapes.getById(math.getLandscapeId())).thenReturn(math);
        when(landscapes.getClosure(math.getLandscapeId())).thenReturn(List.of(math));
        var properties = new LandscapeProperties();
        properties.setDirectory(root.resolve("curricula").toString());
        @SuppressWarnings("unchecked")
        ObjectProvider<com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshotProvider> snapshots = mock(ObjectProvider.class);
        return new LearningUnitApplicationService(properties, mapper, landscapes,
                new CompletionCanonicalGraphResolver(landscapes, mapper), "repository", snapshots);
    }
}
