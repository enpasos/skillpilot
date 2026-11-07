# Informatik: zusätzliche QA-Prüfung für 39 + 166 Felder

Der [unabhängige Inhaltsreview](informatics-whole-exam-foundation-successor-independent-review-2026-11-06.md) bleibt als damaliger Zwischenstand bytegleich. Dieser [QA-Zusatz](informatics-whole-exam-foundation-successor-independent-qa-impact-2026-11-06.json) beantwortet die dort offene Frage zu den 166 zusätzlich materialisierten Applicability-Feldern. Geprüft wurden unveränderte Quelle `5921c402…`, 39er-Kandidat `b07f3f77…` und vollständiger Kandidat `93a653b1…` ausschließlich im RAM.

Alle 414 vorhandenen A/M-Records (207 je Familie) und alle 28 Kartenrecords bleiben mit den tatsächlichen nativen Fingerprintfunktionen frisch. Kein Record wurde nachgeführt. Diese schmalen Goal-Review-Fingerprints berücksichtigen weder Requires noch Applicability und belegen deshalb keine neue didaktische, Quellen- oder Praxisfreigabe.

Die tatsächlichen zentralen und eigenständigen Memory-Sichtbarkeitshelfer ergeben jeweils unverändert 18 konfigurierte Views, 94 Sichtungen von `memory_required`-Zielen, keine fehlenden Kartenangebote und keine Fehler. Diese Helfer prüfen Targetrollen und Kursfilter, ausdrücklich keine Jurisdiktionen. Sie ersetzen nicht den getrennten Beleg der 28 geänderten tatsächlichen Lernerscopes.

Die kanonischen CQR-Zähler bleiben bei 282 Zielen, 237 atomaren Zielen und 45 Clustern. A/M-Scope und der tatsächliche CrossStage-Routenselektor enthalten unverändert dieselben 207 Ziele. Die aktive D/P-Registry enthält kein Informatik-Subjekt: Ihr strikter `curricularAtomic`-Nenner bleibt für Informatik unregistriert; es wird kein neuer Nenner oder D/P-Erfolg erfunden. Historische unregistrierte D/P-Artefakte wurden nicht vollständig inventarisiert.

Die native SemanticKind-Sourcebindung und der positive Review-Input ändern sich durch die 39 Requires-Operationen bei genau 39 Zielen. Die zusätzliche Applicability-Materialisierung ändert daran nichts. Der schmale positive Semantikfingerprint bleibt ebenfalls unverändert. Dies ist eine Prüfung vorhandener Inputverträge und keine Freigabe fehlender Informatik-D/P-Belege. Der gelesene Java-Practice-Fingerprint bindet direkte Requires und keine Applicability: 39 geänderte Inhaltsinputs, keine zusätzlichen durch die 166 Felder. Es wurden weder Java-Practice ausgeführt noch private Receipts gelesen oder aktualisiert.

Die rohe Quelldatei ändert sich dennoch. Vollständige Snapshot-, Report- oder Quellenhashbindungen werden dadurch nicht aktuell; für sie gelten ihre eigenen Frischeverträge. Ein vollständiger CQR-Generatorlauf, echte Maturity-/Floor-Ergebnisse und die nach Anwendung nötigen Gates sind nicht Gegenstand dieses Checks.

Im engen Umfang besteht kein zusätzlicher fachlicher Hold für 39 + 166. Root entscheidet die ausdrücklich eigene Supplement-/Sichtbarkeitspolitik und prüft die reale Anwendung. Die 59 G17-Befunde, sechs unveränderten Platzhalterprüfungen und fehlenden Praxis-/D/P-Nachweise bleiben offen. Keine Quelle, kein Deck, keine View, kein QA-Record und kein Lernerzustand wurden verändert.

Reproduktion vom Repository-Root mit dem [lesenden Prüfer](verify_informatics_whole_exam_successor_qa_impact.ts):

```bash
app/node_modules/.bin/tsx docs/dev/ci-graph-repairs/verify_informatics_whole_exam_successor_qa_impact.ts
```

Der Prüfer rekonstruiert beide Kandidaten im RAM, prüft ihre exakten Hashes und schreibt ausschließlich einen lokalen Ergebnisbeleg unter `tmp/`.
