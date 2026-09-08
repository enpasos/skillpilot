# Dioden-Konsolidierung: informierter Autorenstand

Dieses begrenzte Layer-A-Paket setzt die ausdrücklich freigegebene Dreiteilung von `7f0798cb-5966-5dcb-beb3-84f637ab6139` um. Es ist keine weitere Blindrunde, keine Humanfreigabe, kein D-Registerabschluss und kein beobachteter Lernnachweis. Modell und Modellversion des Autorenlaufs sind nicht verlässlich bekannt.

## Inhalt und Folgen

| Teilziel | Inhalt | Eigene kleine Aufgabe |
| --- | --- | --- |
| `2084b7d4-300d-5fa0-8b8d-c480c40f853e` | Einfaches Trägermodell: Sperrschichtbildung und Polung | `c61b2a69-b5cd-5785-bb04-5d6bca53b218`: gespiegelter p/n-Fall und Gegenbehauptung |
| `3857891b-d328-585b-9936-85c7aff122ee` | Eigene sichere I(U)-Messung in beiden Polungen | `4ac5a07c-fff0-5eae-890d-89e13eaf69c3`: realer beaufsichtigter Versuch und empfindlichere Wiederholungsmessung |
| `3b586f2a-60e2-5019-aa08-6a47616a1f1f` | Stromwege und Ausgangsspannung eines vorgegebenen Gleichrichters | `18fb1470-5a03-5277-9486-ae74c63c8a8c`: Einwegschaltung und umgekehrte Diode |

Der Parent behält ID, Titel und die vorhandene Übersichtsgrafik samt ResourceLink unverändert. Er ist jetzt ein Cluster ohne pauschale Voraussetzungen; seine drei Kinder sind die getrennt prüfbaren Inhalte. Der Transistorschalter `7d4d6a39` setzt nur das p-n-Modell voraus, nicht selbst gemessene Kennlinien oder Gleichrichterkompetenz. Die experimentelle Kompetenz setzt zudem die vorhandenen getrennten Strom-/Spannungsmessziele voraus.

Die alten Tasks `0f5346d6` und `4a58df57` haben nur generische Aufgabenhüllen ohne konkrete Diodenmaterialien. Ausschließlich die alte Parent-ID wurde aus `requires` und `coveredGoalIds` entfernt. Ihre übrigen Aussagen bleiben außerhalb dieses Pakets. Keine automatische Kindercoverage. Die neuen Aufgaben enthalten Material, DE/EN-Auftrag, DE/EN-Erwartungshorizont und Punktevergabe. Bei 12 Punkten und Bestehen ab 9 kann die wesentliche 8/0-Nachweiseinheit nicht umgangen werden. Die experimentelle Aufgabe ist ohne tatsächlichen, von der Betreuung bestätigten Aufbau und originale eigene Messwerte nicht bestanden; ein remote hochgeladenes Zahlenblatt ist kein Durchführungsbeweis. Root hat alle drei DE/EN-Aufträge, Lösungen und Scorings anschließend vollständig informiert gegengelesen. Nach der exakt verlangten DE-Korrektur beim angeschlossenen Lastwiderstand sind die drei Materialien lokal `released`; `assessment-release-receipt.json` bindet die tatsächlich geprüften Körper. Keine Human- oder D-Freigabe und kein realer Lernnachweis.

## Konservative Quellen- und Stufenentscheidung

Originalpassagen wurden lokal aus den offiziellen PDFs bzw. dem erhaltenen BY-Original und der offiziellen LehrplanPLUS-Seite gelesen; nicht nur vorhandene direkte Mappings. Die exakten IDs, Originalquelle, Span, bisherigen Mappingentscheidungen und die neuen begrenzten Rationalen stehen in `source-bindings.json`.

| Quelle | Zielkomponenten und Grenze |
| --- | --- |
| HE Sek II Q4.5, gedruckte S.46 | Alle drei. Wahlthema; Gleichrichter als Demonstration und/oder Schülerexperiment, kein universeller eigener Aufbau. |
| BY Sek I Ph10 NTG 5.1 | Einfaches Modell und eigene Kennlinie; keine allgemein behauptete Gleichrichterpflicht. Der historische zweite Kompetenzspan `Ph10.5.2` bezeichnet nicht das aktuelle offizielle Teilkapitel 5.2. |
| RP Sek II, Elektronik S.38/68 | Einfaches Modell als Teilkomponente; weder ausdrückliche Kennlinienaufnahme noch Gleichrichterpflicht. Falscher Verbatim-Text `Halbleiterdiode als Bauelement erklären` im Einzel-Sourceziel wird zu originalem `Halbleiterdiode` korrigiert. |
| SL Sek I Klasse 9 NW, S.27–28 | Modell, ausdrücklich eigene I(U)-Messung und Gleichrichterfunktion. Diese zuvor nur indirekt gebundenen Inhalte bleiben erhalten. |
| SN Sek I Klasse 9, gedruckte S.23/PDF-S.34 | pn-Modell, Halbleiter-SE mit I(U) und Gleichrichteranteil. Keine Übernahme sämtlicher Solarzellen-/Transistoranteile. |
| SN Sek II LK11 Wahlbereich 2, S.51/PDF-S.63 | Modell einschließlich Polung als Teilkomponente. `SE: Halbleiterdiode` behauptet keine ausdrücklich neue Kennlinienaufnahme; diese bleibt Sek-I-Vorwissen. |
| TH Sek I bzw. Sek-II-E-Brücke, gedruckte S.15/28 | pn-Leitung erklären. Aus benachbarten Bauelementexperimenten wird keine pauschale Diodenkennlinienpflicht konstruiert. |
| ST Sek I Jahrgang 9 | Grenzschichtbildung als explizite Teilkomponente; keine behauptete Volldeckung sämtlicher Bias-/Mess-/Gleichrichterdetails. |
| BW Sek I 3.3.2(9) | Elektronische Bauteile anhand Kennlinien untersuchen, Diode als Beispiel. Die eigene Diodenmessung ist eine partielle auswählbare Operationalisierung, keine Quelle für universelle Diodenwahl oder ausdrücklich geforderte Aufnahme. |

Breite Physik-/Quanten-/Festkörper-Vorfahrenmappings anderer Länder und bloßes Nennen von LEDs/Photodioden als Nachweisgeräten sind keine Belege für alle neuen Diodenkompetenzen. Die Vererbungsgrenze am Parent verhindert eine ungestützte 16-Länderbehauptung. Landesansichten bleiben Quellenunionen: NTG, NW-Zweig, Wahlthemen und TH-E-Brücke sind Quellenannotationen, keine neu implementierten Profilselektoren.

Alle nationalen Gesamt- und Stufensichten enthalten die drei Kinder. Landes-/Stufensichten erhalten ausschließlich die explizite Matrix in `physicsFinalDiodeViewPlacements.ts`; der Parent ist stets `prerequisiteOnly`, konkrete Kinder sind `goalEntry`-Targets. Die aktuelle Compile- und Runtime-Menge wird unabhängig bestimmt; `stage-delta.json` nennt jede tatsächliche Hinzufügung/Entfernung und die Hashes der vollständigen sortierten Zielmengen. Änderungen fremder Zielmengen sind verboten. Bereits vorher bestehende native Fehler werden separat berichtet und sind kein globales PASS.

## K, AM, Memory, P und Bilder

Die alte Parent-AM-/Memory-Zeile war eine pauschale Atomic-/No-memory-Entscheidung. Sie ist nicht auf Kinder übertragen, sondern im Autorenreceipt als Vorherzustand erhalten. Jedes neue Kind hat eine eigene zielspezifische AM- und Memory-Entscheidung. Parent, Kinder, neue Tasks und genau die geänderten K-Kontexte werden mit dem nativen Fingerprint gebunden; native geschlossene `decisionBasis`-Enums sind Klassifikation, nicht erfundene Humanfreigabe.

Die Karten-Originledger enthalten keine Parent-/Kinderbindung; es werden keine Karten gelöscht oder hinzugefügt. Die vorhandene Karte `physics_q4_c16` zum vorausgesetzten Bändermodell wurde gelesen und bleibt unverändert: sie ist kompakter vorgelagerter Recall, kein Ersatz für pn-/Mess-/Gleichrichterverständnis. Der Switch-AM-/Memory-Kompetenzkern ändert sich durch das engere `requires` nicht. Sein früheres P-Reviewinput muss wegen der Kontextkante dennoch neu geprüft werden; ein blindes Freigabelabel wird nicht kopiert.

Die drei neuen P-Profile formulieren individuell verständnisbezogene Erwartungen, beobachtbare Leistungen, physikalische Variationen und jeweils zwei neue unabhängige Fälle. Sie bleiben `needs_human_review`, `ai_candidate`, E1/G1. Native Schemaerfüllung behauptet weder fachliche Humanabnahme noch reale Lernendenleistung.

Die gute vorhandene Parentgrafik bleibt unverändert. Im ausdrücklich freigegebenen Pause-Abschluss wurden ausschließlich drei unveränderte Panels ihrer bereits geprüften repo-nativen SVG nachgenutzt. Es gab keinen Provider-Aufruf und keinen behaupteten fehlgeschlagenen Nano-Banana-Versuch. Nur das äußere SVG-Viewport wurde geändert; sämtliche inneren SVG-Bytes sind identisch. Autor und Root haben jedes vollständige Ergebnisraster tatsächlich gesichtet. `panel-reuse-receipt.json` bindet Quelle, Viewports und PNG-/SVG-Hashes; genau diese Raster liegen in Source/Public/Backend und sind zielspezifisch verlinkt. Die Kennlinie ist ausdrücklich schematisch und enthält keine realen Messdaten; kein Bild belegt Durchführung oder Leistung. Drei getrennte QA-Einträge tragen hashgebundenes Approved AI, keine Humanfreigabe und kein M7. `positive-panel-binding-receipt.json` dokumentiert die erneute tatsächliche Kompatibilitätsprüfung mit den unveränderten P-Profilkörpern.

## Transparente Korrektur der Zwischenbelege

Das historische `stage-delta.json` ist kein abschließender Global-PASS. Seine Bezeichnung der 60 CPV-009-Befunde an `85bbad98` als fremde/vorbestehende Fehler war falsch: Mein Autorenhelper hatte den bestehenden Q4-Aufgabencluster irrtümlich als curricularArea klassifiziert. A hatte ihn nicht neu aus einem Atom gesplittet. Der Fehler wurde in K auf practiceAssessment mit aktuellem Fingerprint korrigiert; alle 32 Kinder besitzen examData. A hat seine zwischenzeitliche Entfernung der 60 alten View-Referenzen vollständig CAS zurückgenommen. Keine solchen Referenzlöschungen bleiben Teil dieses Pakets. Die native Klassifikation ist jetzt 764 gesamt / 478 Inhaltsatome / 112 Inhaltscluster / 162 Assessmentknoten; andere Arten unverändert.

Auch `authoring-receipt.json.kindBefore` war durch eine nicht geklonte Objektreferenz beim ersten Lauf nachträglich mitmutiert und darf nicht als echte frühere K-Klassifikation verwendet werden. Parent-/Switch- und AM-/Memory-Vorherobjekte sowie Quellenbindungen sind gesondert gespeichert. Der Helper klont K-Vorherobjekte jetzt und erkennt reine Assessmentcluster ausdrücklich. Die historischen Receipts bleiben als Auditspur bestehen; aktuelle native Tests ersetzen ihre vorläufigen Global-/Hashbehauptungen.

Die nationale Goalbook-Navigation verwendet jurisdiction `DE`, nicht einen leeren Länderwert. Mein erster Diodenhelfer behandelte dieses nationale Kennzeichen irrtümlich wie einen unbelegten Landescode und ließ die drei Diodenkinder dort fehlen. Zusammen mit fünf ebenfalls fehlenden genehmigten Astrokindern ergab das 470 statt 478 Atlasziele. Exakt diese acht direkten Targets wurden ergänzend aufgenommen; keine anderen Ziel-IDs entfernt oder hinzugefügt. Der Diodenhelfer erkennt `DE` jetzt ausdrücklich als nationale Union. Der Goalbook-Generator verweigert veraltete publizierte Modelle ohne diese acht Kinder und unvollständige/duplizierte direkte Targets. Die historische 393→392-Nationalunion samt gepinntem Hash bleibt im Test erhalten; die aktuelle 408er-Union wird ausschließlich um acht Kinder und Verkehrssicherheit zurückgerechnet und um die drei früheren Elternatome ergänzt.

Ein weiterer eigener Testharnessfehler wurde offengelegt: Ein bloßer contains-Erreichbarkeitslauf nach der Runtimeprojektion zählt in sechs alten Sichten insgesamt 22 gespeicherte Support-Vorkommen mit, obwohl die unveränderte Runtime-Scope-API `compositionViewExposesGoal` sie ausdrücklich nicht als Targets exponiert. Der Test verwendet jetzt diese bestehende API zusammen mit der tatsächlichen Baum-Erreichbarkeit und dokumentiert die rohen Support-Differenzen separat. Es wurde kein Runtimecode und kein Validator geändert. Im tatsächlich ausgeführten korrigierten Lauf stimmen alle 70 vollständigen Compiler-/Runtime-Targetmengen überein, ohne native Compilefehler; alle zehn Sourcegeneratorläufe und sechs negativen Rollen-/Scopeguards bestehen. Nachfolgende zentrale Routenänderungen erfordern einen abschließenden Wiederholungslauf.

## Endgültige enge Routenintegration unter Pause

Der zentrale Konsolidierungsautor hat nach Root-Gegenlesen die drei bereits freigegebenen Aufgaben zusätzlich als direkte Kinder des vorhandenen Sek-I-Übungsclusters `21ab0854-4d67-5233-9495-ae208e152a3c` platziert; ihre Körper, Voraussetzungen und Singleton-Coverage blieben unverändert. In genau SL/SN/ST/TH GK/LK wurden die vorhandenen Ziele `df010b2b` und `7badac4d` innerhalb `physics-final-diode-seki` ausschließlich als prerequisiteOnly importiert. Anschließend wurden 18 direkte Modell-Aufgabenreferenzen sowie acht Referenzen auf die vorhandene Bandmodell-Aufgabe `1abfd5ef` ergänzt, weil die unveränderte native Routenprüfung diese aus den tatsächlich vorhandenen Voraussetzungen erwartet. Das verändert ausschließlich die bezeichneten Practice-Targets, keine zusätzliche Inhaltskompetenz und keine Originalquellenbehauptung. Seine separaten `pause-existing-diode-route-placement` und `pause-prerequisite-practice-placement`-Receipts im `physics100-traffic-flow-audit-v1`-Paket binden diese Schritte. Die Generator-Ownership ist auf die jeweiligen Wrapper, IDs und Rollen begrenzt; fremde Referenzen bleiben unverändert.

Der abschließende `final-validation-report.json` besteht auf diesem Stand: alle 70 vollständigen Compiler- und tatsächlichen Runtime-Targetmengen identisch, null native Compilefehler, zehn tatsächliche Sourcegeneratorläufe mit null Dateisystemwrites, sechs negative Rollen-/Stufengates, exakte Task-Reviewhashes sowie exakte Bildbytes. Die Generatorvergleiche schließen beide kontextgebundenen Support- und Practice-Erweiterungen ausdrücklich ein. Der native P-Check bleibt bei drei ehrlichen AI-Kandidaten, null Approved und null Blocking Issues.

Der native Curriculum-Status vom 2026-09-08T07:44:52.623Z meldet Physik M6, CQR-501 ohne aktive Warnungen und CQR-104 PASS mit sämtlichen Routenfehlern null. Die vier unverändert definierten Sek-I-Kennzahlen sind jetzt 6371 projizierte Routenziel-Vorkommen, 6136 profilselektierte Vorkommen, 235 durch den Profilselektor ausgeschlossene Vorkommen und 61 entsprechende eindeutige Ziele. Der Goalbook-Test übernimmt ausschließlich diese belegten Zahlen; keine Nullfehler-Bedingung oder Validatorsemantik wurde abgeschwächt.

`seki-backend-count-proof.json` enthält daneben den exakten HEAD/current-Vergleich der 20 vorhandenen Java-UI-Fixtures, inklusive aller hinzugefügten/entfernten IDs und Mengenhashes. Die unveränderten Backend-Methoden `getGoalProjection`, `resolveNodeType` und `computeAtomicStats` werden in einem separaten Read-only-Harness aufgerufen. Die 1758 relevanten HEAD-JSONs kommen konsistent aus demselben Commit; Produktivcode und Learnerzustand bleiben unverändert. Diese technischen UI-Atomic-Zahlen schließen Assessment-Leaves ein und sind ausdrücklich nicht der 478er Inhaltsatom-Nenner des Goalbooks.

## Reproduzierbare Prüfungen

Mit Node 20 und `app/node_modules/.bin/tsx`:

- `test-diode-package.mjs`: read-only; DAG/K/Taskcoverage, aktuelle Compiler-/Runtime-Sichtmengen, negative Rollen-/Stufengates und tatsächliche Sourcegenerator-Ausführung in einem in-memory Output-Dateisystem. Keine D/Registry-Schreiboperationen.
- Native `quality:positive-goal-evidence:check` mit `positive-evidence.config.json`.
- Native `quality:semantic-atomicity:check` und `quality:memory-card-review:check` mit den jeweiligen `canonical-physics-full.config.json`.
- Nach Abschluss paralleler Autorenpakete: vollständiger nativer Compile, regenerierter Curriculum-Quality-Status und unveränderte M6-Floorprüfung. Vorherige Fehler oder laufende fremde Fingerprints werden nicht wegdefiniert.

`prepare-authoring.mjs` und `prepare-views.mjs` dokumentieren die Mutation als minimale CAS-Diffs. Sie sind keine Erlaubnis, einen heutigen Zustand aus früheren Ganzdateien wiederherzustellen. Originale D048–D050 bleiben unberührt; keine Commits, Pushes, Deployments oder Registerabschlüsse.
