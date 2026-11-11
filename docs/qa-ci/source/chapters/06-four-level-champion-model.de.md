## SkillPilot-Qualitätssicherung: Das Vier-Stufen-Champion-Modell {#sec:qa-four-level-model}

:::note{title="Zukunftsgerichteter Ausbauplan"}
Zielbild für den stufenweisen Ausbau der Curriculum-QS zwischen algorithmischer CI, KI-Agenten und menschlicher Praxiserprobung. Für die heute produktiv ausgewiesenen Reifegrade und Erprobungsbadges gilt verbindlich @ref{sec:qa-quality-human-trial} (`Level 1a` und `Level 2` sind heute produktive Anker; `Level 1b` und `Level 1c` beschreiben geplante Ausbaustufen).
:::

### Einordnung und die vier QS-Stufen {#sec:qa-four-levels}

Damit Fachexpertinnen und -experten beim Übergang von KI-extrahierten Rohgraphen zu schulreifen Skill-Landschaften nicht mit JSON-Formalia oder DAG-Mathematik überlastet werden, gliedert das Zielmodell das frühere `Level 1` in drei technische/agentische Vorstufen (`1a`, `1b`, `1c`) vor dem menschlichen Praxissiegel (`Level 2`):

:::table{cols="3.8cm,2.8cm,X"}
| Stufe | Heutiger Stand | Prüffokus und typische Aufgaben |
| --- | --- | --- |
| **`Level 1a`: CI-Pipeline** | **Produktiv aktiv** | Algorithmische Strukturintegrität ohne Inhaltsdeutung: Zyklenfreiheit in `contains`/`requires`, Schema- und ID-Prüfungen, gültige View-Projektionen (@ref{sec:qa-graph-validation}). |
| **`Level 1b`: Statischer KI-Agent** | Zukunftsgerichtet | Statische didaktisch-formale Leitplanken ohne Laufzeitsimulation: Routenabdeckung von Motivation bis Autonomie, saubere Trennung von `sourceRef` und Didaktikmaterial, formale Vollständigkeit von Prüfungs- und Bewertungsschemata. |
| **`Level 1c`: Dynamischer KI-Agent** | Zukunftsgerichtet | Simulierte Lernendendurchläufe unter Laufzeitbedingungen: Frontier- und Filterverhalten, Sackgassen/verdeckte Blocker, Prüfungssimulation mit unvollständigen/falschen Antworten sowie SRS-`Memorize`-Abläufe. |
| **`Level 2`: Menschlicher Champion** | **Produktiv aktiv** | Reale didaktische Praxiserprobung in WebGUI oder KI-Lerncoach: Tonalität, Altersangemessenheit, Motivation, fachliche Passung und UX mit Rückmeldung über Issues/PRs bis zum Status **Menschlich erprobt** (@ref{sec:qa-champion-guide}). |
:::

### Zusammenspiel und Governance {#sec:qa-four-levels-governance}

Das Modell folgt einer klaren Mensch-Agenten-Arbeitsteilung:

1. `Level 1a` blockiert mathematisch oder technisch defekte Graphen frühzeitig in der CI.
2. `Level 1b` und `Level 1c` strukturieren künftig formale und simulierte Befunde automatisiert vor.
3. `Level 2` beurteilt die tatsächliche Unterrichts- und Lernqualität am echten Curriculum.
4. Befunde fließen transparent in GitHub Issues und Pull Requests zurück.
5. Menschliche Maintainer entscheiden Konfliktfälle und wahren die fachdidaktische Richtung.
