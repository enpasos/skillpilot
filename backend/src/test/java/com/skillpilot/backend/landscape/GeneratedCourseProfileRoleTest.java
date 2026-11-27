package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class GeneratedCourseProfileRoleTest {

    @Test
    void generatedCourseProfileViewsHaveZeroVoluntaryEntriesUntilCurriculumActivation() throws Exception {
        var properties = new LandscapeProperties();
        Path curricula = Path.of(properties.getDirectory()).toRealPath();
        properties.setDirectory(curricula.toString());
        var mapper = new ObjectMapper();
        var configuration = new RepositoryCurriculumConfiguration();
        var landscapes = configuration.repositoryLandscapeService(properties, mapper,
                configuration.repositoryGoalMappingService(properties, mapper));
        var views = configuration.repositoryCompositionViewService(properties, mapper, landscapes);

        record Request(String landscapeId, Map<String, String> scope) {}
        var selections = new LinkedHashSet<Request>();
        try (var files = Files.walk(curricula.resolve("DE/Gymnasium/composition-views"))) {
            for (Path file : files.filter(path -> path.toString().endsWith(".view.json")).sorted().toList()) {
                var view = mapper.readTree(file.toFile());
                var scope = mapper.convertValue(view.required("scope"), new TypeReference<Map<String, String>>() {});
                if (List.of("GK", "LK").contains(scope.getOrDefault("courseProfile", ""))) {
                    scope.put("courseProfile", "GK+LK");
                    selections.add(new Request(view.required("landscapeId").asText(), scope));
                }
            }
        }

        int generatedViews = 0;
        for (var selection : selections) {
            var view = views.findMatchingView(selection.landscapeId(), selection.scope());
            assertThat(view).as("combined course %s", selection).isNotNull();
            if (view.containsKey("mergedFromViewIds")) generatedViews++;
            JsonNode roots = mapper.valueToTree(view.get("rootNodes"));
            var roles = roots.findValuesAsText("projectionRole");
            assertThat(roles).as("runtime view %s", view.get("viewId")).doesNotContain("voluntary");
        }
        assertThat(generatedViews).as("combined scopes resolved through the repository runtime merger").isPositive();
    }
}
