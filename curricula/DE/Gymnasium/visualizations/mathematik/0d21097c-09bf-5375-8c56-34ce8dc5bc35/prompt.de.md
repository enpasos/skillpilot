# Lernzielvisualisierung: Erweiterte Integrationsregeln anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `0d21097c-09bf-5375-8c56-34ce8dc5bc35`
- Titel: Erweiterte Integrationsregeln anwenden (LK)
- Beschreibung: Die lernende Person kann Integrale von Funktionen der Form $(ax+b)^r$ für $r\in\mathbb{Q}\setminus\{-1\}$ sowie von Funktionen der Form $g(x)=f'(x)\cdot e^{f(x)}$ mithilfe passender Regeln berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `0d21097c-09bf-5375-8c56-34ce8dc5bc35.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/0d21097c-09bf-5375-8c56-34ce8dc5bc35/0d21097c-09bf-5375-8c56-34ce8dc5bc35.jpg`

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

Titel: Erweiterte Integrationsregeln anwenden (LK)
Beschreibung: Die lernende Person kann Integrale von Funktionen der Form $(ax+b)^r$ für $r\in\mathbb{Q}\setminus\{-1\}$ sowie von Funktionen der Form $g(x)=f'(x)\cdot e^{f(x)}$ mithilfe passender Regeln berechnen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Erweiterte Integrationsregeln anwenden (LK).
- Zeige zwei getrennte Regelkarten:

1. Lineare Klammerpotenz:
  integral (2x+1)^3 dx = (2x+1)^4 / 8.
  Check: Ableitung von (2x+1)^4 / 8 ist (2x+1)^3.

2. Form f'(x)*e^(f(x)):
  f(x)=x^2+1, f'(x)=2x.
  integral 2x*e^(x^2+1) dx = e^(x^2+1).
  Check: Ableitung von e^(x^2+1) ist 2x*e^(x^2+1).

- Ergebnisbox: Innere Ableitung erkennen; rueckwaerts zur passenden Stammfunktion gehen.

Vermeiden:
- Bei (2x+1)^3 nicht durch 4 allein teilen; richtig ist durch 8.
- Nicht e^(x^2+1) mit zusaetzlichem Faktor 1/2 versehen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
