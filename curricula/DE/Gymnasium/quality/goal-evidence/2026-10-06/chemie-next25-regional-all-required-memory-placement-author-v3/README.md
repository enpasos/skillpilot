# BB/BE: vollständiger Kandidat für benötigte Memory-Platzierungen

## Ergebnis und Rollen

Dies ist ein **Autorenpaket für Datenplatzierungen**, basierend auf der zuvor unabhängig geprüften tatsächlichen Regionalsichtlücke. Es braucht eine andere unabhängige Sicht-/Placementprüfung vor aktiver Integration. Bestehende wissenschaftliche Memory-/Kartenentscheidungen werden unverändert wiederverwendet; die acht nativen Prüfläufe sind reproduzierte Techniknachweise, keine eigene unabhängige Freigabe des selbst geschriebenen Kandidaten.

Aus **allen 54 aktuellen memory_required-Zeilen** werden für jede echte BB/BE-GK/LK-CrossStage-Ansicht nur die Referenzen der dort tatsächlich sichtbaren Targetziele bestimmt. GK enthält je Land 30 solche Arbeitsziele, LK 32. In jeder dieser vier tatsächlichen Ansichten werden alle sechs bereits existierenden kanonischen Memoryziele benötigt. Es wird kein zusätzliches normales Fachziel sichtbar gemacht und kein Deck oder SRS-Ziel aus Lehrplanquellen erfunden.

| Tatsächlicher Scope | Vorhandene Targets | Kandidaten-Targets | Geprüfte sichtbare Memorypflichten | Fehlende Sichtpaare vorher → Kandidat |
| --- | ---: | ---: | ---: | ---: |
| DE-BB GK CrossStage | 148 | 154 | 30 | 30 → 0 |
| DE-BB LK CrossStage | 173 | 179 | 32 | 32 → 0 |
| DE-BE GK CrossStage | 148 | 154 | 30 | 30 → 0 |
| DE-BE LK CrossStage | 173 | 179 | 32 | 32 → 0 |

Die insgesamt **124 fehlenden Sichtpaare sind im Kandidaten 0**. Die frühere enge Zweideck-Teilstufe (16 gelöste / 72 verbleibende Paare) bleibt unverändert versiegelt in `chemie-next25-regional-memory-visibility-independent-a-v2`, Freeze `7b006e5770c1afdf52115fe79949470df40f4c6b0a7d455bfe44309691d40af2`.

## Echte native Materialisierung und minimaler View-Delta

Jede Original- und Kandidatenview wurde durch `compileCompositionView` und die reale Frontendfunktion `applyCompositionViewProjection` materialisiert. Native Zielrollen, die tatsächlich vom Root erreichbaren kanonischen Ziele, komplette kompilierte Bäume und fehlende/mehrfache Referenzen sind gespeichert. Alle acht Compilerstände haben 0 Fehler und 0 Warnungen; alle nativen Targets sind tatsächlich im projizierten Lernbaum erreichbar.

Pro View kommt genau **ein eigener Lernkarten-Strukturzweig** unter die unveränderte Chemie-Wurzel. Er enthält sechs `goalEntry`-Referenzen auf bestehende Memoryziele. Sämtliche ursprünglichen Wurzelkinder, ihre Reihenfolge, der ganze source-backed Fachzweig, Scope, View-ID und Landscape-ID sind exakt erhalten. Nur die tatsächlich benötigten Memoryreferenzen kommen als Targets hinzu. Die eigenen Hilfsmedien werden außerhalb des Zweigs `Lehrplanbelegte Chemie-Ziele` platziert; ihnen wird keine amtliche SRS-Lehrplanpflicht zugeschrieben.

Der aktuelle Kanon bleibt 479 ganze Ziele / 378 curricularAtomic-Ziele. Kanonische Ziele, `requires`, `contains`, Decks und Karten werden nicht geändert. Das ist eine vorhandene authored composition-view-Platzierung, keine Runtime-Automatik, Dummyview oder Scope-Whitelist.

## Sechs bestehende Decks, 55 unveränderte kept-Karten

| Vorhandenes kanonisches Deck | Karten |
| --- | ---: |
| de_gymnasium_chemistry_basics_seki | 13 |
| de_gymnasium_chemistry_bonding_structure | 9 |
| de_gymnasium_chemistry_organic_q1 | 10 |
| de_gymnasium_chemistry_natural_q2 | 5 |
| de_gymnasium_chemistry_equilibria_q3 | 11 |
| de_gymnasium_chemistry_energy_q4 | 7 |

Alle Source-/Frontend-/Backend-Deckkopien sind jeweils bytegleich. Alle 55 bestehenden Original-Cardreviewzeilen bleiben bytegleich, `kept`, `necessary: true`, mit gültigen unveränderten Herkunfts- und Deck-Fingerprints. Es gibt keine neue oder geänderte Karte, keine Removal-Uminterpretation und keine historische wissenschaftliche Karten-Neuprüfung.

`3bc48951-025c-5144-99b1-924db611a5f9` ist in allen vier Regionalsichten Target und runtime-erreichbar; im Kandidaten ist das tatsächliche Referenz-Memoryziel `1e519951-9850-5a07-ac82-d9f0075e3d05` ebenfalls dort Target und erreichbar. Die Originalkarte `chem_bond_008` desselben Atombau-/Bindungsdecks bleibt mit ihrer tatsächlichen Herkunft 3bc unverändert.

## Acht echte begrenzte native CLI-Prüfungen

Der unveränderte `memoryCardReview.ts` läuft mit dem vollständigen originalen Memoryscope über **378 normale Ziele, 54 memory_required / 324 no_memory_needed, sechs Memoryziele und 55 Karten**, pro Lauf aber nur der jeweils betroffenen echten Regionalsicht. Kein globaler Curriculum-/Buildlauf, kein Bootstrap oder Schreibflag.

- Original DE-BB GK/LK und DE-BE GK/LK: **4 × Exit 1**, echte fehlende sichtbare Memoryreferenzen.
- Die vier vollständigen Kandidaten mit der bereits unabhängig geprüften EN-only-Vervollständigung von 3bc: **4 × Exit 0**, keine fehlenden/stale/obsolete Goal- oder Cardreviewzeilen und keine fehlenden Memoryreferenzen.

Die vorhandenen wissenschaftlichen 3bc-Entscheidungen aus dem unveränderten unabhängigen A/M-Freeze `c3929f31789e4b50d883882765cc6beb4f3be68ed00582fce944e71c16920eac` werden für den identischen semantischen EN-Payload wiederverwendet. Nur diese eine Memoryreviewzeile ist im zukünftigen EN-Stand neu gebunden; alle anderen 377 normalen Zeilen sind unverändert. Die alte Zeile gegen neuen EN-Text bleibt stale, wie der vorherige unveränderte native Negativnachweis zeigt. Der genaue aktuelle und zukünftige native 3bc-Fingerprint ist in `all54-required-six-decks-55-cards-and-regional-native-visibility.actual.json` dokumentiert.

Zusätzlich beweist der direkte unveränderte native Sichtreport für die **originalen drei nationalen plus vier realen Kandidatenviews**: alle 54 Memorypflichten sind tatsächlich mindestens einmal abgedeckt; alle **248** ausgelösten Sichtpaare bestehen, Missing 0. Die alten drei Nationalviews allein werden weiter nicht als 3bc-Nachweis ausgegeben. Das ursprüngliche `visibilityScopeCoverageRequired` bleibt unverändert **unset**; die konkrete volle Abdeckung wird anhand der tatsächlichen Paare belegt, keine Policy wird gelockert.

## Konkrete zukünftige Configvarianten und offene Integration

`full378-memory.current-text-scope-only.future-active-config.author-candidate.json` erhält alle ursprünglichen aktuellen Review-/Cardpfade und fügt ausschließlich die vier tatsächlichen regionalen Sicht-Scopes hinzu. Diese Variante ist für eine separate Platzierungsintegration bei unverändertem aktuellen 3bc-Text vorgesehen.

`full378-memory.future-active-config.author-candidate.json` bindet denselben Scope-Delta und zusätzlich die exakt bereits unabhängig geprüfte 3bc-EN-Reviewzeile in `full378-plus-reviewed-3bc-EN.memory.review.author-candidate.jsonl`. Sie ist nur nach Integration des exakt überprüften EN-Payloads passend. Beide Varianten behalten den originalen Review-ID/Rule-Version/Rootscope/Cardpfad, alle anderen Policyfelder und die originalen drei Sicht-Scopes. Sie referenzieren die **wirklichen zukünftigen aktiven Viewpfade** und aktiven Canon; derzeit sind sie nicht operativ grün, weil diese aktiven Dateien noch unverändert sind. Native positive Tests binden stattdessen ehrlich die eingefrorenen isolierten Kandidaten-/Kanonpfade.

Der verwendete aktuelle Compilersnapshot ist ausdrücklich **nach** der parallelen geprüften BW-Quellenmetadatenintegration beobachtet (`4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6`). Ganze 25 Arbeitsziele, sechs Memoryziele, 18 Deckdateien und vier Originalviews werden gesondert geschützt. Die historische Kanonhashgleichheit vor dieser sachlich getrennten Integration wird nicht behauptet.

Andere Person muss den konkreten Daten-Platzierungskandidaten unabhängig prüfen, dann kann Root die tatsächlichen Views und passende M-Configvariante integrieren und die abhängigen nativen QS-Gates am stabilen Stand ausführen. Kein neues D/P/V-/Whole-Source-/M7-, Full-App-, Human- oder Learner-Akzeptanzurteil. Source-book-only-Sichten wurden nicht als Memory-Lernansichten ausgegeben. Alle eigentlichen Länder-, Quellen-, Stage-/Kurs- und Humanpflichten bleiben getrennt.

**Neue strenge Abschlüsse 0; aktive Bindungsrestaurierungen 0; Nettozuwachs 0.** Vier konkrete Datenfix-Kandidaten sind technisch vollständig vorbereitet, aber noch nicht unabhängig freigegeben oder aktiv integriert.
