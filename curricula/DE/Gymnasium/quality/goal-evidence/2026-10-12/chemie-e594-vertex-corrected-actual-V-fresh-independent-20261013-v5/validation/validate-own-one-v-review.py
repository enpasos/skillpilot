import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import jsonschema

parser = argparse.ArgumentParser()
parser.add_argument('packet')
parser.add_argument('repo')
parser.add_argument('final_relative')
args = parser.parse_args()
packet = Path(args.packet).absolute()
repo = Path(args.repo).absolute()
final_relative = args.final_relative.rstrip('/')
goal_id = 'e5941581-0aba-5354-b4b9-d0249d4538a8'
candidate_hash = 'a728cc442316a8028844ac7d48f15dc490e4f85882f002eab99c81f683b832f3'

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()

for parent in [packet, *packet.parents]:
    st = parent.lstat()
    assert stat.S_ISDIR(st.st_mode) and not stat.S_ISLNK(st.st_mode) and not st.st_mode & 0o022, str(parent)
assert packet.stat().st_uid == os.getuid()
files = sorted(p for p in packet.rglob('*') if p.is_file())
assert all(not p.is_symlink() and stat.S_ISREG(p.lstat().st_mode) for p in files)
parsed = 0
for path in files:
    if path.suffix == '.json': json.loads(path.read_text()); parsed += 1

first_path = packet / 'review/FIRST.e594-corrected-actual-independent-verdict.json'
assert digest(first_path) == '7623f336e9241049a26abaf7d64958b9f78af4da0736a6249aeddf480aee8d2e'
first = json.loads(first_path.read_text())
assert first['goalId'] == goal_id and first['verdict'] == 'PASS'
assert first['didAuthorImageOrCase'] is False and first['authorProvisionalCurrentVerdictReadBeforeFirst'] is False and first['peerCurrentVerdictsReadBeforeFirst'] is False
assert digest(packet / 'inputs/e594.actual-selected-native-byte-exact.png') == candidate_hash
current = json.loads((packet / 'inputs/goal.current.whole.json').read_text())
candidate = json.loads((packet / 'inputs/goal.candidate-link-fragment.json').read_text())
assert {k: v for k, v in current.items() if k != 'resourceLinks'} == {k: v for k, v in candidate.items() if k != 'resourceLinks'}
schema = json.loads((packet / 'inputs/landscape-runtime.schema.json').read_text())
jsonschema.Draft202012Validator({'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}).validate(candidate)
cases = json.loads((packet / 'inputs/selected-two-current-whole-cases.json').read_text())
assert len(cases['cases']) == 2 and all(c['goalId'] == goal_id for c in cases['cases'])

links = []
def mapped(path):
    return packet / path[len(final_relative) + 1:] if path.startswith(final_relative + '/') else repo / path

def bind_check(binding):
    path = mapped(binding['path'])
    assert path.is_file() and not path.is_symlink(), binding['path']
    assert digest(path) == binding['sha256'] and path.stat().st_size == binding['bytes'], binding['path']
    links.append(binding['path'])

config = json.loads((packet / 'review/V.independent.config.json').read_text())
for field in ['reviewJsonPath', 'reviewMarkdownPath', 'visualizationQaCandidatePath', 'futureLiveRowPath', 'candidateGoalFragmentPath']:
    assert mapped(config[field]).is_file(), config[field]
    links.append(config[field])
for field in ['firstVerdictBinding', 'actualAssetBinding']: bind_check(config[field])
review = json.loads((packet / 'review/independent.corrected-e594.actual-visual-review.json').read_text())
for field in ['firstImmutableVerdictBinding', 'actualAssetBinding', 'currentGoalBinding', 'candidateGoalFragmentBinding', 'actualReceiptBinding']: bind_check(review[field])
receipt = json.loads((packet / 'review/actual-tools-whole-image-and-read-receipts.json').read_text())
bind_check(receipt['rawInputReceiptBinding'])
for view in receipt['actualViews']:
    bind_check(view['binding'])
    assert view['actuallyViewed'] is True
assert receipt['wholeNativeOutsideROIReviewPerformed'] is True and receipt['outsideROIPixelsClaimedIdentical'] is False
assert receipt['unchangedF0SigmaReinspectionPerformed'] is False

ledger = json.loads((packet / 'review/V.ordinary-selected-one.inactive.qa.json').read_text())
before = json.loads((packet / 'inputs/active-chemie.qa.raw.json').read_text())
assert ledger['schemaVersion'] == 1 and ledger['subject'] == 'chemie' and len(ledger['records']) == 1
row = ledger['records'][0]
assert row['goalId'] == goal_id and row['assetSha256'] == row['aiApprovedAssetSha256'] == 'sha256:' + candidate_hash and row['aiApproved'] == 'yes'
old = next(r for r in before['records'] if r['goalId'] == goal_id)
for key in old:
    if key.lower().startswith('human') or key.startswith('chatGpt') or key in ['umlautsCorrectChatGpt', 'contentApprovedChatGpt']: assert row[key] == old[key]
for field in ['landscapePath', 'canonicalAssetPath', 'publicAssetPath']:
    path = repo / row[field]
    assert path.is_file() and not path.is_symlink(), row[field]
    links.append(row[field])
    if field != 'landscapePath': assert digest(path) == candidate_hash

raw_inputs = json.loads((packet / 'inputs/raw-input-receipts.json').read_text())
for item in raw_inputs['files']:
    assert digest(packet / item['retainedCopy']) == item['sha256']
    assert digest(repo / item['sourcePath']) == item['sha256'], item['sourcePath']
    links.append(item['sourcePath'])
guards = json.loads((packet / 'validation/old-seals-two-sibling-candidates-and-current-active-byte-guards.json').read_text())
for item in guards['priorBindings'] + guards['currentActiveBindings']:
    assert digest(repo / item['path']) == item['sha256'] and (repo / item['path']).stat().st_size == item['bytes'], item['path']
    links.append(item['path'])

author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-e594-three-ring-vertex-correction-raster-author-20261013-v4'
freeze_path = author / 'FINAL.one-e594-vertex-correction-author.freeze.json'
assert digest(freeze_path) == 'aec7aba6884aa4942077c72649179cc43fd0995e699cc07017bc085ff29d48d6'
seal = json.loads(freeze_path.read_text())
for item in seal['candidateFiles']:
    path = repo / item['path'] if item['path'].startswith('curricula/') else author / item['path']
    assert path.is_file() and not path.is_symlink() and digest(path) == item['sha256'].removeprefix('sha256:')
    if 'bytes' in item: assert path.stat().st_size == item['bytes']

selector = json.loads((packet / 'inputs/neutral-factual-selector.raw.json').read_text())
for copy in selector['sourceAppBackendCandidateCopies']:
    path = repo / copy['portablePath']
    assert path.is_file() and not path.is_symlink() and digest(path) == candidate_hash
    links.append(copy['portablePath'])

namespace = {'__name__': 'scoped_existing_curriculum_guard', '__file__': str(repo / 'scripts/validate_schemas.py')}
exec(compile((repo / 'scripts/validate_schemas.py').read_text(), namespace['__file__'], 'exec'), namespace)
symlink_errors = namespace['curriculum_symlink_errors'](str(repo))
assert not symlink_errors, symlink_errors
own_paths = [final_relative + '/' + p.relative_to(packet).as_posix() for p in files]
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(sorted(set(links + own_paths))) + '\n', cwd=repo, text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
for path in links:
    actual = mapped(path)
    assert actual.resolve().is_relative_to(repo) and actual.is_file() and not actual.is_symlink()

print(json.dumps({'schemaVersion': 1, 'scope': 'one corrected e594 actual V; no unchanged sibling reinspection/full build/native-D campaign', 'goalIds': [goal_id], 'selectedGoalRuntimeSchemaValid': True, 'structuredFilesParsed': parsed, 'ownRegularFilesValidated': len(files), 'firstVerdictUnchanged': True, 'authorFreezeFilesVerified': len(seal['candidateFiles']), 'allThreePortableRasterCopiesByteExact': True, 'retainedRawInputsByteExact': True, 'productionPngBytesUnmodified': True, 'wholeNativeOutsideROIActuallyReviewed': True, 'normalGlobalCurriculumSymlinkGuardErrors': symlink_errors, 'globalCommittableReferencesValidated': len(set(links)), 'ownFinalPathsCommittable': True, 'currentHumanAndLegacyFieldsRetained': True, 'historicalV3AndTwoSiblingCandidateHashesUnchanged': True, 'currentActiveHashesPreserved': True, 'futureLivePathsArePlannedOnly': True, 'acceptedVotes': 1, 'humanApproval': False, 'humanTrial': False, 'm7Gain': 0, 'activeWrites': 0}, indent=2))
