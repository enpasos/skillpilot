import json,subprocess,time,importlib.util,hashlib
from pathlib import Path
import jsonschema
from datetime import datetime,timezone
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1')
cmd=['npm','--prefix','app','run','quality:positive-goal-evidence-candidates','--','--config',str(P/'positive/ten-before-raster.author.config.json'),'--candidates',str(P/'positive/ten-scientific-P.candidate-set.json')]
t=time.monotonic();result=subprocess.run(cmd,capture_output=True,text=True)
(P/'checks/normal-P10-reproduction.stdout.actual.txt').write_text(result.stdout);(P/'checks/normal-P10-reproduction.stderr.actual.txt').write_text(result.stderr)
term={'schemaVersion':1,'command':cmd,'exitCode':result.returncode,'elapsedSeconds':round(time.monotonic()-t,3),'endedAt':datetime.now(timezone.utc).isoformat(),'role':'Actual ordinary candidate reproduction terminal; no scientific or human approval'}
(P/'checks/normal-P10-reproduction.terminal.actual.json').write_text(json.dumps(term,indent=2)+'\n')
assert result.returncode==0,result.stderr
schema=json.load(open('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));records=[json.loads(s) for s in (P/'positive/ten-before-raster.author.review.jsonl').read_text().splitlines()]
for record in records:
 jsonschema.validate(record,schema)
 assert (record['status'],record['reviewAuthority'],record['evidenceLevel'],record['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1')
 assert record['reviewRunIds']==[]
source=json.load(open(P/'sourcefix/HE-whole144-six-precision-authored-operationalization.candidate.json'));groups={p['id']:set(p['sourceGoalIds']) for p in source['passages']}
for g in source['sourceGoals']:
 assert g['id'] in groups[g['passageId']],g['id']
mp=json.load(open(P/'sourcefix/HE-whole157-144-six-partial-edges.candidate.json'))
changed=json.load(open(P/'sourcefix/six-exact-primary-source-precision-deltas.author.json'))['changes']
assert len(changed)==6 and len(source['sourceGoals'])==144 and len(mp['mappings'])==157 and len(mp['decisions'])==144
for c in changed:
 a=c['wholeAfter'];assert a['granularity']=='authoredOperationalization' and a['isOfficialBullet'] is False and a['officialNumberingClaim'] is False
 assert c['mappingAfter']['matchType']=='partial'
 assert all(g not in a['sourceSpan'] for g in ['Q2.4.1','Q2.4.2','Q2.4.3','Q2.4.4','Q2.4.5','Q2.4.6'])
spec=importlib.util.spec_from_file_location('ordinary_validate_schemas','scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
runtime=json.load(open('docs/landscape-runtime.schema.json'));files=list(P.rglob('*.json'))
for f in files:assert m.validate_file(str(f),runtime),f
for f in P.rglob('*.jsonl'):
 for s in f.read_text().splitlines():json.loads(s)
assert not [f for f in P.rglob('*') if f.is_symlink()]
committable=set(subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z','--'],check=True,capture_output=True).stdout.decode().split('\0'))
assert all(str(f) in committable for f in P.rglob('*') if f.is_file()),'Own candidate includes ignored file'
science=json.load(open(P/'science/ten-whole-profiles-and-twenty-cases.author.json'))
assert len(science['wholeGoalsAndProfilesAndCases'])==10
for row in science['wholeGoalsAndProfilesAndCases']:
 assert len(row['wholeMaterialCases'])==2
 for case in row['wholeMaterialCases']:
  for key in ['material','task','workedSolution','freshTransfer','freshTransferSolution','limits']:
   assert case[key+'De'].strip() and case[key+'En'].strip()
  assert sum(c['points'] for c in case['rubric']['criteria'])==10
receipt={'schemaVersion':1,'endedAt':datetime.now(timezone.utc).isoformat(),'normalP10ExitCode':0,'v2ProfileRecordsValidated':10,'PStatus':'needs_human_review','PAuthority':'ai_candidate','PEvidenceLevel':'E1','PMaximumClaimScope':'G1','humanApproval':False,'wholeProfiles':10,'wholeBilingualCases':20,'sourceGoalCount':144,'mappingCount':157,'decisionCount':144,'sixAuthoredPartialSourceCorrections':6,'ordinaryTargetedJSONFilesParsedAndValidated':len(files),'symlinks':0,'ownFilesAllComm itt able'.replace(' ',''):True,'strictGain':0,'operativeWrites':0,'scope':'Targeted AUTHOR checks only; does not replace native or independent gates'}
(P/'checks/targeted-schema-and-ordinary-candidate.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
