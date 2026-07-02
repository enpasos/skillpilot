# Lernzielvisualisierung: Erweiterten euklidischen Algorithmus anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `c371b3f0-dd0e-5263-b616-de6c362f70db`
- Titel: Erweiterten euklidischen Algorithmus anwenden (LK)
- Beschreibung: Die lernende Person kann den erweiterten euklidischen Algorithmus anwenden und eine Darstellung des größten gemeinsamen Teilers als Linearkombination bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `c371b3f0-dd0e-5263-b616-de6c362f70db.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c371b3f0-dd0e-5263-b616-de6c362f70db/c371b3f0-dd0e-5263-b616-de6c362f70db.jpg`

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

Titel: Erweiterten euklidischen Algorithmus anwenden (LK)
Beschreibung: Die lernende Person kann den erweiterten euklidischen Algorithmus anwenden und eine Darstellung des größten gemeinsamen Teilers als Linearkombination bestimmen.

Zusatzanweisung:
Korrektur nach fachlichem Review:

Das Bild darf keinerlei Pfeile oder pfeilähnliche Formen enthalten.

Strenge Darstellungsregeln:
- Keine Pfeile.
- Keine Pfeilspitzen.
- Keine Verbindungslinien zwischen Boxen.
- Keine Pointer-Cursor.
- Keine gebogenen Verbinder.
- Keine Symbole wie ->, ↓, ↑, ⇒.
- Keine Prozesspfeile zwischen Vorwärts- und Rückwärtsteil.
- Verwende drei statische Textbereiche nebeneinander oder untereinander.

Pflichtinhalt:
- Thema: Erweiterten euklidischen Algorithmus anwenden.
- Verwende genau dieses Beispiel:
  ggT(252, 105) = 21.

Bereich 1: Vorwärtsschritte exakt:
1. 252 = 2*105 + 42
2. 105 = 2*42 + 21
3. 42 = 2*21 + 0

Bereich 2: Rückwärtseinsetzung exakt:
1. 21 = 105 - 2*42
2. 42 = 252 - 2*105
3. 21 = 105 - 2*(252 - 2*105)
4. 21 = 5*105 - 2*252

Bereich 3: Ergebnis exakt:
- 21 = (-2)*252 + 5*105
- s = -2 für 252
- t = 5 für 105

Vermeiden:
- Nicht die Vorzeichen vertauschen: 21 = 2*252 - 5*105 ist falsch.
- Nicht 42 als Linearkombinations-Ergebnis ausgeben.
- Nicht den Rückwärtsschritt 42 = 252 - 2*105 vergessen.
- Nicht mit Dezimalzahlen oder Brüchen rechnen; alles bleibt ganzzahlig.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
