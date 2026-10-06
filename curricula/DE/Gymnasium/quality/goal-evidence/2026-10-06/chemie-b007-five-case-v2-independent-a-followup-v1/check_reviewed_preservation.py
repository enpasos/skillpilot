#!/usr/bin/env python3
"""Independent A follow-up audit; writes only this new evidence directory.
SPDX-License-Identifier: Apache-2.0
"""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
BASE = REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
V1 = BASE/'chemie-b007-three-safety-solutions-source-boundary-author-v1'
V2 = BASE/'chemie-b007-seven-routines-four-material-corrections-author-v2'
OLD_A = BASE/'chemie-b007-seven-routines-fourteen-cases-independent-a-v1'
EXPECTED = 'e86359b0cea958c6964ad801945810c4621d2a542f426e69e5e92ad1cc303357'

def read(p): return json.loads(p.read_text())
def bind(p):
    b=p.read_bytes()
    return {'path':str(p.relative_to(REPO)),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def verify(e):
    a=bind(REPO/e['path'])
    return {**a,'expectedSha256':e['sha256'],'expectedBytes':e['bytes'],
            'exact':a['sha256']==e['sha256'] and a['bytes']==e['bytes']}
def raw_objects(path, array_key, identity_key):
    """Retain each entire actual JSON object, including its internal whitespace."""
    text=path.read_text()
    marker='"'+array_key+'": ['
    pos=text.index(marker)+len(marker)
    decoder=json.JSONDecoder()
    result={}
    while True:
        while text[pos].isspace() or text[pos]==',': pos+=1
        if text[pos]==']': break
        obj,end=decoder.raw_decode(text,pos)
        raw=text[pos:end].encode()
        result[obj[identity_key]]={'object':obj,'raw':raw,'sha256':sha256(raw).hexdigest(),'bytes':len(raw)}
        pos=end
    return result

freeze_path=V2/'targeted-materials.author-v2.final.freeze.json'
freeze=read(freeze_path)
v2_checks=[verify(e) for e in freeze['files']+freeze['inputBindings']]
v1_freeze=read(V1/'seven-routines-and-fourteen-cases.author.final.freeze.json')
v1_checks=[verify(e) for e in v1_freeze['files']+v1_freeze['externalInputBindings']]
old_a_checks=[verify(e) for e in read(OLD_A/'independent-a.final.freeze.json')['files']]
old_cases=raw_objects(V1/'authored-case-materials-v1/cases.de-en.author-candidate.json','cases','caseLocalKey')
new_cases=raw_objects(V2/'cases.de-en.author-candidate.json','cases','caseLocalKey')
old_routines=raw_objects(V1/'seven-routines.de-en.author-candidate.json','prototypes','localKey')
new_routines=raw_objects(V2/'seven-routines.de-en.author-candidate.json','prototypes','localKey')

def object_comparisons(old,new):
    assert old.keys()==new.keys()
    return [{'localKey':k,'v1RawObjectSha256':old[k]['sha256'],'v2RawObjectSha256':new[k]['sha256'],
             'v1RawObjectBytes':old[k]['bytes'],'v2RawObjectBytes':new[k]['bytes'],
             'wholeRawObjectByteExact':old[k]['raw']==new[k]['raw'],
             'wholeParsedObjectExact':old[k]['object']==new[k]['object']} for k in old]

case_comparisons=object_comparisons(old_cases,new_cases)
routine_comparisons=object_comparisons(old_routines,new_routines)
old_card_path=V1/'authored-case-materials-v1/primary-cards.de-en.author-candidate.json'
new_card_path=V2/'primary-cards.de-en.author-candidate.json'
card_exact=old_card_path.read_bytes()==new_card_path.read_bytes()
unchanged_cases=[r['localKey'] for r in case_comparisons if r['wholeRawObjectByteExact']]
changed_cases=[r['localKey'] for r in case_comparisons if not r['wholeRawObjectByteExact']]
unchanged_routines=[r['localKey'] for r in routine_comparisons if r['wholeRawObjectByteExact']]
changed_routines=[r['localKey'] for r in routine_comparisons if not r['wholeRawObjectByteExact']]
assert len(unchanged_cases)==9 and len(changed_cases)==5
assert len(unchanged_routines)==6 and changed_routines==['label']
assert card_exact
semantic_fields=['id','title','titleEn','description','descriptionEn','requiresAuthorProposal']
semantic_exact=[{'localKey':k,'fieldsChecked':semantic_fields,
                 'exact':all(old_routines[k]['object'][f]==new_routines[k]['object'][f] for f in semantic_fields)}
                for k in old_routines]
arithmetic_comparisons=[{'caseLocalKey':k,
                        'calculationAuditExact':old_cases[k]['object'].get('calculationAudit')==new_cases[k]['object'].get('calculationAudit')}
                       for k in old_cases]
old_prior_receipt=read(OLD_A/'input-byte-and-arithmetic-checks.actual.json')
case_statuses=[{'caseLocalKey':k,'candidateOnly':v['object']['recordStatus']=='ai_candidate' and v['object']['validationStatus']=='needs_human_review',
               'E1G1':v['object']['evidenceLevel']=='E1' and v['object']['generalizationLevel']=='G1',
               'noHumanNativeLearnerClaim':not any(v['object'][f] for f in ['humanApproval','humanTrial','nativeProfileBound','actualLearnerPerformanceRecorded'])}
              for k,v in new_cases.items()]
receipt={
 'schemaVersion':1,'licenseExpression':'Apache-2.0','createdAtUTC':datetime.now(timezone.utc).isoformat(),
 'reviewer':'independent A; own v1 findings followed up without reading B conclusions',
 'authorV2Freeze':{**bind(freeze_path),'expectedSha256':EXPECTED,'exact':bind(freeze_path)['sha256']==EXPECTED},
 'authorV2FileAndInputChecks':v2_checks,'originalAuthor10Plus62Checks':v1_checks,
 'ownOldAArtifactChecks':old_a_checks,'caseObjectComparisons':case_comparisons,
 'routineObjectComparisons':routine_comparisons,'allSevenSemanticFieldsExact':semantic_exact,
 'newCardFileBinding':bind(new_card_path),'priorCardFileBinding':bind(old_card_path),
 'wholeCardFileByteExact':card_exact,'wholeCardsUnchanged':len(read(new_card_path)['cards']),
 'changedCases':changed_cases,'unchangedWholeCases':unchanged_cases,
 'changedRoutines':changed_routines,'unchangedWholeRoutines':unchanged_routines,
 'arithmeticAuditComparisons':arithmetic_comparisons,
 'priorIndependentArithmeticReceiptBinding':bind(OLD_A/'input-byte-and-arithmetic-checks.actual.json'),
 'priorIndependentArithmeticChecksRemainApplicable':all(x['calculationAuditExact'] for x in arithmetic_comparisons),
 'priorIndependentArithmeticCheckCount':len(old_prior_receipt['arithmeticChecks']),
 'caseStatusChecks':case_statuses,
 'requiredCriteriaActuallyPresent':sum(q['required'] for c in new_cases.values() for q in c['object']['assessmentCriteria']),
 'allByteChecksExact':all(r['exact'] for r in v2_checks+v1_checks+old_a_checks),
 'allSevenSemanticFieldsUnchanged':all(r['exact'] for r in semantic_exact),
 'all403SourceObligationsCleared':False,'activeWrites':False,'strictCompletionsAdded':0,
 'nativeGateApproval':False,'humanApproval':False,'humanTrial':False,
}
assert receipt['authorV2Freeze']['exact'] and receipt['allByteChecksExact']
(OWN/'current-byte-and-preservation-checks.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['changedCases','unchangedWholeCases','changedRoutines','unchangedWholeRoutines','wholeCardFileByteExact','wholeCardsUnchanged','requiredCriteriaActuallyPresent','allByteChecksExact','allSevenSemanticFieldsUnchanged']},ensure_ascii=False))
