# SPDX-License-Identifier: Apache-2.0
import copy, hashlib, json, pathlib

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parent
ISO = ROOT / 'tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope'
SOURCE_ID = 'rp-bio-seki-rp-bio-seki-2014-tf07-informationen-empfangen-verarbeiten-speichern-003-84a4d2b3'
RAW = 'wenden das Schlüssel-Schloss-Prinzip zur Erklärung der Informationsübertragung an Synapsen in verschiedenen Problemstellungen (z. B. Synapsengifte, Drogen) an.'
BASE_FILE = BASE / 'source-candidates/extraction-08.author-v2.candidate.json'
ORIGINAL = 'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_BIOLOGIE_SEKI_RAHMENLEHRPLAN_2014.source-extraction.json'
PRIMARY = BASE / 'author-preparation/primary-pages/RP38.actual-primary.txt'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
write = lambda p, x: p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

data = json.loads(BASE_FILE.read_text())
candidate = copy.deepcopy(data)
goals = candidate['sourceGoals']
matches = [(i, g) for i, g in enumerate(goals) if g['id'] == SOURCE_ID]
assert len(matches) == 1
index, goal = matches[0]
primary_lines = PRIMARY.read_text().splitlines()
assert RAW in ' '.join(' '.join(primary_lines).split())
deltas = []
for field in ['sourceText', 'rawSourceText']:
    deltas.append({'path': f'/sourceGoals/{index}/{field}', 'before': goal[field], 'after': RAW})
    goal[field] = RAW
restored = copy.deepcopy(candidate)
for delta in deltas:
    restored['sourceGoals'][index][delta['path'].split('/')[-1]] = delta['before']
assert restored == data
out = HERE / 'RP.extraction.exact-raw-source.author-v2.candidate.json'
assert not out.exists(), 'additive output must be new'
write(out, candidate)
target = ISO / ORIGINAL
assert sha(target) == sha(BASE_FILE), 'isolate must still hold the frozen base RP candidate'
target.write_bytes(out.read_bytes())
write(HERE / 'RP.exact-two-raw-fields.actual.delta-receipt.json', {
    'schemaVersion': 1, 'authorCandidate': True, 'independentApproval': False,
    'baseFreezeSha256': sha(BASE / 'author-neurobiology21-source-p-v2.final.freeze.json'),
    'baseCandidatePath': str(BASE_FILE.relative_to(ROOT)), 'baseCandidateSha256': sha(BASE_FILE),
    'effectiveCandidatePath': str(out.relative_to(ROOT)), 'effectiveCandidateSha256': sha(out),
    'isolateOverlayOriginalPath': ORIGINAL, 'sourceGoalId': SOURCE_ID,
    'primaryTextPath': str(PRIMARY.relative_to(ROOT)), 'primaryTextSha256': sha(PRIMARY),
    'primaryPrintedPage': 36, 'primaryPhysicalPage': 38,
    'rawFragmentVerifiedAgainstActualPrimaryText': True, 'changedFields': deltas,
    'otherExtractionFieldsExact': True, 'authoredDescriptionPreservedExact': True,
    'canonicalPSourceMappingScopeAndCourseChanges': [],
    'sourceBackedSelectedGoals': 13, 'openSelectedGoals': 8,
    'outsideSelected21NativeTargetLossesStillBlocked': 187,
    'activeFilesWritten': [], 'baseFreezeAndBaseReviewZipRetainedUnchanged': True,
})
print(json.dumps({'candidate': str(out), 'sha256': sha(out), 'exactTwoRawFields': True}))
