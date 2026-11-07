import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.completion.*;
import java.lang.reflect.*;import java.nio.file.*;import java.util.*;
class PowiOwnerResolutionNegatives {
 public static void main(String[]args)throws Exception {
  ObjectMapper om=new ObjectMapper().findAndRegisterModules().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
  Path source=Path.of(args[0]);SkillLandscape raw=om.readValue(source.toFile(),SkillLandscape.class);String intro="b76a024a-55a6-5c77-85cd-b37ef10e5197",author="041b4a11-d7a3-5557-b5d0-2c365faccc5b",owner=raw.getLandscapeId();
  Map<String,LearningGoal> graph=new LinkedHashMap<>();Map<String,Set<String>> owners=new LinkedHashMap<>();raw.getGoals().forEach(g->{graph.put(g.getId(),g);owners.put(g.getId(),Set.of(owner));});
  CompletionCanonicalGraphResolver resolver=new CompletionCanonicalGraphResolver(null,om);Method resolve=Arrays.stream(CompletionCanonicalGraphResolver.class.getDeclaredMethods()).filter(m->m.getName().equals("resolve")).findFirst().orElseThrow();resolve.setAccessible(true);List<Object>rows=new ArrayList<>();
  for(String ref:List.of(owner+":"+intro,"00000000-0000-4000-8000-000000000000:"+intro,owner+":00000000-0000-4000-8000-000000000000")){
   String actual=(String)(resolve.getParameterCount()==3?resolve.invoke(resolver,ref,graph,owners):resolve.invoke(resolver,ref,graph));Map<String,Object> row=new LinkedHashMap<>();row.put("reference",ref);row.put("nativeResolverHasOwnerArgument",resolve.getParameterCount()==3);row.put("nativeCanonicalResolverResult",actual);LearningGoal clone=om.convertValue(graph.get(author),LearningGoal.class);clone.setRequires(List.of(actual));Map<String,LearningGoal> fixture=new LinkedHashMap<>();fixture.put(author,clone);fixture.put(intro,graph.get(intro));
   try{Optional<Method> compiler=Arrays.stream(CompletionProfileCompiler.class.getDeclaredMethods()).filter(m->m.getName().equals("normalizePrerequisites")).findFirst();if(compiler.isEmpty()){row.put("status","resolver-only-old-runtime-no-topology-api");row.put("resolvesToKnownGoal",graph.containsKey(actual));}else{Object topology=compiler.get().invoke(new CompletionProfileCompiler(),fixture);topology.getClass().getDeclaredMethod("validateContext",Set.class).invoke(topology,Set.of(author));row.put("status","accepted");row.put("transitivePrerequisites",topology.getClass().getDeclaredMethod("transitivePrerequisites",String.class).invoke(topology,author));}}catch(Exception e){row.put("status","rejected");row.put("exception",e.getClass().getName());row.put("message",String.valueOf(e.getMessage()));}rows.add(row);
  }
  om.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(),rows);
 }
}
