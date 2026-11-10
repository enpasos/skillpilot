# Transitive Minimalität und Einlieferung nach main

Stand: 10. November 2026. Grundlage ist die kritische Prüfung mit Astra Ultra
und die anschließende ausdrückliche Scopeentscheidung des Product Owners.
Dieser Plan ersetzt den Arbeitsauftrag des breiten CI-Audits im alten Goal.
Das alte breite Goal ist gelöscht. Auf ausdrücklichen Ownerauftrag ist ein
neues Goal mit der unten präzisierten Main-Abnahme eingerichtet.

**Verbindliche Fachreihenfolge (Product Owner, 9. November 2026):**
**Physik → Chemie → Biologie → übrige geschützte Fächer.** Nach Physik wird
zuerst Chemie und danach Biologie nach demselben deterministischen G17-Vertrag
bearbeitet. Für die übrigen Fächer legt diese Entscheidung noch keine interne
Reihenfolge fest. Der vollständige Prüf- und Abnahmeumfang bleibt unverändert.

**Aktueller CI-Reparaturstand vom 10. November 2026:** Die getrennte
Codekorrektur PR #110 auf Main `39f4c21ea9` hat ihre frische Main-CI mit
allen acht Hauptjobs und vier Begleitworkflows bestanden. Im Chemie-Datenlauf
`42850827581` scheiterte der Kompositionsvalidator an 277 Strukturfehlern in
den zwei neuen HE-GK+LK-Views. Die begrenzte Korrektur entfernt doppelte
Referenzen und leere Wrapper mit der vorhandenen geprüften Mergeroption.
Vier tatsächlich betroffene native Scopes bleiben vollständig gleich; der
normale Validator besteht über 354 Views und 21 Kataloge mit null Fehlern.
Der unveränderte Watch besteht nach der geprüften Bestätigung genau zweier
Integritätsbelege. Eine frische vollständige Reparatur-CI bleibt offen.
Der sichtbare IDE-Branch ist wieder
`fix/g17-chemistry-atomic-prerequisites-v7-data`. Biologie bleibt im gepushten
Checkpoint `60f58c1b00` gesichert; die Scopeentscheidung ist weiterhin offen.
Die folgenden Lieferpositionen bewahren die früheren Prüfstände als Historie.

**Aktuelle Lieferposition vom 10. November 2026, Chemie:** Physik ist mit
[PR #105](https://github.com/enpasos/skillpilot/pull/105) auf Main bei
`c2f0722545f51e53526651e0d7ee26a9e0fb64ae`. Der Mergetree entspricht dem
vollständig geprüften PR-Head. Die getrennte frische Main-Push-CI ist vollständig
bestanden: alle acht Hauptjobs und sechs Begleitworkflows. Der ungefilterte
Backendcheck besteht mit 2.710 Tests und 19 bestehenden Skips, darunter alle
fünf nativen und 95 fachübergreifenden Methoden; normaler CQR-Producer,
zehn unveränderte Floors und Report-Sauberkeit bestehen ebenfalls.

Der sichtbare IDE-Branch ist
`fix/g17-chemistry-atomic-prerequisites-v7-data`, aufgebaut auf diesem Main
und der getrennten Lookupkorrektur aus
[PR #110](https://github.com/enpasos/skillpilot/pull/110). Diese behebt den
belegten Widerspruch zwischen Scopeauswahl und ID-Lookup einer expliziten View
mit bestehender `merged:`-Identität. Der neue Gegenfall scheitert am alten Code;
die gesamte normale Testklasse besteht am korrigierten Code mit 67 Tests.
PR #110 enthält ausschließlich Service und Regression. Nach acht bestandenen
Hauptjobs und drei Begleitworkflows ist er auf Main bei
`39f4c21ea92956521337d70cdfd7f96b0d33620f`. Der tatsächliche ungefilterte
Backendcheck besteht mit 2.711 Tests und 19 unveränderten Skips, darunter
alle 67 Lookup-, fünf nativen und 95 fachübergreifenden Methoden.
Der getrennte [Daten-PR #111](https://github.com/enpasos/skillpilot/pull/111)
ist mit Checkpoint `6bff7dcb34` gepusht. Er richtet sich bereits an Main,
damit der nächste Push die regulären Pflichtworkflows auslöst. Die noch offene
Lookupabhängigkeit ist mit PR #110 getrennt geliefert; Main ist in den
sichtbaren Datenbranch übernommen. Sein Produktbaum bleibt dabei identisch.

Die Chemie-Reduktion ist angewendet: 578 bereits wirksame atomare Anforderungen
werden materialisiert, anschließend 57 gedeckte nichtatomare und 673 redundante
atomare Kanten entfernt. Nach jeder Entfernung werden Vererbung und Zeugen neu
berechnet. Alle 6.194 atomaren Erreichbarkeitspaare bleiben erhalten; der harte
Chemie-Auditor einschließlich seines vererbenden Vorfahren findet null Befunde.
Alle 742 Ziele behalten sämtliche Felder außer `requires`. Die echte öffentliche
Python-/Node-Prüfung besteht in einem einzelnen Aufruf in 380,821 Sekunden;
die historischen Applicability-Snapshots und die beiden früheren Batches bleiben
erhalten.

Acht Referenzkorrekturen beheben zuvor als Atome behandelte vorhandene
Prüfungscluster. Die bereits verfassten acht Kinder werden dadurch in 22 Scopes
sichtbar; dies ist eine ausdrücklich ausgewiesene Projektionskorrektur.
Anschließende explizite Supportbindungen und zwei HE-GK+LK-Views erhalten
gegen diesen korrigierten Ausgangsstand in allen 182 Konfigurationen Ziele,
Atome, Bäume, Wurzeln und View-IDs. 29.865 tatsächliche Rollenpaare sowie der
volle kontextuelle atomare Bedarf bleiben gleich; dieselben 43 Konfigurationen
bleiben unvollständig. Es werden keine Rollen oder Mastery automatisch erfunden.
Diese Vorabprüfung ersetzt keine Frontier- oder Completion-Abnahme.

Die vollständige TS-Kette besteht auf den angewendeten Dateien mit allen
3.652 Eingaben unverändert und den tatsächlichen aktuellen V6-/V7-Livemarkern.
Auch der normale vollständige native Klassenlauf besteht: sechs Methoden ohne
Fehler oder Skips, 6.487 Quellbindungen unverändert, tatsächliche Java-/Test-
Kompilierung und Corretto-25.0.2-Worker mit unveränderter 3g/cache1/fork1-Policy.
Der normale CQR-Producer besteht nach 1.100,558 Sekunden
über alle 21 Kataloge. Der anschließende unveränderte Floorbefehl scheitert
an Chemie M1 statt M7: CQR-003 zählt neun unbelegte atomare Zuordnungen in
sieben Jurisdiktionen. Astra hat die technische Ursache belegt: Zwei reduzierte
Direktkanten entfernen nur die alte unmittelbare `required by`-Evidenzspur,
die beiden bereits reviewten Vorbereitungspfade bleiben vollständig erhalten.
Der kleine gemeinsame Quellenprüfer-Fix ist nach Astras Review angewendet:
15 Regressionen bestehen, der Altcode scheitert in vier echten Fällen. Alle
308 akzeptierten Beziehungen bleiben ohne Regression; die neun Chemiefälle
werden über ihre erhaltenen tatsächlichen Atompfade anerkannt. Typecheck und
normaler Quellenaudit bestehen auf dem angewendeten Stand. Quellenentscheidungen
und Floors bleiben unverändert. Der neue reguläre Producer über alle 21 Kataloge
besteht nach 946,318 Sekunden; danach bestehen alle zehn unveränderten Floors.
Chemie erreicht lokal wieder M7. Unter 9.905 gebundenen Eingaben ändern sich nur
die beiden CQR-Berichte und deren bestehender Alias. Alle notwendigen lokalen
Chemieprüfungen sind bestanden. Frische Remote-CI und Chemie-Main-Lieferung
bleiben offen; der PR wird zur abschließenden Review gestellt.
Im ersten Lauf ändern sich unter den 9.903 benannten Eingaben ausschließlich deklarierte
Berichte. Die eng begrenzte Chemie-Watch-Aktualisierung besteht
mit echtem Rot-/Grün-Gegenfall und unverändertem Prüfer. Der
[Chemie-Liefernachweis](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-10/g17-chemistry-atomic-prerequisites/README.md)
trennt diese Belege von den noch offenen lokalen und Remote-Abnahmen.
Das harte Standard-G17-Gate und die endgültige Main-Abnahme aller zehn Fächer
bleiben offen. Nach Chemie folgt Biologie.

**Vorbereitung der Standardintegration am 10. November:** Die sieben
Nettoänderungen sind gegen `af744ea278` neu vorbereitet und mit Astra geprüft;
neun Adapterfixtures, die vollständigen aktuellen Core-Vergleiche und alle
13 CLI-Tests bestehen. Der tatsächliche FULL-Auditorlauf über sämtliche
21 unveränderten aktuellen Kanondokumente benötigt 1,474 Sekunden. Dies ist
ein direkter Diagnoseaufruf, keine aktivierte Standard-Meilensteinprüfung.
Mathematik, Physik, Deutsch und der lokale Chemiekandidat sind im vorgesehenen
Graphvertrag befundfrei. Noch notwendige mechanische Reparaturen sind:

| Geschütztes Fach | Redundante Ursprungskanten | Nichtatomare `requires` |
| --- | ---: | ---: |
| Biologie | 166 | 54 |
| Geschichte | 13 | 45 |
| Informatik | 94 | 74 |
| Latein | 0 | 43 |
| Politik und Wirtschaft | 126 | 18 |
| Wirtschaftswissenschaften | 92 | 2 |

Die Spalten beschreiben unterschiedliche Befunde und sind keine Schätzung der
späteren Schnittzahl nach Normalisierung. Lateins früherer Minimalitätsnullbefund
belegt somit noch keine atomare Normalform. Die vier ungültigen Rootscopes
außerhalb des geschützten Fachbestands bleiben ungültig, einschließlich des Overview-Roots,
der den griechischen Zyklus mit umfasst. Kein experimentelles Fach wird promoviert.
Nach den erforderlichen Fachkorrekturen werden diese sieben Nettoänderungen auf
den dann aktuellen Main-Stand portiert und als eigene Standardintegration
geliefert: echter 21er-Producer, zehn unveränderte Floors und frische CI müssen
am tatsächlichen Integrationsstand bestehen. Alte vollständige Kandidatendateien
dürfen keine neueren V7-, Rollen-, Stage- oder Quellenprüfer-Korrekturen ersetzen.

**Historischer Physik-Prüfstand vor der Main-Lieferung:** Die Physik-Lieferung ist in
[PR #105](https://github.com/enpasos/skillpilot/pull/105) zusammengeführt;
der IDE-Branch heißt `fix/g17-physics-applicability-inheritance`.
Der Graph hat im aktuellen harten Physik-Aufruf keine Minimalitätsbefunde.
Vollständige TS-Prüfung, nativer Projektionsvergleich und der neue reguläre
Meilensteinlauf sind bestanden. Der unveränderte Producer über 21 Kataloge
benötigte 1058,045 Sekunden; anschließend bestanden alle zehn geschützten
Untergrenzen. Physik erreicht wieder M7. Ausschließlich die beiden erzeugten
CQR-Berichte und deren bestehender Alias änderten sich; 9896 Eingabebindungen
zeigen keine unerwarteten Änderungen. Die korrigierte Routenprüfung bleibt
mit echten Gegenfällen über 35 Views und 80 Scopes im bestehenden CI-Test.

Die fünf nativen Methoden bestehen im tatsächlichen ungefilterten Backendlauf
auf `3abc5c6552`; der korrigierte CrossSubject-Strahlungsfall besteht ebenfalls.
Der ältere vollständige lokale Lauf
scheiterte nach seiner Vergleichsmatrix an fehlender Target-Exposition
von `3631c8f7-ff48-57ff-b7ee-8397ff1d166a`. Dieser Knoten war bereits vorher
ausdrücklich `compatibilityOnly` und von der Projektion ausgeschlossen; in
allen 140 vollständigen Konfigurationen fehlt er unverändert auch als Support
und im Kontext. Die korrigierte Schlussabdeckung unterscheidet tatsächliche
rollenvalide und gesperrte Fälle sowie explizit ausgeschlossene Knoten; alle
Scope-/Probe- und Frontierfälle bleiben erhalten. Die native Gegenprobe über
372 tatsächlich gesperrte Paare besteht vor/nach; 139 kanonische Atomproben,
34 echte Frontier-Aufrufe und zehn fehlerhafte Coverage-Datensätze bestehen
in der gezielten Helfervalidierung. Der alte Gesamtlauf bleibt als fehlgeschlagen
dokumentiert. Der gesamte Backendjob dieses Heads scheiterte dennoch: Ein
Controller-Test enthielt zwölf veraltete Scope-Summen; anschließend verursachten
zwei Heapfehler 130 Spring-Kontextfehler einschließlich ihrer Folgefehler.
Der tatsächliche native Vergleich aller zwölf betroffenen Konfigurationen
belegt genau 13 bereits verfasste Targets der vorhandenen Cachekorrektur,
gleiche Views und keine entfernten Targets. Sechs Erwartungszeilen sind
korrigiert; dieselbe vollständige Testmatrix bindet die 13 Ziel-IDs nun für
G8 und G9 ausdrücklich. Der Testworker endet nach jeder Klasse; Heaplimit
3 GB, Spring-Cachelimit und sämtliche Testfälle bleiben erhalten. Ein frischer
Gegencheck des zuerst betroffenen Kontexts bestand bereits unter der alten
Speicherpolicy. Der normale gemeinsame Reparaturlauf besteht anschließend
alle 131 betroffenen Fälle in drei tatsächlichen Workern ohne Fehler oder
Skips; alle 4193 benannten Eingaben bleiben stabil. Eine konkrete
Produktions-Leakkette wird daraus nicht behauptet.
Die vollständige Curriculum-CI auf `3abc5c6552` einschließlich normalem Producer,
zehn unveränderten Floors und Report-Sauberkeit ist ebenfalls bestanden.
Frische vollständige CI auf dem Reparaturhead sowie die Main-Lieferung stehen
aus; das harte Standard-G17-Gate ist noch nicht aktiv.

Die Frontend-CI deckte außerdem veraltete Direktkanten-Assertions im
Physik-Buchinput-Test auf. Die Korrektur prüft den vollständigen tatsächlichen
Vorbereitungsbedarf und erhält die unabhängigen exakten Coverage-, Material-
und Reviewbindungen. Kein Prüfungsziel oder Fingerprint wurde umgeschrieben.
Der normale Test auf dem finalen Dateistand besteht in 405,578 Sekunden;
entfernte Vorbereitungspfade und ungelöste Referenzen scheitern weiterhin.
Ein gezielter Abgleich der weiteren Pflicht-CI-Verbraucher ergab genau einen
weiteren veralteten Direktkanten-Pin im nativen CrossSubject-Test. Dessen
Strahlungsziel behält alle vier ursprünglichen Anforderungen in seiner exakt
geprüften vollständigen atomaren Vorbereitungshülle; die drei verbleibenden
direkten Kanten werden getrennt geprüft. Eine isolierte Entfernung des echten
Ersatzwegs muss den Bedarfsvergleich verwerfen. Der normale gezielte Gradle-Lauf
mit tatsächlichen Curriculumdaten besteht in 260,972 Sekunden; alle 3883
gebundenen Eingaben bleiben unverändert. Die anderen 94 Methoden dieser
Testklasse sind bytegleich. Astra hat den kleinen Testpatch freigegeben;
die vollständige neue Remote-CI wird dadurch nicht vorweggenommen.
Der technische 600-Sekunden-Rahmen aus
[PR #106](https://github.com/enpasos/skillpilot/pull/106) ist bei
`de2d5c33cb33d71d0a671e1c03d44b139595a527` auf main; sein Mergetree ist exakt
gleich dem vollständig geprüften Headtree. Der eigene frische
[Main-Lauf](https://github.com/enpasos/skillpilot/actions/runs/42705727514)
hat ebenfalls alle acht Hauptjobs bestanden. Das harte Standard-G17-Gate und
die endgültige Abnahme aller zehn geschützten Fächer bleiben offen.

Die folgenden Lieferpositionen bewahren die früheren Prüfstände als Historie.

Die Mathematiklieferung mit PR #97 bei
`e94def51f625630da6c3f7fe8e54badefd8eb687` hat inzwischen auch ihre separate
Main-Push-CI mit allen sechs Workflows und acht Hauptjobs bestanden. Die
Projektionsdokumentation aus PR #98 ist bei
`16e55248767ac0e6736c9cbbcee34882f7b62d8e` auf main; ihre drei PR-Jobs sowie
frische Main-Dokumentationsprüfung und Dokumentationsveröffentlichung bestanden.
Die weiterhin bestehende Cluster-Atomisierung bleibt eine ausgewiesene
Implementierungslücke.

Die HE-GK-View-Korrektur ist mit [PR #100](https://github.com/enpasos/skillpilot/pull/100)
nach main bei `88a01f716c62968ef3d445959146d062dd2437bf` geliefert. Ihre
26 expliziten `prerequisiteOnly`-Referenzen erhalten
die Zielmengen und die vollständigen Laufzeitergebnisse. 99 Scopebilanzen,
356 strikte View-Fälle und 751 R-Gegenprobenfälle bestanden; die 45 bereits
ungültigen Source-/Scope-Paare bleiben ausdrücklich Negativkontrollen. Auch
der reguläre lokale CQR-Check, die zehn geschützten Floors und die
Composition-Prüfungen bestanden bei 4.573 unveränderten Produktquellpfaden.
Der erste begrenzte Deutsch-Schritt aus
[PR #99](https://github.com/enpasos/skillpilot/pull/99) bei
`7a2c4de5888e98fe415a5e1373747ac3917a8f47` bestand auch seine getrennte frische
Main-CI mit allen sechs Workflows und acht Hauptjobs.

Der sichtbare IDE-Branch `fix/g17-german-atomic-prerequisites` baut auf dieser
gelieferten [Code-Unterstützung](prerequisite-reduction-batches-v6-support-2026-11-09.md)
auf. Der Datencheckpoint `15593c82e92b62cc76601e340932800fdce8063c` ändert
18 bestehende deutsche `requires`-Arrays: 45 Anforderungen an Cluster werden
durch 272 bereits wirksame atomare Anforderungen ersetzt; eine vorhandene
atomare Anforderung bleibt erhalten. Danach werden 311 atomare Kanten geordnet
entfernt, jeweils mit neu aufgelöster Vererbung und aktualisierten Zeugen.
Die Zahl roher deutscher `requires`-Kanten sinkt von 606 auf 522, die
Minimalitätsbefunde von 91 auf null. Andere Zielfelder, `contains`, IDs,
Lerninhalte und Lernresultate ändern sich nicht.

Die V6-Registry erhält den unveränderten V5-Präfix mit 720 Quellen und ergänzt
17 neue eindeutige Quellen; insgesamt sind es 737. Die echte Python-/Node-
Kandidatenprüfung bestand in 166,576 Sekunden unter dem unveränderten
180-Sekunden-Limit. Vier frische native Backendtests mit Corretto 25 bestanden,
darunter 99 Konfigurationen mit 44 vollständigen und 55 unvollständigen
Scopefällen sowie 110 negativen Planungsmethoden-Aufrufen mit Status 409.
Diese sind keine Netzwerk-HTTP-Tests. 122.945 gebundene Quellpfade blieben
unverändert. Der reguläre CQR-Lauf und alle zehn unveränderten Fachfloors
bestanden; die beiden erzeugten Statusberichte und ihr historischer
Symlink-Alias sind als erwartete Schreibwirkungen einzeln ausgewiesen.

Die vollständige TypeScript-Testkette gegen die jetzt aktive V6-Registry läuft
noch. Die eigene Daten-PR- und Main-CI-Abnahme stehen aus. Der
[Deutsch-Nachweis](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-09/g17-german-atomic-prerequisites/README.md)
grenzt diese lokalen Ergebnisse von der noch offenen Standard-G17-Integration
ab. Im vollständigen Referenzkatalog haben Mathematik und Latein auf main
keine Minimalitätsbefunde; Deutsch erreicht diesen Stand bisher nur lokal.
Die übrigen sieben geschützten Fächer haben zusammen 1.214 Befunde. Ein
Minimalitätsnullbefund allein belegt weder die vollständige atomare Normalform
noch einen bestandenen Standard-G17-Meilensteinpass. Die vier ungültigen
experimentellen Referenzgraphen bleiben als solche ausgewiesen.

Die ursprünglichen lokalen Nachweise aus dem ersten Deutsch-Schritt und ihre
Quellbindungen bleiben erhalten. Der
[Integrationsbeleg](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-09/g17-german-main98-integration/receipt.json)
behauptet keinen neuen Gesamttest. Die folgenden Einzelberichte bewahren die
Lieferhistorie und deren damalige Prüfstände.

Die erste Lieferung ist mit [PR #86](https://github.com/enpasos/skillpilot/pull/86)
nach main übernommen: Commit
[`ab0aa4ea9f`](https://github.com/enpasos/skillpilot/commit/ab0aa4ea9f861c8a6bd6e6600268548a516ef666).
Sie entstand auf `fix/g17-checker` von `0ce5a8d791e` und bestand die frischen
Pflichtworkflows einschließlich G17-Regressionen und unveränderter Fachfloors.
Die notwendige technische Transitivitätskorrektur ist mit
[PR #87](https://github.com/enpasos/skillpilot/pull/87) und Main-Commit
[`d63e1b408d`](https://github.com/enpasos/skillpilot/commit/d63e1b408dd18ce744ad47682f06398bc0f01be0)
geliefert. Alle fünf frischen Pflichtworkflows einschließlich sämtlicher acht
Hauptjobs waren erfolgreich. Der begrenzte Frischeanschluss und die erste
Mathematikreduktion sind mit [PR #88](https://github.com/enpasos/skillpilot/pull/88)
auf main bei
[`2c2fc3bc0d`](https://github.com/enpasos/skillpilot/commit/2c2fc3bc0dd9e964261ebe3c7badab3b247f09d5)
geliefert. Auch dessen geprüfter PR-Head bestand alle fünf Pflichtworkflows
und sämtliche acht Hauptjobs. Die bestätigte einheitliche Rollenpflicht ist mit
[PR #89](https://github.com/enpasos/skillpilot/pull/89) auf main bei
[`3ee1acc373`](https://github.com/enpasos/skillpilot/commit/3ee1acc373f8d56e565783e122c971abbac61122)
geliefert; alle fünf frischen PR-Workflows und acht Hauptjobs bestanden.
Der erste Biologie-Batch ist mit
[PR #90](https://github.com/enpasos/skillpilot/pull/90) auf main bei
[`3b71ee9370`](https://github.com/enpasos/skillpilot/commit/3b71ee9370805f98b37f0e7e9b3352b9ac26f845)
geliefert; sein geprüfter PR-Head bestand fünf Pflichtworkflows und acht
Hauptjobs. Die korrigierte atomare Norm und vollständige Regelzuordnung sind mit
[PR #91](https://github.com/enpasos/skillpilot/pull/91) auf main bei
[`02cc64e622`](https://github.com/enpasos/skillpilot/commit/02cc64e622bedd0275f1f551235c1d2248dbe77f)
geliefert; alle drei Jobs des frischen
[Main-Dokumentationslaufs](https://github.com/enpasos/skillpilot/actions/runs/42455488379)
bestanden. Die erste atomar abgedeckte Clusterentfernung ist mit
[PR #92](https://github.com/enpasos/skillpilot/pull/92) auf main bei
[`8874cb9c56`](https://github.com/enpasos/skillpilot/commit/8874cb9c56d7726d48b237dce4eaeabfc5420ce4)
geliefert. Der geprüfte PR-Head `9f32bfb15d` bestand alle fünf Pflichtworkflows
und alle acht Haupt-CI-Jobs; der Merge hat exakt denselben Dateibaum.
Der frische Main-Lauf von PR #92 bestand anschließend ebenfalls die fünf
Repository-Workflows einschließlich aller acht Haupt-CI-Jobs.

Die notwendige QA-Leserreparatur ist mit
[PR #93](https://github.com/enpasos/skillpilot/pull/93) auf main bei
[`8edadbf9aa`](https://github.com/enpasos/skillpilot/commit/8edadbf9aad3497a9738066e7a95f27ef98ee599)
geliefert: drei Node-Dateien, unveränderte Curriculumdaten und bestehender
V2-Nachweisvertrag. Der geprüfte PR-Head ist `35f01974cd`; der tatsächliche
Main-Dateibaum ist bytegleich. Die isolierten lokalen Regressionen, die tatsächliche
Physikprüfung und der reguläre Meilensteinlauf gegen unveränderte Main-Daten
bestanden; alle zehn Fachfloors bleiben erhalten. Astra fand im Quellenreview
keinen Blocker. Die volle agentische Copilot-Prüfung brach beim Setup mit
HTTP 504 ab; das vorhandene Lite-Review mit drei Hinweisen wurde getrennt
geprüft und im PR mit begründeter Einordnung erledigt. Die Snapshotguards
bleiben strikt. Alle drei frischen Repository-Workflows und sämtliche acht
Haupt-CI-Jobs des PR bestanden. Der folgende Main-Lauf scheiterte im
Cockpit-Prototyptest; dessen isoliert nachgewiesene Fixture-Korrektur ist Teil
der nachfolgenden Lieferung.

Der mechanische 16er-Folgebatch ist mit
[PR #94](https://github.com/enpasos/skillpilot/pull/94) auf main bei
[`1d21d87580`](https://github.com/enpasos/skillpilot/commit/1d21d875806d75869448b72228a97ff9d2dfe269)
geliefert. Der endgültige PR-Head `5bdc2f5096` bestand alle sechs ausgelösten
Workflows und alle acht Haupt-CI-Jobs; der tatsächliche Main-Dateibaum ist exakt
gleich. Auch die separate frische Main-Push-CI bestand alle sieben ausgelösten
Workflows und alle acht Haupt-CI-Jobs. Der Datencommit bleibt `cebfd0cd4c`. Der zusätzlich ausgelöste
Chemie-Evidence-Watch erkannte ausschließlich die sechs geprüften Chemie-
Anforderungslöschungen. Die [begrenzte Wartungsnotiz](canonical-gymnasium-chemistry-evidence-watch-review-2026-11-08.md)
belegt deren Herkunft, die vollständige frühere Beobachtungsbaseline und die
unveränderten 159 übrigen Records. Nur der geprüfte Beobachtungsrecord wird
fortgeschrieben; Checker, Hashverfahren und sämtliche 21 historischen
Graph-Nachweisbaselines bleiben unverändert. Die notwendigen CI-Reparaturen
betreffen einen fehlenden Dokumentationsindexeintrag, das bestehende
Präferenzereignis der Cockpit-Fixture und die Trennung vollständiger
Clusterverfügbarkeit von optionaler Anzeigeverdichtung im Chemietest. Die native
Gegenprobe bestätigt dort dieselben 15 verfügbaren Atome in derselben Reihenfolge;
die ursprünglichen Verfügbarkeitsprüfungen bleiben erhalten. Es wurde keine
produktive Frontier-, Mastery- oder Inhaltsregel geändert.
PR84 bleibt als Herkunft des alten Auditstands getrennt erhalten.
Der alte WIP und lokale Änderungen sind gesichert; unversionierte Altartefakte
bleiben erhalten.

Die getrennte Supportlieferung auf `fix/g17-atomic-materialization-proof` ist
mit [PR #95](https://github.com/enpasos/skillpilot/pull/95) auf main bei
[`0adcd834d5`](https://github.com/enpasos/skillpilot/commit/0adcd834d5dee6df3c67f5d6e5b387e9713fa447)
geliefert. Ihr geprüfter Head `b7de2aa37c` bestand alle vier ausgelösten
PR-Workflows und acht Hauptjobs; der tatsächliche Main-Dateibaum ist exakt gleich.
Auch die separate frische Main-Push-CI bestand alle fünf ausgelösten Workflows
und sämtliche acht Hauptjobs. Copilot konnte das vollständige
Review wegen Modell-/Tarifbeschränkungen nicht abschließen und erteilte keine
automatisierte Freigabe; sein Kommentar enthält keinen konkreten Codebefund.
Das abgeschlossene Astra-Ultra-Quellenreview und die tatsächlichen Negativfälle
bleiben getrennte Prüfbelege. Die Supportlieferung bleibt auf
`app/scripts/prerequisiteReductionProof.ts`, dessen Regressionen und diesen Plan
begrenzt. Sie ergänzt einen getypten, geordneten V3-Nachlauf: Ein Atompaar darf
nur materialisiert werden, wenn es durch eine vorhandene rohe Anforderung und
tatsächliche `contains`-Pfade bereits unmittelbar induziert ist. Danach darf die
bestehende V2-Prüfung eine Cluster→Atom-Anforderung entfernen, sobald sämtliche
atomaren Nachfahren durch überlebende rohe Atompfade abgedeckt sind. Die umgekehrte
Reihenfolge oder unvollständige Abdeckung scheitert hart.

Die 21 historischen Basisdigests, 204 bisherigen Entfernungen und 200
ursprünglichen Arrays bleiben unverändert. Der V2-Präfix samt seinen Zeugen wird
vor dem Nachlauf vollständig geprüft; Ergänzungen dürfen ihn nicht nachträglich
reparieren. Exakter Dokument-Replay, tatsächliche Applicability-Gleichheit und
die bisherigen Endgraphzeugen bleiben Pflicht. Die Supportlieferung selbst
belässt die Live-Registry bei V2 und aktiviert noch kein Standard-Meilensteingate.

Die unmittelbar davon abhängige Mathematiklieferung liegt auf
`fix/g17-math-atomic-prerequisites`. Deren lokal vollständig
geprüfter Daten-/Consumerstand ist als `92b0e2236d` committet und gepusht.
Der gelieferte Main-Stand von #95 wurde anschließend bei unverändertem
Mathematik-Dateibaum aufgenommen. Der eigene Mathematik-PR folgt damit auf die
tatsächliche Main-Lieferung seines Prüfvertrags. Die laufende Remote-CI wurde
für diese gekoppelte Vorbereitung genutzt; ein weiterer unabhängiger
Änderungsumfang wurde nicht begonnen.

Der endliche Mathematikbatch überträgt die Anforderung der beiden GK-/LK-
Abiturcluster an das vorhandene Orientierungsziel auf ihre 13 beziehungsweise
14 atomaren Nachfahren: 27 Ergänzungen, anschließend zwei Clusterlöschungen.
`contains` und die 204 historischen Entfernungen mit ihren 200 Originalarrays
bleiben unverändert. Die Vorbereitung an einer Kopie des vollständigen Katalogs
bestand den tatsächlichen Applicability-Vergleich aller 6.524 Ziele und den
unveränderten vollständigen V3-Loader. Dessen Vergleichsfähigkeit rekonstruiert
alle 229 betroffenen Quellen und sämtliche 21 ursprünglichen Dokumentdigests.
Die bisherigen 269 Zeugenpfade mit 953 Kantenpositionen bleiben erhalten.

Zur Datenlieferung gehören die notwendigen Anpassungen der vorhandenen
Vergleichsprüfungen: Python akzeptiert den bekannten V3-Vertrag ausschließlich
über den bestehenden Node-Prüfer; der native Vergleich rekonstruiert sowohl
historische als auch neue Quellen und prüft vollständige Dokumentdigests.
Fehlendes `requires` und `requires: []` bleiben unterscheidbar. Die bisherigen
historischen Bestandsprüfungen bleiben erhalten; neue Quellen werden zusätzlich
geprüft. Der unveränderte reguläre Meilensteinproducer besteht am tatsächlichen
Aktivierungsstand mit fünf M7- und fünf M6-Fächern einschließlich aller zehn
geschützten Untergrenzen. Seine Reportänderungen betreffen ausschließlich den
Zeitstempel und die V3-Nachweismetadaten; sämtliche Regelwerte bleiben gleich.
Die native lokale Gegenprüfung bestand drei Tests mit 1.240 realen
Konfigurationen und 370.306 Kontext-/Rollenvergleichen. Alle 229 Quellen sind
abgedeckt: 227 über tatsächliche Scopes, die zwei bisherigen nicht exponierten
PoWi-Quellen weiterhin separat über dieselben nativen APIs. Die 6.480 neuen
Math-Frontiervergleiche enthalten 1.080 positive Kontrollen tatsächlich
angebotener atomarer Ziele; historische Kontrollen bleiben erhalten.
Die unveränderte Projektionsklasse bestand zusätzlich alle 58 Tests ohne
Fehler oder Skips. Auditor-/Nachweissuite, Python-Brücke, Schema- und
Dokumentationsprüfungen bestanden ebenfalls. Die Lieferung liegt in
[PR #96](https://github.com/enpasos/skillpilot/pull/96). Sein erster Remote-Lauf
wies im Pflichtschritt `check:math-duration-composition-views` einen veralteten
aktiven Raw-Inputpin des bestehenden Dauerlayoutplans zurück.
Die [begrenzte Wartungsnotiz](canonical-math-duration-input-binding-review-2026-11-08.md)
belegt den ausdrücklichen Anschluss `07749dae… → e28dea9e…` nach der bestehenden
Pflegeanweisung: ausschließlich das eine Inputfeld ändert sich; alle 18 Views,
83 Platzierungen, sieben Adjudikationen und fünf Quellen-Scope-Bindungen bleiben
erhalten. Historische Reviews und die vier Vergleichsfamilien ändern sich nicht.
Der zusätzlich tatsächlich veraltete Rationale-Coverage-Bericht wird regulär
erneuert; nur Zeitstempel und die zwei rohen beziehungsweise offenen
Relationszähler ändern sich von 2.459 auf 2.484. Der Gap-Issue-Check besteht mit
unveränderten Dateien. Auch der separate reguläre CQR-Frischecheck einschließlich
aller zehn geschützten Untergrenzen besteht; der CQR-Status wurde nicht neu
generiert.

Ein zweiter Remote-Befund betrifft den historischen Fingerprint-Kontrollwert im
Physik-Buchtest: Er wurde unmittelbar aus dem inzwischen materialisierten
Mathematikziel berechnet. Der Test nutzt dafür nun den bereits verifizierten
ursprünglichen Snapshot und behält seinen historischen Erwartungswert bei.
Er prüft zusätzlich das ausschließliche `requires`-Delta und weist einen
fehlenden Nachweiskontext, falschen Fachbezug sowie unbescheinigte Änderungen
zurück. Gemeinsame Fingerprintfunktion und Reviewbindungen bleiben unverändert.
Der nächste Remote-Lauf bestand sieben von acht Hauptjobs und alle vier
Begleitworkflows. Im letzten Paket-Konformitätsschritt wurde die alte
Weitergabebindung des normalisierten Mathematikmodells zurückgewiesen.
Die [gesonderte technische Wartungsnotiz](canonical-math-package-redistribution-input-binding-review-2026-11-08.md)
belegt den ausschließlich aus `requires` bestehenden Rohdelta und den regulären
Generatorkandidaten: Im vollständigen Reviewobjekt ändert sich nur
`contentDigest` von `fb51e95c…` auf den tatsächlich berechneten Modell-Digest
`eec1b300…`. Der Shell-Pin wird vom älteren `e8ad1ec7…` an denselben Digest
angeschlossen. Alle 836 Assetrecords, vier Klassenrecords, 839 offenen
Prüfungen, null menschlichen Freigaben und `publicationReady: false` bleiben
unverändert. Der vollständige lokale CI-Konformitätslauf bestand mit allen
36 Eingaben unverändert, unabhängiger Modellvalidierung, den bisherigen
Review-/Source-Gegenprüfungen und zwei bytegleichen Modellbuilds. Die Reparatur
ist als `b973e78728` in #96 committet und gepusht. Alle fünf frischen
PR-Workflows und acht Hauptjobs bestanden. #96 ist bei `776be6e48a` nach main
geliefert; sein tatsächlicher Main-Baum ist exakt der geprüfte Baum
`7fc7fd65e9`. Auch alle sechs frischen Push-Workflows auf dem tatsächlichen
Main-Commit und sämtliche acht Hauptjobs bestanden. Main-Referenz und
Dateibaum wurden anschließend erneut gegen genau diesen Stand geprüft.

Die vollständige atomare Mathematikreduktion ist inzwischen getrennt als
`5a24a03f1e` auf `fix/g17-math-transitive-reduction` committet und gepusht.
Ihre lokalen Nachweis-, Auditor-, Python-, Schema-, nativen 1.240-Konfigurations-,
58er-Projektions- und regulären Meilensteinprüfungen bestanden. Der sichtbare
Merge `55fa7011c5` nahm zunächst den bekannten Paketanschluss aus #96 auf.
Der Anschluss an den reduzierten Stand ist als `79231af659` committet und
gepusht. Der anschließende sichtbare Merge `18289e8aea` nimmt die tatsächliche
Main-Lieferung `776be6e48a` auf; der geprüfte Mathematik-Arbeitsbaum
`9f64cbef8e` bleibt dabei exakt unverändert. Die isolierte tatsächliche
V4-Kompilation ermittelt für den reduzierten Stand den Modell-Digest
`5d3cf9c7…`; der unveränderte Generator ändert wieder ausschließlich
`contentDigest`. Ledger und Shell-Pin werden mit je einer Digestzeile
angeschlossen, alle 836 Asset- und vier Klassenrecords bleiben unverändert.
Der vollständige lokale CI-Konformitätslauf an diesem Stand bestand mit
38 unveränderten Eingaben, unabhängiger Modellvalidierung, sämtlichen
bisherigen Gegenprüfungen und zwei bytegleichen Modellbuilds. Die
Main-Voraussetzung für den getrennten Mathematik-Folge-PR ist damit erfüllt;
seine eigene Remote-Abnahme steht noch aus.
Das harte Standard-Meilensteingate und der Gesamtauftrag bleiben offen.

Dieser Mathematikstand liegt in [PR #97](https://github.com/enpasos/skillpilot/pull/97).
Ein konkreter Copilot-Befund wies dort auf den zusätzlich veralteten NPM-
Standalone-Plancheck hin. Der unveränderte Originalaufruf scheiterte tatsächlich
mit `Expected entry count 1060, got 1061.`. Die anschließende Planmessung mit
allen bestehenden Prüfern ergab 1.061 Einträge, 1.059 Manifestdateien, 836
Binärassets und denselben Modell-Digest `5d3cf9c7…`. Ausschließlich die drei
veralteten Erwartungsliterale wurden korrigiert; danach bestand der originale
NPM-Aufruf. Die [begrenzte Wartungsnotiz](canonical-math-standalone-plan-pin-review-2026-11-09.md)
bindet diese drei tatsächlichen Ausführungen. Daten, Prüfer, Modell, sämtliche
Reviewrecords und alle 32 CQR-Eingaben bleiben unverändert. Die Korrektur erhält
ihre eigene frische PR-CI; ein ZIP oder eine Publikationsfreigabe wird nicht
behauptet.

Der vollständige anschließende CI-Lauf belegte drei weitere Verbraucher, die
noch eine Einzelkante statt der erhaltenen atomaren Voraussetzungspfade
erwarteten. GVR-015 prüft bereits die streng stufenbezogene atomare
Erreichbarkeit; seine zusätzliche Direktkantenforderung wird entfernt. Der
nur im Orientierungs-Outlook verwendete Backendfilter erhält eine
zyklensichere Suche nach einem nichtleeren Pfad aus direkt verfassten atomaren
`requires`-Kanten. Die drei zuvor erwarteten Orientierungswege und die
gesonderte Startfreigabe bleiben erhalten. Beim Q4-Buchtest werden die sechs
expliziten Prüfungsziele und die fünf verbliebenen direkten Voraussetzungen
getrennt festgeschrieben; der aktuelle Division→Multiplikation-Zeuge erhält
den entfernten direkten Bedarf. Aufgaben, Prüfungsabdeckung und
Curriculumdaten werden nicht geändert.

Die [begrenzte Reparaturnotiz](canonical-math-transitive-prerequisite-consumer-repair-2026-11-09.md)
bindet die tatsächlichen Gegenfälle und die einzelnen lokalen Ergebnisse.
Graphvalidator, vollständige Hard-Route-Prüfung und vollständige Buchtestkette
einschließlich beider angehängter Strukturtests bestehen. Auch alle 13 neuen
Laufzeitfälle und die drei bisherigen Integrationsfälle bestanden ohne
Fehler oder Skips. Die 133 gebundenen Laufzeiteingaben sowie alle 124
geschützten Eingaben bleiben bytegleich. Eine erfolgreiche Remote-Abnahme
von #97 wird erst nach der frischen CI des korrigierten Heads behauptet.

Der vollständige Remote-Lauf von `bcc7803424` bestätigte sieben der acht
Hauptjobs einschließlich Backend und Frontend sowie alle vier
Begleitworkflows. Nur die nachgelagerte Q2.5-Scope-Prüfung scheiterte an einem
rohen Semantic-Kind-Fingerprintvergleich. Der Originalpin `49ed1468…` bleibt
erhalten; die betroffenen Fingerprintvergleiche nutzen ausschließlich für
diese bestehende Vergleichsfamilie den vorhandenen verifizierten Kontext.
In fünf bereits aufgerufenen Testreadern werden Coverage und direkte
Voraussetzungbasis getrennt festgeschrieben. Die
[begrenzte Readernotiz](canonical-math-assessment-reader-bindings-review-2026-11-09.md)
bindet die unveränderten Ledger- und Datenbytes, zwölf ausschließlich durch
`requires` veränderte Goalzeilen sowie die tatsächlich überlebenden Zeugen.

Alle vier tatsächlich in CI aufgerufenen Programme bestehen lokal. Der ganze
Rollen-Caller legte zuvor zwei weitere Direktkantenannahmen in seiner eigenen
Testdatei offen; beide fehlgeschlagenen Läufe und ihre Eingabeframes bleiben
unverändert erhalten. Scoped ESLint aller fünf finalen Reader besteht. Die
125 geschützten Daten-, Review-, Core- und Vieweingaben bleiben bytegleich;
es erfolgt keine Fingerprint-Neubindung oder neue Inhaltsfreigabe. Der
Reader-Folgecommit benötigt seine eigene frische Remote-CI, bevor #97 nach
main übernommen wird. Der Gesamtauftrag einschließlich des harten
Standard-G17-Gates bleibt offen.

Der unmittelbar folgende deutsche Einzelfall ist vollständig lokal geprüft als
`e7b317b222` auf `fix/g17-german-first-cluster-prerequisite` committet und
gepusht erhalten. [Notiz und gebundene Nachweise](https://github.com/enpasos/skillpilot/blob/e7b317b222a3b0b204a2f92dfc4ae25ddab28443/docs/dev/german-first-cluster-prerequisite-normalization-review-2026-11-09.md)
bleiben am überprüften Commit zugänglich. Genau eine Clusterreferenz wird
durch zehn bereits induzierte atomare Anforderungen ersetzt; die übrigen 45
deutschen Atom→Cluster-Kanten gehören nicht zu diesem Stand. Sein Main-Weg ist
der gekoppelte nächste G17-PR nach der Main-Lieferung von #97, Aufnahme der
notwendigen Elternkorrektur und eigener frischer Remote-Abnahme. Bis dahin
erfolgt keine weitere deutsche Datenbearbeitung. Das harte Standard-G17-Gate
und der Gesamtauftrag bleiben offen.

Der sichtbare Deutsch-Branch nimmt jetzt den geprüften Elternfix
`bcc7803424` auf, während dessen frische PR-CI läuft. Die sieben Dateien des
deutschen Prüfvertrags und der Datenänderung werden gegen `e7b317b222`
byteweise abgeglichen. Die lokalen Gesamtbelege dieses Commits behalten ihre
ursprünglichen Quellbindungen; sie werden nicht still auf die geänderte
Backenddatei umgebunden. Der kombinierte Stand `89696c10e5` bestand den
Graphvalidator für 593 Landschaften, die vollständige Buchtestkette sowie alle
16 gezielten Backendfälle ohne Fehler oder Skips. Beide 133-Datei-Prüfrahmen
bleiben während der Läufe bytegleich. Der
[gesonderte Integrationsbeleg](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-09/g17-german-parent-consumer-integration/receipt.json)
weist genau neun bereits geprüfte Deutsch-Unterschiede zum Elternstand aus;
die übrigen 124 Eingaben stimmen mit ihm überein. Die 35 Loader-, acht Python-,
32 CQR- und 43 Paket-Eingaben des deutschen Einzelstands bleiben unverändert.
Die vollständige Backendausführung am abschließenden Folge-PR bleibt Teil
seiner frischen Remote-Abnahme. [Die lokale deutsche Notiz](german-first-cluster-prerequisite-normalization-review-2026-11-09.md)
bleibt erhalten; es werden keine weiteren deutschen Kanten bearbeitet und
kein Folge-PR vor der Main-Lieferung von #97 angelegt.

Der zusätzliche Readerfix aus `200d21f9ff` ist im sichtbaren Deutsch-Branch
als `68db5bf499` zusammengeführt. Die vier tatsächlichen npm-Aufrufer für
Q2.5, Q2-M7, Caterer und den vollständigen Composition-Rollen-Test bestehen
auch in diesem V5-Stand. Beide Läufe binden dieselben 130 unveränderten
Eingaben. Die fünf Readerdateien stimmen bytegleich mit dem Elternfix überein;
von den 125 geschützten Elterneingaben unterscheiden sich nur die neun bereits
geprüften Deutsch-/V5-Dateien, die übrigen 116 sind unverändert. Die ursprünglichen
35 Loader-, acht Python-, 32 CQR- und 43 Paket-Eingaben bleiben ebenfalls gleich.
Das ergänzt die bestehenden lokalen Belege, ersetzt aber nicht die eigene
frische Remote-Abnahme des folgenden Deutsch-PRs. Die
[Integrationsnotiz](german-assessment-reader-integration-review-2026-11-09.md)
bindet die tatsächlichen Aufrufer und Ergebnisdateien. Die Wirtschaftsentscheidung
zur zusätzlichen Scopebindung war auf Ownerwunsch zurückgestellt. Nach seiner
anschließenden Projektionsklärung und der Astra-Ultra-Analyse vom 9. November
wird dieser Vorschlag nicht weiterverfolgt. Die Kursansicht erhält keine eigene
`requires`-Autorenschaft. Eine Projektion ausgewählter kanonischer Atome muss
deren vollständige transitive Voraussetzungshülle erhalten und die erforderlichen
Level-2-Rollen ausdrücklich auflösen; sichtbarer Baum und Fokus sind davon
getrennt. Der reguläre Resolver verfolgt solche Ketten bereits rekursiv.

Der konkrete Wirtschaftsfall beginnt davor: Direkte `goalEntry`-Referenzen machen
die beiden kanonischen Prüfungscluster in der Projektion zu Atomen und schneiden
ihre Kinder als Berechnungsbasis ab. Dies ist im bisherigen DPK-006c-c-Vertrag
ausdrücklich beschrieben. Bloßes zusätzliches Laden von Zwischenknoten würde
die dadurch isolierten Ersatzatome nicht verbinden. Der nächste begrenzte
Nachweis vergleicht daher die bestehende opake Projektion mit einer Projektion
der vorhandenen kanonischen Prüfungsatome und erst anschließend die Entfernung
der beiden Clusteranforderungen. Zielmengen- und Fortschrittsunterschiede der
Projektionskorrektur werden ausdrücklich ausgewiesen; gespeicherte Ergebnisse
werden nicht auf Kinder übertragen. Diese Analyse implementiert noch keine
Projektions-, Rollen-, Mastery- oder Curriculumänderung.

Die angeforderte konzeptionelle Dokumentationskorrektur wird als eigener kleiner
Dokumentations-PR unmittelbar nach der Main-Lieferung von #97 und vor dem
Deutsch-Daten-PR übernommen. Graphdefinition, Projektionsvertrag, deutsche
LaTeX-Kapitel, bestehende Regelzuordnung und neu gebauter PDF-Stand gehören
zusammen; die Deutsch-Daten und deren technische Nachweise bleiben ein eigener
Folgeschritt. Der sichtbare Branch bewahrt beide getrennt committierbaren Stände.

Die ersten beiden CI-Reparaturen sind als `a2d7043e6c` in PR #96 committet und
gepusht. Die gezielte Physikprüfung mit ihren
Gegenfällen, Dauerlayout-/Coverage-/Gap-Checks, CQR-Frische und zehn Untergrenzen,
ESLint sowie Dokumentations- und Terminologieprüfungen bestanden lokal.

Der sichtbare IDE-Checkout liegt auf
`fix/g17-german-first-cluster-prerequisite`. Die ursprüngliche Vorprobe des inzwischen
committeten atomaren Mathematikbatches
findet 922 redundante Rohkanten aus 490 zusätzlichen Quellen: 2.484 atomare
Anforderungen werden zu 1.562 reduziert; der bestehende Auditor findet danach
keine Mathematikredundanz. Alle 6.524 tatsächlich kompilierten Geltungswerte
bleiben gleich. Der anschließende tatsächliche Endstand ist lokal einschließlich
der nativen Vergleiche geprüft; Remote-Abnahme steht noch aus. Der bestehende
Auditor bestätigt am tatsächlichen Endstand 1.253 Scopeknoten, 1.562 rohe und
wirksame Anforderungen und keine Mathematikbefunde. Der vollständige neue
Nachweis bestand in rund 89 Sekunden: unveränderter V3-Präfix, ursprüngliche
Dokumentdigests, 719 betroffene Ausgangsquellen und tatsächlich kompilierte
Applicability. Genau ein betroffener historischer Zeuge wird durch den
ausdrücklich bezeichneten neuen Zeugen fortgeführt; sämtliche Endpfade müssen
als tatsächliche Kanten überleben.

Der bekannte Frischeanschluss besteht auch an diesen Daten: alle 18 Ansichten
bytegleich, ausschließlich die aktive Inputbindung fortgeschrieben und die
regulären Coverage-Zähler von 2.484 auf 1.562 erneuert. Das geänderte
Mathematikdokument besteht die vorhandene Runtime-Schemaprüfung; der anschließende
vollständige Schemalauf bestand 119.199 Dateien. Der unveränderte reguläre
Meilensteinproducer und alle zehn geschützten Untergrenzen bestanden auf 32
unveränderten Eingaben mit fünf M7- und fünf M6-Fächern. Der strukturierte
Reportvergleich zeigt ausschließlich Zeit- und V4-Nachweismetadatenänderungen;
alle bisherigen Regel- und Statuswerte bleiben gleich. Python-Gesamtsuite,
Auditor-/Nachweissuite, Standard-Mathematik-CLI und ESLint bestehen ebenfalls.
Astras vollständiges Quellenreview ist ohne Befund abgeschlossen.

Die erste native Gesamtgegenprüfung erreichte eine veraltete Direktkanten-
Testannahme: Tail 912 entfernt das in der Fixture anschließend erneut simulierte
Duplikat bereits im echten Endgraphen. Die materiellen Prüfungen auf fehlende
Rolle und weiterhin vollständige Voraussetzung waren auch dort erfolgreich.
Der destruktive Vorher-Fall bleibt erhalten; der Nachher-Fall prüft vollständige
Nachfragegleichheit und alle sechs tatsächlichen Kanten des zertifizierten
Ersatzwegs. Root und Astra prüften diese isolierte Testkorrektur ohne Befund.
Der begründete neue Native-Gesamtlauf bestand alle drei Tests mit 1.240 realen
Konfigurationen, 370.306 Kontext-/Zielvergleichen und 292.429 Vergleichen
tatsächlicher atomarer Ziele. Alle 490 neuen Quellen sind über reale Scopes
exponiert. Von insgesamt 719 registrierten Quellen sind 717 real erfasst;
die zwei bisherigen PoWi-Gegenproben bleiben mit ihren sechs Atomen und sechs
fehlenden Rollenfällen separat erhalten. Die fünf positiven und negativen
Fokusfälle des fortgeschriebenen Mathematikzeugen bestehen ebenfalls.
Anschließend bestand die unveränderte Projektionsklasse alle 58 Tests ohne
Fehler oder Skips. Sämtliche gebundenen Eingaben blieben während beider Läufe
unverändert. Ein Folge-PR entsteht erst nach der Main-Lieferung von #96;
weitere fachliche Arbeit wird nicht begonnen.

Für die spätere atomare Reduktion ist eine explizite Zeugenfortschreibung
erforderlich: Die zweite Kante des historischen Biologiezeugen aus Operation 8
ist selbst redundant. Alte Operationen werden deshalb nicht umgeschrieben;
spätere Entfernungen müssen ihre Ersatzwege durch neue Beweisschritte bis zum
überlebenden Endgraphen absichern. Diese Erweiterung und die tatsächliche
Atomnormalisierung bleiben eigene Folgeschritte innerhalb desselben G17-Goals.

**Lieferregel:** Kleine, abgeschlossene PRs mit erfolgreicher Pflicht-CI
geordnet nach main liefern. Die vorstehend ausdrücklich getrennten QA- und
16er-G17-Schritte dürfen am unveränderten PR-Head parallel vorbereitet werden;
die Lieferreihenfolge bleibt QA-Reparatur vor Datenbatch. Vor einem weiteren
unabhängigen Änderungsumfang wird der laufende kleine PR abgeschlossen.
Die Entwicklung bleibt im bereits geöffneten, sichtbaren
IDE-Checkout; kein separater Arbeitsbaum.

## Ownerkorrektur vom 8. November: historische Pause, Fortsetzung aktiv

Der Owner stoppte am 8. November den bisherigen Umsetzungslauf und pausierte
das G17-Goal. Diese Stopentscheidung bleibt als historische Korrektur erhalten.
Anschließend hat der Owner die Fortsetzung ausdrücklich beauftragt; das Goal
ist wieder aktiv. Die eigenständige Dokumentationslieferung ist mit PR #91
abgeschlossen; jetzt folgt die Umsetzung unter der korrigierten atomaren Norm.
Verbindlich ist `R ⊆ A × A`: alle Voraussetzungen vollständig zwischen atomaren
Zielen erfassen. Erst die atomare Repräsentation sichern, dann durch sie
abgedeckte nichtatomare `requires` entfernen und erst danach die atomare Relation
transitiv reduzieren. Atomare Autorenkanten zugunsten verbliebener Clusterkanten
zu löschen ist nicht der beauftragte Zielzustand. Diese Änderung betrifft
ausschließlich `requires`; Clusterknoten und `contains` bleiben erhalten.
`CQR-102` und `GVR-012` bleiben
direkt atomar; die vorgeschlagene Lockerung wurde verworfen.

Die [vollständige Regel- und Meilensteinmatrix](../qa-ci/graph-definition-rule-milestone-matrix.md)
erfasst den TeX-Korpus mit 143 Gruppen. Globale atomare Normalform und vollständige
G17-Prüfung sind Sollbasis vor jedem Fach-Meilensteinpass M1–M7. Die Matrix
weist bestehende Teilgates und Lücken aus; sie beauftragt keinen zusätzlichen
143-Regel-Implementierungsauftrag und keine fachliche Inhaltsarbeit.

PR #90 ist auf main bei `3b71ee9370805f98b37f0e7e9b3352b9ac26f845` geliefert;
sein getesteter PR-Head bestand fünf Pflichtworkflows und acht Hauptjobs.
Der anschließende, nicht akzeptierte V2-Versuch mit 173 weiteren Bio-Löschungen
ist unverändert gesichert auf
`archive/g17-biology-v2-before-atomic-target-20261108` bei
`69dcee1ed22db53fc641c220f9246d0b508cbb89`. Alle elf WIP-Dateien wurden bytegleich
geprüft; der alte Audit-WIP `2e73a5c05897aab3fd436eabd8267c2b9a1fd302` und
unversionierte Altartefakte bleiben erhalten. Dieser V2-Versuch ist keine
freigegebene Löschliste. Er bewahrte atomare Wirkung, verletzte jedoch die
vorgeschriebene Autorenrepräsentation und den korrekt ablehnenden M7-Floor.

Die Dokumentationslieferung wurde getrennt von der nicht akzeptierten
Datenänderung nach main übernommen. PR #92 hat anschließend den begrenzten
Erhaltungsnachweis und die Latein-Korrektur geliefert: Der Cluster `e82cc731…`
verliert seine Anforderung an `551f2d6c…`; jeder kanonische atomare Nachfahre
besitzt einen überlebenden direkt atomaren Voraussetzungspfad. Eingangsprüfungen
für die Quelle und alle nichtatomaren Nachfahren schützen die bestehende
Rollenrelation. Die bisherigen 187 bescheinigten atomaren Entfernungen und
ursprünglichen Katalogbindungen bleiben erhalten. Die native Regression bestand
alle 1.240 Konfigurationen und alle 188 Quellen, einschließlich 161
Latein-Frontiervergleichen. Diese Lieferung ersetzt weder die folgenden
mechanischen Fachbatches noch die verpflichtende Standard-Meilensteinanbindung. Brauchbare
Invarianztests und Vergleichsbindungen aus dem gesicherten WIP werden dafür
einzeln geprüft übernommen. Die 173 falsch priorisierten Löschungen werden nicht
blind zurückgespielt. Historische Inventare und Vorschauen im folgenden Plan
ersetzen diese neue Zielpriorität nicht.

Die mit PR #94 gelieferte Folgelieferung umfasst 16 bereits atomar abgedeckte
Clusteranforderungen: Biologie 2, Chemie 6, Physik 6 sowie Politik und
Wirtschaft 2. Nur `requires`-Arrays von zwölf Clusterquellen wurden geändert;
atomare Autorenkanten und `contains` blieben erhalten. Der bestehende V2-Vertrag
wurde wiederverwendet; die bisherigen 188 Operationen und ursprünglichen
Katalogbindungen blieben erhalten. Der gelieferte Gesamtstand hat 204 Operationen
und 200 Quellen; für die 16 Ergänzungen überleben 81 rohe atomare Pfadzeugen.
Auf dem eingefrorenen Stand bestanden die vollständige Auditor-/Nachweissuite
mit echten Negativfällen, der tatsächliche Applicability-Vergleich und beide
Atlas-Checks. Der reguläre Meilensteinproducer erreicht unverändert fünf M7-
und fünf M6-Fächer; alle zehn geschützten Fachfloors bestehen.

Die native lokale Regression bestand mit zwei Tests ohne Fehler oder Skips:
1.240 reale Konfigurationen, 370.306 Hüllen-/Rollenvergleiche und 292.429
Vorkommen tatsächlicher atomarer Scope-Targets. Alle 200 Quellen sind vollständig
abgedeckt: 198 mit Live-Nachfahrenabdeckung und getrennt zwei nicht in aktuellen
Views exponierte PoWi-Quellen über dieselben Produktions-APIs. Die sechs
kanonischen Atomprobes schließen sechs harte Missing-Role-Gegenfälle ein;
sie werden nicht als zusätzliche reale Benutzerkonfigurationen ausgegeben.
Die Wirtschaftsregression erhält für HE-GK/LK die strikte Blockade ohne
Orientierung in beiden Frames; auch die bestehenden Math-/Bio-/Lateinkontrollen
bestehen. Quellenreview mit Astra ist ohne Blocker abgeschlossen. Der endgültige
PR-Head bestand nach den isolierten CI-Testkorrekturen alle sechs ausgelösten
Workflows und acht Hauptjobs und ist auf main geliefert. Die separate frische
Main-CI bestand anschließend ebenfalls alle sieben ausgelösten Workflows und
acht Hauptjobs. Die vollständige atomare Normalform und G17 in der
Standard-Meilensteinprüfung sind damit weiterhin nicht abgenommen.

Die zwei zunächst geplanten Wirtschafts-Cuts gehören weiterhin zur offenen
Gesamtaufgabe, jedoch nicht zu diesem Batch: Ein echter HE-GK/LK-Backendtest
zeigt beim atomar projizierten Abitur-Target einen Verlust der bisher
blockierenden Orientierungsvoraussetzung. Der 18er-Stand ist damit nicht
abgenommen. Ein pauschaler Adaptermodus würde zehn andere bestehende Makros
strenger behandeln; ein selektives neues View-Feld berührt den bestehenden
V1-Schema-/Profilvertrag und eine aktive Reviewbindung. Diese Verträge und
Reviewpins werden nicht still fortgeschrieben. Die Wirtschaftsquellen bleiben
im 16er-Batch unverändert; die echte Regression wird beibehalten. Ihre spätere
technische Lösung bleibt ein ausdrücklich offener Main-Folgeschritt desselben
Goals. Vollständige Normalisierung und Standard-Meilensteinanbindung bleiben
weiterhin erforderlich.

Die anschließende vollständige Atomnormalisierung hat einen konkreten
technischen Folgeblock. Die folgende historische Vorschau bezieht sich auf
den virtuellen 18er-Stand, nicht auf eine neue Vermessung des 16er-Batches:
Eine virtuelle Prüfung des bei PR #92 gebundenen 21-Dateien-Bestands erhält `R_at` und `R_at+` und findet in den zehn Zielfächern
keine atomaren Zyklen oder Auflösungsfehler. Nach dem 18er-Batch bleiben jedoch
369 nichtatomare Beziehungen (26 Cluster→Atom, 270 Atom→Cluster,
73 Cluster→Cluster). Ihre vollständige Darstellung ändert 407 `requires`-Quellen
und materialisiert 4.765 bereits induzierte atomare Paare. Der bestehende
Applicabilitycompiler liefert dabei 38 andere Werte: Biologie 11, Physik 19,
Chemie 7, Informatik 1. Ursache sind die Auswertung roher Voraussetzungseingänge
und ihres Autorenorts sowie anschließende Clusteraggregation; gleiche atomare
Nachfrage allein erhält diese Berechnung nicht.

Beispielsweise wechselt der Compilerwert von Bio `487c79f5…` von BY/HE zu
`{}`: Die Jurisdiktionsdimension fehlt dann; das bedeutet laut Norm keine
Jurisdiktionseinschränkung und keine explizit leere Gültigkeitsmenge.
Informatik `de388e30…` wird von BY/HE/SL auf alle 16 Jurisdiktionen erweitert.
Ein exakter Mengen-Cap allein wäre keine Lösung: `APV-102` beanstandet weiterhin
eine neu direkte Anforderung von einer Quelle mit 16 Jurisdiktionen an eine
Voraussetzung mit drei. Die bereits autorisierte `prerequisiteOnly`-Rolle trennt
Unterstützung von Targets; sie ist keine automatische Applicability-Freigabe.
Dieser Folgeblock benötigt einen isolierten technischen Nachweis und die
Klärung des vorhandenen Scopevertrags vor seiner Umsetzung. Es werden weder
Gültigkeitsbereiche still umgedeutet noch Validatoren ausgenommen oder fachliche
Quellenentscheidungen neu getroffen. Die virtuelle Prüfung ist kein nativer
Vorher-/Nachher-Frontiernachweis und keine Abnahme der Gesamtumstellung.

## Ein aktives Ziel, ein tatsächlicher Lieferweg

Das wieder aktive Ziel bleibt **G17 in der Standard-Meilensteinprüfung und die tatsächliche
Wiederherstellung aller ursprünglichen M6-/M7-Stände auf main**. Der Owner hat
die Abnahme anhand seines Screenshots ausdrücklich festgelegt:

| Zielstand auf main | Fächer |
| --- | --- |
| M7 | Biologie, Chemie, Mathematik, Physik, Wirtschaftswissenschaften |
| Mindestens M6 | Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft |

Die Standardprüfung wertet G17 für ihren vollständigen deklarierten kanonischen
Fachbestand aus. Korrektur und Abnahme umfassen diese zehn Fächer einschließlich
relevanter fachfremder Voraussetzungen und vererbender Vorfahren. Ein bloßer
Mathematik-/Physik-Teilscan genügt nicht. Die übrigen experimentellen M0-Fächer
erhalten kein zusätzliches Aufstiegsziel; ihre offenen Befunde werden dennoch
nicht als bestanden dargestellt. Eingabebestand und Prüferrevision werden vor
der Umsetzung festgehalten.

Die Arbeit bleibt deterministisch: zuerst vollständige atomare Voraussetzungen
sichern, dann redundante nichtatomare Anforderungen entfernen und zuletzt
atomar reduzieren. Nach betroffenen Änderungen Vererbung und Expansion neu
auflösen sowie Zeugen und vereinbarte Atom-/Scope-/Frontierinvarianten prüfen. Geordnete Batches sind sinnvoll; alle anfangs redundanten Ursprünge
gleichzeitig zu löschen wäre unsicher. Keine neue Bewertung von Zielzuschnitt,
Beschreibungen, Aufgaben, Bildern oder Quellen ist Teil dieses Auftrags.

Der vorhandene WIP bleibt bei `2e73a5c05897aab3fd436eabd8267c2b9a1fd302`
in [PR #84](https://github.com/enpasos/skillpilot/pull/84) erhalten. Seine
erhaltenswerten Nettoänderungen werden in kleine lieferbare Pakete aufgeteilt.
Den gesamten WIP zusammen zu mergen ist nicht der Lieferplan.

## G17: kleine Lieferungen innerhalb derselben Aufgabe

| Lieferung | Inhalt und Herkunft | Konkrete Main-Abnahme |
| --- | --- | --- |
| G17-Prüfer, geliefert | Eigenständiger `app/scripts/auditTransitiveMinimality.ts`, Algorithmus- und CLI-Regressionen, eindeutiger vollständiger Bestandsaufruf und dieser Lieferplan. | PR #86 auf main bei `ab0aa4ea9f`; frische Pflicht-CI erfolgreich. 572 unabhängige Literalvergleiche, 3.593 abgewiesene ungültige Graphen und zwölf echte CLI-Testgruppen. Tatsächlicher aktueller Bestandsaufruf: 21 Roots, fünf `pass`, zwölf `fail`, vier `invalid-input`, korrekt Exit 2. |
| Technische Transitivitätsabhängigkeit, geliefert | Nur die nachgewiesen erforderlichen fünf Produktionsdateien und gezielten Regressionen aus `b8eef5b967`: gemeinsame Voraussetzungstopologie, vollständige kanonische Level-2-Zielclosure und Fokusfilter nach transitiver Auswertung. | PR #87 auf main bei `d63e1b408d`; vollständiger regulärer lokaler Backendcheck mit 2.689 bestandenen Fällen, 19 bestehenden optionalen Skips und null Fehlern; alle fünf frischen Remote-Workflows erfolgreich. Regressionen über alle vier Frontier-APIs, normale/strikte Modi, gemeisterte und außerhalb des Fokus liegende Zwischenziele sowie fremde/vererbte Voraussetzungen. Gespeicherte Mastery und Anerkennungsregeln bleiben unverändert. |
| Begrenzter Frischeanschluss und erste Reduktion, geliefert | Genau die Mathematikkante `bf17cada… → 71cec9fb…` mit direkt authored atomarem Ersatzpfad `bf17cada… → 91e2f564… → 71cec9fb…`. Eine harte Reduktionsbescheinigung erlaubt ausschließlich den nachgewiesenen historischen Vergleichswert an den betroffenen Reviewbindungen. | PR #88 auf main bei `2c2fc3bc0d`; alle fünf frischen PR-Workflows und acht Hauptjobs erfolgreich. Vollständiger Katalogabgleich, geordnete Auditorprüfung, unveränderte übrige Felder und tatsächlicher Applicability-Vergleich. Native CI-Regression über 1.240 Konfigurationen für Projektion, vollständige atomare Nachfrage und die bisherige Rollenprüfung. Tatsächliche Python-/Release-Modell-Conformance bestanden. Originale Fingerprintfunktionen und Reviewarchive bleiben unverändert; ungültige deklarierte Beweise scheitern hart. V1 deckt direkte atomare Blattpfade ab und ist keine Freigabe sämtlicher Bestandskandidaten. |
| Einheitliche Rollenpflicht, geliefert | Ausdrücklich bestätigte Ownerentscheidung vom 7. November: direkte, geerbte und transitive Voraussetzungsknoten müssen in der Level-2-Komposition eine Rolle haben. Die bisherige Vererbungsausnahme entfällt. | PR #89 auf main bei `3ee1acc373`; alle fünf frischen PR-Workflows und acht Hauptjobs erfolgreich. Vollständiger regulärer lokaler Backendlauf: 2.693 bestanden, 19 bestehende optionale Skips, keine Fehler. Vorhandene Topologie, unveränderte atomare Fokus-/Masteryprüfung, echte Bio-/Math-Reduktionsgegenfälle und 1.240 native Konfigurationen. Der reale unvollständige HE/G9-Scope ist ausdrücklich negativ geprüft; positive Assessmentfälle verwenden den bestehenden vollständig deklarierten HE/G8-Scope bei unveränderten Workflowassertionen. |
| Biologie: redundante Anforderungen an ein Orientierungsziel, geliefert | 186 frisch belegte direkte Anforderungen an `2d451684…` entfernt; ausschließlich die jeweiligen `requires`-Arrays ändern sich. Von 187 vorbereiteten Kandidaten bleibt einer wegen seines aktuellen geerbten Clusterzeugen außerhalb des unveränderten V1-Vertrags unverändert. | PR #90 auf main bei `3b71ee9370`; sein geprüfter PR-Head bestand fünf Pflichtworkflows und acht Hauptjobs. Bestehende Mathematikoperation und ursprüngliche 21 Quelldigests erhalten; kumulativer Live-Prüfer mit 187 Operationen, vollständigem Replay, überlebenden Zeugen und tatsächlicher Applicability-Gleichheit über 6.524 Ziele bestanden. Biologie-Befunde sinken durch die 186 Entfernungen von 359 auf 173. Das ist die Abnahme dieses gelieferten Batches, nicht die vollständige G17-Abnahme. |
| G17-Bestand und Standard-Meilensteinprüfung | Mechanisch belegte Reduktionsbatches, G17 in der regulären Meilensteinberechnung und verpflichtender CI-Aufruf gegen die tatsächlichen Dateien. Vorhandene geeignete Korrekturen wiederverwenden. | Null G17-Verstöße im Abnahmebestand; Invarianten erhalten; wieder eingefügte Redundanz oder unvollständige Prüfung verhindert den Meilensteinpass. Sämtliche zehn Zielstände werden regulär auf main mindestens erreicht, alle erforderlichen frischen CI-Prüfungen bestehen und die Änderungen sind nach main geliefert. Erst damit ist das Goal erledigt. |

Die erste Lieferung hat den Prüfer auf main gebracht, behauptet aber keinen minimalen
Bestand und erfüllt das Goal noch nicht. Ein separater grüner G17-Check reicht
ebenfalls nicht: Die Standard-Meilensteinprüfung muss die Zielstände tatsächlich
berechnen. Ihr echter Bestandscheck bleibt bei vorhandenen Fehlern rot. Es gibt
keine abgesenkten Untergrenzen, gesetzten Reifegradzahlen oder Warnungs-,
Baseline- und Ignore-Ausnahmen zum Erzeugen eines Passes.

Der eigenständige Bestandsaufruf lautet im Verzeichnis `app`:
`npm run check:transitive-minimality`. Er lädt denselben rekursiven kanonischen
Dateibestand wie der Standardproducer und berechnet jeden Fachroot mit seiner
vollständigen Referenz- und Vererbungsclosure. Exit 0 bedeutet vollständig
bestanden, Exit 1 vorhandene Redundanz und Exit 2 ungültige Eingabe oder Closure.
`npm run audit:transitive-minimality` dient nur der Berichterstellung:
Befunde bleiben als `fail` sichtbar, ungültige Eingaben bleiben Exit 2.
Explizite `--root`-Auswahlen sind im Bericht als Teilscan gekennzeichnet.
Die erste CI-Anbindung führt die Algorithmus- und CLI-Regressionen aus;
die verpflichtende Standard-Meilensteinanbindung folgt mit dem Bestands-PR.

Die native Reduktionsprüfung zeigte außerdem einen konkreten Regelkonflikt:
Die bisherige Rollenpflicht unterschied direkte von geerbten Voraussetzungen.
Das Entfernen eines redundanten direkten Duplikats konnte deshalb einen Start
freigeben, obwohl sich die wirksamen Voraussetzungen nicht änderten.
Der Owner hat am 7. November ausdrücklich entschieden, die Rollenpflicht auf
alle geerbten und transitiven Voraussetzungsknoten zu vereinheitlichen und
die frühere Ausnahme aufzuheben. Bisher erlaubte Konfigurationen dürfen dadurch
blockieren. Geprüft wird die vorhandene wirksame Zielknotenrelation vor ihrer
atomaren Clusterauflösung; reine Contains-Nachkommen erhalten keine weitere
Rollenpflicht. Rollen werden nicht automatisch ergänzt, Fokus- und Masteryregeln
bleiben bestehen. Diese isolierte Lieferung ist mit PR #89 auf main angekommen.
Größere Reduktionsbatches werden jetzt unter derselben neuen Regel verglichen.

Der erste Biologie-Batch nutzt nur direkt authored atomare Blattpfade.
Er ordnet den vollständigen relevanten ursprünglichen `requires`-Graphen mit
Voraussetzungen zuerst und filtert erst danach die Kandidaten. Jeder akzeptierte
Schritt erhält einen frisch berechneten Auditorzeugen; 105 zuvor aufgezeichnete
Wege waren durch spätere Löschungen gefährdet und durften nicht übernommen werden.
Der Live-Prüfer bestätigt für 186 akzeptierte Entfernungen sämtliche endgültigen
Wege und die unveränderte Applicability. Der Kandidat `135447a0…` bleibt bewusst
offen, weil sein aktueller Zeuge einen Cluster und einen geerbten Ursprung nutzt.
Es gibt dafür weder eine abweichende Zeugenwahl noch eine gelockerte V1-Prüfung.
Die 173 übrigen Biologiebefunde und der Rest des Abnahmebestands bleiben offen.

Der tatsächliche Buchbau deckte einen weiteren Aufruf derselben bestehenden
Semantic-kind-Quellprüfung im Atlasgenerator auf. Dieser erhielt den bereits
verifizierten Kontext noch nicht. Atlasbau, Veröffentlichungsprüfung und ihre
CLI-/Testaufrufe reichen ihn nun ausdrücklich weiter; die Fingerprintfunktion
und das historische Ledger bleiben unverändert. Ohne Kontext gilt weiterhin
der aktuelle Rohwert. Mit Kontext wird zuerst der aktuelle Rohwert an den
verifizierten Snapshot gebunden, bevor der aktuelle oder zertifizierte
ursprüngliche Vergleichswert zulässig ist. Es entsteht keine fünfte
Vergleichsfamilie; Projektionen und Receipts werden aus aktuellen Daten erzeugt.

Die vollständige deterministische Atlasregeneration erzeugt 27 Ausgaben.
26 sind bytegleich; im aktiven
[Biologie-Receipt](https://github.com/enpasos/skillpilot/blob/18570a629e20b4f4cdd0f5e1be9478c87b41f16d/app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json)
ändert sich ausschließlich `/inputBindings/0/sha256` von
`sha256:9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79`
auf `sha256:6c68f48d0c83bf50734d0f42c9efc9efb8c85fc2bb2ad2a23a15845caf974444`.
Alle 24 Ansichten, Manifest, Navigation sowie sämtliche Scope-, Zeugen- und
Entscheidungsfelder bleiben gleich. Dies ist ausdrücklich geprüfte Pflege des
aktuellen Eingabepins, keine Neubindung historischer Reviewentscheidungen.

Ein grüner G17-Einzelcheck erlaubt keinen Merge an anderen erforderlichen
Prüfungen vorbei. Blockieren bestehende technische Frischebindungen die zweite
Lieferung, wird genau diese Abhängigkeit isoliert und offen gelöst. Keine
stillen Fingerprintwechsel und keine dadurch gestarteten Fachreviewkampagnen.

Die erste native Reduktionsregression hat eine konkrete technische Abhängigkeit
aufgedeckt: In Biologie `DE-BY/CrossStage/G9/GK` wurde ein nicht benötigter
Cluster aus der Projektionsmenge als kanonisches Voraussetzungstarget validiert.
Das setzte die echte Frontier-Topologie auf `null` und blockierte selbst
„Warum Biologie?“. Die begrenzte Korrektur validiert denselben vollständigen
atomaren Level-2-Wurzelsatz, mit dem der Voraussetzungskontext aufgebaut wird.
Alle transitiven Anforderungen bleiben unabhängig von Fokus und Mastery geprüft;
Rollenprüfung und Lernzielinhalte ändern sich dadurch nicht. Der echte Bio-Fall
und eine ungültige atomare Anforderung außerhalb des Fokus gehören zur Regression.
Ein Vorher-/Nachher-Fehlergleichstand ersetzt diesen erfolgreichen Nachweis nicht.

Der reguläre Backendlauf deckte im Anschluss einen echten HTTP-500-Fehler
bei Wirtschaftswissenschaften `DE-BB/G8` und `DE-BB/G9` auf: Die Rich-Frontier
fragte einen sichtbaren Navigationscluster ab, der nicht zum validierten
Voraussetzungskontext gehört. Die gemeinsame Prüfung lehnt einen Kandidaten
außerhalb dieses Lookups geschlossen ab. Sie erweitert den Graphen nicht;
unbekannte atomare Anforderungen bleiben Fehler der vollständigen
Wurzelvalidierung. Die bestehende M6-Integration prüft deshalb zusätzlich den
HTTP-Status vor Filtern und unveränderten Zielzahlen.

Die erste Kantenentfernung machte außerdem den aktiven kanonischen Input-Pin
des Mathematik-Dauerlayoutplans veraltet. Der tatsächliche CI-Schritt
`check:math-duration-composition-views` wies diesen Stand hart zurück.
Die [bestehende Pflegeanweisung](../qa-ci/math-m7-concept-and-handoff-2026-09-28.md)
erlaubt dessen Fortschreibung nach Prüfung des Inhaltsdeltas. Dieses Delta
besteht ausschließlich aus der belegten `requires`-Entfernung am gewöhnlichen
Q2-Atom; es betrifft keine Entscheidung des Sek-I-Splitplans.
In `app/scripts/config/math-duration-split-spanning-tree-policy.json` wird deshalb
nur `inputs.canonical.sha256` ausdrücklich von
`e0ff0cafccf0f638c4cb36d5a252480ccc7062750619ef0452a447775bf96fe1` auf
`07749daefff5535416b17d133a84cdcfad40eb5b3137de4958898b8386d79838`
fortgeschrieben. Der reguläre Generatorcheck besteht; alle 18 vorhandenen
Views sind bytegleich. Alle übrigen Planfelder, 83 Platzierungen, sieben
additiven Adjudikationen und fünf Quellen-Scope-Bindungen bleiben unverändert.
Historische Reviews werden nicht neu gebunden; die vier Vergleichsfamilien
der Reduktionsbescheinigung werden dafür nicht erweitert.

Der abgeleitete Mathematik-Rationale-Coverage-Bericht folgt derselben
Kantenentfernung: direkte `requires`-Relationen und noch offene
Relationsbegründungen sinken jeweils von 2.460 auf 2.459. Die reguläre
Regeneration ändert ausschließlich diese Zähler und den Zeitstempel; der
zugehörige Check besteht. Zielmengen, Quellenbegründungen und alle übrigen
offenen Lücken bleiben gleich.

Die tatsächliche Pflicht-CI kompiliert und validiert außerdem das Release-Modell
auch ohne vollständigen Paketexport. Beide Pythonwerkzeuge verglichen die
Semantic-kind-Bindung bisher ausschließlich mit dem aktuellen Rohwert und
wiesen deshalb dasselbe reduzierte Ziel zurück. Sie starten nun jeweils den
bestehenden Node-Verifier unabhängig, prüfen vollständigen Source-Snapshot,
Datei-/Registry-Bytes und sämtliche aktuellen Fingerprints und erlauben erst
danach den zertifizierten ursprünglichen Wert derselben Vergleichsfamilie.
Die Fingerprintfunktionen und historischen Ledger bleiben unverändert;
kompilierte Inhalte entstehen weiterhin aus dem aktuellen reduzierten Dokument.
Der vorhandene Conformance-Bericht weist den Nachweis aus und wird vom
unabhängigen Validator vollständig rekonstruiert. Source-freie Consumer binden
diesen Bericht über das Manifest und benötigen dafür weder Node noch Repository.

Der aktuelle normalisierte Modell-Digest ändert sich durch die Kantenentfernung.
Deshalb wird die aktive Redistribution-Bindung mit dem vorhandenen Generator
ausdrücklich von `e8ad1ec76513cac8248234798ea10e612db11fb58785ad9723b49b77ca80b97a`
auf `fb51e95c0113339cf0252653ee91f0258bd56f80893d85fe6f45fb7dc775e602`
fortgeschrieben. Der geprüfte Ledgerdelta besteht ausschließlich aus
`/contentDigest`; alle Entscheidungen und Fingerprints, 839 offene Prüfungen
und `publicationReady: false` bleiben gleich. Build-Inputs, Ressourcenindex,
Source-Verification-Ledger und historische Paketartefakte bleiben unverändert.
Diese technische Pflege erklärt keine neue fachliche oder menschliche Freigabe.

Der zuvor belegte technische Fehler auf main war der Abbruch von
Voraussetzungspfaden an gemeisterten oder außerhalb liegenden Zwischenknoten.
Die notwendige Transitivitätskorrektur aus `b8eef5b967` wurde mit PR #87 im
nachgewiesenen Umfang geliefert. Ein reproduzierbarer Unterschied stoppt
weiterhin den betroffenen Reduktionsbatch.
Daraus folgt kein Auftrag zur fachlichen Neugestaltung.

## Weitere erhaltenswerte Arbeit: geplante Lieferwarteschlange

Diese Pakete werden nicht parallel zum G17-Ziel begonnen. Nach dessen Abschluss
wird jeweils das nächste einzelne deterministische Ziel gewählt. Die Herkunft
ist geprüft; ein vorhandener lokaler Testbeleg ist noch keine Main-Abnahme.

| Paket und Herkunft | Geplanter Weg nach main | Verbleibende Abnahme |
| --- | --- | --- |
| Kartenabschluss trotz späterer Fälligkeit, `234372d013` | Kleiner Regressionstest-PR mit `AssessmentCompletionSrsIntegrationTest.java` und nötiger Workflowanbindung; passende bereits entschiedene Dokumentationskorrektur zuordnen. | Normaler Backend-/Integrationslauf auf der dann aktuellen Basis. Vorhandener Beleg: 21 Tests; neuer PR braucht frische Pflichtprüfungen. |
| Eindeutige Fremdreferenzen, `4b19462103` | Eigener Prüfer-PR mit `validateGraph.ts`, `testGeneralGraphReferenceCli.ts` und gezielter Verdrahtung. | 23 vorhandene CLI-Gegenfälle sowie echter Bestandslauf und alle Pflichtprüfungen. Bestandsfehler werden nicht verdeckt. |
| Frühere Quellprüfung, Workflowanteil aus `96b770b2ea` | Die DAG-Änderung und passende Workflowtests auf die dann aktuelle Main-CI übertragen. Der Abschluss verlangt erfolgreiche Quellprüfung und Buchbau. | Lokale Workflowkontrollen und frischer realer CI-Lauf. Nicht den gesamten historischen Workflow oder die mitgepackten Backendfixtures übernehmen. |
| UUID-CLI, `69a4a5d5f1` | Getrennter deterministischer Identitätsauftrag: Prüfer und nötige identitätserhaltende Bestandsreparaturen zusammen einliefern. | Die bisher gefundenen 164 ungültigen IDs und 327 Referenzendpunkte sind echte Blocker. Kein Merge der vollständigen Gateaktivierung mit verdeckter Ausnahme. |
| Vollständige Assessment-/Materialprüfung und weitere technische Gates | Jeweils ein eigener, auf Main portierter Prüfer-/Verbraucher-PR mit den bereits vorhandenen konkreten Gegenfällen. Abhängige Gates und Daten nur gemeinsam freigeben, wenn ihre Abnahme erfüllt ist. | Zum Beispiel echte M6-Positivkontrolle plus Ablehnung des veralteten positiven Berichts; aktuelle Quellen-/Scopebindung und frische Pflichtprüfungen. Erforderliche Bestandsreparaturen vorher als endliches eigenes Paket benennen. |
| Bereits vorliegende Curriculum-/Text-/Aufgaben-/Bildkorrekturen | Nach G17 gesondert über Einlieferung entscheiden, dann fach- oder paketweise Folge-PRs mit bestehenden passenden Reviewbelegen. Bereits brauchbare Deutsch-/Geschichte-/Latein-Korrekturen und Informatik-/Bildpakete dabei ausdrücklich zuordnen. | Aktuelle fachliche und technische Abnahme des jeweiligen Pakets. Kein neuer semantischer Arbeitsstrang im G17-Auftrag; keine pauschale Zusage, alle Kandidaten zu übernehmen. |

Die Umsetzung darf die erforderliche Nettoänderung neu auf Main zusammensetzen;
ein vollständiger Cherry-pick großer Mischcommits ist nicht erforderlich.
Benötigte Nachweise begleiten den jeweiligen PR. Experimentelle Doppelstände
und nicht verwendete Zwischenartefakte brauchen keinen Platz auf main.

## PR84 geordnet abschließen

Für jedes Paket wird der Lieferstatus unmittelbar beim jeweiligen Folge-PR
fortgeschrieben:

- **Übernommen:** Folge-PR und tatsächlicher Main-Commit.
- **Konkret offen:** benannter Folge-PR oder Auftrag mit überprüfbarem
  Abnahmekriterium und ausgewiesenen Blockern.
- **Bewusst nicht übernehmen:** begründete Entscheidung, ohne stillen Verlust.

PR84 wird erst geschlossen, wenn diese Zuordnung vollständig ist. Ein
unbefristeter Draft oder ein Archivbranch ersetzt den Lieferweg nicht.
Umgekehrt wird erhaltenswerte Arbeit nicht ungeprüft gemerged, nur um sie
formal auf main zu haben.

Nach main geliefert sind die oben einzeln belegten Lieferungen bis PR #96:
Auditor und Regressionen, notwendige technische Korrekturen, atomare Zielnorm,
mechanische Reduktionen und der erste atomare Mathematiknachweis. Als Nächstes
folgen die tatsächliche Main-Lieferung von Mathematik-PR #97 und danach der
bereits lokal geprüfte erste deutsche Atom→Cluster-Fall. Weitere mechanische
Reduktionen und die harte Standardintegration bleiben Teil desselben aktiven
Goals. Die historische vollständige In-Memory-Vorschau
hat 2.435 Ursprungskanten nacheinander mit jeweils frischem Auditor entfernt
und im geschützten Scope null verbleibende G17-Befunde erreicht. Dabei wurden
keine Curriculumdateien geändert. Die zusätzlichen nativen Messungen zeigen,
dass atomare Erreichbarkeitsgleichheit allein die bisherige direkte
Rollenprüfung nicht abdeckt. Diese Vorschau ist keine Freigabe unter der
korrigierten atomaren Zielnorm. Die Rollenentscheidung ist umgesetzt; neue native
Vorher-/Nachher-Vergleiche unter derselben Regel bleiben für jeden übernommenen
Batch erforderlich. Das eröffnet keine
fachliche Überarbeitung und ersetzt keine Bestands- oder Main-Abnahme.
Die M6/M7-Wiederherstellung unter der erweiterten
Standardprüfung ist verbindliche Abnahme dieses Goals. Der breite
518-Regel-Audit und semantische Arbeiten gehören weiterhin nicht dazu.
Ein tatsächlich fachlicher Blocker wird konkret benannt; er ist kein Auftrag,
eigenständig Inhaltsarbeit oder neue Reviewkampagnen zu beginnen.
