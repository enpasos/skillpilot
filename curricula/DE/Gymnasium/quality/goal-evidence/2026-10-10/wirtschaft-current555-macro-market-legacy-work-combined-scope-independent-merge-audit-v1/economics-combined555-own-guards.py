from pathlib import Path
import json,hashlib
R=Path('/home/enpasos/projects/skillpilot');D=Path('/tmp/economics-current555-twentythree-qualified477-root-candidate-path.txt').read_text().strip();H=Path(D)/'actual-twentythree-qualified477-two-legacy-remedies-fieldwise-current555.root-candidate-handoff.json'
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current555-macro-market-legacy-work-combined-scope-independent-merge-audit-v1';O.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
d=json.loads(H.read_text());assert sha(H)=='505981d080383f1f2818791e9d86455ac98dd94a5e72dc0c9a6039cddb6fd9ec';guard={str(H.relative_to(R)):sha(H)}
def walk(x):
 if isinstance(x,dict):
  if 'path' in x and 'sha256' in x:
   p=R/x['path']
   if p.is_file():assert sha(p)==x['sha256'],str(p);guard[x['path']]=sha(p)
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(d)
B=json.loads((R/d['canonicalBefore']['path']).read_text());A=json.loads((R/d['canonicalCandidate']['path']).read_text());bg={g['id']:g for g in B['goals']};ag={g['id']:g for g in A['goals']};assert len(bg)==532 and len(ag)==555;assert {k:v for k,v in A.items() if k!='goals'}=={k:v for k,v in B.items() if k!='goals'}
new=set(ag)-set(bg);assert new==set(d['newQualifiedPracticeGoalIds']); changes=[]
for i,b in bg.items():
 a=ag[i]
 if a!=b:changes.append({'goalId':i,'changedFields':[k for k in set(a)|set(b) if a.get(k)!=b.get(k)]})
assert len(changes)==6
for x in d['changedExistingGoalFields']:
 i=x['goalId'];assert bg[i]==x['wholeBefore'];assert ag[i]==x['wholeAfter'];assert set(changes[[c['goalId'] for c in changes].index(i)]['changedFields'])==set(x['changedFields'])
for row in d['wholePackageLineages']:
 sf=json.loads((R/row['wholeScopeGuards']['path']).read_text());walk(sf);foreign=json.loads((R/sf['canonicalCandidate']['path']).read_text());fg={g['id']:g for g in foreign['goals']}
 for i in row['newPracticeGoalIds']:assert ag[i]==fg[i],i
 if row['package']=='Legacy2':
  for i in row['changedOldGoalIds']:assert ag[i]==fg[i]
 # actually read each external scientific and scope final record
 for key in ['wholeForeignScopeReceipt','wholeForeignScienceReceipt','wholeAuthorHandoff']:
  rec=json.loads((R/row[key]['path']).read_text());walk(rec)
sem=json.loads((R/d['oldSemanticLedger']['path']).read_text());ordinary={r['goalId'] for r in sem['decisions'] if r['semanticKind']=='curricularAtomic'};memory={r['goalId'] for r in sem['decisions'] if r['semanticKind']=='memorization'}
assert len(ordinary)==336;assert all(ag[i]==bg[i] for i in ordinary)
# Changed views: append only whole root references, unique source lineage; viewId only other allowed field.
refcount=0;changed=0;rows=[]
for r in d['views']:
 b=json.loads((R/r['before']['path']).read_text());a=json.loads((R/r['candidate']['path']).read_text())
 if a==b:continue
 changed+=1; assert len(a['rootNodes'])==len(b['rootNodes'])==1
 ar=a['rootNodes'][0];br=b['rootNodes'][0];assert {k:v for k,v in ar.items() if k!='children'}=={k:v for k,v in br.items() if k!='children'}
 assert ar['children'][:len(br['children'])]==br['children'],r['activePath']
 added=ar['children'][len(br['children']):];assert added==r['wholeAddedReferences'];assert added==[x for ln in r['authorLineage'] for x in ln['appendedWholeReferences']]
 assert {k:v for k,v in a.items() if k not in ['rootNodes','viewId']}=={k:v for k,v in b.items() if k not in ['rootNodes','viewId']}
 refcount+=len(added); rows.append({'path':r['activePath'],'added':added,'beforeSHA':sha(R/r['before']['path']),'afterSHA':sha(R/r['candidate']['path'])})
assert refcount==477 and changed==34
alljsonl=[]
for r in d['whole43PositiveConfigAndOriginalReviewBindings']:
 p=R/r['wholeReviewJSONL']['path'];text=p.read_text();assert text.endswith('\n');alljsonl.extend(json.loads(l) for l in text.splitlines() if l)
assert len(alljsonl)==336 and len({x['goalId'] for x in alljsonl})==336;cases=sum(len(x['profile']['applicationCaseBriefs']) for x in alljsonl);assert cases==685
save('actual-independent-whole555-fieldwise-and-477-reference-input-guards.json',{'candidateSHA':sha(R/d['canonicalCandidate']['path']),'oldCount':532,'newCount':555,'current336GoalsExact':True,'originalP336Cases':cases,'wholeOther526OldGoalsExact':True,'sixOldWholeFieldDeltas':changes,'new23ForeignQualifiedWholeGoalsExact':True,'changed34AppendOnlyViews':rows,'referenceCount':refcount,'guardedWholeInputs':[{'path':p,'sha256':h} for p,h in sorted(guard.items())]})
Path('/tmp/economics-combined555-own-review-dir.txt').write_text(str(O)+'\n');print('whole guards PASS',len(guard),'new23','old526','views34','refs477','P336/P685')
