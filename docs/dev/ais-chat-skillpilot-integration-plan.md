# AIS.chat x SkillPilot: interne Integrationsplanung

Status: internes Diskussionspapier, kein Issue, kein Outreach.

Stand der Recherche: 2026-06-21. Geprueft wurden die lokale Kopie `tmp/ais-chat`
auf Branch `main` bei Commit `e4eb3d3f` sowie die oeffentliche Repo-Startseite.
Remote-Branches in der lokalen Kopie wurden nur zur Orientierung gelesen; PR-Status
und Maintainer-Intent sind damit nicht verbindlich.

## Kurzfazit

SkillPilot sollte in AIS.chat nicht als "noch ein Prompt" oder als hart an ein
bestimmtes Modell gebundener Coach eingebracht werden. Der passende Beitrag ist
ein modellagnostischer, backend-autoritativ berechneter Lernnavigationslayer:

- AIS.chat bleibt Chat-, Auth-, Provider-, Budget- und Bundesland-Oberflaeche.
- Die Lernnavigation bleibt deterministische Backend-Logik: Curriculum-Graph,
  Scope, Frontier, aktives Ziel, Mastery und erlaubte Uebergaenge.
- Das LLM bekommt nur kompakten Zustand und ruft Tools auf. Es entscheidet nicht
  selbst, welche Ziele freigeschaltet sind oder ob ein Ziel gemeistert ist.
- SkillPilot-Artefakte sollten als referenzierbare Daten-/Toolchain-Muster
  eingebracht werden: DAG aus `contains`/`requires`, Composition Views,
  Source-Traceability, Maturity-/QA-Regeln, optional SRS/Verified Recall.

Der guenstigste Einstieg waere ein kleiner, interner Proof of Concept:

> Ein AIS.chat-"Lerncoach"-Custom-Chat fuer ein einziges freigegebenes Fach/Scope,
> der ueber Tools den SkillPilot-State liest, ein Frontier-Ziel setzt und nach
> einer kurzen Lerninteraktion Mastery nur fuer das aktive atomare Ziel schreibt.

## Nicht-Ziele fuer diese Phase

- kein GitHub-Issue in `FWU-DE/ais-chat`
- kein Outreach an FWU-DE
- kein Modellupgrade-Vorschlag
- keine Aussage, dass AIS.chat ein externes SkillPilot-Backend uebernehmen soll
- kein Versuch, das ganze SkillPilot-Produkt in AIS.chat zu portieren

## Google-Maps-Lesart: Karte vs Navigation

Eine hilfreiche Produktmetapher ist:

> SkillPilot ist "Google Maps fuer Lehrplaene".

Diese Metapher hat zwei Ebenen, die in der AIS.chat-Planung getrennt bleiben
muessen.

### Kartenebene

Die Kartenebene beschreibt die statische, versionierte Lehrplan- und
Kompetenzlandschaft:

- curriculare Elemente, Lernziele, Cluster und fachliche Teil-Ganzes-Beziehungen
- didaktische Voraussetzungen als `requires`/`setzt didaktisch voraus`
- Quellen, Source-Traceability, Mapping-Records und Composition Views
- MEM/FWU-kompatible RDF/OWL-Repraesentation und semantischer Roundtrip

Auf dieser Ebene laeuft bereits das separate Gespraech mit dem Team der
`FWU-DE/lehrplan-ontologie`. Die initialen oeffentlichen Anker sind:

- Issue: <https://github.com/FWU-DE/lehrplan-ontologie/issues/7>
- Draft PR: <https://github.com/FWU-DE/lehrplan-ontologie/pull/8>

Issue #7 formuliert den SkillPilot-Roundtrip als reproduzierbaren Use Case fuer
die Frage, welche Informationen eine MEM-kompatible Struktur tragen muss, damit
KI-Lernnavigation nachvollziehbar curricular begruendet bleibt. PR #8 schlaegt
bewusst klein die Relation `setzt didaktisch voraus` und ein Pattern fuer
strenge Teil-Ganzes-Semantik vor. Nach den GitHub-Ankern gab es bereits einen
produktiven Online-Austausch; diese Notiz behandelt die Ergebnisse dieses
Meetings nicht als oeffentlich zitierbare Quelle, haelt aber fest, dass die
Kartenebene nicht mehr nur hypothetisch ist.

### Navigationsebene

AIS.chat waere dagegen primaer Navigationsebene:

- aktueller Lernstand als Position im Kompetenzgraphen
- Zielkontext, Scope und geplante Route
- berechnete Frontier als naechste sinnvolle Schritte
- aktives Ziel und erlaubte Uebergaenge
- Lerncoach-Dialog, der diese Backend-Entscheidungen erklaert und begleitet

Die Navigationsebene braucht eine verlaessliche Karte, soll die Karten-Semantik
aber nicht in Prompts, Custom-Chat-Dateien oder AIS.chat-spezifischen Heuristiken
neu erfinden.

### Konsequenz fuer AIS.chat

Ein spaeteres AIS.chat-Issue sollte nicht gleichzeitig die Lehrplan-Ontologie
diskutieren. Es sollte sagen:

- Die Kartenebene wird separat mit der Lehrplan-Ontologie/MEM/FWU geklaert.
- AIS.chat kann auf dieser Kartenebene aufsetzen.
- Der konkrete AIS.chat-Beitrag liegt in der Navigation: Tool-faehiger Coach,
  State Machine, Frontier, aktive Ziele und Mastery-Schreibregeln.

Die Lehrplan-Ontologie-Links koennen als Hintergrund und Evidenzanker dienen,
aber nicht als Bitte an AIS.chat, selbst Ontologie-Maintainer zu werden.

## Relevante AIS.chat-Beobachtungen

### Architektur

AIS.chat ist ein TypeScript/Turborepo-Monorepo mit:

- `apps/chat-bot`: Next.js Chat-Oberflaeche fuer Lehrkraefte und Lernende
- `apps/admin`: Konfiguration fuer Bundeslaender, API Keys, Modelle, Feature Toggles
- `apps/api`: Fastify Proxy-API fuer Providerzugriff, Abrechnung und Zugriffskontrolle
- `packages/ai-core`: Provider-Abstraktion fuer Chat, Streaming, Agentic Streams,
  Embeddings und Bilder
- `packages/shared`: App/Admin-DB, Chat-Services, Assistants, Federal States,
  Knotenpunkt-Client, Tool-Call-Kosten
- `packages/api-database`: separate API-DB fuer Organisationen, Projekte,
  API-Keys und LLM-Modelle

Relevant fuer SkillPilot ist vor allem: AIS.chat hat bereits eine klare Trennung
zwischen Chat-App-State, Provider-/Billing-Layer und Admin-Konfiguration.
Ein Lernnavigationslayer sollte diese Trennung respektieren.

### Modellstrategie

Im lokalen `main` stehen die Defaults in
`tmp/ais-chat/packages/shared/src/llm-models/default-llm-models.ts`:

- Chat default: `gpt-5-nano`
- Auxiliary default: `gpt-4o-mini`
- Auxiliary fallback: `meta-llama/Llama-3.3-70B-Instruct`
- Image default: `imagen-4.0-generate-001`

`getDefaultModel` bevorzugt `gpt-5-nano` und faellt sonst auf das erste
verfuegbare Textmodell zurueck; Mistral wird beim Text-Fallback ausgeschlossen.

Der lokale Remote-Branch `origin/feature/model-matrix-picker` zeigt eine
absehbare Richtung: Modellwahl als Provider-x-Tier-Matrix mit Feldern wie
`tier`, `openSource`, `dataLocation` und einem Toggle `isModelMatrixEnabled`.
Diese Felder sind im lokalen `main` noch nicht im API-Schema. Fuer SkillPilot
folgt daraus: Modellanforderungen sollten als Faehigkeitsprofil beschrieben
werden, nicht als Modellname.

### Agentic Mode und Tools

AIS.chat hat im lokalen `main` bereits einen generischen Agentic-Loop:

- `apps/chat-bot/src/app/api/chat/chat-service.ts` entscheidet ueber
  `user.federalState.featureToggles.isAgenticChatEnabled`, ob der normale
  Stream oder der Agent Loop genutzt wird.
- `apps/chat-bot/src/app/api/chat/build-tools.ts` baut derzeit Tools fuer
  Websuche, Web-Scraping und Datei-/RAG-Retrieval.
- `apps/chat-bot/src/app/api/chat/agent-loop.ts` fuehrt Tool Calls aus.
  Aktuelle Begrenzung: `MAX_AGENTIC_ITERATIONS = 3`,
  `MAX_TOOL_CALLS_PER_ITERATION = 2`.
- `packages/ai-core/src/chat/types.ts` definiert `ToolDefinition`, `ToolCall`,
  `GenerationOptions.tools` und `toolChoice`.
- Providerseitig existiert Tool-/Agentic-Support fuer Azure/OpenAI-Responses,
  OpenAI, IONOS und Google; Claude/Anthropic-Bewegung ist im Log/Branch-Bild
  sichtbar.

Das ist der wichtigste technische Andockpunkt: SkillPilot sollte als Satz
fachlicher Tools in diesen Agentic-Loop passen.

### Custom Chats und Feature Toggles

AIS.chat hat Assistants/Characters/Learning Scenarios. Custom Chats besitzen
konfigurierbare Systemprompts, Dateien/Links, Websuche und Sharing-Logik. Das
spricht fuer einen Lerncoach als zuerst administrativ freigeschalteten Custom
Chat oder als eigenes Chat-Profil, nicht als Umbau der Standardchat-Route.

Feature Toggles leben in `federalState.featureToggles`. Ein SkillPilot-PoC sollte
ebenfalls pro Bundesland/Instanz aktivierbar sein, z. B.:

- `isSkillpilotLearningCoachEnabled`
- spaeter optional `isSkillpilotMasteryWriteEnabled`
- spaeter optional `isSkillpilotVerifiedRecallEnabled`

## SkillPilot-Muster, die gut passen

### 1. Backend als Autoritaet

SkillPilot unterscheidet:

- Layer A: statischer Kompetenzgraph
- Layer B: individueller Lernstand und Mastery
- Layer C: LLM-/Tool-Schicht

Der zentrale Grundsatz passt exakt zu AIS.chat-Agentic-Mode:

> Das LLM fuehrt den Dialog, aber das Backend entscheidet ueber State,
> Frontier, aktive Ziele, Mastery-Schreibregeln und erlaubte Uebergaenge.

Das sollte in AIS.chat als Domain-Service oder externer Tool-Connector
implementiert werden, nicht als Prompt-only-Pattern.

### 2. Kompetenzgraph als kleine, explizite Semantik

SkillPilot braucht fuer den Einstieg keine schwere Ontologie:

- `LearningGoal` als atomare Ziele und Cluster
- `contains` fuer fachliche Zusammensetzung
- `requires` fuer didaktische Voraussetzungen
- `programUnits` und `goalPlacements` fuer Jahrgang/Phase/Modul ohne
  Duplizierung von Zielen
- scope-spezifische Composition Views fuer learner-facing Default-Baeume

AIS.chat sollte nicht versuchen, Zielnavigation aus Textanhaengen oder
Assistant-Prompts zu erraten. Wenn eine Zielstruktur vorhanden ist, muss sie
als Datenstruktur in den Tool-Kontext.

### 3. Frontier statt freie Empfehlung

Die Frontier ist kein KI-Ranking, sondern die berechnete Menge naechster
zulaessiger Ziele:

- Ziel selbst noch nicht gemeistert
- alle effektiven Voraussetzungen gemeistert
- innerhalb des aktiven Scopes sichtbar

Das passt zu einem Lerncoach, der nur aus `state.frontier` oder
`stateMachine.goalOptions` auswaehlen darf. Ein Modell darf Ziele erklaeren,
priorisieren und didaktisch vermitteln, aber nicht eigene Freischaltungen
erfinden.

### 4. State Machine fuer robuste Dialoge

SkillPilot liefert im AI-State ein `stateMachine`-Objekt mit
`state`, `requiredAction`, `goalOptions` und optional `activeGoal`. Das ist
fuer AIS.chat nuetzlich, weil es Tool-Flows stabilisiert:

- Wenn `requiredAction = setActiveGoal`, muss der Coach ein Ziel setzen.
- Wenn ein aktives Ziel gesetzt ist, darf Mastery nur fuer dieses Ziel
  geschrieben werden.
- Wenn eine Session/Route read-only ist, muss das Backend Schreibzugriffe
  ablehnen.

### 5. Privacy: Startcode und Session Token

SkillPilot hat bereits einen Browser-first Startcode-Flow:

- UI erzeugt kurzlebigen Startcode fuer den Lerncoach.
- AI loest Startcode ein.
- Danach nutzt die AI nur ein temporaeres Chat-Session-Token.
- Die dauerhafte `skillpilotId` wird in AI-Session-Responses verborgen.

Wenn AIS.chat selbst der Chat-Host ist, braucht man nicht exakt denselben
ChatGPT-Startcode-Flow. Das Muster bleibt aber wertvoll:

- keine stabilen Lern-IDs in Prompts
- Backend loest temporare Chat-Kontextschluessel intern auf
- Tool-Responses bleiben auf noetigen Lernzustand minimiert
- Logs duerfen keine Tokens oder stabilen Lernschluessel enthalten

### 6. QA- und Publication-Paket statt lose JSONs

SkillPilot besitzt ein Subject Export Package und einen MEM/FWU-Roundtrip. Das
ist fuer AIS.chat wichtiger als die konkrete React-UI. Gleichzeitig gehoert
dieses Paket primaer zur Kartenebene:

- canonical landscape JSON
- learner-facing composition views
- mappings und source-goal references
- memory-card review audits, falls aktiviert
- package validation und SHA-256 Checksums
- optional RDF/OWL-Roundtrip ueber FWU/MEM plus kleines SkillPilot-Profil

Fuer FWU-nahe Diskussionen ist das die staerkste Bruecke: SkillPilot kann die
Karte hinter der Curriculum-Navigation als pruefbares, exportierbares Datenpaket
zeigen. Fuer AIS.chat waere dieses Paket die importierbare oder referenzierbare
Kartengrundlage, auf der die Navigationslogik arbeitet.

## Zwei Integrationsvarianten

### Variante A: Externer SkillPilot-Service hinter AIS.chat-Tools

AIS.chat ruft aus Tool-Handlern einen SkillPilot-Backend-Service auf.

Vorteile:

- kleinster Eingriff in AIS.chat
- SkillPilot-Logik bleibt in einem bereits existierenden Backend
- Startcode/Session-Token-Pattern kann wiederverwendet werden
- schnelle Demo moeglich

Nachteile:

- externer Dienst im AIS.chat-Produkt ist datenschutz- und betrieblich schwerer
  zu akzeptieren
- doppelte Identity- und Session-Fragen
- FWU-DE koennte zurecht eine self-hosted, instanzlokale Loesung bevorzugen

Sinnvoll fuer: internen Proof of Concept, nicht als erste oeffentliche
Produktbehauptung.

### Variante B: SkillPilot-Muster als AIS.chat-internes Learning-Navigation-Modul

AIS.chat importiert ein SkillPilot Subject Export Package oder ein daraus
abgeleitetes kompaktes Datenformat. Learner-State wird in der AIS.chat App-DB
gefuehrt und an AIS.chat-User/Bundesland gebunden.

Vorteile:

- besser passend zu Self-Hosting, Keycloak, Bundesland-Administration und
  AIS.chat-Budgetmodell
- keine externe Lern-ID noetig
- Datenhaltung bleibt unter AIS.chat-Instanzkontrolle
- SkillPilot bleibt als Open-Source-Daten-/QA-Toolchain anschlussfaehig

Nachteile:

- groesserer Implementierungsaufwand
- SkillPilot-Algorithmen muessen in TypeScript portiert oder als Package
  bereitgestellt werden
- Import-/Migrations-/Validierungsfragen muessen geloest werden

Sinnvoll fuer: spaeteren belastbaren Beitrag an AIS.chat.

### Empfehlung

Fuer die interne Planung: mit Variante A als technischer Spike denken, aber den
spaeteren Vorschlag gegenueber AIS.chat als Variante B formulieren.

Das vermeidet den Eindruck, AIS.chat solle ein fremdes Produkt anbinden. Der
anschlussfaehige Kern ist ein generischer, quellennaher Lernnavigationslayer.

## Vorgeschlagener Tool-Schnitt

Der Lerncoach sollte mit wenigen, stabilen Tools starten. Die Toolnamen sind
Arbeitsnamen.

### `skillpilot_get_state`

Input:

```json
{
  "sessionId": "opaque-session-or-conversation-context"
}
```

Output:

```json
{
  "curriculum": { "id": "...", "title": "..." },
  "frontier": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "type": "atomic",
      "nodeKind": "tutor",
      "reason": "..."
    }
  ],
  "activeGoal": null,
  "stateMachine": {
    "state": "needs_active_goal",
    "requiredAction": "setActiveGoal",
    "goalOptions": ["..."]
  },
  "nextAllowedActions": ["setActiveGoal"]
}
```

### `skillpilot_set_active_goal`

Input:

```json
{
  "goalId": "..."
}
```

Backend-Regel:

- Ziel muss in `stateMachine.goalOptions` oder aktueller atomarer Frontier sein.
- Bei Konflikt gibt das Backend den aktuellen State und eine klare Fehlermeldung
  zurueck.

### `skillpilot_record_mastery`

Input:

```json
{
  "goalId": "...",
  "mastery": 0.0
}
```

Backend-Regeln:

- genau ein Ziel pro Call
- Wert zwischen `0.0` und `1.0`
- nur atomare Ziele
- im Normalfall nur aktives Ziel
- nach Write wird aktives Ziel geloescht und Frontier neu berechnet

### `skillpilot_set_scope`

Input:

```json
{
  "goalIds": ["..."]
}
```

Backend-Regel:

- setzt Fokus/Planung, nicht Mastery
- recomputed Frontier kommt im Tool-Result zurueck

### `skillpilot_verified_recall_*` optional

Nur fuer spaetere SRS/Memorization-Knoten:

- `skillpilot_verified_recall_start`
- `skillpilot_verified_recall_answer`
- `skillpilot_verified_recall_result`

Nicht im ersten AIS.chat-PoC erzwingen. Das wuerde den Einstieg unnoetig
verbreitern.

## AIS.chat-Implementierungsskizze fuer einen PoC

### Datenmodell minimal

Falls Variante B:

- neue Tabellen in `packages/shared/src/db/schema.ts`, nicht in der API-DB:
  - `learning_curriculum_package`
  - `learning_goal`
  - `learning_goal_edge`
  - `learning_composition_view`
  - `learning_learner_state`
  - `learning_mastery`
  - optional `learning_active_goal`
- State-Key: AIS.chat `user.id` + Curriculum/Scope, nicht `skillpilotId`
- Bundesland-Scope aus `user.federalState.id`

Falls Variante A:

- kein AIS.chat-Lernstate ausser einer sicheren Conversation-zu-Session-Zuordnung
- Tool-Handler liest/aktualisiert SkillPilot ueber Backend-API
- keine dauerhafte `skillpilotId` im Chatverlauf speichern

### Tool-Einbau

Naheliegende Stelle:

- `apps/chat-bot/src/app/api/chat/build-tools.ts`

Der Builder koennte bei aktivem SkillPilot-Coach zusaetzliche Tools registrieren.
Das sollte nicht global fuer jeden Chat passieren, sondern nur wenn:

- Federal-State-Toggle aktiv ist
- der Chat als SkillPilot/Learning-Navigation-Chat markiert ist
- ein Curriculum/Scope initialisiert wurde
- das ausgewaehlte Modell Agentic/Tool Calls unterstuetzt

### Prompt-Einbau

Naheliegende Stelle:

- `apps/chat-bot/src/app/api/chat/system-prompt.ts`
- oder eigenes Systemprompt fuer SkillPilot-Coach, analog Character/Learning Scenario

Prompt-Regeln sollten knapp und hart sein:

- Folge `stateMachine.requiredAction`.
- Waehle Ziele nur aus Tool-Resultaten.
- Schreibe Mastery nur nach einer passenden Lern-/Check-Interaktion.
- Sage transparent, warum ein Ziel als naechstes dran ist.
- Wenn Tool-State und User-Wunsch kollidieren, erklaere den Blocker und biete
  die zulaessigen Optionen an.

### UI-Einstieg

Erster PoC:

- Admin aktiviert SkillPilot-Coach per Feature Toggle.
- Lehrkraft oder Lernende startet einen vordefinierten Custom Chat.
- Initialer Scope wird aus Bundesland, Rolle, Fach und Kursprofil abgeleitet
  oder in einem kompakten Setup-Dialog gesetzt.

Spaeter:

- eigener Menueintrag "Lerncoach" oder "Lernpfad"
- visuelle Frontier/Progress-Komponente neben dem Chat
- Lehrer-Ansicht fuer Klassen/Scopes

## Modellstrategie fuer das spaetere Issue

Der Vorschlag sollte modellagnostisch formuliert werden.

Geeignete Modelle brauchen:

- stabile Instruktionsbefolgung
- verlaessliches Tool-/Function-Calling
- gute deutschsprachige didaktische Dialogfaehigkeit
- ausreichenden Kontext fuer aktives Ziel, Frontier, Lernstand und Diagnose
- akzeptable Kosten fuer schulische Nutzung
- zur Instanz passende Datenschutz-/Hosting-Eigenschaften

Die Freischaltung von Lernzielen darf nicht durch das Modell entschieden werden.
Sie kommt aus Backend-Logik. Die Modellmatrix ist dafuer hilfreich, weil sie
spaeter "learning-coach capable" als Faehigkeits-/Policy-Ebene abbilden koennte.

## MVP-Schnitt

Minimaler sinnvoller PoC:

1. Ein Fach und ein enger Scope, z. B. Mathematik Gymnasium DE, Sek II oder ein
   kleiner Sek-I-Korridor.
2. Read/write nur fuer:
   - State lesen
   - aktives Ziel setzen
   - Mastery fuer aktives atomares Ziel schreiben
3. Kein SRS, keine Exam-Fotoauswertung, keine Klassenverwaltung.
4. Keine automatische Noten-/Zertifikatslogik.
5. Tool-Calls nur in Agentic Mode.
6. Fallback bei Modell ohne Tool Calls: Lerncoach deaktiviert oder read-only
   erklaerend, nicht state-schreibend.

Erfolgskriterien:

- Der Coach waehlt kein Ziel ausserhalb der Frontier.
- Ein Mastery-Write auf Cluster oder falsches Ziel wird serverseitig abgelehnt.
- Nach Mastery-Update aendert sich die Frontier deterministisch.
- Der Chatverlauf enthaelt keine dauerhafte externe Lern-ID.
- Das Verhalten ist mit mindestens zwei Tool-faehigen Modellfamilien plausibel.

## Risiken und offene Entscheidungen

### Datenschutz und Rollenmodell

Offen:

- Soll Lernstand an AIS.chat-User-IDs haengen oder pseudonym getrennt bleiben?
- Wie sieht Schuelerzugang ohne dauerhaften Login aus?
- Gibt es Lehrer-verwaltete Klassenlisten, und wo liegen Name-zu-Pseudonym-Mappings?

Empfehlung:

- Fuer AIS.chat langfristig an bestehende Auth/Federal-State-Struktur andocken.
- Keine dauerhaften Lern-IDs in Prompts oder Chatverlaeufen.
- Externe SkillPilot-IDs nur im internen Spike verwenden, nicht als
  Produktvorschlag zentrieren.

### Tool-Budget und Agent Loop

AIS.chat begrenzt Iterationen und Tool Calls. SkillPilot-Tools sollten deshalb
kompakt sein:

- `get_state` liefert direkt State + Frontier + Goal Options.
- `set_active_goal` und `record_mastery` liefern jeweils den neuen State zurueck.
- Keine Tool-Kaskaden, bei denen das Modell erst drei Hilfstools braucht, um
  eine Aktion auszufuehren.

### Provider-Faehigkeiten

Nicht jedes Modell/Provider-Setup wird Tools gleich gut koennen. Das spricht fuer:

- explizite Modellfaehigkeit `supportsTools` oder Admin-Policy
- SkillPilot-Coach nur mit geeigneten Modellen
- klare Fallback-Texte, wenn ein Modell nur normalen Chat kann

### Curriculum-Governance

AIS.chat sollte keine verdeckten, promptbasierten Curricula pflegen. Wenn
Lernziele verwendet werden, brauchen sie:

- Quelle
- Version
- Mapping/Composition View
- Validierung
- Lizenz-/Provenienznotiz

SkillPilot Subject Export Packages koennen dafuer als Startformat dienen. Die
semantische Einordnung dieser Kartendaten sollte aber ueber den getrennten
Lehrplan-Ontologie/MEM/FWU-Gespraechsfaden laufen, nicht im AIS.chat-Issue
mitverhandelt werden.

### UX-Abgrenzung

Standardchat, Custom Chat und Lerncoach muessen erkennbar unterschiedliche
Modi bleiben. Lernnavigation ist stateful und schreibt Lernstand. Das sollte
nicht unbemerkt in jedem Assistant passieren.

## Spaetere Issue-These

Falls daraus spaeter ein oeffentliches Issue werden soll, sollte die These etwa
so lauten:

> AIS.chat hat bereits die Bausteine fuer provideruebergreifende, agentic
> Custom Chats. Auf einer separat validierten Kartenebene aus Lehrplan- und
> Kompetenzgraphdaten koennte AIS.chat einen modellagnostischen
> Lernnavigationslayer anbieten: Das Backend berechnet Frontier, aktive Ziele
> und erlaubte Uebergaenge; der Chat-Coach nutzt Tools, um Lernende entlang
> dieser Struktur zu begleiten. Das LLM bleibt austauschbar; fachliche
> Freischaltung und Lernstand bleiben deterministische Backend-Logik.

Wichtig: Im ersten oeffentlichen Beitrag nicht mit "SkillPilot braucht Modell X"
starten, sondern mit "SkillPilot-Muster passen zu AIS.chat Agentic/Tooling und
Modellmatrix".

## Naechste interne Schritte

1. Entscheiden, ob der erste Spike Variante A oder Variante B simuliert.
2. Ein minimales Tool-Contract-JSON fuer `get_state`, `set_active_goal`,
   `record_mastery` schreiben.
3. Ein kleines Subject-Package oder Mock-Curriculum fuer AIS.chat-Testzwecke
   ableiten.
4. Die Lehrplan-Ontologie-Anker als Kartenebenen-Referenz knapp zusammenfassen,
   ohne daraus schon AIS.chat-Outreach zu machen.
5. Pruefen, ob AIS.chat-Agentic-Mode pro Custom Chat sauber aktivierbar ist oder
   ob erst `origin/feat/TD-1193-agentic-custom-chats` abgewartet werden sollte.
6. Erst danach aus dieser Notiz ein moegliches Issue-/Discussion-Draft machen.
