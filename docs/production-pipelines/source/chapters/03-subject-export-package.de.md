## SkillPilot-Fachexport-Paket {#sec:pp-subject-export}

Diese Pipeline erzeugt ein reproduzierbares Legacy-Fachexport-ZIP (`legacy-subject-export`, Zielstatus `not-ready-legacy`, `standaloneProfileReady: false` gemäß [Curriculum-Paketbereitschaft](repo:docs/qa-ci/curriculum-package-readiness.md)) für eine einzelne Fachlandschaft als geprüfter Publikations- und Roundtrip-Träger (@ref{sec:pp-mem-fwu-roundtrip}), jedoch nicht als alleinige `full-standalone-v1`-Laufzeiteingabe ([Release-Modell-Konformität](repo:docs/qa-ci/curriculum-release-model-conformance.md)). Unterstützte `DE/Gymnasium`-Presets decken aktuell alle Fächer ab `M5` ab: `Biologie`, `Chemie`, `Deutsch`, `Geschichte`, `Informatik`, `Latein`, `Mathematik`, `Physik`, `Politik und Wirtschaft` sowie `Wirtschaftswissenschaften`.

### Bau, unabhängige Validierung, Link-Audit und CI-Release-Gate {#sec:pp-export-commands}

Einzelbau, Batch-Bau aller `M5`/`M6`-Fächer (`tmp/exports/m5-subject-export-summary.{json,md}`), unabhängige ZIP-Validierung (`tmp/exports/validation/` + `tmp/exports/readiness/`), Live-Quelllink-Audit (`--fail-on-broken` für strikte Vorabprüfung) und Reproduzierbarkeitsbeweis (`SOURCE_DATE_EPOCH`, unkomprimierte sortierte Einträge mit Modus `0644`):

```bash
cd app
npm run export:subject-package -- --subject Mathematik --version 0.1.0
npm run export:m5-subject-packages -- --version 0.1.0
npm run export:subject-packages:validate -- --dir tmp/exports
npm run export:subject-packages:audit-links -- --dir tmp/exports
npm run export:subject-release-gate -- --version 0.1.0 --strict-source-links
npm run export:subject-release-gate:ci
npm run export:m5-subject-packages:check-reproducible -- --version 0.1.0
SOURCE_DATE_EPOCH=1767225600 npm run export:subject-package -- \
  --subject Mathematik --version 0.1.0
```

`export:subject-release-gate:ci` läuft wöchentlich/manuell in `.github/workflows/owl-ci.yml` mit `--enforce-committed-quality-status --enforce-clean-source-tree` und schreibt Release-Gate- sowie Publikations-Indizes unter `tmp/exports/{release-gate,publication}/`. Für Reviewer-Übergaben löst `export:subject-package:trace-source` Quell- oder kanonische Ziel-IDs direkt aus dem fertigen ZIP auf:

```bash
cd app
ZIP=../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
npm run export:subject-package:trace-source -- \
  --zip "$ZIP" --source-goal-id he-math-sekii-e-1-b01-a01-376ffbbc
npm run export:subject-package:trace-source -- \
  --zip "$ZIP" --canonical-goal-id 502ecaa7-cca6-5c51-a1cc-da09a7b2382c
```

### Paketstruktur, Quellen-/Merkkarten-Evidenz, Lizenzkategorien und neue Fächer {#sec:pp-export-contents}

Jedes Archiv entpackt Windows-`MAX_PATH`-sicher unter `skillpilot-de-gymnasium-<fach>-v<version>/` ohne Repository-Pfade oder Lernstände (der begleitende `*-release-report.md` liegt außerhalb des ZIPs):

- **Fach- & Quellendaten:** `data/canonical/`, `data/views/`, `data/mappings/` (alle 16 Länder; unvollständige Länderabdeckung nur explizit per `--allow-missing-states`), `data/cards/` + `card-index.json`, `data/resources/goal-visualizations.json` + nur aktiv verlinkte Bilder unter `assets/goal-visualizations/`, `data/dependencies/external-goal-references.json` sowie die verpflichtende HTTP(S)-Quellenbrücke `data/sources/source-index.json` $\leftarrow$ `data/sources/source-goal-references.json` (`metadata/provenance-report.md`).
- **Qualität, Schemata & Checksummen:** `metadata/quality/memory-card-review/` (`*.md`, `*.config.json`, `*.review.jsonl`, `*.cards.review.jsonl` für `CQR-302`), `schemas/`, `metadata/manifest.json`, `metadata/validation-report.json`, `metadata/SHA256SUMS`.
- **Dateibasierte Lizenzkategorien (`LICENSE.md`, `NOTICE.md`, `licenses/`):** Gemäß `LICENSING.md` trägt jede Datei in `manifest.json` eine `licenseCategory`: `skillpilot-software-apache-2.0`, `skillpilot-data-cc-by-4.0`, `official-source-provenance-only`, `generated-package-metadata` oder `goal-visualization-ai-generated-curated` (Provenienzlabel, kein SPDX-Bezeichner und keine Drittrechte-Freigabe).
- **Wiederverwendung für neue Fächer ohne Preset:** Explizite Selektoren `--subject`, `--subject-slug`, `--composition-dir` und wiederholte `--mapping-token`-Parameter übergeben.
