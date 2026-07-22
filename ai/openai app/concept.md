# Konzept: SkillPilot als ChatGPT App (Apps SDK)

Status: Zielbild, nicht die aktuelle Lerncoach-Laufzeitarchitektur.

## 1. Kontext

SkillPilot nutzt heute für den Chat zwischen Lernenden und dem SkillPilot-Backend
die beiden bestehenden sprachspezifischen **SkillPilot Lerncoaches als Custom GPTs**
in der Visible-Session-Konfiguration. Maßgeblich ist
`ai/openai-custom-gpt-visible-session/`; `ai/openai custom gpt/` ist ausschließlich
die unveränderte Legacy-Rollback-Quelle. Die aktuelle Konfiguration enthält:

- **System Instructions** (Didaktik + Steuerlogik)
- **Knowledge Files** (Training-Loop, State Machine, Mastery-Regeln, Deep Linking, Fehlerbehandlung)
- **Actions** mit einem je Sprache passgenauen, paketlokalen OpenAPI-Schema
  (`ai/openai-custom-gpt-visible-session/de/skillpilot-api-4ai.de.json` bzw.
  `ai/openai-custom-gpt-visible-session/en/skillpilot-api-4ai.en.json`) zur
  Anbindung an das SkillPilot-Backend

Der aktuelle Custom-GPT-Flow trägt ein höchstens 24 Stunden gültiges
Sitzungstoken und erforderliche Folgewerte sichtbar durch den Dialog. Es gibt
keine Startcode-Einlösung. Das Apps-SDK-Zielbild in diesem Dokument ist davon
getrennt und noch nicht der produktseitige Coach-Pfad.

ChatGPT hat sich stark in Richtung Plattform weiterentwickelt:

- **Apps in ChatGPT** inkl. interaktiver UI und Datensynchronisation
- **Apps SDK** (basiert auf dem Model Context Protocol, MCP) fuer eigene Apps mit UI-Widgets im Chat
- **Developer Mode** fuer private MCP-Apps in Business/Enterprise/Edu Workspaces
- **Projects** fuer persistenten Kontext ueber laengere Vorhaben

Ziel dieses Dokuments: ein klares Zielbild und eine umsetzbare Architektur fuer **SkillPilot als ChatGPT App**.

---

## 2. Zielbild

**SkillPilot als ChatGPT App** (Apps SDK), die Lernende in ChatGPT nutzen koennen.
