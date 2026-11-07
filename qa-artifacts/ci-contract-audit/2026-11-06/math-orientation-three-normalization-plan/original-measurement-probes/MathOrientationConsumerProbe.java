import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.service.*;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import java.lang.reflect.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.transaction.*;
import org.springframework.transaction.support.SimpleTransactionStatus;

/** Private read-only measurement of production methods. No actual learner repositories. */
class MathOrientationConsumerProbe {
    static final String OVERVIEW="a0e13c56-c25f-4742-9272-3a1a603ee52e", MATH="68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    static Object access(Object o,String name)throws Exception{Method m=o.getClass().getDeclaredMethod(name);m.setAccessible(true);return m.invoke(o);}
    static Method method(String name,Class<?>...types)throws Exception{Method m=LearnerService.class.getDeclaredMethod(name,types);m.setAccessible(true);return m;}
    static List<String> sorted(Collection<String> ids){return ids.stream().sorted().toList();}
    static String digest(byte[] bytes)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));}
    public static void main(String[] args)throws Exception{
        Path root=Path.of(args[0]),out=Path.of(args[1]);String scenario=args[2];
        ObjectMapper mapper=new ObjectMapper().findAndRegisterModules().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
        LandscapeProperties props=new LandscapeProperties();props.setDirectory(root.resolve("curricula").toString());
        GoalMappingService mappings=new GoalMappingService(props,mapper);mappings.pinRuntimeGeneration();
        LandscapeService landscapes=new LandscapeService(props,mapper,mappings);landscapes.pinRuntimeGeneration();
        CompositionViewService compositions=new CompositionViewService(props,mapper,()->{Map<String,List<String>> g=new TreeMap<>();landscapes.getAll().forEach(l->l.getGoals().forEach(n->g.put(n.getId(),n.getContains()==null?List.of():n.getContains())));return g;});
        Learner learner=new Learner();learner.setSkillpilotId("private-synthetic-math-orientation-probe");learner.setSelectedCurriculum(OVERVIEW);learner.setFollowLearningPlans(false);
        String mathRoot=landscapes.getAll().stream().filter(l->MATH.equals(l.getLandscapeId())).flatMap(l->l.getGoals().stream()).filter(g->g.getTags()!=null&&g.getTags().contains("root")).map(LearningGoal::getId).findFirst().orElseThrow();
        LearnerRepository lr=(LearnerRepository)Proxy.newProxyInstance(LearnerRepository.class.getClassLoader(),new Class[]{LearnerRepository.class},(p,m,a)->switch(m.getName()){case "findById"->Optional.of(learner);case "existsById"->true;default->throw new IllegalStateException("No real learner access authorized: "+m.getName());});
        PlannedGoalRepository pr=(PlannedGoalRepository)Proxy.newProxyInstance(PlannedGoalRepository.class.getClassLoader(),new Class[]{PlannedGoalRepository.class},(p,m,a)->{if(m.getName().equals("findByLearner_SkillpilotId"))return List.of(new PlannedGoal(learner,mathRoot));throw new IllegalStateException("No real plan access authorized: "+m.getName());});
        PlatformTransactionManager tx=new PlatformTransactionManager(){public TransactionStatus getTransaction(TransactionDefinition d){return new SimpleTransactionStatus();}public void commit(TransactionStatus s){throw new IllegalStateException("No commits");}public void rollback(TransactionStatus s){throw new IllegalStateException("No rollbacks");}};
        LearnerService service=new LearnerService(lr,null,null,pr,landscapes,mappings,null,compositions,mapper,e->{throw new IllegalStateException("No events");},tx);
        Method projection=method("getGoalProjection",String.class,String.class);
        Class<?> gp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("GoalProjection")).findFirst().orElseThrow();
        Class<?> fp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("FrontierPrerequisites")).findFirst().orElseThrow();
        Method prerequisite=method("frontierPrerequisites",Learner.class,gp,Map.class,Set.class),allowed=method("areFrontierPrerequisitesMastered",LearningGoal.class,gp,fp);
        Method plan=method("planPrerequisitesByDependent",List.class,Map.class,Map.class),effective=method("computeEffectiveRequires",Map.class),ordered=method("stablePlanTopologicalOrder",List.class,Map.class);
        List<Map<String,Object>> requests=mapper.readValue(out.resolve("consumer-requests.json").toFile(),new TypeReference<>(){});
        List<Map<String,Object>> rows=new ArrayList<>();
        List<String> orientations=List.of("65365dce-f33f-49d8-9516-42f75883aa86","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2");
        Map<String,String> sources=Map.of("0c2ddfcd-1399-41ad-aaed-4f061812602a","5e7d5ff2-b92c-4989-85bc-8d87ad7edadd","ce198bc9-b014-52ba-814f-25cc3e020668","304111dd-426b-520b-a275-3fa37da1b0e0","d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe","9ef6c4fa-b97a-5d7a-86c1-96690f02d916");
        for(Map<String,Object> request:requests){
            learner.setPersonalCurriculum(mapper.writeValueAsString(request.get("personalCurriculum")));
            Object proj=projection.invoke(service,OVERVIEW,learner.getPersonalCurriculum());
            Map<String,LearningGoal> structural=(Map<String,LearningGoal>)access(proj,"structuralGoals");
            Set<String> targets=(Set<String>)access(proj,"targetGoalIds");
            Set<String> support=(Set<String>)access(proj,"prerequisiteOnlyGoalIds");
            Map<String,Object> row=new LinkedHashMap<>();row.put("requestKey",request.get("key"));row.put("targetGoalIds",sorted(targets));row.put("supportGoalIds",sorted(support));row.put("compositionViewIds",sorted((Set<String>)access(proj,"compositionViewIds")));
            Map<String,Object> outlooks=new TreeMap<>();for(String id:orientations){learner.setActiveGoalId(id);for(String lang:List.of("de","en"))outlooks.put(id+":"+lang,service.getCoachOrientationOutlook(learner.getSkillpilotId(),lang));}row.put("orientationOutlooks",outlooks);learner.setActiveGoalId(null);
            List<Map<String,Object>> tests=new ArrayList<>();Map<String,List<String>> transitive=new TreeMap<>();
            for(boolean strict:List.of(false,true)){
                learner.setStrictMode(strict);Map<String,Double> mastered=new HashMap<>();structural.keySet().forEach(id->mastered.put(id,1.0));
                Object all=prerequisite.invoke(service,learner,proj,mastered,null);
                CompletionProfileCompiler.PrerequisiteTopology topology=(CompletionProfileCompiler.PrerequisiteTopology)access(all,"topology");
                if(topology==null)throw new IllegalStateException("Production prerequisite topology invalid: "+request.get("key"));
                for(String id:targets){LearningGoal goal=structural.get(id);if(goal==null||goal.getContains()!=null&&!goal.getContains().isEmpty())continue;
                    transitive.put(id,sorted(topology.transitivePrerequisites(id)));
                    tests.add(Map.of("id",id,"strict",strict,"state","all-prerequisites-mastered","allowed",allowed.invoke(service,goal,proj,all)));
                }
                for(var pair:sources.entrySet())if(targets.contains(pair.getKey()))for(String state:List.of("all-open","carrier-mastered-orientation-open","all-prerequisites-mastered","focus-source-and-carrier-orientation-open")){
                    Map<String,Double> mastery=new HashMap<>(mastered);mastery.put(pair.getKey(),0.0);
                    if(state.equals("all-open"))mastery.clear();else if(state.contains("orientation-open"))orientations.forEach(id->mastery.put(id,0.0));
                    Set<String> scope=state.startsWith("focus-")?Set.of(pair.getKey(),pair.getValue()):null;
                    Object p=prerequisite.invoke(service,learner,proj,mastery,scope);
                    tests.add(Map.of("id",pair.getKey(),"strict",strict,"state",state,"allowed",allowed.invoke(service,structural.get(pair.getKey()),proj,p)));
                }
            }
            row.put("transitiveAtomicDemand",transitive);row.put("frontierPredicateCases",tests);
            List<String> targetAtoms=targets.stream().filter(id->{var g=structural.get(id);return g!=null&&(g.getContains()==null||g.getContains().isEmpty());}).toList();
            Map<String,List<String>> eff=(Map<String,List<String>>)effective.invoke(service,structural);
            Map<String,LinkedHashSet<String>> prep=(Map<String,LinkedHashSet<String>>)plan.invoke(service,targetAtoms,structural,eff);
            row.put("nativePlannedPrerequisiteAdjacency",prep);row.put("nativeStablePlanOrder",ordered.invoke(service,targetAtoms,prep));
            rows.add(row);
        }
        Map<String,Object> result=new LinkedHashMap<>();result.put("scenario",scenario);result.put("actualMathSha256",digest(Files.readAllBytes(root.resolve("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"))));result.put("rows",rows);result.put("actualLearnerOrMasteryReads",false);result.put("productionPredicatesUsed",List.of("LearnerService.getGoalProjection","frontierPrerequisites","areFrontierPrerequisitesMastered","getCoachOrientationOutlook","planPrerequisitesByDependent","stablePlanTopologicalOrder"));mapper.writeValue(out.resolve(scenario+".native-consumers.json").toFile(),result);
        System.out.println(mapper.writeValueAsString(Map.of("scenario",scenario,"contexts",rows.size(),"noActualLearnerReads",true)));
    }
}
