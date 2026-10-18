# SPDX-License-Identifier: Apache-2.0
"""Finite exact input, diff and graph facts; no scientific verdict generation."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
HERE = Path(__file__).resolve().parent
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
AUTHOR = BASE / 'chemie-current450-twenty-seven-orientation-entry-author-20261018-v1'
LANG = BASE / 'chemie-current450-orientation-anchor-language-author-20261018-v2'

def read(path):
    return json.loads((ROOT / path).read_text())

def pin(path):
    raw = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def changes(a, b):
    return sorted(k for k in a.keys() | b.keys() if a.get(k) != b.get(k))

def cycles(goals, field):
    by_id = {g['id']: g for g in goals}
    seen, active, errors = set(), [], []
    def visit(gid):
        if gid in active:
            errors.append(active[active.index(gid):] + [gid])
            return
        if gid in seen:
            return
        active.append(gid)
        for rid in by_id[gid].get(field, []):
            if rid in by_id:
                visit(rid)
            else:
                errors.append({'missingReference': rid, 'from': gid})
        active.pop()
        seen.add(gid)
    for gid in by_id:
        visit(gid)
    return errors

a = read(AUTHOR / 'AUTHOR.27-orientation-entry-requires-only.pending.json')
lang = read(LANG / 'AUTHOR.whole-orientation-before-and-candidate.pending.json')
profiles = read(AUTHOR / 'INPUT.actual-current27-whole-positive-evidence.json')
graph_path = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
registry_path = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
semantic_path = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
g = read(graph_path)
by_id = {x['id']: x for x in g['goals']}
anchor = a['orientationAnchorGoalId']
subject = next(x for x in read(registry_path)['subjects'] if x['subject'] == 'chemie')
owners = {}
for cfg_path in subject['positiveEvidenceConfigPaths']:
    cfg = read(cfg_path)
    wanted = set(cfg['scope']['goalIds'])
    records = [json.loads(line) for line in (ROOT / cfg['reviewPath']).read_text().splitlines() if line.strip()]
    for rec in records:
        if rec['goalId'] in wanted:
            owners.setdefault(rec['goalId'], []).append((cfg_path, cfg['reviewPath'], rec))
rows = []
for row, frozen in zip(a['records'], profiles, strict=True):
    gid = row['goalId']
    before, after = row['beforeWholeGoal'], row['proposedWholeGoal']
    owner = owners.get(gid, [])
    rows.append({'goalId': gid, 'frozenProfileGoalId': frozen['goalId'],
        'beforeWholeGoalEqualsCurrent': before == by_id[gid],
        'actualChangedFields': changes(before, after),
        'existingRequiresPreservedInOrder': after['requires'] == before.get('requires', []) + [anchor],
        'anchorWasPreviouslyAbsent': anchor not in before.get('requires', []),
        'activeOwnerCount': len(owner),
        'wholeFrozenPEqualsCurrentOwner': len(owner) == 1 and owner[0][2] == frozen,
        'activeOwnerPins': [{'config': pin(c), 'records': pin(r)} for c, r, _ in owner],
        'authorOwnerPinsStillExact': all(pin(v['path']) == v for v in row['currentPositiveEvidenceOwner'].values())})
draft = json.loads(json.dumps(g))
replacements = {x['goalId']: x['proposedWholeGoal'] for x in a['records']}
replacements[anchor] = lang['candidate']
draft['goals'] = [replacements.get(x['id'], x) for x in draft['goals']]
seals = []
for path in [AUTHOR/'SEAL.author-candidate.no-review-or-normal-write.json', LANG/'SEAL.author-orientation-language-candidate.json']:
    seal = read(path)
    seals.append({'seal': pin(path), 'memberCount': len(seal['files']),
        'members': [{**pin(x['path']), 'matchesSeal': pin(x['path']) == x} for x in seal['files']]})
materials = [
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-materials-resources-material-author-20261017-v1/materials') / n
    for n in ['hb199-greenhouse-energy-climate.DE-EN.json', 'hb201-btl-fischer-tropsch.DE-EN.json', 'hb208-recovery-routes.DE-EN.json', 'hb230-actual-digital-aromatics.DE-EN.json']]
materials += [Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-polarimetry-two-duties-P1-author-20261017-v1/MATERIAL.complete-DE-EN.polarimeter-and-two-concentration-cases.AUTHOR.json'),
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json'),
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json')]
result = {'artifactRole': 'FINITE_EXACT_FACTS_NO_SCIENTIFIC_VERDICTS',
    'currentNormalPins': [pin(x) for x in [graph_path, registry_path, semantic_path]],
    'authorSeals': seals, 'recordCount': len(rows), 'rows': rows,
    'orientation': {'goalId': anchor, 'wholeBeforeEqualsCurrent': lang['before'] == by_id[anchor],
        'actualChangedFields': changes(lang['before'], lang['candidate']),
        'authorSnapshotEqualsCurrent': read(AUTHOR/'INPUT.existing-orientation.whole.json.snapshot') == by_id[anchor],
        'semanticDecision': next(x for x in read(semantic_path)['decisions'] if x['goalId'] == anchor)},
    'graphFacts': {'currentGoalCount': len(g['goals']), 'proposedGoalCount': len(draft['goals']),
        'currentRequiresProblems': cycles(g['goals'], 'requires'), 'proposedRequiresProblems': cycles(draft['goals'], 'requires'),
        'currentContainsProblems': cycles(g['goals'], 'contains'), 'proposedContainsProblems': cycles(draft['goals'], 'contains')},
    'actuallyReadExternalMaterialPins': [pin(x) for x in materials], 'normalWrites': 0}
(HERE/'CHECK.exact-current-inputs-and-delta.json').write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n')
print(json.dumps({'rows': len(rows), 'all27CurrentWholeGoalsExact': all(x['beforeWholeGoalEqualsCurrent'] for x in rows),
    'all27CurrentWholePExact': all(x['wholeFrozenPEqualsCurrentOwner'] for x in rows),
    'onlyRequiresChanged': all(x['actualChangedFields'] == ['requires'] for x in rows),
    'all27SingleAppends': all(x['existingRequiresPreservedInOrder'] and x['anchorWasPreviouslyAbsent'] for x in rows),
    'authorSealMembersExact': all(x['matchesSeal'] for s in seals for x in s['members']),
    'orientation': result['orientation'], 'graphFacts': result['graphFacts']}, indent=2))
