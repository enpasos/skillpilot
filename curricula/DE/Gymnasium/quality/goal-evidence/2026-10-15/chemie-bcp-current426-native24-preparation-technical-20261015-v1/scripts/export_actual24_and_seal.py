# SPDX-License-Identifier: Apache-2.0
"""Export only actual24 existing PDF pages and seal the finite technical handoff."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import subprocess

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
BUNDLE = OWN / 'native-twenty-four/bundle'
OUT = OWN / 'pages'


def load(path):
    return json.loads(path.read_text())


def ref(path):
    body = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(body).hexdigest(), 'bytes': len(body)}


def put(path, value):
    assert not path.exists(), path
    with path.open('x') as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write('\n')


assert load(OWN / 'checks/NATIVE24.prepare.command.actual.json')['exitCode'] == 0
assert load(OWN / 'checks/NATIVE24.check.command.actual.json')['exitCode'] == 0
assert not OUT.exists()
OUT.mkdir()
model = load(BUNDLE / 'book-model.json')
full = load(OWN / 'full426/book-model.json')
assert len(model['pages']) == 24 and len(full['pages']) == 426
batch = load(OWN / 'native-twenty-four/batch-manifest.json')
assert batch['source']['baseBookDigest'] == full['digest']
assert model['navigation']['derivedProjection']['baseModelDigest'] == full['digest']
pdf = BUNDLE / 'book.pdf'
pdf_before = ref(pdf)
result = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], check=True, capture_output=True)
whole_text = OUT / 'whole-actual-PDF-pages.extracted-text.txt'
whole_text.write_bytes(result.stdout)
parts = [part for part in result.stdout.decode().split('\f') if part.strip()]
rows = []
for page in model['pages']:
    matches = [(i + 1, part) for i, part in enumerate(parts) if re.search(r'Lernziel-ID\s+' + re.escape(page['goalId']) + r'\b', part)]
    assert len(matches) == 1, (page['goalId'], [m[0] for m in matches])
    physical, body = matches[0]
    prefix = OUT / ('PDF.physical-%02d.%s' % (physical, page['goalId']))
    argv = ['pdftoppm', '-f', str(physical), '-l', str(physical), '-r', '120', '-png', '-singlefile', str(pdf), str(prefix)]
    proc = subprocess.run(argv, check=True, capture_output=True)
    png = Path(str(prefix) + '.png')
    assert png.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
    text_path = Path(str(prefix) + '.txt')
    text_path.write_text(body)
    rows.append({'goalId': page['goalId'], 'goalPageNumber': page['pageNumber'], 'physicalPdfPage': physical,
                 'actualWholePagePng': ref(png), 'actualPageText': ref(text_path), 'argv': argv, 'exitCode': proc.returncode})
assert ref(pdf) == pdf_before
put(OWN / 'checks/PAGES.actual24-PDF-to-PNG-and-text.receipt.json', {
    'schemaVersion': 1, 'role': 'Actual existing bounded PDF page exports; no new Native render or science',
    'pdf': pdf_before, 'actualPhysicalPdfPages': len(parts), 'actualGoalPages': 24,
    'wholePdfExtractedText': ref(whole_text), 'rows': rows,
    'additionalNativeBuilds': 0, 'scientificVotes': 0,
})
corrected_plan_path = OWN / 'checks/INPUTS.final-stable-native24.exact-source-address.technical.json'
plan = load(corrected_plan_path if corrected_plan_path.exists() else OWN / 'checks/INPUTS.final-stable-native24.technical.json')
author = OWN.parent / 'chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1'
source_inputs = load(author / 'INPUTS.finite-whole-author-selector.json')
source_refs = {
    'wholeOfficialSource': source_inputs['wholeOfficialSourceRead'],
    'whole52SourceCells': source_inputs['all52OriginalWholeSourceCells'],
    'whole20CasesSelection': ref(author / 'variants/twenty-whole-cases.exact-sparse-selection.author.json'),
    'whole15ProfileSelection': ref(author / 'variants/fifteen-whole-profiles.science-only-selection.author.json'),
}
for row in source_refs.values():
    assert ref(REPO / row['path']) == row
selector = {
    'schemaVersion': 1, 'role': 'Neutral final full426 and actual Native24 technical handoff; no historical or peer D verdicts',
    'canonical': plan['canonical'], 'semantic': plan['semantic'], 'qa': plan['qa'],
    'globalQaApprovalCoverage': plan['globalQaApprovalCoverage'],
    'full426Model': ref(OWN / 'full426/book-model.json'),
    'selected24Model': ref(BUNDLE / 'book-model.json'), 'actual24Pdf': pdf_before,
    'actual24Html': ref(BUNDLE / 'book.html'), 'actualBundleManifest': ref(BUNDLE / 'manifest.json'),
    'native24BatchManifest': ref(OWN / 'native-twenty-four/batch-manifest.json'),
    'roundAInput': ref(OWN / 'native-twenty-four/round-a/description-review-input.json'),
    'roundACampaign': ref(OWN / 'native-twenty-four/round-a/description-review-campaign.json'),
    'roundBInput': ref(OWN / 'native-twenty-four/round-b/description-review-input.json'),
    'roundBCampaign': ref(OWN / 'native-twenty-four/round-b/description-review-campaign.json'),
    'actual24PageExports': ref(OWN / 'checks/PAGES.actual24-PDF-to-PNG-and-text.receipt.json'),
    'actualSelected24FullModelContexts': ref(OWN / 'checks/FULL426.exact-selected24-page-and-canonical-contexts.actual.json'),
    'unreviewedOpen11beaNeighbourContext': ref(OWN / 'checks/OPEN11bea.actual-full426-context-only.not-selected-not-reviewed.json'),
    'raw15Profiles': ref(OWN / 'profiles/fifteen-whole-author-bodies.raw-E0G0.actual-resources.technical.jsonl'),
    'wholeRawSourceMaterial': source_refs,
    'newTenGoalIds': plan['newTenGoalIds'], 'retainedFiveGoalIds': plan['retainedFiveGoalIds'],
    'changedRelationNineGoalIds': plan['changedRelationNineGoalIds'], 'totalSelected': 24, 'fullModelDenominator': 426,
    'newScientificVotes': 0, 'newStrict': 0, 'oldDRewrites': 0, 'activeChanges': False,
    'HumanApproval': False, 'HumanTrial': False,
    'successfulExplicitFullModelFunctionCalls': 1, 'failedPreNativeExplicitModelAttempts': 1,
    'fullModelLoadsInsideUnchangedStockPrepare': 1,
    'successfulFullModelConstructionsSameDigest': 2, 'NativePrepareCalls': 1, 'NativeCheckCalls': 1,
    'preNativeTechnicalAddressCorrection': ref(OWN / 'checks/CORRECTION.semantic-source-address-only.before-any-Native.actual.json'),
    'boundedRasterPageExports': 24, 'rendererSourceMediaWrites': 0,
    'finalSealPath': (OWN / 'FILES.finite-final-full426-native24-technical-handoff.seal.json').relative_to(REPO).as_posix(),
}
for name in ['round-a', 'round-b']:
    assert list((OWN / 'native-twenty-four' / name / 'results').iterdir()) == []
assert list((OWN / 'native-twenty-four/resolutions').iterdir()) == []
put(OWN / 'NEUTRAL.finite-final-full426-native24-technical-handoff.selector.json', selector)
readme = OWN / 'README.technical-scope.md'
assert not readme.exists()
readme.write_text('''# Final inactive Chemie Native24 technical preparation

The exact final 426-goal BookModel and the normal 24-goal Native bundle share
the same full-base digest. The explicit stock model function succeeded once;
an earlier pre-Native attempt failed on the exact source-path contract and is
preserved with its minimal own-config address correction. Unchanged stock
Prepare loads that same base again internally. Exactly one
Prepare and one Check ran. The selected PDF alone was rendered; its 24 actual
goal pages were exported at 120 dpi. A full 426-page PDF was not rendered.

Scope: ten new BcP goals, five retained BcP goals and nine changed relation
contexts. The open 11bea neighbour is a separate unresolved context sidecar.
Fifteen exact whole author profile bodies are raw E0/G0 inputs bound to actual
current image hashes. Existing positive P records and their original reviewed
resource scopes remain intact. No historical or peer D verdict was loaded,
and both generated result directories and the resolution directory are empty.

Unchanged stock command: `tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts
prepare|check --config <owned-final-config>`, executed within the new private
host. Exact argv, exit codes and raw output are in checks/. The full model uses
the unchanged exported `loadGoalBookBuildInputs` and `writeGoalBookModel`
functions. The private host copies exact stock code only. Selected images are
read-only hardlink aliases with no duplicated image blocks; all other image,
canonical, semantic and QA inputs are references to actual repository targets.

This package grants no D/P/A/M/V decision, strict completion, runtime release,
Human Approval or Human Trial. No Central report, active data integration,
application build, git mutation, publication or deployment was performed.
Global QA ApprovalCoverage remains HOLD for four historical cluster images
outside this selected scope; the unchanged review-mode tools permit preparation
without converting that HOLD into a PASS.
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
    'schemaVersion': 1, 'role': 'Finite technical payload seal; no scientific judgement',
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'files': [ref(path) for path in sorted(files)],
    'newScientificVotes': 0, 'activeChanges': False,
})
print(json.dumps({'full426': 426, 'selected24': 24, 'actualPngPages': len(rows), 'payloadFiles': len(files), 'pdfUnchanged': True, 'newScientificVotes': 0}))
