# SPDX-License-Identifier: Apache-2.0
"""Finite hashes and object equality only; no scientific review decisions."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T2-terminal-exams-author-20261018-v4'
OUT = Path(__file__).parent

def read(path):
    return json.loads(Path(path).read_text())

def digest(path):
    data = Path(path).read_bytes()
    return {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def object_digest(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()

seal = read(AUTHOR / 'FREEZE.author.sha256.json')
seal_checks = [{'path': row['path'], 'equal': digest(ROOT / row['path']) == {key: row[key] for key in ['sha256', 'bytes']}} for row in seal['files']]
config_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
subject = next(row for row in read(config_path)['subjects'] if row['subject'] == 'chemie')
canonical = {goal['id']: goal for goal in read(ROOT / subject['landscapePath'])['goals']}
active_profiles = {}
for config in subject['positiveEvidenceConfigPaths']:
    cfg = read(ROOT / config)
    ids = set(cfg.get('scope', {}).get('goalIds', []))
    for number, line in enumerate((ROOT / cfg['reviewPath']).read_text().splitlines(), 1):
        if line.strip():
            record = json.loads(line)
            if record['goalId'] in ids:
                active_profiles.setdefault(record['goalId'], []).append((config, cfg['reviewPath'], number, record))

ordinary = []
for goal in read(AUTHOR / 'INPUT.ordinary-goals.selected-only.json'):
    gid = goal['id']
    old = read(AUTHOR / f'inputs/whole-P.{gid}.json')
    matches = active_profiles.get(gid, [])
    ordinary.append({
        'goalId': gid,
        'wholeCanonicalGoalEqual': goal == canonical[gid],
        'frozenGoalObjectSHA256': object_digest(goal),
        'currentGoalObjectSHA256': object_digest(canonical[gid]),
        'canonicalChangedFields': [key for key in set(goal) | set(canonical[gid]) if goal.get(key) != canonical[gid].get(key)],
        'activePMatches': len(matches),
        'profiles': [{
            'configPath': config, 'reviewPath': review_path, 'lineOneBased': number,
            'wholeRecordEqual': current == old,
            'profileBodyEqual': current.get('profile') == old.get('profile'),
            'frozenProfileBodyObjectSHA256': object_digest(old.get('profile')),
            'currentProfileBodyObjectSHA256': object_digest(current.get('profile')),
            'currentStatus': current.get('status'), 'currentReviewAuthority': current.get('reviewAuthority'),
            'changedRecordFields': [key for key in set(current) | set(old) if current.get(key) != old.get(key)],
        } for config, review_path, number, current in matches],
    })

materials = []
for row in read(AUTHOR / 'INPUT.material-bindings.exact-selected.json'):
    source = ROOT / row['path']
    data = read(source)
    if row['jsonPointer']:
        for key in row['jsonPointer'].strip('/').split('/'):
            data = data[int(key)] if isinstance(data, list) else data[key.replace('~1', '/').replace('~0', '~')]
    frozen = read(AUTHOR / f"inputs/material.{row['goalId']}.{row['caseId']}.json")
    materials.append({**row,
        'sourceHashEqual': digest(source)['sha256'] == row['sha256'],
        'wholeCaseObjectEqual': data == frozen.get('raw', frozen),
        'frozenWholeObjectSHA256': object_digest(frozen),
    })

result = {
    'artifactRole': 'MECHANICAL_BINDING_FACTS_NOT_CONTENT_VERDICT',
    'authorSeal': digest(AUTHOR / 'FREEZE.author.sha256.json'),
    'authorSealMembers': seal_checks,
    'registry': {'path': str(config_path.relative_to(ROOT)), **digest(config_path)},
    'canonical': {'path': subject['landscapePath'], **digest(ROOT / subject['landscapePath'])},
    'ordinaryBindings': ordinary,
    'materials': materials,
}
new_objects = []
for goal in read(AUTHOR / 'AUTHOR.new-goals.full.draft.json')['newGoals']:
    fields = {}
    for key, suffix in [('taskContent', 'task.de'), ('taskContentEn', 'task.en'), ('solutionContent', 'solution.de'), ('solutionContentEn', 'solution.en')]:
        text = goal['examData'][key]
        path = AUTHOR / f"tasks/{goal['id']}.{suffix}.md"
        fields[key] = {'sha256_utf8': hashlib.sha256(text.encode()).hexdigest(), 'characters': len(text), 'matchingTaskFile': str(path.relative_to(ROOT)), 'textEqualIgnoringSingleFinalNewline': path.read_text().removesuffix('\n') == text.removesuffix('\n')}
    new_objects.append({'endpointId': goal['id'], 'wholeGoalObjectSHA256': object_digest(goal), 'fields': fields,
        'scoringObjectSHA256': object_digest(goal['examData']['scoring']),
        'scoringPointsSum': sum(row['points'] for row in goal['examData']['scoring']['steps']),
        'declaredMaxPoints': goal['examData']['scoring']['maxPoints'],
        'declaredPassingPoints': goal['examData']['scoring']['passingPoints'],
    })
result['newExamObjectBindings'] = new_objects
(OUT / 'CHECK.frozen-and-active-bindings.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('Author seal members:', len(seal_checks), 'nonmatches:', sum(not row['equal'] for row in seal_checks))
for row in ordinary:
    print(row['goalId'], 'canonicalEqual', row['wholeCanonicalGoalEqual'], row['canonicalChangedFields'], 'P', [(p['profileBodyEqual'], p['changedRecordFields']) for p in row['profiles']])
print('Material rows:', len(materials), 'hash nonmatches:', sum(not row['sourceHashEqual'] for row in materials), 'object nonmatches:', sum(not row['wholeCaseObjectEqual'] for row in materials))
