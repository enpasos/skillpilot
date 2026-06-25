# Curriculum Quality: Reifegrade, QA-Scopes und CQR-Regeln

Diese Seite beschreibt die Bedeutung der Curriculum-Quality-Anzeige im Workbench-Dashboard `/quality-dashboard`.
Sie ist die fachliche Lesart der generierten Statusdateien unter `docs/qa-ci/status/`.

Normative Implementierung:

- Generator: `app/scripts/generateCurriculumQualityStatus.ts`
- Workbench-Ansicht: `app/src/views/CurriculumQualityDashboardView.tsx`
- Status-Snapshot: `docs/qa-ci/status/curriculum-quality-status.json`
- Kurzuebersicht: `docs/qa-ci/curriculum-quality-dashboard.md`

Der Generator wird lokal so ausgefuehrt:

```bash
cd app
npm run quality:curriculum-status
```

## Grundbegriffe

### Curriculum

Ein Curriculum ist im Dashboard eine kanonische `LearningLandscape`-JSON-Datei aus `curricula/DE/Gymnasium/canonical/`.
Das Dashboard bewertet nicht einzelne Bundeslandquellen, sondern die kanonische Landschaft, die daraus entstanden ist.

### Bundesland-Abdeckung

Die Bundesland-Abdeckung ist eine fruehe Qualitaetssicht auf die Frage:

> Ist die learner-facing Bundesland-Sicht fachlich genau durch den jeweiligen Bundesland-Lehrplan gedeckt?

Das Dashboard zaehlt dafuer atomare Knoten in Composition Views. Atomar bedeutet hier: ein Ziel ohne `contains`.
Uebungs-, Memory- und Assessment-Knoten zaehlen ausdruecklich mit, wenn sie atomar sind und in der jeweiligen Sicht gerendert werden.

Es gibt drei verschiedene Atomzahlen, die nicht vermischt werden duerfen:

- `Roh-Atomar`: alle atomaren Leaf-Knoten in der kanonischen JSON-Datei.
- `DE-Sicht atomar`: die Vereinigung aller atomaren Knoten aus den nationalen `de-de-*` Composition Views. Das ist die aktuelle kanonische Referenzmenge fuer die Deutschland-Sicht.
- `Bundesland-Sicht atomar`: die Vereinigung aller atomaren Knoten aus den Composition Views eines Bundeslands, z. B. `de-bw-*`.

Fuer Mathematik ist die DE-Sicht aktuell kleiner als die rohe JSON-Leaf-Menge. Das ist kein Fehler: die rohe Datei kann technische, legacy- oder noch nicht learner-facing eingebundene Atome enthalten. Die Qualitaetsregel fuer Bundeslaender bewertet aber die gerenderte Sicht, nicht blind alle rohen Leaves.

Fuer jedes deklarierte Bundesland, z. B. `DE-HE` oder `DE-BY`, prueft `CQR-003` zwei Richtungen:

1. Sicht -> Quelle: Jeder atomare Knoten der Bundesland-Sicht braucht einen direkten oder akzeptierten indirekten Lehrplanbeleg fuer genau dieses Bundesland.
2. Quelle -> Sicht: Jedes im Source-Registry erfasste Originalziel des Bundeslands muss ueber seine atomare Source-Closure vollstaendig auf kanonische atomare Knoten mappen, die in der Bundesland-Sicht enthalten sind.

Zusaetzlich prueft der Generator, ob atomare Ziele aus vorhandenen Source-Snapshots ueberhaupt im Source-Membership-/Closure-Ledger registriert sind. Damit werden Pilot-Snapshots sichtbar, bei denen bereits extrahierte Lehrplanatome noch nicht in die eigentliche Abdeckungsrechnung aufgenommen wurden.

Grenze dieser Pruefung: Sie beweist Vollstaendigkeit nur gegen die im Repository vorhandenen und parsebaren Source-Snapshots. Ob ein offizieller PDF-Lehrplan selbst vollstaendig extrahiert wurde, muss ueber einen vollstaendigen Source-Snapshot oder eine zusaetzliche Extract-Ledger-Pruefung abgesichert werden.

Damit ist Bundeslandabdeckung nicht "alle kanonischen Ziele gelten ueberall", sondern eine bidirektionale Passungspruefung zwischen Lehrplanquelle und kanonischer Bundesland-Sicht.

Im Dashboard bedeuten die Werte:

- `Bundeslaender`: Anzahl der Bundeslaender, deren Sicht voll belegt ist und deren registrierte Source-Atome voll in die Sicht mappen, im Verhaeltnis zu allen deklarierten Bundeslaendern.
- `DE-Sicht atomar`: nationale atomare Referenzmenge der Composition Views.
- `Roh-Atomar`: alle atomaren Leaf-Knoten der kanonischen JSON-Datei; diese Zahl ist Diagnose, aber nicht der Bundesland-Nenner.
- Pro Bundesland `belegt`: source-backed atomare Knoten der Bundesland-Sicht im Verhaeltnis zu allen atomaren Knoten dieser Bundesland-Sicht.
- Pro Bundesland `sichtbar`: atomare Knoten der Bundesland-Sicht.
- Pro Bundesland `Lehrplan -> Sicht`: registrierte Source-Atome, die in die Bundesland-Sicht mappen, im Verhaeltnis zu allen registrierten Source-Atomen dieses Bundeslands.
- Pro Bundesland `Originalziele voll`: registrierte Source-Originalziele, deren atomare Source-Closure vollstaendig in die Bundesland-Sicht mappt.
- Pro Bundesland `Source-Atome extrahiert`: atomare Ziele, die aus vorhandenen Source-Snapshots gelesen wurden.
- Pro Bundesland `Source-Atome unregistriert`: extrahierte Source-Atome, die noch nicht ueber Membership/Closure in die Abdeckungsrechnung eingehen.
- `nicht belegt`: atomare Bundesland-Sicht-Knoten ohne ausreichenden Lehrplanbeleg.
- `Lehrplan ungemappt`: registrierte Source-Atome ohne Mapping in die Bundesland-Sicht.
- Gruen: beide Richtungen sind vollstaendig, es gibt keine nicht belegten Sicht-Atome und keine Warnungen oder Fehler.
- Gelb: es gibt Teilabdeckung oder Warnungen, aber keine harte falsche Zuordnung.
- Grau: fuer dieses Bundesland ist noch kein atomarer Zielanteil sichtbar oder belegt.
- Rot: es gibt nicht belegte Sicht-Atome, ungemappte Source-Atome oder Applicability-Fehler.

Wichtig: `16/16` im Dashboard bedeutet nur dann echte Abdeckung, wenn die Zahlen aus beiden Richtungen vollstaendig sind. Eine pauschale Applicability-Entscheidung, ein Override oder ein "passt schon"-Overlay kann `CQR-003` nicht erfuellen.

### Ziel

Ein Ziel ist ein `LearningGoal`.
Das Dashboard unterscheidet strukturell:

- Atomare Ziele: `contains` ist leer. Diese Ziele sind die eigentlichen pruefbaren Lernziele.
- Cluster-Ziele: `contains` verweist auf Unterziele. Diese Ziele buendeln Navigation, Sichtbarkeit oder groessere Themen.

Die Spalten `Ziele` und `Atomar` bedeuten:

- `Ziele`: alle Ziele der Landschaft, also atomare Ziele plus Cluster.
- `Atomar`: alle Ziele ohne `contains`.

### QA-Scope

Ein QA-Scope ist ein explizit konfiguriertes Routenprofil, das einen learner-facing Teilbereich eines Curriculums prueft.
Die fruehere Bezeichnung `Routen` war missverstaendlich; die Anzeige heisst deshalb `QA-Scopes`.

Ein QA-Scope definiert:

- genau ein Curriculum,
- ein Label, zum Beispiel `Sekundarstufe I`,
- einen oder mehrere Motivationsanker,
- eine Menge ausgewaehlter atomarer Ziele,
- einen oder mehrere terminale Autonomie-Bereiche, typischerweise Uebungs- oder Klausurziele,
- einen Cluster-Selektor fuer die Frage, welche Cluster-`requires` innerhalb des Scopes verboten sind.

Wichtig:

- Die Zahl `QA-Scopes` zaehlt nicht einzelne Pfade im Graphen.
- Sie zaehlt nicht Aufgaben, Uebungen oder Lernwegvarianten.
- Sie zaehlt nur die im Generator registrierten QA-Profile.
- Ein Curriculum ohne QA-Scope bleibt im Dashboard `M0`, auch wenn seine reine Graphstruktur technisch valide ist.

Aktuell sind fuer Mathematik und Physik jeweils zwei Pflicht-Scopes registriert:

| Scope-ID | Label | Ausgewaehlte atomare Ziele | Motivationsanker | Terminale Autonomie |
| --- | --- | ---: | --- | --- |
| `canonical-math-sek1` | Sekundarstufe I | 247 | `Warum Mathematik? - Entdecken, Muster & Alltag` | Jahrgangsnahe `Pruefungen Jahrgangsstufe 5` bis `Pruefungen Jahrgangsstufe 10` mit 38 einzelnen Aufgabenknoten |
| `canonical-math-sek2` | Sekundarstufe II | 397 | `Warum Mathematik? - Denken, Muster & Zukunft` | atomare Klausur-/Uebungsziele unter `Uebungen E-Phase`, `Uebungen Q1`, `Uebungen Q2`, `Uebungen Q3`, `Uebungen Q4` und `Uebungen Prozesskompetenzen` |
| `canonical-physics-sek1` | Sekundarstufe I | 44 | `Warum Physik?` | atomare Klausur-/Uebungsziele unter `Uebungen Sekundarstufe I Physik` |
| `canonical-physics-sek2` | Sekundarstufe II | 278 | `Warum Physik?` | atomare Klausur-/Uebungsziele unter `Uebungen E-Phase`, `Uebungen Q1`, `Uebungen Q2`, `Uebungen Q3` und `Uebungen Q4` |

Damit bedeutet `QA-Scopes = 2` bei Mathematik:

> Das Dashboard prueft zwei explizite learner-facing Teilbereiche: Sekundarstufe I und Sekundarstufe II.

Es bedeutet nicht:

> Es gibt genau zwei didaktische Pfade im Mathematikgraphen.

## Routenmodell

### Richtung von `requires`

Ein Eintrag

```text
A.requires = [B]
```

bedeutet:

```text
A setzt B voraus.
```

Die gespeicherte Kante zeigt also vom spaeteren oder anspruchsvolleren Ziel zur Voraussetzung.

Fuer eine vollstaendige Lernroute braucht ein atomarer Zielknoten zwei Anschluesse:

1. Rueckwaerts zu Motivation: Wenn man den `requires`-Kanten folgt, muss der Zielknoten einen Motivationsanker erreichen.
2. Vorwaerts zu Anwendung: In der umgekehrten Richtung muss der Zielknoten von mindestens einem terminalen Uebungs- oder Klausurziel abhaengen.

Anschaulich:

```text
Motivation <- Voraussetzungen <- atomare Lernziele <- terminale Uebung / Klausur
```

Technisch wird fuer den Terminalpfad der umgedrehte `requires`-Graph verwendet. Das ist gleichbedeutend mit:

```text
Ein terminales Uebungsziel erfordert transitiv das atomare Lernziel.
```

### Effektive Route `R_eff`

`R_eff` ist die kompatible, grosszuegigere Routenprojektion.

Sie enthaelt:

- direkte `requires` eines Ziels,
- zusaetzlich `requires`, die ein Ziel ueber seine `contains`-Vorfahren erbt.

Das ist wichtig fuer alte oder halb migrierte Graphen, in denen ein Cluster noch eine Voraussetzung fuer alle darunterliegenden Ziele ausdrueckt.

`R_eff` beantwortet:

> Ist der Teilbereich didaktisch geschlossen, wenn wir vorhandene Cluster-`requires` noch als Uebergangsmodell akzeptieren?

### Direkte atomare Route `R_d`

`R_d` ist die strengere Zielmodellierung.

Sie enthaelt nur:

- direkte `requires`,
- deren Quellziel atomar ist,
- und deren Ziel ebenfalls atomar ist.

Cluster-Knoten werden fuer diese Pruefung nicht als Routenbruecken akzeptiert.

`R_d` beantwortet:

> Ist die kanonische didaktische Route bereits auf atomarer Lernzielebene modelliert?

### Terminale Autonomie

Terminale Autonomie meint Ziele, in denen Lernende das Gelernte selbststaendig anwenden muessen, typischerweise in Klausur-, Abschluss- oder Pruefungsform.

Im Graphen sind solche Ziele meist:

- atomar,
- mit `Practice` und `Assessment` getaggt,
- mit `examData` versehen,
- unter einem Uebungscluster gebuendelt.

Globale Abiturcontainer sind davon zu unterscheiden. Sie koennen eine separate Assessment-Schicht bilden, ersetzen aber nicht die lokalen terminalen Uebungsziele fuer die normale didaktische Route.

## Regelstatus

Jede CQR-Regel kann einen dieser Status haben:

| Status | Bedeutung |
| --- | --- |
| `pass` | Die Regel ist fuer den aktuellen Snapshot erfuellt. |
| `warn` | Die Regel hat offene Qualitaetsschuld, blockiert aber nicht alle niedrigeren Reifegrade. |
| `fail` | Die Regel ist fuer die jeweilige Stufe hart verletzt. |
| `not_configured` | Die Regel kann nicht sinnvoll bewertet werden, weil die notwendige Konfiguration fehlt. |

Die Dashboard-Spalten `Warnungen` und `Fehler` zaehlen alle Regeln mit diesem Status:

- globale Curriculumregeln,
- plus alle Regeln der zugehoerigen QA-Scopes.

## Reifegrade M0 bis M6

Die Reifegrade sind kumulativ und konservativ. Ein hoeherer Reifegrad setzt alle relevanten niedrigeren Bedingungen voraus.

### Scope-Reife

Ein einzelner QA-Scope kann maximal `M3` erreichen.

| Scope-Reife | Exakte Bedingung |
| --- | --- |
| `M0` | `CQR-101` ist nicht `pass`. Der Scope hat also keine vollstaendige effektive Route von Motivation zu terminaler Autonomie. |
| `M1` | `CQR-101` ist `pass`, aber `CQR-102` oder `CQR-103` ist noch nicht `pass`. Die Route ist effektiv geschlossen, aber noch nicht sauber atomar modelliert oder nutzt noch Cluster-`requires`. |
| `M2` | `CQR-101`, `CQR-102` und `CQR-103` sind `pass`, aber `CQR-201` ist noch nicht `pass`. Die Route ist atomar sauber, aber die terminalen Ziele sind noch nicht voll exam-mode-faehig. |
| `M3` | `CQR-101`, `CQR-102`, `CQR-103` und `CQR-201` sind `pass`. Der Scope ist route- und assessment-seitig reif. |

### Curriculum-Reife

Ein Curriculum kann `M0` bis `M6` erreichen.

| Curriculum-Reife | Exakte Bedingung |
| --- | --- |
| `M0` | Mindestens eine Grundbedingung fehlt: `CQR-001` oder `CQR-002` ist nicht `pass`, oder die Source-Snapshot-Erfassung inklusive amtlicher HTTP(S)-Originalquellenlinks (`CQR-000`) ist noch nicht sauber. |
| `M1` | Source-Snapshots sind lesbar, mit amtlichen HTTP(S)-Originalquellenlinks belegt, und ihre extrahierten Original-/Source-Ziele sind in Membership/Closure registriert; die Bundesland-View-Abdeckung (`CQR-003`) oder die GK/LK-Mapping-Konsistenz (`CQR-004`) ist aber noch nicht sauber. |
| `M2` | Source-Ingestion, quellenbelegte Bundeslandabdeckung und GK/LK-Mapping-Konsistenz sind sauber. Routen-Scopes fehlen noch, oder mindestens ein QA-Scope besteht `CQR-101` noch nicht. |
| `M3` | Bundeslandabdeckung ist sauber und alle QA-Scopes sind route-seitig sauber: `CQR-101`, `CQR-102` und `CQR-103` sind je Scope `pass`; mindestens ein Scope ist aber noch nicht exam-mode-faehig. |
| `M4` | Graph, Source-Ingestion, Bundeslandabdeckung und alle QA-Scopes sind `M3`, aber mindestens eine Kern-Review-Regel (`CQR-301`, `CQR-401`, `CQR-501`) ist noch nicht `pass`. |
| `M5` | Alle QA-Scopes sind `M3` und zusaetzlich `CQR-301`, `CQR-401` und `CQR-501` sind `pass`. `M5` ist der schulgeeignete Kern-QS-Stand und wird nicht durch Memory-Card-Konfiguration verwässert. |
| `M6` | `M5` ist erreicht und zusaetzlich ist `CQR-302` `pass`; fehlende oder offene Memory-Card-Review-Konfiguration zaehlt fuer `CQR-302` als offen und blockiert nur `M6`. |

Wichtige Konsequenz:

`M5` bedeutet nicht, dass es keine fachliche Verbesserung mehr geben kann.
Es bedeutet:

> Die Originalquellen sind erfasst, die Bundesland-Sichten sind beidseitig belegt, fuer alle konfigurierten Pflicht-QA-Scopes ist die Route von Motivation ueber atomare Lernziele bis zur terminalen Anwendung geschlossen, und die Kern-Review- und Sichtbarkeitsschulden des Dashboards sind im aktuellen Snapshot bereinigt.

`M6` bedeutet darueber hinaus, dass die optionale Memory-Layer fachlich eng begruendet ist: normale atomare Ziele wurden semantisch auf Memory-Notwendigkeit geprueft, aktive Karten sind auf diese Entscheidungen zurueckgefuehrt, und noetige Memory-Knoten sind in den konfigurierten Lernenden-Sichten sichtbar.

`M5` ist damit eine interne Runtime- und Modellierungsreife. Es bedeutet nicht automatisch, dass ein veroeffentlichtes Runtime-ZIP alle Source-Extraction-Evidenz so beilegt, dass ein externer Pruefer jede Mapping-Entscheidung ohne weitere Artefakte inhaltlich nachvollziehen kann. Fuer diese externe Provenienzpruefung gibt es ein getrenntes Provenance-Audit-Artefakt, das Source-Goal-IDs auf konkrete Source-Texte, Locator, offizielle URLs und kanonische Ziel-IDs abbildet.

## CQR-Regeln im Detail

### `CQR-000` - Source snapshot ingestion

Ziel:

> Die Originalziele bzw. Source-Snapshot-Ziele eines Bundeslands sind zuerst ueberhaupt vollstaendig erfasst und auf amtliche Originalquellenlinks zurueckfuehrbar.

Quellenartefakt-Modell:

- Git ist die dauerhafte Quelle fuer die **Referenz** auf den amtlichen Lehrplan: `sourceDocument`/`sourceDocuments` muessen die amtliche HTTP(S)-`url`, Titel, Rolle und bei Bedarf einen lokalen Arbeitsdateipfad dokumentieren.
- Lokale PDF-/HTML-Kopien sind **Arbeitskopien fuer Extraktion und Nachvollzug**, nicht der dauerhafte Source of Truth. Sie bleiben in der Regel durch `.gitignore` unversioniert.
- Eine fehlende versionierte PDF-Datei ist deshalb fuer sich genommen kein QA-Fehler, solange die amtliche URL dokumentiert ist und die benoetigte Source-Extraction bzw. der retained Snapshot lesbar ist.
- Wenn eine Pipeline-Stufe die Originaldatei tatsaechlich neu verarbeiten muss, muss die Datei lokal verfuegbar oder reproduzierbar herunterladbar sein. Dieser lokale Cache-Status ist Diagnoseinformation, aber nicht der gruene Quellenstatus selbst.

Scope-Entscheidung:

- Der gruen/pass-Zustand bedeutet: Fuer alle im Curriculum betrachteten Dimensionen ist die Quellenlage explizit geklaert. Dazu gehoeren insbesondere Bundesland, Fach, Sekundarstufe (`Sek I`/`Sek II`) und, soweit fachlich relevant, `G8`/`G9` bzw. andere Dauer- oder Kursmodelle.
- "Geklaert" kann heissen: Es gibt eine eigene Source-Extraction/einen retained Snapshot fuer diese Zelle, oder es gibt eine explizite reviewed Entscheidung, dass keine getrennte Quelle bzw. keine getrennte G8/G9-Projektion erforderlich ist.
- G8/G9 wird nicht durch doppelte kanonische Zielmengen modelliert. Wenn es relevant ist, muss die Unterscheidung ueber Source-Metadaten, Provenance, Mapping, Composition Views und Duration-Policy dokumentiert sein.

Geprueft wird:

- Der Generator liest die registrierten Source-Snapshots aus `source-landscape-registry.json`.
- Jede persistierte Source-Extraction muss strukturierte `sourceDocument`/`sourceDocuments`-Metadaten mit einer amtlichen HTTP(S)-`url` enthalten.
- Aus jedem lesbaren Source-Snapshot werden alle Source-Ziele sowie die atomaren Source-Ziele bestimmt.
- `source-goal-membership-registry.json` und `source-goal-closure-registry.json` muessen diese extrahierten Ziele registrieren.
- Wenn ein Source-Snapshot nicht lesbar ist, aber bereits Source-Originalziele registriert sind, gilt die Ingestion als nicht sauber.
- Wenn ein extrahiertes Source-Ziel oder Source-Atom nicht in Membership/Closure vorkommt, ist die Source-Erfassung unvollstaendig.

Metriken:

- `sourceExtractedGoals`: aus vorhandenen Source-Snapshots gelesene Source-Ziele.
- `sourceOriginalGoals`: in Membership/Closure registrierte Source-Originalziele.
- `sourceUnregisteredGoals`: extrahierte Source-Ziele, die nicht registriert sind.
- `sourceExtractedAtomicGoals`: aus Source-Snapshots gelesene atomare Source-Ziele.
- `sourceUnregisteredAtomicGoals`: extrahierte atomare Source-Ziele, die nicht registriert sind.
- `completeSourceJurisdictions`: Bundeslaender, deren Source-Snapshots lesbar und vollstaendig registriert sind.
- `originalSourceUrlIssues`: fehlende oder nicht verwendbare amtliche HTTP(S)-Originalquellenlinks in persistierten Source-Extractions.
- lokale Originaldatei-Verfuegbarkeit: Diagnosewert fuer die Arbeitsumgebung; fehlende Git-Versionierung einer lokal vorhandenen PDF darf `CQR-000` nicht blockieren.

Status:

- `pass`, wenn alle deklarierten Bundeslaender lesbare Source-Snapshots haben, alle Source-Extractions amtliche HTTP(S)-Originalquellenlinks enthalten, und keine extrahierten Ziele unregistriert sind.
- `warn`, wenn mindestens ein Bundesland noch gar keine Source-Snapshot-Ziele hat, aber keine bereits extrahierten Ziele fehlen.
- `fail`, wenn ein registrierter Source-Snapshot nicht lesbar ist, amtliche HTTP(S)-Originalquellenlinks fehlen, oder extrahierte Ziele nicht in Membership/Closure registriert sind.

Reifeziel:

- Erster fachlicher Meilenstein `M1`.

### `CQR-001` - Basic graph integrity

Ziel:

> Die Landschaft ist als Graph technisch konsistent.

Geprueft wird:

- jede Ziel-ID ist eindeutig,
- lokale `requires`-Referenzen zeigen auf vorhandene Ziele oder bekannte globale Ziele,
- lokale `contains`-Referenzen zeigen auf vorhandene Ziele oder bekannte globale Ziele,
- ein Ziel referenziert sich nicht selbst,
- direkte `requires` bilden keinen Zyklus,
- direkte `contains` bilden keinen Zyklus.

Metriken:

- `goals`: Anzahl der Ziele in der Landschaft.
- `localReferenceIssues`: Anzahl gefundener Integritaetsprobleme.

Status:

- `pass`, wenn `localReferenceIssues = 0`.
- `fail`, wenn mindestens ein Integritaetsproblem existiert.

Reifeziel:

- Grundlage fuer `M0`.

### `CQR-002` - Explicit type consistency

Ziel:

> Explizite `type`-Metadaten widersprechen nicht der Graphstruktur.

Geprueft wird:

- Wenn ein Ziel `type: "atomic"` deklariert, darf es keine Kinder in `contains` haben.
- Wenn ein Ziel `type: "cluster"` deklariert, muss es Kinder in `contains` haben.
- Ziele ohne `type` werden fuer diese Regel nicht als Fehler gewertet.

Metrik:

- `mismatches`: Anzahl der Ziele, deren deklarierter `type` nicht zur Struktur passt.

Status:

- `pass`, wenn `mismatches = 0`.
- `fail`, wenn mindestens ein Typwiderspruch existiert.

Reifeziel:

- Grundlage fuer `M0`.

### `CQR-003` - Bundesland source-backed view coverage

Ziel:

> Jede deklarierte Bundesland-Sicht ist atomar voll aus dem jeweiligen Lehrplan belegbar, und jedes registrierte Originalziel des Bundeslands ist in dieser Sicht vollstaendig abgebildet.

Geprueft wird:

- Die atomare Zielmenge eines Bundeslands kommt primaer aus den `de-<land>-*` Composition Views.
- Die nationale Referenzmenge kommt aus den `de-de-*` Composition Views.
- Falls fuer ein Curriculum noch keine Composition Views existieren, faellt der Generator auf die rohe atomare JSON-Menge zurueck. Dieser Fallback ist eine Uebergangshilfe, kein Zielzustand.
- Pro Bundesland wird getrennt gezaehlt, wie viele atomare Sicht-Knoten vorhanden sind und wie viele davon quellenbelegt sind.
- Als direkt quellenbelegt zaehlen Evidence-Eintraege mit `kind: "provenance"` oder einem reviewten `kind: "mapping"` fuer genau dieses Bundesland. `partial` bleibt eine Passgenauigkeitswarnung, zaehlt aber als inhaltliche Abdeckung, wenn das Source-Ziel dadurch vollstaendig abgedeckt ist.
- Als akzeptierter Ersatzbeleg zaehlt nur ein explizit reviewter `requires-closure`-Surrogat-Eintrag. Er ist fuer logische Luecken im `requires`-Fluss gedacht, nicht fuer neue Themen.
- `kind: "override"`, `kind: "child-union"` und automatische `kind: "requires-closure"` zaehlen nicht als Lehrplanbeleg fuer diese Regel.
- Wenn ein atomares Ziel in einer Bundesland-Sicht erscheint, aber keinen direkten oder akzeptierten indirekten Beleg fuer dieses Bundesland hat, ist das eine nicht ableitbare Zuordnung und fuehrt zu `fail`.
- Rueckwaerts werden die registrierten Source-Landschaften, Source-Memberships und Source-Closures gelesen. Jedes registrierte Source-Originalziel hat eine atomare Source-Closure; alle Atome dieser Closure muessen ueber reviewte Mappings in kanonische atomare Knoten fuehren, die in der Bundesland-Sicht enthalten sind. Partielle Mappings zaehlen dabei als inhaltliche Abdeckung, bleiben aber als Passgenauigkeitswarnung sichtbar.
- Wenn ein registriertes Source-Atom nicht in die Bundesland-Sicht mappt, ist die Lehrplanabdeckung unvollstaendig und fuehrt zu `fail`.
- Wenn ein vorhandener Source-Snapshot weitere atomare Source-Ziele enthaelt, die nicht in Membership/Closure registriert sind, ist die Source-Erfassung unvollstaendig und fuehrt zu `fail`.
- Projektionswarnungen machen die Bundeslandkarte gelb und verhindern `CQR-003 pass`.
- Applicability-Fehler in einer Projektion fuehren zu `fail`.

Metriken:

- `totalJurisdictions`: Anzahl deklarierter Bundeslaender.
- `totalAtomicGoals`: atomare Zielzahl der nationalen DE-Composition-View-Sicht.
- `rawAtomicGoals`: atomare Leaf-Zielzahl der kanonischen JSON-Datei.
- Pro Bundesland `viewAtomicGoals`: atomare Zielzahl der Bundesland-Composition-View-Sicht.
- Pro Bundesland `sourceBackedAtomicGoals`: atomare Sicht-Ziele mit direktem oder akzeptiertem indirektem Lehrplanbeleg.
- Pro Bundesland `surrogateBackedAtomicGoals`: atomare Sicht-Ziele, die nur ueber reviewten Ersatzbeleg zaehlen.
- Pro Bundesland `unsupportedAssignedAtomicGoals`: atomare Sicht-Ziele ohne ausreichenden Lehrplanbeleg.
- Pro Bundesland `partialSourceLinkedAtomicGoals`: atomare Sicht-Ziele mit nur partiellem Mapping; diese sind inhaltlich abgedeckt, aber nicht passgenau belegt.
- Pro Bundesland `sourceAtomicGoals`: registrierte atomare Source-Lehrplanziele.
- Pro Bundesland `sourceMappedToViewAtomicGoals`: registrierte Source-Atome, deren Mapping in die Bundesland-Sicht fuehrt.
- Pro Bundesland `unmappedSourceAtomicGoals`: registrierte Source-Atome ohne Mapping in die Bundesland-Sicht.
- Pro Bundesland `sourceExtractedAtomicGoals`: aus vorhandenen Source-Snapshots gelesene atomare Source-Ziele.
- Pro Bundesland `sourceUnregisteredAtomicGoals`: extrahierte Source-Atome, die nicht in Membership/Closure registriert sind.
- Pro Bundesland `sourceOriginalGoals`: registrierte Source-Originalziele.
- Pro Bundesland `sourceFullyCoveredOriginalGoals`: registrierte Source-Originalziele, deren atomare Closure vollstaendig in die Bundesland-Sicht mappt.
- Pro Bundesland `sourcePartiallyCoveredOriginalGoals`: registrierte Source-Originalziele, deren atomare Closure teilweise in die Bundesland-Sicht mappt.
- Pro Bundesland `sourceUncoveredOriginalGoals`: registrierte Source-Originalziele ohne Mapping in die Bundesland-Sicht.
- Pro Bundesland `sourceBackedCoveragePercent`: `sourceBackedAtomicGoals / viewAtomicGoals`.
- Pro Bundesland `sourceReverseCoveragePercent`: `sourceMappedToViewAtomicGoals / sourceAtomicGoals`.
- `cleanJurisdictions`: Bundeslaender mit voller beidseitiger Abdeckung ohne Warnungen, Fehler oder nicht belegte Zuordnungen.
- `partialJurisdictions`: Bundeslaender mit Teilabdeckung oder Warnungen, aber ohne harte Fehler.
- `errorJurisdictions`: Bundeslaender mit Applicability-Fehlern, nicht belegten Sicht-Atomen oder ungemappten Source-Atomen.
- `unsupportedAssignedAtomicGoals`: Summe nicht belegter atomarer Sicht-Zuordnungen ueber alle Bundeslaender.
- `unmappedSourceAtomicGoals`: Summe registrierter Source-Atome ohne Mapping in die jeweilige Bundesland-Sicht.
- `sourceExtractedGoals`: Summe extrahierter Source-Snapshot-Ziele.
- `sourceUnregisteredGoals`: Summe extrahierter Source-Snapshot-Ziele, die noch nicht in Membership/Closure registriert sind.
- `sourceUnregisteredAtomicGoals`: Summe extrahierter Source-Atome, die noch nicht in Membership/Closure registriert sind.

Status:

- `pass`, wenn alle deklarierten Bundeslaender alle atomaren Sicht-Ziele quellenbelegt haben, alle registrierten Source-Originalziele vollstaendig in die Sicht mappen und keine Projektion Warnungen, Fehler oder nicht belegte Zuordnungen hat.
- `warn`, wenn mindestens ein Bundesland nur teilweise quellenbelegt ist, gar keine quellenbelegten atomaren Ziele hat oder Projektionswarnungen hat, aber keine harte falsche Zuordnung vorliegt.
- `fail`, wenn mindestens eine Bundesland-Projektion Applicability-Fehler hat, mindestens eine atomare Sicht-Zuordnung ohne ausreichenden Beleg existiert oder mindestens ein registriertes Source-Atom nicht in die Sicht mappt.
- `not_configured`, wenn keine Coverage-Projektion fuer das Curriculum vorliegt.

Reifeziel:

- Zweiter fachlicher Meilenstein `M2`.

Interpretation:

`CQR-003 pass` bedeutet: Die Bundesland-Sicht ist weder zu klein noch zu gross gegenueber den erfassten Lehrplanquellen. Es fehlen keine registrierten Lehrplaninhalte, jedes registrierte Originalziel ist durch atomare View-Ziele vollstaendig abgedeckt, und es sind keine atomaren Sicht-Ziele enthalten, die sich nicht aus dem Bundesland-Lehrplan oder einem explizit reviewten logischen Ersatzbeleg ableiten lassen.

Ein akzeptiertes `APV-201`-Overlay kann eine Projektion fuer Runtime- oder Kompatibilitaetszwecke sichtbar halten. Es zaehlt aber nicht als Bundeslandabdeckung. Akzeptierte Warnungen bei `CQR-501` ersetzen deshalb nie die fachliche Vollstaendigkeits- und Negativpruefung von `CQR-003`.

Fuer Mathematik und Physik wird zusaetzlich ein detaillierter Audit-Snapshot erzeugt:

- `docs/qa-ci/status/curriculum-source-coverage-audit.json`
- `docs/qa-ci/status/curriculum-source-coverage-audit.md`

Dieser Audit listet pro Bundesland die fehlenden quellenbelegten Atomziele und die sichtbaren atomaren Zuordnungen ohne Lehrplanbeleg vollstaendig maschinenlesbar auf.

### `CQR-004` - Course-level mapping consistency

Ziel:

> GK/LK-Markierungen aus der Originalquelle duerfen beim Mapping auf SkillPilot nicht verloren gehen oder heimlich verschaerft werden.

Geprueft wird:

- Die Regel laeuft fuer persistierte `source-extraction`-Mappings, die eine `sourceExtractionPath` auf ein Extraktionsartefakt mit `sourceGoals[].courseLevel` besitzen.
- Ein Source-Ziel mit `courseLevel: "LK"` muss auf kanonische Ziele mappen, die mindestens das Tag `LK` tragen.
- Ein Source-Ziel mit `courseLevel: "GK_LK"` muss auf kanonische Ziele mappen, die beide Tags `GK` und `LK` tragen.
- Ein Source-Ziel mit `courseLevel: "unspecified"` wird fachlich konservativ als `GK_LK` behandelt, weil die Originalquelle an dieser Stelle kein LK-only-Niveau markiert.
- Eine LK-only-Zuordnung fuer `unspecified` ist nur erlaubt, wenn die Mapping-Review eine explizite `courseLevelDecision` mit nicht leerer Begruendung dokumentiert. Diese Ausnahme ist sichtbar und wird in `reviewedCourseLevelExceptions` gezaehlt.
- Partielle Mapping-Kanten werden nicht als akzeptierte Kursniveau-Abdeckung gezaehlt; sie muessen zuerst fachlich entschieden werden.

Metriken:

- `sourceGoals`: Source-Ziele im verknuepften Extraktionsartefakt.
- `sourceGoalsWithCourseLevel`: Source-Ziele, fuer die eine Kursniveau-Erwartung bestimmt werden konnte.
- `gkLkSourceGoals`: Source-Ziele mit erwarteter GK/LK-Abdeckung.
- `lkSourceGoals`: Source-Ziele mit LK-only-Erwartung.
- `unspecifiedSourceGoals`: Source-Ziele, deren Originalniveau nicht explizit markiert war.
- `checkedMappingEdges`: gepruefte Source-zu-SkillPilot-Mapping-Kanten.
- `defaultedUnspecifiedMappingEdges`: Kanten, bei denen `unspecified` als GK/LK geprueft wurde.
- `reviewedCourseLevelExceptions`: explizit begruendete Niveau-Ausnahmen.
- `mismatches`: Mapping-Kanten, deren kanonisches Ziel die erwarteten `GK`/`LK`-Tags nicht traegt.
- `missingSourceGoals`, `missingTargetGoals`, `unmappedCourseLevelSourceGoals`: technische oder fachliche Luecken in den geprueften Artefakten.

Status:

- `pass`, wenn alle geprueften Mapping-Kanten kursniveau-kompatibel sind und kein kursniveau-relevantes Source-Ziel ungemappt bleibt.
- `fail`, wenn eine Kante auf ein Ziel mit fehlenden `GK`/`LK`-Tags zeigt, ein Ziel fehlt oder ein kursniveau-relevantes Source-Ziel ungemappt ist.
- `not_configured`, wenn fuer das Curriculum noch kein persistiertes Source-Extraction-Mapping mit Kursniveau-Metadaten vorliegt.

Reifeziel:

- Teil des fachlichen Meilensteins `M2`. Ein `fail` verhindert, dass die Bundesland-/Source-Abdeckung als sauber gilt.

Interpretation:

`CQR-004 pass` bedeutet nicht, dass GK- und LK-Didaktik schon perfekt ausdifferenziert sind. Es bedeutet enger: Das aktuell reviewte Source-zu-SkillPilot-Mapping respektiert die im Original erkennbare Kursniveau-Semantik und macht fachliche Ausnahmen sichtbar.

### `CQR-101` - Effective full route coverage

Ziel:

> Jeder ausgewaehlte atomare Zielknoten eines QA-Scopes liegt auf einer effektiven Route von Motivation zu terminaler Autonomie.

Geprueft wird fuer jedes durch den Scope-Selektor ausgewaehlte atomare Ziel:

- Es gibt in `R_eff` einen Pfad vom Ziel zu mindestens einem Motivationsanker.
- Es gibt im umgedrehten `R_eff` einen Pfad vom Ziel zu mindestens einem terminalen Ziel.

`R_eff` akzeptiert dabei auch geerbte Cluster-`requires`.

Metriken:

- `selectedAtomicGoals`: Anzahl der im Scope geprueften atomaren Ziele.
- `missingMotivationPath`: Anzahl atomarer Ziele ohne effektiven Pfad zum Motivationsanker.
- `missingTerminalPath`: Anzahl atomarer Ziele ohne effektiven Pfad zu terminaler Autonomie.

Status:

- `pass`, wenn beide Missing-Metriken `0` sind.
- `fail`, wenn mindestens eine Missing-Metrik groesser als `0` ist.
- `not_configured` auf Curriculumebene, wenn fuer ein Curriculum gar kein QA-Scope registriert ist.

Reifeziel:

- Bestandteil des Routenmeilensteins `M3`.
- Wenn ein konfigurierter Scope diese Regel nicht besteht, bleibt das Curriculum nach erfolgreicher Bundeslandabdeckung bei `M2`.

### `CQR-102` - Atomic direct route coverage

Ziel:

> Jeder ausgewaehlte atomare Zielknoten eines QA-Scopes liegt auf einer direkt atomar modellierten Route.

Geprueft wird fuer jedes ausgewaehlte atomare Ziel:

- Es gibt in `R_d` einen Pfad vom Ziel zu mindestens einem Motivationsanker.
- Es gibt im umgedrehten `R_d` einen Pfad vom Ziel zu mindestens einem terminalen Ziel.

`R_d` akzeptiert nur direkte atomare `requires`.
Cluster-`requires` helfen hier nicht.

Metriken:

- `selectedAtomicGoals`: Anzahl der im Scope geprueften atomaren Ziele.
- `missingDirectMotivationPath`: Anzahl atomarer Ziele ohne direkten atomaren Pfad zum Motivationsanker.
- `missingDirectTerminalPath`: Anzahl atomarer Ziele ohne direkten atomaren Pfad zu terminaler Autonomie.

Status:

- `pass`, wenn beide Missing-Metriken `0` sind.
- `warn`, wenn mindestens eine Missing-Metrik groesser als `0` ist.

Reifeziel:

- Teil von `M3`.

Interpretation:

- `CQR-101 pass`, aber `CQR-102 warn` bedeutet: Der Scope ist uebergangsweise geschlossen, aber noch nicht sauber auf atomarer Ebene modelliert.

### `CQR-103` - No scoped cluster requires

Ziel:

> Die normale didaktische Sequenzierung im QA-Scope haengt nicht mehr von Cluster-`requires` ab.

Geprueft wird:

- Der Scope definiert einen `clusterSelector`.
- Alle Cluster-Ziele, die durch diesen Selektor in den Scope fallen, duerfen keine `requires` mehr tragen.

Metrik:

- `scopedClusterRequires`: Anzahl der scoped Cluster mit mindestens einem `requires`.

Status:

- `pass`, wenn `scopedClusterRequires = 0`.
- `warn`, wenn mindestens ein scoped Cluster-`requires` existiert.

Reifeziel:

- Teil von `M3`.

Interpretation:

- Cluster-`requires` sind nicht generell verboten.
- Sie sind aber fuer reife learner-facing Routen ein Warnsignal, weil sie die didaktische Abhaengigkeit nicht auf dem atomaren Lernziel selbst sichtbar machen.

### `CQR-201` - Terminal autonomy exam data

Ziel:

> Terminale Uebungs- und Pruefungsziele eines QA-Scopes sind exam-mode-faehig.

Geprueft wird:

- Der Scope definiert terminale Autonomie-Cluster.
- Deren atomare Kinder werden als terminale Autonomieziele interpretiert.
- Jedes dieser atomaren terminalen Ziele muss `examData` besitzen.

Metriken:

- `terminalAutonomyGoals`: Anzahl atomarer terminaler Autonomieziele.
- `terminalAutonomyGoalsWithExamData`: Anzahl davon mit `examData`.
- `terminalAutonomyGoalsWithoutExamData`: Anzahl davon ohne `examData`.

Status:

- `pass`, wenn `terminalAutonomyGoalsWithoutExamData = 0`.
- `warn`, wenn mindestens ein terminales Autonomieziel keine `examData` hat.

Reifeziel:

- Mindestbedingung fuer Scope-`M3`.

Interpretation:

- Die Route endet nicht nur in einem inhaltlichen Ziel, sondern in einer pruefungsnahen Anwendungssituation.
- Das ist die Dashboard-Abbildung des Motivationsknoten -> atomare Lernzielknoten -> selbststaendige Anwendung in Pruefungssituation.

### `CQR-301` - Semantic atomicity review freshness

Ziel:

> Content-Leaf-Ziele sind semantisch atomar reviewed und die Reviews sind aktuell.

Geprueft wird:

- Es existiert mindestens eine Semantic-Atomicity-Konfiguration fuer das Curriculum.
- Alle relevanten atomaren Content-Leaf-Ziele im Scope haben einen Review-Datensatz.
- Der gespeicherte Fingerprint des Review-Datensatzes passt zum aktuellen Zieltext und relevanten Metadaten.
- Kein Review ist veraltet, fehlt, obsolet oder als `needs_developer_review` oder `non_atomic` offen.

Ausgeschlossen sind unter anderem:

- Motivation und Orientierung,
- Practice und Assessment,
- Memorization- oder SRS-Ziele,
- Ziele mit `examData`.

Metriken:

- `configs`: Anzahl der Review-Konfigurationen fuer das Curriculum.
- `leafGoals`: Anzahl relevanter Content-Leaf-Ziele im Review-Scope.
- `atomic`: Anzahl aktuell als atomar akzeptierter Ziele.
- `needsDeveloperReview`: offene Developer-Review-Faelle.
- `nonAtomic`: explizit nicht atomare Ziele.
- `missing`: fehlende Review-Datensaetze.
- `stale`: Review-Datensaetze mit veraltetem Fingerprint.
- `obsolete`: Review-Datensaetze fuer Ziele, die nicht mehr im Scope liegen.

Status:

- `pass`, wenn alle offenen Zaehlwerte `0` sind.
- `warn`, wenn mindestens ein offener Zaehlwert groesser als `0` ist.
- `not_configured`, wenn fuer das Curriculum keine Semantic-Atomicity-Konfiguration registriert ist.

Reifeziel:

- Teil von `M5`.

### `CQR-302` - Memory-card decision trace

Ziel:

> Fuer normale atomare Lernziele ist explizit entschieden, ob Memory-Lernen fachlich gerechtfertigt ist; jede behaltene primaere Karte muss aus einer solchen Entscheidung rueckverfolgbar sein, vorhandene Memory-Knoten/SRS-Decks muessen eng bleiben, und konfigurierte Lernenden-Sichten muessen die benoetigten Memory-Knoten wirklich sichtbar machen.

Geprueft wird:

- Die Regel wird fuer jedes kanonische Curriculum ausgewiesen.
- Ohne Memory-Card-Review-Konfiguration unter `curricula/DE/Gymnasium/quality/memory-card-review/` ist der Status `not_configured`; das blockiert `M6`, aber nicht den Kern-QS-Stand `M5`.
- Alle relevanten normalen atomaren Ziele im konfigurierten Scope haben einen Review-Datensatz.
- Der gespeicherte Fingerprint des Review-Datensatzes passt zum aktuellen Zieltext und relevanten Metadaten.
- Der Review-Status ist `no_memory_needed`, `memory_required` oder `needs_developer_review`.
- `memory_required` muss mindestens einen existierenden Memory-Knoten und mindestens eine von diesem Knoten bereitgestellte `srs-deck:*`-ID referenzieren.
- Wenn `visibilityScopes` konfiguriert sind, muss jedes dort sichtbare `memory_required`-Ziel mindestens einen seiner referenzierten Memory-Knoten in derselben Composition View sichtbar haben.
- Jeder vorhandene Memory-Knoten im Scope muss durch mindestens einen aktuellen `memory_required`-Datensatz begruendet sein.
- Die von den Memory-Knoten referenzierten Deckdateien muessen auffindbar und lesbar sein.
- Primaere Karten werden separat unter `*.cards.review.jsonl` geprueft.
- Jede behaltene Karte muss `kept`, `necessary: true` und mindestens ein konkretes `originGoalId` haben.
- Jedes `originGoalId` einer behaltenen Karte muss ein aktuelles `memory_required`-Ziel sein und das passende Deck referenzieren.
- Karten mit `remove` duerfen als Audit-Spur im Kartenledger bleiben, muessen aber aus den aktiven Deckdateien entfernt sein.
- Optional erzeugt `npm run quality:memory-card-review:report` daraus einen lesbaren Markdown-Audit-Report. Der Report ist keine zweite Wahrheit, sondern eine reproduzierbare Sicht auf dieselben Ledger-Daten.
- Kanonische Memory-Decks fuer deutsche Gymnasialfaecher liegen unter `curricula/DE/Gymnasium/memory-decks/`. Sie liegen absichtlich nicht unter `curricula/DE/Gymnasium/canonical/`, weil dieser Ordner den `LearningLandscape`-JSON-Dateien vorbehalten ist. Oeffentliche Deck-IDs, aktive Karten-IDs und Runtime-Dateinamen verwenden kanonische DE/Gymnasium-Namen wie `de_gymnasium_math_*`, nicht Bundesland- oder Pilotpraefixe wie `he`, `hes` oder `DE-HE`.
- Bundesland-Auswahl wird ueber Composition Views, Applicability, Provenance und die Review-Ledger entschieden. Sie wird nicht durch bundeslandspezifische Deck-Duplikate oder Decknamen modelliert.

Ausgeschlossen sind unter anderem:

- Motivation und Orientierung,
- Practice und Assessment,
- Memorization- oder SRS-Ziele selbst,
- Ziele mit `examData`.

Metriken:

- `reviewedGoals`: Anzahl normaler atomarer Ziele im Review-Scope.
- `noMemoryNeeded`: Ziele, bei denen Memory-Lernen bewusst nicht angesetzt wird.
- `memoryRequired`: Ziele, bei denen ein knapper Memory-Anteil gerechtfertigt ist.
- `needsDeveloperReview`: offene fachliche Entscheidung.
- `missing`, `stale`, `obsolete`: fehlende, veraltete oder nicht mehr passende Datensaetze.
- `memoryGoals`, `tracedMemoryGoals`, `untracedMemoryGoals`: Rueckverfolgung der vorhandenen Memory-Knoten.
- `deckIds`, `deckFiles`, `cardRows`: technische Deck-Sichtbarkeit fuer die referenzierten SRS-Daten.
- `primaryCards`, `keptCards`, `cardsMarkedRemove`, `cardNeedsDeveloperReview`: Karten-Level-Pruefung der primaeren Decksprache.
- `missingCardReviews`, `staleCardReviews`, `obsoleteCardReviews`, `duplicateCardReviewRecords`, `invalidCardReviewRecords`: offener Kartenledger-Aufwand.
- `untracedMemoryRequiredGoals`: `memory_required`-Ziele, zu denen keine behaltene Karte mehr fuehrt.

Status:

- `pass`, wenn alle offenen Zaehlwerte `0` sind und alle Memory-Knoten getraced sind.
- `warn`, wenn mindestens ein offener Zaehlwert groesser als `0` ist.

Reifeziel:

- Teil von `M6`; `not_configured`, `warn` und `fail` blockieren `M6`, aber nicht `M5`.

Interpretation:

- Memory-Lernen ist nicht der Standardfall. Die Default-Entscheidung ist `no_memory_needed`.
- `memory_required` ist nur fuer abrufpflichtige Formeln, Begriffe, Notation, Vokabeln oder vergleichbare harte Merkelemente gedacht.
- Die Regel ist bewusst streng: Erst die semantische Entscheidung pro Lernziel und pro Karte zaehlt, danach kommt die technische Buchhaltung.
- Ein Memory-Deck ist dann fachlich sauber benannt, wenn es den kanonischen Lernkontext beschreibt. Herkunft aus Hessen oder einem anderen Bundesland gehoert in Provenance und Source-Ledger, nicht in die oeffentliche SRS-ID.
- Eine initialisierte Review-Queue ohne fachliche Entscheidungen ist kein Pass. Sie macht den offenen Zustand sichtbar (`warn`), damit ein Curriculum nicht durch fehlende Konfiguration unsichtbar an `CQR-302` vorbeilaeuft.

### `CQR-401` - Composition view availability

Ziel:

> Fuer das Curriculum existiert mindestens eine learner-facing Composition View.

Geprueft wird:

- Unter `curricula/DE/Gymnasium/composition-views/` werden `.view.json`-Dateien gezaehlt.
- Jede View mit passender `landscapeId` zaehlt fuer das Curriculum.

Metrik:

- `compositionViews`: Anzahl registrierter Composition Views fuer das Curriculum.

Status:

- `pass`, wenn `compositionViews > 0`.
- `not_configured`, wenn keine Composition View registriert ist.

Reifeziel:

- Teil von `M5`.

Interpretation:

- Ein graphintern reifes Curriculum reicht fuer die Workbench nicht aus.
- Fuer learner-facing Nutzung muss mindestens eine Sicht existieren, die den Graphen in eine gepruefte Oberflaechenstruktur bringt.

### `CQR-501` - Applicability warning debt

Ziel:

> Die Bundesland-/Scope-Anwendbarkeit des Curriculums hat keine aktive oder obsolete Warnschuld.

Geprueft wird:

- Der Applicability Compiler erzeugt aktuelle `APV-*`-Findings.
- Warnungen werden mit `docs/qa-ci/applicability-accepted-warnings.json` abgeglichen.
- Aktive Warnungen sind aktuelle Findings ohne akzeptierten Registry-Eintrag.
- Accepted Warnungen sind aktuelle Findings mit akzeptiertem Registry-Eintrag.
- Obsolete accepted Warnungen sind Registry-Eintraege, fuer die es aktuell kein passendes Finding mehr gibt.
- `APV-202` wird als Diagnose-Finding gezaehlt, nicht als Warnung, weil `partial` / `1:n` eine Zuordnungsform und nicht automatisch eine offene fachliche Luecke ist.

Metriken:

- `activeWarnings`: aktuelle nicht akzeptierte Applicability-Warnungen.
- `diagnosticPartialOnlyWarnings`: aktuelle `APV-202`-Diagnose-Findings.
- `acceptedWarnings`: aktuelle akzeptierte Applicability-Warnungen.
- `obsoleteAcceptedWarnings`: akzeptierte Warnungen, die nicht mehr zu aktuellen Findings passen.

Status:

- `pass`, wenn `activeWarnings + obsoleteAcceptedWarnings = 0`.
- `warn`, wenn mindestens eine aktive oder obsolete akzeptierte Warnung existiert.

Reifeziel:

- Teil von `M5`.

Interpretation:

- `acceptedWarnings` sind keine offenen Fehler. Sie dokumentieren bewusst akzeptierte, weiterhin aktuelle Warnungen.
- `obsoleteAcceptedWarnings` sind dagegen Qualitaetsschuld, weil die Registry dann nicht mehr zur aktuellen Compilerlage passt.

## Was `M5` und `M6` bei Mathematik aktuell bedeuten

Bei `Mathematik (Gymnasium, DE)` bedeutet `M5` im aktuellen Dashboard:

- Sek I und Sek II sind als Pflicht-QA-Scopes registriert.
- Sek I prueft 247 normale atomare Lernziele; die 38 jahrgangsnahen Pruefungsaufgaben werden als terminale Assessment-Knoten separat geprueft.
- Sek II prueft 397 atomare Ziele.
- Beide Scopes haben `CQR-101`, `CQR-102`, `CQR-103` und `CQR-201` auf `pass`.
- Die globale Kern-Review-Schicht hat `CQR-301`, `CQR-401` und `CQR-501` auf `pass`.

`M6` bedeutet zusaetzlich:

- `CQR-302` prueft fuer den Mathematik-Piloten 750 normale atomare Ziele, davon 713 mit `no_memory_needed` und 37 mit `memory_required`; 64 aktive primaere Karten sind jeweils auf konkrete `memory_required`-Ziele zurueckgefuehrt, alle 6 vorhandenen Memory-Knoten sind dadurch rueckverfolgt, und die konfigurierten Sek-I-Sichten loesen sichtbare Memory-Pflichten auf sichtbare Memory-Knoten auf.

Damit ist die Aussage:

> Das gesamte kanonische Mathematik-Curriculum ist in seinen beiden konfigurierten Stufen Sek I und Sek II route- und assessment-seitig geprueft; die Kern-Review- und Sichtbarkeitsregeln sind aktuell gruen. Der zusaetzliche M6-Memory-Layer ist ebenfalls gruen, inklusive eines konservativen Memory-Card-Entscheidungstracings.

Bei `Physik (Gymnasium, DE)` ist `CQR-302` ebenfalls konfiguriert:

- Der Physik-Review prueft 425 normale atomare Ziele.
- Davon sind 298 mit `no_memory_needed` und 127 mit `memory_required` entschieden.
- 148 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- 15 aeltere E-Phase-Zusatzkarten sind aus den aktiven Decks entfernt und bleiben im Card-Ledger als negative Entscheidung dokumentiert.
- Alle 5 vorhandenen Physik-Memory-Knoten sind dadurch rueckverfolgt.

Bei `Chemie (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Chemie-Review prueft 376 normale atomare Ziele.
- Davon sind 322 mit `no_memory_needed` und 54 mit `memory_required` entschieden.
- 55 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 6 vorhandenen Chemie-Memory-Knoten sind dadurch rueckverfolgt.
- Die Applicability der Chemie-Memory-Knoten ist konservativ auf die vom Compiler belegten Bundeslaender begrenzt; dadurch bleibt `CQR-501` ohne aktive Warnungen.

Bei `Biologie (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Biologie-Review prueft 355 normale atomare Ziele.
- Davon sind 348 mit `no_memory_needed` und 7 mit `memory_required` entschieden.
- 17 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Der eine vorhandene Biologie-Memory-Knoten ist dadurch rueckverfolgt.
- Die konfigurierte Biologie-GK-Composition-View zeigt den Memory-Knoten dort sichtbar an, wo sichtbare `memory_required`-Ziele auf ihn verweisen.

Bei `Informatik (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Informatik-Review prueft 207 normale atomare Ziele.
- Davon sind 198 mit `no_memory_needed` und 9 mit `memory_required` entschieden.
- 28 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 5 vorhandenen Informatik-Memory-Knoten sind dadurch rueckverfolgt.
- Alle 18 konfigurierten Informatik-Composition-Views zeigen sichtbare Memory-Pflichten auf sichtbare Memory-Knoten.
- Die Applicability der Informatik-Memory-Knoten ist konservativ auf die vom Compiler belegten Bundeslaender begrenzt; dadurch bleibt `CQR-501` ohne aktive Warnungen.

Bei `Latein (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Latein-Review prueft 115 normale atomare Ziele.
- Davon sind 82 mit `no_memory_needed` und 33 mit `memory_required` entschieden.
- 34 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 5 vorhandenen Latein-Memory-Knoten sind dadurch rueckverfolgt.
- Die konfigurierte Latein-CrossStage-Composition-View zeigt die Memory-Knoten dort sichtbar an, wo sichtbare `memory_required`-Ziele auf sie verweisen.
- Die Decks bleiben bewusst schmal: Sie sichern Wortschatz-/Wortbildungsroutinen, Formenlehre, Satzkonstruktionen, Stilmittel/Rhetorik sowie wenige Kultur- und Philosophiebegriffe; Uebersetzen, Analysieren, Interpretieren und Vergleichen bleiben die fuehrende Lernarbeit.

Bei `Deutsch (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Deutsch-Review prueft 268 normale atomare Ziele.
- Davon sind 194 mit `no_memory_needed` und 74 mit `memory_required` entschieden.
- 48 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 5 vorhandenen Deutsch-Memory-Knoten sind dadurch rueckverfolgt.
- Die konfigurierte Deutsch-CrossStage-Composition-View zeigt die Memory-Knoten dort sichtbar an, wo sichtbare `memory_required`-Ziele auf sie verweisen.
- Die Decks bleiben bewusst schmal: Sie sichern Grammatik/Rechtschreibung, Textsorten/Argumentation, Gattungs- und Formbegriffe, Epochenorientierung sowie Rhetorik-, Medien- und Sprachmodellbegriffe; Lesen, Schreiben, Analysieren, Interpretieren und Diskutieren bleiben die fuehrende Lernarbeit.

Bei `Geschichte (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Geschichte-Review prueft 156 normale atomare Ziele.
- Davon sind 100 mit `no_memory_needed` und 56 mit `memory_required` entschieden.
- 57 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 5 vorhandenen Geschichte-Memory-Knoten sind dadurch rueckverfolgt.
- Die konfigurierte Geschichte-CrossStage-Composition-View zeigt die Memory-Knoten dort sichtbar an, wo sichtbare `memory_required`-Ziele auf sie verweisen.
- Die Decks bleiben bewusst schmal: Sie sichern Zeitleistenanker und Begriffe zu Vormoderne/Revolution, 19. Jahrhundert, Demokratie und Diktatur 1917-1945, Kaltem Krieg/Gegenwart sowie Erinnerungskultur; Quellenarbeit, Erklaeren, Vergleichen und historisches Urteilen bleiben die fuehrende Lernarbeit.

Bei `Politik und Wirtschaft (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Politik-und-Wirtschaft-Review prueft 413 normale atomare Ziele.
- Davon sind 306 mit `no_memory_needed` und 107 mit `memory_required` entschieden.
- 62 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 5 vorhandenen Politik-und-Wirtschaft-Memory-Knoten sind dadurch rueckverfolgt.
- Alle 14 konfigurierten Bundesland-Composition-Views zeigen sichtbare Memory-Pflichten auf sichtbare Memory-Knoten.
- Die Decks bleiben bewusst schmal: Sie sichern Demokratie/Rechtsstaat, Beteiligung/Medien, Markt/Geld/Sozialstaat, internationale Politik/Global Governance sowie EU-Integration; Fallanalyse, Quellenarbeit, Interessenvergleich, Argumentation und politisch-oekonomisches Urteil bleiben die fuehrende Lernarbeit.

Bei `Wirtschaftswissenschaften (Gymnasium, DE)` ist `CQR-302` ebenfalls fachlich entschieden und aktuell:

- Der Wirtschaftswissenschaften-Review prueft 303 normale atomare Ziele.
- Davon sind 250 mit `no_memory_needed` und 53 mit `memory_required` entschieden.
- 51 aktive primaere Karten sind auf konkrete `memory_required`-Ziele zurueckgefuehrt.
- Alle 5 vorhandenen Wirtschaftswissenschaften-Memory-Knoten sind dadurch rueckverfolgt.
- Beide konfigurierten GK/LK-Composition-Views zeigen sichtbare Memory-Pflichten auf sichtbare Memory-Knoten.
- Die Decks bleiben bewusst schmal: Sie sichern Marktordnung/Wettbewerb/Sozialstaat, Unternehmen/Rechnungswesen/Finanzierung, Makrooekonomie/Geldpolitik, Aussenwirtschaft/Entwicklung sowie Wirtschaftsrecht/Falltechnik; Rechnen, Modellkritik, Fallsubsumtion, Materialanalyse und Urteil bleiben die fuehrende Lernarbeit.

Nicht gemeint ist:

> Jede denkbare fachliche Teilroute, jede Bundeslandvariation oder jede moegliche UI-Projektion ist automatisch perfekt.

Neue Stufen, Kursprofile oder learner-facing Varianten muessen als zusaetzliche QA-Scopes, Composition Views oder Validatorprofile explizit modelliert werden, wenn sie denselben Dashboardanspruch tragen sollen.
