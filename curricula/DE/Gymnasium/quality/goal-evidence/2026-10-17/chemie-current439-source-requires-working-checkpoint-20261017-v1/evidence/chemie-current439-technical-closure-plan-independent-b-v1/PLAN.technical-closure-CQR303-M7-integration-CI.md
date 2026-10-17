# Technischer Abschlussplan: Chemie 439 → Integration und GitHub CI

Stand: 17.10.2026. **Offener Integrationsblocker: Stable-ID-/Mappingintegrität des entfallenen Main-Ziels 413c5ee5-7826-549f-ad76-63743c59b188 ist noch nicht belegt. Kein Mainapply oder endgültiger M7-Abschluss, bis der zuständige technische Herkunftsaudit diesen Fall geklärt hat.** Rein lesende Prüfung; kein Fachreview, Gate, Compiler, PDF-Build, Main-Edit oder Cleanup durch diesen Agenten.

## 1. Tatsächlich belegter Ausgangsstand

| Ebene | Aktueller Nachweis | Bedeutung |
|---|---|---|
| Aktuelle Kapsel K | 439/439 streng vollständig; D/P/A/M/V jeweils 439; sechs erforderliche Checks PASS; Blocker 0; `strictCompletionReady=true` | Vollständiger aktueller maschineller Fachnachweis in der Kapsel |
| Eingabeintegrität | 592 geschützte Eingaben, keine geändert | Aktueller erfolgreicher Lauf hat die gebundenen Eingaben unverändert gelesen |
| Laufart | Report-Modus, Exit 0; erforderliche sechs Checks tatsächlich PASS | Kein erfundener `--mode=check`-Lauf |
| Main | Chemie M6, CQR-303 231/402; generierter Status vom 12.10.2026 | Kapselergebnis noch nicht im integrierten Main-Status |
| Geschützte M7-Floors in Main | Mathematik 807/807, Physik 478/478, Biologie 397/397; jeweils sechs Checks PASS, Blocker 0 | Diese Zielmengen und M6/M7-Nachweise bleiben geschützt |

Der frühere Lauf mit falschem Child-Root ist nicht der aktuelle Nachweis. Der erfolgreiche geerbte-Flags-Lauf ist beendet; Handle 10912 wird weder gepollt noch neu gestartet.

Primärbelege:

- `J/central-current439-D113-P439V3-inherited-child-root-v2/central.stock.stdout.json`: SHA256 `2c1a05fd2994708e4cf40d043aca6240f95dfb0ee0d46121f3fdfeb73dd83482`.
- Zugehöriger `RESULT.actual-current439-D113-P439V3.json`: SHA256 `95461b3517bf989cae1f31cb137cfa58081ca707e712b58bd1423c04b0b31391`.
- Prospektive D113/P439V3-Konfiguration: SHA256 `ab71b7955ddfedca35dba08afcb9b3e6f05e911d8a8d33904d158b94adb9bf6c`.
- Aktuelle kanonische Chemie: `c436b994-8f44-5134-b9f8-0c9f5d6a5ba0`, 650 Goals, Dateihash `38c437d5fa0e24f8587b26cbdb2e3f168f3ffaf915aaaef885f918ac22c668e0`.
- Aktuelles D4-Index-Soll laut angewandter Root-Integration: `5b09184cbc0a6a2f93c5ab8d4d8d0b05a38e6b23f140dbf8bd4ecb93534508db`.

Die exakten 439 IDs stehen in `EXPECTED.current439.curricularAtomic.goalIds.sorted.txt`. SHA256 über aufsteigend sortierte IDs, je eine Zeile mit abschließendem LF: `7cf8fa38180f7ca34a57ed09a3ad31bbd42690200cebc234ee471cf6b573abd7`. Beide Mengen `currentGoalIds` und `strictCompleteGoalIds` im aktuellen Bericht sind exakt gleich. Ein bloßer Zähler 439 ersetzt diesen Mengenvergleich nicht. Diese Datei dokumentiert den derzeit geprüften Kapselscope; sie erklärt ausgelassene Main-IDs nicht für entbehrlich. Eine begründete Scope-Reparatur darf den Nenner verändern und benötigt danach den passenden aktuellen technischen Nachweis statt einer erzwungenen Zahl439.

Semantik des vollständigen 650er-Bestands: 439 `curricularAtomic`, 89 `curricularArea`, 67 `memory`, 51 `practiceAssessment`, 3 `programStructure`, 1 `orientation`. Der M7-Nenner ist 439.

## 2. Abschlussmatrix

| Bereich | Belegt | Nächster konkreter Schritt | Abnahmegrenze / noch fehlender Beleg |
|---|---|---|---|
| D/P/A/M/V | Kapsel 439/439, 113 D-Indizes, 360 Nachfolgerkanten, 123 P-Konfigurationen, 76 A-Konfigurationen | Portabilitätsagent übernimmt den exakt geprüften technischen Abschluss samt ursprünglichen Fachbelegen | Keine neue Fachbewertung. Science, IDs, Texte, Bilder, Profilkörper und Originalurteile bleiben erhalten; technische Nachfolger binden geänderte Pfade korrekt |
| Zentralregister | Main hat für Chemie noch 59 D-Indizes | Nur den Chemie-Eintrag in `curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json` auf die portable D113/P439V3-Lane umstellen | Mathematik-, Physik-, Bio- und Wirtschaftseinträge exakt erhalten; die Chemie-only-Kapselkonfiguration ersetzt nicht das gesamte Fünf-Fächer-Register |
| CQR-303 / M7 | Kapsel vollständig, Main weiterhin M6 | Nach Integration normalen zentralen Check und QA-Status aus den aktiven Konfigurationen erzeugen | Chemie CQR-303 PASS, 439/439, fünf Gates 439, sechs Checks PASS, keine Blocker/Deferrals; M6 und alle unteren CQR-Regeln weiterhin PASS |
| M6, Karten, Sichtbarkeit | Aktuell 439 Goal-Reviews: 66 `memory_required`, 373 `no_memory_needed`; 80/80 Kartenreviewzeilen `kept`; 39 Visibility-Scopes; Memory-Check PASS | Aktive Memory-Konfiguration auf diese exakten Dateien und Scopes umstellen; benötigte Deckquellen/Deploy-Ziele mitnehmen; Bericht generieren | `necessary:true`, gültige `originGoalIds`, aktuelle Fingerprints, keine aktiven Remove-Karten, alle erforderlichen Memory-Knoten in demselben sichtbaren View; keine neue Kartendefinition oder zusätzliche Quote |
| M-Bericht | Konfigurierter `reports/M439.stock-report.md` aktuell nicht vorhanden | Über die aktive M439-Konfiguration generieren lassen, bevor QA-Status/CI-Diff finalisiert werden | Neuer generierter Bericht gehört zur portablen aktiven Konfiguration; alten 402/75-Karten-Bericht nicht als aktuellen 439/80-Nachweis verwenden |
| Stable IDs / Source-Mapping | Mechanisch fehlt genau ein Main-Goal in K: `413c5ee5-7826-549f-ad76-63743c59b188` „Korrosionsschutz bei Werkstoffen“; Root meldet weiterhin HE-Quellmapping `308f9f22… → 413c5ee5… exact` ohne Ziel/Alias | Zuständiger Techagent klärt die tatsächliche Chronologie/Quellen- und Mergebelege | **OFFEN/BLOCKIERT** bis belegter gültiger Merge/Retirement oder gezielte Reparatur mit gültigen betroffenen Nachweisen vorliegt. Der aktuelle 439/439-Zentralbericht beweist ausschließlich Vollständigkeit seines aktuellen Ledgers |
| Layer A | C650/SEM650 und Quellen-/View-Kontext im aktuellen Fachnachweis | Kanonisches JSON, semantische Ledgers, Mappings, Kompositionsansichten, Ressourcen und Karten als geschlossene portable Eingabemenge integrieren | DAG, stabile UUIDs, keine verlorenen Ziele, korrekte Target-/Prerequisite-Rollen, unveränderte Fach-/Stage-/Kursgrenzen; JSON-Schema und Quellen-/Mappingprüfungen PASS |
| Bildherkunft / V | Vier tatsächliche Bildkorrekturen sind im aktuellen QA-Ledger assetgenau KI-geprüft | PNGs, zugehörige Prompts/Provenienzdateien, kanonische Links und QA gemeinsam übernehmen; Runtime-Copies aus Quellen erzeugen | `assetSha256 == aiApprovedAssetSha256`; keine erfundene menschliche Freigabe, keine verlorenen historischen Befunde; Quelle und Runtime stimmen bytegenau |
| Source-/Sichtbarkeitsgrenzen | Aktueller autorisierter Zielumfang umfasst alle verfassten Themen | Bestehende Quellen-/Applicability- und View-Konfigurationen erhalten und prüfen | Insbesondere SH-Medikamententhema im erweiterten Ziel behalten und amtliche Optionalität erhalten; kein erfundener gespeicherter Themenentscheid oder neuer Selector |
| Lernzielbuch | Aktive Chemie-Buch-ID `de-gym-chemie-bundesweit`; Konfiguration noch Main-Stand, `publicationMode:review` | Semantic-Ledger/Atlas/Views und gegebenenfalls vollständige P439-Evidence-Datei auf die portablen aktuellen Quellen binden; dann Build in Root/CI | Genau die 439 curricularAtomic-Target-IDs, je einmal auf einer vollständigen Zielseite, vollständige IDs, keine Memory-/Orientation-/Assessment-Ziele in dieser Edition; Reihenfolge/Links/Overflow geprüft |
| Publikationsartefakte | Noch kein neuer vollständiger 439er-Publikationsbeleg aus dem integrierten Checkout | Bestehenden Fünf-Bücher-Registry-Build einmal aus aktuellem Checkout ausführen und sein Artefakt in CI teilen | Neue BookModel-/PDF-/Manifest-/Sourceindex-Hashes und Publikationsindex erforderlich. Vierer-/14er-Batch-Digests nicht als vollständiges 439er-Buch ausgeben; generierte `app/public/lernzielbuch/`-Dateien nicht committen |
| GitHub CI | Noch kein finaler integrierter Commit-/Run-Beleg | Autorisierte Integration committen/pushen und normale CI am exakten finalen SHA abschließen | Erfolgreiche Checks am finalen HEAD, nicht am vorherigen Main; neue Artefakte und Workflow-Run-IDs aufzeichnen; lokaler Erfolg ist kein Deployment-/Stable-Publikationsbeleg |

## 3. Stable-ID-Integrität, aktive A/M-Selektoren und Portabilität

### Offener Stable-ID-Befund

`OPEN.stable-ID-set-main-to-K-integrity.json` enthält den tatsächlichen Read-only-Vergleich: Main523 Goals, K650 Goals,128 hinzugefügte IDs und genau eine fehlende Main-ID413c5ee5-7826-549f-ad76-63743c59b188. Damit ist keine fachliche Löschung oder Zusammenlegung begründet. Root/Tech bearbeiten den Quell- und Chronologiebeleg; dieser Plan erzeugt weder Merge-Alias noch Ersatzurteil. Alle Abschlusszeilen bleiben von dieser Klärung abhängig.

### Tatsächliche normale Generatorpfade

- Der Memory-Prehook verwendet `runMemoryCardReviewConfigs.ts:74–76` und `memoryCardReviewConfigDiscovery.ts:139–190`. Nach dem korrekten globalen Registrywechsel wird **automatisch** die aktive M439-Konfiguration gewählt und ihr fehlender Report erzeugt. Der ältere Default-M-Pfad ist dann kein Routingblocker.
- Die vom Discovery-Code bewachten Identitäts-,Scope- und Sichtbarkeitsfelder sind zwischen K-Default-M und tatsächlichem M439 bereits exakt gleich (Scope506 =439 ordinary+67Memory,39Sichtbarkeitsscopes).
- `prepare_default_M439_selector_root_only.py` liefert den angeforderten optionalen, standardmäßig rein lesenden Angleichungsentwurf. Root kann mit `--apply-root` die exakten aktuellen M439-Configbytes als Default setzen; Records435+4 und Karten80 bleiben bytegenau. Fremde Symlink-/Hardlinkquellen bleiben erhalten. Dies ist für die normale aktive Discovery nicht zusätzlich erforderlich. Der normale QA-Status-Prehook erzeugt den aktuellen Report einmal; keine weitere Reportausführung durch dieses Skript.
- Es existiert **kein** A-report:all-Prehook. `generateCurriculumQualityStatus.ts:3468–3514` lädt die76 aktuellen A-Configs aus dem aktiven Chemie-Registryobjekt; `:3792–3810` lädt dessen M439-Config. Ein nacktes `quality:semantic-atomicity` wählt stattdessen den Mathe-J8-Pilotdefault (`semanticAtomicityReview.ts:47`) und ist kein Chemie-Gesamtcheck. Kein stale A402 wird pauschal überschrieben.
- Primärbeleg mit Codepins: `AUDIT.normal-generator-current-A76-M439-routing.json`.

### Portabilität

AGENTS 7.4 verlangt committable Kopien oder relative Links zu committable Zielen. Absolute `/mnt/e/...`-/`/home/...`-Links, Scratch- oder ignorierte Targets dürfen die integrierte Evidenzkette nicht tragen. `scripts/validate_schemas.py:curriculum_symlink_errors` prüft Git-getrackte und nicht ignorierte neue Curriculum-Dateien auf absolute, aus dem Repo führende, kaputte und nicht committable Links.

Der separate Portabilitätsagent liefert deshalb eine Pfad-/Kopierliste mit Vorher-/Nachherpins und einem tatsächlichen Stock-Nachweis auf dem portablen Paket. Die Originalbytes und früheren Hashes bleiben als Historie erhalten. Pfad-/Containeränderungen werden technisch mit nachvollziehbaren Nachfolgern gebunden; wissenschaftliche Urteile werden nicht neu erfunden oder rückwirkend umgeschrieben.

**K-Ausführung durch Root:** `K/app` ist ein Symlink zu F. Ein npm-Prefix oder cwd `K/app` kann Shell-relative Skripte im falschen Baum starten. Root verwendet deshalb absolute `K/app/scripts/...`-Argumente, cwd K und vererbtes `NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main'` für die bereits geplante einzelne M-Reporterzeugung und den normalen globalen QA-Status-/Floorlauf. Dieser Agent startet keinen dieser Läufe. Die untenstehenden npm-Befehle gelten für den späteren regulären integrierten Checkout mit normalen Repositorypfaden.

Der globale K-Status-/Floorlauf ist bei Fertigstellung dieses Plans von Root vorbereitet; dessen Ergebnis wird erst nach tatsächlicher Fertigstellung als zusätzlicher Nachweis übernommen. Der aktuelle 439er-Zentralreport ist bereits abgeschlossen und wird nicht neu gestartet.

Die `--preserve-symlinks --preserve-symlinks-main`-Flags erklären den erfolgreichen **Kapsel**-Lauf. Sie sind kein Ersatz für portable Eingaben im frischen GitHub-Checkout. Der normale integrierte Repository-Root muss ohne E-/F-/K-Dateisystem erreichbar sein. Keine Cleanup-Mutation ist Bestandteil dieses Plans.

Nach dem Portieren aus dem Repository-Root, jeweils als eigener Prüfschritt:

```bash
python -B scripts/test_validate_schemas_symlinks.py -v
python scripts/validate_schemas.py
python scripts/validate_goal_ids_uuid.py
npm --prefix app run validate:graph
npm --prefix app run validate:composition-views
npm --prefix app run test:composition-projection-roles
npm --prefix app run test:course-level-mapping-consistency
npm --prefix app run check:source-landscape-registry
npm --prefix app run quality:source-coverage-audit:check
```

## 4. Erforderliche Prüfungen nach Integration

Diese Befehle sind der Root-/CI-Plan; sie wurden hier nicht gestartet. Gültige Fachreviews werden dabei wiederverwendet und technisch validiert.

### Aktive Fach-QA und geschützte Floors

```bash
npm --prefix app run quality:deep-understanding-rollout:check
npm --prefix app run quality:memory-card-review:check:all
npm --prefix app run test:deep-understanding-rollout
npm --prefix app run quality:curriculum-status
npm --prefix app run check:curriculum-maturity-floors
git diff --check
```

`quality:curriculum-status` hat den vorhandenen npm-Prehook `quality:memory-card-review:report:all`. Die aktiven M439-Config-/Reportpfade müssen vorher stimmen. Generierte QA-Berichte werden mitcommitttet; CI regeneriert und verlangt für `docs/qa-ci/status` anschließend keinen Diff und keine neuen ungetrackten Dateien. Nicht als zweite Wahrheit von Hand bearbeiten.

Geschützte Identitäten:

| Fach | Landscape-ID | Soll |
|---|---|---:|
| Mathematik | `68a8ac50-f5f5-4e24-8aa9-5e408ca01ced` | 807/807, M7 |
| Physik | `7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a` | 478/478, M7 |
| Biologie | `08a43a1b-d97e-522c-9dfa-c950a493364e` | 397/397, M7 |
| Chemie | `c436b994-8f44-5134-b9f8-0c9f5d6a5ba0` | neue exakte 439/439-Menge; derzeit geschützter Main-Floor M6 |

Die aktuelle Policy hat **zehn** geschützte Curricula und keine aktive Ausnahme; auch Wirtschaft M7 und alle weiteren M6-Floors bleiben verpflichtend. Keine Policy-Absenkung. Eine spätere Erhöhung des Chemie-Floors auf M7 kann den tatsächlich integrierten Abschluss schützen; sie ersetzt keinen Abschlussnachweis.

### Bilder und Runtime

```bash
npm --prefix app run prepare:runtime-assets
npm --prefix app run check:goal-visualization-assets
npm --prefix app run check:goal-visualization-qa -- --subjects=mathematik,physik,chemie
npm --prefix app run check:goal-visualization-approval-coverage
npm --prefix app run check:goal-visualization-rollout-coverage:chemie
npm --prefix app run check:goal-visualization-qa-coverage-parity
```

Quellen liegen unter `curricula/DE/Gymnasium/visualizations/`, Runtime unter den vom Deploy-/Assetchecker definierten Zielen. Der Checker verlangt u.a. kanonische Bilddatei und `prompt.de.md`, sichere Pfade und konsistente Assetcopies. Vier aktuelle Korrektur-IDs:

- `28c90c6a-3020-5c51-ac40-d802f3f12d2d`: `61cad5b05c73c2b318024c6f37a338a230decb7354753497ee682ca08e875f10`.
- `7dc80ee2-64e3-50c1-8aaa-0fef0ed0919d`: `905152e433b6e142d88976ffc657bf9232f9bed9e5c2acfa2c07494c5aec5fac`.
- `e20d205f-03a4-5f96-b456-9b20460605a2`: `4f28a7e3a54533825bd8476f32d4ce17978d81c445eb907cee68af6a89fdd813`.
- `c0f1bf09-5a70-5006-b1e9-e91f786a63bf`: `65cdc6d849de53b37ee2c47909455f876844c4f48fc425c70a15194e40790e7c`.

Alle vier haben aktuell `aiApproved:yes`, den passenden Assethash und `humanApproved:no`. Das bleibt wahrheitsgemäß. Gate V/M7 und das gesonderte Bild-Release-Gate werden entsprechend dem geltenden Konzept getrennt ausgewertet.

### Buch- und normale CI-Pipeline

```bash
npm --prefix app run build:goal-books -- --force
npm --prefix app run check:goal-book-publication
npm --prefix app run test:goal-book-pipeline
npm --prefix app run test:goal-book-ui
```

`test:goal-book-pipeline` hat einen vorhandenen Prehook mit Buchbuild. CI stellt das gleiche bereits geprüfte Buchartefakt bereit; ein inhaltsgebundenes Cache-Reuse ist zulässig, fehlende/stale Ausgaben werden nicht übersprungen. Nicht zusätzliche unabhängige PDF-Builds parallel starten. Der tatsächliche aktuelle Registry-Stand umfasst Mathematik, Physik, Chemie, Biologie und Wirtschaft; die ältere Formulierung „vier“ in AGENTS wird nicht als Buildumfang verwendet.

Die vorhandene `.github/workflows/ci.yml` liefert die notwendigen normalen Jobs:

- **Learning-goal book build**: Runtime-Vorbereitung, Build aller Registry-Bücher, Publikationsprüfung, Upload `goal-book-publication-${github.sha}` und kleiner Katalog für Backend.
- **Curriculum CI**: Graph, Views, Routes, Quelle/Mappings, Memory, CQR-303-Regression, generierter Status/Floors, Visualisierungsprüfungen, portable Symlinks/Schemas/UUIDs/Archive und Chemie-Exam-Pipeline.
- **Application frontend CI**: gleiches Buchartefakt, komplette vorhandene `test:goal-book-pipeline`, QA-/Runtime-/Pakettests und `build:application`.
- **Backend CI**: gleicher Buchkatalog und vorhandener vollständiger Backend-Testlauf; konkrete Projektionstests nur bei beobachteten Fehlern ändern.
- **Canonical Chemistry Evidence Watch** läuft bei den betroffenen Chemie-Pfaden zusätzlich über `scripts/run_canonical_chemistry_evidence_watch.sh`.

Die normalen vorhandenen Package-/Layer-A-Vertragstests in CI bleiben erhalten. Ein neuer großer Chemie-Standalone-/Ontologie-Release oder ein zusätzlicher Compilerlauf ist aus diesem M7-Integrationsauftrag nicht abgeleitet. Struktur-/Paketvalidität, CC-BY-4.0 eigener Inhalte, Apache-2.0 der Software, Drittquellenrechte, Review-Publikation und menschliche Stable-/Release-Freigaben behalten ihre getrennten Verträge.

## 5. Noch konkret zu liefernde Abschlussartefakte

1. Portabler Integrationsselector mit tatsächlicher Datei-/Pfadclosure, ursprünglichen Evidenzpins und unveränderten Fachurteilen; keine Abhängigkeit von `/mnt/e` im frischen Checkout.
2. Aktives Main-Zentralregister mit ausschließlich aktualisierter Chemie-Lane und nachgewiesen unveränderten anderen Fach-Lanes.
3. Neuer normaler zentraler Check auf diesem integrierten Stand mit exakt derselben 439er-ID-Menge, sechs PASS-Checks und Blocker 0.
4. Aktuelle aktive M439- und Karten-/Sichtbarkeitsreports; CQR-302 muss 439 und die tatsächlichen 80 Karten/39 Scopes abbilden, soweit der aktiv integrierte Scope unverändert ist.
5. Generierte QA-Statusdateien: Chemie CQR-303 PASS und M7; bestehende unteren CQR-Regeln weiterhin PASS; geschützte Floors bestehen.
6. Tatsächlicher neuer vollständiger Chemie-439-BookModel-/Publikationsbeleg mit Sourceindex, PDF, Render- und Publikationsmanifest, als generiertes CI-Artefakt; Review-Modus bleibt bestehen.
7. Finaler Diff-/Commitbeleg und grüne normale GitHub-Checks für **denselben finalen SHA**. Beispielsweise `gh run list --workflow ci.yml --commit "$FINAL_SHA"` und `gh pr checks <tatsächliche-PR-Nummer> --watch`; tatsächliche IDs erst nach Erstellung einsetzen.

Abschlussmeldung erst nach diesen Integrations-/CI-Nachweisen: maschinelles M7 für den aktuellen Chemie-439-Scope, ohne menschliche Freigabe, Erprobung, Deployment oder öffentliche Stable-Publikation daraus abzuleiten.
