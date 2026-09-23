# Whitepaper Documentation Index

This page groups the public SkillPilot whitepapers.

## Whitepapers

- [SkillPilot Whitepaper (DE)](whitepaper.de.md)
- [SkillPilot Whitepaper (EN)](whitepaper.en.md)
- [Die Geschichte in Bildern (DE)](storyboard.de.md)
- [The story in pictures (EN)](storyboard.en.md)

## Maintenance

- [Visual refresh: screenshots and illustration decisions](visual-refresh-2026-09-21.md)

- Keep language variants aligned when changing public positioning.
- `whitepaper.de.pdf` is a derived snapshot of `whitepaper.de.md`. Regenerate it
  from the repository root after changing the German source:

  ```bash
  pandoc docs/whitepaper/whitepaper.de.md --from=gfm --standalone \
    --lua-filter=scripts/whitepaper-pdf-tables.lua \
    --pdf-engine=xelatex --resource-path=docs/whitepaper:docs \
    -V papersize:a4 -V geometry:margin=22mm -M lang=de-DE \
    -V mainfont='DejaVu Sans' -V monofont='DejaVu Sans Mono' \
    -o docs/whitepaper/whitepaper.de.pdf
  ```

- Keep the table filter in the PDF build: it gives widthless Markdown tables
  wrapping, equal-width columns for LaTeX only, avoiding text outside the page.
  It preserves table content, explicitly authored widths, and web rendering.
- The same filter honours `width=...` image titles, as used by the WebGUI,
  in PDF output (CSS pixels at 96 dpi). Use this to keep narrow screenshots
  and their captions together without changing the original image file.

- Deploy the canonical Markdown and the regenerated PDF to `app/public/` with
  `python3 scripts/deploy_whitepaper.py`.
- Use Markdown image syntax for figures that must also appear in the PDF;
  raw HTML image tags are not rendered by the PDF pipeline.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/whitepaper/` is missing from this index.
