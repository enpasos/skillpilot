# Exam Example Authoring Guide: Klausurbeispiel Physik Hessen 2026 (GK/LK)

## Ziel

Erstellung eines vollständigen, eigenständigen Klausurbeispiels für das Landesabitur 2026 im Fach Physik (GK und LK, Hessen).

## Allgemeine Pipeline-Referenz

- Generische Production Pipeline: `docs/production-pipelines/exam-example.md`
- Zentrale Quellenliste Hessen Oberstufe: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/references.md`
- Diese Authoring-Guide-Datei konkretisiert die allgemeine Pipeline für das Fach Physik und den Jahrgang 2026.

## Verbindliche Quellen

- Zentrale PDF-Registry: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/references.md`
- Erlassauszug: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/la26_abiturerlass_physik.txt`
- Primärquelle: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/la26-abiturerlass.pdf`
- Stilreferenz (Niveau/Art): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur_md`
- Mathe-Referenz für Aufbau/QS: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Mathe/Klausurbeispiel2026_1`

## Harte Randbedingungen

- Aufgaben müssen die Vorgaben des Erlasses erfüllen (Inhalt, Auswahlmodus, Hilfsmittel, formale Anforderungen).
- Aufgabenstil soll dem Niveau und der Aufgabenart der LEIFIphysik-Abituraufgaben entsprechen.
- Es dürfen keine Aufgaben oder Teilaufgaben aus `.../leifiphysik_abitur_md` kopiert werden (weder wörtlich noch als nahezu identische Struktur).
- Alle Formeln und mathematischen Ausdrücke sind durchgängig in LaTeX zu schreiben (inline `$...$`, abgesetzt `$$...$$`), analog zum Stil in `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Mathe/Klausurbeispiel2026_1/Mathe_Hessen_2026_Klausurbeispiel_1.md`.
- Deutsche Umlaute sind im Fließtext als `ä/ö/ü` zu verwenden (statt `ae/oe/ue`), sofern keine technischen Ausnahmen vorliegen.
- Der Hilfsmittelhinweis im Aufgabentext ist wortlautnah am Erlass zu formulieren (insbesondere die Einschränkung der eingeführten Formelsammlung: „ohne Herleitungen, weitergehende physikalische Erklärungen, Beispielaufgaben“).

## Artefakte in diesem Ordner

- Checkliste (Schritt 1): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/checkliste.md`
- Blueprint (Schritt 2): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/abi_2026_physik_exam_blueprint.json`
- Klausurentwurf GK/LK (Schritt 3): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Physik_Hessen_2026_Klausurbeispiel_1.md`
- Musterlösung GK/LK (Schritt 4): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Physik_Hessen_2026_Klausurbeispiel_1_Musterloesung.md`
- Abschluss-QS (Schritt 5): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Schritt5_Abschluss_QS.md`
- Findings-Backlog (Schritt 6): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/findings.md`
- Finding-Bearbeitung (Schritt 7): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Schritt7_Finding_Bearbeitung.md`
- Re-QS nach Findings (Schritt 8): `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Schritt8_ReQS.md`
- Für weitere Klausurbeispiele gilt derselbe Artefaktsatz analog im jeweiligen `Klausurbeispiel...`-Ordner.

## Fachspezifische Ergänzungen zur allgemeinen Pipeline

Die Schritte 1 bis 9 folgen der generischen Pipeline in `docs/production-pipelines/exam-example.md`.
Die folgenden Punkte konkretisieren nur die Physik-spezifischen Erwartungen.

### Schritt 1: QS-Checkliste erstellen

- Nutze die Mathe-Checkliste als Strukturvorlage.
- Übertrage sie fachspezifisch auf Physik anhand des Erlasses 2026.
- Ergebnis ist eine prüfbare Liste mit Checkboxen (keine Prosa ohne Prüfkriterium).

### Schritt 2: Blueprint vor dem Schreiben der Aufgaben

- Lege fest, welche Vorschläge/Teilthemen abgedeckt werden.
- Dokumentiere für jede Aufgabe:
  - GK/LK-Zuordnung,
  - Erlass-Themenfeld (Q1.1 bis Q3.3),
  - erwartetes Niveau (AB1/AB2/AB3),
  - Materialbezug (Diagramm/Tabelle/Text/Bild).
- Prüfe den Blueprint gegen die Checkliste, bevor Aufgaben ausformuliert werden.

### Schritt 3: Aufgabenentwurf

- Schreibe eigenständige Aufgaben in realistischem Kontext.
- Achte auf saubere Operatorik, eindeutige Angaben, konsistente Einheiten.
- Vermeide Klonmuster aus der LEIFI-Sammlung (anderer Kontext, andere Daten, andere Fragelogik).
- Bei Induktionsaufgaben nicht nur Beträge prüfen, sondern bei geeigneten Materialien auch die Richtung gemäß Lenz'scher Regel.

### Schritt 4: Musterlösung und BE-Raster

- Liefere für jede Teilaufgabe einen nachvollziehbaren Lösungsweg.
- Ordne BE transparent zu (Rechnung, Begründung, Interpretation).
- Prüfe Fachkonsistenz (Ergebnis, Einheit, Plausibilität).
- Bei Linearisierungsaufgaben die korrekte Variablentransformation und Achsenwahl explizit benennen.
- In den Bewertungsgrundsätzen eine klare Rundungsregel (signifikante Stellen) und bei materialgebundenen Toleranzen den expliziten Rückbezug auf das Material aufnehmen.

### Schritt 5: Abschluss-QS

- Gehe Checkliste Punkt für Punkt durch.
- Dokumentiere offene Risiken/Restunsicherheiten explizit.
- Erst danach als „finales Klausurbeispiel“ markieren.

### Schritt 6: Findings aufnehmen und priorisieren

- Überführe neue Findings in eine strukturierte Liste (ID, Quelle, Beschreibung, Priorität, betroffene Dateien, Akzeptanzkriterium).
- Markiere jedes Finding als `offen`, `in Bearbeitung` oder `geschlossen`.
- Leite aus jedem Finding einen klaren Bearbeitungsauftrag ab.

### Schritt 7: Findings umsetzen

- Bearbeite Findings in priorisierter Reihenfolge.
- Dokumentiere pro Finding die konkreten Änderungen (Datei/Abschnitt, was geändert wurde, warum).
- Achte darauf, dass neue Änderungen keine bereits erfüllten Checklistenpunkte verletzen.

### Schritt 8: Re-QS nach Findings

- Wiederhole den QS-Check nur für betroffene Checklistenpunkte plus Konsistenzprüfung zu Aufgabe/Musterlösung.
- Dokumentiere Delta: `behoben`, `teilweise behoben`, `offen`.
- Aktualisiere den Freigabestatus erst nach abgeschlossenem Re-QS.

### Schritt 9: Landschafts-Integration (separat, nach Stabilisierung)

- Integration der finalen Abiaufgaben in `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json` erfolgt **erst**, wenn Aufgabenblatt und Musterlösung inhaltlich stabil/freigegeben sind.
- Vorher dürfen nur unabhängige Landscape-Findings umgesetzt werden (z. B. Metadaten, Auswahllogik, zusätzliche optionale Q4-Cluster).

#### Didaktische Integrationsregel für die Landscape-Anbindung

- Abiturbeispiele gehören in SkillPilot auf einen **separaten globalen Abitur-Zweig**, nicht in die normalen phasenlokalen Übungszweige.
- Die normalen Lernrouten des Curriculums enden weiterhin in lokalen Autonomie-Clustern wie `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4`.
- Diese lokalen Übungszweige modellieren **normalen Klausurcharakter** und schließen die atomaren didaktischen Routen innerhalb der jeweiligen Phase.
- Die globalen Abiturziele sind eine **zusätzliche Assessment-Schicht**. Sie ersetzen nicht die phasenlokalen Selbstständigkeitsziele.
- Durch die Integration eines Abiturbeispiels dürfen keine neuen groben Cluster-`requires` für die normale Curriculumsnavigation entstehen. Die didaktische Kernlogik bleibt auf atomaren `requires`.
- Falls ein Abiturbeispiel inhaltlich stark auf einzelne Phasen zurückgreift, wird diese fachliche Nähe über Auswahl, Metadaten, `sourceRef` oder `resourceLinks` sichtbar gemacht, nicht durch eine Vermischung von Abi- und Phasen-Übungszweigen.

## Arbeitsregel für künftige Iterationen

Jede weitere Arbeitsrunde beginnt mit:

1. Verweis auf den konkreten Arbeitsschritt (`Schritt 2`, `Schritt 3`, ...),
2. Nennung der betroffenen Dateien,
3. kurzer Selbstprüfung gegen die Checkliste (erfüllt/nicht erfüllt/offen).
4. falls ab Schritt 6: Nennung der betroffenen Finding-IDs (`F-...`) und ihres Status.
