# Lokaler Publikationsabschluss – fünf Bücher

Nach Roots Stabilitätsmeldung wurden die originalen npm-Kommandos genau einmal und in dieser Reihenfolge ausgeführt:

1. `npm --prefix app run build:goal-books`
2. `npm --prefix app run check:goal-book-publication`
3. `npm --prefix app run test:goal-book-original-sources`

Alle drei Exitcodes sind0. Je Befehl liegen unveränderte stdout/stderr-Rohlogs sowie tatsächliche Start-/Endzeiten und monotonic gemessene Dauern vor. Kein Zusatzargument, Subjectfilter, `--force`, Guardbypass oder erneuter Reviewlauf.

Der Builder hat Chemie mit410 Zielseiten neu gerendert; Mathematik, Physik, Biologie und Wirtschaftswissenschaften wurden nach seinen echten Input-/Output-Hashprüfungen wiederverwendet. Bei allen vier wiederverwendeten Büchern sind Model, Originalquellenindex, PDF und Manifest vor/nach bytegleich. Alle fünf Bücher bestanden sowohl die interne Builderprüfung vor der gemeinsamen Übernahme als auch den nachfolgenden originalen Publikationscheck.

Die tatsächliche Chemiepublikation hat410 eindeutige Zielseiten und fünf Vorspannseiten, insgesamt415 physische PDF-Seiten. Der erzeugte Originalquellenindex enthält30 Dokumente und10887 Belege für7397 Geltungszeilen; keine dieser Zeilen ist ohne Beleg. Dies sind generierte Quellenbeobachtungen einschließlich ihrer unterschiedlichen Belegarten; sie bescheinigen keine ganze amtliche Quellendeckung oder neue fachliche Freigabe.

`OBSERVATION.actual-five-book-output-manifest-pins.json` enthält die fünf Manifestpins und alle tatsächlichen Outputpins. `OBSERVATION.actual-chemistry-410-pagination-and-source-bindings.json` ordnet jede der410 Zielseiten ihrer tatsächlichen logischen/physikalischen Seite, Manifest-Fingerprints und dem Quellenindex-Locator zu. Die Dateien unter `app/public/lernzielbuch` sind ignorierte generierte Outputs, keine portablen Reviewinputs; sie wurden nicht in dieses Paket kopiert oder verlinkt.

Nur der originale Builder änderte generierte Publikationen/Cache; der Wrapper schrieb das neue technische Paket. Keine Source-, C/P-, DAG-, View-, Central- oder Normalindexeditierung durch diesen Auftrag, keine zusätzlichen fachlichen/native Voten. Kein Stage, Commit, Deploy, Gesamt-M7- oder CI-Pass wird behauptet. Roots paralleler Standardlauf wird hier nicht bewertet.
