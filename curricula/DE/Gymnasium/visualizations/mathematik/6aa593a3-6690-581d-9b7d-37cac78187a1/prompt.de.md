# Lernzielvisualisierung: Übergangsprozesse mit stochastischen Matrizen modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `6aa593a3-6690-581d-9b7d-37cac78187a1`
- Titel: Übergangsprozesse mit stochastischen Matrizen modellieren
- Beschreibung: Die lernende Person kann Übergangsprozesse als Markov-Ketten mit stochastischen Matrizen modellieren, Übergangswahrscheinlichkeiten begründet festlegen und die Matrix im Kontext interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `6aa593a3-6690-581d-9b7d-37cac78187a1.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/6aa593a3-6690-581d-9b7d-37cac78187a1/6aa593a3-6690-581d-9b7d-37cac78187a1.jpg`

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

Titel: Übergangsprozesse mit stochastischen Matrizen modellieren
Beschreibung: Die lernende Person kann Übergangsprozesse als Markov-Ketten mit stochastischen Matrizen modellieren, Übergangswahrscheinlichkeiten begründet festlegen und die Matrix im Kontext interpretieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Markov-Kette mit stochastischer Uebergangsmatrix modellieren.
- Verwende zwei Zustaende: A und B.
- Kontext: Kundinnen und Kunden wechseln zwischen Anbieter A und Anbieter B.
- Uebergangsmatrix als Tabelle mit Spalten "von" und Zeilen "nach":
  M =
    [0.8  0.3
     0.2  0.7]
  Zeilen "nach": A, B.
  Spalten "von": A, B.
- Erklaere die Eintraege:
  Von A bleiben 80 Prozent bei A und 20 Prozent wechseln zu B.
  Von B wechseln 30 Prozent zu A und 70 Prozent bleiben bei B.
- Zeige die Spaltensummen:
  0.8+0.2=1.0.
  0.3+0.7=1.0.
- Anfangszustand:
  v_0 = (0.9, 0.1)^T.
- Berechnung:
  v_1 = M * v_0 = (0.75, 0.25)^T.
- Deutung:
  Nach einem Schritt sind 75 Prozent bei A und 25 Prozent bei B.
- Finale Darstellungsprioritaet:
  - Verwende eine klare Matrix-Tabelle und eine kleine Rechenbox.
  - Verzichte auf Gebaeude-, Personen- oder Ladenillustrationen, falls dadurch Zustandslabels doppelt oder falsch erscheinen koennen.
  - Verzichte auf einen Uebergangsgraphen mit Pfeilen und Schleifen; zeige die Uebergaenge nur in der Matrix-Tabelle und in kurzen Textdeutungen.
  - Wenn Kontextlabels gezeigt werden, dann genau zwei Labels: "Anbieter A" nur beim Zustand A und "Anbieter B" nur beim Zustand B.
  - Das Matrixlayout muss sichtbar bleiben: Spalten "von A", "von B"; Zeilen "nach A", "nach B".

Vermeiden:
- Die Wahrscheinlichkeiten nicht als absolute Anzahlen darstellen.
- Nicht die Zeilensummen als Pruefkriterium markieren; hier sind die Spalten "von" und muessen sich zu 1 addieren.
- v_1 nicht als (0.9,0.1)^T oder (0.5,0.5)^T angeben; korrekt ist (0.75,0.25)^T.
- Kein falsches oder doppeltes Kontextlabel, insbesondere den Zustand B niemals als "Anbieter A" beschriften.
- Keine Pfeildiagramme oder Schleifen zeichnen; dadurch duerfen keine doppelten Uebergaenge wie zwei B-nach-B-Schleifen entstehen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
