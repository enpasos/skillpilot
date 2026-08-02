# Work Notes: Atomicitäts-Prozess (Authoring, nicht CI)

> Historical work-notes record, 17 February 2026. It documents how this work was done at that time.
> It is not current process and not a source of truth.
> Current reference: [atomic review process](../../qa-ci/atomic-review-process.md)

Stable reference documentation now lives in `docs/qa-ci/atomic-review-process.md`.
This work-notes file keeps run-specific context, examples, and dated review history.

Datum: 2026-02-17  
Scope: Alle Curricula unter `curricula/.../json/*.json` (pro Review-Durchlauf genau eine Datei)

## Ziel
Beim Erstellen/Überarbeiten von Skill-Graphen soll für **jedes bestehende atomare Ziel** geprüft werden:
1. Ist das Ziel wirklich atomar (ein klarer, kleiner Kompetenzschritt)?
2. Oder bündelt es mehrere voneinander trennbare Teilschritte?
3. Falls nicht atomar: In welche **kleineren konkreten Teilziele** wird es aufgeteilt?

Wichtig: Die Entscheidung ist fachlich-didaktisch und nur teilweise algorithmisch prüfbar.

## Arbeitsdefinition: "atomar"
Ein Ziel gilt als atomar, wenn alle Punkte erfüllt sind:
1. Es beschreibt **eine zentrale Kompetenzhandlung** (nicht mehrere unabhängige Handlungen).
2. Es ist in **1-3 Aufgaben** sinnvoll prüfbar.
3. Es ist didaktisch ein **einzelner Lernschritt** relativ zu den Voraussetzungen.
4. Es enthält keine versteckte Bündelung durch Formulierungen wie "... und ... und ...", die jeweils eigene Teilkompetenzen verlangen.

Typische Warnsignale für "nicht atomar":
- Mehrere Verben mit eigenem kognitiven Niveau (z. B. analysieren + modellieren + bewerten).
- Inhaltlich verschiedene Objekte/Teilgebiete in einem Satz.
- Ergebnis verlangt mehrere voneinander unabhängige Nachweise (z. B. Rechnen plus allgemeiner Beweis plus Transfer auf neuen Kontext).

Sonderregel für SRS-/Lernkartenziele:
- Ziele mit `tags` wie `memorization` oder `srs-deck:*` werden im Atomic-Review **nicht automatisch als Split-Kandidat** behandelt.
- Begründung: Diese Ziele modellieren bewusst Deck-basiertes Retrieval (Layer-B/SRS-Logik) und werden über Fälligkeit/Kartenstand gesteuert, nicht über klassische Aufgabenzerlegung.
- Qualitätsprüfung dafür läuft separat über Deck-Qualität (Kartenabdeckung, Dubletten, Formulierung, Schwierigkeit), nicht über den Atomic-Split-Prozess.

Sonderregel für Aufgaben-/Prüfungsziele:
- **Insgesamt werden keine Aufgaben über diesen Atomic-Weg angepasst.**
- Ziele mit `examData` (Abitur-/Klausur-/Prüfungsset) sind im Atomic-Review vom Split ausgeschlossen.
- Ebenso ausgeschlossen sind aufgabennahe Sammelziele (z. B. explizite Vorschlags-/Übungsaufgaben), falls sie als Aufgabenpaket modelliert sind.
- Begründung: Diese Ziele repräsentieren Leistungsnachweise/Assessment-Bündel, nicht die feinkörnige Lernzielstruktur.
- Qualitätsprüfung dafür läuft separat über Aufgabendesign, Scoring und Anforderungsniveau, nicht über den Atomic-Split-Prozess.

Sonderregel für Motivations-/Orientierungsziele:
- Übergreifende Motivator- oder Orientierungsknoten (z. B. Tags `Motivation`, `Orientation`) werden im Atomic-Review nicht gesplittet.
- Begründung: Diese Ziele sind bewusst als Einstieg/Big-Picture-Kommunikation modelliert, nicht als fein-granulare Prüfkompetenz.
- Qualitätsprüfung dafür läuft separat über didaktische Klarheit und Anschlussfähigkeit, nicht über Atomic-Split.

## Vorgehen pro atomarem Ziel

1. Ziel auswählen
- Nur Ziele mit `contains: []`.

2. Ziel semantisch zerlegen
- Kompetenz-Verben markieren.
- Fachobjekte markieren (woran wird die Handlung ausgeführt?).
- Erwartete Prüfleistung in einem Satz formulieren.

3. Atomaritäts-Check (manuell)
- Frage A: Gibt es genau **eine** Haupthandlung?
- Frage B: Ist diese Handlung mit einem klaren Kompetenznachweis prüfbar?
- Frage C: Ist der didaktische Sprung klein genug?
- Frage D: Kann man das Ziel ohne Qualitätsverlust sinnvoll in 2+ eigenständige Teilziele trennen?

4. Entscheidung
- `atomic ok` (klar atomar)
- `Grenzfall` (noch vertretbar, aber sprachlich/fachlich eng)
- `Split nötig` (`atomic nicht ok`)

5. Split-Entwurf (nur bei `atomic nicht ok`)
- Neues Zielset mit 2-4 Teilzielen formulieren.
- Für jedes Teilziel definieren:
  - `id`, `title`, `description`
  - `requires` (kleiner, rückwärtsgerichteter Lernpfad)
  - `core`, `level`, `phase`, `area`
- Eltern-Cluster (`contains`) auf neue Teilziele umstellen.
- Bei Bedarf Reihenfolge zwischen den neuen Teilzielen über `requires` setzen.
- `weight`-Konsistenz prüfen (atomar i. d. R. `weight = 1`; Clustergewichte nach eindeutigen atomaren Descendants).

6. DAG- und Konsistenzprüfung
- Keine Zyklen in `requires` oder `contains`.
- Keine verwaisten Referenzen nach Split.
- Validierung ausführen:

```bash
cd app
npm run validate:graph
```

---

## Vorgeführt am Beispiel (bereits umgesetzter Split)

Ausgangsziel (früheres Bündelziel):
- `35aea485-3fa8-4d7f-984b-daf42973f971`
- Alter Zuschnitt enthielt zwei trennbare Kompetenzteile:
  1. spezielle Lagen von Geraden/Ebenen begründen
  2. Transformationsargumente für Flächen/Volumina nutzen

Beurteilung:
- **atomic nicht ok (Split nötig)**, da zwei eigenständige Prüfhandlungen mit unterschiedlichen Nachweisen.

Umsetzung:
1. `35aea485-3fa8-4d7f-984b-daf42973f971`
- Titel: `Spezielle Lagen von Geraden und Ebenen begründen (LK)`

2. Neues Teilziel `9f8fcb66-4cf0-4e65-a6cb-9d7f7cb0f2d6`
- Titel: `Transformationsargumente für Flächen und Volumina nutzen (LK)`
- mit eigenem `requires`-Set

Ergebnis:
- Präzisere Messbarkeit pro Ziel.
- Klarere Zuordnung von Aufgaben und Feedback.

---

## Kompakte Prüfschablone (für weitere Ziele)

```md
Ziel-ID / Titel:
Atomic? (ja/nein):

Semantische Zerlegung:
- Verben:
- Fachobjekte:
- Erwarteter Kompetenznachweis:

Atomaritäts-Urteil:
- Eine Haupthandlung? (ja/nein)
- In 1-3 Aufgaben prüfbar? (ja/nein)
- Didaktisch ein einzelner Schritt? (ja/nein)
- Sinnvoll in Teilziele trennbar? (ja/nein)

Entscheidung:
- atomic ok / Grenzfall / Split nötig

Falls Split nötig:
- Problem:
- Vorschlag Teilziel A:
- Vorschlag Teilziel B:
- Anpassung `requires`/`contains`:
```

---

## Zielausgabe (verbindliches Ergebnisformat)

Das Prüfergebnis pro atomarem Ziel wird auf **eine von zwei Aussagen** reduziert:

1. `atomic ok`
2. `atomic nicht ok`
   - Problem: Warum ist das Ziel nicht atomar?
   - Lösungsvorschlag: Welche konkrete Zielteilung wird empfohlen?

### Minimale Struktur pro geprüftem atomaren Ziel

```md
- goalId: <uuid>
  title: <Titel>
  status: atomic ok | atomic nicht ok | pending
  problem: <leer bei ok/pending, Pflichtfeld bei nicht ok>
  proposal: <leer bei ok/pending, Pflichtfeld bei nicht ok>
```

Beispiel:

```md
- goalId: 35aea485-3fa8-4d7f-984b-daf42973f971
  title: Spezielle Lagen von Geraden und Ebenen begründen (LK)
  status: atomic ok
  problem:
  proposal:
```

---

## Gesamtdokument pro Curriculum (Findings-Report)

Wenn auf alle atomaren Ziele eines Curriculums angewandt, entsteht **ein einziges Report-Dokument** mit:

1. Kurzüberblick
- Curriculum-Datei
- Anzahl atomarer Ziele
- Anzahl `atomic ok`
- Anzahl `atomic nicht ok`
- Anzahl `pending`

2. Findings-Liste (nur `atomic nicht ok`)
- Jede Zeile enthält:
  - `goalId`
  - `title`
  - `problem`
  - `proposal`

3. Vollständige Prüfliste (optional Anhang)
- Alle atomaren Ziele mit Status (`ok`/`nicht ok`/`pending`) für Nachvollziehbarkeit.

### Report-Vorlage

```md
# Atomic Findings Report

Curriculum: <pfad>
Date: <YYYY-MM-DD>

## Summary
- Atomic goals checked: <n>
- atomic ok: <n_ok>
- atomic nicht ok: <n_not_ok>
- pending: <n_pending>

## Findings (atomic nicht ok)
1. goalId: <uuid>
   title: <Titel>
   problem: <Beschreibung>
   proposal: <konkrete Zielteilung>

## Appendix (all checked goals)
- goalId: ...
  title: ...
  status: atomic ok
- goalId: ...
  title: ...
  status: atomic nicht ok
  problem: ...
  proposal: ...
```

---

## Entscheider-Workflow

1. Fachliche Prüfung erzeugt den Atomic-Findings-Report.
2. Entscheider sichtet nur den Abschnitt **Findings (atomic nicht ok)**.
3. Pro Finding Entscheidung:
- `annehmen` (Split wie vorgeschlagen umsetzen)
- `anpassen` (modifizierter Split)
- `verwerfen` (bewusst nicht splitten, Begründung dokumentieren)
4. Umgesetzte Entscheidungen werden im Graphen eingearbeitet.
5. Danach erneuter vollständiger Durchlauf zur Verifikation.

---

## Tooling (implementiert, wiederverwendbar)

Implementiert:
- Script: `app/scripts/generateAtomicReport.ts`
- NPM-Command: `npm run report:atomic` (in `app/`)

### Eingaben
1. `--input <curriculum.json>` (Pflicht)
2. `--decisions <decisions.json>` (optional, manuelle Entscheide)
3. `--output <report.md>` (optional, default in `tmp/`)
4. `--init-decisions` (optional: legt für alle atomaren Ziele `pending` an)

### Decisions-Datei (manuell gepflegt)

```json
{
  "goals": {
    "35aea485-3fa8-4d7f-984b-daf42973f971": {
      "status": "ok"
    },
    "beispiel-goal-id": {
      "status": "not_ok",
      "problem": "Ziel bündelt mehrere trennbare Kompetenzhandlungen.",
      "proposal": "Split in Teilziel A (Analyse) und Teilziel B (Transfer)."
    }
  }
}
```

### Ausführung (Beispiel Physik)

Entscheidungen initialisieren:

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json \
  --decisions ../tmp/atomic_decisions_demo_physics.json \
  --init-decisions
```

Findings-Report erzeugen:

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json \
  --decisions ../tmp/atomic_decisions_demo_physics.json \
  --output ../tmp/atomic_findings_DE_HES_S_GYM_2_PHYSIK.de.md
```

### Ergebnisdatei
- Report enthält:
  - Summary (`atomic ok` / `atomic nicht ok` / `pending`)
  - Findings-Liste (`atomic nicht ok`)
  - Appendix mit allen atomaren Zielen.

---

## Update 2026-02-17 (Physik-Durchlauf)

### Scope
`curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json`

### Entscheidungen initialisieren (alle atomaren Ziele auf `pending`)

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json \
  --decisions ../tmp/atomic_decisions_DE_HES_S_GYM_2_PHYSIK.de.json \
  --init-decisions
```

Ergebnis:
- Datei erstellt/aktualisiert: `tmp/atomic_decisions_DE_HES_S_GYM_2_PHYSIK.de.json`
- Hinzugefügt: `252` atomare Ziele mit Status `pending`

### Findings-Report erzeugen (Physik)

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json \
  --decisions ../tmp/atomic_decisions_DE_HES_S_GYM_2_PHYSIK.de.json \
  --output ../tmp/atomic_findings_DE_HES_S_GYM_2_PHYSIK.de.md
```

Ergebnis:
- Report: `tmp/atomic_findings_DE_HES_S_GYM_2_PHYSIK.de.md`
- Atomic goals total: `252`
- Reviewed ok: `0`
- Reviewed not_ok: `0`
- Pending: `252`

Hinweis:
- Der Report ist vollständig erzeugt, aber fachlich noch nicht entschieden (`pending`).
- Nächster Schritt ist die manuelle Atomic-Review pro atomarem Ziel (`ok` / `not_ok` inkl. `problem` und `proposal` bei `not_ok`).

### Update: Entscheidungsstand abgeschlossen (2026-02-17)

Durchgeführt:
- `tmp/atomic_decisions_DE_HES_S_GYM_2_PHYSIK.de.json`: alle atomaren Ziele von `pending` auf `ok` oder `not_ok` gesetzt.
- Report neu erzeugt:
  - `tmp/atomic_findings_DE_HES_S_GYM_2_PHYSIK.de.md`

Aktueller Stand:
- Atomic goals total: `252`
- Reviewed ok: `242`
- Reviewed not_ok: `10`
- Pending: `0`

Findings-Schwerpunkte (`atomic nicht ok`):
1. Breite Sammelziele mit mehreren unabhängigen Handlungen/Kontexten (10 Ziele), z. B. `4e327e2e-8ad6-4fc0-8c6e-46189e0ceea4`, `f11d6674-dd8c-43b9-93c3-76dc3d6eb75c`, `aa2de3a3-f1ad-4f4b-9ed6-9894d27f0e2a`.

### Korrekturhinweis (2026-02-17)
- Die initiale Einstufung der Lernkarten-Ziele als `atomic nicht ok` wurde zurückgenommen.
- Lernkarten-/SRS-Ziele gelten im Atomic-Review als eigener Typ und werden über den separaten Deck-Qualitätsprozess beurteilt.
- Die initiale Einstufung von `examData`-Zielen als `atomic nicht ok` wurde ebenfalls zurückgenommen.
- Aufgaben-/Prüfungsziele werden insgesamt nicht über Atomic-Splits geändert.
- Das Motivationsziel `Warum Physik? – Weltverständnis & Zukunft` wurde ebenfalls von `not_ok` auf `ok` korrigiert (nicht im Split-Scope).
