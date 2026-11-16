# Quellenleser-Parität: eigener fokussierter Fix

Der tatsächliche CI-Fehler aus Lauf `43802414456`, Job `133094868426`, ist als dekodierter Originaltext verlustlos gzip-komprimiert erhalten. Er meldet die beiden BY-Atome `d61ea362` und `677a192d` in vierzehn Länderzielen ohne Quellenabdeckung. Das ist derselbe Fehler wie in den zuerst gemeldeten HE-/BB-Beispielen, kein Anlass für erfundene Quellenzuordnungen.

Ursache: `collectAuthoritativeTargetAtomicGoalIds` projizierte rohe kanonische Unterbäume, ohne die atomare Land-/Kurs-/Dauer-Auswahl anzuwenden. HE und BB binden den ganzen Cluster `9645f0d8` ein; seine beiden BY-Kinder wurden deshalb fälschlich mitgezählt. Die retained tatsächlichen API-Antworten enthalten beide Ziele in den zwölf HE-/BB-Kontexten weder in S noch in L. `retained-actual-api-membership.actual.json` hält diesen gelesenen historischen Befund fest, ohne frischen API-Lauf zu behaupten.

Der begrenzte Produktionsfix exportiert nur die bereits im CQR-003-Leser verwendete Funktion `sourceCoverageAtomicScopeMatcher`. Der eigenständige Quellenleser ruft genau diese bestehende Funktion für atomare Targets auf. Eltern werden nicht nach Applicability abgeschnitten; direkte rohe Mapping-/Provenienzbindungen bleiben neben Applicability gültig, einschließlich der tatsächlichen BY-Mathematikregel für die Kursauswahl. Quellenqualität wird erst danach bewertet: Ein tatsächlich HE-exponiertes, aber unbelegtes Atom bleibt im Nenner. Die Importdatei besitzt bereits eine CLI-Einstiegswache; der Import führt keine Statusgenerierung aus.

Die neue Regression prüft reale HE-/BB-Ausschlüsse, reale BY-Physikziele, den direkt zugeordneten BY-LK-Mathematikfall `2f8a3a90` trotz fehlendem BY in dessen Applicability sowie seine tatsächliche Abwesenheit in GK. Ein künstlich wirklich HE-exponiertes Atom muss weiter sichtbar bleiben. Die bisherige Rollenfixture erklärt ihren bereits beabsichtigten HE-Geltungsbereich jetzt ausdrücklich. Target-/Supportrollen und Quellenpflichten werden nicht gelockert.

Eigene tatsächliche Prüfungen:

- `npm run quality:source-coverage-audit:check`: Exit 0, 25/25 Tests, 0 übersprungen; danach vollständiger Quellen-Audit PASS.
- `tsc -b`: Exit 0.
- ESLint der drei geänderten Dateien: Exit 0.
- Eigene achtteilige Leseprobe vor/nach: In HE/BB beide IDs true → false; BY-Physik bleibt true; die direkt zugeordnete BY-Matheaufgabe bleibt LK true / GK false.

Nur drei Produktions-/Testdateien sind Teil dieses Fixes; der genaue Diff und die Endpins werden separat gebunden. Keine Quelle, Zuordnung, Curriculum-ID, R-Kante, View, QA-Freigabe oder Lernergebnis wurde durch diesen Readerfix verändert. Das ist Autorenarbeit mit tatsächlichen eigenen Tests; Roots unabhängiger Diffreview und neue Remote-CI sind gesondert. Die gleichzeitig durch Root vorgenommenen nationalen Reihenfolgeänderungen gehören nicht zu diesem Readerdiff.
