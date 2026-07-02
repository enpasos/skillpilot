# Lernzielvisualisierung: Übergangsprozesse mit Zustandsvektoren und Übergangsmatrizen beschreiben

## SkillPilot-Ziel

- SkillPilot-ID: `03685f87-7570-5bb3-b1c7-134124abb317`
- Titel: Übergangsprozesse mit Zustandsvektoren und Übergangsmatrizen beschreiben
- Beschreibung: Die lernende Person kann Übergangsprozesse, zum Beispiel Populationsentwicklung, Wählerverhalten oder Kundenströme, mit Zustandsvektoren und Übergangsmatrizen beschreiben und die Einträge im Kontext deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `03685f87-7570-5bb3-b1c7-134124abb317.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/03685f87-7570-5bb3-b1c7-134124abb317/03685f87-7570-5bb3-b1c7-134124abb317.jpg`

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

Titel: Übergangsprozesse mit Zustandsvektoren und Übergangsmatrizen beschreiben
Beschreibung: Die lernende Person kann Übergangsprozesse, zum Beispiel Populationsentwicklung, Wählerverhalten oder Kundenströme, mit Zustandsvektoren und Übergangsmatrizen beschreiben und die Einträge im Kontext deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Uebergangsprozess mit Zustandsvektor und Uebergangsmatrix beschreiben.
- Verwende drei Zustaende A, B, C.
- Zeige den Zustandsvektor als Spaltenvektor:
  v_0 = (100, 50, 20)^T.
- Verwende die Uebergangsmatrix M als Tabelle mit Spalten "von" und Zeilen "nach".
- Matrix/Tabelle:
  Spalten "von": A, B, C.
  Zeilen "nach": A, B, C.
  M =
    [0.6  0.2  0.1
     0.3  0.5  0.0
     0.1  0.3  0.9]
- Zeige unter jeder Spalte die Summe:
  A-Spalte: 0.6+0.3+0.1=1.0.
  B-Spalte: 0.2+0.5+0.3=1.0.
  C-Spalte: 0.1+0.0+0.9=1.0.
- Berechnung:
  v_1 = M * v_0 = (72, 55, 43)^T.
- Deutung:
  Der Eintrag 0.3 in Zeile B, Spalte A bedeutet: Von A wechseln 30 Prozent nach B.
  Der Eintrag 0.0 in Zeile B, Spalte C bedeutet: Von C wechselt niemand nach B.

Vermeiden:
- Die Matrix nicht als zeilenstochastisch darstellen; entscheidend sind hier die Spaltensummen.
- "von" und "nach" nicht vertauschen.
- Die Summe 100+50+20=170 muss auch in v_1 erhalten bleiben: 72+55+43=170.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
