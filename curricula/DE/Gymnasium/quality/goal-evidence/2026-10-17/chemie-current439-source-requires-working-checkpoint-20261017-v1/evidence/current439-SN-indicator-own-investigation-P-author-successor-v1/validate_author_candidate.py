import hashlib,json
from pathlib import Path
import jsonschema
r=Path(__file__).resolve().parent
p=json.loads((r/'candidate/P1.successor.whole-profile.body.json').read_text())
schema=json.loads(Path('/home/enpasos/projects/skillpilot/contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text())
jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$ref':'#/$defs/profile','$defs':schema['$defs']}).validate(p)
a=json.loads((r/'archive/INPUTS.exact-archive.manifest.json').read_text())
assert len(a['inputs'])==13
for i in a['inputs']:
 for k in ['original','archive']:
  q=Path(i[k]['path']);b=q.read_bytes();assert hashlib.sha256(b).hexdigest()==i[k]['sha256'];assert len(b)==i[k]['bytes']
 assert Path(i['original']['path']).read_bytes()==Path(i['archive']['path']).read_bytes()
old=json.loads((r/'archive/P1.previous-current.whole-row.exact.jsonl').read_text())
assert p['expectations'][0]['essentialUnderstandingDe']==old['profile']['expectations'][0]['essentialUnderstandingDe']
assert p['expectations'][0]['essentialUnderstandingEn']==old['profile']['expectations'][0]['essentialUnderstandingEn']
assert len(p['applicationCaseBriefs'])==2
ids=[e['id'] for e in p['expectations']];assert p['coverageExpectations']['requiredExpectationIds']==ids
for n,c in enumerate(p['applicationCaseBriefs'],1):
 assert json.loads((r/f'candidate/CASE-{n}.complete.operative.json').read_text())['case']==c
 for x in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn','understandingFocusDe','understandingFocusEn']:assert 1<=len(c[x])<=2000
intent=json.loads((r/'candidate/P1.successor.author-intent.NOT-native-record.json').read_text())
assert (intent['status'],intent['reviewAuthority'],intent['evidenceLevel'],intent['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1')
assert intent['reviewRunIds']==[] and not intent['independentReviewClaim'] and not intent['actualLearnerPerformanceClaim'] and not intent['activationRequested']
raw=json.loads((r/'candidate/RAW-OBSERVATIONS.unperformed.template.json').read_text());assert raw['actualPerformanceEstablished'] is False
result={'closedV2ProfileBodySchema':'pass','completeCasesEqualProfileBriefs':True,'twoIndependentDemonstrationsRetained':p['coverageExpectations']['minimumIndependentDemonstrations']==2,'exactOriginalInputAndArchivePinsRechecked':len(a['inputs']),'wholeOldP439Unchanged':True,'other438RowsUntouched':True,'canonicalGoalAndImageUnchanged':True,'E1G1NeedsHumanReviewAiCandidate':True,'actualExperimentPerformedOrClaimed':False,'newIndependentReviewOrApprovalClaimed':False,'nativeReviewRecordWritten':False,'activationOrMainOrKWrites':False,'limits':['Structural author validation only.','Native record/material/stock binding, current actual safety release and independent scientific/source reviews are outside this author artifact.','No raw observations or physical completion were fabricated.']}
(r/'validation/AUTHOR-STRUCTURAL-VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
