package com.skillpilot.backend.landscape;

import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.nio.file.Path;
import java.util.List;

public class LandscapeDiagnosticTest {

    @Test
    public void testGymnasiumLoading() {
        System.out.println("=== START DIAGNOSTIC ===");

        // Point to the real curricula directory relative to backend module
        // backend is CWD for test usually? or project root?
        // Use absolute path to avoid CWD issues on Windows/WSL
        String curriculaPath = "\\\\wsl.localhost\\Ubuntu\\home\\enpasos\\projects\\skillpilot\\curricula";

        File dir = new File(curriculaPath);
        System.out.println("Curricula Directory: " + dir.getAbsolutePath());
        System.out.println("Exists: " + dir.exists());
        System.out.println("Is Directory: " + dir.isDirectory());

        LandscapeProperties props = new LandscapeProperties();
        props.setDirectory(curriculaPath);

        ObjectMapper mapper = new ObjectMapper();

        try {
            LandscapeService service = new LandscapeService(props, mapper);

            System.out.println("Loaded Landscapes Count: " + service.getAll().size());

            // Check for Mathematics
            // 2796fc7b-ba9d-446f-8f26-711dd6d8a9a3 -> DE_HES_S_GYM_2_MATHEMATIK
            LearningLandscape math = service.getById("2796fc7b-ba9d-446f-8f26-711dd6d8a9a3");
            System.out.println("Math Loaded: " + (math != null));
            if (math != null) {
                System.out.println("Math Goals Count: " + (math.getGoals() != null ? math.getGoals().size() : "null"));
                // Check if Math root goal is indexed
                String mathRootId = "ccf9569b-b0e4-4d76-98d5-65be461d4d76";
                String mappedId = service.getLandscapeIdForGoal(mathRootId);
                System.out.println("Math Root Indexed: " + (mappedId != null ? mappedId : "null"));
            }

            // Check closure
            System.out.println("--- Checking Closure ---");
            // bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da -> DE_HES_S_GYM_2_OVERVIEW
            List<LearningLandscape> closure = service.getClosure("bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da");
            System.out.println("Closure Size: " + closure.size());
            boolean mathInClosure = closure.stream()
                    .anyMatch(l -> "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3".equals(l.getLandscapeId()));
            System.out.println("Math in Closure: " + mathInClosure);

            // Check shared IDs (K1, K2 etc)
            String k1Id = "5e98e2f2-c53c-44ce-99af-af2dc755bd94"; // K1
            System.out.println("K1 Landscape Mapping: " + service.getLandscapeIdForGoal(k1Id));

            // Check if Oberstufe Math is ACTUALLY loaded
            // 2796fc7b-ba9d-446f-8f26-711dd6d8a9a3 -> DE_HES_S_GYM_2_MATHEMATIK
            LearningLandscape math2 = service.getById("2796fc7b-ba9d-446f-8f26-711dd6d8a9a3");
            System.out.println("Math Oberstufe Loaded: " + (math2 != null));

            // Check if Fächer ID is mapped correctly
            String faecherId = "ebe16767-b8ef-4978-b464-52d20adcd3c5";
            System.out.println("Fächer Landscape Mapping: " + service.getLandscapeIdForGoal(faecherId));

        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("=== END DIAGNOSTIC ===");
    }
}
