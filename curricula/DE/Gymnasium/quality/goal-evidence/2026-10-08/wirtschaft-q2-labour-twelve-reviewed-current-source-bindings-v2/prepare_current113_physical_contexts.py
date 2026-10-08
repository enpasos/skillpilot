# Apache-2.0. Current113 context overlay; frozen historical files remain unchanged.
from pathlib import Path
import json,hashlib,datetime,shutil,subprocess
root=Path('/home/enpasos/projects/skillpilot')
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
SEM='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
rootqa=read(root/QA);assert sum(r['visualizationState']=='available'for r in rootqa['records'])==113
rootcanon=read(root/CAN);rootsem=read(root/SEM)
for name,iso,idsfile,configs,freezes in [
 ('wirtschaft-q2-labour-twelve-reviewed-current-source-bindings-v2','/tmp/skillpilot-wirtschaft-q2-labour-twelve-native-qnj7b9dg','wirtschaft-q2-labour-twelve-bilingual-positive-author-v2/goal-ids.json',['wirtschaft-q2-labour-twelve-native-preparation-technical-20261008-v1/native-d-q2-labour-twelve.final.batch.config.json'],['wirtschaft-q2-labour-twelve-native-preparation-technical-20261008-v1/native-d-q2-labour-twelve-final.prepared-freeze.actual.json']),
 ('wirtschaft-q3-twenty-three-reviewed-current-source-bindings-v2','/tmp/skillpilot-wirtschaft-q3-twenty-three-native-kd_f3f9x','wirtschaft-q3-global-currency-integration-twenty-three-bilingual-positive-author-v2/goal-ids.json',['wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1/native-d-q3-global-currency-seventeen.final.batch.config.json','wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1/native-d-q3-europe-integration-six.final.batch.config.json'],['wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1/native-d-q3-global-currency-seventeen-final.prepared-freeze.actual.json','wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1/native-d-q3-europe-integration-six-final.prepared-freeze.actual.json'])]:
 own=B/name;physical=Path(iso);ids=set(read(root/B/idsfile));(root/own).mkdir(exist_ok=True)
 frozen=[f for p in freezes for f in read(root/B/p)['byteExactReturnedNativeFiles']]
 assert len(frozen)==28*len(configs)
 for f in frozen:assert sha(root/f['path'])==sha(physical/f['path'])==f['sha256']
 current=read(physical/CAN);oldqa=read(physical/QA);oldsem=read(physical/SEM)
 for p in [CAN,SEM,QA]:
  snap=root/own/'previous-physical-input-bytes'/Path(p).name;snap.parent.mkdir(parents=True,exist_ok=True)
  with snap.open('xb')as f:f.write((physical/p).read_bytes())
 selected={g['id']:g for g in current['goals']if g['id']in ids};nextcanon=dict(rootcanon,goals=[selected.get(g['id'],g)for g in rootcanon['goals']])
 selectedsem={r['goalId']:r for r in oldsem['decisions']if r['goalId']in ids};nextsem=dict(rootsem,decisions=[selectedsem.get(r['goalId'],r)for r in rootsem['decisions']])
 selectedqa={r['goalId']:r for r in oldqa['records']if r['goalId']in ids};nextqa=dict(rootqa,records=[selectedqa.get(r['goalId'],r)for r in rootqa['records']])
 assert len(selected)==len(ids)==len(selectedsem)==len(selectedqa)
 for p,v in [(CAN,nextcanon),(SEM,nextsem),(QA,nextqa)]:
  write(root/own/('current113.'+Path(p).name),v)
  (physical/p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
 assetcopies=[]
 for r in rootqa['records']:
  if r['visualizationState']!='available':continue
  for k in ['publicAssetPath','canonicalAssetPath']:
   p=Path(r[k]);dest=physical/p;dest.parent.mkdir(parents=True,exist_ok=True)
   if dest.exists():assert sha(dest)==r['assetSha256']
   else:shutil.copyfile(root/p,dest)
   assetcopies.append({'path':str(p),'sha256':sha(dest)})
 assert len(assetcopies)==226
 write(root/own/'current113-physical-context-overlay.actual.json',{'schemaVersion':1,'actualCheckedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'technical_current_baseline_overlay_only','physicalIsolate':iso,'currentRootCanonicalSha256':sha(root/CAN),'currentRootQASha256':sha(root/QA),'currentRootSemanticLedgerSha256':sha(root/SEM),'currentStrictBaseline':113,'ownSelectedGoalIds':sorted(ids),'rootWholeUnselectedGoalsExactlyRetained':len(rootcanon['goals'])-len(ids),'currentRootPhysicalAssetsCopied':assetcopies,'frozenNativeFilesRetained':len(frozen),'reviewRestartPerformed':False,'independentReviewClaim':False,'activeWrites':0})
 script=own/'native-current113-frozen-wholepage-parity.mts'
 text="""// Apache-2.0. Actual whole native pages, current113 context; no historical rewrite.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash}from'node:crypto'
import {loadGoalBookBuildInputs}from'../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel}from'../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const root=process.cwd(),iso=ISOSTR,own=OWNSTR,configs=CONFIGS
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const rows=[]
for(const config of configs){const c=await read(config);const original=await read(c.outputDirectory+'/bundle/book-model.json');const base=await loadGoalBookBuildInputs(c.baseGoalBookConfigPath,iso);const model=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:c.goalIds,bookId:c.bookId,title:c.title});for(let i=0;i<original.pages.length;i++){const a=original.pages[i],b=model.pages[i];rows.push({goalId:a.goalId,originalPageFingerprint:a.pageFingerprint,currentPageFingerprint:b.pageFingerprint,actualWholePageByteEquivalent:JSON.stringify(a)===JSON.stringify(b),changedFields:Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]))})}}
if(!rows.every(r=>r.actualWholePageByteEquivalent))throw Error(JSON.stringify(rows.filter(r=>!r.actualWholePageByteEquivalent)))
await writeFile(own+'/current113-native-wholepage-parity.actual.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),physicalIsolate:iso,currentStrictBaseline:113,wholePageCount:rows.length,actualWholePageComparisons:rows,allWholePagesExactlyUnchanged:true,scope:'Actual production loader and bounded subset builder; no D restart for identical pages.',independentReviewClaim:false,activeWrites:0},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({currentStrictBaseline:113,wholePages:rows.length,allWholePagesExactlyUnchanged:true}))
""".replace('ISOSTR',json.dumps(iso)).replace('OWNSTR',json.dumps(str(own))).replace('CONFIGS',json.dumps([str(B/p)for p in configs]))
 with(root/script).open('x')as f:f.write(text)
 result=subprocess.run(['app/node_modules/.bin/tsx',str(script)],cwd=root,capture_output=True,text=True)
 for ext,t in [('stdout',result.stdout),('stderr',result.stderr)]:
  with(root/own/('current113-page-parity.'+ext+'.txt')).open('x')as f:f.write(t)
 assert result.returncode==0,result.stdout+result.stderr
 print(result.stdout)
 for f in frozen:assert sha(root/f['path'])==sha(physical/f['path'])==f['sha256']
