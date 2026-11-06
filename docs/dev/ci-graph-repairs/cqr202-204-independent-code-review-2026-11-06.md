# Unabhängiger Schlussreview: CQR-202/204

Der begrenzte Code- und Gegenprüfungsreview besteht auf den sieben im
[Review-JSON](cqr202-204-independent-code-review-2026-11-06.json) festgehaltenen
Dateihashes. Die aktive Informatikquelle bleibt `00bcdbaf…`. Keine Datei des
implementierenden Agents, kanonische Quelle, View, Policy, QA-Freigabe oder
Lernzustand wurde durch diesen Review geändert. Das ist ein KI-Code-Review,
keine menschliche Inhaltsfreigabe oder Wiederherstellung eines Meilensteins.

## Geprüfter Vertrag

- `CQR-204` erfasst jede erhaltene `examData`-Definition, explizite Exam-Nodes
  sowie explizite atomare Exam-/Assessment-Markierungen. Nichtangebot oder
  fehlende Contains-Eltern nehmen eine Definition nicht aus der Strukturpflicht.
- Die Bereitschaftsmenge vereinigt vorhandene konfigurierte Routenendpunkte
  einschließlich Dauermodellalternativen, tatsächliche Released-Offer-Zweige
  und gerenderte Prüfungs-Targets der eigenen Fachviews. Native Projektionen,
  Filter und die Unterscheidung von Target und Support bleiben maßgeblich.
- Ein vollständiger, nicht angebotener Draft kann strukturell bestehen.
  Als verbindliches Angebot oder View-Target bleibt sein Draftstatus sperrend.
  Leere oder bekannte generische Lösungen erhalten keine Prosa-Ausnahme.
- Derselbe bestehende Materialprüfer wird wiederverwendet. Der Patch erweitert
  dessen Erfassungsumfang; er ist keine neue vollständige Schema- oder
  fachliche Inhaltsvalidierung. Lokale CQR-201/202/203 behalten ihre Bedeutung.

## Gefundene und geschlossene Consumergrenzen

Der erste tatsächliche
[Consumer-Repro](cqr202-204-independent-code-review-2026-11-06/cqr202-204-independent-consumer-probe-before-2026-11-06.json)
belegt: Fehlende oder rote globale 202/204-Ergebnisse wurden zwar von der
Ableitung auf M3 begrenzt, ein direkt gelesener gespeicherter M7-Eintrag wurde
vom Floorconsumer aber weiterhin akzeptiert. Außerdem konnte eine gemeinsame
Kürzung beider Manifest-Pflichtmengen trotz widersprechender Metriken M7 erhalten.
Ein weiterer tatsächlich beobachteter Owner-Gegenfall ersetzte `root:A` durch
das im selben gültigen Graphen geprüfte `foreign:B`.

Der abschließende Code verwendet eine native, vom Bericht unabhängige
Erwartungsmenge und einen gemeinsamen Validator für Ableitung und direkten
CLI-/Floorverbrauch. Er bindet die Mengen, alle fünf Metriken und exakte
`owner:goal`-Schlüssel des vorhandenen Graphberichts. Eine globale Existenz
des bloßen Goal-ID-Suffixes genügt nicht.

Bei der Zwischenrefaktorierung fiel außerdem die gemeinsame Verwendung
veränderlicher Arrays zwischen Report und Sollmenge auf. Dieser statische
Befund ist geschlossen: Die native Erwartung und ihre Arrays sind eingefroren;
jedes Manifest erhält eigene Arraykopien. Der endgültige tatsächliche
In-place-Gegenfall verändert den Report, lässt die native Erwartung unverändert
und scheitert korrekt.

Die [15 unabhängigen Schlussproben](cqr202-204-independent-code-review-2026-11-06/cqr202-204-independent-final-counterprobes-2026-11-06.json)
bestehen einschließlich gültiger M7-Kontrollen, fehlender/roter/duplizierter
Artefakte, gemeinsamer Kürzung mit ursprünglichen **und angepassten** Metriken,
vollständig leerer Mengen mit Nullmetriken, In-place-Mutation, fremder Goal-ID
und fehlendem nativen Kontext. Die negativen Fälle liefern M3 und werden auch
bei absichtlich gespeichertem M7 von beiden direkten M6/M7-Floors abgewiesen.
Die Assertions schließen Identitäts- oder Graphfehler als Ersatzursache aus.

## Native Compilerbegrenzung und bestehende Gegenfälle

Die Begrenzung der Compilerdefinitionen auf die vom vorhandenen Rollenkollektor
referenzierten Target-/Supportziele verwendet denselben nativen Compiler.
Der [unabhängige Vergleich](cqr202-204-independent-code-review-2026-11-06/cqr202-204-independent-native-probes-2026-11-06.json)
prüft in 14 Fällen vollständige Bäume und Reihenfolge, sämtliche Fehler und
Warnungen sowie Target-/Supportmengen exakt. Dazu gehören direkte Rollenoverrides,
echte Duplikat-/Überlappungs-/Opaque-/Missing-/Role-Gegenfälle, fremde Landscape-
und Goalreferenzen sowie die tatsächliche hessische Informatikview. Deren
Definitionseingabe sinkt von 6.524 auf 233, bei exakt gleichen Ergebnissen.
Die gemessenen 211 gegenüber 4,7 Millisekunden sind kein Timinggate.

Die zwei von ci_runtime bereitgestellten nativen 21er-Resultate wurden zusätzlich
vollständig als JSON gleich verglichen. Das war ein unabhängiger Vergleich
vorhandener Ergebnisse, kein zweiter ganzer Producerlauf.

Der bestehende fokussierte Examsuite-Einstieg wurde auf dem finalen Freeze
erneut tatsächlich ausgeführt und endet mit Exit 0. Er behält die ursprünglichen
14 Graphnegative, 35 unvollständigen Graphartefakte, sechs Original-Generika,
zwölf irreführenden Taskvarianten und alle 56 echten zusätzlichen Payloadnegative.
Die zwei ergänzten bestehenden Positivfixtures liefern native Assessment-
Erwartungen; ihre alten Graph-/Deep-Gegenbedingungen werden nicht gelockert.

## Belege und Ausführungsgrenze

Das Review-JSON bindet alle sieben Code-/Dokumentpins und 13 dauerhafte
ausgewählte Belege. Die mitkopierten `.mts`-Runner sind zur Wiederholung an ihren
im Inventar bezeichneten ursprünglichen `tmp/`-Pfad zu kopieren und vom
Repositoryroot mit dem vorhandenen `tsx` auszuführen. Der historische
Vorher-Runner gehört ausdrücklich zu seinem damaligen Generatorstand;
der Schlussrunner verwendet die neue native Scope-API.

Es bestehen aus diesem begrenzten Schlussreview keine offenen Codebefunde.
Der vollständige Deep-Lauf `47027` gehört ci_runtime und ist ein gesonderter
Nachweis. Der Reviewer hat weder einen ganzen Deep- noch einen ganzen
CQR-Producer gestartet. Aktuelle Inhaltsprobleme, Source-A-Aktivierung,
Meilensteinfloors und weitere fachliche Reparaturen werden dadurch nicht
als bestanden ausgegeben.
