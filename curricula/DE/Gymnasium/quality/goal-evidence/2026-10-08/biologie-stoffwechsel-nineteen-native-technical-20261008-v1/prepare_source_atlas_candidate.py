"""Prepare inactive source-atlas inputs; no approvals or active changes."""
from hashlib import sha256
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'biologie-stoffwechsel-resume-author-20261008-v1'


def read(path):
    return json.loads(path.read_text())


def write_path(target, value):
    if target.exists():
        raise RuntimeError(f'Preserve existing artifact: {target}')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return str(target.relative_to(ROOT))


def write(name, value):
    return write_path(OUT / name, value)


def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha256(data).hexdigest(), 'bytes': len(data)}


entry = read(AUTHOR / 'neutral-author-continuation.entry.json')
base_path = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
base = read(base_path)
book_path = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
book = read(book_path)
mapping_path = AUTHOR / 'HE-mapping144.source19-operative.author-candidate.review.json'
mapping = read(mapping_path)
source_path = ROOT / mapping['sourceExtractionPath']
source = read(source_path)
assert len(source['sourceGoals']) == 144
assert len(mapping['decisions']) == 144
replaced = []
new_mapping_paths = []
for path in base['mappingPaths']:
    if read(ROOT / path)['sourceLandscapeId'] == mapping['sourceLandscapeId']:
        replaced.append(path)
        new_mapping_paths.append(str(mapping_path.relative_to(ROOT)))
    else:
        new_mapping_paths.append(path)
assert len(replaced) == 1
assert base['expectedCurricularAtomicGoalCount'] == 392
prefix = str(OUT.relative_to(ROOT))
inert = 'app/scripts/config/goal-books/inactive/biologie-stoffwechsel-nineteen-native-20261008-v1'
base.update(mappingPaths=new_mapping_paths,
            outputDirectory=inert + '/source-views',
            manifestPath=inert + '/atlas.sources.json',
            navigationViewPath=inert + '/navigation.view.json')
atlas_path = write_path(ROOT / inert / 'atlas.inputs.json', base)
book.update(compositionViewManifestPath=base['manifestPath'],
            outputPath=prefix + '/source-atlas/full392.source-only.book-model.json')
book_candidate_path = write('source-atlas/book.source-only.inactive-v2.config.json', book)
inputs = [base_path, book_path, mapping_path, source_path,
          ROOT / base['landscapePath'], ROOT / base['semanticKindLedgerPath'],
          ROOT / book['goalVisualizationQaPath']]
write('source-atlas-book-local-input-v2.freeze.json', {
    'schemaVersion': 1, 'role': 'Technical candidate author, no scientific review',
    'files': [binding(p) for p in inputs],
    'selectedGoalIds': entry['goalIds'], 'expectedCurrentAtomicCount': 392,
    'onlyReplacedMappingPath': replaced,
    'atlasInputConfigPath': atlas_path, 'inactiveSourceOnlyBookConfigPath': book_candidate_path,
    'actualNewImageCandidates': 'PENDING',
    'nativeDPVReviews': 'PENDING', 'activeWrites': 0, 'strictGain': 0,
    'supersedesUnacceptedTechnicalConfig': prefix + '/source-atlas/atlas.inputs.json',
    'correctionReason': 'The ordinary atlas builder correctly requires book-local outputs under app/scripts/config/goal-books. No validator change or path exception.',
    'humanApproval': False, 'humanTrial': False,
})
print('Prepared inactive source-atlas input for19 targets; whole392 remains the exact base.')
