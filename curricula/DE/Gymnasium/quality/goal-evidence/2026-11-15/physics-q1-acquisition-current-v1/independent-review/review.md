# Unabhängiges informiertes Inhaltsreview – Q1-Erwerbsnachweise9–26

**ACCEPT für alle18 Aufgaben des exakten v3-Kandidaten** mit SHA-256
`9bf270c86a09fd40cfe577fc7a0bf11c1016be95faccc62315adbc62c028a3b9`.
Geprüft von `/root/physics_release_finish` am15. November2026. Ich bin nicht
Autor dieser Aufgaben. Dies ist ein informiertes unabhängiges KI-Inhaltsreview,
kein Blindreview, keine menschliche Unterrichtserprobung und keine native
Releasefreigabe. Die Aufgaben0–8 prüft Root getrennt; deren fachliche
Gesamtfreigabe wird hier nicht übernommen oder stellvertretend behauptet.

Vor jedem konkreten Aufgabenreview wurden der native gewöhnliche und
Aufgaben-Wissenskontext, die ganzen tatsächlichen DE/EN-Ziele sowie vollständige
P-Profile einschließlich Erwartungen, unabhängiger Demonstrationsanforderung,
Variationsachsen und Fallbriefen gelesen. Die18 Aufgaben beanspruchen24
unterschiedliche ganze gewöhnliche Ziele. Danach wurden DE/EN-Aufgabe,
Musterlösung und sämtliche Bewertungsschritte gelesen und unabhängig beurteilt.
Die ursprünglichen Einzelbefunde mit konkreten Gegenantworten bleiben in
`decisions.actual.json` erhalten; die anschließende Annahme ist separat in
`v3-final-decisions.actual.json` dokumentiert.

Die Aufgaben verlangen die wesentlichen Sachhandlungen tatsächlich:
unabhängige neue Randbedingungen, Vorzeichen- und Systemgrenzenentscheidungen,
quantitative beziehungsweise qualitative Konstruktion und Prüfung des
Gültigkeitsbereichs. Ganze P-Kompetenzen werden nicht durch einzelne passende
Schlüsselwörter ersetzt. Bei MRT und Influenz werden die ausdrücklich geforderten
drei Situationen durch jeweils getrennte Fälle geprüft. Die gelesenen P-Profile
zu Reibung/Influenz gestatten Planung und Deutung bereitgestellter sicherer
Beobachtungen beziehungsweise Simulationen. Deshalb wurde dort keine angeblich
zwingende eigene Versuchsdurchführung erfunden. Der getrennte frühe Nachweis
16bfb verlangt hingegen ausdrücklich echte eigene Messung und digitale Artefakte;
sein eigenes Review steht in `seki-review.md`.

Fünf eng begrenzte Inhaltsbefunde wurden vor der Annahme behoben:

-13: signierte RC-Anfangsstromhilfen undτ=RC sind gegeben; der positive
  Sensorstrom gehört ausdrücklich zum Laden mit angeschlossener Quelle.
-14: Die unabhängige GrößeN beschreibt erwartete verbleibende instabile Kerne;
  ihr Abnahmemodell ist vorgegeben und verlangt kein neues Kernphysikwissen.
-16: Elementare signierte Flüsse durch ebene Deckel/Mantel sind erklärt.
  Ein ungekanntes Oberflächenintegral ist keine verdeckte Voraussetzung.
-18: Vor der endlichen Motorentladung werden ausdrücklich beide Kondensatoren
  von sämtlichen Spannungsquellen getrennt.
-21: Vier Zeit-Spannungs-Paare sind eindeutig geschrieben. Eine gegebene
  qualitative magnetische Richtungsregel ersetzt das über die P-Anforderung
  hinausgehende zwingende formale Kreuzprodukt im Raster.

Die ursprünglichen v1/v2-Bytes bleiben unverändert. Eigene rekursive Vergleiche
haben142 geänderte v1→v2-Felder geprüft:138 reine Rubrik-/Lösungsregeländerungen
und vier von Root geforderte DE/EN-Geometriepräzisierungen. Fachliche
Lösungskörper und konkrete Kriterien bleiben dabei gleich. Der anschließende
v2→v3-Vergleich findet exakt15 Felder in7/13/14/16/18/21; alle übrigen
Aufgabenwerte sind identisch. Alle15 tatsächlichen Änderungen wurden gelesen.
Die Rundung in7 ist die getrennt von Root gefundene1,760 statt1,761·10¹¹C/kg;
diese Deltaannahme ist keine vollständige eigene Erstprüfung der Aufgabe7.

`independent_checks.py` wurde unabhängig von den Autorenprüfern geschrieben
und ausgeführt:98 numerische/Geometrieassertions bestehen, einschließlich der
gesonderten SekI-Kontrollzahlen. Bei der Entwicklung des eigenen Prüfskripts
wurden irrtümlich handeingetragene zusätzliche Ziffern in meinen Entwurfsnotizen
zu22 durch die ausgeführte Rechnung korrigiert; die gerundeten Aufgabenwerte
waren bereits richtig. `check_final_v3.py` führt einen eigenen vollständigen
Nachfolgervergleich und eine direkte Ganzzahlprüfung aus. Es importiert und
startet keine Autorenprüfung.

Die84 tatsächlichen Vierpunkteschritte enthalten jeweils selbst die
DE/EN-Regel: Fehlt eine in genau diesem Schritt wesentliche Aussage oder
unabhängige Übertragung, erhält dieser Schritt höchstens1/4. Für jeden Schritt
wurden0/1 sowie alle Ganzzahlbelegungen der übrigen0…4-Punkteschritte geprüft,
insgesamt8760 Vektoren. Das maximale Ergebnis liegt dann immer beiM−3 unter
der BestehensgrenzeM−2. Ein isolierter kleiner Fehler bei vorhandenen Kernen
erhältM−1 und besteht. Die Aussage folgt aus der Schrittsumme; eine zusätzliche
Gesamtkappung oder ein neues Ergebnisflag wird nicht vorausgesetzt. Dies beweist
die Unkompensierbarkeit **bei korrekter Anwendung der Rubrik**, nicht die
ausnahmslos korrekte semantische Entscheidung eines späteren KI-Prüfers.

Quellen wurden für die sachlich speziellen Fälle tatsächlich nachgelesen.
Die MRT-Kette wurde mit der [NIST-Erklärung](https://www.nist.gov/how-do-you-measure-it/how-does-mri-machine-work)
und der [NIBIB-Grundlage](https://www.nibib.nih.gov/science-education/science-topics/magnetic-resonance-imaging-mri)
abgeglichen; die Orts-Frequenz-/Phasencodierung zusätzlich mit der
[Lehre der Larson-Forschungsgruppe](https://larsonlab.github.io/MRI-education-resources/Spatial%20Encoding.html).
Das Aufgabenmodell trennt Netto-Ensemble, resonante Anregung, gemessene
Empfangssignale und räumliche Codierung und behauptet keine Aufnahme einzelner
Spins. Die beiden Gauß-Hauptlagen und die Kombination von Quotient und Produkt
wurden mit dem [Praktikumsblatt der TU Dresden, Abschnitte2.1–2.4](https://tu-dresden.de/mn/physik/ressourcen/dateien/studium/lehrveranstaltungen/praktika/pdf/MF.pdf?lang=de)
abgeglichen. Die Aufgabe gibt SI-Beziehungen fürB stattH ausdrücklich vor;
eine unzulässige Verwechslung der Feldgrößen wird nicht übernommen.

Die Annahme bindet ausschließlich die exakt gepinnten aktuellen Aufgabenbytes
und ihre Whole-P-Ansprüche im tatsächlich gelesenen Kontext. Sie ersetzt weder
SEM-/D-/P-Registryprüfung noch Curriculum-Projektion, vollständige Release-QA,
Lernendenergebnisse oder frische main-CI. Aktive QA-Dateien wurden während
dieses Inhaltsreviews nicht geschrieben.
