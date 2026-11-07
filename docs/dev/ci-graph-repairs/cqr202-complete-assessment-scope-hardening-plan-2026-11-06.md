# CQR202: begrenzter Scope- und Gate-Patchplan

**Stand: rein lesend geprüft, Implementierung nicht freigegeben.** Basis sind der feste 518-Regelkorpus, die tatsächlichen aktuellen 21 kanonischen Quellen und der unveränderte Generator `f1eac647b9f87302f102252aa5b005056ff2d00279f68a7d0541806d2c756357`. Informatik steht bei `f95c0a1186de2469e87c626d3c6b53895b1111bb3e5164cab8b1aabb78354372`, Chemie bei `a3994ef18ce0f7e060f1d4d63370af2d04e76c489e1785913a60fdf3e1cf686f`. Es wurde kein CQR-Producer, keine Spring-/DB-/Lerneraktion und keine Quellen-/Produktivcodeänderung ausgeführt. Dieses Dokument friert den vorgeschlagenen kleinsten vollständigen Gateumfang ein; es führt keine Lifecyclepolicy ein.

## Normpflicht und vorhandene Scopegrenze

- **N19** bindet die Task-/Lösungs-/Scoringstruktur eines Prüfungsgoals an `node-types.md`, Abschnitt „Schema extension (examData)“, sowie QM CQR-201. Die Strukturpflicht gilt auch einer weiterhin in einer aktiven kanonischen Datei vorhandenen Definition. Nichtangebot oder entfernte Contains-Platzierung ist keine bestehende Retirement-Ausnahme.
- **Q03/Q04** binden die veröffentlichte Curriculum-/Scope-Reife an die konfigurierten Routen- und Reviewscopes. QM CQR-201 beschreibt ausdrücklich die atomaren Kinder der konfigurierten terminalen Autonomiecluster. Der aktuelle CQR202-Aufruf übernimmt exakt diese Auswahl. Eine pauschale zusätzliche Freigabepflicht für jeden gespeicherten Autorendraft steht dort nicht.
- **Q01/Q05** verlangen kumulative Reife und unveränderte geschützte Floors. Eine neue reine Berichtsspalte ohne Einbindung in `deriveCurriculumMaturity` wäre kein Gate.
- **Q24** nimmt Prüfungen aus der gewöhnlichen Atomizitätslane heraus, nicht aus ihrer eigenen Assessment-QA. **U37** verlangt zusätzlich tatsächliche Aufgaben-/Rubrikeignung; weder die hier vorhandene Strukturheuristik noch deren Scopeerweiterung ersetzt diesen Inhaltsreview. Die PR83-Zielpflichten U12/U42 werden dadurch nicht als implementierter Mainvertrag eingeführt.
- Der tatsächlich konsumierte `ExamData.reviewStatus` ist ein Hard-Check-Gate: fehlend bedeutet vorhandene Legacydaten, ein explizit nicht freigegebener Status blockiert die Nutzung. Das steht in `app/src/landscapeTypes.ts:69` und wird durch `LearnerService.isExamDataReadyForHardCheck`/`hasBlockingExamReviewStatus` umgesetzt. Das ist keine Aussage, dass jede solche Definition strukturell mangelhaft oder allgemein retired sei.

## Tatsächlicher 925er-Bestand

Die öffentlichen vorhandenen Readinessfunktionen wurden auf alle 925 aktuellen `examData` angewandt; die aktuelle Profilkonfiguration und ihre tatsächlichen Atom-/Memoryprädikate wurden ebenfalls unverändert ausgewertet. Task-, Lösungs- und Statussignaturen aller 925 stimmen mit dem eingefrorenen Zensus überein. Die sechs generischen Informatiklösungen bleiben die bekannten Readinessfehler. Ein universeller ungefilterter Aufruf würde zusätzlich genau Chemie `ee494d08…` wegen `reviewStatus=needs_review` beanstanden; keine zusätzliche defekte Task-/Lösungs-/Rubrikstruktur wurde durch den vorhandenen Checker gemeldet. Dies ist keine inhaltliche Freigabe der übrigen Texte.

| Fach mit registriertem Routenprofil | Bisher geprüfte examData | Vorhandene examData | Bisher ausgelassen |
| --- | ---: | ---: | ---: |
| Biologie | 18 | 26 | 8 |
| Chemie | 107 | 117 | 10 |
| Deutsch | 1 | 17 | 16 |
| Geschichte | 1 | 15 | 14 |
| Informatik | 14 | 24 | 10 |
| Latein | 9 | 15 | 6 |
| Mathematik | 136 | 163 | 27 |
| Physik | 139 | 156 | 17 |
| Politik und Wirtschaft | 14 | 20 | 6 |
| Wirtschaftswissenschaften | 287 | 293 | 6 |
| Summe dieser zehn Fächer | 726 | 846 | 120 |

Weitere 79 Definitionen liegen in sechs Fächern ohne registrierte Routenprofile: Chinesisch10, Englisch14, Französisch14, Griechisch14, Musik13, Spanisch14. Sie sind deshalb nicht als Assessment- oder Curriculum-QA bestanden zu behandeln. Insgesamt sind **199 von 925 Definitionen bisher nicht durch den CQR202-Routenaufruf erfasst**.

130 dieser 199 gehören tatsächlich zu rekursiven Contains-Zweigen mit `release.kind=offer` und `release.status=released`. Davon liegen101 in den zehn bereits konfigurierten Fächern,29 in den sechs übrigen. Eine geschlossene zusätzliche Entdeckung dieser bestehenden veröffentlichten Angebote ist möglich, aber allein unvollständig: Die übrigen69 Definitionen sind damit nicht klassifiziert oder freigestellt.

## Warum Releaseentdeckung allein nicht genügt

Die zehn ausgelassenen Informatikprüfungen sind sämtlich unter zwei ausdrücklich veröffentlichten Angebotwurzeln enthalten: GK `bd075253-1e7e-57a2-9df4-2d0099dacba3` mit drei Aufgaben und LK `c764b417-2d6b-5f1f-ba1a-851bfb44fb24` mit sieben. Dafür genügen die vorhandenen Releasefelder und Contains-Referenzen; Phase, Titel, Tags oder Requires werden nicht zur Angebotsinferenz gebraucht. Die zehn Originale bestehen aktuell denselben Readinesshelper.

Daneben fehlen aber acht konkrete Deutsch- und acht konkrete Geschichteprüfungen **ohne solche Releasevorfahren**, obwohl sie in heutigen Lernerscopes gewählt werden. Der echte Backend-Read erfasste HE/SekII für beide Fächer jeweils G8/G9 und GK/LK: acht Projektionen,64 Goalvorkommen. Alle64 waren tatsächlich Target und sichtbar; der echte `isExamGoalUnavailableForHardCheck` lieferte jeweils false. Diese16 Identitäten würden bei einer reinen Erweiterung um Releasezweige weiterhin fehlen:

```text
Deutsch
2fb368b0-7b9d-5df0-99b6-6d719fd47f95
4631ba7a-77e8-5a74-b3d8-fc53e206fc40
aca05e9b-996e-5842-9d01-6bcf11e0fc2b
65c8d2fa-e229-562b-a3d8-b51de7f13b2c
46278a08-7d3d-52aa-9125-6fdb371cfad2
2f05ec27-de95-5875-9d6e-1739f1462c2e
d063b8d7-6bda-55c6-9f47-fd99269485b7
24aa27dc-5d86-5fcb-90c8-074b28e55b9d

Geschichte
957de50e-1bfa-5be0-a331-fb48ee226d2e
084d645a-8e87-5940-afd7-bc8053bbd102
a9c1e7f3-75c8-504a-bb8b-5c46b206e890
da2eea0a-4b44-52d2-94fc-5f56f1585b4c
b9e4658f-0627-5053-92e3-a8d64bee8469
0baeed64-882b-5846-a6f4-0ffa18f162dd
ba973405-774b-5552-a302-7966dc42e134
a427fafe-d960-54d0-999e-23b53557e801
```

Die restlichen drei nicht angebotenen zusätzlichen Definitionen innerhalb der zehn konfigurierten Fächer sind Chemie `2f53dea4…`, Chemie `ee494d08…` und Physik `3631c8f7…`. Keine erscheint in einer aktuellen eigenen Fachview-Targetmenge. Das ist keine Retiremententscheidung: alle drei bleiben unter N19. Insbesondere hat die erhaltene Physikdefinition keine Contains-Eltern, besitzt aber weiterhin `examData` und `reviewStatus=released`; ein schlechtes Material darf dadurch nicht aus der Strukturprüfung verschwinden. Außerhalb der konfigurierten Fächer bleiben zusätzlich50 Nicht-Offer-Definitionen; ihnen wird hier kein vollständiger Angebots- oder Reifestatus zugesprochen.

## Chemiegrenze maschinell statt aus Prosa

Für `ee494d08-9514-54f2-ac5e-eebc20ca8725` wurde nicht auf die freie reviewNote vertraut. Native Rollenfunktionen über alle352 authored Views finden das Goal in keiner der41 Chemiefachviews, aber als Target in drei allgemeinen Overviewbäumen. Die nackten Jurisdiction-/Kursfilter würden in neun Chemieviews passen.

Der echte Backend-Read mit unveränderten vorhandenen Klassen präzisiert dies:

- In allen16 aufgelösten NW/SN × G8/G9 × SekI/SekII × GK/LK-Konfigurationen ist das Goal weder Target noch Support noch sichtbar. Tatsächlich gewählt werden die nationalen Chemie-SekI-/SekII-Views.
- Bei beiden leeren/unaufgelösten Konfigurationen, Overview beziehungsweise Chemie direkt, ist es dagegen sichtbar und als Target enthalten. `CompositionViewService.isAuthoritativeForLandscape` ist im Repositorymodus false; der Authorityschalter gehört dort zum Paketmodus. Eine allgemeine Inaktivitätsbehauptung wäre somit falsch.
- Der echte `isExamGoalUnavailableForHardCheck` auf der unveränderten Definition liefert true. Frontier, `setActiveGoal` und `startCompletionAssessment` konsumieren diesen Guard. Das belegt die heutige Hard-Check-Sperre, keine allgemeine Retired-Ausnahme oder gelöschte Verpflichtung.

JShell-Read Exit0, keine Spring-/State-/DB-/Credentialcalls; Chemiebytes und `LearnerService.class` (SHA `67a99683c093fbe7059d178818631d1d0252dafcab14cbc93bceb0d2aa66b5be`) unverändert. Ein gültiger Autorendraft darf strukturell vorhanden und gleichzeitig nicht hard-check-bereit sein. Falls er später in einen verpflichtenden Scope gelangt, muss sein blockierter Status die Bereitschaft tatsächlich blockieren.

## Kleinster vollständiger Patchvorschlag

1. **Eine bestehende Prüflogik, zwei ausdrücklich verschiedene Aussagen.** Den vorhandenen Readinesskern so faktorisieren, dass Struktur-/Material-/Rubrikprobleme und der zusätzliche Release-/Reviewstatus getrennt auswertbar sind. Keine zweite Placeholderheuristik, neue Längenschwelle, Titel-/Phasenregel oder Goal-ID-Sperrliste. Der Standardaufruf `evaluateExamTaskReadiness` behält seine heutige strenge Semantik. N19 prüft die Struktur aller925 Definitionen einschließlich Drafts und erhaltener Nichtangebote; ein vorhandener, aber inhaltsleerer Lösungstext bleibt überall ein Fehler. Ein explizit blockierter Status allein ist keine Strukturverletzung.
2. **Vollständige aktuelle Bereitschaftsmenge statt nur Clusterkinder.** Für den eigentlichen Hard-Exam-/Maturitycheck dedupliziert vereinigen: bisherige konfigurierte Endpunkte; alle vorhandenen veröffentlichten `release.kind=offer`-Contains-Zweige; tatsächlich gewählte Prüfungs-Targets der vorhandenen geprüften Fachviews/-scopes. Für den dritten Teil die vorhandenen Projektions-/Render-/Filterfunktionen von CQR104 wiederverwenden, keine neue Scopeengine und kein unkontrolliertes Expandieren der drei reinen Overviewbäume. Die16 oben gemessenen Targets sind zwingende reale Kontrollen. Quellen-/Viewreferenzen und unvollständige Discovery bleiben fail-closed. Fehlendes reviewStatus bei Legacydaten wird nicht nachträglich in eine Releaseverletzung umdefiniert.
3. **Beide Ergebnisse im echten Curriculum-Meilensteinpfad verwenden.** Alle925 Definitionen müssen im Strukturmanifest vorkommen; verpflichtende aktuelle Prüfungen müssen mit dem vorhandenen `evaluateExamTaskReadiness` bestehen. Fehlendes, dupliziertes oder fehlerhaftes Ergebnis darf M6/M7 nicht zulassen. Der direkte globale Gateverbrauch gehört in `deriveCurriculumMaturity`; ein globaler Bericht allein genügt nicht. Lokale Scopeprüfungen und CQR201/CQR203 bleiben erhalten. CQR203 wird hier insbesondere nicht pauschal auf die196 Legacydefinitionen ohne reviewStatus/Coveragemetadaten erweitert.
4. **Keine Lifecycle- oder Quellenänderung.** Nichtangebot ist kein Strukturprüfungs-Opt-out. Es wird kein Retired-Feld, kein Migrations-/Passübertrag und keine pauschale Ausnahme für ee494d08 eingeführt. Statusoffene Drafts bleiben sichtbar als nicht bereit; ihre Freigabe wird nicht erfunden. Der konkreten Scope-/Bereitschaftsvereinigung und ihrer Einordnung in die veröffentlichte Meilensteintabelle muss Root vor Doing zustimmen. Aktuelle nicht konfigurierte Fächer bleiben nicht konfiguriert; dieser Patch erteilt ihnen keine Routen- oder M6-Freigabe.

Voraussichtliche produktive Arbeitsdatei ist allein `generateCurriculumQualityStatus.ts`; Regressionen gehören in das bereits hart verdrahtete `testCurriculumExamReadiness.ts`. Die bestehende Deep-Einbindung bleibt. Die Erweiterung schließt den Erfassungsumfang der vorhandenen Prüfungen; sie erhebt deren bisherige Strukturchecks nicht zu einer vollständigen Schema- oder Inhaltsvalidierung. QM-Dokumentation muss den bestehenden universellen N19-Strukturanspruch und den tatsächlich gewählten Bereitschaftsumfang korrekt unterscheiden. Die Source-, Exam-, Review-, ID-, View- und Floor-Dateien sind keine Reparaturfläche dieses Gatepatches.

## Echte Negativfälle und Einbindungstest

Bereits tatsächlich rein in RAM geprüft: zehn echte Info-Offer-Payloads als Positivkontrollen; je leerer Task, leere Lösung, leere Rubrik und bekannte vollständige Leerformel ergeben40 korrekte native Fail-Ergebnisse. Die16 tatsächlich gewählten Deutsch-/Geschichte-Originale bestehen; mit der bekannten Leerformel ergeben sich16 weitere korrekte native Fails. Das sind56 echte Payload-Gegenfälle, keine neuen Produktivtestdateien oder Voll-CQR-Erzeugung.

Nach Doingfreigabe als dauerhafte Regressionen:

- Jedes der zehn echten Info-Angebote wird trotz fehlender Praxisclustermitgliedschaft gefunden; alle vier Negativarten blockieren. Derzeitige Positivdaten bleiben grün.
- Je reales Nicht-Offer-Target aus Deutsch/Geschichte wird über die vorhandene Viewprojektion erfasst; eine bloße Releaseentdeckung darf diesen Test nicht bestehen.
- Ein erhaltener Exam ohne Contains-Eltern beziehungsweise ein aus dem Praxiscluster entferntes bekanntes generisches Exam bleibt in der universellen Strukturprüfung rot. Entfernen aus dem Angebot repariert keine leere Definition.
- Vollständiger nicht angebotener Autorendraft: Struktur kann bestehen, tatsächliche Readiness bleibt wegen seines Status blockiert. Derselbe Draft als veröffentlichter oder verpflichtend gewählter Prüfungs-Target muss das Bereitschaftsgate blockieren. Keine Ausnahme über reviewNote, unbekanntes Lifecyclefeld oder fehlende Profilauswahl.
- Echter vollständiger Graphcheck an einer gültigen Fixture, danach realer versteckter Examfehler → unveränderte vorhandene Ableitungen → M6/M7-Floorfehler. Kein früheres Info-M0 als Beweis. Ein positives Gesamtfixture besteht beide globalen Ergebnisse; fehlendes/dupliziertes Struktur-/Bereitschaftsergebnis bleibt negativ.

Offene fachliche Inhaltsreviews, U37-Auslassungstests, GK/LK-Angebotsidentitäten und die875-/41er-Frage bleiben getrennte Arbeiten. Der Scopepatch bescheinigt weder die Inhaltstauglichkeit der übrigen919 Aufgaben noch menschlichen Lernerfolg. Bis zur expliziten Doingfreigabe bleibt dieser Plan unapplied.
