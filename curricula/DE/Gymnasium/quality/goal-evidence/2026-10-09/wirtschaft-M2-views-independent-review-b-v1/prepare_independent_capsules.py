"""Build disposable native-check capsules; never mutate active curriculum inputs."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import sys
import tempfile

repo = Path(sys.argv[1]).resolve()
own = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-views-independent-review-b-v1'
author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-current493-country-source-and-explicit-GK-LK-role-author-v1'
index = json.loads((author / 'thirty-explicit-existing-course-target-preservation-view.author-index.json').read_text())
inputs = own / 'inputs'
inputs.mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def copy(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)

copy(repo / index['currentCanonical']['path'], inputs / 'whole-current493-canonical.json')
copy(repo / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1/wirtschaftswissenschaften.semantic-kinds.json', inputs / 'whole-current493-semantic-kinds.json')
# The complete read-only native compiler result was captured once from the
# actual repository, and is now a portable immutable review input here.
assert (inputs / 'whole-current-applicability-compiler.readonly.json').is_file()
for row in index['views']:
    before = repo / row['beforeView']['path']
    assert sha(before) == row['beforeView']['sha256']
    copy(before, inputs / 'before-views' / before.name)
    assert sha(repo / row['candidate']['path']) == row['candidate']['sha256']

root = Path(tempfile.mkdtemp(prefix='skillpilot-economics-M2-independent-B-'))
base = root / 'baseline'
script_dir = base / 'app/scripts'
script_dir.mkdir(parents=True)
copy(repo / 'app/package.json', base / 'app/package.json')
for p in (repo / 'app/scripts').iterdir():
    (script_dir / p.name).symlink_to(p, target_is_directory=p.is_dir())
native = script_dir / 'generateCurriculumQualityStatus.ts'
native.unlink()
export_suffix = '\nexport { readCompositionViewAtomicGoalIds, readJurisdictionCoverageByLandscapeId, collectRenderedAtomicGoalIdsFromCompositionView, readGoalMappingFilesForReport, readSourceGoalClosureByLandscapeId, expandSourceAtomicGoalIds, readExtractedSourceGoalIdsByLandscapeId, readSourceLandscapeRegistryEntriesById };\n'
native.write_text((repo / 'app/scripts/generateCurriculumQualityStatus.ts').read_text() + export_suffix)
for name in ['src', 'node_modules', 'public']:
    (base / 'app' / name).symlink_to(repo / 'app' / name, target_is_directory=True)
gym = base / 'curricula/DE/Gymnasium'
gym.mkdir(parents=True)
for name in ['input', 'quality', 'archive']:
    (gym / name).symlink_to(repo / 'curricula/DE/Gymnasium' / name, target_is_directory=True)
copy(repo / index['currentCanonical']['path'], base / index['currentCanonical']['path'])
for p in (repo / 'curricula/DE/Gymnasium/provenance').iterdir():
    if p.is_file(): copy(p, gym / 'provenance' / p.name)
mapping_inputs = []
for p in (repo / 'curricula/DE/Gymnasium/mapping').rglob('*.json'):
    data = json.loads(p.read_text())
    if data.get('targetLandscapeId') == '605bdaf6-32d5-56fd-8d92-5a80c2fd2901':
        copy(p, base / p.relative_to(repo))
        mapping_inputs.append({'path': str(p.relative_to(repo)), 'sha256': sha(p)})
for p in (repo / 'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.view.json'):
    copy(p, gym / 'composition-views/wirtschaft' / p.name)
candidate = root / 'candidate'
shutil.copytree(base, candidate, symlinks=True)
for row in index['views']:
    copy(repo / row['candidate']['path'], candidate / row['prospectiveActivePath'])
negative_runtime = root / 'negative-runtime-drop'
shutil.copytree(candidate, negative_runtime, symlinks=True)
row = next(r for r in index['views'] if r['jurisdiction'] == 'DE-HE' and r['courseProfile'] == 'GK')
removed_id = row['actualPreservedOrdinaryTargetIds'][0]

def remove_nodes(view, ids):
    def visit(nodes):
        result = []
        for n in nodes:
            if n.get('goalId') in ids and n.get('projectionRole', 'target') == 'target': continue
            if n.get('kind') == 'structure': n['children'] = visit(n['children'])
            result.append(n)
        return result
    view['rootNodes'] = visit(view['rootNodes'])

p = negative_runtime / row['prospectiveActivePath']
view = json.loads(p.read_text())
remove_nodes(view, {removed_id})
p.write_text(json.dumps(view, ensure_ascii=False, indent=2) + '\n')
(negative_runtime / 'mutation.json').write_text(json.dumps({'jurisdiction': row['jurisdiction'], 'courseProfile': row['courseProfile'], 'removedGoalId': removed_id}, indent=2) + '\n')
negative_source = root / 'negative-source-drop'
shutil.copytree(candidate, negative_source, symlinks=True)
source_rows = json.loads((author / 'seventy-individual-existing-source-edges-and-current-GK-LK-union-coverage-bindings.author.json').read_text())['rows']
source_row = next(r for r in source_rows if r['jurisdiction'] == 'DE-BY')
ids = {h['goalId'] for b in source_row['existingEvidenceBindings'] for h in b['actualNewViewHits']}
for row in index['views']:
    if row['jurisdiction'] != source_row['jurisdiction']: continue
    p = negative_source / row['prospectiveActivePath']
    view = json.loads(p.read_text()); remove_nodes(view, ids)
    p.write_text(json.dumps(view, ensure_ascii=False, indent=2) + '\n')
(negative_source / 'mutation.json').write_text(json.dumps({'jurisdiction': source_row['jurisdiction'], 'sourceAtomicGoalKey': source_row['sourceAtomicGoalKey'], 'removedCanonicalTargetIds': sorted(ids)}, indent=2) + '\n')
(root / 'execution-paths.json').write_text(json.dumps({'root': str(root), 'baseline': str(base), 'candidate': str(candidate), 'negative-runtime-drop': str(negative_runtime), 'negative-source-drop': str(negative_source)}, indent=2) + '\n')
manifest_paths = sorted({p for p in inputs.rglob('*') if p.is_file()} | {repo / r['candidate']['path'] for r in index['views']} | {author / 'thirty-explicit-existing-course-target-preservation-view.author-index.json', author / 'seventy-individual-existing-source-edges-and-current-GK-LK-union-coverage-bindings.author.json', repo / 'app/scripts/generateCurriculumQualityStatus.ts', repo / 'app/src/utils/authoring/compositionViewAuthoring.ts', repo / 'app/src/utils/compositionViewRuntime.ts', own / 'review_current_thirty_views.mts', own / 'prepare_independent_capsules.py'})
(own / 'actual-independent-review-inputs.manifest.json').write_text(json.dumps({'role': 'Independent reviewer B whole source/view inputs', 'files': [{'path': str(p.relative_to(repo)), 'sha256': sha(p)} for p in manifest_paths], 'mappingInputs': mapping_inputs, 'nativeExecutionAdaptation': 'Only appended private reader exports outside the repository; production predicates unchanged.', 'capsulesAreDisposableAndOutsideCurricula': True, 'noHumanOrM2Approval': True}, ensure_ascii=False, indent=2) + '\n')
for p in own.rglob('*.json'): json.loads(p.read_text())
print(root)
