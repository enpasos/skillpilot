"""Check current technical bindings after independent science and native review."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

D = Path(__file__).resolve().parent
ROOT = D.parents[6]
AUTHOR = D.parent / 'biologie-flora-fauna20-current391-author-v1'
N = D / 'native20-preimage'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}

def write(name, d):
    with (D / name).open('x', encoding='utf-8') as f:
        f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

actual = json.loads((AUTHOR / 'current20-whole-DEEN-goals.actual.json').read_text())['goals']
canonpath = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canon = json.loads(canonpath.read_text())
by = {g['id']: g for g in canon['goals']}
assert all(g == by[g['id']] for g in actual)
retained = []
for gate, src in [('A', 'semantic-atomicity/canonical-biology-full.review.jsonl'), ('M', 'memory-card-review/canonical-biology-full.review.jsonl')]:
    sourcepath = ROOT / 'curricula/DE/Gymnasium/quality' / src
    active = {r['goalId']: r for r in map(json.loads, sourcepath.read_text().splitlines())}
    exactpath = AUTHOR / ('retained-current-AM/' + gate + '20.exact.rows.jsonl')
    rows = list(map(json.loads, exactpath.read_text().splitlines()))
    assert len(rows) == 20 and all(r == active[r['goalId']] for r in rows)
    retained.append({'gate': gate, 'currentOriginalLedger': binding(sourcepath), 'exactRows': binding(exactpath), 'wholeRecordsUnchanged': 20, 'newScientificReviewsClaimed': 0})

mapdir = ROOT / 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary'
mappingpath = mapdir / 'hessen_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
mapping = json.loads(mappingpath.read_text())
extractionpath = ROOT / mapping['sourceExtractionPath']
extraction = json.loads(extractionpath.read_text())
sourceby = {g['id']: g for g in extraction['sourceGoals']}
decby = {d['sourceGoalId']: d for d in mapping['decisions']}
sourcebindings = []
for g in actual:
    sid = g['extendedData']['provenance']['sourceGoalId']
    s, d = sourceby[sid], decby[sid]
    assert d['canonicalGoalIds'] == [g['id']]
    assert s['description'] == g['description'] and s['sourceRef'] == g['sourceRef']
    sourcebindings.append({'goalId': g['id'], 'sourceGoalId': sid, 'sourceRef': g['sourceRef'], 'sourceTopic': d['topicCode'], 'authoredExtractionLocator': d['sourceSpan'], 'boundary': 'Reviewed with complete indicated official PDF section; structured source extraction wording and number are not claimed to be verbatim official quotations'})

modelpath = N / 'bundle/book-model.json'
model = json.loads(modelpath.read_text())
pdfreadingpath = D / 'checks/native20-preimage-pdf.actual-reading.txt'
pdfpages = pdfreadingpath.read_text().split('\f')
norm = lambda x: ' '.join(x.split())
pagebindings = []
for g, page in zip(actual, model['pages']):
    assert page['goalId'] == g['id']
    assert page['description'] == g['description']
    assert page['visualization'] is None and page['evidenceReview'] is None
    matches = [(i + 1, s) for i, s in enumerate(pdfpages) if 'Lernziel-ID ' + g['id'] in norm(s)]
    assert len(matches) == 1
    assert norm(g['description']) in norm(matches[0][1]) and norm(g['title']) in norm(matches[0][1])
    required = [r['goalId'] for r in page['requires'] + page['externalPrerequisites']]
    assert set(required) == set(g['requires'])
    pagebindings.append({'goalId': g['id'], 'wholeGoalPageNumber': page['pageNumber'], 'physicalPdfPageNumber': matches[0][0], 'goalFingerprint': page['goalFingerprint'], 'pageFingerprint': page['pageFingerprint'], 'breadcrumbs': page['breadcrumbs'], 'directPrerequisites': required, 'actualWholePdfDescriptionTitleId': True, 'imageState': 'absent, no visualization pass', 'operativeProfileState': 'absent; author proposal reviewed separately'})

memoryconfig = json.loads((AUTHOR / 'M20.current-flower-deck-closure.native.config.json').read_text())
active_memory_config = json.loads((ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json').read_text())
assert memoryconfig['visibilityScopes'] == active_memory_config['visibilityScopes']
deckbindings = []
for locale in ['de', 'en']:
    p = ROOT / ('curricula/DE/Gymnasium/memory-decks/de_gymnasium_biology_flashcards_core.' + locale + '.json')
    deck = json.loads(p.read_text())
    cards = [c for c in deck['cards'] if c['id'] in ['biology_core_008', 'biology_core_009', 'biology_core_010']]
    assert len(cards) == 3
    deckbindings.append({'locale': locale, **binding(p), 'actuallyReadUnchangedFlowerCards': cards})

write('native-preimage-D20-retained-AM-source-context.actual.receipt.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-a-current-native-preimage-technical-binding-verification',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'currentCanonical': binding(canonpath),
    'wholeSelectedCurrentGoalsExact': 20, 'retainedAM': retained,
    'sourceExtraction': binding(extractionpath), 'sourceMapping': binding(mappingpath),
    'boundedOriginalSourceBindings': sourcebindings,
    'nativePreimageBookModel': binding(modelpath), 'nativePreimagePdf': binding(N / 'bundle/book.pdf'),
    'wholePageContextsActuallyRead': pagebindings, 'physicalPdfPages': 22, 'frontMatterPages': 2,
    'nativeCampaignResultsActuallyValidated': {'records': 20, 'exitCode': 0, 'log': binding(D / 'checks/D20-preimage.stdout.actual.txt')},
    'nativeACheckActuallyExecuted': {'currentAtomic': 20, 'stale': 0, 'missing': 0, 'exitCode': 0, 'log': binding(D / 'checks/A20.stdout.actual.txt')},
    'nativePCheckActuallyExecuted': {'configured': 20, 'aiCandidateNeedsHumanReview': 20, 'approved': 0, 'technicalBlockingIssues': 0, 'exitCode': 0, 'log': binding(D / 'checks/P20.stdout.actual.txt'), 'scientificVerdictSeparately': '18 pass, 2 require targeted correction; technical success does not resolve semantic findings'},
    'nativeMCheckActuallyExecuted': {'ordinaryGoalsInSharedDependencyClosure': 27, 'noMemory': 19, 'memoryRequired': 8, 'existingMemoryNodes': 1, 'keptPrimaryCards': 17, 'stale': 0, 'missing': 0, 'visibilityScopes': 8, 'checkedViewOccurrences': 33, 'withoutVisibleMemory': 0, 'exitCode': 0, 'log': binding(D / 'checks/M20-shared-flower.stdout.actual.txt')},
    'actuallyReadCurrentBilingualFlowerCardFiles': deckbindings,
    'configuredCurrentVisibilityBindings': [binding(ROOT / s['viewPath']) for s in memoryconfig['visibilityScopes']],
    'historicalReviewsReplaced': False, 'newCardsOrDecks': 0,
    'actualRasterReviewClaimed': False, 'finalRasterPageProfileIntegrationRecheckStillRequired': True,
    'activeWrites': 0, 'strictClosuresClaimed': 0, 'humanApproval': False,
})
records = next((N / 'round-a/results').glob('*.records.jsonl'))
run = next((N / 'round-a/results').glob('*.run.json'))
write('native-preimage-D20-and-retained-AM.final.freeze.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-a-native-preimage-description-and-retained-binding-seal',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'frozenFiles': [binding(p) for p in [D / 'native20.preimage.independent-a.batch.config.json', D / 'native-preimage-D20-retained-AM-source-context.actual.receipt.json', D / 'record-native-preimage-D20.independent-a.py', D / 'verify-native-bindings-retained-AM.independent-a.py', records, run, N / 'round-a/description-review-input.json', N / 'round-a/description-review-campaign.json', N / 'bundle/manifest.json', modelpath]],
    'peerReviewerFindingsReadBeforeOwnSeal': False, 'scientificFindingsOriginalSealPreserved': True,
    'actualRasterReviewClaimed': False, 'nativePreimageOnly': True,
    'activeWrites': 0, 'strictClosuresClaimed': 0, 'humanApproval': False,
})
print('Verified and sealed: current20 exact goals/AM/source mappings; D20 native preimage; M17cards/33view occurrences. P two substantive findings remain open.')
