#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal prepared inputs and neutral tasks, without creating review results."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import os

P = Path(__file__).resolve().parent
R = P.parents[3]
REL = P.relative_to(R).as_posix()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pin(path):
    data = path.read_bytes()
    return {'path': path.relative_to(R).as_posix(), 'sha256': sha(data), 'bytes': len(data)}


def put(path, data):
    with path.open('xb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def js(path, data):
    put(path, (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode())


def main():
    manifest = json.loads((P / 'packet/batch-manifest.json').read_bytes())
    model = json.loads((P / 'packet/bundle/book-model.json').read_bytes())
    bundle = json.loads((P / 'packet/bundle/manifest.json').read_bytes())
    source = json.loads((P / 'inputs/current-source.json').read_bytes())
    current = {g['id']: g for g in source['goals']}
    goal_ids = manifest['goalIds']
    assert len(goal_ids) == len(model['pages']) == 15
    assert manifest['curriculumAtomicDenominatorAtPreparation'] == 807
    assert model['source']['evidenceReviewSources'] == []
    official_path = R / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf'
    assert sha(official_path.read_bytes()) == 'd53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953'
    js(P / 'material-context/current-source-references.json', {
        'schemaVersion': 1, 'currentSource': pin(P / 'inputs/current-source.json'),
        'canonicalSourceReferences': [{'goalId': key, 'sourceRef': current[key].get('sourceRef'),
            'provenance': current[key].get('extendedData', {}).get('provenance')} for key in goal_ids],
        'declaredReferenceDocuments': [{**pin(official_path), 'title': 'Kerncurriculum gymnasiale Oberstufe – Mathematik (2024)',
            'use': 'The existing local official document named by the explicit HMKB sourceRef clauses; read the cited full sections where relevant.'}],
        'scopeLimit': 'These are literal current source references and one measured existing document, not an assertion of complete state-specific mapping, applicability, or source coverage. Null sourceRef remains null.',
        'descriptionOrPositiveReviewResultsIncluded': False})
    rounds = []
    for suffix in ('a', 'b'):
        round_rel = REL + '/packet/round-' + suffix
        directory = R / round_rel
        campaign = json.loads((directory / 'description-review-campaign.json').read_bytes())
        input_data = json.loads((directory / 'description-review-input.json').read_bytes())
        batch = campaign['batches'][0]
        assert len(campaign['batches']) == 1 and campaign['goalCount'] == 15
        assert campaign['reviewPass'] == 'first_pass' and campaign['reviewerRole'] == 'internal_ai_reviewer'
        assert campaign['blindToOtherReviews'] is True
        assert input_data['schemaVersion'] == 3
        assert [g['goalId'] for g in input_data['goals']] == goal_ids
        for goal in input_data['goals']:
            assert goal['canonicalContext']['requires'] == current[goal['goalId']]['requires']
            assert goal['reviewContext']['evidenceProfile'] is None
            assert goal['reviewContext']['page']['evidenceReview'] is None
        assert not list((directory / 'results').iterdir())
        batch_path = directory / ('batches/' + batch['batchId'] + '.input.jsonl')
        assert 'sha256:' + sha(batch_path.read_bytes()) == batch['batchInputFingerprint']
        validator = [str(R / 'app/node_modules/.bin/tsx'), 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
            '--bundle', round_rel + '/review-bundle-manifest.json', '--input', round_rel + '/description-review-input.json',
            '--campaign', round_rel + '/description-review-campaign.json', '--batches-dir', round_rel + '/batches',
            '--results-dir', round_rel + '/results']
        # Actual native rejection of missing real reviews; no placeholder or fabricated run is written.
        start = datetime.now(timezone.utc).isoformat()
        result = subprocess.run(validator, cwd=R, capture_output=True)
        put(P / ('empty-results-' + suffix + '.stdout'), result.stdout)
        put(P / ('empty-results-' + suffix + '.stderr'), result.stderr)
        assert result.returncode == 1
        log = result.stdout.decode() + result.stderr.decode()
        assert batch['batchId'] in log and ('Missing result artifact' in log or 'Missing result pair' in log)
        run_binding = {key: campaign[key] for key in ('campaignId', 'roundId', 'bundleFingerprint', 'bookDigest',
            'promptFingerprint', 'criteriaFingerprint', 'independenceGroupId')}
        run_binding.update({'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
            'goalIds': batch['goalIds'], 'blindToOtherRuns': True,
            'inputArtifacts': [{'role': artifact['role'], 'digest': artifact['digest']} for artifact in bundle['artifacts']]
                + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}]})
        js(P / ('round-' + suffix + '-immutable-run-bindings.json'), run_binding)
        allowed = [directory / name for name in ('review-bundle-manifest.json', 'description-review-input.json',
            'description-review-campaign.json', 'prompt.md', 'criteria.md', 'contracts/goal-description-review-record.schema.json')]
        allowed += [batch_path, P / ('round-' + suffix + '-immutable-run-bindings.json')]
        allowed += [p for p in (P / 'packet/bundle').rglob('*') if p.is_file()]
        allowed += [P / 'material-context/current-goal-and-parent-context.json', P / 'material-context/current-source-references.json',
                    P / 'inputs/current-source.json', official_path]
        js(P / ('cold-review-' + suffix + '-inputs.json'), {'schemaVersion': 1,
            'scope': 'Only fresh current content inputs and immutable native bindings for this first-pass round. No D/P review results or canonical diff.',
            'files': [pin(path) for path in sorted(set(allowed))]})
        task = f'''# Kalter unabhängiger D-Erstpass – Runde {suffix.upper()}

Starte einen neuen Reviewer mit `fork_turns="none"`. Gib ihm ausschließlich diesen Auftrag. Keine frühere Unterhaltung, Peerurteile, frühere D-/P-Reviews, Synthesen, Diffs oder Anwendungspläne übernehmen. Dieser Auftrag enthält keine erwartete Entscheidung. Arbeitsmodus: `report_only`; die native Kampagne ist `internal_ai_reviewer` / `first_pass`.

Lies ausschließlich die Dateien aus `{REL}/cold-review-{suffix}-inputs.json` und prüfe deren genaue Pfade, Bytes und SHA256. Erlaubt sind die eigene native Kampagne, der V3-Input, die eine Batch-JSONL, gebundener Prompt/Kriterien/Recordschema, das native aktuelle 15-Ziele-Bundle einschließlich PDF/HTML/BookModel und die zwei aktuellen Materialkontexte. Die dort benannte bestehende amtliche PDF darfst du für ihre konkret zitierten Abschnitte lesen. `{REL}/inputs/current-source.json` ist die exakte aktuelle kanonische Quelle. Andere Repositoryverzeichnisse, Kontrollberichte und die andere Reviewrunde sind keine Eingaben. Für die abschließende technische Validierung darfst du ausschließlich den unten benannten unveränderten Validator ausführen.

Deine genaue Kampagne ist `{campaign['campaignId']}`, deine Runde `{campaign['roundId']}`, deine Unabhängigkeitsgruppe `{campaign['independenceGroupId']}`. Der native Batch `{batch['batchId']}` enthält genau 15 Ziele. Die eigene Batchdatei ist `{round_rel}/batches/{batch['batchId']}.input.jsonl`.

Lies alle 15 vollständigen deutschen und englischen Ziele, den aktuellen kanonischen Eltern-/Voraussetzungs-/Nachfolgerkontext und die jeweils dargestellten Abbildungen. Das PDF hat 15 Zielseiten und 2 zusätzliche Frontmatter-Seiten. Prüfe jeden Punkt der gebundenen Mathematikkriterien eigenständig. Der kanonische Kontext und die Platzierungen grenzen den Anspruch ein; sie sind keine pauschale Quellmapping- oder Projektionsbestätigung. Fehlende Quellbindung bleibt eine konkrete Grenze. Die Materialkontexte enthalten nur aktuelle Fakten, keine Reviewurteile oder Vergleiche mit einer früheren Quelle.

Wende `{round_rel}/prompt.md`, `criteria.md` und `contracts/goal-description-review-record.schema.json` unverändert an. `keep`, `revise`, `split_review` und `block` bleiben echte Optionen. Formuliere pro Ziel selbst alle sechs spezifischen DE/EN-Felder `essentialUnderstandingDe/En`, `observablePerformanceDe/En`, `transferExpectationDe/En`; keine generischen Satzschablonen. Eine etwaige Revision muss die genaue Kompetenz, Stufe und Methodenneutralität erhalten. Füge kein zusätzliches Verfahren oder höhere Anforderung hinzu. Keine Entscheidung oder Formulierung aus fremden Reviews übernehmen.

Die Atlasbasis lädt keine D-/P-Reviewtexte: `evidenceReview` und `evidenceProfile` sind in allen 15 nativen Inputs null. Dies ist keine Aussage, dass außerhalb dieses Blindpakets keine Profile existieren. Befolge für diesen tatsächlich gelieferten Kontext die gebundene Promptregel zur Profilempfehlung. `visualization.qaStatus`, `approvedForPublication` und `resourceLinks.reviewStatus` sind Materialprovenienz, keine D-/P-Urteile oder Autorität für deine Einschätzung. Dieser Erstpass erteilt keine neue V-Abnahme.

Lies keine andere Runde oder deren Ergebnisse. Teile vor Abschluss des eigenen Erstpasses keine inhaltlichen Urteile mit anderen Reviewern. Schreibe ausschließlich deinen eigenen tatsächlichen Run und 15 Candidate-Records in genau dieser nativen Batchreihenfolge:

- `{round_rel}/results/{batch['batchId']}.run.json`
- `{round_rel}/results/{batch['batchId']}.records.jsonl`

Die Datei `{REL}/round-{suffix}-immutable-run-bindings.json` enthält nur die exakt vorgegebenen unveränderlichen Run-Bindungen und ist kein Run. Vergib neue eigene `runId`/`recordId`s. Verwende wahrheitsgemäße tatsächliche Provider-/Modell-/Zeit-/Parameterangaben, den eigenen Lauf und die exakten Kampagnen-/Bundle-/Book-/Goal-/Page-Bindungen. Das Runschema liegt im Bundle unter `contracts/goal-evidence-ai-run-manifest.schema.json`; für die fachliche Reviewerrolle im Run kann der schemafähige Wert `subject_reviewer` verwendet werden. Die Kampagnenrolle bleibt unverändert `internal_ai_reviewer`. Den Fingerprint der Generierungsparameter an den tatsächlich bekannten und wahrheitsgemäß dokumentierten Laufparametern bilden; keine unbekannten Samplingwerte erfinden. Wenn eine nötige Angabe nicht belegbar ist, melde die konkrete Grenze. Erfinde keine Reviewerzeit, keinen Providertrace und keine menschliche Freigabe. Die Records bleiben `recordStatus=candidate` und `reviewAuthority=ai_candidate`. Keine zusätzlichen `report_only`-Felder in geschlossene native Schemas einfügen.

Prüfe danach deine tatsächlichen Ergebnisse mit dem bestehenden Validator vom Repositoryroot:

```bash
./app/node_modules/.bin/tsx app/scripts/validateGoalDescriptionReviewCampaignResults.ts --bundle {round_rel}/review-bundle-manifest.json --input {round_rel}/description-review-input.json --campaign {round_rel}/description-review-campaign.json --batches-dir {round_rel}/batches --results-dir {round_rel}/results
```

Antworte dem Koordinator nur mit den eigenen Ergebnis-/Logpfaden, Hashes, tatsächlichem Exitcode und dem Status des eigenen Erstpasses. Keine Eingaben, Quellen, Ledger, Kampagnen, Policy oder aktiven Dateien ändern. Keine Git-/DB-/Deployaktionen, SourceA-Probes oder Produzentenläufe. Ein Kandidatenrecord ist keine Synthese, keine Aktivierung und kein Gesamtpass.
'''
        put(P / ('cold-review-' + suffix + '.md'), task.encode())
        rounds.append({'directory': 'round-' + suffix, 'campaign': pin(directory / 'description-review-campaign.json'),
            'input': pin(directory / 'description-review-input.json'), 'batchInput': pin(batch_path),
            'task': pin(P / ('cold-review-' + suffix + '.md')), 'allowedInputInventory': pin(P / ('cold-review-' + suffix + '-inputs.json')),
            'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'independenceGroupId': campaign['independenceGroupId'],
            'emptyResultsNativeValidation': {'exitCode': result.returncode, 'startedAtActualUTC': start,
                'stdout': pin(P / ('empty-results-' + suffix + '.stdout')), 'stderr': pin(P / ('empty-results-' + suffix + '.stderr'))}})
    for field in ('campaignId', 'roundId', 'independenceGroupId'):
        assert rounds[0][field] != rounds[1][field]
    pdf_manifest = json.loads((P / 'packet/bundle/book.pdf.render-manifest.json').read_bytes())
    assert pdf_manifest['goalPageCount'] == 15 and pdf_manifest['physicalPageCount'] == 17
    # Existing registered D bodies remain byte-identical. The future index is deliberately absent.
    hold = json.loads((R / 'qa-artifacts/ci-contract-audit/2026-11-07/math-g17-fifteen-semantic-kind-independent-review/additional-D-freshness-hold.json').read_bytes())
    js(P / 'future-resolution-supersessions-plan.json', {
        'status': 'NOT_CREATED_AWAITING_TWO_REAL_FIRST_PASSES_AND_SEPARATE_SYNTHESIS',
        'newIndexSchemaVersion': 2, 'newIndexContract': 'goal-description-standalone-batch-resolution-index-v1',
        'newIndexNotCreated': True, 'resolutionSupersessionsNotApplied': True,
        'rows': [{'goalId': row['goalId'], 'previousResolutionIndex': row['registeredIndex'],
                  'previousResolution': row['resolution'], 'futureReplacement': 'The new schemaVersion 2 standalone index only after actual dual reviews and native synthesis.'}
                 for row in hold['rows']],
        'oldRegisteredIndexCount': len({row['registeredIndex']['path'] for row in hold['rows']}),
        'oldRoundInputsAndIndicesModified': False})
    js(P / 'input-preparation-summary.json', {'schemaVersion': 1, 'status': 'PREPARED_INPUTS_ONLY_NO_REVIEW_RESULTS',
        'preparedAtActualUTC': datetime.now(timezone.utc).isoformat(), 'actor': 'Codex /root/math58_active_integration',
        'nativeFullBaseScope': 807, 'nativeSubsetGoalCount': 15, 'pdfGoalPages': 15, 'pdfFrontMatterPages': 2, 'pdfPhysicalPages': 17,
        'fullBaseBookDigest': manifest['source']['baseBookDigest'], 'subsetBookDigest': model['digest'],
        'bundleFingerprint': bundle['bundleFingerprint'], 'reviewInputFingerprint': manifest['artifacts']['reviewInputFingerprint'],
        'source': pin(P / 'inputs/current-source.json'), 'kindLedger': pin(P / 'inputs/current-semantic-kind-ledger.json'),
        'sourceCanonicalPath': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
        'sourceFileSHAIsRawBytesWhileNativeModelSourceDigestUsesItsExistingSemanticNormalForm': True,
        'rounds': rounds, 'reviewMode': 'report_only', 'reviewRecordsAuthored': 0, 'runManifestsAuthored': 0,
        'currentV2ProfilesIntentionallyExcludedByUnchangedAtlasConfigEvidenceReviewPaths': [],
        'sourceAProbes': 0, 'combinedProducerRuns': 0, 'fullCqrProducerRuns': 0, 'selectCalls': 0,
        'producerCodeChanged': False, 'activeSourceCodeOrLedgerChanged': False,
        'existingStandaloneFinalizeSchemaVersion': 2, 'futureResolutionSupersessions': 15,
        'nativeInputRequiresEqualExactSource15ForBothRounds': 30})
    readme = f'''# Privater blinder D-Input für 15 Mathematikziele

Die unveränderten nativen Modi `materializeGoalDescriptionRolloutBatch.ts prepare` und `check` beendeten mit 0. Die volle aktuelle Atlasbasis umfasst 807 curricularAtomic-Ziele; der native Ausschnitt enthält genau 15 Ziele. PDF und HTML sind tatsächlich gerendert. Das PDF hat 15 Zielseiten plus 2 Frontmatter-Seiten (17 physische Seiten).

Exakte private Quelle: `9f3945e209e0cef503428e0a20c3c2302261346e35f533bf1264e525f16cdf96`. Unabhängig geprüfter aktueller Kindledger: `b231f6fce8a1fe9a205ffd09d109d92362f89440bb55dec996b538b347c2cea4`. Alle 30 nativen V3-Kontexte in beiden Runden enthalten die exakten Source15-requires. Der [private Frame](private-frame.json) bindet zusätzlich den unveränderten aktuellen Case-/P-/132-Nachfolger; die Vorbereitung führt dessen kombinierten Produzenten oder V-Materializer nicht aus. Die Atlasbasis verwendet unverändert `evidenceReviewPaths=[]`, deshalb enthalten die nativen Blindinputs weder D-/P-Urteile noch V2-Profilkörper. Die vorhandenen aktuellen P-Records werden dadurch weder zurückgenommen noch neu geprüft.

Vollbasis-BookDigest: `{manifest['source']['baseBookDigest']}`. Subset-BookDigest: `{model['digest']}`. Bundle-Fingerprint: `{bundle['bundleFingerprint']}`. V3-Inputfingerprint: `{manifest['artifacts']['reviewInputFingerprint']}`. [Vorbereitungsbeleg](input-preparation-summary.json), [native CLI-Ausführung](preparation.execution.json) und [Byteguard](postguard.json) dokumentieren die tatsächliche Vorbereitung. Der native Ergebnisvalidator weist beide leeren Ergebnisverzeichnisse mit Exit 1 ab; ein fertiger Input wird somit nicht als fertige Reviewrunde ausgegeben.

Root startet genau zwei neue Reviewer mit `fork_turns="none"`. Dem jeweiligen Reviewer ausschließlich die eigene Taskdatei geben, keine Gesprächszusammenfassung oder diesen Kontrollbeleg:

- Runde A: `{REL}/cold-review-a.md`
- Runde B: `{REL}/cold-review-b.md`

Beide Taskdateien nennen nur aktuelle neutrale Materialien, die eigene getrennte Kampagne/Unabhängigkeitsgruppe, das eigene leere Ergebnisverzeichnis, die sechs zielbezogenen bilingualen Felder, das native Run-/Recordschema und den vollständigen bestehenden Validatorbefehl. Keine Urteile oder echten Run-Metadaten wurden durch den Vorbereiter geschrieben. Beide Reviewer entscheiden `keep`/`revise`/`split_review`/`block` selbst. Die bei Vorbereitung leeren `packet/round-a/results` und `packet/round-b/results` sind allein für ihre späteren tatsächlichen Resultate reserviert. Eingabeinventare und Receipt versiegeln die unveränderlichen Vorbereitungsdateien; spätere Resultate gehören nicht zu diesem Inventar.

Die aktuelle Kontextbeilage enthält 353 vollständige kanonische Goalpayloads aus der Mathematik und dem echten Overview-Elternknoten, 15 Zielauswahlen und deren Eltern-/Voraussetzungsclosure sowie direkte Nachfolger. Programmplatzierungen werden als Fakten mitgeliefert. Die literal übernommenen sourceRef-Angaben und die eine gemessene bestehende HMKB-PDF sind keine neue pauschale Quelle-/Mapping-/Projektionsprüfung; für Nullangaben wird nichts erfunden. Alle Bilder und QA-Statusfelder bleiben Materialprovenienz, keine neue Abnahme.

Die [spätere Supersessionliste](future-resolution-supersessions-plan.json) nennt genau 15 bisherige Resolutionen in 10 registrierten Indizes. Alte Indizes, Runden und Resolutionen bleiben bytegleich. Es existiert hier noch kein neuer Resolutionindex, keine Synthese und kein Registry-D-Anschluss. Erst zwei echte Blindrunden und die getrennte native Synthese können den neuen schemaVersion-2-Standalone-Index und danach die 15 resolutionSupersessions begründen.

Kein `select`, kombinierter 807/132-Lauf oder FullCQR-Produzent wurde aufgerufen. Keine aktiven Source-/Code-/Ledgeränderungen, Git-/DB-/Deployaktionen, SourceA-Probes oder Subagents. Alle Grenzen des vorangegangenen roten kombinierten Laufes bleiben erhalten. Dieses Paket behauptet weder D15-Pass noch Gesamtpass oder Aktivierung.
'''
    put(P / 'README.md', readme.encode())
    inventory = []
    for path in sorted(P.rglob('*')):
        if path.is_file():
            assert not path.is_symlink()
            data = path.read_bytes()
            inventory.append({'path': path.relative_to(P).as_posix(), 'sha256': sha(data), 'bytes': len(data)})
    js(P / 'inventory.json', inventory)
    js(P / 'receipt.json', {'schemaVersion': 1, 'status': 'SEALED_PRIVATE_D15_BLIND_INPUTS_ONLY',
        'sealedAtActualUTC': datetime.now(timezone.utc).isoformat(), 'inventory': {'path': 'inventory.json',
            'sha256': sha((P / 'inventory.json').read_bytes()), 'files': len(inventory), 'bytes': sum(row['bytes'] for row in inventory)},
        'summary': pin(P / 'input-preparation-summary.json'), 'nativePrepareExitCode': 0, 'nativeCheckExitCode': 0,
        'nativeFullBaseScope': 807, 'nativeGoalPages': 15, 'pdfPhysicalPages': 17, 'independentCampaigns': 2,
        'reportOnly': True, 'reviewRecordsAuthored': 0, 'runManifestsAuthored': 0, 'oldIndicesModified': False,
        'futureResolutionSupersessions': 15, 'producerRuns': 0, 'fullCqrRuns': 0, 'selectCalls': 0,
        'activeWrites': False, 'sourceAProbes': 0, 'subagents': 0,
        'mutableFutureResultDirectoriesExcludedFromPreparationInventory': ['packet/round-a/results', 'packet/round-b/results']})
    print(json.dumps({'receiptSha256': sha((P / 'receipt.json').read_bytes()), 'inventorySha256': sha((P / 'inventory.json').read_bytes()),
        'files': len(inventory), 'bytes': sum(row['bytes'] for row in inventory), 'rounds': rounds}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
