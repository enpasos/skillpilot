## Architekturkonzept: SkillPilot mit austauschbarem MCP Host {#sec:portable-agent-runtime}

:::note{title="Geltungsbereich und Aufbau"}
Strategiekonzept für die langfristige Host- und Anbieterunabhängigkeit von SkillPilot. Die verbindlichen Laufzeitverträge des ausgelieferten Coach-Pfades stehen in @ref{sec:provider-neutral-coach-boundary} bis @ref{sec:openai-plugin-versioning}; bei Abweichungen gelten jene Verträge. **Teil A** definiert die stabile, normative Zielarchitektur; **Teil B** dokumentiert den datierten Marktanhang (Stand 19. August 2026, ergänzt um die nachfolgenden Repo-Entscheidungen aus @ref{sec:openai-plugin-versioning}).
:::

### Teil A — Stabile Architektur: Drei-Ebenen-Trennung und Kerngrenzen {#sec:portable-host-part-a anchors="teil-a-stabile-architektur"}

SkillPilot besteht langfristig aus drei unabhängig austauschbaren Bereichen:

1. **SkillPilot Core** als dauerhaftes, anbieterneutrales Lernsystem,
2. einer **austauschbaren AI Chat Application bzw. einem MCP Host**,
3. einem **austauschbaren Model Provider** (bevorzugt über eine Open-Responses-kompatible Schnittstelle).

:::principle{title="Zwei gleichrangige Architekturregeln"}
1. **SkillPilot Core darf weder von einem bestimmten Chat-Host noch von einem bestimmten LLM-Anbieter abhängig sein.**
2. **SkillPilot Core persistiert pro Lernendem ausschließlich strukturierten, schema-validierten Lern- und Steuerungszustand** — keinerlei Chatnachrichten, Formulierungen, Freitextantworten, Schülerlösungen, Bilder, Anhänge oder modellseitige Analyseprotokolle.
:::

Die Lernkommunikation verschwindet dadurch nicht: Sie liegt beim MCP Host und (bei Vision-Nutzung) beim gewählten Model Provider. Weil heute kein einzelner Dienst alle Anforderungen gleichzeitig erfüllt (gehostete Agent Runtime, geräteübergreifende Chats, direkte Nutzer-Provider-Abrechnung, Open Responses, Remote MCP, Skills, MCP Apps UI, Agent Plugins, Mobile, Sprache, Vision und Minderjährigeneignung), verfolgt SkillPilot bewusst zwei Betriebswege parallel.

#### Standards und ihre Rollen

:::table{cols="4.6cm,X"}
| Standard / Begriff | Verbindliche Rolle in SkillPilot |
| --- | --- |
| **Open Responses** (vs. proprietäre *OpenAI Responses API* oder nachgebildetes `/responses`) | Offene Spezifikation zwischen Agent Runtime (MCP Host) und Model Provider/Gateway; Konformität zählt nur per Acceptance-Test und Capability-Profil, niemals bloß wegen des Pfadnamens `/responses`. |
| **Model Context Protocol (MCP)** | Standardisiert die Verbindung zwischen MCP Host/Client und **SkillPilot Core** als Remote-MCP-Server über **Streamable HTTP**. |
| **MCP Apps** | Optionale interaktive HTML-Ressourcen in Host-Sandboxen. Jedes SkillPilot-Tool unterstützt Textausgabe (universeller Fallback), `structuredContent` und optionale MCP-Apps-UI; keine didaktische Pflichtaktion darf ausschließlich per UI möglich sein. |
| **Agent Plugins v1** | Portables Installationsartefakt (`plugin.json`, `skills/.../SKILL.md`, `mcp.json`); MCP-Apps-UIs kommen zur Laufzeit vom MCP-Server, und OAuth-Client-Profile bleiben hostverwaltet außerhalb des Plugins. |
:::

#### Laufzeit- und Installationssicht

```text
Endgeraete (Mobile / Desktop Browser / App: Text, Diktat, Kamera)
        | HTTPS
        v
AI Chat Application / MCP Host
  +-- Chat UI + Server-side Agent Runtime (Loop, Context, Attachments, MCP Client)
        |                                       |
        | Open-Responses-API / Gateway          | Remote MCP (Streamable HTTP + OAuth)
        v                                       v
Model Provider (Nutzerkonto;           SkillPilot Core
  Vision-Bilder landen HIER,             +-- MCP Server (Tools, Resources, MCP Apps UI)
  nicht im SkillPilot Core)              +-- Didactic Services (Skill-Graph, SRS, Exams)
                                         +-- Learning State DB (nur strukturierter Zustand)
```

### Zustandsgrenzen, Betriebswege, Medien und Abrechnung {#sec:portable-host-boundaries anchors="12-offene-korrekturen-fur-v2"}

:::table{cols="3.6cm,6.2cm,X"}
| Bereich | Gespeicherte Daten | Verantwortlich |
| --- | --- | --- |
| **MCP Host** | Benutzerkonto, Chatverläufe, Nachrichten, Anhänge, Sitzungen, ggf. BYOK-Credentials | Hostbetreiber (im eigenen Pilot: enpasos) |
| **Model Provider** | Übermittelte Prompts und Vision-Bilddaten gemäß Anbieterbedingungen | Modellanbieter (direkter Vertrag mit Lernendem / Eltern) |
| **SkillPilot Core** | Strukturierter Lern- und Steuerungszustand (Zuordnung, Curriculum/Personalisierung, Fokus, `activeGoal`, binäre Mastery, SRS-Planung, binäres Verified-Recall-Ergebnis) | enpasos |
:::

- **Keine hostübergreifende Chatportabilität:** Der Chatverlauf ist hostgebunden, der Lernzustand SkillPilot-gebunden (`learner`, `activeGoal`, `masteryValue`, `dueItems`, `lastRecallOutcome`; `nextRecommendedAction` wird abgeleitet statt frei persistiert). Aktive Coach-Mutationen sind frei von Freitextfeldern (historische `lastFeedback`-Altlasten werden im aktiven Vertrag ausgeschlossen; siehe @ref{sec:coach-boundary-inputs}).
- **Sichtbare Kennungen:** Eine zufällige, opake `learningSessionId` ist im Modellkontext ausdrücklich erlaubt; permanente Lernenden-, Konto- oder Datenbank-IDs bleiben strikt verborgen.
- **Zwei dauerhafte Betriebswege:** **Betriebsweg A** nutzt fremdbetriebene Plattform-Hosts (ChatGPT, Claude) mit minimalem Eigenbetrieb und direktem Consumer-Abo; **Betriebsweg B** nutzt einen portablen Open-Source-MCP-Host (Pilot: LibreChat per Docker Compose; Zweitkandidat: Archestra) mit BYOK, direkter Providerabrechnung und kontrollierbarer Datenhaltung (inkl. dokumentierter Backup-, Upload-Lösch-, Key-Rotations- und Zugriffsregeln).
- **Sprache, flüchtige Bildanalyse und Abrechnung:** Diktat wird im Browser/Host zu Text gewandelt; fotografierte Lösungen gehen vom Host an das Vision-Modell des gewählten Providers und **niemals** an SkillPilot Core (Core erhält nur den strukturierten Schreibaufruf wie `setMastery` mit `1.0`). Providerkonto und Modell-Credentials gehören stets Lernenden bzw. Erziehungsberechtigten — ein zentraler SkillPilot-Betreiber-Key mit Weiterberechnung ist ausgeschlossen.

### Stufenplan und verbindliche Host-Abnahmetests {#sec:portable-host-roadmap}

1. **Phase 1 — Schnittstellen stabilisieren:** Hostunabhängiger Remote-MCP-Vertrag (Streamable HTTP, OAuth 2.0, stabile Toolnamen, versionierte Schemas, Idempotenz, Text-Fallback, `structuredContent`, optionale MCP Apps) plus kanonisches Agent-Plugin-Paket ohne Upload-Tools für Bilder/Lösungen.
2. **Phase 2 & 3 — Selbst betriebener Pilot & Standardslabor:** Kleiner geschlossener LibreChat-Pilot (5–10 Tester, Smartphone/Desktop, Diktat, Vision, BYOK) parallel zur praktischen Erprobung von Archestra (Open-Responses-Tests, MCP Apps).
3. **Phase 4 & 5 — Hosted Channels & künftiger Managed Host:** Claude (volljährige Tester) und ChatGPT (Verzeichnis-Release) auf demselben SkillPilot-Lernzustand; späterer Wechsel auf einen fremdbetriebenen portablen Host erst bei Nachweis aller 12 Kriterien (inkl. Open Responses, BYOK, MCP Apps, Agent Plugins, Datenexport/Löschung und Jugendschutz).

**Pflicht-Abnahmetests für jeden Host und jedes Modell:** Geräteübergreifende Sitzungsfortsetzung ohne Race-Conditions; 60 s deutsches Fachdiktat mit Tool-Call; Smartphone-Kamerafoto mit dokumentiertem Vision-Providerpfad; **MCP-Negativtest** (weder Bilddaten, OCR, Lösungstext, Bild-URL noch Analyseprotokoll in MCP-Argumenten, Logs, Traces oder DB); **Credential-Negativtest**; OAuth-Refresh und opake `learningSessionId` ohne interne ID-Lecks; Schreib-Idempotenz; Konto-/Chat-Löschtest; vollständiger Ablauf ohne MCP Apps sowie Sandbox-Prüfung mit MCP Apps; direkte Nutzerabrechnung; offizielle Open-Responses-Tests.

### Teil B — Datierter Marktanhang (Stand 19. August 2026) {#sec:portable-host-part-b anchors="teil-b-marktanhang-stand-19-august-2026,15-verwandte-dokumente"}

:::table{cols="2.6cm,2.2cm,2.1cm,2.2cm,2.2cm,X"}
| Kriterium | ChatGPT | Claude | LibreChat | Archestra | Managed Ziel |
| --- | --- | --- | --- | --- | --- |
| Runtime-Betrieb | OpenAI | Anthropic | selbst/fremd | selbst/fremd | fremd |
| SkillPilot mobil | im Verzeichnis zu prüfen | ja (iOS/Android) | mobiles Web | zu testen | gefordert |
| Diktat & Kamera | Diktat/Bild ja; Live-Voice begrenzter | ja | ja (Vision direkt an Provider) | Anhänge dok.; mobil zu testen | gefordert |
| Abrechnung | ChatGPT-Abo | Claude-Abo | BYOK direkt | Provider-Keys | BYOK direkt |
| Open Responses | intern proprietär | nein | teilweise | `/responses`-Router zu prüfen | gefordert |
| MCP + Apps | Remote MCP; Custom Dev web-only | Remote MCP + Apps mobil | Remote MCP + PKCE; Apps Draft | Remote MCP + Apps | gefordert + Text-Fallback |
| Altersgrenze | ab 13 (13–17 mit Zustimmung) | Consumer ab 18 (API separat) | Betreiberregel | Betreiberregel | zielgruppengerecht |
| **Rolle** | strategischer Kanal | Referenz (ab 18) | **unmittelbarer Pilot** | **2. Kandidat** | Langfristziel |
:::

Open WebUI wird mangels nativer MCP-Apps-Kernunterstützung derzeit nicht gegenüber LibreChat oder Archestra bevorzugt. Verwandte Detailverträge: @ref{sec:provider-neutral-coach-boundary}, @ref{sec:skillpilot-owned-coach}, @ref{sec:openai-mcp-oauth-session}, @ref{sec:openai-coach-behavior}, @ref{sec:openai-plugin-versioning} sowie [OpenAI-MCP-Clientbindung](repo:docs/security/openai-mcp-client-binding.md).
