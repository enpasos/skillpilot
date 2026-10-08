// SPDX-License-Identifier: Apache-2.0
// Technical probe using unchanged ordinary backend loaders and projection APIs.
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.LearnerService;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.*;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

public class ActualReviewedBiologyScopeProjection {
    static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    static final String BIO = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    static final String RESP = "0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38";
    static final String COUPLING = "32483d30-2162-50a5-a6cc-05b7f2467ab1";
    static final Set<String> RESP_COUNTRIES = Set.of("DE-BB", "DE-BE", "DE-MV", "DE-NW", "DE-SH", "DE-SN", "DE-ST", "DE-TH");
    static final List<String> COUNTRIES = List.of("DE-BB", "DE-BE", "DE-BW", "DE-BY", "DE-HB", "DE-HE", "DE-HH", "DE-MV", "DE-NI", "DE-NW", "DE-RP", "DE-SH", "DE-SL", "DE-SN", "DE-ST", "DE-TH");

    static LearnerService service(LandscapeProperties viewProperties, LandscapeService landscapes, GoalMappingService mappings, ObjectMapper mapper) {
        CompositionViewService views = new CompositionViewService(viewProperties, mapper, () -> {
            Map<String, List<String>> graph = new LinkedHashMap<>();
            for (var landscape : landscapes.getAll()) for (var goal : landscape.getGoals())
                graph.put(goal.getId(), goal.getContains() == null ? List.of() : goal.getContains());
            return graph;
        });
        PlatformTransactionManager transactionManager = new PlatformTransactionManager() {
            public TransactionStatus getTransaction(TransactionDefinition definition) { return new SimpleTransactionStatus(); }
            public void commit(TransactionStatus status) {}
            public void rollback(TransactionStatus status) {}
        };
        return new LearnerService(null, null, null, null, landscapes, mappings, null, views, mapper, null, transactionManager);
    }

    static String config(String country, String duration, String stage, String course) {
        return "{\"" + ROOT + "\":{\"selected\":true,\"filterId\":\"" + country + "\"},"
            + "\"__skillpilot_stage_scope_sek1__\":{\"selected\":" + stage.equals("SekI") + "},"
            + "\"__skillpilot_stage_scope_sek2__\":{\"selected\":" + stage.equals("SekII") + "},"
            + "\"" + BIO + "\":{\"selected\":true,\"filterId\":\"" + course + "\",\"durationModel\":\"" + duration + "\"}}";
    }

    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        LandscapeProperties live = new LandscapeProperties();
        live.setDirectory(Path.of(args[0]).toAbsolutePath().toString());
        GoalMappingService mappings = new GoalMappingService(live, mapper);
        LandscapeService landscapes = new LandscapeService(live, mapper, mappings);
        LandscapeProperties beforeProperties = new LandscapeProperties();
        beforeProperties.setDirectory(Path.of(args[1]).toAbsolutePath().toString());
        LandscapeProperties afterProperties = new LandscapeProperties();
        afterProperties.setDirectory(Path.of(args[2]).toAbsolutePath().toString());
        LearnerService before = service(beforeProperties, landscapes, mappings, mapper);
        LearnerService after = service(afterProperties, landscapes, mappings, mapper);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String country : COUNTRIES) for (String duration : List.of("G8", "G9")) for (String stage : List.of("SekI", "SekII")) for (String course : stage.equals("SekI") ? List.of("GK") : List.of("GK", "LK")) {
            String configuration = config(country, duration, stage, course);
            Set<String> oldTargets = new TreeSet<>(before.getFilteredAtomicGoalIds(ROOT, configuration, null, false));
            Set<String> targets = new TreeSet<>(after.getFilteredAtomicGoalIds(ROOT, configuration, null, false));
            Set<String> added = new TreeSet<>(targets); added.removeAll(oldTargets);
            Set<String> removed = new TreeSet<>(oldTargets); removed.removeAll(targets);
            Set<String> expected = new TreeSet<>();
            if (stage.equals("SekI") && RESP_COUNTRIES.contains(country)) expected.add(RESP);
            if (stage.equals("SekI") && country.equals("DE-SN")) expected.add(COUPLING);
            if (!added.equals(expected) || !removed.isEmpty()) throw new AssertionError(country + " " + duration + " " + stage + " " + course + " actual added=" + added + " removed=" + removed + " expected=" + expected);
            if (stage.equals("SekI") && (targets.contains(RESP) != RESP_COUNTRIES.contains(country) || targets.contains(COUPLING) != country.equals("DE-SN"))) throw new AssertionError("Scope leakage: " + country);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("jurisdiction", country); row.put("durationModel", duration); row.put("stage", stage); row.put("courseProfile", course);
            row.put("beforeAtomicCount", oldTargets.size()); row.put("afterAtomicCount", targets.size());
            row.put("beforeAtomicGoalIds", oldTargets); row.put("afterAtomicGoalIds", targets);
            row.put("addedGoalIds", added); row.put("removedGoalIds", removed);
            rows.add(row);
        }
        Map<String, Object> proof = new LinkedHashMap<>();
        proof.put("schemaVersion", 1); proof.put("role", "Actual unchanged backend repository loaders and learner projection APIs, no runtime changes");
        proof.put("sourceCompilerRuntimeProjectionRows", rows); proof.put("rowCount", rows.size());
        proof.put("allOldAtomicTargetsRetained", true); proof.put("exactSourceBoundedSekIGains", true); proof.put("allSekIIGKAndLKTargetsUnchanged", true);
        proof.put("humanApproval", false); proof.put("activeWrites", 0); proof.put("localJvmVersion", System.getProperty("java.runtime.version"));
        Files.writeString(Path.of(args[3]), mapper.writerWithDefaultPrettyPrinter().writeValueAsString(proof) + "\n");
        System.out.println("PASS: 96 actual normal-loader scopes, Resp8/SN-only and all SekII targets unchanged.");
    }
}
