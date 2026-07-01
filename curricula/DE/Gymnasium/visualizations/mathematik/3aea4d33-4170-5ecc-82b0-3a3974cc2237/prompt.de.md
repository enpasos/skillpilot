# Lernzielvisualisierung: Schnittfiguren von Ebenen mit Polyedern bestimmen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `3aea4d33-4170-5ecc-82b0-3a3974cc2237`
- Titel: Schnittfiguren von Ebenen mit Polyedern bestimmen (LK)
- Beschreibung: Die lernende Person kann die Schnittfigur einer Ebene mit einem Polyeder (z. B. Quader/Prisma) konstruieren, Eckpunkte bestimmen und die Figur beschreiben.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `3aea4d33-4170-5ecc-82b0-3a3974cc2237.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/3aea4d33-4170-5ecc-82b0-3a3974cc2237/3aea4d33-4170-5ecc-82b0-3a3974cc2237.jpg`

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

Titel: Schnittfiguren von Ebenen mit Polyedern bestimmen (LK)
Beschreibung: Die lernende Person kann die Schnittfigur einer Ebene mit einem Polyeder (z. B. Quader/Prisma) konstruieren, Eckpunkte bestimmen und die Figur beschreiben.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration wegen Achsen- und Intercept-Risiko: Die drei Achsenabschnitte der Schnittebene muessen eindeutig und nicht vertauscht dargestellt sein.
- Thema: Schnittfigur einer Ebene mit einem Wuerfel bestimmen.
- Verwende exakt den Wuerfel 0 <= x <= 4, 0 <= y <= 4, 0 <= z <= 4.
- Verwende exakt die Ebene E: x + y + z = 4.
- Die Schnittpunkte mit den Wuerfelkanten sind:
  A=(4;0;0) auf der x-Achse,
  B=(0;4;0) auf der y-Achse,
  C=(0;0;4) auf der z-Achse.
- Die Schnittfigur ist genau das Dreieck ABC.
- Zeichne den Wuerfel transparent und die Ebene als schraeges Dreieck durch A, B und C.
- Beschrifte die Achsen an den Pfeilspitzen eindeutig mit x, y und z. A muss auf der x-Achse liegen, B auf der y-Achse, C auf der z-Achse.
- Zeige daneben eine kleine Tabelle:
  Punkt | Koordinaten | Probe
  A | (4;0;0) | 4+0+0=4
  B | (0;4;0) | 0+4+0=4
  C | (0;0;4) | 0+0+4=4
- Abschlusszeile: Schnittfigur: Dreieck ABC.

Vermeiden:
- A und B nicht vertauschen.
- Keine Achse falsch beschriften; die vertikale Achse ist z.
- Keine Vierecks- oder Sechseckschnittfigur zeigen.
- Keine zusaetzlichen Schnittpunkte mit Koordinaten ausser A, B und C.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
