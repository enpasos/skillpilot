## Lernzielbuch und lokale Zeitplanung für Lehrkräfte {#sec:teacher-goal-book-planning}

:::note{title="Status und Abgrenzung"}
Am 5. September 2026 vom Product Owner zur Planung und Umsetzung freigegeben; erste Ausbaustufe lokal implementiert. Einstieg: **Lehrkräfte → Klasse → Planung → Plan bearbeiten**. Dieses Vorhaben startet keinen neuen fachlichen Curriculum-QS-Lauf und ist nicht automatisch ein Deployment. Die fachlichen Grundbegriffe und die Trennung von Planung und gespeichertem Lernergebnis folgen dem [Zeitachsenkonzept](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md); dessen weitergehende mögliche Backend-Klassenarchitektur wird hier nicht umgesetzt — für Klassen gilt weiterhin die ausdrücklich gewählte lokale Browser-Ablage.
:::

### Produktziel {#sec:goal-book-planning-goal}

Die Lehrkraft kann aus dem für ihren Kurs geltenden Lernzielbuch eine überschaubare Unterrichtseinheit planen: passende Ziele verstehen und auswählen, zeitlich einordnen und anschließend erkennen, welche Ziele noch ungeplant sind und welche Voraussetzungen außerhalb oder zeitlich nach der Einheit liegen.

Die erste Ausbaustufe verbindet die vorhandene Kursplanung mit dem Lernzielbuch, ohne ein zweites Planmodell oder eine zentrale Klassenverwaltung einzuführen. Bestehende Planabschnitte, lokale Revisionen, Datumsprüfungen und die ausdrückliche Übernahme in persönliche Lernpläne werden wiederverwendet. Die anschließende Klausurvorbereitung (@ref{sec:exam-preparation-planning}) ergänzt Klausurstoff- und Aufgabenabdeckung, eine Vorschau zur Vorbereitungsvervollständigung und einzeln deaktivierbare Planabschnitte.

### Erste Ausbaustufe {#sec:goal-book-planning-stage1}

1. **Kursgebundene Zielauswahl im Buch:** Im bestehenden Kurskontext wählt die Lehrkraft ein Lernziel anhand seiner Beschreibung und Buchdarstellung aus. Die autoritative Kursprojektion begrenzt die Auswahl; ein öffentlich sichtbares Buchziel ist nicht automatisch Ziel dieses Kurses. Fach, Bundesland, Stufe, Bildungsgang und Kursprofil werden nicht erneut geraten.
2. **Explizite Entwurfsübernahme:** Die Auswahl fließt in den lokalen Abschnittsentwurf; Beginn, Ende und ein optionaler eigener Titel bleiben Entscheidungen der Lehrkraft. Erst Speichern verändert den lokalen Plan, erst die bestätigte Übernahme verändert den persönlichen Lernplan der Lernenden.
3. **Barrierearme Zeitachse:** Eine kompakte Zeitachse zeigt Lernabschnitte, Puffer und Meilensteine; vollständige Text- und Datumsbearbeitung bleibt parallel verfügbar, sodass weder Maus noch Drag-and-drop erforderlich sind.
4. **Sichtbare Planungsbasis und Voraussetzungshinweise:** Geplante und ungeplante Ziele aus der aktuellen Planungsbasis sowie Voraussetzungshinweise werden ausgewiesen. Hinweise unterscheiden ein Ziel außerhalb der Planung von einer unpassenden zeitlichen Reihenfolge, ohne Aussagen über individuellen Lernstand abzuleiten.
5. **Verlustfreie Quellennavigation:** Von jedem geplanten Ziel gelangt die Lehrkraft zur Buchbeschreibung und zu vorhandenen Originalquellen, ohne den lokalen Entwurf zu verlieren.

### Sicherheits- und Bedeutungsgrenzen {#sec:goal-book-planning-boundaries}

- **Lokale Klassen- und Datenschutzgrenze:** Klassenbezeichnungen, Mitgliedschaften und bestehende lokale Altdokumentation verbleiben ausschließlich in der lokalen Browser-Ablage; öffentliche Buchabrufe übermitteln weder Klassen- noch Lernendenkennungen.
- **Keine stillen Planumschreibungen:** Ein Buch- oder Curriculum-Update schreibt weder einen Plan noch dessen Termine automatisch um; nicht mehr passende Ziele werden als Konflikt ausgewiesen (siehe @ref{sec:course-plan-update-continuity}).
- **Einzige Ergebnisquelle:** Gespeicherte Lernzielergebnisse sind die alleinige Quelle für erreichte Ziele. Die frühere manuelle Unterrichtsabdeckung und Vollständigkeitsbestätigung sind als Fortschrittsmodell abgelöst (lokale Altdaten bleiben erhalten, erzeugen aber keine Mastery).
- **Lesender Fortschritt und feste Planungsbasis:** Der Lernfortschritt wird je Lernendem und Fach rein lesend aus dem persönlichen Backend-Zielumfang und gespeicherten Ergebnissen gelesen (inklusive abgeschlossener Orientierungsziele ohne Fachbeherrschungsanspruch; fehlende/veraltete Daten erscheinen als nicht verfügbar, nicht als null). Die Planmenge $G$ bleibt fest: später gemeisterte Planziele bleiben in $G$, und der persönliche Status folgt @ref{sec:unified-plan-status}.
- **Keine Stundenbudget-Illusion:** Zielzahlen sind keine belastbare Unterrichtsdauer; es werden keine scheinbar präzisen automatischen Stundenbudgets aus Atomzahlen errechnet, und eine fehlende Planauswertung gilt als unbekannt statt als „alles ungeplant“.
- **Keine KI- oder Kalenderkopplung in Stufe 1:** Weder neue KI-Verbindungen noch Kalenderdienste oder externe Veröffentlichungen sind enthalten; spätere KI-Vorschläge müssten Annahmen zu Zeit, Vorwissen, Übung und Puffern offenlegen und editierbar halten. Historische OpenAI-Review-Artefakte und veröffentlichte Pakete bleiben unberührt; lokale Prüfungen sind kein Deployment.

Technisch liegt die Darstellung in `CoursePlanLearningBook.tsx` und `CoursePlanTimeline.tsx`, angebunden über `CoursePlanPilotView.tsx`; `testTrainerCoursePlanUi.ts` prüft Auswahl, Datenschutzgrenze, Entwurfsschutz, Tastaturfokus, Zeitproportionen und schmale Displays.

### Abnahme {#sec:goal-book-planning-acceptance}

- Eine reale Mathematik- oder Physik-Einheit lässt sich im bestehenden Kurs anlegen, aus dem Lernzielbuch ergänzen, zeitlich bearbeiten und erneut öffnen; Ziele außerhalb der Kursprojektion sind nicht übernehmbar.
- Wechsel, Abbruch und Rücknavigation verlieren weder gespeicherte Pläne noch unbestätigte Eingaben ohne Warnung; Zeitachse, Datumsformular und Zielauswahl sind per Tastatur und auf schmalen Displays bedienbar.
- Gespeicherte Zielabschlüsse erscheinen bei gleichem Lernenden-, Fach- und Zielumfang konsistent in Baum, Cockpit und Planung; Fortschrittsabrufe bleiben rein lesend, und Modell-/UI-Regressionen, TypeScript sowie Build sind grün.
