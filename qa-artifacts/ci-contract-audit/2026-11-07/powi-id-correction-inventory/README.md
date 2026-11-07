# PoWi: endlicher Vertrag zur Korrektur von 157 Goal-IDs

Stand: 7. November 2026. **Die 477 G01a-Befunde sind 157 eindeutige fehlerhafte
Goal-IDs plus 320 Referenzvorkommen.** Alle 320 Referenzen lösen gegen den
aktuellen Katalog eindeutig auf. Es gibt hier keine 477 verschiedenen Ziele
und keinen nachgewiesenen fehlenden Referenzendpunkt.

Untersuchte Quelle: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json`,
SHA-256 `dc148f0be7b3156c2014ca1b23137273ce62b9bd44b34ffb28ff43957c224896`,
Owner `51b60137-46e8-5498-973e-ea38bb32f327`, 512 Goals. Der Statusbericht von
08:37:10.274 UTC meldet 593 CQR-001-Befunde: 477 G01a und 116 G17.
Der eigene direkte Aufruf von `checkSkillGraphIntegrity` bestätigt diese Zahlen.

| Zusammenhängender Bereich | Fehlerhafte IDs | Atome / Cluster | G01a-Beitrag | Aktive Felder / Dateien |
| --- | ---: | ---: | ---: | ---: |
| Bayern PuG 11, Indizes 312–363 | 52 | 46 / 6 | 160 | 2.152 / 44 |
| Bayern PuG 12, Indizes 364–418 | 55 | 49 / 6 | 164 | 5.789 / 44 |
| Bayern PuG 13, Indizes 419–462 | 44 | 39 / 5 | 141 | 6.572 / 48 |
| Lernkarten, Indizes 1–6 | 6 | 5 / 1 | 12 | 152 / 29 |
| Vereinigung | **157** | **139 / 18** | **477** | **14.665 / 61** |

Dateimengen überlappen. Die 151 Bayern-IDs haben das fehlerhafte Muster
8-4-5-4-12; die sechs Lernkarten-IDs sind symbolische Namen. Eine Ziffer zu
streichen wäre eine neue, unbegründete Identitätsentscheidung.

## Vollständiges Vorwärts- und Rückwärtsinventar

`definitions-and-bijection.json.gz` enthält alle 157 vollständigen aktuellen
Goalobjekte, ihren vollständigen kanonischen Hash, Index, Ziel-UUID, alle
eingehenden aktiven Referenzen und die explizit typisierten ausgehenden
Referenzen mit aufgelöstem Owner. `active-reference-pointers.json.gz` enthält
jeden genauen Dateipfad/JSON-Pointer mit Vorher-/Nachherwert. Das ist ein
Inventar, kein angewandter Patch oder akzeptierter Aktivierungsvertrag.

| Aktive Fläche | Tatsächlicher Umfang | Behandlung |
| --- | --- | --- |
| Kanonischer Graph | 157 IDs, 186 `contains`, 134 `requires`, 134 `examData.coveredGoalIds`: 611 Felder | Nur diese typisierten Identitätswerte ändern. Vollständiger inverser Dokumentvergleich besteht. |
| Mappings | 13.760 Zielreferenzen in 32 Dateien | Sowohl `mappings/*/canonicalGoalId` als auch `decisions/*/canonicalGoalIds/*` erhalten dieselbe 1:1-Abbildung; Quellen-IDs, Texte, Matchtypen und Urteile bleiben original. |
| Composition Views | 294 Referenzen in 28 Dateien | Nur Zielreferenzen; keine Navigations-ID, Rolle oder Scopeauswahl ändern. |
| Aktuelles A-Ledger | 134 `goalId`-Vorkommen in 413 Zeilen | Originalbytes und Fingerprints erhalten; eng geprüfte Lesetranslation fehlt im gewöhnlichen Producerpfad. |
| Aktuelles M-Goal-Ledger | 134 `goalId` und 108 `memoryGoalIds` in 413 Zeilen | Gleiches Prinzip; keine neue fachliche Freigabe. |
| Aktuelles M-Card-Ledger | 15 `originGoalIds` in 62 Zeilen | Unveränderte Originalzeilen; typisierte Referenzprojektion erforderlich. |
| Deckdateien | 5 Originaldecks, 5 Public-Kopien, 5 Backend-Static-Kopien; je Kopiensatz 15 Herkunftsreferenzen | Alle Bytes, Karten-IDs, Inhalte, Deck-IDs und URLs erhalten. Die 45 Vorkommen sind drei Kopiensätze derselben 15 Referenzen. |
| D/P/V | Keine eigene aktive zentrale PoWi-Deep-/D-/V-Ledgerkonfiguration; P bezieht sich hier auf aktuelle Quellen-/Mapping-/Provenienzbelege | Kein D/P/V-Pass oder M7 aus der ID-Projektion ableiten. Das Inventar findet außerhalb der obigen Mappings keine weitere malformed PoWi-Zielreferenz in aktiven Quellen-/Provenienz-JSONs. |
| Code/Pakete | Keine zusätzliche harte alte PoWi-ID in aktuellem Produktionscode gefunden; ein Originalfixture und vier betroffene Backend-Deckkopien | Fixture bewahren. Paket-Identitäts- und Definitionsindizes bei einer späteren Paketgenerierung neu binden; veröffentlichte Archive nicht umschreiben. |

Alle 134 fehlerhaft formatierten `requires`-Endpunkte stammen von der bestehenden
Gesamtaufgabe `a3bc21d3-d4aa-5ab9-a4a5-03a2db07fe07`. Ihre fachliche Demand- und
Assessmentbedeutung wird weder erweitert noch reduziert. Alle 320 Graphreferenzen
liegen im PoWi-Owner; keine andere aktive Source referenziert diese IDs über
`contains`/`requires`.

Der globale Kollisionskatalog umfasst 593 runtimeförmige Curriculumdateien mit
56.171 serialisierten Goals; der native StrictGraphChecker verwendet separat
seinen aktuellen kanonischen Katalog mit 21 Landschaften und 6.524 Goals.
`catalog-pins.json.gz` und `native-check.json` dokumentieren beide Grenzen.
`current-documents.json` enthält die genauen aktiven Dokumentpins und die
erfolgreichen inversen Vollvergleiche. Historische Seals wurden weder kopiert
noch umgeschrieben. In realen installierten/deployten Paketstores und in der
Lernerdatenbank wurde nicht gelesen: dortige Bestände sind damit nicht erhoben.

## Kleinster Identitätsvertrag

Die neuen IDs sollen exakt die bereits vorgeschlagenen PoWi-UUIDs beibehalten:
UUIDv5 mit Namespace `97d8c00c-411d-5dec-b260-4e6f22ab688b` über die kanonische
JSON-Liste `["canonical-goal-id-format-2026-11-06", owner, originalId]`.
Alle 157 aktuellen Ergebnisse stimmen mit dem früheren 164er Vorschlag überein.
Es gibt keine Kollision im aktuellen globalen Katalog, auch nicht bei
UUID-Großschreibung, und keine Mehrdeutigkeit oder Aliasverkettung.

Der Vertrag muss die **endliche 157er Abbildung und die explizit aktivierte
Teilmenge** unabhängig pinnen. Erste Teilmenge: die 52 PuG-11-Ziele. Jeder
Eintrag bindet Owner, exakte alte ID, exakte Ziel-UUID, ursprünglichen
Voll-Goal-Hash und den erhaltenen dauerhaften Persistkey. Erlaubt sind nur die
inventarisierten typisierten Felder. Der Rückweg muss das vollständige
Ausgangsdokument einschließlich Reihenfolge, Aufgaben, Schwellen, Texte,
Applicability und Metadaten reproduzieren. Kein Inhaltsvergleich nur nach
Titel, kein `exact`-Mapping als behaupteter Identitätsbeweis.

Die vorhandenen Source-/Migration-Schemas sind auf **164 Regeln und ihre
separaten A-/B-Grenzen** festgelegt. Diese Analyse ist kein gültiger neuer
157er oder 52er Schemaumschlag. Ein begrenzter Folge-Vertrag kann den vorhandenen
Bijection-/Inverse-Kern wiederverwenden, muss jedoch die gewählte PoWi-Teilmenge
ausdrücklich prüfen. Alte Schemas, alte Proofs und ihre Bedeutung bleiben
unverändert. Keine pauschale Änderung von `minItems` oder UUID-Norm.

## Was bereits reicht und was konkret fehlt

1. **Identitäts- und Referenzmechanik vorhanden.**
   `scripts/canonical_goal_identity_migration.py` liefert UUID-Ableitung,
   Ownerauflösung, globale Kollisionsprüfung, typisierte Feldprojektion und
   inverse Vollgleichheit. Nur diese reinen Funktionen wurden verwendet.
   Der echte `app/scripts/lib/skillGraphIntegrity.ts` prüfte die unveränderte
   und die drei ausschließlich im Speicher projizierten Varianten.
2. **Verlustfreier Zustandskern vorhanden, Runtimeanschluss fehlt.**
   `GoalIdentityMap` trennt kanonische ID und alte Speicher-ID;
   `GoalStateProjection` prüft gleiche Werte/Zeitstempel und verwirft Konflikte.
   Beide sind ohne Runtimecaller. `GoalIdentityProofLoader.load` wirft weiterhin
   unbedingt. Ein zulässiger Umschlag aktiviert daher heute nichts.
3. **Der allgemeine Mastery-Mapper reicht nicht.**
   `LearnerService.applyCanonicalMasteryProjection*` arbeitet über `exact`
   Curriculum-Mappings, Jurisdiktionsfilter und höhere Werte/neuere Zeiten.
   Normale Writes adressieren dagegen `new MasteryId(skillpilotId,effectiveGoalId)`.
   Allein zusätzliche Mappingzeilen könnten somit falsche Scopeabhängigkeit,
   verdeckte Konflikte oder eine zweite dauerhafte Ergebniszeile erzeugen.
4. **Kleine fehlende Anschlussstrecke: eine endliche PoWi-Identitätsansicht.**
   Dieselbe unabhängig gepinnte Teilmenge muss vor Goal-Lookup, Masteryread,
   Fokus-/Plan-/Historyvergleich und explizitem Masterywrite gelten. Sie liefert
   kanonische Arbeits-IDs, bewahrt den tatsächlich vorhandenen originalen
   Persistkey und alle Zeiten. Unbekannte historische Zeilen bleiben original
   exportierbar und geben keine Lernberechtigung. Aliaspaare mit verschiedenen
   Werten oder Zeiten scheitern, statt `max`/`latest` anzuwenden. Unbekannte
   syntaktisch gültige UUIDs müssen weiterhin gegen den aktiven Graph geprüft
   werden; der reine `GoalIdentityMap`-Helfer allein beweist keine Existenz.
5. **QA und Frontend nicht auslassen.**
   A-/M-Originfingerprints brauchen eine exakt an Vorher/Nachher gebundene
   Leseprojektion, nicht neue Zeilen oder Zeitstempel. Der bestehende
   `sourceIdentityQaReviewContext.ts` beschreibt diese begrenzte Mechanik,
   ist aber nicht im normalen CQR-Evaluator verdrahtet. Alte URLs sowie lokale
   Teacher-/Lernerpläne benötigen dieselbe Abbildung vor Lookup/Scopeprüfung;
   Originalcaptures bleiben erhalten. Nur Memory-6 braucht zusätzlich die
   echte SRS-Storagekey-Brücke. Der zuvor abgelehnte adversariale Source-A-Probe
   wurde nicht wiederholt, umformuliert oder auf anderem Weg ausgeführt.

Die kleinste Anschlussstrecke hat folgende konkrete Feldgrenze; sie ist kein
neues allgemeines Legacy-Framework:

| Feld / tatsächlicher Consumer | Kanonische Arbeitsansicht | Erhaltener Speicher / Konfliktregel |
| --- | --- | --- |
| `LearningGoal.id`, typisierte Referenzen; `LandscapeService.getGoalDefinition` | Exakte aktivierte PoWi-UUID vor Lookup, gegen denselben Snapshot/Owner geprüft | Original-Definition und Abbildung bleiben separat; fremde Owner/IDs abweisen. Kein allgemeiner UUID-Passthrough. |
| `MasteryId.goalKey`, `Mastery.value`, `updatedAt`; alle drei Masteryreads und expliziter Write in `LearnerService` | Alt-ID erscheint als genau eine neue ID; Wert/Zeit unverändert | Tatsächlichen vorhandenen Stringkey mitsamt Owner erfassen. Ein bestehender Einzelkey bleibt Writeziel; bei keinem Bestand gilt explizit der alte Regelkey. Unterschiedliche Aliaswerte/Zeitstempel sperren; keine zweite Zeile. Bei mehreren gleichen Persistkeys darf der Read deduplizieren, aber der Write bleibt bis zu einer ausdrücklich festgelegten Mehrfachzeilenpolicy gesperrt. |
| `PlannedGoal`/`PlannedGoalId`, `Learner.activeGoalId`, `CompletionWorkflowState.currentGoalId` und `directAssessment.goalId` | Vor Sichtbarkeits-/Frontiervergleich übersetzen | Keine Readmutation, Fokuslöschung, neue Revision oder neue Abschlussentscheidung; originale Zeit-, Session- und Navigationsbindung erhalten. |
| `LearnerLearningPlan.blocksJson`: `goalId`, `goalIds`, `atomicGoalIds` | Übersetzte Arbeitskopie für Scope-/Kompatibilitätsprüfungen | Capturebytes, Plan-/Block-IDs, Revision, Fingerprint, Reihenfolge und `null`/`[]` erhalten; nicht nach Titel oder Arrayreihenfolge auflösen. |
| `LearnerGoalCompletion.goalId`, History-/Metrikreads | Identische kanonische Ereigniszuordnung | Ereignis-ID, Berlin-Tag, Zeit, Wert und Praxisbeleg bleiben original; Übersetzung erzeugt keinen Abschluss. Konflikte nicht nach neuestem Datum entscheiden. |
| `LearnerClientState` SRS-Goalkey, lokale SRS-Keys | In PuG-11-52 und BY-151 keine Memorygoal-Umbenennung; deren Kartenkeys bleiben unverändert | Für Memory-6 separat gleiche Kartenpayloads und Zeiten nachweisen; widersprüchliche Erfolge sperren. Karten- und Deck-IDs niemals übersetzen. |
| Signiertes Lerner-DTO; Browserdeep-Link und lokale Teacherpläne | Erst ursprüngliches DTO authentisieren; dann typisierte Arbeitskopie | Alle Schreibgruppen vor der ersten Mutation prüfen. Unbekannten historischen Bestand erhalten, ohne daraus API-Zielberechtigung abzuleiten. |

Für einen admissiblen Loader fehlt konkret der unabhängig akzeptierte aktuelle
Snapshotvertrag der aktiven 52er Teilmenge samt vollständigen tatsächlichen
Vorher-/Nachherdateien und unveränderten Belegen, die echte normale
QA-Factoryausgabe mit vollständigen Produzenten-/Outputpins und der
Service-/Storage-Nachweis der obigen Felder. Eigene Hashangaben, ein
`proposal-verified`-Flag oder statische Syntax dürfen diese Autorität nicht
erzeugen. Repository- und Paketadapter müssen dieselbe festgehaltene Generation
liefern; fehlerhafte Pins, falsche Teilmenge, unbekannte Owner und Konfliktstate
schließen den Loader. Die bestehenden A-/B-Grenzen dürfen dafür nicht geöffnet
werden, bevor die konkreten Anschlussnachweise vorliegen.

Ohne einen adversarialen Nativeprobe lassen sich die feste 157er/52er
Listenidentität, alle aktuellen Datei-/Goalpins, echte inverse Vollgleichheit,
Manifest-/Recordkonsistenz, reine State-Wertfunktionen und die unveränderten
normalen Producer-/Reader-/QA-Factoryoutputs prüfen. Letztere sind ein separater
gewöhnlicher Ausführungsprozess, kein pauschal untersagter Vorgang; sie wurden
hier nicht erzeugt und belegen allein weder Native-Isolation noch
Zustandskontinuität. Der ausschließlich gelesene Nachfolger
`../source-a-namespace-data-consistency-successor/README.md` belegt elf reine
Recordtests, einen lesenden unveränderten Manifestvergleich und statische
Verdrahtung, ausdrücklich **keinen** nativen Writer-/Readerlauf und keine
unabhängige Source-A-Abnahme. Dieser Stand bleibt so gekennzeichnet.

Paketgrenze: `JsonCurriculumPackageLoader` liest Alias-JSON; der Snapshot bewahrt
es auf, aber kein Runtimeconsumer nutzt `migrationAliasesJsonByPackageId` zur
Goalauflösung. Zudem verlangt `validate_curriculum_release_model.py` für
`copy-exact` gleiche `semanticBodyDigest`-Werte. Referenzänderungen in Clustern,
Prüfungen oder Views dürfen nicht als schon unveränderte Paketbody-Digests
behauptet werden. Die hier belegte inverse Graphgleichheit ersetzt diesen
Paketvertrag nicht. Die konkrete PoWi-Projektion muss auch im Paketadapter
aus derselben Paketgeneration gebunden werden; kein Repositoryfallback und
keine Änderung veröffentlichter Paketbytes.

## Erste Charge und belegte Wirkung

**PuG 11 vollständig: 52 Ziele, darunter 46 Atome.** Der enthaltene Zweig ist
geschlossen; seine ausgehenden Referenzen enthalten keine malformed ID aus
PuG 12/13. Es ändern sich 206 Graphfelder, 34 Referenzen in 12 Views und 1.912
Zielreferenzen in 31 Mappingdateien. 46 A- und 46 M-Goalzeilen benötigen die
gebundene Originprojektion; kein Card-Origin und keine Memorygoal-ID wechselt.
Das ist die kleinste fachlich zusammenhängende große Probe für den echten
PoWi-Zustandsanschluss. `first-batch-plan.json` enthält die expliziten 52 IDs.

| Ausschließlich im Speicher geprüfte Variante | G01a | G17 | Gesamt CQR-001 |
| --- | ---: | ---: | ---: |
| Unverändert | 477 | 116 | 593 |
| PuG 11: 52 IDs | 317 | 116 | 433 |
| PuG 11–13: 151 IDs | 12 | 116 | 128 |
| Alle PoWi: 157 IDs | 0 | 116 | 116 |

Alle Nicht-G01a-Findings sind nach inverser ID-Auflösung identisch. Der native
Resolver verwirft den absichtlich falschen Owner und eine unbekannte gültige
UUID. Der bestehende Pythonkern verwirft außerdem mehrdeutige Owner,
doppelte Source-Definition und eine großgeschriebene Zielkollision. Die
Korrektur ersetzt keinen noch offenen fachlichen G17-Review und gibt M6 nicht frei.

Vor tatsächlicher Aktivierung der ersten 52 sind konkrete Servicefälle nötig:
alter einzelner Masterykey mit Originalzeit → kanonischer Read ohne Write;
expliziter neuer Write → derselbe vorhandene Persistkey; gleicher und
widersprüchlicher Old/New-Doppelbestand; qualifizierter Persistkey; gemischter
bekannter/unbekannter historischer Bestand; alte Fokus-/Pläne-/History-/Links;
unverändert authentisierter Alt-Export vor Importprojektion. Bestehende
Scope-/Session-/Assessmentguards bleiben wirksam. Danach können PuG 12/13
als 99er Folgecharge dieselbe geprüfte Mechanik nutzen; Memory-6 folgt mit
zusätzlichen SRS-/Kartenkontinuitätstests. Keine Informatik-Ausnahme auf PoWi
übertragen, kein DB-Reset und keine automatische Speicherung beim Lesen.

## Reproduktion und Grenze

Aus dem Repositoryroot (nur dieser Inventarordner wird geschrieben):

```bash
python3 -B qa-artifacts/ci-contract-audit/2026-11-07/powi-id-correction-inventory/inventory.py
app/node_modules/.bin/tsx qa-artifacts/ci-contract-audit/2026-11-07/powi-id-correction-inventory/native-check.mts
```

Beide liefen erfolgreich. Das Inventar pinnt den obigen PoWi-Stand und soll
nach einer tatsächlichen Sourceänderung nicht still weiter gelten. Es wurde
kein Source-A-Nativeprobe, kein vollständiger QA-Replay, kein DB-Zugriff,
keine aktive Umbenennung und kein Gitwrite ausgeführt. Eine unabhängige
fachliche/technische Freigabe der späteren konkreten Implementierung bleibt
separat; diese Analyse liefert den endlichen Arbeitsumfang dafür.
