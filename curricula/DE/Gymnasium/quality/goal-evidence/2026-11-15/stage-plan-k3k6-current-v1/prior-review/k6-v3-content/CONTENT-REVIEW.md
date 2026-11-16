# Unabhängiger gezielter Inhaltsnachreview K6/Bayern v3

**Entscheidung: APPROVE_CONTENT für die geprüfte Inhaltsrevision.**
Stand: 15.11.2026, 10:40 MEZ (UTC+01:00).

Diese Entscheidung betrifft ausschließlich den versiegelten v3-Kandidaten
`04fcb105741484f2aea934d07d707eae69e310d902aba3ec7ef545a9d9881e23`
unter `tmp/physics-rate-k6-delivery-20261115-v3/`. Alle **125 Dateipins**
wurden selbst nachgerechnet; die 90 v1- und 112 v2-Pins bleiben intakt.
Die drei Inhaltsblocker R3–R5 sind geschlossen. Eine zusätzlich konkret
nachgewiesene **Runtime-/Integrationsabhängigkeit RC1** bleibt ausdrücklich
offen; diese Inhaltsentscheidung erteilt dafür keine Freigabe.

## R3 geschlossen: vollständige eigene Video-zu-Diagramm-Leistung

Die vollständigen aktualisierten DE/EN-Aufgaben, Lösungen, Kriterien und
das volle d675-Profil wurden neu gelesen. `6345871e` verlangt für A nun
x(t)=s(t) und v(t) aus der eigenen Aufnahme. B verlangt x(t), y(t), v_x(t)
und v_y(t) aus der eigenen tatsächlichen Wurfauswertung. Beschriftungen,
Einheiten, Rohdatenherkunft, getrennte Messpunkte/Modellkurven sowie alle
benachbarten Intervallmittel mit tatsächlichem Zeitfensterbezug sind
verbindlich. Ein begründeter Mittelpunktbezug darf gleichwertig verwendet
werden; eine gemeinsame mehrteilige Bildtafel ist zulässig.

Die neuen Diagrammleistungen sind in den notwendigen Kriterien 2 und 4
verankert. 32/32 bleibt die Bestehensgrenze. Der v2-Gegenfall mit richtigen
Videos, Fits und Sensitivitäten, aber ohne Bewegungsdiagramme erfüllt diese
Kriterien nicht mehr vollständig und kann nicht bestehen. Dasselbe gilt bei
allein fehlendem v_y(t) oder bloßen Modellkurven ohne aus den Rohpunkten
gewonnene Geschwindigkeitsmittel. Das Replay vollständig erfüllter Kriterien
ergibt 24/32 beziehungsweise 28/32; eine feinere Teilpunktverteilung ist
nicht spezifiziert. Entscheidend ist die jetzt ausdrücklich ausgeschlossene
volle Punktzahl bei einem fehlenden Produkt.

Die eigene Parameteridentifikation und quantitative begrenzte Sensitivität
wurden nicht gelockert. Mindestens zehn echte Flugpunkte, getrennte
Komponentenfits, alle Parameter/Einheiten, Residuen, vertikales lineares
Gegenmodell, unabhängige Re-Markierung und tatsächliche Kalibrier-Refits
bleiben zwingend. C bleibt synthetisches Transfermaterial und ersetzt keine
eigene Aufnahme. Ein v3-Fair-pass ist mit vollständigen echten Artefakten
und einer gleichwertigen mehrteiligen Darstellung möglich; der Reviewer
attestiert keine tatsächlich durchgeführten Lernendenaufnahmen.

## R4 geschlossen: vorherige angeleitete Planung in Ziel, P und Prüfung

`677a192d` entwickelt jetzt ausdrücklich den kleinen angeleiteten Plan vor
der Erfassung. Das positive Profil besitzt die zusätzliche erforderliche
Erwartung `guided-preacquisition-planning`; beide Anwendungsfälle binden die
Planung und die nötige Anpassung vor dem zweiten Versuch ein.

`7c2a3450` fordert in beiden Sprachen einen vorher zur Rückmeldung
eingereichten eigenen kurzen Plan: sichere Skizze, Gerät/Skala/Bezug,
Achse/Auflösung, begründete tatsächliche Zeitbasis und geplante Fenster
oder begründete Auswahlregel. Dokumentierte Anleitung ist erlaubt. Nötige
spätere Änderungen dürfen begründet werden; formale Forschungsplanung
oder ein globaler Bewegungsfit werden nicht verlangt.

Die Lösungen und ein eigenes notwendiges Zwei-Punkte-Kriterium sichern
diese Leistung. Die Gesamtpunkte bleiben 16/16. Die alte Rezeptbefolgung
ohne vorherigen eigenen Plan sowie eine nur nachträgliche Skizze erhalten
diese zwei Punkte nicht und bestehen auch bei sonst vollständiger Leistung
mit 14/16 nicht. Der Plan wird nicht durch einen fiktiven Graphvorgänger
oder eine angebliche spätere Rekonstruktion ersetzt.

Die Zuordnung entspricht nun dem gelesenen Planungs-/Durchführungs-/
Auswertungsanspruch in der aktuellen
[amtlichen Ph8-Quelle](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/physik).
Sensor und Video bleiben echte Alternativen; der NTG-Profilbereich wird
nicht allgemein verpflichtend. Die konkreten zwei unabhängigen Durchgänge
bleiben eigene SkillPilot-Operationalisierung, keine erfundene wörtliche
amtliche Pflicht.

## R5 geschlossen: faire Übereinstimmung und tatsächliche Grenzen

DE/EN-Aufgaben, Lösungen, Profil und notwendiges Sechs-Punkte-Kriterium
akzeptieren nun einen nachweislich auflösbaren Unterschied **oder** eine
begründete Übereinstimmung beziehungsweise fehlende Auflösbarkeit innerhalb
der tatsächlichen Messgrenzen. Die zweite neue reale Erfassung mit vorher
dokumentierter veränderter Bedingung und neuer Rechnung bleibt zwingend.
Eine bloße Achsenumkehr derselben Tabelle bleibt unzureichend.

Der ursprüngliche konkrete Fair-pass-Gegenfall wurde erneut selbst eingesetzt:
x₁=0,1t+t² und x₂=0,3t+t² liefern in den Fenstern [0,10;0,20] s und
[0,50;0,60] s die Verschiebungen 0,04/0,12 beziehungsweise 0,06/0,14 m.
Die Geschwindigkeitsmittel sind 0,40/1,20 und 0,60/1,40 m/s. Beide
Beschleunigungsnäherungen ergeben 2,0 m/s². Eine entsprechend belegte reale
Einreichung kann nun ohne erfundene Abweichung alle 16 Punkte erfüllen.

Auch geringe nicht auflösbare Unterschiede sowie ein tatsächlich
auflösbarer Unterschied können fair bestehen. Ein zusätzlich eingesetzter
Zeuge x₃=0,225t+1,25t² ergibt 0,06/0,16 m und 2,5 m/s². Die Grenzen
müssen an den tatsächlichen Daten begründet sein. Die Zahlen sind explizite
Reviewer-Rechenzeugen und keine angeblichen Versuchsergebnisse.

Die zusätzlich erläuterten akzeptablen Ausgänge schreiben kein Ergebnis
für die echten Versuche vor. Die konkreten Zahlen des neuen Fair-pass-
Zeugen stehen in der Lösung, nicht in der Aufgabenfassung. Es wurden keine
fertigen eigenen Pläne, Diagramme oder Videoresultate als Antwortmaterial
hinzugefügt. Alle 17 Materialdateien einschließlich der synthetischen Roh-CSV
sind exakt identisch mit der bereits visuell geprüften v2.

## Erhaltener Umfang und begrenzte Nachprüfung

Der komplette semantische Graph ist v2 gegenüber unverändert: identische
IDs, Typen, contains/requires, Tags und Anwendbarkeit für jedes Goal. Alle
69 View-Payloads und alle 340 Closure-Änderungsdatensätze sind ebenfalls
exakt gleich. Die vollständigen Objekte von ce, e4b, Coulomb, bbee, ae201,
den frühen Videopfeilen und den drei alten korrigierten Videoaufgaben
bleiben unverändert. Die sonstigen neuen Aufgaben ändern überwiegend nur
den versionsspezifischen Artefaktpfad. Die zwei neuen Profiländerungen
erweitern den ausdrücklich erforderlichen Nachweis; sie lockern ihn nicht.

Damit bleiben die unabhängig geprüften v2-Aussagen zu R1/R2 und den
numerischen Aufgaben erhalten. Die v2-Evidenz wird nur für diese exakt
gebundenen unveränderten Teile verwendet. Die unabhängige native
21-Wurzeln-Graphprüfung und 69-View-Prüfung wurden hier nicht als neu
ausgeführt ausgegeben. Vier native Wissenskontexte der jetzt inhaltlich
betroffenen Atome wurden für v3 frisch abgeleitet.

Die Ph10-Zuordnung des vollen Modells/Video-Fitwegs bleibt durch die aktuell
erneut geöffnete [amtliche Ph10-Quelle](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik)
fachlich gestützt: digitale Bewegungsdiagramme, lineare/quadratische Modelle
und komponentenweiser Wurf. Individueller eigener Zweivideo-Fit und die
konkreten Sensitivitätsfälle werden weiterhin als eigene Operationalisierung
behandelt. Die bekannte Newton1→e4b-Vorbereitung wird nicht als repariert
ausgegeben. Kein realer Landes-/Stufenplan wurde aktiviert.

Die korrigierte Anzahl ist nachvollzogen: **92 neue Assessment-Vieweinträge =
88 allgemeine + 4 frühe bayerische**. Das sind Einträge, keine Zahl aktivierter
Pläne oder nachgewiesener Lernendenleistungen.

## RC1 – echte native Runtimebeobachtung, keine pauschale Schließung aller Altresultatwege

Auf ausdrücklichen nachträglichen Prüfauftrag wurden die tatsächlichen
Backendklassen `CompletionProfileCompiler.compileAutomatic` und
`CompletionEvaluator.evaluateAutomatic` gegen alle 21 versiegelten
Katalogdokumente aufgerufen. Der Aufruf verwendet ausschließlich synthetische
Mastery-Mengen bekannter IDs; es wurden keine Learnerdaten gelesen oder
geschrieben. Verwendete Klassenbytes, gelesene Java-Quellen, genaue
javac/java-Aufrufe und Exitcodes stehen in `native-java-execution.actual.json`.
Dies ist kein LearnerService-, API- oder Hosttest.

**Tatsächliches Ergebnis der 73 Varianten:**

- Baseline: Mit Targetmenge `{alte Aufgabe,d675}` und ausschließlich
  bestandenem altem `367b17f8`, `0432a422` oder `7f83e25c` wird d675 erlassen.
- v3: In allen drei alten direkten/transitiven requires-Mengen fehlt d675
  tatsächlich. Trotzdem wird d675 im selben engen Targetscope **weiter
  erlassen**, wenn der neue echte Nachweis `6345871e` dort fehlt. Dasselbe
  gilt bei allen drei alten Resultaten zusammen.
- Ein Kontrollaufruf mit Targetmenge `{d675}` und **leerer Mastery-Menge**
  ergibt ebenfalls `d675Waived=true`, `complete=true`. Der Befund entsteht
  somit aus dem allgemeinen Erlass ordinary-Zielen ohne offene
  Assessmentnachfrage; er ist kein verbliebener indirekter d675-Pfad der
  alten Aufgaben.
- Wird der neue reale Nachweis `6345871e` in den Targetscope aufgenommen,
  bleiben d675 und die neue Aufgabe in allen Einzel-/Kombinationsfällen
  offen. Alte Resultate ersetzen die neue Leistung dort nicht.
- Alle **60 tatsächlich nativ projizierten vollständigen Views mit d675
  als Target** enthalten auch den neuen Nachweis. Bei ausschließlich den
  drei alten Resultaten ergeben alle 60 `d675Waived=false`,
  `d675Pending=true`, `newRealAssessmentPending=true`.

Die Detaildaten stehen in `old-video-native-results.actual.json` und die
nativ abgeleiteten vollständigen Targetmengen in
`native-full-video-view-targets.actual.json`.

Die v3-Curriculumänderung repariert damit die direkten Coverage-Claims,
unnötigen requires-Pfade und die vollständigen authored View-Nachweisrouten.
Sie beweist **keine globale Schließung aller Anerkennungs-/Erlasswege** in
beliebig verengten Laufzeitscopes. Der zuständige Runtime-/LearnerService-
Strom muss die beobachtete Scopeabhängigkeit gegen den verbindlichen
Lernendenresultatvertrag entscheiden und absichern. Die Inhaltsfreigabe
überspringt diese Integrationsabhängigkeit nicht und autorisiert keinen
automatischen Transfer oder Widerruf historischer Ergebnisse.

## Belege und Freigabegrenzen

`independent_probe.py` wurde selbst erstellt und ausgeführt: **48 begrenzte
Prüfungen einschließlich 13 manuell begründeter Kriterienreplays**, alle
erfolgreich. `independent-checks.actual.json` speichert jedes Kriterium,
die konkreten Fallannahmen und selbst gerechneten Zeugen. Die bedingten
Rasterfälle attestieren keine echten Lernendenaufnahmen oder Humanstudie.

Keine Inhaltsrevision R3–R5 bleibt offen. Native aktuelle D/P/SEM/MEM/V-/
Quellen-/Routenbindungen, geschützte Floors, RC1 einschließlich der
tatsächlichen Serviceaufrufe, Integration und frische vollständig erfolgreiche
Main-CI bleiben separat erforderlich. Alle Reviewdateien liegen nur unter
diesem neuen tmp-Verzeichnis; aktive Quellen, frühere Kandidaten und Git
wurden nicht verändert.
