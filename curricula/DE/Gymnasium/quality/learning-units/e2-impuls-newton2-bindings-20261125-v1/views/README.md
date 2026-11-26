# E.2: Quellengebundene Zielrollen und Lernorte

Die Ergänzung nimmt drei atomare Kompetenzen einzeln in die tatsächlichen Physiksichten auf. `IMP` ist `53afbda1…`, `RATE-M` ist `ecbaa101…`, `RATE-I` ist `059c1adc…`. Eine kanonische Landeszugehörigkeit allein begründet keine Zielpflicht. Die vollständige Quellenentscheidung mit PDF-Pins, Seiten, Kurs- und Inhaltsgrenzen steht in [reviewedMomentumBindings](../../../../../../../scripts/generate_laender_physics_stage_views.sources.json). Retained Quellen und Mappings bleiben unverändert.

| Land | Neue Quellenziele | Quellenort und Grenze |
|---|---|---|
| Baden-Württemberg | IMP, RATE-M | Klasse 10, BP2016 V2, PDF 27–28. Die Intervallform trägt RATE-M; daraus folgt kein allgemeiner Tangentenauftrag für RATE-I. Die sichtbaren Themen nennen Klasse 10 innerhalb des beibehaltenen Jahrgangsbandes 9/10. |
| Bayern | IMP | LehrplanPLUS Ph10.2, offizielles Kapitel-PDF 218658, PDF 2. Der 1D-Einstieg erfüllt nicht zusätzlich die geforderte zweidimensionale Behandlung. |
| Berlin | Keine allgemeine Zielaufnahme | PDF 17/21: Jg. 11 an Integrierten Sekundarschulen und Gemeinschaftsschulen, Wahlpflichtthema 3.1.4, Auswahl mindestens drei aus fünf Themenfeldern. IMP und RATE-M sind dort bei Auswahl fachlich getragen. Die aktuellen gewöhnlichen Gymnasium-Sichten besitzen keinen passenden Schulform-/Wahlthema-Selektor. Erforderliche Kompetenzen bleiben Voraussetzungen. |
| Brandenburg | Keine allgemeine Zielaufnahme | Dieselbe Quelle: Jg. 11 an Gesamtschulen und beruflichen Gymnasien, dieselbe Auswahlgrenze. Keine Übertragung auf alle Gymnasialwege. |
| Bremen | IMP | E, GyO Physik 2022, PDF 15. Zentrale Stoßrechnungen tragen den elementaren 1D-Einstieg; qualitative 2D-Behandlung bleibt zusätzliche Quellenleistung. |
| Hamburg | IMP | Aktueller Gymnasium-Plan 2024, PDF 44, Jg. 10 „Mechanik III“. Vektorieller Impuls und Bilanzierung tragen IMP; optionale Stoßvertiefungen werden nicht zur allgemeinen Pflicht. Die alte retained 2011-PDF ist hierfür keine aktuelle Gegenquelle. |
| Hessen | IMP | E.2, PDF 30. Child 6 „Impuls und Stöße“: IMP steht vor Impulserhaltung. RATE-M/I bleiben erforderliche Vorbereitung der LK-Herleitung. |
| Mecklenburg-Vorpommern | IMP | Q 11/12, PDF 21–22. GK einfache Bilanzen; zusätzliche zentrale elastische/unelastische Stoßrechnungen sind LK. |
| Niedersachsen | Keine | Kein hinreichender vollständiger mechanischer Zweikörper-Rechenauftrag. Erforderliche Kompetenzen sind bedingte Erwerbsvoraussetzungen. |
| Nordrhein-Westfalen | IMP | E, KLP 2022, PDF 26/28. Die vorzeichenbehaftete Rechnung konkretisiert Vektorgröße/Bilanzierbarkeit und eindimensionale Stöße; das Quellenverb am Stoß lautet „beschreiben“. Keine zusätzliche Behauptung eines ausdrücklich gedruckten Zweiterm-Rechenauftrags. |
| Rheinland-Pfalz | IMP | MSS E, Grund-/Leistungsfach, PDF 25/52. Elementarer Einstieg in die geforderte Impulsbilanz. Das konditionale „Falls der Impuls …“ aus Sek I erzeugt keine allgemeine Sek-I-Zielpflicht. |
| Saarland | IMP | E, LP 2023, PDF 12: vektorieller Charakter und gerader zentraler Zweikörperstoß. |
| Sachsen | IMP, RATE-M, RATE-I, jeweils LK | Jg. 11, PDF 57–58. IMP im Erhaltungssatzbereich; die Raten im Newton-Bereich. RATE-I operationalisiert die gedruckte Differentialform elementar durch eine gegebene Tangente. Keine Übertragung auf GK. |
| Sachsen-Anhalt | IMP im LK/eAN | Q 11/12, PDF 79: Zweikörperstöße und auswertbare Impulsbilanzen. Die gAN-Nennung der Zustandsgröße auf PDF 54 wird nicht als Nachweis des vollständigen Zweikörperauftrags ausgegeben. |
| Schleswig-Holstein | IMP | E bei durchgängigem Unterricht, PDF 55: gA unelastisch, eA zusätzlich elastisch. |
| Thüringen | IMP | Regelzug Klasse 10, LP2012 PDF 23. Der gesonderte Zugang 11S wird nicht als dieselbe Gymnasium-Route ausgegeben. |
| National | Keine amtliche Zielaufnahme | Eigener Katalogstandard ohne nachgewiesenen amtlichen nationalen Einzelauftrag. Alle drei neuen Kompetenzen werden nur bei tatsächlichem Voraussetzungserfordernis gelernt. |

Die neuen Quellenziele werden ausdrücklich zugelassen. Andere gewöhnliche Ziele, bestehende Quellenauswahl, Prüfungsidentitäten und historische Supportrollen bleiben erhalten. Die notwendige Vorbereitung wird aus der vollständigen kanonischen `requires`-Hülle berechnet und mit `projectionRole: prerequisiteOnly` und `acquisitionPlacement: true` am tatsächlichen Verbraucher sichtbar. Das ist ein Lernort, kein neuer Quellenzielstatus und keine Anrechnung auf Lernergebnisse.

## Herleitung und Mathematikzeit

In Sachsen wechselt `f524f05c…` aus „Erhaltungssätze und ihre Anwendungen“ in den eigenen Abschnitt „Herleitung der Impulserhaltung nach der Differentialform“, weiterhin LK 11. Der Abschnitt folgt ausdrücklich dem neuen Ratenabschnitt. Dies respektiert den Unterschied zwischen dem Erhaltungssatz auf PDF 57 und der Differentialform auf PDF 58. In Sachsen-Anhalt wechselt die eigene LK-Herleitung aus E/Jg. 10 nach Q 11/12 in „Herleitung der Impulserhaltung nach den Analysisgrundlagen“.

Der neue kanonische Pfad lautet `f524 → RATE-I → b1dcc191`; RATE-I verlangt außerdem RATE-M. In der Physik-Alleinsicht erzwingt dieser Pfad Vorbereitung. In den kombinierten Sichten bleibt `b1dcc191` am nativen Mathematikort. Sowohl in Sachsen als auch in Sachsen-Anhalt ist dieser Ort das Band 11/12. Der Umzug in Sachsen-Anhalt beseitigt den eindeutigen Konflikt „Physik E10 vor Mathematik 11/12“. Ein gemeinsames Jahresband beweist keine streng frühere fächerübergreifende Kalenderbehandlung. Der konkrete Backend-Frontiernachweis ist vom unten dokumentierten Karten-/Strukturnachweis zu unterscheiden.

Vorhandene frühere Verbraucher können einen Quellenziel-Erwerb vor dessen Originalquellenort ziehen. Das Quellenziel bleibt mit seinem Originalbeleg gebunden; die Abweichung ist ein eigener Lernort. Die Generatorberichte und der Vorher-/Nachher-Vergleich weisen solche Fälle aus, insbesondere IMP in Sachsen-Anhalt.

## Nachweise und Reproduktion

[placements.actual.json](placements.actual.json) enthält für alle 90 Sichten die alten und neuen Orte der drei neuen und der drei betroffenen bestehenden Ziele, echte Rollen, vollständige Lernmengen sowie Mathematikdeltas. Die strukturbezogene Zählung vergleicht mit `1001aa2c7f`, dem Main-Stand vor den drei neuen Atomen. Sie ist als Python-Projektion bezeichnet. Der native Gegenlauf verwendet die tatsächlichen App-Funktionen für Composition View, Personal Curriculum, Navigation und Lernkarte. Er macht keine Aussage über eine reale Lernendenhistorie.

[hessen-children.successor.actual.json](hessen-children.successor.actual.json) ist der neue E.2-Kindstrukturstand. Der versiegelte Vorgänger bleibt byteidentisch und wird über seinen Hash gebunden. Es entstehen weder neue erklärte Learning Units noch Aufgaben-/Anrechnungsverträge.

[foreign-math-recheck.actual.json](foreign-math-recheck.actual.json) prüft jede der 1.036 behaltenen Fremdfachzeilen nach dem akzeptierten Verfahren vom 24. November: frühester aktueller Physikverbraucher, exakter Ort, jede kanonische Voraussetzungskante und tatsächlicher Mathematik-Ziel- bzw. Erwerbsplatz. Erst danach werden aktuelle Physik-Quellenpins erneuert. Historische Beobachtungshashes, Policy-Zeilen und sämtliche 100 Mathematiksichten bleiben erhalten.

```sh
python3 scripts/generate_hessen_physics_stage_views.py --check
python3 scripts/generate_hessen_physics_stage_views.py --check --duration-views
python3 scripts/generate_laender_physics_stage_views.py --check
python3 scripts/test_generate_hessen_physics_stage_views.py
python3 scripts/test_generate_laender_physics_stage_views.py
python3 curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/measure-views.py
python3 curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/verify-foreign-math.py
```

Quellenzuordnung, automatische Strukturprüfungen, native Kartenprojektion, fachliche Aufgabenabdeckung und Backend-Frontier sind verschiedene Nachweise. Die Aufnahme eines Quellenziels behauptet keine vollständige Prüfungsabdeckung. Fehlende echte Aufgabenabdeckung bleibt eine offene Qualitätsanforderung; sie wird weder durch einen erfundenen Bedarf noch durch einen schwächeren Gate beseitigt.

## Gemessene Sichtplätze

Von 90 Sichten halten 48 IMP, 5 RATE-M und 2 RATE-I als operative Ziele. In der vollständigen Lernmenge liegen IMP in 73, RATE-M in 35 und RATE-I in 32 Sichten. Alle bisherigen Ziel-IDs bleiben erhalten. In keiner der 90 Sichten ändert sich die Mathematik-Lernmenge. Das zählt angebotene Ansichten, keine Lernenden oder bestandene Kompetenzen.

| Geltungsbereich | Sichten | IMP Ziel / Lernen | RATE-M Ziel / Lernen | RATE-I Ziel / Lernen |
|---|---:|---:|---:|---:|
| DE-BB | 5 | 0 / 4 | 0 / 2 | 0 / 2 |
| DE-BE | 5 | 0 / 4 | 0 / 2 | 0 / 2 |
| DE-BW | 5 | 3 / 3 | 3 / 3 | 0 / 0 |
| DE-BY | 5 | 3 / 3 | 0 / 0 | 0 / 0 |
| DE | 5 | 0 / 4 | 0 / 2 | 0 / 2 |
| DE-HB | 5 | 4 / 4 | 0 / 2 | 0 / 2 |
| DE-HE | 10 | 8 / 8 | 0 / 4 | 0 / 4 |
| DE-HH | 5 | 3 / 5 | 0 / 2 | 0 / 2 |
| DE-MV | 5 | 4 / 4 | 0 / 2 | 0 / 2 |
| DE-NI | 5 | 0 / 4 | 0 / 2 | 0 / 2 |
| DE-NW | 5 | 4 / 4 | 0 / 2 | 0 / 2 |
| DE-RP | 5 | 4 / 5 | 0 / 2 | 0 / 2 |
| DE-SH | 5 | 4 / 4 | 0 / 2 | 0 / 2 |
| DE-SL | 5 | 4 / 4 | 0 / 2 | 0 / 2 |
| DE-SN | 5 | 2 / 4 | 2 / 2 | 2 / 2 |
| DE-ST | 5 | 2 / 4 | 0 / 2 | 0 / 2 |
| DE-TH | 5 | 3 / 5 | 0 / 2 | 0 / 2 |

[Native Kartenprojektion](native-projection.actual.json): 90 Physiksichten, 92 kombinierte Hauptpaare und 36 Mathematik-GK-Gegenproben. [Quellen- und Vorziehzeugen](source-placement-witnesses.actual.json) behalten Originalquelle und tatsächlichen früheren Lernbedarf getrennt.

## Quellenstreit und gezielte Korrekturen

[Elf Quellen-/Bedarfs-/Ortseinträge](source-demand-place-exceptions.actual.json) trennen neue Zielaufnahmen von geerbten Zielmengen. Bayern bindet IMP und die korrigierte Herkunft der Impulserhaltung ausdrücklich an Ph10.2. Der tatsächliche Erwerb bleibt in Klasse 8, solange der alte Kraftstoß-Verbraucher dort die Voraussetzung verlangt. Mecklenburg-Vorpommern und Sachsen-Anhalt zeigen entsprechend die amtliche Q-Quelle und den früheren eigenen Erwerbsbedarf über die behaltene Kreiselroute getrennt. Diese früheren Orte sind kein Beleg amtlicher E10-Pflichten.

In Saarland und Sachsen steht das neue IMP jetzt unter einer eigenen mechanischen Vorbereitung im bisherigen E-/LK11-Band. Die zwei saarländischen Sek-II-Sichten bündeln außerdem das vorhandene breite WHY-Ziel unter „Einstieg und mechanische Grundlagen“. Rolle und Jahr bleiben erhalten; kein bereits vorhandenes fachliches Ziel wird umplatziert. [Sechs korrigierte Sicht-Deltas](final-heading-delta-v2.actual.json) und [direkte Quell- und Bedarfszeugen](source-placement-witnesses.actual.json) binden die Änderung. Alle sechs früheren Sichtdateien wurden für die unabhängige Prüfung bytegenau gegen die vorher festgehaltenen SHA-256-Werte reproduziert.

Die alten Newton-II-Themen-/Jahrgangsfragen in BW, SL, SN und RP, die geerbten Impulserhaltungs-Zuordnungen sowie die amtliche Pflichtgeltung des vollständigen allgemeinen LK-Beweises werden nicht durch neue Behauptungen geschlossen. Die elf Einträge nennen Quellenbereiche, tatsächliche Orte und konkrete nächste Prüfungen. Die ursprünglichen unabhängigen Urteile bleiben erhalten. Die wissenschaftliche Tragfähigkeit eines eigenen Vertiefungsziels ist von einer überall amtlich vorgeschriebenen Pflicht zu unterscheiden.

## Tatsächliche Rückpfeile vor und nach H

[backflows.actual.json](backflows.actual.json) vergleicht alle verschachtelten Kartenebenen und die atomaren Zeugen gegen Main `1001aa2c7f`. Der unveränderte historische Compiler-Prüfkontext ergibt vor und nach H in 90 Sichten und 356 Vorschau-Ebenen dieselben zehn verschiedenen zusammengefassten Rückpfeile mit 32 Vorkommen. Kein Rückpfeil und kein atomarer Zeuge kommt hinzu oder entfällt.

Der getrennte Task-G-Kontext mit deterministisch geschlossenem Personal Curriculum ergibt in der Physik-Alleinsicht und der nach Physik gefilterten kombinierten Sicht jeweils null Rückpfeile vor und nach H. Ungefiltert behalten die 92 kombinierten Paare 16 zusammengefasste Rückpfeile mit 87 Vorkommen. Die Mathematikansicht enthält davon einen Rückpfeil mit sieben Vorkommen. Die zusätzliche Kombination Physik-LK mit Mathematik-GK behält ungefiltert 13 Rückpfeile mit 55 Vorkommen. Auch dort ändern sich weder die Pfeilmengen noch die atomaren Zeugen. Sämtliche Landeswerte, Hessen-Dauermodelle, SN/ST und die nationale Vergleichsgruppe sind ausdrücklich getrennt erfasst. Diese Ergebnisse behaupten keine abgeschlossene allgemeine F6-Reparatur oder aktivierte reale Stufenpläne.

[Fokussierte automatische Prüfungen](checks-v2.actual.json) unterscheiden die Generator- und Zeugenprüfungen von den unabhängigen Fachurteilen. Die vollständige Frontend-/Backend-CI und die endgültige Quellenabnahme werden vom koordinierenden Arbeitsstrom gebunden.

## Korrektur der ersten Überschriftenfassung

Die erste Überschriftenfassung ist ausdrücklich verworfen: Sie hatte in den zwei saarländischen GK-Sichten vorhandene Erwerbsreferenzen aus ihren bisherigen Vorbereitungs-Untergruppen heraus normalisiert. Die alte Aussage über unveränderte fachliche Zielorte erfasste diesen zusätzlichen Effekt nicht. Die [exakten alten und verworfenen Rohpaare](source-review-predecessors/rejected-pairs.actual.json) sowie das erste Delta bleiben als Prüfgeschichte erhalten.

Die aktuelle Fassung erhält sämtliche bisherigen Ziel- **und** Erwerbsreferenzorte, Rollen und Knotentypen. Nur IMP und die ausdrücklich genehmigte breite WHY-Einordnung in den zwei saarländischen Sek-II-Sichten wechseln ihren Unterabschnitt. Der Generator prüft diese vollständige Grenze und behält bei gleicher Geschwistermenge und identischer expliziter Teilordnung deren bisherige Darstellungsreihenfolge bei. Er verändert dafür weder Mitgliedschaften noch `after`-Beziehungen. Der Regressionstest enthält das tatsächlich verworfene Gegenbeispiel.

Die sächsische Quellenmetadaten-Korrektur trennt IMP auf PDF 57, den begrenzten mittleren-Kraft-Zugang auf PDF 57–58 und die Differential-/Tangentenleistung auf PDF 58. Zwei Ziele unter derselben Newton-Überschrift erhalten deshalb eigene Primärpassagen; die letzte Passage überschreibt die andere nicht. [Aktuelle Quellenbindung](current-source-binding.actual.json) prüft fail-closed alle 66 aktuellen Sichthashes in den elf Ausnahme-Einträgen und beide Belegformen der sechs sächsischen Zielplätze gegen die aktuelle Rohpolicy. Sie ist eine technische Konsistenzprüfung und ersetzt kein unabhängiges Fachurteil.

Der vollständige Mathematik-Dauersichten-Lauf wurde mit dem vorhandenen Projekt-CI-Runtime Node 20.20.2 erfolgreich ausgeführt. Der erste Versuch mit dem voreingestellten Node 18 scheiterte an der fehlenden Unterstützung für `import.meta.dirname` im letzten nativen Verbrauchertest; der unveränderte Test besteht mit dem festgelegten Runtime. Die Rohlogs dieses Versuchs bleiben außerhalb des Repositorys.
