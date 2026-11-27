package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.composition.CompositionViewExtensions;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;

class CompositionViewExtensionProjectionTest {
    private static final Path EXAMPLES = Path.of("../contracts/composition-view/v1.3/examples/extensions");
    private static final String LEARNER = "neutral-extension-learner";
    private static final String SHARED = "49ea4d08-0a2e-588b-9949-e79dbea54f4c";
    private static final String BASE = "ae4451e3-59ad-5615-934a-aa8b52a1bfa3";
    private static final String A = "fc4110ab-abfe-51f2-bddd-cb66e6da244c";
    private static final String B = "4f04ea8f-35a1-53c1-b49e-e55b06ba3c66";
    private static final String C = "ba3149e9-b70a-5737-baf3-d25fce0d078d";
    private static final String D = "21c6a3c6-c41a-5053-a357-d3b4a8f5c84e";
    private static final String E = "6d83098b-e841-58c2-8d84-08098fe47775";
    private static final String F = "591912f5-188c-5df0-9f2e-8172aad47a60";

    @TempDir Path curriculum;
    private final ObjectMapper json = new ObjectMapper();
    private final Learner learner = new Learner();
    private CompositionViewService views;
    private LearnerService service;
    private SkillLandscape subject;

    @BeforeEach
    void prepare() throws Exception {
        subject = json.readValue(EXAMPLES.resolve("subject.json").toFile(), SkillLandscape.class);
        Path viewDir = Files.createDirectories(curriculum.resolve("DE/Gymnasium/composition-views"));
        for (String file : List.of("neutral.view.json", "neutral-lk.view.json")) {
            Files.copy(EXAMPLES.resolve(file), viewDir.resolve(file));
        }
        var properties = new LandscapeProperties();
        properties.setDirectory(curriculum.toString());
        views = new CompositionViewService(properties, json);
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getById(subject.getLandscapeId())).thenReturn(subject);
        when(landscapes.getAll()).thenReturn(List.of(subject));
        when(landscapes.getClosure(subject.getLandscapeId())).thenReturn(List.of(subject));
        when(landscapes.getClosure(eq(subject.getLandscapeId()), anyString())).thenReturn(List.of(subject));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenReturn(subject.getLandscapeId());
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(invocation -> subject.getGoals().stream()
                .filter(goal -> goal.getId().equals(invocation.getArgument(0))).findFirst().orElse(null));

        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(subject.getLandscapeId());
        learner.setAutoPilot(false);
        var learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        var plans = mock(PlannedGoalRepository.class);
        when(plans.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        var mastery = mock(MasteryRepository.class);
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        var mappings = mock(GoalMappingService.class);
        when(mappings.getAllMappings()).thenReturn(List.of());
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery, plans,
                landscapes, mappings, mock(DeckResourceService.class), views, json,
                mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
    }

    @Test
    void oldSelectionAndExplicitListUseDifferentSeedsWithoutDroppingRequiredPreparation() throws Exception {
        choose("GK", null);
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, D);

        choose("GK", List.of("B", "unavailable"));
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, B);
        SkillLandscape.PersonalCurriculumProjection result = service.getLearnerLandscapeClosure(
                LEARNER, subject.getLandscapeId(), "de").getFirst().getPersonalCurriculumProjection();
        assertThat(result.seedAtomicGoalIds()).containsExactlyInAnyOrder(BASE, SHARED, B);
        assertThat(result.targetGoalIds()).containsExactlyInAnyOrder(BASE, SHARED, B, A);
        assertThat(result.requiredByPaths()).containsEntry(A, List.of(BASE, A));
        assertThat(service.getFrontier(LEARNER)).contains(A).doesNotContain(BASE, C, D, E);
        assertThat(service.getMastery(LEARNER)).isEmpty();

        choose("GK+LK", List.of("B"));
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, B);

        choose("LK", List.of());
        assertThat(service.getLearnerLandscapeClosure(LEARNER, subject.getLandscapeId(), "de")
                .getFirst().getPersonalCurriculumProjection().seedAtomicGoalIds())
                .containsExactlyInAnyOrder(BASE, SHARED);
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A);

        choose("GK", "maximum");
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, D, E);
    }

    @Test
    void ordinaryPreparationKeepsItsExistingPlanningTreatment() throws Exception {
        Path gkPath = curriculum.resolve("DE/Gymnasium/composition-views/neutral.view.json");
        var gkSource = json.readValue(gkPath.toFile(), new TypeReference<Map<String, Object>>() {});
        var root = nodes(gkSource.get("rootNodes")).getFirst();
        var baseSection = nodes(root.get("children")).getFirst();
        nodes(baseSection.get("children")).add(Map.of(
                "kind", "goalEntry", "goalId", F, "projectionRole", "prerequisiteOnly"));
        json.writeValue(gkPath.toFile(), gkSource);
        subject.getGoals().stream().filter(goal -> BASE.equals(goal.getId())).findFirst().orElseThrow()
                .setRequires(List.of(A, F));

        choose("GK", List.of("B"));
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, B, F);
        assertThat(service.getFrontier(LEARNER)).contains(A, F);

        choose("GK", "maximum");
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, D, E, F);
    }

    @Test
    void profileMergePreservesBaseOccurrenceAndEffectiveOrder() {
        var merged = views.findLearnerScopeView(subject.getLandscapeId(), scope("GK+LK"));
        assertThat(CompositionViewExtensions.groups(merged)).hasSize(3);
        var selection = views.selectExtensionsForLearnerScope(merged, List.of("B", "D", "E"));
        var sections = views.findLearnerFacingFocusAncestors((String) merged.get("viewId"), SHARED,
                Map.of(SHARED, subject.getGoals().stream().filter(goal -> SHARED.equals(goal.getId())).findFirst().orElseThrow()),
                Map.of((String) merged.get("viewId"), selection.view()));
        assertThat(sections).extracting(CompositionViewService.CompositionStructureResolution::nodeId)
                .contains("core").doesNotContain("section-A");

        var selected = views.selectExtensionsForLearnerScope(views.findLearnerScopeView(subject.getLandscapeId(), scope("GK")),
                List.of("B", "D", "E")).view();
        var firstRoot = json.valueToTree(selected).path("rootNodes").get(0);
        assertThat(firstRoot.path("children")).extracting(node -> node.path("id").asText())
                .containsExactly("core", "section-B", "section-D", "section-E");
        assertThat(firstRoot.path("childOrder").path("after")).extracting(node -> node.path("unit").asText()
                + ":" + node.path("after").asText()).containsExactly("section-D:section-B", "section-E:section-D");
        assertThat(views.findViewById("neutral-gk")).isNotEqualTo(selected);
    }

    @Test
    void maximumAutomaticallyIncludesLaterExtensions() {
        var view = views.findViewById("neutral-gk");
        var expanded = json.convertValue(view, new TypeReference<Map<String, Object>>() {});
        var root = nodes(expanded.get("rootNodes")).getFirst();
        var children = new ArrayList<>(nodes(root.get("children")));
        children.add(Map.of("kind", "structure", "id", "section-F", "label", "Thema F", "labelEn", "Topic F",
                "extension", Map.of("id", "F", "groupId", "deepening", "previouslyRegular", false),
                "children", List.of(Map.of("kind", "goalEntry", "goalId", F))));
        root.put("children", children);
        assertThat(CompositionViewExtensions.groups(expanded).getLast().extensions()).extracting(CompositionViewExtensions.Extension::id)
                .containsExactly("E", "F");
        assertThat(views.selectExtensionsForLearnerScope(expanded, "maximum").excludedNodes()).isEmpty();
        assertThat(views.selectExtensionsForLearnerScope(expanded, List.of("E")).excludedNodes())
                .extracting(node -> node.get("id")).contains("section-F");
    }

    @Test
    void rejectsInvalidMembershipRolesAndConflictingProfileDeclarations() {
        var view = freshView();
        Map<String, Object> sectionA = nodes(nodes(view.get("rootNodes")).getFirst().get("children")).get(1);
        sectionA.put("extension", Map.of("id", "A", "groupId", "missing", "previouslyRegular", true));
        assertThatThrownBy(() -> CompositionViewExtensions.groups(view)).hasMessageContaining("unknown group");

        var badRole = freshView();
        var core = nodes(nodes(badRole.get("rootNodes")).getFirst().get("children")).getFirst();
        nodes(core.get("children")).getFirst().put("projectionRole", "voluntary");
        assertThatThrownBy(() -> CompositionViewExtensions.groups(badRole)).hasMessageContaining("projectionRole");

        var nested = freshView();
        var children = nodes(nodes(nested.get("rootNodes")).getFirst().get("children"));
        nodes(children.get(1).get("children")).add(children.get(2));
        assertThatThrownBy(() -> CompositionViewExtensions.groups(nested)).hasMessageContaining("non-nested");

        var conflict = freshView();
        nodes(conflict.get("electionGroups")).getFirst().put("label", "different");
        assertThatThrownBy(() -> CompositionViewExtensions.mergeGroups(List.of(freshView(), conflict)))
                .hasMessageContaining("conflicting group");

        var conflictingMember = freshView();
        var member = nodes(nodes(conflictingMember.get("rootNodes")).getFirst().get("children")).get(1);
        member.put("extension", Map.of("id", "A", "groupId", "topics", "previouslyRegular", false));
        assertThatThrownBy(() -> CompositionViewExtensions.mergeGroups(List.of(freshView(), conflictingMember)))
                .hasMessageContaining("conflicting extension A");

        var duplicate = freshView();
        var duplicateChildren = nodes(nodes(duplicate.get("rootNodes")).getFirst().get("children"));
        duplicateChildren.get(2).put("extension", duplicateChildren.get(1).get("extension"));
        assertThatThrownBy(() -> CompositionViewExtensions.groups(duplicate)).hasMessageContaining("duplicate extension A");
    }

    @Test
    void repositoryRejectsExtensionMarkersOnRelabeledOrUnversionedSource() throws Exception {
        Path path = curriculum.resolve("DE/Gymnasium/composition-views/neutral.view.json");
        var source = json.readValue(path.toFile(), new TypeReference<Map<String, Object>>() {});
        source.remove("viewFormatVersion");
        assertRejectedRepositorySource(path, source, "root");

        source.remove("$schema");
        source.put("viewFormatVersion", "1.2");
        assertRejectedRepositorySource(path, source, "root");

        source.remove("electionGroups");
        assertRejectedRepositorySource(path, source, "rootNodes[0].children[1]");
    }

    private void assertRejectedRepositorySource(Path path, Map<String, Object> source, String nodePath) throws Exception {
        json.writeValue(path.toFile(), source);
        assertThatThrownBy(() -> views.findViewById("neutral-gk"))
                .hasMessageContaining("require composition view 1.3")
                .hasMessageContaining(path.toString())
                .hasMessageEndingWith(" " + nodePath);
    }

    private Map<String, Object> freshView() {
        return json.convertValue(views.findViewById("neutral-gk"), new TypeReference<Map<String, Object>>() {});
    }

    private void choose(String profile, Object selection) throws Exception {
        var entry = new LinkedHashMap<String, Object>(Map.of("selected", true, "filterId", profile, "stage", "SekII"));
        if (selection != null) entry.put("extensionSelection", selection);
        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(subject.getLandscapeId(), entry)));
    }

    private List<String> planningTargets() {
        return service.getPlanningScope(LEARNER, subject.getLandscapeId()).scopeAtomicGoalIds();
    }

    private static Map<String, String> scope(String profile) {
        return Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", profile);
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> nodes(Object raw) {
        return (List<Map<String, Object>>) raw;
    }
}
