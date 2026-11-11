# Security, Data Privacy & AI Transparency — Canonical Single-Source Compendium

This directory contains the canonical bilingual (`de`/`en`) source for **Volume V: Security, Data Privacy, and AI Transparency** (`skillpilot-security-and-privacy`).

## Generated Outputs

Running `python3 scripts/build_compendia.py --compendium security --web-and-tex --pdfs` materializes:

- **Web Markdown pages** (committed for GitHub browsing, contract verification, and MkDocs):
  - `docs/security/data-privacy.md` (EN) & `docs/security/data-privacy.de.md` (DE)
  - `docs/security/openai-mcp-client-binding.md` (DE) & `docs/security/openai-mcp-client-binding.en.md` (EN)
  - `docs/legal/ki-verordnung-compliance-stand-2026-07-29.md` (DE) & `docs/legal/ki-verordnung-compliance-stand-2026-07-29.en.md` (EN)
- **Typeset LuaLaTeX PDFs** (built on demand / in CI, untracked in Git):
  - `docs/security/skillpilot-security-and-privacy.de.pdf`
  - `docs/security/skillpilot-security-and-privacy.en.pdf`

## Editing Rules

1. Edit only files under `docs/security/source/` (`spec-manifest.json` and `chapters/*.{de,en}.md`); never hand-edit generated Web Markdown pages.
2. Maintain strict 1:1 DE/EN AST block parity across every chapter pair (`01` through `03`).
3. Preserve all privacy and retention contract invariants verified by `node scripts/check_skillpilot_coach_plugin.mjs` against `docs/security/data-privacy.md`.
4. License: Apache-2.0 (`LICENSING.md`).
