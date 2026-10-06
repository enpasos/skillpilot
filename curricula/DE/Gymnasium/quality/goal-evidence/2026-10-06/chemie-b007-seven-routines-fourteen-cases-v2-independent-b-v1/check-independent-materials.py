"""Bounded independent B material/input checks. SPDX-License-Identifier: Apache-2.0.

Scientific verdicts are in independent-b.review.json. This script checks the
actual authored numbers, status, continuity and prerequisite references; it
does not infer semantic quality from field presence or produce native gates.
"""
import ast
import hashlib
import json
import subprocess
from collections import Counter
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from pathlib import Path

REPO = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
TMP = REPO / 'tmp/chemie-b007-v2-independent-b-primary'
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-routines-four-material-corrections-author-v2'
V1 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-three-safety-solutions-source-boundary-author-v1'
PEER_PREFIX = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-routines-fourteen-cases-independent-a-v1/'

def read(path):
    return json.loads(Path(path).read_text())

def bind(path):
    path = Path(path)
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

def check_bindings(bindings, skip_peer=False):
    verified = []
    skipped = []
    for item in bindings:
        if skip_peer and item['path'].startswith(PEER_PREFIX):
            skipped.append(item['path'])
            continue
        actual = bind(REPO / item['path'])
        assert actual['sha256'] == item['sha256'] and actual['bytes'] == item['bytes'], item['path']
        verified.append(actual)
    return verified, skipped

def number(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return Fraction(str(node.value))
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return -number(node.operand)
    if isinstance(node, ast.BinOp):
        left, right = number(node.left), number(node.right)
        if isinstance(node.op, ast.Add): return left + right
        if isinstance(node.op, ast.Sub): return left - right
        if isinstance(node.op, ast.Mult): return left * right
        if isinstance(node.op, ast.Div): return left / right
    raise ValueError('Only literal rational arithmetic is allowed.')

def compute(expression):
    return number(ast.parse(expression, mode='eval').body)

def decimal(value):
    return Decimal(value.numerator) / Decimal(value.denominator)

def put(name, value):
    path = OUT / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

freeze_path = AUTHOR / 'targeted-materials.author-v2.final.freeze.json'
assert bind(freeze_path)['sha256'] == 'e86359b0cea958c6964ad801945810c4621d2a542f426e69e5e92ad1cc303357'
freeze = read(freeze_path)
author_files, _ = check_bindings(freeze['files'])
author_inputs, skipped_peer = check_bindings(freeze['inputBindings'], skip_peer=True)
v1_freeze_path = V1 / 'seven-routines-and-fourteen-cases.author.final.freeze.json'
v1 = read(v1_freeze_path)
assert bind(v1_freeze_path)['sha256'] == 'bff61973489242df3f772bd9b65a44037c6335751638057851ed53ab05d1cea0'
v1_files, _ = check_bindings(v1['files'])
v1_input_key = 'inputBindings' if 'inputBindings' in v1 else 'externalInputBindings'
v1_inputs, _ = check_bindings(v1[v1_input_key])
snapshot = read(V1 / 'three-current-goals-and-source-inputs.actual.json')
prototypes = read(AUTHOR / 'seven-routines.de-en.author-candidate.json')['prototypes']
case_file = read(AUTHOR / 'cases.de-en.author-candidate.json')
cases = case_file['cases']
cards = read(AUTHOR / 'primary-cards.de-en.author-candidate.json')['cards']
assert len(prototypes) == 7 and len(cases) == 14 and len(cards) == 2
assert len({p['localKey'] for p in prototypes}) == 7
assert len({c['caseLocalKey'] for c in cases}) == 14
assert Counter(c['routineLocalKey'] for c in cases) == Counter({p['localKey']: 2 for p in prototypes})
by_key = {p['localKey']: p for p in prototypes}
for case in cases:
    p = by_key[case['routineLocalKey']]
    for field, expected in [('recordStatus','ai_candidate'),('validationStatus','needs_human_review'),('evidenceLevel','E1'),('generalizationLevel','G1'),('syntheticMaterial',True),('actualLearnerPerformanceRecorded',False),('humanApproval',False),('humanTrial',False),('nativeProfileBound',False)]:
        assert case[field] == expected, (case['caseLocalKey'], field)
    assert case['essentialUnderstanding']['de'] == p['positiveUnderstandingAuthorCandidate']['essentialUnderstandingDe']
    assert case['essentialUnderstanding']['en'] == p['positiveUnderstandingAuthorCandidate']['essentialUnderstandingEn']
    assert case['candidateGoalId'] == p['id']
    assert case['material']['de'] and case['material']['en']
    assert case['learnerTask']['de'] and case['learnerTask']['en']
    assert case['expectedResponseOrSolution']['de'] and case['expectedResponseOrSolution']['en']
    assert all(c['required'] and c['text']['de'] and c['text']['en'] for c in case['assessmentCriteria'])
    assert all(case['transferOrCountercase'][lang]['task'] and case['transferOrCountercase'][lang]['expected'] for lang in ['de','en'])

old_cases = read(V1 / 'authored-case-materials-v1/cases.de-en.author-candidate.json')['cases']
old_by_key = {c['caseLocalKey']:c for c in old_cases}
changed_cases = [c['caseLocalKey'] for c in cases if c != old_by_key[c['caseLocalKey']]]
assert len(changed_cases) == 5
old_prototypes = read(V1 / 'seven-routines.de-en.author-candidate.json')['prototypes']
old_prototype_by_key = {p['localKey']:p for p in old_prototypes}
changed_prototypes = [p['localKey'] for p in prototypes if p != old_prototype_by_key[p['localKey']]]
assert changed_prototypes == ['label']
assert (AUTHOR / 'primary-cards.de-en.author-candidate.json').read_bytes() == (V1 / 'authored-case-materials-v1/primary-cards.de-en.author-candidate.json').read_bytes()
for p in prototypes:
    old = old_prototype_by_key[p['localKey']]
    assert all(p[field] == old[field] for field in ['id','title','titleEn','description','descriptionEn','requiresAuthorProposal'])

calculation_rows = []
for case in cases:
    for entry in case.get('calculationAudit', []):
        result = compute(entry['operation'])
        if 'result' in entry: assert result == Fraction(str(entry['result']))
        if 'exactResult' in entry: assert result == Fraction(entry['exactResult'])
        if 'percent' in entry: assert 100 * result == Fraction(str(entry['percent']))
        if 'percentRounded1dp' in entry: assert decimal(result * 100).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP) == Decimal(str(entry['percentRounded1dp']))
        calculation_rows.append({'caseLocalKey':case['caseLocalKey'],'operation':entry['operation'],'independentExactResult':str(result),'independentDecimal':str(decimal(result)),'claimVerified':True})
assert len(calculation_rows) == 21
# These two numerical conclusions are in the actual case text but not its audit array.
for case_key, expression, expected, interpretation in [
    ('solubility-clear-saturated-countercase','9.6-9.6',0,'extra capacity at the given saturated limit'),
    ('solubility-residue-water-and-temperature','24-20',4,'transfer additional capacity after the changed solute quantity'),
]:
    value = compute(expression)
    assert value == expected
    calculation_rows.append({'caseLocalKey':case_key,'operation':expression,'independentExactResult':str(value),'interpretation':interpretation,'derivedFromPersonallyReadCaseText':True,'claimVerified':True})

canonical_path = REPO / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canon = read(canonical_path)
known = {g['id'] for g in canon['goals']}
for p in prototypes:
    if p['id'] is not None: assert p['id'] in known
    assert all(r in known for r in p['requiresAuthorProposal'])
assert sum(p['id'] is None for p in prototypes) == 6
for card in cards:
    assert card['originRoutineLocalKey'] in ['mass_fraction','volume_fraction']
    assert card['cardId'] is None and card['originGoalId'] is None and card['deckId'] is None
    assert card['activationStatus'] == 'not_active' and card['memoryGoalIds'] == []
    assert card['actualVisibilityReviewStatus'] == 'pending'
    assert card['humanApproval'] is False

primary_pages = []
for physical, printed in [(8,7),(12,11),(13,12)]:
    path = TMP / f'HE-p{printed:02}-fresh-layout.txt'
    subprocess.run(['pdftotext','-f',str(physical),'-l',str(physical),'-layout',str(REPO/'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf'),str(path)],check=True)
    primary_pages.append({'jurisdiction':'DE-HE','printedPage':printed,'physicalPage':physical,'localTextPath':path.relative_to(REPO).as_posix(),'localTextSha256':bind(path)['sha256'],'actualTextAndRasterPersonallyRead':True})
ni_pdf = REPO / 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf'
ni_text = TMP / 'NI-p51-fresh-layout.txt'
subprocess.run(['pdftotext','-f','51','-l','51','-layout',str(ni_pdf),str(ni_text)],check=True)
primary_pages.append({'jurisdiction':'DE-NI','printedPage':51,'physicalPage':51,'localTextPath':ni_text.relative_to(REPO).as_posix(),'localTextSha256':bind(ni_text)['sha256'],'actualTextAndRasterPersonallyRead':True})
he_pdf = REPO / 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf'
fresh_pdf = TMP / 'HE-fresh-official.pdf'
assert he_pdf.read_bytes() == fresh_pdf.read_bytes()
checkpoint_path = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
checkpoint = read(checkpoint_path)
active_inputs, _ = check_bindings(checkpoint['currentInputs'])
put('independent-material-and-continuity.actual.json',{
    'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'reviewer':'codex-b007-v2-independent-b',
    'authorFreeze':bind(freeze_path),'authorFilesVerified':author_files,'authorInputBindingsVerifiedExceptPeer':author_inputs,'peerArtifactBodiesNotRead':skipped_peer,
    'v1AuthorFreeze':bind(v1_freeze_path),'v1AuthorFilesVerified':v1_files,'v1CurrentSourceInputBindingsVerified':v1_inputs,
    'candidateRoutineCount':7,'completeBilingualCaseCount':14,'casesPerRoutine':2,'primaryCardCount':2,'requiredCriteriaPersonallyRead':sum(len(c['assessmentCriteria']) for c in cases),
    'changedWholeCaseObjects':changed_cases,'unchangedWholeCaseCount':9,'changedWholeRoutineObjects':changed_prototypes,'unchangedWholeRoutineCount':6,'allSevenDescriptionAndPrerequisiteObjectsExact':True,'bothWholePrimaryCardsByteExact':True,
    'independentlyRecomputedLiteralCalculations':calculation_rows,'auditArrayCalculationsRecomputed':21,'additionalCaseTextCapacityCalculations':2,'incorrectCalculations':0,
    'currentCanonicalPrerequisiteReferencesAllResolve':True,'newPrototypesWithNoActualGoalIDYet':6,'candidateStatusE1G1AllTrue':True,'actualLearnerPerformanceClaimed':False,
    'primarySourcePagesPersonallyRead':primary_pages,'freshOfficialHEDownloadByteExact':True,'currentOfficialHEPDF':bind(he_pdf),'currentNIPDF':bind(ni_pdf),
    'currentActiveCheckpointInputBindings':active_inputs,'activeWrites':False,'strictCompletionsAdded':0,'restoredActiveBindings':0,'nativeDPAOrMApproval':False,'humanApproval':False,'humanTrial':False,
})
print(json.dumps({'routineCount':7,'completeBilingualCases':14,'requiredCriteria':46,'primaryCards':2,'actualRecomputations':23,'wrongCalculations':0,'wholeUnchangedCases':9,'wholeUnchangedRoutines':6,'activeCheckpointInputsExact':len(active_inputs),'activeGain':0}))
