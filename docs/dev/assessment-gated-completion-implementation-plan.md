# Umsetzungsplan: Assessment-gated Completion

Stand: 30. Oktober 2026. Grundlage ist der Code bei `8aee10595` und das
[fachliche Konzept](../concept/skill-graph/assessment-gated-completion.md).
Dieses Dokument beschreibt die empfohlene Implementierung einschließlich
deutscher Cockpit- und Coach-Dialoge. Es implementiert oder aktiviert die Funktion
nicht. Die fachliche Semantik bleibt im Konzept; hier stehen Architektur,
Integrationsentscheidungen, Reihenfolge und Abnahmebedingungen.

## 1. Entscheidung und Produktversprechen

**Empfehlung: eine gemeinsame Backend-Berechnung mit kleinem, geprüftem
Abschlussprofil; darüber eine eigene Abschlusskarte im Cockpit und dieselben
Handlungsmöglichkeiten im Lerncoach.** Der erste produktive Schnitt umfasst
einen vollständig betreuten Lernabschnitt mit normalem Lernweg, direktem
Prüfungsstart und korrekter Fortsetzung nach dem Speichern.

Das Versprechen an Lernende lautet:

> Du kannst diesen Lernabschnitt durch Lernen und die vorgesehenen Prüfungen
> abschließen. Was du bereits geschafft hast, zählt sofort. Wenn bestandene
> Prüfungen bestimmte Vorbereitung für diesen Abschnitt abdecken, musst du
> diese nicht zusätzlich erledigen.

Dabei gilt unverändert: **Pro atomarem Lernziel gibt es ausschließlich Mastery
oder keine Mastery.** Prüfungsziele verwenden genau dieses Ergebnis. Es entstehen
keine zusätzlichen qualifizierenden Prüfbelege, anerkannten Prüfungszustände,
individuellen Erlassdatensätze oder gespeicherten Abschlusszertifikate.

Vier Entscheidungen halten die Umsetzung überschaubar:

1. Abschluss und entfallende Vorbereitung werden bei Bedarf berechnet. Nur
   Curriculumregeln und die vorhandenen Lernergebnisse liefern die Grundlage.
2. Ein linearer Durchlauf über den atomar expandierten Graphen ersetzt die
   wiederholte Fixpunktiteration im Produktcode. Die explizite mathematische
   Iteration bleibt unabhängige Testreferenz.
3. Die normale Frontier behält ihre Bedeutung. Ein eigener, eng gebundener
   Prüfungszugang übergeht ausschließlich die didaktische Voraussetzungssperre.
4. Empfehlungen und automatische Fortsetzungen verwenden das aktive
   Abschlussprofil bereits **vor** der Auswahl eines Nachfolgeziels.

## 2. Ausgangslage und notwendige Integrationsstellen

Die folgenden Stellen wurden im aktuellen Repository geprüft. Die vorgeschlagenen
neuen Komponentennamen sind Entwurfsnamen, keine bereits vorhandenen APIs.

| Vorhandene Stelle | Bedeutung für die Umsetzung |
| --- | --- |
| `backend/.../service/LearnerService.java`: `getLearnerState`, `setActiveGoal` | Aktivierung, Fokusprüfung, Prüfungszugang und Wiederaufnahme gemeinsam anpassen. Ein einmaliger Frontier-Bypass genügt nicht: spätere Zustandsabfragen können das Ziel wieder entfernen. |
| Dort: `maybeAutoActivateFrontierGoal`, `applyLearningPlanHandoff` | Profilpflichten vor der Kandidatenwahl berücksichtigen; bei Abschluss keine automatische Wahl eines anderen Profils oder Fokusweitung. |
| Dort: `computeEffectiveRequires`, `collectEffectiveRequires` | Kompatibilitätscode toleriert fehlende Referenzen und entfernt Selbstbezüge. Als strikter Profilvalidator ungeeignet; fachliche Auflösung gemeinsam nutzen, Validierungsfehler ausdrücklich erhalten. |
| Dort: `getMasteryProjectedToGoalIds`, kanonische Projektion und SRS-Overlay | Mastery über **alle** Ziele des Verpflichtungskontexts lesen, auch versteckte, fachübergreifende und `prerequisiteOnly`-Ziele. Die normale sichtbare Mastery-Projektion reicht nicht. |
| `backend/.../curriculumpackage/CurriculumRuntimeSnapshot.java` | Unveränderliche Paketgeneration mit `generationSha256` als Ausgangspunkt für revisionsgebundene Profilkompilierung. |
| `backend/.../ai/CoachToolFacade.java`, `CoachStateProjection.java` | Gemeinsame fachliche Aktionen und begrenzte Coach-Projektion; Anbieteradapter berechnen keinen Abschluss selbst. |
| `backend/.../service/LearnerGoalCompletionService.java` | Bestehende Lernereignisse bleiben an tatsächliche Mastery-Übergänge gebunden. Entfallende Vorbereitung erzeugt keine Ereignisse oder Quotengutschriften. |
| `app/src/views/LearnerView.tsx` | Verbindet heute mehrere getrennte Zustandsabfragen. Abschlussanzeige und Aktionen brauchen einen zusammengehörigen Backend-Snapshot. |
| `app/src/components/LearnerActiveGoalBanner.tsx`, `LearnerPlanTodayOverview.tsx` | Bestehende Muster für aktives Ziel, backendbestimmte nächste Aktion und gesperrte Aktionen bei veraltetem Zustand weiterverwenden. |
| `app/src/components/GoalCard.tsx` | Einzelziel zeigt geschafft/nicht geschafft. Der vorhandene editierbare Zahlenregler gehört nicht in die neue Oberfläche; er ist im Cockpit nicht automatisch sichtbar. |

`backend/...` steht hier für `backend/src/main/java/com/skillpilot/backend`.
Ein [curriculares Level](../concept/skill-graph/curriculum-levels.md) ist bisher
ein Konzept, kein fertig eingeführtes Laufzeitschema. Ein geprüftes,
maschinenlesbares Scope-Binding ist deshalb ein erstes Arbeitspaket und keine
stillschweigend vorhandene Voraussetzung.

### Bestehende Mastery-Abweichungen ausdrücklich behandeln

Der [Lernworkflow](../concept/runtime-workflows/learning-workflow.md#step-5-mastery-aggregation-and-feedback)
dokumentiert numerische Zwischenwerte und verstreute `0.9`-Entscheidungen im
Code. Das neue Modul bekommt **keinen eigenen Schwellenwert**. Ein gemeinsamer
Mastery-Resolver liefert den einen maßgeblichen booleschen Zielstatus; die
bestehende Anerkennung bereits erreichter Mastery darf dadurch nicht verloren
gehen. Neue und geänderte Ergebnis-Schreibpfade müssen das binäre Modell
einhalten. Eine Bereinigung alter Zwischenwerte benötigt ein eigenes, geprüftes
Migrationsvorgehen; diese Funktion rundet keine Bestandsdaten um.

Bei Lernkarten unterscheiden sich Dokumentation und Implementierung ebenfalls:
Die heutige Laufzeit bestimmt Mastery durch bestandenen Verified Recall aller
erforderlichen Karten. Erneute SRS-Fälligkeit allein entfernt sie derzeit nicht;
ein fehlgeschlagener Recall kann sie entfernen. Der dokumentierte Zielvertrag
nennt zusätzlich die Fälligkeit. Siehe
[Node Types](../concept/skill-graph/node-types.md#due-and-mastery-semantics).
Das Abschlussmodul übernimmt die **gemeinsame Laufzeitentscheidung** und führt
keine eigene Fälligkeitsregel ein. Vor Freischaltung eines betroffenen Profils
müssen dieser Vertrag und die Darstellung in Cockpit und Coach konsistent
festgelegt sein. Geschützte Lernkartenziele sind niemals erlassfähig.

## 3. UX: ein verständlicher Abschluss, weiterhin einfache Lernziele

### 3.1 Eine Abschlusskarte im Cockpit

Die Karte ist auch ohne aktivierten Lernplan verfügbar. Der Einstieg liegt
beim jeweiligen angebotenen Lernabschnitt: „Abschlussweg ansehen“ zeigt Umfang
und Möglichkeiten; „Diesen Abschlussweg nutzen“ aktiviert das Profil. Bei nur
einem passenden Profil ist kein zusätzlicher Auswahlassistent nötig.
„Zur normalen Lernansicht“ beendet die Profilsteuerung, ohne Ziele oder Mastery
zu ändern. Ein Profilwechsel wird mit neuem Namen und Umfang angeboten und
beendet eine laufende Direktprüfung erst nach bewusster Annahme kontrolliert.
„Für heute beenden“ pausiert den Ablauf und behält die Profilwahl für die
Rückkehr; es speichert keinen Abschlussdatensatz.

Die Karte benennt den tatsächlichen Umfang, etwa „Mathematik – Lernabschnitt
Funktionen“. „Schuljahr abgeschlossen“ ist nur zulässig, wenn das Profil dieses
Schuljahr mit allen genannten Fächern tatsächlich umfasst. Technische
Profilkennungen, Graphrevisionen und Fixpunktrunden bleiben aus der normalen
Darstellung heraus.

Beispiel bei zehn gleich gewichteten Zielpflichten:

```text
Mathematik – Lernabschnitt Funktionen
Noch 2 Lernziele bis zum Abschluss

5 von 10 Lernzielen geschafft
3 weitere Vorbereitungsziele sind für diesen Abschnitt nicht mehr nötig
Prüfungen: 1 von 2 geschafft

[Weiterlernen]  [Prüfungen ansehen]
Warum entfällt Vorbereitung?
```

Das ist eine Mengenaufteilung: `5 geschafft + 3 entfallen + 2 offen = 10`.
Die Prüfungen sind darin enthalten und werden nicht zusätzlich gezählt.
Der globale Mastery-Fortschritt bleibt in diesem Beispiel 50 Prozent, sofern
sein Umfang dieselben zehn Ziele enthält. Die Karte zeigt vorzugsweise absolute
Zahlen; sie führt keinen zweiten, leicht verwechselbaren Mastery-Prozentwert ein.
Bei verschiedenen Umfängen darf sie diese Zahlen nicht gegeneinander ausgeben.

Nach Abschluss lautet die Hauptaussage „Dieser Lernabschnitt ist abgeschlossen“.
Darunter stehen weiterhin die tatsächlichen Mastery-Zahlen und die entfallende
Vorbereitung. Die Aktionen sind „Für heute beenden“ und „Nächsten Lernabschnitt
ansehen“. Der zweite Knopf beginnt noch keine neue Aufgabe.

Im Zielbaum behalten einzelne Ziele ihre binäre Anzeige. Eine zusätzliche
Kontextzeile darf lauten: „Für den Abschluss dieses Lernabschnitts nicht mehr
nötig“. Sie ist weder ein drittes Mastery-Symbol noch ein globaler Kompetenzhaken.
Die Begründung nennt die bestandene Prüfung beziehungsweise Prüfungsgruppe.
Entfallende Ziele bleiben auffindbar und freiwillig lernbar. Sie verschwinden
nicht aus der Gesamtübersicht und werden nicht als nächstes Pflichtziel angeboten.

Auf Mobilgeräten genügen Titel, Restpflichten und eine primäre Aktion;
Prüfungen und Begründungen öffnen sich bei Bedarf. Status wird auch als Text
vermittelt. Tastaturfokus bleibt nach Aktualisierungen erhalten; eine kurze
zugängliche Statusmeldung bestätigt den gespeicherten Erfolg. Keine automatische
Navigation, kein allein über Farbe erklärter Zustand und keine Feieranimation
vor bestätigtem Speichern.

### 3.2 Normales Lernen und bewusster Prüfungsstart

„Weiterlernen“ nutzt die noch offenen Ziele dieses Profils und die vorhandene
Frontier im aktuellen Fokus. „Prüfungen ansehen“ listet die erforderlichen
Prüfungsziele mit ihrem vorhandenen Ergebnis. Ein offenes Prüfungsziel kann
über „Prüfung direkt starten“ bewusst gewählt werden, auch wenn seine
didaktischen Voraussetzungen noch nicht gemeistert sind.

Vor dem Start werden Titel, verfügbare Aufgabeninformationen und tatsächliche
Zugangsbedingungen gezeigt. Fehlt eine verlässliche Dauer, wird keine erfunden.
Ein kurzer Hinweis erklärt: „Du kannst die Prüfung direkt versuchen. Wenn du
noch Unterstützung brauchst, kannst du anschließend weiterlernen.“ Es gibt
keinen zusätzlichen Anerkennungsdialog nach dem Bestehen.

Eine bereits geschaffte Prüfung erfüllt ihre Pflicht sofort. Der Pilot verlangt
keinen weiteren Versuch und bietet für sie keinen neuen bewerteten Start an.
Ein späterer freiwilliger Prüfungs-Übungsmodus benötigt eine eigene Aktivierungs-
und Revalidierungsregel ohne erneute Erfolgsgutschrift: die heutige Frontier
und Zielbereinigung erlauben gemeisterte Ziele nicht einfach als aktive Prüfung.
Dieser Zusatz ist keine Voraussetzung für den Abschlussweg und setzt vorhandene
Mastery niemals zurück. Ein fehlender Aufgabentext verhindert den Start
einer offenen Prüfung, aber nicht die Anerkennung einer bereits vorhandenen
Mastery. Fehlende Inhalte sind ein Angebotsproblem, kein Lernmisserfolg.

### 3.3 Lerncoach: Rückmeldung, Speicherung, Entscheidung

Der Coach verwendet denselben Abschlussstatus und dieselben zulässigen Aktionen
wie das Cockpit. Er kennt weder eine eigene Erlasslogik noch eine zweite
Bewertung, ob eine gespeicherte Prüfung „wirklich zählt“.

| Situation | Erwartete Interaktion |
| --- | --- |
| Direkter Start gewünscht | Die konkret angebotene Prüfung auswählen; Aufgaben erst nach bewusster Wahl und erfolgreicher Backend-Aktivierung beginnen. |
| Prüfung bestanden | Fachliche Rückmeldung nach bestehendem Prüfungsablauf; normalen Mastery-Write ausführen. Erst die bestätigte Antwort erlaubt „gespeichert“ und eine aktualisierte Abschlussaussage. |
| Eine von mehreren Prüfungen geschafft | „Die Prüfung ist geschafft. Für diesen Abschnitt fehlt noch …“ Eine entfallende Vorbereitung nur nennen, wenn die Berechnung sie bereits ergibt. |
| Abschnitt abgeschlossen | Abschluss bestätigen und Abschluss/Pause oder nächsten Abschnitt anbieten; vor Wechsel und Lehren Zustimmung abwarten. |
| Prüfung nicht bestanden | Hilfe oder erneuten Versuch anbieten. Kein zusätzlicher Fehlversuchsdatensatz, keine Herabsetzung vorheriger Mastery. Die aktuelle Rückmeldung bleibt im Gespräch. |
| Speichern unbestätigt oder fehlgeschlagen | Fachlichen Erfolg und Speicherstatus auseinanderhalten; denselben Schreibvorgang nach bestehendem Idempotenzvertrag klären. Keine optimistische Abschlussmeldung. |
| Späterer Kontext braucht eine nicht gemeisterte Vorbereitung | Die Anforderungen des jetzt benannten Abschnitts erklären und Lernen anbieten. Keine Behauptung einer früheren Erlasshistorie aus dem aktuellen Mastery-Stand ableiten. |

Nachfolgeangebote verwenden den exakten lokalisierten Zieltitel. Keine Aufgabe,
Lösung oder Abbildung des Nachfolgeziels wird vor Zustimmung vorweggenommen.
Schreibaktionen transportieren ausschließlich die bestehenden zugelassenen
strukturierten Daten; Gesprächstexte und individuelle Begründungen gelangen nicht
in den Core. Es gilt die
[anbieterneutrale Coach-Grenze](../concept/runtime-workflows/provider-neutral-coach-boundary.md).

### 3.4 Fokus, leere Frontier und Rückkehr

Der verbindliche Abschlussumfang bleibt unverändert, wenn Lernende den
vorübergehenden Fokus wechseln. Die Karte zeigt gegebenenfalls „Du lernst gerade
einen Teil dieses Abschnitts“. Sind dort keine offenen verfügbaren Ziele,
unterscheidet das Backend:

- Der Abschnitt ist tatsächlich abgeschlossen.
- Weitere Pflichtziele liegen außerhalb des aktuellen Fokus: passende
  Fokusauswahl anbieten und erst nach Zustimmung übernehmen.
- Ein Pflichtziel benötigt noch Vorbereitung: konkretes verfügbares Hilfsziel
  anbieten, dessen Berechtigung und Voraussetzungen erneut geprüft werden.
- Die Berechnung ist ungültig oder eine Prüfung nicht verfügbar: verständlichen
  Konfigurations-/Angebotshinweis zeigen, keinen Abschluss behaupten.

Ein Hilfsziel außerhalb des Personal Curriculum wird nicht automatisch zum
Ziel oder Fokus hinzugefügt. Eine notwendige Änderung des Personal Curriculum
erfolgt über den vorhandenen Cockpit-Ablauf. Bei mehreren Fokuswurzeln muss eine
angenommene Erweiterung unabhängige Wurzeln vollständig bewahren.

Ein Reload lädt den aktuellen Status erneut. Ohne gespeicherte Historie gibt es
keine erfundene Aussage „neu entfallen seit deinem letzten Besuch“. Eine solche
Differenz darf nur zwischen zwei tatsächlich bekannten, passenden Snapshots
derselben Ansicht angezeigt werden.

## 4. Statisches Profil und eindeutig aufgelöster Umfang

Ein `CompletionProfileDefinition` gehört als geprüftes Curriculumartefakt in
die vorhandene Paket- und Reviewstruktur. Es ist kein Lernendendatensatz und
keine weitere Graphkante. Für den ersten Schnitt genügt ein enges Schema:

| Inhalt | Herkunft und Einschränkung |
| --- | --- |
| Profil-ID, Revision, verständlicher Name | Stabiles Curriculumartefakt; Revision wird beim Kompilieren an die Paketgeneration gebunden. |
| `levelScopeRef` und Anwendbarkeit | Referenz auf autoritative Programm-/Placement- oder Composition-Struktur und deren aufgelöste Auswahl; keine unabhängige Kopie des Zielbaums. |
| Zusätzliche geschützte Ziel-IDs | Nur Ergänzungen zum Schutz aller Prüfungs-, Orientierungs- und Memorierungsziele. |
| Regeln mit `ruleId`, `assessmentGoalIds`, `waivableGoalIds` | Explizite kanonische IDs für die Mengen `S_r` und `W_r`. Keine automatische Ableitung aus `requires` oder `coveredGoalIds`. |
| Fachliche Regelbegründung und Reviewreferenz | Statische Prüfung von Aufgaben, Rubrik und normalem Mastery-Vertrag; keine persönliche Ergebnisanerkennung. |

`T_i` wird aus dem verbindlichen Scope aufgelöst; `Q_i` umfasst **alle** darin
verpflichtenden Prüfungsziele; `P` entsteht aus dem gemeinsamen Zieltypvertrag
und ergänzendem Schutz. Eine separate Liste darf kein unbequemes Prüfungsziel
aus `Q_i` entfernen. Aufgabenbanken oder Wahlalternativen müssen vorher durch
einen autorisierten Auswahlvertrag eingeordnet sein. Der Pilot unterstützt nur
vollständig entschiedene Auswahlen; er erfindet keinen Wahlpflicht-Editor.

Der Compiler prüft zusätzlich zur bestehenden Basisvalidität:

- nichtleeres `T_i`, nichtleeres `Q_i`, zulässige kanonische Identitäten und
  vollständige Referenzauflösung über Fächer und Landschaften;
- erforderliche, aufgelöste Scope-Auswahl ohne Ableitung aus bloßen UI-Filtern,
  `phase`, Schwierigkeit `level` oder vorübergehendem Fokus;
- `T_i` als Teilmenge der autoritativen Level-2-Ziele: keine Zielpflicht aus
  einem abgewählten Fach oder fremden Kursprofil. Unterstützende Ziele in
  `V_H \ T_i` dürfen darüber hinausgehen, bleiben aber ohne Zielpromotion;
- vollständige atomare Expansion einschließlich geerbter und
  Cluster-Voraussetzungen, anschließend prerequisite-geschlossene Menge `V_H`;
- keine Selbstabhängigkeit und keinen atomaren Zyklus innerhalb `V_H`;
- nichtleere `S_r ⊆ Q_i`, `W_r ⊆ V_H \ P` und für jedes `v ∈ W_r` einen
  echten Voraussetzungspfad von mindestens einem `q ∈ S_r`;
- eine nachvollziehbare, zum aktuellen Aufgabenvertrag passende fachliche
  Freigabe jeder Regel. Technische Erreichbarkeit beweist keine Abdeckung.

Eine atomare Expansionsstörung in einem unerreichbaren Teil eines ansonsten
basisgültigen Graphen sperrt dieses Profil nicht. Ein ungültiger Basisgraph
bleibt dagegen ein eigener Fehler; der lokale Zyklustest ersetzt ihn nicht.
Fehlende Referenzen werden nicht durch leere Mengen oder entfernte Selbstkanten
„repariert“. Hat ein Level keine erforderliche Prüfung, gilt sein gewöhnlicher
Abschlussvertrag; das ist kein leer erfülltes Assessment-Profil.

Die Aussage „Die Prüfungen allein schließen diesen Abschnitt ab“ muss zusätzlich
mit `E = Q_i` gegen die Berechnung geprüft sein. Bleiben andere Pflichtziele,
nennt die UX diese ausdrücklich. Struktur- und Zeitbudgetprüfungen bleiben eigene
Qualitätsaussagen; Prüfungserfolg ersetzt sie nicht.

Temporär nicht lieferbare Aufgaben betreffen die Startverfügbarkeit, nicht
automatisch die Gültigkeit eines bereits fachlich freigegebenen Profils.
Ändert sich dagegen der fachliche Aufgaben-/Mastery-Vertrag, müssen die
betroffenen statischen Regeln in der neuen Curriculumgeneration überprüft
werden. Frühere Prüfungsmastery benötigt auch dann keine individuelle
Nachqualifizierung.

## 5. Backend-Architektur und Auswertung

### 5.1 Kleine Fachkomponenten mit klaren Eingaben

Der bestehende große `LearnerService` bleibt zunächst Integrationspunkt. Die
neue Berechnung wird nicht als weiterer großer Block dort eingebaut.

Der Compiler liefert den unveränderlichen atomaren Kontext. Zusammen mit dem
gemeinsamen Mastery-Snapshot geht dieser in den reinen Evaluator ein. Dessen
Ergebnis speist Cockpit, Coach sowie Zugangs- und Fortsetzungsentscheidungen:

| Baustein | Verantwortung |
| --- | --- |
| `CompletionProfileCompiler` | Scope auflösen, streng validieren, kanonische atomare IDs indizieren, direkte expandierte Kanten und topologische Reihenfolge vorbereiten. |
| Gemeinsamer Mastery-Resolver | Vorhandene Mastery einschließlich kanonischer Projektion und Zieltypsemantik für alle `V_H` liefern; keine profilingene Ergebnisbewertung. |
| `CompletionEvaluator` | Reine Funktion ohne Datenbank, Uhr, Netzwerk oder Seiteneffekte. Liefert `E`, `I`, offene Ziele und Abschluss aus kompiliertem Profil und booleschem Mastery-Snapshot. |
| `CompletionApplicationService` | Konsistenten Kontext lesen, kompiliertes Profil beziehen, genau einmal auswerten und Projektionen versorgen. |
| Zugangs- und Fortsetzungsintegration | Auswahlaktionen, Direktprüfung, vorhandene Ziel-Revalidierung und Nachfolgerentscheidung verbinden. Keine zweite Fachlogik pro Oberfläche. |

Aus `LearnerService` wird nur das hierfür benötigte gemeinsame Verhalten
extrahiert, jeweils mit Charakterisierungstests. Eine komplette Neuschreibung
der Frontier, des Coach oder des Planers ist keine Vorbedingung.

### 5.2 Linearer Algorithmus mit vollständiger indirekter Semantik

Es gelten die Mengen und Regeln des Konzepts. `F_H` bezeichnet die **direkten,
atomar expandierten** Voraussetzungen innerhalb des bereits geschlossenen
Kontexts `V_H`. Dabei bedeutet `u → v`: u benötigt v. Die transitive Relation
`R_H = F_H⁺` bleibt die fachliche Definition, muss aber zur Laufzeit nicht
materialisiert werden.

Zunächst aus den tatsächlich gemeisterten Prüfungszielen die aktivierten Regeln
und deren Vereinigungsmenge `W(E)` bestimmen. Dann die Knoten in topologischer
Reihenfolge **Verbraucher vor Voraussetzung** durchlaufen:

```text
blocked[v] = false für alle v
done[v] = false für alle v

für v in topologischer Reihenfolge von F_H:
    done[v] = (v in E) oder ((v in W(E)) und nicht blocked[v])
    für jede direkte expandierte Kante v → p:
        blocked[p] |= blocked[v] oder nicht done[v]

X = {v | done[v]}
I = X \ E
pendingTargets = T_i \ X
complete = (Q_i ⊆ E) und (pendingTargets leer)
```

**Wesentlich:** `blocked` wird auch durch einen gemeisterten Zwischenknoten
weitergegeben. In `C → B → A` hält ein offenes C den Erlass von A weiterhin
auf, selbst wenn B Mastery besitzt. Nur unmittelbare offene Verbraucher zu
zählen wäre falsch.

Begründung: Beim Besuch von v sind alle echten transitiven Verbraucher bereits
ausgewertet. `blocked[v]` ist genau die Aussage, dass mindestens einer davon
nicht in `X` liegt. Daher ist die Entscheidung für v identisch zur
Fixpunktregel. Induktion über die Reihenfolge liefert den gleichen kleinsten
Fixpunkt; kein später besuchter Knoten kann diese Entscheidung ändern.

Mit `n = |V_H|`, `m = |F_H|` und `r` als Gesamtzahl der Regelreferenzen benötigt
die Auswertung `O(n + m + r)` Zeit und `O(n)` zusätzlichen Arbeitsspeicher neben
Graph und Regeln. **m zählt die Kanten nach atomarer Expansion**; große
Clusterabhängigkeiten können schon dort dicht werden. Das ist kein Versprechen
linearer Kosten in der ursprünglichen JSON-Dateigröße.

Der Compiler prüft die Regel-Erreichbarkeit mit wiederverwendeten Traversierungen
pro unterstützender Prüfung. Dafür darf er höhere einmalige Kosten benötigen;
diese dürfen nicht in jeden Lernendenrequest wandern. Dichte oder zu große
Profile werden mit konkreter Diagnose vor Veröffentlichung beanstandet, niemals
durch Abschneiden von Voraussetzungen scheinbar beschleunigt.

### 5.3 Erklärungen ohne Belegregister

Für einen Erlass genügt zunächst die stabile Regel-ID mit den unterstützenden
Prüfungszielen. Wenn mehrere Regeln gelten, wird eine deterministische
Begründung gewählt; keine fiktive individuelle Freigabe gespeichert.

Bei blockiertem Erlass hält der Durchlauf einen konkreten offenen Verbraucher
als Zeugen fest. Ein Detailabruf kann im direkten Graphen einen passenden Pfad
rekonstruieren. Ein global geteilter Vorgängerzeiger darf keine nicht existierende
Kette erfinden, wenn mehrere Verbraucher zusammenlaufen. Alle Verbraucherlisten
oder vollständigen Begründungsbäume werden nicht vorsorglich pro Lernenden
materialisiert. Gründe außerhalb sichtbarer Zielrollen erlauben keine neue
Zugriffsberechtigung auf fremde Inhalte.

## 6. Konsistenz, API und kurzlebiger Prüfungszugang

### 6.1 Ein Ergebnis für Karte und Coach

Eine optionale `levelCompletion`-Projektion ergänzt den vorhandenen
Zustandsvertrag. Der bereits im Coach belegte Name `completion` wird dafür
nicht umgedeutet.
Folgende Angaben sind fachlich erforderlich; die genaue DTO-Aufteilung wird
mit den bestehenden REST-/MCP-Verträgen umgesetzt:

| Angabe | Bedeutung |
| --- | --- |
| `calculationStatus` | `valid`, `unresolved`, `invalid`, `notApplicable` oder technisch `unavailable`; niemals mit offenem Lernziel verwechseln. Ein Timeout ist kein ungültiges Curriculum. |
| Kontextreferenz, Profilrevision, Curriculumgeneration, Lernendenrevision | Identifiziert die tatsächlich berechneten Eingaben; technische Felder bleiben außerhalb der normalen UX. |
| Umfangstitel und `complete` | Benannter Abschluss; `complete` ist nur bei gültiger Berechnung vorhanden. |
| `masteredTargetCount`, `waivedTargetCount`, `pendingTargetCount`, `targetCount` | Disjunkte Zielmengen. Unterstützende Ziele sind nicht im Nenner. |
| Prüfungen geschafft/erforderlich | Aus `Q_i` und vorhandener Mastery; kein zweiter Prüfstatus. |
| Erlaubte nächste Aktionen und angebotene Prüfungen | Frisch geprüfte Möglichkeiten, mit Titel, Aktion und gegebenenfalls Verhinderungsgrund. Mastery und Startverfügbarkeit bleiben getrennte Fakten. |
| Begründungsreferenzen | Details an denselben vollständigen Inputstand einschließlich Lernendenrevision binden. Bei Änderung aktuellen Stand laden, keine historische Erklärung aus heutiger Mastery herstellen. |

Listen sind begrenzt und bei Bedarf nachladbar. Der Coach erhält eine kompakte
Zusammenfassung und die gerade sinnvollen Entscheidungen, nicht den Graphen
oder sämtliche offenen Ziele. Cockpit und Coach verwenden dieselben IDs,
Mengen und Entscheidungen, aber passende Darstellungen.

`scopeCompleted` und `curriculumComplete` behalten ihre eigenen bisherigen
Mastery-Bedingungen. Ein wahrer Profilabschluss setzt diese Felder nicht auf
`true`. Ebenso bleibt die normale Frontier fachlich unverändert; die aktive
Empfehlungsmenge ist eine ausdrücklich benannte Projektion daraus.

### 6.2 Konsistenter Read und bestätigter Write

Curriculumgeneration, aufgelöste Auswahl, Profil und Lernendenstand werden für
eine Auswertung festgehalten. **Für den Pilot gilt die vorhandene gemeinsame
Lernendensperre** `LearnerRepository.findBySkillpilotIdForUpdate`: unter dieser
Sperre Scope, Revision, Mastery und erforderliche Recall-Daten gebündelt lesen
und in unveränderliche Eingaben kopieren. Alle relevanten Schreiber müssen
dieselbe Sperr-/Revisionsdisziplin einhalten; das wird vor Integration geprüft.
Kompilierung, externe Zugriffe und UI-Aufbereitung gehören nicht unter die
Sperre. Bei einem reinen Read kann die Berechnung danach auf dem festgehaltenen
Snapshot erfolgen; die Antwort nennt dessen Revision. Schreibende Auswahl und
Nachfolgerentscheidung prüfen den aktuellen Stand in ihrer Transaktion erneut.

Die neue Leseintegration darf nicht aus Bequemlichkeit den nebenwirkungsreichen
allgemeinen `getLearnerState`-Pfad aufrufen und dadurch ein Ziel aktivieren oder
Fokus verändern. Vorhandene bewusst lesende Coachpfade bleiben lesend. Erst
nach Lastmessungen kommt alternativ ein optimistisches Snapshotverfahren
infrage; ein zweiter Revisionsread aus dem JPA-Cache wäre keine Verifikation.

Bestehende Mastery-Schreibaktionen behalten Transaktion, Autorisierung,
Idempotenz und Lernereignisse. Die resultierende Abschlussberechnung verwendet
den erfolgreich geschriebenen Stand. Bei Rollback gibt es weder neue Mastery
noch eine Erfolgsantwort mit daraus abgeleitetem Abschluss. Ein Replay erzeugt
keinen zweiten Lernerfolg und keine zusätzlichen Erlasseinträge.

Auch Profilwahl, Start, Abbruch und aktive Kontextwechsel verwenden diese
Sperre und die gemeinsame Revision. Beim erfolgreichen Prüfungs-Write gehören
Kontextende und Nachfolgerentscheidung zum selben transaktionalen Stand.

Eine fehlgeschlagene Aktualisierung im Cockpit zeigt den letzten bekannten
Stand als veraltet und sperrt darauf beruhende Schreibaktionen. Nach SSE,
Import, Reset, Recall oder Scopewechsel wird frisch geladen; die UI vermischt
keine neue Abschlusskarte mit alten Prüfungsaktionen. Der Server prüft jede
Aktion erneut, unabhängig von ihrer vorherigen Anzeige.

### 6.3 Bewusst gewähltes Profil und Direktprüfung

Die optionale Auswahl eines aktiven Abschlussprofils ist Navigations-/Workflow-
zustand auf Level 3, kein Lernzielergebnis. Sie referenziert ein vorhandenes
Profil. Level 2 bestimmt weiterhin die erlaubte Zielwelt; eine Profilwahl
schreibt weder Curriculumregeln noch Mastery. In der normalen Ansicht ohne
aktives Profil greifen die bisherigen Empfehlungen unverändert.

Für direkte Prüfungen wird eine eigene fachliche Startaktion eingeführt.
Sie nimmt nur eine aktuell angebotene, backendgebundene Auswahl entgegen und
prüft unter aktueller Revision: Profil gültig, `q ∈ Q_i`, noch keine Mastery,
Zugriffsrecht, verfügbare geprüfte Aufgabe und unabhängig geltende Bedingungen.
Sie schaltet weder global `strictMode` aus noch erzeugt sie Voraussetzungen.
„Geschützt vor Erlass“ allein ist keine Zugangsbedingung: etwa eine offene
Orientierung bleibt bei Bedarf ein Abschlussziel, ohne dadurch automatisch
jeden direkten Prüfungsversuch zu sperren.

Vom Cockpit führt das frische Prüfungsangebot in die vorhandene Anbieterwahl
von „Lernen starten“. Erst die bestätigte Startaktion erzeugt die neue
Lernsitzung und bindet daran die erneut geprüfte Prüfungswahl. Ein Abbruch der
Anbieterwahl aktiviert noch kein verwaistes Prüfungsziel. Eine bestehende
Coach-Sitzung verwendet dieselbe fachliche Aktion mit ihrem bereits
authentifizierten Sitzungskontext; sie benötigt keinen zweiten Lernstart.
Währenddessen zeigt das Cockpit „Prüfung läuft im Lerncoach“ mit dem Titel
und einer bewusst auszulösenden Abbruch-/Wechselmöglichkeit.

**Empfohlene Fokusentscheidung:** Ein direkter Versuch erhält eine ausdrücklich
gebundene Ausnahme für genau dieses Prüfungsziel innerhalb des Personal
Curriculum. Der vorherige Fokus muss dafür nicht auf die Prüfung verkleinert
werden. Das aktive Ziel darf während dieser Aktion außerhalb des bisherigen
Fokus liegen; der benannte Abschlussumfang und alle anderen Fokuswurzeln bleiben
erhalten. Die UI zeigt den bewussten Wechsel zur Prüfung.

Ein kurzlebiger `DirectAssessmentContext` bindet diese Ausnahme an Lernenden,
autorisierte Sitzung, Profil-/Curriculumrevision und Prüfungsziel. Er ist
technischer Ablaufzustand, kein Versuchsergebnis und keine neue Ergebnistabelle.
Bestehende Capability- und Sitzungsmechanismen werden wiederverwendet. Die
Ausnahme muss in Aktivierung, späteren Zustandsabfragen, Aufgabenfreigabe,
Bewertungs-Capability und Speicherung gleich geprüft werden. Ein vom Client
übergebenes `bypassPrerequisites=true` ist kein gültiger Ersatz.

Da das aktive Ziel derzeit lernendenweit gespeichert ist, benötigt der Core
die private Besitzerbindung des Workflows. Ein gewöhnlicher Cockpit-Read oder
eine andere Coach-Sitzung darf die laufende Prüfung weder wegen fehlender
eigener Capability löschen noch selbst übernehmen. Reine Anzeige und Erhaltung
des aktiven Ziels sind von der Berechtigung zur Fortsetzung zu trennen.
Anbieteradapter reichen intern einen verifizierten Aufrufkontext weiter;
das Modell liefert keine frei gesetzte Besitzer- oder Ausnahmeberechtigung.
Ein bewusstes Abbrechen/Wechseln im autorisierten Cockpit darf die Bindung
beenden; ein Hintergrundrefresh darf das nicht.

Bei Erfolg endet die Ausnahme zusammen mit dem **bestätigten Mastery-Write**,
nicht schon mit der Bewertung im Gespräch. Bei Misserfolg erfolgt kein solcher
Write; der Server kann dieses Gesprächsergebnis deshalb nicht beobachten.
Nach der Rückmeldung beendet oder ersetzt erst die angenommene Aktion
„erneut versuchen“, „Unterstützung“ oder „pausieren“ den Ablauf. Dafür dient
eine neutrale technische Beenden-/Wechselaktion ohne Fehlstatus, Score oder
Chattext. Bis zur Entscheidung wird keine weitere Aufgabe begonnen.
Auch Abbruch, Zielwechsel, manuelle Fokus-/Level-2-Änderung oder ungültiger
Kontext beenden die Ausnahme. Sitzungsablauf erfordert
den vorhandenen frischen Lernstart; eine alte Capability wird nicht reaktiviert.
Ein Reload in einer noch gültigen Sitzung kann denselben aktiven Ablauf
wiederaufnehmen. Ist die Bindung verloren, bietet das System einen neuen
bewussten Start an, statt still weiterzuprüfen. Das Beenden der Startausnahme
darf die bereits autorisierte Ergebnis-/Lösungsrückmeldung oder einen nach
bestehendem Vertrag zulässigen Schreib-Replay nicht abschneiden. Die
abschließende Antwort wird vollständig im regulären Prüfungsablauf erzeugt;
daraus entsteht kein zusätzliches Ergebnisregister. Ein neuer Versuch erhält
frische technische Berechtigungen, keinen wiederverwendeten Bewertungsbeleg.

Mehrere Tabs und Anbieter teilen keine ungebundene Prüfberechtigung: nur die
passende Sitzung darf den Ablauf fortsetzen. Ein zwischenzeitlich geändertes
aktives Ziel oder ein anderer Scope invalidiert veraltete Aktionen. Bereits
gespeicherte Mastery bleibt dabei vollständig erhalten.

## 7. Empfehlungen und Lernplanung

Bei aktivem Profil berechnet das Backend zunächst
`pendingTargets = T_i \ X_*`. Gewöhnliche Empfehlungen sind deren Schnitt mit
der vorhandenen Frontier unter dem aktuellen normalen/strikten Fokusvertrag.
Direkte Prüfungsangebote sind ein eigener Weg. Unterstützendes Lernen wird
als konkrete Hilfe angeboten und benötigt die gewöhnliche Berechtigung; es
erscheint nicht als heimlich neu hinzugefügte Zielpflicht.

Bewusst gewählte Hilfe und freiwillige Vertiefung brauchen eine schmale
Navigationsabsicht am **aktuellen** Ziel, etwa `required`, `support` oder
`voluntary`. Das sind Ablaufgründe, keine per Ziel gespeicherten Lernergebnisse.
Die Auswahl übersteht Reload bis Abschluss oder Abbruch und wird nicht durch
den Pflichtkandidatenfilter entfernt. Für Unterstützung außerhalb `T_i`, aber
innerhalb des Personal Curriculum gilt der gewöhnliche Fokusvertrag: entweder
ist der Start bereits erlaubt oder ein angebotener Fokuswechsel wird ausdrücklich
angenommen. Freiwillige Vertiefung im Pilot betrifft hier noch nicht gemeisterte,
für den Abschluss entfallende Ziele; Wiederholung bereits gemeisterter
Prüfungsziele ist der in Abschnitt 3.2 abgegrenzte zusätzliche Übungsmodus.
Eine Zustimmung umfasst genau das gewählte Ziel, keine automatische Kette
weiterer Hilfsziele. Danach gilt wieder die Fortsetzungsentscheidung im Profil.

Der Filter muss an **allen** automatisch auswählenden Stellen vor der Auswahl
greifen: Autopilot, Mastery-Nachfolger, Plan-Handoff und Wiederaufnahme. Nur
ein bereinigtes Response-Array genügt nicht, wenn zuvor schon ein entfallendes
Ziel aktiviert wurde. Wird ein bereits aktives Vorbereitungsziel durch einen
anderen bestätigten Write entbehrlich, bleiben die laufende Eingabe und Aufgabe
erhalten. Am nächsten passenden Interaktionspunkt erklärt die Oberfläche, dass
es für diesen Abschluss nicht mehr erforderlich ist, und bietet freiwilliges
Fertigstellen oder Wechsel an. Bereits abgegebene, ausreichend richtige Arbeit
kann weiterhin regulär Mastery erreichen. Nach Wahl freiwilligen Weiterlernens
wird nicht bei jedem Refresh erneut gefragt. Eine währenddessen vollständig
erfüllte Abschlusskarte beendet keine laufende Unterhaltung ungefragt.

Ein Plan darf entfallende Ziele nur durch einen expliziten Integrationsvertrag
aus der aktuell angebotenen Restarbeit ausnehmen. Referenzplan, feste Baseline,
Wochenquoten und tatsächliche Lernerfolge bleiben unverändert. Ein außerhalb
des Profils gebundener Plan wird nicht still umgedeutet. **Im Pilot pausiert bei
aktiver Profilroute die gewöhnliche Plansteuerung sichtbar.** Ihre Karte sagt
beispielsweise: „Du arbeitest gerade am Abschluss dieses Lernabschnitts.
Dein regulärer Lernplan ist währenddessen pausiert.“ Sie fordert entfallene
Vorbereitung weder als Rückstand noch als nächsten Schritt ein. Baseline und
tatsächliche Quoten werden nicht umgerechnet; historische Plandaten bleiben
als solche zugänglich. Das Verlassen der Profilroute bietet eine bewusste
Rückkehr zum dann frisch berechneten Lernplan. Die Pause verschiebt keine
Termine. Eine später integrierte Restarbeitsprojektion ist ein eigenes Paket.
Berechnete Erlasse versprechen keine eingesparten Minuten.

Eine leere Empfehlungsmenge wird anhand der Fälle in Abschnitt 3.4 erklärt.
Der bestehende Fokusweitungsmechanismus darf nicht allein aus ihr einen Abschluss
ableiten. Nach abgeschlossenem Profil haben Abschluss/Pause und bewusste
Neuauswahl Vorrang vor automatischem Handoff. Freiwilliges Weiterlernen wird
ausdrücklich gewählt und schreibt nur unter dem normalen Zielvertrag Mastery.

## 8. Performance und Wartbarkeit

### Wiederverwendung vor zusätzlicher Infrastruktur

Kompilierte Profile enthalten nur statische, nicht personenbezogene Daten:
indizierte IDs, direkte expandierte Adjazenz, topologische Reihenfolge, Ziel-
und Schutzmengen sowie Regeln. Cache-Schlüssel umfassen Paketgeneration,
Profilrevision, autoritative aufgelöste Scope-Auswahl und Semantikversion der
Auflösung. Fokus und Sprache sind keine Eingaben des fachlichen Abschlusses.
Sie beeinflussen die nachgelagerte Darstellung beziehungsweise Aktionsauswahl.

Die aktuelle Paketaktivierung ist eine **Prozessstartgrenze**:
`CurriculumRuntimeSnapshotProvider` bietet noch keinen koordinierten Hot Reload
aller abgeleiteten Services. Der Pilot verwendet eine unveränderliche
Runtimegeneration pro Prozess. Neustart mit neuer Generation verwirft
Compiler-Caches und alte kontextgebundene Aktionen. Für zusammengehörige Reads
und Aktionen muss das Deployment eine stabile Generation sicherstellen; im
Pilot werden alte Instanzen beim Wechsel aus dem Routing genommen und geordnet
beendet. Fremde Generationsbindungen führen zu einem erklärten Neuladen,
niemals zu automatischen Refresh-Schleifen zwischen verschieden alten Instanzen.
Die Funktion führt
keinen eigenen Hot-Reload-Mechanismus ein. Ein Pilot im Legacy-Landschaftsmodus
benötigt zuvor eine gleichwertig konsistente Generationsbindung.

Kompilierung möglichst beim Laden/Validieren einer Curriculumgeneration;
ungewöhnliche Scopekombinationen einmalig bei Bedarf. Ein begrenzter Cache nach
Speicherverbrauch verhindert unbegrenzte Kombinationen. Gleichzeitige Anfragen
derselben Kompilierung teilen deren Ergebnis. Kein Redis, keine neue Queue
und keine inkrementell gepflegte Erlassdatenbank im ersten Schnitt.

Pro Request wird Mastery einschließlich Recall gebündelt gelesen und die
Auswertung genau einmal wiederverwendet. Keine Datenbankabfrage pro Knoten,
Regel oder Zielkarte. Insbesondere vorhandene SRS-Helfer auf wiederholte
Deck-/Kartenzugriffe prüfen und erforderliche Daten gemeinsam laden. Eine
lineare Graphfunktion gleicht ein Datenbank-N+1 nicht aus.

**Zunächst kein personenbezogener Ergebnis-Cache über Requests hinweg.** Damit
entfallen die schwierigsten Invalidierungsfälle. Falls Messungen später einen
solchen Cache rechtfertigen, muss er alle Mastery-, Recall-, Mapping-, Scope-
und Profiländerungen berücksichtigen. Zeitabhängige Angebotsbedingungen und
Sitzungsablauf benötigen zusätzlich Ablaufgrenzen. Die heutige SRS-Fälligkeit
wird dadurch nicht zur Mastery-Bedingung; würde der gemeinsame Vertrag künftig
zeitabhängig, müsste auch dieser Cache entsprechend auslaufen.

### Messbare Ziele statt unbelegter Geschwindigkeitsversprechen

Vor dem Pilot werden Hardware, Daten und Messmethode festgehalten. Vorgeschlagene
Startbudgets, anschließend anhand realer Pilotdaten zu bestätigen:

| Messung | Ziel und Messgrenze |
| --- | --- |
| Warme reine Auswertung | p95 höchstens 25 ms für 10.000 atomare Kontextziele und 100.000 expandierte Kanten auf dokumentierter Referenzhardware, einschließlich Regelaktivierung; kein behaupteter Istwert. |
| Zusätzliche Antwortlatenz | p95 höchstens 100 ms gegenüber demselben Zustandsabruf ohne Profil, bei warmem Compiler-Cache; Datenbank- und Projektionskosten einschließen. |
| Skalierung | Ketten, Diamanten, viele geteilte Voraussetzungen und dichte Cluster bei 100, 1.000 und 10.000 Zielen messen; `n`, `m`, Regelumfang, Laufzeit und Speicher ausweisen. |
| Abfragen | Gebündelte Mastery-/Recall-Lesevorgänge; Abfragezahl darf nicht pro Ziel wachsen. |
| Antwortgröße | Kompakte Standardprojektion als Budget zunächst 8 KiB zusätzlich; vollständige Erklärungen und große Prüfungslisten separat begrenzt laden. |
| Kalter Start und Generationswechsel | Kompilierungsdauer, maximale Heapbelegung und gleichzeitige Erstzugriffe separat messen. Kein falscher Abschluss oder stiller Rückfall bei Timeout. |

Diese Budgets sind Designziele und keine bereits gemessene Java-Performance.
Bei Überschreitung zuerst Expansion, Batchzugriffe und Payload prüfen. Eine
komplexe inkrementelle Auswertung erst ergänzen, wenn Messungen sie begründen
und sie gegen dieselbe Referenz abgesichert ist.

## 9. Umsetzung in überprüfbaren Schritten

| Schritt | Konkretes Ergebnis | Abnahme vor dem nächsten Schritt |
| --- | --- | --- |
| 1. Gemeinsame Begriffe und Pilotumfang | Ein realer, begrenzter Abschnitt; autoritatives Scope-Binding; vollständige Pflichtprüfungen; freigegebene statische Regeln; einheitliche Mastery-Interpretation der betroffenen Zieltypen. | Keine ungeklärte Pflichtauswahl, keine zusätzliche Ergebnisanerkennung; aktuelle Mastery wird unmittelbar berücksichtigt. |
| 2. Compiler und reine Berechnung | Typisiertes Profil, strikter Resolver, direkte atomare Expansion, linearer Evaluator und begrenzte Gründe. | Differentialtests zur unabhängigen Closure-/Fixpunktreferenz, vollständige Konzeptfälle, klare Invaliditätsdiagnosen. |
| 3. Nur intern berechnen | Integration in konsistente Backend-Snapshots; Vergleich und Performance-Messung bei deaktivierter Benutzerfunktion. | Mastery, Frontier, aktive Ziele und Ereignisse bleiben ohne Aktivierung unverändert; keine vermeintliche Abweichung zum gewöhnlichen Mastery-Abschluss als Fehler zählen. |
| 4. Vollständiger Pilotablauf | Profilkarte, explizite Auswahl, Direktprüfung, normale Speicherung, Revalidierung und korrekte Nachfolgerintegration zusammen. | Cockpit und gemeinsamer Coach liefern dieselben Ergebnisse; alle Schreib-/Reload-/Abbruchfälle sowie Fokus und Plan-Handoff getestet. |
| 5. Anbieter und reale UX | Derselbe Ablauf über jeden freizugebenden Adapter, responsive und zugängliche Oberfläche, kurze moderierte Lernendentests. | Beobachtete Verständlichkeit und tatsächliches Hostverhalten nachgewiesen; keine Freigabe eines Anbieters aus einem anderen Host ableiten. |
| 6. Kontrollierte Aktivierung | Feature-Schalter und Liste freigegebener Profile; Betriebsmetriken und Rücknahmeweg. | Freigabe des konkreten Profils, bestandene passende CI und reale Pilotabnahme. Weitere Profile durch Autorenprüfung, nicht durch automatische Massenfreigabe. |

Die interne Berechnung kann früh beginnen; eine bloß sichtbare Abschlusskarte
ohne passenden Lern-/Prüfungs- und Fortsetzungsablauf ist kein fertiger Pilot.
Generischer Level-Editor, alternative Prüfungsformenauswahl, historische
Zertifikate und komplexe Zeitplanung gehören nicht in diesen ersten Schnitt.
Die bestehenden veröffentlichten Anbieterartefakte bleiben unverändert;
neue Tool-/Projektionsfelder folgen dem jeweiligen Versions- und Releasevertrag.

Wird die Funktion abgeschaltet, bleibt jede gespeicherte Mastery erhalten.
Die UI erklärt, dass der besondere Abschlussweg vorübergehend nicht verfügbar
ist; sie meldet keinen persönlichen Misserfolg. Keine neuen Direktstarts.
Ein bereits gestarteter Versuch kann nur mit weiterhin gültigen, verfügbaren
gebundenen Inputs geordnet enden; andernfalls kontrollierter Abbruch und
Neuauswahl. Der Schalter selbst verleiht keine Ausnahme von Zugriffsprüfungen.

## 10. Test- und Abnahmeplan

### Fachlicher Kern und Datenmodell

Die vollständige Fallmatrix des
[Konzepts](../concept/skill-graph/assessment-gated-completion.md#7-recalculation-and-adoption-requirements)
wird übernommen. Besonders entscheidend sind folgende zusätzliche
Implementierungsprüfungen:

| Prüfung | Erwartung |
| --- | --- |
| Kleine vollständige DAG-Fallräume plus zufällige größere DAGs | Linearer Algorithmus und unabhängige transitive Fixpunktreferenz liefern identische Mengen. Auch Mastery auf Zwischenknoten, überlappende Regeln und Mehrfachpfade prüfen. |
| Vertauschte ID-/Eingabereihenfolge | Identische Resultate und deterministische angezeigte Gründe. |
| `Q → B → A`, nur A erlassfähig, B offen | Unterstützendes B blockiert A, ohne Zielpflicht zu werden. |
| `Q → A → B`, nur A erlassfähig, B geschützt und unterstützend | A kann entfallen; B verhindert den Abschluss nicht allein durch seine Unterstützungseigenschaft. |
| Unverändertes Profil, zusätzliche Mastery | `X_*` kann nicht kleiner werden. `I` darf kleiner werden, wenn ein zuvor entfallendes Ziel eigene Mastery erhält. |
| Gleiche atomare Erreichbarkeit aus erlaubten verschiedenen Repräsentationen | Gleicher Abschluss; Basisvalidität separat prüfen. |
| Bereits vorhandene Prüfungs-Mastery, auch vor Profilrevision | Zählt sofort; keine Zeitstempel-, Herkunfts- oder Zweitprüfungsbedingung. |
| Mastery-Korrektur oder fehlgeschlagener Recall | Neuberechnung aus tatsächlicher gemeinsamer Zielsemantik; kein gespeicherter Erlass bleibt stehen. |
| Reine SRS-Fälligkeit im heutigen Runtimevertrag | Kein eigenmächtiger Mastery-Verlust durch das Abschlussmodul. |
| Versteckte und fachübergreifende Voraussetzungen | Vollständig im Kontext und im Mastery-Read, ohne Vergrößerung des Zielnenners. |
| Reiner Read oder entfallende Vorbereitung | Keine Mastery-Schreiboperation und kein Lernereignis; weder Zielrollen noch Graphkanten ändern sich. |

Für den zukünftigen Java-Code dient die einfache transitive Referenz nur im
Test. Der vorhandene
[mathematische Checker](../concept/skill-graph/latex/check-assessment-model.py)
liefert zusätzliche fachliche Referenzfälle; er beweist nicht die neue
Integration. Tests dürfen nicht bloß denselben optimierten Algorithmus zweimal
ausführen.

### Integration und UX

- Erfolgreicher Write mit anschließendem Reload zeigt denselben Abschluss;
  Timeout, Rollback und Replay erzeugen keinen vorzeitigen Abschluss oder
  doppelten Erfolg.
- Direktstart funktioniert auch außerhalb der normalen Frontier und des
  bisherigen Fokus; Reload und spätere Bewertung erhalten genau die gebundene
  Ausnahme. Ungültige Sitzung, fremdes Ziel oder geändertes Profil werden
  abgewiesen; keine pauschale Aufhebung von Voraussetzungen.
- Zwei Tabs, paralleler Scopewechsel und Curriculumgenerationswechsel liefern
  entweder einen konsistenten neuen Stand oder einen erklärten Konflikt.
- Die Generationstests verwenden Neustart/neue Instanz entsprechend der
  heutigen Paketgrenze. Alte Aktionsbindungen dürfen auf der neuen Generation
  nicht weiterlaufen.
- Eine im Coach gestartete Direktprüfung bleibt nach Cockpit-SSE/Reload aktiv
  und in ihrer besitzenden Sitzung bewertbar; ein anderer Coach darf sie weder
  automatisch entfernen noch übernehmen.
- Bewusste Hilfe oder freiwillige Vertiefung übersteht Reload. Wird laufende
  Pflichtarbeit entbehrlich, bleiben Eingabe und abzugebende Leistung erhalten;
  nach einer Entscheidung gibt es keine wiederholte Wechselaufforderung.
- Ein bestandener Prüfungsabschluss führt weder Autopilot noch Plan-Handoff in
  entfallende Pflichtarbeit. Bewusste Vertiefung noch nicht gemeisterter Ziele
  bleibt möglich; bereits geschaffte Prüfungen verlangen keinen Neustart.
- Nach Misserfolg ohne Mastery-Write beendet erst eine angenommene neutrale
  Folgeaktion den Prüfkontext. Kein Fehlstatus wird dafür übertragen; ein neuer
  Versuch verwendet frische technische Berechtigungen.
- Leere Frontier, Profilabschluss, gewöhnlicher Fokusabschluss und
  Curriculumabschluss bleiben unterscheidbar. Bei mehreren Fokuswurzeln wird
  keine unabhängige Wurzel verloren.
- Mastery-Anzeige und Globalstatistiken zählen keine Erlasse. Keine zusätzlichen
  Wochenpunkte, Quoten oder fiktiven Lernzeitersparnisse.
- Abschlusskarte funktioniert ohne Lernplan; bei vorhandener Planung vermeidet
  die sichtbare Pause widersprüchliche Pflichtaufforderungen. Rückkehr lädt den
  aktuellen Plan, ohne eine Terminverschiebung zu behaupten.
- Mobile Ansicht, Tastatur, Screenreader, langsames Netz und Wiederaufnahme
  werden mit dem realen Backend geprüft. Lösungen erscheinen nur im vorhandenen
  autorisierten Prüfungsablauf.
- Coach-Verträge prüfen Zustimmung vor Fortsetzung und Bilderanzeige,
  strukturierte erlaubte Eingaben und die vorhandene Sitzungsisolation.
  Lokale Tooltests ersetzen keine beobachtete Hostprüfung.

Ein kleiner moderierter Pilot, beispielsweise mit fünf bis acht Personen,
prüft insbesondere: Verstehen sie den Unterschied zwischen ihrem erreichten
Lernziel und der für diesen Abschnitt entfallenden Vorbereitung? Finden sie
Direktprüfung und normale Hilfe? Verstehen sie, warum eine spätere Aufgabe
diese Kompetenz wieder benötigt? Wiederkehrende Missverständnisse werden vor
der Ausweitung durch Text-/Ablaufänderungen und erneute Beobachtung behoben.
Das ist ein Verständlichkeitstest, kein Wirksamkeitsnachweis.

Betriebsmetriken erfassen Berechnungsdauer, Cachebelegung, technische
Ungültigkeitsgründe und konkurrierende Schreibkonflikte in begrenzten
Kategorien. Keine Chattexte, Antwortinhalte oder neue personenbezogene
Prüfungs-/Erlasshistorie für Analytics anlegen.

## 11. Durchgeführte Entwurfsprüfung und verbleibende Freigaben

Der Entwurf wurde in getrennten Durchgängen gegen fachliche Semantik,
Backend-/Coach-Integration und Cockpit-UX geprüft. Daraus wurden insbesondere
folgende Korrekturen übernommen:

| Befund | Im Plan berücksichtigte Verbesserung |
| --- | --- |
| Direkte Verbraucherkanten allein übersehen offene indirekte Verbraucher hinter Mastery. | Propagation von `blocked` auch durch bereits gemeisterte Zwischenknoten. |
| Eine vollständig gespeicherte transitive Relation kann quadratisch wachsen. | Direkte atomare Adjazenz plus topologischer Durchlauf; Expansion und Compilerkosten separat messen. |
| Ein Start-Bypass überlebt die vorhandene Revalidierung nicht. | Gebundener Prüfkontext und gemeinsame Prüfung bei Start, Read, Capability und Write. |
| Ein reiner UI-Filter stoppt Autopilot und Plan-Handoff nicht. | Profilentscheidung vor jeder automatischen Nachfolgerauswahl. |
| Sichtbare Mastery-Projektion unterschlägt unterstützende Ziele. | Gemeinsamen Resolver für den vollständigen Kontext verwenden. |
| Fälligkeits- und Prozentannahmen würden eine zweite Mastery-Semantik schaffen. | Bestehende Abweichungen explizit behandeln; keine profilinternen Schwellen oder Fälligkeitsregeln. |
| Drei Statusfarben könnten wie drei Lernzielzustände wirken. | Binäre Zielanzeige; entfallende Arbeit nur als benannter Kontextzusatz. |
| Lernendenweites aktives Ziel trifft auf sitzungsgebundene Direktprüfung. | Cockpit-Anbieterstart konkret gebunden; globale Anzeige und private Fortsetzungsberechtigung getrennt. |
| Freiwillige Vertiefung könnte beim Reload verschwinden; Pläne könnten widersprüchlich mahnen. | Stabile Navigationsabsicht für die gewählte Arbeit und sichtbar pausierte Plansteuerung im Pilot. |
| Konsistenz und Generationswechsel waren noch zu offen beschrieben. | Gemeinsamer Learner-Lock für den Snapshot; feste Runtimegeneration je Prozess statt zusätzlichem Hot Reload. |
| Das Backend kennt einen Misserfolg ohne Write nicht; gemeisterte Prüfungen sind keine normalen Frontier-Ziele. | Neutrale angenommene Folgeaktion beendet den Ablauf; bewertete Wiederholung gemeisterter Prüfungen bleibt ein eigener späterer Übungsmodus. |

Zur algorithmischen Entwurfsprüfung wurde der lineare Durchlauf unabhängig
gegen transitive Closure plus Fixpunkt verglichen: alle 1.099 topologisch
beschrifteten DAGs mit ein bis fünf Knoten und alle Mastery-/Eligibility-Mengen
(1.065.508 Kombinationen), zusätzlich 600 zufällige, umbenannte DAGs mit sechs
bis 160 Knoten und 4.800 Kombinationen, Seed `20261030`. Alle Resultate waren
identisch. Das lokale Experiment liegt unter
`tmp/skill-graph-document/check-completion-linear-plan.py`; es ist ein
Entwurfsbeleg, kein eingecheckter Runtime-Test oder Performance-Nachweis.

Vor tatsächlicher Freischaltung bleiben konkrete Produkt-/Autorenentscheidungen:
der erste Abschnitt mit seiner autoritativen Platzierung, die fachlich
freigegebenen Regeln und Aufgaben, die gemeinsame Behandlung der dokumentierten
Mastery-/Recall-Abweichungen und die für den Pilot freizugebenden Anbieter.
Keine davon wird durch neue individuelle Prüfbelege gelöst. Die beschriebenen
Kernkomponenten und ihre unabhängigen Tests können bereits vorher umgesetzt
werden; benutzerwirksame Aktivierung folgt erst dem vollständigen Pilotablauf.
