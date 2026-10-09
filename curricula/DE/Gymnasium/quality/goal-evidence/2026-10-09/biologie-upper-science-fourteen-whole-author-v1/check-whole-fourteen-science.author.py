# SPDX-License-Identifier: Apache-2.0
"""Bounded normal P/schema/source-context checks; never a scientific approval."""
import csv,hashlib,importlib.util,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix();CHECKS=OWN/'checks';CHECKS.mkdir(exist_ok=True)
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,obj):(OWN/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'whole-fourteen-science-author.first.freeze.json').exists(),'Existing first seal is immutable.'
# Preserve the actual initial verification error; no data was written by that command.
write('checks/initial-verification-before-write.actual-terminal.json',dict(schemaVersion=1,argv=['./node_modules/.bin/tsx','scripts/materializePositiveGoalEvidenceCandidates.ts','--config',REL+'/fourteen-whole-positive-understanding.author-candidate.config.json','--candidates',REL+'/fourteen-whole-profile-candidates.author-candidates.json'],cwd='app',exitCode=1,errorCode='ENOENT',actualDiagnostic='Initial command omitted --write; verification attempted to read the not-yet-created candidate review JSONL. No active source was written. Ordinary --write materialization follows.',missingPath=REL+'/fourteen-whole-positive-understanding.author-candidate.review.jsonl',scientificFinding=False))
commands=[['./node_modules/.bin/tsx','scripts/materializePositiveGoalEvidenceCandidates.ts','--config',REL+'/fourteen-whole-positive-understanding.author-candidate.config.json','--candidates',REL+'/fourteen-whole-profile-candidates.author-candidates.json','--write'],['./node_modules/.bin/tsx','scripts/materializePositiveGoalEvidenceCandidates.ts','--config',REL+'/fourteen-whole-positive-understanding.author-candidate.config.json','--candidates',REL+'/fourteen-whole-profile-candidates.author-candidates.json'],['./node_modules/.bin/tsx','scripts/positiveGoalEvidenceReview.ts','--config='+REL+'/fourteen-whole-positive-understanding.author-candidate.config.json','--mode=check']]
runs=[]
for i,cmd in enumerate(commands,1):
 r=subprocess.run(cmd,cwd=ROOT/'app',capture_output=True,text=True)
 log=CHECKS/f'ordinary-positive-{i}.actual.stdout.txt';log.write_text(r.stdout+r.stderr)
 runs.append(dict(argv=cmd,cwd='app',exitCode=r.returncode,output=bind(log)))
 write('checks/ordinary-positive.actual-terminal.json',dict(schemaVersion=1,runs=runs,exitCode=r.returncode,role='ordinary technical validation only; no independent scientific verdict'))
 assert r.returncode==0,r.stdout+r.stderr
schema=load(ROOT/'docs/landscape-runtime.schema.json');sp=importlib.util.spec_from_file_location('schema_validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
jsonfiles=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink()
 assert mod.validate_file(p.relative_to(ROOT).as_posix(),schema),p
 jsonfiles.append(bind(p))
config=load(OWN/'fourteen-whole-positive-understanding.author-candidate.config.json')
jsonschema.validate(config,load(ROOT/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
records=[json.loads(s) for s in (OWN/'fourteen-whole-positive-understanding.author-candidate.review.jsonl').read_text().splitlines() if s.strip()]
assert len(records)==14
for r in records:
 jsonschema.validate(r,load(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
 assert r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]
 assert len(r['profile']['applicationCaseBriefs'])==2 and len(r['profile']['expectations'])==3
whole=load(OWN/'whole-fourteen-current-goals-source-and-context.input.snapshot.json');canon=load(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');cg={g['id']:g for g in canon['goals']};ids=whole['scopeGoalIds']
assert len(canon['goals'])==479 and whole['currentCurricularAtoms']==394
for e in whole['entries']:
 gid=e['goalId'];assert e['wholeCurrentGoal']==cg[gid] and not cg[gid].get('resourceLinks')
 assert e['wholeParents']==[g for g in canon['goals'] if gid in g.get('contains',[])]
 assert e['wholePrerequisites']==[cg[i] for i in cg[gid].get('requires',[])]
 assert e['wholeConsumers']==[g for g in canon['goals'] if gid in g.get('requires',[])]
source=load(ROOT/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json');sources={s['id']:s for s in source['sourceGoals']}
for e in whole['entries']:assert e['wholeSourceGoal']==sources[e['wholeSourceGoal']['id']]
reg=load(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie')
for key in ['semanticAtomicityConfigPath','memoryReviewConfigPath']:
 cfg=load(ROOT/bio[key]);actual=[json.loads(s) for s in (ROOT/cfg['reviewPath']).read_text().splitlines() if s.strip()]
 assert [r for r in actual if r.get('goalId') in ids]==whole['existingAtomicityMemoryReuse'][key]['unchangedSelectedRows']
primary=load(OWN/'existing-four-whole-official-primary-bindings.author.json')
for e in primary['entries']:
 assert bind(ROOT/e['originalPath'])==e['actualCurrentOriginalBinding']
 assert bind(ROOT/e['visibleExtractionPath'])==e['visibleBinding']
materials=load(OWN/'fourteen-whole-twenty-eight-bilingual-cases.author-candidate.json');cases=[c for e in materials['entries'] for c in e['authoredCases']]
assert len(cases)==28 and len({c['caseId'] for c in cases})==28
for c in cases:
 assert not c['actualLearnerPerformance'] and not c['actualExperimentPerformed']
 for fld in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:assert set(c[fld])=={'de','en'}
write('checks/targeted-schema-context.actual-terminal.json',dict(schemaVersion=1,checkedAt=datetime.now(timezone.utc).isoformat(),exitCode=0,validatedOwnJsonCount=len(jsonfiles),ownJsonBindings=jsonfiles,ordinaryProfileCount=len(records),wholeCurrentCanonicalNodes=479,currentCurricularAtoms=394,wholeGoalsPreserved=14,bilingualWholeCases=28,profileStatuses={'ai_candidate':14,'needs_human_review':14,'E1':14,'G1':14},actualOriginalPrimaryFiles=4,existingAMRowsReused=14,independentApprovals=0,humanApprovals=0,activeWrites=[],newScientificClosures=0,restoredBindings=0,netStrictGain=0))
print(json.dumps({'ordinaryP':14,'wholeCases':28,'jsonChecks':len(jsonfiles),'scienceApprovals':0,'exitCode':0}))
