"""Apache-2.0. Freeze owned neutral inputs; exact sealed asset metadata transport only."""
from pathlib import Path
import json, hashlib, datetime, shutil
R=Path.cwd(); E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'); O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
VB=E/'chemie-polymers-3aef-no-melt-flow-actual-V-independent-b-20261013-v5'
rd=lambda p:json.loads(p.read_text()); h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert h(VB/'FINAL.thermal-V1.independent-b.freeze.json')=='sha256:fbe0851f9ca75f15f5932df01c3035fa1f1f0b2b7d5388cebf1b86f97d01ffb5'
vp=VB/'V1.3aef-thermal-successor.independent-b.json'; assert h(vp)=='sha256:0619f0d06851f0637ce4b3d2b95104d167841cb4e554a4add5e3511244764e6b'; v=rd(vp)
first=rd(O/'checks/FIRST.current523-rowwise-six-merge-and-raw-retention.actual.json')
for b in [dict(path=first['currentCanonicalPath'],sha256=first['currentCanonicalBefore']),first['sourceSemanticBinding'],first['activeRegistryBinding'],first['currentQaBinding']]:assert h(Path(b['path']))==b['sha256'],b['path']
oldpath=O/'candidate/QA.current-plus-six-pending-actualV.inactive.json'; qa=rd(oldpath); q=next(q for q in qa['records'] if q['goalId']==v['goalId']); assert q['assetSha256']=='sha256:'+v['assetSha256'].removeprefix('sha256:')
legacykeys=['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer','umlautsCorrectChatGpt','contentApprovedChatGpt','chatGptReviewedAt','chatGptReviewer','chatGptNotes']; before={k:q.get(k)for k in legacykeys}
assert v['aiApproved']=='yes'; q.update(aiApproved=v['aiApproved'],aiApprovedAssetSha256='sha256:'+v['aiApprovedAssetSha256'].removeprefix('sha256:'),aiReviewedAt=v['aiReviewedAt'],aiReviewer=v['aiReviewer'],aiNotes='Exact sealed independent asset-only decision retained technically. No native/P/human approval implied.')
assert before=={k:q.get(k)for k in legacykeys}; finalqa=O/'candidate/QA.current-plus-six-actualV.inactive.json'; wr(finalqa,qa)
liveqa=Path(first['currentQaBinding']['path']); bqa=O/'baseline/QA.current-actual.raw-exact.json'; shutil.copyfile(liveqa,bqa)
for name in ['whole402.normal-base.config.json','whole402.inactive.config.json']:
 p=O/'configs'/name;c=rd(p);c['goalVisualizationQaPath']=str(bqa if name.startswith('whole402.normal') else finalqa)
 if name=='whole402.inactive.config.json':c['outputPath']=str(O/'models/whole402.current231-plus-author18.final-inputs.normal.json')
 wr(p,c)
rootret=rd(O/'root-only/five-existing-V-decisions.technical-retention.json');rootret['thermalSuccessorPending']=False;rootret['thermalExactDecisionBinding']={k:v[k]for k in ['goalId','assetSha256','aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer']};rootret['thermalSourceSeal']={'path':str(VB/'FINAL.thermal-V1.independent-b.freeze.json'),'sha256':h(VB/'FINAL.thermal-V1.independent-b.freeze.json')};rootret['thermalSourceRecord']={'path':str(vp),'sha256':h(vp)};wr(O/'root-only/six-existing-V-decisions.technical-retention.json',rootret)
first['QAChanges']='Six exact sealed positive asset decisions retained; human and legacy fields unchanged; no new votes invented';first['finalNativeFreezeAllowed']=True;first['reason']='Root authorized final native18 after exact current16 CAS and actual thermal V1';wr(O/'checks/FIRST.current523-rowwise-six-merge-and-raw-retention.actual.json',first)
helper=Path('tmp/chemie-polymers18-current231-preparation/build_normal_models.ts');s=helper.read_text().replace('models/whole402.current231-plus-author18.pending-V.normal.json','models/whole402.current231-plus-author18.final-inputs.normal.json').replace("finalFreezeAllowed:false,remainingGates:['Root actual independent V1 decision on new thermal d208 PNG','Final current-base CAS recheck before normal native freeze','Normal final PDF/native campaign after identical final inputs; genuine independent reviews']","finalFreezeAllowed:true,remainingGates:['Normal final PDF/native campaign after identical final inputs','Genuine independent whole-goal A/B reviews']")
helper.write_text(s);shutil.copyfile(helper,O/'helpers/build_normal_models.ts');shutil.copyfile(Path(__file__),O/'helpers/finalize_inputs.py')
print(json.dumps({'currentCanonical':first['currentCanonicalBefore'],'sixExactAssetDecisions':True,'humanLegacyUnchanged':True,'newVotes':0,'finalQA':str(finalqa)}))
