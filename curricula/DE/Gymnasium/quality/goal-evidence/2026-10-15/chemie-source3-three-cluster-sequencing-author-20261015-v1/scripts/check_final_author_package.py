#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Targeted reproducible final checks. Must run before, never after, the finite seal."""
import hashlib,importlib.util,json,subprocess,sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
assert not (OUT/'FILES.finite-own-artifacts.seal.json').exists(),'Sealed packet is immutable'
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def own(p):return json.loads((OUT/p).read_text())
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
commands=[
 ['python3',REL+'/scripts/author_candidate.py'],
 ['app/node_modules/.bin/tsx',REL+'/scripts/check_semantics_effects_and_book_contexts.mts'],
 ['app/node_modules/.bin/tsx',REL+'/scripts/check_routes.mts'],
 ['python3',REL+'/scripts/finalize_author_records.py']]
receipts=[]
for n,cmd in enumerate(commands,1):
 result=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True,check=False)
 name='checks/COMMAND.'+str(n)+'.'+Path(cmd[-1]).stem+'.actual.txt'
 (OUT/name).write_text('argv: '+json.dumps(cmd)+'\ncwd: repository root\nexitCode: '+str(result.returncode)+'\nstdout:\n'+result.stdout+'\nstderr:\n'+result.stderr)
 receipts.append({'argv':cmd,'exitCode':result.returncode,'rawOutput':REL+'/'+name,'rawOutputSha256':digest(OUT/name)})
 assert result.returncode==0,result.stdout+result.stderr
sel=own('INPUTS.physical-exact-selector.json')
before=json.loads((ROOT/sel['baseCanonical']['path']).read_text());after=json.loads((ROOT/sel['canonical']['path']).read_text())
B={g['id']:g for g in before['goals']};A={g['id']:g for g in after['goals']}
changed=[i for i in B if B[i]!=A[i]];assert len(changed)==4
assert set(changed)==set(sel['changedWholeGoalIds'])
assert all(B[i]==A[i] for i in B if i not in changed)
assert all(all(B[i].get(k)==A[i].get(k) for k in set(B[i])|set(A[i]) if k!='requires') for i in changed)
added=[{'goalId':i,'requires':r} for i in B for r in A[i]['requires'] if r not in B[i]['requires']]
removed=[{'goalId':i,'requires':r} for i in B for r in B[i]['requires'] if r not in A[i]['requires']]
assert len(added)==1 and added[0]['goalId'].startswith('c441d9e8') and added[0]['requires'].startswith('1286f2fe')
assert len(removed)==3 and all(B[r['goalId']]['contains'] for r in removed)
assert all(all(r in A[i]['requires'] for r in B[i]['requires']) for i in B if not B[i]['contains'])
old=json.loads((ROOT/sel['baseSemanticLedger']['path']).read_text());new=json.loads((ROOT/sel['semanticLedger']['path']).read_text())
ob={d['goalId']:d for d in old['decisions']};nb={d['goalId']:d for d in new['decisions']}
assert set(ob)==set(nb)==set(B)
assert all({k:v for k,v in ob[i].items() if k!='sourceFingerprint'}=={k:v for k,v in nb[i].items() if k!='sourceFingerprint'} for i in ob)
assert {i for i in ob if ob[i]['sourceFingerprint']!=nb[i]['sourceFingerprint']}==set(changed)
assert old['counts']==new['counts']
bound=[]
def bindings(value):
 if isinstance(value,dict):
  if isinstance(value.get('path'),str) and isinstance(value.get('sha256'),str):
   p=Path(value['path']);assert not p.is_absolute() and '..' not in p.parts and p.parts[0] not in ('tmp','.git'),value
   f=ROOT/p;assert f.is_file(),str(p);assert digest(f)==value['sha256'],str(p)
   if 'bytes' in value:assert f.stat().st_size==value['bytes'],str(p)
   bound.append(value['path'])
  for v in value.values():bindings(v)
 elif isinstance(value,list):
  for v in value:bindings(v)
bindings(sel)
for name in ['NEUTRAL.final-three-cluster-sequencing-author-resume.json','source-context/actual-read-inventory-and-energy-edge-source-context.json','source-context/unchanged-acquisition-check-and-materials.reuse.json']:
 bindings(own(name))
cas=own('CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json')
assert len(cas['rows'])==4
for row in cas['rows']:bindings(row['before']);bindings(row['after'])
rationale=own('AUTHOR.per-cluster-and-every-child-scientific-rationale.json')
for row in rationale['groups']:
 def descendants(i):return [d for c in B[i]['contains'] for d in [c,*descendants(c)]]
 assert row['allDescendantsRead']==descendants(row['clusterId'])
 assert set(row['allDescendantsRead'])=={r['goalId'] for r in row['childrenAndDescendants']}
assert rationale['rationaleRows']==40
routes=own('checks/CHECK.stock-compiler-positive-scopes-and-prerequisites.actual.json')
assert routes['pass'] and routes['allProposedAcquisitionRoutesReady']
assert [(r['beforeTargetAtomicCount'],r['afterTargetAtomicCount']) for r in routes['reports']]==[(185,189),(166,174),(155,155),(144,144)]
assert all(not r['removedTargetGoalIds'] for r in routes['reports'])
assert all(not x['selfDependency'] and not x['missingOrdinaryTargetPrerequisites'] for r in routes['reports'] for x in r['newTargetActualProjectedEffectiveChecks'])
stock=own('checks/CHECK.runtime-schema-stock-contains-and-direct-DAG.actual.json');assert stock['pass']
effect=own('checks/CHECK.all554-actual-effective-requirements-before-after.json')
assert effect['affectedGoalCount']==347 and effect['directEffectiveRequirementChanges']==43
assert len(effect['selfReachableBefore'])==50 and not effect['selfReachableAfter']
radius=own('checks/CHECK.actual-stock-book315-context-fingerprint-radius.json')
assert radius['current315Count']==315 and radius['changed315Count']==2 and radius['unchanged315Count']==313
assert set(radius['changed315GoalIds'])==set(sel['actualChanged315BookContextGoalIds'])
assert not any(p.is_symlink() for p in OUT.rglob('*'))
helper=ROOT/'scripts/validate_schemas.py'
spec=importlib.util.spec_from_file_location('skillpilot_normal_schema_validator',helper)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
link_errors=module.curriculum_symlink_errors(ROOT)
write('checks/CHECK.normal-curriculum-symlink-errors.actual.json',{
 'helper':{'path':'scripts/validate_schemas.py','sha256':digest(helper)},
 'function':'curriculum_symlink_errors','errors':link_errors,'pass':not link_errors,
 'scope':'Unmodified normal repository portability helper. It internally performs read-only Git file discovery; no Git state or active files are written.'})
assert not link_errors,link_errors
json_count=0;jsonl_count=0
for file in sorted(OUT.rglob('*')):
 if not file.is_file():continue
 assert '__pycache__' not in file.parts
 if file.suffix=='.json':
  data=file.read_bytes();assert data.endswith(b'\n'),file;json.loads(data);json_count+=1
 elif file.suffix=='.jsonl':
  data=file.read_bytes();assert data.endswith(b'\n'),file
  for line in data.splitlines():json.loads(line)
  jsonl_count+=1
write('checks/CHECK.final-whole-CAS-inputs-preservation-serialization.actual.json',{
 'pass':True,'role':'Targeted author technical verification; no D/P/A/M/V approval',
 'exactWholeGoals':554,'wholeObjectsChanged':4,'wholeObjectsUnchanged':550,
 'removedClusterRequires':removed,'addedAtomicRequires':added,'allOriginalAtomicRequiresPreserved':True,
 'allGoalTextsContainsScopesResourcesExact':True,'semanticClassificationsExact':True,'changedSourceFingerprints':4,
 'exactPhysicalBindingsChecked':len(bound),'uniqueExactPhysicalPathsChecked':len(set(bound)),
 'wholeLKViewTargets':[189,174],'exactGKViewTargets':[155,144],
 'actualProjectedEffectiveAcquisitionPass':True,'directContainsExpandedPass':True,
 'effectiveAffected':347,'directEffectiveAffected':43,'selfReachableBeforeAfter':[50,0],
 'actualChanged315ContextIds':radius['changed315GoalIds'],'unchanged315Contexts':313,
 'wholeChildRationaleRows':40,'normalCurriculumSymlinkErrors':0,
 'jsonFilesCompletelyParsedBeforeThisReceipt':json_count,'jsonlFilesCompletelyParsed':jsonl_count,
 'allWrittenJsonHasActualTerminalNewline':True,'ownSymlinks':0,
 'commandReceipts':receipts,'newApprovals':0,'newStrictClosures':0,'restoredBindings':0,'activeIntegration':False,'M7':False})
json.loads((OUT/'checks/CHECK.final-whole-CAS-inputs-preservation-serialization.actual.json').read_text())
print(json.dumps({'pass':True,'wholeGoals':554,'changedWholeObjects':4,'wholeObjectsExact':550,'carrierAndNewTargetEffectiveRoutes':'pass','globalEffectiveAffected':347,'native315Changed':2,'native315Unchanged':313,'normalSymlinkErrors':len(link_errors),'newApprovals':0,'M7':False}))
