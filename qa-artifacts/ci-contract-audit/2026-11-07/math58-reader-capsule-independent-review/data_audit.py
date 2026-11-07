"""Finite read-only audit of the exact Math58 candidate and its original/supplement records."""
import collections,datetime,hashlib,json,struct
from pathlib import Path
R=Path(__file__).resolve().parents[4];O=Path(__file__).resolve().parent
P=R/'qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-integration-candidate'
D=Path('/mnt/e/skillpilot-qa-artifacts/2026-11-07/math58-reader-capsule-integration-20261107')
A=Path('/dev/shm/math58-reader-capsule-integration-20261107')
sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda p:json.loads(p.read_bytes())
canonical=lambda v:json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
assert sha((P/'PATCH-FILES.json').read_bytes())=='68f18d1e45afdab825fcc8495970223cfb601227ad6e0e20a44241b53e3bd701'
patch=load(P/'PATCH-FILES.json'); preguards=[]
for item in patch:
 assert sha((P/'candidate'/item['path']).read_bytes())==item['afterSha256']
 assert sha((A/'candidate'/item['path']).read_bytes())==item['afterSha256']
 if item['beforeSha256']:
  assert sha((R/item['path']).read_bytes())==item['beforeSha256']; preguards.append(item['path'])
pins=load(P/'candidate/contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json')
index=load(P/'candidate/contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json')
old=load(R/'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json')
assert index['rows'][:74]==old['rows'];assert len(index['rows'])==132
assert len({(r['landscapeId'],r['goalId'])for r in index['rows']})==132
assert set(r['goalId']for r in index['rows'][74:])==set(pins['selection']['goalIds'])
assert sha((R/pins['selection']['path']).read_bytes())==pins['selection']['sha256']
assert sha((R/pins['source']['path']).read_bytes())==pins['source']['sha256']
source=load(R/pins['source']['path']); goals={g['id']:g for g in source['goals']}
resolved={};total=0
def bytes_for(ref):
 path=ref['path']
 if path in resolved: raw=resolved[path]
 else:
  existing=[root/path for root in [P/'candidate',D/'working',A/'working',R] if (root/path).is_file()]
  matches=[p for p in existing if sha(p.read_bytes())==ref['sha256']]
  assert matches,('No exact current bytes',path)
  raw=matches[0].read_bytes();resolved[path]=raw
 assert sha(raw)==ref['sha256']
 if 'bytes'in ref:assert len(raw)==ref['bytes']
 return raw
for ref in index['currentReferences']:total+=len(bytes_for(ref))
assert len(index['currentReferences'])==408
result=[];availability=collections.Counter();actors=collections.Counter();view_count=0
for binding in pins['goalBindings']:
 gid=binding['goalId'];g=goals[gid]
 receipt=load(P/'candidate'/next(r['receipt']['path']for r in index['rows']if r['goalId']==gid))
 assert receipt['reviewedAt']==binding['originalReviewedAt'] and receipt['reviewer']==binding['originalReviewer']
 for key in ['originalReview','originalInput']:
  assert sha((R/binding[key]['path']).read_bytes())==binding[key]['sha256']
 review=load(R/binding['originalReview']['path']); inp=load(R/binding['originalInput']['path'])
 original=next(r for r in review['records']if r['goalId']==gid)
 oldgoal=next(r for r in inp['records']if r.get('goalId')==gid) if binding['profile']=='math-current62-with-current-viewports-v1' else original['previousGoal']
 family='current62' if binding['profile']=='math-current62-with-current-viewports-v1' else 'independentTen'
 for field in ['titleEn','level','demandLevel']:
  availability[family+':'+field+':'+str(field in oldgoal)]+=1
 availability[family+':nestedDemand:'+str('demandLevel'in oldgoal.get('dimensionTags',{}))]+=1
 for field in ['title','description','descriptionEn']:assert oldgoal[field]==g[field]
 if 'titleEn'in oldgoal:assert oldgoal['titleEn']==g['titleEn']
 cr=json.loads(bytes_for(binding['currentReview']));ci=json.loads(bytes_for(binding['currentInput']));browser=json.loads(bytes_for(binding['browser']))
 sight=cr if binding['boxplotV2'] else next(r for r in cr['rows']if r['goalId']==gid)
 full=cr['wholeCurrentGoal'] if binding['boxplotV2'] else next(r for r in ci['rows']if r['goalId']==gid)['wholeCurrentGoal']
 assert full==g and sha(canonical(g))==binding['wholeCurrentGoalCanonicalSha256']==sight['wholeCurrentGoalCanonicalSha256']
 assert sight['fullCurrentDE']=={k:g[k]for k in ['title','description']}
 assert sight['fullCurrentEN']=={'title':g['titleEn'],'description':g['descriptionEn']}
 assert sight['currentDemandLevel']==g['dimensionTags']['demandLevel'] and sight['currentPhase']==g['dimensionTags']['phase'] and sight['currentLevel']==g.get('level')
 assert sight['humanApproved'] is False and sight['imageAuthorIsReviewer'] is False
 assert sight['reviewer']==binding['currentReviewer'] and sight['reviewedAtActualUTC']==binding['currentReviewedAt']
 actors[sight['reviewer']]+=1
 assert {v['widthCSS'] for v in sight['currentViewportEvidence']}=={360,680}
 for view in sight['currentViewportEvidence']:
  width=view['widthCSS'];v=next(x for x in binding['views']if x['widthCSS']==width)
  assert view['actualViewed'] is True and view['sightedBy']==sight['reviewer']
  assert (view.get('sightedAtActualUTC')or view.get('reviewedAtActualUTC'))==binding['currentReviewedAt']
  dt=lambda s:datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
  assert dt(binding['currentReviewedAt'])>=dt(view['capturedAtActualUTC'])>dt(binding['originalReviewedAt'])
  png=bytes_for(v['screenshot']);assert png[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>I',png[16:20])[0]==width
  assert sha(png)==view['screenshot']['sha256'];view_count+=1
 if binding['firstTimeClarification']:
  clarification=json.loads(bytes_for(binding['firstTimeClarification']));assert clarification['immutablePriorReviewChanged'] is False
  assert clarification['field']=='actualSightStartedAtUTC' and clarification['priorReviewSha256']==(binding['normalReviewForAudit'] if binding['boxplotV2'] else binding['currentReview'])['sha256']
 result.append({'goalId':gid,'profile':binding['profile'],'wholeCurrentGoalEqual':True,'oldOriginalFieldsPreserved':True,'newViewportViews':2,'currentReviewer':binding['currentReviewer'],'currentReviewedAt':binding['currentReviewedAt'],'boxplotV2':binding['boxplotV2']})
report={'patchFilesChecked':len(patch),'activeCodePreguardsUnchanged':preguards,'old74RowsExactlyRetained':True,'old74Overlap':0,'newDistinctGoals':len(result),'currentReferencesChecked':len(index['currentReferences']),'currentReferencePathBytes':total,'currentReferenceUniqueHashes':len({r['sha256']for r in index['currentReferences']}),'currentReferenceUniqueContentBytes':sum({r['sha256']:r['bytes']for r in index['currentReferences']}.values()),'currentWholeGoalMatches':len(result),'actualSupplementViewportRows':view_count,'originalFieldAvailability':dict(availability),'actualReviewActors':dict(actors),'rows':result,'sourceAProbeExecuted':False,'newImageReviewsClaimedByThisAudit':0,'scope':'Record/code/binding review; sampled360px boxplot pixels seen; no replacement of the58 original sight reviews'}
(O/'data-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items()if k!='rows'},ensure_ascii=False,indent=2))
