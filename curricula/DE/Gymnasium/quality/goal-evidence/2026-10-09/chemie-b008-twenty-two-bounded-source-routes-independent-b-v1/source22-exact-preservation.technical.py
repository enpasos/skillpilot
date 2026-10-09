import json,hashlib,datetime
from pathlib import Path
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR=BASE/'chemie-b008-current-twenty-six-native-preparation-author-v1/twenty-two-bounded-source-routes-author-v1'
OUT=BASE/'chemie-b008-twenty-two-bounded-source-routes-independent-b-v1'
def read(p):return json.loads(Path(p).read_text())
def digest(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def bind(p):p=Path(p);return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def pointer(d,p):
 for k in p.strip('/').split('/'):d=d[int(k)] if isinstance(d,list) else d[k.replace('~1','/').replace('~0','~')]
 return d
whole=read(AUTHOR/'whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json');partners=read(AUTHOR/'all-eighteen-whole-original-current-and-prospective-partners.neutral-input.json');ex=read(AUTHOR/'BY-twenty-two-whole-clause-bounded-routes.source-extraction.author-candidate.json');mp=read(AUTHOR/'BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json')
checks=[]
for f in whole['originalAllMappingInputsUnchanged']:
 a=bind(f['path']);checks.append({'path':f['path'],'exact':a['sha256']==f['sha256'] and a['bytes']==f['bytes'],'actual':a})
main=read(next(f['path'] for f in whole['originalAllMappingInputsUnchanged'] if 'bavaria_chemistry_' in f['path']));origex=read(main['sourceExtractionPath']);oindex={s['id']:s for s in origex['sourceGoals']};pindex={s['id']:s for s in origex['passages']};dindex={s['sourceGoalId']:s for s in main['decisions']}
clause=[]
for s in whole['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges']:
 oid=s['wholeOriginalSourceGoal']['id']; clause.append({'originalSourceGoalId':oid,'sourceWholeExact':s['wholeOriginalSourceGoal']==oindex[oid],'passageWholeExact':s['wholeOriginalPassage']==pindex[s['wholeOriginalPassage']['id']],'decisionWholeExact':s['wholeOriginalDecision']==dindex[oid],'allOriginalEdgesExact':s['wholeOriginalEdges']==[r for r in main['mappings'] if r['legacyGoalId']==oid]})
current=read(partners['currentCanonicalBinding']['path']);prospective=read(partners['prospectiveCanonicalBinding']['path']);ci={g['id']:g for g in current['goals']};pi={g['id']:g for g in prospective['goals']}
partnerChecks=[{'goalId':x['goalId'],'actualCurrentWholeExact':x['wholeActualCurrentGoal']==ci[x['goalId']],'actualProspectiveWholeExact':x['wholeInactiveProspectiveGoal']==pi[x['goalId']]} for x in partners['partners']]
old12=read(BASE/'chemie-b008-by12-ga-twelve-boundary-source-author-v1/twelve-bounded-BY12-GA-source-roles.author-candidate.json');old7=read(BASE/'chemie-b008-source19-remaining-seven-whole-author-v1/remaining-seven.whole-goal-profile-fourteen-cases.exact-input.json');old7v=read(BASE/'chemie-b008-source19-remaining-seven-whole-independent-b-v1/whole-seven.independent-b.first-verdict.immutable.json');old12i={r['prospectiveGoalId']:r for r in old12['rows']};old7i={r['wholeGoal']['id']:r for r in old7['entries']};old7src={(r['proposedChildGoalId'],r['sourceGoalId']):r for r in old7v['sourceResults']}
keys=['id','title','titleEn','description','descriptionEn','contains','requires','core','weight','level','phase','area','tags','dimensionTags']
reuses=[]
for gid in whole['existingPairedBoundedRoleGoalIds']:
 rows=[r for r in whole['selectedRoleRows'] if r['goalId']==gid];g=rows[0]['wholeCurrentProspectiveGoal']
 if gid in old12i:
  old=old12i[gid];ref=old['wholeGoalInput'];og=pointer(read(ref['file']['path']),ref['jsonPointer']);components=old['sourceComponents'];rs=[]
  for r in rows:
   oc=[s for s in components if s['originalSourceGoalId']==r['originalSourceGoalId'] and s['sourceSpan']==r['actualWholeOriginalOccurrence']['sourceSpan']];rs.append({'sourceSpan':r['actualWholeOriginalOccurrence']['sourceSpan'],'exactOccurrence':len(oc)==1 and r['actualWholeOriginalOccurrence']==oc[0]['exactReadOccurrence'],'limitedGA12':r['actualStage']=='SekII' and r['actualCourseLevel']=='GK' and r['actualWholeOriginalOccurrence']['topicCode']=='C12-GA.1','partial':r['matchType']=='partial'})
 else:
  og=old7i[gid]['wholeGoal'];rs=[]
  for r in rows:
   old=old7src[(gid,r['originalSourceGoalId'])];rs.append({'sourceSpan':r['actualWholeOriginalOccurrence']['sourceSpan'],'sourceWholeExact':digest(oindex[r['originalSourceGoalId']])==old['wholeSourceGoalPointer']['valueSha256'].removeprefix('sha256:'),'allOriginalPartnersExact':old['allOriginalEdges']==[e for e in main['mappings'] if e['legacyGoalId']==r['originalSourceGoalId']],'unchangedStageCourse':(r['actualStage'],r['actualCourseLevel'])==(('SekII','unspecified') if gid.startswith('e5a5') else ('SekI','unspecified')),'partial':r['matchType']=='partial'})
 reuses.append({'goalId':gid,'wholeSemanticAndStructureKeysExact':all(g.get(k)==og.get(k) for k in keys),'differentKeys':[k for k in keys if g.get(k)!=og.get(k)],'roleChecks':rs,'freshScientificReviewClaimed':False,'C11UnspecifiedSeparateHOLD':gid.startswith('e5a5')})
raw=read('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json')
originalRawBinding=bind('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json')
assert originalRawBinding['sha256']=='003c861d1a256aa981cfef2e4fc6e77d1eb16552ded9fb547d1301cd936bbaa8'
actual={'schemaVersion':1,'reviewer':'independent-b','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'exact preservation only; independent scientific verdict is separate','original33MappingInputs':checks,'whole49ClauseChecks':clause,'whole18PartnerChecks':partnerChecks,'old17RoleReuseChecks':reuses,'original332BYRows418EdgesRetained':{'binding':originalRawBinding,'rows':len(raw['decisions']),'edges':len(raw['mappings']),'bytesUnchanged':True},'currentEnergyFourReviewedMappingInheritedBeforeSource22':{'rows':len(main['decisions']),'edges':len(main['mappings']),'historicalDifferenceNote':'The already current energy-four mapping has416 edges vs historical418; two removals (7c68f201→9751b6d8,7b5310e2→597ac03c) precede Source22. Source22 modifies neither file. No new judgment on those energy-four rows.'},'new49Clause59Edges':{'sourceGoals':len(ex['sourceGoals']),'decisions':len(mp['decisions']),'edges':len(mp['mappings']),'allEdgesPartial':all(e['matchType']=='partial' for e in mp['mappings']),'reviewersNull':all(r['reviewer'] is None and r['reviewedAt'] is None for r in mp['decisions']),'allNoWholeClearance':all(r['wholeSourceClearance'] is False for r in mp['decisions'])},'activeWrites':0,'strictGain':0,'humanApproval':False}
path=OUT/'source22-exact-preservation.actual-independent-b.receipt.json';path.open('x').write(json.dumps(actual,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'receipt':bind(path),'mappingFailures':[c['path'] for c in checks if not c['exact']],'clauseFailures':[c for c in clause if not all(v for k,v in c.items() if k!='originalSourceGoalId')],'partnerFailures':[c for c in partnerChecks if not c['actualCurrentWholeExact'] or not c['actualProspectiveWholeExact']],'reuseSemanticDeltas':[r for r in reuses if not r['wholeSemanticAndStructureKeysExact']]},ensure_ascii=False))
