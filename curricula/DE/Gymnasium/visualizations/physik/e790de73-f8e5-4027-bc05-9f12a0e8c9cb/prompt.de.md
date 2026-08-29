# Lernzielvisualisierung: Kraftstoß

## SkillPilot-Ziel

- SkillPilot-ID: `e790de73-f8e5-4027-bc05-9f12a0e8c9cb`
- Titel: Kraftstoß
- Beschreibung: Die lernende Person kann den Kraftstoß als über die Einwirkdauer aufsummierte Wirkung der resultierenden äußeren Kraft beschreiben, ihn in einer gewählten Richtung als vorzeichenbehaftete Fläche unter einem Kraft-Zeit-Diagramm und bei konstanter Kraft als Produkt aus Kraft und Einwirkdauer bestimmen sowie mit der Impulsänderung verknüpfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `e790de73-f8e5-4027-bc05-9f12a0e8c9cb.jpg`
- Public Asset: `/assets/goal-visualizations/physik/e790de73-f8e5-4027-bc05-9f12a0e8c9cb/e790de73-f8e5-4027-bc05-9f12a0e8c9cb.jpg`

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

Titel: Kraftstoß
Beschreibung: Die lernende Person kann den Kraftstoß als zeitliches Integral der resultierenden äußeren Kraft beziehungsweise in einer gewählten Richtung als vorzeichenbehaftete Fläche unter dem Kraft-Zeit-Diagramm beschreiben, ihn bei konstanter Kraft als Produkt aus Kraft und Einwirkdauer bestimmen und mit der Impulsänderung verknüpfen.

Zusatzanweisung:
Zielpräzisierung:
Deute den Kraftstoß allgemein als zeitliches Integral der resultierenden äußeren Kraft beziehungsweise in der gewählten Richtung als vorzeichenbehaftete Fläche; zeige den konstanten Spezialfall J=F·Δt und die Impulsänderung.

Pflichtinhalt:

Show impulse as area under a force-time graph and as momentum change.

Title: `Kraftstoß`

Main visual:
- draw one simple force-time diagram
- horizontal axis `t/s`
- vertical axis `F/N`
- show a rectangle from `t = 0` to `t = 0,2 s`
- rectangle height `F = 50 N`
- shade the rectangle and label it `Kraftstoß J`

Calculation box:
- `J = F * Δt`
- `J = 50 N * 0,2 s`
- `J = 10 N s`
- `J = Δp`

Small momentum line:
- `p_vor = 4 kg m/s`
- `p_nach = 14 kg m/s`
- `Δp = 10 kg m/s`

Vermeiden:

Do not draw a moving object or collision scene.
Do not draw physical force arrows.
Do not make the rectangle area inconsistent with the calculation.
Do not write `J = F / Δt`.
Do not confuse impulse `J` with energy in joule.
Do not write `10 J`; the impulse unit must be `N s` or `kg m/s`.
Do not write audience or school labels such as `Gymnasium`, `Schule`, or `Klasse`.
```

## Review-Notiz

Kompatibilitätsprüfung 2026-08-29: Das unveränderte Nano-Banana-Pro-Asset bleibt mit Fläche, konstantem Kraft-Zeit-Produkt und Impulsänderung vollständig kompatibel. Assetbytes und Digest sowie der historische eingezäunte Generator-Prompt bleiben unverändert.
