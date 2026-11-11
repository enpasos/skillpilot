## SkillPilot: Versionierungs- und Lebenszyklusplan für das OpenAI-Plugin {#sec:openai-plugin-versioning}

:::note{title="Geltungsbereich und Release-Einordnung"}
Verbindliche interne Architekturgrundlage für Versionierung, dedizierte hashgebundene MCP-Apps-Ressourcen, gebündelte Skills und den Lebenszyklus des OpenAI-Plugins. Die veröffentlichte Git-Beta `skillpilot-coach-v1` `1.1.2` und ihre Installationsbytes sowie die verworfene `1.0.0`-Reviewhistorie ([Review-Freeze-Historie](repo:docs/deploy/openai-plugin-v1-review-freeze.md)) bleiben unverändert archiviert. Der neutrale lokale Kandidat `1.1.3` (einschließlich des lokalen Handshake-Fixes `9c09821e96ab…` neben den unverändert bewahrten `12762009…`- und produktiv ausgerollten `08030…`-Bytes; Voice-Bildfolge weiterhin ohne Hostabnahme) ist Vorbereitung vor der ersten Verzeichniseinreichung — weder Deployment noch Portal-Veröffentlichung oder Clientabnahme.
:::

### Entscheidung vom 19. Oktober 2026: ein dauerhaftes neutrales Plugin {#sec:plugin-decision-2026-10-19 anchors="neubewertung-vom-19-oktober-2026-eine-dauerhafte-plugin-identität,entscheidung-vom-19-oktober-2026-ein-dauerhaftes-neutrales-plugin"}

Der Product Owner hat am **19. Oktober 2026** ein dauerhaftes Plugin **SkillPilot Coach** mit dem technischen Namen **`skillpilot-coach`** und einem neutralen öffentlichen MCP-Origin vor der neuen Verzeichniseinreichung festgelegt. Diese Entscheidung ersetzt sowohl die erste Empfehlung, `skillpilot-coach-v1` und dessen Host beizubehalten, als auch das frühere Modell einer eigenen Plugin-Identität pro Paket-Major.

:::table{cols="5.4cm,X"}
| Grenze | Dauerhafte Festlegung |
| --- | --- |
| Technischer Paketname | `skillpilot-coach` |
| Öffentlicher Anzeigename | `SkillPilot Coach` (<= 30 Zeichen) |
| Öffentlicher MCP-Endpoint & OAuth Resource/Audience | `https://mcp-openai.skillpilot.com/mcp` |
| Widget-Origin (`_meta.ui.domain`) | `https://mcp-openai.skillpilot.com` |
| Protected Resource Metadata | `https://mcp-openai.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Bestehender OAuth-Issuer | `https://skillpilot.com/api/openai/v1` |
| Aktueller interner Adapter | `/internal/openai/v1/mcp`, `contractMajor = 1` |
:::

Paket-SemVer, öffentliche Identität und fachlicher Toolvertrag sind entkoppelt: Künftige Paketversionen `2.x` können denselben Toolvertrag nutzen, und interne Workflowgenerationen erfordern keinen neuen öffentlichen Namen oder Origin, weil OpenAI Origin-Wechsel im Updateablauf veröffentlichter Plugins nicht unterstützt.

- **Begrenzter technischer Umbau & Desktop-CIMD:** Interner V1-Adapter, Scopes und Session-Gates bleiben erhalten (`v1` im OAuth-Issuer bezeichnet die bestehende Autorisierungsinstanz, keine Paket-Major-Vorgabe). MCP-URL, Resource/Audience, Widget-Origin, Metadata-URL, `/.well-known/openai-apps-challenge` und Edge-Host wechseln gemeinsam auf `https://mcp-openai.skillpilot.com` — mit genau einer aktiven Resource ohne Dual-Audience oder Alt/Neu-Dispatcher. Native Desktop-CIMD nutzt exakt den zur neuen MCP-URL gehörenden öffentlichen Client `https://chatgpt.com/oauth/codex/7yTcOAOqrumX/client.json` und Callback `http://127.0.0.1/callback/7yTcOAOqrumX` (dynamischer Port, PKCE `S256`), strikt getrennt vom vertraulichen Clientprofil ohne Fallback.
- **Cutover & Rollback (`AuthenticatedClientPolicy`):** Alte Chats sind ausdrücklich ausgeschlossen (keine Chat-Fortführung, Sessionmigration oder parallele Alt-MCP-Runtime erforderlich; dauerhafte Lernstände bleiben erhalten). Die OAuth-Resource ist Teil des Clientprofil-Fingerprints: Nach erfolgreicher Startvalidierung aktiviert `AuthenticatedClientPolicy` den neuen Fingerprint und sperrt den vorherigen ohne Grant-Umschreibung (alte und neue Instanzen dürfen beim Cutover nicht gleichzeitig dieselbe DB mit verschiedenen Profilen bedienen). Ein Rollback auf einen gesperrten Fingerprint wird verweigert und erfordert eine neue explizite `policyRevision`, erneute Autorisierung sowie Kompatibilität mit allen freigegebenen Live-Tooldefinitionen.
- **Spätere Tool-Evolution in einer Identität:** Paket, Skills, Server und einzelne Tooldefinitionen aktualisieren sich beim Provider asynchron; während der Prüfung einer neuen Definition kann die vorherige weiter aktiv sein. Inkompatible Toolwechsel nutzen deshalb eindeutig benannte Ersatzwerkzeuge oder kompatible Übergangsadapter, bis die freigegebenen Live-Definitionen das Entfernen erlauben (`clientInfo.version`, User-Agent und Prompttext steuern niemals Autorisierung oder Vertragsrouting).

### Unabhängige Versionsebenen und SemVer-Klassifikation {#sec:plugin-version-layers}

Keine einzelne Versionsnummer darf für mehrere Ebenen missbraucht werden:

:::table{cols="4.3cm,3.4cm,X"}
| Versionsebene | Beispiel | Bedeutung & Quelle der Wahrheit |
| --- | --- | --- |
| **Plugin-Identität** | `skillpilot-coach` | Dauerhafte öffentliche Verzeichnisidentität und stabiler MCP-Origin |
| **Plugin-Paketversion** | `1.1.3` | SemVer des Pakets aus Manifest, Skills und geprüften MCP-/UI-Metadaten |
| **MCP-Tool-Contract-Major** | `1` | Semantik und JSON-Schemas des internen Vertragsadapters (`v1`) |
| **MCP-Protokollversion** | datumsbasiert | Transport-/Handshake-Version zwischen Host und MCP-Server |
| **Server-Build** | Git-SHA / Buildnr. | Konkret deploytes Backend-Artefakt `skillpilot-server` |
| **UI-Artefaktversion** | `sha256-...` | Unveränderliche content-adressierte MCP-Apps-HTML/JS/CSS-Auslieferung |
| **Zustands-Schemaversion** | `3` | Internes Persistenzformat (über interne Datenmigrationen entkoppelt) |
| **Zustandsversion (`stateVersion`)** | `142` | Monoton steigende Revision des kanonischen Lernendenzustands über alle Sessions und WebGUI hinweg |
| **Workflow-Version** | `coach@2.3` | Gepinnte pädagogische Ablauf- und Entscheidungslogik einer Session |
| **Curriculum-Revision** | `curricula-sha256@...` | Gepinnte Lernziel- und Skill-Graph-Revision |
:::

**Draft vs. Published & SemVer-Schritte:**

- **Unveröffentlichte Arbeitsstände (`DRAFT`):** `contracts/drafts/openai/<plugin>/<version>-SNAPSHOT/` ist vor `Submit for Review` über `prepare` reproduzierbar fortschreibbar (Manifest trägt `<version>` ohne `-SNAPSHOT`); während eines laufenden Portal-Reviews schützt eine Review-Sperre Paket und Runtime. `contracts/published/openai/<plugin>/<version>/` und `release-index.json` entstehen ausschließlich nach bestätigtem Portal-Publish über den expliziten Schritt `record-published` und sind danach unveränderlich. Deterministische USTAR-Installationsarchive (`plugin-install-bundle`) und Verzeichnis-ZIPs hängen weder von lokaler `tar`-Version noch von `umask`, Dateirechten oder Symlinks ab und enthalten nie den Server.
- **Reiner `serverBuild`-Wechsel (kein Paket-Bump):** Reine Bugfixes, Performance-, DB- oder interne Sicherheitskorrekturen bei identischem sichtbarem Auth-, Tool-, Schema-, Skill- und UI-Vertrag (alle Contract-Tests bleiben grün).
- **PATCH (`x.y.z -> x.y.(z+1)`):** Präzisierung von Toolbeschreibungen, `SKILL.md` oder Annotationen auf bereits bestehendes Verhalten, kompatible UI-Korrektur unter neuer Hash-URI oder Listing-/Release-Notes-Korrektur.
- **MINOR (`x.y.0 -> x.(y+1).0`):** Rückwärtskompatible Erweiterungen (neues Tool, optionales Eingabefeld, Erweiterung in `extensions`, neuer Skill, neue UI-Ressource, additiver OAuth-Scope); der Live-Server wird **vor** dem Portal-Scan als Superset für Alt- und Neuvertrag deployt.
- **Inkompatible Änderungen:** Entfernen/Umbenennen von Tools oder Feldern, neue Pflichtfelder, Typ-/Semantikbrüche oder schreibende Umwandlung eines Read-only-Tools dürfen niemals ungeschützt live gehen; sie erfolgen über eindeutig benannte Ersatztools/Superset-Adapter oder eine explizite neue Vertragsgeneration. Skills liegen als versionsgeprüfter Dateibaum im Paket (`Skill-Contract-Lint` erzwingt existierende Toolnamen derselben Vertragslinie und reproduzierbare Hashes).

### Öffentliche Vertragsadapter, Envelopes und dedizierte MCP-Apps-UIs {#sec:plugin-envelopes-ui}

Öffentliche MCP-Schemas exportieren niemals rohe Domain- oder Persistenzklassen. Zustandsbezogene Antworten und schreibende Aufrufe verwenden explizite Versions- und Idempotenzfelder (`additionalProperties: false` im Kernschema, offene kompatible Erweiterungen unter `extensions`, strukturiertes Resultat plus knappe Textdarstellung, niemals interne Benutzer-IDs):

```json
{
  "contractMajor": 1,
  "learningSessionId": "sps_...",
  "stateVersion": 42,
  "stateSchemaVersion": 3,
  "workflowVersion": "coach@2.3",
  "curriculumRevision": "curricula-sha256@...",
  "currentStep": { "goalId": "..." },
  "allowedActions": ["submit_answer"],
  "extensions": {}
}
```

Schreibaufrufe übergeben `learningSessionId`, `expectedStateVersion` (Optimistic Locking gegen konkurrierende Transporte) und `clientRequestId` (idempotente Retries innerhalb des `PT1H`- und Revisionsfensters aus @ref{sec:openai-mcp-oauth-session}); gepinnte `workflowVersion`- und `curriculumRevision`-Stände halten laufende Sessions konsistent oder stoppen fail-closed mit `SESSION_VERSION_UNAVAILABLE`.

**Zwei dedizierte V1-MCP-Apps-Ressourcen (`text/html;profile=mcp-app`):**

1. `render_skillpilot_goal_visualization` (read-only) bindet über `ui.resourceUri` und `openai/outputTemplate` ausschließlich die aktuelle bild-only Ressource und wird je frisch freigegebenem `(goalId, stateVersion)`-Paar genau einmal aufgerufen (`expectedStateVersion = stateVersion`), während der vollständige Textpfad erhalten bleibt.
2. `start_skillpilot_memory_practice` (read-only) bindet ausschließlich die eigene interaktive Karteikarten-Ressource.
3. Das app-only Bewertungstool `review_skillpilot_memory_practice_card` sowie alle übrigen Fachtools bleiben UI-ungebunden (keine verschachtelten oder leeren Komponenten; autoritativer Zustand liegt ausschließlich im Backend; bei beschädigtem Hostzustand sicherer sichtbarer Fehlerzustand statt lokalem Weiterlernen).
4. **Passive Byte-Aufbewahrung ab erster Realauslieferung:** Jede content-adressierte URI (z. B. `ui://skillpilot/coach/1/sha256-<hash>/index.html`), die je einem realen Client angeboten wurde, bleibt mit byteidentischem Inhalt passiv lesbar, während im Tool-Descriptor ausschließlich die aktuelle aktive URI aus `release/line.json` gebunden ist.

### Kanonisches `contract-line/v1`-Schema, CI-Gates, Observability und Linienhistorie {#sec:plugin-lifecycle-ci}

Support-Lifecycle, Publikationsstatus und Startpolicy bilden drei unabhängige, serverautoritative Achsen (keine implizite Ableitung aus Kalenderdaten):

- **`supportLifecycle`:** `CURRENT` (primäre Linie) | `SUPPORTED` (voll unterstützt) | `DEPRECATED` (Nachfolger empfohlen) | `RETIRED` (beendet; erzwingt `UNPUBLISHED` + `BLOCK`).
- **`publicationStatus`:** `DRAFT` | `PUBLISHED` | `UNPUBLISHED`.
- **`newSessionPolicy`:** `ALLOW` (normaler Start) | `WARN` (erfordert veröffentlichten, geprüften nicht-null `successor` auf First-Party-Allowlist und ausdrückliche Nutzerwahl) | `BLOCK` (keine Session/Capability; mit geprüftem Nachfolger `MAJOR_UPGRADE_REQUIRED` als identifierfreier Handoff ohne Token-/ID-Übernahme, mit `successor: null` `TEMPORARILY_UNAVAILABLE`). `policyRevision` steigt monoton und invalidiert ältere Start-Capabilities sofort.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://skillpilot.com/schemas/openai/contract-line/v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "contractMajor",
    "policyRevision",
    "displayName",
    "supportLifecycle",
    "publicationStatus",
    "newSessionPolicy",
    "successor"
  ]
}
```

*(Vollständige Feld- und `allOf`-Bedingungen für `WARN -> successor != null` und `RETIRED -> UNPUBLISHED + BLOCK` werden durch die Release- und CI-Validierung gegen `$id` geprüft; die aktuelle V1-Konfiguration steht nach dem Web-first-Schnitt auf `policyRevision: 3`, `CURRENT`, `DRAFT`, `ALLOW`, `successor: null`.)*

- **Verbindliche CI/CD-Gates:** (1) Versions-, Namens- und Manifestgrenzen-Konsistenz, (2) automatischer `Contract-Diff` gegen veröffentlichte Snapshots (blockiert entfernte Tools/Felder, neue Pflichtfelder, Typ-/Enum-/Security-Brüche und veränderte unveränderliche UI-URIs), (3) `Skill-Contract-Lint` und reproduzierbare Bundle-Hashes, (4) `Contract-Testmatrix` aller nicht-`RETIRED` Linien samt Auth-Audience/Scope- und UI-Integritätstests sowie (5) Zustandsmigrations- und Rollbacktests.
- **Observability & Log-Datenschutz:** Protokolliert werden `contractMajor`, `pluginLine`, `serverBuild`, `toolName`, `status`, stabiler `resultCode`, Latenz sowie (sofern im versionierten Resultat vorhanden) `stateVersion`, `stateSchemaVersion`, `workflowVersion`, `curriculumRevision` und bei Writes `clientRequestId`. Die `learningSessionId` erscheint ausschließlich als gekürzter HMAC-SHA-256-Fingerprint und niemals im Klartext; hochkardinale Korrelatoren und Versionen sind reine Logfelder, während Metrik-Tags strikt auf `contractMajor`, `pluginLine`, `toolName`, `status` und `resultCode` begrenzt bleiben.
- **Historische Einordnung des abgelösten Mehr-Plugin-Linienmodells:** Der frühere Plan vom Juli–September 2026 sah vor, jede spätere entfernbare Major-Generation als eigene Plugin-Identität (`skillpilot-coach-v1`..`v9` auf `mcp-coach-v1..v9.skillpilot.com`, vgl. OpenAI-Forum-Anfrage vom 31. Juli 2026) mit eigenem Parallelbetrieb, optionaler expliziter Sessionmigration (`mig_...`) und späterem Unpublish/Delete zu führen; nie veröffentlichte Sprachhosts (`mcp-coach-de-v*`/`en-v*`) wurden bereits damals verworfen. Mit der Entscheidung vom 19. Oktober 2026 (@ref{sec:plugin-decision-2026-10-19}) bleibt die saubere interne Adaptertrennung (`v1`, später optional `v2` im selben `skillpilot-server`) erhalten, während nach außen dauerhaft genau **eine** Plugin-Identität (`skillpilot-coach` auf `https://mcp-openai.skillpilot.com/mcp`) geführt wird.
