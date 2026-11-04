# Drei ganze Sek-I-Prüfungsformen

Privater Autorvorschlag, alle drei Formen `draft`. Unabhängiger Inhaltsreview
steht aus. Es wurden ausschließlich Dateien in diesem Paket geschrieben.

[whole-current-and-proposed-contracts.json](whole-current-and-proposed-contracts.json)
bindet die drei ganzen aktuellen und vorgeschlagenen Goalobjekte. Nur
`nodeKind: exam` und `examData` kommen hinzu. IDs, Original-DE/EN-Texte,
Phasen, Tags, Difficulty, R, Scope/Anwendbarkeit, Quellenfelder, Medien und
alle weiteren ursprünglichen Felder bleiben exakt. Maßgeblich sind die
endlichen Originalobjekte; Änderungen anderer Canonical-Ziele sind zulässig.
Die drei bleiben `curricularAtomic`, alle 807 curricular IDs bleiben erhalten.

| ID | Vollständige ursprüngliche Kompetenz |
|---|---|
| `d668c22d-caeb-5e91-8980-721c931a2bcf` | Ein tatsächlich vorgelegtes Balkendiagramm kritisch erklären, die falsche Dreifach-Deutung verständlich korrigieren und eine konkrete klarere Alternative begründen. |
| `fa0b6b69-ce54-4711-90e6-26f27249cd71` | Klammer- und Verhältnisgleichung beide lösen, Distributivgesetz/Proportionalität mit zulässigen Nennern erläutern, die Umformungen vergleichen und Ausgangsgleichungsproben durchführen. |
| `647ec09d-68ae-57db-9ca4-aeb2da4218f1` | Mengen-, Intervall- und Funktionsnotation passend wählen, korrekt verwenden und die bezeichneten Zahlen, Mengen, Zuordnungen und Graphpunkte erläutern. |

Pro ID liegen ganze DE/EN-Tasks, Lösungen, Rubriken, der eingebettete
Execution-Contract und Before/After-Objekte vor. `current-context.json`
enthält das ganze Originalziel, Eltern, alle `contains`-Vorfahren und die
vollständigen R-Ketten (4, 40 beziehungsweise 42 weitere Ziele). Es gibt
keine zusätzliche geerbte R-Kante dieser Vorfahren.

Jede Form hat eine Gesamtbewertung 20 BE, bestanden ab 15, mit Cap 14 nur
bei fehlender ursprünglicher Kernleistung über die ganze Abgabe.
Gleichwertige Darstellungen, Leistungen an beliebiger Stelle und faire
Rechenfolgefehler sind berücksichtigt. Kein eigener Teilpassstatus;
`coveredGoalIds` enthält jeweils nur die eigene ID. Es werden keine R-
oder Consumerkanten, Source-/Scopeentscheidungen oder Mastery geschrieben.

Das Diagramm steht wirklich in beiden ausgelieferten `taskContent`-Strings,
als schmales beschriftetes ASCII-Balkendiagramm im normalen Markdown-Codeblock.
Es benötigt weder einen Bildlink noch ein Reviewbild zum Verständnis.
Der abgeschnittene Anfang90 zeigt Balkenzusätze10/30 zu Besuchszahlen100/120.
Die Lösung zeigt auch ein vollständiges Nullbasisdiagramm und eine gleichwertige
Wertetabellenalternative. Alle Aufgaben/Lösungen sind ohne Zusatzdatei verständlich.

[author-embedded-diagram-render-check.json](author-embedded-diagram-render-check.json)
prüft die tatsächlichen eingebetteten Diagrammtexte mit denselben bestehenden
ReactMarkdown-, GFM-, Math- und KaTeX-Plugins wie der aktuelle GoalCard-
Examrenderer. Im lokalen Monospace-Prüfrahmen bleiben alle Zeichen bei 360 und
960 px unverändert und vollständig ohne horizontalen Überlauf sichtbar.
[DE bei 360 px](diagram-render.de.360.png) und
[EN bei 960 px](diagram-render.en.960.png) wurden visuell angesehen.
Die Screenshots sind zusätzliche lokale Nachweise; das Taskdiagramm selbst ist
Text. Es wird keine praktische Host-Abnahme und keine neue Assetpipeline behauptet.

Vorhandene ganze Prüfungen wurden zuerst gelesen:
[existing-reuse-source-and-kind-context.json](existing-reuse-source-and-kind-context.json)
bindet beide gefundenen vollständigen Exams und ihre ganzen Vorbereitungsobjekte.
`7337049a` prüft einen passenden Diagrammkern in einer breiteren Q4-Aufgabe
zu Quadratik, digitalen Kontrollen und Graphschnittpunkten. Das ganze Exam
verlangt echte zusätzliche Q4-Vorbereitung und ersetzt keine eigenständige J7-Form.
`4c319dfd` ist eine Q4-Aufgabe zu ln/Newton; sie verwendet Mengen/Intervalle,
verlangt jedoch keine eigene vollständige Funktionszuordnungsschreibweise.
Sie würde außerdem zusätzliche höhere Vorbereitung in den J8-Fall tragen.
Für das Vergleichsziel gab es keinen aktuellen expliziten Coverage-Treffer.
Bestehende Exams bleiben unverändert. Vorhandene Source-/Kind-Zeilen sind
als Kontext beigefügt; sie werden weder neu freigegeben noch geändert.

Ausgeführte Autorprüfungen:

- [author-exact-mathematics.json](author-exact-mathematics.json): 20 echte
  Prüfungen der eingebetteten Balken/Ticks, Zahlenverhältnisse, korrigierten
  Nullbasisdarstellung, Gleichungen/Originalproben, Nennerausschlüsse,
  Mengen/Intervalle und Funktionswerte/Bildmenge.
- [author-contract-AM-and-katex-check.json](author-contract-AM-and-katex-check.json):
  drei noch exakte Originalobjekte, ausschließlich zwei neue Felder, exakte
  DE/EN-Einbettung, 20/15-Summen, sechs passende aktuelle A/M-Fingerprints
  anhand der tatsächlichen Reader und 134 erfolgreiche strikte KaTeX-Renderings.
- [author-rubric-countercases.json](author-rubric-countercases.json): 13
  begründete Fälle zu Kernlücken, zulässigen Alternativen, Objektdeutung und
  fairen lokalen Fehlern; keine behaupteten LLM-Grader-Tests.

Die sechs ganzen aktuellen A/M-Zeilen stehen in
[registered-current-AM-context.json](registered-current-AM-context.json).
`nodeKind` ändert ihre Fingerprints; diese technische Tatsache ist keine
inhaltliche Freigabe. Die Autorbegründungen in
[author-whole-identity-and-AM-rationale.json](author-whole-identity-and-AM-rationale.json)
sind ausdrücklich für den echten unabhängigen Review bestimmt.
Es wurden keine A/M-Ledger, Memorygoals oder Decks geändert.

`author-freeze.json` fixiert den ganzen Autorenstand für den unabhängigen
Review. Bitte alle Originalkompetenzen und vollständigen DE/EN-Formen,
Mathematik, Diagrammverständlichkeit, gewöhnlichen Rubriken, R-Erhalt und
A/M inhaltlich eigenständig beurteilen. Kein unabhängiges Urteil wurde vom
Autor eingetragen. Finale reviewed Stage, Integration und Native-Messungen
bleiben beim Root; dieses Paket behauptet keine Runtime-Wirkung, CI oder M7.
