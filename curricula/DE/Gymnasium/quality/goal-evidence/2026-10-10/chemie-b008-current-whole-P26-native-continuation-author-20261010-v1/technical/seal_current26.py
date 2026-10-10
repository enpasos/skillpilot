# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime
import hashlib
import json
import jsonschema
import shutil

R = Path.cwd()
P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
def ref(path):
    data = (R / path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

entry_path = P / 'neutral-whole26-current-material-P-and-native20-plus6.independent-review.entry.json'
entry = json.loads((R / entry_path).read_text())
refs = []
def collect(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str) and 'bytes' in value: refs.append(value)
        for v in value.values(): collect(v)
    elif isinstance(value, list):
        for v in value: collect(v)
collect(entry)
for old in refs:
    path = Path(old['path'])
    assert not path.is_absolute() and not str(path).startswith('tmp/'), old
    assert (R / path).is_file() and not (R / path).is_symlink(), old
    actual = ref(path)
    assert actual['bytes'] == old['bytes']
    # Historical finite-material indices contain bare SHA256 hex. Keep those
    # original bytes/fields; compare the same digest rather than rewrite them.
    assert actual['sha256'].removeprefix('sha256:') == old['sha256'].removeprefix('sha256:'), (old, actual)
assert len(entry['scopeGoalIds']) == 26
canon = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
kinds = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
assert ref(canon)['sha256'] == ref(P / 'inputs/current-whole-active-canonical.exact.json')['sha256'] == 'sha256:de99a87c79fa64f30144232223994635f69c76c88547d0cd40ff3b0fb590a44f'
assert ref(kinds)['sha256'] == ref(P / 'inputs/current-whole-active-semantic-kinds.exact.json')['sha256'] == 'sha256:3d980258bd2440bbdf6db70f6a8d7d2918cf5d9dc1d8f15902bbca518f805867'
whole = json.loads((R / P / 'candidate/current-whole511-398-B008.inactive.json').read_text())
jsonschema.validate(whole, json.loads((R / 'docs/landscape-runtime.schema.json').read_text()))
parsed = []
for file in (R / P).rglob('*'):
    assert not file.is_symlink(), file
    if file.is_file() and file.suffix == '.json': json.loads(file.read_text()); parsed.append(str(file.relative_to(R)))
    elif file.is_file() and file.suffix == '.jsonl':
        for line in file.read_text().splitlines():
            if line.strip(): json.loads(line)
        parsed.append(str(file.relative_to(R)))
technical_source = P / 'technical/seal_current26.py'
shutil.copyfile(Path(__file__), R / technical_source)
check = P / 'checks/final-neutral-entry-all-authoritative-bindings-regular-parse-and-runtime-schema.actual.json'
(R / check).write_text(json.dumps({'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'wholeNeutralEntry': ref(entry_path), 'allAuthoritativeEntryBindingsArePortableRegularExact': True, 'actualAuthoritativeEntryBindingCount': len(refs), 'allEntryReferencesNoTmpTargetsOrSymlinks': True, 'actualAllJsonAndJsonlParseCount': len(parsed), 'actualWhole511NormalRuntimeSchemaPassed': True, 'activeChem487AndKinds381StillExact': True, 'normalNativePrepareCheck20and6AndP26ReuseActualTerminalZero': True, 'whole398SourceCompilerIsActualFailHold355': True, 'historicalBareSha256HexWasComparedAsSameDigestWithoutRewritingOriginalFields': True, 'humanApproval': False, 'strictGain': 0, 'activeWrites': []}, ensure_ascii=False, indent=2) + '\n')
freeze = P / 'author.final.freeze.json'
verification = P / 'author.final.freeze.verification.actual.json'
files = [ref(f.relative_to(R)) for f in sorted((R / P).rglob('*')) if f.is_file() and f.relative_to(R) not in [freeze, verification]]
(R / freeze).write_text(json.dumps({'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Final immutable whole current inactive technical-author P26/Native20+6/source43-hold handoff; no new review, active adoption, M7 or human approval', 'entry': ref(entry_path), 'wholeExactOwnFiles': files, 'wholeOwnFileCount': len(files), 'wholeOwnByteCount': sum(f['bytes'] for f in files), 'scopeGoalIds': entry['scopeGoalIds'], 'actualNormalNativeSplit': [20, 6], 'ordinaryCampaignCount': 4, 'wholeAtomicModelCount': 398, 'wholeNodeModelCount': 511, 'actualProtectedContextDeltaCount': 12, 'sourceScope': 'Actual355of398HOLD;43exact19existing+24new;496unresolvedunchanged', 'newScienceClaims': 0, 'newCurrentNativeApprovals': 0, 'newScientificStrictClosures': 0, 'restoredStrictBindings': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []}, ensure_ascii=False, indent=2) + '\n')
for old in files: assert ref(Path(old['path'])) == old
(R / verification).write_text(json.dumps({'schemaVersion': 1, 'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'wholeFinalFreeze': ref(freeze), 'actualAllOwnFilesVerifiedByteExact': True, 'actualOwnFileCount': len(files), 'actualAuthoritativeNeutralEntryBindingsVerified': len(refs), 'allOwnFilesRegularWithoutSymlinks': True, 'actualActiveCanonical487AndKinds381StillExact': True, 'strictGain': 0, 'humanApproval': False, 'activeWrites': []}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'entry': ref(entry_path), 'freeze': ref(freeze), 'verification': ref(verification), 'ownFiles': len(files), 'ownBytes': sum(x['bytes'] for x in files), 'nativeModelDigests': [json.loads((R / P / f'native/current-{n}/bundle/book-model.json').read_text())['digest'] for n in [20, 6]], 'activeBaseExact': True}, ensure_ascii=False))
