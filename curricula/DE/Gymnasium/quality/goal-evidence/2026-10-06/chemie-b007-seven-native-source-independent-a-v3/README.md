# Chemie B007: unabhängige Quellen-/Native-Prüfung A zu Autor v3

**Gesamtentscheidung: REVISE.** Die sieben begrenzten HE-Quellenzuordnungen sind
KEEP. Ein zusätzlicher geerbter Voraussetzungskontext ist vor Integration offen.
Diese Prüfung schließt kein natives D/P/A/M/V-Gate und keine nationale
Quellenpflicht. Neue fachliche M7-Abschlüsse: **0**; wiederhergestellte aktive
Bindungen: **0**; strenger Nettozuwachs: **0**.

## Geprüfte Eingänge und Wiederverwendung

Autor v3 ist unverändert eingefroren unter
`../chemie-b007-seven-native-source-preparation-author-v3/`, Freeze-SHA256
`eacf8f185662b53414e77e3e7fa23aab9091e21b24fd335d026768ad6ed84f3a`.
Die tatsächlichen sieben UUIDs, bilinguale Zieltexte, vierzehn vollständigen
v2-Fälle, zwei v2-Karten und deren Herkunftsbindungen wurden gezielt verglichen.
Die gültigen früheren A-/B-v2-Fachbefunde werden innerhalb der exakt gleichen
Texte, Materialkörper und Karten weiterverwendet. Neue Peer-B-Befunde dieses
Quellen-/Native-Pakets wurden nicht gelesen. Der Prüfer hat Autor v3 nicht
verfasst und hat keine aktive Datei verändert.

Die Original-PDF-Seiten wurden eigenständig mit `pdftotext -layout` extrahiert
und gelesen; die vier tatsächlichen Seitenauszüge stehen unter `sources/`.

- HE physisch 8 / gedruckt 7: fakultative Inhalte sind auswählbare Ergänzungen;
  Beispiele in Klammern sind unverbindlich.
- HE physisch 12 / gedruckt 11: explizit Jahrgang 8, Sek I, 8.1. Kennzeichnung,
  Entsorgung, Schutzmaßnahmen sowie Lösen, Massen- und Volumenanteil stehen im
  verbindlichen Bereich. Geprüft wird jeweils der benannte Teilaspekt.
- HE physisch 13 / gedruckt 12: Temperaturabhängigkeit, Sättigung und
  Löslichkeitsgraphen stehen im fakultativen Bereich desselben 8.1-Kontexts.
  Der quantitative Restkapazitätsfall bleibt eine ausgewiesene didaktische
  Operationalisierung dieses Teilaspekts.
- NI physisch / gedruckt 51: Jahrgänge 5/6, qualitative typische
  Stoffeigenschaft Löslichkeit. Keine verpflichtende quantitative Sättigung
  wird daraus abgeleitet.

403 ursprüngliche Quellenpflichten und 413 bisherige Mapping-Zeilen werden
nicht global geschlossen. Der neue fakultative HE-Quellenkomponent ist ehrlich
als Kandidat außerhalb der bestehenden offiziellen Extraktion bezeichnet.

## Echter neuer Befund

`10ce2814-8796-5633-9bed-f6990d039b91` verlangt weiterhin den jetzt verbreiterten
Lösungscluster `53fd1bfd-facb-54ae-b2dc-f667ed1414fc`. Die vier direkten
Requires-Vorschläge entfernen diese geerbte Bindung nicht. Betroffen sind:

- `5338b54c-68bc-5892-907c-e025351ffde6` – Lösungsvorgänge im Teilchenmodell;
- `5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf` – Diffusion/Brownsche Bewegung;
- `78109f6d-c415-52c4-8314-07c0dd888a80` – Ebenenwechsel;
- `988888bb-1f88-55f9-9a44-f3f60469a297` – Aggregatzustände im Teilchenmodell.

Die letzten drei sind zusätzliche geerbte Kontexte außerhalb der bisher sechs
aufgelisteten Seiten-/Zielkontexte. Ihre ganzen Zielobjekte und sichtbaren
Seitenkörper sind gleich; die Bedeutung des referenzierten Voraussetzungsknotens
ist durch Atomic→Cluster mit vier neuen Teilroutinen verändert. Identische
Requires-IDs beweisen daher keine unveränderte Voraussetzung.

Der native Kompatibilitätspfad `prepareLandscapeEntries` wurde für **alle 112**
geschützten Ziele und ihre enthaltenen Eltern überprüft. Im Backend werden
nicht projizierte geerbte Altanforderungen bei aktiver CompositionView ignoriert;
deshalb wird kein universaler produktiver Frontierfehler behauptet. Wird der
Cluster tatsächlich anwendbar ausgewertet, zählt die fakultative Sättigung wegen
ihres GK-Tags trotz `core:false` zum Voraussetzungsmindestwert. Das ist eine
gezielte Code-/Quellenprüfung ohne private Lernendendaten oder Backend-Ausführung.

Eine minimale **nicht angewandte** Änderung wäre, ausschließlich diesen
verbreiterten Lösungscluster aus `10ce…requires` zu entfernen und die enge
Aggregatzustandsgrundlage sowie die vorhandenen direkten Voraussetzungen der
vier Kinder zu erhalten. Die tatsächliche Quellen-/Didaktik- und native
Kontextwirkung muss in einer neuen Autorversion geprüft werden. Historisches v3
und alle früheren Bewertungen bleiben unverändert.

## Tatsächlich ausgeführte begrenzte Checks

- Bestehende Canon- und CompositionView-Validatoren: Kandidat ohne fatale
  Canonfehler; prospektive HE-Ansicht ohne fatale Fehler, acht Ziele einschließlich
  vorhandenem Memory-Begleiter.
- Beide eingefrorenen reinen nativen BookModels mit 382 atomaren Seiten wurden
  durch den vorhandenen Builder vollständig in Arbeitsspeicher reproduziert und
  exakt verglichen. Kein Build, PDF-Render oder Schreibzugriff auf Autorartefakte.
- Alle 112 geschützten ganzen Ziele: Base 112 exakt, Variante 108 exakt und vier
  direkte Requires-Änderungen. Sechs sichtbare Seitenkontexte ändern sich;
  zusätzliche drei geerbte semantische Kontexte sind gesondert erfasst.
- Bestehender Quellenansicht-Compiler: 48 Eingänge, 40 betroffene Ansichten,
  weiterhin 72 CPV-009-Holds durch Atomic-GoalEntries auf jetzt strukturelle
  Cluster. Diese Ansichten wurden nicht repariert oder global freigegeben.
- SHA256-/Material-/Karten- und frühere Review-Freeze-Bindungen: separat exakt
  geprüft. Gleichheit ersetzt nicht die vorstehende echte Quellen-/Kontextprüfung.

Details und einzelne Entscheidungen stehen in
`independent-a.source-native.review.json`, reproduzierbare aktuelle native
Kontexte in `actual-native-all112-and-seven-source-candidate-independent-a.json`.
Die eigene abschließende Freeze-Datei listet vollständige Eingänge und Dateien.

## Verbleibende Grenzen

Native D-Seitenprüfung zweier unabhängiger Runden, aktuelle P-Profile mit
ehrlichem E1/G1-Kandidatenstatus, aktuelle A-/M-Prüfungen, Kartenaktivierung und
Sichtbarkeit, fehlende sechs Bildbindungen samt V-Freigaben sowie nationale
Quellen-/Projektionsintegration bleiben offen. Endgültige GUI-Superset-/Layer-A-
Abschlusschecks werden erst an einem stabilen Integrationsstand durchgeführt.
Keine menschliche Prüfung, Freigabe, Erprobung oder Veröffentlichung ist durch
diese maschinelle Kandidatenprüfung belegt.

Nächster Schritt: neue isolierte Autorversion für den konkreten geerbten
Kontextbefund, dann unabhängiger gezielter Delta-Follow-up.
