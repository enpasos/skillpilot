# Architekturkonzept: SkillPilot mit portabler Agent Runtime

**Status:** Strategiekonzept für die langfristige Host- und
Runtime-Unabhängigkeit von SkillPilot. Stand: 18. August 2026.

**Geltungsbereich:** Auswahl, Bewertung und Ablösung von AI Chat Applications
beziehungsweise MCP Hosts, die Verantwortungsgrenze zwischen Host und
SkillPilot Core sowie der daraus folgende Stufenplan.

Dieses Dokument legt die Richtung fest, nicht den ausgelieferten Vertrag. Die
verbindlichen Verträge des heutigen Coach-Pfades stehen weiterhin in den
verlinkten Dokumenten unter [Verwandte Dokumente](#15-verwandte-dokumente); bei
Abweichungen gelten diese. Host-, Plan- und Altersangaben sind Bewertungen zum
oben genannten Stand und werden vor einer Freigabe erneut geprüft.

## 1. Architekturentscheidung

SkillPilot sollte langfristig aus drei unabhängig austauschbaren Bereichen bestehen:

1. **SkillPilot Core** als dauerhaftes, anbieterneutrales Lernsystem,
2. eine **austauschbare AI Chat Application beziehungsweise ein MCP Host**,
3. ein **austauschbarer Model Provider**, der möglichst über Open Responses angesprochen wird.

Die zentrale Architekturregel lautet:

> **SkillPilot Core darf weder von einem bestimmten Chat-Host noch von einem bestimmten LLM-Anbieter abhängig sein.**

Gleichrangig daneben steht eine zweite, ebenso verbindliche Regel:

> **SkillPilot Core speichert ausschließlich Lernerfolg. Die Lernkommunikation
> selbst — Gesprächsverlauf, Formulierungen, Fotos, Anhänge, Schülerlösungen —
> wird nicht in SkillPilot Core gespeichert.**

Beide Regeln stützen sich gegenseitig: Ein Kern, der keine Gesprächsinhalte
hält, ist leichter host- und anbieterneutral zu halten, und ein Kern ohne
Hostbindung darf keine hostspezifischen Inhalte übernehmen. Abschnitt 4.2 führt
die Regel gegen die tatsächliche MCP-Oberfläche aus.

Für die nächsten Entwicklungsschritte ergibt sich daraus folgende Strategie:

- **Kurzfristig:** selbst betriebener Open-Source-MCP-Host für wenige Testnutzer, am sinnvollsten zunächst LibreChat.
- **Parallel:** Archestra als technisches Standardslabor für Open-Responses-Routing und MCP Apps untersuchen.
- **Mittelfristig:** ChatGPT und Claude als vom jeweiligen Anbieter betriebene Zugangskanäle verwenden, sobald sie die benötigten Funktionen, Altersgruppen und Oberflächen tatsächlich unterstützen.
- **Langfristig:** Wechsel zu einem fremdbetriebenen, standardkonformen MCP Host mit benutzereigenen Modellzugängen, sobald ein solcher Dienst alle Anforderungen erfüllt.

Es gibt derzeit **keinen einzelnen verfügbaren Dienst**, der gleichzeitig alle Anforderungen vollständig erfüllt:

- fremdbetriebene Agent Runtime,
- serverseitige, geräteübergreifende Chats,
- direkte Abrechnung zwischen Lernendem und Modellanbieter,
- Open Responses als Modellgrenze,
- Remote MCP,
- Skills,
- MCP Apps UI,
- Agent-Plugin-Paketierung,
- mobile Nutzung,
- Spracheingabe,
- Bildanalyse,
- und Eignung für minderjährige Schülerinnen und Schüler.

Deshalb ist eine Architektur mit mehreren Betriebswegen sinnvoller als die Suche nach einer einzigen Plattform.

---

## 2. Präzisierung der Standards

### 2.1 Open Responses

**Open Responses** standardisiert die Schnittstelle zwischen Agent Runtime und Model Provider. Dazu gehören unter anderem:

- typisierte Eingaben und Ausgaben,
- Messages,
- Tool Calls und Tool-Ergebnisse,
- Streaming-Events,
- Reasoning-Elemente,
- mehrstufige Agent Loops,
- providerabhängige Erweiterungen.

Open Responses reduziert die technische Bindung an die proprietäre API eines einzelnen Modellanbieters. Es garantiert aber nicht, dass alle Modelle dieselben Fähigkeiten besitzen. Bildverarbeitung, Tool Calling, strukturierte Ausgaben und Reasoning bleiben modellabhängige Fähigkeiten.

Für SkillPilot ist Open Responses eine Anforderung an den **MCP Host beziehungsweise dessen Agent Runtime**, nicht an SkillPilot Core.

### 2.2 Model Context Protocol

MCP standardisiert die Verbindung zwischen der KI-Anwendung und SkillPilot Core.

Die offizielle Rollenverteilung lautet:

- **MCP Host:** die gesamte KI-Anwendung,
- **MCP Client:** eine vom Host verwaltete Verbindung zu einem MCP Server,
- **MCP Server:** SkillPilot Core beziehungsweise dessen standardisierte Schnittstelle.

Für entfernte Server ist **Streamable HTTP** der maßgebliche Transport.

### 2.3 MCP Apps

MCP Apps ergänzt MCP um interaktive Oberflächen. Der MCP Server kann zu einem Tool eine HTML-basierte Ressource bereitstellen, die der Host in einer isolierten Umgebung rendert.

Die UI-Unterstützung wird zwischen Host und Server ausgehandelt. Sie ist daher **optional**. Nicht jeder MCP Host kann MCP Apps anzeigen.

Jedes SkillPilot-Tool sollte deshalb drei Ausgabeebenen unterstützen:

1. **Textausgabe** als universeller Fallback,
2. **strukturierte Daten** für Hosts mit eigener Darstellung,
3. **MCP Apps UI** für Hosts mit interaktiver UI-Unterstützung.

Eine didaktisch notwendige Aktion darf niemals ausschließlich über eine MCP-App-Oberfläche möglich sein.

### 2.4 Agent Plugins

Die portable Agent-Plugins-Spezifikation definiert in Version 1 im Wesentlichen:

```text
skillpilot-plugin/
├── plugin.json
├── skills/
│   └── skillpilot-coach/
│       └── SKILL.md
└── mcp.json
```

Der portable Kern besteht damit aus:

- Manifest,
- Skills,
- MCP-Server-Konfiguration.

**MCP Apps UI ist keine dritte, separat im Agent Plugin verpackte Komponente.** Die UI wird zur Laufzeit vom in `mcp.json` referenzierten MCP Server bereitgestellt.

Agent Plugins 1.0 ist derzeit noch ein Working Draft. Das Paket sollte deshalb als kanonisches, portables Auslieferungsformat gepflegt werden, ohne vorauszusetzen, dass jeder Host es bereits vollständig importieren kann.

Die treffende Formulierung für SkillPilot lautet daher:

> SkillPilot wird als Agent Plugin mit Skill und MCP-Konfiguration ausgeliefert. Der referenzierte SkillPilot-MCP-Server stellt zusätzlich optionale MCP Apps UIs bereit.

Host-spezifische Erweiterungen dürfen ergänzend vorhanden sein, sollten aber nur dünne Adapter enthalten. Die didaktischen Regeln gehören in den portablen Skill beziehungsweise in SkillPilot Core.

---

## 3. Zielarchitektur

```text
┌──────────────────────────── Endgeräte ─────────────────────────────┐
│                                                                    │
│  Mobile Browser       Desktop Browser       spätere native App     │
│                                                                    │
│  • Texteingabe        • Spracheingabe / Diktat                     │
│  • Kamera             • Bild- und Dateiupload                      │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌────────────── AI Chat Application / MCP Host ──────────────────────┐
│                                                                    │
│  Chat UI                                                           │
│  ├── Anmeldung                                                     │
│  ├── Chatverlauf                                                   │
│  ├── Spracheingabe                                                 │
│  ├── Kamera- und Dateiupload                                       │
│  └── geräteübergreifender Zugriff                                  │
│                                                                    │
│  Server-side Agent Runtime                                         │
│  ├── Agent Loop                                                    │
│  ├── Conversation Context                                          │
│  ├── Session- und Chat-Speicher                                    │
│  ├── Attachment Handling                                           │
│  ├── Model Client / Router                                         │
│  │     └── Open Responses Client – Zielstandard                    │
│  └── MCP Client                                                    │
└──────────────────────┬──────────────────────┬──────────────────────┘
                       │                      │
          Open Responses API          Remote MCP
                       │          Streamable HTTP + OAuth
                       ▼                      ▼
┌────────────────────────────┐   ┌────────────────────────────────────┐
│ Model Provider /           │   │ SkillPilot Core                    │
│ benutzereigener Gateway    │   │                                    │
│                            │   │ ┌────────────────────────────────┐ │
│ • OpenAI                   │   │ │ MCP Server                     │ │
│ • Anthropic                │   │ │                                │ │
│ • Google                   │   │ │ • Tools                        │ │
│ • xAI                      │   │ │ • Resources                    │ │
│ • Open-Model-Hoster        │   │ │ • Prompts                      │ │
│ • weitere Provider         │   │ │ • optionale MCP Apps UI        │ │
│                            │   │ └───────────────┬────────────────┘ │
│ Benutzer- oder             │   │                 │                  │
│ Elternkonto trägt Kosten   │   │ ┌───────────────▼────────────────┐ │
└────────────────────────────┘   │ │ Didactic Services              │ │
                                 │ │                                │ │
                                 │ │ • Lernzielsteuerung            │ │
                                 │ │ • Lernkarten                   │ │
                                 │ │ • Aufgaben und Bewertungsraster│ │
                                 │ │ • Lernstandsmodell             │ │
                                 │ │ • Curriculare Ontologie        │ │
                                 │ └───────────────┬────────────────┘ │
                                 │                 │                  │
                                 │ ┌───────────────▼────────────────┐ │
                                 │ │ Learning State Database        │ │
                                 │ │ nur Lernerfolg,                │ │
                                 │ │ keine Gesprächsinhalte         │ │
                                 │ └────────────────────────────────┘ │
                                 └────────────────────────────────────┘
```

---

## 4. Verantwortungs- und Zustandsgrenzen

### 4.1 Zustand des MCP Hosts

Der MCP Host speichert:

- Benutzerkonto des Chatdienstes,
- Chatverläufe,
- Nachrichten,
- Chat- und Conversation-IDs,
- Modellwahl,
- laufende Agent-Runs,
- hochgeladene Chat-Anhänge,
- technische Tool-Call-Historie,
- gegebenenfalls benutzereigene Provider-Zugangsdaten.

Damit kann der Nutzer denselben Chat auf Smartphone und Desktop fortsetzen.

### 4.2 Zustand von SkillPilot Core

SkillPilot Core speichert **ausschließlich Lernerfolg**, also das Ergebnis des
Lernens — nicht seinen Verlauf und nicht sein Material:

- Zuordnung zum SkillPilot-Lernenden,
- gewähltes Curriculum und Personalisierung,
- ausgewählter Lernzielbereich (Scope) und aktives Lernziel,
- Mastery je Lernziel als Zahlenwert,
- Lernkartenplanung und fällige Wiederholungen,
- Verified-Recall-Ergebnis je Karte als bestanden oder nicht bestanden.

Ebenso wichtig ist die Negativliste. SkillPilot Core speichert **nicht**:

- Chatverläufe, Nachrichten oder Formulierungen der lernenden Person,
- Fotos, Scans, Dateianhänge oder sonstige Binärinhalte,
- eingereichte Schülerlösungen oder deren Korrekturen,
- Freitextantworten zu Aufgaben,
- Analyse- oder Bewertungsprotokolle des Modells.

Diese Grenze ist keine Absicht für später, sondern der heutige Stand: Die
schreibenden Werkzeuge der MCP-Oberfläche sind `setCurriculum`,
`setPersonalization`, `setScope`, `setActiveGoal`, `setMastery` und
`recordVerifiedRecallResult`. Sie nehmen ausschließlich Lernziel-IDs, einen
Mastery-Zahlenwert und ein bestanden/nicht-bestanden entgegen. Es gibt kein
Werkzeug, das ein Bild, einen Anhang, eine Lösung oder einen Gesprächsausschnitt
entgegennimmt.

Eine einzige textuelle Abweichung besteht heute noch: `recordVerifiedRecallResult`
nimmt eine kurze Rückmeldung entgegen, die als `lastFeedback` beim Kartenergebnis
abgelegt wird. Sie ist aus dem Recall-Versuch abgeleitet und kein Mitschnitt des
Gesprächs, aber sie ist Freitext und damit eine Ausnahme von der Regel.

Diese Ausnahme wird **nicht als Bestandteil der Architektur akzeptiert**. Sie ist
als [Korrektur für v2](#14-offene-korrekturen-fur-v2) vorgemerkt. Bis dahin gilt
sie als geduldete Altlast: Kein neues Werkzeug und kein neuer Zustand darf sich
auf sie berufen, und die Negativliste bleibt vollständig gültig.

Der Lernzustand muss unabhängig vom jeweiligen Chat-Host sein.

Ein Lernender kann dann beispielsweise zuerst über LibreChat und später über ChatGPT auf SkillPilot zugreifen. Er sieht dort nicht automatisch denselben Chatverlauf, aber SkillPilot kennt weiterhin:

- das aktuelle Lernziel,
- den bisherigen Lernstand,
- die nächste fällige Lernkarte.

Was er dort ausdrücklich **nicht** wiederfindet, ist die frühere Lernkommunikation
selbst: das fotografierte Aufgabenblatt, seine ausformulierte Lösung und den
Dialog, in dem sie besprochen wurde. Das ist gewollt und keine Lücke.

### 4.3 Keine hostübergreifende Chatportabilität

MCP, Open Responses und Agent Plugins standardisieren derzeit **nicht den Austausch vollständiger Chatarchive zwischen verschiedenen Hosts**. Der MCP Host besitzt und kontrolliert den Gesprächsverlauf und stellt dem MCP Server nur den jeweils benötigten Kontext bereit.

Daraus folgt:

> Der Chatverlauf ist hostgebunden. Der Lernzustand ist SkillPilot-gebunden.

Der Chat darf deshalb niemals die einzige Quelle für didaktisch relevanten Zustand sein.

SkillPilot sollte nach wichtigen Schritten selbst einen kompakten Checkpoint
speichern. Dieser Checkpoint besteht aus Kennungen und Ergebniswerten, nicht aus
Gesprächsinhalten:

```text
learner
activeGoal
masteryValue
dueItems
lastRecallOutcome
nextRecommendedAction
```

Ein Checkpoint darf ausdrücklich keine Nachrichtenauszüge, keine Lösungstexte und
keine Verweise auf Bilddateien enthalten. Geht der Chatverlauf verloren, ist der
Lernerfolg vollständig erhalten und die Lernkommunikation bewusst nicht.

### 4.4 Identität

Die Identität sollte über SkillPilot-OAuth hergestellt werden.

Der MCP Host erhält ein Zugriffstoken, das SkillPilot intern dem Lernenden zuordnet. Interne SkillPilot-IDs müssen weder im Chat noch gegenüber dem Modell sichtbar sein.

Die vom Host gemeldete E-Mail-Adresse oder der Anzeigename darf nicht als alleiniger Identitätsnachweis dienen.

---

## 5. Zwei dauerhaft unterstützte Betriebswege

### 5.1 Betriebsweg A: vom Plattformanbieter gehosteter MCP Host

```text
Smartphone / Browser
        │
        ▼
ChatGPT oder Claude
├── Chat UI
├── Agent Runtime
├── Chat-Speicher
├── Modellbetrieb
└── MCP Client
        │
        ▼
SkillPilot Core / Remote MCP
```

Vorteile:

- sehr geringer eigener Betriebsaufwand,
- ausgereifte Apps und Weboberflächen,
- geräteübergreifende Chatverläufe,
- direkte Vertrags- und Abrechnungsbeziehung zwischen Nutzer und Plattform,
- kein eigener LLM-Betrieb.

Nachteile:

- die Agent Runtime ist anbieterspezifisch,
- die Modellgrenze ist nicht unter eigener Kontrolle,
- Open Responses ist intern nicht erzwingbar,
- Funktionsumfang und Pläne bestimmt der Plattformanbieter,
- Plugin-Reviews und Freigaben können den Zugang verzögern,
- Chatverläufe verbleiben beim jeweiligen Host.

Dieser Weg ist für die spätere Reichweite attraktiv, darf aber nicht die kanonische SkillPilot-Architektur bestimmen.

### 5.2 Betriebsweg B: portabler Open-Source-MCP-Host

```text
Smartphone / Browser
        │
        ▼
selbst oder fremd betriebener Open-Source-MCP-Host
├── Chat UI
├── serverseitige Agent Runtime
├── Chat-Speicher
├── Open Responses Client
└── MCP Client
        │                       │
        ▼                       ▼
Model Provider             SkillPilot Core
mit Nutzerkonto            Remote MCP
```

Vorteile:

- Agent Runtime und Chatdaten unter eigener Kontrolle,
- austauschbare Modellanbieter,
- benutzereigene API-Zugänge,
- langfristig Open Responses als stabile Modellgrenze,
- standardisierte Remote-MCP-Verbindung,
- späterer Wechsel des Betreibers ohne Änderung von SkillPilot Core.

Nachteile:

- zunächst eigener Betrieb,
- Verwaltung benutzereigener API-Zugangsdaten,
- mobile Qualität hängt vom gewählten Open-Source-Host ab,
- die Standards werden von aktuellen Hosts noch nicht überall vollständig unterstützt.

Dieser Weg ist die **Zielarchitektur** und zugleich die Grundlage für den kurzfristigen Pilotbetrieb.

---

## 6. Tatsächlich verfügbare Host-Optionen

### 6.1 ChatGPT

#### Was funktioniert

ChatGPT bietet:

- vollständig gehostete Chat- und Agent-Laufzeit,
- geräteübergreifende Chatverläufe,
- mobile und Weboberflächen,
- Spracheingabe und Bildverarbeitung,
- direkte Abrechnung über das ChatGPT-Konto,
- einen Plugin-Veröffentlichungs- und Verzeichnisprozess.

OpenAI hat das frühere App Directory durch ein Plugin Directory ersetzt. Die konkrete Verfügbarkeit von Plugins hängt jedoch weiterhin von Plan, Workspace, Rolle, Region und Oberfläche ab.

#### Aktuelle Einschränkungen

Custom MCP Apps im Developer Mode sind derzeit auf bestimmte Business-, Enterprise- beziehungsweise Edu-Szenarien und auf die Weboberfläche beschränkt. OpenAI weist ausdrücklich darauf hin, dass Custom MCP Apps nicht auf mobilen Oberflächen unterstützt werden.

ChatGPT unterstützt zwar Sprache und Bilder allgemein, der Live-Sprachmodus unterstützt Plugins beziehungsweise verbundene Apps zunächst nicht vollständig.

Die interne Verbindung zwischen ChatGPT-Agent-Runtime und OpenAI-Modellen ist zudem nicht die von SkillPilot kontrollierte Open-Responses-Grenze.

#### Eignung

**Geeignet als:**

- späterer, fremdbetriebener Vertriebskanal,
- Zugang für Nutzer mit passendem ChatGPT-Konto,
- skalierbare Variante nach erfolgreichem Review.

**Nicht geeignet als:**

- kurzfristig garantiert verfügbare private Testumgebung,
- derzeit verlässliche mobile Custom-MCP-App-Lösung,
- anbieterneutrale Agent Runtime.

Für Minderjährige gilt bei ChatGPT grundsätzlich ein Mindestalter von 13 Jahren; unter 18 ist die Zustimmung eines Elternteils oder Erziehungsberechtigten erforderlich.

**Bewertung:** strategisch wichtig, aber nicht als alleinige Pilotlösung einplanen.

---

### 6.2 Claude

#### Was funktioniert

Claude unterstützt Remote MCP Connectors und stellt sie über Web-, Desktop- und mobile Oberflächen bereit. Interaktive Connectors beziehungsweise MCP Apps können inzwischen ebenfalls auf unterstützten Claude-Oberflächen dargestellt werden.

Claude bietet außerdem:

- mobile Diktierfunktion,
- Voice Mode,
- Bild- und Dateiupload,
- vom Nutzer bezahlte Claude-Abonnements.

#### Aktuelle Einschränkungen

- Anthropic verlangt für Claude-Consumerkonten derzeit ein Mindestalter von 18 Jahren.
- Der Nutzer ist an die Claude-Agent-Runtime und Anthropic-Modelle gebunden.
- Ein Import portabler Agent-Plugins-v1-Pakete ist nicht als belastbarer allgemeiner Produktweg verifiziert.
- Ein Claude-Abonnement ist nicht automatisch ein Claude-API-Guthaben; Consumer- und API-Abrechnung sind getrennt.

#### Eignung

**Geeignet als:**

- technisch sehr guter gehosteter Remote-MCP-Test,
- Test von MCP Apps auf mobilen Endgeräten,
- Pilot mit volljährigen Testpersonen,
- Referenz für die gewünschte spätere Benutzererfahrung.

**Nicht geeignet als:**

- reguläre Plattform für minderjährige Schülerinnen und Schüler,
- anbieterneutrale Agent Runtime.

**Bewertung:** aktuell die technisch überzeugendste gehostete MCP-Variante, aber wegen der Altersgrenze nicht die allgemeine Schülerlösung.

---

### 6.3 LibreChat

#### Was funktioniert

LibreChat ist eine selbst hostbare Open-Source-Chatplattform. Für einen kleinen Pilotbetrieb kann sie per Docker Compose auf einem einzelnen Server betrieben werden. Sie besitzt einen serverseitigen Chat- und Sitzungsspeicher und unterstützt wiederaufnehmbare Streams und geräteübergreifende Chatnutzung.

Für die SkillPilot-Anforderungen sind besonders relevant:

- browserbasierte Spracheingabe,
- Bild- und Dateiupload für Vision-Modelle,
- benutzereigene API-Schlüssel,
- Remote MCP,
- OAuth 2.0 mit Authorization Code und PKCE,
- mehrere Modellanbieter.

LibreChat kann damit die Modellkosten über den persönlichen API-Zugang des Lernenden beziehungsweise der Eltern direkt beim Modellanbieter abrechnen.

#### Stand der Standards

Agent Plugins 1.0 wurden im August 2026 als experimentelle Funktion in LibreChat integriert. Das System kann portable Pakete mit `plugin.json`, Skills und `mcp.json` aus einem Betreiberverzeichnis laden.

Die vollständige Unterstützung der offiziellen MCP-Apps-Erweiterung befindet sich dagegen derzeit noch in einem offenen Draft Pull Request und ist noch nicht Bestandteil einer belastbaren regulären Version.

LibreChat besitzt außerdem einen Responses-kompatiblen Zugang zu seinen eigenen Agents. Das ist jedoch nicht dasselbe wie eine nachweislich durchgängige Open-Responses-Schnittstelle zwischen LibreChat und allen dahinterliegenden Modellanbietern.

#### Eignung

**Geeignet als:**

- unmittelbare Testplattform für fünf bis zehn Nutzer,
- serverseitiger MCP Host,
- geräteübergreifender Chat,
- mobile Browseroberfläche,
- Spracheingabe,
- Bildanalyse,
- BYOK-Betrieb,
- Remote-MCP-Integration.

**Noch nicht belastbar für:**

- vollständige MCP-Apps-Darstellung ohne eigene Anpassungen,
- vollständig standardisierte Open-Responses-Modellgrenze,
- produktive Abhängigkeit vom experimentellen Agent-Plugin-Import.

#### Konkrete Verwendung im Pilot

Für den Pilot sollte SkillPilot zunächst auf dem stabilsten Weg angebunden werden:

1. SkillPilot als normalen Remote-MCP-Server in LibreChat konfigurieren.
2. Skill-Anweisungen über den vorhandenen Skill- beziehungsweise Agent-Mechanismus einbinden.
3. Das kanonische Agent-Plugin-Paket parallel weiterpflegen.
4. MCP Apps nicht zur Voraussetzung machen.
5. Jede SkillPilot-Funktion zunächst vollständig über Text und strukturierte Tool-Ergebnisse nutzbar machen.

**Bewertung:** beste kurzfristige Hauptlösung.

---

### 6.4 Archestra

#### Was funktioniert

Archestra ist eine selbst hostbare Open-Source-Plattform mit:

- serverseitiger Agent Runtime,
- Chatoberfläche,
- MCP-Unterstützung,
- MCP Apps,
- Model Router,
- `/responses`- und `/chat/completions`-Endpunkten,
- persönlichen Modellanbieter-Zugangsdaten.

Damit kommt Archestra der langfristigen Zielarchitektur näher als viele klassische Chat-UIs:

```text
Agent Runtime
    ├── Responses-basierter Model Router
    ├── persönliche Provider Keys
    ├── MCP Client
    └── MCP Apps Host
```

#### Aktuelle Einschränkungen

- Die Dokumentation bezeichnet den Model Router als OpenAI-kompatible Responses API. Eine vollständige Konformität zur unabhängigen Open-Responses-Spezifikation sollte separat getestet und nicht nur aus dem Endpunktnamen abgeleitet werden.
- Eine belastbare Agent-Plugins-v1-Unterstützung ist nicht verifiziert.
- Mobile Browserqualität, Diktierfunktion und der vollständige Kamera-Workflow sind in den verfügbaren Unterlagen nicht ausreichend belegt.
- Die Plattform ist stärker auf Unternehmens- und Plattformbetrieb ausgerichtet und komplexer als LibreChat.
- Das Lizenzmodell ist Open Core; der freie Basisteil steht unter AGPL, während bestimmte Funktionen gesondert lizenziert sein können.

#### Eignung

**Geeignet als:**

- technisches Standardslabor,
- Testumgebung für MCP Apps,
- Untersuchung des `/responses`-Model-Routers,
- möglicher späterer produktiver Host.

**Noch nicht als Hauptpilot verwenden, bevor folgende Punkte praktisch geprüft sind:**

- Smartphone-Bedienung,
- Diktat,
- Kamera- und Dateiupload,
- geräteübergreifende Chats,
- persönliche Provider Keys,
- Open-Responses-Konformität,
- Betriebsaufwand.

**Bewertung:** stärkster paralleler Kandidat für die langfristige Architektur, aber nicht die risikoärmste unmittelbare Schüleroberfläche.

---

### 6.5 Open WebUI

Open WebUI besitzt eine breite Modellanbieterunterstützung und experimentelle Responses-API-Funktionen. Eine native, vollständige MCP-Apps-Unterstützung ist jedoch derzeit nicht der stabile Kernweg; dafür wären zusätzliche Bridges oder Erweiterungen nötig.

Damit würde gerade in dem Bereich eigener Integrationscode entstehen, den SkillPilot vermeiden möchte.

**Bewertung:** für dieses Vorhaben derzeit nicht gegenüber LibreChat oder Archestra bevorzugen.

---

## 7. Vergleich

| Option | Betrieb der Runtime | Direkte Nutzerabrechnung | Mobile Nutzung | Diktat und Bilder | Remote MCP | MCP Apps UI | Open Responses kontrollierbar | Agent Plugin v1 | Empfehlung |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| ChatGPT | OpenAI | über ChatGPT-Abo | ja | allgemein ja | ja, planabhängig | Custom Apps derzeit nicht mobil | nein | OpenAI-Produktweg, nicht überall portabel | strategischer Vertriebskanal |
| Claude | Anthropic | über Claude-Abo | ja | ja | ja | ja | nein | nicht verifiziert | sehr gut für volljährige Tester |
| LibreChat | selbst/fremd hostbar | BYOK beim Provider | mobile Weboberfläche | ja | ja | noch nicht stabil | nur teilweise | experimentell | **unmittelbarer Pilot** |
| Archestra | selbst/fremd hostbar | persönliche Provider Keys | zu testen | zu testen | ja | ja | vielversprechend, zu verifizieren | nicht verifiziert | **Standardslabor** |
| künftiger Managed Host | fremder Betreiber | idealerweise BYOK | gefordert | gefordert | gefordert | gefordert | gefordert | gefordert | langfristiges Ziel |

---

## 8. Spracheingabe und Bildanalyse

### 8.1 Spracheingabe

Spracheingabe sollte eine Funktion des Chat-Clients beziehungsweise MCP Hosts sein:

```text
Mikrofon
   │
   ▼
Speech-to-Text im Browser oder Host
   │
   ▼
normale Textnachricht
   │
   ▼
Agent Runtime
```

SkillPilot Core muss für normales Diktieren keine Audiodaten erhalten.

Das hat mehrere Vorteile:

- keine zusätzliche Audio-API in SkillPilot,
- kein modellabhängiges Audioformat,
- Text bleibt in allen Hosts verwendbar,
- geringer Portierungsaufwand.

Ein echter kontinuierlicher Voice Mode ist optional. Für den Lernbetrieb reicht zunächst eine zuverlässige Diktierfunktion im Eingabefeld.

### 8.2 Flüchtige Bildanalyse

Für eine kurzfristige Analyse einer fotografierten Aufgabenlösung genügt:

```text
Kamera / Bild-Upload
        │
        ▼
MCP Host
        │
        ▼
vision-fähiges Modell
        │
        ├── sprachliche Analyse
        └── SkillPilot Tool Calls
```

Das Bild wird in diesem Fall nicht an SkillPilot Core übertragen — und zwar nicht
nur aus Sparsamkeit, sondern weil SkillPilot Core es gar nicht entgegennehmen
kann. Das Modell analysiert das Bild, bespricht den Fehler im Chat und schreibt
anschließend nur den **Lernerfolg** zurück.

Was zurückgeschrieben wird, ist genau ein Mastery-Wert zu einem Lernziel:

```json
{
  "tool": "setMastery",
  "goalId": "<exakte Lernziel-ID>",
  "mastery": 0.6
}
```

Die inhaltliche Beobachtung — welche Aufgabe es war, welchen Fehler die lernende
Person gemacht hat, wie sicher das Modell war — bleibt im Gespräch beim Host. Sie
wird nicht als Analyseprotokoll an SkillPilot übergeben. Ein Tool, das ein Feld
wie `observedAnswer` oder `suspectedError` annähme, gibt es nicht und soll es
auch nicht geben: Es würde die Lernkommunikation in den Kern ziehen.

### 8.3 Keine dauerhaft gespeicherte Schülerlösung

Eine fotografierte oder ausformulierte Schülerlösung wird **nicht** in SkillPilot
Core abgelegt. Weder als Bild noch als Text, weder direkt im Tool Call noch über
einen eigenen Uploadweg.

Der Ablauf bei einer fotografierten Abituraufgabe ist deshalb durchgehend
flüchtig:

```text
Kamera / Bild-Upload
        │
        ▼
MCP Host  ── Bild bleibt hier
        │
        ▼
vision-fähiges Modell
        │
        ├── Analyse und Korrektur im Gespräch
        │
        └── setMastery(goalId, wert)
                    │
                    ▼
            SkillPilot Core
            speichert nur den Mastery-Wert
```

Dauerhaft bleibt davon in SkillPilot Core genau eine Aussage übrig: dass dieses
Lernziel zu diesem Grad beherrscht wird. Nicht, woran es gezeigt wurde.

Das ist eine bewusste Entscheidung mit einem bewussten Preis:

- Eine Lösung kann später nicht erneut aufgerufen oder nachkorrigiert werden.
- Es entsteht kein Portfolio und kein belegbarer Lernnachweis im Sinne
  archivierter Schülerarbeit.
- Ein Wechsel des Chat-Hosts nimmt die frühere Lernkommunikation mit.

Dafür entfallen die schwersten Lasten: kein Object Storage für Schülerarbeit,
keine Aufbewahrungs- und Löschfristen für personenbezogene Inhalte Minderjähriger,
keine Herausgabe- und Einsichtsfragen, keine Migration von Binärbeständen beim
Hostwechsel. Für ein Lernsystem, dessen Kern anbieterneutral und langlebig sein
soll, ist das der günstigere Tausch.

Will eine lernende Person eine Lösung behalten, geschieht das außerhalb von
SkillPilot Core — in der Fotobibliothek des Geräts oder im Anhangspeicher des
jeweiligen Hosts. SkillPilot verspricht dafür nichts und übernimmt dafür keine
Verantwortung.

Tool Calls transportieren entsprechend keine großen Bilder als Base64-Daten. Das
ist hier keine Optimierung mehr, sondern folgt unmittelbar aus der Regel.

Sollte später ein echter, archivierter Lernnachweis fachlich gefordert werden,
ist das eine Änderung dieser Architekturregel und keine bloße Erweiterung. Sie
wäre gesondert zu entscheiden und zu dokumentieren.

---

## 9. Abrechnungsmodell

### 9.1 Fremdbetriebener Host

Bei ChatGPT oder Claude zahlt der Nutzer das jeweilige Consumer-Abonnement direkt an den Plattformanbieter.

Das erfüllt die direkte Abrechnung, führt aber zu einer Bindung an dessen:

- Agent Runtime,
- Modellangebot,
- Kontoregeln,
- Altersbedingungen,
- Plugin-Unterstützung.

### 9.2 Selbst betriebener Host mit BYOK

Beim Open-Source-Host verwendet jeder Nutzer einen eigenen API-Zugang:

```text
Lernender beziehungsweise Elternteil
        │
        ├── Providerkonto
        ├── eigener API Key
        └── eigene Zahlungs- und Budgetgrenze
                 │
                 ▼
        selbst betriebener MCP Host
```

Der MCP Host führt die Anfrage aus, aber der Provider rechnet über das Konto des Nutzers ab.

Wichtig ist die Trennung von Consumer- und API-Abonnements:

- Ein ChatGPT Plus- oder Pro-Abonnement enthält nicht automatisch OpenAI-API-Guthaben.
- Ein Claude Pro- oder Max-Abonnement ist ebenfalls kein Claude-API-Zugang.

Für minderjährige Lernende sollte das Providerkonto in der Regel durch Eltern beziehungsweise Erziehungsberechtigte angelegt und mit einer festen Ausgabengrenze versehen werden.

### 9.3 Ausschlusskriterium

Nicht geeignet ist ein Host, der:

- nur einen zentralen API Key des SkillPilot-Betreibers verwendet,
- die Tokenkosten anschließend an SkillPilot berechnet,
- oder keine persönliche Providerabrechnung zulässt.

Das würde das von SkillPilot zu vermeidende Tokenkosten- und Abrechnungsrisiko wieder auf SkillPilot verlagern.

---

## 10. Empfohlener Pilotaufbau

```text
Internet
   │
   ▼
HTTPS Reverse Proxy
   │
   ├────────────────────────────┐
   ▼                            ▼
LibreChat                    SkillPilot Core
Single Node                 bestehende Infrastruktur
   │                            │
   ├── MongoDB                  ├── MCP Server
   ├── Chat Sessions            ├── OAuth
   ├── User Accounts            └── Learning State
   ├── User Provider Keys           (nur Lernerfolg)
   ├── Voice Dictation
   ├── Image Upload
   └── MCP Client
```

Für eine Handvoll Testnutzer genügt:

- ein Server beziehungsweise eine VM,
- Docker Compose,
- HTTPS,
- LibreChat,
- MongoDB,
- geschlossene Registrierung,
- manuell angelegte Testkonten,
- tägliche Datenbanksicherung,
- keine Kubernetes-Infrastruktur,
- zunächst kein horizontaler Betrieb,
- kein zusätzlicher Redis-Cluster.

SkillPilot Core bleibt davon getrennt und wird lediglich als Remote-MCP-Server angebunden.

### Pilotkonfiguration

1. Jeder Tester erhält ein Konto im selbst betriebenen Chat-Host.
2. Jeder Tester beziehungsweise Elternteil hinterlegt einen eigenen Provider-API-Key.
3. Es werden nur Modelle freigeschaltet, die:
   - Bilder verarbeiten,
   - Tools zuverlässig aufrufen,
   - Streaming unterstützen,
   - deutschsprachige Antworten in ausreichender Qualität erzeugen.
4. SkillPilot wird nativ als Remote-MCP-Server konfiguriert.
5. Der SkillPilot Skill wird als Agent- beziehungsweise Skill-Anweisung eingebunden.
6. MCP Apps werden nur zusätzlich verwendet, sobald der Host sie stabil unterstützt.
7. Die kritischen Lernabläufe bleiben textbasiert nutzbar.

---

## 11. Stufenplan

### Phase 1: Schnittstellen stabilisieren

SkillPilot Core erhält eine hostunabhängige MCP-Schnittstelle mit:

- Streamable HTTP,
- OAuth 2.0,
- stabilen Tool-Namen,
- versionierten Eingabe- und Ausgabeschemata,
- idempotenten Schreiboperationen,
- Text-Fallback,
- `structuredContent`,
- optionalen MCP-Apps-Ressourcen,
- klaren Fehlercodes,
- dauerhaftem Learning State, der ausschließlich Lernerfolg enthält.

Diese Schnittstelle erhält bewusst **kein** Werkzeug zum Hochladen von Bildern,
Anhängen oder Schülerlösungen. Die Speichergrenze aus Abschnitt 4.2 ist damit
schon in Phase 1 durch die Toolliste erzwungen und nicht bloß eine Zusage.

Parallel wird das kanonische Agent Plugin gepflegt:

```text
plugin.json
skills/skillpilot-coach/SKILL.md
mcp.json
```

### Phase 2: LibreChat-Pilot

Ziel:

- fünf bis zehn Testnutzer,
- Smartphone und Desktop,
- derselbe Chat auf mehreren Geräten,
- Diktieren,
- Fotografieren und Analysieren von Lösungen,
- persönlicher API-Zugang,
- keine Abhängigkeit vom OpenAI-Reviewprozess.

In dieser Phase ist es akzeptabel, dass LibreChat intern noch providerabhängige Adapter verwendet. SkillPilot selbst bleibt trotzdem entkoppelt, weil seine einzige Verbindung Remote MCP ist.

### Phase 3: Standardslabor mit Archestra

Parallel wird geprüft:

- `/responses`-Verhalten,
- Open-Responses-Kompatibilität,
- persönliche Provider Keys,
- MCP Apps,
- mobile Browserqualität,
- Bild- und Sprachworkflow,
- Agent-Plugin-Import,
- Betriebsaufwand.

Archestra ersetzt LibreChat erst, wenn es in diesen Punkten praktisch besser abschneidet.

### Phase 4: Hosted Channels

#### Claude

- Test mit volljährigen Personen,
- Remote MCP,
- MCP Apps,
- mobile Bedienung,
- Diktat,
- Bilder.

#### ChatGPT

- Plugin-Review weiterführen,
- veröffentlichte Plugin-Version testen,
- tatsächliche Plan- und Mobilverfügbarkeit prüfen,
- nicht auf Custom-MCP-Developer-Mode als Schülerlösung bauen.

Beide Hosts greifen auf denselben SkillPilot-Lernzustand zu. Ihre Chatarchive bleiben getrennt.

### Phase 5: Fremdbetriebener portabler Host

Ein Wechsel vom eigenen Betrieb zu einem fremden Betreiber erfolgt erst, wenn dieser nachweislich unterstützt:

1. serverseitige, dauerhafte Chats,
2. geräteübergreifende Nutzung,
3. persönliche Modellanbieter-Zugangsdaten,
4. direkte Nutzerabrechnung,
5. Open Responses,
6. Remote MCP mit OAuth,
7. MCP Apps,
8. Agent Plugins,
9. mobile Spracheingabe,
10. mobile Bildaufnahme,
11. Datenexport und Löschung,
12. für die Zielaltersgruppe zulässige Konten.

---

## 12. Abnahmetests für jeden MCP Host

Ein Host darf für SkillPilot erst freigegeben werden, wenn folgende Tests bestehen:

### Geräte und Sitzungen

- Chat auf dem Smartphone beginnen und auf dem Desktop fortsetzen.
- Chat nach Browserneustart wieder öffnen.
- Während einer laufenden Antwort die Verbindung unterbrechen und fortsetzen.
- Zwei Geräte dürfen nicht zu widersprüchlichen Lernaktionen führen.

### Sprache

- mindestens 60 Sekunden deutsche Sprache diktieren,
- mathematische Begriffe ausreichend verständlich erkennen,
- Text vor dem Absenden korrigieren können,
- Tool Call nach diktierter Eingabe erfolgreich ausführen.

### Bilder

- Foto direkt mit der Smartphone-Kamera aufnehmen,
- JPEG und typische Smartphoneformate verarbeiten,
- handschriftliche Lösung analysieren,
- nachweisen, dass das Bild den Host nicht verlässt und in SkillPilot Core kein
  Bild, kein Anhang und kein Lösungstext ankommt,
- anschließend ein SkillPilot-Tool aufrufen,
- Bild und Text gemeinsam in einem Turn verarbeiten.

### MCP

- OAuth-Anmeldung auf dem Smartphone abschließen,
- Zugriffstoken erneuern,
- unterbrochene MCP-Verbindung wiederherstellen,
- Tool Call eindeutig einem Lernenden zuordnen,
- keine interne SkillPilot-ID im Modellkontext anzeigen.

### UI

- vollständiger Ablauf ohne MCP Apps möglich,
- strukturierte Tool-Ergebnisse korrekt anzeigen,
- MCP App auf unterstützten Hosts in einer Sandbox laden,
- UI-Aktion darf nur erlaubte Tools aufrufen.

### Abrechnung

- jeder Nutzer verwendet ein eigenes Providerkonto,
- kein zentraler SkillPilot-API-Key,
- Modellanbieter rechnet direkt mit Nutzer beziehungsweise Eltern ab,
- Nutzer kann Ausgaben begrenzen,
- API-Schlüssel erscheinen nicht in Logs oder Chatnachrichten.

### Modellwechsel

Jedes freigegebene Modell muss dieselben SkillPilot-Referenzfälle bestehen:

- Lernsession fortsetzen,
- Lernziel wechseln,
- fällige Lernkarten starten,
- Nutzerantwort bewerten,
- Bild einer Lösung analysieren,
- nach einem Tool-Ergebnis korrekt weiterfragen,
- sichtbare Session-ID und Backend-Zustand konsistent verwenden.

Open Responses standardisiert die technische Nachrichtenschnittstelle. Es ersetzt nicht diese fachlichen Modelltests.

---

## 13. Endgültige Empfehlung

### Zielarchitektur

```text
Portabler serverseitiger MCP Host
        ├── Open Responses zum Model Provider
        ├── Remote MCP zu SkillPilot Core
        ├── serverseitiger Chat-Speicher
        ├── mobile Weboberfläche
        ├── Diktat
        └── Bild-Upload
```

### Kurzfristige Umsetzung

**LibreChat als selbst betriebener Pilot-MCP-Host**:

- geringster zusätzlicher Entwicklungsaufwand,
- BYOK und direkte Providerabrechnung,
- Remote MCP,
- mobile Webnutzung,
- Spracheingabe,
- Bildanalyse,
- geräteübergreifende Chats.

Dabei werden Agent Plugins und MCP Apps noch nicht als zwingende Laufzeitvoraussetzung verwendet.

### Parallelversuch

**Archestra als internes Standardslabor**:

- Open-Responses-nahe Modellgrenze,
- persönliche Provider Keys,
- MCP Apps,
- möglicher späterer Wechselkandidat.

### Fremdbetriebene Optionen

- **Claude:** sehr guter technischer MCP-Kanal für volljährige Testpersonen.
- **ChatGPT:** strategisch wichtigster Distributionskanal, aber nicht als kurzfristig garantierte private mobile Testumgebung.
- **Künftiger Managed Host:** bevorzugte langfristige Betriebsform, sobald direkte Nutzerabrechnung, Open Responses, Remote MCP, MCP Apps, Agent Plugins und mobile Schülernutzung gemeinsam nachweisbar sind.

Die entscheidende Maßnahme ist daher nicht, schon heute den endgültigen Chat-Host auszuwählen. Entscheidend ist, **SkillPilot Core, seinen Lernzustand und das Agent Plugin so sauber zu trennen, dass der Host später ohne Änderung der didaktischen Kernanwendung ersetzt werden kann**.

---

## 14. Offene Korrekturen für v2

Bekannte Abweichungen zwischen dieser Konzeptfassung und dem gewünschten
Zielzustand. Sie sind hier festgehalten, damit sie nicht stillschweigend zur
Architektur werden.

### 14.1 Freitext-Rückmeldung im Verified Recall entfernen

**Abweichung:** `recordVerifiedRecallResult` nimmt einen Freitextparameter
entgegen, der als `lastFeedback` im Lernzustand persistiert wird. Damit speichert
SkillPilot Core eine formulierte Aussage aus der Lernkommunikation und nicht nur
Lernerfolg.

**Zielzustand in v2:** Das Kartenergebnis besteht ausschließlich aus
Kennung und Ausgang — `cardId` und bestanden/nicht bestanden. Die Begründung
gehört in das Gespräch beim Host, nicht in den Kern.

**Umfang:** Entfernen des Parameters aus der Werkzeugsignatur, Entfernen des
Feldes aus dem persistierten Kartenzustand, Migration bestehender Einträge sowie
Nachziehen der abhängigen Prompt- und Vertragsdokumente. Es ist ein
Contract-Major-Schnitt, keine kompatible Erweiterung, und gehört deshalb in eine
neue Vertragslinie.

**Bis dahin:** Die Ausnahme bleibt bestehen, wird aber nicht ausgeweitet.

---

## 15. Verwandte Dokumente

- [Kommunikationsvertrag zwischen ChatClient und SkillPilot-Backend](runtime-workflows/provider-neutral-coach-boundary.md)
  Kanonische, provider-neutrale Verantwortungsgrenze. Sie ist der verbindliche
  Vertrag hinter Abschnitt 4 dieses Konzepts.
- [SkillPilot-Lerncoach: Plugin-, Skill- und MCP-App-Architektur](runtime-workflows/skillpilot-owned-coach-architecture.md)
  Aktuelle Produkt- und Providerarchitektur des ausgelieferten Coaches.
- [OpenAI-Plugin: Versionierung und Lebenszyklus](runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
  Verbindliche Versions- und Lebenszyklusregeln der Plugin-Linie.
- [OAuth-Appbindung und 24h-Lernsession](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
  Identitäts- und Sessionarchitektur hinter Abschnitt 4.4.
- [Verhaltensintegration des MCP-Lerncoaches](runtime-workflows/openai-mcp-coach-behavioral-integration.md)
  Sichtbares Coach-Verhalten und End-to-End-Acceptance hinter Abschnitt 12.
- [OpenAI-MCP-Clientbindung](../security/openai-mcp-client-binding.md)
  Sicherheitsquelle für Clientbindung, Callback, Scopes und Secret-Lebenszyklus.
- [ChatGPT-App „SkillPilot Coach v1“](../deploy/openai-mcp-coach-v1.md)
  Betriebsstand des fremdbetriebenen ChatGPT-Kanals aus Abschnitt 6.1.
- [Claude Coach (pausierte Beta)](../deploy/claude-coach-beta.md)
  Betriebsstand des Claude-Kanals aus Abschnitt 6.2.
