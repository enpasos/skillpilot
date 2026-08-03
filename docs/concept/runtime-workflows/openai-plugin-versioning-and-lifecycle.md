---
title: "SkillPilot: Versionierungs- und Lebenszyklusplan für das OpenAI-Plugin"
subtitle: "MCP-API, MCP-UI und Skills"
document_version: "1.0"
status: "Verbindliche Architekturgrundlage"
date: "2026-07-31"
audience: "Codex- und SkillPilot-Entwicklung"
---

# SkillPilot: Versionierungs- und Lebenszyklusplan für das OpenAI-Plugin

**Geltungsbereich:** OpenAI-Plugin mit MCP-API, MCP-UI und gebündelten Skills  
**Dokumentversion:** 1.0  
**Stand:** 31. Juli 2026  
**Status:** Verbindliche interne Architekturgrundlage; einzelne Plattformfragen sind noch nicht offiziell von OpenAI geklärt.  
**Adressaten:** Codex, Backend-, MCP-, UI-, Auth- und Release-Entwicklung

## 1. Zweck und zentrale Entscheidung

Dieses Dokument legt fest, wie SkillPilot sein öffentliches OpenAI-Plugin von der ersten Veröffentlichung an versioniert, kompatibel weiterentwickelt, bei Bedarf durch eine inkompatible Major-Version ersetzt und eine alte Vertragsgeneration anschließend vollständig stilllegt.

Die zentrale Architekturentscheidung lautet:

> **Kompatible Änderungen bleiben als Patch- oder Minor-Releases innerhalb derselben Plugin-Identität. Eine inkompatible Major-Vertragsgeneration, deren Altvertrag später entfernt werden soll, erhält eine eigene Plugin-Identität.**

Das Zielmodell ist damit:

```text
kompatible Änderung
    -> Patch- oder Minor-Release derselben Plugin-Identität

inkompatible Änderung, bei der der Altvertrag dauerhaft erhalten bleibt
    -> additive Erweiterung innerhalb derselben Plugin-Identität

inkompatible Major-Änderung, deren Altvertrag später entfernt werden soll
    -> neue Plugin-Identität, Parallelbetrieb, Migration, Stilllegung der alten Identität
```

Für SkillPilot bedeutet dies konkret:

```text
Plugin-Linie V1
    technischer Name: skillpilot-coach-v1
    Anzeigename:       SkillPilot Coach v1
    Plugin-Releases:   1.x.y
    MCP-Endpoint:      https://mcp-coach-v1.skillpilot.com/mcp

Plugin-Linie V2
    technischer Name: skillpilot-coach-v2
    Anzeigename:       SkillPilot Coach v2
    Plugin-Releases:   2.x.y
    MCP-Endpoint:      https://mcp-coach-v2.skillpilot.com/mcp
```

Beide Plugin-Linien dürfen denselben SkillPilot-Core, dieselbe Datenbank,
denselben Authorization Server und dieselben Benutzerkonten verwenden. Die
öffentliche Plugin-Identität und der MCP-Origin werden ausschließlich nach
Contract-Major getrennt, nicht nach Sprache. Die Interaktionssprache ist eine
vom Backend autoritativ an die Lernsession gebundene Eigenschaft. Getrennt
werden die Major-Vertragsadapter, Plugin-Pakete sowie der jeweilige
Veröffentlichungs- und Stilllegungslebenszyklus.

## 2. Status dieser Entscheidung

Diese Architektur ist der **aktuelle verbindliche interne Plan**. Sie ist eine belastbare Konsequenz aus den derzeit dokumentierten OpenAI-Regeln, aber noch nicht ausdrücklich als offizielle OpenAI-Best-Practice bestätigt.

Die offene Plattformfrage wurde am 31. Juli 2026 im OpenAI Developer Forum veröffentlicht:

- [Should each breaking major version use a separate plugin identity?](https://community.openai.com/t/should-each-breaking-major-version-use-a-separate-plugin-identity/1388515)

Die Implementierung MUSS daher zwei Eigenschaften besitzen:

1. Sie MUSS die geplante Trennung nach Major-Plugin-Identitäten ermöglichen.
2. Sie DARF nicht davon abhängen, dass OpenAI später einen automatischen Nachfolger-Link, eine OAuth-Übernahme, eine Installationsmigration oder ein zuverlässiges Runtime-Versionssignal bereitstellt.

Sollte OpenAI parallele, versionierte Schwester-Plugins wider Erwarten nicht akzeptieren, bleibt die interne Adaptertrennung bestehen. Als Fallback darf V2 dann nur additiv innerhalb der bestehenden Plugin-Identität eingeführt werden; V1 könnte in diesem Fall nicht entfernt werden, bevor OpenAI einen offiziellen Stilllegungsweg bereitstellt.

## 3. Normative Begriffe

In diesem Dokument gelten folgende Begriffe:

- **MUSS / DARF NICHT:** verbindliche technische Vorgabe.
- **SOLL / SOLL NICHT:** Standardvorgehen; Abweichungen benötigen eine dokumentierte Architekturentscheidung.
- **KANN:** zulässige Option.

## 4. Dokumentierte OpenAI-Rahmenbedingungen

Die Planung beruht auf den folgenden derzeit dokumentierten Eigenschaften der Plattform:

1. Ein Plugin kann Skills, einen MCP-Server oder beides enthalten. Die Veröffentlichung umfasst Listing-Daten, MCP-Details, gebündelte Skills, Testfälle und Release Notes. [OAI-1]
2. OpenAI speichert beim Scan einen geprüften Snapshot der MCP-Metadaten. Das veröffentlichte Plugin verwendet diesen Snapshot, während Tool-Aufrufe und UI-Ressourcen weiterhin den Live-MCP-Server verwenden. [OAI-2]
3. Inkompatible Änderungen am MCP-Vertrag innerhalb eines bereits veröffentlichten Plugins werden derzeit nicht unterstützt. Entfernte oder umbenannte Tools, inkompatible Schemas und inkompatible oder entfernte Inhalte unter veröffentlichten UI-Ressourcen-URIs können die veröffentlichte Version sofort brechen. [OAI-2]
4. Der dokumentierte Weg innerhalb einer Plugin-Identität ist additiv: neue Tools, Felder oder UI-Ressourcen hinzufügen, neuen Metadaten-Snapshot prüfen lassen und die alten Verträge weiterhin bereitstellen. [OAI-2]
5. Serverseitige Korrekturen dürfen ohne neue Plugin-Einreichung deployt werden, sofern der veröffentlichte Vertrag erhalten bleibt. Bei einem Vertragsbruch ist die Serveränderung zurückzurollen. [OAI-2]
6. Pro MCP-Integration kann jeweils nur eine Version veröffentlicht und nur eine Version gleichzeitig geprüft werden. Eine freigegebene Aktualisierung ersetzt die vorher veröffentlichte Version derselben Plugin-Identität. Eine Organisation darf mehrere eigenständige Plugins veröffentlichen. [OAI-2]
7. Der bei OpenAI registrierte MCP-Endpoint ist Teil des Pluginvertrags. Ein
   Wechsel von Scheme, Host oder Pfad wird deshalb nur als bewusstes
   Plugin-Update vorgenommen; die Major-Version liegt bei SkillPilot im
   dedizierten Endpoint-Host. [OAI-2]
8. Ein Plugin kann aus der öffentlichen Sichtbarkeit entfernt oder vollständig aus Organisation, ChatGPT und Codex gelöscht werden. [OAI-2]
9. Das Manifest verlangt eine semantische Version. Der technische Paketname ist auf 64 Zeichen begrenzt; der öffentliche Anzeigename auf 30 Zeichen. [OAI-3]
10. Bei UI-Plugins muss `_meta.ui.domain` einen dedizierten, pro Plugin eindeutigen Origin angeben. Eine UI-Ressourcen-URI ist als Cache-Key zu behandeln; bei inkompatiblen HTML-, JavaScript- oder CSS-Änderungen ist eine neue URI zu veröffentlichen. [OAI-4] [OAI-5]
11. Skills werden als finaler Dateibaum zusammen mit dem Plugin eingereicht; das Manifest verweist auf das Skills-Verzeichnis und trägt die Plugin-SemVer. [OAI-1] [OAI-6]

Diese Rahmenbedingungen begründen die Trennung zwischen einer kompatiblen Plugin-Linie und einer neuen Plugin-Identität für eine entfernbare inkompatible Major-Version.

## 5. Nicht verwechselbare Versionsebenen

SkillPilot verwendet mehrere unabhängige Versionen. Keine einzelne Versionsnummer darf für mehrere dieser Bedeutungen missbraucht werden.

| Versionsebene | Beispiel | Bedeutung | Quelle der Wahrheit |
|---|---|---|---|
| Plugin-Identität / Contract-Major | `skillpilot-coach-v1` / `1` | Separat veröffentlichbare und später separat stilllegbare öffentliche Vertragslinie | Plugin-Paket und Deployment-Konfiguration |
| Plugin-Paketversion | `1.4.2` | SemVer des eingereichten Pakets aus Manifest, Skills und geprüften MCP-/UI-Metadaten | Plugin-Manifest |
| MCP-Tool-Contract-Major | `1` | Semantik und JSON-Schemas der öffentlich sichtbaren SkillPilot-Tools | Contract-Modul und veröffentlichter Snapshot |
| MCP-Protokollversion | z. B. datumsbasiert | Transport- und Protokollstand zwischen Host und MCP-Server | MCP-Handshake; nicht der SkillPilot-Fachvertrag |
| Server-Build | `2026.07.31.3` oder Git-SHA | Konkret deployte Backend-Implementierung | Build- und Deployment-Pipeline |
| UI-Artefaktversion | Hash oder `1.4.2` | Unveränderliche HTML-/JS-/CSS-Auslieferung | UI-Buildmanifest |
| Zustands-Schemaversion | `3` | Internes persistentes Datenformat einer Lernsession | Datenmigrationen |
| Zustandsversion | `42` | Monoton steigende Revision des kanonischen Coach-Zustands eines Lernenden; alle Sessions und das Web-UI sehen dieselbe Revision | Lernenden-Datensatz; Session hält nur einen Diagnose-Snapshot |
| Workflow-Version | `coach@2.3` | Pädagogische Ablauf- und Entscheidungslogik | Workflow-Konfiguration |
| Curriculum-Revision | `he-mathe-lk-g9@2026.1` | Verwendete Lernziel- und Lehrplanrevision | Curriculum-Repository |

Verbindliche Konsistenzregel für jede öffentliche Plugin-Linie:

```text
Major(pluginPackageVersion)
    == Contract-Major
    == Major im technischen Plugin-Namen
    == Major im öffentlichen MCP-Hostname
```

Beispiel:

```text
plugin name:        skillpilot-coach-v2
plugin version:     2.3.1
contract major:     2
MCP endpoint:       https://mcp-coach-v2.skillpilot.com/mcp
OAuth resource:     https://mcp-coach-v2.skillpilot.com/mcp
```

Die Server-Buildnummer, Zustands-Schemaversion, Workflow-Version und Curriculum-Revision dürfen unabhängig davon fortschreiten.

## 6. Verbindliche Namen und Endpoints

### 6.1 V1 vor der ersten Veröffentlichung

Die erste öffentliche Plugin-Linie MUSS wie folgt vorbereitet werden:

```text
Technischer Plugin-/Paketname: skillpilot-coach-v1
Öffentlicher Anzeigename:       SkillPilot Coach v1
Erste Manifest-Version:         1.0.0
Contract-Major:                 1
Öffentlicher MCP-Endpoint:      https://mcp-coach-v1.skillpilot.com/mcp
OAuth Resource/Audience:        https://mcp-coach-v1.skillpilot.com/mcp
Protected-Resource-Metadaten:   https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
Domain-Challenge:               https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge
OAuth-Issuer:                   https://skillpilot.com/api/openai/v1
Widget-Origin:                   https://mcp-coach-v1.skillpilot.com
```

Der vorgeschlagene Anzeigename bleibt unter dem OpenAI-Limit von 30 Zeichen.
Plugin-Metadaten, Skill-Anweisungen und Toolbeschreibungen verwenden neutrales
Englisch. Nutzerkommunikation und Nutzdaten folgen dagegen ausschließlich der
in der Lernsession gespeicherten Interaktionssprache.

Für die V1-Linie gibt es keinen öffentlichen Kompatibilitätsalias. Der
dedizierte Nginx-vHost bildet ausschließlich den öffentlichen Pfad `/mcp` auf
den loopback-gebundenen Spring-Transport `/internal/openai/v1/mcp` ab. Der
OAuth-Issuer und seine Browser-Endpunkte bleiben auf `skillpilot.com`; der
MCP-Origin verwendet normales serverauthentisiertes TLS und OAuth, aber kein
Clientzertifikat.

### 6.2 Spätere V2

Eine spätere inkompatible Vertragsgeneration wird separat angelegt:

```text
Technischer Plugin-/Paketname: skillpilot-coach-v2
Öffentlicher Anzeigename:       SkillPilot Coach v2
Erste Manifest-Version:         2.0.0
Contract-Major:                 2
Öffentlicher MCP-Endpoint:      https://mcp-coach-v2.skillpilot.com/mcp
OAuth Resource/Audience:        https://mcp-coach-v2.skillpilot.com/mcp
Protected-Resource-Metadaten:   https://mcp-coach-v2.skillpilot.com/.well-known/oauth-protected-resource/mcp
Domain-Challenge:               https://mcp-coach-v2.skillpilot.com/.well-known/openai-apps-challenge
```

V1 und V2 dürfen zeitweise parallel veröffentlicht sein. Sie teilen sich den Core, sind aber an den öffentlichen Grenzen getrennt.

### 6.3 Domainverifikation

Für jeden unabhängig veröffentlichbaren MCP-Origin MUSS die von OpenAI
verlangte Challenge auf genau diesem Host bereitgestellt werden:

```text
/.well-known/openai-apps-challenge
```

Zwei Major-Plugins auf demselben Host würden denselben Challenge-Pfad teilen.
Deshalb trennt SkillPilot Contract-Majors bereits vor der Veröffentlichung
durch eigene Hosts. Sprache erzeugt ausdrücklich keinen weiteren Host. Aktuell
ist nur `mcp-coach-v1.skillpilot.com` aktiv; die folgenden acht Namen sind durch
DNS, Zertifikat und einen `404`-vHost reserviert, aber noch keine
veröffentlichten oder aufrufbaren MCP-Verträge:

```text
mcp-coach-v2.skillpilot.com
mcp-coach-v3.skillpilot.com
mcp-coach-v4.skillpilot.com
mcp-coach-v5.skillpilot.com
mcp-coach-v6.skillpilot.com
mcp-coach-v7.skillpilot.com
mcp-coach-v8.skillpilot.com
mcp-coach-v9.skillpilot.com
```

Die Reservierung erzeugt weder eine Plugin-Veröffentlichung noch eine
OAuth-Resource. Erst die jeweilige Contract-Implementierung und Freigabe
aktiviert `/mcp`, Protected-Resource-Metadaten und den eigenen Challenge-Wert.
Die früher lokal vorbereiteten, nie veröffentlichten Sprachhosts
`mcp-coach-de-v*` und `mcp-coach-en-v*` sind keine Kompatibilitätsrouten und
werden nicht weiterbetrieben.

## 7. SemVer-Regeln für SkillPilot

### 7.0 Unveröffentlichte Arbeitsversion

SemVer bezeichnet den beabsichtigten öffentlichen Paketstand, nicht jeden
internen Arbeitsschritt. Solange eine Paketversion noch nicht tatsächlich im
OpenAI-Portal veröffentlicht wurde, darf SkillPilot denselben internen Draft
beliebig oft fortschreiben, deployen, scannen, korrigieren und erneut prüfen.
Commits, interne Deployments und Reviewkorrekturen erhöhen die Paketversion
nicht.

Die Grenze ist der reale Veröffentlichungsstatus:

- `contracts/drafts/openai/<plugin>/<version>-SNAPSHOT/` ist ein
  reproduzierbarer, aber fortschreibbarer Arbeitsstand. `-SNAPSHOT` ist nur
  dessen interne Kennzeichnung; Manifest und OpenAI-Portal behalten die
  vorgesehene öffentliche Zielversion `<version>`;
- `contracts/published/openai/<plugin>/<version>/` darf erst nach bestätigtem
  **Publish** im OpenAI-Portal entstehen und ist danach unveränderlich;
- der maschinenlesbare `release-index.json` enthält ausschließlich tatsächlich
  veröffentlichte Versionen;
- sobald eine Version veröffentlicht ist, erfordert jede weitere Änderung am
  Plugin-Paket je nach Änderung einen PATCH-, MINOR- oder MAJOR-Schritt.

Für die aktuelle Linie bedeutet das konkret: `SkillPilot Coach v1` wurde
noch nicht veröffentlicht. Die Lernzielvisualisierungs-UI wird deshalb in den
bestehenden `1.0.0`-Draft aufgenommen; es entsteht weder `1.0.1` noch ein
Published-Snapshot. Alle zugehörigen Contract-, Ressourcen-, UI- und
Skill-Artefakte werden beim nächsten `prepare` gemeinsam im selben Draft
aktualisiert.

### 7.1 Server-Build ohne Plugin-Release

Kein Plugin-Versionssprung ist erforderlich, wenn ausschließlich die Live-Implementierung geändert wird und der veröffentlichte Vertrag vollständig erhalten bleibt. Beispiele:

- Fehlerkorrektur in einer Berechnung;
- Performanceverbesserung;
- Datenbankoptimierung;
- Korrektur von Live-Daten;
- interne Refaktorierung;
- Sicherheitskorrektur ohne Änderung des sichtbaren Auth-, Tool-, Schema-, Skill- oder UI-Vertrags.

In diesem Fall ändert sich nur `serverBuild`. Alle Contract-Tests der veröffentlichten Plugin-Version MÜSSEN gegen den neuen Build bestehen.

### 7.2 PATCH innerhalb einer Plugin-Linie

Ein PATCH-Release, zum Beispiel `1.4.2 -> 1.4.3`, wird verwendet, wenn sich das eingereichte Plugin-Paket oder der geprüfte Metadaten-Snapshot ändern muss, aber keine neue öffentliche Fähigkeit und keine Inkompatibilität eingeführt wird. Beispiele:

- Korrektur einer Toolbeschreibung;
- Präzisierung eines `SKILL.md` ohne neue Workflow-Fähigkeit;
- Korrektur einer Annotation auf das bereits tatsächlich vorhandene Verhalten;
- kompatible UI-Korrektur unter einer neuen unveränderlichen Ressourcen-URI;
- Korrektur von Listing- oder Release-Informationen.

Ein PATCH des veröffentlichten Pakets benötigt den normalen Scan-, Review- und Veröffentlichungsprozess.

### 7.3 MINOR innerhalb einer Plugin-Linie

Ein MINOR-Release, zum Beispiel `1.4.0 -> 1.5.0`, wird für rückwärtskompatible Erweiterungen verwendet. Beispiele:

- neues Tool;
- neues optionales Eingabefeld;
- neue optionale Fähigkeit in einem bestehenden Workflow;
- neuer Skill;
- neue UI-Komponente oder neue UI-Ressourcen-URI;
- neue additive OAuth-Berechtigung, sofern die bisherige Bedeutung bestehender Scopes unverändert bleibt;
- neues optionales Ergebnis innerhalb eines dafür vorgesehenen Erweiterungsbereichs.

Der Live-Server MUSS vor dem Scan als Superset sowohl den alten als auch den neuen Vertrag bedienen.

### 7.4 MAJOR als neue Plugin-Identität

Eine inkompatible Änderung, deren Altvertrag später entfernt werden soll, erzeugt keine normale Aktualisierung derselben Plugin-Identität. Sie erzeugt eine neue Plugin-Linie und beginnt dort bei der passenden Major-Version, zum Beispiel `2.0.0`.

Als inkompatibel gelten insbesondere:

- Tool entfernen oder umbenennen;
- Pflichtfeld hinzufügen;
- Feld entfernen oder umbenennen;
- Datentyp, Einheit oder Wertebereich inkompatibel ändern;
- neue Semantik bei unverändertem Schema;
- Ergebnisstruktur inkompatibel ändern;
- bestehende Enum-Werte entfernen oder die Bedeutung ändern;
- ein read-only Tool in ein schreibendes oder destruktives Tool umwandeln;
- Authentifizierungs- oder Autorisierungsmodell grundlegend ändern;
- einen UI-Vertrag unter einer bestehenden URI inkompatibel verändern;
- Workflow- und Zustandssemantik so verändern, dass eine bestehende V1-Session nicht mehr korrekt fortgesetzt werden kann;
- alte Tools oder Ressourcen nach einer Übergangsphase tatsächlich entfernen wollen.

Eine rein additive Übergangslösung innerhalb V1 ist zulässig, wenn der alte V1-Vertrag bis zur Stilllegung der gesamten V1-Plugin-Identität erhalten bleibt. Sie ersetzt jedoch nicht die Major-Grenze.

## 8. Öffentliche Vertragsarchitektur

### 8.1 Adapter statt direkter Core-Kopplung

Öffentliche MCP-Schemas DÜRFEN NICHT direkt die internen Domain- oder Persistenzobjekte von SkillPilot exportieren. Jede Major-Linie erhält einen eigenen Adapter:

```text
OpenAI / ChatGPT / Codex
          |
          v
mcp-coach-v1.skillpilot.com/mcp  --->  McpContractV1Adapter  ---+
                                                       |
                                                       v
                                                SkillPilot Core
                                                       ^
                                                       |
mcp-coach-v2.skillpilot.com/mcp  --->  McpContractV2Adapter  ---+
```

Der Core enthält die fachlichen Use Cases. Der jeweilige Adapter übernimmt:

- Validierung des öffentlichen Inputs;
- Übersetzung in kanonische interne Commands;
- Authentifizierungs- und Autorisierungseinbindung;
- Projektion interner Ergebnisse auf das Major-spezifische Outputschema;
- stabile Fehlercodes;
- Abwärtskompatibilität innerhalb der Major-Linie;
- Major-spezifische UI- und Tool-Metadaten.

### 8.2 Toolnamen

Innerhalb einer separat versionierten Plugin-Identität sollen Toolnamen sauber und fachlich bleiben:

```text
start_learning_session
get_current_learning_step
submit_learning_answer
get_learning_session_status
```

V1 benötigt deshalb im Normalfall keinen Suffix `_v1`; die Plugin-Identität
und der dedizierte MCP-Origin bilden bereits den Namespace. V2 darf dieselben
fachlichen Namen mit einem inkompatiblen V2-Schema verwenden, weil sie eine
andere Plugin-Identität und einen anderen MCP-Origin besitzt.

Ein Suffix wie `_v2` ist nur für eine additive Übergangsfunktion innerhalb derselben Plugin-Identität zulässig, wenn alter und neuer Vertrag gleichzeitig in derselben Toolliste sichtbar sein müssen.

### 8.3 Antwort-Envelopes für zustandsbezogene Tools

Zustandsbezogene Toolantworten MÜSSEN die relevanten Versionen explizit ausweisen. Beispiel:

```json
{
  "contractMajor": 1,
  "learningSessionId": "sps_...",
  "stateVersion": 42,
  "stateSchemaVersion": 3,
  "workflowVersion": "coach@2.3",
  "curriculumRevision": "he-mathe-lk-g9@2026.1",
  "currentStep": {
    "goalId": "..."
  },
  "allowedActions": [
    "submit_answer"
  ],
  "extensions": {}
}
```

Regeln:

- `contractMajor` bezeichnet den öffentlichen Toolvertrag.
- `stateVersion` ist die monotone Revision des kanonischen Coach-Zustands des
  Lernenden. Mehrere Lernsessionen und das Web-UI konkurrieren deshalb gegen
  dieselbe Revision; ein erfolgreicher Schreibzugriff auf einem Transport macht
  veraltete Schreibzugriffe auf allen anderen Transporten sichtbar.
- `stateSchemaVersion` bezeichnet das interne Persistenzformat.
- `workflowVersion` und `curriculumRevision` bleiben unabhängig von Plugin-SemVer.
- `extensions` ist der bewusst offene Bereich für kompatible Zusatzinformationen.
- Interne SkillPilot-Benutzer-IDs DÜRFEN NICHT an das Modell oder die UI ausgegeben werden.

### 8.4 Schreibende Aufrufe

Jeder schreibende Toolaufruf SOLL mindestens enthalten:

```json
{
  "learningSessionId": "sps_...",
  "expectedStateVersion": 42,
  "clientRequestId": "4ee22c4b-...",
  "answer": {
    "text": "..."
  }
}
```

- `expectedStateVersion` ermöglicht Optimistic Locking und verhindert stilles Überschreiben konkurrierender Änderungen.
- `clientRequestId` macht Retries idempotent.
- Das Tool SOLL die passende MCP-Idempotenzannotation setzen, wenn ein identischer Request keine zusätzliche Wirkung erzeugt.
- Konflikte werden über einen stabilen Fehlercode, nicht nur über frei formulierten Text, signalisiert.

### 8.5 JSON-Schema-Kompatibilität

Innerhalb einer Major-Linie gelten folgende Regeln:

Kompatibel sind typischerweise:

- neue optionale Eingabefelder;
- ein zusätzliches Tool;
- ein neuer optionaler Bereich innerhalb von `extensions`;
- eine Erweiterung, die alte Clients sicher ignorieren können.

Inkompatibel sind typischerweise:

- neue Pflichtfelder;
- Umbenennen oder Entfernen von Feldern;
- Typ-, Einheiten- oder Bedeutungsänderungen;
- Einschränkungen bislang zulässiger Werte;
- zusätzliche Top-Level-Ausgabefelder, wenn das veröffentlichte Outputschema sie nicht zulässt;
- neue Enum-Werte, wenn bestehende Consumer unbekannte Werte nicht robust behandeln.

Der Kern des Schemas SOLL streng sein, beispielsweise mit `additionalProperties: false`. Erweiterbarkeit wird gezielt über `extensions` oder explizit versionierte Unterobjekte hergestellt. Fehlercodes und fachliche Statuswerte sollen so gestaltet sein, dass unbekannte zukünftige Werte sicher behandelt werden können.

Toolresultate SOLLEN sowohl strukturierten Inhalt als auch eine knappe Textdarstellung liefern, damit unterschiedliche Hosts und Clients robust arbeiten können.

## 9. MCP-UI-Versionierung

### 9.1 Eindeutiger Widget-Origin bereits im Einreichungs-Draft

Ein zur Einreichung vorgesehener Plugin-Draft mit UI MUSS bereits einen für
diese Plugin-Identität eindeutigen Widget-Origin angeben. SkillPilot setzt
deshalb sowohl `_meta.ui.domain` als auch den ChatGPT-Kompatibilitätsalias
`_meta["openai/widgetDomain"]` auf
`https://mcp-coach-v1.skillpilot.com`. Der ohnehin pro Plugin-Linie
dedizierte MCP-Origin kann zugleich Widget-Origin sein; dafür ist kein zweiter
Host und kein zusätzlicher öffentlicher Pfad erforderlich.

Der Widget-Origin ist ein fester Vertragswert und kein Runtime-Override.
SkillPilot-Domains für Bilder und Cockpit-Links werden unabhängig davon
separat und minimal in der CSP freigegeben. Nach der Veröffentlichung darf der
Widget-Origin innerhalb derselben Plugin-Identität nicht stillschweigend
wechseln.

### 9.2 Unveränderliche Ressourcen-URIs

Die Ressourcen-URI wird als unveränderlicher Artefaktschlüssel behandelt. Empfohlenes Format:

```text
ui://skillpilot/coach/v1/sha256-<artifact-hash>/index.html
```

oder, sofern Build und Content exakt gekoppelt sind:

```text
ui://skillpilot/coach/v1/1.4.2/index.html
```

Verbindliche interne Regel:

> Nach Veröffentlichung wird der Inhalt einer UI-Ressourcen-URI nicht überschrieben. Jeder produktive UI-Build erhält eine neue URI.

Diese Regel ist strenger als das OpenAI-Minimum, das kompatible Updates unter derselben URI zulässt. Sie verbessert Reproduzierbarkeit, Rollback und die Darstellung alter Konversationen.

Der aktuelle unveröffentlichte `1.0.0`-Draft verwendet:

```text
ui://skillpilot/coach/v1/sha256-c890cf271307d815256450a2b20b27d57015a84e9f4e39c97532eaefc4e30c26/goal-visualization.html
```

Als bereits an Test-Clients ausgelieferte Vorgängerressource bleibt außerdem

```text
ui://skillpilot/coach/v1/sha256-157aab83e83d6fcf208c4a1ae138c020aa4f117e9b990ba78d029b570fb9644c/goal-visualization.html
```

mit ihren exakten historischen Bytes lesbar. Die aktive Tool-Metadatei zeigt
ausschließlich auf `c890cf271...`; die ältere Ressource ist nur für bestehende
Chats und zwischengespeicherte Metadaten-Snapshots registriert.

Bis zur ersten tatsächlichen Portal-Veröffentlichung darf der Draft
reproduzierbar neu erzeugt werden. Ändern sich dabei die Widget-Bytes, erhält
das Artefakt durch seinen SHA-256-Wert eine neue URI, ohne die weiterhin
unveröffentlichte Plugin-Paketversion hochzuzählen. Sobald eine solche URI
jedoch einem realen Test-Client angeboten wurde, wird sie wie eine
veröffentlichte URI unveränderlich und additiv aufbewahrt. Der erste
ausgelieferte Inhalt jeder URI ist unveränderlich. Die Ressource ist ausschließlich die
read-only Darstellung eines bereits vom Backend bestätigten aktiven atomaren
Ziels mit passendem kanonischem `goal-visualization`-Link. Context-Read und
erfolgreiches Setzen des aktiven Ziels dürfen sie auslösen; ohne gültiges Bild
bleibt der normale Chatpfad erhalten.

### 9.3 UI-Zustand

Persistierter Widget-Zustand MUSS ein eigenes Schema ausweisen:

```json
{
  "schemaVersion": 2,
  "payload": {
    "selectedGoalId": "...",
    "draftAnswer": "..."
  }
}
```

Jede UI-Version muss ältere noch unterstützte Zustandsformen lesen und deterministisch migrieren können. Unbekannte oder beschädigte Zustände dürfen nicht zum Absturz führen; die UI fällt auf einen sicheren leeren Zustand zurück.

### 9.4 Aufbewahrung alter UI-Artefakte

Alte veröffentlichte oder an reale Draft-Test-Clients ausgelieferte
UI-Ressourcen DÜRFEN während der Laufzeit der zugehörigen Plugin-Major-Version
nicht entfernt werden. Nach dem Löschen der alten Plugin-Identität sollen
statische Ressourcen für eine konfigurierbare Nachlaufzeit erhalten bleiben,
weil das Verhalten historischer Chatnachrichten nach Unpublish oder Delete
derzeit nicht vollständig dokumentiert ist.

Die Nachlaufzeit wird als Release- und Betriebsparameter geführt, nicht im Code fest verdrahtet.

## 10. Skills-Versionierung

### 10.1 Kopplung an die Plugin-Linie

Skills besitzen in diesem Plan keine unabhängige, zur Laufzeit ausgehandelte Major-Version. Der veröffentlichte Skill-Bundle-Stand gehört zur jeweiligen Plugin-Paketversion.

V1 und V2 erhalten getrennte finale Skill-Bäume:

```text
plugins/openai/skillpilot-coach-v1/skills/...
plugins/openai/skillpilot-coach-v2/skills/...
```

Ein V1-Skill MUSS ausschließlich V1-Tools und V1-Vertragssemantik verwenden. Ein V2-Skill MUSS ausschließlich V2-Tools und V2-Vertragssemantik verwenden.

Gemeinsame Quellbausteine sind zulässig, sofern der Build daraus reproduzierbare, getrennte und eingefrorene Bundles erzeugt. Die final eingereichten Bundles müssen als Release-Artefakte archiviert werden.

### 10.2 Klassifikation von Skill-Änderungen

- reine Formulierungs- oder Fehlerkorrektur ohne neue Fähigkeit: PATCH;
- neuer kompatibler Workflow oder neue Toolsequenz: MINOR;
- Skill setzt neue inkompatible Toolsemantik voraus oder verändert den öffentlichen Workflow grundlegend: neue Major-Plugin-Linie.

Da Skills als finaler Dateibaum Teil der Einreichung sind, behandelt die Release-Pipeline jede Änderung am veröffentlichten Skill-Bundle als neue Plugin-Paketversion mit erneutem Review. Dies ist die konservative interne Regel, solange OpenAI keinen anderslautenden separaten Updatepfad dokumentiert.

### 10.3 Skill-Tests

Für jedes Release müssen mindestens getestet werden:

- direkte Anfragen, die den Skill aktivieren sollen;
- indirekte Anfragen mit demselben Ziel;
- unvollständige Eingaben;
- negative Anfragen, die den Skill nicht aktivieren dürfen;
- Edge Cases und Sicherheitsgrenzen;
- korrekte Auswahl ausschließlich der Tools derselben Contract-Major-Linie.

## 11. Authentifizierung und Autorisierung

### 11.1 Getrennte OAuth-Resources pro Major

V1 und V2 verwenden denselben Spring Authorization Server und dieselben SkillPilot-Konten, aber getrennte OAuth-Resources beziehungsweise Audiences:

```text
V1 resource: https://mcp-coach-v1.skillpilot.com/mcp
V2 resource: https://mcp-coach-v2.skillpilot.com/mcp
```

Access Tokens müssen auf die passende Resource/Audience geprüft werden. Ein V1-Token darf nicht automatisch als V2-Token gelten, sofern dies nicht ausdrücklich und sicher im Authorization Server konfiguriert wurde.

### 11.2 Scopes

Innerhalb einer Major-Linie gilt:

- bestehende Scopes behalten ihre Bedeutung;
- neue Scopes dürfen additiv hinzukommen;
- ein bestehender Scope darf nicht stillschweigend erweitert oder umgedeutet werden;
- eine grundlegende Änderung des Autorisierungsmodells ist ein Major-Bruch.

### 11.3 Keine Annahme automatischer OAuth-Migration

Die Architektur DARF NICHT davon ausgehen, dass OpenAI eine bestehende V1-Verknüpfung automatisch auf V2 überträgt. V2 muss mit einer erneuten Autorisierung funktionieren. Eine spätere offizielle Nachfolger- oder Reconnect-Funktion kann zusätzlich genutzt werden, ist aber keine Voraussetzung.

## 12. Lernsession-, Zustands- und Workflow-Versionierung

### 12.1 `learningSessionId` als stabiler externer Handle

`learningSessionId` bleibt ein opaker, nicht personenbezogener und grundsätzlich Major-neutraler Handle. Er enthält keine interne Benutzer-ID und keine direkt interpretierbare Vertragsversion.

Standardfall bei einer verlustfreien Migration:

```text
dieselbe learningSessionId
V1-Sicht -> migrierter kanonischer Zustand -> V2-Sicht
```

Wenn eine Migration nicht verlustfrei oder semantisch nicht eindeutig möglich ist, darf V2 eine neue Session-ID erzeugen. In diesem Fall muss ein serverseitiges Mapping erhalten bleiben:

```text
V1 session sps_old  -> migrated_to -> V2 session sps_new
```

### 12.2 Trennung von Contract und Persistenz

Plugin-Major und internes Datenformat dürfen nicht gekoppelt werden:

```text
Public Contract V1 -> V1 Adapter -> Canonical Model -> State Schema 5
Public Contract V2 -> V2 Adapter -> Canonical Model -> State Schema 5
```

Historische Zustände werden über interne Datenmigrationen auf das aktuelle kanonische Schema gehoben. Dadurch kann V1 später entfernt werden, ohne dass das gesamte interne Datenmodell dauerhaft V1 bleiben muss.

### 12.3 Pinning laufender Lernabläufe

Eine laufende Lernsession bleibt auf ihrer `workflowVersion` und `curriculumRevision` fixiert. Ein normales Server- oder Plugin-Deployment darf den pädagogischen Ablauf einer bestehenden Session nicht unbemerkt verändern.

Eine Änderung erfolgt nur durch:

- eine ausdrücklich als kompatibel deklarierte Workflow-Migration; oder
- eine explizite Major-Migration der Session.

V1 verhält sich dabei zunächst bewusst fail-closed: Wenn der Server den
gepinnten Workflow oder Curriculum-Stand nicht mehr bereitstellt, wird die
Session mit dem stabilen Fehlercode `SESSION_VERSION_UNAVAILABLE` angehalten,
anstatt sie unbemerkt mit anderer Semantik fortzuführen. Ein Release mit neuer
Workflow- oder Curriculum-Revision muss daher entweder die bisherige Revision
für die maximale Sessionlaufzeit weiter bedienen, eine geprüfte kompatible
Migration ausführen oder nach dem Release-Runbook zurückgerollt werden.

### 12.4 Major-Migration

Die Migration von V1 nach V2 wird serverseitig, idempotent und auditierbar implementiert. Sie darf nicht dem Sprachmodell überlassen werden.

Ein internes oder kontrolliertes Migrationsergebnis soll mindestens enthalten:

```json
{
  "migrationId": "mig_...",
  "sourceContractMajor": 1,
  "targetContractMajor": 2,
  "sourceLearningSessionId": "sps_...",
  "targetLearningSessionId": "sps_...",
  "status": "completed",
  "warnings": []
}
```

Anforderungen:

- wiederholter Aufruf erzeugt keine zweite Migration;
- Ausgangssnapshot bleibt nachvollziehbar;
- Verluste oder manuelle Entscheidungen werden explizit protokolliert;
- Migration ist an den authentifizierten Benutzer gebunden;
- Rollback beziehungsweise Wiederherstellung ist für den definierten Betriebszeitraum möglich;
- Migrationscode wird erst entfernt, wenn die V1-Linie vollständig beendet und die Aufbewahrungsfrist abgelaufen ist.

## 13. Release-Prozess innerhalb derselben Major-Linie

### 13.1 Änderung klassifizieren

Vor jeder Änderung wird entschieden:

1. Ist ausschließlich der Server-Build betroffen und bleibt der veröffentlichte Vertrag unverändert?
2. Ist eine neue Plugin-Paketversion erforderlich?
3. Ist die Änderung innerhalb der aktuellen Major-Linie rückwärtskompatibel?
4. Muss alte Funktionalität später entfernt werden?

Bei Unsicherheit wird die Änderung als potenziell inkompatibel behandelt, bis Contract-Diff und Tests das Gegenteil zeigen.

### 13.2 Draft und veröffentlichten Vertrag trennen

Während der internen Arbeit wird ein reproduzierbarer Draft abgelegt:

```text
contracts/drafts/openai/skillpilot-coach-v1/1.4.0-SNAPSHOT/
```

Dieser Draft darf bei weiteren internen Schritten derselben noch nicht
veröffentlichten Version vollständig neu erzeugt werden. Er ist weder ein
Publikationsnachweis noch eine Begründung für einen Versionssprung.

Erst nach der tatsächlichen Veröffentlichung im OpenAI-Portal wird derselbe
geprüfte Stand unter dem unveränderlichen Published-Pfad versiegelt:

```text
contracts/published/openai/skillpilot-coach-v1/1.4.0/
  plugin.json
  app.json
  mcp.json
  line.json
  lifecycle.json
  contract/contract.json
  contract/tools-list.json
  contract/resources-list.json
  contract/error-catalog.json
  contract/server-instructions.txt
  contract/security-schemes.json
  ui-manifest.json
  skills-bundle.json
  skills-bundle.sha256
  skillpilot-openai-plugin-coach-v1-1.4.0.tar
  snapshot-manifest.json
  release-notes.md
```

Draft und Published-Snapshot müssen den von SkillPilot erzeugten Vertragsstand
vollständig genug abbilden, um Builds reproduzierbar zu prüfen. Der
Published-Snapshot darf niemals durch `prepare`, CI oder eine spätere
Reviewkorrektur erzeugt oder überschrieben werden. Dafür ist ein eigener,
explizit bestätigter `record-published`-Schritt erforderlich.

Das eingecheckte Tar trägt im Manifest die Rolle `plugin-install-bundle` und
wird direkt als deterministisches USTAR aus dem
Git-Inventar erzeugt. Es darf weder von der installierten `tar`-Version noch
von `umask`, Checkout-Dateirechten, `TAR_OPTIONS`, unversionierten Dateien oder
symbolischen Links abhängen. Es enthält nie den Server. Alle Sprach- und
Vertragslinien werden von genau einem separaten Spring-Boot-Artefakt
`skillpilot-server` bedient.

### 13.3 Server zuerst als Superset deployen

Da OpenAI den produktiven MCP-Endpoint scannt und Toolaufrufe anschließend weiterhin gegen den Live-Server ausführt, wird eine kompatible neue Version in folgender Reihenfolge bereitgestellt:

1. neuer Server-Build unterstützt alten und neuen Vertrag;
2. alle alten Contract-Tests laufen gegen den neuen Build;
3. neue Contract- und Skill-Tests laufen gegen den neuen Build;
4. UI-Artefakte werden unter neuen unveränderlichen URIs veröffentlicht;
5. MCP-Endpoint wird im Portal erneut gescannt;
6. neue Plugin-Version wird mit Release Notes eingereicht;
7. nach Freigabe wird die neue Version veröffentlicht;
8. alter Vertrag und alte UI-Ressourcen bleiben verfügbar.

Eine inkompatible Live-Änderung darf nicht in der Erwartung deployt werden, dass das Review sie später heilt. Wenn ein Deployment den veröffentlichten Vertrag bricht, wird es zurückgerollt.

### 13.4 Rollback

Für jede veröffentlichte Plugin-Version müssen verfügbar bleiben:

- das freigegebene Plugin-Paket;
- die zugehörigen Contract-Snapshots;
- alle referenzierten UI-Artefakte;
- ein kompatibler Server-Build oder ein Server-Build, der den Vertrag weiterhin erfüllt;
- Datenmigrationen mit dokumentiertem Rollback- oder Recovery-Verfahren.

## 14. Lebenszyklus einer neuen Major-Version

### 14.1 Zustände

Jede Plugin-Major-Linie besitzt einen expliziten Lebenszyklus:

| Zustand | Bedeutung | Zulässige Entwicklung |
|---|---|---|
| `CURRENT` | empfohlene aktuelle Linie | neue Features, Fixes, neue Sessions |
| `SUPPORTED` | weiterhin voll unterstützt, aber nicht mehr primär | Fixes; ausgewählte kompatible Verbesserungen |
| `DEPRECATED` | Migration auf Nachfolger empfohlen | Sicherheits- und kritische Fixes; keine neuen Features |
| `UNPUBLISHED` | nicht mehr öffentlich auffindbar | technischer Grace-Betrieb und Migration bestehender Nutzer |
| `RETIRED` | Plugin gelöscht und Vertragslinie beendet | keine fachliche V1-Ausführung; nur definierte Restaufbewahrung |

Die Zustands- und Datumswerte werden konfigurierbar geführt, zum Beispiel:

```json
{
  "pluginIdentity": "skillpilot-coach-v1",
  "contractMajor": 1,
  "lifecycle": "DEPRECATED",
  "successorIdentity": "skillpilot-coach-v2",
  "deprecatedAt": "2028-02-01",
  "endOfSupportAt": "2028-08-01",
  "unpublishAt": "2028-09-01",
  "deleteAfter": "2028-11-01"
}
```

Die konkreten Fristen werden pro Release entschieden und nicht im Programmcode festgelegt.

### 14.2 Ablauf V1 -> V2

1. V1 bleibt unverändert funktionsfähig.
2. V2 wird mit eigener Plugin-Identität, eigenem MCP-Origin und
   einem vor Veröffentlichung festgelegten eindeutigen UI-Origin aufgebaut.
3. V2 wird unabhängig getestet, eingereicht und veröffentlicht.
4. V1 und V2 laufen parallel.
5. Neue Sessions werden bevorzugt in V2 angelegt.
6. Bestehende V1-Sessions werden serverseitig migriert oder in V1 abgeschlossen.
7. V1 erhält gegebenenfalls ein letztes kompatibles Release mit sachlichem Nachfolger- und Migrationshinweis.
8. V1 wechselt von `SUPPORTED` nach `DEPRECATED`.
9. Nach Erreichen der Migrations- und Betriebs-Gates wird V1 aus der öffentlichen Sichtbarkeit genommen (`UNPUBLISHED`).
10. Der V1-Server bleibt für die definierte Grace-Phase verfügbar.
11. Danach wird die V1-Plugin-Identität im Portal gelöscht (`RETIRED`).
12. Erst nach zusätzlicher technischer Prüfung werden V1-Adapter, V1-Skills, V1-spezifische Tests und V1-Infrastruktur entfernt.
13. Statische alte UI-Artefakte und notwendige Migrationsdaten bleiben bis zum Ende ihrer Aufbewahrungsfrist erhalten.

### 14.3 Gates vor Unpublish und Delete

V1 darf nur stillgelegt werden, wenn mindestens folgende Punkte dokumentiert erfüllt sind:

- V2 ist produktiv stabil und vollständig veröffentlicht;
- V2-Auth funktioniert auch ohne automatische Übernahme der V1-Verknüpfung;
- aktive V1-Sessions sind migriert, abgeschlossen oder ausdrücklich als Ausnahme erfasst;
- Migrationsfehler und nicht migrierbare Fälle sind bearbeitet;
- Support-, Datenschutz- und Aufbewahrungsanforderungen sind geklärt;
- Telemetrie zeigt keine unerwartete V1-Nutzung mehr;
- V1-Contract-Snapshots, Release-Artefakte und Recovery-Daten sind archiviert;
- der OpenAI-Portalstatus wurde verifiziert;
- der Rückbauplan wurde freigegeben.

## 15. Repository- und Modulstruktur

Die konkrete Package-Root wird an das bestehende SkillPilot-Repository angepasst. Zielstruktur:

```text
skillpilot/
  core/
    application/
    domain/
    persistence/

  contracts/
    coach-v1/
      tools/
      schemas/
      errors/
      contract-tests/
    coach-v2/
      tools/
      schemas/
      errors/
      contract-tests/

  adapters/
    mcp-v1/
    mcp-v2/

  plugins/
    openai/
      skillpilot-coach-v1/
        .codex-plugin/plugin.json
        .app.json
        skills/
        release-notes/
      skillpilot-coach-v2/
        .codex-plugin/plugin.json
        .app.json
        skills/
        release-notes/

  ui/
    coach-v1/
    coach-v2/

  migrations/
    state/
    session-v1-to-v2/

  contracts/published/
    openai/
      skillpilot-coach-v1/
      skillpilot-coach-v2/

  contracts/drafts/
    openai/
      skillpilot-coach-v1/
      skillpilot-coach-v2/
```

Die technische Struktur darf in einem Monorepo, mehreren Modulen oder mehreren Repositories umgesetzt werden. Entscheidend sind getrennte Build-, Test- und Releasegrenzen für die öffentlichen Major-Verträge.

Für andere Hosts, beispielsweise Claude, sollen host-spezifische Pakete außen um denselben fachlichen MCP-Contract gelegt werden. OpenAI-spezifische `_meta`-Felder, Plugin-Manifeste und Submission-Artefakte dürfen nicht in den fachlichen Core einsickern.

## 16. CI/CD-Anforderungen

Die Pipeline MUSS mindestens folgende Prüfungen enthalten:

### 16.1 Versionskonsistenz

Automatische Prüfung:

```text
manifest major == contract major == major im Paketnamen
                == major im MCP-Endpoint-Pfad
```

Zusätzlich werden OpenAI-Grenzen wie Paketname, Anzeigename und SemVer-Format geprüft.

### 16.2 Contract-Diff

Jeder Build vergleicht die aktuelle Tool- und Ressourcenbeschreibung mit dem zuletzt veröffentlichten Snapshot derselben Major-Linie. Die Pipeline blockiert mindestens:

- entferntes oder umbenanntes Tool;
- neues Pflichtfeld;
- entferntes Feld;
- inkompatibler Typ oder Wertebereich;
- geänderte Bedeutung bestehender Status- oder Enum-Werte;
- geänderte Security Schemes oder Scope-Bedeutungen;
- geänderte Annotationen mit größerer Wirkung;
- entfernte UI-Ressourcen;
- geänderten Inhalt unter einer als unveränderlich registrierten UI-URI.

### 16.3 Skill-Contract-Lint

Die Pipeline prüft:

- jeder im Skill referenzierte Toolname existiert;
- Skill und Tool gehören zur selben Contract-Major-Linie;
- kein V1-Skill verweist auf V2-Tools und umgekehrt;
- finale Bundles enthalten alle referenzierten Dateien;
- Bundle und Hash sind reproduzierbar.

### 16.4 Contract-Testmatrix

Jeder neue Server-Build wird gegen alle noch unterstützten Major-Linien getestet:

```text
Server Build N
  -> V1 contract tests
  -> V2 contract tests
  -> state migration tests
  -> auth audience/scope tests
  -> UI resource integrity tests
```

Solange V1 nicht `RETIRED` ist, darf ein Server-Build mit fehlschlagenden V1-Tests nicht produktiv gehen.

### 16.5 Migrations- und Rollbacktests

Für jede Zustandsmigration werden getestet:

- einmalige Migration;
- wiederholter idempotenter Aufruf;
- Abbruch und Wiederaufnahme;
- nicht migrierbare Fälle;
- Recovery aus Snapshot;
- parallele Zugriffe und `stateVersion`-Konflikte.

## 17. Observability und Betriebsdaten

Da kein zuverlässiges, dokumentiertes Runtime-Signal für die konkrete
veröffentlichte Plugin-Paketversion vorausgesetzt wird, wird die
Contract-Major-Linie primär durch den aufgerufenen MCP-Origin und die dazu
exakt gleiche OAuth-Resource bestimmt.

Jeder Toolaufruf soll mindestens mit folgenden Feldern beobachtbar sein:

```text
contractMajor
pluginLine
serverBuild
mcpProtocolVersion
toolName
requestId / clientRequestId
learningSessionId (datenschutzgerecht)
stateVersion
stateSchemaVersion
workflowVersion
curriculumRevision
resultCode
latency
```

Wichtige Metriken:

- Aufrufe und aktive Sessions pro Contract-Major;
- V1- und V2-Fehlerraten;
- Migrationsfortschritt und Migrationsfehler;
- V1-Aufrufe nach Deprecation und Unpublish;
- Abrufe alter UI-Artefakte;
- OAuth-Fehler getrennt nach Resource/Audience;
- Contract-Diff- und Regressionsergebnisse pro Release.

`clientInfo.version` oder ähnliche MCP-Hostangaben dürfen nicht als Plugin-Paketversion interpretiert oder für Contract-Routing verwendet werden, solange OpenAI dies nicht ausdrücklich dokumentiert.

Die V1-Implementierung erfasst `contractMajor`, `pluginLine`, `serverBuild`,
`toolName`, `status`, einen stabilen `resultCode` und die Latenz für jeden
Toolaufruf. Wenn das versionierte Ergebnis sie zuverlässig enthält, werden
zusätzlich `stateVersion`, `stateSchemaVersion`, `workflowVersion` und
`curriculumRevision` protokolliert. Bei Schreibaufrufen wird eine syntaktisch
gültige `clientRequestId` protokolliert; die `learningSessionId` erscheint
ausschließlich als gekürzter HMAC-SHA-256-Fingerprint und niemals im Klartext.
Request- und Session-Korrelatoren sowie State-, Workflow-, Curriculum- und
Build-Versionen sind Logfelder, keine Metrik-Tags. Die Metrik-Tags bleiben auf
die begrenzten Mengen Contract-Major, Plugin-Linie, Tool, Status und stabiler
Result-Code beschränkt.

Der tatsächlich aufgerufene Endpoint-Pfad wird am HTTP-Ingress protokolliert.
Der derzeitige MCP-SDK-`McpTransportContext` stellt ihn und die ausgehandelte
MCP-Protokollversion nicht über dokumentierte, transportübergreifend stabile
Schlüssel für den Tooladapter bereit. Deshalb dupliziert oder erfindet der
Adapter diese Werte nicht; eine Protokollversion wird erst ergänzt, wenn der
Transport sie zuverlässig und dokumentiert bereitstellt.

## 18. Konkreter Codex-Implementierungsauftrag

### Phase A: Vor der ersten V1-Veröffentlichung

Codex soll die Architektur so vorbereiten, dass die erste Veröffentlichung bereits eine dauerhaft isolierbare V1-Linie bildet. Die Phase soll das derzeitige Verhalten möglichst nicht fachlich verändern.

1. **V1-Konstanten und Konfiguration einführen**
   - `pluginIdentity = skillpilot-coach-v1`
   - `pluginVersion = 1.0.0`
   - `contractMajor = 1`
   - den öffentlichen MCP-Pfad und die exakte OAuth-Resource festlegen;
   - Server-Build separat ausgeben.

2. **V1-Contract-Modul abtrennen**
   - aktuelle MCP-Tools, Input-/Outputschemas, Fehlercodes und Metadaten in einen expliziten `v1`-Bereich überführen;
   - interne Domainklassen nicht direkt als öffentliche DTOs verwenden;
   - Adapter zum bestehenden SkillPilot-Core einführen.

3. **Öffentlichen V1-Pfad vorbereiten**
   - Spring-Transport unter `/internal/openai/v1/mcp` vorsehen und über den
     dedizierten V1-vHost ausschließlich als
     `https://mcp-coach-v1.skillpilot.com/mcp` veröffentlichen;
   - keinen öffentlichen Kompatibilitätsalias bereitstellen;
   - keine zweite öffentliche HTTP-Route bereitstellen;
   - keine Abhängigkeit von Redirects;
   - OpenAI-Challenge-Route berücksichtigen.

4. **V1-UI versionieren**
   - bereits im Einreichungs-Draft den plugin-eindeutigen Widget-Origin
     `https://mcp-coach-v1.skillpilot.com` festlegen;
   - Standardmetadatum `_meta.ui.domain` und ChatGPT-Kompatibilitätsalias
     `_meta["openai/widgetDomain"]` identisch ausliefern;
   - content-addressed oder release-addressed UI-Ressourcen-URIs erzeugen;
   - einmal veröffentlichte URIs unveränderlich behandeln;
   - UI-State mit `schemaVersion` versehen.

5. **V1-Skill-Bundle trennen**
   - eigener finaler Skill-Baum für `skillpilot-coach-v1`;
   - Toolreferenzen gegen V1 prüfen;
   - Bundle-Hash und Release-Artefakt erzeugen.

6. **Session-Versionen vervollständigen**
   - `contractMajor`, `stateVersion`, `stateSchemaVersion`, `workflowVersion` und `curriculumRevision` in zustandsbezogenen Antworten vorsehen;
   - `expectedStateVersion` und `clientRequestId` für Schreiboperationen prüfen beziehungsweise ergänzen;
   - stabile Fehlercodes definieren.

7. **Draft- und Published-Snapshots trennen**
   - Tool-, Schema-, Ressourcen-, UI-, Skill- und Security-Metadaten automatisiert exportieren;
   - Snapshotpfad und Hashes standardisieren;
   - denselben unveröffentlichten V1-Draft ohne Versionssprung fortschreibbar halten;
   - Published-Baseline erst nach bestätigter Portal-Veröffentlichung
     unveränderlich einfrieren.

8. **CI-Gates implementieren**
   - Versionskonsistenz;
   - Contract-Diff;
   - UI-URI-Integrität;
   - Skill-Tool-Lint;
   - V1-E2E- und Regressionstests.

9. **Lifecycle-Konfiguration anlegen**
   - Zustände `CURRENT`, `SUPPORTED`, `DEPRECATED`, `UNPUBLISHED`, `RETIRED` modellieren;
   - Nachfolger und Lifecycle-Daten konfigurierbar halten;
   - zunächst V1 auf `CURRENT` setzen.

10. **Runbook und ADR ablegen**
    - dieses Dokument oder eine verdichtete ADR-Version im Repository aufnehmen;
    - Release-, Rollback-, Unpublish- und Delete-Schritte dokumentieren.

### Phase B: Release-Automatisierung

Nach der strukturellen Vorbereitung:

- Plugin-Paket reproduzierbar bauen;
- Release Notes aus Contract-Diff und Commits vorbereiten;
- Scan- und Submission-Checkliste automatisieren, soweit das Portal dies zulässt;
- freigegebene Artefakte und Snapshots archivieren;
- Smoke Tests gegen den veröffentlichten Endpoint ausführen.

### Phase C: Erst bei einer tatsächlichen V2

Noch keine fachliche V2 implementieren. Lediglich sicherstellen, dass folgende spätere Schritte ohne Core-Neubau möglich sind:

- zweites Contract- und Adaptermodul;
- eigener MCP-Endpoint-Pfad und bei UI-Veröffentlichung ein eigener
  plugin-eindeutiger UI-Origin;
- neues Plugin-Paket;
- paralleler Betrieb;
- idempotente Sessionmigration;
- V1-Lifecycle und Telemetrie;
- sauberer Rückbau nach Delete.

## 19. Definition of Done für die V1-Vorbereitung

Die Versionierungsarchitektur gilt vor der ersten öffentlichen Einreichung als ausreichend vorbereitet, wenn:

- V1 im technischen Namen und Anzeigenamen erkennbar ist;
- Manifest-Version und Contract-Major konsistent sind;
- der öffentliche V1-MCP-Pfad unabhängig von späteren V2-Pfaden ist;
- der unveröffentlichte Draft keine fiktive UI-Domain beansprucht und vor
  einer tatsächlichen UI-Veröffentlichung ein eindeutiger Origin festgelegt
  werden muss;
- der aktuelle MCP-Vertrag als reproduzierbarer V1-Draft vorliegt;
- der Published-Index vor der ersten realen Veröffentlichung leer bleibt und
  nur durch einen explizit bestätigten Publikationsschritt fortgeschrieben
  werden kann;
- öffentliche DTOs vom Core getrennt sind;
- alle Schreiboperationen idempotent und gegen konkurrierende Zustandsänderungen geschützt sind oder eine dokumentierte Ausnahme besitzen;
- UI-Ressourcen unveränderlich versioniert werden;
- Skills als V1-Bundle reproduzierbar gebaut und geprüft werden;
- jeder Server-Build gegen den V1-Snapshot getestet wird;
- Lifecycle- und Migrationsfelder im Datenmodell vorgesehen sind;
- keine Runtime-Logik von einem undokumentierten Plugin-Versionssignal abhängt;
- Release- und Rollback-Runbook vorhanden sind.

## 20. Offene externe Fragen und Fallback

Folgende Punkte sind weiterhin offen und werden über den Community-Thread beziehungsweise Support verfolgt:

1. Akzeptiert OpenAI zwei klar versionierte Schwester-Plugins desselben Publishers im Directory?
2. Gibt es künftig einen offiziellen Nachfolger-Link zwischen V1 und V2?
3. Können OAuth-Verknüpfungen oder Installationen auf einen Nachfolger migriert werden?
4. Was geschieht exakt mit bestehenden Installationen und alten Chats nach Unpublish oder Delete?
5. Wie lange sollten alte UI-Ressourcen nach Delete erreichbar bleiben?
6. Wird ein verlässliches Runtime-Signal für Plugin-Identität und Plugin-Paketversion bereitgestellt?
7. Gibt es einen gesonderten Updatepfad für reine Skill-Änderungen?

Fallback, falls parallele Major-Plugins nicht akzeptiert werden:

- interne V1-/V2-Adaptertrennung beibehalten;
- V2-Funktionalität nur additiv mit neuen Toolnamen und neuen UI-Ressourcen innerhalb der bestehenden Plugin-Identität veröffentlichen;
- V1-Vertrag weiterhin bedienen;
- keine Entfernung von V1-Funktionalität, bis OpenAI einen unterstützten Lifecycle bereitstellt.

Dieser Fallback ist funktional schlechter, darf aber nicht zu einer unkontrollierten Breaking Change im Live-Server führen.

## 21. Entscheidungsbaum für Änderungen

```text
Ändert sich nur die Serverimplementierung,
ohne den veröffentlichten Vertrag zu verändern?
  |
  +-- Ja -> nur Server-Build deployen; alle Contract-Tests ausführen
  |
  +-- Nein
        |
        v
Ist die Änderung rückwärtskompatibel?
  |
  +-- Ja
  |     |
  |     +-- reine Korrektur -> PATCH derselben Plugin-Identität
  |     +-- neue Fähigkeit  -> MINOR derselben Plugin-Identität
  |
  +-- Nein
        |
        v
Kann und soll der alte Vertrag dauerhaft erhalten bleiben?
  |
  +-- Ja -> additive Ersatztools/-ressourcen innerhalb der Linie
  |
  +-- Nein -> neue Plugin-Major-Identität, Parallelbetrieb,
              Migration, Unpublish, Delete und Rückbau der alten Linie
```

## 22. Quellenbasis

**[OAI-1] OpenAI Developers – Submit plugins**  
https://developers.openai.com/plugins/deploy/submission

**[OAI-2] OpenAI Developers – MCP server review requirements**  
https://developers.openai.com/plugins/deploy/app-review

**[OAI-3] OpenAI Developers – Plugin submission errors**  
https://developers.openai.com/plugins/deploy/submission-errors

**[OAI-4] OpenAI Developers – Plugin UI reference**  
https://developers.openai.com/plugins/reference

**[OAI-5] OpenAI Developers – Add UI to your MCP server**  
https://developers.openai.com/plugins/build/chatgpt-ui

**[OAI-6] OpenAI Developers – Build skills**  
https://developers.openai.com/plugins/build/skills

**[DISC-1] OpenAI Developer Community – Should each breaking major version use a separate plugin identity?**  
https://community.openai.com/t/should-each-breaking-major-version-use-a-separate-plugin-identity/1388515

---

**Pflegehinweis:** Dieses Dokument ist zu aktualisieren, sobald OpenAI eine offizielle Antwort zum Parallelbetrieb versionierter Schwester-Plugins, zur Nachfolgermigration oder zum Verhalten von Unpublish/Delete veröffentlicht. Änderungen an der zentralen Major-Identitätsstrategie benötigen eine neue Architekturentscheidung.
