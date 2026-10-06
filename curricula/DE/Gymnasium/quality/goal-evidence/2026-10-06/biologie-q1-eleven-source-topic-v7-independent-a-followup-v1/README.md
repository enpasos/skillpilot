# Biologie Q1: gezielter unabhängiger A-Follow-up der elf v7-Quellenbindungen

**Elf KEEP, null REVISE.** Die elf früheren A-Abschnittscodebefunde sind für
genau den eingefrorenen Autor-v7-Eingang aufgelöst. Dies ist ein begrenzter
maschinenbasierter Quellenreview; native D-Freigabe und operative Integration
werden hier nicht erteilt.

## Tatsächliche Quellen- und Kontextprüfung

Die [elf Einzelentscheidungen](eleven-source-topic-corrections.independent-a-followup.review.json)
binden jeden früheren Befund, seine Quellen- und kanonische UUID, den tatsächlichen
JSON-Pointer und die gelesene Originalseite. Die Original-PDFs wurden unabhängig
in elf eng begrenzten Seiten erneut extrahiert. Drei unveränderte, eingefrorene
Originalseitenbilder wurden zusätzlich tatsächlich angesehen: TH physisch 28,
MV physisch 30 und ST physisch 42. Keine vollständigen Quellenbestände wurden kopiert.

| Quelle | Korrekturen | Unabhängig bestätigter tatsächlicher Kontext |
| --- | ---: | --- |
| SN | 2 | Lernbereich 1: Genetik, Klassenstufe 10; physisch 42–43, gedruckt 30–31 |
| TH | 3 | 2.2.1.3 Genetik; Klassenstufen 9/10 physisch 26, Genetik physisch 28–29, gedruckt 22–23 |
| MV | 3 | 3.2 Unterrichtsinhalte; Klasse 10 physisch 28, unnummerierte Klassische Genetik physisch 30/gedruckt 26 |
| ST | 3 | 3.5 Schuljahrgang 10 (Einführungsphase), physisch/gedruckt 42–43 |

Der MV-v7-Locator physisch 4 bezeichnet das tatsächliche Inhaltsverzeichnis.
Der echte Körperabschnitt 3.2 wurde zusätzlich physisch 17/gedruckt 13 gelesen;
diese zusätzliche Bindung verhindert die Verwechslung von Inhaltsverzeichnis
und Körperüberschrift. Es wird keine Nummer für „Klassische Genetik“ erfunden.

Die tatsächlichen Deltas beschränken sich auf `topicCode`, die explizite
Eltern-/Jahrgangsqualifikation in `sourceRef` und `sourceSectionContext`.
Originalrawtexte, Elternbullet, Quellen-ID, Ziel-UUID, DE/EN-Fachtext, Seiten,
Stage und Kursfelder sind exakt. Sämtliche Rawpassagen sind auf den unabhängig
extrahierten Originalseiten tatsächlich vorhanden. Alle elf Mappingbindungen
bleiben ausdrücklich `partial`, und die operationalisierten Aspekte bleiben
`isOfficialBullet:false` sowie `officialNumberingClaim:false`. BE/BB `3.7` bleibt
bytegenau erhalten und wurde nicht erneut fachlich geprüft.

## Gezielte tatsächliche native Reproduktion

Die [eigene native Ergebnisauswertung](independent-native-delta-and-full-view-checks.actual.json)
bindet den tatsächlichen neuen Lauf mit dem eingefrorenen, zuvor gelesenen
Probe-Werkzeug und den echten nativen SourceAtlas-/BookModel-Funktionen.
Es wird keine unabhängige Neuimplementierung des Algorithmus behauptet.

- SourceAtlas **390/390**, 22 Quellensichten, normaler Vertrag ohne Nennerüberschreibung; keine Auslassung.
- Reines BookModel **383→390**; Kandidaten-Digest exakt v6.
- Alle 383 alten WholeGoals, Ziel-/Seitenfingerprints und Quellenmitgliedschaften
  sowie die 67 geschützten strengen Seiten bleiben exakt.
- Alle 464 alten kanonischen IDs bleiben enthalten; als alter Feld-Delta bleibt
  ausschließlich der bereits geprüfte strukturelle Root-`contains`-Anhang.
- Beide DAGs: 472 Knoten, 966 `requires`- und 471 `contains`-Kanten, vollständig aufgelöst und azyklisch.
- Alle elf tatsächlichen korrigierten Quellen-UUIDs besitzen die erwarteten
  aktuellen nativen Zeugen für ihre exakt zugeordneten kanonischen UUIDs.
- Sieben vollständige Quellensichtvorschläge erhalten ihre bestehenden Zielmengen.
  Die beiden bestehenden GUI-/Level-2-Kompositionssichten bleiben **168→168**
  und **436→436** vollständige `target`-Mengen ohne Verlust. Diese Zahlen sind
  keine curricularAtomic-Nenner.

Ein PDF-Render, vollständiger Build oder globaler QS-Neulauf wurde nicht ausgeführt.
Die [exakten Eingangskontrollen](actual-input-closure-and-active19-preservation.json)
bestätigen die unveränderten 19 aktiven Checkpointbindungen und die historische
Byte-Erhaltung. Hashkontrolle ist nur Bindungsverifikation; die elf fachlichen
Quellenentscheidungen beruhen auf den tatsächlichen Originalseiten.

## Gültige Befunde weiterverwendet und offene Gates

Die sieben unveränderten Fachtext-, Atomaritäts-, minimalen Voraussetzung-,
Material-/UUID- und einzeln begründeten Memory-Befunde werden aus dem gültigen
v6-A-Review [exakt weiterverwendet](exact-seven-existing-science-atomicity-memory-reuse.json).
Die historischen Dateien bleiben unverändert. Keine Karte, kein Deck, kein
aktives Lernzielbild und kein nativer Gate-Record wurde hier geschrieben.

Vor Integration bleiben die aktuellen nativen D/P/A/M/V für sieben neue UUIDs,
die separate Bild-QS, die zweite unabhängige Beschreibungsprüfung und die
vollständige passende GUI-Superset-Registrierung erforderlich. Die bestehenden
GUI-Mengen sind erhalten; die sieben neuen Quellenaspekte sind dort damit noch
nicht operativ hinzugefügt. Eine sieben-Ziele-Sicht ersetzt keine vollständige
Lernendensicht. Status `ai_candidate`, `needs_human_review` und fehlende
Lernendenevidenz werden nicht aufgewertet.

Die gesamte ursprüngliche 3417-Mutation/Rekombination, die historische ST-Sek-I-
Fehlzuordnung, SH-Kohorten, BY-Onkologie/PCR und sonstige breite ursprüngliche
Quellenpflichten bleiben gesondert offen. ST bleibt echte gemeinsame Sek-II-
Einführungsphase; `rawCourseLevel:unspecified` ist unverändert. Keine globale
Quellenfreigabe oder Freigabe des alten kombinierten Vier-Ziele-Bild-Holds erfolgt.

Aktiv weiter **Biologie 67/383**, **Chemie 112/378**. Strenger Nettozuwachs **0**,
neue fachliche Abschlüsse **0**, wiederhergestellte aktive Bindungen **0**.
390 ist Kandidatennenner. Mathematik **807/807 M7** und Physik **478/478 M7**
bleiben geschützt. Menschliche Prüfung, Freigabe, Erprobung sowie Veröffentlichung
oder Deployment werden nicht behauptet.
