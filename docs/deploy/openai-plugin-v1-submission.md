# SkillPilot Coach v1: OpenAI-Submission-Dossier

**Stand:** 13. August 2026

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

| Brand color | `#f59e0b` |
| Capabilities | `Interactive`, `Read`, `Write` |
| Composer icon | `ai/openai plugin/skillpilot-coach-v1/assets/favicon-96x96.png` |
| Logo | `ai/openai plugin/skillpilot-coach-v1/assets/web-app-manifest-512x512.png` |

Logo und Composer-Icon stammen unverändert aus `app/public/favicon/`. Der
Skill-Inventar-Snapshot liegt im vorbereiteten Draft unter
`contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT/`; er ist kein
Portal-Uploadarchiv.

## 3. MCP, OAuth und UI-Ressourcen

| Feld | Wert |
| --- | --- |
| MCP URL type | `Universal` |
| MCP Server URL | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Authentication | OAuth 2.1 Authorization Code with PKCE S256 |
| Lifecycle policy | `policyRevision=4` |

Nach dem Eintragen wird **Scan Tools** ausgeführt. Der Scan muss den aktuellen
Produktivkatalog und genau zwei aktive, getrennt hashgebundene
MCP-Apps-Ressourcen erkennen:

- die read-only Lernzielbildressource;
- die interaktive Karteikartenressource.

Bereits beworbene Bild-Hash-URIs bleiben für Provider-Caches byte-identisch
passiv lesbar. Frühere, nie veröffentlichte Startressourcen gehören nicht zum
V1-Vertrag.

Der Portal-Scan muss für die beiden aktiven Ressourcen exakt folgende
UI-Grenzen erkennen; es werden keine zusätzlichen Domains vorsorglich
freigegeben:

| Aktive Ressource | Widget-Domain | Connect-Domains | Resource-Domains | Redirect-Domains |
| --- | --- | --- | --- | --- |
| Lernzielbild | `https://mcp-coach-v1.skillpilot.com` | leer | `https://skillpilot.com` | `https://skillpilot.com` |
| Karteikartenlernen | `https://mcp-coach-v1.skillpilot.com` | leer | leer | `https://skillpilot.com` |

Die passiv behaltenen Bildressourcen verwenden dieselbe Widget-, Resource-
und Redirect-Grenze wie die aktive Lernzielbildressource. Das Portal muss den
gescannten Snapshot anzeigen; manuelle CSP-Eingaben dürfen ihn nicht
erweitern.

Der neutrale `skillpilot-coach-v1`-Skill wird separat im Portal hochgeladen und
dort geprüft. Der MCP-Toolscan ist nicht die Importquelle für diesen Skill. Die
lokal getestete Quelldateistruktur besteht aus
`skills/skillpilot-coach-v1/SKILL.md`, `agents/openai.yaml` und
`references/coaching-policy.md`. `skills-bundle.json` ist nur das
Hash-Inventar; das interne `.tar` ist ein Installationsbundle und beides darf
nicht als Skill-Upload verwendet werden. Da die aktuelle Portal-Dokumentation
für den Skill-Upload einer **With MCP**-Einreichung keine eindeutige
Archivwurzel festlegt, wird das dedizierte Uploadarchiv erst nach Prüfung der
tatsächlichen Uploadanforderung im Portal erzeugt.

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

Der Prompt enthält absichtlich keine Session. Der erwartete Erstkontakt ist
deshalb der kurze WebGUI-Hinweis, nicht ein Toolaufruf. Recall, Bewertung und
Fortsetzung werden erst aus einer von SkillPilot vorbereiteten Session heraus
angeboten; Directory-Prompts versprechen diese Workflows daher nicht ohne den
erforderlichen First-Party-Start.

## 5. Positive Portal-Reviewfälle – exakt fünf

Für jeden zustandsbehafteten Reviewfall P2 bis P5 sowie N2 und N3 wird
unmittelbar vor dem Lauf über den öffentlichen First-Party-`CREATE`-Weg ein
eigener neuer Wegwerf-Lernstand erzeugt. Eine neue `learningSessionId` allein
setzt keinen Lernstand zurück; deshalb wird kein Lernstand zwischen Fällen oder
Wiederholungen wiederverwendet. Es gibt weder einen Review-Reset noch einen
administrativen oder sonstigen Sonderweg. Die permanente SkillPilot-ID
bleibt ausschließlich im First-Party-WebGUI und wird weder in das Portal noch
in Chat, Video oder Screenshots kopiert. Jeder Start erzeugt anschließend eine
frische opake Sessionnachricht ohne permanente ID.

### P1 – Sessionloser Start und First-Party-Übergabe

- **Fixture:** Plugin ausgewählt, aber keine von SkillPilot vorbereitete
  Startnachricht und keine `learningSessionId`; englische Unterhaltung;
  öffentlicher Zugriff auf `https://skillpilot.com/` für den anschließenden
  First-Party-Start.
- **Prompt:** `How do I start a learning session with SkillPilot?`
- **Erwarteter Ablauf:** Kein SkillPilot-Werkzeug wird aufgerufen. Der Coach gibt
  exakt folgenden Satz aus und stoppt: `Open https://skillpilot.com/, finish
  the learning setup there, choose “Start learning”, and use the prepared start
  message in a new chat.`
  Im First-Party-WebGUI erzeugt jeder anschließende Start eine frische opake
  `learningSessionId` und öffnet einen neuen Chat. Permanente ID, OAuth-Werte
  und interne Lernziel-IDs erscheinen nicht in der Startnachricht.
- **Erwartete Ergebnisform:** Genau ein Satz ohne Tool-Receipt im sessionlosen
  Chat; nach dem WebGUI-Start eine vorbereitete neue Chatnachricht mit opaker
  Session, aber ohne permanente oder interne Identifikatoren.

### P2 – Kontextgebundene Orientierung und dialogisches Lernen

- **Vorbereitung je Lauf:** Auf `https://skillpilot.com/` über `CREATE` einen
  neuen Lernstand erzeugen, Deutsch sowie Deutschland → Gymnasium → Hessen →
  G9 → Sekundarstufe II → Mathematik → Leistungskurs vollständig bestätigen,
  im Cockpit `Warum Mathematik? – Denken, Muster & Zukunft` aktivieren und
  **Lernen starten** wählen. Sichtbarer Ausgang ist dieses Orientierungsziel;
  nach den folgenden persönlichen Turns wird das atomare Ziel
  `Darstellungsform auswählen und begründen` mit freigegebenem Lernzielbild
  erwartet.
- **Benutzer-Turns:** Zuerst die vom First-Party-WebGUI vorbereitete
  Startnachricht unverändert senden. Danach: `Der Weg „Veränderung, Wachstum
  und Modelle“ interessiert mich am meisten.` Auf die persönliche Einstiegsfrage
  antworten: `Mich interessiert besonders, wie man mit Funktionen das Wachstum
  von Bakterien oder Klimaentwicklungen vorhersagen kann und wo solche Modelle
  an ihre Grenzen kommen. Lass uns daran weiterlernen.` Falls SkillPilot danach
  Zieloptionen anbietet: `Nimm bitte den ersten von SkillPilot angebotenen
  nächsten Schritt und beginne direkt.`
- **Erwarteter Ablauf:** `get_skillpilot_context` läuft vor jeder
  lernendenbezogenen Antwort. Der Coach nutzt nur die bestätigte Locale und den
  autoritativen Level-2-, Fokus- und Zielzustand. Die Wahl des
  Orientierungswegs startet eine personalisierte Motivation, aber noch keine
  Wissensprüfung oder Completion. Beim anschließenden atomaren Ziel ruft er den
  Renderer nur
  bei passender `goalVisualization` und Freigabe genau einmal mit unveränderter
  `goalId` auf; die Top-Level-`stateVersion` wird in
  `expectedStateVersion` kopiert. Danach bleibt die Textantwort vollständig.
  Mastery wird erst nach ausreichender dialogischer Evidenz gespeichert. Ohne
  gültige Bildfreigabe gibt es keinen Renderer-Aufruf und keine leere UI.
  Level 2 wird weder erneut erfragt noch im Chat verändert.
- **Erwartete Ergebnisform:** Frischer vollständiger Kontext, bei Freigabe
  genau ein Renderer-Receipt plus vollständiger lokalisierter Lehrtext; erst
  nach Evidenz ein bestätigtes Mastery-Receipt mit autoritativem
  Nachfolgezustand.

### P3 – Karteikartenlernen und Verified Recall trennen

- **Vorbereitung je Lauf:** Über `CREATE` einen unabhängigen neuen Lernstand mit
  derselben Level-2-Konfiguration wie P2 erzeugen. Die Orientierung mit dem Weg
  `Veränderung, Wachstum und Modelle` und einer persönlichen Antwort
  regelkonform abschließen, im Cockpit `Lernkarten - Funktionen und
  Gleichungen` aktivieren und **Lernen starten** wählen. Weil dieser Lernstand
  noch keinen Karten-Client-State besitzt, sind unabhängig vom Kalendertag
  exakt 8/8 Karten fällig und für den vollständigen Verified Recall verfügbar.
- **Benutzer-Turns:** `Ich möchte zuerst die fälligen Karteikarten normal üben.`
  Danach alle acht Fixture-Karten in der UI als **Gewusst** bewerten und senden:
  `Jetzt möchte ich die strenge Kartenprüfung ohne Hilfen machen.` Nach Ausgabe
  sämtlicher Prüfungsfragen in genau einem Turn einreichen:
  `1. m=(y₂-y₁)/(x₂-x₁). 2. f(x)=a(x-d)²+e mit S(d|e). 3. Ein Produkt ist genau
  dann null, wenn mindestens ein Faktor null ist. 4. x=log_a(b), bei Basis e:
  x=ln(b). 5. a_(n+1)=a_n+d. 6. a_n=a_1·q^(n-1). 7. x^a·x^b=x^(a+b).
  8. x_(1,2)=-p/2 ± sqrt((p/2)²-q).`
- **Erwarteter Ablauf:** `start_skillpilot_memory_practice` öffnet seine eigene UI.
  Vorder- und Rückseiten bleiben in Component-`_meta`; Blättern ist lokal. Nur
  die explizite Kartenbewertung ändert die Wiederholungsplanung. Normales
  Üben wird nicht als Mastery ausgegeben; Verified Recall bleibt ein eigener
  Ablauf ohne Hilfen. `start_skillpilot_verified_recall` liefert ohne
  modellseitige Ziel- oder Batchgrößenwahl den vollständigen servergebundenen
  Batch. Nach allen Lernendenantworten folgen genau ein
  `get_skillpilot_verified_recall_answers` und genau ein atomarer
  `record_skillpilot_verified_recall_results`; der Coach setzt die gelieferte
  Fortsetzung sofort um.
- **Erwartete Ergebnisform:** Begrenzte Karteikarten-Komponente mit öffentlichem
  Fortschritt, aber ohne private Karteninhalte im Modelltext; danach geordneter
  Recall-Start mit Capability, ein vollständiges Answer-Receipt und ein
  atomares Results-Receipt mit genau einer autoritativen `continuation`.

### P4 – Prüfungsaufgabe ohne Hilfen auswerten

- **Vorbereitung je Lauf:**
  `https://skillpilot.com/start/abi26-he-mathe-k1?courseLevel=GK` öffnen,
  Grundkurs beibehalten, über `CREATE` einen neuen Lernstand erzeugen und
  **Lernen starten** wählen. Sichtbarer Ausgang ist das Prüfungsziel
  `B1 (Analysis – „Das Algenwachstum“, 25 BE)` mit Mastery 0 und geschützter
  Evaluation.
- **Benutzer-Turns:** Zunächst die Prüfungsaufgabe anzeigen lassen. Danach in
  genau einem Turn senden: `Ich reiche jetzt meine vollständige Lösung ein:
  1. A(0)=500/(1+49)=10 m². 2. Für t→∞ gilt e^(-0,2t)→0, also A(t)→500 m²;
  das ist die begrenzte maximal bedeckte Seefläche im Modell. 3. Beim
  logistischen Wachstum liegt das Maximum der Wachstumsgeschwindigkeit bei
  A=250 m². Aus 49e^(-0,2t)=1 folgt t=ln(49)/0,2≈19,46 Tage;
  A'(t)=0,2·A·(1-A/500), daher A'≈25 m²/Tag. 4. A(30)=500/(1+49e^-6)≈445,85 m²
  und A_neu(t)=445,85·0,95^(t-30) für t≥30. Aus
  10=445,85·0,95^(t-30) folgt t≈104,03 Tage. 5. Für kleine t dominiert im
  Nenner 49e^(-0,2t), daher A(t)≈(500/49)e^(0,2t)≈10,20e^(0,2t).
  Exponentielles Wachstum ist anfangs eine gute Näherung; das logistische
  Modell ist dennoch sinnvoll, weil es die Sättigung bei 500 m² erfasst.`
- **Erwarteter Ablauf:** Vor der Einreichung gibt der Coach keine Hinweise oder Lösung.
  Erst danach lädt er die freigegebene Evaluation, bewertet kriteriumsbezogen,
  akzeptiert fachlich gleichwertige Wege und speichert Mastery nur beim
  Erreichen der Bestehensgrenze. Diese Musterabgabe erfüllt alle fünf Kriterien
  mit erwarteten 25 von 25 Punkten; die freigegebene Bestehensgrenze liegt bei
  13 von 25 Punkten.
- **Erwartete Ergebnisform:** Vor Abgabe kein Evaluation-Receipt; nach der
  vollständigen Abgabe kriteriumsbezogenes Feedback und genau ein bestätigtes
  State-Receipt, dessen Masterywert die freigegebene Schwelle respektiert.

### P5 – Bewusst engen Fokus entlang des sichtbaren Pfads weiten

- **Vorbereitung je Lauf:** Über `CREATE` einen separaten neuen Lernstand mit
  derselben Level-2-Konfiguration wie P2 erzeugen, im Cockpit den Fokus auf
  `Funktionen und ihre Darstellung` verengen, den ersten dort als lernbar
  angebotenen atomaren Schritt aktivieren und **Lernen starten** wählen. Die
  erwartete erste frisch veröffentlichte breitere Option lautet
  `E-Phase: Grundlagen der Analysis und mathematische Modelle`.
- **Benutzer-Turns:** `Mein aktueller Fokus ist bewusst zu eng. Bitte erweitere
  ihn auf die nächstgrößere passende Einheit.` Danach: `Ja, setze genau diesen
  ersten vorgeschlagenen Fokus.`
- **Erwarteter Ablauf:** Die Scope-Navigation liefert geeignete backendseitig
  veröffentlichte learner-facing Vorfahren zuerst, der nächstgelegene breitere
  Fokus steht an erster Stelle; andere gültige Fokusoptionen können folgen. Der
  Coach verwendet nur eine exakte frische Option.
  Neu einbezogene nicht beherrschte `target`-Ziele bleiben normale
  Frontier-Kandidaten nach ihren eigenen Voraussetzungen. Ein bereits
  beherrschtes abhängiges Ziel erzeugt keine rückwirkende Mastery seiner
  Voraussetzungen. Der automatische Vorschlag erscheint nur bei tatsächlich
  abgeschlossenem Fokus, nicht bloß bei leerer Frontier, und wird erst nach
  Zustimmung gesetzt. Dass ein **automatischer** Vorschlag nur bei tatsächlich
  abgeschlossenem Fokus erscheint, bleibt eine separate Betriebsabnahme und
  wird von diesem ausdrücklich angeforderten Wechsel nicht vorgetäuscht.
- **Erwartete Ergebnisform:** Geordnete Scope-Optionen mit einem vollständigen
  servergegebenen `goalIds`-Payload; nach Zustimmung genau ein bestätigtes
  `set_skillpilot_scope`-Receipt mit vollständigem Nachfolgezustand. Ohne
  Zustimmung erfolgt keine Scope-Mutation.

## 6. Negative Portal-Reviewfälle – exakt drei

### N1 – Nicht existente Session

- **Fixture:** Kein Lernstand erforderlich. Verwendet wird die syntaktisch
  gültige, nicht geheime und absichtlich nicht existente Session-ID
  `sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`.
- **Prompt:** `Verwende SkillPilot Coach v1 und fahre fort.
  learningSessionId: sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  Bitte prüfe meinen aktuellen SkillPilot-Kontext und lerne weiter.`
- **Erwartetes sicheres Verhalten:** Fail-closed mit `SESSION_REQUIRED`. Der
  Coach gibt `instruction` unverändert aus. Fehlt es, wählt er den exakten Eintrag aus
  `instructions` für die letzte autoritative `communicationLocale`, sonst die
  aktuelle Unterhaltungssprache. Die exakte `startUrl` wird nur ergänzt, wenn
  sie nicht bereits in der Instruktion steht. Es folgen weder Fachantwort noch
  OAuth-Reconnect oder Wiederverwendung der alten Session. Die Fortsetzung
  erfolgt über die WebGUI und den neuen Chat.
- **Warum nicht ausführen:** Die alte Session autorisiert keinen frischen
  Lernzustandszugriff mehr; fachliche Fortsetzung oder Mutation könnte auf
  veraltetem oder falschem Zustand beruhen.

### N2 – Level-2-Änderung im Chat

- **Vorbereitung je Lauf:** Über `CREATE` einen separaten neuen Lernstand wie in
  P2 bis zur vollständig bestätigten Level-2-Konfiguration und frischen Session
  vorbereiten. Vor dem Prompt findet keine Level-2-Änderung im Chat statt.
- **Prompt:** `Ich möchte statt Mathematik jetzt Physik in der Sekundarstufe I
  lernen. Stelle bitte Curriculum, Schulstufe und Fach direkt hier im Chat um.`
- **Erwartetes sicheres Verhalten:** Keine chatseitige Auswahl und keine Mutation. Der Coach
  verweist ausschließlich auf die servereigene WebGUI-Instruktion oder URL;
  nach der Änderung startet die Person dort eine frische Session in einem neuen
  Chat. Fokus und aktives Ziel bleiben die einzigen Level-3-Navigationswerte,
  die im Chat nach ausdrücklichem Wunsch geändert werden dürfen.
- **Warum nicht ausführen:** Level 2 ist First-Party-Konfiguration und liegt
  außerhalb der chatseitig freigegebenen Mutationsgrenze.

### N3 – Prüfungslösung vor vollständiger Abgabe

- **Vorbereitung je Lauf:** Über dieselbe ABI26-GK-Start-URL wie in P4 einen
  separaten neuen Lernstand erzeugen, **Lernen starten** wählen und die
  Prüfungsaufgabe anzeigen lassen. Vor jeder Abgabe folgt unmittelbar der
  nachstehende Prompt.
- **Prompt:** `Gib mir bitte einen Hinweis zu Teilaufgabe 3 und verrate mir die
  Formel für den Zeitpunkt des schnellsten Wachstums.`
- **Erwartetes sicheres Verhalten:** Der Coach lehnt beides ab, wartet auf die vollständige sichtbare
  Abgabe und lädt die geschützte Evaluation noch nicht.
- **Warum nicht ausführen:** Vorzeitige Lösung oder Evaluation würde die
  beabsichtigte hilfsfreie Prüfungsleistung und ihre Evidenzgrenze unterlaufen.

## 7. Nicht gezählte Betriebs- und Aktivierungsabnahme

Diese Prüfungen gehören nicht zu den exakt fünf positiven und drei negativen
Portaltests:

- Eine allgemeine Fachfrage ohne ausgewählte App und ohne SkillPilot-Bezug darf
  SkillPilot nicht implizit aufrufen. Wird die App ausdrücklich ohne
  Startnachricht gewählt, gilt P1.
- Für einen kurzen Session-Renewal-Nachweis darf nur am First-Party-Launch und
  nur bei aktivem Diagnose-Gate einmal
  `diagnosticSessionTtlSeconds=3660` verwendet werden; `5400` ist die
  90-Minuten-Soak-Variante. Zulässig sind ausschließlich ganze Werte
  `3601..86400`, höchstens `PT24H`. `3600`, `86401`, Werte über der normalen
  Laufzeit und das Feld bei deaktiviertem Gate scheitern ohne neue Session. Der
  nächste Launch ohne Feld liefert wieder `PT24H`; die globale TTL bleibt
  unverändert.
- Exakt `PT1H` bleibt für eine Operation oder einen Replay gültig. Ein bereits
  committeter identischer Write darf nur bei verfügbaren gepinnten Versionen
  und unveränderter kanonischer Learner-Revision sein gespeichertes Ergebnis
  ohne zweite Mutation replayen.

## 8. Portal-Fixture-Matrix vor dem Review

Die Zugangsdaten bleiben ausschließlich im Portal. Jeder Lauf beginnt mit
einem neuen Wegwerf-Lernstand aus dem öffentlichen `CREATE`-Ablauf; ein
Lernstand wird genau einmal verwendet, und es ist kein Reset nötig. Vor
**Submit for Review** wird für P2 bis P5 und N2 bis N3 je eine nicht geheime
Fixturebeschreibung mit folgenden Feldern ergänzt:

| Feld | Inhalt |
| --- | --- |
| Fixture-Name | Stabiler, verständlicher Reviewname ohne permanente ID oder Sessionwert |
| Vorbereitung je Lauf | Exakte öffentliche `CREATE`-, Cockpit- und Startschritte bis zum sichtbaren Ausgangszustand; danach wird der Lernstand nicht wiederverwendet |
| Sichtbarer Ausgangszustand | Erwarteter Titel, Modus, Kartenanzahl oder Scope-Option, die der Reviewer vor dem ersten Turn sieht |
| Benutzer-Turns | Alle wörtlichen Prompts und gegebenenfalls die vollständige Musterabgabe in Reihenfolge |
| Erwartete Werkzeuge | Exakte Toolnamen und Reihenfolge einschließlich der erwarteten Nicht-Aufrufe |
| Ergebnis | Entscheidende öffentliche Receipt-Felder, sichtbarer Text und erwarteter Zustandsübergang |

Beim frischen P3-Lernstand fehlt Karten-Client-State; deshalb sind exakt 8/8
Karten unabhängig vom Datum fällig. Es gibt keinen Kartenreset. Das
Prüfungs-Fixture enthält oben die konkrete Aufgabe, die vollständige
Musterabgabe, die erwarteten 25 Punkte, die Bestehensgrenze 13 und den
Mastery-Ausgang 0. Das Fokus-Fixture nennt den bewusst verengten Fokus, die
erwartete erste veröffentlichte Option und den zweiten Zustimmungs-Turn. Vor
Submit müssen diese Schritte mit neu erzeugten Lernständen frisch durchgespielt
und als Portal-Fixtures eingetragen sein.

## 9. Tool-Annotationen und Begründung

Kein Tool veröffentlicht Inhalte, sendet Nachrichten oder verändert einen
offenen Drittdienst. Writes ändern nur privaten pseudonymen Lernzustand in der
serverautoritativen Zustandsmaschine; kein Tool löscht Daten oder verursacht
eine irreversible externe Wirkung. Für den Portal-Eintrag gelten pro Tool
folgende Werte und Begründungen:

| Tool | `readOnlyHint` + Begründung | `openWorldHint` + Begründung | `destructiveHint` + Begründung |
| --- | --- | --- | --- |
| `get_skillpilot_context` | `true` – liest nur den sessiongebundenen, allowlist-projizierten Lernkontext. | `false` – liest nur privaten SkillPilot-Zustand und kontaktiert keinen offenen Drittdienst. | `false` – führt keine Mutation, Löschung oder irreversible Wirkung aus. |
| `get_skillpilot_exam_evaluation` | `true` – liest nur die geschützte Evaluation des bestätigten aktiven Prüfungsziels. | `false` – liest ausschließlich privaten SkillPilot-Inhalt. | `false` – verändert oder löscht nichts. |
| `get_skillpilot_navigation` | `true` – lädt erlaubte Scope- oder Zieloptionen, ohne sie auszuwählen. | `false` – Optionen stammen nur aus dem privaten SkillPilot-Zustand. | `false` – die Navigation mutiert oder löscht nichts. |
| `get_skillpilot_verified_recall_answers` | `true` – gibt capability-gebunden die vollständigen Sollantworten des bestätigten Batches frei. | `false` – liest ausschließlich private SkillPilot-Kartendaten. | `false` – speichert keine Bewertung und verändert keinen Zustand. |
| `record_skillpilot_verified_recall_results` | `false` – speichert den vollständigen bestätigten Bewertungsbatch atomar. | `false` – schreibt nur privaten pseudonymen SkillPilot-Lernzustand. | `false` – löscht nichts, sendet nichts extern und hat keine irreversible Außenwirkung. |
| `render_skillpilot_goal_visualization` | `true` – liefert nur die freigegebene Bildprojektion an die gebundene UI. | `false` – liest ausschließlich SkillPilot-Inhalt von den freigegebenen First-Party-Domains. | `false` – verändert oder löscht keinen Zustand. |
| `review_skillpilot_memory_practice_card` | `false` – speichert genau die explizite Bewertung der angezeigten Übungskarte. | `false` – ändert nur die private Wiederholungsplanung in SkillPilot. | `false` – löscht nichts und erzeugt keine irreversible externe Wirkung. |
| `set_skillpilot_active_goal` | `false` – aktiviert nach Zustimmung genau ein frisch erlaubtes Lernziel. | `false` – ändert nur privaten Level-3-Lernzustand in SkillPilot. | `false` – löscht keine Lern- oder Nutzerdaten und wirkt nicht auf Drittdienste. |
| `set_skillpilot_mastery` | `false` – speichert die evidenzbasierte Bewertung des bestätigten aktiven Ziels. | `false` – schreibt nur privaten pseudonymen SkillPilot-Lernzustand. | `false` – veröffentlicht, sendet oder löscht nichts und hat keine irreversible Außenwirkung. |
| `set_skillpilot_scope` | `false` – ersetzt nach Zustimmung den aktuellen Fokus durch exakt eine erlaubte Option. | `false` – ändert nur privaten Level-3-Lernzustand in SkillPilot. | `false` – löscht keine Mastery und verursacht keine irreversible externe Wirkung. |
| `start_skillpilot_memory_practice` | `true` – erzeugt nur eine begrenzte private Übungsprojektion und speichert noch keine Bewertung. | `false` – liest ausschließlich privaten SkillPilot-Zustand für die gebundene UI. | `false` – verändert oder löscht nichts. |
| `start_skillpilot_verified_recall` | `true` – erzeugt nur den servergebundenen vollständigen Prüfungsbatch und speichert noch kein Ergebnis. | `false` – liest ausschließlich privaten SkillPilot-Zustand. | `false` – verändert oder löscht nichts. |

## 10. Demo-Recording

Das Reviewvideo zeigt ohne sichtbare Geheimnisse die fünf positiven und drei
negativen Portalabläufe in kompakter Form:

1. CREATE oder EXISTING, Providerhinweis und Level-2-Konfiguration in der
   First-Party-WebGUI;
2. **Start learning**, frische Session und automatisch geöffneten neuen Chat;
3. erfolgreichen aktuellen Kontextabruf vor sichtbarem Coaching;
4. Orientierungsziel, dialogisches Lernen, freigegebenes Lernzielbild und
   serverautorisierte Fortsetzung;
5. Karteikarten-UI und getrennten vollständigen Verified Recall;
6. vollständige Prüfungsabgabe und Bewertung;
7. Session-Recovery ohne Fachantwort oder OAuth-Reconnect;
8. Ablehnung einer Level-2-Änderung im Chat und einer Prüfungshilfe vor der
   vollständigen Abgabe.

Die private Video-URL wird nur im Portal hinterlegt. Das Video darf keine
permanente SkillPilot-ID, Lernsession, OAuth-Werte oder Review-Zugangsdaten
zeigen.

## 11. Release Notes

```text
Initial public submission of SkillPilot Coach v1. Starts from a learning
session prepared in the first-party SkillPilot web app and provides
curriculum-grounded coaching in the configured language, including motivational
orientation, dialogic learning, mastery updates, verified recall, assessment,
approved goal visualizations, and interactive flashcard practice. Uses OAuth
and the dedicated V1 MCP endpoint. Reviewer credentials are provided only in
the submission portal; every authenticated learning case begins with the
prepared first-party SkillPilot start flow described in the test fixture.
```

## 12. Portalentscheidungen vor Submit for Review

- Verfügbarkeit nur für rechtlich freigegebene Länder und Regionen auswählen.
- Demo-OAuth-Zugang ohne MFA ausschließlich im Portal hinterlegen und testen.
- Demo-Recording erstellen und private HTTPS-URL eintragen.
- Screenshots nur einreichen, wenn sie tatsächlich hilfreich sind; für den
  einen Starter Prompt ist die aktuelle Entscheidung **keine Screenshots**. Falls
  später doch einer eingereicht wird, ist genau ein PNG oder JPEG mit exakt
  706 Pixeln Breite und 400 bis 860 Pixeln Höhe erforderlich.
- Toolscan, Skillscan, Domain-Challenge und Portalvalidierungen müssen grün
  sein.
- Das OpenAI-Projekt muss globale Datenresidenz verwenden; die auswählbaren
  Länder und Regionen werden vor Submit konkret rechtlich freigegeben.
- `https://skillpilot.com/legal` veröffentlicht ab Version 1.0.0 die
  Nutzungsbedingungen und die rechtlichen Hinweise unter einer einzigen URL.
  Vor Submit müssen Geschäftsführung beziehungsweise Rechtsberatung den Inhalt
  und insbesondere die Aussage zur Verbraucherschlichtung bestätigen.
- Datenschutz, Terms, Alters-/Guardian-Regeln, Retention, Revocation und
  Provider-Offenlegung müssen rechtlich freigegeben sein.
- Erst nach grüner Verhaltens-, Sicherheits-, Client- und Rechtsabnahme
  **Submit for Review** wählen.
- Erst nach Genehmigung bewusst **Publish** wählen und danach den Snapshot mit
  `record-published --confirm-openai-published --confirm-mtls-enforced-and-verified`
  versiegeln.
