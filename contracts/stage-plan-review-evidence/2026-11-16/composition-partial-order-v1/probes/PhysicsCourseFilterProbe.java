import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.LearnerService;
import java.lang.reflect.Method;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class PhysicsCourseFilterProbe {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper=new ObjectMapper().findAndRegisterModules().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
        LearnerService service=new LearnerService(null,null,null,null,null,null,null,mapper,event -> {});
        Method method=LearnerService.class.getDeclaredMethod("matchesCourseFilter",LearningGoal.class,String.class);
        method.setAccessible(true);
        List<Map<String,Object>> rows=mapper.readValue(Path.of(args[0]).toFile(),new TypeReference<>(){});
        List<Map<String,Object>> out=new ArrayList<>();
        for(Map<String,Object> row:rows){
            LearningGoal goal=mapper.convertValue(row.get("goal"),LearningGoal.class);
            Map<String,Object> item=new LinkedHashMap<>();item.put("id",row.get("id"));
            for(String course:List.of("GK","LK"))item.put(course,method.invoke(service,goal,course));
            out.add(item);
        }
        mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(),Map.of("learnerServiceClassSource",LearnerService.class.getProtectionDomain().getCodeSource().getLocation().toString(),"rows",out));
    }
}
