# SkillPilot Coach v1: OpenAI-Submission-Dossier

**Stand:** 9. September 2026 · **Nachfolgekandidat:** `1.1.0`

Für dauerhafte Verhaltensprüfungen vor und nach der Einreichung siehe
[automatische API-Dialogregression](../qa-ci/openai-dialog-regression.md).
Sie ergänzt die einmalige manuelle ChatGPT-Abnahme und ersetzt keine Host-Evidenz.

**Status:** lokal vorbereitete Neueinreichung, nicht eingereicht, nicht
genehmigt und nicht veröffentlicht. Der vorgelegte Portalexport nennt für
`1.0.0` ausdrücklich `REJECTED`, aber weder eine konkrete Ablehnungsbegründung
noch einen fehlgeschlagenen Test oder Reviewer-Trace. Die ausdrückliche
Product-Owner-Freigabe erlaubt die Weiterentwicklung als `1.1.0`; der
abgelehnte historische Snapshot bleibt unverändert. Siehe
[Review-Entscheidung](openai-plugin-v1-review-freeze.md).

Dieses Dossier und die erzeugten JSON-Dateien sind **keine Portal-Abgabe**.
Credentials, OAuth-Clientwerte, Länderfreigaben und rechtliche Attestierungen
bleiben ausschließlich im angemeldeten Portalprozess. Kein lokaler Befehl
bestätigt eine externe Einreichung, Veröffentlichung oder Abnahme.

## 1. Verbindliche Quellen

Unter `ai/openai plugin/skillpilot-coach-v1/` liegen:

| Quelle | Bedeutung |
| --- | --- |
| `.codex-plugin/plugin.json` | aktuelle Version, Listing, Rechtstext-URLs und Starter Prompt |
| `.mcp.json` | tatsächliche öffentliche MCP-URL |
| `submission/portal-metadata.json` | öffentlicher Supportlink und noch notwendige manuelle Schritte |
| `submission/review-cases.json` | Fixtures, wörtliche Benutzer-Turns, vollständige Musterantworten, Toolregeln, sichtbare Ergebnisse und ausführbare Testzuordnung |

Der frisch erzeugte Export unter
`contracts/drafts/openai/skillpilot-coach-v1/<Version>-SNAPSHOT/contract/contract.json`
liefert Tools, Schemas, Annotationen, Metadaten und UI-Ressourcen.
`scripts/openai_plugin_submission.mjs` erzeugt deterministisch:

- `submission/generated/portal-draft.json`: nicht geheime, am beobachteten
  Portalexport orientierte Angaben mit fünf positiven und drei negativen Fällen;
- `submission/generated/preparation.json`: Quellhashes, Ressourcenbindungen,
  Starter Prompt, interne Planfälle und offene Abnahme-/Portalschritte.
- `submission/generated/acceptance-guide.md`: vollständige Abnahmeanleitung
  mit Ausgangsdaten, geordneten Turns und Prüfkriterien für alle 14 Fälle;
- `submission/generated/trace-template.json`: leere Vorlage ohne beobachtete
  Ereignisse oder Freigaben; sie kann unverändert keine Abnahme bestehen.

Für den nächsten echten Test mit der
[erzeugten Abnahmeanleitung](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20plugin/skillpilot-coach-v1/submission/generated/acceptance-guide.md)
beginnen. Ergebnisse ausschließlich in einer separaten lokalen Kopie unter
`tmp/` dokumentieren. Der OpenAI-CI-Job stellt nach seinen erfolgreichen
Prüfungen nur diese vier unveränderten Vorbereitungsdateien als
`openai-submission-worksheet-<commit>` bereit, keine privaten Testaufzeichnungen.

Das ist eine Arbeits- und Vergleichsvorlage, **kein behauptetes offizielles
Portal-Importformat**. Es werden keine undokumentierten Portal-APIs verwendet.
Lokaler Contractexport und Draft-Erzeugung ändern weder Produktion noch Portal.

## 2. Nachgewiesene Mängel des abgelehnten Exports

Die bereinigte Befundliste steht in
`submission/history/rejected-1.0.0-export-audit.json`. Der private Originalexport
enthält OAuth- und Review-Zugangsinformationen und wird nicht eingecheckt.

- P3 hatte in `expected_output` dieselbe Toolliste wie in `tools_triggered`.
- P3 nannte in Antwort 2 die Scheitelpunktform, aber nicht `S(d|e)`.
- P4 erwartete volle Punkte ohne ausdrückliche Interpretation des Grenzwerts
  als maximal bedeckte Fläche. Die neue vollständige Abgabe ergänzt sie.
- P5 endete nach genau 300 Zeichen mitten im Satz/Wort.
- N1 bis N3 hatten kein ausgefülltes `expected_output`. Jeder neue Fall nennt
  sichere Reaktion, verbotene Aktion und Begründung.

Dies sind **keine bewiesenen Ursachen der Ablehnung**. Das Projekt begrenzt
neue Ergebnisfelder vorsorglich auf 300 Zeichen; diese aus dem Export
abgeleitete eigene Sicherheitsgrenze ist keine behauptete offizielle
Portalvorgabe. Der Generator schneidet Texte niemals automatisch ab.

## 3. Produkt- und Identitätsgrenze

Permanente SkillPilot-ID, `CREATE`/`EXISTING`, Providerhinweis und Level-2-
Konfiguration bleiben im First-Party-WebGUI. OAuth autorisiert die Verbindung;
erst die getrennte, frisch vorbereitete `learningSessionId` wählt Lernstand
und Kommunikationssprache. Permanente IDs gehören weder in Chat noch Portal.
Jeder **Lernen starten**-Vorgang erzeugt eine frische 24-Stunden-Session für
einen neuen Chat. Ungültige Sessions werden nicht durch OAuth-Reconnect oder
geratene IDs ersetzt; der bestehende Erneuerungsvertrag bleibt fail-closed.

Der Nachfolger enthält die bisherigen zwölf Tools plus
`resume_skillpilot_learning_plan` und
`switch_skillpilot_learning_plan_subject`. Die Tagesübersicht kommt über
`learningPlanToday` im vollständigen autoritativen Kontext. Ein separates
`get_skillpilot_daily_plan` gehört **nicht** zum Katalog.

Die kompakte Übersicht nennt offene Ziele je Fach und nur bei Bedarf
Rückstand oder nicht auswertbare Pläne. Fortsetzung und Fachwechsel verwenden
ausschließlich erlaubte serverseitige Optionen mit Versionsschutz. Ein Wechsel
zwischen bereits gewählten Planfächern erlaubt keine Änderung von Bundesland,
Schulstufe oder ausgewählten Fächern im Chat. Nach einer Mutation gilt deren
vollständiger autoritativer Nachfolgekontext; keine erfundenen Ziele,
doppelten Writes oder eigenständigen Fokusverengungen.

## 4. Portalablauf

1. Kandidaten prüfen, Produktion separat ausrollen und den tatsächlichen
   öffentlichen Endpunkt verifizieren. Ein lokaler Export beweist keinen Rollout.
2. **With MCP** und die Remote-URL aus `.mcp.json` verwenden; keine bestehende
   Developer-Mode-Integration-ID übernehmen. Die Paketquelle enthält keine
   `.app.json`-Referenz mehr.
3. Tools frisch scannen und Namen, Schemas, Annotationen, Security Schemes und
   Ressourcenbindungen gegen den aktuellen Export vergleichen, einschließlich
   der beiden Planwerkzeuge.
4. Exakte aktuelle Skillbytes über den angebotenen Import-/Uploadweg einbringen
   und den Snapshot kontrollieren. Die aktuelle offizielle Anleitung beschreibt
   auch per Scan importierte Skills; daher nicht pauschal behaupten, ein MCP-Scan
   könne nie Skills importieren. Nach Änderungen den alten Snapshot ersetzen.
5. Listing und Tests aus dem Draft übertragen. Starter Prompt aus
   `preparation.json` separat kontrollieren: Der untersuchte Export hatte
   dafür kein entsprechendes Top-Level-Feld. Keine alten IDs, Geheimnisse,
   Statuswerte, Attestierungen oder Demo-URLs kopieren.
6. Reviewerzugang nur im Portal hinterlegen und ohne MFA, SMS-/E-Mail-Bestätigung
   oder private Netzwerkverbindung testen. Zustandsbehaftete Fälle verwenden je
   einen neuen Wegwerf-Lernstand aus dem öffentlichen `CREATE`-Ablauf.
7. Sämtliche Fälle ausführen, Hostoberfläche und aktuelle Demo abnehmen,
   rechtliche Angaben freigeben und einen **frisch gespeicherten Portalexport**
   erneut vergleichen.
8. Erst nach ausdrücklicher Freigabe einreichen. Eine spätere Genehmigung ist
   noch keine Veröffentlichung; **Publish** bleibt eine eigene Aktion.

Die Mindestzahl fünf positiver und drei negativer Fälle sowie der aktuelle
Portalworkflow stehen in der
[offiziellen OpenAI-Einreichungsanleitung](https://developers.openai.com/plugins/deploy/submission).
Das ersetzt keine getestete SkillPilot-Hostabnahme.

## 5. Reviewfälle und zusätzliche Planfälle

Vollständige wörtliche Abläufe stehen ausschließlich in
`submission/review-cases.json`; diese Übersicht ist kein zweiter kopierter
Testbestand. Bei veränderten Layer-A-Inhalten wie Kartenzahl, Prüfungsaufgabe
oder Fokusoption wird das Fixture frisch validiert, nicht mit alten Zahlen erzwungen.

| Fall | Entscheidende Prüfung |
| --- | --- |
| P1 | englischer sessionloser Start: genau der kurze First-Party-Hinweis, keine Tools oder Lehre |
| P2 | Interesse allein beendet Orientierung nicht; persönliche Fortsetzung, frischer Kontext, autoritatives Ziel; freigegebenes Bild ohne Verlust des Lehrtexts |
| P3 | normale Übung ohne Mastery-Nachweis; alle acht Recallantworten einschließlich Scheitelkoordinaten, Antwortfreigabe und vollständiger geordneter Ergebnisbatch genau einmal |
| P4 | vollständige Aufgabe ohne Vorabhilfe; Evaluation erst nach vollständiger Abgabe, fünf Kriterien, 25/25 Punkte bei vollständiger Musterabgabe, Schwelle 13/25 |
| P5 | zunächst nur Fokusoptionen; nach Zustimmung frische erste Option mit vollständigem Payload, Mastery unverändert |
| N1 | synthetische nicht existente Session: `SESSION_REQUIRED`, lokalisierter Neustarthinweis, keine Mutation oder Lehre |
| N2 | neues Fach/neue Schulstufe nur im WebGUI; kein verdeckter Level-2-Wechsel |
| N3 | Hinweis oder Formel vor Prüfungsabgabe ablehnen, keine geschützte Evaluation oder Mastery |
| D1 | fachübergreifend korrekte knappe Tagesübersicht; Teilfehler nicht als vollständige Nullübersicht darstellen |
| D2 | erlaubte Planfortsetzung mit genau einem versionsgeschützten Write |
| D3 | Wechsel nur zu bereits gewähltem erlaubtem Planfach, ohne Level-2-/Mastery-Änderung |
| D4 | fehlender, blockierter oder nicht fortsetzbarer Plan: wahrheitsgemäßer Status, kein unerlaubter Write |
| D5 | reine Statusfrage: nur frischer Kontext und knappe Übersicht, kein Bild, Navigation oder Unterricht |
| D6 | ausdrückliche Pause: kurz bestätigen und stoppen, keine automatische Fortsetzung oder Mutation |

## 6. Automatisierung und Beweisgrenzen

```bash
node --test scripts/openai_plugin_submission.test.mjs
node scripts/openai_plugin_submission.mjs prepare
node scripts/openai_plugin_submission.mjs check
node scripts/openai_plugin_submission.mjs audit-export --export /exact/local/path/to/fresh-export.json
node scripts/openai_plugin_submission.mjs validate-trace --trace /exact/local/path/to/sanitized-trace.json
```

`prepare` benötigt einen zur Manifestversion passenden aktuellen Snapshot.
`--contract PATH` wählt einen Export mit benachbarter Snapshot-`plugin.json`;
`--out-dir PATH` trennt temporäre Arbeitsartefakte. Keine dieser Aktionen
rollt aus oder ruft das Portal auf. Der Exportvergleich meldet lediglich
abweichende Feldpfade und Fehlerklassen, niemals Credentials oder Feldwerte.

Vier Ebenen bleiben getrennt:

1. **Quellen/Export:** vollständige Fälle, Textbudgets, aktuelle Metadaten,
   exakte Quellhashes und Vergleich des gespeicherten Exports.
2. **Backend/Komponenten:** ausführbare MCP-/Session-/Capability- und
   Widget-Lebenszyklustests; eine Testzuordnung allein ist kein Testlauf.
3. **Modell-Replay:** tatsächliche Antworten, Werkzeugwahl und Reihenfolge mit
   Trace; nicht durch Suche nach Policytext oder Toolnamen ersetzbar.
4. **Realer ChatGPT-Host:** sichtbarer Text, Rendering, Interaktion und Fallback
   auf jeder zugesagten Oberfläche. Mobile Browserbreite ist keine native Abnahme.

`OpenAiSubmissionReviewReplayTest` führt Backendanteile von P1–P5/N1–N3 aus.
Er beweist weder die Ein-Satz-Antwort von P1 noch die Modellverweigerung von N3.
Der Planvertrag prüft unter anderem Teilpläne und Versions-/Idempotenzschutz.

`validate-trace` prüft alle 14 Fälle, Version, Suitehash, vollständige Benutzer-Turns,
Tools, Nicht-Aufrufe, Reihenfolge, Zählungen, erfolgreiche Ergebnisse, erwartete
Fehler und exakte Texte. Inhaltliche/visuelle Kriterien
benötigen zusätzlich zugeordnete menschliche Prüfung mit referenzierten
Ereignissen und Evidence-SHA-256. Fehlende Fälle/offene Kriterien lassen den
Befehl fehlschlagen. Das Format steht in `submission/README.md`.
Synthetische Traces bleiben synthetisch. Kein lokaler Check authentifiziert
von selbst eine Aufnahme oder führt einen LLM-Test aus.

## 7. UI, Demo und Hostabnahme

Zwei aktive MCP-Apps-Ressourcen bleiben getrennt: Lernzielvisualisierung und
privates Karteikartenlernen. Der Export enthält genaue Hashbindungen,
Widget-Domain und CSP; keine zusätzlichen Domains werden vorsorglich
freigegeben. Private Fragen/Antworten der normalen Kartenübung gehören nicht
in die Modellprojektion.

Die Testoberfläche des Nachfolgers ist zunächst **ChatGPT im Webbrowser**.
Für `1.1.0` wird kein bestandener Realhost-Test behauptet; native Desktop-,
iOS- oder Android-Unterstützung ist nicht zugesagt. Ein möglicherweise leeres
Widget nach Kontext und anschließendem Renderer ist eine zu prüfende Hypothese,
keine bewiesene Ablehnungsursache.

Das alte Reviewvideo bleibt ausschließlich historische `1.0.0`-Evidenz:
SHA-256 `20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb`,
11.104.503 Bytes, H.264/AAC, 1920 × 1080, 329,110 Sekunden. Content-addressierte
URL und Bytes bleiben unverändert. Es wird nicht automatisch in den neuen
Draft übernommen. Die aktuelle Demo muss auch Tagesübersicht, Fortsetzung und
Fachwechsel auf der zugesagten Oberfläche belegen. Sie enthält keine OAuth-
oder Review-Zugangsdaten. Freigegebene Demo-URLs sind öffentlich, nicht privat.

## 8. Unveränderte Datenschutz- und Freigabegrenzen

Der Nachfolger erweitert keine Datenschutz-, Retention- oder Plattformzusage.
Der aktive SkillPilot-Datenbank-Lernstand und zugehörige Sitzungen/Verbindungen
können über die Weboberfläche gelöscht werden. Nach 365 aufeinanderfolgenden
Tagen ohne erfolgreiche Tätigkeit werden sie zur automatischen Löschung
fällig und beim nächsten Löschlauf entfernt.

Als Tätigkeit zählen ausschließlich erfolgreiche ID-Erstellung, aktives
Laden/Fortsetzen über die Weboberfläche, serverseitig abgeschlossener Import/
Export signierter Lerndaten, erfolgreich gespeicherte Lernstandsänderung,
erfolgreich abgeschlossene SkillPilot-Sitzungs- oder Anbieter-Verbindungsaktion
sowie gültiger Coach-/MCP-Aufruf mit fachlich erfolgreichem Ergebnis.
Hintergrund-GET, SSE, OAuth-Token-Aktualisierung, bloße Dateiöffnung und nicht
abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht.

Lokale Dateien und Provider-Chats liegen außerhalb dieser Löschung.
Bestehende Sicherungen gehören nicht zum aktiven Lernstand; Löschfunktion und
365-Tage-Ablauf löschen sie nicht unmittelbar einzeln. Rechtliche Länder-,
Alters-/Guardian-, Datenschutz-, Terms-, Provider-, Retention- und
Revocation-Freigaben sowie die Portalattestierungen sind vor Einreichung
gesondert zu bestätigen. Der Generator bestätigt nichts davon.
