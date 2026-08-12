# SkillPilot Coach v1: OpenAI-Submission-Dossier

**Stand:** 11. August 2026

Dieses Dossier enthält die nicht geheimen, reproduzierbaren Angaben für den
öffentlichen OpenAI-Plugin-Draft. Es bestätigt weder Einreichung noch
Genehmigung oder Veröffentlichung. Draft, Domain-Challenge, Review-Zugang,
Regionen, Attestierungen und Veröffentlichung werden im angemeldeten
OpenAI-Plugin-Portal verwaltet.

Die V1-Identitäts- und Konfigurationsgrenze ist Web-first: permanente
SkillPilot-ID, CREATE/EXISTING, Providerhinweis und die vollständige Level-2-
Konfiguration bleiben im First-Party-WebGUI. Der Plugin-Review verarbeitet
keine permanente SkillPilot-ID.

## 1. Portal und Submission-Typ

1. `https://platform.openai.com/plugins` öffnen.
2. **Create plugin** wählen.
3. **With MCP** wählen.
4. Als Developer Identity die verifizierte **enpasos GmbH** auswählen.

Die hostgenerierte `.app.json` im Quellpaket ist lokales Test-Wiring und wird
nicht als bestehende Integration eingereicht.

## 2. Listing

| Feld | Wert |
| --- | --- |
| Plugin name | `SkillPilot Coach v1` |
| Package name | `skillpilot-coach-v1` |
| Version | `1.0.0` |
| Developer Identity | `enpasos GmbH` |
| Category | `Education & Research` |
| Short description | `Your SkillPilot learning coach` |
| Long description | `Continues a learning session prepared in the first-party SkillPilot web app, with curriculum-grounded coaching, matching learning-goal visualizations, mastery, verified recall, and assessment mode. Create or load your permanent SkillPilot ID, configure the learning context, and choose Start learning in SkillPilot; each start creates a fresh session and opens a new chat. OAuth authorizes the app, while the separate learning session selects the learner and controls the communication locale.` |
| Website | `https://skillpilot.com` |
| Support | `https://skillpilot.com/imprint` |
| Privacy policy | `https://skillpilot.com/privacy` |
| Terms of service | `https://skillpilot.com/legal` |

Logo und Composer-Icon stammen unverändert aus `app/public/favicon/` und liegen
im Plugin unter `assets/`. Der Skill-Bundle-Snapshot liegt im vorbereiteten
Draft unter `contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT/`.

## 3. MCP, OAuth und UI-Ressourcen

| Feld | Wert |
| --- | --- |
| MCP URL type | `Universal` |
| MCP Server URL | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Authentication | OAuth 2.0 Authorization Code with PKCE S256 |
| Lifecycle policy | `policyRevision=4` |

Nach dem Eintragen wird **Scan Tools** ausgeführt. Der Scan muss den aktuellen
Produktivkatalog, den neutralen `skillpilot-coach-v1`-Skill und genau zwei
aktive, getrennt hashgebundene MCP-Apps-Ressourcen erkennen:

- die read-only Lernzielbildressource;
- die interaktive Karteikartenressource.

Bereits beworbene Bild-Hash-URIs bleiben für Provider-Caches byte-identisch
passiv lesbar. Frühere, nie veröffentlichte Startressourcen gehören nicht zum
V1-Vertrag.

Falls das Portal eine Domain-Challenge ausstellt, wird ihr exakter Token nur als
geheimer Runtimewert
`SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE` im root-eigenen
EnvironmentFile gesetzt und nie committet. Danach muss
`https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` nur
diesen Token zurückgeben.

Review-Zugangsdaten werden ausschließlich im Portal hinterlegt. Sie dürfen
keine MFA-, SMS-, E-Mail-Bestätigung oder private Netzwerkverbindung erfordern
und gehören nie in das Repository.

## 4. Starter Prompts

1. `How do I start a learning session with SkillPilot?`
2. `How do I safely continue a SkillPilot learning session?`
3. `How do I start a SkillPilot recall check?`

Die Prompts enthalten absichtlich keine Session. Der erwartete Erstkontakt ist
deshalb der kurze WebGUI-Hinweis, nicht ein Toolaufruf.

## 5. Positive Reviewfälle

Der Review verwendet ausschließlich einen dafür eingerichteten Testlernstand.
Keine permanente SkillPilot-ID wird in Portal, Chat, Video oder Screenshots
kopiert.

### P0 – Installation oder Prompt ohne vorbereitete Session

- **Prompt:** `How do I start a learning session with SkillPilot?`
- **Erwartung:** Kein SkillPilot-Werkzeug wird aufgerufen. Der Coach antwortet
  kurz in der aktuellen Unterhaltungssprache, verweist exakt auf
  `https://skillpilot.com/`, nennt CREATE oder Laden der SkillPilot-ID,
  WebGUI-Konfiguration und **Lernen starten** / **Start learning** und stoppt.
  Diese Sprachauswahl setzt keine Session-Locale.

### P1 – WebGUI-Konfiguration und Übergabe

- **Ablauf:** Im First-Party-WebGUI eine neue SkillPilot-ID erzeugen oder eine
  vorhandene laden, Providerhinweis bestätigen und Curriculum, Stage, Subjects,
  Profile sowie Personalisierung konfigurieren. Danach **Lernen starten**.
- **Erwartung:** Jeder Start erzeugt eine frische opake `learningSessionId` und
  öffnet einen neuen Chat mit vorbereiteter Startnachricht. Die permanente ID,
  OAuth-Werte und interne Lernziel-IDs erscheinen nicht in dieser Nachricht.
  Ein zweiter Start erzeugt einen anderen Sessionwert und einen weiteren neuen
  Chat.

### P2 – Vorbereitete Lernsession fortsetzen und lokalisieren

- **Prompt:** Die von SkillPilot vorbereitete Startnachricht senden und um
  Fortsetzung bitten.
- **Erwartung:** `get_skillpilot_context` läuft im aktuellen Assistant-Turn vor
  der ersten und jeder weiteren lernendenbezogenen Coach-Antwort. Der Coach
  verwendet ausschließlich die bestätigte `communicationLocale`, den aktuellen
  Level-2-Kontext, Fokus und das aktive atomare Ziel. Er fragt Level 2 nicht
  erneut ab und verändert ihn nicht im Chat.

### P3 – Motivationsziel als Orientierungsgespräch

- **Prompt:** Bei einem aktiven Orientierungsziel einen angebotenen Weg wählen.
- **Erwartung:** Der Coach nutzt nur den gelieferten `orientationOutlook`,
  verbindet konkrete spätere Inhalte mit Anwendungen und lädt zu einer
  niedrigschwelligen persönlichen Reaktion ein. Die bloße Wegwahl schließt das
  Ziel nicht ab und löst keine Wissensprüfung aus.

### P4 – Dialogisches Lernen mit Lernzielbild

- **Prompt:** Ein atomares Lernziel mit freigegebenem Bild beginnen und die
  Einstiegsfrage beantworten.
- **Erwartung:** Nach dem frischen Vollkontext ruft der Coach den Renderer nur
  bei passender `goalVisualization` und Freigabe genau einmal mit unveränderter
  `goalId` auf; die Top-Level-`stateVersion` wird in
  `expectedStateVersion` kopiert. Danach bleibt die Textantwort vollständig.
  Der Coach arbeitet dialogisch am einen aktiven Ziel und speichert Mastery erst
  nach ausreichender Evidenz. Ohne gültige Bildfreigabe gibt es keinen
  Renderer-Aufruf und keine leere UI.

### P5 – Karteikartenlernen und Verified Recall trennen

- **Prompt:** Bei einem aktiven Memory-Ziel normale Karten üben und danach
  getrennt einen strengen Lerncoach-Check anfordern.
- **Erwartung:** `start_skillpilot_memory_practice` öffnet seine eigene UI.
  Vorder- und Rückseiten bleiben in Component-`_meta`; Blättern ist lokal. Nur
  die explizite Kartenbewertung ändert die Wiederholungsplanung. Normales
  Üben wird nicht als Mastery ausgegeben; Verified Recall bleibt ein eigener
  Ablauf ohne Hilfen. `start_skillpilot_verified_recall` liefert ohne
  modellseitige Ziel- oder Batchgrößenwahl den vollständigen servergebundenen
  Batch. Nach allen Lernendenantworten folgen genau ein
  `get_skillpilot_verified_recall_answers` und genau ein atomarer
  `record_skillpilot_verified_recall_results`; der Coach setzt die gelieferte
  Fortsetzung sofort um.

### P6 – Prüfungsaufgabe ohne Hilfen auswerten

- **Prompt:** Eine aktive Prüfungsaufgabe vollständig bearbeiten und die Lösung
  sichtbar einreichen.
- **Erwartung:** Vor der Einreichung gibt der Coach keine Hinweise oder Lösung.
  Erst danach lädt er die freigegebene Evaluation, bewertet kriteriumsbezogen,
  akzeptiert fachlich gleichwertige Wege und speichert Mastery nur beim
  Erreichen der Bestehensgrenze.

### P7 – Fokus entlang des sichtbaren Pfads weiten

- **Prompt:** Einen abgeschlossenen oder bewusst zu engen Fokus erweitern
  lassen.
- **Erwartung:** Die Scope-Navigation liefert geeignete backendseitig
  veröffentlichte learner-facing Vorfahren zuerst, der nächstgelegene breitere
  Fokus steht an erster Stelle; andere gültige Fokusoptionen können folgen. Der
  Coach verwendet nur eine exakte frische Option.
  Neu einbezogene nicht beherrschte `target`-Ziele bleiben normale
  Frontier-Kandidaten nach ihren eigenen Voraussetzungen. Ein bereits
  beherrschtes abhängiges Ziel erzeugt keine rückwirkende Mastery seiner
  Voraussetzungen. Der automatische Vorschlag erscheint nur bei tatsächlich
  abgeschlossenem Fokus, nicht bloß bei leerer Frontier, und wird erst nach
  Zustimmung gesetzt.

## 6. Negative Reviewfälle

### N1 – Allgemeine Fachfrage ohne SkillPilot-Intent

- **Prompt:** `Explain the quadratic formula.` ohne ausgewählte App und ohne
  SkillPilot-Bezug.
- **Erwartung:** SkillPilot wird nicht implizit aufgerufen. Wird die App dagegen
  ausdrücklich ohne Startnachricht gewählt, gilt P0.

### N2 – Ungültige, bald ablaufende oder abgelaufene Session

- **Ablauf:** Eine manipulierte oder abgelaufene Session beziehungsweise eine
  Fixture mit weniger als `PT1H` Restlaufzeit verwenden.
- **Erwartung:** Fail-closed. Auf `SESSION_REQUIRED`,
  `SESSION_RENEWAL_REQUIRED` oder `SESSION_VERSION_UNAVAILABLE` gibt der Coach
  `instruction` unverändert aus. Fehlt es, wählt er den exakten Eintrag aus
  `instructions` für die letzte autoritative `communicationLocale`, sonst die
  aktuelle Unterhaltungssprache. Die exakte `startUrl` wird nur ergänzt, wenn
  sie nicht bereits in der Instruktion steht. Es folgen weder Fachantwort noch
  OAuth-Reconnect oder Wiederverwendung der alten Session. Die Fortsetzung
  erfolgt über die WebGUI und den neuen Chat.
- **Grenze:** Exakt `PT1H` bleibt für eine Operation oder einen Replay gültig.
  Ein bereits committeter identischer Write darf nur bei verfügbaren gepinnten
  Versionen und unveränderter kanonischer Learner-Revision sein gespeichertes
  Ergebnis ohne zweite Mutation replayen.

Für einen kurzen Live-Nachweis darf nur am First-Party-Launch und nur bei
aktivem Diagnose-Gate einmal `diagnosticSessionTtlSeconds=3660` verwendet
werden; `5400` ist die 90-Minuten-Soak-Variante. Zulässig sind ausschließlich
ganze Werte `3601..86400`, höchstens `PT24H`. `3600`, `86401`, Werte über der
normalen Laufzeit und das Feld bei deaktiviertem Gate scheitern ohne neue
Session. Der nächste Launch ohne Feld liefert sofort wieder `PT24H`; die
globale TTL bleibt unverändert.

### N3 – Level-2-Änderung im Chat

- **Prompt:** In einer gültigen Session Curriculum, Stage, Subjects, Profile
  oder Personalisierung ändern lassen.
- **Erwartung:** Keine chatseitige Auswahl und keine Mutation. Der Coach
  verweist ausschließlich auf die servereigene WebGUI-Instruktion oder URL;
  nach der Änderung startet die Person dort eine frische Session in einem neuen
  Chat. Fokus und aktives Ziel bleiben die einzigen Level-3-Navigationswerte,
  die im Chat nach ausdrücklichem Wunsch geändert werden dürfen.

### N4 – Prüfungslösung vor vollständiger Abgabe

- **Prompt:** Bei aktiver Prüfung vor der Abgabe um Lösung und Hinweis bitten.
- **Erwartung:** Der Coach lehnt beides ab, wartet auf die vollständige sichtbare
  Abgabe und lädt die geschützte Evaluation noch nicht.

## 7. Tool-Annotationen und Begründung

Alle Tools setzen `openWorldHint: false` und `destructiveHint: false`. Sie
veröffentlichen nichts, senden keine Nachrichten und löschen nichts. Writes
ändern nur privaten pseudonymen Lernzustand innerhalb der serverautoritativen
Zustandsmaschine.

| Tools | `readOnlyHint` | Begründung |
| --- | --- | --- |
| `get_skillpilot_context`, `get_skillpilot_exam_evaluation`, `get_skillpilot_navigation`, `get_skillpilot_verified_recall_answers` | `true` | Lesen einen sessiongebundenen, allowlist-projizierten Zustand. Navigation bietet nur Fokus- oder Zieloptionen; Recall-Sollantworten werden capability-gebunden genau einmal für den vollständigen Batch freigegeben. |
| `render_skillpilot_goal_visualization` | `true` | Liefert nur die freigegebene Bildprojektion an die explizit gebundene UI. |
| `start_skillpilot_memory_practice`, `start_skillpilot_verified_recall` | `true` | Erzeugen eine begrenzte Übungs- oder Recall-Projektion; sie speichern noch kein Ergebnis. |
| `record_skillpilot_verified_recall_results`, `review_skillpilot_memory_practice_card` | `false` | Der Recall-Write speichert den vollständigen capability-gebundenen Bewertungsbatch atomar; der app-only Review-Write speichert genau die explizite Bewertung einer angezeigten Übungskarte. |
| `set_skillpilot_scope`, `set_skillpilot_active_goal` | `false` | Ändern nach ausdrücklichem Wunsch nur einen aktuellen Level-3-Fokus oder ein aktives Ziel aus den frisch erlaubten Optionen. |
| `set_skillpilot_mastery` | `false` | Speichert ausschließlich evidenzbasierte Bewertung des bestätigten aktiven atomaren Ziels. |

## 8. Demo-Recording

Das Reviewvideo zeigt ohne sichtbare Geheimnisse:

1. CREATE oder EXISTING, Providerhinweis und Level-2-Konfiguration in der
   First-Party-WebGUI;
2. **Start learning**, frische Session und automatisch geöffneten neuen Chat;
3. erfolgreichen aktuellen Kontextabruf vor sichtbarem Coaching;
4. Orientierungsziel und dialogisches Lernen;
5. ein freigegebenes Lernzielbild sowie den vollständigen Textfallback;
6. Karteikarten-UI und getrennten Verified Recall;
7. eine vollständige Prüfungsabgabe und Bewertung;
8. aktualisierten Lernstand im Cockpit;
9. den sessionlosen WebGUI-Hinweis und einen Session-Recovery-Code ohne
   Fachantwort oder OAuth-Reconnect;
10. die Grenzfälle exakt `PT1H`, weniger als `PT1H` und den requestlokalen
    `3660`-Sekunden-Test samt unmittelbar folgendem normalem `PT24H`-Start.

Die private Video-URL wird nur im Portal hinterlegt. Das Video darf keine
permanente SkillPilot-ID, Lernsession, OAuth-Werte oder Review-Zugangsdaten
zeigen.

## 9. Release Notes

```text
Initial public submission of SkillPilot Coach v1. Starts from a learning
session prepared in the first-party SkillPilot web app and provides
curriculum-grounded coaching in the configured language, including motivational
orientation, dialogic learning, mastery updates, verified recall, assessment,
approved goal visualizations, and interactive flashcard practice. Uses OAuth
and the dedicated V1 MCP endpoint.
```

## 10. Portalentscheidungen vor Submit for Review

- Verfügbarkeit nur für rechtlich freigegebene Länder und Regionen auswählen.
- Demo-OAuth-Zugang ohne MFA ausschließlich im Portal hinterlegen und testen.
- Demo-Recording erstellen und private HTTPS-URL eintragen.
- Screenshots nur einreichen, wenn sie tatsächlich hilfreich sind; bei drei
  Starter Prompts gelten die aktuellen Portalvorgaben.
- Toolscan, Skillscan, Domain-Challenge und Portalvalidierungen müssen grün
  sein.
- Datenschutz, Terms, Alters-/Guardian-Regeln, Retention, Revocation und
  Provider-Offenlegung müssen rechtlich freigegeben sein.
- Erst nach grüner Verhaltens-, Sicherheits-, Client- und Rechtsabnahme
  **Submit for Review** wählen.
- Erst nach Genehmigung bewusst **Publish** wählen und danach den Snapshot mit
  `record-published --confirm-openai-published` versiegeln.
