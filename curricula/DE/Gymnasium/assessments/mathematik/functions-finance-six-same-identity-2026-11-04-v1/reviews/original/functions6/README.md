# Sechs vollständige Prüfungsformen unter bestehenden Kompetenz-IDs

Dieses Paket ist ein privater Autorvorschlag für den unabhängigen Inhaltsreview.
Alle neuen Formen bleiben `draft`; es gibt keine eingetragene unabhängige
Freigabe und keine produktive Integration. Geschrieben wurde ausschließlich
in diesem Paketverzeichnis.

[whole-current-and-proposed-contracts.json](whole-current-and-proposed-contracts.json)
enthält die sechs vollständigen Original- und vorgeschlagenen Objekte. Gebunden
werden diese endlichen Originalobjekte, nicht ein unveränderlicher globaler
Canonical-Dateihash. Unabhängige Änderungen anderer Ziele, etwa Markov,
berühren diesen Autorvorschlag nicht. Pro Ziel werden ausschließlich `nodeKind`
und `examData` ergänzt. Die ganzen ursprünglichen DE/EN-Texte, IDs, R, Scope,
Tags, Schwierigkeit, Quellenfelder, Gewicht, Dimensionen und Medien bleiben
objektgleich. Alle sechs bleiben Teil der 807 `curricularAtomic`-Ziele.

| ID | Ganze ursprüngliche Kompetenz in der Form |
|---|---|
| `d144a855-9139-55c7-a801-e8b85dab5f01` | Parameterabhängige Stammfunktionen und bestimmte Integrale einer ganzrationalen Schar berechnen und deuten; bestehender geprüfter 4a-Kern fachlich wiederverwendet. |
| `7f11ffe0-7c43-4507-9101-50374a60b0e8` | Periodische Realsituation selbst mit Sinus/Kosinus modellieren, graphisch und rechnerisch bearbeiten, Annahmen variieren und Kontextaussagen deuten. |
| `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` | Wachstum und Abklingen aus Daten exponentiell modellieren, graphisch und rechnerisch beschreiben, Wachstumsannahme ändern und Grenzen kritisch prüfen. |
| `1842da92-ca2c-5fed-a946-e6413a6285bb` | Zinssatz durch echte tabellenkalkulatorische Versuche und Verfeinerung näherungsweise bestimmen und am Finanzziel prüfen. |
| `f6574cdc-e29c-5a8f-a009-9f28b3bcf9be` | Regelmäßige Sparrate über die tabellarische Guthabenentwicklung näherungsweise bestimmen und prüfen. Das originale „Tilgung oder Sparrate“ macht keinen zusätzlichen Tilgungsfall verpflichtend. |
| `fc34449a-fbf4-574c-884f-ecdf48b42d2e` | Laufzeit als erste passende vollständige Zins-/Zahlungsperiode mit einer Tabellenkalkulation bestimmen und kontextuell prüfen. |

Jeder ID-Ordner enthält die ganzen Tasks, Lösungen und Rubriken auf DE und EN,
`reviewed-execution-contract.json`, `whole-contract.before-after.json` sowie
`current-context.json`. Die JSON-Lösung enthält jeweils exakt die Lösung plus
gewöhnliche Gesamtrubrik. Die Vorbereitungsketten enthalten 65, 45, 60, 28,
29 beziehungsweise 30 weitere Originalziele; sämtliche `contains`-Vorfahren
sind beigefügt und liefern keine zusätzliche geerbte R-Kante.

Alle Formen verwenden genau eine Gesamtpunktzahl 20, bestanden ab 15 und einen
Gesamtcap 14 ausschließlich für das Fehlen einer ursprünglichen Kernleistung
in der gesamten Abgabe. Gleichwertige Methoden/Schreibweisen, Leistungen an
beliebiger Stelle und faire Rechenfolgefehler sind berücksichtigt. Kein
Teilscore wird zu einem eigenen Passstatus. `coveredGoalIds` enthält jeweils
nur die eigene stabile ID; Vorbereitung ist keine zusätzliche Coverage.

## Bestehende Form ernsthaft wiederverwenden

[reuse-canonical-inspection.json](reuse-canonical-inspection.json) bindet die
beim Autorenstart gelesenen 195 kanonischen `examData`-Objekte mit zwei relevanten
Treffern. Diese wurden vollständig gelesen, einschließlich Aufgaben, Lösungen,
Rubriken und tatsächlich benötigter Vorbereitung.

Für d144 prüft das bestehende Exam `1969d4dc-2ba6-5c26-ad7c-6e0114ab1fdf`
den Kompetenzkern in Teil 4a bereits vollständig. Dieser mathematische Inhalt
wird ausdrücklich wiederverwendet. Die bestehende ganze 25-BE-Aufgabe verlangt
aber auch Ortskurven und Parameterexistenz. Diese fachlich notwendigen
LK-Anteile dürfen nicht bloß zur Prüfung einer GK/LK-Integralkompetenz in
weitere Personal Curricula gedrückt werden.

[d144-existing-form-reuse-decision.json](d144-existing-form-reuse-decision.json)
begründet anhand aller acht bestehenden R die fachliche Trennung. Die vollständige
bestehende Aufgabe und alle acht Vorbereitungsobjekte sind in
[d144-existing-exam-34-scope-inspection.json](d144-existing-exam-34-scope-inspection.json)
gebunden. Die vom Root angegebene echte Native-Population wurde gelesen:
161 tatsächliche Scopes, davon 46 Unions. Für genau 34 Scopes ist d144 ein
unabgedeckter Endpunkt. Das bestehende Exam ist in keinem dieser 34 Targets,
in keinem projiziert sichtbar und keine ausgewählte geschützte Verpflichtung.
26 GK-Scopes fehlt die tatsächlich benötigte LK-Vorbereitung. SH ist außerdem
in der bestehenden Exam-Anwendbarkeit nicht enthalten. Eine reine Platzierung
würde deshalb die gesamte betroffene Population nicht ohne neue Scope- oder
Vorbereitungsentscheidung lösen. Die eng passende eigene Form bewahrt die
Originalkompetenz und die zwei ursprünglichen R. Das bestehende Exam wird
vollständig unverändert gelassen. Dies ist eine begründete Wiederverwendung,
keine Verdopplung eines passend platzierten ganzen Exams für eine Zählung.

Beim periodischen Ziel enthält Exam `c9d7546d-3d4a-5f68-b609-831ee8de8877`
einen Coverageclaim, verlangt aber Formelinterpretation/Einzelwerte statt der
ganzen eigenen graphischen Modellierung und Variation. Für die vollständige
Originalkompetenz reicht diese bestehende Form daher nicht. Für die übrigen
vier Ziele gab es keine entsprechende explizite bestehende Coverageform.

Die Native-Zeilen sind gelesene bestehende Evidenz, keine neue Messung einer
Wirkung des privaten Vorschlags. Statische Prioritätenplanung ist keine Abnahme.

## Vollständiger Inhalt ohne zusätzliche Dateien im Prüfungsablauf

Alle 24 eingebetteten Task-/Lösungstexte sind vollständig und enthalten keine
Datei-, XLSX- oder Bildlinks. Die Graphen werden vom Lernenden gezeichnet;
kein notwendiges Eingabeschaubild fehlt. In den Lösungen stehen vollständige
Terme, Stützpunkte, Achseneinheiten und Verlaufserklärungen. Alle Finanzaufgaben
enthalten Tabellenaufbau, genaue Zeitpunkte und nachvollziehbare Zellformeln.
Eine zusätzliche Datei, ein Screenshot oder bestimmtes Tabellenprogramm ist
keine Abgabevoraussetzung.

Die folgenden wirklichen Artefakte dienen nur dem Autor-/Inhaltsreview:

- [Periodische Graphik DE](7f11ffe0-7c43-4507-9101-50374a60b0e8/solution-graph.de.png)
  und [EN](7f11ffe0-7c43-4507-9101-50374a60b0e8/solution-graph.en.png).
- [Exponentielle Graphik DE](27b63e2e-6a34-483e-8e5a-fe0f49670d1d/solution-graph.de.png)
  und [EN](27b63e2e-6a34-483e-8e5a-fe0f49670d1d/solution-graph.en.png).
- [Zinssatz-XLSX](1842da92-ca2c-5fed-a946-e6413a6285bb/solution-spreadsheet.xlsx),
  [Sparrate-XLSX](f6574cdc-e29c-5a8f-a009-9f28b3bcf9be/solution-spreadsheet.xlsx)
  und [Laufzeit-XLSX](fc34449a-fbf4-574c-884f-ecdf48b42d2e/solution-spreadsheet.xlsx).

Die vier PNGs wurden mit mathematischen Plotfunktionen erzeugt und visuell
angesehen. Es gibt keine vorgeschlagenen Runtime-Assetpfade oder neue
Assetpipeline. Die drei XLSX-Dateien enthalten 104 wirkliche Zellformeln.
Ein begrenzter arithmetischer Autorprüfer wertet genau diese Formeln aus,
setzt die überprüften Caches und liest Formeln/Werte mit openpyxl zurück.
Eine unabhängige Decimal-Rechnung prüft ihre Werte nochmals. Es wird keine
Ausführung in Excel/LibreOffice und keine reale Host-Abnahme behauptet.

## Ausgeführte Autorprüfungen und aktueller A/M-Kontext

[author-exact-mathematics.json](author-exact-mathematics.json) enthält 21
wirklich ausgeführte symbolische/numerische beziehungsweise Tabellenprüfungen
und zwei ausdrücklich als begründete semantische Randentscheidungen markierte
Einträge. Geprüft wurden unter anderem beide Scharintegrale, Daten-/Phasen-
und Variantenwerte, exponentielle Anschlussbedingungen, exakte Centanzeigen
aller DE/EN-Geldtabellen, Sparratenminimalität und die Zielperioden 7/8.

[author-contract-AM-and-katex-check.json](author-contract-AM-and-katex-check.json)
belegt die sechs noch exakten Originalobjekte, ausschließlich zwei ergänzte
Felder, alle 20/15-Punktesummen, die identische bilinguale Texteinbettung,
zwölf passende aktuelle A/M-Originalfingerprints anhand der tatsächlichen
Reader-Funktionen und 194 erfolgreiche strikte KaTeX-Renderings.

[author-spreadsheet-formula-and-cache-check.json](author-spreadsheet-formula-and-cache-check.json)
belegt die 104 Formelzellen und ihren ehrlichen Cache-Readback.
[author-rubric-countercases.json](author-rubric-countercases.json) enthält 16
begründete Rubrikgegenfälle; dies sind keine behaupteten Tests eines realen
LLM-Graders.

[registered-current-AM-context.json](registered-current-AM-context.json) enthält
alle zwölf vollständigen aktuellen A/M-Zeilen. Sie besagen bisher `atomic`
und `no_memory_needed`. Mit `nodeKind` ändern sich ihre Fingerprints; die
positiven technischen Bindungsprüfungen sind keine inhaltliche Revalidierung.
[author-whole-identity-and-AM-rationale.json](author-whole-identity-and-AM-rationale.json)
enthält deshalb lediglich Autorbegründungen für den unabhängigen Inhaltsreview.
Alle sechs bleiben ausdrücklich in der curricularAtomic-A/M-Population.

[existing-source-and-semantic-kind-context.json](existing-source-and-semantic-kind-context.json)
bindet die vollständigen sechs aktuellen Kind-Zeilen und passende bestehende
Source-Extraction-Zeilen aus HE, BW, NI und BY. Alle bestehenden Quell- und
Scopeentscheidungen bleiben erhalten. Es wurden keine A/M-Ledger, Quellen,
R, Personal-Curriculum-Targets, Memorygoals oder Decks verändert.

`author-freeze.json` fixiert die an den unabhängigen Review übergebenen Dateien.
Bitte die ganzen DE/EN-Formen einschließlich Mathematik, Originalkompetenz,
Kontext/Scope, fairen Kappen, Folgefehlern und A/M inhaltlich eigenständig
bewerten. Autorprüfungen sind kein Ersatz dafür. Keine Astra-Freigabe wurde
vom Autor eingetragen.

Keine Aussage dieses Pakets behauptet Mastery, einen produktiven Write,
eine neue Runtime-Wirkung, M7, CI oder praktische Wirksamkeit.
