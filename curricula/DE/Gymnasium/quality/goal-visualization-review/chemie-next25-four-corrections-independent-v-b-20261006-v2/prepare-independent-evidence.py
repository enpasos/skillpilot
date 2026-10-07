#!/usr/bin/env python3
import datetime, hashlib, html, json, pathlib
ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-four-targeted-raster-corrections-author-20261006-v2'
RAW = AUTHOR/'seven-exact-assets-four-targeted-current-corrections.raw-v2-review-input.json'
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):
    p=p.resolve(); return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def write(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
raw=json.loads(RAW.read_text())
freeze=AUTHOR/'four-targeted-raster-corrections.author-v2.final.freeze.json'
assert sha(freeze)=='sha256:d98626c72ae462ba680483e5e3a1431353e950ddb8eb28a2ebf99df1b027c709'
canon=ROOT/raw['currentCanonical']['path']
assert binding(canon)==raw['currentCanonical']
goals={g['id']:g for g in json.loads(canon.read_text())['goals']}
new=[]; carry=[]
for r in raw['rows']:
    assert goals[r['goalId']]==r['wholeCurrentGoal'], r['goalId']
    assert binding(ROOT/r['selectedPNG']['path'])==r['selectedPNG']
    if r['goalId'].startswith(('965','747','492','5e2')):
        new.append({k:r[k] for k in ['goalId','wholeCurrentGoal','selectedPNG','nativeSize','actualTool','providerModel','selectedAttempt','actualPrompt']})
    else:
        receipts=[]
        for key,rowskey,decisionkey,hashkey in [('firstIndependentReviewA','rows','decision','assetHash'),('firstIndependentReviewB','records','independentV_BDecision','assetSha256')]:
            path=ROOT/r[key]['path']; assert binding(path)==r[key]
            # Only these three unchanged records are extracted; four historical correction verdicts are not provided to the reviewer.
            prior=[x for x in json.loads(path.read_text())[rowskey] if x['goalId']==r['goalId']]
            assert len(prior)==1
            rec=prior[0]
            assert rec[decisionkey]=='KEEP',(r['goalId'],key,rec[decisionkey])
            assert rec[hashkey].removeprefix('sha256:')==r['selectedPNG']['sha256'].removeprefix('sha256:')
            receipts.append({'role':key,'reviewFile':binding(path),'selectedPriorRecord':rec})
        carry.append({'goalId':r['goalId'],'selectedPNG':r['selectedPNG'],'wholeCurrentGoalExact':True,'historicalIndependentKEEP':receipts,'newContentReview':False})
write('whole-current-seven-and-three-exact-historical-carry.actual.json',{'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorFreeze':binding(freeze),'rawInput':binding(RAW),'currentCanonical':binding(canon),'wholeSevenGoalsExact':True,'newIndependentContentReviewInputs':new,'unchangedExactCarry':carry,'activeWrites':False,'newContentReviewCount':4,'historicalCarryCount':3})
(OUT/'responsive').mkdir()
for r in new:
    g=r['wholeCurrentGoal'];p=ROOT/r['selectedPNG']['path']
    # Production classes are reproduced without a build: border p-5; figure border/margins; block h-auto max-h-[28rem] w-full object-contain.
    doc='''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Independent actual GoalCard image CSS probe</title><style>
*{box-sizing:border-box;border-width:0;border-style:solid}html{font-size:16px}body{margin:0;font-family:Arial,sans-serif;background:#fff;color:#0f172a}.card{width:100%;border:1px solid #e2e8f0;border-radius:24px;padding:20px}.header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}.heading{min-width:0;flex:1;padding-right:32px}h2{margin:0;font-size:24px;font-weight:600;line-height:1.25}figure{margin:16px 0;overflow:hidden;border-radius:8px;border:1px solid #e2e8f0;background:white}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}.description{margin-top:8px;font-size:14px;line-height:1.625}</style></head><body><div class="card"><div class="header"><div class="heading"><h2>'''+html.escape(g['title'])+'''</h2></div></div><figure><img src="'''+p.as_uri()+'''" alt="Review candidate"></figure><div class="description">'''+html.escape(g['description'])+'''</div></div></body></html>'''
    (OUT/'responsive'/f"{g['id']}.html").write_text(doc)
print(json.dumps({'wholeSevenExact':True,'newReviewInputs':len(new),'historicalCarry':len(carry),'authorFreezeVerified':True}))
