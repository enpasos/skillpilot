# Freiwilliges Angebot im Ansichtsformat 1.3

Ein Bundesland kann ein Lernziel, eine Aufgabe oder beides an einem eigenen Platz als freiwilliges Angebot ausweisen. Jede konkrete Ansicht führt ihre regulären Ziele, die Vorbereitungen und die freiwilligen Angebote getrennt. Ein reguläres Ziel, dessen erforderlicher Lernweg über ein freiwilliges Angebot führt, ist in dieser Ansicht widersprüchlich. Die Prüfung berücksichtigt auch Voraussetzungen, die ein Ziel von einem übergeordneten kanonischen Knoten erbt.

| Begriff | Bedeutung im Vertrag | Herkunft |
|---|---|---|
| Reguläres Ziel · `target` | Das Atom gehört in dieser Ansicht zu den regulär zu lernenden Zielen. Eine fehlende Rollenangabe behält diese Bedeutung. | Bisheriger Ansichtsvertrag |
| Vorbereitung · `prerequisiteOnly` | Eine echte Voraussetzung kann einen eigenen Erwerbsplatz haben. Die Auswahl einer freiwilligen Aufgabe kann weitere Vorbereitung erforderlich machen. | Bisheriger Ansichtsvertrag und Entscheidung vom 26.11. |
| Freiwilliges Angebot · `voluntary` | Ein ausdrücklich platzierter atomarer `goalEntry`. Sein Abschnitt darf ausschließlich freiwillige Angebote enthalten. | Entscheidung vom 26.11., Format 1.3 |
| Erwerbsplatz · `acquisitionPlacement` | Markiert eine ausdrücklich platzierte Vorbereitung. | Ansichtsformat 1.2 |
| Anrechnung | Ergibt sich aus einer tatsächlich erbrachten Leistung und ihrer geprüften Bewertung. Die Sichtrolle selbst vergibt keine Anrechnung. | Bestehende Anrechnungsregeln |

## Vertragsgrenzen

Quellansichten 1.3 binden ihr eigenes JSON-Schema. Das eigenständige Paket 1.4 kann diese Ansichten transportieren. Die Rolle nach Zusammenführung und die Rolle im jeweiligen Ursprung lassen sich getrennt abfragen. Eine Pflicht in einem der zusammengeführten Teile hat Vorrang. Vorbereitungen und Aufgaben in den bestehenden Ansichten behalten ihren bisherigen Status. Der aktivierte Katalog verwendet die neue Rolle in diesem Paket noch in keiner Ansicht.

Der Ländergenerator baut seinen regulären Umfang aus den vorgesehenen Quellen auf. Beim erneuten Schreiben fügt er die freiwilligen Plätze **dieser Ansicht** unter ihren bisherigen Eltern wieder ein. Eine abgeleitete Ansicht erhält ihre eigenen ausgewiesenen Angebote. Ein vermisster Elternplatz oder ein Konflikt mit einer neu erforderlichen Leistung bricht die Neuerzeugung ab.

## Prüfwege

- Der [Messlauf über alle Ansichten](measure-composition-role-parity.ts) vergleicht Rollen, Zielidentitäten, Vorschau und Befunde mit dem damaligen Compiler. Die 387 Ansichten umfassen 90 Physik- und 100 Mathematikansichten. Der Vergleich lädt die kanonischen Graphen aller 21 Wurzeln.
- Der [TypeScript-Vertragstest](../../../../app/scripts/testCompositionVoluntaryRoles.ts) enthält gültige und fehlerhafte Fälle einschließlich indirekter Voraussetzungen, einer Aufgabe über mehrere Leistungen und eines Abschnitts, der nur freiwillige Angebote enthält.
- Der [Python-Grenztest](../../../../scripts/test_composition_view_package_boundary.py) prüft die Auswahl des Paketschemas, die unabhängige Rekonstruktion, die Semantik des installierbaren Pakets sowie die Erhaltung der freiwilligen Lernorte bei erneuter Autorenerzeugung.
- Der [Java-Paketleser-Test](../../../../backend/src/test/java/com/skillpilot/backend/curriculumpackage/PackageCompositionViewStateTest.java) prüft sowohl die effektiven Mengen als auch ihre Herkunft in Kurs- und Länderzusammenführungen.

Die persönliche Wahl im Chat, die Fortschrittsdarstellung und die fachliche Freigabe eines freiwilligen Landesangebots haben eigene Abnahmefälle in VR2 bis VR6.

Die [Messung zum Implementierungsstand](development-checks.json) bindet die Einzelprotokolle außerhalb des Repositorys. In den 387 bestehenden Ansichten stimmen die regulären Zielmengen, Vorschauen und Compilerbefunde mit dem Ausgangsstand überein. Der Vergleich umfasst 162.743 reguläre Zielvorkommen. Der Pakettest liest eine künstliche Ansicht mit drei Rollen aus einem lokal installierten eigenständigen Paket. Bei den zwei gezielt veränderten Archiven stimmt das Dateiinventar jeweils, die unabhängige semantische Prüfung weist beide zurück.

Zwei Nachfolger halten die technische Eingangsbindung der W1-Prüfungen aktuell. Der [CQR-104-Nachfolger](cqr104-route-reader.successor.json) vergleicht die bisherigen 51 Messwerte mit dem aktuellen Statusleser. Die [Bindung der beiden Ansichtsleser](assessment-offer-readers.successor.json) sichert die 115 Eingänge des ursprünglichen Prüfprotokolls und die 117 Eingänge der aktuellen Kompilierung. Der [Test der Aufgabenangebote](verify-assessment-offer-readers.mts) ermittelt KB in 61 und KG in 18 Ansichten und prüft dieselben zehn Gegenbeispiele an den Aufgaben. Die fachlichen Freigaben und die beiden einzelnen Warnungsentscheidungen bleiben an ihre ursprünglichen Protokolle gebunden.

Der [RDF-Rückvergleich nach der Paketreparatur](rdf-integration.json) verwendet auf beiden Seiten dieselben 387 W1-Ansichten. In beiden Varianten der Ressourcenbezeichner stimmen alle 774 serialisierten Ausgaben mit dem reparierten Exporter überein. Für alle 190 Ansichten im Format 1.2 ist das zurückgewonnene JSON vollständig mit der Quelle identisch. Eine Testansicht im Format 1.3 transportiert auch freiwillige Angebote. Falsche Rollen, Versionsangaben und Erwerbsplätze werden an den geprüften Schreib- und Lesegrenzen abgewiesen.

Der [Prüfbeleg zu den Testdaten](fixture-recheck.json) bindet drei korrigierte Mathematik-Testinstanzen und den typisierten Fachexport-Test. Die 40 Mathematiktests bestehen. Beim Export erhalten alle 24 absichtlich ungültigen Testansichten vor und nach der Typisierung dasselbe JSON. Die 1.036 aktiven Mathematiknachweise für fachfremde Vorbereitungen decken dieselben 4.346 Voraussetzungskanten ab.
