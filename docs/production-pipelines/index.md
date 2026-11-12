<div data-sp-content-lang="en" markdown>

# Production Pipelines Documentation Index

This page is the entry point for repeatable production and export pipelines. Keep pipeline status reports in `docs/qa-ci/status/` and implementation notes in `docs/dev/`.

## Program Status

- [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md)
  Current implementation checkpoint for the paired JSON-runtime and FWU-ontology release program.

## Pipelines

- [Production Pipelines Handbook (PDF)](skillpilot-production-pipelines.en.pdf)
  Unified single-source compendium (Volume V) covering skill-graph authoring, secure package provisioning, subject-export ZIPs, MEM/FWU Core roundtrips, and exam production workflows.
- [Skill Graph](skill-graph.md)
  Pipeline notes for skill graph production.
- [Curriculum Package Provisioning](curriculum-package-provisioning.en.md)
  Secure quarantine, content-addressed installation, CAS activation, and rollback for JSON runtime packages.
- [SkillPilot Subject Export Package](skillpilot-subject-export-package.md)
  Subject export package structure and release pipeline.
- [MEM/FWU Roundtrip Pipeline](mem-fwu-roundtrip.md)
  Operational pipeline for MEM/FWU roundtrip artifacts.
- [Exam Example](exam-example.md)
  Pipeline notes for exam example production.
- [Sek-I Mathematics Exam](seki-math-exam.md)
  Reviewed production pipeline for Gymnasium mathematics Sek-I year-level exam tasks.

## Maintenance

- Add new repeatable production pipelines here.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/production-pipelines/` is missing from this index.

</div>

<div data-sp-content-lang="de" markdown>

# Produktions-Pipelines

Diese Seite ist der Einstiegspunkt für wiederholbare Produktions- und Export-Pipelines. Laufende Statusberichte gehören nach `docs/qa-ci/status/`, Implementierungsnotizen nach `docs/dev/`.

## Programmstatus

- [Duale Curriculum-Pakete: Umsetzungsstand](../dev/dual-curriculum-package-implementation-status.de.md)
  Aktueller Umsetzungsstand für das gekoppelte Release-Programm aus JSON-Runtime- und FWU-Ontologie-Paketen.

## Pipelines

- [Produktionshandbuch (PDF)](skillpilot-production-pipelines.de.pdf)
  Einheitliches Single-Source-Kompendium (Band V) zu Skill-Graph-Erstellung, sicherem Paket-Provisioning, Fach-Export-ZIPs, MEM/FWU-Core-Roundtrips und Prüfungsaufgaben-Produktion.
- [Skill-Graph](skill-graph.de.md)
  Pipeline-Leitfaden für die Erstellung und Pflege eines Skill-Graphen.
- [Curriculum-Paket-Provisioning](curriculum-package-provisioning.md)
  Sichere Quarantäne, inhaltsadressierte Installation, CAS-Aktivierung und Rollback für JSON-Runtime-Pakete.
- [SkillPilot-Fachexportpaket](skillpilot-subject-export-package.de.md)
  Aufbau und Release-Pipeline für Fachexportpakete.
- [MEM/FWU-Roundtrip-Pipeline](mem-fwu-roundtrip.de.md)
  Operative Pipeline für MEM/FWU-Roundtrip-Artefakte.
- [Prüfungsbeispiel](exam-example.de.md)
  Pipeline für strukturierte Prüfungsaufgaben.
- [Sek-I-Mathematikprüfung](seki-math-exam.de.md)
  Geprüfte Produktions-Pipeline für jahrgangsbezogene Gymnasium-Mathematikaufgaben der Sekundarstufe I.

## Pflegehinweise

- Neue wiederholbare Produktions-Pipelines hier ergänzen.
- `cd app && npm run check:docs-indexes` schlägt fehl, wenn eine direkte Markdown-Datei unter `docs/production-pipelines/` in diesem Index fehlt.

</div>
