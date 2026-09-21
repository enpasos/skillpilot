# Lernzielvisualisierung: Allgemeinen Transformationsterm interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `a12bef54-7595-5f48-a7a8-9cfe1d8e9729`
- Titel: Allgemeinen Transformationsterm interpretieren
- Beschreibung: Die lernende Person kann den Term $g(x)=a\cdot f(b\cdot(x-c))+d$ als Kombination von Verschiebung, Streckung beziehungsweise Stauchung und Spiegelung deuten, auch ohne konkret gegebenen Funktionsterm von $f$.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation
- Status: pilot
- Quellbild: `a12bef54-7595-5f48-a7a8-9cfe1d8e9729.png`
- Public Asset: `/assets/goal-visualizations/mathematik/a12bef54-7595-5f48-a7a8-9cfe1d8e9729/a12bef54-7595-5f48-a7a8-9cfe1d8e9729.png`

## Prompt

```text
Erstelle eine gezielte generative Bildkorrektur der beigefügten Referenz. Behalte ihre freundliche, klare, abstrakte Comic-Bildsprache, Pastellfarben, schwarzen Konturen und gut lesbare deutsche Beschriftung bei. Ausgabe: einzelnes PNG im Querformat, keine technische ID, kein Logo, keine Wasserzeichen. Die mathematisch richtigen Bereiche bleiben so weit wie möglich erhalten. Korrigiere den folgenden konkreten fachlichen Befund; eine richtige Formel darf nicht neben einer widersprüchlichen Zeichnung stehen.

Korrigiere unten ausschließlich die Reihenfolge der Operationskästen für g(x)=-2·f(0,5·(x-3))+1. Neue Reihenfolge von links nach rechts: 'in x-Richtung mit Faktor2 strecken' -> '3 nach rechts verschieben' -> 'in y-Richtung mit Faktor2 strecken' -> 'an der x-Achse spiegeln' -> '1 nach oben verschieben'. Der horizontale Effekt muss x_neu=2·x_alt+3 sein, niemals2·x_alt+6. Falls Platz vorhanden, eine kleine Kontrollzeile '(u,v) → (2u+3,1−2v)'. Erhalte den allgemeinen Term g(x)=a·f(b·(x-c))+d und die vier oberen Farbfelder. Nutze dort 'b≠0' beim horizontalen Faktor1/|b|, falls eine Bedingung ergänzt wird. Keine neue Kurve und keine anderen Transformationen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
