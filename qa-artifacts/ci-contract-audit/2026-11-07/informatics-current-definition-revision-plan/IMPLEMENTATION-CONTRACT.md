# Endlicher Anschluss der aktuellen 23 Informatik-Prüfungen

**Entscheidung:** Der vorhandene sourcegebundene Retained/CQR-Verbrauch darf genau den hier belegten Autorenübergang von den historischen 24 zu den aktuellen 23 Definitionen aufnehmen. Dafür sind keine weiteren Q3-IDs, Ergebnisaliase, Lernerdatenänderungen oder neue Runtime nötig. Der unabhängig verglichene Eingang ist Source `50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8`. Das ist ein konkreter Implementierungsvertrag und technische Admissibilität der Definitionen, noch keine implementierte Gatefunktion, aktive Quelle oder Gesamtqualitätsfreigabe.

Die vorhandene historische Quelle `85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e` und ihr 24er-Inventory bleiben unveränderte Auditdaten. Die frühere Pflicht, jede dieser 24 IDs heute aktiv zu halten, wird für exakt die neun unten bestimmten Entfernungen durch die übermittelte Ownerentscheidung ersetzt. Daraus folgt keine Erlaubnis, die Bedeutung überlebender oder neu eingeführter IDs später still zu erweitern.

## 1. Tatsächliches Delta mit denselben nativen Funktionen

`compare-native.mts` verwendet die aktuelle produktive Funktion `resolveRetainedCoverage` und eine wortgetreue, separat gepinnte read-only Extraktion der aktuellen nativen Vorbereitungsfunktion. Keine zweite Expansion wurde programmiert. Beide Funktionen wurden tatsächlich auf die exakten alten 24 und neuen 23 Definitionen angewendet. Der erste Vergleich zu Source85 und der finale Vergleich zu Source50 bleiben getrennt erhalten.

**15 Prüfungsidentitäten überleben.** Ihre geschützten Bedeutungen sind vollständig gleich. Bei elf sind sogar die vollständigen Goalobjekte gleich. Bei den vier bekannten DB-Materialholds ändern sich nur `examData.reviewStatus` und `reviewNote`; Coverage bleibt tatsächlich abwesend. Alle fünf überlebenden deklarierten Coverages und sämtliche von ihnen geschützten referenzierten Goalbedeutungen sind unverändert. Alle zehn bisherigen UNKNOWN-Fälle bleiben UNKNOWN.

| Prüfung | Alte → aktuelle deklarierte Coverage | Alte → aktuelle Vorbereitung |
|---|---:|---:|
| `0a16d19b-a826-5beb-b169-7a17fc7742f0` Paketstation | 37 → 37 | 44 → 44 |
| `755d3459-44ff-5608-8c62-3a69900b9940` Drohnenaufträge | 37 → 37 | 44 → 44 |
| `8877a2e6-ebf8-5b73-a88b-56d5145a20ba` Zutrittskontrolle | 21 → 21 | 28 → 28 |
| `0c346dc1-fdcc-5563-9154-28623d354574` Prüfprotokolle | 18 → 18 | 29 → 29 |
| `157e99a4-8517-5e16-92f8-8241827b7682` Ampelsteuerung | 16 → 16 | 21 → 21 |

Die bekannten T02/T03-Fälle 21→22 und 18→19 sind absichtliche Clustermutationen. T04 bindet die frühere V2-Quelle `7586e38b…`. **Dieser aktuelle Kandidat besitzt diese Drifts nicht.** Die Negativtests behalten ihre fachliche Bedeutung; sie rechtfertigen hier keine neue Q3-ID.

Die einzige geänderte Vorbereitung der Überlebenden betrifft `4e0668e3-edca-57f4-b258-df87f23d2b4e`, `b86e8ab3-2c12-5b6b-b515-1e7d457c99c2`, `d13e297f-505d-576a-9a86-11ab4d7896c9` und `d9892508-97b5-529e-9b9e-c4889fba2166`: jeweils 25→24. Ihre unveränderte direkte Voraussetzung `900065ef-d3ae-5145-b92c-50821795107a` enthielt früher fälschlich `875cb53c-b48d-5b2b-8cb0-e20f27534f16` (hierarchische/parallele Zustandsautomaten). Dessen bereits fachlich begründete Entfernung beseitigt eine unpassende DB-Vorbereitung. Aufgaben, Lösungen, Bewertung und eigene Examzusage werden dadurch nicht verändert oder erweitert. Die zehn UNKNOWN-Verträge erhalten dadurch insbesondere keine Atomliste. Eine neue Ergebnisidentität ist für diese begründete Vorbereitungskorrektur nicht nötig. Die bekannten fehlenden DB-Eingabematerialien bleiben eine eigenständige Inhaltsfrage und sind nun ehrlich als `draft` markiert.

## 2. Vollständige aktuelle Partition

`proposed-revision.json` enthält die vollständigen 15/9/8-ID-Listen. Sie müssen aus den tatsächlichen archivierten Quellen neu berechnet und exakt verglichen werden; eine bloße passende Anzahl genügt nicht.

Die **neun retirierenden alten Prüfungsdefinitionen** sind:

- `0df1bedd-5fda-5b3b-a959-c9610237bb3e` — Q2/41;
- `269a561b-f12e-57b2-9b05-e20f58c9dcf6` — Bibliothek;
- `ca2ff162-c71f-500f-8ce7-321ab2cf3f1f` — Festival;
- `342511c3-45fb-5783-b601-906149e78c2d` — alter GLOBAL-Endpunkt;
- `49ba66cf-accd-5938-a63e-f031bc786767` — alter E-Endpunkt;
- `65aa807f-f998-5648-a3a6-2e0e96dba714` — alter Q1-Endpunkt;
- `1ce620dc-93cf-579c-a286-e74451d0a4d7` — alter Q3-Endpunkt;
- `a5e33d4d-f312-51d2-816b-e0b10dd1e701` — alter Q4-Endpunkt;
- `bb651ed7-2674-580c-8916-ac5aa88d93f8` — alter unvollständiger Web-Endpunkt.

Die **acht prospektiven Erstdefinitionen** sind:

| ID | Deklarierte Atome | Vorbereitung | Aktueller Inhalt/Status |
|---|---:|---:|---|
| `309d4587-8080-5dd4-b329-785d9996a195` | 29 | 34 | GLOBAL-Platzhalter, draft |
| `7aec2086-2cfa-50d3-8503-b40e96ca3430` | 58 | 65 | Q1-Platzhalter, draft |
| `3277867f-ede2-5dc4-bd76-1b03d992e9d5` | 35 | 41 | Q3-Platzhalter, draft |
| `357fde7c-d334-50aa-be11-068ae8d832b3` | 19 | 24 | Q4-Platzhalter, draft |
| `6ebc2a67-ea20-5c4e-8a63-635f40438d6a` | 20 | 23 | Own20, draft; eigene Scope-/Quellenholds offen |
| `ea2ce31f-a0c7-5102-9213-ee1db5b2d475` | 4 | 5 | unabhängig geprüfte lokale E-Netzaufgabe, released |
| `c24236b2-d783-53be-84d5-96b4f4ef8159` | 4 | 5 | unabhängig geprüfte lokale E-Webaufgabe, released |
| `6aa77baf-a199-5c66-b07c-8dc23439acca` | 7 | 8 | unabhängig geprüfte lokale E-Codeaufgabe, released |

Dies sind technische Erstbindungen der tatsächlich erklärten aktuellen Leistung, keine Behauptung, die vier Platzhalter hätten bereits geeignete Aufgaben oder bewiesene landesweite Pflichtmengen. Eine spätere Änderung ihrer bindend gewordenen Leistung muss wieder offen beurteilt werden; fachlich anderes Material/andere Coverage wird nicht allein durch den ursprünglichen Draftstatus äquivalent.

Der private zwischenzeitliche E-Key `fa47a714-07c3-589b-a4e2-385a33e84c79` war nie Teil der historischen aktiven 24 und ist vor der ersten Aktivierung wieder ausgeschieden. Er ist weder historische Ergebnisidentität noch einer der acht zu bindenden Geburtskeys. Keine Alias-/Migrationszeile für ihn erzeugen. HE-held `f37f2d37-7686-5ed7-9c20-6f83d4fd2254` bleibt unregistriert und blockiert bei tatsächlicher Einführung.

## 3. Konkrete kleine Datenänderung im bestehenden QA-Vertrag

Im bestehenden Vertragsbereich eine **neue** Revision `revisions/2026-11-07-current23/` anlegen. Alte Archive, 24er-Inventory und Implementation-Pins werden nicht überschrieben oder umetikettiert. Die gelieferten Daten sind Vorschläge zur geprüften Codebindung, kein frei lesbares Runtime-Register:

1. `prospective-initial-source.json.gz` bytegleich als `initial-source.json.gz` übernehmen. Entpackter SHA ist Source50; komprimierter SHA `5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3`.
2. `proposed-current-inventory.json` bytegleich als `current-inventory.json` übernehmen, SHA `031ba9480f0c4d46149647cbaedd6aea02cd1a8235c9506b3d0a1894473f767d`. Es enthält exakt 23 Definitionen, 13 nichtleere Deklarationen und zehn echte abwesende Felder. Bei UNKNOWN gibt es keine leere Ersatz-Atomliste.
3. Die feste 15/9/8-Revision samt exakter Source-/Inventory-/Reviewpins in **einer privaten codeeigenen Konstante** des vorhandenen Helpers binden. `proposed-revision.json` darf nicht als vom Caller frei wählbare Policy gelesen werden. Kein `ignoreHistory`, keine Env-Umschaltung und kein pauschales `approved`.
4. Die acht vollständigen Zeilen aus `proposed-first-bindings.json` in den bestehenden `CONCRETE_BINDINGS`-Weg übernehmen. Das existierende `first-definition-binding` bindet Quelle, eigene geschützte Bedeutung, native atomare Coverage, alle geschützten referenzierten Goalbedeutungen und unabhängige Evidenzpins. Keine frei registrierbare neue Bindungs-API ergänzen. Für die 15 Überlebenden sind weder `same-declared-contract-repair` noch Äquivalenzausnahmen nötig.

Der Initialsource ist eine unveränderliche erste Definition, **keine Whitelist erlaubter künftiger Gesamtsourcehashes**. Künftige aktuelle Quellen werden weiterhin frisch erfasst; unbeteiligte fachlich zulässige Änderungen dürfen einen neuen Sourcehash ergeben. Die jeweilige Exam-/Coveragebedeutung muss dennoch gegen ihre feste Erst-/Bestandsbindung bestehen. Eine zusätzliche oder entfernte aktuelle Examidentität benötigt eine weitere explizite geprüfte Autorenrevision; die aktuelle Revision wird nicht automatisch aus dem Kandidaten neu geschrieben.

## 4. Minimaler Helperanschluss, unveränderte Verbrauchskette

In `app/scripts/lib/retainedAssessmentCoverage.ts` den bereits vorhandenen Vergleich erweitern, keinen zweiten Validator neben ihn stellen:

- Historische 24er-Quelle/Inventory weiterhin genau verifizieren. Aus ihnen, dem fest gebundenen Initialsource50 und seinem vollständigen Inventory die Partition intern neu bestimmen: History = 15 Überlebende ∪ 9 Retirementkeys; Initial = dieselben 15 ∪ 8 neue Keys. Mengen sind disjunkt, Owner und tatsächliche Definitionen eindeutig; keine Quelle oder Liste kann sich selbst durch ihre Zahl legitimieren.
- Die neun historischen Retirements nur bei der **konkret verifizierten Revision** aus der heutigen Anwesenheitspflicht nehmen. Aktuelle Wiederaufnahme einer solchen ID bleibt ein Fehler, kein neuer Erstkey. Die tatsächliche Abwesenheit sowie die bestehenden Graph-/Discoveryprüfungen für aktive typisierte Referenzen bleiben erforderlich. Keine freie Nichtangebot-/Draft-/Reviewnotiz erzeugt Retirement.
- Die bestehende Vergleichsschleife arbeitet fachlich unverändert für die 15 Überlebenden; die bestehende Erstbindungsprüfung arbeitet für die acht neuen Definitionen. Bei UNKNOWN bleibt die positive Aussage ausschließlich identische eigene Prüfungsbedeutung und weiterhin abwesende externe Coverage. Die vier DB-Statusnotizen sind bereits nach bestehender `protectedAssessmentMeaning`-Norm nichtsemantisch, werden jedoch von Readiness hart konsumiert.
- Fehlende überlebende oder initial gebundene Definitionen, zusätzliche ungebundene IDs, Duplikate, falsche Owner, unbekannte Einführung, breitere/kleinere deklarierte Mengen oder geänderte geschützte Bedeutung bleiben harte Fehler. `definitionGoalIds` müssen genau der aktuell erwarteten 23er-Menge entsprechen. Alle Definitionen bleiben im Strukturcheck; Required bleibt unabhängig aus aktuellen Routen/Offers/gerenderten Fachviews berechnet.
- Das Manifest erhält eine explizite gebundene Revisionsreferenz und **getrennte neun Retirementprüfungen**. `rows` beschreibt die 23 aktuellen Verträge; die alten 24er-Auditzeilen werden nicht zu neuen Birthzeilen umbenannt. Die bestehenden historischen Pins/IDs bleiben als Audit benannt. Retirementprüfungen sagen nur „in der aktuellen Definitionenmenge ausdrücklich entfernt und abwesend“, niemals „bestanden“ oder „Coverage=[]“. Für eine versionierte Manifestkennzeichnung darf eine neue interne Vertragsversion verwendet werden; die äußeren Scope-/ExpectedContext-/Reportfelder bleiben erhalten.
- `frameDigest` umfasst zusätzlich die konsumierten exakten Revisions-/Initial-/Evidenzpins, neben frisch aufgenommenem aktuellem Sourcepfad/Owner/SHA, aktuellen Viewbytes und den tatsächlich entdeckten Definitions-/Requiredmengen. Die vorhandene Deep-Freeze-/WeakMap-Bindung bleibt unverändert vertrauenswürdig. Ein deserialisierter Manifestklon ist weiterhin kein ExpectedContext.

Der Weg bleibt: **CapturedSource → native aktuelle Discovery + verifizierte Revision/Erstverträge → eingefrorener ExpectedContext → vollständiges CQR-204/202-Manifest → `hasCompletePassingCurriculumExamReadiness` → `deriveCurriculumMaturity` und unabhängiger Floor**. Der bestehende Validator vergleicht das vollständige serialisierte Manifest mit dem echten Context einschließlich Revisions-/Retirementteilen. Producer und Floor dürfen es nicht aus dem Report als Erwartung importieren. Der eigenständige Floor liest die aktuellen Quellen erneut. Keine Source-, Scope-, Graph-, V-, Backend- oder Floor-ABI neu entwerfen.

`generateCurriculumQualityStatus.ts` braucht höchstens eine präzise Zusammenfassungsformulierung für die aktuelle Revision; der bereits geprüfte Own20-Profilanschluss bleibt die separate vorhandene Änderung. `curriculumAssessmentValidation.ts`, `deriveCurriculumMaturity` und `checkCurriculumMaturityFloors.ts` behalten ihren Verbrauchsweg. Keine Reifegrenzen oder Schutzpolitik senken. Die QM-Beschreibung und der neue Vertrags-README werden auf das konkrete aktuelle Inventar ergänzt, historische Ausführungsverträge bleiben Historie.

## 5. Tatsächliche Referenzen und noch offene Qualität

`current-typed-references.json` prüft die 37 konkret betroffenen Overlaypfade und enthält 63 exakte aktuelle/historische Pointer: 23 Definitionen, 23 `contains`-Verweise, 16 kanonische Mappingverweise und einen `goalEntry`. Der bb651-Mappingrest steht ausschließlich unter `historicalWithdrawnMappings`. Für die breitere 1206-Datei-Abgeschlossenheit wird der bereits versiegelte Source85-Beleg ausdrücklich wiederverwendet; Source50 ändert nur sieben Reviewstatus/-notizpaare. Das erzeugt keine neuen typisierten Referenzen. Es wurde weder ein ganzer Katalog fachlich erneut reviewed noch eine zweite Referenzengine produktiv eingeführt.

Die drei E-Prüfungen haben ausschließlich nach ihrem exakten unabhängigen Review `released` plus begrenzte Reviewnotiz erhalten (85→f4). Der zweite Nachfolger (f4→50) setzt ausschließlich die vier nachweislich unvollständigen UNKNOWN-DB-Materialien auf `draft` plus konkrete Notiz. Beide Zwischensourcen bleiben erhalten. Keine vollständige amtliche E-Abdeckung, kein allgemeiner Deutschlandscope und kein neuer Humanstatus werden behauptet.

Selbst wenn der technische aktuelle Definitionenvertrag danach besteht, bleiben **vier generische Platzhaltermaterialien**, **Own20 draft** und **vier DB-Materialdrafts** echte Inhalts-/Readinessfehler. Auf der unverändert vollständigen Bereitschaftsmenge sind neun Drafts zu erwarten; CQR-204 muss die vier generischen Struktur-/Platzhalterfehler weiterhin zeigen. Diese erwarteten Zahlen sind im tatsächlichen Producer zu verifizieren, kein vorweggenommener Laufbeleg. Own20-`compiledApplicability`, dessen weitere fachliche Quellen-/Scopefragen, die zehn E-Residualrouten und die bisherigen Quellen-/Kohorten-/DB-/G17-Befunde werden nicht durch technische Erstbindung gelöst. M6/M7 bleibt dadurch ausgeschlossen.

## 6. Kleine vorgeschriebene Integrationschecks

Nur die normalen Reader und begrenzten Quellen-/Artefaktvergleiche verwenden. Keine SourceA-NativeDependency-/SealedOutput-Probes umformen oder erneut ausführen, keine abgeänderten nativen Dependencies unterschieben und keinen neuen Test-Policy-/Register-Einstieg in Produktionscode einbauen.

- Exakte aktuelle Quelle50: Discovery/Definitions-/Required-/Checkedmengen vollständig 23; 13 declared/zehn abwesend; 23 aktuelle Vertragszeilen plus neun gesondert erklärte Retirements. Technisch gebundene Drafts erhalten keinen Materialpass.
- Fehlende/duplizierte Survivor- oder Birthdefinition, wieder eingeführte Retirement-ID, privater fa47-Key oder HE-held f37 sowie unbekannte neue Definition scheitern. Ein doppelter/einseitiger 15/9/8-Eintrag scheitert schon bei Revisionsprüfung.
- Die bekannten Q3-Wachstumsnegative bleiben bei identischen eigenen `examData` wirksam; auch gleich große Atomtausch-/Entfernungsfälle und breiter gewordene Zielbedeutung scheitern. Die aktuelle positive 21/18-Quelle wird nicht mit dem alten V2-Negativfixture verwechselt.
- Jeder UNKNOWN→`[]`/`null`/Liste-Übergang scheitert. Geänderte Aufgabe, Lösung, Bewertungsanforderung oder Bestehensgrenze der aktuellen gebundenen IDs bleibt ohne unabhängige Bedeutungsqualifikation blockierend.
- Stale Source/Inventory/Reviewpin, falscher Owner/Pfad, alter ExpectedContext, deserialisierter/fabrizierter Context und passend gefälschtes Nullfehler-/M6-/M7-Manifest scheitern durch den bestehenden echten Context- und Floorverbrauch. Vollständige Mengen werden nicht aus Reportbehauptungen gewonnen.
- Ein lediglich anders gehashter aktueller Source mit unveränderten Verträgen und einer zulässigen unbeteiligten Änderung darf nicht wegen einer globalen Source-Allowlist abgewiesen werden. Gleichzeitig muss ProducerSource exakt zum frisch erfassten ExpectedContext gehören.
- Die bestehende sinnvolle native Producer/Maturity/Floor-Kette gezielt mit den aktuellen Verträgen prüfen; einen ansonsten gültigen Kontrollfall und eine einzelne tatsächliche Vertragsverletzung auseinanderhalten. Bestehende historische Auditkontrollen behalten ihre alten Bytes/IDs. Nicht eine bereits ohnehin rote Gesamtquelle als alleinigen Schutzbeweis verwenden.

Der Doingabschluss bindet die tatsächliche Codeänderung, den finalen Source, die aktuelle native Readiness und die unabhängige Prüfung erneut. Dieser Plan führt keinen davon bereits aus. Ein späterer gebündelter Full-CQR-Lauf bleibt beim Root und ist hier nicht erneut gestartet.
