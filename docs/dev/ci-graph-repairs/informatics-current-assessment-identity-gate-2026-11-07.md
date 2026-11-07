# Aktuelle Prüfungsdefinitionen sind Teil des harten Meilensteingates

Der übernommene technische Folgeschritt bindet Informatik-CQR204 an die
tatsächlich gelesenen Quellen und Viewdateien. Für die derzeit aktive Quelle854
werden alle24 Prüfungsdefinitionen erfasst:14 deklarierte Abdeckungen und10
weiterhin unbekannte Felder. Vergrößerte Cluster, vertauschte Atome,
veränderte Aufgaben oder Bedeutungen sowie gelöschte Definitionen erhalten
keinen Pass durch einen lediglich passend aussehenden Statusbericht.
`requires` wird dabei nicht als Prüfungsabdeckung interpretiert.

Dies ist ein technischer Identitäts- und Umfangsschutz, kein Nachweis der
fachlichen Richtigkeit beliebiger Aufgaben. Es wird kein neuer
PR83-Anerkennungsvertrag und keine LearningUnit-Runtime eingeführt. Die
[anschließend geklärte Ownerentscheidung](informatics-retained-contract-result-gap-2026-11-07.md)
verlangt keine Übernahme bisheriger Informatikergebnisse. Die dort vorgesehene
fachliche Sourcebereinigung ist noch ein eigenes Changeset. Dieser technische
Nachweis erklärt weder historische12/20-Pässe zu Vollkompetenz noch fordert er
eine Historienruntime für deren Erhaltung.

## Tatsächliche Durchsetzung

`app/scripts/lib/retainedAssessmentCoverage.ts` prüft das feste Quellinventar,
native Abdeckungsauflösung und geschützte Definitionen. Der Producer in
`generateCurriculumQualityStatus.ts` erzeugt den erwarteten Kontext aus seinem
eigenen Inputframe. `curriculumAssessmentValidation.ts` verlangt denselben
vollständigen Nachweis sowohl für die Meilensteinberechnung als auch beim
separaten Aufruf von `checkCurriculumMaturityFloors.ts`. Ein kopierter
Berichtshash oder frei erfundener Kontext ersetzt ihn nicht. Konkrete
Bedeutungs- und Erstdefinitionsbindungen sind weiterhin leer. Andere Fächer
erhalten durch diesen Schritt keinen behaupteten historischen Identitätsguard.

Der vorangegangene Fehlalarm bei bloßen Textnennungen einer gehaltenen ID ist
behoben: Geprüft werden die mit den vorhandenen nativen Viewfunktionen
aufgelösten echten Referenzen und Rollen. Eine Beschriftung wird nicht zu einer
aktiven Prüfung. Eine echte unzulässige Target-/Support-/Subtree-Referenz
bleibt ein Fehler. Der bestehende CQR104- und Routenvertrag ist unverändert;
die zusätzlichen V3-Angebote sind nicht Teil dieser Übernahme.

Die tatsächliche CI-Kette lautet `CI / Curriculum CI` →
`npm run test:deep-understanding-rollout` → `testDeepUnderstandingRollout.ts`
→ `testCurriculumExamReadiness.ts` → die neuen Identitäts-, View- und
Consumergegenfälle. Sie läuft bei Code-PRs gegen main, Code-Pushes auf main
und manuell; Fehler lassen den Job scheitern. Es gibt keinen optionalen
Warnungspass. Die aktuellen 20 Regelgruppen,25 strukturierten Viewfälle und
T21 laufen damit im vorhandenen aufgerufenen Entry.

## Geprüfter aktueller Stand

Der frische aktive Entry besteht. T21 zeigt im ausdrücklich synthetischen
Kontrollbestand M6 und einen erfolgreichen Floor; genau eine hinzugefügte
Abdeckung senkt den Meilenstein auf M3. Ein gefälschter M7-Pass mit weiterhin
korrektem Dateihash wird vom separat gestarteten Floor-CLI abgewiesen. Das ist
ein mechanischer Positiv-/Negativnachweis und kein echter Informatik-M6-Pass.
ESLint für alle sieben betroffenen TypeScriptdateien besteht ebenfalls.

Der reguläre Gesamtproducer einschließlich aller zehn Karten-Vorprüfungen
endet mit Exit0. Alle1021 geschützten Eingaben bleiben dabei unverändert;
genau die zwei gewöhnlichen Meilensteinberichte ändern sich. Der tatsächliche
anschließende direkte Floor-CLI endet weiterhin mit Exit1 für sieben Fächer.
Untergrenzen und Ausnahmenliste bleiben unverändert. Berichtstand ist
**2026-11-07T08:37:10.274Z**: Deutsch, Geschichte und Latein M6; die übrigen
sieben geschützten Fächer M0. Informatik hat24 Definitionen, sechs echte
Materialfehler und37 G17; sein Identitätsnachweis ist vollständig. PoWi hat
nach den sechs zusätzlich geprüften Kürzungen593 statt599 Befunde, davon116
statt122 G17. Aktive V-Kontexte bleiben74/2483.

Der erste isolierte Root-Entry hatte keinen beschreibbaren Repo-tmp-Mount;
nach20+25 Fällen fehlte daher das T21-Arbeitsverzeichnis. Sein Fehler bleibt
erhalten; der vollständige Nachlauf mit privatem beschreibbarem Scratch besteht.
Ein früherer Gesamtproducer wurde mit Exit143 beendet; sein tatsächlicher
Child war anschließend nicht mehr vorhanden. Der unveränderte normale
Folgelauf ist der hier bezeichnete Exit0. Es gab kein Deployment.

Die [gesicherten Rohbelege](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/retained-gate-powi-six-normal-cqr/summary.json)
trennen Producer, tatsächlichen Floorfehler und Testkontrollen. Ein neuer
Remote-Lauf dieses gesamten Code-/Reportstandes ist noch erforderlich.
