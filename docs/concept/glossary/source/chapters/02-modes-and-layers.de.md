## Knotentypen (Lernmodi) {#sec:node-types}

Die pädagogischen Zielarten stehen orthogonal zur strukturellen Unterscheidung zwischen atomaren Zielen und Clustern. Siehe [Node Types](repo:docs/concept/skill-graph/node-types.md).

### Verstehen (`Understanding`) {unnumbered=true}

*EN: Understanding*

Der Standardtyp: begriffliche oder prozedurale Kompetenz, die im Lerndialog erarbeitet und geübt wird. Ein Ziel ohne spezielle Prüfungs- oder Memorierfelder ist ein Verständnisziel; Orientierungsziele sind gesondert gekennzeichnet und prüfen kein Fachwissen.

### Sich merken (`Memorize`) {unnumbered=true}

*EN: Memorize*

Ein Spaced-Repetition-Ziel für Fakten, Vokabeln, Notation oder ausgewählte Formeln. Der kontrollierte, ungeholfene Abruftest (*Verified Recall*) über **alle Pflichtkarten** eines vollständig aufgelösten Decks begründet den dauerhaften Zielabschluss; spätere SRS-Fälligkeiten entziehen eine erreichte Ziel-Mastery nicht.

### Selbstständig Probleme lösen / Prüfungsknoten (`Exam`) {unnumbered=true}

*EN: Exam*

Ein Ziel mit `examData`: eine eigenständig zu bearbeitende Prüfungs- oder Übungsaufgabe samt Musterlösung und Bewertungsschema. Im Zielmodell zeigt keine `requires`-Kante auf ein `Exam`-Ziel (Prüfungen sind Endpunkte von Voraussetzungspfaden). Eigene Anerkennungsprüfungen erklärter **Einheiten mit Prüfungen** (`coverageReviews`) belegen nach R1–R5 die selbstständige Anwendung eigener Inhaltsziele; freie Übungsaufgaben und Abiturklausuren in prüfungsfreien äußeren Einheiten sind regulär wählbar, lösen aber keine implizite Anerkennung aus.

### `examData` und Bewertung {unnumbered=true}

*EN: `examData` and scoring* — siehe [Node Types](repo:docs/concept/skill-graph/node-types.md)

Aufgabentext, Musterlösung und ein Bewertungsobjekt mit `maxPoints`, `passingPoints` und Teilpunkten je Lösungsschritt: $\mathrm{total} = \min(\sum \text{Teilpunkte}, \mathrm{maxPoints})$, bestanden genau für $\mathrm{total} \ge \mathrm{passingPoints}$. Nur das Bestehen schreibt Mastery (`1.0`); ein nicht bestandener Versuch wird im Dialog erläutert, verändert aber den gespeicherten Lernzustand nicht, sodass die Aufgabe erneut bearbeitet werden kann.

### Prüfungsmodus (`Exam Mode`) {unnumbered=true}

*EN: Exam Mode* — siehe [Node Types](repo:docs/concept/skill-graph/node-types.md)

Der Laufzeitmodus, in dem der KI-Coach als neutrale Prüfungsaufsicht agiert: Die Aufgabe wird unverändert gestellt, während der Bearbeitung werden keine inhaltlichen Hinweise gegeben, eine vollständige Abgabe wird Schritt für Schritt bewertet, und erst danach kehrt die begleitende Coach-Rolle zurück.

### Kartei und Wiederholungsplanung (`SRS` / `SM-2`) {unnumbered=true}

*EN: SRS and SM-2* — siehe [Node Types](repo:docs/concept/skill-graph/node-types.md)

Zeitgesteuerte Wiederholungsplanung nach dem SuperMemo-2-Algorithmus. Jede Karte führt `interval`, `repetition`, Leichtigkeit `ef` und `nextReview`. Eine Karte ist **fällig**, sobald `nextReview <= now` gilt oder noch kein Kartenstatus vorliegt.

### Geprüfter Abruf (`Verified recall`) {unnumbered=true}

*EN: Verified recall* — siehe [Node Types](repo:docs/concept/skill-graph/node-types.md)

Das verbindliche Abschluss-Gate für Memorierkarten: Der Coach zeigt ausschließlich die Vorderseite, die lernende Person antwortet ohne Hilfestellung, und erst danach ruft der Coach die erwartete Antwort ab und speichert `passed` oder `failed`. Reines Karteikartenüben im Cockpit ersetzt diesen Nachweis nicht.

---

## Strukturschichten und Projektion {#sec:structure-layers}

### Schichtenmodell {unnumbered=true}

*EN: Layer model* — siehe [General Goal System and Migration](repo:docs/concept/skill-graph/general-goal-system-and-migration.md)

SkillPilot trennt fünf Ebenen, die in älteren Bestandsgraphen teilweise noch vermischt waren:

:::table{cols="3.6cm,5.2cm,X"}
| Schicht | Inhalt | Beispiel |
| --- | --- | --- |
| Zielschicht (*Goal layer*) | überprüfbare Kompetenzen und fachliche Cluster | „lineare Funktionen verknüpfen“ |
| Einheits- & Programmschicht (*Unit & program layer*) | kanonische Einheits-Cluster, gemeinsame Landesplaneinheiten sowie `programUnits` | `SekI`/`SekII`, `Jahrgang 8`, `Q1`, fachliche Einheit |
| Platzierungsschicht (*Placement layer*) | Landesplan-Verortung (*geführt in* vs. *steht in*) sowie `goalPlacements` | „geführt in Q1, vorbereitet am frühesten Bedarf“ |
| Kompetenzachsen (*Competency-axis layer*) | Taxonomieeinträge | `K1 Mathematisch argumentieren` |
| Projektions- & Kartenschicht (*Projection & map layer*) | Lernzielbaum und Lernkarte aus Landesplänen / `.view.json` | `DE-BY / Gymnasium / G9 / SekII / Mathematik / LK` |
:::

### Programmeinheit {unnumbered=true}

*EN: Program unit* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Ein expliziter organisatorischer Strukturcontainer (Jahrgang, Halbjahr, Modul, Phase, Kursprofil, Prüfungsabschnitt), der über `parentUnitId` und `order` einen geordneten Baum bildet. Ein fachliches Lernziel darf nicht als Ersatz für eine Programmeinheit zweckentfremdet werden. Im Kompatibilitätsvertrag 1.2 deklariert ein `programUnits`-Eintrag der Art `learningUnit` übergangsweise eine Lerneinheit, bevor fachliche Einheiten nach `F8` als erklärte Cluster geführt werden.

### Lerneinheit (`LearningUnit`) {unnumbered=true}

*EN: Learning unit* — siehe [Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md) und [Einheitsordnung (§11.5)](repo:docs/concept/skill-graph/learning-unit-progression.md)

Ein rekursiv aufgebautes pädagogisches Ganzes im dreistufigen Modell **Cluster $\to$ Einheit $\to$ Einheit mit Prüfungen**. Im verbindlichen Zielmodell wird eine fachliche Einheit als kanonischer Cluster mit Lernversprechen, `revision`, Geschwisterfolge `after` und optionalen `coverageReviews` erklärt; eigene Ziele (`Own(U)`) und direkte Untereinheiten leiten sich aus `contains` ab, und Blatteinheiten bleiben in allen 16 Bundesländern ungeteilt in einer Planeinheit. Bis zur Migration (`F8`–`F11`) nutzen die drei bestehenden kanonischen Einheiten den Kompatibilitätsvertrag 1.2 (`programUnits` der Art `learningUnit` mit `own`-Platzierungen und `parentUnitId`; siehe [Feldreferenz](repo:docs/dev/landscape-json-field-reference.md)).

Jede Einheit erfüllt die Ordnungsregeln **E1–E4**, ohne über `after` eine technische Zugangssperre aufzubauen. Der Abschluss folgt aus Untereinheiten und eigenen Zielpflichten ohne gespeicherte Einheits-Mastery. Implizite Anerkennung eigener Inhaltsziele gilt ausschließlich in erklärten **Einheiten mit Prüfungen** (mit eigenen Prüfungen und gültigen vollständigen `coverageReviews`), die R1–R5 erfüllen ([Graph-Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)); die Laufzeitumsetzung (`F12`/`F13`) steht noch aus.

### Zielplatzierung (`Goal placement`) {unnumbered=true}

*EN: Goal placement* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Ein Eintrag, der ein unverändertes Lernziel unter einem geprüften Kontext an eine Programmeinheit anbindet (`primary`, `secondary`, `assessed`). Eine Platzierung hängt den fachlichen `contains`-Baum niemals um und erzeugt kein doppeltes Vorkommen im Standardbaum. Im Kompatibilitätsvertrag 1.2 hält `own` vorläufig das direkte Eigentum einer Lerneinheit fest, ohne etwas in den Programmbaum einzuhängen.

### Kompetenzachse {unnumbered=true}

*EN: Competency axis* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Eine orthogonale Taxonomiesicht aus `competencyCatalog` und `competencyRefs`, etwa Prozesskompetenzen `K1`–`K6`. Solche übergreifenden Kompetenzfamilien sind Taxonomieeinträge, weder Lernziele noch Programmeinheiten.

### Kompositionssicht (`Composition view`) {unnumbered=true}

*EN: Composition view* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Eine explizite, geprüfte Definition des lernendenseitigen oberen Baums für genau einen aufgelösten Kontext: Strukturknoten, Bezeichnungen, Reihenfolge und Referenzen auf kanonische Teilbaumwurzeln. Sie enthält weder neu verfasste atomare Ziele noch neue `requires`-Kanten und ist – wo vorhanden – die maßgebliche Quelle für den Standardbaum dieses Kontexts.

### Kanonische Teilbaumreferenz {unnumbered=true}

*EN: Canonical subtree reference* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Ein Verweis aus einer Kompositionssicht auf eine geprüfte Cluster-Wurzel des kanonischen Graphen; die Inhalte bleiben im kanonischen Modell. Innerhalb eines kompilierten Sichtbaums müssen expandierte Teilbaumreferenzen paarweise disjunkt sein.

### Projektionsrolle (`projectionRole`) {unnumbered=true}

*EN: Projection role* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Pro Referenz in einer Kompositionssicht deklarierte Rolle (Standardwert `target`):

- `target` — eigenes Lernziel dieses Umfangs; zählt für Navigation, Frontier, Fortschritt und Abschluss.
- `prerequisiteOnly` — reine Voraussetzung, deren globaler Lernstand Ziele freischalten oder blockieren kann, die hier aber nicht selbst als Ziel ausgewählt wird.

Rollen werden niemals implizit aus `requires`, `phase`, Jahrgang oder Schulstufe abgeleitet. Bei Überlappung entscheidet die Spezifität (direkter `goalEntry` vor Teilbaumrolle, tieferer Teilbaum vor breiterem; erst bei gleicher Spezifität gewinnt `target`).

### Gültigkeit / Anwendbarkeit (`Applicability`) {unnumbered=true}

*EN: Applicability* — siehe [Node Types](repo:docs/concept/skill-graph/node-types.md) und [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Optionale kompilierte Zielmetadaten, die Filterdimensionen (`jurisdiction`, `schoolForm`, `stage`, `durationModel`, `courseProfile`, …) auf die zulässigen Werte abbilden. Eine nicht gesetzte Dimension gilt als unbeschränkt. `applicability` ist kein Knotentyp und erzeugt niemals Elternkanten; sie blendet Ziele in gefilterten Sichten lediglich ein oder aus.

### Gültigkeits-Override (`Applicability override`) {unnumbered=true}

*EN: Applicability override* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Prüfmetadaten unter `extendedData.applicabilityOverrides`, die dokumentieren, welche aktiven Gültigkeitswerte durch eine ausdrücklich begründete Ausnahme statt durch gewöhnliche Quellenableitung ergänzt wurden. Sie dienen dem Audit; zur Laufzeit zählt weiterhin die kompilierte `applicability`.

### Einstiegskontext (`Entry scope`) {unnumbered=true}

*EN: Entry scope* — siehe [General Goal System and Migration](repo:docs/concept/skill-graph/general-goal-system-and-migration.md)

Die kleine Menge kontextueller Eingrenzungen vor der Inhaltsnavigation: Schulform, Stufe, Bundesland, Dauermodell, Kursprofil, aktueller Jahrgang oder Phase. Der Einstiegskontext wirkt als Abfrage- und Navigationsfilter und erzwingt niemals eine Duplizierung von Lernzielen.

### Aufgelöster Kontext (`Resolved scope`) {unnumbered=true}

*EN: Resolved scope* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Eine vollständig bestimmte Kombination wie `DE-HE / Gymnasium / G9 / SekII / Mathematik / LK`. Standardbäume, Einmalvorkommen und Abdeckungsprüfungen beziehen sich stets auf genau einen aufgelösten Kontext.

### Standardbaum (`Default tree`) {unnumbered=true}

*EN: Default tree* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Der eindeutige Baum, den Lernende für einen aufgelösten Kontext sehen. Jede sichtbare Kante entstammt genau einer expliziten Quelle (`contains`, `parentUnitId`, `goalPlacements` oder `competencyRefs`), niemals einer Heuristik über Titel oder `phase`. **Einmalvorkommen:** In einem aufgelösten Kontext erscheint jedes sichtbare Ziel höchstens einmal und unter höchstens einem sichtbaren Elternknoten.

### Inhaltsbaum, Programmbaum, Kompetenzsicht {unnumbered=true}

*EN: Content tree, program tree, competency view* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Die drei klassischen Sichtfamilien mit jeweils eindeutiger Strukturquelle (`contains` für Inhalt, `programUnits` + `goalPlacements` für Programm, `competencyCatalog` + `competencyRefs` für Kompetenzachsen), ergänzt um den kontextspezifischen Lernzielbaum und die Lernkarte.

### Lernzielbaum und Lernkarte {unnumbered=true}

*EN: Goal tree and learner map* — siehe [View Projection and Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)

Zwei koordinierte Darstellungen derselben aufgelösten Projektion: Der **Lernzielbaum** zeigt alle Gliederungsknoten, Einheiten, gewöhnlichen Cluster und atomaren Ziele. Die **Lernkarte** kontrahiert alle Nicht-Einheits-Cluster entlang `contains`, zeigt ausschließlich Einheiten und atomare Ziele (mit Fächern als Filter) und zeichnet Pfeile nur zwischen den direkten Kindern der geöffneten Einheit aus Geschwister-`after` und kreuzenden atomaren `requires`, ohne Rückgriffe zu verdecken.

### `phase` {unnumbered=true}

*EN: `phase`* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Kompatibilitätsmetadaten (`E`, `Q1`–`Q4`, …) für Badges, Filter oder vorläufige Standardzuordnungen (`canonicalDefault`), solange ein Landesbeleg fehlt. `phase` ist ausdrücklich **keine** kanonische Graphsemantik, ersetzt keinen Quellenbeleg und begründet niemals eine Elternschaft.

### `ALL`-Platzhalter {unnumbered=true}

*EN: `ALL`* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Ein reiner Abfrage-Platzhalter mit der Bedeutung „diese Dimension bei der Kontextauflösung nicht einschränken“. `ALL` darf niemals als gespeicherter Gültigkeits- oder Platzierungswert serialisiert werden.
