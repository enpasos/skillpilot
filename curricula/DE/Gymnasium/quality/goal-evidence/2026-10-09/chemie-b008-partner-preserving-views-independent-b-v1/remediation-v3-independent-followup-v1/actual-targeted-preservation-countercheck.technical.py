# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from collections import Counter
import hashlib,json,copy
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/source-view-remediation-author-v3')
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-partner-preserving-views-independent-b-v1/remediation-v3-independent-followup-v1')
def read(p):return json.loads(Path(p).read_bytes())
def bind(p):
 b=Path(p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def exact_binding(b):
 a=bind(b['path']);assert a['sha256']==b['sha256'].removeprefix('sha256:') and a['bytes']==b['bytes'];return a
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
seal=read(BASE/'three-secondary-one-EN-one-MV-author-remediation-v3.first.freeze.json')
sealed=[exact_binding(b)for b in seal['files']]
packet=read(BASE/'three-secondary-partial-source-companions-four-view-occurrences.author-candidates.json')
proof=read(BASE/'actual-three-secondary-one-EN-one-MV-profile.normal-contract-proof.json')
before=read(proof['beforeAuthorCanonical']['path']);after=read(proof['canonical']['path']);expected=copy.deepcopy(before)
redox='2fdd759f-8349-5f7e-b29a-6ac7fb0299f9';bg=next(g for g in expected['goals']if g['id']==redox);ag=next(g for g in after['goals']if g['id']==redox)
assert bg['descriptionEn']!=ag['descriptionEn'];bg['descriptionEn']=ag['descriptionEn'];assert expected==after
rows=[]
for r in packet['newMappings']:
 old=read(r['priorAuthorMappingBeforeTargetedSecondary']['path']);new=read(r['candidateMapping']['path'])
 bd={d['sourceGoalId']:d for d in old['decisions']};ad={d['sourceGoalId']:d for d in new['decisions']};assert bd.keys()==ad.keys()
 delta=[i for i in bd if bd[i]!=ad[i]];assert len(delta)==1;s=delta[0]
 assert ad[s]['historicalWholeDecisionBeforeNewSecondaryPartialRole']==bd[s]
 assert ad[s]['canonicalGoalIds']==bd[s]['canonicalGoalIds']+['16b24dc5-0e48-5e3b-8307-01289db8d1a9']
 assert ad[s]['reviewer']is None and ad[s]['reviewedAt']is None
 bc=Counter(stable(x)for x in old['mappings']);ac=Counter(stable(x)for x in new['mappings']);assert not(bc-ac);extras=list((ac-bc).elements());assert len(extras)==1;e=json.loads(extras[0]);assert e['legacyGoalId']==s and e['canonicalGoalId']=='16b24dc5-0e48-5e3b-8307-01289db8d1a9' and e['matchType']=='partial'
 outside={k:v for k,v in old.items()if k not in ('decisions','mappings','sourceExtractionPath')};assert outside=={k:v for k,v in new.items()if k not in ('decisions','mappings','sourceExtractionPath')}
 rows.append({'jurisdiction':r['jurisdiction'],'actualBefore':bind(r['priorAuthorMappingBeforeTargetedSecondary']['path']),'actualAfter':bind(r['candidateMapping']['path']),'sourceGoalId':s,'unchangedOtherDecisions':len(bd)-1,'allOldEdgesExact':True,'oldEdgeCount':len(old['mappings']),'exactOneNewPartialEdge':e,'allOriginalPartnerIdsOrderedAndRetained':bd[s]['canonicalGoalIds'],'newInputPointer':new['sourceExtractionPath']})
snold=read('curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_CHEMIE_SEKII_LEHRPLAN_GYMNASIUM_2025.source-extraction.json');snnew=read(BASE/'SN-upper-one-actual-secondary-source-physical57-locator.source-extraction.author-candidate.json');snexpected=copy.deepcopy(snold)
sid=packet['corrections'][1]['newPartialRole']['sourceGoalId'];sg=next(g for g in snexpected['sourceGoals']if g['id']==sid);ng=next(g for g in snnew['sourceGoals']if g['id']==sid)
assert set(ng)-set(sg)=={'extendedData'};assert {k:v for k,v in sg.items()if k not in ['sourceRef','sourceSpan']}=={k:v for k,v in ng.items()if k not in ['sourceRef','sourceSpan','extendedData']}
sg.update({k:ng[k]for k in ['sourceRef','sourceSpan','extendedData']});assert snexpected==snnew
partners_path=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/twenty-two-bounded-source-routes-author-v1/all-eighteen-whole-original-current-and-prospective-partners.neutral-input.json');partnerpacket=read(partners_path)
print('partnerpacket fields',list(partnerpacket))
partnerrows=partnerpacket.get('partners',partnerpacket.get('wholePartners',partnerpacket.get('entries',[])))
reuse=[]
for gid in ['b6327e98-8ab9-5d7f-b826-4023bc1a56a7','49b13b33-1f2c-5fa5-bb43-f84754032145']:
 matches=[r for r in partnerrows if r.get('goalId')==gid]
 if not matches:continue
 r=matches[0];g=next(g for g in after['goals']if g['id']==gid);assert r['wholeInactiveProspectiveGoal']==g;reuse.append({'goalId':gid,'fullPreviouslyReadGoalValueExact':True,'wholeBody':r['wholeInactiveProspectiveGoal']})
receipt={'schemaVersion':1,'role':'Own B actual targeted countercheck after complete source, bilingual goal and partner reading; technical equality does not approve source operators','authorFirstActualFilesBound':len(sealed),'authorFirstBindings':sealed,'canonicalBefore':bind(proof['beforeAuthorCanonical']['path']),'canonicalAfter':bind(proof['canonical']['path']),'exactlyOneRedoxDescriptionEnDelta':True,'other503WholeGoalsExact':True,'allDescriptionDERequiresImagesAndOtherFieldsExact':True,'mappingChecks':rows,'newSourceEdges':3,'SNExactlyOneGoalLocatorOnlyChanged':True,'SNHistorical56KeptActual57Printed45Witness':ng['extendedData'],'wholeSourceDutyOperatorTextKept':True,'previouslyActuallyReadGenericPartnerReuse':{'input':bind(partners_path),'wholeGoals':reuse},'sourceScientificApproval':False,'nativeApproval':False,'strictGain':0,'humanApproval':False,'activeWrites':[]}
(OWN/'actual-targeted-preservation-countercheck.receipt.json').open('x').write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'authorSealActualFiles':len(sealed),'exactOneEN':True,'preservedOtherGoals':503,'newPartialEdges':3,'SNOneLocator':True,'partnerReuseIds':[r['goalId']for r in reuse]}))
