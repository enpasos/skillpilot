# Whitepaper Documentation Index

This page groups the public SkillPilot whitepapers and their single-source PDF editions.

## Whitepapers

- [SkillPilot Whitepaper (DE)](whitepaper.de.md) · [Deutsches PDF](whitepaper.de.pdf)
- [SkillPilot Whitepaper (EN)](whitepaper.en.md) · [English PDF](whitepaper.en.pdf)
- [Die Geschichte in Bildern (DE)](storyboard.de.md)
- [The story in pictures (EN)](storyboard.en.md)

## Maintenance

- [Visual refresh: screenshots and illustration decisions](visual-refresh-2026-09-21.md)

- `whitepaper.de.md`, `whitepaper.en.md`, `whitepaper.de.pdf`, and `whitepaper.en.pdf` are generated from the canonical single-source directory `docs/whitepaper/source/` (`spec-manifest.json`, `figures.json`, and `chapters/*.{de,en}.md`), with automatic DE/EN structural AST parity and terminology checks.
- Regenerate the Web Markdown pages (including their `app/public/whitepaper/` mirrors) and LuaLaTeX PDFs from the repository root:

  ```bash
  python3 scripts/build_compendia.py --compendium whitepaper --web-and-tex --pdfs
  ```

- If static media or storyboard Markdown files in `docs/whitepaper/` or `docs/comic1..3/` change, deploy them to `app/public/` with `python3 scripts/deploy_whitepaper.py`.
- Do not add, remove, or modify raster illustrations in `docs/whitepaper/` without updating `docs/legal/ai-transparency-inventory.json` and passing `node scripts/check_ai_transparency_inventory.mjs`.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/whitepaper/` is missing from this index.
