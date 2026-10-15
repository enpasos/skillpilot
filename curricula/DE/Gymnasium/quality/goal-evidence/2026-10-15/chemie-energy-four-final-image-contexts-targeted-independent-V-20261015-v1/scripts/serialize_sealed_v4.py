from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy
R=Path.cwd();O=Path(__file__).resolve().parents[1];B=O.parent
P=B/'chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1'
C=B/'chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/candidate/canonical560.current422.three-wording-four-alt.author.json'
Q=B/'chemie-energy20-current422-native-preparation-technical-20261015-v1/candidate/QA438.exact-author-row-transport.json'
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def entry(p):return {'path':str(p.relative_to(R)),'sha256':digest(p),'bytes':p.stat().st_size}
def write(p,x):
 assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');json.loads(p.read_text())
first=json.loads((O/'FIRST.V4.SCIENCE.json').read_text());seal=json.loads((O/'FIRST.V4.SCIENCE.seal.json').read_text());assert digest(O/'FIRST.V4.SCIENCE.json')==seal['first']['sha256']
canonical=json.loads(C.read_text());assert digest(C)=='sha256:e36d631c46c019466478d2f4a900ae0b5161d52b52e85bb6e701aadf7ee90545'
base=json.loads(Q.read_text());assert digest(Q)=='sha256:7a88cb9626f71bbe24a205ad0c2cf5921507f82d013432f4af082acbebb12b3b'
ids=[x['goalId'] for x in first['reviews']];gm={g['id']:g for g in canonical['goals']};bm={r['goalId']:r for r in base['records']};selector=json.loads((P/'NEUTRAL.BLIND4.current-four-native-inputs.json').read_text());imagebyid={Path(x['path']).parent.name:x for x in selector['unchangedPixelInputs']}
write(O/'history/four-baseline-rows.exact.json',{'schemaVersion':1,'role':'Historical input rows only; no contemporary human or AI approval inferred','wholeBaseline':entry(Q),'records':[bm[i] for i in ids]})
now=datetime.now(timezone.utc).isoformat();rows=[]
for s in first['reviews']:
 i=s['goalId'];g=gm[i];r=copy.deepcopy(bm[i]);img=R/imagebyid[i]['path'];assert digest(img)==imagebyid[i]['sha256'];assert s['decision']=='accepted_pilot';link=next(x for x in g['resourceLinks'] if x.get('role')=='primary');pub=R/'app/public'/link['url'].lstrip('/');assert pub.is_file();assert digest(pub)==digest(img)
 r.update(title=g['title'],description=g['description'],assetSha256=digest(img),umlautsCorrectChatGpt='yes',contentApprovedChatGpt='yes',humanApproved='no',humanIssueIdentified='no',humanIssueDescription='',chatGptReviewedAt=now,chatGptReviewer='Codex GPT-6 informed independent V4; exact runtime model identifier not exposed',chatGptNotes='accepted_pilot; actual frozen native PDF/HTML context and actual Chromium 360/680 image displays reviewed. '+s['contentAndCurrentContext']+' '+s['readability360']+' '+s['readability680']+' '+s['perspectiveAndStyle']+' '+s['scopeLimit'],humanReviewedAt=None,humanReviewer='',aiApproved='yes',aiApprovedAssetSha256=digest(img),aiReviewedAt=now,aiReviewer='Codex GPT-6 informed independent V4; exact runtime model identifier not exposed',aiNotes='Original scientific FIRST '+digest(O/'FIRST.V4.SCIENCE.json')+'; accepted_pilot for the exact current JPG and current description/ALT. '+s['scopeLimit']+' No human approval, learner trial, source/course approval, D/P/A/M or runtime acceptance.')
 rows.append(r)
rows.sort(key=lambda r:r['title'].casefold())
qa4={'schemaVersion':1,'subject':'chemie','source':copy.deepcopy(base['source']),'records':rows};write(O/'qa/QA4.current-contexts.normal-alias.json',qa4)
portable=copy.deepcopy(qa4);portable['source']['canonicalRoot']=str(C.parent.relative_to(R));portable['source']['publicAssetRoot']='app/public/assets/goal-visualizations'
for r in portable['records']:r['landscapePath']=str(C.relative_to(R))
write(O/'qa/QA4.current-contexts.portable-sourcepaths.json',portable)
whole=copy.deepcopy(base);rm={r['goalId']:r for r in rows};whole['records']=[rm.get(r['goalId'],r) for r in whole['records']];assert len(whole['records'])==438
changed=[(a['goalId'],sorted(k for k in set(a)|set(b) if a.get(k)!=b.get(k))) for a,b in zip(base['records'],whole['records']) if a!=b];assert {i for i,fields in changed}==set(ids)
write(O/'candidate/QA438.original-base-plus-four-current-V4.normal-alias.json',whole)
bounded=copy.deepcopy(canonical);bounded['goals']=[gm[i] for i in ids];write(O/'candidate/four-whole-current-goals.bounded-normal-QA-input.json',bounded)
cas={'schemaVersion':1,'role':'Explicit source-path metadata CAS only; no scientific verdict or asset changed by transport','sourceBefore':qa4['source'],'sourceAfter':portable['source'],'rowChanges':[{'goalId':r['goalId'],'landscapePathBefore':r['landscapePath'],'landscapePathAfter':str(C.relative_to(R)),'publicAssetPathBefore':r['publicAssetPath'],'publicAssetPathAfter':r['publicAssetPath'],'canonicalAssetPathBefore':r['canonicalAssetPath'],'canonicalAssetPathAfter':r['canonicalAssetPath']} for r in rows],'onlySourceCanonicalRootAndFourLandscapePathsDiffer':True,'publicAssetRootVerifiedAtRealPublicPaths':True,'wholeQaBase':entry(Q),'wholeCandidateChangedRows':changed,'untargeted434RowsExactlyPreserved':True,'untargetedDescriptorDriftPreservedWithoutNewVote':['a3386a86-f1ee-55b8-bcd5-03bfb1f9d987','0773a104-aaeb-5e96-a615-2a2bec3eb096'],'whole438AllCurrentOrApprovedClaim':False}
write(O/'qa/TRANSPORT.source-paths-and-four-row-CAS.json',cas)
stock=['app/scripts/generateGoalVisualizationQaLedgers.ts','app/scripts/goalVisualizationQaModel.ts','app/scripts/goalVisualizationQualityDeferral.ts','app/src/utils/goalVisualizationQaStatus.ts','scripts/goal_visualization_scope.mjs','app/package.json']
config={'schemaVersion':1,'role':'Bounded normal stock current V4 image/context check; whole438 successor replaces exactly four rows','normalLandscapePath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','normalQaPath':'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','wholeCurrentCanonical560':entry(C),'boundedWholeGoals':entry(O/'candidate/four-whole-current-goals.bounded-normal-QA-input.json'),'normalQaCandidate':entry(O/'qa/QA4.current-contexts.normal-alias.json'),'portableQaCandidate':entry(O/'qa/QA4.current-contexts.portable-sourcepaths.json'),'wholeQa438Base':entry(Q),'wholeQa438FourRowSuccessor':entry(O/'candidate/QA438.original-base-plus-four-current-V4.normal-alias.json'),'stockSourceFiles':[entry(R/x) for x in stock],'images':[dict(imagebyid[i],publicUrl=next(x for x in gm[i]['resourceLinks'] if x.get('role')=='primary')['url']) for i in ids],'expectedCurrentApprovedIds':ids,'expectedCurrentUnapprovedIds':[],'maxRegularHostBytes':10000000,'assetHandling':'Read-only links in ignored execution capsule; original/public image bytes remain unchanged; screenshot files are inspection evidence only.'}
write(O/'CONFIG.bounded-current4-normal-QA.json',config)
print(json.dumps({'fourRows':len(rows),'wholeRows':len(whole['records']),'onlyChangedIds':[i for i,f in changed],'firstPreserved':digest(O/'FIRST.V4.SCIENCE.json')==seal['first']['sha256']},indent=2))
