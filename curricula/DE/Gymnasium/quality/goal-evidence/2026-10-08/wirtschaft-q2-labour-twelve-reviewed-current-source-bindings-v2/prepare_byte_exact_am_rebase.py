# Apache-2.0. Exact reviewed-own-lines rebase, no new substantive review.
from pathlib import Path
import json,hashlib,datetime,shutil,subprocess
root=Path('/home/enpasos/projects/skillpilot');iso=Path('/tmp/skillpilot-wirtschaft-q2-labour-twelve-native-qnj7b9dg')
b=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');own=b/'wirtschaft-q2-labour-twelve-reviewed-current-source-bindings-v2';prior=b/'wirtschaft-q2-labour-twelve-reviewed-current-source-bindings-v1';base=b/'wirtschaft-q2-labour-twelve-native-preparation-technical-20261008-v1'
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert read(root/own/'current113-native-wholepage-parity.actual.json')['allWholePagesExactlyUnchanged']
registry=read(root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');econ=next(r for r in registry['subjects']if r['subject']=='wirtschaftswissenschaften');assert 'wirtschaft-q2-monetary-social-seventeen-reviewed-translation-bindings-v3/'in econ['semanticAtomicityConfigPath']
ids=set(read(root/base/'native-d-q2-labour-twelve.final.batch.config.json')['goalIds']);assert len(ids)==12
frozen=read(root/base/'native-d-q2-labour-twelve-final.prepared-freeze.actual.json')['byteExactReturnedNativeFiles']
for f in frozen:assert sha(root/f['path'])==sha(iso/f['path'])==f['sha256']
(iso/own).mkdir(exist_ok=False);runs=[];retention={};configs={}
for kind,key in [('atomicity','semanticAtomicityConfigPath'),('memory','memoryReviewConfigPath')]:
 cfg=read(root/econ[key]);configs[kind]=cfg;oldbytes=(root/cfg['reviewPath']).read_bytes();lines=oldbytes.splitlines(keepends=True);old={json.loads(l)['goalId']:l for l in lines};ownold={json.loads(l)['goalId']:l for l in(root/prior/(kind+'.review.jsonl')).read_bytes().splitlines(keepends=True)};merged=b''.join(ownold[json.loads(l)['goalId']]if json.loads(l)['goalId']in ids else l for l in lines);assert len(old)==303
 output=own/(kind+'.review.jsonl');(iso/output).write_bytes(merged);nextcfg=dict(cfg,reviewPath=str(output))
 if kind=='memory':
  cards=own/'memory.cards.review.jsonl';data=(root/cfg['cardReviewPath']).read_bytes();assert len(data.splitlines())==51 and data==(root/prior/'memory.cards.review.jsonl').read_bytes();(iso/cards).write_bytes(data);nextcfg.update(cardReviewPath=str(cards),reportPath=str(own/'memory.native-report.md'))
 write(iso/own/(kind+'.config.json'),nextcfg)
 mergedlines=merged.splitlines(keepends=True);assert all(l==ownold[json.loads(l)['goalId']]for l in mergedlines if json.loads(l)['goalId']in ids);assert all(l==old[json.loads(l)['goalId']]for l in mergedlines if json.loads(l)['goalId']not in ids)
 retention[kind]={'previousActiveConfigPath':econ[key],'previousActiveRecordsSha256':'sha256:'+hashlib.sha256(oldbytes).hexdigest(),'selectedPriorReviewedSuccessorPath':str(prior/(kind+'.review.jsonl')),'selectedOwnRecordLinesByteExact':12,'otherActiveRecordLinesByteExact':291,'candidateRecordsSha256':'sha256:'+hashlib.sha256(merged).hexdigest()}
source=read(iso/econ['landscapePath']);decks={Path('app/public')/v.lstrip('/')for g in source['goals']if g.get('nodeKind')=='memory'for k in ['vocabularySource','vocabularySourceEn']if(v:=g.get('extendedData',{}).get(k))};views={Path(r['viewPath'])for r in configs['memory']['visibilityScopes']};assert len(decks)==5 and len(views)==2;inputs=[]
for path in sorted(decks|views):
 dest=iso/path;dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==(root/path).read_bytes()
 else:shutil.copyfile(root/path,dest)
 inputs.append({'path':str(path),'sha256':sha(dest),'role':'actual_deck'if path in decks else'configured_view'})
for kind,script in [('atomicity','app/scripts/semanticAtomicityReview.ts'),('memory','app/scripts/memoryCardReview.ts')]:
 command=['node','app/node_modules/tsx/dist/cli.mjs',script,'--config='+str(own/(kind+'.config.json')),'--mode=check'];r=subprocess.run(command,cwd=iso,capture_output=True,text=True)
 for ext,t in [('stdout',r.stdout),('stderr',r.stderr)]:
  with(iso/own/(kind+'.native-check.'+ext+'.txt')).open('x')as f:f.write(t)
 runs.append({'command':command,'cwd':str(iso),'actualExitCode':r.returncode});assert r.returncode==0,r.stdout+r.stderr
for f in frozen:assert sha(root/f['path'])==sha(iso/f['path'])==f['sha256']
write(iso/own/'native-full-successor-check.actual.json',{'schemaVersion':1,'role':'technical_exact_reviewed_own_record_rebase','actualCheckedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'currentStrictBaseline':113,'ordinaryDecisions':303,'selectedOwnReviewedRecordsByteExactPerGate':12,'otherActiveRecordsByteExactPerGate':291,'cardsByteExact':51,'visibilityChecks':98,'gateRecordRetention':retention,'actualInputs':inputs,'commands':runs,'frozenNativeFilesExactlyPreserved':28,'wholeCurrent113ContextParityReceipt':str(own/'current113-native-wholepage-parity.actual.json'),'previousOwnIndependentReviewBindingReceipt':str(prior/'native-full-successor-check.actual.json'),'independentSubstantiveReviewClaim':False,'fullAMNewReviewClaim':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0})
for p in(iso/own).rglob('*'):
 if p.is_file():
  dest=root/p.relative_to(iso);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==p.read_bytes()
  else:shutil.copyfile(p,dest)
print('Labour12 AM-v2 Root113: native303/51/98PASS; own12byteexact, other291activebyteexact, cards51exact, all28freezeunchanged.')
