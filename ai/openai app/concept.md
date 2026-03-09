# Konzept: SkillPilot als ChatGPT App (Apps SDK)

## 1. Kontext

SkillPilot nutzt heute fuer den Chat zwischen Lernenden und dem SkillPilot-Backend einen **Custom GPT** in ChatGPT (siehe `ai/openai custom gpt/`). Dieser Custom GPT enthaelt:

- **System Instructions** (Didaktik + Steuerlogik)
- **Knowledge Files** (Training-Loop, State Machine, Mastery-Regeln, Deep Linking, Fehlerbehandlung)
- **Actions** (OpenAPI Schema, z. B. `ai/skillpilot-api-4ai.de.json` oder `ai/skillpilot-api-4ai.en.json`) zur Anbindung an das SkillPilot-Backend

ChatGPT hat sich stark in Richtung Plattform weiterentwickelt:

- **Apps in ChatGPT** inkl. interaktiver UI und Datensynchronisation
- **Apps SDK** (basiert auf dem Model Context Protocol, MCP) fuer eigene Apps mit UI-Widgets im Chat
- **Developer Mode** fuer private MCP-Apps in Business/Enterprise/Edu Workspaces
- **Projects** fuer persistenten Kontext ueber laengere Vorhaben

Ziel dieses Dokuments: ein klares Zielbild und eine umsetzbare Architektur fuer **SkillPilot als ChatGPT App**.

---

## 2. Zielbild

**SkillPilot als ChatGPT App** (Apps SDK), die Lernende in ChatGPT nutzen koennen.
