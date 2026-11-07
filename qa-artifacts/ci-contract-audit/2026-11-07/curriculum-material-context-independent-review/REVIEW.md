# Unabhängiger enger Review des gemeinsamen Materialkontexts

**KEEP für den exakt versiegelten Codekandidaten.** Der belegte Deutsch-Fehlpass ist geschlossen: Die echte17/17-Baseline mit frisch gebundenem M6-Bericht besteht weiterhin, während dieselbe Quelle mit ausschließlich einem neuen Draftstatus sowohl den alten unveränderten M6-Bericht als auch den frischen Baselinebericht zurückweist. Die gemeinsame normale Assessmentsuite besteht. Ein zusätzlicher Implementierungshold wurde in diesem begrenzten Review nicht gefunden.

Geprüfter Kandidat: `curriculum-material-context-candidate/`, Inventory `4c1888cd8d06f9300df5e73befba05a72006fc8160c15ffc24a0f556c1ee512a`, Seal `e62888a070b607d3333be466dc6aa6d30e6ace7c019bfd2cb655331ccc790e2d`. Er umfasst acht Code-/Test-/Dokumentationsdateien. Alle21 Curriculumquellen sind unverändert. Die vorherigen unabhängigen Reviews mit Seals `f38fd7f6f2e18fe67c05a37e09a67c687fa02dcf41a03800b377b3c0134895a4` und `069ff6ca36b6a1c3f22ada543ea384d5d572506a1163e576b0f9b40ce23a3777` bleiben bytegleich.

## Formale und inhaltliche Entscheidungen

| Prüfaspekt | Entscheidung | Ergebnis |
|---|---|---|
| Tatsächlicher Deutsch-Fehlpass | KEEP, geschlossen | Drei neue unabhängige standalone Prozesse ergeben0/1/1: echte Baseline M6; exakt alte Draftquelle mit exakt altem M6-Bericht; gleiche Draftquelle mit frischem Baseline-M6-Bericht. Beide Negative melden ausschließlich Assessmentfehler. |
| Unveränderliche Source | KEEP | Capture kopiert Bytes, parst selbst und friert jede Landscape mit `goals` tief ein. Buffer- und Objektmutation können die eingefrorene Erwartung nicht nachträglich ändern. Eine ungecapturte Quelle erhält keine bestandene Autorität. |
| Scope- und Viewbindung | KEEP | Sourcepfad/-hash/-owner, Definitions-/Requiredmengen, native Discoveryfehler und aktuelle Viewbytes sind im authentischen Kontext und Frame gebunden. Scope-/Discoverylisten werden kopiert; der native äußere Scope friert seine Listen ebenfalls ein. |
| Pflichtverbrauch | KEEP | Jeder normale Owner benötigt den authentischen gemeinsamen Materialkontext. Beide vollständigen Serienmanifeste müssen mit seiner echten Erwartung übereinstimmen; nichtleere tatsächliche Materialfehlermengen blockieren. Keine leeren Ersatzdefaults oder boolesche Altfreigabe. |
| JSON-, Fabrikations- und Scope-Aliase | KEEP | Fehlende, rekonstruierte/JSON-, fremde oder geänderte Kontexte/Scopeaussagen scheitern. Ein flacher Scopeklon mit demselben authentischen Kontext und gleichen prüfrelevanten Werten bleibt zulässig. |
| Informatiktrennung | KEEP | Private WeakMap-Kindtags unterscheiden `material` und `retained`. Normale Fächer erhalten keinen Informatik-Historienvertrag; Informatik behält seinen bestehenden23+9-Vertrag. Dessen Constructor ist bis auf den Kindtag bytegleich. |
| Readinesssemantik und Reifegrenzen | KEEP unverändert | Konkrete Readinessfunktion samt allen Hilfen, Maturityfunktion und Floorprogramm sind unverändert. Es wird keine neue allgemeine Releasepflicht, genehmigte Hashliste oder semantische Textbewertung eingeführt. |
| Informatikgesamtqualität und andere bestehende Inhaltsbefunde | HOLD bleibt | Informatik bleibt real8/9; Own20-, G17-, Scope-, Residual- und Quellenbefunde sind nicht behoben. Dieser Codereview qualifiziert nicht alle Curriculum-Inhalte neu. |

## Tatsächlicher Codeumfang

Der normale native Discoveryweg baut für Nicht-Informatik-Owner den gemeinsamen Materialkontext. Er verwendet den bereits bestehenden Capture-/Freeze-/WeakMap-Mechanismus und dieselbe `concreteExamReadinessIssues`. Die Fehler werden intern aus der eingefrorenen Source berechnet: Struktur über alle Definitionen ohne Reviewstatuspflicht, Readiness über die vollständige Requiredmenge mit der vorhandenen Statussemantik. Fehlerlisten kommen nicht aus dem Bericht.

Der gemeinsame Consumer verlangt den passenden authentischen Kontexttyp, deckungsgleiche Scopeaussagen, eine tatsächlich erfasste Quelle, keine Discovery- oder Materialfehler und in **beiden** Berichten die vollständige Manifestgleichheit. Die TypeScriptfelder sind wegen der zwei Kontextvarianten beziehungsweise darstellbarer ungültiger Captures teilweise optional; im jeweiligen erfolgreichen Runtimezweig sind sie zwingend. Ein fehlendes `sourceMaterialContext` oder eine fehlende `source` führt deshalb nicht zu einem leeren Default oder Pass. Der standalone Floor baut seine Erwartung weiterhin frisch aus den Quellen und übernimmt sie nicht aus dem Report.

Die kleine gemeinsame Kontextkonstruktion ist keine konfigurierbare Freigabeebene: keine neuen Policies, `approved`-Felder, Quellenpasslisten, Registrydateien oder callerlieferbare Materialfehlermengen. Der vorhandene native Discoveryweg bleibt die Quelle der Scopeaussagen. Die neue Freezeanforderung ist in den bestehenden Testfixtures durch echte Captures angeschlossen; keine besondere schwächere Testfreigabe wurde hinzugefügt.

| Code | SHA256 |
|---|---|
| `app/scripts/lib/retainedAssessmentCoverage.ts` | `194113c2a985093a24d82e20bb8b3693165a36822f6cdadf27ee253cfea6973f` |
| `app/scripts/lib/curriculumAssessmentValidation.ts` | `61a1d9f7aa877c099a6e4047ed9460dd90b74521cca38c794cd763cdaf5f064a` |
| `app/scripts/generateCurriculumQualityStatus.ts` | `34aecfbada507483243c271ee6fa01b955fe1eaa75f627414d0c31bcf04d17e5` |
| Unverändertes `app/scripts/checkCurriculumMaturityFloors.ts` | `733ceb636e01ccc19b6cd6bde122fb631b978b4009028b73b24f315aa876a2e2` |

Alle acht exakten Vorher-/Nachherpins stehen in `input-verification.json`. Alle15 Payloads, der Overlayinhalt,1322 aktive Codeinputs,21 kanonische Quellen,58 vorherige Paket-/Reviewdateien sowie16 deutsche Rohbelege wurden aktuell verifiziert. Der private ausgeführte Code stimmt mit dem Overlay überein. Dieselbe Prüfung nach den Tests zeigt weiterhin keine Drift.

## Unabhängige Ausführung

Die drei zentralen deutschen Standalonefälle wurden gezielt neu ausgeführt; ihre Quellen und Artefakte stimmen bytegenau mit den versiegelten Belegen überein. Die Policy enthält ausschließlich den unveränderten aktiven deutschen M6-Eintrag. Source `c2c700c611d9596ea9abd9ef11a78df64c1a4a5c6e122f1e5a2941d8624134e9` und frischer Bericht ergeben EXIT0. Draftsource `98ddff610d5de7e78690a35b25388a05170de8f7e7bf9e9f0ad5272da307b1ca` mit altem beziehungsweise frischem unverändertem Baselinebericht ergibt jeweils EXIT1 Assessment, ohne Graphfehler. Der Graphbericht wurde nicht gefälscht.

Der vollständige logische Sourcevergleich bestätigt als einzigen Unterschied `2fb368b0-7b9d-5df0-99b6-6d719fd47f95.examData.reviewStatus`: ABSENT→draft. Der frische Baselinebericht verändert gegenüber dem bisherigen M6-Bericht ausschließlich die zwei Assessmentregeln; sämtliche Graph- und sonstigen Regelobjekte bleiben gleich. Die nativen Kandidatenbelege zeigen Baseline0/0→M6, Draft0/1→M3 sowie jeweils fehlende Aufgabe/Lösung/Scoring1/1→M3. Diese fünf Produzentbelege wurden als vorhandene Evidenz geprüft, nicht durch einen weiteren großen Produzentlauf ersetzt.

Der bestehende gemeinsame Entry `app/scripts/testCurriculumExamReadiness.ts` wurde unabhängig im nur lesbar gemounteten Kandidatenframe ausgeführt: **EXIT0**. Darin bestehen20 historische Informatikgruppen,25 Held-View-Fälle,15 aktuelle Informatikgruppen, T21/T22 mit positiven/negativen nativen Floorprozessen und sieben allgemeine Materialkontextgruppen. Die sieben allgemeinen Gruppen prüfen die echte deutsche17/17-Positivkontrolle, tiefes Freeze ohne Bufferalias, vier echte Sourcefehler,16 Lösch-/Erfindungsfälle in beiden Manifesten, fehlende und rekonstruierte Kontexte, Scopefabrikationen, den zulässigen flachen Scopeklon, frische redaktionelle Source gegen stale Frame und die ungecapturte Quelle.

Die übrigen acht deutschen Standalonegegenfälle, die acht Informatik-H1-CLI-Regressionsfälle und die normale Visualisierungsfixture wurden in diesem Review als versiegelte vorhandene Evidenz verifiziert, nicht zusätzlich erneut ausgeführt. Damit bleibt die Nachprüfung auf den belegten Fehler und den vereinbarten gemeinsamen Entry begrenzt. Die aus der gemeinsamen Suite kopierten T21/T22-Belege enthalten weiterhin die echte synthetische M6-Positivkontrolle und die isolierten Material-/Coverage-Floorablehnungen; sie sind keine M6-Abnahme der aktuellen Informatikquelle.

## Grenzen und Übergabe

Die Consumerbindung gilt strukturell nun für alle normalen Curriculum-Owner, mit dem bisherigen speziellen Informatikvertrag als getrenntem Zweig. Die konkrete neue Ende-zu-Ende-Prüfung betrifft den tatsächlichen Deutschfall und die bestehenden gemeinsamen Regressionen; sie ist keine neue fachliche Einzelabnahme sämtlicher Fächer. Allgemeine semantische Materialqualität und Schutz gegen beliebige Graphberichtfälschungen werden nicht behauptet.

Der Ausgangsbefund betrifft den unabhängigen aktuellen Floorverbrauch eines veralteten positiven Berichts. Er beweist keinen gesamten Remote-CI-Bypass: Main-CI erzeugt ihren Bericht zuvor neu. Beide Tatsachen bleiben getrennt festgehalten.

Root kann den exakt gepinnten Acht-Datei-Kandidaten nun übernehmen und die vereinbarte einmalige normale Gesamtproduktion mit separatem Floor ausführen. Deren tatsächliches Ergebnis bleibt offen. Informatiksource `50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8` und ihre echten8/9-Materialfehler bleiben unverändert; keine Ergebnis- oder Masteryübernahme findet statt.

Dieser Review schrieb ausschließlich sein neues privates QA-Paket und den RAM-Testbereich `/dev/shm/curriculum-material-context-review-20261107`. Keine aktive Datei, kein Git-/DB-Zustand wurde geändert; kein Full-CQR, SourceA-Probe oder Subagent wurde gestartet. Vorherige Reviews und Rohbelege bleiben unangetastet.
