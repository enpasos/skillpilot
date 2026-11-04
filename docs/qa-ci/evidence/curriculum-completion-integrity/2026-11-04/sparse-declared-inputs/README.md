# Deklarierte Generator-Eingaben im schlanken CI-Checkout

Der Mathematikjob auf `c608f2e032` brach vor der Corpusprüfung ab: Die neue
quellengeprüfte Zuordnung zweier bestehender Prüfungen verweist auf eine
Reviewdatei im ansonsten ausgeschlossenen Qualitätsordner. Der reguläre
Generator benötigt diese Datei; die bisherige Eingabeermittlung ließ sie aus.

Das gemeinsame Eingabeinventar berücksichtigt nun die ausdrücklich gebundenen
Entscheidungen, Zulassungsdaten und ursprünglichen Ansichten des normalen
Erzeugungsplans sowie dessen Policy. Bei einem zunächst fehlenden Plan liest
es dessen deklarierte Referenzen aus dem lokalen Git-Index. Historische Pfade
innerhalb von Reviewberichten werden nicht verfolgt; unbeteiligte
Qualitätsarchive bleiben ausgeschlossen. Die Reportprüfung bindet die
zusätzlichen tatsächlichen Eingabebytes ebenso streng wie bisher.

30 Vertragsprüfungen bestehen, einschließlich einer echten Git-Sparse-Fixture,
fehlender und geänderter Reviewdateien sowie unzulässiger Pfade. Eine zusätzliche
Reproduktion mit den tatsächlichen Workflowmustern und dem unveränderten
Produktionsmerger zeigt den ursprünglichen Fehler und anschließend den PASS
aller 39 kombinierten Dokumente und 46 Kursvereinigungen. Alle 147 Ansichten
bleiben bytegleich; nur fünf deklarierte Eingabepfade kommen zum Inventar hinzu.
Die dafür angelegte lokale Checkoutkopie wurde anschließend entfernt.

[Ausführung und genaue Bindungen](execution.json),
[ursprünglicher Fehler](original-guard-failure.log),
[erfolgreicher Generatorlauf](final-guard-pass.log).

Der Nachweis betrifft die CI-Eingaben. Er behauptet keinen vollständigen
Mathematik-, M7-, Backend- oder CI-PASS.
