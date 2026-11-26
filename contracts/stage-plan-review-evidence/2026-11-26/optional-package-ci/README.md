# Optionale Paket-CI im November 2026

Im schlanken MEM/FWU-RDF gingen beim Export der Brandenburger Mathematikansicht Sek II GK die Metadaten des Ansichtsformats 1.2 sowie die Anordnung der Kinder verloren. Der unmittelbare Vorgänger `9975a142f7` besteht den ursprünglichen Vergleich des rekonstruierten JSON. Der Commit `05eabe5a43` (#160) enthält die erste betroffene Fassung der Ansicht. Sie hat 161 lokale Teilordnungen und 157 Erwerbsmarkierungen. Die fünf [lokalen Rückvergleiche](rdf-first-failure.json) verwenden jeweils Test, Writer, Reader und Fachdateien aus demselben Commit.

Der Writer überträgt Schema, Versionsangabe, Sprache und Titel der Ansicht. Jeder Knoten trägt seine eigenen Angaben für Ordnung, Platzierung und kanonische Herkunft. Die Rekonstruktion erhält auch die leere Kindliste eines Abschnitts sowie den Unterschied zwischen einer ausdrücklich gesetzten und einer ausgelassenen Rolle. Der Originalvergleich prüft weiter das vollständige rekonstruierte Objekt. Ein kleiner zusätzlicher Vergleich deckt leere Abschnitte, eine konkrete Ordnungsbeziehung und beide Schreibweisen der Rolle ab.

## Befunde der Wochenläufe

| Datum | Job und Beobachtung |
|---|---|
| 30. Oktober | Alle drei Jobs bestehen. Laufzeiten 17:43 für OWL, 22:14 für den Fachexport und 45:21 für das eigenständige Paket. |
| 2. und 9. November | Nach Bestätigung des Auftakts im Kartenbeispiel weicht die Frontier des Paketkonsumenten von seiner Testerwartung ab. Der Wechsel tritt zwischen den direkten Nachbarn `1bc13679e1` und `404d58baa2` auf. |
| 16. November | Der Paketvergleich findet 1.070 statt der erwarteten 1.063 Einträge. Alle sieben zusätzlichen Dateien stammen aus `a44c157b53` (#157). Der Export übernimmt die Quellen von drei Aufgaben zu elementaren Darstellungen und vier Aufgaben zu Diagrammen. [Dateien, Aufgaben, Größen und Digests](seven-assessment-sources.json) |
| 23. November | Maven Central antwortet beim Laden der Gradle-Abhängigkeiten mit HTTP 429. Der Paketlauf endet vor dem Konsumententest. Die OWL-Prüfung scheitert unabhängig davon beim RDF-Vergleich. |

[Messwerte und öffentliche Protokolle aller fünf Läufe](weekly-jobs.tsv)

## Kartenbeispiel auf dem aktuellen Stand

Im technischen Beispiel sind der Auftakt `65365dce` und das Deckziel `4eefbd04` ausdrücklich ausgewählt. `404d58baa2` ließ den Rahmen nach dem bestätigten Auftakt als erledigt erscheinen. Die Frontier war leer und der nächste Schritt war die Rahmenwahl. Ein ausdrücklicher Start des Decks und ein Abruf einer Karte gelangen trotzdem.

Seit `9975a142f7` zählt ein ausdrücklich gewähltes Deck als eigener Erledigungsbedarf. Nach dem Auftakt enthält die aktuelle Frontier genau das Deck. Seine Aktivierung öffnet die Wahl des Kartenmodus. Von den 14 Karten sind nach der geltenden Freigaberegel zwei für den Test zugänglich. Bei beiden liegt das einzige Verständnisziel außerhalb der regulären Ziele der ausgewählten Ansicht. Der ausdrückliche Abruf liefert eine Karte. Der originale Test prüft die Frontier getrennt in der Abschlussantwort, im neu geladenen Zustand und beim Frontier-Endpunkt. [Vergleich der tatsächlichen Antworten](card-frontier.json)

Der aktuelle Paketvergleich prüft 1.121 Archiveinträge und 1.119 Manifestdateien, festgelegt in `2910cae99f`. Das vollständige Paket auf `116eaf997e` besteht diesen Vergleich. Die [unabhängige Prüfung der RDF-Reparatur](rdf-repair-review.json) dokumentiert die Abdeckung der vier Knotenformen des Ansichtsvertrags 1.2.

## Prüfung der Lern­einheiten im eigenständigen Paket

Der vollständige Releaseweg wählt in `scripts/run_curriculum_release_model_conformance.sh` das Mathematik-Paketprofil 1.3. Der CLI-Aufruf ohne Profil führt dort einen Selbsttest aus. Der frühere Planbefehl liest einen bereits kompilierten Baum. Die beiden CI-Workflows und die Betriebsanleitungen unter `docs/deploy` enthalten keinen aktuellen Neubau von 1.0 oder 1.1. Der FWU-Vergleich liest das gebundene JSON-Paket. Für die neun Fach- und Übersichtsbereiche mit älteren Ansichten gibt es kein vertrauenswürdiges eigenständiges Altprofil.

Vier Gegenproben rufen den Compiler mit der tatsächlichen heutigen Mathematikquelle auf. Die Profile 1.0 und 1.1 müssen bei der Quellansicht 1.2 jeweils vor und nach der Injektion einer Einheit wegen des verlustbehafteten Downgrades abbrechen. Beim Profil 1.1 verweist der Test im Speicher auf die noch vorhandenen Originalbytes der Veröffentlichungsevidenz im technischen Archiv vom 7. Oktober. Der Compiler prüft deren ursprünglichen SHA-256.

Der positive Vergleich verwendet das heutige Transportprofil 1.3. Es trägt die Lern­einheiten im Landschaftsformat 1.2. Der Test vergleicht die Paketdateien ohne Einheit und mit einer injizierten Einheit einschließlich zweier Platzierungen, ruft den unabhängigen Validator auf und prüft die Variante mit ausdrücklich gebundener Bewertungsevidenz.

Der hermetische Selbsttest braucht `/usr/bin/strace`, `/usr/bin/bwrap` und schreibgeschützte Systembibliotheken mit der erwarteten Eigentümer-ID. Im WSL-Host liegt strace außerhalb dieses Suchpfades. Der unveränderte Selbsttest lief deshalb in einer privaten, gegen die Ubuntu-Signatur geprüften Ubuntu-24.04.4-Umgebung mit den Distributionstools an ihren regulären Pfaden.
