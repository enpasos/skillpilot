#!/usr/bin/env python3
import copy,json,pathlib,hashlib,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality'
O=Q/'goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-b-20261008-v1'
A=Q/'goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
B=Q/'goal-evidence/2026-10-07/biologie-flora-fauna20-current391-author-v1'
I=Q/'goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1'
def read(p):return json.loads(p.read_text())
def rows(p):return [json.loads(l)for l in p.read_text().splitlines()]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def stable(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
selected=read(I/'selected-twenty-author-images.exact.json')['images'];ids={x['goalId']for x in selected}
before=read(A/'candidate/canonical.before-twenty-links.exact.json')
after=read(A/'candidate/canonical.current474-twenty-new-raster-author.json')
before_map={g['id']:g for g in before['goals']};after_map={g['id']:g for g in after['goals']}
original=read(A/'current20-whole-DEEN-goals.actual.json')['goals'];original_map={g['id']:g for g in original}
assert len(before_map)==len(after_map)==474 and set(before_map)==set(after_map)
whole_goal_results=[]
for g in original:
 gid=g['id'];b=before_map[gid];a=copy.deepcopy(after_map[gid])
 original_links=b.get('resourceLinks',[])
 candidate_links=a.get('resourceLinks',[])
 other_b=[x for x in original_links if x.get('type')!='goal-visualization']
 other_a=[x for x in candidate_links if x.get('type')!='goal-visualization']
 assert other_b==other_a
 expected_image=[x for x in selected if x['goalId']==gid][0]
 new_links=[x for x in candidate_links if x.get('type')=='goal-visualization']
 assert len(new_links)==1 and new_links[0]['skillpilotId']==gid and new_links[0]['resourceType']=='image'
 assert new_links[0]['url']==f'/assets/goal-visualizations/biologie/{gid}/{gid}.png'
 a['resourceLinks']=original_links
 if 'resourceLinks'not in b:a.pop('resourceLinks')
 assert a==b and b==g, gid
 active=next(x for x in read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')['goals']if x['id']==gid)
 assert active==b, 'Current selected goal changed while independent review ran: '+gid
 whole_goal_results.append({'goalId':gid,'wholeBeforeAndOriginalCurrentAndLiveUnchanged':True,'wholeCandidateExceptApprovedNewResourceLinkUnchanged':True,'wholeGoalSha256':stable(g),'pngSha256':expected_image['sha256'],'actualUrl':new_links[0]['url']})
unrelated=[gid for gid in before_map if gid not in ids]
assert len(unrelated)==454
assert all(before_map[gid]==after_map[gid]for gid in unrelated)
bf=read(A/'native-raster-candidate/full391.before-twenty-links.pure.book-model.json')
af=read(A/'native-raster-candidate/full391.book-model.json')
bfm={p['goalId']:p for p in bf['pages']};afm={p['goalId']:p for p in af['pages']}
assert len(bfm)==len(afm)==391
unchanged_pages=[gid for gid in bfm if gid not in ids]
assert len(unchanged_pages)==371
assert all(bfm[x]['pageFingerprint']==afm[x]['pageFingerprint']for x in unchanged_pages)
authorP=rows(A/'native-raster-candidate/P20.actual-raster-author.review.jsonl')
ownP=rows(O/'P20.current-raster-independent-b.review.jsonl')
v4=read(Q/'goal-evidence/2026-10-07/biologie-flora-fauna20-targeted-P-remediation-root-author-v4/P20.targeted-one-answer.author-v4.candidates.json')['goals']
vm={r['goalId']:r for r in v4}
materials=read(A/'twenty-whole-goals-forty-common-DEEN-cases.exact-v4.json')['goals'];mm={g['goalId']:g for g in materials}
case_bindings=[]
for p,op in zip(authorP,ownP):
 gid=p['goalId'];assert p['profile']==op['profile']==vm[gid]['profile']
 assert p['profileFingerprint']==op['profileFingerprint']
 assert p['dissent']==op['dissent'][:len(p['dissent'])]
 assert p['status']==op['status']=='needs_human_review' and op['reviewAuthority']=='ai_candidate'
 assert op['evidenceLevel']=='E1' and op['maximumClaimScope']=='G1'
 assert mm[gid]['wholeGoal']==original_map[gid]
 cases=mm[gid]['cases'];briefs=p['profile']['applicationCaseBriefs'];assert len(cases)==len(briefs)==2
 for c,pb in zip(cases,briefs):
  assert c['id']==pb['id']
  for lang in ['de','en']:
   suffix=lang.capitalize()
   assert (c['material'][lang]+' '+c['task'][lang])==pb['taskDemand'+suffix],(gid,lang,'task demand')
   assert c['modelAnswer'][lang]==pb['expectedPerformance'+suffix],(gid,lang,'model answer')
  case_bindings.append({'goalId':gid,'caseId':c['id'],'wholeCaseSha256':stable(c),'dataStatus':c['dataStatus'],'bilingualFullMaterialTaskModelAnswerRead':True,'exactProfileCaseBinding':True})
Arows=rows(B/'retained-current-AM/A20.exact.rows.jsonl')
Mrows=rows(B/'retained-current-AM/M20.exact.rows.jsonl')
activeA={x['goalId']:x for x in rows(Q/'semantic-atomicity/canonical-biology-full.review.jsonl')}
activeM={x['goalId']:x for x in rows(Q/'memory-card-review/canonical-biology-full.review.jsonl')}
assert all(x==activeA[x['goalId']]for x in Arows)
assert all(x==activeM[x['goalId']]for x in Mrows)
assert len(Arows)==len(Mrows)==20 and all(x['status']=='atomic'for x in Arows)
cards=rows(B/'retained-current-AM/M20.exact.in-scope.cards.jsonl')
activecards={x['cardId']:x for x in rows(Q/'memory-card-review/canonical-biology-full.cards.review.jsonl')}
assert len(cards)==3 and all(c==activecards[c['cardId']]for c in cards)
decks=[]
for lang in ['de','en']:
 s=R/f'curricula/DE/Gymnasium/memory-decks/de_gymnasium_biology_flashcards_core.{lang}.json'
 p=R/f'app/public/data/de_gymnasium_biology_flashcards_core.{lang}.json'
 assert s.read_bytes()==p.read_bytes()
 decks.append({'locale':lang,'sourceSha256':sha(s),'publicSha256':sha(p),'bytesExact':True,'actualThreeFlowerCardBodies':[c for c in read(s)['cards']if c['id'] in ['biology_core_008','biology_core_009','biology_core_010']]})
conditional=read(B/'materials-scope-precision-v2/two-explicit-conditional-fish-choice-alternatives.author-v2.json')
assert len(conditional['cases'])==2
r={'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':0,'currentWholeGoalCount':474,'selectedWholeGoalCount':20,'unrelatedWholeGoalCountUnchanged':454,'nativeFullPageCount':391,'unrelatedWholePageFingerprintCountUnchanged':371,'fullOriginalV4ProfileBodiesAndFingerprintsRetained':20,'wholeBilingualCommonMaterialTaskModelAnswerBindings':40,'conditionalFishAlternatives':2,'conditionalFishAlternativesNotAdditionalRequiredCommonCases':True,'retainedOriginalARows':20,'retainedOriginalMRows':20,'retainedFlowerCardRows':3,'memoryEvidenceScope':'Native shared-deck closure validation uses the existing 17-card deck and seven additional existing card-origin goals; these retained histories are not re-reviewed or promoted by this B review.','wholeGoalResults':whole_goal_results,'caseBindings':case_bindings,'retainedSourceAndPerformanceDissentExactPrefixes':True,'actualUnchangedThreeFlowerDEENCards':decks,'humanApproval':False,'activeWrites':0,'errors':[]}
(O/'whole-goal-case-profile-retained-AM-bindings.independent-b.actual.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:r[k]for k in ['exitCode','selectedWholeGoalCount','unrelatedWholeGoalCountUnchanged','unrelatedWholePageFingerprintCountUnchanged','fullOriginalV4ProfileBodiesAndFingerprintsRetained','wholeBilingualCommonMaterialTaskModelAnswerBindings','retainedOriginalARows','retainedOriginalMRows','retainedFlowerCardRows','errors']}))

