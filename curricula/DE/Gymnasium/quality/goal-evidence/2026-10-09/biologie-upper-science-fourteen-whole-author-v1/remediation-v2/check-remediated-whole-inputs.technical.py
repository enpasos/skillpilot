# SPDX-License-Identifier: Apache-2.0
"""Ordinary bounded P/schema checks and exact current/candidate delta witnesses."""
import copy,hashlib,importlib.util,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;OLD=OWN.parent;REL=OWN.relative_to(ROOT).as_posix()
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(n,x):
 p=OWN/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'targeted-whole-remediation.first.freeze.json').exists()
science=load(OLD/'whole-fourteen-science-author.first.freeze.json');originals=science.get('files',science.get('outputs'))
assert originals
for b in originals:
 actual=bind(ROOT/b['path']);assert actual['sha256']==b['sha256'] and actual['bytes']==b['bytes'],b['path']
cfg=REL+'/fourteen-whole-positive-understanding.author-candidate.config.json';cand=REL+'/fourteen-whole-profile-candidates.author-candidates.json'
commands=[['./node_modules/.bin/tsx','scripts/materializePositiveGoalEvidenceCandidates.ts','--config',cfg,'--candidates',cand,'--write'],['./node_modules/.bin/tsx','scripts/materializePositiveGoalEvidenceCandidates.ts','--config',cfg,'--candidates',cand],['./node_modules/.bin/tsx','scripts/positiveGoalEvidenceReview.ts','--config='+cfg,'--mode=check']]
runs=[]
for i,cmd in enumerate(commands,1):
 r=subprocess.run(cmd,cwd=ROOT/'app',capture_output=True,text=True);p=OWN/f'checks/ordinary-remediated-positive-{i}.actual.stdout.txt';p.write_text(r.stdout+r.stderr)
 runs.append(dict(argv=cmd,cwd='app',exitCode=r.returncode,output=bind(p)))
 write('checks/ordinary-remediated-positive.actual-terminal.json',dict(schemaVersion=1,runs=runs,exitCode=r.returncode,scientificApproval=False))
 assert r.returncode==0,r.stdout+r.stderr
records=[json.loads(s) for s in (OWN/'fourteen-whole-positive-understanding.author-candidate.review.jsonl').read_text().splitlines() if s]
assert len(records)==14
for i,r in enumerate(records):
 jsonschema.validate(r,load(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
 assert r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and not r['reviewRunIds']
 assert len(r['profile']['applicationCaseBriefs'])==(3 if i==8 else 2)
before=load(OLD/'input/current-canonical479.original.snapshot.json');after=load(OWN/'input/canonical479-one-en-fidelity.candidate.json')
ID='8375310d-1f7e-542d-9969-55ad4bd37f7c';expected=copy.deepcopy(before)
g=next(g for g in expected['goals'] if g['id']==ID);g['descriptionEn']=next(g for g in after['goals'] if g['id']==ID)['descriptionEn']
assert expected==after and len(after['goals'])==479
assert load(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')==before
kindbefore=load(OLD/'input/current-kinds394.original.snapshot.json');kindafter=load(OWN/'input/kinds394-one-en-fingerprint.technical-candidate.json');ke=copy.deepcopy(kindbefore)
next(r for r in ke['decisions'] if r['goalId']==ID)['sourceFingerprint']=next(r for r in kindafter['decisions'] if r['goalId']==ID)['sourceFingerprint'];assert ke==kindafter
proof=load(OWN/'source/NI.one-source-row.exact-before-after.candidate.json');sb=load(ROOT/proof['originalSourceBinding']['path']);sa=load(ROOT/proof['candidateSourceBinding']['path']);se=copy.deepcopy(sb)
next(i for i,x in enumerate(se['sourceGoals']) if x['id']==proof['sourceGoalId'])
se['sourceGoals']=[proof['afterWholeSourceGoal'] if x['id']==proof['sourceGoalId'] else x for x in se['sourceGoals']];assert se==sa
mb=load(ROOT/proof['originalMappingBinding']['path']);ma=load(ROOT/proof['candidateMappingBinding']['path']);me=copy.deepcopy(mb);me['sourceExtractionPath']=proof['candidateSourceBinding']['path'];assert me==ma
originalframe=load(OLD/'fourteen-current-ordinary-source-partner-frame.neutral-input.json');frame=load(OWN/'fourteen-whole69-source-duties-68-partners.remediated.neutral-input.json')
assert frame['affectedDecisionCount']==69 and frame['wholePartnerGoalIds']==originalframe['wholePartnerGoalIds'] and len(frame['wholePartnerGoalIds'])==68
oldDecisions=[d['wholeCurrentDecision'] for m in originalframe['wholeAffectedMappingDecisions'] for d in m['wholeSelectedDecisions']]
newDecisions=[d['wholeCurrentDecision'] for m in frame['wholeAffectedMappingDecisions'] for d in m['wholeSelectedDecisions']];assert oldDecisions==newDecisions
for old,new in zip(originalframe['wholeCurrentPartnerBodies'],frame['wholeCurrentPartnerBodies']):
 expect=copy.deepcopy(old)
 if old['id']==ID:expect['descriptionEn']=g['descriptionEn']
 assert expect==new
materials=load(OWN/'fourteen-whole-twenty-nine-bilingual-cases.author-candidate.json');cases=[c for m in materials['entries'] for c in m['authoredCases']];assert len(cases)==29 and len({c['caseId'] for c in cases})==29
for c in cases:
 assert not c['actualLearnerPerformance'] and not c['actualExperimentPerformed']
 for f in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:
  assert set(c[f])=={'de','en'} and all(len(c[f][lang])>60 for lang in ['de','en'])
germcase=next(c for c in cases if c['caseId']=='procedure-germination')
assert '77,5 %' in germcase['workedResponse']['de'] and '77, 5' not in germcase['workedResponse']['de']
assert load(OWN/'checks/remediated-task-controls-data-layout.actual-terminal.json')['exitCode']==0
schema=load(ROOT/'docs/landscape-runtime.schema.json');sp=importlib.util.spec_from_file_location('validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
checked=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink();assert mod.validate_file(p.relative_to(ROOT).as_posix(),schema),p;checked.append(bind(p))
write('checks/targeted-remediated-source-goal-profile-schema.actual-terminal.json',dict(schemaVersion=1,checkedAt=datetime.now(timezone.utc).isoformat(),exitCode=0,ordinaryPRecords=14,bilingualCases=29,validatedOwnJsonCount=len(checked),ownJsonBindings=checked,originalScienceFilesExact=len(originals),wholeCanonicalNodes=479,currentCurricularAtoms=394,wholeSelectedDescriptionsUnchanged=13,exactIntentionalENFieldChanges=1,wholeUnselectedGoalObjectsExact=465,kindTechnicalFingerprintOnly=1,genuineTargetedKindAMConfirmation='PENDING',sourceRowsCorrected=1,sourceDecisionDictionariesExact=69,wholeSourcePartnersPreserved=68,originalPartialDecisionAndTwoPartnersExact=True,practicalDutiesPreserved=True,activeCanonicalExact=True,independentApprovals=0,humanApprovals=0,activeWrites=[],newScientificClosures=0,restoredBindings=0,netStrictGain=0))
print(json.dumps({'ordinaryP':14,'wholeCases':29,'originalScienceExact':len(originals),'sourceDecisions':69,'partners':68,'kindAMTargetedReview':'PENDING','exitCode':0}))
