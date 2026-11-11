## Lernzielbuch und Evidenz-Review-Pipeline {#sec:sga-goal-book}

Das **Lernzielbuch** und die Pipeline für positive Verständnis-Evidenzprofile machen jedes curriculare atomare Lernziel für Menschen und Multi-KI-Reviews prüfbar, ohne die lernendenseitigen Zieltexte aufzublähen (die darauf aufbauende Unterrichts-Zeitplanung für Lehrkräfte ist in [Lernzielbuch-Zeitplanung](repo:docs/concept/skill-graph/teacher-goal-book-time-planning.en.md) beschrieben).

### Gemeinsames BookModel, Ein-Ziel-pro-Seite-Atlas und Evidenzprofile V2 {#sec:sga-gb-bookmodel}

Ein deterministisches `BookModel` (`contracts/goal-book/v1/goal-book-model-1.1.schema.json`) speist identisch die schreibgeschützte `/lernzielbuch`-WebGUI und das A4-Hochformat-PDF:

- **Aktuelle bundesweite Review-Ausgaben (30.08.2026):** **792** eindeutige curricular-atomare Zielseiten für Gymnasium Mathematik und **461** Seiten für Physik über alle 16 Bundesländer (`publicationMode: review`, mit QA-Ledger-gebundenen Kandidatenbildern ohne Behauptung menschlicher Bildfreigabe; Coach-Runtime und Mastery-Schreibpfad bleiben unverändert).
- **Vierzehn verbindliche Invarianten:** Knappe kanonische `title`/`description`; separate fingerprint-gebundene V2-Evidenzprofile (`contracts/goal-evidence/v2/goal-evidence-profile.schema.json` mit `expectations`, `coverageExpectations`, `variationAxes` und `applicationCaseBriefs`; V1 bleibt als Archivhistorie erhalten); **genau eine physische Seite je regulärem atomarem Ziel** mit vollständiger **Lernziel-ID**, Kapitelpfad (`canonical-composition-view-v1` + **Bundeslandspezifische Ergänzungen** mit lückenloser `treeOrder`), stabiler Kahn-Topologiesortierung entlang `requires`, klickbaren PDF-Sprungzielen (`goal-<uuid>`), Fail-Closed-Überlauf-/Lesbarkeitsprüfung, inkrementellen Skia-PDF-1.4-Lesezeichen, bundeslandprimären Geltungstupeln (`Bundesland -> [{stage, durationModel, courseProfile}]` – niemals kartesische `G8`/`G9`-Kreuzprodukte) sowie nachgeladenen `/lernzielbuch/<bookId>.original-sources.json`-Quellenmatrizen.
- **Anwendungsbasierte Anerkennungsprüfung (04.11.2026):** Prüfungen mit globaler Kompetenzanerkennung ([Implizite Beherrschung](repo:docs/concept/skill-graph/assessment-gated-completion.md)) verlangen vor Freigabe ein statisches Review gegen kompensierende Nebenpunkte.

### Multi-KI-Review-Schleife, Evidenzgates und moderierter Feedback-Transfer {#sec:sga-gb-review-feedback}

Die Qualitätssicherung verbindet eine schnelle blinde Multi-KI-Schleife mit strengen Verallgemeinerungsgates und einem langsamen, datensparsamen öffentlichen Feedbackkanal:

| Skala | Stufen & Bedeutung |
| --- | --- |
| **Evidenz (`E0`–`E5` + `NORMATIVE`)** | `E0` unbelegte Meinung $\to$ `E1` verankerte Beobachtung $\to$ `E2` reproduzierbares Minimal-Gegenbeispiel $\to$ `E3` unabhängige Multi-Modell-/Prompt-Triangulation $\to$ `E4` kontrollierte Feldevidenz $\to$ `E5` replizierte Kohortenevidenz. |
| **Geltungsumfang (`G0`–`G4`)** | `G0` Einzelfall $\to$ `G1` einzelnes Ziel $\to$ `G2` Zielarchetyp (erfordert $\ge$ `E3` über $\ge$ 2 Kapitel) $\to$ `G3` Fach/Stufe (geschichtete Stichprobe + Replikation) $\to$ `G4` globale Coach-/Mastery-Regel (Mathe + Physik + Feld-Canary). |
{cols="30%,70%"}

- **Zweistufige V2-Kampagne:** Kalibriert an 16 Mathematikzielen (`5`–`10`, `E`–`Q4`, Pilotziel `8dd9f210-2683-5902-acab-e3be22725232`) vor dem 792-Ziele-Lauf: (1) Atlas-V1 einfrieren, (2) blindes Codex-V1-Review (`keep` | `revise` | `split_review` | `block`), (3) deterministischer Check + einzelzielweise menschliche Entscheidung, (4) kontrollierte zweisprachige V2-Pflege + Folgelane-Prüfung, (5) blindes Zweitanbieter-V2-Review, (6) dissenzwahrende Synthese. Weder Modellmehrheit noch Ausbleiben von Kritik geben Änderungen automatisch frei.
- **Zweiphasiger `/lernziel-feedback`-Transfer:** In Produktion standardmäßig deaktiviert und durch `SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN` geschützt; verarbeitet datensparsame V2-Umschläge ohne Lernenden-/SkillPilot-ID, Kontaktfeld oder Dateiupload. `POST /api/operations/goal-feedback/v1/export-batches` exportiert deterministische Batches samt serverseitigem Publikationssnapshot nach `tmp/goal-feedback/inbox/` (`trusted-context.jsonl` strikt getrennt von `untrusted-feedback.jsonl`); erst nach lokaler Byte-/Digest-Prüfung löscht ein idempotentes `DELETE .../{exportId}` mit `If-Match` die Live-Zeilen unter Erhalt einer inhaltsfreien Löschquittung.

```bash
npm --prefix app run quality:goal-evidence:check
npm --prefix app run build:goal-book-model -- \
  scripts/config/goal-books/de-gym-math-national-atlas.json
npm --prefix app run build:goal-book-original-sources
npm --prefix app run check:goal-book-original-sources
```
