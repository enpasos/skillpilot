## Curricula, Skill-Graphen und Herkunft {#sec:curricula-and-provenance}

### Curriculum / Lehrplan {unnumbered=true}

*EN: Curriculum* — siehe [Whitepaper](repo:docs/whitepaper/whitepaper.en.md)

Das externe, durch Bildungsbehörden oder Akkreditierung festgelegte Regelwerk, an das SkillPilot andockt: ein staatlicher Lehrplan, ein Modulhandbuch oder ein Standard wie der GER/CEFR. Das Curriculum bleibt die **normative Quelle**; SkillPilot erfindet keine Standards, sondern macht bestehende operational nutzbar.

Nicht identisch mit dem daraus abgeleiteten Skill-Graphen. Im Qualitäts-Dashboard bezeichnet „Curriculum“ enger gefasst eine einzelne kanonische Skill-Landschaftsdatei.

### Skill-Graph {unnumbered=true}

*EN: Skill graph* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Das versionierte, maschinenlesbare **operative Modell**, das aus einem Curriculum abgeleitet wird: Lernziele, verbunden über `contains` und `requires`, zusammen mit ihrer Semantik, ihren Gültigkeitsbedingungen und der Frontier-Logik. Den Skill-Graphen baut, validiert und navigiert SkillPilot; das Curriculum bleibt die übergeordnete normative Quelle.

### Skill-Landschaft {unnumbered=true}

*EN: Skill landscape* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Eine abgegrenzte, veröffentlichte Instanz eines Skill-Graphen: eine nach Fach und Schulform bestimmte Einheit mit stabiler `landscapeId`, betreut von Curriculum Champions, bewertet mit einem Reifegrad und ausgeliefert als Release-Paket. Eine Skill-Landschaft kann in mehrere Sprachdateien mit derselben ID serialisiert sein.

*Skill-Graph* bezeichnet das formale Modell, *Skill-Landschaft* die **konkrete** fachliche Instanz.

### Kanonische Landschaft {unnumbered=true}

*EN: Canonical landscape* — siehe [Canonical Gymnasium Rollout Policy](repo:docs/concept/skill-graph/canonical-gymnasium-rollout.md)

Eine Skill-Landschaft, die einmalig für eine gesamte Schulform gepflegt und von allen Bundesländern gemeinsam genutzt wird, statt je Land einen eigenen Graphen zu duplizieren. Länderspezifische Unterschiede werden über Gültigkeit (`applicability`) und Kompositionssichten ausgedrückt, nicht durch Kopieren von Zielen.

### Wurzelcurriculum und Curriculum-Manifest {unnumbered=true}

*EN: Root curriculum and curriculum manifest* — siehe [Levels of Personalization](repo:docs/concept/levels-of-personalization.md)

Ein Wurzelcurriculum ist eine Skill-Landschaft, die in der Oberfläche direkt auswählbar und für die Champion-Registrierung zugelassen ist. Die Menge der Wurzelcurricula wird explizit in [curricula/curriculum_manifest.json](repo:curricula/curriculum_manifest.json) deklariert; die CI schlägt fehl, wenn Manifest und berechnete Wurzelmenge voneinander abweichen.

### Quellen-Snapshot {unnumbered=true}

*EN: Source snapshot* — siehe [Curriculum-Qualität](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

Ein im Repository gespeicherter, maschinell auswertbarer Auszug eines offiziellen Curriculum-Dokuments samt offiziellem HTTP(S)-Verweis auf das Original. Abdeckungsnachweise werden ausschließlich gegen die im Repository vorliegenden Snapshots geprüft.

### Originalziel und Source-Registry {unnumbered=true}

*EN: Source goal and source registry* — siehe [Curriculum-Qualität](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

Ein Originalziel (*Source-Ziel*) ist eine Kompetenzformulierung aus dem ursprünglichen Lehrplan. Die Source-Registry verzeichnet die Originalziele und bildet deren **atomare Quellenhülle** auf kanonische Lernziele ab. Die Abdeckung wird in beide Richtungen geprüft: Jedes sichtbare atomare Lernziel benötigt einen Quellennachweis, und jedes registrierte Originalziel muss vollständig in die Sicht abgebildet werden.

### `sourceRef` vs. `resourceLinks` {unnumbered=true}

*EN: `sourceRef` vs `resourceLinks`* — siehe [Source And Resource Links](repo:docs/concept/skill-graph/source-and-resource-links.md)

`sourceRef`, Zuordnungen und Herkunftsdaten beantworten die Frage „Warum existiert dieses Lernziel?“. Offizielle Lehrplanreferenzen sind Nachweise, kein optionales Lernmaterial.

Der [Architekturrahmen für die Contentanbindung](repo:docs/concept/skill-graph/content-integration.md) legt optionale externe Lernmaterialien in separate Pakete aus, die Lernziel-IDs referenzieren; Lernende wählen Pakete unabhängig vom Curriculum. `resourceLinks` bleibt das Kompatibilitätsfeld für Bestandsressourcen und die gesondert geprüften SkillPilot-eigenen Zielvisualisierungen. Direkte externe Material-Links in kanonischen Zielen gelten als Migrationsschuld, nicht als Zielmodell.

Lernmaterial darf niemals als Herkunftsnachweis getarnt werden, und Provenienz ist kein Studienlink.

### Runtime-Paket und Ontologie-Paket {unnumbered=true}

*EN: Runtime package and ontology package* — siehe [Dual Curriculum Package Releases](repo:docs/concept/skill-graph/dual-curriculum-package-releases.md)

Die zwei äquivalenten Release-Artefakte einer Curriculum-Veröffentlichung: ein JSON-Runtime-Paket für die Anwendung und ein FWU-kompatibles Ontologie-Paket für den semantischen Datenaustausch. Beide entstehen aus derselben geprüften Release-Einheit.

---

## Im Inneren des Skill-Graphen {#sec:inside-skill-graph}

### Lernziel {unnumbered=true}

*EN: Goal* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Ein Knoten des Skill-Graphen: eine erlernbare, überprüfbare Kompetenz, in der Regel formuliert als „Die lernende Person kann …“. Jedes Lernziel besitzt eine stabile UUID `id`, einen `title` und ein strikt positives Gewicht `weight`.

Ein Jahrgang, Halbjahr, Modul, Kurstyp oder eine Phase ist **kein** Lernziel.

### Atomares Lernziel {unnumbered=true}

*EN: Atomic goal* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Ein Lernziel ohne `contains`-Kinder. Atomare Ziele bilden die überprüfbaren Grundeinheiten: Auf ihnen wird Mastery gespeichert, über ihnen wird die Frontier berechnet, und im Zielzustand verlaufen alle fachlichen `requires`-Kanten zwischen atomaren Zielen.

Die Eigenschaft ergibt sich aus der Graphstruktur, nicht aus freier Etikettierung; gespeicherte Klassifikationsmetadaten müssen mit der Struktur übereinstimmen.

### Cluster-Ziel {unnumbered=true}

*EN: Cluster goal* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Ein Lernziel mit mindestens einem `contains`-Kind. Cluster dienen der Navigation, Filterung und aggregierten Fortschrittsanzeige. Ihre Erfüllung leitet sich aus ihren atomaren Nachfahren ab und wird niemals direkt als eigenes Lernergebnis gespeichert.

### Atomare Basis {unnumbered=true}

*EN: Atomic basis* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Geschrieben $\mathrm{Atoms}(g)$: das Ziel selbst, falls es atomar ist, andernfalls die Menge seiner atomaren `contains`-Nachfahren. Ihre vollständige Beherrschung bezeugt die Erfüllung eines Clusters.

### `contains` {unnumbered=true}

*EN: `contains`* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Die modellierte Hierarchierelation $C$: $(p, c)$ bedeutet, dass Elternknoten $p$ das Kind $c$ **inhaltlich** unmittelbar enthält. Der Pfeil zeigt vom Elternknoten zum Kind. `contains` muss azyklisch sein, erlaubt aber mehrere Elternknoten (Polyhierarchie).

Vorfahren- und Nachfahrenbeziehungen ergeben sich über Pfade aus einer oder mehreren `contains`-Kanten. `contains` ist weder eine Voraussetzung noch eine Programmplatzierung.

### `requires` {unnumbered=true}

*EN: `requires`* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Die modellierte Voraussetzungsrelation $R$: $(g, p)$ bedeutet, dass Lernziel $g$ die Voraussetzung $p$ unmittelbar benötigt. Der Pfeil zeigt vom abhängigen Ziel zur Voraussetzung; $p$ muss sitzen, bevor $g$ bearbeitet wird. Die Relation muss azyklisch sein. Im verbindlichen Zielzustand verlaufen sämtliche modellierten `requires`-Kanten zwischen **atomaren** Zielen ($R \subseteq A \times A$); bestehende Voraussetzungen auf Clustern werden während der Migration über `contains`-Vererbung und atomare Expansion ausgewertet.

Sowohl `contains` als auch `requires` speichern direkte Kanten; abgeleitete Beziehungen werden berechnet und nicht als zusätzliche Kantenarten modelliert.

### Vererbte Voraussetzungen {unnumbered=true}

*EN: Inherited prerequisites* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Zusätzliche Voraussetzungen, die aus den `requires`-Verweisen der `contains`-Vorfahren eines Ziels folgen und nicht bereits direkt am Ziel selbst stehen: $R_{\mathrm{inherited}} = R_{\mathrm{eff}} \setminus R$. Bei mehreren Elternknoten tragen alle Vorfahrenpfade bei. Vererbung entlang `contains` ist begrifflich strikt von mehrstufigen Voraussetzungsketten zu unterscheiden.

### Effektive Voraussetzungen {unnumbered=true}

*EN: Effective prerequisites* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Die abgeleitete Voraussetzungsrelation $R_{\mathrm{eff}} = R \cup R_{\mathrm{inherited}}$ aus eigenen `requires`-Kanten und von `contains`-Vorfahren geerbten Voraussetzungen, auf atomare Basisziele expandiert ($R_{\mathrm{at}}$). Im vollständig atomar modellierten Zielzustand fallen modellierte und effektive Voraussetzungen auf Atomebene zusammen.

### Erreichbarkeit von Voraussetzungen {unnumbered=true}

*EN: Prerequisite reachability* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Ziele, die über eine oder mehrere Kanten der jeweiligen Voraussetzungsrelation verbunden sind, geschrieben $R^+$ bzw. $R_{\mathrm{at}}^+$. Diese transitive Hülle umfasst Einzelkanten wie längere Ketten. Eine Lernfluss-Darstellung kehrt die Pfeilrichtung um und kennzeichnet dies ausdrücklich.

### Gewicht (`weight`) {unnumbered=true}

*EN: Weight* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md) und [AGENTS.md](repo:AGENTS.md)

Eine strikt positive Zahl für den Anteil eines Lernziels am Fortschritt. Konvention in den kanonischen Landschaften: Atomare Ziele tragen `weight = 1`, Cluster die Anzahl ihrer *eindeutigen* atomaren Nachfahren, sodass mehrfach eingehängte Ziele nur einfach zählen.

### Lernziel-ID und `shortKey` {unnumbered=true}

*EN: Goal ID and `shortKey`* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

`id` ist die kanonische UUID eines Lernziels; sie darf Lernenden und Coaches angezeigt werden und ist kein geheimer Zugriffsschlüssel. `shortKey` ist ein optionaler stabiler ASCII-Bezeichner für Exporte, APIs und schichtenübergreifende Referenzen; er ist je logischer Landschaft eindeutig und ersetzt niemals `id`.

### Graphgültigkeit {unnumbered=true}

*EN: Graph validity* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Ein Graph ist gültig genau dann, wenn alle IDs eindeutig sind, `contains`, `requires` und die effektive atomare Voraussetzungsrelation azyklisch sind und beide Minimalitätsregeln gelten:

- **Lokale Minimalität:** Eine bereits von einem `contains`-Vorfahren geerbte Voraussetzung darf am Kindknoten nicht erneut notiert werden.
- **Transitive Minimalität:** Eine Kante darf nicht gesetzt sein, wenn dieselbe Voraussetzung bereits über andere effektive Voraussetzungspfade folgt.

### Motivationsanker {unnumbered=true}

*EN: Motivation anchor* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Ein atomares Orientierungsziel, das eine didaktische Route eröffnet und die Sinnfrage eines Fachs oder Themenbereichs aufschließt, etwa `Warum Physik? – Weltverständnis & Zukunft`. Routenprüfungen messen die Rückanbindung an solche Anker.

### Terminales Autonomieziel {unnumbered=true}

*EN: Terminal autonomy goal* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Ein atomares Ziel, an dem Lernende selbstständig Probleme lösen – typischerweise eine Prüfungs- oder Übungsaufgabe wie die Einzelaufgaben unter `Übungen Q2`. Es bildet den Abschluss einer didaktischen Route.

### Routenabdeckung {unnumbered=true}

*EN: Route coverage* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Die Eigenschaft, dass jedes routenrelevante atomare Lernziel auf mindestens einem Voraussetzungspfad zwischen einem Motivationsanker und einem terminalen Autonomieziel liegt. Die intendierte Lernrichtung verläuft von Orientierung über Verstehen (und begleitendes Memorieren bei Bedarf) zur selbstständigen Anwendung.
