# AI review input: Biologie – gezielt korrigierte vollständige Seiten und Kontexte

- Book ID: `biologie-bio8-targeted-text-source-image-native-20261010-v4`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:4e73e21c9d5df1ae8d75abf386f37e7f9f45bf941b5f4def73b5f1e2cf5ca159`
- Selected goals: 3

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Passende Bedingungen für rekombinante Proteinexpression erklären

- Full learning-goal ID: `374e6de5-0747-57cb-99e3-e50ccb371124`
- Goal fingerprint: `sha256:e38cc7bcb98943eabf7b857eaf9043af33c44ff6ec4723a602862b843ed2935c`
- Page fingerprint: `sha256:feeba7c10d061d92c4393a41d60fbdd3c33c5b0d198661b0aba6d11499eb3833`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik > Vektoren und Transformation

### Canonical description

Die lernende Person kann an einem gegebenen Vektor-Wirt-Modell erklären, welche passenden Expressionssignale und Wirtsfunktionen zur Bildung des codierten Proteins nötig sind und weshalb die Anwesenheit der DNA allein diese Bildung nicht belegt.

### Visualization

/assets/goal-visualizations/biologie/374e6de5-0747-57cb-99e3-e50ccb371124/374e6de5-0747-57cb-99e3-e50ccb371124.png

- original digest: `sha256:17766c235f94d98bde07cf891624d9bb019ead4c6da944cc96e3227a02d67e0f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Proteinbiosynthese erklären — `475eebb4-4eb0-524f-b1ec-4a672bf856d2` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:73a46f550ac56d3af4a127a57eae8bc957f5110c3831afba2149b9f3d6070dc9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `compatible-expression`
  - Essential understanding (DE): Proteinexpression benötigt passende Regulationssignale und Wirtsfunktionen; DNA-Anwesenheit belegt sie nicht.
  - Essential understanding (EN): Protein expression requires compatible regulatory signals and host functions, and DNA presence does not establish it.
  - Observable performance (DE): Erklärt einen gegebenen Expressionsunterschied und grenzt Proteinbildung bzw. Funktionsfähigkeit bei geänderten Signalen, Translation oder Code ein.
  - Observable performance (EN): Explains a supplied expression difference and bounds protein production or functionality under changed signals, translation, or code.

**Coverage expectations**

- required expectations: `compatible-expression`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-premise`: Verschiedene belegte Ausgangsbedingungen und eine neue kausal relevante Voraussetzung je Fall. / Different demonstrated initial conditions and one fresh causally relevant premise in each case.

**Application cases**

- `expression-compatible-promoter-host`
  - Task demand (DE): Zwei Wirte enthalten denselben intakten intronfreien Protein-Code in einem Plasmid. H1 erkennt dessen Promotor und besitzt passende Transkriptions- und Translationsfunktionen. H2 erkennt den Promotor nicht. Nur H1 zeigt im Modell mRNA und das codierte Protein. DNA-Erhaltung ist für beide belegt.

Erkläre den Unterschied der Proteinbildung mit dem Vektor-Wirt-Zusammenspiel. Was belegt vorhandene DNA allein?

Frische Variation: Ein neuer Promotor wird auch in H2 erkannt und mRNA ist nachgewiesen. Eine blockierte Translation ist aber belegt. Folgt Proteinbildung?
  - Task demand (EN): Two hosts contain the same intact intron-free protein code in a plasmid. H1 recognizes its promoter and has compatible transcription and translation functions. H2 does not recognize the promoter. Only H1 shows mRNA and encoded protein; both retain the DNA.

Explain different protein production using vector-host compatibility. What does DNA presence alone establish?

Fresh variation: A replacement promoter is recognized in H2 and mRNA is demonstrated, but translation is blocked. Does protein production follow?
  - Expected performance (DE): Das funktionierende Signal erlaubt in H1 Transkription; passende Translation setzt die mRNA in das codierte Protein um. In H2 fehlt die Signal-Erkennung. DNA-Erhaltung zeigt nur die Anwesenheit des Konstrukts; sie beweist weder mRNA noch Proteinbildung.

Transfer: Nein. Die erste Lücke ist geschlossen, doch fehlende Translation verhindert die gegebene Proteinbildung. Passende Transkription allein reicht nicht.
  - Expected performance (EN): A functional signal permits H1 transcription and compatible translation converts mRNA into the encoded protein. H2 lacks signal recognition. DNA retention shows construct presence without proving mRNA or protein production.

Transfer: No. The first gap is resolved, but absent translation prevents this protein production. Compatible transcription alone is insufficient.
  - Understanding focus (DE): Proteinexpression benötigt passende Regulationssignale und Wirtsfunktionen; DNA-Anwesenheit belegt sie nicht.
  - Understanding focus (EN): Protein expression requires compatible regulatory signals and host functions, and DNA presence does not establish it.
- `expression-intact-code-processing-limit`
  - Task demand (DE): Wirt E erkennt den Promotor und transkribiert den intakten Code. Ein Proteinprodukt ist nachgewiesen; ob es für die vorgesehene Nutzung richtig gefaltet und verarbeitet ist, ist nicht untersucht. Wirt K trägt denselben Code ohne wirksames Expressionssignal und zeigt nur DNA.

Erkläre das belegte Expressionssystem und begrenze die Aussage, das fertige funktionsfähige Endprodukt sei schon gesichert.

Frische Variation: Ein mutierter Code bleibt im Plasmid erhalten; laut Zusatzkarte endet seine Translation vorzeitig. Was ändert sich trotz passendem Promotor?
  - Task demand (EN): Host E recognizes the promoter and transcribes the intact code. A protein product is demonstrated, but folding and processing required for intended use are untested. Host K contains the same code without an effective expression signal and shows DNA only.

Explain the demonstrated expression system and bound the claim that a functional final product is established.

Fresh variation: A mutated code is retained in the plasmid; an added card establishes premature translation termination. What changes despite a compatible promoter?
  - Expected performance (DE): E bietet passende Signale und Wirtsfunktionen bis zur beobachteten Proteinbildung. K bietet dies im Modell nicht. Die Proteinbildung ist in E belegt, die Funktionsfähigkeit des Nutzprodukts mangels Verarbeitungs-/Faltungsbeleg offen. Kopien der DNA beweisen sie nicht.

Transfer: Transkription kann möglich bleiben, aber der intakte Protein-Code fehlt. Das vorgesehene vollständige Protein folgt nicht aus einem passenden Promotor und vorhandener DNA.
  - Expected performance (EN): E supplies compatible signals and host functions through observed protein production, while K does not in the model. E protein production is demonstrated, but intended final functionality remains open without folding or processing evidence. DNA copies do not prove it.

Transfer: Transcription may remain possible, but intact protein coding information is lost. A compatible promoter and DNA presence do not establish the intended complete protein.
  - Understanding focus (DE): Proteinexpression benötigt passende Regulationssignale und Wirtsfunktionen; DNA-Anwesenheit belegt sie nicht.
  - Understanding focus (EN): Protein expression requires compatible regulatory signals and host functions, and DNA presence does not establish it.
## Page 2: Evo-Devo Perspektiven

- Full learning-goal ID: `9b40dae5-6d89-5714-ac96-373e72a7045e`
- Goal fingerprint: `sha256:bb7ed9ecf8b30f4910dad13461e6af36e1f7ad9725d3969cd16de24497d89a45`
- Page fingerprint: `sha256:6837c3b4beecc4caf5c19009d025d38d589af0539273bc04f7145f01d65b864d`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Evolution & Neurobiologie > Q2.2 Spannungsfeld Evolutionstheorie

### Canonical description

Die lernende Person kann Entwicklungsgenetik (Hox-Gene, Genregulation) für Evolutionsprozesse einordnen.

### Visualization

/assets/goal-visualizations/biologie/9b40dae5-6d89-5714-ac96-373e72a7045e/9b40dae5-6d89-5714-ac96-373e72a7045e.png

- original digest: `sha256:58f06bfd13395ca1d8f9b86188866494fe53594b26bcdcbcdfdcc592e735e05b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Theorien vergleichen — `ac40db32-5dc7-5c43-8771-bf805d24aa3b` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0b8069a9522c2345c729278eff86bf552f3341907b997c7c6d6a589d63752267`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `essential-1`
  - Essential understanding (DE): Hox-/Entwicklungsregulatoren wirken in Netzwerken; räumliche/zeitliche Genregulation kann Gestalt und erbliche Evolutionsvariation verändern.
  - Essential understanding (EN): Hox/developmental regulators act in networks; spatial/temporal regulation can affect form and heritable evolutionary variation.
  - Observable performance (DE): Verknüpft die gegebenen Hox-/Enhancerkarten mit Segmentidentität bzw.Timing und erklärt unveränderte Proteinfolge bei geänderter Expression.
  - Observable performance (EN): Relates supplied Hox/enhancer cards to segment identity/timing and explains unchanged protein sequence with altered expression.
- `essential-2`
  - Essential understanding (DE): Entwicklungswirkung, Plastizität, Vererbung, Selektion und Artbildung sind getrennt zu belegen; ähnliche Form kann konvergent sein.
  - Essential understanding (EN): Developmental effect, plasticity, inheritance, selection and speciation need distinct evidence; similar form may be convergent.
  - Observable performance (DE): Begrenzt sterile/umweltbedingte Eingriffe, reproduktiv ungemessene Vorteile und B/C-Verwandtschaft; behauptet keine zielgerichtete neue Art.
  - Observable performance (EN): Limits sterile/environment-induced interventions, unmeasured reproductive benefits and B/C relatedness; claims no purposeful new species.

**Coverage expectations**

- required expectations: `essential-1`, `essential-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `two-distinct-material-contexts`: Unterschiedliche Sach-/Belegkontexte mit eigener Begründung: evo-devo-hox-patterning und evo-devo-enhancer-timing-network. / Distinct subject/evidence contexts with independent reasoning: evo-devo-hox-patterning and evo-devo-enhancer-timing-network.
- `changed-premise-or-counterevidence`: Neue Merkmalslücke,Kontextänderung oder Gegenevidenz verändert die zulässige Folgerung;es genügt keine Wiederholung einer Musterantwort. / A missing trait,context change or counterevidence changes the justified inference;repeating a worked answer is insufficient.

**Application cases**

- `evo-devo-hox-patterning`
  - Task demand (DE): Hypothetische Entwicklungsgenetik: Bei Modelltier U ist ein Hox-Gen H im hinteren Segment aktiv und ein für dieses Segment typischer Anhang entsteht. Im konstruierten Eingriff wird H zusätzlich in einem vorderen Segment aktiviert; dort entsteht ein hinterer-ähnlicher Anhang. Ein Kontrollmodell hat H nur hinten. DNA-Proteinfolge von H bleibt unverändert; Aktivierungsort ist geändert. Keine echte Genmanipulation oder Behauptung über eine reale neue Art.

Auftrag: Ordne Hox-Funktion, Genregulation und mögliche evolutive Bedeutung ein. Trenne Entwicklungswirkung, erbliche Variation und Selektion; beurteile „ein Hox-Gen erzeugt zielgerichtet eine neue Art“.

Frische Variation: Der Zusatzanhang ist nicht funktionsfähig und das Tier bleibt steril. Welche evolutive Folgerung ist offen bzw. ausgeschlossen?
  - Task demand (EN): Hypothetical developmental genetics: model animal U activates Hox gene H in a posterior segment, where a characteristic appendage develops. A constructed intervention additionally activates H in an anterior segment, which develops a posterior-like appendage. Control activates H only posteriorly. H protein-coding sequence is unchanged; expression location changes. No real genetic manipulation or claim of a new actual species.

Task: Explain Hox function, regulation and possible evolutionary significance. Separate developmental effect, inherited variation and selection; assess “one Hox gene purposefully creates a new species”.

Fresh variation: The extra appendage is nonfunctional and the animal sterile. Which evolutionary inference is open or excluded?
  - Expected performance (DE): Die Modellkarte zeigt einen Zusammenhang von räumlicher Regulation und Segmentidentität; H wirkt im regulatorischen Netzwerk, nicht als alleiniger Bauplan eines ganzen Tiers. Erbliche regulatorische Änderungen könnten Variation liefern, deren Viabilität/Fruchtbarkeit und reproduktiver Erfolg dann selektionsrelevant werden. Ein einmaliger Eingriff beweist keine Vererbung, langfristige Ausbreitung oder reproduktive Isolation. Entwicklung verändert Gestalt, Artbildung benötigt weitere Populationsbedingungen.

Transfer: Die Entwicklungswirkung bleibt sichtbar, aber in diesem Fall gibt es keine Weitergabe durch diese sterile Linie. Nützliche Innovation oder Selektionsvorteil sind nicht belegt. Andere regulatorische Varianten könnten andere Wirkungen haben, müssen jedoch eigenständig geprüft werden.
  - Expected performance (EN): The card relates spatial regulation to segment identity; H acts in a regulatory network, not as a sole blueprint for the whole animal. Heritable regulatory changes could supply variation, whose viability, fertility and reproduction would matter for selection. One intervention proves neither inheritance, long-term spread nor reproductive isolation. Development affects form; speciation needs additional population conditions.

Transfer: The developmental effect remains visible, but this sterile lineage cannot transmit it by reproduction. A useful innovation or selective advantage is unproven. Other regulatory variants may differ but need independent assessment.
  - Understanding focus (DE): Hox-/Entwicklungsregulatoren wirken in Netzwerken; räumliche/zeitliche Genregulation kann Gestalt und erbliche Evolutionsvariation verändern. Entwicklungswirkung, Plastizität, Vererbung, Selektion und Artbildung sind getrennt zu belegen; ähnliche Form kann konvergent sein.
  - Understanding focus (EN): Hox/developmental regulators act in networks; spatial/temporal regulation can affect form and heritable evolutionary variation. Developmental effect, plasticity, inheritance, selection and speciation need distinct evidence; similar form may be convergent.
- `evo-devo-enhancer-timing-network`
  - Task demand (DE): Synthetische Vergleichskarte zweier Linien: Proteinfolge des Entwicklungsregulators R ist identisch. Linie A aktiviert R in Knospen an Tag 2 für 2 Zeiteinheiten; B an Tag 1 für 4. Modellkarten ordnen längere Aktivität einem größeren Anhang zu. Ein lokaler Enhancer-Unterschied ist erblich; alle anderen Netzeffekte unbekannt. Eine unabhängig entstandene dritte Linie C besitzt einen ähnlich großen Anhang, aber eine veränderte Wachstumsantwort statt dieses Enhancers.

Auftrag: Erkläre wie Genregulation Entwicklungsprozesse und damit Evolutionsvariation verändern kann, vergleiche Hox-Identitäts- und Timingmechanismus und beurteile die Verwandtschaftsbehauptung aus großer Gestalt allein.

Frische Variation: Frühere R-Aktivität entsteht nur durch wärmere Aufzucht, nicht durch erblichen Enhancer. Wie ändert sich die Einordnung?
  - Task demand (EN): Synthetic comparison: developmental regulator R has identical protein sequence in two lineages. A activates R in buds on day 2 for 2 time units; B on day 1 for 4. Model cards associate longer activity with larger appendages. A local enhancer difference is heritable; other network effects are unknown. Independent lineage C has a similarly large appendage through changed growth response rather than this enhancer.

Task: Explain how regulation can alter development and evolutionary variation, compare Hox-identity and timing mechanisms and assess relatedness inferred from large size alone.

Fresh variation: Earlier R activity results only from warmer rearing, not an inherited enhancer. How does classification change?
  - Expected performance (DE): Gleiche codierende Folge schließt regulatorische Unterschiede nicht aus; Ort, Zeit, Dauer und Stärke von Aktivität können Netzwerk-/Wachstumsverläufe ändern. Hox-Beispiel betrifft Segmentidentität, dieser Fall zeitliche Regulierung; beide sind keine bewusste Anpassung. Erbliche Variation kann Evolutionsmaterial sein, aber Fitness/Artbildung bleiben ungemessen. Gleiche Gestalt von B/C kann konvergent entstehen und beweist keinen gemeinsamen jüngsten Vorfahren.

Transfer: Eine umweltabhängige Entwicklungsreaktion/Plastizität ist belegt, keine neue erbliche Variante. Evolutionärer Wandel dieser Reaktion wäre erst über erbliche Unterschiede und reproduktive Beiträge zu prüfen; Phänotypänderung allein genügt nicht.
  - Expected performance (EN): Identical coding sequence does not exclude regulatory differences; location, timing, duration and strength can alter network/growth trajectories. The Hox example concerns segment identity, this case temporal regulation; neither is purposeful adaptation. Heritable variation can supply evolutionary material, but fitness/speciation remain unmeasured. Similar B/C form may arise convergently and proves no closest shared ancestor.

Transfer: This supports environmentally induced developmental plasticity, not a new heritable variant. Evolution of the response would require inherited differences and reproductive contributions; phenotypic change alone is insufficient.
  - Understanding focus (DE): Hox-/Entwicklungsregulatoren wirken in Netzwerken; räumliche/zeitliche Genregulation kann Gestalt und erbliche Evolutionsvariation verändern. Entwicklungswirkung, Plastizität, Vererbung, Selektion und Artbildung sind getrennt zu belegen; ähnliche Form kann konvergent sein.
  - Understanding focus (EN): Hox/developmental regulators act in networks; spatial/temporal regulation can affect form and heritable evolutionary variation. Developmental effect, plasticity, inheritance, selection and speciation need distinct evidence; similar form may be convergent.
## Page 3: Biologische Evolution des Menschen aus Fossilien rekonstruieren

- Full learning-goal ID: `430b2b73-641a-5122-bb6d-162b0d1eaf2d`
- Goal fingerprint: `sha256:67678dbba33e70b3c8a03679bd8b0c65141eba95e1db2d420d135a3db854ea83`
- Page fingerprint: `sha256:7d85d58d0be3df35394d6e060f7f3a889dc9a89cc760dc1935c5380ca7132e4e`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Vergangenheit und Zukunft des Menschen (Sek I)

### Canonical description

Die lernende Person kann aus Merkmalen fossiler Funde begründete Hypothesen zur biologischen Evolution des modernen Menschen ableiten, um eine zeitliche Reihenfolge zu rekonstruieren und deren Aussagegrenzen zu erläutern.

### Visualization

/assets/goal-visualizations/biologie/430b2b73-641a-5122-bb6d-162b0d1eaf2d/430b2b73-641a-5122-bb6d-162b0d1eaf2d.png

- original digest: `sha256:84374151a881628f70c0474d013eab950df2ab81e5bd579df31def983d27a41c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Homo sapiens systematisch einordnen — `5c7f0085-7ca8-5a67-bc87-57319acec749` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0e5a9085d37aa789483cd9a8fe3a1579039dd940022dc3f5d04d22b223fa35f1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `fossil-hypothesis-chronology`
  - Essential understanding (DE): Fossilmerkmale und Datierungen tragen begrenzte Evolutionshypothesen; Chronologie ist keine bewiesene direkte Ahnenreihe.
  - Essential understanding (EN): Fossil traits and dates support bounded evolutionary hypotheses; chronology is not a proven direct ancestry.
  - Observable performance (DE): Rekonstruiert eine zeitliche Folge, begründet eine Evolutionshypothese und überprüft sie bei neuen Merkmalen oder Fundbedingungen.
  - Observable performance (EN): Reconstructs chronology, reasons about an evolutionary hypothesis, and checks it using new traits or fossil conditions.

**Coverage expectations**

- required expectations: `fossil-hypothesis-chronology`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-premise`: Verschiedene belegte Ausgangsbedingungen und eine neue kausal relevante Voraussetzung je Fall. / Different demonstrated initial conditions and one fresh causally relevant premise in each case.

**Application cases**

- `human-reconstruction-fossil-mosaic`
  - Task demand (DE): Hypothetische Fossilkarten, keine echten Fundarten: F 1 Alter 3,0–2,6 Mio.Jahre, Becken/Bein mit Zweibeinindikatoren, kleiner Hirnschädel; F 2 Alter 1,8–1,5 Mio., ebenfalls Zweibeinindikatoren, größerer Hirnschädel; F 3 Alter 0,30–0,20 Mio., noch größerer Hirnschädel. Merkmale und Datierungen sind vereinfacht. Werkzeuge liegen bei F 2 in derselben Schicht, Hersteller nicht sicher.

Rekonstruiere zeitliche Folge und eine begründete Hypothese zur biologischen Evolution. Prüfe, ob ein direkter F1→F2→F3-Stammbaum aus den Angaben folgt.

Frische Variation: Neuer F 4-Fund 1,7–1,4 Mio.Jahre hat kleinen Hirnschädel und Zweibeinindikatoren. Wie revidierst du die lineare Hypothese?
  - Task demand (EN): Hypothetical fossil cards, not real taxa: F 1 age 3.0–2.6 million years, pelvis/leg with bipedal indicators, small braincase; F 2 age 1.8–1.5 million, same indicators, larger braincase; F 3 age 0.30–0.20 million, larger still. Traits/dates simplified. Tools occur in the F 2 layer but maker is uncertain.

Reconstruct chronology and a reasoned hypothesis of biological evolution. Assess whether a direct F1→F2→F3 ancestry follows from the supplied evidence.

Fresh variation: New F 4 at 1.7–1.4 million years has a small braincase and bipedal indicators. Revise the linear hypothesis.
  - Expected performance (DE): Die Intervalle ordnen F1 vor F2 vor F3. Im Modell könnten Zweibeinigkeit und Hirnschädelvergrößerung zeitlich versetzt verändert worden sein; Merkmale bilden ein Mosaik. Alter und Ähnlichkeit beweisen keine direkte Ahnenreihe; verzweigte Linien bleiben möglich. Werkzeuge belegen technische Aktivität, aber nicht sicher ihren Hersteller oder Sprache.

Transfer: F 4 überlappt F 2 und zeigt keine zwingende einheitliche Größenzunahme in allen Linien. Koexistenz/Verzweigung ist möglich; keine Art als minderwertige Stufe abwerten. Zusätzliche Merkmale und Fundkontexte prüfen.
  - Expected performance (EN): Intervals place F1 before F2 before F3. Bipedal traits and cranial enlargement may have changed at different times; features form a mosaic. Age and similarity do not prove a direct ancestry, and branching remains possible. Tools establish technical activity without identifying their maker or language.

Transfer: F 4 overlaps F 2 and precludes obligatory uniform enlargement across all lineages. Coexistence/branching is possible; no taxon is an inferior step. Assess more traits and contexts.
  - Understanding focus (DE): Fossilmerkmale und Datierungen tragen begrenzte Evolutionshypothesen; Chronologie ist keine bewiesene direkte Ahnenreihe.
  - Understanding focus (EN): Fossil traits and dates support bounded evolutionary hypotheses; chronology is not a proven direct ancestry.
- `human-reconstruction-environment-hypotheses`
  - Task demand (DE): Konstruierte Fundserie: vor 2,0 Mio.Jahren Funde mit Zweibeinindikatoren sowohl aus offenem als auch aus waldreichem Habitat; vor 1,5 Mio.Jahren mehr offene Fundstellen, aber deren Erhaltung/Suche ist intensiver. Hypothese H 1: ausschließlich Savannenleben erzeugte Zweibeinigkeit. H 2: verschiedene Lebensräume und Funktionen könnten beteiligt sein. Keine echte Datensammlung.

Ordne Zeiten und Merkmale, beurteile beide Evolutionshypothesen und erläutere die Grenze zwischen Fundchronologie und gesicherter direkter Abstammung.

Frische Variation: Ein fehlender Wald-Fossilfund wird als Beweis „im Wald gab es keine Zweibeinigkeit“ verwendet. Formuliere die angemessene Grenze.
  - Task demand (EN): Constructed fossil series: at 2.0 million years bipedal indicators occur in open and forest-rich habitats. At 1.5 million years more open sites occur, but preservation and searching there are more intensive. H1: bipedalism arose exclusively from savanna life. H2: different habitats and functions may have contributed. No actual collected dataset.

Order dates and traits, evaluate both evolutionary hypotheses and explain the difference between fossil chronology and established direct ancestry.

Fresh variation: Absence of a forest fossil is taken to prove “there was no bipedality in forests”. State the proper limit.
  - Expected performance (DE): Die frühe Reihe enthält beide Habitattypen; H1 ist als ausschließliche Erklärung nicht gestützt. Mehr spätere offene Fundstellen können Such- oder Erhaltungsbias sein. H2 bleibt eine prüfbare Alternative, keine bewiesene Gesamtursache. Zweibeinindikatoren begründen Funktionshypothesen; Chronologie und Ähnlichkeit belegen keine direkte Ahnenlinie.

Transfer: Fehlende Funde können fehlende Erhaltung oder Suche bedeuten. Abwesenheit eines Belegs ist hier kein sicherer Abwesenheitsbeweis; Datierung, Sedimentkontext und Suchintensität müssen berücksichtigt werden.
  - Expected performance (EN): The early series includes both habitat types, so H1 as an exclusive explanation is unsupported. More later open sites can reflect searching or preservation bias. H2 remains testable instead of a proven complete cause. Bipedal indicators support functional hypotheses; chronology and similarity do not prove direct ancestry.

Transfer: Missing finds may reflect preservation/search. Lack of evidence is not a certain absence claim here; assess dates, sediment context and search intensity.
  - Understanding focus (DE): Fossilmerkmale und Datierungen tragen begrenzte Evolutionshypothesen; Chronologie ist keine bewiesene direkte Ahnenreihe.
  - Understanding focus (EN): Fossil traits and dates support bounded evolutionary hypotheses; chronology is not a proven direct ancestry.
