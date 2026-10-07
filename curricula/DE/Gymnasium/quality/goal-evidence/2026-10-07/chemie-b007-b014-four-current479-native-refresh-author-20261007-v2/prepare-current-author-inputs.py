# SPDX-License-Identifier: Apache-2.0
import copy, datetime, hashlib, json, pathlib, shutil, subprocess
ROOT=pathlib.Path.cwd()
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-nine-current479-bounded-native-author-20261007-v1'
OWN=pathlib.Path(__file__).resolve().parent
assert not (OWN/'author.final.freeze.json').exists()
def read(p): return json.loads(p.read_text())
def write(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
freeze=read(OLD/'author.final.freeze.json')
for r in freeze['payloads']:
 p=ROOT/r['path']; b=p.read_bytes(); assert hashlib.sha256(b).hexdigest()==r['sha256'],r['path'];assert len(b)==r['bytes']
canonicalPath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
current=read(canonicalPath); candidate=copy.deepcopy(current); by={g['id']:g for g in candidate['goals']};original={g['id']:g for g in current['goals']}
intents=read(OLD/'guarded-later-integration-field-intents.author.json'); selected=[r['goalId']for r in intents['goalFieldChanges']]
guards=[]
for row in intents['goalFieldChanges']:
 g=by[row['goalId']]
 for change in row['fieldChanges']:
  parts=change['pointer'].strip('/').split('/'); obj=g
  for key in parts[:-1]:obj=obj[key]
  key=parts[-1]
  if change['operation']=='replace':assert key in obj and obj[key]==change['before'],(row['goalId'],change['pointer'])
  else:assert change['operation']=='add'and key not in obj,(row['goalId'],change['pointer'])
  guards.append({'goalId':row['goalId'],'pointer':change['pointer'],'operation':change['operation'],'beforeGuardPassed':True})
  obj[key]=copy.deepcopy(change['after'])
assert len(candidate['goals'])==479
assert all(original[gid]==by[gid]for gid in original if gid not in selected)
assert {gid for gid in by if by[gid]!=original[gid]}==set(selected)
write(OWN/'candidate/canonical.current479-four-bounded-proposals.json',candidate)
selection=read(OLD/'nine-current-goals-and-four-bounded-candidates.author.raw.json')
selection['currentWholeGoalsDEEN']=[original[gid]for gid in selection['selectedGoalIds']]
selection['candidateWholeGoalsDEEN']=[by[gid]for gid in selection['selectedGoalIds']]
selection['role']='Current exact479 base plus four guarded field proposals; older science/materials preserved; independent reviews pending'
write(OWN/'nine-current-goals-and-four-bounded-candidates.author.raw.json',selection)
inputs=[]
def snapshot(source,name):
 target=OWN/'inputs'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(source.read_bytes());inputs.append({**bind(target),'originalPathAtUse':str(source.relative_to(ROOT)),'originalBinding':bind(source),'exactByteSnapshot':True});return target
snapshot(canonicalPath,'canonical-current479.json.bin')
for source,name,target in [
 ('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','kind-current479.json.bin','candidate/semantic-kinds.original-input.json'),
 ('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','qa-current378.json.bin','candidate/visualization-qa.original-input.json'),
 ('curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json','view-current378.json.bin','candidate/review-view.original-input.json')]:
 p=ROOT/source;snapshot(p,name);(OWN/target).parent.mkdir(parents=True,exist_ok=True);(OWN/target).write_bytes(p.read_bytes())
for source,name in [
 ('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','registry-current.json.bin'),
 ('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json','inflight-current.json.bin'),
 ('curricula/DE/Gymnasium/input/HE/chemistry/DE_HE_CHEMIE_SEKI_G9.source-extraction.json','he-seki-current.json.bin'),
 ('curricula/DE/Gymnasium/input/HE/chemistry/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json','he-sekii-current.json.bin'),
 ('curricula/DE/Gymnasium/input/HE/chemistry/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json','he-sekii-2026-current.json.bin')]:
 p=ROOT/source
 if not p.exists():
  oldidx=read(OLD/'all-declared-input-snapshot-index.actual.json')['inputs'];matches=[r['originalPathAtUse']for r in oldidx if pathlib.Path(r['originalPathAtUse']).name==pathlib.Path(source).name];assert len(matches)==1; p=ROOT/matches[0]
 snapshot(p,name)
for name in ['materials','source','reused-evidence','selected-existing-images','visualization']:
 shutil.copytree(OLD/name,OWN/name)
# Prior review records/cards remain byte-exact. Current visibility views refresh from their original declared paths.
oldindex=read(OLD/'all-declared-input-snapshot-index.actual.json')['inputs']
for source in (OLD/'memory/current-visibility-inputs').iterdir():
 matches=[r['originalPathAtUse']for r in oldindex if pathlib.Path(r['originalPathAtUse']).name==source.name.split('-',1)[1]]
 if not matches:
  basename=source.name.split('-',1)[1];found=list((ROOT/'curricula/DE/Gymnasium').glob('composition-views/**/'+basename));assert len(found)==1,(basename,found);matches=[str(found[0].relative_to(ROOT))]
 p=ROOT/matches[0];target=OWN/'memory/current-visibility-inputs'/source.name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(p.read_bytes());snapshot(p,'visibility-'+source.name+'.bin')
for name in ['arrhenius-existing-reviewed-support-node.author-proposal.json','exact-support-integration-field-intents.author.json','current-nine-A-M-whole-records-and-exact-reuse-boundaries.author.raw.json']:
 p=OWN/'memory'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((OLD/'memory'/name).read_bytes())
support=read(OWN/'memory/arrhenius-existing-reviewed-support-node.author-proposal.json')['wholeMemoryNode'];memory=copy.deepcopy(candidate);memIntents=read(OWN/'memory/exact-support-integration-field-intents.author.json')
assert support['id']not in by;memory['goals'].append(support);parent=next(g for g in memory['goals']if g['id']==memIntents['parentGoalId']);assert support['id']not in parent['contains'];parent['contains'].append(support['id'])
write(OWN/'memory/canonical.current480-with-exact-support-node.inactive.validation-only.json',memory)
for name in ['a-exact-selected.current-candidate.config.json','m-exact-selected.current-candidate.config.json','m-arrhenius-exact-support.current480.inactive.config.json']:
 p=OWN/'native'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text((OLD/'native'/name).read_text().replace(str(OLD.relative_to(ROOT)),str(OWN.relative_to(ROOT))))
write(OWN/'all-declared-input-snapshot-index.actual.json',{'role':'Current exact declared byte snapshots for inert refresh; no scientific approval','inputs':inputs,'humanApproval':False})
newIntents=copy.deepcopy(intents);newIntents['baselineCanonical']=bind(OWN/'inputs/canonical-current479.json.bin');newIntents['currentLiveBaselineAtUse']=bind(canonicalPath);newIntents['activeWrites']=0;newIntents['strictGain']=0
write(OWN/'guarded-later-integration-field-intents.author.json',newIntents)
oldbase=read(OLD/'declared-input-snapshots/001-DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json.bin');oldby={g['id']:g for g in oldbase['goals']};drift=[gid for gid in original if original[gid]!=oldby[gid]]
write(OWN/'current-base-and-four-guarded-deltas.author.json',{'role':'Technical current input merge; author cannot approve own D/P/A/M/V','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitHeadAtUse':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'currentCanonicalAtUse':bind(canonicalPath),'priorAuthorFreeze':bind(OLD/'author.final.freeze.json'),'priorFrozenPayloadsVerified':len(freeze['payloads']),'fourSelectedGoals':selected,'heldFiveGoalIds':selection['heldGoalIds'],'changedFieldsGuarded':guards,'intermediateActiveGoalChangesRetained':drift,'allOther475WholeGoalsExact':True,'unchangedSelectedLiveWholeGoalsVersusPriorAuthor':all(original[gid]==oldby[gid]for gid in selected),'noNewCurricularAtomicIds':True,'currentWholeGoals':479,'curricularAtomicCount':378,'inactiveMemorySupportWholeGoals':480,'strictGain':0,'activeWrites':0,'independentApproval':False,'humanApproval':False})
oldsrc=(OLD/'materialize-four-native.author.mts').read_text()
newsrc=oldsrc.replace(str(OLD.relative_to(ROOT)),str(OWN.relative_to(ROOT))).replace('chemie-b007-b014-current378-four-bounded-author-20261007-v1','chemie-b007-b014-current378-four-native-refresh-author-20261007-v2').replace('chemie-b007-b014-four-bounded-native-author-20261007-v1','chemie-b007-b014-four-current-native-refresh-author-20261007-v2').replace('chemie-b007-b014-four-current-independent-','chemie-b007-b014-four-current-refresh-independent-').replace("'-20261007-v1'","'-20261007-v2'").replace('chemie-b007-b014-four-bounded-author-20261007-v1','chemie-b007-b014-four-current-refresh-author-20261007-v2')
(OWN/'materialize-current-native.author.mts').write_text(newsrc)
print(json.dumps({'own':str(OWN.relative_to(ROOT)),'priorPayloadsVerified':len(freeze['payloads']),'guardedFields':len(guards),'preservedConcurrentGoalChanges':drift,'strictGain':0}))
