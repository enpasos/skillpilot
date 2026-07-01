# Lernzielvisualisierung: Intervalladditivität und Linearität von Integralen nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `649b673c-1a74-5dc5-af01-b4c9e090b90d`
- Titel: Intervalladditivität und Linearität von Integralen nutzen
- Beschreibung: Die lernende Person kann bestimmte Integrale mithilfe von Intervalladditivität und Linearität umformen, zerlegen, zusammenfassen und die Rechenschritte fachlich begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `649b673c-1a74-5dc5-af01-b4c9e090b90d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/649b673c-1a74-5dc5-af01-b4c9e090b90d/649b673c-1a74-5dc5-af01-b4c9e090b90d.jpg`

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

Titel: Intervalladditivität und Linearität von Integralen nutzen
Beschreibung: Die lernende Person kann bestimmte Integrale mithilfe von Intervalladditivität und Linearität umformen, zerlegen, zusammenfassen und die Rechenschritte fachlich begründen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Intervalladditivitaet und Linearitaet von Integralen nutzen.
- Verwende genau f(x)=x+1.
- Intervalladditivitaet auf [0,4] mit Trennpunkt 2:
  integral_0^4 f(x) dx = integral_0^2 f(x) dx + integral_2^4 f(x) dx.
  integral_0^2 (x+1) dx = 4.
  integral_2^4 (x+1) dx = 8.
  Summe = 12.
- Linearitaet auf [0,2]:
  integral_0^2 (2f(x)+1) dx = 2*integral_0^2 f(x) dx + integral_0^2 1 dx
  = 2*4 + 2 = 10.
- Ergebnisbox: Zerlegen nach Intervallen und Ausklammern/Summieren von Funktionen sind erlaubte Integralregeln.

Vermeiden:
- Nicht 4+8 als 14 ausgeben; richtig ist 12.
- Bei der Linearitaet den konstanten Anteil 1 nicht vergessen; integral_0^2 1 dx = 2.
- Keine falsche Schreibweise der Grenzen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
