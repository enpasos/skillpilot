# Skill graph PDF build

`docs_pdf.py` is the MkDocs hook configured in `mkdocs.yml`. Every `mkdocs build`,
`mkdocs gh-deploy` and live-preview rebuild renders the current
`docs/concept/skill-graph/graph-definition.md` and its local images. It adds a
PDF download button immediately below that page's title and registers the PDF
as the generated site file `downloads/SkillPilot_Skill_Graph_Specification.pdf`.
The Markdown source and the seven approved PNGs are not rewritten.

The PDF is a build artifact, not a separately maintained or committed document.
Rendering uses local files only; it never fetches the live website or a CDN.
The source revision is recorded in the PDF. A JSON build receipt in
`tmp/docs-pdf/` records hashes of the Markdown, images, renderer, template and
PDF. These temporary artifacts are not part of the authored documentation.

## Print style

The A4 template uses Inter SemiBold for the title and headings, Linux Libertine
for body text and Libertinus Math for formulas. It combines an 11-point body,
comfortable line spacing, a spacious two-line cover title, a contents list with
right-aligned page numbers, muted blue-grey metadata and fine dividing rules.
The original PNGs are embedded without redrawing or pixel changes.

The cover includes the source commit's UTC date, its short revision, the online
specification and an immutable link to that revision's Markdown. A rebuild does
not use the current wall-clock date. An unversioned local source does not invent
a GitHub commit link. The font and metadata checks prevent silent substitutions.

## Local build (Ubuntu / WSL)

From the repository root:

```bash
sudo apt-get update
sudo apt-get install --yes --no-install-recommends \
  pandoc texlive-xetex texlive-latex-extra texlive-fonts-recommended \
  texlive-fonts-extra fonts-linuxlibertine fonts-dejavu-core fonts-inter
kpsewhich LibertinusMath-Regular.otf
python -m pip install -r requirements-docs.txt
python -m unittest -v scripts.test_docs_pdf
mkdocs build
python scripts/test_docs_pdf.py --site site
```

`texlive-fonts-extra` supplies Libertinus Math. The shared setup action installs
the same fonts for both documentation checks and deployment. Font files are not
checked into Git.

Build just the PDF with `python scripts/docs_pdf.py`. An optional `--output`
argument chooses the destination. Restart `mkdocs serve` after editing the Python
hook itself (MkDocs retains imported hook modules); Markdown and image changes
are picked up on rebuild.

## Publication and failure behavior

The Deploy Docs workflow runs on every push to `main`, installs the shared PDF
toolchain action, and publishes the website and PDF together. Docs Checks runs
the same renderer on relevant pushes and pull requests, including changes to
images, requirements, the renderer, template and build workflows. Its post-build
check resolves the download link and compares the published PDF to the verified
output and source hashes.

TeX errors, missing images/glyphs, overfull boxes, unreadably scaled equations,
invalid bookmarks or out-of-page content fail the build. Missing print-style
fonts also fail verification. No stale-PDF fallback is used. Files are replaced
only after successful checks. Long formulas are reflowed for print without
changing their mathematical tokens; further new oversized formulas require a
presentation-only rule in `print_math`.
