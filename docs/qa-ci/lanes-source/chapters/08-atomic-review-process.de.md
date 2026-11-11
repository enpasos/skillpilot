## Atomizitäts-Reviewprozess {#sec:qal-atomic-review}

Dieses Kapitel beschreibt den wiederholbaren manuellen Autoren- und QA-Workflow, mit dem bestehende Blattziele (`contains: []`) einer Skill-Landschaft auf echte didaktische Atomizität geprüft und gebündelte Ziele sauber aufgeteilt werden (ergänzend zum maschinell gestützten Ledger-Gate `CQR-301` in [Semantische Atomizität](repo:docs/qa-ci/semantic-atomicity-review.md)).

### Geltungsbereich und Arbeitsdefinition {#sec:qal-atomic-definition}

Geprüft wird jeweils eine Landschaftsdatei pro Durchgang über alle Ziele mit `contains: []`. Bewusst **ausgenommen** sind Zieltypen mit eigenen QA-Lanes:

- Memorierungsziele mit `memorization` oder `srs-deck:*`,
- Prüfungs- und Aufgabenbündel mit `examData`,
- Motivations- und Orientierungsziele (`Motivation`, `Orientation`).

Ein fachliches Lernziel gilt als **atomar**, wenn alle vier Kriterien erfüllt sind:

1. Es beschreibt genau **eine** tragende Kompetenzhandlung.
2. Es ist realistisch in **1–3 Aufgaben** überprüfbar.
3. Es bildet relativ zu seinen Voraussetzungen **einen kleinen didaktischen Lernschritt**.
4. Es versteckt keine unabhängigen Teilkompetenzen hinter einem Sammelsatz (Warnsignale: mehrere Verben unterschiedlicher kognitiver Stufen, mehrere Teilgebiete oder getrennte Nachweispflichten).

### Siebenstufiger Review-Ablauf und Entscheidungsdatei {#sec:qal-atomic-workflow}

Das Werkzeug `app/scripts/generateAtomicReport.ts` (`npm run report:atomic`) bereitet Entscheidungsgerüst und Befundbericht (`../tmp/atomic_findings_<curriculum>.md` mit Zusammenfassung, `not_ok`-Befunden und Komplettanhang) vor:

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/<...>/json/<file>.json \
  --decisions ../tmp/atomic_decisions_<name>.json \
  --init-decisions
```

1. Entscheidungsgerüst initialisieren oder aktualisieren.
2. Jedes Blattziel semantisch zerlegen (Handlungsverben, Gegenstandsbereich, erwarteter Kompetenznachweis).
3. Manuell prüfen, ob eine Aufteilung in 2–4 Teilziele Klarheit und Prüfbarkeit substanziell verbessert (nur bei echtem didaktischem Präzisionsgewinn `not_ok` vergeben, nicht aus rein stilistischen Gründen).
4. Status (`ok`, `not_ok`, `pending`) in der JSON-Entscheidungsdatei festhalten:

```json
{
  "goals": {
    "<goalId-a>": { "status": "ok" },
    "<goalId-b>": {
      "status": "not_ok",
      "problem": "warum das Ziel gebuendelt ist",
      "proposal": "wie es in 2-4 Teilziele geschnitten wird"
    },
    "<goalId-c>": { "status": "pending" }
  }
}
```

5. Für `not_ok`-Ziele einen konkreten Schnitt ausarbeiten (`title`, `description`, `requires`, Eltern-`contains`).
6. Nach Umsetzung Zyklenfreiheit, Referenzintegrität und Gewichte prüfen (atomare Ziele behalten in der Regel `weight = 1`; Clustergewichte spiegeln die Anzahl eindeutiger atomarer Nachfahren wider).
7. Abschließend `cd app && npm run validate:graph` ausführen.
