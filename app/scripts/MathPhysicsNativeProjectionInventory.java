import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.LearnerService;
import java.lang.reflect.Method;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

/** Read-only adapter to the actual repository learner projection; no duplicate scope rules. */
class MathPhysicsNativeProjectionInventory {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";

    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]);
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(root.resolve("curricula").toString());
        GoalMappingService mappings = new GoalMappingService(properties, mapper);
        mappings.pinRuntimeGeneration();
        LandscapeService landscapes = new LandscapeService(properties, mapper, mappings);
        landscapes.pinRuntimeGeneration();
        CompositionViewService compositions = new CompositionViewService(properties, mapper, () -> {
            Map<String, List<String>> graph = new TreeMap<>();
            landscapes.getAll().forEach(landscape -> landscape.getGoals().forEach(goal ->
                    graph.put(goal.getId(), goal.getContains() == null ? List.of() : goal.getContains())));
            return graph;
        });
        PlatformTransactionManager transactions = new PlatformTransactionManager() {
            public TransactionStatus getTransaction(TransactionDefinition definition) { return new SimpleTransactionStatus(); }
            public void commit(TransactionStatus status) { }
            public void rollback(TransactionStatus status) { }
        };
        LearnerService learners = new LearnerService(null, null, null, null, landscapes,
                mappings, null, compositions, mapper, event -> { }, transactions);
        // A renamed or re-typed private projection must fail here; there is no substitute derivation.
        Method projection = LearnerService.class.getDeclaredMethod("getGoalProjection", String.class, String.class);
        projection.setAccessible(true);
        List<Map<String, Object>> requests = mapper.readValue(Path.of(args[1]).toFile(), new TypeReference<>() { });
        List<Map<String, Object>> results = new ArrayList<>();
        for (Map<String, Object> request : requests) {
            String landscapeId = (String) request.get("landscapeId");
            Map<String, String> scope = mapper.convertValue(request.get("scope"), new TypeReference<>() { });
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("key", request.get("key"));
            Map<String, Object> view = compositions.findLearnerScopeView(landscapeId, scope);
            row.put("viewId", view == null ? null : view.get("viewId"));
            row.put("mergedFromViewIds", view == null ? List.of() : view.getOrDefault("mergedFromViewIds", List.of()));
            Map<String, Object> rootConfig = new LinkedHashMap<>();
            rootConfig.put("selected", true);
            rootConfig.put("filterId", scope.getOrDefault("jurisdiction", "ALL"));
            rootConfig.put("stage", scope.get("stage"));
            if (scope.containsKey("durationModel")) rootConfig.put("durationModel", scope.get("durationModel"));
            Map<String, Object> subjectConfig = new LinkedHashMap<>();
            subjectConfig.put("selected", true);
            if (scope.containsKey("courseProfile")) subjectConfig.put("filterId", scope.get("courseProfile"));
            if (scope.containsKey("durationModel")) subjectConfig.put("durationModel", scope.get("durationModel"));
            Object resolved = projection.invoke(learners, ROOT,
                    mapper.writeValueAsString(Map.of(ROOT, rootConfig, landscapeId, subjectConfig)));
            for (String name : List.of("targetGoalIds", "prerequisiteOnlyGoalIds", "compositionViewIds")) {
                row.put(name, component(resolved, name));
            }
            // Since the personal-curriculum prerequisite closure, targets are the composition seeds plus
            // their canonical atomic prerequisite closure. When the backend cannot compile that closure it
            // silently keeps the seed scope (learningScope == null); report that instead of hiding it.
            Object learningScope = component(resolved, "learningScope");
            row.put("learningScopeApplied", learningScope != null);
            if (learningScope instanceof PersonalCurriculumLearningScope scoped) {
                Set<String> seeds = scoped.seedAtomicGoalIds();
                row.put("seedAtomicGoalCount", seeds.size());
                row.put("closureAddedTargetGoalIds", scoped.learningAtomicGoalIds().stream()
                        .filter(id -> !seeds.contains(id)).sorted().toList());
            } else if (learningScope != null) {
                throw new IllegalStateException("Unexpected learningScope type " + learningScope.getClass());
            } else {
                row.put("seedAtomicGoalCount", null);
                row.put("closureAddedTargetGoalIds", List.of());
            }
            Object targets = row.get("targetGoalIds");
            if (!(targets instanceof Collection<?>)) {
                throw new IllegalStateException("targetGoalIds is not a collection: " + targets);
            }
            results.add(row);
        }
        mapper.writeValue(Path.of(args[2]).toFile(), results);
    }

    private static Object component(Object record, String name) throws Exception {
        Method accessor = record.getClass().getDeclaredMethod(name);
        accessor.setAccessible(true);
        return accessor.invoke(record);
    }
}
