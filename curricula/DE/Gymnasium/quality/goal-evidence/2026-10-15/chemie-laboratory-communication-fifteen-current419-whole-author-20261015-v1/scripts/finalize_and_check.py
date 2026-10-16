#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded format/arithmetic/input checks. No scientific approval or integration."""
import hashlib
import importlib.util
import json
import sys
from fractions import Fraction
from pathlib import Path

ROOT=Path.cwd()
sys.dont_write_bytecode=True
OUT=Path(__file__).resolve().parents[1]
REL=OUT.relative_to(ROOT).as_posix()
def read(p):return json.loads((ROOT/p).read_text())
def own(p):return json.loads((OUT/p).read_text())
def digest(p):
    b=(ROOT/p).read_bytes()
    return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

s=own('INPUTS.physical-exact-selector.json')
gs=read(s['currentCanonical']['path'])['goals'];byid={g['id']:g for g in gs}
ids=s['goalIds'];cc=own('materials/thirty-complete-DE-EN-cases.author.json')['cases']
rr=[json.loads(x) for x in (OUT/'candidate/fifteen-profiles.raw-E0G0.author.jsonl').read_text().splitlines()]
source=own('source-context/selected-source-cells-and-parent-passages.exact.json')
map_path='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_biologisch_chemisches_praktikum_to_canonical_chemistry.json'
mapping=read(map_path)['mappings']
source_by={c['id']:c for x in source for c in x['sourceCells']}
matrix=[]
for i,gid in enumerate(ids,1):
    binds=[m for m in mapping if m['canonicalGoalId']==gid and m['legacyGoalId'] in source_by]
    matrix.append({'goalId':gid,'wholeBodyAction':'KEEP-exact-current-object-no-author-CAS',
        'currentGoalObject':REL+'/candidate/fifteen-whole-current-goals.exact.json',
        'directBYSourceBindings':[{'mapping':digest(map_path),'mappingRow':m,
            'sourceCellId':m['legacyGoalId'],'span':source_by[m['legacyGoalId']]['sourceSpan'],
            'courseLevel':source_by[m['legacyGoalId']].get('courseLevel'),
            'operatorDuty':'Transform-and-reflect representation' if i==4 else 'Source requires actual future practical performance plus stated reasoning/documentation; designed examples are not executions.'}
            for m in binds],
        'twoCaseIds':[c['caseId'] for c in cc if c['goalId']==gid],
        'projectionBoundary':{'applicabilityRetained':byid[gid].get('applicability'),
            'tagsRetained':byid[gid].get('tags'),
            'noNewSourceCourseViewClearance':True}})
write('source-context/goal-source-operator-and-scope-matrix.author.json',{
    'records':matrix,
    'additionalSpecificBindings':[
        {'goalId':ids[0],'sourceCellId':'he-chem-seki-8-1-b01-a01-5f491239','sourceClause':'Basic experimental working methods; sibling13d4f336 retains safety competence. Examples involving burners/candles do not force hazardous unsupervised cases.'},
        {'goalId':ids[1],'legacySourceGoalId':'0c2a8baa-c6f6-4b86-b760-e18185ba4d02',
         'sourceLocation':'HE KC2024 E.3, extension/deepening: ethanol hydroxyl group/properties and effect in human body; earlier source-json snapshot contains everyday effects/risks.',
         'hold':'Detailed addiction/physical-harm/social scope is not independently established by a provenance label or the broad E.3 line. Preserve current whole text; source/course review stays open.'},
        {'goalId':ids[4],'sourceCellId':'bw-chem-seki-3-2-1-1-b05-a01-cf1b3dcc','sourceClause':'Represent the industrial path of a selected substance from raw material extraction to use; salt and iron are examples, not a demand to cover all listed materials.'}
    ],
    'scopeRule':'BcP12/13 is a specific practical curriculum, not ordinary nationwide GK/LK proof. Preserve all original mapping/course/view holds. No source operator is weakened to paper-only mastery.'})

# Existing exact V rows are retained; this is only byte/reference comparison.
qa=read(s['existingQA']['path'])
vrows=[r for r in qa['records'] if r.get('goalId') in ids]
imgs=own('source-context/existing-fifteen-image-byte-bindings.no-new-V.json')
image_by={r['goalId']:r for r in imgs}
vcheck=[]
for r in vrows:
    a=image_by[r['goalId']]
    vcheck.append({'goalId':r['goalId'],'sameImageURL':r.get('imageUrl')==a['url'],
        'sameAssetDigest':r.get('assetSha256')==a['sha256'],
        'retainedAIApprovalState':r.get('aiApproved'),'noNewVote':True})
write('source-context/existing-fifteen-V-rows.exact.no-new-vote.json',{'source':s['existingQA'],'records':vrows,'newVotes':0})
write('checks/retained-V-byte-reference-comparison.actual.json',{'results':vcheck,'newVotes':0,
    'pass':len(vrows)==15 and all(r['sameImageURL'] and r['sameAssetDigest'] for r in vcheck),
    'limit':'Byte/reference comparison only; no visual reapproval or human acceptance claim.'})

assert len(ids)==15 and len(cc)==30 and len(rr)==15
assert own('candidate/fifteen-whole-current-goals.exact.json')['goals']==[byid[i] for i in ids]
assert all(len([c for c in cc if c['goalId']==i])==2 for i in ids)
assert len({c['caseId'] for c in cc})==30
assert all(c['imageDependency']=='none' and c['executionStatus']=='not-executed-author-design' for c in cc)
assert sum(len(c['criterionToObservableRubric']) for c in cc)==120
for c in cc:
    for key in ['materialsAndSuppliedData','protocolAndConditions','actualTask','expectedReasoningAndSolution','freshIndependentTransfer','freshTransferExpectedReasoning','independenceConditions']:
        assert set(c[key])=={'de','en'} and all(c[key][lang].strip() for lang in ['de','en'])
    assert all(v is None for v in c['futureObservationRecord'].values())
    assert all(r['futureObservation'] is None and r['met'] is None for r in c['criterionToObservableRubric'])
for r in rr:
    assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate'
    assert r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0' and r['reviewRunIds']==[]
    cov=r['profile']['coverageExpectations']
    assert cov['minimumIndependentDemonstrations']==2 and cov['freshVariationRequired'] and cov['independentTransferRequired']
assert all(any(c['assessmentMode'].startswith('future-observed-practical') for c in cc if c['goalId']==i) for i in ids if i not in [ids[1],ids[3],ids[4]])

arithmetic={
 'lab15-03-a':{'theoreticalCaCO3_g':str(Fraction(1,1000)*Fraction(1001,10)),'nominalYield':str(Fraction(9,100)/Fraction(1001,10000))},
 'lab15-04-a':{'means_microS_per_cm':[5.5,1200,9.5]},
 'lab15-05-a':{'recovery':str(Fraction(90,100))},
 'lab15-06-a':{'purity':str(Fraction(2565,2700)),'NaClRecovery':str(Fraction(2565,3000))},
 'lab15-06-b':{'theoreticalCrystals_g':str(Fraction(6)-Fraction(20)*Fraction(10,100)),
     'purity':str(Fraction(342,360)),'ARecovery':str(Fraction(342,600)),'relativeToTheoreticalCrystals':str(Fraction(342,400))},
 'lab15-07-a':{'fractions':[str(Fraction(x,500)) for x in [120,150,220]],'totalRecovery':str(Fraction(490,500))},
 'lab15-07-b':{'mean_mS_per_cm':str((Fraction(98,10)+Fraction(101,10))/2)},
 'lab15-08-b':{'theoreticalMass_g':str(Fraction(2,1000)*Fraction(1001,10)),
     'grossYield':float(Fraction(1800,2002)),'purityCorrectedYield':float(Fraction(1710,2002))},
 'lab15-09-a':{'activeRise':str(Fraction(122-80,80)),'controlRise':str(Fraction(815-800,800))},
 'lab15-10-b':{'meanA_um':40,'meanB_um':str(Fraction(50,3))},
 'lab15-11-a':{'moistGermination':str(Fraction(51,60)),'dryGermination':str(Fraction(1,60))},
 'lab15-11-b':{'meanVolumes_mL':[9,18,11]},
 'lab15-13-a':{'meanFailureLoads_N':[9,5]},
 'lab15-13-b':{'meanBendingRadius_mm':[7,4]},
 'lab15-14-a':{'sunnyGrass_per_m2':48,'shadedGrass_per_m2':32},
 'lab15-14-b':{'meanOpenCover_percent':20,'meanShadeCover_percent':str(Fraction(20,3))},
 'fresh-transfer-03-a':{'carbonateLimitingTheoretical_g':str(Fraction(5,10000)*Fraction(1001,10))},
 'fresh-transfer-08-b':{'carbonateLimitingTheoretical_g':str(Fraction(25,10000)*Fraction(1001,10))},
 'fresh-transfer-12-a':{'oilPlusWaterPlusEmulsifier_g':str(Fraction(4)+Fraction(55,10)+Fraction(5,10))},
}
assert Fraction(2565,2700)==Fraction(95,100)
assert Fraction(2565,3000)==Fraction(855,1000)
assert Fraction(342,600)==Fraction(57,100)
assert round(float(Fraction(1710,2002))*100,1)==85.4
assert Fraction(122-80,80)==Fraction(525,1000)
write('checks/bounded-format-whole-object-and-arithmetic.actual.json',{
    'command':'python '+REL+'/scripts/finalize_and_check.py','pass':True,'goals':15,'completeBilingualCases':30,
    'rubricRows':120,'rawE0G0Records':15,'wholeObjectChanges':0,'allObservationFieldsBlank':True,
    'allCasesIndependentOfImages':True,'arithmetic':arithmetic,
    'limits':'Author format, bindings and arithmetic only; no independent chemical D/P/A/M/V approval, learner outcome or course clearance.'})

# Required portability helper, with actual errors restricted to this finite packet.
spec=importlib.util.spec_from_file_location('schema_validator',ROOT/'scripts/validate_schemas.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
all_symlink_errors=mod.curriculum_symlink_errors(ROOT)
own_errors=[e for e in all_symlink_errors if e.startswith(REL+'/')]
assert not own_errors
write('checks/curriculum-portability.actual.json',{'helper':'scripts/validate_schemas.py::curriculum_symlink_errors',
    'ownPackageErrors':own_errors,'pass':True,'scope':'Only this finite author package; other concurrent work is outside this receipt.'})

inventory=[]
def entry(p,mode,detail):inventory.append({**digest(p),'readMode':mode,'detail':detail})
entry('AGENTS.md','instruction-reading','Sections7.1–7.4; user M7 machine-only instruction controls interpretation of legacy human-named status fields.')
for p,mode,detail in [
    (s['claim']['path'],'scope-exact-read','Original15 IDs, immutable claim.'),
    (s['currentCanonical']['path'],'selected-full-goals-and-context','Whole15 authored objects; full prerequisite/contains closure68 plus4 immediate outside neighbours captured. Chemical descriptions and edges read; capstone277-edge array retained mechanically.'),
    (s['semanticLedger']['path'],'selected-classification-read','Existing551 semantic decisions;15 curricularAtomic identities read, no new classification.'),
    (s['neutralCheckpoint']['path'],'checkpoint-routing-read','Exact existing normal419 config, M419, QA435 and physical alias/source records.'),
    (map_path,'source-clause-reading','BcP12/13 exact/partial source mappings selected for the whole15.'),
    (s['existingMConfig']['path'],'binding-retention-read','Existing normal M419 config and card source; no new decisions.'),
    (s['existingCardSource']['path'],'mechanical-origin-filter','No cards required by retained15 no_memory_needed decisions.'),
    (s['existingQA']['path'],'mechanical-record-and-byte-binding-read','Exact15 V rows and image SHA comparison only, no independent visual acceptance.'),
    ('app/scripts/positiveGoalEvidenceProfileModel.ts','production-contract-read','Closed archetypes, schema fields, exact stock fingerprint/semantics functions.'),
    ('app/scripts/goalEvidenceProfileModel.ts','production-contract-read','Goal and input payload fields; no local replacement helper.'),
    ('contracts/goal-evidence/v2/goal-evidence-profile.schema.json','schema-reading','Complete raw-record production schema.'),
    ('curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','criteria-reading','Source scope, chemical correctness, actual performance and conservative author boundary.'),
    ('curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md','criteria-reading','Two demonstrations, fresh meaningful variation, transfer, safety and equivalent DE/EN.'),
    ('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/RESUME.md','context-hold-reading','Retain source/course/acquisition holds; do not require learner data for M7.'),
]:entry(p,mode,detail)
for x in source:
    entry(x['input']['path'],'selected-source-cell-reading',f"{len(x['sourceCells'])} selected full cells; BcP12/13 duplicate operators read; other file contents not claimed as a full review.")
for p in ['curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_CHEMIE.de.json.snapshot','curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_CHEMIE.de.json.snapshot']:
    entry(p,'selected-legacy-provenance-goal-reading','Exact legacy goal body only; no current national source clearance.')
entry('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf','targeted-PDF-text-reading','pdftotext -layout, ethanol/E.3 context and source operators only; no publication build or full PDF review.')
write('INPUTS.actual-read-inventory.json',{'entries':inventory,
    'userObjective':'Read the user-supplied ChemistryM7 objective; no private learner/session data used.',
    'memoryLookup':'Keyword search returned no relevant memory records; no memory-derived project assertion used.',
    'classification':'Chemical content reading, exact retention and mechanical binding checks are distinguished; author reading is no independent review.'})
print(json.dumps({'formatAndArithmetic':'pass','portability':'pass','cases':30,'rubricRows':120,
                  'rawProfiles':15,'wholeObjectChanges':0,'retainedVRows':len(vrows),'independentApprovals':0}))
