# Content- und Bildabläufe: Regel-zu-CI-Matrix vom 6. November 2026

Diese Ergänzung zum [Regelkorpus](skill-graph-ci-rule-corpus-2026-11-06.md)
prüft S19–S24 und I18–I25 gegen main
`0ce5a8d791eeb9783a919195fd8590bfb79f3595`. Alle 14 Regeln sind Main-Verträge.
Sie wurden anhand aktueller Implementierungen, Testkörper und Workflow-Aufrufe
gelesen. Das ist kein neu ausgeführter Produkttest oder Nachweis sichtbarer
Darstellung in einem echten KI-Host.

H bedeutet harte Prüfung für den ausdrücklich angegebenen technischen Scope;
P bezeichnet einen Teilnachweis. Offene Gegenfälle und nicht maschinell
beweisbare Gesprächs-/Hostaussagen stehen ausdrücklich in der jeweiligen Zeile.
H bestätigt weder fachliche Inhaltsqualität noch eine vollständige Hostabnahme.
Die weiteren Laufzeitregeln stehen in der
[Laufzeitmatrix](skill-graph-ci-runtime-matrix-2026-11-06.md).

## Aufrufketten und geprüfte Eingaben

| Kürzel | Workflow, Job und Kommando | Trigger und Scope | Fehlerwirkung |
| --- | --- | --- | --- |
| B | `.github/workflows/ci.yml:715–773`, `backend-ci`: `python3 -B ../scripts/run_backend_ci.py --manifest "${BACKEND_FAILURE_MANIFEST}"`; der Runner führt nach einem optionalen Fehler-Preflight ungefiltert `./gradlew check` aus. | Dispatch sowie Push/PR gegen main mit den Pfadfiltern `ci.yml:3–27`. Gewöhnliche docs-/AGENTS-/README-Änderungen sind ausgenommen; Status-/Legal-Inventar sind wieder eingeschlossen. Die unten genannten JUnit-Klassen sind reguläre Backendtests; keine neue Klasse muss gesondert ausgewählt werden. | Testfehler propagieren als Step-/Jobfehler; kein `continue-on-error` am Teststep. Keine Behauptung, dass dadurch jede bedingt aktivierte Integrationsumgebung ausgeführt ist. |
| F | `ci.yml:415–416`, `frontend-ci`: `npm run test:content-materials`; `app/package.json:31` führt `tsx src/utils/contentMaterialsApi.test.ts` und `tsx scripts/testContentMaterialsUi.ts` aus. | Gleiche Hauptworkflow-Trigger. API-Parser und reale Chromium-UI mit kontrollierten Materialien/API-Routen. | Nichtnull ist Step-/Jobfehler. Browserfixtures sind keine Prüfung aktueller externer Anbieterseiten. |
| W | `ci.yml:166–191`, `openai-mcp-app-ci`: `npm --prefix "ai/openai app" test`; dessen package.json führt Typecheck, Widgetbuild und `node --test test/*.test.mjs` aus. | Gleiche Hauptworkflow-Trigger. Parser-, DOM-, Bridge- und reale SDK-Harness-Tests; kein tatsächlicher Desktop-/Voice-Host. | Nichtnull ist Step-/Jobfehler. |
| D | `ci.yml:184–195`, `openai-mcp-app-ci`: `node --test scripts/openai_plugin_release.test.mjs ... scripts/check_skillpilot_coach_behavior.test.mjs ...` sowie `node --test scripts/openai_dialog_eval.test.mjs scripts/openai_dialog_assertions.test.mjs`. | Gleiche Hauptworkflow-Trigger. Reale Prüfer gegen synthetisch mutierte Instruktionen, Vertragsartefakte und Dialogtraces; kein bezahlter Modellaufruf. | Fehlende/zu frühe/falsche/automatisch wiederholte Rendereraufrufe in den geprüften Traces werden Testfehler. |
| O | `.github/workflows/openai-dialog-regression.yml:3–44`, `dialogs`: `node scripts/openai_dialog_eval.mjs run --out-dir tmp/openai-dialog-ci`. | Nur Dispatch und Schedule, zusätzlich Default-Branch und Aktivierung per `OPENAI_DIALOG_EVAL_ENABLED` für geplante Läufe. Kein PR-Gate. Echte API-Dialoge gegen isolierte Fixtures, weiterhin keine native Hostanzeige. | Fehler führen zum Jobfehler. Der Statusabschnitt `:45–57` kennzeichnet ChatGPT-Host/OAuth/native Widgets ausdrücklich als nicht geprüft. Ein nicht ausgeführter Lauf ist kein Pass. |

Die Hauptworkflow-Trigger werden auf dem tatsächlichen Ereignisdiff ausgewertet;
ein einzelnes vorhandenes npm-Skript beweist seine Ausführung nicht. Keine
Branch-Protection-Konfiguration wurde in dieser Matrix geprüft.

## Optionale Materialien

Produktionspfade unter `backend/src/main/java/com/skillpilot/backend/`:
CS = `content/ContentSelectionService.java`, CC = `content/ContentCatalog.java`,
MR = `content/ContentMaterialResolver.java`, CF = `ai/CoachToolFacade.java`,
CP = `connectors/claude/v1/mcp/ClaudeV1CoachContextProjector.java`.
Alle genannten Java-Tests liegen unter `backend/src/test/java/com/skillpilot/backend/`.

| Norm-ID | Status | Tatsächliche Implementierung | Echter Gegenfall / Prüfung | Aufruf und verbleibende Grenze |
| --- | --- | --- | --- | --- |
| S19 | P | CS:54–84 schreibt die separate Materialauswahl und Coachrevision; keine Fachkanten-/Mastery-Mutation. CF:222–230 liefert additive Referenzen. | `content/ContentSelectionIntegrationTest#optInPersistenceIsolationImportConcurrencyAndDeletion:69` vergleicht Mastery-/Planned-Goal-Tabellen und aktives Goal vor/nach Opt-in, Opt-out und Profilimport. `#curatedMathSelectionPersistsWithoutChangingPhysicsOrMasteryAndOptOutRemovesMaterials:169` prüft einen zweiten Fachfall. | B. Persistenz-/Profilisolation ist belegt; kein eigener Gegenfall vergleicht sämtliche Curriculumbytes und Frontier-/Abschlussprojektionen über alle Pakete. Die gesonderte Coachrevision ist keine Änderung der Goalbedeutung. |
| S20 | P | MR:33–45 löst ausgewählte aktive Pakete für ein Goal auf und begrenzt auf vier Referenzen; CC:122–132 filtert aktive Materialien und exakte Goal-ID. CF:222–230 beschränkt den Coachkanal auf den autorisierten aktiven gewöhnlichen Atomen; HTTP-Controller prüft sichtbare Learner-Closure. | `content/ContentMaterialResolverTest#twoLearnersWithTheSameGoalReceiveOnlyTheirSelectedMaterials:30`, `#modelFacingMaterialsAreBoundedEvenAcrossSeveralSelectedPackages:201`; `content/ContentSelectionControllerHttpTest#onlyGoalsInTheFilteredLearnerClosureCanResolveMaterials:135` weist ein verborgenes Goal ohne Resolveraufruf ab. `ai/CoachToolFacadeTest:590–595` prüft aktive Auswahl und Ausschluss von Exam-/fehlendem Goal. | B. Cockpit und Claude-CP:202–213 sind konkrete Konsumenten. Die Funktion allein beweist keine Übernahme in jeden anderen Provideradapter; der gelesene OpenAI-Kontext hat keinen entsprechenden Materialkanal. |
| S21 | H | MR:33–54 liefert bei deaktivierter Funktion, fehlender Auswahl/Zuordnung oder optionalem Fehler eine leere Liste. CS:46–51 isoliert die optionale SQL-Abfrage mit `REQUIRES_NEW`; externe Seiten werden im `link-only`-Profil nicht als Lernvoraussetzung abgerufen. | `content/ContentMaterialResolverTest#disabledContentDoesNotReadPreferencesOrProvideMaterials:23`, `#deactivationAndMissingMappingsProduceAnEmptyAdditiveProjection:49`, `#materialPreferenceFailureDoesNotBlockOrdinaryLearning:194`; `content/ContentSelectionIntegrationTest#failedOptionalSqlLookupCannotRollBackTheOuterLearningTransaction:282` erzeugt echten SQL-Fehler und beweist erfolgreichen Commit der äußeren Lerntransaktion. | B; F prüft die optionale UI. H für den vorhandenen Link-only-/SQL-Fehlervertrag. Verfügbarkeit einer entfernten Anbieterseite wird nicht behauptet; sie ist keine Backend-Abhängigkeit dieses Profils. |
| S22 | H | MR.ResolvedMaterial:15–17 enthält keine Lernenden-/Sessionfelder und übernimmt statische Paket-URLs. CC:221–231 lehnt Query, Credentials, lokale Hosts und Ports ab. `app/src/components/GoalAdditionalMaterials.tsx:43` übernimmt den unveränderten Link und setzt `noopener noreferrer` sowie `referrerPolicy="no-referrer"`. | `content/ContentCatalogTest#rejectsUnsafeOrDataBearingProviderUrls:214` verwirft u.a. `?learnerId=private`; MR-Test:30–45 und Controller-Test:135–163 prüfen fehlende Profil-IDs im Ergebnis. `app/scripts/testContentMaterialsUi.ts:80–89` prüft exakte href-/rel-Werte und Zielhost. | B, F. H für statische Links, Antwortprojektion und die geprüfte First-party-Linköffnung. Keine Behauptung über Datenübermittlung durch eigenständige Nutzeraktionen oder beliebige Providerseiten. |
| S23 | P | CP:205–213 gibt ausdrücklich aus: Ein Link bedeutet weder gelesenen Seiteninhalt noch Volltext-/KI-Nutzungsrechte. MR liefert Referenzen, keinen HTTP-Seitenabruf. | Resolver-/HTTP-Tests prüfen das Link-only-Profil. Kein spezifischer negativer Dialogtest gefunden, der eine erfundene Aussage „Seite gelesen“ als Fehler zurückweist. | B prüft Projektionen; die richtige tatsächliche Coachbehauptung ist damit nicht vollständig deterministisch abgesichert. Die Instruktionshülle ist kein Beleg jeder Modellantwort. |
| S24 | P | CC:150 verlangt `access="public-link"` und `aiUsage="link-only"`; MR:44–45 gibt beide getrennt aus. CP:210 verneint eine Rechtefreigabe durch Linkbereitstellung. Die Auswahl ist kein Entitlement-Dienst. | Controller-Test:151–163 prüft den eigenen `aiUsage`-Wert; `content/ContentCatalogTest` testet Paket-/Providerformat und unsichere URLs. Kein allgemeiner Gegenfall für künftige kostenpflichtige Zugriffszustände oder eine tatsächliche Rechtebehauptung eines Modells gefunden. | B, F. Der aktuelle öffentliche Link-Pilot ist technisch eingegrenzt; eine künftige Rechte-/Zugangslösung oder rechtliche Erlaubnis wird nicht vorweggenommen. |

## Bildangebot, Renderer und sichtbare Komponente

Unter denselben Java-Wurzeln: OA =
`openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java`, OP =
`openai/mcp/de/OpenAiDeCoachContextProjector.java`, OT = Test
`openai/mcp/de/OpenAiDeCoachMcpContractTest.java`.
Widgetquellen und Tests liegen unter `ai/openai app/`.

| Norm-ID | Status | Tatsächliche Implementierung | Echter Gegenfall / Prüfung | Aufruf und verbleibende Grenze |
| --- | --- | --- | --- | --- |
| I18 | H | OP:746–787 verlangt aktives Atom, identischen Link-Goalkey und sicheren eigenen Assetpfad. OA-Kontextprojektion berücksichtigt `showGoalVisualizationsInChat`; ein fehlendes Angebot erlaubt den Renderer nicht. | `OpenAiDeCoachContextProjectorTest#omitsVisualizationAndRenderToolWhenTheLearnerPreferenceIsDisabled:112`, `#omitsVisualizationForClustersMismatchedGoalIdsAndUntrustedAssetPaths:143`; OT#missingOrDisabledVisualizationNeverOffersOrRendersTheUiTool:991. | B. H für den ausdrücklich OpenAI-bezogenen Angebotsvertrag; kein Claim, dass jeder echte Client ein angebotenes Bild rendert. |
| I19 | P | OA#renderGoalVisualization:1323–1377 validiert Sessionmetadaten, Revision und exaktes aktuelles Bild, gibt nur einen UI-Receipt zurück. Der Renderer schreibt selbst keine Mastery und ersetzt nicht den vollständigen Kontext. | OT#dedicatedReadOnlyToolRendersOnlyTheCurrentTrustedVisualization:878, #visualizationFailsClosedWithoutCurrentSessionMetadata:951; negative Revision-/Goaltests siehe I20. | B. Schema-/Resultat-/Sessiongrenzen sind geprüft. Kein vollständiger Datenbank-vorher/nachher-Gegenfall für sämtliche möglichen Seiteneffekte aller intern aufgerufenen State-Projektionen gefunden. |
| I20 | P | OA:168 trägt den einmaligen unmittelbaren Pair-/Consent-Vertrag als Instruktion; Renderer:1341–1368 prüft `expectedStateVersion` und aktuelle Goal-ID. Eine erneute gültige Rendereranfrage wird serverseitig nicht allein wegen derselben Pair-ID verweigert: explizites erneutes Zeigen bleibt zulässig. | OT#visualizationRejectsAStaleStateVersionWithoutRetryingTheImage:912, #visualizationRejectsAChangedGoalAtTheSameStateVersion:932. `scripts/openai_dialog_assertions.mjs:160–210` prüft Renderautorität, unmittelbare Folge und Wiederholung; `.test.mjs:198–242,287–298` verwirft alte/falsche/späte/doppelte Aufrufe. | B, D; tatsächliche API-Dialoge nur O. H für die geprüften technischen Tracegegenfälle, P für echte Zustimmung und den vollständigen Ablauf in beliebigen Chats. Ein serverseitiges pauschales Wiederholungsverbot wäre nicht der erklärte Vertrag. |
| I21 | P | OA:168 und :174 verlangen Feedback vor Nachfolgebild, Zustimmung und servergefüllte Recall-Fortsetzung. Terminale Recall-Continuation enthält genau den Rendereraufruf, wenn der Nachfolger ein Bild hat. | OT#completedRecallBatchWithVisualSuccessorReturnsAndExecutesTheServerDirectedRendererCall:2628, #completedRecallBatchWithNonVisualSuccessorDoesNotPublishARendererCall:2745. Dialogprüfer:160–169 verwirft Bilder im Feedback und vor der Closure; `.test.mjs:86,117,182–195,245–282` enthält entsprechende Gegenfälle. | B, D; echte API-Dialoge O. Der Backend-Receipt und synthetische Turngrenzen beweisen keine tatsächliche Zustimmung in jeder Hostkonversation oder sichtbare Bildanzeige. |
| I22 | H | `widget/src/goal-visualization-main.ts:96–108,123–163` hält die optionale Komponente bis zum Load verborgen und kollabiert sie bei Fehler. Ein alter Bildfehler löscht kein neueres Bild. Der Renderer erzeugt bei fehlendem Bild einen Textfehler ohne Mastery-Mutation. | `test/goal-visualization.test.mjs:77–98` verwirft unsichere URLs; `goal-visualization-lifecycle.test.mjs:246–288` prüft Fehlerkollaps und veralteten Fehler; `goal-visualization-sdk-lifecycle.test.mjs:16–68` prüft Load/Error mit realem SDK-Harness. OT:951/991 prüft fehlende Session/Bilder. | W, B. H für Daten-/Widget-/SDK-Fehlerbehandlung. Erreichbarkeit des vollständigen Unterrichtstexts im nativen Host bleibt ein separater Integrationsnachweis. |
| I23 | H | OA:980–1034 lädt eine aktive, eine ursprüngliche und registrierte retained HTML-Ressourcen, prüft SHA-256 und eindeutige URIs. Tools binden ausschließlich die aktive Bildressource. | OT#publishesActiveAndRetainedGoalVisualizationAndDedicatedMemoryPracticeResources:488, #keepsOriginalVersionedGoalVisualizationResourceByteExactAndPassive:664 prüft die originalen Bytes und fehlende aktive Bindung. `scripts/openai_plugin_release.test.mjs` verwendet retained Widgetbytes in Releasegegenfällen. | B, D. H für die explizit registrierten aktiven/historischen Ressourcen und Bytepins; tatsächliche früher beworbene Ressourcen müssen weiterhin vollständig im Retained-Inventar stehen. Keine Aussage aus bloßem Resource-Read über Hostdarstellung. |
| I24 | H | Widget:125–134 erzeugt ausschließlich ein `img`; `altText` ist dessen Accessibility-Attribut, Titel/ID/Cockpitlink werden nicht als Caption erzeugt. Sichtbarkeit erst nach erfolgreichem Load. | `goal-visualization-lifecycle.test.mjs:225–243` verlangt vor/nach Load genau das Image als Root-Kind; Fehlergegenfall:246–259 verlangt leere versteckte Root. Parser testet notwendige Accessibilityfelder in `goal-visualization.test.mjs:48–74`. | W. H für den erzeugten DOM-Inhalt. Zusatzdarstellung durch einen nativen Host ist dadurch weder eingeführt noch vollständig geprüft. |
| I25 | P | `scripts/openai_dialog_assertions.mjs:50,210,247–262` grenzt API-/Toolbelege ausdrücklich von Hostanzeige ab; der optionale Workflow schreibt deren Status als `NOT TESTED`. Die aktuellen Incident-/Releaseaufzeichnungen unterscheiden Serveraufruf, Ressourcenlesen und fehlende Anzeige. | `openai_dialog_assertions.test.mjs:16–23` verlangt gerade kein `hostEvidence`/`manualReviews` aus einem deterministischen Dialogpass. Lifecycle-/SDK-Tests sind lokale Harnesses. Kein CI-Gate gefunden, das sämtliche Prosa-/Releasebehauptungen auf einen unabhängigen realen Hostanzeigebeleg prüft. | D, O mit ausdrücklicher Ergebnisgrenze. Die maschinelle Berichtshülle wird geprüft; reale Desktop-/Voice-Darstellung erfordert korrelierte externe Belege. Ein grüner API-Test bleibt dafür unzureichend. |

## Auditgrenze

Diese 14 Zuordnungen vervollständigen ihre jeweiligen Regelfacetten. Sie
autorisieren weder neue Content-/Rechteplattformen noch Hostbehauptungen oder
eine Änderung der veröffentlichten Plugin-/Widgetbytes. Insbesondere werden
der fehlende OpenAI-Materialkanal und offene Gesprächs-/Hostgegenfälle nicht
durch enge Resolver- oder DOM-Tests zu einem vollständigen Pass erklärt.

Der spätere [harte CQR-202-Gegenfall](../dev/ci-graph-repairs/cqr202-known-generic-exam-readiness-repair-2026-11-06.json)
verbessert die Erkennung tatsächlich leerer Prüfungsnachweise im vorhandenen
Meilensteinpfad. Er beweist keine allgemeine fachliche Richtigkeit beliebiger
Aufgaben und Lösungen. Der [vollständige E25-Entwurf](../dev/ci-graph-repairs/informatics-e25-terminal-candidate-2026-11-06.md)
bleibt ein nicht angewandter Draft. Sein
[unabhängiger Inhaltsreview](../dev/ci-graph-repairs/informatics-e25-terminal-independent-review-2026-11-06.md)
bestätigt alle 25 Leistungen und eigene isolierte Referenzläufe; die GK-/LK-
Angebotsgrenze und Integration bleiben offen. Die aktuelle
[PO-Klarstellung zum Pflichtumfang](../dev/ci-graph-repairs/curriculum-required-goal-scope-decision-2026-11-06.md)
erlaubt amtlich belegte Ziele und fachlich begründete Lückenschlüsse; maschinelle
Quellpins allein beweisen eine solche Lückenbegründung nicht. Die
[konkrete Prüfung zu Zustandsautomaten](../dev/ci-graph-repairs/informatics-875-official-or-gap-followup-2026-11-06.md)
und ihre [Bestands-/Prüfgrenze](../dev/ci-graph-repairs/informatics-875-retained-definition-contract-review-2026-11-06.md)
halten die nachgewiesenen Befunde und die noch offene vollständige Reparatur
getrennt. Die 14 Regelzuordnungen dieser Matrix bleiben unverändert.

Der ergänzende [vollständige CQR-202/204-Prüfumfang](../dev/ci-graph-repairs/cqr202-complete-assessment-scope-repair-2026-11-06.md)
erfasst 925 erhaltene Definitionen und 872 verbindliche Prüfungen. Er schützt
auch die Meilensteinableitung und den direkten Floorverbrauch gegen fehlende
oder gekürzte Berichte. Die bestehenden sechs unzureichenden Informatikprüfungen
bleiben rot. Die vollständig begutachteten E25- und
[GK24-Materialien](../dev/ci-graph-repairs/informatics-gk24-terminal-independent-review-2026-11-06.md)
bleiben bis zur gesondert geprüften Angebots-/Vorbereitungsintegration Drafts.
Diese technische Erweiterung belegt weiterhin keine allgemeine fachliche
Richtigkeit oder Lernwirksamkeit.

Die [Ownerpräzisierung vom 7. November](../dev/ci-graph-repairs/informatics-retained-contract-result-gap-2026-11-07.md)
verlangt keine Erhaltung oder Übernahme bisheriger Informatikergebnisse.
Die aktuelle technische Definitionsprüfung begründet daher keine Pflicht,
überholte Informatikprüfungen oder deren alten Umfang beizubehalten. E25 und
GK24 bleiben historische Materialentwürfe; ihr begutachteter Inhalt legt den
aktuellen fachlichen Pflichtumfang nicht fest. Legitime Quellenbereinigung,
passender aktueller Angebotsumfang und vollständige echte Prüfmaterialien
werden gemeinsam an den bestehenden harten Gates geprüft.

Die [aktive Math58-Integration](../dev/ci-graph-repairs/visualization-math58-active-integration-2026-11-07.md)
erweitert den endlichen V-Nachweis auf 132 Kontexte und korrigiert einen echten
Boxplotfehler mit neuen unabhängigen Bild- und P-Belegen. Die Aussagegrenzen
dieser Matrix, die fachlichen Untergrenzen und offene Bestandsbefunde bleiben
bestehen.
