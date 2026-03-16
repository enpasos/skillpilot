# SkillPilot Quality Assurance: Das 4-Stufen-Champion-Modell

**Status:** Perspektivischer QA-Plan zur Weiterentwicklung des Champion-Programms.

## Einordnung

Dieses Modell beschreibt eine geplante vierstufige QA-Kaskade fuer SkillPilot-Curricula. Sie soll die strenge formale Graphen-QA, agentische Pruefungen und die menschliche didaktische Bewertung sauber voneinander trennen.

Wichtig ist die aktuelle Einordnung:

- `Stufe 1a` ist in SkillPilot heute bereits real verankert, vor allem ueber die CI-Pipeline und die Graph-/Schema-Validatoren.
- `Stufe 2` entspricht der heutigen menschlichen Champion-Perspektive als Praxis- und Didaktikanker.
- `Stufe 1b` und `Stufe 1c` sind in diesem Modell **noch perspektivisch**. Sie beschreiben geplante statische und dynamische agentische QA-Stufen, sind aber noch kein voll ausgebauter Standardprozess.

Dieses Modell praezisiert die bestehende Curriculum-QS-Stufenlogik. Die bisherige `Stufe 1` wird in die Unterstufen `1a`, `1b` und `1c` aufgefaltet: `1a` steht fuer die algorithmische CI-QA, `1b` fuer einen perspektivischen statischen KI-Agenten und `1c` fuer einen perspektivischen dynamischen KI-Agenten. `Stufe 2` bleibt weiterhin das sichtbare menschliche Champion-Zertifikat.

## Zielbild

SkillPilot uebersetzt Curricula in maschinenlesbare Kompetenzgraphen. Der Uebergang von einem KI-abgeleiteten Rohstand zu einer praktisch belastbaren QA-Stufe soll skalierbar werden, ohne Fachexpert:innen mit Graphen-Details, JSON-Formalia oder technischen Validierungsregeln zu ueberlasten.

Dafuer wird die QA-Rolle in vier Stufen ausdifferenziert:

## Die 4 Stufen der Qualitaetssicherung

### Stufe 1a: Die CI-Pipeline

Auf dieser Ebene greifen algorithmische und strukturelle Regeln, die ohne inhaltliche Interpretation pruefbar sind.

- Fokus: mathematische und technische Integritaet des DAG
- Beispiele:
  - keine Zyklen in `contains` und `requires`
  - keine unzulaessigen redundanten Abhaengigkeiten
  - valide projizierte Learner-Views, Schema- und ID-Checks

### Stufe 1b: Der statische KI-Agent

Diese Ebene ist **perspektivisch**. Ein statischer Agent soll strukturelle und semantische Guard-Rails pruefen, die ueber reine Graphen-Mathematik hinausgehen, aber ohne Laufzeitsimulation auskommen.

- Fokus: statisch pruefbare didaktische und formale QA-Regeln
- Beispiele:
  - didaktische Routenabdeckung von Motivationsanker bis terminaler Autonomie
  - saubere Trennung von `sourceRef` und didaktischen Materialien
  - formale Vollstaendigkeit von Exam-Knoten, Scoring-Schemata und maschinenlesbaren Aufgabenfeldern

### Stufe 1c: Der dynamische KI-Agent

Auch diese Ebene ist **perspektivisch**. Ein dynamischer Agent soll Curricula wie ein simulierter Lernender durchlaufen und dabei Frontier, Filter und Knotentypen praktisch testen.

- Fokus: Laufzeitverhalten, Sackgassen, versteckte Blocker, Tutor-/Exam-Mechanik
- Beispiele:
  - Simulation von Filtern und Modi
  - Exam-Simulation mit absichtlich unvollstaendigen oder fehlerhaften Antworten
  - Simulation von `Memorize`-Knoten und Spaced-Repetition-Verhalten

### Stufe 2: Der menschliche Champion

Diese Ebene bildet die praktische didaktische Bewertung im echten Nutzungskontext.

- Fokus: Tonalitaet, Altersangemessenheit, Motivation, fachliche Passung und UX
- Aufgabe: Der Champion arbeitet das Curriculum im UI oder ueber den KI-Tutor praktisch durch und bewertet, ob es im echten Lernkontext traegt.
- Ergebnis: Findings werden als Issues oder Tickets festgehalten; bei didaktisch tragfaehigem Stand kann daraus das bestehende QS-Signal fuer das Curriculum entstehen.

## Workflow und Governance

Das Zielbild ist Mensch-Agenten-Teamwork:

1. `Stufe 1a` blockiert mathematisch oder technisch kaputte Zustaende frueh.
2. `Stufe 1b` und `Stufe 1c` sollen perspektivisch formale und simulierte Findings automatisiert vorstrukturieren.
3. `Stufe 2` bewertet die didaktische Praxisqualitaet.
4. Findings werden ueber Issues und Pull Requests abgearbeitet.
5. Menschliche Maintainer entscheiden bei Zielkonflikten und sichern die fachliche Intention.

## Fazit

Das 4-Stufen-Champion-Modell ist ein **perspektivischer Ausbauplan** fuer die SkillPilot-QA. Heute sind insbesondere die algorithmische CI-QA (`Stufe 1a`) und die menschliche Champion-Praxis (`Stufe 2`) die realen Anker. Die beiden agentischen Zwischenstufen (`Stufe 1b` und `Stufe 1c`) sind bewusst als naechste Ausbaustufen formuliert, nicht als bereits voll eingefuehrter Standardprozess.
