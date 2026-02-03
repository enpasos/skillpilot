package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Set;

public class ClosureTest {

    // Gymnasiale Oberstufe (Hessen)
    private static final String OVERVIEW_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    // Mathe Landscape ID
    private static final String MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3"; // inferred from filename
                                                                                            // DE_HES_S_GYM_2_MATHEMATIK.de.json
                                                                                            // if possible, or we check
                                                                                            // if it's in closure

    // One of the missing goals
    private static final String MISSING_GOAL_ID = "1194630c-8ddf-402e-9fa4-def3efd38e02";

    @Test
    public void testClosure() {
        System.out.println("Starting Closure Test...");

        String curriculaPath = "\\\\wsl.localhost\\Ubuntu\\home\\enpasos\\projects\\skillpilot\\curricula";
        LandscapeProperties props = new LandscapeProperties();
        props.setDirectory(curriculaPath);
        ObjectMapper mapper = new ObjectMapper();
        LandscapeService service = new LandscapeService(props, mapper);

        // 1. Get Closure of Overview
        List<LearningLandscape> closure = service.getClosure(OVERVIEW_ID);
        System.out.println("Closure size: " + closure.size());

        boolean mathFound = false;
        boolean goalFound = false;

        for (LearningLandscape l : closure) {
            if (l.getTitle().contains("Mathematik")) {
                mathFound = true;
                System.out.println("Found Math Landscape: " + l.getTitle() + " (" + l.getLandscapeId() + ")");
            }

            if (l.getGoals() != null) {
                for (LearningGoal g : l.getGoals()) {
                    if (MISSING_GOAL_ID.equals(g.getId())) {
                        goalFound = true;
                        System.out.println("✅ Found Missing Goal in Landscape: " + l.getLandscapeId());
                    }
                }
            }
        }

        if (!mathFound)
            System.err.println("❌ Mathematics Landscape NOT found in closure!");
        if (!goalFound)
            System.err.println("❌ Missing Goal " + MISSING_GOAL_ID + " NOT found in closure!");

        if (mathFound && goalFound) {
            System.out.println("SUCCESS: Goal is reachable via closure.");
        }
    }
}
