<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# B008: SC-01 – Pflichtleistungen im bestehenden Punkteschema

**AUTHOR / inactive / needs_review / keine Freigabe.** Der getrennte Nachfolger setzt auf dem versiegelten A-01-Whole517 mit SHA-256 `8a4bcc2a8c1cfdabbbced5a5340451b4a94821304190222d07ae256b3d91c8a0` auf. A-01 bleibt in Werkstatt 4 erhalten: Für Rezeptorfall A und Enzymfall B ist jeweils eine eigene Hypothese mit Modellprüfung verlangt.

Die bisherige 60%-Grenze ließ fehlende Pflichtleistungen durch andere Punkte ausgleichen. Der aktuelle `ClaudeV1McpContractAdapter.applyExamMasteryRules` prüft die Bewertungscapability, eine endliche Punktzahl, den Wertebereich und anschließend nur die Gesamtpunktzahl gegen `passingPoints`. `ExamData.Scoring` hat `maxPoints`, `passingPoints` und Schritte mit `id`, `points`, `description`. Es gibt dort kein geprüftes Teilminimum und keinen gesonderten Status „unvollständig“. Die bestehenden freien `extendedData`-Hinweise erkennen oder erzwingen fehlende Leistungen nicht. Das ist auch im [bestehenden Stammfunktions-Prüfungsreview](../../../../../../../docs/qa-ci/math-antiderivative-exam-candidate-review-2026-09-28.md) dokumentiert.

## Autorenkorrektur

Alle fünf bestehenden Prüfungen erhalten in jeder operativen `scoring.steps.description` eine eindeutige Nullregel: **Fehlt eine individuell bezeichnete Pflichtleistung oder Pflichtdimension vollständig, bekommt ihr gesamter bestehender Rubrikschritt 0 BE.** Andere Leistungen innerhalb desselben Schritts kompensieren diese Abwesenheit nicht. Die vollständigen Regeln werden identisch in der Aufgaben- und Lösungsquelle angezeigt. `reviewStatus` bleibt für alle fünf `needs_review`.

Die bestehenden Maxima, Schritt-IDs, Schrittgewichte, fachlichen Teilpunktzuweisungen, Aufgabenmaterialien und wissenschaftlichen Modell-/Messdaten bleiben exakt erhalten. Für substanzielle, aber fachlich unvollkommene Bearbeitungen bleiben die ursprünglichen Teilpunkte nach Qualität zulässig. Gleichwertige alternative Lösungen/Methoden bleiben gleichwertig; ein begründeter Gegenbefund in der eigenen Untersuchung ist kein automatischer Fehler. „Fehlend“ ist kein Synonym für „nicht perfekt“. Eine bloße Überschrift, ein fremdes Produkt oder ein erfundener praktischer Beleg erfüllt dagegen keine substanzielle eigene Pflichtleistung.

| Prüfung | Alte Grenze | Neue Grenze | Größte Gesamtpunktzahl bei irgendeinem vollständig auf 0 gesetzten Schritt |
| --- | --- | --- | --- |
| Salzwasser: eigene Untersuchung/Präsentation | 24/40 | **37/40** | 36/40 |
| Saure Proben: eigene qualitative/quantitative Untersuchung | 36/60 | **51/60** | 50/60 |
| Vollständiges Modellportfolio/Präsentation | 48/80 | **69/80** | 68/80 |
| Ammoniak: Gültigkeit/Nachhaltigkeit | 30/50 | **46/50** | 45/50 |
| C11-Wissensentwicklung, Kurs-HOLD | 24/40 | **37/40** | 36/40 |

Die hohe Grenze ist eine Folge der bestehenden gebündelten Bewertungsabschnitte und des heutigen Summengates. Mit unveränderten Gewichten ist `maxPoints − kleinster Schritt + 1` die kleinste **ganzzahlige** Grenze, bei der jeder vollständig auf 0 gesetzte Pflichtabschnitt unter dem Bestehen bleibt. Fachliche Qualität wird weiterhin bewertet; ein komplett belegtes Beispiel mit einem Punkt Abzug bleibt bei jeder Prüfung oberhalb der Grenze. Eine niedrigere Gesamtschwelle bei gleichzeitig getrennt erzwungenen Teilminima würde eine andere autorisierte technische Bewertungsregel benötigen.

## Nachweis für einzelne ausgelassene Unterdimensionen

Der Bericht [negative-subdimension-bounds-from-actual-rubrics.actual.json](checks/negative-subdimension-bounds-from-actual-rubrics.actual.json) leitet jeden Einzelfall aus der **tatsächlichen** neuen Schrittbeschreibung und ihren Punkten ab. Alle anderen Schritte erhalten pessimistisch die volle Punktzahl. Die Nullregel ergibt `Gesamtmaximum − Punkte des betroffenen Schritts < neue Bestehensgrenze`.

Das erfasst ausdrücklich auch Unterdimensionen **innerhalb** eines großen Schritts: qualitative **oder** quantitative eigene Durchführung, analoges **oder** digitales eigenes Produkt, jede einzelne Modellfamilie, Rezeptor **oder** Enzym samt jeweils eigener Hypothesenprüfung, jedes einzelne der fünf Gültigkeitskriterien, historischen **oder** aktuellen Bezug, ökologische/ökonomische/soziale Perspektive jeweils einzeln, eigenes Handeln, jeden einzelnen der sechs C11-Einflüsse und die empirische Gültigkeitstrennung gegenüber Zustimmung. Ganze fehlende Untersuchungs-/Präsentationsabschnitte sind damit ebenfalls ausgeschlossen. Die Beispiele sind konstruierte Bewertungsfälle und keine beobachteten Schülerleistungen.

Der Server erkennt die tatsächliche Abwesenheit einer Leistung **nicht selbst**. Er verwirft bei rubrikgetreuer, beleggestützter Punktevergabe die daraus zwingend zu niedrige Gesamtzahl. Dieser Autorennachweis ist keine reale Coach-Bewertung, Laborbeobachtung, Präsentationsabnahme, Client-/Host-Akzeptanz oder Human Approval. Es werden keine neuen Schema-/Runtimefelder, kein neuer Adapter und keine operative Integration eingeführt. Eine alleinige Änderung zu `released` wäre keine Prüfung der tatsächlichen Beurteilung.

## Ganze Ziele und offene Gates

Der ganze Entwurf umfasst weiter 517 Ziele. Alle anderen **512 ganzen Ziele** sind exakt; bei den fünf Examensknoten ändern sich ausschließlich Aufgaben-/Lösungsinhalt, die numerische Bestehensgrenze, die Beschreibungen der vorhandenen Rubrikschritte und die nötigen neuen Aufgabenquellpfade. Quellen-/Kurs-HOLDs, Coverage-IDs, `requires`, Ressourcen/Bilder und alle anderen Metadaten bleiben exakt. Der Science-/Materialkern der alten Texte wird nur durch konkret aufgeführte Änderungen an Bestehenspassagen und angehängte operative Bewertungsregeln ergänzt; Stoff-/Modell-/Messdaten werden nicht geändert.

C11 bleibt `HOLD_UNSPECIFIED_C11`, P bleibt unselektiert. Aktiver strenger Zuwachs **0**, aktueller strenger Nenner **null**, keine M6-/M7- oder menschliche Freigabe. Aktuelle unabhängige duale Prüfung dieses neuen Standes und die übrigen nativen Kontext-/Quellen-/Beurteilungsgates bleiben erforderlich. Beide alten Autoren-Seals bleiben bytegenau; normale betroffene Schema-/Portability-/Unverändertheitsprüfungen und Terminal-Exits sind dokumentiert. Keine Git-/GitHub-Schreiboperation.

Aufgaben, Lösungen und Wissenslandschaftskandidat: SkillPilot, CC-BY-4.0. Technischer Assembler/Prüfer: Apache-2.0.
