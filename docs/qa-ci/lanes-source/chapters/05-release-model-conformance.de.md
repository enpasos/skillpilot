## Curriculum-Release-Modell-Konformität {#sec:qal-release-model}

`DPK-004` übersetzt den realen Mathematik-Authoring-Bestand des deutschen Gymnasiums in ein striktes, entpacktes Release-Modell (`DPK-004a` für die Laufzeitanteile, `DPK-004b` für die maßgebliche Publikationsevidenz) als ausführbare Brücke zum späteren `full-standalone-v1`-JSON-ZIP (@ref{sec:qal-package-readiness}). `DPK-004` bis `DPK-007a` sind technisch bestanden (`passed`).

### Überblick und vertrauenswürdige Eingaben {#sec:qal-release-inputs}

Der Compiler leitet keine Semantik aus Dateinamen oder Zieltiteln ab, sondern bindet vier explizite Eingaben:

1. **Release-Modell-Build-Profil** (`contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json`): Quell-/Ausgabepfade, Paketidentität, Views, Decks, Ressourcenregeln, Pfadrelokationen, Verträge und exakte Zähler (`1` Landschaft, `1.147` Ziele, `88` Views, `12` Decks, `128` Karten, `784` Ressourcenlinks, `715` aktive Bilder mit `1.549.052.741` Byte).
2. **Ontologie-Profil** (`contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json`, Version `1.1.1`): Durch SHA-256 gepinnt; bindet das Core-first-Mapping an Repository, Checkout-Pfad (`tmp/lehrplan-ontologie`), Commit, `src/ontology/components/lehrplan-core.owl`, Ontologie-IRI und Datei-Digest.
3. **Semantisches Zielarten-Ledger** (`curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json`): Aktueller Quell-Fingerprint für jedes der `1.147` Ziele ohne Titel-/ID-Heuristiken.
4. **Feldsemantik-Registry** (`contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json`): `456` explizite Einträge (`325` Runtime, `130` Publikation, `1` generischer Bestandseintrag; SHA-256 `d19497f0b18b0c7733dcaf6f5dc63590352814c2d764c858b333751b5af25e9d`), Normalisierungsprofil und geschlossene Draft-2020-12-Schemata (bidirektional ohne tote Registry-Pfade geprüft; `field-coverage.json` weist konkret belegte vs. reine Schemafelder getrennt aus).

:::table{cols="5.2cm,2.2cm,X"}
| Semantische Zielart (`semanticKind`) | Anzahl | Rolle im Mathematik-Release-Modell |
| --- | ---: | --- |
| `curricularAtomic` | `780` | Fachliche atomare Kompetenzziele (`711` mit aktivem Bild, `69` providerbedingt zurückgestellt, `152` menschlich freigegeben) |
| `curricularArea` | `218` | Fachliche Themen- und Bereichscluster |
| `practiceAssessment` | `129` | Übungs-, Klausur- und Abitur-Aufgabenknoten |
| `programStructure` | `7` | Programmstrukturelle Container |
| `memory` | `6` | SRS-/Merkwissen-Ziele |
| `runtimeSupport` | `5` | Technische Laufzeit-Stützknoten |
| `orientation` | `2` | Orientierungs- und Motivationsanker |
:::

### Erzeugte Modellstruktur, Digests und Publikationsevidenz {#sec:qal-release-structure}

Die Ausgabe entsteht atomar per Staging-Verzeichnis unterhalb von `tmp/` (`conformance-model-only-not-a-package`, Symlinks werden abgewiesen; Bildbytes selbst werden erst im Begleit-ZIP materialisiert):

```text
data/
  canonical/mathematik.landscape.json
  views/index.json & views/*.json
  cards/card-index.json & cards/*.json
  resources/resource-index.json
  mappings/source-to-canonical.json
  sources/source-index.json & sources/source-goal-references.json
  runtime/{catalog,dependency-closure,migration-aliases}.json
  assessment-sources/...
metadata/
  quality/release-quality-evidence.json
  {semantic-content-index,field-coverage,build-inputs,release-model-conformance}.json
```

- **Dependency-Closure und Digests:** `dependency-closure.json` umfasst `2.429` Runtime-Definitionen und `20.523` harte Referenzen ohne externe Abhängigkeiten (`sha256:5d542bfb46658aca0f570fa21d4771008d3238ab4aa87e5a551d55ed9efc3bc6`; Definitionsindex `sha256:1af9cf9fecdcdfec27372c1fc57a700634efb998755070ffd84dff0d1cff0680`). `migration-aliases.json` nutzt für das Erstrelease eine `initial`-Baseline. `semantic-content-index.json` bündelt `111` logische Artefakte und `715` Bildrecords pfadneutral in `contentDigest` `sha256:9d3c0e03f95c06161abd0944335807704ffef1fcf20433f52d83167015637c64` (während der historische Freeze `.3` aus `DPK-007a`/`008` unverändert erhalten bleibt). Ist ein Voraussetzungs-Reduktionsregister deklariert, prüfen Compiler und Validator unabhängig den Node-Beweis (`.nvmrc`) vor dem Fingerprint-Abgleich.
- **Vier Publikationsrollen (`runtimeRequired: false`):** `mapping` (`source-to-canonical-mappings`: `10.021` Entscheidungen $\to$ `33.234` exakte/partielle Kanten ohne unsichere `missing => exact`-Annahme), `source-index` (`official-source-index`: `31` Sammlungen, `55` Dokumente — `52` Core-`Lehrplan` + `3` `OfficialSourceDocument` — in `16` Ländern), `source-goal-reference-index` (`9.977` geprüfte Quellziele als Core `Curriculares Element` mit `CE-Verweis`; C0-Steuerzeichen und ungepaarte UTF-16-Surrogate scheitern fail-closed) und `quality-evidence` (`release-quality-evidence`: `2.335` Entscheidungen aus je `780` Atomizitäts-/Memory-Zielen, `64` aktiven Karten und `711` aktiven Bildern; `publicationStatus: not-ready`).

### Prüfkommandos und gehosteter PDF-Modus {#sec:qal-release-commands}

Kompilierung, unabhängige 49-Fälle-Validierung, Fixture-Tests (9 positiv, 22 negativ, ohne Remote-Schemaabruf) und der verpflichtende JSON-Konformitätswrapper (ohne 1,7-GB-ZIP):

```bash
PROFILE=contracts/curriculum-package/v1/profiles
PROFILE="$PROFILE/de-gymnasium-mathematik-release-model-v1.profile.json"
python3 -B scripts/compile_curriculum_release_model.py \
  --profile "$PROFILE" \
  --output tmp/curriculum-release-model/mathematik-a
python3 -B scripts/validate_curriculum_release_model.py \
  --profile "$PROFILE" \
  --release-root tmp/curriculum-release-model/mathematik-a
python3 -B scripts/validate_curriculum_release_model_fixtures.py
python3 -B scripts/compile_curriculum_release_model.py \
  --self-test-dependency-emission
bash scripts/run_curriculum_release_model_conformance.sh
```

Lokal müssen referenzierte Quell-PDFs reguläre Dateien (keine Symlinks) sein und werden bytegenau gehasht. Da gehostete GitHub-Checkouts die per Git ignorierten amtlichen PDFs nicht enthalten, setzen die Workflows explizit `SKILLPILOT_SOURCE_PDF_MODE=committed-bindings`: Nur tatsächlich fehlende PDFs dürfen auf Bytezahl und SHA-256 des eingecheckten Source-Verification-Ledgers zurückfallen, während vorhandene, geänderte oder per Symlink verlinkte Dateien weiterhin strikt geprüft werden.
