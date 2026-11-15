# Zweite unabhängige vollständige Mathematikprüfung

Stand: 2026-11-15T14:58:29.172802+01:00 (UTC; lokale Arbeitszeitzone Europe/Berlin). Entscheidung für den exakt versiegelten Eingang: **REVISE**. 37 Aufgaben sind in dieser Fachprüfung inhaltlich akzeptiert; 7 benötigen die unten genannten gezielten Rubrikreparaturen. Das ist eine unabhängige KI-Fachprüfung, keine menschliche Anerkennung und kein Lauf eines realen Bewerters.

Vollständig gelesen wurden 44 gewöhnliche Lernziele einschließlich DE/EN-Beschreibungen, 44 vollständige native positive P-Profile, alle 44 tatsächlichen DE/EN-Aufgaben-/Lösungspaare und alle **116 tatsächlichen bilingualen `scoring.steps[].description`-Blöcke**. Die 13 V4-SVGs und das neue SVG wurden tatsächlich gerendert und visuell geprüft; das neue Original-PNG wurde zusätzlich unmittelbar betrachtet. Die Dateibindung wurde vor und nach der Arbeit für alle 9.794 referenzierten Eingänge kontrolliert. Kein erster Prüfbericht und kein vom Autor erwarteter Akzeptanzbericht wurde gelesen. Aus Hashes oder Schemaerfolg wurden keine fachlichen Urteile abgeleitet.

Alle 44 Einzelurteile mit eigenen Herleitungen, konkreten schriftlichen Gegenantworten, Gegenbewertungen und fairen Alternativen stehen in `independent-full-review.json`. Ein Gegenbewertungswert ist eine fachliche Schreibtischbewertung des geschriebenen Textes. Er behauptet weder einen tatsächlich ausgeführten LLM-Bewerter noch ein reales Lernergebnis. Bei zurückgewiesenen schwachen Antworten wird zugunsten der Antwort angenommen, dass alle anderen Blöcke volle Punkte erhalten. Damit ist die obere Punktgrenze ein strenger Test der Nichtkompensation eines fehlenden Kerns.

## G18 — Eigene Parabelskizzen fehlen als ausdrücklicher Bewertungskern

Aufgabe `0b2c68f9-f9d4-57c1-af56-3b7d639f1631`, Primärziel `3e4032bd-4d8c-4e72-bfdd-64a34df053c9`.

Betroffen: DE **und** EN in `examData.scoring.steps[id=complete-square-and-sketch].description` sowie `steps[id=expand-downward-parabola].description`; entsprechend die Erwartungsformulierung in beiden Lösungssprachen.

Die Aufgaben verlangen zwei eigene Skizzen. Das P-Profil verlangt das Markieren von Scheitel und Achse sowie passend gekrümmte symmetrische Äste mit Punktkontrolle. Die tatsächlichen Beschreibungen nennen Ergebnisse und Punkte, die eine Skizze „stützen“, verlangen aber keine tatsächlich erstellte Skizze als geschützten Kern.

Konkrete Gegenantwort: „`f=(x−3)²−4`, Scheitel `(3,−4)`, Achse `x=3`, nach oben geöffnet, `f(0)=f(6)=5`. `g=−2x²−4x+6`, Scheitel `(−1,8)`, Achse `x=−1`, nach unten geöffnet, `g(0)=g(−2)=6`. **Ich zeichne keine der beiden Skizzen.**“ Die wörtliche Ergebnisliste kann 4+4=8/8 Punkte ergeben, obwohl die verlangte eigene Graphenleistung fehlt.

Reparatur: Pro Block eine tatsächliche eigene passende Parabelskizze mit Scheitel, Achse, Öffnungsrichtung und mindestens einem selbst überprüften weiteren Punkt schützen. Eine bloße Punkt-/Eigenschaftsliste ersetzt sie nicht. Handskizzen müssen nicht maßstäblich perfekt sein. Andere geprüfte Punkte sind vollwertig: etwa `(2,−3),(4,−3)` bei f und `(−0,5|7,5),(−1,5|7,5)` bei g. Die konkreten Musterpunkte sind Beispiele.

## F23 — Freie Ortslinienpunkte müssen ausdrücklich zulässig bleiben

Aufgabe `71169b14-8363-576e-9e51-002f51da08e3`, Primärziel `3f3557a8-7d89-4f96-8a32-e24745c34d82`.

Betroffen: DE und EN in `steps[id=horizontal-directrix].description` und `steps[id=vertical-directrix-transfer].description`, einschließlich der Interpretation der universellen Kernkappung nach den aufgeführten Beispielkoordinaten.

Der Auftrag lässt zwei seitliche Punkte frei wählen. Die Rubriken nennen jedoch nur die konkreten Musterpunkte und erklären danach jeden genannten Kern für notwendig. Eine faire alternative Erzeugung darf nicht wegen anderer Koordinaten auf höchstens 2/4 gekappt werden.

Tatsächlich gerechnete Alternative: Bei `F=(0,3), y=−3` liegen `(√12,1)` und `(−√12,1)` auf der Parabel, denn beide Abstände sind `√(12+4)=4` beziehungsweise `1+3=4`. Bei `F=(2,0), x=−2` sind `(8,8)` und `(8,−8)` gültig: beide Abstände betragen `√(36+64)=10` beziehungsweise `8+2=10`. Scheitel jeweils `(0,0)`; Achsen `x=0` und `y=0`; Öffnung nach oben beziehungsweise rechts. Dies verdient volle 8/8 Punkte.

Reparatur: Schutz der tatsächlichen Kerne Gleichabstandsbedingung, senkrechter Geradenabstand, begründet erzeugte Punkte, Scheitel/Achse und Öffnungsrichtung; Musterkoordinaten ausdrücklich nur als Beispiele behandeln. Frei gewählte andere nachgewiesene Punkte akzeptieren.

## G32 — Verlangte eigene Einheitskreiskonstruktion fehlt in den Kriterien

Aufgabe `a8dfd3ce-7e43-560c-8ac1-c8b1ee7c5547`, Primärziel `82597dfb-0ec6-4a77-abaf-e1d6bdd12041`.

Betroffen: DE und EN in `steps[id=five-sixths-pi-values].description` und `steps[id=reflection-and-full-turn-properties].description`.

Teil 1 verlangt einen selbst gezeichneten Einheitskreis; Teil 2 die Konstruktion der beiden transformierten Punkte. Die Rubrik schützt derzeit nur Koordinaten und sprachliche Beziehungen. Eine eigene Konstruktion wird nicht ausdrücklich verlangt.

Gegenantwort: „`5π/6` liegt in Quadrant II, Bezugswinkel `π/6`, also `(cos,sin)=(−√3/2,1/2)`. Aus `P=(0,6|0,8)` werden bei Spiegelung `(0,6|−0,8)` und bei einer vollen Drehung wieder `(0,6|0,8)`. Die Spiegelung erhält x und negiert y; die volle Drehung erhält beide. Daher die üblichen Geradheits-/Ungeradheits- und Periodenbeziehungen. **Einen Einheitskreis zeichne oder konstruiere ich nicht.**“ Alle aktuellen Ergebnisformulierungen sind erfüllt; 8/8 bleibt wörtlich möglich.

Reparatur: Die tatsächlich verlangte eigene Kreisfigur und Einordnung des Radianwinkels als Kern im ersten Block; eine nachvollziehbare Konstruktion der Spiegelung beziehungsweise vollen Drehung im zweiten. Eine verständliche Handskizze genügt. Keine numerische Berechnung des unbekannten θ und keine neue exakte Zeichengenauigkeit verlangen.

## F35 — Zwei Grenzen und eine zusätzliche Kurve dürfen nicht zu vier Grenzen und zwei Pflichtkurven werden

Aufgabe `5641d6c9-429d-5758-b9ba-3422b4f29950`, Primärziel `27b63e2e-6a34-483e-8e5a-fe0f49670d1d`.

Betroffen: DE und EN in `steps[id=own-decay-data-variation].description` sowie `steps[id=own-growth-data-long-horizon].description`.

Der Auftrag verlangt **zwei** konkrete Grenzen. Der erste Block listet vier Beispiele auf und erklärt anschließend jeden benannten fachlichen Kern für erforderlich. Der zweite Block spricht von „beiden Skizzen“, während der Auftrag eine eigene Skizze des ursprünglichen Modells und danach Berechnung/Vergleich des geänderten Faktors verlangt. Das darf nicht verdeckt eine zweite Pflichtskizze erzeugen.

Fairer schriftlicher Antwortausschnitt: „`M=80·2^(−t/4)`, nach 6 h `20√2≈28,284 mg`; bei 12 h genau 10 mg, erst für `t>12` darunter. Mit Halbwertszeit 5 h nach 6 h `≈34,822 mg`, also langsamer. Die eigene Kurve startet bei 80, bleibt positiv, fällt und flacht ab. Zwei Grenzen sind erneute Zufuhr und individuell unterschiedlicher Abbau.“ Das erfüllt die gefragte Zahl der Grenzen. Beim Populationsfall sind `N(3)=172,8`, `N(10)≈619,174` und mit Faktor 1,1 `≈259,374`; der numerische Vergleich und Ressourcenbezug sind erforderlich. Eine zusätzlich gezeichnete zweite Kurve ist ohne entsprechende Promptpflicht freiwillig.

Reparatur: „Mindestens zwei sachlich geeignete konkrete Grenzen; die genannten Beispiele sind keine vollständige Pflichtliste“ in beiden Sprachen. Im Wachstumsblock die geforderte eigene Originalkurve und den tatsächlichen Vergleich der geänderten Prognosen schützen, die zweite Kurve optional lassen oder sie im Auftrag ausdrücklich und fair verlangen.

## G36 — Beide geforderten Exponentialskizzen fehlen im ersten Bewertungsblock

Aufgabe `64dafd7e-2f33-5987-a927-181b1c5f529d`, Primärziel `78238608-aaaa-4d12-a9de-54f325e9cf6f`.

Betroffen: DE und EN in `steps[id=compare-positive-growth-and-negative-decay-base].description`.

Konkrete Antwort ohne jede Skizze: „f hat Definitionsbereich R, Wertebereich `(0,∞)`, Achsenabschnitt 3, steigt streng, nähert sich links 0 von oben und wächst rechts unbegrenzt. g hat Definitionsbereich R, Wertebereich `(−∞,0)`, Achsenabschnitt −2, die Kontrollwerte −4,−2,−1 bei −1,0,1, steigt streng, nähert sich rechts 0 von unten und wird links unbegrenzt negativ.“ Dazu können die anderen drei Fälle vollständig korrekt schriftlich bearbeitet werden; die vollständige schriftliche Gegenantwort steht im JSON. Der erste Block kann 4/4 und insgesamt 16/16 ergeben, obwohl die ausdrücklich geforderten beiden Skizzen fehlen.

Reparatur: Beide eigenen Kurven mit richtigem Achsenabschnitt, Lage zur x-Achse, Monotonie und Asymptotenrichtung als tatsächliche graphische Leistung schützen; bloße verbale Merkmalslisten reichen nicht. Verständliche Handskizzen und andere geeignete Kontrollpunkte akzeptieren. Der digitale Zusatzcheck bleibt optional.

## G38 — Modellierungsziel kann ohne den geforderten Zwei-Perioden-Graphen bestehen

Aufgabe `9dbb9fd3-a93f-53ca-82d6-bf0e0e16e9d9`, Primärziel `7f11ffe0-7c43-4507-9101-50374a60b0e8`.

Betroffen: DE und EN in `steps[id=ferris-wheel-height-model].description`; die zwei Fenster und ihr überarbeiteter Zeitbezug sind fachlich korrekt und müssen nicht erneut verändert werden.

Gegenantwort: „`h(t)=14−12 cos(πt/20)`, Grundniveau 14 m, Amplitude 12 m, Periode 40 s, Start im Minimum 2 m. `h(10)=14 m` ist der aufsteigende Mittelliniendurchgang; `h(20)=26 m` das Maximum. **Ich lasse die Skizze aus.**“ Zusammen mit dem vollständig richtigen Wasserfenster-Modell ergibt die wörtliche Rubrik 8/8. Das P verlangt aber konsistenten Term **und Graphen**, und der Auftrag zwei Perioden.

Reparatur: Eine eigene konsistente Skizze über zwei vollständige Perioden mit Zeiteinheit, Höhe, Minimumstart und wiederholten charakteristischen Stellen als notwendigen Kern aufnehmen. Die Sinusform `14+12 sin(π(t−10)/20)` und passende Phasen-/Vorzeichenformen sind gleichwertig. Die Skizzentoleranz darf keine Maßstabsperfektion fordern.

## G40 — Wurzelgraph konstruieren und tatsächlich vervollständigen

Aufgabe `0220bbbc-c51f-5f7c-92e6-9ea2598baf74`, Primärziel `66077296-a8f8-4645-938b-7c3424cb2f14`.

Betroffen: DE und EN in `steps[id=square-root-from-formula].description` und `steps[id=cube-root-from-partial-graph].description`.

Gegenantwort: „Bei f folgen aus `x−2≥0` die Mengen `[2,∞)` und `[1,∞)`. Die Punkte `(2,1),(3,2),(6,3)` gehören zum steigenden Graphen mit Randpunkt `(2,1)`. Bei g sind Definitions- und Wertemenge R; Kubikwurzeln nehmen jeden reellen Wert an, der Graph steigt streng, schneidet die y-Achse bei `(0,−2)` und setzt sich links fort. **Ich zeichne f nicht und ergänze den abgeschnittenen g-Graphen nicht.**“ Die aktuellen Beschreibungen sind reine Eigenschaften-/Punktlisten; 8/8 bleibt möglich. P und Auftrag verlangen das tatsächliche Konstruieren beziehungsweise Ergänzen.

Reparatur: Den selbst erzeugten f-Graphen aus begründeten Punkten und die tatsächlich ergänzte linke g-Hälfte schützen. Der linke Ast muss zum gegebenen rechten Teil passen, etwa durch die berechneten Punkte `(−1,−3)` und `(−8,−4)`; diese konkreten Punkte sind nicht alternativlos. Ein abgeschnittener Bildrand darf nicht zum künstlichen Definitionsrand werden.

## Weitere geprüfte Alternativen ohne zusätzlichen Blocker

- Aufgabe 22: Bei einem nichtdegenerierten Rechteck ist `(0,10)` ein sachlich korrekter Seitenlängenbereich; `[0,10]` kann mit zugelassenen degenerierten Randfällen benutzt werden. Beide führen zum inneren Maximum 25 m² bei 5 m.
- Aufgabe 37: Der erste Graph kann als `2+3 sin(πx/2+π/2)` statt als Kosinus beschrieben werden. Im zweiten Fall sind Sinus-/Kosinusformen mit richtiger Phase vollwertig. „Etwa“ und die Wahl im Auftrag dürfen nicht in eine bestimmte Formelpflicht umgedeutet werden.
- Aufgabe 41: `(−3x)³−2` ist ebenso passend wie `(−2x)³−2`, weil der Stauchungsfaktor im Auftrag nicht angegeben ist. Das sind verschiedene, jeweils zulässige Funktionen; Akzeptanz darf nicht auf algebraisch äquivalente Formen derselben Beispielantwort verengt werden. Der Text „ein möglicher Term“ lässt diese Freiheit bereits erkennen.
- Aufgabe 44: `cos x=sin(x−3π/2)` mit einer Verschiebung des Sinusgraphen um `3π/2` nach rechts ist gleichwertig mit der Verschiebung um `π/2` nach links. Die tatsächliche Rubrik akzeptiert äquivalente Periodenverschiebungen ausdrücklich. Das Weglassen des selbst zu ergänzenden zweiten Graphenfalls gibt höchstens 14/16 und besteht nicht bei 15 Punkten.

Es wurde keine weitere mathematische Inkonsistenz in den 44 Aufgaben, Musterrechnungen und tatsächlichen Materialien gefunden. Die sieben offenen Urteile werden durch lokale Rubrikänderungen nicht rückwirkend zu Akzeptanz: Ein neuer exakt gebundener Eingang und die nachfolgende Prüfung bleiben erforderlich. Entwürfe bleiben Entwürfe; reale Bewertung, Laufzeitverfügbarkeit, Lernendenverträge, Integration und frische Main-CI sind getrennte Nachweise.
