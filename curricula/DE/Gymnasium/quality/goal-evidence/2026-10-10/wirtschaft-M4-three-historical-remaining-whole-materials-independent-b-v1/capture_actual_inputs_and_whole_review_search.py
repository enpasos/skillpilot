#!/usr/bin/env python3
"""Bounded independent intake. Writes evidence only, never active inputs."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
REG = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
MIDS = ['591b870a-f10b-5b05-baf9-2f7fc40fd74b', '58cc062b-31b4-5879-a6c5-4ea60ce9e13c', 'a47e8fca-3ce1-5edb-90b4-28225b02340a']
bindings = []

def bind(path):
    p = ROOT / path
    b = p.read_bytes()
    row = {'path': str(path), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b), 'symlink': p.is_symlink()}
    if row not in bindings:
        bindings.append(row)
    return row

def dump(name, obj):
    p = OUT / name
    assert not p.exists(), f'No historical overwrite: {p}'
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

current = json.loads((ROOT / CAN).read_text())
goals = {g['id']: g for g in current['goals']}
materials = [goals[x] for x in MIDS]
gids = list(dict.fromkeys(x for g in materials for x in g['examData']['coveredGoalIds']))
assert len(gids) == 11
registry = json.loads((ROOT / REG).read_text())
entry = next(x for x in registry['subjects'] if x['subject'] == 'wirtschaftswissenschaften')
profiles = []
for cp in entry['positiveEvidenceConfigPaths']:
    config = json.loads((ROOT / cp).read_text())
    if not set(gids).intersection(config.get('scope', {}).get('goalIds', [])):
        continue
    bind(cp)
    bind(config['reviewPath'])
    for line in (ROOT / config['reviewPath']).read_text().splitlines():
        row = json.loads(line)
        if row.get('goalId') in gids:
            profiles.append({'configPath': cp, 'reviewPath': config['reviewPath'], 'wholeProfile': row})
assert len(profiles) == 11
assert {p['wholeProfile']['goalId'] for p in profiles} == set(gids)
case_count = sum(len(p['wholeProfile']['profile']['applicationCaseBriefs']) for p in profiles)
assert case_count == 22
bind(CAN)
bind(REG)
bind('AGENTS.md')
dump('actual-current496-three-whole-bodies-eleven-DEEN-goals-and-P22.exact-intake.json', {
    'capturedAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root/economics_m2_views_independent_b',
    'canonicalInput': bind(CAN), 'registryInput': bind(REG), 'canonicalGoals': len(goals),
    'wholeMaterials': materials, 'wholeOrdinaryGoals': [goals[x] for x in gids],
    'wholeCurrentProfiles': profiles, 'applicationCases': case_count,
    'actualTaskLanguages': ['de'],
    'actualEnglishBoundary': 'All eleven ordinary contracts/profiles have English text; these three legacy examData have only the German taskContent/solutionContent fields. 591b/a47 titleEn/descriptionEn remain German legacy text.',
    'actualExistingProfileStatuses': sorted({p['wholeProfile']['status'] for p in profiles}),
    'claimBoundary': 'Historical released/kind/applicability labels are not independent whole-assessment evidence. No active write or human approval.'
})
searches = []
all_paths = set()
for expression in ['591b870a|58cc062b|a47e8fca', '2f234997|69f5addd|1c9a5c8b']:
    argv = ['rg', '-l', expression, 'curricula/DE/Gymnasium/quality/goal-evidence']
    p = subprocess.run(argv, cwd=ROOT, text=True, capture_output=True)
    assert p.returncode == 0
    paths = p.stdout.splitlines()
    all_paths.update(paths)
    searches.append({'argv': argv, 'exitCode': p.returncode, 'matchedFileCount': len(paths), 'allMatchedPaths': paths, 'stderr': p.stderr, 'stdoutTruncated': False})
selected = sorted(p for p in all_paths if any(t in Path(p).name.lower() for t in ['scientific', 'independent', 'review.actual', 'receipt', 'handoff']) and '/wirtschaft-' in p)
dump('actual-complete-canonical-and-provenance-rg-search.json', {
    'capturedAt': datetime.now(timezone.utc).isoformat(), 'searches': searches,
    'candidateIndependentEvidenceFilesForScopeInspection': selected,
    'scopeBoundary': 'An inventory is not scientific approval; inspect actual decision scope and whole current object equality before reuse.'
})
dump('actual-current-input-bindings.before-science.json', {'inputs': bindings, 'activeWrites': 0, 'newImages': 0, 'wholeMaterialCount': 3, 'ordinaryContractCount': 11, 'applicationCaseCount': case_count})
print(json.dumps({'CAN': bind(CAN), 'wholeMaterials': 3, 'contracts': 11, 'cases': case_count, 'searchCounts': [s['matchedFileCount'] for s in searches], 'selectedEvidenceCount': len(selected), 'outputDirectory': str(OUT.relative_to(ROOT))}))
