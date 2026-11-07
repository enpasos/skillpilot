# Abgeschlossener V-Originalkontext-Census und begrenzter Folgeplan

Stand: 7. November 2026. Dieses Paket sichert den endlichen Abgleich der fünf
aktiven V-Ledger dauerhaft. Es enthält keine neuen Bildreviews, keine aktiven
QA-Änderungen und keine native Freigabe. Die bisherigen 105 Familienfälle und
18 Receipt-Kandidaten bleiben unverändert.

| Fach | Nenner | Bestehendes Profil: Kandidaten | Originalkontext passend, Adapter offen | Originalkette offen | Text abweichend | Asset abweichend |
|---|---:|---:|---:|---:|---:|---:|
| Mathematik | 832 | 2 | 133 | 680 | 14 | 3 |
| Physik | 509 | 0 | 4 | 503 | 2 | 0 |
| Chemie | 478 | 0 | 155 | 308 | 13 | 2 |
| Biologie | 397 | 0 | 355 | 41 | 1 | 0 |
| Wirtschaftswissenschaften | 346 | 16 | 298 | 18 | 14 | 0 |
| Gesamt | **2.562** | **18** | **945** | **1.550** | **44** | **5** |

Die 2.483 `curricularAtomic`-Zeilen verteilen sich auf **18 / 937 / 1.481 / 42 /
5**, die anderen 79 auf **0 / 8 / 69 / 2 / 0**. Die zweite Gruppe bleibt im
Nenner und erhält keine erfundene gewöhnliche Zielrolle. `goal-disposition-index.json.gz`
enthält pro Ziel diese Trennung, aktuelle Pins, sämtliche belegten Originalketten,
ihre ursprünglichen Entscheidungen und zusätzliche Metadaten-Holds. Die fünf
Endklassen sind disjunkt; mehrere historische Ketten eines Ziels sind es nicht.

**963 passende Originalkontexte sind keine 963 nativen Freigaben.** Die 945
Adapterfälle wurden auf den tatsächlich vorhandenen ursprünglichen DE-Text und
das ursprüngliche Bild bezogen; vorhandene ursprüngliche EN-Felder wurden ebenfalls
verglichen. Fehlende historische EN-Felder werden nicht ergänzt. Niveau- und andere
profilspezifische Felder, tatsächliche mobile Inspektionen, Entscheidungsautorität
und vollständig geschlossene Formatverträge muss der jeweilige Adapter zusätzlich
prüfen. Eine ganze Quelldefinition in einem Reviewinput ist keine automatische
Gleichheitsfreigabe für Vorbereitung, Scope, Assessment-Coverage oder D/P.

## Zusätzliche Attribution und Zeitgrenzen

Innerhalb der 945 passenden Kontexte sind diese drei Klassen ebenfalls disjunkt:

| Ursprüngliche Metadaten | Ziele | Behandlung |
|---|---:|---|
| Mindestens eine passende Kette mit ursprünglichem Actor und konkreter Zeit | 853 | Geschlossener Adapter weiterhin erforderlich. |
| Actor vorhanden, nur ursprüngliches Datum ohne Uhrzeit | 60 | Datum unverändert erhalten; kein erfundener Zeitstempel. |
| Actor oder ursprüngliche Zeit bislang nicht ausreichend gebunden | 32 | Hold bis authentische Ergänzung oder echter neuer Review. |

Die 60 Datumsfälle sind 16 Mathematik- und 44 Wirtschaftsziele. Das aktuelle
Receipt-Schema verlangt `reviewedAt` als `date-time`; diese Fälle können dieses
Feld nicht wahrheitsgemäß durch Mitternacht, Commitzeit oder heutige QA-Zeit
erfüllen. Ein ausdrücklich geprüfter geschlossener Nachfolger muss die ursprüngliche
Datumsgranularität darstellen, andernfalls ist ein neuer tatsächlicher Review
nötig. Es gibt keinen Schema- oder Policywechsel durch diesen Census.

Die 32 weiteren Holds betreffen acht Chemie-, 23 Biologie- und ein Wirtschaftsziel;
alle sind `curricularAtomic`. Die ursprüngliche Metadateninventur mit 913 erfassten
Actor-/Zeitangaben bleibt bytegleich erhalten. Der separate
`original-time-granularity-addendum.json.gz` präzisiert darin die 60 Datumsfälle.
Ein originaler UTC-Text oder ein explizites Beobachtungsfenster darf nur durch eine
fest definierte, verlustfreie und geprüfte Formatabbildung ausgewertet werden;
das Original bleibt erhalten. Auch die 853 sind noch keine qualifizierten Receipts.

## Belege und Reproduzierbarkeit

`five-ledger-disjoint-context-census.json.gz` und `summary.json` sind die
unveränderten Schlussartefakte. `non-chemistry-original-context-chains.json.gz`
enthält 888 erhaltene Familienrecords; `chemistry-chemie-original-chains.json.gz`
enthält 185. Diese Recordzahlen sind keine Zahl unterschiedlicher positiver
aktueller Freigaben. Negative und abweichende Originale bleiben sichtbar.

Die vollständige 478er-Chemietabelle wurde ausschließlich verlustfrei umgepackt:
77.030.964 ursprüngliche JSON-Bytes mit SHA-256
`b50bd94f85231af63bcd72adfe8337549b1b20d6666b09512c749efed71b892e`
liegen als `chemistry-chemie-478-context-census.json.xz` vor. Die ursprünglichen
gzip-Bytes hatten den Hash
`0f7d21c6f844e7deffc78ab69eba9d247d0a8553d48bbb92b00ef2121f4dc1af`;
der neue Transport hat einen eigenen Hash. Keine ursprünglichen Felder oder
Kandidatenlocators wurden entfernt. `chemistry-lossless-xz-receipt.json` bindet
beide Transporte und die tatsächliche Bytegleichheit nach Dekompression.

`family-originals-and-reproduction-scripts.tar.gz` bewahrt die bytegenauen
Familienartefakte unter ihren SHA-Dateinamen sowie die verwendeten Skripte.
`durable-locators.json` löst ehemalige RAM-Locators auf diese dauerhaften Kopien
auf. Ein Locator-Nachfolger ändert weder Originalentscheidung noch Originalhash.
Die originalen Review-, Input- und Assetreferenzen behalten ihre jeweils
festgehaltenen Gitcommits und SHA-Werte. Ein Archivcommit ist kein Reviewdatum.

Die Discovery bleibt auf Git `7ab16f4afc45b3f384577e04b5ba85b680a7678d` begrenzt:
124.615 ausgewählte committed Dateien, 89.417 mit aktuellen Ziel-IDs, 112.195
strukturierte Kandidatenrecords aus 87.956 Dateien und 4.411 aufgelöste Aliasse.
Die Pins des großen Discovery- und Suchindex stehen in `summary.json`; deren
Rohdaten werden nicht nochmals in diesem kleinen Paket dupliziert. Konkrete
Originalverweise wurden zusätzlich familienweise verfolgt. Nicht untersucht
wurde jeder gelöschte historische Blob, private Sitzungsverlauf oder alte
ungetrackte Tempbestand. Ein Hold bedeutet daher, dass im erklärten Korpus keine
ausreichende Kette geschlossen wurde, nicht dass sie nirgendwo existieren könnte.

Die 5.124 aktuellen Public-/Canonical-Bildpfade wurden tatsächlich gehasht. Alle
16 aktiven Source-, QA-, Kind- und Registry-Pins blieben unverändert. Der kleine
Paketprüfer kontrolliert die gesicherten Bytes, disjunkten Nenner und Verweise:

```bash
python qa-artifacts/ci-contract-audit/2026-11-06/visualization-five-ledger-original-context-census-2026-11-06/verify-census.py --check-current-inputs
```

Ohne `--check-current-inputs` prüft er das historische Paket auch nach späteren
echten Quellenänderungen. Er ist kein V-Inhaltsprüfer oder nativer Receiptvalidator.

## Konkreter Folgeplan

1. **Vorhandene Ketten formatweise schließen.** `historical-reader-worklist.json.gz`
   ordnet die 945 Ziele genau einmal 159 bestehenden Format-/Familiengruppen zu;
   diese Routinggruppen sind weder 159 neue Adapter noch freigegebene Profile.
   Alle alternativen Originalketten bleiben referenziert. Wiederverwendbare
   Reader werden erst nach Vergleich der tatsächlichen Feldformen gebildet.
   Priorität haben die zwei großen Wirtschaftsformen: eingebetteter DE-Text mit
   drei tatsächlichen Bildansichten (98 Ziele) und eingebetteter DE-Text mit
   `inspections[]` (48 Ziele). Der aktuelle kleine Implementierungsschritt kann
   daraus je eine vollständige Familie auswählen, beispielsweise die 20 passenden
   Q3-Ziele und die 16 Trade-/Finance-Ziele. Das gibt die übrigen Familien nicht frei.
2. **Jedes Format mit tatsächlichen Originalen und Gegenfällen belegen.** Der
   Reader bindet den Originalreview, den darin eingebetteten oder ausdrücklich
   gehashten Originalinput, die exakte Owner-/Zielassoziation, das tatsächlich
   betrachtete Asset und die originalen Ansichtsbelege. Die feste profilabhängige
   Feldabbildung liest Entscheidung, Actor, Zeitgranularität und Begründung direkt
   aus dem Original. Sie akzeptiert keine frei wählbaren Autoritätspointer.
   Originaltext-, Asset-, Owner-, Inputhash-, Entscheidung-, Attribution- und
   Zeitmanipulationen müssen tatsächlich fehlschlagen; alternative Ketten dürfen
   nicht zu einem erfundenen Gesamtoriginal zusammengefügt werden. Der getrennte
   authentifizierte Git-Reader liefert die Byteautorität unter einem externen
   akzeptierten Commit. Diese Inventur ersetzt seine Sicherheitsprüfung nicht.
3. **Weitere geschlossene Formate klein bearbeiten.** Es folgen die 42 Wirtschafts-
   Seal-/Kontextketten, die 48 passenden Mathematik-Records der originalen
   `current62`-Teile sowie die wiederkehrenden Biologie-/Chemieformen mit gehashtem
   Zieleingang und erstem unabhängigen V-Urteil. Die einzelnen Familien und
   Originalrefs stehen vollständig in der Worklist und den Kettentabellen.
   Ein eingebetteter Zieltext, ein verknüpfter ganzer Zieleingang und ein
   tatsächlich begründeter späterer Kontextreview sind getrennte Formen.
   Technische Adoption, D/P, Generierungsbelege und bloße Gitnähe erhalten kein
   V-Entscheidungsrecht. Markdown-Originale benötigen einen begrenzten expliziten
   Vertrag; ein allgemeiner Parser positiver Prosa ist keine sichere Abkürzung.
4. **Offene aktuelle Kontexte tatsächlich neu prüfen.** Die zweite Worklist enthält
   genau 1.599 Ziele, davon 1.528 `curricularAtomic` und 71 andere. Zuerst die 49
   konkret abweichenden Text-/Assetfälle, danach geschlossene fachliche Batches
   der 1.550 im geprüften Korpus offenen Ketten: Mathematik insgesamt 697,
   Physik 505, Chemie 323, Biologie 42, Wirtschaft 32. Ein neu vorgelegtes
   authentisches Original kann einen einzelnen Hold noch schließen; eine weitere
   offene Suche ist nicht Bestandteil dieses Plans. Bei den zusätzlichen 32
   Metadaten-Holds braucht es eine konkret gebundene authentische Ergänzung oder
   ebenfalls einen neuen Review. Bei den 60 Datumsfällen ist zuerst der explizite
   Formatvertrag zu klären, nicht automatisch neu zu prüfen.
5. **Neue Reviews als neue Reviews ausführen.** Ein eingefrorener aktueller
   Eingabebatch enthält die tatsächlichen Zieltexte und Darstellungsfelder,
   Owner-/Ziel-ID, Assetbytes und Hashes. Die beauftragte Person oder KI betrachtet
   die tatsächlichen Pixel und erforderlichen Größen, beurteilt fachliche
   Passung, Lesbarkeit und Perspektive und protokolliert ihre eigene Entscheidung,
   Attribution und tatsächliche Zeit. Sie darf unveränderte Bilder erneut
   akzeptieren; fehlende Originalbindung erzwingt keine Bildgenerierung.
   Historische Entscheidungen bleiben historisch, menschliche Prüfung und
   Lernwirksamkeit werden nicht behauptet. Der eigenständige echte Diagramm-B-
   Review bleibt separat und wird nicht als bereits angewandte Quelle ausgegeben.
6. **Erst nach Readerprüfung qualifizieren und integrieren.** Für genau die
   erfolgreich geprüften Receipts werden heutiger Kontext, Quellenstand und
   Asset erneut nativ validiert. Aktive QA-Einträge erhalten keine bloße neue
   Beschreibung mit alter Freigabe. Vor einer Integration sind vorhandene
   Verbraucher und die tatsächlichen betroffenen V-/M7-Lanes zu prüfen. Dieser
   Plan selbst setzt keine Quelle, QA-Zeile, Maturity oder Floor auf grün.

Der Abschluss ist endlich. Es gibt keinen neuen Suchauftrag, keinen neuen
Bildreview und keine Source-, QA-, Scope-, Mastery- oder Runtimeänderung durch
dieses Paket.
