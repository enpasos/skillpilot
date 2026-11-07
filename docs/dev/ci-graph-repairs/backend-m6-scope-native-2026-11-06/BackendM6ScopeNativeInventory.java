import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.api.GoalStats;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

/** Read-only adapter: calls the actual production projection and atomic counter. */
class BackendM6ScopeNativeInventory {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static Object access(Object object, String name) throws Exception {
        Method method = object.getClass().getDeclaredMethod(name);
        method.setAccessible(true);
        return method.invoke(object);
    }
    private static List<String> sorted(Collection<String> ids) { return ids.stream().sorted().toList(); }
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
        Method projection = LearnerService.class.getDeclaredMethod("getGoalProjection", String.class, String.class);
        projection.setAccessible(true);
        Method counted = LearnerService.class.getDeclaredMethod("isCountedAtomicGoal", LearningGoal.class);
        counted.setAccessible(true);
        Method stats = LearnerService.class.getDeclaredMethod("computeAtomicStats",Map.class,Set.class,Map.class);
        stats.setAccessible(true);
        List<Map<String,Object>> requests = mapper.readValue(Path.of(args[1]).toFile(),new TypeReference<>(){});
        if(requests.size()!=112)throw new IllegalStateException("Exactly112 native requests required");
        List<Map<String,Object>> rows = new ArrayList<>();
        Map<String,Object> definitions = new TreeMap<>();
        for(Map<String,Object> request:requests){
            Object resolved = projection.invoke(learners,ROOT,mapper.writeValueAsString(request.get("personalCurriculum")));
            Set<String> targets = (Set<String>)access(resolved,"targetGoalIds");
            Map<String,LearningGoal> structural = (Map<String,LearningGoal>)access(resolved,"structuralGoals");
            Map<String,LearningGoal> visible = (Map<String,LearningGoal>)access(resolved,"visibleGoals");
            GoalStats actualStats = (GoalStats)stats.invoke(learners,visible,targets,Map.of());
            List<String> structuralAtoms = new ArrayList<>();
            for(String id:targets)if((boolean)counted.invoke(learners,structural.get(id)))structuralAtoms.add(id);
            List<String> atoms = new ArrayList<>();
            for(String id:targets){
                LearningGoal goal = visible.get(id);
                if((boolean)counted.invoke(learners,goal)){
                    atoms.add(id);
                    if(!definitions.containsKey(id)){
                        Map<String,Object> d=new LinkedHashMap<>();
                        d.put("id",id);d.put("title",goal.getTitle());d.put("titleEn",goal.getTitleEn());
                        d.put("description",goal.getDescription());d.put("descriptionEn",goal.getDescriptionEn());
                        d.put("tags",goal.getTags());d.put("type",goal.getType());d.put("semanticKind",goal.getSemanticKind());
                        d.put("requires",goal.getRequires());d.put("contains",goal.getContains());
                        d.put("phase",goal.getPhase());d.put("dimensionTags",goal.getDimensionTags());
                        d.put("applicability",goal.getApplicability());d.put("extendedData",goal.getExtendedData());
                        d.put("examDataPresent",goal.getExamData()!=null);definitions.put(id,d);
                    }
                }
            }
            if(actualStats.total_atomic()!=atoms.size())throw new IllegalStateException("Visible counted IDs differ from actual GoalStats for "+request.get("key"));
            Map<String,Object> row=new LinkedHashMap<>();
            row.put("key",request.get("key"));row.put("subject",request.get("subject"));
            row.put("landscapeId",request.get("landscapeId"));row.put("jurisdiction",request.get("jurisdiction"));
            row.put("durationModel",request.get("durationModel"));row.put("expectedTotal",request.get("expectedTotal"));
            row.put("countedAtomicTotal",actualStats.total_atomic());row.put("countedAtomicTargetGoalIds",sorted(atoms));
            row.put("structuralAtomicTotal",structuralAtoms.size());row.put("structuralAtomicTargetGoalIds",sorted(structuralAtoms));
            row.put("targetGoalIds",sorted(targets));
            row.put("prerequisiteOnlyGoalIds",sorted((Set<String>)access(resolved,"prerequisiteOnlyGoalIds")));
            row.put("compositionViewIds",sorted((Set<String>)access(resolved,"compositionViewIds")));
            rows.add(row);
        }
        Path source=root.resolve("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json");
        String sourceSha=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(source)));
        Map<String,Object> result=new LinkedHashMap<>();result.put("context",args[3]);result.put("actualInfoSourceSha256",sourceSha);
        result.put("rows",rows);result.put("goalDefinitions",definitions);result.put("runtimeLandscapeCount",landscapes.getAll().size());
        result.put("learnerStateOrMasteryRead",false);result.put("projectionMethod","LearnerService.getGoalProjection");
        result.put("countMethod","LearnerService.computeAtomicStats(visibleGoals,targetGoalIds,Map.of()) plus actual isCountedAtomicGoal for ID evidence");mapper.writeValue(Path.of(args[2]).toFile(),result);
        System.out.println(mapper.writeValueAsString(Map.of("context",args[3],"requests",rows.size(),"goalDefinitions",definitions.size(),"sourceSha256",sourceSha)));
    }
}
