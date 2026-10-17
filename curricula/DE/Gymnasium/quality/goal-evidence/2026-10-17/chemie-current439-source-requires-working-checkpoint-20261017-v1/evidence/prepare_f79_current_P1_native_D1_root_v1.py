from pathlib import Path
import hashlib,json,os,subprocess,datetime,time,copy
E=Path('/mnt/e/skillpilot-chemie-L7-20261017');O=E/'current439-f79-explicit-concentration-ratio-author-root-v1';CAP=O/'capsule'
p=O/'PREPARATION.author-f79-correction.json';prep=json.loads(p.read_text());Q=Path(prep['relative']);OUT=CAP/Q
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def w(p,d):
 with p.open('x') as f:json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
gid='f79f15c0-e848-5e17-9eb5-26753d35c93b'
original=Path(prep['beforeP439']['path']);raw=original.read_bytes();assert pin(original)==prep['beforeP439']
new_line=(OUT/'P1.current-f79.author-candidate.jsonl').read_bytes();nr=json.loads(new_line)
assert nr['goalId']==gid and nr['status']=='needs_human_review' and nr['reviewAuthority']=='ai_candidate'
old_lines=raw.splitlines(keepends=True);matches=[i for i,l in enumerate(old_lines) if json.loads(l)['goalId']==gid];assert len(matches)==1
new_lines=old_lines[:];new_lines[matches[0]]=new_line
agg=OUT/'P439.only-f79-explicit-concentration-ratio.author-candidate.aggregate.jsonl'
with agg.open('xb') as f:f.write(b''.join(new_lines))
assert sum(a!=b for a,b in zip(old_lines,agg.read_bytes().splitlines(keepends=True)))==1
N=E/'current439-b008-terminal12-native-preparation-technical-c-v1/capsule'
NQ=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-b008-terminal12-native-preparation-technical-c-v1')
base=json.loads((N/NQ/'base.full439.current12.config.json').read_text());base['bookId']='chemie-current439-f79-ratio-full439-author-input-20261017-v1';base['title']='Chemie – aktueller Inhaltsstand für eine gezielte Verhältnis-Korrektur';base['evidenceReviewPaths']=[str(Q/agg.name)];base['outputPath']=str(Q/'book-model.full439.author-input.json')
w(OUT/'base.full439.author-input.config.json',base)
cfg=json.loads((N/NQ/'current12.batch.config.json').read_text());cfg.update({'batchId':'chemie-current439-f79-explicit-concentration-ratio-native1-20261017-v1','bookId':'chemie-current439-f79-explicit-concentration-ratio-native1-20261017-v1','title':'Chemie – eine aktuelle Analysebeschreibung im korrigierten Nachweiskontext','baseGoalBookConfigPath':str(Q/'base.full439.author-input.config.json'),'goalIds':[gid],'outputDirectory':str(Q/'native1')})
w(OUT/'native1.batch.config.json',cfg)
env=dict(os.environ,NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main',TSX_DISABLE_CACHE='1',TMPDIR='/dev/shm',NO_COLOR='1')
steps=[]
for mode in ['prepare','check']:
 argv=['node','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(CAP/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',str(Q/'native1.batch.config.json')]
 t=time.monotonic();r=subprocess.run(argv,cwd=CAP,env=env,text=True,capture_output=True)
 for name,s in [('stdout',r.stdout),('stderr',r.stderr)]:
  with (O/f'STOCK.native1.{mode}.{name}.txt').open('x') as f:f.write(s)
 step={'argv':argv,'cwd':str(CAP),'mode':mode,'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-t,'stdout':r.stdout,'stderr':r.stderr};w(O/f'STOCK.native1.{mode}.execution.json',step);steps.append(step)
 print(json.dumps({'mode':mode,'exitCode':r.returncode,'stdout':r.stdout[-2500:],'stderr':r.stderr[-2500:]}),flush=True)
 assert r.returncode==0
for pp in ['canonical','semanticKinds','beforeP439','beforeScientificMaterial']:
 assert pin(Path(prep[pp]['path']))==prep[pp],pp
bind={'role':'One new actual P1 author correction and new targeted D1 native context; no independent decisions','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentGoalId':gid,'correctedProfile':pin(OUT/'P1.current-f79.author-candidate.jsonl'),'newP439':pin(agg),'beforeP439':prep['beforeP439'],'other438WholeRecordLinesByteExact':True,'wholeCorrectedScience':pin(OUT/'AUTHOR.current-f79-whole-profile-and-two-cases.explicit-B-over-A.json'),'explicitChanges':pin(OUT/'AUTHOR.exact-scientific-delta.twelve-fields.json'),'newNativeRoot':str(OUT/'native1'),'newNativeConfig':pin(OUT/'native1.batch.config.json'),'steps':steps,'sourceGuardsUnchanged':True,'MainUnchanged':True,'KUnchanged':True,'humanApproval':False,'independentAcceptancePending':True}
w(O/'RECEIPT.actual-one-profile-and-one-native-context-preparation.json',bind)
print(json.dumps({'receipt':str(O/'RECEIPT.actual-one-profile-and-one-native-context-preparation.json'),'newP439':pin(agg)}),flush=True)
