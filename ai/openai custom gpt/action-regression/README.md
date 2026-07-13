# Custom-GPT-Action-Reproducer im SkillPilot-Backend

Der Reproducer läuft als kleiner, fachlich unabhängiger Controller im vorhandenen Spring-Boot-4.1-Backend. Er wird mit dem normalen SkillPilot-Deployment ausgeliefert und benötigt weder einen zweiten Prozess noch eine nginx-Änderung, Datenbanktabellen, Authentisierung, RAG oder Lernerdaten.

Getestet wird die beobachtbare ChatGPT-Action-Kette:

```text
GET /api/action-regression/v1/probe
  -> { probe_id, token, proof }

POST /api/action-regression/v1/verify
  <- exakt dieselben drei Felder
  -> { ok, probe_id, proof_valid }
```

`proof` ist das 128-Bit-Präfix eines HMAC-SHA-256 über:

```text
sp-action-regression-v1 NUL probe_id NUL token
```

Jeder Probe-Aufruf liefert eine frische UUID und einen zufälligen Token. Der HMAC-Schlüssel wird beim Start des Spring-Prozesses erzeugt und verlässt ihn nie. Der Verifier benötigt keinen gespeicherten Probe-Zustand. Ein Neustart ist anhand der geloggten, nicht geheimen `hmac_key_id` sichtbar und macht einen laufenden Testblock ungültig.

## Öffentliche Endpunkte

Nach dem normalen Produktions-Deployment:

```text
GET  https://skillpilot.com/api/action-regression/healthz
GET  https://skillpilot.com/api/action-regression/openapi.yaml
GET  https://skillpilot.com/api/action-regression/v1/probe
POST https://skillpilot.com/api/action-regression/v1/verify
```

Der Pfad liegt absichtlich außerhalb von `/api/ai`, damit die optionale SkillPilot-AI-API-Key-Prüfung nicht greift. Spring Security lässt ihn öffentlich zu. Der Controller verwendet keine Repositories oder fachlichen SkillPilot-Services.

## Dateien

- Spring-Controller und Protokollcode: `backend/src/main/java/com/skillpilot/backend/actionregression/`
- fokussierte Backendtests: `backend/src/test/java/com/skillpilot/backend/actionregression/`
- minimales OpenAPI-Template: `backend/src/main/resources/action-regression-openapi.yaml`
- `control.mjs`: unabhängiger öffentlicher HTTP-Control-Test
- `REGRESSION_GPT_INSTRUCTIONS.md`: Instructions für den privaten Test-GPT
- `TEST_PROTOCOL.md`: Messreihe und Fehlerklassifikation
- `TICKET_TEMPLATE.md`: englische Supportvorlage
- `PROBLEM_STATEMENT.md`: Aussage und Grenzen des Nachweises

## Tests und Control

Backendtests:

```bash
cd backend
./gradlew test --tests '*ActionRegression*'
```

Wenn das normale Backend lokal läuft:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url http://127.0.0.1:8080/api/action-regression \
  --expected-openapi-base-url https://skillpilot.com/api/action-regression
```

Der zweite Parameter ist lokal nötig, weil das Backend sein OpenAPI-Dokument standardmäßig bereits mit der späteren öffentlichen SkillPilot-URL rendert. Alternativ kann der lokale Spring-Start `skillpilot.public-base-url` auf die lokale URL setzen.

Nach dem Deployment gegen denselben realen Endpunkt, den auch der Custom GPT verwendet:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url https://skillpilot.com/api/action-regression \
  --evidence-dir "tmp/custom-gpt-action-regression/public-control"
```

Erwartet:

```text
CONTROL_PASS probe_id=<frische UUID> token=<frischer Token>
```

Der Client verlangt an allen Schritten exakt HTTP 200, folgt keinen Redirects, prüft Content-Types, `Cache-Control: no-store`, eindeutige Request-IDs, das gerenderte OpenAPI-Dokument und die unveränderte Probe/Verify-Kette. Danach verändert er genau ein Hexzeichen des weiterhin schema-konformen `proof` und verlangt als negativen Deployment-Control `ok=false` sowie `proof_valid=false`; damit würde ein versehentlich immer positiv antwortender Verifier auffallen. Jeder HTTP-Versuch wird nach 40 Sekunden abgebrochen. Der optionale Evidence-Export enthält Status, Header, exakte Bodies, Bytezahl und SHA-256 beider Verify-Controls.

## Normales Deployment

Es gibt keinen zusätzlichen Dienst. Der bestehende Ablauf baut das Spring-Boot-JAR und startet den vorhandenen systemd-Dienst `skillpilot` neu:

```bash
scripts/deploy.sh
```

Danach zuerst prüfen:

```bash
curl --fail-with-body https://skillpilot.com/api/action-regression/healthz
curl --fail-with-body \
  https://skillpilot.com/api/action-regression/openapi.yaml \
  --output tmp/custom-gpt-action-regression/configured-openapi.yaml
sha256sum tmp/custom-gpt-action-regression/configured-openapi.yaml
```

Genau die heruntergeladene Datei wird in den privaten RegressionGPT importiert und später dem Ticket beigefügt. Der öffentlich erreichbare Spring-Endpunkt ist Teil des reproduzierbaren Testaufbaus; eine Prozessisolation gegenüber dem übrigen Backend ist für die untersuchte ChatGPT-Weiterverarbeitung nicht erforderlich.

## Audit

Der Controller schreibt strukturierte `action_regression`-Ereignisse in die normalen Spring-Boot-Logs. Dazu gehören insbesondere:

- UTC-Zeit, Protokollkennung, Spring-`application_id` und nicht geheime `hmac_key_id`
- `probe_id`, eigene Request-ID, `request_sequence` und `request_started_at`
- HTTP-Methode, Pfad, Status und Dauer
- validierte Probe-Werte, Request-Bytezahl/-SHA-256 sowie synthetische Response-Bodies mit Bytezahl und SHA-256
- `probe_issued`, `probe_verified` oder `probe_verification_rejected`
- `proof_valid` und der Commit-/Flush-Zustand der Response

Gültige Probe-Werte und Serverresponses sind reine Testdaten und werden absichtlich geloggt. Beliebige oder fehlerhafte öffentliche Request-Bodies werden nicht im Klartext protokolliert. Bis 8192 Byte bindet das Audit den vollständigen Body durch exakte Bytezahl und SHA-256; bei größeren Bodies werden 8192 Capture-Bytes samt Hash, mindestens 8193 beobachtete Bytes und `request_body_truncated=true` festgehalten. Dazu kommt jeweils die Fehlerklasse. IP-Weiterleitungsheader sowie frei formulierte Headerwerte werden im Spezialaudit nicht erfasst; der User-Agent erscheint nur als Bytezahl und SHA-256. Eine auf höchstens 64 alphanumerische Zeichen und Bindestriche begrenzte `CF-Ray`-Kennung kann zur Proxy-Korrelation erscheinen. Secrets, Authorization-Header und SkillPilot-Nutzerdaten sind nicht beteiligt. Ein erfolgreicher direkter Control-Lauf belegt am realen Deployment sowohl den positiven unveränderten Pfad als auch die Ablehnung einer einzelnen Proof-Mutation; die lokalen Java-Tests decken weitere Mutationen und Fehlerschemata ab. Die Custom-GPT-Messreihe prüft danach, ob ChatGPT die erste Action-Response sichtbar beziehungsweise im zweiten Action-Aufruf korrekt weiterverwendet.

Die Logs belegen die Servergrenze, aber nicht, welcher interne OpenAI-Bestandteil eine Response verarbeitet hat. `proof_valid=true`, frische IDs, die bei Handlerstart vergebene `request_sequence`, Startzeitpunkte und ein enger Zeitraum ergeben den belastbaren beobachtbaren Nachweis. Bei parallelen Requests ist die Reihenfolge der ausgegebenen Logzeilen allein nicht maßgeblich. OpenAIs interne Route kann nur OpenAI selbst bestätigen.

## RegressionGPT einrichten

1. Einen neuen privaten GPT erstellen.
2. `REGRESSION_GPT_INSTRUCTIONS.md` unverändert als Instructions einfügen.
3. Knowledge, Apps und zusätzliche Capabilities deaktivieren.
4. Genau eine Custom Action mit Authentication `None` anlegen.
5. Das öffentlich heruntergeladene `/api/action-regression/openapi.yaml` unverändert importieren.
6. Prüfen, dass nur `createRegressionProbe` und `verifyRegressionProbe` erkannt werden.
7. OpenAPI-Datei, Instructions und Screenshots der Konfiguration sichern und hashen.
8. Beide Operationen einmal im Action-Editor kontrollieren; diesen Priming-/Editorlauf nicht in die GPT-Statistik aufnehmen.
9. GPT speichern und die Primärtests über den privaten Direktlink in jeweils neuen Chats durchführen.
10. `TEST_PROTOCOL.md` abarbeiten.

Beide Operationen tragen `x-openai-isConsequential: false`. Trotzdem kann beim ersten Aufruf ein Bestätigungsdialog erscheinen; dessen Zustand muss für die Messreihe konstant gehalten werden.

## Offizielle OpenAI-Randbedingungen

- [GPT Actions konfigurieren](https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts)
- [GPT Actions – Einführung](https://developers.openai.com/api/docs/actions/introduction)
- [Production notes on GPT Actions](https://developers.openai.com/api/docs/actions/production)
- [GPT-5.6 in ChatGPT](https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt/)
- [Troubleshooting GPTs](https://help.openai.com/en/articles/11325361-troubleshooting-gpts)
- [OpenAI Support kontaktieren](https://help.openai.com/en/articles/6614161-how-can-i-contact-support)

OpenAI verlangt einen öffentlich erreichbaren HTTPS-/OpenAPI-Endpunkt, aber keinen separaten Serverprozess oder vHost. Actions sind laut aktueller Dokumentation im Pro-Modus nicht verfügbar.

Der unauthentisierte Reproducer ist absichtlich temporär. Er sollte nur für den eng begrenzten Messzeitraum öffentlich bleiben, währenddessen auf unerwartetes Volumen überwacht und nach Abschluss des Tickets wieder entfernt werden. Bei auffälligem Fremdverkehr wird der Messblock verworfen. Eine niedrige experiment-spezifische Rate-Grenze wäre selbst ein möglicher Störfaktor; für einen dauerhaften Betrieb müsste eine geeignete Begrenzung ergänzt werden.

## Entfernen

Der Reproducer besitzt keine Migrationen oder persistenten Daten. Nach Abschluss des Tickets können Controller, OpenAPI-Resource, Tests und dieses Werkzeugverzeichnis wieder entfernt und SkillPilot normal neu deployt werden.
