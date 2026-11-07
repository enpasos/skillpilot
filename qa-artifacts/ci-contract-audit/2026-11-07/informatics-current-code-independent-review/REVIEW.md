# Unabhängiger Implementierungsreview des aktuellen Informatikanschlusses

**HOLD für die Anwendung dieses exakten Implementierungsstands.** Der endliche Definitionsanschluss und die DB-Metadatenreparatur bestehen den Review. Ein zusätzlicher konkreter Gegenfall zeigt jedoch: Der unabhängige Floor rekonstruiert den Definitionsvertrag, aber nicht die Materialfehlermengen. Ein umgeschriebener Readinessbericht kann die tatsächlichen CQR-204/CQR-202-Fehler 8/9 vor diesem Verbraucher verbergen. Die Reparatur gehört in den vorhandenen Source-/ExpectedContext-/Manifestverbrauch; neue Freigabeschalter, Register oder Historienruntime sind nicht nötig.

Geprüft wurde ausschließlich `informatics-e-reviewed-current-definition-candidate/`, Inventory `15c694336f9ab314861e6ba6a3a05672cdfdfb0b53c520f17241a65026c097e2`, Seal `47ae9d47d191cb5144cefbe17bb6b235b82bf0eea9f6f946aeec84bd95fef513`, Source `50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8`. Der Grundlagenvertrag hat Inventory `c5b1b4bec076cbd1e346cc063c88348f9683e177a9098a947d4b016171146e14` und Seal `08ef79d009d8ab9d4e308f2d3e10cde77368683739b85e0aeff308f4125d5ca1`. Alle 37 Payloads beider Pakete, die 46 Overlaydateien, 1318 aktive Codeinputs, 21 kanonische Kataloginputs und 34 ältere Source85-/Reviewdateien wurden nachgeprüft. Archiv, Kandidat und ausgeführter privater Code stimmen bytegenau überein. Kein aktiver Code, keine aktive Quelle, keine Datenbank und kein Gitzustand wurden geändert.

## Einzelentscheidungen

| Bereich | Entscheidung | Beleg und Grenze |
|---|---|---|
| Endliche Revision | KEEP | Codeeigene Revision stimmt vollständig mit dem versiegelten Plan überein. Alte24 = 15 Survivor + 9 Retirements; aktuelle23 = 15 + 8 Erstdefinitionen. Archiv und Inventar werden inhaltlich erneut berechnet. Keine aktuellen Sourcehashes als Passliste. |
| Survivor-/Erstverträge | KEEP | 5 declared Survivor, 10 weiterhin tatsächlich abwesende UNKNOWN-Felder, 8 konkrete `ExactMeaningEvidence`-Erstbindungen. Keine Übernahme von Ergebnissen oder Mastery. Q3 21/18 unverändert; Wachstums-, Austausch-, Bedeutungs- und UNKNOWN-Gegenfälle bleiben hart. |
| Capture und Manifest | KEEP | Kanonischer Pfad aktiviert die konkrete Revision. WeakMap, Freeze und vollständiger serialisierter Vergleich einschließlich Revision/Retirements bleiben erhalten. Alte synthetische historische Capture hat einen eigenen Pfad und ersetzt keine aktuelle produktive Capture. |
| Source85 → f4 → Source50 | KEEP | Exakt 14 Feldänderungen an sieben `reviewStatus`-/`reviewNote`-Paaren, davon 6 in Stufe1 und 8 in Stufe2. Alle anderen Source-/Curriculum-Overlaybytes bleiben wie Source85. Keine neue Coverage oder Materialzusage durch diese Metadaten. |
| Vier bekannte DB-Körper | KEEP | Native zentrale Readinessfunktion blockiert die vier exakten Task-/Lösungs-/Scoringkörper unabhängig von draft/released/Notiz. Zusätzlich geprüft: Metadaten vollständig gelöscht und Scoring-Schlüssel umgeordnet. Ein anderer vollständiger Körper wird nicht allein aufgrund der ID gebannt. |
| UUID und Fingerprintausweichversuche | KEEP | Großgeschriebene DB-UUID mit released führt zum harten aktuellen Vertragsfehler. Ein bloßer Body-Zeilenumbruch ändert den Fingerprint, scheitert aber an der geschützten Bedeutung. Das ist kein allgemeiner semantischer Materialprüfer. |
| Bestehende Consumer-/Floor-/Maturityregeln | KEEP für unveränderte Regeln, HOLD für ihre unvollständige Materialbindung | Die drei Implementierungen sind unverändert. Der neue Gegenfall zeigt dennoch eine bisher nicht durch die behaupteten Definitions-/Coverage-Forgeries abgedeckte Lücke. |
| Readinessreport-Forgery bei gültigem Definitionsvertrag | HOLD | Quelle und technisches Manifest sind gültig; nachträglich geglättete CQR-204/CQR-202-Status-/Fehler-/Metrikfelder werden vom gemeinsamen Assessmentverbraucher akzeptiert. Der standalone Floor verliert dadurch den Assessmentfehler. Siehe H1. |
| Informatikgesamtqualität | HOLD bleibt | Echter begrenzter nativer Producer: CQR-204 FAIL8, CQR-202 FAIL9. G17 und übrige Quellen-/Scope-/Own20-/Residualroutenbefunde bleiben unabhängig offen. Keine M6/M7-, Human-, Host- oder Produktionsabnahme. |

## H1: Ungebundene Materialfehlermengen im echten Floor

`createRetainedCoverageContext` bindet aktuell den frisch erfassten Source, die Definitions-/Requiredmengen und den technischen Retained-Vertrag. Die tatsächlichen `concreteExamReadinessIssues` werden erst im Producer berechnet. `hasCompletePassingCurriculumExamReadiness` prüft anschließend die Form und Vollständigkeit der berichteten Nullfehlerfelder und das identische technische Manifest. Ein gültiges Manifest mit tatsächlichen Materialfehlern enthält keinen unabhängig konsumierten Materialhold.

Der neue Gegenfall ändert **keine** Source-, Material-, Code-, Coverage-, View-, Revisions- oder Evidenzbytes. Er glättet lediglich die berichteten CQR-204/CQR-202-Status-/Metrik-/Fehlermengen. Die aktuelle Quelle hat unverändert acht Strukturmaterialfehler und neun Readinessfehler. Der direkte Verbraucher akzeptiert trotzdem. Entfernte serialisierte Revisions- oder Retirementfelder werden dagegen weiterhin abgelehnt; diese bestehende Bindung funktioniert.

Der unmodifizierte standalone `app/scripts/checkCurriculumMaturityFloors.ts` wurde als eigener Prozess dreimal gestartet. Er liest Quelle und Views frisch. Um den Test klein zu halten, enthält die private Policy exakt den unveränderten aktiven Informatik-M6-Eintrag; die neun übrigen Fachfloors sind außerhalb dieses begrenzten Laufs. Es fand kein Full-CQR statt. Die drei Eingabeartefakte stammen aus dem bereits versiegelten echten aktuellen Producer:

| Privates Artefakt | Standalone-Ergebnis |
|---|---|
| Passförmiger Graphbericht, ehrliche Materialfehler 8/9, behauptetes M6 | EXIT1, ausschließlich Assessmentfehler. |
| Ehrlicher roter G17-Graph, gefälschte Materialnullfehler, behauptetes M6 | EXIT1, ausschließlich Graphfehler. Der Assessmentfehler ist bereits verschwunden. |
| Passförmiger Graphbericht, gefälschte Materialnullfehler, behauptetes M6 | EXIT0, `curriculum maturity floors passed: 1 protected curricula`. |

Die letzte Kombination enthält zusätzlich eine explizite Graphberichtfälschung, weil die aktuelle Quelle einen unabhängigen G17-Hold hat. Es wird **nicht** behauptet, dass ausschließlich Readinessfelder einen ehrlichen roten Graphbericht durch den gesamten Floor bringen. Der erste Fall isoliert den echten Materialhold; der zweite zeigt sein Verschwinden; der dritte belegt die falsche vollständige M6-Annahme im standalone Prozess. Eine allgemeine Graphbericht-Härtung ist kein Auftrag dieses engen Reviews.

Reproduktion: `python3 qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-code-independent-review/run-standalone-floor.py`. Jeder Prozess hat eigenes Artefakt, stdout, stderr und vollständigen Befehl mit Hashes in `*.receipt.json`. Nur lesbare Bind-Mounts und ein flüchtiges `/tmp`; Netzwerk ist deaktiviert.

## Kleinster bestehender Anschluss für die Reparatur

1. Dieselbe bestehende Funktion `concreteExamReadinessIssues` muss vom echten erwarteten Kontext erreichbar sein. Ein enger Weg ist, sie einschließlich ihrer privaten Normalisierungs-/Placeholder-/Scoring-/Reviewstatushelfer in `app/scripts/lib/retainedAssessmentCoverage.ts` zu verlegen und von dort im Generator zu importieren. Das vermeidet eine zweite Readinessengine, Caller-Callbacks und einen zyklischen Generatorimport. Der DB-Fingerprintcode bleibt dieselbe konkrete Prüfung.
2. `createRetainedCoverageContext` berechnet intern aus dem bereits eingefrorenen Source die tatsächlichen Strukturfehlermengen über alle Definitionen (`requireReadyStatus=false`) und die Readinessfehlermengen über die aktuelle Requiredmenge (`true`). Fehlende Definitionen bleiben Fehler. Keine vom Caller akzeptierten Fehlerlisten, `approved`-Flags oder Passhashlisten.
3. Diese Ergebnisse gehören in den vorhandenen vertrauenswürdigen WeakMap-/Freeze-Kontext und seine vollständige Manifest-/Framebindung. Ein technischer Definitionsvertrag darf weiterhin PASS sein, obwohl sein Materialhold separat nichtleer ist; diese beiden Bedeutungen nicht zusammenwerfen.
4. Der gemeinsame Consumer in `curriculumAssessmentValidation.ts` muss nichtleere echte Materialfehlermengen ausdrücklich ablehnen und die sourcegebundenen serialisierten Befunde vollständig konsumieren. Eine fabricated/deserialisierte Kopie oder ein nachträglich auf Null geglättetes Reportfeld darf keine Erwartung liefern. Der unabhängige Floor nutzt denselben frischen Quellreader. Seine M6-Grenze und die Maturityfunktion müssen nicht gesenkt werden.
5. Frische konkrete Regression: ehrliche aktuelle Material8/9, Berichtsfälschung auf 0/0 und M6, entfernte/gefälschte Materialmanifestfelder, stale Source/Context, weiterhin gültige echte M6-Kontrolle, sowie eine isolierte Readinessverletzung. Vorhandene 15/9/8-, UNKNOWN-, Q3-, DB- und Coverage-Forgerytests müssen weiter bestehen. Keine neue große Producer- oder SourceA-Probesuite erforderlich.

Das ist eine konkrete Implementierungsempfehlung, keine bereits erfolgte Reparatur. Root hat die enge private Folgearbeit separat zugewiesen. Dieser Review verändert den geprüften Kandidaten nicht.

## Ausführung und Evidenzgrenzen

Die vorhandenen 14 aktuellen Revisionsgruppen wurden unabhängig im exakten, nur lesbar gemounteten Kandidatenframe erneut ausgeführt: EXIT0. Die sechs zusätzlichen Prüfpunkte umfassen fünf erwartete Ablehnungen/Schutzkontrollen und die tatsächliche H1-Akzeptanzbeobachtung. Die komplette bereits versiegelte normale Suite mit 20 historischen Gruppen, 25 Held-View-Fällen und T21-M6/isoliertem M3/Floor-Kontrolle wurde als vorhandene Evidenz verifiziert, in diesem Review nicht erneut ausgeführt. Der synthetische historische M6-Kontrollfall ist keine echte aktuelle Source50-M6-Abnahme.

Die drei codeeigenen Evidenzdateien außerhalb des 46-Datei-Overlays sind explizit in `source-and-pins-results.json` gepinnt. Bei einer späteren Aufnahme müssen diese unveränderten Dateien mit verfügbar bleiben; ihr Fehlen ist ein harter Fehler. Das Review bestätigt keine zusätzliche amtliche Abdeckung, keine Runtimekompatibilität alter Lernerergebnisse und keine Publikation.
