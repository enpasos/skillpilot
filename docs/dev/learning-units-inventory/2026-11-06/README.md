# S0: natives Mathematik-/Physikinventar

Das [versionierte Inventar](native-math-physics.json) beschreibt den unveränderten
Repositorybetrieb an der Neustartbasis `0ce5a8d791`. Es zählt Bestände und
auflösbare Konfigurationen; es bestätigt keine fachliche Qualität, Lerneinheit,
gültige Anerkennung `C(q)`, Veröffentlichung oder Hostabnahme.

## Wie die Konfigurationen entstehen

`app/scripts/reportMathPhysicsNativeInventory.ts` verwendet dieselben
Angebotsfunktionen wie die bestehende Lehrplankonfiguration:
`isGymnasiumSubjectOfferedForStageSelection`,
`getOfferedGymnasiumDurationModels` und `getDisplayCourseProfileFilters`.
Ihre registrierten Daten stammen aus dem vorhandenen generierten
`gymnasiumDurationOfferings.ts`, der Dauerpolitik und den Composition Views.

Pro Fach werden die auswählbaren Bundesländer und die nationale Standardansicht
mit Sek I, Sek II und beiden Stufen berücksichtigt. Sek I hat kein zusätzliches
Kursprofil. Sek II und die gemeinsame Ansicht berücksichtigen GK, LK und GK+LK.
G8/G9 wird nur dort unterschieden, wo die Oberfläche diese Auswahl anbietet.
Ohne angebotenen Dauerschalter bleibt die Konfiguration ohne Dauerangabe
erhalten. Bei reiner Sek II verfeinert eine alte gespeicherte Dauerangabe keine
der aktuell registrierten Sek-II-Sichten; diese tragen keine Dauerdimension.
Eine fehlende Stufe wird nicht als aufgelöster Lehrplan ausgegeben.

Die resultierende Matrix umfasst **266 Einzel-Fach-Konfigurationen**:

| Fach | Sek I | Sek II | Beide Stufen | Gesamt |
| --- | ---: | ---: | ---: | ---: |
| Mathematik | 23 | 51 | 69 | 143 |
| Physik | 18 | 51 | 54 | 123 |

Es gibt keinen kartesischen Ausbau über mehrere Fächer, Lernendenstände,
Kalenderjahre oder Fokuswurzeln. Eine zusätzliche Fachauswahl verändert deren
eigene Projektion; fremdfachliche Voraussetzungen bleiben im Ergebnis erhalten.
Die vier externen CSV-Varianten sind keine Eingabe dieses Skripts.

## Tatsächliche Runtime statt einer zweiten Scopeengine

Der kleine Javaadapter `app/scripts/MathPhysicsNativeProjectionInventory.java`
verwendet die vorhandenen `LandscapeService`, `GoalMappingService`,
`CompositionViewService` und die lesende `LearnerService.getGoalProjection`.
Er lädt und pinnt eine gemeinsame Repositorygeneration und liest Zielmengen
über dasselbe Reflectionmuster wie die bestehenden Projektionstests.

Dadurch gelten unter anderem der tatsächliche GK+LK-Merge, die besondere
bayerische Mathematikprojektion, native Applicability, versteckte Voraussetzungen
und die Unterscheidung `target`/`prerequisiteOnly`. Es werden keine API-Endpunkte,
Datenbanken oder Masterystores angesprochen. Es gibt keine neue Laufzeit-API
und keine zusätzliche Matching- oder Mergeimplementierung.

`mathPhysicsNativeInventory.init.gradle` startet nur diesen Adapter mit dem
bestehenden Backend-Classpath. Es ändert keine Gradle- oder Runtimekonfiguration.
Eine geänderte private Projektionsschnittstelle lässt das Inventar fehlschlagen,
statt eine Ersatzableitung zu verwenden.

In der geprüften Matrix findet jede Konfiguration eine Learner View. Ein
zukünftig fehlender Match wird ausdrücklich verzeichnet; der volle kanonische
Pool wird dabei niemals als Ersatzlehrplan angeboten.

Über alle passenden Fachkonfigurationen kommen sämtliche 1.285 gewöhnlichen
Ziele und elf Kartenziele mindestens einmal als `target` vor. Von den 319
kanonischen Prüfungszielen kommen 318 vor. Das Physikziel
`3631c8f7-ff48-57ff-b7ee-8397ff1d166a`, „Sek-I-Abschlussaufgaben Physik
selbstständig lösen“, ist in dieser Matrix kein `target`. Dieser Befund ist
keine automatische Lösch- oder Ergänzungsentscheidung. Die weiteren nicht
als Fachziel angebotenen Poolknoten sind Struktur/Orientierung; kanonische
Navigationsknoten müssen nicht alle in einem komponierten Baum erscheinen.

## Exakte Mengen und begrenzte Äquivalenz

`pools` enthält die vollständigen kanonischen Fachbestände mit stabilen IDs:
1.252 Mathematik- und 766 Physikknoten. `assessmentDeclarations` bewahrt je
bestehender Prüfung die deklarierte Abdeckung und Hashes der tatsächlichen
Aufgaben-/Lösungstexte sowie der normalen Bewertungsdefinition. Ein vorhandener
`released`-Status qualifiziert diese Prüfungen nicht als neue Anerkennungsverträge.
Die vorhandenen Completionprofil-/Scopedefinitionen stehen mit Hashes in `sources`.

Die Native-Projektionen ergeben **190 Mitgliedschaftsklassen**: 107 für
Mathematik und 83 für Physik. Sie werden nach exakt gleichen Ziel- und
Voraussetzungsmengen zusammengefasst. Der Schlüssel
ist SHA-256 über Fach-ID und beide Mengen in deterministischer Bitsetkodierung;
beim Zusammenfassen wird zusätzlich der vollständige Inhalt verglichen.
Gleiche Zielanzahlen allein ergeben keine Äquivalenz. Gleiche Mitgliedschaft
behauptet keine gleiche Baumordnung, Prüfungsalternative oder Didaktik.

Die Bitsets beziehen sich auf `goalUniverseIds`. Bit i innerhalb des Bytes
steht für die dortige ID i, beginnend beim niederwertigsten Bit. Der exportierte
Helfer `decodeGoalSetBits` stellt die exakte ID-Liste wieder her. Die Klassen
enthalten getrennte Rollenzahlen des eigenen Fachpools und Zahlen fremder Ziele.
Die fremden IDs selbst bleiben in den Bitsets enthalten; insbesondere werden
mathematische Physikvoraussetzungen nicht abgeschnitten.

Die offengelegte Bestandsklassifikation entspricht dem begrenzten V2-Audit:
Nur `type=atomic`; Q über `nodeKind=exam`, Assessmenttag oder `examData`, K über
`nodeKind=memory`; Orientierung und nichtatomare Knoten werden getrennt von
gewöhnlichem fachlichem Erwerb gezählt. Das ist eine Inventargruppierung und
keine neue produktive Zieltypregel.

`decks` enthält alle elf Kartenziele mit den **18 tatsächlichen DE-/EN-
Referenzen**, Deck-IDs, geordneten Karten-IDs und Dateihashes. Breite Decks
werden dadurch weder aufgeteilt noch einer neuen Einheit zugeordnet.

Die Dateihashes binden die wesentlichen Inventareingaben und beteiligten
Resolverquellen. Der Native Loader liest darüber hinaus Repositorymappings
und Provenienz. Dieses Dokument ist kein vollständig versiegeltes Runtime-
Releasepaket. Das vollständige Inventar wird aus dem aktuellen Stand reproduziert.

## Reproduktion und fokussierte Prüfung

Im Verzeichnis `app`:

```bash
npx tsx scripts/reportMathPhysicsNativeInventory.ts --write
npx tsx scripts/reportMathPhysicsNativeInventory.ts --check
npx tsx scripts/testMathPhysicsNativeInventory.ts
```

Der Check rechnet mit frischen Backendobjekten neu und verlangt bytegleiche
Ausgabe. Dafür braucht der vorhandene Wrapper seine konfigurierte Java-/Gradle-
Umgebung. Lokal wurde der bereits vorhandene Gradlecache mit
`GRADLE_USER_HOME=/tmp/skillpilot-plan-gradle-20261022` verwendet. Die temporären
Anfragen, nativen Rohdaten und Laufprotokolle bleiben unter
`tmp/math-physics-native-inventory/run-*`; sie sind keine neuen Curriculumdaten.

Die Integritätsprüfung kontrolliert die eindeutige Konfigurationsabdeckung,
disjunkte Ziel-/Voraussetzungsmengen, exakte Bitsetauflösung einschließlich
fremdfachlicher Ziele, vollständige Klassenzuordnung, tatsächliche Mergequellen
und Kartenidentitäten. Außerdem prüft sie sämtliche in `sources` verzeichneten
SHA-256-Werte gegen die aktuellen Dateien; fehlende oder veränderte Dateien
lassen sie fehlschlagen. Dabei startet sie kein Backend. Diese Kontrolle deckt
die ausdrücklich verzeichneten Eingaben ab und macht das Inventar weiterhin
nicht zu einem vollständig versiegelten Runtime-Release. Die tatsächliche native
Neuberechnung übernimmt ausschließlich der separate `--check`.
Die Integritätsprüfung wird durch vorhandene Angebots-/Projektionstests
ergänzt. Aufgabenqualität, Quellenfreigabe und bisher unbekannte historische
Prüfungsbedeutungen müssen im weiteren S0-/S1-Ablauf separat geprüft werden.
