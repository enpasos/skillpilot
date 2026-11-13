# Skill Graph Compendium — Single Source of Truth

This directory is the **sole authored source** for the bilingual SkillPilot Graph Definition compendium across both **MkDocs web documentation** (`EN` and `DE`) and **LuaLaTeX / PDF technical compendia** (`EN` and `DE`), including the 145-rule traffic-light (`Ampel`) milestone matrix.

## Policy: Source-Only Tracking

Only the canonical sources in `docs/concept/skill-graph/source/`, the compiler `docs/concept/skill-graph/build_spec.py`, the Matplotlib generator `docs/concept/skill-graph/latex/generate-completion-diagrams.py`, the mathematical model check `docs/concept/skill-graph/latex/check-assessment-model.py`, and the seven static original illustrations (`01-skill-graph-overview.png` through `07-filter-modes.png`) are committed to Git.

All generated Markdown pages (`graph-definition*.md`, `context-and-views.*.md`, `learning-units*.md`, `learning-unit-progression*.md`, `planning-and-budget.*.md`, `assessment-gated-completion*.md`, `compendium-appendix.*.md`, `docs/qa-ci/graph-definition-rule-milestone-matrix*.md`), generated diagram PNGs (`00-*`, `08-*` through `16-*`), intermediate `.tex` files (`tmp/skill-graph-document/`), `.pdf` compendia, and `.build.json` manifests are `.gitignore`d build artifacts and must never be edited by hand or committed.

## Source Files

- `spec-manifest.json` — Document metadata, language headers, web page routing, and shared MathJax / LaTeX macro definitions.
- `figures.json` — Metadata, asset bindings, alt texts, and `DE`/`EN` captions for all 17 illustrations (`fig:title`, `fig:overview`..`fig:period`).
- `rules-and-gates.json` — All 145 `GD-*` rules, their 4-state enforcement traffic light (`hart`, `teil`, `offen`, `opt`), 11 validation areas, and 24 repository gates in `DE` and `EN`.
- `glossary-and-symbols.json` — Key frontmatter distinctions, glossary (`Appendix D.1`), and unified mathematical symbol reference (`Appendix D.2`) in `DE` and `EN`.
- `implementation-status.json` — Dated Product Owner decisions, audited commits, specification-vs-implementation comparison (`Appendix B`), and normative source attribution (`Appendix E`) in `DE` and `EN`.
- `chapters/00-frontmatter.{de,en}.md` through `06-appendices.{de,en}.md` — Canonical bilingual prose chapters with 1:1 structural AST parity verified on every build.

## Build and Verification Commands

```bash
# Pure Python stdlib (<0.5s): verify DE/EN AST parity and generate all Web .md + LaTeX .tex files
python3 docs/concept/skill-graph/build_spec.py --web-and-tex

# Full build: verify sources, run mathematical check, render bilingual PNGs, compile DE & EN PDFs
python3 docs/concept/skill-graph/build_spec.py --all
```

## Licensing

- Technical specification prose, schemas, and build scripts: `Apache-2.0`.
- Own didactic illustrations (`00`..`16` PNGs): `CC-BY-4.0` (`SkillPilot / enpasos`).
