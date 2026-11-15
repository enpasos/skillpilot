# K2: vier eigenständige Diagrammprüfungen, inaktiver Entwurf

Stand: 15. November 2026. Alle Änderungen dieses Arbeitspakets liegen unter
diesem Verzeichnis. Es wurde nichts in kanonische Daten, Qualitätsdateien,
Mappings, Laufzeitcode oder öffentliche App-Assets übernommen. Kein Commit,
Push, unabhängiges Review, Lernergebnis oder Reifegrad wird behauptet.

Die Aufgaben ergänzen jeweils genau eines der vier **tatsächlich vorhandenen**
Diagrammziele. Sie verengen deren Beschreibung nicht. Jede enthält zwei
unabhängig zu bearbeitende Fälle mit unterschiedlicher Darstellung oder
Vergleichsbasis; die bestehenden Profile fordern zwei Demonstrationen,
Variation und Transfer. Die Musterlösungen sind nicht exklusiv. Jedes Raster
vergibt je Kriterium vier getrennte Einzelpunkte statt einer Alles-oder-nichts-
Wertung.

| Prüfung | Bestehendes Ziel; zugleich einziges direktes `requires` und einziges `coveredGoalIds`-Element | Fälle | Punkte / Bestehen |
| --- | --- | --- | ---: |
| `f4fda40d-dca5-510b-bd6d-f7874b3d7b9b` | `80c232f1-8f72-5829-9dbe-5a610ccab3be` – Achsen, Skalen und Einheiten | Zeit/Volumen; horizontales Kategorienbudget mit Einheitenfaktor | 16 / 13 |
| `d9c49084-084e-5142-859c-33c53403ccf1` | `496f16a0-c031-5753-b988-d6cd3cab595e` – Kennwerte und Trends | zwei Reihen mit Schnittpunkten; ein Verlauf mit Plateau | 24 / 21 |
| `c76fae5e-70e6-5f20-9abe-e9e790d95324` | `fcfbff12-bd03-52ec-b242-a693212b3d2b` – Aussagen prüfen | abgeschnittene Mengenachse; gleiche Bildbreite für ungleiche Zeitspannen | 16 / 13 |
| `57bf531d-0920-5424-bef4-f704f5462477` | `d668c22d-caeb-5e91-8980-721c931a2bcf` – Missverständnisse erklären/korrigieren | Höhenverhältnis versus ganze Menge; Anzahl versus Anteil | 16 / 13 |

Beim Auslassen eines ganzen Falls oder eines ganzen Vier-Punkte-Kriteriums
bleibt die erreichbare Summe unter der Bestehensgrenze. Diese rechnerische
Eigenschaft ist in `rubric-coverage-and-omission-bounds.json` ausgewiesen. Sie
ersetzt keine fachliche Beurteilung einer tatsächlichen Antwort; kleinere
Lücken werden weiterhin abgestuft bewertet.

Die bestehende Voraussetzungskette beginnt nur bei „Warum Mathematik?“ und
sichert weder Ratenrechnung noch Prozentrechnung. Die Aufgaben geben deshalb
die erforderlichen Bedeutungen und Formeln an und erlauben einen Rechner.
Diese Hilfen ersetzen nicht die geforderte Diagrammdeutung. Sie rechtfertigen
keine zusätzliche Abdeckung eines Rechenziels und keine neue gewöhnliche
Voraussetzung. Das Beheben der gewöhnlichen Grundlagenkanten bleibt ein
separater Folgeschritt.

Die Dateien zum Anwenden und Prüfen sind:

- `proposed/curricula/DE/Gymnasium/assessments/mathematik/seki/j7/diagram-route-repair-20261115-v1/assessment-definitions.json` enthält die vier importierbaren Knoten, jeweils `needs_review`, mit DE/EN-Aufgabe und Musterlösung. Daneben liegen acht lesbare DE/EN-Markdown-Dateien einschließlich des jeweiligen Bewertungsrasters.
- `canonical-edit-plan.json` beschreibt exakt den Austausch von Aufgabe 5, die vier neuen Knoten und die Ergänzung ihres bestehenden J7-Prüfungsordners. `proposed-task5.json` enthält den korrigierten bestehenden Knoten. Dessen Algebra-Aufgabe, Lösung, Punkte und Identität bleiben identisch.
- `authoring-note-and-generator.patch` und die entsprechenden Dateien unter `proposed/` korrigieren Blueprint und Einmalskript gemeinsam. Der Generator entfernt die falsche Diagrammkante auch bei Replay; er hängt den früheren Freigabevorbehalt nicht erneut an. Das historische Skript ist kein aktueller Integrationsgenerator für die neuen Prüfungen.
- `asset-manifest.json` bindet acht eigene SVG-Originale und acht daraus mit `rsvg-convert` gerenderte PNGs an Hashes und vorgeschlagene öffentliche URLs. Sechs Bilder sind Stimuli; zwei klarere Darstellungen sind ausschließlich in `solutionContent` referenziert. `inspection/` enthält die tatsächlichen 360/680-Pixel-Derivate. Diese Sichtprüfung ist eine Autorenprüfung, keine unabhängige V-Freigabe oder Host-Abnahme.
- `inputs/`, `input-pins.json` und `semantic-release-proposal.json` dokumentieren die tatsächlich gelesenen Ziel- und Profilstände, Hashes und die ausdrücklich noch nicht autoritative semantische Einordnung.
- `author-technical-validation.actual.json` entsteht aus dem vorhandenen nativen Modell-/Sichtencompiler und enthält den tatsächlichen Entwurfsvergleich; es ist kein CQR- oder CI-Freigabenachweis.

Neu erzeugen: `python tmp/math-diagram-route-20261115/draft/build_draft.py`.
Technisch prüfen:
`app/node_modules/.bin/tsx tmp/math-diagram-route-20261115/draft/validate_draft.mts`.
Beide Befehle schreiben ausschließlich in dieses Scratch-Verzeichnis.

Vor der Übernahme sind die unabhängigen Inhalts-/Bewertungsreviews und die
aktuellen projektspezifischen Gates aus `reviewer-instructions.md` nötig.
Die erste Integration darf die falsche Algebra-Abdeckung nur zusammen mit
den tatsächlich geprüften Diagrammendpunkten ersetzen und muss die geschützten
Qualitätsuntergrenzen halten. Die sechs hypothetischen Kantenänderungen aus
der vorgelagerten Untersuchung gehören nicht in diese Lieferung.

Software-Helfer: Apache-2.0. Eigene Aufgaben, Daten, Rubriken und Diagramme:
CC-BY-4.0, Namensnennung „SkillPilot, 2026“. Die Quellenbezüge sind in
`source-context-and-scope.md` abgegrenzt; keine Fremdaufgabe oder Fremdgrafik
wurde übernommen.
