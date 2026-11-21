# Management Summary zu Lernfluss und Stufenplänen

Ziel ist die vollständige Umsetzung von **K1–K13 und F1–F7** aus
[PR #156](https://github.com/enpasos/skillpilot/pull/156), integriert auf
`main` mit frischer erfolgreicher CI. Die Agenten verantworten Recherche,
Entscheidungen und Umsetzung; der Product Owner kontrolliert die Ergebnisse.
Der verbindliche Umfang steht in der [Übergabe](stage-plan-units-handover-2026-11-15.md).

Jedes Paket erhält einen datierten Eintrag mit Uhrzeit und Zeitzone, Fortschritt,
Ergebnis und Entscheidungen, Kontrollstellen, Nachweisen, Integrationsstand
und nächstem Schritt. Die Fortschrittszahlen zählen vollständig abgeschlossene
Arbeiten, keine gewichteten Prozentwerte. Entwürfe und Teilreparaturen bleiben
offen. Der neueste Paketeintrag steht oben; sein Zeitstempel wird bis zum
Abschluss aktualisiert. Frühere Abschlüsse bleiben erhalten.

Offene Einträge verweisen auf den PR. Erst der Abschluss nennt den geprüften
Implementierungscommit und den erfolgreichen Main-CI-Lauf. Dessen Jobzahl
wird getrennt von zusätzlichen oder zeitgesteuerten Commit-Checks angegeben.
Ein kleiner Doku-Abschlusscommit oder kurzlebiger Doku-PR ist danach erlaubt;
er erhält die Dokumentationschecks. Die große CI schließt `docs/dev/**` und
`AGENTS.md` bei reinen Änderungen dieser Pfade derzeit aus. Der dokumentierte
CI-Nachweis gilt weiterhin für den benannten Implementierungscommit.

## 21. November 2026, 12:01 MEZ – Eigene Messungen an den beiden praktischen E.1-Lernzielen

Im regulären Cockpit zeigte die Vorlage auf `fb97963d26` nach A–D in allen vier hessischen G8-/G9-Kursprofilen zwei individuell offene Versuchsziele. Die im Fachtext zitierte Geschwindigkeitsprüfung ist ein Entwurf zur Diagrammauswertung. Die Prüfung mit zwei eigenen Fallmessreihen ist für Sachsen freigegeben. Der in Hessen angebotene Videoanalyseversuch bewertet eigene Bewegungsaufnahmen an anderen Ziel-IDs. Der Product Owner hat festgelegt, dass A–D den E.1-Auftrag anhand bereitgestellter Daten abschließen. Für die eigenständige Versuchsdurchführung gibt es jetzt zwei fakultative Arbeitsaufträge an den vorhandenen atomaren Zielen.

**Fachliche Sichtung.** Beim fahrenden Wagen eine Messung für die Kontrolle zurückhalten und prüfen, ob die Vorhersage mit dieser Messung vereinbar ist. Beim Fallversuch aus einem selbst aufgenommenen Video oder einer Sensormessung die Fallbeschleunigung bestimmen. Danach an Achsen, Anfangsbedingungen und Messgenauigkeit erklären, warum der Wert von 9,81 m/s² abweichen kann. Die Karten und der lokale Claude-Coach beziehen Aufgaben und Kriterien aus derselben Materialfassung. [Prüfanleitung für die beiden Versuche](hessen-physik-e1-vorschau.md#zwei-eigene-versuche)

**Fachreview und Prüfnachweise.** Ein unabhängiger KI-Fachreviewer hat beide deutsch-englischen Aufgaben mit den atomaren Zieltexten und der hessischen Originalquelle abgeglichen und je eine erfüllende und eine unzureichende Beispielabgabe durchgerechnet. Der Fachentscheid bindet beide Aufgaben einschließlich Kriterien separat per SHA-256. Vier lokale Integrationstests prüfen in den konkreten G8- und G9-Profilen für GK und LK die tatsächlich publizierten Kriterien an beiden aktiven Zielen. Hierfür wurden synthetische Lernprofile und der reguläre Claude-MCP-Handler mit simulierter Anmeldung verwendet. [Fachentscheid und durchgerechnete Abgaben](https://github.com/enpasos/skillpilot/blob/289a53e091619013e0261a47669eb54b1250c1fd/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-individual-experiments-2026-11-21/fachreview.md)

**Einzelweg nach A–D.** Der Lernplan bietet elf individuell offene Fachziele zur Wahl. Beim vorigen Stand erforderte der Start der beiden praktischen Ziele zwei weitere Schritte im Baum und auf der Zielkarte. In den vier G8-/G9-Profilen von GK und LK ließen sich nun beide Versuche vom Lernplan aus lesen und die zugehörigen Ziele direkt beginnen. Im strikten Modus führte der Klick zur tatsächlich angebotenen Voraussetzung. Das Öffnen der Arbeitsblätter und der Start ließen die vier bestehenden Belege und die Einzelmastery unverändert. Am lokalen Claude-Adapter deckte die Gegenprobe eine zweite Einschränkung auf. Von elf ausführbaren Einzelwegen veröffentlichte er acht. In der Liste fehlten die Bezugssysteme, die Analyse des waagerechten Wurfs und die Sicherheitsabstände im Straßenverkehr. Der korrigierte Adapter veröffentlicht alle elf Auftragsziele innerhalb seiner bestehenden Obergrenze von 24 Wahlmöglichkeiten. Der reguläre Claude-Handler startete im G8-GK den freien Fall und im G9-GK die Geschwindigkeitsmessung. Im strikten G9-Fall startete der Coach die angekündigte Voraussetzung. Zudem blieben in jedem der vier öffentlichen Abnahmeprofile sämtliche elf serverseitigen Einzelaktionen erreichbar. [Geprüfte Implementierung](https://github.com/enpasos/skillpilot/commit/a490f8a9080426207c21fb5cda74b5e74a16f22e)

**Häkchen am eigenen Versuch.** Ein gesondertes G8/GK-Testprofil hat beide Versuche nacheinander durchlaufen. Die simulierte fachliche Bewertung zweier Messprotokolle verwendete den gewöhnlichen Claude-Schreibweg. Vor der Bewertung trug jedes gewählte Ziel das Aktivsymbol. Nach dem ersten eigenen Ergebnis wurde der freie Fall grün, nach dem zweiten auch die gleichförmige Bewegung. Die Zahl der einzeln offenen Fachziele sank von elf auf zehn und neun. Die beiden grauen Anrechnungen und die vier fassungsgebundenen Prüfungsbelege blieben bei beiden Schritten erhalten.

**Technische Prüfung.** Die vollständigen lokalen Vorschauprogramme bestanden im GK 58 und im LK 60 Szenariozeilen auf dem gemeinsamen Karten- und Lernservice-Stand `eefdc75158`. In 16 zusätzlichen regulären Starts für beide Versuche, Bildungsgänge, Kursprofile und beide Voraussetzungenmodi erreichte das gewählte Ziel oder die angekündigte Grundlage den Zustand `TEACHING`. Die Profilübergabe an den lokalen Claude-Adapter gelang. Der persönlich verfügbare Stand `a490f8a908` ergänzt die Korrektur der Claude-Auswahlliste. In acht Arbeitsblattaufrufen auf diesem Stand blieben Lernstand, vier Belege und aktives Ziel gleich. Auf diesem Stand bestanden 328 gezielte Backendtests ohne Auslassung, darunter die echten MCP-Auswahlen und die vollständige Projektion der lokalisierten Aufgaben. Die Qualitätsprüfung für 21 Curricula und zwölf Teilbereiche, das Transparenzinventar und die Prüfungen der lokalen Plugin-Entwürfe bestanden ebenfalls. [Abnahmeprofile](hessen-physik-e1-vorschau.md#zwei-eigene-versuche)

K 0/13 und F 0/7 vollständig abgeschlossen. Das Paket aktiviert 0 zusätzliche Stufenpläne. Der aktuelle Kartenvergleich vor der Ergänzung umfasst in G8 und G9 jeweils 619 Ziele und 608 Beziehungen im GK sowie 666 Ziele und 636 Beziehungen im LK. Die Mathematikkarte G9 hat 679 Ziele und 613 Beziehungen. Alle fünf Projektionen hatten einschließlich der Untereinheiten null rückwärts gerichtete Beziehungen. Im erneuten Browservergleich mit den zwei Versuchen blieben sämtliche Ziel-IDs, alle verschachtelten Einheiten und Beziehungen in jeder dieser Projektionen gleich.

Die technische Integration dieses Pakets ist offen. Die persönliche E.1-Teilabnahme ist auf den getrennten dauerhaften GK- und LK-Vorschauen möglich. Die weiteren Themenfelder bis Q4 folgen nach dieser Teilabnahme. [Integrations-PR #176](https://github.com/enpasos/skillpilot/pull/176)

## 21. November 2026, 10:54 MEZ – Einen Einheitenauftrag fortsetzen und das Fach ausdrücklich wechseln

Ein allgemeines „weiter“ folgt einem verfügbaren, ausdrücklich gewählten Einheitenauftrag und zusätzlich fälliger Arbeit. Wer stattdessen Mathematik wählt, kann dort auch ohne Mathematikplan lernen oder ein erreichbares Ziel eines späteren Mathematikplans vorziehen. Eine unverfügbare Fassung bleibt als solche sichtbar. Passen zwei zugängliche Landschaften zum ausdrücklich gewünschten Fachnamen, wechselt der Coach erst nach eindeutiger Auswahl. Im regulären E.1-Vergleich ergeben sich bei der Abschnittswahl im Einzelzielplan 16 Positionen. Die zusätzliche Wurfprüfung zählt bei eigener Wahl. Bei alten Plänen mit einem getrennten Auftrag für diese Prüfung wird die ursprüngliche Auswahl auch nach der früheren blockübergreifenden Deduplizierung berücksichtigt. Der Einheitenauftrag selbst hat vier Pflichtteile. Der Quellenhinweis „Waagerechter Wurf und Superposition (aus E.3)“ erscheint an den beiden eingebundenen Lernzielen in Baum und Karte.

**Prüfstand.** Sieben neue lokale Zweifachtests rufen mit simulierter Anmeldung die echten Claude-MCP-Handler auf. Sie prüfen am gespeicherten aktiven Ziel, ob der Wechsel zum Mathematikplan oder die persönliche Mathematikwahl tatsächlich ausgeführt wurde. Die zwölf G8-/G9-Fälle für das allgemeine Fortsetzen umfassen 0, 2 und 4 bestandene Teile, jeweils mit und ohne zusätzlich fälligen Auftrag. In beiden Bildungsgängen ließ sich das freiwillig gewählte Ziel „Modellierung und Idealisierung von Bewegungen“ nach Bestätigung des angebotenen Abschlussvertrags direkt im lokalen Coach starten. Die vier Belege und die Einzelmastery blieben erhalten. An separaten lokalen Profilen ließ sich der Einzelversuch A vor der Abgabe verlassen. Der Status blieb bei C und D mit je 17/20 Punkten und 2/4 erfüllten Teilen. Die bisherigen datierten Fachentscheide gelten für dieselben Aufgaben und Bewertungsraster.

**Auftragspause.** Acht Browserfälle haben in G8 und G9 einen teilweise erfüllten, einen abgeschlossenen und einen gemischten Auftrag sowie die Abwahl von Physik geprüft. Beim Pausieren und Reaktivieren änderte sich jeweils der gewählte Block. Die übrigen Aufträge, datierten Belege und individuellen Lernstände blieben erhalten. Die Qualitätsgrenzen für 21 Curricula und zwölf Teilbereiche sind erfüllt.

**Zusätzlicher Kursprofilvergleich.** Auf dem Kandidaten `31e6dad1d5` wählten zwei neue Profile über den regulären Personalisierungsdialog ausdrücklich Physik-LK für G8 beziehungsweise G9. Nach A–D war der Einheitenauftrag mit vier datierten Belegen abgeschlossen. Der Abschnitt zeigte 4/5 und verlangte zusätzlich „Mehrphasenbewegung und Modellprüfung“. Die freiwillige Wurfprüfung, die elf individuell offenen Inhaltsziele und die beiden Anrechnungen nach C+D waren in beiden Profilen korrekt. Laut hessischem Kerncurriculum gilt E.1 als gemeinsames Themenfeld der Einführungsphase. Der LK bietet die Mehrphasenprüfung jetzt als freiwillige Vertiefung an. Auf dem korrigierten Stand bestand bei beiden Bildungsgängen nach A–D auch der Abschnitt mit 4/4. Der G8-Lernende absolvierte C und D zuerst und erreichte die zwei Anrechnungen nach dem zweiten Beleg. Der G9-Lernende absolvierte sie zuletzt und erreichte die Anrechnungen nach dem vierten Beleg. Alle elf individuellen Fachziele blieben in beiden Profilen offen. [Kursprofile und fachliche Zuordnung](hessen-physik-e1-vorschau.md#grundkurs--und-leistungskursprofil-vergleichen)

**Pausieren während einer Aktualisierung.** In G9 traf der erste Klick auf **Einheitenauftrag pausieren** gelegentlich genau dann ein, wenn das Cockpit den Lernplan im Hintergrund neu lud. Der Knopf wurde zwischen Drücken und Loslassen deaktiviert. Der Server erhielt keinen Änderungsauftrag. Mit der Korrektur blieb der Knopf im bestätigten Lernplan während desselben Lesevorgangs bedienbar. Ein Klick pausierte den gewählten Block, ein weiterer aktivierte ihn wieder. Der Server bestätigte jeweils die erwartete Planrevision.

**Kartenwechsel im Leistungskurs.** Bei 1024 Pixeln Breite waren im LK nach dem Öffnen der Wurfaufgabe nur 29 Pixel der Wagenprüfung sichtbar. Die Kamera kann jetzt die sichtbaren Teile des zugehörigen Einheitenauftrags gemeinsam zeigen, wenn weiter entfernte Prüfungen keine lesbare Übersicht zulassen. In echten G8- und G9-Profilen sind A, B und der Verweis auf C bei 1024 × 650 und 1024 × 900 Pixeln vollständig sichtbar. Die Wagenkarte ist jeweils 189 Pixel breit. In 24 Browserfällen über beide Kurse und Bildungsgänge gelang der Wechsel B→A. Auf der großen Mathematiktafel öffnet die Grafik weiterhin bei 100 Prozent. Manuelles Einpassen zeigt alle 18 Einträge. [Kartenvergleich](hessen-physik-e1-vorschau.md#zwei-karten-vergleichen)

**Zur Sichtung.** Den abgeschlossenen E.1-Auftrag mit dem Einzelzielplan vergleichen, eines der elf Fachziele freiwillig beginnen und den Einheitenauftrag im Lernplan pausieren. Die Hauptlinie und der Kandidat verwenden eigene Profile. [Vergleich auf der Hauptlinie](http://localhost:5177/auftraege/G8) · [GK-Vergleich im Kandidaten](http://localhost:5189/auftraege/G8) · [LK-Vergleich im Kandidaten](http://localhost:5201/auftraege/G9) · [Prüfanleitung](hessen-physik-e1-vorschau.md)

K 0/13 und F 0/7 vollständig abgeschlossen. Das Paket aktiviert 0 zusätzliche Stufenpläne. Die technische Integration und die persönliche E.1-Teilabnahme stehen aus. Auf der Ausgangsfassung zählte die G8- und G9-Karte je 619 Ziele und 608 Beziehungen. Die Mathematikkarte umfasste 679 Ziele und 613 Beziehungen. Die ergänzende Vorhermessung im LK ergab für G8 und G9 je 666 Ziele, 72 Einheiten und 636 Beziehungen. In sämtlichen gemessenen Projektionen gab es null rückwärts gerichtete Beziehungen. Der erneute Kartenvergleich, die gemeinsame Browserprüfung und die vollständige CI gehören zum Integrationsnachweis. [Folge-PR #175](https://github.com/enpasos/skillpilot/pull/175)

## 21. November 2026, 08:35 MEZ – Direkte Lernziele in der hessischen Lernkarte und im Cockpit

In E.1 steht „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ unmittelbar unter dem Themenfeld. „Notwendige Grundlagen“ bleibt am Ziel als Herkunft lesbar. Die Wagenprüfung liegt ebenfalls direkt unter E.1. „Gleichmäßig beschleunigte Bewegung und Beschleunigung“ hat in Baum und Karte dieselbe Untereinheit. Die übergeordneten Navigationswurzeln von Baum und Karte unterscheiden sich weiterhin. Die Regel für reine Darstellungsgruppen gilt fachübergreifend. Sie erhält Prüfungsziele, fachliche Voraussetzungen und ausgewiesene Reihenfolgen.

**Wirkung in echten persönlichen Lehrplänen.** Chromium hat die vollständige Projektion der geöffneten Lernkarte vor und nach der Änderung einschließlich der Untereinheiten ausgewertet. In den beiden hessischen Physikprofilen G8 und G9 blieben je 619 Ziel-IDs, 61 Ebenen mit Beziehungen und 608 Beziehungen erhalten. Darstellungseinheiten gingen jeweils von 109 auf 72 zurück. Im hessischen G9-Mathematikvergleich blieben 679 Ziel-IDs, 50 Ebenen mit Beziehungen und 613 Beziehungen erhalten. Darstellungseinheiten gingen von 71 auf 62 zurück. In allen drei persönlichen Projektionen gab es vorher und nachher 0 rückwärts markierte Beziehungen. K 0/13 und F 0/7 vollständig abgeschlossen, 0 zusätzliche Stufenpläne aktiviert. [E.1 in G8](http://localhost:5177/nativ/G8/E1) · [E.1 in G9](http://localhost:5177/nativ/G9/E1) · [Mathematikvergleich](http://localhost:5177/vergleich/mathematik)

**Prüfungen und fachliche Sichtung.** Zwölf lokale Fälle mit Spring und dem Claude-MCP-Handler prüfen in beiden Bildungsgängen einen Einheitenauftrag allein und zusammen mit einem fälligen Einzelauftrag, jeweils bei 0, 2 und 4 bestandenen Teilen. In G8 und G9 prüfte Chromium bei drei Zielen den unmittelbaren Elternknoten in beiden Ansichten. Der Klick auf das Weg-Zeit-Ziel und ein gespeicherter Link zum früheren Grundlagenordner öffneten jeweils die Zielkarte. Die Belege blieben gleich. Auf dem Stand `59f5e3def6` starteten zwei isolierte lokale Spring-/H2-Profile (G8 und G9) nach bestandenen Teilen C und D mit je 17/20 BE den Teil A. Beide verließen A vor der Abgabe über die Bestätigung im Cockpit. A und B blieben offen. Die Belege für C und D behielten ihre Zeitstempel und Fassungsbindungen, der Einheitennachweis blieb bei 2/4 und die Einzelmastery unverändert. Für den Test war die Coach-Anmeldung simuliert. Die Qualitätsgrenzen bestehen für 21 Curricula und zwölf Teilbereiche. Die fassungsgebundenen Aufgaben, Raster und unabhängigen Fachentscheide sind in diesem Paket unverändert. Für die persönliche Teilabnahme eignen sich die Elternpfade in Baum und Karte, der Wechsel von der Wurf- zur Wagenprüfung sowie die Auswahl nach vier bestandenen Teilen. [Vorschau und Prüfschritte](hessen-physik-e1-vorschau.md) · [Physik-Qualitätsstand](../qa-ci/status/curriculum-quality-status.de.md)

**Technischer Abschluss am 21. November 2026, 11:04 MEZ.** Die technische Integration ist abgeschlossen. Die CI auf dem PR-Kopf `59f5e3def6` und auf dem integrierten Commit `d5c45c3830` bestand jeweils alle 14 Jobs. Auf der Basis `98b61309ac` hatte der Frontendtest nach der E.1-Lernkartenübung die fertige Karte der E-Phase innerhalb von 30 Sekunden nicht gefunden. Für die persönliche E.1-Teilabnahme stehen die getesteten G8- und G9-Profile bereit. Die weitere fachliche Ausarbeitung folgt anschließend Einheit für Einheit bis Q4. [Integrations-PR #174](https://github.com/enpasos/skillpilot/pull/174) · [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44880942724) · [Frontendfehler der Basis](https://github.com/enpasos/skillpilot/actions/runs/44878177547/job/136774171872) · [Implementierungscommit](https://github.com/enpasos/skillpilot/commit/d5c45c3830b374500fbfffb35e52dcc3797ccb55) · [Frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44886698380)

## 21. November 2026, 08:32 MEZ – E.1-Auftrag, Prüfungswahl und grafische Lernkarte

Die Lernkarte öffnet für alle Bildschirmbreiten direkt die Grafik. Der Umschalter zur Zielliste entfällt. Ein grünes Häkchen bedeutet eigener erfolgreicher Nachweis, dieselbe Form in Grau bedeutet belegte fachliche Anrechnung. Ein reiner Wegfall der Vorbereitung erhält ein Minus. Ein abgeschlossener Abschnitt ist im Cockpit eigens gekennzeichnet. Wer nur den Abschnitt nachweist, kann die einzeln offenen Ziele weiterhin sehen und bearbeiten.

**Kontrollstellen für die fachliche Sichtung.** Vom waagerechten Wurf zur Wagenaufgabe wechseln, nach C+D die verbliebenen Pflichtteile ansehen und nach A–D zwischen freiwilliger Vertiefung und einem zusätzlich gewählten Einzelauftrag unterscheiden. Die weitere Aufgabe zum waagerechten Wurf bleibt als freiwillige Zusatzprüfung mit eigenem Ergebnis erreichbar. [Einstieg in G8](http://localhost:5177/nativ/G8/B) · [Aufträge in G9](http://localhost:5177/auftraege/G9) · [Prüfabläufe](hessen-physik-e1-vorschau.md)

**Automatisierte Prüfungen und Reichweite.** In der laufenden Vorschau gelang der Wechsel B→A für G8 und G9 bei 390, 761, 1024 und 1440 Pixeln. Die lokalen OpenAI-/Gemini-Prüfungen umfassten 100 erfolgreiche Tests. Sie verwenden registrierte MCP-Handler mit kontrolliertem Backendstatus. Acht weitere Fälle im echten Claude-Handler prüften für G8 und G9 die hessischen Aufträge bei 0/4, 2/4 und 4/4 sowie einen zusätzlichen fälligen Einzelauftrag. Die fassungsgebundenen Aufgaben, Raster und unabhängigen Fachentscheide A–D behalten ihre bestehende Geltung. Eine persönliche Teilabnahme oder Erprobung im gehosteten Coach ist gesondert zu belegen.

**Integration und Rollout.** Der Product Owner hat [PR #173](https://github.com/enpasos/skillpilot/pull/173) um 07:52 MEZ in [`5a63a1f3bc`](https://github.com/enpasos/skillpilot/commit/5a63a1f3bce8aeb4c7ebab8b350e641522d9a8c4) integriert. Der Deployment-Check erkannte einen veralteten internen OpenAI-Entwurf. Nach Aktualisierung der erzeugten Entwurfsdateien auf [`98b61309ac`](https://github.com/enpasos/skillpilot/commit/98b61309acc16c32a00f1bf05151163c2f2ef617) meldete der Product Owner den erfolgreichen Produktionseinsatz. Der [CI-Lauf auf dem Merge-Commit](https://github.com/enpasos/skillpilot/actions/runs/44877576545) wurde durch den neueren Push abgelöst. Auf dem ausgelieferten Commit bestanden 13 von 14 Jobs, darunter die Backendtests. Die Frontend-CI erreichte beim Öffnen der E-Phasen-Tafel das Zeitlimit. [Main-CI zum ausgelieferten Stand](https://github.com/enpasos/skillpilot/actions/runs/44878177547)

K 0/13 und F 0/7 vollständig abgeschlossen. Dieses Paket aktiviert 0 zusätzliche Stufenpläne. Fachliche Voraussetzungen und Stufenplatzierungen blieben gleich. Für dieses Paket wurde kein neuer Rücklaufeffekt gemessen. Die persönliche E.1-Teilabnahme steht aus. [Umfang und fachliche Tiefe](hessen-physik-sekii-uebergabe.md)

## 20. November 2026, 16:37 MEZ (UTC+01:00) – Hessen Physik E.1 in G8 und G9

**Zur fachlichen Durchsicht.** Die Ballfrage eröffnet E.1. Drei Übungen und neun Themenkarten führen zu den vier Prüfungen. Wagen A verlangt 14/17, waagerechter Wurf B 15/18, senkrechter Wurf C und Beschleunigungsprotokoll D jeweils 17/20 Punkte. Vom Wurf aus lässt sich bei 1024 Pixeln die Wagenaufgabe wählen. Die Vergleichsprofile zeigen das Cockpit vor den Prüfungen, nach C+D und nach A–D. [Anleitung für G8 und G9](hessen-physik-e1-vorschau.md) · [Fachentscheid A/B](https://github.com/enpasos/skillpilot/blob/bea9d4329942a183424d2ff5615f10cdda7bdd8e/curricula/DE/Gymnasium/quality/release-model/physics-he-e1-partial-credit-review-2026-11-20.md) · [Fachentscheid C/D und kanonische Zuordnung](https://github.com/enpasos/skillpilot/blob/2c2505fecef3a3a8a561b472b52ba1f04a5a4cdb/curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-20-v3.md)

**Wirkung.** Nach C+D decken zwei fachlich begründete Anrechnungen zusammen mit den zwei Prüfungserfolgen vier Planpositionen. Nach A–D sind es sechs. Die Einheit ist dann bestanden und der Abschnitt zeigt vier von fünf Prüfungen. Ohne eigenen Nachweis bleiben alle elf Fachziele individuell offen. Im atomaren Plan mit 17 gewählten Zielen bleibt der nächste Vorschlag in allen drei Vergleichsprofilen „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“. Für den ausdrücklich gewählten Einheitenauftrag entschied der Product Owner am 20. November, dass A–D die Pflichtarbeit beenden. Nur ein gesonderter Auftrag kann weitere Pflichtarbeit begründen. Ein eigener Nachweis erhält ein grünes Häkchen, eine fachlich begründete Anrechnung ein Schild mit Häkchen. Ein freiwillig gewordenes Ziel erhält allein deshalb kein Häkchen. Chromium zeigte in G8 und G9 über E.1 und die Kindeinheit genau A–D als eigene Erfolge und die beiden freigegebenen Fachziele mit Schild. Das reale Vergleichsprofil mit einem zusätzlichen Einzelauftrag bietet weiterhin „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ an. Für den reinen Einheitenauftrag zeigt es nach 4/4 keinen weiteren Pflichtvorschlag. Das lokale Backend berechnete die Ergebnisse aus synthetischen Bewertungen im regulären MCP-Bewertungsweg. Die Vorschau aktiviert den standardmäßig ausgeschalteten Piloten. Echte Schülerantworten im Claude-Client und die persönliche Teilabnahme stehen aus. [Abnahmestand und Vertragsgrenzen](hessen-physik-sekii-uebergabe.md)

**Qualität.** Physik erreicht M7 mit 854 Zielen und 485/485 fachlichen Atomen je Qualitätsdimension. In acht hessischen Ansichten mit 367 Tafeln je Prüfstand hatte E.1 vor und nach der Änderung null Rückgriffe. Der bestehende Rückgriff Q2→Q1 liegt außerhalb von E.1. Die reguläre R1-Prüfung findet in allen neun einschlägigen hessischen Konfigurationen die eigenen C/D-Prüfungen der Unit-Revision 2026-11-20-v3. Zwölf Konfigurationen in BW/BY hatten bereits auf der Hauptlinie einen offenen R1-Befund. Für die Mathematik-Platzierung ergaben 1.036 geprüfte Bedarfsbeziehungen dieselben Ziele, Verbraucher und Zeitgrenzen. Bei verzögertem Laden des Kartenstapels wartet die Grafik mit der Bereitschaftsanzeige bis zur gesetzten Kamera. Auf der bereits sichtbaren Liste verursachten Material- und Fortschrittsaktualisierung bei 1024 Pixeln in zwei echten Projektionen keine grafische Neuanordnung. Der isolierte Paketstart bestand auf dem gemeinsamen Stand `f8f9a3805c` 15/15 lokale Prüfungen und der Backendtest lud das frisch aktivierte Mathematikpaket. [Physik-Qualitätsstand](../qa-ci/status/curriculum-quality-status.de.md) · [Originalbericht zum lokalen Paketlauf](https://github.com/enpasos/skillpilot/blob/2c2505fecef3a3a8a561b472b52ba1f04a5a4cdb/contracts/stage-plan-review-evidence/2026-11-20/hessen-e1-package-start/f8f9a3805c-smoke.actual.json)

Die reguläre Lernkarte und der Cockpit-Prototyp verwenden dieselbe Auswertung. Im separaten Prototypfall beendet ein direkter Prüfungsnachweis die Vorbereitung auf ein weiteres Ziel. Der Abschnitt ist damit abgeschlossen. Für das Fach ist ein Ziel von 55 nachgewiesen und im ausdrücklich gewählten Einzelzielplan eines von zwei. Der Browser prüft das neutrale Minus am entfallenen Ziel und das grüne Häkchen am Prüfungsziel.

Im Backendlauf auf `02ed9a8919` schlugen zehn Tests aus drei Klassen fehl. Sie erwarteten noch die frühere hessische Wurffassung oder einen alten internen Konstruktor für die Voraussetzungenprüfung. Die aktualisierten Tests prüfen die hessische Fassung C im ausdrücklich gewählten Klausurplan, A bis D auf den jeweiligen Lernkarten und die tatsächlich verwendete Berechnung der Lernfront. Alle 84 Tests der drei Klassen bestanden lokal. Die vollständige lokale Backendprüfung auf `7f6a701126` verwendete die sechs Buchdateien aus dem zugehörigen PR-Lauf. Von 2.924 Tests bestanden 2.905 und 19 wurden bedingt übersprungen. Die Klausur behält ihre neun fachlichen Ziele und drei gewählten Aufgaben. [Protokoll des vorherigen Backendlaufs](https://github.com/enpasos/skillpilot/actions/runs/44729930523/job/136278763709)

**Integration.** K 0/13 und F 0/7 vollständig abgeschlossen, 0 neue Stufenpläne aktiviert. Die dauerhafte Vorschau auf Port 5177 wurde am Implementierungsstand `a45ff1b502` im regulären Cockpit geprüft. Windows Edge zeigte in beiden Bildungsgängen den abgeschlossenen Auftrag im regulären Cockpit und den zusätzlichen offenen Einzelauftrag im Vergleich. Der vollständige lokale G8/G9-Browserlauf bestand einschließlich der vier Erststarts, des aktiven Einzelziels im gemischten Auftrag und des freiwilligen Einzelwegs. Der Quellstand der laufenden Vorschau und der Merge-Commit sind für die E.1-Anwendung, die Lernmaterialien und die Startlogik bytegleich. Als Nächstes prüft der Product Owner E.1 fachlich. Nach dieser Teilabnahme folgt die nächste Oberstufeneinheit. Die Gesamtfreigabe für Hessen erteilt er gesondert. [Vorschau und Prüfpunkte](hessen-physik-e1-vorschau.md)

PR #171 wurde um 15:29 MEZ mit dem geprüften Git-Baum in die Hauptlinie integriert. Die PR-CI auf `7f6a701126` bestand alle 14 Jobs. Auf dem integrierten Commit `dd71aebc55` endete die frische Main-CI um 16:36:49 MEZ mit 14 von 14 erfolgreichen Jobs. Damit ist die technische Integration abgeschlossen. [Hessen-PR #171](https://github.com/enpasos/skillpilot/pull/171) · [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44740035632) · [Implementierungscommit](https://github.com/enpasos/skillpilot/commit/dd71aebc552725eb2ca3f8fc72028b66d486904d) · [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44753951163)

Der frische Paketstart auf dem PR-Stand bestand 15 von 15 isolierten HTTP- und Browserprüfungen. Der Java-Test lud das aktivierte Paket. Im separaten Fachexport waren alle zehn Pakete reproduzierbar. Der optionale OWL-Roundtrip scheiterte am bereits bekannten Verlust der Schemaangabe in der Brandenburger Mathematikansicht. [Paketprüfung](https://github.com/enpasos/skillpilot/actions/runs/44740780037/job/136303601398) · [Fachexport](https://github.com/enpasos/skillpilot/actions/runs/44740780037/job/136303601033) · [OWL-Befund](https://github.com/enpasos/skillpilot/actions/runs/44740780037/job/136303602857#step:16:1)

## 20. November 2026, 13:04 MEZ (UTC+01:00) – Zwei offene Cockpit-Tabs

Die Registrierung eines Cockpit-Streams gibt die Datenbankverbindung frei, sobald das Profil unter der Transaktionssperre geprüft ist. Mit einer einzigen verfügbaren Verbindung lieferte ein paralleler Lernstandabruf vor der Korrektur HTTP 500 und danach HTTP 200. Zwei offene Tabs belegten danach zusammen null Poolverbindungen. Im HTTP-Test empfing der erste Tab weiterhin das Aktualisierungsereignis. Der Eingriff betrifft die Streamregistrierung. K 0/13 und F 0/7 vollständig abgeschlossen, 0 neue Stufenpläne und 0 geänderte Lernkartentafeln. Die Prüfpunkte sind der Lernstandabruf im zweiten Tab und die Aktualisierung im ersten Tab. [Implementierung und automatisierte Regression in PR #172](https://github.com/enpasos/skillpilot/pull/172)

**Integration abgeschlossen.** Der geprüfte PR-Stand `ea083c2b46` kam um 11:46 MEZ über den Merge-Commit `ca9e6831c4` auf `main`. Die vollständige PR-CI bestand mit 14 von 14 Jobs. Der frische Push-Lauf auf dem Merge-Commit endete um 13:03 MEZ ebenfalls mit 14 von 14 erfolgreichen Jobs. [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44710664415) · [Implementierung auf main](https://github.com/enpasos/skillpilot/commit/ca9e6831c47b329b8de095783a80e1d54318654c) · [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44722117370)

## 20. November 2026, 08:56 MEZ (UTC+01:00) – Prüfungen auf Verständnis bewerten

Im kanonischen Gymnasium-Katalog verlangen am Ausgangsstand 137 von 1.049 bepunkteten Prüfungen volle Punktzahl. In der Einheit „Natürliche Zahlen“ prüften die beiden Aufgaben bisher mit 13/13 und 17/17. Die neue Fassung erlaubt in beiden Fällen einen hinreichenden Nachweis mit 10/12. Für die übrigen 135 Fälle steht das fachliche Review noch aus. K1–K13 und F1–F7 erhalten durch dieses Paket keinen zusätzlichen Abschluss. Neu aktiviert wurden 0 Stufenpläne. Der Katalogvergleich ergibt unveränderte Kanten und Platzierungen.

**Für die fachliche Durchsicht** eignen sich die beiden [Aufgaben und ihre Grenzabgaben](https://github.com/enpasos/skillpilot/blob/6a04a80ee38d7788681c840edfeed9c24218ecac/curricula/DE/Gymnasium/quality/learning-units/math-natural-numbers-2026-11-20-v2.md). Beim Spendenlauf zählt eine richtig geschriebene Zahlenkette als Nachweis der darin gezeigten Vergleiche. Bei der Konzertkasse ist zu prüfen, warum zwei richtige Nachfolger allein die allgemeine Aussage über die natürlichen Zahlen offenlassen. Die gemeinsame [Coachanweisung](https://github.com/enpasos/skillpilot/blob/6a04a80ee38d7788681c840edfeed9c24218ecac/backend/src/main/java/com/skillpilot/backend/ai/ExamGradingGuidance.java) bewertet jedes Kriterium anhand der gesamten Abgabe und berücksichtigt Widersprüche dort, wo sie den Nachweis betreffen.

**Nachweise und Integration.** Das fachliche Gegenlesen anhand synthetischer Lösungen und der technische Grenzversuch sind getrennt dokumentiert. Im lokalen Claude-MCP mit Spring und H2 wurde bei beiden Prüfungszielen die Eingabe von 9 Punkten abgewiesen und die von 10 Punkten als bestandene Prüfung gespeichert. Die zusätzlichen Lernziele erhielten jeweils keinen Masteryeintrag. Das [katalogweite Prüfskript](https://github.com/enpasos/skillpilot/blob/6a04a80ee38d7788681c840edfeed9c24218ecac/scripts/check_exam_pass_marks.py) vergleicht neue und geänderte Materialien mit dem CI-Basiscommit. Der [PR #170](https://github.com/enpasos/skillpilot/pull/170) führt zur Integration. Nach erfolgreicher Main-CI folgen die Erprobung im Coach und die Überprüfung weiterer Vollpunktprüfungen nach Fach und Einheit.

Die G8/G9-Generierung prüft die Fassung des Mathematikkatalogs gegen zwei genehmigte Pläne für die Platzierung der Lernziele. Der Abgleich mit dem Basiscommit ergab bei 1.310 identischen Ziel-IDs ausschließlich neue Prüfungsdaten und Quellenverweise an den beiden überarbeiteten Aufgaben. Die beiden aktiven Bindungen verwenden nun den geprüften Kataloghash `cb40d5be…`. Alle 18 daraus erzeugten Daueransichten entsprechen den eingecheckten Dateien. [Fehlgeschlagener CI-Schritt und Ausgangsstand](https://github.com/enpasos/skillpilot/actions/runs/44682822375/job/136121439655)

Das Mathematikpaket enthält jetzt für jede der beiden Prüfungen eine eigene Aufgabenquelle. Das vollständige ZIP umfasst 1.121 Einträge mit 1.119 Manifestdateien, darunter dieselben 864 Medien. Der aktualisierte Prüfnachweis bindet den Paketinhalt `e9458739…` und die Eingabedateien des Release-Modells. Alle bisherigen Rechteentscheidungen sind erhalten. Für eine Veröffentlichung sind weiterhin 867 Prüfpositionen offen. [Paketprüfung des vorherigen Stands](https://github.com/enpasos/skillpilot/actions/runs/44689137269/job/136142403934)

## 20. November 2026, 02:05 MEZ (UTC+01:00) – Prüfungsbelege in Hessen Physik E.1

Ein bestandener, mit Claude bewerteter Prüfungsversuch erhält einen Beleg für die damalige Aufgabe und ihr Bewertungsraster. Das Cockpit zeigt Datum, Punktzahl und Bestehensgrenze am Prüfungsziel. Beim Besprechen einer angebotenen Prüfung sieht Claude den jüngsten gespeicherten Beleg für genau dieses Ziel. Die Anrechnung auf den Abschluss der gesamten Einheit ist ein eigener, noch offener Schritt.

**Zur Durchsicht.** In der lokalen Hessen-Ansicht die Aufgabe „Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit“ öffnen. Für zwei synthetische Profile hat der echte MCP-Prüfpfad 24 von 36 Punkten (G8) und 30 von 36 Punkten (G9) gespeichert. Unter „Deine Prüfungsnachweise“ erscheint in beiden Profilen die damalige Bestehensgrenze von 22 Punkten. Auf der Lernkarte lässt sich anschließend prüfen, dass die übrigen fachlichen Lernziele ihren bisherigen Stand haben.

**Prüfung und Stand.** Der [MCP-Integrationstest](https://github.com/enpasos/skillpilot/blob/5d2cb489dc9fafcdc30b289ec6c48384eebb738a/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CanonicalExamIntegrationTest.java) prüft den Weg vom Bewertungsraster bis zum gespeicherten Beleg. Der [Materialvergleich](https://github.com/enpasos/skillpilot/blob/5d2cb489dc9fafcdc30b289ec6c48384eebb738a/backend/src/test/java/com/skillpilot/backend/completion/AssessmentMaterialRevisionTest.java) prüft beide Aufgaben der Untereinheit gegen ihre fachlich geprüften Fassungen. Die [Tests zur persönlichen Sicherung](https://github.com/enpasos/skillpilot/blob/5d2cb489dc9fafcdc30b289ec6c48384eebb738a/backend/src/test/java/com/skillpilot/backend/service/VerifiedExamPassBackupIntegrationTest.java) behandeln Wiederherstellung, Altdaten und Fremdkopien. Alle 134 lokalen Backendtests aus den 14 ausgewählten Testklassen bestanden. Die Browserdurchsicht umfasste das deutsche Desktop- und Mobil-Cockpit sowie die englische Desktopansicht. Die Lernendenaufgabe ist bereits veröffentlicht. Diese Technikrunde enthält keine neue fachliche Aufgabenfreigabe oder Erprobung in Claude Web oder Android.

**Integration abgeschlossen am 20. November 2026 um 06:53 MEZ.** Alle 14 Jobs der frischen Main-CI für die Prüfungsbelege waren erfolgreich. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 neue reale Stufenpläne wurden aktiviert. Als Nächstes ist für E.1 zu prüfen, welche Kombination aus Teilnachweisen den Abschluss der Einheit trägt und was Lernkarte, Cockpit und Coach danach als offen ausweisen. [PR #169](https://github.com/enpasos/skillpilot/pull/169) · [Implementierungscommit `649d7ba0c1`](https://github.com/enpasos/skillpilot/commit/649d7ba0c15d0c436e736c2aa77bf1b15858456b) · [Main-CI mit 14 erfolgreichen Jobs](https://github.com/enpasos/skillpilot/actions/runs/44675318290)

## 19. November 2026, 21:41 MEZ (UTC+01:00) – Einstieg, Lernkarte und Coach-Kontext in Hessen Physik E.1

**Lokale Prüfrunde für G8 und G9.** „Ein Ball rollt vom Tisch. Wo landet er?“ eröffnet die Einheit. Die Lernenden nutzen vorgegebene Bewegungsdaten, um eine Vorhersage zu begründen. Drei Übungen schließen an die Ziele zu Modellierung, Sicherheitsabstand und waagerechtem Wurf an. Bei jeder Aufgabe lassen sich ein Hinweis und die Musterlösung getrennt öffnen. Die Übungen dienen der Selbstkontrolle. Die zweisprachigen Aufgaben stehen im Arbeitsbaum unter `curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json`.

**Zur Durchsicht.** Vom waagerechten Wurf die Lernkarte öffnen, „Lernkarten zu E.1“ wählen und anschließend die Phasenprüfung „Bewegungsanalyse und freier Fall“ ansehen. Beide verweisen auf die vorhandenen Lernziele. Der Themenstapel umfasst neun der 87 Phasenkarten. Drei Übungen öffnen sich direkt am jeweiligen Fachziel, auch in der mobilen Zielliste. Der Vergleich im echten Cockpit für G8 und G9 ergab in E.1 vorher 12 Knoten und 12 Pfeile, anschließend 14 Knoten und 14 Pfeile. Beide zusätzlichen Pfeile führen aus tatsächlich benötigten Themen zur Prüfung. In beiden Karten gab es vor und nach der Änderung null Rückgriffe. Vier Browserdurchläufe auf Desktop und Smartphone prüften den Einstieg, die drei Übungen, beide Ressourcen und den gespeicherten Lernstand. Die drei Modellrechnungen wurden separat fachlich gesichtet. [Browsertest](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsMemoryUi.ts) · [Prüfung der Projektionen](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsFlashcardActions.ts)

**Stufenübersicht im lokalen Cockpit.** Bei gemeinsamer Auswahl von Grund- und Leistungskurs lieferte der lokale Entwicklungsserver nur die Leistungskurssicht. Acht Grundkursaufgaben aus den beiden Abitur-Beispielklausuren erschienen dadurch auf der Stufenübersicht als „Vorbereitung“. Der Entwicklungsserver fragt bei konfiguriertem lokalem Backend nun dessen gemeinsame Kurssicht ab. Die Browserprüfung in Hessen G8 und G9 mit Mathematik und Physik im persönlichen Curriculum und nur Physik auf der Karte ergab jeweils vorher zehn Knoten und neun Pfeile, danach die beiden Schulstufen mit einem Pfeil. Unter Sekundarstufe II → Abiturprüfung liegen die acht Grundkurs- und acht Leistungskursaufgaben. Die Karten der Stufenübersicht, der Oberstufe und der Abiturprüfung zeigten nach der Änderung jeweils null Rückgriffe. Die gespeicherten Einzelnachweise blieben in allen vier Vorher- und Nachher-Durchläufen identisch. Die Screenshots und Messwerte stehen lokal unter `tmp/hessen-physik-e-lokal/pruefung-wurzel-20261119/testnotiz.md`.

**Im Gespräch.** Das Backend ordnet das bestätigte Lernziel in die persönliche Sicht ein. Zum Wurf gehören die Voraussetzungen „Bezugssysteme und Geschwindigkeitsüberlagerung“ und „Modellierung und Idealisierung von Bewegungen“. Der Coach sieht, für welche Voraussetzungen ein Einzelbeleg vorliegt. Ein bestätigter Erlass ist mit seinem Grund und dem geltenden Abschnitt gekennzeichnet. Auf Wunsch erhält der Lernende im Gespräch dieselbe Aufgabenstellung wie am Fachziel in der Karte. Die neun Karten lassen sich direkt im Gespräch in der Sitzungssprache üben. Das Öffnen der Karte setzt kein Lernziel, das Üben eines Teilstapels bescheinigt keinen Einheitenabschluss. Ein Erstversuch der Phasenprüfung ist im Gespräch möglich, wenn das Backend ihn anbietet. 128 automatisierte Backendtests in zwölf Testklassen bestanden, darunter die hessischen G8- und G9-Sichten, der englische Kartenstart, die Trennung von Einzelbeleg und Erlass und der Wechsel in eine Prüfung. Ein Gespräch im Claude-Client steht noch aus. [Coach-Kontext](../concept/skill-graph/knowledge-context.de.md)

**Abschlussfrage.** Das Lernversprechen und die Fachunterlage halten die Entscheidung zu vorgegebenen Messdaten fest. Ein eigenes Messprotokoll ist im Lernweg freiwillig. Der Abgleich der verlinkten Phasenprüfung mit ihrem Raster zeigt, dass selbst ohne die gesamte Fallaufgabe 19 Punkte bei einer Bestehensgrenze von 15 Punkten möglich sind. Dieser Befund gehört in die Diskussion über den Einheitenabschluss. [Abgrenzung der bestehenden Prüfung](../concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md#was-geschieht-mit-den-vorhandenen-prüfungen)

**Prüfung und Weiterlernen.** Direkte Versuche beginnen mit der ausdrücklichen Wahl einer angebotenen Prüfung. Ein früheres Opt-out im Profil sperrt sie nicht mehr. In G8 und G9 führte die Phasenprüfung aus E.1 bis zur Claude-Auswahl. Die reguläre Stufenansicht und der Einstellungsdialog wurden in beiden Bildungsgängen im lokalen Browser geprüft. Unter „Angerechnete Lernziele weiter einplanen“ wählen Lernende, ob der Plan auch individuell noch offene angerechnete Ziele zum Weiterlernen vorschlägt. Ein freiwilliges Fachziel können sie unabhängig davon wählen. Der Prüfungsnachweis bleibt dabei bestehen.

**Claude.** Der lokale 1.1.15-Kandidat hat 47.454 Bytes. Zwei separate Builds waren byteidentisch. Für die Verpackung und Anweisungen bestanden 188 automatisierte Tests, für die Release-Verträge und den Direktdownload weitere 64. Die eigenständige Marketplace-Prüfung erfasste 33 Fälle und der Support-Test 18. Zwei strikte CLI-Validierungen und eine isolierte lokale Installation bestanden. Die Prüfläufe belegen das Paket und die lokalen Zugänge. Die Erprobung im tatsächlichen Claude-Chat steht aus. [Releaseprotokoll](../deploy/claude-personal-marketplace-release.md)

**Integration abgeschlossen.** [PR #167](https://github.com/enpasos/skillpilot/pull/167) ist auf `main` integriert. Die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44583827202) bestand mit 14 von 14 Jobs. Der [Merge-Commit `afcfc111ea`](https://github.com/enpasos/skillpilot/commit/afcfc111ea7ca990c665f446c558b23f5dd6f7eb) enthält denselben Git-Baum. Seine [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44599563115) endete am 19. November 2026 um 21:40 MEZ mit 14 von 14 erfolgreichen Jobs. Der Nachweis gilt für diesen Implementierungscommit. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 zusätzliche Stufenpläne wurden aktiviert. Die nächste fachliche Durchsicht betrifft die drei Übungsabschlüsse und den Entwurf für einen vollständigen E.1-Nachweis. Die Freigabe der Hessen-Vorlage durch den Product Owner steht aus.

## 19. November 2026, 09:55 MEZ (UTC+01:00) – Verstehenslernziele im Claude-Coach

Der Claude-Coach **1.1.14** und die zugehörigen Backend-Anweisungen greifen die Rückmeldung eines Schülers aus der Claude-Beta auf. Bei „Weiß ich noch nicht“ erklärt der Coach einen neuen Begriff an einem Beispiel. Wer eine Vorstellung mitbringt, kann sie besprechen. Eine Rückfrage kann auch nach einer Aufgabe direkt ins Gespräch führen. Zur Durchsicht eignen sich der Einstieg am Fahrradtacho und die Frage, warum bei der Beschleunigung die Sekunde zweimal in der Einheit steht. Ein selbstständiger Nachweis ist weiterhin erforderlich, bevor der Coach ein Fachziel als erreicht speichert. [Beispielgespräche und Fragen für die Erprobung](../concept/didactic/claude-beta-erklaeren-2026-11-19.de.md)

182 automatisierte Paketprüfungen und 78 Backend-Vertragstests bestanden lokal. Die Erprobung im tatsächlichen Claude-Chat mit dem Schüler steht aus. [PR #164](https://github.com/enpasos/skillpilot/pull/164) ist auf `main` integriert. Der Product Owner übernimmt das Produktionsdeployment. Der persönliche Marketplace liefert 1.1.14 aus. Die öffentliche Neuinstallation und das Update einer bestehenden Claude-Code-Installation von 1.1.13 wurden an allen sieben Dateien geprüft. [Marketplace-Veröffentlichung](https://github.com/enpasos/skillpilot-claude-marketplace/pull/17) · [Marketplace-CI](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/44491443543) Für K1–K13/F1–F7 kommt damit kein weiterer Abschluss hinzu. Es wurden 0 reale Stufenpläne aktiviert und keine curricularen Kanten geändert. [Claude-Skill](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md#coaching-and-completion) · [Backend-Vertragstests](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1LearningPlanContractTest.java)

## 19. November 2026, 15:24 MEZ (UTC+01:00) – Hessen, Physik in der Einführungsphase

**Stand der gemeinsamen Erprobung.** Die Platzierungen für G8 und G9 sind auf `main` integriert. Die fachliche Abnahme durch den Product Owner steht aus. K 0/13 und F 0/7 sind vollständig abgeschlossen, 0 zusätzliche reale StagePlans sind aktiviert. Der Product Owner hat [PR #164](https://github.com/enpasos/skillpilot/pull/164) als `039a7c39d9499a77694652959cb153c01cd6918c` integriert. Die [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44491281472) und die [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/44482845166) endeten jeweils mit 13 von 14 erfolgreichen Jobs. Von 2.844 Backend-Tests scheiterte auf `main` einer. Er erwartete den bisherigen Prüfungsordner in der E-Phase. [PR #165](https://github.com/enpasos/skillpilot/pull/165) prüft die einzelnen Platzierungen in G8 und G9. Im [ersten vollständigen Reparaturlauf](https://github.com/enpasos/skillpilot/actions/runs/44493719219) bestand das Backend. Der Frontend-Test fand ein ungültiges Format im Veröffentlichungsnachweis für Claude 1.1.14. Der Nachweis verwendet jetzt das für PR, beide CI-Läufe und Verifikation festgelegte Format. Nach der Korrektur scheiterte die Installation von Ubuntu-Paketen für Chromium auf mehreren Runnern, auch beim zweiten Versuch. Die CI kann die signierten Ubuntu-Pakete jetzt zusätzlich über den Spiegel der UC Davis beziehen. Die 13 in den Fehlermeldungen genannten Pakete waren dort per HTTPS erreichbar. [Gemini-Wiederholung](https://github.com/enpasos/skillpilot/actions/runs/44522712716/job/135559580647) · [Assessment-Completion-Job](https://github.com/enpasos/skillpilot/actions/runs/44522712653/job/135555182372)

**Abschluss der CI-Reparatur.** Auf Wunsch des Product Owners wurde [PR #165](https://github.com/enpasos/skillpilot/pull/165) während des laufenden PR-Checks in `main` integriert. Der [PR-Lauf auf `107db96596`](https://github.com/enpasos/skillpilot/actions/runs/44525665807) endete mit 14 von 14 erfolgreichen Jobs. Der [Implementierungscommit `9d8bc8492a`](https://github.com/enpasos/skillpilot/commit/9d8bc8492aa82475ad7e6ee72741b2fe247a76b6) enthält denselben Git-Baum. Seine [frische Main-CI](https://github.com/enpasos/skillpilot/actions/runs/44531180934) endete am 19. November 2026 um 15:23 MEZ mit 14 von 14 erfolgreichen Jobs. Der Regressionstest prüft 18 Prüfungsplatzierungen für G8 und G9 mit GK, LK und der gemeinsamen Auswahl GK+LK. Beim simulierten Ausfall der beiden bisherigen Quellen lud APT das Paket über den Ersatzspiegel und prüfte es anhand des signierten Paketindexes.

**Ergebnis.** In acht hessischen Physikansichten liegen 17 der 21 zuvor in vier Sammlungen geführten Prüfungen direkt beim Thema oder bei den Methoden. Vier Prüfungen haben einen gemeinsamen Platz auf Phasenebene. Davon öffnet sich „Bewegungsanalyse und freier Fall“ auch direkt aus E.1. Die bestehenden kanonischen Angaben verlangen für diese Aufgabe Tabellenkalkulation, obwohl die Aufgabe rechnerisch gelöst wird. Ob die Aufgabe die hinterlegten Kompetenzen vollständig nachweist, bleibt eine eigene fachliche Frage. Die qualitative Reibung liegt jetzt bei den Kräftebilanzen in E.2. Die beiden Zugänge zum Lernkartenstapel bieten wahlweise die E-Phase oder die zum Thema gehörigen Karten an. Die fünf Ordnungspfeile der Oberstufe bleiben bei der Auswahl einer Einheit lesbar.

**Zur Durchsicht im Cockpit.** In der Einführungsphase den Gesamtstapel öffnen, in E.1 die thematische Kartenauswahl und die Prüfung zum freien Fall ausprobieren und auf der Ebene darüber bei ausgewähltem Q2 die übrigen Pfeile betrachten. Die vorhandenen Prüfungsaufgaben und ihre Bewertungsraster wurden für die Platzierung unabhängig inhaltlich gesichtet. Bei allen acht geänderten Sichten ergab die Messung der verschachtelten Einheiten jeweils null Rückgriffe vor und nach der Änderung. Im G9-Grundkurs verringerte sich die Zahl der sichtbaren Verbindungen auf der Phasenkarte von 15 auf 10. Im echten lokalen Cockpit ließen sich die Originalprüfung und die neun Themenkarten in G8 und G9 mit Grundkurs öffnen. Die eigenständigen Browsertests prüfen auch, dass die letzte Bewertung eines Themenstapels gespeichert wird und den Gesamtstapel offen lässt, solange weitere Karten ausstehen. Die vollständige lokale Physikprüfung bestand für alle 90 Ansichten. Zusätzlich bestanden alle acht Tests zur Einordnung der Methoden. Die übergreifende Strukturprüfung erfasste 387 Ansichten aus 21 kanonischen Landschaften und meldete 0 Fehler und 2.576 Warnungen. Für die nächste Runde hat der Product Owner einen motivierenden Einstieg und einen sichtbaren Übungsabschluss in E.1 angesprochen. [Generatortests](https://github.com/enpasos/skillpilot/blob/main/scripts/test_generate_hessen_physics_stage_views.py) · [Tests der realen Kartenprojektionen](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testHessePhysicsFlashcardActions.ts) · [Browserprüfung der Pfeile](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testNativeLearnerMapUi.ts)

<!-- composition-partial-order-20261117:start -->
## 17. November 2026, 13:53 MEZ (UTC+01:00) — Fachliche Teilordnungen in allen Länderansichten

**Aktueller Integrationsstand:** [PR #160](https://github.com/enpasos/skillpilot/pull/160)
ist am 17. November integriert. Der vollständige
[PR-CI-Lauf 44062503114](https://github.com/enpasos/skillpilot/actions/runs/44062503114)
auf `f62482036186a5c3afc9e58059509922d64f0e8a` ist mit **14 erfolgreichen Jobs**
abgeschlossen. Der integrierte Implementierungscommit
`05eabe5a43d0b07e3845189b5d14d82326f76ce8` hat exakt denselben Git-Baum.
Seine frische [Main-CI 44075738245](https://github.com/enpasos/skillpilot/actions/runs/44075738245)
ist am 17. November um **13:51:57 MEZ mit 14 von 14 erfolgreichen Jobs**
abgeschlossen. **Diese begrenzte Länderlieferung ist damit abgeschlossen.**
Die Jobzahl gehört ausschließlich zu diesem CI-Lauf. Der kleine spätere
Dokumentationsabschluss erhält eigene Dokumentationschecks; der vollständige
Implementierungsnachweis gilt für den hier genannten Commit.
Weiterhin sind **K 0/13 und F 0/7 vollständig abgeschlossen** und **0 neue
reale StagePlans aktiviert**. Die unten dokumentierten Inhaltsreviews,
Lernendenaufgaben, Kartenmessungen und automatisierten Prüfungen bleiben
voneinander getrennte Nachweise. Die folgenden CI-Zwischenstände sind
Historie; ihre damaligen offenen Integrationsschritte gelten nicht als
Beschreibung des jetzigen Merge-Status.

**Historischer Zwischenstand vor den folgenden CI-Korrekturen:** [PR #160](https://github.com/enpasos/skillpilot/pull/160)
ist offen. Der vollständige [PR-CI-Lauf 44025354365](https://github.com/enpasos/skillpilot/actions/runs/44025354365)
endet auf `2c20e11117c130f898b42d929078cd673094590f` mit **10 erfolgreichen
und 4 fehlgeschlagenen Jobs**. Die frühere Aussage um 06:31, sämtliche lokalen
Prüfungen seien abgeschlossen, war zu weitgehend: Zwei generierte Mathematik-
Ausschnitte, der Physik-Visualisierungsstatus und mehrere an die alte Gliederung
gebundene Testannahmen waren nicht aktuell. Die Korrekturen sind jetzt lokal
unabhängig geprüft: **240/240 Tests der vier betroffenen Backendklassen**
bestehen. Die exakten 52 Controller-Fixtures binden Auswahl und unbeschnittene
Lernbasis; reine Dauer-Kompatibilitätsfälle sind keine amtlichen Angebote.
Mathematik und Physik
bleiben im erneut ausgeführten Qualitätsstatus global M7; die geschützten
Untergrenzen bestehen. Merge und frische erfolgreiche Main-CI stehen aus.
Dieser Eintrag aktualisiert den Lieferstand der darunter erhaltenen früheren
Berichte; deren Zahlen und geprüfte Commitbindungen bleiben historische Belege.

**Zweiter CI-Nachtrag:** Der anschließende vollständige
[Lauf 44037739517](https://github.com/enpasos/skillpilot/actions/runs/44037739517)
auf `bce7769b25b5c4f37dc68dace3484d21b590b5d6` endet mit **11 erfolgreichen
und 3 fehlgeschlagenen Jobs**. Ursachen sind ein veralteter G8/G9-Bericht,
alte Navigationsannahmen im Lernzielauswahltest und fehlende Python-
Abhängigkeiten im integrierten Paketbau. Alle 16 Paketgrenztests bestehen
nach der Abhängigkeitskorrektur in einer frischen Python-Umgebung.

**Zusätzlich behobener Fokusfehler:** Die unabhängige Gegenprüfung der
Navigation fand einen echten Laufzeitfehler: In der kanonischen Ansicht
blieben beim Fokus auf Mathematik J8 nur 28 der 40 kanonischen Atome erhalten.
Der Fokus liest jetzt bei kanonischen Wurzeln deren kanonische Unterziele;
synthetische Einheiten behalten ihre tatsächlichen sichtbaren Kinder. Die
sichtbaren Fokusmarkierungen erfassen genau die ausgewählten Blätter. Der
unabhängige Review besteht für alle sechs Fälle aus kanonischer bzw.
bayerischer Ansicht und drei direkten Routen: jeweils **40/40 Fokusatome**,
vollständig erhaltene Lernbasis, 831 Gleichheitsprüfungen synthetischer
Gruppen und 30 exakte Markierungsfälle. Die ursprüngliche Gegenprobe mit
0/40 Atomen bei direkter Route hatte die App-Reihenfolge ohne vorhandene
Scope-Metadaten nachgebildet; sie ist ausdrücklich kein bestätigter
Laufzeitfehler. Die korrigierte Gegenprobe und der anschließende Review sind
getrennt erhalten.

Die Auswahlprüfung bewahrt den exakten kanonischen J8-Umfang mit 48 Knoten
und 40 Atomen. Die Prisma-Prüfung verwendet ein tatsächlich ausgewähltes
Kursziel und dessen 34 atomare Lernziele mit 33 kanonischen
Voraussetzungspfaden. Die Quellverdrahtung von App über useAppCore bis zum
Fokusmemo ist geprüft. Dies sind UI-Logik- und Quellenprüfungen, keine
zusätzliche Browser-/HTTP-Abnahme. Der neue Fünfdateistand samt separatem Workflow-Reihenfolgenachtrag ist
unabhängig freigegeben. Der Vite-Produktionsbau, Typecheck, Lint der geänderten
TypeScript-Dateien, neun CI-Strukturtests und 42 nachfolgende lokale
Prüfschritte bestehen; weitere unveränderte Frontend-Prüfungen laufen. Erfolgreiche vollständige
PR-CI, Merge und frische Main-CI stehen weiterhin aus.

**Dritter CI-Nachtrag:** Im [Lauf 44050515021](https://github.com/enpasos/skillpilot/actions/runs/44050515021)
auf `a5f0dceeb2bb99aa5b13bbbf3e214b72349f8418` sind abschließend **13 von 14
Jobs erfolgreich**, einschließlich des Backends. Der Frontendjob scheitert nach erfolgreichen
UI-Prüfungen und Anwendungsbau ausschließlich am veralteten Zielzähler im
Transparenzinventar: 6.657 statt 6.666. Die neun neuen Physikprüfungen erklären
die Differenz. Der korrigierte Zähler ist unabhängig über alle 21 Kanonmodelle
nachgerechnet; sämtliche anderen Inventurangaben bleiben bytegleich.
Vollständiger lokaler Inventurcheck und bestehende Negativregressionen bestehen.
Die [separaten Belege](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-followup-v3/README.md)
enthalten keine neue inhaltliche oder rechtliche Freigabe. Die zunächst
protokollierte Beobachtung mit noch laufendem Backend bleibt als Zeitpunktbeleg
erhalten. Die korrigierte Lieferung benötigt einen neuen vollständigen
PR-CI-Lauf; Merge und Main-CI bleiben offen.

- **Fortschritt:** weiterhin **K 0/13 und F 0/7 vollständig abgeschlossen**,
  **0 neue reale StagePlans aktiviert**. Geliefert werden 100 Mathematik- und
  90 Physik-Composition-Views für alle 16 Länder und die kanonische Sicht,
  einschließlich der anwendbaren G8-/G9- und Einzelstufenvarianten. Die Länder-
  und Quellenprüfung verbessert K12/K13 sowie F1–F6, schließt deren gesamten
  Auftrag aber nicht allein ab.
- **Modellentscheidung:** explizite fachliche `after`-Teilordnungen ersetzen
  unbegründete Gesamtabfolgen. Atomare Voraussetzungen bleiben erhalten;
  erforderliche Grundlagen erhalten einen belegten Erwerbsplatz. Hessen E.1
  → E.2 → E.3 bleibt geordnet, E.4–E.7 bilden keine gegenseitige Kette.
  Spezielle Relativitätstheorie erhält keine künstlichen Q4-Vorgänger.
  Quellenmitgliedschaft, amtliche Zeitgranularität und Lernplatz bleiben getrennt.
- **Gemessene Kartenwirkung:** 216 native Kontexte, **708 Stufen- und 36.051
  verschachtelte Bretter**, **0 Rückpfeile, 0 Kreise, 0 fehlende erklärte
  `after`-Beziehungen**. Der kontrollierte Vergleich derselben aktuellen
  Messlogik mit eingefrorenen alten Ansichten erfasst 1.148 problematische
  Bretter mit insgesamt 1.432 Rückpfeil-, 884 Kreis- und 1.666 fehlenden
  Ordnungsbefunden; Mehrfachvorkommen sind keine eindeutigen Kanten. Dies ist
  kein erneuter Lauf einer alten Runtime. Exakte native S/L-Vergleiche:
  133 unverändert, 63 quellenbegründete neue Sek-I-Auswahlen, 20 ausschließlich
  durch geprüfte Aufgaben ergänzte Kontexte, 0 unerwartete Umfangsänderungen.
- **Grenze der bisherigen Messung:** Die 216 Kontexte verwenden gleiche
  Kursprofile für Mathematik und Physik. Die zusätzliche Hessen-Prüfung mit
  54 gemischten Kurs-/Stufen-/Dauerkontexten zeigt acht bislang fehlende
  `after`-Erklärungen beim Erwerb der Produktregel. Diese Fälle gehören zum
  laufenden Folgepaket; die obigen Nullwerte gelten nicht pauschal für alle
  Kombinationen. Zusätzlich sind 36 Hessen-Kontexte mit nur einem gewählten
  Fach nativ erfasst; ihre sichtbaren Karten sind noch nicht abgenommen.
- **Neu gefundene Folgearbeit:** Die getrennte unabhängige Kinematikprüfung
  beanstandet die Vollabdeckungsangaben von fünf älteren Aufgaben. Ein sichtbarer
  kanonischer Physik-Vorbereitungsordner trägt außerdem einen irreführenden
  GK-Abiturtitel. Beide Befunde sind im aktiven Folgeauftrag erfasst. Die oben
  genannte M7-Angabe beschreibt den generierten Qualitätsstatus des Bestands;
  dieser CI-Nachtrag ist keine erneute inhaltliche Vollfreigabe aller Aufgaben.
- **Aufgaben und Review:** neun neue eigene Physikaufgaben schließen echte
  Prüfungsendpunktlücken in vorhandenen Kompetenzen. Unabhängige inhaltliche
  Agentenreviews prüfen beide Sprachfassungen, Kompetenzabdeckung und Rubriken.
  Drei Aufgaben erhalten zusätzlich die fachlich geprüfte fehlende
  Inhaltszuordnung zur Bewegung. Aufgabeninhalte und atomare Voraussetzungen
  werden dadurch nicht verändert. Das sind keine menschlichen Lernversuche
  und keine nachgewiesene Lernwirksamkeit.
- **Automatisierte Nachweise:** tatsächlicher HTTP-Vergleich aller 432
  Antwortinhalte, 160 Länder-Browserbretter und 60 zusätzliche Hessenbretter
  bestanden; Typechecks, Lint, Schemas, Graph- und Quellenprüfungen sind
  separat protokolliert. Die vollständige Qualitätsgenerierung, ihr aktueller Statusvergleich
  und die geschützten Untergrenzen bestehen. Beide Mathematik-Modellexporte
  sind in allen 213 Dateien bytegleich; reproduzierbare ZIP und sechs
  Offlinegates bestehen. Der CI-Nachtrag reproduziert nach der MV-/SL-Korrektur
  ebenfalls alle 213 Modelldateien bytegleich und besteht alle sechs Offlinegates
  mit dem neuen Digest `c2df283bfd35…`. Sechs betroffene native Kontexte behalten
  exakt S/L und zwölf bytegleiche Kartenfixtures; 18 Stufen- und 822 Innenbretter
  wurden erneut gemessen. Alle Belege sind dauerhaft gebunden.
- **Kontrollstellen für den Owner:** Hessen G8 und G9 → Physik → E-Phase
  (Wurf bei E.1, verzweigende E.4–E.7); Hessen → Q4 (unabhängige SRT);
  Mathematik/Physik in einem anderen Land → Sek I und Sek II mit den
  quellenbelegten Jahres-/Phasenbändern und vorhandenen Abiturangeboten.
- **Belege:** [Modell und Laufzeit](composition-view-partial-orders-2026-11-16.md),
  [Mathematikquellen](mathematics-stage-view-source-units-2026-11-17.md),
  [Physikquellen](physics-stage-view-source-units-2026-11-17.md),
  [unabhängige Reviews und aktuelle Kartenmessung](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-16/composition-partial-order-v1/README.md).
  Zusätzlich: [unabhängige CI-Reparaturreviews, 240 Backendtests und Paketneubau](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-repair-v1/README.md).
  Der [zweite CI-Nachtrag mit unabhängigem Fokusreview](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-17/partial-order-ci-followup-v2/README.md)
  bindet die aktuelle Korrektur und bewahrt die früheren Gegenbefunde.
  Die Paket-Redistributionsfreigabe bleibt dort, wo menschliche Freigaben
  ausstehen, ausdrücklich offen. Keine Produktionsbereitstellung.
- **Nächster Schritt:** die Mathematik-Physik-Verzahnung mit den realen
  Hessen-Plänen für G8/G9 und unabhängig gewählten Kursprofilen zusammenführen,
  fachliche Voraussetzungen und eigene Aufgaben prüfen sowie die tatsächlichen
  verschachtelten Karten erneut messen. Dieser getrennte aktive Folgeumfang
  und die vollständigen K1–K13-/F1–F7-Aufträge sind noch nicht abgeschlossen.
<!-- composition-partial-order-20261117:end -->

## 17. November 2026, 06:31 MEZ (UTC+01:00) — Nachtrag zum Abschluss von PR #159

Die beim damaligen Bericht noch laufende Main-CI ist inzwischen abgeschlossen.
Der zum Merge von [PR #159](https://github.com/enpasos/skillpilot/pull/159)
ausgelöste [CI-Lauf 43832099252](https://github.com/enpasos/skillpilot/actions/runs/43832099252)
bindet den Implementierungscommit
`9975a142f7a26f1c4ff31c46a70e149d82a3fce5` und ist vollständig erfolgreich:
**14 von 14 Jobs dieses konkreten Laufs**. Status und einzelne Jobs wurden
am 17. November erneut abgerufen; es wird kein neuer CI-Lauf an diesem Tag
behauptet. Die technische Integrationsbedingung dieses Pakets ist damit erfüllt.
Zusätzliche K-/F-Gesamtabschlüsse folgen daraus ohne erneute Inhaltsprüfung
nicht. Der nachfolgende Bericht bleibt als damaliger Zwischenstand erhalten.
Die noch laufende Lieferung in PR #160 braucht ihre eigene vollständige
PR-CI und anschließend ihre eigene frische Main-CI.

## Historischer Gesamtstand vom 16. November 2026, 09:40 MEZ

**Stand: 16. November 2026, 09:40 MEZ (UTC+01:00).**

**Integration:** [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist
nach einer vollständigen erfolgreichen PR-CI mit **14/14 Jobs** auf `main`
integriert, Commit `9975a142f7`. Die frische Main-CI läuft. Bis zu ihrem
vollständigen Erfolg bleibt das Umsetzungspaket offen; die folgenden Zahlen
sind keine Deployment- oder Unterrichtsabnahme.

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert.** K4, K6, K8 und F7 sind eng abgegrenzte Abschlusskandidaten. Ihre
aktuellen Eingangsbindungen werden vor dem Abschluss noch einmal gegen den
integrierten Stand geprüft; laufende CI und Teilumsetzungen werden nicht gezählt.

**Wirkung der integrierten Kartenreparatur:** Die tatsächlich exportierten
kanonischen Karten haben oben **0 Rückpfeile und 0 freistehende eigene
Fachziele** in GK, LK und GK+LK. Zwölf ergänzende Fachkartenfälle sichern
Mathematik und Physik getrennt ab. Notwendige Fremdfachvorbereitung bleibt
Teil der Lernbasis. Innen verbleiben **8/9/9 Pfeile mit 20/23/25 atomaren
Ursachen**; die sieben zusätzlich vom früheren Kandidaten erzeugten Ursachen
sind entfernt. Im getrennten kanonischen Sek-I-Ausschnitt bleiben sieben
innere Pfeile und ein Außenatom offen.

**Länderbreite:** Der letzte vollständige regionale Vergleich vom
15. November, 23:49 MEZ, enthält **57 zulässige regionale Kontexte, davon 39
mit obersten Rückgriffen**. Die gesamte 72er-Matrix enthält zusätzlich drei
kanonische und zwölf widersprüchliche Dauerkontexte. 35/60 zulässige
Gesamtkontexte haben Außenatome. Diese ältere Messung ist kein frischer
Gesamtreplay des integrierten Standes und deckt keine unabhängig gemischten
Fachprofile ab. Die engeren aktuellen Nachmessungen ersetzen sie nicht.

| Umfang | Geliefert und noch offen |
| --- | --- |
| K1, K2 | Elementarer Halbleiterpfad und echte Diagrammaufgaben geliefert. Materialklassifikation, weitere Physikanschlüsse und vollständige Länder-/Jahrgangszuordnung bleiben offen. |
| K4, K6, K8 | Die ursprünglichen begrenzten Stufen-/Voraussetzungsbefunde sind unabhängig geprüft. Abschluss erst nach aktueller Eingangsbindung und frischer grüner Main-CI; weitere innere Rückgriffe bleiben getrennt offen. |
| K3, K5, K7, K9–K11 | Aufgaben, Quellenrollen und Platzierungen teilweise repariert; weitere Länderfälle und Außenatome bleiben offen. Die historische Freifallaufgabe behauptet weiterhin eigene Versuchs-/Tabellenleistungen, die ihr Text nicht verlangt. |
| K12, K13 | Physik-Erwerbsrouten und einzelne Stufensichten korrigiert; die vollständige Prüfungsvoraussetzungsbereinigung und Ableitung aller Stufensichten fehlen. |
| F1, F2 | Gemeinsamer Vertrag 1.3 und verschachtelte Jahre/E-/Q-Phasen vorbereitet. Vollständige Paket-/Laufzeitanbindung und reale Landesplanaktivierung fehlen. Der HE-Pilot umfasst weiterhin G8 und G9. |
| F3, F4, F6 | Kanonische oberste Karten bereinigt; Diagnose berücksichtigt jetzt echte Fach-/Kurskombinationen. Reale Plankarten, Vorbereitung am ersten Bedarf und gemessene innere Wirkung bleiben offen. Die Berichtgrenze von 1.024 Kombinationen ist ausdrücklich keine Abnahme für 20 Fächer. |
| F5 | Der vollständige fachliche Befundbestand bleibt offen; einzelne unabhängige Fachreviews ersetzen diesen Abschluss nicht. |
| F7 | Zweisprachige Zielnorm und Abgrenzung vom Laufzeitbestand sind mit #159 integriert. Abschluss wartet auf frische Main-CI. |

**Nächstes lokales Paket:** HE-Planquellen sowie Paket- und Laufzeitleser liegen
getrennt auf `feat/stage-plan-he-runtime-20261116`. 69 gezielte Java-Tests
bestehen; ein echter Mathematik-Quellenfragment-Replay besteht ebenfalls.
Das ist noch kein vollständiger aktivierter Landesplan oder erfolgreicher
vollständiger Paketexport. Echte Hessen-Messungen zeigen, dass Stufenumfang
nicht aus dem Lernzeitpunkt abgeleitet werden darf. Deshalb erhält die volle
Autorität ausdrückliche Stufenmitgliedschaften; Jahrgangs-/Phasenplätze bleiben
eine separate, eindeutige Zuordnung. Die neue Auswahl ist bislang nur im
Schema und TypeScript-Materialisierer umgesetzt. Sie ist nicht aktiviert.

Die [Übergabe](stage-plan-units-handover-2026-11-15.md) bleibt die vollständige
Auftragsliste. Die [unabhängige Restauftragsprüfung](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/current-scope-review-v1/README.md)
und der [spätere K8-Nachreview](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/k8-current-delta-independent-v1/README.md)
behalten ihre ausdrücklich benannten Prüfstände; sie werden nicht stillschweigend
zu neuen Gesamtabnahmen erklärt. Frühere Zwischenzahlen und Fehlversuche
bleiben in der Git-Historie und den unveränderten Belegen erhalten.

## 16. November 2026, 09:40 MEZ — Reviewbefunde und gebündelte CI-Korrekturen

**Stand: [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist nach
14/14 erfolgreichen Jobs seiner vollständigen PR-CI auf `main` integriert
(`9975a142f7`). Die frische Main-CI läuft; das Paket ist noch nicht abgeschlossen.
Frühere Paket-, Browser- und Fachnachweise behalten ihren jeweils gebundenen
Implementierungsstand.**

- **Fortschritt:** K 0/13, F 0/7 abgeschlossen, 0 reale Landespläne aktiviert.
  Kanonisch oben: 0 Rückpfeile und 0 freistehende eigene Fachziele, auch in den
  zwölf getrennten Fachkartenfällen. Regional bleiben 39/57 Fälle mit obersten
  Rückgriffen; 35/60 zulässige Gesamtkontexte haben Außenatome. Der gepushte Stand
  `b81b585d0` erreicht innen frisch gemessen wieder 8/9/9 Pfeile
  statt 11/12/12 am vorherigen Kopf. Diese verbleibenden Pfeile bleiben eine Restaufgabe.
- **Ergebnis:** Skalar- und Vektorprodukt liegen gültig in Sek II; frühe
  Messgrundlagen und notwendige Fremdfachvorbereitung bleiben erreichbar.
  Gegenüber main enthält das Paket 57 neue Physik- und 44 Mathematikaufgaben.
  Aufgabeninhalt, Rubriken, Quellenrollen und Platzierungen wurden getrennt
  geprüft. Die Jahrgangs-/Phasenstruktur ist im gemeinsamen Planvertrag
  vorbereitet; damit ist noch kein realer Landesplan aktiviert.
- **Entscheidungen im CI-Nachtrag:** Drei echte Rechenvoraussetzungen ergänzen
  ausschließlich die Spektrumsaufgabe. 58 fehlende Astronomie-Aufgabenplätze
  werden ergänzt; eine vorhandene Stoßaufgabe kommt in vier HE-Sichten hinzu.
  In allen zwölf HE-Kontexten wächst die atomare Lernbasis nur um diese Aufgabe.
  Mathematik erhält 16 ausdrückliche Quellenbindungen für materialisierte
  Aufgabengruppen; der Generator reproduziert 18 Sichten. Die SH-Quelle zu
  einfachen Ungleichungen ist korrigiert, ohne eine offizielle Jahrgangsstufe
  zu erfinden. Vertrag 1.3 transportiert 28 vorhandene Aufgabenbilder bei
  31 Aufgaben-Bild-Zuordnungen; Bilddateien und Aufgaben bleiben unverändert.
  Die beiden historischen JSON-Autorenquellen erhalten genau begrenzte
  Herkunftsnachweise im Paket; eigene Aufgaben bleiben als Inhalt klassifiziert.
  Die Abschlussautomatik muss offene Lernkarten bis zum bestätigten Abruf
  erforderlich halten; sie werden dadurch nicht zu Prüfungsaufgaben umdeklariert.
  Der getrennt versionierte Browsernachweis bindet die genaue lernerspezifische
  Datenroute; historische Runner und sämtliche Schutzprüfungen bleiben erhalten.
  Die Deployment-Abfrage bei unverändertem GitHub-Stand ist bereits seit
  #157 auf main; sie ist keine neue Lieferung von #159.
  Der jüngste Nachlauf aktualisiert sieben öffentliche Physikbeschreibungen
  und den erzeugten Bildstatusbericht. Der Browser-Test prüft beide gültigen
  Übersichtsformen mit ihren Vorbereitungszweigen; die Produktionsnavigation
  bleibt dabei unverändert. Bildabdeckung wird weiterhin getrennt von einer
  inhaltlichen Bildfreigabe ausgewiesen.
  Zwei weitere Statusberichte werden ausschließlich mit aktuellen Messwerten
  abgeglichen; 53 fehlende öffentliche Mathematik-Quellenbegründungen bleiben
  sichtbar. Die Physik-Tests sichern die aktuellen Erwerbsrouten statt alter
  zurückgenommener Aufgaben. Ein genau begrenzter Generator-Nachtrag erhält
  die bereits dokumentierte Transistor-Versuchszuordnung auch bei Neuerzeugung;
  die historischen K1-Belege und alle übrigen Zuordnungen bleiben unverändert.
- **Drei Kontrollstellen:** [Frische Kartenwirkung und Nachweise des Nachtrags](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/external-review-followup-v1/README.md),
  [neue Daten- und Browserkorrekturen mit unabhängigen Reviews](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/ci-metadata-and-browser-followup-v1/README.md),
  [Gesamtauftrag mit Zielzustand und offenen Befunden](stage-plan-units-handover-2026-11-15.md).
- **Nachweise:** Lokal bestehen 354 Ansichtskontrollen, alle 21 Katalog- und
  zwölf Routen-Mindeststände (Mathematik/Physik M7), Schema- und JSON-Kontrollen
  über 120.706 Dateien,
  TypeScript und Lint. [Alle 17 ursprünglichen Backend-Testfehler](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/backend-ci-test-repair-v1/README.md)
  bestehen im gemeinsamen Nachlauf. Hinzu kommen 60 Java-Pakettests sowie
  unabhängige Modell-, Quellen- und Sicherheitsreviews. Die
  [Lernkartenkorrektur](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/memory-explicit-completion-v1/README.md)
  hat 136 bestandene Completion-Tests und 13 unabhängige Gegenprüfungen.
  Der [tatsächliche Paketnachweis](https://github.com/enpasos/skillpilot/blob/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-16/package-assessment-materials-pipeline-v1/README.md)
  bindet die reproduzierbare ZIP-Datei und den frischen vollständigen Anwendungstest;
  frühere Fehlversuche bleiben getrennt erhalten. Der vorherige Remote-Lauf
  hatte acht erfolgreiche und sechs fehlgeschlagene Jobs. Der anschließende
  Lauf endete mit zehn erfolgreichen und vier fehlgeschlagenen Jobs. Dessen
  vier Reparaturen bestehen im anschließenden Lauf mit elf erfolgreichen und
  drei fehlgeschlagenen Jobs. Dessen drei Fehlerstellen und die vier zusätzlichen
  lokalen Befunde sind nun korrigiert und mit Originalfehlern, normalen Nachtests
  und unabhängigen Reviews dokumentiert. Der vollständige lokale Nachlauf
  bestätigt alle 21 Katalog- und zwölf Routen-Mindeststände. Automatisierte
  Checks und Agentenreviews belegen keine Unterrichtswirkung und ersetzen keine
  frische Main-CI.
- **Nächster Schritt:** Die frische Main-CI bis zum Abschluss prüfen und danach
  Implementierungscommit und terminalen Lauf im Abschlussvermerk binden.
  Reale HE-Pläne und weitere Fachreparaturen bleiben im getrennten nächsten
  Umsetzungspaket Teil des unverkleinerten Gesamtauftrags.

## 15. November 2026, 22:51 MEZ — Zielnorm und Bestandsaufnahme abgeglichen

**Stand: Abgeschlossener Dokumentationsreview im Lieferumfang von
[PR #159](https://github.com/enpasos/skillpilot/pull/159); Dokumentchecks
bestanden. Keine neue Laufzeitfunktion oder Integration behauptet.**

- **Fortschritt:** K 0/13 und F 0/7 vollständig abgeschlossen; 0 reale
  Landespläne aktiviert. Dieses Paket präzisiert F7 und die weiterführende
  Zielnorm; es verändert selbst keine Rückgriffe oder Qualitätsgrade.
- **Ergebnis und Entscheidungen:** Das Konzept bleibt verbindlicher
  Zielzustand. Der Implementierungsanhang beschreibt getrennt, was tatsächlich
  besteht. Eine offene Prüfung gilt weiterhin als offen; ein Revieweintrag
  allein erteilt keine Anerkennung. Die Reihenfolge ganzer Einheiten muss
  widerspruchsfrei sein. Die behauptete Unterbrechung der Traversierung an
  gemeisterten Zwischenzielen war veraltet: der Fix ist bereits auf main.
  Globale revisionsgebundene Anerkennung und vollständige Durchsetzung der
  Einheitenverträge bleiben offene Implementierungsaufträge.
- **Kontrollstellen:** [Bewertung der beigefügten Kritik](graph-definition-documentation-review-2026-11-15.md),
  [Einheitenfolge und Lernweise](../concept/skill-graph/learning-unit-progression.de.md),
  [datierter Implementierungsstand](../concept/skill-graph/compendium-appendix.de.md).
- **Nachweise:** Unabhängiger bilingualer Agentenreview mit 21 geprüften
  Kapitelpaaren und drei gezielten Modellgegenbeispielen; 62 tatsächlich
  ausgeführte lokale Backendtests bestehen ohne Fehler oder Auslassungen.
  Alle zehn DE-/EN-PDFs und 80 Webausgaben sind neu gebaut. Quellen-,
  Ausgabe-, Terminologie-, Link- und Indexchecks sowie MkDocs strict bestehen.
  Dies sind weder Prüfungsaufgaben für Lernende noch eine Main-Abnahme.
  [Erhaltene Review- und Testbelege](https://github.com/enpasos/skillpilot/tree/9975a142f7a26f1c4ff31c46a70e149d82a3fce5/contracts/stage-plan-review-evidence/2026-11-15/documentation-critique-review-v1).
- **Nächster Schritt:** Die präzisierte Norm mit dem geprüften Fachpaket
  integrieren. Umsetzungsdefizite bleiben bis zu
  ihrem eigenen Nachweis sichtbar; die Norm wird nicht auf den Bestand verkürzt.

## 15. November 2026, 15:38 MEZ — Abnahme an den tatsächlichen Lernkarten konkretisiert

**Stand: Diagnose und Umsetzung laufen lokal; noch kein Folge-PR. #157 ist
integriert und seine frische Main-CI erfolgreich. Dieses Folgepaket ist offen.**

- **Fortschritt:** K1–K13/F1–F7 bleiben der Gesamtauftrag; **K 0/13, F 0/7
  abgeschlossen, 0 reale Landespläne aktiviert**. Die aktuelle Messung hat
  einen tatsächlichen Rückschritt sichtbar gemacht, keinen Abschluss belegt.
- **Ergebnis und Entscheidungen:** Auf den obersten Physik- und
  Mathematiktafeln sollen die roten Rückgriffe durch fachliche Bereinigung
  entfallen. Die freistehenden Vorbereitungsknoten zu Skalar- und Vektorprodukt
  entstehen durch zwei getrennte Oberstufeneinheiten bei der tatsächlichen
  GK+LK-Zusammenführung. Deren gemeinsame Identität wird korrigiert;
  benötigte Kompetenzen und Lernnachweise bleiben erhalten. Die echten
  Rückgriffsbeziehungen brauchen daneben fachliche Bereinigung. Insbesondere
  müssen irrtümlich in Sekundarstufe I aufgenommene Oberstufenaufgaben an
  ihrem eigentlichen Lernplatz stehen; bloßes Verschieben ihrer notwendigen
  Vorbereitung würde den Fehler verdecken.
  Sekundarstufe I erhält Jahrgangsstufen als Untereinheiten; Sekundarstufe II
  erhält E-Phase und Q1–Q4 beziehungsweise die zutreffenden Landesbezeichnungen.
  Dies wird im gemeinsamen Planvertrag umgesetzt und auch innerhalb der
  Untereinheiten auf Rückgriffe geprüft. Die bisherige reine Stufengrundlage
  erfüllt diese Abnahme noch nicht.
- **Kontrollstellen:** Die vom Product Owner gezeigten Tafeln mit Physik
  204/418 und Mathematik 334/616 Zielen; die Ursachenpfade im entstehenden
  Vergleichsbericht; die aufgeklappten Jahrgangs- und Phaseneinheiten.
- **Nachweise:** Ein unabhängiger Agent hat die tatsächliche Kompositions-,
  persönliche Curriculum- und Lernkartenprojektion auf Ausgangsstand,
  integriertem #157 und aktuellem Kandidaten ausgeführt. Die ursprünglichen
  Screenshots stimmen einschließlich beider Vorbereitungsknoten exakt.
  In der zusammengeführten Sicht sind 41 direkte Rückgriffsbeziehungen erfasst;
  nach Fachfilter bleiben 28 in Physik und sechs in Mathematik. Diese Zählung
  ist von den 43 Beziehungen der getrennten bundesweiten Kursansicht zu
  unterscheiden. Die tatsächliche fachliche Reparatur ist noch nicht abgenommen.
- **Nächster Schritt:** Fachliche Reparaturen umsetzen und die echten Sichten vor und
  nach dem nächsten Fachpaket vergleichen. Ein früherer Statusvergleich oder
  eine grüne CI ersetzt diesen Wirkungsnachweis nicht.

## 15. November 2026, 15:59 MEZ — Lernbilder an die vorhandene Bildsprache anpassen

**Stand: Neun ruhige Endfassungen lokal importiert und durch den ausführenden
Agenten fachlich und visuell geprüft; noch nicht auf main. Kein abgeschlossener
Lieferumfang und keine menschliche Freigabe.**

- **Fortschritt:** Neun neue aktive Physik-Lernbilder identifiziert: vier aus
  #157 und fünf im folgenden lokalen Paket. Alle neun Ersatzbilder sind über
  die bestehende Produktionspipeline importiert (zusammen rund 2,25 MB).
  Zwölf ältere Rasterdateien sind bytegleich erhalten, darunter beide zugleich
  als Aufgabenmaterial verwendeten PNGs. Deren Aufgabenverweise bleiben gleich.
- **Ergebnis und Entscheidungen:** Die vorhandene Produktionspipeline mit
  explizitem Provider, tatsächlichem Prompt, Import und Bildprüfung wird
  verwendet. Nach dem aktuellen Owner-Feedback gilt eine ruhige, locker
  gezeichnete Gestaltung ohne dekorative Strahlen, Glitzer und flächendeckende
  Hervorhebungen. Zwei bisherige PNGs dienen zugleich als Aufgabenmaterial;
  ihre exakten Bytes und Aufgabenverweise werden erhalten.
- **Kontrollstellen:** Materialvergleich, Dotierung und Bewegungsdiagramme;
  Darstellung in 360 und 680 Pixel Breite; unveränderte Aufgabenmaterialien
  der beiden eigenen Transistorversuche. Der konkrete Prüf- und Importbericht
  liegt unter
  `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-stage-flow-quiet-20261115-v1/`.
- **Nachweise:** Die unabhängige Bestandsaufnahme hat tatsächliche Bildlinks,
  Verbraucher und Stilreferenzen geprüft. Die bisherigen Bildentwürfe wurden
  tatsächlich angesehen. Der ausführende Agent hat anschließend alle neun
  Endfassungen in beiden genannten Breiten gelesen und fachlich geprüft.
  Asset-Check (2.575 Bildlinks), Physik-Bild-QA und Transparenzinventar bestehen
  lokal; Quell-, Frontend- und Backend-JPEGs sind bytegleich. Dies ist eine
  tatsächliche Eigenprüfung der Bilder, keine unabhängige Inhaltsfreigabe.
- **Nächster Schritt:** Die betroffenen Lernzielbuch-Seiten und aktuellen
  Fachreview-Bindungen validieren und das gesamte Paket durch die CI bringen.
  Die Gesamtverantwortung bleibt beim ausführenden Agenten; eine externe
  Gemini-Übernahme ist derzeit nicht nötig.

## 15. November 2026, 15:18 MEZ — Modellnorm für Stufenpläne vereinheitlicht

**Stand: lokal umgesetzt und unabhängig geprüft; noch kein Folge-PR.
[#157](https://github.com/enpasos/skillpilot/pull/157) ist nach erfolgreicher
PR-CI integriert. Integration und frische Main-CI dieses separaten Normpakets
stehen aus.**

- **Fortschritt:** F7 als lokale Normlieferung vorbereitet.
  **K 0/13, F 0/7 abgeschlossen; 0 reale Landespläne aktiviert.**
  Rückgriffe werden durch diese Normkorrektur noch nicht praktisch abgebaut.
- **Ergebnis und Entscheidungen:** Ein gemeinsamer Plan je Land und
  Dauermodell bestimmt die Stufen über die Fächer hinweg. Offizielle Zuordnung
  und geeigneter Lernplatz bleiben unterscheidbar. Die Reihenfolge von
  Einheiten erzeugt keine zusätzlichen Voraussetzungen oder Lernnachweise.
  Notwendige Vorbereitung gehört an ihren frühesten tatsächlichen Bedarf;
  bereits später eingeordnete Ziele werden nicht stillschweigend verschoben.
  Die bestehende Laufzeit bleibt ausdrücklich vom Zielmodell getrennt.
- **Kontrollstellen:** [Einheiten und Grenzfälle](../concept/skill-graph/learning-unit-design-and-examples.de.md),
  [Zuordnung und Lernplatz](../concept/skill-graph/view-projection-and-goal-placement.de.md)
  sowie [Begriffe und Abgrenzungen](../concept/glossary.de.md).
- **Nachweise:** Das unabhängige erste Review verlangte vier Normkorrekturen
  und drei Konsistenzkorrekturen; die zweite Fassung ist angenommen.
  26 geänderte Quellen und 26 Registerzeilen sind abgeglichen, sieben
  Gegenbeispiele geprüft. Der native Build erzeugt 44 Markdownseiten und
  sechs PDFs aus denselben deutschen und englischen Quellen; alle sechs
  PDF-Builds bestehen. Der erste Versuch scheiterte an einer fehlenden lokalen
  TeX-Abhängigkeit und bleibt dokumentiert. Dies sind Agentenreviews und
  automatisierte Dokumentchecks, keine implementierte neue Lernlaufzeit.
- **Nächster Schritt:** Das Normpaket zusammen mit den nächsten geprüften Fachreparaturen liefern.
  Bei diesen prüfen wir insbesondere, dass frühere Papieraufgaben keine
  tatsächlich nicht ausgeführten Versuche nachweisen.


## 15. November 2026, 15:38 MEZ — Rollout bei unverändertem Git-Stand

**Stand: Mit [PR #157](https://github.com/enpasos/skillpilot/pull/157) um
14:25 MEZ auf main integriert und nach erfolgreicher frischer Main-CI um
15:36 MEZ abgeschlossen. Kein Produktionsrollout durchgeführt.**

- **Fortschritt:** Zusatzauftrag des Product Owners; K 0/13 und F 0/7
  abgeschlossen, 0 reale Landespläne aktiviert. Der Zusatzauftrag ändert
  keine curricularen Rückgriffe.
- **Ergebnis und Entscheidung:** `./deploy_skillpilot.sh` bietet bei
  unverändertem Commit Abbruch oder erneuten Rollout an. `j` setzt fort;
  `n`, Enter oder Eingabeende brechen vor Build und Service-Neustart ab.
  Neue Commits und der ausdrücklich gewählte Git-Übersprung behalten ihren Ablauf.
- **Kontrollstellen:** [Betriebsanleitung](../deploy/deployment.de.md),
  [Auswahl im Deployment-Skript](https://github.com/enpasos/skillpilot/blob/a7f0fa82afee1f74b4689ed02db98246d72377b0/scripts/deploy.sh),
  [automatisierte Verhaltenstests](https://github.com/enpasos/skillpilot/blob/a7f0fa82afee1f74b4689ed02db98246d72377b0/scripts/test_deploy_no_changes.py).
- **Nachweise:** Shell-Syntaxprüfung erfolgreich; sechs neue Verhaltenstests
  bestehen einschließlich Wiederholung, Abbruch, fehlerhaftem Git-Pull und
  Neustart der aktualisierten Engine. Die neun bestehenden Backup-Tests und
  neun CI-Aufteilungstests bestehen ebenfalls. Die neuen Verhaltenstests sind
  in den vorhandenen CI-Job aufgenommen; die lokalen Tests führen keinen echten
  Rollout aus.
- **Integration:** [Implementierungscommit a44c157b53](https://github.com/enpasos/skillpilot/commit/a44c157b536680985dca30737b560b10c7633a04),
  [Main-CI 43718928027](https://github.com/enpasos/skillpilot/actions/runs/43718928027):
  **14/14 Jobs erfolgreich**, einschließlich des Deployment-Verhaltenstests.
- **Nächster Schritt:** Kein weiterer Umsetzungsschritt für diese Auswahl.
  Ein tatsächlicher Produktionsrollout ist eine getrennte Betriebsaktion.

## 15. November 2026, 15:38 MEZ — Halbleiterpfad, Diagrammaufgaben und Stufenplangrundlage

**Umsetzungspaket #157 abgeschlossen: auf main integriert, frische Main-CI
um 15:36 MEZ erfolgreich. K1/K2 und F1/F2/F6 bleiben teilweise offen.**

- **Fortschritt:** **K 0/13 und F 0/7 vollständig abgeschlossen; 0 reale
  Landespläne aktiviert.** Die reale Wirkung ist jetzt gemessen: Bayern
  9 → 10, bundesweite feste Kursansicht 39 → 43 Rückgriffsbeziehungen.
  Die bestandene technische Lieferung ist deshalb keine fachliche Gesamtabnahme.
- **Ergebnis und Entscheidungen:** Drei neue Physikkompetenzen und drei Aufgaben
  trennen einfaches Dotierungsmodell, Diodenkennlinien und einen eigenen
  Transistor-Schaltversuch; 33 Quellenzuordnungen sind korrigiert. Vier
  Diagrammaufgaben ersetzen eine unbelegte Algebra-Abdeckung. Tabellenaufbau,
  Tabellenlesen und elementares Diagrammlesen erhalten passende Aufgaben und
  bereinigte Voraussetzungen. Planvertrag v1.3 und Diagnosekern bilden die
  Grundlage für reale Pläne; sie aktivieren noch keine neue Planlaufzeit.
  Die CI-Reparaturen berichtigen veraltete Bindungen und einen fehlerhaften
  Token-Texttest, ohne Qualitätsgrenzen zu senken.
- **Kontrollstellen:**
  [Physik: Kompetenzen und Bewertungsraster](https://github.com/enpasos/skillpilot/blob/a44c157b536680985dca30737b560b10c7633a04/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/README.md),
  [Mathematik: Tabellenkompetenz und Inhaltsreviews](https://github.com/enpasos/skillpilot/blob/a44c157b536680985dca30737b560b10c7633a04/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/README.md),
  [tatsächliche Rückgriffe und Screenshot-Ursachen](stage-plan-real-view-backflows-2026-11-15.md).
- **Nachweis und Integration:** [PR #157](https://github.com/enpasos/skillpilot/pull/157)
  ist nach 14/14 erfolgreichen PR-CI-Jobs um 14:25 MEZ gemergt.
  Die frische [Main-CI 43718928027](https://github.com/enpasos/skillpilot/actions/runs/43718928027)
  am [Implementierungscommit a44c157b53](https://github.com/enpasos/skillpilot/commit/a44c157b536680985dca30737b560b10c7633a04)
  besteht mit **14/14 Jobs**. Alle 21 Kataloge behalten ihre Reifegrade,
  insbesondere Mathematik und Physik M7. Zusätzliche Workflows für
  Assessment-Abschluss, Gemini, OAuth und Dokumentation sind separat erfolgreich;
  sie werden nicht zur Jobzahl dieses Laufs addiert. Inhaltsreviews und
  automatisierte Nachweise belegen keine bereits beobachtete Lernwirkung.
- **Nächster Schritt:** Die gemessenen Rückgriffe fachlich beseitigen,
  eigene Versuche und weitere Kompetenznachweise vervollständigen, Jahrgänge
  und E-/Q-Phasen einbinden und reale Landespläne aktivieren. Die neue Lieferung
  wird erneut an tatsächlichen Lernkarten und vollständiger CI gemessen.

## 15. November 2026, 09:09 MEZ — Offene Ausgangslieferungen integriert

**Abgeschlossen; rückblickender Eintrag, CI-Zählung am angegebenen Zeitpunkt korrigiert.**

- **Fortschritt:** Zwei Ausgangs-PRs integriert; K 0/13 und F 0/7 abgeschlossen,
  0 reale Landespläne aktiviert, keine gemessene Gesamtwirkung auf Rückgriffe.
- **Ergebnis und Entscheidungen:**
  [#156 Übergabe](https://github.com/enpasos/skillpilot/pull/156) und
  [#153 Lernkartenvorschau](https://github.com/enpasos/skillpilot/pull/153)
  nach erfolgreichen PR-Checks integriert. Beide bilden die Arbeitsgrundlage;
  sie beheben noch keinen der übernommenen Fachbefunde.
- **Kontrollstellen:** [Auftragsumfang und Abnahmebedingungen](stage-plan-units-handover-2026-11-15.md#7-lieferstand-des-delegierten-auftrags)
  sowie die [Vorschau in #153](https://github.com/enpasos/skillpilot/pull/153).
- **Nachweis und Integration:** Die frische
  [Main-CI 43674399591](https://github.com/enpasos/skillpilot/actions/runs/43674399591)
  für [Commit a7c7e9ceb2](https://github.com/enpasos/skillpilot/commit/a7c7e9ceb26f06194e25f29e32941d4e4cb17c32)
  endete am 15. November 2026 um 05:54 MEZ erfolgreich: **14/14 Jobs bestanden**.
  Die früher genannten 25 erfolgreichen und zwei übersprungenen Checks waren
  eine zeitgebundene Summe mehrerer Workflows am Commit, nicht die Jobzahl
  dieses Laufs.
- **Nächster Schritt:** K1–K13 und F1–F7 in zusammenhängenden Lieferungen umsetzen.
