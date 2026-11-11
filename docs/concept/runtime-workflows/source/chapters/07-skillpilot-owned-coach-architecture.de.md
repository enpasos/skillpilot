## SkillPilot-Lerncoach: Produkt- und Providerarchitektur {#sec:skillpilot-owned-coach}

:::note{title="Status und Zusammenspiel der Verträge"}
Dauerhafte Produkt- und Systemtopologie des mehrsprachigen SkillPilot-Coaches. Arbeitsteilung und Turn-Vertrag stehen in @ref{sec:provider-neutral-coach-boundary}, OAuth und 24h-Lernsession in @ref{sec:openai-mcp-oauth-session}, sichtbares Verhalten in @ref{sec:openai-coach-behavior}, Versionierung inklusive der Entscheidung vom 19. Oktober 2026 für das dauerhafte neutrale Plugin `skillpilot-coach` (`https://mcp-openai.skillpilot.com/mcp`) in @ref{sec:openai-plugin-versioning} und Betriebsabläufe unter `docs/deploy/`.
:::

### Produktentscheidung und mehrsprachige Plugin-Struktur {#sec:coach-arch-product}

SkillPilot stellt den Coach als providergehostete Konversation mit authentisierten SkillPilot-Werkzeugen bereit:

- Modell, freier Chat und optionale App-Oberflächen laufen beim Provider über den bestehenden Consumerzugang der lernenden Person; SkillPilot ruft auf diesem Pfad keine eigene kostenpflichtige Modell-API auf und verkauft keine Modellnutzung weiter.
- Curriculum, Personalisierung, Fokus, Frontier, aktives Lernziel, Mastery, Recall, Prüfung und Persistenz verbleiben vollständig im SkillPilot-Backend.

Das mehrsprachige OpenAI-Plugin (`skillpilot-coach` im aktuellen neutralen Zielstand gemäß @ref{sec:plugin-decision-2026-10-19}; historisch `skillpilot-coach-v1` in der unverändert bewahrten Git-Beta `1.1.2`) bündelt:

- einen neutral englischen Control-Plane-Skill,
- einen direkt gebundenen MCP-Server auf stabilem öffentlichem Origin (`https://mcp-openai.skillpilot.com/mcp`),
- einen sprachneutralen Werkzeugkatalog,
- zwei unabhängig gebundene, hashadressierte MCP-Apps-Ressourcen (Lernzielbild und normales Karteikartenlernen),
- getrennte reale Abnahmefälle je freigegebener Interaktionssprache und Oberfläche (Deutsch, Englisch und künftige Sprachen nutzen dasselbe Plugin über die in der Lernsession gebundene `communicationLocale`).

### Systemtopologie und Schichtenverantwortung {#sec:coach-arch-topology}

```text
SkillPilot-WebGUI (Level 2 konfigurieren, "Lernen starten")
  |  frische learningSessionId + vorbereitete Nachricht
  v
ChatGPT: SkillPilot Coach
  |  neutraler Skill, neutraler Toolkatalog, optionale MCP-Apps-UIs
  |  HTTPS + OAuth Bearer + learningSessionId
  v
https://mcp-openai.skillpilot.com/mcp
  v
OpenAI-V1-Provideradapter im Spring-Boot-Prozess (/internal/openai/v1/mcp)
  |  AuthN/AuthZ, Rate Limit, Schema, sichere Projektion
  v
CoachToolFacade + CoachStateProjection
  v
LearnerService + Curriculum + Datenbank
```

Provideradapter, Fachruntime und Domain laufen im selben `skillpilot-server`-Prozess ohne separates Integrationsgateway.

:::table{cols="4.4cm,X"}
| Schicht | Verantwortung |
| --- | --- |
| **First-Party-WebGUI** | Permanente ID, Providerhinweis, Level-2-Konfiguration, bewusster Start und Cockpit-Fallback |
| **Provider-Host** | Modell, Chat, Skillaktivierung, Toolauswahl und optionale Sandbox-UI-Darstellung |
| **Plugin-Paket** | Installierbares Artefakt aus Manifest, Skill, MCP-Verbindung und Releasebindung |
| **Coach-Skill** | Wiederholbares Dialog- und Coachingverhalten ohne eigene Zustandsautorität |
| **Provideradapter** | OAuth/Scopes, Toolkatalog, Schemas, Rate Limits, sichere Projektion und UI-Metadaten |
| **`CoachToolFacade` & `CoachStateProjection`** | Kleine providerneutrale Fach-Use-Cases und explizite Allowlist für sichtbaren Zustand |
| **Domainruntime** | Curriculum, Zustand, erlaubte Übergänge, Transaktionen, Idempotenz und Persistenz |
:::

### Web-first-Einstieg, sichere Projektion und UI-Oberfläche {#sec:coach-arch-projection}

- **Web-first Level 2:** Permanente SkillPilot-ID, Curriculum/View, Bundesland, Dauermodell, Stufe, Fächer und Kursprofile werden ausschließlich im WebGUI erfasst; der V1-Coach-Vertrag fragt oder mutiert sie nie im Chat, sondern verweist bei unvollständiger Konfiguration zurück. Fokus und aktives Atomziel (Level 3) bleiben über frische Backendoptionen änderbar.
- **OAuth vs. 24h-Lernsession:** OAuth authentisiert die App; jeder bestätigte WebGUI-Start erzeugt unabhängig davon eine absolut auf 24 Stunden begrenzte `learningSessionId` (ohne Verlängerung durch Tokenrefresh; siehe @ref{sec:openai-mcp-oauth-session}).
- **Sichere Zustandsprojektion:** Provider sehen niemals rohe `UnifiedLearnerStateResponse`- oder Domainobjekte: permanente IDs und Provenienz werden entfernt, Aufgaben von Lösungen/Rubriken getrennt (Freigabe erst im geschützten aktiven Evaluations-Use-Case), URLs/Mathematik normalisiert, Fakten in `structuredContent` und widget-private Daten ausschließlich in `_meta` gelegt.
- **Zwei dedizierte MCP-Apps-Ressourcen:** `render_skillpilot_goal_visualization` bindet die aktive hashadressierte Bildressource; `start_skillpilot_memory_practice` bindet die interaktive Karteikartenressource (`release/line.json` ist die einzige Quelle aktiver Hashes; bereits ausgelieferte historische Bild-URIs bleiben passiv byteidentisch lesbar). App-only Kartenreview und alle übrigen Tools bleiben UI-ungebunden, und der vollständige Textpfad bleibt jederzeit funktionsfähig.

### Bewertungsgrenze, weitere Provider und 8 Freigabegates {#sec:coach-arch-gates}

Das Provider-Modell vergleicht sichtbare Lernendenarbeit semantisch gegen freigegebene Referenzen/Rubriken; das Backend entscheidet allein über Freigabeberechtigung, aktives Ziel/Versuch, Vollständigkeit, Stale-/Replay-Schutz und Zustandsübergang. Weitere Provider (wie Claude oder Gemini) erhalten eigene Transport-/Auth-Adapter, geprüfte Toolkataloge und eigene End-to-End-Abnahmen über derselben `CoachToolFacade` und `CoachStateProjection`.

Vor einer öffentlichen Freigabe müssen **alle 8 Gates** gemeinsam grün sein: (1) Contract-, Schema-, Security- und Domain-Tests, (2) exakter Quell-/Draft-Abgleich, (3) OAuth-, Session-, Ablauf- und Recovery-Tests, (4) reale Golden Journeys mit echtem Provider-Modell, (5) Desktop-, Mobile-Web- und relevante native Oberflächen, (6) jede freigegebene Interaktionssprache, (7) Datenschutz-, Minderjährigen-, Support- und Submissionprüfung sowie (8) Telemetrie, Rollback und unveränderte Cockpit-Nutzbarkeit.
