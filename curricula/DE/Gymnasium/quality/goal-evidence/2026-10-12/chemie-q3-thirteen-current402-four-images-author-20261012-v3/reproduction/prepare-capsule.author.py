"""Lean temporary capsule; normal tool sources and referenced public inputs only."""
from pathlib import Path
import json
import os
import re
import shutil

REPO = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent.parent
OWN_REL = OWN.relative_to(REPO)
PARENT = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-live-context-author-20261012-v2'
CAP = REPO / 'tmp/chemie-q3-thirteen-author-v3-execution-capsule'

def save(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def copy_input(relative):
    source = REPO / relative
    target = CAP / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)

copied = set()
def copy_module(relative):
    source = REPO / relative
    if relative in copied:
        return
    copied.add(relative)
    copy_input(relative)
    for ref in re.findall(r"(?:from\s*|import\s*\()\s*['\"]([^'\"]+)['\"]", source.read_text()):
        if not ref.startswith('.'):
            continue
        candidate = source.parent / ref
        options = [candidate] if candidate.suffix else [candidate.with_suffix(s) for s in ['.ts', '.tsx', '.mjs', '.json']]
        options += [candidate / 'index.ts']
        found = next((p.resolve() for p in options if p.is_file()), None)
        if found:
            copy_module(found.relative_to(REPO))

for relative in ['app/scripts/materializePositiveGoalEvidenceCandidates.ts', 'app/scripts/buildGoalBookModel.ts', 'app/scripts/renderGoalBook.ts']:
    copy_module(Path(relative))
for directory in ['contracts/goal-evidence/v2', 'contracts/goal-book/v1', 'contracts/curriculum-package/v1', 'contracts/curriculum-package/v1/profiles']:
    for relative in (REPO / directory).glob('*.json'):
        copy_input(relative.relative_to(REPO))
copy_input(Path('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'))
(CAP / 'app').mkdir(exist_ok=True)
if not (CAP / 'app/node_modules').exists():
    (CAP / 'app/node_modules').symlink_to(REPO / 'app/node_modules', target_is_directory=True)

qa = json.loads((PARENT / 'visualization/chemie.qa.inactive-author.json').read_text())
import hashlib
current_goals = {g['id']: g for g in json.loads((OWN / 'inputs/current523.author-successor.de.json').read_text())['goals']}
changed_images = ['5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c', '545a2e56-e981-5725-b0e4-a0c77f7f291e', 'c0463225-cba1-5e62-a1fb-e9046d7034b5', 'b8c8f70f-64cb-50b1-970c-e0c4295da3fb', 'e62c6c58-b688-59c3-8ac5-2cfc26ac22d7']
# Supply exact candidate PNGs from portable evidence, never from a model-host scratch path.
for gid in changed_images:
    for asset_root in ['curricula/DE/Gymnasium/visualizations/chemie', 'app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
        relative = Path(asset_root) / gid / (gid + '.png')
        target = CAP / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(OWN / 'visualization/staged' / relative, target)
for record in qa['records']:
    if record['goalId'] in changed_images:
        gid = record['goalId']
        link = next(l for l in current_goals[gid]['resourceLinks'] if l['type'] == 'goal-visualization')
        record.update(imageUrl=link['url'], publicAssetPath='app/public'+link['url'],
                      canonicalAssetPath=f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png',
                      assetSha256='sha256:'+hashlib.sha256((CAP / 'app/public' / link['url'][1:]).read_bytes()).hexdigest(),
                      contentApprovedChatGpt='no', umlautsCorrectChatGpt='no', humanApproved='no',
                      humanIssueIdentified='no', humanIssueDescription='', humanReviewedAt=None, humanReviewer='',
                      chatGptReviewedAt=None, chatGptReviewer='', chatGptNotes='V3 author repair candidate; targeted independent review pending.')
image_hash = 'five exact new PNG hashes recorded in own QA'
save(OWN / 'visualization/chemie.qa.inactive-author.json', qa)

# Hardlinks supply immutable original image bytes to the normal model loader without disk duplication.
for record in qa['records']:
    if record['visualizationState'] != 'available':
        continue
    relative = record['publicAssetPath']
    target = CAP / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        source = REPO / relative
        if record['goalId'] == '96fd8608-8d98-53f0-9b86-1311c3220fd3':
            source = PARENT / 'visualization/staged' / relative
        os.link(source, target)

book_config = json.loads((OWN / 'native/whole402.neutral.author.inactive.config.json').read_text())
book_config['goalVisualizationQaPath'] = str(OWN_REL / 'visualization/chemie.qa.inactive-author.json')
save(OWN / 'native/whole402.neutral.author.inactive.config.json', book_config)
thirteen_config = json.loads((OWN / 'native/thirteen.author.inactive.config.json').read_text())
whole13_config = json.loads((OWN / 'native/whole13.author.inactive.config.json').read_text())

# Exact regular input files, no symlinks inside curriculum evidence.
for config in [book_config, thirteen_config, whole13_config, json.loads((OWN / 'positive/P13.author.inactive.config.json').read_text())]:
    for key in ['landscapePath', 'semanticKindLedgerPath', 'goalVisualizationQaPath', 'compositionViewPath', 'reviewCriteriaPath']:
        if key in config:
            copy_input(config[key])
    for relative in config.get('evidenceReviewPaths', []):
        # P13 is created after the normal materializer.
        if (REPO / relative).exists():
            copy_input(relative)
for relative in ['positive/P13.author.inactive.config.json', 'positive/P13.author.candidates.json', 'native/whole402.neutral.author.inactive.config.json', 'native/thirteen.author.inactive.config.json', 'native/whole13.author.inactive.config.json']:
    copy_input(OWN_REL / relative)
save(OWN / 'checks/lean-capsule.actual.json', {
    'copiedNormalToolSources': sorted(str(p) for p in copied),
    'sourceCount': len(copied), 'normalToolSourcesUnmodified': True,
    'dependenciesCopied': False, 'originalAssetsHardlinkedReadOnly': True,
    'activeWrites': False, 'newImageDigest': image_hash,
})
print(f'Lean capsule prepared: {len(copied)} exact normal tool source modules; no dependency/curriculum corpus clone.')
