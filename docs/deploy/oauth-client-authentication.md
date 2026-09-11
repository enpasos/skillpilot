# OAuth-Clientauthentifizierung: profilweise Abnahme und Betrieb

**Entscheidung: 11. September 2026.** Die neue Vorgabe ersetzt die frühere
globale Pflicht zu ausschließlich vertraulichen Clients. Claude darf mit
öffentlichem CIMD und PKCE als produktives Beta-Profil betrieben werden.
ChatGPT-JWT, Claude-Beta und vertrauliche Claude-Verbindungen werden unabhängig
abgenommen. Herstellerantworten sperren nur die jeweils abhängige Funktion.

**Implementiert → technisch getestet → mit echtem Host getestet → produktiv
aktiviert** sind getrennte Ergebnisse. Lokale Tests und öffentliche Discovery
sind keine neue Host-Abnahme. Veröffentlichte Pakete, historische Belege und
content-adressierte Dateien bleiben unverändert.

Dieses Runbook richtet sich an Backend-/Security-Entwickler und Betreiber.
Es beschreibt die **implementierte lokale Policy**, nicht ein universelles
Verhalten aller ChatGPT-/Claude-Konten. Zum Verständnis ist keine frühere
Diskussion nötig: Abschnitt 1 erklärt Vertrauensgrenzen und Ablauf, 2–3 die
Konfiguration, 4 die Host-Abnahme, 5 Betrieb/Migration/Störungen, 6 die
reproduzierbaren Nachweise und 7 ausschließlich externe Restpunkte.

Stand dieser Dokumentation: Die profilbezogene Implementierung und lokale
automatisierte Nachweise sind vorhanden; eine reale Host-Abnahme und ein
Produktionswechsel **dieses neuen Standes** sind hier nicht belegt. Verbindlich
für einen bestimmten Release sind dessen Commit, Profilrevision und
Abnahmebelege, nicht das Datum dieses Textes. Ein schon vorher funktionierender
Connector ist kein Nachweis der neuen Policy.

## 1. Profile und Sicherheitsgarantien

Die Namen sind interne SkillPilot-Profile, keine Herstellerparameter.

| Profil | Zulässige Clientauthentifizierung | Freigabegrenze |
| --- | --- | --- |
| `chatgpt-cimd-jwt` | Exakte CIMD-Identität, ausschließlich `private_key_jwt` | Vorgesehene reale Installation, OAuth- und Lernbetrieb abgenommen; keine allgemeine OpenAI-Erlaubnis erforderlich |
| `chatgpt-basic-transition` | Expliziter bestehender Client, `client_secret_basic` | Vorhandene sichere Verbindung erhalten; gesondertes Übergangsprofil, kein JWT-Fallback |
| `claude-cimd-public` | Exakter öffentlicher CIMD-Client, `none` und PKCE `S256` | Unabhängig abgenommenes Beta-Profil; keine zentrale Credential-Hinterlegung nötig |
| `claude-custom-confidential` | Dedizierter Client, genau Basic oder Post | Kontrollierte eigene/Admin-Verbindung mit geschütztem Secret und echter Custom-Connector-Abnahme |
| `claude-anthropic-held` | Separater dedizierter Client, genau Basic oder Post | Tatsächliche zentrale Hinterlegung durch Anthropic und Abnahme dieses Verteilungswegs |
| `chatgpt-mtls` | Zusätzliche OpenAI-Transportprüfung, getrennt von OAuth | Positiver/negativer Transporttest; Claude bleibt unbeeinträchtigt |

`none` beim öffentlichen Claude-Client bedeutet **keinen geheimen
Clientnachweis am Token-Endpunkt**, nicht frei zugänglichen MCP-Lernbetrieb.
Nutzerautorisierung, Code/PKCE, Access-Token-Prüfung, Scopes, Audience und die
unabhängige SkillPilot-Lernsession bleiben erforderlich. Der reguläre
Lernbetrieb erhält keinen stillschweigend erfundenen vertraulichen Status.

Die Methode ist serverseitig pro zugelassener Clientidentität festgelegt.
Auch wenn Discovery mehrere Methoden nennt, darf ein JWT-Client nicht `none`
wählen. Ein falsches Claude-Secret eröffnet keinen öffentlichen Ersatzclient.
DCR wird nicht als offene Kompatibilitätsregistrierung hinzugefügt.

**Keine Variante attestiert Plugin-Dateien, eine Skill-Version oder korrektes
Coach-Verhalten.** OAuth wählt keinen Lernenden aus und ersetzt keine fachliche
Prüfung. Öffentliche Grants werden weder durch Endpunktwechsel noch durch
Umkonfiguration vertraulich. Provider-Header/Plugin-Namen sind keine
Autorisierung. MCP prüft den beim ursprünglichen Grant gebundenen
Client-/Profilkontext; dieselbe Operation bleibt auf allen Routen gleich geschützt.

### 1.1 Rollen und Geheimnisse: was tatsächlich gekoppelt wird

Ein **Authorization Server (AS)** stellt nach dem OAuth-Codeaustausch Tokens
aus. Der **Resource Server** ist der geschützte MCP-Endpunkt, der diese Tokens
prüft. Beide Rollen laufen hier im SkillPilot-Backend, aber mit getrennten
Provider-Routen und Zulassungsregeln. Der OAuth-Client ist die verbindende
Host-Komponente, nicht die heruntergeladene Plugin-Datei.

| Gegenstand | Verantwortlich / Prüfung | Bewirkt nicht |
| --- | --- | --- |
| Plugin und Skills im Git-Marketplace | Herausgeber veröffentlicht Inhalte; Nutzer wählt eine vertrauenswürdige Quelle | Kein serverseitiger Beweis der tatsächlich ausgeführten Datei, Version oder Anweisung |
| OAuth-`client_id` | Öffentliches Kennzeichen einer serverseitig zugelassenen Registrierung; bei CIMD eine Metadaten-URL | Kein Geheimnis und bei `none` kein Besitznachweis des Herstellers |
| Client-Secret oder JWT-Signaturschlüssel | Vertraulicher Host hält Secret bzw. privaten Schlüssel; SkillPilot prüft Secret bzw. vertrauenswürdig bezogenen öffentlichen Schlüssel | Kein Beweis, dass ein Modell den unveränderten Skill befolgt; ein geteilter Herstellerclient identifiziert nicht automatisch genau unser Plugin |
| Verbindung/Zustimmung im Host | Nutzer erlaubt den Connector im eigenen Host-Konto | Keine Anmeldung als bestimmter SkillPilot-Lernender |
| Technischer OAuth-Principal | Backend erzeugt einen zufälligen, providergebundenen App-Principal | Keine dauerhafte SkillPilot-ID und keine fachliche Identität |
| Authorization Code + PKCE | Kurzlebiger einmaliger Code, an Client, Callback und `S256`-Challenge gebunden; beim Austausch passender Verifier erforderlich | PKCE macht einen öffentlichen Client nicht vertraulich |
| Access-Token | Opaques Bearer-Token; Backend prüft aktiven Grant, Provider, Profil, Ablauf, Resource und Scopes | Allein kein Zugriff auf einen bestimmten Lernenden; kein Beweis pro Request durch Besitz eines Signaturschlüssels |
| Refresh-Token | Geheimnis des konkreten Grants; Rotation und erneute profilgerechte Clientprüfung | Keine neue Profilidentität und keine verlängerte SkillPilot-Lernsession |
| `learningSessionId` | Separater kurzlebiger Zugang aus der eigenen SkillPilot-WebGUI; Tools validieren dessen Bindung und Gültigkeit | Kein Ersatz für OAuth; niemals als OAuth-Client-ID, Secret oder Assertion verwenden |
| Coach-Entscheidung | Coach entscheidet innerhalb der vom Backend erlaubten fachlichen Operationen; Backend prüft Zustands-/Berechtigungsregeln | OAuth zertifiziert weder eine richtige Bewertung noch ehrliches Modellverhalten |

**App-only ist bewusst so implementiert:** OpenAI verwendet
`OpenAiDeBindingAuthenticationFilter` und eine eigene OAuth-Consent-Seite.
Claude verwendet `ClaudeV1AppAuthenticationFilter`; seine Registrierung hat
`requireAuthorizationConsent(false)` und zeigt kein zusätzliches
SkillPilot-Consentformular. Beide erzeugen einen technischen Principal ohne
Lernendenauflösung. „Nutzerautorisierung“ bezeichnet hier den Verbindungsablauf,
nicht den Beweis eines SkillPilot-Nutzerkontos. Die erste Lernendenzuordnung
erfolgt erst über die unabhängig validierte Lernsession beim Tool-Aufruf.

Bei `private_key_jwt` ist außerdem **nur die Client-Assertion signiert**.
Sie wird am Token-Endpunkt geprüft. Die danach ausgestellten Access-Tokens
bleiben Bearer-Tokens; diese Implementierung führt weder DPoP noch eine
Plugin-Signaturprüfung oder kryptografische Signierung jeder MCP-Nachricht ein.

### 1.2 Ablauf und Vertrauensgrenzen

```text
Vertrauenswürdige Plugin-Quelle ── Installation ──> Host + Skills
                                                      │
Nutzer erlaubt Verbindung ──> AS /authorize ── Code ────┤
                                                      │ Code + PKCE-Verifier
                                                      │ + profilgerechter Clientnachweis
                                                      v
                                              AS /token
                                                      │ Access-/Refresh-Token
SkillPilot „Lernen starten“ ── separate Lernsession ────┤
                                                      v
                                   MCP: Token + Profil + Scope
                                        + Lernsession + Zustandsregeln
                                                      │
                                                      v
                                            erlaubte Coach-Operation
```

1. Der Host findet über Protected-Resource-Metadaten den AS. Serverkonfiguration
   und freigegebene CIMD-Dokumente bestimmen Client, Callback und Methode;
   Angaben eines Requests dürfen diese Bindung nicht erweitern.
2. Der Host startet den Code-Flow mit Resource, Scopes, Callback und PKCE
   `S256`. Der AS erstellt den technischen App-Principal und den gebundenen
   Grant. OpenAI verlangt zusätzlich die eigene Consent-Seite.
3. Beim Codeaustausch prüft der AS den konfigurierten Clientnachweis und den
   Verifier. Die gemeinsame Code-Sperre verhindert doppelten Verbrauch über
   mehrere Prozesse hinweg. Nur neue Grants erhalten die aktuelle Provenienz.
4. Beim MCP-Aufruf wird das Token serverseitig nachgeschlagen. Erst nach
   erfolgreicher Provider-/Profil-/Scopeprüfung wird die separate Lernsession
   validiert. Ein Providerheader oder ein Plugin-Name ersetzt keinen Schritt.
5. Refresh bleibt beim ursprünglichen Profil. Öffentliche Claude-Familien
   erkennen auch die Wiederverwendung eines früheren Refresh-Tokens und
   sperren dann die betroffene Familie einschließlich des aktuellen Zugangs.

### 1.3 Bedrohungsmodell und bewusst verbleibende Risiken

Geschützt werden sollen unautorisierte Tool-Aufrufe, unbemerkte Methodenwechsel,
Token-/Code-/Assertion-Replay, Providerverwechslung, nachträgliche Aufwertung
öffentlicher Grants und Wiederbelebung stillgelegter Policyrevisionen.
Angreifer können eigene HTTP-Requests, kopierte öffentliche Metadaten und
veränderte Plugin-/Skill-Inhalte verwenden. Geleakte Bearer-Tokens und
Lernsessions gelten als kompromittierte Zugänge, nicht als harmlose IDs.

Das öffentliche Claude-Profil ist **bewusst schwächer**: CIMD-Allowlist,
Callbackbindung und PKCE begrenzen den Flow, liefern bei `none` aber keinen
kryptografischen Nachweis, dass der Aufrufer tatsächlich Anthropic ist.
Der öffentliche Claude-Code-Client mit Loopback-Callback ist ebenfalls in der
lokalen Allowlist; Hosted- und Code-Identitäten teilen das öffentliche Profil,
aber kein geheimes Credential. Ein Hosted-Callback ist kein allgemeiner
Ersatz für Clientauthentifizierung. Dieses Risiko ist die ausdrückliche
Beta-Entscheidung, nicht ein versehentlich als vertraulich beworbener Zustand.

Auch ein vertraulicher Client kann eine schädliche oder fehlerhafte
Coach-Entscheidung weiterleiten. Wer eine korrekt gekoppelte Lernsession und
gültige Zugänge kontrolliert, wird durch OAuth allein nicht zu einem ehrlichen
Coach. Eine zukünftige nachweisbare Plugin-/Versionsbindung wäre eine eigene
Host-Funktion mit eigener Serverprüfung und Abnahme. Die aktuelle Lösung
behauptet sie für **keines** der Profile. TLS, sicherer Serverbetrieb,
geschützte Credential-Verwahrung und unveränderte fachliche Prüfungen bleiben
Voraussetzungen.

## 2. ChatGPT konfigurieren und migrieren

Die primäre Konfiguration liegt unter `skillpilot.openai.coach.v1.oauth`.
Bestehende sichere Basic-Werte zunächst unverändert erhalten. Erst das
abgenommene JWT-Profil zur primären Konfiguration machen; ein zusätzliches
Basic-Übergangsprofil benötigt eine eigene ausdrücklich registrierte Identität.

| Property für das JWT-Profil | Wert / Herkunft |
| --- | --- |
| `client-id` | Exakte im realen Verbindungsweg verwendete und lokal zugelassene CIMD-URL |
| `client-authentication-method` | `private_key_jwt` |
| `redirect-uris` | Exakt erlaubte HTTPS-Callbacks; keine Wildcards |
| `client-jwk-set-uri` | Fest zugelassene OpenAI-JWKS-URL dieses Clients |
| `client-assertion-signing-algorithm` | `RS256` |
| `client-assertion-audience` | Exakter AS-Issuer oder Token-Endpunkt des realen Flows, nicht MCP-Resource-Audience |
| `client-assertion-clock-skew` | Default `PT30S`, höchstens `PT1M` |
| `client-assertion-max-lifetime` | Default und Maximum `PT5M` |
| `authorization-policy-version` | Nicht geheime Profilrevision; für gezielte Grant-Invalidierung erhöhen |

Die Property-Namen der Tabelle werden in `application.yml` explizit auf
Umgebungsvariablen abgebildet: Präfix
`SKILLPILOT_OPENAI_COACH_V1_OAUTH_`, danach der Property-Name in Großbuchstaben
mit `_` statt `-`, beispielsweise `CLIENT_JWK_SET_URI`. Diese Abbildung gilt
für **alle neun** Tabellenzeilen. Ein JWT-Profil benötigt kein Client-Secret.
JWT erlaubt genau einen im CIMD dokumentierten ChatGPT-Callback, nicht eine
beliebige Liste eigener Redirects. Die konfigurierte JWKS-Adresse muss auf
`/oauth/jwks.json` am zugelassenen OpenAI-Host zeigen. Keine URL aus einem
eingehenden JWT-Header übernehmen.

### Betriebsrahmen und Endpunkte

| Konfiguration | Zweck / Default |
| --- | --- |
| `SKILLPILOT_OPENAI_COACH_V1_ENABLED` | Aktiviert V1, Default `false` |
| `SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED` | Aktiviert dessen OAuth, Default `false`; für geschützten Betrieb erforderlich |
| `SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED` | MCP-Lane; Default folgt V1-Aktivierung |
| `SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED` | Erste Lernsession aus SkillPilot, Default `false`; Teil des Lernbetriebs, nicht Clientauthentifizierung |
| `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED` | Schreiboperationen, Default `false`; durch OAuth-Erfolg nicht automatisch aktiviert |
| `skillpilot.openai.coach.v1.security.secure-mode` | Folgt V1-Aktivierung; ein explizites `false` im aktiven Betrieb wird abgelehnt |
| `skillpilot.openai.coach.v1.server-build` | Build-ID wird beim Build eingesetzt; aktiver Betrieb verweigert `dev`/fehlende ID |
| `SKILLPILOT_OPENAI_OAUTH_ACCESS_TOKEN_TTL` | `PT1H`; bewusst ohne `COACH_V1` im Variablennamen |
| `SKILLPILOT_OPENAI_OAUTH_REFRESH_TOKEN_TTL` | `P30D`; Refresh-Tokens werden nicht wiederverwendet |
| `SKILLPILOT_OPENAI_LEARNING_SESSION_TTL` | `PT24H`; unabhängig von beiden OAuth-TTLs |
| `SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE` | `disabled`, `observe` oder `enforce`; nur zusammen mit tatsächlicher Edge-Konfiguration aussagekräftig |

| Rolle | ChatGPT V1 | Claude V1 |
| --- | --- | --- |
| Öffentliche MCP-Resource / Token-Audience | `https://mcp-coach-v1.skillpilot.com/mcp` | `https://mcp-claude-v1.skillpilot.com/mcp` |
| Protected-Resource-Metadaten | MCP-Origin + `/.well-known/oauth-protected-resource/mcp` | MCP-Origin + `/.well-known/oauth-protected-resource/mcp` |
| AS-Issuer | `https://skillpilot.com/api/openai/v1` | `https://mcp-claude-v1.skillpilot.com` |
| AS-Discovery | `https://skillpilot.com/.well-known/oauth-authorization-server/api/openai/v1` | MCP-Origin + `/.well-known/oauth-authorization-server` |
| Authorize / Token / Revoke | `https://skillpilot.com/api/openai/v1/oauth2/authorize`, `/token`, `/revoke` mit demselben Pfadpräfix | MCP-Origin + `/oauth2/authorize`, `/oauth2/token`, `/oauth2/revoke` |
| Fachliche Scopes | `skillpilot.openai.v1.read`, `skillpilot.openai.v1.write`; zusätzlich `offline_access` für Refresh | `skillpilot.read`, `skillpilot.write`; zusätzlich `offline_access` für Refresh |
| Interner MCP-Pfad | `/internal/openai/v1/mcp` | `/internal/connectors/claude/v1/mcp` |

Die öffentlichen Ursprünge sind Vertragsteile, keine frei austauschbaren
Beispiele. Eine Testumgebung benötigt dafür ein ausdrücklich geprüftes
Routing-/Callback-Konzept; dieses Runbook behauptet keine bereits vorhandene
Canary-Domain. Interne Routen nicht als zweiten ungeprüften Internetzugang
exponieren. Die vollständige Edge-/Provider-Inbetriebnahme bleibt im
[OpenAI-Betriebsrunbook](openai-mcp-coach-v1.md) beschrieben.

OpenAI verwaltet den privaten Signaturschlüssel; SkillPilot verwendet die
vertrauenswürdigen öffentlichen Schlüssel. Das lokale JWT-Gebot gilt auch,
wenn CIMD zusätzlich `none` anbietet. Ein dedizierter Basic-Client ist eine
andere Registrierung, keine alternative Methode für denselben JWT-Client.
[OpenAI: Client registration](https://developers.openai.com/plugins/build/auth#client-registration)

Metadaten/JWKS werden ausschließlich über zugelassene HTTPS-Adressen geladen.
JWT-Header können keine Schlüsselquelle setzen. Abrufgrenzen: 256 KiB, drei
Sekunden Verbindungs- und fünf Sekunden HTTP-Transferzeit; die vorherige
JVM-DNS-Prüfung liegt außerhalb dieser Frist. JWKS-Cache: fünf Minuten,
höchstens ein Nachladeversuch alle fünf Sekunden. Ein unbekanntes `kid` löst
nur eine begrenzte Aktualisierung aus.

Die CIMD-Metadatenbereitschaft ist zusätzlich profilbezogen begrenzt: Der
erste Versuch wartet höchstens sechs Sekunden, weitere Versuche laufen alle
30 Sekunden im Hintergrund, mit maximal einem gleichzeitigen Worker.
Token-/Datenbankzugriffe selbst laden keine CIMD-Dokumente. Ein erfolgreicher
Metadatenbeleg gilt höchstens fünf Minuten; Fehlversuche schließen die JWT-
Bereitschaft, spätere gültige Prüfung öffnet sie wieder. Der konfigurierte
Basic-Übergang und Claude bleiben bei einer OpenAI-Metadatenstörung verfügbar.
`clientMetadataReady` und die Profilübersicht im Health-Indikator beschreiben
diese Bereitschaft, nicht reale Host- oder Produktionsabnahme.

Assertions werden auf Signatur, Algorithmus, Clientidentität, Audience,
Zeitfenster und Wiederverwendung geprüft. Das datenbankgestützte Replay-Budget
heißt `SKILLPILOT_OPENAI_OAUTH_CLIENT_ASSERTION_REPLAY_CACHE_SIZE` (Default
`10000`), **nicht** eine erfundene gleichnamige V1-Variable. Ein Verbrauch bleibt
trotz Neustart oder später gescheitertem Code-Austausch bis einschließlich
Ablauf plus Uhrtoleranz gesperrt. Nicht prüfbare Assertions werden abgelehnt.

### Bestehendes Basic-Profil

Eine vorhandene dedizierte
`SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ID` zusammen mit
`SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD=client_secret_basic`
bildet ein explizites Übergangsprofil. Secret/Redirects nicht mit Beispielwerten
überschreiben. Bei paralleler Migration bleiben Verbindungen dem Basic-Client
zugeordnet und erhalten keine JWT-Provenienz. Stilllegung erst nach belegter
Migration, nicht abhängig von allgemeinen Herstellerantworten.

Bei primärem JWT wird der bisherige Basic-Client nur über
`oauth.transitional-basic.enabled=true` zusätzlich zugelassen. Unter
`oauth.transitional-basic` **dieselbe** bisherige `client-id`, `client-secret`,
`redirect-uris` und vorherige Basic-`authorization-policy-version` konfigurieren.
Die Umgebungsvariablen beginnen mit
`SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_` und enden auf `ENABLED`,
`CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URIS` beziehungsweise
`AUTHORIZATION_POLICY_VERSION`. Default ist deaktiviert; JWT und Basic haben
getrennte Revisionen. Eine JWT-Revisionsänderung stilllegt nicht automatisch Basic.

Bestehende noch unmarkierte Basic-Grants bleiben ausschließlich während der
**ersten** expliziten Basic-Übergangsmigration zulässig und werden beim Refresh
nicht nachträglich markiert. Nach Stilllegung oder Revisionwechsel können
sie mangels eigener Revisionsbindung nicht wieder zugelassen werden; erneute
Verbindung erzeugt einen neuen profilgebundenen Grant. Dafür muss die
vorhandene Registrierung bereits exakt Basic,
passendes Secret/Callback, erlaubte OpenAI-Scopes, PKCE/Zustimmung und passende
Code-/Refresh-Einstellungen haben. Öffentliche oder fremde Registrierungen
mit derselben ID werden nicht übernommen. Ein deaktiviertes Profil ist kein
Fallback; eine stillgelegte Revision braucht beim erneuten Freischalten eine
neue Revision und gegebenenfalls neue Zustimmung.

## 3. Claude unabhängig betreiben

Die Konfiguration liegt unter `skillpilot.claude.connector.v1.oauth`.

### Exakte Konfigurationszuordnung

Die OAuth-Variablen sind absichtlich kürzer als die allgemeinen Connector-
Variablen. `SKILLPILOT_CLAUDE_V1_...` und
`SKILLPILOT_CLAUDE_CONNECTOR_V1_...` nicht gleichsetzen.

| OAuth-Property | Umgebungsvariable / Default |
| --- | --- |
| `client-authentication-mode` | `SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_AUTHENTICATION_MODE`; `claude-cimd-public` |
| `public-cimd-enabled` | `SKILLPILOT_CLAUDE_V1_OAUTH_PUBLIC_CIMD_ENABLED`; leer = modeabhängig |
| `public-authorization-policy-version` | `SKILLPILOT_CLAUDE_V1_OAUTH_PUBLIC_AUTHORIZATION_POLICY_VERSION`; `1` |
| `client-id` | `SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_ID`; nur vertrauliche Lane, kein Defaultclient |
| `client-secret` | `SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_SECRET`; nur vertrauliche Lane, geschützte Laufzeitkonfiguration |
| `client-authentication-method` | `SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD`; vertraulich explizit `client_secret_basic` oder `client_secret_post` |
| `redirect-uri` | `SKILLPILOT_CLAUDE_V1_OAUTH_REDIRECT_URI`; `https://claude.ai/api/mcp/auth_callback` |
| `authorization-policy-version` | `SKILLPILOT_CLAUDE_V1_OAUTH_AUTHORIZATION_POLICY_VERSION`; `1`, nur vertrauliche Lane |
| `scopes` | Typisierte Property, keine zusätzliche Kurzalias-Variable; Default `skillpilot.read`, `skillpilot.write`, `offline_access` |

Die allgemeine Aktivierung lautet
`SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=true`. Zusätzlich sind die bestehenden
voneinander verschiedenen Backendgeheimnisse
`SKILLPILOT_CLAUDE_CONNECTOR_V1_SIGNING_SECRET` und
`SKILLPILOT_CLAUDE_CONNECTOR_V1_CAPABILITY_SECRET` erforderlich. Sie sind
**keine OAuth-Client-Secrets**, werden nicht an den Host verteilt und werden
bei einem Wechsel des Clientprofils nicht automatisch rotiert. Formatprüfung
und übrige Inbetriebnahme stehen im
[Claude-V1-Release-Runbook](claude-connector-v1-release.md).

Allgemeine TTLs liegen direkt unter `skillpilot.claude.connector.v1`:
`access-token-ttl=PT1H`, `refresh-token-ttl=P30D`, `capability-ttl=PT5M`.
Die zugehörigen allgemeinen Connector-Properties und ihre Validierung sind
in `ClaudeV1Properties` und `ClaudeV1Configuration` definiert. Alte
`SKILLPILOT_CLAUDE_OAUTH_*`-Variablen gehören **nicht** zu V1. Die frühere
Claude-Lane mit `SKILLPILOT_CLAUDE_ENABLED` und deren MCP-/Coach-/Regression-
Flags bleibt deaktiviert; sie ist kein Ausweichweg bei einem V1-OAuth-Fehler.

### Öffentliches CIMD-Beta-Profil

`client-authentication-mode=claude-cimd-public` ist der Default. Das Profil
verwendet exakte Client-Zulassung, PKCE `S256` und die vorgesehenen Claude-Scopes.
`public-cimd-enabled` kann die öffentliche Lane ausdrücklich an-/abschalten;
eine aktive vertrauliche Lane muss diese nicht verdrängen. Eine leere
Umgebungsvariable `SKILLPILOT_CLAUDE_V1_OAUTH_PUBLIC_CIMD_ENABLED` belässt die
modeabhängige Voreinstellung. Discovery muss für die öffentliche Lane CIMD und
`none` ankündigen; keine allgemeine DCR-Registrierung erforderlich.
[Claude: CIMD](https://claude.com/docs/connectors/building/authentication#dcr-and-cimd-details)

Die Voreinstellung ist nur im öffentlichen Modus aktiv, in vertraulichen
Modi deaktiviert. Für Parallelbetrieb dort ausdrücklich `public-cimd-enabled=true`
setzen. Die öffentliche `public-authorization-policy-version` (Umgebung:
`SKILLPILOT_CLAUDE_V1_OAUTH_PUBLIC_AUTHORIZATION_POLICY_VERSION`, Default `1`)
ist von der vertraulichen `authorization-policy-version` unabhängig.
Gleichzeitig möglich: öffentliche Lane plus **ein** dedizierter Custom- oder
Anthropic-held-Client. Custom und Anthropic-held sind unterschiedliche
Profile; beim Wechsel nicht die alte Clientidentität umdeuten.

Die Übernahme des früheren öffentlichen Betriebs erfordert einmaliges
erneutes Verbinden: Alte Grants besitzen weder neue Profilprovenienz noch
Refresh-Familienbindung. Nicht durch einen Konfigurationsschalter aufwerten.
Dieses Wiederverbindungsfenster gehört in die konkrete Releaseplanung.

Öffentliche Refresh-Tokens werden rotiert. Die Wiederverwendung eines bereits
verbrauchten Tokens muss die **betroffene Tokenfamilie** widerrufen; nur das
alte Token abzulehnen reicht nicht. Auch der aktuelle Nachfolger darf dann
keinen Refresh oder geschützten MCP-Zugriff mehr erlauben. Andere Familien
und Profile bleiben gültig. Automatisierte Tests und reale Refresh-Abnahme
müssen dieses Verhalten nachweisen.

### Kontrollierter Custom Connector

`claude-custom-confidential` benötigt eine eigene Client-ID und ein im
kontrollierten Betreiber-/Admin-Kontext hinterlegtes Secret. Einrichtung über
die erweiterten OAuth-Einstellungen eines Custom Connectors, sofern das
konkrete Konto diese anbietet. Genau `client_secret_basic` oder
`client_secret_post` ist bei Code-Austausch **und** Refresh erforderlich;
PKCE bleibt verbindlich. Das ist kein geheimnisfreier Installationsweg für
beliebige Beta-Tester.

Vorregistrierte Custom-Credentials sind dokumentiert; Konto-/Workspace-Zugang
und tatsächliches Setup werden selbst geprüft. Ein erfolgreicher Custom-Test
beweist nicht die zentrale Anthropic-Hinterlegung.
[Claude: Custom connectors](https://claude.com/docs/connectors/building/authentication#custom-connectors)

### Zentral bei Anthropic hinterlegtes Profil

`claude-anthropic-held` verwendet dieselben vertraulichen Backendbausteine,
bleibt aber bis zur Hinterlegung und Host-Abnahme **technisch vorbereitet,
extern nicht aktiviert**. `oauth_anthropic_creds` ist der Anthropic-Modus,
nicht eine Token-Endpunkt-Methode. Die Hinterlegung gehört zum Directory-
Verfahren. Das vorhandene persönliche Pro-/Max-Konto beweist keinen
Directory-Organisationszugang. Dies blockiert weder CIMD-Beta noch Custom-Tests.

Anthropic verwahrt das Secret für gehostete Verbindungen; Claude Code nutzt
diese zentralen Credentials nicht. Eine gleiche MCP-URL oder Git-Installation
beweist nicht das verwendete Clientprofil: Maßgeblich ist der reale Grant.
[Anthropic-held credentials](https://claude.com/docs/connectors/building/authentication#anthropic-held-client-credentials)

### Gemeinsame vertrauliche Claude-Konfiguration

Dedizierte Client-ID mit 8–128 Zeichen aus `[A-Za-z0-9._-]`, kryptografisch
zufälliges Secret mit 32–72 druckbaren ASCII-Zeichen und exakt gewählte
Basic-/Post-Methode. Kein gemeinsames Secret an Lernende weitergeben. Der
gehostete Callback ist `https://claude.ai/api/mcp/auth_callback`; Scopes und
`authorization-policy-version` ausdrücklich konfigurieren. Die Clientdatenbank
enthält nur den bcrypt-kodierten Secret-Wert.

## 4. Installation und reale Abnahme

### Claude-Beta: Marketplace zuerst, Datei als Fallback

1. Die [Installations- und Update-Anleitung](claude-personal-plugin-update-options.md)
   verwenden. Quelle: `https://github.com/enpasos/skillpilot-claude-marketplace`.
2. Im eigenen Claude-Konto **SkillPilot Coach v1** installieren; installierte
   Version mit der aktuellen SkillPilot-Anzeige vergleichen. Nur eine aktive
   Installation halten. Katalogsynchronisierung allein ist kein Paketupdate.
3. Den enthaltenen SkillPilot-Connector verbinden und OAuth bestätigen.
   Lernende erhalten weder Secret noch Advanced-OAuth-Konfigurationswerte.
4. In SkillPilot **Lernen starten**, die vorbereitete Nachricht im richtigen
   Claude-Chat verwenden und einen echten Tool-Aufruf prüfen.
5. Bei Updates zuerst die angebotene Version prüfen; bei ausbleibendem
   Marketplace-Update die aktuelle Plugin-Datei nach der bestehenden Anleitung
   herunterladen/hochladen. Neue OAuth-Zustimmung nach Profil-Cutover ist kein
   Nachweis eines Paketupdates.

Zusätzlicher Einstieg:
[Custom Connector mit vorausgefülltem Namen und MCP-URL](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=SkillPilot%20Coach%20v1&connectorUrl=https%3A%2F%2Fmcp-claude-v1.skillpilot.com%2Fmcp).
Der Nutzer bestätigt die Einrichtung; konkrete Kontoverfügbarkeit prüfen.
**Der Link installiert weder das Plugin noch seine Skills.** Für den
vollständigen Lerncoach bleibt die Paketinstallation erforderlich.
[Claude: Install links](https://claude.com/docs/connectors/building/directory-vs-custom#share-an-install-link)

### ChatGPT: Entwickler- und Beta-Installation getrennt

Eine manuelle Entwickler-Verbindung beweist nicht die Plugin-/Skill-Verteilung
an externe Beta-Tester. Den vorgesehenen Verteilungsweg mit einem eigenen
Tester-Konto dokumentieren. Keine angeblich allgemeingültige Marketplace-URL
oder Desktop-/Mobile-Verfügbarkeit aus einem Entwicklertest ableiten.
Fehlende Konto-/Workspace-Rechte betreffen dieses Profil, nicht Claude.
[OpenAI: Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt)

### Abnahmeprotokoll je Profil

Datum, Deployment-Commit, nicht geheime Profilrevision, Oberfläche,
Installationsweg und Ergebnis erfassen. Erforderlich: frische Installation,
Autorisierung, Tool-Nutzung, Ablauf/Refresh, Widerruf/Wiederverbindung,
Negativtests, Profil-/Endpunkt-Isolation, unveränderte Lernsession-/Runtime-
Regeln, Monitoring und getesteter Rollback. JWT und öffentliche Claude-Beta
benötigen den vorgesehenen externen Beta-Installationsnachweis; Anthropic-held
zusätzlich Hinterlegung und eigenen Verteilungsnachweis.

Keine Secrets, Assertions, vollständigen Tokens, Lernsession-IDs oder privaten
Lerndaten in Belege übernehmen. Browserprofile/Cookies bleiben außerhalb von
Git/Testartefakten. Angezeigter Login ist kein Nachweis verfügbarer Automation.

### Wiederholbare Durchführung im echten Host

Für jedes beanspruchte Profil und jede zugesagte Oberfläche einen eigenen
Durchlauf mit einem ausschließlich dafür bestimmten Testlernenden durchführen.
Ein mobilegroßes Browserfenster beweist keine native iOS-/Android-App. Der
Prüfer braucht den echten Hostzugang einschließlich gegebenenfalls manuell
bestätigter Anmeldung/MFA; ein OpenAI-API-Key ersetzt ihn nicht.

1. **Kandidat festhalten:** Commit, Build-ID, nicht geheime Profilrevision,
   aktivierte Lane, Testumgebung, Host/Version/Kontotyp und Uhrzeit notieren.
   Zulässige Methode/Callback/Scopes vorab aus dem konkreten Profil ableiten.
2. **Frisch installieren:** Den tatsächlich zugesagten Beta-Installationsweg
   ohne vorherige Entwicklerregistrierung oder geteiltes Betreiber-Secret
   durchlaufen. Paket-/Skill-Version und Connector getrennt prüfen. Bei Custom
   wird ausdrücklich nur der kontrollierte Custom-Weg abgenommen.
3. **Verbinden:** OAuth im Host starten; beim Backend über die bereinigte
   Korrelationskennung kontrollieren, welches Profil wirklich verwendet wurde.
   Die Anzeige „verbunden“ allein beweist weder JWT noch Anthropic-held.
4. **Lernen:** Aus der eigenen SkillPilot-WebGUI eine neue Lernsession
   starten; Kontext lesen und eine erlaubte, reversible Testoperation im
   vorgesehenen Ablauf durchführen. Zustand im Cockpit kontrollieren.
   Fehlende/abgelaufene/fremde Lernsession muss trotz gültigem OAuth scheitern.
5. **Refresh:** Access-Token tatsächlich ablaufen lassen und anschließend
   denselben Host erneut eine Operation ausführen lassen. Ein Browser-Reload
   ist kein Ablaufnachweis. Verkürzte TTL nur in einer ausdrücklich genehmigten
   Testkonfiguration verwenden und deren Abweichung dokumentieren; deren
   Ergebnis nicht als identische Produktions-TTL-Abnahme ausgeben.
6. **Widerruf:** Testverbindung trennen/widerrufen und prüfen, dass ihr alter
   Zugang nicht weiter funktioniert. Neu verbinden und unabhängig eine neue
   Lernsession verwenden. Disconnect im Host, Grant-Widerruf und Ablauf einer
   Lernsession sind unterschiedliche Ereignisse.
7. **Negativ-/Isolationstest:** Mit separaten synthetischen Testzugängen falsche
   Methode/Client/Audience/PKCE und Providerwechsel ablehnen lassen. Für Public
   Claude zusätzlich Refresh-Reuse und den gesperrten Nachfolger prüfen; eine
   zweite Familie und ein anderes Profil müssen unberührt bleiben. Echte
   Host-Tokens nicht in Shell-History, HAR-Dateien oder CI-Protokolle kopieren.
8. **Betrieb:** Profilbezogene Fehlerdiagnose und den geplanten sicheren
   Rollback im Testkontext nachvollziehen. Reconnect nach neuer Revision
   prüfen. Erst dann den ausgewählten Kandidaten freigeben; nach Produktions-
   aktivierung dieselben normalen Nutzerwege nochmals kontrollieren.

Beleg je Prüfung: `erwartet`, `beobachtet`, `bestanden/nicht bestanden`,
Oberfläche, Zeitpunkt, Build/Revision und bereinigter Artefaktpfad. Nicht
ausführbare Prüfung bleibt offen; ein Simulatorbericht kann sie nicht
ersetzen. Produktionsdaten und reale Lernbewertungen sind keine Testfixtures.

## 5. Aktivierung, Monitoring und Rollback

Die neue profilbezogene Implementierung besitzt in diesem Runbook noch keine
belegte reale Host-Abnahme. Für diese Abnahme ist eine genehmigte kontrollierte
Test-/Canary-Umgebung mit dem vorgesehenen Hostzugang nötig. Nicht zuerst
blind den öffentlichen Produktionszugang umstellen und die danach nötige
Wiederverbindung als schon vorher bestandene Abnahme ausgeben. Ein fehlender
Testzugang ist ein konkreter operativer Restpunkt, keine allgemeine
Herstellerabhängigkeit.

1. Profilkonfiguration und reale Host-Abnahme vorbereiten. Fehlende Nachweise
   nur für das betroffene Profil offen führen.
2. Exakten Commit/Profilrevision festlegen, Datenbank wiederherstellbar sichern,
   additive OAuth-Migrationen prüfen. Lokaler Build ist keine Aktivierung.
3. Alte ungebundene Grants nie aufwerten. Bei Grant-Cutover neue OAuth-Zustimmung
   einplanen; eine neue Lernsession ersetzt diese nicht.
4. Einheitliche Revision je Profil auf allen Knoten bereitstellen.
   Vor-Policy-Binaries dürfen keine gleichwertige ungeprüfte Route offen halten.
5. Ausgewähltes Profil mit dem Beleggatter prüfen, gezielt freischalten und
   dieselbe Revision in Produktion nachprüfen. Andere Profile bleiben unabhängig.

`SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED=true` ist kein neuer
Freigabeschalter: Diese alte globale Einstellung wird mit Migrationshinweis
abgelehnt. Nach ausdrücklich geprüfter Profilkonfiguration die Einstellung
entfernen beziehungsweise auf den deprecated Default `false` setzen.
Persistierte frühere Sicherheitsmarker **nicht löschen**. Das neue Protokoll
schützt jedes Profil und erhält den Datenbankmarker als Sperre gegen alte
Kompatibilitäts-Binaries; es wertet frühere Grants nicht um. Alle Knoten müssen
die profilbezogene Policy kennen.

### Migrationsentscheidungen vor dem ersten Neustart

| Ausgangslage | Geplanter Übergang | Verpflichtende Folge |
| --- | --- | --- |
| Bestehendes dediziertes OpenAI-Basic-Profil | Zunächst unverändert Basic | Registrierung exakt validieren; alte unmarkierte Grants nur in der ersten Übergangslinie erlauben |
| Basic soll neben neuem JWT bestehen | JWT primär, bisheriger Basic-Client explizit unter `transitional-basic` | Alte Basic-ID/Secret/Callback/Revision erhalten; JWT separat abnehmen; keine vorhandenen Grants als JWT markieren |
| Früheres öffentliches Claude-Profil | Neues `claude-cimd-public` | Erneutes Verbinden einplanen; frühere Grants ohne Provenienz/Familie werden nicht übernommen |
| Claude Public soll neben Custom bleiben | Modus Custom, `public-cimd-enabled=true` | Eigene Custom-ID/Secret/Revision, unveränderte öffentliche Revision; beide Lanes getrennt nachweisen |
| Custom soll durch Anthropic-held ersetzt werden | Neues held-Profil mit eigener Identität | Erst echte Hinterlegung, neue Verbindung und eigene Abnahme; Custom-Testerfolg reicht nicht |
| Alte globale Einstellung ist `true` | Explizite unabhängige Profile | Vor Neustart Runtime-Preflight und bewusste Migration; nicht alte Datenbankmarker löschen |

Vorbereitungen: effektive **nicht geheime** Konfiguration und aktive
Profilrevisionen erfassen, Secret-Verfügbarkeit nur als vorhanden/fehlend
prüfen, unterstützte Binärstände aller Instanzen inventarisieren, Callback-
und Edge-Routing prüfen. Keine Ausgabe vollständiger systemd-Environment-
Blöcke oder Browserprofile anfordern. Die additive Datenbankmigration erfolgt
über Liquibase mit dem Backend, nicht durch manuelles Nachbauen der Tabellen.
Eine wiederherstellbare Datenbanksicherung vor Schema-/Policy-Cutover und ein
abgestimmtes Wiederverbindungsfenster gehören zur operativen Freigabe.

Bei einem Mischbetrieb können unterschiedliche Revisionen desselben Profils
nicht beide „aktuell“ sein: Die neue Revision sperrt die alte; ein alter
Prozess darf sie nicht zurückschreiben. Deshalb Instanzen koordinieren und
vorherigen Traffic gezielt drainen. Ein bloßer Binary-Rollback auf vor der
Policy liegenden Code ist **kein** Sicherheitsrollback. Datenbank-Restore
ist ein separates Wiederherstellungsereignis: Alte Tokens könnten dadurch
wieder erscheinen und müssen vor erneutem externem Zugang mit einer neuen
Policyrevision ausgeschlossen werden.

### Persistenz, Provenienz und Parallelität

OAuth-Zustand liegt dauerhaft in der gemeinsamen Datenbank. Ein JVM-Neustart
setzt weder Assertionverbrauch noch Profilstilllegung noch Familienwiderruf
zurück. Die Basisregistrierungen/-grants stammen aus Spring Authorization
Server; die zusätzlichen Liquibase-Schemata sind
[`030-add-oauth-client-security.yaml`](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/resources/db/changelog/changes/030-add-oauth-client-security.yaml)
und
[`032-add-claude-refresh-token-families.yaml`](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/resources/db/changelog/changes/032-add-claude-refresh-token-families.yaml).
Migrationnummern nicht von Hand umsortieren; der Master-Changelog bestimmt
die Ausführung.

| Zustand | Bedeutung / Lebensdauer |
| --- | --- |
| `oauth2_registered_client` | Persistierte Clientregistrierung, exakte Methoden/Callbacks/Scopes; vertrauliche Secrets nur bcrypt-kodiert |
| `oauth2_authorization` | Technischer Principal, Code-/Tokenzustand und ursprüngliche Grantattribute; diese Tabelle enthält sensible Zugangsdaten und gehört nicht in Diagnoseexports |
| `oauth_client_security_policy`, Zeile `id=1` | Gemeinsame Policy-Sperre und persistierter Schutz gegen alte Kompatibilitäts-Binaries; `authenticated_required=true` ist hier ein historischer Migrationsboden, nicht das neue Gebot eines Secrets für Claude Public |
| `oauth_client_auth_profile` | Aktueller Fingerprint unter dem Schlüssel `provider/profile`; unabhängige Profile dürfen parallel existieren |
| `oauth_client_retired_profile` | Dauerhafte stillgelegte Fingerprints; nicht löschen, um eine alte Revision wieder starten zu lassen |
| `oauth_client_assertion_lock`, Zeile `id=1` | Gemeinsame Sperre für atomaren, kapazitätsbegrenzten Assertionverbrauch |
| `oauth_client_assertion_replay` | SHA-256 über eindeutig zusammengesetzte Client-ID und `jti`, plus `retain_until`; keine rohe Assertion und keine rohe `jti` |
| `claude_v1_refresh_family` | Öffentlicher Claude-Grant als Familie, ursprüngliche registrierte Client-ID, Widerrufsstatus, Ablauf |
| `claude_v1_refresh_history` | SHA-256 jedes Refresh-Tokens dieser Familie und `consumed`; alte Hashes bleiben während der aktiven Familie erhalten |

Ein neuer Grant erhält die Attribute `skillpilot_oauth_client_policy`
(Fingerprint), `skillpilot_oauth_profile` und
`skillpilot_oauth_client_authentication_method`. Der Fingerprint bindet die
serverseitige Profilkonfiguration einschließlich nicht geheimer Revision;
die gemeinsame Policy bindet außerdem Profil-ID und Methode. Das ist
**Konfigurationsprovenienz**, kein Hash der Plugin-Datei. Secrets und bcrypt-
Salze sind nicht Bestandteil dieser Provenienz. Eine gezielte Invalidierung
erfolgt durch neue Profilrevision, nicht durch nachträgliches Stempeln alter
Grants.

`save` darf bei bestehenden Grants weder registrierten Client noch Principal
oder Granttyp ändern. Vorhandene Provenienz muss erhalten bleiben; ein alter
Code darf durch verspätete Consent-Schreibvorgänge nicht ersetzt, entfernt
oder reaktiviert werden. Nur ein tatsächlich neuer Grant wird neu gebunden.
Die eng begrenzte erste Basic-Migration lässt alte unmarkierte Grants
unmarkiert und verliert diese Ausnahme dauerhaft nach Stilllegung ihrer
Profilhistorie. Public Claude hat diese Ausnahme nicht.

Die Sperren schützen den **gesamten** entscheidenden Datenbankvorgang, nicht
nur einen vorherigen Token-Lookup:

| Vorgang | Transaktions-/Sperrvertrag |
| --- | --- |
| Profilinitialisierung/-prüfung/-Speicherung | Gemeinsame Policyzeile mit `FOR UPDATE`; aktiver und stillgelegter Fingerprint werden gegen denselben persistierten Zustand geprüft |
| Assertionverbrauch | Eigene `REQUIRES_NEW`-Transaktion, Assertion-Sperrzeile, Datenbankzeit; der Verbrauch bleibt auch nach später gescheitertem Codeaustausch gespeichert |
| Authorization-Codeaustausch | Eigene Transaktion: Policyzeile vor der konkreten Authorizationzeile sperren, dann per raw JDBC erneut lesen; Client-/Codebindung, PKCE und Tokenpersistenz bleiben im serialisierten Austausch |
| Öffentlicher Claude-Refresh | Eigene Transaktion: Familie → Policy → Authorization; Rotation und Tokenpersistenz innerhalb derselben Familiensperre |
| Bereits verbrauchter Code | Keine neue Ausgabe; eine nötige Revokation erst nach Verlassen der Code-Sperren über den geschützten Service ausführen, damit kein Authorization→Familie-Lockzyklus entsteht |
| RFC-7009-Widerruf | `OAuthTokenRevocationBoundary` lässt nur Access-/Refresh-Tokens nachschlagen, niemals Authorization Codes oder Consent-State; ein untypisierter Lookup wird auf diese zwei Tokentypen eingegrenzt |

Alle regulären Schreiber folgen Policy → Authorization; Familienoperationen
setzen die Familiensperre davor. Aktive, noch nicht ausgetauschte Codes haben
noch keine bestehende Tokenfamilie. Diese Annahme gehört zum Sicherheits-
vertrag; neue Grant-Schreiber müssen sie und die Unveränderlichkeit eines
vorhandenen Codes erhalten. Ein erfolgreich serialisierter Austausch bleibt
ein Einmalverbrauch; parallele oder spätere Wiederholung ist kein zweiter
erfolgreicher Login.

Bei öffentlichen Claude-Refresh-Tokens läuft die zweite Verwendung eines
verbrauchten Tokens so ab: Hash/Familie unter der ursprünglichen Client-ID
finden → Familie sperren → `revoked=true` schreiben → **committen** →
`invalid_grant` zurückgeben. Der Fehler darf den Widerruf nicht zurückrollen.
Familienprüfung gilt auch für den aktuellen Access-Token-Lookup. Ein fremder
Client oder unbekannter Token widerruft nicht die Familie eines anderen.
Dieser zusätzliche Familienmechanismus ist eine Garantie des öffentlichen
Claude-Profils; nicht ungeprüft als identischer Mechanismus aller anderen
Refresh-Profile darstellen.

Assertion-Einträge bleiben bis einschließlich Assertionablauf plus Uhrtoleranz
gesperrt. Abgelaufene Einträge werden strikt danach bereinigt. Volles Budget
oder nicht verfügbare Datenbank führen zur Ablehnung, nicht zu einem lokalen
Replay-Fallback. Öffentliche Refresh-Historie wird erst nach Ablauf der ganzen
Familie (mindestens bis zum spätesten aktuellen Access-/Refresh-Ablauf)
gelöscht: stündlich, maximal 200 Familien pro Durchlauf, mit Sperre und erneuter
Ablaufprüfung. Eine aktive Familie verliert keine alten Verbrauchsbelege.

### Monitoring und Diagnose

Monitoring je Profil: Code-/Refresh-Erfolg und Ablehnung, `invalid_client`,
`invalid_grant`, Replay/Familienwiderruf, JWKS-Fehler, gesperrte Revision,
MCP-401/403 und Latenzen. Nur Profil, Ergebnis, begrenzten Fehlergrund und
Korrelationskennung protokollieren; keine Tokens oder Request-Bodies.
Fehlende Telemetrie nicht als erfolgreich überwachten Betrieb ausweisen.

Die implementierte Diagnosebasis heißt `OAuthProfileDiagnostics`: feste
Provider-/Profillabels, `result`, begrenztes `reason`, HTTP-Status und neu
generierte `correlation_id`. Dieselbe Kennung steht im Antwortheader
`X-SkillPilot-Request-ID`; eingehende Kennungen werden nicht ungeprüft
übernommen. Vor einer vertrauenswürdigen Clientzuordnung bleibt das Profil
`unknown`. Ablehnungen werden auf WARN, normale HTTP-Abschlüsse auf DEBUG
erfasst. Für einen kontrollierten Verbindungsnachweis nur diesen Logger
gezielt aktivieren, nicht global Request-/Security-Debuglogging einschalten.
`http_completed` bescheinigt keinen fachlich erfolgreichen Lernvorgang.
Externes Dashboard, Alarme und Latenzauswertung benötigen zusätzlich ihre
eigene operative Einrichtung und Abnahme.

Die gemeinsame Readiness-Gruppe umfasst `readinessState,db`; die getrennte
Gruppe `openaiReadiness` zusätzlich `openAiDeCoach`. Damit darf ein ausschließlich
gestörtes OpenAI-JWT-Profil nicht die gesamte Anwendung samt Claude oder dem
konfigurierten Basic-Übergang aus dem gemeinsamen Traffic nehmen. Betreiber
müssen unterscheiden, welche Probe sie für welchen Eingang verwenden:
`/actuator/health/readiness` für die gemeinsame Instanz,
`/actuator/health/openaiReadiness` als zusätzliche OpenAI-Bereitschaftsdiagnose.
Eine grüne gemeinsame Probe ist **keine** OpenAI-Freigabe; eine gestörte
OpenAI-Probe darf nicht als globales Claude-Abschaltsignal verdrahtet werden.
Diese internen Betriebsproben nicht ungeschützt ins Internet stellen.

### Störungen und sichere Wiederherstellung

| Beobachtung | Gezielte Diagnose | Sichere Reaktion |
| --- | --- | --- |
| Nur JWT nicht verfügbar / `clientMetadataReady=false` | Zugelassene CIMD-/JWKS-Quelle, DNS/TLS, begrenzter Abruf, Metadatenpins und Uhr prüfen | JWT geschlossen lassen; Hintergrundprüfung beobachten; kein `none`-Fallback; andere aktive Profile unabhängig prüfen |
| `invalid_client` | Wirkliches Profil, exakt verwendete Methode, Client-/Callbackkonfiguration und Credential-Hinterlegung prüfen | Keine fremde Registrierung übernehmen; Secret nie in Logs kopieren; nur betroffene vertrauliche Lane koordiniert reparieren |
| `invalid_grant` nach Migration | Profilrevision, erwartetes Reconnectfenster, Ablauf/PKCE und Replay unterscheiden | Neuen regulären Verbindungsflow starten; keinen alten Grant nachmarkieren oder retired-Datensatz löschen |
| `REFRESH_REUSED` | Betroffene synthetisch/operativ identifizierte Verbindung und Korrelationskennungen prüfen; Token selbst nicht exportieren | Familie bleibt widerrufen; Hostverbindung neu aufbauen; bei Leck zusätzlich Credential-/Lernsession-Umfang klären |
| Datenbankfehler oder Lock-Timeout | DB-Erreichbarkeit, Migration, Transaktionsdauer und betroffene Instanzen prüfen | Fail-closed erhalten; keine In-Memory-Ersatzpolicy; betroffene Route nötigenfalls drainen und DB-Ursache beheben |
| MCP-401/403 trotz „verbunden“ | Access-Ablauf, Provider/Audience/Scope und danach getrennt Lernsession/State prüfen | OAuth-Reconnect und neue Lernsession nur jeweils bei deren tatsächlichem Fehler; keine Scope-/Sessionprüfung abschalten |
| Secret oder Zugang kompromittiert | Betroffene Clientregistrierung bzw. Verbindung begrenzen; Betriebsverantwortlichen einbeziehen | Clientzugang sperren/rotieren und bei nötiger Gesamtinvalidierung neue betroffene Profilrevision setzen; andere Profile nicht pauschal zurückstufen |

Incident-Reihenfolge: (1) Zeitpunkt, Build, Profil und bereinigte Fehlerbelege
sichern; (2) nur betroffenen Zugang begrenzen, bei unklarer Providerreichweite
alle zugehörigen Routen/Instanzen schließen; (3) Ursache und Credentialumfang
klären; (4) vorher akzeptierte Konfiguration mit erforderlicher **neuer**
Revision koordiniert bereitstellen; (5) neue Verbindung, negativen Altzugang,
unveränderte andere Profile und Lernbetrieb nachprüfen; (6) tatsächliche
Ergebnisse im Release-/Incidentbeleg festhalten. Keine automatischen
Produktionsänderungen aus einem Diagnosecheck ableiten.

### Profilbezogener Rollback

Rollback heißt gezielte Sperrung oder vorher akzeptierte Konfiguration
**mit neuer Profilrevision**, wenn die alte stillgelegt wurde. Alte Grants
dürfen nicht wieder gültig werden; betroffene Nutzer ggf. neu verbinden.
Andere Profile bleiben verfügbar. Keine JWT-/PKCE-/Token-/Sessionprüfung
abschalten, um einen Fehler zu umgehen.

Das Entfernen eines Profils aus einer ausdrücklich geladenen Provider-
Konfiguration stilllegt seine Revision. Ein auf einem neuen Prozess überhaupt
nicht geladener Provider wird dagegen nicht automatisch in der gemeinsamen
Datenbank stillgelegt: Andere dedizierte Prozesse dürfen ihn weiterhin
betreiben. Für eine vollständige Provider-Sperre deshalb dessen gesamte
Zugangsroute und alte Instanzen gezielt sperren/drainen; nicht annehmen, ein
lokales Feature-Flag widerrufe bereits alle anderen Verbindungen.

### Rotation

OpenAI mit zwei JWKS-Sätzen testen: neue `kid` nach begrenzter Aktualisierung
erkannt, entfernte Schlüssel nach Cache-/Überlappungszeit abgelehnt.
Abruffehler erlauben keinen Public-Fallback. Keine sofortige Revokation
behaupten, solange ein gültiger Cache den alten Schlüssel enthält.

Claude-Secrets auf allen Instanzen koordiniert wechseln. Jede Instanz bindet
sich an den bei Registrierung gespeicherten bcrypt-Wert; veraltete Knoten
müssen ablehnen. Bei Kompromittierung zusätzlich Profilrevision erhöhen und
Grants invalidieren. Bei Routine-Rotation Grants nur erhalten, wenn die Policy
das ausdrücklich zulässt. Custom-Rotation koordiniert der Betreiber;
Anthropic-held benötigt die tatsächliche Übergabe an Anthropic.

### ChatGPT-mTLS bleibt getrennt

Die bestehende V1-Edge gesondert prüfen: nur dedizierter OpenAI-Zugang,
vertrauenswürdige Zertifikatsprüfung, keine ungeprüften Identitätsheader.
`observe` beweist kein `enforce`. Vor Aktivierung akzeptierten/abgelehnten
Transport und ungestörten Claude-Zugriff nachweisen. Kein globaler
OpenAI-Zertifikatszwang auf dem Claude-Zugang.
[OpenAI: Authentication](https://developers.openai.com/plugins/build/auth)

## 6. Reproduzierbare automatisierte Nachweise

Der Workflow
[OAuth client authentication](https://github.com/enpasos/skillpilot/blob/main/.github/workflows/oauth-client-authentication.yml)
läuft bei relevanten Pushes/PRs, täglich und manuell. Er nutzt synthetische
Clients und wegwerfbares PostgreSQL 15; keine Produktionssecrets, realen
Lernprofile oder bezahlten Modellaufrufe.

| Ebene | Nachweis |
| --- | --- |
| Provider | Exakte Methoden/Clients, Discovery/Redirects, Code/PKCE, Refresh, JWT, MCP-/Providergrenzen |
| Policy | Unabhängige Profile, keine Grant-Aufwertung, persistierte Revision, kein Downgrade |
| Replay/Refresh | Einmalverbrauch, Rotation, Wiederverwendung, betroffener Familienwiderruf/Isolation |
| PostgreSQL | Echte Migration, konkurrierender Verbrauch, mehrere Instanzen/Neustart, persistierte Policy |
| CI-Gatter | Pflichtsuiten tatsächlich ausgeführt; fehlende/leere/übersprungene/fehlerhafte Berichte sind kein Pass |
| Release-Gatter | Gewähltes Profil, exakter Commit/Revision, unveränderte Artefakte, separate Host-Abnahme |

Mit Corretto aus `.java-version`/`.corretto-version` und Node aus `.nvmrc`:

```bash
node --test scripts/oauth_client_auth_ci.test.mjs scripts/check_oauth_profile_release.test.mjs
node --test scripts/validate_openai_v1_runtime_config.test.mjs
node scripts/check_oauth_profile_release.mjs
```

Backend-Testfilter stehen im Workflow. Für ausschließlich lokales wegwerfbares
PostgreSQL `SKILLPILOT_OAUTH_POSTGRES_TEST_ENABLED=true` sowie
`SKILLPILOT_OAUTH_TEST_POSTGRES_URL`, `..._USER` und `..._PASSWORD` konfigurieren.
Nie Produktions-DSNs verwenden. Das Fixture erstellt/entfernt nur sein eigenes
neues Schema. XML-/HTML-Berichte bleiben 30 Tage mit Commit-/Run-ID erhalten.
Lokales PostgreSQL 18.1 und CI-PostgreSQL 15 sind getrennte Nachweise. Eine
Backend-Suite beweist keine echte Herstellerintegration.

### Code- und Testanker für Review und Wartung

Die Links zeigen den Entwicklungszweig. Für eine Freigabe dieselben Pfade
im **belegten Commit** prüfen. Die benannten Klassen sind ausführbare
Regressionsnachweise, nicht ein Ersatz für das Lesen ihrer Assertions.

| Sicherheitsvertrag | Implementierung | Automatisierter Nachweis |
| --- | --- | --- |
| Unabhängige Revisionen, Migration, unveränderliche Grantidentität/-codes | [AuthenticatedClientPolicy](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/AuthenticatedClientPolicy.java) | [IndependentClientProfilePolicyTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/IndependentClientProfilePolicyTest.java) |
| Einmaliger Codeaustausch und Sperrreihenfolge | [OAuthAuthorizationCodeExchangeGuard](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/OAuthAuthorizationCodeExchangeGuard.java) | [OAuthAuthorizationCodeExchangeGuardTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/OAuthAuthorizationCodeExchangeGuardTest.java) |
| Widerruf umfasst Tokens, nicht Code oder State | [OAuthTokenRevocationBoundary](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/OAuthTokenRevocationBoundary.java) | [OAuthTokenRevocationBoundaryTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/OAuthTokenRevocationBoundaryTest.java) |
| Assertionverbrauch bleibt nach Fehler/Neustart gesperrt | [JdbcOAuthClientAssertionReplayStore](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/JdbcOAuthClientAssertionReplayStore.java) | [JdbcOAuthClientAssertionReplayStoreTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/JdbcOAuthClientAssertionReplayStoreTest.java) |
| Mehrere Instanzen, echte DB-Migration/-Sperren | Dieselben JDBC-Dienste; keine lokale Ersatzimplementierung | [OAuthClientSecurityPostgresIntegrationTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/OAuthClientSecurityPostgresIntegrationTest.java) |
| JWT und ausdrücklicher Basic-Übergang ohne Methodenfallback | [OpenAiDeOAuthConfiguration](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeOAuthConfiguration.java) und [OpenAiDeClientProfiles](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeClientProfiles.java) | [OpenAiDeClientProfilesTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeClientProfilesTest.java), [OpenAiDePrivateKeyJwtFlowIntegrationTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/openai/de/oauth/OpenAiDePrivateKeyJwtFlowIntegrationTest.java) |
| JWT-Signatur/Claims/Audience/Zeiten/Schlüssel | [OpenAiDeJwtClientAssertionValidator](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeJwtClientAssertionValidator.java) | [OpenAiDeJwtClientAssertionValidatorTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeJwtClientAssertionValidatorTest.java) |
| Begrenzte CIMD-Bereitschaft ohne globalen Ausfall | [OpenAiDeCimdMetadataGate](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeCimdMetadataGate.java), [application.yml](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/resources/application.yml) | [OpenAiDeCimdMetadataGateTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeCimdMetadataGateTest.java), [OpenAiDeCoachHealthIndicatorTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/openai/de/health/OpenAiDeCoachHealthIndicatorTest.java) |
| Claude-Profile und exakte Konfiguration | [ClaudeV1ClientPolicy](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1ClientPolicy.java), [ClaudeV1Properties](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/ClaudeV1Properties.java), [ClaudeV1OAuthConfiguration](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1OAuthConfiguration.java) | [ClaudeV1ConfidentialOAuthIntegrationTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1ConfidentialOAuthIntegrationTest.java), [ClaudeV1ConfidentialPostOAuthIntegrationTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1ConfidentialPostOAuthIntegrationTest.java) |
| Public-Claude-Rotation und Familienwiderruf | [ClaudeV1RefreshTokenFamilies](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1RefreshTokenFamilies.java), [ClaudeV1FamilyAuthorizationService](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1FamilyAuthorizationService.java) | [ClaudeV1PublicRefreshFamilyIntegrationTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1PublicRefreshFamilyIntegrationTest.java), [ClaudeV1RefreshTokenFamiliesTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1RefreshTokenFamiliesTest.java) |
| Providertrennung in gemeinsamen OAuth-Tabellen | [ProviderScopedOAuth2AuthorizationService](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/ProviderScopedOAuth2AuthorizationService.java) plus providergebundene Client-Repositories/Introspektoren | [CombinedProviderOAuthIsolationIntegrationTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/CombinedProviderOAuthIsolationIntegrationTest.java) |
| Geheimnisfreie, zuordenbare Diagnostik | [OAuthProfileDiagnostics](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/OAuthProfileDiagnostics.java) und [OAuthProfileDiagnosticsFilter](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/oauth/OAuthProfileDiagnosticsFilter.java) | [OAuthProfileDiagnosticsFilterTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/oauth/OAuthProfileDiagnosticsFilterTest.java) |

Die App-only-Principals sind direkt in
[OpenAiDeBindingAuthenticationFilter](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/openai/de/oauth/OpenAiDeBindingAuthenticationFilter.java)
und
[ClaudeV1AppAuthenticationFilter](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1AppAuthenticationFilter.java)
nachlesbar. Die danach weiterhin erforderliche Claude-Lernsessiongrenze steht
in
[ClaudeV1SessionCoordinator](https://github.com/enpasos/skillpilot/blob/main/backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1SessionCoordinator.java)
mit
[ClaudeV1SessionCoordinatorTest](https://github.com/enpasos/skillpilot/blob/main/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1SessionCoordinatorTest.java).
Änderungen an OAuth dürfen diese fachlich unabhängige Grenze nicht entfernen.

Bei Änderungen dieses Runbooks zusätzlich vom Repository-Wurzelverzeichnis:

```bash
npm --prefix app run check:docs-links
npm --prefix app run check:docs-indexes
git diff --check
```

Schema-/Linktests prüfen Konsistenz. Sie beweisen weder die Sicherheits-
korrektheit eines neuen Algorithmus noch einen echten Herstellerflow.

### Maschinenlesbare Release-Belege

[`contracts/oauth/client-profile-release.json`](https://github.com/enpasos/skillpilot/blob/main/contracts/oauth/client-profile-release.json)
führt jede Stufe separat. `null` bedeutet **kein an einen Release-Commit
gebundener Beleg**, nicht zwangsläufig fehlender Quellcode. Der Initialstand
behauptet keine neue Produktionsabnahme. Nur tatsächlich erhobene Belege
eintragen; bestehende Produktionszustände nicht nachträglich erfinden.

Zuerst den unveränderlichen Code-Kandidaten committen. Für die anschließende
Abnahme eine operative Kopie der Vorlage, etwa
`tmp/oauth-profile-release-evidence.json`, verwenden und mit `--ledger`
auswählen. Dadurch erfordert das Erfassen neuer Nachweise keinen neuen
Code-Commit, der die vorher geprüfte Build-ID wieder ändern würde. Die
bereinigten Belege anschließend mit dem freigegebenen Release archivieren.

Jede belegte Stufe enthält `commit`, `policyRevision`, `recordedAt` (UTC),
`result: "passed"`, ausgeführte `checks` und `evidence` mit repository-relativem
`path` plus SHA-256. Artefakte müssen bereinigt tatsächlich vorliegen.
JUnit/HTTP-Berichte tragen `technical`; ein echtes Abnahmeprotokoll trägt
`realHost`. Pflichtprüfungen stehen in `requiredHostChecks()` im Prüfer.

```bash
node scripts/check_oauth_profile_release.mjs \
  --ledger tmp/oauth-profile-release-evidence.json \
  --profile claude-cimd-public \
  --commit GEPRUEFTER_40_STELLIGER_COMMIT \
  --revision GEPRUEFTE_PROFILREVISION
```

Platzhalter vor Ausführung ersetzen. Nur das gewählte Profil wird auf
Bereitschaft geprüft; ausstehendes Anthropic-held ist kein Blocker. Das Gatter
führt **keinen Deploy oder Produktionskonfigurationswechsel** aus. Ein
Schema-/Hash-Check belegt unveränderte erfasste Beweise, nicht deren ehrliche
Erhebung: Der Verantwortliche muss Simulator und echten Host unterscheiden.
`production` erst nach tatsächlicher Aktivierung und Produktionsprüfung belegen.

## 7. Herstellerabhängige Restpunkte

Die [Hersteller-Arbeitspakete](oauth-provider-followups.md) führen konkrete
Frage, Status und ausschließlich betroffene Funktion. Allgemeine Erlaubnis-
fragen zu dokumentierten Verfahren und testbare Callback-/Methodenfragen
gehören nicht in langwierige Supportanfragen. Vorbereitete Entwürfe sind nicht
versandt; beantwortete Fragen sind noch keine erfolgreiche Integration.
