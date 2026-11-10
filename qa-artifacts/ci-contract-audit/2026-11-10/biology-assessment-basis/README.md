# Biologie: technische Vorbereitung der G17-Lieferung

Stand: 11. November 2026. **Keine Biologie-Abnahme.** Der vorbereitete
kanonische Datenstand ist jetzt lokal integriert. Die bisherigen
[lokalen Ergebnisse](local-acceptance.json) belegen die folgenden begrenzten
Änderungen im sichtbaren Integrationsbranch
`fix/g17-biology-assessment-basis`.

- Zehn mechanisch aus den bisherigen Voraussetzungen gebildete
  Geltungsbereichsbindungen erhalten im tatsächlichen Compilervergleich alle
  6.524 Zielzeilen der 21 Kataloge. Ohne diese Bindungen ändern sich elf Zeilen;
  eine absichtlich falsch abgeflachte Neuro-Bindung wird ebenfalls erkannt.
  Die zwei unveränderten Prüfungsziele bleiben ohne neue Bindung.
- Der öffentliche Proof-Lader akzeptiert die neue Darstellung nur über einen
  vollständig geprüften V7-Ausgangsstand und eine flache Folge deklarierter
  Änderungen. Alle bisherigen Prüfungen pro Kantenentfernung bleiben erhalten.
  Die 21 gezielten Laderfälle bestehen; sie ersetzen nicht die volle Prüfung
  des tatsächlichen Biologie-Bestands.
- Python-Brücke und Dual-Round-Verbraucher erkennen ausschließlich die exakt
  geprüfte neue Darstellung. Drei gezielte Python-Fälle einschließlich eines
  echten Node-Aufrufs und der reguläre Dual-Round-Testbefehl bestehen. Keine
  Review-Fingerprints oder fachlichen Bewertungen wurden neu gebunden.
- Der echte bayerische Biologie-Lernumfang enthält auch seine notwendigen
  Hessen-Atome in Lernzielausgabe und vollständiger Planung. Die Quellenzuordnung
  bleibt unverändert. Ein nachträglicher Verlust allein in der Zielliste oder
  allein bei den sichtbaren Definitionen scheitert jetzt auch bei vollständiger
  Mastery und engem Fokus. Der vorherige Fehler wurde tatsächlich reproduziert.
  Der gemeinsame Lauf besteht 80 Backendtests ohne Fehler oder Skips.
  Dieser Lauf verwendete den historischen globalen Vergleichsstand mit noch
  unveränderten Biologiedaten; er ist keine Abnahme des aktuellen V8-Katalogs.

Der aktuelle Biologiestand verändert ausschließlich 89 `requires`-Arrays und
zehn explizite, aus den bisherigen Literalreferenzen gebildete
Geltungsbereichsbindungen. Der vollständige V7-Chemie-Ausgangsbeleg bleibt
bytegleich erhalten. Die 1.933 Operationen und 79 Fortsetzungen wurden nicht
neu erzeugt. Der tatsächliche Biologie-Minimalitätsaufruf besteht mit 485
Knoten einschließlich Vorfahren, 884 Anforderungen und null Befunden.
Die öffentliche Bestandsprüfung und die nativen V8-Gegenproben sind davon
getrennte Abnahmeschritte. Der native Leser unterscheidet jetzt den aktuellen
vollständigen Katalog von rekonstruierten historischen Vergleichsständen.
Die zwei [gezielten aktuellen V8-Tests](current-candidate-acceptance.json)
bestehen ohne Fehler oder Skips: ungültige Rohbelege werden abgewiesen und
der tatsächliche BY-Lernumfang samt beiden Ausgabe-Verlustkontrollen besteht.
Alle 809 vorab festgehaltenen Eingaben blieben während dieses Laufs gleich.
Der öffentliche Bestandslader besteht ebenfalls: 487,563 Sekunden, Exit 0,
vollständige V7-/V8-Prüfung und 484 tatsächlich ausgegebene Biologie-Bindungen
bei unveränderten Eingaben. Dieser Laderlauf liegt vor der folgenden
APV-102-Compilerkorrektur; er wird nicht als Prüfung dieser späteren Änderung
ausgegeben. Die Biologie bleibt ausdrücklich nicht abgenommen.

Das unabhängige Emissionsgate steht zusätzlich in der bestehenden nativen
Scopeprüfung: separat ermittelte Startziele und der unbeschnittene kanonische
Graph bestimmen die erwartete Menge; tatsächliche Targets, Definitionen und
Completion-Eingaben müssen dazu passen. Die vollständige aktuelle
Einzelfachprüfung über 21 Kataloge, 20 Fächer und 17 Länderoptionen besteht:
**761 vollständig konfigurierte Angebote** wurden positiv geprüft. Zusätzlich
wurden 172 nicht angebotene, 467 unvollständige und zwölf ungültige
Konfigurationen getrennt behandelt; sie sind keine positiven Scope-Pässe.
Der Lauf dauerte 347,544 Sekunden und hatte keine Fehler oder Skips. Er ist
keine Vollprüfung aller Kombinationen mehrerer Fächer.

Die bisherigen **593 APV-102-Befunde** beruhten auf der Gleichsetzung von
Quellenland und Lernumfang. Diese Prüfung wird durch das tatsächliche harte
Emissionsgate ersetzt. Ein neuer Compiler-Gegenfall reproduziert zuerst zwei
solche falschen Länderfehler; nach der begrenzten Korrektur bleiben die
Länderwerte und Quellenbelege exakt gleich. Fehlende kanonische Referenzen
bleiben Fehler; die reguläre Quellen-/Anwendbarkeitssuite besteht 23 Fälle.
Der verpflichtende native Test prüft APV-102 gegen wirkliche
Lernziele, sichtbare Definitionen und Abschlussmengen. Die genaue
[Regel-zu-Gate-Zuordnung](../../../../docs/qa-ci/graph-validation-rules.md)
trennt diesen Backendnachweis von `validate:view-filters` und CQR.
Der abschließende Bio-BY-Test besteht nach Kennzeichnung des Gates: Beide
beschädigten Ausgaben lösen direkt den `APV-102`-Assertionsfehler aus und
scheitern zusätzlich in der Runtime-Frontierprüfung. Die große Scopeprüfung
wurde für diese reine Kennzeichnung nicht wiederholt.
Regulärer Meilensteinlauf, geschützte Floors, vollständige Remote-CI und
Main-Lieferung bleiben abzunehmen. Das harte G17-Gate in der
Standard-Meilensteinprüfung bleibt ebenfalls offen.
