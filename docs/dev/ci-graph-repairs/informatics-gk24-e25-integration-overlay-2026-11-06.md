# GK24 und E25: ausführbarer Overlay mit offener vollständiger Routenkontrolle

**Der konkrete Datenkandidat ist fachlich abgegrenzt und gemessen. Er ist nicht
angewandt und kein bestandener Gesamt-CQR.** Der
[geschützte Overlay-Vorschlag](informatics-gk24-e25-integration-overlay-2026-11-06.json)
enthält elf Daten-/Viewoperationen und drei kleine private Codeänderungen zur
Routenkonfiguration. Die [vollständigen nativen Ergebnisse](informatics-gk24-e25-integration-overlay-2026-11-06.native-evidence.json.gz)
bewahren auch beide verworfenen Vorvarianten und die offenen Länderbefunde.

Die Quelle ist jetzt `85411185…`: Root hat den getrennt geprüften
[6c4-Vorschlag tatsächlich angewandt](informatics-auth-logs-prerequisite-application-2026-11-06.md).
Dieser Overlay setzt genau diesen Stand voraus und führt die Operation nicht
nochmals aus. Die älteren E25-/GK24-Reviews behalten ihre ursprünglichen Quellpins.

## Der konkrete Kandidat

| Bestandteil | Änderung |
| --- | --- |
| Neuer GK-Übungscluster `b9d05b6a-be59-5b89-aa9b-fb00cb6f1b84` | Geschwister des alten E-Übungsclusters unter der kanonischen Wurzel; `requires=[]`; enthält nur GK24. |
| Neuer GK24-Endpunkt `604c84fc-7fa3-5aa0-a6c6-33136a71a4a7` | Eigener expliziter Abschluss, feste unveränderte 24er-Coverage und 24/24-Material; 16 einzeln begründete direkte Voraussetzungen. |
| Bestehender E25-Endpunkt `49ba66cf…` | Wahrheitsgemäße LK-Tags/-Bezeichnung; vollständiges positiv geprüftes 25/25-Material unter derselben Identität und exakt derselben Coverage. |
| Protokollziel `ace0c141…` | Eigene begründete Vorbereitungskorrektur: Orientierung statt vorangehendem vollständigem IP-/DNS-/Schichtenabschluss. |
| Drei GK-Views | Neuer GK-Cluster unmittelbar neben dem alten E-Übungscluster in BY, HE und der nationalen GK-Projektion. |
| Private CQR-Konfiguration | Neuer Container in der vorhandenen Discovery; vorhandener Länderabgleich und Kursabgleich werden für Informatik tatsächlich ausgewertet. Die leere-Endpunkt-Prüfung bleibt hart. |

Die neuen UUIDs bleiben unreservierte Vorschläge. Beide eingefügten
`examData`-Payloads bleiben **draft**. Der Overlay reserviert keine Identität,
erteilt keine Releasefreigabe und überträgt kein bestehendes Ergebnis.

Der alte E-Übungsparent bleibt einschließlich seiner Webaufgabe unverändert.
Seine drei Cluster-Voraussetzungen würden dem GK-Endpunkt unter anderem das
LK-Paketziel vererben. Deshalb ist der eigene Geschwistercluster erforderlich;
ein Kursfilter wäre keine Reparatur dieser globalen Voraussetzung.

## Vorbereitung und feste Leistungsumfänge

Die zunächst berechneten 15 Kanten waren strukturell minimal, benutzten aber
`ace → 653` als alleinigen GK-Träger des ganzen TCP/IP-Ziels. Der unabhängige
Gegenblick hielt diesen Weg fachlich: Eine vollständig eingeführte
Anwendungsprotokollszene erlaubt eigenständige Protokoll-/Schwachstellenanalyse,
ohne dass vorher schon IP, DNS und das gesamte Schichtenmodell abgeschlossen
sein müssen. Diese Analyse wird nicht als bereitgestellte Antwort gewertet.

Der endgültige Kandidat korrigiert deshalb **diese eine gewöhnliche Kante
gesondert** und verlangt `6539320a…` im GK direkt. Die Vorlage wird nicht durch
eine automatische Reduktion erzeugt. TCP/IP bleibt in GK und LK eine eigene
vollständige Prüfungsleistung; im LK bleibt zusätzlich der schon geprüfte
Paketweg `e3e5c851… → 6539320a…` bestehen.

Die globale Neuvererbung umfasst alle 21 tatsächlichen Kataloge. Von den
bestehenden 6.524 Goal-Knoten und 5.495 Atomen verändert ausschließlich das
Protokollziel selbst seine Nachfrage: Der vorherige ganze TCP/IP-Abschluss
entfällt. Alle bestehenden Prüfungen, einschließlich E25, behalten exakt ihre
gesamte Goal- und Atomic-Nachfrage. Es entstehen keine fremden Folgen oder Zyklen.

GK24 verlangt nach voller Vererbung/Expansion genau seine 24 festen Kompetenzen
plus Orientierung. Weder LK-K23 noch Hierarchie/Parallelität `875cb53c…`, ein
fremder Prüfungsabschluss oder ein Memory-Ergebnis wird hineingetragen.
Jede der 16 direkten Kanten wurde einzeln im Speicher entfernt und anschließend
vollständig neu vererbt: Ihr Ziel war danach nicht mehr erreichbar. Für alle
24 Kompetenzen enthält der Beleg den überlebenden Pfad mit authored Ursprüngen,
vollständigen Zieltexten und Eltern. G16 besteht; G17 bleibt unverändert bei 37.

Der [frische Kontextnachtrag](informatics-gk24-e25-current-context-addendum-2026-11-06.json)
prüft K03/G03 gegen den vollständigen Dialog, die tatsächliche eigene Analyse
und Risikoabwägung sowie die getrennte A02-Leistung. Er bindet die bestehenden
positiven Vollreviews und den separaten K18/G18-Nachtrag unverändert. Keine
alten Reviewhashes werden umetikettiert; neue Referenzläufe oder D/P-Abnahmen
werden hier nicht behauptet.

## Tatsächliche Scope- und QA-Ergebnisse

Alle **35** bestehenden Länder-/Kursprojektionen wurden mit den nativen
Rollen-, Filter-, Kompositions- und Renderfunktionen gegen die Kandidatenbytes
berechnet. Genau drei GK-Scopes ersetzen die alte E25-Anzeige durch den neuen
GK24-Endpunkt plus seinen sichtbaren Container. Die drei LK-Mengen bleiben
gleich und behalten E25. Die übrigen 29 Scope-Mitgliedschaften, alle gewöhnlichen
Ziele, Memorytargets und Supportmengen bleiben gleich. Die sechs konkreten
Angebote enthalten jeweils sämtliche 24 beziehungsweise 25 Coverage-Targets.

Die bestehende explizite `applicabilityFromRequires`-Regel ergibt für den neuen
Endpunkt genau BY/HE; der neue Cluster erhält dieselbe Menge durch Child-union.
Das ist keine neue amtliche Quellenabdeckung. Kein bestehender kompilierter
Applicability-Wert ändert sich. Eine vorhandene BY-Diagnose bekommt lediglich
die neue E25-LK-Anzeigebezeichnung; alle Befundzahlen bleiben gleich.

Die nativen A-/M-Ergebnisse bleiben vollständig gleich: 207 gewöhnliche Ziele,
28 Karten und 94 sichtbare Memoryzuordnungen. Die aktuelle gehärtete
Assessmentdiscovery erkennt alle 25 Definitionen und alle 25 erforderlichen
Prüfungen ohne Discoveryfehler. Sie lässt weiterhin keine ungesehenen alten
Abituraufgaben frei. Fünf weitere generische Prüfungsmaterialien scheitern an
der Struktur-/Bereitschaftskontrolle; die zwei konkreten E-Entwürfe scheitern
zusätzlich ausdrücklich an ihrem Draftstatus.

## Der echte offene Routenbedarf

Die ursprüngliche Informatik-CQR104 prüft 18 rohe Viewdateien ohne aufgelöste
Länder-/Kursfilter. Eine bloße Erweiterung ihrer Clusterliste fordert deshalb
GK24 fälschlich auch in 15 anderen Views. Diese Vorvariante ist verworfen.

Die private Variante mit dem bereits vorhandenen Länderabgleich und dem
Kursabgleich berechnet **48** Projektionen: 16 Landesviews sowie je 16
Länderauflösungen der beiden nationalen technischen Views. Sie scheitert
ehrlich an **42 leeren anwendbaren Endpunktmengen**. Dieselben 42 Lücken sind
bereits auf der Ausgangsquelle vorhanden; der neue E-Kandidat erzeugt sie nicht.
Alle 48 Einzelzeilen sind dauerhaft gesichert. Es gibt keine neuen fehlenden
oder unerwarteten Endpunkte innerhalb der sechs tatsächlich passenden Zeilen.

Diese 42 Zeilen bedeuten nicht 42 unabhängig neu zu schreibende Prüfungen.
Sie entsprechen den 14 anderen Ländern und ihren beiden Kursprofilen, die
außerdem in den nationalen Projektionen erneut auftreten. Der JSON-Beleg
listet für die **28 tatsächlichen Landes-/Kurskontexte** alle sichtbaren
gewöhnlichen Ziele, vorhandenen Endpunkte und Teilmengen der E24/E25-Leistung.
Diese konkreten Mengen begrenzen die nächste Material-/Routenarbeit:
bestehende Aufgaben dürfen nur bei passendem vollständigem Leistungs-,
Vorbereitungs- und Quellenvertrag wiederverwendet werden; andernfalls braucht
es passende eigenständige Aufgaben und Rubriken. Die sechs E-Angebote werden
nicht auf die übrigen 29 Scopes ausgedehnt.

Eine selektive E-Prüfung bleibt ein Zusatzbeleg. Sie ersetzt nicht das vollständige
Routegate; leere Endpunktmengen werden nicht als bestanden umgedeutet. Der
Overlay ist damit ein konkreter, überprüfbarer Teilfortschritt, **keine M6-Freigabe**.

## Privaten Overlay tatsächlich erzeugen

```bash
python docs/dev/ci-graph-repairs/prepare_informatics_gk24_e25_overlay.py \
  --output-root /dev/shm/skillpilot-gk24-e25-review-overlay
```

Der Zielordner muss neu sein und außerhalb des Repositorys liegen. Das Werkzeug
prüft sämtliche Quell-/Artefaktguards, erzeugt den Kandidaten nur im Speicher,
reproduziert beide globalen Relationen und alle 16 Irredundanzkontrollen und
schreibt anschließend genau fünf private Overlaydateien. Es gibt keinen
Apply-Modus. Die native Probe kann diese Dateien einzeln nur lesbar über den
bestehenden Repositorybaum legen; eine weitere große Repositorykopie ist unnötig.
Aktive Quelle, Views, QA, Code, Floors und Lernerdaten bleiben unverändert.
