# Legacy: SkillPilot Lerncoach mit Startcode und Session-Token

Status: historische Architektur vom 19. Mai 2026; für keine Sprache aktueller
Laufzeitvertrag.

> Dieses Dokument bleibt als technische Rollback-Referenz erhalten. Der aktuelle
> mehrsprachige V1-Architektur ist die
> [OpenAI-MCP-App mit OAuth- und 24h-Lernsession](openai-mcp-oauth-learner-session-architecture.md).
> Dabei transportiert ChatGPT den OAuth-Zugriff automatisch. Jeder ausdrückliche
> Start in SkillPilot erzeugt eine davon getrennte, absolut höchstens 24 Stunden
> gültige Lernsession, setzt sie automatisch in die vorbereitete
> Startnachricht ein und verlangt sie danach als Argument jedes fachlichen
> Tools. Die dauerhafte SkillPilot-ID erscheint nicht im Chat. Die
> [Visible-Session-Architektur](chatgpt-visible-session-flow.md) bleibt ein
> separater Custom-GPT-Rollbackpfad. Deutsch, Englisch und jede später
> unterstützte Interaktionssprache verwenden im Normalbetrieb dieselbe
> Major-versionierte App.

Dieses Dokument beschreibt ausschließlich den früheren Browser-first-Flow für den
Start des SkillPilot Lerncoachs in ChatGPT. Ziel war, dass Lernende auf
`skillpilot.com` starten, während ChatGPT nur kurzlebige Start- und
Session-Schlüssel sieht. Die dauerhafte SkillPilot-ID blieb im Browser und
serverseitig im SkillPilot-Backend.

Erhaltener Legacy-Implementierungsstand:

- Web-Start und relevante Kampagnenstarts erzeugen Startcodes ueber `/api/ui/learners/{skillpilotId}/chat-start`.
- Custom-GPT-Actions loesen Startcodes ueber `/api/ai/{lang}/chat-start/redeem` ein.
- Neue GPT-Actions verwenden Session-Routen unter `/api/ai/{lang}/sessions/{chatSessionToken}/...`.
- Session-Routen geben `skillpilotId: null` zurueck.
- Startcodes und Chat-Session-Tokens werden serverseitig nur gehasht gespeichert.
- Legacy-AI-Routen mit SkillPilot-ID bleiben vorerst als Kompatibilitaets- und Debug-Routen bestehen, werden aber nicht mehr im Custom-GPT-Schema beworben.

## Zielbild

Der normale Einstieg ist immer:

```text
skillpilot.com -> SkillPilot Backend -> SkillPilot Lerncoach (ChatGPT) -> SkillPilot Backend
```

Nicht vorgesehen fuer den normalen Launch:

```text
SkillPilot Lerncoach -> neue SkillPilot-ID erzeugen -> User muss ID selbst sichern
```

Die SkillPilot-ID bleibt das dauerhafte Sicherheits- und Wiedererkennungsmerkmal eines Lernenden. Sie soll aber nicht in ChatGPT-URLs, ChatGPT-Prompts oder ChatGPT-Antworten transportiert werden.

## Beteiligte Schluessel

### SkillPilot-ID

Die SkillPilot-ID ist der dauerhafte Learner-Schluessel. Sie identifiziert den Lernstand im Backend.

Eigenschaften:

- langlebig
- im Browser lokal gespeichert
- optional lokal passwortverschluesselt als benannter Login gespeichert
- serverseitig in der Learner-Domain genutzt
- nicht fuer ChatGPT-URLs gedacht
- im normalen GPT-Flow nicht an ChatGPT auszugeben

### Startcode

Der Startcode ist ein kurzlebiger Einmalcode, der vom Browser erzeugt bzw. beim Backend angefordert wird, um eine GPT-Session zu starten.

Eigenschaften:

- kurz und fuer Menschen lesbar, z. B. `SP-7KQ9-M2PA`
- einmalig einloesbar
- kurze Gueltigkeit, z. B. 5 Minuten
- serverseitig an eine SkillPilot-ID gebunden
- darf im ChatGPT-Startprompt und optional in der ChatGPT-URL stehen
- nach erfolgreichem Redeem ungueltig

### Chat-Session-Token

Das Chat-Session-Token ist der Schluessel, mit dem der SkillPilot Lerncoach nach dem Startcode-Redeem weiterarbeitet.

Eigenschaften:

- zufaellig, lang und nicht sprechend, z. B. `sps_...`
- serverseitig an eine SkillPilot-ID gebunden
- zeitlich begrenzt, z. B. 24 Stunden oder bis explizit widerrufen
- kann pro GPT-Session separat erzeugt werden
- ersetzt die SkillPilot-ID in AI-Routen
- darf in GPT-internen Tool-Aufrufen verwendet werden
- soll nicht als dauerhafter User-Schluessel kommuniziert werden

## Normaler Browser-first-Flow

1. Der Lernende oeffnet `skillpilot.com`.
2. Der Browser zeigt einen bekannten **Login**-Schritt:
   - Wenn eine SkillPilot-ID vorhanden ist, wird sie verwendet.
   - Wenn keine SkillPilot-ID vorhanden ist, kann der Lernende eine neue ID beim Backend erzeugen lassen.
   - Wenn eine SkillPilot-ID lokal passwortverschluesselt gespeichert wurde, kann sie mit Name und Passwort geladen werden.
   - Alternativ kann die SkillPilot-ID direkt eingegeben werden.
3. Der Browser speichert die aktive SkillPilot-ID nur lokal fuer diese Browser-Session. Optional kann sie lokal passwortverschluesselt als benannter Login gesichert werden.
4. Der Lernende waehlt eine Skill-Landschaft bzw. bestaetigt die vorhandene Auswahl. Diese Curriculum-Auswahl wird zur SkillPilot-ID gespeichert.
5. Der Browser bereitet intern eine temporaere Browser-Session vor.
6. Fuer den Start des SkillPilot Lerncoachs ruft der Browser das Backend auf, um einen eindeutigen Einmal-Startcode zu erzeugen.
7. Das Backend erzeugt den Startcode, speichert ihn serverseitig gehasht und gibt ihn an den Browser zurueck.
8. Der Browser oeffnet den SkillPilot Lerncoach mit einem Startprompt, der nur den Startcode enthaelt.
9. Der SkillPilot Lerncoach ruft die Startcode-Redeem-Action auf.
10. Das Backend loest den Startcode ein, erzeugt ein Chat-Session-Token und gibt dieses zusammen mit dem initialen Lernstand zurueck.
11. Der SkillPilot Lerncoach verwendet ab dann nur noch das Chat-Session-Token fuer Backend-Actions.

Aus Nutzersicht sind sichtbar:

1. **Login**: neue SkillPilot-ID erstellen, gespeicherten Login laden oder SkillPilot-ID eingeben.
2. **Curriculum**: Skill-Landschaft auswaehlen.
3. **Start**: Cockpit oeffnen oder SkillPilot Lerncoach mit Startcode starten.

Die technische Session-ID bleibt intern. Der Startcode fuer den SkillPilot Lerncoach wird erklaert, weil er sichtbar im ChatGPT-Startprompt landet.

## Sequenz

```text
Browser                 Backend                  SkillPilot Lerncoach
   |                       |                            |
   | GET skillpilot.com    |                            |
   |---------------------->|                            |
   |                       |                            |
   | localStorage: ID?     |                            |
   |                       |                            |
   | POST /api/ui/learners |                            |
   | falls keine ID        |                            |
   |---------------------->|                            |
   |<----------------------| SkillPilot-ID              |
   |                       |                            |
   | PUT curriculum        |                            |
   |---------------------->|                            |
   |                       |                            |
   | POST chat-start       |                            |
   |---------------------->|                            |
   |<----------------------| Startcode                  |
   |                       |                            |
   | open ChatGPT prompt   |                            |
   |--------------------------------------------------->|
   |                       |                            |
   |                       | POST redeemStartCode       |
   |                       |<---------------------------|
   |                       | prueft Code, erzeugt Token |
   |                       |--------------------------->|
   |                       | Chat-Session-Token + State |
   |                       |                            |
   |                       | GET/POST session actions   |
   |                       |<---------------------------|
   |                       |--------------------------->|
```

## API

UI- und AI-APIs sind getrennt: Der Browser darf mit der echten SkillPilot-ID arbeiten, der GPT nur mit Startcode und Chat-Session-Token.

### UI: Startcode erzeugen

```http
POST /api/ui/learners/{skillpilotId}/chat-start
Content-Type: application/json
```

Request:

```json
{
  "language": "de",
  "client": "web",
  "selectedCurriculum": "a0e13c56-c25f-4742-9272-3a1a603ee52e"
}
```

Response:

```json
{
  "startCode": "SP-7KQ9-M2PA",
  "expiresAt": "2026-05-19T09:35:00Z",
  "prompt": "Starte SkillPilot mit Startcode: SP-7KQ9-M2PA"
}
```

Der Browser kann daraus optional eine ChatGPT-URL bauen:

```text
https://chatgpt.com/g/...skillpilot-gpt-deutsch?prompt=<url-encoded prompt>
```

Der Prompt-Link ist Komfort, nicht Sicherheitsanker. Im normalen Web-Flow wird der Startcode direkt ueber den ChatGPT-Prompt-Parameter uebergeben. Eine manuelle Copy-Ansicht ist nur als Diagnose- oder Fallback-Option noetig, falls ein Browser den Popup-/Prompt-Start blockiert.

### AI: Startcode einloesen

```http
POST /api/ai/{lang}/chat-start/redeem
Content-Type: application/json
```

Request:

```json
{
  "startCode": "SP-7KQ9-M2PA"
}
```

Response:

```json
{
  "chatSessionToken": "sps_3J4v...",
  "expiresAt": "2026-05-20T09:30:00Z",
  "state": {
    "...": "initialer Learner-State ohne echte SkillPilot-ID"
  }
}
```

Der Startcode darf danach nicht erneut einloesbar sein.

### AI: Session-basierte Actions

Neue GPT-Actions sollen nicht mehr die SkillPilot-ID im Pfad verwenden.

Beispiele:

```http
GET /api/ai/{lang}/sessions/{chatSessionToken}/state
POST /api/ai/{lang}/sessions/{chatSessionToken}/scope
POST /api/ai/{lang}/sessions/{chatSessionToken}/active-goal
POST /api/ai/{lang}/sessions/{chatSessionToken}/mastery
POST /api/ai/{lang}/sessions/{chatSessionToken}/curriculum
POST /api/ai/{lang}/sessions/{chatSessionToken}/personalization
POST /api/ai/{lang}/sessions/{chatSessionToken}/verified-recall/start
POST /api/ai/{lang}/sessions/{chatSessionToken}/verified-recall/answer
POST /api/ai/{lang}/sessions/{chatSessionToken}/verified-recall/result
```

Das Backend loest bei jeder Session-Action intern auf:

```text
chatSessionToken -> SkillPilot-ID -> bestehende LearnerService-Logik
```

## Sanitizing der AI-Responses

Wenn der SkillPilot Lerncoach session-basiert arbeitet, sollen AI-Responses die echte SkillPilot-ID nicht enthalten.

Aktuelle Response-Typen koennen intern weiterverwendet werden, muessen aber fuer AI-Session-Routen gesanitized werden:

- `skillpilotId` nicht ausgeben oder als `null` ausgeben
- keine Links mit `skillpilotId` erzeugen
- keine Prompttexte mit echter SkillPilot-ID erzeugen
- keine Fehlermeldung, die versehentlich die ID wiederholt

Wenn der GPT einen Schluessel fuer Folgeaufrufe braucht, ist das ausschliesslich das `chatSessionToken`.

## Persistenzmodell

### Startcode-Tabelle

Minimal benoetigte Felder:

```text
code_hash
learner_skillpilot_id
issued_at
expires_at
redeemed_at
redeemed_session_id
client
language
```

Hinweise:

- Startcodes sollten gehasht gespeichert werden, nicht im Klartext.
- Ablauf und Einmaligkeit muessen atomar geprueft werden.
- Veraltete Startcodes koennen regelmaessig geloescht werden.

### Chat-Session-Tabelle

Minimal benoetigte Felder:

```text
token_hash
learner_skillpilot_id
started_at
expires_at
revoked_at
last_used_at
source_start_code_hash
language
```

Hinweise:

- Auch Session-Tokens sollten gehasht gespeichert werden.
- Das Token selbst wird nur einmal beim Erzeugen an den GPT zurueckgegeben.
- Backend-Logs duerfen Tokens nicht im Klartext ausgeben.

## Gueltigkeitsregeln

Aktuelle Defaults fuer den Launch:

```text
Startcode TTL: 5 Minuten
Startcode Nutzung: genau einmal
Chat-Session TTL: 24 Stunden
Chat-Session Nutzung: mehrfach bis Ablauf oder Widerruf
```

Bei jeder AI-Session-Action:

1. Token syntaktisch validieren.
2. Token-Hash suchen.
3. Pruefen, ob nicht abgelaufen.
4. Pruefen, ob nicht widerrufen.
5. `last_used_at` aktualisieren.
6. SkillPilot-ID intern fuer die bestehende Learner-Logik verwenden.

## Fehlerfaelle

### Startcode fehlt

GPT soll sagen:

```text
Bitte starte SkillPilot ueber skillpilot.com. Dort wird dein Lernstand geladen und ein Startcode erzeugt.
```

Der GPT soll im normalen Flow keine neue SkillPilot-ID erzeugen.

### Startcode abgelaufen

Backend:

```http
410 Gone
```

GPT:

```text
Der Startcode ist abgelaufen. Bitte oeffne skillpilot.com erneut und starte ChatGPT von dort.
```

### Startcode wurde bereits benutzt

Backend:

```http
409 Conflict
```

GPT:

```text
Dieser Startcode wurde bereits verwendet. Bitte erzeuge auf skillpilot.com einen neuen Startcode.
```

### Chat-Session-Token abgelaufen

Backend:

```http
401 Unauthorized
```

GPT:

```text
Die SkillPilot-Chat-Sitzung ist abgelaufen. Bitte starte erneut ueber skillpilot.com.
```

## UX-Regeln

Die Web-Startseite soll nicht direkt zu ChatGPT springen, solange keine SkillPilot-ID im Browser vorhanden ist.

Empfohlener Ablauf:

1. **Login** anzeigen.
2. Drei Einstiegswege anbieten:
   - `Neue SkillPilot-ID erstellen`
   - `Gespeicherten Login laden`
   - `SkillPilot-ID direkt eingeben`
3. Optional: `Diesen Login auf diesem Geraet speichern` mit Name und Passwort. Die SkillPilot-ID wird lokal verschluesselt; das Passwort wird nicht gespeichert.
4. Curriculum bzw. Startscope anzeigen.
5. Buttons:
   - `SkillPilot Lerncoach starten`
   - `Cockpit oeffnen`
6. Beim Button `SkillPilot Lerncoach starten`:
   - Startcode erzeugen
   - ChatGPT mit Prompt-Parameter oeffnen
   - bei Browserblockade eine klare Fehlermeldung anzeigen oder eine Diagnose-/Fallback-Ansicht anbieten

Der User soll die echte SkillPilot-ID im Normalfall nicht sehen muessen. Eine Diagnose- oder Exportansicht darf sie zeigen, muss aber klar als dauerhafter Schluessel gekennzeichnet sein.

Logout:

- beendet die aktive Browser-Session
- entfernt die aktive SkillPilot-ID aus dem normalen lokalen Session-Speicher
- entfernt nicht automatisch passwortverschluesselte gespeicherte Logins
- fuehrt zur Start-/Login-Oberflaeche zurueck

## Lerncoach-Verhalten

Der SkillPilot Lerncoach soll:

- Startcodes erkennen
- bei Startcode zuerst `redeemStartCode` aufrufen
- das erhaltene `chatSessionToken` fuer alle Folgeaktionen verwenden
- nicht nach der echten SkillPilot-ID fragen
- keine SkillPilot-ID anzeigen, wenn sie nicht explizit fuer Diagnose/Support benoetigt wird
- bei fehlendem Startcode auf `skillpilot.com` verweisen
- nicht in den Voice Mode wechseln, solange Custom GPT Actions dort keine Function Calls ausfuehren

## Legacy- und Migrationsstrategie

Bestehende AI-Routen mit SkillPilot-ID im Pfad koennen vorerst bestehen bleiben:

```http
/api/ai/{lang}/learners/{skillpilotId}/...
```

Sie sollten aber fuer den normalen GPT-Flow nicht mehr beworben werden. Die Custom-GPT-OpenAPI-Spezifikation soll auf die neuen Session-Routen umgestellt werden.

Uebergang:

1. Neue Startcode- und Session-Routen bauen.
2. Web-Startseite auf Startcode umstellen.
3. GPT-OpenAPI auf Session-Routen umstellen.
4. GPT-Instruktionen aktualisieren.
5. Alte SkillPilot-ID-Routen als Legacy/Debug belassen.
6. Spaeter entscheiden, ob Legacy-Routen eingeschraenkt oder entfernt werden.

## Designentscheidungen

- Chat-Session-Token lebt per Default 24 Stunden.
- Mehrere aktive Chat-Sessions pro Learner sind erlaubt.
- `chatSessionToken` wird in Custom-GPT-Routen als Pfadparameter verwendet, weil ChatGPT Actions damit stabil umgehen. Serverlogs duerfen Tokens nicht im Klartext speichern oder ausgeben.
- AI-Session-Responses enthalten `skillpilotId: null`, damit vorhandene DTOs kompatibel bleiben.
- Ein Startcode darf optional ein ausgewaehltes Curriculum setzen, muss es aber nicht.

Noch offen fuer spaetere Haertung:

- Chat-Sessions im Cockpit sichtbar und widerrufbar machen.
- Regelmaessigen Cleanup fuer abgelaufene Startcodes und Sessions einbauen.
- Optional pruefen, ob Session-Tokens langfristig besser ueber Header statt Pfad laufen koennen.

## Implementierungsstand

Umgesetzt:

1. Datenmodell und Liquibase-Migration fuer Startcodes und Chat-Sessions.
2. Service fuer Code-/Token-Erzeugung, Hashing, Ablauf, Redeem und Token-Aufloesung.
3. UI-Endpunkt `chat-start` fuer bestehende Learner.
4. AI-Endpunkt `redeem`.
5. Session-basierte AI-Routen als Wrapper um bestehende LearnerService-Methoden.
6. Sanitizing der AI-Session-Responses.
7. Frontend-Startflow auf Startcode umstellen.
8. Custom-GPT-OpenAPI und System-Instructions aktualisieren.

Lokale End-to-End-Tests:

   - neue ID erzeugen
   - Startcode erzeugen
   - Startcode einloesen
   - Folgeaktion mit Session-Token
   - Startcode nicht zweimal nutzbar
   - abgelaufener Startcode wird abgelehnt
   - echte SkillPilot-ID erscheint nicht in GPT-Responses
