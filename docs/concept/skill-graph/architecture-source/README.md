# Skill Graph Architecture, Media & Interchange — Canonical Single Source

This directory (`docs/concept/skill-graph/architecture-source/`) is the canonical bilingual (`de`/`en`) single source for **SkillPilot Skill Graph Architecture, Media, Goal Books, and Dual Package Interchange** (`skill-graph-architecture` in `docs/compendia.json`), complementing the formal mathematical specification in `docs/concept/skill-graph/source/`.

## Build Commands

```bash
python3 scripts/build_compendia.py --compendium skill-graph-architecture --web-and-tex
python3 scripts/build_compendia.py --compendium skill-graph-architecture --pdfs
```

Generated Web Markdown pages in `docs/concept/skill-graph/` carry a generated-artifact notice and are verified in CI via `python3 scripts/build_compendia.py --check-committed-web`.
