import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.service.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Read-only backend objects and isolated authored views; no Spring server or database. */
class BavariaTankProjectionProbe {
    static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    static final String TASK = "c849eeab-e88f-5e82-89d9-761a1e17d97b";
    static final ObjectMapper JSON = new ObjectMapper();
    record Projection(Set<String> targets, Set<String> context, Set<String> views) { }

    static LearnerService fixture(LandscapeProperties live, LandscapeService landscapes,
            GoalMappingService mappings, Map<String,LearningGoal> canonical, Path isolatedViews) {
        var viewProps = new LandscapeProperties();
        viewProps.setDirectory(isolatedViews.toAbsolutePath().toString());
        Map<String,List<String>> contains = new LinkedHashMap<>();
        canonical.forEach((id,g) -> contains.put(id,g.getContains()));
        var views = new CompositionViewService(viewProps, JSON, () -> contains);
        var service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mappings,
                mock(DeckResourceService.class), JSON, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(service, "compositionViewService", views);
        var completion = mock(CompletionApplicationService.class);
        var catalog = mock(CompletionProfileCatalog.class);
        when(completion.catalog()).thenReturn(catalog);
        when(catalog.automatic()).thenReturn(true);
        when(completion.automaticCanonicalGraph(eq(ROOT), any())).thenReturn(canonical);
        ReflectionTestUtils.setField(service,"completionApplicationService",completion);
        return service;
    }

    static Map<String,Projection> collect(LearnerService service, JsonNode countries,
            Map<String,Projection> reuseContexts) throws Exception {
        Map<String,Projection> result = new LinkedHashMap<>();
        for (var iterator=countries.fields(); iterator.hasNext();) {
            var country=iterator.next();
            for (JsonNode stageNode:country.getValue().path("stages")) {
                String stage=stageNode.asText(); List<String> durations=new ArrayList<>();
                country.getValue().path("durationModels").forEach(n -> durations.add(n.asText()));
                if (durations.isEmpty()) durations.add("");
                for (String duration:durations) for (String course:"SekI".equals(stage)?List.of("GK+LK"):List.of("GK","LK","GK+LK")) {
                    Map<String,Object> rc=new LinkedHashMap<>();rc.put("selected",true);rc.put("filterId",country.getKey());rc.put("stage",stage);
                    if (!duration.isEmpty()) rc.put("durationModel",duration);
                    String config=JSON.writeValueAsString(Map.of(ROOT,rc,MATH,Map.of("selected",true,"filterId",course)));
                    Object projected=ReflectionTestUtils.invokeMethod(service,"getGoalProjection",ROOT,config,false);
                    Set<String> targets=ReflectionTestUtils.invokeMethod(service,"automaticCompletionTargets","automatic:personal-curriculum",projected);
                    Set<String> views=ReflectionTestUtils.invokeMethod(projected,"compositionViewIds");
                    String scope=String.join("/",country.getKey(),stage,duration,course);
                    Set<String> context;
                    Projection cached=reuseContexts==null?null:reuseContexts.get(scope);
                    if (cached!=null && cached.targets().equals(targets)) context=cached.context();
                    else {
                        var learner=new Learner();learner.setSelectedCurriculum(ROOT);learner.setPersonalCurriculum(config);
                        Map<String,LearningGoal> graph=ReflectionTestUtils.invokeMethod(service,"completionGraph",learner,projected);
                        context=new CompletionProfileCompiler().compileAutomatic(graph,targets,targets,"isolated-tank-metadata-probe").contextGoalIds();
                    }
                    result.put(scope,new Projection(Set.copyOf(targets),Set.copyOf(context),Set.copyOf(views)));
                }
            }
        }
        return result;
    }

    static Set<String> difference(Set<String> a,Set<String> b) {var out=new TreeSet<>(a);out.removeAll(b);return out;}
    static String hash(Set<String> values)throws Exception {
        byte[] data=JSON.writeValueAsBytes(new TreeSet<>(values));
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));
    }
    static Map<String,Object> metrics(Projection p,Set<String> reqs)throws Exception {
        Map<String,Object> m=new LinkedHashMap<>();m.put("targetCount",p.targets().size());m.put("contextCount",p.context().size());
        m.put("compositionViewIds",new TreeSet<>(p.views()));m.put("taskTarget",p.targets().contains(TASK));m.put("taskInContext",p.context().contains(TASK));
        m.put("allTaskRequirementsAreTargets",p.targets().containsAll(reqs));m.put("taskRequirementsInContext",p.context().containsAll(reqs));
        m.put("targetSetSha256",hash(p.targets()));m.put("contextSetSha256",hash(p.context()));
        m.put("supportOutsideTargets",difference(p.context(),p.targets()));return m;
    }

    public static void main(String[] args)throws Exception {
        Path repository=Path.of(args[0]).toAbsolutePath(),folder=Path.of(args[1]).toAbsolutePath();
        var live=new LandscapeProperties();live.setDirectory(repository.resolve("curricula").toString());
        var landscapes=new LandscapeService(live,JSON);var mappings=new GoalMappingService(live,JSON);
        var canonical=new CompletionCanonicalGraphResolver(landscapes,JSON).load(ROOT);
        var rawTask=landscapes.getGoalDefinition(TASK);var canonicalTask=canonical.get(TASK);
        Set<String> reqs=new TreeSet<>(canonicalTask.getRequires());
        String text=Files.readString(repository.resolve("app/src/generated/gymnasiumDurationOfferings.ts"));
        String marker="export const GYMNASIUM_CONTENT_OFFERINGS = ";int start=text.indexOf(marker)+marker.length();
        int end=text.indexOf(" as const satisfies GymnasiumContentOfferings",start);
        JsonNode countries=new ObjectMapper().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES).readTree(text.substring(start,end)).path(MATH);
        var before=collect(fixture(live,landscapes,mappings,canonical,folder.resolve("before")),countries,null);
        var oldTags=new ArrayList<>(rawTask.getTags());var tags=new ArrayList<>(oldTags);tags.addFirst("GK");rawTask.setTags(tags);canonicalTask.setTags(tags);
        var tagOnly=collect(fixture(live,landscapes,mappings,canonical,folder.resolve("before")),countries,before);
        rawTask.setTags(oldTags);canonicalTask.setTags(oldTags);
        var viewOnly=collect(fixture(live,landscapes,mappings,canonical,folder.resolve("after-view-only")),countries,before);
        List<Map<String,Object>> rows=new ArrayList<>();int tagChanges=0,viewChanges=0;
        for (String scope:before.keySet()) {
            var a=before.get(scope);var b=tagOnly.get(scope);var c=viewOnly.get(scope);
            Map<String,Object> row=new LinkedHashMap<>();row.put("scope",scope);row.put("before",metrics(a,reqs));
            row.put("tagOnly",metrics(b,reqs));row.put("viewOnly",metrics(c,reqs));
            row.put("tagOnlyAddedTargets",difference(b.targets(),a.targets()));row.put("tagOnlyRemovedTargets",difference(a.targets(),b.targets()));
            row.put("viewOnlyAddedTargets",difference(c.targets(),a.targets()));row.put("viewOnlyRemovedTargets",difference(a.targets(),c.targets()));
            row.put("viewOnlyAddedContext",difference(c.context(),a.context()));row.put("viewOnlyRemovedContext",difference(a.context(),c.context()));
            if (!a.targets().equals(b.targets())) tagChanges++;
            if (!a.targets().equals(c.targets())) viewChanges++;
            rows.add(row);
        }
        Map<String,Object> output=new LinkedHashMap<>();output.put("status","candidate-only-actual-backend-projection");
        output.put("checkedActualOfferings",rows.size());output.put("tagOnlyChangedOfferings",tagChanges);output.put("viewOnlyChangedOfferings",viewChanges);
        output.put("goalId",TASK);output.put("requiredAndCoveredGoalIds",reqs);output.put("rows",rows);
        output.put("isolation","Existing compiled backend classes; live data read into process-local objects once; all proposed views isolated under tmp; no database, server, Gradle build or official audit report write.");
        JSON.writerWithDefaultPrettyPrinter().writeValue(folder.resolve("projection-delta-validation.json").toFile(),output);
        System.out.println("TANK_PROBE offerings="+rows.size()+" tagOnlyChanged="+tagChanges+" viewOnlyChanged="+viewChanges);
    }
}
