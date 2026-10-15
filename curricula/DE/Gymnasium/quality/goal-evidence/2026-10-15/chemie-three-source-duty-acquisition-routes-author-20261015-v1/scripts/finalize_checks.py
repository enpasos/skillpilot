#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import hashlib,importlib.util,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
def read(p):return json.loads((ROOT/p).read_text())
def own(p):return json.loads((OUT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
s=own('INPUTS.physical-exact-selector.json');cas=own('CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json')
land=read(s['canonical']['path']);G={g['id']:g for g in land['goals']}
proof=own('checks/CHECK.stock-compiler-positive-scopes-and-prerequisites.actual.json')
opportunities=own('materials/ten-complete-acquisition-opportunities.DE-EN.author.json')['opportunities']
assert proof['technicalStructuralAndDirectClosurePass'] and not proof['pass']

# Full carrier entries and their source branches, not applicability-only assertions.
carrier=[]
def find(nodes,path,parents,ids):
 out=[]
 for j,n in enumerate(nodes):
  p=path+'/'+str(j)
  if n.get('goalId') in ids:out.append({'jsonPointer':p,'wholeEntry':n,'parentLabels':parents})
  if n.get('kind')=='structure':out.extend(find(n['children'],p+'/children',parents+[n['label']],ids))
 return out
for r in cas['rows']:
 ids=s['sourceGoalIds'][:2] if r['name']=='de-hb-lk' else [s['sourceGoalIds'][2]] if r['name']=='de-bw-lk' else []
 before=read(r['before']['path']);after=read(r['after']['path'])
 a=find(before['rootNodes'],'/rootNodes',[],s['sourceGoalIds']);b=find(after['rootNodes'],'/rootNodes',[],s['sourceGoalIds'])
 assert sorted(x['wholeEntry']['goalId'] for x in b)==sorted(ids)
 assert [x['wholeEntry'] for x in a]==[x['wholeEntry'] for x in b]
 assert all(x['wholeEntry'].get('projectionRole')=='target' for x in b)
 carrier.append({'view':r['name'],'before':r['before'],'after':r['after'],'beforeCarrierEntries':a,'afterCarrierEntries':b,
                 'allWholeEntriesAlreadyPresentAndPreserved':True,'newCarrierEntriesNeeded':0})
write('checks/PROOF.three-explicit-carriers-present-in-bound-whole-LK-view-candidates.actual.json',{
 'records':carrier,'statement':'The185/166 baseline counts refer to these exact v3 candidate views, where2/1 carriers are already explicit targets. Adding the4/8 foundations yields189/174, without double-inserting the carriers. Active registry views are not silently substituted.'})

effective_ids=set(s['sourceGoalIds']+s['HBAddedTargetGoalIds']+s['BWAddedTargetGoalIds'])
holds=[]
for r in proof['reports']:
 if not r['view'].endswith('-lk'):continue
 for x in r['selectedSourceRows']:
  if x['target']:
   effective_ids.update(x['effectivePrerequisites'])
   holds.append({'view':r['view'],'goalId':x['goalId'],'directContainsExpandedMissing':x['missingRawAtomicPrerequisites'],
       'actualProjectedEffectiveMissing':x['missingEffectiveAtomicPrerequisites'],
       'actualProjectedSelfDependency':x['goalId'] in x['effectivePrerequisites'],
       'routeReadyAtTechnicalCandidateLevel':not x['missingEffectiveAtomicPrerequisites'] and x['goalId'] not in x['effectivePrerequisites']})
 for x in r['newTargetActualProjectedEffectiveChecks']:effective_ids.update(x['actualProjectedPrerequisiteClosure'])
write('source-context/whole-projected-effective-prerequisite-contexts.exact.json',{
 'canonical':s['canonical'],'wholeGoals':[G[i] for i in sorted(effective_ids)],'wholeObjectsUnchanged':True,
 'scope':'Full original canonical bodies encountered in actual projected effective prerequisite closure. No global inheritance repair or new source mapping.'})
write('FINDINGS.open-effective-routes-and-separated-positive-direct-results.author.json',{
 'authority':'Informed author with stock technical diagnostics; not an independent gate review',
 'stockCheck':bind(REL+'/checks/CHECK.stock-compiler-positive-scopes-and-prerequisites.actual.json'),
 'carrierFindings':holds,
 'newAtomEffectiveFindings':[{'view':r['view'],'records':r['newTargetActualProjectedEffectiveChecks']} for r in proof['reports'] if r['view'].endswith('-lk')],
 'directClosure':'All3 explicit source carrier prerequisite closures are present as ordinary targets after4/8 additions.',
 'HB40':'The proposed40 route is closed in the measured actual projection at technical candidate level. This is no source, independent D/P/A/M/V or M7 approval.',
 'HB93':'The existing inherited broad canonical context leaves21 further ordinary target gaps; route remains OPEN.',
 'BWd815':'Five newly exposed conceptual targets retain pre-existing inherited self-dependency paths plus14 further missing ordinary targets; d815 route remains OPEN.',
 'changeAttribution':'For every added target the actual projected effective prerequisite closure is unchanged from the original exact bound view. View additions do not introduce those dependency edges; exposing such a target does not make its unresolved route ready.',
 'noEngineOrGlobalClusterFixAttempted':True,'noHumanOrLearnerTrialRequirementForMachineM7':True,
 'nextWorkBoundary':'Root may assign a separate bounded canonical sequencing/context correction or an independently justified alternative. This author neither removes effective prerequisites nor hides them with prerequisiteOnly/semanticKind changes.'})

# Separate ordinary direct DAGs remain acyclic, despite mixed effective closure holds.
def cycles(field):
 done=set();busy=set();out=[]
 def visit(i):
  if i in busy:out.append(i);return
  if i in done:return
  busy.add(i)
  for j in G[i].get(field,[]):
   assert j in G,(i,j)
   visit(j)
  busy.remove(i);done.add(i)
 for i in G:visit(i)
 return sorted(set(out))
dag={'directRequiresCycleNodes':cycles('requires'),'directContainsCycleNodes':cycles('contains')}
assert not any(dag.values())
for o in opportunities:
 assert o['wholeGoalUnchanged']==G[o['goalId']]
 assert all(x is None for x in o['futureObservation'].values())
 assert len(o['criterionToObservable'])==4 and all(x['actualObservation'] is None and x['met'] is None for x in o['criterionToObservable'])
 for k in ['materialsProtocolAndData','taskAndLearningOpportunity','expectedReasoning','freshIndependentTransfer']:
  assert set(o[k])=={'de','en'} and all(o[k][l].strip() for l in ['de','en'])
assert len(opportunities)==10
preserved=[]
for k in ['source3CompleteCasesUnchanged','source3WholeGoalsUnchanged','sealedLab15Input','sealedThirtyLaborCasesUnchanged']:
 assert bind(s[k]['path'])==s[k]
 preserved.append(s[k])
# Verify both whole finite predecessor packets rather than editing any old file.
for seal_path in [s['sealedLab15Input']['path'],'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/FILES.finite-own-artifacts.seal.json']:
 seal=read(seal_path)
 for f in seal.get('files',[]):
  p=f.get('path') or f.get('relativePath')
  if p and Path(p).is_file():
   actual=bind(p)
   if 'sha256' in f:assert actual['sha256']==f['sha256'],p
spec=importlib.util.spec_from_file_location('validate_schemas',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=[e for e in mod.curriculum_symlink_errors(ROOT) if e.startswith(REL+'/')]
assert not errors
write('checks/CHECK.direct-DAG-material-format-preservation-and-portability.actual.json',{
 'pass':True,'directDAG':dag,'completeBilingualAcquisitionOpportunities':10,'observableCriteria':40,
 'practicalOpportunities':3,'allObservationFieldsBlank':True,'preservedInputs':preserved,
 'portabilityHelper':'scripts/validate_schemas.py::curriculum_symlink_errors','ownPortabilityErrors':errors,
 'sourceMappingsChanged':0,'canonicalObjectsChanged':0,'semanticKindsChanged':0,'independentGateApprovals':0,
 'note':'This bounded format/preservation pass does not override the explicitly false overall acquisition-route result.'})

inputs=[s['nativePreparation']['path'],s['canonical']['path'],s['semanticLedger']['path'],s['informedAuthorDiagnostic']['path'],
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-fresh-independent-a-20261015-v1/README.md',
 'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',
 s['source3WholeGoalsUnchanged']['path'],s['source3CompleteCasesUnchanged']['path'],s['sealedLab15Input']['path'],s['sealedThirtyLaborCasesUnchanged']['path'],
 'app/src/hooks/useLandscapes.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/scripts/compositionViewSourceCoverage.ts','contracts/curriculum-package/v1/composition-view.schema.json','AGENTS.md']
inputs.extend(r['before']['path'] for r in cas['rows'])
inputs.extend(r['activeCurrentViewReference']['path'] for r in proof['reports'])
write('INPUTS.actual-read-inventory.json',{'inputs':[bind(p) for p in inputs],
 'officialSourceRead':'HB physical36/37 and BW physical42 fully extracted/read; source text not duplicated. Only the independent original-A diagnosis was read, never Peer-B outputs.',
 'wholeViewRead':'All four whole input views parsed/preserved; explicit whole entries and source/course branches inspected; exact structural preservation checked.',
 'wholePrerequisiteRead':'All ten added whole target bodies and three whole carriers plus raw prerequisites retained; actual projected effective contexts expanded to whole originals and their descriptions/edges read. No whole-object context discarded.',
 'roles':'Informed AUTHOR. Prior independent findings guide this correction; no independence or approval is claimed.',
 'contentLicense':'Own didactic acquisition materials CC-BY-4.0; code/developer records Apache-2.0; third-party source rights retained.'})
print(json.dumps({'boundedFormatPreservationPortability':'pass','directDAG':'pass','actualEffectiveContexts':len(effective_ids),
 'explicitCarrierEntriesPreserved':3,'overallAcquisitionPass':False,'newApprovals':0}))
