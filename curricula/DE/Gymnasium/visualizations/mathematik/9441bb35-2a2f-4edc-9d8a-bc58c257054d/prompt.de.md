# Lernzielvisualisierung: Graphen von Flächeninhaltsfunktionen skizzieren

## SkillPilot-Ziel

- SkillPilot-ID: `9441bb35-2a2f-4edc-9d8a-bc58c257054d`
- Titel: Graphen von Flächeninhaltsfunktionen skizzieren
- Beschreibung: Die lernende Person kann zu dem Graphen einer gegebenen Randfunktion den Graphen der zugehörigen Flächeninhaltsfunktion qualitativ skizzieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `9441bb35-2a2f-4edc-9d8a-bc58c257054d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/9441bb35-2a2f-4edc-9d8a-bc58c257054d/9441bb35-2a2f-4edc-9d8a-bc58c257054d.jpg`

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

Titel: Graphen von Flächeninhaltsfunktionen skizzieren
Beschreibung: Die lernende Person kann zu dem Graphen einer gegebenen Randfunktion den Graphen der zugehörigen Flächeninhaltsfunktion qualitativ skizzieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Graph einer Flaecheninhaltsfunktion qualitativ skizzieren.
- Zeige zwei uebereinander liegende Koordinatensysteme.
- Oben: Randfunktion f(t) als stueckweise konstante Funktion:
  f(t)=2 fuer 0 <= t <= 2,
  f(t)=-1 fuer 2 <= t <= 4,
  f(t)=1 fuer 4 <= t <= 5.
- Unten: Flaecheninhaltsfunktion A(x)=integral_0^x f(t) dt.
- Markiere die Stuetzpunkte von A:
  A(0)=0,
  A(2)=4,
  A(4)=2,
  A(5)=3.
- Der Graph von A soll zwischen diesen Punkten geradlinig verlaufen:
  steigend von (0|0) nach (2|4),
  fallend von (2|4) nach (4|2),
  steigend von (4|2) nach (5|3).
- Ergebnisbox: f positiv -> A steigt; f negativ -> A faellt; f=0 waere waagerecht.

Vermeiden:
- A nicht mit f verwechseln.
- Keine Parabel zeichnen; bei stueckweise konstantem f ist A stueckweise linear.
- Keine falschen Stuetzpunkte.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
