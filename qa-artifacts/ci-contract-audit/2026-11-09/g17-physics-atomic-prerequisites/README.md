<!-- SPDX-License-Identifier: Apache-2.0 -->
# Physik: atomare Voraussetzungen und V7-Nachweis

Der lokale Stand baut auf `91119f7b36b47a44b377219e8a6dd2834216b955` auf.
Er übernimmt genau die bereits geprüften Physikdaten samt V7-Wrapper und
unverändertem historischem V6-Parent sowie die zwei statisch geprüften
Testadapter. [receipt.json](receipt.json) bindet die fünf Produktdateien und
die lokalen Rohbelege mit vollständigen SHA-256-Werten.

Der mechanische Batch umfasst 2.843 geordnete Operationen: 1.319 bereits
induzierte atomare Ergänzungen, 30 nichtatomare Löschungen und 1.494 bezeugte
atomare Schnitte. Er hält 144 Quellen mit 175 Quelle/Probe-Paaren fest; 140
Arrays ändern sich netto. Der gesamte Nachweis umfasst 881 Quellen. Die zuvor
geprüfte vollständige Physik-gerootete atomare Hülle bleibt bei 40.899 Paaren.
Das ist eine mechanische Erhaltungsaussage, keine neue fachliche Bewertung.

Die übernommenen Daten sind bytegleich zum tatsächlich geprüften E:-Kandidaten.
Dessen einmaliger öffentlicher Python→Node-Aufruf bestand in **393,723 s bei
unverändertem 600-s-Limit**, mit 21 Dokumenten, 27 Cache-Snapshots und allen
766 historischen Physik-Fingerprints. Das ist ein früherer Kandidatenlauf;
die Übernahme behauptet keinen neuen Brückenaufruf. Die maßgeblichen
Compiler-/Proof-/Runtime-Bytes bleiben passend. Eine später bestätigte
Chemie-Watch-Metadatenänderung aus PR105 ist ausdrücklich im Receipt vermerkt.

`contains`, alle anderen Physikfelder und sämtliche aktuellen
Applicability-Werte bleiben erhalten; die anderen 20 kanonischen Dokumente
und der historische Deutsch-V6-Parent bleiben bytegleich. Es gibt keine
Änderung an Source-Fingerprint-Verträgen oder Lernendenzuständen.

`git diff --check` und das normale Anwendungs-Typecheck `tsc -b --pretty false`
bestanden. Dieses bestehende TypeScript-Projekt umfasst `app/src` und Vite,
keine eigenständigen Testskripte. Der neue native Physiktest prüft vor/nach dem
Batch mit denselben 27 aktuellen V7-Caches; die vier alten Regressionen bleiben
erhalten. Statische Java-/TypeScript-Parserprüfungen bestanden. Tatsächlicher
nativer Physiklauf, vollständige Live-TS-Prüfkette, frisches CQR/Floors und CI
bleiben zum Erfassungszeitpunkt offen. Gesamt-G17 oder Host-/Lernwirksamkeits-
Akzeptanz wird damit nicht behauptet. Die lokalen E:-Pfade sind keine
öffentlichen Downloads.

Der anschließende **tatsächliche Produktaufruf** des unveränderten Auditors
`--check --root 7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a` bestand in **1,017 s**:
1.041 Ziele, 1.722 Ursprungskanten, **null Minimalitätsbefunde**. Der
[unveränderte CLI-Bericht](current-physics-g17-audit.json) bindet alle21
Referenzdokumente und weist die explizite Physik-/Fremd-/Vererbungsscope aus.
Dies ist noch keine Integration in die Standard-Meilensteinberechnung;
Native, ganze TS-Kette, CQR/Floors und Remote-CI bleiben getrennt offen.

Der anschließende native Rollenbefund und der gezielte View-Nachtrag stehen im
[Nachtrag zur Voraussetzungsscope-Reparatur](projection-closure-followup.md).
