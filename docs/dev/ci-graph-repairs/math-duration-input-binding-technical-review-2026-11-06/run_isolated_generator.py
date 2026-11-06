from pathlib import Path
import json,subprocess,hashlib,shutil,re,time,os
REPO=Path('/home/enpasos/projects/skillpilot');BASE=REPO/'tmp/math-duration-split-binding-review-2026-11-06';LOGS=BASE/'logs';LOGS.mkdir(exist_ok=True)
SOURCE='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';KINDS='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';POLICY='app/scripts/config/math-duration-split-spanning-tree-policy.json';GEN='app/scripts/generateMathDurationCompositionViews.ts';VIEWS='curricula/DE/Gymnasium/composition-views/mathematik'
h=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();raw=(REPO/POLICY).read_bytes();policy=json.loads(raw);new=json.loads(raw);new['inputs']['canonical']['sha256']=h(REPO/SOURCE)
assert (json.dumps(policy,ensure_ascii=False,indent=2)+'\n').encode()==raw
candidate=BASE/'candidate-policy.json';candidate.write_text(json.dumps(new,ensure_ascii=False,indent=2)+'\n');assert {**new,'inputs':{**new['inputs'],'canonical':policy['inputs']['canonical']}}==policy
source_text=(REPO/GEN).read_text();block=re.search(r'const GENERATED_VIEW_PATHS = \[([\s\S]*?)\n\]',source_text).group(1);outputs=re.findall(r"'([^']+)'",block);assert len(outputs)==18
for name in ['old','candidate']:
 dest=BASE/(name+'-views');assert not dest.exists()
 for p in (REPO/VIEWS).rglob('*'):assert not p.is_symlink(),str(p)
 shutil.copytree(REPO/VIEWS,dest)
records=[]
for name,write in [('old',True),('old',False),('candidate',True),('candidate',False)]:
 old=name=='old';views=BASE/(name+'-views');label=name+('-generate' if write else '-check');source=BASE/'old-DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json' if old else REPO/SOURCE;kinds=BASE/'old-mathematik.semantic-kinds.json' if old else REPO/KINDS;plan=BASE/'old-math-duration-split-spanning-tree-policy.json' if old else candidate
 args=['bwrap','--die-with-parent','--ro-bind','/','/','--tmpfs','/tmp','--tmpfs','/mnt','--proc','/proc','--dev-bind','/dev','/dev','--ro-bind',str(source),str(REPO/SOURCE),'--ro-bind',str(kinds),str(REPO/KINDS),'--ro-bind',str(plan),str(REPO/POLICY),'--bind' if write else '--ro-bind',str(views),str(REPO/VIEWS),'--bind',str(LOGS),'/mnt/evidence','--setenv','npm_config_cache','/tmp/npm-cache','--chdir',str(REPO/'app'),'--','strace','-f','-qq','-s','4096','-e','trace=openat','-o','/mnt/evidence/'+label+'.openat.trace','./node_modules/.bin/tsx','scripts/generateMathDurationCompositionViews.ts','--write' if write else '--check']
 print('START',label,flush=True);start=time.monotonic()
 with (LOGS/(label+'.log')).open('wb') as stream:r=subprocess.run(args,stdout=stream,stderr=subprocess.STDOUT)
 record={'case':label,'exitCode':r.returncode,'seconds':time.monotonic()-start,'sourceSha256':h(source),'kindLedgerSha256':h(kinds),'policySha256':h(plan),'generatorSha256':h(REPO/GEN),'log':str((LOGS/(label+'.log')).relative_to(REPO)),'logSha256':h(LOGS/(label+'.log')),'argv':args};records.append(record);(BASE/'execution.json').write_text(json.dumps({'sourceCommit':'5cb5e567d08bc9f640942529d9099cbce03a4747','sourceHeadAtPreparation':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),'commands':records},indent=2)+'\n');print('END',label,'EXIT',r.returncode,'seconds',round(record['seconds'],2),flush=True);print((LOGS/(label+'.log')).read_text()[-2200:],flush=True)
 if r.returncode:raise SystemExit(r.returncode)
summary=[]
for name in outputs:
 a=BASE/'old-views'/name;b=BASE/'candidate-views'/name;assert a.read_bytes()==b.read_bytes(),name
 live=REPO/VIEWS/name
 summary.append({'fileName':name,'oldGeneratedSha256':h(a),'candidateGeneratedSha256':h(b),'liveSha256':h(live),'generatedByteEquality':True,'candidateEqualsLive':b.read_bytes()==live.read_bytes(),'bytes':b.stat().st_size})
for name in ['old','candidate']:
 view_dir=BASE/(name+'-views')
 for p in (REPO/VIEWS).rglob('*'):
  if p.is_file() and p.name not in outputs:assert p.read_bytes()==(view_dir/p.relative_to(REPO/VIEWS)).read_bytes(),str(p)
assert h(REPO/SOURCE)=='da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6';assert h(REPO/KINDS)=='78a5f2d9b4f48f35f2871b2c8b59f51c60bea5e2e2dde7857f6bdad85672472b';assert h(REPO/POLICY)=='ebc87e844ed7354b7a72d8d4419a62b516d05fa28819dd823e04d13eb273000b';assert h(REPO/GEN)=='817a3652b44ef182608d8277ae6a57aa2ac68d2d5401cb480079f010e420c79d'
(BASE/'output-comparison.json').write_text(json.dumps({'outputs':summary,'all18ByteEqual':True,'all18EqualLive':all(x['candidateEqualsLive'] for x in summary),'livePolicyUnchanged':True,'nonOutputViewsUnchanged':True,'sourceAndKindUnchanged':True},indent=2)+'\n');print(json.dumps({'all18ByteEqual':True,'all18EqualLive':all(x['candidateEqualsLive'] for x in summary)}),flush=True)
