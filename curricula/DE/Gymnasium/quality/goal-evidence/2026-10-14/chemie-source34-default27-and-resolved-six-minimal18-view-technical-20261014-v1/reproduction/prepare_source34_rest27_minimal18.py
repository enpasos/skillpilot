from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy,shutil
E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');R=E/'chemie-source34-default27-and-resolved-six-minimal18-view-technical-20261014-v1';O=E/'chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1';C=E/'chemie-current402-source34-independent-b-postseal-CAS-comparison-20261014-v1';B=E/'chemie-current402-source34-independent-scientific-b-first-verdict-20261014-v1';RES=E/'chemie-source34-six-disagreements-targeted-resolution-review-20261014-v1';CR=E/'chemie-current402-source34-transparent-scientific-counterreview-root-20261014-v1';N5=E/'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1';H=Path('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def write(rel,x):p=R/rel;assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def cp(src,rel):d=R/rel;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,d);return d
R.mkdir(exist_ok=True);assert not (R/'CAS.exact18-whole-views-only27-default-HOLDs-plus-one-resolved-duplicate.inactive.json').exists()
comparison=read(C/'COMPARISON.author-CAS-versus-first-sealed-independent-b.actual.json');first=read(B/'REVIEW.first34-whole-goal-source-and-course-scope.independent-b.actual.json');root=read(CR/'SCIENCE.root-source34-transparent-counterreview.actual.json');resolution=read(RES/'SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json');oc=read(O/'CAS.18-current-whole-composition-views.author-proposals.actual.json')
allowed={(x['tuple']['goalId'],x['tuple']['jurisdiction']) for x in comparison['tuples'] if x['comparisonDecision']=='COMPATIBLE_WITH_B_DEFAULT_HOLD_ONLY_NOT_WHOLE_COURSE_CAS_APPROVAL'};assert len(allowed)==27
keeps={(x['tuple']['goalId'],x['tuple']['jurisdiction'],'LK') for x in resolution['records'] if x['structuralTargetDecision'].startswith('RETAIN_CURRENT_')};assert len(keeps)==5
duplicate=('413c5ee5-7826-549f-ad76-63743c59b188','DE-NI','LK');assert any((x['tuple']['goalId'],x['tuple']['jurisdiction'],x['courseProfile'])==duplicate and x['structuralTargetDecision'].startswith('OMIT_EXACT_ADDITIONAL') for x in resolution['records'])
canonical=N5/'candidate/canonical539.current412.final-five-paired-V-resources.inactive.json';can=read(canonical);assert len(can['goals'])==539;cp(canonical,'inputs/canonical539.current412.exact-Source6Native5.json');ci={x['id']:x for x in can['goals']};assert len(ci)==539
sciencebindings=[bind(C/'COMPARISON.author-CAS-versus-first-sealed-independent-b.actual.json'),bind(B/'REVIEW.first34-whole-goal-source-and-course-scope.independent-b.actual.json'),bind(CR/'SCIENCE.root-source34-transparent-counterreview.actual.json'),bind(RES/'SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json'),bind(RES/'SEAL.finite-six-source34-disagreements-targeted-resolution.actual.json')]
rows=[];guards=[bind(canonical),bind(N5/'SEAL.finite-current412-five-final-resource-P5-native-common-FIRST_PASS.stock-PASS.actual.json')];omitted=[];heldGK=[]
for orig in oc['rows']:
 p=Path(orig['sourceFile']['path']);whole=read(p);assert bind(p)==orig['sourceFile'];assert (H/p).read_bytes()==p.read_bytes();before=cp(p,'inputs/'+p.name);after=copy.deepcopy(whole);scope=whole['scope'];j=scope['jurisdiction'];course=scope['courseProfile'];oldproposed={x['goalId'] for x in orig['removedExplicitTargetEntries']};ops=[]
 def visit(nodes,path):
  out=[]
  for i,node in enumerate(nodes):
   npath=path+[i]
   if node['kind']=='structure':node['children']=visit(node['children'],npath+['children']);out.append(node);continue
   id=node.get('goalId');key=(id,j,course)
   selected=node['kind']=='goalEntry' and node.get('projectionRole','target')=='target' and id in oldproposed and ((id,j) in allowed or key==duplicate)
   assert not (selected and key in keeps)
   if selected:ops.append({'goalId':id,'jurisdiction':j,'courseProfile':course,'exactNodePath':npath,'wholeRemovedGoalEntry':copy.deepcopy(node),'basis':'resolved-source-backed-duplicate-with-whole94retained' if key==duplicate else 'existing-first-B-default-HOLD-compatible-only-not-whole-course-approval','wholeCurrentGoalRetained':ci[id]});continue
   if id in oldproposed and key not in keeps and (id,j) not in allowed and key!=duplicate:heldGK.append({'goalId':id,'jurisdiction':j,'courseProfile':course,'reason':'Outside exact27+duplicate selection; original B has GK HOLD, five resolved KEEP decisions are LK only. No unauthorized additional omission or GK grant.'})
   out.append(node)
  return out
 after['rootNodes']=visit(after['rootNodes'],['rootNodes']);ap=write('candidate/'+p.name,after);rows.append({'operativePath':str(p),'expectedWholeBefore':bind(p),'ownWholeBefore':bind(before),'wholeAfter':bind(ap),'scope':scope,'operations':ops,'allOtherNodesAndViewMetadataExact':True,'noNewTargetOrPrerequisiteOnlyOrRequires':True,'notBlanketScientificApproval':True});guards.extend([bind(p),bind(H/p)]);omitted.extend(ops)
assert len(rows)==18
write('CAS.exact18-whole-views-only27-default-HOLDs-plus-one-resolved-duplicate.inactive.json',{'schemaVersion':1,'rows':rows,'selectedDistinctDefaultHoldTuples':27,'resolvedFiveLKKEEP':[{'goalId':x[0],'jurisdiction':x[1],'courseProfile':x[2]} for x in sorted(keeps)],'resolvedDuplicate':duplicate,'separateUnappliedGKHolds':heldGK,'source34OriginalScienceAndTransparentResolution':sciencebindings,'rootCounterreviewIndependenceDisclosure':root['independenceDisclosure'],'originalBlindBScienceNeverRewritten':True,'newScienceVotes':0,'canonicalOrSourceOrGlobalRequiresMutation':False,'prerequisiteOnlyOrTargetAdds':0,'M6OrStrictApproval':False,'activeAndHWrites':False})
write('inputs/EXACT34-prior-science-selection-and-current-whole-goal-deltas.json',{'originalBlindB':sciencebindings[1],'originalPostsealComparison':sciencebindings[0],'transparentRootCounterreview':sciencebindings[2],'disclosedRootIndependence':root['independenceDisclosure'],'sixTargetedResolution':sciencebindings[3],'tuples':[{'tuple':x['tuple'],'firstBDecision':x['decision'],'firstBReason':x['reason'],'firstBCourseJudgements':x['courseJudgements'],'preserveWholeGoalPartners':x['preserveWholeGoalPartners'],'primaryCaptureBinding':x['primaryCaptureBinding'],'wholeBeforeScienceGoal':x['wholeBeforeGoal'],'wholeCurrentGoal':ci[x['tuple']['goalId']],'currentDeltaFields':[k for k in x['wholeBeforeGoal'].keys()|ci[x['tuple']['goalId']].keys() if x['wholeBeforeGoal'].get(k)!=ci[x['tuple']['goalId']].get(k)],'sourceClosureGranted':False} for x in first['records']],'newScienceReview':False})
# Exact operative source carriers/whole inventories: data snapshots only, no renewed approval.
jurisdictions={x['scope']['jurisdiction'] for x in rows};reg=H/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json';registry=read(reg);sourcejur={x['landscapeId']:x.get('jurisdiction') for x in registry['entries']};mapped=[];extractions={};carrierbindings=[]
for j in sorted(jurisdictions):
 for p in sorted((H/'curricula/DE/Gymnasium/mapping'/j).rglob('*.json')):
  x=read(p)
  if x.get('targetLandscapeId')!=can['landscapeId']:continue
  rel=p.relative_to(H);frozen=cp(p,'sources/mapping/'+j+'/'+p.parent.name+'/'+p.name);guards.append(bind(p));carrierbindings.append({'operativeHostPath':bind(p),'publicNormalPath':str(rel),'ownWholeSnapshot':bind(frozen),'publicSameBytes':(Path(rel).exists() and Path(rel).read_bytes()==p.read_bytes())});mapped.append({'path':str(frozen),'normalPath':str(rel),'jurisdiction':j,'wholeCarrier':x})
  ep=x.get('sourceExtractionPath')
  if ep and ep not in extractions:
   q=H/ep
   if q.is_file():
    dest=cp(q,'sources/extraction/'+j+'/'+q.name);extractions[ep]={'operativeHostPath':bind(q),'publicNormalPath':ep,'ownWholeSnapshot':bind(dest),'wholeExtraction':read(q)};guards.append(bind(q))
   else:extractions[ep]={'publicNormalPath':ep,'missingFromOperativeHost':True}
write('inputs/EXACT.current-affected-source-mapping-and-full-inventory-snapshots.json',{'sourceRegistry':bind(reg),'mappingCarriers':carrierbindings,'sourceExtractions':[{k:v for k,v in x.items() if k!='wholeExtraction'} for x in extractions.values()],'allCellsAndMappingsUnchanged':True,'noNewSourceApprovalOrRemap':True})
write('inputs/WHOLE.source-operator-unions-for-bounded-view-measurement.json',{'jurisdictions':sorted(jurisdictions),'mappingCarriers':mapped,'extractionsByNormalPath':extractions,'sourceRegistryEntries':[x for x in registry['entries'] if x.get('jurisdiction') in jurisdictions],'mappingCount':len(mapped),'sourceExtractionCount':len(extractions),'noScientificWholeClosureInferred':True})
write('GUARD.before.current18-original-source-carriers-and-native5-base.json',{'atUTC':datetime.now(timezone.utc).isoformat(),'bindings':guards,'noActiveOrParentHWrites':True})
print(json.dumps({'root':str(R),'views':18,'wholeEntryOmissions':len(omitted),'defaultTuples':27,'KEEP':len(keeps),'unappliedGK':len(heldGK),'sourceMappingSnapshots':len(mapped),'sourceExtractions':len(extractions)}))
