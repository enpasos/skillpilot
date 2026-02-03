package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

public class GoalIdMappingTest {

    private static final String[] SUSPECT_IDS = {
            "1194630c-8ddf-402e-9fa4-def3efd38e02",
            "840d3a44-3663-4102-b399-617e47e1c765",
            "d0bf8574-890e-4f55-ac80-c3167b7a5309",
            "5e4a153c-5f45-42eb-ac5e-9855984e29c2",
            "999c8b41-75b3-4a84-814d-4c2f129fe7df"
    };

    @Test
    public void testGoalIdMapping() {
        String curriculaPath = "/home/enpasos/projects/skillpilot/curricula";
        LandscapeProperties props = new LandscapeProperties();
        props.setDirectory(curriculaPath);
        ObjectMapper mapper = new ObjectMapper();
        LandscapeService service = new LandscapeService(props, mapper);

        System.out.println("===== Goal ID to Landscape ID Mapping Test =====");

        int found = 0;
        for (String id : SUSPECT_IDS) {
            String landscapeId = service.getLandscapeIdForGoal(id);
            if (landscapeId != null) {
                System.out.println("✅ Goal " + id + " -> Landscape " + landscapeId);
                found++;
            } else {
                System.err.println("❌ Goal " + id + " NOT FOUND in goalIdToLandscapeId map!");
            }
        }

        System.out.println("\nFound: " + found + " / " + SUSPECT_IDS.length);
    }
}
