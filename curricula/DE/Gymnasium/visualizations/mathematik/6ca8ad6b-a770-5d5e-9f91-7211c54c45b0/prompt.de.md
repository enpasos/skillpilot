# Lernzielvisualisierung: Parameter zur Modellierung von Sachsituationen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `6ca8ad6b-a770-5d5e-9f91-7211c54c45b0`
- Titel: Parameter zur Modellierung von Sachsituationen bestimmen
- Beschreibung: Die lernende Person kann einen Parameter einer Funktionenschar so bestimmen, dass eine vorgegebene Kontextbedingung erfüllt ist.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `6ca8ad6b-a770-5d5e-9f91-7211c54c45b0.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/6ca8ad6b-a770-5d5e-9f91-7211c54c45b0/6ca8ad6b-a770-5d5e-9f91-7211c54c45b0.jpg`

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

Titel: Parameter zur Modellierung von Sachsituationen bestimmen
Beschreibung: Die lernende Person kann einen Parameter einer Funktionenschar so bestimmen, dass eine vorgegebene Kontextbedingung erfüllt ist.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Parameter aus einer Kontextbedingung bestimmen.
- Verwende einen Brueckenbogen oder Torbogen als Sachsituation.
- Modell: h_a(x) = a*x*(10 - x), Einheit Meter.
- Randbedingungen sichtbar machen: h_a(0)=0 und h_a(10)=0.
- Kontextbedingung: Die maximale Hoehe in der Mitte soll 5 m betragen.
- Nutze x = 5:
  h_a(5) = a*5*(10-5) = 25a.
  25a = 5.
  a = 0.2.
- Zeige den finalen Modellterm: h(x) = 0.2*x*(10 - x).
- Im Graphen sollen die Punkte (0|0), (5|5), (10|0) stimmen.

Vermeiden:
- Keine falsche Einheit oder Hoehe.
- Nicht a=5 oder a=25 als Ergebnis zeigen.
- Keine unpassenden Kontextdaten ausser 10 m Spannweite und 5 m Hoehe.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
