# Datenbindung der Lerneinheiten

Arbeitsentscheidung für S2–S4, 5. November 2026. Grundlage sind das
[akzeptierte Lerneinheitenkonzept](../concept/skill-graph/learning-units.md) und
der [Umsetzungsplan](learning-units-implementation-plan.md). Dieses Dokument
beschreibt die Bindung zwischen vorhandenen Autorendaten und der neuen Runtime;
es ist keine eigenständige Inhalts-, Rollout- oder Hostabnahme.

## Autoritative Erwerbszuordnung

Eine fachliche Einheit verwendet einen vorhandenen `ProgramUnit` vom Typ
`module` mit expliziten `learningUnit`-Metadaten: Vertragsidentität, Revision,
Placementrevision, Lernversprechen und Einführung. Ein Kalenderknoten wird
dadurch nicht automatisch zur fachlichen Einheit.

`GoalPlacement.acquisition=true` bezeichnet die direkte Erwerbsheimat.
Bestehende `primary`-, `secondary`- oder `assessed`-Platzierungen allein reichen
dafür nicht. Der Compiler verlangt genaue Übereinstimmung zwischen den
gebundenen Erwerbsplatzierungen und Own. Die optionale Liste
`learningUnit.requiredChildUnitIds` bindet erforderliche Kinder an vorhandene
ProgramUnits und deren genaue Vertragsrevisionen. Mehrere Angebotsaggregate
dürfen dieselbe kleine Einheit referenzieren, ohne deren Ziele, Platzierungen
oder Vertrag zu kopieren. `parentUnitId` bleibt Programmnavigation.
Eine explizit leere Liste bedeutet keine Pflichtkinder; bei fehlendem Feld wird
für ältere Verträge noch der bisherige Parentbinder verwendet.
Innerhalb eines aufgelösten rekursiven Erwerbswegs gibt es für jedes Ziel eine
direkte Heimat. Die ausgewählte Angebotswurzel muss den tatsächlichen
Zielumfang genau treffen; die bloße Teilmengenprüfung reicht dafür nicht.

Unterschiedliche Länder-/Kursumfänge brauchen geprüfte passende Bindungen.
Ein gerade gewählter Fokus, ein gemeinsamer Bildschirm-Elternknoten oder ein
besuchter Lehrplan verändert Own nicht. Varianten dürfen den kanonischen
Prüfungsanspruch nicht erweitern oder fremde Targets zum Umfang hinzunehmen.

## Unveränderliche Verträge und Eingaben

Die Semantik heißt `global-unit-recognition-v1`. Ein Vertrag bindet insbesondere
Own, Pflichtkinder, eigene Prüfungen und Karten, vollständige atomare
Voraussetzungen sowie die tatsächlichen Aufgaben-, Lösungs-, Rubrik- und
Reviewrevisionen. T wird aus Own und den Kindern abgeleitet, nicht als zweiter
manuell gepflegter Zielbaum geführt.

Der geordnete Katalog unter `curricula/DE/Gymnasium/learning-units/` verweist auf
die Vertragsdateien und ihre genauen Byte-Hashes. Auch alle erforderlichen
Eingaben sind gepinnt. Ein gemeinsamer eingefrorener Quellensnapshot pro
Generation vermeidet das Kopieren desselben Curriculums für jede kleine Einheit.
Er enthält die für Normalisierung und Erwerbsbindung erforderlichen
Landschaften, Program-/Placementdaten und Kompositionsbindungen.

Aktive und archivierte Einträge dieses Runtimekatalogs sind bereits unabhängig
geprüfte Verträge. Ungeprüfte Kandidaten bleiben in der Autorierungsqueue.
Beide Eintragsarten werden gegen ihre gepinnten eingefrorenen Quellen geprüft;
ein späterer Graph darf alte Ergebnisse nicht neu auslegen. Eine ungültige
neue Eingabe wird isoliert zurückgewiesen und darf keine gültige ältere
Anerkennung oder ein unabhängiges Fach ausfallen lassen. Historische
Vertragsbedeutungen haben bei Konflikten Vorrang vor neuen Kandidaten.

Davon getrennt wird geprüft, ob ein Vertrag heute im konkreten Angebot
ausgewählt und bedient werden kann. Eine veränderte Navigation oder Platzierung
kann diese aktuelle Bindung ungültig machen, entzieht aber keine gültige
Anerkennung. Ebenso darf eine unter derselben Ziel-ID veränderte Prüfungsaufgabe
keine neuen Ergebnisse mit der alten Ergebnisbedeutung schreiben. Diese
Identitätsprüfung ist keine neue Voraussetzungssperre für Direktprüfungen.

Eigene Zielbedeutungen werden als festes Datenobjekt und Digest gebunden.
Die aufgelöste fachliche Rolle wird gesondert gegen die autoritative Quelle
geprüft. Das ist nötig, weil vorhandene echte Prüfungsziele teilweise `examData`
besitzen, ohne bereits `nodeKind=exam` zu tragen. Ebenso darf ein gewöhnliches
Fachziel nicht durch Selbstdeklaration als Orientierung der Inhaltsprüfung
entgehen. Task-, Rubrik- und Karteneingaben erhalten eigene Bindungen.
Ausgelieferte Sprachvarianten einer Prüfung brauchen statische Bindungen an
denselben geprüften Anspruch. Historische Ergebnis-Aliasse benötigen ebenfalls
eingefrorene Rollen-, Bedeutungs- und Reviewbindungen; ein heutiges allgemeines
Curriculum-Mapping darf keinen früheren Verständnisabschluss zum Prüfungspass
machen. Die erste Einheit benötigt weder Ergebnis-Aliasse noch englische
Aufgabenvarianten oder eigene Karten.

Eine tatsächlich ausgelieferte englische Aufgabe wird durch die optionale
endliche Map `assessmentClaims[Q].taskVariants.en` gebunden. Sie nennt den Digest
des wirklichen Aufgaben-/Lösungspaars, die unveränderte normale Rubrik und eine
gepinnt strukturierte unabhängige Same-Claim-Prüfung. Diese Prüfung bindet auch
die vollständigen kanonischen Claim-IDs und deren Kompetenzbedeutungen.
Die eigene normale Bestehensentscheidung bleibt binär; eine Sprachvariante
erzeugt weder eine zusätzliche Bestehensstufe noch eine Lernerqualifikation.

Eine Karteneinheit bindet ihre wirklich ausgewählten stabilen Karten-IDs, die
Deckidentität und die jeweilige Frage-/Antwortbedeutung für Deutsch und Englisch.
Statische Aufnahme und Runtime verwenden denselben vorhandenen Tag-Selektor.
Verlässliche Recall-Ergebnisse werden gegen diese eingefrorene Auswahl
ausgewertet; später fällige Karten oder reine Darstellungsänderungen am Deck
öffnen sie nicht rückwirkend. Eine andere erforderliche Kartenauswahl braucht
eine ausdrückliche Inhalts- und Identitätsentscheidung. Vor der ersten solchen
Einheit sind die Auswahlbindung und ihre Paketkompatibilität nachzuweisen.
Katalogeinträge mit eigenen Karten verlangen dafür ausdrücklich
`recallBindingSemantics=verified-recall-selection-v1`. Ein alter strikter
Consumer darf die Auswahlbeschreibung nicht als beliebige Deckdatei ignorieren.

### Geprüfte Nachfolger und Kartenaufteilungen

Eine neue Curriculum-/Placementrevision darf eine alte Prüfungs- oder
Abrufpflicht durch einen ausdrücklich geprüften Nachfolger ersetzen. Das Review
nennt alte und neue IDs, betroffene native Angebote, geänderte Aufgaben- oder
Kartenbedeutung sowie das genaue erwartete Zielmengendelta. Gewöhnliche
Kompetenzen dürfen dadurch nicht aus dem fachlichen Umfang verschwinden. Zwei
ähnliche Prüfungen bleiben nur dann beide Pflicht, wenn tatsächlich zwei
eigenständige Ergebnisse gewollt sind. Eine neue ID allein ersetzt kein Ziel.

Alte Aufgaben, Ergebnisse und gültige Verträge bleiben erhalten; ein neuer
strengerer Anspruch erhält keinen Ergebnis-Alias von einem alten Pass, der die
zusätzliche Kompetenz auslassen konnte. Bestehende feste Planzielmengen werden
nicht still umgeschrieben. Eine ausdrückliche Neuplanung übernimmt den neuen
Zielstand, ohne rückdatierte Abschlüsse oder neue Periodenereignisse zu erfinden.

Ein breites Kartenziel darf erst aus den aktuellen Pflichten entfallen, wenn
seine gesamte bisherige Kartenpflicht einer geprüften Nachfolgerpartition
zugeordnet ist. Kleine neue Abrufziele verwenden neue stabile IDs und genaue
`select:`-Auswahlen mit derselben DE-/EN-Bedeutung. Ein Kartenziel unter derselben
ID erhält keine wechselnde Auswahl je Bundesland. Gleiche Karten-IDs in einem
neuen Ziel übernehmen allein noch keine alte SRS-Historie: Der erste minimale
Betriebsweg ist ein eigener expliziter Abruf. Eine spätere Übernahme verifizierter
Kartenleistungen braucht belegte historische Bedeutung und bewahrt deren echte
Zeitpunkte. Weder ein breites altes Masteryergebnis noch heutige Deckhashes
genügen dafür.

### Statische Ablösung nach der Kursprofil-Union

**Geplante Umsetzung, noch nicht implementiert.** Kursprofile vereinigen ihre
zuvor unabhängig aufgelösten Targets weiterhin additiv. Ein direkter Ausschluss
in einer LK-View entfernt deshalb keine alte Prüfung, die eine gleichzeitig
gewählte GK-View weiterhin als Target enthält. Die normale Rollenpriorität wird
für diesen Nachfolgerfall nicht verändert.

Eine revisionsgebundene, unabhängig geprüfte Programm-/Placementquelle soll
dafür optional `obligationReplacements` deklarieren: alte und neue Q-/K-IDs,
exakte native Scopebezüge, erforderliche Einheits- und Placementrevisionen
sowie den gepinnten Reviewbeleg. Die Quelle ist eigenständige Autoreninformation,
keine Eingabe aus dem daraus erzeugten aktuellen Offerbinder. Scopebezüge werden
aus dem tatsächlichen Angebotsinventar gebunden; Lernenden-ID, Fokus, Sprache,
M und I beeinflussen diese Auswahl nicht.

Für die zunächst unverändert additiv berechnete atomare Targetmenge `T0(s)` gilt:

```text
Removed(s) = Vereinigung der ausdrücklich ersetzten alten Q/K im Angebot s
Tnew(s)    = T0(s) \ Removed(s)
```

Die Operation fügt selbst kein Target hinzu. Alle Nachfolger müssen bereits
reguläre Targets sein; gewöhnliche Kompetenzen, Orientierung und Cluster dürfen
nicht entfernt werden. Kanonische Eltern und `requires` bleiben erhalten.
Überschneidungen, Zyklen, fehlende Nachfolger und unvollständige Partitionen sind
Konfigurationsfehler. Ein altes Q mit verbleibendem Verbraucher benötigt eine
eigene geprüfte Entscheidung und darf nicht still übersprungen werden.

Der native Projektor verwendet ausschließlich diese statischen Quellen. Erst
der nachgelagerte Offercompiler prüft ihre Übereinstimmung mit den ausdrücklich
ausgewählten Einheiten. Ein Aufruf von `LearningUnitService` oder die Abfrage des
aktuellen Binders während der Targetberechnung würde eine Abhängigkeitsrunde
erzeugen und ist ausgeschlossen. Quelle, Review und Algorithmus benötigen
echte Eingabebindung, einen Cache je unveränderlicher Revision und denselben
Paketpfad. Consumer ohne die nötige Fähigkeit müssen einen solchen neuen Stand
ablehnen; ohne das Feld bleibt das bisherige Verhalten bestehen.

Alte M-Ergebnisse und gültiges globales I bleiben erhalten. Eine entfallene
Prüfpflicht ist kein bestandenes Prüfungslernziel. Feste Pläne behalten `G_old`;
erst ausdrückliche Neuplanung übernimmt `G_new`. Ein dadurch überholter Plan
muss weiter bedienbar bleiben oder die nötige Neuplanung sichtbar anbieten.
Es entstehen keine rückdatierten Abschlüsse und keine Periodenereignisse.
Vor Aufnahme sind insbesondere GK/LK/Kursunion, alle 182 Angebote, die bisherigen
807 Kompetenzmitgliedschaften, historische Pläne, Direktzugang und die wirkliche
Source-/Paketparität zu prüfen. Die aktuelle Inhaltsfreigabe neuer Aufgaben
ersetzt diese Abnahme nicht.

Die Objekt-Hashes verwenden sortierte JSON-Schlüssel, UTF-8, kompakte
Trennzeichen und explizite Nullwerte der festen Bedeutungsfelder. Dateihashes
binden genaue Bytes. Ein Hash beweist Integrität, keine fachliche Qualität:
die unabhängige Gegenbeispielprüfung der normalen Bestehensrubrik bleibt nötig.

## Aktuelle Angebotsbindung

Der zusätzliche Katalogzeiger `currentOfferBinding: {path, sha256}` bindet eine
gemeinsame Angebotsgeneration. Sie enthält schon beim Teilrollout alle 182
erfassten Konfigurationen. Der Schlüssel verwendet die nativen Dimensionen
Basislehrplan, Fachlandschaft, Schulform, Jurisdiktion, Stufe, Dauer und
Kursprofil. Fokus, Sprache und Lernenden-ID gehören nicht hinein.

Jede Zeile nennt die ausdrücklich ausgewählten Wurzelverträge, die tatsächlich
verwendeten View-IDs und Digests der exakten atomaren Target- und
`prerequisiteOnly`-Mengen. Der normale Backendprojektor liefert die Vergleichsdaten.
Es werden keine Einheiten allein deshalb gewählt, weil ihre Ziele zufällig
eine Teilmenge des aktuellen Umfangs sind. Die direkte Erwerbszuordnung muss
innerhalb der ausgewählten Hierarchie eindeutig sein.

`coverage=partial` erlaubt eine disjunkte Teilabdeckung einschließlich leerer
Wurzelliste. `coverage=complete` verlangt die exakte vollständige Zielmenge
einschließlich Q, K und Orientierung. Der Nachweis für S4 verlangt vollständige
Abdeckung jeder erfassten Konfiguration und aller 807 ursprünglichen
Fachkompetenzen; erledigte Autorenpakete allein genügen nicht.

Gemeinsame notwendige Runtimeinputs werden einmal gebunden und pro betroffener
Zeile geprüft. Der umfangreiche native Quellenbeleg dient separat der
Reproduktion und Releaseprüfung. Er wird nicht je Lernendenrequest erneut
aufgebaut. Eine ungültige Angebotszeile liefert einen getrennten
`offerBinding`-Status; gültige globale Anerkennung bleibt erhalten.

Für Pakete mit `learningUnitOfferBindingsV1` verwendet die Runtime die nativen
Mappingdateien für operative Scope- und Aliasauflösung. Ihre Bytes und logischen
Quellpfade sind durch Manifestinventar, Inputwrapper und Angebotsbindung
authentifiziert. Derselbe Parser wie im Repositorybetrieb wertet sie aus.
Die kompilierten `source-to-canonical-mappings` bleiben dagegen geprüfte
Publikations- und Quellenbelege; ihre Reviewrelation muss nicht mit der nativen
operativen Relation übereinstimmen. `runtimeRequired` verlangt Vorhandensein und
Verfügbarkeit des Artefakts, nicht Gleichheit dieser beiden Relationen.
Der bisherige S2-/Paketpfad ohne diese Fähigkeit bleibt unverändert. Laufende
Mappings erzeugen keine neuen Ergebnis-Aliasse: Dafür gelten weiterhin die
eingefrorenen Ergebnisbindungen. Eine ungültige aktuelle Angebotsbindung zieht
gültiges globales I nicht zurück.

Die Defaultsicht des getrennten Paketeinstiegs wird aus dessen geprüfter
Definition abgeleitet. Sie navigiert zur unveränderten Mathematiklandschaft und
fügt weder Mathematikziele noch einen weiteren fachlichen Umfang hinzu. Die
Bedienfolge und die getrennten Paketnachweise stehen im
[Provisionierungsrunbook](../production-pipelines/curriculum-package-provisioning.md).

## Ein gemeinsamer Ergebnisstand

Der statische Compiler arbeitet unabhängig von Lernenden. Ein kohärenter
expliziter Mastery-/Recall-Snapshot liefert M. Jede lokale Nachfrageberechnung
verwendet ausschließlich M und das eingefrorene R; sie passiert gemeisterte
Zwischenziele und externe Unterstützung. I wird nicht erneut eingespeist.

Alle gültigen lokalen Anerkennungen ergeben zusammen mit M das globale M_eff.
Frontend, Coach, Frontier und Gesamtplanung verwenden dieselbe Lesesicht.
Explizite Ergebnisse und Anerkennung bleiben für Herkunft und Darstellung
unterscheidbar. Es entstehen weder zusätzliche Masteryzeilen noch
Lernerqualifikationen, Scopebesuchsregister oder erfundene Abschlussereignisse.

Nicht vertraglich gedeckte Ziele erhalten keine neue implizite Anerkennung.
Die frühere automatische Erlassmenge ist kein Ersatz für I. Bestehende normale
Lernwege und bewusst veröffentlichte Direktprüfungswege bleiben verfügbar;
neue Einheitszuordnungen führen keine zusätzlichen Zugangssperren ein.

Gesamtfortschritt und Gesamtsaldo zählen gültiges I. Tages-/Wochenkontingente
und ihre Historie verwenden ausschließlich datierte explizite Abschlüsse.
Die vorhandene explizit-only-Präferenz bleibt eine Plan-Zählpräferenz.

## Kompatibilität und Nachweise

Die neue Bedeutung braucht eine explizite Paketfähigkeit mit vollständigen
Verträgen und Eingabebytes. Ein älterer Consumer darf sie nicht stillschweigend
ignorieren. Der aktuelle Export-/Importpfad muss die neue Bedeutung erhalten;
die alten veröffentlichten Paketprofile und Artefakte bleiben unverändert.

Für Angebotsbindungen kommt die verpflichtende Fähigkeit
`learningUnitOfferBindingsV1` hinzu. Innerhalb Runtime 1.2 erhält sie ein
ausdrücklich benanntes zusätzliches Schema-/Profilpaar; vorhandene
1.2-Schemas und Profile bleiben für die alten Pakete bytegenau erhalten.
Ein Consumer ohne diese Fähigkeit muss das neue Paket abweisen. Der
negative Kompatibilitätstest gehört zur Abnahme; ein neuer optionaler
JSON-Abschnitt allein würde stilles Ignorieren nicht zuverlässig verhindern.

Vor einer Fertigmeldung sind die echten nativen Angebote und ihre
Erwerbs-/Inhaltsbindungen, Archiv-/Fehlerisolation, SRS-/Cacheinvalidierung,
Frontend-/Coach-/Planparität, Paketroundtrip und bestehende produktive Abläufe
am konkreten Kandidaten zu prüfen. Ein isoliert grüner Evaluatortest ersetzt
diese Integrationsnachweise nicht.
