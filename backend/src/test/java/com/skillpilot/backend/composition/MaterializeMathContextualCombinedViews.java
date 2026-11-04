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
        G5Placement g5=G5Placement.load(root,views,plan,boundDecisions,canonical,children);
        ReviewedExistingChanges existingChanges=ReviewedExistingChanges.load(root,plan,boundDecisions,canonical);
        Map<String,Object> snapshots=map(plan.get("producerSourceSnapshots"));
        existingChanges.preflightPositiveReferenceInventories(root,views,pairs,snapshots,children);
        GeometryPlacement.preflight(root,views,g5.g4Plan(plan),boundDecisions,canonical,children);
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
                g5.permitSource(current,permittedAdditions);
                Set<String> emptyWrappers=existingChanges.checkSource(pair,current,before,children,permittedAdditions);
                if(!JSON.valueToTree(withoutNew(maps(current.get("rootNodes")),permittedAdditions,emptyWrappers)).equals(JSON.valueToTree(withoutNew(maps(before.get("rootNodes")),permittedAdditions,emptyWrappers)))) throw new IllegalStateException("Original source tree changed beyond reviewed task references: "+sourceIds.get(i));
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
            g5.permitUnion(pair,permittedUnionAdditions);
            Set<String> unionEmptyWrappers=existingChanges.checkUnion(pair,result,baseline,children,permittedUnionAdditions);
            if(count(result,omit)!=0 || !JSON.valueToTree(withoutNew(result,permittedUnionAdditions,unionEmptyWrappers)).equals(JSON.valueToTree(withoutNew(baseline,permittedUnionAdditions,unionEmptyWrappers)))) throw new IllegalStateException("Old union target/support/tree contract changed");
            Map<String,Object> view=new LinkedHashMap<>();view.put("viewId",pair.get("outputViewId"));view.put("landscapeId",canonical.get("landscapeId"));view.put("scope",scope);view.put("rootNodes",result);
            String body=JSON.writerWithDefaultPrettyPrinter().writeValueAsString(view)+"\n";
            Path target=output.resolve(text(pair.get("outputFileName")));
            if(options.containsKey("check")) {
                if(!Files.exists(target)||!Files.readString(target).equals(body)) throw new IllegalStateException("Combined output stale or absent: "+target);
            } else { Files.createDirectories(target.getParent()); Files.writeString(target,body,StandardCharsets.UTF_8); }
            requests+=strings(pair.get("scopeRows")).size(); removedTotal+=beforeCount;
            Map<String,Object> report=new LinkedHashMap<>();report.put("viewId",pair.get("outputViewId"));report.put("fileName",pair.get("outputFileName"));report.put("scopeRows",pair.get("scopeRows"));report.put("scope",scope);report.put("omittedOnlyNewAssessmentIds",omit);report.put("allOriginalTargetsSupportAndPathsPreserved",true);report.put("approvedExistingB2Added",pair.containsKey("approvedExistingAssessmentAddition"));report.put("retainedNewAssessmentIds",references(result,newIds));report.put("sha256",sha(target));reports.add(report);
        }
        existingChanges.requireComplete();
        if(requests!=positiveCount(counts,"combinedRequests") || requests!=requestIds.size()) throw new IllegalStateException("Combined request inventory differs");
        Map<String,Object> report=new LinkedHashMap<>();report.put("status","ACTUAL_PRODUCTION_MERGER_BUILD_CHECK_PASS_NOT_STAGE_OR_NATIVE_APPROVAL");report.put("mode",options.containsKey("check")?"check":"write");report.put("combinedViews",reports.size());report.put("actualCombinedRequests",requests);report.put("omittedReferencesAcrossDocuments",removedTotal);report.put("productionAvailability",true);report.put("wholeCanonicalContainsGraph",true);report.put("planSha256",sha(planPath));report.put("canonicalSha256",sha(canonicalPath));report.put("rows",reports);
        if(options.containsKey("report")) { Path rp=root.resolve(options.get("report")); Files.createDirectories(rp.getParent()); JSON.writerWithDefaultPrettyPrinter().writeValue(rp.toFile(),report); }
        System.out.println(JSON.writeValueAsString(Map.of("mode",report.get("mode"),"combinedViews",reports.size(),"requests",requests,"omittedDocumentReferences",removedTotal)));
    }
    private static List<Map<String,Object>> withoutNew(List<Map<String,Object>> nodes,Set<String> omitted) {
        return withoutNew(nodes,omitted,Set.of());
    }
    private static List<Map<String,Object>> withoutNew(List<Map<String,Object>> nodes,Set<String> omitted,Set<String> emptyWrappers) {
        List<Map<String,Object>> result=new ArrayList<>();
        for(Map<String,Object> node:nodes) {
            String kind=text(node.get("kind"));
            if(("goalEntry".equals(kind)||"canonicalSubtree".equals(kind))&&omitted.contains(text(node.get("goalId"))))continue;
            Map<String,Object> copy=new LinkedHashMap<>(node);
            if("structure".equals(kind)) {
                List<Map<String,Object>> child=withoutNew(maps(node.get("children")),omitted,emptyWrappers);
                if(child.isEmpty()&&(text(node.get("id")).startsWith("reviewed-stage-positive-contextual-terminal-")||emptyWrappers.contains(text(node.get("id")))))continue;
                copy.put("children",child);
            }
            result.add(copy);
        }
        return result;
    }
    /** Only this bound finite record supplements the original independent B2 allowance. */
    private record ExistingAssessmentAllowance(String goalId,Set<String> positives,Set<String> exclusions,Set<String> unions) { }
    private static final class ReviewedExistingChanges {
        private final Map<String,ExistingAssessmentAllowance> allowances=new LinkedHashMap<>();
        private final Map<String,Map<String,Object>> sources=new LinkedHashMap<>(),unions=new LinkedHashMap<>();
        private final Set<String> seenSources=new LinkedHashSet<>(),seenUnions=new LinkedHashSet<>();
        private final Set<String> actualAdditionWrappers=new LinkedHashSet<>();
        private final Map<String,Set<String>> approvedScopes=new LinkedHashMap<>();
        private List<Map<String,Object>> masks=List.of();
        static ReviewedExistingChanges load(Path root,Map<String,Object> plan,List<Map<String,Object>> policyBindings,Map<String,Object> canonical)throws Exception {
            var result=new ReviewedExistingChanges();
            if(!plan.containsKey("reviewedExistingAssessmentChanges"))return result;
            Map<String,Object> binding=map(plan.get("reviewedExistingAssessmentChanges"));
            requireBound(root,binding,policyBindings);
            Map<String,Object> input=read(root.resolve(text(binding.get("path")))),reviewBinding=map(input.get("review"));
            requireBound(root,reviewBinding,policyBindings);
            if(maps(plan.get("independentDecisionBindings")).stream().noneMatch(reviewBinding::equals))throw new IllegalStateException("Existing assessment review lacks finite-plan binding");
            Map<String,Object> review=read(root.resolve(text(reviewBinding.get("path"))));
            if(!Integer.valueOf(1).equals(input.get("schemaVersion"))||!"review-bound-finite-existing-assessment-view-deltas".equals(input.get("kind"))||!"APPROVED_BOUNDED_EXISTING_ROUTE_SOURCE_SCOPE_AND_FINITE_PLACEMENT".equals(review.get("status")))throw new IllegalStateException("Existing assessment decision schema/status differs");
            Map<String,Object> decision=map(review.get("combined39IntegrationAllowance"));
            equal(input.get("existingAssessmentAllowances"),decision.get("existingAssessmentAllowances"),"Unreviewed existing assessment allowance");
            equal(input.get("maskAllowances"),decision.get("maskAllowances"),"Unreviewed existing assessment mask");
            equal(input.get("approvedTargetScopePairs"),review.get("approvedTargetScopePairs"),"Existing assessment scope pairs differ");
            map(input.get("approvedTargetScopePairs")).forEach((id,scopes)->result.approvedScopes.put(id,uniqueStrings(scopes)));
            equal(input.get("preserveOriginalB2Allowance"),plan.get("approvedExistingAssessmentAddition"),"Original B2 binding changed");
            if(!Integer.valueOf(39).equals(input.get("originalCombinedDocuments"))||!Integer.valueOf(46).equals(input.get("originalCombinedRequests")))throw new IllegalStateException("Existing assessment combined inventory differs");
            Map<String,Map<String,Object>> goals=new LinkedHashMap<>();for(var goal:maps(canonical.get("goals")))goals.put(text(goal.get("id")),goal);
            for(var row:maps(input.get("existingAssessmentAllowances"))) {
                String id=text(row.get("goalId"));Map<String,Object> goal=goals.get(id);
                if(goal==null||!strings(goal.get("contains")).isEmpty()||!goal.containsKey("examData")||!"released".equals(map(goal.get("examData")).get("reviewStatus")))throw new IllegalStateException("Existing allowance requires a released atomic assessment");
                var a=new ExistingAssessmentAllowance(id,uniqueStrings(row.get("positiveSourceViewIds")),uniqueStrings(row.get("excludedSourceViewIds")),uniqueStrings(row.get("combinedOutputViewIds")));
                if(!java.util.Collections.disjoint(a.positives(),a.exclusions())||result.allowances.put(id,a)!=null)throw new IllegalStateException("Duplicate/conflicting existing allowance");
            }
            result.masks=maps(input.get("maskAllowances"));
            Set<String> expectedSources=new LinkedHashSet<>(),expectedUnions=new LinkedHashSet<>();for(var a:result.allowances.values()){expectedSources.addAll(a.positives());expectedSources.addAll(a.exclusions());expectedUnions.addAll(a.unions());}
            for(var row:maps(input.get("sourceRules"))) {
                String vid=text(row.get("viewId"));if(result.sources.put(vid,row)!=null)throw new IllegalStateException("Duplicate existing source rule");
                Set<String> positive=new LinkedHashSet<>(),excluded=new LinkedHashSet<>();for(var a:result.allowances.values()){if(a.positives().contains(vid))positive.add(a.goalId());if(a.exclusions().contains(vid))excluded.add(a.goalId());}
                if(!positive.equals(uniqueStrings(row.get("positiveGoalIds")))||!excluded.equals(uniqueStrings(row.get("excludedGoalIds"))))throw new IllegalStateException("Existing source goal inventory differs");
                equal(row.get("approvedOperations"),maps(review.get("approvedExactAssessmentScopeOperations")).stream().filter(o->vid.equals(o.get("viewId"))).toList(),"Existing source operations differ from review");
            }
            for(var row:maps(input.get("combinedRules"))) {
                String vid=text(row.get("viewId"));if(result.unions.put(vid,row)!=null)throw new IllegalStateException("Duplicate existing union rule");
                var pair=maps(plan.get("combinedMaterializations")).stream().filter(p->vid.equals(p.get("outputViewId"))).findFirst().orElseThrow();
                for(String key:List.of("scope","scopeRows","sourceViewIds"))equal(row.get(key),pair.get(key),"Existing union exact scope/source binding differs");
                Set<String> positive=new LinkedHashSet<>();for(var a:result.allowances.values())if(a.unions().contains(vid))positive.add(a.goalId());
                if(!positive.equals(uniqueStrings(row.get("positiveGoalIds"))))throw new IllegalStateException("Existing union goal inventory differs");
                for(String id:positive)if(!strings(map(input.get("approvedTargetScopePairs")).get(id)).containsAll(strings(row.get("scopeRows"))))throw new IllegalStateException("Unreviewed existing union scope");
            }
            if(!result.sources.keySet().equals(expectedSources)||!result.unions.keySet().equals(expectedUnions))throw new IllegalStateException("Existing view allowance inventory differs");
            return result;
        }
        Set<String> checkSource(Map<String,Object> pair,Map<String,Object> current,Map<String,Object> before,Map<String,List<String>> children,Set<String> permitted) {
            String vid=text(current.get("viewId"));var rule=sources.get(vid);if(rule==null)return Set.of();seenSources.add(vid);
            equal(current.get("scope"),rule.get("scope"),"Existing source current scope differs");equal(before.get("scope"),rule.get("scope"),"Existing source original scope differs");
            List<Map<String,Object>> oldNodes=maps(before.get("rootNodes")),nodes=maps(current.get("rootNodes"));
            Set<String> oldTargets=CourseProfileCompositionViewMerger.projectionTargetGoalIds(oldNodes,children),targets=CourseProfileCompositionViewMerger.projectionTargetGoalIds(nodes,children),expected=new LinkedHashSet<>(oldTargets),wrappers=new LinkedHashSet<>();
            for(String id:strings(rule.get("positiveGoalIds"))) {
                expected.add(id);if(!targets.contains(id)||effectiveCount(nodes,id,children)!=1)throw new IllegalStateException("Existing positive source is missing or duplicated: "+vid+" "+id);
                checkPositiveReferenceInventory(nodes,oldNodes,id,oldTargets.contains(id));
                for(String scope:strings(pair.get("scopeRows"))) {
                    String ownScope=scope.substring(0,scope.lastIndexOf('/')+1)+text(map(current.get("scope")).get("courseProfile"));
                    if(!allowances.get(id).positives().contains(vid)||!approvedScopes.get(id).contains(ownScope))throw new IllegalStateException("Existing source profile/scope pair differs");
                }
                for(var op:maps(rule.get("approvedOperations")))if(strings(op.get("goalIds")).contains(id)&&"include-target".equals(op.get("action"))) {
                    String wrapper="reviewed-stage-positive-"+text(op.get("id"));
                    if(!oldTargets.contains(id)) {
                        wrappers.add(wrapper);actualAdditionWrappers.add(wrapper);
                        var anchors=structures(nodes,text(op.get("anchorStructureId")));var expectedWrapper=Map.of("kind","structure","id",wrapper,"label",op.get("label"),"children",List.of(Map.of("kind","goalEntry","goalId",id)));
                        if(anchors.size()!=1||maps(anchors.get(0).get("children")).stream().filter(n->JSON.valueToTree(n).equals(JSON.valueToTree(expectedWrapper))).count()!=1||structures(nodes,wrapper).size()!=1)throw new IllegalStateException("Existing addition exact wrapper/anchor differs");
                    }
                }
                permitted.add(id);
            }
            for(String id:strings(rule.get("excludedGoalIds"))) {
                expected.remove(id);var approved=masks.stream().filter(m->vid.equals(m.get("viewId"))&&id.equals(m.get("goalId"))).toList();
                if(approved.size()!=1||!oldTargets.contains(id)||targets.contains(id)||exactReferences(nodes,id).size()!=1)throw new IllegalStateException("Existing excluded source role/mask inventory differs");
                var exact=map(approved.get(0).get("directMaskShape"));if(nodes.stream().filter(n->JSON.valueToTree(n).equals(JSON.valueToTree(exact))).count()!=1)throw new IllegalStateException("Existing excluded source exact root mask differs");
                for(String scope:strings(pair.get("scopeRows"))){String ownScope=scope.substring(0,scope.lastIndexOf('/')+1)+text(map(current.get("scope")).get("courseProfile"));if(approvedScopes.get(id).contains(ownScope))throw new IllegalStateException("Existing exclusion conflicts with approved positive scope");}
                permitted.add(id);
            }
            var actual=new LinkedHashSet<>(targets);actual.removeAll(permitted);expected.removeAll(permitted);
            if(!actual.equals(expected))throw new IllegalStateException("Existing source changed another resolved target");
            return wrappers;
        }
        Set<String> checkUnion(Map<String,Object> pair,List<Map<String,Object>> result,List<Map<String,Object>> before,Map<String,List<String>> children,Set<String> permitted) {
            String vid=text(pair.get("outputViewId"));var rule=unions.get(vid);if(rule==null)return Set.of();seenUnions.add(vid);
            equal(pair.get("scope"),rule.get("scope"),"Existing union scope differs");equal(pair.get("scopeRows"),rule.get("scopeRows"),"Existing union scope rows differ");equal(pair.get("sourceViewIds"),rule.get("sourceViewIds"),"Existing union source views differ");
            var expected=new LinkedHashSet<>(CourseProfileCompositionViewMerger.projectionTargetGoalIds(before,children));var actual=new LinkedHashSet<>(CourseProfileCompositionViewMerger.projectionTargetGoalIds(result,children));Set<String> wrappers=new LinkedHashSet<>();
            for(String id:strings(rule.get("positiveGoalIds"))) {
                expected.add(id);if(!actual.contains(id)||effectiveCount(result,id,children)!=1)throw new IllegalStateException("Existing union positive role missing/duplicate");permitted.add(id);
                for(String source:strings(pair.get("sourceViewIds"))) {var sourceRule=sources.get(source);if(sourceRule==null)continue;for(var op:maps(sourceRule.get("approvedOperations")))if(strings(op.get("goalIds")).contains(id)&&"include-target".equals(op.get("action"))){String wrapper="reviewed-stage-positive-"+text(op.get("id"));if(actualAdditionWrappers.contains(wrapper))wrappers.add(wrapper);}}
            }
            expected.removeAll(permitted);actual.removeAll(permitted);if(!actual.equals(expected))throw new IllegalStateException("Existing union changed another resolved target");return wrappers;
        }
        void requireComplete(){if(!seenSources.equals(sources.keySet())||!seenUnions.equals(unions.keySet()))throw new IllegalStateException("Existing source/union rules were not all consumed");}
        private static void requireBound(Path root,Map<String,Object> binding,List<Map<String,Object>> policy)throws Exception {if(policy.stream().noneMatch(binding::equals)||!sha(root.resolve(text(binding.get("path")))).equals(binding.get("sha256")))throw new IllegalStateException("Existing assessment allowance/review binding differs");}
        private static Set<String> uniqueStrings(Object value){var values=strings(value);var set=new LinkedHashSet<>(values);if(set.size()!=values.size()||set.stream().anyMatch(String::isBlank))throw new IllegalStateException("Duplicate/empty existing allowance identity");return set;}
        private static void equal(Object a,Object b,String message){if(!JSON.valueToTree(a).equals(JSON.valueToTree(b)))throw new IllegalStateException(message);}
        private static List<Map<String,Object>> structures(List<Map<String,Object>> nodes,String id){var out=new ArrayList<Map<String,Object>>();for(var n:nodes)if("structure".equals(n.get("kind"))){if(id.equals(n.get("id")))out.add(n);out.addAll(structures(maps(n.get("children")),id));}return out;}
        private void preflightPositiveReferenceInventories(Path root,Path views,List<Map<String,Object>> pairs,Map<String,Object> snapshots,Map<String,List<String>> children)throws Exception {
            Map<String,String> paths=new LinkedHashMap<>();
            for(var pair:pairs){var ids=strings(pair.get("sourceViewIds"));var sourcePaths=strings(pair.get("baselineSourcePaths"));for(int i=0;i<ids.size();i++){String prior=paths.putIfAbsent(ids.get(i),sourcePaths.get(i));if(prior!=null&&!prior.equals(sourcePaths.get(i)))throw new IllegalStateException("Existing positive source path differs");}}
            for(var rule:sources.values()) {
                var positive=strings(rule.get("positiveGoalIds"));if(positive.isEmpty())continue;
                String path=paths.get(text(rule.get("viewId")));if(path==null)throw new IllegalStateException("Existing positive source is absent");
                var snapshot=map(snapshots.get(path));Path oldPath=root.resolve(text(snapshot.get("path")));
                if(!sha(oldPath).equals(snapshot.get("sha256")))throw new IllegalStateException("Bound before-view drift: "+oldPath);
                var before=read(oldPath);var current=read(views.resolve(Path.of(path).getFileName()));
                var oldNodes=maps(before.get("rootNodes"));var nodes=maps(current.get("rootNodes"));var oldTargets=CourseProfileCompositionViewMerger.projectionTargetGoalIds(oldNodes,children);
                for(String id:positive)checkPositiveReferenceInventory(nodes,oldNodes,id,oldTargets.contains(id));
            }
        }
        private static void checkPositiveReferenceInventory(List<Map<String,Object>> nodes,List<Map<String,Object>> before,String id,boolean retained) {
            if(retained)equal(referenceInventory(nodes,id,List.of()),referenceInventory(before,id,List.of()),"Existing retained source direct-reference inventory differs");
            else {var refs=exactReferences(nodes,id);if(refs.size()!=1||!JSON.valueToTree(refs.get(0)).equals(JSON.valueToTree(Map.of("kind","goalEntry","goalId",id))))throw new IllegalStateException("Existing added source direct-reference inventory differs");}
        }
        private static List<Map<String,Object>> referenceInventory(List<Map<String,Object>> nodes,String id,List<Integer> parentPath) {
            var out=new ArrayList<Map<String,Object>>();
            for(int index=0;index<nodes.size();index++) {
                var node=nodes.get(index);var path=new ArrayList<>(parentPath);path.add(index);
                if("structure".equals(node.get("kind")))out.addAll(referenceInventory(maps(node.get("children")),id,path));
                else if(id.equals(node.get("goalId")))out.add(Map.of("nodePath",List.copyOf(path),"reference",node));
            }
            return out;
        }
        private static List<Map<String,Object>> exactReferences(List<Map<String,Object>> nodes,String id){var out=new ArrayList<Map<String,Object>>();for(var n:nodes){if("structure".equals(n.get("kind")))out.addAll(exactReferences(maps(n.get("children")),id));else if(id.equals(n.get("goalId")))out.add(n);}return out;}
    }



    /** Exact additive extension: the complete original G4 plan is checked by its unchanged G4 guard. */
    private static final class G5Placement {
        private static final String KEY="geometrySixDgl1ExistingRoutesPlacement";
        private static final Set<String> IDS=Set.of("f0894721-49e1-5860-a3a6-afba2d2cc08b","a79d589d-8679-5f3e-812f-6affdd8b1f58");
        private Map<String,Object> base;
        private final Map<String,Set<String>> sourceAdditions=new LinkedHashMap<>(),unionAdditions=new LinkedHashMap<>();
        Map<String,Object> g4Plan(Map<String,Object> current){return base==null?current:base;}
        void permitSource(Map<String,Object> view,Set<String> permitted){permitted.addAll(sourceAdditions.getOrDefault(text(view.get("viewId")),Set.of()));}
        void permitUnion(Map<String,Object> pair,Set<String> permitted){permitted.addAll(unionAdditions.getOrDefault(text(pair.get("outputViewId")),Set.of()));}
        static G5Placement load(Path root,Path views,Map<String,Object> plan,List<Map<String,Object>> bindings,Map<String,Object> canonical,Map<String,List<String>> children)throws Exception {
            var out=new G5Placement();
            if(!plan.containsKey(KEY)) {
                if(maps(canonical.get("goals")).stream().anyMatch(g->IDS.contains(text(g.get("id"))))||maps(plan.get("assessmentScopeOperations")).stream().anyMatch(o->text(o.get("id")).startsWith("contextual-terminal-g5-")))throw new IllegalStateException("G5 exact additive guard binding is required");
                return out;
            }
            var binding=map(plan.get(KEY));ReviewedExistingChanges.requireBound(root,binding,bindings);var rule=read(root.resolve(text(binding.get("path"))));
            if(!Integer.valueOf(1).equals(rule.get("schemaVersion"))||!"exact-additive-g5-development-contract".equals(rule.get("kind"))||!Boolean.TRUE.equals(rule.get("authorProposalIsNotReviewAcceptance")))throw new IllegalStateException("G5 explicit development contract differs");
            if(!IDS.equals(new LinkedHashSet<>(strings(rule.get("newAssessmentIds"))))||strings(rule.get("newAssessmentIds")).size()!=2)throw new IllegalStateException("G5 exact two identities differ");
            for(var b:maps(rule.get("wholeContentReviews")))ReviewedExistingChanges.requireBound(root,b,bindings);
            var bb=map(rule.get("baseFinitePlan"));ReviewedExistingChanges.requireBound(root,bb,bindings);out.base=read(root.resolve(text(bb.get("path"))));
            var mutable=Set.of("counts","assessmentScopeOperations","bindings","independentDecisionBindings","combinedMaterializations");
            for(var key:out.base.keySet())if(!mutable.contains(key))ReviewedExistingChanges.equal(plan.get(key),out.base.get(key),"G5 changed original finite field: "+key);
            var allowedKeys=new LinkedHashSet<>(out.base.keySet());allowedKeys.add(KEY);if(!plan.keySet().equals(allowedKeys))throw new IllegalStateException("G5 unexpected finite plan fields");
            ReviewedExistingChanges.equal(plan.get("counts"),rule.get("exactCounts"),"G5 exact counts differ");
            for(var pair:List.of(List.of("assessmentScopeOperations","exactOperations"),List.of("bindings","exactNewBindings"),List.of("independentDecisionBindings","exactAdditionalIndependentDecisionBindings"))) {
                var old=(List<?>)out.base.get(pair.get(0));var current=(List<?>)plan.get(pair.get(0));var added=(List<?>)rule.get(pair.get(1));
                if(current.size()!=old.size()+added.size())throw new IllegalStateException("G5 finite prefix size differs");
                ReviewedExistingChanges.equal(current.subList(0,old.size()),old,"G5 original finite prefix changed");ReviewedExistingChanges.equal(current.subList(old.size(),current.size()),added,"G5 exact appended finite inventory differs");
            }
            if(maps(rule.get("exactOperations")).size()!=98||maps(rule.get("exactNewBindings")).size()!=98)throw new IllegalStateException("G5 exact operation cardinality differs");
            ReviewedExistingChanges.equal(plan.get("combinedMaterializations"),rule.get("exactCombinedMaterializations"),"G5 exact combined plan differs");
            var originalPairs=maps(out.base.get("combinedMaterializations"));var pairs=maps(plan.get("combinedMaterializations"));if(originalPairs.size()!=39||pairs.size()!=39)throw new IllegalStateException("G5 original39 union inventory differs");
            for(int i=0;i<pairs.size();i++)for(String key:originalPairs.get(i).keySet())if(!Set.of("excludedNewAssessmentIds","excludeNewAssessmentForOriginalGoalIds").contains(key))ReviewedExistingChanges.equal(pairs.get(i).get(key),originalPairs.get(i).get(key),"G5 old union field differs: "+key);
            Map<String,Map<String,Object>> goals=new LinkedHashMap<>();for(var g:maps(canonical.get("goals")))goals.put(text(g.get("id")),g);
            String af="af7905d0-e684-5ea3-99ac-8a045455370e";var afRule=map(rule.get("af790ExactDecision"));var afDecisionBinding=map(afRule.get("decision"));ReviewedExistingChanges.requireBound(root,afDecisionBinding,bindings);var afDecision=read(root.resolve(text(afDecisionBinding.get("path"))));
            if(!"PASS_FOR_WHOLE_UNCHANGED_AF790_IN_EXACT_FOUR_BY_G9_SCOPES".equals(afDecision.get("decision"))||!Boolean.TRUE.equals(afDecision.get("authorIndependent"))||!af.equals(afDecision.get("assessmentId")))throw new IllegalStateException("G5 af790 genuine independent decision differs");
            var afScopes=List.of("DE-BY/CrossStage/G9/GK","DE-BY/CrossStage/G9/GK+LK","DE-BY/CrossStage/G9/LK","DE-BY/SekI/G9/GK+LK");ReviewedExistingChanges.equal(afScopes,afDecision.get("approvedTargetScopePairs"),"G5 af790 exact approved scope pairs differ");ReviewedExistingChanges.equal(afScopes,map(rule.get("exactAdditionalTargetScopePairs")).get(af),"G5 af790 exact placement scope pairs differ");
            var afOriginalBinding=map(afRule.get("originalCanonical"));ReviewedExistingChanges.requireBound(root,afOriginalBinding,bindings);Map<String,Map<String,Object>> afOriginalGoals=new LinkedHashMap<>();for(var g:maps(read(root.resolve(text(afOriginalBinding.get("path")))).get("goals")))afOriginalGoals.put(text(g.get("id")),g);var afOriginal=afOriginalGoals.get(af);ReviewedExistingChanges.equal(afOriginal,afRule.get("originalWholeGoal"),"G5 af790 original whole canonical goal differs");
            var afGoal=goals.get(af);var afExpected=new LinkedHashMap<>(afOriginal);var afMetadata=map(afDecision.get("finiteMetadataRepair"));afExpected.put("applicability",afMetadata.get("approvedAfterApplicability"));afExpected.put("extendedData",afMetadata.get("approvedAfterExtendedData"));ReviewedExistingChanges.equal(afExpected,afGoal,"G5 af790 changed task, solution, rubric, R, coverage or unapproved metadata");ReviewedExistingChanges.equal(afExpected,afRule.get("approvedWholeGoal"),"G5 af790 exact approved whole-goal binding differs");
            var afPreparation=new LinkedHashSet<String>();var afPending=new ArrayList<>(List.of(af));while(!afPending.isEmpty()){String id=afPending.remove(afPending.size()-1);if(!afPreparation.add(id))continue;var originalGoal=afOriginalGoals.get(id);if(originalGoal==null)throw new IllegalStateException("G5 af790 missing original preparation goal");if(!af.equals(id))ReviewedExistingChanges.equal(originalGoal,goals.get(id),"G5 af790 changed prerequisite applicability or whole preparation goal: "+id);afPending.addAll(strings(originalGoal.get("requires")));}if(afPreparation.size()!=76)throw new IllegalStateException("G5 af790 original whole preparation inventory differs");
            var afOps=maps(rule.get("exactOperations")).stream().filter(op->strings(op.get("goalIds")).contains(af)).toList();if(afOps.size()!=3||!Set.of("de-by-gym-math-gk","de-by-gym-math-lk","de-by-gym-seki-math").equals(afOps.stream().map(op->text(op.get("viewId"))).collect(java.util.stream.Collectors.toSet())))throw new IllegalStateException("G5 af790 exact three source operations differ");
            for(var op:afOps)if(!(("de-by-gym-math-lk".equals(op.get("viewId"))?"lk":"gk")+"-sek-i-j10").equals(op.get("anchorStructureId")))throw new IllegalStateException("G5 af790 existing J10 assessment path differs");
            for(String id:IDS) {
                var g=goals.get(id);if(g==null||!"exam".equals(g.get("nodeKind"))||!strings(g.get("contains")).isEmpty()||!"released".equals(map(g.get("examData")).get("reviewStatus"))||map(g.get("extendedData")).containsKey("applicabilityFromRequires"))throw new IllegalStateException("G5 new terminal identity/availability differs");
                ReviewedExistingChanges.equal(g.get("requires"),map(rule.get("newGoalRequires")).get(id),"G5 own form preparation differs");
            }
            Set<String> consumedOperations=new LinkedHashSet<>(),seenViews=new LinkedHashSet<>();
            for(var row:maps(rule.get("sourceRules"))) {
                String vid=text(row.get("viewId"));if(!seenViews.add(vid))throw new IllegalStateException("G5 duplicate source baseline");
                var b=map(row.get("baselineView"));ReviewedExistingChanges.requireBound(root,b,bindings);var before=read(root.resolve(text(b.get("path"))));var current=read(views.resolve(Path.of(text(b.get("path"))).getFileName()));
                if(!vid.equals(current.get("viewId"))||!vid.equals(before.get("viewId")))throw new IllegalStateException("G5 source view identity differs");
                Set<String> wrappers=new LinkedHashSet<>(),adds=new LinkedHashSet<>();
                for(var op:maps(row.get("operations"))) {
                    if(!vid.equals(op.get("viewId"))||!"include-target".equals(op.get("action"))||strings(op.get("goalIds")).size()!=1||!consumedOperations.add(text(op.get("id"))))throw new IllegalStateException("G5 source operation differs");
                    if(maps(rule.get("exactOperations")).stream().noneMatch(x->JSON.valueToTree(x).equals(JSON.valueToTree(op))))throw new IllegalStateException("G5 unbound source operation");
                    String id=strings(op.get("goalIds")).get(0),wrapper="reviewed-stage-positive-"+text(op.get("id"));adds.add(id);
                    var expected=Map.of("kind","structure","id",wrapper,"label",op.get("label"),"children",List.of(Map.of("kind","goalEntry","goalId",id)));
                    var nodes=maps(current.get("rootNodes"));var anchors=ReviewedExistingChanges.structures(nodes,text(op.get("anchorStructureId")));
                    if(af.equals(id)) {
                        var originalExamSubtree=Map.of("kind","canonicalSubtree","goalId","cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8","displayLabel","Prüfungen Jahrgangsstufe 10");
                        if(anchors.size()!=1||!CourseProfileCompositionViewMerger.projectionTargetGoalIds(maps(before.get("rootNodes")),children).contains(af)||maps(anchors.get(0).get("children")).stream().filter(x->JSON.valueToTree(x).equals(JSON.valueToTree(originalExamSubtree))).count()!=1||!ReviewedExistingChanges.exactReferences(nodes,af).isEmpty())throw new IllegalStateException("G5 af790 retained existing whole J10 subtree differs or duplicate direct path added");
                    } else {
                        wrappers.add(wrapper);
                        if(anchors.size()!=1||ReviewedExistingChanges.structures(nodes,wrapper).size()!=1||maps(anchors.get(0).get("children")).stream().filter(x->JSON.valueToTree(x).equals(JSON.valueToTree(expected))).count()!=1)throw new IllegalStateException("G5 exact positive wrapper/anchor differs");
                    }
                }
                var stripped=new LinkedHashMap<>(current);stripped.put("rootNodes",removeWrappers(maps(current.get("rootNodes")),wrappers));ReviewedExistingChanges.equal(stripped,before,"G5 changed original G4 whole source beyond exact appended wrappers: "+vid);
                var expected=new LinkedHashSet<>(CourseProfileCompositionViewMerger.projectionTargetGoalIds(maps(before.get("rootNodes")),children));expected.addAll(adds);
                if(!expected.equals(CourseProfileCompositionViewMerger.projectionTargetGoalIds(maps(current.get("rootNodes")),children)))throw new IllegalStateException("G5 source target delta differs");
                out.sourceAdditions.put(vid,adds);
            }
            if(consumedOperations.size()!=98)throw new IllegalStateException("G5 not all exact source operations consumed");
            for(var pair:pairs) {
                Set<String> adds=new LinkedHashSet<>();for(String vid:strings(pair.get("sourceViewIds")))adds.addAll(out.sourceAdditions.getOrDefault(vid,Set.of()));adds.removeAll(strings(pair.get("excludedNewAssessmentIds")));
                for(String id:adds)if(!strings(map(rule.get("exactAdditionalTargetScopePairs")).get(id)).containsAll(strings(pair.get("scopeRows"))))throw new IllegalStateException("G5 additional union target outside exact scope");
                out.unionAdditions.put(text(pair.get("outputViewId")),adds);
            }
            return out;
        }
        private static List<Map<String,Object>> removeWrappers(List<Map<String,Object>> nodes,Set<String> ids) {
            var result=new ArrayList<Map<String,Object>>();for(var node:nodes){if("structure".equals(node.get("kind"))&&ids.contains(text(node.get("id"))))continue;var n=new LinkedHashMap<>(node);if("structure".equals(n.get("kind")))n.put("children",removeWrappers(maps(n.get("children")),ids));result.add(n);}return result;
        }
    }

    /** Exact additive G4 producer contract; the original B2 and G3 guards remain in force. */
    private static final class GeometryPlacement {
        private static final String ID="dd1954f6-0941-55a9-88d2-e2980ed902fd";
        private static final Set<String> SOURCES=Set.of("de-by-gym-sekii-math-lk","de-by-gym-math-lk");
        private static final Set<String> SCOPES=Set.of("DE-BY/SekII/G9/LK","DE-BY/SekII/G9/GK+LK","DE-BY/CrossStage/G9/LK","DE-BY/CrossStage/G9/GK+LK");
        private static boolean containsG4Identity(Object value) {
            if(ID.equals(value))return true;
            if(value instanceof Map<?,?> values)return values.entrySet().stream().anyMatch(entry->ID.equals(entry.getKey())||containsG4Identity(entry.getValue()));
            if(value instanceof List<?> values)return values.stream().anyMatch(GeometryPlacement::containsG4Identity);
            return false;
        }
        static void preflight(Path root,Path views,Map<String,Object> plan,List<Map<String,Object>> bindings,Map<String,Object> canonical,Map<String,List<String>> children)throws Exception {
            if(!plan.containsKey("geometryFourAssessmentPlacement")) {
                if(containsG4Identity(canonical)||containsG4Identity(plan)||containsG4Identity(bindings))throw new IllegalStateException("G4 assessment identity requires geometryFourAssessmentPlacement");
                return;
            }
            var binding=map(plan.get("geometryFourAssessmentPlacement"));ReviewedExistingChanges.requireBound(root,binding,bindings);
            var rule=read(root.resolve(text(binding.get("path"))));
            if(!Integer.valueOf(1).equals(rule.get("schemaVersion"))||!"exact-reviewed-content-conditional-geometry-placement".equals(rule.get("kind"))||!ID.equals(rule.get("newAssessmentId")))throw new IllegalStateException("G4 identity/schema differs");
            var reviewBinding=map(rule.get("contentReview"));ReviewedExistingChanges.requireBound(root,reviewBinding,bindings);
            if(maps(plan.get("independentDecisionBindings")).stream().noneMatch(reviewBinding::equals))throw new IllegalStateException("G4 content review lacks plan binding");
            var review=read(root.resolve(text(reviewBinding.get("path"))));
            if(!"CONTENT_CONDITIONAL_ACCEPTED".equals(review.get("status")))throw new IllegalStateException("G4 content decision differs");
            if(!SCOPES.equals(new LinkedHashSet<>(strings(rule.get("approvedTargetScopePairs"))))||strings(rule.get("approvedTargetScopePairs")).size()!=4)throw new IllegalStateException("G4 exact four scope pairs differ");
            var expectedR=List.of("5748633c-113f-5ea8-9041-24da55919de7","effe43eb-cabe-56cb-a228-35887d7915c1");
            ReviewedExistingChanges.equal(rule.get("requires"),expectedR,"G4 form-specific preparation differs");
            var goal=maps(canonical.get("goals")).stream().filter(g->ID.equals(g.get("id"))).findFirst().orElseThrow();
            ReviewedExistingChanges.equal(goal.get("requires"),expectedR,"G4 canonical preparation differs");
            ReviewedExistingChanges.equal(map(goal.get("examData")).get("coveredGoalIds"),List.of(expectedR.get(0)),"G4 scored coverage differs");
            ReviewedExistingChanges.equal(goal.get("applicability"),Map.of("jurisdiction",List.of("DE-BY"),"courseProfile",List.of("LK")),"G4 explicit BY/LK availability differs");
            ReviewedExistingChanges.equal(goal.get("extendedData"),Map.of("applicabilityMappingInheritance","boundary","applicabilityOverrides",Map.of("jurisdiction",List.of("DE-BY"))),"G4 explicit own-content override/boundary differs");
            if(!"exam".equals(goal.get("nodeKind"))||!strings(goal.get("contains")).isEmpty()||!"released".equals(map(goal.get("examData")).get("reviewStatus"))||map(goal.get("extendedData")).containsKey("applicabilityFromRequires"))throw new IllegalStateException("G4 terminal role/availability differs");
            var baseBinding=map(rule.get("baseFinitePlan"));
            if(!sha(root.resolve(text(baseBinding.get("path")))).equals(baseBinding.get("sha256")))throw new IllegalStateException("G4 original finite plan drift");
            var base=read(root.resolve(text(baseBinding.get("path"))));
            for(String key:base.keySet())if(!Set.of("counts","assessmentScopeOperations","bindings","independentDecisionBindings").contains(key))ReviewedExistingChanges.equal(plan.get(key),base.get(key),"G4 original finite field differs: "+key);
            var expectedCounts=new LinkedHashMap<>(map(base.get("counts")));
            for(var delta:Map.of("individualTaskReferences",2,"individualProxyReferences",2,"newAssessmentIdentities",1,"separateAssessmentTargetPairs",4,"totalReplacementTargetPairs",4).entrySet())expectedCounts.put(delta.getKey(),((Number)expectedCounts.get(delta.getKey())).intValue()+delta.getValue());
            ReviewedExistingChanges.equal(plan.get("counts"),expectedCounts,"G4 finite counts differ");
            for(String key:List.of("assessmentScopeOperations","bindings","independentDecisionBindings")) {
                var old=(List<?>)base.get(key);var current=(List<?>)plan.get(key);int extra="independentDecisionBindings".equals(key)?1:2;
                if(current.size()!=old.size()+extra)throw new IllegalStateException("G4 original finite inventory differs");
                ReviewedExistingChanges.equal(current.subList(0,old.size()),old,"G4 old finite inventory changed");
            }
            Map<String,Map<String,Object>> sourceRules=new LinkedHashMap<>();
            for(var row:maps(rule.get("sourceRules")))if(sourceRules.put(text(row.get("viewId")),row)!=null)throw new IllegalStateException("G4 duplicate source");
            if(!sourceRules.keySet().equals(SOURCES))throw new IllegalStateException("G4 exact source inventory differs");
            List<Map<String,Object>> expectedOperations=new ArrayList<>();Set<String> actualUnionIds=new LinkedHashSet<>();
            for(var pair:maps(plan.get("combinedMaterializations"))) {
                boolean positive=strings(pair.get("sourceViewIds")).stream().anyMatch(SOURCES::contains);
                var approved=maps(rule.get("combinedRules")).stream().filter(x->Objects.equals(x.get("outputViewId"),pair.get("outputViewId"))).toList();
                if(positive){if(approved.size()!=1||!SCOPES.containsAll(strings(pair.get("scopeRows"))))throw new IllegalStateException("G4 union inventory/scope differs");for(String key:List.of("scope","scopeRows","sourceViewIds"))ReviewedExistingChanges.equal(pair.get(key),approved.get(0).get(key),"G4 union binding differs");actualUnionIds.add(text(pair.get("outputViewId")));}
                else if(!approved.isEmpty())throw new IllegalStateException("G4 unexpected union");
            }
            if(actualUnionIds.size()!=2||maps(rule.get("combinedRules")).size()!=2)throw new IllegalStateException("G4 exact two unions required");
            for(var entry:sourceRules.entrySet())expectedOperations.add(map(entry.getValue().get("operation")));
            ReviewedExistingChanges.equal(maps(plan.get("assessmentScopeOperations")).subList(maps(base.get("assessmentScopeOperations")).size(),maps(plan.get("assessmentScopeOperations")).size()),expectedOperations,"G4 operation additions differ");
            Set<String> checkedSources=new LinkedHashSet<>();
            for(var pair:maps(plan.get("combinedMaterializations"))) {
                var ids=strings(pair.get("sourceViewIds"));var paths=strings(pair.get("baselineSourcePaths"));
                for(int index=0;index<ids.size();index++) {
                    String vid=ids.get(index);if(!checkedSources.add(vid))continue;
                    var current=read(views.resolve(Path.of(paths.get(index)).getFileName()));var nodes=maps(current.get("rootNodes"));var refs=ReviewedExistingChanges.exactReferences(nodes,ID);var sr=sourceRules.get(vid);
                    if(sr==null){if(!refs.isEmpty()||CourseProfileCompositionViewMerger.projectionTargetGoalIds(nodes,children).contains(ID))throw new IllegalStateException("G4 unauthorized source reference");continue;}
                    ReviewedExistingChanges.equal(current.get("scope"),sr.get("scope"),"G4 source exact scope differs");
                    var op=map(sr.get("operation"));if(!vid.equals(op.get("viewId"))||!"include-target".equals(op.get("action")))throw new IllegalStateException("G4 source operation differs");
                    ReviewedExistingChanges.equal(op.get("goalIds"),List.of(ID),"G4 source operation identity differs");
                    var exact=Map.of("kind","goalEntry","goalId",ID);
                    if(refs.size()!=1||!JSON.valueToTree(refs.get(0)).equals(JSON.valueToTree(exact))||!CourseProfileCompositionViewMerger.projectionTargetGoalIds(nodes,children).contains(ID))throw new IllegalStateException("G4 exact positive direct-reference inventory differs");
                    String wrapper="reviewed-stage-positive-"+text(op.get("id"));var anchors=ReviewedExistingChanges.structures(nodes,text(op.get("anchorStructureId")));var wrappers=ReviewedExistingChanges.structures(nodes,wrapper);var expectedWrapper=Map.of("kind","structure","id",wrapper,"label",op.get("label"),"children",List.of(exact));
                    if(anchors.size()!=1||wrappers.size()!=1||maps(anchors.get(0).get("children")).stream().filter(x->JSON.valueToTree(x).equals(JSON.valueToTree(expectedWrapper))).count()!=1)throw new IllegalStateException("G4 exact positive wrapper/anchor differs");
                }
            }
            if(!checkedSources.containsAll(SOURCES))throw new IllegalStateException("G4 source rule not consumed");
        }
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
