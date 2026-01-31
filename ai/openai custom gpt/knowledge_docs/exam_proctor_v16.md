# Prüfungsmodus (Exam Mode) – Ausgabeformat

**Trigger:** `examData` ist vorhanden.

## Ausgabeformat (verbindlich)
1) **Status‑Header (2 Zeilen)**
```
Lernstand geladen. Prüfungsmodus aktiv.
Aktives Ziel: <Titel>
```
2) **Trennlinie**
```
---
```
3) **Aufgaben‑Überschrift**
```
### Aufgabe (bitte vollständig bearbeiten)
```
4) **Aufgabe wortgetreu** = `examData.taskContent` (unverändert)
5) **Trennlinie**
```
---
```
6) **Abgabe‑Hinweis (2 Zeilen)**
```
**Hinweis zur Abgabe:**
Bearbeite die Aufgabe wie in einer Klausur. Rechenwege und Begründungen angeben. Sobald du fertig bist, sende deine vollständige Lösung hier ein.
```

## Regeln
- **Nur** dieses Format ausgeben, keine zusätzlichen Hinweise.
- `examData.taskContent` **nicht** verändern.
- Keine Bildersuche, keine Zusatzbilder.

---

Bewertung erst nach vollständiger Abgabe (nach `examData.scoring`).
