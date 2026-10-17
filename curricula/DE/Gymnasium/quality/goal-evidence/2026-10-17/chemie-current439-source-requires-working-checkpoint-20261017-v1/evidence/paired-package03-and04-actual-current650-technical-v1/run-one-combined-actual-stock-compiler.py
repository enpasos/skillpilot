from pathlib import Path
import json,hashlib,datetime,subprocess,time,os
O=Path(__file__).resolve().parent;R=Path('/home/enpasos/projects/skillpilot');F=O/'capsule'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
m=json.loads((O/'ASSEMBLY.exact-guards-and-inputs.json').read_text());b=json.loads((O/'BINDING.actual-two-P-and-thirteen-SEM-source-FPs.json').read_text());assert b['APVAndFrontendNotYetRun'] is True
cp=F/m['canonicalRelative'];assert sha(cp)==b['canonical']['sha256'];assert b['unchangedPWholeLines']==437
report=O/'STOCK.actual650-C20-plus-paired-package03-and04-applicability.json';assert not report.exists()
lock=O/'COMPILER.single-invocation.started.json'
with lock.open('x') as f:json.dump({'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Exactly one actual stock applicability invocation after guarded assembly; no full native/central/build gate'},f,indent=2)
adapter=F/'app/scripts/privatePairedPackage03And04ActualProbe.mts';assert not adapter.exists()
adapter.write_text("import fs from 'node:fs';\nimport {buildApplicabilityCompilation} from './applicabilityCompiler.ts';\nconst result=buildApplicabilityCompilation();\nfs.writeFileSync("+json.dumps(str(report))+",JSON.stringify(result,null,2)+'\\n',{flag:'wx'});\nconsole.log(JSON.stringify({chemistry:result.reports.find(r=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')?.summary}));\n")
cmd=['node','--preserve-symlinks','--preserve-symlinks-main','--import',str(R/'app/node_modules/tsx/dist/loader.mjs'),str(adapter)]
env=dict(os.environ);env['TMPDIR']=str(O/'cache');env['TSX_DISABLE_CACHE']='1';t=time.monotonic()
p=subprocess.run(cmd,cwd=F,env=env,capture_output=True,text=True,timeout=180)
(O/'stock.stdout.actual.txt').write_text(p.stdout);(O/'stock.stderr.actual.txt').write_text(p.stderr)
execution={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':cmd,'cwd':str(F),'exitCode':p.returncode,'durationSeconds':time.monotonic()-t,'singleInvocation':True,'context':'Combined03/04 only; prior03 intermediate invocation is separately disclosed','prior03IntermediateInvocation':m['intermediate03CompilerAlreadyOccurredBeforeBundling'],'canonical':pin(cp),'whole39Views':b['whole39Views'],'P439':b['P439'],'SEM650':b['SEM650'],'stockModules':[pin(F/rel) for rel in ['app/scripts/applicabilityCompiler.ts','app/scripts/memoryCardReviewConfigDiscovery.ts','app/src/utils/jurisdictionMetadata.ts','app/src/landscapeTypes.ts']],'explicitRegistryPins':[pin(F/'curricula/DE/Gymnasium/provenance'/n) for n in ['source-landscape-registry.json','canonical-goal-provenance-registry.json','canonical-goal-applicability-override-registry.json']],'rootPatternSource':pin('/mnt/e/skillpilot-chemie-L7-20261017/compile_actual_paired_twenty_and_coordinate_snapshot_root.py'),'newScientificVotes':0,'M7':False,'HumanApproval':False,'boundary':'One actual stock applicability diagnostic only. Official own-scope/source limits and full native/M/P/central/human gates remain separate.'}
if report.exists():execution['report']=pin(report)
(O/'EXECUTION.single-actual-stock-compiler.json').write_text(json.dumps(execution,ensure_ascii=False,indent=2)+'\n')
assert p.returncode==0,p.stderr[-5000:]
r=json.loads(report.read_text());chem=next(x for x in r['reports'] if x['landscapeId']=='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0');assert chem['summary']['errors']==0,chem['summary']
print(json.dumps({'execution':pin(O/'EXECUTION.single-actual-stock-compiler.json'),'report':pin(report),'chemistry':chem['summary'],'singleInvocation':True},ensure_ascii=False,indent=2))
