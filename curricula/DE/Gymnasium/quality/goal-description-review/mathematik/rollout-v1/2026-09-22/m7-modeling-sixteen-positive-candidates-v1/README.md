# Mathematik M7: 16 Modellierungs-P-v2-Kandidaten

Arbeitsstand 23. September 2026 (lokal), technische Zeitstempel in UTC.

## Ergebnis

`modeling-sixteen.candidates.json` enthält genau die 16 Q4-Modellierungsziele aus der Modellierungskreislauf-Gruppe der `2026-09-21/remaining-batch-reuse-inventory.md`. Für jedes Ziel gibt es ein inhaltsspezifisches P-v2-Profil mit zwei notwendigen Verständnis-Erwartungen, zwei Strukturvariationen und zwei eigenständigen, bilingualen Anwendungsszenarien. Insgesamt sind es 32 DE/EN-Fälle. Die Profile behandeln Annahmen, Einheiten, Geltungsbereiche, zulässige Ergebnisse und Grenzen jeweils dort, wo das aktuelle Ziel sie beansprucht. Insbesondere werden konstante und veränderliche Raten, diskrete Kapazität, dimensionsrichtige Kosten- und Bestandsmodelle sowie kurzreichweitige Wachstumsprognosen unterschieden.

Der native `positive-understanding-evidence-candidates-v1`-Container führt keinen eigenen Status. `authoring-context.json` hält daher ausdrücklich `needs_human_review` / `ai_candidate`, E1/G1 in jedem CandidateSpec, `finalMaterialization: false`, `registered: false` und `resourceBindingsFinal: false` fest. Es gibt keine P-v2-Review-Records, keine aktuelle `reviewInputFingerprint`- oder Seiten-/Asset-Bindung und keine P-Registry-Konfiguration. Diese Ausarbeitung ist keine Human-Freigabe, kein D-Abschluss und kein M7-Nachweis.

## Quellenbindung und Wiederholbarkeit

- Die aktuell kanonischen DE/EN-Texte, Relationen, Tags und nativen Goal-Fingerprints sind pro Ziel in `authoring-context.json` erfasst.
- Als fachliche Ausgangssubstanz wurden die 16 alten AI-KEEP-Records aus `tmp/goal-description-reviews/math-gymnasium-full-20260816-v1/review-campaign/results/codex-first-pass-20260816-v1.batch-026/records.jsonl` verwendet. Exakte Datei- und Zeilenhashes sowie ihre vollständigen damaligen Understanding-Evidence-Felder sind im Kontext dokumentiert. Die alte Kampagne erfüllt den aktuellen D-Vertrag nicht und wird nicht als unabhängige oder aktuelle D-Runde gezählt. Da die Quelldatei unter `tmp/` liegt, ist sie kein dauerhaftes Publikationsartefakt.
- `author.mjs` enthält die fachlich verfassten Profile und erzeugt nur die beiden lokalen JSON-Dateien mit `--write`. Der erzeugte Kontext berechnet aktuelle Goal- und Profilfingerprints mit `app/scripts/positiveGoalEvidenceProfileModel.ts`.
- `check-authoring.mjs` prüft die V2-Profilstruktur, 16/32-Umfang, alle aktuellen DE/EN-Texte, Source-Hashes, Fingerprints, Autoritätsgrenzen und 18 gezielte Rechen-/Domänenaussagen. `validation.json` ist der tatsächliche erfolgreiche Lauf.

Wiederholung vom Repository-Root:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-22/m7-modeling-sixteen-positive-candidates-v1/check-authoring.mjs
```

Für eine spätere zentrale P-Integration sind ein aktueller D-/Book-Kontext, Review-Input- und Ressourcenbindung, native Materialisierung, fachliche Gegenprüfung und die vorgesehenen zentralen Gates erforderlich. Die historischen Einträge sind Arbeitsmaterial für diesen Schritt, keine Ersatzfreigabe.
