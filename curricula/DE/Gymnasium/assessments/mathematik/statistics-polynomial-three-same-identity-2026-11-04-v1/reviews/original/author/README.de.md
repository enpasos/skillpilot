# Vier private vollständige Prüfungsinhalte

Dieser eingefrorene Autorenstand enthält vier originale DE/EN-Aufgaben mit
vollständigen Lösungen, Rubriken und Gegenfällen. Er enthält keine unabhängige
Inhaltsfreigabe und entscheidet keine globale Prüfungsrolle oder Platzierung.
Alle 807 curricularen Atome im Root bleiben unverändert.

| Bestehender Kompetenzvertrag | Inhalt |
|---|---|
| `613871f6-ccb2-51fe-aba2-0dd17b86a89e` | LK/AB3: feste und zweistufige Binomialregeln aus Fehlergrenzen und erwartetem Prüfaufwand entwickeln und vergleichen |
| `0190e463-51a7-4860-9b35-d875530a85ba` | J10/AB2: Symmetrieidentitäten und zusammengefasste Termstruktur, verdeckte Aufhebung, Konstanten und Nullfunktion |
| `6a4716bd-8038-46bb-b647-0db4a254fee7` | J10/AB2: aus echtem Polynomgraphen Nullstellen/Vielfachheiten, Grad und Term erschließen; ausdrücklich begrenzte Eindeutigkeit |
| `e33e75e3-eae5-5a09-862f-d1a11176373f` | GK/LK, Q4/AB2: reine Verschiebungs-, vertikale und horizontale Skalierungsscharen mit quadratischer, Exponential- und Sinusgrundfunktion |

Jeder ID-Ordner enthält die sechs DE/EN-Markdown-Dateien, den vollständigen
aktuellen Kompetenzknoten, einen hypothetischen Same-ID-WholeGoal-Draft und
`role-neutral-whole-form-content.draft.json`. Letztere Datei ist der
wiederverwendbare Inhalt ohne endgültige Rollenentscheidung. Die technische
Same-ID-Variante ergänzt ausschließlich `nodeKind: exam` und `examData`.
Sämtliche bisherigen Felder einschließlich ID, vollständiger Texte,
`requires`, Scope, Source und Anforderungsniveau bleiben identisch.

Die spätere Integration muss zuerst die tatsächliche Scopewirkung untersuchen.
Eine globale Same-ID-Prüfungsrolle kann in bereits versorgten Scopes zusätzliche
Prüfungspflichten erzeugen. Gegebenenfalls wird derselbe geprüfte Inhalt in
einem separat geschützten Assessment verwendet. Hier wird kein neuer Knoten,
keine neue Kante und keine Platzierung dafür erfunden. Die Originalkompetenz
bleibt im Root gewöhnlich. Auch die berechneten A/M-After-Fingerprints sind
nur Inputs für die hypothetische Variante, keine Freigaben oder Importanweisung.

`whole-current-contracts-and-preparation.json` enthält alle vier ganzen
Kompetenzverträge und die vollständigen unveränderten vorbereitenden
R-Ketten mit 54/55/55/56 verschiedenen Knoten. Vorbereitung gilt nicht als
Prüfungsabdeckung; jede vorgeschlagene Inhaltsform beansprucht ausschließlich
ihren eigenen bestehenden Kompetenzvertrag.

## Vorhandene Formen und Quellen

`reuse-search.json` enthält vier tatsächlich gelesene ganze aktuelle Exams:

- `2f626446`: nur zwei kombinierte BE für Symmetrie/Minimalgrad, kein abgelesener Graph.
- `3da7863d`: ganze Kettenlinien-/Glockenkurvenaufgabe; eine R-Referenz beweist keine Abdeckung der Transformationskompetenz.
- `f5d06f11`: echte aktive Parabelrekonstruktion mit Grafik, als begrenzte Teilvorlage nutzbar. Die Funktionsklasse wird bereits vorgegeben. Ob diese Sonderfallprüfung als begrenzter Reuse für den allgemeineren Polynomvertrag genügt, bleibt eine echte Reviewentscheidung; der vorhandene Inhalt wird nicht verschwiegen.
- `46bb8422`: echte ganze Aufgabe zu einem festen allgemeinen Transformationsterm, ohne Untersuchung einer veränderlichen Schar bekannter Funktionsklassen.

Die neue Graphform untersucht zusätzlich einen kubischen Graphen, die
begründete Gradgrenze und die Nicht-Eindeutigkeit bei reduziertem Wissen.
Die neue Scharform untersucht die Parameterwirkungen in drei bekannten
Klassen. Quellen-/Mappingzeilen und ganze zugehörige Quellkompetenzen stehen
in `existing-source-and-scope-context.json`. Die bestehenden Metadaten werden
bewahrt; keine neue curriculare Zulassung wird aus einer alten Quellenzeile
oder einer Vorbereitungskante hergeleitet.

## Konkrete Prüfung

Jede Form hat eine Gesamtpunktzahl von 20 BE und genau eine Bestehensgrenze
von 15 BE. Fachlich begründete 14-BE-Kappungen betreffen eine vollständig
fehlende Kernhandlung des jeweiligen Kompetenzvertrags. Knappe richtige
Erklärungen, gleichwertige Verfahren, eine andere Reihenfolge und richtige
Folgearbeit zählen; ein lokaler Fehler allein löst keine Kappung aus.
Es gibt keine separaten Teilbestehensgrenzen und keinen serverseitigen
Rubrikalgorithmus in diesem Paket.

Die Statistikrechnung prüft die gesamten disjunkten Stop-/Fortsetzungsfälle.
Die zunächst plausible Regel mit `r=5` hat tatsächlich rund 6,33 %
Fehlbeanstandung und scheidet aus. `r=6` erreicht rund 4,17 % und 92,72 %
Entdeckung bei etwa 26,2364 erwarteten Prüfungen statt 40. Die Aufgabe
beschränkt Hypothesen und Optimierungsvergleich ausdrücklich; sie behauptet
keine allgemeine globale Optimalität.

Die originale wissenschaftliche Grafik ist echtes Aufgabenmaterial unter
dem bestehenden Markdown-Bildpfad
`/assets/assessment-materials/mathematik/6a4716bd-8038-46bb-b647-0db4a254fee7/polynomial-graph-v1.png`.
`task-graph-delivery-proposal.json` bindet Quelle, genaue Bytes und den später
zu materialisierenden `app/public`-Pfad. Die private Chromium-Fixture hat
diesen tatsächlichen URL mit denselben Bytes geladen; beide Sprachfassungen
enthalten das Bild im Task. Die Browser-Screenshots sind zusätzliche
Sichtbelege, keine Ersatzgrafik. Eine visuelle Kontrolle des PNG und der
tatsächlich eingebundenen Browsergrafik ergab lesbares Gitter, Skalen,
markierte Punkte und Endpfeile. Das Randverhalten ist im Task ausdrücklich
als bekannt gesetzt, nicht aus einem endlichen Fenster behauptet.

Ergebnisse:

- 72 exakte mathematische/Vertragsprüfungen, darunter unabhängige Auszählung sämtlicher 441 Ergebnispaare je zweistufiger Rechnung.
- 32 konkrete Autoren-Gegenfälle mit nachvollziehbarer Teilbewertung, Kappungsbegründung und 14/15-Grenzfällen. Dies sind Autorenurteile, kein automatischer semantischer Grader.
- 16 wirkliche DE/EN-Prüfungsfelder durch die aktuellen ReactMarkdown-/GFM-/Math-/KaTeX-Dependencies; 476 Formeln, keine KaTeX-Fehler.
- Aktuelles Chromium lädt die vier lokalen Vorschauen und die echte Aufgabengrafik; keine Seitenfehler.
- Acht vollständige registrierte A/M-Zeilen sind aktuell gebunden. Hierzu wurden die tatsächlichen jetzigen Fingerprintfunktionen isoliert aus ihren Quellbytes ausgeführt. Alle vier ursprünglichen A-Zeilen sind `atomic`, alle M-Zeilen `no_memory_needed`; keine neue Entscheidung wurde geschrieben.

Ausführbar vom Repository-Root:

```bash
python3 tmp/approach-review-20261101/statistics-polynomial-transform-four-whole-forms-20261104-v1/verify_frozen_package.py
python3 tmp/approach-review-20261101/statistics-polynomial-transform-four-whole-forms-20261104-v1/verify_author_mathematics.py
python3 tmp/approach-review-20261101/statistics-polynomial-transform-four-whole-forms-20261104-v1/verify_rubric_countercases.py
node tmp/approach-review-20261101/statistics-polynomial-transform-four-whole-forms-20261104-v1/verify_am_context.mjs
node tmp/approach-review-20261101/statistics-polynomial-transform-four-whole-forms-20261104-v1/verify_rendering.mjs
```

Der Author-Generator verweigert Änderungen nach `content-review-handoff.json`.
Es gab einen korrigierten lokalen Playwright-Importfehler bei der ersten
Browserprobe; der danach tatsächlich abgeschlossene Browserlauf ist gebunden.
Keine Produktion, kein Root/Git, kein neues Runtimefeature und kein Lernzustand
wurden verändert. Unabhängige Inhalts-/A-M-Prüfung, Scope-Effektentscheidung,
eventuelle Integrationsmetadaten und echte Native-/Stage-/M7-/CI-Nachweise
bleiben offen. Frühere akzeptierte Formen begründen nur das Paketformat.
