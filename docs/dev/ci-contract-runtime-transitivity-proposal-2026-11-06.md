# Begrenzter Vorschlag: transitive Laufzeitvoraussetzungen vor Kantenreparaturen

**Bestätigter Umfang lokal implementiert; Backendcode eingefroren.**

Die Diagnosetabellen dokumentieren den Ausgangsbefund. Der Implementierungs-
und Verifikationsnachtrag am Ende beschreibt den jetzt geltenden Arbeitsstand.

Diese Untersuchung und ihre drei zunächst roten Vertragstests betreffen
den bereits auf main verbindlichen Graphvertrag (§§6.4, 9.1 und 11.2–11.4).
Die Umsetzung folgt dem unten bestätigten Umfang. CQR-Code und Curriculumdaten bleiben
während der laufenden Bestandsprüfung eingefroren. Der Vorschlag führt weder
LearningUnit-Ownership noch C(q), globale Prüfungsanerkennung oder zusätzliche
Mastery-Schreibvorgänge ein.

## Warum beide Laufzeitpfade nötig sind

Bei `Q → B → A` bleibt A Voraussetzung von Q, auch wenn nur B explizit
gemeistert ist. Die zusätzliche Autorenkante `Q → A` ist nach §7.3 redundant.
Ihre Entfernung bewahrt die vorgeschriebene vollständige Goal-Erreichbarkeit,
verändert heute aber unter Umständen die Laufzeitverfügbarkeit:

- `LearnerService.areFrontierPrerequisitesMastered` prüft nur direkte und
  über `contains` geerbte Endpunkte. Es überspringt bei Zeile 7231 ein
  Außen-Intermediate samt dessen Kette und verfolgt nach Zeile 7237 keine
  Voraussetzungen eines gemeisterten Endpunkts.
- `CompletionEvaluator.evaluateAutomaticGraph` beendet bei Zeile 41 die
  Nachfrage an einem gemeisterten Knoten. Dadurch kann A schon vor dem
  eigentlichen Frontiercheck als `waived` verschwinden.

Ein Reparieren nur eines Pfads reicht deshalb nicht. Der separate Reviewed-
Evaluator trägt bei Zeile 123 offene transitive Verbraucher bereits durch
gemeisterte Zwischenknoten. Das ersetzt den tatsächlich aktiven Automaticpfad
nicht.

## Konkreter Implementierungsumfang zur Bestätigung

1. **Bestehende Normalisierung gemeinsam verwenden.**
   `CompletionProfileCompiler.compileGraph` enthält bereits die benötigten
   Schritte: globale Referenz-/Identitätsprüfung, Contains-Topologie, Vererbung
   aller Eltern, atomare Clusterbasis, wiederholte Verfolgung der Voraussetzungen
   dieser Atome und Prüfung atomarer Zyklen (`:120–168`). Diese reine Topologie
   sollte als kleiner unveränderlicher Helfer aus dem bestehenden Compiler
   zugänglich werden und sowohl dem Compiler als auch dem Frontier dienen.
   Sie hängt nicht von Mastery, aktuellem Fokus oder einem abgeschlossenen
   Prüfungsurteil ab. Es entsteht keine zweite fachliche Scopeengine.
2. **Vollständige Nachfrage vor der Endpunktprüfung.**
   `frontierPrerequisites` bereitet einmal pro aktuellem Read die normalisierte
   Topologie vor. `areFrontierPrerequisitesMastered` verfolgt die vollständige
   atomare Nachfrage unabhängig von Mastery und Zwischenknoten-Sichtbarkeit.
   Normalmodus prüft danach nur atomare Endpunkte in `target ∩ Fokus`; Strict
   prüft alle erreichten atomaren Endpunkte. Ein bekannter äußerer Endpunkt
   wird dadurch im Normalmodus weder blockierend noch gemeistert. Ein Pfad,
   der über außen zurück nach innen führt, behält seinen inneren Endpunkt.
   Für einen Clusternavigationskandidaten gilt dessen eigene Nachfrage D(g);
   seine Kinder werden nicht als zusätzliche Autorenanforderung erfunden.
3. **Automatic-Nachfrage ohne Mastery-Cut.**
   Im bestehenden BFS bleibt `needed[prerequisite]` der Besuchsschutz;
   `mastered[prerequisite]` darf die weitere Verfolgung nicht abbrechen.
   Explizit gemeisterte Zwischenknoten bleiben im Ergebnis explizit gemeistert.
   Anfangswurzeln, Ergebnisschema und bisherige Schutzmengen bleiben in diesem
   begrenzten Schritt unverändert. Das ist ausdrücklich noch keine vollständige
   Korrektur der sonstigen Automatic-Waiver- und Anerkennungssemantik.
4. **Vorhandene Integritätsgrenzen erhalten.**
   Fehlende explizite Composition-Referenzen und fehlende/undeutige tatsächliche
   Graphreferenzen müssen vor jedem Fokusfilter fehlschlagen. Bekannte, nur
   außerhalb liegende Voraussetzungen sind davon zu unterscheiden. Die
   vollständige Eingabe darf nicht aus `visibleGoals` oder nur den ausgewählten
   Fächern konstruiert werden: `projection.structuralGoals()` enthält heute
   nur ausgewählte Laufzeitlandschaften plus ausdrücklich hydrierten Support.
   Ausgangspunkt ist der unbeschnittene vorhandene Definition-Resolver;
   autorisierte direkte Projection-Einträge behalten ihre bestehenden
   Strukturregeln. Kein optimistischer Fallback auf eine unvollständige Hülle.
   Vor dessen Wiederverwendung ist eine konkrete Lücke zu schließen:
   `CompletionCanonicalGraphResolver.load` entdeckt Landschaften über
   ausgehende `contains`-/`requires`-Referenzen. Qualifizierte Referenzen werden
   erst danach normalisiert; fremde eingehende Contains-Vorfahren werden nicht
   offensichtlich mitentdeckt. Der gemeinsame Topologieeingang braucht auch
   diese Vorfahren samt ihren Anforderungen, ohne dadurch fremde Geschwister
   zu Lernzielen oder Supportrollen zu machen.
5. **Diagnose und Darstellungen anschließen.**
   `describeLearningPlanBlockage` (`LearnerService:4046–4075`) muss dieselbe
   Nachfrage für fehlende Atome verwenden, statt erneut nur direkte Endpunkte
   anzusehen. Die lokale Berechnung in `LearnerView:1484–1544` erzeugt zwar eine
   direkte und sequentielle Frontier; ihr `CompetenceTree`-Prop wird jedoch
   nur weitergereicht und nirgends ausgewertet. Root entfernt diesen toten
   Pfad. Die vorhandenen Backend-IDs bleiben begrenzte Empfehlungen für
   GoalCard und Next-Steps, kein behaupteter vollständiger Frontierexport.
   Keine neue Browser-Scopeberechnung oder zusätzliche API.
6. **Mechanismusbehauptungen berichtigen und Cachebedeutung benennen.**
   Die unten genannten aktiven Instruktionen und Negativprüfer dürfen den
   beseitigten Mastery-Cut nicht weiter verlangen. Sie sollen auf die frische
   Backendverfügbarkeit verweisen und vollständige Voraussetzungspfade nicht
   selbst rekonstruieren. Die internen Bezeichner
   `direct-demand-stops-at-mastery-v1` und `direct-demand-v1` müssen die neue
   Bedeutung korrekt benennen; gespeicherte Scope-/Capabilitybindungen werden
   über die vorhandenen Revisionsregeln neu geprüft. Es wird keine Mastery
   migriert oder durch Erklärtext erzeugt. Veröffentlichte Paket- und retained
   Widgetbytes bleiben unverändert.

Eine wichtige bisherige Abweichung ist die GK/LK-Kinderselektion in
`computeEffectivePrereqMastery` (`:7765/:7816`). Sie wählt die globale
GK-Kinderbasis, bevor F geschnitten wird. §6.4 und §11.3 verlangen dagegen die
vollständige atomare Basis und anschließend den Endpunktschnitt. Der neue
Verfügbarkeitshelfer darf diesen alten Sonderfall nicht übernehmen. Eine
Reflexionsprobe auf den bisherigen Helfer ist kein Nachweis des neuen Vertrags.
Aus einer atomaren Voraussetzung entsteht weiterhin keine ganze Fremdunitpflicht.

## Tatsächliche Verbraucher

| Verbraucher | Konsequenz des gemeinsamen Fixes |
| --- | --- |
| `getFrontier`, `getRichFrontier`, `getUncompactedRichFrontier`, `getUncompactedRichFrontierForFocus` | Gemeinsamer Voraussetzungspfad; freiwillige Auswahl und prospektive Planprüfung bleiben erhalten. |
| `automaticFrontierWaivers` (`LearnerService:6785–6807`) | Keine vorherige Unterdrückung eines über gemeisterte Zwischenknoten weiterhin benötigten Ziels. |
| `completedFrontierWork`, `getLearnerState.scopeCompleted` (`:8362`) | Derived-Cluster/Fokusabschluss verwendet das korrigierte Ergebnis; keine Kinder-Mastery. |
| `CompletionApplicationService.evaluate`, Completion-HTTP-/Coachprojektion | Automatic-Resultate und Reasons ändern sich konsistent aus demselben Evaluator. |
| `LearningPlanCompletionProjection.waivedGoals:21–38`, `LearnerLearningPlanService.planFulfillment:92–205` | Plan-IST und erlaubte Fortsetzung erhalten denselben korrigierten Required-Work-Eingang. Planmenge, Solltermine und explizite Periodenereignisse bleiben unverändert. |
| `CoachToolFacade` und `LearnerUiController.getFrontier` | Projizieren die Backendverfügbarkeit; keine Adapter-eigene zweite Hülle nötig. |
| `LearnerView` / `CompetenceTree` | Tote lokale Frontierberechnung und ungenutztes Tree-Prop entfernen; kein neues vollständiges Frontierfeld. |
| `LevelCompletionCard`, `treeCompletionProgress`, `levelCompletionApi` | Reine Ergebnis-/Waiverkonsumenten, kein eigener Mastery-Cut gefunden. Parser-/Mengeninvarianten erhalten; keine neue Anerkennungsbehauptung. |
| Explorer, `useLandscapes`, `RequiresFlowMap`, `goalSorter`, Kursplanung | Authored-/geerbte Kanten, Ordnung und Erklärung sind keine eigenständige Lernfrontier. Keine pauschale Umstellung ihrer Darstellungsrelation auf transitive Autorenkanten. |

## Aktive Instruktionen und aktive alte Gegenprüfer

| Quelle | Heute abgesicherte falsche Aussage |
| --- | --- |
| `OpenAiDeV1McpContractAdapter.java:176` | „a mastered goal no longer demands its own prerequisites“ |
| `ClaudeV1McpContractAdapter.java:596–600` | derselbe Cut im serverseitigen Completion-Vertrag |
| `ClaudeV1CompletionChoices.java:168` | derselbe Cut in der tatsächlichen kontextbezogenen Instruktion |
| aktueller OpenAI-Kandidat `skills/skillpilot-coach/SKILL.md:268` und `references/coaching-policy.md:143` | derselbe Cut in Paket-/Policytext |
| `scripts/check_skillpilot_coach_behavior.mjs:29/:39/:53` und `.test.mjs:65` | fordert den Cut ausdrücklich und verwirft eine vollständige transitive Nachfrage als unerwünschte Änderung |
| `ClaudeV1McpContractTest#completionInstructionsFollowAutomaticDemandWithoutRequiringAnAssessmentPass:600` | exakte Cut-Zeichenfolge |
| `OpenAiDeCoachMcpContractTest:1365` | exakte Cut-Zeichenfolge |

In den gelesenen aktuellen Gemini-Instruktionen und dem aktuellen Claude-SKILL
wurde diese konkrete Mastery-Cut-Behauptung nicht gefunden. Sie beziehen die
zulässigen nächsten Ziele vom Backend. Historische/retained Pakettexte sind
keine pauschalen Änderungsziele dieses Vorschlags.

## Bestehende Erwartungen gezielt ersetzen

| Test | Nötige neue Erwartung |
| --- | --- |
| `AutomaticCompletionTest#masteredIntermediateStopsDemandFromAnOpenAssessment:20` | A bleibt bei offenem Q benötigt, obwohl B gemeistert ist. |
| `AutomaticCompletionTest#anAdditionalDirectEdgeKeepsThePrerequisiteNecessary:30` | Das Entfernen einer nach §7.3 redundanten Kante darf den Bedarf nicht ändern. |
| `AutomaticCompletionTest#everySmallDagAndBinaryAssignmentMatchesTheIndependentLocalConsumerFixedPoint:142` | Referenzmodell darf nicht mehr von allen direkten Verbrauchern aus rückwärts implizit freistellen; unabhängig nach vollständigen Pfaden von offenen Schutzwurzeln suchen. |
| `AutomaticLearningPlanCompletionProjectionTest#masteredIntermediateStopsDemandEvenWhenItsAssessmentIsOutsideTheDatedPlan:29` | A bleibt im datierten Plan benötigt, solange Q im Personal Curriculum offen ist. |
| `AutomaticCompletionFrontierTest#masteredIntermediateEndsOnlyItsOwnPreparationDemandAndUsesOneMasteryRead:123`, `#focusDoesNotDiscardConsumersElsewhereInThePersonalCurriculum:135`, `#disablingDirectAssessmentOffersDoesNotRestoreUnneededWork:147` | A nicht mehr wegen allein gemeistertem B unterdrücken; weiterhin nur ein aktueller Masteryread und keine Writes. |
| `ProjectionRoleLearnerServiceTest#normalFocusCutsAnOutsideIntermediateBeforeFollowingItsReentryIntoTheFocus:472` | Innere Rückkehrvoraussetzung A blockiert Q auch über B außerhalb von F. |
| `ProjectionRoleLearnerServiceTest#simpleFrontierStopsAtMasteredIntermediateButKeepsIndependentDirectRequirements:597` und Rich-Pendant `:602` | Vollständige Hülle; redundante Direktkante ändert keine Verfügbarkeit. |
| `ProjectionRoleLearnerServiceTest#normalClusterBasisDoesNotPromoteAnExtensionWhenItsGlobalCoreSiblingIsOutsideFocus:570` | Im neuen Frontier zählt die vollständige atomare Basis; ein LK-Atom in F verschwindet nicht durch ein GK-Geschwister außerhalb F. |
| `ExamLearningScopeIntegrationTest#strictExamFocusKeepsOutsidePrerequisitesAndAllNineTopicsAndThreeTasks:149` | Die aktuell bereits vor dem eigentlichen Scopefall behauptete Freigabe nach nur gemeistertem Uniform-Zwischenknoten ist zu ersetzen. Umfang bleibt vollständig. |
| `LearnerControllerIntegrationTest#getPreparedLearnerStateBody:1900–1945` | Vorhandene Initialfreigaben dürfen nicht vom Legacy-Mastery-Cut abhängen; positive Vorbereitung mit `CanonicalPrerequisiteTestContext` prüft bereits vollständige Vorgeschichte. |

Die anderen alten Anerkennungsprobleme — pauschale prüfungsfreie Erledigung,
Karten-/Orientierungs-Waiver, fehlende dauerhafte lokale Vertragsownership —
werden durch diesen begrenzten Schritt nicht als gelöst behauptet. Bestehende
Tests für zwei weiterhin offene lokale Pflichtprüfungen werden nicht allein
deshalb in eine neue C(q)-Sofortunion umgeschrieben.

## Neue echte Gegenfälle

Die neue Datei `TransitivePrerequisiteDemandContractTest.java` prüft zunächst
rot an Compiler und echtem Automatic-Evaluator:

1. Offenes Q → gemeistertes B → offenes A erhält A als benötigte Vorbereitung.
2. Entfernung der nach Goal-Erreichbarkeit redundanten Kante Q → A erhält
   dieselben Required-/Waiver-Mengen.
3. Q → Cluster K mit atomarem Kind B → A folgt A trotz gemeistertem B.

Nach bestätigtem Design kommen an den tatsächlichen Servicegrenzen hinzu:

- einfacher, rich, uncompacted und prospektiver Planfrontierpfad mit demselben
  Graphen und denselben Masterysnapshots;
- `F={Q,A}` bei Q → B → A, B außerhalb F, A offen/gemeistert; Strict mit
  demselben Zustand und echter Außenanforderung ohne Innenrückkehr;
- Q → außenliegender Cluster K mit Kind A innerhalb F; Kind-A-Voraussetzung
  B und geerbte Anforderung eines außerhalb liegenden Contains-Vorfahren;
- unbekannte Referenz hinter gemeistertem oder verborgenem Zwischenknoten,
  ungültiger Level-2-Eintrag, Zyklus und beschädigte Clusterbasis: fail-closed,
  kein leerer erfolgreicher Bedarf;
- alle binären Masterybelegungen eines kleinen redundanten DAGs sowie beide
  Modi: Verfügbarkeit und Automatic-Bedarf vor/nach bewiesener §7.3-Reduktion
  gleich; `MasteryRepository.save/saveAll` bleiben unaufgerufen;
- Strict-Frontier bleibt bei gleicher gültiger Eingabe Teilmenge der normalen
  Frontier; keine Scope-/Mastery-Mutation durch Read oder Diagnose;
- Tote Browser-Frontierberechnung entfernen; begrenzte Backendempfehlungen
  bleiben als solche erhalten, ohne Vollständigkeitsbehauptung.

## Verifikation nach Bestätigung

Die drei neuen Tests wurden am 6. November 2026 unverändert gegen die aktuelle
Produktionslogik ausgeführt: **3 ausgeführt, 3 erwartungsgemäß fehlgeschlagen**.
In allen drei Fällen wird A fälschlich als `waived` ausgegeben; beim Entfernen
der redundanten Kante ändert sich die Waivermenge von leer zu `{A}`.
Kompilierung war erfolgreich. Der zunächst unbrauchbare Standard-Gradlecache
verweist auf ein nicht gemountetes Verzeichnis; der anschließende Lauf benutzte
den vorhandenen Offlinecache und das gepinnte JDK:

```bash
cd backend
GRADLE_USER_HOME=/tmp/skillpilot-plan-gradle-20261022 \
JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/amazon-corretto-25.0.2.10.1 \
PATH=/home/enpasos/projects/skillpilot/tmp/amazon-corretto-25.0.2.10.1/bin:$PATH \
./gradlew test --offline --console=plain \
  --tests com.skillpilot.backend.completion.TransitivePrerequisiteDemandContractTest \
  -x processResources -x generateClaudePluginPublication
```

Das vollständige lokale Protokoll liegt unter
`tmp/ci-contract-transitive-demand-red.log`. Dieser Testlauf mit bestehenden
Ressourcen ist kein frischer vollständiger Backendbuild. Die roten Tests sind
ein überprüfbarer Fehlernachweis; sie dürfen vor dem zugehörigen bestätigten
Fix nicht als grüne Gesamtsuite oder erledigte CI-Reparatur behandelt werden.

Zuerst die reine Compiler-/Evaluator-Suite einschließlich der neuen roten Fälle
mit exakt gepinntem JDK. Danach die vier Frontierwege, Automatic-Planprojektion,
Rollen-/Cluster-/Exam-Scope- und Controller-Gegenfälle sowie die aktuellen
Instruktionsmutationen. Die vorhandenen cached Backendressourcen dürfen nur
unter der bereits dokumentierten lokalen Hash-/Buildgrenze wiederverwendet
werden. Vollständige frische Remote-CI, regulärer Ressourcenbuild und reale
Hostabnahme bleiben davon getrennte Nachweise. Erst nach diesem begrenzten
Verfügbarkeitsnachweis kann eine echte Autorenkantenreparatur ihre bewahrte
Laufzeitverfügbarkeit beanspruchen.


## Implementierter Umfang und Stoppgrenze

Die gemeinsame immutable `CompletionProfileCompiler.PrerequisiteTopology`
normalisiert alle Contains-Eltern, vollständige Clusterbasen und deren weitere
Voraussetzungen. `LearnerService` verwendet diesen Kernel für alle vier
Frontierzugänge und die Planblockagediagnose. Im Automatic-Evaluator endet der
Bedarf nicht mehr bei gespeicherter Mastery; der Besuchsschutz bleibt erhalten.

`CompletionCanonicalGraphResolver.loadForTargets` startet bei sämtlichen
committed Level-2-Akquisitionszielen: gewöhnlichen Zielen, Orientierungen,
Karten und Prüfungen einschließlich explizit atomarer `goalEntry`-Darstellung.
Der Fokus wählt keine Seeds aus. Ein ungefilterter Definitionskatalog liefert
benötigte ausgehende Wege und sämtliche eingehenden Contains-Vorfahren.
Ancestor-only-Importe behalten relevante Kanten samt fehlerhafter Qualifikation,
ziehen aber keine unbeteiligten Geschwister in den Kontext. Der Cache ist an
Curriculum, vorhandenen PC-Digest, Generation und `full-transitive-demand-v2`
gebunden. Qualifizierte Referenzen benötigen ihren tatsächlichen Eigentümer;
es gibt keinen optimistischen gültigen Suffix als Ersatz für einen falschen Owner.

Die reale alte Gesamtbasis enthält vier fehlerhafte PoWi-Contains-Listen aus
`curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_POLITIKWIRTSCHAFT.de.json.snapshot`
(Owner `1d0e9f8f-0087-49e4-8ea2-976e5a89b165`). Der neue Regressionstest belegt:
vollständige ausgewählte Matheziele funktionieren, unselektierte sachfremde
PoWi-Ziele werden nicht zu Seeds; bei tatsächlicher Auswahl eines betroffenen
PoWi-Kontexts bleibt dessen Duplikat ein harter Fehler. Kein Snapshot wurde
bereinigt und keine Referenzprüfung abgeschaltet.

Der gemeinsame Abschlusslauf prüfte **181 Tests** aus 18 Suiten. **180 bestanden**;
nur der Claude-Kontextstart scheiterte an einer währenddessen erfolgten
History-Dateiänderung in `CompletionProfileCatalog.verifyUnchanged`. Nach der
Schreibsperre bestand genau dieser Test im separaten Wiederholungslauf
(**1 ausgeführt, 1 bestanden**). Das ist ein vollständiger Satz erfolgreicher
selektierter Tests über zwei Läufe, kein ununterbrochen grüner gemeinsamer Lauf.
Die Zählung umfasst Compiler/Reviewed-/Automatic-/Planfälle, alle vier
Servicefrontierpfade, den unabhängigen Legacy-Invariantentest, echte Klausur-
und HTTP-Migrationsfälle, Fokus/Widening, fachübergreifenden Fokus sowie beide
angepassten Adapter-Vertragsproben.

- Gemeinsamer Lauf: `tmp/ci-contract-transitive-final-verification.log`;
  XML-Zusammenfassung `tmp/ci-contract-transitive-final-verification-summary.json`.
- Stabile Startwiederholung: `tmp/ci-contract-transitive-stable-startup-retry.log`.
- Vorheriger reiner Kern-/Plan-/Service-Lauf: 141 Tests bestanden;
  nach der Level-2-Kontextkorrektur bestanden 75 Resolver-/Service-/Invariantentests.
  Diese überlappenden Vorläufe werden nicht zur Zahl 181 addiert.

Jeder lokale Gradlelauf verwendete das oben genannte gepinnte JDK und den
vorhandenen Offlinecache mit bestehenden Backendressourcen; regulärer frischer
Ressourcenbuild, vollständige Remote-CI und Hostabnahme bleiben getrennt.
`git diff --check` besteht. Es wurden keine neuen Ergebniszustände,
Mastery-Schreibvorgänge, LearningUnit-Verträge, C(q)- oder globale
Anerkennungsregeln eingeführt. Antwortschemata und publizierte/retained Bytes
bleiben unverändert. Die zunächst neun roten geschützten Maturity-Floors sind
mit dieser Backendkorrektur nicht wiederhergestellt. Die getrennte Entfernung
von 13 geerbten Geschichte-Duplikaten erreicht im nachfolgenden frischen
CQR-Bericht M6; acht andere Floors bleiben rot. Weitere Curriculum-/ID-
oder Kantenreparaturen liegen außerhalb dieses eingefrorenen Backendumfangs.
