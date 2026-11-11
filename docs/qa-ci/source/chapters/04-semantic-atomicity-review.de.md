## Semantische Atomizitätsprüfung {#sec:qa-semantic-atomicity}

:::note{title="Regelversion semantic-atomicity-v1"}
Diese QS-Spur prüft, ob technische Content-Blattziele (`contains` leer) auch **semantisch atomar** sind (`CQR-301` in @ref{sec:qa-cqr-catalog}). Skripte überwachen ausschließlich Vollständigkeit und Fingerprint-Aktualität; die inhaltliche Entscheidung ist immer fachlich-semantisch.
:::

### Fachliches Kriterium, Ausschlüsse und Review-Status {#sec:qa-atomicity-criteria}

Nach `semantic-atomicity-v1` ist ein technisches Content-Blattziel genau dann semantisch atomar, wenn es **ein einziges prüfbares fachliches Lernziel** benennt statt mehrerer unabhängiger Routinen (Konjunktionen wie *„berechnen und deuten“* sind Prüfsignale, aber nicht automatisch ein Fehler). Bewusst ausgeschlossen und in eigenen Spuren geprüft sind:

- terminale Übungs- und Prüfungsziele (`Practice`, `Assessment` oder `examData`),
- Motivations- und Orientierungsanker (`Motivation`, `Orientation`),
- Memorisierungs- und SRS-Blattknoten (`memorization` oder `srs-deck:*`).

:::table{cols="4.6cm,X"}
| Review-Status | Bedeutung im JSONL-Ledger |
| --- | --- |
| **`atomic`** | Semantisch atomar freigegeben (`semanticAtomic: true`). |
| **`needs_developer_review`** | Unsicherheitsfall zur vertieften Klärung (`semanticAtomic: null`). |
| **`non_atomic`** | Zu breit geschnitten; Aufteilung erforderlich (`semanticAtomic: false`). |
:::

### Aktive Konfigurationen, Fingerprints und Erweiterungsablauf {#sec:qa-atomicity-workflow}

Konfigurationen und JSONL-Ledger liegen unter `curricula/DE/Gymnasium/quality/semantic-atomicity/` (u. a. Pilot `canonical-math-j8-linear-functions-pilot`, `canonical-chemistry-sek1-foundations` mit 26 akzeptierten Atomen sowie Vollabdeckungen `canonical-physics-full` und `canonical-math-full`). Die lokale Workbench-Route `/semantic-atomicity-review` dient als Statuseditor; der eigentliche Prüflauf erfolgt per CLI:

```bash
cd app
npm run quality:semantic-atomicity
npm run quality:semantic-atomicity:check
```

`quality:semantic-atomicity:check` schlägt bei Prozessfehlern fehl (fehlender Datensatz im Scope, veralteter Fingerprint nach Inhaltsänderung, fehlerhafte/doppelte Einträge), während offene `needs_developer_review`- und `non_atomic`-Einträge als sichtbare Arbeitsqueue in `CQR-301` (`M5`) gezählt werden. Jeder Datensatz bindet einen **semantischen Fingerprint** über `title`/`titleEn`, `description`/`descriptionEn`, `shortKey`, `phase`/`area`/Themacode und `nodeKind` (`--write-fingerprints` darf ausschließlich als finaler Buchhaltungsschritt nach tatsächlicher fachlicher Neuprüfung laufen).

**Sechs Schritte für neue Teilbäume:** (1) `.config.json` unter `curricula/DE/Gymnasium/quality/semantic-atomicity/` anlegen, (2) kanonische Landschaft und Teilbaumwurzeln referenzieren, (3) `.review.jsonl` mit je einem Datensatz pro Content-Leaf erzeugen, (4) `npm run quality:semantic-atomicity -- --config=<pfad>` ausführen, (5) nach fachlicher Entscheidung `--write-fingerprints` schreiben und (6) Konfiguration erst nach abgeschlossenem Erstbatch in die CI aufnehmen.
