#!/usr/bin/env python3
"""Serialize separately made scientific decisions; native fingerprints are bindings."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, subprocess

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OWN = BASE / 'biologie-ni-thirteen-positive-profile-independent-root-followup-v1'
OLD = BASE / 'biologie-ni-thirteen-positive-profile-remediation-author-v1'
AMEND = BASE / 'biologie-ni-one-positive-case-functional-witness-author-v2'
CODE = ROOT / 'tmp/biologie-ni-thirteen-positive-profile-remediation-author-v1-native-root'
EDA = 'eda5b810-d9d3-5319-9c4f-5b48715b26f2'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def write(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def verify(rel):
    path = ROOT / rel
    data = json.loads(path.read_text())
    for item in data['files']:
        actual = ROOT / item['path']
        assert sha(actual) == item['sha256'], item['path']
        assert actual.stat().st_size == item['bytes'], item['path']
    return {'path': str(rel), 'sha256': sha(path), 'verifiedFiles': len(data['files'])}

def main():
    out = ROOT / OWN
    frozen = [verify(OLD / 'author-positive-profile-remediation.final.freeze.json'),
              verify(AMEND / 'one-case-author-amendment.final.freeze.json'),
              verify(OWN / 'independent-profile-science.before-case-followup.final.freeze.json')]
    prior = json.loads((ROOT / AMEND / 'positive.eighteen.before.exact.candidates.snapshot.json').read_text())
    current = json.loads((ROOT / AMEND / 'positive.eighteen.first-case-amended-author.candidates.json').read_text())
    before = {row['goalId']: row for row in prior['goals']}
    after = {row['goalId']: row for row in current['goals']}
    assert list(before) == list(after)
    for goal_id in before:
        if goal_id != EDA:
            assert before[goal_id] == after[goal_id]
    old_profile, new_profile = before[EDA]['profile'], after[EDA]['profile']
    assert old_profile['applicationCaseBriefs'][1] == new_profile['applicationCaseBriefs'][1]
    restored = copy.deepcopy(new_profile)
    restored['applicationCaseBriefs'][0] = old_profile['applicationCaseBriefs'][0]
    assert restored == old_profile
    first_before, first_after = old_profile['applicationCaseBriefs'][0], new_profile['applicationCaseBriefs'][0]
    fields = ['taskDemandDe', 'taskDemandEn', 'expectedPerformanceDe', 'expectedPerformanceEn', 'understandingFocusDe', 'understandingFocusEn']
    assert [key for key in first_before if first_before[key] != first_after[key]] == fields
    initial = json.loads((out / 'manual-current-profile-science.input.json').read_text())
    now = datetime.now(timezone.utc).isoformat()
    reason = ('Der vollständig gelesene DE/EN-Nachtrag verlangt jetzt den konkreten Funktionsbeleg: '
              'bereits vorhandene erbliche dunkle Käfervariante, dunkler Untergrund und Tarnung, seltenere '
              'Vogelentdeckung unter gleichen Bedingungen, mehr später fortpflanzende Nachkommen und '
              'erbliche Häufigkeitszunahme über Generationen. Erwartung und Fallfokus fordern die ganze '
              'Umwelt-/Funktions-/Selektionskette und erklären ausdrücklich, warum Vererbbarkeit und '
              'Zeitskala allein nicht genügen. Der kontrolliert nicht-erbliche Muskelzuwachs bleibt '
              'individuelle Veränderung; Bedarf erzeugt keine zielgerichteten Varianten und der '
              'Farbvorteil wird nicht auf jede Umwelt übertragen. Der zweite vollständig gelesene '
              'Kältefall bleibt exakt und fachlich gültig. Beide Fälle erfüllen denselben begrenzten '
              'positiven Vertrag; keine molekulare oder beobachtete Lernenden-Evidenz wird behauptet.')
    followup = {
        'schemaVersion': 1, 'reviewedAtUTC': now,
        'reviewer': 'Codex Root; independent of NI goal and positive-profile authors',
        'goalId': EDA, 'caseId': 'training-versus-selection',
        'findingId': initial['newFinding']['findingId'], 'status': 'resolved',
        'decision': 'keep', 'reason': reason,
        'actualReadScope': 'Complete amended EDA expectation, coverage, variation axes and both full DE/EN case briefs; first-case six-field changes reviewed in context.',
        'changedScientificFields': fields, 'otherEntireProfilesExact': 17,
        'otherEntireCaseBriefsExact': 35, 'original32FindingsRemainResolved': True,
        'initialIndependentScienceFreeze': frozen[2], 'authorAmendmentFreeze': frozen[1],
        'humanApproval': False, 'humanTrial': False, 'observedLearnerEvidence': False,
        'activeWrites': 0, 'operativeStrictNetIncrease': 0
    }
    write(out / 'independent-single-case-functional-witness-followup.actual.json', followup)
    candidate = copy.deepcopy(current)
    candidate.update({'reviewId': 'biologie-ni-thirteen-positive-independent-root-followup-20261006-v1',
                      'reviewedAt': now,
                      'reviewer': 'Codex Root independent current P13 follow-up; not NI goal or profile author'})
    selected = []
    for row in candidate['goals']:
        key = row['goalId'][:8]
        if key not in initial['decisionsByGoalPrefix']:
            continue
        decision = initial['decisionsByGoalPrefix'][key]
        assert decision['decision'] == 'keep' or row['goalId'] == EDA
        row['reason'] = reason if row['goalId'] == EDA else decision['reason']
        row['dissent'] = ['E1/G1 AI candidate only; no observed learner or laboratory performance. Human approval and trial remain separate and unestablished.']
        selected.append(row)
    assert len(selected) == 13
    candidate['goals'] = selected
    cfg = json.loads((ROOT / AMEND / 'positive.eighteen.first-case-amended-author.config.json').read_text())
    cfg['reviewId'] = candidate['reviewId']
    cfg['reviewPath'] = str(OWN / 'positive.thirteen.independent-current.review.jsonl')
    cfg['scope'] = {'label': 'Independent P13 follow-up: twelve retained current decisions and one targeted first-case resolution; earlier five profiles stay separately owned.',
                    'goalIds': [row['goalId'] for row in selected]}
    cp = out / 'positive.thirteen.independent-current.candidates.json'
    fp = out / 'positive.thirteen.independent-current.config.json'
    write(cp, candidate); write(fp, cfg)
    link = CODE / OWN
    link.parent.mkdir(parents=True, exist_ok=True)
    assert not link.exists()
    link.symlink_to(out, target_is_directory=True)
    tsx = str(CODE / 'app/node_modules/.bin/tsx')
    materializer = str(CODE / 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')
    checker = str(CODE / 'app/scripts/positiveGoalEvidenceReview.ts')
    commands = [[tsx, materializer, '--config', str(fp.relative_to(ROOT)), '--candidates', str(cp.relative_to(ROOT)), '--write'],
                [tsx, materializer, '--config', str(fp.relative_to(ROOT)), '--candidates', str(cp.relative_to(ROOT))],
                [tsx, checker, '--config=' + str(fp.relative_to(ROOT)), '--mode=check']]
    receipts = []
    for i, command in enumerate(commands, 1):
        start = datetime.now(timezone.utc).isoformat()
        result = subprocess.run(command, cwd=CODE, capture_output=True)
        stdout, stderr = out / f'native-positive-{i}.stdout.txt', out / f'native-positive-{i}.stderr.txt'
        stdout.write_bytes(result.stdout); stderr.write_bytes(result.stderr)
        receipts.append({'command': command, 'cwd': str(CODE), 'startedAtUTC': start,
                         'completedAtUTC': datetime.now(timezone.utc).isoformat(), 'actualExitCode': result.returncode,
                         'stdoutPath': str(stdout.relative_to(ROOT)), 'stdoutSHA256': sha(stdout),
                         'stderrPath': str(stderr.relative_to(ROOT)), 'stderrSHA256': sha(stderr),
                         'scriptSHA256': sha(command[1])})
        write(out / 'native-thirteen-current-positive.actual.receipt.json', {'checks': receipts,
              'scienceWasMadeBeforeNativeBindings': True, 'activeWrites': 0, 'humanApproval': False})
        print(json.dumps({'step': i, 'exitCode': result.returncode, 'stdout': result.stdout.decode()}), flush=True)
        assert result.returncode == 0
    rows = [json.loads(line) for line in (ROOT / cfg['reviewPath']).read_text().splitlines() if line]
    assert len(rows) == 13
    authored = {row['goalId']: row for row in map(json.loads, (ROOT / AMEND / 'positive.eighteen.first-case-amended-author.review.jsonl').read_text().splitlines())}
    for row in rows:
        old = authored[row['goalId']]
        for key in ['profile', 'profileFingerprint', 'goalFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint']:
            assert row[key] == old[key], (row['goalId'], key)
        assert (row['status'], row['reviewAuthority'], row['evidenceLevel'], row['maximumClaimScope']) == ('needs_human_review', 'ai_candidate', 'E1', 'G1')
    verified_after = [verify(OLD / 'author-positive-profile-remediation.final.freeze.json'),
                      verify(AMEND / 'one-case-author-amendment.final.freeze.json'),
                      verify(OWN / 'independent-profile-science.before-case-followup.final.freeze.json')]
    assert frozen == verified_after
    write(out / 'actual-final-current-profile-and-history-protection.json', {
          'schemaVersion': 1, 'profilesPassedIndependentScience': 13,
          'retainedEarlierDecisions': 12, 'targetedChangedCaseResolved': 1,
          'originalFindingsResolved': 32, 'newFindingResolved': 1, 'openFindings': 0,
          'nativeChecksExitCodes': [x['actualExitCode'] for x in receipts],
          'allInnerProfilesAndGoalInputCriteriaBindingsExactToAmendedAuthor': True,
          'separateEarlierFiveCurrentProfilesNotRelabelledOrReReviewed': True,
          'verifiedFrozenInputsBefore': frozen, 'verifiedFrozenInputsAfter': verified_after,
          'approved': 0, 'needsHumanReview': 13, 'authority': 'ai_candidate',
          'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False,
          'humanTrial': False, 'activeWrites': 0, 'operativeStrictNetIncrease': 0})
    (out / 'README.md').write_text('# NI P13 independent targeted follow-up\n\n'
        'The initial independent result remains immutable: twelve KEEP, one newly found first-case HOLD. '
        'The separate six-field author amendment was read in its full bilingual profile context; the concrete '
        'camouflage/environment/function/reproduction chain resolves that finding. All thirteen profiles now '
        'pass independent machine content review. The original 32 findings and the new single-case finding '
        'are resolved. The other twelve valid judgments are retained.\n\n'
        'Three actual native checks passed on the exact inactive canonical input and scope thirteen. '
        'Fingerprints bind already made content decisions. The five earlier valid positive profiles remain '
        'separately owned and are not relabelled. All records remain ai_candidate, needs_human_review, E1/G1; '
        'no learner observations, Human Approval or Human Trial. No active files were changed; strict net '
        'increase remains zero pending reviewed integration.\n')
    target = out / 'independent-positive-followup.final.freeze.json'
    files = [{'path': str(p.relative_to(ROOT)), 'bytes': p.stat().st_size, 'sha256': sha(p)}
             for p in sorted(out.rglob('*')) if p.is_file() and p != target]
    write(target, {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
          'kind': 'independent_current_positive_thirteen_targeted_followup',
          'fileCount': len(files), 'files': files, 'positiveProfilesKEEP': 13,
          'original32FindingsResolved': True, 'additionalFirstCaseFindingResolved': True,
          'nativeExitCodes': [x['actualExitCode'] for x in receipts], 'activeWrites': 0,
          'operativeStrictNetIncrease': 0, 'humanApproval': False, 'humanTrial': False})
    print(json.dumps({'freezePath': str(target.relative_to(ROOT)), 'sha256': sha(target), 'fileCount': len(files)}))

if __name__ == '__main__':
    main()
