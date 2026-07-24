# SkillPilot-Lerncoach: providergehostete MCP-App-Architektur

**Stand:** 24. Juli 2026

**Status:** Deutsche data-only App lokal vollständig an den produktiven
Spring-Boot-Fachkern und einen eigenen OAuth-/MCP-Vertrag angebunden. Deployment,
reale ChatGPT-OAuth-Acceptance und Tarifnachweis stehen noch aus. Widget und
englische App folgen erst nach stabiler deutscher Freigabe.

Der konkrete DE-first-Umsetzungs-, Cutover- und Rollbackplan steht in
[openai-mcp-coach-migration-plan.md](openai-mcp-coach-migration-plan.md). Die
erste vollständige Migration erfolgt bewusst **UI-los**; Widgets und die
englische App folgen erst nach stabiler deutscher Workflow-Parität.
Für Identität, automatischen OAuth-Token-Transport, Browser-Binding und die
davon getrennte 24h-Lernsession ist
[openai-mcp-oauth-learner-session-architecture.md](openai-mcp-oauth-learner-session-architecture.md)
verbindlich.

Dieses Dokument ist selbsttragend. Es beschreibt die Entscheidung, ihre harten
Randbedingungen, den umgesetzten Prototyp, die noch fehlenden Produktionsgrenzen
und überprüfbare Freigabekriterien.

## 1. Management Summary

SkillPilot soll den Lerncoach primär als **providergehostete MCP App** anbieten.
Das Modell, der freie Chat und die App-Oberfläche laufen in ChatGPT beziehungsweise
später Claude; Curriculum, Scope, aktives Lernziel, Frontier, Mastery, Recall und
Prüfungszustand bleiben autoritativ im SkillPilot-Backend.

Langfristig werden für ChatGPT **zwei eigenständig registrierte Apps** gebaut:

- **SkillPilot Coach (Deutsch)** mit eigenem MCP-Endpunkt, deutschem Toolvertrag,
  zunächst ohne Widget und mit eigener Acceptance Suite;
- **SkillPilot Coach English** mit eigenem MCP-Endpunkt, englischem Toolvertrag,
  später eigenem Widget und eigener Acceptance Suite.

Beide Apps dürfen dieselben internen SkillPilot-Domain-Services und zunächst auch
denselben Deployment-Prozess verwenden. Ihre externe Oberfläche wird jedoch nicht
zu einem sprachumschaltenden Universalvertrag zusammengelegt. Robustheit,
getrennte Freigabe und unabhängiger Rollback sind wichtiger als die Eleganz einer
einzigen App.

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
| Natürliche Bedienung. | Fachliche Auswahlen erscheinen als Buttons, Karten oder verständliche Labels; keine sichtbaren Sitzungs-, Auswahl- oder Transport-Keys. |
| SkillPilot bleibt fachliche Autorität. | Der Provider erhält sichere Projektionen; jede relevante Mutation wird im Backend autorisiert, validiert und persistiert. |
| Kein Vertrauen in Chat-Kontextretention. | Zustand wird bei Bedarf frisch aus dem Backend geladen. Verdeckte Action-Ergebnisse aus früheren Turns sind keine Voraussetzung. |
| Keine dauerhafte SkillPilot-ID beim Provider. | Automatisch transportierter OAuth-Zugriff, opakes Subject und eine separate aktive 24h-Lernsession werden serverseitig aufgelöst; die permanente interne Lernenden-ID wird weder Toolargument noch Toolergebnis. |
| Deutsch und Englisch funktionieren solide. | Zwei separat registrierte Apps mit getrennten Verträgen, Ressourcen, Tests, Veröffentlichung und Telemetrie. |
| Bestehende Arbeit bleibt reversibel. | Visible-Session- und Legacy-Custom-GPT-Quellen bleiben getrennte, unveränderte Rückfallpfade. |
| Vollständige Lernabläufe statt Methodenparität. | Freigabe erfolgt gegen Nutzerreisen und fachliche Invarianten, nicht gegen eine 1:1-Kopie alter Endpunkte. |

Eine First-Party-Chatoberfläche mit einem von SkillPilot bezahlten Modellaufruf ist
für diese Zielarchitektur ausdrücklich **keine Primäroption**: Sie würde die
zentrale Kosten- und Zahlungsanforderung verletzen. Ein nicht-generatives
SkillPilot-Cockpit bleibt als robuste Degradation sinnvoll.

## 3. Warum zwei Apps statt einer App mit Sprachumschaltung?

Die Entscheidung betrifft die **externe Produkt- und Vertragsgrenze**, nicht die
interne Codewiederverwendung.

### 3.1 Gründe für zwei registrierte Apps

1. **Eindeutigere Toolauswahl:** Namen, Beschreibungen, Beispiele und
   Instruktionen sind vollständig in einer Sprache. Das reduziert konkurrierende
   Werkzeuge und Fehlrouting durch das Hostmodell.
2. **Passgenaue Benutzerführung:** Texte, didaktische Konventionen,
   Bewertungsanweisungen und Fehlermeldungen sind keine nachträglich übersetzten
   Varianten eines kleinsten gemeinsamen Nenners.
3. **Getrennte Qualitätsfreigabe:** Ein deutscher Vertrag kann nicht versehentlich
   durch eine englische Schema- oder Widgetänderung freigegeben werden.
4. **Unabhängiger Rollout und Rollback:** Eine fehlerhafte Sprachvariante lässt
   sich stoppen, ohne die andere aus dem Verzeichnis oder aus bestehenden
   Verbindungen zu entfernen.
5. **Klare Messbarkeit:** Invocation-Erfolg, Abbruch, fachliche Qualität und
   Hostabweichungen werden pro Sprache sichtbar.
6. **Stabile veröffentlichte Verträge:** Toolmetadaten und UI-Ressourcen sind Teil
   des geprüften Appvertrags. Sprachspezifische Änderungen können getrennt
   versioniert und eingereicht werden.

### 3.2 Was trotzdem gemeinsam bleibt

- Curriculum-Katalog und Composition-View-Auflösung;
- Autorisierung und Abbildung eines Provider-Subjekts auf einen Lernenden;
- reine Coach-State-Projektion;
- Scope-, Ziel-, Mastery-, Recall- und Exam-Use-Cases;
- Idempotenz-, Receipt-, Concurrency- und Auditmechanismen;
- fachliche Testfälle, aus denen sprachspezifische Acceptance Suites abgeleitet
  werden;
- Infrastruktur, sofern getrennte Endpunkte und unabhängige Rollbacks erhalten
  bleiben.

### 3.3 Konkrete Deploymentsicht

Zwei Apps verlangen nicht zwingend zwei Serverprozesse. Ein Prozess darf beide
MCP-Endpunkte bereitstellen, solange folgende Grenzen hart bleiben:

```text
App-Registrierung DE  -> MCP-Endpunkt DE -> Vertrag DE -> Widget DE
App-Registrierung EN  -> MCP-Endpunkt EN -> Vertrag EN -> Widget EN
                                          \
                                           -> gemeinsame sichere Domain-Services
```

Für ChatGPT ist das Ziel daher zwei unabhängig review- und veröffentlichbare
App-/Plugin-Registrierungen. Ob sie auf demselben Origin betrieben werden, ist
eine Betriebsentscheidung; der Endpunktpfad und der veröffentlichte Vertrag
bleiben getrennt.

## 4. Produkt- und Zahlungsmodell

```text
Lernende Person
  |-- nutzt kostenlosen Providerzugang oder festes Consumer-Abonnement
  |-- installiert/verbindet die SkillPilot-App beim Provider
  v
Provider-Host (ChatGPT, später Claude)
  |-- stellt Modell und Chat bereit
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

OpenAI dokumentiert, dass Plugins der zentrale Veröffentlichungsweg sind und eine
MCP-App als App-only-Plugin oder gemeinsam mit Skills eingereicht werden kann.
Installation und Nutzung können dennoch von Tarif, Workspace-Einstellungen,
Rolle, Oberfläche, Region und Appfunktionen abhängen. Diese Produktabhängigkeit
ist kein Implementierungsdetail, sondern ein Go-/No-Go-Kriterium.

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
             .---------------------------------.
             | ChatGPT + Plugin-Verzeichnis    |
             |                                 |
             |  App DE          App EN (später)|
             |  data-only       Widget optional|
             '-----|---------------|-----------'
                   | HTTPS/MCP     | HTTPS/MCP
                   v               v
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
| Provider-Host | Modell, Chat, Toolauswahl, Darstellung der App | fachlichen Zustand autoritativ festlegen |
| Sprachspezifische App | lokalisierte Tools, UI, Toolmetadaten und Hostinteraktion | einen Universalvertrag durch Laufzeit-Sprachflags simulieren |
| Provider Boundary | OAuth, Scopes, Rate Limits, sichere Projektion, Tool-zu-Use-Case-Abbildung | rohe interne DTOs oder Identitäten weiterreichen |
| SafeCoachRuntime | freigegebene Queries und Commands, frische Revalidierung und fachliche Transaktionsgrenzen | Modellargumente als Berechtigung behandeln |
| SkillPilot-Domain | Curriculum, Lernpfad, Mastery, Recall, Exam und Persistenz | vom Chatverlauf als Datenbank abhängen |

Die deutsche Spring-Implementierung schützt die OpenAI-Pfade zusätzlich mit
einem standardmäßig aktiven, konfigurierbaren Fixed-Window-Limit pro vom Servlet-
Container normalisierter Clientadresse und getrennten Budgets für MCP, OAuth,
Cockpit-Starts und Metadata. Der Produktionsproxy muss eingehende Forwarding-
Header verwerfen beziehungsweise selbst ersetzen und der einzige Netzwerkpfad
zum Backend sein. Die Adresse landet weder in Logs noch Metrik-Tags. Das ist eine
wirksame lokale
Sicherheitsgrenze für eine Instanz. Sobald mehrere Backendinstanzen hinter einem
Proxy laufen, muss der vertrauenswürdige Reverse Proxy beziehungsweise das API-
Gateway dasselbe Limit zusätzlich instanzübergreifend durchsetzen; das lokale
Limit bleibt als zweite Barriere aktiv.

## 7. Zustand, Identität und sichtbare Daten

### 7.1 Autoritativer Zustand

Autoritativ im SkillPilot-Backend liegen mindestens:

- Provider-Verbindung und Lernenden-Zuordnung;
- die getrennte, absolut höchstens 24 Stunden gültige aktive Lernsession;
- Curriculum, Scope und Personalisierung;
- aktives Lernziel und Frontier;
- Mastery und die heute bereits persistierten fachlichen Belege;
- Aufgaben, Bewertungen und Verified-Recall-Kartenstatus;
- in der späteren Widget-Härtung zusätzlich Einreichungen, Prüfungsversuche
  sowie Idempotenz- und Command-Receipts.

Widgetzustand wie aufgeklappte Bereiche oder Texteingabe ist flüchtige UI-
Darstellung. Er darf den Backendzustand nicht ersetzen. Providerseitiger
Gesprächskontext ist eine Komfortoptimierung, keine fachliche Quelle.

### 7.2 Drei Sichtbarkeitsklassen

| Klasse | Beispiele | Sichtbarkeit |
| --- | --- | --- |
| Nutzer- und modellgeeignete Fachinformation | Label, Aufgabenstellung, sicherer Lernstand, Feedback | Chat und/oder Widget; modellseitig nur soweit nötig |
| Modellgeeignete fachliche Referenz | öffentliche Curriculum-/Lernziel-ID aus einer aktuellen erlaubten Option | nur bei Bedarf in `structuredContent`; nicht unnötig in der sichtbaren Antwort wiederholen |
| Widget-interne Referenz (später) | kurzlebige Auswahl- oder Draft-Referenz | nur App-Widget; nicht in `content` oder `structuredContent` |
| Interne Identität und Geheimnis | permanente SkillPilot-ID, OAuth-Token, Datenbankschlüssel | niemals Modell, Chat oder Widgetinhalt |

Öffentliche, fachlich sinnvolle Lernziel-IDs dürfen als Produktreferenz sichtbar
sein, wenn dies didaktisch nützt. Sie sind von Identitäts-, Autorisierungs- und
Transportreferenzen strikt zu unterscheiden.

### 7.3 Keine sichtbaren technischen Keys

In der ersten UI-losen Version zeigt der Chat verständliche Labels. Zugehörige
fachliche IDs bleiben im `structuredContent` der frisch geladenen erlaubten
Optionen und werden nicht als Bedienkonzept auf die lernende Person abgewälzt.
Die IDs sind weder Geheimnis noch Berechtigungsnachweis; jede Mutation wird gegen
OAuth-Subjekt, aktive 24h-Lernsession und aktuellen Backendzustand neu validiert.
Ein späteres Widget kann Buttons und Karten mit kurzlebigen opaken Referenzen
ergänzen.

Für die spätere Receipt-Härtung modellseitiger Folgen gilt:

1. Modell ruft einen lesenden Kontext- oder Pending-Submission-Use-Case auf.
2. Backend löst Identität aus dem OAuth-Zugriff und lädt frischen Zustand.
3. Für eine unmittelbar folgende Mutation kann das Backend eine kurzlebige,
   zweckgebundene Receipt-Referenz ausgeben.
4. Die Mutation revalidiert Subjekt, Scope, Zustand, Receipt und Revision.

Damit wird höchstens die nachgewiesene Same-Turn-Weitergabe genutzt; langfristige
Chat-Retention bleibt unnötig.

## 8. Produktionsauthentifizierung

Der lokale Prototyp verwendet absichtlich `noauth`; das ist **kein**
Produktionsmodell.

Produktiv wird die App per OAuth 2.1 gemäß MCP-Autorisierung angebunden:

1. Der MCP-Resource-Server veröffentlicht Protected-Resource-Metadaten.
2. Der SkillPilot-Authorization-Server veröffentlicht seine OAuth-/OIDC-
   Discovery-Daten.
3. Der Provider führt Authorization Code mit PKCE aus.
4. ChatGPT verwaltet Access- und Refresh-Token und überträgt den Access Token
   bei jedem MCP-Aufruf automatisch als Bearer-Header; Benutzer kopieren oder
   übermitteln keinen Token.
5. Der MCP-Server validiert bei jedem Request mindestens Issuer, Audience,
   Ablaufzeit und benötigte Scopes.
6. Das externe opake Provider-Subjekt wird serverseitig auf das SkillPilot-Konto
   abgebildet.
7. Jedes lernendenbezogene Tool verlangt zusätzlich die separate aktive
   24h-Lernsession. Token-Refresh, Reload und Toolaufruf verlängern deren
   absolute Frist nicht.

Die interne permanente SkillPilot-ID wird nicht zurückgegeben. Kurzlebige
Widgetreferenzen sind zusätzlich an Provider, OAuth-Subjekt, Appvariante, Zweck
und Ablaufzeit gebunden und ersetzen niemals Authentifizierung.

Die erstmalige Zuordnung von Subject und Lernendem erfolgt über einen
kurzlebigen, einmaligen `HttpOnly`-Browser-Grant aus dem First-Party-Cockpit.
Der Parameter `state`, die Startnachricht und Toolargumente sind keine
Identitätskanäle. Eine bestehende OAuth-Verbindung muss nach Ablauf der
Lernsession nicht neu autorisiert werden; ein erneutes **Lernen starten**
erzeugt serverseitig eine neue 24h-Frist.

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

In der aktuellen data-only App interpretiert das Modell die natürliche Sprache
ausschließlich gegen die frisch vom Backend gelieferten Katalogoptionen und
übergibt deren fachliche IDs strukturiert zurück. Die Mutation revalidiert sie
gegen Katalog und aktuellen Lernendenzustand. Ein späteres Widget kann diesen
Schritt mit einem deterministischen `CurriculumOfferingResolver` und
kurzlebigen, kataloggebundenen Auswahlreferenzen weiter härten.

### 9.3 Commands, Concurrency und spätere Receipts

Die aktuelle UI-lose deutsche App revalidiert jede Mutation unter den
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

Toolnamen, Beschreibungen, Ein-/Ausgabeschemata und Widgetressourcen sind je App
sprachspezifisch. Intern bilden beide Verträge auf dieselben Use-Cases ab.

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
| Einstieg und Wiederaufnahme | OAuth-Verbindung plus aktive serverseitige 24h-Lernsession; aktueller Zustand ohne sichtbaren Token |
| Natürliche Einrichtung | Fach/Stufe/Region aus Text; nur reale offene Entscheidung als verständliche Auswahl, später optional im Widget |
| Lernpfad und Frontier | frische Backendprojektion; keine Chat-Memory-Autorität |
| Zielwahl und Ressourcen | gültige Kandidaten; backendgenerierte Links |
| Erklärung und Aufgabe | alters- und fachgerechte Darstellung; klare Aufgabenfassung |
| Lösung einreichen | zunächst sichtbare Chatabgabe; später direkte Widgetaktion mit persistentem Submission-Receipt |
| Bewertung | fachlich gleichwertige Wege anerkennen; keine reine Wortlautprüfung |
| Mastery | nur nach erlaubter Evidenz; sichtbar und korrigierbar |
| Verified Recall | serverseitiger Kartenstatus; später zusätzlich Evidence-/Result-Receipt |
| Prüfung | zunächst sichtbare Chatabgabe und regelgesteuerte Freigabe; später Attempt und explizite Widgetabgabe |
| Profil-/Curriculumwechsel | Wirkung erklären, validieren und soweit sinnvoll Undo anbieten |
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
- eine bei jedem lernendenbezogenen Tool geprüfte, absolut auf 24 Stunden
  begrenzte Lernsession, die Token-Refresh nicht verlängert;
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
[`ai/openai app/`](<../../../ai/openai app/>). Er verwendet den offiziellen
MCP-Server- und MCP-Apps-Ansatz und ruft keine Modell-API auf.

### 13.1 Start

```bash
cd "ai/openai app"
npm install
npm start
```

Standardport ist `8790`; er kann mit `PORT` geändert werden.

### 13.2 Lokale Endpunkte

| Zweck | Deutsch | Englisch |
| --- | --- | --- |
| MCP | `http://localhost:8790/mcp/de` | `http://localhost:8790/mcp/en` |
| lokale Hostsimulation | `http://localhost:8790/preview/de` | `http://localhost:8790/preview/en` |
| Widgetressource | `ui://skillpilot-coach-de/coach.html` | `ui://skillpilot-coach-en/coach.html` |

Zusätzlich liefert `http://localhost:8790/health` die konfigurierten Varianten.
Die Preview simuliert nur den Host-/Widget-Dialog; sie ist weder ChatGPT noch eine
Modellbewertung.

### 13.3 Bereits bewiesener vertikaler Slice

- zwei getrennte MCP-Pfade und sprachspezifische Toolnamen;
- zwei getrennt gebaute, selbstenthaltene Widgetartefakte;
- Kursauswahl über sichtbare Labels bei widget-internen opaken Referenzen;
- Einreichung einer Antwort aus dem Widget;
- modellseitiges Laden der ausstehenden Antwort und Speichern einer Bewertung;
- frisches Laden des persistierten Coachzustands ohne sichtbare Sitzungskennung;
- opake Session-, Choice- und Submission-Referenzen fehlen in öffentlichem
  `content` und `structuredContent`;
- persistenter Demozustand unter
  `tmp/openai-mcp-app-prototype/coach-state.json`;
- Protokoll-, Store- und Widget-Build-Tests für DE und EN.

Die sechs aktuellen Tools jeder Variante bilden ausschließlich diesen
vertikalen Beweis ab. Ihre geringe Zahl ist **keine Behauptung vollständiger
Workflow-Parität**.

### 13.4 Bewusst noch nicht produktiv

Der Prototyp:

- verwendet `noauth`;
- hält nur einen Demozustand je Sprache;
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

Der deutsche data-only Vertrag ist direkt im bestehenden Backend implementiert:

```text
https://skillpilot.com/api/openai/de/mcp
  -> eigener WebMvcStatelessServerTransport
  -> eigener McpStatelessSyncServer
  -> genau elf OpenAI-DE-Werkzeuge
  -> OAuth-Subjektauflösung, 24h-Lernsitzungsprüfung und Write-Kill-Switch
  -> CoachToolFacade / CoachStateProjection
  -> bestehende SkillPilot-Domain und PostgreSQL
```

Die allgemeine Spring-AI-MCP-Autokonfiguration bleibt deaktiviert. Eine eigene
Fabrik erzeugt stattdessen je Provider einen Transport, Server, Router,
Instructions und eine ausdrückliche Tool-Allowlist. Damit können
`/api/openai/de/mcp` und `/api/claude/mcp` im selben Prozess laufen, ohne Tools
oder Verträge zu vermischen. Der OpenAI-Server verwendet native MCP-Ergebnisse
mit `structuredContent`, `outputSchema`, Annotationen und Security-Metadaten.

Der deutsche Vertrag umfasst:

- argumentlose Kontext-Rehydration und gezielte Navigation;
- Curriculum, Personalisierung, Scope und aktives Ziel;
- kontrollierte Mastery-Aktualisierung;
- vollständigen Verified-Recall-Ablauf;
- freigegebene Prüfungsgrundlage nach sichtbarer vollständiger Abgabe.

Normale Kontexte werden allowlist-basiert über die gemeinsame sichere Projektion
erzeugt. Sie enthalten keine permanente Lernenden-ID, OAuth-Tokens oder
vorzeitige Prüfungslösung. Ein eigener OpenAI-DE-OAuth-Issuer unterstützt einen
vorab registrierten öffentlichen ChatGPT-Client, Authorization Code mit PKCE
`S256`, exakte Resource-Bindung, opake rotierende Tokens, Widerruf und eine
serverseitige Verbindung zum Lernenden. Die davon getrennte aktive Lernsession
ist absolut auf 24 Stunden begrenzt und wird von jedem lernendenbezogenen Tool
geprüft. Alle Schreibwerkzeuge besitzen zusätzlich einen unabhängigen,
standardmäßig deaktivierten Runtime-Kill-Switch.

Das Cockpit besitzt eine getrennte `openai-mcp`-Canary-Variante. Ohne explizites
Build-Flag bleibt die bestehende Visible-Session-Variante aktiv. Englisch wird
im neuen Pfad kontrolliert abgewiesen, bis ein eigener Vertrag fertig und
abgenommen ist.

Noch nicht lokal abschließbar sind die echten Werte aus der ChatGPT-App-
Verwaltung, das Produktionsdeployment, der reale OAuth-Callback, Langdialog- und
Kompaktierungstests sowie der Tarif-/Regionsnachweis. Diese Punkte sind
Release-Gates und keine stillschweigend als erledigt geltenden Codeaufgaben. Das
Betriebsverfahren steht in
[openai-mcp-coach-de.md](../../deploy/openai-mcp-coach-de.md).

## 15. Veröffentlichung als OpenAI-Plugin

OpenAI veröffentlicht Apps inzwischen innerhalb von Plugins. Für SkillPilot ist
der robuste Zielzuschnitt:

- ein unabhängig einreichbares App-only-Plugin für Deutsch;
- ein unabhängig einreichbares App-only-Plugin für Englisch;
- jeweils ein öffentlicher HTTPS-MCP-Endpunkt, passgenaue Metadaten,
  Datenschutz-/Supportangaben, Testfälle und optional Screenshots;
- getrennte Veröffentlichung, Telemetrie, Canary und Rollback.

Die Einreichung scannt unter anderem Toolnamen, Beschreibungen, Schemas,
Security-Schemes, Annotationen, `_meta`, UI-Ressourcen und CSP. Diese Metadaten
sind daher versionierte öffentliche Verträge. Breaking Changes werden nicht als
normaler Serverfix behandelt; neue Vertragsstände werden additiv entwickelt,
gescannt, geprüft und erst danach veröffentlicht.

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
| Oberfläche | ChatGPT Web; mobile Apps; gegebenenfalls Codex nur als separater Anwendungsfall |
| Region | alle vorgesehenen Länder, insbesondere Deutschland/EU |
| Konto | privates Konto; relevante Workspace-Typen und Adminrichtlinien |
| Verbindung | Erstinstallation, OAuth, Widerruf, erneute Verbindung |
| Sprache | DE-Plugin nur DE-Vertrag; EN-Plugin nur EN-Vertrag |

Scheitert der kostenlose Zugang oder ein erforderlicher fester Tarif, ist die
harte Geschäftsanforderung für diesen Providerpfad nicht erfüllt – auch wenn die
Technik im Entwicklermodus funktioniert.

## 16. Lieferplan

### Phase 0 – Prototyp und Fallbacks

- lokaler DE-/EN-MCP-App-Prototyp;
- Visible-Session- und Legacy-Quellen getrennt und rollbackfähig halten;
- keine Vermischung der neuen Appverträge mit Custom-GPT-OpenAPI-Schemas.

**Stand:** abgeschlossen; Fallbackquellen bleiben getrennt erhalten.

### Phase 1 – Deutscher produktionsnaher Backendpfad

- isolierter MCP-Transport im Spring-Boot-Prozess;
- vollständiger data-only Toolvertrag gegen bestehende Domain-Use-Cases;
- sichere, kompakte DTO-Projektionen;
- OAuth-Subjekt-zu-Lernenden-Abbildung ohne Offenlegung der internen ID;
- separate absolute 24h-Lernsession ohne sichtbaren Token oder gleitende
  Verlängerung;
- standardmäßig deaktivierter Schreib-Kill-Switch und Cockpit-Canary.

**Stand:** lokal umgesetzt und automatisiert getestet. Externer Exit ist ein
echter deutscher OAuth-/MCP-Lauf in ChatGPT.

### Phase 2 – Deutsche reale Nutzerreisen

- natürlicher Einstieg „Mathe – Oberstufe – Hessen“;
- fachliche GK-/LK-Auswahl ohne sichtbare technische Schlüssel;
- aktives Ziel, Frontier, Aufgabe, faire Bewertung und Mastery;
- Recall und Prüfung;
- Retry-, Reload-, Langdialog-, Parallelchat- und Cross-Learner-Negativtests;
- read-only Canary vor Freigabe der Schreibwerkzeuge.

**Exit:** komplette deutsche E2E-Suite im realen Providerhost.

### Phase 3 – Widget und zusätzliche Härtung

- optionale direkte Auswahl- und Einreichungsaktionen im Widget;
- serverseitige Submission-/Receipt-Härtung für garantiert auszuführende
  Schritte;
- sichere Dateien/Bilder, Export, Löschung, Quoten und Degradation.

**Exit:** UI-Funktionen verbessern die Bedienung, ohne den stabilen data-only
Vertrag oder die Backendautorität zu schwächen.

### Phase 4 – OpenAI-Veröffentlichung, Englisch und Tarifnachweis

- deutsche Veröffentlichung und reale Tarifmatrix;
- danach eigener englischer Vertrag, App-Eintrag und vollständige Acceptance;
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

| Gate | Muss vor Pilot/Standard erfüllt sein |
| --- | --- |
| Kostenmodell | kein SkillPilot-Modell-API-Aufruf; Zieltarife real bestätigt |
| Appisolation | getrennte Registrierung, Endpunkte, Toolsets, Widgets, Tests und Kill-Switches |
| Auth | OAuth 2.1/PKCE, automatischer Bearer-Transport, Tokenprüfung, Scopes, Widerruf, First-Party-Binding, absolute 24h-Lernsession und Cross-Learner-Negativtests |
| Zustand | Backend autoritativ; Reload und Kontextkompaktierung ändern keine fachlichen Fakten |
| UX | keine sichtbaren Session-/Choice-Keys; natürliche Einrichtung mit nur fachlich nötigen Rückfragen |
| Invocation | kuratierte positive und negative Prompts pro Sprache; Widgetaktionen zuverlässig |
| Idempotenz | keine Doppelmutation bei Retry, Hostwiederholung oder Prozessabbruch |
| Fachqualität | alternative korrekte Lösungen werden anerkannt; keine Lösung vor Examabgabe |
| Parität | alle Must-Nutzerreisen separat für DE und EN grün |
| Privacy/Safety | minimale Daten, korrekte Disclosure, Retention, Löschung, CSP und Altersfreigabe |
| Betrieb | Rate Limits, Observability ohne Geheimnisse, Degradation und Rollback getestet |
| Distribution | Review bestanden und Nutzbarkeit in Zielregion/-oberfläche/-tarif nachgewiesen |

## 18. Risiken und Gegenmaßnahmen

| Risiko | Konsequenz | Gegenmaßnahme |
| --- | --- | --- |
| Provider ruft bei freiem Chat das Tool nicht auf | Nutzerreise stockt | kritische Schritte im Widget; Toolmetadaten und Prompt-Acceptance; Cockpit-Degradation |
| App/Plugin im Zieltarif nicht verfügbar | Zahlungsanforderung verfehlt | Tarifmatrix als Go-/No-Go; zweiter Provider; nicht-generatives Cockpit |
| Zielgruppe umfasst Kinder unter 13 | aktuelle OpenAI-App-Richtlinie erlaubt kein ausdrückliches Targeting | Unter-13 vom OpenAI-Kanal ausschließen; alternative zulässige Oberfläche/Provider prüfen; keine Altersableitung aus Klassenstufe |
| Review abgelehnt oder verzögert | keine öffentliche Distribution | Developer-Mode-Pilot, Review-Checkliste, keine falsche Launchzusage |
| veröffentlichter Vertrag wird inkompatibel geändert | bestehende Installationen brechen | additive Versionierung und getrennte App-Releases |
| Widget-Metadaten werden als Auth verwendet | Cross-User-/Replay-Risiko | OAuth-Subjekt plus First-Party-Lernendenbindung und separate aktive 24h-Lernsession; Revalidierung bei jedem Tool |
| gemeinsamer Code koppelt DE und EN unbemerkt | gleichzeitige Regression | getrennte Artefakte, Vertragstests, Canary und Kill-Switches |
| Modell bewertet nur nach Musterwortlaut | korrekte Lösungen werden abgewiesen | allgemeine Äquivalenzregel, kuratierte Alternativlösungen, Human-Rater-Gate |
| App wird mit vollwertiger Backendintegration verwechselt | verfrühte Freigabe | Prototyplimits sichtbar halten; Security- und Workflow-Gates erzwingen |

## 19. Bewusst verworfene Primärvarianten

### SkillPilot-eigener Chat mit SkillPilot-bezahlter Modell-API

Technisch böte dies maximale Turnkontrolle, verletzt aber die harte Anforderung,
dass die Person den Provider direkt im kostenlosen oder festen Consumerplan
nutzt. Es bleibt höchstens eine spätere, separat finanzierte Produktoption.

### Ein universeller DE-/EN-MCP-Vertrag

Weniger Dateien und nur eine Registrierung sind kein ausreichender Vorteil, wenn
Toolauswahl, Lokalisierung, Testfreigabe und Rollback dadurch gekoppelt werden.
Gemeinsam bleibt der Fachkern, nicht die externe Appoberfläche.

### Weitere Härtung sichtbarer Custom-GPT-Relaywerte

Sie kann kurzfristig Funktion sichern, löst aber den Komfortverlust und die
Abhängigkeit vom fehlerhaften Turn-Kontext nicht. Visible Session bleibt nur ein
Rückfallpfad.

### BYOK oder SkillPilot-Relay eines Nutzer-API-Keys

Dies ist nutzungsabhängige API-Abrechnung, kein kostenloser oder fester
Consumerplan, und erhöht Secret-, Support- und Datenschutzrisiken. Es erfüllt die
Kernanforderung nicht.

## 20. Unmittelbar nächste Schritte

1. Die exakte Client-ID und Callback-URL aus der deutschen ChatGPT-App-Verwaltung
   in die OpenAI-DE-Konfiguration übernehmen.
2. Spring-Boot-Artefakt und additive Datenbankmigration mit deaktiviertem
   Schreib-Kill-Switch deployen.
3. Metadata, HTTP-Challenge, OAuth/PKCE und die strikte Provider-Toolisolation am
   kanonischen HTTPS-Endpunkt prüfen.
4. Read-only Canary, danach den vollständigen deutschen Schreibpilot nach dem
   Deployment-Runbook durchführen.
5. Erst nach dokumentierter Workflow-, Tarif-, Regions- und Oberflächen-
   Acceptance das Cockpit auf `openai-mcp` umschalten.
6. Danach Widgetverbesserungen entwickeln und erst anschließend den separaten
   englischen Appvertrag ableiten.

## 21. Referenzen

- [Lokaler OpenAI-MCP-App-Prototyp](<../../../ai/openai app/>)
- [Provider-Neutral Learning-Coach Boundary](provider-neutral-coach-boundary.md)
- [Aktueller ChatGPT-Visible-Session-Flow](chatgpt-visible-session-flow.md)
- [Legacy ChatGPT Startcode / Session Flow](chatgpt-startcode-session-flow.md)
- [OpenAI Apps SDK: MCP-Server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [OpenAI Apps SDK: UI und MCP-Apps-Bridge](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
- [OpenAI Apps SDK: Zustandsverwaltung](https://developers.openai.com/apps-sdk/build/state-management)
- [OpenAI Apps SDK: Authentifizierung](https://developers.openai.com/apps-sdk/build/auth)
- [OpenAI: App für Plugin-Einreichung vorbereiten](https://developers.openai.com/apps-sdk/deploy/submission)
- [OpenAI: Plugins einreichen](https://learn.chatgpt.com/docs/submit-plugins)
- [OpenAI Help: Plugins in ChatGPT und Codex](https://help.openai.com/de-de/articles/20001256-plugins-in-chatgpt-and-codex)
- [Öffentlicher Reproduktionsthread](https://community.openai.com/t/custom-gpt-does-not-reuse-an-action-response-on-the-next-user-turn-reproducible-after-gpt-5-6-rollout/1386723)
