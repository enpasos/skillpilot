# Lernzielvisualisierung: Integral als Bestand und Flächeninhalt verstehen

## SkillPilot-Ziel

- SkillPilot-ID: `2afba4a2-287d-5e8f-aeee-a3bcf8652236`
- Titel: Integral als Bestand und Flächeninhalt verstehen
- Beschreibung: Die lernende Person kann das bestimmte Integral als Bestandsgröße und als orientierten Flächeninhalt deuten und aus einer Änderungsrate mit Anfangsbestand den Bestand in einfachen Sachsituationen rekonstruieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `2afba4a2-287d-5e8f-aeee-a3bcf8652236.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/2afba4a2-287d-5e8f-aeee-a3bcf8652236/2afba4a2-287d-5e8f-aeee-a3bcf8652236.jpg`

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

Titel: Integral als Bestand und Flächeninhalt verstehen
Beschreibung: Die lernende Person kann das bestimmte Integral als Bestandsgröße und als orientierten Flächeninhalt deuten und aus einer Änderungsrate mit Anfangsbestand den Bestand in einfachen Sachsituationen rekonstruieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Integral als Bestand und als Flaecheninhalt verstehen.
- Verwende einen einfachen Tank-Kontext:
  Anfangsbestand B(0)=5 Liter.
  Zuflussrate r(t)=2 Liter pro Minute fuer 0 <= t <= 3.
- Zeige links ein Koordinatensystem mit r(t)=2 als waagerechte Linie von t=0 bis t=3.
- Schattiere das Rechteck unter r(t) von 0 bis 3.
- Rechnung:
  integral_0^3 r(t) dt = 3 * 2 = 6 Liter.
  B(3) = B(0) + integral_0^3 r(t) dt = 5 + 6 = 11 Liter.
- Ergebnisbox: Integral = Zuwachs des Bestands = Flaecheninhalt unter der Rate.

Vermeiden:
- Das Integral nicht als Endbestand 6 deuten; der Endbestand ist 11 Liter.
- Keine negative Flaeche in diesem Beispiel.
- Keine falschen Einheiten: Rate in Liter pro Minute, Integral in Liter.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
