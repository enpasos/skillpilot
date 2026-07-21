# RegressionGPT-VisibleRelay: sichtbarer Message-Relay-Test

## 1. Ziel

Dieser Test untersucht den vom Benutzer gewünschten Pfad:

```text
Action 1
  -> Action-Ergebnis
  -> gewöhnliche sichtbare Assistant-Message mit den relevanten Werten
  -> nächste Nutzernachricht ohne diese Werte
  -> Action 2 mit den Werten aus der vorherigen Assistant-Message
```

Er unterscheidet sich bewusst vom `RegressionGPT-Handoff`-Test. Dort durften die Werte nicht in die Assistant-Message gelangen; damit wurde verborgene Action-Response-Retention geprüft. Hier ist die sichtbare Message der beabsichtigte Zustandsträger.

Ein positives Serverergebnis belegt, dass das vollständige Tupel im Folgeturn wieder für Action-Argumente verfügbar war, nachdem es in die gewöhnliche Assistant-Message geschrieben wurde. Es kann nicht intern beweisen, aus welcher konkreten OpenAI-Repräsentation das Modell die Werte gelesen hat. Zusammen mit einem unter derselben Konfiguration negativen Hidden-Handoff-Test ist ein Pass jedoch starke differentielle Evidenz für die sichtbare Message als wirksamen Relay-Pfad.

## 2. Test-GPT konfigurieren

Den bestehenden Support-Reproducer nicht verändern.

1. Einen separaten privaten GPT namens `RegressionGPT-VisibleRelay` erstellen. Der vorhandene Handoff-GPT kann dafür dupliziert werden.
2. Die Instructions vollständig durch `VISIBLE_RELAY_GPT_INSTRUCTIONS.md` ersetzen.
3. Dasselbe OpenAPI-Dokument unverändert importieren:
   `https://skillpilot.com/api/action-regression/openapi.yaml`
4. Authentication `None` verwenden.
5. Prüfen, dass genau `createRegressionProbe` und `verifyRegressionProbe` erkannt werden.
6. Knowledge, Apps, Web Search, Data Analysis, Image Generation und sonstige Capabilities deaktivieren.
7. Privat speichern und über den gespeicherten Direktlink testen, nicht in der Builder Preview.

Instructions und importierte OpenAPI-Datei vor der Messung hashen. Falls beim ersten Action-Aufruf eine Freigabe erscheint, den Lauf als Priming verwerfen und danach einen frischen Chat öffnen.

## 3. Technischer Preflight

Vor dem Messblock einmal den bereits vorhandenen öffentlichen Control ausführen:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url https://skillpilot.com/api/action-regression \
  --evidence-dir "tmp/custom-gpt-action-regression/<run-id>/visible-relay-control"
```

Danach im Messzeitraum keine direkten Controls, Editor-Tests oder parallelen RegressionGPT-Läufe ausführen.

## 4. Sichtbarer Relay-Lauf

In einem frischen Chat exakt senden:

```text
RUN_RELAY
```

Erwartet wird genau eine gewöhnliche Assistant-Textzeile:

```text
RELAY_READY {"probe_id":"<frischer Wert>","token":"<frischer Wert>","proof":"<frischer Wert>"}
```

Die Werte dürfen hier ausdrücklich sichtbar sein. Sie sind synthetische Testdaten ohne Berechtigungswirkung.

Anschließend ohne Kopieren, Bearbeiten oder Wiederholen der Werte unmittelbar exakt senden:

```text
VERIFY_RELAY
```

Erwartete Chatantwort:

```text
RELAY_PASS
```

## 5. Bestehenskriterien

Der Lauf besteht nur, wenn alle Bedingungen erfüllt sind:

- erster Turn: genau ein `probe_issued`, kein Verifier
- erste gewöhnliche Assistant-Message enthält exakt die drei vom Server ausgegebenen Werte
- Nutzernachricht enthält nur `VERIFY_RELAY`, keine Probe-Werte
- zweiter Turn: kein neues `probe_issued`, genau ein `probe_verified`
- Verifier-Request enthält exakt das ursprüngliche vollständige Tupel
- identische `probe_id`, gleiches `application_id` und gleicher `hmac_key_id`
- HTTP 200, `ok=true` und `proof_valid=true`
- finale Assistant-Antwort exakt `RELAY_PASS`

Zunächst einen Lauf auswerten. Danach mindestens fünf, besser zehn Wiederholungen in jeweils frischen Chats durchführen.

## 6. Ergebnisklassifikation

| Beobachtung | Klassifikation |
|---|---|
| sichtbare Werte, danach passender positiver Verifier und `RELAY_PASS` | sichtbarer Message-Relay bestanden |
| sichtbare Werte, danach `RELAY_MISSING` und kein Verifier | Werte wurden im Folgeturn nicht nutzbar aus der vorherigen Message übernommen oder die Anweisung wurde nicht entsprechend ausgeführt; interne Ursache offen |
| zweites `probe_issued` | unzulässige Neuanlage/Retry; Relay nicht bestanden |
| `probe_verification_rejected` | Relay/Tool-Aufruf versucht, aber Request unvollständig oder nicht schema-konform |
| `probe_verified`, `proof_valid=false` | wohlgeformtes, aber verändertes Tupel; Relay nicht bestanden |
| positiver Verifier, aber falsche finale Antwort | Werttransport bestanden; Finalformat separat fehlgeschlagen |
| Werte vom Benutzer in `VERIFY_RELAY` zurückkopiert | anderer Testpfad: expliziter User-Echo-Control, nicht dieser Assistant-Message-Relay |
| Backend-Neustart oder HMAC-Schlüsselwechsel | Infrastrukturlauf ungültig |

## 7. Bedeutung für SkillPilot

Die sichtbaren Testwerte sind absichtlich harmlos. Ein positives Ergebnis erlaubt nicht, den heutigen `chatSessionToken` in einer Assistant-Message auszugeben: Dieser Token ist ein Bearer-Geheimnis und würde dadurch dem Nutzer, Screenshots, Exporten und möglicherweise weiteren Clients offengelegt.

Eine produktive Nutzung des Patterns bräuchte stattdessen einen dafür entworfenen Relay-Wert, beispielsweise eine kurze signierte und befristete Fortsetzungs-Kapsel. Sie sollte keine eigenständige Berechtigung verleihen, serverseitig gegen Workflow, Nutzeridentität beziehungsweise OAuth-Subject und erwarteten Schritt validiert werden und nach Verwendung ablaufen. Fachliche Werte aus der Message sind generell als vom Client kontrollierte Eingabe zu behandeln und im Backend erneut zu validieren.

Wenn Visible Relay zuverlässig besteht, Hidden Handoff aber scheitert, ist ein vereinfachter Custom-GPT-Prototyp technisch denkbar. Vor einem Produktivpfad müssen dennoch Geheimnisschutz, Manipulationsschutz, Ablauf, Wiederholungsschutz und Nutzerbindung separat gelöst werden.
