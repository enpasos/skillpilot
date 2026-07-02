# Lernzielvisualisierung: Kosinussatz herleiten

## SkillPilot-Ziel

- SkillPilot-ID: `786ae588-a4fb-40e6-a7f5-113cfc2bfd0f`
- Titel: Kosinussatz herleiten
- Beschreibung: Die lernende Person kann den Kosinussatz in einem allgemeinen Dreieck mithilfe geeigneter Zerlegungen oder Koordinatenüberlegungen herleiten und den Satz des Pythagoras als Spezialfall erklären.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `786ae588-a4fb-40e6-a7f5-113cfc2bfd0f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/786ae588-a4fb-40e6-a7f5-113cfc2bfd0f/786ae588-a4fb-40e6-a7f5-113cfc2bfd0f.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Mathematik.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible mathematische Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Kosinussatz herleiten
Beschreibung: Die lernende Person kann den Kosinussatz in einem allgemeinen Dreieck mithilfe geeigneter Zerlegungen oder Koordinatenüberlegungen herleiten und den Satz des Pythagoras als Spezialfall erklären.

Zusatzanweisung:
Pflichtinhalt:

Derive the cosine rule with a coordinate argument. Prefer algebra cards over a detailed geometric construction.

Use exactly this setup:
- `A=(0|0)`
- `B=(c|0)`
- `C=(b*cos(alpha) | b*sin(alpha))`
- side names:
  - `a = |BC|`
  - `b = |CA|`
  - `c = |AB|`
  - `alpha` is the angle at `A`

Show the derivation:
- `a^2 = (b*cos(alpha)-c)^2 + (b*sin(alpha))^2`
- `a^2 = b^2*cos^2(alpha) - 2bc*cos(alpha) + c^2 + b^2*sin^2(alpha)`
- `sin^2(alpha)+cos^2(alpha)=1`
- final: `a^2 = b^2 + c^2 - 2bc*cos(alpha)`

Add one special-case note:
- `alpha=90° => cos(alpha)=0 => a^2=b^2+c^2`
- Show this special case as a formula-only note. Do not draw a second right-triangle inset for the special case.

Vermeiden:

Do not draw projection segments unless they exactly match the coordinate formulas.
Do not swap the side names `a`, `b`, `c`.
Do not put `alpha` at any vertex except `A`.
Do not write `+ 2bc*cos(alpha)`; the sign must be negative.
Do not omit the squared sine/cosine identity.
Do not add arrows or leader lines between formulas.
Do not add any additional small triangle whose side labels could conflict with the coordinate setup.
Do not write audience or subject labels such as `Gymnasium`, `Mathematik`, `Schule`, or `Klasse`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
