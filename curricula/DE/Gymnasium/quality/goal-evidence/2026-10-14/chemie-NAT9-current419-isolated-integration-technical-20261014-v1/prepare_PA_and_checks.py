# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime,concurrent.futures
R=Path('/home/enpasos/projects/skillpilot');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');O=B/'chemie-NAT9-current419-isolated-integration-technical-20261014-v1';P=B/'chemie-NAT31-nine-reviewed-children-four-parent-clusters-current414-minimal-author-integration-proposal-20261014-v1';H=R/'tmp/chemie-resume-20261014/NAT9-host';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
def read(p):return json.loads((R/p).read_text())
def dump(p,j):p=R/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
original=R/P/'P/nine-existing-whole-profile-records.exact.jsonl';groups={}
for raw in original.read_bytes().splitlines(keepends=True):
 j=json.loads(raw);groups.setdefault(j['reviewId'],[]).append((raw,j))
criteria='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v1/review/chemistry-goal-description-understanding-evidence-review-criteria-v1.md';criteriaSHA='sha256:'+hashlib.sha256((R/criteria).read_bytes()).hexdigest();jobs=[];configs=[]
for num,(rid,rows) in enumerate(groups.items(),1):
 rp=O/'P'/f'P9.group-{num}.original-whole-lines.exact.jsonl';(R/rp).parent.mkdir(exist_ok=True);(R/rp).write_bytes(b''.join(a for a,b in rows));assert all(j['reviewCriteriaFingerprint']==criteriaSHA for a,j in rows)
 cfg={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':rid,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':rows[0][1]['landscapeId'],'landscapePath':CAN,'semanticKindLedgerPath':SEM,'reviewCriteriaPath':criteria,'reviewPath':str(rp),'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Exact original reviewed bounded NAT profiles; technical normal address only, no new science','goalIds':[j['goalId'] for a,j in rows]},'reviewRunManifestPaths':[]};cp=O/'config'/f'P9.group-{num}.normal-current419.original-science.config.json';dump(cp,cfg);jobs.append(('P9-group'+str(num),'positiveGoalEvidenceReview.ts',str(cp)));configs.append(str(cp))
acfg=[]
for n in ['A7','A2']:
 cfg=read(P/'config'/f'{n}.original-records-on-current551.scoped.config.json');cfg['landscapePath']=CAN;cp=O/'config'/f'{n}.original-science.normal-current419.config.json';dump(cp,cfg);jobs.append((n,'semanticAtomicityReview.ts',str(cp)));acfg.append(str(cp))
def run(job):
 name,script,cf=job;argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/'+script,'--config='+cf,'--mode=check'];start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(argv,cwd=H,capture_output=True,text=True)
 for k in ['stdout','stderr']:(R/O/'receipts'/(name+'.stock.'+k+'.actual.txt')).write_text(getattr(p,k))
 receipt={'name':name,'argv':argv,'cwd':str(H),'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr};dump(O/'receipts'/(name+'.stock.completed-run.actual.json'),receipt);return receipt
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(run,jobs))
dump(O/'checks/P9-A9.normal-current419.unchanged-original-science-checks.actual.json',{'allPassed':all(r['exitCode']==0 for r in results),'results':results,'positiveConfigPaths':configs,'atomicityConfigPaths':acfg,'originalProfileAndRecordLinesChanged':False,'newScienceVotes':0})
print([(r['name'],r['exitCode'],r['stderr'][:500]) for r in results]);assert all(r['exitCode']==0 for r in results)
