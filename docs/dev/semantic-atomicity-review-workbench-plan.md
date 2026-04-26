# Semantic Atomicity Review Workbench Plan

## Ausgangspunkt

Ein technischer Blattknoten im Graphen ist nicht automatisch ein semantisch atomares Lernziel. Ein Blattziel kann immer noch mehrere inhaltliche Lernziele bündeln, etwa "Geradengleichungen, Nullstellen und Schnittpunkte bestimmen". Solche Fälle müssen semantisch geprüft werden, weil reine Heuristiken an Formulierungen wie "berechnen und deuten" scheitern können.

Der Prozess muss zwei Anforderungen gleichzeitig erfüllen:

- initiale Bulkprüfung ganzer Teilbäume durch Codex
- stabile Nachpflege, wenn später nur kleine Änderungen am Graphen vorgenommen werden

## Zielbild

Für ausgewählte Scope-Teilbäume wird jedes technische Blattziel genau einmal semantisch bewertet.

Ein Review-Record beantwortet:

- Ist das Blattziel sicher semantisch atomar?
- Muss der Entwickler prüfen?
- Ist das Ziel sicher nicht atomar und sollte gesplittet werden?

Die Entscheidung wird nicht in den Zielknoten selbst geschrieben, sondern in Review-Ledgern unter:

```text
curricula/DE/Gymnasium/quality/semantic-atomicity/
```

Damit bleibt die fachliche Graphstruktur sauber, während die Qualitätssicherung inkrementell prüfbar wird.

## Nicht-Ziele

- Die Workbench entscheidet nicht automatisch, ob ein Ziel semantisch atomar ist.
- Es gibt keine Browser-basierte Bulkprüfung durch ein Modell.
- Bekannte `needs_developer_review`- oder `non_atomic`-Einträge lassen den Prozesscheck nicht fehlschlagen.
- Graph-Splits werden nicht automatisch aus Findings ausgeführt.

## Rollen

### Codex CLI

Codex führt die eigentliche semantische Prüfung aus:

- Scope laden
- jedes technische Blattziel einzeln betrachten
- Status, Begründung und Split-Vorschläge in das Ledger schreiben
- Fingerprints nach echter semantischer Prüfung aktualisieren
- Checks ausführen

Codex darf Graph-Änderungen nur dann durchführen, wenn der Entwickler das ausdrücklich beauftragt.

### Workbench

Die Workbench ist eine algorithmische Oberfläche für Findings-Dateien:

- Configs und JSONL-Ledger laden
- fehlende, veraltete und aktuelle Records anzeigen
- Status, Begründungen, `suggestedAction` und `suggestedSplit` bearbeiten
- Ledger speichern
- einen standardisierten Prompt für das Codex-Terminal bereitstellen

Sie ist bewusst kein semantischer Prüfer.

### Entwickler

Der Entwickler entscheidet über unsichere Fälle:

- `needs_developer_review` akzeptieren
- in `atomic` umstufen
- in `non_atomic` umstufen
- späteren Graph-Split beauftragen

### CI / Qualitätscheck

Der Check schützt den Prozess:

- fehlende Review-Records werden gemeldet
- veraltete Fingerprints werden gemeldet
- doppelte oder malformed Records werden gemeldet
- obsolete Records werden sichtbar gemacht

Die Queue bekannter fachlicher Findings bleibt sichtbar, blockiert aber nicht automatisch.

## Artefakte

### Config

Eine Config definiert einen Review-Scope:

```json
{
  "schemaVersion": 1,
  "reviewId": "canonical-math-j8-linear-functions-pilot",
  "ruleVersion": "semantic-atomicity-v1",
  "landscapeId": "...",
  "landscapePath": "curricula/DE/Gymnasium/canonical/...",
  "reviewPath": "curricula/DE/Gymnasium/quality/semantic-atomicity/....review.jsonl",
  "scope": {
    "label": "Canonical mathematics J8 linear calculation routines pilot",
    "rootGoalIds": ["..."]
  }
}
```

### Ledger

Das Ledger ist JSONL mit einem Record pro technischem Blattziel im Scope.

Statuswerte:

- `atomic`: sicher semantisch atomar
- `needs_developer_review`: geprüft, aber nicht sicher entscheidbar
- `non_atomic`: sicher zu breit

Wichtige Felder:

- `goalId`
- `fingerprint`
- `status`
- `semanticAtomic`
- `reason`
- `suggestedAction`
- `suggestedSplit`

### Fingerprint

Der Fingerprint wird über semantisch relevante Felder berechnet:

- Titel
- Beschreibung
- englische Varianten
- `shortKey`
- Phase, Area, Topic Code
- Node Kind
- Rule Version

Wenn sich diese Felder ändern, wird der Record stale und muss erneut geprüft werden.

## Standardworkflow

1. Entwickler oder Codex definiert einen Scope über eine Config.
2. Codex erzeugt oder aktualisiert das Ledger für alle technischen Blattziele im Scope.
3. Codex prüft jedes Blattziel semantisch einzeln.
4. Die Workbench zeigt Queue, stale Records und Findings an.
5. Der Entwickler kann in der Workbench Findings sichten oder einen Prompt für Codex kopieren.
6. Codex arbeitet den Prompt ab und aktualisiert das Ledger.
7. `quality:semantic-atomicity:check` prüft Abdeckung und Staleness.
8. Bei späteren Graph-Änderungen erkennt derselbe Check fehlende, obsolete oder stale Records.

## Codex-Prompt-Handoff aus der Workbench

Die Workbench soll bei Bedarf einen standardisierten Prompt erzeugen, der ins Codex-Terminal kopiert wird.

Der Prompt enthält:

- Config-Pfad
- Ledger-Pfad
- Review-ID
- Rule-Version
- Scope-Label
- aktuelle Counts
- Queue-Einträge
- klare Arbeitsgrenze: semantische Entscheidung in Codex, Workbench nur Ledger-Editor
- auszuführende Checks

Der Prompt darf keine graphverändernden Arbeiten implizieren. Graph-Splits brauchen einen separaten Auftrag.

Zusätzlich gibt es pro Finding einen zielbezogenen Codex-Auftrag. Dieser Auftrag darf ausdrücklich die fachliche Prüfung, einen geeigneten Split oder eine präzisere Überarbeitung verlangen. Wenn der Split aus dem lokalen Curriculum-Kontext eindeutig ist, darf Codex den Graphen ändern; wenn nicht, soll Codex nur `suggestedSplit` / `suggestedAction` im Ledger schärfen und zur Entwicklerprüfung stoppen.

## Pilot

Pilot-Scope:

```text
Canonical mathematics J8 linear calculation routines pilot
```

Aktueller Pfad:

```text
curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-j8-linear-functions-pilot.config.json
```

Ziel des Piloten:

- prüfen, ob die Ledger-Struktur praktikabel ist
- prüfen, ob Fingerprints spätere kleine Änderungen zuverlässig sichtbar machen
- Workbench-Feedbackschleife mit Codex-Prompt testen
- erst danach auf größere Mathe-Sek-I-Teilbäume ausweiten

## Rollout-Phasen

### Phase 0: Plan und Begriffe

- Regel `semantic-atomicity-v1` dokumentieren
- Statuswerte und Rollen klären
- Workbench/Codex-Grenze festhalten

### Phase 1: CLI und Pilot-Ledger

- Review-Script für Config und JSONL
- Pilot-Scope anlegen
- erste semantische Bewertung durchführen
- Check-Modus stabilisieren

### Phase 2: Workbench-Ledger-Editor

- Config-Liste laden
- Ledger anzeigen
- Queue, missing, stale, obsolete sichtbar machen
- Records speichern

### Phase 3: Codex-Handoff

- standardisierten Prompt in der Workbench anzeigen
- Copy-to-Clipboard
- Prompt im Codex-Terminal mit echten Findings testen

### Phase 4: CI-Integration

- ausgewählte vollständige Scopes in CI aufnehmen
- erst nach initial vollständigem Review aktivieren
- bekannte Developer-Queue sichtbar halten, aber nicht blockierend machen

### Phase 5: Ausweitung

- weitere Mathe-Sek-I-Teilbäume
- danach Sek II
- danach andere Fächer
- pro Fach und größerem Themenbereich eigene Configs statt eines riesigen Ledgers

## Akzeptanzkriterien

Ein Scope gilt als prozessual sauber, wenn:

- jeder technische Blattknoten genau einen Review-Record hat
- kein Record stale ist
- keine doppelten `goalId`-Records existieren
- obsolete Records sichtbar sind
- die Queue fachlich nachvollziehbare Gründe enthält
- Codex denselben Scope später erneut prüfen kann, ohne die Historie zu verlieren

Ein Ziel gilt als fachlich entschieden, wenn:

- `atomic` mit konkreter Begründung gesetzt ist, oder
- `non_atomic` mit Split-Idee gesetzt ist, oder
- `needs_developer_review` mit nachvollziehbarer Frage an den Entwickler gesetzt ist

## Offene Entscheidungen

- Welche Review-Scopes sollen zuerst nach dem Piloten folgen?
- Soll der Reviewer-Wert dauerhaft `codex`/`developer` bleiben oder später personenspezifisch werden?
- Ab wann sollen `non_atomic`-Findings verpflichtend in Graph-Splits überführt werden?
- Sollen große Jahrgangsbereiche in mehrere thematische Configs aufgeteilt werden?
- Welche Scopes werden in CI strikt geprüft, welche bleiben zunächst lokale Arbeitsstände?

## Kommandos

Pilot prüfen:

```bash
cd app
npm run quality:semantic-atomicity
npm run quality:semantic-atomicity:check
```

Nach echter semantischer Reprüfung Fingerprints aktualisieren:

```bash
cd app
npm run quality:semantic-atomicity -- --write-fingerprints
```

Graphvalidierung:

```bash
cd app
npm run validate:graph
```
