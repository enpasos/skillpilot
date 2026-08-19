# Architekturkonzept: SkillPilot mit austauschbarem MCP Host

**Status:** Strategiekonzept für die langfristige Host- und
Anbieterunabhängigkeit von SkillPilot.

**Geltungsbereich:** Auswahl, Bewertung und Ablösung von AI Chat Applications
beziehungsweise MCP Hosts, die Verantwortungsgrenze zwischen SkillPilot Core,
MCP Host und Model Provider sowie der daraus folgende Stufenplan.

Dieses Dokument legt die Richtung fest, nicht den ausgelieferten Vertrag. Die
verbindlichen Verträge des heutigen Coach-Pfades stehen in den Dokumenten unter
[Verwandte Dokumente](#15-verwandte-dokumente); bei Abweichungen gelten diese.

**Aufbau:** [Teil A](#teil-a-stabile-architektur) enthält die normative
Architektur und ändert sich nur mit einer bewussten Architekturentscheidung.
[Teil B](#teil-b-marktanhang-stand-19-august-2026) bewertet die heute
verfügbaren Hosts und ist ausdrücklich datiert. Ändert ein Anbieter seine Pläne,
Oberflächen oder Altersbedingungen, wird nur Teil B nachgezogen.

---

# Teil A — Stabile Architektur

## 1. Architekturentscheidung

SkillPilot sollte langfristig aus drei unabhängig austauschbaren Bereichen bestehen:

1. **SkillPilot Core** als dauerhaftes, anbieterneutrales Lernsystem,
2. eine **austauschbare AI Chat Application beziehungsweise ein MCP Host**,
3. ein **austauschbarer Model Provider**, der möglichst über eine
   Open-Responses-kompatible Schnittstelle angesprochen wird.

Die zentrale Architekturregel lautet:

> **SkillPilot Core darf weder von einem bestimmten Chat-Host noch von einem bestimmten LLM-Anbieter abhängig sein.**

Gleichrangig daneben steht eine zweite, ebenso verbindliche Regel:

> **SkillPilot Core persistiert pro Lernendem ausschließlich strukturierten,
> schema-validierten Lern- und Steuerungszustand. SkillPilot Core speichert
> keine Chatnachrichten, Formulierungen, Freitextantworten, Schülerlösungen,
> Bilder, Anhänge oder modellseitigen Analyseprotokolle.**

Beide Regeln stützen sich gegenseitig: Ein Kern, der keine Gesprächsinhalte
hält, ist leichter host- und anbieterneutral zu halten, und ein Kern ohne
Hostbindung darf keine hostspezifischen Inhalte übernehmen. Abschnitt 4.2 führt
die Regel gegen die tatsächliche MCP-Oberfläche aus.

Was diese Regel **nicht** behauptet: dass die Lernkommunikation nirgends
gespeichert wird. Sie liegt beim MCP Host und, bei Vision-Nutzung, zusätzlich
beim Model Provider. Abschnitt 6.3 zieht diese Grenze ausdrücklich.

Für die nächsten Entwicklungsschritte ergibt sich daraus folgende Strategie:

- **Kurzfristig:** selbst betriebener Open-Source-MCP-Host für wenige Testnutzer, am sinnvollsten zunächst LibreChat.
- **Parallel:** Archestra als zweiten Pilotkandidaten und Standardslabor für Open-Responses-Routing und MCP Apps prüfen.
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

## 2. Standards und ihre Rollen

### 2.1 Open Responses

**Open Responses** definiert eine offene, providerneutrale Spezifikation für die
Schnittstelle zwischen Agent Runtime und Model Provider beziehungsweise Model
Access Layer. Dazu gehören unter anderem:

- typisierte Eingaben und Ausgaben,
- Messages,
- Tool Calls und Tool-Ergebnisse,
- Streaming-Events,
- Reasoning-Elemente,
- mehrstufige Agent Loops,
- providerabhängige Erweiterungen.

Drei Begriffe werden im weiteren Text streng auseinandergehalten, weil sie
regelmäßig verwechselt werden:

| Begriff | Bedeutung |
| --- | --- |
| **OpenAI Responses API** | proprietäre API von OpenAI |
| **OpenAI-compatible `/responses`** | nachgebildete API-Oberfläche eines Dritten |
| **Open Responses** | die unabhängige, offene Spezifikation |

> **Ein Endpunkt mit dem Namen `/responses` belegt keine
> Open-Responses-Konformität.** Konformität wird anhand der offiziellen
> Acceptance Tests und eines SkillPilot-spezifischen Capability-Profils geprüft,
> nicht aus einem Pfadnamen abgeleitet.

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

- Manifest (`plugin.json`, erforderlich),
- Skills (optional),
- MCP-Server-Konfiguration (optional).

**MCP Apps UI ist keine dritte, separat im Agent Plugin verpackte Komponente.** Die UI wird zur Laufzeit vom in `mcp.json` referenzierten MCP Server bereitgestellt.

Agent Plugins 1.0 ist derzeit noch ein Working Draft. Installation, Verteilung
und Update-Oberflächen bleiben bewusst außerhalb des portablen Standards. Das
Paket sollte deshalb als kanonisches, portables Auslieferungsformat gepflegt
werden, ohne vorauszusetzen, dass jeder Host es bereits vollständig importieren
kann.

Die treffende Formulierung für SkillPilot lautet daher:

> SkillPilot wird als Agent Plugin mit Skill und MCP-Konfiguration ausgeliefert. Der referenzierte SkillPilot-MCP-Server stellt zusätzlich optionale MCP Apps UIs bereit.

#### Das Plugin löst die Authentifizierung nicht mit

Agent Plugins v1 definiert ausdrücklich **keine portable OAuth-Konfiguration und
keine portablen Credential-Referenzen**:

> **Das Agent Plugin beschreibt den SkillPilot-MCP-Endpunkt, transportiert aber
> keine OAuth-Client-Secrets und keine hostübergreifend portablen Zugangsdaten.
> OAuth-Discovery, Benutzerzustimmung, Callback-Konfiguration und
> Token-Speicherung bleiben hostverwaltet. Jeder Host benötigt daher ein dünnes
> Installationsprofil für die SkillPilot-Authentifizierung.**

Das ist wichtig, weil sonst der Eindruck entsteht, ein Plugin-Import erledige die
Einrichtung vollständig portabel. Er erledigt Skill und Serveradresse, nicht die
Identität.

Host-spezifische Erweiterungen dürfen ergänzend vorhanden sein, sollten aber nur dünne Adapter enthalten. Die didaktischen Regeln gehören in den portablen Skill beziehungsweise in SkillPilot Core.

---

## 3. Zielarchitektur

### 3.1 Laufzeitsicht

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
│  └── MCP Client                                                    │
└──────────────────────┬──────────────────────┬──────────────────────┘
                       │                      │
       Open-Responses- │                      │ Remote MCP
       kompatible API  │                      │ Streamable HTTP + OAuth
                       ▼                      ▼
┌────────────────────────────┐   ┌────────────────────────────────────┐
│ Model Access Layer /       │   │ SkillPilot Core                    │
│ AI Gateway (optional)      │   │                                    │
│                            │   │ ┌────────────────────────────────┐ │
│ • Routing und Fallback     │   │ │ MCP Server                     │ │
│ • nutzt die Credentials    │   │ │                                │ │
│   des Lernenden            │   │ │ • Tools                        │ │
└─────────────┬──────────────┘   │ │ • Resources                    │ │
              │                  │ │ • Prompts                      │ │
   provider-native API,          │ │ • optionale MCP Apps UI        │ │
   falls erforderlich            │ └───────────────┬────────────────┘ │
              ▼                  │                 │                  │
┌────────────────────────────┐   │ ┌───────────────▼────────────────┐ │
│ Model Provider             │   │ │ Didactic Services              │ │
│                            │   │ │                                │ │
│ • OpenAI, Anthropic        │   │ │ • Lernzielsteuerung            │ │
│ • Google, xAI              │   │ │ • Lernkarten                   │ │
│ • Open-Model-Hoster        │   │ │ • Aufgaben und Bewertungsraster│ │
│                            │   │ │ • Lernstandsmodell             │ │
│ Providerkonto des          │   │ │ • Curriculare Ontologie        │ │
│ Lernenden / der Eltern     │   │ └───────────────┬────────────────┘ │
│ trägt die Kosten           │   │                 │                  │
│                            │   │ ┌───────────────▼────────────────┐ │
│ Bilder zur Vision-Analyse  │   │ │ Learning State Database        │ │
│ landen HIER, nicht im      │   │ │                                │ │
│ SkillPilot Core            │   │ │ strukturierter Lern- und       │ │
└────────────────────────────┘   │ │ Steuerungszustand              │ │
                                 │ └────────────────────────────────┘ │
                                 └────────────────────────────────────┘
```

Der **Model Access Layer** ist bewusst als eigene, optionale Komponente
gezeichnet. Die Agent Runtime spricht entweder direkt einen
Open-Responses-kompatiblen Provider an oder geht über einen Router, der auf
provider-native APIs übersetzt:

```text
Agent Runtime
    ├── direkt zu einem Open-Responses-kompatiblen Provider
    └── oder über Model Access Layer / AI Gateway
```

Die Gateway-Instanz ist dabei **nicht** benutzereigen. Benutzereigen sind das
Providerkonto und die Credentials; die Instanz betreibt der MCP-Host-Betreiber
oder ein externer Gateway-Anbieter. Abschnitt 7 zieht daraus die
Abrechnungsregel.

### 3.2 Installationssicht: das Agent Plugin

Das Agent Plugin ist keine weitere Laufzeitverbindung, sondern ein
**Installations- und Konfigurationsartefakt**. Es taucht deshalb nicht im
Laufzeitdiagramm auf, entscheidet aber, wie Skill und Serveradresse überhaupt in
den Host gelangen:

```text
SkillPilot Agent Plugin
├── plugin.json
├── skills/skillpilot-coach/SKILL.md
└── mcp.json
        │
        │ Installation / Import
        ▼
AI Chat Application / MCP Host
├── Agent Runtime lädt den Skill
├── MCP Client erhält die Serverkonfiguration
└── OAuth-Profil hostseitig    ← nicht im Plugin enthalten
        │
        │ Remote MCP + OAuth
        ▼
SkillPilot Core
```

Die letzte Zeile vor der Verbindung ist der Punkt aus Abschnitt 2.4: Das Paket
bringt Skill und Endpunkt mit, die Authentifizierung bleibt hostverwaltet.

---

## 4. Verantwortungs- und Zustandsgrenzen

Die Architektur kennt **drei getrennte Datenverarbeitungsbereiche**. Keiner davon
verschwindet dadurch, dass ein anderer nichts speichert:

| Bereich | Hält | Verantwortlich |
| --- | --- | --- |
| MCP Host | Chatverlauf, Nachrichten, Anhänge, Sitzungen, Credentials | Hostbetreiber (im Pilot: enpasos) |
| Model Provider | übermittelte Prompts und Bilddaten, je nach Anbieterbedingungen | Modellanbieter, Vertrag mit dem Nutzer |
| SkillPilot Core | strukturierter Lern- und Steuerungszustand | enpasos |

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

SkillPilot Core persistiert **ausschließlich strukturierten, schema-validierten
Lern- und Steuerungszustand**:

- Zuordnung zum SkillPilot-Lernenden,
- gewähltes Curriculum und Personalisierung,
- ausgewählter Lernzielbereich (Scope) und aktives Lernziel,
- Mastery je Lernziel als Zahlenwert,
- Lernkartenplanung und fällige Wiederholungen,
- Verified-Recall-Ergebnis je Karte als bestanden oder nicht bestanden.

Die Liste enthält bewusst beides: Ergebniswerte wie Mastery und
**Steuerungszustand** wie Curriculum, Scope, aktives Lernziel und fällige
Wiederholungen. Letzteres ist kein Lernerfolg im engeren Sinn, aber es ist
strukturiert, schema-validiert und für die Fortsetzung des Lernens nötig.

Ebenso wichtig ist die Negativliste. SkillPilot Core speichert **nicht**:

- Chatverläufe, Nachrichten oder Formulierungen der lernenden Person,
- Fotos, Scans, Dateianhänge oder sonstige Binärinhalte,
- eingereichte Schülerlösungen oder deren Korrekturen,
- Freitextantworten zu Aufgaben,
- Analyse- oder Bewertungsprotokolle des Modells,
- OCR-Text, Bild-URLs oder sonstige Verweise auf Bildmaterial.

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
als [Korrektur für v2](#12-offene-korrekturen-fur-v2) vorgemerkt. Bis dahin gilt
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
```

Ein Checkpoint darf ausdrücklich keine Nachrichtenauszüge, keine Lösungstexte und
keine Verweise auf Bilddateien enthalten. Geht der Chatverlauf verloren, ist der
Lern- und Steuerungszustand vollständig erhalten und die Lernkommunikation
bewusst nicht.

**Eine bewusst abgelehnte Ergänzung:** Eine frühere Fassung führte
`nextRecommendedAction` als Checkpoint-Feld. Dafür gibt es in der beschriebenen
Werkzeugoberfläche keinen Schreibvertrag. Die nächste empfohlene Aktion wird
deshalb **aus dem gespeicherten Zustand abgeleitet und nicht persistiert**. Sie
darf nicht als neuer, frei beschreibbarer Zustand in die Architektur rutschen;
soll sie später persistiert werden, ist das ein eigener, strukturierter
v2-Vertrag mit fester Wertemenge.

### 4.4 Identität und sichtbare Kennungen

Die Identität sollte über SkillPilot-OAuth hergestellt werden.

Der MCP Host erhält ein Zugriffstoken, das SkillPilot intern dem Lernenden zuordnet. Die vom Host gemeldete E-Mail-Adresse oder der Anzeigename darf nicht als alleiniger Identitätsnachweis dienen.

Beim Thema sichtbare Kennungen sind zwei Dinge zu unterscheiden, die sich sonst
zu widersprechen scheinen — die Abnahmetests verlangen eine sichtbare Session-ID,
diese Regel verbietet sichtbare IDs:

| | |
| --- | --- |
| **sichtbar erlaubt** | eine zufällige, opake `learningSessionId` |
| **nicht sichtbar** | interne Lernenden-ID, Konto-ID, Datenbank-ID oder jede daraus ableitbare Kennung |

Die Session-ID darf also im Chat und im Modellkontext erscheinen, weil sie
nichts über die lernende Person verrät und mit der Session endet.

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
├── Open-Responses-kompatibler Client
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
- eigene Verantwortung für Chatdaten, Anhänge, Backups und Löschung,
- mobile Qualität hängt vom gewählten Open-Source-Host ab,
- die Standards werden von aktuellen Hosts noch nicht überall vollständig unterstützt.

Dieser Weg ist die **Zielarchitektur** und zugleich die Grundlage für den kurzfristigen Pilotbetrieb.

---

## 6. Spracheingabe und Bildanalyse

### 6.1 Spracheingabe

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

### 6.2 Flüchtige Bildanalyse

Für die Analyse einer fotografierten Aufgabenlösung sieht der tatsächliche
Datenfluss so aus:

```text
Kamera / Bild-Upload
        │
        ▼
MCP Host
        │
        │ Bild beziehungsweise Bilddaten
        ▼
Model Provider  (vision-fähiges Modell)
        │
        │ Analyseergebnis im Chat
        ▼
MCP Host
        │
        │ setMastery(goalId, wert)
        ▼
SkillPilot Core
```

Wichtig ist, was dieser Fluss **nicht** behauptet:

> **Bei einem remote betriebenen Vision-Modell übermittelt der MCP Host das Bild
> an den ausgewählten Model Provider. Das Bild wird weder an den
> SkillPilot-MCP-Server übertragen noch in SkillPilot Core gespeichert.
> SkillPilot Core erhält ausschließlich schema-validierte Werte des Lern- und
> Steuerungszustands.**

Die Grenze verläuft also nicht zwischen Gerät und Host, sondern zwischen
**Host plus Model Provider** auf der einen und **SkillPilot Core** auf der
anderen Seite. Nur ein lokal betriebenes Vision-Modell würde das Bild im
Verantwortungsbereich des Hosts halten; das ist der Ausnahme-, nicht der
Regelfall.

Was zurückgeschrieben wird, ist genau ein Mastery-Wert zu einem Lernziel:

```json
{
  "tool": "setMastery",
  "goalId": "<exakte Lernziel-ID>",
  "mastery": 0.6
}
```

Die inhaltliche Beobachtung — welche Aufgabe es war, welchen Fehler die lernende
Person gemacht hat, wie sicher das Modell war — bleibt im Gespräch bei Host und
Model Provider. Sie wird nicht als Analyseprotokoll an SkillPilot übergeben. Ein
Tool, das ein Feld wie `observedAnswer` oder `suspectedError` annähme, gibt es
nicht und soll es auch nicht geben: Es würde die Lernkommunikation in den Kern
ziehen.

### 6.3 Keine dauerhaft gespeicherte Schülerlösung in SkillPilot Core

Eine fotografierte oder ausformulierte Schülerlösung wird **nicht in SkillPilot
Core** abgelegt. Weder als Bild noch als Text, weder direkt im Tool Call noch
über einen eigenen Uploadweg.

Dauerhaft bleibt in SkillPilot Core genau eine Aussage übrig: dass dieses
Lernziel zu diesem Grad beherrscht wird. Nicht, woran es gezeigt wurde.

Das ist eine bewusste Entscheidung mit einem bewussten Preis:

- Eine Lösung kann über SkillPilot später nicht erneut aufgerufen oder nachkorrigiert werden.
- Es entsteht kein Portfolio und kein belegbarer Lernnachweis im Sinne
  archivierter Schülerarbeit.
- Ein Wechsel des Chat-Hosts nimmt die frühere Lernkommunikation mit.

#### Die Verantwortung verschwindet nicht, sie wandert

Der naheliegende Fehlschluss wäre, dass mit dem Verzicht auf Speicherung im Kern
auch die Aufbewahrungs- und Löschfragen entfallen. Für SkillPilot Core stimmt
das; für das Gesamtsystem nicht:

> **Für SkillPilot Core entfallen Speicherung, Archivierung und Migration von
> Schülerartefakten. Der MCP Host und der Model Provider bleiben jedoch
> eigenständige Datenverarbeitungsbereiche. Betreibt enpasos den MCP Host selbst,
> benötigt dieser eine eigene Regelung für Zugriff, Aufbewahrung, Löschung,
> Backups und den Umgang mit Chat-Anhängen. SkillPilot Core übernimmt keine
> Portabilitäts- oder Archivierungsgarantie für die beim Host gespeicherte
> Lernkommunikation.**

Im Pilot betreibt enpasos den Host selbst. Die Fragen nach Aufbewahrungsfristen,
Löschung, Backup und Einsicht sind dort also real zu beantworten — Abschnitt 8.2
führt das aus. Was der Kern gewinnt, ist Schmalheit und Austauschbarkeit, nicht
Verantwortungsfreiheit für das Gesamtsystem.

Will eine lernende Person eine Lösung behalten, geschieht das außerhalb von
SkillPilot Core — in der Fotobibliothek des Geräts oder im Anhangspeicher des
jeweiligen Hosts.

Tool Calls transportieren entsprechend keine großen Bilder als Base64-Daten. Das
ist hier keine Optimierung mehr, sondern folgt unmittelbar aus der Regel.

Sollte später ein echter, archivierter Lernnachweis fachlich gefordert werden,
ist das eine Änderung dieser Architekturregel und keine bloße Erweiterung. Sie
wäre gesondert zu entscheiden und zu dokumentieren.

---

## 7. Abrechnungsmodell und Credential-Eigentum

Die Grundregel für alle Betriebswege:

> **Providerkonto und Modell-Credentials gehören dem Lernenden beziehungsweise
> der erziehungsberechtigten Person. Der MCP Host oder dessen Model Access Layer
> darf die Credentials im Auftrag des Nutzers verwenden. Ein zentraler
> Betreiber-Key mit anschließender Weiterberechnung an SkillPilot-Nutzer ist
> ausgeschlossen.**

### 7.1 Fremdbetriebener Host

Bei ChatGPT oder Claude zahlt der Nutzer das jeweilige Consumer-Abonnement direkt an den Plattformanbieter.

Das erfüllt die direkte Abrechnung, führt aber zu einer Bindung an dessen:

- Agent Runtime,
- Modellangebot,
- Kontoregeln,
- Altersbedingungen,
- Plugin-Unterstützung.

### 7.2 Selbst betriebener Host mit BYOK

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
        (verwendet den Key im Auftrag,
         besitzt ihn nicht)
```

Der MCP Host führt die Anfrage aus, aber der Provider rechnet über das Konto des Nutzers ab.

Wichtig ist die Trennung von Consumer- und API-Abonnements:

- Ein ChatGPT Plus- oder Pro-Abonnement enthält nicht automatisch OpenAI-API-Guthaben.
- Ein Claude Pro- oder Max-Abonnement ist ebenfalls kein Claude-API-Zugang.

Für minderjährige Lernende sollte das Providerkonto in der Regel durch Eltern beziehungsweise Erziehungsberechtigte angelegt und mit einer festen Ausgabengrenze versehen werden.

### 7.3 Ausschlusskriterium

Nicht geeignet ist ein Host, der:

- nur einen zentralen API Key des SkillPilot-Betreibers verwendet,
- die Tokenkosten anschließend an SkillPilot berechnet,
- oder keine persönliche Providerabrechnung zulässt.

Das würde das von SkillPilot zu vermeidende Tokenkosten- und Abrechnungsrisiko wieder auf SkillPilot verlagern.

---

## 8. Pilotarchitektur

### 8.1 Aufbau

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
   ├── User Provider Keys           (strukturierter Lern-
   ├── Upload-Volume                 und Steuerungszustand)
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
- keine Kubernetes-Infrastruktur,
- zunächst kein horizontaler Betrieb,
- kein zusätzlicher Redis-Cluster.

SkillPilot Core bleibt davon getrennt und wird lediglich als Remote-MCP-Server angebunden.

### 8.2 Persistenz, Sicherung und Löschung

„Tägliche Datenbanksicherung" reicht als Konzept nicht, sobald Bilder und
Anhänge in einem eigenen Volume liegen. Der Pilot muss deshalb für jeden dieser
Bestände ausdrücklich benennen, wo er liegt und wer ihn löscht:

| Bestand | Zu entscheiden |
| --- | --- |
| MongoDB (Chats, Nachrichten, Konten) | Sicherungsintervall, Aufbewahrung, Wiederherstellungstest |
| Upload-Volume (Bilder, Anhänge) | gesichert oder bewusst nicht gesichert; Aufbewahrungs- und Löschfrist |
| Verschlüsselungsschlüssel für Provider-Credentials und OAuth-Tokens | getrennte Sicherung, Rotationsweg |
| Konfiguration und Plugin-Paket | versioniert, reproduzierbar wiederherstellbar |
| Provider-seitige Verarbeitung von Bilddaten | welcher Provider, welche Aufbewahrungsbedingungen |

Zusätzlich ist festzulegen:

- **Löschverhalten:** Was passiert mit Anhängen und Provider-Credentials, wenn
  ein Chat oder ein Benutzerkonto gelöscht wird?
- **Zugriff:** Wer im Betreiberteam kann auf Chatinhalte Minderjähriger sehen,
  und unter welchen Bedingungen?

Das muss kein Compliance-Kapitel werden. Es muss nur klar sein, **welche Daten wo
liegen und wer sie löscht**.

### 8.3 Pilotkonfiguration

1. **Version Pinning:** LibreChat-Version beziehungsweise Commit, Agent-Plugin-Version und
   SkillPilot-Plugin-Version werden festgeschrieben. „LibreChat aktuell" ist bei
   experimentellen Funktionen zu unbestimmt.
2. Jeder Tester erhält ein Konto im selbst betriebenen Chat-Host.
3. Jeder Tester beziehungsweise Elternteil hinterlegt einen eigenen Provider-API-Key.
4. Es werden nur Modelle freigeschaltet, die:
   - Bilder verarbeiten,
   - Tools zuverlässig aufrufen,
   - Streaming unterstützen,
   - deutschsprachige Antworten in ausreichender Qualität erzeugen.
5. Der konkrete Vision-Provider und dessen Datenpfad werden protokolliert.
6. SkillPilot wird nativ als Remote-MCP-Server konfiguriert.
7. Der SkillPilot Skill wird als Agent- beziehungsweise Skill-Anweisung eingebunden.
8. MCP Apps werden nur zusätzlich verwendet, sobald der Host sie stabil unterstützt.
9. Die kritischen Lernabläufe bleiben textbasiert nutzbar.

---

## 9. Stufenplan

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
- dauerhaftem Lern- und Steuerungszustand.

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

### Phase 3: Zweiter Kandidat Archestra

Parallel wird praktisch geprüft:

- `/responses`-Verhalten gegen die offiziellen Open-Responses-Acceptance-Tests,
- persönliche Provider Keys,
- MCP Apps,
- mobile Browserqualität,
- Kameraaufnahme und Diktierfunktion,
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

## 10. Abnahmetests für jeden MCP Host

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
- anschließend ein SkillPilot-Tool aufrufen,
- Bild und Text gemeinsam in einem Turn verarbeiten,
- **dokumentieren, an welchen Model Provider das Bild übertragen wird und welche
  Speicherungs- beziehungsweise Aufbewahrungsbedingungen dort gelten.**

### MCP-Negativtest

Der zentrale Datenschutznachweis. Zu prüfen ist nicht, ob das Bild den Host
verlässt — das tut es bei einem remote betriebenen Vision-Modell —, sondern was
bei SkillPilot ankommt:

> **Nachweisen, dass weder Bilddaten noch OCR-Text, Lösungstext, Bild-URL oder
> modellseitiges Analyseprotokoll in MCP-Toolargumenten, SkillPilot-Logs,
> SkillPilot-Traces oder der Learning-State-Datenbank erscheinen.**

### Credential-Negativtest

- Provider-API-Schlüssel und MCP-OAuth-Tokens dürfen weder in
  SkillPilot-Toolargumenten noch in SkillPilot-Logs erscheinen.
- API-Schlüssel erscheinen nicht in Chatnachrichten.

### MCP und Identität

- OAuth-Anmeldung auf dem Smartphone abschließen,
- Zugriffstoken erneuern,
- unterbrochene MCP-Verbindung wiederherstellen,
- Tool Call eindeutig einem Lernenden zuordnen,
- keine interne SkillPilot-ID im Modellkontext anzeigen; eine opake
  `learningSessionId` ist dabei ausdrücklich erlaubt (Abschnitt 4.4).

### Idempotenz

- Wiederholte beziehungsweise nach Verbindungsabbrüchen erneut ausgeführte
  `setMastery`- oder Recall-Schreibaufrufe dürfen nicht zu widersprüchlichen
  Zuständen führen.

### Löschtest

- Das Löschen eines Chats oder eines Kontos muss das in Abschnitt 8.2 definierte
  Verhalten für Anhänge und Provider-Credentials auslösen.

### UI

- vollständiger Ablauf ohne MCP Apps möglich,
- strukturierte Tool-Ergebnisse korrekt anzeigen,
- MCP App auf unterstützten Hosts in einer Sandbox laden,
- UI-Aktion darf nur erlaubte Tools aufrufen.

### Abrechnung

- jeder Nutzer verwendet ein eigenes Providerkonto,
- kein zentraler SkillPilot-API-Key,
- Modellanbieter rechnet direkt mit Nutzer beziehungsweise Eltern ab,
- Nutzer kann Ausgaben begrenzen.

### Open-Responses-Konformität

- Konformität wird anhand der offiziellen Acceptance Tests und eines
  SkillPilot-spezifischen Capability-Profils geprüft.
- Ein Endpunktname `/responses` gilt ausdrücklich nicht als Nachweis.

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

## 11. Endgültige Empfehlung

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

**Archestra als zweiter Pilotkandidat und Standardslabor**:

- Open-Responses-nahe Modellgrenze,
- persönliche Provider Keys,
- MCP Apps,
- möglicher späterer Wechselkandidat.

### Fremdbetriebene Optionen

- **Claude:** sehr guter technischer MCP-Kanal für volljährige Testpersonen.
- **ChatGPT:** strategisch wichtigster Distributionskanal, aber nicht als kurzfristig garantierte private mobile Testumgebung.
- **Künftiger Managed Host:** bevorzugte langfristige Betriebsform, sobald direkte Nutzerabrechnung, Open Responses, Remote MCP, MCP Apps, Agent Plugins und mobile Schülernutzung gemeinsam nachweisbar sind.

Die entscheidende Maßnahme ist daher nicht, schon heute den endgültigen Chat-Host auszuwählen. Entscheidend ist, **SkillPilot Core, seinen Lern- und Steuerungszustand und das Agent Plugin so sauber zu trennen, dass der Host später ohne Änderung der didaktischen Kernanwendung ersetzt werden kann**.

---

## 12. Offene Korrekturen für v2

Bekannte Abweichungen zwischen dieser Konzeptfassung und dem gewünschten
Zielzustand. Sie sind hier festgehalten, damit sie nicht stillschweigend zur
Architektur werden.

### 12.1 Freitext-Rückmeldung im Verified Recall entfernen

**Abweichung:** `recordVerifiedRecallResult` nimmt einen Freitextparameter
entgegen, der als `lastFeedback` im Lernzustand persistiert wird. Damit speichert
SkillPilot Core eine formulierte Aussage aus der Lernkommunikation und nicht nur
strukturierten Lern- und Steuerungszustand.

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

# Teil B — Marktanhang (Stand 19. August 2026)

Dieser Teil bewertet die heute verfügbaren Hosts. Er ist **datiert und
veränderlich**. Ändert ein Anbieter Pläne, Oberflächen, Altersbedingungen oder
MCP-Unterstützung, wird nur dieser Teil nachgezogen — Teil A bleibt unberührt.

Die Angaben beruhen auf den Anbieterdokumentationen zum genannten Stand. Vor
einer Freigabeentscheidung sind sie erneut zu prüfen; die Abnahmetests aus
Abschnitt 10 ersetzen sie nicht, sondern setzen sie voraus.

## 13. Host-Optionen

### 13.1 ChatGPT

#### Was funktioniert

ChatGPT bietet:

- vollständig gehostete Chat- und Agent-Laufzeit,
- geräteübergreifende Chatverläufe,
- mobile und Weboberflächen für den allgemeinen Chat,
- Spracheingabe und Bildverarbeitung,
- direkte Abrechnung über das ChatGPT-Konto,
- einen Plugin-Veröffentlichungs- und Verzeichnisprozess.

#### Aktuelle Einschränkungen

Die Plugin Directory ist derzeit für ChatGPT Web und Desktop beschrieben. Ob ein
Plugin installiert oder aufgerufen werden kann, hängt von Plan, Workspace, Rolle,
Oberfläche und Region ab.

Custom MCP Apps im Developer Mode sind ausdrücklich **web-only**. Vollständiges
MCP mit Schreibaktionen ist gegenwärtig Business sowie Enterprise/Edu
vorbehalten, während Pro nur einen eingeschränkteren Developer-Mode-Pfad besitzt.

Daraus folgt eine wichtige Präzisierung gegenüber einer pauschalen Zeile
„mobile Nutzung: ja":

```text
Mobile Chat-Nutzung:                        ja
SkillPilot-MCP-/Plugin-Nutzung mobil:       derzeit nicht belastbar nachgewiesen
Custom MCP Apps im Developer Mode mobil:    nein
```

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

Für Minderjährige gilt bei ChatGPT ein Mindestalter von 13 Jahren; von 13 bis 18 ist die Zustimmung eines Elternteils oder Erziehungsberechtigten erforderlich.

**Bewertung:** strategisch wichtig, aber nicht als alleinige Pilotlösung einplanen.

---

### 13.2 Claude

#### Was funktioniert

Claude unterstützt Remote MCP Connectors und stellt sie über Web-, Desktop- und
mobile Oberflächen bereit. Interaktive Connectors beziehungsweise MCP Apps werden
auch unter iOS und Android unterstützt.

Claude bietet außerdem:

- mobile Diktierfunktion, dokumentiert auch für Deutsch,
- Voice Mode,
- Bild- und Dateiupload,
- vom Nutzer bezahlte Claude-Abonnements.

#### Aktuelle Einschränkungen

- Für den **Claude-Consumerdienst** gilt ein Mindestalter von 18 Jahren.
- Der Nutzer ist an die Claude-Agent-Runtime und Anthropic-Modelle gebunden.
- Ein Import portabler Agent-Plugins-v1-Pakete ist nicht als belastbarer allgemeiner Produktweg verifiziert.
- Ein Claude-Abonnement ist nicht automatisch ein Claude-API-Guthaben; Consumer- und API-Abrechnung sind getrennt.

#### Zwei Rollen sauber trennen

Die 18-Jahre-Grenze betrifft den Consumerdienst und darf nicht zu „Anthropic ist
als Modellanbieter für Schüler ausgeschlossen" verallgemeinert werden:

```text
Claude als MCP Host:                für minderjährige Schüler nicht geeignet
Anthropic als Model Provider
hinter eigenem Host:                grundsätzlich möglich, aber nur nach Prüfung
                                    und Umsetzung der Minderjährigenschutz-
                                    anforderungen des Anbieters
```

Für Betriebsweg B ist Anthropic damit ein zulässiger Modellanbieter, auch wenn
Claude als Host für die Zielgruppe ausscheidet.

#### Eignung

**Geeignet als:**

- technisch sehr guter gehosteter Remote-MCP-Test,
- Test von MCP Apps auf mobilen Endgeräten,
- Pilot mit volljährigen Testpersonen,
- Referenz für die gewünschte spätere Benutzererfahrung.

**Nicht geeignet als:**

- reguläre Host-Plattform für minderjährige Schülerinnen und Schüler,
- anbieterneutrale Agent Runtime.

**Bewertung:** aktuell die technisch überzeugendste gehostete MCP-Variante, aber wegen der Altersgrenze nicht die allgemeine Schülerlösung.

---

### 13.3 LibreChat

#### Was funktioniert

LibreChat ist eine selbst hostbare Open-Source-Chatplattform. Für einen kleinen Pilotbetrieb kann sie per Docker Compose auf einem einzelnen Server betrieben werden. Sie besitzt einen serverseitigen Chat- und Sitzungsspeicher und unterstützt wiederaufnehmbare Streams und geräteübergreifende Chatnutzung.

Für die SkillPilot-Anforderungen sind besonders relevant:

- browserbasierte Spracheingabe,
- Bild- und Dateiupload für Vision-Modelle,
- nutzerbereitgestellte Modell-API-Schlüssel,
- Remote MCP einschließlich OAuth Authorization Code mit PKCE und Refresh Tokens,
- mehrere Modellanbieter.

LibreChat kann damit die Modellkosten über den persönlichen API-Zugang des Lernenden beziehungsweise der Eltern direkt beim Modellanbieter abrechnen.

Für seinen Standard-Bildupload dokumentiert LibreChat ausdrücklich, dass Bilder
für die native Vision-Verarbeitung **direkt an den Model Provider gesendet**
werden. Das ist die Belegstelle für den Datenfluss aus Abschnitt 6.2.

Für eine einzelne Instanz ist der Verzicht auf Redis vertretbar; LibreChat sieht
dafür einen In-Memory-Modus vor.

#### Stand der Standards

Agent Plugins 1.0 wurden im August 2026 als **experimentelle** Funktion in LibreChat integriert. Das System kann portable Pakete mit `plugin.json`, Skills und `mcp.json` aus einem Betreiberverzeichnis laden.

Die offizielle MCP-Apps-Unterstützung liegt weiterhin als **offener Draft Pull Request** vor und ist nicht Bestandteil einer belastbaren regulären Version.

LibreChat besitzt außerdem einen Responses-kompatiblen Zugang zu seinen eigenen Agents. Das ist jedoch nicht dasselbe wie eine nachweislich durchgängige Open-Responses-Schnittstelle zwischen LibreChat und allen dahinterliegenden Modellanbietern.

Weil beide Funktionen experimentell beziehungsweise offen sind, ist eine
**feste Version beziehungsweise ein bestimmter Commit** Pflicht (Abschnitt 8.3).

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

1. SkillPilot als normalen Remote-MCP-Server in LibreChat konfigurieren.
2. Skill-Anweisungen über den vorhandenen Skill- beziehungsweise Agent-Mechanismus einbinden.
3. Das kanonische Agent-Plugin-Paket parallel weiterpflegen.
4. MCP Apps nicht zur Voraussetzung machen.
5. Jede SkillPilot-Funktion zunächst vollständig über Text und strukturierte Tool-Ergebnisse nutzbar machen.

**Bewertung:** beste kurzfristige Hauptlösung.

---

### 13.4 Archestra

#### Was funktioniert

Archestra ist eine selbst hostbare Open-Source-Plattform. Dokumentiert sind
inzwischen:

- eingebauter serverseitiger Chat,
- Bild-, PDF- und Dateianhänge,
- persönliche Provider-Keys,
- ein OpenAI-kompatibler `/responses`-Model-Router über mehrere Provider,
- nutzergebundener OAuth-Zugriff auf die jeweils persönlichen Provider-Keys,
- Darstellung von MCP Apps externer MCP Server.

Damit kommt Archestra der langfristigen Zielarchitektur näher als viele klassische Chat-UIs:

```text
Agent Runtime
    ├── Responses-basierter Model Router
    ├── persönliche Provider Keys
    ├── MCP Client
    └── MCP Apps Host
```

#### Aktuelle Einschränkungen

- Der Model Router ist als **OpenAI-kompatible** Responses API dokumentiert, der Providerformate übersetzt. Das ist technisch attraktiv, aber kein Nachweis vollständiger Open-Responses-Konformität; diese ist gegen die offiziellen Acceptance Tests zu prüfen.
- Eine belastbare Agent-Plugins-v1-Unterstützung ist nicht verifiziert.
- Die Plattform ist stärker auf Unternehmens- und Plattformbetrieb ausgerichtet und komplexer als LibreChat.
- Das Lizenzmodell ist Open Core; der freie Basisteil steht unter AGPL, bestimmte Enterprise-Funktionen sind separat lizenziert. Für Organisationen unter 30 Nutzern besteht derzeit eine besondere Nutzungsmöglichkeit für Enterprise-Funktionen.

#### Was noch praktisch zu prüfen ist

```text
Datei- und Bildanhänge:   dokumentiert
mobile Kameraaufnahme:    praktisch zu testen
Diktierfunktion:          nicht ausreichend belegt, praktisch zu testen
mobile Gesamtqualität:    praktisch zu testen
Open-Responses-Konformität: gegen Acceptance Tests zu prüfen
Betriebsaufwand:          praktisch zu ermitteln
```

**Bewertung:** nicht nur ein abstraktes Standardslabor, sondern ein **ernsthafter
zweiter Pilotkandidat**. LibreChat bleibt für den unmittelbaren Schülerpilot
wahrscheinlich risikoärmer, weil Sprach- und mobile Bedienung dort klarer
dokumentiert sind.

---

### 13.5 Open WebUI

Open WebUI besitzt eine breite Modellanbieterunterstützung und experimentelle Responses-API-Funktionen. Eine native, vollständige MCP-Apps-Unterstützung ist jedoch derzeit nicht der stabile Kernweg; dafür wären zusätzliche Bridges oder Erweiterungen nötig.

Damit würde gerade in dem Bereich eigener Integrationscode entstehen, den SkillPilot vermeiden möchte.

**Bewertung:** für dieses Vorhaben derzeit nicht gegenüber LibreChat oder Archestra bevorzugen.

---

## 14. Vergleichsmatrix

Die Matrix fragt bewusst nicht nach allgemeinen Produktfähigkeiten, sondern
danach, ob etwas **im SkillPilot-MCP-Workflow** funktioniert. Deshalb sind
„Mobile Chat UI" und „SkillPilot/MCP mobil" getrennte Zeilen: Eine mobile App zu
haben bedeutet nicht, dass SkillPilot darin mobil nutzbar ist.

| Kriterium | ChatGPT | Claude | LibreChat | Archestra | Künftiger Managed Host |
| --- | --- | --- | --- | --- | --- |
| Betrieb der Runtime | OpenAI | Anthropic | selbst/fremd hostbar | selbst/fremd hostbar | fremder Betreiber |
| Mobile Chat UI | ja | ja | mobile Weboberfläche | zu testen | gefordert |
| SkillPilot/MCP mobil | nicht belastbar nachgewiesen | ja | ja | zu testen | gefordert |
| Diktat im MCP-Chat | Live-Modus eingeschränkt | ja | ja | nicht belegt, zu testen | gefordert |
| Kamera/Bild im MCP-Chat | ja | ja | ja | Anhänge dokumentiert, Kamera zu testen | gefordert |
| Geräteübergreifender Chat | ja | ja | ja | dokumentiert | gefordert |
| Persönliche Provider-Credentials | nein, Plattformkonto | nein, Plattformkonto | BYOK | persönliche Provider Keys | gefordert |
| Direkte Abrechnung | über ChatGPT-Abo | über Claude-Abo | Provider ↔ Nutzer | Provider ↔ Nutzer | gefordert |
| Open Responses | nein, intern nicht erzwingbar | nein | nur teilweise | OpenAI-kompatibel, Konformität zu prüfen | gefordert |
| Remote MCP + OAuth | ja, planabhängig | ja | ja, PKCE + Refresh | ja | gefordert |
| MCP Apps | Custom Apps web-only | ja, auch mobil | Draft PR, nicht stabil | ja | gefordert, Text-Fallback bleibt Pflicht |
| Agent Plugins v1 | OpenAI-Produktweg, nicht portabel | nicht verifiziert | experimentell | nicht verifiziert | gefordert |
| Altersgruppe | ab 13, unter 18 mit Zustimmung | Consumer ab 18 | vom Betreiber bestimmt | vom Betreiber bestimmt | für Zielgruppe zulässig |
| **Rolle** | strategischer Vertriebskanal | sehr gut für volljährige Tester | **unmittelbarer Pilot** | **zweiter Pilotkandidat** | langfristiges Ziel |

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
  Sichtbares Coach-Verhalten und End-to-End-Acceptance hinter Abschnitt 10.
- [OpenAI-MCP-Clientbindung](../security/openai-mcp-client-binding.md)
  Sicherheitsquelle für Clientbindung, Callback, Scopes und Secret-Lebenszyklus.
- [ChatGPT-App „SkillPilot Coach v1“](../deploy/openai-mcp-coach-v1.md)
  Betriebsstand des fremdbetriebenen ChatGPT-Kanals aus Abschnitt 13.1.
- [Claude Coach (pausierte Beta)](../deploy/claude-coach-beta.md)
  Betriebsstand des Claude-Kanals aus Abschnitt 13.2.
