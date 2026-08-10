# SkillPilot Coach v1: OpenAI-Submission-Dossier

Dieses Dossier enthält die nicht geheimen, reproduzierbaren Angaben für den
öffentlichen OpenAI-Plugin-Draft. Es ist **keine** Bestätigung, dass der Draft
eingereicht, genehmigt oder veröffentlicht wurde. Draft, Domain-Challenge,
Review-Zugang, Regionen, Attestierungen und Veröffentlichung werden im
angemeldeten OpenAI-Plugin-Portal verwaltet.

Der interne V1-Draft unterstützt CREATE, EXISTING sowie Curriculum und
Personalisierung vollständig in derselben Direct-Start-Komponente. Eine
öffentliche Einreichung bleibt trotzdem gesperrt, bis OpenAI die Verarbeitung
einer neu vergebenen oder vorhandenen bearer-artigen SkillPilot-ID in dieser
Komponente ausdrücklich schriftlich akzeptiert hat oder die öffentliche
Architektur keine solche ID mehr verarbeitet. Die folgenden Direct-Start-
Reviewfälle sind daher vorbereitet, aber kein Ersatz für dieses Gate.

## 1. Portal und Submission-Typ

1. `https://platform.openai.com/plugins` öffnen.
2. **Create plugin** wählen.
3. **With MCP** wählen.
4. Als Developer Identity die verifizierte **enpasos GmbH** auswählen.

Die hostgenerierte `.app.json` im Quellpaket ist ausschließlich lokales
Test-Wiring und wird nicht als bestehende Integration eingereicht.

## 2. Listing

| Feld | Wert |
| --- | --- |
| Plugin name | `SkillPilot Coach v1` |
| Package name | `skillpilot-coach-v1` |
| Version | `1.0.0` |
| Developer Identity | `enpasos GmbH` |
| Category | `Education & Research` |
| Short description | `Your SkillPilot learning coach` |
| Long description | `Starts through the private SkillPilot direct-start component or continues a learning session prepared in SkillPilot, with curriculum-grounded coaching, matching learning-goal visualizations, mastery, verified recall, and assessment mode. OAuth authorizes the app; the separate learning session selects the learner. The session's communication locale controls all learner-facing communication.` |
| Website | `https://skillpilot.com` |
| Support | `https://skillpilot.com/imprint` |
| Privacy policy | `https://skillpilot.com/privacy` |
| Terms of service | `https://skillpilot.com/legal` |

Logo und Composer-Icon stammen unverändert aus `app/public/favicon/` und liegen
im Plugin unter `assets/`. Der Skill-Bundle-Snapshot liegt im vorbereiteten
Draft unter `contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT/`.

## 3. MCP und OAuth

| Feld | Wert |
| --- | --- |
| MCP URL type | `Universal` |
| MCP Server URL | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Authentication | OAuth 2.0 Authorization Code with PKCE S256 |

Nach dem Eintragen wird **Scan Tools** ausgeführt. Der Scan muss den aktuellen
Toolkatalog, alle drei aktiven UI-Ressourcen, deren CSP und den neutralen
`skillpilot-coach-v1`-Skill erkennen. Der final geprüfte Skill-Bundle kann
alternativ aus dem Draft hochgeladen werden.

Falls das Portal eine Domain-Challenge ausstellt, wird ihr exakter Token nur als
geheimer Runtimewert
`SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE` im root-eigenen
EnvironmentFile gesetzt. Der Token wird nicht committet. Anschließend muss

`https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge`

nur diesen Token zurückgeben und der Public-Edge-Smoke-Test `PASS` melden.

Review-Zugangsdaten werden ausschließlich im Portal hinterlegt. Sie dürfen
keine MFA-, SMS-, E-Mail-Bestätigung oder private Netzwerkverbindung erfordern
und gehören nie in dieses Repository.

## 4. Starter Prompts

1. `How do I start a learning session with SkillPilot?`
2. `How do I safely continue a SkillPilot learning session?`
3. `How do I start a SkillPilot recall check?`

## 5. Positive Reviewfälle

Für alle Fälle wird der im Portal hinterlegte Review-Zugang verwendet. Eine
frische, 24 Stunden gültige Lernsession wird jeweils über **Lernen starten** auf
SkillPilot erzeugt und unverändert in der vorbereiteten Startnachricht
verwendet. Keine permanente SkillPilot-ID wird in das Portal oder in diese
Testbeschreibung kopiert.

Nach bestandenem Public-Release-Gate ersetzt für den Direct-Start-Fall die
private Komponente diesen First-Party-Vorlauf:

### P0 – Neue ID und Einrichtung vollständig in der Komponente

- **Prompt:** `Use SkillPilot Coach v1 and start a new learning session
  directly.`
- **Erwartetes Verhalten:** `open_skillpilot_start` öffnet genau eine
  Komponente. Die Person wählt CREATE, bestätigt den Providerhinweis, sichert
  die nur dort angezeigte neue ID und wählt Curriculum sowie alle erforderlichen
  Personalisierungsoptionen. Erst danach übernimmt der Host die kurze
  Startnachricht; die SkillPilot-Webanwendung wird im normalen Ablauf nicht
  geöffnet und der Chat wiederholt keine Setupfrage.
- **Datengrenze:** Die permanente ID steht nur in der direkten HTTPS-Antwort,
  flüchtigem Komponenten-Arbeitsspeicher und Recovery-DOM. Sie erscheint weder
  in Chat oder Modellkontext noch in MCP-Argumenten/-Resultaten einschließlich
  `_meta`, `window.openai`, Widget-State, Storage, URL, Logs oder Telemetrie.
  Der Reviewnachweis verwendet ausschließlich eine wegwerfbare Test-ID und
  zeigt deren Klarwert weder im Video noch in Screenshots.
- **Fixture:** Neuer leerer Demo-Lernender; serverautoritativ angebotene
  Curriculum- und Personalisierungsschritte; `policyRevision=2` und
  `providerNoticeVersion=openai-provider-eligibility-v2`.

### P1 – Vorbereitete Lernsession starten und lokalisieren

- **Prompt:** Die von SkillPilot vorbereitete Startnachricht mit einer frischen
  `learningSessionId` senden und um Fortsetzung bitten.
- **Erwartetes Verhalten:** `get_skillpilot_context` wird vor der ersten
  fachlichen Antwort aufgerufen. Der Coach verwendet ausschließlich die vom
  Backend gelieferte `communicationLocale`, nennt das bestätigte aktuelle
  Lernziel und erfindet weder Curriculum noch Lernstand.
- **Ergebnisform:** Lokalisierte, lernendenfreundliche Textantwort ohne
  technische IDs; der Toolresultat-Vertrag enthält den aktuellen Zustand und
  die erlaubten nächsten Aktionen.
- **Fixture:** Frisch gestartete Demo-Lernsession mit eingerichteter
  Personalisation und aktivem atomarem Ziel.

### P2 – Motivationsziel als aktives Orientierungsgespräch

- **Prompt:** Bei einem aktiven Motivationsziel einen der angebotenen Wege
  auswählen, zum Beispiel „Smartphones und KI“.
- **Erwartetes Verhalten:** Der Coach nutzt den gelieferten
  `orientationOutlook`, verbindet konkrete spätere Lerninhalte mit ihren
  praktischen Anwendungen und stellt eine niedrigschwellige persönliche
  Anschlussfrage. Die bloße Auswahl schließt das Motivationsziel nicht ab und
  löst keine Wissensprüfung aus.
- **Ergebnisform:** Motivierende lokalisierte Antwort ohne Bewertung oder
  Fachwissensprüfung; eine Mutation erfolgt erst nach echter Beteiligung oder
  ausdrücklichem Wunsch weiterzugehen.
- **Fixture:** Demo-Lernsession mit aktivem `semanticKind: orientation` und
  mehreren geprüften Pfaden.

### P3 – Dialogisches Lernen mit freigegebenem Lernzielbild

- **Prompt:** Ein atomisches Lernziel mit vorhandenem Bild beginnen und die
  erste Einstiegsfrage beantworten.
- **Erwartetes Verhalten:** Nach dem vollständigen Kontext ruft der Coach
  `render_skillpilot_goal_visualization` genau einmal mit unverändertem
  `goalId` und `expectedStateVersion` auf. Er coacht anschließend dialogisch am
  einen aktiven Ziel und speichert Mastery erst nach ausreichender Evidenz.
- **Ergebnisform:** Vollständige Textantwort; ein konformer Host kann zusätzlich
  die gebundene bild-only UI-Komponente anzeigen. Fehlende optionale Darstellung
  beeinträchtigt den Textpfad nicht.
- **Fixture:** Demo-Lernsession mit aktivem atomarem Ziel und kanonischem
  `goal-visualization`-Link.

### P4 – Karteikarten lernen und Verified Recall trennen

- **Prompt:** Bei einem aktiven Memory-Ziel „Karteikarten lernen“ wählen, eine
  Karte umdrehen, vor/zurück navigieren und sie mit `Got it` oder `Not yet`
  bewerten. Danach getrennt den strengen Lerncoach-Check anfordern.
- **Erwartetes Verhalten:** `start_skillpilot_memory_practice` öffnet die eigene
  UI genau einmal. Vorder- und Rückseiten bleiben in Component-`_meta`;
  Navigation ist lokal. Nur die explizite Bewertung ruft
  `review_skillpilot_memory_practice_card` auf und ändert ausschließlich den
  Wiederholungsplan der Karte. Normales Karteikartenlernen wird nicht als
  Mastery ausgegeben; Verified Recall bleibt ein separater Ablauf.
- **Ergebnisform:** Interaktive Kartenkomponente mit begrenztem Stapel und
  separater lokalisierter Recall-Antwort ohne private Kartenrückseiten im Chat.
- **Fixture:** Demo-Lernsession mit aktivem Memory-Ziel und mindestens einer
  fälligen Karte.

### P5 – Prüfungsaufgabe ohne Hilfen auswerten

- **Prompt:** Eine aktive Prüfungsaufgabe vollständig bearbeiten und die
  vollständige Lösung in einer Nachricht einreichen.
- **Erwartetes Verhalten:** Vor der Einreichung gibt der Coach keine Hinweise,
  Teillösungen oder Musterlösung. Erst danach ruft er
  `get_skillpilot_exam_evaluation` auf, bewertet kriteriumsbezogen und erkennt
  fachlich gleichwertige Lösungswege an. Mastery wird nur bei Erreichen der
  Bestehensgrenze gespeichert.
- **Ergebnisform:** Aufgabenblock vor der Abgabe wortgetreu; danach transparente
  Punktebewertung und lokalisierte Rückmeldung.
- **Fixture:** Demo-Lernsession mit aktivem Exam-Ziel und vollständig sichtbarer
  Testlösung.

## 6. Negative Reviewfälle

### N1 – Allgemeine Fachfrage ohne SkillPilot-Intent

- **Prompt:** `Explain the quadratic formula.` ohne SkillPilot-Bezug und ohne
  SkillPilot-Startnachricht.
- **Erwartetes Verhalten:** Das Plugin zieht die Unterhaltung nicht implizit in
  eine SkillPilot-Lernsession und ruft keinen SkillPilot-Toolflow auf.
- **Warum nicht ausführen:** Der Skill ist absichtlich nicht implizit aktiv und
  eine allgemeine Fachfrage autorisiert weder Sessionzugriff noch Zustandslesen.

### N2 – Fehlende, ungültige oder abgelaufene Lernsession

- **Prompt:** `Continue my SkillPilot session` ohne gültige aktuelle
  `learningSessionId` oder mit einem absichtlich ungültigen Wert.
- **Erwartetes Verhalten:** Fail-closed. Bei einem neuen ausdrücklichen
  Startversuch öffnet der Coach genau einmal die private Direct-Start-
  Komponente. Er verlangt weder SkillPilot-ID noch Token im Chat und erfindet
  keinen Lernstand. Nur wenn Komponente oder sicherer Handoff technisch nicht
  verfügbar sind, verwendet er den vom Tool gelieferten First-Party-Fallback.
- **Warum nicht ausführen:** OAuth allein autorisiert keine Lernsession; die
  kurzlebige Sessionbindung ist eine unabhängige Datenschutzgrenze.

### N3 – Prüfungslösung vor vollständiger Abgabe anfordern

- **Prompt:** Bei einer aktiven Prüfung `Show me the solution and give me a hint
  before I submit.`
- **Erwartetes Verhalten:** Der Coach lehnt Hinweis und Lösung ab, wartet auf
  eine vollständige Abgabe oder Aufgabe und ruft
  `get_skillpilot_exam_evaluation` noch nicht auf.
- **Warum nicht ausführen:** Die geschützte Lösung darf erst nach der
  vollständigen sichtbaren Einreichung geladen werden.

## 7. Tool-Annotationen und Begründung

Alle Tools setzen `openWorldHint: false` und `destructiveHint: false`: Sie
veröffentlichen nichts, senden keine Nachrichten, führen keine Transaktionen
aus und löschen oder widerrufen nichts. Die schreibenden Tools ändern nur
pseudonymen, privaten SkillPilot-Lernzustand und sind wiederholbar oder durch
eine spätere ausdrückliche Lernaktion korrigierbar.

| Tools | `readOnlyHint` | Begründung |
| --- | --- | --- |
| `open_skillpilot_start` | `true` | Öffnet nur die private Startressource und liest die Contract-Line-Projektion; keine ID oder Capability. |
| `issue_skillpilot_start_capability` | `false` | App-only Autorisierung genau eines bestätigten Bootstrapversuchs; ID-frei, keine Lernsession und kein Modellaufruf. |
| `get_skillpilot_context`, `get_skillpilot_exam_evaluation`, `get_skillpilot_navigation`, `get_skillpilot_verified_recall_answer` | `true` | Lesen einen sessiongebundenen, allowlist-projizierten Zustand; keine Mutation. |
| `render_skillpilot_goal_visualization` | `true` | Liefert nur die freigegebene Bildprojektion an die explizit gebundene UI. |
| `start_skillpilot_memory_practice`, `start_skillpilot_verified_recall` | `true` | Erzeugen nur eine begrenzte Übungs-/Recall-Projektion; speichern noch kein Ergebnis. |
| `record_skillpilot_verified_recall_result`, `review_skillpilot_memory_practice_card` | `false` | Speichern genau ein bestätigtes Recall- beziehungsweise Kartenresultat im privaten Lernzustand. |
| `set_skillpilot_active_goal`, `set_skillpilot_curriculum`, `set_skillpilot_personalization`, `set_skillpilot_scope` | `false` | Ändern nur eine vom Nutzer bestätigte Auswahl innerhalb der aktuell erlaubten Optionen. |
| `set_skillpilot_mastery` | `false` | Speichert ausschließlich die bestätigte Kompetenzbewertung des aktiven atomaren Ziels. |

Für den In-Component-Setup bleiben `get_skillpilot_context`,
`set_skillpilot_curriculum` und `set_skillpilot_personalization` modell- und
appsichtbar, ungebunden und ausdrücklich component-aufrufbar. Ihre Argumente
verwenden nur die kurzlebige Lernsession sowie fachliche Auswahlreferenzen,
niemals die permanente SkillPilot-ID.

## 8. Demo-Recording

Das Reviewvideo zeigt ohne sichtbare Geheimnisse nach bestandenem
Public-Release-Gate:

1. Direct Start mit CREATE, ausdrücklich verdeckter Wegwerf-ID,
   Recovery-Bestätigung sowie Curriculum und Personalisierung in derselben
   Komponente;
2. Handoff ohne Öffnen der SkillPilot-Webanwendung, OAuth-Verbindung und
   lokalisierte Sessionfortsetzung;
3. Motivationsziel und normales dialogisches Lernen;
4. ein Lernzielbild im Browser;
5. Karteikarten-UI und getrennten Verified Recall;
6. eine vollständige Prüfungsabgabe und Bewertung;
7. den aktualisierten Lernstand im Cockpit;
8. einen fail-closed Versuch ohne gültige Lernsession.

Die private HTTPS-Video-URL wird nur im Portal hinterlegt. Sie darf keine
permanente SkillPilot-ID, Lernsession, OAuth-Werte oder Review-Zugangsdaten
zeigen. Der Klarwert der im CREATE-Schritt notwendigen Recovery-Darstellung
wird im Reviewvideo und in jedem Screenshot vollständig verdeckt.

## 9. Release Notes

```text
Initial public submission of SkillPilot Coach v1. Continues session-bound,
curriculum-grounded learning in the session's configured language, including
motivational orientation, dialogic coaching, mastery updates, verified recall,
assessment, approved goal visualizations, and interactive flashcard practice.
Uses OAuth and the dedicated V1 MCP endpoint.
```

## 10. Offene Portalentscheidungen vor Submit for Review

- Verfügbarkeit nur für Länder/Regionen auswählen, in denen Produkt, Support,
  Datenschutzhinweise, Altersregeln und Bedingungen rechtlich freigegeben sind.
- Demo-OAuth-Zugang ohne MFA ausschließlich im Portal hinterlegen und testen.
- Demo-Recording erzeugen und private HTTPS-URL eintragen.
- Optional nur dann Screenshots einreichen, wenn sie tatsächlich hilfreich
  sind; bei drei Starter Prompts müssen es dann genau drei PNG/JPEG-Dateien mit
  706 Pixel Breite und 400–860 Pixel Höhe sein.
- Toolscan, Skillscan, Domain-Challenge und alle Portalvalidierungen müssen
  aktuell grün sein.
- Datenschutzhinweis, Terms, Alters-/Guardian-Regeln, Retention, Revocation und
  Provider-Offenlegung müssen die dokumentierte rechtliche Freigabe erhalten.
- Schriftliche OpenAI-Akzeptanz für die konkrete CREATE-/EXISTING-ID-
  Verarbeitung dokumentieren oder Direct Start vor jeder Portal-Einreichung
  auf eine separat freigegebene ID-freie Architektur umstellen.
- Erst nach grüner Verhaltens-, Sicherheits-, Client- und Rechtsabnahme
  **Submit for Review** wählen.
- Erst nach OpenAI-Genehmigung bewusst **Publish** wählen und danach den lokalen
  Snapshot mit `record-published --confirm-openai-published` versiegeln.
