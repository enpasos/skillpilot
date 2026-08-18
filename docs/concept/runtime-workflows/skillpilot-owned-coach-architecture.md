# SkillPilot-Lerncoach: aktuelle Produkt- und Providerarchitektur

**Status:** dauerhafte Zielarchitektur des mehrsprachigen SkillPilot-Coaches.

Dieses Dokument beschreibt nur die stabile Produkt- und Systemtopologie. Der
kanonische Vertrag zwischen ChatClient und Backend steht im
[Kommunikationsvertrag](provider-neutral-coach-boundary.md). OAuth und
Lernsession stehen in der
[Sessionarchitektur](openai-mcp-oauth-learner-session-architecture.md),
Versionierung im
[Lebenszyklusvertrag](openai-plugin-versioning-and-lifecycle.md), sichtbares
Coach-Verhalten in der
[Verhaltensintegration](openai-mcp-coach-behavioral-integration.md) und Betrieb
in den Runbooks unter `docs/deploy/`.

Abgeschlossene Prototyp-, Direct-Start-, Knowledge-Paritäts- und
Migrationspläne sind keine aktuellen Architekturquellen. Ihre Historie bleibt
in Git erhalten.

## Produktentscheidung

SkillPilot stellt den Coach als providergehostete Konversation mit
authentisierten SkillPilot-Werkzeugen bereit:

- Das Modell, der freie Chat und optionale App-Oberflächen laufen beim
  Provider.
- Die lernende Person verwendet ihren dort verfügbaren Consumerzugang.
- SkillPilot ruft für diesen Pfad keine eigene kostenpflichtige Modell-API auf
  und verkauft keine Modellnutzung weiter.
- Curriculum, Personalisierung, Fokus, Frontier, aktives Lernziel, Mastery,
  Recall, Prüfung und Persistenz bleiben im SkillPilot-Backend.

Providerplan, Region, Workspace, Oberfläche und Altersfreigabe bleiben
providerabhängige Releasebedingungen. Sie ändern nicht die fachliche
Verantwortungsgrenze.

## Ein Plugin je Contract-Major

`SkillPilot Coach v1` ist ein einziges mehrsprachiges OpenAI-Plugin mit:

- einem neutral englischen Control-Plane-Skill;
- einem direkt gebundenen MCP-Server;
- einem stabilen öffentlichen V1-Origin;
- einem sprachneutralen Werkzeugkatalog;
- den beiden unabhängig gebundenen UI-Ressourcen für Lernzielbild und normales
  Karteikartenlernen;
- getrennten realen Acceptance-Fällen je freigegebener
  Interaktionssprache und Oberfläche.

Deutsch, Englisch und spätere Sprachen erzeugen weder ein neues Plugin noch
einen neuen MCP-Endpunkt oder OAuth-Client. Die Backend-Lernsession bindet die
`communicationLocale`; alle sichtbaren Antworten folgen ihr.

Ein neuer Contract-Major erhält eine neue Plugin-Linie und einen neuen Origin.
Eine neue Sprache innerhalb desselben kompatiblen Vertrags nicht.

## Aktuelle Topologie

```text
SkillPilot-WebGUI
  |  Level 2 konfigurieren, „Lernen starten“
  |  frische learningSessionId + vorbereitete Nachricht
  v
ChatGPT: SkillPilot Coach v1
  |  ein neutraler Skill, ein neutraler Toolkatalog, optionale MCP-Apps-UIs
  |  HTTPS + OAuth Bearer + learningSessionId
  v
https://mcp-coach-v1.skillpilot.com/mcp
  |
  v
OpenAI-V1-Provideradapter im bestehenden Spring-Boot-Prozess
  |  AuthN/AuthZ, Rate Limit, Schema, sichere Projektion
  v
CoachToolFacade + CoachStateProjection
  |  freigegebene Use-Cases und providerneutrale DTOs
  v
LearnerService + Curriculum + Datenbank
```

Es gibt keinen separaten Integrationsgateway-Prozess. Provideradapter,
Fachruntime und Domain laufen derzeit im selben Spring-Boot-Deployment. Eine
spätere Trennung braucht einen konkreten Grund wie unabhängige Skalierung,
Deployment oder Tenant-Isolation; sie verändert den fachlichen Vertrag nicht.

## Schichten

| Schicht | Verantwortung |
| --- | --- |
| First-Party-WebGUI | permanente ID, Providerhinweis, Level-2-Konfiguration, bewusster Start und Cockpit-Fallback |
| Provider-Host | Modell, Chat, Skillaktivierung, Toolauswahl und optionale UI-Darstellung |
| Plugin je Major | installierbares Produkt aus Skill, MCP-Verbindung, Metadaten und Releasebindung |
| Coach-Skill | wiederholbares Dialog- und Coachingverhalten, keine fachliche Autorität |
| Provideradapter | OAuth/Scopes, Toolkatalog, Schemas, Rate Limits, sichere Modellprojektion und providerbezogene UI-Metadaten |
| `CoachToolFacade` | kleine providerneutrale Fach-Use-Cases |
| `CoachStateProjection` | explizite Allowlist für modell- oder providersichtbaren Zustand |
| Domainruntime | Curriculum, Zustand, erlaubte Übergänge, Transaktionen, Idempotenz und Persistenz |

Die detaillierte Aufteilung zwischen ChatClient und Backend wird nicht in
dieser Tabelle dupliziert. Dafür ist ausschließlich der
[Kommunikationsvertrag](provider-neutral-coach-boundary.md) maßgeblich.

## Web-first Einstieg und Level 2

Permanente SkillPilot-ID, Curriculum beziehungsweise kanonische View,
Bundesland, Dauer- oder Jahrgangsmodell, Stufe, Fächer, fachbezogene
Kursprofile und Personalisierung werden im First-Party-WebGUI erfasst und
validiert.

Der OpenAI-V1-Vertrag:

- fragt diese Werte nicht im Chat ab;
- bietet keine Tools zu ihrer Änderung an;
- beginnt fachliches Coaching nur mit vollständig konfiguriertem Kontext;
- verweist bei fehlender Konfiguration mit der festen WebGUI-Anweisung zurück.

Level 3 bleibt lernbegleitend veränderbar: Fokus und aktives atomisches Ziel
können auf ausdrücklichen Wunsch über frisch veröffentlichte Backendoptionen
geändert werden. Der Backendzustand, nicht der Chatverlauf, bestätigt den
Erfolg.

## App-Authentisierung und Lernsession

Die V1-App verwendet einen fest registrierten vertraulichen OAuth-Client mit
dem freigegebenen Authorization-Code-/PKCE-Profil. OAuth authentisiert die App
und ihre Scopes, wählt aber keinen Lernenden aus.

Jeder ausdrücklich bestätigte Start im WebGUI erzeugt davon unabhängig eine
neue, absolut begrenzte 24-Stunden-Lernsession. Ihre Referenz wird automatisch
in die vorbereitete neue Chatnachricht eingefügt und unverändert an jedes
fachliche Werkzeug weitergegeben. Die lernende Person kopiert oder pflegt sie
nicht manuell.

Die permanente SkillPilot-ID ist weder Toolargument noch Toolergebnis.
Tokenrefresh verlängert die Lernsession nicht. Sessionablauf oder zu geringe
Restlaufzeit führen ausschließlich in den serverseitig vorgegebenen neuen
WebGUI-Start; OAuth wird dafür nicht neu verbunden.

Weitere Details und Sicherheitsparameter stehen ausschließlich in:

- [OAuth-Appbindung und Lernsession](openai-mcp-oauth-learner-session-architecture.md)
- [OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md)

## Sichere Zustandsprojektion

Provider erhalten nie rohe `UnifiedLearnerStateResponse`- oder Domainobjekte.
Die gemeinsame Projektion:

- entfernt permanente ID und interne Provenienz-/Copy-Daten;
- begrenzt Zustand auf fachlich notwendige Fakten und aktuelle Optionen;
- trennt Titel, Beschreibung, Aufgaben, Lösungen und Bewertungsdaten;
- gibt Exam-Lösung und Rubrik erst über den geschützten aktiven
  Evaluation-Use-Case frei;
- normalisiert freigegebene URLs und mathematische Darstellung;
- erlaubt providerseitige weitere Reduktion, aber keine Erweiterung um rohe
  Daten.

Widget-private Daten liegen nur in Result-`_meta`. Modellrelevante Fakten
liegen kompakt in `structuredContent`. Weder Bereich ersetzt Autorisierung oder
Backendvalidierung.

## Tool- und UI-Oberfläche

Werkzeuge werden aus Nutzerhandlungen entworfen, nicht aus internen
Servicemethoden. Reads und Writes bleiben unterscheidbar; Beschreibungen,
Schemas und Annotationen sind Teil des sichtbaren Produktverhaltens.

Der V1-Vertrag besitzt zwei aktive, unabhängig gebundene MCP-Apps-Ressourcen:

1. `render_skillpilot_goal_visualization` bindet die aktuelle hashadressierte
   bild-only Lernzielressource.
2. `start_skillpilot_memory_practice` bindet die aktuelle hashadressierte
   interaktive Karteikartenressource.

Das app-only Kartenreview und alle normalen Coach-Werkzeuge bleiben
UI-ungebunden. Frühere veröffentlichte Bildressourcen bleiben nur als
byteidentische passive Cachekompatibilität lesbar. Die aktuelle aktive Bindung
steht maschinenlesbar in `release/line.json`; Dokumentation kopiert ihre Hashes
nicht als zweite Wahrheit.

Eine UI ist optional und darf keinen fachlichen Erfolg vortäuschen. Der
Textpfad bleibt vollständig, wenn ein Host ein Widget oder Bild nicht
darstellt. Deterministische direkte Widgetaktionen sind sinnvoll, wenn sie
Modellkopieren technischer Auswahlwerte vermeiden; fachliche Zustandsänderung
bleibt trotzdem Backendarbeit.

## Fachliche Bewertungsgrenze

Das Provider-Modell darf sichtbare Lernendenarbeit semantisch mit einer vom
Backend freigegebenen Referenz oder Rubrik vergleichen. Es erkennt
gleichwertige Lösungswege, freie Formulierungen und fachliche Muster.

Das Backend entscheidet dagegen:

- ob die Referenz überhaupt freigegeben werden darf;
- welches Ziel und welcher Versuch aktuell sind;
- welche vollständige Menge bewertet werden muss;
- ob ein Receipt vollständig, stale oder wiederholt ist;
- welche Zustandsänderung und Fortsetzung daraus folgen.

Eine Promptregel beweist nicht, dass eine vollständige Chatantwort abgegeben
wurde. Wo harte Abgabe- oder Einwilligungsevidenz erforderlich ist, braucht es
eine direkte Widget- oder Cockpitaktion mit serverseitigem Receipt.

## Providererweiterung

Providerneutralität bedeutet einen gemeinsamen Fachkern, nicht identische
öffentliche Schemas für alle Provider. Ein weiterer Provider erhält:

- einen eigenen Authentisierungs- und Transportadapter;
- einen eigenen geprüften Toolkatalog;
- eigene UI- und Hostannahmen;
- dieselben freigegebenen Facade-Use-Cases und dieselbe sichere Projektion;
- eine vollständige eigene End-to-End-Acceptance.

Claude bleibt deaktiviert, bis genau diese providerbezogenen Gates erfüllt sind.
Der Custom GPT kann befristet als separat getesteter Übergangskanal dienen; sein
privater Action-Kontext braucht einen realen Cross-Turn-Canary, der sichtbare
Session-Relay bleibt nur Notfallfallback. Beides ist keine Architekturbasis für
den versionierten Pluginvertrag.

## Release und Kompatibilität

Toolnamen, Eingabe- und Ausgabeschemas, Server-Instruktionen,
Skill-/Policy-Bundle, OAuth-Resource, aktive UI-Bindungen und Workflowversion
sind gemeinsam versionierter Vertrag.

- Innerhalb eines publizierten Majors bleiben Änderungen kompatibel.
- Breaking Changes erhalten einen neuen Major und eine neue Plugin-Linie.
- Quellvertrag und generierter Draft müssen exakt übereinstimmen.
- Historische veröffentlichte UI-Ressourcen bleiben nach den spezifischen
  Cachekompatibilitätsregeln lesbar.
- Nach Metadatenänderungen werden Verbindung aktualisiert und reale
  Nutzerreisen erneut abgenommen.

Maßgeblich sind:

- [Versionierung und Lebenszyklus](openai-plugin-versioning-and-lifecycle.md)
- [Release, Rollback und Stilllegung](../../deploy/openai-plugin-v1-release.md)
- [Submission-Dossier](../../deploy/openai-plugin-v1-submission.md)

## Freigabegates

Eine technisch erreichbare Toolliste ist noch keine Produktfreigabe. Vor einer
öffentlichen Version müssen gemeinsam grün sein:

1. Contract-, Schema-, Security- und Domain-Tests;
2. exakter Quell-/Draft-Abgleich;
3. OAuth-, Session-, Ablauf- und Recovery-Tests;
4. reale Golden Journeys mit tatsächlichem Provider-Modell;
5. Desktop-, Mobile-Web- und relevante native Oberflächen;
6. jede freigegebene Interaktionssprache;
7. Datenschutz-, Minderjährigen-, Support- und Submissionprüfung;
8. Telemetrie, Rollback und unveränderte Cockpit-Nutzbarkeit.

Golden Journeys und sichtbare Qualitätsziele stehen in der
[Verhaltensintegration](openai-mcp-coach-behavioral-integration.md). Operative
Schritte stehen nur in den Deploy-Runbooks.

## Referenzen

- [Kommunikationsvertrag ChatClient/Backend](provider-neutral-coach-boundary.md)
- [Verhaltensintegration](openai-mcp-coach-behavioral-integration.md)
- [OAuth-Appbindung und Lernsession](openai-mcp-oauth-learner-session-architecture.md)
- [OpenAI-Plugin-Versionierung und Lebenszyklus](openai-plugin-versioning-and-lifecycle.md)
- [OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md)
- [Release-Runbook](../../deploy/openai-plugin-v1-release.md)
- [Submission-Dossier](../../deploy/openai-plugin-v1-submission.md)
- [OpenAI: Define tools](https://developers.openai.com/plugins/plan/tools)
- [OpenAI: Build an MCP server](https://developers.openai.com/plugins/build/mcp-server)
