# Direkter SkillPilot-Start aus der OpenAI-MCP-App

**Stand:** 10. August 2026

**Status:** Verbindliche Zielarchitektur; vollständiger interner V1-Slice und
Canary freigegeben. Die öffentliche Einreichung bleibt durch Abschnitt 12.2
gesperrt.

**Normative Hierarchie:** Abschnitt 3 ist die unveränderliche
Identitätsverfassung. Der zentrale
[Plugin-Versionierungs- und Lebenszyklusvertrag](openai-plugin-versioning-and-lifecycle.md)
ist die einzige normative Quelle für Support-Lifecycle, Publikationsstatus,
Nachfolger und Startpolicy einer Contract-Major-Linie. Dieses Dokument besitzt
ausschließlich den direkten Bootstrap-, Capability-, Delivery- und
App-first-Handoff-Vertrag. Spätere Ablauf-, Schema-, Sicherheits- oder
Implementierungsdetails dürfen diese Grenzen nicht abschwächen oder umdeuten.
Ein Widerspruch ist ein Konzept- beziehungsweise Implementierungsfehler und
keine zulässige Detailentscheidung.

## 1. Kurzfassung

SkillPilot bietet neben dem bestehenden Start auf https://skillpilot.com einen
zweiten Einstieg an: Eine Person öffnet **SkillPilot Coach v1** direkt im
OpenAI-Host, erzeugt dort eine neue SkillPilot-ID oder verwendet eine vorhandene,
richtet Curriculum und persönliches Curriculum vollständig in derselben
Komponente ein und startet anschließend unmittelbar mit dem Lerncoach. Der
normale App-first-Ablauf öffnet die SkillPilot-Webanwendung zu keinem Zeitpunkt.

Dieser zusätzliche Einstieg ändert die bestehende Identitätsarchitektur
ausdrücklich nicht:

1. **OAuth koppelt ausschließlich die registrierte App an den SkillPilot
   Core.** V1 verwendet weiterhin den vorregistrierten Confidential Client mit
   fester client_id und client_secret_basic am Token-Endpunkt. Zulässig bleiben
   ausschließlich Authorization Code mit verpflichtendem PKCE sowie Refresh
   Token. client_credentials wird weder registriert noch beworben noch
   akzeptiert.
2. **Die SkillPilot-ID wählt unabhängig davon den dauerhaften Lernstand.**
   Die Komponente erzeugt sie über eine direkte HTTPS-Verbindung zum Core oder
   nimmt sie dort als vorhandene ID entgegen. Sie gelangt niemals in Chat,
   Modellkontext, MCP-Toolargumente, MCP-Toolresultate oder Resultat-`_meta`.
3. **Eine neue learningSessionId wählt genau eine kurzlebige Lernsession.**
   Sie wird erst nach ausdrücklicher Startbestätigung erzeugt, ist absolut
   höchstens 24 Stunden gültig und wird anschließend in einer kurzen
   Startnachricht an den Host zur Aufnahme in den Chat übergeben.
4. **Eine neue Contract-Major-Version ist eine neue App-Linie.** Ein späterer
   SkillPilot Coach v2 erhält eine eigene Plugin-Identität, einen eigenen
   Origin, einen eigenen OAuth-Client und einen eigenen Bootstrap. V1-Token,
   V1-Capability und V1-Lernsession werden niemals übernommen.

Der zusätzliche Einstieg ist damit weder ein OAuth-Login für Lernende noch ein
OAuth-Subject-zu-Lernenden-Mapping. Er ist ein App-autorisierter Bootstrap, der
nach der ausdrücklichen Wahl **Neu erstellen** oder **Vorhandene ID verwenden**
dieselbe autoritative fachliche Startgrenze und denselben kanonischen
Einrichtungsautomaten verwendet wie der bestehende Webstart.

## 2. Ausgangslage

### 2.1 Bestehender Webstart

Der bestehende produktive Ablauf bleibt unverändert:

1. Die SkillPilot-Webanwendung kennt die ausdrücklich ausgewählte
   SkillPilot-ID, die Sprache und den vorbereiteten Lernkontext.
2. Sie ruft den bestehenden Launch-Endpunkt auf.
3. Der Core wendet den Startkontext atomar an und erzeugt eine zufällige
   learningSessionId.
4. Das Backend speichert nur deren HMAC-Hash und die serverseitige Zuordnung
   zum Lernenden.
5. Die Webanwendung öffnet ChatGPT mit einer vorbereiteten Startnachricht.
6. Jeder fachliche MCP-Aufruf benötigt danach gleichzeitig OAuth und dieselbe
   explizite learningSessionId.

### 2.2 Fehlender zweiter Einstieg

Wird die App direkt im OpenAI-Host geöffnet, existiert noch keine
learningSessionId. Der fachliche Toolvertrag darf dann keinen Lernenden, kein
Lernziel und keine frühere Session erraten.

Es fehlt deshalb ein klar abgegrenzter Pre-Session-Bootstrap. Er muss:

- ohne learningSessionId aufrufbar sein;
- weiterhin gültiges, major-spezifisches App-OAuth verlangen;
- noch keinen fachlichen Lernzustand lesen oder verändern;
- eine sichere UI für Erzeugung oder unabhängige Auswahl der SkillPilot-ID
  öffnen;
- erst nach ausdrücklicher Bestätigung eine neue Lernsession erzeugen;
- Curriculum und Personal Curriculum vor dem Chat-Handoff innerhalb derselben
  Komponente vollständig einrichten;
- anschließend in den unveränderten fachlichen MCP-Ablauf überleiten.

## 3. Nicht verhandelbare Identitätsgrenzen

### 3.1 Normative Architekturverfassung

Die folgenden Regeln gelten für bestehenden Webstart, direkten App-Start und
alle späteren Ausbaustufen:

1. **MUSS – bestehende App-Core-Kopplung beibehalten.** Jede Contract-Major-
   Linie verwendet genau einen vorregistrierten OAuth-Confidential-Client.
   Der Token-Endpunkt authentisiert ihn mit client_id und
   client_secret_basic. Fachliche MCP-Endpunkte akzeptieren anschließend nur
   Access Tokens für die erwartete major-spezifische Resource/Audience und die
   erforderlichen Scopes.
2. **MUSS – OAuth-Flows strikt begrenzen.** Zulässig sind Authorization Code
   mit PKCE S256 und Refresh Token. Der Grant client_credentials ist nicht
   Teil der Architektur.
3. **NICHT TEIL DIESES AUSBAUS – mTLS.** mTLS ist weder Voraussetzung noch
   Abhängigkeit des direkten Starts. Eine spätere zusätzliche Härtung benötigt
   eine eigene Architekturentscheidung und ändert bis dahin keine
   Identitätssemantik.
4. **DARF NICHT – OAuth als Lernendenidentität verwenden.** OAuth-Subject,
   Providerkonto, Connection oder Consent dürfen weder direkt noch über einen
   Zuletzt-verwendet-Fallback auf SkillPilot-ID, Lernenden oder Lernstand
   aufgelöst werden.
5. **MUSS – SkillPilot-ID unabhängig halten.** Ausschließlich die von der
   Person ausdrücklich neu erzeugte oder gewählte SkillPilot-ID bestimmt den
   dauerhaften Lernstand.
6. **MUSS – Lernsession unabhängig und kurzlebig halten.** Erst der bestätigte
   Start erzeugt eine neue learningSessionId. OAuth-Callback, Tokenaustausch
   und Token-Refresh dürfen keine Lernsession erzeugen, auswählen, verlängern
   oder reaktivieren.
7. **MUSS – jeden fachlichen MCP-Aufruf doppelt autorisieren.** Er benötigt
   gleichzeitig ein gültiges OAuth Access Token und die gültige, explizit
   übergebene learningSessionId.
8. **DARF NICHT – technische Ablaufwerte zu Identitäten aufwerten.**
   Setup-Capability, Idempotenzschlüssel, Widget-Sitzung, Host-Metadaten und
   UI-State sind keine dauerhafte App-, Lernenden- oder Sessionidentität.
9. **MUSS – Client-Secret auf den Tokenaustausch begrenzen.** Das Secret darf
   niemals in Widget, Skill, Modellkontext, Chat, MCP-Toolargumente,
   Toolresultate, Bootstrap-Requests, URLs, Telemetrie oder Logs gelangen.
10. **MUSS – Contract-Majors explizit wechseln.** Eine inkompatible Major-
    Version ist eine eigene Plugin-Identität mit eigenem MCP-Origin,
    Skill-/Toolvertrag, UI-Ressourcenlinie und OAuth-Client.
11. **DARF NICHT – einen Cross-Major-Fallback erfinden.** Token,
    Setup-Capability, Idempotenz-Attempt und learningSessionId sind
    major-lokal und werden an einer anderen Linie fail-closed abgewiesen.
12. **MUSS – den dauerhaften Lernstand von Laufzeitartefakten trennen.**
    Mastery, persönliches Curriculum und sonstiger Lernstand bleiben im Core.
    Ein Major-Wechsel wählt diesen Lernstand erneut über die SkillPilot-ID,
    übernimmt aber keine alte Session.
13. **MUSS – die permanente ID aus allen Host-/MCP-Datenflächen fernhalten.**
    Der Klarwert darf nur in einem direkten HTTPS-Request beziehungsweise bei
    Neuanlage in der direkten HTTPS-Antwort zwischen Komponente und festem
    SkillPilot-Core-Endpunkt sowie kurzlebig im Arbeitsspeicher oder sichtbaren
    DOM der Komponente vorkommen. Verboten sind insbesondere Chat,
    Modellkontext, MCP-Toolargumente, `content`, `structuredContent`, Resultat-
    `_meta`, `tools/call`, `ui/message`, sämtliche `window.openai`-Felder und
    -Methoden, provider-synchronisierter `widgetState`, Local/Session Storage,
    IndexedDB, URL, Query, Fragment, Referrer, Logs, Console, Analytics und
    Telemetrie.
14. **MUSS – den normalen App-first-Ablauf in einer Komponente abschließen.**
    ID-Vergabe beziehungsweise ID-Auswahl, Sprache, Providerhinweis,
    Curriculum und persönliches Curriculum finden in derselben Startkomponente
    statt. Erst danach erhält der Host genau die kurze ID-freie Startnachricht.
    **SkillPilot öffnen** ist kein regulärer Schritt, sondern ausschließlich
    ein expliziter technischer Not-/Supportfallback.
15. **DARF NICHT – absolute Geheimhaltung gegenüber dem Hostbetreiber
    behaupten.** Die Komponente läuft in einem vom OpenAI-Host bereitgestellten
    Iframe und damit im ChatGPT-Clientprozess. Die Architektur verhindert eine
    absichtliche Übergabe der permanenten ID an Chat, Modell- und MCP-
    Datenflächen; sie kann technisch keine absolute Nichtbeobachtbarkeit
    gegenüber dem Betreiber der ausführenden Clientumgebung garantieren.

Das technische OAuth-Subject bedeutet in SkillPilot ausschließlich:
„Dieser MCP-Zugriff gehört zum erwarteten registrierten Client und besitzt die
erteilten Scopes“ – niemals: „Dies ist Lernender X“.

Siehe auch die aktuelle OpenAI-Dokumentation zu
[Authentication](https://developers.openai.com/plugins/build/auth).

### 3.2 Vier getrennte Nachweise

| Nachweis | Bedeutung | Darf nicht bedeuten |
| --- | --- | --- |
| OAuth Confidential Client und daraus autorisiertes Access Token | Die registrierte OpenAI-App darf die erwartete SkillPilot-MCP-Resource mit den erteilten Scopes verwenden. | client_credentials, Lernenden-, SkillPilot-ID- oder Sessionauswahl |
| Setup-Capability | Delegierter Nachweis für genau einen kurzlebigen direkten Bootstrap-Vorgang unter einer zuvor geprüften App-OAuth-Autorisierung. | Lernendenidentität, OAuth-Credential, fachliche MCP-Autorisierung oder Lernsession |
| SkillPilot-ID | Ausdrückliche Auswahl des dauerhaften Lernstands. | OAuth-Principal, Appidentität oder 24h-Lernsession |
| learningSessionId | Auswahl einer konkreten, maximal 24 Stunden gültigen Lernsession und ihrer Sprache. | alleinige MCP-Autorisierung oder dauerhafte Lernendenidentität |

Für jeden fachlichen MCP-Aufruf gilt:

~~~text
gültiges OAuth Access Token
AND
gültige, explizit übergebene learningSessionId
~~~

Verboten bleiben insbesondere:

- Lernendenauflösung über OAuth-Subject oder Providerkonto;
- implizite Auswahl einer zuletzt verwendeten SkillPilot-ID;
- implizite Auswahl der zuletzt erzeugten Lernsession;
- Sessionerzeugung oder -verlängerung durch OAuth-Callback oder Refresh;
- Übernahme einer SkillPilot-ID aus Chattext oder Modellkontext;
- Verwendung der Setup-Capability als fachliche Lernsession.

### 3.3 Änderungskontrolle

Folgende Änderungen sind keine Implementierungsdetails und benötigen eine neue,
ausdrücklich freigegebene Architekturentscheidung:

- Wechsel der Clientauthentisierung;
- Einführung von mTLS als Voraussetzung;
- Einführung von client_credentials;
- OAuth-Principal-zu-Lernenden-Verknüpfung;
- Wegfall der ausdrücklichen SkillPilot-ID-Auswahl;
- Wegfall von OAuth oder learningSessionId an fachlichen Tools;
- gleitende Verlängerung der absoluten 24-Stunden-Grenze;
- Cross-Major-Wiederverwendung von OAuth-, Capability-, Attempt- oder
  Sessionartefakten;
- stillschweigender Wechsel auf eine neue Plugin-Major-Linie.

## 4. Ziele und Nicht-Ziele

### 4.1 Ziele des internen V1-Slices

- direkter Start aus SkillPilot Coach v1 mit **neuer** oder **vorhandener**
  SkillPilot-ID;
- Vergabe beziehungsweise Eingabe der ID ausschließlich in der Komponente;
- vorhandene oder neu erzeugte Lernende werden vor dem Chat-Handoff über den
  bestehenden Coach-Zustandsautomaten vollständig durch `setCurriculum` und
  `setPersonalization` geführt;
- unbekannte SkillPilot-IDs werden neutral an den First-Party-Start verwiesen;
- Bestätigung von Sprache und unveränderlich versioniertem Providerhinweis;
- Starttyp ausschließlich CURRENT_UNIT;
- Wiederverwendung der bestehenden autoritativen Startlogik;
- Host-Anfrage über den ausgewählten Nachrichtenkanal mit der fertigen
  Startnachricht **erst nach abgeschlossener Einrichtung**;
- ausdrückliche Recovery-Bestätigung nach Neuanlage, bevor die Einrichtung
  fortgesetzt wird;
- sicherer Rückfall auf den bestehenden Webstart.

### 4.2 Nicht-Ziele des internen V1-Slices

- keine Änderung von client_id, Redirect-URIs, client_secret_basic, Consent,
  PKCE, Access-Token- oder Refresh-Token-Semantik;
- kein client_credentials-Grant und kein mTLS-Plumbing;
- keine OAuth-Subject-zu-Lernenden-Verknüpfung;
- kein SkillPilot-Konto- oder Profil-Login über OAuth;
- kein MCP-Tool, das die SkillPilot-ID erhält oder die Lernsession startet;
- kein Dateiimport, kein Datei-PIN und kein unverschlüsselter automatischer
  Export aus dem Widget;
- keine zweite Curriculum- oder Personalisierungslogik im Widget; die
  Komponente rendert ausschließlich die serverautoritativen Optionen und ruft
  die bestehenden sessiongebundenen Werkzeuge auf;
- keine zweite Katalog-, Kategorie- oder Qualitätsklassifikation im Widget;
  Curriculumkategorien, Qualitätsampel und Sortierpriorität werden vom Backend
  vollständig und versionsgebunden für genau die aktuell erlaubten Optionen
  projiziert;
- kein Verified-Recall- oder Abitur-Start;
- kein Ersatz des bestehenden Webstarts;
- keine Änderung an Lernziel-, Frontier-, Mastery- oder Autopilot-Semantik;
- keine öffentliche Einreichung eines ID- oder PIN-verarbeitenden Widgets ohne
  das harte Gate aus Abschnitt 12.

## 5. Zielablauf

~~~text
Person öffnet SkillPilot Coach v1 direkt im OpenAI-Host
                         |
                         v
               open_skillpilot_start
       OAuth: bestehender Authorization-Code+PKCE-
       beziehungsweise Refresh-Flow des festen V1-Clients
                         |
                         v
       Start-UI + serverautoritative Contract-Line-Projektion
       KEINE Capability, KEINE Lernendenauflösung
                         |
                         v
        Widget prüft einen vollständigen Aktionskanal:
        tools/call + ui/message oder die dokumentierten
        ChatGPT-Aliasse callTool + sendFollowUpMessage
        ohne Host-, Plattform- oder User-Agent-Sniffing
                         |
                         v
       Person wählt CREATE oder EXISTING, bestätigt
       Sprache, Providerhinweis und Start; bei EXISTING
       bleibt die ID nur im flüchtigen Komponentenprozess
                         |
                         v
      issue_skillpilot_start_capability, app-only
      ohne SkillPilot-ID; Capability nur in Result-_meta
                         |
                         v
   direkter HTTPS-POST an festen V1-Bootstrap-Endpunkt
   Capability im Header; identityMode im JSON-Body;
   SkillPilot-ID nur bei EXISTING im direkten Body
                         |
                         v
    Core bindet den Attempt in Transaktion A und führt
    den autoritativen Launch in Transaktion B aus
                         |
                         v
    zufällige learningSessionId, maximal 24h
    + kurzlebig AEAD-verschlüsseltes Delivery-Resultat;
    bei CREATE neue ID nur in direkter HTTPS-Antwort
                         |
                         v
    bei CREATE: neue ID im DOM zeigen und ausdrückliche
    Bestätigung verlangen, dass sie extern gesichert wurde
                         |
                         v
    Widget hält die Startnachricht privat zurück und ruft
    über tools/call die bestehenden ID-freien Sessiontools:
    get_skillpilot_context -> set_skillpilot_curriculum /
    set_skillpilot_personalization -> jeweils frischer Kontext
                         |
                         v
    sobald keine Einrichtungsaktion mehr offen ist:
    Host über den fixierten Nachrichtenkanal bitten,
    exakt die unveränderte Startnachricht aufzunehmen
                         |
                         v
       erwarteter nächster Modellschritt:
       get_skillpilot_context mit derselben learningSessionId;
       keine erneute Curriculum-/Personalisierungsfrage
~~~

## 6. MCP-Apps-Vertrag vor der Lernsession

Der Vertrag ist standard-first: _meta.ui.resourceUri,
ui/notifications/tool-result, tools/call und ui/message sind die primären
MCP-Apps-Flächen. ChatGPT-spezifische Felder sind nur
Kompatibilitätsaliasse. Siehe
[Add UI to your MCP server](https://developers.openai.com/plugins/build/chatgpt-ui)
und [Plugin UI reference](https://developers.openai.com/plugins/reference).

Für den aktuellen ChatGPT-Webhost ist der dokumentierte Kompatibilitätskanal
ein unterstützter Laufzeitweg: Sind `window.openai.callTool` und
`window.openai.sendFollowUpMessage` gemeinsam verfügbar, darf die Komponente
ihn verwenden, wenn die vollständige Standard-Aktionsfähigkeit nicht bereits
bereitsteht. Die Wahl wird vor dem ersten Aktionsaufruf für den Startversuch
fixiert. Nach einem dispatchten Aufruf wird niemals auf den jeweils anderen
Kanal ausgewichen; ein unklarer Ausgang darf keinen Doppelaufruf erzeugen.

### 6.1 Öffentliches Tool open_skillpilot_start

| Eigenschaft | Wert |
| --- | --- |
| Sichtbarkeit | Modell und App über `_meta.ui.visibility: ["model", "app"]` |
| Zweck | Startkomponente öffnen und aktuelle Contract-Line-Projektion lesen |
| OAuth | V1-Bearer-Token mit `skillpilot.openai.v1.read`; kein neuer Grant |
| learningSessionId | nicht vorhanden |
| SkillPilot-ID | nicht vorhanden |
| Seiteneffekt | keiner; insbesondere keine Capability |
| Annotationen | readOnlyHint true, idempotentHint true, destructiveHint false, openWorldHint false |
| UI-Bindung | aktive content-addressierte Startressource |

Der Tool-Descriptor verwendet exakt die bestehende V1-Security-Scheme und
deren identischen Backward-Compatibility-Mirror. `<active-start-resource-uri>`
steht für die eine aktuell gebundene content-addressierte URI; beide Felder
enthalten zur Laufzeit bytegleich denselben Wert.

~~~json
{
  "securitySchemes": [
    {
      "type": "oauth2",
      "scopes": ["skillpilot.openai.v1.read"]
    }
  ],
  "annotations": {
    "readOnlyHint": true,
    "idempotentHint": true,
    "destructiveHint": false,
    "openWorldHint": false
  },
  "_meta": {
    "securitySchemes": [
      {
        "type": "oauth2",
        "scopes": ["skillpilot.openai.v1.read"]
      }
    ],
    "ui": {
      "visibility": ["model", "app"],
      "resourceUri": "<active-start-resource-uri>"
    },
    "openai/outputTemplate": "<active-start-resource-uri>",
    "openai/widgetAccessible": true
  }
}
~~~

Das Inputschema ist leer und geschlossen:

~~~json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {}
}
~~~

Das authoring-seitige `outputSchema` ist geschlossen. Es referenziert die
stabile Schemaidentität des kanonischen Contract-Line-Vertrags; der
Release-Exporter dereferenziert dessen aktuelles Schema und übernimmt es
vollständig in den ausgelieferten Descriptor. Eine externe Schemaauflösung zur
Laufzeit ist verboten.

~~~json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "status",
    "supportedLocales",
    "fallbackUrl"
  ],
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "ID_REQUIRED",
        "MAJOR_UPGRADE_REQUIRED",
        "TEMPORARILY_UNAVAILABLE"
      ]
    },
    "supportedLocales": {
      "type": "array",
      "prefixItems": [
        { "const": "de" },
        { "const": "en" }
      ],
      "items": false,
      "minItems": 2,
      "maxItems": 2
    },
    "fallbackUrl": {
      "const": "https://skillpilot.com/"
    }
  }
}
~~~

Beispiel eines gültigen Ergebnisses:

~~~json
{
  "status": "ID_REQUIRED",
  "supportedLocales": ["de", "en"],
  "fallbackUrl": "https://skillpilot.com/"
}
~~~

Die modellseitige Projektion bleibt absichtlich minimal. Die vollständige,
geschlossene `contractLine` wird ausschließlich in
`_meta.skillpilotStart.contractLine` an die Komponente geliefert. Ihre
Bedeutungen, Übergänge und Release-Gates gehören ausschließlich dem zentralen
Lebenszyklusvertrag. CI vergleicht die private materialisierte Fassung mit dem
kanonischen Schema und verweigert bei jeder Abweichung den Release-Snapshot.

~~~json
{
  "skillpilotStart": {
    "schemaVersion": 1,
    "contractLine": {
      "contractMajor": 1,
      "policyRevision": 2,
      "displayName": "SkillPilot Coach v1",
      "supportLifecycle": "CURRENT",
      "publicationStatus": "DRAFT",
      "newSessionPolicy": "ALLOW",
      "successor": null
    }
  }
}
~~~

Die Kombinationen von Support-Lifecycle, Publikationsstatus, Startpolicy und
Nachfolger sowie ihre Statusabbildung werden nicht hier erneut definiert. Es
gelten ausschließlich die kanonischen Kombinationsregeln in Abschnitt 14.1 und
14.2 des zentralen Lebenszyklusvertrags; unbekannte oder abweichende
Projektionen werden fail-closed behandelt.

Das modellseitige content weist ausdrücklich an:

> Die sichere SkillPilot-Startoberfläche wurde geöffnet. Die SkillPilot-ID
> darf niemals im Chat eingegeben oder abgefragt werden. Wird die Oberfläche
> nicht angezeigt, darf die SkillPilot-ID nicht im Chat abgefragt werden. Der
> bereitgestellte SkillPilot-Webstart ist nur der technische Fallback.

Das Toolresult enthält keine Setup-Capability und keine vertraulichen
Darstellungsdaten.

Der Skill darf dieses Tool genau einmal **pro ausdrücklichem Startversuch**
aufrufen, wenn eine Person den direkten SkillPilot-Start verlangt und noch
keine learningSessionId vorliegt. Nach Abbruch oder abgeschlossenem Versuch
darf eine neue ausdrückliche Benutzeraktion einen neuen Versuch beginnen. Der
Skill darf
weder eine SkillPilot-ID im Chat erfragen noch das app-only Issuer-Tool selbst
aufrufen. Nach Öffnen der Komponente wartet er auf eine vom Widget verfasste
Startnachricht. Im normalen App-first-Ablauf stellt das Modell weder Curriculum-
noch Personalisierungsfragen; diese Einrichtung wird vor dem Handoff in der
Komponente abgeschlossen. Bei fehlender UI ist ausschließlich der technische
Webfallback zulässig.

### 6.2 App-only Tool issue_skillpilot_start_capability

| Eigenschaft | Wert |
| --- | --- |
| Sichtbarkeit | ausschließlich App über `_meta.ui.visibility: ["app"]` |
| Zweck | nach Hostprüfung und Benutzerentscheidung eine Bootstrap-Autorität ausstellen |
| OAuth | V1-Bearer-Token mit `skillpilot.openai.v1.read` und `skillpilot.openai.v1.write` |
| learningSessionId | nicht vorhanden |
| SkillPilot-ID | verboten |
| Seiteneffekt | neue kurzlebige, verwendbare Capability |
| Annotationen | readOnlyHint false, idempotentHint false, destructiveHint false, openWorldHint false |
| UI-Bindung | keine |

Auch hier sind die öffentliche Security-Scheme und ihr `_meta`-Mirror exakt
identisch. Der Issuer bindet keine UI-Ressource.

~~~json
{
  "securitySchemes": [
    {
      "type": "oauth2",
      "scopes": [
        "skillpilot.openai.v1.read",
        "skillpilot.openai.v1.write"
      ]
    }
  ],
  "annotations": {
    "readOnlyHint": false,
    "idempotentHint": false,
    "destructiveHint": false,
    "openWorldHint": false
  },
  "_meta": {
    "securitySchemes": [
      {
        "type": "oauth2",
        "scopes": [
          "skillpilot.openai.v1.read",
          "skillpilot.openai.v1.write"
        ]
      }
    ],
    "ui": {
      "visibility": ["app"]
    },
    "openai/visibility": "private",
    "openai/widgetAccessible": true
  }
}
~~~

Das Inputschema enthält ausschließlich die ausdrückliche Bestätigung:

~~~json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "providerNoticeVersion",
    "providerEligibilityConfirmed"
  ],
  "properties": {
    "providerNoticeVersion": {
      "type": "string",
      "const": "openai-provider-eligibility-v2"
    },
    "providerEligibilityConfirmed": {
      "type": "boolean",
      "const": true
    },
    "sourceMajorDecision": {
      "type": "string",
      "enum": ["START_CURRENT_MAJOR"]
    }
  }
}
~~~

Bei ALLOW muss sourceMajorDecision fehlen. Bei WARN muss es nach ausdrücklicher
Wahl, in V1 zu bleiben, exakt START_CURRENT_MAJOR sein. Bei BLOCK, veraltetem
Providerhinweis oder fehlender Bestätigung wird keine Capability ausgestellt.

Die implementierte V1-Linie steht mit der erweiterten CREATE-/In-Component-
Semantik auf `policyRevision=2` und derzeit auf ALLOW. WARN bleibt bis zu
einem zentralen, serverautoritativen Policy-Service ein dormant getesteter
Vertragszustand: Ein nicht-null `sourceMajorDecision` wird aktuell fail-closed
abgewiesen. BLOCK und jede unbekannte oder veraltete Kombination stellen
ebenfalls keine Capability aus. Eine spätere Aktivierung von WARN erfordert
eine erhöhte `policyRevision` und eigene End-to-End-Tests; sie darf nicht allein
durch eine Konfigurationsänderung eingeschaltet werden.

Das veröffentlichte `outputSchema` umfasst exakt eine Erfolgs- und eine
Nicht-Erfolgsform. Beide sind geschlossen; die Capability ist in keiner Form
Teil von `structuredContent`.

~~~json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "oneOf": [
    {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "contractMajor",
        "providerNoticeVersion"
      ],
      "properties": {
        "status": {
          "const": "CAPABILITY_ISSUED"
        },
        "contractMajor": {
          "const": 1
        },
        "providerNoticeVersion": {
          "const": "openai-provider-eligibility-v2"
        }
      }
    },
    {
      "type": "object",
      "additionalProperties": false,
      "required": ["status", "contractMajor", "fallbackUrl"],
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "DECISION_REQUIRED",
            "NOTICE_REFRESH_REQUIRED",
            "MAJOR_UPGRADE_REQUIRED",
            "TEMPORARILY_UNAVAILABLE"
          ]
        },
        "contractMajor": {
          "const": 1
        },
        "fallbackUrl": {
          "const": "https://skillpilot.com/"
        }
      }
    }
  ]
}
~~~

Beispiel eines gültigen Erfolgs:

~~~json
{
  "status": "CAPABILITY_ISSUED",
  "contractMajor": 1,
  "providerNoticeVersion": "openai-provider-eligibility-v2"
}
~~~

Nicht-Erfolgszustände enthalten niemals Capability-_meta.

Nur beim Erfolg enthält Result-_meta das folgende, widgetseitig ebenfalls
geschlossen validierte Objekt:

~~~json
{
  "skillpilotStart": {
    "schemaVersion": 1,
    "setupCapability": "spc_<43 base64url characters>",
    "expiresAt": "2026-08-09T12:10:00Z",
    "contractMajor": 1,
    "policyRevision": 2,
    "providerNoticeVersion": "openai-provider-eligibility-v2",
    "sourceMajorDecision": "ALLOW_CURRENT_MAJOR"
  }
}
~~~

Der private Validator verlangt exakt diese Felder, Schema-Version 1, Major 1,
eine positive Policy-Revision, mindestens 256 Bit Tokenentropie, das genaue Format
^spc_[A-Za-z0-9_-]{43}$, eine plausible absolute Ablaufzeit von höchstens zehn
Minuten und die erwartete Hinweisversion. `sourceMajorDecision` wird
serverseitig auf `ALLOW_CURRENT_MAJOR` oder `START_CURRENT_MAJOR` normalisiert;
der zweite Wert setzt bei WARN die ausdrückliche Wahl voraus. Unbekannte Felder
führen fail-closed zum Webfallback. Bei allen Nicht-Erfolgszuständen ist
Capability-_meta verboten.

Result-_meta ist modellunsichtbar, wird aber durch den Host an die Komponente
geliefert. Es ist daher kein Geheimkanal gegenüber dem Host und ersetzt keine
serverseitige Autorisierung.

Das Tool wird nach OAuth-Autorisierungsreferenz, Contract Major, festem Client
und globalem Budget begrenzt. openai/subject und openai/session dürfen nur als
optionale pseudonymisierte Missbrauchssignale dienen, niemals als Autorisierung
oder Lernendenauswahl.

### 6.3 Warum die SkillPilot-ID kein MCP-Toolargument ist

Die SkillPilot-ID wird weder Modell, Chat noch Provider-Toolrouting
anvertraut. Das Widget sendet sie erst nach ausdrücklicher Benutzeraktion
direkt per HTTPS an den SkillPilot Core. App-only würde die Argumente zwar vor
dem Modell verbergen, aber nicht aus dem vom Provider vermittelten Tooltransport
entfernen und erfüllt deshalb diese strengere Produktgrenze nicht.

Dasselbe gilt für eine neu vergebene ID: Der Core liefert sie ausschließlich
in der direkten HTTPS-Antwort an die Komponente. Sie wird nie Bestandteil eines
MCP-Ergebnisses einschließlich Resultat-`_meta`. Für die nachfolgende
Einrichtung verwenden alle MCP-Werkzeuge ausschließlich die kurzlebige
`learningSessionId`; die permanente ID wird serverseitig darüber aufgelöst.

Der direkte HTTPS-Weg reduziert die Datenfläche, beweist aber nicht, dass Werte
außerhalb des OpenAI-Clientprozesses existieren. Die Komponente läuft im
Providerkontext. Diese Grenze muss der Datenschutzhinweis ehrlich benennen.

### 6.4 Bestehende Sessiontools für die Einrichtung in der Komponente

Der pragmatische V1-Ausbau führt keine zweite fachliche Setup-API und keine
neuen Setup-Toolnamen ein. Nach dem direkten Launch verwendet die Komponente
über denselben für den Versuch fixierten `tools/call`- beziehungsweise
`window.openai.callTool`-Kanal ausschließlich:

1. `get_skillpilot_context` mit der aus der kanonisch validierten
   `startMessage` extrahierten neuen `learningSessionId`;
2. bei `requiredAction=setCurriculum` genau ein veröffentlichtes
   `curriculumId` über `set_skillpilot_curriculum`;
3. bei `requiredAction=setPersonalization` genau ein veröffentlichtes opakes
   `optionId` über `set_skillpilot_personalization`;
4. anschließend den jeweils frisch zurückgegebenen Vollkontext, bis weder
   `setCurriculum` noch `setPersonalization` offen ist.

Diese drei bestehenden Werkzeuge bleiben modell- **und** appsichtbar und tragen
keine UI-Ressourcenbindung. Ihre Component-Aufruf-Freigabe und der aktuelle
ChatGPT-Kompatibilitätsweg werden explizit über
`_meta["openai/widgetAccessible"]: true` veröffentlicht. Sie erhalten kein
SkillPilot-ID-Argument und geben keine permanente ID in `content`,
`structuredContent` oder Resultat-`_meta` zurück.

Die Curriculum-Auswahl verwendet denselben Auswahlvertrag wie die SkillPilot-
WebGUI. Bei `requiredAction=setCurriculum` enthält der Vollkontext zusätzlich
eine geschlossene `curriculumCatalog`-Projektion mit `schemaVersion=1`. Für
jede veröffentlichte Curriculum-Option existiert darin genau ein Eintrag mit
derselben `optionId`, der serverautoritativ `category` (`SCHOOL`, `UNI` oder
`OTHER`), `qualityStatus` (`green`, `orange` oder `red`) und `sortRank`
festlegt. Fehlende, doppelte oder fremde Zuordnungen werden fail closed
abgewiesen. Die normalen Optionsobjekte bleiben unverändert, damit bereits
ausgelieferte content-addressierte Widgets den erweiterten Top-Level-Vertrag
weiterhin sicher ignorieren können.

Die Komponente rendert die Kategorien in der WebGUI-Reihenfolge Schule,
Universität & Hochschule sowie Sprachen & Weiterbildung. Die Qualitätsampel
verwendet Menschliche QS, Maschinelle QS, Experimentell und Alle. Default sind
`SCHOOL` und `green`; beide Filter werden exakt verknüpft. Innerhalb der
sichtbaren Menge gilt zuerst `sortRank`, danach die lokalisierte alphabetische
Sortierung des veröffentlichten Labels. Kategorie- und Ampelwechsel sind rein
lokal und erzeugen keinen Toolaufruf. Erst die ausdrückliche Auswahl eines
sichtbaren, weiterhin im neuesten Vollkontext veröffentlichten `optionId`
ruft `set_skillpilot_curriculum` auf. Das Widget leitet weder Kategorie noch
Qualität oder Rang aus Curriculum-ID, Titel oder Beschreibung ab. Der native
Select bleibt bis dahin ausdrücklich auf dem deaktivierten Placeholder ohne
fachlichen Wert; eine beim DOM-Aufbau vom Browser automatisch gesetzte erste
Option gilt niemals als Auswahl und darf das erforderliche `change`-Ereignis
nicht verschlucken.

Für jede neue Auswahl kopiert die Komponente `expectedStateVersion` exakt aus
dem neuesten erfolgreichen Vollresultat und erzeugt eine neue UUID-v4 als
`clientRequestId`. Nur ein transportseitig unklarer **unveränderter** Versuch
darf mit derselben UUID und denselben Argumenten wiederholt werden. Für eine
andere Auswahl oder nach einem bestätigten Erfolg wird diese UUID niemals
wiederverwendet. Ein Konflikt lädt den Kontext genau einmal frisch; die
Komponente verwirft alle zuvor angebotenen Optionen und arbeitet nur mit dem
neuen `stateVersion` und dessen Optionen weiter.

Die Komponente hält die vom Bootstrap gelieferte Startnachricht währenddessen
unverändert in einer flüchtigen Laufzeitreferenz. Weder die Sessionerzeugung
noch ein einzelner erfolgreicher Setup-Schritt löst bereits `ui/message` aus.
Erst der erste Vollkontext ohne `setCurriculum` und ohne `setPersonalization`
gibt den Host-Handoff frei. Ein danach eventuell veröffentlichtes
`setActiveGoal`, `teachActiveGoal` oder anderes fachliches `requiredAction`
gehört wieder dem normalen Coach und wird nicht vom Start-Widget vorweggenommen.

Das ist bewusst ein pragmatischer Zwischenschritt: Die Lernsession existiert
bereits während der Einrichtung. Ein späterer Pre-Session-Setup-Refactor darf
Curriculum und Personal Curriculum über eine eigene kurzlebige serverseitige
Draftreferenz vorbereiten und die Lernsession erst nach vollständiger
Bestätigung erzeugen. Er muss dieselbe ID- und OAuth-Verfassung wahren und darf
keine zweite fachliche Setup-Logik einführen.

## 7. Start-Widget

### 7.1 Technische Basis und Hostfähigkeiten

Das Widget:

- verwendet App und PostMessageTransport;
- nimmt Toolresultate über ui/notifications/tool-result an;
- ruft das app-only Capability-Tool über `tools/call` oder den dokumentierten
  ChatGPT-Kompatibilitätsalias `window.openai.callTool` auf;
- bittet den Host über `ui/message` oder den dokumentierten
  Kompatibilitätsalias `window.openai.sendFollowUpMessage` um Aufnahme der
  Startnachricht;
- darf für den mehrstufigen Einrichtungsassistenten eine vom Host angebotene
  Fullscreen-Darstellung verwenden, muss aber auch inline vollständig
  funktionieren;
- verwendet `ui/open-link` oder `window.openai.openExternal` für erlaubte
  Fallbacks, soweit unterstützt;
- erkennt optionale Hostfähigkeiten per Capability-API, nicht anhand von
  User-Agent, Hostname, Plattform oder Oberfläche.

Die OpenAI-Dokumentation beschreibt `tools/call` als standardisierten
UI-Toolaufruf und `window.openai.callTool` als ChatGPT-Kompatibilitätsalias.
Fullscreen ist ausdrücklich für mehrstufige Workflows vorgesehen. Siehe
[Add UI to your MCP server](https://developers.openai.com/plugins/build/chatgpt-ui)
und [UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines#fullscreen).

Vor jeder Capability-Ausstellung muss genau ein vollständiger Aktionskanal
verfügbar sein: entweder die initialisierte MCP-Apps-Verbindung mit
`serverTools`/`tools/call` und `message.text`/`ui.message` oder gemeinsam die
beiden ChatGPT-Kompatibilitätsmethoden `callTool` und
`sendFollowUpMessage`. Einzelne Methoden aus unterschiedlichen Kanälen werden
nicht kombiniert. Fehlt ein vollständiger Kanal, wird weder Capability noch
Session erzeugt. Der Webfallback bleibt erreichbar.

Diese Vorprüfung verhindert Starts, deren Handoff bereits erkennbar unmöglich
ist. Sie kann einen Host- oder Prozessabsturz nach dem Sessioncommit nicht
verhindern und ist keine Garantie gegen jede verwaiste Session.

### 7.2 Selbstenthaltene Komponente

Die aktive Startressource ist content-addressiert und vollständig
selbstenthalten:

- keine externen Skripte, Fonts oder Styles;
- keine Analytics, Session-Replay-, Tracking- oder Error-SDKs;
- keine Host-Upload-API für SkillPilot-ID-Dateien;
- keine dynamisch nachgeladenen ausführbaren Ressourcen;
- keine Navigation zu nicht allowlisteten Origins;
- jede frühere beworbene Ressourcen-URI bleibt byte-identisch lesbar.

Das Widget bleibt auch ohne UI nützlich: Das modellseitige Toolresultat nennt
nur den sicheren Webfallback und weist an, keine SkillPilot-ID oder PIN im Chat
abzufragen.

### 7.3 Vertrauliche Laufzeitdaten im internen V1-Canary

Der interne V1-Flow unterstützt eine manuell eingegebene vorhandene ID und eine
vom Core neu erzeugte ID. Es gibt kein Datei-, PIN- oder Passwortfeld.

Die ID:

- bleibt bis zum direkten Request in einer kurzlebigen lokalen
  Laufzeitreferenz;
- darf bei CREATE ausschließlich nach der direkten HTTPS-Antwort kurzlebig in
  einem klar gekennzeichneten DOM-Feld dargestellt werden, damit die Person sie
  außerhalb von ChatGPT sichern kann;
- wird abgesehen von diesem bewusst sichtbaren CREATE-Feld nicht in DOM-Text,
  provider-synchronisierten Widget-State, Local oder Session Storage,
  IndexedDB, URL, Console, Analytics oder Telemetrie
  geschrieben;
- wird niemals in structuredContent, Result-_meta, `tools/call`, `callTool`,
  `ui/message`, `sendFollowUpMessage` oder ein anderes `window.openai`-Feld
  beziehungsweise eine andere Hostmethode übernommen;
- wird nach Antwort oder Abbruch bestmöglich aus allen erreichbaren
  Laufzeitreferenzen entfernt.

Capability, ID, Locale, Hinweisversion und clientRequestId dürfen während eines
laufenden Requests als unveränderliches Pending-Request-Objekt im flüchtigen
Arbeitsspeicher liegen. JavaScript erlaubt keine garantierte String-
Zeroization; das Konzept verspricht deshalb nur kurze Lebensdauer und keine
Persistenz.

ID-Eingaben verwenden autocomplete off und spellcheck false. Die CREATE-
Darstellung darf ausschließlich nach einer ausdrücklichen Benutzeraktion den
lokalen Browserhelfer `navigator.clipboard.writeText` verwenden; fehlt diese
Fähigkeit, bleibt die ID manuell im DOM auswählbar. Es gibt keine Copy-, Share-
oder Download-Aktion über `window.openai` oder eine andere Host-API. Die Person
bestätigt ausdrücklich, dass sie die ID außerhalb der Komponente sicher
gesichert hat; erst danach beginnt die Curriculum-Einrichtung. Auch der lokale
Clipboard-Zugriff ist keine absolute Geheimhaltungsgrenze gegenüber dem
Betreiber des ChatGPT-Clientprozesses.

### 7.4 Widget-Zustandsmaschine

~~~text
INITIALIZING
  -> READY_FOR_IDENTITY_MODE
  -> READY_FOR_EXISTING_ID | READY_TO_CREATE_ID
  -> ISSUING_CAPABILITY
  -> VALIDATING_AND_LAUNCHING
  -> CREATED_ID_RECOVERY_ACK_REQUIRED        (nur CREATE)
  -> LOADING_SETUP_CONTEXT
  -> SELECTING_CURRICULUM                    (falls erforderlich)
  -> SELECTING_PERSONALIZATION               (wiederholt, falls erforderlich)
  -> SETUP_COMPLETE_PENDING_HOST_ACCEPTANCE
  -> HOST_MESSAGE_ACCEPTED
~~~

Fehlerzustände:

- UNSUPPORTED_HOST: keine Capability, keine Session, Webfallback;
- INVALID_ID: lokaler Syntaxfehler, kein direkter Request;
- CREATED_ID_NOT_ACKNOWLEDGED: neue ID bleibt ausschließlich sichtbar; keine
  Curriculum-/Personalisierungsmutation und kein Chat-Handoff;
- CAPABILITY_REJECTED: keine Session; erneute Ausstellung nur nach neuer
  ausdrücklicher Aktion und weiterhin erlaubter Policy;
- PROFILE_UNAVAILABLE: neutraler terminaler Fehler, keine Session;
- SETUP_CONFLICT: Kontext exakt einmal frisch laden und ausschließlich anhand
  des neuen `stateVersion` fortsetzen;
- SETUP_TRANSPORT_UNKNOWN: denselben unveränderten Schreibversuch mit derselben
  `clientRequestId` wiederholen; nie blind eine zweite fachliche Mutation
  erzeugen;
- HOST_MESSAGE_REJECTED_OR_UNKNOWN: nur dieselbe gespeicherte Startnachricht
  erneut senden, niemals einen zweiten Launch ausführen;
- DELIVERY_EXPIRED: keine Rekonstruktion und keine zweite Session mit
  derselben Capability; neuer vollständiger Start erforderlich.

Ein vollständiger Remount rekonstruiert weder SkillPilot-ID, Capability noch
Session aus Widget-State oder Browserstorage. Bei EXISTING kann die Person einen
neuen Versuch starten und ihre ID erneut eingeben. Bei CREATE muss die ID vor
jeder weiteren Einrichtung ausdrücklich extern gesichert werden; wurde die
Komponente vorher geschlossen, kann der neu erzeugte Lernstand unzugänglich
werden. Eine bereits erzeugte, aber nicht an den Host übergebene Session kann
auslaufen. Diese Restrisiken begründen mittelfristig den Pre-Session-
Setup-Refactor aus Abschnitt 13, werden aber nicht durch Host-Storage oder eine
ID-Übergabe an ChatGPT kaschiert.

### 7.5 Verbindlicher Datenschutzhinweis

Vor Capability-Ausstellung wird die unveränderliche Fassung
openai-provider-eligibility-v2 semantisch gleichwertig auf Deutsch und Englisch
angezeigt und bestätigt:

> **DE:** Diese Komponente läuft innerhalb von ChatGPT. Du kannst hier eine
> neue SkillPilot-ID erzeugen oder eine vorhandene verwenden sowie Curriculum
> und Personalisierung abschließen, ohne SkillPilot zu öffnen. Deine
> SkillPilot-ID wird nicht in den Chat, Modellkontext, MCP-Toolargumente,
> MCP-Toolresultate, UI-Metadaten oder ChatGPT-Widget-Speicher geschrieben.
> Der ChatGPT-Host stellt die Komponente bereit und vermittelt den app-internen
> Capability-Aufruf einschließlich der nur für die UI bestimmten Metadaten.
> Nach deiner Bestätigung kommuniziert die Komponente direkt per HTTPS mit
> SkillPilot. Eine neu erzeugte ID wird nur hier angezeigt; sichere sie, bevor
> du fortfährst. Erst nach abgeschlossener Einrichtung wird die kurze
> Startnachricht mit der Lernsession-ID bewusst zur Aufnahme in Chat und
> Modellkontext an den Host übergeben. Da die Komponente im ChatGPT-
> Clientprozess läuft, kann SkillPilot keine absolute technische
> Nichtbeobachtbarkeit gegenüber dem Plattformbetreiber versprechen. Zusätzlich
> gelten dessen Datenschutzbedingungen.

> **EN:** This component runs inside ChatGPT. You can create a new SkillPilot ID
> or use an existing one and complete curriculum selection and personalisation
> here without opening SkillPilot. Your SkillPilot ID is not written to the
> chat, model context, MCP tool arguments, MCP tool results, UI metadata, or
> ChatGPT widget storage. The ChatGPT host presents
> the component and mediates the app-internal capability call, including
> UI-only result metadata. After your confirmation, the component communicates
> directly with SkillPilot over HTTPS. A newly created ID is displayed only
> here; save it before continuing. Only after setup is complete is the short
> start message containing the learning-session ID intentionally submitted to
> the host for inclusion in the chat and model context. Because the component
> runs in the ChatGPT client process, SkillPilot cannot promise absolute
> technical non-observability to the platform operator. The platform
> provider's privacy terms also apply.

## 8. Direkter Bootstrap-Endpunkt

### 8.1 Feste V1-Adressen

Für V1 gelten verbindlich:

~~~text
UI-Domain:
https://mcp-coach-v1.skillpilot.com

Bootstrap-Endpunkt:
https://mcp-coach-v1.skillpilot.com/bootstrap/v1/launch

First-Party-Fallback:
https://skillpilot.com/
~~~

Der Bootstrap-Endpunkt ist in den content-addressierten Widgetbytes fest
eingebaut. Er wird nicht aus Toolresultaten oder Result-_meta übernommen.

### 8.2 HTTP-Vertrag

~~~http
POST /bootstrap/v1/launch HTTP/1.1
Host: mcp-coach-v1.skillpilot.com
Authorization: SkillPilotSetup <opaque setup capability>
Content-Type: application/json
~~~

Geschlossener Request:

~~~json
{
  "schemaVersion": 1,
  "identityMode": "EXISTING",
  "skillpilotId": "<dauerhafte SkillPilot-ID>",
  "communicationLocale": "de",
  "launchIntent": {
    "type": "CURRENT_UNIT"
  },
  "providerNoticeVersion": "openai-provider-eligibility-v2",
  "clientRequestId": "<UUID-v4>"
}
~~~

Für eine Neuanlage lautet derselbe geschlossene Request:

~~~json
{
  "schemaVersion": 1,
  "identityMode": "CREATE",
  "communicationLocale": "de",
  "launchIntent": {
    "type": "CURRENT_UNIT"
  },
  "providerNoticeVersion": "openai-provider-eligibility-v2",
  "clientRequestId": "<UUID-v4>"
}
~~~

Verbindlich:

- ausschließlich POST und OPTIONS;
- ausschließlich application/json mit einem harten Bodylimit von höchstens
  8 KiB;
- unbekannte und doppelte JSON-Schlüssel werden abgewiesen;
- `identityMode` ist exakt `EXISTING` oder `CREATE`; bei `EXISTING` ist
  `skillpilotId` verpflichtend, bei `CREATE` muss das Feld vollständig fehlen;
- Locale nur de oder en, Intent exakt CURRENT_UNIT, UUID exakt Version 4;
- SkillPilot-ID nur nach der bereits bestehenden kanonischen ID-Grammatik und
  deren Längenbegrenzung; keine abweichende Bootstrap-Normalisierung;
- die Capability ist der autoritative Nachweis der zuvor bestätigten
  Providerhinweis-Version; der direkte Request wiederholt keinen frei
  manipulierbaren Bestätigungs-Boolean;
- Capability nur im Authorization-Header, niemals Pfad oder Query;
- fetch verwendet credentials omit und redirect error;
- der Server erzeugt keine Redirect-Antwort;
- Authorization und Body werden in Proxy, App, Fehlerbericht und Telemetrie
  vollständig redigiert.

Geschlossene Erfolgsantwort:

~~~json
{
  "schemaVersion": 1,
  "status": "SESSION_CREATED",
  "communicationLocale": "de",
  "expiresAt": "2026-08-10T12:00:00Z",
  "startMessage": "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: sps_..."
}
~~~

Nur bei `identityMode=CREATE` ergänzt die direkte HTTPS-Antwort genau das Feld
`createdSkillpilotId`:

~~~json
{
  "schemaVersion": 1,
  "status": "SESSION_CREATED",
  "communicationLocale": "de",
  "expiresAt": "2026-08-10T12:00:00Z",
  "startMessage": "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: sps_...",
  "createdSkillpilotId": "<neu vergebene dauerhafte SkillPilot-ID>"
}
~~~

`createdSkillpilotId` ist bei `EXISTING` verboten. Die Komponente übernimmt
den Wert ausschließlich in ihre flüchtige Laufzeitreferenz und das sichtbare
Recovery-DOM-Feld; er darf insbesondere nicht in ein MCP-Resultat oder dessen
`_meta` kopiert werden.

Für Englisch beginnt startMessage exakt mit:

~~~text
Use SkillPilot Coach v1 and continue.
learningSessionId: sps_...
~~~

Die learningSessionId wird nicht als separates JSON-Feld dupliziert. Das Widget
validiert die `startMessage` gegen das exakte locale- und major-spezifische
Template und extrahiert daraus genau ein gültiges Sessiontoken ausschließlich
für die componentseitigen Sessiontools. Die vollständige Nachricht bleibt
bytegleich und wird weder rekonstruiert noch verändert; Nachricht und
extrahiertes Token liegen nur in flüchtigen Laufzeitreferenzen bis zum Handoff.
Das Backend akzeptiert für startMessage ausschließlich das kanonische
major- und locale-spezifische Template mit genau einem gültigen Sessiontoken;
freie oder clientseitig gelieferte Instruktionstexte sind ausgeschlossen.

Antworten setzen mindestens:

~~~http
Cache-Control: no-store
Pragma: no-cache
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
~~~

### 8.3 Capability-Autorisierung

Der direkte Request enthält absichtlich kein MCP-OAuth-Access-Token. Die
Setup-Capability ist der delegierte Nachweis einer zuvor am app-only Tool
geprüften V1-OAuth-Autorisierung für genau diesen Bootstrap-Zweck.

Die Capability:

- besitzt mindestens 256 Bit Zufall und eine nicht verlängerbare absolute TTL
  von zehn Minuten;
- ist an Zweck OPENAI_V1_CURRENT_UNIT_BOOTSTRAP, Contract Major 1,
  Resource/Audience, `skillpilot.openai.v1.read`,
  `skillpilot.openai.v1.write`, opake serverseitige
  OAuth-Autorisierungsreferenz, monotone `policyRevision`, die normalisierte
  `sourceMajorDecision` und `providerNoticeVersion` gebunden;
- enthält keine SkillPilot-ID, keinen Lernenden und keine Lernsession;
- wird nur in Result-_meta ausgegeben;
- wird in URL, Chat, Modellkontext, Telemetrie und Logs niemals ausgegeben;
- ist ausschließlich ein opaker `spc_`-Handle aus 32 Zufallsbytes. Alle
  Claims liegen in einem serverseitigen Capability-Datensatz; der Handle
  enthält keinen selbstbeschreibenden oder verschlüsselten Envelope;
- wird über einen domain-separierten keyed Fingerprint nachgeschlagen und in
  konstanter Zeit gebunden.

Der serverseitige Capability-Datensatz ist geschlossen und enthält mindestens
Fingerprint samt Key-ID, Status, Contract Major, Zweck, OAuth-
Autorisierungsreferenz, Client, Resource/Audience, Scopes, Providerhinweis-
Version, `policyRevision`, normalisierte `sourceMajorDecision`, Ausstellungs-
und Ablaufzeit sowie Löschfrist. Seine monotone Zustandsmaschine lautet:

~~~text
ISSUED -> BOUND
ISSUED -> INVALIDATED_TERMINAL
BOUND  -> CONSUMED
BOUND  -> INVALIDATED_TERMINAL
CONSUMED -> INVALIDATED_TERMINAL
~~~

Ein Policy-, Major-, Hinweis- oder Notfall-BLOCK-Konflikt setzt den Datensatz
terminal ungültig. Auch wenn die Konfiguration später wieder denselben
fachlichen Wert annimmt, darf diese Capability niemals erneut gültig werden.
Das gilt auch nach einem erfolgreichen Launch: Vor jedem Replay des gespeicherten
Resultats kann eine `CONSUMED` Capability wegen OAuth-Widerruf oder veralteter
Policy terminal invalidiert werden. Der zugehörige SUCCEEDED Attempt wird dabei
FAILED_TERMINAL, sein verschlüsseltes Delivery-Resultat wird gelöscht und jeder
spätere Retry erhält denselben neutralen terminalen Fehler.

Vor Erstbindung und vor jeder Auslieferung eines gespeicherten Resultats prüft
der Server die referenzierte OAuth-Autorisierung und die aktuelle
`policyRevision`/newSessionPolicy erneut. Widerruf, Majorwechsel, Hinweiswechsel oder
Notfall-BLOCK führen fail-closed zum Abbruch. Die Capability ersetzt OAuth nur
als delegierter Nachweis am genau bezeichneten Bootstrap-Endpunkt, niemals an
fachlichen MCP-Tools.

Widget und Endpoint akzeptieren oder übertragen weder client_id noch
Client-Secret, Authorization Code, PKCE-Verifier, Refresh Token oder
mTLS-Clientzertifikat.

### 8.4 UI-Metadaten, CSP und CORS

Die Startressource veröffentlicht standard-first:

~~~json
{
  "_meta": {
    "ui": {
      "domain": "https://mcp-coach-v1.skillpilot.com",
      "prefersBorder": true,
      "csp": {
        "connectDomains": [
          "https://mcp-coach-v1.skillpilot.com"
        ],
        "resourceDomains": []
      }
    },
    "openai/widgetDomain": "https://mcp-coach-v1.skillpilot.com",
    "openai/widgetCSP": {
      "connect_domains": [
        "https://mcp-coach-v1.skillpilot.com"
      ],
      "resource_domains": [],
      "redirect_domains": [
        "https://skillpilot.com"
      ]
    }
  }
}
~~~

Im standardisierten ui.csp wird kein nicht standardisiertes redirectDomains
verwendet. Der ChatGPT-Kompatibilitätsalias redirect_domains bleibt getrennt.

ChatGPT Web führt die Komponente trotz der deklarierten `ui.domain` unter einer
isolierten Browser-Origin der Form
`https://<pluginbezogener-host>.web-sandbox.oaiusercontent.com` aus. Der
Bootstrap erlaubt deshalb zusätzlich zur deklarierten Widget-Origin nur
HTTPS-Subdomains dieser OpenAI-Sandbox-Familie. Er setzt niemals den
pauschalen Wert `*`, erlaubt weder `null` noch HTTP und spiegelt bei einer
zulässigen Cross-Origin-Anfrage ausschließlich die konkrete Request-Origin.

Für die aktuell beobachtete ChatGPT-Web-Origin antwortet der Endpoint:

~~~http
Access-Control-Allow-Origin: https://mcp-coach-v1-skillpilot-com.web-sandbox.oaiusercontent.com
Vary: Origin
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
~~~

Access-Control-Allow-Credentials wird nicht gesetzt. Originprüfung ist eine
zusätzliche Eingrenzung, keine Autorisierung.

Der Phase-0-Canary bestätigt die konkrete Zieloberfläche und die daraus
resultierende Sandbox-Origin. Eine andere HTTPS-Subdomain derselben
OpenAI-Sandbox-Familie darf den Preflight ebenfalls passieren, besitzt dadurch
aber noch keine Startberechtigung: Autoritativ bleibt ausschließlich die zuvor
über OAuth und das app-only Werkzeug ausgestellte kurzlebige Capability. Andere
Domains, Suffix-Tricks, HTTP und `Origin: null` bleiben gesperrt.

### 8.5 Rate Limits und Beobachtbarkeit

Der implementierte Phase-1-Basisschutz verwendet konfigurierbare lokale
Fixed-Window-Budgets. Die Capability-Ausstellung wird nach pseudonymisierter
OAuth-Autorisierungsreferenz, Contract Major und registriertem Client sowie
zusätzlich instanzweit begrenzt. Der direkte Bootstrap wird getrennt nach der
vom Servlet-Container normalisierten Clientadresse, einem ausschließlich
flüchtig gebildeten Capability-Pseudonym und instanzweit begrenzt. Bei einer
Überschreitung antwortet der direkte Endpoint mit dem geschlossenen
`TEMPORARILY_UNAVAILABLE`-Schema, HTTP 429 und `Retry-After`; die Capability
oder Autorisierungsreferenz erscheint weder in Antwort noch Telemetrie.

Vor einem produktiven Multi-Instance-Betrieb bleibt als eigenes Freigabegate,
dieselben Grenzen am vertrauenswürdigen Gateway oder in einem gemeinsamen
verteilten Limiter instanzübergreifend durchzusetzen und die produktiven
Budgets anhand der Canary-/Lastdaten festzulegen.
openai/subject und openai/session bleiben dabei ausschließlich optionale
pseudonymisierte Defense-in-depth-Signale.

Alarme dürfen Häufungen von PROFILE_UNAVAILABLE, Manipulation und
Idempotenzkonflikten zählen, aber niemals ID, Capability, Session oder
Requestbody erfassen.

Eine unbekannte ID liefert das geschlossene `PROFILE_UNAVAILABLE`-Fehlerschema
mit identifierfreiem Fallback und ohne unterscheidbare Detailtexte. CREATE
erzeugt stattdessen einen neuen pseudonymen Lernenden. Ein vorhandenes oder neu
erzeugtes, fachlich noch nicht eingerichtetes Profil ist kein Fehler: Der
Direct Start erzeugt die Lernsession, und die Komponente führt den kanonischen
Coach-Zustandsautomaten vor dem Chat-Handoff über `setCurriculum` und
`setPersonalization`. Die Implementierung begrenzt grobe Timingunterschiede,
ohne über künstliche Wartezeiten einen neuen Denial-of-Service-Hebel zu
schaffen.

## 9. Atomare Sessionerzeugung, Recovery und Idempotenz

### 9.1 Gemeinsame fachliche Grenze

Der Pluginstart implementiert keine zweite fachliche Launchlogik. Er verwendet
dieselbe autoritative Validierungs- und State-Preparation-Grenze wie der
Webstart. Der Session-Issuer bleibt für beide Wege zufallsbasiert. Der
Pluginpfad ergänzt nur Attempt-Bindung und kurzlebige Resultatauslieferung.

### 9.2 Persistenter Launch-Attempt

Ein eigener Datensatz bootstrap_launch_attempt enthält mindestens:

| Feld | Zweck |
| --- | --- |
| id, contract_major, version | Identität, Majorbindung, optimistisches Locking |
| capability_fingerprint | domain-separierter keyed Fingerprint, eindeutig |
| oauth_authorization_ref | opake Referenz für Widerrufsprüfung, nie Lernendenauswahl |
| capability_expires_at | Frist des Erstgebrauchs |
| client_request_id | UUID-v4 des einen gebundenen Requests |
| request_hmac_key_id, request_hmac | keyed semantischer Requestnachweis |
| status | BOUND, SUCCEEDED oder FAILED_TERMINAL |
| terminal_code | neutraler terminaler Fehler, falls vorhanden |
| response_key_id, response_nonce, response_ciphertext | kurzlebiges AEAD-Delivery-Record |
| response_expires_at, attempt_retry_until | statusspezifische Delivery- und Retryfrist |
| bound_at, completed_at, record_expires_at | Audit- und Löschfristen |

Nicht gespeichert werden Capability-Klartext, SkillPilot-ID im Klartext in den
Bootstrap-Tabellen, Requestbody, Session-Klartext oder Startnachricht im
Klartext. Der kanonische Learner-Datensatz enthält die dauerhafte ID
notwendigerweise als seine pseudonyme Identität. Bei CREATE ist sie zusätzlich
für höchstens das Delivery-Fenster Teil des AEAD-verschlüsselten
Response-Ciphertexts, damit ein exakter Retry dieselbe neu erzeugte ID liefert.

Die Datenbank erzwingt sowohl Eindeutigkeit des Capability-Fingerprints als
auch von contract_major, oauth_authorization_ref und client_request_id. Damit
kann dieselbe Request-ID auch mit einer frisch ausgestellten Capability nicht
unbeabsichtigt eine zweite Session unter derselben App-Autorisierung erzeugen.

### 9.3 Vorvalidierung und Request-HMAC

Vor Transaktion A werden Capability, OAuth-Autorisierung, Major, Policy,
Requestschema und bei EXISTING die ID-Syntax geprüft. Danach wird ein eigener
domain-separierter HMAC gebildet:

~~~text
HMAC-SHA-256(
  K_bootstrap_request_v1,
  canonicalLengthPrefixedEncode(
    "skillpilot-bootstrap-request/v1",
    contractMajor,
    capabilityFingerprint,
    schemaVersion,
    clientRequestId,
    identityMode,
    normalizedSkillpilotIdOrEmpty,
    communicationLocale,
    launchIntent.type,
    providerNoticeVersion,
    policyRevision,
    normalizedSourceMajorDecision
  )
)
~~~

Der Schlüssel ist von Capability-, Session-HMAC- und AEAD-Schlüsseln getrennt
und besitzt eine Key-ID. Bei EXISTING findet Normalisierung genau einmal statt
und wird für HMAC und Lernendenlookup identisch verwendet. Bei CREATE ist der
Wert `normalizedSkillpilotIdOrEmpty` die kanonisch längenpräfixierte leere
Bytefolge; die später serverseitig erzeugte ID wird nicht nachträglich in den
Request-HMAC eingefügt. Ein ungekeyter Hash der SkillPilot-ID ist verboten.
Vergleiche erfolgen in konstanter Zeit.

### 9.4 Transaktion A – irreversible Requestbindung

1. Capability-Fingerprint bilden.
2. Capability-Datensatz `FOR UPDATE` sperren und Erstbindung, Fristen,
   Major-, OAuth- und Policybindung erneut prüfen.
3. Attempt mit Status BOUND, clientRequestId und requestHmac einfügen; beide
   Eindeutigkeitsgrenzen aus Abschnitt 9.2 gelten.
4. Bei Unique-Konflikt vorhandenen Attempt `FOR UPDATE` sperren.
5. Gleiche Request-ID und gleicher HMAC bedeuten zulässigen exakten Retry.
6. Jede Abweichung ergibt IDEMPOTENCY_KEY_REUSED ohne Mutation.
7. Transaktion vor jeder Profilabfrage committen.

Damit bindet bereits der erste vollständig syntaktisch gültige Request die
Capability unveränderlich. `identityMode`, bei EXISTING die gewählte ID,
spätere Crashes oder fachliche Fehler geben sie weder für eine andere ID noch
für einen Wechsel zwischen CREATE und EXISTING frei.

### 9.5 Transaktion B – autoritativer Launch

Die feste Lockreihenfolge in jeder Transaktion lautet:
**Capability vor Attempt vor Learner**. Kein Pfad darf diese Reihenfolge
umkehren oder einen Learner sperren, bevor Capability und Attempt gesperrt sind.

1. Capability `FOR UPDATE` sperren.
2. Attempt `FOR UPDATE` sperren.
3. OAuth-Widerruf, aktuelle Major-Policy und gebundene `policyRevision` erneut
   prüfen. Abweichungen setzen die Capability auch aus CONSUMED auf
   INVALIDATED_TERMINAL und den Attempt auch aus SUCCEEDED auf FAILED_TERMINAL;
   Ciphertext, Nonce und Delivery-Key-ID werden gelöscht. Jeder spätere Retry
   liefert denselben neutralen terminalen Fehler. Eine spätere Policyänderung
   reaktiviert weder Capability noch Attempt.
4. Bei SUCCEEDED ausschließlich `response_expires_at` prüfen und das
   gespeicherte Resultat innerhalb dieser Frist entschlüsseln und unverändert
   ausliefern. `attempt_retry_until` darf einen bereits committeten Erfolg
   nicht verkürzen.
5. Bei FAILED_TERMINAL bis zur Tombstone-Löschfrist denselben stabilen
   neutralen Fehler ausliefern.
6. Bei BOUND ausschließlich `attempt_retry_until` prüfen. Nach Ablauf wird der
   Attempt terminal `RETRY_EXPIRED`. Bei EXISTING wird danach der Lernende
   `FOR UPDATE` gesperrt. Bei CREATE erzeugt die kanonische Learner-Grenze genau
   eine neue zufällige SkillPilot-ID und persistiert den neuen Lernenden in
   derselben Transaktion. Danach wird in beiden Modi die gemeinsame fachliche
   Start-Preparation ausgeführt.
7. Eine unbekannte SkillPilot-ID ist nur bei EXISTING möglich und wird als
   normales persistiertes FAILED_TERMINAL mit PROFILE_UNAVAILABLE committet.
   Ein vorhandener oder neu erzeugter Lernender ohne Curriculum oder ohne
   abgeschlossenes Personal Curriculum passiert diese Grenze; die weitere
   Einrichtung bleibt Eigentum des kanonischen Coach-Zustandsautomaten und
   wird durch die Komponente über die bestehenden Sessiontools abgeschlossen.
8. Bei Erfolg innerhalb derselben Transaktion:
   - zufällige learningSessionId mit mindestens 256 Bit Entropie erzeugen;
   - CURRENT_UNIT-Stateänderungen anwenden;
   - Session-HMAC und bestehende höchstens 24h gültige Zuordnung speichern;
   - bei CREATE die neu erzeugte SkillPilot-ID ausschließlich in die direkte
     Erfolgsantwort aufnehmen;
   - vollständige Erfolgsantwort AEAD-verschlüsseln;
   - Attempt auf SUCCEEDED setzen.
9. Committen.

Eine transiente Exception oder ein Prozessabsturz vor Commit rollt nur
Transaktion B zurück; der Attempt bleibt BOUND. Der exakt gleiche Retry darf
Transaktion B erneut ausführen. Ein Crash nach Commit liefert beim Retry das
gespeicherte Resultat und erzeugt niemals eine zweite Session. Gleichzeitige
Retries serialisieren am Attempt-Lock.

Ein dauerhafter BOUND_IN_PROGRESS-Zustand ist nicht erforderlich. BOUND ist
gleichzeitig der recoverable Pending-Zustand.

Die Fehlerklassifikation ist geschlossen:

- Syntax-, Schema- und Capability-Formatfehler vor Transaktion A erzeugen
  keinen Attempt;
- deterministische fachliche Ablehnungen nach Bindung, abgelaufene
  BOUND-Fristen, Policy-/Major-/Hinweiskonflikte und ungültige Learnerzustände
  werden als FAILED_TERMINAL beziehungsweise terminale Capability-
  Invalidierung persistiert;
- Verbindungs-, Datenbank-, KMS- oder andere Infrastrukturfehler vor dem
  atomaren Erfolg bleiben nur bis `attempt_retry_until` als BOUND retrybar;
- ein Fehler beim Erzeugen oder Verschlüsseln der Erfolgsantwort rollt die
  gesamte Launch-Transaktion zurück. Nach einem committeten SUCCEEDED darf ein
  Entschlüsselungs-/Authentizitätsfehler niemals eine neue Session erzeugen;
  er liefert fail-closed DELIVERY_UNAVAILABLE.

### 9.6 AEAD-Delivery-Record

Verschlüsselt wird die vollständige, bereits gerenderte Erfolgsantwort:

~~~json
{
  "schemaVersion": 1,
  "status": "SESSION_CREATED",
  "communicationLocale": "de",
  "expiresAt": "<absolute session expiry>",
  "startMessage": "<exact immutable message>"
}
~~~

Bei CREATE gehört `createdSkillpilotId` zur verschlüsselten Erfolgsantwort; bei
EXISTING ist das Feld verboten. Der Klarwert wird niemals in separaten
Attempt-Spalten, Logs oder Metriken dupliziert.

Verbindlich:

- AES-256-GCM oder XChaCha20-Poly1305 mit KMS-verwaltetem Schlüssel;
- frische Nonce je Record;
- Associated Data aus Attempt-ID, Contract Major, Capability-Fingerprint,
  Request-HMAC und Response-Schema-Version;
- Key-ID und Keyring mindestens für das Delivery-Fenster;
- keine Rekonstruktion aus einer später geänderten Prompt-, Skill- oder
  Workflowversion;
- Entschlüsselung nur bei exakt gleichem Request, gültiger Major-Linie und
  weiterhin gültiger OAuth-Autorisierung.

Die deterministische Ableitung einer learningSessionId ist ausdrücklich nicht
Teil dieser Architektur.

### 9.7 Fristen und Retrymatrix

| Gegenstand | Verbindliche Frist |
| --- | --- |
| unbenutzte Setup-Capability | zehn Minuten ab Ausstellung |
| gebundener, noch nicht abgeschlossener Attempt | exakte Retries bis 15 Minuten ab Bindung |
| verschlüsselte Erfolgsantwort | 15 Minuten ab Commit |
| learningSessionId | absolut höchstens 24 Stunden |
| Attempt-Tombstone | mindestens bis zum späteren Ende von Session-, Delivery- und Attemptfrist; danach zeitnah löschen |

Ciphertext und Nonce werden unmittelbar nach Delivery-Ablauf gelöscht.

Der Capability-Ablauf verhindert jede neue Erstbindung. Wurde der Attempt vor
Ablauf erfolgreich auf genau diesen Request gebunden, darf derselbe inzwischen
abgelaufene Capability-Wert innerhalb der Attempt- beziehungsweise
Delivery-Frist nur noch zur kryptografischen Identifikation dieses exakten
Attempts dienen. Er autorisiert weder einen anderen Request noch einen neuen
Launch; OAuth-Widerruf und aktuelle Major-Policy werden weiterhin geprüft.

| Fall | Ergebnis |
| --- | --- |
| erster gültiger Request | genau eine zufällige Session und ein gespeichertes Resultat |
| gleicher Request während BOUND | Transaktion B fortsetzen, höchstens eine Session |
| gleicher Request nach SUCCEEDED innerhalb Delivery-Frist | exakt gespeichertes Resultat |
| gleicher clientRequestId oder Capability-Fingerprint mit anderem HMAC | IDEMPOTENCY_KEY_REUSED, keine Mutation |
| PROFILE_UNAVAILABLE | dauerhaft FAILED_TERMINAL für diesen Attempt |
| transienter Corefehler | BOUND bleibt retrybar |
| Crash nach Sessioncommit vor HTTP-Antwort | gespeichertes Resultat, keine zweite Session |
| OAuth widerrufen oder Policy BLOCK vor Retry | Capability einschließlich CONSUMED terminal invalidieren; keine Resultatauslieferung; Session läuft ungenutzt aus |
| Delivery-Frist abgelaufen | DELIVERY_EXPIRED; keine Rekonstruktion und keine zweite Session |
| BOUND-Frist abgelaufen | terminal RETRY_EXPIRED; kein späterer Launch |
| PolicyRevision/Entscheidung/Providerhinweis abweichend | terminal invalidiert; kein Wiederaufleben |

## 10. Übergabe an den Host und Chat

Nach erfolgreicher Sessionerzeugung hält das Widget die Startnachricht zunächst
zurück. Erst nachdem bei CREATE die Recovery-Bestätigung vorliegt und der
neueste componentseitig geladene Vollkontext weder `setCurriculum` noch
`setPersonalization` verlangt, bittet es den Host über den für den Versuch
fixierten Standard- oder ChatGPT-Kompatibilitätskanal, exakt die vom Backend
gelieferte startMessage als User-Nachricht aufzunehmen.

Regeln:

- keine SkillPilot-ID, Capability oder anderen Bootstrapwerte;
- genau eine learningSessionId;
- kein Handoff vor abgeschlossener ID-Recovery-Bestätigung, Curriculumwahl und
  Personalisierung;
- keine clientseitige Rekonstruktion oder Änderung;
- bei Ablehnung, Timeout oder unbekanntem Ergebnis nur dieselbe gespeicherte
  Nachricht erneut senden, niemals den Launch wiederholen;
- ein unbekannter Hostausgang kann bedeuten, dass die erste Nachricht bereits
  angenommen wurde. Ein erneuter Versand derselben Nachricht kann deshalb
  eine sichtbare Dublette erzeugen; er darf dennoch niemals eine zweite
  Session oder abweichende Nachricht erzeugen;
- nach bestätigter Hostannahme kann das Widget Teardown anfordern;
- erwarteter nächster Modellschritt ist get_skillpilot_context mit
  unveränderter learningSessionId.

Bis zur Hostannahme hält das Widget die opake startMessage nur in einer lokalen
Laufzeitreferenz für denselben Nachrichten-Retry. Nach Hostannahme, Abbruch
oder spätestens beim früheren Ende von Delivery- und Sessionfrist entfernt es
diese Referenz bestmöglich und sperrt weitere Nachrichtenaufrufe über beide
Kanäle. Sie wird nie in Widget-State oder Browserstorage persistiert.

Die Bestätigung von `ui/message` beziehungsweise das erfolgreiche Auflösen von
`sendFollowUpMessage` beweist ausschließlich, dass der Host die
Nachrichtenanfrage angenommen hat. Sie beweist weder, dass das Modell
geantwortet, der Skill geladen oder get_skillpilot_context stattgefunden hat.
Der Widget-Endzustand heißt deshalb HOST_MESSAGE_ACCEPTED, nicht DELIVERED.

Nur die startMessage macht die kurzlebige learningSessionId modell- und
chatsichtbar. Alle anderen Bootstrapwerte bleiben außerhalb des Transkripts.

## 11. Fehler- und Recovery-Vertrag

| Situation | Verhalten |
| --- | --- |
| falscher Client, falsche Clientauthentisierung oder nicht unterstützter Grant | bestehender OAuth-Server lehnt vor Toolaufruf ab |
| client_credentials | nicht unterstützt; kein mTLS- oder Lernendenfallback |
| `skillpilot.openai.v1.read` fehlt | open_skillpilot_start abweisen |
| `skillpilot.openai.v1.write` fehlt | Capability-Issuer abweisen |
| Host ohne vollständigen Standard- oder ChatGPT-Kompatibilitätskanal | keine Capability, keine Session, Webfallback |
| WARN ohne ausdrückliche Entscheidung | DECISION_REQUIRED, keine Capability |
| BLOCK oder Notfallsperre | keine Capability und keine neue Session |
| Hinweisversion veraltet | NOTICE_REFRESH_REQUIRED |
| Capability fehlt, ist manipuliert, major-fremd oder beim Erstgebrauch abgelaufen | keine Session |
| Requestschema oder ID-Syntax ungültig | keine Bindung und keine Session |
| `identityMode=CREATE` | genau einen neuen Lernenden plus Session erzeugen; neue ID nur in direkter HTTPS-Antwort; vor Einrichtung Recovery bestätigen |
| `identityMode=EXISTING`, unbekannte ID | persistiertes neutrales PROFILE_UNAVAILABLE |
| vorhandene oder neue ID ohne Curriculum oder vollständige Personalisierung | Session erzeugen; Komponente folgt `setCurriculum` beziehungsweise `setPersonalization` bis zum vollständigen Setup; erst danach Chat-Handoff |
| Setup-Write mit 409 | Optionen verwerfen, Kontext genau einmal frisch laden und nur mit neuer `stateVersion` fortsetzen |
| unklarer Setup-Write-Transportausgang | ausschließlich unveränderten Versuch mit derselben `clientRequestId` wiederholen |
| anderer Request nach Bindung | IDEMPOTENCY_KEY_REUSED |
| transienter Corefehler | BOUND bleibt nur für exakten Retry |
| Responseverlust nach Commit | gespeichertes AEAD-Resultat innerhalb Delivery-Frist |
| Delivery-Frist abgelaufen | DELIVERY_EXPIRED, neuer vollständiger Start |
| Nachrichtenaufruf abgelehnt oder unklar | identische Nachricht auf demselben Kanal erneut senden, kein Relaunch und keine erneute Setup-Mutation |
| Lernsession abgelaufen | unveränderter SESSION_REQUIRED-Vertrag |
| Artefakt einer anderen Major-Linie | MAJOR_MISMATCH vor Projektion oder Mutation |
| Ziel-Major vor Commit nicht verfügbar | Quell-Major nur bei dessen aktueller Policy ALLOW oder WARN ausdrücklich anbieten |
| Ziel-Major nach Commit nicht verfügbar | nur idempotenter Retry in derselben Ziel-Major-Linie |

Fehler, Logs und Telemetrie enthalten ID, Capability und learningSessionId nie
im Klartext.

## 12. Datenschutz- und Veröffentlichungsgrenze

### 12.1 Internes Entwicklungsgate

Das Plugin ist noch nicht veröffentlicht. Der bisherige Slice mit manueller
Eingabe einer vorhandenen SkillPilot-ID ist implementiert und automatisiert
getestet. Der vollständige In-Component-Wizard für CREATE, EXISTING,
Curriculum und Personalisierung ist der aktuelle interne Entwicklungsstand;
sein Einsatz bleibt auf den internen Canary begrenzt. Weder Implementierung
noch ein späterer interner Canary-Erfolg ist eine öffentliche Freigabe.

### 12.2 Hartes Gate vor öffentlicher Einreichung

OpenAIs aktuelle Pluginrichtlinien untersagen das Erheben, Anfordern oder
Verarbeiten von Zugangs- und Authentifizierungsgeheimnissen einschließlich
Passwörtern. Siehe
[Plugin guidelines](https://developers.openai.com/plugins/app-guidelines).

Die SkillPilot-ID ist in der heutigen Architektur mindestens zugangsähnlich.
Ein Datei-Passwort oder eine PIN wäre eindeutig credentialartig. Deshalb gilt:

> **Es erfolgt keine öffentliche Einreichung eines Widgets, das eine vorhandene
> oder neu vergebene SkillPilot-ID, ID-Datei, Passwort oder PIN verarbeitet,
> solange OpenAI diese konkrete Verarbeitung nicht ausdrücklich schriftlich
> akzeptiert hat oder eine separat freigegebene Architektur ohne diese Werte
> vorliegt.**

Manuelle ID-Eingabe löst dieses öffentliche Gate nicht. Dateiimport ist nicht
Teil von Phase 1 und benötigt zusätzlich ein eigenes Sicherheits- und
Policyreview.

### 12.3 Offenlegung und Aufbewahrung

Vor einer späteren Freigabe müssen Datenschutzerklärung und Widget mindestens
folgende Kategorien, Zwecke, Empfänger und Fristen klar benennen:

- vorhandene SkillPilot-ID zur Lernendenauswahl, nur im direkten Request;
- neu vergebene SkillPilot-ID, nur in direkter HTTPS-Antwort, flüchtiger
  Recovery-Darstellung, kanonischem Learner-Datensatz und kurzlebig
  verschlüsseltem Delivery-Record;
- Curriculum- und Personalisierungsoptionen sowie bestätigte Auswahlen, die
  über die bestehenden sessiongebundenen MCP-Werkzeuge durch den Host
  vermittelt werden;
- Locale, Providerhinweis-Version und Bestätigung;
- pseudonymisierte OAuth-Autorisierungsreferenz;
- Capability-Fingerprint, Request-HMAC und Attemptstatus;
- kurzlebig verschlüsseltes Delivery-Resultat, 15 Minuten;
- Session-HMAC und Lernsessionzuordnung, höchstens 24 Stunden;
- minimale Netzwerk- und Sicherheitsdaten für Rate Limits und Missbrauchsschutz;
- OpenAI/ChatGPT als Host der Komponente und eigener Plattform-
  Datenschutzvertrag;
- die ehrliche Grenze, dass eine im ChatGPT-Clientprozess laufende Komponente
  keine absolute Nichtbeobachtbarkeit gegenüber dem Plattformbetreiber
  garantieren kann;
- Lösch-, Widerrufs- und Supportmöglichkeiten.

Das öffentliche Listing muss außerdem klar 13+ positioniert sein und darf nicht
ausdrücklich Kinder unter 13 adressieren. Eine Checkbox allein ersetzt diese
Produkt-, Copy- und Reviewprüfung nicht.

## 13. Ausbauphasen und aktueller Stand

### Phase 0: Vertrag und Sicherheitsbasis – Implementierungsbasis abgeschlossen

- dieses Konzept als verbindliche Architektur führen;
- Lifecycle-Quelle und private Contract-Line-Runtimeprojektion in Release- und
  CI-Prüfungen gegen das kanonische Schema validieren und gegen Drift sperren;
- Tool-, private _meta-, Endpoint-, Attempt-, Fehler- und Löschschemas
  festschreiben;
- Bedrohungsmodell- und Datenschutzanforderungen dokumentieren;
- überholte OAuth-zu-Lernenden-Experimente ausdrücklich verwerfen;
- Public-Release-Gate dokumentieren.

Die Vertrags-, Schema- und Implementierungsbasis ist umgesetzt. Das formale
Datenschutz-/Bedrohungsreview für einen späteren produktiven oder öffentlichen
Betrieb bleibt ein separates Freigabegate und ist durch diesen Stand nicht als
abgeschlossen behauptet.

### Phase 1: Vollständiger In-Component-Slice, echter Host-Canary ausstehend

- Wahl zwischen CREATE und EXISTING;
- neue ID ausschließlich über direkte HTTPS-Antwort, flüchtige DOM-
  Recovery-Darstellung und ausdrückliche Sicherungsbestätigung;
- vorhandene und neue Lernende einschließlich vollständiger Curriculum- und
  Personalisierungseinrichtung in derselben Komponente;
- Curriculum-Auswahl mit derselben Kategorie-, Qualitätsampel-, Defaultfilter-
  und Sortiersemantik wie in der SkillPilot-WebGUI;
- nur CURRENT_UNIT;
- Open-Tool, app-only Capability-Issuer und direkter Endpoint;
- bestehende modell- und appsichtbare Sessiontools für Kontext, Curriculum und
  Personalisierung mit expliziter Component-Aufruf-Freigabe;
- Zwei-Transaktions-Attempt, zufällige Session und AEAD-Delivery;
- Hostannahme über genau einen Standard- oder ChatGPT-Kompatibilitätskanal und
  bestehender Webfallback;
- im normalen App-first-Ablauf kein Öffnen der SkillPilot-Webanwendung;
- keine Datei, keine PIN und kein automatischer ID-Export.

Dieser Slice ist implementiert und durch lokale Widget-, Contract-, Backend-
und Security-Tests abgedeckt. Produktionsnahe Postgres-Concurrency-Tests,
Fault-Injection nach fachlicher Learner-/Sessionmutation, die Durchführung eines
echten OpenAI-Host-Canarys sowie deren dokumentierte Nachweise stehen noch aus.

### Phase 2: Betriebs- und Policyhärtung nach dem internen Canary

- zusätzliche Postgres-Concurrency-/Soak-Tests, Betriebsalarme und
  Schlüsselrotationsübungen über die bereits in Phase 1 vorhandenen
  Fault-Injection-, Cleanup- und Key-ID-Grenzen hinaus;
- instanzübergreifende Rate Limits, produktive Budgetkalibrierung und
  Missbrauchsalarme über die implementierten lokalen Issuer-, Capability-,
  Client- und Gesamtbudgets hinaus;
- Datenschutz- und Missbrauchsaudit;
- echte OpenAI-Canaries;
- Entscheidung über eine public-review-fähige Identitätsarchitektur oder
  ausdrückliches schriftliches OpenAI-Clearance.

### Phase 3: Optionaler interner Datei-Spike

- nur nach eigener Freigabe;
- kein Bestandteil des Phase-1-Vertrags;
- bestehendes Dateiformat und lokale Kryptografie getrennt reviewen;
- Public-Release-Gate bleibt davon unberührt.

### Phase 4: Pre-Session-Setup und erweiterte Recovery

- serverseitige kurzlebige Setup-Draftreferenz statt bereits während der
  Einrichtung laufender Lernsession;
- Lernsession erst nach vollständiger Curriculum- und
  Personalisierungsbestätigung;
- optionaler verschlüsselter Export, Dateiimport und Recovery als jeweils
  eigener freizugebender Vertrag;
- semantische Parität mit dem bestehenden Setup-Zustandsautomaten, keine zweite
  Fachlogik und keine Abschwächung der ID-Datenflussgrenze.

### Phase 5: Weitere Startarten

- Verified Recall;
- Abitur-/Prüfungsmodus;
- jeweils eigene typisierte Intents, Voraussetzungen und Tests.

## 14. Test- und Abnahmekriterien für Phase 1

### 14.1 OAuth- und Identitätsregressionen

1. Fester V1-Confidential-Client und exakt client_secret_basic bleiben erhalten.
2. Nur Authorization Code mit PKCE S256 und Refresh Token werden unterstützt.
3. Falsches Secret und client_credentials werden ohne Capability oder Session
   abgewiesen.
4. Die gesamte Integration funktioniert ohne mTLS.
5. Kein OAuth-Credential erscheint außerhalb des Tokenvertrags.
6. OAuth allein löst weder Lernenden noch Session auf.
7. SkillPilot-ID oder learningSessionId allein autorisieren kein fachliches
   MCP-Tool.
8. Fachliche Tools verlangen weiterhin OAuth und learningSessionId.
9. Callback und Refresh erzeugen oder verlängern keine Lernsession.
10. Neue Tabellen und Claims enthalten keine OAuth-Subject-zu-Lernenden-
    Bindung.

### 14.2 Tool-, Schema- und Lifecycle-Vertrag

1. Open-Tool ist modell- und appsichtbar, UI-gebunden, read-only und idempotent.
2. Open-Tool liefert nie eine Capability und braucht nur
   `skillpilot.openai.v1.read`.
3. Issuer ist app-only, nicht UI-gebunden, ID-frei, nicht read-only und nicht
   idempotent.
4. Das Modell sieht und ruft den Issuer nicht auf.
5. Beide Tools benötigen keine learningSessionId.
6. Alle öffentlichen und privaten Schemas sind geschlossen.
7. Capability steht ausschließlich in Result-_meta.
8. WARN, BLOCK mit Nachfolger, BLOCK ohne Nachfolger und RETIRED werden
   fail-closed gemäß zentraler Policy projiziert.
9. Ein veralteter Providerhinweis stellt keine Capability aus.
10. Standard-UI-Metadaten und ChatGPT-Aliasse werden getrennt geprüft.
11. Modell-Evals erzwingen: Open höchstens einmal, niemals Issuer, niemals
    SkillPilot-ID oder PIN im Chat; ohne UI ausschließlich Webfallback.
12. `get_skillpilot_context`, `set_skillpilot_curriculum` und
    `set_skillpilot_personalization` bleiben modell- und appsichtbar,
    UI-ungebunden und explizit component-aufrufbar; keines erhält oder liefert
    eine permanente SkillPilot-ID.

### 14.3 Capability-, Endpoint- und Kryptotests

1. Zweck, Major, Resource, Scopes, OAuth-Referenz, Hinweisversion, Revision und
   TTL werden geprüft.
2. Manipulierte, fremde, abgelaufene oder anders gebundene Capabilities
   mutieren nichts.
3. Endpoint akzeptiert nur exakte Origin, Methode, Header und geschlossenes
   JSON unter dem Bodylimit; `identityMode=EXISTING` verlangt genau eine ID,
   `identityMode=CREATE` verbietet das ID-Feld.
4. Doppelte oder unbekannte JSON-Schlüssel werden abgewiesen.
5. Capability steht nie in URL oder Logs; Body und Header sind redigiert.
6. Request-HMAC nutzt eigenen Key, kanonische Kodierung und konstante
   Vergleiche.
7. AEAD-Tag, Associated Data, Key-ID und Keyrotation werden negativ wie positiv
   getestet.
8. Falscher Key oder Tag liefert fail-closed kein Resultat.
9. Ciphertext, Nonce und Attempts werden fristgerecht gelöscht.

### 14.4 Reale Transaktions-, Concurrency- und Fault-Injection-Tests

1. Crash vor Transaktion A erzeugt keine Bindung.
2. Crash nach A-Commit lässt BOUND für exakten Retry bestehen.
3. Crash nach Lernendenmutation, aber vor B-Commit rollt Mutation und Session
   gemeinsam zurück.
4. Crash nach B-Commit vor HTTP-Antwort liefert beim Retry exakt das
   gespeicherte Resultat.
5. Parallel verschachtelte Erst- und Retrypfade halten ausnahmslos die
   Lockreihenfolge Capability vor Attempt vor Learner ein und erzeugen keinen
   Deadlock.
6. Zwei parallele identische Requests erzeugen höchstens eine Session.
7. Zwei abweichende Requests können dieselbe Capability nie neu binden.
8. PROFILE_UNAVAILABLE für eine unbekannte EXISTING-ID bleibt persistiert
   terminal; vorhandene, noch nicht eingerichtete Lernende starten erfolgreich
   und werden componentseitig über `setCurriculum` beziehungsweise
   `setPersonalization` eingerichtet.
9. Transienter Fehler bleibt BOUND und übernimmt keine Teildaten.
10. OAuth-Widerruf vor Retry invalidiert auch eine bereits CONSUMED Capability
    terminal, setzt einen SUCCEEDED Attempt auf FAILED_TERMINAL, löscht das
    verschlüsselte Delivery-Resultat und verhindert jede Resultatauslieferung.
11. Fristprüfungen verwenden injizierbare Uhr und exakte Grenzwerte.
12. Zwei parallele identische CREATE-Requests erzeugen exakt dieselbe neue ID
    und höchstens eine Session; ein abweichender Retry kann weder eine zweite
    ID noch eine zweite Session erzeugen.
13. Die CREATE-ID steht nur in der direkten HTTPS-Antwort und im
    AEAD-Ciphertext, niemals in Attempt-Spalten, Telemetrie oder Fehlertexten.

### 14.5 Widget- und Datenschutztests

1. Im V1-Widget existieren CREATE und EXISTING, aber weder Datei-, PIN- noch
   Passwortfeld.
2. ID erscheint nur bei EXISTING im direkten HTTPS-Request und bei CREATE in
   direkter HTTPS-Antwort, flüchtiger Laufzeitreferenz und sichtbarem Recovery-
   DOM. Sie erscheint nie in Chat, Modellkontext, MCP-Toolargument, MCP-
   Toolresultat einschließlich `_meta`, `window.openai`, provider-
   synchronisiertem State, Storage, URL, Console oder Analytics.
3. Ohne vollständiges Paar aus `tools/call` und `ui/message` oder aus
   `callTool` und `sendFollowUpMessage` entsteht weder Capability noch Session.
4. Capability-Ausstellung erfolgt erst nach ausdrücklicher Bestätigung.
5. CREATE setzt Curriculum-/Personalisierungsmutationen erst nach ausdrücklicher
   Bestätigung fort, dass die angezeigte ID extern gesichert wurde.
6. Die Komponente rendert ausschließlich die Optionen des neuesten
   Vollresultats, kopiert `expectedStateVersion` exakt und verwendet eine neue
   `clientRequestId` je neuer Auswahl sowie dieselbe nur beim unveränderten
   Transport-Retry.
7. Für `setCurriculum` ist `curriculumCatalog` vollständig 1:1 an diese
   Optionen gebunden. Tests decken alle Kategorien und Qualitätsstufen,
   `SCHOOL`+`green` als Default, exakte UND-Filterung, WebGUI-Reihenfolge,
   lokalisierte Sortierung, leere Treffer und fail-closed Schemaabweichungen
   ab. Lokale Filterwechsel erzeugen keinen Toolaufruf.
8. Die Hostnachricht wird erst ohne offenes `setCurriculum` oder
   `setPersonalization` gesendet; im normalen Flow gibt es keinen
   **SkillPilot öffnen**-Schritt.
9. Ein fehlgeschlagener Nachrichtenaufruf wiederholt nur die identische
   Nachricht auf demselben Kanal.
10. HOST_MESSAGE_ACCEPTED wird nicht als Modell- oder Coach-Erfolg bezeichnet.
11. Deutsch und Englisch sind semantisch gleichwertig.
12. Tastatur-, Fokus-, Screenreader- und Fehlerzustände sind zugänglich.
13. Webfallback enthält keine technischen Werte.

### 14.6 Integrations- und Hosttests

1. Open-Tool → Widget → CREATE oder EXISTING → app-only Issuer → direkter Start
   → Recovery-Bestätigung bei CREATE → componentseitiger Context-/Curriculum-/
   Personalisierungsablauf → ausgewählter Nachrichtenkanal → beobachteter
   modellseitiger get_skillpilot_context.
2. Die Startnachricht enthält exakt eine learningSessionId und keine ID.
3. Lernsession lebt absolut höchstens 24 Stunden.
4. Webstart bleibt verhaltenskompatibel und zufallsbasiert.
5. Lernziel-, Frontier-, Mastery-, Autopilot- und Coach-Handoff-Tests bleiben
   grün.
6. Ein echter Host-Canary prüft Resource-Binding, feste UI-Origin, CSP, CORS,
   den vollständigen Standard- und ChatGPT-Kompatibilitätskanal, Result-_meta
   und Cacheverhalten.
7. Der Canary unterscheidet Hostannahme von beobachtetem nachfolgenden
   Modell-/Toolverhalten.
8. Canaryfehler führen nie zur Aufweitung von Origin oder CSP.
9. Ein frischer Lernender erreicht ohne Verlassen der Komponente den ersten
   fachlichen Coach-Zustand; nach dem Handoff stellt das Modell keine bereits im
   Widget beantwortete Curriculum- oder Personalisierungsfrage erneut.

### 14.7 Major-Wechsel und Rollback

1. V1 ohne Nachfolger startet normal nach zentraler ALLOW-Policy.
2. V2-Draft, Review oder bloßes Deployment erzeugen kein Nachfolgerangebot.
3. Nur ein veröffentlichter, erreichbarer und canary-geprüfter V2-Nachfolger
   darf angeboten werden.
4. Ein bestehender V1-Chat und eine V1-Session bleiben vollständig V1.
5. V2 wird ausschließlich nach Benutzeraktion identifierfrei geöffnet.
6. V2 benötigt eigenen OAuth-Client, Bootstrap, ID-Auswahl und neue Session.
7. V1-Artefakte scheitern an V2 und umgekehrt vor Projektion oder Mutation.
8. WARN erlaubt V1 erst nach bewusster Wahl; BLOCK erzeugt nie Capability oder
   V1-Session.
9. BLOCK ohne Nachfolger bleibt ein kontrollierter First-Party-Fallback.
10. Rückkehr zu V1 nach V2-Fehler ist nur bei aktueller V1-Policy ALLOW oder
    WARN zulässig.
11. Nach V2-Commit gibt es nur denselben V2-Retry, kein Downgrade.
12. V1-Ressourcen bleiben byte-identisch und werden nie an V2 gebunden.

## 15. Umgesetzter Phase-1-Umfang und verbleibender Ausbau

Der umgesetzte interne Phase-1-Slice umfasst:

- zwei sessionlose MCP-Tools: Open und app-only Capability-Issuer;
- eine neue content-addressierte Startressource mit append-only Retention;
- Widget-Bridge, Parser, UI und Browser-/Lifecycle-Tests;
- zustandsbehaftete opake Setup-Capability mit domain-separiertem
  Fingerprint-, Request-HMAC- und Delivery-Key;
- bootstrap_launch_attempt mit Locking, Cleanup und AEAD-Delivery;
- dedizierten Bootstrap-Endpunkt mit striktem Parsing, CSP, CORS,
  geschlossener 429-Antwort, lokalen Client-/Capability-/Gesamtbudgets und
  Redaction;
- lokalen Issuer-Budgets nach pseudonymisierter OAuth-Autorisierungsreferenz,
  Contract Major und registriertem Client sowie instanzweitem Gesamtbudget;
- gemeinsame fachliche createLaunch-State-Preparation mit zufälligem
  Session-Issuer;
- zentrale Contract-Line-Projektion und major-lokale Bindungen;
- Toolschemas, Exporter, Skill, Policy und Release-Draft;
- Backend-, Contract-, Security- und lokale E2E-Tests sowie das
  Host-Canary-Testharness; der echte OpenAI-Host-Canary bleibt ausstehend;
- CREATE und EXISTING im direkten Endpoint, Recovery-Bestätigung für neu
  erzeugte IDs sowie vollständige componentseitige Curriculum- und
  Personalisierungseinrichtung über die bestehenden Sessiontools;
- Datenschutzangaben und Betriebsrunbook.

Ausdrücklich unangetastet bleiben:

- OAuth-Clientregistrierung, client_secret_basic, PKCE, Refresh und Scopes;
- die Trennung von OAuth, SkillPilot-ID und learningSessionId;
- bestehender Webstart;
- fachliche Lernzustandssemantik;
- mTLS und MCP-Wire-Migration;
- jede OAuth-Subject-zu-Lernenden-Migration.

Vorhandene experimentelle Änderungen, die einen OAuth-Principal an einen
Lernenden binden oder eine Session daraus ableiten, sind durch dieses Konzept
überholt. Sie dürfen nicht als Teilimplementierung fortgeführt oder released
werden.

## 16. Fest verankerte Entscheidungen und offene Betriebsparameter

### 16.1 Fest verankert

- Tool-Split in read-only Open und app-only Capability-Issuer;
- SkillPilot-ID bei EXISTING ausschließlich im direkten HTTPS-Body und bei
  CREATE ausschließlich in der direkten HTTPS-Antwort; danach nur flüchtige
  Laufzeitreferenz und sichtbares Recovery-DOM;
- niemals permanente ID in Chat, Modellkontext, MCP-Argumenten/-Resultaten,
  Resultat-`_meta`, `window.openai`, Widget-State, Browserstorage, URL, Logs oder
  Telemetrie;
- fester V1-UI-Origin und fester Bootstrap-Endpunkt;
- Capability ausschließlich im Authorization-Header;
- V1 unterstützt CREATE und EXISTING sowie Curriculum und Personalisierung in
  derselben Komponente; der normale App-first-Ablauf öffnet SkillPilot nicht;
- die serverautoritativ an die aktuelle Optionsmenge gebundene
  `curriculumCatalog`-Projektion ist die einzige Quelle für Kategorie,
  Qualitätsstatus und Sortierrang; das Widget klassifiziert nichts selbst;
- policyRevision 2 bindet diese erweiterte Capability-/Bootstrap-Semantik;
- providerNoticeVersion als bindender Vertragswert;
- Zwei-Transaktions-Attempt mit einheitlicher Lockreihenfolge Capability,
  Attempt, Learner;
- zufällige 256-Bit-Lernsession;
- vollständiges kurzlebiges AEAD-Delivery-Record;
- zehn Minuten Capability-TTL, 15 Minuten Retry/Delivery und maximal
  24 Stunden Session;
- HOST_MESSAGE_ACCEPTED statt behaupteter End-to-End-Zustellung;
- zentraler Lifecyclevertrag als einzige Zustandsquelle;
- keine Cross-Major-Wiederverwendung;
- hartes Public-Release-Gate.

### 16.2 Vor produktivem Betrieb beziehungsweise Public Release zu konkretisieren

Diese Punkte dürfen die Architektur nicht verändern:

1. konkrete KMS-/HSM-Integration und Rotationsrhythmus der getrennten Keys;
2. produktive numerische Rate-Limit-Budgets und instanzübergreifende
   Durchsetzung der bereits lokal vorhandenen Issuer-, Capability-, Client-
   und Gesamtbudgets;
3. konkrete Timeouts und begrenzte Uhrtoleranz;
4. exakte lokalisierte Copy und unveränderlicher Hash der ersten
   Providerhinweis-Version;
5. operative Alarmgrenzen und Löschjobs;
6. formale OpenAI-Policyfreigabe oder alternative öffentliche
   Identitätsarchitektur.

## 17. Verhältnis zu bestehenden Dokumenten und Implementierungen

Dieses Dokument ergänzt:

- [OpenAI-MCP-App: OAuth- und
  Lernsession-Bindung](openai-mcp-oauth-learner-session-architecture.md);
- [SkillPilot-owned Coach
  Architecture](skillpilot-owned-coach-architecture.md);
- den [Plugin-Versionierungs- und
  Lebenszyklusvertrag](openai-plugin-versioning-and-lifecycle.md).

Der Lebenszyklusvertrag bleibt alleiniger Eigentümer von Zuständen, Daten,
Nachfolgerfreigabe, Startpolicy, Rollback und Retirement. Dieses Dokument
definiert ausschließlich, wie der direkte Start diese Werte konsumiert.
Gegensätzliche Rückverweise oder optionale automatische Sessionmigrationen als
Voraussetzung des normalen Majorwechsels sind unzulässig.

Die frühere Aussage „Lernsession wird ausschließlich im First-Party-Webstart
erzeugt“ ist in den referenzierten Architekturquellen bereits um den hier
definierten capability-geschützten direkten Bootstrap-Endpunkt ergänzt.
Unverändert bleiben die getrennten Nachweise OAuth, SkillPilot-ID und
learningSessionId.

## 18. Direktstart-spezifische Folgen des zentralen Major-Lifecycles

Dieses Dokument definiert keine zweite Lifecycle-Zustandsmaschine. Das
kanonische Contract-Line-Schema, alle zulässigen Kombinationen, die
Nachfolgerfreigabe sowie der Fehlerfallback vor und nach Ziel-Major-Commit
gehören ausschließlich Abschnitt 14.1 und 14.2 des zentralen
Lebenszyklusvertrags. Der Direktstart importiert und materialisiert diesen
Vertrag unverändert.

Für den direkten Start gelten ergänzend:

1. Setup-Capability, Launch-Attempt, OAuth-Resource und Lernsession sind
   major-lokal.
2. Ein Artefakt einer anderen Major-Linie wird fail-closed abgewiesen.
3. Ein Nachfolger-Handoff enthält weder SkillPilot-ID noch Capability, Access
   Token oder learningSessionId.
4. Nur eine ausdrückliche Benutzeraktion darf den Nachfolger öffnen.
5. Der Ziel-Major führt eine eigene OAuth-Autorisierung, erneute SkillPilot-ID-
   Auswahl und neue Ziel-Major-Lernsession durch.
6. Der dauerhafte Lernstand bleibt im gemeinsamen Core; die Quell-Session wird
   nicht übernommen oder verändert.
7. Der Standard- oder Kompatibilitäts-Nachrichtenkanal ist kein Installations-,
   Autorisierungs- oder Major-Migrationskanal.
8. Alte content-addressierte Ressourcen bleiben byte-identisch lesbar und
    werden niemals an Tools einer anderen Major-Linie gebunden.

Nur wenn die kanonische Projektion einen freigegebenen nicht-null Nachfolger
enthält, gilt folgende empfohlene Kerncopy:

- DE: „SkillPilot Coach v2 ist verfügbar. Dieser Chat bleibt bei v1. Möchtest
  du v2 in einem neuen Start öffnen?“
- EN: “SkillPilot Coach v2 is available. This chat will stay on v1. Would you
  like to open v2 in a new start?”
- Erklärung: „Dein Lernstand bleibt erhalten; diese v1-Lernsession wird nicht
  übernommen.“

Der Handoff verwendet ui/open-link zu einer release-seitig allowlisteten,
stabilen First-Party-URL. Ohne sichere Linkfähigkeit wird dieselbe URL sichtbar
angeboten. Es werden keine technischen V1-Werte übergeben.

## 19. Entscheidungsformel

~~~text
App-Core-Kopplung:
vorregistrierter V1-Confidential-Client
+ client_id
+ client_secret_basic am Token-Endpunkt
+ Authorization Code mit PKCE oder Refresh Token
-> V1-OAuth-Access-Token

open_skillpilot_start:
gültiges V1-App-OAuth mit skillpilot.openai.v1.read
-> Start-UI und Contract-Line-Projektion
-> KEINE Capability und KEINE Lernendenauswahl

issue_skillpilot_start_capability:
gültiges V1-App-OAuth mit skillpilot.openai.v1.read
und skillpilot.openai.v1.write
AND Hostfähigkeiten vorhanden
AND ausdrückliche Benutzerentscheidung
-> kurzlebige V1-Setup-Capability ohne Lernendenbindung

direkter Bootstrap:
gültige V1-Setup-Capability
AND identityMode CREATE oder EXISTING
AND bei EXISTING ausdrücklich gewählte SkillPilot-ID
AND bestätigte aktuelle Providerhinweis-Version
-> bei CREATE genau eine neue SkillPilot-ID nur in direkter HTTPS-Antwort
-> zufällige V1-learningSessionId, maximal 24h
-> kurzlebig verschlüsseltes, exakt wiederholbares Delivery-Resultat

Einrichtung in derselben Komponente:
aus der unveränderten Startnachricht extrahierte V1-learningSessionId
AND jeweils neuester serverautoritativ projizierter Vollkontext
-> bestehende get_context-/set_curriculum-/set_personalization-Tools
-> niemals permanente SkillPilot-ID als MCP-Datum
-> Host-Handoff erst ohne offene Curriculum-/Personalisierungsaktion

ui/message oder sendFollowUpMessage auf dem fixierten Kanal:
opake Startnachricht
-> Host hat die Nachrichtenanfrage angenommen
-> KEIN Beweis für Modellantwort oder get_skillpilot_context

fachlicher MCP-Aufruf:
gültiges major-spezifisches App-OAuth
AND explizite gültige major-spezifische learningSessionId
-> autorisierte Lernoperation

Major-Wechsel:
zentral freigegebener veröffentlichter Nachfolger
AND ausdrückliche Benutzerentscheidung
-> identifierfreier Handoff
-> eigener Ziel-Major-OAuth-Flow
-> erneute SkillPilot-ID-Auswahl
-> neue zufällige Ziel-Major-Lernsession
-> gleicher dauerhafter Lernstand im Core

Niemals:
OAuth -> Lernender oder Lernsession
SkillPilot-ID -> OAuth- oder MCP-Autorisierung
learningSessionId -> OAuth-Autorisierung
Setup-Capability -> fachliche MCP-Autorisierung
open_skillpilot_start -> Capability-Ausstellung
app-only Tool -> SkillPilot-ID-Transport
window.openai oder Widget-State -> SkillPilot-ID-Transport oder -Persistenz
Setup-Erfolg -> Öffnen der SkillPilot-Webanwendung im normalen App-first-Flow
deterministische Ableitung -> learningSessionId
Nachrichten-Ack -> behaupteter Coach-Erfolg
client_secret_basic -> client_credentials-Grant
mTLS -> Voraussetzung dieses Ausbaus
alte Plugin-Identität -> stillschweigender Major-Wechsel
V1-Artefakt -> V2-Laufzeitartefakt
Nachfolgerhinweis -> Zustimmung, Installation oder Migration
~~~
