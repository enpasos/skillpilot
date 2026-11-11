## Curriculum-Paketbereitschaft (`full-standalone-v1`) {#sec:qal-package-readiness}

Dieses Gate beantwortet eine strengere Frage als der klassische Fachexport: Darf ein Artefakt ehrlich das eigenständige Laufzeitprofil `full-standalone-v1` beanspruchen? Reproduzierbare Fachexport-ZIPs bleiben nützliche Übergabe- und Roundtrip-Artefakte, beweisen aber keinen autarken Betrieb aus dem ZIP allein und erhalten daher explizit `not-ready-legacy` (`standaloneProfileReady: false`).

### Statusvokabular und Exit-Codes {#sec:qal-readiness-vocabulary}

Die Richtlinie ist in `contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json` festgelegt; Berichte folgen `contracts/curriculum-package/v1/package-readiness-report.schema.json` (Evaluator `1.3.0` validiert seine eigene Ausgabe gegen dieses Schema):

:::table{cols="3.6cm,1.4cm,X"}
| Status / Bedingung | Exit | Semantik |
| --- | --- | --- |
| `ready` (oder exakter `--expect-status` / Selbsttest) | `0` | Alle blockierenden Prüfungen der versionierten Policy bestanden (für den Mathematik-Kandidaten verhindern offene Publikations-/Human-Gates diesen Status noch). |
| CLI-Aufruffehler | `2` | Ungültige Argumente oder fehlende Pflichtoptionen. |
| `invalid` | `10` | Eingabesicherheit, Zielidentität oder Vertragsbindung verletzt (ein unvollständiger Zielanspruch wird niemals zu Legacy herabgestuft). |
| `not-ready-incomplete` / `not-ready-legacy` | `20` | Zielvertrag konsistent deklariert, aber Vollständigkeits-, Publikations-/Redistributions- oder Consumer-Gates offen (`not-ready-incomplete`), bzw. reines Legacy-Fachexport-Artefakt (`not-ready-legacy`) ohne passenden `--expect-status`. |
| `unsupported` | `30` | Intern konsistenter Zielanspruch für eine von diesem Evaluator nicht unterstützte Vertrags-/Kompatibilitätsversion. |
| `--expect-status`-Abweichung | `40` | Ermittelter Status weicht vom explizit erwarteten Zielstatus ab. |
| Interner / Vertragsfehler | `70` | Interner Evaluatorfehler oder beschädigte Vertrauensverträge. |
:::

### Konformitätssuiten, Bau und hermetischer Paket-Consumer {#sec:qal-readiness-commands}

Ausführung der Selbsttests und Vertragsprüfungen vom Repository-Root:

```bash
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test
python3 -B scripts/run_package_consumer_smoke.py --self-test
python3 -B scripts/validate_fwu_owl_curriculum_package.py --self-test
python3 -B scripts/reconstruct_json_curriculum_package_from_fwu_owl.py --self-test
python3 -B scripts/run_fwu_owl_reverse_compiler_hermetic.py --self-test
python3 -B scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py \
  --self-test
python3 -B scripts/generate_curriculum_package_redistribution_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --check
```

Bau (`app/scripts/buildFullStandaloneCurriculumPackage.ts`), unabhängige ZIP-Validierung (`scripts/validate_full_standalone_curriculum_package.py`) und Readiness-Auswertung eines im Store provisionierten Staging-Kandidaten (bzw. komplett über `scripts/run_curriculum_full_package_conformance.sh`):

```bash
npm --prefix app run export:full-standalone-package -- \
  --release-root tmp/curriculum-release-model/mathematik-a \
  --output-dir tmp/curriculum-release-model/full-standalone-package \
  --zip --expect-entry-count 897 --expect-manifest-file-count 895 \
  --expect-binary-asset-count 715 \
  --expect-content-digest \
  sha256:9d3c0e03f95c06161abd0944335807704ffef1fcf20433f52d83167015637c64

PKG_DIR=tmp/curriculum-release-model/full-standalone-package
ZIP_NAME=skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip
python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip "$PKG_DIR/$ZIP_NAME" \
  --consumer-smoke-store tmp/curriculum-release-model/provisioned-store \
  --consumer-smoke-work-dir tmp/curriculum-release-model/package-consumer-smoke \
  --consumer-smoke-report "$PKG_DIR/package-consumer-smoke-report.json" \
  --report "$PKG_DIR/readiness-report.json" \
  --expect-status not-ready-incomplete
```

Der Evaluator ruft sowohl den unabhängigen Vollpaket-Validator v2 als auch den gepinnten Consumer-Runner (`contracts/curriculum-package/v1/package-consumer-smoke-report.schema.json`) selbst auf; ohne `--consumer-smoke-store` gilt ein externer Bericht lediglich als `external-unattested`. Der Consumer baut ein reines Runtime-Katalog-Frontend (`publicDir: false`) und ein schlankes Backend ohne eingebettete Curriculum-UUIDs oder statische Fachdaten und führt diese unter `bubblewrap --clearenv` bei ausgeblendetem Checkout, Loopback-Netzwerk, schreibgeschütztem Store, per `O_NOFOLLOW` gebundenem JDK/Python/Node/`strace` und realem Playwright-1.59.1-/Chromium-Lauf aus (inkl. 5 Poison-Sentinels, 15 geordneten Funktionschecks und Fail-Closed-UI-Marker bei Catalog-404 ohne Fallback).

### Offline-Vertrauensmodell, Review-Trennung und Umsetzungsstand (`DPK-004a`–`DPK-008d`) {#sec:qal-readiness-boundary}

- **Offline-Auflösung und harte JSON-Grenzen:** Der paketlokale Schema-Katalog ist eine reine Hash-Auflösungstabelle unter der unterstützten Vertragsversion des Consumers (kein Remote-Abruf; max. `64 MiB` pro JSON-Eintrag, Verschachtelungstiefe `128`, max. `5.000.000` geparste Knoten). Auch der Runtime-Katalog löst Wurzeln, Scopes und Ansichten ausschließlich explizit auf.
- **Strukturelle Gültigkeit vs. Publikationsrecht:** Dateien mit `redistributionStatus: review-required` tragen zwingend `licenseExpression: null`; damit schlägt `publication.redistribution-cleared` fehl (`not-ready-incomplete`). `allowed` verlangt eine auf ein inventarisiertes Lizenzdokument aufgelöste Lizenzexpression (siehe @ref{sec:qal-human-review-gates} für die 715 Mathematik-Bilder, die 3 offenen Nicht-Binärklassen und die 479 offenen Quelltext-Entscheidungen).
- **Erreichte technische Meilensteine:** `DPK-004a`/`004b` und `DPK-005a`/`005b` etablieren Release-Modell, 22 gepinnte Payload-Schemata und deterministisches Streaming-ZIP32; `DPK-006a`–`006c` sichern den inhaltsadressierten Store samt CAS-Lock ohne Fallback; `DPK-007` beweist den 1,7-GB-Consumer-Pfad (15 Checks, 213 Frontier-Ziele). Der historische Freeze `DPK-007a` (`skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip`, `914` Einträge, `757` Bilder, `1.738.161.217` Byte, SHA-256 `403cc0bc6004da549c8b9ed9fafad222fe0ddda1107806fe087cfa871a6dbcf9`, `contentDigest` `sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101`), der unabhängige 2,36-GB-FWU-OWL-Träger `DPK-008c` (`819` Einträge, `824.452` Tripel, SHA-256 `abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94`, Placement-Schlüssel `goalId@unitId@index`) und die isolierte Rückübersetzung `DPK-008d` (`1.737.571.471` Byte, SHA-256 `7dcd233dd495900f6d6bd971ff6e86bdcdcfe5701f3522ed480be8336de23195`, 111/111 Normalform-Oracles, 20-teiliges Rawtrace-Evidenzinventar) bleiben unveränderliche historische Nachweise, ohne ein einziges menschliches Freigabegate vorwegzunehmen.
