# RegressionGPT-Handoff: Action-to-Action-Bridge-Test

> Dieser Test prüft die verborgene Weitergabe ohne sichtbare Probe-Werte. Für den separaten Pfad
> `Action -> sichtbare Assistant-Message -> nächste Action` siehe
> `VISIBLE_RELAY_GPT_INSTRUCTIONS.md` und `VISIBLE_RELAY_TEST_PROTOCOL.md`.

## 1. Ziel

Dieser Zusatztest trennt zwei mögliche Cross-Turn-Pfade:

```text
bisheriger Reproducer:
Action-Ergebnis -> nächste Nutzernachricht -> sichtbare Assistant-Antwort

neuer Bridge-Test:
Action-Ergebnis -> nächste Nutzernachricht -> Argumente einer zweiten Action
```

Der Bridge-Test gilt fachlich nur dann als bestanden, wenn der stateless Verifier im zweiten Assistant-Turn für exakt dasselbe synthetische Tupel `proof_valid=true` liefert. Eine bloße Chatantwort `BRIDGE_PASS` genügt nicht; maßgeblich sind die korrelierten Serverereignisse.

Der Test belegt beobachtetes Verhalten auf der getesteten ChatGPT-Konfiguration. Er begründet keine dokumentierte Dauerhaftigkeitsgarantie für Custom-GPT-Action-Responses und lokalisiert keine interne OpenAI-Verarbeitungsstufe.

## 2. Bestehenden Support-Reproducer nicht verändern

- Den vorhandenen `RegressionGPT` nicht bearbeiten.
- Einen neuen privaten GPT namens `RegressionGPT-Handoff` erstellen.
- Ausschließlich `HANDOFF_GPT_INSTRUCTIONS.md` als Instructions verwenden.
- Dasselbe öffentliche OpenAPI-Dokument unverändert importieren:
  `https://skillpilot.com/api/action-regression/openapi.yaml`
- Authentication auf `None` setzen.
- Knowledge, Apps, Web Search, Data Analysis, Image Generation und sonstige Capabilities deaktivieren.
- Prüfen, dass genau `createRegressionProbe` und `verifyRegressionProbe` erkannt werden.
- GPT speichern und alle Messläufe über dessen Direktlink in frischen Chats durchführen.

Vor dem Einfügen und nach dem Speichern SHA-256 von Instructions und importierter OpenAPI-Datei sichern. Der Hash des bisherigen Support-Instructions-Artefakts muss unverändert bleiben.

## 3. Aussagekräftige Vorbedingungen

Für jeden Block erfassen:

- Datum und enger UTC-Zeitraum
- GPT-Direktlink/ID und letzter Speicherzeitpunkt
- Oberfläche: gespeicherter privater GPT, nicht Builder Preview
- sichtbarer ChatGPT-Modus, Auto-Switch-Zustand und Routing-/Fallback-Hinweise
- Browser und Browserprofil
- Deployment-Commit, Spring-`application_id`, Prozessstart und `hmac_key_id`
- Instructions- und OpenAPI-SHA-256
- Neustart, Control-Aufruf oder paralleler Regressionstest während des Blocks: ja/nein

Für den ersten Block dieselbe sichtbare Modell-/Moduskonfiguration verwenden, auf der `RUN_RETAIN -> RECALL_RETAIN` zuvor reproduzierbar fehlgeschlagen ist. Interne Modellbezeichnungen nur dann angeben, wenn sie im eigenen HAR tatsächlich beobachtet wurden.

## 4. Technischer Control und Priming

Vor dem Messblock einmal ausführen:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url https://skillpilot.com/api/action-regression \
  --evidence-dir "tmp/custom-gpt-action-regression/<run-id>/handoff-control"
```

Erwartet: `CONTROL_PASS`.

Danach keine direkten Controls, Action-Editor-Tests oder parallelen GPT-Läufe im Messzeitraum ausführen. Falls ChatGPT beim ersten Action-Aufruf eine Freigabe verlangt, einen getrennten Priming-Lauf durchführen und nicht werten.

## 5. Test A – Same-turn-Positivkontrolle

In einem frischen Chat exakt senden:

```text
RUN_CHAIN
```

Erwartete Chatantwort: `CHAIN_PASS`.

Bestehenskriterien:

- genau ein `probe_issued`
- danach im selben Assistant-Turn genau ein `probe_verified`
- gleiche `probe_id` und unverändertes Tupel
- `proof_valid=true`
- keine zusätzlichen Probe-/Verifier-Aufrufe
- finale Assistant-Antwort exakt `CHAIN_PASS`

Wenn dieser Control scheitert, den Cross-Turn-Block nicht auswerten.

## 6. Test B – unmittelbare Cross-Turn-Bridge

In einem neuen Chat exakt senden:

```text
RUN_BRIDGE
```

Erwartete Chatantwort: `BRIDGE_READY`.

Prüfen, dass die finale gewöhnliche Assistant-Antwort keinen Wert aus `probe_id`, `token` oder `proof` enthält. Das normale Action-Ergebnis im aufklappbaren Tool-UI ist Bestandteil des untersuchten Action-Pfads und keine Text-Leakage. Werte nicht manuell in den Chat kopieren. Die Action-Details möglichst erst nach Abschluss des zweiten Turns für die Dokumentation aufklappen.

Unmittelbar danach im selben Chat exakt senden:

```text
VERIFY_BRIDGE
```

Erwartete Chatantwort: `BRIDGE_PASS`.

Bestehenskriterien:

- erster Turn: genau ein `probe_issued`, kein Verifier
- zweiter Turn: kein neues `probe_issued`, genau ein `probe_verified`
- `probe_verified.probe_id` entspricht dem ersten `probe_issued.probe_id`
- Verifier-Request enthält das vollständige unveränderte Tupel
- `proof_valid=true`
- finale Antworten exakt `BRIDGE_READY` und `BRIDGE_PASS`
- keine Probe-Werte in gewöhnlichem Assistant-Text oder Nutzernachrichten

Mindestens fünfmal in jeweils einem frischen Chat wiederholen. Bereits ein Lauf mit zusätzlichem `createRegressionProbe`, fehlendem Verifier, mutiertem Tupel oder Text-Leakage wird separat als Abweichung erfasst und darf nicht als Bridge-Pass zählen.

## 7. Ergebnisklassifikation

| Beobachtung | Klassifikation |
|---|---|
| `probe_issued`, danach im Folgeturn `probe_verified` mit derselben `probe_id` und `proof_valid=true` | Action-to-Action-Bridge bestanden |
| Chat sagt `BRIDGE_PASS`, aber kein passendes positives Serverereignis | sichtbare Falschaussage; Bridge nicht bestanden |
| `BRIDGE_MISSING`, kein Verifier | vollständiges Tupel stand für den zweiten Action-Aufruf nicht nutzbar zur Verfügung oder die Anweisung wurde nicht entsprechend ausgeführt; interne Ursache offen |
| zweites `probe_issued` vor dem Verifier | unzulässige Neuanlage/Retry; Bridge nicht bestanden |
| `probe_verification_rejected` | Verifier wurde versucht, Request war aber unvollständig, fehlerhaft oder nicht schema-konform |
| `probe_verified` mit `proof_valid=false` | wohlgeformtes, aber verändertes oder unter dem aktuellen Prozessschlüssel ungültiges Tupel; Bridge nicht bestanden |
| korrekter positiver Verifier, aber falsche finale Antwort | Werttransport bestanden; Auswertung/Finalformat separat fehlgeschlagen |
| Probe-Wert in gewöhnlicher erster Assistant-Antwort | Lauf kontaminiert: spätere Übergabe könnte aus sichtbarem Text stammen |
| Action-Freigabe oder Policy-Refusal verhindert den Aufruf | Messung nicht durchgeführt; kein Retention-Ergebnis |
| Backend-Neustart/HMAC-Schlüsselwechsel zwischen den Turns | Lauf ungültig und zu wiederholen |

`proof_valid=true` beweist, dass am Verifier ein unter dem aktiven Backendschlüssel gültiges vollständiges Tupel ankam. Es beweist nicht, wie ChatGPT den Wert intern gespeichert oder rekonstruiert hat.

## 8. Ergebnismatrix

Test A separat mit UTC, Conversation-URL, sichtbarem Modus, Call-Reihenfolge, `proof_valid` und finaler Antwort dokumentieren. Test B erhält je Bridge-Paar eine Zeile:

| Lauf | UTC | Conversation-ID/URL | sichtbarer Modus | `BRIDGE_READY` | Verifier aufgerufen | issued/verified gleiche ID | `proof_valid` | zusätzliche Calls | Text-Leak | Bewertung |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | |
| 2 | | | | | | | | | | |
| 3 | | | | | | | | | | |
| 4 | | | | | | | | | | |
| 5 | | | | | | | | | | |

Für einen späteren experimentellen Custom-GPT-Produktspike ist die Minimalreihe nur ein Vorfilter. Zunächst Test B auf mindestens 10/10 fehlerfreie unmittelbare Bridges erweitern. Erst danach wird eine getrennt versionierte Variante mit einer zusätzlichen Dialog-Turn-Grenze vorbereitet; sie gehört bewusst nicht zu diesem minimalen ersten Test.

Das spätere strengere Go-Gate lautet:

- Test B mindestens 10/10 bestanden
- zusätzliche Dialog-Turn-Variante mindestens 10/10 bestanden
- keine Tuple-Leaks, Extra-Creates, Retries oder Modell-/Modusabhängigkeit
- anschließend eigener Test mit dem echten `chatSessionToken`-Flow und ausschließlich einem Test-Lernstand

Jede inkonsistente Bridge ist ein No-Go für eine davon abhängige Produktionsarchitektur.

## 9. Audit sichern

Nach jedem engen Block die Regressionseinträge sichern:

```bash
journalctl \
  --unit skillpilot \
  --since "<UTC start>" \
  --until "<UTC end>" \
  --output cat | \
grep '"service":"skillpilot-action-regression"' \
  > "tmp/custom-gpt-action-regression/<run-id>/handoff-spring-audit.log"
```

Zusätzlich sichern:

- Instructions und importierte OpenAPI-Datei samt Hash
- GPT-Konfiguration und erkannte Operationsliste
- Conversation-URL/ID und Bildschirmaufnahme
- sichtbare Antworttexte und exakte Nutzerbefehle
- sanitisiertes HAR, falls der aufgelöste Modus dokumentiert werden soll

Rohe HAR-Dateien enthalten regelmäßig Cookies und Autorisierungsdaten und dürfen nicht ungeprüft geteilt werden.
