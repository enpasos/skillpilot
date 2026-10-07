# BW v6: unabhängiges technisches Audit

Entscheidung: **APPLY_SAFE_METADATA_ONLY** für genau die 21 geprüften skalaren Operationen in fünf aktuellen Dateien und die daraus tatsächlich abgeleiteten nativen Metadatenbindungen. Dieses Audit führt die Anwendung nicht aus. Nettozuwachs 0; keine neue Science-, Human-, Source-Whole-HOLD- oder M7-Freigabe.

## Verifizierter Eingang

Authorfreeze: `937690cba6db1b649e5262fa4fd44f1717875d9c748c05e4f4002c7390bb116b`. Tatsächlich geprüft: **290 eigene Payload-Dateien plus Freeze**, **763 Außenbindungen**, beide exakt gebundenen Asset-Symlinks. Alle Eingänge waren am Anfang und bei der abschließenden Versiegelung unverändert.

Die bereits abgeschlossenen unabhängigen SourceA/B-Metadatenentscheidungen wurden tatsächlich gelesen. Ihre Freezes `c969392b908639d9aaf83f75a2f71a688b36261e57f998886233da8735408afa` und `6ba654676e37e0ee7d69b598bc11387960fef8f1b5c891ae0dcdb16a57f7a23e` sowie sämtliche sieben A-/13 B-Dossierdateien wurden separat bytegenau verifiziert. Ihre KEEP-Grenze betrifft die konkrete V2-URL und Locator-Felder. Das ersetzt keine vollständige Quellenabdeckung oder Operator-/Kind-/Superset-Prüfung.

Der aktuelle PDF-Snapshot, der damals tatsächlich amtlich heruntergeladene v5-Snapshot und der unabhängig heruntergeladene B-Snapshot haben tatsächlich dieselben Bytes: SHA256 `3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62`. Die bestehende B-HTTPS-Quittung bindet die korrigierte URL zu diesen Bytes. Das technische Audit hat keine neue PDF-Raster-Science-Runde ausgeführt oder eine alte Sichtprüfung als eigene neue Sichtprüfung ausgegeben.

## Eigene vollständige Deltaprüfung

| Aktuelle Datei | Tatsächlich erlaubte skalare Deltas |
|---|---:|
| Chemiekanon, alleinige aktuelle 479-Ziel-Basis | 5 × `extendedData.provenance.sourceRef`, S.15 → S.16 |
| BW-SekI-Extraction | 8 Locator-Felder zu Absätzen (3)–(10), dazu V2-URL |
| BW-SekII-Extraction | 1 V2-URL |
| Chemie-Semantic-Kind-Ledger | 5 `sourceFingerprint`-Werte |
| Chemie-Atlas-Inputconfig | 1 Snapshot-URL; PDF-Digest unverändert |
| **Summe** | **21 in 5 Dateien** |

Der eigenständige rekursive Vergleich bestätigt sämtliche Operationen und keine weiteren skalaren Änderungen. Alle **479 IDs in gleicher Reihenfolge, vollständigen DE/EN-Titel/Beschreibungen, requires-/contains-Kanten und Bildlinks** bleiben exakt erhalten; ganze Zielobjekte unterscheiden sich ausschließlich an den fünf geprüften Provenienzlocators. Vier dieser Ganzziele gehören zu den aktuellen strengen 127. Der historische B007-v4-Vollkanon wurde nicht übernommen; er unterscheidet sich tatsächlich an neun geschützten Ganzobjekten von der aktuellen Basis.

Alle **131 vollständigen Dateipaare** der beiden physischen Checkouts wurden selbst verglichen. Geändert sind genau die fünf geplanten Dateien und die abgeleitete `source-projection.receipt.json`. Mappingdateien, alle 48 Source-Views, Manifest und Navigation sind bytegleich.

## Eigener tatsächlicher nativer Nachlauf

Unveränderte Produktionsfunktionen wurden unabhängig **lesend** auf beiden gespeicherten Checkouts ausgeführt: reine Source-Derivation plus Inputcheck, vier vollständige BookModel-Ladevorgänge und zwei Originalquellenindex-Ableitungen. Der abschließende eigene Lauf endete mit **Exit 0**. Er erzeugte keine ganzen PDFs und führte keinen globalen Build, central-, Status-, Floor- oder Schema-Lauf aus. Ein eigener anfänglicher Probe-Fehler (`evidenceReview.status` statt tatsächlichem `null`) ist erhalten; allein der eigene Probe wurde korrigiert.

| Eigener Nachweis | Ergebnis |
|---|---|
| Gespeicherte vollständige Produktionsmodelle | Beide 378-/359-Modelle samt Quellenindices stimmen mit der eigenen aktuellen Produktionsableitung überein |
| Ganze native Seiten, Kapitel, Navigation, Seitenreihenfolge | 378 vollständig / 359 national exakt gleich |
| Ganze Landes-/Stufen-/Kurs-/Dauer-Sichten und Witness-Mengen | Alle 48 exakt gleich |
| Offene native Source-Scope-Menge / ausgelassene IDs | 496 / 19 exakt erhalten |
| Ganze native D-Eingabeteile und Kontextfingerprints | Alle 378 vor/nach exakt gleich |
| Ganze P-Payloads und P-Inputfingerprints mit echten Bilddigests | Alle 378 vor/nach exakt gleich |
| Bildlinks und native Visualisierungsobjekte | Alle 378 exakt gleich |
| Aktuelle strenge Chemie-Raster | Alle 127 tatsächlichen Public-/Backend-Paare bytegleich gebunden |

Die Produktionsfunktion `fingerprintSemanticKindSourceGoal` verwendet den fest gebundenen Vertrag `semantic-kind-source-fingerprint-v1` und schließt **/extendedData** ein. Daher ändern die fünf Locatorwerte genau fünf technische Fingerprints. Alle **479 Klassifikationen, decisionStatus, decisionBasis und sonstigen Ledger-Felder bleiben unverändert**. Die native Prüfung bestätigt jeden alten und jeden neuen Fingerprint gegen das jeweilige vollständige Ziel; der Validator wurde nicht verändert.

Die aktuelle D-Funktion bindet unter anderem `goal.sourceRef`, aber nicht `extendedData.provenance.sourceRef`. Der tatsächlich gebundene volle Review-Book-Config besitzt `evidenceReviewPaths: []`; seine Seiten haben `evidenceReview: null`, daher ist `evidenceProfile: null` in diesen native D-Eingabeteilen korrekt. Das wird nicht als neuer vollständiger D-Review ausgegeben. Der native P-Vertrag bindet Semantik, Kanten, Beispiele und tatsächliche Bilddigests, ebenfalls ohne diesen Provenienzlocator. Die unabhängigen vollständigen Vorher/Nachher-Vergleiche bestätigen Kontinuität, keine neue Science-Freigabe.

## Tatsächlich geänderte Quellenattributionen

**186 nationale Zielattributionen ändern sich, darunter 68 aktuell strenge Ziele.** Sie werden ausdrücklich nicht als unverändert bezeichnet. Jede aufgelöste Originalquellenattribution wurde selbst vollständig vor/nach verglichen: Deltas ausschließlich an Dokument-URL oder `sourceRef`. SourceIDs, Dokumenttitel, `direct`/`inherited`, Scope, Kurs, Stufe, Operatoren, Mappingtargets und Coverage bleiben exakt erhalten.

Der vollständige rohe Quellenindex hat genau **17 skalare Deltas**: einen neuen Book-Digest, eine gemeinsame Dokument-URL, 15 exportierte `sourceRef`-Felder. Beide ganze BookModels haben jeweils nur die drei Metadaten-/Digest-Deltas `/digest`, `/source/landscapeDigest`, `/source/semanticKindLedgerDigest`; ihre ganzen Seiten sind exakt gleich. Das Audit bindet diese tatsächlichen neuen Metadatenstände, ohne historische D/P/A/M/V-Datensätze neu zu etikettieren.

Bei einer späteren Anwendung müssen die fünf Feldpakete mit genau der aktuellen 479-Basis und die dadurch abgeleitete Source-Quittung/BookModel-/Originalquellenindex-Metadaten konsistent übernommen beziehungsweise aus diesen Inputs abgeleitet werden. Es gibt keinen technischen Grund für einen alten v4-WholeReplacement, eine zusätzliche Quellenfreigabe oder neue Klassifikationsentscheidung.

## Erhaltener Schutz und offene Grenzen

Die vollständigen aktuellen Mengen aus dem tatsächlichen zentralen Bericht bleiben gebunden: **Chemie127/378, Biologie74/390, Mathematik807/807, Physik478/478**. Keine dieser Mengen wird durch historische Zwischensummen ersetzt. Die aktuelle allgemeine Maturity-Floor-Policy verlangt M6; der vorhandene vollständige maschinelle M7-Stand von Mathematik/Physik wird zusätzlich durch die aktuelle tatsächliche Berichtsmengenbindung geschützt. Kein neuer zentraler oder Floor-Erfolg wird behauptet. Policy, Math-/Phys-/Bio-Kanonbytes und Schutzmengen bleiben unverändert.

Die ursprünglichen B007-Pflichten **403 / 413 / 40** bleiben ausdrücklich HOLD. Sie sind historische gebundene Quellenpflichten, kein aktueller globaler Neuabschluss. Die quantitative/fakultative HE-Grenze, qualitative NI-Grenze, qualitative BW-Absatz-(3)-Grenze, Kind-/Operator-/Länderscope-, Prerequisite- und Superset-Grenzen bleiben erhalten. Auch 496 native offene Source-Scope-Entscheidungen und 19 ausgelassene aktuelle Ziele sind kein Maschinenabschluss. `sourceHoldsCleared = 0`, `strictCompletionsAdded = 0`.

## Eigene versiegelte Artefakte

- `entry-exact-input.receipt.json`: vollständiger tatsächlicher Eingang.
- `independent-21-fields-five-files-and479-whole-goals.actual.json`: selbst berechnete Felddeltas, alle 479 Ziele und 131 Checkout-Dateipaare.
- `independent-native-production-contract-and-fingerprint.receipt.json`: echte Produktionsprüfung und Fingerprints.
- `independent-complete378-DEEN-D-P-page-image.actual.json`: ganze eigene D-/P-Eingabeteile und Seiten-/Bildvergleich.
- `independent-186-changed-source-attributions.actual.json`: ganze aufgelöste Vorher/Nachher-Attributionen.
- `independent-native-source-deltas-and68-protected-routing.actual.json`: konkrete URL-/Locator-/Digest-Deltas und 68 geschützte Ziele.
- `independent-source-AB-keeps-and-same-V2-binding.actual.json`: tatsächliche abgeschlossene SourceA/B-KEEPs und gleiche PDF-Bytes.
- `independent-current127-math-physics-and-policy-protection.actual.json`: aktuelle vollständige Schutzmengen und 127 Rasterpaare.
- `independent-native.actual-terminal.receipt.json`: tatsächlich abschließender Exit 0, eigener Fehler und Probecode.
- `independent-technical-verdict.actual.json`, `final-input-guard.actual.json`, `independent-technical-audit-v6.final.freeze.json`: Entscheidung, unveränderte Eingänge und eigener Schlussfreeze.

Keine aktiven/historischen Writes, Unteragenten, generierten Bilder, neuen Science-Reviews oder HumanApproval/HumanTrial. Eigene technische Nachweisführung und Hilfscode: Apache-2.0. Amtliche Quellen und historische Dossiers behalten ihre eigenen Rechte und Grenzen.
