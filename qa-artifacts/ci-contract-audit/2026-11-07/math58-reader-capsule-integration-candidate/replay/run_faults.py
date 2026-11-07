from pathlib import Path
import json,subprocess,os,hashlib
W=Path(__file__).parent;C=W/'candidate';p=json.loads((C/'contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json').read_text());b=p['goalBindings'][1];faults={key:b[key]for key in ['currentReview','currentInput','browser','firstTimeClarification']};faults.update(screenshot=b['views'][0]['screenshot'],html=b['views'][0]['html'],source=p['source'],CSS=p['rendererReferences'][0],pins={'path':'contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json'})
if b['contactSheet']:faults['contact-pair']=b['contactSheet']
results=[]
for name,ref in faults.items():
 original=W/'working'/ref['path'];assert original.is_file();dest=W/'faults'/name;dest.parent.mkdir(exist_ok=True);dest.write_bytes(original.read_bytes()+b'\n');plan=W/'fault-plan.json';plan.write_text(json.dumps([{'source':str(dest),'path':ref['path']}]))
 env={**os.environ,'MATH58_FAULT_PLAN':str(plan),'MATH58_FAULT_NAME':name};r=subprocess.run(['python3',str(W/'run_ro.py'),'app/node_modules/.bin/tsx','app/scripts/testMath58ReaderFault.ts'],env=env,capture_output=True,text=True);result=json.loads((W/('fault-'+name+'.json')).read_text());assert r.returncode==0 and not result['result']['ok'],(name,r.stdout,r.stderr,result);results.append(result)
# Actual missing file, with the other input files still present in the same complete group.
ref=b['currentInput'];group=Path(ref['path']).parent;missing=W/'faults/missing-input-group';missing.mkdir(exist_ok=True)
for src in (W/'working'/group).iterdir():
 if src.name!=Path(ref['path']).name:os.link(src,missing/src.name)
plan=W/'fault-plan.json';plan.write_text(json.dumps([{'source':str(missing),'path':str(group)}]));r=subprocess.run(['python3',str(W/'run_ro.py'),'app/node_modules/.bin/tsx','app/scripts/testMath58ReaderFault.ts'],env={**os.environ,'MATH58_FAULT_PLAN':str(plan),'MATH58_FAULT_NAME':'missing-current-input'},capture_output=True,text=True);result=json.loads((W/'fault-missing-current-input.json').read_text());assert r.returncode==0 and not result['result']['ok'];results.append(result)
(W/'reader-fault-results.json').write_text(json.dumps({'rows':results,'allRejected':True},indent=2)+'\n');print(json.dumps({'cases':len(results),'allRejected':True}))
