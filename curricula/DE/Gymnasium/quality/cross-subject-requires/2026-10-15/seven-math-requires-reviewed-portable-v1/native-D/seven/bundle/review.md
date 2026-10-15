# AI review input: Sieben Mathematikziele – aktueller Requires-Kontext

- Book ID: `seven-math-requires-current-context`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:a5aebb1c3c6c5ae7c635fb2144d8c4e7a4be17d2cc7e9081e7dde5b340911ebb`
- Selected goals: 7

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Lagebeziehungen geometrischer Objekte fachsprachlich beschreiben

- Full learning-goal ID: `3e53a39b-1c75-4034-a647-8de85719e1fb`
- Goal fingerprint: `sha256:d686e2a5a7cc58752f9e2205fbfb568e97fa13d9f9b6b94826556ae4d65a93ef`
- Page fingerprint: `sha256:b24a1391c311017c15b303934264998de0b8a46a804389cb466bb15deff5d396`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 8 > Weitere Kompetenzen

### Canonical description

Die lernende Person kann Lagebeziehungen geometrischer Objekte wie parallel, senkrecht oder schneidend sowie Aussagen wie „halbiert einen Winkel“ oder „halbiert eine Strecke“ fachsprachlich beschreiben und in Skizzen sicher zuordnen.

### Visualization

/assets/goal-visualizations/mathematik/3e53a39b-1c75-4034-a647-8de85719e1fb/3e53a39b-1c75-4034-a647-8de85719e1fb.jpg

- original digest: `sha256:4beb75945dea7dd2e183827061021481f8cfebfc898d072fb506c8cc305c0b68`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Winkelbeziehungen in Figuren beschreiben und für geometrische Argumentationen nutzen — `fc047e6e-5d6d-460f-99fc-ade3a23b9a8e` (page 2)

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Parallele und senkrechte Lagebeziehungen erkennen und begründen — `2231c29b-eb4e-51ae-9cb1-eb033bf16099` (outside this book)

### Direct reverse prerequisites outside this book

- Parallele und senkrechte Geraden konstruieren — `c31d3a7a-778b-5ae3-9aa4-7b5674047f83` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:995d8858798baa07930fc91f749e98fcfd63cf74283d092780a8e95918a8941a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `line-relations-by-defining-properties`
  - Essential understanding (DE): Parallele Geraden haben in einer Ebene keinen Schnittpunkt, senkrechte Geraden schneiden sich im rechten Winkel und andere schneidende Geraden besitzen genau einen Schnittpunkt ohne notwendigerweise senkrecht zu sein. Diese Beziehungen sind lage- und drehungsunabhängig.
  - Essential understanding (EN): Parallel lines in a plane do not intersect, perpendicular lines meet at a right angle, and other intersecting lines have exactly one point of intersection without necessarily being perpendicular. These relations do not depend on position or rotation.
  - Observable performance (DE): Die lernende Person ordnet Geradenpaare in einer neuen, auch nicht maßstäblichen Skizze als parallel, senkrecht oder sonst schneidend ein, formuliert die Beziehung fachsprachlich und nennt Schnittpunkt- oder Rechtwinkeleigenschaft als Begründung.
  - Observable performance (EN): In a fresh, possibly not-to-scale sketch, the learner classifies pairs of lines as parallel, perpendicular, or otherwise intersecting, states the relation in mathematical language, and cites the intersection or right-angle property as justification.
- `bisection-object-and-equality`
  - Essential understanding (DE): Eine Winkelhalbierende teilt eine Winkelgröße in zwei gleiche Teilwinkel, während eine Streckenhalbierende beziehungsweise ein Mittelpunkt eine Strecke in zwei gleich lange Teilstrecken teilt. Das halbierte Objekt und die Gleichheitsmarkierung bestimmen die Aussage.
  - Essential understanding (EN): An angle bisector divides an angle measure into two equal sub-angles, whereas a segment bisector or midpoint divides a segment into two equal sub-segments. The object being bisected and the equality marking determine the statement.
  - Observable performance (DE): Die lernende Person unterscheidet in beschrifteten und unbeschrifteten Skizzen Winkel- von Streckenhalbierung, benennt das jeweils halbierte Objekt und belegt die Zuordnung durch gleiche Winkelmarken beziehungsweise gleiche Streckenlängen.
  - Observable performance (EN): In labelled and unlabelled sketches, the learner distinguishes angle bisection from segment bisection, names the object being bisected, and supports the classification with equal angle marks or equal segment lengths.

**Coverage expectations**

- required expectations: `line-relations-by-defining-properties`, `bisection-object-and-equality`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `information-form`: Explizite Fachbegriffe gegenüber ausschließlich durch rechte Winkel, Pfeile oder Gleichheitsmarken codierten Beziehungen / Explicit mathematical terms versus relations encoded only by right-angle, arrow, or equality markings
- `orientation-and-scale-fidelity`: Vertraute Ausrichtung gegenüber gedrehter, nicht maßstäblicher Figur mit zusätzlichen Ablenkungslinien / Familiar orientation versus a rotated, not-to-scale figure containing extra distractor lines
- `translation-direction`: Skizze fachsprachlich beschreiben gegenüber eine fachsprachliche Aussage in einer Skizze eindeutig markieren / Describe a sketch mathematically versus mark a mathematical statement unambiguously in a sketch

**Application cases**

- `marked-relations-not-to-scale`
  - Task demand (DE): Eine nicht maßstäbliche Skizze enthält mehrere Geraden und Strahlen. Pfeilmarken kennzeichnen g und h als parallel; ein Rechtwinkelsymbol steht am Schnitt von h und k; m schneidet g ohne Rechtwinkelsymbol. Am Scheitel S liegen die Strahlen u, w und v, wobei gleiche Winkelbögen ∠uSw = ∠wSv markieren. Auf AB liegt M mit gleichen Strichmarken auf AM und MB; die Gerade n verläuft durch M. Beschreibe alle markierten Beziehungen fachsprachlich und begründe jede Zuordnung durch die jeweilige Markierung.
  - Task demand (EN): A not-to-scale sketch contains several lines and rays. Arrow marks identify g and h as parallel; a right-angle symbol appears where h meets k; m meets g without a right-angle symbol. Rays u, w, and v meet at vertex S, with equal arcs marking angle uSw equal to angle wSv. Point M lies on AB with equal tick marks on AM and MB, and line n passes through M. Describe every marked relation in mathematical language and justify each classification from its marking.
  - Expected performance (DE): Die lernende Person formuliert g parallel zu h, h senkrecht zu k und m schneidet g, ohne aus der Zeichnung eine Senkrechtstellung zu behaupten. Sie beschreibt w als Halbierende des Winkels uSv, M als Mittelpunkt von AB und n als Streckenhalbierende von AB, jeweils gestützt auf die richtige Gleichheits- und Lageinformation.
  - Expected performance (EN): The learner states that g is parallel to h, h is perpendicular to k, and m intersects g without inferring perpendicularity from appearance. The learner describes w as bisecting angle uSv, M as the midpoint of AB, and n as a segment bisector of AB, supported by the correct equality and incidence information in each case.
  - Understanding focus (DE): Der Fall prüft alle Begriffsfamilien über definierende Markierungen und trennt ausdrücklich Schnitt von Senkrechtstellung.
  - Understanding focus (EN): The case tests all terminology families through defining markings and explicitly distinguishes intersection from perpendicularity.
- `verbal-constraints-to-annotated-sketch`
  - Task demand (DE): Erstelle aus folgenden Aussagen eine eigene gedrehte Skizze mit eindeutigen Markierungen: p ist parallel zu q; r steht senkrecht auf q; s schneidet p, ist aber nicht senkrecht; der Strahl v halbiert den Winkel zwischen r und s; M halbiert die Strecke XY. Ergänze zwei nicht relevante Hilfslinien und erkläre, woran die fünf Aussagen trotz der Zusatzlinien überprüfbar bleiben.
  - Task demand (EN): Create your own rotated sketch with unambiguous markings from these statements: p is parallel to q; r is perpendicular to q; s intersects p but is not perpendicular; ray v bisects the angle between r and s; M bisects segment XY. Add two irrelevant auxiliary lines and explain how the five statements remain checkable despite the extra lines.
  - Expected performance (DE): Die lernende Person zeichnet eine konsistente Anordnung und verwendet unterschiedliche, passende Markierungen für Parallelität, rechten Winkel, Schnittpunkt, gleiche Teilwinkel und gleiche Teilstrecken. In der Erklärung bindet sie jeden Fachbegriff an diese Eigenschaft statt an horizontale oder vertikale Bildlage.
  - Expected performance (EN): The learner draws a consistent arrangement and uses distinct appropriate markings for parallelism, a right angle, an intersection, equal sub-angles, and equal sub-segments. In the explanation, the learner binds every mathematical term to its property rather than to horizontal or vertical appearance.
  - Understanding focus (DE): Der Transfer kehrt die Darstellungsrichtung um und prüft robuste Fachsprache in einer selbst erzeugten, gedrehten und visuell komplexeren Figur.
  - Understanding focus (EN): The transfer reverses the representation direction and tests robust mathematical language in a self-produced, rotated, visually more complex figure.
## Page 2: Winkelbeziehungen in Figuren beschreiben und für geometrische Argumentationen nutzen

- Full learning-goal ID: `fc047e6e-5d6d-460f-99fc-ade3a23b9a8e`
- Goal fingerprint: `sha256:e74256d7d55f0a954c7be30cd75e037712db87dc259450ef3aa0108f6f9556d1`
- Page fingerprint: `sha256:d3b4e93f62e490b6edee24fdb21e3adaccff1d7d96f1a23813ba833d41e8fc34`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 8 > Weitere Kompetenzen

### Canonical description

Die lernende Person kann Winkelbeziehungen an Parallelen, in Dreiecken und in Vielecken fachsprachlich beschreiben und diese Beziehungen für einfache geometrische Argumentationen nutzen.

### Visualization

/assets/goal-visualizations/mathematik/fc047e6e-5d6d-460f-99fc-ade3a23b9a8e/fc047e6e-5d6d-460f-99fc-ade3a23b9a8e.png

- original digest: `sha256:959bd97b4b7f5e5c247cf9b7d2c775d4994bf08d4e44961a30bf867349b970b8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Lagebeziehungen geometrischer Objekte fachsprachlich beschreiben — `3e53a39b-1c75-4034-a647-8de85719e1fb` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)

### Direct reverse prerequisites outside this book

- Kongruenzsätze anwenden und begründen — `f0a49da2-018b-4cda-adbd-27047b610a0f` (outside this book)
- Besondere Dreiecke untersuchen — `de393ab3-d2af-5476-8b46-315185abb805` (outside this book)
- Bogenmass am Einheitskreis veranschaulichen und sicher zwischen Grad- und Bogenmass wechseln — `8d30d241-0247-48ac-83d3-4e0de61584d3` (outside this book)
- Sinus- und Kosinusfunktionen als periodische Funktionen beschreiben — `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11` (outside this book)
- Einheitskreis und Bogenmass für trigonometrische Funktionen nutzen — `82597dfb-0ec6-4a77-abaf-e1d6bdd12041` (outside this book)
- Trigonometrische Graphen und Periodizität deuten — `46bdcc16-418f-417a-89cf-033d7ae6c8cc` (outside this book)
- Besondere Linien in Dreiecken beschreiben — `b37851f1-d64a-47ec-a54a-1e70fa5586a9` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d64514dc0c64ec2e165a43783846c0bfbcd481280e71554269722075dde86bbf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `proof`

**Positive understanding expectations**

- `angle-relations-from-conditions`
  - Essential understanding (DE): Scheitel- und Nebenwinkel folgen aus einem Schnitt; Stufen- und Wechselwinkelbeziehungen benötigen parallele Geraden. Eine nicht maßstäbliche oder gedrehte Lage ändert diese satzmäßigen Beziehungen nicht.
  - Essential understanding (EN): Vertical and supplementary angles follow from an intersection; corresponding and alternate angle relations require parallel lines. A non-scale or rotated configuration does not change these theorem-based relations.
  - Observable performance (DE): Die lernende Person bestimmt unbekannte Winkel und nennt bei jedem Schritt die Beziehung samt notwendiger Voraussetzung.
  - Observable performance (EN): The learner determines unknown angles and names the relation and necessary condition at every step.
- `triangle-polygon-decomposition`
  - Essential understanding (DE): Die Winkelsumme im euklidischen Dreieck beträgt 180°. Ein einfaches ebenes n-Eck lässt sich durch geeignete, sich im Inneren nicht schneidende Diagonalen ohne zusätzliche Eckpunkte in n−2 Dreiecke zerlegen; daraus folgt (n−2)·180°, auch bei konkaven Vielecken mit überstumpfen Innenwinkeln. Bei konvexen Vielecken ist ein Dreiecksfächer von jedem Eckpunkt möglich; bei konkaven muss die Lage der Diagonalen geprüft werden. Selbstüberschneidende Figuren benötigen eine andere Behandlung.
  - Essential understanding (EN): The angle sum of a Euclidean triangle is 180°. A simple planar n-gon can be divided into n−2 triangles by suitable diagonals whose interiors do not intersect, without adding vertices; this gives (n−2)·180°, including concave polygons with reflex interior angles. In a convex polygon a triangle fan is possible from every vertex; in a concave polygon the positions of the diagonals must be checked. Self-intersecting figures require different treatment.
  - Observable performance (DE): Die lernende Person begründet eine Vieleckwinkelsumme durch eigene Zerlegung und nutzt sie in einer nachvollziehbaren Winkelkette.
  - Observable performance (EN): The learner justifies a polygon angle sum through an independent decomposition and uses it in a transparent angle chain.

**Coverage expectations**

- required expectations: `angle-relations-from-conditions`, `triangle-polygon-decomposition`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `figure-family`: geschnittene Parallelen, Dreieck oder einfaches Vieleck / intersected parallels, triangle, or simple polygon
- `orientation`: Standardlage oder gedrehte textlich beschriebene Lage / standard or rotated verbally specified configuration
- `condition-status`: gesicherte Parallelität oder bewusst fehlende Voraussetzung / established parallelism or deliberately missing condition

**Application cases**

- `parallel-angle-chain-transfer`
  - Task demand (DE): Die Geraden g und h sind parallel. Eine Transversale t schneidet g in A und h in B. Der innenliegende Winkel rechts von t bei A beträgt 68°. Bestimme den innenliegenden Winkel links von t bei B und seinen Nebenwinkel; begründe ohne Zeichnungsmessung. Beurteile anschließend den Fall ohne die Angabe g∥h.
  - Task demand (EN): Lines g and h are parallel. A transversal t meets g at A and h at B. The interior angle to the right of t at A is 68°. Determine the interior angle to the left of t at B and its supplementary angle; justify without measuring a diagram. Then assess the case without the statement g∥h.
  - Expected performance (DE): Über Wechselwinkel erhält die lernende Person 68° bei B und über Nebenwinkel 112°. Ohne gesicherte Parallelität ist der Wechselwinkelschluss nicht zulässig, selbst wenn eine Skizze parallel aussieht.
  - Expected performance (EN): Using alternate angles, the learner obtains 68° at B and then 112° by supplementary angles. Without established parallelism, the alternate-angle inference is invalid even if a sketch looks parallel.
  - Understanding focus (DE): Unabhängiger Transfer zu einer textlich fixierten Parallelenfigur und ihrer zentralen Geltungsbedingung.
  - Understanding focus (EN): Independent transfer to a verbally fixed parallel-line configuration and its central validity condition.
- `hexagon-decomposition-transfer`
  - Task demand (DE): Ein einfaches konvexes Sechseck hat fünf Innenwinkel 110°, 125°, 130°, 140° und 115°. Leite seine Winkelsumme durch Dreieckszerlegung her und bestimme den sechsten Winkel. Erkläre, warum die Herleitung nicht unverändert auf ein selbstüberschneidendes Sechseck übertragen wird.
  - Task demand (EN): A simple convex hexagon has five interior angles of 110°, 125°, 130°, 140°, and 115°. Derive its angle sum by triangulation and determine the sixth angle. Explain why the derivation is not transferred unchanged to a self-intersecting hexagon.
  - Expected performance (DE): Vier Dreiecke ergeben 720°; die bekannten Winkel summieren sich zu 620°, also beträgt der letzte 100°. Die Zerlegung setzt ein einfaches ebenes Vieleck mit der üblichen Innenwinkeldeutung voraus.
  - Expected performance (EN): Four triangles give 720°; the known angles total 620°, so the final angle is 100°. The decomposition assumes a simple planar polygon with the usual interior-angle interpretation.
  - Understanding focus (DE): Unabhängiger Transfer von lokalen Winkelbeziehungen zur Vieleckzerlegung mit Modellgrenze.
  - Understanding focus (EN): Independent transfer from local angle relations to polygon decomposition with a model boundary.
- `concave-octagon-decomposition-transfer`
  - Task demand (DE): Ein einfaches C-förmiges Achteck ABCDEFGH wird durch diese Randfolge beschrieben: von A 6 Einheiten nach rechts zu B, 1 nach oben zu C, 4 nach links zu D, 3 nach oben zu E, 4 nach rechts zu F, 1 nach oben zu G, 6 nach links zu H und 5 nach unten zu A. Skizziere zur Orientierung, wähle geeignete Diagonalen und begründe die Innenwinkelsumme durch Dreieckszerlegung. Prüfe außerdem, ob von A ein vollständiger Dreiecksfächer möglich ist. Eine maßgenaue Instrumentenkonstruktion ist nicht verlangt.
  - Task demand (EN): A simple C-shaped octagon ABCDEFGH has this boundary walk: from A go 6 units right to B, 1 up to C, 4 left to D, 3 up to E, 4 right to F, 1 up to G, 6 left to H, and 5 down to A. Sketch for orientation, choose suitable diagonals, and justify the interior-angle sum by triangulation. Also check whether a complete triangle fan from A is possible. An accurate instrument construction is not required.
  - Expected performance (DE): Zum Beispiel zerlegen AC, AD, DH, EH und EG das Achteck in ABC, ACD, ADH, DEH, EGH und EFG. Die sechs Dreiecke füllen das Innere ohne Überlappung; daher ist die Summe 6·180°=1080°. An D und E sind die Innenwinkel 270°, an den übrigen sechs Ecken 90°: 2·270°+6·90°=1080°. Die Verbindung AF verläuft teilweise außerhalb durch die Einbuchtung, also ist von A kein vollständiger Fächer möglich. Andere korrekte innere Dreieckszerlegungen sind gleichwertig.
  - Expected performance (EN): For example, AC, AD, DH, EH, and EG partition the octagon into ABC, ACD, ADH, DEH, EGH, and EFG. The six triangles cover the interior without overlap, so the sum is 6·180°=1080°. The interior angles at D and E are 270° and at the other six vertices 90°: 2·270°+6·90°=1080°. Segment AF passes partly outside through the notch, so a complete fan from A is impossible. Other valid interior triangulations are equivalent.
  - Understanding focus (DE): Eigenständiger Transfer zu einem einfachen konkaven Vieleck: geeignete innere Diagonalen und überstumpfe Innenwinkel statt eines ungeprüften Eckpunktfächers.
  - Understanding focus (EN): Independent transfer to a simple concave polygon: suitable interior diagonals and reflex interior angles instead of an unchecked vertex fan.
## Page 3: Größen und Einheiten vergleichen und umrechnen

- Full learning-goal ID: `f2e42af5-67a6-477e-82ea-e65b09cc6cb3`
- Goal fingerprint: `sha256:23041be80ac0e2a1a6e140e7c061e62fd364e856734c0cb0872bbb93c6c7192c`
- Page fingerprint: `sha256:6dd5656dcc4b77d7c325f337953a15ed398ccaed49de06a51258566947a80967`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 5

### Canonical description

Die lernende Person kann für alltagsnahe Größen passende Einheiten auswählen, Größenangaben sicher in gleichartige Einheiten umrechnen, dabei anhand des Einheitenverhältnisses begründen, warum die dargestellte Größe unverändert bleibt, und Messergebnisse in einer gemeinsamen Einheit sinnvoll vergleichen.

### Visualization

/assets/goal-visualizations/mathematik/f2e42af5-67a6-477e-82ea-e65b09cc6cb3/f2e42af5-67a6-477e-82ea-e65b09cc6cb3.jpg

- original digest: `sha256:d38294eb4db797cd97bbee6350babe425d2fd25575f09e9317e1ee615c1d9197`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Rechnungen mit Umkehroperationen überprüfen — `e82d8d3a-9012-5482-afe6-ab0d727a49bb` (outside this book)
- Natürliche Zahlen runden — `fe07241a-b779-5f35-a82d-7aa51ae74f42` (outside this book)
- Einfache additive Gleichungen durch Umkehraufgaben lösen — `11e3cf89-9224-5894-8e4a-ae8ff5af0119` (outside this book)
- Rechenvorteile mit Kommutativ- und Assoziativgesetz nutzen — `191c67db-44a8-4f63-994a-d85e8e301194` (outside this book)
- Einfache multiplikative Gleichungen unter Bereichsbedingungen lösen — `54148506-c23f-41b8-959b-068dd194cf15` (outside this book)
- Klammerterme und Rechenreihenfolge sicher auswerten — `5d1decb2-b01b-5c85-88fc-9fc255ff9776` (outside this book)
- Einfache Zählprinzipien in Sachsituationen anwenden — `2ae76eae-799c-463e-9ec9-82327f8209a8` (outside this book)

### Direct reverse prerequisites outside this book

- Mit Größen einheitengerecht rechnen und Ergebnisse deuten — `ca623958-c204-5d1b-bdd0-3f76765674cb` (outside this book)
- Maßstabsaufgaben mit gleichartigen Längeneinheiten lösen — `79dd11f0-ed20-5b92-a215-b061a2098c0c` (outside this book)
- Größen in Sachsituationen mithilfe von Bezugsgrößen schätzen — `03a87896-088d-4b21-a37b-d0604d784540` (outside this book)
- Rechteckflächenformel aus dem Messprinzip erklären — `0bd7dc9b-c7f9-52e6-b374-a019edfd821c` (outside this book)
- Flächenformeln ebener Figuren durch Zerlegen und Ergänzen herleiten — `491e0858-e977-516e-a339-1cc2f9e9690f` (outside this book)
- Flächeninhalte ebener Figuren berechnen — `87c55be5-06a9-41e2-a0d4-c60f7c8b8078` (outside this book)
- Volumenformel des Quaders mit Einheitswürfeln plausibilisieren — `b44f038c-fb1f-527e-b9ad-382214d0328a` (outside this book)
- Volumeneinheiten deuten und umrechnen — `57fbbf31-9b8c-5408-9af5-fbc73acd12bb` (outside this book)
- Größen mit geeigneten Messmitteln erfassen — `ad26e4d9-b025-57ec-8f25-df4a2415cc62` (outside this book)
- Geschwindigkeit als abgeleitete Größe verwenden — `37bf2eb6-75a0-44c1-a988-ca0e203cb072` (outside this book)
- Maßangaben aus Quellenmaterial entnehmen — `25a3cc39-976e-58a5-b882-73baee5c037c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9bf78ebdbf7d2177c99ac7e9b497fc97d65dae6b1d14fb8205b25ea2c58e519f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `unit-and-conversion`
  - Essential understanding (DE): Eine Einheit muss zur Größenart und Größenordnung passen; beim Umrechnen bleibt die Größe gleich, während Zahlenwert und Größe der Einheit sich entsprechend dem Einheitenverhältnis gegensinnig ändern.
  - Essential understanding (EN): A unit must suit the type and scale of a quantity; conversion preserves the quantity while the numerical value and the size of the unit change inversely according to the unit relationship.
  - Observable performance (DE): Die lernende Person wählt für eine neue Messgröße eine sinnvolle Einheit, rechnet über eine begründete Einheitenbeziehung um und prüft Richtung und Größenordnung.
  - Observable performance (EN): For a new measurement quantity, the learner chooses a sensible unit, converts using a justified unit relation, and checks direction and order of magnitude.
- `normalized-comparison`
  - Essential understanding (DE): Messwerte mit verschiedenen Einheiten sind erst nach Darstellung in derselben Einheit direkt vergleichbar; Einheitenzeichen allein dürfen nicht wie Zahlen behandelt werden.
  - Essential understanding (EN): Measurements in different units are directly comparable only after expression in the same unit; unit symbols cannot be treated like numbers alone.
  - Observable performance (DE): Die lernende Person vereinheitlicht zwei Messwerte, ordnet sie und weist einen Vergleich zurück, der nur die ursprünglichen Zahlenwerte betrachtet.
  - Observable performance (EN): The learner converts two measurements to a common unit, orders them, and rejects a comparison based only on the original numerical values.

**Coverage expectations**

- required expectations: `unit-and-conversion`, `normalized-comparison`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `quantity-type`: Geld, Länge, Masse oder Zeit im BY-J5-Bereich / Money, length, mass, or time in the Bavaria year-5 scope
- `unit-relation-and-notation`: Dezimale Längenumrechnung gegenüber dem 60er-Verhältnis und gemischter Schreibweise bei Zeit / Decimal length conversion versus the factor of 60 and mixed-unit notation for time

**Application cases**

- `mixed-lengths`
  - Task demand (DE): 2,35 m, 228 cm und 0,0024 km sind in einer geeigneten gemeinsamen Einheit zu ordnen.
  - Task demand (EN): 2.35 m, 228 cm, and 0.0024 km must be ordered in a suitable common unit.
  - Expected performance (DE): Die lernende Person rechnet etwa in Meter um, erhält 2,35 m, 2,28 m und 2,4 m und begründet die Reihenfolge mit Größenordnung.
  - Expected performance (EN): The learner converts, for example, to metres, obtains 2.35 m, 2.28 m, and 2.4 m, and justifies the order by magnitude.
  - Understanding focus (DE): Der größte ursprüngliche Zahlenwert ist nicht automatisch die größte Länge.
  - Understanding focus (EN): The largest original numerical value is not automatically the greatest length.
- `mixed-time-sixty-factor-check`
  - Task demand (DE): Zwei Fahrten dauern 1 h 20 min und 75 min. Eine automatische Anzeige behauptet 1 h 20 min = 120 min. Prüfe diese Angabe, stelle beide Dauern in Minuten dar und vergleiche sie.
  - Task demand (EN): Two journeys take 1 h 20 min and 75 min. An automated display claims 1 h 20 min = 120 min. Check the claim, express both durations in minutes, and compare them.
  - Expected performance (DE): Die lernende Person verwendet 1 h = 60 min, erhält 1 h 20 min = 80 min, verwirft 120 min und begründet, dass die erste Fahrt 5 min länger dauert, ohne ihre Dauer durch das Umrechnen zu verändern.
  - Expected performance (EN): The learner uses 1 h = 60 min, obtains 1 h 20 min = 80 min, rejects 120 min, and explains that the first journey lasts 5 min longer without conversion changing its duration.
  - Understanding focus (DE): Die nichtdezimale Zeitbeziehung und die gemischte Schreibweise verlangen einen eigenständigen Transfer: Einheitenverhältnis, Werterhaltung und Vergleich in gemeinsamer Einheit bleiben maßgeblich.
  - Understanding focus (EN): The non-decimal time relationship and mixed-unit notation require independent transfer: the unit relationship, unchanged quantity, and comparison in a common unit remain decisive.
## Page 4: Ableitungsbegriff aus mittleren und momentanen Änderungsraten entwickeln

- Full learning-goal ID: `7156558c-57f1-4372-9ba7-0640c3f7cb3a`
- Goal fingerprint: `sha256:23691ece3c71e7fd248d55df6dc2acff9a3b56bee73d796f62dffcaa113c4da0`
- Page fingerprint: `sha256:0f0a666ed2cb6c8ae901322d5f73eb8fa50389deccf7ce866960ca2bea1be715`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 10 > Ableitungsbegriff und elementare Ableitungsregeln in J10 nutzen

### Canonical description

Die lernende Person kann mittlere Änderungsraten als Differenzenquotienten bestimmen, als Sekantensteigungen deuten und daraus den Übergang zur momentanen Änderungsrate als Tangentensteigung motivieren.

### Visualization

/assets/goal-visualizations/mathematik/7156558c-57f1-4372-9ba7-0640c3f7cb3a/7156558c-57f1-4372-9ba7-0640c3f7cb3a.png

- original digest: `sha256:c8be0423886df14cef2c227e581118e9240f1ce9175eccad263c1076a6574a41`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Lineare Funktionen beschreiben — `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186` (outside this book)
- Extremwert, Wertemenge und Monotonie quadratischer Funktionen aus dem Graphen bestimmen — `a1c79897-6ded-57f8-bee1-2d365a5083c9` (outside this book)

### Direct reverse prerequisites outside this book

- Grundlegende Ableitungsregeln auf elementare Funktionsterme anwenden — `9f2fc0d1-e1e7-4051-ba70-87ba1dd8dd1c` (outside this book)
- Funktions- und Ableitungsgraphen in Beziehung setzen — `5518ceb3-f668-5b52-a9b1-57653b16ca98` (outside this book)
- Monotonie und Extrema mit der ersten Ableitung untersuchen — `2850e8f6-2330-50d3-a577-d519540d9924` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:982cb4b145ccbf9a1fb96c19b62d8dc648bddc745039e36759488e68db3899da`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `average-secant`
  - Essential understanding (DE): Der Differenzenquotient [f(b)−f(a)]/(b−a) ist die mittlere Änderung pro Eingabeeinheit und die Steigung der Sekante durch die beiden Graphpunkte.
  - Essential understanding (EN): The difference quotient [f(b)−f(a)]/(b−a) is average change per input unit and the slope of the secant through the two graph points.
  - Observable performance (DE): Die lernende Person berechnet eine mittlere Änderungsrate aus zwei Funktionswerten und begründet ihre Sekantenbedeutung mit beiden Punkten und passenden Einheiten.
  - Observable performance (EN): The learner computes an average rate from two function values and explains its secant meaning using both points and suitable units.
- `limit-tangent`
  - Essential understanding (DE): Wenn der zweite Punkt an den ersten heranrückt und die Sekantensteigungen einen Grenzwert haben, beschreibt dieser die momentane Änderung als Tangentensteigung an der Stelle.
  - Essential understanding (EN): When the second point approaches the first and secant slopes have a limit, that limit describes instantaneous change as tangent slope at the point.
  - Observable performance (DE): Die lernende Person bildet nahe Sekantensteigungen und erklärt den Grenzübergang zur Tangente samt Vorzeichen der lokalen Änderung.
  - Observable performance (EN): The learner forms nearby secant slopes and explains the limit toward the tangent together with the sign of local change.

**Coverage expectations**

- required expectations: `average-secant`, `limit-tangent`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `rate-direction-units`: steigender quadratischer Graph ohne Einheit gegenüber fallendem Höhenmodell mit Metern pro Sekunde / increasing unitless quadratic graph versus falling height model in meters per second

**Application cases**

- `square-near-one`
  - Task demand (DE): Für f(x)=x²: berechne die Sekantensteigung von x=1 bis x=2 und allgemein von x=1 bis x=1+h mit h>0; erkläre die Tangentensteigung bei x=1.
  - Task demand (EN): For f(x)=x², find the secant slope from x=1 to x=2 and generally from x=1 to x=1+h with h>0; explain the tangent slope at x=1.
  - Expected performance (DE): Von 1 bis 2 beträgt die Sekantensteigung (4−1)/(2−1)=3. Für h>0 ist der Differenzenquotient ((1+h)²−1)/h=2+h; bei h→0 nähert er sich 2, der Tangentensteigung bei (1,1).
  - Expected performance (EN): From 1 to 2 the secant slope is (4−1)/(2−1)=3. For h>0, ((1+h)²−1)/h=2+h; as h→0 it tends to 2, the tangent slope at (1,1).
  - Understanding focus (DE): Sekantensteigung als von Intervallbreite abhängige Näherung.
  - Understanding focus (EN): Secant slope as an interval-width-dependent approximation.
- `falling-height`
  - Task demand (DE): Ein Höhenmodell lautet H(t)=10−t² Meter, t in Sekunden. Bestimme die mittlere Änderungsrate von t=2 bis t=3 und von t=2 bis t=2+h; deute den Grenzwert für h→0.
  - Task demand (EN): A height model is H(t)=10−t² metres, t in seconds. Find the average rate from t=2 to t=3 and from t=2 to t=2+h; interpret the limit as h→0.
  - Expected performance (DE): H(2)=6, H(3)=1, daher Sekantensteigung −5 m/s. Allgemein ist [H(2+h)−H(2)]/h=−4−h m/s, Grenzwert −4 m/s: die Höhe sinkt im Modell bei t=2 momentan mit 4 m/s.
  - Expected performance (EN): H(2)=6, H(3)=1, so secant slope is −5 m/s. Generally [H(2+h)−H(2)]/h=−4−h m/s, tending to −4 m/s: model height is decreasing instantaneously at 4 m/s at t=2.
  - Understanding focus (DE): Negatives Vorzeichen und Einheit einer momentanen Änderungsrate deuten.
  - Understanding focus (EN): Interpreting negative sign and unit of an instantaneous rate.
## Page 5: Exponentielles Wachstum in Termen, Tabellen und Graphen beschreiben

- Full learning-goal ID: `42e19186-6769-41ac-a7bf-ab39bdb50661`
- Goal fingerprint: `sha256:207a4ce985f183f29898b3f53a2e877262aae925b9eef3a3cec0b06524c04e02`
- Page fingerprint: `sha256:6bc2afd75c5c64bc75da08c9b790f68dd7f9832936cd278e2fe1683d85b4114c`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 10 > Exponentielles Wachstum, Logarithmen und Exponentialfunktionen

### Canonical description

Die lernende Person kann exponentielle Wachstums- und Zerfallsprozesse in Termen, Tabellen und Graphen beschreiben, Parameter deuten und typische Verläufe im Sachkontext erklären.

### Visualization

/assets/goal-visualizations/mathematik/42e19186-6769-41ac-a7bf-ab39bdb50661/42e19186-6769-41ac-a7bf-ab39bdb50661.jpg

- original digest: `sha256:84e5fde9f96391cadac03249b9c6ebd2510be1f2a6da58107f69a7842594a6db`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Lineare Funktionen beschreiben — `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186` (outside this book)
- Funktionswerte linearer Funktionen berechnen und deuten — `e09072f9-67d9-412c-b872-24ecbf329232` (outside this book)
- Potenzen mit rationalen Exponenten als Wurzel- und Bruchausdrücke deuten — `88abc886-cce8-55cf-b86c-eb4ba45a92d7` (outside this book)

### Direct reverse prerequisites outside this book

- Wachstums- und Abklingvorgänge exponentiell modellieren und Ergebnisse im Kontext bewerten — `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e4d623bf2bb706fcdb50c72f8fbec5294d0b4b9fc08a34b842cb40d38d6d15b5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `term-table-graph-correspondence`
  - Essential understanding (DE): In B(t)=B0·q^t sind die Werte einer Tabelle bei gleichen Zeitschritten durch denselben Faktor q verbunden; bei positivem B0 steigt der Graph für q>1 und fällt für 0<q<1.
  - Essential understanding (EN): In B(t)=B0·q^t, table values at equal time steps are connected by the same factor q; for positive B0 the graph rises for q>1 and falls for 0<q<1.
  - Observable performance (DE): Die lernende Person erzeugt aus einem fremden Kontext einen passenden Term, mindestens drei konsistente Tabellenwerte und eine qualitativ passende Graphskizze.
  - Observable performance (EN): From an unfamiliar context, the learner produces a suitable expression, at least three consistent table values, and a qualitatively matching graph sketch.
- `contextual-trajectory-meaning`
  - Essential understanding (DE): Ein prozentualer Zu- oder Abnahmesatz bezieht sich in jedem Schritt auf den gerade vorhandenen Bestand; die Änderung in Mengeneinheiten variiert deshalb.
  - Essential understanding (EN): A percentage increase or decrease in each step applies to the current amount; the change measured in quantity units therefore varies.
  - Observable performance (DE): Die lernende Person erklärt Faktor, Zeit- und Mengeneinheit sowie die Richtung des Verlaufs anhand der Daten, ohne aus wenigen Werten eine unbegrenzte reale Gültigkeit zu folgern.
  - Observable performance (EN): The learner explains factor, time and quantity units, and direction of change from the data without claiming unlimited real-world validity from a few values.

**Coverage expectations**

- required expectations: `term-table-graph-correspondence`, `contextual-trajectory-meaning`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `process`: relativer Verlust gegenüber relativer Zunahme / relative loss versus relative gain
- `representation-order`: Sachsituation zu Term und Graph gegenüber Tabelle zu Kontextdeutung / context to expression and graph versus table to contextual interpretation

**Application cases**

- `battery-capacity`
  - Task demand (DE): Ein idealisierter Akku hat zu Beginn 200 Wh und verliert pro Stunde 25% seines jeweils verbleibenden Bestands. Gib Term und Tabelle für t=0,1,2 an und zeichne eine eigene qualitativ passende Graphskizze.
  - Task demand (EN): An idealized battery initially has 200 Wh and loses 25% of its remaining amount each hour. Give an expression and table for t=0,1,2, and draw your own qualitatively appropriate graph sketch.
  - Expected performance (DE): B(t)=200·0.75^t Wh; die Werte sind 200, 150, 112.5 Wh. Die eigene Skizze beginnt bei (0,200), fällt und flacht ab; im Modell bleibt der Bestand positiv.
  - Expected performance (EN): B(t)=200·0.75^t Wh; values are 200, 150, 112.5 Wh. The learner's sketch starts at (0,200), decreases and flattens; the amount remains positive within the model.
  - Understanding focus (DE): Direkte Darstellung eines Zerfalls in drei Formen.
  - Understanding focus (EN): Direct representation of decay in three forms.
- `growing-culture-transfer`
  - Task demand (DE): Eine Modell-Tabelle zeigt für eine Kultur nach 0,1,2 Stunden 40, 60, 90 Zellen. Ordne einen Term zu, zeichne eine eigene passende Graphskizze und erkläre, warum der Zuwachs nicht konstant ist.
  - Task demand (EN): A model table shows 40, 60, 90 cells after 0,1,2 hours. Give an expression, draw your own matching graph sketch, and explain why the absolute gain is not constant.
  - Expected performance (DE): Der Faktor ist 1.5 je Stunde; N(t)=40·1.5^t. Die Zuwächse 20 und 30 sind verschieden, weil stets 50% des aktuellen Bestands hinzukommen; der skizzierte Graph steigt zunehmend steil.
  - Expected performance (EN): The factor is 1.5 per hour; N(t)=40·1.5^t. Gains of 20 and 30 differ because 50% of the current amount is added each time; the sketched graph increases with increasing steepness.
  - Understanding focus (DE): Transfer zum Wachstum und Begründung der Form.
  - Understanding focus (EN): Transfer to growth and explanation of shape.
## Page 6: Exponentielle Zunahme und Abnahme beschreiben und von linearem Wachstum abgrenzen

- Full learning-goal ID: `3010d965-b9b9-4dc5-9d04-d706725e9a30`
- Goal fingerprint: `sha256:8968498dd5be0578af5ab7d2bdceac94ca0e14aac2b95eeb98cc4b54ec903871`
- Page fingerprint: `sha256:b9ea87c97f289f59e6681d733479e18da2bac7d55dd5158fe096c48c333ad298`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 10 > Exponentielles Wachstum, Logarithmen und Exponentialfunktionen

### Canonical description

Die lernende Person kann exponentielle Zu- und Abnahme als Änderung mit konstantem Faktor je gleich großem Schritt beschreiben, veranschaulichen und von linearer Änderung mit konstanter Differenz begründet abgrenzen.

### Visualization

/assets/goal-visualizations/mathematik/3010d965-b9b9-4dc5-9d04-d706725e9a30/3010d965-b9b9-4dc5-9d04-d706725e9a30.jpg

- original digest: `sha256:8cb54e6f4b8123164737b120390fd799c6f439502aaebcd60271f5c186ffefb6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Lineare Funktionen beschreiben — `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186` (outside this book)
- Funktionswerte linearer Funktionen berechnen und deuten — `e09072f9-67d9-412c-b872-24ecbf329232` (outside this book)
- Potenzen mit rationalen Exponenten als Wurzel- und Bruchausdrücke deuten — `88abc886-cce8-55cf-b86c-eb4ba45a92d7` (outside this book)

### Direct reverse prerequisites outside this book

- Wachstums- und Abklingvorgänge exponentiell modellieren und Ergebnisse im Kontext bewerten — `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` (outside this book)
- Verdoppelungs- und Halbwertszeiten bestimmen und deuten — `c19d1f8f-b297-5a58-b1d4-26d811e4aff4` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5d7416788b6cdd26c10442e2971c5eb16f6b3df7ea92f2926b10338c5b72f879`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `difference-versus-ratio`
  - Essential understanding (DE): Lineare Änderung hat bei gleichen Schritten eine konstante Differenz, exponentielle Zu- oder Abnahme positiver Werte einen konstanten Faktor; beide können denselben Startwert und ersten Folgewert besitzen.
  - Essential understanding (EN): Linear change has a constant difference over equal steps, while exponential increase or decrease of positive values has a constant factor; both may share an initial and first subsequent value.
  - Observable performance (DE): Die lernende Person vergleicht in frischen Tabellen mehrere Differenzen und Quotienten und begründet die Modellklasse sowie die Richtung, auch wenn ein einzelner Schritt nicht unterscheidet.
  - Observable performance (EN): The learner compares several differences and ratios in fresh tables and justifies the model class and direction even when one step alone does not distinguish them.
- `graph-behaviour-from-change-rule`
  - Essential understanding (DE): Bei positivem Anfangswert führt ein fester Faktor q>1 zu beschleunigt wirkender Zunahme, 0<q<1 zu abflachender Abnahme; eine Gerade stellt dagegen eine konstante absolute Änderung dar.
  - Essential understanding (EN): With a positive initial value, a fixed factor q>1 produces increasing gains, while 0<q<1 gives a flattening decline; a straight line represents constant absolute change.
  - Observable performance (DE): Die lernende Person skizziert oder deutet aus der Änderungsregel einen passenden Verlauf und erklärt an mindestens zwei Schritten, warum der Vergleichsgraph nicht passt.
  - Observable performance (EN): The learner sketches or interprets a suitable curve from the change rule and explains using at least two steps why the comparison graph is unsuitable.

**Coverage expectations**

- required expectations: `difference-versus-ratio`, `graph-behaviour-from-change-rule`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `direction`: Zunahme und Abnahme / increase and decrease
- `evidence-form`: tabellarische Veränderungsregel gegenüber Graphvergleich / tabular change rule versus graph comparison

**Application cases**

- `same-first-step-different-law`
  - Task demand (DE): Zwei Folgen beginnen beide mit 20,25. A setzt mit 30,35 fort; B mit 31.25,39.0625. Ordne lineare bzw. exponentielle Zunahme zu und begründe.
  - Task demand (EN): Two sequences both begin 20,25. A continues 30,35; B continues 31.25,39.0625. Identify linear versus exponential growth and justify.
  - Expected performance (DE): A addiert je Schritt 5 und ist linear. B multipliziert je Schritt mit 1.25 und ist exponentiell; der gemeinsame erste Schritt entscheidet noch nicht.
  - Expected performance (EN): A adds 5 each step and is linear. B multiplies by 1.25 each step and is exponential; the common first step does not decide the type.
  - Understanding focus (DE): Direkter Vergleich trotz identischen Anfangs.
  - Understanding focus (EN): Direct comparison despite identical initial values.
- `decay-transfer`
  - Task demand (DE): Ein Bestand fällt über drei gleiche Zeitabstände von 100 auf 80, 64, 51.2. Vergleiche einen exponentiellen und einen linearen Fortsetzungsgraphen und begründe den passenden.
  - Task demand (EN): An amount falls over three equal intervals from 100 to 80, 64, 51.2. Compare exponential and linear continuation graphs and justify the suitable one.
  - Expected performance (DE): Die Faktoren sind je 0.8, die Differenzen -20,-16,-12.8 nicht konstant. Ein positiver, fallender, zunehmend flacherer Exponentialgraph passt; eine Gerade mit fester negativer Differenz nicht.
  - Expected performance (EN): Each factor is 0.8, while differences -20,-16,-12.8 are not constant. A positive, decreasing, flattening exponential graph fits; a straight line with constant negative difference does not.
  - Understanding focus (DE): Transfer zur Abnahme und graphischen Begründung.
  - Understanding focus (EN): Transfer to decay and graphical justification.
## Page 7: Logarithmus definieren und einfache Werte bestimmen

- Full learning-goal ID: `3c1d6ce7-099e-4267-9ff2-3d1526209a89`
- Goal fingerprint: `sha256:107c0d9336dce6a209fd51bbacc958e38f2065a95fea06f850e26c140f07a496`
- Page fingerprint: `sha256:d811546665682ec994ee26c43faf3e5698e02cf40fb9d97bc82d1f9e7093eef1`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 10 > Exponentielles Wachstum, Logarithmen und Exponentialfunktionen

### Canonical description

Die lernende Person kann den Logarithmus für eine positive Basis ungleich 1 und ein positives Argument als Umkehroperation des Potenzierens erläutern und in einfachen Fällen Werte mithilfe der Definition, sonst mit digitalen Werkzeugen bestimmen.

### Visualization

/assets/goal-visualizations/mathematik/3c1d6ce7-099e-4267-9ff2-3d1526209a89/3c1d6ce7-099e-4267-9ff2-3d1526209a89.jpg

- original digest: `sha256:19ac8de7eee2e6e242a1be798793f3b24ed055805aa94dcc61be2d47b109402d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Potenzen mit rationalen Exponenten als Wurzel- und Bruchausdrücke deuten — `88abc886-cce8-55cf-b86c-eb4ba45a92d7` (outside this book)

### Direct reverse prerequisites outside this book

- Wachstums- und Abklingvorgänge exponentiell modellieren und Ergebnisse im Kontext bewerten — `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` (outside this book)
- Verdoppelungs- und Halbwertszeiten bestimmen und deuten — `c19d1f8f-b297-5a58-b1d4-26d811e4aff4` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5a65598a1edabc92a9690c0739215fd570317170ddccda03f62e3ff80ed15dca`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `logarithm-is-inverse-exponent`
  - Essential understanding (DE): Für b>0, b≠1 und z>0 bedeutet log_b(z)=x genau b^x=z; die Logarithmuszahl ist der gesuchte Exponent.
  - Essential understanding (EN): For b>0, b≠1, and z>0, log_b(z)=x means exactly b^x=z; the logarithm is the required exponent.
  - Observable performance (DE): Die lernende Person formuliert eine neue Logarithmusaussage als Potenzgleichung und umgekehrt, begründet die zulässige Basis und das positive Argument und prüft einen einfachen Wert.
  - Observable performance (EN): The learner translates a fresh logarithm statement into a power equation and back, explains the valid base and positive argument, and checks a simple value.
- `tool-value-is-checked-by-definition`
  - Essential understanding (DE): Wenn ein Logarithmus nicht als einfache Potenz erkennbar ist, liefert ein digitales Werkzeug eine Näherung; ihre Plausibilität folgt aus benachbarten Potenzen oder Rückpotenzieren.
  - Essential understanding (EN): When a logarithm is not recognizable as a simple power, a digital tool gives an approximation; its plausibility follows from nearby powers or exponentiating back.
  - Observable performance (DE): Die lernende Person kennzeichnet einen digital gefundenen Wert als Näherung und prüft seine Größenordnung mit der definierenden Potenzrelation.
  - Observable performance (EN): The learner labels a digitally obtained value as an approximation and checks its magnitude against the defining power relation.

**Coverage expectations**

- required expectations: `logarithm-is-inverse-exponent`, `tool-value-is-checked-by-definition`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `exponent-kind`: ganzzahliger positiver oder negativer Exponent gegenüber nicht-einfachem Wert / positive or negative integer exponent versus non-simple value
- `reasoning-direction`: Logarithmus zu Potenzgleichung und umgekehrt / logarithm to power equation and the reverse
- `domain`: zulässige positive Basis ungleich 1 und positives Argument gegenüber unzulässiger Basis oder unzulässigem Argument / valid positive base other than 1 and positive argument versus an invalid base or argument

**Application cases**

- `exact-simple-values`
  - Task demand (DE): Bestimme log_3(81) und log_2(1/8) mit der Definition und schreibe beide als Potenzgleichungen.
  - Task demand (EN): Determine log_3(81) and log_2(1/8) from the definition and write both as power equations.
  - Expected performance (DE): 3^4=81 und 2^(-3)=1/8; daher sind die gesuchten Werte 4 und -3. Beide Basen und Argumente erfüllen die Definitionsbedingungen.
  - Expected performance (EN): 3^4=81 and 2^(-3)=1/8; hence the values are 4 and -3. Both bases and arguments satisfy the domain conditions.
  - Understanding focus (DE): Exakte Umkehrung bei zwei unterschiedlichen Exponenten.
  - Understanding focus (EN): Exact inversion with two different exponents.
- `digital-approximation-transfer`
  - Task demand (DE): Bestimme log_2(7) mit einem digitalen Werkzeug näherungsweise und prüfe die Größenordnung ohne Werkzeug. Prüfe zusätzlich, ob log_1(7) und log_2(-7) als reelle Logarithmen definiert sind, und begründe.
  - Task demand (EN): Approximate log_2(7) using a digital tool and check its order of magnitude without a tool. Also decide whether log_1(7) and log_2(-7) are defined as real logarithms, and justify.
  - Expected performance (DE): Da 2^2=4<7<8=2^3, liegt log_2(7) zwischen 2 und 3; digital etwa 2.807, und 2^2.807 ist näherungsweise 7. log_1(7) ist wegen Basis 1 unzulässig; log_2(-7) wegen negativem Argument.
  - Expected performance (EN): As 2^2=4<7<8=2^3, log_2(7) lies between 2 and 3; a tool gives about 2.807, and 2^2.807 is approximately 7. log_1(7) is inadmissible because its base is 1; log_2(-7) because its argument is negative.
  - Understanding focus (DE): Transfer zum Näherungswert mit Plausibilitätsprüfung und eigenständiger Anwendung beider Definitionsbedingungen.
  - Understanding focus (EN): Transfer to an approximate value with a plausibility check and independent application of both domain conditions.
