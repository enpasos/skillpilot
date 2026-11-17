# Fachlich begründete Reihenfolgen in den Lernkarten

Stand: 16. November 2026. Die Integration und die tatsächlich ausgeführten
Prüfungen werden im [Managementbericht](stage-plan-management-summary.md)
festgehalten.

## Verhalten

Die Themen eines Jahrgangs oder einer Phase können parallel stehen. Eine
`after`-Beziehung bedeutet, dass die vorherige Einheit im vorgesehenen Lernfluss
abgeschlossen wird, bevor die folgende beginnt. Die Dateireihenfolge allein
begründet diese Beziehung nicht. In Hessen Q4 setzt beispielsweise die spezielle
Relativitätstheorie keinen Abschluss der benachbarten Einheiten Quantenphysik,
Kernphysik oder Elementarteilchen voraus.

Die Lernkarte zeigt weiterhin den tatsächlichen atomaren Bedarf. Die Prüfung
von Einheiten umfasst dessen Zusammenspiel mit der erklärten Reihenfolge:

- E2 prüft, ob die Einheiten unter sämtlichen Bedarfs- und `after`-Beziehungen
  zusammenhängend gelernt werden können. Ein Kreis erfordert eine fachliche
  Korrektur der Gruppierung oder der betroffenen Ziele.
- E3 verlangt die erklärte Reihenfolge für einen direkten atomaren Bedarf
  zwischen zwei Kindeinheiten ihrer kleinsten gemeinsamen Einheit. Ist eines
  der beiden Kinder ein eigenes Atom, ordnet dieser Bedarf selbst.
- E4 entfernt lediglich bereits aus anderen erklärten `after`-Beziehungen
  folgende Kanten. Die verbleibende Teilordnung erhält dieselbe Erreichbarkeit.

Verbindlich sind die
[Regeln E1 bis E4](../concept/skill-graph/learning-unit-progression.de.md).
Ein leerer Ordnungsgraph erklärt keine zusätzliche Reihenfolge. Auch dann muss
die tatsächliche Gruppierung die Regeln E2 und E3 für den atomaren Bedarf erfüllen.

## Sichtvertrag und Projektion

Das Quellformat `1.2` erlaubt auf einer `structure` den optionalen Eintrag
`childOrder.after`. Seine Paare `{unit, after}` referenzieren direkte
Strukturkinder. Die Prüfung weist unbekannte Endpunkte, Selbstbezüge, doppelte
Kanten, Kreise und transitive Redundanz zurück. Ein vorhandener leerer Eintrag
erklärt eine leere Teilordnung. Fehlt der Eintrag in einer älteren Sicht, bleibt
deren bisheriges Kompatibilitätsverhalten erhalten.

Beim Ausfiltern eines Zwischenkindes bleibt die erklärte Erreichbarkeit zwischen
den sichtbaren Kindern erhalten. GK und LK vereinigen ihre erklärten Ordnungen;
ein Widerspruch führt zu einem Fehler und muss in den Sichten behoben werden.
Ein verifiziert gebundener Stufenplan behält Vorrang vor dieser
Kompatibilitätsprojektion. Diese Arbeit aktiviert selbst keinen neuen Stufenplan.

Innerhalb einer ausdrücklich modellierten Sicht im Format `1.2` bleiben deren
Platzierungen auch bei der Baumnormalisierung erhalten. Ein kanonischer
Phasenhinweis darf etwa eine belegte Landeszuordnung nach Q1 nicht entfernen,
weil das kanonische Ziel Q2 nennt. Die bisherige Phasenfilterung ungebundener
älterer Bäume bleibt bestehen.

Die Modellierung ist im
[Quellschema](https://github.com/enpasos/skillpilot/blob/main/contracts/composition-view/v1.2/composition-view.schema.json)
geschlossen beschrieben. Die Runtime bewahrt die Formatversion auch bei der
GK/LK-Zusammenführung. Export und Paketprüfung müssen die Teilordnung vollständig
transportieren; ein älteres Format darf sie nicht stillschweigend verlieren.

## Lernplätze notwendiger Grundlagen

Ein atomarer `goalEntry` mit `projectionRole: prerequisiteOnly` kann im neuen
Format ausdrücklich `acquisitionPlacement: true` tragen. Sein Platz unter
Jahrgang, Phase und Thema bleibt als internes Darstellungsmuster erhalten.
Materialisiert wird er nur für ein sonst unplatziertes Ziel, das bereits zur
vom Backend bestimmten vollständigen Lernbasis gehört.

Ein sichtbarer Zielplatz bleibt bestehen. Bei mehreren ausdrücklichen Mustern
hat das eigene Fach Vorrang vor einem Platz in einem anderen Fach; die Tiefe
verschiedener Fachgliederungen begründet keine fachliche Priorität. Die zeitliche
Eignung muss zusätzlich an der gemeinsamen Lernkarte geprüft werden. Beim
Wiederherstellen eines zuvor leeren Astes bleibt dessen ursprüngliche
Geschwisterposition erhalten, ohne dadurch neue `after`-Kanten zu erzeugen.

Unmarkierte Voraussetzungen und allgemeine Support-Teilbäume erhalten durch
ihre Position keine Erwerbsautorität. Die Kennzeichnung erzeugt weder neue
Zielseeds noch Voraussetzungen oder Lernergebnisse. Quellenzugehörigkeit und
tatsächlicher Lernplatz bleiben getrennte Angaben.

## Landesgliederungen und Nachweise

Die Mathematiksichten werden über die
[Normalisierung](mathematics-stage-view-normalization-2026-11-16.md), die
Dauergeneratoren und die Sek-I-Auszüge erzeugt. Die Physiksichten verwenden den
Hessen-Generator und den
[Ländergenerator](https://github.com/enpasos/skillpilot/blob/main/scripts/generate_laender_physics_stage_views.py) mit
[Quellennachweisen](https://github.com/enpasos/skillpilot/blob/main/scripts/generate_laender_physics_stage_views.sources.json).
Zeitlich offene amtliche Vorgaben bleiben offen; Doppeljahrgänge werden als
solche wiedergegeben.

Zwölf neue Mathematikauszüge für die Sekundarstufe I ersetzen den bisherigen
kanonischen Fallback. Die Sichtprüfung verlangt deshalb ihre konkreten
Landes-Scopes und Identitäten. Die bisherigen Fallback-Ausnahmen für diese
Länder entfallen; fehlt einer der neuen Auszüge, schlägt die Prüfung fehl.
Hessen, Rheinland-Pfalz und Schleswig-Holstein behalten lediglich für alte
Anfragen ohne Dauermodell ihren ausdrücklich dokumentierten Fallback.

Die Messung verwendet die tatsächlich ausgewählten Backend-Sichten und die
Backend-Lernbasis. Deren atomare Hülle wird unabhängig mit der Frontend-Hülle
verglichen. Anschließend werden die Produktprojektion, die Fachfilter und die
verschachtelten Einheiten geprüft. Änderungen von Ziel- oder Lernmengen in neu
eingeführten Sek-I-Auszügen sind gesondert auszuweisen. Eine reine Schemavalidierung
oder ein erfolgreicher Generatorlauf belegt noch keine fehlerfreie Lernkarte.

Die Abgabenotizen unter `tmp/pipeline/laender-stufen/` enthalten die gebundenen
lokalen Rohmessungen, die Vorher-Nachher-Vergleiche, Quellenzuordnungen und
verbleibenden Befunde. Automatisierte Vertragsprüfungen, unabhängige fachliche
Reviews und Lernenden-Prüfungsaufgaben werden getrennt ausgewiesen.
