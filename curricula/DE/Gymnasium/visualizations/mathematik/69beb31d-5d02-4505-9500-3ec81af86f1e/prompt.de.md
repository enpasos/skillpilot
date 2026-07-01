# Lernzielvisualisierung: Lagebeziehungen von Geraden im Raum untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `69beb31d-5d02-4505-9500-3ec81af86f1e`
- Titel: Lagebeziehungen von Geraden im Raum untersuchen
- Beschreibung: Die lernende Person kann Lagebeziehungen zweier Geraden im Raum untersuchen, dazu auch lineare Gleichungssysteme systematisch lösen und die Ergebnisse geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `69beb31d-5d02-4505-9500-3ec81af86f1e.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/69beb31d-5d02-4505-9500-3ec81af86f1e/69beb31d-5d02-4505-9500-3ec81af86f1e.jpg`

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

Titel: Lagebeziehungen von Geraden im Raum untersuchen
Beschreibung: Die lernende Person kann Lagebeziehungen zweier Geraden im Raum untersuchen, dazu auch lineare Gleichungssysteme systematisch lösen und die Ergebnisse geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration wegen visueller Gefahr: Im windschiefen Fall duerfen die Geraden nicht parallel aussehen und duerfen sich nicht schneiden.
- Thema: Lagebeziehungen zweier Geraden im Raum untersuchen.
- Zeige drei getrennte Panels mit klar verschiedener Raumlage:
  1) Schneidend:
     g: X=(0; 0; 0)+s*(1; 1; 0).
     h: X=(1; 0; 0)+t*(0; 1; 0).
     Gleichsetzen ergibt s=1 und t=1.
     Schnittpunkt S=(1;1;0).
  2) Echt parallel:
     p: X=(0; 0; 1)+r*(1; 2; 0).
     q: X=(0; 1; 1)+u*(1; 2; 0).
     Richtungsvektoren gleich, aber (0;1;0) ist kein Vielfaches von (1;2;0).
     Ergebnis: parallel, kein gemeinsamer Punkt.
  3) Windschief:
     a: X=(0; 0; 0)+m*(1; 0; 0), also x-Richtung auf Hoehe z=0.
     b: X=(0; 1; 1)+n*(0; 1; 0), also y-Richtung auf Hoehe z=1.
     Zeichne a als waagerechte x-Richtungsgerade auf der unteren Ebene z=0.
     Zeichne b deutlich darueber auf Hoehe z=1 und in y-Richtung, also sichtbar quer zu a.
     Die beiden Geraden duerfen in der Perspektive nicht parallel wirken und duerfen keinen gemeinsamen Punkt beruehren.
     Rechnung: Richtungsvektoren nicht parallel; Gleichsetzen erzwingt z: 0=1, also keine Loesung.
     Ergebnis: windschief.
- Deutung:
  Schneidend = ein gemeinsamer Punkt.
  Parallel = gleiche Richtung, kein gemeinsamer Punkt.
  Windschief = nicht parallel und kein gemeinsamer Punkt im Raum.

Vermeiden:
- Windschiefe Geraden nicht parallel zeichnen.
- Windschiefe Geraden nicht schneiden lassen.
- Im windschiefen Panel keine zwei gleich gerichteten Pfeile verwenden.
- Nicht "windschief = parallel" schreiben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
