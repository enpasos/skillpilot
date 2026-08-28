# Lernzielvisualisierung: Stochastische Übergangsmatrizen für Markov-Ketten prüfen

## SkillPilot-Ziel

- SkillPilot-ID: `9bf67cce-4c8f-5497-8e64-825b83c6aa40`
- Titel: Stochastische Übergangsmatrizen für Markov-Ketten prüfen
- Beschreibung: Die lernende Person kann unter Angabe der Zeilen- oder Spaltenkonvention begründen, ob eine Matrix eine stochastische Übergangsmatrix einer Markov-Kette ist: Die Matrix ist quadratisch und ihre Zeilen und Spalten beziehen sich auf denselben Zustandsraum, alle Einträge sind nichtnegativ, und die zu jedem Ausgangszustand gehörenden Einträge summieren sich zu 1.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `9bf67cce-4c8f-5497-8e64-825b83c6aa40.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/9bf67cce-4c8f-5497-8e64-825b83c6aa40/9bf67cce-4c8f-5497-8e64-825b83c6aa40.jpg`

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

Titel: Stochastische Übergangsmatrizen für Markov-Ketten prüfen
Beschreibung: Die lernende Person kann unter Angabe der Zeilen- oder Spaltenkonvention begründen, ob eine Matrix eine stochastische Übergangsmatrix einer Markov-Kette ist: Die Matrix ist quadratisch und ihre Zeilen und Spalten beziehen sich auf denselben Zustandsraum, alle Einträge sind nichtnegativ, und die zu jedem Ausgangszustand gehörenden Einträge summieren sich zu 1.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Stochastische Uebergangsmatrix fuer eine Markov-Kette pruefen.
- Verwende die Zeilenkonvention:
  Zeile = aktueller Zustand, Spalte = naechster Zustand.
- Verwende exakt:
  P =
  [ [0,6, 0,4, 0,0],
    [0,2, 0,5, 0,3],
    [0,1, 0,0, 0,9] ].
- Zeige die Pruefregel:
  1) Alle Eintraege liegen zwischen 0 und 1.
  2) Jede Zeilensumme ist 1,0.
- Zeige die Zeilensummen:
  Zeile A: 0,6 + 0,4 + 0,0 = 1,0.
  Zeile B: 0,2 + 0,5 + 0,3 = 1,0.
  Zeile C: 0,1 + 0,0 + 0,9 = 1,0.
- Abschluss:
  P ist eine gueltige stochastische Uebergangsmatrix.

Vermeiden:
- Nicht Spaltensummen pruefen, denn dieses Bild verwendet ausdruecklich die Zeilenkonvention.
- Keine negativen Eintraege oder Eintraege groesser als 1 einfuegen.
- Nicht eine Zeilensumme als 0,9 oder 1,1 angeben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
