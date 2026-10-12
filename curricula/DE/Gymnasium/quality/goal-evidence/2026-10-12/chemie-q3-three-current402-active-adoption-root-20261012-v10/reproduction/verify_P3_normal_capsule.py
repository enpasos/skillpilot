from pathlib import Path
import tempfile,shutil,json,hashlib,subprocess
root=Path('/home/enpasos/projects/skillpilot');out=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-active-adoption-root-20261012-v10');v9=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9');v7=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-live-context-author-20261012-v7')
cap=Path(tempfile.mkdtemp(prefix='chemie-q3-v10-normal-P3-',dir=root/'tmp'));seen=set();copies=[]
def cp(relative):
 if str(relative) in seen:return
 seen.add(str(relative));src=root/relative;dst=cap/relative;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert src.read_bytes()==dst.read_bytes();copies.append({'path':str(relative),'sha256':'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest(),'byteExact':True})
for path in ['app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:cp(path)
(cap/'app/node_modules').symlink_to(root/'app/node_modules',target_is_directory=True)
commands=[]
for n in range(1,4):
 path=out/'inactive-check-configs'/f'P{n}.config.json';cfg=json.loads((root/path).read_text());cp(path)
 for key in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath','reviewPath']:cp(cfg[key])
 land=json.loads((root/cfg['landscapePath']).read_text());gid=cfg['scope']['goalIds'][0];g=next(g for g in land['goals'] if g['id']==gid);link=next(l for l in g['resourceLinks'] if l['type']=='goal-visualization');src=root/v7/'assets'/gid/(gid+'.png');dst=cap/'app/public'/link['url'].lstrip('/');dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
 argv=[str(root/'app/node_modules/.bin/tsx'),str(cap/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+str(path),'--mode=check'];r=subprocess.run(argv,cwd=cap,text=True,capture_output=True);(root/out/'checks'/f'normal-P{n}-isolated.actual-output.txt').write_text(r.stdout+r.stderr);commands.append({'config':str(path),'goalId':gid,'argv':['tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(path),'--mode=check'],'exitCode':r.returncode,'actualImageSHA':'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest()});print(r.stdout+r.stderr)
 if r.returncode:raise SystemExit(r.returncode)
(root/out/'checks/normal-P3-exact-production-capsule.receipt.json').write_text(json.dumps({'scope':'Exact three original-author profile rows with individual native-bound review IDs','sourcesUnmodifiedAndExact':copies,'commands':commands,'temporaryCapsuleOutsideCurricula':True,'originalAuthorBytesNotRewritten':True,'activeWrites':False,'newScientificVotes':0,'HumanApproval':False},indent=2)+'\n')
