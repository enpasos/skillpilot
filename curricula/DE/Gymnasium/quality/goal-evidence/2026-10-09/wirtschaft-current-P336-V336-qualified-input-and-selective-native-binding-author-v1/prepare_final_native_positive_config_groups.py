from pathlib import Path
import argparse
import collections
import hashlib
import json

parser = argparse.ArgumentParser()
parser.add_argument('--root', required=True)
parser.add_argument('--intake', required=True)
parser.add_argument('--criteria-index', required=True)
parser.add_argument('--bound-P336', required=True)
parser.add_argument('--canonical', required=True)
parser.add_argument('--accepted-frame-sha', required=True)
parser.add_argument('--ledger', required=True)
parser.add_argument('--out', required=True)
args = parser.parse_args()
root = Path(args.root).resolve()


def safe(path):
    p = (root / path).resolve()
    p.relative_to(root)
    return p


def bind(path):
    p = safe(path)
    b = p.read_bytes()
    return {'path': str(p.relative_to(root)), 'sha256': hashlib.sha256(b).hexdigest(), 'wholeBytes': len(b)}


frame = json.loads(safe(args.canonical).read_bytes())
assert bind(args.canonical)['sha256'] == args.accepted_frame_sha
ledger = json.loads(safe(args.ledger).read_bytes())
assert ledger['sourceLandscapeId'] == frame['landscapeId']
kinds = {d['goalId']: d for d in ledger['decisions']}
intake = json.loads(safe(args.intake).read_bytes())
criteria = json.loads(safe(args.criteria_index).read_bytes())
records = [json.loads(line) for line in safe(args.bound_P336).read_bytes().splitlines() if line.strip()]
rows = {r['goalId']: r for r in intake['wholeSelectedPositiveRows']}
groups = collections.defaultdict(list)
for record in records:
    gid = record['goalId']
    old = rows[gid]['wholeRecord']
    assert {k: v for k, v in record.items() if k not in ['goalFingerprint', 'reviewInputFingerprint']} == {k: v for k, v in old.items() if k not in ['goalFingerprint', 'reviewInputFingerprint']}
    assert record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
    assert kinds[gid]['semanticKind'] == 'curricularAtomic' and kinds[gid]['decisionStatus'] == 'authoritative'
    groups[(record['reviewId'], record['reviewCriteriaFingerprint'])].append(record)
assert len(records) == 336 and len(rows) == 336
out = safe(args.out)
out.mkdir(exist_ok=False)
entries = []
for number, ((review_id, fingerprint), group) in enumerate(sorted(groups.items()), 1):
    match = criteria['matches'][fingerprint][0]
    path = match['path']
    assert 'sha256:' + bind(path)['sha256'] == fingerprint
    record_path = out / f'{number:02d}.whole-original-profile-current-binding.review.jsonl'
    record_path.write_text('\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in group) + '\n')
    config = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
        'schemaVersion': 2,
        'reviewId': review_id,
        'goalFingerprintRuleVersion': 'goal-evidence-v1',
        'profileRuleVersion': 'positive-understanding-evidence-v2',
        'landscapeId': frame['landscapeId'],
        'landscapePath': args.canonical,
        'semanticKindLedgerPath': args.ledger,
        'reviewCriteriaPath': path,
        'reviewPath': str(record_path.relative_to(root)),
        'reviewedResourceTypes': ['goal-visualization'],
        'requireApproved': False,
        'scope': {'label': 'Exact qualified current positive profiles; technical binding only, separate human release remains pending', 'goalIds': [r['goalId'] for r in group]},
    }
    config_path = out / f'{number:02d}.positive-current-native.inert.config.json'
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
    entries.append({'config': bind(str(config_path.relative_to(root))), 'records': bind(str(record_path.relative_to(root))), 'reviewId': review_id, 'criteria': bind(path), 'actualProfiles': len(group), 'actualCases': sum(len(r['profile']['applicationCaseBriefs']) for r in group)})
index = {'role': 'Data-only prospective native configs, no active registry write or science/status changes', 'wholeFrame': bind(args.canonical), 'wholeAuthoritativeLedger': bind(args.ledger), 'wholeBoundP336': bind(args.bound_P336), 'groups': entries, 'actualGroupCount': len(entries), 'actualProfileCount': sum(e['actualProfiles'] for e in entries), 'actualCaseCount': sum(e['actualCases'] for e in entries), 'humanApproval': False, 'strictNetGain': 0}
index_path = out / 'actual-final-native-config-group-index.json'
index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'index': bind(str(index_path.relative_to(root))), 'groups': len(entries), 'profiles': index['actualProfileCount'], 'cases': index['actualCaseCount']}, indent=2))
