# G17: atomare Chemievoraussetzungen

Stand: 10. November 2026. Ausgangspunkt ist Main
`c2f0722545f51e53526651e0d7ee26a9e0fb64ae` nach Physik-PR #105.
Die notwendige kleine ID-Lookupkorrektur wird getrennt in
[PR #110](https://github.com/enpasos/skillpilot/pull/110) geliefert.
Der sichtbare Datenbranch heißt
`fix/g17-chemistry-atomic-prerequisites-v7-data`.
Der Checkpoint `6bff7dcb34` ist in
[Draft-PR #111](https://github.com/enpasos/skillpilot/pull/111) gesichert.
Der PR richtet sich bereits an Main; nach der getrennten Lieferung von #110
wird Main übernommen und der Lookupdiff entfällt aus dieser Lieferung.

## Mechanischer Graphnachweis

Alle 742 Chemieziele behalten IDs, Reihenfolge und sämtliche Felder außer
`requires`; die übrigen 20 kanonischen Dokumente bleiben bytegleich.
Die Migration materialisiert 578 bereits durch Cluster wirksame atomare
Anforderungen, entfernt danach 46 Kanten mit Clusterziel und elf Kanten mit
Clusterquelle und reduziert schließlich 673 redundante atomare Kanten.
Nach jeder Entfernung werden Vererbung und Zeugen neu aufgelöst.
Die vollständigen 6.194 atomaren Erreichbarkeitspaare bleiben erhalten.

Der Chemie-Auditor umfasst auch den tatsächlich vererbenden Overview-Vorfahren:
743 Knoten, 1.283 verbleibende Anforderungen, keine Minimalitätsbefunde.
153 `requires`-Arrays ändern sich netto; der geordnete Batch führt 181
Quellsnapshots, darunter 28 netto unveränderte Quellen. Die Registry behält
die beiden früheren Batches und ergänzt zwei belegte Legacy-Fortsetzungen.
Insgesamt sind 1.062 ursprüngliche Quellen dedupliziert gebunden.

Die öffentliche Python→Node-Zulassungsprüfung besteht in einem einzelnen
380,821-Sekunden-Aufruf unter dem bestehenden 600-Sekunden-Rahmen, ohne Mock,
Fallback oder Wiederholung. Sie prüft alle 742 aktuellen und ursprünglichen
Chemie-Fingerprints mit Compiler und unabhängigem Validator. Alle 27 alten
Applicability-Snapshots sowie die aktuellen Cachewerte bleiben unverändert.
Dieser Lauf fand vor den anschließenden Viewkorrekturen statt; seine damalige
Eingabestabilität wird nicht auf den späteren Checkout übertragen.

## Notwendige explizite Projektionen

Acht vorhandene `goalEntry`-Referenzen auf zwei Prüfungscluster werden zu
`canonicalSubtree` korrigiert. Ihre acht bereits verfassten atomaren Kinder
ersetzen die fehlerhafte Behandlung dieser Cluster als Atome in 22 Scopes.
Diese Zielmengenänderung ist eine eigene, belegte Referenzkorrektur.
Sie ändert keine kanonischen Ziele, Aufgaben, Assessmentverträge oder Mastery.

Anschließend erhalten 39 bestehende Views insgesamt 164 explizite
`prerequisiteOnly`-Referenzen. Zwei explizite HE-GK+LK-Views bewahren die
bisherigen kombinierten View- und Struktur-IDs sowie Wurzeln. Das ist nötig,
weil eine kombinierte Projektion mehr Targets als die Vereinigung der bereits
einzeln gefilterten GK-/LK-Projektionen enthalten kann. Die Zusammenstellung
bleibt authored; es gibt keine neue automatische Rollenvergabe.

Die tatsächliche Backend-Vorabprüfung vergleicht alle 182 Konfigurationen:
139 vollständige und dieselben 43 unvollständigen Scopes. Gegen den gesondert
korrigierten Ausgangsstand bleiben Ziel- und Atommengen, sichtbare Bäume,
Wurzeln und View-IDs gleich. 29.865 tatsächliche Rollenpaare und der vollständige
kontextuelle atomare Bedarf sind vor/nach gleich. Dieser frühe Nachweis ist
keine Frontier- oder Completion-Abnahme.

Die [eng begrenzte Watch-Aktualisierung](../g17-chemistry-atomic-watch-ack/receipt.json)
besitzt einen echten Rot-/Grün-Gegenfall: unveränderter Prüfer, 40 geänderte
Altzeilen, zwei neue Mitglieder, 120 unveränderte vollständige Altzeilen.
Sie ist kein Ersatz für einen G17- oder Meilensteinpass.

## Reproduktion und noch offene Abnahme

Die produktiven Tests prüfen den vollständigen Registry-Verlauf und die
aktuellen 21 kanonischen Dokumente; die sechste native Methode ergänzt die
fünf bisherigen vollständigen Vergleiche. Die regulären Aufrufe sind:

```bash
cd app
npx --no-install tsc -b --pretty false
npm run test:transitive-minimality
npm run quality:source-coverage-evidence:test
cd ..
python -B scripts/test_prerequisite_reduction_semantic_kind.py
cd backend
./gradlew test --rerun --tests com.skillpilot.backend.completion.FirstMathPrerequisiteReductionTest
cd ../app
npm run quality:curriculum-status
npm run check:curriculum-maturity-floors
```

Typecheck, Source-Evidence-Regression (10 Tests), Python-Bridge-Regression
(22 Tests, 809,522 Sekunden) und die beschriebenen Vorabprüfungen sind bestanden.
Die beiden ergänzenden Läufe haben zusammen 3.785 unveränderte Eingabebindungen.
Die vollständige normale TS-Kette besteht nach 2.699,401 Sekunden mit allen
3.652 Eingaben unverändert: drei V6-Batches, 4.507 Operationen, 1.062 ursprüngliche
Quellen und sämtliche 21 Dokumente; der finale aktuelle V7-Check bestätigt
dieselben Quellen, alle 27 Cache-Snapshots und 21 aktuelle Dokumente.
Die sechs nativen Methoden laufen noch. Diese TS-Abnahme liegt vor dem separaten
Quellenprüfer-Fix; die frische Remote-CI des endgültigen Heads bleibt gesondert
nachzuweisen.

Der normale CQR-Producer endet mit Exit 0 nach 1.100,558 Sekunden über alle
21 Kataloge. Der anschließende unveränderte Floorbefehl scheitert ehrlich:
Chemie erreicht M1 statt M7, weil CQR-003 neun als unbelegt gezählte atomare
Zuordnungen in sieben Jurisdiktionen meldet. Die übrigen neun Fachstände
entsprechen ihren Floors im erzeugten Bericht; das ist kein Pass des gesamten
Floorbefehls. Unter den 9.903 benannten Eingaben ändern sich ausschließlich
deklarierte Berichte. Der [konkrete technische Gegenbeleg](source-surrogate-path-diagnosis.json)
weist neun unveränderte akzeptierte Surrogatbeziehungen zu zwei tatsächlichen
Kantenreduktionen nach: Die betroffenen Ziele bleiben Targets, beide atomaren
Pfade bestehen weiter, nur die direkte `required by`-Textspur entfällt.
Der [kleine gemeinsame Quellenprüfer-Fix](source-surrogate-path-fix.json) ist
angewendet. Er prüft denselben bereits reviewten Endpunkt und Carrier über
tatsächliche aktuelle atomare Vorbereitungspfade. Quellenqualifikation und
rekursives Sourcebacking bleiben beim festen Carrier. Interne atomare Knoten
dienen als strukturelle Pfadzeugen; ihre Anwesenheit vergibt keine eigene
Quellenanerkennung oder Mastery. Beide Produktkonsumenten verwenden den Prüfer.

Die 15 Regressionen bestehen am finalen Kandidaten; derselbe Satz scheitert
am alten Code in vier echten Fällen. Ein tatsächlicher Vergleich aller
308 akzeptierten Beziehungen findet keine Regression und 23 bereits reviewte,
erhaltene Pfadbeziehungen, die der Direkttextvergleich verwarf: neun Chemie-,
zwölf Mathematik- und zwei Physikfälle. Keine Registryzeile oder Sourceentscheidung
wird geändert. Typecheck, normaler Source-Audit-Producer und vollständiger
Source-Audit-Check einschließlich aller 15 Regressionen bestehen anschließend
auf den angewendeten Produktdateien. Unter 3.656 benannten Eingaben ändern sich
ausschließlich die zwei erzeugten Source-Audit-Berichte; ihr Inhalt entspricht
dem bisherigen Bericht vollständig bis auf das Erzeugungsdatum.

Der [neue normale CQR-Lauf](regular-cqr-and-floors.json) samt Memory-Vorlauf
über alle 21 Kataloge besteht nach 946,318 Sekunden. Anschließend bestehen
sämtliche zehn unveränderten Floors; Chemie erreicht wieder M7. Unter den
9.905 Eingabebindungen ändern sich ausschließlich die beiden erzeugten
CQR-Berichte und deren bestehender Alias. Die gesamte Chemie-View-Mitgliedschaft
bleibt gleich. Der erste fehlgeschlagene Lauf bleibt erhalten. Der Daten-PR
bleibt bis zur vollständigen Abnahme ein Draft. Native6, frische PR-/Main-CI
und Chemie-Main-Lieferung sind offen.

Die [kompakte Belegübersicht](receipt.json) bindet den angewendeten Stand und
begrenzt jede Ergebnisbehauptung auf ihren tatsächlichen Prüfumfang. Astra Ultra
hat den vollständigen angewendeten Produktdiff statisch freigegeben.
Das harte G17-Gate in der Standard-Meilensteinprüfung und die endgültige
Abnahme aller zehn ursprünglichen Fachstände bleiben ausdrücklich offen.
Nächstes Fach nach Chemie ist Biologie.
