"""Apache-2.0. Minimal physical Economics authoring isolate; no active writes."""
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'wirtschaft-q1-first-three-clusters-seventeen-bilingual-positive-author-v3'
BASE = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1'
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'


def sha(path):
    return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def main():
    receipt_path = OWN / 'physical-isolate.initial.actual.json'
    if receipt_path.exists():
        raise ValueError('Own initial receipt already exists; preserve this isolate and use a new version for a restart.')
    isolate = Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-q1-seventeen-native-'))
    bindings = []
    for folder in ['app/scripts', 'app/src', 'contracts']:
        shutil.copytree(ROOT / folder, isolate / folder)
        for target in (isolate / folder).rglob('*'):
            if target.is_file():
                relative = target.relative_to(isolate)
                original = ROOT / relative
                assert sha(target) == sha(original), relative
                bindings.append({'path': str(relative), 'sha256': sha(original), 'bytes': original.stat().st_size})
    (isolate / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
    active_qa_precheck=json.loads((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json').read_text())
    assert sum(row['visualizationState']=='available' for row in active_qa_precheck['records'])==51, 'Wait for actual Root51 integration before physical source capture'
    source_paths = ['app/package.json', 'app/tsconfig.json', CANONICAL,
                    BASE + '/review-book-full.config.json', BASE + '/review-full-canonical.view.json',
                    BASE + '/wirtschaftswissenschaften.semantic-kinds.json',
                    'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json',
                    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
                    'scripts/import_goal_visualization.mjs', 'scripts/goal_visualization_common.mjs',
                    'scripts/goal_visualization_scope.mjs', 'LICENSING.md']
    for source in source_paths:
        original, target = ROOT / source, isolate / source
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(original, target)
        assert sha(original) == sha(target), source
        bindings.append({'path': source, 'sha256': sha(original), 'bytes': original.stat().st_size})
    # Two independently checked exact original-page corrections: current physical consumers,
    # with historical extraction and mapping bytes retained in their author package.
    bw_author=OWN.parent / 'wirtschaft-q1-bw-two-current-source-location-successors-author-v1'
    bw_receipt=json.loads((bw_author / 'current-two-source-location-successors.actual.json').read_text())
    source_bindings=[]
    for item in bw_receipt['sourceSuccessors']:
        mapping_source=ROOT / item['inertMappingSuccessorPath']
        extraction_source=ROOT / item['successorSourcePath']
        assert sha(mapping_source)==item['inertMappingSuccessorSha256']
        assert sha(extraction_source)==item['successorSourceSha256']
        assert sha(ROOT / item['originalSourcePath'])==item['originalSourceSha256']
        assert sha(ROOT / item['originalCurrentMappingPath']) in {item['originalCurrentMappingSha256'],item['inertMappingSuccessorSha256']}
        for source,target_relative in [(mapping_source,item['originalCurrentMappingPath']),
                                      (extraction_source,item['successorSourcePath'])]:
            target=isolate / target_relative;target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(source,target);assert sha(source)==sha(target)
            bindings.append({'path':target_relative,'sourcePath':str(source.relative_to(ROOT)),
                             'sha256':sha(source),'bytes':source.stat().st_size})
        source_bindings.append({'canonicalGoalId':item['canonicalGoalId'],
                                'mappingCurrentPhysicalPath':item['originalCurrentMappingPath'],
                                'sourceExtractionCurrentPhysicalPath':item['successorSourcePath'],
                                'onlySourceChange':item['onlySourceFieldDelta'],
                                'printedPage':item['actualPrintedPage'],
                                'originalSourceBytesRetained':True})
    write(OWN / 'bounded-two-source-pointer-physical-context.actual.json', {
        'role':'technical_preparer','physicalIsolate':str(isolate),
        'independentSourceParityReceiptPath':bw_receipt['rootIndependentSourceReviewPath'],
        'sourcePointerCandidates':source_bindings,'activeWrites':0,'newSourceCompetencyReviewClaim':False,
        'limits':['Only two actual original-page corrections are candidates in this physical consumer context; source text and old whole-mapping decisions are unchanged.']})
    for name in ['goal-ids.json', 'whole-goals.original.json', 'whole-goals.candidate.json',
                 'positive.candidates.json', 'authoring-review.criteria.md']:
        source = AUTHOR / name
        target = isolate / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        bindings.append({'path': str(source.relative_to(ROOT)), 'sha256': sha(source), 'bytes': source.stat().st_size})
    canonical = json.loads((isolate / CANONICAL).read_text())
    # Copy all currently available context assets physically, not whole quality trees.
    active_qa = json.loads((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json').read_text())
    context_assets = []
    for record in active_qa['records']:
        if record['visualizationState'] != 'available':
            continue
        for asset_key in ['publicAssetPath', 'canonicalAssetPath']:
            relative = record[asset_key]
            original, target = ROOT / relative, isolate / relative
            assert sha(original) == record['assetSha256']
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(original, target)
            assert sha(target) == record['assetSha256']
            context_assets.append({'goalId': record['goalId'], 'path': relative, 'sha256': sha(target)})
    assert len(context_assets) == 102, 'Expected current Root51 dual physical image paths'
    # Actual independently reviewed terminal assessment overlay is already integrated in Root.
    overlay_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-five-terminal-assessments-author-candidate-v1/independent-review/five-reviewed-assessments.overlay.json'
    assessment_overlay = json.loads(overlay_path.read_text())
    canonical_by = {goal['id']: goal for goal in canonical['goals']}
    assert len(assessment_overlay) == 5
    assert all(canonical_by[goal['id']] == goal for goal in assessment_overlay)
    write(OWN / 'author-and-assessment-context.actual.json', {
        'role': 'technical_preparer', 'physicalIsolate': str(isolate),
        'currentRootCanonicalSha256': sha(ROOT / CANONICAL),
        'currentIntegratedImageGoals': 51, 'copiedPhysicalCurrentContextAssets': context_assets,
        'assessmentOverlayPath': str(overlay_path.relative_to(ROOT)), 'assessmentOverlaySha256': sha(overlay_path),
        'allFiveCurrentWholeAssessmentsExactOverlayMatch': True,
        'noDReviewsPerformed': True, 'activeWrites': 0,
    })
    before = json.loads((AUTHOR / 'whole-goals.original.json').read_text())
    candidates = json.loads((AUTHOR / 'whole-goals.candidate.json').read_text())
    originals_by = {g['id']: g for g in before}
    candidates_by = {g['id']: g for g in candidates}
    deltas = {}
    for index, goal in enumerate(canonical['goals']):
        if goal['id'] not in candidates_by:
            continue
        assert goal == originals_by[goal['id']], 'Whole selected goal changed after author capture: ' + goal['id']
        candidate = candidates_by[goal['id']]
        changed = sorted(k for k in set(goal) | set(candidate) if goal.get(k) != candidate.get(k))
        expected=['descriptionEn','dimensionTags','titleEn'] if goal['id'] in {'7179f558-b05f-5ebd-8799-28ffaaf2da05','50e07b86-428c-5f9c-8c7e-0d0669343af5'} else ['descriptionEn','titleEn']
        assert changed == expected, changed
        if 'dimensionTags' in changed:
            assert 'demandLevel' not in goal['dimensionTags']
            expected_tags=dict(goal['dimensionTags']);expected_tags['demandLevel']='AB2'
            assert candidate['dimensionTags']==expected_tags
        deltas[goal['id']] = changed
        canonical['goals'][index] = candidate
    assert len(deltas) == 17
    write(isolate / CANONICAL, canonical)
    write(OWN / 'candidate-canonical.before-final-images.inert.snapshot.json', canonical)
    own_relative = OWN.relative_to(ROOT)
    native_script = isolate / own_relative / 'bind-candidate-semkind.mts'
    native_script.parent.mkdir(parents=True, exist_ok=True)
    native_script.write_text("""// Candidate technical binding only; no fachliche review claim.
import { readFile, writeFile } from 'node:fs/promises'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const cPath = '""" + CANONICAL + """'
const sPath = '""" + BASE + """/wirtschaftswissenschaften.semantic-kinds.json'
const landscape = JSON.parse(await readFile(cPath, 'utf8'))
const ledger = JSON.parse(await readFile(sPath, 'utf8'))
const goals = new Map(landscape.goals.map((g: any) => [g.id, g]))
for (const decision of ledger.decisions) decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goals.get(decision.goalId) as any)
await writeFile(sPath, JSON.stringify(ledger, null, 2) + '\\n')
console.log('Candidate-only technical source bindings; classification counts and decisions unchanged.')
""")
    native_command = ['app/node_modules/.bin/tsx', str(native_script.relative_to(isolate))]
    run = subprocess.run(native_command, cwd=isolate, capture_output=True, text=True)
    (OWN / 'semkind-candidate-binding.stdout.txt').write_text(run.stdout)
    (OWN / 'semkind-candidate-binding.stderr.txt').write_text(run.stderr)
    assert run.returncode == 0, run.stderr
    # Real filesystem roots exist before renderer realpath checks; no image symlinks.
    (isolate / 'app/public/assets/goal-visualizations/wirtschaftswissenschaften').mkdir(parents=True, exist_ok=True)
    (isolate / 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften').mkdir(parents=True, exist_ok=True)
    book = json.loads((isolate / (BASE + '/review-book-full.config.json')).read_text())
    print(json.dumps({'physicalIsolate': str(isolate), 'nativeBaseBookConfig': BASE + '/review-book-full.config.json',
                      'sourceDependencies': len(bindings), 'candidateDeltaGoals': len(deltas),
                      'imagesImported': 0, 'preparedDescriptionBatches': 0, 'activeWrites': 0}))
    write(receipt_path, {
        'role': 'technical_preparer', 'createdAt': datetime.now(timezone.utc).isoformat(),
        'physicalIsolate': str(isolate), 'inputPhysicalCopies': bindings,
        'productionCodeCopiedByteExact': True, 'nodeModulesDependencySymlinkOnly': True,
        'outputDirectoriesArePhysical': True, 'wholeHistoricalQualityDirectoriesCopied': False,
        'selectedTranslations': deltas, 'unchangedSemanticClassifications': True,
        'candidateSemanticKindBindingCommand': native_command,
        'actualExitCode': run.returncode,
        'bookConfig': book, 'imagesImported': 0, 'preparedDescriptionBatches': 0,
        'independentDescriptionReviews': 0, 'activeWrites': 0, 'newStrictClosures': 0,
        'limits': ['Author-v2 translations and positive profiles received actual independent parity/positive closure; independent D rounds are still required.',
                   'No images selected or approved by this preparation scaffold.',
                   'Native prepare must wait for all final image hashes, links, alt text and QA records.',
                   'Candidate-only source fingerprints are technical bindings, not renewed fachliche decisions.'],
    })


if __name__ == '__main__':
    main()
