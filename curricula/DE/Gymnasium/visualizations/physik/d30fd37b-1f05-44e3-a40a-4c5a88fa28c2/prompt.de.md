# Lernzielvisualisierung: Elastische Stöße im Schwerpunktsystem analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `d30fd37b-1f05-44e3-a40a-4c5a88fa28c2`
- Titel: Elastische Stöße im Schwerpunktsystem analysieren
- Beschreibung: Die lernende Person kann elastische Stöße im Schwerpunktsystem analysieren, Relativgeschwindigkeiten vor und nach dem Stoß verknüpfen und Ergebnisse ins Laborsystem zurücktransformieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `d30fd37b-1f05-44e3-a40a-4c5a88fa28c2.jpg`
- Public Asset: `/assets/goal-visualizations/physik/d30fd37b-1f05-44e3-a40a-4c5a88fa28c2/d30fd37b-1f05-44e3-a40a-4c5a88fa28c2.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Physik; dieser Kontext dient nur der Stil- und Anspruchswahl und soll nicht als Bildtext erscheinen.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Elastische Stöße im Schwerpunktsystem analysieren
Beschreibung: Die lernende Person kann elastische Stöße im Schwerpunktsystem analysieren, Relativgeschwindigkeiten vor und nach dem Stoß verknüpfen und Ergebnisse ins Laborsystem zurücktransformieren.

Zusatzanweisung:
Pflichtinhalt:

Show elastic collision analysis in the center-of-mass frame using signed velocity tables.

Title: `Stoß im Schwerpunktsystem`

Use a clean worksheet layout with no physical arrows.

Top row:
- label `Schwerpunktsystem S*`
- table with columns `vorher` and `nachher`
- row `v_A*`: `+1 m/s` before, `-1 m/s` after
- row `v_B*`: `-1 m/s` before, `+1 m/s` after
- note `Relativgeschwindigkeit kehrt ihr Vorzeichen um`
- formula `v_rel,nach* = - v_rel,vor*`

Bottom row:
- label `Ruecktransformation ins Laborsystem`
- show `v_S = +2 m/s`
- table with columns `vorher` and `nachher`
- row `v_A = v_A* + v_S`: `3 m/s` before, `1 m/s` after
- row `v_B = v_B* + v_S`: `1 m/s` before, `3 m/s` after

Visual cue:
- show two colored dots A and B beside each table, but do not use arrows
- signed values must carry the direction information

Vermeiden:

Do not draw physical arrows.
Do not draw force arrows.
Do not mix up the starred center-of-mass velocities with lab velocities.
Do not write `v_rel,nach* = v_rel,vor*`; the sign must flip.
Do not use unequal masses in this example.
Do not make the lab transformation subtract `v_S`.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
