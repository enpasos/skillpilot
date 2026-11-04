# Arbeitsstand: implizite Erledigung und Mathematik-Nachprüfung

Der Zwischenstand liegt im [Draft-PR #79](https://github.com/enpasos/skillpilot/pull/79)
auf `wip/implicit-completion-math-checkpoint-20261103`. Er ist keine Merge-,
M7-, Deployment- oder vollständige CI-Freigabe.

## Aktueller Messstand: 4. November 2026

Die integrierten Änderungen umfassen jetzt **19 vollständige Prüfungsformen
unter bestehenden Lernziel-IDs** sowie geprüfte Plätze vorhandener Prüfungen.
Der jüngste Datenimport macht zwei vorhandene Markov-Prüfungen in zwölf
schleswig-holsteinischen Angeboten als zusätzliche SkillPilot-Vertiefung
erreichbar. Die 807 curricularen Mathematikziele bleiben erhalten.

| Vollständige Mathematikangebote | Aktueller Befund |
| --- | --- |
| Tatsächlich geprüfte Angebote | 161, einschließlich 46 Kursvereinigungen |
| Abschlussintegrität bestanden | Thüringen / Sekundarstufe I / G8 / GK+LK |
| Angebote mit verbleibenden Datenlücken | 160 |
| Ungedeckte Ziele | 312 unterschiedliche IDs / 5.722 Ziel-Angebots-Paare |
| Gewöhnliche offene Endpunkte | 186 unterschiedliche IDs / 3.041 Endpunktpaare |

Die acht zusätzlichen Analysisformen schließen 1.824 Ziel-Angebots-Paare und
624 Endpunktpaare. Der anschließende Markov-Import schließt weitere 164 bzw.
80 Paare. Beide Verbesserungen sind mit tatsächlichen Backendprojektionen und
unabhängigen Reviews belegt. Die ältere Nachweischronik unten nennt jeweils
den damaligen Zwischenstand.

Der Coach zeigt verfügbare Prüfungen auch bei ausschließlich ungedeckten
Abschlussrouten als ausdrückliche Auswahl. Daraus entstehen weder automatischer
Prüfungsstart noch implizite Gutschrift. Die gezielte integrierte Backendprüfung
besteht mit 179 Tests; alle Produktionsklassen wurden zusätzlich frisch
kompiliert. Die Graphvalidierung unterscheidet die curriculare Kompetenz von
ihrer Prüfungsform und prüft gerichtete Vorbereitungswege. Sie meldet noch
49 fachlich offene Routen.

Der GitHub-Stand `54de010d39` bestätigt Dokumentation, Lernzielbuch,
Completion-Kern, Cockpit, OpenAI-/Claude-Adapter und alle drei Gemini-Jobs.
Die vollständige Mathematikprüfung bleibt wegen der Datenlücken rot. Ihr
GitHub-Bericht stimmt für alle 161 Angebote bei Zielmenge, ungedeckten Zielen,
offenen Endpunkten und Prüfergebnis mit der lokalen Backendmessung überein.
Die vollständigen Frontend-, Backend- und Curriculum-Jobs laufen noch.

Der veraltete Hinweistext im Trainer-Plan-Test ist korrigiert; der vollständige
lokale UI-Test besteht. Ein gemeinsamer Datenbankname in unterschiedlichen
Gemini-Testkontexten verursachte zudem Tabellenverluste. Mit getrennten
Testdatenbanken bestehen lokal alle 170 Tests des betroffenen CI-Verbunds;
vorher wurden dieselben 17 Fehler reproduziert. Der anschließende erfolgreiche
GitHub-Gemini-Lauf bestätigt diese Korrektur. Für den gesamten PR wird weiterhin
kein vollständiger CI-PASS behauptet.

Die gleiche Datenbankkollision ist auch für Claude und die allgemeine
Backend-Testkonfiguration reproduziert und korrigiert. Nach der Korrektur
bestehen alle 163 Tests der vier betroffenen Klassen sowie der konkrete
Claude-Cachezyklus mit 50 Tests. Die ergänzende Controllerprüfung besteht mit
38 Tests; dabei wurden fehlende archivierte Eingaben im privaten Testaufbau
ergänzt und vier Schleswig-Holstein-Zielzahlen an die geprüfte
Markov-Ergänzung angepasst. Dieser begrenzte Nachweis ersetzt keinen
vollständigen Backendlauf.

[Analysisformen](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/analysis-eight/README.md)
· [Markov-Platzierung](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/sh-markov-twelve/README.md)
· [Graphvalidierung](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/directed-prior-stage-validation/README.md)
· [Coach und Plan](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/backend-explicit-assessment-choices/README.md)
· [Backend-Testdatenbanken](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/general-context-isolation/README.md)

## Integrierter Stand

- Ein binäres Mastery-Ergebnis pro atomarem Lernziel. Implizite Erledigung ist
  abgeleitet und erzeugt keine Mastery-Einträge. Prüfungen und Lernkarten bleiben
  bis zum expliziten Abschluss geschützt.
- Die Bedarfsberechnung beginnt bei den offenen geschützten Targets des
  vollständigen persönlichen Lehrplans und endet an bereits gemeisterten Zielen.
  Deterministische Tests prüfen alle tatsächlich angebotenen vollständigen
  Lehrpläne einschließlich Kursvereinigungen und ALL-Angeboten.
- Tages-/Wochenkontingente zählen explizite Abschlüsse. Gesamtfortschritt und
  Gesamtsaldo können implizite Erledigung einschließen.
- Eine konkrete Prüfungsform kann zur bestehenden curricularen Kompetenz gehören.
  Prüfungsrolle und curriculare Zugehörigkeit werden getrennt ausgewertet;
  die 807 curricularen Mathematikziele bleiben Teil der Qualitätsprüfung.
- Gespeicherte gültige aktive Ziele können nach Baumkorrekturen weiterbearbeitet
  werden, auch wenn ihre bisherige Fokuswurzel entfällt oder sich verkleinert.
  Explizite Neuauswahl und Konfigurationsänderungen prüfen den aktuellen Baum.
- Ein reiner Fehler `UNCOVERED_COMPLETION_TARGETS` unterbindet implizite
  Gutschriften und abgeleitete Abschlüsse. Sichere normale Lernangebote und der
  bereits aktivierte normale Autopilot bleiben im gültigen gespeicherten Fokus
  nutzbar. Sie verwenden denselben strikt geprüften Mastery-/Lernkartensnapshot.
  Ein fehlgeschlagener Snapshot bleibt für den ganzen Lesevorgang gesperrt.
  Prüfungsstart, Sitzungsbesitz, Planmodus und Fokusgrenzen bleiben gesondert
  geprüft; daraus entstehen keine automatischen Prüfungsstarts.
- Die SH-Zylinderkorrektur und die gemeinsame Prüfungsrolle sind integriert.
  Die Voraussetzungen der Q4-Prüfung und ihre tatsächlich bewertete Abdeckung
  werden im Lernzielbuchtest getrennt geprüft.
- Fünf bestehende Kompetenzen zu quadratischen Funktionen und Stochastik haben
  jetzt vollständige Prüfungsaufgaben mit Lösungen und Bewertungsregeln auf
  Deutsch und Englisch. Ihre Lernziel-IDs bleiben gleich. Die bestehende
  Matrixprüfung ist in weiteren fachlich geprüften Lehrplanangeboten platziert.
  Sechs fachlich falsche Voraussetzungskanten sind entfernt; regulär benötigte
  Grundlagen bleiben erhalten. Die normale Erzeugung der Länder- und
  G8/G9-Ansichten bewahrt dabei die tatsächlichen Ziel- und Vorbereitungsrollen.
- Zwei weitere bestehende Geometriekompetenzen erhalten vollständige deutsche
  und englische Prüfungsformen: kongruente und maßstäbliche Dreiecksbilder mit
  Geometriesoftware sowie die begründete Modellierung eines Regenwassertanks.
  Die Aufgaben haben jeweils eine Gesamtbewertung und ein binäres Ergebnis;
  bestehende IDs, Kompetenzbeschreibungen und Voraussetzungen bleiben gleich.
  In Thüringen werden außerdem 21 durch Originalquellen belegte Grundlagen
  als eigene Lernziele angeboten, auch bei gemeinsamer Auswahl beider
  Schulstufen. Die reine Oberstufenansicht bleibt unverändert.
- Die bestehende Modellierungsprüfung zur Medikamentenkonzentration ist in
  20 weiteren fachlich geprüften Oberstufenangeboten erreichbar. Die Aufgabe
  und ihre Voraussetzungen bleiben unverändert. Bei zusätzlichem Stoff wird
  keine offizielle Pflichtstoffabdeckung behauptet.
- Die bestehende Prüfung zu räumlichen Koordinaten und Vektoroperationen ist
  in 36 weiteren geprüften Angeboten erreichbar. Ein veraltetes Länderfeld
  wird mit dem Ergebnis des vorhandenen Compilers synchronisiert. Die Aufgabe
  und ihre bewertete Abdeckung bleiben unverändert. Die tatsächlichen Bäume
  bestätigen alle neuen Plätze auch bei gemeinsamer Auswahl von GK und LK.
- Vier weitere bestehende Raumgeometriekompetenzen besitzen vollständige
  Prüfungsformen: geradlinige Bewegungen mit Vektoren, Spurpunkte, Geraden-
  und Ebenenscharen. Die Gesamtbewertung schützt die wesentlichen Leistungen;
  insbesondere darf der zentrale Spezialfall der Ebenenschar nicht vollständig
  fehlen und trotzdem zum Bestehen führen.

Die Konzepte und das LaTeX/PDF sind Teil des PR. Der abschließende Abgleich mit
allen weiteren fachlichen Korrekturen bleibt Bestandteil des Meilensteins.

## Nachweisverlauf mit den jeweiligen Zwischenständen

Der Quellen-/Autoren-Nachlauf nach dem 40-Dateien-Import besteht alle zehn
normalen Kommandos: Source21, Lernzielbuch, Länderansichten83, Daueransichten18,
Source-Coverage, Stage, RP, Hard Routes, Phase und Python-Populationstests.
Ein zusätzlicher Rohvergleich gespeicherter gegen kompilierte Applicability
bleibt mit 66 Unterschieden rot. Diese ganzen Datensätze und die 21
APV203-Warnungen sind vor und nach dem Import identisch; sie wurden weder
überschrieben noch zu erfolgreichen Prüfungen umdeklariert.

Der frisch kompilierte integrierte Java-Stand besteht **337/337 Tests** in zwölf
vollständigen Suiten ohne Skips oder Abbrüche. Darunter sind alle drei realen
Gemini-Lernflüsse, 85 Frontierfälle, die 34 historischen Fokusfälle sowie
Prüfungsstart-, Lernkarten-, Coach-, Projektions- und Plangrenzen.
[Ausführungsnachweis](../qa-ci/evidence/curriculum-completion-integrity/2026-11-03/integrated-normal-frontier/execution.json).
Dies ist ein gezielter Nachlauf, kein vollständiger Backend- oder CI-PASS.

Nach der SH-Korrektur verblieben 378 ungedeckte Ziel-IDs und 9.762
Ziel-Angebots-Paare. Das inzwischen übernommene Matrix-/Fünf-Aufgaben-Paket
schließt davon weitere **1.121 Ziel-Angebots-Paare und 690 Endpunktpaare**,
ohne neue Lücken oder Zielverluste hinzuzufügen. Aktuell verbleiben
**362 unterschiedliche ungedeckte Ziel-IDs / 8.641 Ziel-Angebots-Paare und
208 gewöhnliche Endpunkt-IDs / 4.345 Endpunktpaare** auf diesem Zwischenstand.
Alle **161 Angebote** besaßen dort weiterhin ungedeckte Routen.

Die acht abschließenden Generator-, Quellen-, Rollen- und Populationstests
bestehen. Nach dem Import der 363 geprüften Dateien stimmen die 8.732
gebundenen Eingabedateien mit dem tatsächlichen Native-Nachlauf über 161 Angebote und
46 Kursvereinigungen überein. Das unabhängige Astra-Review und der normale
Lernzielbuchtest sind ebenfalls abgeschlossen. Diese begrenzte Verbesserung
ist keine M7- oder vollständige CI-Freigabe.
[Messung und Importnachweis](../qa-ci/evidence/curriculum-completion-integrity/2026-11-03/matrix-and-five-forms/README.md).

Das anschließende Geometrie-/Thüringen-Paket schließt weitere **324
Ziel-Angebots-Paare und 116 Endpunktpaare**, ohne neue Lücken oder Zielverluste.
**Thüringen Sekundarstufe I / G8 / GK+LK besteht** jetzt die vollständige
Abschlussintegritätsprüfung. Es verbleiben **353 ungedeckte Ziel-IDs / 8.317
Ziel-Angebots-Paare sowie 206 gewöhnliche Endpunkt-IDs / 4.229 Endpunktpaare**
in den übrigen **160 Angeboten**. Der gesamte Mathematik-Corpus bleibt rot.
Der tatsächliche Java-Nachlauf verwendet ausschließlich versionierte
Runtime-Eingaben und die geprüfte Korrektur; ignorierte lokale Quellencaches
sind nicht Teil dieses Nachweises. Die 807 curricularen Ziele bleiben in der
Qualitätsprüfung.
[Messung und Standardprüfungen](../qa-ci/evidence/curriculum-completion-integrity/2026-11-03/th-seki-geometry/README.md).

Die anschließende Platzierung der bestehenden Medikamentenkonzentrationsprüfung
schließt weitere **100 Ziel-Angebots-Paare und 60 Endpunktpaare**. Aktuell
bleiben **353 ungedeckte Ziel-IDs / 8.217 Ziel-Angebots-Paare sowie 206
gewöhnliche Endpunkt-IDs / 4.169 Endpunktpaare**. Thüringen Sekundarstufe I
bleibt gültig, die übrigen 160 Angebote enthalten weiterhin Lücken. Die sieben
relevanten Autorenchecks bestehen; alle 2.607 tatsächlich gemessenen
Runtime-Eingänge stimmen nach dem Import überein. Sämtliche bisherigen
sichtbaren Zielpfade und wirksamen Voraussetzungen bleiben erhalten.
[Messung und Import](../qa-ci/evidence/curriculum-completion-integrity/2026-11-03/drug-twenty/README.md).

Die anschließende Vektorplatzierung schließt weitere **81 Ziel-Angebots-Paare
und 18 Endpunktpaare**. Es verbleiben **348 ungedeckte Ziel-IDs / 8.136
Ziel-Angebots-Paare sowie 204 gewöhnliche Endpunkt-IDs / 4.151 Endpunktpaare**.
Alle 125 übrigen Angebotsobjekte bleiben vollständig gleich. Die sieben
Autorenchecks bestehen; nach dem Import aller 49 Dateien stimmen sämtliche
2.636 gemessenen Runtime-Eingaben überein. Die 807 curricularen Ziele bleiben
in der Qualitätsprüfung. Der gesamte Mathematik-Corpus bleibt rot.
[Messung, Review und Import](../qa-ci/evidence/curriculum-completion-integrity/2026-11-03/vector-thirtysix/README.md).

Die vier zusätzlichen Raumgeometrie-Prüfungsformen schließen weitere
**426 Ziel-Angebots-Paare und 406 Endpunktpaare**. Aktuell bleiben **343
ungedeckte Ziel-IDs / 7.710 Ziel-Angebots-Paare sowie 200 gewöhnliche
Endpunkt-IDs / 3.745 Endpunktpaare**. Zielumfang, sichtbare Pfade und wirksame
Voraussetzungen bleiben unverändert. Alle elf normalen Autorenchecks bestehen;
nach dem Import der 82 Dateien stimmen die 2.655 gemessenen Runtime-Eingänge.
Die acht betroffenen A/M-Zeilen sind tatsächlich unabhängig neu bewertet.
Thüringen Sekundarstufe I bleibt gültig, die anderen 160 Angebote bleiben rot.
[Messung, unabhängiges Review und Import](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/space-geometry-four/README.md).

Der GitHub-Nachlauf von `4aba8e0c33` bestätigt alle dort gemessenen Lückenpaare
exakt. Lernzielbuch, Completion-Kern und Cockpit bestehen. Die allgemeine
Graphprüfung meldet 114 Fehler; ihre Routen- und Typdiagnosen werden gesondert
geprüft. Dies ist keine vollständige CI-Freigabe.

Der anschließende geprüfte CI-Fix entfernt genau 39 falsche Meldungen zu
nichtatomaren Prüfungsordnern und erhält alle echten Routenprüfungen. Der
Physics-Eingabetest trennt seine feste Algorithmus-Testeingabe von der Bindung
an lebende Mathematikdaten. Beide vollständigen Testbefehle bestehen nach
dem Import; der aktuelle Gesamtgraph mit den vier Raumgeometrieformen
bleibt mit **72 Datenbefunden** rot.
[Unabhängiges Review und aktueller Nachlauf](../qa-ci/evidence/curriculum-completion-integrity/2026-11-04/ci-validation-fixes/README.md).

Im [GitHub-Lauf für `8899fb212c`](https://github.com/enpasos/skillpilot/actions/runs/41707073546)
besteht der reale vollständige Mathematik-MCP-Prüfungsablauf einschließlich
bestätigter binärer Mastery. Die strenge Prüfung aller 161 Mathematikangebote
bleibt wegen der tatsächlichen Routenlücken rot. Der Mathematikjob erreicht
diese Tests jetzt wieder: Die drei Completion-Jobs lassen beim Checkout
den dort unbenötigten Spiegel der Lernbilder aus, rund 4,8 GiB pro Job.
Alle funktionalen Corpusinputs und die Prüfanforderungen bleiben erhalten.
Die lokalen neun Workflow- und 28 Corpusbericht-/Eingabetests bestehen.
Der Cockpit-Job besteht einschließlich echter Browsernavigation. Im Kernjob
laufen 484 Tests, davon scheitern fünf Browser-/Neustartfälle: Ihre bisherigen
Voraussetzungen erwarten einen gültigen Mathematiklehrplan, den die neue
Integritätsprüfung wegen der vorhandenen Routenlücken zurückweist. Die
Transport-Testverträge werden getrennt von den fachlichen Datenlücken geprüft.
Dies ist keine vollständige CI-Abnahme.

Commit `93adc9f653` beschränkt zusätzlich die Edge- und Action-Checkouts auf
ihre tatsächlich benötigten Eingaben. Alle bestehenden Jobkommandos wurden
isoliert ausgeführt; die vorbestehende lokale Nginx-Syntaxprüfung bleibt ohne
installiertes Nginx übersprungen. Keine Prüfanweisung wurde entfernt. Der
zugehörige [GitHub-Lauf](https://github.com/enpasos/skillpilot/actions/runs/41711435675)
bestätigt beide Jobs als erfolgreich; die übrigen Jobs sind damit nicht abgenommen.

Commit `c63ea20e1e` beschränkt auch den OpenAI-MCP-Checkout. Alle 2.575
versionierten Runtime-JSON-Eingaben einschließlich der 270 Bildmetadaten bleiben
erhalten; ihr Revisionshash stimmt mit dem vollständigen Git-Bestand überein.
Die 242 lokalen Tests bestehen ohne Skips. Der entsprechende OpenAI-MCP-Job
im [GitHub-Lauf](https://github.com/enpasos/skillpilot/actions/runs/41712066230)
ist ebenfalls erfolgreich. Veröffentlichte Pluginartefakte bleiben unverändert.

Commit `d201101062` trennt die Ablaufprüfungen vom wechselnden fachlichen
Corpuszustand. Browser und Neustart verwenden einen gültigen dateibasierten
Testlehrplan mit 916 Targets und 139 Prüfungen; produktive Loader, Compiler,
Controller, Datenbanken und MCP bleiben beteiligt. Ein zusätzlicher Test ergänzt
eine isolierte Kopie der echten Mathematikdaten um ein bekanntes ungedecktes
Ziel. Er prüft die fehlende implizite Gutschrift sowie normale Lernwege und
gebundene Prüfungsstarts einschließlich der Besitz- und Revisionsgrenzen.
Alle sechs Tests bestehen lokal ohne Skips; der Neustart verwendet zwei echte
Boots mit PostgreSQL 18.1. PostgreSQL 15 bleibt der unveränderten GitHub-CI
vorbehalten. Der Kernjob im [GitHub-Lauf für diesen Commit](https://github.com/enpasos/skillpilot/actions/runs/41715062053)
ist inzwischen auch mit PostgreSQL 15 erfolgreich. Die strenge
Mathematik-Corpusprüfung bleibt wegen der Datenlücken rot und wird dadurch
nicht ersetzt.

## Nächste fachliche Pakete

Die verbleibenden Mathematiklücken werden anhand der tatsächlich angebotenen
Lehrpläne in fachlich zusammenhängenden Paketen repariert. Bereits geeignete
Prüfungsformen und fehlerhafte Platzierungen werden zuerst geprüft. Fehlende
Grundlagen dürfen nicht nur als unsichtbare Vorbereitung ergänzt werden,
wenn der Lehrplan sie selbst als Lernziele vorsieht. Mechanisch vorhandene
Voraussetzungen sind Suchkandidaten und ersetzen keine Quellen- oder
Erwerbsfolgeentscheidung. Das optionale curriculare Level-Thema ist kein
Bestandteil dieses Meilensteins.

Der Mathematik-Meilenstein verlangt gültige vollständige Angebote, die
bestehenden M7-Grenzen und bestandene erforderliche GitHub-Checks des konkreten
PR-Commits. Danach folgen separat Physik, Biologie, Chemie und
Wirtschaftswissenschaften. Produktionsdaten des Beta-Testers bleiben außerhalb
dieses Checkpoints.

Der ausführliche Prüfstand steht in
[Abschlussintegrität](../qa-ci/curriculum-completion-integrity-2026-11-01.md),
der fachliche Vertrag in
[Assessment-gated Completion](../concept/skill-graph/assessment-gated-completion.md).
Die ursprüngliche [Quellensicherung](checkpoints/2026-11-03/README.md) enthält
351 ausgewählte Kandidatendateien mit SHA-256-Manifest. Sie ist ein historischer
Recovery-Snapshot und aktiviert keine noch offenen Kandidaten.
