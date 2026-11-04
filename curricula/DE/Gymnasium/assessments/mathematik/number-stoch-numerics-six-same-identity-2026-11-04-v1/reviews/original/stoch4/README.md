# Vier vollständige Prüfungsformen unter unveränderten Kompetenz-IDs

Dieses Paket ist ein **privater Autorvorschlag**. Es ist noch nicht unabhängig
inhaltlich freigegeben oder produktiv integriert. `reviewStatus` bleibt `draft`.
Es wurden ausschließlich Dateien in diesem Paketverzeichnis geschrieben.

Der Stand bindet die vier vollständigen `wholeCurrentGoal`-Objekte in
[whole-current-and-proposed-contracts.json](whole-current-and-proposed-contracts.json).
Änderungen an anderen kanonischen Zielen sind zulässig; ein global unveränderter
Canonical-Dateihash wird nicht vorausgesetzt. Je Vorschlag kommen ausschließlich
`nodeKind: exam` und `examData` hinzu. Original-ID, DE/EN-Texte, Tags, Schwierigkeit,
Quellenfelder, Anwendbarkeit, Dimensionen, Gewicht, Beziehungen und Medien bleiben
objektgleich. Die vier Ziele bleiben `curricularAtomic` und in der A/M-Population.

| ID | Vollständiger Aufgabenzuschnitt |
|---|---|
| `455ef29a-7194-5c5a-b832-1c27fcbf2516` | Exponentialverteilung als exemplarisches stetiges Wartezeitmodell: Einzelwerte/Intervalle, Wahrscheinlichkeiten/Quantil, verbleibende Wartezeit, konkrete Modellannahme und Grenze. Die Formel ist als Hilfe gegeben. |
| `5b54f272-f588-5009-8b42-eb15f846d3e2` | Relative Binomialstreuung berechnen, herleiten und Abnahme bei festem p zeigen; Mindestumfang und Gegenbeispiel bei wechselndem p. Der Bereich bleibt n≥1 und 0<p<1; keine zusätzliche Randfallpflicht. |
| `58fda9b4-4336-5594-99ce-722c4a453372` | Einfache DG zweiter Ordnung qualitativ anhand von Rückstellbeschleunigung und vorgegebenen Kandidaten untersuchen, typische periodische Verläufe beschreiben und vergleichen. Kein allgemeines Löseverfahren. |
| `619f29f5-7f44-5654-9692-01b250997d52` | Reales numerisches Protokoll zu x+e^x=4: Durchführung dokumentieren, Fehlerklammer belegen, konkrete Grenzen nennen und Entscheidung an der ursprünglichen sowie verschärften Genauigkeit rückbewerten. Algorithmus und geprüfte Werte sind angegeben. |

Jeder ID-Ordner enthält `task.de.md`, `task.en.md`, `solution.de.md`,
`solution.en.md`, `rubric.de.md`, `rubric.en.md`, die zusammenhängende
`reviewed-execution-contract.json`, `whole-contract.before-after.json` und
`current-context.json`. Die Lösungen im JSON enthalten exakt die separaten
Lösungen plus ihre gewöhnliche Gesamtrubrik.

Alle Formen haben 20 BE, eine Bestehensgrenze von 15 BE und genau ein binäres
Gesamtergebnis. Der Gesamtcap 14 greift ausschließlich bei Abwesenheit einer
Kernleistung über die ganze Abgabe. Gleichwertige Verfahren, Leistungen an
beliebiger Stelle und knappe richtige Erklärungen werden anerkannt;
Rechenfolgefehler werden fair behandelt. Es gibt keine Teilbestehensgrenzen.
`coveredGoalIds` enthält ausschließlich die eigene ID. Aus der Anwendung von
Voraussetzungen wird keine zusätzliche geprüfte Kompetenz oder Mastery abgeleitet.

## Bestehender Kontext und Wiederverwendung

[existing-source-reuse-and-preparation-context.json](existing-source-reuse-and-preparation-context.json)
protokolliert die Prüfung der 195 aktuellen kanonischen `examData`-Objekte.
Keines enthält die vier IDs als explizite geprüfte Abdeckung oder direkte
Exam-Vorbereitung. Die gezielte Suche in produktiven Assessment-Tasks und
Execution-Contracts ergab keine bestehende entsprechende WholeForm.
Breite Kontext-/Planungsreferenzen werden deshalb nicht als vollständiger
Kompetenznachweis wiederverwendet.

Die vollständigen Originalziele, direkten Eltern, sämtliche `contains`-Vorfahren
und gesamten direkten transitiven Vorbereitungsketten stehen in den vier
`current-context.json`. Die Ketten enthalten 38, 4, 55 beziehungsweise 58 weitere
Ziele; keiner der jeweiligen `contains`-Vorfahren fügt ein `requires` hinzu.
Die direkte Vorbereitung bleibt unverändert: Normalapproximation, binomiale
Kenngrößen, elementare DG erster Ordnung beziehungsweise begründete Verfahrenswahl.

Vorhandene hessische Legacy-Mappings und die einschlägigen bestehenden
Source-Extraction-Reviews sind als ganze Zeilen beigefügt. Die expliziten
Extraktionsbezüge für DG zweiter Ordnung und weitere stetige Verteilungen
bleiben erhalten. Für die anderen beiden IDs wird keine neue Quellenabdeckung
behauptet. Dies ist keine neue Scope-/Quellenentscheidung.

[registered-current-AM-context.json](registered-current-AM-context.json) enthält
alle acht vollständigen aktuell registrierten A/M-Zeilen. Sie besagen bisher
`atomic` und `no_memory_needed`. Die tatsächlichen Reader-Funktionen wurden
aus den aktuellen TypeScript-Dateien extrahiert: Alle acht Originalfingerprints
stimmen; bei den vorgeschlagenen Fingerprints ändert sich nur `nodeKind`.
Diese rein technische Prüfung ersetzt keine inhaltliche Revalidierung.
[author-whole-identity-and-AM-rationale.json](author-whole-identity-and-AM-rationale.json)
enthält die Autorbegründungen für diese noch unabhängig zu prüfenden Urteile.
Es wurden keine A/M-Ledger, Memorygoals oder Decks geändert.

## Ausgeführte Autorprüfungen

- [author-exact-mathematics.json](author-exact-mathematics.json): 18 tatsächliche
  symbolische/numerische Prüfungen mit SymPy, darunter Quotientenidentität,
  Minimalumfang, Gegenbeispiele, alle Wahrscheinlichkeitsergebnisse,
  DG-Kandidaten/Anfangsbedingungen/Perioden und numerische Fehlerklammern.
- [author-contract-AM-and-katex-check.json](author-contract-AM-and-katex-check.json):
  alle vier aktuellen Objekte noch exakt, nur zwei vorgeschlagene neue Felder,
  20/15-Punktesummen, DE/EN-Einbettung identisch, acht Original-AM-Fingerprints
  anhand aktueller Reader bestätigt und 337 tatsächliche KaTeX-Renderings mit
  `throwOnError: true`, `strict: error`, `trust: false` erfolgreich.
- [author-rubric-countercases.json](author-rubric-countercases.json): elf
  begründete Autor-Gegenfälle zu Kernlücken, ausreichenden Alternativleistungen,
  Rechenfolgefehlern und unzulässigen versteckten Zusatzpflichten. Dies sind
  Rubrikanalysen, keine behaupteten Tests eines realen LLM-Graders.

Die Prüfscripte liegen bei. Aus dem Repository-CWD sind sie ausführbar mit
`python <Paketpfad>/check_math.py` und `node <Paketpfad>/check_contracts.mjs`.
Sie schreiben ausschließlich ihre beiden Autor-Prüfergebnisse in dieses Paket.
`author-freeze.json` fixiert genau die an den unabhängigen Review übergebenen
Dateien. Nach dem Freeze werden diese Autorartefakte nicht still verändert.

## An den unabhängigen Inhaltsreview

Bitte die ganzen Original- und vorgeschlagenen Objekte, DE/EN-Aufgaben,
Musterlösungen und normalen Gesamtrubriken fachlich prüfen; insbesondere:
volle ursprüngliche Kompetenz statt Teiltest, Scope/R-Erhalt, Beispielgrenzen,
mathematische Ergebnisse, faire Kappen und Folgefehler, Sprachäquivalenz sowie
inhaltliche A/M-Revalidierung trotz neuem Ausführungsformat. Ein Urteil darf
nicht aus den positiven Autorprüfungen abgeleitet werden. Der Autor hat keine
Astra- oder sonstige unabhängige Freigabe eingetragen.

Es wird kein Mastery-, neuer R-, Targetscope-, Memory-/Deck-, Produktiv-,
CI-, M7- oder Host-Abnahmewrite vorgenommen oder behauptet. Die statische
Prioritätenplanung des Root-Tasks ist keine Wirkungsabnahme.
