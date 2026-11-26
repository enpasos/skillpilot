Die Entkopplung der Fachveröffentlichung ist korrekt eingegrenzt. Eine uneingeschränkte Garantie „jedes angebotene Fach lässt sich starten“ ergibt sich daraus jedoch nicht: Für eine bereits aktive fachfremde Grundlage gibt es einen statisch ableitbaren Konfliktfall.

Geprüft wurde `6852e07203` gegen `0c743ce7e3`. Alle Quellenlinks und Zeilen beziehen sich auf den Prüfcommit. Eigener Lauf: `git diff --check` für die Backendänderungen erfolgreich. Keine Dateien geändert, kein Build und keine JUnit- oder Laufzeitprobe ausgeführt; die drei behaupteten Fehlschläge gegen den Basisdienst sind hier nicht unabhängig bestätigt.

1. **Fachwahl mit und ohne AutoPilot — Veröffentlichung: ja; Startbarkeit: mit Einschränkungen.**

   Der zusätzliche Coach-Durchlauf hängt jetzt ausschließlich von `includeSubjectChoices` ab. Seine Fach-, Klausur-, Auftrags- und Verfügbarkeitsprüfungen unterscheiden nicht nach AutoPilot. Der gewöhnliche Statusaufruf bleibt bei `includeSubjectChoices=false`. [Planservice:349](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L349), [Planservice:437](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L437).

   | Zustand | Statisches Urteil |
   |---|---|
   | Klausurplan in einem Fach, anderes Fach ohne Plan | Das andere Fach wird jetzt auch mit AutoPilot veröffentlicht, sofern seine Fachfrontier einen geeigneten Schritt enthält. |
   | Klausurpläne in zwei Fächern | Beide werden weiterhin über ihre eigenen Pläne bewertet; der Zusatzdurchlauf überspringt Fächer mit eigener Klausurbindung. |
   | Einheitenauftrag im genannten Fach | Gleiche Veröffentlichung bei beiden AutoPilot-Werten. Ein reiner Auftrag mit erforderlicher Aufgabenwahl wird dadurch nicht zur automatischen Zielwahl. |
   | Veralteter Plan im genannten Fach | Persönliche Fachfortsetzung kann die fehlende Planauswertung ersetzen; der Schreibpfad verwendet dann ebenfalls die persönliche Fachfortsetzung. |
   | Laufendes gewöhnliches Lernziel | Generischer Resume bleibt gesperrt; ein ausdrücklicher Fachwechsel kann das laufende Ziel ersetzen. Der Grundlagenfall unter Punkt 3 bleibt problematisch. |

   Belege für diese Grenzen: [Zusatzdurchlauf:440](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L440), [Auftragswahl:1916](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1916), [Schreibpfadauswahl:400](backend/src/main/java/com/skillpilot/backend/ai/CoachToolFacade.java#L400).

   **Beabsichtigter AutoPilot-Unterschied:** `manualCoachCandidates` bleibt bei AutoPilot an ausgeschaltet. OpenAI kann bei AutoPilot aus zunächst das Fach fokussieren und anschließend konkrete Lernziele anbieten; mit AutoPilot wählt der Backendpfad das Ziel. Das betrifft die einzelne Zielwahl und entspricht der beschriebenen Entscheidung. [Planservice:1322](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1322), [OpenAI-Adapter:1475](backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java#L1475).

2. **„Weiter“ ohne Fach — die deterministischen Backendpfade bleiben unverändert.**

   Die zusätzlichen Fachangebote setzen `personalContinuationAvailable` bei bestehender Klausurbindung ausdrücklich **nicht**. `resumeAvailable` und `automaticResumeAvailable` berechnen ihre Kandidaten separat. [Planservice:456](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L456), [Planservice:545](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L545).

   Der generische Schreibpfad berücksichtigt bei bestehender Klausurbindung nur Klausurkandidaten; sein persönlicher Fallback ist dann gesperrt. Automatischer Abgleich und expliziter Resume unterscheiden sich weiterhin durch `allowExtra=false/true`. [Kandidatenfilter:1778](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1778), [Fallbacksperre:1422](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1422), [Einstiegspunkte:1253](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1253).

   Auch die Übergabe nach bestandenem Ziel liest gespeicherte Pläne, offene Fachquoten und eigene Kandidaten; sie konsumiert keine neu veröffentlichten `subjects`-Zeilen. Dieser Code wurde nicht geändert. [LearnerService:10541](backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10541), [LearnerService:10605](backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10605).

   **Nicht ausgeführtes Chat-Risiko:** Die allgemeinen Guidance-Texte erlauben bei ausdrücklichem Lernwunsch teilweise „resumeAvailable oder canContinue“. Die konkreteren Toolanweisungen verlangen für den Fachwechsel jedoch einen ausdrücklich genannten Fachwunsch und verbieten die selbständige Fachwahl. Daraus folgt kein nachgewiesener Fehler bei „weiter“, aber diese Gesprächssituation verdient einen Modelltest, besonders bei `resumeAvailable=false` und gleichzeitig verfügbaren Fachangeboten. [Guidance:427](backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CoachContextProjector.java#L427), [Vertragsregel:346](backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java#L346).

3. **Angebot und gespeicherter Start — keine universelle Garantie.**

   Positiv: Eine fachfremde Grundlage wird gegen den Plan ihres Eigentümerfachs geprüft. Eine Mathematikgrundlage außerhalb der Mathematikklausur wird deshalb nicht als Physikfortsetzung angeboten. Der tatsächliche Write validiert das Ziel anschließend erneut gegen die Frontier des zu speichernden Fokus. [Fachfrontier:4543](backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L4543), [Writeprüfung:11719](backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11719).

   **[P2] Statisch ableitbarer Gegenfall: angebotenes Fach scheitert bei bereits aktiver gemeinsamer Grundlage.**

   Reproduktionszustand für die unabhängige Probe:

   - Physik bietet zuerst eine offene Mathematikgrundlage `X` an; `X` ist unter dem Mathematikklausurplan zulässig.
   - `X` läuft bereits mit gespeichertem Fokus `{X}`, Zustand `TEACHING` und ohne ausstehenden Einheitenauftakt.
   - Physik wird weiterhin mit `canContinue=true`, aber `current=false` veröffentlicht: „aktuell“ wird hier anhand des Eigentümerfachs des aktiven Ziels bestimmt.
   - „Heute Physik“ wählt erneut `X`. Fokus, aktives Ziel und Lernzustand bleiben gleich; der Write liefert `changed=false`, worauf die Fassade mit HTTP 409 abbricht.

   Die entscheidende Kette ist vollständig im Code sichtbar: [Aktuell-Markierung:469](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L469), [Speicherung nur des Grundlagenfokus:1381](backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1381), [Änderungsermittlung:11734](backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11734), [Ablehnung unveränderter Übergänge:418](backend/src/main/java/com/skillpilot/backend/ai/CoachToolFacade.java#L418).

   **Beweisgrenze:** Der Ablauf bei diesem Zustand ist statisch belegt. Eine konkrete Katalogkonfiguration mit `X` als erstem Physikangebot habe ich nicht ausgeführt. Der erste erfolgreiche Grundlagenstart und die erneute Fachanforderung müssen getrennt geprüft werden. Ein weiteres allgemeines Write-Versagen allein wegen fachfremder Vorbereitung ist hier nicht bewiesen.

4. **OpenAI und Gemini — keine gefundene Festschreibung „mit AutoPilot kein anderes Fach“.**

   Beide lesen den gemeinsamen Coachstatus. Ihre Fachprojektionen enthalten keine AutoPilot-Sperre; OpenAI berücksichtigt zusätzlich eine tatsächlich aktive Prüfung. [Gemeinsame Fassade:264](backend/src/main/java/com/skillpilot/backend/ai/CoachToolFacade.java#L264), [OpenAI-Projektion:76](backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeLearningPlanToday.java#L76), [Gemini-Projektion:253](backend/src/main/java/com/skillpilot/backend/connectors/gemini/v1/mcp/GeminiV1CoachContextProjector.java#L253).

   Die untersuchten Verträge erlauben ausdrücklich angeforderte Fachwechsel. Der OpenAI-Test `activeExamCannotBeInterruptedByResumeOrSubjectSwitch` schützt einen **aktiven Prüfungs-Lernknoten**, nicht die Klausurvorbereitung durch einen auswertbaren Lernplan; er widerspricht dieser Änderung daher nicht. [OpenAI-Vertrag:873](backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java#L873), [OpenAI-Test:982](backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV11DailyPlanContractTest.java#L982), [Gemini-Vertrag:305](backend/src/main/java/com/skillpilot/backend/connectors/gemini/v1/mcp/GeminiV1McpContractAdapter.java#L305).

5. **Tests — sinnvoller Regressionsnachweis, aber zu schmal für die Gesamtzusage.**

   Die wichtigsten Ergänzungen vor einer umfassenden Freigabe:

   - **Startbare Klausur:** Zusätzlich zum Resume einen ausdrücklichen Fachwechsel prüfen. Der neue Test führt in diesem Zweig ausschließlich Resume aus. [Test:2264](backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L2264).
   - **Fachfremde Grundlage:** Erststart, gespeicherten Fokus, Folgestatus und erneuten Fachwunsch prüfen. Der Zwei-Plan-Test entfernt sämtliche Mathematikgrundlagen vor seinem Wechsel; seine Gleichheitsassertion deckt diesen Fall deshalb nicht ab. [Test:2195](backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L2195).
   - **Blockierte Klausur:** Den öffentlichen Resume tatsächlich aufrufen und Ablehnung sowie unveränderten Speicherzustand prüfen. Der neue Test kontrolliert lediglich `resumeAvailable=false`. [Test:2255](backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L2255).
   - **Weitere Zustände:** Zwei gleichzeitig auswertbare Klausurpläne, Einheitenauftrag im Wunschfach und ein laufendes anderes Ziel jeweils mit beiden AutoPilot-Werten über den öffentlichen Pfad prüfen.
   - **Persistenzassertionen:** Neben `activeGoalId` auch Fokus, Rückkehrziel, unveränderte Mastery und Planrevisionen sowie den zurückgegebenen Folgezustand kontrollieren. Die geänderten Wechseltests prüfen überwiegend nur die gespeicherte aktive ID. [Test:2213](backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L2213).

   Die drei roten AutoPilot-Fälle gegen den Basisdienst belegen die entfernte Veröffentlichungssperre. Sie belegen weder vollständige Schreibbarkeit aller neuen Angebote noch die unveränderte Gesprächsführung bei bloßem „weiter“.