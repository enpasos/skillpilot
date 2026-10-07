# BW B007: unabhängige Quellenprüfung B v5

## Ergebnis und Umfang

**KEEP für die exakt geprüften URL- und Seitenangaben.** Unabhängiger B-Review des unveränderten Author-v5-Freeze `55eda10424162ec765a96eef919fd2d055355cc9c53617a7bfa6ee0ba1c2d87e`. Keine Autorenrolle in diesem Kandidaten, keine neuen Peer-Ergebnisse gelesen, keine Unteragenten. 43 eigene Authorpfade wurden relativ zum Author-Dossier aufgelöst; zusätzlich wurden 28 gebundene Eingänge gegen tatsächliche Bytes geprüft.

| Separater Kandidat | Tatsächliche Änderungen | Entscheidung |
| --- | --- | --- |
| Sek-I ursprünglicher Absatz-(3)-Subset | URL + eine `sourceRef`, 2 Felder | KEEP im engen Umfang |
| Sek-II URL-only | dieselbe URL, 1 Feld | KEEP für Versionsrouting |
| Sek-I ausdrücklich getrennte Alternative (3)–(10) | URL + acht `sourceRef`, 9 Felder | KEEP im Acht-Absatz-Umfang |
| B007-v4-Kanonbasis | fünf `provenance.sourceRef` | KEEP gegen diese eigene Basis |
| Aktuelle 127er-Kanonbasis | dieselben fünf `provenance.sourceRef` | KEEP gegen die aktuelle eigene Basis |

Den Absatz-(3)-Subset **oder** die Acht-Absatz-Alternative auswählen; ihre Operationen nicht mischen oder doppelt zählen. Im ursprünglichen engen Subset bleiben die falschen S.-15-Angaben für (4)–(10) offen. Überschrift und (1)/(2) bleiben unverändert S. 15. Andere Quellenangaben, einschließlich (11), liegen außerhalb dieser Prüfung.

## Tatsächliche amtliche Quelle

Beide HTTPS-PDFs wurden unabhängig erneut abgerufen (HTTP 200, `application/pdf`, ohne Weiterleitung). Die [amtliche V2-Datei](https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf) trägt „Überarbeitete Fassung vom 25. März 2022“ und stimmt bytegenau mit der gebundenen lokalen V2-Primärquelle überein:

- V2: `3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62`, 2.155.781 Bytes.
- Der [alte aktive URL](https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.pdf) liefert die andere ursprüngliche 2016-Datei: `ce15e94278f5c5d930039e0cdf8e6b3fabc8d31922fd1f7476b5af282ea3d031`, 3.468.712 Bytes.

Die beiden SourceDocument-Objekte waren bereits gleich auf V2 benannt, geschlüsselt und lokal gebunden. Ausschließlich ihr identischer URL wird korrigiert. Diese Versionsprüfung bestätigt keine vollständige fachliche Sek-I-/Sek-II-Extraktion.

Die eigenen Raster der tatsächlich heruntergeladenen V2 wurden persönlich angesehen:

- **Physisch 17 / gedruckt 15:** Überschrift `3.2.1.2 Stoffe und ihre Teilchen`, Einleitung, Absätze (1)/(2), sichtbare Klassenqualifikation 8/9/10.
- **Physisch 18 / gedruckt 16:** Absätze (3)–(10), einschließlich der jeweiligen Operatoren und Klassenqualifikation 8/9/10. Die Seitenkorrekturen auf 16 sind richtig. Quellentexte, Operatoren, Tags, Sek-I-Stufe und `courseLevel: unspecified` bleiben exakt.

Die Raster stehen unter `sources/V2-actual-17.png` und `sources/V2-actual-18.png`, das unabhängige Abrufprotokoll in `actual-official-https-pdf-retrieval.independent-b.json`. Die amtlichen Dateien behalten ihre eigenen Rechte.

## Aktueller Schutz und Bindungen

Der gebundene zentrale Bericht enthält **127/378** streng abgeschlossene Chemieziele. Alle 127 ganzen aktuellen Eingangsziele wurden gegen den Live-Kanon und den Snapshot geprüft. In der aktuellen Metadatenalternative bleiben **123 Ganzziele exakt**; vier ändern ausschließlich `extendedData.provenance.sourceRef`:

- `988888bb-1f88-55f9-9a44-f3f60469a297`
- `5338b54c-68bc-5892-907c-e025351ffde6`
- `5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf`
- `78109f6d-c415-52c4-8314-07c0dd888a80`

Hinzu kommt das Cluster `10ce2814-8796-5633-9bed-f6990d039b91` mit demselben Locatorfeld. Texte, Graph, Bilder und Status bleiben gegen die aktuelle Basis exakt. **Keine Behauptung ganzer 127er-Gleichheit nach dieser Änderung.** Aktuelle Ziel-/Seiten-/Kontext-/Quellen-/Versionsbindungen sind bei einer Integration gezielt zu prüfen. Tatsächlich unveränderte native Bindungen erlauben gezielte Wiederverwendung gültiger Nachweise; diese Metadatenprüfung erteilt keine neue D/P/A/M/V-Freigabe.

Die B007-v4-Basis ist ein eigenständiger älterer Kandidat. **Zwölf geschützte aktuelle Ganzziele unterscheiden sich von dessen voller Payload**, unter anderem bei Voraussetzungen und den später integrierten Text-/Bildkorrekturen. Den aktuellen Kanon niemals durch diese alte Vollpayload ersetzen; ausschließlich geprüfte Feldänderungen mit aktuellen Vorwertbedingungen übertragen.

## Mapping, Reichweite und offene Grenzen

Die ganzen aktiven Review-/Runtime-Mappingdateien, ihre Status, Reviewer-/Datumsangaben, Matchtypen und IDs bleiben exakt. Der Absatz-(3)-Subset hat drei unveränderte `partial`-Mappingzeilen. Die getrennte Acht-Absatz-Alternative hat **15 Zeilen, zwölf direkte kanonische Ziele und acht historische Entscheidungszeilen**. Vier dieser direkten Ziele liegen im aktuellen strengen 127er-Set. Eine rein strukturelle `contains`-Traversal erreicht potenziell acht geschützte Ziele; das ist keine fachliche Quellenabdeckung und keine kompilierte Projektion.

Die tatsächliche BW-Sek-I-View bleibt bytegenau. Ihre zwei `goalEntry`-Referenzen bei `0.28` und `0.51` behalten die Zielrolle. Die offenen CPV-009-Befunde betreffen die **prospektive B007-Clusterkonversion**, keine hier behaupteten aktuellen Fehler der reinen Metadatenalternative. Fachliche Facetten und Auswahl von Kindern bleiben offen.

Erhaltene Grenzen: **403 Quellenpflichten, 413 gematchte Originalzeilen, 40 betroffene Quellenviews** aus der gebundenen bestehenden Vorbereitung, ohne neuen globalen Recount. Keine dieser Grenzen wurde gelöscht. Qualitatives BW-(3)-Beschreiben begründet keine quantitative Sättigungsroutine; bestehende HE-Fakultativ-/NI-Qualitativgrenzen werden unverändert weitergeführt. Ganze SourceAtlas-, native Buch-/D/P/A/M/V- und GUI-Superset-Gates bleiben separat erforderlich. Keine globalen Builds oder neuen fachlichen Reviewstarts.

## Nachweise und Bilanz

- `independent-b-source-locator-version-verdict.json`: eigene fachliche Einzelentscheidungen und Grenzen.
- `source-url-locator-canonical-and-current127.actual-independent-b.json`: tatsächliche Deltas, vollständiger 127er-Abgleich, Mapping- und View-Reichweite.
- `verify-source-deltas-reach-and-current127.independent-b.py`: gezielter eigener Prüfer, Exit 0.
- `independent-b-bw-source-locator-version.final.freeze.json`: Payload und unveränderte externe Eingänge.

**Netto 0**, neue fachliche Abschlüsse 0, wiederhergestellte aktive Bindungen 0, entfernte Quellen-HOLDs 0. Keine aktiven Änderungen. Keine menschliche Freigabe, Erprobung oder tatsächlichen Lernernachweise behauptet. Nächster Schritt: Root prüft beide unabhängigen Quellenreviews, wählt exakt eine Quellenalternative und führt betroffene native Bindungs-QS vor einer Integration aus.
