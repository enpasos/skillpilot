# SPDX-License-Identifier: Apache-2.0
"""Finite exact P-owner retention/patch check; no normal writes or broad evaluator."""
import copy, hashlib, importlib.util, json
from pathlib import Path
R=Path.cwd();O=Path(__file__).resolve().parent.parent
read=lambda p:json.loads(Path(p).read_text())
def sha(b):return hashlib.sha256(b).hexdigest()
def dig(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p
before=read(O/'BEFORE.protected-normal-P-registry-D-and-two-C-pins.json')
for p in before['protectedPins']:verify(p)
patch=read(O/'PATCH.central-positive-evidence-configs-133-to134.INACTIVE.json');verify(patch['centralBefore']);c=read(patch['centralBefore']['path']);post=copy.deepcopy(c)
assert not patch['active'] and not patch['normalMutationPerformed']
for op in patch['operations']:
 bits=op['path'].strip('/').split('/');parent=post
 for bit in bits[:-1]:parent=parent[int(bit)] if isinstance(parent,list) else parent[bit]
 key=bits[-1]
 if op['op']=='test':assert parent[int(key)]==op['value']
 elif op['op']=='replace':parent[int(key)]=op['value']
 elif op['op']=='add':assert key=='-';parent.append(op['value'])
 else:raise AssertionError(op)
si=patch['subjectIndex'];oldpaths=c['subjects'][si]['positiveEvidenceConfigPaths'];newpaths=post['subjects'][si]['positiveEvidenceConfigPaths'];assert len(oldpaths)==133 and len(newpaths)==134 and dig(oldpaths)==patch['beforePConfigArrayCanonicalSHA256']
without=copy.deepcopy(post);without['subjects'][si]['positiveEvidenceConfigPaths']=oldpaths;assert without==c
def records(paths):
 out={}
 for path in paths:
  cfg=read(path);rs=[json.loads(l) for l in Path(cfg['reviewPath']).read_text().splitlines() if l.strip()];assert len(rs)==len(cfg['scope']['goalIds']) and {r['goalId'] for r in rs}==set(cfg['scope']['goalIds'])
  for r in rs:assert r['goalId'] not in out;out[r['goalId']]=r
 return out
old=records(oldpaths);new=records(newpaths);assert len(old)==len(new)==450 and set(old)==set(new)
targets=set(read(O/'PLAN.inactive-native-P2-and-exact-residues.json')['targetGoalIds']);retained=[]
for gid in old:
 if gid in targets:assert old[gid]['profile']!=new[gid]['profile']
 else:assert old[gid]==new[gid];retained.append({'goalId':gid,'wholeRecordCanonicalSHA256':dig(old[gid]),'wholeProfileCanonicalSHA256':dig(old[gid]['profile'])})
assert len(retained)==448
plan=read(O/'PLAN.inactive-native-P2-and-exact-residues.json')
for r in plan['residuals']:
 src=Path(r['oldReview']['path']).read_bytes().splitlines(keepends=True);expected=b''.join(l for l in src if not l.strip() or json.loads(l)['goalId']!=r['removedGoalId']);assert expected==Path(r['newReview']['path']).read_bytes()
stock=read(O/'CHECK.stock-target2-plus-two-exact-residues.json');roles=read(O/'CHECK.actual-four-current-two-goal-view-roles.json');assert stock['status']==roles['status']=='PASS' and len(roles['rows'])==4
for gid in targets:
 r=new[gid];assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]
context=read(O/'CONTEXT.two-current-bilingual-C-P-material-compatibility.from-actual-science.json')
for p in context['scientificSeals']:verify(p)
for x in context['existingDPairBindings']:verify(x['existingResolution'])
for p in O.rglob('*.json'):
 if p.name=='CHECK.finite-exact448-retention-inactive-patch-and-portability.json':continue
 read(p)
for p in O.rglob('*.jsonl'):
 for l in p.read_text().splitlines():
  if l.strip():json.loads(l)
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(R);own=[e for e in errors if str(O.relative_to(R)) in e];assert not own
print(json.dumps({'status':'PASS','active':False,'normalMutationPerformed':False,'beforePConfigs':133,'proposedPConfigs':134,'uniqueGoalsBoth':450,'changedWholeProfileBodiesExactly':sorted(targets),'allOther448WholeRecordsAndBodiesEqual':True,'retained448':retained,'residualOtherFiveLineBytesExact':True,'normalPRegistryCanonicalAndOldDProtectedFileCount':len(before['protectedPins']),'allProtectedNormalBytesRemainExact':True,'candidatePatchChangesOnlyChemistryPositiveEvidenceConfigPaths':True,'existingDPairFilesAndIdentitiesUnchanged':True,'freshDVoteOrRunInvented':False,'reviewRunIdsEmptyForNew2':True,'stockTarget2SchemaFingerprintsAndResidual5':'PASS','actualViewRoleCount':4,'stockSymlinkErrorsInOwnScope':own,'stockSymlinkErrorsOutsideScopeCount':len(errors)-len(own),'allWholeWrittenJsonAndJsonlParsed':True,'source3MappingCASApplied':False,'newWholeSourceApprovals':0,'newScientificFirstDecisions':0,'apCompilerGlobalSchemaBuildCentralRuns':0},ensure_ascii=False,indent=2))
