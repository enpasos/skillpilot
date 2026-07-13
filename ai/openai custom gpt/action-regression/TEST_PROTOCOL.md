# Custom GPT Action regression test protocol

## 1. Ziel und Aussagegrenzen

Der Primärtest für das aktuelle Supportticket ist die Turn-Grenze: `RUN_RETAIN` ruft ein frisches, nicht erratbares und serverseitig signiertes JSON-Tupel ab; das unmittelbar folgende `RECALL_RETAIN` im selben Chat soll einen daraus gelesenen Wert ohne neue Action wiederverwenden. `RUN_CHAIN` ist der entscheidende positive Kontrollfall: Innerhalb desselben Assistant-Turns soll genau dasselbe Antwortformat unverändert an den Verifier weitergegeben werden.

Der direkte öffentliche Control-Test belegt vor der GPT-Messung, dass derselbe Endpunkt den unveränderten positiven Pfad ausführt und eine einzelne schema-konforme Proof-Mutation ablehnt. Die lokalen Java-Tests decken weitere Mutationen und fehlerhafte Schemata ab. Die angehängte, vom Endpunkt ausgelieferte OpenAPI-Datei bindet den exakten Action-Vertrag. Getestet wird anschließend ChatGPT, nicht die Prozessisolation des Spring-Backends.

Die Ergebnisse werden getrennt bewertet:

1. **Aufrufreihenfolge:** Wurden Probe und Verifier in der verlangten Reihenfolge und Häufigkeit aufgerufen?
2. **Wertintegrität:** War der Verifier-Request wohlgeformt und das signierte Tupel unverändert (`proof_valid=true`)?
3. **Finalformat:** Entspricht die sichtbare Chatantwort exakt dem verlangten Text?
4. **Cross-Turn-Verfügbarkeit:** Wird ein Wert aus dem erfolgreichen Action-Ergebnis nach genau einer Nutzer-Turn-Grenze im selben kurzen Chat wiederverwendet?

Ein korrekter Token mit Zusatztext ist eine Finalformat-Abweichung, kein Result-Handoff-Fehler. `proof_valid=true` belegt ein gültig signiertes Tupel am Verifier, aber nicht, welcher interne OpenAI-Bestandteil es weitergegeben hat. Frische IDs, die bei Handlerstart vergebene `request_sequence`, Startzeitpunkte, ein enger Zeitraum und ausgeschlossener Parallelverkehr sichern die Zuordnung zum Lauf ab. Die Reihenfolge der fertig geschriebenen Logzeilen allein ist bei Parallelität kein Startreihenfolge-Beweis. `RETAIN_READY` beweist seinerseits keine dauerhafte interne Speicherung; `RETAIN_MISSING` belegt die sichtbare Nichtverwendung im Folgeturn, nicht die interne Ursache.

## 2. Vorbedingungen dokumentieren

- Datum/Uhrzeit in UTC und lokaler Zeitzone
- letzter bekannter erfolgreicher und erster bekannter fehlerhafter Zeitpunkt des SkillPilot Coach
- Account/Plan; bei Workspace dessen ID, Action-Domain-Allowlist und relevante Policy
- Browser/Version, Betriebssystem, Netzwerk und VPN/Proxy
- normaler Browser sowie möglichst Inkognito oder zweites Browserprofil
- zweiter berechtigter Account beziehungsweise zweite Testperson, soweit verfügbar
- GPT-Direktlink/ID, Sichtbarkeit und letzter Aktualisierungszeitpunkt
- Testoberfläche: gespeicherter privater GPT, Builder Preview oder Action-Editor-Test
- gewählter ChatGPT-Modus und Auto-Switch an/aus
- sichtbare Antwort-Kennzeichnung, Quota-/Fallback-Hinweis und sonstige Routingmeldung
- ChatGPT-Statusseite zum Testzeitpunkt
- separat erfasster Deployment-Git-Commit/Build, Spring-`application_id`, Prozessstart, Java-Version und Neustarts
- `hmac_key_id` aus dem Spring-Audit; niemals den geheimen Schlüssel
- SHA-256 der exakt importierten OpenAPI-Datei und der Instructions

Nicht pauschal behaupten, dass intern GPT-5.6 lief. OpenAI dokumentiert derzeit GPT-5.5 Instant für `Instant` sowie GPT-5.6 Sol für `Medium`, `High` und `Extra High`. Auto-Switch kann `Instant` zu `Medium` routen; bei einem Reasoning-Limit kann ein sichtbarer Fallback auf GPT-5.4 Thinking mini auftreten. Actions sind im `Pro`-Modus nicht verfügbar. Für die Hauptreihe Auto-Switch ausschalten und alle sichtbaren Routinghinweise sichern.

## 3. Normal deployen und OpenAPI sichern

Der Reproducer ist Teil des bestehenden Spring-Boot-4.1-Backends:

```bash
scripts/deploy.sh
```

Danach die realen Endpunkte prüfen:

```bash
curl --fail-with-body https://skillpilot.com/api/action-regression/healthz
mkdir -p "tmp/custom-gpt-action-regression/<run-id>/configuration"
curl --fail-with-body --silent --show-error \
  https://skillpilot.com/api/action-regression/openapi.yaml \
  --output "tmp/custom-gpt-action-regression/<run-id>/configuration/configured-openapi.yaml"
sha256sum \
  "tmp/custom-gpt-action-regression/<run-id>/configuration/configured-openapi.yaml" \
  "ai/openai custom gpt/action-regression/REGRESSION_GPT_INSTRUCTIONS.md"
```

Als Ticketartefakt zählt genau dieses öffentlich ausgelieferte und später importierte Dokument. Nach jeder Backend- oder GPT-Konfigurationsänderung erneut herunterladen, importieren, speichern und hashen.

## 4. RegressionGPT konfigurieren

1. Einen neuen privaten GPT namens `RegressionGPT` erstellen.
2. Exakt die mitgelieferten Instructions einfügen.
3. Knowledge, Apps, Web Search, Data Analysis, Image Generation und sonstige Capabilities deaktivieren.
4. Genau eine Custom Action mit Authentication `None` anlegen.
5. Die gespeicherte `configured-openapi.yaml` unverändert importieren.
6. Prüfen, dass nur `createRegressionProbe` und `verifyRegressionProbe` erkannt werden und beide `x-openai-isConsequential: false` tragen.
7. GPT speichern. Import, erkannte Operationsliste, Sichtbarkeit und Aktualisierungszeit als Screenshots sichern.

Testoberflächen strikt trennen:

- **Primärtest:** gespeicherter privater GPT über seinen Direktlink, jeder Lauf in einem neuen Chat.
- **Builder Preview:** nur als getrennten Sekundärvergleich erfassen.
- **Action-Editor Test:** nur als Transport-/Schema-Control, nicht als Modelllauf zählen.
- Keinen vorhandenen Chat über `@` oder einen nachträglichen GPT-Wechsel weiterverwenden.

Trotz `x-openai-isConsequential: false` kann beim ersten Gebrauch ein Bestätigungsdialog erscheinen. Genau einen gekennzeichneten Priming-Lauf durchführen, einen angebotenen „Always allow“-Status konsistent wählen und diesen Lauf nicht werten.

## 5. Technische Controls vor jedem Messblock

Control gegen exakt denselben öffentlichen Basispfad ausführen:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url https://skillpilot.com/api/action-regression \
  --evidence-dir "tmp/custom-gpt-action-regression/<run-id>/control"
```

Erwartet: `CONTROL_PASS`. Der Export enthält die exakten Bytes und den SHA-256 von `/openapi.yaml`; dieser Hash muss mit der importierten Datei übereinstimmen. Er enthält außerdem den erfolgreichen unveränderten Verify-Aufruf und einen klar getrennten negativen Control-Aufruf mit genau einer Proof-Mutation. Für diesen müssen HTTP 200, `ok=false` und `proof_valid=false` dokumentiert sein. Beide direkten Aufrufe gehören zur technischen Vorprüfung und nicht zur GPT-Messreihe.

Zusätzlich:

1. Beide Operationen einmal mit der Testfunktion des Action-Editors prüfen und als `editor_control` kennzeichnen.
2. HTTP 200, JSON-Content-Type, `Cache-Control: no-store` und kurze Latenz prüfen.
3. Spring-Start-Audit mit `application_id`, Java-Version und `hmac_key_id` sichern; den Deployment-Git-Commit separat festhalten.
4. Neustarts oder Schlüsselwechsel während eines Blocks ausschließen.
5. Uhren synchronisieren und einen engen UTC-Start-/Endzeitraum notieren.
6. Während des Blocks keine Controls, Editor-Tests oder parallelen GPT-Chats ausführen.

Der Endpoint ist öffentlich und unauthentisiert; unerwartete Requests im Zeitfenster als Kontamination markieren und den Lauf wiederholen. Er ist nur für den engen Messzeitraum vorgesehen, wird auf auffälliges Volumen überwacht und danach wieder entfernt. Ein vorhandenes gewöhnliches nginx-Access-Log kann ergänzend angehängt werden, ist aber keine Voraussetzung und erfordert keine Konfigurationsänderung.

Schlägt der öffentliche Control-Test fehl, zuerst Deployment, DNS, TLS oder Schema korrigieren und noch kein OpenAI-Ticket aus den GPT-Läufen ableiten.

## 6. Test A – unmittelbare Verarbeitung

Im gespeicherten privaten GPT in einem frischen Chat exakt senden:

```text
RUN_SINGLE
```

Erwartet:

```text
SINGLE probe_id=<exakte UUID aus dem Serverlog> token=<exakter Token aus dem Serverlog>
```

Bestehenskriterien:

- genau ein `probe_issued`, keine Wiederholung und kein Verifier-Aufruf
- HTTP 200 und abgeschlossene Response
- exakt dieselbe `probe_id` und derselbe `token` in der Chatantwort
- kein zusätzlicher Text

## 7. Test B – Action-Chaining

Im gespeicherten privaten GPT in einem frischen Chat exakt senden:

```text
RUN_CHAIN
```

Erwartet:

```text
CHAIN_PASS
```

Bestehenskriterien:

- genau ein abgeschlossenes `probe_issued`
- danach genau ein `probe_verified` mit derselben `probe_id`
- beide Responses HTTP 200
- `proof_valid=true`
- Chatantwort ausschließlich `CHAIN_PASS`

Jeden zusätzlichen, wiederholten oder umgekehrt angeordneten Aufruf als Aufrufreihenfolge-Abweichung erfassen. Ein `probe_verification_rejected` belegt einen Verifier-Versuch, aber keinen wohlgeformten Verifier-Aufruf.

## 8. Test C – Cross-Turn-Retention

Im selben frischen Chat nacheinander senden:

```text
RUN_RETAIN
```

Erwartet: `RETAIN_READY`.

Danach:

```text
RECALL_RETAIN
```

Erwartet: `RETAIN token=<Token aus dem ersten Serverlog>`. Beim zweiten Turn darf kein neuer Serveraufruf stattfinden. Tatsächlich beobachtetes Fehlersignal: `RETAIN_MISSING`.

Dieser Paarlauf ist der Primärreproducer für das Cross-Turn-Ticket. Mindestens fünfmal in jeweils einem frischen Chat wiederholen. `RUN_RETAIN` und `RECALL_RETAIN` gehören dabei immer zum selben Chat und müssen ohne Zwischenmeldung direkt aufeinander folgen. Nicht mit der unmittelbaren Chain-Statistik vermischen.

## 9. Umfang und Ergebnismatrix

Mindestens fünf, besser zehn frische Chats je Primärtest und verfügbarer Vergleichsstufe. Modi zeitlich verschachteln, statt alle Läufe eines Modus nacheinander auszuführen. So wird eine gestaffelte Bereitstellung weniger leicht mit einem Moduseffekt verwechselt.

| Gewählte Stufe | Auto-Switch | sichtbare Kennzeichnung | Quota/Fallback | `RUN_SINGLE` | `RUN_CHAIN` | `RUN_RETAIN` -> `RECALL_RETAIN` |
|---|---|---|---|---:|---:|---:|
| Instant | aus | | | /10 | /10 | /10 |
| Medium | aus/n/a | | | /10 | /10 | /10 |
| High | aus/n/a | | | /10 | /10 | /10 |
| Extra High | aus/n/a | | | /10 | /10 | /10 |

Pro Lauf erfassen:

- `run_id`, UTC-Start/-Ende und Conversation-URL/ID
- Oberfläche, Modus, Auto-Switch und sichtbare Routinghinweise
- Approval-Zustand und Priming ja/nein
- separat erfasster Deployment-Git-Commit, `application_id`, Prozessstart, `hmac_key_id` und Neustart im Block
- `probe_id`, nach `request_sequence` und `request_started_at` korrelierte Auditereignisse, Call-Anzahl und Request-IDs
- Probe-/Verifier-Status, Bytes, SHA-256, Fehlercode und `proof_valid`
- exakte sichtbare Antwort
- `call_order_pass`, `value_integrity_pass` und `final_format_pass`
- beim Retention-Paar: beide exakten Nachrichten, Bestätigung derselben Conversation-ID, Zeitabstand und zusätzliche Action beim Recall ja/nein

## 10. Fehlerklassifikation

| Beobachtung | Belastbare Aussage |
|---|---|
| Öffentlicher Control-Test scheitert | Realen Endpunkt oder Schema zuerst untersuchen |
| Control besteht, kein `probe_issued` | Kein erfolgreich abgeschlossener Probe-Handler ist im Spezialaudit sichtbar. Nicht unterscheidbar sind unter anderem ausbleibender Dispatch, falscher Pfad/Methode, Freigabe-/Policyfehler oder Abbruch vor dem Audit; Access-Logs und OpenAI-Traces sind dafür nötig |
| `probe_issued`, aber Token/ID in `RUN_SINGLE` falsch | Sichtbare Weiterverarbeitung wich von der protokollierten Response ab; interne Fehlerstelle offen |
| korrekte Werte plus Zusatztext | Wertübernahme sichtbar korrekt; nur Finalformat falsch |
| `probe_issued`, danach kein Verifier-Ereignis | Kein abgeschlossener gemappter Verifier-Handler ist sichtbar. Ob kein zweiter Dispatch, ein falscher Pfad/eine falsche Methode oder ein früher Abbruch vorlag, bleibt ohne weitere Traces offen |
| `probe_verification_rejected` mit 400 | Verifier versucht, aber JSON oder Schema ungültig/unvollständig |
| `probe_verification_rejected` mit 413 | Verifier versucht, aber Body zu groß |
| `probe_verification_rejected` mit 415 | Verifier versucht, aber Medientyp nicht `application/json` |
| `probe_verified`, `proof_valid=false` | Wohlgeformtes Tupel kam an, war unter dem aktiven Prozessschlüssel aber nicht gültig signiert |
| `proof_valid=true`, finale Antwort falsch | Aufrufkette und Wertetransport bestanden; nachfolgende Auswertung oder Finalformat wich ab |
| zusätzliche/doppelte/umgeordnete Calls | Aufrufreihenfolge-/Retry-Abweichung; Wertintegrität separat bewerten |
| `RUN_RETAIN` ergibt `RETAIN_READY`, direktes `RECALL_RETAIN` ergibt `RETAIN_MISSING` | Vorheriger Action-Wert wurde im sichtbaren Folgeverhalten nicht verwendet; weder interne Löschung noch Compression oder GPT-5.6-Kausalität sind damit bewiesen |
| `RECALL_RETAIN` gibt einen falschen Wert aus | Cross-Turn-Wertintegrität wich vom protokollierten Action-Ergebnis ab; interne Fehlerstelle offen |
| `RECALL_RETAIN` löst entgegen den Instructions eine Action aus | Cross-Turn-Instruktions-/Toolwahlabweichung; getrennt von Wertverfügbarkeit klassifizieren |
| Minimaltests bestehen, SkillPilot Coach scheitert | Nichtminimalen Faktor wie Auth, Schema-/Responsegröße, Instructions oder Session-Flow separat untersuchen |

Keine Klasse allein beweist eine GPT-5.6-Ursache. Dafür sind Modusvergleich, sichtbare Routinghinweise und OpenAIs interne Traces nötig.

## 11. Beweise sichern

- exakte öffentlich ausgelieferte und importierte OpenAPI-Datei samt SHA-256
- exakte Instructions samt SHA-256
- GPT-Konfiguration, geparste Operationen, Approval-Status und Aktualisierungszeit
- Conversation-URL/ID und Bildschirmaufnahme des kleinsten Fehlers
- Spring-Audit für denselben engen UTC-Zeitraum samt `application_id`, Prozessstart und `hmac_key_id`; Deployment-Commit separat
- Control-Evidence inklusive Manifest
- Run-Matrix mit anhand von `request_sequence`/`request_started_at` korrelierten Events und getrennten Bewertungen
- Quellcommit oder unveränderliches Quellarchiv samt Hash
- Browser-Konsole und sanitisiertes HAR
- separat dokumentierte Produktionsauswirkung des ursprünglichen SkillPilot Coach

Audit aus dem normalen Dienst sichern:

```bash
journalctl \
  --unit skillpilot \
  --since "<UTC start>" \
  --until "<UTC end>" \
  --output cat | \
grep '"service":"skillpilot-action-regression"' \
  > "tmp/custom-gpt-action-regression/<run-id>/spring-audit.log"
```

Ein HAR zeigt den serverseitigen Action-Aufruf nicht zwingend, bindet aber UI, Conversation und Zeiten. Vor Weitergabe Cookies, Tokens und personenbezogene Daten entfernen. Das gefilterte Spezialaudit enthält synthetische Responses und validierte Probe-Werte. Abgelehnte beliebige Request-Bodies werden bis 8192 Byte über vollständige Größe und Hash erfasst; darüber werden nur der 8192-Byte-Capture-Hash, mindestens 8193 beobachtete Bytes und der Truncation-Marker samt Fehlerklasse protokolliert. Trotzdem jeden Export vor dem Ticket prüfen.
