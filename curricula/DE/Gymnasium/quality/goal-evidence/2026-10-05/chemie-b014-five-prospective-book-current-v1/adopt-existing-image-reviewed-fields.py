from pathlib import Path
import json,hashlib
ROOT=Path.cwd().resolve();OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1';ISO=ROOT/'tmp/chemie-b014-five-native-isolated-20261005-v1'
VREL=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-electrolysis-reversible-existing-current-v-qa-20261005-v1/native-v-fields.candidate.json')
def read(p):return json.loads(Path(p).read_text())
def write(p,x):assert not Path(p).is_symlink();Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
cp=ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';qp=ISO/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';canonical=read(cp);qa=read(qp);rows=[]
for v in read(ROOT/VREL)['records']:
 goal=next(g for g in canonical['goals'] if g['id']==v['goalId']);record=next(r for r in qa['records'] if r['goalId']==v['goalId']);fields=v['nativeQaFields']
 assert fields['description']==goal['description'] and fields['title']==goal['title']
 assert fields['assetSha256']==record['assetSha256']
 link=next(l for l in goal['resourceLinks'] if l.get('type')=='goal-visualization' and l.get('role')=='primary')
 before_link=json.loads(json.dumps(link));before_record=json.loads(json.dumps(record))
 link.update({k:value for k,value in v['candidateResourceLinkFields'].items() if k not in ['skillpilotId']})
 record.update(fields)
 record.update({'contentApprovedChatGpt':fields['aiApproved'],'chatGptReviewedAt':fields['aiReviewedAt'],'chatGptReviewer':fields['aiReviewer'],'chatGptNotes':fields['aiNotes']+' Exact independent receipt: '+str(VREL), 'humanApproved':'no'})
 rows.append({'goalId':goal['id'],'decision':v['decision'],'beforeResourceLink':before_link,'afterResourceLink':link,'beforeQARecord':before_record,'afterQARecord':record,'actualIndependentReviewPath':str(VREL),'pixelsUnchanged':True})
write(cp,canonical);write(qp,qa)
write(OWN/'existing-two-images-targeted-independent-binding.adoption.receipt.json',{'status':'fd_PASS_KEEP_efa_HOLD_truthfully_bound_in_isolation','rows':rows,'efaNewCorrectedImageStillRequired':True,'strictNetDelta':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'fd':'PASS_KEEP','efa':'HOLD_requires_specific_correction','activeWrites':0}))
