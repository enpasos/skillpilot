# Informatik: unveränderliche historische Prüfungsverträge

Diese kleine Referenz erhält die 24 vorhandenen Prüfungsidentitäten des Owners
`7d51b38c-a149-5407-bddc-d2ce7878b020`. Sie ist keine akzeptierte Fehlerbaseline,
Materialfreigabe, Anerkennung alter Ergebnisse oder neue Lernerruntime.

- Vollständige historische Quellbytes: entpackt SHA256 `85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e`.
- Exaktes Inventory: SHA256 `3a1bf33c5dff8e310cc2ebc593a8fe61017bb34d8819a965fea0ec73a9e2f891`.
- 14 nichtleere deklarierte Coverageverträge; zehn tatsächlich fehlende Felder.
  Fehlend bleibt UNKNOWN und wird niemals durch `[]` ersetzt.

`retainedAssessmentCoverage.ts` verifiziert jede Inventoryzeile aus den gebundenen
Quellbytes erneut. Die native Composition-Expansion und der native
Integrity-Checker prüfen ausschließlich erforderliche `contains`-Auflösung;
Vorbereitung, Views und Filter gehen nicht in deklarierte Coverage ein.
Geschützte Inhalte werden konservativ tief verglichen. Nur die im endlichen
Ausführungsvertrag benannten Felder werden ausgenommen; insbesondere neue
Source-/Applicability-Metadaten sind keine automatische Ausnahme.

Konkrete unabhängig geprüfte Bedeutungs- oder Erstbelegungsbindungen werden
append-only als exakte Codebindungen ergänzt. Es gibt derzeit keine konsumierte
solche Bindung. `6ebc2a67-ea20-5c4e-8a63-635f40438d6a` bleibt bis zur konkreten
geprüften Quellintegration `first-binding-pending`; das gehaltene HE-Angebot
`f37f2d37-7686-5ed7-9c20-6f83d4fd2254` darf in aktiver Quelle/View nicht auftauchen.
Eine `same-declared-contract-repair` darf ausschließlich neues, vollständig
geprüftes Material innerhalb derselben deklarierten Leistung bestätigen. Sie
bescheinigt weder das alte defekte Material noch alte Pässe rückwirkend.

Coveragegleichheit allein trägt keine Material-/Ergebnisäquivalenz. Notwendige Leistungen, Bestehensgrenze und Ergebnisbedeutung brauchen den exakten unabhängigen Beleg; eine stärkere neue Ergebniszusage braucht eine neue prospektive Ergebnisidentität. Keine solche Bindung ist hier gesetzt.

Der historische Nachfolger braucht eine neue Datei/Revision. Ein Generator darf
diese Referenz nicht aus der aktuellen Quelle überschreiben.
