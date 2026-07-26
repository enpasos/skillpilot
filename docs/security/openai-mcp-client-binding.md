# OpenAI-MCP: Bindung an den zugelassenen Client

**Stand:** 26. Juli 2026  
**Status:** verbindlicher Basisschutz; mTLS ist eine optionale spätere Härtung

## 1. Schutzziel

Die SkillPilot-ID bleibt das vom Lernenden verwahrte Geheimnis, an dem sein
Lernstand hängt. Dieses Dokument behandelt ein davon unabhängiges Schutzziel:

> Ein fremder Client darf die lernendenbezogenen OpenAI-DE-MCP-APIs nicht
> nutzen, auch wenn er den öffentlichen Serververtrag kennt.

Die Schutzgrenze verändert weder SkillPilot-ID noch Lernziel-, Mastery-,
Curriculum- oder Coach-Semantik.

## 2. Getrennte Bindungen

| Bindung | Zweck | Verbindlicher Mechanismus |
| --- | --- | --- |
| Transport → SkillPilot-Rand | Vertraulichkeit und Serverauthentisierung für alle öffentlichen SkillPilot-Endpunkte | normales HTTPS/TLS am Reverse Proxy |
| konfigurierte OAuth-Clientregistrierung → Authorization Server | Der Code-Flow wird nur für die vorregistrierte Client-ID und Redirect-Allowlist zugelassen; im Basisprofil ist die öffentliche Client-ID selbst kein kryptografischer Identitätsnachweis | eines der beiden in Abschnitt 4 beschriebenen, explizit konfigurierten Clientprofile; immer exakte Client-ID, exakte Redirect-Allowlist und Authorization Code mit PKCE `S256` |
| Access Token → SkillPilot-MCP-Resource | Ein Token gilt nur für diesen Resource Server, den registrierten Client und die erlaubten Operationen | aktive Introspektion einschließlich Ablauf/Widerruf, exaktes `resource`/`aud`, Scope und registrierte Client-ID |
| OAuth-Subject → SkillPilot-Lernender | Der autorisierte Provider-Principal wird serverseitig einem Lernenden zugeordnet | einmaliger First-Party-Browser-Binding-Grant; keine ID im Chat oder Toolargument |
| Lernender → aktuelle Coach-Nutzung | Ein alter OAuth-Login allein schaltet den Lernstand nicht unbegrenzt frei | serverseitige, absolut auf 24 Stunden begrenzte Lernsession |
| OpenAI-Connector-Infrastruktur → MCP-Rand | Optionale zusätzliche Identifikation der OpenAI-Connector-Infrastruktur | ausschließlich bei aktivierter Härtung: verifiziertes mTLS mit OpenAI-CA-Kette, `clientAuth` und exaktem SAN `mtls.prod.connectors.openai.com` |

Keine einzelne Zeile ersetzt eine andere. OAuth bindet Principal, Resource und
Token an die konfigurierte Clientregistrierung; im Basisprofil authentisiert
die öffentliche Client-ID den Client jedoch nicht kryptografisch. OAuth
ersetzt außerdem nicht die 24h-Lernsession. Optionales mTLS authentisiert die
OpenAI-Connector-Infrastruktur am Netzrand, aber weder den Lernenden noch
automatisch die sichtbare SkillPilot-App.

## 3. Produktiver Kompatibilitätsmodus: TLS und OAuth

SkillPilot läuft produktiv zunächst mit normalem serverauthentisiertem HTTPS.
Für den eigentlichen MCP-Pfad

```text
/api/openai/de/mcp
/api/openai/de/mcp/**
```

ist ein gültiges OAuth-Access-Token zwingend. Der Resource Server prüft
Resource/Audience, Scopes, Clientregistrierung, Tokenstatus, Providerbindung
und die aktive 24h-Lernsession. Ohne Token bleibt der MCP-Pfad geschlossen.
Discovery, Authorization, Token, Callback und Browser-Binding bleiben über
normales HTTPS erreichbar, damit Browser den OAuth-Ablauf abschließen können.

Port 8787 und lokale Verifier-Ports dürfen nicht öffentlich erreichbar sein.
Der Reverse Proxy terminiert TLS und leitet ausschließlich die vorgesehenen
Pfade an den Backendprozess weiter.

### 3.1 Bewusste Restannahme im Kompatibilitätsmodus

Normales TLS authentisiert den SkillPilot-Server gegenüber dem Client, nicht
umgekehrt. Ein fremder Client, der ein gültiges, korrekt gebundenes
OAuth-Access-Token erlangt, wird im Basisschutz daher nicht allein anhand
seiner Netzwerkidentität abgewiesen. Diese Restannahme ist für den
Kompatibilitätsmodus ausdrücklich dokumentiert und wird durch kurze Token- und
Lernsessions, exakte Audience-/Scope-Prüfung, Widerruf und Protokollierung
begrenzt.

### 3.2 Optionale spätere Härtung: OpenAI-mTLS

mTLS kann später ausschließlich für den eigentlichen MCP-Pfad aktiviert
werden. Discovery, Authorization, Token, Callback und Browser-Binding dürfen
kein OpenAI-Clientzertifikat verlangen.

Wenn diese Härtung aktiviert ist, akzeptiert der Reverse Proxy den MCP-Aufruf
nur, wenn:

1. ein Clientzertifikat präsentiert wird;
2. es bis zur veröffentlichten OpenAI-Root-CA über die separat gepinnte
   `OpenAI-Connectors-mTLS-CA` validiert;
3. es für Extended Key Usage `clientAuth` gültig ist;
4. sein DNS-SAN exakt `mtls.prod.connectors.openai.com` ist;
5. sein Gültigkeitszeitraum stimmt.

Ein rotierendes Leaf-Zertifikat wird nicht gepinnt. Der Proxy verwirft
eingehende Zertifikats-/Verifikationsheader und erzeugt interne Header erst
nach erfolgreicher Prüfung selbst. Spring akzeptiert diese Header nur von
explizit konfigurierten numerischen Proxy-Adressen. Port 8787 und der lokale
Verifier-Port dürfen nicht öffentlich erreichbar sein.

Die optionale deploybare Umsetzung und CA-Rotation stehen in
[openai-mcp-edge-mtls.md](../deploy/openai-mcp-edge-mtls.md).

Die Härtung wird fail-closed betrieben: Ist sie konfiguriert, aber Zertifikat,
Proxyvertrauen oder Headerprüfung fehlen, startet der OpenAI-DE-Provider nicht
beziehungsweise der MCP-Aufruf wird abgewiesen. Eine fehlerhafte
mTLS-Konfiguration fällt niemals still auf den TLS-Basisschutz zurück.

## 4. Unterstützte OAuth-Clientprofile

SkillPilot unterstützt genau zwei sichere, bewusst ausgewählte Profile. Ein
Deployment konfiguriert genau eines davon. In beiden Profilen sind offene
Dynamic Client Registration, ungeprüfte Redirect-URIs und ein stiller
Fallback auf einen anderen Client unzulässig.

### 4.1 Verbindliches Basisprofil: vorregistrierter Public Client

Dieses Profil ist der produktive Mindestvertrag:

- die Client-ID ist ein fester, vorab registrierter, nicht geheimer Wert;
- der Token-Endpunkt verwendet
  `token_endpoint_auth_method=none`;
- es gibt kein Client-Secret;
- Authorization Code mit PKCE `S256` ist zwingend;
- jede erlaubte Redirect-URI ist exakt vorregistriert;
- Resource/Audience und Scopes werden exakt geprüft;
- der MCP-Rand ist über normales HTTPS erreichbar und verlangt ein gültiges,
  passend gebundenes OAuth-Access-Token.

`none` bedeutet hier nicht „anonymer Client“. Es bezeichnet den
standardkonformen Public-Client-Code-Flow ohne Client-Secret. Die Client-ID ist
dabei öffentlich und kein Besitznachweis. Die statische Registrierung und die
exakte Callback-Allowlist begrenzen den akzeptierten Vertrag; PKCE bindet die
Einlösung des Authorization Codes an den passenden Code Verifier aus dem
Authorization Request, nicht kryptografisch an eine eindeutig identifizierte
App. Optionales OpenAI-mTLS kann diese Grenze später um eine
Netzwerkidentifikation der OpenAI-Connector-Infrastruktur ergänzen.

### 4.2 Optionales stärkeres Profil: CIMD mit `private_key_jwt`

Wenn ChatGPT für die konkrete Verbindung eine stabile HTTPS-CIMD-Identität
bereitstellt und das Deployment dieses Profil ausdrücklich auswählt, kann
SkillPilot zusätzlich kryptografische Clientauthentisierung verwenden:

- `client_id` ist die exakt konfigurierte HTTPS-CIMD-URL;
- die öffentliche JWKS-URL ist HTTPS und hat dieselbe Origin;
- der Token- und Revocation-Endpunkt akzeptiert ausschließlich
  `private_key_jwt`;
- die Client Assertion muss mit dem konfigurierten asymmetrischen Algorithmus
  signiert sein und mindestens `iss`, `sub`, `aud`, `exp` und `jti` sowie
  einen nichtleeren `kid`-Header korrekt enthalten;
- `iss` und `sub` entsprechen der exakten CIMD-Client-ID;
- `aud` adressiert den SkillPilot-Authorization-Server;
- `jti` wird innerhalb des Assertion-Zeitfensters nur einmal akzeptiert;
- CIMD-Dokument, JWKS und Redirect-Allowlist werden beim Start fail-closed
  validiert.

Dieses Profil verstärkt die OAuth-Clientbindung, ist aber keine Voraussetzung
für das sichere Basisprofil. ChatGPT dokumentiert ausdrücklich beide
Clientauthentisierungsmethoden: `private_key_jwt`, wenn der Authorization
Server sie unterstützt und dieses Profil gewählt ist, andernfalls `none` für
einen Public Client mit PKCE.

### 4.3 Reichweite der Aussage

Optionales mTLS weist die OpenAI-Connector-Infrastruktur nach. Das optionale
`private_key_jwt` weist zusätzlich die Kontrolle über die konfigurierte
CIMD-Clientidentität nach. Ohne eine ausdrückliche Provider-Garantie beweist
keines dieser Verfahren kryptografisch den sichtbaren Anzeigenamen
„SkillPilot Coach (Deutsch)“ gegenüber jeder anderen App derselben
Provider-Infrastruktur. Im Basisprofil ist die feste `client_id` eine
Registrierungsreferenz und kein kryptografischer Besitznachweis.

## 5. Resource- und Tokenbindung

Der Authorization Request und der Token Request führen

```text
resource=https://skillpilot.com/api/openai/de/mcp
```

durch den gesamten OAuth-Ablauf. SkillPilot bindet das resultierende Token
exakt an diese Audience. Der MCP Resource Server prüft bei jedem Aufruf:

- Tokenexistenz, Ablauf und Widerruf;
- erwarteten Aussteller;
- exakte Resource/Audience ohne tolerierte Varianten;
- erforderlichen Read- oder Write-Scope;
- konfigurierte Clientregistrierung (`client_id`);
- aktive, nicht widerrufene Providerverbindung;
- aktive 24h-Lernsession.

Der Toolvertrag nimmt weder `skillpilotId` noch ein vom Modell erzeugbares
Identitätsargument entgegen.

## 6. Fail-closed Secure Mode

Der normale OpenAI-DE-Provider kann nur im Secure Mode starten. Ein explizites
`false` ist bei aktiviertem Provider keine Ausweichkonfiguration, sondern ein
Startfehler. Unsichere Testbindungen dürfen nur in isolierten
Komponententests geladen werden, die den normalen Provider nicht aktivieren.

Gemeinsam für beide Profile prüft der sichere Start:

- Client-ID und Redirect-Allowlist sind nicht leer;
- Redirect-URIs, MCP-Resource und OAuth-Endpunkte sind exakte HTTPS-Werte;
- Authorization Code mit PKCE `S256` ist erforderlich;
- genau das konfigurierte Clientauthentisierungsverfahren wird veröffentlicht;
- offene DCR wird nicht veröffentlicht.

Für das Basisprofil muss die feste Client-ID vorregistriert sein und
`none` darf weder Client-Secret noch JWKS-Konfiguration enthalten.

Für das optionale stärkere Profil kommen die CIMD-, JWKS-, Assertion- und
Replay-Prüfungen aus Abschnitt 4.2 hinzu. Das CIMD-Dokument wird per HTTPS,
ohne Redirects, mit kurzen Timeouts und harter Größenbegrenzung geladen.
Netzwerkfehler, abweichende Metadaten oder ein Fallback auf `none` brechen
dieses Profil ab.

Nur wenn die optionale mTLS-Härtung aktiviert ist, prüft der sichere Start
zusätzlich:

- mindestens eine explizite numerische Trusted-Proxy-Adresse ist gesetzt;
- die interne Zertifikatsbestätigung wird ausschließlich von diesen Proxys
  akzeptiert;
- fehlende oder widersprüchliche mTLS-Konfiguration führt zum Startfehler;
- ein stiller Rückfall auf den TLS-Basisschutz ist ausgeschlossen.

Der `jti`-Replay-Schutz für `private_key_jwt` ist in der aktuellen
Ein-Instanz-Architektur pro Backendprozess gespeichert und hart begrenzt. Vor
einer horizontalen Skalierung muss er durch einen atomaren, gemeinsam
genutzten TTL-Speicher ersetzt werden.

## 7. Clientwechsel und Widerruf

Das Basisprofil mit einem vorregistrierten Public Client ist kein
„Legacy-Modus“. Eine Legacy-Cutover-Allowlist ist nur dann nötig, wenn die
konfigurierte Client-ID tatsächlich gewechselt wird, etwa beim Umstieg auf
CIMD.

Für einen solchen einmaligen Wechsel entfernt SkillPilot ausschließlich die
explizit allowlisteten alten Clientregistrierungen und deren:

1. OAuth Authorizations einschließlich Access-/Refresh-Token und Codes;
2. Consents;
3. die alte registrierte Clientzeile;
4. Providerverbindungen, Lernsessions und Pending Launches.

Andere Provider und nicht allowlistete Clients bleiben unberührt. Betroffene
Lernende autorisieren den neuen Client einmal neu. Ein Rollback auf die alte
Client-ID reaktiviert keine widerrufenen Token.

## 8. Betriebs- und Negativtests

Vor Freigabe müssen gemeinsam für beide Profile mindestens folgende Fälle
objektiv scheitern:

- direkte Umgehung des Proxys zu Port 8787;
- MCP-Aufruf ohne Access Token;
- Token Request mit fremder Client-ID;
- falsche Redirect-URI oder fehlender PKCE-Nachweis;
- fehlende oder falsche Resource/Audience;
- fehlender Scope;
- revoziertes/abgelaufenes Token oder abgelaufene Lernsession.

Profilabhängig gilt zusätzlich:

- Basisprofil: Client-Secret, JWKS- oder Assertion-Konfiguration wird
  abgelehnt;
- CIMD-Profil: `none`, Client Secret, ungültige/abgelaufene/wiederverwendete
  Assertion und abweichende CIMD-/JWKS-Metadaten werden abgelehnt.

Wenn die optionale mTLS-Härtung aktiviert ist, müssen zusätzlich scheitern:

- direkter Internetzugriff auf MCP ohne Clientzertifikat;
- fremdes, selbstsigniertes oder anders ausgestelltes Zertifikat;
- korrekt verkettetes Zertifikat mit falschem SAN oder ohne `clientAuth`;
- gefälschte interne mTLS-Header über den öffentlichen Rand.

Positiv wird der komplette OAuth- und MCP-Ablauf über die verbundene
produktive ChatGPT-App getestet. Bei aktivierter mTLS-Härtung wird zusätzlich
der vollständige Zertifikatspfad objektiv geprüft.

## 9. Vertrauensgrenze und Restannahmen

Der Basisschutz schließt anonyme und unzureichend autorisierte Zugriffe auf den
MCP-Rand aus. Er ist jedoch keine kryptografische Attestation genau der
sichtbaren SkillPilot-App. Er schützt nicht gegen:

- eine Kompromittierung des SkillPilot-Hosts oder Reverse Proxys;
- den Verlust einer SkillPilot-ID durch den Lernenden;
- eine absichtlich vom Lernenden autorisierte Nutzung über die zugelassene
  ChatGPT-OAuth-Clientregistrierung;
- einen fremden Client, der ein gültiges, passend gebundenes OAuth-Token
  kontrolliert;
- eine andere App derselben Provider-Infrastruktur, falls der Provider keine
  app-eindeutige kryptografische Attestation garantiert.

Optionales mTLS reduziert den dritten Punkt auf Zugriffe aus der zugelassenen
OpenAI-Connector-Infrastruktur, beweist aber weiterhin nicht automatisch den
sichtbaren App-Namen. Diese Risiken benötigen jeweils andere Kontrollen und
dürfen nicht durch zusätzliche technische Schlüssel im Chat kompensiert
werden.

## 10. Normative Provider-Referenzen

- [OpenAI: Client identification](https://developers.openai.com/plugins/build/auth#client-identification)
- [OpenAI: Client registration und Authentisierung](https://developers.openai.com/plugins/build/auth#client-registration)
- [OpenAI: Mutual TLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)
- [OpenAI: Resource-/Audience-Bindung](https://developers.openai.com/plugins/build/auth#echo-the-resource-parameter-throughout-the-oauth-flow)
