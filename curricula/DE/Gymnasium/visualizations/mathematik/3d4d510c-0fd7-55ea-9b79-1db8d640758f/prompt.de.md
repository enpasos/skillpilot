# Lernzielvisualisierung: Rückwärtsrechnen in Markov-Ketten auf Zulässigkeit und Eindeutigkeit prüfen

## SkillPilot-Ziel

- SkillPilot-ID: `3d4d510c-0fd7-55ea-9b79-1db8d640758f`
- Titel: Rückwärtsrechnen in Markov-Ketten auf Zulässigkeit und Eindeutigkeit prüfen
- Beschreibung: Die lernende Person kann beurteilen, ob aus einem späteren Zustand einer Markov-Kette ein zulässiger früherer Zustand sinnvoll und eindeutig bestimmt werden kann, und ihre Entscheidung begründen.

## Generator

- Provider: OpenAI built-in image generation
- Status: pilot
- Quellbild: `3d4d510c-0fd7-55ea-9b79-1db8d640758f.png`
- Public Asset: `/assets/goal-visualizations/mathematik/3d4d510c-0fd7-55ea-9b79-1db8d640758f/3d4d510c-0fd7-55ea-9b79-1db8d640758f.png`

## Prompt

```text
Erzeuge eine fachlich präzise, deutschsprachige Lernziel-Infografik im Querformat mit dem Titel „Rückwärtsrechnen in Markov-Ketten prüfen“. Verwende eine klare, ruhige Schulbuchgestaltung mit vier von links nach rechts verbundenen Prüfschritten und einem abschließenden Urteil. Alle Zustände sind Spaltenvektoren; die Übergangsmatrix steht links vom Zustandsvektor.

Pflichtinhalt:

1. „Gegeben“: zeige exakt
   x_1 = (0,50; 0,50)^T
   und
   M = ((0,7, 0,2), (0,3, 0,8)).
2. „Vorgänger bestimmen“: zeige
   M · x_0 = x_1
   und als Lösung
   x_0 = (0,60; 0,40)^T.
3. „Zulässigkeit prüfen“: zeige mit positiven Prüfhaken „Alle Anteile ≥ 0“ und „Summe = 1“.
4. „Eindeutigkeit prüfen“: zeige „genau eine Lösung“ und
   det(M) = 0,50 ≠ 0.
5. Führe die vier Prüfschritte zum deutlich hervorgehobenen Urteil „zulässig und eindeutig“ zusammen.
6. Ergänze einen klar abgegrenzten Warnbereich „Achtung“ mit genau den Hinweisen:
   - „Negative Anteile: keine Verteilung“
   - „Singuläre Matrix: nicht eindeutig oder keine Lösung“.

Keine Zeilenvektoren, keine Rechtsmultiplikation, keine Vorwärtsfolge über mehrere Schritte und keine anderen Zahlen verwenden. Alle Dezimalzahlen mit deutschem Dezimalkomma darstellen. Das Bild soll sichtbar zwischen algebraischer Lösbarkeit, Zulässigkeit als Verteilung und Eindeutigkeit unterscheiden.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
