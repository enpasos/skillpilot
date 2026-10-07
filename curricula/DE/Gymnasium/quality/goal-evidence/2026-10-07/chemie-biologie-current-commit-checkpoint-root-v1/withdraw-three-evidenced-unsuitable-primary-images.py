"""Use the existing documented quality hold for three actually unsuitable images."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
REVIEW = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review'
HOLD = REVIEW / 'chemie-three-current-evidenced-quality-holds-20261007-v1'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
FINDINGS = json.loads((OUT / 'four-current-image-findings-and-negative-machine-decisions.actual.json').read_text())
IDS = FINDINGS['threePreviouslyOpenGoals']


def meta(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert not HOLD.exists(), 'Do not overwrite a historical hold dossier.'
HOLD.mkdir()
before = json.loads(CANON.read_text())
(OUT / 'canonical-chemistry.before-three-image-link-withdrawals.json').write_bytes(CANON.read_bytes())
after = copy.deepcopy(before)
rows = {g['id']: g for g in after['goals']}
withdrawals = []
table = []
for goal_id in IDS:
    goal = rows[goal_id]
    links = [r for r in goal.get('resourceLinks', []) if r.get('type') == 'goal-visualization' and r.get('role', 'primary') == 'primary']
    assert len(links) == 1
    link = links[0]
    relative_asset = link['url'].removeprefix('/assets/goal-visualizations/')
    assert relative_asset == f'chemie/{goal_id}/{goal_id}.jpg'
    expected = FINDINGS['findings'][goal_id]['expectedAssetSha256']
    originals = [ROOT / base / relative_asset for base in ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']]
    copies = [meta(p) for p in originals]
    assert all(m['sha256'] == expected for m in copies)
    archive = HOLD / 'assets' / goal_id / f'{goal_id}.jpg'
    archive.parent.mkdir(parents=True)
    archive.write_bytes(originals[0].read_bytes())
    assert meta(archive)['sha256'] == expected
    goal['resourceLinks'] = [r for r in goal['resourceLinks'] if r is not link]
    for path in originals:
        path.unlink()
    finding = FINDINGS['findings'][goal_id]['finding']
    withdrawals.append({'goalId': goal_id, 'wholeGoalBefore': next(g for g in before['goals'] if g['id'] == goal_id), 'wholeGoalAfter': goal, 'withdrawnPrimaryLink': link, 'threeExactAssetCopiesBefore': copies, 'archivedOriginal': meta(archive), 'scientificFinding': finding, 'machineStatus': 'deferred_quality_review', 'humanDecision': 'unchanged', 'strictClosure': False})
    table.append(f"| `{goal_id}` | {goal['title']} | `deferred_quality_review` | `sha256:{expected}` | `{HOLD.name}/assets/{goal_id}/{goal_id}.jpg` | {finding.replace('|', '&#124;')} |")
old_rows = {g['id']: g for g in before['goals']}
for goal in after['goals']:
    old = old_rows[goal['id']]
    if goal['id'] in IDS:
        assert {k: v for k, v in goal.items() if k != 'resourceLinks'} == {k: v for k, v in old.items() if k != 'resourceLinks'}
    else:
        assert goal == old
save(CANON, after)
save(HOLD / 'three-exact-raster-withdrawals.actual.receipt.json', {'documentType': 'actual scoped unsuitable-image withdrawals using existing quality hold contract', 'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'withdrawals': withdrawals, 'wholeUnchangedOtherGoals': len(after['goals']) - 3, 'noGoalTextGraphSemanticKindMemoryCardChanges': True, 'historicalImagesPreservedExactly': True, 'newScientificStrictClosures': 0, 'restoredStrictBindings': 0, 'strictNetGain': 0})
(HOLD / 'README.md').write_text('# Three evidenced current image quality holds\n\nThe exact three original JPGs and their concrete scientific defects are archived. Only their active primary image links and three published/generated copies were withdrawn. The existing `deferred_quality_review` contract remains open work, never a completed M7 exception. Goal descriptions, edges, semantic kinds, cards, and human decisions are unchanged.\n')
ledger = REVIEW / 'chemie-three-current-evidenced-quality-holds-2026-10-07.md'
assert not ledger.exists()
ledger.write_text('# Chemie: drei belegte fachliche Bildbefunde\n\nReview date: 2026-10-07\n\nDie Originale wurden fachlich am tatsächlichen Bild beanstandet und mit exaktem Hash archiviert. Frühere positive Maschinenreviews bleiben erhaltene Historie. Die aktive Bildanzeige ist zurückgezogen. `deferred_quality_review` bleibt offene Bildarbeit und zählt nicht als strenger M7-Abschluss. Menschliche Entscheidungen bleiben getrennt und unverändert.\n\n| Goal ID | Lernziel | Decision | Withdrawn asset SHA-256 | Archived original | Konkreter Befund |\n| --- | --- | --- | --- | --- | --- |\n' + '\n'.join(table) + '\n')
print(json.dumps({'withdrawnUnsuitablePrimaryImages': 3, 'archivedExactOriginals': 3, 'otherWholeGoalsUnchanged': len(after['goals']) - 3, 'existingQualityHoldContract': True}))
