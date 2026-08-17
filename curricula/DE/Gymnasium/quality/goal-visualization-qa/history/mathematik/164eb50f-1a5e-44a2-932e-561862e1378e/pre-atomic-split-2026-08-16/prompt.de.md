# Lernzielvisualisierung: Punkt-Punkt- und Punkt-Ebene-Abstände im Raum bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `164eb50f-1a5e-44a2-932e-561862e1378e`
- Titel: Punkt-Punkt- und Punkt-Ebene-Abstände im Raum bestimmen
- Beschreibung: Die lernende Person kann Punkt-Punkt- und Punkt-Ebene-Abstände im Raum mithilfe analytischer Darstellungen bestimmen und geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `164eb50f-1a5e-44a2-932e-561862e1378e.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/164eb50f-1a5e-44a2-932e-561862e1378e/164eb50f-1a5e-44a2-932e-561862e1378e.jpg`

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

Titel: Punkt-Punkt- und Punkt-Ebene-Abstände im Raum bestimmen
Beschreibung: Die lernende Person kann Punkt-Punkt- und Punkt-Ebene-Abstände im Raum mithilfe analytischer Darstellungen bestimmen und geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Punkt-Punkt- und Punkt-Ebene-Abstaende im Raum bestimmen.
- Zeige zwei nebeneinander stehende Bereiche:
  A) Punkt-Punkt-Abstand:
     P=(1;2;2), Q=(4;6;2).
     Verbindungsvektor PQ=(3;4;0).
     d(P,Q)=sqrt(3^2+4^2+0^2)=5.
     Skizze: zwei Punkte mit Verbindungsstrecke.
  B) Punkt-Ebene-Abstand:
     Ebene E: 2x-y+2z=6.
     Punkt A=(4;1;2).
     Normalenvektor n=(2;-1;2), |n|=3.
     d(A,E)=|2*4-1+2*2-6|/3=5/3.
     Skizze: Punkt A ausserhalb der Ebene, kuerzeste Strecke als Lot senkrecht zur Ebene.
- Deutung:
  Punkt-Punkt-Abstand ist eine Streckenlaenge.
  Punkt-Ebene-Abstand ist die Laenge des Lotes zur Ebene.

Vermeiden:
- Beim Punkt-Punkt-Abstand nicht sqrt(3+4) oder 7 schreiben; korrekt ist 5.
- Beim Punkt-Ebene-Abstand nicht das Betragszeichen vergessen.
- Die Lotstrecke nicht schraeg in der Ebene zeichnen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
