## Frontier-Auswahlstrategien und Autopilot {#sec:frontier-autopilot}

Dieses Kapitel beschreibt, wie SkillPilot die aktuell erreichbaren nächsten Lernziele auf der Frontier priorisiert und wie der optionale **Autopilot**-Modus beim Zielabschluss weiterleitet.

### Auswahlstrategien auf der Frontier {#sec:selection-strategies}

Sobald das Backend aus Skill-Graph, persönlichem Curriculum und Beherrschungsstand die zulässige Frontier (`stateMachineOptions`) bestimmt hat, ordnen Auswahlstrategien diese Kandidaten passend zu unterschiedlichen Lerngewohnheiten.

#### Strategie 1: Zufällig (*Abwechslung* / *Random*)

- **Konzept:** Bringt Abwechslung in den Lernfluss, indem die aktuell erreichbaren Frontier-Ziele gemischt werden.
- **Einsatzfall:** Geeignet für Lernende, die Themen verschränkt üben oder Ermüdung durch langes Verweilen in einem einzelnen Teilbaum vermeiden möchten.
- **Umsetzung:** Das Backend liefert die fachlich gültige Menge `stateMachineOptions`; der Client mischt diese Liste deterministisch (bzw. bei Aktualisierung), ohne `requires`-Voraussetzungen zu verletzen.

#### Strategie 2: Sequenziell (*Schritt für Schritt* / *Sequential*)

- **Konzept:** Folgt einer geordneten Progression entlang der Hierarchie des Curriculums.
- **Einsatzfall:** Geeignet für Lernende, die ein Themengebiet geschlossen abschließen möchten, bevor sie in den nächsten Zweig wechseln.
- **Umsetzung:** Die erreichbaren Ziele werden nach ihrer hierarchischen Baumposition (Tree-Index bzw. stabile Zielreihenfolge) sortiert; Geschwisterknoten im aktuellen Zweig haben Vorrang vor neuen Teilbäumen.

### Autopilot-Modus {#sec:autopilot-mode}

Der Autopilot reduziert Navigationsaufwand, indem er nach dem erfolgreichen Abschluss des aktuellen Ziels automatisch das nächste passende Frontier-Ziel aktiviert.

#### Laufzeitverhalten

- **Auslöser:** Greift, sobald das aktuelle `activeGoal` in den Zustand **Gemeistert** (*Mastered*) übergeht.
- **Auswahl:** Wählt das **erste** Ziel der gültigen Frontier nach Anwendung der eingestellten Auswahlstrategie (*Zufällig* oder *Sequenziell*). Ist der Planmodus eines gültigen Lernplans aktiv (siehe @ref{sec:existing-learner-setup}), gelten vorrangig dessen Übergaberegeln und der generische Autopilot wird unterdrückt.
- **Aktion:** Ruft `setActiveGoal(nextGoalId)` automatisch ohne manuellen Zwischenschritt im Lernzielbaum auf.

#### Konfiguration und Speicherung

- **Oberfläche:** Einstellbar im Dialog *Mein Lehrplan* (*Personal Curriculum*).
- **Persistenz:** Gespeichert in der Backend-Entität `Learner` (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`), sodass die Einstellungen sitzungs- und geräteübergreifend erhalten bleiben.
- **API:** Aktualisierung über `PUT /api/ui/learners/{skillpilotId}/preferences` mit partiellem JSON-Payload (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`); nicht gesendete Felder behalten ihren gespeicherten Wert.
- **Zusammenspiel mit Striktmodus:** `strictMode` legt fest, ob Frontier-Voraussetzungen nur innerhalb des aktiven Ausschnitts (*optimistisch*) oder über die gesamte globale Voraussetzungshülle (*strikt*; siehe [Kontext und Sichten](repo:docs/concept/skill-graph/context-and-views.en.md)) geprüft werden.
