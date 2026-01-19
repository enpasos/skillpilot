# Konzept: SkillPilot als ChatGPT App (Apps SDK)

## 1. Kontext

SkillPilot nutzt heute fuer den Chat zwischen Lernenden und dem SkillPilot-Backend einen **Custom GPT** in ChatGPT (siehe `ai/openai custom gpt/`). Dieser Custom GPT enthaelt:

- **System Instructions** (Didaktik + Steuerlogik)
- **Knowledge Files** (Training-Loop, State Machine, Mastery-Regeln, Deep Linking, Fehlerbehandlung)
- **Actions** (OpenAPI Schema, z. B. `ai/skillpilot-api-4ai.json`) zur Anbindung an das SkillPilot-Backend

ChatGPT hat sich stark in Richtung Plattform weiterentwickelt:

- **Apps in ChatGPT** inkl. interaktiver UI und Datensynchronisation
- **Apps SDK** (basiert auf dem Model Context Protocol, MCP) fuer eigene Apps mit UI-Widgets im Chat
- **Developer Mode** fuer private MCP-Apps in Business/Enterprise/Edu Workspaces
- **Projects** fuer persistenten Kontext ueber laengere Vorhaben

Ziel dieses Dokuments: ein klares Zielbild und eine umsetzbare Architektur fuer **SkillPilot als ChatGPT App**.

---

## 2. Zielbild

**SkillPilot als ChatGPT App** (Apps SDK), die Lernende in ChatGPT nutzen koennen, inklusive:

1. **Seamless Auth** statt manueller SkillPilot-ID
2. **Interaktive UI** (Frontier/Next Steps/Progress) direkt im Chat
3. **Robusteres Tooling** (klar definierte Tools + maschinenlesbarer State)
4. **Bessere Persistenz** ueber Sessions (SkillPilot-Backend bleibt Source of Truth)
5. **Deployment-Optionen**
   - privat (Schul-/Uni-/Company-Workspaces via Developer Mode)
   - oeffentlich (App Directory / App Submission)

---

## 3. Begriffe

- **Custom GPT**: GPT in ChatGPT mit Instructions/Knowledge/Actions (OpenAPI) und ggf. OAuth
- **Apps SDK**: Toolkit fuer Apps, die in ChatGPT laufen (UI im Chat + Tools via MCP)
- **MCP Server**: Server, der Tools und Ressourcen bereitstellt (JSON-RPC)
- **Widget UI**: in ChatGPT eingebettete UI (z. B. Dashboard)

---

## 4. Status quo (Custom GPT) - Staerken & Grenzen

### Was heute gut funktioniert

- schnelle Iteration im GPT Builder
- didaktische Steuerung ueber Instructions + Knowledge Docs
- Backend-Integration via OpenAPI Actions (`skillpilot-api-4ai.json`)

### Typische Grenzen

1. Identitaet & Persistenz: SkillPilot-ID ist manuell und fragil
2. UI: Navigation (Frontier, Zielwahl, Karte) ist im reinen Chat zaehe UX
3. Reliability: Fehlerbehandlung ist textlastig; wenig "Control Plane"

---

## 5. Kernbedingung: Kosten- und Verantwortungs-Trennung

**Kernziel:** Die LLM-Kosten sollen _nicht_ bei SkillPilot liegen.

- **User/Workspace bezahlt ChatGPT** (oder nutzt Free/Plus/Pro/Business/Edu/Enterprise).
- **SkillPilot stellt nur das Backend** (MCP Server + SkillPilot API/DB) und traegt nur diese Betriebskosten.

### Harte Regel

> Der SkillPilot-Backend-Stack macht **keine** OpenAI-API-Inference-Calls.

Das heisst:

- ChatGPT (App) generiert den Text / die Didaktik.
- SkillPilot liefert deterministische Daten, State, Fortschritt, Frontier, etc. ueber Tools.

### Konsequenz

- Wenn SkillPilot serverseitig OpenAI APIs aufruft (Assistants/Responses/etc.), dann entsteht eigenes Token-Billing und damit ein anderes Produkt-/Kostenmodell.
- Diese Variante ist **ausserhalb** dieses Konzepts.

### Produktimplikationen

- Modellwahl, Limits und Verfuegbarkeit haengen am ChatGPT-Plan/Workspace.
- SkillPilot muss UX-seitig "degradieren" koennen (z. B. weniger lange Antworten, mehr strukturierte Aufgaben) ohne die Kernfunktion (Frontier/Progress) zu verlieren.

---

## 6. Entscheidung & Migrationspfad

**Entscheidung:** SkillPilot wird als **ChatGPT App (Apps SDK)** umgesetzt. Der Custom GPT bleibt nur als Uebergang.

1. **Kurzfristig:** API hardening + klare Fehlercodes + Auth-Flow (OAuth/Magic-Link) fuer Tool-Calls
2. **PoC:** MCP Server + Widget Dashboard (Frontier + Next Action)
3. **Ausbau:** kompletter Lernloop (ActiveGoal -> Teach -> Evidence -> Mastery) mit UI als Control Plane

---

## 7. Ziel-Architektur (Apps SDK)

```mermaid
flowchart LR
  U[Lernende:r] -->|Chat in ChatGPT| CG[ChatGPT Client]
  CG -->|MCP JSON-RPC (tool calls)| MCP[MCP Server: SkillPilot App]
  MCP -->|REST/DB| SP[SkillPilot Backend]
  CG -->|embedded widget UI| W[SkillPilot Widget UI]
  W -->|callTool / follow-up| CG
  MCP -->|OAuth 2.1 / scopes| IDP[SkillPilot Auth/IdP]
```

**Prinzipien**

- SkillPilot Backend bleibt **Source of Truth** (State Machine, Mastery, Frontier)
- Widget UI ist die **Control Plane** (Navigation, Status, Aktionen)
- Chat ist fuer Didaktik/Erklaerung/Interaktion

---

## 8. Funktionsumfang der ChatGPT App

### 8.1 Onboarding & Login

- Erststart: "SkillPilot verbinden" (OAuth)
- Danach: automatisches Laden des Learner-State
- Optional: Guest Mode (read-only)

### 8.2 Lern-Dashboard (Widget)

- aktives Lernziel (atomic)
- naechste 3-5 Frontier-Goals mit Quick Actions
- Progress / Evidence-Status
- Deep Link: "Open in SkillPilot"

### 8.3 Lern-Loop

- `set_active_goal` -> Uebungen im Chat
- Evidence Check (z. B. 2 Checks oder Transfer)
- `set_mastery` -> Frontier aktualisieren

---

## 9. Tool-Design (MCP Tools) - Mapping zur bestehenden API

### Minimaler Tool-Satz (MVP)

- `skillpilot.get_state()` -> `GET /api/ai/learners/{id}/state`
- `skillpilot.set_scope(...)`
- `skillpilot.set_active_goal(...)`
- `skillpilot.set_mastery(...)`

### Empfehlenswert (UX/Robustheit)

- `skillpilot.search_goals(query)`
- `skillpilot.get_landscape()`
- `skillpilot.create_or_resume_session()`

### Leitlinien

- Tools sind klein, klar, deterministisch
- Inputs/Outputs kompakt, maschinenlesbar
- Konsequente Fehlercodes + strukturierte Fehlersignale

---

## 10. UI-Konzept (Widget)

### Widget als Control Plane

- Zielwahl & Scope
- Frontier/Progress
- Buttons fuer Next Actions
- Status/Fehleranzeigen ("Retry", "Re-auth", "Open details")

### Interaktionsmuster

- Buttons -> `window.openai.callTool(...)`
- Optional: Follow-up Message, die den Chat in den naechsten Schritt fuehrt

---

## 11. Authentifizierung & Autorisierung

### Ziel

- Weg von "SkillPilot-ID als Passwort" hin zu OAuth 2.1

### Empfehlung

- OAuth/OIDC Provider nutzen
- MCP Server validiert Tokens serverseitig

### Scopes (Beispiel)

- `skillpilot.read_state`
- `skillpilot.write_progress`
- `skillpilot.write_profile`

### Shortcut (optional)

- Phase 1: Magic Link / One-Time Token
- Phase 2: Upgrade auf OAuth 2.1

---

## 12. Deployment-Strategien

### 12.1 Private App (B2B / Schulen / Unis / Firmen)

- ChatGPT Business/Enterprise/Edu Workspace
- Admin aktiviert Developer Mode
- App intern veroeffentlicht

### 12.2 Public App (B2C)

- App Submission -> Review -> Directory
- Privacy Policy + sichere Tool-Definitionen

---

## 13. Datenschutz & Compliance

- Consumer (Free/Plus/Pro): Inhalte koennen fuer Training genutzt werden (Opt-out moeglich)
- Business/Enterprise/Edu: Inhalte standardmaessig nicht fuer Training (Opt-in moeglich)
- Fuer EDU/B2B: bevorzugt Business/Enterprise/Edu (Governance, DPA)
- EU Data Residency: falls erforderlich, als eigene Anforderung aufnehmen

---

## 14. Rollout-Plan (konkret)

### Phase 0 - Ist stabilisieren (1-3 Tage)

- Baseline-Metriken (Tool-Call Erfolgsrate, Abbruchrate)
- Hardening: saubere Fehlercodes im SkillPilot API

### Phase 1 - Auth fuer Tool-Calls (1-2 Wochen)

- OAuth/OIDC oder Magic-Link Token
- SkillPilot-ID als manuelles Gate entfernen

### Phase 2 - Apps SDK PoC (2-4 Wochen)

- MCP Server: `get_state`, `set_active_goal`, `set_mastery`
- Widget: Dashboard (Frontier + Start Button)
- Interner Pilot via Developer Mode

### Phase 3 - Full Learning Loop + Karte (4-8 Wochen)

- Scope/Personalization UI
- Lightweight Landscape Widget
- Deep-Link Integration

### Phase 4 - Produktisierung

- Monitoring, Rate Limiting, Audit Logs
- Security Review
- Optional: Directory Submission

---

## 15. Risiken & Gegenmassnahmen

1. Plattform-Abhaengigkeit (SDK aendert sich)
   - Backend bleibt stabiler Kern
2. Region/Plan-Verfuegbarkeit
   - Graceful Degradation + klare Mindestfunktion (State/Frontier)
3. Prompt Injection / Tool Abuse
   - deny-by-default, strikte Scopes, serverseitige Validierung, Rate Limits
4. Latenz
   - unified state endpoint, Caching, kompakte Payloads

---

## 16. Erfolgskriterien (messbar)

- Onboarding Time bis zum ersten Active Goal
- Anteil Sessions mit >= 1 saved mastery
- Tool-Call Failure Rate / Auth Loops
- Retention: Wiederkehr innerhalb 7 Tagen
- Evidence-Bar eingehalten + Zufriedenheit

---

## 17. Offene Fragen

1. Zielmarkt primaer EU/DE (Feature-Verfuegbarkeit, Datenschutzanforderungen)?
2. Gibt es SkillPilot-Login/Identity fuer OAuth/OIDC (oder muss das zuerst gebaut werden)?
3. Welche Daten duerfen in ChatGPT angezeigt werden (PII, Lernhistorie, Inhalte)?
4. B2B (private Workspaces) oder B2C (public directory) als erster Go-to-Market?

---

## 18. Referenzen

- Custom GPT Doku: `ai/openai custom gpt/`
- SkillPilot AI API Schema: `ai/skillpilot-api-4ai.json`
- OpenAI Apps SDK:
  - https://developers.openai.com/apps-sdk/
  - https://developers.openai.com/apps-sdk/quickstart/
  - https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt-beta
- Privacy:
  - https://help.openai.com/de-de/articles/8554402-gpts-data-privacy-faq
  - https://openai.com/enterprise-privacy/
  - https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt
