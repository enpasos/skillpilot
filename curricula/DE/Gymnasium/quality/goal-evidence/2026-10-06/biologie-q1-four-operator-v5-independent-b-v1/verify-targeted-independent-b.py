# SPDX-License-Identifier: Apache-2.0
"""Read-only targeted v5 input checks; writes only this review's own outputs."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
V5 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-source-operator-author-remediation-v5'
V4 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-current383-source-scope-author-remediation-v4'
EXPECTED = '094baede3989a387d5e77f98611356f4c49bf4f0f5ff68165531fb59268f2e82'
USED = {}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def canon(obj):
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()

def path_label(path):
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)

def read_bytes(path, use='content inspected or independently computed'):
    path = path if path.is_absolute() else ROOT / path
    data = path.read_bytes()
    label = path_label(path)
    old = USED.get(label)
    if old and use not in old['actualUse']:
        old['actualUse'].append(use)
    elif not old:
        USED[label] = {'path': label, 'sha256': sha(data), 'bytes': len(data), 'actualUse': [use]}
    return data

def read_json(path, use='content inspected or independently computed'):
    return json.loads(read_bytes(path, use))

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def bound_check(entry, base):
    path = Path(entry['path'])
    if not path.is_absolute():
        path = base / path
    data = read_bytes(path, 'byte verification only; no inherited verdict interpretation')
    return {'path': path_label(path), 'expectedSHA256': entry['sha256'],
            'actualSHA256': sha(data), 'expectedBytes': entry.get('bytes'),
            'actualBytes': len(data), 'matches': sha(data) == entry['sha256'] and
            (entry.get('bytes') is None or len(data) == entry['bytes'])}

def case_id(case):
    return case.get('caseId', case.get('caseKey'))

def extract(path, first, last):
    read_bytes(path, 'actual primary PDF independently extracted for this targeted review')
    return subprocess.check_output(['pdftotext', '-layout', '-f', str(first), '-l', str(last), str(path), '-']).decode()

freeze_path = V5 / 'author-source-operator-v5.final.freeze.json'
freeze_data = read_bytes(freeze_path, 'exact author v5 freeze identity')
freeze = json.loads(freeze_data)
assert sha(freeze_data) == EXPECTED
own_checks = [bound_check(e, V5) for e in freeze['files']]
author_inputs = read_json(V5 / 'actual-used-inputs.author-v5.freeze.json')
input_checks = [bound_check(e, ROOT) for e in author_inputs['files']]
assert len(own_checks) == 10 and len(input_checks) == 49
assert all(x['matches'] for x in own_checks + input_checks)

candidate = read_json(V5 / 'eleven-components-twentyfour-cases.author-candidate.json')
old = []
for name in ['four-main-components-eight-positive-cases.author-candidate.json', 'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json']:
    old.extend(read_json(V4 / name)['components'])
old_by = {c['candidateKey']: c for c in old}
new_by = {c['candidateKey']: c for c in candidate['components']}
assert old_by.keys() == new_by.keys() and len(new_by) == 11
case_rows = []
component_rows = []
for key, component in new_by.items():
    before = old_by[key]
    before_cases = {case_id(t): t for t in before['tasks']}
    after_cases = {case_id(t): t for t in component['tasks']}
    assert before_cases.keys() <= after_cases.keys()
    for cid, case in after_cases.items():
        earlier = before_cases.get(cid)
        state = 'new' if earlier is None else 'exact_continuity' if earlier == case else 'revised'
        case_rows.append({'candidateKey': key, 'caseId': cid, 'deltaClass': state,
                         'beforeCanonicalJSONSHA256': sha(canon(earlier)) if earlier else None,
                         'afterCanonicalJSONSHA256': sha(canon(case)),
                         'changedFields': sorted(k for k in set(earlier or {}) | set(case)
                                                 if (earlier or {}).get(k) != case.get(k)) if state == 'revised' else [],
                         'reviewPolicy': 'byte-exact continuity; no historical restart' if state == 'exact_continuity' else 'fresh independent v5 content decision'})
    component_rows.append({'candidateKey': key, 'canonicalGoalId': component.get('canonicalGoalId'),
                           'newAssignedGoalId': component.get('newAssignedGoalId'),
                           'descriptionDEENExact': (before['description'], before['descriptionEn']) == (component['description'], component['descriptionEn']),
                           'changedNonTaskFields': sorted(k for k in set(before) | set(component)
                                                          if k != 'tasks' and before.get(k) != component.get(k))})
unchanged = [x['caseId'] for x in case_rows if x['deltaClass'] == 'exact_continuity']
revised = [x['caseId'] for x in case_rows if x['deltaClass'] == 'revised']
new = [x['caseId'] for x in case_rows if x['deltaClass'] == 'new']
assert len(unchanged) == 20 and set(revised) == {'mechanism-pro-euk-a', 'protein-function-a'}
assert set(new) == {'everyday-uv-risk-decision-c', 'environment-air-pah-risk-decision-d'}
assert len(case_rows) == 24
assert sum(c.get('canonicalGoalId') is None for c in candidate['components']) == 7
assert all(c.get('newAssignedGoalId') is None for c in candidate['components'])
assert [r['candidateKey'] for r in component_rows if not r['descriptionDEENExact']] == ['mutagen_causes_and_protection']

field_rows = []
for c in candidate['components']:
    for t in c['tasks']:
        fields = ['material', 'task', 'solution', 'materialEn', 'taskEn', 'solutionEn'] if 'caseId' in t else ['materialDe', 'promptDe', 'solutionDe', 'materialEn', 'promptEn', 'solutionEn']
        criteria = t.get('positiveEssentialPassingConditions', t.get('positiveEssentialConditions'))
        passed = all(isinstance(t.get(f), str) and t[f].strip() for f in fields) and isinstance(criteria, list) and len(criteria) > 0
        field_rows.append({'caseId': case_id(t), 'sixBilingualFields': fields, 'allPresent': passed, 'positiveConditions': len(criteria)})
assert all(x['allPresent'] for x in field_rows)

envelope_path = V4 / 'canonical-preserved.inert-envelope.json'
envelope = read_json(envelope_path)
preserved_utf8 = envelope['preservedCanonicalUTF8'].encode()
assert sha(preserved_utf8) == envelope['originalSHA256']
frozen_canonical = json.loads(preserved_utf8)
current_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current_canonical = read_json(current_path, 'actual current 464-goal runtime input, contrasted with inert 464 candidate')
fg = {g['id']: g for g in frozen_canonical['goals']}
cg = {g['id']: g for g in current_canonical['goals']}
assert len(fg) == len(cg) == 464 and fg.keys() == cg.keys()
goal_deltas = []
for gid in fg:
    if fg[gid] != cg[gid]:
        fields = sorted(k for k in set(fg[gid]) | set(cg[gid]) if fg[gid].get(k) != cg[gid].get(k))
        goal_deltas.append({'goalId': gid, 'changedFields': fields,
                           'frozenCandidateValues': {k: fg[gid].get(k) for k in fields},
                           'currentRuntimeValues': {k: cg[gid].get(k) for k in fields}})
expected_four = {'0daa79f6-8f61-5506-98f9-65db83062ba8', '475eebb4-4eb0-524f-b1ec-4a672bf856d2', 'ffef97e3-12d6-5090-9816-46ab9e57fae2', 'e70d8a85-2dea-5165-919b-200fee9f4db4'}
assert {g['goalId'] for g in goal_deltas} == expected_four
assert all(g['changedFields'] == ['description', 'descriptionEn', 'resourceLinks'] for g in goal_deltas)
for gid in expected_four:
    assert fg[gid].get('description') and fg[gid].get('descriptionEn')
native_p = read_json(V4 / 'positive-four.native-candidate-records.json')
assert len(native_p['records']) == 4
p_bodies = []
original_p_cases = []
for record in native_p['records']:
    profile = record['profile']
    # Exact frozen profile object is sufficient for body continuity; no native approval is created.
    p_bodies.append({'goalId': record['goalId'], 'profileCanonicalJSONSHA256': sha(canon(profile)), 'profileKeys': list(profile)})
    for case in profile['applicationCaseBriefs']:
        original_p_cases.append({'goalId': record['goalId'], 'caseId': case['id'], 'bodyCanonicalJSONSHA256': sha(canon(case))})
assert len(original_p_cases) == 8

v4_freeze = read_json(V4 / 'author-source-scope-remediation-v4.final.freeze.json', 'prior author freeze metadata only, no prior independent verdict')
v4_checks = [bound_check(e, V4) for e in v4_freeze['files']]
assert all(x['matches'] for x in v4_checks)
retained = [x for x in input_checks if '/source-overlays-inert/' in x['path']]
assert len(retained) == 17 and all(x['matches'] for x in retained)

ledger_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
ledger = read_json(ledger_path, 'current semantic-kind denominator identity only; no renewed A decision')
atomic_ids = sorted(d['goalId'] for d in ledger['decisions'] if d.get('semanticKind') == 'curricularAtomic')
assert len(atomic_ids) == 383
report_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json'
report = read_json(report_path, 'existing completed current central report counters; no new global run')
counters = [{k: s[k] for k in ['subject', 'denominator', 'strictComplete', 'remaining', 'gates']} for s in report['subjects'] if s['subject'] in ['chemie', 'biologie']]
assert [(x['subject'], x['strictComplete'], x['denominator']) for x in counters] == [('chemie', 112, 378), ('biologie', 67, 383)]
assert atomic_ids == sorted(next(s for s in report['subjects'] if s['subject'] == 'biologie')['currentGoalIds'])

primary_manifest = read_json(V5 / 'actual-primary-curricular-and-factual-inputs.author.json')
source_contexts = []
for key, first, last in [('MV', 30, 30), ('ST', 42, 43), ('HE', 38, 38)]:
    src = next(x for x in primary_manifest['sources'] if x['sourceKey'] == key)
    path = ROOT / src['actualOriginalPath']
    text = extract(path, first, last)
    author_extraction = read_bytes(Path(src['independentlyExtractedActualTextPath']), 'author extraction bytes compared with own fresh original-PDF extraction')
    source_contexts.append({'sourceKey': key, 'actualOriginalPath': path_label(path), 'actualOriginalSHA256': sha(path.read_bytes()),
                            'physicalPages': [first, last], 'ownExtractionSHA256': sha(text.encode()),
                            'authorExtractionByteExact': text.encode() == author_extraction, 'literalContext': text})
assert 'das Gefahrenpotenzial von Mutagenen im alltäglichen Leben reflektieren' in source_contexts[0]['literalContext']
assert 'Schuljahrgang 10 (Einführungsphase)' in source_contexts[1]['literalContext']
assert 'Umwelteinflüsse unter dem Aspekt der genetischen Risiken bewerten' in source_contexts[1]['literalContext']

prior_primary = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-source-operator-v4-independent-b-v1'
for key, name in [('BY12-GA', 'primary-BY12-GA.actual.html'), ('BY12-EA', 'primary-BY12-EA.actual.html')]:
    path = prior_primary / name
    raw = read_bytes(path, 'actual primary official HTML only; no prior review prose or verdict')
    text = BeautifulSoup(raw, 'html.parser').get_text(' ', strip=True)
    start = text.find('B12 2.4 Neukombination', text.find('B12 Lernbereich 2'))
    end = text.find('B12 2.5 Weitergabe', start)
    source_contexts.append({'sourceKey': key, 'actualOriginalPath': path_label(path), 'actualOriginalSHA256': sha(raw),
                            'section': 'B12 2.4', 'literalContext': text[start:end]})
    assert 'Auswirkung auf die Funktion des codierten Proteins' in text[start:end]
ncbi_path = prior_primary / 'primary-NCBI-standard-code.actual.html'
ncbi_raw = read_bytes(ncbi_path, 'actual primary NCBI standard code and exceptions read; no prior review verdict')
ncbi_soup = BeautifulSoup(ncbi_raw, 'html.parser')
pre = ncbi_soup.find('pre').get_text()
lines = {line.split('=')[0].strip(): line.split('=')[1].strip() for line in pre.splitlines() if '=' in line}
table = {''.join(b): aa for b, aa in zip(zip(lines['Base1'], lines['Base2'], lines['Base3']), lines['AAs'])}
codons = {'ATG': 'M', 'GAA': 'E', 'TTT': 'F', 'TGA': '*', 'TTC': 'F', 'GAC': 'D', 'GAG': 'E', 'TAA': '*'}
assert all(table[k] == v for k, v in codons.items())
source_contexts.append({'sourceKey': 'NCBI-standard-code', 'actualOriginalPath': path_label(ncbi_path),
                        'actualOriginalSHA256': sha(ncbi_raw), 'literalContext': pre, 'independentlyCheckedDNAStyleCodons': codons})

raw_base = ROOT / 'tmp/biologie-q1-source-operator-author-remediation-20261006-v5'
for key, name, needles in [('BfS-UV-protection', 'BfS-UV-protection.actual.html', ['Sonnenschutzmaßnahmen sind:', 'Zum einen können wir unser Verhalten ändern.']),
                            ('UBA-benzoapyrene', 'UBA-benzoapyrene.actual.html', ['Benzo(a)pyren entsteht auch', 'Gesundheitsrisiken PAK können'])]:
    path = raw_base / name
    raw = read_bytes(path, 'actual primary agency HTML factual premise read')
    text = BeautifulSoup(raw, 'html.parser').get_text(' ', strip=True)
    excerpts = []
    for needle in needles:
        i = text.find(needle)
        assert i >= 0
        excerpts.append(text[i:i+950])
    source_contexts.append({'sourceKey': key, 'actualOriginalPath': path_label(path), 'actualOriginalSHA256': sha(raw), 'literalContexts': excerpts,
                            'interpretationBoundary': 'qualitative factual input only; all case exposure values are fictional'})
for key, name, first, last in [('BfS-UV-DNA', 'BfS-UV-DNA.actual.pdf', 13, 13), ('IARC-air-DNA', 'IARC-air-DNA.actual.pdf', 1, 1)]:
    path = raw_base / name
    text = extract(path, first, last)
    source_contexts.append({'sourceKey': key, 'actualOriginalPath': path_label(path), 'actualOriginalSHA256': sha(path.read_bytes()),
                            'physicalPages': [first, last], 'ownExtractionSHA256': sha(text.encode()), 'literalContext': text,
                            'interpretationBoundary': 'qualitative damage/adduct premise only; no probability, threshold or empirical case values transferred'})

now = datetime.now(timezone.utc).isoformat()
write('primary-source-contexts.independent-b.json', {'createdAtUTC': now, 'sourceContexts': source_contexts,
       'STStageNativeCorrectionProven': False, 'STStageLiteral': 'Schuljahrgang 10 (Einführungsphase)',
       'STStageHoldRetained': True, 'wholeOriginalClearance': False})
write('continuity-and-preservation.actual.json', {'createdAtUTC': now, 'caseComparisons': case_rows, 'componentComparisons': component_rows,
       'unchanged20Cases': unchanged, 'revised2Cases': revised, 'new2Cases': new, 'v4OwnBoundFilesVerified': len(v4_checks),
       'v4OwnBoundFileChecks': v4_checks, 'inertSourceMappingPayloads17': retained,
       'canonicalInertEnvelopeSHA256': sha(envelope_path.read_bytes()), 'frozen464ContentSHA256': sha(preserved_utf8),
       'actualCurrentCanonicalSHA256': sha(current_path.read_bytes()), 'frozenWholeGoals': 464, 'actualCurrentWholeGoals': 464,
       'sameIDSet': True, 'candidateEqualsCurrentRuntime': False, 'exactFourPlannedGoalTextResourceLinkDeltas': goal_deltas,
       'originalFourOperativeDEENDescriptionsInFrozenCandidatePreserved': True, 'priorNativePRecordCount': 4,
       'priorNativePProfileByteBindings': p_bodies, 'originalEightPCaseBodiesRetainedByExactFrozenInputBytes': True,
       'originalEightPCaseBodyByteBindings': original_p_cases,
       'newGoalIDsAssigned': 0, 'activeWrites': 0})
write('targeted-checks.actual.json', {'createdAtUTC': now, 'exitCode': 0,
       'authorV5FinalFreezeSHA256': sha(freeze_data), 'authorOwnFiles10': own_checks, 'authorActualInputs49': input_checks,
       'allAuthorBytesMatch': True, 'elevenComponents': 11, 'twentyfourCompleteCases': 24, 'sixFieldChecks': field_rows,
       'twentyExactContinuity': 20, 'twoRevisedOriginalCases': revised, 'twoNewDecisionCases': new,
       'sevenNullIDComponents': 7, 'actualNCBICodonsChecked': codons,
       'GAAAnticodon3to5': 'CUU', 'GAAAnticodon5to3': 'UUC',
       'UVSpecifiedExposureRanking': {'A': 100, 'B': 25, 'C': 10},
       'PAHFiveDayCentralSums': {'A': 12*5, 'B': 2*5, 'C': 11*5},
       'actualCurrentCurricularAtomicIDs383MatchExistingCentralReport': True, 'existingCentralCounters': counters,
       'newGlobalChecksRun': 0, 'nativeApprovalsCreated': 0, 'currentM7NetIncrease': 0,
       'scienceAndAtomicityRequireIndependentSemanticDecisionBeyondTheseMechanicalChecks': True})
write('actual-inputs.independent-b.freeze.json', {'createdAtUTC': now, 'role': 'fresh independent targeted B; author inputs retained in place',
       'files': sorted(USED.values(), key=lambda x: x['path']), 'inputCount': len(USED),
       'contentReadBoundary': 'Prior A/B report or verdict files were never parsed or read as review content. Their bytes were hashed only because they occur in the author49 freeze. Author README disclosed a historical summary; it is contextual author prose and did not determine current decisions. New peer output was not read.',
       'inputTreesCopied': 0, 'activeWrites': 0})
print(json.dumps({'exitCode': 0, 'authorOwn10': len(own_checks), 'authorInputs49': len(input_checks), 'components': 11,
                  'completeCases': 24, 'exactCases': 20, 'revisedCases': revised, 'newCases': new,
                  'v4OwnVerified': len(v4_checks), 'current464NotCandidate': True, 'newGlobalRuns': 0, 'inputCount': len(USED)}, ensure_ascii=False))
