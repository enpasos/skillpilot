# SPDX-License-Identifier: Apache-2.0
"""Normal isolated P/schema/campaign checks; existing judgments are not re-reviewed."""
import hashlib,importlib.util,json,shutil,subprocess
from pathlib import Path
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix();CAP=ROOT/'tmp/biologie-upper-science-native14-current394-capsule/targeted-two-v2-capsule'
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def copy(p):
 dst=CAP/p.relative_to(ROOT);dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():assert dst.read_bytes()==p.read_bytes()
 else:shutil.copyfile(p,dst)
def write(p,x):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
entry=load(OWN/'neutral-targeted-two-native-independent-review.entry.json');pcfg=load(ROOT/entry['positiveConfigPath'])
for p in [ROOT/entry['positiveConfigPath'],ROOT/entry['positiveRecordPath'],ROOT/pcfg['reviewCriteriaPath']]:copy(p)
for name in ['positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:copy(ROOT/'app/scripts'/name)
for path in ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:copy(ROOT/path)
for name in ['ajv','ajv-formats','fast-deep-equal','json-schema-traverse','fast-uri','require-from-string']:
 dest=CAP/'app/node_modules'/name
 if not dest.exists():shutil.copytree(ROOT/'app/node_modules'/name,dest,symlinks=False)
assert not any(p.is_symlink() for p in CAP.rglob('*'))
command=[str(ROOT/'app/node_modules/.bin/tsx'),'scripts/positiveGoalEvidenceReview.ts','--config='+entry['positiveConfigPath'],'--mode=check']
r=subprocess.run(command,cwd=CAP/'app',capture_output=True,text=True)
log=OWN/'checks/ordinary-capsule-positive2.actual.stdout.txt';assert not log.exists();log.write_text(r.stdout+r.stderr)
write(OWN/'checks/ordinary-capsule-positive2.actual-terminal.json',dict(schemaVersion=1,argv=command,cwd=CAP.relative_to(ROOT).as_posix()+'/app',exitCode=r.returncode,output=bind(log),role='ordinary isolated technical P validation only; no independent scientific verdict'))
assert r.returncode==0,r.stdout+r.stderr
schema=load(ROOT/'docs/landscape-runtime.schema.json');sp=importlib.util.spec_from_file_location('schema_validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
jsons=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink() and mod.validate_file(p.relative_to(ROOT).as_posix(),schema),p
 jsons.append(bind(p))
jsonschema.validate(load(ROOT/entry['candidateCanonicalPath']),schema)
jsonschema.validate(pcfg,load(ROOT/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
records=[json.loads(s) for s in (ROOT/entry['positiveRecordPath']).read_text().splitlines() if s.strip()];assert len(records)==2
for record in records:
 jsonschema.validate(record,load(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
 assert record['reviewAuthority']=='ai_candidate' and record['status']=='needs_human_review' and record['evidenceLevel']=='E1' and record['maximumClaimScope']=='G1' and record['reviewRunIds']==[]
 assert len(record['profile']['applicationCaseBriefs'])==(3 if record['goalId']=='19bcea3a-af7a-5feb-b083-d11bd51303a0' else 2)
for b in entry['inputBindings']:assert bind(ROOT/b['path'])==b
for b in load(OWN.parent/'whole-fourteen-science-author.first.freeze.json')['files']:assert bind(ROOT/b['path'])==b
for b in load(OWN.parent/'remediation-v2/targeted-whole-remediation.first.freeze.json')['files']:assert bind(ROOT/b['path'])==b
for n in ['native-preparation-v1/fourteen-native-technical-author.first.freeze.json','remediation-v3-p11/targeted-p11-own-results.first.freeze.json']:
 for b in load(OWN.parent/n)['files']:assert bind(ROOT/b['path'])==b
assert load(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')==load(OWN/'before/active-canonical.current479.exact.json')
assert load(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')==load(OWN/'before/active-visualization.current394.exact.json')
model=load(ROOT/entry['actualFullCandidateModelPath']);diff=load(ROOT/entry['whole394PageContextDiffPath'])
assert len(model['pages'])==394 and len(diff['entries'])==394
unselectedExact=sum(not e['selected'] and not e['changedFields'] for e in diff['entries'])
assert unselectedExact==diff['unselectedExactPages']
assert all(e['goalId']=='b66372fc-f72d-5686-9570-1939ed3fbd2a' for e in diff['entries'] if e['changedFields'])
assert sum(not e['changedFields'] for e in diff['entries'])==393
oldentry=load(OWN.parent/'native-preparation-v1/neutral-fourteen-native-independent-review.entry.json')
oldrecords=[json.loads(s) for s in (ROOT/oldentry['positiveRecordPath']).read_text().splitlines() if s.strip()]
newBy={r['goalId']:r for r in records};oldBy={r['goalId']:r for r in oldrecords}
assert newBy['b66372fc-f72d-5686-9570-1939ed3fbd2a']['profile']==oldBy['b66372fc-f72d-5686-9570-1939ed3fbd2a']['profile']
p11=json.loads((OWN.parent/'remediation-v3-p11/P11-own-results.author-candidate.review.jsonl').read_text())
assert newBy[p11['goalId']]['profile']==p11['profile']
oldCases=load(OWN.parent/'remediation-v2/fourteen-whole-twenty-nine-bilingual-cases.author-candidate.json')
newCases=load(OWN.parent/'remediation-v3-p11/whole-fourteen-twenty-nine-cases.only-P11-own-results.candidate.json')
assert all(oldCases['entries'][i]==newCases['entries'][i] for i in range(14) if oldCases['entries'][i]['goalId'] not in entry['goalIds'])
assert load(ROOT/entry['candidateCanonicalPath'])==load(ROOT/oldentry['candidateCanonicalPath'])
for b in entry['retainedOtherTwelveRasterBindings']:
 orig=next(z for z in oldentry['rasterBindings'] if z['goalId']==b['goalId']);assert b['actualOriginalImage']==orig['actualOriginalImage'] and b['resourceLinkCandidate']==orig['resourceLinkCandidate']

for c in entry['campaigns']:
 campaign=load(ROOT/c['campaignPath']);assert campaign['blindToOtherReviews'] and len(campaign['batches'])==1
 assert set(campaign['batches'][0]['goalIds'])==set(entry['goalIds'])
 assert c['actualResultCount']==0
write(OWN/'checks/native2-schema-P-and-current-guard.actual-terminal.json',dict(schemaVersion=1,exitCode=0,role='normal technical candidate checks only; whole D/P/V scientific reviews pending',ordinaryPProfileCount=2,positiveApproved=0,positiveNeedsHumanReview=2,positiveAuthority='ai_candidate',positiveLevel='E1',positiveClaimScope='G1',ownJsonCount=len(jsons),ownJsonBindings=jsons,currentCanonicalNodes=479,currentCurricularAtomicGoals=394,exactUnselectedPages=unselectedExact,additionalUnselectedSourceContextChanges=[dict(goalId=e['goalId'],changedFields=e['changedFields']) for e in diff['entries'] if not e['selected'] and e['changedFields']],exactUnselectedGoalObjects=479,targetedWholeProfileCount=2,targetedWholeBilingualCases=4,otherTwelveProfilesAnd25CasesExact=True,selectedWholeDescriptionsExact=2,exactIntentionalENFieldCorrection=0,KindAM1TargetedConfirmation='PENDING',science60OriginalFirstSealExact=True,actualIndependentCampaigns=2,actualIndependentResults=0,symlinksCreated=0,activeWrites=[],newScientificClosures=0,restoredBindings=0,netStrictGain=0,humanApproval=False))
print(json.dumps({'P2':'PASS candidates only','jsonChecks':len(jsons),'whole394':True,'unselectedPageExactCount':unselectedExact,'EN1KindAMTargetedConfirmation':'PENDING','independentResults':0,'strictGain':0}))
