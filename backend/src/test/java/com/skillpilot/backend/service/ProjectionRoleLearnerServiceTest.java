package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ReleaseMetadata;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

class ProjectionRoleLearnerServiceTest {

    private static final String LANDSCAPE_ID = "projection-roles";
    private static final String LEARNER_ID = "projection-role-learner";
    private static final String TARGET_ID = "sek2-target";
    private static final String PREREQUISITE_ID = "sek1-bridge";
    private static final String TRANSITIVE_PREREQUISITE_ID = "sek1-deep";
    private static final String EXTERNAL_PREREQUISITE_ID = "external-sek1-bridge";
    private static final String EXTERNAL_PREREQUISITE_ROOT_ID = "external-sek1-root";
    private static final String EXTERNAL_PREREQUISITE_CHILD_ID = "external-sek1-child";
    private static final String ROOT_CLUSTER_ID = "projection-root";
    private static final String NESTED_CLUSTER_ID = "projection-nested";
    private static final String OUTSIDE_TARGET_ID = "outside-target";
    private static final String PHYSICS_ORIENTATION_ID = "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
    private static final String OBSERVATION_ID = "5355fee0-0477-5570-a234-561477bf77ba";
    private static final String SI_UNITS_ID = "3ed3279e-c524-5230-a277-dda89493df6d";
    private static final String MODELS_ID = "e5bc2227-d900-585f-8ac0-9d3f1cb40e27";
    private static final String SOURCE_CRITIQUE_ID = "d2e6f87d-795b-5631-a7cc-0bfb5dc5142e";
    private static final String SOLAR_SYSTEM_CLASSIFICATION_ID = "982df2f3-e040-5f4b-b668-0fe05d994b29";
    private static final String OPEN_COSMOLOGICAL_QUESTIONS_ID = "6ae54ff9-dc3b-563b-b2ee-09a0f0d00162";
    private static final List<String> PHYSICS_METHOD_IDS =
            List.of(OBSERVATION_ID, SI_UNITS_ID, MODELS_ID, SOURCE_CRITIQUE_ID);
    private static final List<String> MASTERED_PHYSICS_CONTEXT_IDS = List.of(
            PHYSICS_ORIENTATION_ID,
            "af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93", // Aufbau des Sonnensystems
            "c52d55c3-b687-586c-b0f9-8ffcd1069424", // Urknallmodell
            "1b060e79-dc2d-5e4e-abb5-42eca39f9cc7", // dessen Voraussetzung: kosmische Strukturen
            "2b700858-bc2e-5ddf-a791-b14d44160480"); // dessen Voraussetzung: Beobachtungsmethoden
    private static final String GLOBAL_ASSESSMENT_ROOT_ID = "global-assessment-root";
    private static final String GLOBAL_ASSESSMENT_EXAM_ID = "global-assessment-exam";
    private static final String SYNTHETIC_STRUCTURE_ID =
            "composition:projection-role-test:structure:sek2";
    private static final String PERSONAL_CURRICULUM = """
            {
              "projection-roles": {
                "selected": true,
                "filterId": "LK"
              }
            }
            """;

    @Test
    void missingRoleDefaultsToTargetAndPrerequisiteOnlyIsNotTargetOrTransitivelyInferred() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .containsExactly(TARGET_ID);

        ProjectionSets projection = projectionSets(fixture.service());
        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).containsExactly(PREREQUISITE_ID);
        assertThat(projection.prerequisiteOnlyGoalIds())
                .doesNotContain(TRANSITIVE_PREREQUISITE_ID);
    }

    @Test
    void externalPrerequisiteOnlyGoalEntryHydratesExactlyOneStructuralGoal() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID, "prerequisiteOnly")));
        fixture.learner().setStrictMode(true);
        LearningGoal externalPrerequisite = atomicGoal(
                EXTERNAL_PREREQUISITE_ID,
                List.of());
        LearningGoal externalChild = atomicGoal(EXTERNAL_PREREQUISITE_CHILD_ID, List.of());
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(externalPrerequisite);
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_CHILD_ID))
                .thenReturn(externalChild);
        fixture.landscape().getGoals().stream()
                .filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow()
                .setRequires(List.of(EXTERNAL_PREREQUISITE_ID));
        Mastery externalMastery = new Mastery(
                fixture.learner(),
                EXTERNAL_PREREQUISITE_ID,
                1.0);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

        ProjectionSets projection = projectionSets(fixture.service());

        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds())
                .containsExactly(EXTERNAL_PREREQUISITE_ID);
        assertThat(projection.structuralGoalIds())
                .contains(EXTERNAL_PREREQUISITE_ID)
                .doesNotContain(EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(projection.visibleGoalIds())
                .doesNotContain(
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id).doesNotContain(TARGET_ID);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(externalMastery));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id).containsExactly(TARGET_ID);
    }

    @Test
    void externalPrerequisiteOnlyCanonicalSubtreeHydratesAllStructuralDescendants() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                canonicalSubtree(EXTERNAL_PREREQUISITE_ROOT_ID, "prerequisiteOnly")));
        LearningGoal externalRoot = clusterGoal(
                EXTERNAL_PREREQUISITE_ROOT_ID,
                List.of(EXTERNAL_PREREQUISITE_ID));
        LearningGoal externalPrerequisite = clusterGoal(
                EXTERNAL_PREREQUISITE_ID,
                List.of(EXTERNAL_PREREQUISITE_CHILD_ID));
        LearningGoal externalChild = atomicGoal(EXTERNAL_PREREQUISITE_CHILD_ID, List.of());
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ROOT_ID))
                .thenReturn(externalRoot);
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(externalPrerequisite);
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_CHILD_ID))
                .thenReturn(externalChild);

        ProjectionSets projection = projectionSets(fixture.service());

        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds())
                .containsExactlyInAnyOrder(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(projection.structuralGoalIds())
                .contains(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(projection.visibleGoalIds())
                .doesNotContain(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
    }

    @Test
    void mathematicsRootSupportChecksOnlyRequiredChainAndNeverEnrollsUnneededGoals() {
        for (boolean strictMode : List.of(false, true)) {
            Fixture fixture = fixture(view(
                    goalEntry(TARGET_ID),
                    canonicalSubtree(EXTERNAL_PREREQUISITE_ROOT_ID, "prerequisiteOnly")));
            fixture.learner().setStrictMode(strictMode);
            String unusedMathematicsId = "unused-mathematics";
            LearningGoal root = clusterGoal(EXTERNAL_PREREQUISITE_ROOT_ID,
                    List.of(EXTERNAL_PREREQUISITE_ID, EXTERNAL_PREREQUISITE_CHILD_ID, unusedMathematicsId));
            LearningGoal required = atomicGoal(EXTERNAL_PREREQUISITE_ID,
                    List.of(EXTERNAL_PREREQUISITE_CHILD_ID));
            LearningGoal foundation = atomicGoal(EXTERNAL_PREREQUISITE_CHILD_ID, List.of());
            // This unused leaf is unmastered and even has an unresolved requirement.
            // Lookup support does not make its requirement an obligation of TARGET_ID.
            LearningGoal unused = atomicGoal(unusedMathematicsId, List.of("unknown-unused-mathematics"));
            for (LearningGoal mathematicsGoal : List.of(root, required, foundation, unused)) {
                when(fixture.landscapeService().getGoalDefinition(mathematicsGoal.getId()))
                        .thenReturn(mathematicsGoal);
            }
            fixture.landscape().getGoals().stream()
                    .filter(goal -> TARGET_ID.equals(goal.getId()))
                    .findFirst().orElseThrow().setRequires(List.of(EXTERNAL_PREREQUISITE_ID));
            when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                    .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
            Mastery requiredMastery = new Mastery(fixture.learner(), EXTERNAL_PREREQUISITE_ID, 1.0);
            when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                    .thenReturn(List.of(requiredMastery));

            ProjectionSets projection = projectionSets(fixture.service());
            assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
            assertThat(projection.prerequisiteOnlyGoalIds()).containsExactlyInAnyOrder(
                    EXTERNAL_PREREQUISITE_ROOT_ID, EXTERNAL_PREREQUISITE_ID,
                    EXTERNAL_PREREQUISITE_CHILD_ID, unusedMathematicsId);
            assertThat(fixture.service().getFilteredAtomicGoalIds(
                    LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false)).containsExactly(TARGET_ID);
            assertThat(fixture.service().getFrontier(LEARNER_ID))
                    .containsExactlyElementsOf(strictMode ? List.of() : List.of(TARGET_ID));
            assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                    .extracting(FrontierGoal::id)
                    .containsExactlyElementsOf(strictMode ? List.of() : List.of(TARGET_ID));

            when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                    .thenReturn(List.of(requiredMastery,
                            new Mastery(fixture.learner(), EXTERNAL_PREREQUISITE_CHILD_ID, 1.0)));
            assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
            assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                    .extracting(FrontierGoal::id).containsExactly(TARGET_ID);
            assertThat(fixture.service().getMastery(LEARNER_ID)).doesNotContainKey(unusedMathematicsId);
            verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
            verify(fixture.masteryRepository(), never()).saveAll(any());
        }
    }

    @Test
    void unknownExternalPrerequisiteOnlyReferenceMakesProjectionInvalid() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry("unknown-external-prerequisite", "prerequisiteOnly")));

        assertThatThrownBy(() -> projectionSets(fixture.service()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid prerequisiteOnly composition reference")
                .hasMessageContaining("unknown-external-prerequisite")
                .hasMessageContaining("does not resolve");
    }

    @Test
    void externalPrerequisiteOnlyClusterGoalEntryMakesProjectionInvalid() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ROOT_ID, "prerequisiteOnly")));
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ROOT_ID))
                .thenReturn(clusterGoal(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        List.of(EXTERNAL_PREREQUISITE_CHILD_ID)));

        assertThatThrownBy(() -> projectionSets(fixture.service()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid prerequisiteOnly composition reference")
                .hasMessageContaining(EXTERNAL_PREREQUISITE_ROOT_ID)
                .hasMessageContaining("goalEntry must reference an atomic goal");
    }

    @Test
    void externalTargetOrMixedRoleReferenceDoesNotHydrateStructuralGoals() {
        Fixture targetFixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID)));
        when(targetFixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of()));

        Fixture mixedRoleFixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID, "prerequisiteOnly")));
        when(mixedRoleFixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of()));

        for (ProjectionSets projection : List.of(
                projectionSets(targetFixture.service()),
                projectionSets(mixedRoleFixture.service()))) {
            assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
            assertThat(projection.prerequisiteOnlyGoalIds())
                    .doesNotContain(EXTERNAL_PREREQUISITE_ID);
            assertThat(projection.structuralGoalIds())
                    .doesNotContain(EXTERNAL_PREREQUISITE_ID);
            assertThat(projection.visibleGoalIds())
                    .doesNotContain(EXTERNAL_PREREQUISITE_ID);
        }
    }

    @Test
    void explicitPrerequisiteOnlyGoalBlocksAndReleasesTargetUsingGlobalMastery() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        fixture.learner().setStrictMode(true);
        // This test isolates a single direct prerequisite; chains have their own tests.
        fixture.landscape().getGoals().stream()
                .filter(goal -> PREREQUISITE_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of());
        Mastery prerequisiteMastery = new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of())
                .thenReturn(List.of(prerequisiteMastery))
                .thenReturn(List.of(prerequisiteMastery));

        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);

        assertThat(fixture.service().getMastery(LEARNER_ID))
                .containsEntry(PREREQUISITE_ID, 1.0);
        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);
    }

    @Test
    void explicitPhysicsMethodTargetsUnlockAstronomyOnlyAfterEachPrerequisiteIsMastered() throws Exception {
        Fixture fixture = physicsSourceRouteFixture("target");

        assertPhysicsSourceRouteFrontier(fixture, Set.of(), OBSERVATION_ID, SI_UNITS_ID);
        assertPhysicsSourceRouteFrontier(fixture, Set.of(OBSERVATION_ID), MODELS_ID, SI_UNITS_ID);
        assertPhysicsSourceRouteFrontier(fixture, Set.of(OBSERVATION_ID, MODELS_ID), SI_UNITS_ID);
        assertPhysicsSourceRouteFrontier(
                fixture, Set.of(OBSERVATION_ID, MODELS_ID, SI_UNITS_ID), SOURCE_CRITIQUE_ID);
        assertPhysicsSourceRouteFrontier(
                fixture, Set.copyOf(PHYSICS_METHOD_IDS),
                SOLAR_SYSTEM_CLASSIFICATION_ID, OPEN_COSMOLOGICAL_QUESTIONS_ID);
    }

    @Test
    void omittedOrPrerequisiteOnlyPhysicsMethodsDoNotProvideALearnableAstronomyRoute() throws Exception {
        for (String methodRole : List.of("omitted", "prerequisiteOnly")) {
            Fixture fixture = physicsSourceRouteFixture(methodRole);

            assertThat(fixture.service().getFilteredAtomicGoalIds(
                            LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                    .containsExactlyInAnyOrder(
                            SOLAR_SYSTEM_CLASSIFICATION_ID, OPEN_COSMOLOGICAL_QUESTIONS_ID);
            assertPhysicsSourceRouteFrontier(fixture, Set.of());
            assertPhysicsSourceRouteFrontier(fixture, Set.of(OBSERVATION_ID, MODELS_ID, SI_UNITS_ID));

            if ("prerequisiteOnly".equals(methodRole)) {
                assertPhysicsSourceRouteFrontier(
                        fixture, Set.copyOf(PHYSICS_METHOD_IDS),
                        SOLAR_SYSTEM_CLASSIFICATION_ID, OPEN_COSMOLOGICAL_QUESTIONS_ID);
            } else {
                assertPhysicsSourceRouteFrontier(fixture, Set.copyOf(PHYSICS_METHOD_IDS));
            }
        }
    }

    @Test
    void omittedDirectPrerequisiteFailsClosedButOmittedInheritedCompatibilityPrerequisiteDoesNotBlock() {
        Fixture directRequirement = fixture(view(goalEntry(TARGET_ID)));
        when(directRequirement.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(directRequirement.learner(), TARGET_ID)));

        assertThat(directRequirement.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(directRequirement.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .doesNotContain(TARGET_ID);

        Fixture inheritedRequirement = fixture(view(goalEntry(OUTSIDE_TARGET_ID)));
        inheritedRequirement.landscape().getGoals().stream()
                .filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow()
                .setRequires(List.of(PREREQUISITE_ID));
        when(inheritedRequirement.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(inheritedRequirement.learner(), OUTSIDE_TARGET_ID)));

        assertThat(inheritedRequirement.service().getFrontier(LEARNER_ID))
                .containsExactly(OUTSIDE_TARGET_ID);
        assertThat(inheritedRequirement.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactly(OUTSIDE_TARGET_ID);
    }

    @Test
    void unknownDirectPrerequisiteBlocksBothFrontiersInEitherMode() {
        for (boolean strictMode : List.of(false, true)) {
            Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
            fixture.learner().setStrictMode(strictMode);
            fixture.landscape().getGoals().stream()
                    .filter(goal -> TARGET_ID.equals(goal.getId()))
                    .findFirst().orElseThrow()
                    .setRequires(List.of("unknown-mathematics-prerequisite"));
            when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                    .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

            assertThat(fixture.service().getFrontier(LEARNER_ID)).doesNotContain(TARGET_ID);
            assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                    .extracting(FrontierGoal::id).doesNotContain(TARGET_ID);
        }
    }

    @Test
    void strictSelectedTargetPrerequisiteOutsideFocusBlocksUntilStoredMasteryReleasesIt() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID)));
        fixture.learner().setStrictMode(true);
        // Isolate the focus boundary from transitive prerequisite checks.
        fixture.landscape().getGoals().stream()
                .filter(goal -> PREREQUISITE_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID)).doesNotContain(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id).doesNotContain(TARGET_ID);

        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id).containsExactly(TARGET_ID);
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.masteryRepository(), never()).saveAll(any());
    }

    @Test
    void normalFocusUnionIgnoresValidOutsideRequirementsButPreservesInternalOrderAndMastery() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID), goalEntry(TRANSITIVE_PREREQUISITE_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID),
                        new PlannedGoal(fixture.learner(), PREREQUISITE_ID)));

        assertBothFrontiers(fixture, PREREQUISITE_ID);
        assertThat(fixture.service().getUncompactedRichFrontierForFocus(LEARNER_ID,
                List.of(TARGET_ID, PREREQUISITE_ID))).extracting(FrontierGoal::id)
                .containsExactly(PREREQUISITE_ID);
        assertThat(fixture.service().getMastery(LEARNER_ID)).isEmpty();

        fixture.learner().setStrictMode(true);
        assertBothFrontiers(fixture);
        fixture.learner().setStrictMode(false);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        assertBothFrontiers(fixture, TARGET_ID);
        assertThat(fixture.service().getMastery(LEARNER_ID))
                .containsOnlyKeys(PREREQUISITE_ID).containsEntry(PREREQUISITE_ID, 1.0);
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.masteryRepository(), never()).saveAll(any());
    }

    @Test
    void normalFocusCutsAnOutsideIntermediateBeforeFollowingItsReentryIntoTheFocus() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID), goalEntry(TRANSITIVE_PREREQUISITE_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID),
                        new PlannedGoal(fixture.learner(), TRANSITIVE_PREREQUISITE_ID)));

        assertBothFrontiers(fixture, TARGET_ID, TRANSITIVE_PREREQUISITE_ID);
        fixture.learner().setStrictMode(true);
        assertBothFrontiers(fixture, TRANSITIVE_PREREQUISITE_ID);
    }

    @Test
    void normalFocusRetainsAnInternalRequirementInheritedFromAnOutsideAncestor() {
        Fixture fixture = fixture(view(goalEntry(OUTSIDE_TARGET_ID), goalEntry(PREREQUISITE_ID),
                goalEntry(TRANSITIVE_PREREQUISITE_ID)));
        fixture.landscape().getGoals().stream().filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of(PREREQUISITE_ID));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID),
                        new PlannedGoal(fixture.learner(), PREREQUISITE_ID)));
        assertBothFrontiers(fixture, PREREQUISITE_ID);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        assertBothFrontiers(fixture, OUTSIDE_TARGET_ID);
    }

    @Test
    void normalClusterRequirementAggregatesOnlyItsTargetChildrenInsideTheFocus() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID),
                goalEntry(TRANSITIVE_PREREQUISITE_ID, "prerequisiteOnly")));
        fixture.landscape().setGoals(List.of(
                clusterGoal(ROOT_CLUSTER_ID, List.of(OUTSIDE_TARGET_ID, NESTED_CLUSTER_ID)),
                clusterGoal(NESTED_CLUSTER_ID, List.of(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID)),
                atomicGoal(PREREQUISITE_ID, List.of()), atomicGoal(TRANSITIVE_PREREQUISITE_ID, List.of()),
                atomicGoal(OUTSIDE_TARGET_ID, List.of(NESTED_CLUSTER_ID))));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), ROOT_CLUSTER_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));

        assertThat(fixture.service().getFrontier(LEARNER_ID)).contains(OUTSIDE_TARGET_ID)
                .doesNotContain(TRANSITIVE_PREREQUISITE_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id)
                .contains(OUTSIDE_TARGET_ID).doesNotContain(TRANSITIVE_PREREQUISITE_ID);
        fixture.learner().setStrictMode(true);
        assertThat(fixture.service().getFrontier(LEARNER_ID)).doesNotContain(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id)
                .doesNotContain(OUTSIDE_TARGET_ID);
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
    }

    @Test
    void aClusterWithAnEmptyAtomicFocusBasisCreatesNoStoredMasteryObligation() {
        Fixture fixture = fixture(view(goalEntry(OUTSIDE_TARGET_ID)));
        Map<String, LearningGoal> graph = Map.of(
                NESTED_CLUSTER_ID, clusterGoal(NESTED_CLUSTER_ID, List.of(TRANSITIVE_PREREQUISITE_ID)),
                TRANSITIVE_PREREQUISITE_ID, atomicGoal(TRANSITIVE_PREREQUISITE_ID, List.of()));
        Map<String, Double> stored = Map.of();
        Map<String, Double> focused = ReflectionTestUtils.invokeMethod(fixture.service(),
                "computeEffectivePrereqMastery", graph, stored, Set.of(NESTED_CLUSTER_ID));
        Map<String, Double> global = ReflectionTestUtils.invokeMethod(fixture.service(),
                "computeEffectivePrereqMastery", graph, stored);
        assertThat(focused).containsEntry(NESTED_CLUSTER_ID, 1.0).doesNotContainKey(TRANSITIVE_PREREQUISITE_ID);
        assertThat(global).containsEntry(NESTED_CLUSTER_ID, 0.0);
        assertThat(stored).isEmpty();
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
    }

    @Test
    void normalClusterBasisTraversesOutsideClustersToTheirExplicitTargetDescendants() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(NESTED_CLUSTER_ID, "prerequisiteOnly"), goalEntry(PREREQUISITE_ID),
                goalEntry(OUTSIDE_TARGET_ID)));
        fixture.landscape().setGoals(List.of(
                clusterGoal(ROOT_CLUSTER_ID, List.of(NESTED_CLUSTER_ID)),
                clusterGoal(NESTED_CLUSTER_ID, List.of(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID)),
                atomicGoal(PREREQUISITE_ID, List.of()), atomicGoal(TRANSITIVE_PREREQUISITE_ID, List.of()),
                atomicGoal(OUTSIDE_TARGET_ID, List.of(ROOT_CLUSTER_ID))));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), ROOT_CLUSTER_ID),
                        new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));
        assertThat(projectionSets(fixture.service()).targetGoalIds())
                .contains(ROOT_CLUSTER_ID, PREREQUISITE_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(NESTED_CLUSTER_ID, TRANSITIVE_PREREQUISITE_ID);
        assertThat(fixture.service().getFrontier(LEARNER_ID)).doesNotContain(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id)
                .doesNotContain(OUTSIDE_TARGET_ID);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).contains(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id)
                .contains(OUTSIDE_TARGET_ID);
        fixture.learner().setStrictMode(true);
        assertThat(fixture.service().getFrontier(LEARNER_ID)).doesNotContain(OUTSIDE_TARGET_ID);
    }

    @Test
    void normalClusterBasisDoesNotPromoteAnExtensionWhenItsGlobalCoreSiblingIsOutsideFocus() {
        Fixture fixture = fixture(view(goalEntry(OUTSIDE_TARGET_ID)));
        LearningGoal core = atomicGoal(PREREQUISITE_ID, List.of());
        core.setTags(List.of("GK"));
        LearningGoal extension = atomicGoal(TRANSITIVE_PREREQUISITE_ID, List.of());
        extension.setTags(List.of("LK"));
        Map<String, LearningGoal> graph = Map.of(NESTED_CLUSTER_ID,
                clusterGoal(NESTED_CLUSTER_ID, List.of(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID)),
                PREREQUISITE_ID, core, TRANSITIVE_PREREQUISITE_ID, extension);
        Map<String, Double> stored = Map.of(PREREQUISITE_ID, 1.0);
        Map<String, Double> focused = ReflectionTestUtils.invokeMethod(fixture.service(),
                "computeEffectivePrereqMastery", graph, stored,
                Set.of(NESTED_CLUSTER_ID, TRANSITIVE_PREREQUISITE_ID));
        Map<String, Double> global = ReflectionTestUtils.invokeMethod(fixture.service(),
                "computeEffectivePrereqMastery", graph, stored);
        assertThat(global).containsEntry(NESTED_CLUSTER_ID, 1.0);
        assertThat(focused).containsEntry(NESTED_CLUSTER_ID, 1.0)
                .containsEntry(TRANSITIVE_PREREQUISITE_ID, 0.0);
    }

    private void assertBothFrontiers(Fixture fixture, String... expected) {
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactlyInAnyOrder(expected);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(expected);
    }

    @Test
    void simpleFrontierChecksTransitivePrerequisitesDespiteMasteredIntermediateGoal() {
        assertTransitivePrerequisiteBlocksUntilStoredMastery(false);
    }

    @Test
    void richFrontierChecksTransitivePrerequisitesDespiteMasteredIntermediateGoal() {
        assertTransitivePrerequisiteBlocksUntilStoredMastery(true);
    }

    private void assertTransitivePrerequisiteBlocksUntilStoredMastery(boolean richFrontier) {
        for (boolean strictMode : List.of(false, true)) {
            for (String mathematicsRole : List.of("target", "prerequisiteOnly")) {
                Fixture fixture = fixture(view(
                        goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID),
                        goalEntry(EXTERNAL_PREREQUISITE_ID, mathematicsRole)));
                String mathematicsLandscapeId = "transitive-mathematics";
                SkillLandscape mathematics = new SkillLandscape();
                mathematics.setLandscapeId(mathematicsLandscapeId);
                mathematics.setGoals(List.of(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of())));
                when(fixture.landscapeService().getClosure(LANDSCAPE_ID))
                        .thenReturn(List.of(fixture.landscape(), mathematics));
                when(fixture.landscapeService().getById(mathematicsLandscapeId)).thenReturn(mathematics);
                when(fixture.compositionViewService().isAuthoritativeForLandscape(mathematicsLandscapeId))
                        .thenReturn(true);
                when(fixture.compositionViewService().findLearnerScopeView(eq(mathematicsLandscapeId), anyMap()))
                        .thenReturn(Map.of(
                                "viewId", "transitive-mathematics-view",
                                "landscapeId", mathematicsLandscapeId,
                                "rootNodes", List.of(goalEntry(EXTERNAL_PREREQUISITE_ID, mathematicsRole))));
                fixture.learner().setPersonalCurriculum("""
                        {"projection-roles":{"selected":true,"filterId":"LK"},
                         "transitive-mathematics":{"selected":true,"filterId":"LK"}}
                        """);
                fixture.learner().setStrictMode(strictMode);
                fixture.landscape().getGoals().stream()
                        .filter(goal -> PREREQUISITE_ID.equals(goal.getId()))
                        .findFirst().orElseThrow()
                        .setRequires(List.of(EXTERNAL_PREREQUISITE_ID));
                when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                        .thenReturn(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of()));
                when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                        .thenReturn("target".equals(mathematicsRole)
                                ? List.of(new PlannedGoal(fixture.learner(), TARGET_ID),
                                        new PlannedGoal(fixture.learner(), PREREQUISITE_ID),
                                        new PlannedGoal(fixture.learner(), EXTERNAL_PREREQUISITE_ID))
                                : List.of(new PlannedGoal(fixture.learner(), TARGET_ID),
                                        new PlannedGoal(fixture.learner(), PREREQUISITE_ID)));
                Mastery intermediateMastery = new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0);
                when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                        .thenReturn(List.of(intermediateMastery));
                ProjectionSets projection = projectionSets(
                        fixture.service(), fixture.learner().getPersonalCurriculum());
                assertThat(mathematicsRole.equals("target")
                        ? projection.targetGoalIds() : projection.prerequisiteOnlyGoalIds())
                        .contains(EXTERNAL_PREREQUISITE_ID);

                List<String> blockedFrontier = richFrontier
                        ? fixture.service().getRichFrontier(LEARNER_ID).stream().map(FrontierGoal::id).toList()
                        : fixture.service().getFrontier(LEARNER_ID);
                if (strictMode || "target".equals(mathematicsRole)) {
                    assertThat(blockedFrontier)
                            .as("strict=%s, mathematicsRole=%s", strictMode, mathematicsRole)
                            .doesNotContain(TARGET_ID);
                } else {
                    assertThat(blockedFrontier).containsExactly(TARGET_ID);
                }
                assertThat(fixture.service().getMastery(LEARNER_ID))
                        .doesNotContainKey(EXTERNAL_PREREQUISITE_ID);

                when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                        .thenReturn(List.of(intermediateMastery,
                                new Mastery(fixture.learner(), EXTERNAL_PREREQUISITE_ID, 1.0)));
                List<String> releasedFrontier = richFrontier
                        ? fixture.service().getRichFrontier(LEARNER_ID).stream().map(FrontierGoal::id).toList()
                        : fixture.service().getFrontier(LEARNER_ID);
                assertThat(releasedFrontier).containsExactly(TARGET_ID);
                verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
                verify(fixture.masteryRepository(), never()).saveAll(any());
            }
        }
    }

    @Test
    void physicsPrerequisiteOnlyEntryDoesNotRemoveIndependentlySelectedMathematicsTarget() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID), goalEntry(EXTERNAL_PREREQUISITE_ID, "prerequisiteOnly")));
        String mathematicsLandscapeId = "independent-mathematics";
        SkillLandscape mathematics = new SkillLandscape();
        mathematics.setLandscapeId(mathematicsLandscapeId);
        mathematics.setFrameworkId("canonical-gymnasium-mathematics-test");
        mathematics.setGoals(List.of(
                clusterGoal(EXTERNAL_PREREQUISITE_ROOT_ID, List.of(EXTERNAL_PREREQUISITE_ID)),
                atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of())));
        when(fixture.landscapeService().getClosure(LANDSCAPE_ID))
                .thenReturn(List.of(fixture.landscape(), mathematics));
        when(fixture.landscapeService().getById(mathematicsLandscapeId)).thenReturn(mathematics);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(mathematicsLandscapeId))
                .thenReturn(true);
        when(fixture.compositionViewService().findLearnerScopeView(eq(mathematicsLandscapeId), anyMap()))
                .thenReturn(Map.of(
                        "viewId", "independent-mathematics-view",
                        "landscapeId", mathematicsLandscapeId,
                        "rootNodes", List.of(canonicalSubtree(EXTERNAL_PREREQUISITE_ROOT_ID))));
        String personalCurriculum = """
                {"projection-roles":{"selected":true,"filterId":"LK"},
                 "independent-mathematics":{"selected":true,"filterId":"LK"}}
                """;
        fixture.learner().setPersonalCurriculum(personalCurriculum);

        ProjectionSets projection = projectionSets(fixture.service(), personalCurriculum);
        assertThat(projection.targetGoalIds()).contains(TARGET_ID, EXTERNAL_PREREQUISITE_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).doesNotContain(EXTERNAL_PREREQUISITE_ID);
        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, personalCurriculum, null, false))
                .contains(TARGET_ID, EXTERNAL_PREREQUISITE_ID);
    }

    @Test
    void foreignSupportRootDoesNotHideIndependentSubjectPresentationAnchor() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID),
                canonicalSubtree(EXTERNAL_PREREQUISITE_ROOT_ID, "prerequisiteOnly")));
        String mathematicsLandscapeId = "independent-mathematics";
        SkillLandscape mathematics = new SkillLandscape();
        mathematics.setLandscapeId(mathematicsLandscapeId);
        mathematics.setFrameworkId("canonical-gymnasium-mathematics-test");
        LearningGoal mathematicsRoot = clusterGoal(EXTERNAL_PREREQUISITE_ROOT_ID,
                List.of(EXTERNAL_PREREQUISITE_CHILD_ID));
        mathematicsRoot.setTags(List.of("root"));
        mathematics.setGoals(List.of(mathematicsRoot,
                clusterGoal(EXTERNAL_PREREQUISITE_CHILD_ID, List.of(EXTERNAL_PREREQUISITE_ID)),
                atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of())));
        when(fixture.landscapeService().getClosure(LANDSCAPE_ID))
                .thenReturn(List.of(fixture.landscape(), mathematics));
        when(fixture.landscapeService().getById(mathematicsLandscapeId)).thenReturn(mathematics);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(mathematicsLandscapeId))
                .thenReturn(true);
        // The own view targets the branch, while the existing landscape root
        // remains its presentation anchor rather than a newly enrolled target.
        when(fixture.compositionViewService().findLearnerScopeView(eq(mathematicsLandscapeId), anyMap()))
                .thenReturn(Map.of("viewId", "independent-mathematics-view",
                        "landscapeId", mathematicsLandscapeId,
                        "rootNodes", List.of(canonicalSubtree(EXTERNAL_PREREQUISITE_CHILD_ID))));
        String personalCurriculum = """
                {"projection-roles":{"selected":true,"filterId":"LK"},
                 "independent-mathematics":{"selected":true,"filterId":"LK"}}
                """;
        fixture.learner().setPersonalCurriculum(personalCurriculum);

        ProjectionSets projection = projectionSets(fixture.service(), personalCurriculum);
        assertThat(projection.targetGoalIds()).containsExactlyInAnyOrder(
                TARGET_ID, EXTERNAL_PREREQUISITE_CHILD_ID, EXTERNAL_PREREQUISITE_ID);
        assertThat(projection.targetGoalIds()).doesNotContain(EXTERNAL_PREREQUISITE_ROOT_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).doesNotContain(EXTERNAL_PREREQUISITE_ROOT_ID);
        assertThat(projection.presentationRootGoalIds()).contains(EXTERNAL_PREREQUISITE_ROOT_ID);

        Fixture ownPrerequisiteRoot = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"), goalEntry(TARGET_ID)));
        ProjectionSets ownProjection = projectionSets(ownPrerequisiteRoot.service());
        assertThat(ownProjection.prerequisiteOnlyGoalIds()).contains(ROOT_CLUSTER_ID);
        assertThat(ownProjection.presentationRootGoalIds()).doesNotContain(ROOT_CLUSTER_ID);
    }

    @Test
    void dependentMasteryNeverGrantsOrSuppressesItsUnmasteredPrerequisite() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID)));
        fixture.landscape().getGoals().stream()
                .filter(goal -> PREREQUISITE_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of());
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), TARGET_ID, 1.0)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), PREREQUISITE_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(PREREQUISITE_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id).containsExactly(PREREQUISITE_ID);
        assertThat(fixture.service().getMastery(LEARNER_ID)).doesNotContainKey(PREREQUISITE_ID);
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.masteryRepository(), never()).saveAll(any());
    }

    @Test
    void releasedExamWithoutDirectDidacticPrerequisiteNeverEntersFrontier() {
        Fixture fixture = fixture(view(goalEntry(OUTSIDE_TARGET_ID)));
        LearningGoal exam = fixture.landscape().getGoals().stream()
                .filter(goal -> OUTSIDE_TARGET_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        exam.setExamData(releasedExamData());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .doesNotContain(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .doesNotContain(OUTSIDE_TARGET_ID);
    }

    @Test
    void releasedExamWithMasteredDirectDidacticPrerequisiteCanEnterFrontier() throws Exception {
        Fixture fixture = fixture(view(
                goalEntry(OUTSIDE_TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        // The exam gate here has one terminal didactic prerequisite.
        fixture.landscape().getGoals().stream()
                .filter(goal -> PREREQUISITE_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of());
        LearningGoal exam = fixture.landscape().getGoals().stream()
                .filter(goal -> OUTSIDE_TARGET_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        exam.setRequires(List.of(PREREQUISITE_ID));
        exam.setExamData(releasedExamData());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .containsExactly(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .singleElement()
                .satisfies(candidate -> {
                    assertThat(candidate.id()).isEqualTo(OUTSIDE_TARGET_ID);
                    assertThat(candidate.examData()).isNull();
                    assertThat(candidate.examReadyForSelection()).isTrue();
                });

        var projected = new CoachStateProjection("https://skillpilot.test")
                .project(fixture.service().getCoachLearnerState(LEARNER_ID));
        assertThat(projected.frontier())
                .extracting(FrontierGoal::id)
                .containsExactly(OUTSIDE_TARGET_ID);
        assertThat(projected.stateMachine().goalOptions())
                .singleElement()
                .satisfies(candidate -> {
                    assertThat(candidate.id()).isEqualTo(OUTSIDE_TARGET_ID);
                    assertThat(candidate.examData()).isNull();
                });
        assertThat(new ObjectMapper().writeValueAsString(projected))
                .doesNotContain(
                        "examReadyForSelection",
                        "taskContent",
                        "solutionContent",
                        "passingPoints");
    }

    @Test
    void simpleFrontierRespectsThePlannedTargetScope() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .containsExactly(OUTSIDE_TARGET_ID);
    }

    @Test
    void activeGoalSelectionUsesFullFrontierWhileStillRejectingOutOfProjectionGoals() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID)));
        LearningGoal root = fixture.landscape().getGoals().stream()
                .filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        List<String> compactableGoalIds = java.util.stream.IntStream.range(0, 24)
                .mapToObj(index -> "compactable-goal-" + index)
                .toList();
        List<LearningGoal> expandedGoals = new java.util.ArrayList<>(fixture.landscape().getGoals());
        compactableGoalIds.forEach(goalId -> expandedGoals.add(atomicGoal(goalId, List.of())));
        fixture.landscape().setGoals(expandedGoals);
        root.setContains(new java.util.ArrayList<>(compactableGoalIds));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), ROOT_CLUSTER_ID)));

        Set<String> compactFrontierIds = fixture.service().getRichFrontier(LEARNER_ID).stream()
                .map(FrontierGoal::id)
                .collect(java.util.stream.Collectors.toSet());
        Set<String> fullFrontierIds = fixture.service().getUncompactedRichFrontier(LEARNER_ID).stream()
                .map(FrontierGoal::id)
                .collect(java.util.stream.Collectors.toSet());
        String compactedAwayGoalId = compactableGoalIds.stream()
                .filter(fullFrontierIds::contains)
                .filter(goalId -> !compactFrontierIds.contains(goalId))
                .findFirst()
                .orElseThrow();

        fixture.service().setActiveGoal(LEARNER_ID, compactedAwayGoalId);

        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(compactedAwayGoalId);
        assertThatThrownBy(() -> fixture.service().setActiveGoal(
                        LEARNER_ID,
                        TRANSITIVE_PREREQUISITE_ID))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason()).contains("current frontier");
                });
        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(compactedAwayGoalId);
    }

    @Test
    void broadSyntheticCurriculumFocusDoesNotEnableGlobalAssessmentOfferBranch() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(GLOBAL_ASSESSMENT_ROOT_ID)));
        addGlobalAssessmentBranch(fixture, List.of(PREREQUISITE_ID));
        when(fixture.compositionViewService().resolveStructureReference(SYNTHETIC_STRUCTURE_ID))
                .thenReturn(new CompositionViewService.CompositionStructureResolution(
                        SYNTHETIC_STRUCTURE_ID,
                        "projection-role-test",
                        "sek2",
                        "Sekundarstufe II",
                        List.of(ROOT_CLUSTER_ID, GLOBAL_ASSESSMENT_ROOT_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), SYNTHETIC_STRUCTURE_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .contains(OUTSIDE_TARGET_ID)
                .doesNotContain(GLOBAL_ASSESSMENT_ROOT_ID, GLOBAL_ASSESSMENT_EXAM_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .contains(OUTSIDE_TARGET_ID)
                .doesNotContain(GLOBAL_ASSESSMENT_ROOT_ID, GLOBAL_ASSESSMENT_EXAM_ID);
    }

    @Test
    void explicitCanonicalAssessmentFocusEnablesReleasedOfferExamWithoutDirectPrerequisite() {
        Fixture fixture = fixture(view(canonicalSubtree(GLOBAL_ASSESSMENT_ROOT_ID)));
        addGlobalAssessmentBranch(fixture, List.of());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), GLOBAL_ASSESSMENT_ROOT_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .contains(GLOBAL_ASSESSMENT_EXAM_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .contains(GLOBAL_ASSESSMENT_EXAM_ID);
    }

    @Test
    void switchingFromExplicitAssessmentFocusToBroadSyntheticScopeClearsActiveExam() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(GLOBAL_ASSESSMENT_ROOT_ID)));
        addGlobalAssessmentBranch(fixture, List.of());
        LearningGoal broadRoot = fixture.landscape().getGoals().stream()
                .filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        broadRoot.setContains(List.of(
                NESTED_CLUSTER_ID,
                OUTSIDE_TARGET_ID,
                GLOBAL_ASSESSMENT_ROOT_ID));
        when(fixture.compositionViewService().resolveStructureReference(SYNTHETIC_STRUCTURE_ID))
                .thenReturn(new CompositionViewService.CompositionStructureResolution(
                        SYNTHETIC_STRUCTURE_ID,
                        "projection-role-test",
                        "sek2",
                        "Sekundarstufe II",
                        List.of(ROOT_CLUSTER_ID)));
        fixture.learner().setActiveGoalId(GLOBAL_ASSESSMENT_EXAM_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(
                        fixture.learner(),
                        GLOBAL_ASSESSMENT_ROOT_ID)));

        fixture.service().setPlannedGoals(
                LEARNER_ID,
                Set.of(GLOBAL_ASSESSMENT_ROOT_ID));
        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(GLOBAL_ASSESSMENT_EXAM_ID);

        fixture.service().setPlannedGoals(LEARNER_ID, Set.of(SYNTHETIC_STRUCTURE_ID));

        assertThat(fixture.learner().getActiveGoalId()).isNull();
    }

    @Test
    void targetDominatesPrerequisiteOnlyWhenSameStableGoalIsReferencedInBothRoles() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(TARGET_ID, "prerequisiteOnly")));

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .containsExactly(TARGET_ID);

        ProjectionSets projection = projectionSets(fixture.service());
        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).doesNotContain(TARGET_ID);
        assertThat(projection.presentationRootGoalIds())
                .containsExactly(ROOT_CLUSTER_ID);
    }

    @Test
    void directGoalEntryOverridesInheritedCanonicalSubtreeRegardlessOfRole() {
        Fixture directPrerequisite = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                goalEntry(TARGET_ID, "prerequisiteOnly")));

        ProjectionSets directPrerequisiteProjection =
                projectionSets(directPrerequisite.service());
        assertThat(directPrerequisiteProjection.targetGoalIds())
                .contains(ROOT_CLUSTER_ID, NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(TARGET_ID);
        assertThat(directPrerequisiteProjection.prerequisiteOnlyGoalIds())
                .contains(TARGET_ID);

        Fixture directTarget = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"),
                goalEntry(TARGET_ID)));

        ProjectionSets directTargetProjection = projectionSets(directTarget.service());
        assertThat(directTargetProjection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(directTargetProjection.prerequisiteOnlyGoalIds())
                .contains(ROOT_CLUSTER_ID, NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(TARGET_ID);
    }

    @Test
    void deeperCanonicalSubtreeOverridesShallowerSubtreeRegardlessOfRole() {
        Fixture deeperPrerequisite = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(NESTED_CLUSTER_ID, "prerequisiteOnly")));

        ProjectionSets deeperPrerequisiteProjection =
                projectionSets(deeperPrerequisite.service());
        assertThat(deeperPrerequisiteProjection.targetGoalIds())
                .containsExactlyInAnyOrder(ROOT_CLUSTER_ID, OUTSIDE_TARGET_ID);
        assertThat(deeperPrerequisiteProjection.prerequisiteOnlyGoalIds())
                .containsExactlyInAnyOrder(
                        NESTED_CLUSTER_ID,
                        TARGET_ID,
                        PREREQUISITE_ID);

        Fixture deeperTarget = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"),
                canonicalSubtree(NESTED_CLUSTER_ID)));

        ProjectionSets deeperTargetProjection = projectionSets(deeperTarget.service());
        assertThat(deeperTargetProjection.targetGoalIds())
                .containsExactlyInAnyOrder(
                        NESTED_CLUSTER_ID,
                        TARGET_ID,
                        PREREQUISITE_ID);
        assertThat(deeperTargetProjection.prerequisiteOnlyGoalIds())
                .containsExactlyInAnyOrder(ROOT_CLUSTER_ID, OUTSIDE_TARGET_ID);
    }

    @Test
    void legacyProjectionKeepsAllAtomicGoalsAsTargets() {
        Fixture fixture = fixture(null);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(LANDSCAPE_ID))
                .thenReturn(false);

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .containsExactlyInAnyOrder(
                        TARGET_ID,
                        PREREQUISITE_ID,
                        TRANSITIVE_PREREQUISITE_ID,
                        OUTSIDE_TARGET_ID);

        ProjectionSets projection = projectionSets(fixture.service());
        assertThat(projection.targetGoalIds())
                .containsExactlyInAnyOrder(
                        TARGET_ID,
                        PREREQUISITE_ID,
                        TRANSITIVE_PREREQUISITE_ID,
                        ROOT_CLUSTER_ID,
                        NESTED_CLUSTER_ID,
                        OUTSIDE_TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).isEmpty();
    }

    @Test
    void setPlannedGoalsRejectsPrerequisiteOnlyAndUnknownGoalsBeforePersistence() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

        assertInvalidProjectedFocus(
                () -> fixture.service().setPlannedGoals(LEARNER_ID, Set.of(PREREQUISITE_ID)),
                PREREQUISITE_ID);
        assertInvalidProjectedFocus(
                () -> fixture.service().setPlannedGoals(LEARNER_ID, Set.of("unknown-goal")),
                "unknown-goal");

        assertThat(fixture.savedGoals()).isEmpty();
        verify(fixture.plannedGoalRepository(), never())
                .deleteAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any());
    }

    @Test
    void setScopeRejectsStructurallyKnownButLearnerFacingInvisibleGoal() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));

        assertInvalidProjectedFocus(
                () -> fixture.service().setScope(LEARNER_ID, List.of(OUTSIDE_TARGET_ID)),
                OUTSIDE_TARGET_ID);

        assertThat(fixture.savedGoals()).isEmpty();
    }

    @Test
    void setPlannedGoalsNormalizesLegacyTargetIdBeforeProjectionValidation() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        when(fixture.goalMappingService().findAllByLegacyGoalId("legacy-target"))
                .thenReturn(List.of(new ResolvedGoalMapping(
                        "legacy-landscape",
                        LANDSCAPE_ID,
                        "legacy-target",
                        TARGET_ID,
                        "exact",
                        "test-mapping.json")));

        fixture.service().setPlannedGoals(LEARNER_ID, Set.of("legacy-target"));

        assertThat(fixture.savedGoals())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(TARGET_ID);
    }

    @Test
    void setPlannedGoalsAllowsVisibleSyntheticCompositionStructureTarget() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        when(fixture.compositionViewService().resolveStructureReference(SYNTHETIC_STRUCTURE_ID))
                .thenReturn(new CompositionViewService.CompositionStructureResolution(
                        SYNTHETIC_STRUCTURE_ID,
                        "projection-role-test",
                        "sek2",
                        "Sekundarstufe II",
                        List.of(TARGET_ID)));

        fixture.service().setPlannedGoals(LEARNER_ID, Set.of(SYNTHETIC_STRUCTURE_ID));

        assertThat(fixture.savedGoals())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(SYNTHETIC_STRUCTURE_ID);
    }

    @Test
    void setPlannedGoalsNormalizesEmptySetToFirstVisibleRootAfterPersonalization() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        PlannedGoal existingGoal = new PlannedGoal(fixture.learner(), TARGET_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(existingGoal))
                .thenReturn(List.of());

        assertThat(fixture.service().setPlannedGoals(LEARNER_ID, Set.of()))
                .containsExactly(ROOT_CLUSTER_ID);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PlannedGoal>> deleted =
                ArgumentCaptor.forClass(Iterable.class);
        verify(fixture.plannedGoalRepository()).deleteAll(deleted.capture());
        assertThat(deleted.getValue())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(TARGET_ID);
        assertThat(fixture.savedGoals())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(ROOT_CLUSTER_ID);
        verify(fixture.eventPublisher()).publishEvent(
                org.mockito.ArgumentMatchers.argThat(event ->
                        event instanceof com.skillpilot.backend.events.LearnerStateChangedEvent change
                                && "PLANNED_GOALS_UPDATE".equals(change.getChangeType())));
    }

    @Test
    void selectingCurriculumWithoutLevelTwoQuestionsPersistsItsDefaultFocusImmediately() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        fixture.learner().setSelectedCurriculum(null);
        fixture.learner().setPersonalCurriculum(null);

        fixture.service().setCurriculum(LEARNER_ID, LANDSCAPE_ID);

        verify(fixture.plannedGoalRepository()).deleteByLearner_SkillpilotId(LEARNER_ID);
        verify(fixture.plannedGoalRepository()).save(
                org.mockito.ArgumentMatchers.argThat(goal ->
                        ROOT_CLUSTER_ID.equals(goal.getGoalId())));
    }

    @Test
    void prerequisiteOnlyStructureAncestorCannotBecomeFocusThroughTargetDescendant() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"),
                goalEntry(TARGET_ID)));

        assertInvalidProjectedFocus(
                () -> fixture.service().setPlannedGoals(
                        LEARNER_ID,
                        Set.of(ROOT_CLUSTER_ID)),
                ROOT_CLUSTER_ID);
    }

    @Test
    void storedPrerequisiteOnlyFocusIsFilteredFromLearnerFacingReadsAndCannotConstrainFrontier() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        PlannedGoal stalePrerequisiteOnlyFocus =
                new PlannedGoal(fixture.learner(), PREREQUISITE_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(stalePrerequisiteOnlyFocus));

        assertThat(fixture.service().getPlannedGoals(LEARNER_ID))
                .containsExactly(ROOT_CLUSTER_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(
                        ROOT_CLUSTER_ID,
                        NESTED_CLUSTER_ID,
                        OUTSIDE_TARGET_ID)
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);

        var learnerState = fixture.service().getLearnerState(LEARNER_ID);
        assertThat(learnerState.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(ROOT_CLUSTER_ID);
        assertThat(learnerState.frontier())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(
                        ROOT_CLUSTER_ID,
                        NESTED_CLUSTER_ID,
                        OUTSIDE_TARGET_ID)
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);

        verify(fixture.plannedGoalRepository())
                .deleteAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any());
        verify(fixture.plannedGoalRepository()).save(
                org.mockito.ArgumentMatchers.argThat(goal ->
                        ROOT_CLUSTER_ID.equals(goal.getGoalId())));
    }

    private Fixture physicsSourceRouteFixture(String methodRole) throws Exception {
        List<Map<String, Object>> entries = new ArrayList<>();
        entries.add(goalEntry(SOLAR_SYSTEM_CLASSIFICATION_ID));
        entries.add(goalEntry(OPEN_COSMOLOGICAL_QUESTIONS_ID));
        entries.add(canonicalSubtree("c01b1ce9-a667-4a46-b251-ec33ae602b15", "prerequisiteOnly"));
        MASTERED_PHYSICS_CONTEXT_IDS.forEach(id -> entries.add(goalEntry(id, "prerequisiteOnly")));
        if (!"omitted".equals(methodRole)) {
            PHYSICS_METHOD_IDS.forEach(id -> entries.add(goalEntry(id, methodRole)));
        }
        Fixture fixture = fixture(Map.of(
                "viewId", "projection-role-test",
                "landscapeId", LANDSCAPE_ID,
                "rootNodes", entries));
        fixture.learner().setStrictMode(true);

        List<String> routeIds = new ArrayList<>(PHYSICS_METHOD_IDS);
        routeIds.add(SOLAR_SYSTEM_CLASSIFICATION_ID);
        routeIds.add(OPEN_COSMOLOGICAL_QUESTIONS_ID);
        routeIds.addAll(MASTERED_PHYSICS_CONTEXT_IDS);
        LearningGoal root = clusterGoal(ROOT_CLUSTER_ID, routeIds);
        root.setTags(List.of("root"));
        List<LearningGoal> goals = new ArrayList<>(List.of(root));
        ObjectMapper mapper = new ObjectMapper();
        // Keep the whole current canonical contracts. This fixture isolates the
        // Physics-method route, with its actual Mathematics preparation stored
        // separately; explicit POnly support does not enroll Mathematics targets.
        SkillLandscape canonicalPhysics = mapper.readValue(Path.of(
                "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json")
                .toFile(), SkillLandscape.class);
        SkillLandscape canonicalMathematics = mapper.readValue(Path.of(
                "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json")
                .toFile(), SkillLandscape.class);
        for (LearningGoal goal : canonicalPhysics.getGoals()) {
            if (routeIds.contains(goal.getId())) goals.add(goal);
        }
        when(fixture.landscapeService().getById(canonicalPhysics.getLandscapeId())).thenReturn(canonicalPhysics);
        when(fixture.landscapeService().getById(canonicalMathematics.getLandscapeId())).thenReturn(canonicalMathematics);
        for (LearningGoal goal : canonicalMathematics.getGoals()) {
            when(fixture.landscapeService().getGoalDefinition(goal.getId())).thenReturn(goal);
        }
        assertThat(goals).extracting(LearningGoal::getId)
                .containsAll(routeIds).hasSize(routeIds.size() + 1);
        fixture.landscape().setGoals(goals);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), ROOT_CLUSTER_ID)));
        return fixture;
    }

    private void assertPhysicsSourceRouteFrontier(
            Fixture fixture, Set<String> masteredMethods, String... expectedFrontier) {
        Map<String, Double> explicitMastery = new LinkedHashMap<>();
        MASTERED_PHYSICS_CONTEXT_IDS.forEach(id -> explicitMastery.put(id, 1.0));
        Set<String> mathematicsIds = fixture.landscapeService().getById(
                "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced").getGoals().stream()
                .map(LearningGoal::getId).collect(java.util.stream.Collectors.toSet());
        List<String> routeTargets = new ArrayList<>(PHYSICS_METHOD_IDS);
        routeTargets.add(SOLAR_SYSTEM_CLASSIFICATION_ID);
        routeTargets.add(OPEN_COSMOLOGICAL_QUESTIONS_ID);
        CanonicalPrerequisiteTestContext.withStoredPrerequisites(
                fixture.landscapeService(), routeTargets, List.of(), Set.of()).stream()
                .filter(mathematicsIds::contains).forEach(id -> explicitMastery.put(id, 1.0));
        PHYSICS_METHOD_IDS.forEach(id -> explicitMastery.put(id, masteredMethods.contains(id) ? 1.0 : 0.0));
        explicitMastery.put(SOLAR_SYSTEM_CLASSIFICATION_ID, 0.0);
        explicitMastery.put(OPEN_COSMOLOGICAL_QUESTIONS_ID, 0.0);
        List<Mastery> storedMastery = explicitMastery.entrySet().stream()
                .map(entry -> new Mastery(fixture.learner(), entry.getKey(), entry.getValue()))
                .toList();
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(storedMastery);

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .containsExactlyInAnyOrder(expectedFrontier);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(expectedFrontier);
        assertThat(fixture.service().getMastery(LEARNER_ID)).isEqualTo(explicitMastery);
        assertThat(storedMastery).allSatisfy(mastery ->
                assertThat(mastery.getValue()).isEqualTo(explicitMastery.get(mastery.getGoalKey())));
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.masteryRepository(), never()).saveAll(any());
        verify(fixture.masteryRepository(), never()).saveAndFlush(any(Mastery.class));
    }

    private Fixture fixture(Map<String, Object> matchedView) {
        SkillLandscape landscape = landscape();
        LandscapeService landscapeService = mock(LandscapeService.class);
        CompositionViewService compositionViewService = mock(CompositionViewService.class);
        LearnerRepository learnerRepository = mock(LearnerRepository.class);
        MasteryRepository masteryRepository = mock(MasteryRepository.class);
        PlannedGoalRepository plannedGoalRepository = mock(PlannedGoalRepository.class);
        GoalMappingService goalMappingService = mock(GoalMappingService.class);
        ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);

        when(landscapeService.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapeService.getClosure(LANDSCAPE_ID)).thenReturn(List.of(landscape));
        when(landscapeService.getOverview("de", true))
                .thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        when(compositionViewService.isAuthoritativeForLandscape(LANDSCAPE_ID))
                .thenReturn(true);
        if (matchedView != null) {
            when(compositionViewService.findLearnerScopeView(eq(LANDSCAPE_ID), anyMap()))
                    .thenReturn(matchedView);
            when(compositionViewService.findDefaultView(LANDSCAPE_ID))
                    .thenReturn(matchedView);
        }

        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum(LANDSCAPE_ID);
        learner.setPersonalCurriculum(PERSONAL_CURRICULUM);
        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.findBySkillpilotIdForUpdate(LEARNER_ID))
                .thenReturn(Optional.of(learner));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());

        List<PlannedGoal> savedGoals = new java.util.ArrayList<>();
        when(plannedGoalRepository.saveAll(
                        org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any()))
                .thenAnswer(invocation -> {
                    Iterable<PlannedGoal> goals = invocation.getArgument(0);
                    goals.forEach(savedGoals::add);
                    return savedGoals;
                });

        LearnerService service = new LearnerService(
                learnerRepository,
                mock(LearnerClientStateRepository.class),
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                mock(DeckResourceService.class),
                compositionViewService,
                new ObjectMapper(),
                eventPublisher,
                mock(PlatformTransactionManager.class));
        return new Fixture(
                service,
                learner,
                landscape,
                landscapeService,
                masteryRepository,
                compositionViewService,
                plannedGoalRepository,
                goalMappingService,
                eventPublisher,
                savedGoals);
    }

    private void assertInvalidProjectedFocus(
            org.assertj.core.api.ThrowableAssert.ThrowingCallable invocation,
            String invalidGoalId) {
        assertThatThrownBy(invocation)
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason())
                            .contains("learner-facing targets")
                            .contains(invalidGoalId);
                });
    }

    private SkillLandscape landscape() {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(LANDSCAPE_ID);
        landscape.setFrameworkId("canonical-gymnasium-projection-role-test");
        LearningGoal rootGoal = clusterGoal(
                ROOT_CLUSTER_ID,
                List.of(NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID));
        rootGoal.setTags(List.of("root"));
        landscape.setGoals(List.of(
                rootGoal,
                clusterGoal(
                        NESTED_CLUSTER_ID,
                        List.of(TARGET_ID, PREREQUISITE_ID)),
                atomicGoal(TARGET_ID, List.of(PREREQUISITE_ID)),
                atomicGoal(PREREQUISITE_ID, List.of(TRANSITIVE_PREREQUISITE_ID)),
                atomicGoal(TRANSITIVE_PREREQUISITE_ID, List.of()),
                atomicGoal(OUTSIDE_TARGET_ID, List.of())));
        return landscape;
    }

    private LearningGoal clusterGoal(String id, List<String> contains) {
        LearningGoal goal = atomicGoal(id, List.of());
        goal.setType("cluster");
        goal.setContains(contains);
        return goal;
    }

    private LearningGoal atomicGoal(String id, List<String> requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setType("atomic");
        goal.setTags(List.of());
        goal.setRequires(requires);
        goal.setContains(List.of());
        return goal;
    }

    private ExamData releasedExamData() {
        ExamData exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setTaskContent("Solve the reviewed assessment task.");
        exam.setSolutionContent("Reviewed solution.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(1.0);
        scoring.setPassingPoints(1.0);
        ExamData.Step step = new ExamData.Step();
        step.setId("s1");
        step.setPoints(1.0);
        step.setDescription("Reviewed scoring step");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        return exam;
    }

    private void addGlobalAssessmentBranch(Fixture fixture, List<String> examRequires) {
        LearningGoal root = clusterGoal(
                GLOBAL_ASSESSMENT_ROOT_ID,
                List.of(GLOBAL_ASSESSMENT_EXAM_ID));
        ReleaseMetadata release = new ReleaseMetadata();
        release.setKind("offer");
        release.setStatus("released");
        root.setRelease(release);

        LearningGoal exam = atomicGoal(GLOBAL_ASSESSMENT_EXAM_ID, examRequires);
        exam.setExamData(releasedExamData());

        List<LearningGoal> goals = new java.util.ArrayList<>(fixture.landscape().getGoals());
        goals.add(root);
        goals.add(exam);
        fixture.landscape().setGoals(goals);
    }

    private Map<String, Object> view(Map<String, Object>... entries) {
        return Map.of(
                "viewId", "projection-role-test",
                "landscapeId", LANDSCAPE_ID,
                "rootNodes", List.of(entries));
    }

    private Map<String, Object> goalEntry(String goalId) {
        return Map.of(
                "kind", "goalEntry",
                "goalId", goalId);
    }

    private Map<String, Object> goalEntry(String goalId, String projectionRole) {
        return Map.of(
                "kind", "goalEntry",
                "goalId", goalId,
                "projectionRole", projectionRole);
    }

    private Map<String, Object> canonicalSubtree(String goalId) {
        return Map.of(
                "kind", "canonicalSubtree",
                "goalId", goalId);
    }

    private Map<String, Object> canonicalSubtree(String goalId, String projectionRole) {
        return Map.of(
                "kind", "canonicalSubtree",
                "goalId", goalId,
                "projectionRole", projectionRole);
    }

    @SuppressWarnings("unchecked")
    private ProjectionSets projectionSets(LearnerService service) {
        return projectionSets(service, PERSONAL_CURRICULUM);
    }

    @SuppressWarnings("unchecked")
    private ProjectionSets projectionSets(LearnerService service, String personalCurriculum) {
        Object projection = ReflectionTestUtils.invokeMethod(
                service,
                "getGoalProjection",
                LANDSCAPE_ID,
                personalCurriculum);
        Set<String> targetGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
        Set<String> prerequisiteOnlyGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
        List<String> presentationRootGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds");
        Map<String, LearningGoal> visibleGoals =
                ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
        Map<String, LearningGoal> structuralGoals =
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
        return new ProjectionSets(
                targetGoalIds,
                prerequisiteOnlyGoalIds,
                presentationRootGoalIds,
                visibleGoals.keySet(),
                structuralGoals.keySet());
    }

    private record Fixture(
            LearnerService service,
            Learner learner,
            SkillLandscape landscape,
            LandscapeService landscapeService,
            MasteryRepository masteryRepository,
            CompositionViewService compositionViewService,
            PlannedGoalRepository plannedGoalRepository,
            GoalMappingService goalMappingService,
            ApplicationEventPublisher eventPublisher,
            List<PlannedGoal> savedGoals) {
    }

    private record ProjectionSets(
            Set<String> targetGoalIds,
            Set<String> prerequisiteOnlyGoalIds,
            List<String> presentationRootGoalIds,
            Set<String> visibleGoalIds,
            Set<String> structuralGoalIds) {
    }
}
