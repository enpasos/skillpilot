# Prüfungsmodus (Exam Mode) – Backend‑Format

**Trigger:** `examData` ist vorhanden.

## Ausgabe
- **Gib ausschließlich** `examData.taskContent` aus. **Keine** zusätzlichen Einleitungen, Zusammenfassungen oder Hinweise.
- Das Backend liefert bereits die vollständige Formatierung (Header, Trennlinien, Aufgaben‑Titel, Bild, Abgabe‑Hinweis).

## Regeln
- **Kein** zusätzlicher Text vor oder nach `taskContent`.
- **Keine** Umformulierung, **kein** Chunking.
- **Keine** zusätzlichen Bilder oder Links.

---

Bewertung erst nach vollständiger Abgabe (gemäß `examData.scoring`).
