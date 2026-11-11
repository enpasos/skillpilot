# SkillPilot Glossary — Single Source of Truth

This directory is the canonical bilingual source of truth (`DE` + `EN`) for SkillPilot's central terminology reference:

- `docs/concept/glossary.md` (English Web page)
- `docs/concept/glossary.de.md` (German Web page)
- `docs/concept/skillpilot-glossary.en.pdf` (English PDF)
- `docs/concept/skillpilot-glossary.de.pdf` (German PDF)

## Regenerating

From the repository root:

```bash
python3 scripts/build_compendia.py --compendium glossary --web-and-tex --pdfs
```
