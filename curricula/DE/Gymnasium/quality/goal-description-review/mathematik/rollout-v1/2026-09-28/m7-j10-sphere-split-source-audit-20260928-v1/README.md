# J10-Kugelziel: umgesetzter Split und Quellrouten-Audit

Stand: 28. September 2026. Der fachliche Split ist im Arbeitsstand umgesetzt.
Alle Nachweise dieses Ordners sind KI-Arbeit; sie sind keine menschliche
Freigabe, keine Erprobung im Host und für sich allein kein M7-Abschluss.
Die zentrale D/P/V-Einbindung und der frische Fünf-Gate-Bericht werden getrennt geprüft.

Der alte Mischknoten `1ea06c0c-5c60-45cd-8f31-638de98820b4` bleibt als
Navigationscluster mit seinem vorhandenen Übersichtsbild bestehen. Zwei neue
Kinder trennen die unabhängig beurteilbaren Größen. Die Kugelhaut ist eine
Fläche und skaliert quadratisch; der Kugelraum ist ein Volumen und skaliert
kubisch. Die Texte verlangen altersgerechte geometrische Plausibilisierung;
Integralrechnung ist keine Voraussetzung. Die verbindlichen neuen Texte sind:

- `7b01d3d8-1fff-5924-b133-5a4825dc742e` — **Oberfläche von Kugeln deuten und bestimmen** / Interpret and determine the surface area of spheres
  - DE: Die lernende Person kann die Struktur der Kugeloberflächenformel $O=4\pi r^2$ geometrisch plausibilisieren, die Formel für einfache Hüll- und Beschichtungsfragen mit Radius oder Durchmesser anwenden und Flächeneinheit sowie quadratische Skalierung begründen.
  - EN: The learner can give a geometric plausibility argument for the sphere surface-area formula $O=4\pi r^2$, apply it to simple covering and coating questions from a radius or diameter, and explain the area unit and quadratic scaling.
- `bb227e31-0b0b-544a-b5e0-548256a70dec` — **Volumen von Kugeln deuten und bestimmen** / Interpret and determine the volume of spheres
  - DE: Die lernende Person kann die Struktur der Kugelvolumenformel $V=\frac43\pi r^3$ geometrisch plausibilisieren, die Formel für einfache Füll- und Rauminhaltsfragen mit Radius oder Durchmesser anwenden und Volumeneinheit sowie kubische Skalierung begründen.
  - EN: The learner can give a geometric plausibility argument for the sphere-volume formula $V=\frac43\pi r^3$, apply it to simple capacity and spatial-volume questions from a radius or diameter, and explain the volume unit and cubic scaling.

## Quellen und sichtbarer Umfang

`source-edge-routing-90.json` dokumentiert jede der 90 alten direkten Kanten
in 14 Landes-Reviews mit dem tatsächlichen Quelltext und der Entscheidung.
25 Quellzeilen stützen die Kugelkompetenz partiell: zwei nur das Volumen,
23 beide Größen. Bei 65 sachfremden oder zu frühen Quellzeilen wurde nur die
falsche Kugelkante entfernt; ihre anderen kanonischen Ziele bleiben erhalten.
Keine alte Sammelkante wurde ungeprüft auf die Kinder kopiert. Die BY-Zeile
M10.5 trägt zwei partielle Kindkanten; auch ihre Quellentscheidung ist jetzt
`partial`, dokumentiert in `source-decision-match-type-corrections.json`.
Zusätzliche direkt gelesene BB-/BE-Kugelzeilen sind in
`additional-bb-be-direct-source-routing.json` dokumentiert.

MV enthielt eine fehlerhafte Extraktion: Aus der amtlichen Körperliste waren
unter anderem die Kugel und zwei Stumpfkörper weggefallen. Lokaler PDF-Text,
die visuelle Tabelle (gedruckte Seite 40, PDF-Seite 43) und die erreichbare
amtliche Primärquelle bestätigen den Inhalt. `mv-source-row-correction.json`
bindet die Korrektur an PDF-Hash, stabile Quell-ID, Fundstelle und URL. Der
sichtbare Umfang von MV wurde bewahrt; alle 16 Länder bleiben abgebildet.

`legacy-runtime-routing.json` bindet die vier alten Laufzeitmappings neu.
Die Kinder haben jeweils direkte partielle Quellnachweise und eine
`applicabilityMappingInheritance: boundary`; der alte Cluster besitzt dieselbe
Grenze. Breite Vorfahren liefern somit keinen unkontrollierten Quellenbeleg.
Ein alter Mastery-Wert des Mischziels wird keinem Kind zugesprochen; partielle
Laufzeitmappings zertifizieren die neuen Kinder ebenfalls nicht.

`view-reference-routing-23.json` dokumentiert 23 direkte Landes-/Daueransichten.
Sie expandieren den stabilen Cluster am bisherigen Ort. Die separate
Atlasnavigation wurde genauso erweitert (`atlas-navigation-routing.json`).
`duration-layout-adjudication.json` bindet die sechs neuen Splitplatzierungen
in den Generator; seine 18 Ausgaben stimmen mit dem Arbeitsstand überein.

## Graph und eigenständige Prüfungen

Der Cluster enthält genau beide Kinder und hat Gewicht 2. Die betroffenen
Vorfahrgewichte zählen eindeutige Blattziele. Oberfläche benötigt insbesondere
das Zylindermantelverständnis, Volumen das Zylindervolumen; beide benutzen
Rotationskörper und die bestehende Mathematik-Orientierung. Der einzige
direkte Verbraucher `6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9` benötigt beide
Kinder. Er verlangt eine neue Kontextbindung seiner D/P-Evidenz.

Unter dem bestehenden J10-Prüfungsordner liegen zwei eng begrenzte Aufgaben:

- `64f37348-20f7-55b1-82a8-8fc388087577`: kugelförmige Leuchte beschichten;
  Kugelhautplausibilisierung, Fläche mit Einheit und quadratische Skalierung.
- `926d0551-4537-569e-b6ad-fc33bb17546e`: kugelförmiges Gefäß füllen;
  umschließender Zylinder, Rauminhalt mit Einheit und kubische Skalierung.

Die Aufgaben, Lösungen und KI-Reviews liegen unter
`curricula/DE/Gymnasium/assessments/mathematik/sphere-split-2026-09-28/`.
Je Aufgabe stimmen `requires` und `coveredGoalIds` exakt mit dem geprüften
Kind überein. Drei Kernbereiche haben je 4 BE; die Bestehensgrenze 10 BE und
ausdrückliche Teilbereichsgrenzen verhindern Bestehen durch reines Einsetzen.
Die Bewertung muss diese fachlichen Grenzen beachten; kein echter Hosttest
wird behauptet. Bestehende J10-Aufgaben prüften keine entsprechende vollständige
Kugelkompetenz und wurden deshalb nicht sachfremd umgedeutet.

Das Semantic-kind-Ledger klassifiziert zwei neue curricularAtomic, den alten
Knoten als curricularArea und die beiden Prüfungen als practiceAssessment.
Der echte curriculare Nenner steigt von 799 auf 800. A und M haben jeweils
getrennte aktuelle Kindnachweise; die alte Mischentscheidung bleibt hier als
historische Datei erhalten. Die neuen Kinder benötigen eigene aktuelle Bilder
und getrennte D-/P-Reviews; das alte positive Mischprofil wird nicht kopiert.

## Prüfung dieses Implementierungsteils

- Graph: 593 Landschaften bestanden.
- Composition Views: 297 Ansichten bestanden.
- Duration-Generator: alle 18 Mathematik-Ausgaben stimmen überein.
- Semantische Atomarität und Memory: jeweils 800 aktuelle Nachweise gültig.
- Exam-Markdown, Mathematik-Checkpoint-Verträge und geprüfte Sek-I-Prüfungsrouten bestanden.
- Backend `GoalMappingRepositoryFixtureTest`: vollständig bestanden; BW/BY-Zählungen und die neuen partiellen Kindkanten sind geprüft.

Ein zwischenzeitlicher Goal-book-Test stoppte während laufender Bildänderung
an einem fremden Bild-/QA-URL-Mismatch (`1dd0266c`), nachdem Kugel-Kindschema
und Atlasnavigation passiert waren. Ein späterer zentraler aktueller Test
muss das bestätigen. Ein erster gleichzeitig laufender isolierter Gradle-Versuch
scheiterte an fehlenden Mainklassen; die anschließende unabhängige Ausführung
im ungestörten Buildverzeichnis bestand. D/P/V und abschließende CI bleiben
Aufgabe des zentralen Integrationslaufs, nicht dieses Teilberichts.
