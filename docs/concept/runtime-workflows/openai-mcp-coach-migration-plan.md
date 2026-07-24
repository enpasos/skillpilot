# Migration des SkillPilot-Coaches zur OpenAI-MCP-App

**Stand:** 23. Juli 2026

**Status:** deutsche data-only Implementierung lokal abgeschlossen; Deployment,
echte ChatGPT-OAuth-Acceptance und Cutover ausstehend  
**Ziel:** den ursprünglichen deutschen GPT-Lerncoach funktional als
providergehostete MCP-App wiederherstellen, ohne sichtbare technische Schlüssel
und ohne von Custom-GPT-Action-Retention abhängig zu sein.

Die übergeordnete Architekturentscheidung ist in
[skillpilot-owned-coach-architecture.md](skillpilot-owned-coach-architecture.md)
beschrieben. Dieses Dokument übersetzt sie in eine konkrete, schrittweise
Migration mit Abnahmekriterien, Cutover und Rollback.

## 1. Entscheidung

SkillPilot migriert **nicht** den sichtbaren Session-Workaround und baut den
bestehenden Custom GPT auch nicht weiter aus. Stattdessen entsteht zunächst eine
deutsche, UI-lose OpenAI-MCP-App:

```text
ChatGPT App „SkillPilot Coach (Deutsch)"
        |
        | MCP + OAuth Bearer
        v
https://skillpilot.com/api/openai/de/mcp
        |
        | Reverse Proxy auf denselben öffentlichen Backenddienst
        v
Spring Boot
        |
        +-- isolierter OpenAI-DE-MCP-Transport und Toolvertrag
        +-- OAuth / OpenAI-DE-Verbindung / Autorisierung
        +-- CoachStateProjection
        +-- CoachToolFacade
        +-- LearnerService / Curriculum / Datenbank
```

Der Chat bei OpenAI bleibt die Benutzeroberfläche. Die Modellnutzung läuft über
das eigene Providerkonto der lernenden Person und wird dort im gewählten
kostenlosen oder fest bepreisten Consumer-Tarif kontingentiert beziehungsweise
abgerechnet. SkillPilot ruft in diesem Coach-Pfad keine kostenpflichtige
OpenAI-Modell-API auf.

Die deutsche App wird vollständig stabilisiert, bevor eine englische App
abgeleitet wird. Ein Widget ist eine spätere Verbesserung, keine Voraussetzung
für die erste vollständige Migration.

## 2. Was der Retentionstest ändert – und was nicht

Der UI-lose MCP-Test vom 22. Juli 2026 hat in einem normalen ChatGPT-Chat
nachgewiesen:

- Werte aus `structuredContent` konnten innerhalb eines Assistant-Turns an ein
  zweites Tool übergeben werden;
- dieselben ausschließlich strukturiert gelieferten Werte konnten nach einer
  weiteren Usernachricht wiederverwendet werden;
- eine explizite, getrennte Verifikation im nächsten Turn war erfolgreich;
- die Custom-GPT-Action-Regression wurde in diesem kurzen MCP-Szenario nicht
  reproduziert.

Details stehen in
[RESULTS-2026-07-22.md](<../../../ai/openai app/mcp-regression/RESULTS-2026-07-22.md>).

Das ist die Grundlage für die UI-lose erste Version: Fachliche IDs dürfen in
`structuredContent` bleiben und müssen dem Lernenden nicht als Schlüssel gezeigt
werden. Der Test beweist jedoch noch nicht das Verhalten nach langen Dialogen,
Kontextkompaktierung, Reload, parallelen Chats oder Hoständerungen. Deshalb gilt
weiterhin:

> Chat-Kontext ist ein komfortabler Transport, aber niemals die autoritative
> Ablage des Lernzustands.

Bei fehlendem oder möglicherweise veraltetem Kontext lädt die App den aktuellen
Zustand argumentlos aus dem SkillPilot-Backend. Jede Mutation wird dort erneut
gegen Identität, Zustandsmaschine und aktuelle fachliche Optionen geprüft.

## 3. Nicht verhandelbare Grenzen

1. **Keine sichtbaren Transportwerte:** keine Session-Tokens, Choice-Keys oder
   internen Lernenden-IDs im Chat.
2. **Backend als einzige Autorität:** Curriculum, Scope, aktives Ziel, Mastery,
   Recall und Prüfungszustand liegen dauerhaft nur bei SkillPilot.
3. **Provider bezahlt das Modell:** kein stiller Fallback auf eine von
   SkillPilot bezahlte OpenAI-API.
4. **Deutsch zuerst:** ein deutscher Vertrag ohne `language`-Parameter; Englisch
   folgt erst nach bestandener deutscher Acceptance Suite.
5. **UI-los zuerst:** keine Widget-Ressource und kein `outputTemplate` im ersten
   produktionsnahen Vertrag.
6. **Alte Quellen bleiben stehen:** `ai/openai custom gpt/` und
   `ai/openai-custom-gpt-visible-session/` werden weder überschrieben noch in den
   neuen App-Ordner gemischt.
7. **MCP-Regression bleibt Testcode:** `ai/openai app/mcp-regression/` wird nicht
   Teil des produktiven Toolkatalogs.
8. **Funktionsparität statt Methodenparität:** Entscheidend sind vollständige
   Lernabläufe, nicht identische alte HTTP-Operationen.

## 4. Zieltopologie

### 4.1 Mehrere isolierte MCP-Server im Spring-Prozess

Die globale Spring-AI-MCP-Autokonfiguration wird nicht als produktive
Mehrprovidergrenze verwendet: Sie erzeugt einen einzelnen Transport und sammelt
Tool-Spezifikationen global ein. Stattdessen werden mit dem bereits vorhandenen
Java-MCP-SDK explizit mehrere Server verdrahtet:

```text
Spring Boot
  +-- /api/openai/de/mcp
  |     +-- eigener WebMvcStatelessServerTransport
  |     +-- eigener McpStatelessSyncServer
  |     +-- OpenAI-DE-Instructions
  |     +-- ausschließlich OpenAI-DE-Tools
  |
  +-- /api/claude/mcp
        +-- eigener WebMvcStatelessServerTransport
        +-- eigener McpStatelessSyncServer
        +-- Claude-Instructions
        +-- ausschließlich Claude-Tools
```

Die Server verwenden `.immediateExecution(true)`, damit der auf dem
Servlet-Thread validierte Spring-Security-Kontext während des Toolaufrufs
erhalten bleibt. Tool-Spezifikationen werden pro Server ausdrücklich registriert
und niemals global aus allen `ToolCallbackProvider`-Beans zusammengesammelt.

Das Java-MCP-SDK unterstützt `outputSchema`, Tool-Annotationen, Tool-/Result-
`meta` und echtes `structuredContent`. Der OpenAI-DE-Vertrag verwendet deshalb
einen kleinen eigenen Spec-/Result-Adapter statt ausschließlich des allgemeinen
Spring-`@Tool`-Konverters.

Der bestehende Node-Code unter `ai/openai app/` bleibt ein isoliertes
Regressionstest- und Apps-UI-Testbett. Er ist kein produktiver Proxy, hält keine
Produktividentität und wird nicht zwischen ChatGPT und Spring geschaltet.

### 4.2 Sicherheits- und Fachgrenze

Spring ist Transport-, Sicherheits- und Fachgrenze. Der eigene OpenAI-DE-Adapter
liegt unmittelbar an `CoachToolFacade` und `CoachStateProjection`. Er:

- validiert bei **jedem** Aufruf Token, Issuer, Audience, Ablauf und Scope;
- löst das opake OpenAI-Verbindungssubjekt serverseitig auf den Lernenden auf;
- projiziert ausschließlich allowlist-basierte Coach-Daten;
- revalidiert jede Mutation gegen den aktuellen Zustand;
- gibt nach jeder Mutation den frisch projizierten Folgezustand zurück;
- protokolliert weder Token noch interne SkillPilot-ID, komplette Prompts oder
  Schülerantworten.

Der MCP-Endpunkt ist ausschließlich über den dafür vorgesehenen stabilen HTTPS-
Origin öffentlich erreichbar. Andere Backendendpunkte und interne Identitäten
werden dadurch nicht freigegeben. Falls später aus echten Betriebsgründen eine
Prozesstrennung erforderlich wird, kann sie hinter unveränderter öffentlicher URL
erfolgen.

### 4.3 Stabile öffentliche URLs

Für die erste Produktions-App wird der bereits betriebene SkillPilot-Origin mit
einem dauerhaft sprach- und providerspezifischen Pfad verwendet:

```text
MCP Resource: https://skillpilot.com/api/openai/de/mcp
OAuth Issuer: https://skillpilot.com/api/openai/de
```

Der Tunnel bleibt ausschließlich Entwicklungsinfrastruktur. Ein interner
Serverwechsel darf die veröffentlichte MCP-URL nicht verändern. Ein späterer
eigener Subdomain-Origin wäre eine neue veröffentlichte Resource und darf erst
nach vollständig passender Metadata-, Audience- und Proxy-Konfiguration
eingeführt werden.

## 5. Deutscher MCP-Vertrag der ersten Version

Die Werkzeuge sind deutsch beschrieben, fachlich eng geschnitten und besitzen
keinen Sprachparameter. Die Namen bleiben technisch eindeutig:

| Tool | Aufgabe |
| --- | --- |
| `get_skillpilot_context_de()` | SkillPilot-Lerncoach bei einer natürlichen SkillPilot-Lernabsicht starten oder fortsetzen sowie den kompakten Lernzustand argumentlos rehydrieren |
| `get_skillpilot_navigation_de(target)` | Optionen für einen ausdrücklichen Wechsel von Curriculum, Personalisierung, Scope oder Ziel laden |
| `set_skillpilot_curriculum_de(curriculumId)` | Ein Curriculum aus den aktuell erlaubten Optionen setzen |
| `set_skillpilot_personalization_de(goalIds, filterIds)` | Kurs- und Profilausprägung setzen |
| `set_skillpilot_scope_de(goalIds)` | Lernumfang setzen |
| `set_skillpilot_active_goal_de(goalId, redirect)` | Erlaubtes Frontier-Ziel aktivieren |
| `set_skillpilot_mastery_de(goalId)` | Das aktive atomische Nicht-SRS-Ziel nach harter Evidenz mit Mastery `1.0` abschließen |
| `start_skillpilot_verified_recall_de(goalId, batchSize)` | Kartenprüfung starten oder fortsetzen |
| `get_skillpilot_verified_recall_answer_de(goalId, cardId)` | Sollantwort erst nach der Lernendenantwort laden |
| `record_skillpilot_verified_recall_result_de(goalId, cardId, passed, feedback)` | Recall-Ergebnis speichern |
| `get_skillpilot_exam_evaluation_de(goalId)` | Freigegebene Lösung und Bewertungsraster erst nach vollständiger Abgabe laden |

Ein generisches `applyChoice` ist für die UI-lose Version nicht vorgesehen. Das
Modell verwendet die fachlichen IDs aus dem zuletzt geladenen
`structuredContent`; bei Unsicherheit lädt es den Zustand erneut. Eine spätere
Widget-Version darf opake, kurzlebige Choice-Referenzen und app-exklusive Tools
ergänzen.

`chooseMemoryMode` braucht kein eigenes Tool: „Im Cockpit üben“ führt zum
Cockpit-Link, „Mit Lerncoach prüfen“ startet Verified Recall. Ein `retest`-Feld
wird erst veröffentlicht, wenn es vom Backend tatsächlich fachlich ausgewertet
wird.

### 5.1 Context-Ergebnis

`get_skillpilot_context_de()` ist trotz seines stabilen technischen Namens das
eindeutige Bootstrap-Werkzeug. Wenn die App ausgewählt oder SkillPilot genannt
wurde und die lernende Person lernen, üben, starten, fortsetzen oder den
gespeicherten Lernstand verwenden möchte, muss es vor der ersten fachlichen
Antwort laufen. Eine allgemeine Lehrplanübersicht oder ein frei erfundener
Lernpfad ist kein zulässiger Ersatz. Dasselbe Werkzeug rehydriert den Zustand
nach einem neuen Chat, Reload, langem Dialog, möglicher Kontextkompaktierung,
Unsicherheit oder Konflikt.

Es serialisiert **nicht** den rohen
`UnifiedLearnerStateResponse`. Der kompakte Vertrag enthält nur:

- Lernzustand, `requiredAction` und Interaktionsmodus;
- Curriculumtitel, Fach und fachliche öffentliche ID;
- aktives Ziel mit Titel, Beschreibung, Typ und Cockpit-Link;
- bei Prüfungen ausschließlich Aufgabe und Maximalpunkte;
- aktuell erlaubte Optionen mit fachlicher ID, Label und Beschreibung;
- Frontier, relevante Ressourcen und nächste erlaubte Werkzeuge;
- Scope- und Curriculumfortschritt sowie Abschlussstatus;
- eine kurze zustandsabhängige Arbeitsanweisung.

`content` enthält eine kurze natürliche Zusammenfassung. IDs und strukturierte
Optionen bleiben in `structuredContent` und werden nicht unnötig in der
Chatantwort wiederholt. Zielvisualisierungen erscheinen im Chat nur als sicherer
Cockpit-Deep-Link.

## 6. Migration der bisherigen Knowledge-Dokumente

Eine MCP-App besitzt nicht dieselbe Knowledge-Upload-Fläche wie ein Custom GPT.
Die bisherigen Dokumente werden deshalb nach Funktion migriert:

| Bisheriger Inhalt | Zielort |
| --- | --- |
| kurze globale Rollen-, Sprach-, Stil- und Coachingregeln | deutsche MCP-Server-`instructions` |
| Regeln für genau einen Ablauf | Toolbeschreibung und Ein-/Ausgabeschema |
| zustandsabhängige Aufgabe, Rubrik, Recall- oder Exam-Regel | dynamisches `structuredContent` des jeweiligen Tools |
| Autorisierung, Mastery-, Recall- und Exam-Invarianten | Spring-Backend-Guards und Domainlogik |
| echte größere Nachschlageinhalte | später optionaler read-only `search`/`fetch`-Index |
| Widgetdarstellung | später `_meta`; niemals fachliche Modellanweisung |

Die fachliche Ausgangsbasis sind insbesondere die aktuellen Dokumente
`coaching_and_mastery.md` und `exam_proctor.md` der Visible-Session-Pakete sowie
die ursprünglichen deutschen Systeminstruktionen. Nicht übernommen werden die
transportbezogenen sichtbaren Relay-Regeln.

Die vollständige Quellen-/Zielmatrix einschließlich der bewusst obsoleten
Relay-Regeln und der verbleibenden modellseitigen Grenzen steht in
[openai-mcp-coach-knowledge-parity.md](openai-mcp-coach-knowledge-parity.md).

Kritische Bewertungsregeln dürfen nicht davon abhängen, dass das Modell freiwillig
ein Dokument sucht. Der jeweilige Workflow liefert sie unmittelbar mit. Dazu
gehören insbesondere:

- alternative fachlich korrekte Lösungswege und Darstellungen anerkennen;
- explizit verlangte Formate weiterhin prüfen;
- keine Wortlautgleichheit mit einer Musterlösung verlangen;
- Mastery erst nach der vorgesehenen Evidenz setzen;
- im Prüfungsmodus keine lösungslenkende Nachfrage stellen;
- Recall-Antworten erst nach der Lernendenantwort freigeben.

## 7. OAuth und Lernendenbindung

Die verbindliche Trennung von automatischem OAuth-Token-Transport,
First-Party-Browser-Binding, OAuth-Subject-Zuordnung und absoluter
24h-Lernsession steht in
[openai-mcp-oauth-learner-session-architecture.md](openai-mcp-oauth-learner-session-architecture.md).
Bei Widersprüchen ist dieses abgegrenzte Architekturdokument für Identitäts- und
Sitzungsfragen maßgeblich.

Die bestehende Claude-OAuth-Implementierung dient als technische Vorlage, wird
aber nicht als OpenAI-Alias verwendet. OpenAI-DE erhält eigene Konfiguration,
Scopes, Verbindungen, Binding Grants, Tests und Widerrufslogik.

### 7.1 Verbindungsablauf

1. Der Nutzer wählt im SkillPilot-Cockpit „Mit ChatGPT verbinden“. Vor jedem
   Backendstart muss der Browser ausdrücklich bestätigen, dass die für das
   OpenAI-Konto geltende Mindestalterregel erfüllt ist und bei unter
   18-Jährigen die Erlaubnis eines Elternteils oder einer erziehungsberechtigten
   Person vorliegt. Die Bestätigung gilt nur für das aktuelle pseudonyme
   SkillPilot-Profil in diesem Browser-Tab; ein Profilwechsel fragt neu.
2. Das Backend akzeptiert ausschließlich
   `providerEligibilityConfirmed=true`, bevor es Lernzustand liest oder
   verändert. Fehlend oder `false` ergibt `403`. SkillPilot speichert dafür
   weder Geburtsdatum noch Altersprofil; die Angabe ist eine bewusste
   Selbstbestätigung und keine Identitäts- oder Altersverifikation.
3. SkillPilot erzeugt einen einmaligen, nur gehasht gespeicherten Binding Grant
   und speichert daran den engen typisierten Start-Intent, ohne den Lernstand zu
   verändern.
4. Der Grant wird für fünf Minuten in einem `HttpOnly`, `Secure`,
   `SameSite=Lax`-Cookie an den OAuth-Ablauf gebunden.
5. Beim Austausch des Binding Grants legt SkillPilot eine noch nicht
   autorisierte Verbindung und einen Pending Launch an; der Lernstand bleibt
   weiterhin unverändert.
6. Authorization Code mit PKCE `S256` verbindet das OpenAI-App-Subjekt mit dem
   Lernenden. Erst bei erfolgreicher Ausgabe des ersten Access Tokens wendet
   SkillPilot den Pending Launch unter Learner- und Datensatz-Lock an.
   Tokenpersistenz, Intent-Anwendung und Autorisierungsmarkierung committen oder
   rollen gemeinsam zurück.
7. Erst nach erfolgreicher Anwendung erhält der Pending Launch `consumed_at`;
   anschließend wird die Verbindung als autorisiert markiert.
8. Das opake OpenAI-Subjekt wird OAuth-Principal; die interne SkillPilot-ID
   verlässt das Backend nie. Ein MCP-Toolaufruf liest nur diese Verbindung und
   konsumiert keinen Start-Intent.
9. Bei erfolgreicher Aktivierung wird eine vorherige deutsche Verbindung
   kontrolliert widerrufen.

Bei einer bereits autorisierten Verbindung wird der typisierte Intent direkt
beim Cockpit-Start unter Learner-Lock angewendet und als bereits konsumierter
Pending Launch protokolliert. In beiden Pfaden bereitet der Intent den
Backendzustand und eine natürliche sichtbare Startnachricht vor. Er wird
bewusst keiner konkreten ChatGPT-Konversation zugeordnet; neue oder parallele
Chats rehydrieren den gemeinsamen Lernstand aus dem Backend.

Die beiden Zeitstempel haben unterschiedliche, absichtlich enge Bedeutungen:
`openai_de_binding_grant.consumed_at` markiert den einmaligen Austausch des
Browser-Grants, `openai_de_pending_launch.consumed_at` die erfolgreiche
serverseitige Anwendung des Intents. Abgelaufene Grants und Launches werden
periodisch bereinigt. Nie autorisierte Verbindungen aus abgebrochenen
OAuth-Abläufen werden nach Ablauf der Launch-TTL widerrufen; ihre Pending
Launches, Authorization Codes und Consents werden gelöscht, ohne autorisierte
Verbindungen anzutasten.

Eine Installation direkt in ChatGPT ohne vorbereitete Bindung führt auf eine
verständliche SkillPilot-Verbindungsseite, nicht auf einen technischen Fehler.

### 7.2 Vorgesehene Sicherheitsparameter

| Objekt | Vorgabe |
| --- | --- |
| Binding Grant | 5 Minuten, einmalig |
| Access Token | 30–60 Minuten |
| Refresh Token | höchstens 30 Tage, rotierend |
| Lernsession | absolut höchstens 24 Stunden; weder Toolaufruf noch Token-Refresh verlängert sie |
| Audience/Resource | exakt `https://skillpilot.com/api/openai/de/mcp` |
| Scopes | getrenntes OpenAI-DE-Read und -Write |
| PKCE | ausschließlich `S256` |

Der `resource`-Wert wird bei Authorization- und Token-Request exakt und ohne
Trimmen oder Slash-Normalisierung verglichen. Spring speichert ihn im
Authorization Request; die Introspektion jedes Access Tokens prüft diesen
persistierten Wert erneut und veröffentlicht nur danach dieselbe URL als
`aud`. Damit ist ein technisch gültiges Token für eine andere MCP-Ressource
nicht im deutschen Coach verwendbar; die Bindung bleibt auch nach einem
Refresh erhalten.

`_meta["openai/session"]`, Toolargumente, sichtbare Codes und „zuletzt verwendete
Nutzer“ sind niemals Identitätsquellen. `openai/session` darf höchstens gehasht
zur technischen Fehlerkorrelation verwendet werden.

Der MCP-Host veröffentlicht Protected-Resource-Metadaten. Spring liefert
ungültige oder fehlende Autorisierung als standardkonforme
`WWW-Authenticate`-Challenge einschließlich `_meta["mcp/www_authenticate"]`
zurück.

## 8. Vollständige Workflow-Parität

Der deutsche Coach gilt erst als migriert, wenn folgende Nutzerreisen auf realen
SkillPilot-Daten funktionieren:

| Nutzerreise | Abnahmekriterium |
| --- | --- |
| Verbinden und Wiederaufnahme | OAuth statt sichtbarem Session-Token; argumentloser Context-Read |
| Natürlicher Einstieg | „Mathe in der Oberstufe in Hessen“ wird aufgelöst; nur die echte offene Frage GK/LK bleibt |
| Curriculum/Profil/Scope | alle aktuellen Auswahl- und Wechselabläufe funktionieren |
| Frontier und Zielwahl | nur fachlich erlaubte Ziele; Backend revalidiert |
| Erklären und Üben | ursprüngliche didaktische Regeln und Ressourcen bleiben erhalten |
| Lösung bewerten | gleichwertige korrekte Wege werden anerkannt; explizite Anforderungen bleiben bindend |
| Mastery | nur erlaubter Wert und korrektes aktives Ziel; frischer Folgezustand |
| Fortschritt und Abschluss | Scope- und Curriculumfortschritt konsistent |
| Verified Recall | Start, Antwortfreigabe, Ergebnis, Tageslock und automatische Mastery |
| Prüfung | Aufgabe ohne Lösung; Auswertung erst nach vollständiger sichtbarer Abgabe; keine Nachfrage |
| Fehler und Retry | keine Doppelmutation; sinnvoller Reload bei Konflikt |
| Reload/Kompaktierung | Zustand wird ohne Chat-Key aus dem Backend rehydriert |
| Parallele Chats | keine Vermischung, unzulässige Writes werden abgewehrt |

Für die erste UI-lose Parität sieht SkillPilot die freie Chatantwort weiterhin
nicht als eigene Abgabe. Das entspricht dem bisherigen providergehosteten Coach:
Das Modell sieht die Antwort und bewertet sie, das Backend schützt aber die
Freigabe der Musterlösung. Ein kryptografisch starker Abgabenbeleg folgt später
über ein Widget mit `attemptId`, direkter Abgabe und Submission Receipt. Diese
spätere Härtung darf den UI-losen Start nicht blockieren, muss aber vor
hochwirksamen Prüfungs- oder Zertifizierungsfällen erneut bewertet werden.

## 9. Umsetzungsetappen und Exit-Gates

### Etappe 0 – Baseline einfrieren

- Legacy-, Visible-Session-, MCP-Prototyp- und Regressionstest-Quellen getrennt
  markieren;
- die vollständige deutsche Nutzerreise und bisherigen Knowledge-Regeln als
  Acceptance-Manifest erfassen;
- die positiven MCP-Testbelege archivieren;
- keine bestehenden Startpfade ändern.

**Exit:** reproduzierbare Baseline und vollständige Paritätsmatrix.

**Implementierungsstand:** abgeschlossen. Custom-GPT-, Visible-Session-,
Node-Prototyp- und MCP-Regressionsquellen bleiben getrennt.

### Etappe 1 – Produktionsfähiges Skelett

- globale MCP-Autokonfiguration durch explizit isolierte Spring-MCP-Server für
  Claude und OpenAI-DE ersetzen;
- separaten deutschen Spring-Paket-/Vertragsbereich anlegen;
- `CoachStore`, UI-Ressourcen und Node-Demodaten vollständig außerhalb dieses
  Laufzeitpfads halten;
- kompaktes OpenAI-DE-Context-DTO anlegen;
- `get_skillpilot_context_de()` zunächst mit synthetischem OAuth-Principal und
  sicherem Testlernenden Ende-zu-Ende verbinden;
- Protected-Resource-Metadaten, Health und Readiness ergänzen.

**Exit:** Die Developer-App lädt echten, sicher projizierten Lernzustand ohne
sichtbaren technischen Schlüssel.

**Implementierungsstand:** Spring-Transport, echte Projektion und isolierte
Tool-Allowlist sind lokal abgeschlossen; der externe Developer-App-Lauf folgt
nach Deployment.

### Etappe 2 – OpenAI-DE-OAuth

- providerfähigen gemeinsamen Authorization-Server-Kern aus der Claude-Vorlage
  herauslösen, ohne Claude und OpenAI datenbankseitig zu vermischen;
- OpenAI-DE-Verbindung, Binding Grant, Scopes, Token und Widerruf implementieren;
- Resource/Audience-, PKCE-, Replay-, Cross-Learner- und Expiry-Tests ergänzen;
- Cockpit-Aktion „Mit ChatGPT verbinden“ hinter Feature Flag bereitstellen.

**Exit:** Zwei Testlernende sind strikt getrennt; kein fachlicher Toolaufruf ist
ohne gültige, passende Verbindung möglich.

**Implementierungsstand:** OAuth-/Binding-Code, additive Persistenzmigration,
PKCE-, Resource-, Refresh-, Revocation- und Isolationstests sind lokal
abgeschlossen. Ein strikt datenloser Discovery-Bootstrap löst die zirkuläre
Erstkonfiguration: ChatGPT kann MCP- und OAuth-Metadaten prüfen, bevor die
app-spezifische Callback-URL bekannt ist. Die öffentliche Client-ID wird von
SkillPilot stabil als `skillpilot-chatgpt-de-prod` gewählt und identisch in
beiden Systemen eingetragen; ausschließlich die echte Callback-URL wird aus der
App-Verwaltung übernommen. Der Bootstrap stellt keine Tools, Token-Endpunkte,
Lernerdaten oder Coach-Readiness bereit und wird vor dem Vollbetrieb deaktiviert.

### Etappe 3 – Normaler Lernworkflow

- Curriculum, Personalisierung, Scope, Navigation und Zielwahl anbinden;
- ursprüngliche Coaching- und Bewertungsregeln in Instructions, Tools und
  dynamische Context-Antworten migrieren;
- Ressourcen, Fortschritt, Erklärung, Aufgabe und Mastery abnehmen;
- natürlicher Einstieg mit möglichst nur einer echten Rückfrage testen.

**Exit:** Der vollständige normale deutsche Lernzyklus funktioniert besser als
der sichtbare Key-/Value-Workaround und ohne Funktionsverlust zum ursprünglichen
Coach.

**Implementierungsstand:** elf deutsche Werkzeuge, Context-Projektion,
Knowledge-Verteilung und Cockpit-Canary sind lokal implementiert. Die fachliche
End-to-End-Acceptance in ChatGPT steht noch aus.

### Etappe 4 – Recall und Prüfung

- drei Verified-Recall-Tools anbinden und alle Domain-Grenzen testen;
- sichere Prüfungsprojektion und getrennte Evaluation anbinden;
- alternative richtige Lösungswege, explizite Formanforderungen,
  Handschrift-Leseunsicherheit und „keine Nachfrage im Prüfungsmodus“ als
  Regressionstests aufnehmen.

**Exit:** Recall- und Exam-Acceptance-Suite vollständig grün.

**Implementierungsstand:** Backendvertrag und Regressionstests sind grün; die
sichtbare reale Chatabgabe und Modellbewertung müssen im Providerhost abgenommen
werden.

### Etappe 5 – Resilienz und Langzeittest

Mindestens folgende reale ChatGPT-Tests werden durchgeführt:

- zehn Wiederholungen der kurzen Cross-Turn-Retention;
- realistische große Context-Payloads;
- 20-, 50- und längere Dialogverläufe;
- provozierter Kontextdruck beziehungsweise Kompaktierung;
- Seiten-Reload, Browserneustart und neuer Chat mit OAuth-Rehydration;
- parallele Chats desselben Lernenden;
- abgelaufene Token, Token-Refresh, Widerruf und erneute Verbindung;
- Timeout, `409`, `429`, Retry und Backend-Neustart;
- Web und Mobilgerät in den vorgesehenen Tarifen und Regionen.

**Exit:** Kein Test benötigt sichtbare technische Schlüssel; Kontextverlust
führt höchstens zu einem frischen Context-Read, nicht zu verlorenem Lernzustand.

### Etappe 6 – Gestufter Cutover Deutsch

- neuen Frontendvariantentyp `openai-mcp` additiv neben `legacy` und
  `visible-session` einführen;
- bestehende Varianten und Routen unverändert lassen;
- internen Pilot, kleinen Canary und anschließend schrittweise Freigabe fahren;
- Installation, Verbindungsablauf und Rückkehr aus dem Cockpit praktisch prüfen;
  kein nicht dokumentiertes ChatGPT-Deep-Link-Verhalten voraussetzen;
- erst nach bewiesener App-Verfügbarkeit im kostenlosen beziehungsweise
  festpreisbasierten Zieltarif den MCP-Pfad zum Standard machen.

**Exit:** Die deutsche MCP-App ist der Standardpfad; Visible Session bleibt
sofort aktivierbarer Rückfallpfad.

### Etappe 7 – Optionale UI

- nur Interaktionen mit klarem Mehrwert als Widget ergänzen, zuerst Auswahl und
  direkte Abgabe;
- app-exklusive Tools, kurzlebige Referenzen und Submission Receipts ergänzen;
- keine bereits stabile dialogische Funktion unnötig ins Widget verlagern.

**Exit:** UI verbessert nachweislich Bedienung oder Integrität, ohne den
data-only Coach zu schwächen.

### Etappe 8 – Englisch

- eigenen englischen Vertragsordner, Endpunkt, OAuth-Client, Instructions,
  Knowledge-Verteilung und Acceptance Suite erstellen;
- Fachkern wiederverwenden, aber keine Laufzeit-Sprachvariable und keinen
  Universalvertrag einführen;
- separat veröffentlichen, beobachten und zurückrollen können.

**Exit:** eigenständig grüne englische Nutzerreisen.

## 10. Deployment, Observability und Rollback

### 10.1 Umgebungen

- **Lokal:** ein Spring-Backend mit getrennten MCP-Endpunkten, Tunnel nur für
  Developer Mode, synthetische Daten bis zur vollständigen Mandantentrennung.
- **Staging:** eigener stabiler Origin, eigene Developer-App, eigener OAuth-
  Client, produktionsähnliche Datenbank ohne reale Lernendendaten.
- **Produktion:** das bestehende Spring-Backend als immutable Artefakt mit
  Git-SHA und MCP-Contract-Hash, Blue/Green-Umschaltung hinter stabilem Origin.

Der Deploymentpfad muss MCP-Contract-Tests, OAuth-Metadaten und die getrennten
Readiness-Gates vor der Umschaltung prüfen. Eine zweite Runtime ist nicht nötig.

### 10.2 Telemetrie

Der Anwendungscode erfasst Toolaufrufe, Ergebnisstatus und Latenz sowie einen
fest begrenzten Satz operationaler Ereignisse: OAuth- und Refreshfehler, `401`,
`403`, `409`, `429`, Timeouts, Replay-Ablehnungen, Cross-Provider-Ablehnungen und
unerwartete Toolfehler. App-/Artefaktversionen kommen als globale Deployment-
Tags aus der Metrikinfrastruktur; der veröffentlichte MCP-Vertrag ist zusätzlich
über den deterministischen `contractHash` im geschützten Health-Contributor
identifizierbar. MCP-/Backend-/DB-Readiness wird über die Actuator-Gruppe
`readiness` einschließlich `openAiDeCoach` und `db` geliefert.

Nicht protokolliert werden OAuth-Tokens, permanente SkillPilot-ID, rohe
`openai/session`, vollständige Prompts, Schülerantworten oder Prüfungsraster.

Das Spring-Backend erzwingt ein lokales Rate Limit pro direktem Netzwerkpeer und
getrenntem OpenAI-Endpunktbereich. Bei Überschreitung antwortet es mit `429` und
`Retry-After`. In einem Mehrinstanzbetrieb ergänzt ein vertrauenswürdiges Gateway
zwingend ein gemeinsames Limit. Der Anwendungslimiter parst keine Forwarding-
Header selbst; er darf sich nur hinter einem vertrauenswürdigen, Header
sanitisierenden Proxy auf die vom Servlet-Container normalisierte Adresse
stützen.

### 10.3 Schalter und Rückfall

Mindestens drei unabhängige Schalter sind vorgesehen:

1. `OPENAI_DE_ENABLED`
2. `OPENAI_DE_WRITES_ENABLED`
3. öffentlicher Reverse-Proxy-Upstream beziehungsweise Frontendvariante

Bei einem Fach- oder Sicherheitsproblem werden zuerst Writes deaktiviert, dann
das vorherige Backendartefakt beziehungsweise der Visible-Session-Startpfad
reaktiviert. Datenbankänderungen erfolgen nur nach
Expand–Migrate–Contract; ein Rollback erfordert keine destruktive Down-Migration.
OAuth-Verbindungen werden nur bei einem Sicherheitsvorfall pauschal widerrufen.

## 11. Go-/No-Go-Gates

Der deutsche Cutover ist nur erlaubt, wenn alle folgenden Punkte erfüllt sind:

- kein SkillPilot-eigener OpenAI-Modell-API-Aufruf im Coach-Laufzeitpfad;
- echte Nutzbarkeit in den vorgesehenen kostenlosen und festen Consumer-Tarifen;
- vollständige deutsche Workflow-Parität;
- OAuth-, Mandantentrennungs-, Datenschutz- und Minderjährigenprüfung;
- keine sichtbaren technischen Transportwerte;
- Rehydration nach Kontextverlust und Wiederaufnahme;
- verlässliche Installation und Verbindung aus dem SkillPilot-Cockpit;
- Telemetrie, Kill Switch und getesteter Rollback;
- Legacy- und Visible-Session-Quellen bleiben separat verfügbar.

Ein grüner MCP-Protokolltest allein ist kein Release-Gate. Umgekehrt darf eine
optionale Widget-UI die Wiederherstellung des vollständigen UI-losen Coach-
Dialogs nicht blockieren.

## 12. Nächster ausführbarer Schnitt

Der lokale Implementierungsschnitt ist über den früher geplanten Read-Slice
hinaus vollständig: getrennte Spring-MCP-Server, deutscher Toolvertrag, OAuth,
Binding, sichere Projektion, alle elf Workflows, Frontend-Canary, lokales Rate
Limiting, privacy-sichere Telemetrie und automatisierte Tests liegen vor. Der
nächste Schnitt ist nach Abschluss der lokalen Härtung der kontrollierte reale
Lauf:

1. Discovery-Bootstrap allein aktivieren und den datenlosen `401`-/Metadata-
   Vertrag an der stabilen Produktions-URL prüfen;
2. neue deutsche Developer-App mit Client-ID `skillpilot-chatgpt-de-prod`
   vorbereiten und die echte Callback-URL aus der App-Verwaltung übernehmen;
3. Bootstrap deaktivieren, Callback konfigurieren und Backend mit OAuth/MCP
   atomar aktivieren; Schreib-Kill-Switch deaktiviert lassen;
4. OAuth/PKCE und Kontext-Rehydration im read-only Canary testen;
5. danach Writes bewusst aktivieren und die vollständige deutsche
   Workflow-Paritätsmatrix durchführen;
6. erst nach Tarif-, Regions- und Oberflächen-Acceptance die Frontendvariante
   zum Standard machen.

Die exakten Betriebswerte, Smoke-Tests und Rollbackschritte stehen in
[openai-mcp-coach-de.md](../../deploy/openai-mcp-coach-de.md).

## 13. Offizielle OpenAI-Grundlagen

- [MCP-Server und Conversation Awareness](https://developers.openai.com/apps-sdk/concepts/mcp-server#why-apps-sdk-standardises-on-mcp)
- [Server Instructions für Toolkoordination](https://developers.openai.com/apps-sdk/build/mcp-server#add-server-instructions-for-cross-tool-guidance)
- [OAuth für Apps](https://developers.openai.com/apps-sdk/build/auth)
- [Data-only Apps ohne eigene UI](https://learn.chatgpt.com/docs/build-app#app-building-model)
- [Toolresultate und Sichtbarkeit](https://developers.openai.com/apps-sdk/reference#tool-results)
- [Plugins in ChatGPT und Codex](https://help.openai.com/de-de/articles/20001256-plugins-in-chatgpt-and-codex)
- [OpenAI-Mindestalter und Elternzustimmung](https://help.openai.com/en/articles/8313401-is-chatgpt-safe-for-all-ages)
