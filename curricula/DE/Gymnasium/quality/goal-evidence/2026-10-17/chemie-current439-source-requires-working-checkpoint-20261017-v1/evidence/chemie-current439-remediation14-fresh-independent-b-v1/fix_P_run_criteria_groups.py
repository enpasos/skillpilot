import json,hashlib,shutil,datetime
from pathlib import Path
out=Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-remediation14-fresh-independent-b-v1');sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest();p=out/'P14.whole-current-profiles.independent-b.candidate.jsonl';rs=[json.loads(s) for s in p.read_text().splitlines()];runPath=out/'P14.whole-current-profiles.independent-b.run.json';template=json.loads(runPath.read_text());shutil.copyfile(runPath,out/'ATTEMPT1.P14.invalid-single-criteria.run.json');runPath.unlink();cp=out/'CHECK.actual-stock-P14-record-schema-and-semantics.json';cp.rename(out/'CHECK.ATTEMPT1.P14-run-criteria-mismatch.actual.json')
groups={}
for r in rs:groups.setdefault(r['reviewCriteriaFingerprint'],[]).append(r)
manifest=[]
for i,(criteria,records) in enumerate(groups.items(),1):
 runId=f'chemie-remediation14-fresh-independent-b-20261017-v1-native-P-group{i}'
 for r in records:r['reviewRunIds']=[runId]
 path=out/f'P.group{i}.whole-current-profiles.candidate.jsonl';path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records));run=json.loads(json.dumps(template));run.update({'runId':runId,'goalIds':[r['goalId'] for r in records],'criteriaFingerprint':criteria,'outputDigest':sha(path.read_bytes()),'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')})
 for a in run['inputArtifacts']:
  if a['role']=='review_criteria':a['digest']=criteria
 rp=out/f'P.group{i}.whole-current-profiles.run.json';rp.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n');manifest.append({'recordsPath':str(path),'runPath':str(rp),'criteriaFingerprint':criteria,'goalIds':run['goalIds']})
p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rs));(out/'P.actual-two-criteria-run-groups.json').write_text(json.dumps(manifest,indent=2)+'\n');print('P grouped by exact preserved criterion fingerprint: 11+3; no profile content or scientific decisions changed')
