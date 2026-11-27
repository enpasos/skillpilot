package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.SkillpilotApplication;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.io.IOException;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

public class DeclaredCourseUnitsTest {
    private static final String COURSE = "01be24fc-71de-4a7d-b184-b3ed25dcb0c1";
    private static final String PARENT_ALIAS = "339413f5-bab8-45ff-9d7a-a0f139f2ce53";
    private static final String CHILD_OPENING = "516d638b-d7b3-4706-8b5f-71001a304ba2";
    private static final String CHILD_GOAL = "105efecc-09f5-419f-a6d3-b5f493c1921e";
    private static final String CHILD_ALIAS = "f6816392-245d-425e-9db2-a8566378488a";
    private static final String ADDED_GOAL = "d8500e89-b8c0-41cb-9b16-d9f1f0def602";
    private final ObjectMapper mapper = new SkillpilotApplication().objectMapper();

    @TempDir Path directory;

    @Test
    void aSavedUnitReferenceSurvivesReloadWithANewGoalAndMatchingCluster() throws Exception {
        ObjectNode authored = loadFixture();
        LandscapeService landscapes = stage(authored);
        var before = build(landscapes.getById(COURSE));
        var child = before.path(CHILD_GOAL).getFirst();
        var parent = before.path(CHILD_GOAL).getLast();
        assertThat(before.focus(PARENT_ALIAS)).isEqualTo(parent);
        assertThat(parent.focusId()).isNotEqualTo(PARENT_ALIAS);
        assertThat(before.focus(CHILD_ALIAS)).isNull();

        addChildCluster(authored, ADDED_GOAL);
        authored.withArray("goals").addObject().put("id", ADDED_GOAL).put("type", "atomic").put("title", "Added goal");
        authored.withArray("goalPlacements").addObject().put("goalId", ADDED_GOAL).put("unitId", "child").put("relation", "own");
        mapper.writeValue(directory.resolve("course.en.json").toFile(), authored);
        landscapes.pinRuntimeGeneration();

        var after = build(landscapes.getById(COURSE));
        var reloadedChild = after.focus(child.focusId());
        assertThat(reloadedChild).isNotNull();
        assertThat(reloadedChild.focusId()).isEqualTo(child.focusId());
        assertThat(reloadedChild.scopeId()).isEqualTo(child.scopeId());
        assertThat(reloadedChild.atoms()).containsExactlyInAnyOrder(CHILD_OPENING, CHILD_GOAL, ADDED_GOAL);
        assertThat(after.focus(CHILD_ALIAS)).isEqualTo(reloadedChild);
        assertThat(after.focus(PARENT_ALIAS).focusId()).isEqualTo(parent.focusId());
    }

    @Test
    void equalAtomSetsKeepDistinctReferencesAndDoNotInventAnOpeningOrAnAlias() throws Exception {
        ObjectNode authored = loadFixture();
        authored.withArray("programUnits").addObject()
                .put("id", "wrapper").put("kind", "learningUnit").put("label", "Child wrapper").put("parentUnitId", "parent");
        objectById(authored, "programUnits", "child").put("parentUnitId", "wrapper");
        addChildCluster(authored);

        var units = build(stage(authored).getById(COURSE));
        var path = units.path(CHILD_GOAL);
        assertThat(path).extracting(DeclaredCourseUnits.Unit::label)
                .containsExactly("Child unit", "Child wrapper", "Parent unit");
        var child = path.get(0);
        var wrapper = path.get(1);
        assertThat(wrapper.atoms()).isEqualTo(child.atoms());
        assertThat(wrapper.focusId()).isNotEqualTo(child.focusId());
        assertThat(wrapper.scopeId()).isNotEqualTo(child.scopeId());
        assertThat(wrapper.openingId()).isNull();
        assertThat(child.openingId()).isEqualTo(CHILD_OPENING);
        assertThat(units.focus(wrapper.focusId())).isEqualTo(wrapper);
        assertThat(units.focus(child.focusId())).isEqualTo(child);
        assertThat(units.focus(CHILD_ALIAS)).isNull();
    }

    /** The prior catalog gave Child an exact canonical cluster alias. */
    public static String childFocusFromPriorCatalog(Path directory) throws IOException {
        ObjectMapper mapper = new SkillpilotApplication().objectMapper();
        ObjectNode landscape = loadFixture(mapper);
        addChildCluster(landscape);
        SkillLandscape prior = stage(landscape, directory, mapper).getById(COURSE);
        return build(prior).focus(CHILD_ALIAS).focusId();
    }

    private static void addChildCluster(ObjectNode landscape, String... newAtoms) {
        var parent = objectById(landscape, "goals", PARENT_ALIAS).withArray("contains");
        for (int i = parent.size() - 1; i >= 0; i--) {
            if (List.of(CHILD_OPENING, CHILD_GOAL).contains(parent.get(i).asText())) parent.remove(i);
        }
        parent.add(CHILD_ALIAS);
        var children = landscape.withArray("goals").addObject().put("id", CHILD_ALIAS).put("type", "cluster")
                .put("title", "Child cluster").putArray("contains").add(CHILD_OPENING).add(CHILD_GOAL);
        for (String atom : newAtoms) children.add(atom);
    }

    private static ObjectNode objectById(ObjectNode landscape, String key, String id) {
        for (JsonNode item : landscape.withArray(key)) {
            if (id.equals(item.path("id").asText())) return (ObjectNode) item;
        }
        throw new AssertionError("Missing " + id);
    }

    private ObjectNode loadFixture() throws IOException {
        return loadFixture(mapper);
    }

    private static ObjectNode loadFixture(ObjectMapper mapper) throws IOException {
        try (var stream = DeclaredCourseUnitsTest.class.getResourceAsStream("/declared-unit-course/json/course.en.json")) {
            return (ObjectNode) mapper.readTree(stream);
        }
    }

    private LandscapeService stage(ObjectNode landscape) throws IOException {
        return stage(landscape, directory, mapper);
    }

    private static LandscapeService stage(ObjectNode landscape, Path directory, ObjectMapper mapper) throws IOException {
        mapper.writeValue(directory.resolve("course.en.json").toFile(), landscape);
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new LandscapeService(properties, mapper);
    }

    private static DeclaredCourseUnits build(SkillLandscape landscape) {
        Map<String, LearningGoal> goals = landscape.getGoals().stream()
                .collect(Collectors.toMap(LearningGoal::getId, Function.identity()));
        return DeclaredCourseUnits.build(List.of(landscape), goals, goals.keySet(), ignored -> false,
                id -> atoms(id, goals));
    }

    private static Set<String> atoms(String id, Map<String, LearningGoal> goals) {
        LearningGoal goal = goals.get(id);
        if (LearnerService.isAtomicGoal(goal)) return Set.of(id);
        var result = new LinkedHashSet<String>();
        goal.getContains().forEach(child -> result.addAll(atoms(child, goals)));
        return result;
    }
}
