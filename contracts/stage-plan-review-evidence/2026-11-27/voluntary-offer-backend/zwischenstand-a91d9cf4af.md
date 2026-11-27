# Zwischenstand der Prüfung auf a91d9cf4af

Der erste Testcommit `bdf3bc5f2b` setzt auf `8bf30f868d` auf. Die Prüfungen lesen die tatsächlichen Repository-Ansichten, importierte Pakete und gespeicherte Pläne. Angebote für die neuen Fälle stehen in den Backend-Testressourcen. Die produktiven Lehrpläne enthalten weiterhin null freiwillige Einträge.

## Verhalten auf der Basis

| Prüffrage | Ergebnis |
| --- | --- |
| Welche Voraussetzungen und Ziele zählen? | Alle 387 bisherigen Ansichten liefern dieselben Identitäten für Ziele, Voraussetzungen und abgeleitete Lernmenge wie die Referenz aus VR1. |
| Welche Karten zählen für den Deckabschluss? | In 2.355 lesbaren Deck-/Ansichtskombinationen stimmen die abgerufenen Karten-IDs mit der unabhängig ermittelten Menge überein. 63 Kombinationen treffen auf schon zuvor nicht verfügbare Deckquellen. Darunter sind drei Kandidaten und fünf Wirtschaftsdeck-Dateien mit `_recall`. Die Prüfung erfasst diese Fehler als eigenen Ausgangszustand. |
| Wann wird eine Karte zu einem Ziel außerhalb des Lernumfangs frei? | Im installierten Mathematikpaket sind `math_seki_c03` und `math_seki_c04` anfangs frei. In der Brandenburger Repository-Ansicht gehört das Verständnisziel zur Voraussetzung eines Pflichtziels, beide bleiben gesperrt. Im hessischen Vergleich ist `math_seki_c10` von Anfang an frei. |
| Was bleibt bei Speicherung und Wiederherstellung erhalten? | Ein gespeicherter Abschnitt erhält durch spätere Katalogergänzungen keine weiteren Atome. Die ausdrückliche Einzelwahl bleibt in den historischen GK-/LK-Fällen erkennbar. Lesezugriffe bewahren die gespeicherten Blockdaten und die Revision. Die Kartenprüfungen erfassen auch wachsende Decks, frühere Ergebnisse und den signierten Export/Import. |

Der erste gemeinsame Lauf enthält den fehlgeschlagenen Paritätsfall, der lesbare Decks für alle Kombinationen voraussetzte. Der Einzellauf prüft die 63 bereits auf der Basis ausgelösten Lesefehler getrennt. Beide Protokolle sind mit ihren unveränderten Ergebnissen gebunden. [Erstlauf](baseline-first.json) · [Wiederholung](baseline-parity.json)

## Prüfung der aktiven Ansichten

Die Curriculumvalidierung prüft alle 12.827 Dateien mit Endung `.view.json` unter `curricula/`, darunter 600 Dateiverweise. Die 387 aktiven Ansichten werden zusätzlich nach dem Kompilieren geprüft. Der Java-Test erzeugt die tatsächlichen kombinierten Kursansichten. Eine Testansicht mit einem einzelnen freiwilligen Eintrag muss am jeweiligen Curriculumprüfer scheitern. [Prüfprotokolle](curriculum-guard.json)

## Nachfolgende Qualitätsregeln für VR4

- Der Auftakt einer deklarierten Lerneinheit muss innerhalb des Pflichtwegs verfügbar sein.
- Hat ein Deck in einer Ansicht ausschließlich Karten, deren Verständnisziele freiwillige Angebote sind, muss auch das Deckziel dort freiwillig sein. Ein reguläres Deck mit leerer zählender Kartenmenge darf keinen Abschluss liefern.

Die vollständigen Gradle-Protokolle, JUnit-Dateien und Protokolle der Negativkontrollen liegen außerhalb der Versionsverwaltung. Die JSON-Belege nennen relative Namen, Prüfsummen und die Zahl der ausgeführten Fälle.

## VR2a · Lernumfang und gespeicherte Pläne

Die Unterrichtsrolle wird in der Projektion einmal je gewählter Sicht ermittelt. Die Zwei-Kurs-Prüfung misst den Vorrang der benötigten Rolle und die tatsächlichen Ursprungssichten. Ein Land kann ein eigenes Angebot ohne amtliche Landeszuordnung am ausgewiesenen Lernort anzeigen. Das Angebot vergrößert den fachlichen Nenner auch dann nicht, wenn zu seinem Vorwissen Mathematik gehört.

Ein Abschnitt erfasst seine regulären Leistungen. Eine ausdrücklich bestellte freiwillige Leistung zählt im eigenen Plan. Der signierte Wiederherstellungstest liest sowohl frühere Abschnittserfassungen als auch Einzelwahlen unter den aktuellen Rollen. Alte Blöcke können die geordnete Liste einzelner Atome ohne eine Abschnittswurzel speichern. Dort bleibt jedes genannte Atom eine Einzelwahl. Endet die letzte Pflicht eines historischen Abschnittsauftrags, bleibt der Plan lesbar und hat kein nächstes Planziel.

Der erste Prüflauf deckte zwei Fehler auf. Der Landesfilter verwarf ein ausdrücklich angebotenes Atom. Außerdem behandelte die Abschlussprüfung die Einzelwahl des Plans wie einen zu zertifizierenden Auftrag. Der zweite Prüflauf zeigte einen historischen Auftrag, der nach dem Wegfall seines letzten Pflichtziels noch ein allgemeines Fachziel zum Fortsetzen anbot. Der gemeinsame Lauf nach diesen Korrekturen bestand 120 Fälle. Die sechs Planfälle einschließlich der älteren reinen Atomliste bestanden anschließend zusammen. [Erster Prüflauf](vr2a-first-scope-plan.json) · [Zweiter Prüflauf](vr2a-repaired-plan-package-02.json) · [Gemeinsamer Prüflauf](vr2a-plan-and-roles-final.json) · [Projektionsprüfungen](vr2a-projection-roles-01.json) · [Alte Atomlisten](vr2a-legacy-atom-list.json)

### Negative Kontrollen

Die veränderte Anweisung und die betroffene Testmethode sind unten aufgeführt. Die genauen Ersetzungen, beobachteten Fehler, Prüfsummen und externen XML-Dateien stehen im maschinenlesbaren Beleg. Der unveränderte Spring-Kontrolllauf bestand mit 449 geladenen Skill-Landschaften. Frühe Scratch-Läufe, in denen die Dateisuche aufgrund eines Verzeichnislinks null Skill-Landschaften lud, wurden als Nachweis verworfen und mit dem tatsächlichen Katalog wiederholt. [Java-Kontrollen](java-negative-controls.json)

| Regel | Veränderung am geprüften Code | Fehlgeschlagene Testmethode |
| --- | --- | --- |
| Eine Sicht kann ein Angebot außerhalb der amtlichen Landeszuordnung am angegebenen Lernort ausweisen. | `!compositionStructuralGoals.containsKey(id) || targetGoalIds.contains(id)` verändert | `historicalPlanReadsTheCapturedSelectionUnderTheCurrentRole` |
| Die freiwillige Rolle gilt nur für einen direkten atomaren Eintrag. | `throw new IllegalStateException("Voluntary projectionRole requires an atomic goalEntry");` verändert | `aVoluntarySubtreeCannotMakeItsDescendantsOffers` |
| Pflichtbasis und fächerübergreifende Voraussetzungen bleiben gleich, wenn in der Sicht ein Angebot hinzukommt. | `if (seeds.isEmpty()) return projection;` verändert | `foreignPrerequisiteOfOfferNeverExtendsRequiredScopeWithOrWithoutMathematics` |
| Das angegebene Atom bleibt an seinem Lernort sichtbar. | `visibleGoalIds.addAll(voluntaryPlacement);` verändert | `source13OfferIsVisibleButExcludedFromSubjectTotalsAndRequiredClosure` |
| Ein Angebot benennt jede seiner tatsächlichen Ursprungssichten. | `result.computeIfAbsent(id, unused -> new LinkedHashSet<>()).add(sourceId);` verändert | `combinedCourseUsesTheStrongerRoleAndAttributesOnlyTheSurvivingOfferToItsSource` |
| Ein importiertes 1.4-Paket erhält einen Abschnitt, der ausschließlich Angebote enthält. | `if (targetGoalIds.isEmpty() && voluntarySources.isEmpty()) {` verändert | `runtime14ImportsVoluntaryViewAndRetainsExistingMaterialAndLearningUnitSchemas` |
| Dient das anderswo angebotene Atom einem Pflichtziel als echte Voraussetzung, gilt seine erforderliche Rolle. | `effectiveVoluntarySources(projection.voluntarySourceViewIdsByGoal(), targets)` verändert | `independentlyRequiredAtomSupersedesAnOfferInTheOtherSelectedView` |
| Im zusammengeführten Kurs hat ein reguläres Ziel Vorrang vor Vorbereitung und Angebot. | `return left.compareTo(right) >= 0 ? left : right;` verändert | `combinedCourseUsesTheStrongerRoleAndAttributesOnlyTheSurvivingOfferToItsSource` |
| Der fachliche Pflichtnenner zählt die Angebote nicht mit. | `.filter(id -> !projection.voluntaryGoalIds().contains(id))` verändert | `source13OfferIsVisibleButExcludedFromSubjectTotalsAndRequiredClosure` |
| Ein signierter Import rekonstruiert den damaligen Auswahlgrund. | `LearnerPlanningScopeResponse scope = getPlanCaptureScope( learner.getSkillpilotId(), landscapeId, portableBlo…` verändert | `historicalPlanReadsTheCapturedSelectionUnderTheCurrentRole` |
| Eine Einzelwahl ist im fachzugehörigen Plan prüfbar. | `Set<String> candidates = projection.targetGoalIds(); if (blocks != null && !blocks.isEmpty()` verändert | `sectionCountsRegularWorkAndOnlyAnExplicitAtomAddsTheOfferToThePlan` |
| Bei historischer Entdoppelung erhält der spätere Block die dort ausdrücklich gewählte Leistung. | `if (entry.getValue() < i && selected.contains(entry.getKey())) ids.add(entry.getKey());` verändert | `historicallyDeduplicatedOfferMovesToTheLaterBlockThatChoseItExplicitly` |
| Ein früherer Abschnittsauftrag ohne verbleibende Leistung hat kein nächstes Planziel. | `scope.goalIds().isEmpty()) return Optional.empty();` verändert | `historicalPlanReadsTheCapturedSelectionUnderTheCurrentRole` |
| Die persönliche Einzelwahl zählt im Plan. | `omitted.removeAll(roots);` verändert | `sectionCountsRegularWorkAndOnlyAnExplicitAtomAddsTheOfferToThePlan` |
| Das als Fokus gewählte Atom wird in die Planauflösung übernommen. | `if (root != null && projection.voluntaryGoalIds().contains(root)) return List.of(root);` verändert | `sectionCountsRegularWorkAndOnlyAnExplicitAtomAddsTheOfferToThePlan` |
| Wird ein ehemals reguläres Ziel freiwillig, entfällt es im impliziten Abschnittsauftrag. | `if (id != null && offers.contains(id)) omitted.add(id);` verändert | `historicalPlanReadsTheCapturedSelectionUnderTheCurrentRole` |
| Ein alter Block mit einzeln geordneten Atomen ohne Abschnittswurzel erhält seine Einzelwahl. | `roots.isEmpty()) return Set.of();` verändert | `legacyIndividualAtomListKeepsItsOfferThroughSignedRestore` |
| Ein bestehender Auftrag bleibt nach Wegfall der letzten impliziten Pflicht lesbar. | `focusedAtomicIds.isEmpty() && !sectionHasOwnOffer(goalId, requestedLandscapeId, projection)` verändert | `historicalPlanReadsTheCapturedSelectionUnderTheCurrentRole` |
| Die im Plan zählende Einzelwahl erweitert dessen reguläres Abschlussprofil nicht. | `obligations.removeAll(learners.voluntaryGoalIds(learner));` verändert | `sectionCountsRegularWorkAndOnlyAnExplicitAtomAddsTheOfferToThePlan` |
| Der Lernort eines reinen Angebotsabschnitts kann für eine Einzelwahl aufgelöst werden. | `return resolveStructureReference(syntheticGoalId, true);` verändert | `repositoryReaderAcceptsVoluntaryOnlySectionWithoutCountingItAsARootScope` |

Der TypeScript-Prüfer wird gegen eine Quelle mit Angebotsrolle, eine Unicode-escaped Schreibweise und einen erst im kompilierten Baum sichtbaren Eintrag geprüft. Bei der entfernten Quellenprüfung erkennt die unabhängige Prüfung des kompilierten Ergebnisses die drei Angebotsatome der Testansicht. Die zusätzliche Java-Gegenprobe fügt beim Zusammenführen zweier Kurse ein Angebotsatom hinzu. Der Test für erzeugte Kursansichten scheitert mit dem Namen der betroffenen Ansicht. [Protokolle und Prüfsummen](curriculum-guard.json)
