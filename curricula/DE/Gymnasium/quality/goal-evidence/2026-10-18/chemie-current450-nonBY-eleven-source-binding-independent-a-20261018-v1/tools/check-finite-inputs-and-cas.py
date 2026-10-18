from pathlib import Path
import json,hashlib,copy,subprocess,datetime,importlib.util
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-nonBY-eleven-source-binding-author-20261018-v1')
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-nonBY-eleven-source-binding-independent-a-20261018-v1')
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def obj(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def ptr(x,p):
 for s in p.split('/')[1:]:s=s.replace('~1','/').replace('~0','~');x=x[int(s)]if isinstance(x,list)else x[s]
 return x
pins={}
def walk(x):
 if isinstance(x,dict):
  if all(k in x for k in ['path','sha256','bytes']):pins[x['path']]=x
  for z in x.values():walk(z)
 elif isinstance(x,list):
  for z in x:walk(z)
a=read(B/'AUTHOR.eleven-current-source-binding-and-placement-candidates.pending.json');i=read(B/'INPUT.eleven-sources-and-twelve-current-whole-C-P-contexts.json');m=read(B/'PATCH.nineteen-current-mapping-files.exact-source-row-replacements.pending.json');v=read(B/'PATCH.four-view-five-target-additions.pending.json');seal=read(B/'SEAL.json');e=read(B/'ACTUAL.read-pins-and-existing-science-boundaries.json')
for x in [a,i,m,v,seal,e]:walk(x)
for p,q in pins.items():assert sha(p)==q['sha256'].removeprefix('sha256:')and Path(p).stat().st_size==q['bytes'],p
canonical=read(i['canonical']['path']);goals={g['id']:g for g in canonical['goals']}
profiles={r['goalId']:r['profile']for r in map(json.loads,Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current450-final-delivery-and-term-scope-integration-technical-20261018-v1/P450.complete-native.current-normal.review.jsonl').read_text().splitlines())}
for z in i['sourceInputs']:assert ptr(read(z['extraction']['path']),z['pointer'])==z['wholeSourceGoal']and obj(z['wholeSourceGoal'])==z['wholeSourceGoalSHA256']
profileCount=0
for z in i['wholeGoalProfileBindings']:
 assert goals[z['goalId']]==z['wholeCurrentGoal']and obj(z['wholeCurrentGoal'])==z['wholeGoalSHA256']
 if 'profile'in z:
  ref=z['profile'];record=json.loads(Path(ref['review']['path']).read_text().splitlines()[ref['lineOneBased']-1]);assert record['goalId']==z['goalId']and record['profile']==z['wholeCurrentProfile']and obj(record['profile'])==ref['profileSHA256'];assert profiles[z['goalId']]==z['wholeCurrentProfile'];profileCount+=1
he='he-chem-sekii-q3-3-b10-a01-f814c697';hefiles=set(subprocess.run(['rg','-l',he,'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary'],check=True,capture_output=True,text=True).stdout.splitlines());assert len(hefiles)==7 and hefiles=={z['fileBefore']['path']for z in m if z['sourceGoalId']==he}
assert len(m)==19
patchProof=[]
for p in m:
 before=read(p['fileBefore']['path']);after=copy.deepcopy(before);changed=[]
 for b,r in zip(p['mappingRowsBefore'],p['mappingRowsAfter']):
  assert b['pointer']==r['pointer']and ptr(before,b['pointer'])==b['value'];n=int(b['pointer'].split('/')[-1]);after['mappings'][n]=r['value'];assert r['value']['matchType']=='partial';changed.append(b['pointer'])
  assert r['value']['legacyGoalId']==p['sourceGoalId']
  if p['sourceGoalId']==he:assert r['value']['canonicalGoalId']=='0e3f849b-133d-57da-882c-0d67c3eb05b8'and r['value']['courseLevelDecision']=='LK'
 for d in p['decisionReplacements']:
  assert ptr(before,d['pointer'])==d['before'];assert set(k for k in set(d['before'])|set(d['after'])if d['before'].get(k)!=d['after'].get(k))<= {'canonicalGoalIds','rationale'};after['decisions'][int(d['pointer'].split('/')[-1])]=d['after'];changed.append(d['pointer'])
 # Reverse precisely the proposed selected replacements; no other whole-file content moves.
 reverse=copy.deepcopy(after)
 for b in p['mappingRowsBefore']:reverse['mappings'][int(b['pointer'].split('/')[-1])]=b['value']
 for d in p['decisionReplacements']:reverse['decisions'][int(d['pointer'].split('/')[-1])]=d['before']
 assert reverse==before
 patchProof.append({'path':p['fileBefore']['path'],'sourceGoalId':p['sourceGoalId'],'changedPointers':changed,'allOtherWholeObjectsExactlyPreserved':True,'prospectiveWholeParsedAfterSHA256':obj(after)})
for pair in v['wholeCandidateViews']:
 before=read(pair['normalBefore']['path']);actual=read(pair['candidateAfter']['path']);expected=copy.deepcopy(before)
 for p in v['patches']:
  if p['normalViewBefore']['path']==pair['normalBefore']['path']:
   parent=ptr(expected,p['parentPointer']);assert parent['id']==p['parentId']and parent['label']==p['parentLabel'];assert len(parent['children'])==int(p['pointer'].split('/')[-1]);parent['children'].append(p['value'])
 assert expected==actual
holds=read(B/'HOLD.four-unshortened-original-source-context-gaps.json');assert len(holds)==4 and {z['ordinal']for z in holds}=={7,8,10,11};assert not{z['sourceGoalId']for z in holds}&{z['sourceGoalId']for z in m}
# AGENTS7.4 link check only; do not execute the schema validator or its main loop.
spec=importlib.util.spec_from_file_location('validate_schemas_bounded_link_helper','scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);linkErrors=[z for z in mod.curriculum_symlink_errors('.')if z.startswith(str(O))];assert not linkErrors
print(json.dumps({'role':'Independent finite exact-input/CAS/whole-view guard inspection, no normal mutation or schema/full gate run','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','filePinsChecked':len(pins),'wholeCurrentCanonicalObjectsRejoined':12,'wholeSelectedSourcesRejoined':11,'wholeProfilesRejoinedToOwnNativeOwnersAndCurrentP450':profileCount,'allSevenHEAliasesExplicitlyEnumeratedAndPatched':sorted(hefiles),'mappingCAS':patchProof,'wholeViewCandidatesReconstructedExactly':4,'explicitWholeOriginalContextHoldsUnpatched':[z['sourceGoalId']for z in holds],'ownPackageCurriculumSymlinkErrors':linkErrors,'normalWrites':0,'compilerRuns':0,'APRuns':0,'newD_P_A_M_VVotes':0},ensure_ascii=False,indent=2))
