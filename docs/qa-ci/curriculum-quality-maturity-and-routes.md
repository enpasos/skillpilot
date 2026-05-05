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

Aktuell sind fuer Mathematik zwei Pflicht-Scopes registriert:

| Scope-ID | Label | Ausgewaehlte atomare Ziele | Motivationsanker | Terminale Autonomie |
| --- | --- | ---: | --- | --- |
| `canonical-math-sek1` | Sekundarstufe I | 218 | `Warum Mathematik? - Entdecken, Muster & Alltag` | `Sek-I-Abschlussaufgaben Mathematik` unter `Uebungen Sekundarstufe I` |
| `canonical-math-sek2` | Sekundarstufe II | 397 | `Warum Mathematik? - Denken, Muster & Zukunft` | atomare Klausur-/Uebungsziele unter `Uebungen E-Phase`, `Uebungen Q1`, `Uebungen Q2`, `Uebungen Q3`, `Uebungen Q4` und `Uebungen Prozesskompetenzen` |

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

## Reifegrade M0 bis M4

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

Ein Curriculum kann `M0` bis `M4` erreichen.

| Curriculum-Reife | Exakte Bedingung |
| --- | --- |
| `M0` | Mindestens eine Grundbedingung fehlt: `CQR-001` oder `CQR-002` ist nicht `pass`, oder es gibt keinen QA-Scope, oder mindestens ein QA-Scope besteht `CQR-101` nicht. |
| `M1` | Graph und Typen sind sauber, alle QA-Scopes bestehen `CQR-101`, aber mindestens ein QA-Scope ist noch `M1`. Praktisch heisst das: effektive Routen sind vorhanden, aber die atomare Routenschicht oder Cluster-`requires` sind noch nicht bereinigt. |
| `M2` | Graph und Typen sind sauber, alle QA-Scopes sind mindestens `M2`, aber noch nicht alle sind `M3`. Praktisch heisst das: direkte atomare Routen sind sauber, aber terminale `examData` ist noch nicht komplett. |
| `M3` | Graph und Typen sind sauber, alle QA-Scopes sind `M3`, aber mindestens eine M4-Review-Regel (`CQR-301`, `CQR-401`, `CQR-501`) ist noch nicht `pass`. |
| `M4` | Alle QA-Scopes sind `M3` und zusaetzlich `CQR-301`, `CQR-401` und `CQR-501` sind `pass`. |

Wichtige Konsequenz:

`M4` bedeutet nicht, dass es keine fachliche Verbesserung mehr geben kann.
Es bedeutet:

> Fuer alle konfigurierten Pflicht-QA-Scopes ist die Route von Motivation ueber atomare Lernziele bis zur terminalen Anwendung geschlossen; die Review- und Sichtbarkeitsschulden des Dashboards sind im aktuellen Snapshot bereinigt.

## CQR-Regeln im Detail

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

- Mindestbedingung fuer `M1`.
- Wenn ein konfigurierter Scope diese Regel nicht besteht, bleibt das Curriculum `M0`.

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

- Teil von `M2`.

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

- Teil von `M2`.

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

- Teil von `M4`.

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

- Teil von `M4`.

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

Metriken:

- `activeWarnings`: aktuelle nicht akzeptierte Applicability-Warnungen.
- `acceptedWarnings`: aktuelle akzeptierte Applicability-Warnungen.
- `obsoleteAcceptedWarnings`: akzeptierte Warnungen, die nicht mehr zu aktuellen Findings passen.

Status:

- `pass`, wenn `activeWarnings + obsoleteAcceptedWarnings = 0`.
- `warn`, wenn mindestens eine aktive oder obsolete akzeptierte Warnung existiert.

Reifeziel:

- Teil von `M4`.

Interpretation:

- `acceptedWarnings` sind keine offenen Fehler. Sie dokumentieren bewusst akzeptierte, weiterhin aktuelle Warnungen.
- `obsoleteAcceptedWarnings` sind dagegen Qualitaetsschuld, weil die Registry dann nicht mehr zur aktuellen Compilerlage passt.

## Was `M4` bei Mathematik aktuell bedeutet

Bei `Mathematik (Gymnasium, DE)` bedeutet `M4` im aktuellen Dashboard:

- Sek I und Sek II sind als Pflicht-QA-Scopes registriert.
- Sek I prueft 218 atomare Ziele.
- Sek II prueft 397 atomare Ziele.
- Beide Scopes haben `CQR-101`, `CQR-102`, `CQR-103` und `CQR-201` auf `pass`.
- Die globale Review-Schicht hat `CQR-301`, `CQR-401` und `CQR-501` auf `pass`.

Damit ist die Aussage:

> Das gesamte kanonische Mathematik-Curriculum ist in seinen beiden konfigurierten Stufen Sek I und Sek II route- und assessment-seitig geprueft; die zusaetzlichen M4-Review- und Sichtbarkeitsregeln sind aktuell gruen.

Nicht gemeint ist:

> Jede denkbare fachliche Teilroute, jede Bundeslandvariation oder jede moegliche UI-Projektion ist automatisch perfekt.

Neue Stufen, Kursprofile oder learner-facing Varianten muessen als zusaetzliche QA-Scopes, Composition Views oder Validatorprofile explizit modelliert werden, wenn sie denselben Dashboardanspruch tragen sollen.
