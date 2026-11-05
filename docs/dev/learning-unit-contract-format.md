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
gebundenen Erwerbsplatzierungen und Own. Erforderliche Kinder werden gegen die
explizite Programmhierarchie geprüft. Innerhalb eines aufgelösten rekursiven
Erwerbswegs gibt es für jedes Ziel eine direkte Heimat.

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

Aktive Verträge werden zusätzlich gegen die aktuelle Quelle geprüft.
Archivierte gültige Verträge werden gegen ihre eingefrorenen Quellen geprüft;
ein späterer Graph darf alte Ergebnisse nicht neu auslegen. Eine neue ungültige
Revision wird isoliert zurückgewiesen und darf keine gültige ältere Anerkennung
oder ein unabhängiges Fach ausfallen lassen. Historische Vertragsbedeutungen
haben bei Konflikten Vorrang vor neuen Kandidaten.

Eigene Zielbedeutungen werden als festes Datenobjekt und Digest gebunden.
Die aufgelöste fachliche Rolle wird gesondert gegen die autoritative Quelle
geprüft. Das ist nötig, weil vorhandene echte Prüfungsziele teilweise `examData`
besitzen, ohne bereits `nodeKind=exam` zu tragen. Ebenso darf ein gewöhnliches
Fachziel nicht durch Selbstdeklaration als Orientierung der Inhaltsprüfung
entgehen. Task-, Rubrik- und Karteneingaben erhalten eigene Bindungen.

Die Objekt-Hashes verwenden sortierte JSON-Schlüssel, UTF-8, kompakte
Trennzeichen und explizite Nullwerte der festen Bedeutungsfelder. Dateihashes
binden genaue Bytes. Ein Hash beweist Integrität, keine fachliche Qualität:
die unabhängige Gegenbeispielprüfung der normalen Bestehensrubrik bleibt nötig.

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

Vor einer Fertigmeldung sind die echten nativen Angebote und ihre
Erwerbs-/Inhaltsbindungen, Archiv-/Fehlerisolation, SRS-/Cacheinvalidierung,
Frontend-/Coach-/Planparität, Paketroundtrip und bestehende produktive Abläufe
am konkreten Kandidaten zu prüfen. Ein isoliert grüner Evaluatortest ersetzt
diese Integrationsnachweise nicht.
