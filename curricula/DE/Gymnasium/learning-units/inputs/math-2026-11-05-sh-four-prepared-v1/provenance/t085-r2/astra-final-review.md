# T085 R2: unabhängiges finales Inhaltsreview

**GO für die exakten revidierten Ziel-, Aufgaben-, Lösungs-, Rubrik- und Own-Kandidaten.** Die beiden methodenneutralen Reparaturen und die reine BE-Regel sind vollständig umgesetzt. **HOLD für die Behauptung einer gut lesbaren mobilen Inline-Darstellung der gesamten neuen PNG:** Bei 360 CSS-Pixeln sind die Beschriftungen zu klein. Die mathematische Bildaussage ist richtig; die Darstellungsgrenze ändert das fachliche GO nicht. Ein kleiner historischer Quelltext-Locator ist außerdem vor einer eigenständig nutzbaren Weitergabe zu korrigieren.

Dies ist ein begrenztes unabhängiges Unit-/Contentreview. Es ist kein formaler M7-D-/P-/V-Nachweis, keine menschliche Freigabe, keine aktuelle native Scopeabnahme und kein Test sämtlicher Laufzeitaufrufer. Die Autorenselbstchecks wurden nicht als unabhängiger Beleg übernommen.

## Exakte Bindung

Geprüft wurde das Autorenmanifest `82ee75584b8053077c1c424464b1b892b4f9109f093b699901b6faf07789f38b`. Alle 34 darin gebundenen Dateien stimmen in Größe und SHA256 überein. Der vollständige physische R2-Input vor diesen Reviewausgaben umfasst zusätzlich `manifest.json` und `paths.txt`, somit **36 Dateien und 613076 Bytes**.

**Vollständiger R2-Inputhash:** `ecae1d7b51c5f3d80779810b273868779b8149a429f22ad4e7feb23d9608ee58`.

Definition: SHA256 der UTF-8-JSON-Liste aller relativen Dateipfade, Bytezahlen und SHA256-Werte, lexikografisch nach Pfad sortiert, Objektschlüssel sortiert, `ensure_ascii=false`, kompakte Separatoren. Alle Einzelpins sowie zusätzliche historische und technische Referenzpins stehen im JSON. Die vorliegende Reviewausgabe gehört nicht zu ihrem eigenen Inputhash.

Die vollständigen 34 früheren Reviewinput-Dateien von R1 und dessen ursprüngliches Manifest wurden separat erneut gegen die Pins geprüft: keine Abweichung. Der alte SH-PDF-Pin und der historische e42-Beleg-Pin stimmen ebenfalls. Die R1-Belege bleiben historisch erhalten.

## GO: normale BE-Regel und tatsächlich ausgelieferte Bewertungsdaten

`candidate.json#/newExplicitAssessment/examData/taskContent` ist bytegleich mit `tasks.md`; `solutionContent` ist bytegleich mit `rubric-and-solutions.md`. `candidate.json#/normalPass` ist objektgleich mit `rubric.json`.

Sowohl die äußeren examData-Angaben als auch `examData.scoring` tragen **30 Maximalpunkte und 26 Bestehenspunkte**. Es gibt genau sechs Schritte C1–C6 zu je 5 BE. Jede vorhandene `steps.description` enthält die zulässigen Ergebnisse 0/4/5, die Nullwertung bei einer fehlenden, sachlich falschen oder hilfsabhängigen wesentlichen Facette, die Zulässigkeit äquivalenter Nachweise und ihre drei konkreten wesentlichen Facetten. Diese Facetten stimmen mit der Rubrik und den strukturierten Autorenaufgaben überein. Es ist somit keine nur privat beschriebene Zusatzregel erforderlich, die in den bestehenden API-Feldern fehlen würde.

Die eigenständige Enumeration aller `3^6=729` zulässigen Scorevektoren ergibt **57 Bestehensvektoren, davon 56 nicht perfekt**. Die Menge ist exakt die frühere zulässige Menge der Regel „20/24 und alle Kriterien mindestens 3“, umkodiert mit 3→4 und 4→5. Für jede der 18 wesentlichen Facetten führt ihre Auslassung gemäß der Rubrik zu 0 BE im zugehörigen Kriterium; alle übrigen Kriterien zusammen erreichen höchstens 25 BE. Kein solcher Fall besteht normal. `[5,5,4,4,4,4]=26` besteht; `[5,4,4,4,4,4]=25` und jede Permutation von `[0,5,5,5,5,5]=25` bestehen nicht.

Im aktiven Kandidaten, in Aufgaben, Lösungen, Rubrik und Own-Vorschlag wurden keine alten aktiven 24/20-Angaben, 3/4-Mindestwerte oder `criterionMinimum`-/`minimumForPass`-Felder gefunden. Die historischen Gegenüberstellungen in Diff-/Nachweisdokumenten sind ausdrücklich historische Vergleiche und keine widersprüchlichen aktiven Gates. Die neue Punktedarstellung verlangt keine perfekte Gesamtleistung und erhöht den früheren zulässigen Bestehensumfang nicht nachträglich.

Die gelesene vorhandene API-Struktur `CoachToolFacade.ExamScoring` trägt `maxPoints`, `passingPoints` und Schritte mit `id`, `points`, `description`. Der gelesene Claude-Adapter prüft einen endlichen Gesamtscore im Bereich 0 bis Maximalpunktzahl und anschließend gegen die Bestehensgrenze. Die sechs Beschreibungen haben 565–687 Zeichen und passen in dessen gelesene 2000-Zeichen-Grenze; Schrittzahl und Maximalpunktsumme passen ebenfalls. **GO für die Datenform und den gewöhnlichen Totalvergleich.** Daraus folgt keine hier getestete Laufzeitfreigabe aller Provider oder Aufrufer.

Der Server prüft weiterhin den übergebenen Gesamtscore. Er leitet nicht aus einer beliebigen Zahl ab, ob die Schülerantwort alle Facetten zeigt. Die korrekte semantische Bewertung und Summenbildung bleiben Aufgabe der Rubrikanwendung. Für jeden korrekt bewerteten Versuch reicht der normale Totalvergleich aus; eine zusätzliche API oder gespeicherte Ergebnisvariable ist für diese Rubrik fachlich nicht nötig.

## GO: methodenneutrale und unveränderte fachliche Anforderungen

In C1 und T1 ist die korrekt begründete vollständige Lösungsfamilie ausdrücklich eine Alternative zu zwei numerischen Proben. Die Musterlösung belegt beide Richtungen: Jedes Paar der Familie löst die Gleichung, und jedes Lösungspaar hat diese Form. Der freie reelle Parameter begründet die fehlende Eindeutigkeit. Der eigene Graph bleibt wesentlich. Ein vollständiger allgemeiner Beweis ohne redundante Zahlenproben kann 5 BE erhalten.

In C2 und T2 ist ein äquivalenter algebraischer Nachweis zum Gesamtsystem ausdrücklich zulässig. Die Musterlösung berücksichtigt alle drei Gleichungen und führt sie korrekt auf `x+y=5; 3x=6; 0=0` zurück. Eine zusätzliche Einsetzliste wird nicht erzwungen. Das bloße Lösen von zwei Gleichungen ohne Berücksichtigung der dritten bleibt unzureichend; der eigene Graph einschließlich der vertikalen Geraden bleibt wesentlich.

Die festen Systeme wurden unabhängig mit rationaler Elimination erneut berechnet: T1 und T4 ergeben `L={(t,6−2t):t∈R}`; T2 ergibt `(2,3)`; T3 ist leer, seine paarweisen Schnittpunkte sind `(2,3)`, `(3,2)` und `(3,5)`. Bei T5 liefern die ersten beiden Gleichungen `(3,2)`; die dritte Koeffizientenzeile ist ihre Summe, deshalb ist `c=15` notwendig und hinreichend. `c=16` ist widersprüchlich. T6 unterscheidet korrekt die ganze Ebene und die leere Menge.

Der allgemeine T6-Schluss bleibt richtig: Für b≠0 lässt sich zu jedem reellen x ein y wählen; für b=0 und a≠0 ist x fest und y frei. Nichtdegeneriert sind die ursprünglichen Eingaben T1–T5. Dass beim äquivalenten Umformen von T2 eine Nullzeile entsteht, widerspricht dieser Eingabegrenze nicht. Eigenständige algebraische und grafische Anwendung, die konkreten Sonderfälle und der begrenzte Parametertransfer werden nicht durch bloßes Nachsprechen ersetzt. Es wurde kein zusätzlicher Anspruch auf beliebigdimensionale lineare Algebra eingeführt.

## GO: Identität, Vorbereitung, Own und historische Abgrenzung

Die neue gewöhnliche A `679a0aeb-9f1d-53dc-be90-a40d1aaad947` ist als gesamtes Zielobjekt unverändert. Bei Q `d79c446e-21ce-55ab-b0bc-c654d8476139` ist das gesamte Zielobjekt außerhalb `examData` unverändert. Die fachliche Definitionsgrenze, Atomicity-Begründung und der vorgeschlagene Status `no_memory_needed` sind unverändert und bleiben tragfähig; die formale M-Entscheidung wird weiterhin nicht behauptet.

Die private Unit `8729890f-b472-5bc7-8ce6-00c90d6789e8`, der Supplement-Cluster `b4bab1e5-35b2-5a8c-b74e-f674dd222a96`, seine Boundary-Semantik und die Own-/R-Abgrenzung bleiben gleich. Das Supplement-Dokument ist bytegleich. OrdinaryOwn enthält nur A; Q benötigt ihr explizites eigenes Ergebnis. e42 `e42c208d-9555-43cc-92f5-5bb4c0688726` bleibt fremde atomare Vorbereitung und wird durch diesen Vertrag nicht implizit anerkannt. Alte e42-/M-/Q-Ergebnisse erwerben weder A noch die neue Q. Die Änderung der noch unveröffentlichten Q-Rubrik stärkt keine historische Zielidentität oder bereits gültige Anerkennung.

Im Source-Dossier wurde nur die historische Statusbezeichnung geändert. Im Scope-Dossier betreffen die Änderungen ausschließlich die ausdrückliche historische Kennzeichnung von V7. Die elf dokumentierten Inputänderungen werden als beobachtete Änderungen unter separater Autorisierung beschrieben, nicht als neue native Freigabe. Ich habe daraus keine aktuelle Gleichheit der 648 V7-Inputs oder neue Scopeabnahme abgeleitet und keine allgemeine Scopeprüfung eröffnet. Die ursprünglichen 807 Ziele bleiben der historische Nenner; die neue A ist eine zusätzliche Kompetenz.

## Bild: fachliches GO, eingeschränkte Darstellungsfreigabe

Gesehen wurde das exakte neue Bild `images/sh-t085-concept-r2.png`, 2100×1260 Pixel, SHA256 `10bf9257f851e916c4eeb321d2983ef02cf36d516d7d2564b490969c5b5dbb05`. Die gezeichneten Gleichungen und Punkte sind korrekt. Der Vergleich der mathematischen Plot-/Scatter-/Achsen-Aufrufe im R1-/R2-Code ergab identische Ausdrücke; die überprüften Änderungen betreffen Titel, Schrift und Darstellung. Sichtbare Autoren-Metazeilen sind entfernt. Die Bildzahlen unterscheiden sich weiterhin von den Prüfungszahlen; das Bild ist keine freigegebene Prüfungsantwort.

Die drei Linien mit gemeinsamem Punkt schneiden sich korrekt in `(2,2)`. Beim widersprüchlichen Beispiel sind die drei markierten paarweisen Schnittpunkte `(2,2)`, `(3,1)`, `(3,3)` ohne gemeinsamen Dreifachschnittpunkt richtig. Die drei äquivalenten Gleichungen liegen auf derselben Geraden; die Nullidentität zeigt die ganze Ebene, der Nullwiderspruch keine Lösung. Die Unterscheidung ist auch sprachlich vorhanden und hängt nicht allein von Farben ab.

Zusätzlich zu `view_image` des Originals und der Autorenansicht wurde **das exakte PNG in lokalem Chromium tatsächlich bei 360, 640 und 747 CSS-Pixeln angezeigt** und jeweils als Screenshot angesehen. Das war ein isolierter PNG-Darstellungstest, kein laufender Cockpit- oder Hosttest.

- **747 px:** Beschriftungen, Gleichungen und entscheidende Schnittpunkte lesbar; kein abgeschnittener Pflichtinhalt. GO als kompakte Übersicht.
- **640 px:** ebenfalls lesbar, aber bereits dicht und mit kleinen Texten. Längere Kommentarboxen ragen teilweise über den jeweiligen Achsenrahmen, bleiben innerhalb des Bildes und überdecken keinen entscheidenden Schnittpunkt. Für komfortables Lesen ist eine vergrößerte Ansicht hilfreich.
- **360 px:** die unverändert dreispaltige Gesamtgrafik schrumpft auf 360×216 px. Gleichungen und Erklärungen haben ungefähr 6–7 px Schrifthöhe; Achsenbeschriftungen sind noch kleiner. Der grobe Unterschied zwischen den Bildern ist erkennbar, die notwendige genaue Beschriftung ist nicht hinreichend lesbar. **HOLD für eine mobile Inline-Lesbarkeitsfreigabe ohne Vergrößerung.** Ein höherer PNG-Pixelwert allein beseitigt das CSS-Skalierungsproblem nicht.

**Minimaler Restpunkt V1:** Das primäre Bild für die vorhandene Fläche vereinfachen und danach erneut konkret anzeigen. Root hat zwischenzeitlich im tatsächlichen GoalCard eine maximale Bildhöhe von 28rem ohne Zoom/Lightbox festgestellt; eine lange vertikale Stapelgrafik ist deshalb keine bereits belegte Lösung. Der von Root vorgeschlagene private R3 mit quadratischer Vierfeldübersicht der Kernfälle (eine Gleichung/viele Lösungen; drei Gleichungen/eine, keine oder viele Lösungen), großen Beschriftungen und denselben mathematischen Daten ist ein begrenzter sinnvoller Reparaturversuch, noch kein freigegebenes Bild. Die Nullsonderfälle bleiben in den geprüften Aufgaben und Texten vollständig erhalten. Es wird keine neue UI verlangt. Bis zum gezielten Bildreview darf nur die tatsächlich geprüfte Desktop-/Übersichtslesbarkeit von R2 behauptet werden. Ziel-, Aufgaben-, Punkte- und Own-Daten brauchen dafür keine weitere Änderung; dieses Inhaltsreview muss nicht von vorn wiederholt werden.

## Kleiner verbleibender Locatorfehler

`source-evidence.json#/stageWidePlacementSource/privateTextPath` lautet weiterhin `baseline/sh-source-page-26.txt`. Diese Datei existiert in R2 nicht; sie liegt im erhaltenen R1-Verzeichnis. **Restpunkt E1:** Den Locator ausdrücklich auf `../sh-t085-authoring/baseline/sh-source-page-26.txt` setzen oder seine R1-Basis unmissverständlich angeben. Das ist ein Provenienz-/Portabilitätsfehler des privaten Dossiers, kein inhaltlicher Quellenwiderspruch und kein Grund, die bereits geprüfte Kompetenz wieder zu öffnen.

Die noch ausstehenden aktuellen Source-/Scope-/Own-Bindungen, ein frischer V8-Nachweis, notwendige unabhängige formale M7-D-/P-/V-Nachweise, die tatsächliche Laufzeitprüfung der relevanten Aufrufer und menschliche Freigabe bleiben separat. Keine dieser Abnahmen wird durch dieses Review vorweggenommen. Geschrieben wurden ausschließlich die zwei privaten Reviewdateien und temporäre lokale Screenshots; keine Code-, Normdaten-, Autorenkandidaten- oder Gitänderungen.
