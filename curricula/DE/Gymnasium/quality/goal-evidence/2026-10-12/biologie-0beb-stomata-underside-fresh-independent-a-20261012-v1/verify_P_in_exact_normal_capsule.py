from pathlib import Path
import tempfile,shutil,json,hashlib,subprocess
root=Path.cwd()
base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-fresh-independent-a-20261012-v1')
out=base/'P-current';out.mkdir(exist_ok=False)
record=json.loads((base/'inputs/P1.current.jsonl').read_text())
neutral=json.loads((base/'inputs/neutral.entry.json').read_text())
semantic=Path(neutral['semanticKinds']['path'])
shutil.copyfile(semantic,base/'inputs/P.semantic-kinds.current.json')
cfg={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':record['reviewId'],'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':record['landscapeId'],'landscapePath':str(base/'inputs/canonical.inactive.json'),'semanticKindLedgerPath':str(base/'inputs/P.semantic-kinds.current.json'),'reviewCriteriaPath':str(base/'inputs/P.criteria.md'),'reviewPath':str(base/'inputs/P1.current.jsonl'),'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'One current 0beb P candidate; exact corrected image and retained whole profile','goalIds':[record['goalId']]}}
config=out/'P.normal-scope1.config.json';config.write_text(json.dumps(cfg,indent=2)+'\n')
cap=Path(tempfile.mkdtemp(prefix='bio-0beb-independent-a-p-normal-',dir=root/'tmp'))
files=['app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',str(base/'inputs/canonical.inactive.json'),str(base/'inputs/P.semantic-kinds.current.json'),str(base/'inputs/P.criteria.md'),str(base/'inputs/P1.current.jsonl'),str(config)]
rows=[]
for f in files:
    dst=cap/f;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/f,dst)
    raw=(root/f).read_bytes();assert dst.read_bytes()==raw;rows.append({'path':f,'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'byteExact':True})
(cap/'app/node_modules').symlink_to(root/'app/node_modules',target_is_directory=True)
goal=next(g for g in json.loads((base/'inputs/canonical.inactive.json').read_text())['goals'] if g['id']==record['goalId'])
url=next(x['url'] for x in goal['resourceLinks'] if x['type']=='goal-visualization')
asset=cap/'app/public'/url.lstrip('/');asset.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/base/'inputs/0beb4ca2-2437-557a-9db2-ccda1cbcfa0a.png',asset)
imageSHA='sha256:'+hashlib.sha256(asset.read_bytes()).hexdigest();assert imageSHA==neutral['actualNewImage']['sha256']
cmd=[str(root/'app/node_modules/.bin/tsx'),str(cap/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+str(config),'--mode=check']
p=subprocess.run(cmd,cwd=cap,text=True,capture_output=True)
(out/'P.normal-production-check.actual-output.txt').write_text(p.stdout+p.stderr)
receipt={'actualCommand':['tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(config),'--mode=check'],'temporaryExecutionCapsuleOutsideCurricula':True,'normalProductionSourcesUnmodified':rows,'actualCorrectedImageSHA':imageSHA,'configScope':cfg['scope']['goalIds'],'exitCode':p.returncode,'authorPRecordUnchanged':True,'profileStatus':record['status'],'reviewAuthority':record['reviewAuthority'],'evidenceLevel':record['evidenceLevel'],'maximumClaimScope':record['maximumClaimScope'],'humanApproval':False,'activeWrites':False}
(out/'P.normal-production-check.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(p.stdout+p.stderr)
if p.returncode: raise SystemExit(p.returncode)
