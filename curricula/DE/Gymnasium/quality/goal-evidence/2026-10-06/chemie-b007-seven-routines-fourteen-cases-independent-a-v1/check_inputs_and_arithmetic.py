#!/usr/bin/env python3
"""Independent A byte/metadata/arithmetic audit. Writes only this evidence directory.

SPDX-License-Identifier: Apache-2.0
Arithmetic entries below were selected by reading the actual bilingual materials.
They are reviewer calculations, not observed learner performances or native gates.
"""
from collections import Counter
from datetime import datetime, timezone
from fractions import Fraction
from hashlib import sha256
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-three-safety-solutions-source-boundary-author-v1'
FREEZE = AUTHOR / 'seven-routines-and-fourteen-cases.author.final.freeze.json'
EXPECTED = 'bff61973489242df3f772bd9b65a44037c6335751638057851ed53ab05d1cea0'

def read(path):
    return json.loads(path.read_text())

def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(REPO)), 'sha256': sha256(data).hexdigest(), 'bytes': len(data)}

def check(entry):
    actual = binding(REPO / entry['path'])
    return {**actual, 'expectedSha256': entry['sha256'], 'expectedBytes': entry['bytes'],
            'exact': actual['sha256'] == entry['sha256'] and actual['bytes'] == entry['bytes']}

manifest = read(FREEZE)
own_checks = [check(x) for x in manifest['files']]
external_checks = [check(x) for x in manifest['externalInputBindings']]
helper = read(AUTHOR / 'authored-case-materials-v1/author-materials.final.freeze.json')
helper_checks = [check(x) for x in helper['inputBindings'] + helper['artifactBindings']]
cases = read(AUTHOR / 'authored-case-materials-v1/cases.de-en.author-candidate.json')['cases']
routines = read(AUTHOR / 'seven-routines.de-en.author-candidate.json')['prototypes']
cards = read(AUTHOR / 'authored-case-materials-v1/primary-cards.de-en.author-candidate.json')['cards']
snapshot = read(AUTHOR / 'three-current-goals-and-source-inputs.actual.json')

# Independently recomputed from literal material quantities and changes.
arithmetic = [
    ('S1 maximum at 40 g water', Fraction(24)*40/100, Fraction('9.6'), 'g'),
    ('S1 A extra capacity', Fraction('9.6')-Fraction('7.2'), Fraction('2.4'), 'g'),
    ('S1 B extra capacity', Fraction('9.6')-Fraction('9.6'), Fraction(0), 'g'),
    ('S1 transfer maximum at 80 g water', Fraction(24)*80/100, Fraction('19.2'), 'g'),
    ('S1 transfer extra capacity', Fraction('19.2')-Fraction('9.6'), Fraction('9.6'), 'g'),
    ('S2 initial dissolved', Fraction(30)*80/100, Fraction(24), 'g'),
    ('S2 initial residue', Fraction(32)-24, Fraction(8), 'g'),
    ('S2 maximum after water addition', Fraction(30)*(80+40)/100, Fraction(36), 'g'),
    ('S2 spare capacity after addition', Fraction(36)-32, Fraction(4), 'g'),
    ('S2 countercase spare capacity', Fraction(24)-20, Fraction(4), 'g'),
    ('M1 mass fraction', Fraction(12,12+108), Fraction(1,10), 'dimensionless'),
    ('M1 incorrect solute/solvent ratio', Fraction(12,108), Fraction(1,9), 'dimensionless other ratio'),
    ('M1 after dilution', Fraction(12,12+108+30), Fraction(2,25), 'dimensionless'),
    ('M1 proportional countercase', Fraction(24,24+216), Fraction(1,10), 'dimensionless'),
    ('M2 initial fraction', Fraction(25,25+175), Fraction(1,8), 'dimensionless'),
    ('M2 documented water-only loss', Fraction(25,25+175-25), Fraction(1,7), 'dimensionless'),
    ('M2 added-water countercase', Fraction(25,25+175+50), Fraction(1,10), 'dimensionless'),
    ('V1 initial input-volume fraction', Fraction(25,25+75), Fraction(1,4), 'dimensionless'),
    ('V1 proportionally scaled batch', Fraction(10,10+30), Fraction(1,4), 'dimensionless'),
    ('V1 changed-ratio countercase', Fraction(20,20+30), Fraction(2,5), 'dimensionless'),
    ('V2 input-volume fraction despite contraction', Fraction(40,40+60), Fraction(2,5), 'dimensionless'),
    ('V2 other ratio to final volume', Fraction(40,96), Fraction(5,12), 'dimensionless other ratio'),
    ('V2 new input-volume countercase', Fraction(30,30+70), Fraction(3,10), 'dimensionless'),
]
numeric_checks = [{'literalContext': n, 'actualExact': str(a), 'expectedExact': str(e),
                   'decimal': float(a), 'unitOrQuantity': u, 'exact': a == e}
                  for n, a, e, u in arithmetic]
meta_checks = [
    {'caseLocalKey': c['caseLocalKey'],
     'candidateOnly': c['recordStatus'] == 'ai_candidate' and c['validationStatus'] == 'needs_human_review',
     'E1G1': c['evidenceLevel'] == 'E1' and c['generalizationLevel'] == 'G1',
     'noHumanOrNativeOrLearnerClaim': not any(c[k] for k in
         ['humanApproval','humanTrial','nativeProfileBound','actualLearnerPerformanceRecorded']),
     'requiredCriterionCount': sum(x['required'] for x in c['assessmentCriteria']),
     'bilingualRequiredContentPresent': all(c[k].get('de') and c[k].get('en') for k in
         ['essentialUnderstanding','material','learnerTask','expectedResponseOrSolution',
          'transferOrCountercase','materialAndSourceLimitations'])}
    for c in cases]
extra_paths = [
    'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',
    'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf',
    'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json',
    'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.review.jsonl',
    'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.cards.review.jsonl',
]
receipt = {
    'schemaVersion': 1, 'licenseExpression': 'Apache-2.0',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'reviewer': 'independent A; not B007 author',
    'compoundAuthorFreeze': {**binding(FREEZE), 'expectedSha256': EXPECTED,
                             'exact': binding(FREEZE)['sha256'] == EXPECTED},
    'ownArtifactChecks': own_checks, 'externalInputChecks': external_checks,
    'helperFreeze': {'binding': binding(AUTHOR / 'authored-case-materials-v1/author-materials.final.freeze.json'),
                    'retainedRootInputCount': len(helper['inputBindings']),
                    'retainedHelperArtifactCount': len(helper['artifactBindings']), 'checks': helper_checks},
    'additionalReadOnlyInspectionBindings': [binding(REPO / p) for p in extra_paths],
    'routineCount': len(routines), 'caseCount': len(cases), 'cardCount': len(cards),
    'casesPerRoutine': dict(Counter(c['routineLocalKey'] for c in cases)),
    'caseMetadataChecks': meta_checks,
    'requiredCriterionCount': sum(c['requiredCriterionCount'] for c in meta_checks),
    'distinctOriginalObligations': len({(r['sourceExtractionPath'],r['sourceGoalId']) for r in snapshot['currentSourceBindingRows']}),
    'retainedMappingRowCount': len(snapshot['currentSourceBindingRows']),
    'all403ObligationsSubstantivelyReviewed': False,
    'arithmeticChecks': numeric_checks,
    'authorInputsUnchanged': all(c['exact'] for c in own_checks+external_checks+helper_checks),
    'arithmeticAllExact': all(c['exact'] for c in numeric_checks),
    'nativeGateApproval': False, 'activeWrites': False, 'strictCompletionsAdded': 0,
    'humanApproval': False, 'humanTrial': False,
}
(OWN / 'input-byte-and-arithmetic-checks.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['routineCount','caseCount','cardCount','requiredCriterionCount',
    'retainedMappingRowCount','distinctOriginalObligations','authorInputsUnchanged','arithmeticAllExact']},ensure_ascii=False))
