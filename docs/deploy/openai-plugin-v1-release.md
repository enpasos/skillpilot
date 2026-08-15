# SkillPilot Coach v1: Release, Rollback und Stilllegung

**Stand:** 15. August 2026

**Status:** Portalstatus `Review`; noch nicht veröffentlicht; aktive
[Review-Sperre](openai-plugin-v1-review-freeze.md)

> **STOP:** Solange die Review-Sperre aktiv ist, sind die eingereichte V1 und
> ihr beobachtbares Produktionsverhalten unveränderlich. Insbesondere darf
> `prepare` nicht ausgeführt werden. `DRAFT` bezeichnet hier ausschließlich
> den noch nicht veröffentlichten Lifecycle-Status.

Dieses Runbook setzt den
[Versionierungs- und Lebenszyklusplan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
operativ um. Es gilt für `skillpilot-coach-v1`.

## 1. Feste Identität und V1-Vertrag

| Bestandteil | Verbindlicher Wert |
| --- | --- |
| Plugin-Identität | `skillpilot-coach-v1` |
| Anzeigename | `SkillPilot Coach v1` |
| aktueller Paketstand | `1.0.0` |
| Contract Major | `1` |
| Lifecycle-Policy | `policyRevision=4` |
| öffentlicher MCP-Endpunkt und OAuth Resource/Audience | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Protected Resource Metadata | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Domain-Challenge | `https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` |
| aktive MCP-Apps-UIs | genau zwei: Lernzielbild und Karteikartenlernen |
| Support-URL | `https://skillpilot.com/imprint` |
| Reviewvideo | `https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4` |
| Veröffentlichungsstatus | noch nicht veröffentlicht; interner Draft `1.0.0-SNAPSHOT` |
| Quellpaket | `ai/openai plugin/skillpilot-coach-v1/` |

Permanente SkillPilot-ID, CREATE/EXISTING, Providerhinweis sowie Curriculum,
Stage, Subjects, Profile und Personalisierung werden ausschließlich im
First-Party-WebGUI konfiguriert. **Lernen starten** / **Start learning** erzeugt
bei jedem Aufruf eine frische opake `learningSessionId` und öffnet einen neuen
Chat mit der vorbereiteten Startnachricht. OAuth autorisiert die feste App,
wählt aber keinen Lernenden aus.

Ohne aktuelle Startnachricht ruft der Coach kein SkillPilot-Werkzeug auf. Er
gibt nur einen kurzen Hinweis in der Unterhaltungssprache mit dem festen Link
`https://skillpilot.com/` aus und stoppt. Zu Beginn jedes Learner-Turns muss
`get_skillpilot_context` im aktuellen Assistant-Turn erfolgreich sein. Nach
einer erfolgreichen Mutation ist ihr vollständiger Nachfolgerzustand für den
Rest desselben Assistant-Turns autoritativ und wird nicht neu geladen. Auf
`SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` und
`SESSION_VERSION_UNAVAILABLE` gibt der Coach `instruction` unverändert aus.
Fehlt es, verwendet er den exakten Eintrag aus `instructions` für die letzte
autoritative `communicationLocale`, andernfalls für die aktuelle
Unterhaltungssprache. Die exakte `startUrl` wird nur ergänzt, wenn sie nicht
bereits in der Instruktion steht. Es folgen keine Fachantwort, kein Retry der
alten Session und kein OAuth-Reconnect; die Fortsetzung erfolgt über die
WebGUI und den dadurch geöffneten neuen Chat.

Der Draft bindet genau zwei aktive content-addressierte MCP-Apps-Ressourcen:

- `render_skillpilot_goal_visualization` bindet ausschließlich die aktive
  bild-only Lernzielressource;
- `start_skillpilot_memory_practice` bindet ausschließlich die aktive
  Karteikartenressource; die Kartenbewertung bleibt app-only und ungebunden.

Alle bereits an reale Test-Clients beworbenen Bild-Hash-URIs bleiben mit ihren
exakten Bytes passiv lesbar. Bei einer frischen `goalVisualization` plus
Renderer-Freigabe läuft der Renderer einmal als unmittelbar nächster
Werkzeugaufruf mit der unveränderten `goalId`; die
Top-Level-`stateVersion` wird in dessen Eingabe `expectedStateVersion`
kopiert. Eine alte oder bereits versuchte Freigabe wird nicht wiederverwendet.
Der Textpfad bleibt vollständig, auch wenn der Host die optionale UI nicht
darstellt.

Sessiongebundene Operationen und Write-Replays benötigen mindestens `PT1H`
Restlaufzeit; exakt eine Stunde ist gültig. Ein bereits committeter identischer
Write darf sein gespeichertes Resultat nur bei verfügbaren gepinnten
Workflow-/Curriculumversionen und unveränderter kanonischer Learner-Revision
replayen und führt keine Mutation erneut aus.

Für den kontrollierten Live-Test darf nur der First-Party-Launch das optionale
`diagnosticSessionTtlSeconds` akzeptieren. Das Feld ist ausschließlich bei
aktivem Diagnose-Gate, als ganze Zahl von `3601..86400` und höchstens bis zur
normalen `PT24H`-Laufzeit zulässig. Es gilt nur für die von diesem Request
erzeugte Session. Bereits der nächste Launch ohne Feld verwendet automatisch
wieder `PT24H`; die globale TTL wird für den Test nicht geändert.

Maschinenlesbare Quellen der Wahrheit sind:

- `.codex-plugin/plugin.json` für Paket-SemVer und Listing;
- `release/line.json` für Contract Major, Endpoint und Zustandsversionen;
- `release/lifecycle.json` für Support-, Publikations- und Startstatus sowie
  die monotone `policyRevision`;
- `contracts/drafts/openai/skillpilot-coach-v1/<version>-SNAPSHOT/` für den
  vor der Einreichung fortschreibbaren Draft; während eines Portal-Reviews ist
  dieser Snapshot durch die separate Review-Sperre eingefroren;
- `contracts/published/openai/skillpilot-coach-v1/<version>/` und
  `contracts/openai/skillpilot-coach-v1/release-index.json` ausschließlich für
  tatsächlich im OpenAI-Portal veröffentlichte Versionen.

Vor der Portal-Einreichung durfte derselbe unveröffentlichte Draft kohärent
aktualisiert werden. Seit **Submit for Review** ist auch dieser Draft operativ
eingefroren. Approval oder Rejection beendet die Sperre nicht automatisch;
maßgeblich ist ausschließlich das Verfahren in der
[Review-Sperre](openai-plugin-v1-review-freeze.md). Eine reale
Veröffentlichung versiegelt `1.0.0` anschließend dauerhaft.

## 2. Release vorbereiten

> Die folgenden Vorbereitungsschritte sind während der aktiven Review-Sperre
> nicht auszuführen. Sie gelten erst nach einer ausdrücklich dokumentierten
> Freigabe; `prepare` wird zusätzlich maschinell verweigert.

1. Release Notes, Lifecycle, Listing, Skill, Policy, Serververtrag und zentrale
   Dokumentation gemeinsam aktualisieren. Innerhalb des unveröffentlichten
   Drafts wird keine künstliche Patchversion erzeugt.
2. Die V1-URLs bleiben feste Vertragswerte im Backend-Artefakt. Geheimnisse und
   OAuth-Clientwerte bleiben ausschließlich in geschützter Konfiguration.
3. Generische und versionsspezifische Gates ausführen:

   ```bash
   ./scripts/verify_openai_v1_mtls_edge.sh --static
   npm --prefix "ai/openai app" test
   node scripts/check_openai_plugin_review_freeze.mjs
   node scripts/check_openai_plugin_versioning.mjs
   node scripts/check_skillpilot_coach_plugin.mjs
   node scripts/openai_plugin_release.mjs candidate
   ```

4. Den internen Draft erzeugen oder aktualisieren:

   ```bash
   node scripts/openai_plugin_release.mjs prepare
   ```

   Außerhalb einer Review-Sperre ersetzt `prepare` nur den unveröffentlichten
   Snapshot. Es ändert weder SemVer noch Published-Index und stoppt bei einer
   eingereichten, bereits veröffentlichten oder anderweitig gesperrten
   Version, unversionierten Plugin-Datei oder einem Symlink.
5. Quellen und Draft reproduzierbar prüfen:

   ```bash
   node scripts/openai_plugin_release.mjs verify
   npm --prefix app run check:docs-links
   npm --prefix app run check:docs-indexes
   git diff --check
   ```

6. Erst danach Backend und V1-Edge geordnet ausrollen: In der geschützten
   Backend-EnvironmentFile zunächst `observe` vorbereiten; CA-Bundle,
   root-eigene Modusdatei und Loopback-Verifier mit
   `install_openai_v1_mtls_edge.sh --mode observe` staged installieren und
   prüfen; anschließend die Nginx-Vorlage installieren. Der Installer editiert,
   testet oder reloadet Nginx niemals. Vor der Aktivierung folgen als root
   `verify_openai_v1_mtls_edge.sh --preflight --expected-mode observe` und ein
   explizites `nginx -t`; danach zuerst das Backend neu starten und erst dann
   Nginx reloaden. Abschließend den Runtime-Smoke und einen realen
   ChatGPT-Toolaufruf nachweisen. Der spätere Wechsel auf `enforce` folgt
   derselben EnvironmentFile → Installer → Preflight → `nginx -t` →
   Backend-Restart → Nginx-Reload →
   Runtime-/ChatGPT-Evidence-Reihenfolge.
7. Erst nach diesen Nachweisen die App-Metadaten aktualisieren und in einem
   frischen Chat erneut scannen.

## 3. Release-Acceptance

Vor einer Portalaktualisierung sind mindestens folgende Nachweise erforderlich:

1. Discovery, Domain-Challenge, OAuth/PKCE, Resource-/Audience-Prüfung,
   Callback-Allowlist, Scope-Fehler und Revocation sind grün; Geheimnisse
   erscheinen weder in Antworten noch Logs.
2. Der root-eigene und der Backend-mTLS-Modus stehen beide auf `enforce`.
   Ein externer `/mcp`-Aufruf ohne Clientzertifikat endet mit `403`; ein realer
   ChatGPT-Toolaufruf erhöht `mtls_edge_verified`, ohne einen Reject im
   Journal des mTLS-Verifiers oder einen Backend-Assertion-Reject
   (`mtls_edge_rejected`) für diesen Aufruf zu erzeugen. Metadata und
   Domain-Challenge bleiben ohne Clientzertifikat
   erreichbar.
3. CREATE und EXISTING, Providerhinweis und alle Level-2-Dimensionen
   funktionieren ausschließlich im First-Party-WebGUI.
4. Zwei aufeinanderfolgende WebGUI-Starts erzeugen verschiedene Sessionwerte
   und jeweils einen neuen Chat. Permanente SkillPilot-ID, OAuth-Werte und
   interne Lernziel-ID erscheinen nicht in der Startnachricht.
5. Ohne aktuelle Startnachricht erfolgt kein Toolaufruf, sondern nur der feste
   WebGUI-Hinweis. Mit Startnachricht läuft zu Beginn jedes Learner-Turns ein
   erfolgreicher aktueller Kontextabruf. Nach einer erfolgreichen Mutation
   wird ihr vollständiger Nachfolgerzustand im selben Assistant-Turn ohne
   redundanten Kontextabruf verwendet.
6. Die drei Session-Recovery-Codes ergeben ausschließlich die servereigene
   Instruktion und nötigenfalls die nicht duplizierte `startUrl`; Fachantwort,
   OAuth-Neuverbindung und Weiterarbeit mit der alten Session bleiben aus.
7. Chatseitig funktionieren nur die ausdrücklichen Level-3-Änderungen von Fokus
   und aktivem Ziel. Level 2 wird weder abgefragt noch mutiert.
8. `resources/list` enthält genau zwei aktiv gebundene UI-Ressourcen und alle
   beworbenen Vorgänger byte-identisch passiv. Bild- und Kartenwerkzeug binden
   ausschließlich ihre jeweilige aktive Ressource.
9. Das Lernzielbild erscheint nur bei frischer passender Projektion und
   Freigabe. Ohne Bild, bei Clusterzielen oder nach veralteter Freigabe gibt es
   keinen Renderer-Aufruf und keine leere UI; der Text bleibt vollständig.
10. Normales Karteikartenlernen verändert nur die Wiederholungsplanung und bleibt
   vom strengen Verified Recall getrennt. Orientierung, dialogisches Lernen,
   Mastery und Prüfung erfüllen ihre jeweiligen Evidenz- und Feedbackregeln.
11. Der Session-Guard akzeptiert exakt `PT1H`, lehnt Operationen und Replays
    darunter ab und replayt einen zulässigen identischen Write nur bei
    unveränderter kanonischer Learner-Revision ohne neue Mutation.
12. Der requestlokale Test mit `3660` Sekunden oder optional `5400` Sekunden
    zeigt den Guard-Übergang. `3600`, `86401`, Werte über der normalen Laufzeit
    und das Feld bei deaktiviertem Gate scheitern fail-closed. Der unmittelbar
    folgende Launch ohne Feld liefert wieder `PT24H`.
13. Sicherheits-, Datenschutz-, Rechts-, Client- und Verhaltensabnahme sind
    dokumentiert. Dieses Runbook behauptet keinen zusätzlichen
    ID-in-Komponente-Submission-Blocker; die V1-Identitätsverarbeitung liegt im
    First-Party-WebGUI.
14. Das freigegebene Reviewvideo ist ohne Anmeldung unter
    `https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4`
    erreichbar, liefert
    `video/mp4` mit Byte-Range-Unterstützung und stimmt vor dem Portal-Submit in
    Größe und SHA-256 exakt mit dem geprüften Repositoryartefakt überein. Ein
    Range-Abruf mit OpenAI-Origin und der zugehörige CORS-Preflight für `GET`
    und `Range` sind ebenfalls grün.

Erst nach erfolgreichem **Publish** im OpenAI-Portal wird der geprüfte Draft
unveränderlich registriert:

> Solange der maschinenlesbare Status noch `IN_REVIEW` lautet, verweigert der
> Release-Befehl auch `record-published`. Nach dem realen Portal-Publish muss
> der Product Owner zuerst ausdrücklich den begrenzten Übergang zur dauerhaften
> Published-Sperre autorisieren.

```bash
node scripts/openai_plugin_release.mjs record-published \
  --confirm-openai-published \
  --confirm-mtls-enforced-and-verified
```

Vorher darf `release-index.json` die Version nicht als veröffentlicht führen.

## 4. mTLS-Betrieb und CA-Pflege

Mindestens alle 90 Tage werden die offiziellen OpenAI-Root- und Connectors-
Intermediate-Dateien gegen die gepinnten Repositorydateien, Hashes,
Fingerprints, Gültigkeitszeiträume und die dokumentierte Kette geprüft. Es gibt
keinen automatischen Download in Produktion. Eine Änderung wird als
reviewpflichtige CA-Rotation gemäß der
[CA-Provenienz](https://github.com/enpasos/skillpilot/blob/main/deploy/openai-mtls/PROVENANCE.md) mit statischem Gate,
Preflight, Runtime-Smoke und realem ChatGPT-Positivtest ausgerollt; bei
überlappenden OpenAI-Ketten wird ein überlappender Trust-Cutover geplant.
Spätestens 90 Tage vor CA-Ablauf muss die Nachfolgestrategie bestätigt sein.
Im Regelbetrieb werden `mtls_edge_verified`, `mtls_edge_observed_no_cert` und
der Backend-Assertion-Counter `mtls_edge_rejected` überwacht. Zertifikats- und
No-Certificate-Rejects entstehen bereits vor Spring und werden deshalb über
das begrenzte Journal des mTLS-Verifiers sowie den öffentlichen `403`-Edge-
Status beobachtet. Fehlende verifizierte Aufrufe oder steigende Reject-Signale
werden vor dem nächsten Release geklärt.

## 5. Rollback innerhalb von V1

Ein Rollback ändert weder Plugin-Identität noch Contract Major, MCP-Origin oder
OAuth-Resource.

1. Schreiboperationen bei Datenintegritätsrisiko über den Kill-Switch
   deaktivieren.
2. Den letzten grünen Backend-/Edge-Build wiederherstellen.
3. Für eine veröffentlichte Version nur den unveränderten Snapshot unter
   `contracts/published/` verwenden.
4. Fehlerhafte veröffentlichte Skill- oder Listing-Metadaten mit einer neuen
   kompatiblen Patchversion beheben; eine publizierte Version nie neu befüllen.
5. OAuth-Tokens oder Lernsessionen nur bei einem konkreten Sicherheits- oder
   Datenintegritätsgrund pauschal widerrufen.

## 6. Deprecation, Unpublish und Löschung

Die Zustandsänderung beginnt in `release/lifecycle.json`:

- `SUPPORTED`: funktionsfähig und sicherheitsgepflegt, aber nicht empfohlen;
- `DEPRECATED`: funktionsfähig mit Nachfolger und veröffentlichten Fristen;
- `UNPUBLISHED`: keine Neuinstallation, bestehende Installationen bleiben bis
  zum dokumentierten Supportende funktionsfähig;
- `RETIRED`: kontrollierte Ablehnung ohne Verlust globalen Lernstands.

Unpublish ist kein technischer Shutdown. Eine Linie wird erst gelöscht, wenn
Support-, Unpublish- und Löschfristen abgelaufen sind, keine unterstützten
Installationen oder Migrationspfade verbleiben und globale Mastery unabhängig
erhalten bleibt. Veröffentlichte Snapshots, Release Notes und Auditnachweise
bleiben unveränderlich. MCP-Origin, OAuth-Resource und UI-Artefakte werden erst
nach dem letzten unterstützten Client entfernt.

Eine zukünftige V2 überschreibt V1 nie still. Beide Linien besitzen getrennte
Identitäten, Origins, Resources, Skills, Snapshots, Telemetrie und
Lebenszyklen.
