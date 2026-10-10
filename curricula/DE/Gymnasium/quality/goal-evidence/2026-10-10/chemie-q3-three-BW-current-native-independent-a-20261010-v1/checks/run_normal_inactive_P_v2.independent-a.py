from pathlib import Path
import shutil,subprocess,json,hashlib
from datetime import datetime,timezone
ROOT=Path.cwd();AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-raster-native-preparation-author-20261010-v1';OUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-native-independent-a-20261010-v1';CAPSULE=ROOT/'tmp/chemie-three-native-independent-a-20261010-v1/normal-inactive-P-v2-capsule'
CAPSULE.mkdir(parents=True,exist_ok=True)
configpath=str((AUTHOR/'positive/current-three.author.config.json').relative_to(ROOT));config=json.loads((ROOT/configpath).read_text());entry=json.loads((AUTHOR/'neutral-current-three-BW-practical-current-P-native.independent-review.entry.json').read_text());bindings=[]
def copy(relative_path):
 source=ROOT/relative_path;target=CAPSULE/relative_path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 a=source.read_bytes();b=target.read_bytes();assert a==b;bindings.append({'path':str(relative_path),'sourceSha256':'sha256:'+hashlib.sha256(a).hexdigest(),'executionCopyByteExact':True})
for path in ['app/package.json','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',configpath]:copy(path)
for k in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath','reviewPath']:copy(config[k])
for item in entry['actualPNGAndAccessibleMetadataInputs']:
 id=item['goalId'];source=ROOT/item['actualPNG']['path'];relative_path=f'app/public/assets/goal-visualizations/chemie/{id}/{id}.png';target=CAPSULE/relative_path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 data=target.read_bytes();actual='sha256:'+hashlib.sha256(data).hexdigest();assert actual==item['actualPNG']['sha256'];bindings.append({'sourcePath':item['actualPNG']['path'],'publicPath':relative_path,'sourceSha256':actual,'executionCopyByteExact':True})
modules=CAPSULE/'app/node_modules'
if not modules.exists():modules.symlink_to(ROOT/'app/node_modules',target_is_directory=True)
cmd=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+configpath];started=datetime.now(timezone.utc).isoformat();result=subprocess.run(cmd,cwd=CAPSULE,capture_output=True,text=True)
(OUT/'checks/normal-inactive-current-P-v2-check.stdout.actual.txt').write_text(result.stdout);(OUT/'checks/normal-inactive-current-P-v2-check.stderr.actual.txt').write_text(result.stderr)
receipt={'schemaVersion':1,'command':['app/node_modules/.bin/tsx']+cmd[1:],'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,'executionCapsuleDiagnosticOnly':'tmp/chemie-three-native-independent-a-20261010-v1/normal-inactive-P-v2-capsule','ordinaryProductionCheckerBytesUnmodified':True,'exactInputAndPngCopies':bindings,'activeRuntimeAssetsWereNotWritten':True,'normalCheckerSelectedFromExistingV2ConfigSchema':True,'scope':'inactive exact candidate inputs; not an active integration/approval claim'}
(OUT/'checks/normal-inactive-current-P-v2-check.terminal.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(result.stdout,result.stderr);raise SystemExit(result.returncode)
