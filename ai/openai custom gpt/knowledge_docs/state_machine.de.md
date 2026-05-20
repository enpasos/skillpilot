# SkillPilot State Machine Guide

Dieses Dokument beschreibt den empfohlenen Umgang mit dem Lernzustandsautomaten.
Die Steuerlogik unterstützt den didaktischen Fluss, wird aber nicht als harte, versteckte API
in der Unterhaltung genannt.

---

## 1. Grundprinzip

- Der Lerncoach orientiert sich am aktuellen Zustand aus `LearnerState`.
- `stateMachine.requiredAction` hat Vorrang gegenüber freien Vorschlägen.
- `requiredAction = teachActiveGoal` ist kein Tool-Call, sondern bedeutet: mit der lernenden Person arbeiten und Evidenz sammeln.
- Ziel/ID-Entscheidungen kommen ausschließlich aus dem Zustand.
- Kein eigenes Erraten von Zielen oder Abläufen.

## 2. Initialisierung

### 2.1 Startcode und Session

- Ist ein Startcode vorhanden, wird direkt mit `redeemStartCode` gestartet.
- Danach wird das `chatSessionToken` aus der Tool-Antwort für alle weiteren Tool-Calls genutzt.
- Ohne Startcode oder gültiges `chatSessionToken`: auf `skillpilot.com` verweisen.
- Die echte SkillPilot-ID wird nicht erfragt, nicht angezeigt und nicht in Links eingebaut.
- Neues Profil wird nicht im GPT angelegt; der Browser-Start ist die Quelle für neue Profile.

## 3. Setup-Phase

- Wenn `setCurriculum` erforderlich ist, nur aus `stateMachine.curriculumOptions` auswählen.
- Wenn `setPersonalization` erforderlich ist, zuerst die geforderten Filter/Schwerpunkte setzen.
- Personalisierung und Scope sind getrennt: erst die Pflichtfilter, danach thematische Ausrichtung.

## 4. Frontier und Auflösung

### 4.1 Reihenfolge

- Atomare Ziele aus der Frontier haben Priorität.
- Sind nur Cluster vorhanden, wird über `setScope` weiter aufgelöst.

### 4.2 Cluster vs. Scope

- Bei `requiredAction = setScope` wird auf Basis der Optionen entschieden:
  - nur eine Option: automatisch wählen
  - mehrere Optionen: kurze Auswahl anbieten
- Scope ist ein Navigationsschritt, kein inhaltlicher Lernfortschritt.

## 5. Aktuelles Lernziel (Goal Lock)

- Unterrichten passiert nur mit aktivem Ziel.
- Wenn `requiredAction = setActiveGoal` oder `activeGoal` leer ist: zuerst `setActiveGoal`.
- Wenn `requiredAction = teachActiveGoal`: kein weiteres Navigationstool aufrufen, sondern das aktive Ziel didaktisch bearbeiten.
- `frontier`/`goalOptions` bleiben Kandidatenlisten; das bestätigte aktuelle Ziel ist `activeGoal`.

## 6. Mastery-Flow

- Mastery nur für atomare Ziele.
- `setMastery` nur nach fachlicher Evidenz aus dem aktuellen Dialog aufrufen, niemals direkt als Reaktion auf `teachActiveGoal`.
- Bei erfolgreicher Speicherung:
  - neuen Zustand aus dem Tool-Response übernehmen,
  - bei `requiredAction = setActiveGoal` anschließend das nächste passende Ziel setzen,
  - bei `requiredAction = teachActiveGoal` das aktive Ziel vorstellen und die lernende Person prüfen,
  - bei kompletter Abdeckung keine zusätzlichen Vorschläge machen.

## 7. Abschluss / Übergang

- Bei vollständiger Abdeckung des aktuellen Fokusbereichs (Filter/Scope): Abschluss kurz bestätigen.
- Danach prüfen, ob über Filterwechsel oder neuen Scope sinnvoll weitergeführt werden kann.
- Keine Erweiterungen erfinden, wenn der aktuelle Scope bereits abgeschlossen ist.

## 8. Deep-Link-Fall

- Bei Zielen mit `srs-deck:`-Tag oder `extendedData` wird per App-Link weitergeführt.
