# Lernzielvisualisierung: Stabile Zustände mithilfe von Fixvektoren bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf`
- Titel: Stabile Zustände mithilfe von Fixvektoren bestimmen
- Beschreibung: Die lernende Person kann für eine Übergangsmatrix Fixvektoren bestimmen, sie als stabile Verteilungen interpretieren und im Kontext des zugrunde liegenden Prozesses deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/8d893e63-d7de-52d9-8bcb-f48f47d1ccbf/8d893e63-d7de-52d9-8bcb-f48f47d1ccbf.jpg`

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

Titel: Stabile Zustände mithilfe von Fixvektoren bestimmen
Beschreibung: Die lernende Person kann für eine Übergangsmatrix Fixvektoren bestimmen, sie als stabile Verteilungen interpretieren und im Kontext des zugrunde liegenden Prozesses deuten.

Zusatzanweisung:
Pflichtinhalt:
- Zweite Regeneration wegen wiederholtem Notationsfehler: Keine Zustandsvektoren als senkrechte Spalten zeichnen.
- Thema: Stabilen Zustand einer Markov-Kette mithilfe einer Fixverteilung bestimmen.
- Verwende die Uebergangsmatrix:
  P = [ [0,7, 0,3],
        [0,2, 0,8] ].
- Stelle die stabile Verteilung nicht als Klammer-Spaltenvektor dar, sondern als kleine horizontale Zwei-Spalten-Tabelle:
  Zustand | A | B
  Anteil  | 0,4 | 0,6
- Zeige den Ansatz mit Anteilen a und b:
  Vor dem Schritt: A-Anteil a, B-Anteil b.
  Nach dem Schritt: A-Anteil 0,7a + 0,2b, B-Anteil 0,3a + 0,8b.
  Stabil bedeutet:
  0,7a + 0,2b = a.
  0,3a + 0,8b = b.
  a + b = 1.
- Zeige die Loesung:
  0,3a = 0,2b.
  b = 1,5a.
  a + b = 1, also 2,5a = 1.
  a = 0,4, b = 0,6.
- Zeige die Probe als horizontale Tabelle:
  Startanteile: A 0,4 | B 0,6.
  Nach dem Schritt:
  A: 0,4*0,7 + 0,6*0,2 = 0,4.
  B: 0,4*0,3 + 0,6*0,8 = 0,6.
- Deutung:
  Die Verteilung 40 Prozent A und 60 Prozent B bleibt unveraendert.

Vermeiden:
- Keine Zeichnung von [0,4;0,6], [a;b] oder irgendeinem senkrechten Zustandsvektor.
- Keine Matrixmultiplikation mit einem senkrechten Zustandsvektor.
- Nicht P*z rechnen.
- Nicht [0,5 0,5] als stabilen Zustand angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
