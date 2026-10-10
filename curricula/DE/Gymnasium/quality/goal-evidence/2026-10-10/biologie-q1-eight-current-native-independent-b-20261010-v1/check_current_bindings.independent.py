from pathlib import Path
import json,hashlib,copy
from datetime import datetime,timezone
R=Path.cwd();A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-current-v3-raster-native-technical-author-candidate-v1';O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-current-native-independent-b-20261010-v1'
def j(p):return json.loads(Path(p).read_text())
def jl(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def h(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
e=j(A/'neutral-eight-current-v3-raster-native.independent-review.entry.json');ids=e['priorityGoalIds'];S=set(ids)
original=j(R/e['neutralWholeFirstInputs']['allWholePrimaryAndCurrentCohortInputs'][0]['path']);after=j(A/'candidate/whole479-with-eight-author-raster-links.inactive.json'); assert len(original['goals'])==len(after['goals'])==479
old={x['id']:x for x in original['goals']};new={x['id']:x for x in after['goals']};assert set(old)==set(new)
deltas=[]
for id,a in old.items():
 b=new[id]
 keys=[k for k in set(a)|set(b) if a.get(k)!=b.get(k)]
 if keys:deltas.append({'goalId':id,'changedTopLevelFields':keys})
 assert keys==(['resourceLinks'] if id in S else [])
 before_no=copy.deepcopy(a);after_no=copy.deepcopy(b);before_no.pop('resourceLinks',None);after_no.pop('resourceLinks',None);assert before_no==after_no
before=j(A/'native/before394-current-V3.actual-model.json');full=j(A/'native/after394-current-P.actual-model.json');native=j(A/'native/eight-current-P/bundle/book-model.json');assert len(before['pages'])==len(full['pages'])==394;assert len(native['pages'])==8
bp={x['goalId']:x for x in before['pages']};fp={x['goalId']:x for x in full['pages']};np={x['goalId']:x for x in native['pages']};assert set(np)==S
page_deltas=[]
for id,p in bp.items():
 q=fp[id];keys=[k for k in set(p)|set(q) if p.get(k)!=q.get(k)]
 if keys:page_deltas.append({'goalId':id,'changedFields':sorted(keys)})
 if id not in S:assert p==q
 else:
  assert set(keys)<={'visualization','evidenceReview','pageFingerprint'}
  assert p['goalFingerprint']==q['goalFingerprint']
originalP={x['goalId']:x for x in jl(A/'positive/whole12-current-V3-profiles.exact.jsonl')};currentP={x['goalId']:x for x in jl(A/'positive/eight-current-P.author.review.jsonl')};deferredP={x['goalId']:x for x in jl(A/'positive/four-deferred-current-V3-profiles.exact-retained.jsonl')};assert set(currentP)==S;assert set(deferredP)==set(e['deferredGoalIds'])
materials={x['goalId']:x for x in j(A/'science/whole12-current-V3-materials.exact.json')['goals']}
profiles=[];images=[]
for id in ids:
 p=currentP[id];assert p['profile']==originalP[id]['profile']==materials[id]['profile'];assert p['status']=='needs_human_review';assert p['reviewAuthority']=='ai_candidate';assert p['evidenceLevel']=='E1';assert p['maximumClaimScope']=='G1';assert p['reviewRunIds']==[]
 assert p['goalFingerprint']==fp[id]['goalFingerprint']==np[id]['goalFingerprint'];assert fp[id]['visualization']==np[id]['visualization'];assert fp[id]['evidenceReview']==np[id]['evidenceReview'];assert fp[id]['description']==new[id]['description'];assert np[id]['description']==new[id]['description'];assert fp[id]['title']==new[id]['title']==np[id]['title']
 png=A/f'assets/biologie/{id}/{id}.png';actual=h(png);assert actual==fp[id]['visualization']['originalDigest'];assert fp[id]['visualization']['qaStatus']=='review_candidate';assert fp[id]['visualization']['approvedForPublication'] is False
 link=next(x for x in new[id]['resourceLinks'] if x.get('type')=='goal-visualization');assert link['url']==fp[id]['visualization']['url'];assert link['altText']==fp[id]['visualization']['altText']
 profiles.append({'goalId':id,'wholeScientificProfileExactlyRetained':True,'wholeBilingualCasesCount':len(materials[id]['cases']),'currentGoalFingerprint':p['goalFingerprint'],'currentPReviewInputFingerprint':p['reviewInputFingerprint'],'fullPageFingerprint':fp[id]['pageFingerprint'],'nativePageFingerprint':np[id]['pageFingerprint'],'nativeScopeAndPageNumberDistinctFromWhole394':True,'status':p['status'],'reviewAuthority':p['reviewAuthority'],'evidenceLevel':p['evidenceLevel'],'maximumClaimScope':p['maximumClaimScope']})
 images.append({'goalId':id,'path':str(png.relative_to(R)),'sha256':actual,'currentNativeAndWholeVisualizationExact':True,'actualAccessibleAltText':link['altText'],'generationWasNotApproval':True})
for id,p in deferredP.items():assert p==originalP[id]
sources=j(A/'sources/whole16-duties113-partners41-bodies.exact.json');assert len(sources)==16
edges=sum(len(x['allOriginalPartnerRows']) for x in sources);assert edges==113
partners={}
for x in sources:
 for g in x['wholeCurrentCanonicalPartners']:
  if g['id'] in partners:assert g==partners[g['id']]
  partners[g['id']]=g
assert len(partners)==41
for id,g in partners.items():assert g==old[id]
expectedBriefs=['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn']
for id,g in materials.items():
 assert len(g['cases'])==2; cases={x['id']:x for x in g['cases']}
 for b in g['profile']['applicationCaseBriefs']:
  c=cases[b['id']]
  assert b['taskDemandDe']==c['taskDe'];assert b['taskDemandEn']==c['taskEn'];assert b['expectedPerformanceDe']==c['workedSolutionDe'];assert b['expectedPerformanceEn']==c['workedSolutionEn']
  for key in ['materialDe','materialEn','taskDe','taskEn','workedSolutionDe','workedSolutionEn','freshTransferDe','freshTransferEn','freshTransferSolutionDe','freshTransferSolutionEn','limitsDe','limitsEn']:assert c[key].strip()
  assert set(g['profile']['coverageExpectations']['requiredExpectationIds'])=={x for y in c['rubric'] for x in y['expectationIds']}
# Calculate finite supplied scenarios independently; do not infer kinetic/BLAST values not supplied.
P=[0.0]
for s in [4,4,4,0,0]:P.append(.5*P[-1]+s/(1+P[-1]))
Q=[0.0]
for s in [4,4,4,0,0]:Q.append(.5*Q[-1]+s)
state=(0,0,0);delayed=[state]
for s in [1,1,0,0,0]:state=(s,state[0],state[1]);delayed.append(state)
state=(0,0,0);feedback=[state]
for s in [1]*6:state=(int(bool(s) and not state[2]),state[0],state[1]);feedback.append(state)
assert [round(x,3) for x in P[1:]]==[4.0,2.8,2.453,1.226,.613];assert Q[1:]==[4,6,7,3.5,1.75];assert delayed==[(0,0,0),(1,0,0),(1,1,0),(0,1,1),(0,0,1),(0,0,0)];assert feedback==[(0,0,0),(1,0,0),(1,1,0),(1,1,1),(0,1,1),(0,0,1),(0,0,0)]
U=set(range(31,116));removed=set(range(1,11));assert len(U)==85;assert not U&removed;trimmed={x-10 for x in U};assert trimmed==set(range(21,106))
ref='ACGT-ACGTACGT';query='ACGTTACGTACGT';assert len(ref)==len(query)==13;matches=sum(a==b for a,b in zip(ref,query));gaps=sum(a=='-' or b=='-' for a,b in zip(ref,query));assert matches==12 and gaps==1
image_ref=['A','C','G','T','A','C'];image_query=['A','C','-','T','T','C'];image_matches=[i+1 for i,(a,b) in enumerate(zip(image_ref,image_query)) if a==b];assert image_matches==[1,2,4,6]
receipt={'schemaVersion':1,'contentLicense':'CC-BY-4.0','reviewer':'/root/ci_current_run independent B','completedAt':datetime.now(timezone.utc).isoformat(),'role':'Actual targeted binding and independently recomputed finite-data proof; no source/course or active completion claim','goalBodyChanges':deltas,'all479WholeGoalBodiesPreservedApartFrom8ResourceLinks':True,'full394ChangedPages':page_deltas,'whole386UnchangedPageObjectsExact':True,'protected315NotReReviewedOrChanged':True,'currentEightPProfilesAndImages':profiles,'originalPAndWhole24BilingualCasesStructurallyBound':True,'fourDeferredWholeRecordsExact':True,'wholeSourceDuties':16,'wholePartnerEdges':edges,'wholePartnerBodies':len(partners),'wholePartnerBodiesExactlyUnchanged':True,'actualPNGBindings':images,'finiteRecomputations':{'negativeFeedbackUnroundedP0To5':P,'removedFeedbackP0To5':Q,'delayedTriplesT0To5':delayed,'negativeFeedbackTriplesT0To6':feedback,'dnaVariantFraction':8/20,'CPM_G_ControlTreatment':[100/1,200/2],'CPM_H_ControlTreatment':[50/1,300/2],'ngsFreshCPM_GH':[90/1,60/1],'localUOriginalBounds':[min(U),max(U)],'trimmedUBounds':[min(trimmed),max(trimmed)],'localULength':len(U),'localUIdentities':80,'localUIdentityPercent':80/85*100,'localUOriginalCoveragePercent':85/120*100,'localUTrimmedCoveragePercent':85/110*100,'noNewTrimmedEValueComputedOrClaimed':True,'constant120QueryTenfoldDBGivenTransferE':1e-12*10,'freshAlignmentMatches':matches,'freshAlignmentGapColumns':gaps,'freshAlignmentIdentityPercent':matches/13*100,'freshAlignmentScore':2*matches-2*gaps,'actualNewRasterAlignmentMatchesColumns':image_matches,'actualNewRasterGapColumn':3,'actualNewRasterMismatchColumn':5},'preservedHolds':e['preservedHolds'],'activeWrites':False,'newStrictCompletions':0,'humanApproval':False,'wholeOfficialCurriculumCoverageApproval':False}
(O/'current-input-bindings-and-finite-recalculations.independent.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print('Actual scoped bindings and finite recalculations PASS: 479 whole bodies,386 old pages,8 current P/PNG/native contexts,16 duties/113 edges/41 partners; strict gain0.')
