## Regeln und Meilensteine {#sec:rule-milestones appendix=true}

::include{block="rule-milestones-appendix"}

## Statusabgleich und Grenzen der Aussagen {#sec:implementation appendix=true}

::include{block="implementation-appendix"}

## Prüfstrategie für die Abschlussberechnung {#sec:test-strategy appendix=true}

Das begleitende [check-assessment-model.py](repo:docs/concept/skill-graph/latex/check-assessment-model.py) ist eine mathematische Referenzprüfung mit der Python-Standardbibliothek. Es prüft die Formeln aus Abschnitt~@ref{sec:assessment} an kleinen endlichen Modellen, liest keine Lernerdaten und ändert keinen Laufzeitzustand ([GD-D04](@rule{GD-D04})).

- **Endliche Modellprüfung.** Alle DAGs bis vier Knoten in topologischer Ordnung mit jeder Belegung von Mastery- und Schutzmenge, soweit die lokalen Inhaltsziele vollständig durch eigene Prüfungen gedeckt sind: $5\,222$ gültige Fälle. Traversierung und statische transitive Hülle liefern dieselbe implizite Menge $I_U$.
- **Minimalität.** Die transitive Reduktion ist minimal und erhält die Hülle. Redundante Kanten der normalisierten Relation ändern die Anerkennung nicht. Der ältere Vererbungsgegenfall ist eine Diagnose des Übergangsbestands; dieser begrenzte Modelltest ersetzt nicht die vollständige `G17`-Prüfung des aktuellen Katalogs ([GD-D05](@rule{GD-D05})).
- **Globale Monotonie.** Zusätzliche ausdrückliche Mastery öffnet bei festen gültigen Verträgen keine effektiv beherrschte Arbeit erneut. Prüfungs- und Memorierziele werden nie implizit bestanden ([GD-D06](@rule{GD-D06})).
- **Rekursive Einheiten.** $128$ Belegungen des Mechanik-Beispiels prüfen Abschluss $\Complete(U)$, eigene Anerkennung $I_U$ und ausdrückliche Kindpflichten. Ein Aggregat braucht keine eigene Prüfung; eine reine Synthese braucht keine neuen Inhaltsziele.
- **Einheitsgruppierung.** $948$ Gruppierungsfälle vergleichen den Block-DAG mit einer vollständigen Blockreihenfolge. Ein Gegenbeispiel zeigt einen azyklischen atomaren DAG mit zyklischer Blockzusammenfassung; keine technische Sperrpolitik wird daraus abgeleitet.
- **Konkrete Gegenbeispiele.** Kein Stopp an gemeisterten Zwischenzielen; lokale Anerkennung trotz offener späterer Prüfung; dauerhafte Vertragsvereinigung, künftige Voraussetzungen, Schnitt mit der Plan-Zielmenge und externe Unterstützung außerhalb von $\Own(U)$.
- **Ungültige Eingaben.** Zyklen, unbekannte Referenzen und ungedeckte lokale Inhaltsziele schlagen definiert als Fehler fehl und führen nie zu automatischer Beherrschung.

Die Diagrammerzeugung in [generate-completion-diagrams.py](repo:docs/concept/skill-graph/latex/generate-completion-diagrams.py) prüft die konkret gezeigten Mengen und vergleicht mit `--check` die frisch gerenderten PNG-Bytes ([GD-D07](@rule{GD-D07})). Diese Modell- und Diagrammtests prüfen weder reale Aufgabenqualität noch Benotungszuverlässigkeit, Identitätskontrolle oder pädagogische Wirkung. Die geforderte unabhängige Inhaltsprüfung bleibt ein eigener Schritt; Laufzeitintegration sowie deren Sicherheits-, Nebenläufigkeits- und Oberflächentests bleiben gesonderte Implementierungsarbeit.

:::sources
[check-assessment-model.py](repo:docs/concept/skill-graph/latex/check-assessment-model.py); [generate-completion-diagrams.py](repo:docs/concept/skill-graph/latex/generate-completion-diagrams.py).
:::

## Begriffe und Symbole {#sec:glossary appendix=true}

::include{block="glossary-appendix"}

## Quellenzuordnung und Abbildungen {#sec:sources appendix=true}

::include{block="sources-appendix"}

## Dokument bauen und prüfen {#sec:build appendix=true}

Alle zweisprachigen Web-Seiten und PDF-Ausgaben entstehen aus der einzigen verfassten Quelle unter `docs/concept/skill-graph/source/` ([source/README.md](repo:docs/concept/skill-graph/source/README.md), [spec-manifest.json](repo:docs/concept/skill-graph/source/spec-manifest.json)). Der Compiler `docs/concept/skill-graph/build_spec.py` prüft die 1:1-Strukturparität zwischen Deutsch (`DE`) und Englisch (`EN`), übersetzt Kapitel und strukturierte JSON-Quellen in MkDocs-Markdown sowie LuaLaTeX-Quellen und bindet die statischen Originalabbildungen (`01`--`07`) sowie die zweisprachig generierten Bitmap-PNGs (`00`, `08`--`16`) aus `docs/concept/skill-graph/assets/graph-definition/` ein. Vom Repositorywurzelverzeichnis aus:

- `python3 docs/concept/skill-graph/build_spec.py --web-and-tex` -- prüft mit reiner Python-Standardbibliothek die `DE`/`EN`-AST-Parität und erzeugt sämtliche zweisprachigen MkDocs-Webseiten sowie die LaTeX-Zwischendateien unter `tmp/skill-graph-document/`.
- `python3 docs/concept/skill-graph/latex/check-assessment-model.py` -- führt die endliche mathematische Referenzprüfung zu Abschnitt~@ref{sec:assessment} aus.
- `python3 docs/concept/skill-graph/latex/generate-completion-diagrams.py --check` -- prüft die deterministisch gerenderten zweisprachigen PNG-Diagramme ohne Dateiveränderung.
- `python3 docs/concept/skill-graph/build_spec.py --all` -- führt Paritätsprüfung, Formelmodelltest, zweisprachige PNG-Erzeugung, Web-Markdown-Generierung und den mehrstufigen LuaLaTeX-Build für die deutsche (`skillpilot-graph-definition.pdf`, `skillpilot-graph-definition.de.pdf`) und englische (`skillpilot-graph-definition.en.pdf`) PDF-Ausgabe samt `.build.json`-Manifesten aus ([GD-D11](@rule{GD-D11})).

Für `--web-and-tex` und die Formelprüfung genügt Python 3; der vollständige `--all`-Lauf benötigt zusätzlich Matplotlib sowie LuaLaTeX mit deutscher (`ngerman`) und englischer (`english`) Sprachunterstützung und den Präambelpaketen. Mehrere LaTeX-Läufe lösen alle Querverweise auf; die erzeugten `.build.json`-Manifeste binden Eingabedateien, `SOURCE_DATE_EPOCH`, Werkzeugversionen und PDF-Prüfsummen per SHA-256. Über unterschiedliche TeX-Live-Versionen hinweg ist identische PDF-Bytefolge nicht garantiert. Sämtliche generierten Web-Markdown-Dateien, generierten Diagramm-PNGs (`00`, `08`--`16`), `.tex`-Zwischendateien, PDFs und Build-Manifeste sind per `.gitignore` ausgeschlossene Build-Artefakte und werden niemals von Hand editiert oder committet.

Zum vollständigen Dokumentabschluss gehören ein fehlerfreier Build, aufgelöste Verweise, die Prüfung auf überbreite oder überhohe Boxen und eine visuelle Sichtung beider PDF-Ausgaben ([GD-D12](@rule{GD-D12})). Technischer Spezifikationstext, Schemata und Build-Skripte stehen unter `Apache-2.0` ([LICENSE](repo:LICENSE)), eigene didaktische Abbildungen unter `CC-BY-4.0` ([LICENSES/CC-BY-4.0.txt](repo:LICENSES/CC-BY-4.0.txt), [LICENSING.md](repo:LICENSING.md)). Build- und Formelprüfungen ergänzen die Dokument-QA, ersetzen aber weder Laufzeittests noch unabhängige fachliche und empirische Validierung.

:::sources
[source/README.md](repo:docs/concept/skill-graph/source/README.md); [spec-manifest.json](repo:docs/concept/skill-graph/source/spec-manifest.json); [check-assessment-model.py](repo:docs/concept/skill-graph/latex/check-assessment-model.py); [LICENSING.md](repo:LICENSING.md).
:::
