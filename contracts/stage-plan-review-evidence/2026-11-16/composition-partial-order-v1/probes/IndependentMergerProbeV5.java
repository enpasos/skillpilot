import com.skillpilot.backend.composition.CourseProfileCompositionViewMerger;
import com.skillpilot.backend.composition.CompositionViewFormatMetadata;
import java.util.*;

public final class IndependentMergerProbeV5 {
  static final List<String> IDS=List.of("a","b","c","d","e");
  static Map<String,Object> leaf(String id){return Map.of("kind","goalEntry","goalId",id);}
  static Map<String,Object> section(String id,List<Map<String,Object>> children,List<Map<String,Object>> after){
    return Map.of("kind","structure","id",id,"label",id,"children",children,"childOrder",Map.of("after",after));
  }
  static Map<String,Object> pair(String before,String later){return Map.of("unit",later,"after",before);}
  static void check(boolean value,String message){if(!value)throw new AssertionError(message);}
  @SuppressWarnings("unchecked") static List<Map<String,Object>> order(Map<String,Object> node){return (List<Map<String,Object>>)((Map<String,Object>)node.get("childOrder")).get("after");}
  static boolean[][] closure(List<Map<String,Object>> edges){
    boolean[][] r=new boolean[5][5];
    for(var edge:edges)r[IDS.indexOf(edge.get("after"))][IDS.indexOf(edge.get("unit"))]=true;
    for(int k=0;k<5;k++)for(int i=0;i<5;i++)for(int j=0;j<5;j++)r[i][j]|=r[i][k]&&r[k][j];
    return r;
  }
  static void rejects(Runnable action,String message){try{action.run();}catch(IllegalStateException expected){return;}throw new AssertionError(message);}
  public static void main(String[]args){
    List<int[]> possible=new ArrayList<>();for(int i=0;i<5;i++)for(int j=i+1;j<5;j++)possible.add(new int[]{i,j});
    int cases=0;
    for(int mask=0;mask<1024;mask++){
      List<Map<String,Object>> edges=new ArrayList<>();for(int bit=0;bit<10;bit++)if((mask&(1<<bit))!=0)edges.add(pair(IDS.get(possible.get(bit)[0]),IDS.get(possible.get(bit)[1])));
      boolean[][] expected=closure(edges);List<Map<String,Object>> reduced=new ArrayList<>();
      for(int i=0;i<5;i++)for(int j=0;j<5;j++)if(expected[i][j]){boolean indirect=false;for(int k=0;k<5;k++)indirect|=expected[i][k]&&expected[k][j];if(!indirect)reduced.add(pair(IDS.get(i),IDS.get(j)));}
      List<Map<String,Object>> children=new ArrayList<>();for(String id:IDS)children.add(section(id,List.of(leaf(id+"-goal")),List.of()));
      var source=section("topics",children,reduced);
      for(int visible=0;visible<32;visible++){
        Map<String,List<String>> graph=new LinkedHashMap<>();for(String id:IDS)graph.put(id+"-goal",List.of());
        List<String> hidden=new ArrayList<>();for(int i=0;i<5;i++)if((visible&(1<<i))==0)hidden.add(IDS.get(i)+"-goal");
        List<List<Map<String,Object>>> sources=new ArrayList<>();sources.add(List.of(source));
        if(!hidden.isEmpty()){
          graph.put("broad",hidden);
          Map<String,Object> broad=Map.of("kind","canonicalSubtree","goalId","broad");
          sources.add(List.of(section("topics",List.of(broad),List.of())));
        }
        var merged=CourseProfileCompositionViewMerger.mergeViews(sources,graph,true);
        boolean[][] actual=closure(order(merged.getFirst()));
        for(int i=0;i<5;i++)for(int j=0;j<5;j++)if((visible&(1<<i))!=0&&(visible&(1<<j))!=0)check(actual[i][j]==expected[i][j],"Reachability drift mask="+mask+" visible="+visible+" "+i+">"+j);
        for(var edge:order(merged.getFirst())){int i=IDS.indexOf(edge.get("after")),j=IDS.indexOf(edge.get("unit"));check((visible&(1<<i))!=0&&(visible&(1<<j))!=0,"Removed endpoint retained");}
        cases++;
      }
    }
    var a=section("a",List.of(leaf("a-goal")),List.of());var b=section("b",List.of(leaf("b-goal")),List.of());
    var empty=section("topics",List.of(a,b),List.of());var explicit=section("topics",List.of(a,b),List.of(pair("a","b")));
    var legacy=new LinkedHashMap<>(empty);legacy.remove("childOrder");
    check(!CourseProfileCompositionViewMerger.merge(List.of(legacy)).getFirst().containsKey("childOrder"),"Missing declaration became explicit");
    check(order(CourseProfileCompositionViewMerger.merge(List.of(empty)).getFirst()).isEmpty(),"Empty became implicit");
    rejects(()->CourseProfileCompositionViewMerger.merge(List.of(explicit,legacy)),"Explicit/implicit conflict accepted");
    rejects(()->CourseProfileCompositionViewMerger.merge(List.of(explicit,section("topics",List.of(a,b),List.of(pair("b","a"))))),"Combined cycle accepted");
    for(var bad:List.of(List.of(pair("missing","b")),List.of(pair("a","a")),List.of(pair("a","b"),pair("a","b"))))rejects(()->CourseProfileCompositionViewMerger.merge(List.of(section("topics",List.of(a,b),bad))),"Malformed declaration accepted");
    Map<String,Object> lower=Map.of("kind","structure","id","lower","label","Lower","children",List.of(leaf("low")));
    Map<String,Object> gk=Map.of("kind","structure","id","upper-gk","label","Upper GK","children",List.of(leaf("gk")));
    Map<String,Object> lk=Map.of("kind","structure","id","upper-lk","label","Upper LK","children",List.of(leaf("lk")));
    var alias=CourseProfileCompositionViewMerger.merge(List.of(section("root",List.of(lower,gk),List.of(pair("lower","upper-gk"))),section("root",List.of(lower,lk),List.of(pair("lower","upper-lk")))));
    check(order(alias.getFirst()).equals(List.of(pair("lower","upper-gk-lk"))),"GK/LK alias endpoint was not rewritten");
    var acquisition=Map.<String,Object>of("kind","goalEntry","goalId","shared","projectionRole","prerequisiteOnly","acquisitionPlacement",true);
    var support=Map.<String,Object>of("kind","goalEntry","goalId","shared","projectionRole","prerequisiteOnly");
    var target=Map.<String,Object>of("kind","goalEntry","goalId","shared","projectionRole","target");
    for(boolean reverse:List.of(false,true)){
      var input=reverse?List.of(target,acquisition):List.of(acquisition,target);
      var union=CourseProfileCompositionViewMerger.merge(List.of(section("root",input,List.of())));
      var mergedChildren=(List<Map<String,Object>>)union.getFirst().get("children");
      check(mergedChildren.size()==1&&"target".equals(mergedChildren.getFirst().get("projectionRole"))&&!mergedChildren.getFirst().containsKey("acquisitionPlacement"),"Target promotion retained a preparation-only capability");
      var supportInput=reverse?List.of(support,acquisition):List.of(acquisition,support);
      var prepared=CourseProfileCompositionViewMerger.merge(List.of(section("root",supportInput,List.of())));
      var preparedChildren=(List<Map<String,Object>>)prepared.getFirst().get("children");
      check(preparedChildren.size()==1&&Boolean.TRUE.equals(preparedChildren.getFirst().get("acquisitionPlacement")),"Explicit support placement lost in native merge");
    }
    var invalidTarget=new LinkedHashMap<>(acquisition);invalidTarget.put("projectionRole","target");
    rejects(()->CourseProfileCompositionViewMerger.merge(List.of(section("root",List.of(invalidTarget),List.of()))),"Invalid target acquisition flag accepted");
    String actualShGoal="54541d08-61cc-5a6d-b6d9-d0270a7d1949";
    var shPreparation=Map.<String,Object>of("kind","goalEntry","goalId",actualShGoal,"projectionRole","prerequisiteOnly","acquisitionPlacement",true);
    var shTarget=Map.<String,Object>of("kind","canonicalSubtree","goalId",actualShGoal,"displayLabel","Vektorprodukt definieren");
    for(boolean reverse:List.of(false,true)){
      var sources=reverse?List.of(shTarget,shPreparation):List.of(shPreparation,shTarget);
      var merged=CourseProfileCompositionViewMerger.merge(sources).getFirst();
      check("Vektorprodukt definieren".equals(merged.get("displayLabel"))&&"target".equals(merged.get("projectionRole"))&&!merged.containsKey("acquisitionPlacement"),"Actual SH optional target label was lost");
      var badTarget=new LinkedHashMap<>(shTarget);badTarget.put("displayLabel","Widerspruch");
      var targets=reverse?List.of(shTarget,badTarget):List.of(badTarget,shTarget);
      rejects(()->CourseProfileCompositionViewMerger.merge(targets),"Conflicting target labels accepted");
      var explicitPreparation=new LinkedHashMap<>(shPreparation);explicitPreparation.put("displayLabel","Widerspruch");
      var mixed=reverse?List.of(shTarget,explicitPreparation):List.of(explicitPreparation,shTarget);
      rejects(()->CourseProfileCompositionViewMerger.merge(mixed),"Explicit conflicting preparation label accepted");
    }

    int localCases=0;
    for(boolean reverse:List.of(false,true))for(boolean profiles:List.of(false,true)){
      var early=section("j7",List.of(support),List.of());
      var later=section("q3",List.of(acquisition),List.of());
      List<List<Map<String,Object>>> inputs=profiles?List.of(List.of(section("root",List.of(early),List.of())),List.of(section("root",List.of(later),List.of()))):List.of(List.of(section("root",List.of(early,later),List.of())));
      if(reverse){if(profiles)inputs=List.of(inputs.get(1),inputs.get(0));else inputs=List.of(List.of(section("root",List.of(later,early),List.of())));}
      var merged=CourseProfileCompositionViewMerger.mergeViews(inputs,Map.of("shared",List.of()),true);
      var children=(List<Map<String,Object>>)merged.getFirst().get("children");
      var actualQ3=children.stream().filter(node->"q3".equals(node.get("id"))).findFirst().orElseThrow();
      for(var node:children)if("j7".equals(node.get("id")))check(((List<?>)node.get("children")).isEmpty(),"Marker moved to unmarked J7");
      var leaves=(List<Map<String,Object>>)actualQ3.get("children");
      check(leaves.size()==1&&Boolean.TRUE.equals(leaves.getFirst().get("acquisitionPlacement")),"Q3 marker missing");
      localCases++;
    }
    for(boolean equalLabels:List.of(false,true)){
      var one=new LinkedHashMap<>(section("parent-a",List.of(section("stable-id",List.of(leaf("first")),List.of())),List.of()));
      var two=new LinkedHashMap<>(section("parent-b",List.of(section("stable-id",List.of(leaf("second")),List.of())),List.of()));
      if(equalLabels){one.put("label","Same title");two.put("label","Same title");}
      rejects(()->CourseProfileCompositionViewMerger.merge(List.of(section("root",List.of(one,two),List.of()))),"Duplicate global structure identity under different parents accepted");
    }
    String sourceSchema="https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json";
    String runtimeSchema="https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json";
    int envelopeCases=0;
    for(boolean runtime:List.of(false,true)){
      java.util.function.Function<List<Map<String,Object>>,Map<String,Object>> merge=runtime?CompositionViewFormatMetadata::mergeRuntimeViews:CompositionViewFormatMetadata::mergeSourceViews;
      String schema=runtime?runtimeSchema:sourceSchema,other=runtime?sourceSchema:runtimeSchema;
      var valid=Map.<String,Object>of("viewFormatVersion","1.2","$schema",schema,"language","de-DE");
      check(merge.apply(List.of(valid,valid)).equals(valid),"Envelope lost");envelopeCases++;
      for(String language:List.of("de","DE-de","zh-Hant-TW","en-001")){
        var item=new LinkedHashMap<>(valid);item.put("language",language);check(merge.apply(List.of(item,item)).equals(item),"Valid language rejected");envelopeCases++;
      }
      for(String field:List.of("viewFormatVersion","$schema","language"))for(Object bad:List.of("",1,"unsupported","de_DE")){
        var item=new LinkedHashMap<>(valid);item.put(field,bad);
        rejects(()->merge.apply(List.of(valid,item)),"Invalid envelope accepted "+field+" "+bad);envelopeCases++;
      }
      for(String field:List.of("viewFormatVersion","$schema","language")){
        var item=new LinkedHashMap<>(valid);item.remove(field);
        rejects(()->merge.apply(List.of(valid,item)),"Missing envelope accepted "+field);envelopeCases++;
      }
      var wrong=new LinkedHashMap<>(valid);wrong.put("$schema",other);rejects(()->merge.apply(List.of(wrong)),"Source/runtime schema conflated");envelopeCases++;
      var lang=new LinkedHashMap<>(valid);lang.put("language","en-US");rejects(()->merge.apply(List.of(valid,lang)),"Mixed languages accepted");envelopeCases++;
      var longLang=new LinkedHashMap<>(valid);longLang.put("language","de"+"-12345678".repeat(8));rejects(()->merge.apply(List.of(longLang)),"Long language accepted");envelopeCases++;
      check(merge.apply(List.of(Map.of(),Map.of())).isEmpty(),"Headerless legacy rejected");envelopeCases++;
      check(merge.apply(List.of(Map.of(),Map.of("viewFormatVersion","1.0"))).equals(Map.of("viewFormatVersion","1.0")),"Implicit legacy 1.0 conflict");envelopeCases++;
      rejects(()->merge.apply(List.of(valid,Map.of())),"Mixed legacy/1.2 accepted");envelopeCases++;
      check(merge.apply(List.of(Map.of("viewFormatVersion","1.1"),Map.of("viewFormatVersion","1.1"))).equals(Map.of("viewFormatVersion","1.1")),"Legacy1.1 rejected");envelopeCases++;
    }
    System.out.println("PASS independent locality cases="+localCases+" envelope cases="+envelopeCases);

    System.out.println("PASS independent Java order review: "+cases+" DAG/dedup/filter cases; explicit/missing/empty semantics; source/union conflicts, profile aliases and acquisition-role promotion and actual SH target-label authority in both input orders.");
  }
}
