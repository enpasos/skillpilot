# Umsetzungsplan: Assessment-gated Completion

Stand: 3. November 2026. Dieser Plan beschreibt den **aktuellen lokalen
Implementierungsstand** nach der verbindlichen Produktkorrektur: allgemeine
Bedarfsberechnung aus Graph und Mastery statt manueller Erlassprofile.
Abschließende Gesamtprüfung, entfernter CI-Lauf, Deployment und tatsächliche
Coach-Host-Abnahme sind getrennte Nachweise; ihr Erfolg wird hier nicht behauptet.

Fachlich verbindlich ist das
[Abschlusskonzept](../concept/skill-graph/assessment-gated-completion.md).
Die [Bedien- und Prüfhinweise](assessment-gated-completion-pilot.md) beschreiben
Cockpit, Lerncoach und den weiterhin nützlichen Skalarprodukt-Testfall.

Die [frühere Fassung bei `1bc13679e1`](https://github.com/enpasos/skillpilot/blob/1bc13679e13c969c4ec7781fdcb342e699013657/docs/dev/assessment-gated-completion-implementation-plan.md)
dokumentiert den manuellen Pilotentwurf und seine damaligen Reviews. Dessen
`waivableGoalIds`, Schutzmengen und Prüfergebnis-Ziel-Zuordnungen sind **keine
Voraussetzung der allgemeinen Laufzeit**. Unveränderliche veröffentlichte
Artefakte und historische Messbelege werden dadurch nicht umgeschrieben.

## 1. Entscheidung und Produktversprechen

Drei Regeln bestimmen die Umsetzung:

1. Jedes gemeisterte Ziel beendet seinen eigenen `requires`-Bedarf.
2. Ein noch nicht gemeistertes Ziel ohne verbleibenden Verbraucher ist implizit
   erledigt, sofern es weder Prüfungs- noch Gedächtnisziel ist. Auch sein Bedarf entfällt;
   die Berechnung wird bis zum stabilen Zustand fortgesetzt.
3. Jede Abschlussprüfung im anwendbaren Umfang ist direkt ansteuerbar.
   Fehlende Vorbereitungsmastery verhindert den bewussten Versuch nicht.

Pro atomarem Ziel bleibt ausschließlich `mastery ∈ {0,1}` gespeichert. Implizite
Erledigung ist eine berechnete Aussage über einen benannten Umfang, keine
Mastery und kein zweites Ergebnis. Sie ist auch ohne zuvor bestandene Prüfung
möglich. Prüfungs- und Gedächtnisziele bleiben bis zur Mastery geschützt,
auch innerhalb versteckter Unterstützung. Schutz bedeutet jedoch nicht, dass
ein Unterstützungsziel außerhalb der ausgewählten Targets eine eigenständige
Abschlusspflicht erhält. Es bleibt unmastered, trägt aber nur solange Bedarf,
wie eine offene ausgewählte Pflicht es tatsächlich benötigt. Seine ausdrücklichen Abschlussabläufe
bleiben unverändert; Karten erhalten keine direkten Prüfungsaktionen und
werden nicht in Prüfungszahlen aufgenommen.

Das Versprechen lautet: **Was du schon geschafft hast, muss nicht erneut
vorbereitet werden. Was für die verbleibende Arbeit nicht mehr nötig ist,
musst du nicht gesondert erledigen. Prüfungen kannst du bewusst direkt versuchen.**
Eine ausführliche KI-Prüfungsbewertung mit Punkten, Fehlererklärung und
Rückmeldung bleibt Teil des normalen Bewertungsablaufs.

Es gelten die normalen Bewertungsregeln der Prüfung.
`coveredGoalIds` beschreibt die bewerteten Aufgabenhandlungen, keine eigenen
Bestehensentscheidungen pro Voraussetzung. Für die Bedarfsrechnung zählt allein
Mastery, unabhängig von Punktverteilungen oder Einzelnachweisen.
Aufgabenspezifische Punktekappungen bleiben Teil der normalen Bewertungsrubrik.

Jedes ausgewählte geschützte Target ist eine eigenständige Abschlusspflicht.
Eine spätere bestandene Prüfung erledigt deshalb keine frühere Prüfungs-ID
implizit. Jede zusätzliche Prüfungsreferenz muss auch hinsichtlich dieser
Pflichtwirkung begründet sein. Bloße Aufgabenalternativen dürfen nicht
versehentlich als weitere verpflichtende Lernziele aufgenommen werden.

## 2. Autoritativer Umfang und Graph

Der Standardumfang ist der vollständige gespeicherte Persönliche Lehrplan.
Abschnittsmasken stammen aus dessen autoritativer Program-/Composition-Struktur,
etwa einem sichtbaren Stufen- oder Fachabschnitt. Die Bedarfsrechnung läuft immer
über den vollständigen Persönlichen Lehrplan, danach werden die ausgewählten
Targets gezählt. Ein reiner Vorbereitungsabschnitt entfernt seinen außerhalb
der Maske liegenden Verbraucher nicht. Der Backenddienst verwendet
`GoalProjection`, `targetGoalIds` und die projizierten Unterbäume; er erfindet
keine Stufenzuordnung aus Titeln, `phase`, Fokus oder `requires`.

Der Compiler expandiert Clusteranforderungen und vererbte Anforderungen in
direkte atomare Beziehungen. Er bezieht die vollständige Voraussetzungshülle
mit versteckten und fachübergreifenden Zielen ein. Unterstützende Ziele werden
dadurch nicht automatisch zu Zielen des gewählten Umfangs. Fehlende Referenzen,
Zyklen und widersprüchliche Projektionen sind Fehler, keine leere Zielmenge.

Diese Grenze gilt auch für die Autorengeneratoren. Eine korrigierte
`requires`-Kante darf die Menge fachlicher Inhaltsziele nicht automatisch
erweitern. Zusätzlich ausgewählte Inhaltsziele benötigen eine ausdrückliche
Quellen-/Scopeentscheidung; kanonische Phasenlabels allein tragen sie nicht.
Bereits zusätzlich aufgenommene Ziele werden anhand dieser Entscheidung
erhalten oder korrigiert. Nicht jedes im tatsächlichen Unterstützungskontext
erreichbare Ziel benötigt außerdem eine eigene `prerequisiteOnly`-Referenz.
Die bestehende ausdrücklich festgelegte Anwendbarkeitsregel
`applicabilityFromRequires` für lokale Prüfungsendpunkte bleibt davon getrennt:
Sie prüft die Passung einer gewählten Aufgabe, liefert aber keinen Quellenbeleg
und erweitert keine Inhaltszielmenge.

Im bestehenden Backend muss die abgeleitete Länderzuordnung außerdem im
ausgelieferten `applicability`-Feld materialisiert sein. Ein korrekter
Compilerbericht allein verändert diese Runtime-Daten nicht. Autorenwerkzeuge
und CI müssen deshalb fehlende Materialisierung erkennen und die tatsächliche
Backend-Auswahl gegen die freigegebenen vollständigen Lehrpläne prüfen.
Bewusst enger geprüfte Platzierungen werden dadurch nicht automatisch auf die
gesamte rechnerische Länder-Schnittmenge ausgeweitet. Dies ist eine Ableitung
der bestehenden Anwendbarkeitsregel, keine zusätzliche Freigabe- oder
Masteryentscheidung.

Die bestehende autoritative Assessment-/Exam-Klassifikation bestimmt die
Abschlussprüfungen. Die Funktion führt keine neue Unterscheidung zwischen
Übungsprüfung und Abschlussprüfung aus Anzeigenamen ein. Aufgabenqualität und
Bewertungsrubrik bestimmen weiterhin die explizite Mastery.

In vollständigen autoritativen Curricula und unterstützten Projektionen muss
jedes Target bei Mastery null über direkte Voraussetzungen von einem
ausgewählten geschützten Prüfungs- oder Gedächtnisziel erreichbar sein. Ein gewöhnliches
Endziel ohne solchen Bedarf ist ein Modellierungsfehler. Ein nichtleerer
Lehrplan ohne geschützte Ziele fällt ebenfalls durch diese Prüfung. Die
deterministische Prüfung darf weder den Mangel ausblenden noch durch erfundene
Mastery, unbegründete neue Kanten oder bloße Umtypisierung repariert werden.
`requiredAssessmentCount=0` bleibt für einen vollständig durch Gedächtnisziele
verankerten Umfang möglich; es bedeutet keine automatische Erledigung.

Eine eigene Abschlussaufgabe darf die fehlende Route zu bereits ausgewählten
ganzen Lernzielverträgen herstellen. Der vollständige Aufgaben-/Rubrikvertrag
und seine echten Vorbereitungen müssen zum bestehenden Programm und seiner
Eingangsbasis passen. Daraus folgt keine Behauptung, das amtliche Curriculum
verlange genau diese Aufgabe, und keine neue Quellen-Coverage. Ein fehlendes
direktes Einzelmapping allein begrenzt die eigene Aufgabe deshalb nicht auf
das zuerst geprüfte Bundesland. Bekannte falsche Targetzuordnungen oder
zusätzliche unpassende Anforderungen bleiben dagegen offen.
Die geprüfte Program-/Composition-Zuordnung entscheidet weiterhin über das
Prüfungs-Target. `applicabilityFromRequires` kann ausdrücklich die Passung
einer lokalen Prüfung ableiten; Unterstützungsziele werden dadurch nicht
zu Abschlusszielen. Jede neue Pflicht ist gegen alle tatsächlich angebotenen
Konfigurationen abzugleichen; alternative Aufgabenformen erzeugen keine
zusätzlichen Pflichten ohne eigene Begründung.

## 3. UX: vorhandene Lernansicht, klare Handlungen

### 3.1 Cockpit und Lernzielbaum

Die lesende Standardauswertung benötigt keine Abschnittswahl und keine
Coach-Sitzung. Sie liefert `profileId=automatic:personal-curriculum` bei leerem
`navigationIntent`. Der Feldname `profileId` bleibt aus API-Kompatibilität;
die Kennung bezeichnet hier einen automatisch bestimmten Umfang, kein
manuell freigegebenes Profil.

Diese Übersicht pausiert keinen Lernplan, ändert kein aktives Ziel und erzeugt
keine Route. Die normale Schaltfläche „Lernen starten“ bleibt der normale
Coach-Einstieg. Erst eine ausdrückliche Abschnittswahl bindet einen Lernweg.
Baumaufklappen oder Lesen einer Erklärung verändert keine Lernzustände.

Ein blaues Schildsymbol ersetzt an implizit erledigten Zielen das bisherige
Offen-Symbol. Der Tooltip erklärt **„Für diesen Abschnitt nicht mehr
erforderlich“**, nennt den Umfang und erläutert den unveränderten gespeicherten
Lernstand. Es gibt keinen zusätzlichen breiten Textblock und keinen grünen
Mastery-Haken. Der generische Hinweis behauptet keine bestandene Prüfung.
Er unterstützt Maus, Tastatur und Touch; langer Inhalt bleibt bedienbar.

Explizite Mastery-Zähler und Balken behalten ihre Bedeutung. Die Abschnittskarte
weist explizit geschafft, implizit erledigt und noch erforderlich getrennt aus.
Veraltete oder nicht auswertbare Daten erzeugen keine positiven Marker.
Manuell geschlossene Baumzweige bleiben geschlossen, bis eine neue bewusste
Navigation sie wieder öffnet.

### 3.2 Prüfungen finden und starten

Die vorhandene aufklappbare Auswahl „Prüfungsabkürzungen“ zeigt die vollständig
vom Backend gelieferten Prüfungen des aktuellen Umfangs. Suche und Seitenauswahl
begrenzen das Rendering auf acht Prüfungen; sie schneiden nicht die
Backendmenge ab. Abschnittsoptionen werden ebenfalls gesucht und in Gruppen
von sechs angezeigt. Bereits gemeisterte Prüfungen bleiben als „Geschafft“
auffindbar. Das Backend liefert Titel, Startfähigkeit und begründete Sperren.

Ein konkretes Prüfungslernziel bietet denselben Einstieg an. Die Auswahl
„Prüfung direkt versuchen“ führt zur bestehenden Anbieterwahl; erst der
bestätigte Start bindet Abschnitt, Prüfungsziel und Sitzung atomar. Ein Read,
eine Suche oder ein bloßer Linkaufruf darf keine Prüfung starten.

`useAssessmentShortcuts` heißt in der Oberfläche **„Prüfungsabkürzungen anbieten“**
und ist standardmäßig an. Ausschalten unterdrückt neue Angebote und direkte
Starts; die automatische Bedarfsberechnung, implizite Erledigung und gültige
Plananrechnung bleiben erhalten. Das Speichern beendet gegebenenfalls eine
gewählte Direktprüfungsroute mit verständlichem Hinweis. Die unabhängige
Plan-Zähloption beendet keine laufende Prüfung.

### 3.3 Lerncoach und normale Fortsetzung

Der Coach erhält dieselbe fachliche Berechnung und aktuelle Auswahl wie das
Cockpit in einer begrenzten Projektion. Ein ausdrücklicher Wunsch nach einer
konkret angebotenen Prüfung genügt als Lernentscheidung. Eine technische
Vertragsquittung wird still erledigt; sie ist keine zweite Lernendenzustimmung.
Vor einer Antwort „keine passende Prüfung“ wird ein ausstehender technischer
Vertrag bestätigt und der aktuelle Kontext erneut gelesen.

Die KI erfindet weder Prüfungen noch Erlässe und gibt vor der bewussten Wahl
keine Aufgaben oder Lösungen aus. Nach einer Bewertung gibt sie ausführliche
Rückmeldung, speichert ausschließlich das maßgebliche binäre Ergebnis und
verwendet anschließend den frischen Backendstand. Ein vorgeschlagenes nächstes
Lernziel wird mit seinem Titel angeboten; Unterricht oder Bilder beginnen erst
nach Annahme. Normale Antworten in einer laufenden Prüfung lösen keine neue
Abkürzungssuche aus.

Der direkte Sitzungsablauf ist für Claude integriert. ChatGPT und Gemini sind
für diese Funktion zurückgestellt; es wird kein nativer Direktstart oder
ersetzender Cockpit-Handoff für diese Anbieter behauptet. Ihre spätere
Integration benötigt passende Adapter und eine eigene Host-Abnahme.

### 3.4 Bewusstes Weiterlernen bei einem Routenfehler

Bei einem positiv erkannten reinen `UNCOVERED`-Fehler bleiben Pflichtbedarf,
implizite Anrechnung und automatische Fortsetzung unbekannt. Davon getrennt
bleibt ausdrücklich gewählte gewöhnliche Arbeit möglich, wenn der vollständige
Lehrplan, Fokus, Mastery-/Recall-Stand und die veröffentlichten Handlungen
verlässlich sind. Eine laufende gültig gebundene gewöhnliche Arbeit bleibt
lesbar und abschließbar. Andere Berechnungs-, Eigentums- oder Fokusfehler
erhalten keine pauschale Ausnahme. Ein neuer gewöhnlicher Abschnittsworkflow
wird aus diesem Ersatzpfad nicht erzeugt.

Gültige Planmetadaten bleiben auch bei ausgeschaltetem Planmodus lesbar.
Eine zulässige bestätigte Aktivierung darf das ganze Planpaket übernehmen
und den Planmodus einschalten, ohne ein neues Lernziel auszuwählen. Dabei
müssen der ganze künftig gespeicherte Plansatz und der tatsächlich wirksame
Fokus geprüft werden. Bestehende Prüfungs-, Workflow- und Pausengrenzen gelten
weiter. Erst eine spätere ausdrückliche veröffentlichte Resume- oder
Fachwechselhandlung wählt freiwillige Arbeit. Der Trainerdialog meldet bei
Nullauswahl, dass kein neues Ziel ausgewählt wurde; unbekannter Bedarf wird
nicht als fehlendes startbares Ziel dargestellt.

## 4. Fachlicher Kern und Wartbarkeit

`CompletionProfileCompiler` löst den statischen Kontext auf;
`CompiledAutomaticCompletion` und die automatische Variante des bestehenden
kompilierten Kontexts enthalten IDs, direkte Adjazenz sowie Ziel-, Prüfungs-
und Schutzmengen. Die Schutzmenge ist die Vereinigung der bestehenden Prüfungs-
und Gedächtnisklassifikation, nicht eine Liste manuell freigegebener Erlässe.
`CompletionEvaluator` berechnet den Lernerzustand ohne Datenbankzugriff.
`CompletionApplicationService` bündelt Kompilierung, begrenzten Cache und
Generationsbindung. Historische Profile bleiben als Kompatibilitäts- und
Testpfad getrennt; ihre Ein-Profil-/Ein-Prüfung-Grenze gilt nicht allgemein.

Der produktive Algorithmus startet bei allen offenen Prüfungs- und Gedächtnis-
**Targets** des vollständigen Persönlichen Lehrplans und verfolgt deren
**direkte** Voraussetzungen einschließlich der fremden Unterstützung. Er stoppt
an jedem gemeisterten Ziel. Die übrigen unmastered gewöhnlichen Ziele
sind implizit erledigt. Das ist äquivalent zur im Konzept definierten
Fixpunktberechnung und benötigt `O(|V|+|E|)` Zeit und linearen Arbeitsspeicher.
Eine vorab transitive Verbraucherrelation wäre falsch: Sie würde den
Bedarfsstopp an einem gemeisterten Zwischenziel umgehen.

Der gemeinsame Mastery-Resolver bleibt zuständig für kanonische Projektion und
bestehende Zieltypabläufe, einschließlich Karten. Neue Ergebnisse sind binär;
bestehende numerische Kompatibilitätsregeln werden nicht in Frontend oder
Evaluator dupliziert. Ein Kartenziel kann nicht implizit erledigt werden;
ein implizites Orientierungsziel erzeugt keine erfundene Interaktion.
Nicht mehr benötigte geschützte Unterstützung wird weder als implizit erledigt
ausgegeben noch als zusätzliche Abschlusspflicht behandelt. Die Schutzmenge
des Kontexts und die ausgewählten geschützten Wurzeln sind getrennte Mengen.

## 5. Konsistenz und Fehlerbehandlung

Ein Zustand bindet Curriculumgeneration, persönlichen Umfang, aktuelle Mastery
und Lernendenrevision. API-Aktionen enthalten die erwartete Revision. Das
Backend prüft sie innerhalb seiner bestehenden Sperre/Transaktion und bindet
einen direkten Versuch an genau eine unterstützte Sitzung. Fremde Owner,
veraltete Capabilities und Replays dürfen keinen neuen Versuch verändern.

Ein lesender Defaultzustand schreibt keine Workflowdaten. Eine gewählte Route
ist private Navigation und kein Lernergebnis. Generations- oder Scopewechsel
werden vor Aufgaben-, Bewertungs- und Wiederholungsaktionen geprüft.
Gespeicherte Mastery bleibt erhalten. Unauswertbare Zustände werden kenntlich
gemacht; weder „alles erledigt“ noch eine Nullanrechnung darf als stiller
Fehlerersatz erscheinen.

Bei statisch fehlerhaften Target-Routen bleibt die bekannte explizite Mastery
auswertbar. Sind alle Targets des vollständigen Umfangs oder einer gewählten
Abschnittsmaske ausdrücklich gemeistert, wird genau dieser explizite Abschluss
ohne implizite Gutschrift neben der Qualitätswarnung angezeigt. Das repariert
weder den Graphfehler noch eine unbekannte oder ungültige Targetdefinition.

Das Frontend übernimmt die Backendwerte. Es berechnet weder Scope aus
Baumdarstellung noch Mastery aus impliziten Markern. SSE, Reload und
Preferences-Speichern laden den aktuellen Zustand. Ein erfolgreiches Speichern
mit anschließendem Lesefehler wird als solches gemeldet, ohne einen Rollback
vorzutäuschen. Parallele Einstellungsänderungen bewahren nur tatsächlich
geänderte Felder; unberührte Felder folgen dem aktuellen Profil.

## 6. Datenmodell und API

Es entstehen keine `passed`, `qualified`, `implicitMastery`- oder Erlasszeilen.
Die bestehende Mastery-Tabelle bleibt die einzige Zielergebnisquelle. Private
Workflowdaten halten die gewählte Navigation und kurzlebige direkte Prüfung;
sie sind kein übertragbarer Erfolgsnachweis.

Die vorhandene Completion-Response bleibt erhalten. Automatische Umfänge tragen
`automatic:`-Kennungen, generische Gründe `ruleId=no_remaining_demand` mit
gegebenenfalls leerer `assessments`-Liste. Vollständige Ziel- und Prüfungslisten
für das Cockpit werden nicht auf das kleinere Coach-Ausgabebudget gekürzt.
Die sichtbaren Seiten werden erst im Browser ausgewählt. Aufgaben und Lösungen
gehören nicht in Discovery-Metadaten.

Preferences sind partielle Updates: ein fehlendes Feld bleibt unverändert.
`useAssessmentShortcuts` hat Standard `true`;
`learningPlanCountOnlyExplicitGoals` Standard `false`. Gespeicherte Abweichungen
überstehen Export/Import. Fehlende Defaultfelder in alten signierten Backups
bleiben kompatibel, ohne deren Signaturinhalt nachträglich zu verändern.

## 7. Empfehlungen und Lernplanung

Die Backend-Fortsetzung kennt den vollständigen Bedarf, bevor sie einen
Nachfolger wählt. Eine gültig implizit erledigte Vorbereitung wird nicht erneut
als Pflicht empfohlen. Freiwilliges Lernen bleibt möglich und folgt dem
normalen Zielvertrag. Die Wahl eines Abschnitts darf keine fremden unabhängigen
Fokuswurzeln oder gespeicherte Planpräferenzen still entfernen.

<a id="plan-ist"></a>

### 7.1 Plan-IST einschließlich impliziter Erledigung

Für die feste, fachweise zusammengeführte Planmenge G, explizite Mastery M und
im **vollständigen Persönlichen Lehrplan** berechnete implizite Ziele W_PC gilt:

```text
Standard:                  I = |G ∩ (M ∪ W_PC)|
Nur explizite Ziele zählen: I = |G ∩ M|
```

`LearningPlanCompletionProjection` verwendet denselben allgemeinen Kern und
den vollständigen Persönlichen Lehrplan samt Voraussetzungshülle. Erst danach
schränkt `LearnerLearningPlanService` das Ergebnis auf die feste, je Fach
zusammengeführte Planmenge G ein. **G ist eine zeitliche Auswahl, kein eigener
Abschlussscope.** Auch noch nicht eingeplante und fachübergreifende Verbraucher
bestimmen den Bedarf; die Quote wird weiterhin ausschließlich je Fach gezählt.

Beispiel: G enthält nur Vorbereitung A, eine offene Prüfung Q benötigt A und
liegt im Persönlichen Lehrplan außerhalb G. A bleibt erforderlich und I=0.
Getrennte Fachplanauswertungen oder die Voraussetzungshülle von G allein würden
Q übersehen. Eine explizit gewählte Abschnittsansicht zeigt nur die Schnittmenge
ihres Targetumfangs mit W_PC,
ändert aber weder W_PC noch Plan-I. Gemeisterte Zwischenziele stoppen ihren
Bedarf auch bei noch offenen späteren Prüfungen. Alle ausgewählten geschützten Prüfungs-
und Gedächtnis-Targets müssen gemeistert sein, bevor der vollständige Lehrplan
abgeschlossen sein kann; ein prüfungsfreier Plan reicht nicht.

Die Planbasis bleibt fest: vor Planbeginn explizit gemeisterte Ziele werden
bereinigt, implizite Ziele nicht zusätzlich aus G gestrichen. Jede ID zählt
höchstens einmal. Ein späterer expliziter Abschluss eines bereits angerechneten
Ziels erhöht I nicht nochmals. Tatsächliche Periodenabschlüsse H bleiben an
wirkliche Abschlussereignisse gebunden; implizite Erledigung erzeugt kein
solches Ereignis und keinen rückdatierten Abschluss.

**Bestätigte Periodenentscheidung vom 1. November 2026:** Gesamt-IST und
Gesamtsaldo berücksichtigen weiterhin implizite Beiträge. Das Tages-/Wochenziel
zählt ausschließlich gültige explizite Abschlüsse H innerhalb seiner Periode:
`erfüllt = min(P,H)`, `offen = max(0,P-H)`. Frühere Vorarbeit erfüllt kein
aktuelles Kontingent. Der Rohsaldo I−S sowie Rückstand und Vorsprung bleiben
unverändert; Rückstand wird weiterhin nicht negativ. Die Checkbox verändert
I, niemals H oder diese Periodenregel. Cockpit, Coach und automatische
Fortsetzung verwenden denselben zentralen Rechner. Ein offenes Kontingent
aktiviert keine implizite Vorbereitung als Pflicht und erzeugt keine neuen
Abschlussereignisse für bereits früher gemeisterte Ziele.

Die Checkbox **„Nur explizit erreichte Lernziele zählen“** steht neben der
Planperiodenwahl und ist standardmäßig aus. Erst Speichern wirkt. Sie verändert
weder G, Solltermine, S, P, H noch Mastery, die fachliche Bedarfslage oder einen
laufenden Versuch. Route verlassen, Fokus ändern oder Prüfungsangebote
abschalten nimmt gültige Plananrechnung nicht zurück.

`SubjectStatus.planCreditText` erklärt einen inklusiven Beitrag einmal in den
vorhandenen Plandetails, beispielsweise „Im Plan angerechnet: 3 Ziele, davon
2 implizit erledigt.“ Der Text wird backendseitig lokalisiert. Ohne solchen
Beitrag, bei expliziter Zählung oder fehlender Auswertbarkeit erscheint kein
zusätzlicher positiver Satz. Tachos und globale Mastery-Zähler bleiben unverändert.

Migration `043-add-learning-plan-counting-preference`, Preferences-API,
Export/Import und Cockpit sind lokal angebunden. Details und Beispiele stehen im
[Lernplanstatusvertrag](../concept/didactic/unified-learning-plan-status.md#34-implizite-erledigung-und-optionale-explizit-zahlung).

## 8. Performance und Betrieb

Statische Kontexte werden nach Curriculumgeneration, Scope und
Auflösungssemantik wiederverwendet; persönliche Mastery gehört nicht in den
statischen Cache. Feste Grenzen für Kontexte, Knoten und Kanten verhindern
unbegrenztes Wachstum. Die vollständige Personal-Curriculum-Auswertung wird je Snapshot für alle
Fachpläne wiederverwendet, Mastery und Kartenergebnisse werden gesammelt gelesen. Es gibt keinen Evaluatorlauf und keine
Datenbankabfrage pro Baumzeile.

Die Zusammenführung kombinierter Kursansichten verwendet zusätzlich einen
LRU-Cache mit höchstens 64 unveränderlichen Bäumen. Die geordneten
Quelldokumente bilden den Schlüssel; eine Änderung des vollständigen
`contains`-Graphen verwirft die Einträge und erzwingt erneut die strenge
Validierung. Scope und Anzeigehülle werden pro Aufruf aufgebaut. Der Cache
enthält keine Lernergebnisse; neue Quelldateien benötigen wie bisher einen
neuen Repository-Snapshot.

Der Default und ein bewusst gewählter Kontext werden kompiliert; reine
Abschnittsoptionen benötigen keinen eigenen vollständigen Evaluatorlauf.
Frontend-Suche und Paging begrenzen sichtbare DOM-Knoten, erhalten aber alle
angebotenen Prüfungen. Coach-Antworten haben ein gesondertes begrenztes Budget.

Die Funktion ist standardmäßig aktiv. Manuelle Profilfreigaben und Warmup-IDs
sind keine fachliche Zugangsvoraussetzung. Vorbereitete häufige Basen können
Startkosten reduzieren; eine nicht vorgewärmte gültige Basis darf dadurch nicht
fachlich ausgeschlossen sein. Ein administrativer Kill-Switch bleibt ein
Betriebseingriff, keine zweite Lernenden-Zähloption.

Frühere Pilotbenchmarks belegen ihre damalige Konfiguration. Die allgemeine
Auswertung und größere Discovery-Antworten benötigen eigene aktuelle Messungen;
alte p95- und Payloadwerte sind keine Freigabe für den neuen Umfang.

Der lokale HTTP-Regressionslauf vom 31. Oktober 2026 mit 916 Zielen und
139 Prüfungen misst nach drei Warmups jeweils 30 Abrufe: Median rund 535 ms
für die lesende Übersicht und 549 ms für den gewählten Gesamtabschnitt,
p95 rund 616 bzw. 651 ms. Die Completion-Projektion umfasst 175.890 JSON-Bytes;
das Fixture-Budget beträgt 256 KiB. Dies ist eine Beobachtung mit lokalem
H2 und Corretto 25, keine Produktionskapazitäts- oder Host-Abnahme.
Der Browsertest schreibt die Messbedingungen und Einzelwerte nach
`tmp/level-completion-backend-browser/http-performance.json`; CI bewahrt
diesen Bericht als Testartefakt auf.

## 9. Prüfmatrix und Abschlusskriterien

Die Abnahme prüft die Regeln unabhängig von der Implementierung:

- Ketten, Verzweigungen, geteilte Vorbereitung und mehrere offene Prüfungen;
  direkter Bedarf stoppt an jedem gemeisterten Zwischenziel.
- In vollständigen Curricula und unterstützten Projektionen sind gewöhnliche
  Targets ohne Bedarf von geschützten Wurzeln bei Mastery null Fehler. Tests
  enthalten auch Lehrpläne ohne geschützte Ziele und fehlende projizierte Routen.
- Offene Prüfungen und Gedächtnisziele bleiben offen. Alle kompatiblen
  Gedächtniskodierungen, versteckte geschützte Unterstützung ohne unabhängige
  Pflicht, Recall-Rücknahme und
  getrennte Prüfungszählung werden geprüft. Externe Voraussetzungen werden berücksichtigt,
  ohne als zusätzliche sichtbare Targets oder Mastery zu erscheinen.
- Vollständiger Persönlicher Lehrplan und bewusst gewählte Unterabschnitte;
  Fokus, eingeklappte Knoten und Suchfilter verändern die Scopeberechnung nicht.
- Lesende Defaultübersicht ohne Route, unveränderter normaler Coach-Start,
  bewusste atomare Prüfungswahl, vorhandene Mastery und nicht verfügbare Aufgaben.
- Suche nach Prüfungen und Abschnitten jenseits früherer 24er-Grenzen;
  begrenzte Darstellung, EN/DE, Tastatur, Touch und lange Tooltips.
- Optout entfernt Direktangebote, erhält implizite Marker und Plananrechnung.
  Explizit-Zählung verändert nur I, nicht eine laufende Prüfung oder Mastery.
- Feste Planbasis, mehrere Pläne, Doppelzählung, spätere explizite Mastery,
  Reload, parallele Preferences, fehlende Legacy-Felder und signierte Backups.
  Ein reiner Vorbereitungsplan mit offener Prüfung außerhalb G sowie ein
  fachübergreifender Verbraucher bewahren den Bedarf; Abschnittswahl ändert I nicht.
- Veraltete Revision, fremde Sitzung, Curriculumwechsel, exakter Replay,
  fehlende Daten und Datenbanktransaktionen ohne teilweise Ergebnisänderung.

Fachliche Referenzfälle, Service-/HTTP-/Preferences-Tests, reale Browserprüfungen
und PostgreSQL-Integration werden getrennt ausgewiesen. Die vorhandenen Tests
des historischen Profilpfads bleiben als Kompatibilitätsprüfungen bestehen.
Aktuelle lokale Prüfbefehle stehen im
[Implementierungsdokument](assessment-gated-completion-pilot.md#reproduzierbare-prufung).
Ein grüner lokaler Lauf ist weder entfernter CI-Erfolg noch Deployment,
Claude-Host-Abnahme, menschlicher Verständlichkeitstest oder Wirksamkeitsnachweis.

## 10. Fachweise Korrektur und GitHub-Meilensteine

Verbindliche Arbeitsfolge vom 1. November 2026: **Mathematik → Physik →
Biologie → Chemie → Wirtschaftswissenschaften.** Die Fächer müssen getrennt
prüfbar und freigabefähig sein. Befunde im jeweils späteren Fach bleiben im
Gesamtaudit sichtbar und verhindern dessen fachliche Freigabe. Sie blockieren
den ausdrücklich auf ein anderes Fach begrenzten Korrekturmeilenstein nicht.
Die gleichen fachlichen Kriterien gelten für jedes Fach; es gibt keine
akzeptierte Fehlerbasis und keine Anrechnung ungeprüfter Restfälle.

Das erneute Astra-Ultra-Grundreview bestätigt den Bedarfsrechner und korrigiert
die Arbeitsreihenfolge: **zuerst einen einzigen reproduzierbaren Mathematik-
Targetstand stabilisieren, danach die verbleibenden Endpunktrouten bearbeiten.**
Insbesondere die bisherige Targetpromotion aus Voraussetzungen in
`completeSek1RouteBuckets`, bekannte Stufenfehler und Doppelplatzierungen in
echten Kursunionen müssen auf diesem gemeinsamen Stand geklärt werden.
Einzelne grüne Ansichtsdateien ersetzen nicht die tatsächlichen Backendangebote.

Die Restlücken werden in fachlich zusammengehörigen Endpunktgruppen bearbeitet.
Vorhandene passende Prüfungen haben Vorrang; neue Aufgabenhandlungen werden nur
für echte Inhaltslücken ergänzt. Die Zahl betroffener Ziel-IDs ist keine Zahl
benötigter neuer Prüfungen. Bestehende unabhängige Inhaltsurteile bleiben für
unveränderte Verträge verwendbar. Geänderte Felder und ihr integriertes Delta
werden gezielt geprüft; eine neue Dateibindung verlangt nicht automatisch eine
erneute vollständige Begutachtung aller unveränderten Inhalte. Ein gemeinsamer
Kandidat und sein nachvollziehbarer Diff ersetzen parallele Abschlusskandidaten
und weitere Nachweisplattformen.

Die integrierten Laufzeitfälle umfassen ausdrücklich den tatsächlichen
Mastery-Schreibpfad mit anschließender automatischer Planfortsetzung sowie alle
unterstützten Memory-Typkodierungen im autoritativen Recallresolver. Der reine
Evaluatornachweis deckt diese Aufrufstellen nicht ab.

Der erste Meilenstein liegt **nach Fertigstellung sämtlicher Mathematik-
Korrekturen**. Gemeint ist der Abschluss dieser Entwicklungsarbeiten. Dafür
müssen alle folgenden Bedingungen erfüllt sein:

1. Die Prüfung über den kanonischen Mathematikgraphen und sämtliche tatsächlich
   angebotenen Mathematik-Lehrpläne ist vollständig. Aktuell betrifft das 154
   Angebote; der Umfang wird weiter aus dem autoritativen Angebotsinventar
   bestimmt. Kein fehlerhaftes Angebot darf durch Änderung von Reifegrad,
   Fokus, Kurszusammenführung oder Prüfauswahl aus dieser Menge verschwinden.
2. Die Mathematikangebote haben keine gewöhnlichen Targets ohne ausgewählten
   geschützten Endpunkt. Die ausgewählten Prüfungen sind unter dem bestehenden
   Aufgaben-/Rubrik- und Freigabevertrag tatsächlich direkt startbar; bloße
   Target-Mitgliedschaft beweist dies nicht. Geschützte Unterstützung wird nicht
   zu einer zusätzlichen unabhängigen Abschlusspflicht. Prüfungen und Lernkarten werden weiterhin ausschließlich durch
   ihren jeweiligen expliziten Abschluss erfüllt. Mastery bleibt binär.
3. Quellen-, Stufen-, Dauer- und Platzierungsfehler, die tatsächlich angebotene
   Targets, ihre Verträge oder eine neue/reparierte Route betreffen, sind
   fachlich korrigiert. Aufgaben, Lösungen, Rubriken und tatsächliche Abdeckung
   tragen ihre Prüfungsverknüpfungen. Ein weiterer Prüfungsrand darf keine
   falsche Quellgeltung, ungeprüfte Aufgabenvariante oder ungeklärte
   Stufenzuordnung verdecken. Echte Vorbereitung und geprüfte Coverage sind
   getrennt begründet. Bestehende passende Fachreviews werden wiederverwendet;
   nur tatsächliche Restlücken erfordern neue Aufgaben. Unabhängige Fragen zu
   späteren Quellenrevisionen bleiben sichtbar, erweitern diesen Meilenstein
   aber nicht automatisch zu einer vollständigen neuen Quellenmigration.
   Bestätigte Defekte in ohnehin verpflichtenden Qualitätsgates bleiben
   blockierend; Kriterien und Reifegraduntergrenzen werden nicht abgesenkt.
4. Die relevanten Laufzeit-, Cockpit-, Coach- und Planprüfungen sowie die
   bestehenden strengen Mathematik-Qualitätsgates bestehen. Autorenskripte und
   erzeugte Ansichten sind reproduzierbar. Die gemeinsame Software wird auch
   auf Auswirkungen auf andere Fächer geprüft.
5. Die endgültigen Änderungen und gebundenen Nachweise sind unabhängig mit
   Astra Ultra geprüft; daraus folgende Korrekturen sind umgesetzt und erneut
   validiert. Konzept, Umsetzungsstand sowie LaTeX-Dokument und PDF stimmen
   mit dem tatsächlich geprüften Stand überein.
6. Der überprüfte Mathematikstand ist committed und nach GitHub gepusht.
   Sämtliche für diesen Commit erforderlichen CI-Jobs, einschließlich des
   fachlich vollständigen Mathematik-Integritätsgates, sind terminal grün.
   Fehler werden iterativ am jeweils neuesten Commit behoben. Lokale Tests,
   ein älterer grüner Commit oder noch laufende Jobs erfüllen dies nicht.

Erst anschließend beginnen die fachlichen Korrekturen für Physik. Für die
weiteren Fächer gilt dasselbe Verfahren. Unfertige Befunde anderer Fächer
werden nicht als bestanden ausgegeben. Die bisherige Gesamtprüfung bleibt als
vollständiger Audit ausführbar; fachweise Aufrufe verwenden dieselbe reale
Backend-Projektion, dieselben Integritätsregeln und sämtliche betreffenden
Angebote einschließlich ihres fachübergreifenden Voraussetzungskontexts.
Ein Fachfilter darf diesen Kontext nicht abschneiden.

Die fachweise Entwicklungsabnahme ist von fachweise unabhängiger automatischer
Produktverfügbarkeit zu unterscheiden. Der aktuelle konservative Fehlerfall
sperrt implizite Anrechnung im vollständigen defekten Persönlichen Lehrplan.
Explizite Erfolge und vollständig explizit erreichte bekannte Targetmengen
bleiben auch dann wahr und werden mit Qualitätswarnung angezeigt. Eine feinere
Fehlerbehandlung darf fremdfachliche Verbraucher nicht entfernen; sie benötigt
einen eigenen Nachweis, bevor eine gemischte defekte Konfiguration als unabhängig
automatisch benutzbar bezeichnet wird.

Die CI-Trennung wird als eigener Datenprüfpfad umgesetzt, damit ein gewöhnlicher
Softwaretestlauf nicht von sämtlichen noch unbearbeiteten Curriculumdaten
abhängt. Die allgemeinen semantischen Regressionen bleiben Pflichtprüfungen.
Ein fertiges Fach erhält einen eigenen verbindlichen Datenjob; weitere Fächer
kommen nach ihrer jeweiligen Korrektur mit identischem Prüfmaßstab hinzu.
Die bestehenden fachübergreifenden Qualitäts- und Sicherheitsgates bleiben
erhalten. Der aktuelle [Gesamtbefund](../qa-ci/status/curriculum-completion-integrity-2026-11-01.md)
kennzeichnet weiterhin die offenen Fächer und die noch fehlende Gesamtfreigabe.
