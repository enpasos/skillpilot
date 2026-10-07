"""Bind independently read complete cases to the actual positive-profile bodies."""
import hashlib
import json
from pathlib import Path
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-current391-independent-b-20261007-v1')
AUTHOR=BASE.parent/'biologie-ecology20b-current391-author-v1'
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
ref=lambda p:{'path':str(p),'sha256':sha(p),'bytes':Path(p).stat().st_size}
material_path=AUTHOR/'materials-revision-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json'
profile_path=AUTHOR/'P20.current-text-preimage.author.candidates.json'
record_path=AUTHOR/'P20.current-text-preimage.author.review.jsonl'
materials=read(material_path)['goals'];profiles=read(profile_path)['goals']
records={r['goalId']:r for r in map(json.loads,record_path.read_text().splitlines())}
science=read(BASE/'twelve-whole-DEEN-goal-and-case-science-first.independent-b.json')
ids={r['goalId'] for r in science['judgments']}
checked=[]
for material,p in zip(materials,profiles):
    assert material['goalId']==p['goalId']
    if p['goalId'] not in ids:continue
    profile=p['profile'];record=records[p['goalId']]
    assert profile==record['profile']
    assert len(profile['expectations'])==2
    assert profile['coverageExpectations']=={
       'requiredExpectationIds':[x['id'] for x in profile['expectations']],
       'alternativeExpectationGroups':[], 'minimumIndependentDemonstrations':2,
       'freshVariationRequired':True,'independentTransferRequired':True}
    assert record['status']=='needs_human_review'
    assert record['reviewAuthority']=='ai_candidate' and record['evidenceLevel']=='E1'
    assert record['maximumClaimScope']=='G1' and record['reviewRunIds']==[]
    assert p['dissent']==record['dissent']
    for case,brief,expectation in zip(material['cases'],profile['applicationCaseBriefs'],profile['expectations']):
       assert case['id']==brief['id']
       for language,suffix in [('de','De'),('en','En')]:
          assert brief['taskDemand'+suffix]==case['material'][language]+' '+case['task'][language]
          assert brief['expectedPerformance'+suffix]==case['modelAnswer'][language]
          assert expectation['observablePerformance'+suffix]==case['task'][language]
          assert brief['understandingFocus'+suffix]==' '.join(x['essentialUnderstanding'+suffix] for x in profile['expectations'])
    extension=material.get('courseBoundConditionalExtension')
    if extension:
       assert len(profile['applicationCaseBriefs'])==3
       brief=profile['applicationCaseBriefs'][2];case=extension['wholeConditionalCase']
       assert brief['id'] not in {x['id'] for x in material['cases']}
       assert 'BY13-EA' in brief['taskDemandDe'] and 'BY13 EA' in brief['taskDemandEn']
       assert 'keine gemeinsame GK-Pflicht' in brief['taskDemandDe']
       assert 'no common basic-course obligation' in brief['taskDemandEn']
       for language,suffix in [('de','De'),('en','En')]:
          assert brief['taskDemand'+suffix].endswith(case['material'][language]+' '+case['task'][language])
          assert brief['expectedPerformance'+suffix]==case['modelAnswer'][language]
    else:assert len(profile['applicationCaseBriefs'])==2
    checked.append({'goalId':p['goalId'],
       'wholeNativePositiveProfileContentScientificVerdict':'PASS',
       'bothWholeDEENBodiesExactToOwnReadCases':True,
       'uniqueEssentialUnderstandingAndVariationAxesActuallyRead':True,
       'archetypeAppropriateForWholeGoal':'PASS',
       'truthfulE1G1AiCandidateAndDissentsRetained':True,
       'conditionalBYEAExtensionOnly':bool(extension),
       'actualRasterAndNativeFinalFingerprintsStillPending':True})
assert len(checked)==12
out=BASE/'twelve-native-whole-positive-profile-content.independent-b.actual.json'
out.write_text(json.dumps({'actualTechnicalBodyAudit':True,
    'inputMaterials':ref(material_path),'inputProfiles':ref(profile_path),
    'inputRecords':ref(record_path),'rows':checked,
    'ownScientificReviewBasis':'Own independently sealed whole-goal/whole-case science, plus actual reading of all unique native expectations, coverage conditions, variation axes and source/performance dissents. Body comparisons retain the whole previously read DE/EN text; no science inferred from fingerprints.',
    'conditionalIdentityNoteResolved':'Distinct native extension Brief-ID already exists. Both common cases stay complete and required; separate LV text explicitly only BY13 EA4.1. Nested material id does not overwrite a common profile case.',
    'eightOtherGoalsStillSOURCEHOLD':True,
    'nativeFinalD12P12V12Approval':False,'strictGain':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'PASS':'whole12 P-content and24 DEEN common-body audit','finalRasterAndNativeBinding':'PENDING','strictGain':0}))
