# E.2 · Kräfte am selben Körper · Vorprüfung der Umsetzung

**Stand 26. November 2026, Basis `7c921a452c`. Die Aktivierung ist geparkt.** Für W sind die Kräftebilanz, die zeichnerische und die rechnerische Hangzerlegung sowie das Reibungsmodell beschlossen. Beim Binden haben zwei Proben die vereinbarten Stoppbedingungen ausgelöst. Eine bisherige Pflicht konnte aus einem laufenden Lernplan verschwinden. Mehrere vorgesehene Länderrollen erhielten in der Projektion einen anderen Pflichtumfang als in der fachlich geprüften Quellentabelle. Der Branch enthält die Befunde und reproduzierbaren Proben. Die vier Ziele, die fünf Aufgaben und ihre Materialien stehen noch zur Umsetzung an.

## Bestehender Lernplan in Hessen

Die Probe hat den vollständigen E.2-Abschnitt in der realen hessischen G9-Oberstufensicht aufgelöst und einen Lernplan in H2 gespeichert. Erst danach wurde eine gültige befristete Testbindung geladen, die die gemischte Prüfung `22561c66` im selben Abschnitt zum freiwilligen Angebot macht. Eine bereits veröffentlichte E.2-Aufgabe mit geprüftem Material vertritt im Versuch den erforderlichen Abschluss. Der Versuch isoliert so die Wirkung der Angebotsregel auf den Lernplan. KB ist noch kein veröffentlichter Abschluss.

| Kurs und ursprüngliche Auswahl | Einheitenpilot | Vorher gespeichert | Alter Plan nach Umschaltung, wirksam und fällig | Neu gespeicherter Vollplan |
|---|---|---:|---:|---:|
| GK, kompletter Abschnitt | an | 32 | **31, Mischklausur entfallen** | 31 ohne Mischklausur |
| GK, kompletter Abschnitt | aus | 32 | 32 mit Mischklausur | **32 mit Mischklausur** |
| GK, Klausur zusätzlich ausdrücklich gewählt | an oder aus | 32 | 32 mit Mischklausur | 32 mit Mischklausur |
| LK, kompletter Abschnitt | an oder aus | 33 | 33 ohne Mischklausur | 33 ohne Mischklausur |

Die gespeicherten Blockdaten, die Revision und die Sicherung des alten Plans blieben in allen sechs Fällen identisch. Der alte GK-Plan galt nach der Umschaltung weiter als aktuell. `effectivePlanBlocks` wendet die heutige Abschnittsregel beim Lesen auf historische Abschnitte an. Das erklärt den Verlust aus der Aufgabenliste und den Fälligkeiten. In den acht hessischen Ansichten enthält die Struktur selbst auf der Basis jeweils 29 Zielatome im GK und 28 im LK. Gespeicherte G9-Lernblöcke zählen die dort erworbenen Vorbereitungen mit. [Messwerte aller zehn H2-Fälle](learner-plans.actual.json) · [Bestandszahlen je Ansicht](baseline.actual.json)

**Empfehlung für die Planregel:** Die Freiwilligkeit auf die Auflösung einer *neuen* vollständigen Abschnittswahl anwenden und die ausdrückliche Einzelwahl der Klausur erlauben. Die beim Anlegen übernommene Pflichtenliste eines bestehenden Plans bewahren. In vier Gegenproben mit beiden Pilot- und AutoPilot-Einstellungen blieb der alte Plan bei 32, die bei der Neuanlage ausdrücklich gelieferte Teilmenge bei 31 und die Einzelwahl bei 32. Der normale Auflöser liefert auf der Basis weiterhin 32. Diese Gegenprobe bestätigt, dass das Datenmodell die drei Auswahlen speichern kann. Sie belegt keine fertige neue Auswahlregel. Beim Wiedereinstieg in W sind diese Fälle mit dem tatsächlichen KB und mit der vollständigen E.2-Auswahl zu wiederholen.

## Länderrollen und freiwillige Inhalte

Die angenommene Platzmatrix enthält 512 Entscheidungen für 90 Ansichten. 105 sind reguläre Ziele, 29 Vorbereitungen, 358 freiwillige Angebote, sechs zweigabhängig und 14 Teil der länderübergreifenden Synthese. Eine Zahl bezeichnet eine Ziel-, Ansichts- und Stufenkombination. [Basis und Bindungen](baseline.actual.json)

| Erwarteter Umfang | Beobachtung an der nativen Projektion | Folgerung für W |
|---|---|---|
| Hessen, viertes E.2-Kind: Bilanz verpflichtend, G/T/F freiwillig | Ein als freiwillig beschrifteter `target` ist weiterhin reguläres Ziel. `prerequisiteOnly` mit Erwerbsplatz hat keinen sichtbaren Elternknoten. Eine erfundene Rolle `voluntary` ist schemawidrig und wird im toleranten Frontend als Ziel behandelt. | Eigenständig anwählbare freiwillige **Inhalte** brauchen eine wirksame Darstellung mit konsistenter Auswahl in Karte, Coach, Abschnittsplanung und Backend. Die Freiwilligkeitsregel für Prüfungen genügt dafür nicht. |
| Saarland, Klasse 8: G und F regulär im naturwissenschaftlichen Zweig, sonst freiwillig | Ein als NW beschrifteter Eintrag ist Ziel des gesamten vorhandenen Sek-I-Profils. Dieses Profil trägt keine Zweigauswahl. | Echten Zweigbezug der Pflicht und eine ausdrücklich bestimmte Behandlung des allgemeinen Profils vorsehen. |
| Baden-Württemberg: V2-Beleg gilt nur für die belegte Kohorte | Im vorhandenen gemeinsamen Sek-I-Profil wird ein V2-Zieleintrag allgemein regulär. Das Schema kennt Dauerprofile, die vorliegende Ansicht grenzt die V2-Kohorte damit nicht ein. | V2-Erwerb eindeutig begrenzen. Für den aufwachsenden G9-Jahrgang fehlt das amtliche V3-Original als Freigabegrund. |
| Mecklenburg-Vorpommern, Klasse 10 | Ein J10-Ort in der unteren Ansicht und der vorhandene E10-Ort in den anderen Ansichten ergeben in der Probe je einen sichtbaren Erwerbsort. | Die Platzierung ist im bestehenden Strukturmodell möglich. |

Eine Beschriftung wirkt nicht auf den erfassten Pflichtumfang. Eine Vorbereitung wiederum setzt fachlichen Bedarf voraus. Ein zusätzliches `scope.branch` oder `scope.cohort` scheitert am heutigen Schema. Eine eigene Auswahlfunktion kann diese Grenzen zukünftig abbilden. Der Zweig, die Ausgabe und die Rückwirkung auf noch laufende Pläne müssen dabei über die Produktkomponenten hinweg denselben Geltungsbereich haben. [Native Projektionsprobe](content-roles.actual.json) · [Schemaproben](role-schema.actual.json)

## Gemeinsamer Bilanzabschluss

Eine einzelne stufenübergreifende KB-Identität kann als gewöhnliche Prüfungsaufgabe in allen acht hessischen Kindstrukturen verwendet werden. In der Probe genügte das Bestehen aller übrigen Ziele bei offenem KB in keiner der acht Ansichten zum Abschluss. Das automatische Abschlussmodell konnte den isolierten Kindumfang nach KB allein als erledigt behandeln. Damit entsteht keine individuell nachgewiesene Beherrschung der übrigen Inhalte. Eine eigene geprüfte Lerneinheit mit repräsentativer Abschlussanrechnung wäre ein anderer Vertrag und bräuchte ihren eigenen Einstieg. Für KB stehen die tatsächliche Aufgabenerstellung, die gemeinsame fachliche Deckung und die unabhängigen Blindbewertungen noch aus. Das hessische Kurvenfahrtziel verlangt eine quantitative Analyse mit Zentripetalkraft. Sein Wortlaut verlangt keinen Reibungskoeffizienten. [KB-Gegenproben](kb-ordinary.actual.json) · [Geprüfter Stand](baseline.actual.json)

## Reproduktion

Die Frontendprobe läuft mit `app/node_modules/.bin/tsx` und `probes/content-roles.mts` vom Repository-Stamm. Sie verändert ausschließlich Kopien im Speicher. Die Backendprobe benötigt die Testwerkzeuge des Projekts. Aus dem Verzeichnis `backend`:

```bash
w_evidence=../curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-v1
export TASK_W_PLAN_SCRATCH=$(mktemp -d)
./gradlew -I "$w_evidence/probes/plan.init.gradle" checkTaskWStoredPlans
python3 "$w_evidence/probes/plan-results.py" "$TASK_W_PLAN_SCRATCH" > "$TASK_W_PLAN_SCRATCH/results.json"
cmp "$TASK_W_PLAN_SCRATCH/results.json" "$w_evidence/learner-plans.actual.json"
```

Die Qualitätsprüfung des aktiven Katalogs ergab Physik M7 und beide Stufen M4. Die vollständigen Freigabeläufe des geplanten Umsetzungspakets, Bild- und Kartenprüfungen sowie die erneute Bindung der Mathematik-Nachweise gehören zur späteren Aktivierung. [Inventar](inventory.actual.json)
