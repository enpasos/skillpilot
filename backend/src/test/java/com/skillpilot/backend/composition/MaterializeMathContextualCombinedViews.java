package com.skillpilot.backend.composition;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Dedicated buildtime tool: the existing production merger authors ordinary view JSON. */
public final class MaterializeMathContextualCombinedViews {
    private static final String DEFAULT_PLAN = "curricula/DE/Gymnasium/assessments/mathematik/contextual-terminal-assessments-2026-11-04-v1/finite-scope-operations.json";
    private static final String DEFAULT_CANONICAL = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json";
    private static final String DEFAULT_VIEWS = "curricula/DE/Gymnasium/composition-views/mathematik";
    private static final ObjectMapper JSON = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false).findAndRegisterModules();
    private MaterializeMathContextualCombinedViews() { }

    public static void main(String[] args) throws Exception {
        Map<String,String> options = new LinkedHashMap<>();
        for (int i=0; i<args.length; i++) {
            if ("--check".equals(args[i])) options.put("check", "true");
            else if (args[i].startsWith("--") && i+1<args.length) options.put(args[i].substring(2),args[++i]);
            else throw new IllegalArgumentException("Unknown/incomplete buildtime argument");
        }
        if(options.containsKey("check") && options.containsKey("report")) throw new IllegalArgumentException("--check is read-only; omit --report");
        Path root=Path.of(options.getOrDefault("data-root", ".")).toAbsolutePath().normalize();
        Path planPath=root.resolve(options.getOrDefault("plan",DEFAULT_PLAN));
        Path canonicalPath=root.resolve(options.getOrDefault("canonical",DEFAULT_CANONICAL));
        Path views=root.resolve(options.getOrDefault("views",DEFAULT_VIEWS));
        Path output=root.resolve(options.getOrDefault("output-dir",DEFAULT_VIEWS));
        Map<String,Object> policy=read(root.resolve("app/scripts/config/math-country-seki-stage-policy.json"));
        Map<String,Object> canonicalBinding=map(policy.get("canonical"));
        if(!canonicalPath.toAbsolutePath().normalize().equals(root.resolve(text(canonicalBinding.get("path"))).toAbsolutePath().normalize())
            || !sha(canonicalPath).equals(canonicalBinding.get("sha256"))) {
            throw new IllegalStateException("Combined canonical path/SHA must match normal policy canonical input");
        }
        Map<String,Object> plan=read(planPath), canonical=read(canonicalPath), counts=map(plan.get("counts"));
        List<Map<String,Object>> boundDecisions=maps(policy.get("stageDecisionBindings"));
        String relativePlan=root.relativize(planPath).toString().replace(java.io.File.separatorChar,'/');
        if(boundDecisions.stream().noneMatch(b->relativePlan.equals(b.get("path")) && shaUnchecked(planPath).equals(b.get("sha256")))) throw new IllegalStateException("Finite plan lacks its exact normal-policy hash binding");
        for(Map<String,Object> decision:maps(plan.get("independentDecisionBindings"))) {
            Path file=root.resolve(text(decision.get("path")));
            if(!sha(file).equals(decision.get("sha256")) || boundDecisions.stream().noneMatch(b->b.equals(decision))) throw new IllegalStateException("Independent decision binding differs");
        }
        SkillLandscape landscape=JSON.readValue(canonicalPath.toFile(),SkillLandscape.class);
        Map<String,List<String>> children=new LinkedHashMap<>();
        for (Map<String,Object> goal:maps(canonical.get("goals"))) children.put(text(goal.get("id")),strings(goal.get("contains")));
        Set<String> newIds=new LinkedHashSet<>();
        for(Map<String,Object> binding:maps(plan.get("bindings"))) if (!Boolean.TRUE.equals(binding.get("assessmentIdentityAlreadyExists"))) newIds.add(text(binding.get("newAssessmentId")));
        Map<String,Object> addition=map(plan.get("approvedExistingAssessmentAddition"));
        String existingAddedId=text(addition.get("goalId"));
        Set<String> additionSourceViews=new LinkedHashSet<>(strings(addition.get("singleViewIds")));
        if(additionSourceViews.size()!=positiveCount(counts,"individualExistingB2References")) throw new IllegalStateException("Approved existing assessment source inventory differs");
        if(newIds.size()!=positiveCount(counts,"newAssessmentIdentities")) throw new IllegalStateException("New assessment identity inventory differs");
        List<Map<String,Object>> pairs=maps(plan.get("combinedMaterializations"));
        if(pairs.size()!=positiveCount(counts,"combinedDocuments")) throw new IllegalStateException("Combined materialization inventory differs");
        Set<String> outputIds=new LinkedHashSet<>(), outputFiles=new LinkedHashSet<>(), requestIds=new LinkedHashSet<>();
        for(Map<String,Object> pair:pairs) {
            if(!outputIds.add(text(pair.get("outputViewId"))) || !outputFiles.add(text(pair.get("outputFileName")))) throw new IllegalStateException("Duplicate combined output identity");
            for(String request:strings(pair.get("scopeRows"))) if(!requestIds.add(request)) throw new IllegalStateException("Duplicate combined request binding");
        }
        Map<String,Object> snapshots=map(plan.get("producerSourceSnapshots"));
        List<Map<String,Object>> reports=new ArrayList<>(); int requests=0, removedTotal=0;
        for(Map<String,Object> pair:pairs) {
            List<String> sourceIds=strings(pair.get("sourceViewIds"));
            List<String> sourcePaths=strings(pair.get("baselineSourcePaths"));
            if(sourceIds.size()!=2 || sourcePaths.size()!=2) throw new IllegalStateException("Exactly2source views required");
            List<Map<String,Object>> currentSources=new ArrayList<>(), baselineSources=new ArrayList<>();
            for(int i=0;i<2;i++) {
                Path currentPath=views.resolve(Path.of(sourcePaths.get(i)).getFileName());
                Map<String,Object> current=read(currentPath), snapshot=map(snapshots.get(sourcePaths.get(i)));
                Path beforePath=root.resolve(text(snapshot.get("path")));
                if(!sha(beforePath).equals(snapshot.get("sha256"))) throw new IllegalStateException("Bound before-view drift: "+beforePath);
                Map<String,Object> before=read(beforePath);
                if(!sourceIds.get(i).equals(current.get("viewId")) || !sourceIds.get(i).equals(before.get("viewId"))) throw new IllegalStateException("Source view identity differs");
                Set<String> permittedAdditions=new LinkedHashSet<>(newIds);
                if(additionSourceViews.contains(sourceIds.get(i))) {
                    if(effectiveCount(maps(before.get("rootNodes")),existingAddedId,children)>1 || effectiveCount(maps(current.get("rootNodes")),existingAddedId,children)!=1) throw new IllegalStateException("Existing B2 addition is missing, duplicate or already present: "+sourceIds.get(i));
                    permittedAdditions.add(existingAddedId);
                }
                if(!JSON.valueToTree(withoutNew(maps(current.get("rootNodes")),permittedAdditions)).equals(JSON.valueToTree(withoutNew(maps(before.get("rootNodes")),permittedAdditions)))) throw new IllegalStateException("Original source tree changed beyond new task references: "+sourceIds.get(i));
                currentSources.add(current); baselineSources.add(before);
            }
            Map<String,String> scope=stringMap(pair.get("scope"));
            if(!"GK+LK".equals(scope.get("courseProfile"))) throw new IllegalStateException("Exact combined profile required");
            List<Set<String>> unavailable=new ArrayList<>();
            for(Map<String,Object> source:currentSources) {
                Map<String,String> sourceScope=new LinkedHashMap<>(scope);
                sourceScope.put("courseProfile",text(map(source.get("scope")).get("courseProfile")));
                Set<String> denied=CourseProfileAvailability.unavailableGoals(landscape,sourceScope);
                if(denied==null) throw new IllegalStateException("Canonical production availability required");
                unavailable.add(denied);
            }
            List<List<Map<String,Object>>> sourceRoots=currentSources.stream().map(v->maps(v.get("rootNodes"))).toList();
            List<List<Map<String,Object>>> beforeRoots=baselineSources.stream().map(v->maps(v.get("rootNodes"))).toList();
            // Exactly the production Mathematics merger variant, including per-source course availability.
            List<Map<String,Object>> merged=CourseProfileCompositionViewMerger.mergeViews(sourceRoots,children,true,unavailable);
            List<Map<String,Object>> baseline=CourseProfileCompositionViewMerger.mergeViews(beforeRoots,children,true,unavailable);
            Set<String> omit=new LinkedHashSet<>(strings(pair.get("excludedNewAssessmentIds")));
            if(!newIds.containsAll(omit)) throw new IllegalStateException("May omit only explicitly bound new tasks");
            int beforeCount=count(merged,omit);
            if(beforeCount!=omit.size()) throw new IllegalStateException("Omission is missing or duplicated: "+sourceIds);
            List<Map<String,Object>> result=withoutNew(merged,omit);
            Set<String> permittedUnionAdditions=new LinkedHashSet<>(newIds);
            if(existingAddedId.equals(pair.get("approvedExistingAssessmentAddition"))) {
                if(effectiveCount(baseline,existingAddedId,children)>1 || effectiveCount(result,existingAddedId,children)!=1) throw new IllegalStateException("Union B2 addition is missing, duplicate or already present");
                permittedUnionAdditions.add(existingAddedId);
            }
            if(count(result,omit)!=0 || !JSON.valueToTree(withoutNew(result,permittedUnionAdditions)).equals(JSON.valueToTree(withoutNew(baseline,permittedUnionAdditions)))) throw new IllegalStateException("Old union target/support/tree contract changed");
            Map<String,Object> view=new LinkedHashMap<>();view.put("viewId",pair.get("outputViewId"));view.put("landscapeId",canonical.get("landscapeId"));view.put("scope",scope);view.put("rootNodes",result);
            String body=JSON.writerWithDefaultPrettyPrinter().writeValueAsString(view)+"\n";
            Path target=output.resolve(text(pair.get("outputFileName")));
            if(options.containsKey("check")) {
                if(!Files.exists(target)||!Files.readString(target).equals(body)) throw new IllegalStateException("Combined output stale or absent: "+target);
            } else { Files.createDirectories(target.getParent()); Files.writeString(target,body,StandardCharsets.UTF_8); }
            requests+=strings(pair.get("scopeRows")).size(); removedTotal+=beforeCount;
            Map<String,Object> report=new LinkedHashMap<>();report.put("viewId",pair.get("outputViewId"));report.put("fileName",pair.get("outputFileName"));report.put("scopeRows",pair.get("scopeRows"));report.put("scope",scope);report.put("omittedOnlyNewAssessmentIds",omit);report.put("allOriginalTargetsSupportAndPathsPreserved",true);report.put("approvedExistingB2Added",pair.containsKey("approvedExistingAssessmentAddition"));report.put("retainedNewAssessmentIds",references(result,newIds));report.put("sha256",sha(target));reports.add(report);
        }
        if(requests!=positiveCount(counts,"combinedRequests") || requests!=requestIds.size()) throw new IllegalStateException("Combined request inventory differs");
        Map<String,Object> report=new LinkedHashMap<>();report.put("status","ACTUAL_PRODUCTION_MERGER_BUILD_CHECK_PASS_NOT_STAGE_OR_NATIVE_APPROVAL");report.put("mode",options.containsKey("check")?"check":"write");report.put("combinedViews",reports.size());report.put("actualCombinedRequests",requests);report.put("omittedReferencesAcrossDocuments",removedTotal);report.put("productionAvailability",true);report.put("wholeCanonicalContainsGraph",true);report.put("planSha256",sha(planPath));report.put("canonicalSha256",sha(canonicalPath));report.put("rows",reports);
        if(options.containsKey("report")) { Path rp=root.resolve(options.get("report")); Files.createDirectories(rp.getParent()); JSON.writerWithDefaultPrettyPrinter().writeValue(rp.toFile(),report); }
        System.out.println(JSON.writeValueAsString(Map.of("mode",report.get("mode"),"combinedViews",reports.size(),"requests",requests,"omittedDocumentReferences",removedTotal)));
    }
    private static List<Map<String,Object>> withoutNew(List<Map<String,Object>> nodes,Set<String> omitted) {
        List<Map<String,Object>> result=new ArrayList<>();
        for(Map<String,Object> node:nodes) {
            String kind=text(node.get("kind"));
            if(("goalEntry".equals(kind)||"canonicalSubtree".equals(kind))&&omitted.contains(text(node.get("goalId"))))continue;
            Map<String,Object> copy=new LinkedHashMap<>(node);
            if("structure".equals(kind)) {
                List<Map<String,Object>> child=withoutNew(maps(node.get("children")),omitted);
                if(child.isEmpty()&&text(node.get("id")).startsWith("reviewed-stage-positive-contextual-terminal-"))continue;
                copy.put("children",child);
            }
            result.add(copy);
        }
        return result;
    }
    private static int effectiveCount(List<Map<String,Object>> nodes,String id,Map<String,List<String>> children) {int n=0;for(Map<String,Object> node:nodes){String kind=text(node.get("kind"));if("structure".equals(kind))n+=effectiveCount(maps(node.get("children")),id,children);else if(!"prerequisiteOnly".equals(node.get("projectionRole")) && ("goalEntry".equals(kind)&&id.equals(node.get("goalId")) || "canonicalSubtree".equals(kind)&&containsGoal(text(node.get("goalId")),id,children,new LinkedHashSet<>())))n++;}return n;}
    private static boolean containsGoal(String root,String target,Map<String,List<String>> children,Set<String> seen) {if(root.equals(target))return true;if(!seen.add(root))return false;for(String child:children.getOrDefault(root,List.of()))if(containsGoal(child,target,children,seen))return true;return false;}
    private static int count(List<Map<String,Object>> nodes,Set<String> ids) {int n=0;for(Map<String,Object> node:nodes){if("structure".equals(node.get("kind")))n+=count(maps(node.get("children")),ids);else if(ids.contains(text(node.get("goalId"))))n++;}return n;}
    private static Set<String> references(List<Map<String,Object>> nodes,Set<String> ids) {Set<String> out=new LinkedHashSet<>();for(String id:ids)if(count(nodes,Set.of(id))>0)out.add(id);return out;}
    private static int positiveCount(Map<String,Object> counts,String key) {Object value=counts.get(key);if(!(value instanceof Number n)||n.intValue()<1||n.doubleValue()!=n.intValue())throw new IllegalStateException("Positive bound count required: "+key);return n.intValue();}
    private static String shaUnchecked(Path p) {try{return sha(p);}catch(Exception e){throw new IllegalStateException("Bound file unreadable: "+p,e);}}
    private static String sha(Path p)throws Exception {return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(p)));}
    private static Map<String,Object> read(Path p)throws Exception{return JSON.readValue(p.toFile(),new TypeReference<LinkedHashMap<String,Object>>(){});}
    private static String text(Object value){return value==null?"":String.valueOf(value);}
    @SuppressWarnings("unchecked") private static Map<String,Object> map(Object value){if(!(value instanceof Map<?,?>))throw new IllegalStateException("Map required");return (Map<String,Object>)value;}
    private static Map<String,String> stringMap(Object value){Map<String,String> out=new LinkedHashMap<>();map(value).forEach((k,v)->out.put(k,text(v)));return out;}
    private static List<Map<String,Object>> maps(Object value){if(!(value instanceof List<?> list))throw new IllegalStateException("Node list required");return list.stream().map(MaterializeMathContextualCombinedViews::map).toList();}
    private static List<String> strings(Object value){if(value==null)return List.of();if(!(value instanceof List<?> list))throw new IllegalStateException("String list required");return list.stream().map(MaterializeMathContextualCombinedViews::text).toList();}
}
