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

#### Strategie 3: Einheit für Einheit (*Zielstandard; Umsetzung `F13` offen*)

- **Konzept:** Folgt den erklärten fachlichen Lerneinheiten und Planeinheiten sowie deren Geschwisterfolge `after` ([Graph-Definition §11.5](repo:docs/concept/skill-graph/learning-unit-progression.md#sec-unit-by-unit)), ohne die berechnete Frontier einzuschränken oder technische Einheitssperren aufzubauen.
- **Einsatzfall:** Vorgesehener Standardmodus für Lernende, die eine begonnene Einheit zusammenhängend bis zu ihren Nachweisen durcharbeiten möchten, bevor die nächste Einheit an die Reihe kommt.
- **Umsetzung:** Rekursiver Abstieg von der Wurzel über offene Kinder mit erreichbaren Frontier-Zielen in `stateMachineOptions` nach vier Stufen: (1) offene Kindeinheit, die sowohl *an der Reihe* (alle Vorgänger aus `after` und kreuzendem Bedarf erledigt) als auch bereits *begonnen* ist, (2) offenes Kind an der Reihe, (3) offene begonnene Einheit, (4) übrige Kinder mit erreichbarem Frontier-Ziel. *Erledigt* prüft effektiv beherrschte Atome im Umfang (einschließlich Prüfungs- und Memorierzielen in diesem Umfang; bewusste andere Zielwahl bleibt möglich); Orientierungsziele behalten beim echten Null-Fortschritts-Einstieg Vorrang, ausdrückliche Lernendenwahl und aktiver Lernplan bleiben vorrangig. Die Laufzeitumsetzung (`F13`) steht noch aus.

### Autopilot-Modus {#sec:autopilot-mode}

Der Autopilot reduziert Navigationsaufwand, indem er nach dem erfolgreichen Abschluss des aktuellen Ziels automatisch das nächste passende Frontier-Ziel aktiviert.

#### Laufzeitverhalten

- **Auslöser:** Greift, sobald das aktuelle `activeGoal` in den Zustand **Gemeistert** (*Mastered*) übergeht.
- **Auswahl:** Wählt das **erste** Ziel der gültigen Frontier nach Anwendung der eingestellten Auswahlstrategie (*Zufällig*, *Sequenziell* oder künftig *Einheit für Einheit*). Ist der Planmodus eines gültigen Lernplans aktiv (siehe @ref{sec:existing-learner-setup}), gelten vorrangig dessen Übergaberegeln und der generische Autopilot wird unterdrückt.
- **Aktion:** Ruft `setActiveGoal(nextGoalId)` automatisch ohne manuellen Zwischenschritt im Lernzielbaum auf.

#### Konfiguration und Speicherung

- **Oberfläche:** Einstellbar im Dialog *Mein Lehrplan* (*Personal Curriculum*).
- **Persistenz:** Gespeichert in der Backend-Entität `Learner` (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`), sodass die Einstellungen sitzungs- und geräteübergreifend erhalten bleiben.
- **API:** Aktualisierung über `PUT /api/ui/learners/{skillpilotId}/preferences` mit partiellem JSON-Payload (`learningStrategy`, `autoPilot`, `strictMode`, `showGoalVisualizationsInChat`); nicht gesendete Felder behalten ihren gespeicherten Wert.
- **Zusammenspiel mit Striktmodus:** `strictMode` legt fest, ob Frontier-Voraussetzungen nur innerhalb des aktiven Ausschnitts (*optimistisch*) oder über die gesamte globale Voraussetzungshülle (*strikt*; siehe [Kontext und Sichten](repo:docs/concept/skill-graph/context-and-views.en.md)) geprüft werden.
