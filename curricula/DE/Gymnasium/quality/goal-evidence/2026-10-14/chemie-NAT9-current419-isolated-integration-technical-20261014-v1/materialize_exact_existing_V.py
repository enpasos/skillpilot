# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime,os
R=Path('/home/enpasos/projects/skillpilot');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');O=B/'chemie-NAT9-current419-isolated-integration-technical-20261014-v1';P=B/'chemie-NAT31-nine-reviewed-children-four-parent-clusters-current414-minimal-author-integration-proposal-20261014-v1';H=R/'tmp/chemie-resume-20261014/NAT9-host';OLD=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def dump(p,j):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def split(p):
 if p.is_symlink():
  src=p.resolve();p.unlink();p.mkdir()
  for c in src.iterdir():(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def materialize(rel,raw):
 p=H/rel
 for a in reversed(p.parents):
  if a==H or H in a.parents:split(a)
 if p.is_symlink():p.unlink()
 p.write_bytes(raw)
def run(stem,args):
 argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs')]+args;s=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(argv,cwd=H,capture_output=True,text=True)
 for k in ['stdout','stderr']:(R/O/'receipts'/(stem+'.'+k+'.actual.txt')).write_text(getattr(p,k))
 dump(R/O/'receipts'/(stem+'.completed-run.actual.json'),{'argv':argv,'cwd':str(H),'startedAtUTC':s,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr});print(stem,p.returncode,p.stdout[:1000],p.stderr[:1000]);assert p.returncode==0
rows=read(R/P/'V/nine-existing-actual-PNG-bindings-and-original-paired-science.NO-NEW-V.json');assetrows=[]
for row in rows:
 bind=row['actualAsset'];src=R/bind['path'];assert sha(src)==bind['sha256'];gid=row['goalId'];raw=src.read_bytes();paths=['app/public'+row['resourceBody']['url'],f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png']
 for p in paths:materialize(p,raw)
 assetrows.append({'goalId':gid,'original':bind,'normalAliases':[{'path':p,'sha256':sha(H/p)} for p in paths]})
# Four existing cluster overview resources are never counted as atom V approvals.
can=read(H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');parents=read(R/P/'NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json')['selectedParentIds']
parentrows=[]
for g in can['goals']:
 if g['id'] not in parents:continue
 for link in g.get('resourceLinks',[]):
  if link.get('type')!='goal-visualization':continue
  gid=g['id'];candidates=[R/f'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2/capsule/app/public{link["url"]}',OLD/('app/public'+link['url'])]
  src=next((p for p in candidates if p.is_file()),None);assert src is not None,gid
  for p in ['app/public'+link['url'],f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png']:materialize(p,src.read_bytes())
  parentrows.append({'goalId':gid,'source':str(src.relative_to(R)),'sha256':sha(src),'atomicVClosureClaimed':False})
qa=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');materialize(qa,(OLD/qa).read_bytes())
run('QA.generate-default-current435-before-original-field-projection',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie'])
ledger=read(H/qa);by={r['goalId']:r for r in ledger['records']};seven=read(R/P/'V/seven-existing-typed-native-QA-fields.exact-original-A.not-applied.json');twosrc=read(R/P/'V/two-unchanged-v2-input-sealed-genuine-V-rows.NO-INVENTED-RAW-METADATA.json');trans=[]
for row in seven['records']:
 old=by[row['goalId']];assert row['aiApprovedAssetSha256']==old['assetSha256'];old.update(row);trans.append({'goalId':row['goalId'],'source':seven['original'],'transport':'exact original typed fields, unchanged dates/reviewer/digest'})
for row in twosrc['originalTwoScientificRows']:
 old=by[row['goalId']];bind=next(x['actualFinalPNG'] for x in twosrc['sameFinalPNGBytes'] if x['goalId']==row['goalId']);assert old['assetSha256']==bind['sha256']
 old.update({'aiApproved':'yes','aiApprovedAssetSha256':bind['sha256'],'aiReviewedAt':twosrc['reviewedAtUTCVerbatim'],'aiReviewer':'Codex independent B; exact original V29 actual-pixel judgment, mechanical native field projection','aiNotes':row['reason']+' Original actualNativeLayout: '+row['actualNativeLayout']+' Original V29 source: '+twosrc['originalWholeV29Review']['path']+'; no new review, no Human Approval or Trial.'})
 trans.append({'goalId':row['goalId'],'source':twosrc['originalWholeV29Review'],'originalScientificRow':row,'exactOriginalReviewedAtUTC':twosrc['reviewedAtUTCVerbatim'],'transport':'explicit new typed serialization of real retained V2 scientific judgment; no invented original typed row; reviewer disclosure identifies projection, no current review date'})
dump(H/qa,ledger)
# Normal unchanged stock normalizes and sorts all435 records; then check exact bytes.
run('QA.generate-stock-current435-original-science',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie'])
run('QA.check-stock-whole-current435',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie','--check'])
(R/O/'candidate/QA435.normal-stock-existing-science.nine-children.inactive.json').write_bytes((H/qa).read_bytes())
dump(R/O/'checks/V9.actual-existing-PNG-and-original-QA-transport.no-new-review.actual.json',{'schemaVersion':1,'technicalOnly':True,'newScientificReviews':0,'newImageGeneration':0,'assets':assetrows,'parentOverviewMaterializations':parentrows,'originalScienceFieldTransports':trans,'fullNormalStockQAGenerateAndCheckPassed':True,'humanApprovalOrTrialGranted':False})
