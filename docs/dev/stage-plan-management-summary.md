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

## Gesamtstand

**Stand: 16. November 2026, 00:38 MEZ (UTC+01:00).**

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert · kanonische oberste Lernkarte lokal: 0 Rückpfeile und 0 außenstehende
Atome in GK, LK und GK+LK.**
Die erneute 72-Kontext-Messung verwendet tatsächliche Backend-Exporte und die
Wurzel-, Filter- und Projektionsfunktionen der Oberfläche. Alle 16 Länder sind
enthalten; zwölf widersprüchliche Dauerkontexte bleiben getrennt von den
60 zulässigen Kontexten. Davon haben weiterhin 39 regionale oberste Rückgriffe
und 35 außenstehende Atome. Kein realer Landesplan ist damit abgenommen.

**Getrennte Fachkarten:** Zwölf ergänzende Fälle sichern die Screenshots ab:
sechs tatsächliche UI-Fachfilter und sechs native Einzelfach-Auswahlen, jeweils
Mathematik/Physik mit GK, LK und GK+LK. Alle haben oben **0 Rückpfeile und
0 freistehende eigene Fachziele**. Notwendige Fremdfachvorbereitung bleibt in
der Lernbasis und als Kontexthinweis sichtbar; innere Rückgriffe und bestehende
Gruppierungsbefunde werden dadurch nicht als erledigt ausgegeben.

**Offene innere Wirkung:** Bei gleichem aktuellem Reader/UI steigen die
kanonischen inneren Rückpfeile gegenüber dem Main-Curriculum von 8 / 9 / 9
auf 11 / 12 / 12; die unterschiedlichen atomaren Ursachen von 20 / 23 / 25
auf 27 / 30 / 32. Fünf neue, fachlich erforderliche Aufgabenabhängigkeiten und
zwei schon auf main vorhandene Kanten treffen auf eine noch falsche Reihenfolge
innerer Vorbereitungscontainer. Diese offene Arbeit wird ausdrücklich nicht
als behobener Lernfluss ausgegeben. Der letzte Aufgaben-/Routenfix fügt gegenüber
dem vorherigen geprüften Kandidaten keine weiteren äußeren oder inneren
Rückgriffsursachen hinzu.

**Qualitätsabschluss:** Alle vier Mathematik-/Physikroutenprofile bestehen,
einschließlich 80 Physik-Projektionskontexten. Alle fünf Inhaltsbereiche einschließlich
Beschreibungen bestehen jetzt für 485/485 reguläre Physikziele. Die zwei
geänderten Beschreibungskontexte sind jeweils zweimal aktuell unabhängig
bewertet und nativ aufgelöst; sämtliche 107 alten Reviewindizes bleiben
bytegleich.
Ein vorheriger vollständiger Zwischenlauf endete für Physik auf M1: Die
Quellenprüfung zählte zwei ausschließlich bayerische Ziele in 14 anderen
Ländern mit. Der korrigierte Prüfcode folgt jetzt der tatsächlichen atomaren
Backend-Auswahl einschließlich direkter Quellenzuordnungen. Ein erster,
zu enger Filter wurde anhand einer tatsächlich ausgelieferten bayerischen
Mathematikaufgabe verworfen. Die gezielte Quellenprüfung besteht nun für alle
zehn ausgebauten Fächer; die elf M0-Fächer behalten ihre bisherigen Warnungen.
Alle 26 konfigurierten Regeln der vier Mathematik-/Physikrouten bestehen.
Unbelegte Ziele und vorhandene leere Ansichten scheitern weiterhin an nativen
Gegenproben. Dieser letzte Fix ändert keine Lernziele, Ansichten oder
Laufzeitdateien. **Der vollständige lokale Nachlauf ist seit 23:30 MEZ erfolgreich:**
Alle 21 Katalog- und zwölf Routen-Mindeststände bleiben erhalten; Mathematik
und Physik erreichen M7. Die vollständige PR-CI hat am letzten Commit einen Fehler im Lernzielbuch-Build
aufgedeckt. Sechs Jobs bestanden, ein Job scheiterte, sieben abhängige Jobs
wurden ausgelassen. Die vier Zusatzworkflows sind erfolgreich. Der Buch-Export
ist gezielt korrigiert und unabhängig geprüft. Alle fünf Bücher wurden mit
`--force` neu gerendert und vollständig validiert: insgesamt 2.457 Zielseiten.
Die aktualisierte Physik-Inputsuite besteht. Erneute vollständige PR-CI, Merge
und frische Main-CI stehen aus.

**Messgrenze:** Bei identischem aktuellem Code zeigt das Main-Curriculum oben
jeweils einen Rückpfeil mit 43 atomaren Ursachen gegenüber null im Kandidaten;
außen stehen 3 / 0 / 0 gegenüber 0 / 0 / 0 Zielen. Die historischen Main-UI-
Funktionen erkennen unter der tatsächlichen Übersicht keine Stufeneinheiten
und liefern deshalb keinen vergleichbaren sauberen Stufen-Nenner. Die alten
41/512-Werte aus vollständigen Katalogen mit künstlicher Wurzel bleiben
überholte Zwischenmessungen. Kein Wert ist eine Produktions- oder
Unterrichtsabnahme; Rohbelege bleiben erhalten.

| Umfang | Stand und verbleibende Arbeit |
| --- | --- |
| K1 | Elementarer Halbleiterpfad und eigener Transistor-Schaltversuch in #157. Eigener Verstärkerversuch und weitere Nachweise in #159 geprüft; vollständige Länder- und Stufenplatzierung bleibt offen. |
| K2 | Vier Diagrammaufgaben und drei elementare Aufgaben in #157; die jüngste Korrektur trennt Tabellenkompetenz und Zahlenvorbereitung der anspruchsvolleren Aufgabe. Physikrückgriffe und Länderplatzierungen bleiben offen. |
| K4, K6, K8 | Ursprüngliche Fachbefunde unabhängig als behoben eingeordnet; Abschluss wartet auf Merge und frische Main-CI. Die begrenzte K6-Routenabsicherung schließt die allgemeine Einheitenanerkennung nicht ab. |
| K3, K5, K9–K11 | Fachrecherche und Teilreparaturen in #159; Länderbreite, einzelne Jahrgangszuordnungen und regionale Rückgriffe bleiben offen. |
| K7, K12, K13 | Rheinland-Pfalz-Platzierung und weitere Erwerbsrouten in #159 korrigiert. Die vollständige Bereinigung der Befunde zu Voraussetzungen und Stufenausschnitten bleibt offen. |
| F1, F2, F6 | Grundlage in #157: Planvertrag, Erzeugung und Diagnosekern. Reale Pläne, vollständige Anbindung und ihre Abnahme fehlen. |
| F3, F4 | Kanonische oberste Karten in #159 bereinigt; vollständige Karten aus realen Planeinheiten und innere Vorbereitungseinordnung bleiben offen. |
| F7 | Zweisprachiger Normkandidat in #159 veröffentlicht und unabhängig geprüft; noch nicht auf main integriert. |
| F5 | Fachprüfung teilweise umgesetzt über K1/K2; der vollständige Befundbestand bleibt offen. |

Der [unabhängige Abgleich des Restauftrags](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/current-scope-review-v1/README.md)
trennt die ursprünglichen Einzelbefunde von den weiterhin offenen inneren
Rückgriffen und realen Landesplänen. K4/K6/K8 sowie F7 sind damit konkrete
Abschlusskandidaten, noch keine integrierten Abschlüsse.

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
  [Erhaltene Review- und Testbelege](https://github.com/enpasos/skillpilot/tree/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-15/documentation-critique-review-v1).
- **Nächster Schritt:** Die präzisierte Norm mit dem geprüften Fachpaket
  integrieren. Umsetzungsdefizite bleiben bis zu
  ihrem eigenen Nachweis sichtbar; die Norm wird nicht auf den Bestand verkürzt.

## 16. November 2026, 00:38 MEZ — Kanonische Lernkarten bereinigt, CI-Buchfehler lokal behoben

**Stand: [PR #159](https://github.com/enpasos/skillpilot/pull/159) ist bereit zur
Prüfung. Der Fehler der vollständigen CI im Lernzielbuch-Export ist lokal
behoben. Der Neubau und die Validierung aller fünf Bücher sowie die aktualisierte
Physik-Inputsuite bestehen. Der vollständige lokale Curriculum-Qualitätslauf
bleibt bei unveränderten Fachdaten gültig. Neue PR-CI, Integration und frische
Main-CI stehen aus.**

- **Fortschritt:** K 0/13, F 0/7 abgeschlossen, 0 reale Landespläne aktiviert.
  Die kanonische oberste Karte hat in GK, LK und GK+LK null Rückpfeile und
  null Außenatome. Die 72-Kontext-Messung trennt 60 zulässige von zwölf
  widersprüchlichen Dauerkontexten. Regionale und innere Befunde bleiben
  offen; insbesondere steigen die inneren kanonischen Pfeile gegenüber main
  wie oben beziffert. Der letzte Prüfcodefix verändert die Lernkarten nicht.
  Zwölf ergänzende Fälle bestätigen die saubere oberste Ebene auch für die
  getrennten Fachkarten und echte Einzelfach-Auswahlen.
- **Ergebnis und Entscheidungen:** Skalar- und Vektorprodukt erhalten gültige
  Plätze in Sek II. Frühe Messgrundlagen und Fremdfachvorbereitung bleiben
  erreichbar. Die Mathematikgruppe „Anwendungen der Integralrechnung“ behält
  alle zehn Kinder einschließlich der drei bisher verdeckten Q4-Ziele.
  Sieben notwendige Chemiegrundlagen stehen in Bayern innerhalb der Physikeinheit,
  ohne die Lernbasis zu vergrößern. Die bayerischen Ziele zu Versuch und Video
  bleiben auf die belegten Quellen begrenzt. Die Quellenprüfung zählt die
  tatsächlich ausgewählten atomaren Ziele; leere Ansichten erhalten keine
  Ersatzmenge, und notwendige Vorbereitung wird nicht zum curricularen Ziel erklärt.
  Der CI-Nachtrag bindet Chemie als externe Buchquelle ein, löst notwendige
  Fremdfachziele auf und hält sie aus den Physikbuchseiten heraus. Der Buchbestand
  erhält die drei neuen zulässigen Ziele: 484 Seiten, 115 bestehende Kapitel.
  Die reine Vorbereitungsbrücke bleibt außerhalb dieser Buchausgabe. Die
  neuen bayerischen Erwerbsziele behalten ausschließlich ihre belegte
  Länderzuordnung; breite Quellansichten erweitern sie nicht auf andere Länder.
  [Fehler, Korrektur und unabhängige Gegenproben](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/goal-book-ci-repair-v1/README.md)
  sind getrennt vom Curriculum-Abschluss nachprüfbar.
- **Aufgaben und Inhaltsreviews:** Gegenüber main enthält #159 57 neue Physik-
  und 44 neue Mathematikaufgaben. Ursprüngliche Aufgabenverträge bleiben bei
  Rücknahme unbelegter Vollabdeckung erhalten. Die fünf Inhaltsbereiche bestehen
  nativ für alle 485 regulären Physikziele. Die zehn präzisierten Kontexte und
  die zwei zuletzt veränderten Beschreibungskontexte sind jeweils zweimal
  aktuell unabhängig bewertet; die Vorbefassung der Reviewer ist offengelegt.
  Eine präzisierte Stromstärkerubrik und die neue Spannungsaufgabe prüfen jeweils
  zwei eigenständige Fälle; eine fehlende Kernleistung verhindert das Bestehen.
  Die unabhängige Platzierungsprüfung umfasst alle 69 Ansichten und 68 Plätze.
  Inhaltsreviews und automatisierte Checks belegen keine Unterrichtswirkung.
- **Kontrollstellen:** [Reale Kartenwirkung und offene innere Befunde](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-15/real-view-measurements-v1/final-measurement-summary.md),
  [Aufgaben, Inhaltsreviews und Quellenentscheidung](https://github.com/enpasos/skillpilot/tree/fix/stage-plan-next-delivery-20261115/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1),
  [Bewertung der Architekturkritik](graph-definition-documentation-review-2026-11-15.md).
- **Automatisierte Nachweise:** Projektions- und Lernkartentests, verschachtelte
  Planmaterialisierung, TypeScript und Lint bestehen. Die gezielte Quellenprüfung
  besteht für alle zehn ausgebauten Fächer; die elf M0-Fächer behalten ihren
  bisherigen Stand. Alle 26 konfigurierten Regeln der vier Mathematik-/Physikrouten
  bestehen. Native Gegenproben weisen unbelegte Ziele, leere Ansichten sowie
  fehlende Aufgaben und Vorbereitung weiterhin zurück. Die unabhängige Prüfung
  des letzten Fixes umfasst auch den tatsächlich ausgelieferten bayerischen
  Mathematikfall und ein gültiges Atom hinter einem unpassenden Elternknoten.
  Der [vollständige lokale Abschluss](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1/current841-runtime-scope-official-full21-and-protected-floors.actual.json)
  besteht seit 23:30 MEZ mit unveränderten Mindestständen für 21 Kataloge und
  zwölf Routen, darunter Mathematik und Physik M7; Eingangsdrift: null.
  Das bedeutet keine Hochstufung der elf M0-Fächer oder bestandene Einzelregel
  für deren weiterhin ausgewiesene Befunde.
- **Nächster Schritt:** Vollständige PR-CI auf dem finalen Stand ausführen,
  mergen und frische Main-CI abwarten.
  Weitere Fachpakete und reale Planaktivierungen folgen auf dieser Basis.

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
