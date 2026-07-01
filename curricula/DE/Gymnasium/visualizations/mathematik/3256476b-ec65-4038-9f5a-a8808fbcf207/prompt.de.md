# Lernzielvisualisierung: Punkt-Gerade-Abstände im Raum bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `3256476b-ec65-4038-9f5a-a8808fbcf207`
- Titel: Punkt-Gerade-Abstände im Raum bestimmen
- Beschreibung: Die lernende Person kann Punkt-Gerade-Abstände im Raum mithilfe von Projektionen, Lotbeziehungen und analytischen Darstellungen bestimmen und die Ergebnisse geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `3256476b-ec65-4038-9f5a-a8808fbcf207.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/3256476b-ec65-4038-9f5a-a8808fbcf207/3256476b-ec65-4038-9f5a-a8808fbcf207.jpg`

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

Titel: Punkt-Gerade-Abstände im Raum bestimmen
Beschreibung: Die lernende Person kann Punkt-Gerade-Abstände im Raum mithilfe von Projektionen, Lotbeziehungen und analytischen Darstellungen bestimmen und die Ergebnisse geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Punkt-Gerade-Abstand im Raum mithilfe einer Projektion bestimmen.
- Verwende die Gerade:
  g: X=(0,0,0)+t*(4,0,0).
- Verwende den Punkt:
  P(2,3,0).
- Zeige den Richtungsvektor:
  u=(4,0,0).
- Zeige die Projektion auf die Gerade:
  OP=(2,3,0).
  t0=(OP*u)/(u*u)=8/16=1/2.
  Lotfusspunkt F=(0,0,0)+0.5*(4,0,0)=(2,0,0).
- Zeige den Lotvektor:
  FP=P-F=(0,3,0).
- Zeige den Abstand:
  d(P,g)=|FP|=3.
- Zeichne P, g, F und das Lot FP rechtwinklig zur Geraden.

Vermeiden:
- Nicht den Abstand als Laenge von OP verwenden; |OP| ist nicht der Punkt-Gerade-Abstand.
- Nicht den Lotfusspunkt bei (0,0,0) lassen; korrekt ist F=(2,0,0).
- Nicht t0=2 oder t0=1/4 berechnen; korrekt ist t0=1/2.
- Nicht das Lot schraeg entlang der Geraden zeichnen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
