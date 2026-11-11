# SkillPilot Whitepaper — Single Source of Truth

This directory is the canonical bilingual source of truth (`DE` + `EN`) for the public SkillPilot Whitepaper:

- `docs/whitepaper/whitepaper.de.md` and `app/public/whitepaper/whitepaper.de.md`
- `docs/whitepaper/whitepaper.en.md` and `app/public/whitepaper/whitepaper.en.md`
- `docs/whitepaper/whitepaper.de.pdf` and `app/public/whitepaper/whitepaper.de.pdf`
- `docs/whitepaper/whitepaper.en.pdf`

## Licensing

The Whitepaper text and own didactic illustrations in this compendium are licensed under **CC-BY-4.0** (`LICENSES/CC-BY-4.0.txt`); see `LICENSING.md`.

## Regenerating

From the repository root:

```bash
# Regenerate Web Markdown pages (DE + EN) and LaTeX sources
python3 scripts/build_compendia.py --compendium whitepaper --web-and-tex

# Regenerate Web Markdown pages + LuaLaTeX PDFs (DE + EN)
python3 scripts/build_compendia.py --compendium whitepaper --web-and-tex --pdfs
```
