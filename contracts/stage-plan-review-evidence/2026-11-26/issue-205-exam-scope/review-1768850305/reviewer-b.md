# S – unabhängige zweite Stimme zum Java-Änderungssatz

**Urteil: `1768850305` ist für die vollständige Umsetzung der Entscheidung zu #205 noch nicht übernahmebereit.** Die vier neuen Klausurplanfälle bestehen in meiner eigenen Instanz. Zwei ergänzende Fälle bleiben funktional gesperrt. Einen neuen Rollback-Fehler konnte ich in der tatsächlich ausgeführten Clientfehler-Transaktion nicht bestätigen.

Ich habe ausschließlich den Auftrag vom 26.11., 07:25 CET, den Änderungssatz **`a3f6b067df..17688503056e3c48318f1a27b407a2aa8480c8c8`**, dessen Aufrufer und Tests untersucht. Keine andere S-Antwort und keine fremden S-Rohdaten wurden gelesen. Der historische Commit `0b3452675c` wurde für Frage 3 gelesen. Produktion und Branches wurden nicht geändert. Eigene Snapshot-Dateien, ergänzte Tests, Protokolle und Messungen liegen ausschließlich in `raw/reviewer-b/`.

Die Proben verwenden einen eigenen Quellsnapshot, Java 25, Spring/H2 und reale kanonische Daten. 214 Runtime-Dateien – 21 kanonische Roots, 190 Mathematik-/Physikviews und drei Materialkatalog-/Materialdateien – stimmen in der abschließenden Byteprüfung mit `1768850305` überein. Die ursprünglichen Java-Dateien sind unter [source-after](raw/reviewer-b/source-after/) erhalten. Teständerungen betreffen nur meinen Rohsnapshot. Kein vollständiger Backend-Suite- oder CI-Pass wird behauptet.

## Befunde nach Schwere

### P1 – Veröffentlichtes Fortsetzen kann beim veralteten Plan weiterhin ins Leere laufen

Reproduktion: Physik gewählt, Planfolgen aktiv, kein aktives Ziel, aktiver Klausurtag, gewöhnlicher Lernblock inaktiv; den gespeicherten Plan anschließend mit `RESTORED_OUTDATED_CURRICULUM_ID` markieren. Es gibt reale offene Physikziele und eine nichtleere Frontier.

Die tatsächliche Coach-Ausgabe lautet zusammengefasst:

```text
evaluable=false
Physik.canContinue=true
resumeAvailable=true
resumeExplicitly: changed=false, activeGoalId=null
MCP resume: error=true, activeGoalId=null
```

Der Fehler liegt in `LearnerLearningPlanService.personalCurriculumGoalsForPlanContinuation`, **1993–2014**: Nach dem neuen `definesExamScope(...)=false` werden weiterhin die inaktiven Lernblöcke dieses nicht auswertbaren Plans angewandt; ohne aktiven Lernblock liefert **2009–2010** eine leere Liste. `reconcileInternal`, **1417–1427**, bekommt dadurch keinen normalen Fortsetzungsschritt. Dagegen erlaubt die Statusberechnung in **445–464**, **541–544** die persönliche Fachfortsetzung anhand der offenen Fachfrontier. `CoachToolFacade.resumeLearningPlan`, **298–317**, verwirft den anschließenden unveränderten Übergang mit Konflikt; das habe ich auch durch den echten MCP-Aufruf beobachtet.

Beleg: `reviewerBInactiveLearningInOutdatedExamPlanDoesNotStrandResume`, [after-final-summary.actual.json](raw/reviewer-b/after-final-summary.actual.json), vollständiges XML in [after-final-probes](raw/reviewer-b/after-final-probes/).

Das ist kein erforderliches Aufheben einer gültigen bewussten Pause: Hier wird aus der nicht auswertbaren **Planaufzeichnung** zugleich eine offene Fortsetzungsfähigkeit und ein blockierender Fortsetzungsfilter abgeleitet. Diese beiden Entscheidungen müssen übereinstimmen. Eine Reparatur muss den nicht auswertbaren Plan vor der Auswertung seiner gewöhnlichen Inaktivität als solchen behandeln; gültige eigenständige Aufgaben-/Einheitenpausen bleiben gesondert geschützt.

### P1 – Ein gültiger fremder Klausurplan kann das freigegebene Fach weiterhin schließen

Reproduktion mit **aktivem** gewöhnlichem Physik-Lernblock, also ohne die Inaktivitätsursache des ersten Befunds:

- Physikplan wird mit dem veralteten Marker gespeichert.
- Ein separater Mathematikplan ist aktuell und hat einen auswertbaren Klausurtag.
- `getPlan(Physik).stale=true`; Mathematik bleibt `stale=false` und `learningScope.kind=exam`.
- Die explizite Physik-Fachfrontier ist leer, bei Autopilot aus **und** an.
- Nur den Mathematikplan aus derselben Testtransaktion entfernen, Physik unverändert lassen: Die Physikfrontier enthält wieder zwei Ziele.

Tatsächliche Kontrollausgabe:

```text
autopilot=false withMath=0 withoutMath=2 physicsLearningActive=true
autopilot=true  withMath=0 withoutMath=2 physicsLearningActive=true
```

Beleg: [mixed-control.actual.json](raw/reviewer-b/mixed-control.actual.json), XML in [mixed-control](raw/reviewer-b/mixed-control/), ergänzter Test `reviewerBMixedCurrentMathAndOutdatedPhysicsRemainIndividuallySelectable`.

Die fachbezogene Frontier wird in `LearnerService.getPersonalCurriculumSubjectFrontier`, **4518–4549**, mit den benötigten Vorbereitungszielen erweitert und dann an `followedLearningScopeIds` übergeben. Dort werden in **5249–5252** die angefragten Landschaften aus sämtlichen projizierten Atomen abgeleitet, einschließlich fremder Mathematikvorbereitung. In **5260–5283** kann dadurch auch die gültige Mathematikklausur in den Physikaufruf eingehen; `hasExam=true` verhindert am Ende den normalen Rückfall und liefert die fremde Klausurauswahl. Der bestätigte Kontrollwechsel grenzt den fremden Plan als Ursache ab.

Für eine explizite Fachanfrage muss der fachliche Zielbezug erhalten bleiben. Fremde Voraussetzungen machen die Anfrage nicht zu einer gleichzeitigen Auswahl des fremden Fachplans. Die gültige Mathematikklausur soll für Mathematik weiter gelten; sie darf die nach #205 geöffnete Physik-Fortsetzung nicht schließen. Ich habe nicht behauptet, dass diese gesamte Querverflechtung erst mit diesem Commit entstanden ist; sie bleibt aber eine Lücke des angeforderten Ergebnisses.

## 1. Vollständigkeit und Pfade

**Urteil: Der einfache Fall ist repariert, die Vollständigkeit nicht erreicht.** Die neue Prüfung wird bei Frontier und Planservice grundsätzlich vergleichbar angewandt. Die beiden obigen Fälle zeigen verbleibende Abweichungen zwischen fachlicher Frontier, Status und tatsächlicher Fortsetzung.

| Pfad | Prüfung und Ergebnis am untersuchten Stand |
|---|---|
| Planstatus / Cockpit-Planbeschreibung | `LearnerLearningPlanService.summarize` **1861–1938** prüft weiterhin Kompatibilität. Ein veralteter Plan hat keine gültige Klausurfortsetzung und keinen gültigen `learningScope`. Der gespeicherte Plan bleibt sichtbar. |
| Coach-Kontext | `calculateStatus` **432–464**, **541–544** verwendet den neuen `hasExamScope`; der Kontextprojektor **360–365** veröffentlicht die daraus berechneten Fähigkeiten. Befund 1 zeigt eine tatsächlich falsche positive Fähigkeit. |
| Generisches Fortsetzen | `reconcileInternal` **1417–1427** benutzt den neuen Test, ruft anschließend aber die weiterhin problematische persönliche Fortsetzung auf. Öffentlich schützt die Facade vor einem erfolgreichen No-op; sie löst die Lernblockade nicht. |
| Fachwechsel | `switchPersonalCurriculumSubject` **1362–1378** benutzt dieselbe persönliche Fortsetzung; `CoachToolFacade.switchLearningPlanSubject` **383–419** entscheidet bei veraltetem Plan für diesen Weg. Beide P1-Ursachen sind hier relevant. |
| Übergabe nach abgeschlossenem Ziel | `LearnerService.maybeAutoHandoffToLearningPlan` **10531–10564** überspringt inkompatible Pläne bereits vor ihrer Scope-Auswertung. Diese Quellprüfung zeigt keine neue direkte Bindung an einen veralteten Klausurtag. Einen kompletten Abschluss-/Handoff-Ablauf habe ich nicht zusätzlich ausgeführt. |
| Aktivierung | `activatePlans` **1030–1063** baut Pläne über `preparePlan` auf. Dessen Fokus-, Reihenfolge- und Fingerprintvalidierung **1575–1593** bleibt strikt. Der neue Fallback betrifft nicht die Zulassung eines ungültigen neuen Entwurfs. |
| Vorschau | `previewPlans` **977–999** validiert Entwürfe über denselben `preparePlan`-Weg. Keine Änderung, die einen unbekannten neuen Klausurinhalt still akzeptiert. Vorschau wurde hier anhand des Codes verfolgt, nicht als Browserablauf ausgeführt. |
| Prospektiver Fokus | `LearnerService` **4543**, **8223**, **8796** verwendet weiter `followedLearningScopeIds`. Dessen neue Öffnung bleibt innerhalb der persönlichen Projektion und der wirklichen Voraussetzungen; Befund 2 betrifft die Ermittlung des richtigen Fachbezugs. |
| Cockpit | `LearnerLearningPlanController` **70–91** liefert denselben Status bzw. dieselbe Planbeschreibung; `LearnerPlanTodayOverview.tsx:230` richtet die Fortsetzungsaktion an `subject.canContinue` aus. Kein separater reparierender Frontend-Scope. Ich habe keinen tatsächlichen Cockpit-Browsertest durchgeführt. |

Direkte Katalog-/Planauflösungen mit `learningScope(...)` verbleiben an mehreren Stellen. Die genannten Mutationspfade erreichen sie erst nach Entwurfsvalidierung oder `requireCurrentBlocks`; ihr bloßes Vorhandensein ist daher kein Gegenbeweis gegen die neue Regel. Die nachgewiesenen Fehler liegen im Rückfall auf gewöhnliches Lernen und im Fachbezug.

## 2. Gemischte Zustände

**Urteil: Teilweise bestätigt, zwei Kombinationen scheitern.**

| Fall | Eigene Evidenz |
|---|---|
| Vier neue Ursachen bei Planfolgen | Alle vier Originalfälle des neuen Tests bestehen in meinem Snapshot. |
| Gespeicherter vollständiger Klausurfokus, später veralteter Marker | In eigener Probe bleiben alle 20 gespeicherten Fokusziele erhalten. Die Frontier ist offen; kein stilles Löschen des Fokus. |
| Noch laufendes Ziel aus diesem Fokus | Ziel bleibt erhalten; Mastery bleibt gleich. Eigene Parameterfälle für Autopilot aus und an bestehen. Das sind reale gespeicherte Zustände mit demselben Fokusumfang wie bei Aktivierung, keine Behauptung einer zusätzlich durchgespielten Aktivierung. |
| Ein Plan mit gültigem und unbekanntem Klausurthema | Eigene Probe: ganzer Plan veraltet, Status ohne Klausurscope; keine Bindung nur an das noch gültige Thema. Gewöhnliche Fachfrontier bleibt vorhanden. |
| Gültige Mathematikklausur neben veraltetem Physikplan | Befund 2: Physikfrontier leer; Entfernung ausschließlich des Mathematikplans öffnet sie. Beide Autopilot-Werte geprüft. |
| Veralteter Plan mit inaktiven gewöhnlichen Lernblöcken | Befund 1: veröffentlichte Fähigkeit ohne erfolgreichen Übergang. |
| Pausierte abgeschlossene Einheitenzuweisung | Der bestehende reale Kontrolltest `aPausedCompletedAssignmentRetainsOpenGoalsAndASeparateResultStaysMastered` besteht in meinem Lauf, einschließlich unveränderter Prüfungsbelege. Die zusätzliche Kombination aus veraltetem Klausurplan und pausierter Einheit habe ich nicht vollständig ausgeführt. |

Zwei Pläne mit derselben `landscapeId` können im regulären Persistenzmodell nicht nebeneinander bestehen: `LearnerLearningPlan` hat die eindeutige Bedingung `(learner_id, landscape_id)`. Gleichnamige Fächer aus verschiedenen Landschaften sind davon zu unterscheiden; Status/Fulfillment gruppieren nach stabilem Fachschlüssel. Eine solche zusätzliche Mehrlandschafts-Fixture habe ich nicht ausgeführt und ersetze sie nicht durch die Ein-Plan-Mehrthemenprobe.

## 3. Was die alte Regel schützte

**Urteil: Die angeforderten Ergebnis- und Bewertungsgrenzen dürfen unverändert bleiben; im Diff sehe ich keinen Weg, der sie lockert.** Der alte explizite Klausurscope schloss die Wahl anderer Lernarbeit. Dies ist genau die Wirkung, die der neue Produktentscheid für nicht auswertbare Pläne aufhebt.

Die getrennten Grenzen werden weiterhin an eigenen Stellen gebildet:

- **Planverpflichtung und Anrechnung:** `planFulfillment`, **144–167**, verwirft inkompatible Planpflichten und erteilt dafür keine Anrechnung. Die übrige gemeinsame Fachanrechnung bleibt über `obligationsBySubject`, `creditWithheld` und die Completion-Projektion begrenzt. Diese Prüfung wurde durch S nicht entfernt.
- **Prüfungsauswertung und Einheitenzuweisung:** Die Änderung schreibt weder ein Prüfungsergebnis noch einen verifizierten Prüfungsbeleg und verändert keine Bewertungs-/Materialbindung. Die pausierte Einheitenkontrolle bestätigt unveränderte Belege für ihren konkret ausgeführten Fall.
- **Mastery:** Keine der geänderten Methoden schreibt Mastery. Die neuen Möglichkeiten normaler Lernwahl beseitigen weder die atomare Zielprüfung noch Ergebnis-/Prüfungsregeln im Schreibpfad (`LearnerService`, **4300–4345**). In meinen fortgesetzten Fokus-/Kontextproben bleibt Mastery unverändert.
- **Ungültige neue Auswahl:** `preparePlan`, **1583–1593**, validiert weiterhin die tatsächlichen Foki, Reihenfolge und Fingerprints. Ein gespeicherter veralteter Plan als unverbindliche Historie ist keine Erlaubnis, einen neuen unbekannten Klausurumfang zu veröffentlichen oder zu aktivieren.

Das ist eine begrenzte positive Quellprüfung mit konkreten Kontrollen, kein vollständiger Sicherheitsbeweis sämtlicher Assessmentpfade. Insbesondere muss die Reparatur der P1-Fälle die fortbestehende gültige Klausurbindung und die Einheiten-/Prüfungsanrechnung ausdrücklich als negative Kontrollen behalten.

## 4. Transaktionen

**Urteil: Für den tatsächlich untersuchten gewöhnlichen Clientfehler kein neuer Rollback-only-Effekt.**

Der relevante Unterschied ist der Fehlerverlauf, nicht die Annotation allein. `isLearningPlanCompatible`, **4577–4613**, ruft seine Validierer im eigenen Methodenrumpf auf und fängt deren gewöhnliche `ResponseStatusException` vor der Rückkehr aus dieser Methode ab. Im Frontierpfad ist der Aufruf innerhalb `LearnerService`; aus dem Planservice geht er durch den Serviceaufruf. Beim tatsächlich verwendeten unbekannten Klausurthema kommt `false` zurück, kein ungefangener Clientfehler aus diesem Aufruf. Die gesonderte Rootauflösung `resolveLearningPlanGoalIds`, **5174ff.**, behält die bereits für #206 eingeführte `noRollbackFor=ResponseStatusException`-Grenze.

Eigene reale Probe `reviewerBClientErrorCompatibilityDoesNotPoisonOuterTransaction`:

1. Gespeicherten Klausurtag auf unbekannte UUID ändern.
2. Eine äußere `TransactionTemplate`-Transaktion beginnen.
3. Die Kompatibilität durch den injizierten Service aufrufen: Ergebnis `false`, `rollbackOnly=false`.
4. Innerhalb derselben äußeren Transaktion den echten Coach-Kontext lesen: kein Fehler und weiterhin `rollbackOnly=false`.
5. Danach eine Präferenz schreiben und flushen.
6. Nach Ende der äußeren Transaktion erneut lesen: der Schreibwert ist gespeichert.

Die Probe besteht. Auch die beiden Fokus-/Kontextproben prüfen innerhalb einer äußeren Transaktion `rollbackOnly=false`. Dadurch ist die konkrete Falle eines geschluckten Clientfehlers mit anschließendem verlorenen Commit ausgeschlossen. Ich behaupte keine Entwarnung für beliebige künstlich aus einem anderen transaktionalen Bean injizierte Fehler oder Datenbankausfälle. 5xx-Fehler werden weiterhin geworfen; sie sollen keine normale Lernfreigabe vortäuschen.

## 5. Aufrufkosten vorher/nachher

**Urteil: Deutlich mehr Wiederholungen derselben Kompatibilitätsprüfung; operationslokale Wiederverwendung ist sinnvoll. Keine belastbare Aussage eines Gesamt-Latenzfaktors aus diesen Einzelmessungen.**

Gleiche eigene Spy-Fixture, ein gültiger Klausurplan, jeweils ein warmer Messaufruf. Der Vorherlauf verwendet die drei Produktionsdateien aus `a3f6b067df`, der Nachherlauf aus `1768850305`; die übrige Fixture bleibt gleich. Der vollständige MCP-Resume schließt seine Guards und den Folgekontakt ein. Zeiten sind Millisekunden.

| Operation | Kompatibilitätsaufrufe vorher → nachher | Summe Kompatibilitätszeit vorher → nachher | Gesamtzeit vorher → nachher |
|---|---:|---:|---:|
| Coach-Kontext über MCP | 4 → 18 | 116,2 → 237,7 | 1770,6 → 1192,7 |
| Direkter `resumeExplicitly` | 2 → 12 | 40,3 → 142,1 | 913,1 → 652,9 |
| Vollständiger MCP-Resume | 12 → 56 | 192,4 → 651,9 | 3180,8 → 2836,6 |

Beleg: [cost-before-after.actual.json](raw/reviewer-b/cost-before-after.actual.json), XML in `before-cost/` und `after-final-probes/`. Der Host führte parallel andere Arbeit aus; JVM-Erwärmung und Instrumentierung beeinflussen diese einzelnen Zeitwerte. Die Gesamtzeit ist im Nachherlauf sogar kleiner. Daraus folgt **kein** seriöser Beleg für eine entsprechende Gesamtbeschleunigung oder -verlangsamung. Die Anzahl wiederholter vollständiger Prüfungen desselben Plans ist dagegen unmittelbar beobachtet.

`hasExamScope` wird unter anderem aus Status und Kandidatenauswahl wiederholt aufgerufen; hinzu kommen die neuen Kompatibilitätsprüfungen der verschiedenen Frontierleser. Ein konsistenter operationslokaler Plan-Auswertungsstand könnte Kompatibilität und daraus abgeleitete Scope-Entscheidung je Plan einmal bilden und in diesen Lesern wiederverwenden. Kein dauerhafter globaler Cache; Änderungen an Curriculum, persönlicher Auswahl, Planrevision oder Blockinhalt dürfen nicht überlebt werden. Ich würde diese Wiederverwendung mit der semantischen Vereinheitlichung prüfen. Allein aus den gemessenen Gesamtzeiten begründe ich keinen weiteren Freigabestopp.

## 6. Tests und notwendige Ergänzungen

**Urteil: Die vier neuen Fälle sind wertvoll, ihre Assertions decken den komplexeren Fallback nicht ab.** Der neue Test erstellt einen aktuellen **aktiven** Lernblock und schaltet nur den Plan unbrauchbar. Damit erreicht er gerade nicht den früher üblichen Klausurplan aus inaktivem allgemeinem Kurs plus aktivem Klausurtag. Die nichtleere Frontier und der erfolgreiche einfache Resume sind gute Kontrollen, aber kein Nachweis für die anderen Zustände.

Vor Übernahme nötig:

1. Den ersten P1-Fall als Regression über den echten veröffentlichten Coach-/MCP-Pfad aufnehmen: `resumeAvailable` bzw. `canContinue` muss zu einem erfolgreichen tatsächlichen Übergang führen. Ein `doesNotThrow` beim direkten Service oder nur ein nichtleerer Frontierwert genügt nicht.
2. Den gemischten Fall mit **aktivem** Physik-Lernblock, gültiger fremder Mathematikklausur und veraltetem Physikplan aufnehmen. Der Kontrollwechsel nur des fremden Plans muss die Fachfrontier nicht verändern. Beide Autopilot-Werte sind relevant.
3. Die echte äußere Transaktionsprobe samt erfolgreichem nachfolgenden Commit erhalten. Eine testweit zurückgerollte `@Transactional`-Fixture allein belegt diese Commitgrenze nicht.

Zusätzlich sinnvoll: geändertes Personal Curriculum bei schon laufendem Klausurziel; Kombination mit pausierter Einheitenzuweisung; ungültige neue Aktivierung/Vorschau ohne Persistenzänderung; Fokuswechsel außerhalb einer weiterhin **gültigen** Klausur muss weiterhin abgewiesen werden. 5xx darf nicht als „gewöhnliches Lernen freigeben“ verschluckt werden. Die reguläre eindeutige Planidentität und gleichnamige Fächer aus mehreren Landschaften verdienen getrennte Fixtures.

Meine gültigen Proben bestätigen vier Originalfälle, die eigene Clientfehler-/Commitprobe, beide laufenden Fokuszustände, die pausierte Einheitenkontrolle und den Ein-Plan-Mehrthemenfall. Die drei funktionalen Fehlerinstanzen – einfacher No-op und gemischter Frontierfehler bei zwei Autopilot-Werten – sind als Fehler erhalten, nicht in erfolgreiche Assertions umgeschrieben. Die anfänglichen eigenen Zusatz-Fixtures mit unzulässigem Exam-only-`upsert` wurden vor einer fachlichen Aussage korrigiert; ihre frühen 409 sind keine Produktionsbefunde. Ebenso war der erste Start mit symlinkten, vom Materialpfadschutz abgewiesenen Fixture-Dateien ein Aufbaufehler meiner Probe; danach wurden die zwei Materialdateien physisch aus dem geprüften Commit gebunden. Die Rohprotokolle bleiben erhalten.

**Empfehlung:** Die beiden P1-Lücken schließen und mit den genannten Kontrollen nachweisen. Die neue Grundregel und die vier neuen Fälle beibehalten; keine Bewertungs-, Mastery- oder Anrechnungsgrenze öffnen, um einen Navigationstest grün zu bekommen.
