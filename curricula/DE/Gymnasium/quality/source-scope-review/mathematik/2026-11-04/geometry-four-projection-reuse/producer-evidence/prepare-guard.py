from pathlib import Path
import json,hashlib,difflib
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';O=H/'overlay';cfg=json.loads((H/'integration-config.json').read_text());B=R/cfg['baseHost'];REL='backend/src/test/java/com/skillpilot/backend/composition/MaterializeMathContextualCombinedViews.java'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def both(rel,v):
 for root in[C,O]:
  p=root/rel;p.parent.mkdir(parents=True,exist_ok=True);t=p.with_name(p.name+'.new');t.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def pin(rel):return {'path':rel,'sha256':sha(C/rel)}
# Keep the normal existing wrapper cleanup, with its established explicit contextual-terminal prefix.
for op in cfg['sourceOperations']:
 op['sourceDecision']=cfg['roleReviewPath']+'#separate574Assessment'
 op['id']=op['id'] if op['id'].startswith('contextual-terminal-') else 'contextual-terminal-'+op['id']
both(cfg['allowancePath'],{**read(C/cfg['allowancePath']),'sourceRules':[{**r,'operation':cfg['sourceOperations'][i]}for i,r in enumerate(read(C/cfg['allowancePath'])['sourceRules'])]})
plan=read(C/cfg['planPath']);policy=read(C/cfg['policyPath'])
for target in[plan,policy]:target['assessmentScopeOperations'][-2:]=cfg['sourceOperations']
for i,b in enumerate(plan['bindings'][-2:]):b['scopeOperation']=cfg['sourceOperations'][i]
baseRel=cfg['qualityRoot']+'/before-g3-finite-scope-operations.json';both(baseRel,read(B/cfg['planPath']))
allow=read(C/cfg['allowancePath']);allow['baseFinitePlan']=pin(baseRel)
both(cfg['allowancePath'],allow);plan['geometryFourAssessmentPlacement']=pin(cfg['allowancePath'])
for b in plan['bindings'][-2:]:b['exactFourScopeBinding']=pin(cfg['allowancePath'])
both(cfg['planPath'],plan);both(cfg['policyPath'],policy);delta=read(C/(cfg['qualityRoot']+'/exact-fieldwise-merge.actual.json'));delta['additionalSourceOperations']=cfg['sourceOperations'];both(cfg['qualityRoot']+'/exact-fieldwise-merge.actual.json',delta);(H/'integration-config.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
original=(B/REL).read_text();assert sha(B/REL)=='c92ffeaeb59bffeb785b80196a7d9b271eb6df2e24743e905378e3d9a578c382'
needle='        existingChanges.preflightPositiveReferenceInventories(root,views,pairs,snapshots,children);'
assert original.count(needle)==1
code=original.replace(needle,needle+'\n        GeometryPlacement.preflight(root,views,plan,boundDecisions,canonical,children);')
fragment=r'''
    /** Exact additive G4 producer contract; the original B2 and G3 guards remain in force. */
    private static final class GeometryPlacement {
        private static final String ID="dd1954f6-0941-55a9-88d2-e2980ed902fd";
        private static final Set<String> SOURCES=Set.of("de-by-gym-sekii-math-lk","de-by-gym-math-lk");
        private static final Set<String> SCOPES=Set.of("DE-BY/SekII/G9/LK","DE-BY/SekII/G9/GK+LK","DE-BY/CrossStage/G9/LK","DE-BY/CrossStage/G9/GK+LK");
        static void preflight(Path root,Path views,Map<String,Object> plan,List<Map<String,Object>> bindings,Map<String,Object> canonical,Map<String,List<String>> children)throws Exception {
            if(!plan.containsKey("geometryFourAssessmentPlacement"))return;
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
'''
code=code.replace('    private static int effectiveCount(',fragment+'\n    private static int effectiveCount(',1)
for root in[C,O]:
 p=root/REL;p.parent.mkdir(parents=True,exist_ok=True);t=p.with_name(p.name+'.new');t.write_text(code);t.replace(p)
(H/'guard-code.diff').write_text(''.join(difflib.unified_diff(original.splitlines(True),code.splitlines(True),fromfile='G3/c92ffea/'+REL,tofile='G4/'+REL)))
both(cfg['qualityRoot']+'/guard-code-deltas.json',{'status':'AUTHOR_EXPLICIT_ADDITIVE_G4_GUARD_AWAITING_INDEPENDENT_STAGE','sourceDeltas':[{'path':REL,'beforeSha256':sha(B/REL),'afterSha256':sha(C/REL)}],'mainSourceDelta':False,'productionRoleResolverReused':True,'originalB2AndG3AllowanceCodeUnmodified':True,'newIdentityAndSourceFourScopePairsBoundExplicitly':True,'positivePreflightBeforeFirstWrite':True})
print(json.dumps({'status':'PRIVATE_EXACT_G4_GUARD_READY','sha256':sha(C/REL)}))
