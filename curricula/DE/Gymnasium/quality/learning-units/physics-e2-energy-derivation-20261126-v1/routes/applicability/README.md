# Task N: drei einzeln geprüfte Applicability-Warnungen

Die bestehende Annahmeregistratur erhält genau drei neue Einträge: APV-201 für
das Herleitungsziel und K3 sowie APV-203 für das Herleitungsziel. Die tatsächlichen
Diagnosen haben jeweils `dimension: jurisdiction` und kein `value`-Feld.
`warning-review.actual.json` begründet jede Entscheidung mit Quellen, aktueller
Katalogfassung und den vierzehn genehmigten Angeboten.

Hessen fordert die grafische Herleitung in E.2 (PDF 30), das Saarland die Herleitung
aus Bewegungsgesetzen, Newton II und Arbeit (PDF 10). In Sachsen gehört sie zum
verbindlichen LK-Inhalt (beibehaltenes PDF 56; aktuelle Ausgabe in Task M separat
bestätigt). Die GK-Empfehlung wird hier nicht zum regulären Angebot erhoben.
K3 ist eine eigene, freigegebene SkillPilot-Aufgabe für genau dieses Ziel.

Der Compiler nimmt beim neuen curricularen Ziel zusätzlich Zuordnungen über
seine Vorfahren auf, darunter die Cluster Energie, Erhaltungssätze und Physik.
Dadurch enthält sein Länderergebnis alle sechzehn Länder. Das ist kein Nachweis
einer amtlichen Herleitungsanforderung in den dreizehn zusätzlichen Ländern.
Die Annahme von APV-203 gilt genau dieser geerbten technischen Mehrmenge.

Die frischen Messungen trennen zwei Prüfungen: erstens die Ziel- und
Grundlagenrollen der tatsächlichen Ansichten, zweitens deren native Projektion
mit Kurs-/Dauerfiltern, Länderfilter und Begrenzung der Grundlagen. Beide neuen
Objekte erscheinen vor und nach dem Länderfilter ausschließlich in denselben
14 Ansichten: HE acht, SL vier, SN LK zwei. In den übrigen 76 Ansichten erscheinen
sie weder als Ziel noch als sichtbare Grundlage. Insbesondere erzeugt der
Länderfilter keine Zielmitgliedschaft; er kann projizierte Ziele nur entfernen.

`accepted-warnings.predecessor.json` bewahrt die vorherige Registratur
bytegenau. Alle 125 bestehenden Einträge bleiben in derselben Reihenfolge
unverändert. Der Nachlauf verlangt weiterhin alle 15 vorher akzeptierten
Physik-Warnungen und genau die drei neuen: 18 akzeptiert, null aktiv, null
veraltet. Die Messung verwendet die aktuellen nativen Diagnose- und
Schlüsselregeln; APV-202 bleibt eine nicht blockierende Diagnose.

Aus dem Repository-Wurzelverzeichnis:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/routes/applicability/measure-current-offer.mts --phase=after --check
```

Diese Akte stammt vom Autor der Quellen-/Ansichtsimplementierung. Sie ist keine
zusätzliche unabhängige Fachbegutachtung; die bereits getrennten Quellen-,
Inhalts- und K3-Prüfungen sind gebunden. Geändert werden nur die Annahmeregistratur
und diese Akte, keine Katalog-, Ansichts-, Compiler-, Quellen- oder Lernergebnisdaten.
