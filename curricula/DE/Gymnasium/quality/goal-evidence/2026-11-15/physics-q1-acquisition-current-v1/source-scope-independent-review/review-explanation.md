# Unabhängige technische Gegenprüfung des CQR-003-Scopes

**Finale Entscheidung: den stabilen Generator-Kandidaten`ffe2b5e59ee80677ecdef7f4d0b2f2095d60c5eb1a69125d73da9f4de63767c1` annehmen.** Die zuvor negative Entscheidung zum reinen Frontend-Applicability-Zwischenpatch bleibt ausdrücklich bestehen. Keine Quelle, kein Curriculum, kein aktiver QA-Datensatz, kein Git-Zustand und kein abgeschlossener D2-Reviewrecord wurde von diesem Reviewer verändert.

Gebundener nativer Test:`testSourceCoverageScopeNative.ts`, SHA256`48460e295b7d190f322d3eca90e243962b9c5b2af007af37efa5a962383119a3`. CI-Importdatei:`testCurriculumQualityStatus.ts`, SHA256`294ad2d71a353514a4f8c64c3912999df9ca593c353b8c1b9421a6e5dd182fe4`.

## Konkrete ursprüngliche Ursache

Die eigene native69-View-Messung ergab für677a192d undd61ea362 genau28 unfiltrierte Fremdland-Ziel/Land-Paare in14 aggregierten Landesmengen. Das sind deduplizierte Landeszuweisungen, nicht28 verschiedene Ziele oder notwendigerweise14 physische Dateien. Mit den erklärten Landes-/Kurs-/Dauerscopes verschwinden diese28 Fälle; beide Ziele bleiben inBayern Target.

Die tatsächlich bereitgestellte72-API/UI-Messung auf kanonischem Physikstandb391 wurde für genau diese beiden Ziele unabhängig ausgewertet. In allen66 Kontexten mit einem anderen ausgewählten Land sind beide Ziele weder Seed noch Teil der Lernbasis. Nationale Default-Kontexte und die einschlägigen BY-Kontexte behalten sie. Das ist eine eigene Auswertung des gelieferten tatsächlichen API-Artefakts, kein neuer eigener API-Lauf.

Für diese beiden Ziele ist damit der ungefilterte Audit-Collector die Ursache der28 falschen Fremdlandzuweisungen. Ihre bloße Erreichbarkeit über breite kanonische Unterbäume rechtfertigt keine Fremdland-Quellenbehauptung und keine View-/Quellenmutation.

## Weshalb der Zwischenpatch abgelehnt wurde

Der erste Patch reichte die deklarierten Scopewerte an den Frontend-Baumcollector weiter. Diese semantische Gleichsetzung war zu eng. Der gelesene Backendpfad wählt atomare Seeds mit expliziter Applicability **oder** direkter Provenienz/Mappingzuweisung und ergänzt Strukturvorfahren. Bei bayerischer Mathematik bestimmt außerdem der authored View den Kurs; alte GK/LK-Goal-Tags schränken ihn dort nicht nochmals ein.

Der konkrete aktuelle Gegenfall ist`2f8a3a90-717d-5ac1-b54e-facca26e9008`. Die bereitgestellte tatsächliche API enthält ihn beiBY-G9-CrossStage-LK undGK+LK alsSeed und Lernziel; beiGK nicht. Die gespeicherte Applicability nenntBY nicht. Eine eigene aktuelle Compilerprüfung bestätigt aber: gespeicherte und kompilierte Applicability sind gleich, für dieses Ziel gibt es0APV-203 und keine BY-Goalreport-Evidence. Der vorhandene direkte partielle BY-Mappingpfad bleibt dennoch ein Backend-Selektionsgrund. CQR501/APV203 beseitigt diesen tatsächlich ausgelieferten Gegenfall also nicht.

Ein zusätzliches Detail des ersten eigenen API-Auszuges war falsch: DieUUID für24174 wurde von mir aus einem Präfix fehlerhaft vervollständigt. Der alte Auszug ist erhalten und für dieses Feld ausdrücklich nicht aussagefähig. Die neue`api-math-task-extract-v2.actual.json` liest alle vollständigen IDs direkt aus der gelieferten Diagnose. Das tatsächliche`24174bba-a654-5f81-8de3-ca5bd09d9b6f` ist inBY-GK/LK/GK+LK keinSeed, aber in der Lernbasis. Der zentrale2f8-Gegenfall bleibt unverändert und wird nur auf die richtige vollständigeUUID gestützt.

Die Zwischenentscheidung ist eigenständig in`intermediate-scope-review.REJECTED.json` erhalten. Sie wird weder gelöscht noch nachträglich als Annahme des ersten Patches umgedeutet.

## Warum der finale Reader die Fälle korrekt behandelt

Die globale Target-/`prerequisiteOnly`-Rolle wird zuerst aus dem tatsächlich authored View aufgelöst. Anschließend wird die Eignung jedes atomaren Targets unabhängig von der Eignung seiner Strukturvorfahren geprüft. Unpassende Eltern dürfen einen passenden Backend-Seed nicht unsichtbar machen. Unterstützung wird dadurch kein Target.

Der Landesfilter verwendet die explizite Applicability oder dieselben rohen direkten Provenienz-/Mappingzuweisungen als zusätzlichen Selektionsgrund. Er ersetzt diese nicht durch die späteren Coverageurteile und auch nicht durch die bei Assessment-`fromRequires` abweichende kompilierte Evidence. Die vorhandene allgemeine BY-Mathematik-Kursregel und die gegebenen Kurs-/Dauerbedingungen bleiben erhalten. Der nationaleDE-Sentinel schränkt keine Landeszugehörigkeit ein; kursneutrale Sichten erzwingen keinen willkürlich ausgewählten Kurs.

Die Quelleneignung wird danach weiterhin getrennt und unverändert geprüft. Der Reader darf eine erklärteHE-Sichtbarkeit mit ausschließlichBY-Quellenevidenz also nicht zum Verschwinden bringen. Eine rohe Zuweisung ist keine automatische Quellenfreigabe.

Der zweite wichtige Fix unterscheidet die Präsenz eines Views von dessen nichtleerer Menge. Vorhandene leere Landesmengen bleiben ausdrücklich leer. Weder Vorwärtsabdeckung noch Reverse-Source-Coverage fällt hierfür auf größere Compiler-Zielmengen zurück. Eine vorhandene leere nationale Targetprojektion führt ebenfalls zu einem ausdrücklichen Fehler; ursprüngliche Quellenverpflichtungen werden nicht verkürzt.

## Tatsächlich ausgeführte Prüfungen

Der vollständig gelesene native Autorentest wurde in einem eigenen Prozess tatsächlich ausgeführt. Seine Fixtures wurden durch eine reine Pfadanpassung ausschließlich im eigenen neuen TMP-Verzeichnis erzeugt. Es wird keine unabhängige Urheberschaft an diesem Autorentest behauptet.

Ergebnis: aktuelle Physik-Source-CoveragePASS; tatsächlich sichtbares unbelegtes HE-ZielFAIL; leere oder unbekannteHE-ViewsFAIL; nationale Views mit ausschließlich`prerequisiteOnly`-InhaltenFAIL. Quellen-Original-/Atomverpflichtungen bleiben bei den Leerproben gleich. NeutraleGK/LK-Sichten, nationalerDE-Sentinel, Dauerfilterung, atomare Elterntrennung und der reale BY-Mappingfallback bestehen. Der Testprozess endete mitExit0.

Zusätzlich wurden eigene gezielte Gegenprüfungen ausgeführt:

- Beide Physikziele bleiben im finalen Reader BY-Targets und sind in keiner anderen Landesmenge Target.
- Der aktuelle2f8-Readerfall bleibtBY-LK enthalten undBY-GK ausgeschlossen, im Einklang mit der tatsächlichen API-Messung.
- Ein konstruiertesHE-applicablesGK-Atom unter einemHE-applicablen, aberLK-markierten Parent verschwindet im älteren Baumfilter. Der finale atomare Reader erhält dieses Kind. Die Landesmetadaten von Parent und Kind widersprechen einander dabei nicht; die grafische Elternhülle bestimmt die atomare Kurseignung nicht.
-185 kritische Code-/Katalog-/Physik- und Mathematik-View-/Registry-Pins blieben während der finalen eigenen Prüfung unverändert.

Diese lokalen Prüfungen belegen die geforderten konkreten Fälle und erhalten eine harte negative Probe für tatsächlich sichtbare unbelegte Landesziele. Sie sind keine pauschale Behauptung über jeden denkbaren Backendzustand. Die separate All21-/Routenprobe des QA-Agenten und Root-TS/Lint-Prüfungen sind fremde ergänzende Evidenz, keine hier selbst ausgeführten Läufe.

## Abschlussgrenze

Dies ist eine technische Gegenprüfung nach abgeschlossenen D2-Reviews. Sie ändert weder deren Records noch deren Entscheidungsgegenstand. Alle eigenen Schreibvorgänge erfolgen ausschließlich unter`tmp/physics-cqr003-scope-independent-20261115/`; das retentionsfertige Auswahlmanifest benennt die kleinen tatsächlich geprüften Belege für den Finishagenten.

Keine tatsächlichen Lernendenresultate, neue offizielle Quellenansprüche, erweiterten Landeszuordnungen, Qualitäts-Gateausnahmen, tatsächlichen neuen Karten-/API-Läufe, vollständigen Status-/Main-CI- oder Releaseabnahmen werden daraus erfunden.
