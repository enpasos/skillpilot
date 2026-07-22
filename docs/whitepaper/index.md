# Whitepaper Documentation Index

This page groups the public SkillPilot whitepapers.

## Whitepapers

- [SkillPilot Whitepaper (DE)](whitepaper.de.md)
- [SkillPilot Whitepaper (EN)](whitepaper.en.md)

## Maintenance

- Keep language variants aligned when changing public positioning.
- `whitepaper.de.pdf` is a derived snapshot of `whitepaper.de.md`. Regenerate it
  from the repository root after changing the German source:

  ```bash
  pandoc docs/whitepaper/whitepaper.de.md --from=gfm --standalone \
    --pdf-engine=xelatex --resource-path=docs/whitepaper:docs \
    -V papersize:a4 -V geometry:margin=22mm \
    -V mainfont='DejaVu Sans' -V monofont='DejaVu Sans Mono' \
    -o docs/whitepaper/whitepaper.de.pdf
  ```

- Deploy the canonical Markdown and the regenerated PDF to `app/public/` with
  `python3 scripts/deploy_whitepaper.py`.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/whitepaper/` is missing from this index.
