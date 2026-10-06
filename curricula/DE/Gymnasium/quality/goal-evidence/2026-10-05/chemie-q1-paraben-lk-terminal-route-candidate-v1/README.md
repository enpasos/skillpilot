# Inaktiver Kandidat: HE-Q1-LK-Paraben-Terminal

Dieser Vorschlag bleibt vollständig **inaktiv**, mit `examData.reviewStatus: needs_review`, ohne neue fachliche Abschlüsse oder menschliche Freigaben. Root stellt für den commitfähigen Zwischenstand den geschützten Chemie-Vorgänger **104/376** wieder her; die wissenschaftlichen acht Chemie-Kandidaten und dieser zusätzliche Terminalvorschlag tragen weiterhin **0** zum aktuellen Abschlussstand bei. Biologie **67/383** bleibt separat aktiv. Der Zieltext hier stammt aus dem noch nicht akzeptierten Chemie-378-Integrationskandidaten, nicht aus dem wiederhergestellten aktuellen Vorgänger.

## Belegtes Routenproblem und minimaler Vorschlag

Das Kandidatenziel `0d59b62e-d3f9-5969-b961-0c5e26316c04` (Verwendung von Parabenen beurteilen, LK) hatte keinen abhängigen atomaren Knoten. Die drei bestehenden konkreten Q1-Terminals prüfen Fruchtsaft/Sorbinsäure/Ascorbinsäure, Propanol/Propanon oder Seife/Wasserhärte. Keines trägt einen tatsächlich vorhandenen Parabenfall. Eine zusätzliche `requires`- oder `coveredGoalIds`-Zeile dort würde kein belegtes Assessment herstellen und GK verändern.

Der neue Übungs-/Assessment-Kandidat `4cb74d76-99f1-5264-b1e3-448cda47b005` soll deshalb als einzelnes Kind unter dem bestehenden Q1-Übungscluster `4beeb141-2a59-5093-b599-e513403221b0` erscheinen. Er hat nur das Parabenen-Ziel als `requires` und als `coveredGoalIds`, ausschließlich LK/DE-HE, Phase Q1, und vorgeschlagene Semantik `practiceAssessment`. Er ist kein neues curricularAtomic-Ziel. Der Cluster-Vorschlag ändert nur `contains` und das entsprechende Kindergewicht. Es werden keine bestehenden Terminalaufgaben um Parabencoverage ergänzt und keine BY-Quellen erfunden.

Der zusammenhängende Fall verlangt eine begründete Wahl zwischen zwei fiktiven Gelrezepturen: Molekülstruktur und Löslichkeit, vollständige Keimdaten, datierte interne Höchstmengen und Materialgrenzen entscheiden gemeinsam. Die Rezeptur mit dem kleineren Keimwert erfüllt die Löslichkeitsbedingung bei 10 °C nicht. Alle Zahlen und Verwendungsbedingungen sind ausdrücklich erfundene didaktische Fallannahmen; sie sind keine realen Messwerte, amtlichen Grenzwerte oder Sicherheits-/Rechtsfreigaben.

## Autorenseitige Korrekturen nach Root-Befunden

Root beanstandete den Schluss von zwei Temperaturstützstellen auf den ganzen Bereich. Material und Lösung nennen jetzt ausdrücklich eine **fiktive lineare Interpolationsannahme** zwischen 10 und 22 °C. Ohne diese Annahme wäre der Zwischenbereich unbelegt; auch mit ihr wird keine reale Produktbeständigkeit behauptet.

Root beanstandete außerdem, dass bei 15/24 Punkten ein Bestehen ohne die zentrale Bewertungsaufgabe möglich wäre. Der ungeprüfte Vorschlag nutzt jetzt 21/24 Punkte; außerhalb von Aufgabe 3 sind höchstens 16 erreichbar, sodass mindestens 5/8 Punkte dort erforderlich sind. Dieser numerische Entwurf ist noch keine Bestätigung ausreichender fachlicher Nachweise oder von Mastery. Die Prüfung des Bewertungsmaßstabs und der nötigen Rückkopplung bleibt offen. Diese beiden Autorenkorrekturen sind keine unabhängige Freigabe.

## Bindungen und tatsächlicher Prüfstatus

Der bestehende native CQR-Routenchecker zählt atomare Kinder der konfigurierten Praxiscluster als Terminalendpunkte. Unter dem vorgeschlagenen Q1-Cluster ergibt sich daher der beabsichtigte direkte Pfad `0d59…6c04 → 4cb74…b005`; die Motivation liegt weiter in der vorhandenen Ester-/Sorbinsäure-Voraussetzungskette. Eine künftige Anwendung muss den tatsächlichen nativen Pfad und die HE-LK-Sichtbarkeit bestätigen.

Der aktuelle native GoalBook-Code nimmt neue externe Nachfolger in `externalReverseRequires` auf. Daher ist **als zu prüfende Bindungsfolge** insbesondere die unveränderte Parabenen-Seite `0d59…6c04` betroffen; zwei unabhängige gezielte D-Kontextprüfungen wären vor einem aktuellen D-Abschluss erforderlich. Der native positive-understanding-evidence-v2-Eigeninput enthält die eigenen Zieleigenschaften, Voraussetzungen, Kinder und Bilder, keine umgekehrten Nachfolger; seine Erhaltung ist gezielt zu prüfen, ohne eine neue fachliche P-Freigabe zu behaupten. Der Q1-Praxiscluster benötigt eine aktuelle semantische Strukturbindung, die neue Assessment-ID eine geprüfte `practiceAssessment`-Entscheidung. Alle Science-, Bild-, Quellen- und Human-Einträge bleiben historische bzw. bestehende Nachweise.

**Kein erfolgreicher nativer Kandidaten-Footprint liegt vor.** Zwei kurze, inaktive In-memory-Helferversuche sind fehlgeschlagen: zunächst ein falsch angenommener Importpfad, anschließend ein nicht zugelassener vorgeschlagener `decisionBasis` in der geschlossenen Semantic-Kind-Schema. Der Importpfad wurde korrigiert; das Schema und sämtliche Checker blieben unverändert. Der verbleibende Helfer ist ein dokumentierter fehlgeschlagener Prototyp, kein bestandener Check und kein autorisierender Nachweis. Root ordnete anschließend den guarded Rollback und den Abschluss ausschließlich dieses inaktiven Kandidaten an. Es gab keine D3-Integration, keinen vollständigen QS-/Buildlauf und keine aktive Dateiänderung durch diesen Autor.

Die separate fehlende BY-Quellenbindung der Quantifizierungssplit-Ziele `3d6699ae-ebbd-5a55-8798-b809a9d74f0a` / `18819a59-2442-530f-a7c3-26755398ec66` wird hier nicht gelöst. Das bestehende allgemeine Sek-II-Capstone `14577339-9e0c-5b44-8e47-91e1a4947367` importiert Voraussetzungen über `d3cd250f-5221-589d-aa1c-44a4692d1acb`; die Compiler-Closure verbreitet Clusterkinder. Eine bloße positive HE-applicability ist keine Sperre gegen diesen BY-Import und liefert keine Sourcecoverage. Dieser Befund bleibt separat offen.

## Dateien

- `paraben-lk-terminal.goal-template.candidate.json`: vollständiger inaktiver Task, Lösungshorizont, Punkteschlüssel und wahrheitsgemäßer Status.
- `existing-q1-practice-cluster.exact-append.candidate.json`: genaue Strukturänderung als Vorschlag.
- `terminal-material-task-and-solution.candidate.md`: lesbarer Aufgaben-/Lösungstext.
- `measure_native_terminal_scope_and_bindings.mts`: dokumentierter unfertiger, fehlgeschlagener In-memory-Prototyp; kein Reviewbeleg.
- `provisional-native-helper-failures.actual.receipt.json`: tatsächliche fehlgeschlagene Toolausgänge und Root-Stoppentscheidung.

Weitere Kandidatenarbeit ist beendet. Eine künftige Wiederaufnahme setzt die getrennte Lösung der Quellen-/Scopebefunde, unabhängige Inhalts-/Kontextreviews und bestandene betroffene Checks voraus. Erzeugung, Materialkorrektur und ein neuer Routenentwurf sind keine maschinelle oder menschliche Freigabe.
