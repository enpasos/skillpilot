package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.io.File;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class GoalLoadingTest {

    // Mathematics Root ID
    private static final String MATH_ROOT_ID = "ccf9569b-b0e4-4d76-98d5-65be461d4d76";

    // The 5 suspect goals
    private static final Set<String> MISSING_GOALS = Set.of(
            "1194630c-8ddf-402e-9fa4-def3efd38e02",
            "840d3a44-3663-4102-b399-617e47e1c765",
            "d0bf8574-890e-4f55-ac80-c3167b7a5309",
            "5e4a153c-5f45-42eb-ac5e-9855984e29c2",
            "999c8b41-75b3-4a84-814d-4c2f129fe7df");

    @Test
    public void testGoalsAreLoaded() {
        System.out.println("Starting Goal Load Test...");

        // Setup Service manually to avoid full Spring Context
        String curriculaPath = "\\\\wsl.localhost\\Ubuntu\\home\\enpasos\\projects\\skillpilot\\curricula";
        LandscapeProperties props = new LandscapeProperties();
        props.setDirectory(curriculaPath);
        ObjectMapper mapper = new ObjectMapper();
        LandscapeService landscapeService = new LandscapeService(props, mapper);

        // 1. Verify Root is loaded
        LearningGoal root = landscapeService.getGoalDefinition(MATH_ROOT_ID);
        if (root == null) {
            System.err.println("❌ Mathematics root goal NOT found!");
        } else {
            System.out.println("Found root: " + root.getTitle());
        }

        // 2. Verify Missing Goals are indexable
        for (String id : MISSING_GOALS) {
            LearningGoal g = landscapeService.getGoalDefinition(id);
            if (g == null) {
                System.err.println("❌ Missing goal NOT found: " + id);
            } else {
                System.out.println("✅ Found goal: " + id + " (" + g.getTitle() + ")");
            }
        }
    }
}
