# Chemie 437: technische Übernahme tatsächlich geprüfter Nachweise

Dieses Paket führt die aktuelle unabhängige Neunerprüfung mit den weiterhin gültigen 428 Alt-Nachweisen zusammen. Es ist keine weitere Fachprüfung und keine Behauptung menschlicher Freigabe. Die tatsächlichen ersten unabhängigen Fachurteile sind A `dbdbefe4b37fa1dc2d314b647d1a275d81715783a9c2b6c76ef17ce846d97d4a` und B `70cc3fe9a98d1bd1738f00cf8183d51b37a865373b4ee3e14f3cf2b55b665fc3`. Der neue native D-Index enthält die tatsächlich finalisierten zwei unabhängigen Runden und neun strengen Abschlüsse.

## Exakte Übernahme

- A/P: jeweils 428 bestehende Nachweise bleiben als vollständige Originalzeilen erhalten. Nur fünf betroffene alte Konfigurationen pro Gate erhalten gefilterte Nachfolger mit unveränderter ursprünglicher Review-Identität. Neun tatsächlich aktuelle unabhängige Nachweise ersetzen sieben bestehende Besitzer und ergänzen zwei neue Ziele. Das technische P9-Alias ändert ausschließlich den Kind-Ledger-Pfad auf den identischen normalen 639er-Ledger.
- D: Alle 99 historischen Indices, 201 bisherigen Supersessions, sieben Withdrawals und drei semantischen Retirements bleiben unverändert. Ein tatsächlicher Neunerindex und sieben gezielte Supersessions werden ergänzt.
- M: 428 vollständige bisherige Entscheidungszeilen bleiben erhalten. Die neun unabhängigen aktuellen Entscheidungen werden lediglich auf die technische Aggregat-Review-ID normalisiert; Originale und Ganzrecord-Vergleiche sind archiviert. Alle 79 Karten-IDs bleiben erhalten; 75 Zeilen unverändert, vier tatsächlich unabhängig geprüfte Karten als Nachfolger.
- V: Von 460 Records bleiben 451 vollständig unverändert. Neun tatsächliche unabhängige aktuelle V-Records werden übernommen; sämtliche historischen menschlichen Felder bleiben erhalten.

## Reine M4-Serialisierungskorrektur

Die tatsächliche unabhängige M4-Prüfung betraf `chem_bond_009` sowie `chem_eq_q3_008/012/013`. Zwei ursprüngliche Kartenfingerprints waren aus Rohtext gebildet; der Stock-Checker normalisiert vorher NFKC, Leerraum und Tags. Der ausdrücklich vom Root autorisierte technische Nachfolger verwendet den unmodifizierten Stock-Code. Für alle vier aktuellen Rohkarten wird zunächst der ursprüngliche A-Fingerprint reproduziert; Canonical- und Public-Ganzkarte müssen außerdem identisch sein. Dadurch wird keine geänderte Karte nachträglich als geprüft ausgegeben. Zwei Fingerprints ändern sich, wissenschaftlicher Reviewer, Zeit, Notwendigkeitsentscheidung, Herkunft und Begründung bleiben unverändert. Die Korrektur stammt ausdrücklich von der technischen Integration, nicht vom ursprünglichen Fachreviewer. Originale und Ganzrecord-Vergleiche bleiben unverändert erhalten.

## Ausführungsgrenze

Nur die isolierte L-Kapsel wird aktualisiert; Canonical639 `0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9`, H, normale R-Canonical und zentrale R-Registry bleiben unverändert. Die vier Stock-Prüfmodule wurden vor dem einzigen zentralen Check bytegenau gegen R verifiziert. Der tatsächliche Ausgang steht in `EXECUTION.actual-single-stock-central437-check.json` und dem vollständigen `CENTRAL.actual-current437.all-paired-five-gates.json`.

Ein grüner isolierter Fünf-Gate-Bericht allein ist kein M7-Abschluss: Die normale Integration, erforderliche abhängige Layer-A- und Abschlussprüfungen sowie GitHub-CI bleiben eigenständige Schritte. Menschliche Freigabe und Erprobung bleiben separat.

## Tatsächlicher Checkausgang

Der vollständige Stock-Check lief 49,33 Sekunden und bestand fünf von sechs Prüfungen: aktuelle D/P/A/M jeweils 437/437 sowie vollständige Kind-Bindungen. Der erste vollständige Bericht scheiterte ausschließlich am fehlenden isolierten Stock-Helper `scripts/goal_visualization_scope.mjs`; dieser Bericht bleibt unverändert. Nach exakter Wiederherstellung des Helpers zeigte die gezielte V-Prüfung einen echten Metadatenkonflikt: Der Stock-Generator nimmt den neuen gewöhnlichen Faraday-Knoten `0e3f849b…` wegen `nodeKind: tutor` aus dem Bildumfang heraus. Er erzeugt459statt460Records; die anderen459 Ganzrecords sind vollständig semantisch identisch. Der459Versuch ist archiviert, die tatsächlich unabhängig geprüften460Records wurden in L wiederhergestellt.

Es gab keine Canonical-Änderung und keine Aufweichung des Checkers. Vor einem weiteren vollständigen Lauf muss Root den Widerspruch zwischen gewöhnlichem Lernziel und tutor-Metadatum mit wahrheitsgemäßen aktuellen Bindungen auflösen. Deshalb wird hier ausdrücklich **kein 437/437-Fünf-Gate-Pass** oder M7-Abschluss behauptet.
