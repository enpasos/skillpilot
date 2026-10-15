# SPDX-License-Identifier: Apache-2.0
"""Close the already prepared native16 v1; never execute a native command."""
import ast
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
NOW = datetime.now(timezone.utc).isoformat()
SEAL = OWN / 'FILES.finite-native16-technical.seal.json'
assert not SEAL.exists(), 'Finite packet already sealed; do not mutate it.'


def read(path):
    return json.loads(Path(path).read_text())


def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def binding(path):
    p = Path(path)
    b = p.read_bytes()
    return {'path': str(p.relative_to(REPO)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(row):
    assert binding(REPO / row['path']) == row, row['path']


technical = read(OWN / 'INPUTS.technical-native16-preparation.original-physical-selector.json')
for key in ['authorSelector', 'authorSeal', 'current338Map', 'canonical', 'semantic', 'normalV1', 'rawAuthorProfiles']:
    verify(technical[key])
for row in technical['sourcePrimaryDocuments']:
    verify(row)
ids = technical['goalIds']
canonical = read(REPO / technical['canonical']['path'])
goals = {g['id']: g for g in canonical['goals']}
assert len(goals) == 560 and len(ids) == len(set(ids)) == 16
profiles = [json.loads(line) for line in (OWN / 'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl').read_text().splitlines()]
assert [p['goalId'] for p in profiles] == ids
assert all(p['status'] == 'needs_human_review' and p['reviewAuthority'] == 'ai_candidate' and p['evidenceLevel'] == 'E0' and p['maximumClaimScope'] == 'G0' and p['reviewRunIds'] == [] for p in profiles)
model = read(OWN / 'native-sixteen/bundle/book-model.json')
assert [p['goalId'] for p in model['pages']] == ids
for page, profile in zip(model['pages'], profiles):
    assert page['description'] == goals[page['goalId']]['description']
    for key in ['reviewId', 'status', 'reviewInputFingerprint', 'profileFingerprint', 'evidenceLevel', 'maximumClaimScope']:
        assert page['evidenceReview'][key] == profile[key]
    assert not any(key in json.dumps(page) for key in ['aiNotes', 'aiReviewer', 'chatGptNotes', 'chatGptReviewer'])
assert model['pages'][9]['visualization'] is None
assert model['pages'][11]['visualization']['originalDigest'] == 'sha256:4a5fc496436ab607c9d35a8e15a2c43e0496073e26e0ff7962f6632c0b8a8629'
assert sum(p['visualization'] is not None for p in model['pages']) == 15
for label in ['a', 'b']:
    inp = read(OWN / f'native-sixteen/round-{label}/description-review-input.json')
    assert [g['goalId'] for g in inp['goals']] == ids
    for g in inp['goals']:
        assert g['currentDescriptionDe'] == goals[g['goalId']]['description']
        assert g['currentDescriptionEn'] == goals[g['goalId']]['descriptionEn']
    campaign = read(OWN / f'native-sixteen/round-{label}/description-review-campaign.json')
    assert campaign['blindToOtherReviews'] and campaign['reviewPass'] == 'first_pass' and campaign['goalCount'] == 16
    assert not any('record' in p.name and p.suffix == '.jsonl' for p in (OWN / f'native-sixteen/round-{label}').rglob('*'))
commands = read(OWN / 'checks/COMMANDS.normal-native16-prepare-check.json')
assert len(commands['commands']) == 2
assert [r['name'] for r in commands['commands']] == ['native16-stock-prepare', 'native16-stock-check']
assert all(r['exitCode'] == 0 and '--write' not in r['argv'] for r in commands['commands'])
assert len(commands['physicalModulePreflights']) == 2
for row in commands['commands']:
    assert binding(REPO / row['output'])['sha256'] == row['outputSHA256']
qa_cas = read(OWN / 'checks/CAS.QA438-one-genuine-V1-row-exact.json')
before = read(REPO / qa_cas['originalQA']['path'])
after = read(OWN / 'candidate/QA438.original437-plus-exact-independent-138-V1.json')
g138 = ids[11]
assert len(before['records']) == len(after['records']) == 438
assert [r for r in before['records'] if r['goalId'] != g138] == [r for r in after['records'] if r['goalId'] != g138]
assert [r for r in after['records'] if r['goalId'] == g138] == read(REPO / technical['normalV1']['path'])['records']
audit = read(OWN / 'checks/BLIND.actual-input-separation-and-current-partner-transport.json')
for row in audit['exactWholeCopies']:
    verify(row['source']); verify(row['blindCopy'])
    assert row['source']['sha256'] == row['blindCopy']['sha256']
assert audit['authorFirstOrAssessmentDossiersCopied'] == 0
assert audit['reviewerVJudgmentsCopiedIntoBlindInputs'] == 0
assert audit['historicalReviewFilesCopiedIntoBlindInputs'] == 0
assert len(read(OWN / 'blind-inputs/thirty-two-whole-DE-EN-cases.raw-author.json')['cases']) == 32
host = read(OWN / 'checks/HOST.actual-sparse-sixteen.json')
assert host['physicalRegularBytes'] == 38905512 < host['maxBytes']
assert host['physicalStockModules'] == 31 and host['physicalDataAliases'] == 51 and host['physicalSelectedPublicImages'] == 15

# All five contact sheets were actually opened and inspected in this agent turn.
# They are render diagnostics, not a scientific or visual-approval vote.
view_source = REPO / 'tmp/chemie-m7-resumed-20261015/equilibrium16-native16-actual-page-views-v1'
view_dest = OWN / 'checks/pdf-page-views'
view_dest.mkdir(exist_ok=True)
for p in sorted(view_source.glob('pages-*.jpg')):
    shutil.copy2(p, view_dest / p.name)
assert len(list(view_dest.glob('*.jpg'))) == 5
import fitz
pdf = OWN / 'native-sixteen/bundle/book.pdf'
doc = fitz.open(pdf)
assert len(doc) == 18
write('checks/PDF.actual-eighteen-page-render-inspection.json', {
    'role': 'Actual PDF layout inspection only; no D/P/A/V judgment',
    'receiptWrittenAtUTC': NOW,
    'inspectionSequence': 'All five contact sheets were opened with view_image after successful stock prepare/check and before this receipt.',
    'pdf': binding(pdf), 'actualPDFPageCount': len(doc),
    'pages': [{'pdfPage': i + 1, 'goalId': None if i < 2 else ids[i - 2], 'widthPoints': round(p.rect.width), 'heightPoints': round(p.rect.height), 'actualTextCharacters': len(p.get_text()), 'layoutInspection': 'no unexpected blank page, clipping, overflow or broken image observed'} for i, p in enumerate(doc)],
    'contactSheetsActuallyViewed': [binding(p) for p in sorted(view_dest.glob('*.jpg'))],
    'expectedPourbaixMissingImage': {'goalId': ids[9], 'pdfPage': 12, 'modelVisualization': None, 'actualPlaceholder': 'Für dieses Lernziel liegt keine Visualisierung vor.'},
    'mechanism138UsesActualFinalV2PNG': True, 'newScientificOrVisualVotes': 0,
    'limits': 'Technical rendering only. This is not the future independent scientific first pass or a new image approval.'
})

blind_paths = sorted(p for p in (OWN / 'blind-inputs').rglob('*') if p.is_file())
native_paths = sorted(p for p in (OWN / 'native-sixteen').rglob('*') if p.is_file())
blind_name = 'INPUTS.blind-native16-whole-scientific-materials.selector.json'
write(blind_name, {
    'schemaVersion': 1, 'role': 'Exclusive blind scientific reading list for future fresh independent D16 reviewers', 'createdAtUTC': NOW,
    'goalIds': ids, 'nativePDFPages': 18, 'wholeBilingualCases': 32, 'rawAuthorProfiles': 16,
    'nativeBundleAndBlankRounds': [binding(p) for p in native_paths],
    'wholeRawScientificCompanions': [binding(p) for p in blind_paths],
    'currentCanonicalWholeGoals': technical['canonical'], 'actualPrimaryDocuments': technical['sourcePrimaryDocuments'],
    'readInstructions': [
        'Read all actual 18 PDF pages and full supplied DE/EN cases, raw E0/G0 profiles, current whole goals, prerequisites, parents, source cells, full partner unions and full passages. Inspect relevant actual primary passages rather than treating a route or empty rawText field as full evidence.',
        'Both rawText and text fields are evidence-bearing source fields. The supplied 87 passages include 50 text-only passages.',
        'The E0/G0 author profiles are unreviewed ai_candidate/needs_human_review designs, not independent judgments, learner trials or laboratory trials.',
        'Use only this explicit reading list. Do not follow enclosing author-directory pointers into author FIRST, author assessment dossiers, technical selectors, QA reviewer notes, V judgments or old independent review outputs.',
        'The normal model carries structural visualization/evidence status. That status does not decide a future D/P/A judgment. Pourbaix actually has no image in this frozen v1; fourteen JPGs and the final138 PNG are present.',
        'Round A and Round B contain only blank campaigns and input batches. Genuine future independent FIRST judgments and actual run manifests must be created by their separately assigned reviewers after their actual reading.',
        'No source/course/atomicity hold, human approval or whole-course completion is waived by this technical package.'
    ],
    'forbiddenScientificReadingRoots': ['author FIRST and author assessment dossiers', 'technical QA CAS and independent V reviewer records', 'old or peer D/P/A/M/V review outputs'],
    'newScientificVotesByPreparer': 0
})

write('checks/FINITE.actual-native16-technical-closure.json', {
    'checkedAtUTC': NOW, 'role': 'Bounded closure of already completed technical preparation',
    'canonical560BytesExact': technical['canonical'], 'semantic560BytesExact': technical['semantic'],
    'selectedGoals': 16, 'wholeDEENCases': 32, 'rawProfilesE0G0': 16, 'profileAuthority': 'ai_candidate', 'profileStatus': 'needs_human_review',
    'nativeModelPages': 16, 'actualPDFPages': 18, 'blankIndependentRounds': 2,
    'nativePrepareSuccessfulExecutions': 1, 'nativeCheckSuccessfulExecutionsWithoutWrite': 1, 'nativeFailedAttempts': 0,
    'normalQA438Other437WholeRowsExact': True, 'normal138VRowVerbatimOriginal': True, 'newVVotes': 0,
    'selectedImages': 15, 'unchangedSelectedJPGs': 14, 'selectedMechanismPNG': 1, 'missingPourbaixImage': True,
    'sparseHost': host, 'sourcePrimaryPhysicalBindingsVerified': 24,
    'all16ModelEvidenceFingerprintsMatchRawE0G0Profiles': True, 'all16RoundDEENDescriptionsMatchCurrentCanonical': True,
    'authorFIRSTAssessmentOrVJudgmentsCopiedToBlindCompanions': 0,
    'centralRuns': 0, 'fullBuilds': 0, 'activeWrites': 0, 'newScientificVotes': 0,
    'unselectedFuturePourbaixCandidate': 'Not part of this v1. No replacement host, source alias or output is selected.',
    'state': 'finite; parent inspection required; STOP'
})

readme = '''# Native16 v1 – rein technische Reviewvorbereitung

Gefrorener Kontext: Canonical `e189e058…`, Semantic `597c71f9…`; genau16 Ziele. Das native Buch enthält18 tatsächlich angesehene PDF-Seiten (2 Vorspannseiten und16 Zielseiten),15 Bilder (14 unveränderte JPGs, final138-PNG) und die tatsächliche Pourbaix-Bildlücke. Ein späterer Pourbaix-Kandidat ist nicht selektiert.

Der unveränderte Stock-Materializer wurde genau einmal mit `prepare` und einmal mit `check`, jeweils ohne `--write`, erfolgreich ausgeführt. Laufzeiten:12,616s und0,851s. Beide leeren unabhängigen Reviewrunden sind vorbereitet; es gibt hier keine wissenschaftlichen Reviewrecords oder FIRST-Urteile.

## Wissenschaftliche Leseliste

Frische Reviewer erhalten ausschließlich `INPUTS.blind-native16-whole-scientific-materials.selector.json`. Sie bindet das tatsächliche native Buch, die ganzen32 DE/EN-Fälle,16 unbegutachtete E0/G0-Profile, vollständige aktuelle Prärequisiten/Eltern, rohe Quellzellen, Partnerunionen,87 vollständige Passagen und24 physische Primärquellen. Autor-FIRST, Autorenbewertungsdossiers, V-Urteile und alte Reviewdateien sind nicht in die Blindmaterialien kopiert. Autorprofile sind Kandidaten und keine wissenschaftliche oder menschliche Freigabe.

## Technische Provenienz und Wiederherstellung

`INPUTS.final-native16-current422.physical-selector.json` und der endliche Seal binden technische Herkunft, Original-CAS, Normalbefehle, Rendernachweis und Map. Nur drei normale Datenaliase wechseln gegenüber current338: Canonical, Semantic und QA. In QA438 ist genau der genuine unabhängige138-V1-Record unverändert eingesetzt;437 andere ganze Zeilen bleiben exakt. Die globale Assetmap ändert nur138;433 andere Quellen/Zielpfade bleiben exakt.

Der vorhandene Host enthält31 physische unveränderte Stockmodule,51 physische Datenaliase und15 physische Publicbilder:97 Dateien/38.905.512 Bytes (<80MiB). Andere Bildreferenzen sind lesende exakte Quellenaliase. Keine Vollrepo- oder Bilderbaumkopie.

Eine spätere rein technische Wiederherstellung in einem neuen, noch nicht vorhandenen tmp-Host erfolgt ab Repositorywurzel mit:

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium16-current422-native-preparation-technical-20261015-v1/scripts/rebuild_native16_sparse_host.py checks/REBUILD.native16.current338-exact-physical-map.json tmp/chemie-m7-resumed-20261015/equilibrium16-native560-replay-host-v1
```

Das Replaywerkzeug prüft Map-Quellbytes und baut ausschließlich den kleinen Host. Es wurde in diesem Lauf nicht zusätzlich ausgeführt und startet keinen neuen Native- oder Zentralbericht. Historische Current338-Provenienzfelder der Map bleiben reine Basisherkunft; sie autorisieren hier keinen Central.

Keine D/P/A/M/V-Neustimme, Quellen-/Kursfreigabe, Human-Freigabe oder M7-Aussage. Keine Integration, Registry-/Ledger-/Git-/Runtime-/Activewrites. Nach endlichem Seal: STOP; Root prüft und koordiniert neue Reviewer.
'''
(OWN / 'README.md').write_text(readme)

# Parse only the finite packet's own formats; no optional wider test or normal rerun.
parsed = {'json': 0, 'jsonl': 0, 'python': 0}
for p in OWN.rglob('*'):
    assert not p.is_symlink(), p
    if not p.is_file():
        continue
    if p.suffix == '.json': json.loads(p.read_text()); parsed['json'] += 1
    if p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line)
        parsed['jsonl'] += 1
    if p.suffix == '.py': ast.parse(p.read_text()); parsed['python'] += 1
write('checks/FINITE.own-format-parse.json', {'checkedAtUTC': NOW, 'ownPacketOnly': True, 'parsedBeforeFinalSelectorAndSeal': parsed, 'errors': 0})
selector_name = 'INPUTS.final-native16-current422.physical-selector.json'
technical_members = sorted(p for p in OWN.rglob('*') if p.is_file() and p.name not in [selector_name, SEAL.name])
write(selector_name, {
    'schemaVersion': 1, 'role': 'Finite native16 v1 technical handoff; not a scientific reading list or vote', 'createdAtUTC': NOW,
    'goalIds': ids, 'blindScientificSelector': binding(OWN / blind_name),
    'physicalSourceProvenance': technical,
    'physicalFiniteFiles': [binding(p) for p in technical_members],
    'actualNative': {'goalPages': 16, 'PDFPages': 18, 'wholeDEENCases': 32, 'rawAuthorE0G0Profiles': 16, 'images': 15, 'missingImageGoalId': ids[9], 'prepareExitCode': 0, 'checkExitCode': 0, 'successfulExecutionsEach': 1, 'writeFlagUsed': False, 'allPDFPagesActuallyViewed': True},
    'newScientificVotes': 0, 'centralRuns': 0, 'fullBuilds': 0, 'activeWrites': 0,
    'replayMap': binding(OWN / 'checks/REBUILD.native16.current338-exact-physical-map.json'),
    'state': 'finite technical v1; parent inspection required; STOP'
})
members = sorted(p for p in OWN.rglob('*') if p.is_file() and p != SEAL)
write(SEAL.name, {
    'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'Finite Native16 v1 technical seal; no new scientific judgments',
    'fileCount': len(members), 'totalBytes': sum(p.stat().st_size for p in members),
    'finalSelector': binding(OWN / selector_name), 'blindScientificSelector': binding(OWN / blind_name),
    'files': [binding(p) for p in members], 'symlinksInSealedRoot': 0,
    'nativeSuccessfulPrepareCount': 1, 'nativeSuccessfulCheckCount': 1, 'newScientificVotes': 0,
    'state': 'finite; STOP'
})
seal = read(SEAL)
for row in seal['files']:
    verify(row)
print(json.dumps({'selector': binding(OWN / selector_name), 'blindSelector': binding(OWN / blind_name), 'seal': binding(SEAL), 'PDF': binding(pdf), 'fileCountExcludingSeal': seal['fileCount'], 'totalBytesExcludingSeal': seal['totalBytes'], 'state': 'STOP'}, indent=2))
