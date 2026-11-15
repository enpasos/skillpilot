package com.skillpilot.backend.composition;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.service.CompositionViewService;
import java.nio.file.*;
import java.util.*;
import java.security.MessageDigest;
import java.util.HexFormat;
public class ExportActualViews {
 static final ObjectMapper M=new ObjectMapper(); static final TypeReference<Map<String,Object>> T=new TypeReference<>(){};
 @SuppressWarnings("unchecked") static Map<String,Object> map(Object v){return (Map<String,Object>)v;}
 @SuppressWarnings("unchecked") static List<Map<String,Object>> rows(Object v){return (List<Map<String,Object>>)v;}
 @SuppressWarnings("unchecked") static List<String> strings(Object v){return v==null?List.of():(List<String>)v;}
 public static void main(String[] args)throws Exception{
  Path root=Path.of(args[0]);var contexts=M.readValue(Path.of(args[1]).toFile(),T);var children=new LinkedHashMap<String,List<String>>();
  try(var files=Files.list(root.resolve("curricula/DE/Gymnasium/canonical"))){for(Path p:files.filter(f->f.toString().endsWith(".json")).sorted().toList())for(var g:rows(M.readValue(p.toFile(),T).get("goals")))children.put((String)g.get("id"),strings(g.get("contains")).stream().map(r->r.substring(r.lastIndexOf(':')+1)).toList());}
  var properties=new LandscapeProperties();properties.setDirectory(root.resolve("curricula").toString());var service=new CompositionViewService(properties,M,()->children);
  Map<String,Object> bank=new TreeMap<>();List<Map<String,Object>> answers=new ArrayList<>();
  for(var context:rows(contexts.get("contexts"))){var answer=new LinkedHashMap<>(context);Map<String,String> scope=new LinkedHashMap<>();map(context.get("scope")).forEach((k,v)->scope.put(k,(String)v));
   for(var subject:Map.of("math","68a8ac50-f5f5-4e24-8aa9-5e408ca01ced","physics","7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a").entrySet())try{
    var view=service.findLearnerScopeView(subject.getValue(),scope);if(view==null){answer.put(subject.getKey()+"Error","No matching learner view");continue;}
    byte[] bytes=M.writeValueAsBytes(view);String key=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));bank.putIfAbsent(key,view);answer.put(subject.getKey()+"ViewKey",key);
   }catch(Exception e){answer.put(subject.getKey()+"Error",e.getClass().getName()+": "+e.getMessage());}
   answers.add(answer);
  }
  M.writeValue(Path.of(args[2]).toFile(),Map.of("contexts",answers,"views",bank));System.out.println("Actual public-reader selections: "+answers.size()+"; distinct source/merged payloads: "+bank.size());
 }
}
