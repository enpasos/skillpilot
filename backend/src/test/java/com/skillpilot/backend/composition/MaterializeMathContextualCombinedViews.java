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
        ReviewedExistingChanges existingChanges=ReviewedExistingChanges.load(root,plan,boundDecisions,canonical);
        Map<String,Object> snapshots=map(plan.get("producerSourceSnapshots"));
        existingChanges.preflightPositiveReferenceInventories(root,views,pairs,snapshots,children);
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
