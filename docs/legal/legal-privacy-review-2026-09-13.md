# Rechtstexte: Abgleich vom 13. September 2026

## Umfang und Status

Nutzungsbedingungen **1.1.0** und allgemeine Datenschutzerklärung, jeweils DE/EN,
wurden mit dem aktuellen Code und der verbindlichen Claude-first-Strategie
abgeglichen. Dies ist eine redaktionelle und technische Best-Effort-Prüfung,
keine anwaltliche Freigabe und kein Nachweis bereits erfolgter Veröffentlichung.

Kanonische Texte liegen in `app/src/utils/legalViewCopy.ts` und
`app/src/utils/privacyViewCopy.ts`. Die statische, ohne JavaScript lesbare Seite
`app/public/privacy/index.html` wird aus derselben Datenschutzkopie erzeugt:

```bash
npm --prefix app run build:privacy-notice
npm --prefix app run test:legal-terms
npm --prefix app run test:ai-transparency-ui
```

Der Versionswechsel verlangt beim nächsten regulären First-Party-Start eine
erneute Annahme; er beendet keine laufenden Chats und ist keine rückwirkende
Einwilligung in optionale Verarbeitungen. Die Tests für neue und alte
Zustimmungsstände bleiben versionsgebunden.

Lokal geprüft: Terms-/Datenschutztests einschließlich statischem DE/EN-Abgleich,
KI-Transparenz-UI und Inventar, TypeScript, gezieltes ESLint und sieben betroffene
Start-/Trainer-UI-Regressionen. Die Seiten `/privacy` und `/legal` wurden in
beiden Sprachen bei 390 und 1280 Pixeln ohne horizontalen Überlauf geprüft;
die statische Datenschutzseite zusätzlich bei deaktiviertem JavaScript.
OpenAI-Historiencheck und Claude-1.1.5-Artifact-Verifikation bestanden.

## Sachverhalte und Abgrenzungen

| Thema | Beleg und Auswirkung auf die Texte |
| --- | --- |
| Hosting | Der Betreiber hat am 13.09.2026 bestätigt: SkillPilot Core wird in Deutschland gehostet. Keine Erweiterung dieser Aussage auf Anthropic, Supportdienste oder andere Drittanbieter. |
| Beta | Claude ist der reale Betaweg; ChatGPT bleibt bis zur gezielten Integrationsabnahme und offiziellen Freigabe nicht regulär verfügbar. Siehe [Arbeitsreihenfolge](../deploy/claude-beta-chatgpt-release-strategy.md). |
| Identität | `Learner` und `LearnerLifecycleService`: dauerhafte ID als Zugangsschlüssel, keine normale Klarnamenregistrierung. Pseudonym ist nicht anonym; Betroffenenanfragen dürfen nicht zum Versand von Zugangsschlüsseln per E-Mail auffordern. |
| Coach-Daten | `ClaudeV1McpContractAdapter` und `OpenAiDeV1McpContractAdapter`: strukturierte Ergebnisfelder, keine Antworttexte, `workFeedback`, `outcomeFeedback` oder umbenannten Äquivalente. Der Coach schreibt seine Erfolgsantwort selbst. Kontext und bestätigte Lernergebnisse gehen dennoch an den gewählten Anbieter. |
| Feedback | `LearnerGoalFeedbackAction` öffnet denselben öffentlichen, ausdrücklich einwilligungsgebundenen Ablauf wie das Lernzielbuch. `GoalFeedbackSubmissionService` speichert freiwilligen Text und Publikations-/Einwilligungsnachweise, nicht eine vorgesehene Lernenden-ID. Personenbezug kann versehentlich im Text entstehen; keine automatische Anonymisierung behaupten. |
| Feedback-Löschung | `GoalFeedbackRetentionService`: 30 Tage plus täglicher Lauf für noch nicht übernommenes Onlinefeedback; veröffentlichte Obergrenze im laufenden Betrieb 31 Tage. Übernommene Daten, lokale Exporte und Bearbeitungs-/Codex-Protokolle haben eine getrennte Aufbewahrungsgrenze, siehe [Intake-Runbook](../qa-ci/goal-feedback-codex-intake.md). Profil-Löschung löscht diese nicht pauschal mit. |
| Profil-Löschung | `LearnerLifecycleService`: 365 Tage ohne definierte erfolgreiche Tätigkeit, dann nächster Bereinigungslauf; zusätzlich manuelle Cockpit-Löschung. Nicht sämtliche lernendenunabhängigen OAuth-Zeilen, Protokolle oder Backups. |
| Sessions/OAuth | 24 Stunden Lernsitzung und standardmäßig 1 Stunde Access-/30 Tage Refresh-Token sind Zugriffsfristen, keine universellen Datenbank-Löschfristen. |
| Lokale Speicherung | Browserzugang, Profile, Lehrerklassen, Einstellungen, Terms-Version und Anwendungscache getrennt von Serverlöschung und heruntergeladenen Dateien erklären. Ein verschlüsselter Export schützt keinen entsperrten Browser. |
| Protokolle | `RequestLoggingFilter`: Coach-Ergebnis-/MCP-/OAuth-/Feedbackrouten werden vom allgemeinen Requestlogger ausgenommen. Andere Routen können bei DEBUG redigierte Felder protokollieren; zusätzliche Altrouten-AI-Traces haben keine nachgewiesene automatische TTL. Keine pauschale Behauptung, SkillPilot verarbeite niemals Freitext oder speichere keinerlei Diagnosen. |
| Symbolbilder | Die KI-generierten Startseitenmotive sind keine dokumentierten Nutzererfahrungen oder echten Produktaufnahmen. Allgemeine KI-Transparenz und `LEGAL.md` wurden synchronisiert. |

Die veröffentlichungsgebundene Connector-Notiz
`backend/src/main/resources/claude-connector-v1/privacy.html` und ihre
Release-Evidence wurden **nicht** nachträglich verändert oder neu als freigegeben
ausgegeben. Sie verlinkt ergänzend auf die allgemeine Datenschutzerklärung.
Eine künftige Änderung dieser gebundenen Notiz braucht den eigenen
Candidate-/Evidence-Prozess. Ebenso wurde kein historischer OpenAI-Reviewstand
überschrieben.

## Offene Betreiberprüfung

Diese Punkte lassen sich nicht durch Formulierungen oder grüne Tests erledigen:

- Tatsächlich eingesetzte Hosting-/E-Mail-/sonstige Auftragsverarbeiter und die
  erforderlichen vertraglichen Vereinbarungen prüfen und intern dokumentieren;
  konkrete Empfängerauskunft sicherstellen. Bestätigt ist bisher nur das
  Core-Hostingland, nicht eine vollständige Dienstleisterliste.
- Produktionsfristen für Applikations-, Reverse-Proxy-, Journal-/Debug- und
  AI-Trace-Protokolle sowie SQL-Dumps, WAL, Snapshots und externe Sicherungen
  festlegen, technisch prüfen und die Datenschutzerklärung konkretisieren.
  Der Betreiber hat dazu keine Fristen angegeben. `max-history: 7` und
  `backup_db.sh` mit standardmäßig 30 Tagen sind lediglich Repositoryvorgaben,
  keine Zusicherung sämtlicher produktiver Kopien. Der öffentliche Text benennt
  die fehlende Konkretisierung ausdrücklich; dies ersetzt keine Erfüllung der
  Informations- und Speicherbegrenzungspflichten.
- Für exportiertes Feedback, Support-E-Mails und Arbeits-/KI-Toolprotokolle
  den zweckbezogenen Löschprozess praktisch durchsetzen. Automatische lokale
  Feedback-Löschfristen sind nicht nachgewiesen. Vor Verwendung externer
  Review-Dienste deren konkrete Rollen und Übermittlungsgrundlagen prüfen.
- Aktive Debug-/Altrouten-Traces, datensparsame Protokollierung und sichere
  Betroffenen-Verifikation im Betrieb prüfen; dieser Auftrag hat weder
  Produktionskonfiguration noch gespeicherte Daten verändert.
- Altersregeln, erforderliche Einwilligungen, Vertragsänderungsinformationen,
  Rechtsgrundlagen und Drittlandübermittlungen fachjuristisch prüfen lassen.
  Bestehende gesetzliche Verbraucherrechte werden nicht pauschal ausgeschlossen.

## Geprüfte Primärquellen

- Die [DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng), insbesondere
  Art. 5, 6, 12–22, 28 und 44 ff., ist die Grundlage für die Angaben zu Zwecken,
  Datenminimierung, Empfängern, Aufbewahrung, Rechtsgrundlagen und Betroffenenrechten.
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) unterscheidet
  notwendige Endgerätezugriffe für gewünschte Dienste von einwilligungsbedürftigen
  Zugriffen. Die Annahme der Terms ist keine allgemeine Tracking-Einwilligung.
- [Anthropic Consumer Terms](https://www.anthropic.com/legal/consumer-terms),
  Abschnitt 2: persönliche Konten ab mindestens 18 Jahren bzw. höherer örtlicher
  Altersgrenze, keine Weitergabe zur Nutzung durch andere. Elternzustimmung hebt
  diese Anbietergrenze nicht auf.
- [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy), Stand
  10.09.2026: Anbieter-Eingaben, Empfänger, Datenkontrollen und internationale
  Verarbeitung. Deutsches Core-Hosting ist keine Deutschland-Zusage für Claude.
- [Hessische Datenschutzaufsicht](https://datenschutz.hessen.de/service/beschwerde-uebermitteln)
  als erreichbarer Beschwerdeweg; das Recht auf eine andere zuständige Behörde
  bleibt bestehen.
- [§ 309 BGB](https://www.gesetze-im-internet.de/bgb/__309.html),
  [§ 327 BGB](https://www.gesetze-im-internet.de/bgb/__327.html) und
  [§ 327r BGB](https://www.gesetze-im-internet.de/bgb/__327r.html): Haftung,
  digitale Leistungen und Änderungsrechte nicht pauschal ausschließen.
- Die bestehenden KI-Rechtsverweise bleiben nach Quellenprüfung erhalten:
  [KI-Verordnung 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de),
  [Änderungsverordnung 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj?locale=de)
  und [Kommissionsleitlinien](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems).
