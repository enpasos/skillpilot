# ZB: neue Bewertungsidentität erforderlich

Die Ausnahme der 11:00-Entscheidung ist erfüllt: Ein zulässiger alter Erfolg unter `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` weist eine neu qualifizierte freiwillige ZB-Prüfung weiterhin als bestanden aus, obwohl er den verlangten Modellidealisierungskern nicht nachgewiesen hat. Ein fachlich akzeptierter Nachfolger benötigt deshalb eine eigene Assessment-ID. Dieser Audit aktiviert nichts und beurteilt keinen neuen Aufgabenentwurf.

Die auf `2a70254ca4` ausgelieferte Fassung hat 22/36 BE. [counterexample.md](counterexample.md) beantwortet Aufgaben 1–5 vollständig und lässt 6 leer: 30/36 ist ein zulässiger Altpass ohne Begründung von Massepunkt/Reibungsfreiheit oder deren Grenzen. Die unveränderte MOD-Claimliste ersetzt diese fehlende Evidenz nicht. Auch die spätere 36/36-Fassung verlangt in 6.4 nur die Funktion vernachlässigbaren Luftwiderstands; dessen situationsgerechte Rechtfertigung soll erst die neue Task 6 erzwingen.

Der native Audit benutzt eine temporäre Unterklasse des vorhandenen `ClaudeV1CompletionRouteIntegrationTest`, den echten Spring/H2-Kontext, dessen Start-/A–D-Vorbereitung und echte Mastery-/VerifiedExamPass-Persistenz. Nur synthetische Lernende werden angelegt. Alle 3 selektierten Fälle sind PASS, keine Fehler/Skips: alter 30/36-Erfolg bei 22er-Schwelle,36/36-Fassung und Roh-Mastery ohne Beleg. Lauf 10:06:12–10:08:05 UTC, Exit 0, Produktcommit `a3a0a8517e33d3519dcd238181e3afedfbaadb95`.

| Wirkung | Natives Ergebnis |
| --- | --- |
| Roh-Mastery | UUID bleibt1; auch ohne Materialbeleg wird freiwillige ZB als bestanden angezeigt. |
| Alter VerifiedExamPass plus Mastery | Alter Fingerprint `91697c63…` bleibt erhalten; auf aktuellem Material `eff1ba5a…` trotzdem `mastered=true`, `startAvailable=false`, `voluntary=true`. |
| Materialprüfung | `unitPartMaterialCurrent` ist für ZB true, selbst nach einer rein lokalen Taskänderung mit anderem Hash. Die Prüfmenge enthält nur echte A–D-Pflichtteile. |
| Strikte Kontrolle | Ein ausdrücklich synthetischer gebundener Einzelteil lehnt den alten Beleg ab. Er ist kein tatsächlich vorhandener ZB-Teilevertrag. |
| E.1-Abschluss | Vier Pflichtteile bleiben 4/4; vollständige `unitAssessment`-Antwort unverändert. |
| MOD global/Planung | Keine neue MOD-Mastery oder MOD-Gutschrift. Nur bestehende BES-Anrechnung via D. |

Ein Beleg allein ohne Roh-Mastery wurde nicht als optionaler Erfolg behauptet oder separat getestet: Die freiwillige Anzeige liest die Mastery; Aufgabenbelege werden für gebundene Teile ausgewertet. Die heutige fehlende globale MOD-Anrechnung begrenzt die Wirkung, behebt aber nicht die falsche freiwillige Abschlussanerkennung eines Nachfolgers.

Quellen, jeweils auf dem getesteten Commit und mit exakten Zitaten/SHA in [sources.actual.json](sources.actual.json):

- `AGENTS.md:1216–1224`: Anerkennungsbedeutung pro Assessmentidentität stabil; neue Bedeutung nur mit eigener Identität oder ausdrücklich geprüfter Migration.
- `docs/concept/skill-graph/source/chapters/05-assessment.en.md:73–99`: R2 verhindert einen Erfolg ohne Kern; R5 verbietet die Erweiterung alter Ergebnisse. Der Identitätsabsatz183 ist **Proposal**, kein zusätzlich angenommener Vertrag.
- `Mastery.java:15–49`, `CompletionApplicationService.java:216–223`: UUID-Mastery wird in die aktuelle Abschlussrechnung übernommen.
- `LearnerService.java:1105–1120,1173–1186,1400–1409`: optionale Bestanden-Anzeige/Startschutz nach Mastery; Materialänderungsmenge nur aus `contract.parts()`. Der wirkliche Start-Guard bei1596–1613 verlangt dieses verfügbare unbestandene Angebot und lehnt andernfalls mit409 ab (Source-Trace; kein separater Startversuch im Audit).
- `UnitAssessmentContract.java:36–57`, `LearnerService.java:958–1018`: gebundene Teile prüfen Aufgaben-/Rubrik-/Materialhash, Planungsfreigabe zusätzlich die genaue Releasebindung.
- `VerifiedExamPass.java:28–73`, `CoachToolFacade.java:754–758`: Materialhistorie bleibt getrennt von binärer Mastery; regulär werden beide im selben bewerteten Erfolg geschrieben.
- `app/src/utils/levelCompletionApi.ts:183–202`: Frontend übernimmt optionale Mastery, striktes `materialCurrent` gilt für Teile. `app/scripts/lib/learningUnitRecognition.ts:13–22` erklärt R5 ausdrücklich als nicht modelliert.
- `ClaudeV1CompletionRouteIntegrationTest.java:1823–1892`: vorhandene MP-Regression erhält Alt-ID/Altbelege ohne Übertragung auf neue UUID/MOD, bei unveränderten vier Pflichtteilen/BES.

Wie bei MP: Alte ZB-UUID und tatsächliche Materialien/Ergebnisse historisch auflösbar halten, einen fachlich akzeptierten Nachfolger unter eigener UUID am vorgesehenen freiwilligen Platz anbieten, keine Alias- oder Masteryübertragung. Dies verlangt keine neue ID für jede belanglose Rubrikreparatur; hier fehlt alten gültigen Erfolgen gerade der künftig zwingende Kern.

Rohes JUnit-XML bleibt temporär; der gekennzeichnete Auszug entfernt Systemausgaben. Maschinenbericht: [identity-review.actual.json](identity-review.actual.json). Der angekündigte Post-Score-Finalsmoke bleibt gesondert ausstehend.
