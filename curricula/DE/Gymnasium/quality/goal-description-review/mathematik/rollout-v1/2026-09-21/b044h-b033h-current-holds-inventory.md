# B044h / B033h: Bestand und nächste kleine Reparaturen

Stand: 21. September 2026, 21:42 UTC. Informierte Bestandsaufnahme, **keine neue Blindrunde, keine Freigabe und kein ausgeführter Reparaturplan**. Ausschließlich dieses Arbeitsdokument wird neu geschrieben. Canonical, Bilder, QA-Aggregat, Register, Ledgers, Lernerdaten und historische Ergebnisse bleiben unverändert.

## Ergebnis und Reihenfolge

Die zwölf reservierten Fälle sind weiterhin offen: **neun Bild-/Darstellungsfälle B044h und drei Aufteilungs-/Migrationsfälle B033h**. Die vorhandenen Reviews werden nicht neu gestartet.

1. **Zuerst `eb6bfdd9…`:** falsche x-Projektionsziffer 1 statt 2 lokal korrigieren; dieselbe Projektion anschließend prüfen.
2. **Dann `aae119f2…`:** Maß-/Koordinatenlabels und unbegründete Innenlinien lokal klären. Die Eckpunkttripel selbst sind bereits konsistent.
3. **`6fc9246a…` gezielt adjudizieren:** korrekte Algebra und korrektes rechtes Basisbild erhalten; nur die uneindeutige Achsen-/Ursprungszuordnung links entscheiden. Nicht den älteren pauschalen Achsenfehler ungeprüft übernehmen.
4. **Die anderen sechs B044h-Bilder gezielt geometrisch reparieren:** `be0e8715…`, `f37b0a72…`, `72dfc164…`, `54cfe5ce…`, `68d4faef…`, `69eda7f9…`. Gute Rechnungen, Texte und Gestaltung erhalten.
5. **B033h separat behandeln:** drei fachlich vorbereitete, aber noch nicht migrationssicher umgesetzte Aufteilungen. Kein rascher Abschluss durch Umbenennen, alten Fingerprint oder ein einzelnes neues Bild. Beim Vektoroperationsbild `1bc118c3…` besteht zusätzlich ein unten konkret belegter Geometriefehler.

Ein älterer Befund ist tatsächlich behoben: Bei `be0e8715…` sind Hauptsatz und Ableiten nicht mehr direkte Voraussetzungen. Das Bild ist dadurch nicht korrigiert. Die neun B044h-Zieltexte DE/EN brauchen nach den vorhandenen konkreten Befunden keine kosmetische Neuerfindung.

## Was tatsächlich geprüft und wiederverwendbar ist

Gelesen wurden die beiden Hold-Configs, alle zwölf aktuellen kanonischen Ziele einschließlich DE/EN und Voraussetzungen, die vorhandenen Einzelbefunde und einschlägigen Adjudikations-/Migrationsnotizen. Alle zwölf aktuellen Laufzeitbilder wurden tatsächlich angesehen; ihre Dateihashes wurden berechnet. Bei den unten beschriebenen Widersprüchen ist die sichtbare Darstellung der Beleg, nicht bloße Hashgleichheit. Die aktuellen Registry-Verweise, aktiven A-/M-Records und QA-Einträge wurden gezielt abgeglichen.

| Lane | Aktueller Bestand der zwölf Ziele | Konsequenz |
| --- | --- | --- |
| D | Kein Ziel ist in den aktuell registrierten Resolution-Indexes als aufgelöster Fall enthalten. Alte konkrete A/B-Befunde bestehen. | Vorhandene Sachprüfung weiterverwenden; nach tatsächlicher Änderung eine passende aktuelle, gezielte Entscheidung über Text **und** reparierten Seitenkontext. Keine sechs schon geschlossenen B044-Fälle erneut öffnen. |
| P | Kein Ziel ist im Scope einer aktuell registrierten P-Config enthalten. Auch die Suche in den vorhandenen `canonical-math*.review.jsonl` der Goal-Evidence-Lane fand keine dieser zwölf IDs. Die älteren D-Records enthalten jedoch individuelle Understanding-Evidence-Entwürfe. | Entwürfe und fachliche Gegenbeispiele als Material verwenden, nicht als bereits geprüftes P-v2-Profil ausgeben. Ein aktuelles Profil benötigt Materialisierung und fachliche Prüfung. |
| A | Zwölf aktive `atomic`-Records; zwölf Fingerprints stimmen mit dem nativen Generator überein. | Bei bloßen Bildkorrekturen keine A-Neubewertung erfinden. Bei B033h ist die formal aktuelle alte Entscheidung **keine** Auflösung der späteren konkreten Split-Einwände. |
| M | Elfmal `no_memory_needed`, bei `a8ff2666…` `memory_required`; alle zwölf nativen Fingerprints aktuell. | Unveränderte gültige Arbeit erhalten. Bei einem Split von `a8ff2666…` die vier Kartenursprünge konkret aufteilen, nicht nur Hashes erneuern. |
| V | Zehn gespeicherte `aiApproved: yes` passen zum aktuellen Assethash; bei `68d4faef…` und `a8ff2666…` fehlt dieses Feld. | Die zehn Metadatenpositiva sind kein Beweis gegen die heute sichtbaren Fehler. Historische Human-/ChatGPT-Felder nicht als aktuelles AI-Gate umdeuten. Gute Assets erhalten, echte Korrekturen neu ansehen. |

Die A-/M-Bindungsprüfung verwendete die bestehenden nativen Fingerprintfunktionen aus `app/scripts/semanticAtomicityReview.ts` und `app/scripts/memoryCardReview.ts`, ohne `write-fingerprints`. Dies war eine gezielte Bestandsprüfung, kein neuer vollständiger Maturity-/D-/P-Abnahmelauf.

## B044h: neun aktuelle Restfälle

### 1. be0e8715-3c3a-5ffb-937a-0b6bce4f01d8

**Vektoren als Orts-, Richtungs- und Verschiebungsvektoren im Raum beschreiben.** DE/EN verbinden Darstellung, Komponenten und geometrische Bedeutung zu einer kohärenten Kompetenz. Die früher sachfremden direkten Analysis-Kanten sind entfernt; aktuell bleiben `075f1ef2…` (Koordinatisieren) und `71cec9fb…` (Orientierung). Diesen Reparaturpunkt nicht wieder verlangen.

A/B blockierten das Bild; beide konkreten Bildprobleme bestehen: Die violette Karte schreibt einem Richtungsvektor „Länge/Skalierung einer Geraden“ zu. Eine Gerade hat keine endliche Länge. Außerdem passen A=(1,2,1), B=(4,3,3) nicht zur gezeichneten gemeinsamen Projektion mit positivem x nach links, y nach rechts und senkrechtem z. Horizontal müsste B relativ O links von 3A liegen, denn B−3A=(1,−3,0); sichtbar gilt das Gegenteil. Die Differenz AB=(3,1,2) ist rechnerisch richtig.

**Minimal:** falsche Aussage durch Richtung/Parameterskalierung präzisieren und Punkt-/Pfeilprojektion konsistent reparieren. Text, Rollenunterscheidung und korrekte Differenz erhalten. Kein erneutes Entfernen bereits entfernter Requires.

### 2. aae119f2-925f-5fc1-b795-b52c9e980863

**Räumliche Objekte im Koordinatensystem verorten.** Die bilinguale Wahl und Nutzung geeigneter Koordinatenbezüge ist ausreichend. Der Quader A=(0,0,0), B=(4,0,0), C=(4,3,0), D=(0,3,0), oben z=2, besitzt konsistente Eckpunkttripel.

A/B blockierten die ungeklärte Darstellung: „x=4“ steht an der y-parallelen Kante BC, „y=3“ an der x-parallelen Kante CD; zusätzliche gestrichelte Innen-/Querschnittslinien sind nicht erklärt. Als Längenbeschriftung sind die Labels falsch zugeordnet; als konstante Koordinaten wären sie mathematisch möglich, aber gerade nicht als solche kenntlich gemacht. Deshalb keinen stärkeren Befund „Eckkoordinaten falsch“ erfinden.

**Minimal und rasch:** klare Dimensionspfeile AB=4, BC=3, Höhe=2 oder eindeutig gekennzeichnete Koordinatenebenen; unbegründete Zusatzlinien entfernen/erklären. Der vorhandene Quader muss nicht insgesamt neu erfunden werden.

### 3. eb6bfdd9-3cbe-51b5-9798-a741bdc2782e

**Geometriesoftware zur Raumorientierung nutzen.** DE/EN verbinden räumliche Darstellung, Ansichtsvariation und Prüfung von Koordinaten/Lagen. Keine konkrete Softwaremarke oder echte Bildschirmaufnahme erforderlich.

A/B-Befund besteht exakt: Im Hauptfenster stehen P=(2,1,3), Pxy=(2,1,0), aber die zugehörige x-Projektionsmarke ist 1. Die kleine Draufsicht zeigt richtig x=2, y=1. Die Darstellung widerspricht sich in der gerade zu prüfenden Koordinate.

**Minimal und am schnellsten:** die falsche x-Markierung auf 2 ändern und die vorhandenen Projektionen kontrollieren. Eine eindeutige Achsenbezeichnung der Seitenansicht kann helfen; ein größerer Softwarekurs oder eine neue Kompetenzformulierung ist nicht erforderlich.

### 4. f37b0a72-9e23-51c7-aad5-438c17a56899

**Vektoren im Raum addieren und vervielfachen.** Der aktuelle Text beschreibt grundlegende Verschiebungsoperationen und ihre Deutung; beide ursprünglichen Runden hielten dies im vorliegenden Umfang für kohärent.

Die Rechnungen (2,1,1)+(−1,2,3)=(1,3,4) und 2a=(4,2,2) sind richtig. Rechts beginnen a und 2a am gleichen Ursprung, weisen aber sichtbar in verschiedene Richtungen. Links weist b=(−1,2,3) nach links, obwohl bei den gezeigten Achsen sowohl der negative x- als auch der positive y-Beitrag horizontal nach rechts weisen müssen.

**Minimal:** rechte Pfeile kollinear mit korrektem Längenverhältnis, linke Verkettung in einer konsistenten Projektion zeichnen. Korrekte Zahlen und gute Darstellungselemente erhalten. Nicht automatisch die andere B033h-Scopeentscheidung auf dieses Ziel übertragen.

### 5. 72dfc164-455d-4b63-85f0-96e803c9a1d5

**Linearkombinationen von Vektoren bilden und deuten.** DE/EN sind in Darstellung, Koeffizientenbestimmung und geometrischer Bedeutung deckungsgleich.

2(1,0,1)+(0,2,1)=(2,2,3) stimmt. Im linken Achsenbild wird u=(1,0,1) nach rechts oben gezeichnet, obwohl +x nach links unten und z senkrecht zeigen. Bei y=0 ist dieser horizontale Richtungswechsel unmöglich; die daran gebundene Ebene ist entsprechend unzuverlässig. Ein achsenfreies schematisches Mittelpanel ist nicht schon deshalb falsch.

**Minimal:** ausschließlich die explizite linke Koordinatenprojektion und zugehörige Ebene konsistent korrigieren; Rechnung und tragfähiges Schema erhalten.

### 6. 6fc9246a-9448-4cdb-b627-cf20ea1c65d3

**Lineare Abhängigkeit und Unabhängigkeit von Vektoren prüfen.** Text und Algebra tragen: a=(1,0,0), b=(0,1,0), c=(1,1,0), also a+b−c=0 mit nicht ausschließlich nullen Koeffizienten. Rechts wird die Standardbasis korrekt als unabhängig gezeigt.

Hier besteht echter historischer Dissens: A KEEP, B BLOCK. Die unteren linken schwarzen Achsen sind jedoch **nicht** ausdrücklich x/y-beschriftet. Daher ist B's stärkere Behauptung „a liegt auf der beschrifteten falschen Achse“ nicht wörtlich durch das Bild belegt. Real bleibt die unklare Geometrie: farbiger gemeinsamer Anfangspunkt gegenüber dem schwarzen Achsenschnitt versetzt, Zuordnung der konkreten Tupel zur Ebene nicht eindeutig. Die oberen isolierten gleichgerichteten Pfeilicons sind kein gemeinsames Koordinatendiagramm und alleine kein Blockgrund.

**Minimal:** zunächst gezielte informierte Adjudikation dieses einen unteren Panels. Entweder seine achsenfreie Schemafunktion ausdrücklich klären oder einen gemeinsamen Ursprung und passende beschriftete x/y-Richtungen herstellen. Keine Neuerzeugung der korrekten rechten Hälfte verlangen. P-Material sollte gemeinsame gegenüber nur paarweiser Abhängigkeit unterscheiden. Hier kein neuer pauschaler KEEP- oder Fehlerabschluss.

### 7. 54cfe5ce-693e-5d4a-ac1b-009570fbbc11

**Kollinearität von Vektoren im Raum prüfen.** Der skalare Vielfachenvergleich und seine geometrische Begründung sind DE/EN ausreichend. Für a=(2,−1,3), b=(4,−2,6) gilt b=2a; c=(3,−1,4) liefert unterschiedliche Quotienten. Diese Rechnungen sind richtig.

Die Pfeile weisen aber nach rechts, obwohl positives x und negatives y unter den gezeigten Achsen beide einen linken horizontalen Beitrag erzeugen. Freies Verschieben eines Vektorpfeils ist zulässig, ein Wechsel seiner Richtung nicht.

**Minimal:** die Koordinatenprojektion korrigieren oder eindeutig achsenfreie freie Vektorpfeile verwenden, bei denen Parallelität und Nichtparallelität stimmen. Zahlen und Skalarargument behalten; Nullkomponenten im P-Profil nicht durch blindes Quotientenbilden übergehen.

### 8. 68d4faef-1a56-5898-9c31-80b7d5d2e430

**Abstand zweier Punkte im Raum berechnen.** Verbindung, Betrag und Distanzdeutung bilden eine klare DE/EN-Kompetenz. A=(1,2,0), B=(4,6,12), AB=(3,4,12), Abstand 13 sind richtig.

Das tatsächlich aktuelle PNG bleibt geometrisch falsch. Bei x nach links, y nach rechts, z senkrecht müsste B horizontal links von 3A liegen, da B−3A=(1,0,12) einen negativen horizontalen Beitrag hat. Im Bild liegt B weit rechts davon. Eine andere positive Achsenskalierung beseitigt den Widerspruch nicht.

**Minimal:** konsistente lineare Projektion der Punkte und Hilfslinien; richtige Rechnung erhalten. Der PNG-Dateityp beweist keine zwischenzeitliche Korrektur. Zusätzlich fehlt ein aktuelles hashgebundenes AI-Gate; dieses erst nach tatsächlicher Bildprüfung, nicht aus historischen Human-Feldern übernehmen.

### 9. 69eda7f9-1898-5220-932d-e7bec839b7af

**Streckenlängen im Raum bestimmen.** DE/EN verlangen die zweckmäßige Wahl einer Verbindung in räumlichen Kontexten und sind nicht auf bloßes Einsetzen reduziert.

Im Quader endet die orange, als AC erklärte Grundflächendiagonale sichtbar am mit B=(6,0,0) bezeichneten hinteren rechten Punkt; C=(6,4,0) steht am benachbarten vorderen rechten Punkt. Achsenrichtung und obere Eckpunktzuordnung passen ebenfalls nicht konsistent dazu. √52≈7,21 und √61≈7,81 sind für die behaupteten Tupel richtig, nicht für diese gezeichnete Topologie.

**Minimal:** Ecken-/Achsen- und Diagonalenzuordnung gemeinsam korrigieren. Nicht nur B/C tauschen, ohne obere Ecken und beide berechneten Strecken nachzuprüfen. Dies ist größer als ein isolierter Zahlentausch, aber kein Grund, gute Rechnungen oder Kompetenztexte zu ersetzen.

## B033h: drei weiterhin echte Migrationsgrenzfälle

Die aktuellen drei Ziele sind weiterhin `type: atomic`, ohne Kinder. Es wurde kein beschlossener Split im Canonical vorgefunden. Die vorbereiteten Lösungen und die ausdrückliche Revision älterer Vorschläge vom 6. September bleiben maßgeblich; insbesondere darf die alte ID nicht still auf eine von mehreren alten Teilkompetenzen verengt werden.

### 10. 09f47964-2cd0-410e-93ee-9632b582fc91

**Funktionsbegriff und Darstellungen verstehen.** Der aktuelle DE/EN-Umfang kombiniert reellwertige eindeutige Zuordnung und Wechsel zwischen Tabelle, Term und Graph. A verlangte begriffliche Präzisierung, B eine Atomicity-Prüfung. Die spätere Adjudikation verwirft das zunächst vorgeschlagene bloße Verengen der alten ID.

**Bereits vorbereitete Lösung:** vorhandene Ziele `7dea79d2-67f2-4d92-b6cc-ad1b953dca3d` (Funktionsbegriff) und `b04d65dc-1214-5323-89a7-317d6b099e1a` (Darstellungswechsel) verwenden; keine doppelte neue Definitions-ID. Unterschiedliche AB1-/AB2-Anforderungen nicht zu gleicher Mastery erklären. Den bisherigen Gesamtumfang der alten ID nur in einem ausdrücklich beschlossenen Aggregat-/Migrationsmodell erhalten.

Das vorhandene Bild mit 0,1,2,3 → 0,2,4,6, f(x)=2x und passender Geradenskizze kann als Übersicht erhalten bleiben. Ein begrenzter Tabellenabschnitt legt eine beliebige Funktion nicht eindeutig fest; diesen bekannten Modellannahmenpunkt in den Aufgaben-/P-Entwürfen beachten, nicht das gute Übersichtsbild deswegen pauschal ersetzen.

**Minimal nächster Schritt:** vorhandenes Migrationspaket konkret entscheidungsreif machen: gemeinsame/externe Referenzen, Kinderplatzierung ohne Duplikate, Alt-Mastery, Plan-/Fokuskompatibilität und Quellenumfang. Gegenwärtig 15 direkte Mathematik-`requires`-Nachfolger; historische externe Viewzahlen sind keine hier neu gezählten Nutzerdaten. Kein Abschluss allein mit erneutem „atomic“.

### 11. 1bc118c3-1f05-5f2a-b125-418017180d75

**Vektoren komponentenweise addieren und skalieren.** Der alte Gesamtumfang umfasst Addition, Subtraktion, Skalarmultiplikation und Geometrie. Historisch A KEEP/B SPLIT; die anschließende fachliche Adjudikation bereitet zwei Teilkompetenzen vor: Addition/Subtraktion sowie Skalarmultiplikation. Die spätere Migrationsnotiz stellt ausdrücklich klar: Auch ohne externe Physikreferenzen ist ein operativer Split nicht automatisch sicher.

Die sechs direkten aktuellen Mathematik-Nachfolger stimmen noch mit der vorbereiteten Einzelzuordnung überein: Geradenparametrisierung `235ae698…`, Lagebeziehungen `b025df0c…`, Bewegung `ba343971…`, Kollinearität `d1352ce0…`, das Ziel `a8ff2666…` sowie die Prüfung `853905c5…`. Voraussetzungen und `examData.coveredGoalIds` differenziert zuordnen; Kollinearität braucht nicht pauschal beide Kinder.

**Zusätzlicher aktueller Bildbefund:** Zahlenbeispiele oben stimmen. Unten links erreicht der grüne Summenpfeil v+w aber nicht die Spitze des an v angehängten roten w. Unten rechts sind v und 2v bei gemeinsamem Ursprung nicht kollinear; −v passt ebenfalls nicht zur Richtung von v. Das ist direkt sichtbar und widerspricht der behaupteten Verkettung bzw. Skalierung, trotz gespeichertem hashpassendem AI-yes. Die mittlere Differenzdarstellung muss deswegen nicht verworfen werden.

**Minimal:** bestehende Teilkompetenz-/Anschlussvorarbeit verwenden, Migrationsentscheidung klären; die zwei fehlerhaften Bildpanels lokal korrigieren. Ein repariertes Bild alleine löst den offenen Scope nicht. Keinen fremden neuen Vollreview starten.

### 12. a8ff2666-8df3-4253-8021-3efe42114e40

**Abstände, Beträge und Mittelpunkte im Raum berechnen.** Beide alten Runden verlangen Trennung: Betrag/Punktabstand als metrische Routine, Mittelpunkt als affine Routine. Der aktuelle Text enthält beides weiterhin.

Das aktuelle korrigierte PNG ist brauchbares Material: A=(1,2,3), B=(5,4,7), Differenz (4,2,4), Abstand 6 und M=(3,3,5) stimmen; die achsenfreie Streckendarstellung zeigt den Mittelpunkt passend. Keine weitere Neuerzeugung aus Gewohnheit. Ein aktuelles AI-Gate fehlt jedoch; diese Bestandsnotiz schreibt keines.

**Konkrete weiter nutzbare M-Arbeit:** `memory_required` verweist auf die Decks `de_gymnasium_math_linalg_core` und `de_gymnasium_math_seki_core`. Die vier aktiven `kept`-Karten haben noch ausschließlich die alte ID als Ursprung: `math_linalg_c01`/`math_seki_c09` gehören zur metrischen, `math_linalg_c02`/`math_seki_c10` zur Mittelpunktkompetenz. Die Memory-IDs `bd55594a-3e06-5097-8324-4f2f1349fd2a` und `4eefbd04-9e49-41ea-a087-9ad6ac71ec5a` bleiben identifizierbar.

Die drei direkten aktuellen Nachfolger `235ae698…`, `b025df0c…`, `ba343971…` beanspruchen nicht ausdrücklich Mittelpunktberechnung. Deshalb nicht beide neuen Kinder pauschal als Requires einsetzen.

**Minimal:** vorbereitetes Split-/Karten-/Nachfolgerpaket einschließlich alter Mastery und Planreferenzen entscheiden. Gute Bildarbeit erhalten und erst im endgültigen Scope gezielt binden; kein Schließen des D-/A-Konflikts durch das Bild.

## Migrationsgrenze: konkret, nicht pauschal blockierend

Aktuell existieren weiterhin die relevanten Produktionsmechanismen: `LearnerService.java` projiziert Legacy-Mastery über passende `splitFromCanonicalGoalId`-Provenienz; dies ist keine allgemeine Migration direkter kanonischer Alt-Mastery. Derselbe Service weist externe atomare `goalEntry`-Referenzen auf Cluster zurück. `LearnerLearningPlanService.java` weist unbekannte `atomicGoalIds` zurück. Die vorhandene fachliche Vorbereitung ersetzt daher keine ausdrückliche Regel für alte direkte Lernstände, gespeicherte Atomlisten, Termine und Fokus.

Die detaillierten historischen Viewzahlen aus der Migrationsnotiz wurden hier nicht neu als Vollinventar gezählt; die aktuell erneut gezählten direkten Mathematik-Nachfolger sind 15/6/3. Es wurden keine privaten Lernstände oder Serverdaten geprüft. Keine automatische Übertragung von Alt-Mastery auf Kinder, keine Aussage, dass konkrete Nutzer bereits betroffen seien.

Ohne Scope-/Runtimeänderung sicher weiterführbar sind gezielte Bildreparaturen, vorhandene P-Entwürfe und nicht operative fachliche Kind-/Karten-/Anschlussvorbereitung. Im hier beauftragten Durchgang ist ausschließlich dieses Inventar autorisiert; Reparaturen sind **Vorschläge für den nächsten ausdrücklich beauftragten Arbeitsschritt**.

Nach einer wirklichen Reparatur: betroffene Seite/Abhängigkeiten gezielt aktuell binden, sichtbares Bild prüfen, offene D-Entscheidung sauber abschließen und P-Profil individuell prüfen. A/M nur bei Änderung ihrer eigenen semantischen Eingaben anfassen; bei Splits substantiell neu entscheiden. Erst Integration und native Gates einschließlich Quality-Status und geschützter Maturity-Floors tragen einen Abschluss. Historische Unterlagen nicht überschreiben.

## Fundstellen und Wiederverwendung

Alle folgenden Pfade sind repository-relativ.

- Canonical: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`.
- Aktuelle Gate-Registry: `curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`.
- A/M: `curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl`, `curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl` und dort `canonical-math-full.cards.review.jsonl`.
- QA: `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json`.
- Hold-Configs: `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/batch-044h-remaining-after-current-six-v1-carryover-after-held7-20260920-v1.config.json` und `2026-09-06/batch-033h-migration-policy-hold-3-v1.config.json` unter demselben Rollout-Root.
- Bereits vorhandene fallbezogene Triage: `2026-09-20/held-current-triage-v1.json` unter diesem Rollout-Root.
- B044-A/B-Einzelrecords: `2026-09-07/batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1/round-{a,b}/results/mathematik-rollout-v1-batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1-20260907-first-pass-{a,b}.batch-001.records.jsonl`.
- B044-Receipt: im selben Kampagnenordner `current-keep6-v1.currency-receipt.json`. Die sechs dort geschlossenen Ziele liegen außerhalb dieser neun; ihre Arbeit erhalten.
- Vorhandene Bildbefunde und bereits formulierte Korrekturhinweise: `curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-open-spatial-probability-20260920-v1/audit.json` und `prompts/<goalId>.de.md`. Für alle neun B044h-Ziele vorhanden. Diese sind Material, keine Pflicht zur vollständigen Neuerzeugung; insbesondere die stärkere alte 6fc-Achsenbehauptung und optionale Softwareseitenansicht nicht unkritisch übernehmen.
- B033-A/B-Einzelrecords: `2026-09-05/batch-033-atlas-next-unreviewed-disjoint-20-v1/round-{a,b}/results/mathematik-rollout-v1-batch-033-atlas-next-unreviewed-disjoint-20-v1-20260905-first-pass-{a,b}.batch-001.records.jsonl`.
- Maßgebliche spätere Präzisierungen im selben B033-Ordner: `atomicity-adjudication-remaining-2-v1.md` einschließlich Nachtrag vom 6. September und `vector-split-migration-impact-v1.md`.
- Scope-/Autorisierungsgrenze: `docs/qa-ci/math-physics-deep-understanding-resumption-review-2026-09-05.md`, Abschnitt zu den drei B033h-Migrationsfällen.

## Assetbindung der tatsächlich angesehenen Bilder

Laufzeitpfad jeweils `app/public/assets/goal-visualizations/mathematik/<goalId>/<goalId>.<Format>`; der QA-Eintrag benennt zusätzlich das kanonische Asset. „AI-yes“ bedeutet hier ausschließlich vorgefundenes hashpassendes Metadatum, **nicht** Freigabe durch diese Bestandsaufnahme.

| Goal-ID | Format | Aktueller Datei-SHA-256 | Vorhandenes hashpassendes AI-yes |
| --- | --- | --- | --- |
| `be0e8715-3c3a-5ffb-937a-0b6bce4f01d8` | `jpg` | `sha256:beb66e99f74e8fd7ee5f017e6e496c7494ee258537f48796a7936ef1f57d290b` | ja |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | `jpg` | `sha256:82a38e712f62c5c0e18b476ae2de4123a6420894a4cd5a24659e72ba430c5fe5` | ja |
| `eb6bfdd9-3cbe-51b5-9798-a741bdc2782e` | `jpg` | `sha256:f6c736d8c7684a0ad0ae946c39b90c830c5caa588dfe69caaa5e3b387255c51a` | ja |
| `f37b0a72-9e23-51c7-aad5-438c17a56899` | `jpg` | `sha256:bf04599a4a2fbb434b92669288cab31a2ef9d6d400939d8a175a6f79deb13cf2` | ja |
| `72dfc164-455d-4b63-85f0-96e803c9a1d5` | `jpg` | `sha256:ec0d3e0d6f36e94b24c2ba58f180f370863b7b6179023d92cc77be2a446f00d9` | ja |
| `6fc9246a-9448-4cdb-b627-cf20ea1c65d3` | `jpg` | `sha256:ad5f2098065421f707e8f42637a4c427d5f7ce5fc136fb488d1195bd9b98507d` | ja |
| `54cfe5ce-693e-5d4a-ac1b-009570fbbc11` | `jpg` | `sha256:ed8e50ed05df198b62e66f046f8bf22b791c023cc9c0d795eb790e3187a7a825` | ja |
| `68d4faef-1a56-5898-9c31-80b7d5d2e430` | `png` | `sha256:58cb988e600666f5060134c244c4e6513c0b96ce2303dfb682139cad62fba6bc` | fehlt |
| `69eda7f9-1898-5220-932d-e7bec839b7af` | `jpg` | `sha256:6bdb7d1a3e8277cc156e747fd7701f859e20cb34c24a12005a42056832e98e90` | ja |
| `09f47964-2cd0-410e-93ee-9632b582fc91` | `jpg` | `sha256:42092814e931f8de8374e44f9dd643207af665cc8e19a7f0175c91fae2607f72` | ja |
| `1bc118c3-1f05-5f2a-b125-418017180d75` | `jpg` | `sha256:32848944e678c1cf020506015e0892923b50b31c43c85ae2858845d5c39793e6` | ja |
| `a8ff2666-8df3-4253-8021-3efe42114e40` | `png` | `sha256:a7e1ec3af922de59849a1c463aa06c725e3ead5ea6cb7b66a10acf40c060f77e` | fehlt |

Keine Dateien außer diesem Arbeitsdokument erstellt oder geändert; keine Human-Felder, maschinellen Freigaben oder M7-Zähler gesetzt.

