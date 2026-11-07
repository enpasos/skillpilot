#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from prepare_and_qualify import R, P, W, sha, js, write
from datetime import datetime, timezone
import gzip
import json


def pin(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(R).as_posix(), 'sha256': sha(raw), 'bytes': len(raw)}


def main():
    checks = json.loads((P / 'final-checks.execution.json').read_bytes())
    controls = json.loads((P / 'final-controls.execution.json').read_bytes())
    assert all(row['exitCode'] == 0 for row in checks + controls)
    epoch = json.loads((P / 'root-coordinated-code-epoch.json').read_bytes())
    allowed = {row['path']: row for row in epoch['files']}
    changes = []
    protected = json.loads(gzip.decompress((P / 'protected-inputs.before.json.gz').read_bytes()))
    for before in protected:
        path = R / before['path']
        raw = path.read_bytes()
        after = {'path': before['path'], 'sha256': sha(raw), 'bytes': len(raw)}
        if before != after:
            authorized = allowed.get(before['path'])
            assert authorized and authorized['beforeSha256'] == before['sha256'] and authorized['afterSha256'] == after['sha256'], before['path']
            changes.append({'before': before, 'after': after, 'actor': 'Root explicitly coordinated independent material-context QA application'})
    assert len(changes) == 6
    for row in epoch['files']:
        assert sha((R / row['path']).read_bytes()) == row['afterSha256']
    old_index_path = R / 'contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json'
    old_capsule_path = R / 'qa-artifacts/ci-contract-audit/2026-11-07/math58-active-integration/capsule-132/capsule.json'
    assert sha(old_index_path.read_bytes()) == '441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803'
    assert sha(old_capsule_path.read_bytes()) == 'bf797d97d48d3ebb436037cfcf487189e06455e9cf2120a4d385f7921b20b0bf'
    old_index = json.loads(old_index_path.read_bytes())
    for reference in old_index['currentReferences'] + [row['receipt'] for row in old_index['rows']]:
        raw = (R / reference['path']).read_bytes()
        assert sha(raw) == reference['sha256']
        if 'bytes' in reference:
            assert len(raw) == reference['bytes']
    old = json.loads(old_capsule_path.read_bytes())
    new = json.loads((P / 'capsule-188/capsule.json').read_bytes())
    by_oid = {row['oid']: row for row in new['objects']}
    assert all(by_oid.get(row['oid']) == row for row in old['objects'])
    assert new['receiptReferences'][:132] == old['receiptReferences']
    assert new['shallowBoundaries'] == old['shallowBoundaries']
    for row in old['objects']:
        if row['storage'] == 'embedded':
            assert (old_capsule_path.parent / row['path']).read_bytes() == (P / 'capsule-188' / row['path']).read_bytes()
    measured = json.loads((P / 'transport-measurements.json').read_bytes())
    index = json.loads((P / 'candidate' / measured['indexPath']).read_bytes())
    for ref in new['workingInputs']:
        path = (R / ref['path']) if ref['path'] != measured['indexPath'] else P / 'candidate' / ref['path']
        assert path.is_file() and not path.is_symlink() and path.resolve().is_relative_to(R)
        raw = path.read_bytes()
        assert sha(raw) == ref['sha256'] and len(raw) == ref['bytes']
    js(P / 'postguard.json', {'protectedBeforeRows': len(protected), 'unchangedProtectedRows': len(protected) - len(changes),
        'explicitCoordinatedRootChanges': changes, 'allEightRootEpochAfterPinsConfirmed': True,
        'originalBeforePinsPreserved': True, 'uncoordinatedInputChanges': [], 'activeWritesByThisAgent': False,
        'old132Index': pin(old_index_path), 'old132Capsule': pin(old_capsule_path),
        'old132ReceiptReferencesExactInNewCapsule': True, 'old1236ObjectRowsExact': True,
        'oldEmbeddedObjectFileBytesExact': True, 'oldShallowBoundariesExact': True,
        'new1340WorkingProofPathsRegularActualAndWithinRoot': True,
        'sourcePins': [pin(R / ('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_' + subject + '.de.json')) for subject in ['BIOLOGIE', 'MATHEMATIK', 'INFORMATIK']],
        'activeGitRefsWritten': False, 'privateAuthenticGitMaterializationAllowedAndPerformed': True,
        'sourceAProbes': 0, 'historicalSealOrOutputManipulationProbes': 0, 'combinedProducerRuns': 0, 'fullCqrProducerRuns': 0})
    patch = json.loads((P / 'PATCH-FILES.json').read_bytes())
    assert len(patch) == 8
    for row in patch:
        assert sha((P / row['candidate']).read_bytes()) == row['afterSha256']
        assert (sha((R / row['path']).read_bytes()) if (R / row['path']).is_file() else None) == row['beforeSha256']
    js(P / 'application-map.json', {'status': 'PRIVATE_CANDIDATE_AWAITING_INDEPENDENT_CODE_AND_PAYLOAD_REVIEW',
        'candidateProductionAndExpectationFiles': patch,
        'proofDirectoriesAlreadyRegularAtDeclaredRepositoryPaths': [P.relative_to(R).as_posix() + '/qualifications', P.relative_to(R).as_posix() + '/capsule-188'],
        'newReceiptCount': 56, 'newIndex': {'path': measured['indexPath'], 'sha256': measured['indexSha256']},
        'newCapsule': {'path': measured['capsulePath'], 'sha256': measured['capsuleSha256']},
        'old132ScopeAndReceiptsRemainSeparateRegressionFixture': True,
        'currentSourceFrame': 'Active Mathematics e4de3c3e / Informatics50 50a26163 / Biology 9b3ef170; Source15 is excluded.',
        'coordinatedRootMaterialContextFixturePreserved': True,
        'ordinaryTestsUseReal188AuthorityNoCommandOrSkipChanges': True,
        'preparedExpectationTestsNotExecutedHere': ['app/scripts/testDeepUnderstandingRollout.ts', 'app/scripts/testVisualizationContextMaturity.ts'],
        'requiredAfterIndependentReview': 'Root performs the real cold combined188 producer and normal full CQR, and treats any real additional finding as a hold.',
        'activationPerformed': False})
    readme = f'''# Privater Bio56-Reader und endlicher 188er-Transportnachfolger

**56 bestehende originale Biologie-Kontexte wurden mit dem vorhandenen Receipt-/Git-Verifier technisch qualifiziert.** Genau Human20 + Flora19 + HE17 sind zugelassen. Die unveränderten bisherigen 132 Math-/Econ-Receipts bestanden einmal separat als vollständige Regression. Das ist kein kombinierter 188er-Produzentlauf, kein Gesamt-CQR-/M7-Pass und keine Aktivierung.

Der neue feste Reader `biology-sealed-native-three-families-v1` verwendet genau drei literale Originalhüllen, 56 literale IDs, den festen Bio-Owner `08a43a1b-d97e-522c-9dfa-c950a493364e` und die aktuelle Bioquelle `9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79`. Die aktive Mathquelle bleibt `e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06`; die aktive Info50-Quelle ist `50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8`. Source15 ist nicht enthalten.

[PATCH-FILES.json](PATCH-FILES.json) bindet acht genaue private Kandidatdateien mit Vorher-/Nachherpins; [candidate.patch](candidate.patch) zeigt das gesamte Delta. Sechs Dateien betreffen Reader, bestehenden Verifier/Schema, Selector/Authority und den neuen Index. Zwei vorhandene Testdateien erhalten ausschließlich die genauen 188er-Index-/Count- bzw. Fachlisten-Erwartungen. Der neue `captureCurriculumSource`-Fixturekörper aus Roots koordiniertem MaterialContext-Patch bleibt erhalten. Die alten 74er-/132er-Math-Regressionsdateien bleiben unverändert. Keine Testbefehle, Skips, Floors, Ausnahmen oder alternative CI-Routen werden eingeführt. Die beiden aktualisierten Produzenten-/Maturity-Testdateien wurden hier ausdrücklich **nicht ausgeführt**.

Der Reader authentisiert mit dem unveränderten vorhandenen Rohgit-Kern Erstseal → Autorseal → finalen kanonischen Kandidaten. Er prüft den eindeutigen ausgewählten Batchrecord statt einer Top-Level-goalId, ganze aktuelle Goalobjekte einschließlich DE/EN/Niveau/requires/Scope/ResourceLinks, originalen Wortlaut, BookModel/Alttext/Bildhash, echte 360/680-PNG-Breiten, PDF und vollständige native Seiten-Captures mit physischer Seitennummer. Der vorhandene Kern prüft weiterhin Owner, geschlossenes Receiptschema, originale Attribution/Zeit/Verdict/Grund sowie beide tatsächlichen aktuellen Assetkopien. Alte Math-/Econ-Zweige bleiben erhalten.

**Flora9 bleibt zeitlich getrennt:** Der tatsächliche volle Originalraster-KEEP von `2026-10-07T21:47:05.935778+00:00` wird zusammen mit der damals offenen Mobil-/Native-Prüfung authentisiert. Der spätere tatsächliche Chromium-/Native-Kontextentscheid stammt von `2026-10-07T22:22:46.889600+00:00`. Es werden keine neun neuen Raster-Sichtungen um 22:22 erfunden. Beide Erst-/Portable-Seals bleiben gebunden. Beim Ziel `5f39afac-897c-5ed3-95b5-89ccf66b2532` bleiben V1-HOLD und eigene originale V1-Bytes erhalten; nur die tatsächliche getrennte V2-Auflösung trägt den aktuellen positiven Kontext.

Die drei Ausschlüsse bleiben geschlossen: Flora `321ea315-37fe-5f9e-8fa8-dd631bb447c7` wegen aktueller anderer Bildbytes, HE `1b7f08a1-33df-5779-af66-430c91d699b7` wegen vorhandener abweichender alter EN-Texte und das nicht eingeschlossene HE-Splitziel `3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8`. EN oder Demandlevel werden zur Rettung keines Falls weggelassen.

Tatsächliche Prüfungen und ihre Grenzen:

- [Direkte native Qualifikation und einmalige vollständige 132er-Regression](native-qualification-and-regression.json): Bio56 + Math63 + Econ69; 683 authentisierte Originalreferenzen. Der erste Versuch ist wegen einer falsch zugeordneten vorhandenen `files`/`frozenFiles`-Hüllenvariante fehlgeschlagen; der konkrete geschlossene Dreifamilienzweig wurde korrigiert und der Fehlversuch bleibt erhalten.
- [Normaler kalter Authority-Pfad](cold-native-authority-results.json): exakt eine echte Initialisierung mit dem neuen Selector/Capsule, authentisches flaches Originalrepo, Bio56 plus vier vorhandene Profilrepräsentanten. Die 132er-Vollregression wurde dabei nicht wiederholt. Keine Stub-V-Receipts oder Bereitschaftslisten ersetzen den Verifier.
- [Finale gezielte Kontrollen](final-focused-controls.json) und [tatsächliche aktuelle Assetabweichung](final-changed-current-asset-control.json): sieben negative Fälle für Kontext, Attribution, Retentionszeit, aktuelle Public-Bildbytes und die drei Ausschlüsse; zwei echte Positivkontrollen. Manipuliert werden nur untrusted Caller-/Receiptkopien und eine neue private aktuelle Assetkopie, **keine historischen Siegel-/Review-/Outputbytes**, keine SourceA-/Namespace-Probes. Nach einer verhaltensgleichen Lintkorrektur wurden dieselben sieben Kontrollen gegen die finalen Readerbytes wiederholt; keine Testausweitung.
- [Finaler strikter Typecheck und Lint](final-checks.execution.json): beide Exit0. Der vorherige unbenutzte lokale Destrukturierungsname und sein fehlgeschlagener Lintlauf bleiben dokumentiert. Es gibt hier keine Behauptung über einen vollständigen App-Typecheck.

Der separat versionierte Index hat SHA256 `{measured['indexSha256']}`; die Capsule hat SHA256 `{measured['capsuleSha256']}`. Die [Messung](transport-measurements.json) enthält **1340** echte Arbeitspfade, **523012904** eindeutige Arbeitsbytes, **1633** Objekte / **495607951** Rohobjektbytes, **14659066** unkomprimierte eingebettete Bytes und **4260177** gespeicherte Capsulebytes. Die festen neuen Maxima sind 499 MiB Arbeit, 473 MiB Objekte und unveränderte 14 MiB eingebettet. Alte 74er-/132er-Grenzen werden nicht geändert. Der build-Aufruf verwendete zunächst größere endliche Messobergrenzen; die endgültigen engeren literalen Grenzen wurden anschließend im tatsächlichen kalten Materializer erfolgreich angewendet.

Alle 132 bisherigen Receiptreihen, alle 433 bisherigen Originalreferenzen und alle 408 bisherigen aktuellen Referenzen bleiben unverändert. Der Nachfolger ergänzt genau 56 Receiptreihen, 250 Originalreferenzen und 113 aktuelle Referenzen. Sämtliche **1236 alten Capsule-Objektreihen sowie deren eingebettete Dateibytes** sind im Nachfolger exakt erhalten. Alter 132er-Index und alte Capsule haben weiterhin ihre ursprünglichen Hashes `441b710b…` / `bf797d97…`. Alle 1340 deklarierten Arbeitspfade sind tatsächliche reguläre Dateien innerhalb der Repositorygrenze. Große originale Git-/Assetdaten wurden ausschließlich privat auf E materialisiert; im neuen Repositorypaket liegen nur die kleinen regulären Capsulepayloads und die übrigen reviewbaren Dateien.

[root-coordinated-code-epoch.json](root-coordinated-code-epoch.json) erfasst die acht ausdrücklich koordinierten Root-Änderungen während der Arbeit. Die ursprünglichen 1363 Vorherpins bleiben in [protected-inputs.before.json.gz](protected-inputs.before.json.gz) erhalten. [postguard.json](postguard.json) bestätigt 1357 gleiche geschützte Dateien und genau sechs davon durch Root koordiniert geänderte bestehende Dateien; die neue Testdatei und QM-Dokumentation sind separat gegen alle acht erlaubten Nachherpins geprüft. Keine pauschale Unverändertbehauptung überschreibt diese Codeepoch. Die kritischen V-/Kernel-/Quell-/Alt132-Eingaben sind unverändert.

Alle nativen Befehle und tatsächlichen Exitcodes stehen in den Ausführungsbelegen. [application-map.json](application-map.json) beschreibt den exakten späteren Anschluss. Root lässt Code und Payload unabhängig prüfen und führt erst danach den echten kalten kombinierten 188er-Produzenten und normalen Gesamt-CQR aus. Ein weiterer echter Befund bleibt ein Hold. Hier wurden null kombinierte Produzenten und null FullCQR-Produzenten ausgeführt, keine aktiven Dateien oder aktiven Gitrefs durch diesen Agenten geändert, keine DB-/Deployaktionen oder Subagents verwendet. Die frühere Sichtung wird technisch fortgeltend gebunden; es gibt keine neue Bild-, Human-/Device-, aktuelle Ganzseiten- oder Lernendenleistungsfreigabe.
'''
    write(P / 'README.md', readme.encode())
    inventory = []
    for path in sorted(P.rglob('*')):
        if path.is_file():
            assert not path.is_symlink()
            raw = path.read_bytes()
            inventory.append({'path': path.relative_to(P).as_posix(), 'sha256': sha(raw), 'bytes': len(raw)})
    js(P / 'inventory.json', inventory)
    js(P / 'receipt.json', {'schemaVersion': 1, 'status': 'SEALED_PRIVATE_BIO56_READER_AND_FINITE188_TRANSPORT_AWAITING_INDEPENDENT_REVIEW',
        'sealedAtActualUTC': datetime.now(timezone.utc).isoformat(), 'actor': 'Codex /root/math58_active_integration',
        'inventory': {'path': 'inventory.json', 'sha256': sha((P / 'inventory.json').read_bytes()), 'files': len(inventory), 'bytes': sum(row['bytes'] for row in inventory)},
        'patchFiles': pin(P / 'PATCH-FILES.json'), 'indexSha256': measured['indexSha256'], 'capsuleSha256': measured['capsuleSha256'],
        'newNativeBioReceipts': 56, 'preservedNative132Regression': 132, 'actualColdAuthorityInitializations': 1,
        'actualColdBioContexts': 56, 'actualColdExistingProfileRepresentatives': 4, 'focusedNegativeControls': 7,
        'finalTypecheckExitCode': 0, 'finalLintExitCode': 0, 'old1236ObjectRowsAndEmbeddedBytesPreserved': True,
        'activeWritesByThisAgent': False, 'rootCoordinatedChangesSeparatelyRecorded': 8,
        'combinedProducerRuns': 0, 'fullCqrProducerRuns': 0, 'source15Included': False, 'sourceAProbes': 0,
        'historicalSealOutputManipulationProbes': 0, 'subagents': 0, 'activation': False, 'newImageReview': False, 'M7Claim': False})
    print(json.dumps({'receiptSha256': sha((P / 'receipt.json').read_bytes()), 'inventorySha256': sha((P / 'inventory.json').read_bytes()),
        'files': len(inventory), 'bytes': sum(row['bytes'] for row in inventory), 'patchFilesSha256': sha((P / 'PATCH-FILES.json').read_bytes())}, indent=2))


if __name__ == '__main__':
    main()
