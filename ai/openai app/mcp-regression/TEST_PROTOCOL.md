# UI-loser ChatGPT-MCP-Retentionstest

## 1. Ziel

Dieser Test beantwortet getrennt, ob eine ChatGPT-MCP-App das fuer Custom GPT
Actions beobachtete Cross-Turn-Problem
[direkt](https://skillpilot.com/openai/custom-gpt-action-regression) loest oder
ob sie eine robuste serverseitige Umgehung ermoeglicht.
Der zugehoerige oeffentliche Vergleichsfall ist im
[OpenAI-Community-Thread](https://community.openai.com/t/custom-gpt-does-not-reuse-an-action-response-on-the-next-user-turn-reproducible-after-gpt-5-6-rollout/1386723)
dokumentiert.

Die vier Messpfade der Primaerphase sind:

1. unmittelbares Lesen eines frischen MCP-Toolergebnisses;
2. `create -> verify` innerhalb desselben Assistant-Turns als Positivkontrolle;
3. rohe Wiederverwendung im Folgeturn ohne irgendeinen zweiten Toolaufruf;
4. `create -> naechster User-Turn -> verify` als backend-bestaetigte Bridge.

Die Vergleichszuordnung zu den bestehenden Protokollen ist absichtlich direkt:

| MCP-Test | Bestehender Vergleich |
| --- | --- |
| A Immediate | Custom GPT `RUN_SINGLE` |
| B Same-turn | Custom GPT `RUN_CHAIN` und Claude MCP Test B |
| C Raw recall | Custom GPT `RUN_RETAIN -> RECALL_RETAIN` |
| D Bridge | Custom GPT Handoff `RUN_BRIDGE -> VERIFY_BRIDGE` und Claude MCP Test C |

Alle vier Primaertests untersuchen Tooltransport beziehungsweise Modell- und
Konversationskontext ohne serverseitige Wiederherstellung. Ein argumentloser,
sessiongebundener Reload ist absichtlich nur als nicht implementierte Phase 2 in
[PHASE2_SESSION_RELOAD.md](PHASE2_SESSION_RELOAD.md) beschrieben. Er darf nicht in
die Primaerergebnisse eingehen.

OpenAI beschreibt fuer MCP "Conversation awareness": `structuredContent` fliesst
durch die Konversation und das Modell kann IDs in Folgeturns referenzieren. Die
Dokumentation sagt ausserdem, dass das Modell `structuredContent` eines
Toolergebnisses liest. Genau diese beobachtbare Produkteigenschaft pruefen Tests
3 und 4, ohne sie aus der Dokumentation als garantiert vorauszusetzen:

- [MCP: Why Apps SDK standardises on MCP](https://developers.openai.com/apps-sdk/concepts/mcp-server#why-apps-sdk-standardises-on-mcp)
- [Build your MCP server: Architecture flow](https://developers.openai.com/apps-sdk/build/mcp-server#architecture-flow)

OpenAI dokumentiert `_meta["openai/session"]` seit Januar 2026 als anonymisierte
Conversation-ID zur Korrelation von Requests innerhalb einer ChatGPT-Session:
[Apps SDK changelog](https://developers.openai.com/apps-sdk/changelog#apps-sdk-2026-01-15).
Diese Kennung ist keine Authentifizierung, keine SkillPilot-Nutzeridentitaet und
keine dokumentierte globale oder dauerhafte Conversation-ID.

Ein Pass belegt nur das beobachtete Verhalten der erfassten App-Version,
ChatGPT-Oberflaeche und Modelleinstellung. Er ist keine Garantie fuer andere
Modelle, lange Dialoge, Kontextkompaktierung oder spaetere Produktversionen und
lokalisiert keine interne OpenAI-Verarbeitungsstufe.

## 2. Harte Isolation vom Coach und von der Widget-UI

Der Regressionsserver und seine ChatGPT-App muessen vom deutschen und englischen
Coach getrennt bleiben. Die Primaertopologie ist ein eigener Prozess auf
`127.0.0.1:8791` mit genau einem Streamable-HTTP-Endpunkt `/mcp`, einem eigenen
Tunnel und einer eigenen Developer-Mode-App. Der vorhandene Coach-Prozess auf
Port 8790, sein `/mcp`-Endpunkt und sein Tunnelprofil duerfen nicht fuer diese
Messung wiederverwendet oder gleichzeitig auf das Regressionstool umgebogen
werden.

- Eigener MCP-Pfad und eigene Developer-Mode-App; keinen Coach-Endpunkt erweitern.
- Ausschliesslich die zwei Regressionstools `create_mcp_retention_probe` und
  `verify_mcp_retention_probe` veroeffentlichen.
- Keine Coach-Tools, Knowledge-Dokumente, Lernenden-, Curriculum- oder
  Accountdaten.
- Kein Widget, keine UI-Ressource, kein `openai/outputTemplate`, kein
  `ui.resourceUri`, kein `ui/message` und kein `ui/update-model-context`.
- Das synthetische Tupel `probe_id`, `token`, `proof` liegt im
  modelllesbaren `structuredContent`, nicht nur in Result-`_meta`.
- Das optionale Text-`content` enthaelt hoechstens eine generische
  Statusbeschreibung und wiederholt das Tupel nicht.
- Result-`_meta` darf das Tupel nicht als alternativen Zustandstraeger verwenden.
- Request-`_meta["openai/session"]` darf nur fuer das Spezialaudit auf Vorhandensein
  geprueft und gehasht werden. Die Primaerphase speichert oder rekonstruiert keinen
  Zustand ueber diesen Wert. Das ist ein anderer Kanal als Result-`_meta`.
- Zunaechst keine Authentifizierung. Der Server verarbeitet ausschliesslich
  bedeutungslose synthetische Werte und besitzt keinen sessiongebundenen
  Probe-Store.

Vor dem ChatGPT-Test anhand der App-Details beziehungsweise des MCP-Katalogs
sichern:

- `tools/list` enthaelt genau die zwei erwarteten Tools und ihre exakten Schemata;
- `resources/list` veroeffentlicht keine UI-Vorlage;
- keines der Tools referenziert eine UI-Ressource;
- kein drittes Reload-, State- oder Sessiontool ist sichtbar.

Wenn eine Coach-Operation oder UI-Vorlage sichtbar ist, den Test abbrechen. Das ist
keine isolierte Messkonfiguration.

## 3. Serverseitige Nachweisgrenze

`create_mcp_retention_probe` erzeugt pro Aufruf ein frisches, nicht erratbares und
serverseitig signiertes Tupel:

```json
{
  "probe_id": "<frische UUID>",
  "token": "<frischer synthetischer Wert>",
  "proof": "<Signatur>"
}
```

`verify_mcp_retention_probe` ist der stateless Verifier. Nur ein vollstaendiges,
unveraendertes und unter demselben aktiven Testschluessel signiertes Tupel darf
`ok=true`, `proof_valid=true` und dieselbe `probe_id` ergeben.

Die modelllesbaren `structuredContent`-Vertraege sind exakt:

- Create: `{probe_id, token, proof}`;
- Verify: `{ok, probe_id, proof_valid}`.

Die Toolresultate besitzen keine `_meta`-Daten. Der Server benutzt
`_meta["openai/session"]` nicht zur Wiederherstellung. Er auditiert pro Toolrequest
nur `session_present` und bei vorhandenem, gueltigem String dessen SHA-256, damit
Test D die Hostkorrelation ergaenzend belegen kann, ohne die rohe Kennung
offenzulegen.

Das Spezialaudit muss mindestens festhalten:

- UTC-Startzeit, Toolname und Eventtyp;
- `probe_id` und Ergebnisstatus;
- fuer Verify `proof_valid`;
- pro Create/Verify `session_present` und, wenn vorhanden, `session_sha256`, aber
  niemals den rohen Sessionwert;
- die Events `probe_created` und `probe_verified` in ihrer tatsaechlichen
  Reihenfolge.

Synthetische Werte sind ungefaehrlich, aber die rohe `openai/session`-Kennung
gehoert weder in Chatantworten noch in Supportanhaenge. Ein positiver Chattext ist
allein kein Nachweis; fuer die Bridge sind die korrelierten Serverereignisse
massgeblich.

## 4. Testkonfiguration erfassen

Vor jedem Block dokumentieren:

- UTC und lokale Start-/Endzeit;
- normaler leerer ChatGPT-Chat, nicht Custom GPT und nicht Builder Preview;
- ChatGPT-Oberflaeche (`Work`), Browser/App-Version und Betriebssystem;
- Account/Plan und gegebenenfalls Workspace;
- sichtbarer Modellname, Thinking-/Effort-Stufe, Auto-Switch und sichtbare
  Routing-, Quota- oder Fallback-Hinweise;
- Conversation-URL/ID;
- App-Name, MCP-URL, App-ID, Versions-ID/-name/-notiz und Verbindungszeitpunkt;
- Tool-Freigabemodus und tatsaechliche Approval-Dialoge;
- Tunnel-ID, aber niemals Tunnel-Secret oder API-Key;
- Deployment-Commit, Prozessstart, App-/Server-Build und Signaturschluessel-
  Fingerprint;
- SHA-256 des ausgelieferten Toolkatalogs und dieses Promptblatts:

```bash
sha256sum \
  "ai/openai app/mcp-regression/CHATGPT_PROMPTS.de.md" \
  "ai/openai app/mcp-regression/create-mcp-server.mjs"
```

Fuer den ersten Block dieselbe sichtbare Modell-/Moduskonfiguration verwenden, auf
der `RUN_RETAIN -> RECALL_RETAIN` im Custom-GPT-Reproducer fehlgeschlagen ist. Nur
einen internen Modellnamen notieren, wenn er aus eigener technischer Evidenz
stammt. Zeitlicher Zusammenhang mit einem Rollout ist keine Kausalitaetsaussage.

## 5. Preflight und Priming

1. Lokale automatisierte Tests und einen direkten Create-/Verify-Control gegen
   exakt denselben deployten Regressionsserver ausfuehren.
2. Der positive Control muss die unveraenderte Probe akzeptieren. Ein getrennter
   negativer Control mit genau einem veraenderten Zeichen in `proof` muss
   `proof_valid=false` liefern.
3. Toolkatalog und fehlende Ressourcen/UI-Metadaten sichern.
4. Falls ChatGPT beim ersten Toolaufruf um Erlaubnis bittet, einen gekennzeichneten
   Priming-Lauf durchfuehren. Nicht werten; danach einen frischen Chat oeffnen.
5. Waehrend eines Messpaares weder Server noch Tunnel neu starten, App-Version oder
   Modell wechseln, andere Regressionstests ausfuehren oder dieselbe App in einem
   zweiten Chat verwenden.
6. Erst nach der zweiten Nachricht Tooldetails aufklappen. Nichts daraus kopieren
   oder als Nutzernachricht wiederholen.

Schlaegt der direkte Control oder die Same-turn-Kontrolle fehl, Cross-Turn-Laeufe
nicht als Retentionsergebnis auswerten.

## 6. Exakte Testdurchfuehrung

Die vollstaendigen, kopierbaren Nachrichten stehen in
[CHATGPT_PROMPTS.de.md](CHATGPT_PROMPTS.de.md). Nicht das gesamte Promptblatt als
stehende Instruktion uebergeben. Fuer jeden Test und jede Wiederholung einen
frischen Chat verwenden und nur die Regression-App aktivieren.

### Test A: unmittelbares Lesen

In einem frischen Chat exakt `MCP_RUN_SINGLE` senden.

Pass:

- genau ein Create und kein Verify;
- finale Zeile hat exakt `MCP_SINGLE probe_id=<id> token=<token>`;
- ID und Token stimmen mit dem tatsaechlichen Create-Toolergebnis ueberein; das
  `probe_created`-Serverereignis bestaetigt dieselbe `probe_id`;
- kein Zusatztext.

Dieser Test belegt nur unmittelbaren Zugriff auf das aktuelle Toolergebnis.

### Test B: Same-turn-Positivkontrolle

In einem frischen Chat exakt `MCP_RUN_CHAIN` senden.

Pass:

- genau ein Create und danach im selben Assistant-Turn genau ein Verify;
- kein zweites Create und kein Retry;
- gleiches vollstaendiges Tupel, gleiche `probe_id`, `proof_valid=true`;
- finale Antwort exakt `MCP_CHAIN_PASS`.

Ohne diesen Pass sind negative Cross-Turn-Ergebnisse nicht aussagekraeftig.

### Test C: rohe Cross-Turn-Erinnerung

Im selben frischen Chat unmittelbar nacheinander exakt `MCP_RUN_RETAIN` und
`MCP_RECALL_RETAIN` senden.

Pass:

- erster Turn: genau ein Create und kein Verify;
- erste gewoehnliche Assistant-Antwort exakt `MCP_RETAIN_READY` und ohne
  `probe_id`, `token` oder `proof`;
- zweite Nutzernachricht enthaelt keinen Probe-Wert;
- zweiter Turn: ueberhaupt kein Toolaufruf;
- finale Antwort exakt `MCP_RETAIN token=<urspruenglicher token>`;
- ausgegebener Token stimmt mit dem Create-Toolergebnis des ersten Turns ueberein;
  das `probe_created`-Serverereignis bestaetigt die zugehoerige `probe_id`.

`MCP_RETAIN_MISSING` ohne zweiten Toolaufruf ist das dem Custom-GPT-Reproducer
entsprechende sichtbare Fehlersignal. Es belegt Nichtverwendung im Folgeturn, aber
nicht interne Loeschung, Kompaktierung oder eine bestimmte Modellursache. Jeder
Toolaufruf im zweiten Turn macht den Raw-Recall-Lauf ungueltig und wird als
Toolwahl-/Instruktionsabweichung erfasst.

### Test D: backend-bestaetigte Cross-Turn-Bridge

Im selben frischen Chat unmittelbar nacheinander exakt `MCP_RUN_RETAIN` und
`MCP_VERIFY_RETAIN` senden.

Pass:

- erster Turn: genau ein Create; finale Antwort exakt `MCP_RETAIN_READY`, ohne
  sichtbare Probe-Werte;
- zweiter Turn: genau ein Verify und kein Create;
- der Verifier erhaelt exakt das urspruengliche vollstaendige Tupel;
- korrelierte Events haben dieselbe `probe_id`; der stateless Verifier bestaetigt
  mit `proof_valid=true`, dass das vollstaendige Tupel unveraendert war;
- `proof_valid=true`, finale Antwort exakt `MCP_VERIFY_PASS`.

Kopiert ChatGPT im ersten Turn das Tupel in gewoehnlichen Assistant-Text, den Lauf
als `VISIBLE_CONTEXT_CONTROL` klassifizieren. Er belegt dann nicht die verborgene
Retention des MCP-Ergebnisses. Ein Chattext `MCP_VERIFY_PASS` ohne passendes
positives Verify-Ereignis ist eine sichtbare Falschaussage, kein Bridge-Pass.

## 7. Wiederholungen und Ergebnismatrix

Der erste manuelle A–D-Smoke-Test ist in
[`RESULTS-2026-07-22.md`](RESULTS-2026-07-22.md) festgehalten.

Zuerst A bis D einmal als Smoke-Test ausfuehren. Bei korrekter Konfiguration B bis
D jeweils mindestens fuenfmal, fuer eine Architekturentscheidung besser zehnmal
in frischen Chats wiederholen. Modi spaeter zeitlich verschachtelt vergleichen,
statt alle Laeufe einer Stufe am Stueck auszufuehren.

| Lauf | UTC | Conversation | Modell/Modus | Test | erwartete Toolfolge | tatsaechliche Toolfolge | gleiche Probe | `proof_valid` | gleiche `session_sha256` | Finaltext | Bewertung |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | | | | A Immediate | create | | | n/a | n/a | | |
| 02 | | | | B Same-turn | create, verify | | | | n/a | | |
| 03 | | | | C Raw recall | create; dann kein Tool | | | n/a | n/a | | |
| 04 | | | | D Bridge | create; dann verify | | | | | | |

Aufrufreihenfolge, Wertintegritaet, Sessionkorrelation und sichtbares Finalformat
immer getrennt bewerten. Ein zusaetzlicher, wiederholter oder umgeordneter Aufruf
ist eine eigene Abweichung und darf nicht durch einen spaeteren positiven Wert
verdeckt werden.

## 8. Fehlerklassifikation

| Beobachtung | Belastbare Klassifikation |
| --- | --- |
| Direkter Control oder Test B scheitert | Setup, Toolvertrag oder grundlegendes MCP-Handoff zuerst korrigieren; noch keine Cross-Turn-Aussage |
| Test C passt ohne zweiten Toolaufruf | Rohe MCP-Result-Retention im getesteten kurzen Chat beobachtet |
| Test C gibt `MCP_RETAIN_MISSING` aus und ruft kein Tool | Vorheriger Wert wurde im sichtbaren Folgeverhalten nicht verwendet; interne Ursache offen |
| Test C ruft im zweiten Turn ein Tool | Raw-Recall nicht gemessen; Toolwahl-/Instruktionsabweichung |
| Test D hat positives korreliertes Verify-Audit | Backend-bestaetigte MCP-Result-Bridge ueber genau eine User-Turn-Grenze bestanden |
| Test D sagt Pass, aber Verify fehlt oder `proof_valid=false` | Sichtbare Falschaussage; Bridge nicht bestanden |
| Test D erzeugt eine neue Probe | Unzulaessige Neuanlage/Retry; Bridge nicht bestanden |
| Test D endet mit `MCP_VERIFY_MISSING` | Das Tupel stand fuer den Verifier nicht vollstaendig zur Verfuegung oder die Anweisung wurde nicht entsprechend ausgefuehrt; interne Ursache offen |
| Test D endet mit `MCP_VERIFY_FAIL` | Verifier-Ergebnis oder Probe-ID war negativ; Serveraudit entscheidet ueber die genaue Wertintegritaet |
| Test D endet mit `MCP_VERIFY_ERROR` | Tool-/Transportfehler; kein Retention-Pass oder -Fail, bis die technische Ursache getrennt ist |
| Test D besteht, aber die beiden vorhandenen `session_sha256` unterscheiden sich | Wertbridge bestanden; die Annahme einer stabilen ChatGPT-Sessionkorrelation ist fuer diesen Lauf nicht belegt |
| `session_present=false` bei einem Toolrequest | Retention-/Bridge-Auswertung bleibt moeglich; die zusaetzliche Host-Sessionkorrelation ist nicht verfuegbar |
| Werte stehen im ersten gewoehnlichen Assistant-Text | Sichtbarer Relay-Control; Hidden-Retention-Test kontaminiert |
| Werte wurden vom Nutzer kopiert | User-Echo-Control; kein Result-Retention-Nachweis |
| Backend-/Tunnel-Neustart oder App-/Modellwechsel zwischen zwei Nachrichten | Infrastrukturlauf ungueltig und zu wiederholen |
| Approval oder Policy-Refusal verhindert einen verlangten Call | Messung nicht durchgefuehrt; weder Pass noch Retention-Fail |

## 9. Architekturaussage

| Gesamtbild | Folgerung fuer SkillPilot |
| --- | --- |
| C und D stabil bestanden | Die MCP-App umgeht den beobachteten Custom-GPT-Action-Fehler im minimalen unmittelbaren Folgeturn direkt. Danach folgen Langdialog-/Kompaktierungstests. |
| C scheitert, D besteht | Werte sind fuer einen Folgeturn-Toolaufruf nutzbar, aber nicht verlaesslich fuer toolfreien Recall. Coach-Workflows duerfen sich nicht auf freie Wiedergabe verlassen. |
| C und D scheitern | Die Primaer-App zeigt dieselbe fuer SkillPilot relevante Cross-Turn-Grenze. Erst dann Phase 2 als getrennten serverseitigen Rehydrationstest implementieren. |
| B scheitert oder C/D sind inkonsistent | Die getestete ChatGPT-App ist noch keine belastbare Coach-Grundlage. |

Das blosse Vorhandensein einer stabilen `session_sha256` beweist noch keinen
Rehydrationspfad. Dieser wird in der Primaer-App weder implementiert noch getestet.
Das Phase-2-Design und seine spaeteren Bestehenskriterien stehen getrennt in
[PHASE2_SESSION_RELOAD.md](PHASE2_SESSION_RELOAD.md).

## 10. Evidenz sichern

Pro Messblock sichern:

- unveraenderlichen Quellcommit und Deployment-/App-Version;
- Toolkatalog und leeres UI-/Ressourceninventar samt Hash;
- Promptblatt samt Hash;
- App-Detailseite mit MCP-URL, App-/Versions-ID und Approval-Konfiguration;
- Conversation-URL/ID, exakte Nutzertexte, sichtbare Antworten und vollstaendige
  Toolfolge;
- Bildschirmaufnahme des kleinsten Zwei-Turn-Laufs;
- enges serverseitiges Spezialaudit mit Eventfolge, `backend_request_id`,
  Probe-ID, `proof_valid`, `session_present` und gegebenenfalls
  `session_sha256`; keine rohe Session-ID und keine Token-/Proof-Werte;
- Browserkonsole und sanitisiertes HAR nur ergaenzend.

HAR, Browserprofile, App-Details und Logs koennen Cookies, Autorisierung oder
personenbeziehbare Kennungen enthalten. Vor Weitergabe konsequent redigieren.
Rohe API-Keys, Tunnel-Secrets, OAuth-Codes/-Tokens, Cookies, die permanente
SkillPilot-ID und den rohen `openai/session`-Wert niemals anhaengen.
