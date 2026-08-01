# SkillPilot Coach DE v1 – 1.0.0

Entwurf der ersten dauerhaft isolierbaren öffentlichen Vertragslinie des
deutschen SkillPilot-Coachs. Dieser Stand ist noch nicht veröffentlicht.

- technische Plugin-Identität `skillpilot-coach-de-v1`
- MCP-Contract-Major `1`
- öffentlicher MCP-Endpunkt und exakte OAuth-Resource
  `https://mcp-coach-de-v1.skillpilot.com/mcp`
- pfadspezifische Protected-Resource-Metadaten unter
  `https://mcp-coach-de-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`
- eigener, von künftigen DE-/EN-Vertragslinien unabhängig verifizierbarer
  MCP-Origin; OAuth-Autorisierung weiterhin über `https://skillpilot.com`
- fester, pro Plugin eindeutiger Widget-Origin
  `https://mcp-coach-de-v1.skillpilot.com`, sowohl über `_meta.ui.domain` als
  auch den ChatGPT-Kompatibilitätsalias `_meta["openai/widgetDomain"]`
- read-only MCP-UI-Karte für das Bild eines aktiven atomaren Lernziels mit
  passendem kanonischem `goal-visualization`-Link
- automatische Anzeige nach Context-Read und erfolgreicher Zielaktivierung;
  fehlende oder ungültige Bilder fallen auf die normale Chatdarstellung zurück
- Visualisierung ausschließlich zur Orientierung, nicht als Evidenz, Aufgabe,
  Lösung, Bewertung oder Mastery-Nachweis
- SkillPilot-Papierflieger als Composer-Icon und Plugin-Logo
- Originaldateien unverändert aus `app/public/favicon/` übernommen
- fortschreibbarer, noch unveröffentlichter `1.0.0`-Draft; erst die tatsächliche
  Portal-Veröffentlichung versiegelt Contract-, UI- und Skill-Bundle-Snapshot
- kein öffentlicher Kompatibilitätsalias auf `skillpilot.com`
