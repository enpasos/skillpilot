# Unabhängiger Inhalts- und A/M-Review: drei ganze Formen

**PASS für alle drei vollständigen Formen; sechs echte neue A/M-Urteile.**
Reviewer: OpenAI `gpt-6-astra`, reasoning `ultra`, Agent
`/root/astra_six_math_whole_forms`, Rootthread
`01a1880f-4ee1-72c2-a81a-cf98380ee05d`. Die tatsächliche Invocation wurde
vom Root bestätigt. Dies ist unabhängige AI-Evidenz, keine menschliche Freigabe.

Ausgangspunkt ist ausschließlich der eingefrorene Sol-Autorstand
`../diagrams-algebra-notation-three-whole-forms-20261104-v1/author-freeze.json`,
SHA256 `8af5da738646c015699fb28deba93bebf1c1b9d5246909d0300e86381d59339b`.
48 gebundene Dateien wurden tatsächlich nach Hash und Größe verifiziert.
Alle drei ganzen Originalziele und alle ursprünglichen Felder bleiben exakt;
nur `nodeKind` und `examData` werden ergänzt. Alle 807 curricularAtomic IDs
bleiben erhalten. Coverage betrifft ausschließlich die jeweilige eigene ID.

| Goal-ID | Inhalt | A | M |
|---|---|---|---|
| d668c22d-caeb-5e91-8980-721c931a2bcf | PASS: Diagrammfehlinterpretation erklären, korrigieren und klarere Alternative begründen | atomic | no_memory_needed |
| fa0b6b69-ce54-4711-90e6-26f27249cd71 | PASS: beide Gleichungsstrukturen lösen, vergleichen und in Originalgleichungen prüfen | atomic | no_memory_needed |
| 647ec09d-68ae-57db-9ca4-aeb2da4218f1 | PASS: Mengen-, Intervall- und Funktionsnotation auswählen, verwenden und semantisch erläutern | atomic | no_memory_needed |

[review.json](review.json) enthält die vollständigen individuellen Urteile,
Quellbindungen, die begrenzte Reuse-Prüfung beider ganzen bestehenden Exams und
17 unabhängig begründete Rubrikgegenfälle. Die Gegenfälle sind keine Läufe
eines LLM-Graders und keine Wirksamkeitsstudie.

[am-revalidation.json](am-revalidation.json) enthält sechs aktuelle ganze
Ausgangszeilen und sechs `replacementWholeRow`-Objekte. Die aktuellen
A-/M-Reader wurden tatsächlich ausgeführt. Die Fingerprints ändern sich nur
durch `nodeKind`; dieser technische Befund ist nicht die Inhaltsbegründung.
[A-replacement-rows.jsonl](A-replacement-rows.jsonl) und
[M-replacement-rows.jsonl](M-replacement-rows.jsonl) enthalten je drei
patchbare Zeilen. Bei Integration bleiben alle anderen 804 Rawlines je Lane
bytegleich. Keine Memoryziele, Karten oder Decks wurden entfernt oder geändert.

Tatsächlich eigene Prüfung:

- Ganze DE/EN-Kompetenzen und alle 18 vollständigen Task-/Lösungs-/Rubriktexte;
  R-Ketten von 4/40/42 Zielen, 47 verschiedene Vorbereitungsobjekte und alle
  contains-Vorfahren. Keine zusätzlichen geerbten R.
- 28 eigene ausgeführte mathematische und wörtliche Diagrammprüfungen:
  abgeschnittener Ursprung, echte Balkenlängen und Nullbasisalternative;
  Gleichungen, ursprüngliche Proben und Nennerausschluss; Mengen/Intervalle,
  Funktionsbild, Werte und Gegenbeispiele; begrenzte Rechnungen beider Altexams.
- 134 tatsächlich strikte KaTeX-Ausdrücke in 18 Dateien, keine Fehler.
- Alle vier realen DE/EN-Screenshots bei 360/960 mit `view_image` angesehen.
  Das Diagramm ist lesbar und vollständig. Das Taskdiagramm selbst steht als
  Monospace-Text in beiden ausgelieferten `taskContent`-Strings. Die PNGs sind
  Reviewevidenz. Autor-Browsererzeugung und eigenes tatsächliches Ansehen werden
  getrennt ausgewiesen; kein eigener Browserlauf behauptet.

Die beiden bisherigen ganzen Exams wurden mit allen acht beziehungsweise
sieben direkten Vorbereitungsobjekten gelesen. Das Q4-Diagrammexam hat einen
passenden Kern, verlangt insgesamt jedoch zusätzliche Quadratik-, digitale
und Graphschnittleistungen. Das ln/Newtonexam fordert keine eigene vollständige
Funktionszuordnungsschreibweise; sein Korrekturkandidatenhinweis bleibt offen
und wird hier nicht durch das gespeicherte `released` geheilt. Beide bestehenden
Exams bleiben unverändert und erhalten hier keine neue Freigabe.

Die portable Übernahme nach
`curricula/DE/Gymnasium/assessments/mathematik/diagrams-algebra-notation-three-same-identity-2026-11-04-v1`
ist unter der präzisen Regel in `review.json` erlaubt: Originalfreeze und
Review erhalten, nur Dokumentlocators und wahrheitsgemäße Evidenzmetadaten
projizieren, tatsächliche Quell-/Zielhashes und begrenzten Diff nachweisen.
Mathematik, ganze Zielsemantik, ASCII-Diagramme, Tasks, Lösungen, Rubriken,
Scoring und Coverage bleiben exakt. Eine so nachgewiesene Kopie braucht keinen
zweiten Inhalts-/A-/M-Review.

Keine Stage-, neue Source-/Scope-, Native-, M7-, CI- oder Host-Abnahme.
Keine Root-, Autor-, Ledger-, Runtime-, Git- oder Mastery-Schreiboperation.
[review-package.manifest.json](review-package.manifest.json) versiegelt dieses
private Paket; die globale Canonical-Datei ist keine unveränderliche
Abhängigkeit, solange die drei endlichen Originalobjekte unverändert bleiben.
