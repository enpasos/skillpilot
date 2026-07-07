# Lernzielvisualisierung: Aus Term einen Graphen erstellen

## SkillPilot-Ziel

- SkillPilot-ID: `0272c501-2931-5e52-b62f-af068db63c44`
- Titel: Aus Term einen Graphen erstellen
- Beschreibung: Die lernende Person kann aus einem Term oder einer Funktionsvorschrift den zugehörigen Graphen skizzieren bzw. erstellen und zentrale Merkmale markieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `0272c501-2931-5e52-b62f-af068db63c44.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/0272c501-2931-5e52-b62f-af068db63c44/0272c501-2931-5e52-b62f-af068db63c44.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Aus Term einen Graphen erstellen
Beschreibung: Die lernende Person kann aus einem Term oder einer Funktionsvorschrift den zugehörigen Graphen skizzieren bzw. erstellen und zentrale Merkmale markieren.

Zusatzanweisung:
Pflichtinhalt:
- Ueberarbeite die bestehende dreiteilige Cartoon-Infografik nur gezielt und erhalte den Ablauf "Term -> Tabelle -> Graph".
- Verwende weiterhin den Term "f(x)=2x+1".
- Die Tabelle muss weiterhin genau diese Werte zeigen:
  - x: 0, 1, 2
  - f(x): 1, 3, 5
- Zeichne das rechte Graph-Panel bei Bedarf komplett neu. Das alte Graph-Panel darf nicht unveraendert uebernommen werden.
- Nutze die sichtbare Graphvorlage im Referenzbild als Koordinaten-Hilfe: Die dort gezeigte Lage der drei Punkte ist fachlich massgeblich.
- Korrigiere das rechte Graph-Panel so, dass alle eingezeichneten Punkte exakt zur Tabelle und zum Term passen.
- Zeichne ein gut lesbares Koordinatengitter mit gleichmaessigen Abstaenden auf beiden Achsen. Verwende eine einfache, kurze x-Achse mit klaren Ticks fuer x=0, x=1 und x=2.
- Markiere genau diese drei Punkte als farbige Punkte auf den richtigen Gitterkreuzungen:
  - (0|1): auf der y-Achse bei y=1
  - (1|3): eine Einheit rechts von der y-Achse und drei Einheiten ueber der x-Achse
  - (2|5): zwei Einheiten rechts von der y-Achse und fuenf Einheiten ueber der x-Achse; dieser Punkt muss direkt ueber dem x-Achsen-Tick 2 liegen, nicht ueber Tick 3
- Die blaue Gerade muss durch alle drei Punkte laufen und die Steigung 2 haben.
- Die Beschriftungen "(0|1)", "(1|3)" und "(2|5)" muessen jeweils dem richtigen Punkt zugeordnet sein.
- Das Label "f(x)=2x+1" soll zur blauen Geraden gehoeren.
- Die drei Punkte sollen im Graph-Panel klar voneinander getrennt und nicht durch Labels verdeckt sein. Labels duerfen seitlich stehen, muessen aber eindeutig zum richtigen Punkt zeigen.
- Sichtbarer deutscher Text soll echte Umlaute verwenden, falls Umlaute vorkommen.

Vermeiden:
- Kein Punkt mit Beschriftung "(2|5)" darf bei x=3 oder an einer anderen falschen x-Position liegen.
- Falls alte Achsenbeschriftungen wie 3, 4, 5 oder 6 im Graph-Panel die korrekte Platzierung erschweren, lasse sie weg. Wichtiger sind die exakt richtig platzierten Punkte 0, 1 und 2.
- Kein Punkt darf zwischen Gitterlinien liegen, wenn er als ganzzahliger Koordinatenpunkt beschriftet ist.
- Keine falsch skalierten Achsen: eine x-Einheit und eine y-Einheit muessen im Gitternetz klar und gleichmaessig ablesbar sein.
- Keine zusaetzlichen Punkte, die nicht zur Tabelle passen.
- Keine Kurve statt Gerade.
- Keine Aenderung des Terms oder der Tabellenwerte.
- Keine technischen IDs, Dateinamen, Plattformnamen, internen Pfade oder internen Zielgruppenlabels im Bild.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
