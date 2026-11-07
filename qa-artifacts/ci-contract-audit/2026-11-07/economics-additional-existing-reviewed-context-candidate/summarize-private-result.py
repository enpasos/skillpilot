#!/usr/bin/env python3
"""Reviewable bounded result; never updates active acceptance or maturity."""
import collections, hashlib, json
from pathlib import Path
OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads((OUT / p).read_bytes())
index = read('candidate-index.json')
existing, proposed = read('unchanged-profile-results.json'), read('private-results.json')
negative, original_negative = read('negative-results.json'), read('original-input-negative-results.json')
protected, raw = read('protected-inputs-after.json'), read('raw-git-proof.json')
assert existing['attempts'] == 85 and existing['newPasses'] == 0
assert proposed['privateProposalPasses'] == 17 and proposed['activeQualification'] is False
assert len(proposed['authenticatedOriginals']) == 126 and protected['allMatched'] is True
assert negative['cases'] == 19 and all(r['actual'] == r['expected'] for r in negative['results'])
assert original_negative['cases'] == 11 and all(r['actual'] == r['expected'] for r in original_negative['results'])
assert all(sha(ROOT / ref['path']) == ref['sha256'] for ref in index['activeInputPins'])
discovery_names = ['visualization-context-nine-economics-context-families',
    'visualization-context-six-embedded-economics-families', 'visualization-context-economics-q4-corrections']
discovery_rows = []
for name in discovery_names:
    discovery_rows.extend(json.loads((ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06' / name / 'family-census.json').read_bytes())['rows'])
qualified = json.loads((ROOT / 'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json').read_bytes())
qualified_ids = {row['goalId'] for row in qualified['rows']}
assert not qualified_ids.intersection(row['goalId'] for row in index['rows'])
counts = collections.Counter(row['status'] for row in discovery_rows)
summary = {'kind': 'private-existing-q2-original-context-proposal-result',
    'acceptedRepositoryCommit': index['acceptedRepositoryCommit'], 'originalCommit': '42095f427223545968e452d494e4f982c196c7e2',
    'family': 'wirtschaft-q2-monetary-social-seventeen-image-author-20261008-v1',
    'existingProfileAttempts': 85, 'existingProfileNewPasses': 0, 'privateNewProfileCandidatePasses': 17,
    'activeNewQualifications': 0, 'newAiReviews': 0, 'newHumanApprovals': 0, 'qualified57Duplicates': 0,
    'contextOrFileOrReceiptCases': 19, 'originalFileCases': 11,
    'genuineNegativeCases': sum(r['expected'] != 'ok' for r in negative['results']) + sum(r['expected'] != 'ok' for r in original_negative['results']),
    'positiveControls': sum(r['expected'] == 'ok' for r in negative['results']) + sum(r['expected'] == 'ok' for r in original_negative['results']),
    'originalReferences': 126, 'rawGitObjects': len(raw['objects']), 'authenticatedParentRouteNodes': len(raw['parentRoute']),
    'protectedActiveInputFilesUnchanged': len(index['activeInputPins']),
    'newGoalIds': [row['goalId'] for row in index['rows']], 'deOnlyCorrectionGoalId': '676684da-5ba2-5c2a-ba7e-a8413915c29c',
    'priorityDiscoveryCounts': dict(counts), 'priorityDiscoveryAlreadyQualified57': len({r['goalId'] for r in discovery_rows} & qualified_ids),
    'remainingGlobalOpen': 'Unchanged at root baseline2426/2483; private proposals do not alter active authority or M7.',
    'independentReviewRequiredBeforeActiveIntegration': True, 'runtimeActivationAllowed': False,
    'relevantFileHashes': [{'path': str(path.relative_to(ROOT)), 'sha256': sha(path)} for path in sorted(OUT.iterdir())
        if path.is_file() and path.name not in {'result-summary.json', 'README.md'}]}
(OUT / 'result-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
source_ref = next(ref for ref in index['activeInputPins'] if ref['path'].endswith('DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
lines = [
    '# Privater Economics-Q2-Reader für vorhandene Originalreviews', '',
    '**0 zusätzliche Pässe unter den fünf unveränderten aktiven Profilen. 17 Pässe ausschließlich im privaten neuen Profilvorschlag; 0 aktive Zusatzqualifikationen.**', '',
    'Geprüft wird die vollständige vorhandene Familie `wirtschaft-q2-monetary-social-seventeen-image-author-20261008-v1`: 16 ursprüngliche KEEP-Reviews und eine tatsächlich korrigierte KEEP-Nachsicht. Es wurde kein Bild neu fachlich bewertet und keine menschliche Freigabe vorgenommen. Quelle, QA, Authority, Floor, Gitindex und aktive Reviewprofile wurden nicht geändert.', '',
    'Die 17 Ziele sind zusätzlich zur aktuell extern gepinnten 57er-Menge und überschneiden sich mit ihr nicht. Die globale M7-Restlücke bleibt deshalb unverändert; diese private Untersuchung ist keine M7-Abnahme.', '',
    'Originalbelege und Kontextgrenzen:', '',
    '- Originalcommit: `42095f427223545968e452d494e4f982c196c7e2`; akzeptierter externer Nachfahrenanker: `25a6f2164a81a7e6ae50db3557d20521fecf5124`.',
    '- Der unveränderte Kernel `scripts/visualization_review_git_capsule.py` authentifiziert 126 Originalpfade über rohe Gitframing/OIDs und Treepfade. Eine tatsächliche rohe Elternroute umfasst 273 Knoten; insgesamt wurden 465 Commit-/Tree-/Blobobjekte authentifiziert. Der aktuelle TS-Kern authentifiziert dieselben vollständigen Originale nochmals während der privaten Verifierläufe.',
    '- 16 Originalreviews binden zusätzlich den vollständigen bilingualen Author-Input per SHA256. DE/EN-Titel und Beschreibungen sowie der ursprünglich mitgelieferte `demandLevel` sind daraus exakt gebunden. Der ursprüngliche Native-Prep-Receipt, seine Metadaten und sein Prompt sowie Generation und tatsächliche 360-/680-Pixel-Sichten sind ebenfalls gebunden.',
    '- Die korrigierte `676684da-5ba2-5c2a-ba7e-a8413915c29c` attestiert ausdrücklich nur DE-Titel und DE-Beschreibung. Ihr tatsächliches vorgängiges REJECT samt Originalbild, die gezielte Korrektur, der neue Native-Prep-Input, Prompt, Generation und beide tatsächlichen Sichtderivate bleiben gebunden. EN und Anforderungsbereich werden für diese Nachsicht nicht aus dem zuvor abgelehnten Review erfunden.',
    '- Heutige eindeutige primäre `resourceLinks`, physische Public-/Canonical-Assetpaare und AI-Reviewbindings in beiden Economics-Ledgern wurden geprüft. Die DE-Quelle hat SHA256 `' + source_ref['sha256'] + '`.', '',
    'Ergebnisse und Gegenbelege:', '',
    '- `unchanged-profile-results.json`: 85 tatsächliche Versuche über alle 17 Fälle und alle 5 unveränderten Profile; 0 Pässe.',
    '- `private-results.json`: 17 private Readerpässe; tatsächliche Originalread-Closure exakt gleich den externen 126 privaten Originalpins.',
    '- `negative-results.json`: 19 Kontext-/Receipt-/Assetfälle, darunter DE-/EN-/Demand-Drift, ausgelassene oder erfundene Kontextfelder, falsche Receipt-/Originalhashes, Commitwechsel, geänderte tatsächliche Public-/Canonical-Dateien, falsche Assetrolle, doppelte JSON-Schlüssel und vorgängiges REJECT-Bild als vermeintliches KEEP.',
    '- `original-input-negative-results.json`: 11 RAM-Fälle mit tatsächlichen Änderungen an Originalreview, bilingualem Input, Native-Metadaten, Prompt, Sichtderivat und erhaltenem REJECT. Der reale Gitobjektspeicher blieb nur lesbar. Insgesamt 26 echte Negativfälle und 4 positive Kontrollen.',
    '- `protected-inputs-after.json`: dieselben 44 erwarteten aktiven Datei-Pins vor und nach dem Lauf. Der Treiber liest die heutige DE-Quelle selbst erneut; er ersetzt keine erwarteten Pins durch aktuelle Hashes.', '',
    'Codevorschlag und verbleibende Lücken:', '',
    '`economicsQ2MonetarySocialContext.private.ts` schlägt ausschließlich das neue geschlossene Profil `economics-q2-monetary-social-embedded-v1` vor. Commit, Familie, 17 IDs, Pfade und sämtliche Originalhashes sind fest begrenzt. Die vorhandenen fünf Profilzweige und der Git-Kern werden nicht gelockert. `private-core-proposal.diff` zeigt die explizite zusätzliche Profilgrenze sowie rein private Import-/Schemaumleitungen. Die private Q3-Kopie unterscheidet sich nur im type-only-Import; aktive Dateien bleiben unverändert.', '',
    'Vor aktiver Verwendung fehlen die angeforderte unabhängige Astra-Begutachtung dieses konkreten Profilvorschlags und die separat überprüfte Integration in den extern gepinnten Originalindex samt Capsule/Authority. Auch danach muss der normale vollständige CQR die übrigen D/P/A/M/V-Gates belegen. Bestehende Discovery-Hash-/Texttreffer werden nicht als zusätzliche Freigaben gezählt.', '',
    'Die drei priorisierten älteren Discovery-Census umfassen 200 Fälle: 187 contextgleiche Bestandsfunde, 13 echte Kontextabweichungen. 36 ihrer Ziele gehören bereits zu Econ52 und zählen hier nicht erneut. Die übrigen Formate und ihre offenen Kontexte sind nicht durch diesen 17er-Vorschlag abgedeckt; eine neue fachliche Reviewleistung wird dort nötig, wo tatsächlich heutiger Text oder Bildinhalt nicht mehr dem ursprünglichen Review entspricht.', '',
    'Reproduktion (alle großen temporären Daten ausschließlich in RAM):', '',
    '```bash',
    'python3 -B ' + str((OUT / 'prepare-private-family.py').relative_to(ROOT)),
    'python3 -B ' + str((OUT / 'build-private-probe.py').relative_to(ROOT)),
    'TMPDIR=/dev/shm app/node_modules/.bin/tsx ' + str((OUT / 'run-private-probe.ts').relative_to(ROOT)),
    'TMPDIR=/dev/shm app/node_modules/.bin/tsx ' + str((OUT / 'run-original-input-negatives.ts').relative_to(ROOT)),
    'python3 -B ' + str((OUT / 'summarize-private-result.py').relative_to(ROOT)),
    '```', '',
    'Genau neue Goal-IDs und Original-/Input-/Assethashes (Input ist bei diesem eingebetteten Format jeweils exakt dasselbe Originalreview):', '',
    '| Goal-ID | Originalreview und Input SHA256 | Asset SHA256 |', '|---|---|---|']
for row in index['rows']:
    lines.append('| `' + row['goalId'] + '` | `' + row['originalReview']['sha256'] + '` | `' + row['reviewedAsset']['sha256'] + '` |')
lines.extend(['', 'Die vollständigen Originalpfade, ursprünglichen Zeitstempel/Reviewer, gesamten Inputhashes und heutigen Assetrollen stehen maschinenlesbar in `candidate-index.json` und `private-family-pins.json`.'])
(OUT / 'README.md').write_text('\n'.join(lines) + '\n')
size = sum(path.stat().st_size for path in OUT.rglob('*') if path.is_file())
assert size < 2_000_000, size
print(json.dumps({'privateCandidates': 17, 'newActivePasses': 0, 'negativeCases': summary['genuineNegativeCases'],
    'positiveControls': summary['positiveControls'], 'totalOutputBytes': size, 'summarySha256': sha(OUT / 'result-summary.json')}))
