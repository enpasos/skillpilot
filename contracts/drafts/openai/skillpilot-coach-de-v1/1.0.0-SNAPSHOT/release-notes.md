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
- bildreine Darstellung ohne zusätzlichen Lernzieltext oder Cockpit-Link;
  sichtbar wird sie erst nach erfolgreich geladenem Bild
- oberflächenneutraler Bildladeversuch ohne Plattform- oder
  User-Agent-Sperre: Mobile-Browser, native Apps und Desktop-Hosts versuchen das
  Bild gleichermaßen; erst ein konkreter Ladefehler oder Lade-Timeout blendet
  die UI aus und fordert Teardown an
- eigene read-only Anzeige-Aktion, die der Coach nur bei vorhandenem,
  freigegebenem Bild aufruft; ohne Bild entsteht keine leere UI-Karte
- idempotente Initialisierung aus MCP-Tool-Ergebnis, ChatGPT-Kompatibilitätswert
  und gespeichertem Widget-Zustand; doppelte oder partielle Host-Updates sowie
  verspätete Fehler abgelöster Bildknoten löschen das sichtbare Bild nicht
- Cockpit-Einstellung für Lernzielbilder im Chat, standardmäßig aktiviert
- Visualisierung ausschließlich zur Orientierung, nicht als Evidenz, Aufgabe,
  Lösung, Bewertung oder Mastery-Nachweis
- SkillPilot-Papierflieger als Composer-Icon und Plugin-Logo
- Originaldateien unverändert aus `app/public/favicon/` übernommen
- fortschreibbarer, noch unveröffentlichter `1.0.0`-Draft; erst die tatsächliche
  Portal-Veröffentlichung versiegelt Contract-, UI- und Skill-Bundle-Snapshot
- kein öffentlicher Kompatibilitätsalias auf `skillpilot.com`
