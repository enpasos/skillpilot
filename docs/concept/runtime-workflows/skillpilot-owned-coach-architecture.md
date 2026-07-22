# SkillPilot-Lerncoach: providergehostete MCP-App-Architektur

**Stand:** 22. Juli 2026

**Status:** Zielarchitektur und Diskussionsgrundlage; ein lokaler vertikaler
ChatGPT-MCP-App-Prototyp ist implementiert, die produktive Backend- und
OAuth-Anbindung noch nicht.

Dieses Dokument ist selbsttragend. Es beschreibt die Entscheidung, ihre harten
Randbedingungen, den umgesetzten Prototyp, die noch fehlenden Produktionsgrenzen
und überprüfbare Freigabekriterien.

## 1. Management Summary

SkillPilot soll den Lerncoach primär als **providergehostete MCP App** anbieten.
Das Modell, der freie Chat und die App-Oberfläche laufen in ChatGPT beziehungsweise
später Claude; Curriculum, Scope, aktives Lernziel, Frontier, Mastery, Recall und
Prüfungszustand bleiben autoritativ im SkillPilot-Backend.

Für ChatGPT werden **zwei eigenständig registrierte Apps** gebaut:

- **SkillPilot Coach Deutsch** mit eigenem MCP-Endpunkt, deutschem Toolvertrag,
  deutschem Widget und eigener Acceptance Suite;
- **SkillPilot Coach English** mit eigenem MCP-Endpunkt, englischem Toolvertrag,
  englischem Widget und eigener Acceptance Suite.

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
| Keine dauerhafte SkillPilot-ID beim Provider. | OAuth-Subjekt und kurzlebige opake Referenzen werden serverseitig aufgelöst; die permanente interne Lernenden-ID wird weder Toolargument noch Toolergebnis. |
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

Die Visible Session hält deshalb einen maximal 24 Stunden gültigen Token und
benötigte Auswahlwerte sichtbar im Dialog. Sie ist funktional, aber für Lernende
unnötig technisch und vom Verhalten des Custom-GPT-Hosts abhängig.

Eine MCP App verbessert diese Lage wesentlich:

- fachliche Auswahlen und Einreichungen können direkt im Widget erfolgen;
- Widget-interne opake Referenzen können in app-exklusiven Metadaten bleiben;
- der autoritative Zustand lebt im SkillPilot-Backend;
- modellseitige Tools können nach einem neuen Turn einen frischen sicheren
  Snapshot laden.

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
             |  App DE          App EN         |
             |  Widget DE       Widget EN      |
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
             | Commands + Receipts + Locks     |
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
| SafeCoachRuntime | freigegebene Queries und Commands, frische Revalidierung, Idempotenz | Modellargumente als Berechtigung behandeln |
| SkillPilot-Domain | Curriculum, Lernpfad, Mastery, Recall, Exam und Persistenz | vom Chatverlauf als Datenbank abhängen |

## 7. Zustand, Identität und sichtbare Daten

### 7.1 Autoritativer Zustand

Autoritativ im SkillPilot-Backend liegen mindestens:

- Provider-Verbindung und Lernenden-Zuordnung;
- Curriculum, Scope und Personalisierung;
- aktives Lernziel und Frontier;
- Mastery und fachliche Evidenz;
- Aufgaben-, Einreichungs- und Bewertungsbelege;
- Verified-Recall-Batches;
- Prüfungsversuch, Abgabe und Auswertungsfreigabe;
- Idempotenz- und Command-Receipts.

Widgetzustand wie aufgeklappte Bereiche oder Texteingabe ist flüchtige UI-
Darstellung. Er darf den Backendzustand nicht ersetzen. Providerseitiger
Gesprächskontext ist eine Komfortoptimierung, keine fachliche Quelle.

### 7.2 Drei Sichtbarkeitsklassen

| Klasse | Beispiele | Sichtbarkeit |
| --- | --- | --- |
| Nutzer- und modellgeeignete Fachinformation | Label, Aufgabenstellung, sicherer Lernstand, Feedback | Chat und/oder Widget; modellseitig nur soweit nötig |
| Widget-interne Referenz | kurzlebige Session-, Auswahl- oder Draft-Referenz | nur App-Widget; nicht in `content` oder `structuredContent` |
| Interne Identität und Geheimnis | permanente SkillPilot-ID, OAuth-Token, Datenbankschlüssel | niemals Modell, Chat oder Widgetinhalt |

Öffentliche, fachlich sinnvolle Lernziel-IDs dürfen als Produktreferenz sichtbar
sein, wenn dies didaktisch nützt. Sie sind von Identitäts-, Autorisierungs- und
Transportreferenzen strikt zu unterscheiden.

### 7.3 Keine sichtbaren technischen Keys

Buttons und Karten übertragen kurzlebige opake Referenzen direkt über den
MCP-App-Bridge-Aufruf. Lernende sehen „Grundkurs“ oder „Leistungskurs“, nicht
`choice_...`. Ein technischer Wert darf nie die einzige Information sein, die
über den Chatverlauf hinweg die Berechtigung oder den fachlichen Zustand beweist.

Für modellseitige Folgen gilt:

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
4. Der MCP-Server validiert bei jedem Request mindestens Issuer, Audience,
   Ablaufzeit und benötigte Scopes.
5. Das externe opake Provider-Subjekt wird serverseitig auf das SkillPilot-Konto
   abgebildet.

Die interne permanente SkillPilot-ID wird nicht zurückgegeben. Kurzlebige
Widgetreferenzen sind zusätzlich an Provider, OAuth-Subjekt, Appvariante, Zweck
und Ablaufzeit gebunden und ersetzen niemals Authentifizierung.

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

Das Modell liefert nutzernahe Facetten, keine internen IDs. Ein
`CurriculumOfferingResolver` prüft sie gegen den aktuellen Katalog und erzeugt
kurzlebige, kataloggebundene Auswahlreferenzen. Die Mutation revalidiert diese
Referenz gegen Kataloggeneration und aktuellen Lernendenzustand.

### 9.3 Commands, Receipts und Concurrency

Jede fachliche Mutation erhält eine serverseitig erzeugte Command-ID und einen
kanonischen Request-Hash. Command-Receipt und Domainmutation werden in derselben
kurzen Transaktion gespeichert. Ein Retry liefert das gespeicherte Ergebnis,
statt dieselbe Mutation erneut auszuführen.

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
- zweckgebundene kurzlebige Receipts, wenn sie für einen Same-Turn-Schritt nötig
  sind.

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
| Einstieg und Wiederaufnahme | OAuth-Verbindung; aktueller Zustand ohne sichtbaren Token |
| Natürliche Einrichtung | Fach/Stufe/Region aus Text; nur reale offene Entscheidung als Widgetauswahl |
| Lernpfad und Frontier | frische Backendprojektion; keine Chat-Memory-Autorität |
| Zielwahl und Ressourcen | gültige Kandidaten; backendgenerierte Links |
| Erklärung und Aufgabe | alters- und fachgerechte Darstellung; klare Aufgabenfassung |
| Lösung einreichen | direkte Widgetaktion, persistentes Submission-Receipt |
| Bewertung | fachlich gleichwertige Wege anerkennen; keine reine Wortlautprüfung |
| Mastery | nur nach erlaubter Evidenz; sichtbar und korrigierbar |
| Verified Recall | serverseitiger Batch, Antwortfreigabe und Result-Receipt |
| Prüfung | Attempt, explizite Abgabe, erst danach Auswertung; keine lösungslenkende Nachfrage |
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

## 14. Veröffentlichung als OpenAI-Plugin

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

## 15. Lieferplan

### Phase 0 – Prototyp und Fallbacks

- lokaler DE-/EN-MCP-App-Prototyp;
- Visible-Session- und Legacy-Quellen getrennt und rollbackfähig halten;
- keine Vermischung der neuen Appverträge mit Custom-GPT-OpenAPI-Schemas.

**Stand:** lokaler Prototyp vorhanden; Produkt- und Backendgrenzen offen.

### Phase 1 – Produktiver gemeinsamer Kern

- reine `CoachStateSnapshot`-Query;
- Offering-/Scope-Resolver und kataloggebundene Referenzen;
- atomare Commands, Receipts und gemeinsame Learner-Concurrency-Grenze;
- sichere, versionierte DTO-Projektionen;
- OAuth-Subjekt-zu-Lernenden-Abbildung ohne Offenlegung der internen ID.

**Exit:** zwei authentifizierte Apps laden und ändern denselben autoritativen
SkillPilot-Zustand ohne sichtbare technische Schlüssel.

### Phase 2 – Vertikale reale Nutzerreise

- natürlicher Einstieg „Mathe – Oberstufe – Hessen“;
- genau eine echte GK-/LK-Auswahl im Widget;
- aktives Ziel und Frontier;
- Aufgabe, Einreichungs-Receipt, faire Bewertung und kontrolliertes Mastery-
  Update;
- Retry-, Reload-, Parallelchat- und Cross-Learner-Negativtests.

**Exit:** komplette DE- und EN-E2E-Suites in realen Providerhosts.

### Phase 3 – Workflow-Parität

- Ressourcen und sichere Dateien/Bilder;
- Profil-, Curriculum- und Zielwechsel;
- Verified Recall;
- vollständiger Exam-Attempt-/Submission-/Evaluation-Flow;
- Export, Löschung, Quoten und Degradation.

**Exit:** alle Must-Nutzerreisen pro App fachlich und technisch abgenommen.

### Phase 4 – OpenAI-Veröffentlichung und Tarifnachweis

- zwei App-/Plugin-Einreichungen;
- Review und veröffentlichte Versionen;
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

## 16. Abnahme- und Go-/No-Go-Gates

| Gate | Muss vor Pilot/Standard erfüllt sein |
| --- | --- |
| Kostenmodell | kein SkillPilot-Modell-API-Aufruf; Zieltarife real bestätigt |
| Appisolation | getrennte Registrierung, Endpunkte, Toolsets, Widgets, Tests und Kill-Switches |
| Auth | OAuth 2.1/PKCE, Tokenprüfung, Scopes, Widerruf, Cross-Learner-Negativtests |
| Zustand | Backend autoritativ; Reload und Kontextkompaktierung ändern keine fachlichen Fakten |
| UX | keine sichtbaren Session-/Choice-Keys; natürliche Einrichtung mit nur fachlich nötigen Rückfragen |
| Invocation | kuratierte positive und negative Prompts pro Sprache; Widgetaktionen zuverlässig |
| Idempotenz | keine Doppelmutation bei Retry, Hostwiederholung oder Prozessabbruch |
| Fachqualität | alternative korrekte Lösungen werden anerkannt; keine Lösung vor Examabgabe |
| Parität | alle Must-Nutzerreisen separat für DE und EN grün |
| Privacy/Safety | minimale Daten, korrekte Disclosure, Retention, Löschung, CSP und Altersfreigabe |
| Betrieb | Rate Limits, Observability ohne Geheimnisse, Degradation und Rollback getestet |
| Distribution | Review bestanden und Nutzbarkeit in Zielregion/-oberfläche/-tarif nachgewiesen |

## 17. Risiken und Gegenmaßnahmen

| Risiko | Konsequenz | Gegenmaßnahme |
| --- | --- | --- |
| Provider ruft bei freiem Chat das Tool nicht auf | Nutzerreise stockt | kritische Schritte im Widget; Toolmetadaten und Prompt-Acceptance; Cockpit-Degradation |
| App/Plugin im Zieltarif nicht verfügbar | Zahlungsanforderung verfehlt | Tarifmatrix als Go-/No-Go; zweiter Provider; nicht-generatives Cockpit |
| Zielgruppe umfasst Kinder unter 13 | aktuelle OpenAI-App-Richtlinie erlaubt kein ausdrückliches Targeting | Unter-13 vom OpenAI-Kanal ausschließen; alternative zulässige Oberfläche/Provider prüfen; keine Altersableitung aus Klassenstufe |
| Review abgelehnt oder verzögert | keine öffentliche Distribution | Developer-Mode-Pilot, Review-Checkliste, keine falsche Launchzusage |
| veröffentlichter Vertrag wird inkompatibel geändert | bestehende Installationen brechen | additive Versionierung und getrennte App-Releases |
| Widget-Metadaten werden als Auth verwendet | Cross-User-/Replay-Risiko | OAuth-Subjekt plus serverseitige Bindung und TTL; Revalidierung bei jeder Mutation |
| gemeinsamer Code koppelt DE und EN unbemerkt | gleichzeitige Regression | getrennte Artefakte, Vertragstests, Canary und Kill-Switches |
| Modell bewertet nur nach Musterwortlaut | korrekte Lösungen werden abgewiesen | allgemeine Äquivalenzregel, kuratierte Alternativlösungen, Human-Rater-Gate |
| App wird mit vollwertiger Backendintegration verwechselt | verfrühte Freigabe | Prototyplimits sichtbar halten; Security- und Workflow-Gates erzwingen |

## 18. Bewusst verworfene Primärvarianten

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

## 19. Unmittelbar nächste Schritte

1. Den lokalen Prototyp gegen die aktuelle ChatGPT-Developer-Mode-Umgebung über
   einen öffentlichen HTTPS-Testendpunkt prüfen; DE und EN getrennt verbinden.
2. Die aktuelle `noauth`-Demo durch OAuth und eine echte
   Provider-Subjekt-Zuordnung ersetzen.
3. Den Storeadapter an die bestehenden SkillPilot-Domain-Use-Cases anbinden,
   zunächst read-only, dann mit einem atomaren Scope-Command.
4. Den vollständigen vertikalen Ablauf Setup → Kurswahl → Ziel → Aufgabe →
   Einreichung → Bewertung → Mastery mit Receipts implementieren.
5. Die Tarif-, Region-, Web-/Mobil- und Reviewfähigkeit früh prüfen, bevor die
   restlichen Workflows auf diesen Distributionspfad gesetzt werden.
6. Erst nach erfolgreichem ChatGPT-Pilot denselben Fachkern mit einem
   Claude-spezifischen App-/MCP-Vertrag verbinden.

## 20. Referenzen

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
