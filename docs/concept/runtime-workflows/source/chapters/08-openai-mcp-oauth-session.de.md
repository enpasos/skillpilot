## OpenAI-MCP-App: OAuth- und 24h-Lernsession-Bindung {#sec:openai-mcp-oauth-session}

:::note{title="Geltungsbereich und Stand"}
Verbindliche Identitäts- und Sitzungsbindung des mehrsprachigen OpenAI-MCP-Coaches (**SkillPilot Coach** / `skillpilot-coach` auf `https://mcp-openai.skillpilot.com/mcp` gemäß der Entscheidung vom 19. Oktober 2026 in @ref{sec:plugin-decision-2026-10-19}; historisch `skillpilot-coach-v1` auf `https://mcp-coach-v1.skillpilot.com/mcp` in der unverändert archivierten Git-Beta `1.1.2`). Für Plugin-Identität, Contract-Major und Lebenszyklus gilt ergänzend @ref{sec:openai-plugin-versioning}.
:::

### Architekturentscheidung: Zwei getrennte Berechtigungen {#sec:oauth-session-decision}

SkillPilot trennt App-Authentisierung und Lernendenadressierung strikt in zwei unabhängige Nachweise:

1. **OAuth authentisiert und autorisiert die MCP-Integration:** Die gehostete Verzeichnis-App nutzt genau einen vorregistrierten vertraulichen OAuth-Client (`client_id` + langes zufälliges `client_secret` via `client_secret_basic` am Token-Endpunkt, Authorization Code + PKCE `S256`). Für den autorisierten nativen Desktop-Pfad existiert daneben ausschließlich das exakt gepinnte öffentliche CIMD-Profil (`https://chatgpt.com/oauth/codex/7yTcOAOqrumX/client.json`, Callback `http://127.0.0.1/callback/7yTcOAOqrumX` mit dynamischem Port und PKCE `S256`), niemals als Fallback einer fehlgeschlagenen vertraulichen Authentisierung.
2. **Eine temporäre 24h-Lernsession wählt Lernenden und Interaktionssprache:** Erst ein ausdrücklich bestätigtes **Lernen starten** im First-Party-WebGUI erzeugt eine neue opake `learningSessionId` (`PT24H`) und öffnet einen neuen Chat. Die Zuordnung zur permanenten SkillPilot-ID und zur `communicationLocale` bleibt ausschließlich im Backend.

Für jeden fachlichen MCP-Toolaufruf müssen beide Bedingungen gleichzeitig erfüllt sein:

```text
gueltiges OAuth Access Token (exakte Resource + Read/Write-Scope)
AND
gueltige learningSessionId (aktiv + Restlaufzeit >= PT1H)
```

OAuth allein erzeugt weder eine Lernsession noch wählt es einen Lernenden aus; eine `learningSessionId` allein autorisiert keinen MCP-Aufruf.

:::table{cols="4.0cm,4.5cm,X"}
| Bindung | Transport | Serverseitige Bedeutung |
| --- | --- | --- |
| **ChatGPT/App -> SkillPilot** | OAuth-Code-Flow (`client_secret_basic` bzw. gepinntes Desktop-CIMD + PKCE `S256`), danach `Authorization: Bearer` | Genau das freigegebene Clientprofil darf ein auf die aktive MCP-Resource ausgestelltes Access Token beziehen und einlösen. |
| **Chat -> Session -> Lernender** | `learningSessionId` als Pflichtargument jedes fachlichen MCP-Tools | Diese gültige, im First-Party-WebGUI gestartete Session adressiert genau einen Lernendenzustand samt `communicationLocale`. |
:::

Die permanente SkillPilot-ID verlässt das Backend im MCP-Fluss niemals und erscheint weder im Chat noch in Toolargumenten oder -antworten.

### Verbindlicher Startablauf, Erneuerung und Diagnose-TTL {#sec:oauth-session-launch}

Jeder Klick auf **Lernen starten** im First-Party-WebGUI ist eine eigene atomare Startoperation:

1. Das WebGUI kennt die gewählte SkillPilot-ID, die `communicationLocale` und den konfigurierten Level-2-/Level-3-Kontext.
2. Es sendet genau einen Startrequest an das SkillPilot-Backend.
3. Das Backend wendet den typisierten Startkontext atomar auf den autoritativen Lernendenzustand an.
4. Es erzeugt in genau diesem Augenblick eine neue kryptografisch zufällige `learningSessionId`.
5. Es persistiert ausschließlich deren HMAC-Hash zusammen mit interner `learner_id`, `communication_locale`, `started_at` und absolutem `expires_at`.
6. Es liefert eine vorbereitete Startnachricht und die Ziel-URL zurück; das WebGUI öffnet den neuen Chat mit eingetragener Nachricht:

```text
Use SkillPilot Coach and continue.
learningSessionId: sps_<zufaelliger opaker Wert>
```

- **Jeder Start ist unabhängig:** Jeder Startrequest erzeugt eine neue `learningSessionId` — auch für denselben Lernenden, bei noch laufender älterer Session, bei geteiltem ChatGPT-Konto oder bestehender OAuth-Verbindung. Parallele Sessions bleiben unabhängig gültig; Nutzung verlängert `expires_at` niemals.
- **Erneuerung ausschließlich über WebGUI:** Ohne aktuelle Startnachricht ruft das Modell kein SkillPilot-Tool auf, sondern nennt lokalisiert `https://skillpilot.com/` und den WebGUI-Startweg. Liefert ein Tool `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED` oder `SESSION_VERSION_UNAVAILABLE`, gibt der Coach `instruction` unverändert aus (bzw. den exakten lokalisierten Eintrag aus `instructions`) und ergänzt `startUrl` nur, falls noch nicht enthalten — ohne Fachantwort, ohne Wiederverwendung der alten Session und ohne OAuth-Neuverbindung.
- **Gegatete First-Party-Diagnose-TTL:** Ausschließlich `POST /api/ui/learners/{skillpilotId}/openai/v1/launch` akzeptiert optional `diagnosticSessionTtlSeconds`, sofern `SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED=true` aktiv ist und der ganzzahlige Wert in `3601..86400` Sekunden liegt (nie über `PT24H`). Die Verkürzung (z. B. `3660` s für den Übergang unter `PT1H` nach ~1 Minute oder `5400` s für einen 90-Minuten-Soak) gilt isoliert für genau diese eine Session; jeder Request ohne Feld läuft automatisch wieder mit `PT24H`.

### MCP-Validierungsreihenfolge, Aktionshorizont und Verbote {#sec:oauth-session-validation}

Das Modell übernimmt `learningSessionId` unverändert als einfaches Pflicht-Stringfeld in jeden fachlichen Toolaufruf (Längen- und Formatregeln bleiben serverseitig, um Halluzinationen zu vermeiden), während der Connector `Authorization: Bearer <token>` außerhalb des Modellkontexts überträgt. Das Backend prüft strikt in dieser **8-stufigen Reihenfolge**:

1. gültiges OAuth Access Token;
2. exakte Resource/Audience (`https://mcp-openai.skillpilot.com/mcp`) sowie erforderlicher Read- oder Write-Scope;
3. vorhandene, syntaktisch gültige `learningSessionId`;
4. HMAC-basierte Auflösung in `openai_de_learning_session`;
5. Prüfung auf Ablauf und Widerruf;
6. Auflösung des autoritativen Lernendenzustands und Verfügbarkeit der gepinnten Contract-, Workflow- und Curriculumrevision;
7. Restlaufzeit `expiresAt >= now + PT1H` für jede Lese-, Schreib- oder Replay-Antwort (exakt `PT1H` ist zulässig; darunter Abbruch mit `SESSION_RENEWAL_REQUIRED`);
8. bei Writes Prüfung auf exakten idempotenten Replay (gleicher Toolname, kanonisch identische Argumente, identische `clientRequestId`, verfügbare gepinnte Versionen und `completedStateVersion == aktuelle Learner-Revision`; bei inzwischen fortgeschrittener Revision endet der Aufruf mit `STATE_VERSION_CONFLICT`).

**Ausdrücklich verbotene Fallbacks:** Eine fehlende oder ungültige `learningSessionId` darf niemals ersetzt werden durch ein OAuth-Subject, die „zuletzt erzeugte“ oder irgendeine andere Session desselben Lernenden, einen Pending Launch, eine im Chat genannte SkillPilot-ID oder eine beim OAuth-Callback implizit angelegte Session. OAuth-Callbacks, Token-Refreshes und MCP-Reconnects erzeugen, verlängern oder reaktivieren niemals eine Lernsession. Damit bleiben auch gemeinsame Familien- oder Schul-ChatGPT-Konten strikt getrennt.

### Persistenzschema, OAuth-/mTLS-Härtung und Fehlerverhalten {#sec:oauth-session-storage-errors}

Die Tabelle `openai_de_learning_session` bildet die alleinige Persistenzgrenze der kurzlebigen Sitzungsbindung (frühere OAuth-Subject-Schlüssel wurden verworfen):

:::table{cols="4.2cm,X"}
| Spalte | Bedeutung |
| --- | --- |
| `token_hash` | HMAC-Hash der ausgegebenen `learningSessionId` (Klartext wird nie gespeichert) |
| `learner_id` | Serverinterne Fremdschlüsselreferenz auf den Lernendendatensatz |
| `communication_locale` | Beim Start fixierte Sprache für Backendnutzdaten und sichtbare Coachantworten |
| `started_at` | Zeitstempel des bestätigten Klicks auf **Lernen starten** |
| `expires_at` | Absolute Ablaufzeit (`started_at + PT24H`, bzw. `+ diagnosticSessionTtlSeconds` im gegateten Test) |
:::

OAuth-Clientsecrets liegen ausschließlich in der geschützten Provider- und Serverkonfiguration (nie in Repo, Browser, Prompts, Argumenten, Antworten oder Logs). Offene Dynamic Client Registration (DCR) und ungepinnte CIMD-Dokumente sind deaktiviert; die exakte Callback-Allowlist, PKCE `S256`, Resource/Audience und Scopes werden erzwungen. Zusätzlich prüft der dedizierte MCP-vHost das OpenAI-Clientzertifikat (`observe`-Modus während der Integration: fehlende Zertifikate passieren bis OAuth, ungültige werden abgewiesen; `enforce`-Modus für erzwungene Kette, `clientAuth`-EKU und Connector-SAN; siehe [OpenAI-MCP-Clientbindung](repo:docs/security/openai-mcp-client-binding.md)). mTLS ersetzt weder OAuth noch die Lernsession.

:::table{cols="5.2cm,X"}
| Fehlersituation | Verbindliches Verhalten |
| --- | --- |
| **OAuth fehlt / ungültig** | Normale OAuth-Neuautorisierung durch den Host; erzeugt keine Lernsession |
| **`learningSessionId` fehlt / unbekannt / manipuliert / abgelaufen / widerrufen** | `SESSION_REQUIRED`; Coach gibt nur unveränderte `instruction` (ggf. mit `startUrl`) aus; keine Fachantwort, neuer WebGUI-Start + neuer Chat |
| **Restlaufzeit `< PT1H`** | `SESSION_RENEWAL_REQUIRED` (exakt `PT1H` bleibt gültig); neuer WebGUI-Start + neuer Chat |
| **Gepinnte Workflow-/Curriculumrevision nicht verfügbar** | `SESSION_VERSION_UNAVAILABLE`; fail-closed, neuer WebGUI-Start + neuer Chat |
| **Write-Scope fehlt** | Ablehnung vor jeder fachlichen Mutation |
| **Startkontext nicht atomar anwendbar / ungültige Diagnose-TTL** | Startrequest ablehnen; keine `learningSessionId` ausstellen |
:::

### Sicherheitsinvarianten und automatisierte Abnahmekriterien {#sec:oauth-session-invariants}

Die Implementierung wahrt **17 Sicherheitsinvarianten**: (1) serverseitige permanente SkillPilot-ID, (2) zufällige opake Session-IDs nur als HMAC-Hash, (3) absolute `PT24H`-Laufzeit außer im gegateten `3601..86400`-Diagnosefall, (4) keine Laufzeitverlängerung durch Nutzung, (5) `PT1H`-Aktionshorizont für neue Operationen, (6) identischer `PT1H`- und Revisionsschutz für idempotente Write-Replays, (7) frische unabhängige Session je Start, (8) keine Lernendenwahl durch OAuth allein, (9) keine MCP-Autorisierung durch Session allein, (10) `learningSessionId`-Pflicht für alle Fachtools, (11) kein OAuth-Subject-Lookup/-Fallback, (12) unveränderte Skill-Graph-/Frontier-/Mastery-Semantik, (13) strikte Clientprofil-Trennung (`client_secret_basic` bzw. exakt gepinntes Desktop-CIMD ohne Fallback), (14) Secret-Freiheit aller Artefakte/Logs, (15) feste sessiongebundene `communicationLocale`, (16) Pflicht zu erfolgreichem `get_skillpilot_context` zu Beginn jedes Learner-Turns und direkter Nutzung des Mutations-Nachfolgerzustands im selben Turn sowie (17) Verbleib von permanenter ID, Providerhinweis und Level-2-Konfiguration im First-Party-WebGUI.

Automatisierte Tests müssen **alle 20 Abnahmekriterien** belegen:

1. Ein Klick auf **Lernen starten** erzeugt genau einen Startrequest und öffnet den Chat.
2. Jeder Start erzeugt eine neue `learningSessionId`, auch für denselben Lernenden.
3. Parallele Sessions verschiedener Lernender laufen kollisionsfrei über dieselbe OAuth-Verbindung.
4. Die Startnachricht enthält genau eine `learningSessionId` und keine SkillPilot-ID.
5. Sämtliche fachlichen MCP-Toolschemas verlangen `learningSessionId`.
6. Gültiges OAuth-Token ohne `learningSessionId` wird abgewiesen.
7. Gültige `learningSessionId` ohne gültiges OAuth-Token wird abgewiesen.
8. Unbekannte, manipulierte, widerrufene oder abgelaufene Sessions scheitern ohne Fallback.
9. Erfolgreiche Aufrufe lösen den Lernenden ausschließlich über die explizite `learningSessionId` auf.
10. Wiederholte Toolnutzung verändert `expires_at` nicht.
11. Read- und Write-Scopes werden pro Tool strikt durchgesetzt.
12. Lernziel-, Frontier- und Mastery-Tests bleiben unverändert grün.
13. Deutsch und Englisch nutzen denselben V1-Toolvertrag gesteuert über `communicationLocale`.
14. Token-Requests mit falschem/fehlendem Secret, fremder `client_id`, falscher Callback-URL oder fremder Resource werden abgewiesen.
15. Authorization-Server-Metadaten veröffentlichen das aktive Produktionsprofil ohne offene DCR oder ungepinnte Public-Fallbacks.
16. Das Diagnose-Feld akzeptiert `3601` und `86400` bei aktivem Gate und lehnt `3600`, `86401`, Werte oberhalb `PT24H` sowie Anfragen bei deaktiviertem Gate ab.
17. Diagnose-Starts (`3660` / `5400`) wirken isoliert auf eine Session; der nächste normale Start hat wieder `PT24H`.
18. Jeder Learner-Turn beginnt mit erfolgreichem Kontextabruf (Sessionfehler blockiert jeden Fachtext), und Mutationen liefern den im selben Turn direkt maßgeblichen Nachfolgerzustand ohne Zusatzread.
19. Der öffentliche V1-Toolkatalog enthält keine sessionlosen Start-, Capability-, Curriculum- oder Personalisierungstools.
20. Write-Replays unterhalb `PT1H`, bei fehlender gepinnter Version oder nach fortgeschrittener kanonischer Learner-Revision werden trotz identischer `clientRequestId` abgewiesen.
