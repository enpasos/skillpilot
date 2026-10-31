# Umsetzungsplan: Assessment-gated Completion

Aktueller Implementierungs- und Betriebsstand:
[technischer Pilot](assessment-gated-completion-pilot.md).

Ergänzende Produktentscheidung vom 31. Oktober 2026: Fachlich geprüfte
Prüfungsabkürzungen sind ohne technische Freischaltung standardmäßig verfügbar.
Lernende können sie bei den übrigen Cockpit-Einstellungen pro SkillPilot-ID
abschalten (`useAssessmentShortcuts`, Standard `true`). Diese Präferenz steuert
Cockpit und Coach gemeinsam; Mastery bleibt der einzige gespeicherte
Lernziel-Ergebniszustand. Die Auswahl eines konkreten Lernabschnitts bleibt
bewusst. Fachliche Reviewbindungen und die dokumentierten Laufzeitkapazitäten
werden durch die Standardaktivierung nicht erweitert.

Die ergänzende Entscheidung zum direkten Einstieg am selben Tag trennt
**Ansehen** und **Starten**: Cockpit und Claude erhalten vor der Profilwahl
eine begrenzte Vorschau konkreter, aktuell verfügbarer Prüfungen. Eine
ausdrückliche Prüfungswahl wählt Profil und Prüfung atomar; bloßes Ansehen
ändert keine Navigation. Claude unterstützt diese Wahl innerhalb seiner
bestehenden Sitzung. ChatGPT und Gemini sind vorerst zurückgestellt. Bei ihrer
Umsetzung gilt derselbe vollständige Ablauf mit direktem Prüfungsstart innerhalb
der jeweiligen Sitzung; ein Cockpit-Link als abweichende Ersatzfunktion ist
nicht vorgesehen. Dazu benötigen sie jeweils ihren geprüften Adaptervertrag,
passende Coach-Anweisungen und eine eigene Host-Abnahme.
Konkrete Bedienung und Prüfpfade stehen im oben verlinkten Pilotdokument.

Stand: 30. Oktober 2026. Grundlage ist der Code bei `8aee10595` und das
[fachliche Konzept](../concept/skill-graph/assessment-gated-completion.md).
Dieses Dokument beschreibt die empfohlene Implementierung einschließlich
deutscher Cockpit- und Coach-Dialoge. Es implementiert oder aktiviert die Funktion
nicht. Die fachliche Semantik bleibt im Konzept; hier stehen Architektur,
Integrationsentscheidungen, Reihenfolge und Abnahmebedingungen.

Die deutsche Fassung dient der gemeinsamen Produktentscheidung und den hier
konkret ausgearbeiteten deutschen Lerndialogen. Technische Verträge und neue
Schemas behalten englische Bezeichner. „Curriculares Level“ bezeichnet den
Lernabschnitt; Personalisierung Level 2 bestimmt das Personal Curriculum,
Level 3 den aktuellen Fokus. Das Zielfeld `level` beschreibt Schwierigkeit.
Im Folgenden entsprechen Zielpflicht, Verbraucher und entfallende Arbeit den
Konzeptbegriffen `target`, `consumer` und `waived work`.

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
| Dort: `resolveActiveGoalInvalidationReason`, `resolveGlobalAssessmentFocus`, `isGlobalAssessmentGoalWithoutExplicitFocus` | Die zusätzliche Fokusprüfung für `release.kind=offer` muss einen gültigen Direktkontext sowohl bei persistenten Änderungen als auch in lesenden Projektionen erhalten. |
| Dort: `maybeAutoActivateFrontierGoal`, `applyLearningPlanHandoff` | Profilpflichten vor der Kandidatenwahl berücksichtigen; bei Abschluss keine automatische Wahl eines anderen Profils oder Fokusweitung. |
| Dort: `computeEffectiveRequires`, `collectEffectiveRequires` | Kompatibilitätscode toleriert fehlende Referenzen und entfernt Selbstbezüge. Als strikter Profilvalidator ungeeignet; fachliche Auflösung gemeinsam nutzen, Validierungsfehler ausdrücklich erhalten. |
| Dort: `computeEffectivePrereqMastery`, `computeScopedPrerequisiteMastery`, `isCoreForPrereqs` | Die bestehende Clusterzufriedenheit bevorzugt bestimmte Kinder anhand von Tags. Diese dokumentierte Abweichung gehört nicht in die formale atomare Expansion. |
| Dort: `getMasteryProjectedToGoalIds`, kanonische Projektion und SRS-Overlay | Mastery über **alle** Ziele des Verpflichtungskontexts lesen, auch versteckte, fachübergreifende und `prerequisiteOnly`-Ziele. Die normale sichtbare Mastery-Projektion reicht nicht. |
| `backend/.../curriculumpackage/CurriculumRuntimeSnapshot.java` | Unveränderliche Paketgeneration mit `generationSha256` als Ausgangspunkt für revisionsgebundene Profilkompilierung. |
| `backend/.../ai/CoachToolFacade.java`, `CoachStateProjection.java` | Gemeinsame fachliche Aktionen und begrenzte Coach-Projektion; Anbieteradapter berechnen keinen Abschluss selbst. |
| `OpenAiDeV1McpSessionCoordinator`, `ClaudeV1SessionCoordinator`, `GeminiV1SessionCoordinator` | Bereits vorhandene äußere Transaktionen und Sitzungs-/Lernendensperren; exakte Write-Replays werden vor dem erneuten fachlichen Aufruf behandelt. |
| `Learner`, `LearnerDataDTO`, `LearnerService.exportLearner` / `importLearner` | Private Workflowfelder explizit von Serialisierung und signiertem Export ausschließen; neue Entitätsfelder sind nicht automatisch privat. |
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

Für numerische Bestandswerte verwendet dieser gemeinsame Kompatibilitätsresolver
nach kanonischer Projektion und regulärem Zieltyp-Overlay die heute maßgebliche
Entscheidung `value >= 0.9`, nicht `value == 1.0`. Der Evaluator erhält nur das
boolesche Ergebnis. Die Schwelle ist eine dokumentierte Bestandsabbildung,
kein neuer Mastery-Grad; die spätere Datenbereinigung wird gemeinsam umgesetzt.

Bei Lernkarten unterscheiden sich Dokumentation und Implementierung ebenfalls:
Die heutige Laufzeit bestimmt Mastery durch bestandenen Verified Recall aller
erforderlichen Karten. Erneute SRS-Fälligkeit allein entfernt sie derzeit nicht.
Der normale Recall-Ablauf bietet bereits bestandene Karten nicht erneut an;
der Ergebnisendpunkt weist einen solchen Retest zurück. Ein regulärer
fehlgeschlagener Retest ist daher heute kein erreichbarer Weg zum Verlust einer
bereits bestehenden Mastery. Der dokumentierte Zielvertrag
nennt zusätzlich die Fälligkeit. Siehe
[Node Types](../concept/skill-graph/node-types.md#due-and-mastery-semantics).
Das Abschlussmodul übernimmt die **gemeinsame Laufzeitentscheidung** und führt
keine eigene Fälligkeitsregel ein. Vor Freischaltung eines betroffenen Profils
müssen dieser Vertrag und die Darstellung in Cockpit und Coach konsistent
festgelegt sein. Geschützte Lernkartenziele sind niemals erlassfähig.

Zwei weitere Bestandsrisiken sind vor einem betroffenen Pilot zu beheben:

- `loadSrsDeckCards` / `loadSrsState` können technische Fehler als leere Daten
  liefern; das Overlay macht daraus `0.0`. Ein fehlender bisheriger
  Lernendenzustand bedeutet tatsächlich „noch nicht verifiziert“. Ein fehlendes,
  ungültiges oder unerwartet leeres Pflichtdeck sowie unlesbare gespeicherte
  Daten bedeuten dagegen, dass der Mastery-Snapshot nicht zuverlässig gebildet
  werden kann. Der gemeinsame Resolver muss diese Ursachen unterscheiden.
  Die Abschlussberechnung liefert dann `unavailable` ohne `complete`-Wert und
  ohne scheinbar wieder geöffnete Zielpflichten. Es entsteht kein dritter
  gespeicherter Mastery-Status.
- Der öffentliche Client-State-Write ersetzt heute Kartenprozessdaten
  einschließlich `verifiedRecall`; das Cockpit synchronisiert eine lokale
  Gesamtkopie mit neuem Client-Zeitstempel. Dadurch können bereits geschriebene
  Recall-Ergebnisse überschrieben oder durch Clientdaten vorgegeben werden.
  `verifiedRecall` wird deshalb ausschließlich durch autorisierte serverseitige
  Recall-, Import- und gegebenenfalls Reset-/Korrekturpfade gepflegt.
  Öffentliche Übungssynchronisation
  erhält eine eigene Feldauswahl und übernimmt den aktuellen serverseitigen
  Recall-Anteil unter Lernendensperre; sie darf ihn weder erzeugen noch löschen.
  Ein Client-Zeitstempel ersetzt keine Konfliktprüfung. Geänderte
  Übungsdaten werden gegen eine erwartete Revision geprüft oder als einzelne
  Übungsaktionen auf den aktuellen Zustand angewendet; veraltete Vollkopien
  dürfen auch das SRS-Scheduling eines gerade bestandenen Recall nicht ersetzen.

Interne Recall-Schreibpfade und öffentliche Übungssynchronisation müssen dafür
getrennte fachliche Einstiege erhalten, auch wenn sie dieselbe Kartentabelle
verwenden. Abschnitt 6.4 berücksichtigt die dazugehörige Importgrenze.
Diese Arbeit schützt die vorhandenen Kartenprozessdaten; sie führt keine
zusätzlichen Zielergebnisse oder Prüfungserfolgsbelege ein.

## 3. UX: ein verständlicher Abschluss, weiterhin einfache Lernziele

### 3.1 Eine Abschlusskarte im Cockpit

Die Karte ist auch ohne aktivierten Lernplan verfügbar. Der Einstieg liegt
beim jeweiligen angebotenen Lernabschnitt: „Abschlussweg ansehen“ zeigt Umfang
und Möglichkeiten; „Diesen Abschlussweg nutzen“ aktiviert das Profil. Bei nur
einem passenden Profil ist kein zusätzlicher Auswahlassistent nötig.
„Zur normalen Lernansicht“ beendet die Profilsteuerung, ohne Ziele oder Mastery
zu ändern. Ein Profilwechsel wird mit neuem Namen und Umfang angeboten und
beendet eine laufende Direktprüfung erst nach bewusster Annahme kontrolliert.
Während einer laufenden Direktprüfung lautet die Aktion entsprechend
„Prüfung beenden und zur normalen Lernansicht wechseln“ und benötigt diese
bewusste Annahme; ein gewöhnlicher Ansichtswechsel beendet sie nicht beiläufig.
„Für heute beenden“ pausiert den Ablauf und behält die Profilwahl für die
Rückkehr; es speichert keinen Abschlussdatensatz.

Die Karte benennt den tatsächlichen Umfang, etwa „Mathematik – Lernabschnitt
Funktionen“. „Schuljahr abgeschlossen“ ist nur zulässig, wenn das Profil dieses
Schuljahr mit allen genannten Fächern tatsächlich umfasst. Technische
Profilkennungen, Graphrevisionen und Fixpunktrunden bleiben aus der normalen
Darstellung heraus.

Beispiel bei zehn gleich gewichteten Zielpflichten und einer separat geprüften
Regel, die bereits nach einer der beiden Pflichtprüfungen drei Vorbereitungsziele
entfallen lässt:

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
Beim einfachsten Profil mit nur einer Regel `S_r = Q_i` entsteht dieser
Teilerlass erst nach allen Pflichtprüfungen. Der Pilot bevorzugt diese einfache
Regel, sofern seine fachliche Prüfung sie trägt.

Die Karte zählt ausschließlich `|E ∩ T_i|`, `|I ∩ T_i|` und `|T_i \ X_*|`.
Unterstützende Ziele in `I \ T_i` werden gegebenenfalls im Begründungsdetail
genannt; sie erhöhen keinen Zähler und werden nicht als neue sichtbare Ziele
in den Level-2-Baum eingefügt.

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

Für die Expansion gelten die vollständigen relevanten `Atoms`-Mengen aus
[Graph Definition §9.1 und §12.2](../concept/skill-graph/graph-definition.md#91-available-next-goals).
Der aktuelle `isCoreForPrereqs`-Filter gehört zur **Clusterzufriedenheit** in
`computeEffectivePrereqMastery` und `computeScopedPrerequisiteMastery`, nicht
zur Beziehungsauflösung in `computeEffectiveRequires`. Er darf im Compiler
keine erforderlichen Atome aufgrund fehlender `GK`-Tags entfernen. Ebenso
darf der Compiler `V_H` nicht auf sichtbare Level-2-Ziele kürzen.

Gemeinsame Referenz- und Vererbungsauflösung bedeutet keine identischen
Auswertungsumfänge: Die normale Frontier behält ihre ausdrücklich
fokusbezogenen Regeln; der Abschluss verwendet den vollständigen
Verpflichtungskontext. Vor Pilotfreigabe wird auf gleicher fachlicher Atombasis
geprüft, ob die dokumentierte Clusterheuristik die beteiligten Routen verändert.
Eine betroffene Abweichung wird separat angeglichen oder ein nachweislich
unbeeinflusstes Pilotprofil gewählt. Die neue Berechnung verschärft nicht
beiläufig die allgemeine Frontier.

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

### 4.1 Authoring, Paketvertrag und CI

Für den ersten Gymnasium-Pilot werden folgende **neue** Orte vorgesehen:

- `curricula/DE/Gymnasium/completion-profiles/<profile-id>.json` für Profile;
- `contracts/assessment-completion/v1/profile.schema.json` für den versionierten
  Datenvertrag mit `schemaVersion`, Profilrevision und `title.de` / `title.en`;
- `contracts/assessment-completion/v1/fixtures/` für gemeinsame gültige und
  ungültige Beispiele mit erwarteten Kontexten und Berechnungsergebnissen.

Die bestehende TypeScript-Authoringpipeline prüft Schema und Referenzen.
Die verbindliche fachliche Expansion und Regelvalidierung übernimmt der
Java-Compiler, den CI gegen denselben Fallkorpus ausführt. Damit gibt es keine
zweite unabhängig gepflegte fachliche Erlasslogik im TypeScript-Validator.
Die statische Regelfreigabe nennt Profil-, Scope- und Aufgaben-/Rubrikrevision.
Vorhandene M-/CQR-Prüfungen gelten weiterhin; M7 allein genehmigt keine Regel.

Der Paketmodus benötigt vor Aktivierung eine versionierte Discovery- und
Capability-Erweiterung. Der aktuelle V1-Runtimekatalog hat geschlossene
Schema-/Capability-Vorgaben; ein neues Profil darf nicht bloß als unbekanntes
Feld in ein altes Paket gelangen. Schema-Trustsatz, Manifest/Digests, Loader,
Exportvalidator und die vereinbarte JSON/FWU-Äquivalenz werden gemeinsam
erweitert. Nur unterstützende Consumer aktivieren die Profile. Bestehende
Pakete werden nicht umetikettiert; im Paketmodus gibt es keinen stillen
Rückgriff auf Repositoryprofile.

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
| `CompletionApplicationService` | Konsistenten Kontext lesen, kompiliertes Profil beziehen, einmal je unverändertem Inputstand auswerten und für die Projektionen wiederverwenden. |
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

Die bestehenden Coachfelder `completion.scopeComplete` und
`completion.curriculumComplete` sowie REST `goals.scope_completed` behalten
ihre eigenen Mastery-Bedingungen. Ein wahrer Profilabschluss setzt sie nicht auf
`true`. Ebenso bleibt die normale Frontier fachlich unverändert; die aktive
Empfehlungsmenge ist eine ausdrücklich benannte Projektion daraus.

Die Gültigkeitsangabe beschreibt die Berechnung, keinen zusätzlichen Zielstatus:

| Ursache | `calculationStatus` und Verhalten |
| --- | --- |
| Passendes Profil, vollständige gültige Eingaben | `valid`; `complete` und disjunkte Zielzahlen berechnen. |
| Profil passt nach tatsächlicher Scopeänderung nicht mehr, oder Level hat keine Pflichtprüfung | `notApplicable`; gewöhnlicher Abschlussvertrag beziehungsweise passende Neuauswahl. |
| Eine notwendige Wahl ist noch offen | `unresolved`; Wahl im zuständigen Ablauf klären. |
| Fehlende Graphreferenz, Zyklus oder trotz behaupteter Anwendbarkeit unerlaubte Zielpflicht | `invalid`; Konfigurationsdiagnose. Ein Authoringfehler ist kein bloß abgewähltes Profil. |
| Benötigte Eingaben technisch nicht lesbar, etwa defektes Mastery-relevantes Deck oder Timeout | `unavailable`; keine aktuelle Abschlussaussage. Einen bekannten alten Stand nur als veraltet kennzeichnen. |
| Nur die Aufgabe einer offenen Prüfung ist momentan nicht startbar | Berechnung bleibt bei gültigen Ergebnisinputs `valid`; Startverfügbarkeit separat erklären. Bereits vorhandene Prüfungsmastery zählt. |

### 6.2 Konsistenter Read und bestätigter Write

Curriculumgeneration, aufgelöste Auswahl, Profil und Lernendenstand werden für
eine Auswertung festgehalten. Dafür gibt es zwei ausdrücklich getrennte
Transaktionspfade:

- **Schreibabläufe und bereits koordinierte MCP-Aufrufe:** Die vorhandene äußere
  Transaktion mit `LearnerRepository.findBySkillpilotIdForUpdate` und der
  jeweiligen Sitzungssperre bleibt der gemeinsame Konfliktbereich. Scope,
  Revision, Mastery und Recall werden darin gebündelt gelesen. Nach einem Write
  muss die Berechnung dessen eigenen, noch nicht committierten Nachzustand sehen.
- **Eigenständige fachlich und technisch lesende Abfragen:** Eine wirksame
  äußere `@Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)`-
  Grenze sammelt alle dynamischen Eingaben einschließlich ausgegebener Revision
  in einem PostgreSQL-Snapshot. Auf diesem Pfad gibt es kein `FOR UPDATE` und
  keine Aktivitäts-/Workflow-Schreiboperation. Die unveränderliche Eingabekopie
  kann anschließend außerhalb der Transaktion ausgewertet werden.

Die aktiven MCP-Koordinatoren besitzen bereits gewöhnliche äußere Transaktionen
mit Sperren. OpenAI aktualisiert dort zusätzlich die technische Aktivitätszeit.
Das innere `getCoachLearnerState(readOnly = true)` macht diese äußere Transaktion
nicht nachträglich SQL-read-only. Fachliche Seiteneffektfreiheit bedeutet hier
weiterhin: keine Mastery-, Fokus-, Ziel- oder Autopilotänderung durch die
Projektion. Eine pauschale Umstellung des Koordinators auf Read-only würde auch
seine technischen Verantwortlichkeiten verändern.

Die neue eigenständige Read-Grenze muss tatsächlich über einen Spring-Proxy
oder explizites Transaktionsmanagement beginnen. Eine innere `REQUIRED`-
Annotation übernimmt die äußere Transaktion; ein Selbstaufruf erzeugt keine
neue Proxy-Grenze. Deshalb genügt ein zusätzliches `REPEATABLE_READ` an der
bestehenden Servicemethode nicht. Auch ein `REQUIRES_NEW`-Read mitten im Write
ist ungeeignet, weil er dessen noch nicht committierte Änderungen nicht sieht.
Siehe [Spring-Transaktionspropagation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html)
und [Spring-Transaktionsannotation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html).

PostgreSQL `REPEATABLE READ` bindet Datenbankreads an den Snapshot der ersten
fachlichen Anweisung. Das sichert weder den neuesten Stand zum Antwortzeitpunkt
noch externe Curriculumdaten; deren unveränderliche Generation bleibt zusätzlich
gebunden. Eine tatsächlich serverseitig read-only laufende Transaktion darf
keine `FOR UPDATE`-Sperre gegen gewöhnliche Tabellen anfordern. Siehe
[PostgreSQL-Transaktionen](https://www.postgresql.org/docs/current/transaction-iso.html)
und [PostgreSQL-Read-only-Prüfung](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/executor/execMain.c).

Alle relevanten Schreiber müssen denselben Sperr-/Revisionsvertrag einhalten
und fachlich zusammengehörige Änderungen atomar speichern. Eine lesende
Projektion darf nicht den nebenwirkungsreichen allgemeinen `getLearnerState`-
Pfad zum Beschaffen ihrer Eingaben verwenden. Kompilierung und externe Zugriffe
gehören vor die Sperre; DTO-/UI-Aufbereitung bleibt möglichst kurz. Die Antwort
nennt die Revision ihres Snapshots, jede spätere Aktion validiert erneut.

**Integration im Pilot:** `levelCompletion` wird Teil der gemeinsamen
State-Antwort. `LearnerUiController` ruft heute einen mutierenden `GET /state`
auf. Deshalb steht die Berechnung dessen State-Pipeline bereits vor
Plan-Handoff und Autopilot zur Verfügung; alle ausgegebenen Felder beschreiben
den endgültigen Stand dieser Transaktion. Ändert sich dabei ein fachlicher
Input der Berechnung, wird diese für den endgültigen Stand neu erstellt.
Eine zweite Completion-Abfrage neben einem mutierenden State-Read wäre kein
gemeinsamer Snapshot. Ein späterer vollständig lesender Einstieg muss den
gesamten relevanten Status gemeinsam projizieren, statt einen zusätzlichen
Pollingkanal einzuführen.

Bestehende Mastery-Schreibaktionen behalten Transaktion, Autorisierung,
Idempotenz und Lernereignisse. Die resultierende Abschlussberechnung verwendet
den erfolgreich geschriebenen Stand. Bei Rollback gibt es weder neue Mastery
noch eine Erfolgsantwort mit daraus abgeleitetem Abschluss. Ein Replay erzeugt
keinen zweiten Lernerfolg und keine zusätzlichen Erlasseinträge.

**Ein Replay wird über die konkrete Anfrage erkannt, nicht über vorhandene
Mastery.** Die drei Session-Koordinatoren behandeln bereits dieselbe Sitzung,
Operation, Anfrage-ID und kanonisch identische Argumente vor einem erneuten
fachlichen Aufruf. Sie liefern die vorhandene technische Antwort nur unter
den weiterhin gültigen Sitzungs-, Revisions- und jeweiligen Replaybedingungen
zurück. Dadurch muss ein Replay nach erfolgreichem Write und Nachfolgerwahl
die inzwischen beendete Direktprüfung nicht nochmals aktivieren.

Ein beliebiger neuer `setMastery(q)`-Aufruf ist kein Replay, nur weil q bereits
Mastery hat. Der aktive-Ziel-, Frontier-, Zieltyp- und Bewertungszugang darf
nicht durch einen vorgezogenen `isMastered(q)`-Erfolg übersprungen werden. Für
einen Pfad ohne vorhandene Anfrageidentität gilt keine stillschweigende
Replaygarantie; nach unsicherer Antwort wird aktueller Zustand gelesen. Eine
inzwischen geänderte Revision oder abgelaufene Sitzung begrenzt auch exakte
Replays nach dem bestehenden Vertrag. Aktuelle Prüfungs-Mastery zählt trotzdem
sofort für den Abschluss; ein neuer Prüfungserfolg wird nicht verlangt.

Auch Profilwahl, Start, Abbruch und aktive Kontextwechsel verwenden diese
Sperre und die gemeinsame Revision. Beim erfolgreichen Prüfungs-Write gehören
Kontextende und Nachfolgerentscheidung zum selben transaktionalen Stand.

Die konkrete Lernendenrevision ist `Learner.coachStateRevision`, auf den
Anbieterantworten als `stateVersion` projiziert. Ein GET erhöht sie nicht
zwangsläufig, sondern bei tatsächlich ausgeführten Heilungen oder
Navigationsmutationen. Auch akzeptierte Kartensynchronisation kann sie erhöhen;
OpenAIs bloßes `touchActivity` erhöht sie nicht. Während einer gültigen
Direktprüfung darf ein Hintergrundrefresh keine solche Heilung oder
Autopilot-/Fokusänderung auslösen. Die vorhandene revisionsgebundene
Bewertungs-Capability bleibt damit bei reinem Refresh gültig.

Eine echte parallele Änderung bleibt revisionspflichtig. Nach Konflikt werden
aktueller Zustand und eine neue zulässige technische Bewertungsfreigabe geladen;
alte Capabilities werden nicht pauschal verlängert. Bei weiterhin gleicher
gültiger Aufgabe und Besitzerbindung kann die bereits besprochene Arbeit im
normalen Bewertungsablauf weiterverwendet werden. Ein bloßer Refresh verlangt
keine neue fachliche Prüfung; ein geänderter Aufgaben-/Scopevertrag muss dagegen
erneut geprüft werden. Es wird kein zweiter persistierter Abschlusszähler
eingeführt, um die bestehenden Revisionsgrenzen zu umgehen.

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
Der bewusste Direktzugang gilt **auch bei aktivem `strictMode`**: Nur für das
gewählte q entfällt die didaktische `requires`-Sperre. Gewöhnliche Empfehlungen
behalten ihre jeweilige Normal-/Striktsemantik.
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

Die Alternative „Fokus auf genau q und danach zurück“ wurde geprüft. Im
Normalmodus kann sie bereits Zugang eröffnen, weil Voraussetzungen außerhalb
des Fokus nicht blockieren. Sie erfüllt aber weder den allgemeinen Direktzugang
im Striktmodus noch automatisch den Fall nichtglobaler Prüfungen ohne direkte
`requires`. Außerdem benötigt die Rückkehr Konfliktregeln für zwischenzeitliche
Fokusänderungen und mehrere Wurzeln. Der gebundene Direktkontext wird deshalb
für den beschriebenen Produktumfang beibehalten. Ein engerer Pilot mit
Fokuswechsel wäre eine ausdrücklich eingeschränkte Variante. Pflichtprüfungen
werden nicht bloß wegen ihres Offer-Zweigs aus `Q_i` entfernt.

Ein kurzlebiger `DirectAssessmentContext` bindet diese Ausnahme an Lernenden,
autorisierte Sitzung, Profil-/Curriculumrevision und Prüfungsziel. Er ist
technischer Ablaufzustand, kein Versuchsergebnis und keine neue Ergebnistabelle.
Bestehende Capability- und Sitzungsmechanismen werden wiederverwendet. Die
Ausnahme muss in Aktivierung, späteren Zustandsabfragen, Aufgabenfreigabe,
Bewertungs-Capability und Speicherung gleich geprüft werden. Ein vom Client
übergebenes `bypassPrerequisites=true` ist kein gültiger Ersatz.

Konkret verwenden `resolveActiveGoalInvalidationReason` und `getLearnerState`
dieselbe Direktkontextprüfung neben `isGoalOutOfPlannedScope` und
`isGlobalAssessmentGoalWithoutExplicitFocus` / `resolveGlobalAssessmentFocus`.
Eine gültige Direktprüfung unter `release.kind=offer` darf weder aus dem
gespeicherten aktiven Ziel noch nur aus der lesenden Antwort verschwinden.
Ohne diese Bindung bleibt `ACTIVE_GOAL_CLEARED_ASSESSMENT_FOCUS` wirksam.
Die Ausnahme betrifft ausschließlich didaktische Fokus-/Voraussetzungsgates.
Andere heutige Gründe der Zielbereinigung bleiben wirksam: bereits erreichte
Mastery, ein im Personal Curriculum ungültiges Ziel oder fehlende fachliche
Aufgaben-/Hard-Check-Freigabe. Jeder Grund wird getrennt geprüft, statt eine
gültige Direktbindung als pauschales „Ziel immer behalten“ zu behandeln.
`isNonGlobalExamWithoutDirectPrerequisite` bleibt ein Filter der normalen
Frontier. Die spezifische Direktaktion entscheidet auch bei fehlenden direkten
`requires` anhand von `Q_i` und ihren eigenen Zugangsbedingungen.

`CoachToolFacade.getExamEvaluation` und `setMastery` erhalten den intern
verifizierten Aufrufkontext. Der bestehende Recovery-Zweig von `setMastery`,
der bei `requiredAction == "setActiveGoal"` das angefragte Ziel automatisch
aktiviert, darf eine verlorene Direktbindung nicht wiederherstellen oder in
einen gewöhnlichen Start umdeuten. Auch dieses Verhalten wird am fachlichen
Einstieg geprüft; eine zusätzliche LLM-Anweisung allein wäre unzureichend.

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
Write; aus dessen Ausbleiben kann der Server das Gesprächsergebnis nicht ableiten.
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

### 6.4 Speicherort, Serialisierung und Import

Im Pilot liegt ein kleines typisiertes `CompletionWorkflowState` am bestehenden
`Learner`-Aggregat, abgebildet auf neue nullable Workflowspalten. Es enthält
die gewählte Profilreferenz, die Navigationsabsicht des **aktuellen** aktiven
Ziels und höchstens einen `DirectAssessmentContext`. Ein neuer
[Liquibase-Changeset](liquibase.md) erweitert das Schema; ein weiterer
Migrationstechnologiewechsel ist dafür nicht erforderlich.

Diese Abläufe liegen in der gemeinsamen Datenbank, damit Reload und mehrere
Backendinstanzen denselben Zustand sehen. Änderungen erfolgen unter derselben
Lernendensperre und Revision wie `activeGoalId`. Die private Besitzerbindung
besteht aus Anbieterkennung und interner Sitzungsreferenz beziehungsweise Hash;
der Klartext der `learningSessionId` wird nicht gespeichert. Die zugehörige
Sitzung muss bei jeder Aktion weiterhin tatsächlich gültig sein. Das Objekt
enthält keine Antworten, Scores, Fehlversuche, Erlassmengen oder Abschlüsse.

Weder das ältere lernendenweite `Learner.clientState` noch der pro Ziel
gespeicherte `LearnerClientState` ist der passende Ort für diese serverseitige
Berechtigung. Wichtig für die Implementierung: `LearnerDataDTO` enthält derzeit
die `Learner`-Entität selbst; deren gewöhnliche Jackson-Properties fließen in
den signierten Export ein. Die separate pro-Ziel-Tabelle wird dort dagegen
nicht exportiert. Neue private Felder direkt an `Learner` sind daher **explizit**
von Serialisierung und Deserialisierung auszuschließen, beispielsweise durch
`@JsonIgnore` am gesamten Workflowobjekt und passende DTO-Allowlisten.
Öffentliche Antworten verwenden nur die beabsichtigte sichere Projektion.

Für den ersten Schnitt werden alle drei neuen Workflowangaben vom portablen
Format ausgeschlossen. Bestehende signierte Dateien müssen weiter verifizierbar
bleiben. Ein erfolgreicher Import leert Profilwahl, aktuelle Navigationsabsicht
und Direktbindung atomar und revalidiert das bisherige aktive Ziel; ein ungültiger
oder fehlgeschlagener Import verändert sie nicht. Reset und ein wirksamer
Level-2-Wechsel verwenden dieselbe Bereinigung; ein bewusster Profilwechsel
ersetzt die Auswahl und beendet die alte Direktbindung. Kein Import darf eine
Sitzungsberechtigung wiederherstellen. Die spätere Portabilität einer reinen
Profilpräferenz wäre ein eigenes versioniertes Formatvorhaben.

**Kartenimport als vorgelagerte Korrektur:** Das Frontend exportiert heute
separate SRS-Daten zusätzlich im unsignierten `clientData.srsState` und spielt
sie über den öffentlichen Client-State-Write zurück. Ein Schutz von
`verifiedRecall` muss diesen bestehenden Pfad deshalb ausdrücklich ersetzen.
Für neue Exportformate werden die vorhandenen autoritativen Kartenprozessdaten
in einen versionierten, serverseitig signierten Import-/Exportvertrag
aufgenommen. Gewöhnliche lokale Übungsdaten bleiben davon unterscheidbar.
Alte Dateien werden vor jeder Mutation auf sichere Wiederherstellbarkeit
geprüft: Ein nicht sicher vollständig wiederherstellbarer Import wird erklärt
abgelehnt, statt vollständig bestätigten Import mit verlorener Recall-Mastery
zu liefern oder unsignierte Passbehauptungen zu übernehmen. Bestehende bereits
gespeicherte Ergebnisse werden nicht rückwirkend neu qualifiziert. Dieses
Format-/Kompatibilitätspaket ist vor Freigabe eines Profils mit betroffenen
Lernkartenzielen in `V_H` abzuschließen.

Bei Lernendenlöschung verschwinden die vorgeschlagenen Workflowspalten mit
der `Learner`-Zeile. Der Löschtest umfasst außerdem Sitzungsbindungen und
abgeleitete Caches. Sollte später eine eigene Workflowtabelle gewählt werden,
braucht sie einen getesteten Cascade-Fremdschlüssel oder eine explizite Löschung
in `LearnerLifecycleService.deleteLocked`; die bloße Existenz einer neuen
Tabelle erzwingt nicht beides.

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

Die Pause ist **abgeleitet**, keine zusätzliche persistierte Flagge:
`effectivePlanFollowing = followLearningPlans && !completionRouteOwnsNavigation`.
Die bewusste Profilwahl besitzt die Navigation bis zum Verlassen der Route,
auch wenn deren Berechnung vorübergehend nicht verfügbar ist. Die aktuelle
Nutzerpräferenz `followLearningPlans` wird weder überschrieben noch später aus
einem alten Snapshot zurückgesetzt. Diese gemeinsame Entscheidung erreicht
Planstatus (`automaticResume`, `resumeAvailable`), Fortsetzungsaktionen,
Handoff, Autopilot und die bisher vom rohen Flag abhängige Behandlung eines
unvollständigen Mastery-Writes. Ein direkter Misserfolg erzeugt weiterhin keinen
solchen Teil-Mastery-Write. Beim Profilende gilt die dann aktuelle Präferenz.

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

Die Generationsbindung umfasst **Repository- und Paketmodus**. Repository ist
der aktuelle Standard, kein optionaler Legacy-Randfall. Der bestehende
`OpenAiDeCurriculumRevisionProvider.repositoryRevision` liefert einen nutzbaren
deterministischen Hashansatz, der anbieterneutral herausgelöst und um alle
laufzeitrelevanten Profil-/Regelinputs ergänzt wird. Er liest heute JSON und
`.json.snapshot` und schließt `quality` aus; Freigabeinformationen, die
Aktivierung steuern, müssen daher zusätzlich explizit gebunden werden.

Ein Hash allein reicht nicht: Der vorhandene OpenAI-Hash entsteht einmal im
Konstruktor, während `LandscapeService.ensureFresh` und `GoalMappingService`
Repositorydaten unabhängig nachladen können. Der Pilot verwendet deshalb eine
für die Prozessdauer unveränderliche Repository-Eingabe und bindet Hash,
Landschaften, Mappings, Decks und Profile an genau diesen geladenen Stand.
Der Betrieb stellt diese Eingabe unveränderlich bereit. Unerwartete Änderungen
führen für die Profilroute zu `unavailable`, bevor ein unabhängiger Reload
unter alter Revision weiterarbeitet. Ein neuer Stand wird kontrolliert durch
Prozessstart aktiviert; ein freier Hot Reload ist nicht Teil dieses Schnitts.

Auch die aktuelle Paketaktivierung ist eine **Prozessstartgrenze**:
`CurriculumRuntimeSnapshotProvider` bietet noch keinen koordinierten Hot Reload
aller abgeleiteten Services. Der Pilot verwendet eine unveränderliche
Runtimegeneration pro Prozess. Neustart mit neuer Generation verwirft
Compiler-Caches und alte kontextgebundene Aktionen. Für zusammengehörige Reads
und Aktionen muss das Deployment eine stabile Generation sicherstellen; im
Pilot werden alte Instanzen beim Wechsel aus dem Routing genommen und geordnet
beendet. Fremde Generationsbindungen führen zu einem erklärten Neuladen,
niemals zu automatischen Refresh-Schleifen zwischen verschieden alten Instanzen.
Die Funktion führt keinen eigenen Hot-Reload-Mechanismus ein.

Kompilierung möglichst beim Laden/Validieren einer Curriculumgeneration;
ungewöhnliche Scopekombinationen einmalig bei Bedarf. Ein begrenzter Cache nach
Speicherverbrauch verhindert unbegrenzte Kombinationen. Gleichzeitige Anfragen
derselben Kompilierung teilen deren Ergebnis. Kein Redis, keine neue Queue
und keine inkrementell gepflegte Erlassdatenbank im ersten Schnitt.

Mastery einschließlich Recall wird gebündelt gelesen. Pro Request wird einmal
je unverändertem Inputstand ausgewertet und das Ergebnis wiederverwendet;
ändert sich der Input im Ablauf, wird vor der endgültigen Antwort neu berechnet.
Keine Datenbankabfrage pro Knoten,
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
| 1. Gemeinsame Begriffe und Pilotumfang | Realer begrenzter Abschnitt; autoritatives Scope-Binding; vollständige Pflichtprüfungen; geprüfte Regeln; einheitliche Mastery-Semantik und Clusterabgleich. Für betroffene `V_H` zusätzlich Recall-Schutz, Fehlerunterscheidung und sicherer Kartenimport. | Keine ungeklärte Pflichtauswahl oder Zweitqualifikation; bestehende Mastery zählt; keine verborgene Clusterabweichung oder ungeschützter SRS-Sync. |
| 2. Compiler und reine Berechnung | Typisiertes Profilartefakt, strikter Resolver, direkte atomare Expansion, linearer Evaluator, begrenzte Gründe und gemeinsame Repository-/Paketgenerationsbindung. | Gemeinsamer Fallkorpus, Differentialtests, vollständige Konzeptfälle, klare Diagnosen und nachgewiesen passende Hash-/Runtimegeneration. |
| 3. Nur intern berechnen | Integration in konsistente Backend-Snapshots mit wirksamen äußeren Transaktionsgrenzen; Vergleich und Performance-Messung bei deaktivierter Benutzerfunktion. | Echte PostgreSQL-Prüfung für eigenständigen Read und bestehende Coordinator-/Write-Transaktion; keine fachlichen Zustandsänderungen ohne Aktivierung. |
| 4. Vollständiger Pilotablauf | Profilkarte, private Workflowpersistenz, Direktprüfung, normale Speicherung, Revalidierung einschließlich Offer-Fokus, begrenzter Recovery-Pfad und Nachfolgerintegration zusammen. | Cockpit und Coach konsistent; echte Replays, Export/Import, Sitzungsbesitz, Schreib-/Reload-/Abbruchfälle sowie Fokus und Plan-Handoff getestet. |
| 5. Anbieter und reale UX | Derselbe Ablauf über jeden freizugebenden Adapter, responsive und zugängliche Oberfläche, kurze moderierte Lernendentests. | Beobachtete Verständlichkeit und tatsächliches Hostverhalten nachgewiesen; keine Freigabe eines Anbieters aus einem anderen Host ableiten. |
| 6. Kontrollierte Aktivierung | Feature-Schalter und Liste freigegebener Profile; Betriebsmetriken und Rücknahmeweg. | Freigabe des konkreten Profils, bestandene passende CI und reale Pilotabnahme. Weitere Profile durch Autorenprüfung, nicht durch automatische Massenfreigabe. |

Für Schritt 3 wird über eine explizite interne Pilotkonfiguration ein geprüftes
Profil für einen passenden Scope ausgewählt. Das setzt keine aktive Profilwahl
beim Lernenden und verändert keine Vorschläge. Gespeichert werden nur
aggregierte Laufzeiten, technische Fehlerklassen und Vergleichszähler; keine
individuellen Abschlussstände, Erlasshistorien oder Gesprächsinhalte.
Fachliche Detailvergleiche verwenden synthetische Testdaten oder flüchtige
Auswertung innerhalb des autorisierten Requests.

Die interne Berechnung kann früh beginnen; eine bloß sichtbare Abschlusskarte
ohne passenden Lern-/Prüfungs- und Fortsetzungsablauf ist kein fertiger Pilot.
Generischer Level-Editor, alternative Prüfungsformenauswahl, historische
Zertifikate und komplexe Zeitplanung gehören nicht in diesen ersten Schnitt.
Die bestehenden veröffentlichten Anbieterartefakte bleiben unverändert;
neue Tool-/Projektionsfelder folgen dem jeweiligen Versions- und Releasevertrag.

**Coach-Kompatibilität ist eine Aktivierungsbedingung.** Die lernendenweite
Profilwahl darf eine bereits laufende alte Sitzung nicht still mit neuer
Semantik versorgen. Unterstützung wird gegen einen serverseitig bekannten,
freigegebenen Adapter-/Workflowvertrag bei jedem Einstieg und jeder Aktion
geprüft, auch nach einer späteren Aktivierung im Cockpit. Ein Modell kann diese
Unterstützung nicht selbst behaupten; die aktuelle Backendversion beweist auch
nicht die tatsächlich geladene Coach-Anleitung. Fehlt eine verlässliche
Vertragsbindung, zeigt die Sitzung einen Wechsel-/Pausenhinweis und startet
keine weitere Pflichtarbeit aus der ungefilterten alten Frontier. Zur normalen
Route geht es erst nach bewusster Auswahl. Die Datenprojektion und erlaubten
Aktionen müssen dieses Verhalten erzwingen; ein unbekanntes Zusatzfeld allein
genügt nicht.

Die Schritte 4–5 folgen der verbindlichen
[Beta- und Veröffentlichungsstrategie](../deploy/claude-beta-chatgpt-release-strategy.md):
gemeinsamer Kern, reale Claude-Beta, stabiler Kandidat, anschließend fokussierte
ChatGPT-Integration und gesonderte Veröffentlichung. Schritte 2–3 können
anbieterneutral vorangehen. Gemini erhält eine eigene Vertrags- und
Hostfreigabe. Frühere konkrete Desktop-Veröffentlichungen ersetzen diese
Abnahme für die neue Funktion nicht.

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
| Autorisierte Mastery-/Kartenstatuskorrektur | Neuberechnung aus tatsächlicher gemeinsamer Zielsemantik; kein gespeicherter Erlass bleibt stehen. Der derzeit ausgeschlossene Retest bestandener Karten wird nicht als bestehender Ablauf vorausgesetzt. |
| Reine SRS-Fälligkeit im heutigen Runtimevertrag | Kein eigenmächtiger Mastery-Verlust durch das Abschlussmodul. |
| Defektes Pflichtdeck oder unlesbarer gespeicherter Kartenstatus | `unavailable`, ohne erfundene Mastery-Korrektur; fehlender bisheriger Lernerzustand bleibt davon unterscheidbar. |
| Versteckte und fachübergreifende Voraussetzungen | Vollständig im Kontext und im Mastery-Read, ohne Vergrößerung des Zielnenners. |
| Erforderliches Cluster mit gemeistertem GK-Kind und offenem LK-Kind | Compiler behält beide erforderlichen Atome, auch bei `prerequisiteOnly`-Unterstützung. Fokusunterschiede und die bestehende Clusterheuristik werden getrennt geprüft. |
| Reiner Read oder entfallende Vorbereitung | Keine Mastery-Schreiboperation und kein Lernereignis; weder Zielrollen noch Graphkanten ändern sich. |

Für den zukünftigen Java-Code dient die einfache transitive Referenz nur im
Test. Der vorhandene
[mathematische Checker](../concept/skill-graph/latex/check-assessment-model.py)
liefert zusätzliche fachliche Referenzfälle; er beweist nicht die neue
Integration. Tests dürfen nicht bloß denselben optimierten Algorithmus zweimal
ausführen.

### Integration und UX

- Mit echtem PostgreSQL und tatsächlichen Spring-Proxy-Aufrufen die wirksame
  Isolation und Read-only-Einstellung prüfen: eigenständiger Read ohne
  `FOR UPDATE`, bereits koordinierter MCP-Read und Nachzustand im Write.
  Parallele Änderungen dürfen keine Revision mit fremdem Ergebnis mischen;
  eine Schreibtransaktion sieht ihre eigenen Änderungen. H2 allein belegt
  diesen Vertrag nicht.
- Erfolgreicher Write mit anschließendem Reload zeigt denselben Abschluss;
  Timeout, Rollback und Replay erzeugen keinen vorzeitigen Abschluss oder
  doppelten Erfolg.
- Exakter Replay nach Nachfolgerwahl liefert bei gültigen Bindungen die
  technische Antwort ohne erneute Facade-/Serviceausführung. Gleiche ID mit
  anderen Argumenten, neue Anfrage auf bereits gemeistertes Ziel und spätere
  Zustandsrevision werden nach ihren eigenen Verträgen behandelt. Eine
  Mastery-Korrektur darf nicht durch die Replayabkürzung verloren gehen.
- Direktstart funktioniert auch außerhalb der normalen Frontier und des
  bisherigen Fokus; Reload und spätere Bewertung erhalten genau die gebundene
  Ausnahme. Ungültige Sitzung, fremdes Ziel oder geändertes Profil werden
  abgewiesen; keine pauschale Aufhebung von Voraussetzungen.
- Zwei Tabs, paralleler Scopewechsel und Curriculumgenerationswechsel liefern
  entweder einen konsistenten neuen Stand oder einen erklärten Konflikt.
- Die Generationstests verwenden Neustart/neue Instanz entsprechend der
  heutigen Paketgrenze. Alte Aktionsbindungen dürfen auf der neuen Generation
  nicht weiterlaufen.
- Ein erforderliches `release.kind=offer`-Prüfungsziel übersteht außerhalb des
  Offer-Fokus den Direktstart und jeden Read. Ohne gültige Bindung gelten die
  bisherigen Grenzen; der Facade-Recovery-Zweig erzeugt keine neue Bindung.
  Auch erforderliche Prüfungen ohne direkte `requires` werden nur über den
  dafür autorisierten Weg angeboten.
- Eine im Coach gestartete Direktprüfung bleibt nach Cockpit-SSE/Reload aktiv
  und in ihrer besitzenden Sitzung bewertbar; ein anderer Coach darf sie weder
  automatisch entfernen noch übernehmen.
- Workflowfelder und Sitzungsbesitzer fehlen in Export und gewöhnlicher
  Entitätsserialisierung. Bestehende Signaturen bleiben verifizierbar; die
  sichere Anwendbarkeit eines Imports wird anschließend vor jeder Mutation
  gemäß dem Wiederherstellungsvertrag geprüft. Erfolgreiche Importe/Resets
  bereinigen atomar, fehlgeschlagene verändern
  keinen laufenden Ablauf. Zwei Backendinstanzen sehen dieselbe Bindung.
- Nach bestandenem Coach-Recall darf ein alter Cockpit-Sync mit neuer
  Client-Uhrzeit weder Recall noch dessen Scheduling überschreiben. Erfundene
  lokale `verifiedRecall`-Angaben erzeugen keine Mastery; der vertrauenswürdige
  interne Recall-Write funktioniert weiterhin. Alte/neue Importformate werden
  nach dem festgelegten Vertrauensvertrag behandelt, vor jeglicher Mutation.
- Direktprüfung und Bewertungsfreigabe überstehen einen reinen Cockpit-Refresh
  ohne neue Revision. Eine echte parallele Karten-/Scopeänderung invalidiert
  veraltete Aktionen und führt in die kontrollierte Wiederaufnahme.
- Repositorymodus: Profile, Mappings und Decks stammen aus derselben gebundenen
  Generation. Eine unerwartete Dateiänderung darf nicht unter altem Hash in
  eine aktive Berechnung gelangen. Paketmodus: unbekannte Capability wird
  abgewiesen, kein Repository-Fallback.
- Aktivierung im Cockpit während einer alten Coach-Sitzung führt zum erklärten
  Kompatibilitätshinweis, nicht zu einer ungefilterten Pflichtempfehlung. Die
  gemeinsame Vertragsprüfung gilt auch für bereits begonnene Sitzungen.
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
- Eine während der Profilroute geänderte `followLearningPlans`-Präferenz wird
  beim Profilende respektiert; kein gespeichertes altes Flag wird restauriert.
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
| Konsistenz und Generationswechsel waren noch zu offen beschrieben. | Bestehende koordinierte Transaktionen verwenden; eigenständige Reads erhalten eine wirksame Snapshotgrenze. Feste Runtimegeneration je Prozess. |
| Das Backend kennt einen Misserfolg ohne Write nicht; gemeisterte Prüfungen sind keine normalen Frontier-Ziele. | Neutrale angenommene Folgeaktion beendet den Ablauf; bewertete Wiederholung gemeisterter Prüfungen bleibt ein eigener späterer Übungsmodus. |

Zur algorithmischen Entwurfsprüfung wurde der lineare Durchlauf unabhängig
gegen transitive Closure plus Fixpunkt verglichen: alle 1.099 topologisch
beschrifteten DAGs mit ein bis fünf Knoten und alle Mastery-/Eligibility-Mengen
(1.065.508 Kombinationen), zusätzlich 600 zufällige, umbenannte DAGs mit sechs
bis 160 Knoten und 4.800 Kombinationen, Seed `20261030`. Alle Resultate waren
identisch. Der unabhängig reproduzierbare Prüfer liegt unter
[scripts/check_assessment_completion_linear.py](https://github.com/enpasos/skillpilot/blob/main/scripts/check_assessment_completion_linear.py).
Er vergleicht die direkte `blocked`-Propagation mit einer expliziten
transitiven Closure und simultanen Fixpunktiteration, benötigt nur die
Python-Standardbibliothek und liest keine Lernendendaten:

```bash
python3 scripts/check_assessment_completion_linear.py
```

Er ergänzt den vorhandenen mathematischen Konzeptchecker. Die eigenständige
Ablage hält die neue Implementierungsprüfung vom bisherigen LaTeX-Buildvertrag
getrennt. Beide bleiben Entwurfsbelege, keine Runtime- oder Performance-Abnahme.

Vor tatsächlicher Freischaltung bleiben konkrete Produkt-/Autorenentscheidungen:
der erste Abschnitt mit seiner autoritativen Platzierung, die fachlich
freigegebenen Regeln und Aufgaben, die gemeinsame Behandlung der dokumentierten
Mastery-/Recall-Abweichungen und die für den Pilot freizugebenden Anbieter.
Keine davon wird durch neue individuelle Prüfbelege gelöst. Die beschriebenen
Kernkomponenten und ihre unabhängigen Tests können bereits vorher umgesetzt
werden; benutzerwirksame Aktivierung folgt erst dem vollständigen Pilotablauf.

### Kritische Einordnung des zusätzlichen Code-Reviews

Das Feedback aus `tmp/review-assessment-gated-completion-implementation-plan.md`
wurde erneut gegen den Code und die fachlichen Verträge geprüft. Die folgenden
Entscheidungen erläutern auch, weshalb nicht jede vorgeschlagene Korrektur
wörtlich übernommen wurde:

| Reviewpunkt | Entscheidung und Begründung |
| --- | --- |
| 2.1 Read-only und `FOR UPDATE` | Präzisiert übernommen. Eigenständige Reads brauchen eine echte äußere Snapshotgrenze; aktive MCP-Koordinatoren besitzen bereits äußere Transaktionen und Sperren. Eine innere Annotation ändert diese nicht. |
| 2.2 Replay vor aktiver-Ziel-Prüfung | Das Replayziel ist richtig, die vorgeschlagene Mastery-Abkürzung wird nicht übernommen. Die Session-Koordinatoren erkennen exakte Anfragen bereits vor dem Fachaufruf; `Mastery vorhanden` beweist keine identische Anfrage. |
| 2.3 Offer-Fokus-Invalidierung | Übernommen. Betroffene Methoden und Tests sind ausdrücklich ergänzt; auch die nur lesende Projektion muss den Direktkontext erhalten. |
| 2.4 Automatischer Recovery-Pfad | Übernommen. Verifizierter Aufrufkontext bis zur Facade und keine stillschweigende Wiederherstellung verlorener Direktberechtigung. |
| 2.5 GK-/Clusterheuristik | Teilweise übernommen. Methodenbezug korrigiert; Compiler folgt der formalen Atombasis einschließlich Unterstützung. Normale Fokus-Frontier und vollständiger Abschlusskontext behalten ihre unterschiedlichen Umfänge. |
| 2.6 Workflowpersistenz und Export | Übernommen mit Sachkorrekturen: Liquibase statt Flyway; exportiert wird die `Learner`-Entität einschließlich altem `clientState`, nicht die separate pro-Ziel-Tabelle. Deshalb ausdrücklich private Serialisierung und bestehende Signaturen schützen. |

Auch die pauschale Aussage des Reviews, Scores dürften nicht zum Core gelangen,
ist zu eng: Der bestehende Coach-Vertrag erlaubt die autorisierte numerische
Prüfungsbewertung. Sie erzeugt keinen zusätzlichen gespeicherten Zielstatus.
Die neue neutrale Beenden-Aktion benötigt weder diese Punktzahl noch Chattext.

Das anschließend bereitgestellte weitere Review wurde ebenfalls geprüft:

| Thema im zweiten Review | Berücksichtigung |
| --- | --- |
| Angebotsgates, Fokusvariante und Striktmodus (1–2) | Gründe der Zielbereinigung ergänzt; Fokusvariante abgewogen; Direktzugang auch im Striktmodus ausdrücklich gebunden. Pflichtprüfungen werden nicht zur Vereinfachung entfernt. |
| State-Antwort und Revisionswechsel (3, 7) | Gemeinsame State-Pipeline vor Autopilot/Handoff; `coachStateRevision` benannt. Reine Refreshs und tatsächliche Mutationen werden unterschieden; letztere invalidieren veraltete Capabilities weiterhin. |
| Lernkarten-Mastery (4) | Technischen Ausfall von fehlender Verifikation trennen; bereits bestandene Karten werden heute nicht regulär retestet. Servereigener Recall, Schutz vor veralteten Vollkopien und sicherer Kartenimport sind Bedingungen für betroffene Pilotkontexte. |
| Ablaufpersistenz, Planpause und Löschung (5) | Private Workflowfelder, Liquibase und Export-/Importregeln konkretisiert. Planpause aus der Profilwahl ableiten; keine redundante Flagge. Speicherung auf Learner benötigt keine neue Kindtabellenlöschung. |
| Alte Verträge und Reihenfolge (6) | Serverseitig geprüfte Unterstützung bei jedem Einstieg, erklärter Halt statt stiller alter Pflichtsteuerung; Claude-Beta vor fokussierter ChatGPT-Abnahme. |
| Profilartefakt, Fehlerzustände und Repositorymodus (8–10) | Ablage, Schema, gemeinsamer Fallkorpus, Paketvertrag und Statusursachen definiert. Bestehender Repositoryhash allein genügt wegen unabhängiger Reloads nicht; geladenen Stand gemeinsam binden. |
| Zählung, Profilende und interne Berechnung (11–12) | Nur `I ∩ T_i` zählen; besondere Regelannahme des Beispiels offengelegt. Bewusster Prüfungsabbruch beim Verlassen; interne Profilauswahl ohne Lernendenmutation und nur aggregierte Metriken. |
| Nachvollziehbarkeit und Redaktion | Linearer Prüfer aus `tmp/` an reproduzierbaren Repositorypfad übernommen; Sprachwahl, Levelbegriffe und tatsächliche DTO-Feldnamen präzisiert. |
