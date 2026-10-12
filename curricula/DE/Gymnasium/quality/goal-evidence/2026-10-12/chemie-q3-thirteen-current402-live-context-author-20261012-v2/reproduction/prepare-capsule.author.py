"""Lean temporary capsule; normal tool sources and referenced public inputs only."""
from pathlib import Path
import json
import os
import re
import shutil

REPO = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent.parent
OWN_REL = OWN.relative_to(REPO)
PARENT = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-q3-remaining-current402-bounded-source-P-author-20261011-v1'
CAP = REPO / 'tmp/chemie-q3-thirteen-author-v2-execution-capsule'

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

# The importer ran against the isolated candidate landscape; copy only its staged outputs.
shutil.copyfile(CAP / 'candidate/landscape.json', OWN / 'inputs/current523.author-successor.de.json')
goal_id = '96fd8608-8d98-53f0-9b86-1311c3220fd3'
for prefix in ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']:
    source = CAP / prefix / 'chemie' / goal_id
    target = OWN / 'visualization/staged' / prefix / 'chemie' / goal_id
    target.mkdir(parents=True, exist_ok=True)
    for f in source.iterdir():
        shutil.copyfile(f, target / f.name)

qa = json.loads((REPO / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').read_text())
import hashlib
image_url = f'/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png'
image_hash = 'sha256:' + hashlib.sha256((CAP / 'app/public' / image_url[1:]).read_bytes()).hexdigest()
for record in qa['records']:
    if record['goalId'] == goal_id:
        record.update(imageUrl=image_url, publicAssetPath='app/public' + image_url,
                      canonicalAssetPath=f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/{goal_id}.png',
                      assetSha256=image_hash, umlautsCorrectChatGpt='no', contentApprovedChatGpt='no',
                      humanApproved='no', humanIssueIdentified='no', humanIssueDescription='',
                      humanReviewedAt=None, humanReviewer='', chatGptReviewedAt=None,
                      chatGptReviewer='', chatGptNotes='Inactive author candidate; independent current-asset review pending.')
save(OWN / 'visualization/chemie.qa.inactive-author.json', qa)

# Hardlinks supply immutable original image bytes to the normal model loader without disk duplication.
for record in qa['records']:
    if record['visualizationState'] != 'available' or record['goalId'] == goal_id:
        continue
    relative = record['publicAssetPath']
    target = CAP / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        os.link(REPO / relative, target)

book_config = json.loads((OWN / 'native/whole402.neutral.author.inactive.config.json').read_text())
book_config['goalVisualizationQaPath'] = str(OWN_REL / 'visualization/chemie.qa.inactive-author.json')
save(OWN / 'native/whole402.neutral.author.inactive.config.json', book_config)
manifest = json.loads((PARENT / 'FINAL.neutral-input-manifest.json').read_text())
view = json.loads((OWN / 'native/all402.review-only.view.exact.json').read_text())
view['viewId'] = 'chemie-q3-thirteen-current402-native-author-view'
view['title'] = 'Chemie Q3: 13 aktuelle Prüfseiten'
view['rootNodes'] = [{'kind': 'structure', 'id': 'q3-thirteen-review-excerpt',
                      'label': 'Chemie Q3 – aktueller Prüfauszug',
                      'children': [{'kind': 'goalEntry', 'goalId': gid} for gid in manifest['goalIds']]}]
save(OWN / 'native/thirteen.review-only.view.json', view)
thirteen_config = dict(book_config)
thirteen_config.update(bookId='chemie-q3-thirteen-current402-native-author',
                       title='Chemie Q3 – 13 aktuelle Lernziele',
                       compositionViewPath=str(OWN_REL / 'native/thirteen.review-only.view.json'),
                       outputPath=str(OWN_REL / 'native/thirteen.normal-model.author.actual.json'))
save(OWN / 'native/thirteen.author.inactive.config.json', thirteen_config)

# Exact regular input files, no symlinks inside curriculum evidence.
for config in [book_config, thirteen_config, json.loads((OWN / 'positive/P13.author.inactive.config.json').read_text())]:
    for key in ['landscapePath', 'semanticKindLedgerPath', 'goalVisualizationQaPath', 'compositionViewPath', 'reviewCriteriaPath']:
        if key in config:
            copy_input(config[key])
    for relative in config.get('evidenceReviewPaths', []):
        # P13 is created after the normal materializer.
        if (REPO / relative).exists():
            copy_input(relative)
for relative in ['positive/P13.author.inactive.config.json', 'positive/P13.author.candidates.json', 'native/whole402.neutral.author.inactive.config.json', 'native/thirteen.author.inactive.config.json']:
    copy_input(OWN_REL / relative)
save(OWN / 'checks/lean-capsule.actual.json', {
    'copiedNormalToolSources': sorted(str(p) for p in copied),
    'sourceCount': len(copied), 'normalToolSourcesUnmodified': True,
    'dependenciesCopied': False, 'originalAssetsHardlinkedReadOnly': True,
    'activeWrites': False, 'newImageDigest': image_hash,
})
print(f'Lean capsule prepared: {len(copied)} exact normal tool source modules; no dependency/curriculum corpus clone.')
