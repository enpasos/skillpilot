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

<!-- composition-partial-order-20261117:start -->
## 17. November 2026, 06:03 MEZ (UTC+01:00) — Fachliche Teilordnungen in allen Länderansichten

**Aktueller Lieferstand:** Native Karten- und Browserprüfung bestanden; Mathematik und Physik global M7, geschützte Qualitätsuntergrenzen bestanden. Paketabschluss und GitHub-CI stehen noch aus. PR wird nach den abschließenden lokalen Prüfungen erstellt.
Dieser Eintrag aktualisiert den Lieferstand der darunter erhaltenen früheren
Berichte; deren Zahlen und geprüfte Commitbindungen bleiben historische Belege.

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
  separat protokolliert. Die vollständigen Qualitäts- und Paketprüfungen
  werden vor dem Integrationsabschluss abschließend gebunden.
- **Kontrollstellen für den Owner:** Hessen G8 und G9 → Physik → E-Phase
  (Wurf bei E.1, verzweigende E.4–E.7); Hessen → Q4 (unabhängige SRT);
  Mathematik/Physik in einem anderen Land → Sek I und Sek II mit den
  quellenbelegten Jahres-/Phasenbändern und vorhandenen Abiturangeboten.
- **Belege:** [Modell und Laufzeit](composition-view-partial-orders-2026-11-16.md),
  [Mathematikquellen](mathematics-stage-view-source-units-2026-11-17.md),
  [Physikquellen](physics-stage-view-source-units-2026-11-17.md),
  [unabhängige Reviews und aktuelle Kartenmessung](https://github.com/enpasos/skillpilot/blob/main/contracts/stage-plan-review-evidence/2026-11-16/composition-partial-order-v1/README.md).
  Die Paket-Redistributionsfreigabe bleibt dort, wo menschliche Freigaben
  ausstehen, ausdrücklich offen. Keine Produktionsbereitstellung.
- **Nächster Schritt:** abschließende Qualitätsbindung, ein gemeinsamer PR,
  erfolgreiche vollständige PR-CI, Integration und frische erfolgreiche
  Main-CI. Erst dann erhält dieser Eintrag Commit- und Runabschluss.
<!-- composition-partial-order-20261117:end -->

## Gesamtstand

**Stand: 16. November 2026, 08:16 MEZ (UTC+01:00).**

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert · kanonische oberste Lernkarte lokal: 0 Rückpfeile und 0 außenstehende
Atome in GK, LK und GK+LK.**
Die erneute 72-Kontext-Messung verwendet tatsächliche Backend-Exporte und die
Wurzel-, Filter- und Projektionsfunktionen der Oberfläche. Die Matrix enthält 57 zulässige regionale Kontexte und drei kanonische
Kontexte; zwölf widersprüchliche Dauerkontexte werden getrennt diagnostiziert.
In 39/57 regionalen Kontexten bestehen oberste Rückgriffe. Die 35 Fälle mit
Außenatomen stammen aus den 60 zulässigen Kontexten; diese Kennzahl ist nicht
separat neu gemessen. Kein realer Landesplan ist damit abgenommen.
Die Messung wählt GK, LK und GK+LK fachübergreifend gleichlaufend; gemischte
Auswahlen wie Mathematik LK mit Physik GK sind damit nicht nachgewiesen.

**Getrennte Fachkarten:** Zwölf ergänzende Fälle sichern die Screenshots ab:
sechs tatsächliche UI-Fachfilter und sechs native Einzelfach-Auswahlen, jeweils
Mathematik/Physik mit GK, LK und GK+LK. Alle haben oben **0 Rückpfeile und
0 freistehende eigene Fachziele**. Notwendige Fremdfachvorbereitung bleibt in
der Lernbasis und als Kontexthinweis sichtbar; innere Rückgriffe und bestehende
Gruppierungsbefunde werden dadurch nicht als erledigt ausgegeben.

**Innere Wirkung am gepushten Stand `b5d770e58b`:** Bei gleichem Reader/UI steigen die
kanonischen inneren Rückpfeile gegenüber dem Main-Curriculum von 8 / 9 / 9
auf 11 / 12 / 12; die unterschiedlichen atomaren Ursachen von 20 / 23 / 25
auf 27 / 30 / 32. Fünf zusätzliche Ursachen gehören zu neuen, fachlich erforderlichen
Aufgabenabhängigkeiten. Zwei bereits auf main vorhandene Kanten zeigen erst
durch die neue Containerreihenfolge rückwärts: Das ist eine vom Kandidaten
erzeugte Verschlechterung der inneren Darstellung. Diese offene Arbeit wird ausdrücklich nicht
als behobener Lernfluss ausgegeben. Der letzte Aufgaben-/Routenfix fügt gegenüber
dem vorherigen geprüften Kandidaten keine weiteren äußeren oder inneren
Rückgriffsursachen hinzu.

**Lokale Korrektur nach dem Review:** Drei nationale Physiksichten ordnen die
Methodengrundlagen vor ihren ersten abhängigen Aufgaben ein; die Auswertung
des Stromverstärkerversuchs steht unmittelbar hinter dem eigenen Versuch.
Der frische native Backend-/UI-Nachlauf bestätigt **8 / 9 / 9 innere Pfeile
und 20 / 23 / 25 Ursachen**, also sieben entfernte und keine neuen Ursachen.
Lernziele, Voraussetzungen, Lernbasis und Fortschrittsnenner bleiben unverändert;
oben bleiben null Rückpfeile und null Außenatome. Dies beseitigt die zusätzliche
Verschlechterung, nicht die bereits auf main bestehenden inneren Rückgriffe.
Der getrennte Sek-I-Ausschnitt hat weiterhin sieben innere Pfeile und ein
Außenatom; er wird nicht als vollständig bereinigt ausgegeben. Diese Änderungen
gehören zum vorliegenden Nachtrag; seine neue Remote-CI ist noch offen.

**Qualität und Integration:** Der letzte vollständige lokale Qualitätslauf
besteht für alle 21 Kataloge und zwölf Routen; Mathematik und Physik bleiben M7.
Die Quellenstelle „einfache Ungleichungen“ in Schleswig-Holstein wurde anhand
der offiziellen Fachanforderungen korrigiert; 659/659 zugeordnete Ziele sind
nun belegt. 354 Zusammensetzungsansichten bestehen ohne Fehler.
Auch nach der Ergänzung einer bereits freigegebenen Stoßaufgabe in vier
hessischen Physiksichten besteht der frische vollständige Qualitätsnachlauf.
In zwölf Hessen-Fällen wächst die Lernbasis jeweils nur um diese Aufgabe.

Der vorherige vollständige GitHub-Lauf endete mit
**acht erfolgreichen und sechs fehlgeschlagenen Jobs**. Der ursprünglich
gemeldete Buchfehler ist darin behoben: fünf Bücher mit 2.457 Zielseiten
und ihre Publikationsbindungen bestehen. Die weiteren Korrekturen sind
gebündelt lokal geprüft. Der gemeinsame Paketvertrag 1.3 erhält die
fehlende Mitlieferung von 28 vorhandenen Aufgabenbildern bei 31 Verwendungen;
Originaldateien und Bildadressen bleiben erhalten. Der neue Modellexport und
seine Quellenbindungen bestehen lokal. Die gezielten Java-Tests bestehen mit
60 Fällen; alle 17 ursprünglichen Backend-Testfehler sind auch im gemeinsamen
Nachlauf behoben. TypeScript-, Lint- und Paket-Provisionierungstests bestehen.
Die tatsächliche reproduzierbare ZIP-Datei besteht sämtliche sechs unabhängigen
Paketkontrollen sowie Installation, Verifikation und Aktivierung. Der native
Anwendungstest hat eine falsche Freistellung eines offenen Lernkartenziels
aufgedeckt. Die begrenzte Laufzeitkorrektur erhält Lernkarten und ihre
Voraussetzungen als explizite Pflichten, getrennt von Prüfungsaufgaben und ohne
gespeicherte Lernergebnisse zu ändern. Der Completion-Testlauf besteht mit
136 ausgeführten Tests; eine unverändert optionale Performancemessung ist
übersprungen. Der unabhängige Review bestätigt die Korrektur. Der frische
Anwendungstest besteht vollständig mit 15/15 Funktionschecks, Browser und
Isolation. Sein getrennt versionierter Nachweis für Vertrag 1.3 kontrolliert
die tatsächlich genutzte lernerspezifische Datenroute; der historische Runner
bleibt erhalten. Der Abschlussbericht akzeptiert den frisch selbst ausgeführten
Nachweis. Alle technischen Paketgates bestehen; die gesonderte menschliche
Freigabe zur Paketweiterverteilung bleibt offen. Der vorangegangene Nachtrag
ist als `b5d770e58b` in #159 gepusht; die oben genannten Paketnachweise binden
diesen Stand. Die neuen Reparaturen erhalten eigene Nachweise. Im neuen CI-Lauf sind Buchbau und
Buchverträge erfolgreich; vier nachgelagerte Jobs scheitern aktuell an
Ledger-Reproduzierbarkeit, Bildstatus-Frische, Trainer-Testdaten und einem
abweichenden Sichtumfang der Quellenprüfung. Auch der letzte Backend-Job
ist erfolgreich: Der Lauf endet mit **10 erfolgreichen und 4 fehlgeschlagenen
Jobs**. Alle vier Korrekturen bestehen lokal, einschließlich der vollständigen
Quellenprüfung mit 25 Regressionstests. Die erfolgreichen Vorstufen belegen nicht den
Erfolg dieser Fach-/Integrationsjobs. Merge und frische Main-CI fehlen.
Keine Deploymentreife behauptet.

**Aktueller Nachlauf:** Der Lauf für `b81b585d0` endet mit **elf erfolgreichen
und drei fehlgeschlagenen Jobs**. Der vorliegende Nachtrag behebt die drei
Fehlerstellen und vier weitere Befunde aus den zuvor nicht erreichten lokalen
Workflow-Schritten: veraltete erzeugte Berichte, widersprüchliche Browser-Testdaten,
alte Physik-Testannahmen und den Verlust der aktuellen Transistorzuordnung bei
kalter Quellengenerierung. Der echte bayerische Generator reproduziert nun genau
die bereits dokumentierte Ergänzung; andere Quellenzuordnungen bleiben gleich.
Alle betroffenen Normaltests und der vollständige Qualitätslauf bestehen lokal;
Mathematik/Physik bleiben M7, alle 21 Katalog- und zwölf Routen-Mindeststände
bleiben erhalten. Die frische Remote-CI dieses Nachtrags sowie Merge und Main-CI
stehen noch aus. Dies ist kein weiteres abgeschlossenes K-/F-Paket.

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
| K1 | Elementarer Halbleiterpfad und eigener Transistor-Schaltversuch in #157; Verstärkerversuch in #159. Die ursprünglichen Länder-Stufenfälle sind aktuell geprüft. Eine eigene Prüfungsaufgabe zur Materialklassifikation fehlt noch; einzelne Quellenrollen und spätere Jahrgangsplätze bleiben offen. |
| K2 | Vier Diagrammaufgaben und drei elementare Aufgaben in #157; die jüngste Korrektur trennt Tabellenkompetenz und Zahlenvorbereitung der anspruchsvolleren Aufgabe. Physikrückgriffe und Länderplatzierungen bleiben offen. |
| K4, K6 | Enge Abschlusskandidaten; Abschluss wartet auf Merge und frische Main-CI. Die begrenzte K6-Routenabsicherung schließt die allgemeine Einheitenanerkennung nicht ab. |
| K8 | Elf alte Review-Eingänge waren geändert. Die neue unabhängige Nachprüfung der acht SH- und zwei HB-Sichten bestätigt nun die ursprüngliche Stufenreparatur am gepushten Stand; innere Reihenfolge und Planaktivierung bleiben offen. Abschluss erst nach Integration und frischer Main-CI. |
| K3, K5, K9–K11 | Fachrecherche und Teilreparaturen in #159; Länderbreite, einzelne Jahrgangszuordnungen und regionale Rückgriffe bleiben offen. |
| K7, K12, K13 | Rheinland-Pfalz-Platzierung und weitere Erwerbsrouten in #159 korrigiert. Die vollständige Bereinigung der Befunde zu Voraussetzungen und Stufenausschnitten bleibt offen. |
| F1, F2, F6 | Grundlage in #157: Planvertrag, Erzeugung und Diagnosekern. Reale Pläne, vollständige Anbindung und ihre Abnahme fehlen. |
| F3, F4 | Kanonische oberste Karten in #159 bereinigt; vollständige Karten aus realen Planeinheiten und innere Vorbereitungseinordnung bleiben offen. |
| F7 | Zweisprachiger Normkandidat in #159 veröffentlicht und unabhängig geprüft; noch nicht auf main integriert. |
| F5 | Fachprüfung teilweise umgesetzt über K1/K2; der vollständige Befundbestand bleibt offen. |

Der [unabhängige Abgleich des Restauftrags](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/current-scope-review-v1/README.md)
trennt die ursprünglichen Einzelbefunde von den weiterhin offenen inneren
Rückgriffen und realen Landesplänen. K4/K6 sowie F7 bleiben enge Abschlusskandidaten. Für K8 liegt inzwischen
eine [neue unabhängige Nachprüfung](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/k8-current-delta-independent-v1/README.md)
der zehn geänderten Sichten vor: keine Kompositionsfehler, unveränderte volle
Lernbasis und erhaltene ursprüngliche Stufentrennung. Damit ist auch K8
wieder ein begrenzter Abschlusskandidat; der historische Review bleibt
unverändert. Keiner dieser Punkte ist bereits auf main abgeschlossen.

**Korrektur nach externem Review:** Das Restauftragsaudit bindet `069fd6cf`,
nicht den jüngsten Push. Die große Kartenmessung stammt vom 15. November,
23:49 MEZ; für 66/72 Kontexte besteht danach Eingangsgleichheit, kein neuer
vollständiger Replay. Die sechs HE-CrossStage-Fälle wurden gesondert nachgemessen.
Der F6-Bericht lässt die GK+LK-Vereinigung innerhalb eines Fachs aus; ein
isoliertes Gegenbeispiel widerlegt deshalb einen umfassenden Nullbefund.
Der lokale Nachtrag ersetzt die unbewiesene Dominanzannahme durch
vollständige Enumeration einschließlich tatsächlicher GK+LK-Angebote.

Der HE-Pilotumfang bleibt G8 und G9. Eine erste G9-Umsetzung ist eine Reihenfolge,
keine Abnahme von G8. Die Physikquelle ist bislang G9-gebunden; getrennte
Physik-Dauersichten fehlen. In der vorläufigen HE-G9-Diagnose haben 148/582
Physik-GK-Ziele und 17/881 Mathematik-GK-Ziele kein Jahrgangs-/Phasenblatt.
Dies sind Rollen-/Filterauswertungen, keine neue native Lernkartenmessung.

Die Navigation-/Atomkorrektur und F6-Reparatur werden getrennt in einem lokalen
Sicherungscommit `4286f49250` auf `feat/stage-plan-he-runtime-20261116` gehalten,
ohne Push. Er sichert auch die flüchtigen Review- und Gegenbeispielbelege;
der zusätzliche Budgetcheck ist lokal als `048264060f` gesichert. Die sechs
geprüften Source-/Testdateien sind inzwischen in den lokalen Nachtrag für
#159 übernommen, ohne einen weiteren PR zu eröffnen.
Die Navigation-/Atomkorrektur umfasst
eine geänderte Produktionsdatei und eine neue Testklasse. Der erste Testlauf
umfasst vier neue und 35 vorhandene Tests aus drei Nachbarklassen, nicht die
136 Completion-Tests des gepushten Lernkartenfixes. Der globale Helper hat
16 Aufrufstellen. Der Nullfall ist inzwischen eng korrigiert; dieselben vier
Testklassen bestehen nun mit 40 Tests. Der frische vollständige Kandidatenlauf besteht separat mit 136 Tests in
16 Completion-Klassen; eine unverändert optionale Performancemessung ist
übersprungen. Das ist ein neuer Lauf und kein umbenannter älterer Nachweis. Ein frischer öffentlicher Replay
am gepushten Stand umfasst 28 reale hessische Konfigurationen mit jeweils
allgemeinem und engem Fokus: 56 gültige Zustände, 168 Compileraufrufe, kein
`MISSING_REFERENCE` und kein Cluster als atomare Abschlussanforderung.
Die Korrektur sichert damit einen konstruierten Grenzfall ab; ein aktueller
öffentlicher Fehler ist im benannten Umfang nicht reproduziert. Das ist keine
katalogweite Entwarnung.
F6 zählt im Entwurf alle nichtleeren Fachauswahlen und tatsächlichen
Kursvarianten auf: 15 Fälle bei zwei Fächern, davon neun mit beiden Fächern.
Die gezielten Report-, Materialisierungs- und Nested-Tests bestehen; eine
reale Mischfallmessung fehlt. Eine exakte Vorabzählung begrenzt den gesamten
Bericht auf 1.024 Fälle. Größere Inventare liefern ausdrücklich einen Fehler
und keine Teilergebnisse; damit ist keine Skalierung auf 20 Fächer abgenommen. Der K1-Aufgabenentwurf
ist wegen zusätzlicher AB1-fremder Anforderungen nicht angenommen; auch das
zugrunde liegende Evidenzprofil wird auf diese Überforderung geprüft.

**Weitere konkrete Restaufgabe K3/F5:** Die historische Aufgabe
„Bewegungsanalyse und freier Fall“ (`a9562b05`) behauptet weiterhin Nachweise
für eigene Versuche beziehungsweise Tabellenkalkulation, die ihr Aufgabentext
nicht verlangt. Eine Clusterzuordnung führt zudem indirekt eine bereits direkt
entzogene Abdeckung weiter. Diese Ansprüche bestanden schon auf main; #159
hat sie bisher nur teilweise zurückgenommen. Die fachliche Korrektur samt
geeigneten Erwerbsnachweisen bleibt offen. Der reparierte technische
Kursplan-Test beweist weder Versuchskompetenz noch die Güte dieser Aufgabe.

## 16. November 2026, 08:16 MEZ — Reviewbefunde und gebündelte CI-Korrekturen

**Stand: [PR #159](https://github.com/enpasos/skillpilot/pull/159) bleibt offen.
Der letzte Lauf für `b81b585d0` endet mit elf erfolgreichen und drei
fehlgeschlagenen Jobs. Dieser Nachtrag behebt diese drei Fehler und vier
zusätzliche Befunde aus dem lokalen Nachlauf. Alle betroffenen Normaltests,
Anwendungs-/Paketbuilds und der vollständige Qualitätslauf bestehen lokal.
Frische PR-CI, Merge und Main-CI fehlen; frühere Paket- und Browsernachweise
behalten ihren jeweils gebundenen Implementierungsstand.**

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
- **Drei Kontrollstellen:** [Frische Kartenwirkung und Nachweise des Nachtrags](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/external-review-followup-v1/README.md),
  [neue Daten- und Browserkorrekturen mit unabhängigen Reviews](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/ci-metadata-and-browser-followup-v1/README.md),
  [Gesamtauftrag mit Zielzustand und offenen Befunden](stage-plan-units-handover-2026-11-15.md).
- **Nachweise:** Lokal bestehen 354 Ansichtskontrollen, alle 21 Katalog- und
  zwölf Routen-Mindeststände (Mathematik/Physik M7), Schema- und JSON-Kontrollen
  über 120.706 Dateien,
  TypeScript und Lint. [Alle 17 ursprünglichen Backend-Testfehler](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/backend-ci-test-repair-v1/README.md)
  bestehen im gemeinsamen Nachlauf. Hinzu kommen 60 Java-Pakettests sowie
  unabhängige Modell-, Quellen- und Sicherheitsreviews. Die
  [Lernkartenkorrektur](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/memory-explicit-completion-v1/README.md)
  hat 136 bestandene Completion-Tests und 13 unabhängige Gegenprüfungen.
  Der [tatsächliche Paketnachweis](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-16/package-assessment-materials-pipeline-v1/README.md)
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
- **Nächster Schritt:** Diesen gemeinsamen Nachtrag auf #159 pushen, seine
  vollständige CI abwarten, danach integrieren und die frische Main-CI prüfen.
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
  [Erhaltene Review- und Testbelege](https://github.com/enpasos/skillpilot/tree/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-15/documentation-critique-review-v1).
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
