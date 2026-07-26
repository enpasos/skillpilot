# OpenAI-MCP: Bindung an den zugelassenen Client

**Stand:** 26. Juli 2026  
**Status:** verbindliche Sicherheitsarchitektur für `SkillPilot Coach (Deutsch)`

## 1. Schutzziel

Die SkillPilot-ID bleibt das vom Lernenden verwahrte Geheimnis, an dem sein
Lernstand hängt. Dieses Dokument behandelt ein davon unabhängiges Schutzziel:

> Ein fremder Client darf die lernendenbezogenen OpenAI-DE-MCP-APIs nicht
> nutzen, auch wenn er den öffentlichen Serververtrag kennt oder sich eine
> eigene OAuth-Clientregistrierung anlegen möchte.

Die Schutzgrenze verändert weder SkillPilot-ID noch Lernziel-, Mastery-,
Curriculum- oder Coach-Semantik.

## 2. Getrennte Bindungen

| Bindung | Zweck | Verbindlicher Mechanismus |
| --- | --- | --- |
| OpenAI-Connector-Infrastruktur → MCP-Rand | Nur der von OpenAI betriebene Connector erreicht den eigentlichen MCP-Endpunkt | mTLS mit der veröffentlichten OpenAI-CA-Kette, `clientAuth` und exaktem SAN `mtls.prod.connectors.openai.com` |
| stabile ChatGPT-OAuth-Clientidentität → Authorization Server | Nur der fest konfigurierte, kryptografisch nachgewiesene ChatGPT-OAuth-Client kann Codes gegen Token tauschen oder Token widerrufen | exakte HTTPS-CIMD-`client_id`, `private_key_jwt`, öffentliche JWKS derselben Origin und exakte Redirect-Allowlist |
| Access Token → SkillPilot-MCP-Resource | Ein Token gilt nur für diesen Resource Server, den registrierten Client und die erlaubten Operationen | aktive Introspektion einschließlich Ablauf/Widerruf, exaktes `resource`/`aud`, Scope und registrierte Client-ID |
| OAuth-Subject → SkillPilot-Lernender | Der autorisierte Provider-Principal wird serverseitig einem Lernenden zugeordnet | einmaliger First-Party-Browser-Binding-Grant; keine ID im Chat oder Toolargument |
| Lernender → aktuelle Coach-Nutzung | Ein alter OAuth-Login allein schaltet den Lernstand nicht unbegrenzt frei | serverseitige, absolut auf 24 Stunden begrenzte Lernsession |

Keine einzelne Zeile ersetzt eine andere. Insbesondere authentisiert mTLS die
OpenAI-Connector-Infrastruktur, aber nicht den Lernenden; OAuth authentisiert
und autorisiert den Client und den Principal, ersetzt aber nicht die
24h-Lernsession.

## 3. MCP-Rand: mTLS

Nur der eigentliche MCP-Pfad

```text
/api/openai/de/mcp
/api/openai/de/mcp/**
```

verlangt ein OpenAI-Clientzertifikat. Discovery, Authorization, Token, Callback
und Browser-Binding bleiben ohne Clientzertifikat erreichbar, weil Browser den
OAuth-Ablauf sonst nicht abschließen könnten.

Der Reverse Proxy akzeptiert den MCP-Aufruf nur, wenn:

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

Die deploybare Umsetzung und CA-Rotation stehen in
[openai-mcp-edge-mtls.md](../deploy/openai-mcp-edge-mtls.md).

## 4. Stabile ChatGPT-OAuth-Clientbindung und app-spezifische Eingrenzung

Im sicheren Produktionsmodus gilt:

- `client_id` ist die exakte HTTPS-URL des von ChatGPT veröffentlichten und
  für diese Verbindung konfigurierten Client-ID-Metadatendokuments (CIMD);
- SkillPilot lädt die öffentliche JWKS von der konfigurierten HTTPS-URL
  derselben Origin;
- der Token-Endpunkt akzeptiert ausschließlich `private_key_jwt`;
- die Client Assertion muss mit dem konfigurierten asymmetrischen Algorithmus
  signiert sein und mindestens `iss`, `sub`, `aud`, `exp`, `jti` und `kid`
  korrekt enthalten;
- `iss` und `sub` müssen der exakten CIMD-Client-ID entsprechen;
- `aud` muss den SkillPilot-Authorization-Server adressieren;
- `jti` wird innerhalb des Assertion-Zeitfensters nur einmal akzeptiert;
- Redirect-URIs müssen exakt in der produktiven Allowlist stehen;
- offene Dynamic Client Registration wird nicht veröffentlicht oder
  akzeptiert;
- `none` und allgemeine Client-Secrets sind im Secure Mode unzulässig.

Damit genügt weder eine beliebige SkillPilot-ID noch ein selbst registrierter
OAuth-Client, um Token für den Produktivvertrag zu erhalten.

Diese Aussage darf nicht weiter ausgelegt werden: mTLS weist die
OpenAI-Connector-Infrastruktur nach; CIMD und `private_key_jwt` weisen die
Kontrolle über die konfigurierte stabile ChatGPT-OAuth-Clientidentität nach.
Ohne eine vom Provider ausdrücklich zugesicherte app-eindeutige Attestation
beweisen diese Merkmale nicht kryptografisch den Anzeigenamen
„SkillPilot Coach (Deutsch)“ gegenüber jeder anderen App auf derselben
Provider-Infrastruktur. Die exakte Callback-, Resource- und Scope-Allowlist
grenzt den konkreten SkillPilot-Vertrag ein, ersetzt aber keine solche
Provider-Attestation.

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
- registrierte Clientidentität;
- aktive, nicht widerrufene Providerverbindung;
- aktive 24h-Lernsession.

Der Toolvertrag nimmt weder `skillpilotId` noch ein vom Modell erzeugbares
Identitätsargument entgegen.

## 6. Fail-closed Secure Mode

Der normale OpenAI-DE-Provider kann nur im Secure Mode starten. Ein explizites
`false` ist bei aktiviertem Provider keine Ausweichkonfiguration, sondern ein
Startfehler. Unsichere Legacy-Bindings dürfen nur in isolierten
Komponententests geladen werden, die den normalen Provider nicht aktivieren.

Vor Cutover und Clientregistrierung lädt SkillPilot bei jedem sicheren Start
das konfigurierte CIMD-Dokument neu: per HTTPS, ohne Redirects, mit kurzen
Verbindungs-/Request-Timeouts und harter Größenbegrenzung. Akzeptiert werden
nur 2xx, ein JSON-Content-Type und ein JSON-Objekt, das die gepinnten Werte
bestätigt. Der Start bricht ab, wenn eine der folgenden Bedingungen fehlt:

- `private_key_jwt`;
- gültige HTTPS-CIMD-Client-ID und gleich-originige HTTPS-JWKS;
- asymmetrischer Signaturalgorithmus und Replay-Schutz;
- mTLS-Edge und mindestens eine explizite numerische Trusted-Proxy-Adresse;
- exakte Redirect-URIs, Resource und OAuth-Konfiguration.

Das CIMD-Dokument muss zusätzlich eine zum Dokument identische `client_id`,
einen nichtleeren `client_name`, sämtliche konfigurierten Redirect-URIs, die
exakt gepinnte gleich-originige `jwks_uri` und `private_key_jwt` veröffentlichen.
Offene DCR, `none`, Redirect-Following oder ein stiller Fallback sind nicht
zulässig.

Der Modus ist absichtlich kein stilles Best-Effort-Feature. Ein öffentlich
erreichbarer MCP-Endpunkt mit nur halb aktivierter Clientbindung gilt als nicht
betriebsbereit.

Der `jti`-Replay-Schutz für `private_key_jwt` ist in der aktuellen
Ein-Instanz-Architektur pro Backendprozess gespeichert und hart begrenzt. Vor
einer horizontalen Skalierung muss er durch einen atomaren, gemeinsam genutzten
TTL-Speicher ersetzt werden; mehrere unabhängige Prozess-Caches wären kein
ausreichender clusterweiter Replay-Schutz.

## 7. Einmaliger Cutover vom Legacy-Client

Der frühere öffentliche `none`-Client darf nach dem Cutover keine
wiederverwendbaren Token behalten. Der sichere Start akzeptiert deshalb nur
eine explizite Allowlist ehemaliger OpenAI-DE-Client-IDs und entfernt für genau
diese Clients transaktional und idempotent:

1. zugehörige OAuth Authorizations einschließlich Access-/Refresh-Token und
   Codes;
2. Consents;
3. die registrierten Legacy-Clients;
4. nur die zu diesen Principals gehörenden OpenAI-DE-Verbindungen,
   Lernsessions und Pending Launches.

Andere Provider und nicht allowlistete Clients bleiben unberührt. Nach diesem
Schritt müssen betroffene Lernende die neue App einmal neu autorisieren. Ein
Rollback auf den alten Client reaktiviert keine alten Token.

## 8. Betriebs- und Negativtests

Vor Freigabe müssen mindestens folgende Fälle objektiv scheitern:

- direkter Internetzugriff auf MCP ohne Clientzertifikat;
- fremdes, selbstsigniertes oder anders ausgestelltes Zertifikat;
- korrekt verkettetes Zertifikat mit falschem SAN oder ohne `clientAuth`;
- gefälschte interne mTLS-Header über den öffentlichen Rand;
- direkte Umgehung des Proxys zu Port 8787;
- Token Request mit `none`, Client Secret oder fremder Client-ID;
- ungültige, abgelaufene oder wiederverwendete Client Assertion;
- falsche Redirect-URI;
- fehlende oder falsche Resource/Audience;
- fehlender Scope;
- revoziertes/abgelaufenes Token oder abgelaufene Lernsession.

Positiv wird der komplette OAuth- und MCP-Ablauf ausschließlich über die
verbundene produktive ChatGPT-App getestet, weil nur die
OpenAI-Connector-Infrastruktur das passende Clientzertifikat und den privaten
Schlüssel der veröffentlichten CIMD-/JWKS-Identität besitzt.

## 9. Vertrauensgrenze und Restannahmen

Die Kombination verhindert einen fremden Netzwerk- oder OAuth-Client. Sie
schützt nicht gegen:

- eine Kompromittierung des SkillPilot-Hosts oder Reverse Proxys;
- eine Kompromittierung der zugelassenen OpenAI-Connector-Infrastruktur;
- den Verlust einer SkillPilot-ID durch den Lernenden;
- eine absichtlich vom Lernenden autorisierte Nutzung über die zugelassene
  ChatGPT-OAuth-Clientidentität;
- eine andere App derselben Provider-Infrastruktur, falls der Provider keine
  app-eindeutige kryptografische Attestation garantiert.

Diese Risiken benötigen jeweils andere Kontrollen und dürfen nicht durch
zusätzliche technische Schlüssel im Chat kompensiert werden.

## 10. Normative Provider-Referenzen

- [OpenAI: Client identification](https://developers.openai.com/plugins/build/auth#client-identification)
- [OpenAI: Client registration mit CIMD und `private_key_jwt`](https://developers.openai.com/plugins/build/auth#client-registration)
- [OpenAI: Mutual TLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)
- [OpenAI: Resource-/Audience-Bindung](https://developers.openai.com/plugins/build/auth#echo-the-resource-parameter-throughout-the-oauth-flow)
