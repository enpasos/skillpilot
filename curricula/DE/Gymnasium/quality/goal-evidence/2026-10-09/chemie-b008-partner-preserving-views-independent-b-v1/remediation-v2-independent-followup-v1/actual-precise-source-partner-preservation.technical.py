# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from collections import Counter
import hashlib, json

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1')
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-partner-preserving-views-independent-b-v1/remediation-v2-independent-followup-v1')
def read(p):return json.loads(Path(p).read_bytes())
def binding(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
entry=read(BASE/'source-view-remediation-author-v2/neutral-five-bounded-current-source-course-view-remedies.author.entry.json')
corrections=read(entry['newFiveSourcePartnerAndCourseCandidates']['path'])
original=read(corrections['originalCanonical']['path']);candidate=read(entry['candidateCanonical']['path'])
expected=json.loads(json.dumps(original))
for delta in entry['onlyTwoCanonicalApplicabilityFieldDeltas']:
 g=next(g for g in expected['goals']if g['id']==delta['goalId']);assert g['applicability']['jurisdiction']==delta['before'];g['applicability']['jurisdiction']=delta['after']
assert expected==candidate
matrix=read(entry['wholeOriginal35Occurrence106DutyAndPartnerInput']['path'])
mapping_rows=[]
for i,b in enumerate(corrections['mappingCandidateBindings']):
 before=read(b['original']['path']);after=read(b['operativeCandidate']['path']);target=corrections['partnerCorrections'][i]
 sourceid=target['wholeBeforeDecision']['sourceGoalId'];bd={d['sourceGoalId']:d for d in before['decisions']};ad={d['sourceGoalId']:d for d in after['decisions']}
 assert bd.keys()==ad.keys()
 assert [k for k in bd if bd[k]!=ad[k]]==[sourceid]
 assert bd[sourceid]==target['wholeBeforeDecision'];assert ad[sourceid]==target['wholeAfterDecisionCandidate']
 assert ad[sourceid]['canonicalGoalIds']==bd[sourceid]['canonicalGoalIds']+[target['wholeNewPartnerGoalUnchanged']['id']]
 assert ad[sourceid]['reviewer']is None and ad[sourceid]['reviewedAt']is None
 bc=Counter(stable(x)for x in before['mappings']);ac=Counter(stable(x)for x in after['mappings']);assert not(bc-ac)
 new_edges=list((ac-bc).elements());assert len(new_edges)==1
 new_edge=json.loads(new_edges[0]);assert new_edge['legacyGoalId']==sourceid and new_edge['canonicalGoalId']==target['wholeNewPartnerGoalUnchanged']['id']
 mapping_rows.append({'original':binding(b['original']['path']),'candidate':binding(b['operativeCandidate']['path']),'changedSourceId':sourceid,'originalDecisionCount':len(bd),'allOtherWholeDecisionsExact':True,'allOriginalMappingEdgesRetained':True,'oneNewDeclaredSourceEdge':new_edge,'newMetadataIsUnreviewed':True})
throw=matrix['entries'][29]['wholeOriginalSourceDutiesAndPartnerContexts'][0]
th_original=read(throw['extractionBinding']['path']);th_candidate=read(entry['THWholeSourceExtraction']['path']);th_expected=json.loads(json.dumps(th_original))
for d in entry['twoTHSourceCourseCorrections']:
 old=next(g for g in th_expected['sourceGoals']if g['id']==d['goalId']);assert old==d['wholeBeforeSourceGoal']
 after=d['wholeCurrentPrimaryColumnFaithfulSourceGoalCandidate'];assert {k:v for k,v in old.items()if k not in ['courseLevel','tags']}=={k:v for k,v in after.items()if k not in ['courseLevel','tags']}
 old.clear();old.update(after)
assert th_expected==th_candidate
thmb=read(throw['mappingBinding']['path']);thma=read(entry['THUnchangedWholeMappingWithNewSourcePointer']['path']);thexpected=json.loads(json.dumps(thmb));thexpected['sourceExtractionPath']=entry['THWholeSourceExtraction']['path'];assert thexpected==thma
primary=read(OWN/'actual-own-whole-primary-pages.reading-input.json');portable=read(entry['newWholePrimaryPageInputs']['path']);actual={r['actualOriginalPDF']['path']:r for r in primary['actualPrimaryRows']}
primary_rows=[]
for r in portable['wholeOriginalPDFAndWholePrimaryPageInputs']:
 p=r['actualOriginalPDF']['path'];assert binding(p)==r['actualOriginalPDF'];ar=actual[p]
 for q in r['actualWholePages']:
  aq=next(x for x in ar['actualWholePages']if x['physicalPage1Based']==q['physicalPage1Based']);assert aq['wholePageText'].strip()==q['wholePageText'].strip()
  primary_rows.append({'originalPDF':binding(p),'physicalPage1Based':q['physicalPage1Based'],'actualWholeTextMatchesPortableApartFromTrailingWhitespace':True})
out={'schemaVersion':1,'role':'Actual narrow technical preservation after whole scientific source/partner reading; no scientific approval inferred from equality','canonicalCount':len(candidate['goals']),'exactlyTwoApplicabilityJurisdictionDeltas':entry['onlyTwoCanonicalApplicabilityFieldDeltas'],'allOtherWholeCanonicalFieldsExact':True,'mappingChecks':mapping_rows,'THExactlyTwoSourceCourseAndTagsDeltas':True,'THAllWholeTextOperatorAndPartnerRowsRetained':True,'THAllMappingDecisionsAndEdgesExactExceptInputPointer':True,'actualPrimaryPortableEightPagesCompared':primary_rows,'originalWholeSource106InputBinding':binding(entry['wholeOriginal35Occurrence106DutyAndPartnerInput']['path']),'allUnchangedFirstScientificJudgmentsRemainOriginalOnly':True,'scopeApproval':False,'strictGain':0,'humanApproval':False,'activeWrites':[]}
(OWN/'actual-precise-source-partner-preservation.receipt.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'canonicalGoalCount':len(candidate['goals']),'onlyTwoJurisdictionFields':True,'originalSourceEdgesRetained':True,'newEdges':3,'THOnlyTwoCourseTagsDeltas':True,'actualPrimaryPagesMatched':len(primary_rows),'errors':[]}))
