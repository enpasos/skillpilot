# Umsetzungsplan: Assessment-gated Completion

Stand: 31. Oktober 2026. Dieser Plan beschreibt den **aktuellen lokalen
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
   erledigt, sofern es keine Abschlussprüfung ist. Auch sein Bedarf entfällt;
   die Berechnung wird bis zum stabilen Zustand fortgesetzt.
3. Jede Abschlussprüfung im anwendbaren Umfang ist direkt ansteuerbar.
   Fehlende Vorbereitungsmastery verhindert den bewussten Versuch nicht.

Pro atomarem Ziel bleibt ausschließlich `mastery ∈ {0,1}` gespeichert. Implizite
Erledigung ist eine berechnete Aussage über einen benannten Umfang, keine
Mastery und kein zweites Ergebnis. Sie ist auch ohne zuvor bestandene Prüfung
möglich. Orientierung, Karten und gewöhnliche Endziele erhalten keine neue
Schutzrolle; ihre ausdrücklichen Abschlussabläufe bleiben unverändert.

Das Versprechen lautet: **Was du schon geschafft hast, muss nicht erneut
vorbereitet werden. Was für die verbleibende Arbeit nicht mehr nötig ist,
musst du nicht gesondert erledigen. Prüfungen kannst du bewusst direkt versuchen.**
Eine ausführliche KI-Prüfungsbewertung mit Punkten, Fehlererklärung und
Rückmeldung bleibt Teil des normalen Bewertungsablaufs.

## 2. Autoritativer Umfang und Graph

Der Standardumfang ist der vollständige gespeicherte Persönliche Lehrplan.
Weitere Umfänge stammen aus dessen autoritativer Program-/Composition-Struktur,
etwa einem sichtbaren Stufen- oder Fachabschnitt. Der Backenddienst verwendet
`GoalProjection`, `targetGoalIds` und die projizierten Unterbäume; er erfindet
keine Stufenzuordnung aus Titeln, `phase`, Fokus oder `requires`.

Der Compiler expandiert Clusteranforderungen und vererbte Anforderungen in
direkte atomare Beziehungen. Er bezieht die vollständige Voraussetzungshülle
mit versteckten und fachübergreifenden Zielen ein. Unterstützende Ziele werden
dadurch nicht automatisch zu Zielen des gewählten Umfangs. Fehlende Referenzen,
Zyklen und widersprüchliche Projektionen sind Fehler, keine leere Zielmenge.

Die bestehende autoritative Assessment-/Exam-Klassifikation bestimmt die
Abschlussprüfungen. Die Funktion führt keine neue Unterscheidung zwischen
Übungsprüfung und Abschlussprüfung aus Anzeigenamen ein. Aufgabenqualität und
Bewertungsrubrik bestimmen weiterhin die explizite Mastery.

Ein endlicher gültiger Kontext ohne Abschlussprüfungen ist vollständig explizit
oder implizit erledigt. `requiredAssessmentCount=0` ist deshalb ein gültiger
allgemeiner Fall, auch bei null gespeicherter Mastery.

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

## 4. Fachlicher Kern und Wartbarkeit

`CompletionProfileCompiler` löst den statischen Kontext auf;
`CompiledAutomaticCompletion` und die automatische Variante des bestehenden
kompilierten Kontexts enthalten IDs, direkte Adjazenz und Ziel-/Prüfungsmengen.
`CompletionEvaluator` berechnet den Lernerzustand ohne Datenbankzugriff.
`CompletionApplicationService` bündelt Kompilierung, begrenzten Cache und
Generationsbindung. Historische Profile bleiben als Kompatibilitäts- und
Testpfad getrennt; ihre Ein-Profil-/Ein-Prüfung-Grenze gilt nicht allgemein.

Der produktive Algorithmus startet bei allen offenen Abschlussprüfungen im
vollständigen Kontext und verfolgt deren **direkte** Voraussetzungen. Er stoppt
an jedem gemeisterten Ziel. Die verbleibenden unmastered Nicht-Prüfungsziele
sind implizit erledigt. Das ist äquivalent zur im Konzept definierten
Fixpunktberechnung und benötigt `O(|V|+|E|)` Zeit und linearen Arbeitsspeicher.
Eine vorab transitive Verbraucherrelation wäre falsch: Sie würde den
Bedarfsstopp an einem gemeisterten Zwischenziel umgehen.

Der gemeinsame Mastery-Resolver bleibt zuständig für kanonische Projektion und
bestehende Zieltypabläufe, einschließlich Karten. Neue Ergebnisse sind binär;
bestehende numerische Kompatibilitätsregeln werden nicht in Frontend oder
Evaluator dupliziert. Ein implizites Kartenziel erzeugt keine Recall-Ergebnisse,
ein implizites Orientierungsziel keine erfundene Interaktion.

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
Q übersehen. Eine explizit gewählte Abschnittsansicht zeigt ihr W_section,
ändert aber weder W_PC noch Plan-I. Gemeisterte Zwischenziele stoppen ihren
Bedarf auch bei noch offenen späteren Prüfungen. Nur ein vollständiger
Persönlicher Lehrplan ohne Abschlussprüfung in seinem gesamten Kontext ist
vollständig explizit oder implizit erledigt; ein prüfungsfreier Plan reicht nicht.

Die Planbasis bleibt fest: vor Planbeginn explizit gemeisterte Ziele werden
bereinigt, implizite Ziele nicht zusätzlich aus G gestrichen. Jede ID zählt
höchstens einmal. Ein späterer expliziter Abschluss eines bereits angerechneten
Ziels erhöht I nicht nochmals. Tatsächliche Periodenabschlüsse H bleiben an
wirkliche Abschlussereignisse gebunden; implizite Erledigung erzeugt kein
solches Ereignis und keinen rückdatierten Abschluss.

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
- Gewöhnliches Endziel, Orientierung und Karten ohne Verbraucher sind implizit
  erledigt. Ein gültiger Kontext ohne Prüfungen schließt bei Mastery null ab.
- Offene Prüfungen bleiben offen. Externe Voraussetzungen werden berücksichtigt,
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
