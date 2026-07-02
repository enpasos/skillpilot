# Lernzielvisualisierung: Bewegungen mit Diagrammen untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `ce431132-dfc4-42c2-aff6-bd72035190f8`
- Titel: Bewegungen mit Diagrammen untersuchen
- Beschreibung: Die lernende Person kann einfache Bewegungen experimentell erfassen und in t-s-, t-v- und t-a-Diagrammen darstellen und interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `ce431132-dfc4-42c2-aff6-bd72035190f8.jpg`
- Public Asset: `/assets/goal-visualizations/physik/ce431132-dfc4-42c2-aff6-bd72035190f8/ce431132-dfc4-42c2-aff6-bd72035190f8.jpg`

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

Titel: Bewegungen mit Diagrammen untersuchen
Beschreibung: Die lernende Person kann einfache Bewegungen experimentell erfassen und in t-s-, t-v- und t-a-Diagrammen darstellen und interpretieren.

Zusatzanweisung:
Pflichtinhalt:

Show one simple motion represented consistently in three diagrams.

Title: `Bewegungen mit Diagrammen untersuchen`

Motion data:
- use the same motion in all diagrams: `t = 0, 1, 2, 3 s` and `s = 0, 2, 4, 6 m`
- this is a uniform motion with `v = 2 m/s` and `a = 0 m/s^2`

Three mini graphs:
1. `t-s-Diagramm`
   - horizontal axis `t/s`
   - vertical axis `s/m`
   - straight rising line through `(0,0)`, `(1,2)`, `(2,4)`, `(3,6)`
2. `t-v-Diagramm`
   - horizontal axis `t/s`
   - vertical axis `v/(m/s)`
   - horizontal line at `v = 2`
3. `t-a-Diagramm`
   - horizontal axis `t/s`
   - vertical axis `a/(m/s^2)`
   - line on the zero axis, labelled `a = 0`

Small note:
- `gleiche Strecke pro gleicher Zeit`
- `Steigung im t-s-Diagramm = Geschwindigkeit`

Vermeiden:

Do not make the `t-v` graph rising for this uniform motion.
Do not draw nonzero acceleration in the `t-a` graph.
Do not curve the `t-s` graph.
Do not swap the time axis with the measured quantity axis.
Do not add physical arrows between points.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
