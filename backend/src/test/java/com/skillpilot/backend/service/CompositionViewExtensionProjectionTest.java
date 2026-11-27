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
    void basisRetainsPreviouslyRegularMembersOfPositiveMinimumGroups() throws Exception {
        choose("GK", null);
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, D);

        choose("GK", List.of());
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C);

        choose("GK", "maximum");
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, D, E);
    }

    @Test
    void basisDropsAZeroMinimumBlockButKeepsItsRequiredPreparation() throws Exception {
        Path gkPath = curriculum.resolve("DE/Gymnasium/composition-views/neutral.view.json");
        var gkSource = json.readValue(gkPath.toFile(), new TypeReference<Map<String, Object>>() {});
        var root = nodes(gkSource.get("rootNodes")).getFirst();
        var baseSection = nodes(root.get("children")).getFirst();
        nodes(baseSection.get("children")).add(Map.of(
                "kind", "goalEntry", "goalId", F, "projectionRole", "prerequisiteOnly"));
        json.writeValue(gkPath.toFile(), gkSource);
        subject.getGoals().stream().filter(goal -> BASE.equals(goal.getId())).findFirst().orElseThrow()
                .setRequires(List.of(D, F));

        choose("GK", List.of());
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, F);
        assertThat(service.getFrontier(LEARNER)).contains(D, F).doesNotContain(BASE, E);

        choose("GK", "maximum");
        assertThat(planningTargets()).containsExactlyInAnyOrder(BASE, SHARED, A, B, C, D, E, F);
    }

    @Test
    void onlyBasisAndMaximumMayBeStoredExplicitly() {
        CompositionViewExtensions.validateStoredSelection(List.of());
        CompositionViewExtensions.validateStoredSelection("maximum");
        for (Object invalid : List.of("A", "basis", List.of("A"), List.of(List.of()), Map.of("value", "maximum"))) {
            assertThatThrownBy(() -> CompositionViewExtensions.validateStoredSelection(invalid))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThatThrownBy(() -> CompositionViewExtensions.validateStoredSelection(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void profileMergePreservesBaseOccurrenceAndEffectiveOrder() {
        var merged = views.findLearnerScopeView(subject.getLandscapeId(), scope("GK+LK"));
        assertThat(CompositionViewExtensions.groups(merged)).hasSize(3);
        var selection = views.selectExtensionsForLearnerScope(merged, List.of());
        var sections = views.findLearnerFacingFocusAncestors((String) merged.get("viewId"), SHARED,
                Map.of(SHARED, subject.getGoals().stream().filter(goal -> SHARED.equals(goal.getId())).findFirst().orElseThrow()),
                Map.of((String) merged.get("viewId"), selection.view()));
        assertThat(sections).extracting(CompositionViewService.CompositionStructureResolution::nodeId)
                .contains("core").doesNotContain("section-D");

        var selected = views.selectExtensionsForLearnerScope(views.findLearnerScopeView(subject.getLandscapeId(), scope("GK")),
                List.of()).view();
        var firstRoot = json.valueToTree(selected).path("rootNodes").get(0);
        assertThat(firstRoot.path("children")).extracting(node -> node.path("id").asText())
                .containsExactly("core", "section-A", "section-B", "section-C");
        assertThat(firstRoot.path("childOrder").path("after")).extracting(node -> node.path("unit").asText()
                + ":" + node.path("after").asText()).containsExactly("section-B:section-A", "section-C:section-B");
        assertThat(views.findViewById("neutral-gk")).isNotEqualTo(selected);
    }

    @Test
    void basisProjectsOrderAcrossADroppedIntermediateSection() {
        var view = freshView();
        var children = nodes(nodes(view.get("rootNodes")).getFirst().get("children"));
        children.getLast().put("extension", Map.of("id", "E", "groupId", "topics", "previouslyRegular", true));

        var selected = views.selectExtensionsForLearnerScope(view, List.of()).view();
        var root = json.valueToTree(selected).path("rootNodes").get(0);
        assertThat(root.path("children")).extracting(node -> node.path("id").asText())
                .containsExactly("core", "section-A", "section-B", "section-C", "section-E");
        assertThat(root.path("childOrder").path("after")).extracting(node -> node.path("unit").asText()
                + ":" + node.path("after").asText())
                .containsExactly("section-B:section-A", "section-C:section-B", "section-E:section-C");
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
        assertThat(views.selectExtensionsForLearnerScope(expanded, List.of()).excludedNodes())
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
    void rejectsConflictAcrossDurationsBeforeAnyViewIsSelected() throws Exception {
        var g8 = readSource("neutral.view.json");
        var g9 = readSource("neutral.view.json");
        g8.put("scope", Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII",
                "courseProfile", "GK", "durationModel", "G8"));
        g9.put("scope", Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII",
                "courseProfile", "GK", "durationModel", "G9"));
        g9.put("viewId", "neutral-g9");
        nodes(nodes(g9.get("rootNodes")).getFirst().get("children")).get(4).put("labelEn", "Another topic");
        writeSource("neutral.view.json", g8);
        writeSource("neutral-g9.view.json", g9);

        assertThatThrownBy(() -> views.findViewById("neutral-gk"))
                .hasMessageContaining("DE-HE").hasMessageContaining("neutral-g9")
                .hasMessageContaining("conflicting extension D");
    }

    @Test
    void sharedExtensionCountsOnceAndRetainsBothProfilePlacementsAndTheirOrder() throws Exception {
        var lk = readSource("neutral-lk.view.json");
        nodes(lk.get("rootNodes")).getFirst().put("id", "different-parent");
        nodes(nodes(lk.get("rootNodes")).getFirst().get("children")).getFirst().put("id", "lk-core");
        writeSource("neutral-lk.view.json", lk);

        var merged = views.findLearnerScopeView(subject.getLandscapeId(), scope("GK+LK"));
        assertThat(CompositionViewExtensions.groups(merged).stream().filter(group -> group.id().equals("optional"))
                .findFirst().orElseThrow().extensions()).extracting(CompositionViewExtensions.Extension::id)
                .containsExactly("D");
        assertThat(json.valueToTree(merged).path("rootNodes")).allSatisfy(root ->
                assertThat(root.path("childOrder").path("after"))
                        .anySatisfy(pair -> assertThat(pair.path("unit").asText()).startsWith("section-E")));
        var basis = views.selectExtensionsForLearnerScope(merged, List.of());
        assertThat(basis.excludedNodes()).extracting(node -> (Map<?, ?>) node.get("extension"))
                .filteredOn(definition -> "D".equals(definition.get("id"))).hasSize(2);
    }

    @Test
    void mixedProfileRetainsLegacyRegularOccurrenceOfAnExtension() throws Exception {
        var lk = readSource("neutral-lk.view.json");
        lk.put("viewFormatVersion", "1.2");
        lk.put("$schema", "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json");
        lk.remove("electionGroups");
        nodes(nodes(lk.get("rootNodes")).getFirst().get("children")).forEach(node -> node.remove("extension"));
        writeSource("neutral-lk.view.json", lk);

        assertThat(views.findLearnerScopeView(subject.getLandscapeId(), scope("LK")))
                .containsEntry("viewFormatVersion", "1.2");
        var merged = views.findLearnerScopeView(subject.getLandscapeId(), scope("GK+LK"));
        assertThat(merged).containsEntry("viewFormatVersion", "1.3");
        var basis = views.selectExtensionsForLearnerScope(merged, List.of());
        assertThat(json.valueToTree(basis.view()).path("rootNodes").get(0).path("children"))
                .extracting(node -> node.path("id").asText()).contains("section-D", "section-E");
        assertThat(basis.excludedNodes()).extracting(node -> node.get("id")).hasSize(2);
    }

    @Test
    void combinedBasisRestoresRoleSpecificSupportWhenTheOtherProfileLosesItsTarget() throws Exception {
        var gk = readSource("neutral.view.json");
        gk.put("electionGroups", List.of());
        gk.put("rootNodes", List.of(
                Map.of("kind", "canonicalSubtree", "goalId", BASE),
                Map.of("kind", "goalEntry", "goalId", D, "projectionRole", "prerequisiteOnly"),
                Map.of("kind", "structure", "id", "acquisition", "label", "Preparation",
                        "children", List.of(Map.of("kind", "goalEntry", "goalId", D,
                                "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true)))));
        writeSource("neutral.view.json", gk);

        var lk = readSource("neutral-lk.view.json");
        lk.put("electionGroups", List.of(Map.of("id", "deepening", "label", "Vertiefung", "labelEn", "Extension",
                "origin", "skillpilot", "minSelections", 0)));
        lk.put("rootNodes", List.of(Map.of("kind", "structure", "id", "optional-target", "label", "Vertiefung",
                "labelEn", "Extension", "extension", Map.of("id", "optional-target", "groupId", "deepening",
                        "previouslyRegular", true),
                "children", List.of(Map.of("kind", "canonicalSubtree", "goalId", SHARED)))));
        writeSource("neutral-lk.view.json", lk);

        var properties = new LandscapeProperties();
        properties.setDirectory(curriculum.toString());
        var viewService = new CompositionViewService(properties, json,
                () -> Map.of(BASE, List.of(D), SHARED, List.of(D), D, List.of()));
        var merged = viewService.findLearnerScopeView(subject.getLandscapeId(), scope("GK+LK"));
        assertThat(json.valueToTree(merged).findValuesAsText("goalId")).doesNotContain(D);

        var basis = viewService.selectExtensionsForLearnerScope(merged, List.of());
        assertThat(json.valueToTree(basis.view()).findValuesAsText("goalId")).contains(D).doesNotContain(SHARED);
        assertThat(json.valueToTree(basis.view()).findValuesAsText("projectionRole"))
                .containsOnly("prerequisiteOnly");
    }

    @Test
    void positiveMinimumRequiresEnoughPreviouslyRegularMembers() {
        var view = freshView();
        nodes(view.get("electionGroups")).getFirst().put("minSelections", 4);
        assertThatThrownBy(() -> CompositionViewExtensions.groups(view))
                .hasMessageContaining("previously regular extensions do not satisfy minimum");
    }

    private Map<String, Object> readSource(String file) throws Exception {
        return json.readValue(curriculum.resolve("DE/Gymnasium/composition-views").resolve(file).toFile(),
                new TypeReference<Map<String, Object>>() {});
    }

    private void writeSource(String file, Map<String, Object> source) throws Exception {
        json.writeValue(curriculum.resolve("DE/Gymnasium/composition-views").resolve(file).toFile(), source);
    }

    @Test
    void hessianHistoricalAssessmentPlacementsFollowAllThreeSelectionStates() {
        var view = historicalAssessmentView();
        var roots = nodes(view.get("rootNodes"));
        var groups = CompositionViewExtensions.groups(view);
        assertThat(groups.getFirst().extensions()).extracting(CompositionViewExtensions.Extension::id)
                .containsExactly("physics-he-e1-experimental-assessments");

        var absent = views.selectExtensionsForLearnerScope(view, null);
        assertThat(absent.view()).isSameAs(view);
        assertThat(absent.excludedNodes()).isEmpty();

        var basis = views.selectExtensionsForLearnerScope(view, List.of());
        assertThat(basis.excludedNodes()).extracting(node -> node.get("goalId"))
                .containsExactly("f41e4e30-794e-5ce4-ba5e-cc72712cd691", "c6e2942d-1ff4-5e86-a52a-4ca4c8568291",
                        "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9");
        assertThat(nodes(basis.view().get("rootNodes"))).isEmpty();

        var everything = views.selectExtensionsForLearnerScope(view, "maximum");
        assertThat(everything.excludedNodes()).extracting(node -> node.get("goalId"))
                .containsExactly("bcc56921-7107-5f5f-b721-3d5e0d7e1cd9");
        assertThat(nodes(everything.view().get("rootNodes"))).containsExactly(roots.get(0), roots.get(1));
    }

    @Test
    void historicalMigrationCannotMarkAnotherLandOrAnotherParent() {
        var otherLand = historicalAssessmentView();
        otherLand.put("scope", Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-BY", "stage", "SekII"));
        assertThatThrownBy(() -> CompositionViewExtensions.groups(otherLand))
                .hasMessageContaining("restricted to Hessian Physics");

        var changedPlacement = historicalAssessmentView();
        nodes(changedPlacement.get("rootNodes")).getFirst().put("id", "wrong-parent");
        assertThatThrownBy(() -> CompositionViewExtensions.groups(changedPlacement))
                .hasMessageContaining("changed or repeated historical assessment placement");
    }

    private static Map<String, Object> historicalAssessmentView() {
        var series = Map.of("goalId", "f41e4e30-794e-5ce4-ba5e-cc72712cd691",
                "parentId", "physics-e1-accelerated-and-free-fall");
        var protocol = Map.of("goalId", "c6e2942d-1ff4-5e86-a52a-4ca4c8568291",
                "parentId", "physics-he-ephase-cross-topic-assessments");
        var exam = Map.of("goalId", "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9",
                "parentId", "physics-e1-two-motions");
        var migration = Map.of("migration", "he-physik-e1-20261127", "extension", Map.of(
                    "id", "physics-he-e1-experimental-assessments", "groupId", "physics-he-skillpilot-extensions",
                    "label", "Eigene Messungen", "labelEn", "Independent measurements",
                    "placements", List.of(series, protocol)),
                "legacyOnly", exam);
        var sections = List.of(series, protocol, exam).stream().map(placement -> new LinkedHashMap<String, Object>(
                Map.of("kind", "structure", "id", placement.get("parentId"), "label", "Abschnitt",
                        "children", List.of(Map.of("kind", "canonicalSubtree", "goalId", placement.get("goalId"))))))
                .toList();
        return new LinkedHashMap<>(Map.of("viewFormatVersion", "1.3", "$schema", CompositionViewExtensions.SCHEMA,
                "language", "de", "landscapeId", "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a",
                "scope", Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII"),
                "historicalAssessmentPlacements", migration, "rootNodes", sections,
                "electionGroups", List.of(Map.of("id", "physics-he-skillpilot-extensions", "label", "Vertiefung",
                        "labelEn", "Extension", "origin", "skillpilot", "minSelections", 0))));
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
