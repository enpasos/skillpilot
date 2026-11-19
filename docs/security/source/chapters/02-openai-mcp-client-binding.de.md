## OpenAI-MCP: Bindung an den zugelassenen Client {#sec:sec-openai-mcp-client-binding}

:::note{title="Verbindliche Sicherheitsarchitektur für den OpenAI-MCP-Coach"}
Ursprungsstand: 31. Juli 2026 · Aktualisiert auf die dauerhafte neutrale Plugin-Entscheidung vom 19. Oktober 2026 (`skillpilot-coach` auf `https://mcp-openai.skillpilot.com/mcp`, die den früheren Endpunkt `https://mcp-coach-v1.skillpilot.com/mcp` vor der Verzeichnis-Einreichung ablöst; OAuth-Issuer bleibt `https://skillpilot.com/api/openai/v1`). Identität, Cutover und Lebenszyklus sind im [Versionierungs- und Lebenszyklusplan](repo:docs/concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md) sowie im [Stable-Origin-Runbook](repo:docs/deploy/openai-stable-origin.md) festgelegt.
:::

### Schutzziel {#sec:sec-mcp-protection-goal}

Die SkillPilot-ID bleibt das von der lernenden Person verwahrte Geheimnis, an dem ihr Lernstand hängt. Dieses Kapitel behandelt ein davon unabhängiges Schutzziel:

> Ein fremder Client darf die lernendenbezogenen OpenAI-V1-MCP-APIs nicht nutzen, auch wenn er den öffentlichen Serververtrag und eine gültige `learningSessionId` kennt.

Diese Schutzgrenze verändert weder SkillPilot-ID noch Lernziel-, Mastery-, Curriculum- oder Coach-Semantik.

### Vier unabhängige Nachweise {#sec:sec-mcp-four-proofs}

:::table{cols="3.4cm,4.6cm,X"}
| Nachweis | Zweck | Verbindlicher Mechanismus |
| --- | --- | --- |
| **SkillPilot-Server** | Vertraulichkeit und Serverauthentisierung | Reguläres HTTPS/TLS am dedizierten Reverse Proxy. |
| **OpenAI-Connector** | Nur gehostete ChatGPT-Verbindungen aus OpenAIs Zertifikatskette passieren den produktiven Edge-Pfad | mTLS mit OpenAI Root CA, Connectors-Intermediate, `clientAuth`-EKU und exaktem SAN `mtls.prod.connectors.openai.com`. |
| **Zugelassene MCP-App** | Nur der explizit zugelassene Client erhält verwendbare OAuth-Tokens | Exakt gepinntes hosted CIMD mit `private_key_jwt`; ausdrücklich konfigurierter Basic-Übergangsclient und öffentliches Desktop-CIMD mit PKCE `S256` sind getrennte Profile ohne Methoden-Fallback. |
| **Aktuelle Lernsession** | Der konkrete Chat adressiert genau den beim UI-Start gewählten Lernenden | Bei jedem **Lernen starten** frisch erzeugte, exakt 24 Stunden gültige `learningSessionId` als Pflichtargument jedes fachlichen MCP-Tools. |
:::

Für jeden fachlichen Aufruf gilt kumulativ:

```text
gueltiges, client- und resource-gebundenes OAuth Access Token
AND
gueltige explizite learningSessionId
AND (im produktiven gehosteten enforce-Modus)
gueltiges OpenAI-Connector-Clientzertifikat
```

OAuth authentisiert und autorisiert die App; die Lernsession wählt den Lernenden. Keiner der Nachweise ersetzt den anderen.

### Verbindliches OAuth-Clientprofil {#sec:sec-mcp-oauth-profile}

Für den gehosteten ChatGPT-Verzeichnispfad (**SkillPilot Coach**, technischer Name `skillpilot-coach`) gilt die profilbezogene Entscheidung vom 11. September 2026, zusammen mit dem neutralen Endpunkt vom 19. Oktober. Das [OAuth-Profilrunbook](repo:docs/deploy/oauth-client-authentication.md) unterscheidet:

- `chatgpt-cimd-jwt`: exakt zugelassene CIMD-Clientidentität, geprüfte Metadaten und JWKS; ausschließlich `private_key_jwt`;
- `chatgpt-basic-transition`: ausdrücklich beabsichtigter bestehender vertraulicher Client mit geschütztem Secret und ausschließlich `client_secret_basic`, kein Fallback des JWT-Clients;
- `chatgpt-native-cimd-public`: getrenntes, exakt gepinntes öffentliches Desktop-Profil, `none` mit PKCE `S256`, Client/Loopback-Callback `7yTcOAOqrumX` gemäß [Native-CIMD-Runbook](repo:docs/deploy/openai-native-cimd.md);
- für jedes Profil exakte Client-ID und Callback-Allowlist, PKCE `S256` und alleinige Resource/Audience `https://mcp-openai.skillpilot.com/mcp`;
- getrennte Read-/Write-Scopes, kurze Access-Token-Laufzeit, Refresh-Token-Rotation und Widerruf.

Die Implementierung in [OpenAiDeOAuthConfiguration.java](repo:backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeOAuthConfiguration.java) bindet die Methode an die Clientidentität. Der [Assertion-Validator](repo:backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeJwtClientAssertionValidator.java) prüft unter anderem Identität, Zeitgrenzen und Replay. Die Profilimplementierung ist kein Nachweis ihrer Aktivierung oder echten Host-Abnahme. Offene DCR, ungepinnte CIMD und beliebige `none`-Clients bleiben ausgeschlossen.

Nur das Basic-Übergangsprofil besitzt ein gemeinsames Client-Secret. Es liegt ausschließlich in der geschützten ChatGPT-Appkonfiguration und SkillPilot-Serverumgebung, niemals in Repository, Browserbundle, Startprompt, Chat, MCP-Argumenten, Antworten oder Logs. JWT- und öffentliches Desktop-Profil erhalten dadurch keinen Basic-Fallback.

### OAuth-Ablauf und Ressourcenprüfungen {#sec:sec-mcp-oauth-checks}

Der Authorization Server akzeptiert einen Code-Flow nur, wenn (1) `client_id` exakt einem explizit gepinnten Profil entspricht, (2) `redirect_uri` bytegenau in dessen Allowlist steht, (3) PKCE `S256` vorliegt, (4) `resource` exakt die aktive MCP-Resource adressiert und (5) nur erlaubte Scopes angefordert werden. Am Token-Endpunkt weist das JWT-Profil seine Identität mit einer gültigen signierten Assertion nach; der Basic-Übergangsclient verwendet ausschließlich sein Secret per HTTP Basic. Beim öffentlichen Desktop-Profil bleibt die Codebindung durch PKCE erforderlich.

Bei jedem MCP-Aufruf prüft der Resource Server Signatur bzw. aktive Introspektion, Aussteller (`https://skillpilot.com/api/openai/v1`), Ablauf und Widerruf, exakte Audience/Resource, exakte Client-ID, den erforderlichen Read-/Write-Scope sowie zusätzlich die explizite gültige `learningSessionId`. Ein gültiges OAuth-Token darf weder einen Lernenden auswählen noch eine Session anlegen; das OAuth-Subject dient niemals als Identitätsquelle oder Fallback.

### Lernsession als getrennte Anwendungsbindung {#sec:sec-mcp-session-binding}

Gemäß [OAuth- und Lernsession-Vertrag](repo:docs/concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md) entsteht genau beim Klick auf **Lernen starten** für jeden Start eine neue zufällige ID (absolut 24 Stunden gültig, niemals verlängert; serverseitig nur als HMAC-Hash mit Lernendenzuordnung gespeichert). Neue fachliche Operationen benötigen mindestens `PT1H` Restlaufzeit (exakt `PT1H` ist gültig). Ein bereits committeter Write darf sein gespeichertes Resultat nur bei mindestens `PT1H` Restlaufzeit, identischem Toolnamen, kanonisch gleichen Argumenten, derselben `clientRequestId`, verfügbarer gepinnter Workflow-/Curriculumversion und unveränderter Learner-Revision ohne erneute Mutation replayen.

`SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` und `SESSION_VERSION_UNAVAILABLE` sind keine OAuth-Fehler: Der Coach gibt `instruction` unverändert aus (bzw. den exakten Eintrag aus `instructions` und ergänzt `startUrl` nur, falls noch nicht enthalten) — ohne Fachantwort, ohne Retry mit alter Session und ohne neuen OAuth-Flow. Der Lernende startet über **Lernen starten** im First-Party-WebGUI eine frische Session in einem neuen Chat; die dauerhafte SkillPilot-ID bleibt serverseitig.

### mTLS am MCP-Rand {#sec:sec-mcp-mtls-edge}

Gehostete ChatGPT-Connectoren präsentieren beim TLS-Aufbau ein von OpenAI verwaltetes Clientzertifikat. Der dedizierte MCP-vHost vertraut ausschließlich der veröffentlichten OpenAI Root CA und dem Connectors-Intermediate (ohne rotierendes Leaf-Pinning), während ein Loopback-Verifier Kette, `clientAuth`-EKU und den exakten SAN `mtls.prod.connectors.openai.com` prüft:

- **`observe`:** Gültige Zertifikate werden als `VERIFIED` klassifiziert; zertifikatslose Verbindungen passieren vorübergehend bis zur unveränderten OAuth-Schicht und zählen ausschließlich als `OBSERVE_NO_CERT` (für kontrollierte Integrations- und native Desktop-Tests, kein gehosteter Veröffentlichungszustand). Ungültig präsentierte Zertifikate werden stets abgewiesen.
- **`enforce`:** Externe `/mcp`-Aufrufe benötigen zwingend `VERIFIED`. Lediglich unmittelbare Loopback-Socket-Peers dürfen als `LOCAL_OPERATOR` den unveränderten OAuth-Pfad lokal testen; Internet-Header, Queryparameter oder `X-Forwarded-For` erzeugen niemals einen Bypass.

Protected-Resource-Metadaten und Domain-Challenge bleiben ohne Clientzertifikat erreichbar. mTLS authentisiert die OpenAI-Infrastruktur und ersetzt weder OAuth noch die Lernsession.

### Fail-Closed-Startbedingungen und Secret-Lebenszyklus {#sec:sec-mcp-fail-closed-secrets}

Bei aktiviertem OpenAI-V1-Provider bricht der Serverstart fail-closed ab, sobald eine Bedingung verletzt ist: eigenständiges hochentropisches `SKILLPILOT_SIGNING_SECRET` mit mindestens 32 Nicht-Leerzeichen (keine Platzhalter/Defaults, niemals geloggt), konsistente gepinnte Client-Konfiguration (exakte Client-ID, profilgebundene Methode und geprüfte JWT-Metadaten/JWKS beziehungsweise ausreichend langes Secret für Basic, exakte Callback-Allowlist einschließlich des autorisierten nativen Loopback-Callbacks, PKCE `S256`, exakte HTTPS-Resource/OAuth-Endpunkte), exakte Modus-Übereinstimmung zwischen Root-Nginx, Backend und interner Klassifikation sowie geschlossene offene DCR/ungepinnte Profile. Port `8787` darf öffentlich nicht erreichbar sein; der Reverse Proxy terminiert TLS und leitet nur freigegebene Pfade an `/internal/openai/v1/mcp` weiter.

Das OAuth-Client-Secret wird außerhalb des Repositories erzeugt, liegt identisch nur in ChatGPT-Appverwaltung und SkillPilot-Serverumgebung, erscheint nie in Status-/Fehlerausgaben und wird bei Verdacht auf Kompromittierung sofort rotiert (inklusive Token-Widerruf und Neuautorisierung). Eine Rotation von `SKILLPILOT_SIGNING_SECRET` macht laufende Lernsessions gezielt unauflösbar (geplanter Session-Cutover). Ein Clientwechsel reaktiviert niemals alte Sessions als Identitätsersatz.

### Abnahme-, Negativtests, Restannahmen und Referenzen {#sec:sec-mcp-tests-and-assumptions}

Vor einer Freigabe müssen objektiv scheitern: Token-Requests ohne den für das Profil verlangten Nachweis, mit ungültiger/replayter JWT-Assertion, falschem Basic-Secret oder fremder Client-ID; nicht gepinnte Methoden (`client_secret_post`, offene DCR, ungepinnte `none`/CIMD/`private_key_jwt`); falsche Callback-URL oder fehlendes/falsches PKCE; fehlende/falsche Resource oder fehlender Scope; widerrufenes/abgelaufenes Token; gültiges OAuth ohne `learningSessionId` sowie gültige Session ohne OAuth; unbekannte, manipulierte, widerrufene oder abgelaufene Session; direkter Zugriff auf Port `8787`; im `enforce`-Modus externe `/mcp`-Aufrufe ohne gültiges OpenAI-Clientzertifikat, mit falscher Kette/SAN/EKU oder gefälschten Forwarding-/Klassifikationsheadern. Positiv wird der vollständige Ablauf über die konfigurierte App geprüft (der öffentliche positive mTLS-Nachweis im `enforce`-Modus ist ausschließlich über den echten gehosteten ChatGPT-Connector möglich).

**Restannahmen:** Nicht abgedeckt sind Kompromittierungen des SkillPilot-Hosts, Reverse Proxys oder der ChatGPT-Appkonfiguration, Verlust von SkillPilot-ID, aktivem Session-Link oder Client-Secret sowie vorsätzliche Weitergabe von Access-Token plus Session — begrenzt durch Secret-Rotation, kurze Tokenlaufzeiten, feste 24h-Sessions, Widerruf, minimale Scopes und redigierte Logs.

**Normative OpenAI-Referenzen:** [Client identification](https://developers.openai.com/plugins/build/auth#client-identification) · [Client registration & authentication](https://developers.openai.com/plugins/build/auth#client-registration) · [Resource/Audience parameter](https://developers.openai.com/plugins/build/auth#echo-the-resource-parameter-throughout-the-oauth-flow) · [Mutual TLS (mTLS)](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls).
