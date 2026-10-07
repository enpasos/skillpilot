# BW-Metadaten: aktuelle native Integrationsvorbereitung

Stand: 6. Oktober 2026. Rolle: **technische Autorenvorbereitung**, Status **ai_candidate / candidate**. Root prüft die tatsächlichen Deltas vor einer späteren Anwendung. Keine aktive Änderung, keine neue unabhängige Science-Runde, keine zusätzlichen strikten Abschlüsse.

## Übernommene begrenzte Quellenentscheidungen

Die beiden unabhängigen v5-Quellenreviews sind unverändert gebunden:

- A: `chemie-b007-bw-source-locator-version-independent-a-v5`, Freeze `c969392b908639d9aaf83f75a2f71a688b36261e57f998886233da8735408afa`.
- B: `chemie-b007-bw-source-locator-version-independent-b-v5`, Freeze `6ba654676e37e0ee7d69b598bc11387960fef8f1b5c891ae0dcdb16a57f7a23e`.

Ihre KEEP-Entscheidungen betreffen die tatsächliche V2-PDF-URL und die konkreten Locator-Felder. Der amtliche V2-Download ist bytegleich zum verwendeten 52-seitigen Snapshot. Abschnittsüberschrift und Absätze (1)/(2) bleiben auf gedruckter Seite 15; die Absätze (3)–(10) stehen tatsächlich auf physischer Seite 18, gedruckter Seite 16. Keine fachliche Source-/Operator-/Kind-/Länderscope- oder Superset-Freigabe wird daraus abgeleitet.

## Alleinige aktuelle Basis und ausgewählte Änderungen

Die Zukunftsbasis ist der tatsächlich gelesene **aktive Kanon mit 479 Zielen**, davon 378 curricularAtomic und 127 aktuell maschinell strikte Ziele. Der alte B007-v4-Vollkanon wird nicht übernommen. Der konkrete Vergleich dieses v4-Kanons mit den aktuellen 127 ergibt neun verschiedene Ganzziele; die anfänglich übernommene Routingannahme zwölf war falsch und ist als eigener Probe-Fehler erhalten.

| Aktuelle Datei | Exakter Kandidatendelta |
| --- | --- |
| BW-SekI-Extraction | Gewählte getrennte Acht-Absatz-Alternative: acht `sourceRef`-Felder plus die V2-URL |
| BW-SekII-Extraction | Nur dieselbe belegte V2-URL |
| Aktueller kanonischer Chemiegraph | Fünf `extendedData.provenance.sourceRef`-Felder |
| Chemie-Semantic-Kind-Ledger | Fünf technisch neu gebundene `sourceFingerprint`-Werte; bestehende Klassifikationen, Status und Basis exakt erhalten |
| Chemie-Atlas-Inputconfig | Genau der BW-URL-Wert im `sourceDocumentSnapshots`-Eintrag; PDF-Digest unverändert |

Insgesamt **21 skalare Operationen in fünf aktuellen Dateien**. Alle aktuellen IDs, normativen Texte, Operatoren, Scopes, Übersetzungen, Graphbeziehungen, Bilder und Mappingzeilen bleiben exakt erhalten. Die fünf SourceFingerprints müssen nachgeführt werden, weil der unveränderte native Semantic-Kind-Vertrag `/extendedData` umfasst. Das ist ein technischer Metadatenkandidat mit unveränderter Klassifikationsentscheidung; kein neuer fachlicher Review.

Alle tatsächlichen Vorher-/Nachher-Felder und die später vorgesehenen Pfade stehen in `exact-selected-five-file-metadata-application-and-native-derivative-candidates.json`.

## Wirklich gemessene native Deltas

Es wurden ausschließlich eigene Baseline-/Zukunfts-Isolate aufgebaut. Die unveränderten Produktionshelper erzeugten und prüften darin die Chemie-Quelleninputs und erstellten vollständige native BookModels. Keine aktive Atlas-Regeneration, kein globaler Build, kein zentraler M7-/Status-/Floor-/Schema-Lauf.

| Messung | Tatsächliches Ergebnis |
| --- | --- |
| Native Chemie-Quellenderivation und Inputcheck | PASS für beide Isolate |
| Vollständige kanonische native Seiten | 378 vor/nach exakt gleich |
| Nationale native Seiten | 359 vor/nach exakt gleich |
| Geordnete Source-Sichten und vollständige Witness-Sets | Alle 48 exakt gleich |
| Native vollständige D-Kontexte und Inputteile | Alle 378 exakt gleich |
| Native P-Eingabepayloads und Fingerprints | Alle 378 exakt gleich |
| Bildlinks und native Bildbindungen | Unverändert; tatsächliche 127 öffentlichen/Backend-Rasterpaare separat gebunden |
| Geschützte Ganzziele mit direktem Provenienzdelta | Vier; jeweils nur `sourceRef` |
| Acht-Absatz-Witness-Reichweite | 15 Atome, darunter acht geschützte Ziele |
| Tatsächlich geänderte Originalquellen-Attribution | 186 Atlas-Zielseiten, darunter **68 geschützte Ziele** |

Die acht geschützten Ziele der Absatz-Witness-Reichweite werden somit nicht als quellenmäßig unberührt behauptet. Die gemeinsame BW-URL wirkt zusätzlich auf viele andere BW-Attributionen. Die native Rohquellenindex-Differenz besteht genau aus einem Book-Digest, einer gemeinsamen Dokument-URL und 15 exportierten Quellenlocator-Feldern. Die vollständigen Originalquellenindices bleiben als tatsächliche Rohdaten erhalten; alle aufgelösten Attributionen wurden vor/nach strukturell verglichen. Außer URL/Locator bleiben SourceIDs, Scope, Operatoren, `direct`/`inherited`, Mappingtargets, Dokumenttitel und Witness-Auswahl exakt erhalten.

Die 68 geschützten Quellenänderungen stehen einzeln mit exakten Metadatendeltas und Raw-Pointern in `actual-real-original-source-url-locator-scalar-deltas-and-68-protected-routing.json`. Die 378 vollständigen Goal-/Page-/D-/P-/Source-/Bildvergleiche stehen in `actual-current378-complete-goal-page-context-source-image-continuity.json`. Vollständige Native-Modelle, Eingänge und Quellenindices liegen unter `baseline-current/` und `future-metadata-only/`. Die Pointerdarstellung verhindert Wiederholung gemeinsam gebundener Quellenobjekte; die ganzen Rohobjekte bleiben im Freeze enthalten.

## Reviewrouting und Grenzen

Root prüft die tatsächlichen 21 Feldoperationen, fünf Semantic-Kind-Metadatenbindungen und 68 geschützten Quellenattributionen gegen die beiden begrenzten v5-Quellenaudits. Eine tatsächliche Quellenattributionsänderung wird nicht hinter gleichen D-/P-Fingerprints versteckt. Umgekehrt werden gültige unveränderte D/P/A/M/V-Science-Reviews nicht neu gestartet, um globale Digests nachzuführen. Die unveränderten aktuellen Gatekonfigurationen, Reviewhistorien und QA-Rasterbindungen sind separat schreibgeschützt gebunden; keine Reviewrecord-Zeile wurde relabelt, neu gehasht oder als neue fachliche Prüfung ausgegeben.

Die nationalen Source-Derivationszahlen bleiben exakt: 378 kanonische Atome, 359 publizierte Atome, 48 Sichten, 496 ungelöste Source-Scope-Entscheidungen und 19 ausgelassene Ziele. Diese technischen Zahlen sind keine vollständige curriculare Länder-/GK-/LK-/Superset-Freigabe. Daneben bleiben die ursprünglichen B007-Pflichten **403 / 413 / 40**, die quantitative/fakultative HE-Reichweite, qualitative NI-Grenze, Operator-/Kind-/Länderscope- und Prerequisite-HOLDs unverändert offen. `sourceHoldsCleared = 0`, `strictCompletionsAdded = 0`.

Die native Baseline-Quellenquittung und das aktive Original sind als vollständige geparste Objekte exakt gleich; ihre JSON-Serialisierung unterscheidet sich byteweise. Die ursprünglichen Bytes sind separat gebunden. Der Formatunterschied ist kein neuer Inhalts- oder Science-Defekt.

## Ehrliche Probehistorie

Zwei eigene Vorbereitungsfehler bleiben eingefroren: eine falsche feste v4-Unterschiedszahl und ein zunächst fehlendes verpflichtendes BY-JSON-Originaldokument im eigenen Isolat. Beide wurden in der eigenen Vorbereitung korrigiert. Die Produktionshelper/Validatoren blieben unverändert; der anschließende native Messlauf endete mit Exit 0.

Keine menschliche Freigabe, kein Human Trial, keine Publikation/Deployment-Aussage. Eigene technische Nachweisführung und Hilfscode folgen Apache-2.0; eigene Landschafts-/didaktische Inhalte folgen der Repository-Zuordnung CC-BY-4.0. Amtliche Quellen behalten ihre Drittanbieterrechte; das Dossier behauptet keine zusätzliche Weitergabefreigabe.
