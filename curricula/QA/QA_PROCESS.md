# Curriculum Quality Assurance (QA) Process

Dieses Dokument beschreibt den standardisierten Prozess zur Qualitätssicherung (QA) und didaktischen Validierung von Skill-Graphen im SkillPilot-Projekt. 

Das Ziel dieses Prozesses ist es, Curricula nicht nur auf strukturelle Integrität (wie fehlerhafte IDs oder Zyklen) zu prüfen, sondern ihre **didaktische und semantische Kohärenz** sicherzustellen.

## Die Methode: Curriculum Simulation (Didaktischer Linter)

Der KI-Agent nimmt die Rolle einer "lernenden Person" ein und traversiert den Skill-Graphen. Dabei geht er wie folgt vor:

1. **Frontier-Bildung**: Der Agent ermittelt alle Lernziele, bei denen sämtliche `requires`-Vorbedingungen bereits "abgehakt" (also gelernt) sind.
2. **Knoten-Auswahl**: Aus dieser Frontier wählt der Agent einen neuen, noch nicht behandelten Knoten (bevorzugt aus dem aktuell behandelten thematischen Cluster, um den Kontext zu wahren).
3. **Geführte Reflexion**: Der Agent analysiert das Lernziel im Kontext des bisher *akkumulierten Wissens* anhand fester Leitfragen:
   - *Ist der Schritt zu groß?* (Wird Vorwissen benötigt, das im bisherigen Pfad fehlt, z.B. mathematische Grundlagen wie Kreuzprodukt oder Vektorrechnung?)
   - *Ist ein Zwischenschritt oder eine stärkere Aufteilung sinnvoll?* (Enthält das Ziel zu viele verschiedene, schwergewichtige Konzepte auf einmal?)
   - *Wurde das Lernziel vielleicht schon behandelt?* (Gibt es didaktische Redundanzen, die bereinigt werden sollten?)
   - *Ist der Schritt zu klein?* (Könnte man diesen Knoten mit einem anderen trivialen Knoten mergen?)
4. **Intervention**: Findet der Agent eine Unstimmigkeit ("Finding"), stoppt er die automatische Evaluierung. Er dokumentiert das Problem und schlägt dem Benutzer mögliche Lösungswege vor.
5. **Human-in-the-loop**: Der Benutzer entscheidet über das Vorgehen (z.B. "Neuen Mathematik-Knoten als Vorbedingung einfügen").
6. **Regelerfassung**: Der Agent setzt die Entscheidung im JSON-Graphen um und notiert die zugrundeliegende Design-Entscheidung als neue allgemeine Regel (z.B. "LK-Physik benötigt explizit definierte LK-Mathe-Knoten"). Diese Regeln werden für den weiteren Verlauf des QA-Prozesses berücksichtigt.
7. **Fortsetzung**: Der Evaluierungs-Loop wird bei Schritt 1 fortgesetzt.

## Verwaltung des Fortschritts (State Tracking)

Jedes Curriculum, das diesem Prozess unterzogen wird, erhält eine eigene Checklisten- und Status-Datei im Verzeichnis `curricula/QA/` (z.B. `DE_HES_S_GYM_2_PHYSIK_QA.md`).

Diese Datei dient als **Speicher für den Agenten**, um den Prozess jederzeit unterbrechen und später am exakt gleichen Punkt fortsetzen zu können. Sie beinhaltet:

*   **Abgehakte Lernziele**: Eine Liste (oder Checkliste) der bereits validierten Knoten (IDs oder Titel).
*   **Akkumuliertes Vorwissen**: Eine sehr kompakte Zusammenfassung der abstrakten Kernkonzepte, die die "Lernende Person" bis zum aktuellen Punkt verstanden hat.
*   **Lessons Learned / Design Rules**: Eine fortlaufende Liste von Regeln, die der Agent im Umgang mit diesem spezifischen Curriculum gelernt hat (z.B. Feedback vom Benutzer).

## Wiederaufsetzen des Prozesses (How to Resume)

Wenn der Agent den Prozess fortsetzen soll, liest er als erstes dieses Dokument (`QA_PROCESS.md`) und anschließend die modellspezifische Status-Datei (z.B. `DE_HES_S_GYM_2_PHYSIK_QA.md`), um seinen "Memory-State" wiederherzustellen. Danach analysiert er die originale `*.json`-Curriculum-Datei, ermittelt die aktuelle Frontier aus den nicht abgehakten Zielen und beginnt die nächste Iteration.
