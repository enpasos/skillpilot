# Carbonyl15: normale native Eingaben, keine Reviewstimmen

`NEUTRAL.BLIND15.current-fifteen-native-inputs.json` ist der wissenschaftliche
Leseeingang für zwei neue unabhängige Reviews. Er bindet dieselben 15 unveränderten
aktuellen Ziele, ganze Prärequisiten/Eltern/Partner, 479 ganze Quellenzellen,
183 Passagen mit beiden möglichen Körperfeldern, 30 ganze aktuelle DE/EN-Fälle,
15 ganze E0/G0-Profile und die tatsächlichen nativen Artefakte.

Autoren-FIRST, Bewertungsdossiers, der unselektierte Wortlautvorschlag und frühere
Reviewdateien sind keine neutralen Leseinputs. Forschungsquellen mit ihren
bereitgestellten Materialparaphrasen sind als Material enthalten. E0/G0 ist kein
P-Gate. Dieses technische Paket erzeugt keine D/P/A/M/V-Stimmen und keine menschliche
Freigabe oder Erprobung.

Die unveränderten normalen Stockkommandos **prepare** und **check** endeten jeweils
mit Exit 0; die tatsächlichen Receipts stehen unter `checks/COMMANDS.normal-native15-prepare-check.json`.
Kein `--write`, summarize, finalize, Central oder vollständiger Build wurde ausgeführt.
Die beiden normalen Kampagnen unter `native15/round-a` und `native15/round-b` sind leer.
Ergebnisse gehören in separate Reviewerroots; dieses Paket bleibt unverändert.

`native15/bundle/book.pdf` umfasst 17 tatsächliche Seiten: zwei Frontseiten und
15 Zielseiten. Alle 17 wurden tatsächlich als gerenderte Seiten gesehen. Keine
technischen Renderfehler wurden beobachtet. Vollständige aktuelle Titel und
Beschreibungen sind im PDF vorhanden. Das ist eine technische Renderkontrolle,
keine neue fachliche D- oder V-Stimme.

Der reproduzierbare Physical Map in `checks/REBUILD.carbonyl15-current422.physical-map.json`
verwendet den aktuellen338-Map mit E36/Semantic3fd8 und aktuellem QA438-Alias.
31 unveränderte Stockmodule und 51 normale Aliase sind physisch im ignorierten Host;
nur die 15 ausgewählten Publicbilder sind physische Bildkopien. Die übrigen Bilder
sind immutable Referenzen. Der neue Host umfasst 36,899,841 physische Bytes, unter
seinem 48-MiB-Limit. Der vorhandene Vier-Kontexte-Publicbaum wird nur lesend geteilt;
ohne diesen Cache kann der Map auf die exakten Repositoryquellen zurückfallen.
Keine ganzen Repository- oder Bildbäume werden kopiert.

Die drei behaltenen PNGs stimmen in aktueller Ressourcen-URL, QA-Assethash,
Modelloriginaldigest, physischem Publicbody und Print-Derivatquelle überein.
Es wurde kein `imageBindingModes`-Override verwendet. Historische QA438-Zeilen bleiben
unverändert und sind keine wissenschaftlichen neutralen Leseinputs. Ein normales
Review-Buch ist keine menschlich freigegebene Veröffentlichung.

`FILES.finite-carbonyl15-native-technical.seal.json` bindet die endliche eigene
Dateimenge einschließlich beider Selektoren. Der lesende Verifier prüft die Menge,
Hashes, JSON/JSONL und die gebundenen Kerninputs. `book.html` und `book.pdf` sind
endliche absichtlich bereitgestellte Payloads, auch falls lokale Git-Ignore-Regeln
sie ausblenden. Keine Git-Schreibaktion wird hier ausgeführt.

**FINITE + STOP.** Die zwei neuen Reviewer beurteilen das Material eigenständig.
