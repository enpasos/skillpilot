# CQR-202: bekannte generische Lösung tatsächlich zurückweisen

Der bestehende Readinessprüfer erkennt jetzt den vollständig generischen Lösungssatz der sechs aktiven Informatik-Terminals. Die Prüfung verwendet die vorhandene Textnormalisierung und ist unabhängig von Zahlen oder Teilaufgabenmarkern im Aufgabentext. Es gibt weder Längenschwelle noch Goal-ID-Sperrliste; andere Texte werden dadurch nicht als inhaltlich richtig erklärt.

Die unveränderte CQR-202-Aggregation wurde als reine Funktion herausgezogen und im tatsächlichen Produktionspfad wiederverwendet. Die unveränderte Scopeableitung ist für den Integrationstest exportiert. Der [rote/grüne Beleg](cqr202-known-generic-exam-readiness-repair-2026-11-06.json) bindet alle vier geänderten Code-/Testfixturedateien und die tatsächlichen Logs.

Vor dem Prädikatsfix meldeten alle sechs echten Originalpayloads fälschlich `pass`; die neue Gegenprobe war rot. Danach werden alle sechs abgewiesen. Zwölf zusätzliche Varianten mit Dummyzahl/„Aufgabe 1“ oder einer echten konkreten Math-Aufgabe behalten denselben unbrauchbaren Lösungssatz und werden ebenfalls abgewiesen. Konkrete aktuelle Mathematik-/Physikaufgaben bleiben positiv, acht bestehende Status-/Fehlfeld-/Placeholderfälle negativ. Die historischen Payloads bleiben als Fixtures erhalten, damit spätere echte Inhaltsreparaturen die Regression nicht löschen.

Der Test benutzt den tatsächlichen vollständigen Integritätsreport eines gültigen Graphfixtures. Der native Weg lautet für konkrete Aufgaben CQR-202 pass → Scope M4 → Curriculum M7 → M6-/M7-Floors bestanden; für die generischen Aufgaben CQR-202 fail → Scope M2 → Curriculum M3 → beide Floorchecks mit konkretem CQR-202-Befund fehlgeschlagen. Das frühere reale Informatik-M0 wird nicht als Nachweis benutzt. Andere Anforderungen sind in diesem isolierten Fixture als erfüllt gesetzt; daraus folgt keine aktuelle Fachfreigabe.

Der vollständige vorhandene Aufruf `cd app && npm run test:deep-understanding-rollout` ist mit Exit 0 abgeschlossen. Er umfasst den neuen Block und die bisherigen strikten Graph-/Memory-/Supersession-/Retirement-/fünf-Gate-Kontrollen. Der erneute native Census über alle 925 Prüfungen ändert genau die sechs Informatik-Readiness-/Placeholderbefunde; alle übrigen 919 Ergebnisse bleiben gleich.

Der zusätzliche strenge TypeScript-Vergleich des Deep-Einstiegs enthält vor und nach der Änderung dieselben 48 bestehenden Diagnosen und keine neuen. Das ist kein grüner TypeScript-Gesamtbuild. `git diff --check` besteht.

Alle 21 kanonischen Quellen bleiben bytegleich, insbesondere Informatik `93a653…`. Keine Aufgaben, Reviewlabels, Floorpolicy, Normen oder Laufzeitdienste wurden geändert. Root muss den aktuellen CQR-Bericht separat neu erzeugen. Die sechs Aufgaben brauchen weiterhin echte Inhalte; die übrigen 919 Aufgaben oder neue Anerkennungsverträge werden hier nicht freigegeben. Unabhängiger Zweitblick angefragt; kein Commit oder Push.
