# AI review input: Biologie – vier aktuelle Risiko-, Genetik- und Ethik-Prüfseiten

- Book ID: `biologie-four-risk-ethics-current-native-20261010-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:e66d801826e40d472887318af9c174299e560117029832b87c701f24456d7e91`
- Selected goals: 4

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: SNP-Analysen interpretieren

- Full learning-goal ID: `1320b82e-e438-59ff-9d53-ecc9fbacae58`
- Goal fingerprint: `sha256:4f6694c0fa5478858b5a9a6a4c553b0351b451046003730e39aa6caa44be7824`
- Page fingerprint: `sha256:95269c8c42451004e98d25da1cc828a5a9f9f8d4f4989305cfa4938dc924c407`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann SNP-Analysen für Diagnostik/Variation auswerten.

### Visualization

/assets/goal-visualizations/biologie/1320b82e-e438-59ff-9d53-ecc9fbacae58/1320b82e-e438-59ff-9d53-ecc9fbacae58.png

- original digest: `sha256:9e0ba9ebb75a0b33545810f1719b92852bd1fa2a8b9bc9050f8c291d0d2f160b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Bioinformatik-Grundlagen — `ed4cf96f-e1c9-5784-97f2-8279ff5a31b1` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:075a40330c0b73d1cab2f53b0fbb8b448cac2e0e9628e8ad0adefcae72ac226b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Ein SNP unterscheidet eine DNA-Basenposition; der diploide Genotyp folgt nur aus geeigneten orientierten, qualitätsgeprüften Allelsignalen.
  - Essential understanding (EN): A SNP varies at one DNA base position; a diploid genotype requires correctly oriented, quality-checked allele signals.
  - Observable performance (DE): Die lernende Person identifiziert die Position, deutet valide homo-/heterozygote Signale und lässt unzureichende Daten ungeklärt.
  - Observable performance (EN): The learner identifies the position, interprets valid homozygous/heterozygous signals and leaves insufficient data unresolved.
- `e2`
  - Essential understanding (DE): Eine SNP-Assoziation oder ein Markergenotyp ist nicht automatisch Ursache, sichere Diagnose oder universell übertragbares Erkrankungsrisiko.
  - Essential understanding (EN): A SNP association or marker genotype is not automatically a cause, certain diagnosis or universally transferable disease risk.
  - Observable performance (DE): Die lernende Person wertet die gegebenen Gruppenhäufigkeiten aus, trennt absolute und relative Aussage und prüft eine alternative Erklärung.
  - Observable performance (EN): The learner evaluates supplied group frequencies, distinguishes absolute and relative conclusions and checks an alternative explanation.
- `e3`
  - Essential understanding (DE): Neue Qualitätsdaten oder eine relevante Gruppeneinteilung können die zulässige Interpretation verändern.
  - Essential understanding (EN): New quality data or relevant group stratification can change the permissible interpretation.
  - Observable performance (DE): Die lernende Person begründet beide Fälle und revidiert ihre Schlussfolgerung an einer neuen Messung oder Vergleichsbedingung selbständig.
  - Observable performance (EN): The learner justifies both cases and independently updates the conclusion after a new measurement or comparison condition.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Diploides Allelsignal gegenüber Populationsassoziation / Diploid allele signal versus population association
- `v2`: Neue Messqualität, Strangorientierung oder Störfaktorschichtung / New measurement quality, strand orientation or confounder stratification

**Application cases**

- `snp-c1`
  - Task demand (DE): Lokalisiere und charakterisiere den SNP. Bestimme die unter diesen Regeln vertretbaren Genotypen von P/Q/R und begründe die Rolle der Kontrollen und Molekülzahl. Beurteile die Behauptung: „P enthält die Variante und ist daher krank.“
  - Task demand (EN): Locate and characterize the SNP. Determine the defensible P/Q/R genotypes under these rules and explain controls and molecule count. Evaluate: “P contains the variant and therefore has a disease.”
  - Expected performance (DE): Es handelt sich um einen einzelnen G/A-Unterschied an Position 3. P erfüllt 40 Signale und 0,5/0,5: GA. Q erfüllt 30 Signale und Minderanteil 0: GG. R hat nur 10 Signale und 0,8/0,2; weder die Mindestzahl noch der Heterozygotenbereich ist erfüllt: ungeklärt, keine sichere AA/GA/GG-Aussage. Kontrollen prüfen die Funktionsfähigkeit des Assays, ersetzen aber nicht die einzelne Proben-QC. P zeigt Variation, keine hier belegte Erkrankungsdiagnose.
  - Expected performance (EN): This is a single G/A difference at position 3. P meets 40 signals and 0.5/0.5: GA. Q meets 30 signals and minor fraction 0: GG. R has only 10 signals and 0.8/0.2; minimum count and heterozygous range are unmet: inconclusive, no certain AA/GA/GG call. Controls assess assay operation but do not replace sample-specific QC. P shows variation, not a supported disease diagnosis.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
- `snp-c2`
  - Task demand (DE): Lokalisiere den SNP und bestimme anhand der gelieferten QC die Genotypen der beiden illustrativen Proben; begründe, welche Gruppeneinteilung bereits als Material gegeben ist. Bestimme beobachtete Endpunkthäufigkeiten, relative und absolute Unterschiede. Welche Aussage über Variation/Risikomarker ist vertretbar, welche Ursache oder individuelle Diagnose nicht? Nenne eine gezielte zusätzliche Vergleichsprüfung.
  - Task demand (EN): Locate the SNP and determine the genotypes of both illustrative samples using the supplied QC; explain which group classification is already supplied as material. Calculate observed endpoint frequencies and relative and absolute differences. What variation/risk-marker conclusion is defensible, and what causal or individual diagnosis is not? Specify a targeted additional comparison.
  - Expected performance (DE): An Position 3 liegt ein einzelner G/A-Unterschied vor. P_A erfüllt mit 30 unabhängigen Signalen und Anteilen 0,50/0,50 die GA-Regel; P_N erfüllt mit 25 Signalen und Minderanteil 0 die GG-Regel. Die bestandenen Kontrollen stützen die technische Auswertung; die Zuordnung aller 400 Gruppenmitglieder bleibt eine explizite Materialvorgabe und folgt nicht aus diesen zwei Beispielen. Mit A: 30/200=15%; ohne A: 10/200=5%. Relatives Verhältnis 3, absoluter Unterschied 10 Prozentpunkte. Es liegt eine Assoziation vor, keine sichere Diagnose: 170 A-Träger zeigen Z nicht und 10 Nichtträger zeigen Z. Ursache, Kopplung zu einer anderen Variante, Umwelt-/Populationsunterschiede und Stichprobenunsicherheit bleiben zu prüfen. Sinnvoll ist ein Vergleich bei gleicher U-Ausprägung sowie unabhängige Replikation; die Zahl allein beweist keine biologische Kausalität.
  - Expected performance (EN): Position 3 contains a single G/A difference. With 30 independent signals and fractions 0.50/0.50, P_A meets the GA rule; with 25 signals and minor fraction 0, P_N meets the GG rule. Passing controls support technical interpretation; classification of all 400 group members remains an explicit supplied assumption and does not follow from these two examples. With A: 30/200=15%; without A: 10/200=5%. Frequency ratio 3, absolute difference 10 percentage points. This is an association, not a certain diagnosis: 170 A carriers do not show Z and 10 noncarriers do. Causation, linkage to another variant, environmental/population differences and sampling uncertainty remain to be examined. Comparing equal U states and independent replication is useful; the numbers alone do not prove biological causality.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
## Page 2: Risikoabschätzung in Populationen

- Full learning-goal ID: `ee686aee-43d3-50df-a60a-e47ac845586c`
- Goal fingerprint: `sha256:a519e9429bf5b9072fa0f4ba15db9758546115965ed364321e08d1e2a8bb610e`
- Page fingerprint: `sha256:b150836c81078396a021c644c8e74ed482acba214dbcecd30ff28a951944c6a0`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.3 Humangenetik

### Canonical description

Die lernende Person kann genetische Risiken mit Populationsdaten und Stammbäumen abschätzen.

### Visualization

/assets/goal-visualizations/biologie/ee686aee-43d3-50df-a60a-e47ac845586c/ee686aee-43d3-50df-a60a-e47ac845586c.png

- original digest: `sha256:fe177fdec5c198a3af2634ac42bcc424b184229a7837249603fcf04c1d1c850c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Stammbäume analysieren — `440854be-7f06-5678-91cb-ba8dcab56959` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ff698a8900f80a140cd92cfbdc9ef4c6c8b67db1217d197c101702ccddb4a85f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Im gegebenen Erbmodell bestimmen Genotypen und ihre begründeten Wahrscheinlichkeiten die Risikoabschätzung; gesund bedeutet bei Rezessivität nicht automatisch kein Träger.
  - Essential understanding (EN): In the supplied inheritance model, genotypes and justified genotype probabilities determine risk; an unaffected individual is not automatically a noncarrier in recessive inheritance.
  - Observable performance (DE): Die lernende Person interpretiert den gegebenen Stammbaum und trennt bestätigten Genotyp von aus Phänotypen abgeleiteter Unsicherheit.
  - Observable performance (EN): The learner interprets the supplied pedigree and distinguishes confirmed genotype from phenotype-based uncertainty.
- `e2`
  - Essential understanding (DE): Eine geeignete Populationshäufigkeit kann ein unbekanntes Partnerrisiko ergänzen, ersetzt aber weder den Stammbaum noch gesicherte individuelle Befunde.
  - Essential understanding (EN): A suitable population frequency can inform unknown partner risk but replaces neither the pedigree nor confirmed individual evidence.
  - Observable performance (DE): Die lernende Person verbindet die passende Trägerhäufigkeit mit der richtigen Mendel-Wahrscheinlichkeit und erklärt Annahmen und Herkunft der Daten.
  - Observable performance (EN): The learner combines suitable carrier frequency with the correct Mendelian probability and explains assumptions and data origin.
- `e3`
  - Essential understanding (DE): Neue Genotypinformation, Populationseignung oder Bedingungen verändern die zulässige Rechnung; bekannte Erbgänge machen Geburten nicht zu ausgleichenden Serien.
  - Essential understanding (EN): New genotype information, population suitability or conditions change the permissible calculation; known inheritance does not make births balancing sequences.
  - Observable performance (DE): Die lernende Person begründet zwei unabhängige Abschätzungen und passt sie an frische Evidenz an, ohne Modellrisiko als individuelle Diagnose auszugeben.
  - Observable performance (EN): The learner justifies two independent estimates and updates them using fresh evidence without presenting modeled risk as an individual diagnosis.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Bestätigter Genotyp gegenüber aus Stammbaum bedingter Unsicherheit / Confirmed genotype versus pedigree-conditional uncertainty
- `v2`: Passende Zufallsreferenz, angereicherte Familiengruppe und neue individuelle Evidenz / Suitable random reference, enriched family group and new individual evidence

**Application cases**

- `risk-c1`
  - Task demand (DE): Erstelle Aa×Aa und Aa×AA und schätze das Z-Risiko eines Kindes aus Stammbaum-/Test- und Populationsinformation ab. Erkläre jede Wahrscheinlichkeit und weshalb „nicht betroffen“ beim Partner keine sichere AA-Zuordnung ist.
  - Task demand (EN): Construct Aa×Aa and Aa×AA and estimate a child’s Z risk from pedigree/test and population information. Explain each probability and why an unaffected partner is not certainly AA.
  - Expected performance (DE): Aa×Aa liefert AA1/4,Aa1/2,aa1/4; Aa×AA liefert AA1/2,Aa1/2 und kein aa. Die bekannte Person trägt mit Wahrscheinlichkeit1 a; der Partner ist nach der passenden Referenz mit50/1000=1/20 Träger. Risiko aa=(1/20)×(1/4)=1/80=1,25%. Der Phänotyp schließt aa, aber nicht Aa aus. Dies ist eine Abschätzung unter den vorgegebenen Auswahl- und Erbannahmen.
  - Expected performance (EN): Aa×Aa gives AA1/4,Aa1/2,aa1/4; Aa×AA gives AA1/2,Aa1/2 and no aa. The confirmed person is a carrier with probability1; estimated partner carrier probability is50/1000=1/20. Risk aa=(1/20)×(1/4)=1/80=1.25%. Being unaffected excludes aa but not Aa. This is an estimate under supplied sampling and inheritance assumptions.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
- `risk-c2`
  - Task demand (DE): Leite die Trägerwahrscheinlichkeit des nicht betroffenen erwachsenen Kindes aus den verbleibenden Genotypfällen ab. Wähle die passende Partnerhäufigkeit und schätze das gemeinsame Kinderrisiko. Erkläre, warum weder 1/2 noch die Trägerquote aus N unkritisch übernommen werden darf.
  - Task demand (EN): Derive the unaffected adult child’s carrier probability from remaining genotype possibilities. Choose appropriate partner frequency and estimate their child’s risk. Explain why neither1/2 nor group N’s carrier frequency can be used uncritically.
  - Expected performance (DE): Aa×Aa hat vier gleich wahrscheinliche Allelkombinationen AA,Aa,aA,aa. Unter der bekannten Nichtbetroffenheit entfällt aa; von drei verbleibenden Fällen sind zwei Träger:2/3. Partnerquote aus M=90/900=1/10, nicht300/600 aus der angereicherten Gruppe N. Unter den unabhängigen Modellannahmen ergibt sich(2/3)×(1/10)×(1/4)=1/60≈1,67%.1/2 ist die unbedingte Aa-Wahrscheinlichkeit, nicht die bedingte Wahrscheinlichkeit nach Ausschluss von aa.
  - Expected performance (EN): Aa×Aa has four equally likely allele combinations AA,Aa,aA,aa. Known unaffected status excludes aa; two of three remaining cases are carriers:2/3. Suitable partner frequency M=90/900=1/10, not300/600 from enriched group N. Under independent model assumptions risk is(2/3)×(1/10)×(1/4)=1/60≈1.67%.1/2 is the unconditional Aa probability, not the conditional probability after excluding aa.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
## Page 3: Polygenetik und multifaktorielle Erkrankungen

- Full learning-goal ID: `40334348-bd84-5ed9-b76b-5f5b80c2d145`
- Goal fingerprint: `sha256:10507945933031764849fdc4c3c1d144ff5f8f44d79d7bbc9b5665c96450d632`
- Page fingerprint: `sha256:812b26d45815f81a1425d75d7dcfa70814aae87ee11ad19d298e878b64db3d63`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.3 Humangenetik

### Canonical description

Die lernende Person kann polygenetische und multifaktorielle Vererbung erklären.

### Visualization

/assets/goal-visualizations/biologie/40334348-bd84-5ed9-b76b-5f5b80c2d145/40334348-bd84-5ed9-b76b-5f5b80c2d145.png

- original digest: `sha256:d6391d62ee5bec226bd7fc721c2c3a891e55546c8b573fe45d8aea16622c4dbc`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Stammbäume analysieren — `440854be-7f06-5678-91cb-ba8dcab56959` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4008c978023554a6444307559231b3aab69586de7e5ed274394e85a17c14c9c4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Mehrere segregierende Gene können gemeinsam ein Merkmal beeinflussen; das Modell einer einzelnen dominant-rezessiven Eigenschaft reicht dann nicht aus.
  - Essential understanding (EN): Several segregating genes can jointly influence a trait; a single dominant-recessive trait model is then insufficient.
  - Observable performance (DE): Die lernende Person leitet aus vorgegebenen Allelwirkungen verschiedene Merkmalsausprägungen ab und erklärt den Beitrag beider Gene.
  - Observable performance (EN): The learner derives different trait values from supplied allele effects and explains the contribution of both genes.
- `e2`
  - Essential understanding (DE): Multifaktoriell verbindet genetische Beiträge mit Umwelteinflüssen; ein Merkmal oder Risikowert legt den Genotyp und den individuellen Verlauf nicht eindeutig fest.
  - Essential understanding (EN): Multifactorial combines genetic contributions with environmental influences; a trait or risk value does not uniquely determine genotype or individual outcome.
  - Observable performance (DE): Die lernende Person trennt Allelvererbung, Umweltwirkung und modellierte Wahrscheinlichkeit, begründet mögliche gleiche Phänotypen und vermeidet genetischen Determinismus.
  - Observable performance (EN): The learner distinguishes allele inheritance, environmental effects and modeled probability, explains possible identical phenotypes and avoids genetic determinism.
- `e3`
  - Essential understanding (DE): Neue Kreuzungen oder Gen-Umwelt-Wechselwirkungen verlangen eine neue Erklärung aus den Bedingungen, nicht die Übernahme eines früheren Zahlenverhältnisses.
  - Essential understanding (EN): New crosses or gene-environment interactions require a new explanation from the conditions rather than reuse of an earlier ratio.
  - Observable performance (DE): Die lernende Person bearbeitet beide Fälle und die neue Bedingung selbständig und prüft, welche Modellannahmen weiter gelten.
  - Observable performance (EN): The learner independently addresses both cases and the new condition and checks which model assumptions still apply.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Genetische Kreuzung gegenüber Umwelt-/Risikomodell / Genetic cross versus environmental/risk model
- `v2`: Additive Beiträge gegenüber Gen-Umwelt-Wechselwirkung / Additive contributions versus gene-environment interaction

**Application cases**

- `poly-c1`
  - Task demand (DE): Erstelle die 16 gleich wahrscheinlichen Gametenkombinationen und ordne sie den genetischen Pigmentzahlen 0–4 zu. Erkläre, weshalb ein 3:1-Schema für ein einziges Gen nicht genügt. Vergleiche AABb bei N=0 mit AaBb bei N=1: Kann gleiche Farbe einen gleichen Genotyp beweisen?
  - Task demand (EN): Construct the 16 equally likely gamete combinations and classify them by genetic pigment count 0–4. Explain why a single-gene 3:1 scheme is insufficient. Compare AABb at N=0 with AaBb at N=1: can identical color prove identical genotype?
  - Expected performance (DE): Aus der Kombination der zwei unabhängigen 1:2:1-Verteilungen AA:Aa:aa und BB:Bb:bb ergeben sich für 0,1,2,3,4 Großbuchstaben 1,4,6,4,1 von 16 Nachkommen. Beispiel: AaBb trägt zwei, AABb drei Einheiten. Das Merkmal hängt von beiden Genen ab; Allele segregieren weiterhin, aber ihr gemeinsamer additiver Phänotyp ist keine einzelne dominant-rezessive Kategorie. AABb/N=0 ergibt 3; AaBb/N=1 ergibt ebenfalls 3. Gleiche Farbe erlaubt daher keinen eindeutigen Genotyp: Umweltwirkung ist keine neue Mutation.
  - Expected performance (EN): Combining independent AA:Aa:aa and BB:Bb:bb 1:2:1 distributions gives 1,4,6,4,1 out of 16 offspring with 0,1,2,3,4 uppercase alleles. AaBb contributes two units, AABb three. Both genes influence the trait; alleles still segregate, but the joint additive phenotype is not a single dominant-recessive category. AABb/N=0 gives 3; AaBb/N=1 also gives 3. Identical color therefore does not identify genotype: an environmental effect is not a new mutation.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
- `poly-c2`
  - Task demand (DE): Erstelle die Risikotabelle für die vier Genotypen bei E=0 und E=1. Erkläre polygen gegenüber multifaktoriell, die mögliche Rolle geteilter Gene und Umwelten innerhalb einer Familie und warum auch AABB/E=1 keine sichere Erkrankung bedeutet.
  - Task demand (EN): Construct the risk table for the four genotypes at E=0 and E=1. Explain polygenic versus multifactorial inheritance, possible shared genes and environments within a family, and why even AABB/E=1 does not mean certain disease.
  - Expected performance (DE): Bei E=0 ergeben sich AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; bei E=1 50%,45%,40%,30%. Zwei Gene tragen bei: polygen. Zusätzlich verändert E das Ergebnis: multifaktoriell. Familienähnlichkeit kann sowohl gemeinsame Allele als auch gemeinsame Umwelt einschließen. 50% ist eine Modellwahrscheinlichkeit, weder ein Beweis für Erkrankung noch für Gesundheit einer Einzelperson. Ein pauschales 3:1-Erkrankungsschema passt nicht zu dieser Konstellation.
  - Expected performance (EN): At E=0 the values are AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; at E=1 they are 50%,45%,40%,30%. Two genes contribute: polygenic. E also changes the outcome: multifactorial. Family resemblance can involve shared alleles and shared environment. 50% is a modeled probability, not proof of disease or health in one individual. A universal 3:1 disease ratio does not fit these conditions.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
## Page 4: Genetische Familienberatung ethisch bewerten

- Full learning-goal ID: `031fd4f3-906e-5919-ae7f-a2b0b9220604`
- Goal fingerprint: `sha256:acc9c0744c46694f032f7f23d8095ad85b0f145cbb031c902ed9b4927c686218`
- Page fingerprint: `sha256:668aa73cf27d57b20b43c75aebf412f9a0ebada806cd2f1e12e5e730b7e28b0d`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.3 Humangenetik

### Canonical description

Die lernende Person kann Methoden der genetischen Familienberatung gegeneinander abgrenzen, Vor- und Nachteile bewerten und in Entscheidungssituationen begründete Entscheidungen auch aus ethischer Sicht treffen.

### Visualization

/assets/goal-visualizations/biologie/031fd4f3-906e-5919-ae7f-a2b0b9220604/031fd4f3-906e-5919-ae7f-a2b0b9220604.png

- original digest: `sha256:16c5f23e5e21db2b9de05bd932a3aac61130f3523f4a5abb9a03f1249ec30d0c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Bewertungskriterien aufstellen — `a2fdcc15-8a41-5406-9900-850829498b3b` (outside this book)
- Stammbäume analysieren — `440854be-7f06-5678-91cb-ba8dcab56959` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:20f0a90465308ac9ee9cf3bc14b4f4669211f5783f5e488f809ecf550d8b2c31`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Stammbaumanalyse, gezielte Untersuchung einer bekannten familiären Variante und breite Sequenzuntersuchung beantworten unterschiedliche Fragen und haben unterschiedliche Grenzen.
  - Essential understanding (EN): Pedigree analysis, targeted testing of a known familial variant and broad sequencing address different questions and have different limitations.
  - Observable performance (DE): Die lernende Person vergleicht Methoden anhand der gegebenen Erb- und Datenlage und trennt Risikoschätzung, Variantenbefund und klinische Vorhersage.
  - Observable performance (EN): The learner compares methods using supplied inheritance and data conditions and distinguishes risk estimates, variant results and clinical predictions.
- `e2`
  - Essential understanding (DE): Eine begründete Beratungsentscheidung verbindet Zuverlässigkeit und Nutzen mit freiwilliger informierter Wahl, Nichtwissen und dem Schutz anderer Familienmitglieder.
  - Essential understanding (EN): A justified counseling decision connects reliability and usefulness with voluntary informed choice, not knowing and protection of other family members.
  - Observable performance (DE): Die lernende Person wägt Vorteile und Nachteile konkret ab, berücksichtigt vorgegebene Wünsche und begründet eine vertretbare Entscheidung statt einen Test oder eine Lebensentscheidung aufzuzwingen.
  - Observable performance (EN): The learner weighs concrete advantages and disadvantages, considers supplied preferences and justifies a defensible decision rather than imposing a test or life choice.
- `e3`
  - Essential understanding (DE): Neue Ergebnisunsicherheit, veränderte Informationswünsche oder eine andere genetische Grundlage können die vertretbare Methodenwahl verändern.
  - Essential understanding (EN): New result uncertainty, changed information preferences or a different genetic basis can change defensible method choices.
  - Observable performance (DE): Die lernende Person begründet zwei unterschiedliche Entscheidungssituationen und eine neue Bedingung mit fachlichen und ethischen Argumenten; mehrere sachgerecht begründete Wege sind möglich.
  - Observable performance (EN): The learner justifies two different decisions and a fresh condition using scientific and ethical arguments; more than one appropriately justified path is possible.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Bekannte monogene Familienvariante gegenüber multifaktorieller Unsicherheit / Known monogenic familial variant versus multifactorial uncertainty
- `v2`: Geänderte Informationswünsche und neue Variantenunsicherheit / Changed information preferences and new variant uncertainty

**Application cases**

- `counsel-c1`
  - Task demand (DE): Vergleiche M1–M3: Welche Frage beantwortet jede Methode, welchen Nutzen und welche Nachteile hat sie hier? Formuliere eine begründete, freiwillige Vorgehensentscheidung für P und den Umgang mit dem Geschwister. Benenne ausdrücklich, was die Entscheidung oder ein positiver Befund nicht festlegt.
  - Task demand (EN): Compare M1–M3: what question does each answer, and what benefits and drawbacks does it have here? Formulate a justified voluntary plan for P and handling the sibling’s preference. Explicitly state what the decision or a positive result does not determine.
  - Expected performance (DE): M1 ermöglicht Verständnis der 1/2-Vererbung, Wünscheklärung und Grenzenbesprechung, entscheidet aber nicht zwischen D/d und d/d. Bei bestätigtem freiwilligem Informationswunsch ist M2 nach Aufklärung und klarem Ergebnisumfang eine gut begründete begrenzte Option; es kann auch bei M1 geblieben oder ein Test aufgeschoben werden. M3 beantwortet hier mehr als gewünscht, mit Zusatz-/Unklarheitsbelastung ohne gelieferten Zusatznutzen. Das Geschwister wird nicht automatisch informiert oder mitgetestet; dessen eigener Informationswunsch und der Schutz familiärer Angaben werden berücksichtigt. Weder Testwahl noch Variantenbefund bestimmen allein Lebensentscheidungen, Beginn oder Schweregrad. Andere fachlich und ethisch gut begründete Entscheidungen werden akzeptiert.
  - Expected performance (EN): M1 enables understanding of 1/2 transmission, clarification of preferences and discussion of limits, but does not distinguish D/d from d/d. With confirmed voluntary desire for information, M2 after explanation and a clear result scope is a defensible bounded option; staying with M1 or postponing testing can also be justified. M3 supplies more than requested, with incidental/uncertain-result burden and no supplied added benefit. The sibling is not automatically informed or tested; their own information preference and protection of family information matter. Neither choosing a test nor finding a variant alone determines life choices, onset or severity. Other scientifically and ethically well-justified decisions are accepted.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
- `counsel-c2`
  - Task demand (DE): Vergleiche die hier sinnvollen und nicht begründeten Methoden, absolutes gegenüber relativem beobachtetem Risiko, mögliche Vorteile/Belastungen und Informationswünsche. Begründe eine Vorgehensentscheidung, die sich fachlich von der bekannten monogenen Variante im ersten Fall unterscheidet.
  - Task demand (EN): Compare useful and unsupported methods here, absolute versus relative observed risk, possible benefits/burdens and information preferences. Justify a plan that scientifically differs from the known monogenic variant in the first case.
  - Expected performance (DE): 4% gegenüber 2% entspricht einem beobachteten Verhältnis 2 und einem Unterschied 2 Prozentpunkte, nicht einer sicheren Erkrankung oder individueller 4%-Vorhersage für Q. Mehrere genetische/Umweltbeiträge und fehlende Referenzpassung machen eine monogene 1/2- oder 1/4-Regel unpassend. M1 kann zuerst die Frage, Familien-/Umweltinformation und freiwilligen Umfang klären. M2 ist ohne identifizierte passende Variante nicht begründet. M3 verlangt nachvollziehbare Aussagekraft, Grenzen- und Ergebnisumfangsklärung; mögliche Zusatz-/Unklarheitsbelastung muss gegen gelieferten Nutzen abgewogen werden. Aufschub/Verzicht oder eine weiterführende freiwillige Fachklärung sind begründbare Wege; familiäre Information wird nicht automatisch geteilt. Keine richtige Lebensentscheidung wird vorgegeben.
  - Expected performance (EN): 4% versus 2% gives an observed ratio 2 and difference 2 percentage points, not certain disease or a personal 4% prediction for Q. Multiple genetic/environmental contributions and unproven reference applicability make a monogenic 1/2 or 1/4 rule inappropriate. M1 can first clarify the question, family/environment information and voluntary information scope. M2 is unsupported without an identified relevant variant. M3 requires understandable evidence of usefulness and clarification of limits/result scope; possible incidental/uncertain-result burdens must be weighed against supplied benefits. Postponement, declining, or further voluntary specialist clarification can be justified; family information is not automatically shared. No single correct life decision is imposed.
  - Understanding focus (DE): Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.
  - Understanding focus (EN): Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations.
