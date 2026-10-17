from pathlib import Path
import json,hashlib,shutil,os,datetime
E=Path('/mnt/e/skillpilot-chemie-L7-20261017');R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;F=O/'capsule';I=E/'paired-package03-actual-current650-technical-v1';S=I/'capsule';A=E/'eleven-colour-goals-retained-target-scope-author-successor-v2'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def canon(z):return hashlib.sha256(json.dumps(z,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def dump(p,z):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(z,ensure_ascii=False,indent=2)+'\n')
def owned(p,data):
 p=Path(p);assert p.is_relative_to(F);assert all(not q.is_symlink() for q in p.parents if q.is_relative_to(F));t=p.with_name(p.name+'.combined-owned');assert not t.exists();t.write_bytes(data);t.replace(p)
m=read(I/'ASSEMBLY.exact-guards-and-inputs.json');b=read(I/'BINDING.actual-one-P-and-two-SEM-source-FPs.json');assert sha(S/m['canonicalRelative'])==b['canonical']['sha256']
proofs={A/'REVIEW-INPUT.clean-eleven-colours-plus-one188-DE-task-successor.v2.json':'73cb125f331b2f4be319d04630883041e0956137a658997be980fd0e859e6048',A/'CAS.188-one-DE-task-field.whole-P.inactive.json':'053149881813b0f3c118eecab7cf5c53494cd6a485317178645e5849129a3778',E/'eleven-colour-goals-independent-a-followup-v2/FOLLOWUP.independent-a.one188-DE-field.v2.json':'831c77e40ce5ac66bc54963b5bf7b9fa42c984d0c751114659d7ecfba8e16a72',E/'eleven-colour-goals-independent-a-followup-v2/FOLLOWUP.seal.json':'d7bc36095e963edfe68041d4529efd84435e5abb6484302c31bf2d24881627eb',E/'eleven-colour-goals-independent-b-v2/FIRST.review.json':'2a9007f702d0c33ee89095dcba9d0449ee4e58d72d9823116a348ed43cd9d57d',E/'eleven-colour-goals-independent-b-v2/FIRST.seal.sha256.json':'f27aeaf6af88ec4ab0cee8be3da79b1528be68f9bd8dbd95e1a7496e14ac29d7'}
# Seal filename is discovered only by exact bytes when the reviewer uses a distinct descriptive name.
resolved={}
for p,h in proofs.items():
 if not p.exists():
  matches=[q for q in p.parent.iterdir() if q.is_file() and sha(q)==h];assert len(matches)==1,(p,h);p=matches[0]
 assert sha(p)==h,(p,sha(p),h);resolved[p]=h
assert read(next(p for p in resolved if p.name=='FIRST.review.json'))['overallBoundedScienceDecision']=='KEEP';assert read(next(p for p in resolved if p.name.startswith('FOLLOWUP.independent-a')))['decision']=='KEEP'
req=read(A/'CAS.188-one-prerequisite-only.whole-goal.inactive.json');scope=read(A/'CAS.eleven-whole-goals-explicit-own-scope.after-188-science.inactive.json');view=read(A/'CAS.one-whole-BW-LK-view-two-labels-only.POST20.inactive.json');pcas=read(A/'CAS.188-one-DE-task-field.whole-P.inactive.json')
land=read(S/m['canonicalRelative']);gm={g['id']:g for g in land['goals']};sequential=[]
for stage,changes in [('04-prerequisite-first',req['wholeGoalChanges']),('04-own-scope-second',scope['wholeGoalChanges'])]:
 for ch in changes:
  assert gm[ch['goalId']]==ch['before'],(stage,ch['goalId']);assert canon(ch['before'])==ch['beforeDigest'].removeprefix('sha256:') and canon(ch['after'])==ch['afterDigest'].removeprefix('sha256:');gm[ch['goalId']]=ch['after'];sequential.append({'stage':stage,'goalId':ch['goalId'],'beforeDigest':ch['beforeDigest'],'afterDigest':ch['afterDigest']})
land['goals']=[gm[g['id']] for g in land['goals']];base=read(m['baseCanonical']['path']);baseBy={g['id']:g for g in base['goals']};delta=[g['id'] for g in land['goals'] if g!=baseBy[g['id']]]
ids03={ch['goalId'] for ch in read(Path(m['inputs']['CAS']['path']))['canonicalWholeGoalChanges']};ids04={ch['goalId'] for ch in scope['wholeGoalChanges']};assert not ids03&ids04 and len(ids03)==2 and len(ids04)==11 and set(delta)==ids03|ids04
views=read(m['wholeViewCollection']['path']);vm={v['viewId']:v for v in views}
for ch in view['wholeViewChanges']:
 assert vm[ch['viewId']]==ch['before'];assert canon(ch['before'])==ch['beforeDigest'].removeprefix('sha256:') and canon(ch['after'])==ch['afterDigest'].removeprefix('sha256:');vm[ch['viewId']]=ch['after']
views=[vm[v['viewId']] for v in views]
oldP=[json.loads(l) for l in Path(m['inputs']['oldP439']['path']).read_text().splitlines() if l.strip()];assert len(oldP)==439;assert next(r for r in oldP if r['goalId']==pcas['goalId'])['profile']==pcas['before'];assert canon(pcas['before'])==pcas['beforeDigest'] and canon(pcas['after'])==pcas['afterDigest']
sourceGuards=m['sourceGuard']+[pin(S/m['canonicalRelative']),pin(Path(b['P439']['path'])),pin(Path(b['SEM650']['path'])),pin(I/'EXECUTION.single-actual-stock-compiler.json'),pin(I/'STOCK.actual650-C20-plus-paired-package03-applicability.json')]
for v in m['currentViewFiles']:sourceGuards.append(pin(S/v['relative']))
dump(O/'GUARD.protected-before.json',{'protected':sourceGuards,'additional04Proofs':[pin(p) for p in resolved],'sourceCopyMethod':'Immutable inherited files may share hardlinks; all edits use atomic replacement of owned new files. No source or earlier capsule inode is written.'})
print('All sequential04 whole guards and disjoint13-goal deltas passed; cloning private inherited inputs.',flush=True)
shutil.copytree(S,F,symlinks=True,copy_function=os.link)
owned(F/m['canonicalRelative'],(json.dumps(land,ensure_ascii=False,indent=2)+'\n').encode())
for ch in view['wholeViewChanges']:
 path=next(x['relative'] for x in m['currentViewFiles'] if x['viewId']==ch['viewId']);assert read(F/path)==ch['before'];owned(F/path,(json.dumps(ch['after'],ensure_ascii=False,indent=2)+'\n').encode())
candidate=O/'candidate.canonical650.C20-plus-paired-package03-and04.private.json';dump(candidate,land);vout=O/'candidate.whole39views.C20-plus-two-BW-labels.private.json';dump(vout,views)
inputs=dict(m['inputs']);inputs['clean03']=inputs['clean'];inputs['CAS03']=inputs['CAS'];inputs['B03']=inputs['B'];inputs['rootInformed03']=inputs['rootInformed']
pairs=[('clean04',A/'REVIEW-INPUT.clean-eleven-colours-plus-one188-DE-task-successor.v2.json'),('CAS188requires',A/'CAS.188-one-prerequisite-only.whole-goal.inactive.json'),('CAS11scope',A/'CAS.eleven-whole-goals-explicit-own-scope.after-188-science.inactive.json'),('CASBWlabels',A/'CAS.one-whole-BW-LK-view-two-labels-only.POST20.inactive.json'),('CAS188P',A/'CAS.188-one-DE-task-field.whole-P.inactive.json'),('A04',next(p for p in resolved if p.name.startswith('FOLLOWUP.independent-a'))),('A04seal',next(p for p in resolved if sha(p)=='d7bc36095e963edfe68041d4529efd84435e5abb6484302c31bf2d24881627eb')),('B04',next(p for p in resolved if p.name=='FIRST.review.json')),('B04seal',next(p for p in resolved if sha(p)=='f27aeaf6af88ec4ab0cee8be3da79b1528be68f9bd8dbd95e1a7496e14ac29d7'))]
idir=F/'candidate-inputs/PACKAGE04';idir.mkdir()
for key,p in pairs:
 q=idir/(key+p.suffix);assert not q.exists();shutil.copyfile(p,q);inputs[key]={**pin(p),'copyRelative':str(q.relative_to(F))}
newMeta={**m,'physicalRoot':str(F),'outputRoot':str(O),'newCanonical':pin(candidate),'wholeViewCollection':pin(vout),'inputs':inputs,'outputsRelative':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired-package03-and04-current650-technical-v1','sourceGuard':sourceGuards,'acceptedCurrentP439Base':m['inputs']['oldP439'],'goalDeltaIds':delta,'package03And04GoalIdsDisjoint':True,'sequential04WholeGuards':sequential,'whole39ViewChanges':view['wholeViewChanges'],'intermediate03CompilerAlreadyOccurredBeforeBundling':{'execution':pin(I/'EXECUTION.single-actual-stock-compiler.json'),'report':pin(I/'STOCK.actual650-C20-plus-paired-package03-applicability.json'),'completedFrontendMeasurementOrFinalAcceptance':False,'reason':'Root combination instruction arrived after the03 compiler had already started; this actual invocation is preserved honestly as intermediate history, not claimed absent.'},'sourceCopyMethod':'Hardlinks for immutable inherited files, atomic replacement only for owned canonical/view/SEM/new outputs','technicalSerializerNewIndependentVotes':0,'newNativeRunIds':[],'M7':False,'HumanApproval':False}
dump(O/'ASSEMBLY.exact-guards-and-inputs.json',newMeta)
for p in sourceGuards:assert sha(p['path'])==p['sha256'],p['path']
(O/'cache').mkdir()
print(json.dumps({'outputRoot':str(O),'canonical':pin(candidate),'views':pin(vout),'goalDeltaCount':len(delta),'disjoint':True,'04WholeSequentialGuardCount':len(sequential),'PBefore188MatchesCurrent':True,'03InterimInvocationPreserved':True}),flush=True)
