# Lernzielvisualisierung: Zustände in Markov-Ketten vorwärts berechnen und deuten

## SkillPilot-Ziel

- SkillPilot-ID: `10a33d93-dc20-5edd-ae3b-32338d05407c`
- Titel: Zustände in Markov-Ketten vorwärts berechnen und deuten
- Beschreibung: Die lernende Person kann Zustandsentwicklungen in Markov-Ketten mit Anfangsvektor und Übergangsmatrix vorwärts berechnen und die Ergebnisse als Verteilungen deuten.

## Generator

- Provider: OpenAI built-in image generation
- Status: pilot
- Quellbild: `10a33d93-dc20-5edd-ae3b-32338d05407c.png`
- Public Asset: `/assets/goal-visualizations/mathematik/10a33d93-dc20-5edd-ae3b-32338d05407c/10a33d93-dc20-5edd-ae3b-32338d05407c.png`

## Prompt

```text
Erzeuge eine fachlich präzise, deutschsprachige Lernziel-Infografik im Querformat mit dem Titel „Zustände in Markov-Ketten vorwärts berechnen“. Verwende eine klare, ruhige Schulbuchgestaltung mit vier von links nach rechts verbundenen Schritten und gut lesbarer mathematischer Typografie. Alle Zustände sind Spaltenvektoren; die Übergangsmatrix steht links vom Zustandsvektor.

Pflichtinhalt:

1. „Anfangszustand“: zeige
   x_0 = (0,60; 0,40)^T
   und deute dies als „60 % in A, 40 % in B“.
2. „Übergangsmatrix“: zeige
   M = ((0,7, 0,2), (0,3, 0,8))
   sowie ein Zwei-Zustands-Diagramm mit genau diesen Übergängen: Schleife A→A 0,7; Pfeil A→B 0,3; Pfeil B→A 0,2; Schleife B→B 0,8. Ergänze „Spaltensummen = 1“.
3. „Vorwärts rechnen“: zeige exakt
   x_1 = M · x_0 = (0,50; 0,50)^T
   und
   x_2 = M · x_1 = (0,45; 0,55)^T.
4. „Deuten“: zeige „Nach 2 Schritten: 45 % in A, 55 % in B“ sowie „Summe = 1“.
5. Stelle die allgemeine Konvention prominent dar:
   x_{n+1} = M · x_n.

Keine Zeilenvektoren, keine Rechtsmultiplikation, keine Rückwärtsrechnung und keine anderen Zahlen oder Übergangsrichtungen verwenden. Die Matrixspalten müssen jeweils 1 ergeben. Alle Dezimalzahlen mit deutschem Dezimalkomma darstellen.

Transparente Bearbeitungshistorie des final kuratierten Bildes: Nach der ersten Generierung wurden zwei gezielte fachliche Korrekturen vorgenommen. Zuerst wurde die untere Pfeilbeschriftung B→A auf 0,2 korrigiert. Danach wurde die obere Pfeilbeschriftung A→B auf 0,3 korrigiert. Das finale Bild muss beide Korrekturen gleichzeitig enthalten.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
