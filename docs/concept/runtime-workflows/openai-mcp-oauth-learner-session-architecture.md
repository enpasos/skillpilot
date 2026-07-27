# OpenAI-MCP-App: OAuth- und Lernsession-Bindung

**Stand:** 26. Juli 2026
**Status:** verbindliche Zielarchitektur für den deutschen OpenAI-MCP-Coach

Dieses Dokument ist die Quelle der Wahrheit für die Identitäts- und
Sitzungsbindung der App **SkillPilot Coach (Deutsch)**.

## 1. Architekturentscheidung

SkillPilot verwendet zwei bewusst voneinander getrennte Berechtigungen:

1. **OAuth authentisiert und autorisiert die MCP-App.**
   Die produktive App verwendet genau einen vorregistrierten vertraulichen
   OAuth-Client. Dessen feste `client_id` und langes zufälliges
   `client_secret` werden einmalig vom App-Autor in ChatGPT und im
   SkillPilot-Authorization-Server konfiguriert. Am Token-Endpunkt weist die
   App den Besitz des Secrets mit `client_secret_basic` nach.
2. **Eine temporäre Lernsession wählt den Lernenden.**
   Erst ein ausdrücklicher Klick auf **Lernen starten** in SkillPilot erzeugt
   eine neue, exakt 24 Stunden gültige `learningSessionId`. Sie verweist
   ausschließlich im SkillPilot-Backend auf die gewählte SkillPilot-ID.

Beide Nachweise sind für einen fachlichen MCP-Aufruf erforderlich:

```text
gültiges OAuth Access Token
AND
gültige learningSessionId
```

OAuth allein darf weder eine Lernsession erzeugen noch einen Lernenden
auswählen. Eine Lernsession allein darf keinen MCP-Aufruf autorisieren.

## 2. Die beiden Bindungen

| Bindung | Transport | Serverseitige Bedeutung |
| --- | --- | --- |
| ChatGPT/App -> SkillPilot | `client_id` + `client_secret_basic` im OAuth-Code-Flow; danach Access Token im HTTP-Header | Genau der vorregistrierte vertrauliche Client darf ein für die SkillPilot-MCP-Resource bestimmtes Token erhalten und verwenden. |
| Chat -> Lernsession -> Lernender | `learningSessionId` als Pflichtargument jedes fachlichen MCP-Tools | Diese noch gültige, in SkillPilot gestartete Session gehört zu genau einer SkillPilot-ID. |

Die dauerhafte SkillPilot-ID bleibt ausschließlich im SkillPilot-Backend. Sie
wird weder in den Chat noch in MCP-Toolargumente übernommen.

## 3. Verbindlicher Startablauf

Jeder Klick auf **Lernen starten** ist eine eigene atomare Startoperation:

1. Die SkillPilot-Webanwendung kennt die aktuell ausgewählte SkillPilot-ID und
   den vom Benutzer vorbereiteten Lernkontext.
2. Sie sendet genau einen Startrequest an das SkillPilot-Backend.
3. Das Backend wendet den typisierten Startkontext auf den autoritativen
   Lernendenzustand an.
4. Das Backend erzeugt genau in diesem Augenblick eine neue kryptografisch
   zufällige `learningSessionId`.
5. Das Backend speichert nur den HMAC-Hash der ID sowie die Zuordnung zur
   SkillPilot-ID, Startzeit und absoluten Ablaufzeit.
6. Das Backend liefert eine fertige Startnachricht und die zugehörige
   ChatGPT-URL zurück.
7. Die Webanwendung öffnet ChatGPT mit dieser bereits eingetragenen
   Startnachricht.

Beispiel:

```text
Verwende die App SkillPilot Coach (Deutsch) und fahre mit dem in
SkillPilot vorbereiteten nächsten Schritt fort.

SkillPilot-Lernsession: sps_<zufälliger opaker Wert>
```

Die Lernsession-ID ist damit für ChatGPT sichtbar, aber nicht die dauerhafte
SkillPilot-ID. Der Benutzer muss nichts kopieren oder technisch konfigurieren.

### 3.1 Jeder Start ist neu

Jeder Startrequest erzeugt eine andere Lernsession-ID:

- auch wenn derselbe Lernende direkt erneut startet;
- auch wenn eine ältere Session noch gültig ist;
- unabhängig davon, ob ein anderer Lernender dasselbe ChatGPT-Konto nutzt;
- unabhängig davon, ob bereits eine OAuth-Verbindung besteht.

Mehrere Sessions dürfen parallel gültig sein. Ihre Gültigkeit wird nicht durch
Benutzung verlängert und endet exakt 24 Stunden nach ihrer Startzeit.

## 4. MCP-Aufruf

ChatGPT übernimmt die Lernsession-ID aus der Startnachricht unverändert in
jedes fachliche SkillPilot-Tool:

```json
{
  "learningSessionId": "sps_<zufälliger opaker Wert>",
  "...weitere fachliche Argumente": "..."
}
```

Parallel sendet die Connector-Infrastruktur das OAuth Access Token außerhalb
des Modellkontexts:

```http
Authorization: Bearer <oauth-access-token>
```

Das Backend prüft bei jedem Toolaufruf in dieser Reihenfolge:

1. gültiges OAuth Access Token;
2. erwartete Resource/Audience und erforderlicher Read- oder Write-Scope;
3. vorhandene, syntaktisch gültige `learningSessionId`;
4. HMAC-basierte Auflösung der Lernsession;
5. Ablauf und Widerruf;
6. Zuordnung zum autoritativen Lernendenzustand.

Erst danach wird die fachliche Operation ausgeführt. Schreibende Tools
benötigen weiterhin zusätzlich den Write-Scope.

Die `learningSessionId` ist Pflichtargument **aller** fachlichen
SkillPilot-MCP-Tools. Es gibt keine Ausnahme für den ersten Leseaufruf.

## 5. Was ausdrücklich nicht zulässig ist

Das Backend darf eine fehlende oder ungültige Lernsession niemals ersetzen
durch:

- den Lernenden, der früher mit dem OAuth-Subject verbunden war;
- die zuletzt erzeugte oder „aktuelle“ Session;
- irgendeine andere Session desselben Lernenden;
- einen Pending Launch;
- eine im Chat eingegebene dauerhafte SkillPilot-ID;
- eine beim OAuth-Callback implizit erzeugte Session.

OAuth-Callbacks, Token-Erneuerungen und erneute MCP-Verbindungen dürfen keine
Lernsession erzeugen, ersetzen, verlängern oder reaktivieren.

Damit ist auch ein gemeinsames ChatGPT-Konto unproblematisch: Welcher
SkillPilot-Lernende fachlich adressiert wird, bestimmt ausschließlich die bei
diesem konkreten Start erzeugte `learningSessionId`.

## 6. Datenmodell

Die Tabelle `openai_de_learning_session` ist die kanonische
Persistenzgrenze für diese kurzlebige Zuordnung:

| Feld | Bedeutung |
| --- | --- |
| `token_hash` | HMAC-Hash der ausgegebenen `learningSessionId`; der Klartext wird nicht gespeichert |
| `learner_id` | serverinterne Fremdschlüsselzuordnung zum Lernenden |
| `started_at` | Zeitpunkt des Klicks auf **Lernen starten** |
| `expires_at` | absolute Ablaufzeit `started_at + 24h` |

Die frühere Belegung derselben Tabelle mit dem OAuth-Subject als
Primärschlüssel wird bei der Migration verworfen. Ein OAuth-Subject darf bei
MCP-Aufrufen weder gelesen noch als Lernenden- oder Session-Fallback verwendet
werden.

## 7. OAuth-Bindung

OAuth Authorization Code mit PKCE bleibt von der Lernsession getrennt:

- Der App-Autor registriert genau eine feste produktive `client_id`, genau die
  in ChatGPT angezeigte Callback-URL und ein langes zufälliges
  `client_secret`.
- ChatGPT verwendet die konfigurierte `client_id` und authentisiert den
  vertraulichen Client am Token-Endpunkt mit `client_secret_basic`.
- Das Secret liegt ausschließlich in der geschützten ChatGPT-App-Konfiguration
  und in der SkillPilot-Serverkonfiguration. Es gehört weder ins Repository
  noch in Browsercode, Prompts, Toolargumente, Antworten oder Logs.
- PKCE `S256`, die exakte Callback-Allowlist, die exakte
  Resource/Audience `https://skillpilot.com/api/openai/de/mcp`, Scopes,
  Ablauf und Widerruf werden weiterhin geprüft.
- Offene Dynamic Client Registration und CIMD sind in diesem produktiven
  Profil weder erforderlich noch erlaubt.
- Optionales mTLS kann später ausschließlich den MCP-Rand zusätzlich härten.
  Es ersetzt die app-spezifische OAuth-Clientauthentisierung nicht.

Der OAuth-Principal oder ein OAuth-Subject ist kein Ersatz für die temporäre
Lernsession. OAuth dient ausschließlich der App-Autorisierung und dem
kontrollierten Verbindungsaufbau. Welcher Lernende bei einem Toolaufruf
adressiert wird, ergibt sich nur aus der expliziten `learningSessionId`.

## 8. Fehlerverhalten

| Situation | Verhalten |
| --- | --- |
| OAuth fehlt/ist ungültig | normale OAuth-Neuautorisierung; keine Lernsession wird erzeugt |
| `learningSessionId` fehlt | `SESSION_REQUIRED`; zurück zu **Lernen starten** |
| ID unbekannt/manipuliert | `SESSION_REQUIRED`; kein Fallback |
| Session abgelaufen/widerrufen | `SESSION_REQUIRED`; neuer Start in SkillPilot |
| Write-Scope fehlt | Operation ablehnen; keine fachliche Teilmutation |
| Startkontext kann nicht atomar angewendet werden | keine Lernsession ausgeben |

Fehlerantworten und Logs dürfen weder Lernsession-ID, OAuth-Token noch
dauerhafte SkillPilot-ID ausgeben. ChatGPT soll den Benutzer nicht auffordern,
eine SkillPilot-ID oder einen Token manuell einzutippen. Der normale
Wiederherstellungsweg ist immer **Lernen starten** in SkillPilot.

## 9. Sicherheitsinvarianten

1. Die dauerhafte SkillPilot-ID bleibt serverseitig.
2. Lernsession-IDs sind zufällig, opak und nur als HMAC-Hash gespeichert.
3. Eine Lernsession gilt absolut exakt 24 Stunden.
4. Benutzung verlängert die Ablaufzeit nicht.
5. Jeder Start erzeugt eine neue, unabhängige Session.
6. OAuth allein wählt keinen Lernenden und erzeugt keine Lernsession.
7. Eine Lernsession allein autorisiert keinen MCP-Aufruf.
8. Jedes fachliche Tool verlangt dieselbe explizite `learningSessionId`.
9. Es existiert kein Lookup oder Fallback über OAuth-Subject.
10. Lernziel-, Frontier- und Mastery-Semantik bleiben unverändert.
11. Nur der vorregistrierte vertrauliche OAuth-Client erhält Tokens; der
    Token-Endpunkt akzeptiert für ihn ausschließlich `client_secret_basic`.
12. Das OAuth-Client-Secret erscheint niemals in Repository, UI, Prompt,
    Toolargumenten, Antworten oder Logs.

## 10. Abnahmekriterien

Die Implementierung ist erst vollständig, wenn automatisierte Tests mindestens
Folgendes beweisen:

1. Ein UI-Klick führt zu genau einem Startrequest und einer ChatGPT-Navigation.
2. Jeder Start erzeugt eine neue Session-ID, auch für denselben Lernenden.
3. Starts verschiedener Lernender können parallel über dieselbe OAuth-Verbindung
   verwendet werden.
4. Die fertige Startnachricht enthält genau eine Lernsession-ID und keine
   SkillPilot-ID.
5. Alle fachlichen MCP-Toolschemas verlangen `learningSessionId`.
6. Ein gültiges OAuth-Token ohne Lernsession wird abgelehnt.
7. Eine gültige Lernsession ohne OAuth wird abgelehnt.
8. Eine unbekannte, manipulierte, widerrufene oder abgelaufene Session wird
   ohne Fallback abgelehnt.
9. Ein erfolgreicher Toolaufruf löst den Lernenden ausschließlich aus der
   expliziten Lernsession auf.
10. Wiederholte Nutzung verschiebt `expires_at` nicht.
11. Fachliche Read-/Write-Scope-Prüfungen bleiben erhalten.
12. Bestehende Lernziel-, Frontier- und Mastery-Tests bleiben unverändert grün.
13. Token Requests mit fehlendem oder falschem Client-Secret, fremder
    Client-ID, falscher Callback-URL oder anderer Resource werden abgelehnt.
14. Die Authorization-Server-Metadaten veröffentlichen
    `client_secret_basic`; `none`, DCR und CIMD sind nicht Teil des aktiven
    Produktionsprofils.
