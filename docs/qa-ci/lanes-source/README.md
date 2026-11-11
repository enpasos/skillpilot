# QA/CI Infrastructure, Release Contracts & Review Lanes — Canonical Single-Source Compendium

This directory contains the canonical bilingual (`de`/`en`) source for **Volume IVb: CI Infrastructure, Curriculum Release Contracts, and Review Lanes** (`skillpilot-qa-lanes-and-release-contracts`).

## Generated Outputs

Running `python3 scripts/build_compendia.py --compendium qa-ci-lanes --web-and-tex --pdfs` materializes:

- **28 Web Markdown pages** (`DE` + `EN` pairs under `docs/qa-ci/`)
- **Typeset LuaLaTeX PDFs** (built on demand / in CI, untracked in Git):
  - `docs/qa-ci/skillpilot-qa-lanes-and-release-contracts.de.pdf`
  - `docs/qa-ci/skillpilot-qa-lanes-and-release-contracts.en.pdf`

## Editing Rules

1. Edit only files under `docs/qa-ci/lanes-source/` (`spec-manifest.json` and `chapters/*.{de,en}.md`); never hand-edit generated Web Markdown pages.
2. Maintain strict 1:1 DE/EN AST block parity across every chapter pair (`01` through `14`).
3. Keep code fence lines at most 72 ASCII characters for clean LuaLaTeX monospace layout.
4. License: Apache-2.0 (`LICENSING.md`).
