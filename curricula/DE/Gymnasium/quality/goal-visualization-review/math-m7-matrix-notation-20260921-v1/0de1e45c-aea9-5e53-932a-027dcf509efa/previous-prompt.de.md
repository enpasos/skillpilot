# Lernzielvisualisierung: Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `0de1e45c-aea9-5e53-932a-027dcf509efa`
- Titel: Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK)
- Beschreibung: Die lernende Person kann Potenzen von Übergangsmatrizen nutzen, um langfristige Entwicklungen von Übergangsprozessen zu untersuchen und Zwischenergebnisse im Kontext zu deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `0de1e45c-aea9-5e53-932a-027dcf509efa.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/0de1e45c-aea9-5e53-932a-027dcf509efa/0de1e45c-aea9-5e53-932a-027dcf509efa.jpg`

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

Titel: Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK)
Beschreibung: Die lernende Person kann Potenzen von Übergangsmatrizen nutzen, um langfristige Entwicklungen von Übergangsprozessen zu untersuchen und Zwischenergebnisse im Kontext zu deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Matrixpotenzen fuer langfristige Uebergangsprozesse nutzen.
- Verwende dieselbe spaltenstochastische Matrix:
  M =
    [0.8  0.3
     0.2  0.7]
  Spalten "von" A, B; Zeilen "nach" A, B.
- Anfangszustand:
  v_0 = (0.9, 0.1)^T.
- Zeige die Potenzidee:
  v_n = M^n * v_0.
- Rechenschritte:
  v_1 = M * v_0 = (0.75, 0.25)^T.
  M^2 =
    [0.70  0.45
     0.30  0.55]
  v_2 = M^2 * v_0 = (0.675, 0.325)^T.
  v_5 ungefaehr (0.609, 0.391)^T.
  v_10 ungefaehr (0.600, 0.400)^T.
- Deutung:
  Matrixpotenzen beschreiben mehrere Uebergangsschritte.
  Die Werte naehern sich langfristig etwa (0.6, 0.4)^T.
- Das Bild darf nur den fachlichen Titel und mathematische Inhalte enthalten.
- Keine Kopfzeile mit Schulform, "Infographic", einem erfundenen Namen oder sonstigem Branding.

Vermeiden:
- M^2 nicht mit komponentenweisem Quadrieren verwechseln.
- v_2 nicht aus M*v_1 falsch runden; korrekt ist (0.675,0.325)^T.
- Spalten "von" und Zeilen "nach" nicht vertauschen.
- Keine Brandingzeile, kein Logo, kein erfundener Produktname, kein Wasserzeichen und keine Signatur.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
