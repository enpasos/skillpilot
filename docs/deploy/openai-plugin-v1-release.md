# SkillPilot Coach v1: Release, Rollback und Stilllegung

**Stand:** 31. Juli 2026  
**Status:** verbindliches Betriebsverfahren für die mehrsprachige Plugin-Linie V1

Dieses Runbook setzt den
[Versionierungs- und Lebenszyklusplan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
operativ um. Es gilt für die zur Veröffentlichung vorgesehene und später
veröffentlichte Linie `skillpilot-coach-v1`.

## 1. Feste Identität der Linie

| Bestandteil | Verbindlicher Wert |
| --- | --- |
| Plugin-Identität | `skillpilot-coach-v1` |
| Anzeigename | `SkillPilot Coach v1` |
| aktueller Paketstand | `1.0.0` |
| Contract Major | `1` |
| öffentlicher MCP-Endpunkt | `https://mcp-coach-v1.skillpilot.com/mcp` |
| OAuth Resource/Audience | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Protected Resource Metadata | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Domain-Challenge | `https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` |
| MCP-UI | nicht veröffentlicht; Ressourceninventar leer |
| Support-URL im OpenAI-Portal | `https://skillpilot.com/imprint` |
| Veröffentlichungsstatus | noch nicht veröffentlicht; interner Draft `1.0.0-SNAPSHOT` |
| Quellpaket | `ai/openai plugin/skillpilot-coach-v1/` |

Der noch unveröffentlichte V1-Draft enthält keine MCP-UI-Ressource. Das
dedizierte read-only Werkzeug `render_skillpilot_goal_visualization` liefert
ein freigegebenes JPEG- oder PNG-Bild als standardisierten MCP-`ImageContent`;
kein Tool referenziert `ui.resourceUri` oder `openai/outputTemplate`. Coach-,
Auswahl-, Antwort- und Zustandsabläufe bleiben Chat-/Tool-basiert. Die V1-Linie
besitzt keinen öffentlichen Kompatibilitätsalias; Plugin und Directory
verwenden ausschließlich den dedizierten V1-Origin. Die acht neutralen
Major-Hosts V2 bis V9 antworten bis zu ihrer jeweiligen Freigabe mit `404`.

Da V1 noch nie veröffentlicht wurde, besteht für frühere experimentelle
Widget-Ressourcen keine Rückwärtskompatibilität. Sie werden weder inventarisiert
noch ausgeliefert. Alte Test-Chats sind ausdrücklich nicht Teil der Abnahme;
nach einem Draft-Update werden die Plugin-Metadaten aktualisiert und ein neuer
Chat verwendet.

Die maschinenlesbaren Quellen der Wahrheit sind:

- `.codex-plugin/plugin.json` für Paket-SemVer und sichtbare Metadaten;
- `release/line.json` für Contract Major, öffentlichen MCP-Endpunkt und
  Zustands-/Workflowversionen;
- `release/lifecycle.json` für `CURRENT`, `SUPPORTED`, `DEPRECATED`,
  `UNPUBLISHED` oder `RETIRED`;
- `contracts/openai/skillpilot-coach-v1/release-index.json` ausschließlich
  für tatsächlich im OpenAI-Portal veröffentlichte Versionen;
- `contracts/drafts/openai/skillpilot-coach-v1/<version>-SNAPSHOT/` für den
  fortschreibbaren internen Arbeitsstand einer noch nicht veröffentlichten
  Paketversion;
- `contracts/published/openai/skillpilot-coach-v1/<version>/` für den
  unveränderlichen veröffentlichten Snapshot.

Solange eine Paketversion nicht tatsächlich im OpenAI-Portal veröffentlicht
wurde, bleibt ihre SemVer unverändert. Beliebig viele interne Commits,
Deployments, Scans, Reviewkorrekturen und Draft-Aktualisierungen dürfen daher
weiter an `1.0.0` arbeiten. Das Suffix `-SNAPSHOT` kennzeichnet ausschließlich
den internen Draft-Pfad und die Operatorausgabe. Die öffentliche Zielversion in
`plugin.json`, im Tar-Namen und im OpenAI-Portal bleibt `1.0.0`. Erst nach einer
realen Veröffentlichung ist dieser Stand versiegelt und jede weitere
Paketänderung benötigt eine neue SemVer.

## 2. Release vorbereiten

1. Für eine noch nicht veröffentlichte Arbeitsversion bleibt die vorhandene
   Paketversion bestehen. Nur wenn `release-index.json` diese Version bereits
   als veröffentlicht führt, wird die nächste Änderung als `PATCH` oder
   `MINOR` eingeordnet. Eine inkompatible Änderung benötigt eine neue
   Plugin-Identität und einen neuen MCP-Origin.
2. Release Notes, Lifecycle und alle Contract-/Workflowangaben gezielt
   aktualisieren. Die Paketversion wird innerhalb desselben unveröffentlichten
   Drafts nicht hochgezählt.
   Das gilt auch für die jetzt ergänzte Lernzielvisualisierung: Da `1.0.0` noch
   nie veröffentlicht wurde, wird derselbe Draft aktualisiert und keine
   `1.0.1` erzeugt.
3. Die kanonischen V1-URLs sind feste Vertragswerte im Backend-Artefakt und
   keine Laufzeitkonfiguration. Alte `SKILLPILOT_OPENAI_DE_*`-URLvariablen und
   neu erfundene `SKILLPILOT_OPENAI_COACH_V1_*`-URLvariablen werden aus
   `/etc/skillpilot/skillpilot.env` entfernt und fail-closed abgelehnt.
   V1-spezifische Schalter und OAuth-Clientwerte tragen
   `SKILLPILOT_OPENAI_COACH_V1_*`; gemeinsame Richtlinien des einzigen
   Spring-Prozesses tragen `SKILLPILOT_OPENAI_*`.

   `SKILLPILOT_SERVER_BUILD` gehört nicht in das `EnvironmentFile`. Gradle
   erzeugt beim Backend-Build genau ein `skillpilot-server`-Artefakt und bettet
   den vollständigen lowercase Git-Commit des
   ausgecheckten `HEAD` in
   `skillpilot.openai.coach.v1.server-build` und
   `skillpilot.openai.coach.v1.mcp.server-version` ein. Das Deployment prüft beide
   Werte im verarbeiteten `application.yml` vor dem Service-Restart. Eine
   manuell gepflegte Laufzeitvariable könnte die Artefaktidentität daher weder
   verbessern noch überschreiben.
4. Alle generischen CI-Gates und danach die versionsspezifischen Gates
   ausführen:

   ```bash
   npm --prefix "ai/openai app" test
   node scripts/check_openai_plugin_versioning.mjs
   node scripts/check_skillpilot_coach_plugin.mjs
   node scripts/openai_plugin_release.mjs candidate
   ```

   Der Candidate liegt ausschließlich unter `tmp/` und wird nicht eingecheckt.
5. Den eingecheckten internen Draft erzeugen oder nach einem weiteren
   Arbeitsschritt derselben unveröffentlichten Version aktualisieren:

   ```bash
   node scripts/openai_plugin_release.mjs prepare
   ```

   `prepare` ersetzt ausschließlich
   `contracts/drafts/openai/skillpilot-coach-v1/<version>-SNAPSHOT/`. Es
   ändert weder die öffentliche SemVer noch den Published-Index. Ist die
   Version bereits veröffentlicht, schlägt der Befehl fail-closed fehl.
   Das Plugin-Tar wird ohne ein systemspezifisches `tar`-Programm direkt als
   deterministisches USTAR erzeugt. Eingabe sind ausschließlich reguläre,
   bereits von Git erfasste Plugin-Dateien mit kanonischen Dateirechten.
   Unversionierte, ignorierte oder symbolisch verlinkte Dateien unter dem
   Plugin-Root stoppen die Vorbereitung mit ihrem konkreten Pfad.
6. Den internen Draft reproduzierbar gegen Quellen und Build prüfen:

   ```bash
   node scripts/openai_plugin_release.mjs verify
   npm --prefix app run check:docs-links
   npm --prefix app run check:docs-indexes
   git diff --check
   ```
7. Erst nach grüner CI den Backend-Build und die V1-Edge-Konfiguration
   ausrollen. Danach Discovery, OAuth-Resource, `tools/list`, negative
   Authentisierungsfälle, Lernsessionbindung und mindestens eine Golden Journey
   prüfen. `resources/list` muss leer bleiben. Bei einem aktiven atomaren Ziel
   mit passendem kanonischem Bild muss der Renderer oberflächenneutral angeboten
   werden und genau einen standardisierten MCP-Bildinhalt liefern. Der jeweilige
   Host darf diesen darstellen oder ignorieren. Ohne gültiges Bild muss derselbe
   Ablauf als normale Chatdarstellung weiter funktionieren.
8. Die neue Plugin-Version im OpenAI-Portal aktualisieren. Die
   hostgenerierte `.app.json` im Quellpaket bleibt Test-Wiring; sie ist nicht
   das Veröffentlichungsvehikel.
9. Erst nachdem im OpenAI-Portal tatsächlich **Publish** erfolgreich
   abgeschlossen wurde, den geprüften Draft unveränderlich als veröffentlicht
   registrieren:

   ```bash
   node scripts/openai_plugin_release.mjs record-published \
     --confirm-openai-published
   ```

   Dieser explizite Bestätigungsschritt kopiert den Draft nach
   `contracts/published/` und aktualisiert `release-index.json`. Vorher darf
   dort keine Version erscheinen.

## 3. Rollback innerhalb von V1

Ein Rollback ändert nicht die Plugin-Identität, den Contract Major, den
dedizierten MCP-Origin oder die OAuth-Resource.

1. Schreiboperationen bei Datenintegritätsrisiko zuerst über den vorhandenen
   Kill-Switch deaktivieren.
2. Den letzten grünen Backend-/Edge-Build wiederherstellen.
3. Nur einen bereits veröffentlichten, unveränderten Snapshot aus
   `contracts/published/openai/skillpilot-coach-v1/` verwenden.
4. Falls nur Skill- oder Pluginmetadaten fehlerhaft sind, einen neuen
   kompatiblen Patch veröffentlichen; eine bereits publizierte Versionsnummer
   wird nicht neu befüllt.
5. OAuth-Tokens oder Lernsessionen nur bei einem konkreten Sicherheits- oder
   Datenintegritätsgrund pauschal widerrufen. Ein normaler Rollback erfordert
   keine neue Lernendenidentität.

## 4. Deprecation und Unpublish

Die Zustandsänderung erfolgt zuerst in `release/lifecycle.json` und wird als
normale, geprüfte Änderung veröffentlicht.

- `SUPPORTED`: funktionsfähig und sicherheitsgepflegt, aber nicht die
  empfohlene Linie.
- `DEPRECATED`: weiterhin funktionsfähig; Nachfolger, Support-Ende und
  Unpublish-Datum müssen gesetzt und nutzerverständlich kommuniziert sein.
- `UNPUBLISHED`: keine Neuinstallation über das Verzeichnis; bestehende
  Installationen und der dedizierte MCP-Origin bleiben bis zum dokumentierten
  Support-Ende funktionsfähig.
- `RETIRED`: Aufrufe werden kontrolliert und ohne Datenverlust abgewiesen.

Unpublish ist kein technischer Shutdown. Vor dem Abschalten müssen installierte
Clients, Fehler- und Nutzungstelemetrie sowie die veröffentlichten
Supportfristen geprüft werden.

## 5. Endgültige Löschung

Eine Plugin-Linie darf nur gelöscht werden, wenn alle folgenden Nachweise
vorliegen:

1. Lifecycle ist `RETIRED`, und Support-, Unpublish- sowie Löschfrist sind
   abgelaufen.
2. Es gibt keine unterstützten Installationen und keinen notwendigen
   Migrationspfad mehr.
3. Persistierter Lernstand und globale Mastery bleiben unabhängig vom Plugin
   erhalten; nur linienbezogene, nachweislich entbehrliche Idempotenz- und
   Sessiondaten werden nach ihrer eigenen Aufbewahrungsfrist bereinigt.
4. Veröffentlichte Contract-Snapshots, Release Notes und Auditnachweise bleiben
   als unveränderliche Dokumentation erhalten.
5. Der dedizierte MCP-Origin, seine OAuth-Resource und die zugehörigen
   UI-Artefakte werden erst nach dem letzten unterstützten Client und nach
   Ablauf der dokumentierten Aufbewahrung entfernt. Der gemeinsam genutzte
   OAuth-Issuer auf `skillpilot.com` bleibt davon unberührt.

Eine zukünftige V2 ersetzt V1 niemals durch stilles Überschreiben. Beide Linien
haben getrennte Plugin-Identitäten, MCP-Origins, OAuth-Resources,
Skills, Snapshots, Telemetrie und Lebenszyklen.
