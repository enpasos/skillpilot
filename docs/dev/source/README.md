# Developer, Schema, and Editor Guide — Canonical Single Source

This directory (`docs/dev/source/`) is the canonical bilingual (`de`/`en`) single source for **SkillPilot Developer, Schema, Editor, and Platform Guide** (`dev-handbook` in `docs/compendia.json`).

## Build Commands

```bash
python3 scripts/build_compendia.py --compendium dev-handbook --web-and-tex
python3 scripts/build_compendia.py --compendium dev-handbook --pdfs
```

Generated Web Markdown pages in `docs/dev/` carry a generated-artifact notice and are verified in CI via `python3 scripts/build_compendia.py --check-committed-web`.
