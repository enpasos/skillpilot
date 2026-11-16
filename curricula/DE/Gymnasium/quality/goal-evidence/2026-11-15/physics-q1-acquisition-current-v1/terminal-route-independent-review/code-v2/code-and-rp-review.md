# Unabhängiger Review des konkreten Materialisierungscodes und RP-v1-Kandidaten

## Codeentscheidung

Der tatsächlich gelesene Materialisierungscode ist fachlich und vertraglich geeignet. Es verbleibt nach den unten genannten Kontrollen kein blockierender Befund am begrenzten nationalen Kompatibilitätsabgleich. Der Code ist keine Implementierung einer neuen hybriden Learner-Ansicht.

Die fünf nationalen View-IDs haben ausdrücklich benannte Gesamtview-Quellen. Quellen werden auf Landschaft, Landfreiheit, CrossStage, Schulform, Dauer und einen gegebenen Kurs geprüft. Fehlende/duplizierte Quellbindungen und Quellenidentitäten sowie fehlende/abweichende Landesautoritäten erzeugen Fehler. Für den kursneutralen SekI-View müssen beide tatsächlich verfügbaren Kursprofile gebunden sein; ihre nach derselben Landesautorität relevanten Stufen-Target- und Sichtbarkeitsmengen müssen übereinstimmen. Es gibt keine willkürliche Vereinigung.

Die zwei Grenzen bleiben getrennt:`T=N_T∩A_T`, `V=N_V∩A_V`. Ein ausschließlich im Land vorhandenes Ziel wird weder importierter Target noch versteckter sichtbarer Hilfsknoten. Ein national lediglich als Unterstützung exponierter Eintrag wird kein Target. Ein gegebenes Target muss in der Sichtbarkeitsmenge vorhanden sein; die aufrufende native Prüfung bricht bei Verlust dieser Invariante ab. Ohne Land bleibt der übergebene nationale Default unverändert.

Der erwartete Endpunktsatz wird weiterhin getrennt vom materialisierten Istsatz ermittelt. Neue Familienfehler fließen ausdrücklich in die CQR-104-Failbedingung ein. Die weiteren Voraussetzungen-/Motivations-/Terminalroutenbedingungen werden nicht gelöscht. Die Abhängigkeit`nationalStageProjection.ts` war zunächst noch nicht in den semantischen Implementierungseingaben gebunden; dieser konkrete Reviewpunkt wurde gemeldet und anschließend in`semanticRouteInventory.ts` und`reportRouteEndpointVisibility.ts` sichtbar ergänzt.

## Präzisierte Produktgrenze

Der vorangegangene Entwurfsreview verlangte, dass keine nur inQA vorhandene hybride Route als tatsächlich ausgelieferter Lernview behauptet wird. Der konkrete Code benennt die nationale/[Land]-Zeile jetzt ausdrücklich als **Kompatibilitätsaudit**: Der tatsächliche Learner wählt bei einer Landesauswahl bereits den zugehörigen Landesview. Gelesen wurden hierfür`CompositionViewService.findLearnerScopeView`, die genaue Schulform-/Stufenankerprüfung und die gelieferte72-Kontexte-Auswahlmessung. Diese Messung wurde als gelieferte tatsächliche API-Evidenz angesehen, nicht hier als eigener neuer API-Lauf ausgegeben.

Damit ist die Abgrenzung kohärent: Nationale Vollraumexposition plus Landes-Stufenautorität werden für den zusätzlichen Kompatibilitätscheck materialisiert. Die tatsächlichen Landesviews und der nationale Default werden dadurch nicht neu gemischt oder durch unbekannte Landesplatzierungen ersetzt. Die Familienbindung ist eine konkrete, fachlich begründete Zuordnung dieser fünf existierenden Views; ein neuer View erhält keine stillschweigende Familienfreigabe durch ähnlichen Namen.

## Tatsächlich ausgeführte Prüfungen

Der Kerneltest mit BW/HE/Default, neutralem und kursbezogenem Scope sowie15 negativen Fällen wurde tatsächlich ausgeführt. Die aktuelle native Regression wurde ebenfalls ausgeführt; deren Testfixture wurde ausschließlich unter dem eigenen Ausgabeverzeichnis angelegt. Das ist eine pfadangepasste Ausführung des vollständig gelesenen Autoren-Regressionstests, keine Behauptung unabhängiger Urheberschaft an diesem Test.

Ergebnis der nativen Prüfung: echte BW-Zweiscopes-Baseline PASS; entfernter nationaler Vollraumendpunkt FAIL bei unveränderten erwarteten Mindest-/Höchstzahlen; entfernte vollständige direkte Aufgabenvorbereitung FAIL trotz unveränderter Landesroute. Die aktiven Views blieben unverändert. Damit ist der geforderte negative fehlende-Terminal-Fall tatsächlich nativ nachgewiesen, zusätzlich zum Kerneltest.

Die eigene Messung mit vollständigem aktuellem Katalog und den testweise übergebenen RP-v1-Dateien beseitigt die fehlenden Endpunkte. Die übrigen BY-Routenfehler bleiben erwartungsgemäß sichtbar; Expectedmin42/max63 bleiben erhalten. Dies ist eine Diagnose eines Kandidaten, keine Behauptung einer vollständigen Behebung.

Der erste eigene Implementierungslauf ist unter`implementation-review-v1` erhalten. Er hat konkurrierende Änderungen an Generator, Testimport und kanonischer Physik ehrlich erkannt und keine unveränderte Eingangsbindung bestätigt. Der zweite Lauf unter`implementation-review-v2` wurde frisch gebunden und bestätigte101 unveränderte gepinnte Eingaben während dieses Laufs. Eine spätere Änderung kann durch diese damalige Bindung nicht als automatisch neu geprüft gelten.

## RP-v1-Moveentscheidung: nicht annehmen

Die eigene Prüfung bestätigt für die RP-v1-Kandidaten volle Target-/Lernbasisgleichheit und fehlerfreie native Kompilierung. Im durch den neuen unveröffentlichten BY-Task bereits erweiterten aktuellen Katalog ergeben sich GK569/800 undLK580/798 für Target-/Lernbasiszählung, jeweils mit Delta0. Die volle gerenderte Targetmenge bleibt ebenfalls exakt gleich. Alle drei vorgeschlagenen Aufgaben sind nach der Kandidatenplatzierung tatsächlich SekI-Targets.

Aber die starke fachliche Platzierungsbegründung ist falsch: Der statische SekI-Sichtbarkeitssatz enthält die vollständige transitive Vorbereitung nicht. Für16bfb017 fehlen fünf, für6345871e neun, fürb4175564 eine notwendige Physik-Voraussetzung; jeweils schon vorher und unverändert nachher. Diese Fehlmengen wurden nicht durch den Kandidaten neu erzeugt, verhindern aber die Behauptung einer vollständig vorhandenen expliziten stufenlokalen Vorbereitung. Die genaue Liste steht in`native-independent-verification.actual.json`.

Die zusätzliche unabhängige BFS erklärt die eigentliche Ursache: Keines der151 tatsächlich ausgewählten SekI-Targets je RP-Kurs verlangt die drei direkt als`prerequisiteOnly`eingetragenen Kompetenzen72effc66,d67502e3,106417ed. Die Prüfung umfasst88 gewöhnliche Targets und63 Übungs-/Assessmenttargets, nicht nur gewöhnliche Lernziele, sowie sämtliche transitiven`requires`im vollständigen21er-Katalog. Für alle drei Referenzen ist die Zeugenmenge leer. Der Befund steht in`rp-all-target-demand.actual.json`.

Deshalb werden die unnötigen Endpunktforderungen durch ungenutzte frühere Unterstützungsreferenzen ausgelöst. Eine gezielte Entfernung ausschließlich dieser drei ungenutzten SekI-`prerequisiteOnly`-Referenzen ist der passende neue Kandidatenweg, sofern dabei volle Target-/Lernbasisgleichheit und bestehende Aufgabenverträge unverändert bleiben. Die Aufgaben können an ihren bisherigenE-/Q1-Plätzen bleiben. Das ist keine Erlaubnis, notwendige Vorbereitung zu entfernen, Expected-Endpunkte pauschal zu kürzen oder einen tatsächlich geforderten Assessment-Endpunkt zu verstecken.

Ein solcher konkreter RP-Nachfolger ist in diesem Dokument noch nicht geprüft. Es wird weder ein tatsächlicher neuer API-/Kartenlauf noch das Ausbleiben aller verschachtelten Backflows für einen bereits installierten Nachfolger behauptet. Frühere D-Reviewrecords und eigene abgeschlossene Aufgabenreviews bleiben unverändert.
