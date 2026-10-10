# AI review input: Biologie – acht aktuelle Regulations- und Bioinformatik-Prüfseiten

- Book ID: `biologie-eight-title-methyl-current-native-20261010-v2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:9feeaa82846b7b17fc79ae39497b8152dd464fb8b7535c0414c2b5d8cd1cc48e`
- Selected goals: 8

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Genaktivität steuern

- Full learning-goal ID: `7975e43b-1187-5ae3-a1ab-282fc3c0548c`
- Goal fingerprint: `sha256:b3e7e3f1cff5d4a1110e10379d407b056410095529aa722f3d1faf21cd6ee160`
- Page fingerprint: `sha256:2b5dd8f81a89f1468871d82d7276ac600e9f61ce4e08e1292d74c814467266fd`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.1 Speicherung und Realisierung genetischer Information

### Canonical description

Die lernende Person kann Beispiele für Genregulation (Operon, epigenetische Mechanismen) erläutern.

### Visualization

/assets/goal-visualizations/biologie/7975e43b-1187-5ae3-a1ab-282fc3c0548c/7975e43b-1187-5ae3-a1ab-282fc3c0548c.png

- original digest: `sha256:4be3a5edf6c1ce5658901b63baac58a7f7995a684012751be61dc2871f35ac04`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Epigenetische Regulation — `99544494-1825-5fc1-8e23-56f0df808e56` (page 6)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Proteinbiosynthese erklären — `475eebb4-4eb0-524f-b1ec-4a672bf856d2` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- Operonsteuerung zwischen Nährlösung und Enzymaktivität — `f9637b40-93c1-5603-86e5-3d85b52d01fd` (outside this book)
- Genaktivität für Zelldifferenzierung und Anpassung erklären — `6f6ee02f-65f4-5fb4-b859-8f8c8fda0865` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c68a3c78866ddb7246fc2456e7be4d65677c7d16f0923fa7a17d48f3fd5dd490`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `operon`
  - Essential understanding (DE): Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.
  - Essential understanding (EN): An operon can coordinate transcription of related genes through regulator binding.
  - Observable performance (DE): Die lernende Person erklärt Operator, Repressor und Induktor anhand der gegebenen Bindungsregeln und begründet eine veränderte Transkription.
  - Observable performance (EN): The learner explains operator, repressor and inducer using supplied binding rules and justifies changed transcription.
- `epigenetic`
  - Essential understanding (DE): Epigenetische Mechanismen verändern regulatorische Bedingungen ohne notwendige Änderung der DNA-Basenfolge.
  - Essential understanding (EN): Epigenetic mechanisms alter regulatory conditions without necessarily changing DNA sequence.
  - Observable performance (DE): Die lernende Person erläutert DNA-Methylierung oder Histon-Modifikation als Genregulation und trennt Markierung, Genaktivität und Sequenz.
  - Observable performance (EN): The learner explains DNA methylation or histone modification as gene regulation and separates marking, gene activity and sequence.
- `transfer`
  - Essential understanding (DE): Gleiche DNA kann unterschiedlich reguliert werden; Störungen an unterschiedlichen Stellstellen haben unterschiedliche Vorhersagen.
  - Essential understanding (EN): Identical DNA can be regulated differently; perturbations at different control points have different predictions.
  - Observable performance (DE): Die lernende Person überträgt beide Beispiele auf einen neuen Eingriff und begrenzt die Aussage auf das gegebene Modell.
  - Observable performance (EN): The learner transfers both examples to a new intervention and limits the conclusion to the supplied model.

**Coverage expectations**

- required expectations: `operon`, `epigenetic`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `system`: Bakterielles Operon und eukaryotischer Promotor / Bacterial operon and eukaryotic promoter
- `time`: Reizende, Mutation und persistierende Markierung / Input removal, mutation and persistent marking

**Application cases**

- `regulation-operon-and-promoter`
  - Task demand (DE): Erkläre getrennt die beiden Mechanismen vom Eingriff bis zur Transkription. Weshalb ist die eukaryotische Änderung keine nachgewiesene Mutation? Sage beiI-Entfernung die Operonreaktion voraus; ist eine ebenso schnelle Rückkehr des eukaryotischen Zustands zwingend?
  - Task demand (EN): Explain each mechanism from intervention to transcription. Why is the eukaryotic change not an established mutation? Predict the operon response whenI is removed; must the eukaryotic state return equally quickly?
  - Expected performance (DE): I hebt die Repressorbindung auf und ermöglicht koordinierte Transkription der Gene. Demethylierung verändert in diesem Modell die regulatorische Umgebung und den Zugang, nicht die Basenfolge; die vorhandene Aktivatorwirkung bleibt nötig. NachI-Entfernung kann der intakte Repressor wieder binden und Neutranskription senken, wobei bestehende mRNA/Proteine erst abgebaut werden. Epigenetische Zustände können andere Erhaltungszeiten haben; die zwei Messpunkte geben ihre Rückkehrgeschwindigkeit nicht vor.
  - Expected performance (EN): I releases repressor binding and enables coordinated transcription of the genes. In this model demethylation changes the regulatory environment and access rather than the base sequence; the existing activator is still required. RemovingI allows an intact repressor to bind again and reduce new transcription, while existing mRNA/proteins take time to decay. Epigenetic states can have different persistence; two measurements do not specify recovery speed.
  - Understanding focus (DE): Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.
  - Understanding focus (EN): An operon can coordinate transcription of related genes through regulator binding.
- `regulation-cell-states-and-constitutive-operon`
  - Task demand (DE): Erläutere die epigenetische Erklärung der Zelltypen und die Operon-Erklärung der Mutante. Trenne in beiden Fällen Daten, gegebene Mechanismen und noch offene Ursachen. Warum ist mehr mRNA keine ausreichende Aussage über eine DNA-Mutation?
  - Task demand (EN): Explain the epigenetic account of the cell types and the operon account of the mutant. Separate data, supplied mechanisms and unresolved causes in both cases. Why is more mRNA insufficient evidence of a DNA mutation?
  - Expected performance (DE): Die Zelltypen können unterschiedliche Histonmarken und Zugang bei gleicher DNA haben; Acetylierung passt hier zu erhöhter Zugänglichkeit, doch der Wirkstoffvergleich allein beweist nicht jeden kausalen Schritt. O verändert dagegen die DNA-Bindungsstelle; der Repressor bleibt funktionsfähig, kann dort jedoch nicht hemmen. mRNA ist ein Ergebnis mehrerer Regulationswege und zeigt allein keine Sequenzänderung.
  - Expected performance (EN): Cell types can have different histone marks and access with identical DNA; acetylation fits increased accessibility here, but the drug comparison alone does not prove every causal step. O instead changes the DNA binding site; the repressor still functions but cannot inhibit there. mRNA is an outcome of multiple regulatory routes and alone shows no sequence change.
  - Understanding focus (DE): Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.
  - Understanding focus (EN): An operon can coordinate transcription of related genes through regulator binding.
## Page 2: NGS-Workflows einordnen

- Full learning-goal ID: `3f969b9e-68b0-5442-b8e4-df4e35e83087`
- Goal fingerprint: `sha256:84ab80d666370461d944fbfbc2f5120955a42b9c60253d6810d5f98356c0047a`
- Page fingerprint: `sha256:c090426f1cdb873a4b0aa99388e9007890c4a27c59d7a0dc8bb1e972789111d0`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann Next-Generation-Sequencing Schritte und Einsatzfelder skizzieren.

### Visualization

/assets/goal-visualizations/biologie/3f969b9e-68b0-5442-b8e4-df4e35e83087/3f969b9e-68b0-5442-b8e4-df4e35e83087.png

- original digest: `sha256:1da5aa53f79443f3ee171821277f3b8f66daf6b44d968812c3a725172367c12a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Bioinformatik-Grundlagen — `ed4cf96f-e1c9-5784-97f2-8279ff5a31b1` (page 3)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- PCR einsetzen — `a3f483ce-126e-595c-999c-aa4d95106221` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4219cb27ae3b7f70a57821ad66c1b64d0229f037a806d43de7ce3d0978b69382`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `workflow`
  - Essential understanding (DE): NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.
  - Essential understanding (EN): NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation.
  - Observable performance (DE): Die lernende Person skizziert die Schritte mit ihren Ein- und Ausgaben und unterscheidet DNA- und RNA-basierte Fragestellungen.
  - Observable performance (EN): The learner outlines steps with their inputs and outputs and distinguishes DNA- and RNA-based questions.
- `quality`
  - Essential understanding (DE): Messung vieler Reads ersetzt keine Qualitätskontrolle, eindeutige Zuordnung oder passende Vergleichsprobe.
  - Essential understanding (EN): Many reads do not replace quality control, unambiguous assignment or an appropriate comparison sample.
  - Observable performance (DE): Die lernende Person ordnet einen Qualitätsbefund der passenden Prozessstufe zu und begründet eine Kontrolle.
  - Observable performance (EN): The learner assigns a quality finding to the relevant workflow stage and justifies a control.
- `transfer`
  - Essential understanding (DE): Datenmengen und Probentyp beeinflussen die Interpretation; Sequenzbefund und biologische Bedeutung sind getrennt.
  - Essential understanding (EN): Data volume and sample type affect interpretation; sequence findings and biological meaning are distinct.
  - Observable performance (DE): Die lernende Person passt den Workflow an eine neue Frage oder Störung an und nennt eine Grenze der Anwendung.
  - Observable performance (EN): The learner adapts the workflow to a new question or disruption and names an application limitation.

**Coverage expectations**

- required expectations: `workflow`, `quality`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `input`: DNA-Varianten gegenüber RNA-Expression / DNA variants versus RNA expression
- `problem`: Kontamination, Bibliotheksmenge und Normalisierung / Contamination, library depth and normalization

**Application cases**

- `ngs-dna-targeted-workflow`
  - Task demand (DE): Ordne die Schritte und benenne jeweils den Zweck. Berechne den beobachteten Variantenanteil in A, begründe, weshalb dies noch keine sichere biologische Variante ist, und nenne eine Folgekontrolle. Darf das Panel alle genomischen Veränderungen ausschließen?
  - Task demand (EN): Order the steps and identify each purpose. Calculate the observed variant fraction in A, explain why this is not yet a secure biological variant and name a follow-up control. Can the panel exclude every genomic change?
  - Expected performance (DE): Reihenfolge: Isolation/Leerkontrolle→Qualität/Identität→gezielte indizierte Bibliothek→parallele Sequenzierung→Read-/Adapter-QC→Referenzalignment/Variantenkandidaten→Interpretation. Anteil8/20=40%. Sequenzreads sind Messdaten, keine automatisch bestätigte Mutation: dieselbe Abweichung in der Leerkontrolle weist auf mögliche Kontamination, Fehlzuordnung oder Artefakte hin. Neue unabhängige Extraktion mit sauberer Kontrolle und gegebenenfalls anderer Bestätigungstechnik ist nötig. Das Panel kann über nicht untersuchte Regionen nichts ausschließen.
  - Expected performance (EN): Order: extraction/blank→quality/identity→targeted indexed library→parallel sequencing→read/adapter QC→reference alignment/variant candidates→interpretation. Fraction8/20=40%. Reads are measurements, not automatically a confirmed mutation: the same difference in the blank indicates possible contamination, misassignment or artifacts. A new independent extraction with a clean control and, where appropriate, another confirmation technique is needed. A panel excludes nothing in unexamined regions.
  - Understanding focus (DE): NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.
  - Understanding focus (EN): NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation.
- `ngs-rna-depth-versus-expression`
  - Task demand (DE): Skizziere den Zweck der Stufen. Vergleiche G undH nach der gegebenen Normalisierung und widerlege die Aussage: Beide Gene sind wegen größerer Rohcounts hochreguliert. Welcher zusätzliche Versuch ist für eine biologische Schlussfolgerung nötig?
  - Task demand (EN): Outline the purpose of the stages. Compare G andH after the supplied normalization and challenge: both genes are upregulated because raw counts are larger. What additional experiment is needed for a biological conclusion?
  - Expected performance (DE): Die Bibliothek macht RNA-Information sequenzierbar und unterscheidet Proben; Sequenzierung erzeugt Reads, Analyse prüft/ordnet sie, Interpretation verbindet Daten und Frage. G:100/1=100CPM,200/2=100CPM, Verhältnis1. H:50CPM und150CPM, Verhältnis3. Doppelte Sequenziertiefe erklärt die G-Rohcountzunahme; H zeigt in diesem konstruierten Datensatz einen höheren normalisierten Wert. Biologische Replikate und passende Kontrollbedingungen sind nötig; ohne sie keine Signifikanz oder sichere Ursache.
  - Expected performance (EN): The library makes RNA information sequenceable and distinguishes samples; sequencing creates reads, analysis checks/assigns them, interpretation links data to the question. G:100/1=100CPM,200/2=100CPM, ratio1. H:50CPM and150CPM, ratio3. Doubled sequencing depth explains G raw-count increase; H has a higher normalized value in this constructed dataset. Biological replicates and appropriate controls are needed; without them neither significance nor a secure cause follows.
  - Understanding focus (DE): NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.
  - Understanding focus (EN): NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation.
## Page 3: Bioinformatik-Grundlagen

- Full learning-goal ID: `ed4cf96f-e1c9-5784-97f2-8279ff5a31b1`
- Goal fingerprint: `sha256:7a9b5c050ffcc247063d596b7ced8d2f9155e91c719c4ede3e4fd2cdef6c0c02`
- Page fingerprint: `sha256:5d02945f615f57181454731f8296c9c7a55847823acf09a525c9d7e9b57ddebf`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann Sequenzdaten auswerten (Alignment/BLAST) und Qualitätskriterien erklären.

### Visualization

/assets/goal-visualizations/biologie/ed4cf96f-e1c9-5784-97f2-8279ff5a31b1/ed4cf96f-e1c9-5784-97f2-8279ff5a31b1.png

- original digest: `sha256:2ac42ff123bb965baccb480cf6db1735da46b4d1c8e03014aaf44958767952ed`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- NGS-Workflows einordnen — `3f969b9e-68b0-5442-b8e4-df4e35e83087` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- SNP-Analysen interpretieren — `1320b82e-e438-59ff-9d53-ecc9fbacae58` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f2bb343b981553afdfceaebe276fc2422d4966c6a916acdba76721f7fb761c64`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `alignment`
  - Essential understanding (DE): Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.
  - Essential understanding (EN): An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage.
  - Observable performance (DE): Die lernende Person wertet die gegebene Ausrichtung aus und erklärt Identität, Lücken und Queryabdeckung mit explizitem Nenner.
  - Observable performance (EN): The learner evaluates the supplied alignment and explains identity, gaps and query coverage with explicit denominators.
- `quality`
  - Essential understanding (DE): BLAST-Signifikanz hängt unter anderem von Länge, Datenbank und Komplexität ab und bestätigt nicht allein Funktion oder Diagnose.
  - Essential understanding (EN): BLAST significance depends among other factors on length, database and complexity and does not by itself establish function or diagnosis.
  - Observable performance (DE): Die lernende Person vergleicht die bereitgestellten Treffer anhand von Abdeckung, Identität, E-Wert und Datenqualität und trennt Kandidaten von Beweisen.
  - Observable performance (EN): The learner compares supplied hits using coverage, identity, E-value and data quality and separates candidates from proof.
- `transfer`
  - Essential understanding (DE): Neue Sequenz- oder Datenbankinformation kann eine Interpretation verändern; reproduzierbare Suche braucht dokumentierte Eingaben.
  - Essential understanding (EN): New sequence or database information can change interpretation; reproducible searching requires documented inputs.
  - Observable performance (DE): Die lernende Person deutet eine neue Lücke, Qualitätsstörung oder Datenbankänderung und begründet einen passenden Kontrollschritt.
  - Observable performance (EN): The learner interprets a new gap, quality defect or database change and justifies an appropriate control step.

**Coverage expectations**

- required expectations: `alignment`, `quality`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `alignment-type`: Mismatch und Lücke, kurzer lokaler und langer Treffer / Mismatch and gap, short local and long match
- `quality-change`: Datenbankumfang, Wiederholungen und Readqualität / Database size, repetitions and read quality

**Application cases**

- `bioinformatics-alignment-and-local-hit`
  - Task demand (DE): Bestimme Mismatchposition und Identität in Alignment1. Berechne Queryabdeckung und Identität für A/B und begründe den geeigneteren Kandidaten für eine umfassende Ähnlichkeitsaussage. Welche biologische Aussage bleibt trotzdem offen?
  - Task demand (EN): Determine mismatch position and identity in alignment1. Calculate query coverage and identity for A/B and justify the better candidate for a broad similarity statement. Which biological conclusion remains unresolved?
  - Expected performance (DE): Alignment1 hat an Position5 T stattA:11/12=91,7% Identität. A:20/100=20% Abdeckung,20/20=100% Identität; B:95% Abdeckung,84/95≈88,4% Identität. B bietet längere, signifikante Übereinstimmung für die ganze Query; A kann nur einen kurzen Abschnitt betreffen. E=1e-25 beschreibt Zufallstreffersignifikanz unter Suchbedingungen, nicht Funktion, Verwandtschaftsgrad mit Gewissheit oder Diagnose. Funktion benötigt passende Annotation und weitere biologische Befunde.
  - Expected performance (EN): Alignment1 differs at position5 with T instead ofA:11/12=91.7% identity. A:20/100=20% coverage,20/20=100% identity; B:95% coverage,84/95≈88.4% identity. B provides longer significant agreement for the whole query; A may concern only a short region. E=1e-25 describes chance-hit significance under search conditions rather than function, certain evolutionary relation or diagnosis. Function needs suitable annotation and further biological evidence.
  - Understanding focus (DE): Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.
  - Understanding focus (EN): An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage.
- `bioinformatics-quality-and-database`
  - Task demand (DE): Vergleiche R/U vor dem Trimmen anhand von Queryabdeckung, Identität, E-Wert und Komplexität. Bestimme anhand der expliziten Positionen, welche U-Positionen durch das Trimmen entfernt werden, und gib den U-Bereich in der neu nummerierten Query an. Berechne die Abdeckung des erhaltenen U-Alignments relativ zu 120 und zu 110. Erkläre, warum ein gefilterter Trefferverlust nicht bedeutet, dass die biologische Sequenz verschwunden ist, und warum aus der neuen Abdeckung allein kein neuer E-Wert folgt.
  - Task demand (EN): Compare R/U before trimming using query coverage, identity, E-value and complexity. Use the explicit coordinates to identify which U positions trimming removes and locate U within the renumbered query. Calculate coverage of the retained U alignment relative to 120 and to 110. Explain why losing a filtered hit does not mean the biological sequence disappeared and why the changed coverage alone does not determine a new E-value.
  - Expected performance (DE): Vor dem Trimmen: R deckt 30/120=25% ab und betrifft einen wenig informativen Repeat. U deckt 85/120≈70,8% ab, mit Identität 80/85≈94,1%; sein kleiner gegebener E-Wert und vielfältiger Abschnitt machen ihn zum besseren Ähnlichkeitskandidaten. Entfernt werden nur Originalpositionen 1–10. Diese schneiden den U-Bereich 31–115 nicht, somit bleiben alle 85 U-Positionen und 80 Identitäten erhalten. In der neu nummerierten Query liegt U an Positionen 21–105; 105−21+1=85. Die Abdeckung beträgt jetzt 85/110≈77,3%, während die Identität 80/85 unverändert bleibt. Dies wertet das gegebene erhaltene Alignment aus und behauptet keinen tatsächlich neu ausgeführten Suchlauf. Ein neuer E-Wert folgt nicht allein aus dieser Abdeckung; er muss für die neue Query unter dokumentierten Suchbedingungen gesondert ermittelt werden. Filterung verändert die Suchauswertung, nicht rückwirkend die DNA. Qualität und Region bleiben vor einer Funktionsbehauptung zu prüfen.
  - Expected performance (EN): Before trimming: R covers 30/120=25% and concerns an uninformative repeat. U covers 85/120≈70.8%, with identity 80/85≈94.1%; its small supplied E-value and diverse region make it the better similarity candidate. Only original positions 1–10 are removed. They do not intersect U positions 31–115, so all 85 U positions and 80 identities remain. In the renumbered query U occupies positions 21–105; 105−21+1=85. Coverage is now 85/110≈77.3%, whereas identity remains 80/85. This evaluates the supplied retained alignment rather than claiming an actual new search. Changed coverage alone does not determine a new E-value; this needs separate calculation for the new query under documented search conditions. Filtering changes search evaluation rather than retroactively changing DNA. Quality and region still need checking before a functional claim.
  - Understanding focus (DE): Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.
  - Understanding focus (EN): An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage.
## Page 4: Regulationsmodelle vergleichen

- Full learning-goal ID: `52ecc72a-a65b-53a0-851e-86defe769fa7`
- Goal fingerprint: `sha256:a0162f94f33558df51119f259b8e28be34a2e33f87a540953fd7d708d89eb7e1`
- Page fingerprint: `sha256:393ca6323714417b9352439d675de6c898518027f01d74457ac790e3e81d1380`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.5 Modelle zur Steuerung der Genaktivität

### Canonical description

Die lernende Person kann verschiedene Modelle der Gensteuerung erläutern.

### Visualization

/assets/goal-visualizations/biologie/52ecc72a-a65b-53a0-851e-86defe769fa7/52ecc72a-a65b-53a0-851e-86defe769fa7.png

- original digest: `sha256:4541e36d3610f263d27a5c0a8e1b65a73702864670b907787c55d800b2211d8f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Komplexe Rückkopplungen oder Signalwege beschreiben — `3312b2bb-bc90-5c0f-a859-4b4f9b8ff117` (page 5)
- Transkriptionsnetzwerke — `666fb1d1-09a8-55a3-acd5-efe311cac8b0` (page 8)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:406db5f982e631f0475df3f724dda734f63c6d8dc15c3c8b36cc6cfd629f548b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `models`
  - Essential understanding (DE): Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.
  - Essential understanding (EN): Models describe different control points in gene regulation and must be explained with their assumptions.
  - Observable performance (DE): Die lernende Person erklärt mindestens zwei bereitgestellte Modelle anhand von Regulator, Ziel und Wirkungsrichtung.
  - Observable performance (EN): The learner explains at least two supplied models in terms of regulator, target and effect direction.
- `discrimination`
  - Essential understanding (DE): Ein gleicher Endwert kann durch unterschiedliche Mechanismen entstehen; eine unterscheidende Störung ist aussagekräftiger.
  - Essential understanding (EN): Identical output can arise from different mechanisms; a discriminating perturbation is more informative.
  - Observable performance (DE): Die lernende Person vergleicht Modellvorhersagen bei geänderten Bedingungen und nennt eine Beobachtung, die die Modelle unterscheidet.
  - Observable performance (EN): The learner compares model predictions under changed conditions and names an observation that distinguishes them.
- `transfer`
  - Essential understanding (DE): Ein Modell ist eine begrenzte Erklärung; neue Zeit- oder Eingriffsdaten können es einschränken.
  - Essential understanding (EN): A model is a bounded explanation; new timing or intervention data can constrain it.
  - Observable performance (DE): Die lernende Person passt ihre begründete Erklärung an einen neuen Fall an und nennt verbleibende Alternativen.
  - Observable performance (EN): The learner adapts a justified explanation to a new case and names remaining alternatives.

**Coverage expectations**

- required expectations: `models`, `discrimination`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `control`: Repressorbindung gegenüber Chromatinzugang / Repressor binding versus chromatin access
- `logic`: Induktion gegenüber Endproduktrepression / Induction versus end-product repression

**Application cases**

- `models-access-versus-repressor`
  - Task demand (DE): Erläutere beide Modelle mit einem Pfeilschema. Weshalb unterscheiden 2 und40 die Modelle allein nicht? Welche neue Beobachtung passt zu C, und weshalb darf R nicht ohne Weiteres als vollständiges Zellmodell übertragen werden?
  - Task demand (EN): Explain both models with an arrow scheme. Why do values2 and40 alone not distinguish them? Which new observation fits C, and why cannot R simply be transferred as a complete cell model?
  - Expected performance (DE): R: Reiz⊣Repressorbindung⊣Transkription; doppelte Hemmung wirkt aktivierend. C: Reiz→Chromatinzugang, mit Aktivator→Transkription. Gleiche Endwerte sagen nicht, wo die Regulation sitzt. Spezifisch inaktive Chromatinöffnung und weiterhin wenig mRNA stützen die notwendige Zugangsrolle von C. R enthält keinen Nukleosomenzugang und stammt aus einem anderen Modellkontext; es erklärt den Eingriff nicht ohne Erweiterung. Nebenwirkungen und weitere Stellstellen müssen trotz angenommener Spezifität durch Kontrollen geprüft werden.
  - Expected performance (EN): R: input⊣repressor binding⊣transcription; double inhibition activates. C: input→chromatin access, together with activator→transcription. Equal outputs do not locate the control point. Specifically inactive chromatin opening with little mRNA supports the access requirement in C. R includes no nucleosome-access step and belongs to a different model context; it cannot explain this intervention without extension. Controls should test other effects and control points even when specificity is assumed.
  - Understanding focus (DE): Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.
  - Understanding focus (EN): Models describe different control points in gene regulation and must be explained with their assumptions.
- `models-induction-versus-repression`
  - Task demand (DE): Gib für X niedrig/hoch beziehungsweise Y niedrig/hoch Repressorbindung und Genaktivität an. Erkläre, warum beide Modelle mit einem Repressor arbeiten, aber ein Stoffanstieg gegensätzliche Wirkungen hat. Wie passt dies zu Abbau und Synthese?
  - Task demand (EN): State repressor binding and gene activity for low/high X and low/high Y. Explain why both models use a repressor but an increase in a substance has opposite effects. How does this fit degradation and synthesis?
  - Expected performance (DE): I: X niedrig→R bindet→niedrig; X hoch→R inaktiv→hoch. E: Y niedrig→T inaktiv→hoch; Y hoch→T aktiv/bindet→niedrig. Entscheidend ist, ob der Stoff den Repressor inaktiviert oder aktiviert. Abbau wird bei vorhandenem Substrat ermöglicht; Synthese wird bei genügend Endprodukt begrenzt. Die Regeln sind Regulationsmodelle, keine Aussage, dass alle Gene in Bakterien so gesteuert werden.
  - Expected performance (EN): I: low X→R bound→low; high X→R inactive→high. E: low Y→T inactive→high; high Y→T active/bound→low. The key distinction is whether the substance inactivates or activates the repressor. Degradation is enabled when substrate is available; synthesis is limited when enough end product is present. These are control models, not a claim that all bacterial genes behave this way.
  - Understanding focus (DE): Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.
  - Understanding focus (EN): Models describe different control points in gene regulation and must be explained with their assumptions.
## Page 5: Komplexe Rückkopplungen oder Signalwege beschreiben

- Full learning-goal ID: `3312b2bb-bc90-5c0f-a859-4b4f9b8ff117`
- Goal fingerprint: `sha256:847802f46d349cd279fd77082132002edadd3d513f8c06ade08acd2e10fcaea2`
- Page fingerprint: `sha256:6f88c506194cc2f5473c278c27a7b9d21a1f29ddff209208ef8f5f00649d2a33`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.5 Modelle zur Steuerung der Genaktivität

### Canonical description

Die lernende Person kann komplexe Rückkopplungen oder Signalwege beschreiben.

### Visualization

/assets/goal-visualizations/biologie/3312b2bb-bc90-5c0f-a859-4b4f9b8ff117/3312b2bb-bc90-5c0f-a859-4b4f9b8ff117.png

- original digest: `sha256:c90516fa6c9531aaf2940e5759cebaa6f7a8ee3d98782ba72b29ee2b46f69147`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Regulationsmodelle vergleichen — `52ecc72a-a65b-53a0-851e-86defe769fa7` (page 4)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:df88898d29d8dfaaa94d05f9f7c7613b5ae044b3cad3a6c8feb18cd7e6a7edab`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `feedback`
  - Essential understanding (DE): Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.
  - Essential understanding (EN): A gene product can affect its further production; direction and delay shape the time course.
  - Observable performance (DE): Die lernende Person beschreibt die Rückkopplung und erklärt jeden Übergang des bereitgestellten Modells.
  - Observable performance (EN): The learner describes the feedback and explains each transition in the supplied model.
- `signal`
  - Essential understanding (DE): Ein Signalweg verbindet Eingangsreiz, Regulatoren und Genaktivität mit unterscheidbaren Zwischenschritten.
  - Essential understanding (EN): A signal pathway connects an input, regulators and gene activity through distinct intermediate steps.
  - Observable performance (DE): Die lernende Person ordnet Signal, Regulator und Genprodukt und deutet den zeitlichen Verlauf statt eine bloße Gleichzeitigkeit als Ursache auszugeben.
  - Observable performance (EN): The learner identifies input, regulator and gene product and interprets timing without treating coincidence as causation.
- `transfer`
  - Essential understanding (DE): Eine geänderte Rückkopplung oder ein unterbrochener Signalweg verändert begründbare Modellvorhersagen, ohne die echte Zelle vollständig festzulegen.
  - Essential understanding (EN): Changed feedback or an interrupted pathway changes justified model predictions without fully determining a real cell.
  - Observable performance (DE): Die lernende Person überträgt die Beziehungen auf die neue Störung, begründet eine überprüfbare Vorhersage und nennt eine Modellgrenze.
  - Observable performance (EN): The learner transfers the relationships to a new perturbation, justifies a testable prediction and names a model limitation.

**Coverage expectations**

- required expectations: `feedback`, `signal`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `time`: Verzögerung und Reizdauer / Delay and stimulus duration
- `perturbation`: Entfernte Rückkopplung gegenüber blockiertem Zwischenschritt / Removed feedback versus blocked intermediate step

**Application cases**

- `simulation-negative-feedback`
  - Task demand (DE): Bestimme P1 bis P5. Erkläre, warum gleiches S nicht gleiche Neusynthese bedeutet, und trenne Rückkopplung von Proteinabbau. Zeichne oder beschreibe die Pfeile S→Produktion→P und P⊣Produktion. Was geschieht nach Reizende?
  - Task demand (EN): Determine P1 to P5. Explain why identical S does not imply identical new synthesis, and distinguish feedback from protein degradation. Draw or describe S→production→P and P⊣production. What happens after the input ends?
  - Expected performance (DE): P1=4. P2=2+4/5=2,800. P3=1,4+4/3,8=2,453. P4=1,226; P5=0,613. Mit wachsendem P wird der Syntheseterm kleiner: negative Rückkopplung wirkt auf die Produktion, der Faktor 0,5 auf die vorhandene Menge. Nach Abschalten entsteht im Modell nichts neu; die Menge halbiert sich weiter. Die Abnahme 4→2,8 beweist keine universelle Oszillation biologischer Rückkopplungen, sondern folgt diesen Zahlen und Zeitschritten.
  - Expected performance (EN): P1=4. P2=2+4/5=2.800. P3=1.4+4/3.8=2.453. P4=1.226; P5=0.613. Increasing P reduces the synthesis term: negative feedback acts on production, while the factor 0.5 acts on the existing amount. After switch-off the model produces nothing new and the amount keeps halving. The decrease from 4 to 2.8 does not prove universal oscillation of biological feedback; it follows these numbers and time steps.
  - Understanding focus (DE): Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.
  - Understanding focus (EN): A gene product can affect its further production; direction and delay shape the time course.
- `simulation-delayed-pathway`
  - Task demand (DE): Erstelle die Tripel (A,R,P) für t=0 bis 5. Beschreibe, weshalb Protein noch nach Reizende aktiv sein kann. Unterscheide Signalübertragung und Transkription; würde bloßes gleichzeitiges Auftreten eine Kette beweisen?
  - Task demand (EN): Create triples (A,R,P) for t=0 through 5. Explain why protein can remain active after the input ends. Distinguish signal transmission from transcription; would simultaneous appearance alone prove a pathway?
  - Expected performance (DE): Tripel: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Die Information wandert mit Verzögerung weiter, obwohl S schon aus ist. S und A repräsentieren den vorgelagerten Signalteil; R ist Transkription, P das nachgelagerte Produkt. Die behaupteten Pfeile sind Modellannahmen; Zeitfolge unterstützt eine Hypothese, ein gezieltes Ausschalten von A wäre aussagekräftiger als Korrelation.
  - Expected performance (EN): Triples: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Information continues through delayed steps even after S is off. S and A represent upstream signaling; R represents transcription and P the downstream product. The arrows are model assumptions; timing supports a hypothesis, while targeted removal of A is more informative than correlation.
  - Understanding focus (DE): Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.
  - Understanding focus (EN): A gene product can affect its further production; direction and delay shape the time course.
## Page 6: Epigenetische Regulation

- Full learning-goal ID: `99544494-1825-5fc1-8e23-56f0df808e56`
- Goal fingerprint: `sha256:885178e3006aff2975ddc9ae821f69a1b1abe27c7d0a9af3e4df525b383694d1`
- Page fingerprint: `sha256:8b978f97c5cc19819476377188d93f7d82abbfdc63f434604501bc9cc1055450`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.5 Modelle zur Steuerung der Genaktivität

### Canonical description

Die lernende Person kann Methylierung/Acetylierung als epigenetische Steuerung erklären.

### Visualization

/assets/goal-visualizations/biologie/99544494-1825-5fc1-8e23-56f0df808e56/99544494-1825-5fc1-8e23-56f0df808e56.png

- original digest: `sha256:ec07cbcedc68c884a767f4754385fb0aafe39c7e2c5d7cb2408dc5fddea6a03e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Genaktivität steuern — `7975e43b-1187-5ae3-a1ab-282fc3c0548c` (page 1)

### Direct reverse prerequisites

- Chromatin-Remodelling — `3b55b551-cd7f-53fb-9bf0-fd8149ac1222` (page 7)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a165d9242845f47902ae9ac1a3a8899ed27cf01e5ffd64700a432c13dfe39441`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `marks`
  - Essential understanding (DE): DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.
  - Essential understanding (EN): DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way.
  - Observable performance (DE): Die lernende Person benennt das modifizierte Molekül und erläutert den gegebenen Zusammenhang von Methylierung, Acetylierung, Zugang und Transkription.
  - Observable performance (EN): The learner identifies the modified molecule and explains the supplied links between methylation, acetylation, accessibility and transcription.
- `mechanism`
  - Essential understanding (DE): Epigenetische Regulation benötigt keine Änderung der Basenfolge; ein Zusammenhang zwischen Markierung und mRNA beweist nicht allein die Ursache.
  - Essential understanding (EN): Epigenetic regulation requires no change of base sequence; a mark-mRNA association alone does not prove causation.
  - Observable performance (DE): Die lernende Person trennt die Messgrößen, berücksichtigt Kontrollen und vermeidet universelle Methylierungs- oder Acetylierungsschalter.
  - Observable performance (EN): The learner separates measurements, considers controls and avoids universal methylation or acetylation switches.
- `transfer`
  - Essential understanding (DE): Erhaltung eines Zellzustands und Vererbung zwischen Organismengenerationen sind verschiedene Behauptungen.
  - Essential understanding (EN): Maintenance of a cellular state and inheritance across organism generations are different claims.
  - Observable performance (DE): Die lernende Person deutet eine neue Markierung oder Zeitreihe und begrenzt die Übertragung auf das tatsächlich untersuchte System.
  - Observable performance (EN): The learner interprets a new mark or time series and limits transfer to the system actually studied.

**Coverage expectations**

- required expectations: `marks`, `mechanism`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `molecule`: DNA-Methylierung gegenüber Histonacetylierung und positionsabhängiger Histonmethylierung / DNA methylation versus histone acetylation and site-dependent histone methylation
- `persistence`: Reversible Änderung und Zellteilungs-Erhaltung / Reversible change and maintenance through cell division

**Application cases**

- `epigenetic-promoter-and-acetylation`
  - Task demand (DE): Erkläre die zwei Mechanismen mit modifiziertem Molekül und möglicher Transkriptionsfolge. Begründe, warum mRNA45 keine Addition unabhängiger Effekte beweist. Prüfe die Aussage: Demethylierung ist eine Genmutation.
  - Task demand (EN): Explain both mechanisms, identifying the modified molecule and possible transcriptional consequence. Explain why mRNA45 does not prove additive independent effects. Evaluate: demethylation is a gene mutation.
  - Expected performance (DE): Demethylierung betrifft Methylgruppen an DNA, Acetylierung chemische Gruppen an Histonen. Hier reduzieren sie repressive Bindung beziehungsweise erleichtern Zugang/Rekrutierung, sodass bei gegebenem Aktivator mehr mRNA entstehen kann. Die Basenfolge bleibt gleich; Markierungsänderung ist keine nachgewiesene Mutation. Einzelwerte18/22 und Doppelwert45 sind ohne Replikate und weitere Kontrollen kein Nachweis additiver oder unabhängiger Mechanismen; beide können dieselbe Zugangsbedingung beeinflussen.
  - Expected performance (EN): Demethylation changes methyl groups on DNA; acetylation changes chemical groups on histones. Here they reduce repressive binding or facilitate access/recruitment, permitting more mRNA with the supplied activator. Base sequence stays unchanged; altered marking is not an established mutation. Single values18/22 and combined45, without replicates and further controls, do not establish additive or independent mechanisms; both can affect the same accessibility condition.
  - Understanding focus (DE): DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.
  - Understanding focus (EN): DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way.
- `epigenetic-mark-context-and-maintenance`
  - Task demand (DE): Vergleiche DNA-Methylierung, die zwei Histon-Methylierungen und Acetylierung. Welche Beobachtung widerlegt Methylierung ist immer repressiv? Was belegt die Zellreihe über Erhaltung und was nicht über Eltern und Kinder?
  - Task demand (EN): Compare DNA methylation, the two histone methylations and acetylation. Which observation contradicts methylation is always repressive? What does the cell lineage show about maintenance and what does it not show about parents and children?
  - Expected performance (DE): A zeigt eine repressive Promotor-DNA-Markierung, B hat je nach Histonstelle unterschiedliche Aktivitätskontexte; hoheK4-Methylierung mit mRNA40 widerlegt den pauschalen Satz. Acetylierung ist eine andere chemische Histonänderung, hier mit höherem Zugang verbunden. Erhaltung in drei Zellteilungen passt zu einem weitergeführten zellulären Zustand. Keimzellen, Embryonen und Organismengenerationen wurden nicht untersucht; daher keine belegte transgenerationale Vererbung.
  - Expected performance (EN): A has a repressive promoter DNA mark; B has different activity contexts at different histone sites; highK4 methylation with mRNA40 contradicts the blanket claim. Acetylation is a different chemical histone change, associated with greater access here. Persistence across three divisions fits a maintained cellular state. Germ cells, embryos and organism generations were not studied, so transgenerational inheritance is not established.
  - Understanding focus (DE): DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.
  - Understanding focus (EN): DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way.
## Page 7: Chromatin-Remodelling

- Full learning-goal ID: `3b55b551-cd7f-53fb-9bf0-fd8149ac1222`
- Goal fingerprint: `sha256:f3c3fc2b9be082b05d48322d722af8b0dc10d5bdf43cd3df7ac83cf85ca5724e`
- Page fingerprint: `sha256:01603b8db442e784add6c689fa2ed978a302f6a9023c7050bc02b4abe3129d2a`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.5 Modelle zur Steuerung der Genaktivität

### Canonical description

Die lernende Person kann Chromatin-Umbau und Histon-Modifikationen für Genaktivität einordnen.

### Visualization

/assets/goal-visualizations/biologie/3b55b551-cd7f-53fb-9bf0-fd8149ac1222/3b55b551-cd7f-53fb-9bf0-fd8149ac1222.png

- original digest: `sha256:db66c4fbc7450dec01e30ad3f8c854e945e43be305e1037bca3f8e83cdc83865`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Epigenetische Regulation — `99544494-1825-5fc1-8e23-56f0df808e56` (page 6)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:52f7b161e033462340b13f52eef55c13725295731276a74c12d61eb8aa744476`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `access`
  - Essential understanding (DE): Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.
  - Essential understanding (EN): Nucleosome position and histone modifications can affect gene accessibility.
  - Observable performance (DE): Die lernende Person unterscheidet physisches Nukleosomenverschieben von chemischer Histon-Modifikation und verbindet beide mit Transkriptionszugang.
  - Observable performance (EN): The learner distinguishes physical nucleosome movement from chemical histone modification and links both to transcriptional access.
- `evidence`
  - Essential understanding (DE): Zugänglichkeit und Transkriptmenge sind unterschiedliche Messgrößen; beide können weitere Voraussetzungen haben.
  - Essential understanding (EN): Accessibility and transcript amount are different measurements and can depend on further conditions.
  - Observable performance (DE): Die lernende Person vergleicht Kontrollen, benennt notwendige Aktivatoren und begrenzt kausale Schlüsse aus den Messdaten.
  - Observable performance (EN): The learner compares controls, identifies required activators and limits causal conclusions from the measurements.
- `transfer`
  - Essential understanding (DE): Die Wirkung einer Histonmarkierung hängt von Ort und Kontext ab; eine Änderung der Zugänglichkeit garantiert keine Genaktivität.
  - Essential understanding (EN): A histone mark depends on location and context; changed accessibility does not guarantee gene activity.
  - Observable performance (DE): Die lernende Person deutet eine neue Markierung oder Zeitreihe ohne pauschale Aktivierungsregel und formuliert eine begründete Folgemessung.
  - Observable performance (EN): The learner interprets a new mark or time series without a universal activation rule and proposes a justified follow-up measurement.

**Coverage expectations**

- required expectations: `access`, `evidence`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `intervention`: ATP-abhängige Positionierung, Acetylierung und Aktivator / ATP-dependent positioning, acetylation and activator
- `mark-context`: Unterschiedliche Histonstellen und Zeitpunkte / Different histone sites and time points

**Application cases**

- `chromatin-access-and-activator`
  - Task demand (DE): Ordne die Eingriffe als Remodelling oder Modifikation ein. Erkläre den Unterschied zwischen 70%/3 und 75%/40. Bewerte die Aussage: Jede Chromatinöffnung schaltet das Gen vollständig an. Benenne eine Kontrollbedingung für einen kausalen Vergleich der beiden Maschinen.
  - Task demand (EN): Classify the interventions as remodeling or modification. Explain the difference between 70%/3 and 75%/40. Evaluate the claim: every chromatin opening fully switches the gene on. Name a control needed for a causal comparison of the two machines.
  - Expected performance (DE): Verschieben verändert die Nukleosomenposition; Acetylierung ist eine chemische Modifikation der Histone. Hoher Zugang bei fehlendem Aktivator ergibt hier wenig mRNA; Zugang ist eine Voraussetzung, keine hinreichende Bedingung. Aktivator an erhöht die mRNA trotz nur kleiner Zugangsänderung stark. Die Unterschiede zwischen den Maschinen sind mit diesen unvollständigen Kontrollen nicht allein kausal zuzuordnen: nötig sind identischer Aktivatorstatus, ATP-/inaktive-Maschine-Kontrollen und Replikate. DNA-Sequenzänderung ist nicht erforderlich.
  - Expected performance (EN): Movement changes nucleosome position; acetylation chemically modifies histones. High accessibility without activator yields little mRNA here; accessibility is a prerequisite rather than a sufficient condition. Turning the activator on greatly raises mRNA despite little additional accessibility. The incomplete controls do not assign all differences causally to the machines: matched activator status, ATP/inactive-machine controls and replicates are needed. No DNA sequence change is required.
  - Understanding focus (DE): Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.
  - Understanding focus (EN): Nucleosome position and histone modifications can affect gene accessibility.
- `chromatin-mark-context`
  - Task demand (DE): Erkläre, warum alle Methylierungen machen Gene aus hier falsch ist. Unterscheide markiertes Molekül, Zugänglichkeit und Transkription. Welche zusätzliche Untersuchung würde zeigen, ob die Marke eine Folge oder ein Beitrag zur Aktivitätsänderung ist?
  - Task demand (EN): Explain why all methylation switches genes off is wrong here. Distinguish the marked molecule, accessibility and transcription. What additional investigation would help distinguish whether a mark follows or contributes to the activity change?
  - Expected performance (DE): Beide Zustände haben Histon-Methylierung, aber an unterschiedlichen Stellen und in anderem Kontext; A ist stärker transkribiert. DNA bleibt gleich. Zugänglichkeit beschreibt eine Strukturbedingung, mRNA das Ergebnis mehrerer Regulationsschritte. Gezielte Veränderung der zuständigen Enzyme mit Kontrollen und einer Zeitreihe für Marke, Position/Zugang und mRNA könnte den Beitrag prüfen; die zweifache Beobachtung allein beweist keine Ursache.
  - Expected performance (EN): Both states contain histone methylation, but at different sites and in different contexts; A is transcribed more strongly. DNA remains unchanged. Accessibility describes a structural condition; mRNA reflects several regulatory steps. Targeted manipulation of the relevant enzymes with controls and time courses for mark, position/access and mRNA could test contribution; two observations alone do not prove causation.
  - Understanding focus (DE): Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.
  - Understanding focus (EN): Nucleosome position and histone modifications can affect gene accessibility.
## Page 8: Transkriptionsnetzwerke

- Full learning-goal ID: `666fb1d1-09a8-55a3-acd5-efe311cac8b0`
- Goal fingerprint: `sha256:1457333c0f369d2fbbf8898a89aa2dae0b336f2045a2afa98425d6e0d77401fd`
- Page fingerprint: `sha256:15cc442e1977d2ef6533b98c018f34c3950bff9e1af89224443ec6c6b9d07a76`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.5 Modelle zur Steuerung der Genaktivität

### Canonical description

Die lernende Person kann regulatorische Netzwerke und Feedbackschleifen analysieren.

### Visualization

/assets/goal-visualizations/biologie/666fb1d1-09a8-55a3-acd5-efe311cac8b0/666fb1d1-09a8-55a3-acd5-efe311cac8b0.png

- original digest: `sha256:12b9ab2b44197e38cc4bab7c79e89b959fae946a4c6bf3235b32be18bfa5bd5f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Regulationsmodelle vergleichen — `52ecc72a-a65b-53a0-851e-86defe769fa7` (page 4)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d9c23248b8aa72d93477ec3b484f405bdbe2e252bb649d689e9e48c741e23a9a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `network`
  - Essential understanding (DE): Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.
  - Essential understanding (EN): A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator.
  - Observable performance (DE): Die lernende Person analysiert Pfade und geschlossene Schleifen und begründet deren Netto-Vorzeichen.
  - Observable performance (EN): The learner analyzes paths and closed loops and justifies their net sign.
- `perturbation`
  - Essential understanding (DE): Eine Netzstörung kann direkte und verzögerte indirekte Effekte haben; ein Endwert verrät nicht alle Pfade.
  - Essential understanding (EN): Network perturbations can have direct and delayed indirect effects; one output does not reveal every pathway.
  - Observable performance (DE): Die lernende Person sagt anhand gegebener Regeln Folgen einer gezielten Störung voraus und vergleicht sie mit einer Zeitreihe.
  - Observable performance (EN): The learner predicts a targeted perturbation from supplied rules and compares it with a time course.
- `transfer`
  - Essential understanding (DE): Schleifenstruktur begrenzt plausible Dynamik, bestimmt sie aber ohne Parameter und Verzögerungen nicht vollständig.
  - Essential understanding (EN): Loop structure constrains plausible dynamics but does not fully determine them without parameters and delays.
  - Observable performance (DE): Die lernende Person analysiert eine neue Kante oder Störung, unterscheidet Modell und Beobachtung und nennt einen passenden Kontrolltest.
  - Observable performance (EN): The learner analyzes a new edge or perturbation, distinguishes model from observation and names a suitable control test.

**Coverage expectations**

- required expectations: `network`, `perturbation`, `transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `motif`: Negative Rückkopplung gegenüber inkohärentem Feedforward / Negative feedback versus incoherent feedforward
- `path`: Direkter und indirekter Pfad / Direct and indirect path

**Application cases**

- `network-negative-loop`
  - Task demand (DE): Markiere die Schleife und bestimme ihr Vorzeichen. Erkläre, wie A trotz dauerhaftem S zunächst fallen und später wieder steigen kann. Welche Folge erwartet das Netzwerk, wenn nur C→A entfernt wird? Begründe ohne die Zahlenreihe als universelle Oszillation auszugeben.
  - Task demand (EN): Mark the loop and determine its sign. Explain how A can fall and later rise despite sustained S. What does the network predict if only C→A is removed? Justify without presenting this time course as universal oscillation.
  - Expected performance (DE): Die Schleife enthält zwei Aktivierungen und eine Hemmung, also negative Rückkopplung. Anfangs steigt A; verzögert steigen B/C, C hemmt A, dann gehen B/C zurück und A kann sich unter S erholen. Ohne C⊣A entfällt diese Bremse; bei sonst gleichen Bedingungen sollte A weniger stark fallen, B/C können länger hoch bleiben. Genaues Ausmaß und dauerhaftes Schwingen sind ohne Parameter nicht bestimmbar. Zeit4 ist eine partielle Erholung, kein Beweis eines stabilen Zyklus.
  - Expected performance (EN): The loop has two activating and one inhibiting edges, hence negative feedback. Initially A rises; B/C rise with delay, C inhibits A, then B/C decrease and A can recover under S. Removing C⊣A removes this brake; all else equal, A should fall less, and B/C may remain high longer. Exact magnitude and sustained oscillation cannot be determined without parameters. Time4 shows partial recovery, not proof of a stable cycle.
  - Understanding focus (DE): Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.
  - Understanding focus (EN): A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator.
- `network-feedforward-versus-feedback`
  - Task demand (DE): Vergleiche den direkten und indirekten A→G-Pfad. Ist das erste Netzwerk eine Rückkopplung? Erkläre den Puls und unterscheide ihn vom möglichen Verlauf in F. Entwerfe eine gezielte Störung zur Prüfung des verzögerten Pfads.
  - Task demand (EN): Compare the direct and indirect A→G paths. Is the first network feedback? Explain the pulse and distinguish it from the possible behavior of F. Design a targeted perturbation to test the delayed path.
  - Expected performance (DE): Der direkte Pfad aktiviert, der indirekte A→R⊣G hemmt. Dies ist ein Feedforward mit entgegengesetzten Wirkungen, keine geschlossene Rückkopplung, weil nichts zu A zurückführt. Der direkte Pfad startet schnell, R begrenzt später die Transkription. F hat dagegen eine Schleife A→G/P⊣A. Gezielte Blockade von R bei gleichem A sollte die spätere G-Abnahme vermindern; ein Pulseffekt allein beweist die Motifstruktur nicht.
  - Expected performance (EN): The direct path activates; indirect A→R⊣G inhibits. This is feedforward with opposing effects rather than closed feedback, since nothing returns to A. The direct path acts quickly; R later limits transcription. F instead contains A→G/P⊣A. Specific blockade of R with the same A should reduce the later G decline; a pulse alone does not prove the network structure.
  - Understanding focus (DE): Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.
  - Understanding focus (EN): A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator.
