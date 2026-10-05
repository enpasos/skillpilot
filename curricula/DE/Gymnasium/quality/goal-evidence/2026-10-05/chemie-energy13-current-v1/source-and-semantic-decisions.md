# Chemie Energy13: zwei aktuelle Text- und Quellenentscheidungen

Gezielte maschinelle Autoren-/QS-Entscheidungen vom 5. Oktober 2026 zu `2be9e61a-88ea-56fe-8294-ee46e3c9a8ef` und `b759d50d-0e82-5b10-89a2-fe5271106e50`. Die übrigen elf Texte des bestehenden inaktiven Energy13-Pakets wurden nicht geändert. Bestehende Kandidaten, historische Quellenreviews, A-/M-Ledgers, Karten und Bildnachweise bleiben erhalten. Dieses Paket behauptet keine aktiven D-/P-/V-Abschlüsse oder menschliche Prüfung/Freigabe/Erprobung.

## Tatsächlich geprüfte Quellen

Die amtliche lokale HE-PDF `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf` wurde im Originalfenster **Druckseite 36, E.4/E.5** gelesen. Cover: Ausgabe 2024; Impressum: **Stand 01.08.2025**. SHA-256: `3461259a623a78f0a18ad14f47eb284b1f29b866722edd5fd20186bbc862bbd1`. Die historische Download-URL von November 2024 ersetzt diese tatsächlich vorhandene Versionsangabe nicht.

- E.4#B01A01 verbindet Lagerstätten und Förderung mit Erdöl als begrenzter Ressource, Förderverfahren, Risiken für die Umwelt und geopolitischen Aspekten. Endlichkeit und Lieferabhängigkeit fehlten zuvor im operativen Zielsatz.
- E.4#B03A01 nennt exemplarische Vorkommen und Bedeutung von Methan, Propan, Butan und Isooctan. Die zu `2be9e61a` bestehende Kante ist nur partiell: Stoffbenennung, konkrete Anwendung und Octanzahl sind keine vollständige Leistung des Förderungsziels.
- E.5#B01A01 verlangt Brennstoffzellenfunktion/Elektrodenvorgänge, **Wasserstoff** als Energiespeicher und dessen Gewinnung durch Elektrolyse. Die Zellfunktion ist eine Energieumwandlung. Herstellung, Speicherverfahren und Effizienzbewertung sind bereits am gesonderten Ziel `93b914d4-747d-5b22-90ff-ac6320514b44` gebunden; die bestehende 1:n-Zuordnung bleibt ausdrücklich partiell.

Das unveränderte lokale strukturierte BY-Original `curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json`, SHA-256 `c67da7f4df2f135423ca9f3f20cd036d50b5371bc2ddb36f743bc9b375905227`, wurde für Kompetenz `10634734-3fee-5bac-80f0-b4cb3e3c5068`, **C10-HG_SG_MUG_WWG_SWG.5.7 / Sek I**, mit der persistierten Extraction verglichen. Gefordert sind Funktionsbeschreibung von Brennstoffzellen und geeignete Darstellung der chemischen Reaktionen. Der lokale Datensatz besitzt keinen datierten Ausgabe-/Versionsstempel; die unveränderten Datei-Hashes binden den tatsächlich geprüften Stand. `courseLevel: unspecified` ist hier keine Sek-II-GK-/LK-Aussage. Die ergänzte englische Reaktionsdarstellung stellt DE-/EN-Parität her. Rohes nationales `applicability` wird nicht als direkte BY-Quellendeckung gewertet.

Neue Quellenreview-Successors:

- `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-energy13-current-20261005-v1.review.json`: genau drei betroffene Quellenentscheidungen neu begründet; E.4#B01A01 bleibt exact, E.4#B03A01 und E.5#B01A01 bleiben partial. Alle Mappingkanten, Summaries und übrigen Entscheidungen sind unverändert.
- `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.m7-energy13-current-20261005-v1.review.json`: genau die direkt betroffene C10.5.7-Entscheidung neu begründet, ihre fachliche exact-Kante bleibt erhalten. Alle übrigen Entscheidungen und Mappings sind unverändert. Die alte Extraction-Pipeline-Statusbeschreibung wird nicht rückwirkend umgeschrieben.

## Aktuelles Rohstoffförderungsziel

DE: Die lernende Person kann Lagerstätten und Fördermethoden der Erdöl- und Erdgasgewinnung erläutern und dabei die begrenzte Verfügbarkeit, ökologische Risiken und geopolitische Abhängigkeiten begründet einordnen.

EN: The learner can explain deposits and methods of petroleum and natural gas extraction and give a reasoned account of finite availability, ecological risks and geopolitical dependencies.

**A: atomic, semanticAtomic=true.** Das begründete Förderungsmodell verbindet dieselbe Lagerstätte und Förderentscheidung mit endlichem Vorrat, konkreten Umweltpfaden und Ressource-/Lieferabhängigkeit. Die bestehenden zwei positiven Kandidatenfälle verändern Lagerstätte und Liefergrenze; sie verlangen eine gemeinsame kausale Einordnung. Eine reine Verfahrenliste, Länder-/Konfliktgesamtanalyse oder unabhängige Wirtschaftsroutine wird nicht eingeführt. Diese Entscheidung wurde anhand der neuen Kompetenz und Fälle getroffen, nicht aus der Tatsache abgeleitet, dass die amtliche Quelle einen Sammelbullet besitzt.

**M: no_memory_needed, memoryUseful=false.** Konkrete Vorräte, Importanteile und Förderbedingungen sind Fallmaterial. Auswendig gelernte Länderlisten oder Produktionszahlen tragen das Modellurteil nicht; eine neue Karte ist nicht erforderlich. Die bestehende fachliche Voraussetzung `dd58c029-176f-5d99-923e-1c1fda6cf58e` bleibt unverändert.

## Aktuelles Brennstoffzellenziel

DE: Die lernende Person kann die Vorgänge an den Elektroden einer Wasserstoff-Sauerstoff-Brennstoffzelle beschreiben, die ablaufenden Reaktionen geeignet darstellen und ihren Einsatz als Energiewandler mit Wasserstoff als gespeichertem Energieträger erläutern.

EN: The learner can describe the electrode processes in a hydrogen–oxygen fuel cell, represent the chemical reactions appropriately and explain its use as an energy converter with hydrogen as the stored energy carrier.

**A: atomic, semanticAtomic=true.** Elektrodenreaktionen, Reaktionsdarstellung und getrennte Ladungswege begründen dieselbe Gerätefunktion; die Speicher-/Umwandlerunterscheidung klärt ihre Systemgrenze. Eine zusätzliche selbstständig auszuführende Elektrolyse-, Speicher- oder Effizienzoptimierung wird nicht verlangt. DE/EN haben dieselbe Reaktionskompetenz. Die beiden gegebenen Kandidatenfälle tragen diese gemeinsame Funktionsklärung; ihr P-Review bleibt eine getrennte Prüfung.

**M: no_memory_needed, memoryUseful=false.** Die Reaktionsbilanz wird aus Reaktanden und Redoxmodell rekonstruiert. Auswendig gelernte PEM-Teilgleichungen ersetzen weder Ladungsweg noch Speicherrolle. Die bestehende Voraussetzung `f0939f88-a6af-5334-ac4d-5d54732af25a` verankert das Modell; kein neues Deck oder Sichtbarkeitsbedarf entsteht.

## Erhaltung und gezielte Checks

Beide Ziele bleiben autoritativ `curricularAtomic`; genau ihre zwei Source-Fingerprints wurden mit `fingerprintSemanticKindSourceGoal` aktualisiert. Aktuelle Menge: **376 curricularAtomic / 473 Gesamtziele**, unverändert. Eine neue substantielle Entscheidung wurde für genau zwei A-Zeilen und zwei M-Zeilen getroffen. Alle anderen Zeilen sind bytegleich übernommen, die vollständige Kartenreview ist bytegleich kopiert.

Aktuelle Konfigurationen unter `chemie-energy13-current-20261005-v1/`:

- `quality/semantic-atomicity/.../canonical-chemistry-ephase-fossil-fuels.config.json`
- `quality/semantic-atomicity/.../canonical-chemistry-ephase-mobile-energy-converters.config.json`
- `quality/memory-card-review/.../canonical-chemistry-full.config.json`

Die gezielten Checks bestanden: **A fossil 10/10, A mobile 3/3**, jeweils 0 fehlende/stale/offene/obsolete Zeilen. **M 376/376**, davon 54 memory_required und 322 no_memory_needed; 6/6 Memoryziele traced, 55/55 primäre Karten aktuell und kept, 124 Sichtbarkeitsprüfungen in drei Ansichten ohne fehlende Memoryknoten. Alle **473** semantischen Source-Fingerprints sind aktuell. Voraussetzungen und DAG wurden nicht verändert; von beiden Zielen aus wurde kein Zyklus gefunden.

Der gezielte Autorenstand-Abgleich gegen den bereits integrierten Stand `693872e8ea8663384281d06f61858b0f8fef332f` ergab bei den **58** streng registrierten Chemie-D-Zielen nach Berücksichtigung der bestehenden Withdrawals keine veränderten Zielobjekte oder individuellen kanonischen Kontexte. Beide neu bearbeiteten Ziele waren noch nicht streng registriert. `binding-impact.json.snapshot` bindet diesen Autorenstand vor separat verantworteten Bildimporten. Das ist keine vollständige D-/P-/V-Frischeprüfung und kein neuer zentraler Fortschrittsbericht.

Die zwei neuen Quellenreviews sind im Atlas-Input gebunden. Generator und `--check` bestanden mit unveränderten Grenzen: **376 kanonische, 358 im Quellenatlas veröffentlichte curricularAtomic-Ziele, 48 Quellenansichten, 496 unresolved Source-Scope-Entscheidungen, 18 ausgelassene Ziele**. Alle generierten Outputbindungen bleiben unverändert; nur die aktuelle Quellen-/Input-Receipt wurde neu gebunden. Der Quellenatlas ist ein ausdrücklich belegter Teilumfang, kein umbenannter zentraler 358er Nenner. `atlas-preexisting-scope.snapshot.json` nennt die 18 Ziel-IDs, Gründe und bestehende Scope-Liste. Diese Altlasten wurden weder geschlossen noch durch eine Grenzanpassung entfernt.

`additional-source-bindings-traced.snapshot.json` hält weitere bestehende Teilmappings nachvollziehbar fest. Zahlreiche alte Brennstoffzellen-Teilbindungen beziehen sich auf breite Grund-/Anwendungsinhalte; einige betreffen HCl, organische Kohlenwasserstoffe oder Wasserstoffbrücken und belegen keine direkte vollständige Brennstoffzellenkompetenz. Ihre unveränderte Existenz wird hier nicht als neue fachliche Freigabe behauptet. Es erfolgte kein Neustart historischer Massenreviews.

## Offene Integration und Abschlussgrenze

Zwei unabhängige aktuelle D-Reviews mit aufgelösten Befunden, fachlich geprüfte P-Materialisierung und aktuelle V-Freigaben bleiben separat erforderlich. Bestehende gute Bilder werden erhalten; die belegte Brennstoffzellen-Bildkorrektur und der fehlende Blei-Akku-Nachweis liegen beim Integrationsverantwortlichen. Dieses Paket importiert keine Bilder und aktualisiert keine V-QA/Registry/In-flight-Claims. Nach Bildimport kann die Quellenatlas-Receipt erneut ihren aktuellen kanonischen Input binden; unveränderte fachliche Nachweise werden dadurch nicht neu geprüft.

**Strenger Nettozuwachs dieses Autorenpakets: 0. Neue fachliche Fünf-Gate-Abschlüsse: 0. Wiederhergestellte strenge Bindungen: 0.** Die vollständige zentrale QS sowie App-/Lernzielbuch-Builds wurden nicht ausgeführt. Menschliche Release-Gates bleiben getrennt; eigene Entscheidungsdokumentation wird gemäß `LICENSING.md` als CC-BY-4.0-Inhalt eingeordnet, ohne amtliche Quellen neu zu lizenzieren.
