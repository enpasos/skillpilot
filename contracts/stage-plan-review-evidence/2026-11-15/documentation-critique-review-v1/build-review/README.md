# Lokaler Abschluss der Dokument-Builds

15. November 2026, GPT-6.1 Sol Ultra / `land_stage_excerpts`.

Die fünf angefragten Kompendien sind als **80 Webseiten, DE/EN-TeX, zehn PDFs (575 Seiten)** gebaut: `skill-graph`, `skill-graph-architecture`, `glossary`, `didactic`, `runtime-workflows`. GraphDefinition einschließlich mathematischem Modellcheck und exakt geprüftem DE/EN-Diagrammsatz; je PDF drei LuaLaTeX-Durchläufe. Die zehn finalen PDF-Logs bestehen den unveränderten vorhandenen Layout-/Referenz-/Glyphen-/Trennungsfehlervertrag. Vier PDF-Seiten wurden tatsächlich visuell geprüft: F13 DE47/EN45 sowie E2 DE34/EN31; keine abgeschnittene Passage/Formel auf diesen Stichproben. Kein Vollsichtreview aller 575 Seiten.

Der erste aggregierte Build scheiterte **nach** erfolgreichen GraphDefinition-PDFs an `\Own` im neuen Architektur-E2-Beispiel. Dieses Makro ist nur im GraphDefinition-Kompendium verfügbar. Die anschließende rein typografische DE/EN-Korrektur zu `\operatorname{Own}` und der erfolgreiche Build der vier restlichen Kompendien sind getrennt dokumentiert. Keine semantische Modelländerung, keine abgesenkte Sperre. Der Originalreview und seine drei Modell-/21-Paritätschecks wurden nicht überschrieben. Das Nachlaufdelta steht separat in `post-review-own-macro.patch`, alle finalen 106 Source-/Compilerpins in `final-inputs-and-pdf-checks.actual.json`.

**Bestanden:** globale `verify-sources`; Untracked-Output-Policy; Committed-Web-/Bilingual-Map-Parität; Generated Notices (191 Dateien); Generated-Status-Registry; Markdownlinks (515 Dateien); Indexabdeckung (8 Indizes); Terminologie (179.553 Dateien, unveränderte 57 exakt geprüfte historische Vorkommen); MkDocs `--strict`; Whitespace. Nach Roots abschließender Änderung an Management/Review wurden Links, Indizes und MkDocs erneut erfolgreich geprüft; dieselbe Terminologiefunktion prüfte die beiden letzten Dokumentdeltas nochmals ohne Ausnahme. Die Kompendiumsquellen waren dabei unverändert.

**PDF-Warnungsgrenze:** Der vorhandene Compiler schreibt pauschal „0 overflows/warnings“. Tatsächlich sperrt er die definierten Layout-/Referenz-/Glyphen-/Trennungsfehler; vorhandene Underfull- und Hyperref-PDFstring-Warnungen sind nicht sämtlich Fehler dieses Vertrags. Deren tatsächliche Anzahlen sind in den finalen PDF-Logchecks ausgewiesen. Dieser Lauf behauptet keine vollständige Warnungsfreiheit und ändert den Gatevertrag nicht.

Beide bereits vom Nutzer geänderten Whitepaper-PDFs wurden nicht gebaut und blieben exakt SHA-256 `036ea533e4df2dc1baa6adb88b390aba26a965b776caf5756b58bcf181def708`. Die neue Quellenregel wurde erneut gegen Zielnorm/Iststatus gelesen (`source-rule-reread.md`); sie erzeugt keine amtliche Quellenbehauptung oder neue implementierte Freigabe.

Kompakte Abschlussübersicht: `final-receipt.actual.json`. Jeder Schritt besitzt tatsächliches argv/cwd, Zeit, Exitcode und Logdigest in seiner eigenen `.actual.json`-Quittung. Keine Gitmutation, Veröffentlichung, Deployment-, Remote-CI-, Curriculum- oder Lernwirksamkeitsabnahme.

## Reproduktion

Der lokale Host benötigt den vorhandenen deutschen TeX-Zusatzbaum; die CI installiert stattdessen regulär die in `docs_checks.yml` gelisteten TeX-Pakete.

```bash
python3 scripts/build_compendia.py --compendium skill-graph --compendium skill-graph-architecture --compendium glossary --compendium didactic --compendium runtime-workflows --all --texmf /tmp/skillpilot-g17-document-texmf-lex9aorl/usr/share/texlive/texmf-dist
python3 scripts/build_compendia.py --verify-sources --check-untracked-outputs --check-committed-web
npm --prefix app run check:generated-doc-notices
npm --prefix app run check:generated-status-registry
npm --prefix app run check:docs-links
npm --prefix app run check:docs-indexes
npm --prefix app run check:terminology
mkdocs build --strict
git diff --check -- docs scripts/doc_compendium
```
