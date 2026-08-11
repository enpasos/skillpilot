# SkillPilot-Lerncoach: OpenAI-Plugin-, Skill- und MCP-App-Architektur

**Stand:** 11. August 2026

**Status:** Die mehrsprachige MCP-App mit web-first Sessionübergabe,
verdichtetem neutralem V1-Werkzeugkatalog und zwei getrennt aktiv gebundenen
hashgebundenen `text/html;profile=mcp-app`-Ressourcen ist der aktuelle
Architekturpfad und im Spring-Boot-Fachkern integriert.
`render_skillpilot_goal_visualization` bindet genau eine bild-only
Lernzielressource und `start_skillpilot_memory_practice` die interaktive
Karteikartenressource. App-only Kartenreview und gewöhnliche Coach-Werkzeuge
bleiben UI-ungebunden. Die App authentisiert sich mit genau
einem fest konfigurierten vertraulichen OAuth-Client über
`client_secret_basic`; Authorization Code, PKCE S256, exakte Callback-URI,
Resource/Audience und Scopes begrenzen den Vertrag. Jeder ausdrücklich
bestätigte Start über die First-Party-Oberfläche erzeugt davon unabhängig eine
neue, exakt 24 Stunden gültige Lernsession und öffnet einen neuen Chat. Ihre
Referenz wird automatisch in die
vorbereitete Startnachricht und anschließend in jeden fachlichen MCP-Aufruf
übernommen. Permanente ID, Providerhinweis und Level-2-Konfiguration bleiben
ausschließlich im SkillPilot-WebGUI. Visible Session ist nur Rollback.
Fachliche Auswahl-, Abgabe- und
Prüfungswidgets bleiben spätere, getrennt zu prüfende Ausbaustufen. Das
geschärfte Distributionsziel ist genau ein Plugin je Contract-Major. Es verbindet einen
neutral englisch formulierten Coach-Skill mit dem direkt zur Prüfung
eingereichten MCP-Server. Die Interaktionssprache wird vom Backend autoritativ
an die Lernsession gebunden und ist keine Plugin-Identität. Die zur
Veröffentlichung vorgesehene Linie heißt **SkillPilot Coach v1**. Das
versionierte Quellpaket liegt unter
[`ai/openai plugin/skillpilot-coach-v1`](https://github.com/enpasos/skillpilot/tree/main/ai/openai%20plugin/skillpilot-coach-v1)
und bindet den produktiven Endpunkt direkt über `.mcp.json` ein. Eine
echte, vom Host erzeugte `.app.json`-Abbildung der registrierten
Pilot-App ist zusätzlich enthalten. Sie dient ausschließlich dem lokalen
End-to-End-Test; die direkte MCP-Bindung bleibt der öffentliche Zielvertrag.
Der Skill ist noch nicht produktiv ausgerollt; bis zu seiner
nachgewiesenen Verhaltensparität bleiben die heutigen ausführlichen
MCP-Server-Instruktionen die Kompatibilitätsschicht.

Der konkrete Umsetzungs-, Cutover- und Rollbackplan steht in
[openai-mcp-coach-migration-plan.md](openai-mcp-coach-migration-plan.md). Die
erste vollständige Migration bleibt bewusst **chat-first**; der
unveröffentlichte `1.0.0-SNAPSHOT`-Arbeitsstand enthält zwei getrennte aktive
hashgebundene UI-Ressourcen für Lernzielvisualisierung und Karteikartenlernen.
Jeder UI-Descriptor bindet genau seine Ressource; app-only Kartenreview und
gewöhnliche Coach-Werkzeuge bleiben ungebunden.
Der unveröffentlichte Direct-Start-Entwurf und seine Ressourcen sind aus dem
V1-Vertrag entfernt.
Für Identität, automatischen OAuth-Token-Transport, Browser-Binding und die
davon getrennte 24h-Lernsession ist
[openai-mcp-oauth-learner-session-architecture.md](openai-mcp-oauth-learner-session-architecture.md)
verbindlich.
Der nie veröffentlichte Direct-Start-Entwurf ist mit Policy-Revision 3
vollständig entfernt. Seine Git-Historie bleibt der Audit-Trail; er ist keine
aktive Architektur-, Sicherheits-, Implementierungs-, Test- oder
Releasequelle.
Für Paket-SemVer, Contract Major, öffentliche Origins, Snapshots, Lifecycle und
Breaking Changes ist der
[Versionierungs- und Lebenszyklusplan](openai-plugin-versioning-and-lifecycle.md)
verbindlich.

Dieses Dokument ist selbsttragend. Es beschreibt die Entscheidung, ihre harten
Randbedingungen, den umgesetzten Prototyp, die noch fehlenden Produktionsgrenzen
und überprüfbare Freigabekriterien.

## 1. Management Summary

SkillPilot soll den Lerncoach öffentlich als **OpenAI-Plugin aus
Coach-Skill und direkt eingereichtem MCP-Server** anbieten. Das Plugin ist der
installierbare Distributionscontainer. Der Skill beschreibt den wiederholbaren
Coaching-Workflow; der MCP-Server stellt Live-Daten, Authentisierung und
kontrollierte Aktionen bereit. Das Modell, der freie Chat und optionale
App-Oberflächen laufen in ChatGPT beziehungsweise später Claude; Curriculum,
Scope, aktives Lernziel, Frontier, Mastery, Recall und Prüfungszustand bleiben
autoritativ im SkillPilot-Backend.

Für ChatGPT wird **genau eine Plugin-Einreichung je Contract-Major** gebaut.
`SkillPilot Coach v1` enthält einen neutral englischen Coach-Skill, einen direkt
eingereichten MCP-Server, einen öffentlichen MCP-Origin, einen verdichteten
neutralen Werkzeugkatalog, zwei getrennte MCP-Apps-UIs für bild-only
Lernzielvisualisierung und Karteikartenlernen sowie sprachübergreifende
Acceptance Suites. Sämtliche Nutzdaten kommen bereits in der Zielsprache aus
dem Backend. Der Skill weist das
Hostmodell verbindlich an, die in der Lernsession gelieferte
`communicationLocale` für alle sichtbaren Antworten beizubehalten. Eine neue
Sprache ist daher eine kompatible Backend- und Acceptance-Erweiterung und keine
neue Plugin-Identität. Unabhängiger Rollout und Rollback werden dort über eine
neue Plugin-Linie erreicht, wo sich der öffentliche Contract-Major ändert.

Terminologisch bezeichnet **MCP-App** hier das bei OpenAI registrierte
Produkt beziehungsweise dessen Verbindung. Die technische Fähigkeitsschicht
ist der von SkillPilot betriebene **MCP-Server**; `.app.json` ist nur die
Kompatibilitätsabbildung dieser registrierten Verbindung in ein lokales Plugin.

Diese Architektur erfüllt die wirtschaftliche Kernanforderung nur dann, wenn der
jeweilige Provider die App im Zieltarif tatsächlich zur Verfügung stellt:

- Die lernende Person nutzt den Modellprovider mit dessen kostenlosem Angebot
  oder einem festen Consumer-Abonnement.
- SkillPilot ruft für diesen Coach **keine kostenpflichtige Modell-API im eigenen
  Namen** auf und leitet keine nutzungsabhängigen Modellkosten weiter.
- SkillPilot trägt weiterhin seine normalen Backend-, Speicher-, Netzwerk- und
  Supportkosten.

Die Architektur allein garantiert keine Tarifverfügbarkeit. Veröffentlichung,
Review, Länder-/Workspace-Verfügbarkeit und Nutzbarkeit im kostenlosen sowie im
fest bepreisten Tarif sind deshalb verbindliche Produkt-Acceptance-Gates.

## 2. Nicht verhandelbare Anforderungen

| Anforderung | Architekturantwort |
| --- | --- |
| Die lernende Person bezahlt den Modellprovider direkt. | Modellnutzung findet in der providergehosteten Oberfläche statt. |
| Kostenloser Providerzugang oder festes Consumer-Abonnement. | Vor Freigabe wird jede Zielkombination aus Provider, Oberfläche, Region und Tarif praktisch geprüft. Eine bloße Sichtbarkeit im Verzeichnis genügt nicht. |
| Keine verbrauchsabhängigen Modellkosten bei SkillPilot. | Im produktiven Coach-Pfad gibt es keinen SkillPilot-eigenen OpenAI-/Anthropic-Modell-API-Aufruf und keinen BYOK-Relay. |
| Natürliche Bedienung. | Fachliche Auswahlen erscheinen als Buttons, Karten oder verständliche Labels. Die temporäre Lernsession wird automatisch in die vorbereitete Startnachricht eingesetzt; die Person muss keinen technischen Wert kopieren oder eingeben. |
| SkillPilot bleibt fachliche Autorität. | Der Provider erhält sichere Projektionen; jede relevante Mutation wird im Backend autorisiert, validiert und persistiert. |
| Kein Vertrauen in Chat-Kontextretention. | Zustand wird bei Bedarf frisch aus dem Backend geladen. Verdeckte Action-Ergebnisse aus früheren Turns sind keine Voraussetzung. |
| Keine dauerhafte SkillPilot-ID beim Provider. | OAuth autorisiert die App. Eine getrennte, automatisch transportierte 24h-Lernsession adressiert den Lernenden; die permanente interne SkillPilot-ID wird weder Toolargument noch Toolergebnis. |
| Deutsch, Englisch und weitere Sprachen funktionieren solide. | Ein Plugin je Contract-Major; neutrale englische Kontrollschicht, backendgebundene Interaktionssprache und sprachspezifische Acceptance-Fälle. |
| Bestehende Arbeit bleibt reversibel. | Visible-Session- und Legacy-Custom-GPT-Quellen bleiben getrennte, unveränderte Rückfallpfade. |
| Vollständige Lernabläufe statt Methodenparität. | Freigabe erfolgt gegen Nutzerreisen und fachliche Invarianten, nicht gegen eine 1:1-Kopie alter Endpunkte. |

Eine First-Party-Chatoberfläche mit einem von SkillPilot bezahlten Modellaufruf ist
für diese Zielarchitektur ausdrücklich **keine Primäroption**: Sie würde die
zentrale Kosten- und Zahlungsanforderung verletzen. Ein nicht-generatives
SkillPilot-Cockpit bleibt als robuste Degradation sinnvoll.

## 3. Warum ein Plugin je Major statt eines Plugins je Sprache?

Die öffentliche Produkt- und Vertragsgrenze folgt dem Contract-Major. Sprache
ist dagegen bereits zuverlässig Teil der backendseitig erzeugten Lernsession
und aller fachlichen Nutzdaten.

### 3.1 Gründe für die gemeinsame mehrsprachige Major-Linie

1. **Keine doppelten Werkzeuge:** Das Hostmodell sieht genau einen Satz neutral
   englisch beschriebener Tools statt konkurrierender Sprachvarianten.
2. **Autoritative Sprachwahl:** Das Modell errät die Sprache nicht, sondern
   übernimmt die `communicationLocale` aus dem frischen Backendkontext.
3. **Einheitliche Fachsemantik:** Toolnamen, Schemas, Receipts und
   Zustandsinvarianten unterscheiden sich nicht nach Sprache.
4. **Weniger Betriebsflächen:** Ein Origin, ein OAuth-Client, ein Pluginpaket und
   ein Spring-Boot-Prozess je Major vermeiden Konfigurationsduplikate.
5. **Gezielte Qualitätssicherung:** Acceptance und Telemetrie bleiben nach
   Session-Sprache auswertbar, ohne die Produktidentität zu teilen.
6. **Passende Versionierung:** Nur inkompatible Vertragsänderungen benötigen eine
   neue Plugin-Identität; neue oder verbesserte Sprachen nicht.

### 3.2 Was gemeinsam bleibt

- Curriculum-Katalog und Composition-View-Auflösung;
- OAuth-Appautorisierung und davon getrennte Auflösung der expliziten
  Lernsession auf einen Lernenden;
- reine Coach-State-Projektion;
- Scope-, Ziel-, Mastery-, Recall- und Exam-Use-Cases;
- Idempotenz-, Receipt-, Concurrency- und Auditmechanismen;
- fachliche Testfälle mit sprachspezifischen Acceptance-Varianten;
- Infrastruktur und der eine Spring-Boot-Prozess.

### 3.3 Konkrete Deploymentsicht

Ein Plugin je Major verwendet einen öffentlichen MCP-Origin und einen
Spring-Boot-Prozess. Die Grenze lautet:

```text
App-Registrierung V1 -> MCP-Endpunkt V1 -> Vertrag V1 -> zwei gebundene UIs V1
                              |
                              -> Lernsession mit communicationLocale
                              -> gemeinsame sichere Domain-Services
```

Für ChatGPT ist das Ziel daher eine unabhängig review- und veröffentlichbare
V1-Linie. Sie bündelt genau einen neutralen Coach-Skill mit genau einer
registrierten MCP-App. Eine spätere inkompatible V2 erhält ihren eigenen
Origin, OAuth-Vertrag und Lifecycle; eine weitere Sprache innerhalb von V1
nicht.

## 4. Produkt- und Zahlungsmodell

```text
Lernende Person
  |-- nutzt kostenlosen Providerzugang oder festes Consumer-Abonnement
  |-- installiert/verbindet die SkillPilot-App beim Provider
  v
Provider-Host (ChatGPT, später Claude)
  |-- installiert das Major-versionierte Plugin
  |-- lädt dessen Coach-Skill und registrierte MCP-App
  |-- stellt Modell, Chat und standardisierte MCP-Inhalte bereit
  |-- ruft SkillPilot-MCP-Tools im Namen der Person auf
  v
SkillPilot-MCP-Grenze
  |-- authentifiziert, autorisiert, projiziert und validiert
  v
SkillPilot-Domain und Datenbank
```

SkillPilot verkauft oder vermittelt in diesem Modell keine Modell-Tokens. Damit
ist die Modellnutzung wirtschaftlich vom SkillPilot-Backend entkoppelt. Nicht
entkoppelt sind normale Plattformkosten wie MCP-Hosting, Datenbank, Dateien,
Monitoring und Support.

Folgende Aussagen dürfen erst nach realem Provider-Test gemacht werden:

- „im kostenlosen Tarif nutzbar“;
- „im festen Consumer-Abonnement ohne zusätzliche verbrauchsabhängige Kosten
  nutzbar“;
- „in der vorgesehenen Region, auf Web und Mobilgerät verfügbar“;
- „für die vorgesehene Alters- und Workspace-Gruppe zulässig“.

OpenAI dokumentiert, dass Plugins der zentrale Veröffentlichungsweg sind und
Skills mit einer registrierten MCP-Verbindung bündeln können. Für SkillPilot
ist diese kombinierte Form das Ziel; ein App-only-Plugin bleibt nur
Übergangs- und Rollbackform. Installation und Nutzung können dennoch von Tarif,
Workspace-Einstellungen, Rolle, Oberfläche, Region und Appfunktionen abhängen.
Diese Produktabhängigkeit ist kein Implementierungsdetail, sondern ein
Go-/No-Go-Kriterium.

## 5. Technischer Auslöser und Architekturgrenze

Die frühere Custom-GPT-Integration setzte voraus, dass Werte aus einer
Action-Antwort in einem späteren User-Turn wiederverwendet werden. Nach der
beobachteten Plattformregression ist dies nicht zuverlässig. Nachgewiesen sind
hingegen:

- Action-to-Action-Weitergabe im selben Assistententurn;
- Weitergabe von Werten, die ausdrücklich in der sichtbaren Nachricht stehen;
- fehlende Zuverlässigkeit für ausschließlich im früheren Action-Response
  enthaltene Werte über die nächste Usernachricht hinweg.

Die als Rollback erhaltene Visible Session hält deshalb einen maximal 24 Stunden
gültigen Token und benötigte Auswahlwerte sichtbar im Dialog. Das beschreibt
ausschließlich den Custom-GPT-Kompatibilitätspfad, **nicht** den aktuellen
OpenAI-MCP-Vertrag. Der Rückfallpfad ist funktional, aber für Lernende unnötig
technisch und vom Verhalten des Custom-GPT-Hosts abhängig.

Eine MCP App verbessert diese Lage wesentlich:

- fachliche Auswahlen und Einreichungen können in einer späteren Ausbaustufe
  direkt im Widget erfolgen;
- Widget-interne opake Referenzen können in app-exklusiven Metadaten bleiben;
- der autoritative Zustand lebt im SkillPilot-Backend;
- modellseitige Tools können nach einem neuen Turn einen frischen sicheren
  Snapshot laden.

Ein isolierter UI-loser MCP-Test am 22. Juli 2026 hat zusätzlich sowohl die
Same-Turn-Weitergabe als auch die Wiederverwendung ausschließlich strukturierter
Toolwerte über die nächste Usernachricht hinweg erfolgreich bestätigt. Die
Custom-GPT-Action-Regression trat in diesem kurzen MCP-Test nicht auf. Das macht
eine data-only App zum bevorzugten ersten Migrationsschritt, ist aber keine
Garantie für lange oder kompaktierte Dialoge. Argumentlose Backend-Rehydration
bleibt deshalb eine verbindliche Produktionsanforderung.

Sie hebt die Providergrenze nicht vollständig auf. Freier Text im Chat erreicht
zuerst den Provider, und der Provider entscheidet, ob und welches Tool aufgerufen
wird. Kritische, garantiert auszuführende Schritte gehören daher in eindeutige
Widget-Handlungen oder in serverseitig geführte Abläufe. Tool-Invocation-
Zuverlässigkeit bleibt Teil der Acceptance Suite.

## 6. Zielarchitektur

```text
                              OpenAI
             .-----------------------------------------.
             | ChatGPT + Plugin-Verzeichnis            |
             |                                         |
             | Plugin DE             Plugin EN (später)|
             | Skill DE + App DE     Skill EN + App EN |
             | Chat + Bild-UI        Interaktion später|
             '---------|-------------------|-----------'
                       | HTTPS/MCP         | HTTPS/MCP
                       v                   v
             .---------------------------------.
             | SkillPilot Provider Boundary    |
             |                                 |
             | MCP Adapter DE  MCP Adapter EN  |
             | Tool-Allowlist / DTO Projection |
             | OAuth / AuthZ / Rate Limits     |
             '----------------|----------------'
                              v
             .---------------------------------.
             | SafeCoachRuntime                |
             |                                 |
             | CoachStateSnapshot (pure query) |
             | Offering-/Scope-Resolver        |
             | Commands + Guards/Locks         |
             | Receipts (spätere Härtung)      |
             | Recall-/Exam-Grenzen            |
             '----------------|----------------'
                              v
             SkillPilot-Domain, Curriculum und Datenbank

Spätere zweite Providerlinie:
Claude App/MCP DE + EN -> eigener Provideradapter -> derselbe SafeCoachRuntime
```

### 6.1 Verantwortungsgrenzen

| Schicht | Verantwortung | Darf nicht |
| --- | --- | --- |
| Provider-Host | Modell, Chat, Skillaktivierung, Toolauswahl und Darstellung der App | fachlichen Zustand autoritativ festlegen oder Skillbefolgung garantieren |
| Major-versioniertes Plugin | neutralen Skill und direkt eingereichten MCP-Server als öffentliches Produkt verbinden; lokal die registrierte Verbindung referenzieren | eigenen Lernzustand, eine zweite Fachruntime oder Sprachidentität einführen |
| Coach-Skill | Coachingrolle, Dialogablauf, Toolreihenfolge, Ausgabeform und begrenzte Fehlerbehandlung | Fakten, Berechtigungen, Zustandsübergänge oder Persistenz garantieren |
| Mehrsprachige MCP-App | neutrale Tools, optionale UI, Toolmetadaten, Authentisierung und Hostinteraktion; sichtbare Kommunikation folgt `communicationLocale` | Sprache frei aus Hostlocale ableiten oder den Skill als Sicherheitsgrenze behandeln |
| Provider Boundary | OAuth, Scopes, Rate Limits, sichere Projektion, Tool-zu-Use-Case-Abbildung | rohe interne DTOs oder Identitäten weiterreichen |
| SafeCoachRuntime | freigegebene Queries und Commands, frische Revalidierung und fachliche Transaktionsgrenzen | Modellargumente als Berechtigung behandeln |
| SkillPilot-Domain | Curriculum, Lernpfad, Mastery, Recall, Exam und Persistenz | vom Chatverlauf als Datenbank abhängen |

Die OpenAI-V1-Spring-Implementierung schützt die OpenAI-Pfade zusätzlich mit
einem standardmäßig aktiven, konfigurierbaren Fixed-Window-Limit pro vom Servlet-
Container normalisierter Clientadresse und getrennten Budgets für MCP, OAuth,
Cockpit-Starts, direkten Bootstrap und Metadata. Der Produktionsproxy muss
eingehende Forwarding-
Header verwerfen beziehungsweise selbst ersetzen und der einzige Netzwerkpfad
zum Backend sein. Die Adresse landet weder in Logs noch Metrik-Tags. Das ist eine
wirksame lokale
Sicherheitsgrenze für eine Instanz. Sobald mehrere Backendinstanzen hinter einem
Proxy laufen, muss der vertrauenswürdige Reverse Proxy beziehungsweise das API-
Gateway dasselbe Limit zusätzlich instanzübergreifend durchsetzen; das lokale
Limit bleibt als zweite Barriere aktiv.

### 6.2 Versioniertes Quellpaket, lokales Wiring und öffentlicher Zielzuschnitt

Das implementierte sprachneutrale V1-Quellpaket hat folgende Struktur:

```text
ai/openai plugin/skillpilot-coach-v1/
├── .codex-plugin/
│   └── plugin.json
├── .app.json
├── .mcp.json
├── release/
│   ├── line.json
│   └── lifecycle.json
└── skills/
    └── skillpilot-coach-v1/
        ├── SKILL.md
        ├── agents/
        │   └── openai.yaml
        └── references/
            └── coaching-policy.md
```

`plugin.json` identifiziert die V1-Paketlinie und verweist auf `./skills/`,
`./.mcp.json` sowie `./.app.json`. Die MCP-Konfiguration bindet ausschließlich
den öffentlichen V1-Endpunkt
`https://mcp-coach-v1.skillpilot.com/mcp` ein.
`release/line.json` hält Contract Major, exakte OAuth-Resource und
Zustands-/Workflowversionen maschinenlesbar zusammen;
`release/lifecycle.json` führt getrennte Support-, Publikations- und
Startpolicy-Achsen samt monotoner Policyrevision. Die zusätzliche App-Abbildung
referenziert für den lokalen beziehungsweise Workspace-internen Pilot exakt die
bereits registrierte ChatGPT-Verbindung. App-Alias und `asdk_app...`
wurden unverändert aus den hostgenerierten Registrierungsmetadaten übernommen;
die dort separat gespeicherte `plugin_asdk_app...`-Kennung ist nicht der Wert
für `.app.json`. `agents/openai.yaml` deklariert dieselbe MCP-Abhängigkeit und
beginnt im Pilot mit deaktivierter impliziter Aktivierung. Manifest, direkte
MCP-Bindung, registrierte App-Abbildung, Skill, Policy-Referenz und
Aktivierungspolicy werden in CI gemeinsam geprüft.

Für die öffentliche Einreichung ist `.app.json` dagegen kein
Veröffentlichungsvehikel. Im OpenAI-Portal wird **With MCP** gewählt; der
neutrale Skill und der zugehörige MCP-Server werden direkt zur Prüfung
eingereicht. Das öffentliche Ziel bleibt damit funktional
**Coach-Skill plus MCP-Server**, auch wenn das lokale Pilotpaket die registrierte
Verbindung zusätzlich über `.app.json` referenziert.

Der aktuelle V1-Draft besitzt insgesamt zwei aktive, getrennt hashgebundene
Ressourcen mit dem MIME-Typ `text/html;profile=mcp-app`: Read-only Bild-Renderer
und Karteikartenlauncher binden jeweils ausschließlich ihre eigene Ressource
über `ui.resourceUri` und `openai/outputTemplate`. Das app-only Kartenreview und
alle gewöhnlichen Coach-Werkzeuge bleiben ungebunden. Früher beworbene
Bildressourcen bleiben nur passiv lesbar.

Das Lernzielbild wird dabei über genau eine aktiv gebundene hashgebundene
Ressource dargestellt. Es gehört weder in den Skill noch bildet es eine weitere
Zustands- oder Sicherheitsgrenze. Nur das dedizierte read-only Werkzeug
`render_skillpilot_goal_visualization` trägt `ui.resourceUri` und
`openai/outputTemplate` für diese Ressource; alle gewöhnlichen Werkzeuge bleiben
ungebunden. Interaktive Auswahl-, Abgabe- oder Prüfungswidgets sind davon
getrennte spätere Ausbaustufen.

Die optionale interne Projektion `structuredContent.goalVisualization` enthält
Ziel-ID, Titel, optionale Beschreibung, öffentliche Bild-URL, Alttext und
Cockpit-Link. Das Backend gibt sie nur für ein aktives atomares Ziel mit
passendem kanonischem `goal-visualization`-Link aus. Der Renderer validiert
Backendzustand, Ziel-ID und `expectedStateVersion` erneut. Die UI erhält die
strukturierte `goalVisualization`, lädt ausschließlich den freigegebenen
Bildpfad und rendert nur das Bild. Der Alttext bleibt als Metadatum erhalten;
Titel, Beschreibung, Ziel-ID, Bild-URL und Cockpit-Link werden nicht zusätzlich
dargestellt. Wenn das neueste Vollresultat `goalVisualization` enthält und den
Renderer erlaubt, läuft dieser genau einmal mit dessen unveränderter Ziel-ID und
kopiert die Top-Level-`stateVersion` in `expectedStateVersion`. Alte oder bereits
versuchte Freigaben werden nicht verwendet.
Ein erforderlicher Mastery-Handoff bleibt vor dem Nachfolger; das Bild wird
unmittelbar vor dessen Coachingabschnitt gerendert. Das Receipt ersetzt nicht
den Vollkontext.

Der Adapter bietet die optionale Bildprojektion oberflächenneutral an. Er
wertet dafür weder `openai/userAgent` noch eine andere Desktop/Mobile-
Klassifikation aus. Persistierte Idempotenz-Ergebnisse, frische Ergebnisse und
wiedergegebene Ergebnisse enthalten dieselbe Bildfreigabe. Der Renderer liefert
die strukturierte Visualisierung an dieselbe hashgebundene UI-Ressource. Ein
erfolgreiches Toolresultat ist keine Bestätigung, dass der jeweilige Host die
Ressource geladen oder das Bild dargestellt hat. Der vollständige Textpfad
bleibt erhalten. Das Bild ist Orientierung, niemals Evidenz, Aufgabe, Lösung,
Bewertung oder Mastery-Nachweis.

V1 ist noch nicht veröffentlicht. Das Ressourceninventar bindet für jedes der
zwei UI-Werkzeuge genau seine eine aktuelle hashgebundene Ressource und hält
jede bereits an reale Test-Clients ausgelieferte Vorgänger-URI mit ihren exakten
Bytes passiv lesbar. So bleiben zwischengespeicherte Template-Verweise
funktionsfähig, ohne einen zweiten aktiven Vertrag je Werkzeug zu erzeugen. Nach
dem Update werden beide aktuellen URIs zusätzlich in einem frischen Chat
mit aktualisierten Plugin-Metadaten geprüft.

### 6.3 Verbindlicher Ort jeder Regel

| Regelart | Zielort | Beispiel |
| --- | --- | --- |
| wiederholbares Coach-Verhalten | `SKILL.md` und bei Bedarf `references/coaching-policy.md` | erst selbst lösen lassen, Dialog in `communicationLocale`, Toolsequenz, Stoppen bei Fehlern |
| werkzeugübergreifende MCP-Invariante | kurze Server-`instructions` | `learningSessionId` unverändert weitergeben; Backendzustand nicht erfinden |
| Bedingung genau eines Werkzeugs | Toolname, Beschreibung und Schema | Bewertung erst nach Antwort; Context vor neuem Lernschritt |
| aktuell zustandsabhängige Anweisung | frisches Toolergebnis | offene Scope-Auswahl, Prüfungsmodus, Recall-Batch |
| fachliche oder sicherheitsrelevante Garantie | Backendguard und Domainlogik | Sessionbindung, zulässiger Übergang, aktives Ziel, Idempotenz, Mastery |
| nachvollziehbare Produktnorm | dieses Leitdokument und Policy-Referenzen | Bedeutung und Verantwortlicher einer `COACH-*`-Regel |

Die MCP-Server-Instruktionen werden im Zielzustand nicht zur
Persönlichkeits- oder Coaching-Gesamtspezifikation. Sie enthalten nur wenige
über alle Werkzeuge geltende Invarianten, mit der wichtigsten Aussage in den
ersten 512 Zeichen. Toolbeschreibungen bleiben handlungsspezifisch. Der Skill
orchestriert beide, ohne die Backendguards zu ersetzen.

### 6.4 State- und Konfliktgrenze

Das Plugin und der Skill besitzen keinen autoritativen Lernzustand. Auch bei
einem protokollseitig stateless betriebenen MCP-Server bleibt
`learningSessionId` ein expliziter, kurzlebiger **Anwendungszustand** im
SkillPilot-Backend. Sie ist weder MCP-Transportsession noch Pluginzustand,
Skill-Memory oder Chatkonversations-ID.

Bei einem Widerspruch gilt:

1. Ein Backendfehler oder Guard stoppt den Ablauf; der Skill darf ihn nicht
   durch eine Vermutung umgehen.
2. Der jüngste erfolgreiche Toolzustand ersetzt ältere Gesprächsannahmen.
3. Ein Toolschema oder eine Toolbeschreibung begrenzt den zulässigen Aufruf;
   der Skill erweitert diese Berechtigung nicht.
4. Fehlt die erforderliche App, das Tool oder die gültige Lernsession, bricht
   der Skill kontrolliert ab und erfindet keinen Offline-Lernpfad.

Bekannte Aufrufbedingungen werden nicht allein deshalb zu Garantien, weil sie
im Skill stehen. Der V1-MCP-Vertrag lädt deshalb vor jeder Curriculumwahl
die aktuell veröffentlichte Optionsmenge neu und bindet alle
Verified-Recall-Operationen an das aktuelle sichtbare aktive atomische
Memory-/SRS-Ziel. Ob vor Mastery, Sollantwort oder Exam-Evaluation tatsächlich
ausreichende Chat-Evidenz vorlag, kann weiterhin erst ein eigener serverseitiger
Evidence- oder Submission-Receipt hart beweisen.

Der Merksatz lautet deshalb:

> Der Skill gestaltet den Coach; SkillPilot entscheidet über den Lernpfad.

### 6.5 Bewährter Coach-Inhalt als Migrationsquelle

Der neue Skill wird inhaltlich nicht neu erfunden. Die fachlich und didaktisch
bewährte deutsche Ausgangsbasis liegt unter
[`ai/openai custom gpt`](https://github.com/enpasos/skillpilot/tree/main/ai/openai%20custom%20gpt). Insbesondere
`system_instructions.de.md` sowie die deutschen Dokumente zu Lerncoach,
Mastery, Prüfung, Zustandsmaschine, Fehlerbehandlung und Deep Links werden als
reviewbarer Migrationskorpus verwendet.

Bei Widersprüchen gilt: aktueller Backend-/MCP-Vertrag vor neueren fachlichen
Korrekturen der Visible-Session-Variante vor dem ursprünglichen
Custom-GPT-Verhalten. Alte Transport- und Relayregeln sind keine fachliche
Quelle.

Die Inhalte werden nach ihrer heutigen Bedeutung übernommen, nicht als
Dateikopie:

| Bewährte Quelle | Übernommener Inhalt | Ziel im Plugin-/MCP-Modell |
| --- | --- | --- |
| `system_instructions.de.md` | Rolle, Deutsch, knapper dialogischer Stil, Mathematikformat und keine technischen Interna im sichtbaren Coaching | Kernregeln in `SKILL.md` |
| `knowledge_docs/lerncoach.de.md` | Vorwissensdiagnose, Scaffolding, Feynman-Loop, kleine Schritte, Transfer und faire Prüfung ungewöhnlicher Lösungswege | Kurzzyklus in `SKILL.md`, Details in `references/coaching-policy.md` |
| `knowledge_docs/mastery_rules.de.md` | zwei unabhängige Checks oder echter Transfer, alle Zielaspekte, keine bloße Selbsteinschätzung | Skill und Referenz; Aufrufbedingung zusätzlich an der Mastery-Toolbeschreibung |
| `knowledge_docs/exam_proctor.de.md` | wortgetreue Aufgabe, keine Hilfe im Prüfungsmodus und kriteriumsbezogene Bewertung | Skill-Referenz, aktueller Exam-Kontext und Evaluationstool |
| `knowledge_docs/state_machine.de.md` | frischen Zustand lesen, genau einem erlaubten Schritt folgen und danach erneut laden | Skill-Entscheidungszyklus, Toolbeschreibungen und dynamischer Kontext |
| `knowledge_docs/error_handling.de.md` | ehrlich stoppen, keinen Erfolg vortäuschen und nur begrenzt rehydrieren | Stopregel im Skill und konkrete MCP-Fehlerresultate |
| `knowledge_docs/deep_linking.de.md` | Ressourcen didaktisch passend einsetzen | Skill-Referenz; Verfügbarkeit und URL ausschließlich aus dem frischen Backendzustand |

Nicht übernommen werden alte Transport- und Methodennamen wie `startCode`,
`chatSessionToken`, `redeemStartCode`, sichtbare Relaywerte, frühere Action-
Operations oder modellseitig konstruierte Deep Links. Sie werden auf die
heutige OAuth-, `learningSessionId`-, MCP- und backendgenerierte Linkgrenze
abgebildet. Ebenso wird keine durch das Backend bereits erzwungene Invariante
nur deshalb wieder zur vermeintlichen Skill-Garantie, weil sie in der früheren
Anweisung gut formuliert war.

Jede migrierte Regel erhält folgende Nachweiskette:

```text
bewährte Quellstelle unter ai/openai custom gpt
  -> stabile COACH-Policy-ID
  -> genau ein primärer Zielort
  -> positiver und negativer Acceptance-Fall
```

Ziel ist, das nachweislich gute Coach-Verhalten nach bestandenem
Acceptance-Gate zu erhalten, während überholte Action- und Sessionmechanik
bewusst zurückbleibt.

## 7. Zustand, Identität und sichtbare Daten

### 7.1 Autoritativer Zustand

Autoritativ im SkillPilot-Backend liegen mindestens:

- die feste vertrauliche OAuth-Appregistrierung und ihre Autorisierungen;
- jede getrennte Lernsession mit absoluter Laufzeit von exakt 24 Stunden samt
  interner Lernenden-Zuordnung;
- Curriculum, Scope und Personalisierung;
- aktives Lernziel und Frontier;
- Mastery und die heute bereits persistierten fachlichen Belege;
- Aufgaben, Bewertungen und Verified-Recall-Kartenstatus;
- in der späteren Widget-Härtung zusätzlich Einreichungen, Prüfungsversuche
  sowie Idempotenz- und Command-Receipts.

Widgetzustand wie aufgeklappte Bereiche oder Texteingabe ist flüchtige UI-
Darstellung. Er darf den Backendzustand nicht ersetzen. Providerseitiger
Gesprächskontext ist eine Komfortoptimierung, keine fachliche Quelle.

### 7.2 Sichtbarkeitsklassen

| Klasse | Beispiele | Sichtbarkeit |
| --- | --- | --- |
| Nutzer- und modellgeeignete Fachinformation | Label, Aufgabenstellung, sicherer Lernstand, Feedback | Chat und/oder Widget; modellseitig nur soweit nötig |
| Modellgeeignete fachliche Referenz | öffentliche Curriculum-/Lernziel-ID aus einer aktuellen erlaubten Option | nur bei Bedarf in `structuredContent`; nicht unnötig in der sichtbaren Antwort wiederholen |
| Widget-interne Referenz | begrenzter Kartenstapel oder spätere Auswahl-/Draft-Referenz | ausschließlich privates Resultat-`_meta` und flüchtiger Komponentenprozess; nicht in `content`, `structuredContent` oder provider-synchronisiertem Zustand |
| Automatisch transportierte Sitzungsreferenz | temporäre Lernsession aus **Lernen starten** | in vorbereiteter Startnachricht und fachlichen Toolargumenten; keine manuelle Benutzereingabe |
| Interne Identität und Geheimnis | permanente SkillPilot-ID, OAuth-Token, OAuth-Client-Secret, Datenbankschlüssel | Die SkillPilot-ID bleibt in First-Party-SkillPilot-Oberflächen und interner Backendauflösung. Sie steht niemals in Chat, Modellkontext, MCP-Toolargument/-resultat einschließlich `_meta`, `window.openai`, provider-synchronisiertem Zustand, Widget-Storage, URL, Logs oder Telemetrie. OAuth-Token, Client-Secret und Datenbankschlüssel erscheinen auch nicht im Widget. |

Öffentliche, fachlich sinnvolle Lernziel-IDs dürfen als Produktreferenz sichtbar
sein, wenn dies didaktisch nützt. Sie sind von Identitäts-, Autorisierungs- und
Transportreferenzen strikt zu unterscheiden.

### 7.3 Keine manuelle technische Eingabe im Chat

In der ersten chat-first Version zeigt der Chat verständliche Labels. Zugehörige
fachliche IDs bleiben im `structuredContent` der frisch geladenen erlaubten
Fokus- und Zieloptionen und werden nicht als Bedienkonzept auf die lernende
Person abgewälzt. Permanente ID, Providerhinweis, Curriculum, Stufe, Fächer,
Kursprofile und Personalisierung werden ausschließlich im First-Party-WebGUI
eingerichtet. Erst `Lernen starten` gibt die Startnachricht frei und öffnet den
neuen Chat. Die dabei erzeugte Lernsession bleibt technisch unsichtbar:
SkillPilot setzt ihre kurzlebige Referenz automatisch in die vorbereitete
Startnachricht ein, und die App übernimmt sie unverändert in jeden fachlichen
MCP-Aufruf. Die Person kopiert oder bearbeitet sie nicht. Jede Mutation wird
gegen OAuth-Client, Lernsession und aktuellen Backendzustand neu validiert. Die
read-only Lernzielkarte benötigt keine opaken Aktionsreferenzen;
Karteikartenlernen verwendet seine eng begrenzten privaten Widgetdaten, während
spätere Auswahl- oder Abgabewidgets eigene kurzlebige Referenzen benötigen.

Für die spätere Receipt-Härtung modellseitiger Folgen gilt:

1. Modell ruft einen lesenden Kontext- oder Pending-Submission-Use-Case auf.
2. Backend löst Identität aus dem OAuth-Zugriff und lädt frischen Zustand.
3. Für eine unmittelbar folgende Mutation kann das Backend eine kurzlebige,
   zweckgebundene Receipt-Referenz ausgeben.
4. Die Mutation revalidiert Subjekt, Scope, Zustand, Receipt und Revision.

Damit wird höchstens die nachgewiesene Same-Turn-Weitergabe genutzt; langfristige
Chat-Retention bleibt unnötig.

## 8. Produktionsauthentifizierung

Der lokale Mechanik-Prototyp verwendet absichtlich `noauth`; das ist **kein**
Produktionsmodell und nicht der mehrsprachige V1-Produktivvertrag.

Produktiv wird die App per OAuth 2.1 gemäß MCP-Autorisierung angebunden:

1. Der MCP-Resource-Server veröffentlicht Protected-Resource-Metadaten.
2. Der SkillPilot-Authorization-Server veröffentlicht seine OAuth-/OIDC-
   Discovery-Daten.
3. SkillPilot und die ChatGPT-App konfigurieren exakt dieselbe feste
   vertrauliche `client_id` und dasselbe lange zufällige `client_secret`. Der
   Token-Endpunkt verlangt `client_secret_basic`. Offene DCR, CIMD,
   `private_key_jwt`, `none` und ein stiller Profilwechsel sind keine aktiven
   Produktionsmodi.
4. Der Provider führt Authorization Code mit PKCE S256, exakter Redirect-URI,
   Resource und Scopes aus.
5. ChatGPT verwaltet Access- und Refresh-Token und überträgt den Access Token
   bei jedem MCP-Aufruf automatisch als Bearer-Header; Benutzer kopieren oder
   übermitteln keinen Token.
6. Der MCP-Server validiert bei jedem Request mindestens Signatur beziehungsweise
   Tokenstatus, Issuer, Audience/Resource, Ablaufzeit, Scopes und Clientbindung.
7. Jedes fachliche Tool verlangt zusätzlich die bei einem ausdrücklichen,
   autorisierten First-Party-Start erzeugte Lernsession als Argument.
   Token-Refresh, Reload und Toolaufruf verlängern deren absolute Frist nicht.

Das vertrauliche OAuth-Clientprofil bindet den MCP-Zugriff an die konfigurierte
App. `1.0.0` verwendet normales serverauthentisiertes HTTPS und OAuth. Eine
spätere zusätzliche Transporthärtung ist ein eigener Entwurf und ersetzt weder
diese Appidentität noch die Lernsession.

Die interne permanente SkillPilot-ID wird nie als MCP-Datum zurückgegeben.
Kurzlebige Widgetreferenzen sind zusätzlich an Provider, OAuth-Clientverbindung,
Appvariante, Zweck und Ablaufzeit gebunden und ersetzen niemals
Authentifizierung oder Lernsession.

Die Zuordnung zum Lernenden entsteht ausschließlich durch **Lernen starten** in
der First-Party-SkillPilot-Oberfläche. Bei jedem Start erzeugt das Backend
sofort eine neue hochentropische Referenz,
speichert nur deren HMAC/Hash mit dem Lernenden und einer Frist, die exakt 24
Stunden nach Erzeugung endet, und übergibt den Klarwert ausschließlich in der
kurzen Startnachricht. OAuth allein erzeugt oder wählt keine Lernsession; die
Lernsession allein autorisiert keinen MCP-Aufruf. Es gibt keinen Fallback über
OAuth-Subject, Providerkonto oder Chatkontext.

DE und EN dürfen denselben Authorization-Server und dieselben internen
Identity-Services verwenden. Appregistrierung, Resource-Identifier,
Scopes/Consent-Texte und Negativtests müssen dennoch für beide externen Verträge
explizit geprüft werden.

## 9. Gemeinsamer sicherer Fachkern

### 9.1 Reine Queries

Kontext-Rehydration darf keine Nebenwirkung auslösen. Erforderlich ist ein
allowlist-basierter `CoachStateSnapshot`, der nur für den jeweiligen Ablauf
nötige Daten enthält. Ein Lesezugriff darf weder Autopilot starten noch ein
aktives Ziel löschen oder Mastery verändern.

### 9.2 Deterministische Scope-Auflösung

Natürliche Sprache wird probabilistisch verstanden, reale Angebote werden
deterministisch aufgelöst:

```text
„Ich möchte Mathe in der Oberstufe in Hessen lernen.“
  -> Fach: Mathematik
  -> Stufe: Sekundarstufe II
  -> Region: Hessen
  -> Kursprofil: offen
  -> SkillPilot-Katalog: genau zwei reale Kandidaten
  -> Widgetfrage: Grundkurs oder Leistungskurs?
```

Im aktuellen chat-first Vertrag interpretiert das Modell die natürliche Sprache
ausschließlich gegen die frisch vom Backend gelieferten Katalogoptionen und
übergibt deren fachliche IDs strukturiert zurück. Die Mutation revalidiert sie
gegen Katalog und aktuellen Lernendenzustand. Ein späteres Widget kann diesen
Schritt mit einem deterministischen `CurriculumOfferingResolver` und
kurzlebigen, kataloggebundenen Auswahlreferenzen weiter härten.

### 9.3 Commands, Concurrency und spätere Receipts

Die aktuelle V1-App revalidiert jede Mutation unter den
bestehenden fachlichen Transaktions- und Lockgrenzen. Viele Übergänge sind
inhaltlich idempotent; ein allgemeines persistentes Command-Receipt mit
kanonischem Request-Hash gehört jedoch ausdrücklich zur späteren Härtungsstufe.
Dann werden Receipt und Domainmutation in derselben kurzen Transaktion
gespeichert, sodass ein Retry das gespeicherte Ergebnis statt einer zweiten
Mutation liefert.

Coach, Cockpit und parallele Providergespräche können denselben Lernenden ändern.
Deshalb erfolgen Mutationen unter derselben fachlichen Lock-/Revision-Grenze und
werden unmittelbar vor dem Schreiben erneut validiert. Kein Datenbank-Lock bleibt
während eines Modellaufrufs offen.

### 9.4 Sichere Modellprojektion

Der Provider erhält nur:

- lokale, verständliche Fachlabels;
- die gerade nötige Aufgaben- und Bewertungsinformation;
- einen begrenzten Lernstandssnapshot;
- freigegebene Ressourcen und backendgenerierte Deep Links;
- in einer späteren Härtungsstufe zweckgebundene kurzlebige Receipts, wenn sie
  für einen Same-Turn-Schritt nötig sind.

Nicht erlaubt sind rohe interne Learner-State-DTOs, permanente Lernenden-IDs,
OAuth-Tokens, beliebige Dateipfade oder URLs, nicht freigegebene Lösungen und
unnötige personenbezogene Daten.

## 10. App- und Toolmuster

Toolnamen, Beschreibungen, Ein-/Ausgabeschemata und Widgetressourcen bilden einen
neutral englischen V1-Kontrollvertrag. Nutzertexte und fachliche Nutzdaten
werden anhand der backendgebundenen `communicationLocale` lokalisiert. Alle
Sprachen bilden auf dieselben Use-Cases ab.

Empfohlen ist die Trennung in:

- **modell- und app-sichtbares Render-/Open-Tool:** öffnet oder aktualisiert das
  passende Widget;
- **app-exklusive Interaktionstools:** Auswahl, Formularabgabe, explizite
  Bestätigung; technische Referenzen bleiben im Widget;
- **modell-sichtbare reine Lesetools:** frischen Coachzustand, Aufgabe oder eine
  ausstehende Einreichung laden;
- **eng begrenzte modell-sichtbare Schreibtools:** fachliche Bewertung oder
  andere genau definierte Ergebnisse mit Receipt speichern.

Toolannotation und tatsächliches Verhalten müssen übereinstimmen:

- echte Reads: `readOnlyHint: true`;
- jede Mutation: `readOnlyHint: false`;
- `openWorldHint: false`, solange ausschließlich SkillPilot-Daten berührt werden;
- `destructiveHint` entsprechend der wirklichen Reversibilität;
- fachlich folgenreiche oder irreversible Handlungen benötigen explizite
  UI-Bestätigung.

Ein Prompt ist keine Sicherheitsgrenze. Der MCP-Server erzwingt Schema,
Autorisierung, Zustandsmaschine und erlaubte Übergänge selbst.

## 11. Vollständige Nutzerreisen

Parität bedeutet nicht identische alte Methoden, sondern mindestens gleichwertige
End-to-End-Abläufe.

| Nutzerreise | Produktive Mindestanforderung |
| --- | --- |
| Einstieg und Wiederaufnahme | vertrauliche OAuth-Appverbindung plus frische, automatisch transportierte 24h-Lernsession aus dem First-Party-WebGUI; ohne aktuelle Session nur WebGUI-Hinweis, nach Sessionfehler unveränderte Serverinstruktion und nicht duplizierte `startUrl`, jeweils neuer Chat; permanente ID niemals im Providerpfad |
| Natürliche Einrichtung | permanente ID, Providerhinweis und Level-2-Konfiguration vollständig im First-Party-WebGUI; `Lernen starten` gibt die Startnachricht frei und öffnet einen neuen Chat |
| Lernpfad und Frontier | frische Backendprojektion; keine Chat-Memory-Autorität |
| Zielwahl und Ressourcen | gültige Kandidaten; backendgenerierte Links |
| Erklärung und Aufgabe | alters- und fachgerechte Darstellung; klare Aufgabenfassung |
| Lösung einreichen | zunächst sichtbare Chatabgabe; später direkte Widgetaktion mit persistentem Submission-Receipt |
| Bewertung | fachlich gleichwertige Wege anerkennen; keine reine Wortlautprüfung |
| Mastery | nur nach erlaubter Evidenz; sichtbar und korrigierbar |
| Verified Recall | serverseitiger Kartenstatus; später zusätzlich Evidence-/Result-Receipt |
| Prüfung | zunächst sichtbare Chatabgabe und regelgesteuerte Freigabe; später Attempt und explizite Widgetabgabe |
| Profil-/Curriculumwechsel | ausschließlich im First-Party-WebGUI erklären, validieren und soweit sinnvoll Undo anbieten; der Chat verweist auf diesen Weg |
| Fehler und Quoten | keine Doppelmutation; Zustand bleibt erhalten; Cockpit nutzbar |
| DE/EN | jede Reise separat in der jeweiligen App abgenommen |

### Bewertungsgrundsatz

Eine Referenzlösung ist kein exklusiver Wortlaut. Mathematisch oder fachlich
gleichwertige Ergebnisse, Darstellungen, zulässige Rundungen und alternative
korrekte Wege erhalten dieselben Punkte, sofern die Aufgabe keine bestimmte Form
ausdrücklich verlangt. Bei einer Prüfung führt unleserliche Eingabe nicht zu
erfundenen Fehlern oder einem lösungslenkenden Dialog, sondern zu einem klaren
Status „nicht zuverlässig bewertbar“ ohne stille Mastery-Wirkung.

## 12. Sicherheit, Datenschutz und Minderjährige

Vor einer produktiven Freigabe sind mindestens erforderlich:

- deny-by-default für alle MCP-Routen;
- OAuth-Scope- und Object-Level-Autorisierung pro Lernendem, Einreichung,
  Recall-Batch und Exam-Attempt;
- eine bei jedem fachlichen Tool als Argument verlangte und geprüfte, exakt
  24 Stunden gültige Lernsession, die Token-Refresh nicht verlängert;
- Bindung opaker Referenzen an Subjekt, App, Zweck, Revision und kurze TTL;
- Rate Limits und Schutz gegen Replay, Cross-Learner-Zugriff und IDOR;
- Content Security Policy mit exakt benötigten Domains;
- minimale, dokumentierte Providerdaten und keine Debug-/Trace-IDs in
  Toolantworten;
- getrennte Retention für Aufgaben, Antworten, Feedback, Anhänge und Auditdaten;
- sichere Datei- und Bildverarbeitung vor Speicherung oder Providerweitergabe;
- alters-, rechtsraum- und providerspezifische Freigabe für Minderjährige;
- Beachtung der aktuellen OpenAI-App-Grenze: veröffentlichte Apps müssen für ein
  allgemeines Publikum einschließlich 13- bis 17-Jähriger geeignet sein und
  dürfen nicht ausdrücklich Kinder unter 13 adressieren. Der OpenAI-App-Kanal
  ist daher zunächst **kein zulässiger Kanal für Unter-13-Jährige**. Wenn diese
  Zielgruppe zwingend ist, sind Altersanforderung und Providerkanal ein eigenes
  Go-/No-Go und möglicherweise nicht gleichzeitig erfüllbar;
- Export, Löschung, Widerruf und Trennung von Supportzugriffen;
- adversariale Tests gegen Prompt Injection über Chat, Bilder, Curriculumtexte
  und Ressourcen.

Pseudonymisierte Lerndaten bleiben personenbezogene Daten. Der Verzicht auf eine
sichtbare SkillPilot-ID macht die Daten nicht anonym.

## 13. Implementierter lokaler Prototyp

Der Prototyp liegt vollständig getrennt von den Custom-GPT-Paketen unter
[`ai/openai app/`](https://github.com/enpasos/skillpilot/tree/main/ai/openai%20app). Er verwendet den offiziellen
MCP-Server- und MCP-Apps-Ansatz und ruft keine Modell-API auf.

### 13.1 Start

```bash
cd "ai/openai app"
npm install
npm start
```

Standardport ist `8790`; er kann mit `PORT` geändert werden.

### 13.2 Lokale Endpunkte

| Zweck | Neutraler V1-Vertrag |
| --- | --- |
| MCP | `http://localhost:8790/mcp` |
| lokale Hostsimulation | `http://localhost:8790/preview` |
| Widgetressource | `ui://skillpilot/coach/v1/coach.html` |

Zusätzlich liefert `http://localhost:8790/health` die konfigurierten Varianten.
Die Preview simuliert nur den Host-/Widget-Dialog; sie ist weder ChatGPT noch eine
Modellbewertung.

### 13.3 Bereits bewiesener vertikaler Slice

- ein neutraler MCP-Pfad und ein stabiler Satz neutral englischer Toolnamen;
- ein selbstenthaltenes Widgetartefakt;
- Kursauswahl über sichtbare Labels bei widget-internen opaken Referenzen;
- Einreichung einer Antwort aus dem Widget;
- modellseitiges Laden der ausstehenden Antwort und Speichern einer Bewertung;
- frisches Laden des persistierten Coachzustands ohne sichtbare Sitzungskennung;
- opake Session-, Choice- und Submission-Referenzen fehlen in öffentlichem
  `content` und `structuredContent`;
- persistenter Demozustand unter
  `tmp/openai-mcp-app-prototype/coach-state.json`;
- Protokoll-, Store- und Widget-Build-Tests mit lokalisierten Payload-Katalogen.

Die sechs aktuellen Demo-Tools bilden ausschließlich diesen
vertikalen Beweis ab. Ihre geringe Zahl ist **keine Behauptung vollständiger
Workflow-Parität**.

### 13.4 Bewusst noch nicht produktiv

Der Prototyp:

- verwendet `noauth`;
- hält nur einen Demozustand und lokalisierte Demo-Payloads;
- ist noch nicht mit dem produktiven SkillPilot-Backend verbunden;
- verwendet eine fest definierte Kurswahl und Übungsaufgabe;
- implementiert noch keine mehrbenutzerfähige Concurrency- oder
  Receipt-Grenze;
- deckt Mastery, Frontier, Recall, Exam, Dateien und natürliche vollständige
  Scope-Auflösung noch nicht ab;
- ist weder öffentlich per HTTPS bereitgestellt noch im OpenAI-Plugin-Verzeichnis
  eingereicht;
- beweist nicht die Nutzbarkeit in einem kostenlosen oder fest bepreisten
  Providerplan.

Diese Lücken dürfen nicht durch Testdaten oder Promptanweisungen kaschiert werden.

## 14. Implementierter produktionsnaher Spring-Pfad

Der mehrsprachige web-started V1-Vertrag samt zwei dedizierten hashgebundenen
MCP-Apps-UIs für Lernzielbild und Karteikartenlernen ist direkt im bestehenden
Backend implementiert.
Der technisch öffentlich erreichbare, aber noch nicht als Plugin veröffentlichte
Pfad verwendet den dedizierten V1-Origin:

```text
https://mcp-coach-v1.skillpilot.com/mcp
  -> dedizierter TLS-vHost ohne Client-TLS
  -> /internal/openai/v1/mcp auf dem loopback-gebundenen Backend
  -> eigener WebMvcStatelessServerTransport
  -> eigener McpStatelessSyncServer
  -> genau zwölf neutrale OpenAI-V1-Werkzeuge
  -> vertrauliche OAuth-Clientprüfung, 24h-Lernsitzungsprüfung und Write-Kill-Switch
  -> CoachToolFacade / CoachStateProjection
  -> bestehende SkillPilot-Domain und PostgreSQL
```

Die allgemeine Spring-AI-MCP-Autokonfiguration bleibt deaktiviert. Eine eigene
Fabrik erzeugt stattdessen je Provider einen Transport, Server, Router,
Instructions und eine ausdrückliche Tool-Allowlist. Damit können die internen
Handler `/internal/openai/v1/mcp` und `/api/claude/mcp` im selben Prozess laufen,
ohne Tools
oder Verträge zu vermischen. Der OpenAI-Server verwendet native MCP-Ergebnisse
mit `structuredContent`, `outputSchema`, Annotationen und Security-Metadaten.

Der V1-Vertrag umfasst:

- Kontext-Rehydration und gezielte Navigation mit unveränderter
  `learningSessionId`;
- Curriculum, Personalisierung, Scope und aktives Ziel;
- kontrollierte Mastery-Aktualisierung;
- vollständigen Verified-Recall-Ablauf;
- freigegebene Prüfungsgrundlage nach sichtbarer vollständiger Abgabe.

Normale Kontexte werden allowlist-basiert über die gemeinsame sichere Projektion
erzeugt. Sie enthalten keine permanente Lernenden-ID, OAuth-Tokens oder
vorzeitige Prüfungslösung. Ein eigener OpenAI-V1-OAuth-Issuer unterstützt einen
exakt vorregistrierten vertraulichen Client mit `client_secret_basic`,
Authorization Code mit PKCE `S256`, exakter Redirect- und Resource-Bindung,
opaken rotierenden Tokens und Widerruf. Die davon getrennte Lernsession wird bei
jedem **Lernen starten** neu erzeugt, läuft exakt 24 Stunden nach Erzeugung ab
und wird als Argument von jedem fachlichen Tool geprüft. Alle
Schreibwerkzeuge besitzen zusätzlich einen unabhängigen, standardmäßig
deaktivierten Runtime-Kill-Switch.

Das Cockpit verwendet für jede unterstützte Interaktionssprache dieselbe
`openai-mcp`-Variante. Visible Session bleibt nur der koordinierte
Custom-GPT-Rollback. Nicht unterstützte Sprachwerte werden bei der
Sessionerzeugung kontrolliert abgewiesen; eine unterstützte Sprache benötigt
keinen eigenen Appvertrag.

Die App läuft im ChatGPT-Entwicklermodus. Vor einer öffentlichen Freigabe bleiben
die sichere Clientkonfiguration, ein Reconnect auf den vertraulichen
OAuth-Clientvertrag, positive und negative Clientbindungsprüfungen,
Langdialog- und Kompaktierungstests sowie der Tarif-/Regionsnachweis
Release-Gates. Das
Betriebsverfahren steht in
[openai-mcp-coach-v1.md](../../deploy/openai-mcp-coach-v1.md).

## 15. Veröffentlichung als OpenAI-Plugin

OpenAI veröffentlicht Apps inzwischen innerhalb von Plugins. Für SkillPilot ist
der robuste Zielzuschnitt:

- die unabhängig einreichbare mehrsprachige Linie `skillpilot-coach-v1` aus
  gleichnamigem neutralem Skill und direkt eingereichtem MCP-Server
  `https://mcp-coach-v1.skillpilot.com/mcp`;
- für spätere inkompatible Contract-Majors eigenständige Linien statt
  sprachspezifischer Parallelplugins;
- ein öffentlicher HTTPS-MCP-Endpunkt pro Major, passgenaue Metadaten,
  Datenschutz-/Supportangaben, Testfälle und optional Screenshots;
- sprachmarkierte Acceptance und Telemetrie innerhalb derselben Major-Linie.

Das versionierte Quellpaket verwendet `.codex-plugin/plugin.json`, `skills/`
und `.mcp.json`; die fachliche Skill-zu-MCP-Abhängigkeit wird zusätzlich in
`agents/openai.yaml` deklariert. Eine lokale
Kompatibilitätsabbildung `.app.json` wird nur für eine tatsächlich registrierte
Verbindung ergänzt. App-ID und Mapping werden durch die ChatGPT-Registrierung
erzeugt; `plugin-creator` übernimmt Paketierung, Marketplace und lokale
Installation. Präfixe werden nicht manuell umgeschrieben oder aus dem Appnamen
abgeleitet.

Bei der öffentlichen Einreichung wird diese lokale `.app.json`-Referenz nicht
als MCP-Paket veröffentlicht. Im Portal wird **With MCP** gewählt und der
neutrale Skill zusammen mit dem zugehörigen MCP-Server direkt zur
Prüfung eingereicht.

Der erste Pilot verwendet eine explizite Skillauswahl und deaktiviert die
implizite Aktivierung, soweit die jeweilige Oberfläche diese Policy auswertet.
Erst wenn direkte, indirekte und ausdrücklich negative Aktivierungstests grün
sind, darf die implizite Aktivierung freigegeben werden. Eine allgemeine
Fachfrage ohne SkillPilot-Bezug darf das Plugin weiterhin nicht in eine
Lernsession ziehen.

Die vorhandene App-only-Nutzung bleibt während der Migration verfügbar. Die
heutigen ausführlichen `SERVER_INSTRUCTIONS` werden erst ausgedünnt, nachdem
der gebündelte Skill dieselben Golden Journeys im realen Providerhost erfüllt.
Der Zielzustand enthält dort nur kurze werkzeugübergreifende Invarianten;
Coachrolle, Didaktik und Dialogablauf liegen dann im Skill.

Die Einreichung scannt unter anderem Toolnamen, Beschreibungen, Schemas,
Security-Schemes, Annotationen, `_meta`, UI-Ressourcen und CSP. Diese Metadaten
sind daher versionierte öffentliche Verträge. Kompatible PATCH- und MINOR-
Änderungen bleiben innerhalb der V1-Identität. Ein Breaking Change, das den
alten Vertrag später ablösen soll, erhält eine neue Plugin-Identität mit
eigenem MCP-Origin, eigener OAuth-Resource, eigenem Skillbaum und
eigenem Lebenszyklus. Es wird nicht als normaler Serverfix auf V1 überschrieben.
Veröffentlichte Snapshots unter
`contracts/published/openai/skillpilot-coach-v1/<version>/` bleiben
unveränderlich. Noch nicht veröffentlichte Arbeitsstände liegen getrennt unter
`contracts/drafts/` und dürfen innerhalb derselben vorgesehenen Paketversion
fortgeschrieben werden. Die vollständigen Regeln stehen im
[Versionierungs- und Lebenszyklusplan](openai-plugin-versioning-and-lifecycle.md);
das Betriebsverfahren steht im
[V1-Release-Runbook](../../deploy/openai-plugin-v1-release.md).

Produktionsvoraussetzungen sind unter anderem eine öffentlich erreichbare Domain,
korrekte CSP, verifizierte Publisher-Identität, erforderliche
App-Management-Berechtigung, Review-Testzugang und konsistente
Datenschutzerklärung. Review und Freigabe liegen außerhalb der Kontrolle von
SkillPilot.

### Tarif- und Oberflächen-Acceptance

Vor einer Aussage zur Erfüllung des Zahlungsmodells wird jede App mindestens in
folgender Matrix praktisch geprüft:

| Dimension | Zu prüfende Fälle |
| --- | --- |
| Tarif | kostenloser Consumerzugang; unterstützte feste Consumer-Abonnements |
| Oberfläche | derselbe MCP-Vertrag in ChatGPT-Web, Mobile-Web sowie nativen Desktop- und Mobile-Apps; Bild und Karteikartenlernen verwenden zwei getrennte aktive Ressourcen; frühere Bild-URIs bleiben passiv lesbar; nie veröffentlichte Startressourcen gehören nicht zum V1-Vertrag; es gibt keine User-Agent-/Surface-Gates oder Hostdarstellungsbehauptung, und der vollständige Textpfad bleibt erhalten; gegebenenfalls Codex nur als separater Anwendungsfall |
| Region | alle vorgesehenen Länder, insbesondere Deutschland/EU |
| Konto | privates Konto; relevante Workspace-Typen und Adminrichtlinien |
| Verbindung | Erstinstallation, OAuth, Widerruf, erneute Verbindung |
| Sprache | neutrale englische Kontrollschicht; jede sichtbare Antwort folgt der backendgebundenen `communicationLocale` |

Scheitert der kostenlose Zugang oder ein erforderlicher fester Tarif, ist die
harte Geschäftsanforderung für diesen Providerpfad nicht erfüllt – auch wenn die
Technik im Entwicklermodus funktioniert.

## 16. Lieferplan

### Phase 0 – Prototyp und Fallbacks

- lokaler neutraler MCP-App-Prototyp mit lokalisierten Payload-Katalogen;
- Visible-Session- und Legacy-Quellen getrennt und rollbackfähig halten;
- keine Vermischung der neuen Appverträge mit Custom-GPT-OpenAPI-Schemas.

**Stand:** abgeschlossen; Fallbackquellen bleiben getrennt erhalten.

### Phase 1 – Mehrsprachiger produktionsnaher Backendpfad

- isolierter MCP-Transport im Spring-Boot-Prozess;
- vollständiger chat-first Toolvertrag gegen bestehende Domain-Use-Cases;
- sichere, kompakte DTO-Projektionen;
- feste vertrauliche OAuth-Appidentität ohne Lernenden-Fallback;
- separate absolute 24h-Lernsession mit automatischem Startnachrichten- und
  Tooltransport, ohne manuelle Eingabe oder gleitende Verlängerung;
- standardmäßig deaktivierter Schreib-Kill-Switch und Cockpit-Canary.

**Stand:** implementiert, automatisiert getestet und im Entwicklermodus
integriert. Externer Exit ist der sichere vertrauliche
OAuth-Clientprofil-Cutover mit erneut verbundener App und vollständigem
sprachmarkierten End-to-End-Lauf.

### Phase 2 – Reale Nutzerreisen in jeder freigegebenen Sprache

- das versionierte neutrale Plugin-/Skill-Quellpaket und seinen CI-Vertrag
  pflegen;
- die vorhandene echte lokale App-Abbildung über den persönlichen Marketplace
  installieren und im neuen Chat gegen die App-only-Baseline testen;
- zunächst explizite Skillaktivierung und App-only-Rollback beibehalten;
- natürlicher Einstieg „Mathe – Oberstufe – Hessen“;
- fachliche GK-/LK-Auswahl ohne sichtbare technische Schlüssel;
- aktives Ziel, Frontier, Aufgabe, faire Bewertung und Mastery;
- Recall und Prüfung;
- Retry-, Reload-, Langdialog-, Parallelchat- und Cross-Learner-Negativtests;
- positive und negative Skillaktivierungsfälle sowie Tool-Trace-Parität;
- read-only Canary vor Freigabe der Schreibwerkzeuge.

**Exit:** komplette E2E-Suite im realen Providerhost mindestens für Deutsch und
Englisch mit explizit gewähltem Skill; danach dürfen die
MCP-Server-Instruktionen schrittweise auf werkzeugübergreifende Invarianten
reduziert werden.

### Phase 3 – Zwei dedizierte MCP-Apps-UIs und zusätzliche Härtung

- zwei getrennte aktive hashgebundene `text/html;profile=mcp-app`-Ressourcen;
  Bild-Renderer und Karteikartenlauncher binden jeweils ausschließlich ihre
  eigene Ressource;
- Web-first Übergabe: permanente ID, Providerhinweis und Level-2-Konfiguration
  bleiben im First-Party-WebGUI; der unveröffentlichte providerseitige
  Startpfad ist vollständig entfernt;
- genau eine aktuelle bild-only Ressource für den read-only Renderer; ohne
  gültiges kanonisches Bild fällt die Darstellung auf den normalen Chat zurück;
- eigene interaktive Karteikartenressource mit privatem begrenztem Batch;
  Blättern bleibt lokal und nur das app-only Review schreibt die angezeigte
  Karte;
- spätere direkte fachliche Auswahl- und Einreichungsaktionen in jeweils neu
  entworfenen Widgets;
- serverseitige Submission-/Receipt-Härtung für garantiert auszuführende
  Schritte;
- sichere Dateien/Bilder, Export, Löschung, Quoten und Degradation.

**Zwischenstand:** Beide aktiven UI-Ressourcen sind im unveröffentlichten
`1.0.0`-Draft implementiert und getrennt gebunden. Renderer-spezifisch bleibt
genau eine aktuelle
hashgebundene Bildressource aktiv; frühere ausgelieferte Bild-URIs bleiben
ausschließlich passiv lesbar. Gewöhnliche Coach-Werkzeuge und app-only
Folgetools bleiben UI-ungebunden.

**Exit:** UI-Funktionen verbessern die Bedienung, ohne den stabilen chat-first
Vertrag oder die Backendautorität zu schwächen.

### Phase 4 – OpenAI-Veröffentlichung und Tarifnachweis

- Veröffentlichung als kombiniertes mehrsprachiges Skill-/MCP-Plugin und reale
  Tarifmatrix;
- vollständige Acceptance für jede freigegebene Interaktionssprache;
- reale Tarif-, Regions-, Web- und Mobilmatrix;
- gestufter Rollout mit getrennten Kill-Switches.

**Exit:** die Zahlungsanforderung ist für die tatsächlich unterstützten Pläne
belegt, nicht nur angenommen.

### Phase 5 – Claude

- eigener Claude-spezifischer DE- und EN-Vertrag;
- Wiederverwendung ausschließlich des gemeinsamen SafeCoachRuntime;
- gleiche fachliche Acceptance Suite;
- eigener Plan-, Verfügbarkeits-, OAuth- und Veröffentlichungsnachweis.

Claude ist kein Schema-Alias der OpenAI-App. Die Providergrenze bleibt
passgenau.

## 17. Abnahme- und Go-/No-Go-Gates

Für den Phase-2-Pilot gelten die chat-first Gates plus die getrennten
Release-Gates beider aktiver MCP-Apps-UIs. Weitere widget-spezifische
Teilanforderungen werden erst dann zu Release-Gates, wenn fachliche Auswahl-,
Abgabe- oder Prüfungsoberflächen ausgeliefert werden.

| Gate | Muss vor dem jeweils betroffenen Release erfüllt sein |
| --- | --- |
| Kostenmodell | kein SkillPilot-Modell-API-Aufruf; Zieltarife real bestätigt |
| Paketisolation | getrennte Plugins, Skills, Appregistrierungen, Endpunkte, Toolsets, Tests und Kill-Switches; Widgets und ihre Tests zusätzlich getrennt, sofern sie ausgeliefert werden |
| Auth | genau ein vertraulicher OAuth-Client mit `client_secret_basic`, OAuth 2.1/PKCE, exakter Callback/Resource/Scope, automatischer Bearer-Transport, Widerruf, getrennte über eine ausdrücklich autorisierte Startfläche erzeugte 24h-Lernsession und Cross-Learner-Negativtests |
| Zustand | Backend autoritativ; Reload und Kontextkompaktierung ändern keine fachlichen Fakten |
| UX | kein manuelles Kopieren technischer Werte in den Chat; permanente ID und Level-2-Konfiguration nur im First-Party-WebGUI; Lernsession automatisch im vorbereiteten Prompt; erfolgreicher Kontextabruf in jedem Antwortturn; Zielbild nur für passendes aktives atomares Ziel und sichere Chat-Degradation ohne Bild |
| Regelownership | jede `COACH-*`-Regel hat genau einen primären Zielort, Legacy-Quelle und Acceptance-Nachweis |
| Invocation | explizite und später implizite Skillaktivierung mit kuratierten positiven und negativen Prompts pro Sprache; zuverlässige Widgetaktionen nur als zusätzliches Gate für Releases mit Widget |
| Idempotenz | keine Doppelmutation bei Retry, Hostwiederholung oder Prozessabbruch |
| Fachqualität | alternative korrekte Lösungen werden anerkannt; keine Lösung vor Examabgabe |
| Parität | alle Must-Nutzerreisen separat für DE und EN grün |
| Privacy/Safety | minimale Daten, korrekte Disclosure, Retention, Löschung, CSP und Altersfreigabe |
| Betrieb | Rate Limits, Observability ohne Geheimnisse, Degradation und Rollback getestet |
| Distribution | Review bestanden und Nutzbarkeit in Zielregion/-oberfläche/-tarif nachgewiesen |

## 18. Risiken und Gegenmaßnahmen

| Risiko | Konsequenz | Gegenmaßnahme |
| --- | --- | --- |
| Provider ruft bei freiem Chat das Tool nicht auf | Nutzerreise stockt | Toolmetadaten und Prompt-Acceptance; Cockpit-Degradation; optionale kritische Widgetaktionen erst in Phase 3 |
| Skill wird nicht oder fälschlich aktiviert | Coachregeln fehlen oder allgemeine Fachfragen starten SkillPilot | Pilot mit expliziter Aktivierung; getrennte Aktivierungs- und Ausführungs-Evaluation; implizite Aktivierung erst nach Negativ-Gate |
| Skill und MCP-Instruktionen driften auseinander | widersprüchliche Modellsteuerung | Policy-ID und primärer Zielort pro Regel; zeitlich begrenzte Doppelbelegung; Server-Instruktionen erst nach Paritätsnachweis ausdünnen |
| App/Plugin im Zieltarif nicht verfügbar | Zahlungsanforderung verfehlt | Tarifmatrix als Go-/No-Go; zweiter Provider; nicht-generatives Cockpit |
| Zielgruppe umfasst Kinder unter 13 | aktuelle OpenAI-App-Richtlinie erlaubt kein ausdrückliches Targeting | Unter-13 vom OpenAI-Kanal ausschließen; alternative zulässige Oberfläche/Provider prüfen; keine Altersableitung aus Klassenstufe |
| Review abgelehnt oder verzögert | keine öffentliche Distribution | Developer-Mode-Pilot, Review-Checkliste, keine falsche Launchzusage |
| veröffentlichter Vertrag wird inkompatibel geändert | bestehende Installationen brechen | additive Versionierung und getrennte App-Releases |
| Session oder Widget-Metadaten werden allein als Auth verwendet | Cross-User-/Replay-Risiko | vertraulicher OAuth-Client plus separate first-party Lernsession; beide bei jedem fachlichen Tool revalidieren |
| eine Sprachänderung beeinflusst andere Sprachen unbemerkt | sprachübergreifende Regression | ein neutraler Vertrag, sprachmarkierte Acceptance-Fälle, Telemetrie, Canary und Kill-Switch |
| Modell bewertet nur nach Musterwortlaut | korrekte Lösungen werden abgewiesen | allgemeine Äquivalenzregel, kuratierte Alternativlösungen, Human-Rater-Gate |
| App wird mit vollwertiger Backendintegration verwechselt | verfrühte Freigabe | Prototyplimits sichtbar halten; Security- und Workflow-Gates erzwingen |

## 19. Bewusst verworfene Primärvarianten

### SkillPilot-eigener Chat mit SkillPilot-bezahlter Modell-API

Technisch böte dies maximale Turnkontrolle, verletzt aber die harte Anforderung,
dass die Person den Provider direkt im kostenlosen oder festen Consumerplan
nutzt. Es bleibt höchstens eine spätere, separat finanzierte Produktoption.

### Sprachspezifische Parallelplugins innerhalb desselben Contract-Majors

Sie duplizieren Toolverträge, OAuth-Clients, Origins und Releasepflege, obwohl
die Sprache bereits autoritativ in der Lernsession liegt. Sprache wird deshalb
innerhalb derselben Major-Linie über lokalisierte Backendnutzdaten und
sprachmarkierte Acceptance abgesichert. Nur ein inkompatibler Contract-Major
erzeugt eine neue Plugin-Identität.

### Weitere Härtung sichtbarer Custom-GPT-Relaywerte

Sie kann kurzfristig Funktion sichern, löst aber den Komfortverlust und die
Abhängigkeit vom fehlerhaften Turn-Kontext nicht. Visible Session bleibt nur ein
Rückfallpfad.

### BYOK oder SkillPilot-Relay eines Nutzer-API-Keys

Dies ist nutzungsabhängige API-Abrechnung, kein kostenloser oder fester
Consumerplan, und erhöht Secret-, Support- und Datenschutzrisiken. Es erfüllt die
Kernanforderung nicht.

## 20. Unmittelbar nächste Schritte

1. Das mit der echten hostgenerierten `.app.json`-Abbildung versehene neutrale
   V1-Quellpaket über den persönlichen Marketplace installieren, den
   Providerhost neu laden und in einem neuen Chat explizit aktivieren; die
   direkte öffentliche MCP-Bindung bleibt unverändert.
2. Activation-, Tool-Trace-, Golden-Journey- sowie Fehlerfall-Parität gegen die
   App-only-Baseline messen. Die Toolspur muss dabei die registrierte
   `.app.json`-Verbindung nachweisen; ein Erfolg nur über die parallele direkte
   `.mcp.json`-Bindung besteht dieses Gate nicht.
3. Erst nach bestandenem Paritätsgate die ausführlichen
   `OpenAiDeCoachMcpContract.SERVER_INSTRUCTIONS` schrittweise auf kurze
   werkzeugübergreifende Invarianten reduzieren.
4. Parallel den exakt vorregistrierten vertraulichen Client mit langem
   zufälligem Secret,
   `client_secret_basic`, PKCE und exakten Redirect-URIs produktiv aktivieren;
   DCR, CIMD, `none` und alternative Clientprofile geschlossen halten.
5. Die App erneut verbinden und Metadata, OAuth/PKCE, exakte Redirect-,
   Resource-/Audience- und Scope-Bindung sowie Client- und Toolisolation prüfen.
6. Prüfen, dass jeder ausdrücklich bestätigte First-Party-Start genau eine neue
   Lernsession erzeugt, einen neuen Chat öffnet, die Referenz automatisch in den
   Prompt einsetzt und jeder fachliche MCP-Aufruf beide Nachweise verlangt.
   Bild- und Karteikarten-UI allein erzeugen keine Session.
7. Read-only Canary, danach den vollständigen mehrsprachigen Schreibpilot nach dem
   Deployment-Runbook durchführen.
8. Erst nach dokumentierter Workflow-, Tarif-, Regions-, Sicherheits- und
   Oberflächen-Acceptance öffentlich freigeben.
9. Die zwei aktiven UI-Bindungen getrennt abnehmen: Bild-Renderer und
   Karteikartenlauncher zeigen jeweils nur auf ihre eigene aktuelle Ressource;
   Kartenreview und gewöhnliche Coach-Werkzeuge bleiben ungebunden.
10. Die Zielbildfreigabe mit Bild, ohne Bild und bei fehlerhaften Bilddaten
   abnehmen. In Web-, Mobile-Web- und nativen Hosts prüfen, dass derselbe
   Renderer ohne User-Agent-/Surface-Gate die strukturierte Visualisierung an
   die eine hashgebundene bild-only Ressource liefert und der Textpfad
   vollständig bleibt. Die Toolantwort darf nicht behaupten, dass der Host das
   Bild dargestellt hat. Englisch und weitere unterstützte Sprachen werden
   durch denselben V1-Vertrag mit eigenen Acceptance-Fällen freigegeben.

## 21. Referenzen

- [Lokaler OpenAI-MCP-App-Prototyp](https://github.com/enpasos/skillpilot/tree/main/ai/openai%20app)
- [Provider-Neutral Learning-Coach Boundary](provider-neutral-coach-boundary.md)
- [Rollback: ChatGPT Visible Session](chatgpt-visible-session-flow.md)
- [OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md)
- [OpenAI-Plugin: Versionierung und Lebenszyklus](openai-plugin-versioning-and-lifecycle.md)
- [SkillPilot Coach v1: Release, Rollback und Stilllegung](../../deploy/openai-plugin-v1-release.md)
- [Legacy ChatGPT Startcode / Session Flow](chatgpt-startcode-session-flow.md)
- [OpenAI Apps SDK: MCP-Server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [OpenAI Apps SDK: UI und MCP-Apps-Bridge](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
- [OpenAI Apps SDK: Zustandsverwaltung](https://developers.openai.com/apps-sdk/build/state-management)
- [OpenAI Apps SDK: Authentifizierung](https://developers.openai.com/apps-sdk/build/auth)
- [OpenAI: App für Plugin-Einreichung vorbereiten](https://developers.openai.com/apps-sdk/deploy/submission)
- [OpenAI: Plugin-Architektur](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI: Skills bauen und mit MCP-Werkzeugen verbinden](https://developers.openai.com/plugins/build/skills)
- [OpenAI: Plugins paketieren](https://developers.openai.com/plugins/build/plugins)
- [OpenAI: MCP-Server für Plugins](https://developers.openai.com/plugins/build/mcp-server)
- [OpenAI: Plugins einreichen](https://developers.openai.com/plugins/deploy/submission)
- [OpenAI Help: Plugins in ChatGPT und Codex](https://help.openai.com/de-de/articles/20001256-plugins-in-chatgpt-and-codex)
- [Öffentlicher Reproduktionsthread](https://community.openai.com/t/custom-gpt-does-not-reuse-an-action-response-on-the-next-user-turn-reproducible-after-gpt-5-6-rollout/1386723)
