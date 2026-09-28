# Mathematik M7: vier offene Kompetenzgrenzen in Analysis und Quadratik

Stand: 28. September 2026. **Nichtkanonischer Implementierungskandidat**, keine
Änderung an Graph, Quellzuordnung, Ansichten, Assessment oder QA und keine
D-/M7-Freigabe. Geprüft wurden der aktuelle kanonische Graph, die direkten
`*.review.json`-Quellkanten, die vorhandenen Prüfungsaufgaben sowie die
[Struktur-Triage vom 27. September](../2026-09-27/m7-structural-twelve-audit-candidate-20260927.md).
Eine bestehende `semanticAtomic: true`-Markierung oder ein `released`-Exam ist
kein Beweis, dass dessen heutige Beschreibung fachlich atomar und geprüft ist.

## Entscheidung in Kürze

| Alt-ID | Bevorzugte Route | Warum kein sofortiges D-KEEP? |
| --- | --- | --- |
| `809ef78a…` Q1 | Alte ID auf **Intervallmittelwert einer zeitabhängigen Größe** verengen, Bestand und Rate als zwei Transferfälle; Bestandsrekonstruktion bleibt bei bestehenden Zielen. | Zwei unabhängige D-Runden verlangen Split-Prüfung. Die heutige Q1-Prüfung nennt das Ziel als abgedeckt, prüft aber weder mittleren Bestand noch mittlere Änderungsrate. |
| `972cc7e8…` Q2 | **Identität vor Text**: gegen `71683f37…` und `91e2f564…` prüfen; bei vollständiger Redundanz Alt-ID aus den atomaren Targets migrieren. Neues Atom nur für einen quellenbelegten, wirklich eigenen Rest. | Vorwärtswirkung und inverse Bestimmung sind trennbar und bereits benachbart modelliert. Die einzige direkte reviewte Quellkante ist partiell; die angebliche Q2-Prüfungsdeckung hat keinen freien Parameter. |
| `1a18dbb3…` J10 | Zwei neue Kinder: wechselseitiger Graphschluss und vollständige Untersuchung mit erster Ableitung inklusive Randwertvergleich für globale Extrema. | Beide Leistungen sind unabhängig. Bloßes Verengen verlöre explizite BW-Anforderungen; gegenwärtiges Bild und die J10-Aufgabe prüfen den gesamten alten Anspruch nicht. |
| `9023226b…` J9 | Alte ID auf **quadratische Gleichungen mit geeignetem Verfahren lösen und prüfen** verengen; Sachkontext-Modellierung nach Quell-/Aufgabenprüfung zu `a7ccb7a9…` oder einem eigenen Atom. | Lösen und aus einem Sachproblem die Gleichung bilden sind getrennt. Keine aktuelle J9-Prüfung nennt die Alt-ID in `coveredGoalIds`; früheres D-Doppelreview `revise`/`split_review` ist offen. |

## `809ef78a…`: Mittelwert, nicht nochmals Bestandsrekonstruktion

Heute fordert der Text Bestände, rekonstruierte Bestände, mittlere Bestände
und mittlere Änderungsraten zugleich. `2afba4a2…` deutet das Integral bereits
als Bestandsänderung; `ece68088…` rekonstruiert aus Änderungsrate und
Anfangsbestand. Die hessische reviewte Q1.2-Quelle trennt sogar
`…b02-a01-87fb433c` („rekonstruierter Bestand“) von
`…b02-a02-00175ec3` („mittlerer Bestand und mittlere Änderungsrate“), beide
heute `exact` auf `809ef78a…`. Bei einer Verengung muss A01 zu einem
tatsächlich passenden Bestandsziel, etwa `ece68088…`, fachlich neu gebunden
werden; A02 trägt den Mittelwert-Kandidaten. BW 3.4.2(8) nennt ebenfalls den
Mittelwert einer Funktion, bisher nur `partial`.

Vorgeschlagener gemeinsamer Leistungskern für die **alte ID**:

> Die lernende Person kann den Mittelwert einer zeitabhängigen Größe auf einem
> Intervall als bestimmtes Integral geteilt durch die Intervalllänge
> modellieren, berechnen und mit passender Einheit deuten; sie unterscheidet
> dabei den mittleren Bestand vom Mittelwert einer Änderungsrate.

EN sinngemäß: *The learner can model, calculate, and interpret the interval
mean of a time-dependent quantity as its definite integral divided by the
interval length, with the correct unit, distinguishing mean stock from mean
rate of change.* Ob dies **ein** übertragbarer Mittelwertbegriff bleibt oder
zwei Kinder erfordert, ist mit unabhängigen Aufgaben und D-Reviews zu
entscheiden; die zwei alten `split_review`-Urteile werden nicht umetikettiert.
Ein starker P-Nachweis braucht mindestens (1) gegebenen Bestand `B(t)`,
`(b−a)⁻¹∫B(t)dt` in Bestandseinheiten und (2) gegebene Rate `r(t)`,
`(b−a)⁻¹∫r(t)dt` in Rate-Einheiten. `B(b)−B(a)` allein ist kein
Mittelwert eines Bestands.

**Assessment-Fehlbindung:** Das freigegebene Q1-Exam `6420e4be…` nennt
`809ef78a…` in `requires` und `coveredGoalIds`, berechnet aber nur die
mittlere *Querschnittsfläche* eines Rotationskörpers `V/12`, nicht einen
mittleren Bestand oder eine mittlere Änderungsrate. Das ist allenfalls ein
allgemeiner Mittelwert-Transfer. Für den vorgeschlagenen Zieltext neue
passende Q1-Aufgaben mit beide Einheiten/Kontexte vorsehen, Deckung der
alten Aufgabe konkret neu beurteilen und deren veröffentlichte Version
nicht still überschreiben. Das aktuelle Bild enthält beide Mittelwerte,
aber auch Bestandsänderung/Rekonstruktion; es braucht nach Textentscheidung
eine erneute zielgenaue V-Prüfung, gegebenenfalls ein fokussiertes Bild.
Die 16-Länder-Geltung folgt nicht schon aus den zwei HE- und einer BW-Kante:
andere direkte Reviews sind teils sehr breite `partial`-Routen.

## `972cc7e8…`: doppelte Parameterkompetenz und falscher Exam-Beleg

Der heutige Text verbindet Parameterwirkung auf Graphlage/-form,
Parameterbestimmung aus Bedingungen und Begründung. Bereits `91e2f564…`
untersucht Parameter und ihren Einfluss im Kontext, `71683f37…` bestimmt
Parameter aus Kontextbedingungen; `6947245e…` übernimmt dies für
ganzrationale Funktionen in E. Ein Automatismus „zwei neue Kinder“ würde
vermutlich Dubletten erzeugen. Der direkte reviewed Source-Mapping-Bestand
für `972cc7e8…` besteht nur aus **einer** `partial`-Kante auf BY
M12-EA.1.1 `771f1178…`: Analyse ganzrationaler Funktionen, insbesondere
mit Parametern. Sie belegt nicht auch die inverse Bedingungsbestimmung.
Die dafür einschlägige BY M13.4-Erwartung `b131f9ae…` ist bereits `partial`
an `71683f37…` und `exact` an `6947245e…` gemappt. Vor 16-Länder-
Applicability oder GK/LK-Übernahme sind Quell- und Seitenentscheidungen
pro tatsächlicher Leistung nötig.

**Bayern-Klassifikation:** Die amtliche [reguläre Mathematik 12](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer)
heißt dort „erhöhtes Anforderungsniveau“ und enthält M12 1.1; der
eigenständige [Vertiefungskurs](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft)
ist eine andere Lehrplan-Seite mit fünf Modulen, von denen drei ausgewählt
werden. Die lokale BY-Extraktion etikettiert M12-EA.1.1 trotzdem
`courseLevel: "LK"`; die aktuelle direkte Composition führt `972cc7e8…`
nur in `de-by-lk`/`de-by-sekii-lk`, nicht in GK. Dieses **technische
Klassifikationsproblem** ist nach der vereinbarten BY-Interimsregel zu
bereinigen. Es beweist aber keine eigenständige Fachkompetenz von
`972cc7e8…` und rechtfertigt kein blindes Umhängen aller LK-Kanten.

**Assessment-Fehlbindung:** Das freigegebene Q2-Exam `bd2c5e29…` führt
`972cc7e8…` als `requires` und `coveredGoalIds`; seine Aufgabe verwendet
jedoch ausschließlich die *festen* Funktionen `f(x)=2e^{0.5x}−3` und
`g(x)=ln(x+3)`. Es gibt weder einen freien Parameter noch eine Bedingung,
aus der ein Parameterwert zu bestimmen wäre. Deckungs-ID und möglicherweise
Voraussetzung sind zu korrigieren; die historische Prüfungsfassung behalten.

**Entscheidbaum:** Zuerst die identischen und unterschiedlichen
Leistungsanteile der drei Q2-Ziele gegen belastbare Source-Spans und
Assessmentaufgaben prüfen. Wenn `71683f37…` + `91e2f564…` den Anspruch
vollständig und ohne Lücke tragen, `972cc7e8…` als atomare Doppelung
aus der Zielprojektion migrieren, alte Mastery separat behandeln und
Quell-/`requires`-Kanten auf die zutreffenden vorhandenen Ziele adjudizieren.
Nur wenn eine Quelle eine neue Restkompetenz trägt, z. B. die Eindeutigkeit
oder Abhängigkeit mehrerer Parameterbedingungen untersuchen, hierfür ein
enges neues Atom mit einem eindeutigen **und** einem nicht eindeutigen
Transferfall erstellen. Das jetzige Bild zeigt nur einen eindeutigen
Zwei-Bedingungen-Fall; es kann einen solchen Rest nicht freigeben.

## `1a18dbb3…`: J10-Split mit echter globaler Extrema-Prüfung

Der [vorliegende Split-Entwurf](../2026-09-27/j10-derivative-split-candidate-20260927-v1/README.md)
hat belastbare DE-/EN-Texte und die Folgen für die drei Nachfolger bereits
ausgeführt. Hier der zentrale Umsetzungsentscheid: die alte ID als
Navigationscluster, **zwei** neue atomare Ziele darunter. G verlangt
Schlüsse `f → f′` **und** `f′ → f` an beschrifteten Graphen. A verlangt
Monotonie/lokale Extrema aus dem Vorzeichen von `f′` sowie den Vergleich
innerer Kandidaten mit Randwerten auf dem angegebenen Bereich für **globale**
Extrema. `f′(x)=0` ohne Vorzeichenwechsel darf nicht als Extremum gelten.

Die BW-Sek-I-Reviewmappings geben für 3.3.4(11)/(12)/(22)/(23) vier
`partial`-Kanten auf die Alt-ID. Die Graph-Richtungen gehören zum
Graph-Kind; erste Ableitung, Monotonie und lokale/globale Unterscheidung zum
Analyse-Kind. Höhere Ableitungen, Krümmung und Wendepunkte aus (22) gehören
nicht ungeprüft dazu. Die heutige 16-Länder-Geltung darf nicht auf beide
Kinder vererbt werden, da diese vier BW-Kanten der einzige hier unmittelbar
nachgewiesene direkte Source-Review-Bestand sind.

Die aktuelle J10-Aufgabe `2f626446…` prüft Monotonie, nennt die Alt-ID aber
nicht als `coveredGoalIds` und prüft weder beide Graph-Richtungen noch einen
ausdrücklichen Vergleich innerer und Randkandidaten. Ein neues Graph-Exam
mit **beiden Richtungen** und ein begrenztes Funktionsintervall mit
Extrema-/Randwertvergleich sind nötig; Aufgaben, Lösungen, Punkte und
`coveredGoalIds` müssen dasselbe Leistungsziel treffen. P-Fälle sollten
außerdem einen stationären Punkt ohne Extremum und einen Randpunkt mit
globalem, aber nicht innerem lokalem Extremum enthalten. Das bisherige
Parabelbild zeigt keinen Randvergleich; für beide Kinder braucht es eigene
zielgebundene Bild-/Hash-/QA-Entscheidungen. Keine alte Mastery `1` auf
zwei neue Kinder kopieren.

## `9023226b…`: Lösen von Kontextübersetzung trennen

Heute verspricht die Beschreibung einerseits grafisches/rechnerisches
Lösen, andererseits das **Aufstellen** einer quadratischen Gleichung aus
einem Sachproblem. Für die alte ID ist eine engere Formulierung möglich:

> Die lernende Person kann eine gegebene quadratische Gleichung mit einem
> zur Form passenden grafischen oder rechnerischen Verfahren lösen, die
> Anzahl reeller Lösungen erkennen und die gefundenen Werte durch
> Einsetzen oder im Graphen überprüfen.

EN sinngemäß: *The learner can choose an appropriate graphical or algebraic
method for a given quadratic equation, determine its real solutions or
nonexistence, and check the result by substitution or on the graph.*
Quadratische Ergänzung und Lösungsformel sind dabei **Verfahren derselben
Gleichungslösekompetenz**, nicht automatisch je ein eigener Lernzielknoten;
unabhängige Reviews müssen diese Grenze bestätigen. `a7ccb7a9…` modelliert
bereits Sachprobleme mit quadratischen Funktionen, und die freigegebene
J9-Aufgabe `ec707244…` stellt ein Ballflugmodell auf und löst daraus die
Sachfrage `h(x)=3`. Ob diese Route die hessische explizite Anforderung
„Sachprobleme, die auf quadratische Gleichungen führen“ hinreichend deckt,
ist im Quellen-/Assessmentreview zu entscheiden. Wenn nicht, eigenes enges
Atom „aus einem Sachproblem eine quadratische Gleichung aufstellen und
Ergebnisse im Kontext prüfen“ statt den alten Sammeltext beizubehalten.

Quelle/Sicht: BW 3.2.1(21) deckt die Formel, (26) die graphische
Schnittdeutung jeweils spezifisch ab. HE G9 9.3.02 fordert graphische und
rechnerische Lösungsverfahren, Ergänzung und Formel; G9 9.3.03 fordert
gesondert Sachprobleme. Etliche heute als `exact` markierte HE-Kanten
betreffen nur einzelne Teilaspekte (beispielsweise binomische Formeln,
`x²=a` oder Sachprobleme) und sind bei der Verengung **einzeln** zu
revidieren, nicht pauschal auf ein neues Ziel zu kopieren. BY M9.2.1
verlangt auch reflektierte Verfahrenswahl sowie Plausibilitätsabschätzung
am Graphen. Alle 31 direkten Composition-Referenzen und die zwei
kanonischen Eltern der Alt-ID müssen bei einer Strukturänderung auf
Dopplungen geprüft werden; die bevorzugte Verengung der Alt-ID vermeidet
einen unnötigen Graph-Umbau.

**Prüfungslücke:** Keines der aktuellen J9-Exams führt `9023226b…` als
`coveredGoalIds`. Die Ballflugaufgabe löst zwar eine Gleichung, ist jedoch
an `a7ccb7a9…` gebunden und enthält keinen Verfahrensvergleich oder
Lösbarkeitsfall. Ein eigenes J9-Assessment mit z. B. faktorisierbarem und
nicht einfach faktorisierbarem Fall sowie einer Graph-/Einsetzprobe muss
belegt und reviewed werden; bei einer Modellierungs-Abspaltung braucht
diese ihre eigene Kontextaufgabe. Das jetzige korrigierte Bild zeigt nur
die quadratische Ergänzung. Nach jeder Textänderung Bild/Alttext/Assethash
erneut gegen genau den neuen Zielumfang prüfen; ein Methodenbild ist kein
Assessment-Nachweis.

## Integrationsfolge ohne Abkürzung

1. Zuerst die vier Identitätsentscheidungen und die genauen Quellen-
   und BY-Kurszuordnungen fachlich treffen; **keine** Kante, Scope- oder
   `released`-Deckung pauschal übernehmen.
2. Dann Graph/Ansichten/`requires`/Assessments konsistent ändern und
   Mastery-Migration für Narrowing, Merge beziehungsweise Split explizit
   festlegen; aktuelle DAG-, View-, Atlas- und Prüfungschecks ausführen.
3. Danach pro geänderter atomarer ID frische bilinguale D-Seiten, zwei
   unabhängige Reviews und Synthese, aktuelle P-Transfers, A/M-Entscheide
   sowie V-Asset-/Bildprüfung mit gültigen Fingerprints erzeugen. Der
   `curricularAtomic`-Nenner und die strikte D/P/A/M/V-Schnittmenge sind
   danach neu zu bestimmen. Kein Kandidat hier ist eine menschliche QS oder
   eine Freigabe zu „Mathematik 100 %“.
