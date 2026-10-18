# Technische Checkpoint-QS

Stand der maschinellen Inventur: **18.10.2026, 11:09:34 UTC**, HEAD `6754609e97cfa57b722225033ac19c889d2bd8ea`. Der Arbeitsbaum war während der Prüfung in Bewegung. Die Inventur schließt dieses eigene QS-Paket aus.

| Prüfung | Tatsächlicher Befund |
| --- | --- |
| Umfang | 2.716 geänderte/neue Statusdateien, 738.152.640 Working-Dateibytes; keine Datei über 100 MiB, größte Datei ca. 8,31 MB. |
| Symlinks | Keine hinzugefügten/geänderten Symlinks. Die 5.521 bestehenden getrackten Symlinks verwenden keine absoluten oder `tmp/`-Ziele; ihre Ziele wurden nicht vollständig erneut geprüft. |
| Public-Dateien | Ein echter fehlender Verweis wurde gefunden und an Root gemeldet: Isomeren-PNG des Goals `00139854-e5a7-5c12-ab50-2268c80bf776`. Nach Roots Integration sind alle drei gebundenen Zielkopien vorhanden und stimmen mit dem getrackten Original überein: 914.857 Bytes, SHA-256 `6c7488f7de4bbe8126b455d2da670e5e33b80067053b0bd1ddf53d948f14a010`. Der erneute Scan findet nur vier JSON-Pointer `/assets/0` bis `/assets/3`, keine weiteren fehlenden realen Public-Dateien. |
| Absolute Pfade | 207 Treffer ausschließlich in technischen Auditfeldern wie `cwd`, `argv`, `command`, `scratchPath`; keine entsprechenden Normalconfig-Treffer. Diese Felder beschreiben die tatsächliche Ausführungsumgebung. |
| Ausführungskapseln | Keine neuen/geänderten Dateien unter Verzeichnissen `native-root`, `node_modules`, `.git`, `target` oder `dist`. 227 Audit-Snapshots belegen 66.718.906 Bytes. Keine Bilddateien in neuen Audit-Ausführungskapseln gefunden. |
| Bildduplikate | 254 Bilddateien, 424.874.833 Bytes; 116 identische Bytegruppen überwiegend als Quellen-/Public-Spiegel. Sieben Gruppen verwenden dasselbe Bild unter mehreren Goal-IDs (zusätzlich 30.453.416 Bytes gegenüber einem Quellen-/Public-Paar je Gruppe). Dies ist eine technische Inventur, keine fachliche Bildbewertung oder pauschale Löschfreigabe. |
| Syntax/Whitespace | Alle geänderten/neuen JSON-/JSONL-Dateien im Scan parsebar. `git diff --check`: Exit 0. |
| Historische Originale | Genau zwei bereits getrackte historische Audit-MDs weichen von HEAD ab; ihre Konfigurations-/Ledger-Owner selbst sind gegen HEAD unverändert. Keine bereits getrackten nativen Reviewrecords, Runs oder Seals im Evidence-Baum wurden durch diesen Diff verändert. Keine Änderung an veröffentlichten OpenAI-/Review-History-Pfaden festgestellt. |

## Vor dem Commit zu klären

Die beiden generierten historischen Auditberichte sind mit ihren HEAD-Originalbytes zu erhalten bzw. gezielt wiederherzustellen. Die abweichenden aktuellen Berichte gehören in getrennte Nachfolger:

- `2026-10-10/wirtschaft-CI-current-head-source-view-and-test-contract-root-v1/memory346.48-view-scopes.live-current.native-report.md`: HEAD-SHA-256 `33c9df296adc816f76f512d9d23107f833d1737a604a607474c63764f0719a12`; beobachtet `dd9d3ff1c8b766883323f388bb010bb2ba3cddee349be08b194fbcc0c263508b` (1.376 → 1.192 geprüfte Memory-Ziele in Views).
- `2026-10-17/chemie-current450-final-delivery-and-term-scope-integration-technical-20261018-v1/M450.current-normal.report.md`: HEAD-SHA-256 `761a53b81879203c23282746b08a8bf467e0d7dd429f40e707b1bb222fdd75bd`; beobachtet `662ecb90c5768cb44afe1fc9ec7ee311b5647cf2b1d17808a497e11ddbd8b5fa` (1.690 → 1.695).

Der Reproduktionspfad ist im Code belegt: `app/package.json` führt vor `quality:curriculum-status` `quality:memory-card-review:report:all` aus; `runMemoryCardReviewConfigs.ts` wählt aktive Configs und `memoryCardReview.ts` schreibt deren `reportPath` direkt. Ein weiterer Reportlauf kann diese historischen Pfade erneut verändern. Dieser Reviewer hat nichts zurückgesetzt oder an Normaldaten geändert.

Der Public-Dateiblocker ist nach der Nachkontrolle behoben. Weitere CI-Gates liegen bei Root und wurden hier weder erneut ausgeführt noch als bestanden behauptet. Die Rohkandidaten fehlender Repository-Verweise enthalten zusammengesetzte Quellenzitate, Zeilen-/Fragmentverweise, bundlelokale Vertragspfade und geplante/historische Auditpfade; daraus folgt kein zusätzlicher bestätigter fehlender Normalinput.

## Prüfgrenzen

Keine Inhaltsreviews, keine neuen Science-/D-/P-/A-/M-/V-Voten, kein vollständiger Build, keine Normalmutation und keine externen Writes. Keine Aussage über WholeSubject-Abschluss, M7, Human Approval oder Human Trial. Hashes belegen hier ausschließlich Byteidentität. Historische Assetpins wurden nur auf ausdrücklichen technischen Folgeauftrag gelesen; ihre fachlichen Urteile wurden nicht erneut übernommen oder erweitert.

Die zugehörigen JSON-Dateien enthalten Zeitpunkte, Inventar, Pfadkandidaten, Größen und Bytepins. `assessment-public-asset.trace-and-current-presence.actual.json` bindet den konkreten Quellen-/Installationsbefund. `historical-generated-original-drift.actual.json` hält die beiden Originalabweichungen fest.
