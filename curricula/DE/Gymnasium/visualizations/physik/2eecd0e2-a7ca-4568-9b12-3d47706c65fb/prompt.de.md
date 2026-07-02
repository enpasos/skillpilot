# Lernzielvisualisierung: Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `2eecd0e2-a7ca-4568-9b12-3d47706c65fb`
- Titel: Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren
- Beschreibung: Die lernende Person kann einfache Stossvorgaenge quantitativ untersuchen, dabei Impuls- und Energieerhaltung fachlich nutzen und die Rolle von Erhaltungssaetzen in der Mechanik erklaeren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `2eecd0e2-a7ca-4568-9b12-3d47706c65fb.jpg`
- Public Asset: `/assets/goal-visualizations/physik/2eecd0e2-a7ca-4568-9b12-3d47706c65fb/2eecd0e2-a7ca-4568-9b12-3d47706c65fb.jpg`

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

Titel: Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren
Beschreibung: Die lernende Person kann einfache Stossvorgaenge quantitativ untersuchen, dabei Impuls- und Energieerhaltung fachlich nutzen und die Rolle von Erhaltungssaetzen in der Mechanik erklaeren.

Zusatzanweisung:
Pflichtinhalt:

Show a simple one-dimensional elastic collision of two carts with equal masses.
Use a before/after table and a minimal track diagram.

Use exactly this example:
- cart A mass `m_A = 1 kg`
- cart B mass `m_B = 1 kg`
- before: `v_A = 2 m/s` to the right, `v_B = 0 m/s`
- after: `v_A' = 0 m/s`, `v_B' = 2 m/s` to the right

Show the conservation checks:
- `p_vor = 1*2 + 1*0 = 2 kg m/s`
- `p_nach = 1*0 + 1*2 = 2 kg m/s`
- `E_vor = 1/2*1*2^2 = 2 J`
- `E_nach = 1/2*1*2^2 = 2 J`

Diagram rules:
- one horizontal track
- before panel: cart A on the left, cart B on the right, one velocity arrow from cart A to the right labelled `2 m/s`; no velocity arrow on cart B
- after panel: cart A on the left at rest, cart B on the right, one velocity arrow from cart B to the right labelled `2 m/s`
- all arrows must start at the cart whose velocity they show and point exactly to the right
- use a plain clean background with no decorative border

Vermeiden:

Do not show a two-dimensional collision or angled motion.
Do not use unequal masses.
Do not draw any arrow from B before the collision.
Do not draw any arrow from A after the collision.
Do not draw any decorative arrows, gears, motion arrows, dashed arrows, or border icons.
Do not draw any arrow except the two requested velocity arrows.
Do not show a loss of kinetic energy in this example.
Do not write audience or subject labels such as `Gymnasium`, `Physik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
