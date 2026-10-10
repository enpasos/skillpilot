import json,hashlib,datetime
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-independent-b-20261010-v1';N=B/'normal-b12';C=json.loads((N/'description-review-campaign.json').read_text());batch=C['batches'][0]['batchId'];O=N/'results';T=N/'results-normal-valid';T.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
F=B/'FIRST.actual-sealed-before-current-peer-or-author-outcomes.json';first=json.loads(F.read_text())
assert all(sha(R/x['path'])==x['sha256'] for x in first['files'])
old=[json.loads(s) for s in (O/f'{batch}.records.jsonl').read_text().splitlines()];new=[]
for r in old:
 q=json.loads(json.dumps(r));e=q['understandingEvidence'];e['transferExpectationDe']=e.pop('transferEvidenceDe');e['transferExpectationEn']=e.pop('transferEvidenceEn');q['runId']=r['runId']+'-schema-export';q['recordId']=q['runId']+'.'+q['goalId'];new.append(q)
(T/f'{batch}.records.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in new))
run=json.loads((O/f'{batch}.run.json').read_text());run['runId']+='-schema-export';run['outputDigest']='sha256:'+sha(T/f'{batch}.records.jsonl');write(T/f'{batch}.run.json',run)
write(B/'NORMAL-schema-export-correction.actual.json',{'correctedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unchangedOriginalFIRST':ref(F),'originalFirstAllFilesStillExact':True,'cause':'Own serializer used transferEvidenceDe/En, whereas unchanged normal record schema requires transferExpectationDe/En. First normal checker correctly rejected this mechanical schema error.','change':'Rename only the two transfer field keys; values, all twelve decisions, positive chains, rationales and actual review observations retained. Export run/record identities and output digest identify the corrected output.','currentPeerOrAuthorOutcomeRead':False,'originalRejectedNormalExportsRetainedAt':str(O.relative_to(R)),'validNormalResultsDir':str(T.relative_to(R)),'newNormalExports':[ref(T/f'{batch}.records.jsonl'),ref(T/f'{batch}.run.json')],'method':ref(Path(__file__))})
print('original FIRST unchanged; 12 normal schema export corrections only')
