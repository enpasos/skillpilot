# Chemie: tatsächlicher technischer Layer-A-Nachlauf nach aktiver 15-Ziel-Integration

Technische READ-ONLY-QS an den tatsächlich aktiven Daten. Keine neue fachliche D/P/V-Prüfung, kein zentraler Bericht, kein zukünftiger Gate-Lauf, kein Status-/Floor-/Buchbuild-/Schema-Lauf und keine Git-, Runtime-, Plugin- oder Veröffentlichungsänderung durch dieses Paket.

## Tatsächliche Aufrufe

Alle acht Aufrufe enden mit **Exitcode 0**; alle acht tatsächlichen Stderr-Dateien sind leer. `actual-base-cli-checks.receipt.json`, `actual-native-source-atlas-test.cli.receipt.json` und `actual-spelling-chem-bio.cli.receipt.json` dokumentieren Originalargumente, echte Start-/Endzeiten, Arbeitsverzeichnis und Exitcodes. Die vollständigen echten Stdout-Dateien sind daneben erhalten.

| Bestehende Prüfung | Tatsächliches Ergebnis und Reichweite |
|---|---|
| `npm --prefix app run validate:graph` | 593 Landschaften bestanden; normale strenge Produktionsregeln |
| `npm --prefix app run validate:view-filters` | 0 Fehler, 0 aktive Warnungen; 27.070 APV-202-Diagnosen und 12 bestehende akzeptierte Warnungen bleiben ausgewiesen; normale geprüfte kanonische Gymnasium-Prüfmenge |
| `npm --prefix app run validate:composition-views` | 303 Ansichten bestanden; 21 kanonische Landschaften |
| `python -B scripts/validate_competency_wording.py` | 114.757 Goal-Datensätze in 4.685 Landschaftsdateien, 0 dokumentierte Ausnahmen; tatsächliche vorhandene Formelsammlungs-Wordingregel, keine umfassende fachliche Beschreibungsfreigabe |
| `node --test scripts/check_curriculum_spelling.test.mjs` | Alle vier unveränderten vorhandenen Tests bestanden |
| `node scripts/check_curriculum_spelling.mjs` | Bestehender CLI prüft ausschließlich Mathematik/Physik auf die fünf bekannten Kollisionsmuster |
| `testGoalBookSourceAtlasInputs()` | Exportierte unveränderte native Testfunktion wurde wirklich aufgerufen, nicht bloß importiert; aktuelle Chemie-/Biologie-Atlas-, Offline-, Snapshot-, Boundary- und Bindungs-Assertions bestanden |
| Vorhandene `findReviewedSpellingIssues` auf aktuellen Chemie-/Biologie-Goals | Identische fünf bestehende Kollisionsmuster, 0 Befunde in 479 ganzen Chemie- und 472 ganzen Biologie-Zielen; keine allgemeine Umlaut-/Stil-Suche oder Wörterbuchprüfung und keine Textkorrektur |

## Tatsächliche aktuelle Atlasprüfung

Der native Funktionstest begann erst nach bestätigtem Abschluss der tatsächlichen Root-Regeneration des Chemie-Atlas. `invoke-actual-native-source-atlas-test.author.mts` enthält den expliziten echten Funktionsaufruf. Die vorhandene Testfunktion und Produktionshelfer wurden nicht verändert.

| Native Receipt-Zählung | Biologie | Chemie |
|---|---:|---:|
| kanonische curricularAtomic-Ziele | 390 | 378 |
| veröffentlichte source-backed curricularAtomic-Ziele | 390 | 359 |
| Landes-/Stufen-/Kurs-Ansichten | 22 | 48 |
| ungelöste Source-Scope-Entscheidungen in diesem Receipt | 0 | 496 |
| ausgelassene Ziele | 0 | 19 |

Chemie behält 8 Auslassungen wegen ungeklärter Scope und 11 ohne geprüften Mapping-Zeugen. Der quantitative Parabentransfer bleibt außerhalb der Source-Abdeckung; der ehemalige Compound ist kein Atlas-Atom. Die vorhandenen Assertions prüfen die konkret gebundenen HE-LK-Atome, erhaltene BY-/HE-Mengen und auf BB/BE begrenzte authored-view-Provenienz. Biologie prüft konkrete BY-/HE-/ST-Mengen und direkte regionale Zeugen ohne grobe Clustervererbung in GK/LK. Der Test prüft außerdem echte Roundtrip-Gleichheit, Ableitung im frischen Checkout ohne PDF-Downloads sowie negative private Fixturefälle für stale Bytes, Scopeunsicherheit, Mapping-/Snapshot- und Boundaryfehler.

`actual-native-current-390-378-source-scopes-and-assertion-reach.receipt.json` hält alle tatsächlichen 22+48 Goal-Mengen, Kardinalitäten und Witness-/Profilarten aus den aktuellen vollständigen nativen Receipts fest. Das sind die vorhandenen technischen Assertion- und Beobachtungsgrenzen: keine pauschale GK⊆LK- oder Länder-Superset-Freigabe, keine vollständige fachliche Prüfung aller Primärkomponenten und kein Beleg, dass alle Quellen-HOLDs gelöst wären. Insbesondere bedeutet Biologie-Receipt `unresolvedSourceScopeDecisions=0` nicht, dass alle separat dokumentierten Fach- oder Vollkomponenten-HOLDs verschwunden wären.

## Erhaltung und echte Schreibwirkungen

Alle 34 erfassten aktiven Haupt-/Policy-/Helper-/Kanon-/QA-/Deck-/Bild-Bindungen sind zwischen Beginn und Abschluss der Base-Aufrufe bytegenau geblieben. Alle erfassten Atlas-Eingänge und aktuellen abgeleiteten Ausgaben sind vor und nach dem echten nativen Test bytegenau. Vorher-/Nachher-Manifeste und native Atlasquittung enthalten die konkreten Eingänge.

Der unveränderte View-Filter-CLI schreibt echte **technische Scratchberichte nach `tmp/applicability`**; deren tatsächliche Zusammenfassung ist als `native-applicability-summary.actual.json` gesichert. Der native Atlas-Test erstellt und entfernt seine vorhandenen privaten temporären Fixtures und Checkoutkopien. Dieses Dossier speichert echte Logs und QA-Quittungen. Damit wird keine völlige Schreibfreiheit des Dateisystems behauptet: aktive Curriculuminhalte, Qualitätsentscheidungen und produktive Eingänge werden durch diese Prüfungen nicht geändert.

APV-202-Diagnosen, akzeptierte Warnungen, alle übrigen Quellen-HOLDs und separate menschliche Freigabe-/Erprobungs-Gates bleiben erhalten. Dieses technische Paket fügt keine neue fachliche Reviewentscheidung und keinen weiteren strengen Abschluss hinzu. Root übernimmt die getrennten vollständigen Zentral-/Status-/Floor-/Build-/Schema-Abschlussprüfungen am stabilen Integrationsstand.
