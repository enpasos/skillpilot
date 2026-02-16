# Work Notes: Requires-Prozess (Authoring, nicht CI)

Datum: 2026-02-16  
Scope: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json`

## Ziel
Beim Erstellen/Überarbeiten von Skill-Graphen soll für **jedes atomare Ziel** geprüft werden:
1. Welche `effective requires` gelten tatsächlich?
2. Folgt das Ziel aus diesen Voraussetzungen in einem **kleinen, vertretbaren didaktischen Schritt**?

Wichtig: Schritt 2 ist eine **inhaltliche Expertenbeurteilung**, nicht algorithmisch entscheidbar.

## Vorgehen pro atomarem Ziel

1. Ziel auswählen
- Nur atomare Ziele (`contains: []`).

2. `effective requires` bestimmen
- `direct requires` des Ziels.
- Geerbte `requires` über alle Vorfahren entlang `contains` (Parent-Kette).
- Ergebnis als Liste mit **Herkunft** dokumentieren:
  - direkt vom Ziel,
  - geerbt von Cluster X, Y, ...

3. Inhaltscheck (manuell)
- Frage: Ist der Kompetenzsprung von der Prereq-Frontier zum Ziel klein genug?
- Dazu in 2-4 Sätzen:
  - Was können Lernende nach den Voraussetzungen bereits?
  - Was ist im Ziel neu?
  - Ist das neu Hinzukommende ein einzelner, vertretbarer Schritt oder ein Bündel mehrerer Schritte?

4. Entscheidung
- `OK` (kleiner Schritt)
- `Grenzfall` (didaktisch diskutieren/ggf. Reihung anpassen)
- `Split nötig` (Brückenziel einziehen oder Ziel aufteilen)

---

## Vorgeführt am Beispiel

### Ziel
- `d6f5fcdf-b032-4d55-9643-850378d61a82`
- Titel: **Wirkungsgrad und Carnot-Grenze quantitativ vergleichen**
- Fundstelle: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json:3621`

### 1) Direkte Requires
- `745cfd6f-2907-49d1-a126-7a5767864ec7` (Fundstelle: `...:3633`)
- `ad9d1b14-5690-4160-9ca8-b98d182d2c36` (Fundstelle: `...:3634`)

### 2) Effective Requires (mit Herkunft)

1. `52c3d2e8-6634-4806-b84b-3709e3c4aef1`  
   Titel: E.2 Newton'sche Axiome und Erhaltungssätze  
   Herkunft: geerbt von `E.6 Grundlagen der Thermodynamik`

2. `745cfd6f-2907-49d1-a126-7a5767864ec7`  
   Titel: Ersten Hauptsatz in Prozessen quantitativ bilanzieren  
   Herkunft: direkt vom Ziel

3. `bda3add4-967c-4a42-83a4-db52a45bcf4f`  
   Titel: Ersten Hauptsatz verstehen und mit Formel angeben  
   Herkunft: geerbt von `Thermodynamische Prozessrechnung`

4. `75c8920f-757e-47bf-be3a-a5901eb52334`  
   Titel: Mechanische Arbeit als Energieänderung  
   Herkunft: geerbt von `E.6 Grundlagen der Thermodynamik`

5. `ad9d1b14-5690-4160-9ca8-b98d182d2c36`  
   Titel: Zweiten Hauptsatz auf Wärmekraftmaschinen anwenden  
   Herkunft: direkt vom Ziel

6. `af83fb24-2498-4de2-ab45-ea0485a4b1b2`  
   Titel: Zweiten Hauptsatz verstehen und mit Entropie-Formulierung angeben  
   Herkunft: geerbt von `Thermodynamische Prozessrechnung`

### 3) Inhaltliche Beurteilung (manuell)

Beobachtung:
- Voraussetzungen decken ab:
  - quantitative Energiebilanz in Prozessen (1. Hauptsatz, Rechnen),
  - qualitative Einordnung des 2. Hauptsatzes für Wärmekraftmaschinen inkl. Carnot-Idee.
- Ziel fordert:
  - Wirkungsgrad aus Messdaten rechnen,
  - quantitativ mit Carnot-Grenze vergleichen,
  - Abweichung fachlich begründen.

Urteil:
- **OK (kleiner Schritt)**  
  Begründung: Das Ziel baut auf bereits vorhandenen thermodynamischen Grund- und Rechenkompetenzen auf und führt primär einen klaren nächsten Schritt aus (quantitativer Vergleich real vs. ideal inkl. Begründung), statt mehrere neue Konzepte gleichzeitig einzuführen.

---

## Kompakte Prüfschablone (für weitere Ziele)

```md
Ziel-ID / Titel:
Atomic? (ja/nein):

Direct requires:
- ...

Effective requires (mit Herkunft):
- ... (direkt / geerbt von ...)

Delta-Satz (inhaltlich):
- Nach den Voraussetzungen können Lernende ...
- Im Ziel kommt neu hinzu ...

Entscheidung:
- OK / Grenzfall / Split nötig

Falls Grenzfall/Split:
- Vorschlag: zusätzliches Brückenziel oder Zielteilung in ...
```

---

## Zielausgabe (verbindliches Ergebnisformat)

Das Prüfergebnis pro atomarem Ziel wird auf **eine von zwei Aussagen** reduziert:

1. `requires ok`
2. `requires nicht ok`
   - Problem: Was genau ist fachlich/didaktisch falsch oder zu grob?
   - Lösungsvorschlag: Welche konkrete Änderung wird empfohlen?

### Minimale Struktur pro geprüftem atomaren Ziel

```md
- goalId: <uuid>
  title: <Titel>
  status: requires ok | requires nicht ok
  problem: <leer bei ok, Pflichtfeld bei nicht ok>
  proposal: <leer bei ok, Pflichtfeld bei nicht ok>
```

Beispiel:

```md
- goalId: d6f5fcdf-b032-4d55-9643-850378d61a82
  title: Wirkungsgrad und Carnot-Grenze quantitativ vergleichen
  status: requires ok
  problem:
  proposal:
```

---

## Gesamtdokument pro Curriculum (Findings-Report)

Wenn auf alle atomaren Ziele eines Curriculums angewandt, entsteht **ein einziges Report-Dokument** mit:

1. Kurzüberblick
- Curriculum-Datei
- Anzahl atomarer Ziele
- Anzahl `requires ok`
- Anzahl `requires nicht ok`

2. Findings-Liste (nur `requires nicht ok`)
- Jede Zeile enthält:
  - `goalId`
  - `title`
  - `problem`
  - `proposal`

3. Vollständige Prüfliste (optional Anhang)
- Alle atomaren Ziele mit Status (`ok`/`nicht ok`) für Nachvollziehbarkeit.

### Report-Vorlage

```md
# Requires Findings Report

Curriculum: <pfad>
Date: <YYYY-MM-DD>

## Summary
- Atomic goals checked: <n>
- requires ok: <n_ok>
- requires nicht ok: <n_not_ok>

## Findings (requires nicht ok)
1. goalId: <uuid>
   title: <Titel>
   problem: <Beschreibung>
   proposal: <konkrete Änderung>

## Appendix (all checked goals)
- goalId: ...
  title: ...
  status: requires ok
- goalId: ...
  title: ...
  status: requires nicht ok
  problem: ...
  proposal: ...
```

---

## Entscheider-Workflow

1. Fachliche Prüfung erzeugt den Findings-Report.
2. Entscheider sichtet nur den Abschnitt **Findings (requires nicht ok)**.
3. Pro Finding Entscheidung:
- `annehmen` (Vorschlag umsetzen),
- `anpassen` (modifizierte Lösung),
- `verwerfen` (bewusst so belassen, mit Begründung).
4. Umgesetzte Entscheidungen werden im Graphen eingearbeitet.
5. Danach erneuter vollständiger Durchlauf zur Verifikation.

---

## Tooling (allgemein, wiederverwendbar)

Implementiert:
- Script: `app/scripts/generateRequiresReport.ts`
- NPM-Command: `npm run report:requires` (in `app/`)

### Eingaben
1. `--input <curriculum.json>` (Pflicht)
2. `--decisions <decisions.json>` (optional, manuelle Entscheide)
3. `--output <report.md>` (optional, default in `tmp/`)

### Decisions-Datei (manuell gepflegt)

```json
{
  "goals": {
    "d6f5fcdf-b032-4d55-9643-850378d61a82": {
      "status": "ok"
    },
    "beispiel-goal-id": {
      "status": "not_ok",
      "problem": "Zielspringt didaktisch zu weit, weil ...",
      "proposal": "Brückenziel X einziehen und requires anpassen."
    }
  }
}
```

### Ausführung (Beispiel Physik)

```bash
cd app
npm run report:requires -- \
  --input ../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json \
  --decisions ../tmp/requires_decisions_demo_physics.json \
  --output ../tmp/requires_findings_DE_HES_S_GYM_2_PHYSIK.de.md
```

### Ergebnisdatei
- Report enthält:
  - Summary (`ok` / `nicht ok` / `pending`)
  - Findings-Liste (`requires nicht ok`)
  - Appendix mit allen atomaren Zielen inkl. direct/effective requires.
