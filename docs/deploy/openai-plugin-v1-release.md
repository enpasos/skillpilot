# SkillPilot Coach v1: Release, Rollback und Stilllegung

**Stand:** 9. August 2026
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
| MCP-UI | drei aktive, getrennt hashgebundene Ressourcen für privaten Direktstart, Lernzielbild und Karteikartenlernen |
| Support-URL im OpenAI-Portal | `https://skillpilot.com/imprint` |
| Veröffentlichungsstatus | noch nicht veröffentlicht; interner Draft `1.0.0-SNAPSHOT` |
| Quellpaket | `ai/openai plugin/skillpilot-coach-v1/` |

Der noch unveröffentlichte V1-Draft bindet drei aktive, getrennte
content-addressierte MCP-Apps-Ressourcen: eine für den privaten Direktstart,
eine für das Bild des aktiven atomaren Lernziels und eine für interaktives
Karteikartenlernen im Chat. Die read-only Werkzeuge `open_skillpilot_start`,
`render_skillpilot_goal_visualization` und `start_skillpilot_memory_practice`
referenzieren jeweils ausschließlich ihre eigene Ressource über
`ui.resourceUri` und `openai/outputTemplate`. Der app-only Capability-Issuer
und das app-only Kartenbewertungswerkzeug bleiben ungebunden. Bereits an reale Test-Clients ausgelieferte
Hash-URIs bleiben mit ihren exakten Bytes als passive Ressourcen lesbar. Der Renderer
liefert der bild-only Komponente eine begrenzte strukturierte
`goalVisualization`-Projektion; nacktes MCP-`ImageContent` ist kein
Sichtbarkeitsvertrag. Die Kartenressource erhält einen begrenzten fälligen
Kartenstapel nur in privatem Resultat-`_meta`. Umdrehen und Vor-/Zurückblättern
bleiben lokal; nur `Noch nicht gewusst` oder `Gewusst` schreibt die angezeigte
Karte atomar über das app-only Werkzeug.
Coach-, Auswahl- und sonstige Zustandsabläufe bleiben Chat-/Tool-basiert und
ihre Werkzeuge UI-frei. Der Adapter wertet für die
Freigabe weder `openai/userAgent` noch eine andere Client-Oberflächenklasse aus.
Die V1-Linie besitzt keinen öffentlichen Kompatibilitätsalias; Plugin und
Directory verwenden ausschließlich den dedizierten V1-Origin. Die acht
neutralen Major-Hosts V2 bis V9 antworten bis zu ihrer jeweiligen Freigabe mit
`404`.

Diese passive Retention ist keine zweite aktive UI-Version: Kein Werkzeug darf
auf eine Vorgängerressource zeigen. Sie schützt ausschließlich den späteren
Template-Abruf aus Provider-Metadaten- und Chat-Snapshots. Nach einem
Draft-Update werden die Plugin-Metadaten zusätzlich aktualisiert und alle drei
aktiven URIs in einem neuen Chat geprüft.

Die maschinenlesbaren Quellen der Wahrheit sind:

- `.codex-plugin/plugin.json` für Paket-SemVer und sichtbare Metadaten;
- `release/line.json` für Contract Major, öffentlichen MCP-Endpunkt und
  Zustands-/Workflowversionen;
- `release/lifecycle.json` getrennt für den Supportzustand `CURRENT`,
  `SUPPORTED`, `DEPRECATED` oder `RETIRED`, den Publikationsstatus `DRAFT`,
  `PUBLISHED` oder `UNPUBLISHED`, die Startpolicy `ALLOW`, `WARN` oder `BLOCK`
  sowie die monotone `policyRevision` und einen optionalen Nachfolger;
  der vollständige CREATE-/In-Component-Direktstart verlangt Revision `2` und
  den unveränderlichen Providerhinweis `openai-provider-eligibility-v2`;
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
   Das gilt auch für den jetzt ergänzten privaten Direktstart und die
   MCP-Apps-Ressourcen: Da `1.0.0` noch nie veröffentlicht wurde, wird derselbe
   Draft aktualisiert und keine `1.0.1` erzeugt.
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
   prüfen. `resources/list` muss alle drei aktiven hashgebundenen UI-Ressourcen und
   alle passiv aufbewahrten Ressourcen enthalten. Bild-Renderer und
   Karteikarten-Start sowie der Direktstart-Öffner dürfen jeweils nur ihre
   eigene aktive Ressource über `ui.resourceUri` und `openai/outputTemplate`
   referenzieren; Capability-Issuer und Karten-Bewertungswerkzeug bleiben
   app-only und ungebunden. Der Direktstart darf die SkillPilot-ID niemals als
   Toolargument oder Toolresultat übernehmen: Bei EXISTING sendet nur das
   Widget sie nach expliziter Bestätigung an den capability-geschützten HTTPS-
   Endpunkt; bei CREATE liefert nur dessen direkte HTTPS-Antwort die neue ID an
   das flüchtige Recovery-DOM. Bei einem aktiven
   atomaren Ziel mit passendem kanonischem Bild muss der Renderer die
   strukturierte Projektion genau einmal an die bild-only Komponente liefern.
   Die Direct-Start-Golden-Journey umfasst mindestens vier getrennte Fälle:
   CREATE vergibt genau eine neue ID, verlangt deren Recovery-Bestätigung und
   schließt Curriculum und Personalisierung im Widget ab; eine vorhandene ID
   ohne Curriculum wird dort über `setCurriculum` eingerichtet; eine vorhandene
   ID mit Curriculum, aber offener Personalisierung wird dort vollständig über
   `setPersonalization` geführt; eine unbekannte syntaktisch gültige EXISTING-ID
   bleibt ohne Session terminal und identifierfrei `PROFILE_UNAVAILABLE`.
   Jeder Setup-Write verwendet die neueste `stateVersion` und einen exakt
   wiederholbaren `clientRequestId`; erst nach vollständigem Setup geht die
   unveränderte Startnachricht an den Host. Die normale Journey darf weder
   **SkillPilot öffnen** noch eine doppelte Setupfrage im Chat benötigen.
   Beim Kartenlernen müssen Vorder-/Rückseiten des begrenzten Stapels
   ausschließlich in Resultat-`_meta` zur Komponente gelangen; Blättern darf
   keinen Toolaufruf auslösen und der Review-Vertrag akzeptiert nur
   `not_known` oder `known`. Ohne gültiges Bild oder nutzbare Komponente muss der
   normale Chat- beziehungsweise Cockpit-Fallback erhalten bleiben.
8. **Public-Release-Gate prüfen.** Der interne Direktstart-Canary darf die
   neu vergebene oder vorhandene SkillPilot-ID in der privaten Komponente
   testen. Eine öffentliche Portal-Einreichung bleibt jedoch gesperrt, solange
   OpenAI die konkrete Verarbeitung der bearer-/credential-artigen
   SkillPilot-ID im Widget nicht schriftlich akzeptiert hat oder die
   öffentliche Architektur die ID nicht mehr verarbeitet. Ohne diesen Nachweis
   endet der Ablauf nach internem
   Deployment und Canary; es gibt weder Portal-Update noch Publish.
9. Erst nach bestandenem Public-Release-Gate die neue Plugin-Version im
   OpenAI-Portal aktualisieren. Die
   hostgenerierte `.app.json` im Quellpaket bleibt Test-Wiring; sie ist nicht
   das Veröffentlichungsvehikel.
10. Erst nachdem im OpenAI-Portal tatsächlich **Publish** erfolgreich
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
