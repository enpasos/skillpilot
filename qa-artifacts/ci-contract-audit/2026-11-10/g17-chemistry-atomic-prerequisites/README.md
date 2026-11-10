# G17: atomare Chemievoraussetzungen

Stand: 10. November 2026. Ausgangspunkt ist Main
`c2f0722545f51e53526651e0d7ee26a9e0fb64ae` nach Physik-PR #105.
Die notwendige kleine ID-Lookupkorrektur wird getrennt in
[PR #110](https://github.com/enpasos/skillpilot/pull/110) geliefert.
Der sichtbare Datenbranch heißt
`fix/g17-chemistry-atomic-prerequisites-v7-data`.

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

Typecheck, Source-Evidence-Regression und die beschriebenen Vorabprüfungen sind
bestanden. Die vollständige TS-Kette, die sechs nativen Methoden und die
ergänzende Python-Regression laufen noch.

Der normale CQR-Producer endet mit Exit 0 nach 1.100,558 Sekunden über alle
21 Kataloge. Der anschließende unveränderte Floorbefehl scheitert ehrlich:
Chemie erreicht M1 statt M7, weil CQR-003 neun als unbelegt gezählte atomare
Zuordnungen in sieben Jurisdiktionen meldet. Die übrigen neun Fachstände
entsprechen ihren Floors im erzeugten Bericht; das ist kein Pass des gesamten
Floorbefehls. Unter den 9.903 benannten Eingaben ändern sich ausschließlich deklarierte Berichte. Die konkrete
technische Ursache wird untersucht; keine Untergrenze oder Quellenanforderung
wird dafür abgesenkt. Der Daten-PR bleibt bis zur Reparatur und vollständigen
Abnahme ein Draft. Frische PR-/Main-CI und Chemie-Main-Lieferung sind offen.

Die [kompakte Belegübersicht](receipt.json) bindet den angewendeten Stand und
begrenzt jede Ergebnisbehauptung auf ihren tatsächlichen Prüfumfang. Astra Ultra
hat den vollständigen angewendeten Produktdiff statisch freigegeben.
Das harte G17-Gate in der Standard-Meilensteinprüfung und die endgültige
Abnahme aller zehn ursprünglichen Fachstände bleiben ausdrücklich offen.
Nächstes Fach nach Chemie ist Biologie.
