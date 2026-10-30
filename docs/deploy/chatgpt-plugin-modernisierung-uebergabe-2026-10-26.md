# ChatGPT-Plugin modernisieren – Übergabe an einen neuen Chat

**Erstellt:** 26. Oktober 2026

**Kritisch geprüft:** 30. Oktober 2026, Repositorystand `7bcf2a644` vor diesem Dokumentationscommit

**Zuletzt dokumentierter Produktions- und Hostbefund:** 19./20. Oktober 2026

**Repository:** `/home/enpasos/projects/skillpilot`

**Grundlage:** Verbindliche Entscheidungen, aktueller Repository- und Artefaktabgleich sowie historische Betreiber- und Clientbefunde. Produktion und angemeldetes OpenAI-Portal wurden für diese Prüfung nicht erneut untersucht. Der lokale Kandidat hat sich seit dem letzten dokumentierten Deployment geändert.

## 1. Auftrag und Ziel

Wir modernisieren das ChatGPT-Plugin von SkillPilot. Ziel ist ein dauerhaftes Plugin **„SkillPilot Coach“**, ein zeitgemäßes Deployment und die Vorbereitung der offiziellen OpenAI-Veröffentlichung. Neben Desktop sollen **Web und Mobilgeräte unterstützt werden, soweit die tatsächliche OpenAI-Verteilung und die jeweiligen Clients das ermöglichen**.

Arbeitspräferenz aus dem bisherigen Chat: bevorzugt **GPT‑6.1 Sol Ultra** verwenden; **Astra Ultra**, wenn Sol für eine anspruchsvolle Prüfung nicht ausreicht.

Vor weiteren Änderungen Repository, Deployment und OpenAI-Verfahren erneut prüfen. SSH-, SCP- und Benutzerrechteprobleme gehören nicht zu dieser Übergabe.

## 2. Verbindlich getroffene Architekturentscheidungen

Wir haben uns ausdrücklich für **ein dauerhaftes Plugin über zukünftige Paket-Major-Versionen hinweg** entschieden.

| Bestandteil | Festlegung |
| --- | --- |
| Öffentlicher Name | **SkillPilot Coach** |
| Technischer Pluginname | `skillpilot-coach` |
| Dauerhafter MCP-Endpunkt / OAuth-Resource | `https://mcp-openai.skillpilot.com/mcp` |
| Widget-Origin | `https://mcp-openai.skillpilot.com` |
| Protected-Resource-Metadaten | `https://mcp-openai.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| OAuth-Issuer, unverändert | `https://skillpilot.com/api/openai/v1` |
| Interner MCP-Adapter | `/internal/openai/v1/mcp` |
| Interner Contract-Major | weiterhin `1` |
| Vorbereitete Paketversion | `1.1.3` |

Die Paketversion kann später beispielsweise auf `2.x` steigen, ohne ein neues öffentliches Plugin oder einen neuen öffentlichen Endpunkt anzulegen. **Paket-SemVer und interner API-/MCP-Vertrag sind unterschiedliche Dinge.** Änderungen an Tools müssen trotzdem zu den vom Host tatsächlich freigegebenen Definitionen passen.

Weitere ausdrückliche Entscheidungen:

- Die Coach-, MCP- und OAuth-Funktionalität bleibt im **bestehenden Spring-Boot-Prozess**. Keine neue parallele Coach-Serverarchitektur.
- **Alte ChatGPT-Chats müssen nicht erhalten oder migriert werden.** Neu verbinden und eine frische Lernsitzung starten ist akzeptiert.
- Dauerhafter Lernfortschritt bleibt erhalten.
- Beim Origin-Wechsel werden OAuth-Resource/Audience, Discovery, Widget-Origin und Edge-Konfiguration gemeinsam umgestellt.
- Keine parallelen alten und neuen öffentlichen MCP-Laufzeitendpunkte und keine doppelt akzeptierten Audiences.
- Provider-Isolation zwischen OpenAI, Claude usw. bleibt erhalten.
- Bereits veröffentlichte Pakete, historische Review-Artefakte und zuvor ausgelieferte hashadressierte UI-Ressourcen bleiben unverändert.

Der alte OpenAI-Review-Freeze ist aufgehoben. Die abgelehnte Version `skillpilot-coach-v1` **1.0.0** bleibt historische Evidenz, blockiert aber keine aktuelle Entwicklung. Die Historie liegt unter `contracts/openai/skillpilot-coach-v1/review-history/1.0.0-rejected/`.

Lokale Entwicklung und Vorbereitung, tatsächliches Deployment, Marketplace-Veröffentlichung, Portal-Einreichung und Portal-Veröffentlichung sind getrennte Vorgänge. Diese Übergabe erteilt keine zusätzliche Veröffentlichungsfreigabe.

## 3. OAuth und Transport

Für den neutralen Endpunkt wurde ein exakt festgelegtes natives Desktop-CIMD-Profil vorbereitet:

```text
Client-ID:
https://chatgpt.com/oauth/codex/7yTcOAOqrumX/client.json

Callback:
http://127.0.0.1/callback/7yTcOAOqrumX
mit dynamischem Loopback-Port

Client-Authentifizierung: none
PKCE: S256
Policy-Version: native-cimd-stable-origin-v1
```

Das ist das **native Desktop-Profil**. Der geltende
[SkillPilot-Vertrag](openai-stable-origin.md#verbindliche-werte) sieht für die
gehostete Directory-Anbindung ein eigenes `private_key_jwt`-Profil mit exakt
registriertem Callback vor. Transitional Basic bleibt standardmäßig aus.
Die tatsächlich verwendete Client-Identität, Redirect-URI und
Signaturschlüssel-Anbindung müssen separat festgestellt und geprüft werden.
Native Werte nicht als Hosted-Konfiguration übernehmen oder Hosted-IDs erraten.

Die am 30. Oktober gelesene [OpenAI-Submission-Dokumentation](https://developers.openai.com/plugins/deploy/submission#authentication-limitations)
akzeptiert `private_key_jwt` im Schema, beschreibt aber keine Einrichtung der
Signaturschlüssel. Sie fordert hierfür eine Klärung mit OpenAI. Die interne
Profilvorgabe belegt deshalb noch keine funktionierende Hosted-Verbindung.

Ein fehlgeschlagener vertraulicher Client darf nicht auf das öffentliche native Profil ausweichen. Der dynamische Port gilt nur für den exakt gebundenen Loopback-Host und Callback-Pfad, nicht als allgemeines Redirect-Wildcard.

Der Origin-Wechsel aktiviert einen neuen OAuth-Profil-Fingerprint und pensioniert den alten. Ein Rollback ist deshalb nicht bloß das Zurückkopieren einer alten Nginx-Konfiguration; dafür wären eine ausdrückliche neue Policy-Revision und frische Autorisierung nötig.

**mTLS im Modus `observe`** ist für die zunächst funktionierende Integration ausdrücklich akzeptiert. OAuth und Lernsitzungsisolation bleiben dabei verpflichtend.

## 4. Bereits erledigte Repository- und Deploymentarbeiten

Die Umstellung lief auf:

```text
Branch:
codex/openai-stable-origin-cutover

Wichtige Commits:
06ab6928e0bedf55e9b7342460c3d7f5d659d01c
fa5320f49a8ec3f0c477a2672ad7fc464d07a2b7
57f34b0e49665a1b62e24b99076f07712b2d72b0

Merge nach main:
d26799c9e0d38f7d2e60a6a25de6a15718a12069
```

PR: [enpasos/skillpilot#75](https://github.com/enpasos/skillpilot/pull/75)

Der Branch wurde veröffentlicht und am **20. Oktober** gemergt. Für den geprüften PR-Head waren **alle 16 CI-Jobs erfolgreich**. Lokale und serverseitige Source-Checkouts wurden anschließend auf `main` gebracht.

Der tatsächlich beobachtete produktive Backend-Build war zuletzt:

```text
fa5320f49a8ec3f0c477a2672ad7fc464d07a2b7
```

Die damals zwischen diesem Build und dem PR-Merge hinzugekommenen Änderungen
betrafen Dokumentationslinks. Diese Aussage gilt nur für diesen damaligen
Zeitraum. Spätere Commits haben Backend-/Widget-Abhängigkeiten und die aktiven
UI-Ressourcen verändert; ihr Produktionsrollout ist hier nicht belegt.

Beim Serverupdate wurden **52 lokal veränderte generierte Deck-Dateien erhalten und gesichert**. Bei weiterer Arbeit keine Benutzeränderungen mit Reset/Clean verwerfen.

Zuletzt bestätigte technische Ergebnisse:

- Neutraler MCP-Origin mit gültigem TLS erreichbar.
- Unauthentifiziertes `/mcp` antwortet erwartungsgemäß mit **401 und passender OAuth-Resource-Metadata-Challenge**.
- Backend-Readiness war `UP`.
- OAuth-Discovery und S256-Konfiguration geprüft.
- Alte öffentliche MCP-Hosts und nicht vorgesehene Aliase liefern `404`.
- Nginx-/mTLS-Vertragsprüfungen im Modus `observe` erfolgreich.
- Bestehende Claude-Anbindung und weitere Deployment-Smokes erfolgreich.
- Let's-Encrypt-Zertifikat für `mcp-openai.skillpilot.com` ausgestellt; damaliges Ablaufdatum **18. Januar 2027**.
- Automatische Zertifikatserneuerung war eingerichtet; Timer zuletzt aktiv und aktiviert.

Lokale Prüfungen umfassten unter anderem **446 Backend-Tests**, zusätzliche Node-/Python-Tests sowie Release-, Dokumentations- und Edge-Prüfungen. Das belegt technische Prüfungen, **keine vollständige ChatGPT-Clientabnahme**.

Diese Angaben sind der protokollierte Stand vom 20. Oktober, keine aktuelle
Live-Abnahme. PR #75 und sein Merge wurden bei der Dokumentenprüfung erneut
abgeglichen; die historischen Testzahlen sind dadurch nicht erneut ausgeführte
Tests. Ältere Abschnitte der Runbooks beschreiben teilweise noch die
Vorbereitung vor dem Cutover.

## 5. Paket, ZIP und Veröffentlichungsstatus

Die kanonische neue Pluginquelle liegt unter:

```text
ai/openai plugin/skillpilot-coach/
```

Der neue Skill liegt unter:

```text
ai/openai plugin/skillpilot-coach/skills/skillpilot-coach/SKILL.md
```

Das am 20. Oktober vorbereitete Submission-ZIP für **1.1.3** liegt noch unter:

```text
/home/enpasos/projects/skillpilot/tmp/openai-submission-skillpilot-coach-1.1.3/skillpilot-coach-1.1.3-submission.zip
```

Am 30. Oktober erneut als historische Datei geprüft:

```text
Größe: 102481 Bytes

SHA-256:
539644b1fad63810f1d8f420c21bfeb16a9303ae452386c8a2c947f2aa019209
```

Es enthält die neue Identität, den neutralen Endpunkt, die explizite OAuth-/CIMD-Präferenz sowie Review-Materialien mit **fünf positiven und drei negativen Testfällen**. Es entspricht jedoch **nicht mehr den aktuellen Quellen**: `audit-zip` weist diese alte Datei inzwischen zurück. Die gleiche Paketversion `1.1.3` identifiziert bei diesem unveröffentlichten Kandidaten noch keine identischen Bytes.

Der aktuelle, mit `openai_plugin_submission.mjs check` geprüfte Bericht unter
`ai/openai plugin/skillpilot-coach/submission/generated/submission-package.json`
nennt dagegen:

```text
Größe: 102788 Bytes
SHA-256: 4b7228edb860d714043841755036ffc844ecd02183962c5a1a8b6b1096e5f2cc
Status: PREPARED_NOT_SUBMITTED, ready: false
```

Für den Quellstand dieser Prüfung lautet der reproduzierbare lokale Einstieg:

```bash
node scripts/openai_plugin_submission.mjs check
node scripts/openai_plugin_submission.mjs package --out-dir tmp/openai-submission-handoff-review-2026-10-30
node scripts/openai_plugin_submission.mjs audit-zip --zip tmp/openai-submission-handoff-review-2026-10-30/skillpilot-coach-1.1.3-submission.zip
```

Alle drei Schritte wurden am 30. Oktober erfolgreich ausgeführt. Das neu
erzeugte ZIP hat die oben angegebenen aktuellen Bytes. Eine vollständige neue
Releaseprüfung einschließlich Backend-Build und sämtlicher Abnahmeprüfungen
ist damit nicht dokumentiert.

Bei später geänderten Quellen ein neues Arbeitsverzeichnis verwenden und den
dazugehörigen neuen Bericht prüfen. Der ZIP-Abgleich bestätigt reproduzierbare
Bytes, keine inhaltliche Vollständigkeit oder Host-Abnahme. Insbesondere nennt
die aktuelle `release-notes/1.1.3.md` noch den Zwischenhash `7cfc661…` und einen
Stand vor dem Origin-Cutover. Vor der nächsten Kandidatenfreigabe diese
Release-Notiz mit datierten Betriebsangaben und den tatsächlich gebundenen
Ressourcen abgleichen; anschließend die abhängigen Kandidaten-/Submission-
Artefakte neu erzeugen und prüfen.

Begleitdateien im Vorbereitungsverzeichnis:

```text
submission-package.json
preparation.json
acceptance-guide.md
submission-plugin.json
```

Zusätzlich wurde ein lokaler Marketplace-Export vorbereitet:

```text
tmp/openai-marketplace-skillpilot-coach-1.1.3/
```

Dateien unter `tmp/` sind lokale Arbeitsartefakte. Ihre Verfügbarkeit und Hashes vor weiterer Verwendung prüfen; bei einem neuen Checkout sind sie nicht automatisch vorhanden.

### Veröffentlichungsstatus nach vorhandenen Nachweisen

- Neues Paket: **vorbereitet, nicht offiziell im OpenAI-Verzeichnis veröffentlicht**.
- Vorbereitungsstatus: `PREPARED_NOT_SUBMITTED`.
- Neue Version **1.1.3 nicht als neue Git-Marketplace-Version veröffentlicht**.
- Das am 30. Oktober erneut gelesene [öffentliche Marketplace-Manifest](https://github.com/enpasos/skillpilot-chatgpt-marketplace/blob/main/release-manifest.json) nennt weiterhin `skillpilot-coach-v1` **1.1.2**.
- Deren Veröffentlichungscommit war `cf5e23a7908412f3f28a1a66485d0e106c346154`.
- Bereits veröffentlichte Versionen und Tags nicht überschreiben.
- `review.demo_recording_url` wurde bewusst leer gelassen: Das alte Review-Video darf nicht als Demo des neuen Kandidaten ausgegeben werden.
- Eine vollständige aktuelle Host-Abnahme und neue Demo fehlen im vorliegenden Nachweisstand.

Die lokalen Berichte belegen den Vorbereitungsstatus. Ob sich der tatsächliche
Portalbestand seit dem Betreiberbericht geändert hat, muss im angemeldeten
Portal geprüft werden.

Die Löschung des alten unveröffentlichten Portalentwurfs wurde vom Benutzer übernommen. Vor einer neuen Einreichung den tatsächlichen Portalbestand prüfen.

## 6. Submission-Verfahren und Plattformen

Die offizielle [Submission-Dokumentation](https://developers.openai.com/plugins/deploy/submission)
wurde am 30. Oktober erneut gelesen. Sie bestätigt den folgenden Ablauf für
den öffentlichen Remote-MCP-Weg:

1. Plugin-ZIP hochladen und Entwurf erstellen.
2. Metadaten und Skills prüfen.
3. MCP-Verbindung, Domainnachweis, OAuth und Tool-Erkennung vervollständigen.
4. Review-Unterlagen, Testzugang und aktuelle Demo ergänzen.
5. Zur Prüfung einreichen.
6. Nach Freigabe ausdrücklich veröffentlichen.

Die Dokumentation verlangt für Änderungen einer bestehenden MCP-URL weiterhin
Kontakt mit dem Support. Änderungen an Metadaten oder Skills benötigen ein
neues ZIP. Nach erster Veröffentlichung werden geeignete Änderungen am
gehosteten MCP-Server nach erfolgreichen Scans übernommen; neue oder
zurückgehaltene Tooldefinitionen sind dadurch nicht automatisch freigegeben.
Der Server muss die jeweils tatsächlich aktive Tooldefinition bedienen.
Siehe [Updates und MCP-Scans](https://developers.openai.com/plugins/deploy/submission#update-to-your-mcp-server).

Die bisherige direkte Git-/Desktop-Installation ist **kein Nachweis für Web- oder Mobile-Unterstützung**. Ziel für diese Oberflächen ist die gehostete Verteilung über OpenAI. Verfügbarkeit und tatsächliches Verhalten müssen pro Oberfläche getestet werden.

Noch offen:

- Domain-Challenge am neutralen Origin: `https://mcp-openai.skillpilot.com/.well-known/openai-apps-challenge`. Den im Portal tatsächlich vorgegebenen Origin und Token prüfen und exakt diesen Token als Klartext bereitstellen; keinen fremden Challenge-Token überschreiben.
- Tatsächliches Hosted-OAuth-Profil ermitteln und korrekt konfigurieren.
- Aktuelle Demo aufnehmen.
- Review-Testfälle tatsächlich durchführen und Ergebnisse dokumentieren.
- Dedizierten Reviewer-Testzugang mit Beispieldaten über die vorgesehenen sicheren Portalwege bereitstellen; für zustandsbehaftete Fälle die in der Abnahmeanleitung vorgesehenen frischen Wegwerf-Lernstände über `CREATE` verwenden. Keine echten Lernendenkonten, Secrets oder Lernsitzungs-IDs in ZIP/Git ablegen.
- Portal-Einreichung und spätere Veröffentlichung.
- Reale Web-/iOS-/Android-Abnahme, soweit verfügbar.

Der Benutzer hatte sowohl die Plattform-Submission-Seite als auch den persönlichen ChatGPT-Plugin-Upload geöffnet. Für den ersten Funktionstest wurde der **persönliche ZIP-Upload in ChatGPT** verwendet bzw. angeleitet. Dieser Test ersetzt keine Verzeichnisveröffentlichung.

Der frühere Desktop-Test zeigte eine funktionierende manuelle Marketplace-Aktualisierung, aber keine beobachtete automatische Aktualisierung. Daraus nicht ableiten, dass automatische Updates grundsätzlich unmöglich seien. Für neue Tests die tatsächlich installierte Version erfassen.

## 7. Ursprüngliche Coach-Probleme und korrigierte Regeln

Es gab drei Probleme:

- Nach dem ersten Lernziel fehlte das Bild zum nächsten Ziel, besonders im Desktop-Voice-Modus.
- Nach erfolgreichem Abschluss fragte der Coach offen nach einem neuen Thema, obwohl das Backend bereits den Nachfolger bestimmt hatte.
- ChatGPT schlug als nächste Benutzernachricht direkt die Lösung auf eine Coach-Frage vor.

Die Coach-Anweisungen wurden für den Kandidaten korrigiert:

- Bei gewöhnlichen Lernzielen und bestandenen Prüfungen Mastery nach ausreichender fachlicher Evidenz vor der Erfolgsbestätigung über den autorisierten Schreibpfad speichern. Orientierung und Verified Recall behalten ihre eigenen Zustimmungs- und Abschlussregeln.
- Erst nach erfolgreichem Speichern behaupten, das Ziel sei gemeistert und gespeichert.
- Den **exakten lokalisierten Titel des backendseitig bestimmten Nachfolgers** anbieten, sofern der Lernende keine Pause oder Beendigung gewählt hat.
- Auf die Antwort des Lernenden warten.
- Erst nach Zustimmung das Nachfolgebild anzeigen und mit dessen Unterricht beginnen.
- Keine erneute offene Themenauswahl, wenn der Nachfolger bereits feststeht.
- Keine selbst verfassten Antwortvorschläge, die eine Lösung vorwegnehmen.
- Neutrale Aktionen wie „Hinweis“, „mehr Zeit“ oder „Pause“ sind möglich.
- Eine vom Coach oder Host gelieferte Antwort ist keine eigenständige Leistungsevidenz.

Eine widersprüchliche alte Regel, die schon das Nennen des Nachfolgers vor Zustimmung untersagte, wurde beseitigt.

**ChatGPT-eigene Antwortvorschläge:** Dafür wurde kein belegter Abschaltmechanismus in unserer Integration gefunden. Der Benutzer hat hierzu bereits ein **Issue bei OpenAI** eröffnet. Nicht behaupten, unsere Skill-Anweisungen könnten native ChatGPT-Vorschläge zuverlässig deaktivieren.

Im damals besprochenen Screenshot wurde der konkrete Nachfolger bereits
korrekt angeboten und nach Zustimmung begonnen. Das ist die protokollierte
positive Beobachtung dieses einzelnen Übergangs; der Screenshot wurde bei
dieser Dokumentenprüfung nicht erneut als Host-Nachweis abgenommen.

## 8. Weiterhin offenes Problem: Nachfolgebild in Voice

Benutzerbericht aus dem am 20. Oktober untersuchten Durchlauf:

> Nach Abschluss des Lernziels erscheint kurz „Display the learning-goal image“, danach wird das Bild nicht angezeigt.

Das erste Bild funktioniert zumindest in manchen Durchläufen. Im Cockpit sind Lernfortschritt und zugehörige Bilder vorhanden. Textmodus wurde früher als funktionierend gemeldet; Voice bleibt ungeklärt. Exakte Clientversion und installierte Paketbytes des letzten Durchlaufs sind nicht vollständig dokumentiert.

### Entwicklung der Widget-Ressourcen

| Ressource | Änderung / Evidenz |
| --- | --- |
| `12762009bd8e…` | Ältere Ressource; frühere Voice-Fehler damit beobachtet |
| `08030bd956b6…` | Korrektur für bekannte Result-Envelopes und verspäteten `widgetState`; am 19. Oktober produktiv, Voice-Problem weiterhin vorhanden |
| `9c09821e96ab…` | Zusätzliche Korrektur einer Handshake-/Pending-Image-Race; am 20. Oktober produktiv beobachtet |
| `7cfc661b04b0…` | Späterer Repository-Zwischenstand nach SDK-Update; inzwischen ebenfalls unter `retained` |
| `870ddad58249…` | Am 30. Oktober im Repository aktive Goal-Ressource nach weiteren Abhängigkeitsänderungen; Produktions- und Host-Nachweis hier offen |

Die `08030…`-Korrektur akzeptiert die bekannten MCP-/`toolResponseMetadata`-Envelopes. Persistierter `widgetState` dient nur noch als Bootstrap-Fallback, damit er kein neueres Ergebnis mit dem ersten Bild überschreibt.

Die `9c098…`-Korrektur hält die Kompatibilitätszustellung auch bei fehlgeschlagenem Standard-Handshake offen. Ein noch ausstehendes Ergebnis soll nicht durch vorzeitiges Schließen verloren gehen.

Vollständiger zuletzt **produktiv beobachteter** Hash vom 20. Oktober:

```text
9c09821e96abadfccb08d07b62367d47963420c3a5cc51021ba801e2d6019fe4
```

Davon verschieden ist der am 30. Oktober in `OpenAiDeV1ContractMetadata` und
der aktiven HTML-Datei geprüfte Repositoryhash:

```text
870ddad5824924198038515ba9b051b1956a797267e5a24490e0589f8ee0e408
```

Der aktuelle Kandidat bindet diesen neuen Hash. Ein Test der alten
`9c098…`-Ressource nimmt ihn nicht mit ab. Paketversion, Quellrevision,
Backend-Build und tatsächlich geladene Ressourcen-URI gemeinsam erfassen.
Die aktuelle Ressourcenbindung steht in
`ai/openai plugin/skillpilot-coach/release/line.json`; die neue Bindung wurde
mit `ee91563f8` am 26. Oktober eingeführt.

Die vorhandenen Ressourcen bleiben unverändert erhalten. Eine weitere Korrektur muss einen neuen Hash und eine neue Ressourcen-URI bekommen.

### Serverseitige Evidenz

Bereits am **19. Oktober** war unter Build `fd1f419769c9…` die Ressource `08030bd956b6…` produktiv. Mastery wurde um **11:50:26.927 UTC** bei Zustand `142` gespeichert, der Nachfolger-Renderer war um **11:51:35.894 UTC** erfolgreich. Das fehlende Voice-Bild war in diesem Durchlauf also weder durch einen fehlenden Renderer-Aufruf noch durch die ganz alte Ressource erklärt.

Für den **20. Oktober** wurde anschließend beobachtet:

| Zeit, UTC | Beobachtung |
| --- | --- |
| 11:37:06 | Mastery gespeichert, Zustand `143`, Planübergabe |
| 11:37:44 | Kontext bietet Bild an |
| 11:37:48 | Aktive UI-Ressource `9c098…` ausgeliefert |
| 11:37:53.474 | Renderer erfolgreich für Zustand `143` |
| 11:47:18.683 | Späterer Mastery-Schritt auf Zustand `144` |

Nach diesem letzten Schritt war im damals untersuchten Log **kein weiterer Kontext-/Rendereraufruf** sichtbar.

**Diese beiden Abläufe nicht vermischen:** Für Zustand `143` ist ein erfolgreicher Renderer belegt. Für die spätere `144`-Sequenz fehlt dieser Nachweis.

Der Benutzer kennt die genaue Uhrzeit nicht mehr und bezeichnet den Fehler als seine letzte Aktivität im betreffenden Chat.

### Betroffene Lernziele und Bildprüfung

Das zuletzt gezeigte Nachfolgethema war:

```text
Druck in Flüssigkeiten und Gasen qualitativ beschreiben
Goal-ID: 5308de76-79f0-44f4-8cb7-fc9de4772217
```

Das vorherige Thema:

```text
Aggregatzustandsänderungen im Teilchenmodell deuten
Goal-ID: 873c6371-4ffb-582b-8d8d-3f45f968ba08
```

Die öffentlichen JPEGs waren erreichbar und dekodierbar: **HTTP 200, 2752 × 1536 Pixel**. Auch lokale Chromium-Tests mit der tatsächlich ausgelieferten UI und dem Druck-Bild waren erfolgreich.

Öffentliche URL des Druck-Bildes:

```text
https://skillpilot.com/assets/goal-visualizations/physik/5308de76-79f0-44f4-8cb7-fc9de4772217/5308de76-79f0-44f4-8cb7-fc9de4772217.jpg
```

**Entscheidende Evidenzgrenze:** Ein erfolgreicher Renderer, eine Ressourcenabfrage oder ein HTTP-200-Bild beweist nicht, dass ChatGPT das Widget ausführt und sichtbar darstellt. `goalVisualizationOffered=false` in der Renderer-Antwort ist erwartetes Verhalten des Präsentationsergebnisses, kein Beleg für ein fehlendes Bild.

Frühere OAuth-401- und `notifications/initialized`-Warnungen erklären den erfolgreichen Renderer nicht automatisch.

## 9. Zusätzlich reproduzierter Höhenfehler – noch nicht behoben

Eine unabhängige Untersuchung mit Sol und Astra reproduzierte einen konkreten Fehler im Kompatibilitätspfad:

- Bei erfolgreichem Standard-MCP-Apps-Handshake meldet die UI eine Höhe von **0 → 380 px**.
- Bei abgewiesenem/fehlendem Handshake kann das Bild über `window.openai.toolOutput` dennoch korrekt ankommen und laden.
- Das innere Element ist dann sichtbar und etwa 380 px hoch.
- Es erfolgt aber **keine Höhenmeldung an den Host**.
- Ein äußerer Frame mit Anfangshöhe 0 bleibt dadurch unsichtbar.

Das ist ein **lokal nachgewiesener Fehler**, aber **noch nicht die nachgewiesene Ursache des konkreten Voice-Vorfalls**. Es ist nicht belegt, dass dieser Voice-Durchlauf genau diesen Handshake-/Frame-Zustand hatte.

Im am 30. Oktober geprüften Quellcode fehlt weiterhin eine
Kompatibilitäts-Höhenmeldung; die Bridge verwendet den Standard-SDK-Pfad mit
`autoResize`. Die damalige Messung `0 → 380 px` stammt aus der älteren
`9c098…`-Untersuchung und ist keine neue Browsermessung der `870ddad…`-Datei.

Möglicher Ansatz:

- Die am 30. Oktober erneut gelesene [Component-Bridge-Referenz](https://developers.openai.com/plugins/reference#windowopenai-component-bridge) nennt `window.openai.notifyIntrinsicHeight(...)` zur Höhenmeldung, zeigt dort aber keine vollständige Signatur. Vor Umsetzung Signatur und verfügbare Hostfähigkeit prüfen; den Standard-MCP-Apps-Pfad bevorzugen.
- Bei fehlender nativer Größenmeldung einen zentralen, fähigkeitsabhängigen Ersatzpfad verwenden.
- Tatsächliche äußere Frame-Höhe testen, einschließlich verzögertem Ergebnis, Bildwechsel und Resize.
- Keine weiteren pauschalen Zeitlimits oder Voice-/User-Agent-Sonderfälle einbauen.

Für diesen Befund wurde **noch kein weiterer Bildfix implementiert**.

Lokale Diagnoseartefakte:

```text
tmp/voice-pressure-runtime-audit/evidence.json
tmp/voice-pressure-runtime-audit/audit.mjs
tmp/voice-pressure-runtime-audit/native-pressure-build-query.png
```

Diese ignorierten Dateien sind historische lokale Diagnosehilfen. Das
`audit.mjs` liest die aktive HTML-Datei, erwartet aber fest den alten Hash
`9c098…`; gegen den heutigen Checkout bricht es deshalb bereits vor dem
Bildtest ab. Für eine erneute Reproduktion eine eigene Auditkopie ausdrücklich
an den aktuellen Hash und ein neues Ausgabeverzeichnis binden und den äußeren
Frame vermessen. Das Skript überschreibt sonst die alten Ergebnisse und
Screenshots. Bilddatei und Netzwerkzustand als weitere Testeingaben erfassen.

Noch benötigt wird eine zusammenhängende Beobachtung desselben Versuchs:

```text
Renderer-Ergebnis
→ Ergebnis im Client angekommen?
→ Bildanfrage / Status
→ image load oder error
→ gemeldete Höhe
→ tatsächliche äußere Frame-Höhe / Sichtbarkeit
```

Ein bereinigter Nginx-Auszug wurde angefragt, aber noch nicht geliefert:

```bash
sudo awk '$7 ~ /^\/assets\/goal-visualizations\// {print $4,$5,$7,$9}' /var/log/nginx/access.log | tail -n 40
```

Dabei Cache und mögliche Cockpit-Aufrufe berücksichtigen; nicht jeden Bildabruf automatisch dem ChatGPT-Widget zuordnen. Ein fehlender Serverabruf beweist wegen Cache oder einer vorgelagerten Blockade nicht, dass der Client keinen Ladeversuch unternommen hat.

## 10. Wichtige Dateien, Werkzeuge und Runbooks

Widget:

```text
ai/openai app/widget/src/goal-visualization-main.ts
ai/openai app/widget/src/goal-visualization-bridge.ts
ai/openai app/widget/src/goal-visualization.ts
```

Backend:

```text
backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/
```

Dort insbesondere `OpenAiDeV1ContractMetadata`, `OpenAiDeV1McpContractAdapter` und die Kontextprojektion prüfen.

Release-Werkzeuge:

```text
scripts/openai_plugin_release.mjs
scripts/openai_plugin_submission.mjs
scripts/openai_marketplace_release.mjs
scripts/check_skillpilot_coach_behavior.mjs
```

Verbindliche Dokumentation, Pfade relativ zum Repository:

```text
AGENTS.md
docs/deploy/openai-stable-origin.md
docs/concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md
docs/deploy/openai-personal-marketplace-release.md
docs/deploy/openai-plugin-v1-submission.md
docs/deploy/openai-plugin-v1-release.md
docs/deploy/openai-native-cimd.md
docs/deploy/claude-beta-chatgpt-release-strategy.md
```

Einige Dateinamen und historische Abschnitte enthalten weiterhin `v1`. **Die aktuelle Entscheidung für `skillpilot-coach` und `mcp-openai.skillpilot.com` hat Vorrang vor historischen Beispielen.** Insbesondere alte Client-IDs, Endpunkte, ZIP-Namen und Demo-Belege nicht ungeprüft übernehmen.

Offizielle Dokumentation für die nächste Prüfung:

- [Submission](https://developers.openai.com/plugins/deploy/submission)
- [Component Bridge](https://developers.openai.com/plugins/reference#windowopenai-component-bridge)
- [ChatGPT UI](https://developers.openai.com/plugins/build/chatgpt-ui)
- [Troubleshooting](https://developers.openai.com/plugins/deploy/troubleshooting)

Submission und Component Bridge wurden am 30. Oktober erneut geprüft.
ChatGPT UI und Troubleshooting bleiben weiterführende Referenzen der damaligen
Untersuchung; ihre aktuellen Inhalte wurden hier nicht erneut ausgewertet.

## 11. Empfohlene Fortsetzung

Die verbindliche [Veröffentlichungsreihenfolge](claude-beta-chatgpt-release-strategy.md)
bleibt **Claude-Beta → stabiler gemeinsamer Kandidat → fokussierte
ChatGPT-Integrationsabnahme → Einreichung**. Die ausdrücklich autorisierte
Desktop-/Git-Arbeit und die Untersuchung beobachteter Fehler können parallel
fortgesetzt werden. Für die Veröffentlichungsabnahme den unter Claude
bewährten gemeinsamen Stand festhalten und durch den tatsächlichen
ChatGPT-Adapter testen; Providerpakete und Hostnachweise bleiben eigenständig.

1. Vor weiterer Umsetzung Repository, Deployment und Paket erneut abgleichen. Die lokalen Angaben wurden am 30. Oktober geprüft; die letzten Produktions-/Hostbefunde stammen vom 20. Oktober.
2. Bildvorfall zeitlich und nach Zustand zuordnen; erfolgreichen Renderer bei `143` und fehlenden späteren Aufruf bei `144` auseinanderhalten.
3. Die reproduzierte fehlende Höhenmeldung gezielt beheben, falls die aktuelle Implementierung sie noch enthält, und mit echten Frame-Höhen testen. Den Voice-Zusammenhang weiterhin gesondert nachweisen.
4. Bei Widgetänderungen neue hashadressierte Ressource erzeugen und historische Bytes erhalten. Veraltete Release-Notiz berichtigen und abhängige Kandidaten-/Vertrags-/Submission-Artefakte passend aktualisieren und prüfen. Einen zusammengehörigen Stand tatsächlich deployen, bevor dessen Host-Abnahme beginnt.
5. Frische Installation und neuen Chat mit **mindestens zwei aufeinanderfolgenden Lernzielen** testen: Text und Voice, sichtbare Bilder, Mastery-Persistenz, korrekter Nachfolger und Sitzungsfortsetzung. Geladene Version/Ressource sowie OAuth-Verbindung und Token-Erneuerung erfassen.
6. Aktuelle Demo und echte Abnahmeprotokolle erstellen. Erwartete Ergebnisse nicht als bereits ausgeführte Tests eintragen.
7. Bei beauftragter Portalvorbereitung den tatsächlichen Entwurf prüfen und Hosted-OAuth einschließlich Schlüsselanbindung, Domain-Challenge und MCP-Erkennung vervollständigen.
8. Nach stabiler gemeinsamer Basis und belegter ChatGPT-Abnahme die jeweils autorisierte Einreichung und Veröffentlichung getrennt durchführen.
9. Web und Mobilgeräte tatsächlich testen, bevor Unterstützung als bestätigt ausgewiesen wird.

## 12. Status auf einen Blick

| Bereich | Belegter Stand und zeitliche Grenze |
| --- | --- |
| Dauerhafte Plugin-/Endpoint-Architektur | Festgelegt und implementiert |
| Neutraler produktiver Origin | Am 20. Oktober umgestellt und technisch geprüft; heutiger Betrieb nicht erneut geprüft |
| Repository-Umstellung | PR #75 gemergt; 16 erfolgreiche Jobs des damaligen PR-Heads am 30. Oktober bestätigt |
| Neues Paket 1.1.3 | Aktuelle Quellen und neu erzeugtes ZIP am 30. Oktober abgeglichen; weiterhin `PREPARED_NOT_SUBMITTED` |
| Altes ZIP `539644…` | Historisch erhalten; aktueller ZIP-Abgleich weist es zurück |
| Aktive Goal-Ressource | Repository `870ddad…`; letzter dokumentierter Produktionsbefund `9c098…` |
| Release-Notiz 1.1.3 | Nennt noch Zwischenstand; vor nächster Kandidatenfreigabe mitsamt abgeleiteten Artefakten aktualisieren |
| Neue Git-Marketplace-Veröffentlichung 1.1.3 | Öffentliches Manifest am 30. Oktober weiterhin bei 1.1.2 |
| Offizielle OpenAI-Veröffentlichung | Im Nachweisstand nicht erfolgt; Portal nicht erneut geprüft |
| Konkreten Backend-Nachfolger anbieten | Aktuelle Anweisungen geprüft; historisch berichteter positiver einzelner Screenshot |
| ChatGPT-eigene Lösungsvorschläge abschalten | Kein belegter Mechanismus; Benutzer-Issue bei OpenAI |
| Voice-Nachfolgebilder | Weiterhin offen |
| Fehlende Höhenmeldung im Kompatibilitätspfad | Lokal reproduziert, noch nicht behoben; Voice-Ursache unbewiesen |
| Vollständige Host-Abnahme und aktuelle Demo | Offen |
| Web-/Mobile-Unterstützung | Ziel der gehosteten Verteilung; tatsächliche Abnahme offen |
