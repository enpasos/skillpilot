import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.composition.CourseProfileCompositionViewMerger;
import java.nio.file.*;import java.util.*;
public class CompactMergeViewsProbe {
 @SuppressWarnings("unchecked") public static void main(String[] args)throws Exception{
 var mapper=new ObjectMapper();var dir=Path.of(args[0]);var epoch=args[1];
 Map<String,Object> docs=mapper.readValue(dir.resolve(epoch+".merge-input.json").toFile(),Map.class);Map<String,List<String>> children=(Map)docs.get("children");List<Map<String,Object>> all=(List)docs.get("views");
 List<Map<String,Object>> result=new ArrayList<>(all);for(String landscape:List.of("7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a","68a8ac50-f5f5-4e24-8aa9-5e408ca01ced")){
 var vs=all.stream().filter(v->landscape.equals(v.get("landscapeId"))).sorted(Comparator.comparing(v->(String)((Map<String,Object>)v.get("scope")).get("courseProfile"))).toList();if(vs.size()!=2)throw new IllegalStateException("views="+vs.size());
 var roots=vs.stream().map(v->(List<Map<String,Object>>)v.get("rootNodes")).toList();var v=new LinkedHashMap<String,Object>();v.put("viewId","merged:"+String.join("+",vs.stream().map(x->(String)x.get("viewId")).toList()));v.put("landscapeId",landscape);v.put("scope",Map.of("schoolForm","Gymnasium","stage","CrossStage","courseProfile","GK+LK"));v.put("rootNodes",CourseProfileCompositionViewMerger.mergeViews(roots,children));v.put("mergedFromViewIds",vs.stream().map(x->x.get("viewId")).toList());result.add(v);
 }mapper.writerWithDefaultPrettyPrinter().writeValue(dir.resolve(epoch+".native-merged-views.json").toFile(),result);
 }
}
