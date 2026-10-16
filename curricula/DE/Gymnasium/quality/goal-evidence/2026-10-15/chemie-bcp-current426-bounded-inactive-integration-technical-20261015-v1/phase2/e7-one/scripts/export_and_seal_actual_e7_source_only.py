# SPDX-License-Identifier: Apache-2.0
"""Export the sole actual e7 PDF page; no FIRST read or scientific output."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import subprocess

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
GID = 'e7c3d20e-4b13-560b-b8ee-c5abca8cc624'
BUNDLE = OWN / 'native-one/bundle'


def load(path):
    return json.loads(path.read_text())


def ref(path):
    b = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def put(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


for mode in ['prepare', 'check']:
    assert load(OWN / ('NATIVE.e7-one.' + mode + '.command.actual.json'))['exitCode'] == 0
model = load(BUNDLE / 'book-model.json')
assert len(model['pages']) == 1 and model['pages'][0]['goalId'] == GID
page = model['pages'][0]
input_path = OWN / 'native-one/round-a/description-review-input.json'
other_input = OWN / 'native-one/round-b/description-review-input.json'
assert input_path.read_bytes() == other_input.read_bytes()
current = load(input_path)
assert current['goalCount'] == 1 and current['goals'][0]['goalId'] == GID
assert current['goals'][0]['reviewContext']['evidenceProfile'] is None
assert current['goals'][0]['pageFingerprint'] == page['pageFingerprint']
pdf = BUNDLE / 'book.pdf'
before = ref(pdf)
result = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], capture_output=True, check=True)
parts = [part for part in result.stdout.decode().split('\f') if part.strip()]
matches = [(i + 1, body) for i, body in enumerate(parts) if re.search(r'Lernziel-ID\s+' + re.escape(GID) + r'\b', body)]
assert len(matches) == 1
physical, body = matches[0]
pages = OWN / 'pages'
assert not pages.exists()
pages.mkdir()
whole = pages / 'whole-actual-D1-PDF.extracted-text.txt'
whole.write_bytes(result.stdout)
text = pages / 'actual-e7-whole-goal-page.txt'
text.write_text(body)
prefix = pages / 'actual-e7-whole-goal-page'
argv = ['pdftoppm', '-f', str(physical), '-l', str(physical), '-r', '120', '-png', '-singlefile', str(pdf), str(prefix)]
subprocess.run(argv, check=True, capture_output=True)
png = Path(str(prefix) + '.png')
assert png.read_bytes().startswith(b'\x89PNG\r\n\x1a\n') and ref(pdf) == before
for side in ['a', 'b']:
    assert list((OWN / ('native-one/round-' + side + '/results')).iterdir()) == []
assert list((OWN / 'native-one/resolutions').iterdir()) == []
plan = load(OWN / 'INPUTS.one-required-proper-e7-native.root-authorized.json')
for key in ['canonical', 'semantic', 'qa', 'savedFull426Model', 'existingNineModel', 'existingNinePdf']:
    assert ref(REPO / plan[key]['path']) == plan[key]
selector = {
    'schemaVersion': 1, 'role': 'Neutral actual proper e7 D1 Native input and page only; no FIRSTs or scientific records',
    'goalId': GID, 'canonical': plan['canonical'], 'semantic': plan['semantic'], 'qa': plan['qa'],
    'actualD1Model': ref(BUNDLE / 'book-model.json'), 'actualD1Pdf': before,
    'actualD1Html': ref(BUNDLE / 'book.html'), 'actualD1BundleManifest': ref(BUNDLE / 'manifest.json'),
    'actualD1BatchManifest': ref(OWN / 'native-one/batch-manifest.json'),
    'roundAInput': ref(input_path), 'roundACampaign': ref(OWN / 'native-one/round-a/description-review-campaign.json'),
    'roundBInput': ref(other_input), 'roundBCampaign': ref(OWN / 'native-one/round-b/description-review-campaign.json'),
    'currentBindings': {'goalFingerprint': page['goalFingerprint'], 'pageFingerprint': page['pageFingerprint'],
                        'bookDigest': current['bookDigest'], 'bundleFingerprint': current['bundleFingerprint'],
                        'reviewInputFingerprint': current['reviewInputFingerprint']},
    'actualWholeGoalPagePng': ref(png), 'actualWholeGoalPageText': ref(text),
    'actualWholePdfText': ref(whole), 'actualPhysicalPdfPage': physical, 'goalPageNumber': page['pageNumber'],
    'existingE7EvidenceProfile': None, 'savedFull426AndOldNineUnchanged': True,
    'existingNineSourceReport': ref(OWN / 'READONLY.stock-D1-boundary-and-exact-existing-e7-page-sources.json'),
    'stockPrepare': 'PASS', 'stockCheck': 'PASS', 'actualAdditionalPrepareCalls': 1,
    'actualAdditionalCheckCalls': 1, 'actualAdditionalSubsetPdfRenders': 1,
    'explicitFull426Builds': 0, 'oldNineRerenders': 0, 'FIRSTsRead': False,
    'normalRecords': 0, 'normalRuns': 0, 'newScienceVotes': 0,
    'finalSealPath': (OWN / 'FILES.finite-actual-proper-e7-D1-source-only.seal.json').relative_to(REPO).as_posix(),
}
selector_path = OWN / 'NEUTRAL.actual-proper-e7-D1-input-campaign-page.source-only.selector.json'
put(selector_path, selector)
files = [path for path in OWN.rglob('*') if path.is_file()]
for path in files:
    assert not path.is_symlink()
    if path.suffix == '.json':
        load(path)
    if path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
put(OWN / 'FILES.finite-actual-proper-e7-D1-source-only.seal.json', {
    'schemaVersion': 1, 'role': 'Finite technical source artifacts only; no D1 FIRST or normal records',
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'files': [ref(path) for path in sorted(files)], 'newScienceVotes': 0,
})
print(json.dumps({'selector': ref(selector_path), 'pageFingerprint': page['pageFingerprint'],
                  'actualPhysicalPdfPage': physical, 'payloadFiles': len(files), 'normalRecords': 0}), flush=True)
