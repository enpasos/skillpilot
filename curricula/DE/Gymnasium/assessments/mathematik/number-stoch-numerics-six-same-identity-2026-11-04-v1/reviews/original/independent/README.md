# Unabhängige Inhalts- und A/M-Prüfung: sechs ganze Prüfungsformen

**Ergebnis: sechs Inhaltsfreigaben und zwölf neue A/M-Urteile.** Alle sechs
unveränderten curricularen Kompetenzen bleiben `atomic` und
`no_memory_needed`. Das ergänzte Prüfungsformat entfernt kein Ziel aus den
807 curricularen Qualitätsprüfungen. Es bleibt bei einem binären Ergebnis
je Kompetenz, 20 Punkten, einer Bestehensgrenze von 15 Punkten und einer
auf echte fehlende Kernleistungen begrenzten Gesamtpunktkappung auf 14.

Die Prüfung wurde durch den tatsächlich aufgerufenen unabhängigen Agenten
`/root/astra_six_math_whole_forms`, Modell `gpt-6-astra`, Reasoning `ultra`,
im Root-Thread `01a1880f-4ee1-72c2-a81a-cf98380ee05d` durchgeführt.
Die beiden Autoren sind nicht die Reviewer. Es handelt sich um AI-Prüfung,
keine menschliche Freigabe.

- `review.json`: vollständige sechs Inhaltsentscheidungen, Grenzen,
  Sprachäquivalenz, konkrete A/M-Begründungen, 25 beurteilte Rubrikfälle
  und genaue Quellbindungen.
- `am-revalidation.json`: zwölf patchbare Datensätze mit tatsächlichen
  Ausgangszeilen, ursprünglichen Rohzeilen, Reader-Fingerprints und
  `replacementWholeRow`. Die übrigen 801 Zeilen je Lane bleiben bytegleich.
- `A-replacement-rows.jsonl` und `M-replacement-rows.jsonl`: dieselben
  sechs Ersatzzeilen je Lane zur gezielten Materialisierung.
- `input-verification.actual.json`: 84 eingefrorene Dateien hash- und
  größengenau; alle sechs Ganzzielobjekte, alle Vorbereitungsketten und
  Quellen-/Anwendbarkeitsfelder unverändert. Die kanonische Gesamthash ist
  eine Beobachtung, keine Sperre für Änderungen an anderen Zielen.
- `mathematics.actual.json`: 34 selbst formulierte und ausgeführte
  mathematische Prüfungen, darunter sämtliche 187 RSA-Nachrichten mit
  27 nicht teilerfremden Nachrichten einschließlich null.
- `reader-and-rendering.actual.json`: zwölf geprüfte Ausgangsfingerprints
  mit den aktuellen Readerfunktionen, neue Fingerprints ausschließlich
  durch `nodeKind`, 683 erfolgreiche KaTeX-Renderings aus 36 Textdateien.
- `review-package.manifest.json`: abschließende Hashbindung dieses Pakets.

Die Prüfskripte sind beigefügt. Die fachlichen Urteile sind eigenständige
Reviewerentscheidungen; sie werden nicht aus den Autorenchecks oder einem
Fingerprint-Erfolg abgeleitet. Die Rubrikfälle sind tatsächliche inhaltliche
Anwendungen der geschriebenen Rubrik, keine behaupteten Tests eines realen
LLM-Graders. Der numerische Fall lässt insbesondere ein anfänglich bereits
hinreichend genaues Protokoll zu: Eine begründete Entscheidung, dass keine
weitere Rechnung notwendig ist, darf nicht an einem erzwungenen
Methodenwechsel scheitern.

Eine spätere portable Kopie darf die ausdrücklich in `review.json`
beschriebenen Evidenzpfade und Freigabemetadaten anpassen. Dafür sind echte
Dateihashes und ein begrenzter Inhaltsvergleich nötig. Die ursprünglichen
Autorenpakete und dieses Review bleiben erhalten.

Keine kanonische Datei, registrierte A/M-Zeile, Runtime-Datei, Git-Datei,
Lernstand oder Lernkarte wurde durch diesen Agenten verändert. Quellen- und
Länderscope, Stage, normale Autorenchecks, Native, M7, CI, Deployment und
reale Host-/Lernwirksamkeitsabnahme sind nicht Gegenstand dieser Freigabe.
