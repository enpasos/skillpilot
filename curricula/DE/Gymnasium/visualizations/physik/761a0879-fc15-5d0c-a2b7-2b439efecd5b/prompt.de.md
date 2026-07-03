# Lernzielvisualisierung: Numerische Simulation von Bewegungen

## SkillPilot-Ziel

- SkillPilot-ID: `761a0879-fc15-5d0c-a2b7-2b439efecd5b`
- Titel: Numerische Simulation von Bewegungen
- Beschreibung: Die lernende Person kann Bewegungen mit Reibung durch Differenzenquotienten modellieren und mithilfe einer Tabellenkalkulation oder ähnlicher Werkzeuge numerisch simulieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `761a0879-fc15-5d0c-a2b7-2b439efecd5b.jpg`
- Public Asset: `/assets/goal-visualizations/physik/761a0879-fc15-5d0c-a2b7-2b439efecd5b/761a0879-fc15-5d0c-a2b7-2b439efecd5b.jpg`

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

Titel: Numerische Simulation von Bewegungen
Beschreibung: Die lernende Person kann Bewegungen mit Reibung durch Differenzenquotienten modellieren und mithilfe einer Tabellenkalkulation oder ähnlicher Werkzeuge numerisch simulieren.

Zusatzanweisung:
Pflichtinhalt:

- Do not include technical identifiers, filenames, watermarks, platform names, or product names.
- Show a numerical simulation of straight-line motion with velocity-dependent friction.
- Required physical model:
  - `m = 2 kg`
  - `Delta t = 1 s`
  - `F_R = -k*v`
  - `k = 0,4 kg/s`
  - `a_n = F_R/m = -0,2*v_n`
  - `v_{n+1} = v_n + a_n*Delta t`
  - `x_{n+1} = x_n + v_n*Delta t`
- Required table:
  - row `n=0`: `x=0`, `v=10`, `a=-2,0`
  - row `n=1`: `x=10`, `v=8`, `a=-1,6`
  - row `n=2`: `x=18`, `v=6,4`, `a=-1,28`
  - row `n=3`: `x=24,4`, `v=5,12`
- Draw one block moving to the right. The velocity arrow `v` starts at the block and points right. The friction arrow `F_R` starts at the block and points left. Do not draw any other force arrows.
- The small velocity-time plot must decrease monotonically and stay positive.
- Add note: `Reibung bremst: v wird kleiner`.

Vermeiden:

- Do not show friction in the same direction as motion.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
