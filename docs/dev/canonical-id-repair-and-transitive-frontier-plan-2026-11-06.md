# Kanonische ID-Korrektur und vollständige Voraussetzungenauflösung

Diese Astra-Prüfung konkretisiert den [verbindlichen Reparaturauftrag](ci-contract-audit-handoff-2026-11-06.md#verbindlicher-wiederherstellungsplan-nach-astra-prüfung).
Stand: 6. November 2026. Sie enthält einen Implementierungsplan, keinen
Nachweis bereits umgesetzter Migration oder wiederhergestellter Meilensteine.

Die kleinste tragfähige Lösung ist eine **geprüfte eineindeutige
Identitätsübersetzung bei unveränderten dauerhaften Speicherschlüsseln**.
Live-Goals erhalten gültige UUIDs; die bereits verwendeten Schlüssel in
Mastery, Kartenstatus und historischen Ereignissen behalten ihre Bedeutung.
Eine bloße Textumbenennung, ein allgemeines `exact`-Quellenmapping oder eine
neue Hashangabe erfüllt diesen Vertrag nicht.

## 1. Umfang und Reihenfolge

Der feste Umfang sind 164 kanonische IDs:

| Landschaft | Defekte Identitäten |
| --- | --- |
| Mathematik | Ein beibehaltenes Cluster mit elf Zeichen in der letzten UUID-Gruppe. |
| Politik/Wirtschaft | 151 UUID-artige IDs mit Gruppenlängen `8-4-5-4-12`; ein Memory-Cluster und fünf Memory-Goals mit symbolischen IDs. |
| Wirtschaft | Ein Memory-Cluster und fünf Memory-Goals mit symbolischen IDs. |

Ein erneuter Scan der aktiven direkten `id`, `contains`, `requires` und
`examData.coveredGoalIds` ergab **168 berührte Goal-Payloads**: Mathematik 2,
Wirtschaft 7, Politik/Wirtschaft 159. Das ist eine Untergrenze des
Artefaktänderungsumfangs: Composition, Placements, Quellenmappings,
Reviewkonfigurationen und Programm-/Planreferenzen kommen hinzu. Die zehn
Memory-Goals haben bestehende Karten; deren IDs und Deckbytes werden nicht
umbenannt.

Zuerst wird die Basis **nach den 19 getrennten Clustergewichtskorrekturen und
vor jeder ID-Änderung** als Commit und Dateihashes gebunden. Gewichtskorrektur,
Identitätsübersetzung und spätere fachliche Kantenreparatur erhalten getrennte
Diffs und Beweise. Die vollständige Voraussetzungenauflösung in Abschnitt 6
wird vor der ersten fachlichen Entfernung einer redundanten Kante abgesichert.

## 2. Was die vorhandenen Mechanismen tatsächlich leisten

| Bestehender Pfad | Wiederverwendung und fehlender Teil |
| --- | --- |
| `GoalMappingService`; `LearnerService.applyCanonicalMasteryProjection` / `applyCanonicalMasteryProjectionWithTimestamps` | Vorhandene `exact`-Mappings projizieren Werte und Zeitstempel. `mappingMatchesProjectionStateFilter` filtert nach Quellen-Bundesland. Ein kanonischer Identitätswechsel ist kein solches Quellenmapping und darf nicht von der aktuellen Jurisdiktion abhängen. |
| `LearnerService.loadSrsStateStrict`, `resolveSrsGoalSnapshots`, `persistVerifiedRecallBatchClientState` | SRS liegt unter `(skillpilotId,nodeId)`; der Sammelabruf fragt die Goal-IDs unmittelbar ab. Ein umbenanntes Goal findet ohne Übersetzung sein altes Kartenresultat nicht. |
| `SrsPracticeStateGuard` und `preparePortableSrsRestore` | Validierung der gespeicherten Kartenobjekte und Schutz vorhandener erfolgreicher Recall-Nachweise sind wiederverwendbar. Diese Funktionen ersetzen keine Goal-Schlüsselübersetzung. |
| `LearnerService.ensurePersistedDefaultProjectedFocus`, `getStoredPlannedGoals`, `setPlannedGoals` | `planned_goal` besitzt eigene Goal-Schlüssel und Erstellungszeitpunkte. Die aktuelle Prüfung löscht als ungültig eingestufte gespeicherte Ziele. Aliasauflösung muss deshalb **vor** Validierung, Vergleich, Löschen oder Default-Fokuswahl erfolgen. |
| `Learner.activeGoalId`; `CompletionWorkflowState` | Die aktive ID und vorübergehende Navigationsbindungen benötigen dieselbe Übersetzung. Authentisierung, Session, Capability und Zustandsschutz bleiben erforderlich; eine Alias-ID ist keine zusätzliche Berechtigung. |
| `LearnerLearningPlanService.readBlocks` / `normalizeBlocks`; `LearnerService.isLearningPlanCompatible` | `goalId`, `goalIds` und `atomicGoalIds` liegen in `blocks_json`. Die gelesene Arbeitsprojektion wird übersetzt, bevor gegen den aktuellen Fachumfang geprüft wird. Der bestehende v2-Fingerprint ist **historische Aufnahme-Evidenz**, kein heutiger Gleichheitstest; `isLearningPlanCompatible` prüft tatsächlichen Umfang, Fokus und Reihenfolge. Ein ID-Wechsel rechtfertigt kein Umschreiben dieses historischen Hashes oder von `capturedAt`. |
| `LearnerGoalCompletionService.recordTransition`; `LearnerService.getHistory` / `getGoalCompletionsOnDate` / `getGoalCompletionsBetween` | Abschlussereignisse besitzen unveränderliche Goal-IDs, Originalzeiten und eindeutige Tageszuordnung. Heutige Projektionen und Mengenvergleiche benötigen kanonische IDs; Originalereignisse bleiben erhalten. Imports und Übersetzung erzeugen keinen neuen Abschluss. |
| `CurriculaService` | Neben projizierten Lernendenabfragen existiert eine direkte Aggregation über `Mastery.getGoalKey()`. Auch dieser Pfad muss kanonisch projizieren; sonst fehlen die umbenannten Ziele in Gesamtstatistiken. |
| `LearnerService.exportLearner` / `importLearner` | Die HMAC wird über das Originalarchiv geprüft. Erst **danach**, vor Validierung der gesamten Wiederherstellung und vor der ersten Mutation, darf eine Arbeitskopie der Goal-Schlüssel übersetzt werden. Mastery, SRS und Pläne müssen dabei gemeinsam konsistent sein. |
| `migration-aliases.schema.json`; `JsonCurriculumPackageLoader`; `CurriculumRuntimeSnapshot` | Der vorhandene Paketvertrag kennt `renamed`, `copy-exact` und `preserve-original-and-add-alias`. Der Loader bewahrt die Alias-JSONs auf; ein produktiver Verbraucher, der sie auf Lernzustand anwendet, fehlt. Die bloße Paketdatei ist kein Migrationsnachweis. |

Die konkreten Backendanker liegen in `LearnerService.java` bei den Funktionen
um 1305–1390, 2673–2805, 2894–3015, 3546–3758, 4840–4955 und 12498–12825.
Die Funktionsnamen sind die stabilen Anker; Zeilennummern verschieben sich mit
der laufenden Reparatur.

## 3. Kleiner, verbindlicher Identitätsvertrag

Ein neues, enges Repository-Artefakt
`curricula/DE/Gymnasium/migrations/canonical-goal-id-format-2026-11-06.json`
wird mit einer geschlossenen JSON-Schema-Definition validiert. Es enthält:

- Schema-/Migrationsversion, unveränderliche Migrations-ID und eine feste
  UUID-v5-Namensraumdefinition;
- Basiskommit sowie Pfad und SHA-256 jeder betroffenen ursprünglichen Datei;
- genau 164 Regeln mit `landscapeId`, `sourceGoalId`, `targetGoalId`,
  `relation: renamed`, `masteryPolicy: copy-exact`,
  `historyPolicy: preserve-original-and-add-alias`;
- echte Vorher-/Nachher-Hashes der Goaldefinitionen und einen Hash des
  unveränderten semantischen Payloads **nach expliziter Rückübersetzung**;
- die versionierte Liste zulässiger Identitäts-/Referenzfelder und deren
  Prüferhash sowie Bindungen der berührten Review-/Asset-/Deckartefakte.

Neue UUIDs werden deterministisch aus dem vollständigen Tupel
`(migrationId,landscapeId,sourceGoalId)` abgeleitet. Keine ID wird durch
Abschneiden oder Ergänzen eines geratenen Hexzeichens „rekonstruiert“.
Bestehende gültige IDs bleiben unverändert. Die Zuordnung muss injektiv sein,
darf keine vorhandene aktuelle Ziel-ID treffen und darf keine Ketten oder
Zyklen enthalten. Beide Richtungen sind damit eindeutig. Die ursprünglichen
Symbolnamen bleiben in diesem Vertrag erhalten; eine zusätzliche Änderung
von `shortKey` ist für diese Reparatur nicht erforderlich.

Der Kernprüfer muss für jede betroffene aktuelle Definition und jedes
berührte Referenzdokument nachweisen:

```text
canonicalJson(inverseRename(currentDocument, declaredIdentityPointers))
  == canonicalJson(boundOriginalDocument)
```

`inverseRename` ist keine Suche/Ersetzung in beliebigen Strings. Nur fachlich
als kanonische Identitäten oder Referenzen deklarierte Felder werden
übersetzt. Für Paketdaten liefert die vorhandene Field-Semantics-Registry
bereits die Unterscheidung `identity` / `hard-reference`. Repository-Mappings,
Composition und Placements erhalten eine ausdrücklich begrenzte Ergänzung
der Pointerliste. Nicht klassifizierte Treffer verhindern den Abschluss des
Migrationschecks, bis ihre Funktion geprüft und dokumentiert ist.

Insbesondere bleiben amtliche `sourceGoalId`, `legacyGoalId`, Quellenprovenienz,
Reviewtexte, historische Goal-IDs, Karten-IDs sowie Bild-/Deckbytes erhalten.
`canonicalGoalId(s)` in aktiven Mappings und kanonische Zielreferenzen in
Composition, Placements, Prüfungsabdeckung und aktuellen Konfigurationen
werden dagegen übersetzt. Alte Asset-URLs dürfen alte Namen enthalten;
ein Bildpfad ist keine kanonische Goal-ID. Der Prüfer verlangt dieselben
Knoten, dieselbe geordnete Topologie, dieselben Texte, Typen, Rubriken,
Schwellenwerte, Karten und Assets modulo dieser einen Bijektion.

## 4. Runtime: eine Übersetzung, keine neue Mastery

Ein gemeinsam verwendeter `GoalIdentityService` lädt ausschließlich den
validierten Vertrag des aktiven Curriculum-Snapshots und bietet zwei
Operationen:

```text
canonicalGoalId(oldOrCurrentGoalReference) -> current UUID
storageGoalId(oldOrCurrentGoalReference)   -> original durable goal key
```

Nicht betroffene IDs werden identisch durchgereicht. Bei qualifizierten
Referenzen muss der im Vertrag angegebene Landscape-Eigentümer stimmen;
Quellen-IDs werden nur in ihren eigenen Quellenauflösern interpretiert.
Das Mapping gilt unabhängig von Fokus, Jurisdiktion und Lernstand. Es erzeugt
keine zusätzlichen Goals in der Live-Definition und keine zusätzlichen
Masterywerte.

Die Übersetzung wird an den in Abschnitt 2 genannten Grenzen eingesetzt:

1. Mastery- und SRS-Lese-/Schreibzugriffe verwenden den ursprünglichen
   Speicherschlüssel. Zur Fachberechnung und als aktuelle API-Zielkennung
   wird die UUID verwendet. SRS-Sammelabfragen übersetzen die gesamte
   ID-Liste zum Speicher und die Ergebnisse zurück. Alle bestehenden
   Kartenfelder, `verifiedRecall.passedAt`, Versuchszähler und
   `clientStateUpdatedAt` bleiben erhalten; normale Übung kann weiterhin
   keinen Nachweis erzeugen oder entziehen.
2. Die bestehenden Originalschlüssel in `planned_goal`, aktiver Navigation
   und historischen Planblöcken bleiben lesbar. Jeder Gültigkeitsvergleich
   verwendet zuerst die kanonische Arbeitsprojektion. Ein bloßes Lesen
   löscht keinen Fokus, erzeugt keinen Default, erhöht keine fachliche
   Planrevision und ersetzt keinen Aufnahmezeitpunkt. Ausdrückliche spätere
   Änderungen folgen weiter dem bestehenden Revisionsvertrag.
3. Historische Abschlussereignisse werden für aktuelle Mengenvergleiche
   kanonisch projiziert; neue Ereignisschreibvorgänge verwenden denselben
   dauerhaften Schlüssel. Die Tages-Eindeutigkeit gilt dadurch über den
   ID-Wechsel hinweg. Original-ID, Zeit und Practice-Fingerprint werden
   nicht umgeschrieben. Der Statistikpfad außerhalb von LearnerService
   erhält dieselbe Projektion.
4. HMAC-Prüfung erfolgt vor jeder Archivübersetzung. Danach werden Mastery-,
   SRS- und Planreferenzen in einer Arbeitskopie gemeinsam normalisiert.
   Der vorhandene Import bewahrt erfolgreiche Kartenresultate; seine
   sichere Kartenpflicht muss auch für alte Alias-IDs greifen. Ein altes
   Archiv darf nicht durch ein nun unbekanntes Memory-Goal an dieser
   Prüfung vorbeikommen. Ein neuer Export benennt die aktuelle Identität
   konsistent; historische Belege bleiben als solche erhalten.
5. Gleiche Alt-/Neu-Doppeleinträge werden nur bei identischem Inhalt
   dedupliziert. Widersprüchliche Doppelzustände werden vor Mutation
   zurückgewiesen; kein pauschales `max(mastery)`, jüngster-Zeitstempel-
   Raten oder stilles Zusammenführen unterschiedlicher Kartenresultate.
   Unter dem gewählten dauerhaften Schlüssel entstehen regulär keine
   zweiten Ergebniseinträge. Der bestehende Schutz erfolgreicher Karten
   bei regulärem Rückwärtsimport bleibt unabhängig davon wirksam.
6. Browserlokale Lehrkraftpläne benötigen dieselbe vertrauenswürdige
   ID-Projektion **vor** `localTeacherCoursePlan`-Auflösung und
   `learnerCoursePlanPublication`. Das betrifft Wurzeln, atomare Zielmengen,
   gespeicherte Planungsbasis und deren Vergleiche. Bestehende lokale
   Speicherbytes, Revisionen und Basiszeitpunkte werden beim Lesen nicht
   verändert. Der Client verwendet den aus demselben validierten Vertrag
   erzeugten Datensatz; keinen handgepflegten zweiten Aliasbestand. Auch
   historische `goal`-/`g`-Deep-Links (`App.tsx`, derzeit um 633/750) und
   Buch-/Completion-Einstiege werden vor aktueller Zielauflösung übersetzt.

Repository- und Paketbetrieb müssen denselben validierten
Identitätsvertrag in ihren Curriculum-Snapshot aufnehmen. Ein Paketbackend
darf hierzu nicht auf Repositorydateien zurückfallen. Zielauflösung,
Schreibschutz und Imports bleiben an den aktiven Paketinhalt gebunden.

## 5. Reviewbeweise und Paketgrenze

Die bestehenden QA-Hashes sind tatsächlich identitätsabhängig:

- `goalBookModel.fingerprintSemanticKindSourceGoal` bindet `/id`, `contains`,
  `requires`, Texte, Typen, `examData` und weitere definierte Felder.
- `reportDeepUnderstandingRollout.goalReviewFingerprint` bindet `goalId`.
- D-Resolutionen vergleichen den aktuellen Goal-Fingerprint; P-Reviews
  prüfen Scope, Reviewrun und gebundenes Goal; Memory- und Bildbelege besitzen
  weitere Goal-/Text-/Assetbindungen.
- `validateCurrentCanonicalBindingAudits` prüft die volle aktuelle
  Goaldefinition, die genaue Quellen-Mappingentscheidung und das
  unveränderte Quellenziel. Ein freies `decision: pass` umgeht das nicht.

Deshalb bleiben historische D/P/A/M/V-Dateien bytegleich. Ein enger
QA-Adapter erhält einen **vom Gleichheitsprüfer erzeugten vertrauenswürdigen
Identitätsbeweis**, keine frei übergebene Liste akzeptierter Hashabweichungen.
Er validiert zunächst die ursprünglichen Artefaktbytes und alle bisherigen
Review-, Run-, Unabhängigkeits- und Assetprüfungen gegen die gebundene
Originaldefinition beziehungsweise deren nachweislich identische
rückübersetzte aktuelle Arbeitsprojektion. Erst das gültige Ergebnis wird
auf die aktuelle UUID projiziert. Die Ausgabe benennt beides:
Original-Reviewhash/-Goal und aktuellen Goalhash/-Goal sowie
Migrationsbeweis-Digest. Auch unveränderte IDs mit umbenannten
Voraussetzungsreferenzen gehören zum Beweisumfang.

Das ist keine zusätzliche Fachfreigabe: Es überträgt ausschließlich bereits
vorhandene gültige Evidenz desselben unveränderten Inhalts. Ein bisheriges M6
wird dadurch nicht M7. Text-, Rubrik-, Karten-, Asset-, Zielauswahl- oder
Kantenänderungen scheitern am Gleichheitsnachweis und müssen ihre jeweils
erforderliche neue QA bestehen. Autorendateien, Rohreviews, unabhängige
Runs und alte Veröffentlichungen werden nicht mit neuen Hashes etikettiert.

**Paket-v1 reicht hierfür noch nicht.**
`validate_curriculum_release_model.py:5122–5128` verlangt bei `copy-exact`
identische `semanticBodyDigest`-Werte. Dieser Digest enthält den normalisierten
Goalbody, einschließlich `id` und Referenzen. Schon die erlaubte
ID-Übersetzung verändert ihn. Außerdem enthält der bestehende Aliasvertrag
keinen gebundenen Bijektionsbeweis und der Runtime-Snapshot noch keine
angewandte Identitätsprojektion. Es wäre falsch, dort identische alte/neue
Hashes zu behaupten oder das bisherige Profil still anders auszulegen.

Die kleinste ehrliche Erweiterung ist ein **separat versionierter
Identitätsbeweis-Artefaktvertrag** mit dem oben beschriebenen Prüfer. Ein neuer
Paket-Vertragsstand bindet dieses Artefakt in Manifest, Digest, Registry,
Closure und Roundtrip; ursprüngliche Definitions- und Body-Digests bleiben
unverändert berechnet. `copy-exact` für eine reine Bijektion wird dann durch
den überprüften Beweis begründet. Bestehende v1-Profile und veröffentlichte
Pakete bleiben unverändert. Die bisherige Paket-Aliasregel wird nicht als
fertige Unterstützung ausgegeben. Der separate Paketstand wird lokal gebaut
und geprüft; dieser Auftrag veröffentlicht kein Paket.

## 6. Vor Kantenreparaturen: vollständige Main-Voraussetzungen

Die Main-Norm ist eindeutig: Graph Definition §§6.1, 6.4, 9.1, 11.2–11.4
verlangt atomare Normalisierung und vollständige transitive Erreichbarkeit
**vor** Beschränkung auf Fokus-Endpunkte und unabhängig von Mastery.
Ein bereits gemeistertes Zwischenziel beendet die Suche nicht. Ein Weg darf
den Fokus verlassen und zu einer weiteren Anforderung im Fokus zurückkehren.

Aktuell betrachtet `LearnerService.areFrontierPrerequisitesMastered`
(um 7203) nur direkte/geerbte Anforderungen, überspringt das äußere
Zwischenziel und endet am gemeisterten Zwischenziel.
`computeEffectiveRequires` (um 12118) berechnet Vererbung, keine transitive
Hülle; daran ist die Vererbungsdefinition selbst nicht falsch.
Zusätzlich schneidet `CompletionEvaluator.evaluateAutomaticGraph` bei
`mastered[prerequisite]` ab. `automaticFrontierWaivers` entfernt daraus
abgeleitete angeblich erledigte Arbeit aus den Empfehlungen. Nur den ersten
Aufrufer zu ändern könnte deshalb die notwendige frühere Kompetenz weiter
verbergen und eine leere Frontier erzeugen.

Die begrenzte Reparatur lautet:

1. Die vorhandene reine Topologiekompilation aus
   `CompletionProfileCompiler.compileGraph` wiederverwenden bzw. als kleinen
   gemeinsamen Prerequisite-Kern herauslösen: Referenzvalidierung,
   Contains-DAG, Vererbung über alle Eltern, eindeutige Atomnachfahren,
   Expansion jedes erforderlichen Clusters und weitere Anforderungen seiner
   Atome. Der graphgebundene Kontext enthält die benötigten ausgehenden
   Pfade und sämtliche vererbenden Vorfahren; eine nur ausgehende
   Landscape-Closure darf einen fremden Elternknoten nicht verlieren.
   Der Resolver prüft qualifizierte Eigentümer statt nur den ID-Suffix.
2. Ab jedem Kandidaten die expandierten direkten Atomkanten vollständig
   traversieren, ohne Abbruch bei gemeisterten oder außerhalb des Fokus
   liegenden Zwischenknoten. Erst die resultierenden **Endpunkte** werden
   in normalem Modus mit `target ∩ Fokus` geschnitten; strict prüft alle
   erreichten Atome. Eine außerhalb liegende Voraussetzung ohne erreichbare
   In-Fokus-Anforderung blockiert normal weiterhin nicht. Es wird keine
   äußere Kompetenz als gemeistert gespeichert.
3. Den gemeinsamen Aufruf für einfache, ausführliche und prospektive
   Plan-Frontier verwenden. Ein unbekannter relevanter Bezug oder Zyklus
   ergibt einen nicht verfügbaren Kontext, keinen leeren erfolgreichen
   Bedarf. Die vorhandene gesonderte Level-2-Referenzvalidierung bleibt.
4. In der **Bedarfsfortpflanzung** des automatischen Completion-Kerns nur
   den Mastery-Abbruch entfernen: `needed/visited` verhindert Wiederholung,
   ein gemeisterter Zwischenknoten wird dennoch traversiert. Seine
   explizite Mastery bleibt erhalten. Offene Prüfungswurzeln halten dadurch
   ihre vollständigen früheren Anforderungen sichtbar. Bestehende
   Output-/Anerkennungsregeln werden nicht durch neue `C(q)`- oder
   Unit-Verträge ersetzt. Die weitergehenden bekannten Main-Anerkennungslücken
   bleiben im Audit ausdrücklich offen; diese Reparatur behauptet deren
   Erfüllung nicht.
5. Direkter Prüfungszugang bleibt der bestehende gesonderte Workflow.
   Diese Reparatur erzeugt keine neue Prüfungssperre, keinen Unitabschluss,
   keine Coverage-Ableitung und keine neue Speicherung impliziter Mastery.
   Topologie-Caches binden den tatsächlichen Graph-/Paketstand; Lerner-Mastery
   ist Eingabe der Abfrage und kein Anlass, die strukturelle Hülle zu kürzen.

Die Notwendigkeit zeigt ein kleiner Gegenfall: `Q→B→A` plus redundantes
`Q→A`, nur B ist gemeistert. Der alte Direktprüfer blockiert wegen `Q→A`.
Nach fachlich bestätigter Entfernung dieser redundanten Kante würde er Q
fälschlich freigeben. Der korrekte vollständige Bedarf blockiert Q in beiden
Graphen gleich. **G17 prüft weiterhin auf Goal-Knoten nach Entfernung der
Ursprungskante**; diese Runtime-Reparatur ersetzt seine Relation nicht durch
Atomexpansion.

## 7. Erforderliche Nachweise vor Inhaltsumschaltung

| Gegenfall | Erforderliches Ergebnis |
| --- | --- |
| Zweite Anwendung derselben ID-Projektion; Alt- und Neu-ID derselben Kompetenz | Identisches Ergebnis, kein zusätzliches Goal, kein neuer Abschluss oder Zeitstempel. |
| Namenskollision, falscher Landscape-Eigentümer, Aliaszyklus, unbekanntes Referenzfeld | Manifest/Verwendung scheitert; kein first-hit oder geratenes Mapping. |
| Unveränderte alte Lernendendaten mit Mastery, aktivem Fokus, Plan und allen zehn Memory-Goals | Gleicher Fortschritt, gleiche Karten-/Tages-/Ereignisdaten, aktuelle UUIDs in Arbeitsprojektion; keine Default-Fokusmutation. |
| Alte und neue gültig signierte Backups; beschädigte Signatur; alte Memory-Mastery ohne Karten | Beide gültigen Identitätsfassungen funktionieren; Signaturfehler und ungesicherter Memoryimport bleiben vor jeder Mutation abgelehnt. |
| Alte bestandene Karten bei Rückwärtsimport oder fälliger Wiederholung | Pass und ursprüngliches `passedAt` bleiben erhalten; keine erneute Prüfung bereits bestandener Karten. |
| Geänderte Beschreibung, Rubrik, Karte, Bild, Reihenfolge oder Kante unter behauptetem Rename | Gleichheitsbeweis scheitert; alter Reviewhash wird nicht als aktuelle Evidenz akzeptiert. |
| Unveränderte originale Reviewbytes mit nachgewiesener reiner ID-Bijektion | Bisherige unabhängige Reviewketten bestehen weiter; neues Resultat nennt die explizite Übersetzungsbindung. |
| Paketconsumer ohne Repositoryzugriff; JSON↔OWL↔JSON | Derselbe gebundene Identitätsvertrag, unveränderte Originalhashes, richtige Runtimeauflösung; kein Aliasverlust im Roundtrip. |
| `Q→B→A`, M={B}; B außerhalb Fokus, A wieder innerhalb | A blockiert Q auch nach Entfernung des redundanten Q→A; einfache/rich/Plan-Frontier stimmen überein. |
| Alle erforderlichen Endpunkte gemeistert; vollständig äußere Anforderung im normalen Fokus; strict derselbe Fall | Richtige Freigabe; normale Nichtblockierung ohne Masterygewinn; strict prüft die äußere Anforderung. |
| Erforderlicher Cluster mit zwei Atomen, eines mit weiteren Voraussetzungen; mehrere Contains-Eltern | Alle einschlägigen atomaren Anforderungen zählen, ohne Zählen von Clustermastery oder Kernziel-Abkürzung. |

Die bestehenden Tests, die den alten Mastery-/Fokusabbruch ausdrücklich
bestätigen, werden mit dem konkreten Normgegenfall korrigiert; sie werden
nicht einfach entfernt. Kleine unabhängige Graphorakel vergleichen die
vollständige atomare Hülle und vor/nach einer als redundant bestätigten
Kantenentfernung die Frontier für mehrere Mastery- und Fokusmengen.

Der Product Owner hat harte Normdurchsetzung und echte
Meilensteinwiederherstellung ausdrücklich beauftragt. Die beschriebene
Identitätskontinuität und Main-Voraussetzungenkorrektur sind dafür notwendige
Reparaturen innerhalb dieses Auftrags. Dafür ist keine erneute pauschale
Freigabe erforderlich. Die fachliche Einzelbeurteilung der Kanten, erhaltene
historische Evidenz, unveränderte M6-/M7-Untergrenzen und die Grenze gegen
neue Lerneinheiten-/C(q)-Runtime gelten weiter.
