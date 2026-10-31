# Assessment-gated Completion: Implementierung und Prüfung

Stand: 31. Oktober 2026. Der historische Dateiname bleibt bestehen. Dieses
Dokument beschreibt jetzt die **allgemeine lokale Bedarfsberechnung**, die
Cockpit-Bedienung und die Plan-IST-Integration. Grundlage sind der
[aktuelle Umsetzungsplan](assessment-gated-completion-implementation-plan.md)
und das [fachliche Konzept](../concept/skill-graph/assessment-gated-completion.md).
Die abschließenden Gesamtprüfungen laufen; dieses Dokument behauptet weder
entfernten CI-Erfolg noch Deployment oder beobachtete Coach-Host-Abnahme.

## Umfang und Ergebnisprinzip

Die Funktion benötigt keine manuellen Erlassprofile. Im vollständigen,
autoritativ bestimmten Umfang gelten drei Regeln:

1. Jedes gemeisterte Lernziel beendet seinen eigenen Vorbereitungsbedarf.
2. Jedes nicht mehr benötigte Nicht-Abschlussprüfungsziel ist implizit erledigt.
   Auch sein Vorbereitungsbedarf entfällt; dies wird bis zum stabilen Zustand
   fortgesetzt.
3. Jede Abschlussprüfung ist direkt ansteuerbar. Fehlende Vorbereitungsmastery
   sperrt den bewussten Versuch nicht; gültige Aufgaben und eine autorisierte,
   unterstützte Sitzung bleiben erforderlich.

Eine bestandene Prüfung ist damit **keine Voraussetzung** für implizite
Erledigung. Auch gewöhnliche gemeisterte Ziele stoppen Bedarf. Ein gewöhnliches
Endziel ohne Verbraucher ist implizit erledigt, ebenso Orientierung oder Karten.
Enthält der vollständige Kontext keine Abschlussprüfung, ist er bereits ohne
Mastery vollständig implizit erledigt. Offene Abschlussprüfungen bleiben offen.

Pro atomarem Lernziel bleibt nur `mastery ∈ {0,1}` gespeichert. Neue allgemeine
Mastery-Writes akzeptieren nur diese Werte; historische Werte ab `0.9` werden
weiter über den gemeinsamen Kompatibilitätsresolver gelesen. Ein abgeleiteter
Arbeitsentfall verändert weder Einzelmastery noch globale Mastery-Statistik.
Es entstehen keine zusätzlichen Prüfbelege, anerkannten Pass-Zustände oder
Erlassdatensätze. Implizite Karten erzeugen keine Recall-Ergebnisse; implizite
Orientierung erzeugt keine erfundene Coach-Interaktion.

**Die ausführliche Prüfungsbewertung durch die KI bleibt erhalten.** Nach der
vollständigen Abgabe nennt der Coach erreichte/maximale Punkte, die
Bestehensentscheidung und nachvollziehbare Rückmeldung je Kriterium. Richtig
gelöste Anteile, begründete Abzüge, konkrete Verbesserungen und die freigegebene
Lösung bleiben Teil des Gesprächs. Binär ist das gespeicherte Zielergebnis.
Maßgeblich bleibt der [Prüfungsablauf](../concept/skill-graph/node-types.md#scoring-and-mastery).

## Laufzeit und Navigation

Der Default ist eine lesende Auswertung des vollständigen Persönlichen
Lehrplans. Im bestehenden API-Feld heißt er
`profileId=automatic:personal-curriculum`; sein `navigationIntent` ist leer.
Er erzeugt keine gespeicherte Route, pausiert keinen normalen Lernplan und
ändert weder Fokus noch aktives Ziel. „Lernen starten“ bleibt der normale Einstieg.

Weitere Abschnitte stammen aus den autoritativen projizierten Unterbäumen.
Eine bewusste Auswahl bindet `automatic:<Scope-ID>` als Lernweg. Ein- und
Ausklappen des Baums, Suchfilter und ein engerer temporärer Fokus verkleinern
den gewählten Abschlussumfang nicht. Der vollständige Bedarf umfasst auch
versteckte, indirekte und fachübergreifende Voraussetzungen; bei gemeisterten
Zwischenzielen stoppt er. Das Backend berechnet und erklärt den Zustand gemeinsam
für Cockpit und unterstützten Coach.

Die aufklappbare Karte **„Prüfungsabkürzungen“** enthält die konkreten Prüfungen
und Abschnittswahl. Prüfungen sind nach Titel durchsuchbar und werden in Seiten
von acht angezeigt, Abschnitte in Seiten von sechs. Alle Backendangebote
bleiben erreichbar; die alte Grenze von 24 Vorschauoptionen gilt nicht für das
Cockpit. Bereits gemeisterte Prüfungen erscheinen als **„Geschafft“**.
Aufgaben, Lösungen und Bewertungsregeln stehen nicht in dieser Vorschau.

**„Prüfung direkt versuchen“** führt zur bestehenden Anbieterwahl. Erst der
bestätigte Start bindet Umfang und Prüfung atomar an die Sitzung. Ein bloßes
Ansehen startet nichts. Auch am konkreten Prüfungslernziel ist derselbe Einstieg
verfügbar. Die Backendprüfung von Revision, Scope, Aufgabenverfügbarkeit und
Sitzungseigentümer bleibt maßgeblich.

Im Lernzielbaum kennzeichnet ein kompaktes blaues Schildsymbol implizite
Erledigung. Der Tooltip **„Für diesen Abschnitt nicht mehr erforderlich“**
nennt den Bezug und erklärt den unveränderten Lernstand. Er behauptet nicht,
dass eine Prüfung bestanden wurde, wenn gewöhnliche Mastery oder fehlender
Bedarf ausschlaggebend war. Es gibt keinen grünen Mastery-Haken und keinen
breiten Zusatzblock. Das Symbol ist mit Maus, Tastatur und Touch bedienbar.
Bei veralteten oder ungültigen Daten verschwinden positive Kontextmarker.
Nach Verlassen eines gewählten Abschnitts gilt wieder der aktuelle
Defaultkontext; dessen weiterhin gültige Marker dürfen erhalten bleiben.

Manuell geschlossene Baumknoten bleiben geschlossen. Eine neue bewusste
Navigation kann den Zielpfad wieder öffnen. **„Im Lernzielbaum anzeigen“**
öffnet, fokussiert und scrollt rein lesend; es speichert keine Mastery oder Route.

Ein laufender Direktversuch bleibt an seine Sitzung gebunden. Ein Wechsel,
Retry oder Beenden wird bewusst durchgeführt; alte Capabilities dürfen den
neuen Versuch nicht bewerten. Eine ungültige Generations-/Scope-Bindung wird
kenntlich gemacht. Gespeicherte Ergebnisse gehen dadurch nicht verloren.

## Plan-IST und Explizit-Zählung

Die lokale Planintegration zählt im Standard explizite und implizite Erledigung:

```text
I = |G ∩ (M ∪ W_PC)|
```

G ist die feste, fachweise zusammengeführte Planmenge, M explizite Mastery und
W_PC die im **vollständigen Persönlichen Lehrplan** nicht mehr benötigten Ziele.
**G ist eine zeitliche Auswahl, kein eigener Abschlussscope.** Die Backendauswertung
berechnet zuerst den Bedarf des ganzen Persönlichen Lehrplans einschließlich
seiner vollständigen Voraussetzungshülle und schneidet erst dann mit G.

Enthält G nur Vorbereitung A, während eine offene Prüfung Q außerhalb G im
Persönlichen Lehrplan weiterhin A benötigt, bleibt A erforderlich: I=0.
Auch noch nicht eingeplante oder fachübergreifende Verbraucher zählen zum
Bedarf. Der anschließende IST-Beitrag bleibt auf G des jeweiligen Fachs
beschränkt; zwischen Fächern wird kein Saldo verrechnet. Ein enger gewählter
Abschlussabschnitt kann W_section anzeigen, ändert aber Plan-I nicht.
Jedes gemeisterte Zwischenziel stoppt seinen eigenen Bedarf; eine zusätzliche
Prüfungsankerregel gibt es nicht.

Unter **Konfiguration → Lerneinstellungen** steht neben der Planperiodenwahl
**„Nur explizit erreichte Lernziele zählen“**. Die Checkbox ist standardmäßig aus.
Mit ihr gilt `I = |G ∩ M|`. Erst Speichern wirkt; Schließen ohne Speichern
verwirft die Änderung. Die Einstellung verändert weder Planbasis, Termine,
Mastery noch laufende Prüfungen. Ein bereits implizit angerechnetes Ziel zählt
bei späterer eigener Mastery nicht doppelt.

`learningPlanCountOnlyExplicitGoals` gilt pro SkillPilot-ID. Fehlende Werte in
alten Profilen oder signierten Backups bedeuten `false`; gespeicherte Werte
bleiben beim Export/Import erhalten. Die API lässt ausgelassene Felder bei einem
partiellen Update unverändert. Tatsächliche Periodenabschlüsse stammen weiterhin
aus echten Abschlussereignissen; implizite Erledigung erzeugt keine künstlichen
Zeitpunkte oder Lernaktivitäten.

Die vorhandenen **Plandetails** zeigen bei Bedarf einmal pro Fach den
backendlokalisierten Satz, etwa **„Im Plan angerechnet: 3 Ziele, davon
2 implizit erledigt.“** Bei expliziter Zählung, fehlendem impliziten Beitrag oder
fehlender Auswertbarkeit entfällt dieser positive Zusatz. Tachos und kompakte
Statuszeilen erhalten keine zweite eigene Rechnung.

Die Zähloption ist unabhängig von **„Prüfungsabkürzungen anbieten“**. Route
verlassen, Fokus ändern oder direkte Prüfungsangebote ausschalten entfernt
keine weiterhin gültige implizite Plananrechnung. Fachliche oder Planänderungen
werden dagegen neu ausgewertet. Details stehen im
[Lernplanstatuskonzept](../concept/didactic/unified-learning-plan-status.md#34-implizite-erledigung-und-optionale-explizit-zahlung)
und in [Abschnitt 7.1 des Umsetzungsplans](assessment-gated-completion-implementation-plan.md#71-plan-ist-einschließlich-impliziter-erledigung).

## Aktivierung und Betrieb

Die allgemeine Funktion ist standardmäßig aktiv; es ist keine Liste manueller
Profile als Freischaltung erforderlich. **„Prüfungsabkürzungen anbieten“** ist
für neue und alte Lernprofile ohne abweichenden Wert standardmäßig ausgewählt.
Das Speichern eines Optouts entfernt Angebote und neue Direktstarts. Die
lesende Defaultberechnung samt impliziten Markern und Plananrechnung bleibt
bestehen. Ein laufender direkter Prüfungsweg wird mit Hinweis beendet;
Mastery und unabhängige normale Arbeit bleiben erhalten. Wiedereinschalten
stellt keine alte Prüfungssitzung wieder her.

`SKILLPILOT_COMPLETION_ENABLED=false` ist ein administrativer Kill-Switch.
`SKILLPILOT_COMPLETION_WARMUP_CURRICULUM_IDS` kann häufige Basen vorwärmen,
ist im allgemeinen Modus aber keine fachliche Zulassungsliste. Die historische
Variable `SKILLPILOT_COMPLETION_ENABLED_PROFILE_IDS` und das Ein-Profil-/
Ein-Prüfung-Limit gehören zum früheren Profilpfad; sie begründen keine
Beschränkung des allgemeinen Angebots.

Statische Graphen sind an eine unveränderliche Curriculumgeneration gebunden
und werden in begrenzten Caches wiederverwendet. Mastery wird pro konsistentem
Lernerzustand ausgewertet. Nicht verfügbare oder ungültige Daten liefern eine
erklärte Einschränkung; sie gelten nicht als leere, vollständig erledigte Arbeit.
Historische Paket- und Reviewartefakte bleiben unverändert. Ein neuer
Produktionsstand benötigt einen eigenen kontrollierten Rollout.

Der direkte Ablauf ist über Claude angebunden. Eine frische Sitzung bestätigt
zuerst den serverseitigen technischen Completion-Vertrag und lädt danach den
aktuellen Kontext. Das ist keine zweite Lernendenzustimmung und keine weitere
Prüfungsqualifikation. ChatGPT und Gemini sind für diese Funktion zurückgestellt;
ihre spätere Integration braucht denselben vollständigen Sitzungsablauf,
geeignete Adapter und eigene Host-Abnahme. Ein Cockpit-Link ersetzt diesen
Ablauf nicht.

## Reproduzierbare Prüfung

Die folgenden Befehle prüfen den aktuellen lokalen Stand; sie sind keine
Behauptung, dass ein bestimmter Commit bereits entfernt erfolgreich geprüft ist:

```sh
npm --prefix app run test:level-completion
npm --prefix app run test:level-completion-browser
npm --prefix app run test:learner-learning-plans
cd backend
./gradlew test --tests '*AutomaticCompletion*Test' --tests '*LearningPlanCompletion*Test'
```

Die Kernfälle umfassen Mastery an gewöhnlichen Zwischenzielen, direkte statt
transitive Bedarfsfortpflanzung, mehrere offene Prüfungen, Q=0, unbelegte
Endziele, vollständigen Personal-Curriculum-Bedarf auch außerhalb G, Defaults,
Optout, direkte Sitzungswahl,
Stale-Zustände sowie Desktop/Mobil und Tastatur. Historische Profile behalten
eigene Kompatibilitätsprüfungen; deren Erfolg ersetzt diese allgemeinen Fälle
nicht. PostgreSQL- und echte Backend-Browserintegration gehören zusätzlich
zum bestehenden [CI-Workflow](https://github.com/enpasos/skillpilot/blob/main/.github/workflows/assessment-completion.yml).

Die [Kernmessung](../qa-ci/status/assessment-completion-performance-2026-10-30.json),
[Paket-/Startup-Probe](../qa-ci/status/assessment-completion-package-loader-2026-10-30.json),
[Integrationsbelege](../qa-ci/status/assessment-completion-integration-2026-10-30.json)
und [FWU-Roundtrip](../qa-ci/status/assessment-completion-fwu-roundtrip-2026-10-30.json)
vom 30. Oktober sind **historische Belege des manuellen Piloten**. Sie bleiben
unverändert, beweisen aber weder die neue allgemeine Laufzeit noch deren
heutige Payloadgröße, p95-Latenz oder Host-Verständlichkeit.

## Manuell testen: lokale Umgebung und tatsächlicher Claude-Host

Eine eigene neue Test-ID verwenden, statt ein vorhandenes persönliches Profil
zurückzusetzen. Erfolg und nicht ausreichende Abgabe mit getrennten Test-IDs
prüfen. Bereits gespeicherte Mastery zählt unmittelbar; sie braucht keinen
zweiten kontextspezifischen Prüfversuch.

### Lokale Umgebung starten

Voraussetzungen: Corretto **25.0.2.10.1** (Java 25.0.2), Node **20.20.2** gemäß
`.java-version`, `.corretto-version` und `.nvmrc`, installierte npm-Abhängigkeiten
und eine eigene PostgreSQL-Entwicklungsdatenbank. Die Befehle werden aus dem
Repository ausgeführt. Keine produktive Datenbank verwenden.

Optional eine frische lokale Datenbank mit Docker starten; dieses Terminal
bleibt geöffnet. Ein vorhandenes Entwicklungs-PostgreSQL kann stattdessen über
dieselben `POSTGRES_*`-Variablen angebunden werden:

```sh
docker run --rm --name skillpilot-completion-pg \
  -e POSTGRES_DB=skillpilot_completion_dev \
  -e POSTGRES_USER=skillpilot \
  -e POSTGRES_PASSWORD=skillpilot-local-only \
  -p 127.0.0.1:55432:5432 postgres:18
```

Backend in einem zweiten Terminal starten. `JAVA_HOME` muss auf die genannte
Corretto-Installation zeigen; in der geprüften Arbeitsumgebung liegt sie unter
`/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1`:

```sh
export JAVA_HOME=/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:$PATH"
java -version
export POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=55432
export POSTGRES_DB=skillpilot_completion_dev POSTGRES_USER=skillpilot
export POSTGRES_PASSWORD=skillpilot-local-only
export GITHUB_CLIENT_ID=local-unused GITHUB_CLIENT_SECRET=local-unused
export SKILLPILOT_CLAUDE_ENABLED=false
export SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=true
export SKILLPILOT_CLAUDE_CONNECTOR_V1_SIGNING_SECRET="$(openssl rand -hex 32)"
export SKILLPILOT_CLAUDE_CONNECTOR_V1_CAPABILITY_SECRET="$(openssl rand -hex 32)"
cd backend
./gradlew bootRun
```

Die zwei erzeugten Secrets gelten nur für diesen lokalen Entwicklungsstart;
ein neuer Start mit anderen Schlüsseln benötigt neue Testsitzungen. Die alte
Claude-Beta-Lane bleibt ausgeschaltet, während der V1-Connector aktiviert wird.
GitHub-Anmeldung wird für diesen lokalen Lernprofiltest nicht verwendet.
Liquibase richtet die leere Entwicklungsdatenbank beim Start ein. Erst nach
abgeschlossenem Warmup und erfolgreichem `http://localhost:8080/api/health`
fortfahren.

Frontend in einem dritten Terminal aus dem Repository starten:

```sh
npm ci --prefix app
VITE_API_BASE=http://localhost:8080 npm --prefix app run dev -- --host 127.0.0.1 --port 5173
```

`http://localhost:5173` öffnen. Diese lokale Umgebung erlaubt Cockpit,
Abschnittswahl und die lokale Claude-Sitzungserzeugung. **Ein geöffneter Claude-Tab
ist noch kein erfolgreicher Hosttest:** Ein entferntes Claude kann diesen
Loopback-Backend nicht erreichen, und die unveränderten öffentlichen
Connectoradressen zeigen nicht auf die lokale Instanz. Lokale Startschlüssel
nicht in eine Verbindung zum produktiven Backend übernehmen. Für den echten
Hostversuch weiter unten eine gesondert bereitgestellte, für Claude erreichbare
Testinstanz mit passender OAuth-/Pluginverbindung benutzen; hierfür keine
Sicherheitsprüfung oder öffentliche Origin-Pins auf HTTP-Loopback umbiegen.

### Neues Lernprofil und sichtbaren Umfang einrichten

1. Eine neue SkillPilot-ID erstellen und den Persönlichen Lehrplan vollständig
   konfigurieren, beispielsweise Mathematik mit der gewünschten Stufe.
2. „Prüfungsabkürzungen“ aufklappen. Die Übersicht nennt ihren tatsächlichen
   Umfang und enthält die verfügbaren Prüfungslernziele. Auch ohne bewusste
   Abschnittswahl können implizite Marker vorhanden sein.
3. Bei vielen Prüfungen Suche und Seitenwechsel verwenden. Einen Eintrag
   jenseits der ersten Seite aufrufen; die Titel bleiben die Backendtitel.
4. Einen angebotenen Stufen-/Fachabschnitt bewusst als Lernweg wählen. Sein
   benannter Umfang darf sich beim Baumzuklappen oder Fokuswechsel nicht ändern.
   Ein Sek-I-Wunsch darf nicht still in einen Sek-II-Versuch umgedeutet werden.

### Direktstart, Erfolg und Misserfolg

„Prüfung direkt versuchen“ wählen, im Anbieterdialog Claude starten und die
aktuelle Sitzung verbinden. Im Cockpit wird der laufende Versuch angezeigt.
Der Coach soll keine zweite Zustimmung zur exakt gewählten Prüfung verlangen.
Erst jetzt werden Aufgabe und normaler Prüfungsablauf ausgegeben.

Die Aufgabe regulär bearbeiten. Bei Erfolg wird ausschließlich die Prüfung
Mastery erhalten. Der frische Backendstand kann andere Ziele implizit erledigen;
das ist kein Mastery-Write an deren Voraussetzungen. Eine detaillierte
Prüfungsbewertung muss bei Erfolg und bei nicht ausreichender Abgabe erfolgen.
Nichtbestehen bleibt Mastery null, ohne zusätzlichen Ergebnisstatus.

Im Baum ein implizites Symbol prüfen: Umfang und Erklärung müssen korrekt,
Mastery-Haken und globale Masteryzahl unverändert sein. Tooltip per Hover,
Tabulator/Escape und Touch prüfen. Einen geöffneten Elternknoten schließen;
er muss bis zur nächsten bewussten Zielnavigation geschlossen bleiben.

Während eines Versuchs bewusst angebotene Unterstützung, Retry oder Beenden
verwenden. Ein bestätigter Wechsel beendet den bisherigen Versuch; veraltete
Bewertungsaktionen dürfen ihn nicht weiterführen. Nach erfolgreichem Speichern
wird keine ungefragte Folgelektion begonnen.

### Plananrechnung und Zähloption am Pilot prüfen

Das frühere Skalarprodukt-Beispiel ist weiterhin ein kleiner reproduzierbarer
Testfall, aber kein allgemeiner Freischaltmechanismus:

| Rolle | Ziel-ID |
| --- | --- |
| Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen | `3016ec37-1c2e-47db-83f5-e767923bc97e` |
| Skalarprodukt über eine orthogonale Projektion erklären: Prüfung | `e98672c6-871a-5d0b-889c-5afc51040f0d` |

Die [damalige Aufgaben-/Rubrikprüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-completion/math-dot-product-projection-2026-10-31.md)
bleibt historische Maschinenprüfung. Die neue Bedarfsregel benötigt keine
zusätzliche Prüfung-Ziel-Abdeckungsfreigabe.

1. Vor dem ersten Bestehen einen Mathematikplan mit genau diesen beiden noch
   unmastered Zielen erstellen. Für den erwarteten I=2-Nachweis darf nach dem
   Bestehen kein weiterer offener Verbraucher im vollständigen Persönlichen
   Lehrplan die Vorbereitung benötigen. Ein auf zwei Ziele begrenzter Plan
   allein stellt diese Bedingung nicht her.
   Damit ist die feste Planmenge **|G|=2**. Ein bereits gemeistertes Prüfungsziel
   würde vor Planerstellung aus G bereinigt und wäre für diesen Vergleich ungeeignet.
2. „Nur explizit erreichte Lernziele zählen“ ausgeschaltet lassen. Solange die
   offene Prüfung ihre Vorbereitung benötigt, gilt **I=0**, Mastery **0 von 2**.
   Den Direktversuch durchführen und den normalen erfolgreichen Write abwarten.
3. Zur normalen Lernansicht wechseln und die Planansicht aufrufen. Für diese
   Planmenge gilt jetzt **I=2**: eine explizite Prüfung und ein implizit erledigtes
   Ziel. Die gespeicherte Mastery bleibt **1 von 2**. Plandetails benennen den
   impliziten Anteil. Besteht weiterer Bedarf im Persönlichen Lehrplan, bleibt
   I dagegen korrekt bei 1; eine engere Abschnittsansicht darf das nicht ändern.
4. „Nur explizit erreichte Lernziele zählen“ aktivieren und speichern:
   **I=1**, Mastery weiterhin **1 von 2**. Reload erhält die Einstellung. Eine
   laufende Prüfung darf allein durch diesen Wechsel nicht beendet werden.
5. Die Zähloption wieder ausschalten: **I=2** ohne neue Mastery oder neues
   Abschlussereignis. Anschließend „Prüfungsabkürzungen anbieten“ ausschalten:
   neue Direktangebote entfallen, I und fachlich gültige implizite Marker bleiben.
   Wiedereinschalten startet keinen Versuch automatisch.
6. Mit einer separaten frischen Test-ID nur die Vorbereitung in G aufnehmen,
   während die offene Prüfung im Persönlichen Lehrplan bleibt. I muss **0**
   bleiben. Die fehlende Prüfung im Plan darf keinen Arbeitsentfall erzeugen.
   Eine engere Abschnittsansicht und das Abschalten der Prüfungsangebote ändern
   diesen Planwert nicht.

Ergänzend einen gültigen prüfungsfreien Kontext und ein gewöhnliches gemeistertes
Zwischenziel prüfen. Implizite Erledigung darf in beiden Fällen nicht auf eine
angebliche bestandene Prüfung zurückgeführt werden. Automatisierte Fixtures
prüfen diese Fälle ohne Änderung produktiver Curriculum- oder Lernendendaten.

## Paketnachweis und externe Freigaben

Unveränderliche historische Profile, veröffentlichte Pakete und deren Receipts
werden nicht durch die neue Semantik umgebunden. Die lokale allgemeine Laufzeit
und aktuelle Tests sind gesondert nachzuweisen. Ein lokaler Browserlauf ist
keine echte Claude-Host-Abnahme; eine technische Vertragsquittung belegt nicht,
dass das Modell alle Anweisungen verstanden oder befolgt hat. Menschliche
Verständlichkeit und didaktische Wirksamkeit bleiben eigene Prüfungen.
