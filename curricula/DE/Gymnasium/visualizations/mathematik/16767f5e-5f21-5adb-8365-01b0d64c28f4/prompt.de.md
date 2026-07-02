# Lernzielvisualisierung: Euklidische Algorithmen digital nachvollziehen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `16767f5e-5f21-5adb-8365-01b0d64c28f4`
- Titel: Euklidische Algorithmen digital nachvollziehen (LK)
- Beschreibung: Die lernende Person kann eine Implementierung euklidischer Algorithmen in Tabellenkalkulation oder Programmierumgebung nachvollziehen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `16767f5e-5f21-5adb-8365-01b0d64c28f4.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/16767f5e-5f21-5adb-8365-01b0d64c28f4/16767f5e-5f21-5adb-8365-01b0d64c28f4.jpg`

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

Titel: Euklidische Algorithmen digital nachvollziehen (LK)
Beschreibung: Die lernende Person kann eine Implementierung euklidischer Algorithmen in Tabellenkalkulation oder Programmierumgebung nachvollziehen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Euklidische Algorithmen digital nachvollziehen.
- Zeige eine Tabellenkalkulations- oder Programmierumgebung mit demselben Beispiel:
  ggT(252,105).

Darstellung:
- Keine Pfeile zeichnen.
- Keine Übergangspfeile, keine gebogenen Pfeile, keine Zuordnungspfeile.
- Zeige links eine Tabelle und rechts Pseudocode.
- Verknüpfe Tabelle und Code nur über gleiche Farben oder Überschriften, nicht über Pfeile.

Tabelle mit Spalten:
- Schritt
- a
- b
- q=floor(a/b)
- r=a mod b

Zeige genau diese Tabellenzeilen:
- 0 | a=252 | b=105 | q=2 | r=42
- 1 | a=105 | b=42 | q=2 | r=21
- 2 | a=42 | b=21 | q=2 | r=0

Pseudocode exakt:
while b != 0:
  r = a mod b
  a = b
  b = r
return a

Ergebnis exakt:
- r=0 beendet die Schleife.
- Rückgabe: a=21

Vermeiden:
- Nicht nach r=0 noch eine weitere Tabellenzeile mit Division durch 0 zeigen.
- Nicht q=3 in der ersten Zeile schreiben; korrekt ist q=2.
- Nicht a und b gleichzeitig falsch aktualisieren; nach Schritt 0 wird aus (252,105) das Paar (105,42).
- Nicht Ergebnis 0 ausgeben; zurückgegeben wird a=21.
- Keine Pfeile.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
