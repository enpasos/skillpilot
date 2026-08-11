# OpenAI-MCP: Bindung an den zugelassenen Client

**Stand:** 31. Juli 2026
**Status:** verbindliche Sicherheitsarchitektur für den mehrsprachigen
OpenAI-V1-MCP-Coach

Diese Sicherheitsbindung gilt für den öffentlichen MCP-Endpunkt und die damit
identische OAuth-Resource/Audience
`https://mcp-coach-v1.skillpilot.com/mcp`. Die Identität und der Lifecycle der
Linie werden im
[Versionierungs- und Lebenszyklusplan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
festgelegt.

## 1. Schutzziel

Die SkillPilot-ID bleibt das vom Lernenden verwahrte Geheimnis, an dem sein
Lernstand hängt. Dieses Dokument behandelt ein davon unabhängiges Schutzziel:

> Ein fremder Client darf die lernendenbezogenen OpenAI-V1-MCP-APIs nicht
> nutzen, auch wenn er den öffentlichen Serververtrag und eine
> `learningSessionId` kennt.

Die Schutzgrenze verändert weder SkillPilot-ID noch Lernziel-, Mastery-,
Curriculum- oder Coach-Semantik.

## 2. Drei unabhängige Nachweise

| Nachweis | Zweck | Verbindlicher Mechanismus |
| --- | --- | --- |
| SkillPilot-Server | Vertraulichkeit und Serverauthentisierung | normales HTTPS/TLS am Reverse Proxy |
| zugelassene MCP-App | nur die vom Autor konfigurierte App erhält verwendbare OAuth-Tokens | fester vorregistrierter vertraulicher OAuth-Client, exakte Callback-Allowlist, `client_secret_basic`, Authorization Code mit PKCE `S256` |
| aktuelle Lernsession | der konkrete Chat adressiert genau den beim UI-Start gewählten Lernenden | bei jedem **Lernen starten** frisch erzeugte, exakt 24 Stunden gültige `learningSessionId` als Pflichtargument jedes fachlichen MCP-Tools |

Für jeden fachlichen Aufruf gilt:

```text
gültiges, client- und resource-gebundenes OAuth Access Token
AND
gültige explizite learningSessionId
```

OAuth authentisiert und autorisiert die App. Die Lernsession wählt den
Lernenden. Keiner der beiden Nachweise ersetzt den anderen.

## 3. Verbindliches OAuth-Clientprofil

Produktiv existiert genau ein vorkonfigurierter vertraulicher OAuth-Client für
die Linie **SkillPilot Coach v1**:

- feste, vom App-Autor gewählte `client_id`;
- langes kryptografisch zufälliges `client_secret`;
- genau die in der ChatGPT-Appverwaltung angezeigte Callback-URL;
- Token-Endpunkt-Authentisierung ausschließlich mit `client_secret_basic`;
- Authorization Code mit PKCE ausschließlich `S256`;
- exakte Resource/Audience `https://mcp-coach-v1.skillpilot.com/mcp`;
- getrennte Read- und Write-Scopes;
- kurze Access-Token-Laufzeit, Refresh-Token-Rotation und Widerruf.

Das Client-Secret liegt nur an zwei geschützten Stellen:

1. in der vertraulichen OAuth-Konfiguration der ChatGPT-App;
2. in der geschützten SkillPilot-Serverkonfiguration.

Es gehört niemals in Repository, Browsercode, Startprompt, Chat,
MCP-Toolargumente, Antworten oder Logs.

Offene Dynamic Client Registration, `token_endpoint_auth_method=none`, ein
frei wählbarer Client und ein stiller Fallback auf CIMD oder
`private_key_jwt` sind nicht Teil des aktiven Produktionsprofils.

## 4. OAuth-Ablauf und Prüfungen

Der Authorization Server akzeptiert einen Code-Flow nur, wenn:

1. die `client_id` exakt dem vorkonfigurierten Client entspricht;
2. die `redirect_uri` bytegenau in der Allowlist steht;
3. PKCE `S256` verwendet wird;
4. `resource` exakt die V1-MCP-Resource adressiert;
5. nur erlaubte Scopes angefordert werden.

Beim Token Request muss der Client zusätzlich den Besitz des Secrets über
HTTP Basic nachweisen. Der Resource Server prüft bei jedem MCP-Aufruf:

- Signatur beziehungsweise aktive Introspektion;
- Aussteller, Ablauf und Widerruf;
- exakte Audience/Resource;
- exakte Client-ID;
- erforderlichen Read- oder Write-Scope;
- zusätzlich die explizite gültige `learningSessionId`.

Ein gültiges OAuth-Token darf keinen Lernenden auswählen und keine
Lernsession erzeugen. Ein OAuth-Subject ist keine Identitätsquelle für den
fachlichen Toolaufruf und niemals ein Fallback.

## 5. Lernsession als getrennte Anwendungsbindung

Die verbindliche Sessionsemantik steht in
[OpenAI-MCP-App: OAuth- und Lernsession-Bindung](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md).

Kurzfassung:

- genau beim Klick auf **Lernen starten** entsteht eine neue zufällige ID;
- jeder Klick erzeugt eine andere ID, auch für denselben Lernenden;
- die absolute Laufzeit beträgt exakt 24 Stunden und wird nicht
  verlängert;
- neue fachliche Operationen benötigen mindestens `PT1H` Restlaufzeit; exakt
  `PT1H` ist gültig;
- ein bereits committeter Write darf innerhalb der letzten Stunde nur mit
  gleichem Toolnamen, kanonisch identischen Argumenten und derselben
  `clientRequestId`, bei noch nicht abgelaufener Session und verfügbarer
  gepinnter Workflow-/Curriculumversion sein gespeichertes Resultat replayen
  und mutiert nicht erneut;
- SkillPilot speichert nur den HMAC-Hash und die serverinterne
  Lernendenzuordnung;
- der Startprompt trägt die ID sichtbar in den neuen Chat;
- jedes fachliche MCP-Tool verlangt dieselbe ID;
- fehlende, unbekannte oder abgelaufene IDs werden ohne Fallback abgelehnt.

`SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` und
`SESSION_VERSION_UNAVAILABLE` sind keine OAuth-Fehler. Der normale
Wiederherstellungsweg gibt `instruction` unverändert aus oder wählt den exakten
lokalisierten Eintrag aus `instructions`; die exakte `startUrl` wird nur
ergänzt, wenn sie nicht schon enthalten ist. Es folgt keine Fachantwort, kein Retry mit der
alten Session und keine neue OAuth-Verbindung. Der Lernende konfiguriert den
Kontext im First-Party-WebGUI, wählt **Lernen starten** und setzt die neue
Session im dadurch geöffneten neuen Chat fort.

Die dauerhafte SkillPilot-ID bleibt serverseitig.

## 6. Transporthärtung außerhalb von 1.0.0

Die Linie `1.0.0` verwendet normales serverauthentisiertes HTTPS und OAuth.
mTLS ist weder Bestandteil ihres Vertrags noch ein Deployment- oder
Release-Gate. Der dedizierte MCP-Hostname trennt Domainverifikation und
Plugin-Lifecycle; er ist kein mTLS-Mechanismus. Eine spätere zusätzliche
Transporthärtung benötigt ein eigenes Design und darf die app-spezifische
OAuth-Clientbindung nicht ersetzen oder auf andere Pfade ausgeweitet werden.

## 7. Fail-closed Secure Mode

Bei aktiviertem OpenAI-V1-Provider muss der Start fehlschlagen, wenn einer
dieser Punkte fehlt oder widersprüchlich ist:

- eigenständiges hochentropisches HMAC-Signing-Secret mit mindestens 32
  Nicht-Leerzeichen; bekannte Platzhalter und strukturell schwache Werte sind
  unzulässig und werden nie protokolliert;
- nichtleere feste Client-ID;
- ausreichend langes Client-Secret;
- `client_secret_basic` als einziges Clientauthentisierungsverfahren;
- exakte HTTPS-Callback-Allowlist;
- PKCE `S256`;
- exakte HTTPS-Resource und OAuth-Endpunkte;
- veröffentlichte und intern identische Resource, Scopes und Clientmethode;
- keine offene DCR und kein stiller Wechsel auf `none`, CIMD oder
  `private_key_jwt`.

Port 8787 darf nicht öffentlich erreichbar sein. Der Reverse Proxy terminiert
TLS und leitet nur die vorgesehenen Pfade weiter.

## 8. Secret-Lebenszyklus

Das produktive Client-Secret wird außerhalb des Repositories erzeugt und als
geschütztes Betriebsgeheimnis behandelt:

- mindestens 32 zufällige Bytes, vorzugsweise 48 Byte oder mehr;
- identischer Wert in ChatGPT-Appverwaltung und SkillPilot-Serverumgebung;
- kein Echo in Statusendpunkten, Fehlern oder Deploymentausgaben;
- Rotation durch kontrollierten Clientwechsel und erneute Verbindung;
- bei Verdacht auf Verlust: sofort ersetzen, bestehende Token widerrufen und
  betroffene App-Verbindungen neu autorisieren.

Das davon getrennte `SKILLPILOT_SIGNING_SECRET` schützt die HMAC-Auflösung der
Lernsession-IDs. Es wird ebenfalls außerhalb des Repositories zufällig erzeugt,
umfasst mindestens 32 Nicht-Leerzeichen und darf weder fehlen noch auf einen
Defaultwert zurückfallen. Eine Rotation dieses Secrets macht bestehende
Lernsessions unauflösbar; sie wird deshalb als geplanter Session-Cutover
durchgeführt, ohne den Secretwert in Logs, Health-Daten oder Fehlertexte
aufzunehmen.

Ein Clientwechsel darf Lernsessions nicht als Identitätsersatz erhalten oder
reaktivieren. Noch offene Chats benötigen nach Secret-/Clientrotation einen
gültigen OAuth-Neuaufbau; ihre unabhängige Session bleibt bis zu ihrem
absoluten Ablauf lediglich fachlicher Kontext.

## 9. Abnahme- und Negativtests

Vor Freigabe müssen mindestens folgende Fälle objektiv scheitern:

- Token Request ohne Clientauthentisierung;
- Token Request mit falschem Secret oder fremder Client-ID;
- `client_secret_post`, `none`, DCR oder nicht konfiguriertes
  Authentisierungsverfahren;
- falsche Callback-URL oder fehlender/falscher PKCE-Nachweis;
- fehlende oder falsche Resource/Audience;
- fehlender Scope;
- revoziertes oder abgelaufenes Token;
- gültiges OAuth-Token ohne `learningSessionId`;
- gültige Lernsession ohne OAuth;
- unbekannte, manipulierte, widerrufene oder abgelaufene Lernsession;
- direkte Umgehung des Reverse Proxys zu Port 8787.

Positiv wird der vollständige Ablauf über genau die konfigurierte
Produktions-App geprüft. Dabei muss jeder fachliche Aufruf sowohl das
passende OAuth-Token als auch die beim UI-Start erzeugte Lernsession tragen.

## 10. Restannahmen

Die Architektur schützt nicht gegen:

- Kompromittierung des SkillPilot-Hosts, Reverse Proxys oder der geschützten
  ChatGPT-Appkonfiguration;
- Verlust einer SkillPilot-ID oder einer laufenden Lernsession durch den
  Lernenden;
- Verlust des produktiven OAuth-Client-Secrets;
- absichtliche Weitergabe eines gültigen Access Tokens zusammen mit einer
  gültigen Lernsession.

Diese Risiken werden durch Secret-Rotation, kurze Tokenlaufzeiten, absolute
Sessionlaufzeit, Widerruf, minimale Scopes und redigierte Protokollierung
begrenzt.

## 11. Normative Provider-Referenzen

- [OpenAI: Client identification](https://developers.openai.com/plugins/build/auth#client-identification)
- [OpenAI: Client registration und Authentisierung](https://developers.openai.com/plugins/build/auth#client-registration)
- [OpenAI: Resource-/Audience-Bindung](https://developers.openai.com/plugins/build/auth#echo-the-resource-parameter-throughout-the-oauth-flow)
- [OpenAI: Mutual TLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)
