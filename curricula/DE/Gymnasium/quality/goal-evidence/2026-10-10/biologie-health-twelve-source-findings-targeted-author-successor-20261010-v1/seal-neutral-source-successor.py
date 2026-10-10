# SPDX-License-Identifier: Apache-2.0
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
P = Path(__file__).resolve().parent.relative_to(ROOT)
H = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1')
V2 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-two-targeted-metadata-raster-native-technical-successor-20261010-v2')
def read(p):
    return json.loads(Path(p).read_text())
def ref(p):
    p = Path(p)
    data = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def put(name, data):
    p = P / name
    p.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if p.exists():
        assert p.read_text() == serialized, p
    else:
        p.write_text(serialized)
    return ref(p)

raw_receipt = read(P / 'sources/normal-output/source-projection.receipt.json')
prior_portable = read(H / 'inputs/all-current-portable-external-bindings.neutral.json')
known = {r['normalLogicalInputPathDiagnosticOnly']: r['actualRegularPortableBinding'] for r in prior_portable['records']}
known_by_sha = {r['actualRegularPortableBinding']['sha256']: r['actualRegularPortableBinding'] for r in prior_portable['records']}
portable = []
for b in raw_receipt['inputBindings']:
    p = Path(b['path'])
    ignored = subprocess.run(['git', 'check-ignore', '--', str(p)], capture_output=True).returncode == 0
    if p.is_file() and not p.is_symlink() and not ignored:
        actual = ref(p)
    else:
        actual = known.get(str(p)) or known_by_sha.get(b['sha256'])
        assert actual, b
    assert actual['sha256'] == b['sha256'] and ref(actual['path']) == actual, b
    portable.append({'normalLogicalInputPathDiagnosticOnly': b['path'], 'normalExpectedSha256': b['sha256'], 'actualRegularPortableBinding': actual, 'logicalPathIsActualCommittableBinding': str(p) == actual['path'] and not ignored, 'newSourceApproval': False})
put('inputs/all-normal-source-inputs.actual-regular-portable-bindings.json', {'schemaVersion': 1, 'role': 'Exact normal SOURCE input aliases resolved to regular committable bytes; aliases alone are no evidence', 'records': portable, 'normalInputBindingCount': len(portable), 'newSourceApproval': False})

whole_model = read(P / 'native/current394-source-corrected.actual-normal-model.json')
before_model = read(V2 / 'native/current394-two-targeted.actual-normal-model.json')
deltas = read(P / 'sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
protected = set(read(H / 'inputs/current353-protected.ids.json')['current353'])
directly_changed = {d['canonicalGoalId'] for d in deltas['removedUnsupportedDirectPairs'] + deltas['hhThreePartialLocatorAndScopeCorrections']}
fidelity_targets = set()
for x in deltas['wholeChangedMappingPairs']:
    after = read(x['afterMapping']['path'])
    for r in after['mappings']:
        if r['legacyGoalId'] in {d['sourceGoalId'] for d in deltas['hbTwoActualOperatorAndAuthoredOperationalizationCorrections']}:
            fidelity_targets.add(r['canonicalGoalId'].split(':')[-1])
canonical = read(read(V2/'native/current394-two-targeted.normal.config.json')['landscapePath'])
canonical_goals = {g['id']: g for g in canonical['goals']}
page_ids = {p['goalId'] for p in before_model['pages']}
clusters = sorted(fidelity_targets - page_ids)
fidelity_context_ids = set(fidelity_targets & page_ids)
def descend(goal):
    if goal in page_ids:
        fidelity_context_ids.add(goal)
    for child in canonical_goals[goal].get('contains', []):
        descend(child.split(':')[-1])
for cluster in clusters:
    descend(cluster)
ids = sorted(directly_changed | fidelity_context_ids)
contexts = []
witnesses = read(P / 'sources/current182-whole-direct-witnesses-and-actual-primaries.neutral.json')
for goal in ids:
    before = next(p for p in before_model['pages'] if p['goalId'] == goal)
    after = next(p for p in whole_model['pages'] if p['goalId'] == goal)
    assert before == after
    contexts.append({'goalId': goal, 'protectedCurrent353Goal': goal in protected, 'wholeBeforeNativePage': before, 'wholeAfterNativePage': after, 'nativePageContentExact': True, 'wholeDirectSourceWitnessesIfInTwelve': next((r for r in witnesses['rows'] if r['goalId'] == goal), None), 'sourceFidelityContextNotFullReReview': goal in fidelity_context_ids and goal not in directly_changed})
put('native/targeted-source-affected-complete-current-page-contexts.neutral.json', {'schemaVersion': 1, 'role': 'Neutral whole actual current page objects and changed source bindings for targeted independent SOURCE reviews; unchanged whole native renders are retained', 'records': contexts, 'retainedExistingMappedClusterObjects': [canonical_goals[i] for i in clusters], 'inheritedSourceContextIsNotDirectEvidence': True, 'currentPageContentChanged': 0, 'originalFullHtmlPdfReviewsRetained': True, 'noNewNativeSightReviewClaimed': True, 'strictGain': 0, 'humanApproved': 0})

primary_base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-sexuality-addiction-twelve-whole-material-raster-source-author-candidate-v1/primary')
primary_read = []
for short, key, pages in [('HB', 'HB_NW_GYM_2006', [30, 31, 32]), ('HH', 'DE-HH-BIOLOGIE-SEKI-BILDUNGSPLAN-2011', [24, 27, 28]), ('SL', 'SL-NW-GYM-5-6-2012-BIOLOGIE', [25, 26])]:
    pdf = ref(primary_base / key / 'bundle/book.pdf')
    for n in pages:
        primary_read.append({'sourceDocumentKey': key, 'actualWholePrimaryPdf': pdf, 'physicalPageOneBased': n, 'wholePhysicalPageText': ref(P / f'primary/{short}.physical-{n:03d}.txt'), 'actualWholePhysicalPageRaster': ref(P / f'primary/{short}.physical-{n:03d}.png'), 'wholeTextReadAndActualRasterViewedByAuthor': True, 'independentApproval': False})
put('primary/actual-eight-whole-primary-page-author-read.receipt.json', {'schemaVersion': 1, 'role': 'AUTHOR actual whole primary page reading and view; no independent or human approval', 'records': primary_read, 'humanApproved': 0})

external = {r['actualRegularPortableBinding']['path']: r['actualRegularPortableBinding'] for r in portable}
for r in primary_read:
    external[r['actualWholePrimaryPdf']['path']] = r['actualWholePrimaryPdf']
for x in deltas['wholeChangedMappingPairs']:
    for k in ['beforeMapping', 'beforeExtraction']:
        external[x[k]['path']] = x[k]
for r in read(P / 'checks/normal-whole-model-exact-source-image-alias-bindings.json')['records']:
    b = r['actualRegularSource']
    external[b['path']] = b
for p in [H/'neutral-current353-native-twelve-health.entry.json', H/'FINAL.current353-normal-P12-native12-source186.technical.freeze.json', H/'sources/current186-whole-direct-witnesses-and-selected-actual-primaries.neutral.json', H/'inputs/current353-protected.ids.json', V2/'neutral-two-targeted-portable-current-context.entry.json', V2/'FINAL.two-targeted-portable-technical.freeze.json', V2/'native/current394-two-targeted.normal.config.json', V2/'native/current394-two-targeted.actual-normal-model.json', 'AGENTS.md', 'scripts/validate_schemas.py', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts']:
    b = ref(p)
    external[b['path']] = b
for p in read(V2/'native/current394-two-targeted.normal.config.json')['evidenceReviewPaths']:
    b = ref(p)
    external[b['path']] = b
for p in list(external):
    if p.startswith(str(P) + '/'):
        del external[p]
all_required = sorted(external) + [str(p) for p in P.rglob('*') if p.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input=''.join(p+'\n' for p in all_required), text=True, capture_output=True)
assert ignored.returncode in (0, 1) and not ignored.stdout, ignored.stdout
for p in all_required:
    assert Path(p).is_file() and not Path(p).is_symlink(), p
for p, binding in external.items():
    assert ref(p) == binding, p
spec = importlib.util.spec_from_file_location('normal_validate_schemas', ROOT/'scripts/validate_schemas.py')
normal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal)
schema = read('docs/landscape-runtime.schema.json')
json_files = sorted(P.rglob('*.json'))
assert all(normal.validate_file(str(p), schema) for p in json_files)
link_errors = normal.curriculum_symlink_errors(ROOT)
assert not link_errors, link_errors
put('checks/normal-targeted-json-and-curriculum-portability.actual.json', {'schemaVersion': 1, 'normalValidator': 'scripts/validate_schemas.py:validate_file/curriculum_symlink_errors', 'completeJsonArtifactsParsedByNormalValidator': len(json_files), 'normalValidateFilePassed': True, 'curriculumSymlinkErrors': link_errors, 'requiredBindingsIgnored': [], 'allRequiredActualFilesAreRegularAndCommittable': True, 'externalBindingCount': len(external), 'strictGain': 0})
entry = put('neutral-source-findings-targeted-author-successor.entry.json', {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(), 'role': 'Neutral AUTHOR-only inactive SOURCE successor; genuine independent targeted A and B reviews pending', 'subject': 'biologie', 'wholeMappingPairs': 31, 'wholeChangedPairs': 3, 'removedUnsupportedDirectPairs': 4, 'limitedHH24PartialContributions': 3, 'HBActualOperatorFidelityCorrections': 2, 'wholeCurrentDirectWitnesses': 182, 'sourceDeltas': ref(P/'sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json'), 'whole182SourceWitnesses': ref(P/'sources/current182-whole-direct-witnesses-and-actual-primaries.neutral.json'), 'wholeSourceAtlasNormalConfig': ref(P/'sources/after394-atlas.targeted-source.normal.config.json'), 'normalSourceBuildCheckExit0': ref(P/'terminal/attempt3-normal-source-model.actual.txt'), 'portableNormalSourceAtlas': ref(P/'sources/portable-normal-atlas.sources.json'), 'normalSource24AndProtected353Proof': ref(P/'checks/normal-source24-membership-and-protected353-witness-semantics.actual.json'), 'currentWhole394Model': ref(P/'native/current394-source-corrected.actual-normal-model.json'), 'currentWhole394PagesExactProof': ref(P/'checks/current394-whole-native-pages-source-only-context.actual.json'), 'targetedCurrentWholePageAndSourceContexts': ref(P/'native/targeted-source-affected-complete-current-page-contexts.neutral.json'), 'actualEightWholePrimaryAuthorReads': ref(P/'primary/actual-eight-whole-primary-page-author-read.receipt.json'), 'allNormalSourceInputPortableBindings': ref(P/'inputs/all-normal-source-inputs.actual-regular-portable-bindings.json'), 'normalTargetedJsonAndPortabilityProof': ref(P/'checks/normal-targeted-json-and-curriculum-portability.actual.json'), 'affectedCurrentPageContextIds': ids, 'protectedCurrentSourceFidelityContexts': sorted(fidelity_context_ids & protected), 'sourceViewGoalSetsExact24': True, 'wholeCurrent394PagesExact': True, 'protected353NativePagesAndWitnessSemanticsExact': True, 'CANDescriptionsPrerequisitesProfilesCasesPngChanges': False, 'positiveEvidenceStatus': 'needs_human_review', 'positiveReviewAuthority': 'ai_candidate', 'sourceApproval': False, 'wholeCourseSourceApproval': False, 'historicalArtifactsModified': False, 'noRequiredScopeHoldCleared': True, 'humanApproved': 0, 'strictGain': 0, 'activeWrites': []})
own = [ref(p) for p in sorted(P.rglob('*')) if p.is_file()]
freeze = put('FINAL.targeted-source-neutral-author.freeze.json', {'schemaVersion': 1, 'role': 'Frozen neutral AUTHOR candidate and normal targeted proof, never independent approval', 'entry': entry, 'ownBindings': own, 'externalBindings': [external[p] for p in sorted(external)], 'allActualBindingsRegularCommittable': True, 'independentTargetedReviewsPending': ['A', 'B'], 'humanApproved': 0, 'strictGain': 0, 'activeWrites': []})
print(json.dumps({'entry': entry, 'freeze': freeze, 'ownFiles': len(own)+1, 'externalActualBindings': len(external), 'affectedCurrentPageContextIds': ids, 'normalJsonPassed': len(json_files), 'strictGain': 0, 'activeWrites': 0}))
