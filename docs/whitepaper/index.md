<div data-sp-content-lang="en" markdown>

# Whitepaper Documentation Index

This page groups the public SkillPilot whitepaper and its single-source PDF edition.

## Whitepaper & Storyboard

- [SkillPilot Whitepaper](whitepaper.en.md) · [English PDF](whitepaper.en.pdf)
- [The Story in Pictures](storyboard.en.md)

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

</div>

<div data-sp-content-lang="de" markdown>

# Whitepaper-Dokumentation

Diese Übersicht bündelt das öffentliche SkillPilot-Whitepaper und die aus derselben Single-Source erzeugte PDF-Ausgabe.

## Whitepaper & Bildgeschichte

- [SkillPilot Whitepaper](whitepaper.de.md) · [Deutsches PDF](whitepaper.de.pdf)
- [Die Geschichte in Bildern](storyboard.de.md)

## Pflegehinweise

- [Visuelle Überarbeitung: Screenshots und Illustrationsentscheidungen (EN)](visual-refresh-2026-09-21.md)
- `whitepaper.de.md`, `whitepaper.en.md`, `whitepaper.de.pdf` und `whitepaper.en.pdf` werden aus dem kanonischen Single-Source-Verzeichnis `docs/whitepaper/source/` (`spec-manifest.json`, `figures.json` und `chapters/*.{de,en}.md`) mit automatischer DE/EN-AST-Paritäts- und Terminologieprüfung erzeugt.
- Web-Markdown-Seiten (einschließlich der Spiegelung nach `app/public/whitepaper/`) und LuaLaTeX-PDFs aus dem Repository-Root neu erzeugen:

  ```bash
  python3 scripts/build_compendia.py --compendium whitepaper --web-and-tex --pdfs
  ```

- Bei Änderungen an statischen Medien oder Storyboard-Markdown-Dateien in `docs/whitepaper/` oder `docs/comic1..3/` diese mit `python3 scripts/deploy_whitepaper.py` nach `app/public/` übertragen.
- Rasterillustrationen in `docs/whitepaper/` niemals ohne Aktualisierung von `docs/legal/ai-transparency-inventory.json` und erfolgreiche Prüfung per `node scripts/check_ai_transparency_inventory.mjs` hinzufügen, entfernen oder ändern.
- `cd app && npm run check:docs-indexes` schlägt fehl, wenn eine direkte Markdown-Datei unter `docs/whitepaper/` in diesem Index fehlt.

</div>
