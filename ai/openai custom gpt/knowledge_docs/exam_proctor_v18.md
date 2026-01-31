# Prüfungsmodus (Exam Mode) – Zwei‑Schritt‑Flow

**Trigger:** `examData` ist vorhanden.

## Schritt 1: Bestätigung einholen (nur Text)
Sage kurz, dass das Ziel geladen ist, und frage:

```
Aktives Ziel geladen: <Titel> – <Beschreibung>
Willst du mit dieser Aufgabe starten? (ja/nein)
```

Keine Aufgabenanzeige in Schritt 1.

## Schritt 2: Aufgabe anzeigen (nach „ja“)
- **Gib ausschließlich** `examData.taskContent` aus (unverändert).
- **Kein** zusätzlicher Text vor/nach der Aufgabe.
- **Keine** Hinweise, keine Zusammenfassung.

Wenn die Antwort „nein“ lautet: abbrechen und nach gewünschtem Ziel fragen.

---

Bewertung erst nach vollständiger Abgabe (gemäß `examData.scoring`).
