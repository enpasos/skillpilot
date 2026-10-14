
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.*;
import java.util.*;
import java.nio.file.*;
public class ByIdentityProbe {
 public static void main(String[] args) throws Exception {
  ObjectMapper mapper = new ObjectMapper(); List<Object> results = new ArrayList<>();
  for (String path: args) {
   LandscapeProperties props=new LandscapeProperties(); props.setDirectory(path);
   LandscapeService service=new LandscapeService(props,mapper); Map<String,Object> result=new LinkedHashMap<>();
   result.put("fixture",path);result.put("landscapeCount",service.getAll().size());
   Map<String,Object> landscapes=new LinkedHashMap<>();
   for(String id:List.of("c1600692-e543-5cf2-a399-6bd96e6b817f","42c2f7e3-91b4-5de8-bef0-d563440e9d52")) {
    SkillLandscape l=service.getById(id);Map<String,Object> info=new LinkedHashMap<>();
    info.put("present",l!=null);if(l!=null){info.put("title",l.getTitle());info.put("schoolType",l.getSchoolType());info.put("goalCount",l.getGoals().size());}landscapes.put(id,info);
   }result.put("byId",landscapes);
   Map<String,Object> goals=new LinkedHashMap<>();
   for(String id:List.of("43e2025f-f393-5a41-aa42-ecb3b6ca35b8","227e6105-30d6-5eca-9266-ab330fa661e3","b3bc3211-893c-50d4-ac60-7bff9dce5d3c","9e1bc5d5-d2e8-56f7-97fe-655539656de7")){
    LearningGoal g=service.getGoalDefinition(id);Map<String,Object> info=new LinkedHashMap<>();info.put("present",g!=null);info.put("landscapeId",service.getLandscapeIdForGoal(id));if(g!=null)info.put("title",g.getTitle());goals.put(id,info);
   }result.put("getGoalDefinition",goals);
   for(String root:List.of("b0f776f2-7288-51cb-9416-3383e2ccf268","4a1e367e-3c03-5ad3-a2ff-be60bb5e499b"))result.put("closure:"+root,service.getClosure(root).stream().map(l->Map.of("landscapeId",l.getLandscapeId(),"title",l.getTitle())).toList());
   results.add(result);
  }
  System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(results));
 }
}
