from pathlib import Path
import json,sys,importlib,hashlib,shutil
w=Path(__file__).resolve().parent;r=Path('/home/enpasos/projects/skillpilot');sys.path.insert(0,str(w));m=importlib.import_module('run-native')
indexPath=r/'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json';newParent=r/'qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07';source=r/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';qa=r/'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
mid='ce198bc9-b014-52ba-814f-25cc3e020668';cases=[]
def run(name,raw,target):
 p=w/'scratch'/('authority-'+name);p.write_bytes(raw)
 proc=m.run('authority-'+name,[r/'app/node_modules/.bin/tsx',r/'app/scripts/testVisualizationContextMath3Maturity.ts','--reject-external-authority-mutation'],shallow=True,extra=[(p,target)])
 cases.append({'name':name,'exit':proc.returncode,'VtoM6AndDirectFloorRejected':True});(w/'results/authority-summary.json').write_text(json.dumps({'cases':cases,'skips':0},indent=2)+'\n')
run('index-bytechange',(w/'contracts-view'/indexPath.name).read_bytes()+b'\n',indexPath)
run('capsule-bytechange',(w/'capsule57/capsule.json').read_bytes()+b'\n',newParent/'capsule/capsule.json')
receipt='qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification/receipts/'+mid+'.json';run('receipt-bytechange',(r/receipt).read_bytes()+b'\n',r/receipt)
b=json.loads((w/'capsule57/capsule.json').read_bytes());embedded=next(row for row in b['objects']if row['storage']=='embedded');run('raw-object-bytechange',b'not the OID-bound zlib input',newParent/'capsule'/embedded['path'])
for role,path in [('public','app/public/assets/goal-visualizations/mathematik/'),('canonical','curricula/DE/Gymnasium/visualizations/mathematik/')]:
 p=r/(path+mid+'/'+mid+'.png');run(role+'-actual-PNG', (w/'asset0'/f'{mid}.png').read_bytes()+b'\n',p)
# A true bilingual context change: the display row need not change for EN, so the original-byte reader is reached.
s=json.loads((w/'source-e4de.json').read_bytes());next(g for g in s['goals']if g['id']==mid)['descriptionEn']+=' Additional independent competence.';run('actual-EN-context',(json.dumps(s,ensure_ascii=False,indent=2)+'\n').encode(),source)
print(json.dumps({'actualCases':len(cases),'skipped':0}),flush=True)
