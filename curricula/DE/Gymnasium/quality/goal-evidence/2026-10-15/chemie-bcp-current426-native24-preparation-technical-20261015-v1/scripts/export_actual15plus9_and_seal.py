# SPDX-License-Identifier: Apache-2.0
"""Export actual15+9 PDF pages and seal only the finite technical payload."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import subprocess

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]


def load(path):
    return json.loads(path.read_text())


def ref(path):
    body = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(body).hexdigest(), 'bytes': len(body)}


def verify(row):
    path = REPO / row['path']
    assert ref(path) == row
    return path


def put(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


plan = load(OWN / 'checks/INPUTS.two-proper-stock-batches15-and9.technical.json')
full_path = OWN / 'full426/book-model.json'
full = load(full_path)
assert len(full['pages']) == 426
out = OWN / 'pages'
assert not out.exists()
out.mkdir()
all_rows = []
bundle_refs = []
for batch in plan['batches']:
    label = batch['label']
    for mode in ['prepare', 'check']:
        assert load(OWN / 'checks' / ('NATIVE.' + label + '.' + mode + '.command.actual.json'))['exitCode'] == 0
    root = REPO / batch['outputDirectory']
    bundle = root / 'bundle'
    model = load(bundle / 'book-model.json')
    manifest = load(root / 'batch-manifest.json')
    assert len(model['pages']) == batch['expectedGoalCount']
    assert manifest['source']['baseBookDigest'] == full['digest']
    assert model['navigation']['derivedProjection']['baseModelDigest'] == full['digest']
    assert [row['goalId'] for row in model['pages']] == batch['goalIds']
    pdf = bundle / 'book.pdf'
    pdf_before = ref(pdf)
    result = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], check=True, capture_output=True)
    parts = [part for part in result.stdout.decode().split('\f') if part.strip()]
    target = out / label
    target.mkdir()
    whole = target / 'whole-actual-PDF-pages.extracted-text.txt'
    whole.write_bytes(result.stdout)
    rows = []
    for page in model['pages']:
        matches = [(i + 1, part) for i, part in enumerate(parts)
                   if re.search(r'Lernziel-ID\s+' + re.escape(page['goalId']) + r'\b', part)]
        assert len(matches) == 1, (page['goalId'], [row[0] for row in matches])
        physical, body = matches[0]
        prefix = target / ('PDF.physical-%02d.%s' % (physical, page['goalId']))
        argv = ['pdftoppm', '-f', str(physical), '-l', str(physical), '-r', '120', '-png', '-singlefile', str(pdf), str(prefix)]
        proc = subprocess.run(argv, check=True, capture_output=True)
        png = Path(str(prefix) + '.png')
        assert png.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
        text_path = Path(str(prefix) + '.txt')
        text_path.write_text(body)
        rows.append({'goalId': page['goalId'], 'batch': label, 'goalPageNumber': page['pageNumber'],
                     'physicalPdfPage': physical, 'actualWholePagePng': ref(png),
                     'actualPageText': ref(text_path), 'argv': argv, 'exitCode': proc.returncode})
    assert ref(pdf) == pdf_before
    for round_name in ['round-a', 'round-b']:
        assert list((root / round_name / 'results').iterdir()) == []
    assert list((root / 'resolutions').iterdir()) == []
    all_rows.extend(rows)
    bundle_refs.append({'batch': label, 'goalCount': len(model['pages']), 'goalIds': batch['goalIds'],
                        'model': ref(bundle / 'book-model.json'), 'pdf': pdf_before,
                        'html': ref(bundle / 'book.html'), 'bundleManifest': ref(bundle / 'manifest.json'),
                        'batchManifest': ref(root / 'batch-manifest.json'),
                        'roundAInput': ref(root / 'round-a/description-review-input.json'),
                        'roundACampaign': ref(root / 'round-a/description-review-campaign.json'),
                        'roundBInput': ref(root / 'round-b/description-review-input.json'),
                        'roundBCampaign': ref(root / 'round-b/description-review-campaign.json'),
                        'actualPhysicalPdfPages': len(parts), 'wholePdfText': ref(whole)})
assert len(all_rows) == len({row['goalId'] for row in all_rows}) == 24
page_receipt = OWN / 'checks/PAGES.actual24-two-PDFs-to-PNG-and-text.receipt.json'
put(page_receipt, {'schemaVersion': 1, 'role': 'Actual24 complete PDF-page exports from two legal stock bundles; no new render or science',
                   'bundleSizes': [15, 9], 'rows': all_rows, 'actualGoalPages': 24,
                   'additionalNativeBuilds': 0, 'scientificVotes': 0})

release = load(verify(plan['finalRelease']))
qa_selector = load(verify(release['finalInputSelector']))
helper_ref = qa_selector['full426SourceIdHelper']
helper = load(verify(helper_ref))
selected = set(plan['selectedGoalIds'])
selected_v = [row for row in helper['records'] if row['goalId'] in selected]
assert len(selected_v) == 24
assert all(row['stockVisualizationPredicate'] and row['exactCurrentSourceIdAndNormalMetadata']
           and row['exactCurrentPrimaryBinding'] and row['currentPublicAndCanonicalBytesExact'] for row in selected_v)
v_receipt = OWN / 'checks/SCOPE24.original-current-V-helper-selection.no-new-vote.json'
put(v_receipt, {'role': 'Technical selection of24 existing actual stock V-helper results; no new predicate run or vote',
               'originalWhole426Helper': helper_ref, 'records': selected_v, 'selectedPredicatePass': 24,
               'whole426UnchangedOpenGoalIds': helper['openGoalIds'], 'globalGrant': False, 'newVotes': 0})
author = OWN.parent / 'chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1'
source_inputs = load(author / 'INPUTS.finite-whole-author-selector.json')
source_refs = {'wholeOfficialSource': source_inputs['wholeOfficialSourceRead'],
               'whole52SourceCells': source_inputs['all52OriginalWholeSourceCells'],
               'whole20CasesSelection': ref(author / 'variants/twenty-whole-cases.exact-sparse-selection.author.json'),
               'whole15ProfileSelection': ref(author / 'variants/fifteen-whole-profiles.science-only-selection.author.json')}
for row in source_refs.values():
    verify(row)
selector = {'schemaVersion': 1,
            'role': 'Neutral actual full426 and two proper Native15+9 bundles; no historical or peer D verdicts',
            'canonical': plan['canonical'], 'semantic': plan['semantic'], 'qa': plan['qa'],
            'globalQaApprovalCoverage': plan['globalQaApprovalCoverage'],
            'full426Model': ref(full_path), 'full426Digest': full['digest'], 'batches': bundle_refs,
            'actual24PageExports': ref(page_receipt), 'selected24CurrentVHelper': ref(v_receipt),
            'actualSelected24FullModelContexts': ref(OWN / 'checks/FULL426.exact-selected24-page-and-canonical-contexts.actual.json'),
            'unreviewedOpen11beaNeighbourContext': ref(OWN / 'checks/OPEN11bea.actual-full426-context-only.not-selected-not-reviewed.json'),
            'raw15Profiles': ref(OWN / 'profiles/fifteen-whole-author-bodies.raw-E0G0.actual-resources.technical.jsonl'),
            'wholeRawSourceMaterial': source_refs, 'newTenGoalIds': plan['newTenGoalIds'],
            'retainedFiveGoalIds': plan['retainedFiveGoalIds'], 'changedRelationNineGoalIds': plan['changedRelationNineGoalIds'],
            'totalSelected': 24, 'fullModelDenominator': 426,
            'execution': {'successfulExplicitFullModelCalls': 1, 'failedPreNativeModelAddressAttempts': 1,
                          'rejectedOversizedConfigBeforeModelOrRender': 1, 'properNativePrepareCalls': 2,
                          'properNativeCheckCalls': 2, 'fullModelLoadsInsideProperStockPrepare': 2,
                          'successfulSameDigestFullModelConstructions': 3, 'actualPdfRenders': 2,
                          'actualRasterPageExports': 24, 'centralRuns': 0},
            'preservedPreRenderCorrections': [ref(OWN / 'checks/CORRECTION.semantic-source-address-only.before-any-Native.actual.json'),
                                             ref(OWN / 'checks/CORRECTION.stock-max20-respected-two-batches.before-render.actual.json')],
            'newScientificVotes': 0, 'newStrict': 0, 'oldDRewrites': 0, 'activeChanges': False,
            'HumanApproval': False, 'HumanTrial': False,
            'finalSealPath': (OWN / 'FILES.finite-final-full426-native24-technical-handoff.seal.json').relative_to(REPO).as_posix()}
put(OWN / 'NEUTRAL.finite-final-full426-native24-technical-handoff.selector.json', selector)
readme = OWN / 'README.technical-scope.md'
assert not readme.exists()
readme.write_text('''# Final inactive Chemie full426 / Native15+9 preparation

The actual full426 BookModel is saved. Two proper unchanged stock batches
contain15 BcP goals and9 changed relation contexts,24 distinct goals total.
Each normal Prepare and Check passed once. Both batches bind the same saved
full426 digest. Only their selected PDFs were rendered. All24 complete goal
pages are exported at120dpi with actual PDF-page and goal-ID mapping.

Two pre-render configuration failures are preserved: the first model attempt
used a normal alias where the exact final semantic ledger requires its own
candidate source path; the attempted24-goal config exceeded the unchanged
20-goal stock limit. The minimal own-address correction and root-authorized
15+9 split changed no stock module, contract, source body or quality gate.
One explicit full-model call succeeded; each proper Prepare loads the same
base internally. No additional explicit full-model build followed the split.

Fifteen exact whole author profile bodies are rawE0/G0 Native inputs bound to
current actual images. Existing positive P records and their resource scopes
remain intact. No historical or peer D verdict was loaded. Both result and
resolution directories are empty. The open11bea context is a separate sidecar.

Global QA ApprovalCoverage remains HOLD for four historical cluster images;
whole426 strictV remains422/426. The selected24 existing stockV-helper rows
are all PASS. These technical facts grant no new D/P/A/M/V vote or M7 result.
No active integration, Central report, full426 PDF, application build, git
mutation, publication, deployment, Human Approval or Human Trial occurred.

Execution used a new ignored private host with exact stock-code copies and
repository input references. Selected image bytes were read-only hardlinks,
with zero duplicated image blocks and no source-media writes. Exact normal
commands and raw output are preserved under checks/.
''')
files = [path for path in OWN.rglob('*') if path.is_file()]
for path in files:
    assert not path.is_symlink(), path
    if path.suffix == '.json':
        load(path)
    if path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
put(OWN / 'FILES.finite-final-full426-native24-technical-handoff.seal.json', {
    'schemaVersion': 1, 'role': 'Finite technical payload only; no scientific judgment',
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'files': [ref(path) for path in sorted(files)], 'newScientificVotes': 0, 'activeChanges': False})
print(json.dumps({'full426': 426, 'nativeGoalPages': [15, 9], 'actualCompletePagePngs': 24,
                  'selectedOriginalStockVPass': 24, 'payloadFiles': len(files), 'newScienceVotes': 0}), flush=True)
