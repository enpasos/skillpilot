# SPDX-License-Identifier: Apache-2.0
"""Run unmodified checks in a lean capsule; archive actual exits/output."""
import collections,concurrent.futures,datetime,hashlib,json,pathlib,subprocess
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6';CAP=R/'tmp/chemie-current407-root-v3-normal-capsule'
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(R))
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
rows=[]
for p in [B/'positive/P37.current-whole-retained-and-targeted.pending.review.jsonl',B/'positive/P2.current-M1-and-3fb7-retained.exact.jsonl']:
 rows.extend((json.loads(s),s) for s in p.read_text().splitlines() if s.strip())
deep=read(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');subject=next(x for x in deep['subjects'] if x['subject']=='chemie')
configs=[read(R/p) for p in subject['positiveEvidenceConfigPaths']]
configs.append(read(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-P9-targeted-remediation-author-20261012-v3/positive/P9.author-run-bound.inactive.config.json'))
criteria={digest(R/c['reviewCriteriaPath']):c['reviewCriteriaPath'] for c in configs}
criteria['sha256:14b9fe5db2b527baad6e5e488b2e2909f2eeaaeb8d9106a7c072ec6c2d4f12be']='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v1/review/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'
runs={}
for c in configs:
 for p in c.get('reviewRunManifestPaths',[]):runs[read(R/p)['runId']]=p
groups=collections.defaultdict(list)
for record,line in rows:groups[record['reviewId'],record['reviewCriteriaFingerprint']].append((record,line))
commands=[]
for ix,((review,crit),pairs) in enumerate(sorted(groups.items()),1):
 rp=B/f'positive/normal-group-{ix:02d}.exact-current-lines.jsonl';rp.write_text(''.join(line+'\n' for _,line in pairs))
 cfg={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':review,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':pairs[0][0]['landscapeId'],'landscapePath':rel(B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json'),'semanticKindLedgerPath':rel(B/'candidate/semantic407.current-normal-input.json'),'reviewCriteriaPath':criteria[crit],'reviewPath':rel(rp),'reviewRunManifestPaths':sorted({runs[r] for record,_ in pairs for r in record['reviewRunIds']}),'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Exact mixed-current immutable line subgroup; informed technical preparation only','goalIds':[record['goalId'] for record,_ in pairs]}}
 cp=B/f'configs/P-current-group-{ix:02d}.inactive.config.json';write(cp,cfg)
 commands.append((f'P{ix:02d}',[str(R/'app/node_modules/.bin/tsx'),str(CAP/'app/scripts/positiveGoalEvidenceReview.ts'),'--mode=check','--config='+rel(cp)]))
commands.append(('M407',[str(R/'app/node_modules/.bin/tsx'),str(CAP/'app/scripts/memoryCardReview.ts'),'--mode=check','--config='+rel(B/'memory/M407.current-normal.inactive.config.json')]))
commands.append(('SOURCE48',[str(R/'app/node_modules/.bin/tsx'),str(CAP/'app/scripts/buildGoalBookSourceAtlasInputs.ts'),'--config','app/scripts/config/goal-books/inactive/chemie-current407-root-v3-combined-source6/atlas.inputs.json','--check']))
def run(item):
 name,argv=item;stamp=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(argv,cwd=R,text=True,capture_output=True)
 out={'lane':name,'argv':argv,'startedAtUTC':stamp,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'unmodifiedNormalCode':True,'newScientificVotes':0}
 write(B/f'checks/normal-{name}.actual.json',out);return {'lane':name,'exitCode':p.returncode,'recordPath':rel(B/f'checks/normal-{name}.actual.json'),'failure':p.stderr[-1800:] if p.returncode else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(run,commands))
write(B/'checks/FINAL.normal-current-check-exits.actual.json',{'checks':results,'PRecordCount':len(rows),'P37PlusCurrentM1And3fb':True,'newScientificVotes':0})
print(json.dumps(results,ensure_ascii=False))
assert all(x['exitCode']==0 for x in results),'A normal required check failed; exact receipt retained.'
