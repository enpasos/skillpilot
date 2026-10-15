# SPDX-License-Identifier: Apache-2.0
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[8]
O = Path(__file__).resolve().parents[1]
A = O.parent / 'chemie-source-six-original-residual-duty-author-20261014-v1'
first = O / 'FIRST-SCIENCE-SEAL.original-residual6-source-two-whole-goal-P-A-M-kind-independent-a.actual.json'
assert hashlib.sha256(first.read_bytes()).hexdigest() == '9e83d6405a016f576935a91ae9be3a296067c71556548194b7ab9ebee266e98b'
science = [json.loads(l) for l in (O / 'science/FIRST.two-whole-goals-four-whole-cases-P-A-M-kind.independent-a.actual.jsonl').read_text().splitlines()]
notes = {x['goalId']: x for x in science}
review_id = 'chemie-residual-six-original-source-two-whole-p-am-independent-a-20261014-v1'
reviewer = 'Genuine independent A, OpenAI GPT-6 Codex; exact model revision and sampling parameters unknown'
for d in ['A', 'M', 'P', 'config']:
    (O / d).mkdir(exist_ok=True)


def rel(p): return str(p.relative_to(R))


def write(p, x):
    assert not p.exists()
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')


for gate in ['A', 'M']:
    rows = [json.loads(l) for l in (A / gate / 'two-native-pending-author-records.jsonl').read_text().splitlines()]
    for row in rows:
        n = notes[row['goalId']]
        row.update({'reviewId': review_id, 'reviewer': reviewer, 'reviewedAt': n['scientificDecidedAtUTC'],
                    'reason': n['Areason'] if gate == 'A' else n['Mreason']})
        if gate == 'A': row.update({'status': n['Adecision'], 'semanticAtomic': n['Adecision'] == 'atomic'})
        else: row.update({'status': n['Mdecision'], 'memoryUseful': False})
    path = O / gate / f'two-whole-goals.genuine-independent-a.{gate.lower()}.review.jsonl'
    assert not path.exists()
    path.write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in rows))
    cfg = json.loads((A / 'config' / f'{gate}2.author-pending.config.json').read_text())
    cfg.update({'reviewId': review_id, 'reviewPath': rel(path)})
    cfg['scope']['label'] = 'Two exact whole goals with sealed genuine independent A original-science decisions'
    if gate == 'M':
        empty = O / 'M/empty-two-no-memory-needed-card-stream.jsonl'
        empty.write_text('')
        cfg['cardReviewPath'] = rel(empty)
    write(O / 'config' / f'{gate}2.genuine-independent-a.config.json', cfg)

p_rows = [json.loads(l) for l in (A / 'P/two-whole-goal-author-E0-G0.profiles.jsonl').read_text().splitlines()]
for p in p_rows:
    n = notes[p['goalId']]
    old_profile = copy.deepcopy(p['profile'])
    p.update({'reviewId': review_id, 'reviewer': reviewer, 'reviewedAt': n['scientificDecidedAtUTC'],
              'reason': n['PDesignDecision'] + '. ' + ' '.join(n['PReasons']) + ' Actual independent original-design review only. No learner execution, Human approval, authoritative kind transport, native D/V, whole-course source or acquisition clearance.',
              'evidenceLevel': 'E1' if n['PDesignDecision'] == 'ACCEPT_COMPLETE_BOUNDED_DESIGN' else 'E0',
              'maximumClaimScope': 'G1' if n['PDesignDecision'] == 'ACCEPT_COMPLETE_BOUNDED_DESIGN' else 'G0',
              'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'reviewRunIds': [],
              'dissent': [] if not n['blockingFindings'] else ['Original case2 e3 is not a complete inline assignment: actual D handling rules are missing in both languages.']})
    assert p['profile'] == old_profile
path = O / 'P/original-two-whole-profiles.genuine-independent-a.c307-E1G1-e5d-HOLD-E0G0.review.jsonl'
assert not path.exists()
path.write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in p_rows))
write(O / 'science/KIND.two-actual-independent-a-classifications-authority-transport-pending.json', {
    'schemaVersion': 1, 'scienceSeal': rel(first), 'newAuthoritativeKindRegistry': False,
    'decisions': [{'goalId': n['goalId'], 'decision': n['kindScience'], 'reason': n['kindReason'], 'scientificDecidedAtUTC': n['scientificDecidedAtUTC']} for n in science],
})
write(O / 'checks/ACTUAL.post-firstseal-exposure-and-formal-record-boundary.json', {
    'schemaVersion': 1, 'recordedAtUTC': datetime.now(timezone.utc).isoformat(),
    'exposureAfterOwnFirstScience': 'Parent then stated its independent root science agrees on missing D card, c307 complete, both AM/kind and bounded source components. No root scientific files read or used to change own decisions.',
    'firstScienceNotChanged': True, 'originalProfileBodiesAndStockFingerprintsPreserved': True,
    'normalPositivePSelectionStatus': 'HOLD: no operative new kind authority fabricated; original e5d P design remains E0/G0. Only closed schema and exact structural/profile joins are asserted here.',
    'sourceAndAcquisitionHoldsPreserved': True,
})
print('Materialized genuine A2/M2; P c307 E1/G1 and original e5d E0/G0 HOLD, exact unchanged profile bodies.')
