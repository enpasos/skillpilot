# Lernzielbuch: gezielter CI-Nachtrag

Der [fehlgeschlagene CI-Job](https://github.com/enpasos/skillpilot/actions/runs/43771585566/job/132988529549)
konnte am Commit `069fd6cf4f…` die notwendige Chemievorbereitung des
Physikziels zum Ruhepotenzial nicht auflösen. Die explizite externe Buchquelle
fehlte; das kanonische Chemieziel selbst war vorhanden.

Der Nachtrag bindet die vorhandene Quelle ein, validiert fremde Ziele in den
Quellenansichten und hält Buchseiten und Navigation auf das Hauptfach begrenzt.
Drei inzwischen vorhandene Physikziele ergänzen die Buchausgabe auf 484 Seiten;
die reine Vorbereitungsbrücke erhält keine eigene Zielseite. Die bereits im
kanonischen Eingang gebundenen Länderangaben begrenzen breite Quellenansichten.
Die neue Prüfung unterscheidet diese Buchkennzeichnung ausdrücklich von der
Auswahl des persönlichen Curriculums.

Der [unabhängige technische Review](review.md) dokumentiert echte Modell- und
Runtimeparser-Aufrufe, Gegenproben und das Inventar aller fünf Bücher.
Die ergänzende Physik-Inputtestdatei ist von diesem ersten Review ausdrücklich
ausgenommen. Ihr späterer Stand braucht einen getrennten Nachweis.
Der vollständige PDF-Build, die lokalen Tests und die neue Remote-CI sind
ebenfalls getrennt zu bewerten; die Modellprüfung behauptet sie nicht.

Dieser getrennte Nachweis liegt inzwischen vor: Der
[abschließende Testreview](physics-input-test-review-addendum.md) akzeptiert
die finale Physik-Inputtestdatei mit `7204b0e2…`; der echte Fokustest und
ESLint bestehen. Die historischen Material- und V9-Nachweise bleiben unverändert.
Die lokale Nachweisdatei `local-validation.actual.json` bindet die acht
geänderten Code-/Konfigurationsdateien und die tatsächlich erfolgreichen
lokalen Ausführungen. Alle fünf Bücher sind mit `--force` vollständig gebaut
und validiert, zusammen 2.457 Zielseiten. Remote-CI und Integration bleiben offen.

Die Rohbelege sind bytegleich erhalten; `retention.actual.json` nennt die
ursprünglichen Pfade und Hashes. Die zwei Prüferskripte liegen als `.txt`
vor und dokumentieren ihre ursprüngliche Ausführungsumgebung. Der alte
CI-Joblog ist verlustfrei komprimiert. Historische Fehlversuche werden nicht
zu erfolgreichen aktuellen Ausführungen umetikettiert.
