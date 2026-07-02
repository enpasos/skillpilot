# Lernzielvisualisierung: Analysis-Modelle in Sachzusammenhängen validieren (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `71fe4a39-38e8-5c6a-8eef-ff4783fe70c2`
- Titel: Analysis-Modelle in Sachzusammenhängen validieren (LK)
- Beschreibung: Die lernende Person kann Modellannahmen und Resultate in Sachzusammenhängen der Differential- und Integralrechnung fachlich prüfen und Grenzen des Modells benennen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `71fe4a39-38e8-5c6a-8eef-ff4783fe70c2.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/71fe4a39-38e8-5c6a-8eef-ff4783fe70c2/71fe4a39-38e8-5c6a-8eef-ff4783fe70c2.jpg`

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

Titel: Analysis-Modelle in Sachzusammenhängen validieren (LK)
Beschreibung: Die lernende Person kann Modellannahmen und Resultate in Sachzusammenhängen der Differential- und Integralrechnung fachlich prüfen und Grenzen des Modells benennen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Analysis-Modelle in Sachzusammenhaengen validieren.
- Verwende genau diesen Kontext:
  Modell fuer eine Besucherzahl:
  N(t) = 1000 + 300t - 20t^2, fuer Zeit t in Stunden.
- Zeige eine Checkliste zur Modellvalidierung:
  1. Definitionsbereich pruefen.
  2. Einheiten pruefen.
  3. Extremwerte und Nullstellen im Kontext deuten.
  4. Plausibilitaetsgrenzen benennen.
- Konkrete Rechnungen:
  N'(t) = 300 - 40t.
  N'(t)=0 -> t=7.5.
  N(7.5)=2125.
  N(15)=1000, also noch positiv.
  Positive Nullstelle ungefaehr bei t=17.8.
  N(20)=1000+6000-8000=-1000.
- Deutung:
  Maximum: etwa 2125 Besucher nach 7.5 h.
  N(20)=-1000 ist im Kontext unmoeglich.
  Modell nur in einem passenden Zeitfenster verwenden, nicht beliebig extrapolieren.
- Zeige im Bild einen Graphen, der anfangs steigt, bei t=7.5 einen Hochpunkt hat und spaeter unter 0 fallen wuerde; markiere den negativen Bereich als unplausibel.
- Im Graphen darf der negative Bereich erst nach der positiven Nullstelle bei ungefaehr t=17.8 beginnen.
- Markiere t=15 als noch positiv, nicht als Nullstelle.

Vermeiden:
- Negative Besucherzahlen nicht als reales Ergebnis akzeptieren.
- Nicht behaupten, das Modell sei fuer alle t sinnvoll.
- Nicht das Maximum mit t=20 verwechseln.
- Nicht N'(t)=300-20t schreiben; korrekt ist 300-40t.
- Nicht zeigen, dass die Kurve schon bei t=15 die x-Achse schneidet; korrekt ist N(15)=1000 und die positive Nullstelle liegt ungefaehr bei t=17.8.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
