# Begrenzte unabhängige Nachprüfung: sourcegebundene Materialfehler

**KEEP für den exakt geprüften Implementierungsnachfolger: H1 ist geschlossen.** Der bisherige Fehlpass und alle sieben zugehörigen Standalone-Gegenfälle enden nun mit EXIT1 und explizitem Assessmentfehler. Die tatsächliche Informatikquelle bleibt bei CQR-204 **FAIL8** und CQR-202 **FAIL9**. Dieser KEEP betrifft die enge Implementierung und ihre überprüfte Bindung; er ist keine M6/M7- oder Gesamtqualitätsfreigabe.

Geprüfter Kandidat: `informatics-material-context-bound-candidate/`, Inventory `7802c03ee631d2ce023c7bd54ff31d22a6de999fa97c3cf73dcab8cc0fef7b49`, Seal `157269c7eec4805477c50e9fdd92f67488742b7a0ae11344489baa9c1886b6e2`. Die Quelle bleibt `50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8`. Der alte HOLDreview mit Seal `f38fd7f6f2e18fe67c05a37e09a67c687fa02dcf41a03800b377b3c0134895a4`, einschließlich seines ursprünglichen EXIT0-Rohbelegs, bleibt bytegleich.

## Entscheidungen

| Gegenstand | Entscheidung | Tatsächlicher Befund |
|---|---|---|
| H1: Reportnullfehler trotz echtem Materialhold | KEEP, behoben | Die authentischen, frisch aus der Source berechneten Fehlermengen blockieren den Consumer vor jeder Anerkennung geglätteter Reportfelder. Alle acht tatsächlichen CLI-Fälle unabhängig wiederholt: EXIT1 Assessment. |
| Pflichtteile in beiden Serienmanifesten | KEEP | `sourceMaterialFailures` besitzt zwei obligatorische Mengen ohne leere Ersatzdefaults. Beide Berichte müssen vollständig mit dem authentischen Manifest übereinstimmen. Zehn gezielte Lösch-/Erfindungsfälle bestehen auf einer ansonsten tatsächlich gültigen Kontrolle. |
| Reine Statusverletzung | KEEP | Einziger released→draft-Wechsel in der bestehenden nativen Kontrolle: technische Bindung PASS, Struktur0/Readiness1, M3. Gefälschte Nullfehler bleiben abgelehnt, auch bei behauptetem M6/M7 und im frischen standalone Prozess. |
| Capture-/Kontextgrenze | KEEP | Materialfehlermengen werden intern aus derselben eingefrorenen Source und den vorhandenen Scope-IDs berechnet. WeakMap-/Freeze-/Framebindung bleibt maßgeblich. Stale Source/Context sowie rekonstruierte/JSON-Kontexte scheitern. |
| Äußerer flacher Scopeklon | KEEP, zulässig bei unverändertem Inhalt | Der Consumer verlangt weiterhin den authentischen RetainedContext und passende Definitions-/Requiredmengen. Ein semantisch gleicher flacher Scopeklon benötigt keine neue äußere Objektidentität. Geänderte prüfrelevante Felder sind damit nicht freigegeben. |
| Revision und Quellenumfang | KEEP unverändert | Source, Views, Materialien, Scoring, Coverage, IDs, historische Archive, 15/9/8-Revision und acht Erstbindungen sind bytegleich zum Vorgänger. Keine neue Readinessengine, Freigabepolitik, Quellhash-Passliste oder Historienruntime. |
| Gesamter Informatikstand | HOLD bleibt | Technischer23-Zeilen-/9-Retirement-Vertrag PASS, zugleich reale Materialfehler8/9 sowie die unabhängigen G17-/Scope-/Own20-/Residual-/Quellenholds. Kein Schluss auf Gesamt-M6/M7. |

## Geprüfte Implementierung

Die bisherige `concreteExamReadinessIssues` einschließlich ihrer Text-, Scoring-, Status-, Placeholder- und DB-Fingerprinthilfen ist bis auf das neue `export` bytegleich aus dem Generator in den bestehenden Retained-Helper verlegt. Der Generator verwendet dieselbe Funktion. Die aus der echten Source ermittelten Fehlermengen verwenden für Struktur alle Definitions-IDs ohne Statuspflicht und für Readiness die vollständigen Required-IDs mit Statuspflicht. Fehlende Definitionen zählen als Fehler. Es gibt keinen Parameter für callerlieferbare Materialfehlerlisten.

Der vorhandene Context friert beide Mengen ein, bindet sie an seinen WeakMap-Eintrag und nimmt sie in `frameDigest` sowie das vollständige Manifest auf. Der technische Vertragspass bleibt von diesen Materialholds getrennt. `hasCompletePassingCurriculumExamReadiness` verlangt einen authentischen Context, weist dessen nichtleere Materialfehlermengen zurück und prüft das volle Manifest nun in **CQR-204 und CQR-202**. Fehlende neue Manifestteile können keinen alten Kompatibilitätsmodus auswählen. Die Maturityfunktion und das standalone Floorprogramm sind unverändert.

Exakte Codepins:

| Datei | SHA256 |
|---|---|
| `app/scripts/lib/retainedAssessmentCoverage.ts` | `9f7db7e2f785ab1a2721d033e63acd53c35aa4fc52749c0f6a279247dfedae04` |
| `app/scripts/lib/curriculumAssessmentValidation.ts` | `3a203d7f072e8eef9d19219c41e22ad3a2a81762e87aec90589afebcc1bd3fea` |
| `app/scripts/generateCurriculumQualityStatus.ts` | `28d8c2971377e73ed8f0967da0a1031f065205051a64f84431a592dadd830cd2` |
| Unverändertes `app/scripts/checkCurriculumMaturityFloors.ts` | `733ceb636e01ccc19b6cd6bde122fb631b978b4009028b73b24f315aa876a2e2` |

`input-verification.json` enthält zusätzlich die exakten Pins aller sechs geänderten Dateien einschließlich beider Tests und Dokumentation. Verifiziert wurden alle15 Kandidatenpayloads, die kumulativen47 Overlaydateien, deren Delta,1318 aktive Codeinputs,21 kanonische Kataloginputs und beide Vorgänger-/Reviewpakete. Archiv, privater Kandidat und tatsächlich ausgeführter privater Codeframe stimmen überein. Die abschließende Wiederprüfung nach den Tests zeigt weiterhin keine Drift.

## Unabhängig wiederholte Ausführung

`run-recheck.py` startet die acht vorhandenen echten CLI-Gegenfälle mit bytegleichen Eingabeartefakten neu. Der Floor liest jeweils die aktuelle Source50 und ihre Views selbst. Die private Policy enthält exakt den unveränderten aktiven Informatik-M6-Eintrag; andere Fachfloors liegen außerhalb dieser begrenzten Prüfung. Insbesondere wird das frühere vollständige EXIT0-Artefakt jetzt als Assessmentfehler abgelehnt. Auch frische passförmige Graphberichte mit gefälschten Materialnullfehlern sowie zusätzlich gelöschten oder genullten Manifestteilen scheitern. Alle acht Exitcodes sind1.

Zusätzlich wurden die vorhandenen15 aktuellen Revisionsgruppen und die native `testRetainedAssessmentCoverageChain.ts` unabhängig erneut ausgeführt: jeweils EXIT0. T22 prüft die zehn fehlenden/erfundenen Serienmanifestteile auf einer gültigen Kontrolle, die isolierte Statusverletzung, alte/neue Kontexttrennung und M6/M7-Ablehnung. Ihre neue frische Material-Floor-CLI endet EXIT1. T21 behält seine echte native Graph-/Readiness-M6-Positivkontrolle samt positiver Floor-CLI EXIT0 und den isolierten Coveragefehler M3. Diese fest gepinnte historische Synthetik ist **keine** M6-Abnahme der aktuellen Source50. Der bestehende Prozessloader bleibt ausdrücklich auf seine isolierten Fixturepins beschränkt; diese Testtechnik wurde hier nicht erweitert.

Die Native-Producerdaten im Kandidaten wurden inhaltlich gegen beide vollständigen Serienmanifestteile verglichen:23 Definitions-/Required-/Checked-IDs,23 technische Zeilen,9 Retirements, authentische Struktur8/Readiness9 und Consumerablehnung. Ein zusätzlicher Produzentlauf war für diese Nachprüfung nicht nötig. Die vollständige fokussierte Gesamtsuite wurde nicht nochmals ausgeweitet oder wiederholt; ihr versiegelter EXIT0-Beleg bleibt ergänzende Evidenz.

## Grenze und Übergabe

Die direkte Consumerhärtung durch `sourceMaterialFailures` gilt aktuell für den bestehenden **Informatik-RetainedContext** (`RETAINED_INFO_OWNER`). Sie beweist keine gleichartige Reportmanipulationssicherheit anderer Fächer. Die unabhängige Bindung echter Materialbefunde im allgemeinen fachübergreifenden Consumer bleibt ein separater Auditpunkt; sie wurde hier weder erweitert noch nachgeprüft. Ebenso ist dies kein allgemeiner Nachweis einer gegen beliebige Berichtsfälschung abgesicherten Graphprüfung. Diese Grenzen ändern den präzise geschlossenen Informatik-H1-Befund nicht.

Es gibt aus diesem begrenzten Nachreview keinen verbleibenden H1-Implementierungshold und keine sachlich begründete zusätzliche Codeforderung. Root kann den exakt gepinnten Kandidaten in der bereits vereinbarten Reihenfolge übernehmen und anschließend den einen normalen Gesamtproducer sowie den separaten Floor ausführen. Der reale Inhalt bleibt rot; aus dem technischen Vertragspass darf kein M6/M7 erzeugt werden.

Keine aktiven Code-/Quelländerungen, Git-/DB-Zugriffe, Full-CQR-, SourceA-Probes oder Subagenten wurden durch diese Nachprüfung ausgeführt. Geschrieben wurden nur dieses neue private Reviewpaket und sein isolierter RAM-Testbereich `/dev/shm/informatics-material-context-review-20261107`. Die unverändert benötigten externen Evidenzpins des bisherigen Kandidaten bleiben weiterhin Voraussetzung seiner Aufnahme.
