# OpenAI-MCP-App: OAuth-, Lernenden- und 24h-Sitzungsbindung

**Stand:** 26. Juli 2026
**Status:** verbindliche Zielarchitektur für den deutschen OpenAI-MCP-Coach

Dieses Dokument ist die fachliche und sicherheitstechnische Quelle der Wahrheit
für die Identitäts- und Sitzungsbindung der App **SkillPilot Coach (Deutsch)**.
Es trennt bewusst fünf Dinge, die nicht als ein gemeinsamer „Session-Token“
behandelt werden dürfen:

1. die per mTLS nachgewiesene OpenAI-Connector-Infrastruktur am MCP-Rand;
2. die konfigurierte stabile ChatGPT-OAuth-Clientidentität über CIMD und
   `private_key_jwt`;
3. die OAuth-Verbindung zwischen ChatGPT-Konto und SkillPilot;
4. die serverseitige Zuordnung dieser Verbindung zu genau einer SkillPilot-ID;
5. die davon unabhängige, absolut auf 24 Stunden begrenzte Lernsession.

Der Benutzer kopiert oder übermittelt in diesem Ablauf **keinen** technischen
Schlüssel. Insbesondere erscheinen weder SkillPilot-ID, OAuth-Token,
Binding-Grant noch Lernsession-ID im Chat, in Toolargumenten oder in einer
Startnachricht.

## 1. Verbindliche Begriffe und Zuständigkeiten

| Objekt | Zuständigkeit | Bedeutung | Typische Lebensdauer |
| --- | --- | --- | --- |
| OpenAI-mTLS-Transport | OpenAI und SkillPilot-Edge | Nachweis, dass der MCP-Aufruf aus der OpenAI-Connector-Infrastruktur kommt | Zertifikatsrotation durch OpenAI |
| OAuth-Client | App-Autor und ChatGPT | Exakt zugelassenes HTTPS-CIMD-Metadatendokument mit `private_key_jwt`, öffentlichem JWKS und exakten Redirect-URIs | vom Provider veröffentlichte Clientidentität |
| Binding Grant | SkillPilot und Browser | Einmalige Verknüpfung des angemeldeten SkillPilot-Lernenden mit einem neu beginnenden OAuth-Ablauf | höchstens 5 Minuten |
| OAuth-Subject / Verbindung | SkillPilot | Opake Provideridentität, die serverseitig auf genau eine SkillPilot-ID zeigt | bis Widerruf |
| Access Token | ChatGPT und SkillPilot OAuth | Kurzlebige Autorisierung eines MCP-Aufrufs | 30–60 Minuten |
| Refresh Token | ChatGPT und SkillPilot OAuth | Erneuert Access Tokens ohne erneute Benutzereingabe | höchstens 30 Tage, rotierend |
| Lernsession | ausschließlich SkillPilot | Zeitlich begrenzte Freigabe des zuvor vorbereiteten autoritativen Lernendenzustands | **absolut höchstens 24 Stunden** |
| Chat-Konversation | ChatGPT | Sichtbarer Dialog des Benutzers | vom Provider verwaltet, für SkillPilot nicht verlässlich identifizierbar |

Diese Objekte dürfen weder in Code noch Dokumentation synonym als „Session“
bezeichnet werden. Insbesondere ist ein OAuth Access Token keine Lernsession,
und die 24h-Lernsession ist kein vom Modell zu transportierender Bearer Token.

## 2. Sicherheitsmodell der App-Verbindung

Der deutsche Coach verwendet OAuth 2.1 Authorization Code mit PKCE `S256`.
ChatGPT ist der OAuth-Client. Der produktive Client ist kein frei
registrierbarer Public Client: Seine `client_id` ist das exakt zugelassene
HTTPS-CIMD-Metadatendokument der konfigurierten ChatGPT-Clientidentität. Beim Token-Austausch weist
ChatGPT den Besitz des dazugehörigen privaten Schlüssels mit
`private_key_jwt` nach; SkillPilot lädt ausschließlich das konfigurierte
gleichursprüngliche JWKS, prüft Signatur, Algorithmus, `kid`, `iss`, `sub`,
Audience, Ablauf und einmaliges `jti`.

Nach erfolgreichem Code-Austausch verwaltet ChatGPT Access- und Refresh-Token
und sendet bei jedem MCP-Aufruf automatisch:

```http
Authorization: Bearer <access-token>
```

Der Token wird weder vom Benutzer kopiert noch dem Modell als Toolargument
gegeben. SkillPilot prüft bei jedem geschützten MCP-Aufruf mindestens:

- Signatur beziehungsweise Introspektion des opaken Tokens;
- Aussteller;
- die erwartete, registrierte CIMD-Clientidentität;
- exakte Audience/Resource
  `https://skillpilot.com/api/openai/de/mcp`;
- Ablauf und Widerruf;
- den für das Tool erforderlichen Read- oder Write-Scope.

Offene Dynamic Client Registration ist im Produktionsvertrag nicht
vorhanden. `none` ist keine zulässige produktive
Token-Endpunkt-Authentisierung. Client-ID, Redirect-URI, JWKS-Origin,
Signaturalgorithmus, Resource und Scopes sind Allowlist-Werte, keine frei
wählbaren Eingaben.

Zusätzlich verlangt der Reverse Proxy ausschließlich für den eigentlichen
MCP-Verkehr unter `/api/openai/de/mcp` ein gültiges OpenAI-Clientzertifikat.
Geprüft werden die Kette bis zur OpenAI-Connectors-mTLS-CA, Gültigkeit,
Extended Key Usage `clientAuth` und der exakte SAN
`mtls.prod.connectors.openai.com`. Ein einzelnes rotierendes Leaf-Zertifikat
wird nicht gepinnt. Discovery-, Authorization-, Token- und Browser-Binding-
Endpunkte bleiben ohne Clientzertifikat erreichbar, weil Browser dort den
OAuth-Ablauf durchführen.

mTLS identifiziert die OpenAI-Connector-Infrastruktur. CIMD plus
`private_key_jwt` bindet den OAuth-Ablauf zusätzlich an die konfigurierte
stabile ChatGPT-OAuth-Clientidentität. Das ist ohne eine ausdrückliche
Provider-Garantie keine kryptografische Attestation des sichtbaren
App-Namens gegenüber jeder anderen App derselben Infrastruktur. Exakte
Callback-, Resource- und Scope-Allowlisten grenzen den SkillPilot-Vertrag
weiter ein. OAuth bindet anschließend den Benutzer, und die 24h-Lernsession
erteilt die zeitlich begrenzte fachliche Freigabe. Keine dieser Schichten
ersetzt eine andere.

Der Backend-Port ist nur auf Loopback gebunden. Der Reverse Proxy entfernt
eingehende mTLS-Verifikationsheader und setzt interne Header erst nach
erfolgreicher Zertifikatsprüfung selbst. Damit kann ein fremder Client weder
den Proxy-Schutz umgehen noch durch selbst gesetzte Header vortäuschen, von
OpenAI zu stammen.

Der produktive MCP-Vertrag benötigt keinen statischen Bearer Token, den der
App-Autor in ChatGPT hinterlegt. Außer Discovery, Authorization, Token und den
für den Browser-Binding-Ablauf ausdrücklich freigegebenen Endpunkten sind
lernendenbezogene Funktionen nur über die vollständige Kette aus
mTLS-verifiziertem MCP-Transport und gültigem OAuth Access Token erreichbar.

Die operative Umsetzung, Negativtests und Rotation stehen in
[OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md) und
[OpenAI-MCP-mTLS am Edge](../../deploy/openai-mcp-edge-mtls.md).

## 3. Automatische Lernendenbindung im Browser

Die dauerhafte SkillPilot-ID darf weder aus Chattext noch aus einem Modellaufruf
übernommen werden. Die erstmalige Zuordnung erfolgt ausschließlich im
First-Party-Browserkontext von `skillpilot.com`:

1. Der Benutzer öffnet in SkillPilot sein pseudonymes Lernendenprofil und klickt
   auf **Lernen starten**.
2. SkillPilot erzeugt einen kryptografisch zufälligen, einmaligen Binding Grant,
   speichert nur dessen Hash und ordnet ihm SkillPilot-ID, Provider
   `OPENAI_DE`, engen Start-Intent und Ablaufzeit zu.
3. Der Browser erhält den Grant in einem `HttpOnly`, `Secure`,
   `SameSite=Lax`-Cookie. Das Cookie ist so eng wie möglich auf den
   Authorization-Pfad begrenzt.
4. Wenn ChatGPT den OAuth-Authorization-Endpunkt im Browser öffnet, sendet der
   Browser dieses Cookie automatisch an SkillPilot.
5. SkillPilot konsumiert den Grant atomar und erzeugt ein zufälliges, opakes
   OAuth-Subject beziehungsweise eine Providerverbindung.
6. Nur SkillPilot speichert die Relation:

   ```text
   (Provider OPENAI_DE, OAuth-Subject) -> SkillPilot-ID
   ```

7. Nach erfolgreicher Ausgabe des ersten Access Tokens wird zuerst der Pending
   Launch auf den autoritativen Lernendenzustand angewendet. Nur wenn das
   erfolgreich war, wird in derselben Backendtransaktion die 24h-Lernsession
   aktiviert.

Der OAuth-Parameter `state` wird nicht für die SkillPilot-ID oder einen
Binding-Grant zweckentfremdet. Er gehört dem OAuth-Client zur Korrelation und
CSRF-Abwehr und wird von SkillPilot unverändert behandelt. Auch `scope`,
`resource`, die Startnachricht und MCP-Toolargumente sind keine
Identitätskanäle.

Eine direkte App-Installation in ChatGPT ohne vorbereiteten Binding Grant darf
keine freie Eingabe einer SkillPilot-ID verlangen. SkillPilot zeigt stattdessen
eine verständliche Seite mit dem Weg zurück zu **Lernen starten**.

## 4. Serverseitige 24h-Lernsession

### 4.1 Zweck

Die OAuth-Verbindung beantwortet: **Welcher verbundene SkillPilot-Lernende ist
autorisiert?**

Die Lernsession beantwortet davon unabhängig: **Hat dieser Lernende SkillPilot
innerhalb der letzten 24 Stunden ausdrücklich gestartet und ist der bereits
vorbereitete autoritative Lernendenzustand für Coach-Tools freigegeben?**

Welcher fachliche Kontext vorbereitet wurde, steht nicht in der Lernsession,
sondern im autoritativen Lernendenzustand.

Die erste Version persistiert dafür absichtlich nur den minimal notwendigen
Datensatz in `openai_de_learning_session`:

| Spalte | Semantik |
| --- | --- |
| `connection_subject` | Primärschlüssel und Fremdschlüssel auf `openai_de_connection.subject`; opake, serverinterne Verbindungskennung |
| `started_at` | Zeitpunkt des ausdrücklich ausgelösten Starts |
| `expires_at` | Absoluter Ablaufzeitpunkt, produktiv `started_at + PT24H` |

Die SkillPilot-ID wird nicht in diesem Datensatz dupliziert. Sie wird über die
referenzierte Providerverbindung aufgelöst. Ebenso speichert die Lernsession
weder Start-Intent noch Statushistorie: Der typisierte Start-Intent wird zuerst
auf den autoritativen Lernendenzustand angewendet. Nur nach erfolgreicher
Anwendung wird der Sitzungsdatensatz in derselben Transaktion angelegt oder
ersetzt.

Die Zustände werden in Version 1 aus den vorhandenen Fakten abgeleitet:

- `ACTIVE`: Datensatz vorhanden, `expires_at > now` und die referenzierte
  Providerverbindung ist autorisiert und nicht widerrufen;
- `EXPIRED`: Datensatz vorhanden und `expires_at <= now`;
- `REVOKED`: Providerverbindung widerrufen; der zugehörige Sitzungsdatensatz
  wird dabei entfernt beziehungsweise beim Löschen der Verbindung
  kaskadierend gelöscht.

Fehlt bei einer weiterhin autorisierten Verbindung der Sitzungsdatensatz, ist
keine Lernsession aktiv und der MCP-Vertrag liefert `SESSION_REQUIRED`. Nach
Cleanup muss nicht historisch unterschieden werden, ob zuvor keine oder eine
abgelaufene Sitzung existierte.

`REPLACED` ist kein persistierter Zustand. Ein neuer Klick auf **Lernen
starten** führt ein atomares Upsert desselben `connection_subject` aus und
überschreibt `started_at` und `expires_at`. Dadurch gibt es in der ersten
Version höchstens eine deutsche OpenAI-Lernsession pro Providerverbindung, ohne
eine zweite Statusquelle neben Verbindung und Ablaufzeit einzuführen.

Falls für denselben Lernenden vorübergehend mehrere noch gültige, nicht
widerrufene OpenAI-DE-OAuth-Subjects existieren, aktiviert ein ausdrücklicher
Start dieselbe absolute Frist für jedes dieser Subjects. So hängt der
Lernstart nicht davon ab, welches weiterhin gültige Subject ChatGPT beim
nächsten MCP-Aufruf verwendet. Diese Angleichung ist strikt auf Verbindungen
desselben Lernenden begrenzt; sie überträgt niemals eine Sitzung zwischen
verschiedenen SkillPilot-IDs.

### 4.2 Absolute statt gleitende Gültigkeit

Die 24-Stunden-Grenze ist absolut:

- Toolaufrufe verlängern sie nicht.
- Access-Token-Refresh verlängert sie nicht.
- ein neuer Chat verlängert sie nicht.
- Reload oder Kontextkompaktierung verlängern sie nicht.
- nur ein erneuter bewusster Start in SkillPilot erzeugt eine neue Frist.

OAuth Access Tokens dürfen kürzer, Refresh Tokens länger als 24 Stunden leben.
Das ist kein Widerspruch: Ein technisch gültiges OAuth-Token kann nach Ablauf
der Lernsession weiterhin die Providerverbindung identifizieren, ist aber für
lernendenbezogene Coach-Tools bis zu einem neuen **Lernen starten** nicht
ausreichend.

### 4.3 Prüfung bei jedem MCP-Tool

Jeder lernendenbezogene Toolaufruf durchläuft in dieser Reihenfolge:

```text
OAuth Access Token prüfen
        |
        v
OAuth-Subject / Providerverbindung bestimmen
        |
        v
serverseitig SkillPilot-ID auflösen
        |
        v
aktive, nicht abgelaufene 24h-Lernsession prüfen
        |
        v
aktuellen Backendzustand laden und Tool fachlich revalidieren
```

Die Toolargumente enthalten daher weder `skillpilotId` noch
`chatSessionToken`, `learningSessionId` oder eine andere Identitätsreferenz.
Nach Kontextverlust kann `get_skillpilot_context_de()` den Zustand
argumentlos aus der verifizierten Kette rehydrieren.

## 5. Start- und Wiederaufnahmeabläufe

### 5.1 Erstmaliger Start ohne vorhandene OAuth-Verbindung

```text
SkillPilot-Cockpit
  -> Lernen starten
  -> Binding Grant + HttpOnly-Cookie + Pending Launch
  -> normaler ChatGPT-Chat mit ausgewählter App
  -> erster geschützter MCP-Aufruf erhält OAuth-Challenge
  -> ChatGPT öffnet Authorization-Endpunkt
  -> Browser sendet Binding-Cookie automatisch
  -> Benutzer bestätigt den standardmäßigen OAuth-Consent
  -> Authorization Code + PKCE
  -> ChatGPT tauscht Code gegen Access-/Refresh-Token
  -> SkillPilot bindet Subject an SkillPilot-ID
  -> SkillPilot wendet Pending Launch auf den Lernendenzustand an
  -> SkillPilot aktiviert erst danach atomar die 24h-Lernsession
  -> ChatGPT wiederholt MCP-Aufruf mit Bearer Token
  -> Coach lädt den aktuellen SkillPilot-Kontext
```

Die einzige unvermeidbare Benutzerinteraktion ist beim ersten Verbinden die
übliche OAuth-Zustimmung. Es gibt kein Kopieren eines Tokens oder einer ID.

### 5.2 Späterer Start mit vorhandener OAuth-Verbindung

1. **Lernen starten** findet die bereits autorisierte OpenAI-DE-Verbindung des
   Lernenden.
2. SkillPilot wendet den typisierten Start-Intent auf den autoritativen
   Lernendenzustand an und erzeugt beziehungsweise ersetzt erst nach dessen
   erfolgreicher Anwendung in derselben Transaktion die 24h-Lernsession für
   alle noch gültigen OAuth-Subjects dieses Lernenden.
3. ChatGPT verwendet seine bestehende OAuth-Verbindung. Ein abgelaufenes Access
   Token wird mit dem Refresh Token erneuert.
4. Der nächste MCP-Aufruf löst Subject, SkillPilot-ID und Lernsession
   serverseitig auf.

Der Benutzer muss OAuth nicht täglich neu verbinden. Ein erneuter Consent ist
nur nach Widerruf, Verbindungswechsel oder nicht mehr erneuerbarer
OAuth-Autorisierung erforderlich.

Der Browserstart behandelt die Statusprüfung nur als Momentaufnahme. Meldet
`connect-start`, dass die Verbindung inzwischen bereits besteht, muss der
Client vor dem Öffnen von ChatGPT noch den normalen `launch`-Schritt
ausführen. Ein Binding Grant allein ist keine Lernsession.

### 5.3 Startnachricht

Die sichtbare Nachricht darf ausschließlich die natürliche Lernabsicht
ausdrücken, beispielsweise:

> Verwende die App SkillPilot Coach (Deutsch) und fahre mit dem in SkillPilot
> vorbereiteten nächsten Schritt fort.

Sie enthält keine Identität und keine Autorisierung. Ihr Verlust oder ihre
Veränderung darf keinen fremden Lernendenzugriff ermöglichen. Das Backend hat
den Start-Intent bereits vor dem Chat vorbereitet.

Das Cockpit transportiert die vom Backend erzeugte Nachricht URL-codiert im
`prompt`-Parameter einer zuvor validierten `https://chatgpt.com/`-URL. Der
Benutzer muss sie nicht über die Zwischenablage übertragen. Pfad,
Query-Parameter und Fragment aus der konfigurierten Basis-URL werden verworfen;
SkillPilot öffnet einen neuen normalen Chat und setzt genau einen neuen
`prompt`-Parameter. Der Parameter ist ausschließlich eine Komfortübergabe an den
Chat-Composer und keine Identitäts-, Autorisierungs- oder Sitzungsbindung.

Die Nachricht wird passend zum typisierten Start-Intent erzeugt:

- `CURRENT_UNIT` verwendet die kontextneutrale Formulierung „vorbereiteter
  nächster Schritt“ und passt dadurch auch zu noch offener Personalisierung,
  Fortsetzung, Übung oder Prüfung;
- `VERIFIED_RECALL` nennt nur den Zweck und die Kartenanzahl;
- `ABI26_EXAM` nennt nur Prüfungsmodus und Kursniveau.

SkillPilot-ID, Lernziel-ID, Binding Grant, OAuth-Token und Lernsession-ID dürfen
in keinem dieser URL-Prompts vorkommen. Da der öffentliche ChatGPT-URL-Vertrag
providerseitig geändert werden kann, gehört die automatische Vorbelegung in den
Release-Canary; fachlich und sicherheitstechnisch bleibt der Backendzustand die
Quelle der Wahrheit.

## 6. Keine verlässliche Bindung an eine konkrete Chat-Konversation

Der produktive MCP-Vertrag erhält derzeit keine dokumentierte, stabile
ChatGPT-Konversations-ID, die SkillPilot als Sicherheits- oder
Sitzungsschlüssel verwenden könnte. Deshalb gilt:

- Die 24h-Lernsession ist an die autorisierte OpenAI-DE-Providerverbindung und
  den SkillPilot-Lernenden gebunden, nicht an einen einzelnen Chat.
- Neue, parallele oder wiederaufgenommene Chats mit derselben Verbindung sehen
  denselben autoritativen Backendzustand.
- Ein neuer **Lernen starten**-Vorgang ersetzt den aktiven Kontext auch für
  andere Chats dieser Verbindung.
- Fachliche Mutationen werden immer gegen den frisch geladenen Backendzustand
  revalidiert; Chatverlauf und `structuredContent` sind nur Komfortkontext.

Wenn künftig eine vom Provider dokumentierte, stabile und nicht vom Modell
erzeugte Konversationskennung verfügbar wird, kann eine zusätzliche
Chat-Unterbindung entworfen werden. Bis dahin darf keine vermeintliche
Conversation-ID aus `_meta`, Toolargumenten oder Chattext zur Identität oder
Autorisierung erhoben werden.

## 7. Fehlerfälle und erwartete Benutzerführung

| Zustand | Protokollreaktion | Benutzerführung |
| --- | --- | --- |
| Access Token fehlt oder ist ungültig | `401` mit standardkonformer `WWW-Authenticate`-Challenge und MCP-Auth-Metadaten | ChatGPT startet oder erneuert OAuth |
| Token ist gültig, Scope fehlt | Autorisierung wird mit `403` beziehungsweise einem äquivalenten MCP-Authfehler abgewiesen | erforderliche Berechtigung transparent anfordern; keine Mutation |
| Binding Grant fehlt oder ist abgelaufen | OAuth-Verbindung wird nicht an einen Lernenden gebunden | Link zu SkillPilot **Lernen starten**; keine ID-Eingabe im Chat |
| Subject hat keine aktive Lernendenzuordnung | Zugriff wird abgewiesen | Verbindung in SkillPilot neu vorbereiten |
| Lernsession fehlt, ist ersetzt, widerrufen oder älter als 24 Stunden | maschinenlesbarer Fehler `SESSION_REQUIRED`; kein fachlicher Toolzugriff | Link zu **Lernen starten**; bestehendes OAuth nicht unnötig trennen |
| OAuth-Verbindung wurde widerrufen | Token/Refresh wird abgewiesen | einmalig neu verbinden |
| ChatGPT ruft trotz ausgewählter App kein Bootstrap-Tool auf | keine Backendanfrage; generische Modellantwort ist kein erfolgreicher Coach-Start | Toolbeschreibung und Server-Instruktion korrigieren; nicht als OAuth-Fehler diagnostizieren |
| paralleler Chat schreibt auf veralteten Zustand | Backend revalidiert und weist Konflikt ab | Zustand einmal frisch laden und Benutzerentscheidung erhalten |

Fehlermeldungen dürfen weder interne IDs noch Token oder Grants enthalten.
Ein gültiges OAuth-Token ohne aktive Lernsession führt nicht zu einer erneuten
OAuth-Schleife, sondern gezielt zu **Lernen starten**.

## 8. Sicherheitsinvarianten

Die folgenden Regeln sind nicht verhandelbar:

1. Der Benutzer sieht oder kopiert keinen OAuth-, Binding- oder Session-Token.
2. Die permanente SkillPilot-ID verlässt das Backend nicht.
3. Nur der First-Party-Browser-Binding-Ablauf darf eine OAuth-Verbindung einer
   SkillPilot-ID zuordnen.
4. Ein Binding Grant ist zufällig, nur gehasht gespeichert, einmalig und
   höchstens fünf Minuten gültig.
5. Authorization Code Flow verwendet ausschließlich PKCE `S256` und exakt
   registrierte Redirect-URIs.
6. Jeder MCP-Aufruf wird gegen Issuer, Audience/Resource, Ablauf, Widerruf und
   Scope geprüft.
7. Die 24h-Lernsession wird zusätzlich bei jedem lernendenbezogenen Tool
   geprüft und niemals durch Token-Refresh verlängert.
8. Chattext, Startnachricht, Toolargumente, `_meta["openai/session"]` und
   modellgenerierte Werte sind keine Identitätsquellen.
9. Tokens, Grants, SkillPilot-ID und vollständige Schülerantworten werden nicht
   protokolliert.
10. Writes werden nach Authentisierung und Sitzungsprüfung zusätzlich gegen den
    aktuellen fachlichen Backendzustand revalidiert.
11. Widerruf oder Löschen der Providerverbindung beendet die zugehörige
    Lernsession; die Datenbankbeziehung löscht den minimalen Sitzungsdatensatz
    kaskadierend.
12. Ein neuer Start ersetzt `started_at` und `expires_at` für dasselbe
    `connection_subject` atomar; Race Conditions dürfen nicht zwei aktive
    Kontexte hinterlassen.
13. Start-Intent und Sitzungsstatus werden nicht redundant im
    Lernsessiondatensatz gespeichert. Der Intent wirkt auf den autoritativen
    Lernendenzustand; der Sitzungszustand wird aus Verbindung, Existenz und
    `expires_at` abgeleitet.

## 9. Abnahmekriterien

Die Architektur ist erst vollständig umgesetzt, wenn mindestens folgende
Acceptance-Tests bestehen:

- Erstverbindung aus **Lernen starten** funktioniert mit OAuth/PKCE ohne
  sichtbaren Schlüssel.
- Der Access Token wird bei MCP-Aufrufen automatisch im Authorization-Header
  transportiert; keine Identität steht in Toolargumenten.
- Ein Subject löst ausschließlich den gebundenen SkillPilot-Lernenden auf;
  Cross-Learner-Zugriffe schlagen fehl.
- Ein späterer Start mit bestehender OAuth-Verbindung benötigt keinen erneuten
  Consent und ersetzt die aktive Lernsession.
- Der Übergang `status=false` und anschließend `connect-start.connected=true`
  führt vor dem Öffnen von ChatGPT noch zu `launch`.
- Sind für denselben Lernenden mehrere gültige OAuth-Subjects vorhanden,
  akzeptiert der erste MCP-Aufruf jedes dieser Subjects innerhalb derselben
  neu gestarteten absoluten Frist.
- Access-Token-Refresh lässt `learningSession.expiresAt` unverändert.
- Die Migration erzeugt `openai_de_learning_session` ausschließlich mit
  `connection_subject`, `started_at` und `expires_at`; die SkillPilot-ID wird
  über `openai_de_connection` aufgelöst.
- Ein fehlschlagender Start-Intent aktiviert keine Lernsession.
- Nach absolut 24 Stunden liefern alle lernendenbezogenen Tools
  `SESSION_REQUIRED`, bis SkillPilot erneut gestartet wurde.
- Ein neuer Chat und ein Reload rehydrieren innerhalb der Frist denselben
  Backendzustand.
- Parallele Chats werden als gemeinsamer Providerverbindungskontext behandelt;
  veraltete Mutationen werden abgewiesen.
- Direkte Installation ohne Binding Grant führt zu einer verständlichen
  SkillPilot-Startseite, niemals zur manuellen Eingabe einer SkillPilot-ID.
- Widerruf beendet OAuth-Verbindung und aktive Lernsession.
- Ein generischer ChatGPT-Text ohne MCP-Aufruf wird im Acceptance-Test als
  fehlgeschlagener Coach-Start erkannt.

## 10. Verwandte Dokumente und Standards

- [Migration des SkillPilot-Coaches zur OpenAI-MCP-App](openai-mcp-coach-migration-plan.md)
- [Wissens- und Verhaltensparität des deutschen MCP-Lerncoaches](openai-mcp-coach-knowledge-parity.md)
- [Deployment und Cutover](../../deploy/openai-mcp-coach-de.md)
- [OpenAI Apps SDK: Authentication](https://developers.openai.com/apps-sdk/build/auth)
- [OpenAI Apps SDK: MCP server](https://developers.openai.com/apps-sdk/concepts/mcp-server)
- [OpenAI Apps SDK: Security and privacy](https://developers.openai.com/apps-sdk/guides/security-privacy)
