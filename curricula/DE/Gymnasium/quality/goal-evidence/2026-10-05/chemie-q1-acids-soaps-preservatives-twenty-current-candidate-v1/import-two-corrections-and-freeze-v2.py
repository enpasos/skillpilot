from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, subprocess
ROOT=Path.cwd().resolve(); REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1'); OWN=ROOT/REL; ISO=ROOT/'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1'
IMAGE=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-two-evidenced-corrections-candidate-20261005-v1'); CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'eight-current-visual-inputs-v2.freeze.json').exists()
prior=read(OWN/'eight-current-visual-inputs.freeze.json')
for r in prior['files']:
 assert sha(ROOT/r.get('frozenCopyPath',r.get('path')))==r['sha256']
new=read(ROOT/IMAGE/'author-image-inputs.final.freeze.json')
for r in new['files']:assert sha(ROOT/r['path'])==r['sha256']
alts={'db66635f-f1d1-5f70-bcc0-fed1ae424e52':'Die Zeichnung zeigt die Entfärbung einer braun-gelben Iodlösung nach Zugabe einer Probe und eine weiterhin braune Vergleichsprobe ohne Probenzugabe. Daneben gibt ein abstraktes Ascorbinsäure-Symbol zwei Elektronen an Iod ab: Ascorbinsäure wird zum oxidierten Produkt und das Iodmolekül zu zwei Iodidionen.','8a491e3b-5d0b-51d3-9b14-0977ec035dd6':'Die Zeichnung vergleicht temporäre Wasserhärte am Calciumhydrogencarbonat-Beispiel mit Calciumcarbonat-Niederschlag und Kohlenstoffdioxid beim Erhitzen mit permanenter Härte am gelöst bleibenden Calciumchlorid-Beispiel. Ein Natrium-Ionenaustauscher hält Calcium- und Magnesiumionen am Harz zurück und gibt im gezeigten Modell vier Natriumionen für die beiden zweiwertigen Ionen an das Wasser ab. Der Fußtext benennt Calcium- und Magnesiumionen als Gesamthärte.'}
active={p:sha(ROOT/p) for p in [CAN,QA]};commands=[]
requests=read(ROOT/IMAGE/'actual-edit.requests.json')['requests']
for goal_id,alt in alts.items():
 row=next(r for r in requests if r['goalId']==goal_id);image=ROOT/IMAGE/'source'/goal_id/(goal_id+'.png');expected=next(r['sha256'] for r in new['files'] if r['path']==str(image.relative_to(ROOT)))
 prompt=OWN/(goal_id[:8]+'.actual-correction.prompt.md');prompt.write_text(row['prompt']+'\n')
 outputs=[f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/{goal_id}.png',f'app/public/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png',f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/prompt.de.md',f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/image-reconstruction-prompt.de.md']
 for rel in outputs:
  p=ISO/rel
  if p.is_symlink():raw=p.read_bytes();p.unlink();p.write_bytes(raw)
  for parent in p.parents:
   if parent==ISO:break
   assert not parent.is_symlink()
 args=['node','scripts/import_goal_visualization.mjs','--goal',goal_id,'--image',str(image),'--landscape',CAN,'--subject','chemie','--lang','de','--provider','OpenAI / ChatGPT-Codex image generation','--review-status','pilot','--license','CC-BY-4.0','--description','Gezielt korrigierter Comic-PNG-Kandidat als qualitative Lernhilfe; Erzeugung und Autorenprüfung ersetzen keine unabhängige Bildfreigabe, praktische Durchführung oder menschliche Freigabe.','--alt-text',alt,'--prompt',str(prompt)]
 started=datetime.now(timezone.utc).isoformat();r=subprocess.run(args,cwd=ISO,text=True,capture_output=True);ended=datetime.now(timezone.utc).isoformat()
 (OWN/(goal_id[:8]+'-native-correction-import.stdout.txt')).write_text(r.stdout);(OWN/(goal_id[:8]+'-native-correction-import.stderr.txt')).write_text(r.stderr)
 commands.append({'goalId':goal_id,'args':args,'cwd':str(ISO),'startedAtUTC':started,'endedAtUTC':ended,'actualExitCode':r.returncode,'pngSHA256':expected,'actualGeneratorTool':'image_gen.imagegen','actualModelId':'not exposed; not invented','independentV':'pending','humanApproval':False});assert r.returncode==0,r.stderr
 for p in outputs[:3]:assert sha(ISO/p)==expected and not (ISO/p).is_symlink()
args=['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie'];r=subprocess.run(args,cwd=ISO,text=True,capture_output=True)
(OWN/'native-candidate-v2-qa-generate.stdout.txt').write_text(r.stdout);(OWN/'native-candidate-v2-qa-generate.stderr.txt').write_text(r.stderr);assert r.returncode==0,r.stderr
canonical=read(ISO/CAN);qa=read(ISO/QA);old=read(OWN/'eight-current-visual-inputs.candidate.json');rows=[];files=[]
for previous in old['rows']:
 i=previous['goalId'];g=next(g for g in canonical['goals'] if g['id']==i);q=next(q for q in qa['records'] if q['goalId']==i);link=next(l for l in g['resourceLinks'] if l.get('type')=='goal-visualization' and l.get('role')=='primary');copies=[]
 assert q['title']==g['title'] and q['description']==g['description'] and q.get('aiApproved','no')=='no' and q['humanApproved']=='no'
 for p in [q['canonicalAssetPath'],q['publicAssetPath'],'backend/src/main/resources/static/'+link['url'].lstrip('/')]:
  assert not (ISO/p).is_symlink();target=OWN/'visual-review-input-tree-v2'/p;target.parent.mkdir(parents=True,exist_ok=True);assert not target.exists();shutil.copy2(ISO/p,target);assert sha(target)==sha(ISO/p)==q['assetSha256']
  copies.append({'futureActivePath':p,'frozenCopyPath':str(target.relative_to(ROOT)),'sha256':sha(target),'bytes':target.stat().st_size})
 files.extend(copies);rows.append({**previous,'currentOperativeGoal':g,'currentPrimaryLink':link,'pendingCurrentTargetQaRecord':q,'threeExactFutureCopies':copies,'imageDecision':'NEW_corrected_inactive_PNG_pending_independent_V' if i in alts else previous['imageDecision'],'preliminaryAuthorConcern':'Evidenced historical weaknesses corrected in author candidate; actual independent original360680 review remains pending' if i in alts else previous['preliminaryAuthorConcern']})
scope={r['goalId'] for r in rows};before_other={r['goalId']:r for r in read(OWN/'eight-visual-target-and-old-qa.before.snapshot.json')['qa']['records'] if r['goalId'] not in scope};after_other={r['goalId']:r for r in qa['records'] if r['goalId'] not in scope};assert before_other==after_other
assert all(sha(ROOT/p)==s for p,s in active.items())
write(OWN/'eight-current-visual-inputs-v2.candidate.json',{'authority':'informed_author_inputs_only','status':'FROZEN_final_eight_current_target_inputs_pending_independent_V','rows':rows,'actualNativeCorrectionImportCommands':commands,'nativeQaGeneratorExitCode':r.returncode,'authorCorrectionFreezePath':str(IMAGE/'author-image-inputs.final.freeze.json'),'authorCorrectionFreezeSHA256':sha(ROOT/IMAGE/'author-image-inputs.final.freeze.json'),'priorV1FreezePreserved':True,'newMissingPNGs':2,'evidencedReplacementPNGs':2,'existingUnchangedPixels':4,'all368OtherQaRecordsUnchanged':True,'humanApproval':False,'activeWritesThisStage':0,'strictNetDelta':0})
files.append({'path':str(REL/'eight-current-visual-inputs-v2.candidate.json'),'sha256':sha(OWN/'eight-current-visual-inputs-v2.candidate.json'),'bytes':(OWN/'eight-current-visual-inputs-v2.candidate.json').stat().st_size})
write(OWN/'eight-current-visual-inputs-v2.freeze.json',{'status':'FROZEN_eight_current_target_inputs_not_approval','preparedAtUTC':datetime.now(timezone.utc).isoformat(),'files':files,'goalIds':list(scope),'priorV1FreezeSHA256':sha(OWN/'eight-current-visual-inputs.freeze.json'),'independentV':'pending','humanApproval':False,'activeWritesThisStage':0,'strictNetDelta':0})
print(json.dumps({'scope':8,'nativeImportExitCodes':[c['actualExitCode'] for c in commands],'qaGeneratorExitCode':r.returncode,'freezeSHA256':sha(OWN/'eight-current-visual-inputs-v2.freeze.json'),'currentCopies':len(files)-1,'activeWrites':0}))
