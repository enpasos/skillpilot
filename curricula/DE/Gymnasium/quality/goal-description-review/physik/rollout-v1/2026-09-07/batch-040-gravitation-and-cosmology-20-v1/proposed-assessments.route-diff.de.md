# Physik B040: konkrete Routenfolgen der beiden engen Klausurvorschläge

Nur Untersuchung und Folgeaufgabenplan, keine aktive Umstellung. Primärer maschinenlesbarer Beleg: `proposed-assessments.route-diff.json`, beobachtet am 2026-09-07T01:28:51.741Z, SHA256 `da49296c44d6994b03b1e03a6193f55a5b4fe488b30bc3c8489b9db380eb091b`.

## Ergebnis und genaue Bedeutung

Bei Umsetzung des vorliegenden Splitplans **und** der beiden engen Klausur-Scope-Listen verlieren **20 bestehende Q4-Inhaltsziele ihren letzten strukturellen Sek-II-Terminalpfad**. Direkte und effektive native Routenprüfung liefern dieselbe Liste. Außerdem verlieren zwei Q3-Voraussetzungen nur ihren zusätzlichen Q4-Endpunkt, behalten aber einen Q3-Endpunkt. Die neuen Ziele DM und DE haben noch keinen Terminalpfad. S und G haben nach dem derzeitigen Splitplan zwar einen Terminalpfad, aber keinen Motivationspfad.

Das ist keine schon eingetretene Qualitätsabsenkung: Alles wurde auf Speicher-Kopien berechnet. Die beiden aktuellen ersetzten Aufgaben sind selbst unbelegte Platzhalter. Ihre Entfernung kann daher keinen aus diesen Texten tatsächlich nachgewiesenen Kompetenznachweis vernichten; sie entfernt aber reale **Graphkanten**, die der gegenwärtige CQR-Routencheck als strukturellen Nachweis zählt. Diese Unterscheidung legitimiert weder eine stille M6-Absenkung noch ein Wiederanfügen ungeprüfter Abdeckungslisten.

## Vorgehen und Prüfumfang

Der Helper `proposed-assessments.route-audit.mjs` liest die unveränderte Kanonik, das aktuelle K-Ledger und den vollständigen JSON-Splitplan. Er transpiliert die folgenden **unveränderten nativen Funktionskörper** aus `app/scripts/generateCurriculumQualityStatus.ts` ausschließlich im Speicher und ruft sie auf: `isAtomicGoal`, `parseReference`, `buildParentByChild`, `buildDirectRequiresEdges`, `buildAtomicDirectRequiresEdges`, `buildEffectiveRequiresEdges`, `createPathChecker`. Die fünf Physik-Sek-II-Terminalcluster stammen ebenfalls direkt aus dessen Konstante. Der Gesamtgenerator wird nicht importiert oder ausgeführt; es gibt keine neuen QA-Snapshots.

Native CQR-101/102-Bedingung ist hier ein rückwärts erreichbarer `requires`-Pfad zu einem atomaren direkten Kind der fünf konfigurierten lokalen E-/Q1-/Q2-/Q3-/Q4-Übungscluster. CQR-101 berücksichtigt geerbte Cluster-Voraussetzungen, CQR-102 nur direkte Blattvoraussetzungen. `examData.coveredGoalIds` ist für diesen Routenalgorithmus **keine Ersatzkante**. Eine tatsächliche Inhaltsprüfung liefert der Algorithmus nicht. Der zusätzliche Q4-only-Vergleich ist strenger als die gesamte native Sek-II-Profilbedingung und wird nicht mit ihr verwechselt.

Die Ausgangslisten enthalten 14 und 65 IDs, zusammen 71 eindeutige IDs. Davon bleiben 67 im vorgeschlagenen Zustand `curricularAtomic`; drei alte Sammelblätter würden Cluster, und `70b358bf-da6d-53ba-8393-51d5c2365b04` ist schon jetzt autoritative `orientation`, kein zu prüfender Inhaltskompetenz-Nachweis. Geprüft wurden sämtliche 469 zukünftigen curricularAtomic-Kandidaten auf direkte und effektive Terminalpfade, nicht nur die 71 expliziten Alt-IDs. Alle 47 anderen lokalen Assessments wurden mit ihren Kanten und Abdeckungslisten abgeglichen. Das JSON enthält die vollständige Matrix der 67 weiterbestehenden expliziten Altziele sowie zusätzliche betroffene/neue Ziele und das Inventar der 47 anderen Klausuren.

Drei Szenarien sind getrennt dokumentiert: heutige Kanonik; Split allein mit den alten Klausurlisten als **nur diagnostischem, nicht übernahmefähigem** Zwischenstand; Split plus beiden engen Klausuren. Alle unten aufgeführten 20 Ziele haben auch im Split-allein-Zwischenstand noch ihren alten Klausurpfad und verlieren ihn durch die enge Ersatzabdeckung. Die neuen DM-/DE-Lücken bestehen schon im Split-allein-Zwischenstand. Prospektive Kindarten sind Annahmen des Vorschlags, keine geschriebenen K-Entscheidungen.

## Die 20 konkreten bestehenden Endpunktverluste

`A` bezeichnet die alte Klausur `335a75b0-f691-5867-8ce3-3c971d541b9f`, `B` die alte Klausur `4a58df57-f791-502f-8b8d-9ba155e46035`. „Bisher“ listet sämtliche bislang verbleibenden strukturellen Sek-II-Endpunkte für das jeweilige Ziel. Nach dem Vorschlag gibt es jeweils keinen anderen direkten oder effektiven Sek-II-Terminalpfad und keine direkte `coveredGoalIds`-Nennung in einem der 47 übrigen lokalen Assessments.

| Vollständige Goal-ID | Kompetenz | Bisher | Fachlich begründeter Folgeaufgabenbedarf |
| --- | --- | --- | --- |
| `a359c859-eee0-40ef-a9d1-88db2e6c55b2` | Photon und Elektron als Quantenobjekte | B | Konkrete Photon- **und** Elektronenexperimente mit Wellen-/Teilchenevidenz; nicht nur ein Elektron im Kasten. |
| `defe44d2-c3d3-456b-a786-fad2cef13fe8` | Bedeutung und Reichweite der Modelle | B | Im selben passenden Quantenexperiment die jeweiligen Erkenntnismöglichkeiten und Grenzen beider Modellbilder begründet vergleichen. |
| `f6e5929f-d52a-42a4-a5d2-ff498ee7083f` | Unbestimmtheit begründen und Bahnbegriff begrenzen (LK) | B | LK-Teil mit tatsächlicher qualitativer Begründung und Folgerung für den Bahnbegriff; bloßes Formulieren der Unbestimmtheit reicht nicht. |
| `512f81af-1480-56a8-ae52-af3aa1a6a859` | Michelson–Morley historisch einordnen | B | Historisches Erwartungs-/Nullbefundmaterial samt begrenzter Beweiskraft; GPS-Zeitrechnung prüft diese Kompetenz nicht. |
| `0c305cf9-3923-51cf-a9ae-5849edc99c9f` | Längenkontraktion erläutern | B | Bezugssystemgebundenes Längen-Gedankenexperiment plus qualitativer experimenteller Bezug; nicht durch Zeitdilatationsrechnung ersetzen. |
| `2239cb67-82cb-585f-ab82-e1f2510eb4f7` | Relativistische Geschwindigkeitsaddition (LK) | B | Konkrete kollineare Transformation mit überprüftem Grenzfall. |
| `bfea7a23-1ce1-4a42-badd-1fc9bf30124a` | Masse–Ruheenergie-Äquivalenz (LK) | B | Physikalische Interpretation von E₀=m₀c² und invarianten Massen, gegebenenfalls in demselben begrenzten Teilchenkontext; reine Lorentzfaktor-Rechnung genügt nicht. |
| `206fe51d-cc78-5422-b139-32cc97eb1c37` | HR-Diagramm (LK) | A, B | Tatsächliche Leuchtkraft-/Temperaturdaten und Regionen Hauptreihe, Riesen, Weiße Zwerge. |
| `4c5c7cb1-f238-52c8-b82c-159c6c299c0e` | Energieumwandlung in der Sonne (LK) | A, B | Proton-Proton-Reaktionskontext mit Energiegewinnung; die Rolle der Sonne im Sonnensystem ist kein Ersatz. |
| `6f896466-e0ec-5f8d-82ad-2890433c82ba` | Sterntypen und Entwicklung (LK) | A, B | Lebenswege unterschiedlicher Sterntypen mit passenden Bedingungen; HRD und Solarenergie können einen kohärenten Sternentwicklungssatz bilden, aber jede Teilkompetenz braucht eine echte Aufgabe. |
| `aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745` | Quantitative kosmologische Rotverschiebung (LK) | A, B | Spektraldaten, z-Berechnung, explizit gegebenes einfaches Expansionsmodell und dessen Näherungen. Die neue qualitative B2-Aufgabe beansprucht dies nicht. |
| `db6b8de4-21e0-58e8-a347-2ae39f538f92` | Entfernung/Leuchtkraft aus Beobachtungen (LK) | A, B | Quantitative Distanz-/Leuchtkraftdaten mit passender Beobachtungsmethode; eine vorgegebene Universumsgröße ist keine Entfernungsbestimmung. |
| `b3f3f4f7-b5cc-40e1-b57a-3d93649baa61` | Elementare Materiebausteine ordnen | B | Konkrete Quark-/Lepton-Strukturaufgabe; der bestehende Standardmodell-Klausurtext ist ein Platzhalter und nicht automatisch ein neuer Beleg. |
| `333ca92b-a92c-46a9-86be-dea8ddbd43e0` | Kontinuität, Strömungsgesetze, Reynolds-Zahl (LK) | B | Erst die breite Inhaltsgrenze fachlich klären, dann einen realen Strömungskontext mit tatsächlich passender Verfahrensauswahl authoren; nicht an eine Kosmologieklausur anhängen. |
| `ba16948b-5e07-54af-b77b-776e677c6906` | Gravitations- und elektromagnetische Wellen vergleichen | A | Konkretes Multi-Messenger-Beobachtungsszenario mit gemeinsamen und unterschiedlichen Eigenschaften. |
| `da3169ae-c72a-5782-ad95-408167a5c6da` | Stabilität astronomischer Objekte | A | Gleichgewicht/Veränderung von Gravitation und Druckgradientkräften an einem wirklich beschriebenen Sternobjekt. |
| `5b8eaf71-96fe-50eb-b9ea-a8fa392df086` | Exoplaneten-Nachweise | A | Transitlichtkurve und Radialgeschwindigkeitsbeobachtung, jeweils mit Methodenerklärung; reine Planetenbahn genügt nicht. |
| `e28381b4-50ef-5cac-bfa4-b7c8e03aef82` | Planetenatmosphären mit Spektren | A | Attributierbare Atmosphärenspektren und Erläuterung ihres Erkenntniswegs, gegebenenfalls eng mit der Exoplanetenaufgabe verbunden. |
| `14ec85b9-68f6-5400-ad43-5e8dddfddf44` | Ausgewähltes Forschungsgebiet beschreiben (LK) | B | Ein Forschungsgebiet und zugehöriges belastbares Material tatsächlich auswählen; nicht jeden allgemeinen Kosmologietext als „aktuelles Forschungsgebiet“ etikettieren. |
| `5c0d5040-92e4-50f6-9695-9d33d889a080` | Physikalische Methoden im Forschungsgebiet (LK) | B | Im gewählten Gebiet ein konkretes Transferproblem bearbeiten lassen, dessen verwendete Methode und Erwartungslösung angegeben sind. |

Diese Liste beschreibt den Folgeaufgabenbedarf, **nicht** einen Auftrag, jetzt zehn weitere Klausuren zu erzeugen oder die aufgezählten Ziele pauschal in vorhandene Klausuren einzutragen. Der gemeinsame Aufgabenrahmen darf nur dort gewählt werden, wo er die Physik trägt. GK- und LK-Pflichtteile sind zu trennen.

## Weitere Abgrenzungen

- `c14857d3-634f-4a59-9a3f-8d0638fc5784` (Q3, Spektralanalyse/diskrete Energiezustände) verliert den zusätzlichen Q4-Pfad über A, behält strukturell `a94f9b05-ecb1-5a13-8364-44c1c98be8e4`.
- `ea2d5085-4ec1-5e33-87e0-15edcad635bf` (Q3, Spektrallinien) verliert ebenfalls den Q4-Pfad über A, behält `23530be9-66b6-57d7-9ff8-0c55dd5b1295` und `a94f9b05-ecb1-5a13-8364-44c1c98be8e4`.
- Beide gerade genannten Q3-Klausurtexte wurden vollständig gelesen und sind ihrerseits generische Vier-Aufträge-Platzhalter. Daher lautet die Aussage bewusst **strukturell behalten**, nicht „echte fachliche Prüfung gesichert“. Die neue B2-Spektraltabelle verlangt keine Erklärung diskreter atomarer Energien und nimmt diese Q3-Ziele nicht als eigene Abdeckung auf.
- Astronomische Beobachtungsmethoden `2b700858` und Einheiten/Größenordnungen `7c986fca` bleiben über die neuen B-/U-Voraussetzungen strukturell angebunden, werden in den neuen Klausuren aber nicht als vollständig geprüfte eigene Ziele ausgewiesen. Der Unterschied zwischen bloßer Vorbereitung und explizit geprüftem Inhalt bleibt erhalten.
- Die drei ehemaligen Sammelblätter c940/e5/5db werden nach dem Plan `curricularArea`. Ihr alter Blattstatus darf weder als zusätzliche Lücke noch als automatische Kindbeherrschung fortgeschrieben werden. Orientierung `70b358bf` wird ebenfalls nicht als Inhaltsmastery gezählt.

## Tatsächlich gelesene verbleibende Q4-Prüfungen

Alle sieben anderen Q4-Klausuren wurden vollständig einschließlich Aufgaben, Materialien, Lösungen und Punkte gelesen; ihre inhaltliche Tragfähigkeit wurde nicht aus Titel oder `released` abgeleitet:

| Klausur | Tatsächlicher Befund im hier relevanten Vergleich |
| --- | --- |
| `b585ff81-6332-5d11-ae63-ee6a9928c00d` | Konkreter Elektron-Potenzialtopf mit 0,50 nm, Wahrscheinlichkeitsdeutung, Unbestimmtheit und Messproblem. Inhaltliche Nähe zu Quantenfragen ist vorhanden. Aber Photon-/Elektronenvergleich fehlt; Aufgabe 3 verlangt Formulierung statt der vollständigen Begründung samt Bahnfolgerung des verlorenen f6-Ziels. Deshalb keine automatische neue Vollabdeckung dieser drei Ziele. |
| `a3e22e70-6629-5c74-a8ae-a8c4f55c72a0` | Laser/Tunnel-Anwendungen: gleicher abstrakter Vier-Aufträge-Platzhalter ohne konkrete Daten. |
| `4daef009-6425-526a-8574-4fa75f28f946` | Konkrete Halbwertszeit-/Abschirmungsaufgabe mit 320 kBq, 6 h, 18 h und vorgegebenem Intensitätskriterium. Kein Ersatz für die 20 entfallenden Inhaltsziele; eine fachliche Strahlenschutz-Freigabe der Klausur wird hier nicht erteilt. |
| `5a5bc118-4420-5bb7-94c3-67837f2ce0dd` | Kernreaktionen/Kernmodelle: abstrakter Vier-Aufträge-Platzhalter. |
| `15cb40f1-e2d3-5754-9e7b-e8888fe78340` | Standardmodell/Teilchenphysik: abstrakter Vier-Aufträge-Platzhalter; keine heimliche b3-Abdeckung ergänzen. |
| `f532c772-7b6e-59aa-ad65-e0eeafc3767f` | Konkretes Satelliten-Zeitdilatations-/Signallaufzeit-/GPS-Beispiel. Keine Michelson–Morley-Geschichte, Längenkontraktionsbelege, Geschwindigkeitsaddition oder Ruheenergieinterpretation. |
| `0f5346d6-de1b-5e38-aaba-68db205e594b` | Festkörper/Halbleiter: abstrakter Vier-Aufträge-Platzhalter. |

Das bestätigt, weshalb eine existierende andere Q4-Überschrift die 20 verlorenen strukturellen Routen nicht fachlich rettet. Für die übrigen E-/Q1-/Q2-/Q3-Inventartexte wird keine neue vollständige semantische Abnahme behauptet.

## Neue Splitziele und verbleibende Übernahmesperre

DM `3d466956-04fb-58d7-9008-ad8090f8706d` und DE `b4772b06-b10c-52dd-841b-a96ffb7c7e28` brauchen eine gesonderte konkrete qualitative Evidenzaufgabe: Gravitationshinweise auf zusätzliche nicht leuchtende Materie einerseits, beschleunigte Expansion als anderer Modellbegriff andererseits. Keine Rotationskurvenrekonstruktion oder quantitative Kosmologie als unangekündigte Voraussetzung.

S `af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93` ist derzeit im Plan voraussetzungsfrei; G `1b060e79-dc2d-5e4e-abb5-42eca39f9cc7` erfordert nur S. Daher erreichen beide den vorhandenen Motivationsanker `5c44b9ba-9b05-4774-95d5-073230d3fc4f` nicht. Ein später ausdrücklich authorisierter Motivationsanker-Bezug von S könnte diese beiden Segmente schließen, ohne Kepler als fachliche Vorbedingung einzuführen; dieser Bericht schreibt die Kante nicht.

Die zunächst auf HE begrenzte Anwendbarkeit der neuen Klausuren verlangt zusätzlich einen eigenen projektionslokalen Composition-/CQR-104-Nachweis. Dieser Bericht berechnet die aktuellen nativen globalen Sek-II-Routen und Q4-Untermenge, nicht eine hypothetische bereits fertige Landes-Composition. Ebenso sind neue `needs_review`-Aufgaben noch nicht operativ freigegeben.

**Übernahme erst nach** den notwendigen konkreten Folgeaufgaben, dazu passenden minimalen Kanten/Abdeckungen, geklärter Motivation und Sichtbarkeit sowie nativen Qualitätstests mit unverändert geschützten M6-Floors. Keine unechte Breitklausur, keine bloße Fingerprint- oder Schwellenanpassung als Ersatz.
