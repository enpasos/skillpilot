# OpenAI-MCP-App: OAuth- und Lernsession-Bindung

**Stand:** 31. Juli 2026
**Status:** verbindliche Zielarchitektur für den mehrsprachigen OpenAI-V1-MCP-Coach

Dieses Dokument ist die Quelle der Wahrheit für die Identitäts- und
Sitzungsbindung der App **SkillPilot Coach v1**. Für Pluginidentität,
Contract Major und Lebenszyklus ist ergänzend der
[Versionierungs- und Lebenszyklusplan](openai-plugin-versioning-and-lifecycle.md)
verbindlich.

## 1. Architekturentscheidung

SkillPilot verwendet zwei bewusst voneinander getrennte Berechtigungen:

1. **OAuth authentisiert und autorisiert die MCP-App.**
   Die produktive App verwendet genau einen vorregistrierten vertraulichen
   OAuth-Client. Dessen feste `client_id` und langes zufälliges
   `client_secret` werden einmalig vom App-Autor in ChatGPT und im
   SkillPilot-Authorization-Server konfiguriert. Am Token-Endpunkt weist die
   App den Besitz des Secrets mit `client_secret_basic` nach.
2. **Eine temporäre Lernsession wählt den Lernenden und die Kommunikationssprache.**
   Erst ein ausdrücklich bestätigtes **Lernen starten** in der
   First-Party-Oberfläche oder privaten Direct-Start-Komponente erzeugt eine
   neue `learningSessionId`. Normale Starts sind exakt 24 Stunden gültig. Die
   Session verweist ausschließlich im SkillPilot-Backend auf die gewählte
   SkillPilot-ID und die beim Start festgelegte `communicationLocale`.

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

1. Die SkillPilot-Webanwendung kennt die aktuell ausgewählte SkillPilot-ID, die
   gewählte `communicationLocale` und den vom Benutzer vorbereiteten Lernkontext.
2. Sie sendet genau einen Startrequest an das SkillPilot-Backend.
3. Das Backend wendet den typisierten Startkontext auf den autoritativen
   Lernendenzustand an.
4. Das Backend erzeugt genau in diesem Augenblick eine neue kryptografisch
   zufällige `learningSessionId`.
5. Das Backend speichert nur den HMAC-Hash der ID sowie die Zuordnung zur
   SkillPilot-ID, die `communicationLocale`, Startzeit und absolute Ablaufzeit.
6. Das Backend liefert eine fertige Startnachricht und die zugehörige
   ChatGPT-URL zurück.
7. Die Webanwendung öffnet ChatGPT mit dieser bereits eingetragenen
   Startnachricht.

Beispiel:

```text
Verwende SkillPilot Coach v1 und fahre fort.
learningSessionId: sps_<zufälliger opaker Wert>
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
Benutzung verlängert. Normale Sessions und alle privaten Component-Sessions
enden exakt 24 Stunden nach ihrer Startzeit; nur der nachfolgend definierte,
requestlokale First-Party-Diagnosefall darf eine einzelne Session verkürzen.

### 3.2 Erneuerung im bestehenden Chat

Ohne aktuelle Startnachricht öffnet das Modell die private Komponente genau
einmal mit `open_skillpilot_start` und dem geschlossenen Argumentpaar
`purpose=START`, `communicationLocale=de|en`. Es wählt `de` für eine deutsche
und `en` für eine englische Unterhaltung. Liefert ein
sessiongebundenes Tool `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` oder
`SESSION_VERSION_UNAVAILABLE`, wird die alte Session nicht erneut verwendet.
Das Modell öffnet dieselbe Komponente genau einmal mit
`purpose=RENEW_EXISTING` und einer erforderlichen `communicationLocale`. Dafür
kopiert es bevorzugt `recoveryCommunicationLocale` aus den Fehlerdetails,
andernfalls die autoritative Locale der letzten Session (`de` für Deutsch, `en`
für Englisch). Nur wenn keine dieser Quellen verfügbar ist, gilt wieder die
aktuelle Unterhaltungssprache. Nur in der Komponente gibt die lernende Person
ihre vorhandene SkillPilot-ID ein; sie geht direkt an den geschützten
HTTPS-Bootstrap und niemals in Chat oder MCP-Argumente. Die Komponente übergibt
die neue Startnachricht im selben Chat. Ein neuer Chat oder der
First-Party-Webstart ist nur Fallback, wenn Komponente oder sicherer
Host-Handoff nicht verfügbar sind.

### 3.3 Gegatete First-Party-Diagnoselaufzeit

Für einen kontrollierten Live-Test darf ausschließlich
`POST /api/ui/learners/{skillpilotId}/openai/v1/launch` das optionale JSON-Feld
`diagnosticSessionTtlSeconds` akzeptieren. Das ist kein alternativer
Sessionvertrag, sondern eine eng begrenzte Testeingabe mit folgenden
Invarianten:

- der Server akzeptiert sie nur bei
  `SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED=true`;
- der ganzzahlige Wert liegt zwischen `3601` und `86400` Sekunden einschließlich
  und überschreitet niemals die normale `PT24H`-Laufzeit;
- die verkürzte Laufzeit gilt nur für die unabhängige Session dieses einen
  Requests und verändert weder Konfiguration noch andere Sessiondatensätze;
- der nächste First-Party-Request ohne Feld ist automatisch wieder `PT24H`;
- der private Component-Bootstrap lehnt das Feld ab und bleibt immer `PT24H`.

`3660` Sekunden erzeugen ungefähr eine Minute Beobachtungszeit bis zum Übergang
unter den `PT1H`-Aktionshorizont. `5400` Sekunden eignen sich für einen
90-Minuten-Soak. Die globale Learning-Session-TTL wird für beide Tests nicht
verändert. Schon das Weglassen des Feldes stellt das normale `PT24H`-Verhalten
ohne Deployment wieder her; das separate Diagnose-Gate wird nach dem
kontrollierten Testfenster über den regulären Konfigurationsweg deaktiviert.

## 4. MCP-Aufruf

ChatGPT übernimmt die Lernsession-ID aus der Startnachricht unverändert in
jedes fachliche SkillPilot-Tool:

```json
{
  "learningSessionId": "sps_<zufälliger opaker Wert>",
  "...weitere fachliche Argumente": "..."
}
```

Das modellseitige Tool-Schema beschreibt dafür nur ein erforderliches
String-Feld mit der Anweisung zur unveränderten Übernahme. Regex, exakte Länge
und weitere technische Tokenregeln bleiben absichtlich serverseitig, damit sie
das LLM nicht zur Rekonstruktion eines opaken Werts verleiten.

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
5. tatsächlichen Ablauf und Widerruf;
6. Zuordnung zum autoritativen Lernendenzustand und Verfügbarkeit der gepinnten
   Contract-, Workflow- und Curriculumrevision;
7. bei einem Write den gespeicherten Replay eines bereits committeten Requests
   mit gleichem Toolnamen, kanonisch identischen Argumenten und derselben
   `clientRequestId`;
8. für jede neue Operation mindestens `PT1H` Restlaufzeit.

Erst danach wird die fachliche Operation ausgeführt. Schreibende Tools
benötigen weiterhin zusätzlich den Write-Scope.

Für den Aktionshorizont gilt `expiresAt >= now + PT1H`: Genau eine Stunde
Restlaufzeit ist gültig, weniger als eine Stunde wird vor der fachlichen
Operation mit `SESSION_RENEWAL_REQUIRED` abgewiesen. Der beschriebene Replay
eines bereits committeten Writes darf innerhalb dieser letzten Stunde nur
solange zurückgegeben werden, wie die Session selbst noch nicht abgelaufen ist
und die von ihr gepinnten Workflow- und Curriculumversionen weiter verfügbar
sind. Er liefert das gespeicherte Resultat und führt weder Operation noch
Mutation erneut aus. Nach dem absoluten Ablauf oder bei nicht mehr verfügbarer
gepinnter Version ist auch ein Replay unzulässig.

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
| `communication_locale` | autoritative Sprache für Backendnutzdaten und jede sichtbare Coachkommunikation |
| `started_at` | Zeitpunkt des Klicks auf **Lernen starten** |
| `expires_at` | absolute Ablaufzeit; normal und im privaten Component-Bootstrap `started_at + PT24H`, ausschließlich beim gegateten First-Party-Diagnoserequest `started_at + diagnosticSessionTtlSeconds` |

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
  Resource/Audience `https://mcp-coach-v1.skillpilot.com/mcp`, Scopes,
  Ablauf und Widerruf werden weiterhin geprüft.
- Offene Dynamic Client Registration und CIMD sind in diesem produktiven
  Profil weder erforderlich noch erlaubt.
- mTLS gehört nicht zum Vertrag oder Deployment von `1.0.0`. Eine spätere
  Transporthärtung benötigt eine eigene Architekturentscheidung und ersetzt
  die app-spezifische OAuth-Clientauthentisierung nicht.

Der OAuth-Principal oder ein OAuth-Subject ist kein Ersatz für die temporäre
Lernsession. OAuth dient ausschließlich der App-Autorisierung und dem
kontrollierten Verbindungsaufbau. Welcher Lernende bei einem Toolaufruf
adressiert wird, ergibt sich nur aus der expliziten `learningSessionId`.

## 8. Fehlerverhalten

| Situation | Verhalten |
| --- | --- |
| OAuth fehlt/ist ungültig | normale OAuth-Neuautorisierung; keine Lernsession wird erzeugt |
| `learningSessionId` fehlt | `SESSION_REQUIRED`; genau einmal private Komponente mit `purpose=RENEW_EXISTING` und erforderlicher `communicationLocale=de|en` |
| ID unbekannt/manipuliert | `SESSION_REQUIRED`; keine Identitätsableitung; derselbe private Erneuerungspfad |
| Session abgelaufen/widerrufen | `SESSION_REQUIRED`; frische Session im selben Chat |
| Session hat weniger als eine Stunde Restlaufzeit | `SESSION_RENEWAL_REQUIRED`; exakt eine Stunde ist noch zulässig |
| gepinnte Workflow-/Curriculumrevision fehlt | `SESSION_VERSION_UNAVAILABLE`; frische Session im selben Chat |
| Write-Scope fehlt | Operation ablehnen; keine fachliche Teilmutation |
| Startkontext kann nicht atomar angewendet werden | keine Lernsession ausgeben |
| Diagnosefeld deaktiviert, außerhalb `3601..86400`, oberhalb der normalen Laufzeit oder am privaten Bootstrap | Request ablehnen; keine Lernsession ausgeben |

Fehlerantworten und Logs dürfen weder Lernsession-ID, OAuth-Token noch
dauerhafte SkillPilot-ID ausgeben. ChatGPT soll den Benutzer nicht auffordern,
eine SkillPilot-ID oder einen Token manuell einzutippen. Der normale
Wiederherstellungsweg ist immer ein neuer ausdrücklicher Start. Normal ist der
capability-geschützte private `RENEW_EXISTING`-Direktstart im selben Chat. Nur
wenn Komponente oder sicherer Handoff nicht verfügbar sind, folgt als Fallback
ein neuer Chat oder **Lernen starten** in der First-Party-SkillPilot-Oberfläche.
OAuth allein ist keiner dieser Startwege.

## 9. Sicherheitsinvarianten

1. Die dauerhafte SkillPilot-ID bleibt serverseitig.
2. Lernsession-IDs sind zufällig, opak und nur als HMAC-Hash gespeichert.
3. Normale und private Component-Lernsessions gelten absolut exakt 24 Stunden.
   Ausschließlich der gegatete First-Party-Diagnoserequest darf eine einzelne
   Session requestlokal auf `3601..86400` Sekunden, höchstens jedoch die normale
   `PT24H`-Laufzeit, verkürzen. Ein nachfolgender Request ohne Feld ist wieder
   `PT24H`; der Component-Bootstrap lehnt das Feld ab.
4. Benutzung verlängert die Ablaufzeit nicht.
5. Jede neue fachliche Operation benötigt mindestens `PT1H` Restlaufzeit; exakt
   `PT1H` ist gültig.
6. Nur ein gespeicherter Write-Replay mit gleichem Toolnamen, kanonisch
   identischen Argumenten und derselben `clientRequestId` darf die
   Ein-Stunden-Grenze bei noch nicht abgelaufener Session und verfügbarer
   gepinnter Workflow-/Curriculumversion passieren und führt keine Operation
   erneut aus.
7. Jeder Start erzeugt eine neue, unabhängige Session.
8. OAuth allein wählt keinen Lernenden und erzeugt keine Lernsession.
9. Eine Lernsession allein autorisiert keinen MCP-Aufruf.
10. Jedes fachliche Tool verlangt dieselbe explizite `learningSessionId`.
11. Es existiert kein Lookup oder Fallback über OAuth-Subject.
12. Lernziel-, Frontier- und Mastery-Semantik bleiben unverändert.
13. Nur der vorregistrierte vertrauliche OAuth-Client erhält Tokens; der
    Token-Endpunkt akzeptiert für ihn ausschließlich `client_secret_basic`.
14. Das OAuth-Client-Secret erscheint niemals in Repository, UI, Prompt,
    Toolargumenten, Antworten oder Logs.
15. Das sessionlose `open_skillpilot_start` verlangt `communicationLocale=de|en`:
    `START` bildet die aktuelle deutsche oder englische Unterhaltung ab;
    `RENEW_EXISTING` verwendet bevorzugt `recoveryCommunicationLocale` aus dem
    Fehler, sonst die Locale der letzten Session. Die final bestätigte
    `communicationLocale` wird beim First-Party- oder capability-geschützten
    Direktstart in der Session gespeichert, bei jedem Kontextabruf geliefert
    und danach weder aus Hostlocale noch aus neutral englischen
    Pluginmetadaten neu abgeleitet.

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
13. Deutsch und Englisch verwenden denselben V1-Toolvertrag; jede Antwort folgt
    der in der jeweiligen Lernsession gespeicherten `communicationLocale`.
14. Token Requests mit fehlendem oder falschem Client-Secret, fremder
    Client-ID, falscher Callback-URL oder anderer Resource werden abgelehnt.
15. Die Authorization-Server-Metadaten veröffentlichen
    `client_secret_basic`; `none`, DCR und CIMD sind nicht Teil des aktiven
    Produktionsprofils.
16. Der gegatete First-Party-Diagnoserequest akzeptiert `3601` und `86400`,
    lehnt `3600`, `86401`, einen Wert oberhalb der normalen Laufzeit sowie ein
    gesetztes Feld bei deaktiviertem Gate ab.
17. Ein Diagnose-Start mit `3660` oder `5400` wirkt nur auf seine eigene
    Session; bereits der nächste Start ohne Feld läuft wieder `PT24H`.
18. Der private Component-Bootstrap lehnt `diagnosticSessionTtlSeconds` ab und
    erzeugt ohne das Feld weiterhin eine `PT24H`-Session.
19. Das geschlossene Schema von `open_skillpilot_start` verlangt sowohl
    `purpose` als auch `communicationLocale`; nur `de` und `en` sind zulässig.
20. Ein Write-Replay wird nach Sessionablauf oder bei nicht mehr verfügbarer
    gepinnter Workflow-/Curriculumversion abgelehnt, auch wenn Toolname,
    kanonische Argumente und `clientRequestId` dem gespeicherten Write
    entsprechen.
