# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,shutil,datetime
R=Path.cwd();BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');OUT=BASE/'chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1';AUTH=BASE/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1';E=BASE/'chemie-b008-C11-current-G1-competence-source-context-author-20261010-v1';A=BASE/'chemie-b008-current517-native-context-independent-a-20261010-v1';B=BASE/'chemie-b008-current517-native-context-independent-b-20261010-v1';C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text())
def put(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def cp(s,d):
 d.parent.mkdir(parents=True,exist_ok=True)
 if d.is_symlink():d.unlink()
 shutil.copyfile(s,d);assert s.read_bytes()==d.read_bytes()
now=datetime.datetime.now(datetime.timezone.utc).isoformat();records=[];proof=[]
notes=read(OUT/'synthesis-notes.actual.json');four={'75e2eff1','5b1bb5d9','9fc800d1','6c7ce93c'}
for p in sorted((AUTH/'positive').glob('*.records.jsonl')):
 for line in p.read_text().splitlines():
  old=json.loads(line);n=json.loads(line);n.update(reviewId='chemie-b008-current517-whole38-paired-reviewed-inactive-v1',reviewer='Codex post-seal technical synthesis of genuine current independent A/B and explicitly inherited historical whole science; no third scientific review',reviewedAt=now)
  gid=n['goalId'];note=notes[gid[:8]]
  n['reason']='Original complete scientific profile retained exactly. Current paired independent native/source/context A/B reviewed after both FIRST seals. '+note[1]
  n['dissent']=['E1/G1 needs_human_review ai_candidate; no human approval, trial or observed learner performance.','Whole-source/course/placement HOLDs remain separate and unchanged.']
  assert n['profile']==old['profile'];assert n['profileFingerprint']==old['profileFingerprint'];assert n['status']=='needs_human_review' and n['reviewAuthority']=='ai_candidate'
  proof.append({'goalId':gid,'sourceRecordPath':str(p),'sourceRecord':old,'reviewedRecord':n,'wholeScientificProfileExact':True,'genuineCurrentFourChangedContext':gid[:8] in four});records.append(n)
assert len(records)==37 and len({r['goalId'] for r in records})==37
old=json.loads((E/'positive/current-e5-G1.original-author.records.jsonl').read_text().splitlines()[0]);n=json.loads(json.dumps(old));n.update(reviewId=records[0]['reviewId'],reviewer=records[0]['reviewer'],reviewedAt=now,reason='Original complete paired current G1 competence profile retained literally; genuine current independent A and B have reviewed both full cases, fresh transfers, NTG11 primary context and current native page. ROOT selected bounded G1 competence. '+notes[n['goalId'][:8]][1],dissent=['C11 HOLD_UNSPECIFIED_C11 source/course placement remains unresolved; no GK/LK inference.','E1/G1 needs_human_review ai_candidate approved0; no observed learner performance or human approval.']);assert n['profile']==old['profile'];records.append(n);proof.append({'goalId':n['goalId'],'sourceRecordPath':str(E/'positive/current-e5-G1.original-author.records.jsonl'),'sourceRecord':old,'reviewedRecord':n,'wholeScientificProfileExact':True,'rootBoundedG1Selection':True,'courseSourceHoldRetained':True})
rp=OUT/'positive/whole38.current-paired-reviewed.records.jsonl';rp.parent.mkdir(parents=True,exist_ok=True);rp.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records));cfg=read(AUTH/'positive/current37-technical-context-1.config.json');cfg.update(reviewId=records[0]['reviewId'],reviewPath=str(rp),scope={'label':'Genuine paired current D38 context plus inherited whole37 and paired e5 current G1; inactive ROOT-reviewed selection only','goalIds':[r['goalId']for r in records]},requireApproved=False,reviewRunManifestPaths=[]);pp=OUT/'positive/whole38.current-paired-reviewed.future-active.config.json';put(pp,cfg);put(OUT/'checks/whole38-scientific-body-exact-and-current-pair-selection.actual.json',{'schemaVersion':1,'records':proof,'original37WholeProfilesExact':True,'e5WholeOriginalProfileExact':True,'allE1G1':all(r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' for r in records),'approvedCount':0,'sourceCourseHoldRetained':True,'activeWrites':[]})
# Candidate files are exact neutral AUTHOR outputs, referenced without rewriting science.
registryPath=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');registry=read(registryPath);put(OUT/'baseline/current-active-registry.exact.json',registry)
roots=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',str(registryPath)]
baselines=[]
for path in roots:
 p=Path(path);cp(p,OUT/'baseline'/p.name);baselines.append({'path':path,'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size})
put(OUT/'baseline/current-active-root-bindings.actual.json',{'schemaVersion':1,'capturedAt':now,'files':baselines,'allOtherSubjectRegistryExact':True})
subject=read(AUTH/'registry/chemie-subject.current517-technical-context-candidate.inactive.json');old=BASE/'chemie-b008-current-P26-plus-protected12-dual-resolution-technical-20261010-v1';mapping={str(old/f'{o}/resolution-index.json'):str(OUT/f'{g}/resolution-index.json')for o,g in [('current-20','current20'),('current-6','current6'),('protected-12','protected12')]}
subject['resolutionIndexPaths']=[mapping.get(p,p)for p in subject['resolutionIndexPaths']]
for rule in subject['resolutionSupersessions']:
 for k in ['supersededIndexPath','replacementIndexPath']:rule[k]=mapping.get(rule[k],rule[k])
subject['positiveEvidenceConfigPaths']=[p for p in subject['positiveEvidenceConfigPaths']if not p.startswith(str(AUTH)+'/positive/')]+[str(pp)]
put(OUT/'registry/chemie-subject.reviewed.future-active.json',subject)
full=json.loads(json.dumps(registry));full['subjects']=[subject if s['subject']=='chemie'else s for s in registry['subjects']];assert all(full['subjects'][i]==s for i,s in enumerate(registry['subjects'])if s['subject']!='chemie');put(OUT/'registry/all-subjects.chemie-only-merge.future-active.config.json',full)
inactive=json.loads(json.dumps(full));chem=next(s for s in inactive['subjects']if s['subject']=='chemie');chem.update(landscapePath=str(AUTH/'candidate/whole517.inactive.machine-content-final-learner-copy-author.json'),semanticKindLedgerPath=str(AUTH/'candidate/current517-final-learner-copy-semantic-kinds.portable.inactive.json'),visualizationQaPath=str(AUTH/'candidate/current517-normal-QA.inactive.json'));put(OUT/'registry/all-subjects.inactive-check.config.json',inactive)
# Own existing chemistry capsule: exact scripts already present. Refresh shared registry/other active roots only in the capsule.
for p in roots:cp(Path(p),C/p)
shutil.copytree(R/OUT,C/OUT,dirs_exist_ok=True,symlinks=True)
# actual 38 unpublished resource aliases are byte-exact regular files, never symlink outside public root.
alias=read(E/'checks/current38-normal-resource-portable-exact-aliases.actual.json');put(OUT/'checks/current38-resource-aliases.exact.json',alias)
print('alias keys',list(alias));print('P38 materialized; inactive Chem-only registry based actual current active snapshot',sha(registryPath.read_bytes()))
