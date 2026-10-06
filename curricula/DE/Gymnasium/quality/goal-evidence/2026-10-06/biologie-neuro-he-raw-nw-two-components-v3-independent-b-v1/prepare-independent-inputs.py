"""Independent bounded input guard and sparse native experiment preparation.

SPDX-License-Identifier: Apache-2.0
Only this review directory and its dedicated tmp directory are written.
"""
import hashlib
import json
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
TMP = REPO / 'tmp/biologie-neuro-v3-source-independent-b-primary'
ROOT = TMP / 'sparse-native-inputs'
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3'
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
STAGED = REPO / 'tmp/biologie-neuro-he-nw-two-components-v3-sparse-root'
ARCHIVE = BASE / 'neurobiology21-author-v2.review-inputs-and-native-evidence.zip'
CONFIG = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
HE = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-ephase-seven-current365-20261005-v2.source-extraction.json'
RP = 'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_BIOLOGIE_SEKI_RAHMENLEHRPLAN_2014.source-extraction.json'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def binding(path):
    path = Path(path)
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': sha(path.read_bytes()), 'bytes': path.stat().st_size}

def read(path):
    return json.loads(Path(path).read_text())

def put(name, data):
    path = OUT / name
    assert not path.exists(), path
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

assert REPO.name == 'skillpilot', REPO
assert not ROOT.exists(), 'Never reuse mutable previous experiment inputs.'
ROOT.mkdir(parents=True)
freeze = AUTHOR / 'he-raw-nw-two-components.author-v3.final.freeze.json'
assert sha(freeze.read_bytes()) == 'ea346daac64ed085390a422256b716734d1115245775a01f407252d297e73e99'
for item in read(freeze)['files']:
    actual = binding(REPO / item['path'])
    assert actual['sha256'] == item['sha256'] and actual['bytes'] == item['bytes'], actual
archive_sha = sha(ARCHIVE.read_bytes())
assert archive_sha == 'c5de33b351297721a95655b436c151a1bac4a0b4fe5879c9ac8f26a37dcd5e37'
archive_bindings = []
config = None
with zipfile.ZipFile(ARCHIVE) as z:
    for name in z.namelist():
        if not name.startswith('native-inputs/') or name.endswith('/'):
            continue
        relative = name.removeprefix('native-inputs/')
        assert '..' not in Path(relative).parts
        bytes_ = z.read(name)
        archive_bindings.append({'path': relative, 'archiveSha256': sha(bytes_), 'bytes': len(bytes_)})
        destination = ROOT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        if relative == CONFIG:
            config = json.loads(bytes_)
            destination.write_bytes(bytes_)
        elif relative == HE:
            destination.symlink_to(AUTHOR / 'HE.LK7.exact-original-and-declared-normalization.author-v3.candidate.json')
        elif relative == 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json':
            # Frozen baseline output, not read by the build API. Retain exact archive bytes.
            destination.write_bytes(bytes_)
        elif relative == RP:
            destination.symlink_to(BASE / 'additive-rp-exact-raw-source-final-v2/RP.extraction.exact-raw-source.author-v2.candidate.json')
        else:
            staged = STAGED / relative
            assert staged.is_file(), relative
            assert staged.read_bytes() == bytes_, f'Staged input differs from the independently hashed original archive: {relative}'
            destination.symlink_to(staged.resolve())
assert config and config['expectedCurricularAtomicGoalCount'] == 383
additional_cache_bindings = []
for snapshot in config['sourceDocumentSnapshots']:
    destination = ROOT / snapshot['path']
    if not destination.exists():
        source = REPO / snapshot['path']
        assert sha(source.read_bytes()) == snapshot['sha256'].removeprefix('sha256:')
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.symlink_to(source)
        additional_cache_bindings.append(binding(source))
delta = read(AUTHOR / 'actual-author-delta-and-inputs.json')
for candidate, path in [
    ('NW.two-bacterial-source-components.author-v3.candidate.json', delta['NWProspectiveExtractionPath']),
    ('NW.two-bacterial-component-mappings.author-v3.candidate.json', delta['NWProspectiveMappingPath']),
]:
    destination = ROOT / path
    assert not destination.exists()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.symlink_to(AUTHOR / candidate)
for primary, page in [
    ('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf', 43),
    ('curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf', 35),
]:
    filename = ('HE' if page == 43 else 'NW') + f'-p{page}.fresh-layout.txt'
    subprocess.run(['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(REPO / primary), str(TMP / filename)], check=True)

before_he = read(BASE / 'source-candidates/extraction-02.author-v2.candidate.json')
after_he = read(AUTHOR / 'HE.LK7.exact-original-and-declared-normalization.author-v3.candidate.json')
changed_id = 'bfd043fc-7eb7-5ff5-90ab-e2d978d21aa0'
old_by_id = {g['id']: g for g in before_he['sourceGoals']}
new_by_id = {g['id']: g for g in after_he['sourceGoals']}
assert old_by_id.keys() == new_by_id.keys()
changed_ids = [key for key in old_by_id if old_by_id[key] != new_by_id[key]]
assert changed_ids == [changed_id]
raw = 'neurophysiogische Verfahren (Prinzip: ein bildgebendes Verfahren der Hirnforschung)'
normalized = 'neurophysiologische Verfahren (Prinzip: ein bildgebendes Verfahren der Hirnforschung)'
target = new_by_id[changed_id]
for field in ['sourceText', 'rawSourceText', 'parentBulletText', 'rawParentBulletText']:
    assert target[field] == raw
assert target['title'] == target['description'] == normalized
assert target['editorialNormalization']['sourceMeaningOrCoverageChanged'] is False
assert raw in (TMP / 'HE-p43.fresh-layout.txt').read_text()

nw = read(AUTHOR / 'NW.two-bacterial-source-components.author-v3.candidate.json')
mapping = read(AUTHOR / 'NW.two-bacterial-component-mappings.author-v3.candidate.json')
bullet = 'den Bau und die Vermehrung von Bakterien und Viren beschreiben (UF1),'
assert bullet in (TMP / 'NW-p35.fresh-layout.txt').read_text()
assert len(nw['sourceGoals']) == len(mapping['decisions']) == len(mapping['mappings']) == 2
existing_source_ids = set()
for path in config['mappingPaths']:
    item = read(ROOT / path)
    extraction = read(ROOT / item['sourceExtractionPath'])
    existing_source_ids.update(g['id'] for g in extraction['sourceGoals'])
for source in nw['sourceGoals']:
    assert source['id'] not in existing_source_ids
    for field in ['sourceText', 'rawSourceText', 'parentBulletText', 'rawParentBulletText']:
        assert source[field] == bullet
    assert source['stage'] == 'SekI' and source['courseLevel'] == 'unspecified'
    assert source['isOfficialBullet'] is False and source['officialNumberingClaim'] is False
    assert source['wholeOriginalBulletCoverage'] is False
    assert source['authorOperationalisation'] is True
for decision in mapping['decisions']:
    assert decision['decision'] == 'mapped' and decision['matchType'] == 'partial'
    assert decision['wholeOriginalSourceCoverage'] is False
    assert decision['independentReviewStatus'] == 'pending'
assert mapping['originalWholeIF7HoldRetained'] is True and mapping['wholeOriginalSourceCoverage'] is False
old_nw_mapping = read(BASE / 'source-candidates/mapping-07.author-v2.candidate.json')
old_whole = next(d for d in old_nw_mapping['decisions'] if d['sourceGoalId'] == nw['retainedOriginalSourceObligations']['originalWholeIF7Summary']['id'])
assert old_whole['decision'] == 'needs_canonical_goal' and old_whole['wholeSourceCoverage'] is False

checkpoint_path = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
checkpoint = read(checkpoint_path)
for item in checkpoint['currentInputs']:
    assert binding(REPO / item['path']) == item
put('inputs-and-primary-transcription.actual.json', {
    'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'authorFreeze': binding(freeze),
    'allNineAuthorFilesVerified': True,
    'baselineNativeArchive': binding(ARCHIVE),
    'nativeArchiveEntriesVerified': len(archive_bindings),
    'archiveNativeBindings': archive_bindings,
    'additionalPinnedCacheBindings': additional_cache_bindings,
    'independentSparseRoot': ROOT.relative_to(REPO).as_posix(),
    'candidateChanges': [HE, RP, delta['NWProspectiveExtractionPath'], delta['NWProspectiveMappingPath']],
    'baselineConfigWholeExactToArchive': True,
    'baselineExpected383ContractUnchanged': True,
    'HEOnlyChangedSourceGoalIds': changed_ids,
    'HEOriginalSpellingAndEditorialDistinctionVerified': True,
    'NWOriginalBulletAndTwoComponentScopeVerified': True,
    'NWSourceIdCollisionCount': 0,
    'wholeOriginalIF7Decision': old_whole,
    'currentActiveInputsBefore': checkpoint['currentInputs'],
    'boundAuthorInputs': [binding(AUTHOR / item['path'].split('/')[-1]) for item in read(freeze)['files']],
    'primaryDocuments': [binding(REPO / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'), binding(REPO / 'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf')],
    'primaryPagesPersonallyReadAsTextAndRaster': ['HE physical/printed page 43', 'NW physical/printed page 35'],
    'activeWrites': False,
})
print(json.dumps({'nativeArchiveEntriesVerified': len(archive_bindings), 'cachePDFsAdded': len(additional_cache_bindings), 'sourceIdCollisions': 0, 'checkpointInputsVerified': len(checkpoint['currentInputs']), 'root': ROOT.relative_to(REPO).as_posix()}))
