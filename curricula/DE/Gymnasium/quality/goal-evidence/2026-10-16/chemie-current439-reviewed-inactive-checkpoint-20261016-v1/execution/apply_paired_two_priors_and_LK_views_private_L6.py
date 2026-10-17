"""Exact private integration of independently reviewed successors, no new votes."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, sys

R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/chemie-m7-resumed-20261016'
L=T/'chemie-shared640-recycling-native-author-capsule-L6-v1'
A=T/'equilibrium-polarity-two-prior-independent-a-v1'
AUTHOR=T/'equilibrium-polarity-two-prior-bounded-author-candidate-v1'
V=T/'BB-BE-eleven-crossstage-LK-acquisition-view-only-author-successor-v1'
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
OLD=E+'chemie-current439-paired-F03-private-L6-technical-20261016-v1/'
NEW=E+'chemie-current439-paired-two-priors-and-BB-BE-LK-private-L6-technical-20261016-v1/'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
encode=lambda j:(json.dumps(j,ensure_ascii=False,indent=2)+'\n').encode()
pin=lambda p:{'path':str(p.relative_to(R)),'sha256':sha(p)}
required=[
 (A/'OUTPUTS.two-prior-independent-a-P2-finite.sealed.selector.json','315d23aabc72bc5e61072ef798ab7929d7a21b2eb4f650c3cb5f56be8152f89b'),
 (T/'BB-BE-LK-eleven-prior-boundary-independent-b-v1/source-addendum/OUTPUTS.additive-source-policy-and-two-interfaces.independent-b.selector.json','c94f7925121367c3a6f88bb558e2871ae425d9a338d8628bc3c50373943107a1'),
 (T/'BB-BE-eleven-crossstage-LK-independent-a-v1/OUTPUTS.exact-BB-BE-two-view-independent-a.sealed.selector.json','c3589c384186ba4771df3d9ec741972ff8ff4af1e12250d3cc8c116060f8748a'),
 (AUTHOR/'OUTPUTS.two-whole-existing-goal-prior-interfaces.AUTHOR.selector.json','aea9ae6196aff6db15ca27b743a715139243fa4020525c2bd528907e874dc69f'),
 (V/'OUTPUTS.two-BB-BE-CrossStage-LK-views.eleven-existing-targets.AUTHOR.selector.json','de83ea94999c16d47c31f53d193e3d0ad7fa62cce44db8ecfa80a4458db1fe00'),
]
for p,h in required:
 assert sha(p)=='sha256:'+h,p
 for x in read(p).get('files',[]): assert sha(R/x['path'])==x['sha256']
normal=sha(R/C);assert normal=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
before=read(L/C);assert sha(L/C)=='sha256:d389cd002b082874845802d4bd9272890050864fe52f5d838388afe9ae581a3d'
can=copy.deepcopy(before);by={g['id']:g for g in can['goals']}
ops=read(AUTHOR/'CAS.two-whole-goals.requires-only.AUTHOR.inactive.json')['operations']
ids={o['goalId'] for o in ops};assert len(ids)==2
for op in ops:
 assert by[op['goalId']]==op['before'];assert op['changedFields']==['requires']
 by[op['goalId']]=op['after']
can['goals']=[by[g['id']] for g in before['goals']]
assert len(can['goals'])==641 and all(by[g['id']]==g for g in before['goals'] if g['id'] not in ids)
sem=read(L/S);sb={r['goalId']:r for r in sem['decisions']}
for op in read(AUTHOR/'CAS.two-whole-SEM-decisions.source-binding-only.AUTHOR.inactive.json')['operations']:
 assert sb[op['goalId']]==op['before'];sb[op['goalId']]=op['after']
sem['decisions']=[sb[r['goalId']] for r in sem['decisions']]
assert sem['counts']['total']==641 and sem['counts']['curricularAtomic']==439
writes={C:encode(can),S:encode(sem)}
vops=read(V/'CAS.two-whole-BB-BE-CrossStage-LK-views.eleven-existing-acquisition-targets.AUTHOR.inactive.json')['operations']
assert len(vops)==2
for op in vops:
 assert sha(L/op['targetPath'])==op['expectedCurrentFileSha256']
 assert read(L/op['targetPath'])==op['before']
 assert sha(R/op['afterFile']['path'])==op['afterFile']['sha256']
 assert read(R/op['afterFile']['path'])==op['after']
 writes[op['targetPath']]=(R/op['afterFile']['path']).read_bytes()
selected=(A/'P2.two-own-current-contexts.combined.review.jsonl').read_bytes().splitlines(keepends=True)
assert len(selected)==2 and {json.loads(x)['goalId'] for x in selected}==ids
newrows={json.loads(x)['goalId']:x for x in selected}
for line in selected:
 r=json.loads(line);assert (r['evidenceLevel'],r['maximumClaimScope'],r['status'],r['reviewAuthority'])==('E1','G1','needs_human_review','ai_candidate')
for name in ['equilibrium','polarity']:
 cfg=read(A/f'P1.{name}.ROOT-FINAL-after-actual-CAS-only.config.json')
 for field in ['reviewPath','reviewCriteriaPath']:
  src=R/cfg[field];dest=NEW+src.name;writes[dest]=src.read_bytes();cfg[field]=dest
 writes[NEW+f'P1.{name}.same-own-independent-identity.normal-address.config.json']=encode(cfg)
central=read(L/(OLD+'central.current439.paired-F03.D-pending.private.config.json'))
subject=next(s for s in central['subjects'] if s['subject']=='chemie')
configs=[];owners=set();residuals=[]
for index,p in enumerate(subject['positiveEvidenceConfigPaths']):
 cfg=read(L/p);scope=cfg['scope']['goalIds'];overlap=set(scope)&ids
 if not overlap:configs.append(p);continue
 assert not owners&overlap;owners|=overlap
 remaining=[g for g in scope if g not in ids]
 if not remaining:continue
 rows=(L/cfg['reviewPath']).read_bytes().splitlines(keepends=True)
 keep=[line for line in rows if json.loads(line)['goalId'] in remaining]
 assert len(keep)==len(remaining) and {json.loads(x)['goalId'] for x in keep}==set(remaining)
 rowpath=NEW+f'P-retained-{index:03d}.exact-whole-original-lines.jsonl'
 writes[rowpath]=b''.join(keep);cfg['reviewPath']=rowpath;cfg['scope']['goalIds']=remaining
 configpath=NEW+f'P-retained-{index:03d}.same-original-identity.scope-only.config.json'
 writes[configpath]=encode(cfg);configs.append(configpath);residuals.append({'original':p,'successor':configpath,'retainedWholeRows':len(keep)})
assert owners==ids
configs.extend(NEW+f'P1.{name}.same-own-independent-identity.normal-address.config.json' for name in ['equilibrium','polarity'])
subject['positiveEvidenceConfigPaths']=configs
writes[NEW+'central.current439.paired-two-priors-and-LK-targets.D-pending.private.config.json']=encode(central)
oldlines=(L/(OLD+'P439.exact438-whole-lines-plus-own-F03.for-native-model.jsonl')).read_bytes().splitlines(keepends=True)
assert len(oldlines)==439
newlines=[newrows.get(json.loads(line)['goalId'],line) for line in oldlines]
assert sum(a==b for a,b in zip(oldlines,newlines))==437
pv=NEW+'P439.exact437-retained-whole-lines-two-own-current-contexts.for-native-model.jsonl'
writes[pv]=b''.join(newlines)
base=read(L/(OLD+'base.full439.final-native-inputs.config.json'))
base['evidenceReviewPaths']=[pv];base['outputPath']=NEW+'book-model.full439.current-native-base.json'
writes[NEW+'base.full439.current-native-inputs.config.json']=encode(base)
for p,data in writes.items():
 if p.endswith('.json'):json.loads(data)
 elif p.endswith('.jsonl'):
  for line in data.splitlines():json.loads(line)
receipt={'role':'Actual independently paired two-prior and22 LK-target private integration; no third scientific vote',
 'createdAtUTC':datetime.now(timezone.utc).isoformat(),'inputCanonical':sha(L/C),'independentAndAuthorSelectors':[pin(p) for p,_ in required],
 'wholeGoals':641,'ordinary':439,'existingWholeBodiesRetained':639,'changedRequiresOnly':sorted(ids),'wholeLKViews':2,'existingTargetsAdded':22,
 'wholeP437RowsRetained':True,'ownP2':'new informed current-context E1G1 candidates; actual whole designs unchanged',
 'retainedResidualOwnerConfigs':residuals,'unresolvedGKAndOtherFiniteRoleGapsRemainOpen':True,
 'sourceBindingOrNativeDCompletionFromHashes':False,'newStrictClosuresClaimed':0,'normalWrites':0,'HumanApproval':False,'M7Claim':False}
if '--apply' not in sys.argv:
 print(json.dumps({'mode':'DRY RUN','files':len(writes),'allWholeBeforeAndSciencePins':'PASS','Pconfigs':len(configs)}));sys.exit()
def own_dir(p):
 if p==L:assert p.is_dir() and not p.is_symlink();return
 assert p.is_relative_to(L);own_dir(p.parent)
 if p.is_symlink():
  children=list(p.resolve(strict=True).iterdir());p.unlink();p.mkdir()
  for child in children:(p/child.name).symlink_to(child.resolve(),target_is_directory=child.is_dir())
 else:p.mkdir(exist_ok=True)
 assert p.resolve().is_relative_to(L.resolve())
out=T/'EXECUTION.actual-paired-two-priors-and-LK-views-private-L6.receipt.json';assert not out.exists()
for p in writes:own_dir((L/p).parent)
assert sha(L/C)==receipt['inputCanonical']
for p,data in writes.items():
 dest=L/p;temp=dest.with_name(dest.name+'.two-priors.tmp')
 with temp.open('xb') as f:f.write(data)
 os.replace(temp,dest)
assert sha(R/C)==normal
receipt['afterCanonical']=sha(L/C);receipt['afterSEM']=sha(L/S)
receipt['files']=[{'path':p,'sha256':sha(L/p)} for p in writes]
with out.open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'mode':'APPLIED PRIVATE ONLY','files':len(writes),'canonical':receipt['afterCanonical'],'SEM':receipt['afterSEM'],'Pconfigs':len(configs),'receipt':str(out.relative_to(R))}))
