<div data-sp-content-lang="en" markdown>

# QA/CI Documentation

This page is the public entry point for SkillPilot curriculum-quality and validation documentation, reachable on GitHub Pages at `/skillpilot/qa-ci/`.

Use this page by role: start with the bilingual handbooks and durable contracts below, then jump to generated status artifacts or dated M7 rollout checkpoints as needed.

## Start Here (Quality & CI Compendia)

- [Quality Handbook (PDF)](skillpilot-curriculum-quality-handbook.en.pdf)
  Unified single-source compendium covering `M0`–`M7` maturity & human trials, QA scopes & `CQR-*` rules, `GVR-*`/`APV-*`/`CPV-*` validators, semantic atomicity review, and the Curriculum Champion program.
- [CI, Release Contracts & Review Lanes (PDF)](skillpilot-qa-lanes-and-release-contracts.en.pdf)
  Companion Volume IVb covering two-tier CI, the Quality Dashboard and Mapping Workbench, `full-standalone-v1` package readiness, release-model conformance, dual JSON/OWL release contracts, `HR-001`–`HR-006`, and review runbooks.
- [Graph Definition: All Rules and Milestones](graph-definition-rule-milestone-matrix.en.md)
  145 rule groups with 4-level enforcement status, target assignment, actual CI gates, scope boundaries, and open gaps.
- [Curriculum Quality: Maturity Levels, QA Scopes, and CQR Rules](curriculum-quality-maturity-and-routes.en.md)
  Detailed meaning of `M0` to `M7`, QA scopes, routes, terminal autonomy, and `CQR-*` rules.
- [CI Overview](ci.md)
  Local and GitHub Actions validation entry points.
- [Automated OpenAI Dialog Regression (DE)](openai-dialog-regression.md)
  Repeatable API dialogs, isolated fixtures, cost limits, and separate host acceptance.
- [Graph Validation Rules](graph-validation-rules.md)
  Single source of truth for algorithmic skill graph validation in CI.
- [Curriculum Package Readiness](curriculum-package-readiness.md)
  Fail-closed distinction between legacy export validation and the standalone JSON runtime profile.
- [Curriculum Release Model Conformance](curriculum-release-model-conformance.md)
  Real Mathematik compilation into the strict unpacked runtime model, including closure, migration, semantic kinds, digests, resources, QA, and remaining package gates.
- [Dual Curriculum Release Contracts](dual-curriculum-release-contracts.md)
  Field/RDF semantics, canonical content digest, equivalence evidence, and paired release-index gates.
- [Curriculum Quality Dashboard](curriculum-quality-dashboard.md)
  Persisted status layer used by the local Workbench dashboard.
- [Curriculum Mapping Workbench](curriculum-mapping-workbench.md)
  Two-pane audit surface from source snapshots to learner-facing SkillPilot trees.
- [Documentation Guidelines](../dev/documentation-guidelines.md)
  Rules for document roles, generated artifacts, runbooks, and dated pilot records.

## Review Lanes

These pages describe durable manual or semi-automated review processes. Their ledgers or configs are the source of truth; generated status pages are not.

- [Curriculum Package Human Review Gates](curriculum-package-human-review-gates.en.md)
  Central release checklist for visualization quality, redistribution rights, source-text verification, ontology semantics, and stable promotion.
- [Semantic Atomicity Review](semantic-atomicity-review.md)
  Review process for deciding whether technical content leaves are semantically atomic.
- [Requires Review Process](requires-review-process.md)
  Manual QA workflow for prerequisite quality on atomic goals.
- [Atomic Review Process](atomic-review-process.md)
  Older atomic-goal review workflow reference.
- [Relation Checks](relation-checks.md)
  Relation-check scope and CI enforcement profile.
- [MEM SPARQL Consistency Audit](mem-sparql-consistency.md)
  Durable process reference for the non-blocking live MEM/FWU endpoint comparison.
- [MEM SPARQL Consistency Runbook](mem-sparql-consistency-runbook.md)
  Operational checklist for running the audit, reading the queue, and writing ledger decisions.
- [Goal Source Rationales Runbook](goal-source-rationales-runbook.md)
  Operational checklist for generating and reviewing human-readable source rationales.
- [Goal Feedback: Production-to-Codex Intake](goal-feedback-codex-intake.md)
  Default-off production inbox, digest-bound local custody transfer, online deletion, and candidate-only critical triage.

## Curriculum Champion Process

- [Champion Guide](champion-guide.md)
- [Four-level Champion Model](four-level-champion-model.md)
- [Abi 2026 Math Deeplink MVP](abi26-mathe-deeplink-mvp.en.md)

</div>

<div data-sp-content-lang="de" markdown>

# Qualität & CI

Diese Seite ist der zentrale Einstiegspunkt für die Curriculum-Qualitäts- und Validierungsdokumentation von SkillPilot unter `/skillpilot/qa-ci/`.

Nutze diese Übersicht nach Rolle: Starte mit den zweisprachigen Handbüchern und dauerhaften Verträgen unten und springe bei Bedarf zu generierten Statusberichten oder datierten M7-Checkpoints.

## Einstieg (Qualitäts- & CI-Kompendien)

- [Qualitätshandbuch (PDF)](skillpilot-curriculum-quality-handbook.de.pdf)
  Einheitliches Single-Source-Kompendium zu `M0`–`M7`-Reifegraden & menschlicher Erprobung, QA-Scopes & `CQR-*`-Regeln, `GVR-*`/`APV-*`/`CPV-*`-Validatoren, semantischem Atomaritäts-Review und dem Curriculum-Champion-Programm.
- [CI, Release-Verträge & Review-Lanes (PDF)](skillpilot-qa-lanes-and-release-contracts.de.pdf)
  Begleitband IVb zu zweistufiger CI, Qualitäts-Dashboard und Mapping-Workbench, `full-standalone-v1`-Paketreife, Release-Modell-Konformität, dualen JSON/OWL-Release-Verträgen, `HR-001`–`HR-006` und Review-Runbooks.
- [Graph-Definition: alle Regeln und ihre Meilensteine](graph-definition-rule-milestone-matrix.md)
  145 Regelgruppen mit 4-Stufen-Ampel (`HART`/`TEIL`/`OFFEN`/`OPT/DOK`), Soll-Zuordnung, tatsächlichen Gates, Scopegrenzen und offenen Lücken.
- [Curriculum-Qualität: Reifegrade, QA-Scopes und CQR-Regeln](curriculum-quality-maturity-and-routes.md)
  Bedeutung von `M0` bis `M7`, QA-Scopes, Routen, Abschlussautonomie und `CQR-*`-Regeln im Detail.
- [CI-Überblick](ci.de.md)
  Lokale Validierungskommandos und GitHub-Actions-Einstiegspunkte.
- [Automatische OpenAI-Dialogregression](openai-dialog-regression.md)
  Wiederholbare API-Dialoge, isolierte Fixtures, Kostenlimits und getrennte Host-Abnahme.
- [Graph-Validierungsregeln](graph-validation-rules.de.md)
  Zentrale Spezifikation der algorithmischen Skill-Graph-Prüfung in CI.
- [Curriculum-Paketreife](curriculum-package-readiness.de.md)
  Fail-closed-Abgrenzung zwischen Legacy-Exportprüfung und dem eigenständigen JSON-Runtime-Profil.
- [Release-Modell-Konformität](curriculum-release-model-conformance.de.md)
  Reale Mathematik-Kompilierung in das strikte entpackte Laufzeitmodell einschließlich Abschluss, Migration, semantischer Knotenarten, Digests, Ressourcen, QS und Paket-Gates.
- [Duale Curriculum-Release-Verträge](dual-curriculum-release-contracts.de.md)
  Feld-/RDF-Semantik, kanonischer Inhalts-Digest, Äquivalenznachweis und gekoppelte Release-Index-Gates.
- [Curriculum-Qualitäts-Dashboard](curriculum-quality-dashboard.de.md)
  Persistierte Statusschicht für das lokale Workbench-Dashboard.
- [Curriculum-Mapping-Workbench](curriculum-mapping-workbench.de.md)
  Zweispaltige Prüf-Oberfläche von Quell-Snapshots zu lernendensichtbaren SkillPilot-Bäumen.
- [Dokumentationsrichtlinien](../dev/documentation-guidelines.de.md)
  Regeln für Dokumentrollen, generierte Artefakte, Runbooks und datierte Pilotberichte.

## Review-Pfade

Diese Seiten beschreiben dauerhafte manuelle oder teilautomatisierte Prüfprozesse. Maßgeblich sind jeweils ihre Ledger und Konfigurationsdateien – nicht generierte Statusseiten.

- [Menschliche Review-Gates für Curriculum-Pakete](curriculum-package-human-review-gates.md)
  Zentrale Release-Checkliste für Bildqualität, Weitergaberechte, Quelltextprüfung, Ontologiesemantik und Stable-Freigabe.
- [Semantisches Atomaritäts-Review](semantic-atomicity-review.de.md)
  Prüfprozess zur Entscheidung, ob technische Inhaltsblätter semantisch atomar sind.
- [Requires-Review-Prozess](requires-review-process.de.md)
  Manueller QS-Ablauf für Voraussetzungsqualität auf atomaren Lernzielen.
- [Atomaritäts-Review-Prozess (ältere Referenz)](atomic-review-process.de.md)
  Ältere Prozessreferenz für die Prüfung atomarer Lernziele.
- [Relationsprüfungen](relation-checks.de.md)
  Prüfumfang und CI-Durchsetzungsprofil für Relationen.
- [MEM-SPARQL-Konsistenzaudit](mem-sparql-consistency.de.md)
  Dauerhafte Prozessreferenz für den nicht-blockierenden Live-Abgleich mit dem MEM/FWU-Endpunkt.
- [MEM-SPARQL-Konsistenz-Runbook](mem-sparql-consistency-runbook.de.md)
  Operative Checkliste für Audit-Lauf, Queue-Auswertung und Ledger-Entscheidungen.
- [Runbook für Quellenbegründungen](goal-source-rationales-runbook.de.md)
  Operative Checkliste zum Erzeugen und Prüfen menschenlesbarer Quellenbegründungen.
- [Lernziel-Feedback: Übergabe aus Produktion an Codex (EN)](goal-feedback-codex-intake.md)
  Standardmäßig deaktivierte Produktions-Inbox, digestgebundene lokale Übernahme, Online-Löschung und Kandidaten-Triage.

## Curriculum-Champion-Programm

- [Champion-Leitfaden](champion-guide.de.md)
- [Vier-Stufen-Champion-Modell](four-level-champion-model.de.md)
- [Abi 2026 Mathe Deeplink MVP](abi26-mathe-deeplink-mvp.md)

</div>

<div data-sp-content-lang="en" markdown>

## Generated Status

These files are generated snapshots or queues. Do not edit them as source of truth; regenerate them with the command documented in the matching process, runbook, or registry.

- [Generated QA Status Artifact Registry](status/README.md)
- [Current Curriculum Quality Status](status/curriculum-quality-status.md)

</div>

<div data-sp-content-lang="de" markdown>

## Generierte Statusberichte

Diese Dateien sind generierte Snapshots oder Arbeitswarteschlangen. Sie werden nicht manuell editiert, sondern über das im jeweiligen Prozess, Runbook oder Register dokumentierte Kommando neu erzeugt.

- [Verzeichnis generierter QS-Statusberichte](status/README.de.md)
- [Aktueller Curriculum-Qualitätsstatus](status/curriculum-quality-status.de.md)

</div>

- [Curriculum Source Coverage Audit](status/curriculum-source-coverage-audit.md)
- [Mathematik Source Verification](status/source-verification-de-gymnasium-mathematik-v1.md)
- [MEM SPARQL Consistency Audit Status](status/mem-sparql-consistency-audit.md)
- [MEM SPARQL Consistency Review Issues](status/mem-sparql-consistency-review-issues.md)
- [MEM SPARQL Consistency Review Issues JSON](status/mem-sparql-consistency-review-issues.json)
- [Goal Source Rationales PoC](status/goal-source-rationales-poc.md)
- [Goal Source Rationales MEM/FWU Examples](status/goal-source-rationales-mem-examples.md)
- [Goal Source Rationales MEM/FWU Plain Examples](status/goal-source-rationales-mem-examples-plain.md)
- [Goal Source Rationale Coverage](status/goal-source-rationale-coverage.md)
- [Goal Source Rationales Mathematik All-Relevant JSON](status/goal-source-rationales-math-all-relevant.json)
- [Goal Source Rationale Gap Issues](status/goal-source-rationale-gap-issues.md)
- [Goal Source Rationale Mapping Batch 01](status/goal-source-rationale-mapping-batch-01.md)
- [Memory-Card Review Rollout](status/memory-card-review-rollout.md)
- [M0 Remediation Plan](status/m0-remediation-plan.md)
- [Gymnasium Duration Model Readiness](status/gymnasium-duration-model-readiness.md)

<div data-sp-content-lang="en" markdown>

## Memory-Card Review Status

Generated audit views for configured `CQR-302` reviews.

</div>

<div data-sp-content-lang="de" markdown>

## Memory-Card-Review-Status

Generierte Prüfübersichten für konfigurierte `CQR-302`-Reviews.

</div>

- [Biologie Memory-Card Review](status/memory-card-review-canonical-biology-full.md)
- [Chemie Memory-Card Review](status/memory-card-review-canonical-chemistry-full.md)
- [Deutsch Memory-Card Review](status/memory-card-review-canonical-german-full.md)
- [Geschichte Memory-Card Review](status/memory-card-review-canonical-history-full.md)
- [Informatik Memory-Card Review](status/memory-card-review-canonical-informatics-full.md)
- [Latein Memory-Card Review](status/memory-card-review-canonical-latin-full.md)
- [Mathematik Memory-Card Review](status/memory-card-review-canonical-math-full.md)
- [Physik Memory-Card Review](status/memory-card-review-canonical-physics-full.md)
- [Politik und Wirtschaft Memory-Card Review](status/memory-card-review-canonical-politics-economics-full.md)
- [Wirtschaftswissenschaften Memory-Card Review](status/memory-card-review-canonical-economics-full.md)

<div data-sp-content-lang="en" markdown>

## Dated Subject M7 Checkpoints (Mathematik, Wirtschaft, Chemie, Biologie)

Dated engineering checkpoints from subject-level `M6`/`M7` closeout runs (maintained in their original authoring language).

</div>

<div data-sp-content-lang="de" markdown>

## Datierte Fach-M7-Arbeitsstände (Mathematik, Wirtschaft, Chemie, Biologie)

Datierte Zwischenstände und Abschlussberichte aus der fachweisen `M6`/`M7`-Qualitätssicherung.

</div>

- [Mathematik M7: Fortsetzungs- und Zwischenstand vom 20. September](math-m7-resumed-2026-09-20.md)
- [Mathematik M7: Fortsetzung und Pausen-Checkpoint vom 23. September](math-m7-resumed-2026-09-21.md)
- [Mathematik M7: Abschlusskonzept und Übergabe vom 28. September](math-m7-concept-and-handoff-2026-09-28.md)
- [Mathematik M7: commitfähiger Pausen-Checkpoint vom 28. September](math-m7-commit-checkpoint-2026-09-28.md)
- [Mathematik M7: Integrationscheckpoint vom 28. September](math-m7-commit-checkpoint-2026-09-28-v2.md)
- [Mathematik M7: Integrationscheckpoint vom 29. September](math-m7-commit-checkpoint-2026-09-29.md)
- [Mathematik: 100 % im maschinellen Fünf-Gate-Bericht](math-m7-machine-closeout-2026-09-29.md)
- [Maschineller M7-Abschluss Wirtschaftswissenschaften: 346/346 und CQR-303 PASS vom 11. Oktober](wirtschaft-m7-machine-closeout-2026-10-11.md)
- [Aktuelle qualifizierte Kontextintegration Wirtschaft bei 291/346 vom 11. Oktober](wirtschaft-m7-current291-qualified-contexts-2026-10-11.md)
- [M6 mit grüner GitHub-CI und aktuelle M7-Fortsetzung Wirtschaft bei 225/346 vom 11. Oktober](wirtschaft-m7-current225-m6-ci-green-2026-10-11.md)
- [Aktueller M6-Zwischenstand Wirtschaft und CI vom 10. Oktober](wirtschaft-m6-ci-checkpoint-2026-10-10.md)
- [Fortsetzung und aktuelle Paketnachweise Wirtschaft vom 8. Oktober](wirtschaft-m7-resumed-2026-10-08.md)
- [Integrations- und regulärer Lernzielbuchcheckpoint Wirtschaft vom 8. Oktober](wirtschaft-m7-commit-checkpoint-2026-10-08.md)
- [Chemie: lokaler 455/455-Abschluss, maschinelles M7 und offene Quellenfragen (19.10.2026)](chemie-current455-integration-progress-2026-10-19.md)
- [Chemie: aktueller 454er-Arbeitsstand, gezielte Prüfungen und offene Quellen-/Beschreibungsfälle (18.10.2026)](chemie-current454-integration-progress-2026-10-18.md)
- [Chemie: Lernwegabschluss nach bestandenem CI-Zwischenstand vom 18. Oktober](chemie-current450-route-completion-resumption-2026-10-18.md)
- [Chemie: stabiler CI-Zwischenstand und inaktiv gesicherter 450er-Arbeitsstand (18.10.2026)](chemie-current450-inactive-ci-checkpoint-2026-10-18.md)
- [Chemie: historischer 450er-Integrationsbericht vor der Inaktivierung (18.10.2026)](chemie-current450-final-integration-progress-2026-10-18.md)
- [Chemie: historischer 447er-Integrationsbericht (18.10.2026)](chemie-current447-final-integration-progress-2026-10-18.md)
- [Chemie: sichtbarer Quellen- und Vorbedingungscheckpoint mit 439 fachlichen Zielen (17.10.2026)](chemie-current439-source-requires-checkpoint-2026-10-17.md)
- [Chemie: inaktiver Arbeitsstand mit 439 fachlichen Zielen und zwei neuen Beschreibungsabschlüssen (16.10.2026)](chemie-current439-reviewed-working-checkpoint-2026-10-16.md)
- [Chemie: Themenumfang, sechs aktuelle Seitenbindungen und offene Geltungsintegration (16.10.2026)](chemie-current437-source-scope-integration-checkpoint-2026-10-16.md)
- [Chemie: geprüfter inaktiver Arbeitsstand mit 438 fachlichen Zielen (16.10.2026)](chemie-current438-reviewed-working-checkpoint-2026-10-16.md)
- [Chemie nach dem 418er-Messstand: sechs geprüfte Kinderbilder, Quellen- und Memory-Integration (16.10.2026)](chemie-current418-next-package-progress-2026-10-16.md)
- [Chemie 418/429: 15 weitere Abschlüsse, zwei korrigierte Bildseiten und elf offene Ziele (16.10.2026)](chemie-native15-current429-progress-2026-10-16.md)
- [Chemie 403/429: sechs Beschreibungsabschlüsse, P-/A-Folger und offene Befunde vom 16. Oktober](chemie-native11-current429-progress-2026-10-16.md)
- [Chemie: 399/429, 15 fachliche Erstabschlüsse und getrennte offene Bindungen (16.10.2026)](chemie-native19-current429-checkpoint-2026-10-16.md)
- [Chemie: 392/426, sechs neue Abschlüsse und acht aktuelle Reviewpaare (16.10.2026)](chemie-native8-current426-checkpoint-2026-10-16.md)
- [Chemie: 386/426, 15 neue Praktikumsabschlüsse und 40 offene Ziele (15.10.2026)](chemie-bcp-current426-checkpoint-2026-10-15.md)
- [Vorherige Chemie-Fortsetzung: 371/422, vier neue Gleichgewichtsabschlüsse und getrennte Praktikumsarbeit (15.10.2026)](chemie-source4-current371-checkpoint-2026-10-15.md)
- [Chemie: 367/422, sechs neue fachliche Abschlüsse und drei wiederhergestellte Bindungen (15.10.2026)](chemie-native9-current367-continuation-2026-10-15.md)
- [Chemie: 20 neue Carbonyl-/Gleichgewichtsabschlüsse im Kandidaten 358/422 (15.10.2026)](chemie-carbonyl-equilibrium-current358-checkpoint-2026-10-15.md)
- [Chemie: 17 neue Energieabschlüsse im Kandidaten 338/422 (15.10.2026)](chemie-energy18-current422-checkpoint-2026-10-15.md)
- [Chemie: zwei weitere Laborabschlüsse und vorhandene Bildfreigaben im Kandidaten 321/422 (15.10.2026)](chemie321-lab-carbonyl-keep-checkpoint-2026-10-15.md)
- [Chemie: vier neue Quellen-/Laborabschlüsse im Kandidaten 319/422 (15.10.2026)](chemie-source-lab-current422-checkpoint-2026-10-15.md)
- [Chemie: drei neue Analytikabschlüsse und stabiler Kandidat 315/419 (15.10.2026)](chemie315-acid10-checkpoint-2026-10-15.md)
- [Chemie: unabhängige Quellen-/Analytikprüfungen und nativer Arbeitscheckpoint (15.10.2026)](chemie-independent-reviews-checkpoint-2026-10-15.md)
- [Chemie: sieben Säure/Basen-Abschlüsse im Kandidaten 312/419 und gesicherte Autorenarbeiten (14.10.2026)](chemie-acid7-source-author-checkpoint-2026-10-14.md)
- [Chemie: Naturstoff-Kontexte und gesicherte Quellen-/Säure-Basen-Arbeiten (14.10.2026)](chemie-naturstoffe-context-checkpoint-2026-10-14.md)
- [Chemie: stabiler inaktiver Arbeitscheckpoint und Wiederaufnahme (14.10.2026)](chemie231-inactive-working-state-checkpoint-2026-10-14.md)
- [Chemie: 262/402 im Fünf-Gate-Bericht und offene Quellenintegration vom 14. Oktober](chemie262-five-gate-integration-source-holds-2026-10-14.md)
- [Chemie: gesicherte Quellen- und Profilprüfungen bei 231/402 vom 13. Oktober](chemie231-reviewed-source-profile-checkpoint-2026-10-13.md)
- [Chemie: Bild- und Quellenkorrekturen als stabiler Zwischenstand vom 13. Oktober](chemie231-image-source-successors-checkpoint-2026-10-13.md)
- [Chemie: begrenzte Korrekturarbeiten als inaktiver stabiler Zwischenstand vom 13. Oktober](chemie231-bounded-remediation-inactive-checkpoint-2026-10-13.md)
- [Chemie: 231/402 und gesicherte inaktive Polymer-/Quellenarbeiten vom 13. Oktober](chemie231-inactive-polymer17-and-source-holds-checkpoint-2026-10-13.md)
- [Chemie: finaler Quellen-/Seitenstand, unabhängige Befunde und inaktiver Zwischenstand vom 13. Oktober](chemie231-final-source-native-inactive-checkpoint-2026-10-13.md)
- [Chemie: stabiler Zwischenstand mit 220/402 vom 12. Oktober](chemie220-q3-and-leaf-checkpoint-2026-10-12.md)
- [Chemie: fünf neue fachliche Abschlüsse, 217/402 vom 12. Oktober](chemie217-five-scientific-closures-2026-10-12.md)
- [Biologie: maschineller M7-Abschluss, 397/397 und CQR-303 PASS vom 12. Oktober](biologie-m7-machine-closeout-2026-10-12.md)
- [Biologie 379/397: aktiver Zwischenstand, gezielte CI-Reparatur und inaktiv gesicherte offene Arbeiten vom 11. Oktober](biologie379-inactive-working-checkpoint-2026-10-11.md)
- [Aktueller Zieltext: ausschließlich Chemie M7](chemie-biologie-m7-goaltext-2026-09-30.md)
- [Pausierter Commit-Zwischenstand vom 1. Oktober](chemie-biologie-m7-pause-checkpoint-2026-10-01.md)
- [Chemie B009: drei aktuelle Abschlüsse](chemie-b009-three-current-integration-2026-10-01.md)
- [Biologie E.3: vier aktuelle Bilder](biologie-e3-four-current-images-2026-10-01.md)
- [Biologie E-Phase: sieben weitere aktuelle Bilder](biologie-ephase-seven-current-images-2026-10-01.md)
- [Biologie: Korrektur des Proteintransport-Bildes](biologie-5c2-proteintransport-bildkorrektur-2026-10-01.md)
- [Biologie E-Phase: Audit lokaler Prüfungsaufgaben](biologie-ephase-capstone-only-thirteen-local-task-audit-2026-10-01.md)
- [Biologie Q1: Audit des nächsten Pakets](biology-q1-next-package-audit-2026-10-01.md)
- [Fortsetzung und geprüfter Ausgangsstand vom 5. Oktober](chemie-biologie-m7-resumption-checkpoint-2026-10-05.md)
- [Vier fachliche Abschlüsse vom 5. Oktober](chemie-biologie-m7-four-closures-checkpoint-2026-10-05.md)
- [Vier aktuelle Bildbindungen vom 5. Oktober](chemie-biologie-m7-four-image-binding-checkpoint-2026-10-05.md)
- [Energiepaket: acht aktuelle Abschlüsse vom 5. Oktober](chemie-biologie-m7-energy8-checkpoint-2026-10-05.md)
- [Stoffmenge: sieben aktuelle Abschlüsse vom 5. Oktober](chemie-biologie-m7-stoffmenge-seven-checkpoint-2026-10-05.md)
- [Stoffmenge: neun aktuelle Abschlüsse vom 5. Oktober](chemie-biologie-m7-stoffmenge-nine-checkpoint-2026-10-05.md)
- [Aktuelle Kandidaten und bereinigte Reservierungen vom 5. Oktober](chemie-biologie-m7-current-candidates-reservations-checkpoint-2026-10-05.md)
- [Ein neuer Redoxabschluss vom 5. Oktober](chemie-biologie-m7-redox-one-checkpoint-2026-10-05.md)
- [KI-Transparenzinventar vom 5. Oktober](chemie-biologie-ai-transparency-inventory-2026-10-05.md)
- [Gesicherter Commit-Zwischenstand vom 5. Oktober](chemie-biologie-m7-commit-checkpoint-2026-10-05.md)
- [Biologie: aktuelle Gelelektrophorese-Fortsetzung vom 5. Oktober](chemie-biologie-m7-gel-fortsetzung-2026-10-05.md)
- [Chemie: fünf aktuelle Redox-/Titrationsabschlüsse vom 5. Oktober](chemie-biologie-m7-redox-titration-fortsetzung-2026-10-05.md)
- [B010 und Biologie-Genregulation: Fortsetzung vom 5. Oktober](chemie-biologie-m7-b010-tf-methylation-continuation-2026-10-05.md)
- [Aktueller Q1-/Bakterien-/E-Phasen-Stand vom 5. Oktober](chemie-biologie-m7-q1-bacteria-e7-continuation-2026-10-05.md)
- [NI und quantitative Anwendungen: Zwischenstand vom 6. Oktober](chemie-biologie-m7-ni-quantitative-continuation-2026-10-06.md)
- [Chemie-Achterpaket und 53 aktuelle Beschreibungsbindungen vom 6. Oktober](chemie-biologie-m7-chemistry-53-current-bindings-continuation-2026-10-06.md)
- [Geprüfte Chemie-/Biologie-Kandidaten und nächste Integration vom 6. Oktober](chemie-biologie-m7-reviewed-candidate-continuation-2026-10-06.md)
- [Chemie/Biologie: Commit-Zwischenstand und offene Kandidatenbefunde vom 6. Oktober](chemie-biologie-m7-commit-checkpoint-2026-10-06.md)
- [Q1-Trägerbild und aktuelle Bindungen vom 6. Oktober](chemie-biologie-m7-q1-carrier-and-current-bindings-continuation-2026-10-06.md)
- [15 weitere aktuelle Chemieziele vom 6. Oktober](chemie-biologie-m7-fifteen-current-chemistry-continuation-2026-10-06.md)
- [25 weitere aktuelle Chemieziele vom 7. Oktober](chemie-biologie-m7-twenty-five-current-chemistry-continuation-2026-10-07.md)
- [Commit-Zwischenstand vom 7. Oktober: 151/378 Chemie, 74/390 Biologie und offene Bildbefunde](chemie-biologie-m7-commit-checkpoint-2026-10-07.md)
- [Aktuelle Neuro21-Fortsetzung: 151/378 Chemie, 95/390 Biologie und erhaltene M7-Untergrenzen](chemie-biologie-m7-neuro21-continuation-2026-10-07.md)
- [Aktueller Commit-Zwischenstand: 173/378 Chemie, 134/391 Biologie und gesicherte offene Kandidaten](chemie-biologie-m7-ecology34-commit-checkpoint-2026-10-07.md)
- [Biologie: Mensch und Gesundheit, Fortsetzung vom 8. Oktober](chemie-biologie-m7-human20-continuation-2026-10-08.md)
- [Biologie: Flora und Fauna, Fortsetzung vom 8. Oktober](chemie-biologie-m7-flora-fauna20-continuation-2026-10-08.md)
- [Biologie: HE7-Zehnerpaket vom 8. Oktober](chemie-biologie-m7-he7-ten-continuation-2026-10-08.md)
- [Biologie: HE9-Siebzehnerpaket vom 8. Oktober](chemie-biologie-m7-he9-seventeen-continuation-2026-10-08.md)
- [Biologie: aktuelles Gentechnik-Ziel vom 8. Oktober](chemie-biologie-m7-he9-gentechnik-one-continuation-2026-10-08.md)
- [Chemie: acht geprüfte Quellenrollen vom 8. Oktober](chemie-biologie-m7-eight-source-roles-continuation-2026-10-08.md)
- [Biologie: zwei Teilziele zu Familienplanung vom 8. Oktober](chemie-biologie-m7-he9-two-child-split-continuation-2026-10-08.md)
- [Biologie: Evolution, 18 aktuelle Abschlüsse vom 8. Oktober](chemie-biologie-m7-evolution-eighteen-continuation-2026-10-08.md)
- [Chemie: zwei Korrosionsziele vom 8. Oktober](chemie-biologie-m7-corrosion-two-continuation-2026-10-08.md)
- [Commit-Zwischenstand vom 8. Oktober: 175/378 Chemie und 222/392 Biologie](chemie-biologie-m7-commit-checkpoint-2026-10-08.md)
- [21 weitere fachliche Abschlüsse vom 8. Oktober](chemie-biologie-m7-source-roles-twentyone-continuation-2026-10-08.md)
- [Biologie: drei weitere Stoffwechsel-Abschlüsse vom 8. Oktober](chemie-biologie-m7-stoffwechsel-three-continuation-2026-10-08.md)
- [Commit-Zwischenstand vom 8. Oktober: 177/378 Chemie und 244/392 Biologie](chemie-biologie-m7-chemie177-biologie244-commit-checkpoint-2026-10-08.md)
- [Zwischenstand vom 8. Oktober: 177/378 Chemie und 262/394 Biologie](chemie-biologie-m7-chemie177-biologie262-commit-checkpoint-2026-10-08.md)
- [Wissenschafts- und Quellenpakete vom 9. Oktober: aktuelle Nenner, unabhängige Kandidatenreviews und gezielte Bildkorrekturen](chemie-biologie-m7-science-and-source-continuation-2026-10-09.md)
- [Chemie/Biologie: geprüfter Zwischenstand 177/378 und 315/394](chemie-biologie-m7-chemie177-biologie315-commit-checkpoint-2026-10-09.md)
- [Geprüfter Zwischenstand vom 9. Oktober: 177/378 Chemie, 299/394 Biologie und fünf erfolgreich gebaute Lernzielbücher](chemie-biologie-m7-chemie177-biologie299-commit-checkpoint-2026-10-09.md)
- [Chemie: drei BW-Kompetenzen und praktische Endpunkte vom 10. Oktober, 180/381 und 315/394](chemie-biologie-m7-chemie180-biologie315-integration-2026-10-10.md)
- [Biologie: acht aktuelle Abschlüsse vom 10. Oktober, 323/394](chemie-biologie-m7-chemie180-biologie323-integration-2026-10-10.md)
- [Biologie: vier aktuelle Abschlüsse vom 10. Oktober, 327/394](chemie-biologie-m7-chemie180-biologie327-integration-2026-10-10.md)
- [Biologie: acht aktuelle Abschlüsse vom 10. Oktober, 335/394](chemie-biologie-m7-chemie180-biologie335-integration-2026-10-10.md)
- [Commit-Zwischenstand vom 10. Oktober: 180/381 Chemie, 335/394 Biologie und getrennte offene Kandidaten](chemie-biologie-m7-chemie180-biologie335-commit-checkpoint-2026-10-10.md)
- [Biologie: acht weitere aktuelle Abschlüsse vom 10. Oktober, 343/394](chemie-biologie-m7-chemie180-biologie343-integration-2026-10-10.md)
- [Biologie: zehn weitere aktuelle Abschlüsse vom 10. Oktober, 353/394](chemie-biologie-m7-chemie180-biologie353-integration-2026-10-10.md)
- [Commit-Zwischenstand vom 10. Oktober: geprüfter Chemiekandidat und unabhängige Biologie-Reviews](chemie-biologie-m7-reviewed-candidates-commit-checkpoint-2026-10-10.md)
- [Chemie: 26 neue fachliche Abschlüsse vom 10. Oktober, 206/398; Biologie 353/394 erhalten](chemie-biologie-m7-chemie206-biologie353-integration-2026-10-10.md)
- [Chemie 206/398: zwei gültige BY-Quellenbindungen wiederhergestellt und CI-Fortsetzung](chemie-biologie-m7-chemie206-ci-source-binding-repair-2026-10-10.md)
- [Commit-Zwischenstand vom 11. Oktober: 206/398 Chemie, 353/394 Biologie und gesicherte Kandidatennachweise](chemie-biologie-m7-chemie206-biologie353-commit-checkpoint-2026-10-11.md)
- [Biologie: 13 weitere fachliche Abschlüsse vom 11. Oktober, 366/395; Chemie 206/398 erhalten](chemie-biologie-m7-biologie366-health-integration-2026-10-11.md)
- [Chemie/Biologie: inaktiver Nachweis-Checkpoint vom 11. Oktober; 206/398 und 366/395 erhalten](chemie-biologie-m7-inactive-evidence-github-checkpoint-2026-10-11.md)

<div data-sp-content-lang="en" markdown>

## Pilots and Dossiers

These documents capture one-off investigations, remediation slices, or dated PoC evidence. They are useful context, not durable process contracts.

</div>

<div data-sp-content-lang="de" markdown>

## Piloten und Einzeldossiers

Diese Dokumente halten einmalige Untersuchungen, gezielte Korrekturpakete oder datierte PoC-Nachweise fest; sie sind historischer Kontext und keine dauerhaften Prozessverträge.

</div>

- [Backend-CI: Laufzeit und Fehlerpriorisierung vom 8. Oktober](backend-ci-runtime-review-2026-10-08.md)
- [Mathematik: HE-Sek-I-Modellbeziehungen und Scope](math-he-seki-model-relations-scope-correction-2026-09-27.md)
- [Mathematik: Stammfunktionsbild 31be](math-m7-31be-image-candidate-2026-09-27.md)
- [Mathematik: 7d in der vorläufigen HE-LK-Sicht](math-m7-7d-he-lk-scope-2026-09-28.md)
- [Mathematik HE K3: getrennte Prozessquelle als Kandidat](math-he-k3-process-source-candidate-2026-09-27.md)
- [Mathematik Q2.3: Korrektur der hessischen LK-Druckseiten](math-q23-source-reference-correction-2026-09-27.md)
- [Mathematik Q4.2: Korrektur der hessischen Druckseiten](math-q42-source-reference-correction-2026-09-27.md)
- [Mathematik Q4: Caterer-Prüfungsaufgabe, fokussierte QS](math-q4-caterer-exam-current-review-2026-09-23.md)
- [Mathematik E-Phase: Stammfunktionsgraphen, fokussierte Prüfungs-QS](math-antiderivative-exam-candidate-review-2026-09-28.md)
- [Issue 48: Einheitlicher Lernplanstatus](issue-48-unified-learning-plan-status.md)
- [Physik: M7-Abschluss im Mehrpass-Durchgang, 2026-09-20](physics-m7-resumed-2026-09-20.md)
- [Physik: Wiederaufnahme und CI-Voraussetzung, 2026-09-14](physics-resumed-checkpoint-2026-09-14.md)
- [Mathematik/Physik: Wiederaufnahme, 2026-09-13](math-physics-resumed-checkpoint-2026-09-13.md)
- [Physik: pausierter Zwischenstand, 2026-09-08](physics-paused-checkpoint-2026-09-08.md)
- [Physik: pausierter Zwischenstand, 2026-09-07](physics-paused-checkpoint-2026-09-07.md)
- [Mathematik/Physik: Wiederaufnahme- und Effizienzreview, 2026-09-05](math-physics-deep-understanding-resumption-review-2026-09-05.md)
- [Mathematik/Physik Deep-Understanding Verfahrensreview und Zwischenstopp, 2026-09-02](math-physics-deep-understanding-procedure-review-2026-09-02.md)
- [Mathematik/Physik Deep-Understanding Checkpoint, 2026-08-29](math-physics-deep-understanding-rollout-checkpoint-2026-08-29.md)
- [Mathematik/Physik Deep-Understanding Checkpoint, 2026-08-28](math-physics-deep-understanding-rollout-checkpoint-2026-08-28.md)
- [Mathematik/Physik Deep-Understanding Checkpoint, 2026-08-27](math-physics-deep-understanding-rollout-checkpoint-2026-08-27.md)
- [Mathematik/Physik Deep-Understanding Checkpoint, 2026-08-26](math-physics-deep-understanding-rollout-checkpoint-2026-08-26.md)
- [Mathematik/Physik Deep-Understanding Review-Pause, 2026-08-27](math-physics-deep-understanding-review-pause-2026-08-27.md)
- [MEM SPARQL Consistency PoC, 2026-06-01](archive/mem-sparql-consistency-poc-2026-06-01.md)
- [MEM SPARQL Consistency PoC Procedure](mem-sparql-consistency-poc-procedure.md)
- [Englisch M0 Remediation Pilot](status/english-remediation-pilot.md)
- [Biologie Memory-Card Pilot Dossier](status/memory-card-pilot-biologie.md)
- [BW Mathematik Sek II: HE Coverage Audit](bw-math-sekii-he-coverage-audit.md)
