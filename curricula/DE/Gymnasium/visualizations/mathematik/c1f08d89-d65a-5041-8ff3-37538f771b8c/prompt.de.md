# Lernzielvisualisierung: Euklidischen Algorithmus anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `c1f08d89-d65a-5041-8ff3-37538f771b8c`
- Titel: Euklidischen Algorithmus anwenden (LK)
- Beschreibung: Die lernende Person kann den euklidischen Algorithmus erläutern und an Beispielen zur Bestimmung des größten gemeinsamen Teilers anwenden.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `c1f08d89-d65a-5041-8ff3-37538f771b8c.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c1f08d89-d65a-5041-8ff3-37538f771b8c/c1f08d89-d65a-5041-8ff3-37538f771b8c.jpg`

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

Titel: Euklidischen Algorithmus anwenden (LK)
Beschreibung: Die lernende Person kann den euklidischen Algorithmus erläutern und an Beispielen zur Bestimmung des größten gemeinsamen Teilers anwenden.

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
- Keine Ablaufdiagramm-Pfeile.
- Verwende eine statische Tabelle plus Ergebnisbox.

Pflichtinhalt:
- Thema: Euklidischen Algorithmus zur ggT-Bestimmung anwenden.
- Verwende genau dieses Beispiel:
  ggT(252, 105).

Statische Tabelle exakt:
Spalten: Schritt | Gleichung | Rest
Zeile 1: 1 | 252 = 2*105 + 42 | 42
Zeile 2: 2 | 105 = 2*42 + 21 | 21
Zeile 3: 3 | 42 = 2*21 + 0 | 0

Ergebnisbox exakt:
- Stopp bei Rest 0.
- Letzter von 0 verschiedener Rest: 21.
- ggT(252,105) = 21.

Vermeiden:
- Nicht 42 als ggT ausgeben; 42 ist nur ein Zwischenrest.
- Nicht mit einem negativen Rest rechnen.
- Nicht nach dem Rest 0 weiterrechnen.
- Nicht 252=3*105+... schreiben; korrekt ist 252=2*105+42.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
