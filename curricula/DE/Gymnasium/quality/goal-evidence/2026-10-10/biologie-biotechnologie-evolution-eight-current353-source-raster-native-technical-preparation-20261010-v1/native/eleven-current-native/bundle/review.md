# AI review input: Biologie – acht neue Prüfseiten und drei aktuelle Nachbarkontexte: Biotechnologie und Evolution

- Book ID: `biologie-biotech-evolution-eleven-current353-native-20261010-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:b34bb97399ce328fff0761ec40a7ca3b45b1d5dcb05856c4f8f525cf6f251553`
- Selected goals: 11

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Proteinbiosynthese erklären

- Full learning-goal ID: `475eebb4-4eb0-524f-b1ec-4a672bf856d2`
- Goal fingerprint: `sha256:f7aa1f41652dbab38f332d0b9ec40d7ea73314004f2f642969302eb199ce5f5a`
- Page fingerprint: `sha256:6ce9779cfd09d6259683770ae884f6f510a90bc22dcf6d736741e92c63469c8d`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.1 Speicherung und Realisierung genetischer Information

### Canonical description

Die lernende Person kann den Informationsfluss von einer gegebenen DNA-Sequenz über mRNA zu einem Polypeptid modellhaft darstellen und die Verbindung von Transkription und Translation erklären.

### Visualization

/assets/goal-visualizations/biologie/475eebb4-4eb0-524f-b1ec-4a672bf856d2/475eebb4-4eb0-524f-b1ec-4a672bf856d2.png

- original digest: `sha256:7f89f7eba0e2c0728e427ca2cca4b46ec524807678bb6a6774a188d2285cc772`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Gentechnische Methoden erläutern — `523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0` (page 2)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- DNA-Aufbau darstellen — `0daa79f6-8f61-5506-98f9-65db83062ba8` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- Tumorsuppressor zwischen Promotormethylierung und Zellzyklus — `3ac1cbb1-a366-5ae5-85c0-76b08270869d` (outside this book)
- Operonsteuerung zwischen Nährlösung und Enzymaktivität — `f9637b40-93c1-5603-86e5-3d85b52d01fd` (outside this book)
- Genaktivität steuern — `7975e43b-1187-5ae3-a1ab-282fc3c0548c` (outside this book)
- Genmutationen analysieren — `ffef97e3-12d6-5090-9816-46ab9e57fae2` (outside this book)
- Transkriptionsfaktoren bei Eukaryoten erklären — `946ce2e7-c30d-5670-839d-003b0619c284` (outside this book)
- DNA-Methylierung bei Eukaryoten erklären — `0ac51522-352c-50d1-8b95-8d3992b4db15` (outside this book)
- Gentherapie prinzipiell erklären — `3891b735-9d0d-5eef-b653-6ad58b9181f6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1b92646202a20acd6285d23559491da908d77de79b220980026a00a95296cc43`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `two-stage-information-flow`
  - Essential understanding (DE): Transkription erzeugt RNA anhand einer DNA-Vorlage; Translation setzt die mRNA-Codonfolge am Ribosom mithilfe von tRNA in eine Polypeptidfolge um. Die beiden Stufen sind zu verbinden und nicht zu verwechseln.
  - Essential understanding (EN): Transcription produces RNA from a DNA template; translation uses the mRNA codon sequence, tRNA and a ribosome to assemble a polypeptide. The two stages must be connected and distinguished.
  - Observable performance (DE): Die lernende Person erzeugt ein zusammenhängendes DNA–mRNA–Polypeptid-Modell und begründet die Rolle von mRNA, tRNA und Ribosom; Erfolg in nur einer Stufe reicht nicht für das Gesamtziel.
  - Observable performance (EN): The learner constructs a connected DNA–mRNA–polypeptide model and explains the roles of mRNA, tRNA and ribosome; success in only one stage does not establish the whole goal.
- `code-and-cell-context`
  - Essential understanding (DE): Die Richtung und Art des vorgegebenen DNA-Strangs bestimmen die RNA-Ableitung; der bereitgestellte Code bestimmt die Aminosäurefolge. Bei Eukaryoten sind Kerntranskription und Translation außerhalb des Kerns räumlich getrennt.
  - Essential understanding (EN): The direction and type of the supplied DNA strand determine RNA derivation; the supplied code determines amino-acid order. In eukaryotes, nuclear transcription is spatially separate from translation outside the nucleus.
  - Observable performance (DE): Mit ausdrücklich vereinfachten intronfreien Modellabschnitten leitet die lernende Person frische RNA- und Aminosäurefolgen ab und lokalisiert eine gegebene Störung an der passenden Stufe.
  - Observable performance (EN): Using explicitly simplified intron-free model fragments, the learner derives fresh RNA and amino-acid sequences and locates a supplied disturbance at the appropriate stage.

**Coverage expectations**

- required expectations: `two-stage-information-flow`, `code-and-cell-context`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `template-and-coding-strands`: Vorlagenstrang und codierenden Strang ausdrücklich kennzeichnen und in frischen Fällen wechseln. / Explicitly identify and vary template and coding strands in fresh cases.
- `cell-and-intervention`: Eukaryotisches Kompartimentmodell und prokaryotischen Befund mit gestörter Translation vergleichen. / Compare a eukaryotic compartment model with a prokaryotic result showing disrupted translation.

**Application cases**

- `eukaryotic-connected-model`
  - Task demand (DE): Ein vereinfachtes intronfreies eukaryotisches Modell zeigt den DNA-Vorlagenstrang 3′-TAC CTT AAA-5′, eine Paarungsregel und eine Code-Tabelle. Stelle die mRNA und die ab AUG betrachtete Aminosäurefolge dar; ordne DNA, mRNA, tRNA und Ribosom in Kern und Cytoplasma ein und erkläre den verbundenen Informationsfluss. Gezeigt wird nur ein Ausschnitt, kein vollständiges Protein.
  - Task demand (EN): A simplified intron-free eukaryotic model supplies the DNA template strand 3′-TAC CTT AAA-5′, a pairing rule and a codon table. Represent the mRNA and the amino-acid sequence considered from AUG; place DNA, mRNA, tRNA and ribosome in nucleus and cytoplasm and explain the connected information flow. Only a fragment, not a complete protein, is shown.
  - Expected performance (DE): mRNA 5′-AUG GAA UUU-3′ und der Ausschnitt Met–Glu–Phe passen. Transkription im Kern ist von der mRNA-Translation am cytoplasmatischen Ribosom unterschieden; tRNA vermittelt Codon und Aminosäure. Eine bloße Codonlösung ohne Modellkette genügt nicht.
  - Expected performance (EN): mRNA 5′-AUG GAA UUU-3′ and the fragment Met–Glu–Phe match. Nuclear transcription is distinguished from mRNA translation at a cytoplasmic ribosome; tRNA links codons to amino acids. A codon answer without the connected model is insufficient.
  - Understanding focus (DE): Vollständige Kette mit klaren Molekülrollen.
  - Understanding focus (EN): Complete connected chain with clear molecular roles.
- `prokaryotic-translation-disturbance`
  - Task demand (DE): Ein neues vereinfachtes Bakterienmodell gibt den codierenden DNA-Strang 5′-ATG TCT GGT-3′, Stranglegende und Code-Tabelle an. Ohne Störung wird die passende mRNA gebildet und der modellierte Polypeptidabschnitt nachgewiesen. Mit einem laut Material gezielt an der Translation wirkenden Hemmstoff ist mRNA weiter nachweisbar, der Abschnitt aber nicht. Erzeuge die erwartete RNA-/Aminosäurekette und erkläre den Unterschied der Befunde.
  - Task demand (EN): A fresh simplified bacterial model provides the coding DNA strand 5′-ATG TCT GGT-3′, a strand legend and a codon table. Without intervention, matching mRNA and the modelled polypeptide fragment are detected. With an inhibitor specified in the material to act on translation, mRNA remains detectable but the fragment does not. Construct the expected RNA/amino-acid chain and explain the difference between the results.
  - Expected performance (DE): Die neue Kette lautet 5′-AUG UCU GGU-3′ und Met–Ser–Gly. Die lernende Person verbindet Transkription und Translation, begründet die vorhandene RNA mit erhaltenem ersten Schritt und den fehlenden Abschnitt mit der angegebenen Translationsstörung; sie schließt nicht auf fehlende DNA oder eine gemessene Proteinmenge.
  - Expected performance (EN): The fresh chain is 5′-AUG UCU GGU-3′ and Met–Ser–Gly. The learner connects both stages, explains detected RNA by the preserved first stage and the absent fragment by the specified translation disturbance, without inferring missing DNA or a measured protein quantity.
  - Understanding focus (DE): Transfer auf andere Strangart, Zellart und eine interpretierbare Störung.
  - Understanding focus (EN): Transfer to a different strand type, cell type and interpretable intervention.
## Page 2: Gentechnische Methoden erläutern

- Full learning-goal ID: `523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0`
- Goal fingerprint: `sha256:848decad2fe1313a0a576fec830733d2a47083ca26ded9f201f1c523f5825752`
- Page fingerprint: `sha256:41c67ebf955036e4399e7828c609f090746fc6367375a00857fd720319dd1208`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann Restriktionsenzyme, PCR und Gel-Analyse erläutern.

### Visualization

/assets/goal-visualizations/biologie/523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0/523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0.png

- original digest: `sha256:c59cecb1492b73600e9dec9349b4518c38ddeabff20363140903ed91a9a829ca`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Proteinbiosynthese erklären — `475eebb4-4eb0-524f-b1ec-4a672bf856d2` (page 1)

### Direct reverse prerequisites

- DNA-Replikation und PCR als natürliche und technische Prozesse vergleichen — `a515e493-6f90-5371-9470-28a0cf50f087` (page 3)
- Vektoren und Transformation — `d11b3b18-deec-5d1a-bff6-512cddf595a2` (page 4)
- Histonmodifikation analysieren — `8f6933b1-6e02-5512-acf2-a90a7fb9cb75` (page 5)
- PCR einsetzen — `a3f483ce-126e-595c-999c-aa4d95106221` (page 7)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5455ae22bf4ad0c118675aed2bfbee06a212c12a74b7676f498308089438d775`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `distinct-method-functions`
  - Essential understanding (DE): Restriktionsenzyme schneiden DNA an erkannten Stellen, PCR vervielfältigt einen durch Primer begrenzten Abschnitt, ein Gel trennt Fragmente nach Größe.
  - Essential understanding (EN): Restriction enzymes cut DNA at recognized sites, PCR amplifies a primer-defined region and a gel separates fragments by size.
  - Observable performance (DE): Erklärt alle drei Methoden im zusammenhängenden Materialfall und ordnet jede beobachtete Wirkung der passenden Methode zu.
  - Observable performance (EN): Explains all three methods in the connected case and assigns each observed effect to its method.
- `result-interpretation-limits`
  - Essential understanding (DE): Bandenpositionen zeigen relative Fragmentlängen unter gegebenen Bedingungen; gleiche Länge oder PCR-Signal beweist allein keine identische DNA-Sequenz.
  - Essential understanding (EN): Bands indicate relative fragment length under given conditions; equal length or a PCR signal alone proves no identical sequence.
  - Observable performance (DE): Leitet erwartete Schnitt-/PCR-/Gelmuster ab und grenzt aus fehlendem oder unerwartetem Signal mögliche Ursachen ein.
  - Observable performance (EN): Infers expected digest/PCR/gel patterns and bounds possible causes of missing or unexpected signals.

**Coverage expectations**

- required expectations: `distinct-method-functions`, `result-interpretation-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-content-contexts`: Gegebene Schnittposition400 von1000bp und primerbegrenzte200bp gegenüber300/700bp-Gelmuster und Kontrollsignalen. / Given400-of1000bp cut and primer-bounded200bp versus300/700bp gel patterns and control signals.
- `fresh-content-premise`: Fehlende Restriktionsstelle bei passenden Primern gegenüber ausgefallener Positivkontrolle. / Missing restriction site with matching primers versus failed positive control.

**Application cases**

- `three-tools-dna-size-model`
  - Task demand (DE): Didaktische DNA-Karte: Ein lineares 1000-bp-Stück besitzt eine einzige Erkennungsstelle für Enzym R bei Position 400. Die gegebene PCR-Primerpaarung begrenzt ein anderes 200-bp-Zielstück. In einem Gel wandern DNA-Fragmente von den oberen Taschen zum Pluspol; kleinere Fragmente kommen bei gleichen Bedingungen weiter. Das sind synthetische Daten, keine tatsächliche Laborarbeit.

Erläutere Restriktion, PCR und Gel-Analyse an der Karte. Welche Stücke und Bandenpositionen erwartest du bei vollständigem R-Schnitt und bei spezifischer PCR? Prüfe die Behauptung, das Gel kopiere DNA.

Frische Variation: Ein neues gleich langes 1000-bp-Stück besitzt keine R-Erkennungsstelle, aber unveränderte Primerbindestellen. Wie ändern sich die beiden Ergebnisse?
  - Task demand (EN): Teaching DNA card: a linear 1000-bp fragment has one site for enzyme R at position 400. The supplied PCR primer pair bounds a different 200-bp target. In a gel DNA travels from the upper wells toward the positive electrode; smaller fragments migrate further under identical conditions. These are synthetic data, not actual laboratory work.

Explain restriction, PCR and gel analysis using the card. What products/band positions are expected for complete R digestion and specific PCR? Assess the claim that a gel copies DNA.

Fresh variation: Another 1000-bp piece lacks the R site but retains the primer-binding sites. How do the two results change?
  - Expected performance (DE): R schneidet an seiner Erkennungsstelle und liefert 400 und 600 bp. PCR erzeugt viele Kopien des primerbegrenzten 200-bp-Abschnitts, nicht des ganzen 1000-bp-Stücks. Bei einem gemeinsamen Größenvergleich liegt die 200-bp-Bande weiter vom Start entfernt als 400 bp und diese weiter als 600 bp. Das Gel trennt vorhandene DNA; es vervielfältigt sie nicht. Restriktion, Vervielfältigung und Trennung sind verschiedene Funktionen. Das Modell erklärt die Methoden, es behauptet keine ausgeführte Manipulation.

Transfer: Bei R bleibt das lineare 1000-bp-Stück ungeschnitten; die PCR kann weiterhin das 200-bp-Ziel vervielfältigen. Gleiches Ausgangsmaß erzwingt keine gleiche Erkennungssequenz.
  - Expected performance (EN): R cuts at its recognition site, yielding 400 and 600 bp. PCR makes many copies of the primer-bounded 200-bp region, not the whole 1000-bp piece. In a size comparison the 200-bp band is farther from the start than 400 bp, which is farther than 600 bp. The gel separates existing DNA and does not amplify it. Cutting, amplification and separation have distinct roles. This explains methods without claiming a performed manipulation.

Transfer: R leaves the linear 1000-bp piece intact; PCR can still amplify the 200-bp target. Equal initial size does not imply an identical recognition sequence.
  - Understanding focus (DE): Restriktionsenzyme schneiden DNA an erkannten Stellen, PCR vervielfältigt einen durch Primer begrenzten Abschnitt, ein Gel trennt Fragmente nach Größe. Bandenpositionen zeigen relative Fragmentlängen unter gegebenen Bedingungen; gleiche Länge oder PCR-Signal beweist allein keine identische DNA-Sequenz.
  - Understanding focus (EN): Restriction enzymes cut DNA at recognized sites, PCR amplifies a primer-defined region and a gel separates fragments by size. Bands indicate relative fragment length under given conditions; equal length or a PCR signal alone proves no identical sequence.
- `three-tools-controls-discrimination`
  - Task demand (DE): Vier gelesene Modellspuren: Größenmarker 100/300/700 bp; vollständiger Restriktionsansatz X mit 300- und 700-bp-Banden; spezifischer PCR-Ansatz Y mit einer 300-bp-Bande; Negativkontrolle ohne DNA mit einer unerwarteten 300-bp-Bande. Die tatsächliche Basenfolge ist nicht bekannt. Gleiche Gelbedingungen und ein lineares DNA-Modell sind vorgegeben.

Erkläre die drei Methodenfunktionen und interpretiere X, Y und die Kontrolle. Was kann aus den gleichen 300-bp-Positionen geschlossen werden, was nicht?

Frische Variation: Frische Karte: Die Negativkontrolle ist leer; eine Positivkontrolle mit bekannt passendem Ziel ist aber ebenfalls leer. Die Probe zeigt keine Bande. Welche Schlussfolgerung ist jetzt zulässig?
  - Task demand (EN): Four model lanes: size marker 100/300/700 bp; complete restriction reaction X has 300- and 700-bp bands; specific PCR reaction Y has one 300-bp band; the no-template negative control has an unexpected 300-bp band. Actual sequences are unknown. Gel conditions are equal and a linear DNA model is stipulated.

Explain the three method functions and interpret X, Y and the control. What does matching 300-bp migration establish and what does it not?

Fresh variation: Fresh card: the negative control is empty, but a positive control containing a matching target is also empty. The sample shows no band. What can now be concluded?
  - Expected performance (DE): X passt zu einem vollständigen Schnitt eines linearen 1000-bp-Ausgangsstücks in 300 und 700 bp. Y passt zu PCR-Kopien eines 300-bp-Ziels. Der Marker erlaubt eine Größenzuordnung; die gemeinsame Position beweist keine identische Sequenz von X und Y. Das Kontrollsignal spricht etwa für Kontamination und schwächt eine sichere Probenzuordnung; ohne weitere Kontrolle ist weder die echte Probe noch eine bestimmte Fehlerquelle eindeutig identifiziert. Das Gel hat die Produkte nur getrennt, Restriktion erzeugte Schnittstücke, PCR vervielfältigte DNA.

Transfer: Das System hat die erwartete Positivreaktion nicht nachgewiesen. Ein technischer Ausfall bleibt möglich; die leere Probe beweist daher nicht, dass ihr Zielstück fehlt. Eine passende Fehlersuche und wieder funktionierende Kontrolle sind nötig.
  - Expected performance (EN): X fits complete digestion of a linear 1000-bp precursor into 300 and 700 bp. Y fits PCR copies of a 300-bp target. The marker supports size assignment; matching positions do not establish identical X/Y sequence. The control signal suggests a possibility such as contamination and weakens confident sample attribution; neither a true sample result nor a particular cause is uniquely identified without more controls. The gel separated products, restriction generated fragments, PCR amplified DNA.

Transfer: The system failed to show its expected positive reaction. Technical failure remains possible; therefore the empty sample does not prove target absence. Troubleshooting and a functioning positive control are required.
  - Understanding focus (DE): Restriktionsenzyme schneiden DNA an erkannten Stellen, PCR vervielfältigt einen durch Primer begrenzten Abschnitt, ein Gel trennt Fragmente nach Größe. Bandenpositionen zeigen relative Fragmentlängen unter gegebenen Bedingungen; gleiche Länge oder PCR-Signal beweist allein keine identische DNA-Sequenz.
  - Understanding focus (EN): Restriction enzymes cut DNA at recognized sites, PCR amplifies a primer-defined region and a gel separates fragments by size. Bands indicate relative fragment length under given conditions; equal length or a PCR signal alone proves no identical sequence.
## Page 3: DNA-Replikation und PCR als natürliche und technische Prozesse vergleichen

- Full learning-goal ID: `a515e493-6f90-5371-9470-28a0cf50f087`
- Goal fingerprint: `sha256:9ec0e8384c168a43c28fdfe8e53d6a4074d50072206ff32c24726b7e159fdf19`
- Page fingerprint: `sha256:d76984db91ed9b86572a84a7c560257e831cdaba77401951aa1999e540412afc`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann die natürliche DNA-Replikation mit der Polymerase-Kettenreaktion vergleichen und an diesem Beispiel Probleme und Lösungen der technischen Umsetzung natürlicher Prozesse erklären.

### Visualization

/assets/goal-visualizations/biologie/a515e493-6f90-5371-9470-28a0cf50f087/a515e493-6f90-5371-9470-28a0cf50f087.png

- original digest: `sha256:856262c4fe0db82e6d9e61657d2539a70c588ee4247037c7d9635135cfeb19e4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gentechnische Methoden erläutern — `523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- DNA-Aufbau darstellen — `0daa79f6-8f61-5506-98f9-65db83062ba8` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- DNA-Replikation, PCR und Reparaturenzyme vergleichen — `76ad2d40-496b-5fa8-97e8-7711f9859738` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1eff08f992e57c182110414fb69b52a8e8f85c72d1eb8102d8546e9087fe64a6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `essential-1`
  - Essential understanding (DE): Natürliche DNA-Replikation und PCR beruhen auf Vorlage, Komplementarität, Primerstart und 5′→3′-Verlängerung.
  - Essential understanding (EN): Natural replication/PCR use templates, complementarity, primer initiation/5′→3′ extension.
  - Observable performance (DE): Ergänzt tatsächliche alte/neue komplementäre Stränge mit Enden, vergleicht semikonservative Zellkopie mit Denaturieren→Anlagern→5′→3′-Verlängern in 2 PCR-Zyklen und adaptiert Anlagerungsfehler.
  - Observable performance (EN): Completes actual old/new complementary strands/ends, compares semiconservative cell copying with denature→anneal→5′→3′ extension across 2 PCR cycles and adapts annealing failures.
- `essential-2`
  - Essential understanding (DE): Technische Wärmezyklen erfordern geeignete Enzyme und spezifische Primer als gezielte Lösungen natürlicher Kopieraufgaben.
  - Essential understanding (EN): Heat cycles require suitable enzymes/specific primers as technical solutions for copying.
  - Observable performance (DE): Erklärt Thermostabilität/Initiation und prüft Kontrollen ohne Reparaturenzymdetails verpflichtend zu ergänzen.
  - Observable performance (EN): Explains thermostability/initiation and evaluates controls without adding mandatory repair detail.
- `essential-3`
  - Essential understanding (DE): Ideale Verdopplung, reale Effizienz und Kontrollbefunde sind voneinander zu unterscheiden.
  - Essential understanding (EN): Ideal doubling, actual efficiency/control findings differ.
  - Observable performance (DE): Berechnet 64 bzw. 32,4 als Modellerwartung und grenzt Molekülzählung/Produktinterpretation korrekt ein.
  - Observable performance (EN): Calculates 64 or 32.4 as model expectations and bounds molecule counts/product interpretation.

**Coverage expectations**

- required expectations: `essential-1`, `essential-2`, `essential-3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-biological-evidence-contexts`: Zwei eigenständige unterschiedliche biologische Sach-/Belegkontexte: core-replication-pcr-engineering gegenüber core-pcr-ideal-count-and-controls. / Two distinct biological/evidence contexts: core-replication-pcr-engineering versus core-pcr-ideal-count-and-controls.
- `changed-mechanism-assumption-or-counterfinding`: Eine neue Bedingung, Funktionsstörung oder Gegenevidenz verlangt eine begründete angepasste Folgerung statt bloß anderer Zahlen. / A new condition, functional perturbation or counterfinding requires a justified adapted conclusion rather than merely changed numbers.

**Application cases**

- `core-replication-pcr-engineering`
  - Task demand (DE): Vollständiges endliches Material und Aufgabe: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v3/twenty-three-whole46-bilingual-cases-and-P.v3.author-candidate.json#/entries/21/newAuthoredWholeCases/0. Löse die vollständige 12-Basen-Vorlage samt F/R, alten/neuen DNA-Strängen und 3 PCR-Schritten. Zeichne 2 Zyklen, erkläre Wärmelösung/Genom vs Zielabschnitt und prüfe fehlende Primer; kein GA-Reparaturmandat.
  - Task demand (EN): Complete finite material/task: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v3/twenty-three-whole46-bilingual-cases-and-P.v3.author-candidate.json#/entries/21/newAuthoredWholeCases/0. Solve complete 12-base template/F/R, old/new strands and all 3 PCR phases; draw 2 cycles, explain heat/genome-versus-target and missing primers, without mandatory GA repair.
  - Expected performance (DE): U′=ATGCCTAAAGGT, T′=3′-TACGGATTTCCA-5′. Jede Zelltochter alt+neu; PCR 1: 2, 2: 4, nur 2 ursprüngliche Stränge bleiben. F/R 5′→3′, Wärme/Primer/Enzym mit verschiedenen Rollen; ohne Startenden keine Synthese.
  - Expected performance (EN): U′=ATGCCTAAAGGT, T′=3′-TACGGATTTCCA-5′. Each cellular daughter old+new; PCR 1: 2/2: 4 with only 2 original strands retained. F/R 5′→3′; heat/primers/enzyme have different roles; no start ends, no synthesis.
  - Understanding focus (DE): Natürliche DNA-Replikation und PCR beruhen auf Vorlage, Komplementarität, Primerstart und 5′→3′-Verlängerung. Technische Wärmezyklen erfordern geeignete Enzyme und spezifische Primer als gezielte Lösungen natürlicher Kopieraufgaben. Ideale Verdopplung, reale Effizienz und Kontrollbefunde sind voneinander zu unterscheiden.
  - Understanding focus (EN): Natural replication/PCR use templates, complementarity, primer initiation/5′→3′ extension. Heat cycles require suitable enzymes/specific primers as technical solutions for copying. Ideal doubling, actual efficiency/control findings differ.
- `core-pcr-ideal-count-and-controls`
  - Task demand (DE): Vollständiges endliches Material und Aufgabe: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v3/twenty-three-whole46-bilingual-cases-and-P.v3.author-candidate.json#/entries/21/newAuthoredWholeCases/1. Löse die zweite vollständige Vorlage/K/N/E mit Strangenden, 5′→3′-Richtungen und 2 Zyklen. Berechne 64/32,4, korrigiere K′ mit falschem R und zähle 6 neue Einzelstränge statt Exponentialamplifikation.
  - Task demand (EN): Complete finite material/task: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v3/twenty-three-whole46-bilingual-cases-and-P.v3.author-candidate.json#/entries/21/newAuthoredWholeCases/1. Solve complete second template/K/N/E with ends, 5′→3′ directions and 2 cycles; calculate 64/32.4, adapt K′ wrong R and count 6 new single strands, instead of exponential amplification.
  - Expected performance (DE): U′=GCATTACCGAAT, T′=3′-CGTAATGGCTTA-5′. Nach Zyklus 1: 4, Zyklus 2: 8 bei Start 2. K 64, N kein Ziel ohne Kontamination, E keine Synthese; 32,4 Erwartungswert. Falscher R lagert nach Modell nicht an: 6 neue U-Einzelstränge nach 3 Zyklen, linear.
  - Expected performance (EN): U′=GCATTACCGAAT, T′=3′-CGTAATGGCTTA-5′. Cycles 1/2 give 4/8 from 2. K 64, N no target without contamination, E no synthesis; 32.4 expectation. Wrong R cannot anneal under the rule: 6 new U single strands after 3 cycles, linear.
  - Understanding focus (DE): Natürliche DNA-Replikation und PCR beruhen auf Vorlage, Komplementarität, Primerstart und 5′→3′-Verlängerung. Technische Wärmezyklen erfordern geeignete Enzyme und spezifische Primer als gezielte Lösungen natürlicher Kopieraufgaben. Ideale Verdopplung, reale Effizienz und Kontrollbefunde sind voneinander zu unterscheiden.
  - Understanding focus (EN): Natural replication/PCR use templates, complementarity, primer initiation/5′→3′ extension. Heat cycles require suitable enzymes/specific primers as technical solutions for copying. Ideal doubling, actual efficiency/control findings differ.
## Page 4: Vektoren und Transformation

- Full learning-goal ID: `d11b3b18-deec-5d1a-bff6-512cddf595a2`
- Goal fingerprint: `sha256:3dbee52377d30af075bab5103c2cc397ba27d430d93087c90df8f962a9430ae5`
- Page fingerprint: `sha256:486a44b756cb276d26cecd6b73b56d324c686976301ba975083faff91bded1c5`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann Plasmide, Klonierungsstrategien und Expressionssysteme beschreiben.

### Visualization

/assets/goal-visualizations/biologie/d11b3b18-deec-5d1a-bff6-512cddf595a2/d11b3b18-deec-5d1a-bff6-512cddf595a2.png

- original digest: `sha256:fd26f77ac4bdf3ac5dfe4889b02931237b39081f3897361f158cdd95f4d15058`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gentechnische Methoden erläutern — `523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0` (page 2)

### Direct reverse prerequisites

- DNA gezielt verändern — `528a3cd3-4a4d-550d-939a-8dc8656446e4` (page 6)

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- Anwendungen reflektieren — `9540a95d-5ca5-527c-918f-d702e99be07a` (outside this book)
- RNA-Interferenz erklären — `ceb54223-197c-5289-a9c6-19358912e144` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b21ec6d1a15f5ac68468ee3a6bd129161d0f37c9e9d4b659169041ff52ee898d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `vector-cloning-functions`
  - Essential understanding (DE): Plasmide sind mögliche DNA-Träger; Replikation, Aufnahme und passende Identifizierung erlauben eine begründete Klonierungsstrategie.
  - Essential understanding (EN): Plasmids can carry DNA; replication, uptake and suitable identification support a justified cloning strategy.
  - Observable performance (DE): Beschreibt Insert, Vektor, Wirt und Kopierung am gegebenen Konstrukt und verfolgt DNA-Klonierung getrennt vom Produkt.
  - Observable performance (EN): Describes insert, vector, host and copying in the supplied construct and tracks DNA cloning separately from product formation.
- `expression-system-compatibility`
  - Essential understanding (DE): Expressionssysteme benötigen eine passende Kombination aus codierender DNA, Regulationssignalen und Wirtsfunktionen.
  - Essential understanding (EN): Expression systems need a compatible combination of coding DNA, regulatory signals and host functions.
  - Observable performance (DE): Erklärt das gegebene Proteinprodukt bzw. sein Ausbleiben und begründet, warum Plasmidkopien allein keine Expression beweisen.
  - Observable performance (EN): Explains production or absence of the given protein and why plasmid copies alone do not prove expression.

**Coverage expectations**

- required expectations: `vector-cloning-functions`, `expression-system-compatibility`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-content-contexts`: KopiervektorK gegenüber ExpressionsvektorE und WirtsvergleichH1/H2 mit unterschiedlicher Promotorerkennung. / Cloning vectorK versus expression vectorE and hostsH1/H2 with different promoter recognition.
- `fresh-content-premise`: Inaktivierte codierende Sequenz trotzPlasmidkopien gegenüber ungeklärter Proteinverarbeitung trotzpassendem Promotor. / Inactivated coding sequence despite copies versus unresolved processing despite a compatible promoter.

**Application cases**

- `cloning-versus-expression-plasmid`
  - Task demand (DE): Zwei vereinfachte Plasmidkarten enthalten denselben intronfreien Protein-Code und eine für den bakteriellen Wirt geeignete Replikationsfunktion. Vektor K trägt nur Kopierungs-/Identifikationsfunktionen; laut Karte fehlen wirksame Expressionssignale. Vektor E besitzt zusätzlich einen im Wirt funktionierenden Promotor. Beide werden aufgenommen und als DNA kopiert, nur E produziert im Modell das gewünschte Protein.

Beschreibe die Plasmide, ihre Klonierungsstrategie und beide Expressionssysteme. Erkläre, welche Beobachtung DNA-Klonierung belegt und welche zusätzlich Expression belegt.

Frische Variation: Die zweite Karte zeigt nun viele E-Plasmidkopien, aber eine Mutation hat die codierende Sequenz inaktiviert. Bleibt die Schlussfolgerung zum Protein bestehen?
  - Task demand (EN): Two simplified plasmid cards carry the same intron-free protein code and a bacterial-host-compatible replication function. K has copying/identification functions only; the card lacks effective expression signals. E additionally has a promoter functional in that host. Both are taken up and copied as DNA; only E produces the desired protein in the model.

Describe plasmids, the cloning strategy and both expression systems. Explain what establishes DNA cloning and what additionally establishes expression.

Fresh variation: The second card now shows many E copies but a mutation inactivates the coding sequence. Does the protein conclusion still follow?
  - Expected performance (DE): Das Insert liegt im jeweiligen Plasmid, das nach Aufnahme mit passenden Wirtsfunktionen vervielfältigt wird. Identifizierte Nachkommen mit Kopien tragen einen Zellklon bzw. vermehren das DNA-Konstrukt. Für E liefert der passende Promotor die zusätzliche Expressionsbedingung; die beobachtete Proteinbildung stützt die Expression. K kann DNA kopieren, ohne das gewünschte Protein zu bilden. Klonieren und Exprimieren sind verschiedene Leistungen; beide verlangen ein geeignetes Wirt/Vektor-Zusammenspiel.

Transfer: DNA-Klonierung kann fortbestehen; eine funktionsfähige codierende Information fehlt jedoch. Viele Kopien und ein passender Promotor garantieren kein intaktes Proteinprodukt.
  - Expected performance (EN): The insert is carried by each plasmid, which is copied after uptake through compatible host functions. Identified descendants with copies form a carrier-cell clone or amplify the DNA construct. E has the extra functional-promoter condition; observed protein production supports expression. K can copy DNA without producing the desired protein. Cloning and expression are distinct functions, both requiring host/vector compatibility.

Transfer: DNA cloning can continue, but functional coding information is missing. Many copies and a matching promoter do not guarantee an intact protein product.
  - Understanding focus (DE): Plasmide sind mögliche DNA-Träger; Replikation, Aufnahme und passende Identifizierung erlauben eine begründete Klonierungsstrategie. Expressionssysteme benötigen eine passende Kombination aus codierender DNA, Regulationssignalen und Wirtsfunktionen.
  - Understanding focus (EN): Plasmids can carry DNA; replication, uptake and suitable identification support a justified cloning strategy. Expression systems need a compatible combination of coding DNA, regulatory signals and host functions.
- `changed-host-expression-system`
  - Task demand (DE): Vektor V trägt ein intaktes Insert und einen Promotor, der laut Karte nur im eukaryotischen Wirtsmodell H1 erkannt wird. Die angegebene DNA-Erhaltung gelingt in H1 und H2; in H2 wird der Promotor nicht erkannt. Genexpression benötigt im Modell zusätzlich Transkription und Translation. Es liegt eine Vergleichskarte vor, kein ausgeführter Transfer.

Beschreibe Vektorrolle, mögliche DNA-Vermehrung/Klonierung und eine passende Expressionsstrategie. Unterscheide nach den Angaben die beiden Wirte und begründe eine Wahl für Proteinproduktion.

Frische Variation: Ein ausgetauschter Promotor wird nun auch in H2 erkannt, jedoch liefert die Karte keine Information zur Proteinverarbeitung. Kann man identische funktionsfähige Endprodukte in beiden Wirten behaupten?
  - Task demand (EN): Vector V carries an intact insert and a promoter recognized only in eukaryotic host model H1 according to the card. Stated DNA maintenance succeeds in H1 and H2; H2 does not recognize the promoter. Expression additionally needs transcription and translation in the model. This is a comparison card, not performed transfer.

Describe vector role, possible DNA maintenance/cloning and a suitable expression strategy. Distinguish the two hosts and justify a production choice using the supplied facts.

Fresh variation: A replacement promoter is now recognized in H2, but the card supplies no protein-processing evidence. Can identical functional final products in both hosts be asserted?
  - Expected performance (DE): V transportiert und erhält das Insert nach den angegebenen Bedingungen. DNA-Erhaltung allein besagt noch nicht, dass das Insert exprimiert wird. H1 erkennt den Promotor und ist bei ebenfalls passenden Transkriptions-/Translationsbedingungen die begründete Wahl. H2 kann das Konstrukt besitzen, ohne diese Expression zu leisten. Eine Klonierungsstrategie muss kompatible DNA-Vermehrung und Identifizierung berücksichtigen; für ein Expressionssystem kommen passende Regulations- und Wirtsfunktionen hinzu.

Transfer: Die Promotorlücke ist geschlossen, mögliche Verarbeitung oder Faltung ist aber nicht geklärt. Passende Transkription allein beweist kein identisches funktionsfähiges Endprodukt.
  - Expected performance (EN): V carries and maintains the insert under stated conditions. Maintenance alone does not establish expression. H1 recognizes the promoter and is the justified choice if transcription/translation are also suitable. H2 may contain the construct without that expression. Cloning needs compatible DNA multiplication and identification; expression additionally needs regulatory and host compatibility.

Transfer: The promoter gap is closed, but processing or folding is unresolved. Suitable transcription alone does not establish identical functional final products.
  - Understanding focus (DE): Plasmide sind mögliche DNA-Träger; Replikation, Aufnahme und passende Identifizierung erlauben eine begründete Klonierungsstrategie. Expressionssysteme benötigen eine passende Kombination aus codierender DNA, Regulationssignalen und Wirtsfunktionen.
  - Understanding focus (EN): Plasmids can carry DNA; replication, uptake and suitable identification support a justified cloning strategy. Expression systems need a compatible combination of coding DNA, regulatory signals and host functions.
## Page 5: Histonmodifikation analysieren

- Full learning-goal ID: `8f6933b1-6e02-5512-acf2-a90a7fb9cb75`
- Goal fingerprint: `sha256:93a8eeffc98043268e26f1db6636742824253d2bc970e50bcb07f89c9411cc91`
- Page fingerprint: `sha256:297e521beee5f0a073d7816fd7e6a35a17bb2f142fff231e9e6bd46444b96149`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann vorgegebene Befunde zu Histonacetylierung und Histonmethylierung analysieren und mögliche Auswirkungen dieser Modifikationen auf Chromatinzugänglichkeit und Genaktivität im jeweiligen Kontext erläutern.

### Visualization

/assets/goal-visualizations/biologie/8f6933b1-6e02-5512-acf2-a90a7fb9cb75/8f6933b1-6e02-5512-acf2-a90a7fb9cb75.png

- original digest: `sha256:669fbeccb84f2c1c472d9de886d84a363889bbacae0f46a7c9df4df3872e836e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gentechnische Methoden erläutern — `523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5fb68e33bc2f3e436a8333352f9f4047b548c13041f65011668079606f5e182c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `histone-marks`
  - Essential understanding (DE): Acetyl- und Methylgruppen können an Histonen beziehungsweise Histonschwänzen sitzen; solche Markierungen verändern nicht die Basenfolge der DNA.
  - Essential understanding (EN): Acetyl and methyl groups can occur on histones or histone tails; these marks do not change the DNA base sequence.
  - Observable performance (DE): Die lernende Person erkennt in einem neuen Nukleosomenschema Histonmarkierungen und trennt sie von einer DNA-Mutation oder DNA-Methylierung.
  - Observable performance (EN): In a new nucleosome diagram, the learner identifies histone marks and distinguishes them from a DNA mutation or DNA methylation.
- `contextual-regulation`
  - Essential understanding (DE): Histonmodifikationen können Chromatinzugänglichkeit und Genaktivität mitregulieren; die Richtung hängt unter anderem von Art und Position der Markierung und vom untersuchten Kontext ab.
  - Essential understanding (EN): Histone modifications can regulate chromatin accessibility and gene activity; the direction depends in part on the type and position of the mark and the investigated context.
  - Observable performance (DE): Die lernende Person deutet für zwei neue Datensätze Markierung, Zugänglichkeit und Transkription gemeinsam und vermeidet eine universelle Regel 'Methylierung aus, Acetylierung an'.
  - Observable performance (EN): The learner interprets mark, accessibility, and transcription together in two new data sets and avoids a universal 'methylation off, acetylation on' rule.

**Coverage expectations**

- required expectations: `histone-marks`, `contextual-regulation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `mark-position`: Art oder Position der Histonmarkierung wechseln. / Change the type or position of the histone mark.
- `data-direction`: Zugänglichkeit und Transkriptionsbefund in einem neuen Datensatz variieren. / Vary accessibility and transcription findings in a new data set.

**Application cases**

- `acetylation-observation`
  - Task demand (DE): Zwei sonst vergleichbare Zellproben haben dieselbe DNA-Sequenz. An einer untersuchten Histonstelle ist in Probe B mehr Acetylierung gemessen; dort sind Chromatinzugänglichkeit und Transkriptmenge höher. Erkläre eine passende epigenetische Deutung und ihre Grenze.
  - Task demand (EN): Two otherwise comparable cell samples have the same DNA sequence. Sample B has more acetylation at a studied histone site, with higher chromatin accessibility and transcript abundance. Explain a fitting epigenetic interpretation and its limit.
  - Expected performance (DE): Die lernende Person lokalisiert die Änderung am Histon, verbindet den gemessenen Zugänglichkeits- und Transkriptionsanstieg als plausible Regulation und behauptet weder eine DNA-Mutation noch eine allgemeingültige Wirkung jeder Acetylierung.
  - Expected performance (EN): The learner locates the change on the histone and links the measured accessibility and transcript rise as plausible regulation, without claiming a DNA mutation or a universal effect of every acetylation.
  - Understanding focus (DE): Gemessener Zusammenhang im konkreten Kontext statt pauschaler Schalterregel.
  - Understanding focus (EN): Measured relation in the given context rather than a universal switch rule.
- `methylation-transfer`
  - Task demand (DE): An einer anderen Histonstelle steigt in einem neuen Zellvergleich die Methylierung, während Zugänglichkeit und Transkriptmenge sinken; die DNA-Sequenz bleibt gleich. Erkläre den Befund und beurteile, ob er jede Histonmethylierung festlegt.
  - Task demand (EN): At another histone site in a new cell comparison, methylation rises while accessibility and transcript abundance fall; the DNA sequence stays the same. Explain the observation and judge whether it fixes the effect of all histone methylation.
  - Expected performance (DE): Die lernende Person beschreibt die histongebundene epigenetische Regulation dieses Falls, trennt sie von DNA-Methylierung und verneint eine allgemeine Wirkungsrichtung ohne Orts- und Kontextdaten.
  - Expected performance (EN): The learner describes histone-bound epigenetic regulation in this case, distinguishes it from DNA methylation, and rejects a general effect direction without site and context data.
  - Understanding focus (DE): Transfer auf eine andere Markierung und auf die Geltungsgrenze der Deutung.
  - Understanding focus (EN): Transfer to another mark and to the interpretation's scope limit.
## Page 6: DNA gezielt verändern

- Full learning-goal ID: `528a3cd3-4a4d-550d-939a-8dc8656446e4`
- Goal fingerprint: `sha256:2317a7da031e288c6946332b87b403548bb14a97b5a36840649d0051e1f14544`
- Page fingerprint: `sha256:8a677f5fad114b2e51f62613977a3d2fe6c382d2e4f584ab6d720578bc4122cd`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann anhand eines Modells das Einbringen von Fremd-DNA mithilfe von Plasmiden oder Viren in Wirtszellen erläutern und Klonierungen erklären.

### Visualization

/assets/goal-visualizations/biologie/528a3cd3-4a4d-550d-939a-8dc8656446e4/528a3cd3-4a4d-550d-939a-8dc8656446e4.png

- original digest: `sha256:f428be13bdc69f839cd2760a718f7ccf3cb595e392118b8f7f5f223568db9dca`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Vektoren und Transformation — `d11b3b18-deec-5d1a-bff6-512cddf595a2` (page 4)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- Gentechnisch veränderte Organismen bewerten — `50108500-7958-5954-b493-e89273649f8f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f8cf723f3dc2d1f10329f092dd5201dc61a6de0a051a77b8a9ced75ab57d988d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `foreign-dna-route`
  - Essential understanding (DE): Ein passender Vektor kann Fremd-DNA in eine geeignete Wirtszelle übertragen; Plasmid- und Viruswege sind Alternativen mit unterschiedlichen Voraussetzungen.
  - Essential understanding (EN): A suitable vector can deliver foreign DNA to an appropriate host; plasmid and viral routes are alternatives with different requirements.
  - Observable performance (DE): Erläutert am gegebenen Modell das Zusammenfügen bzw. Verpacken, die Übertragung und die Rolle von Vektor und Wirt.
  - Observable performance (EN): Explains assembly/packaging, delivery and vector/host roles in the supplied model.
- `clonal-copy-distinction`
  - Essential understanding (DE): Klonierung bezeichnet hier die Vermehrung gleicher rekombinanter DNA bzw. davon tragender Zellklone; Übertragung bedeutet nicht automatisch Chromosomenintegration oder Expression.
  - Essential understanding (EN): Cloning here multiplies identical recombinant DNA or carrier-cell clones; delivery does not automatically mean chromosomal integration or expression.
  - Observable performance (DE): Verfolgt Fremd-DNA und ihre Kopien und unterscheidet Aufnahme, stabile Weitergabe, Integration und Proteinbildung.
  - Observable performance (EN): Tracks foreign DNA/copies and distinguishes uptake, stable inheritance, integration and protein production.

**Coverage expectations**

- required expectations: `foreign-dna-route`, `clonal-copy-distinction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-content-contexts`: Plasmidaufnahme mit eigenständiger Kopierung gegenüber nichtvermehrungsfähigem Virusvektor mit vorübergehender Fremd-DNA. / Plasmid uptake with independent copying versus nonreplicating viral vector with temporary foreign DNA.
- `fresh-content-premise`: Verlust der Replikationsfunktion gegenüber neu belegter stabiler Integration/Weitergabe; Aufnahme und Zellklon unterscheiden. / Lost replication function versus newly established stable integration/inheritance; distinguish uptake from a carrier-cell clone.

**Application cases**

- `plasmid-introduction-clones`
  - Task demand (DE): Konstruiertes Modell: Ein geeigneter bakterieller Plasmidvektor enthält eine Replikationsfunktion. Ein längeres Fremd-DNA-Stück wird in den Ring eingefügt; eine Wirtszelle nimmt den vollständigen rekombinanten Ring auf. Laut Karte wird der Ring bei Zellvermehrung kopiert und an Tochterzellen weitergegeben. Er bleibt vom Bakterienchromosom getrennt; Proteinbildung ist nicht untersucht.

Erläutere am Modell, wie Fremd-DNA mit einem Plasmid in die Wirtszelle gelangt und Klonierung zustande kommt. Prüfe: Einbringen bedeutet immer Einbau ins Wirtschromosom und sofortige Proteinbildung.

Frische Variation: Das Fremd-DNA-Stück bleibt erhalten, aber eine neue Vektorkarte verliert die funktionierende Replikationsstelle. Die Aufnahme gelingt einmalig. Ist eine stabile Klonierung durch viele Zellgenerationen gesichert?
  - Task demand (EN): Constructed model: a suitable bacterial plasmid vector has a replication function. A longer foreign-DNA segment is inserted into the ring; a host takes up the complete recombinant ring. The card states that it is copied and passed to daughter cells. It remains separate from the bacterial chromosome; protein production was not tested.

Explain how plasmid delivery introduces foreign DNA and how cloning occurs in this model. Assess: delivery always means integration into the host chromosome and immediate protein production.

Fresh variation: The insert is retained but a new vector lacks a functional replication origin. One-time uptake succeeds. Is stable cloning through many cell generations established?
  - Expected performance (DE): Das rekombinante Plasmid ist der Träger der eingefügten Fremd-DNA. Durch Aufnahme kommt der Träger in die Wirtszelle. Mit der gegebenen Replikation und Zellvermehrung entstehen DNA-Kopien und Zellklone mit diesem Konstrukt. Laut Material bleibt das Plasmid eigenständig; Übertragung und Chromosomenintegration sind somit nicht dasselbe. Expression braucht weitere passende Bedingungen und wurde hier nicht belegt. Dies ist eine Erklärung einer Modellübertragung, keine durchgeführte Transformation.

Transfer: Einmalige Aufnahme ist belegt; dauerhafte Vervielfältigung/Weitergabe dieses selbständigen Plasmids ist ohne passende Replikation nicht gesichert. Aufnahme allein ersetzt keinen Stabilitätsnachweis.
  - Expected performance (EN): The recombinant plasmid carries the foreign insert. Uptake brings the carrier into the host. Given replication and cell division yield DNA copies and cell clones containing it. The plasmid remains separate according to the material, so delivery and chromosomal integration are distinct. Expression requires further suitable conditions and is untested here. This explains modeled delivery, not a performed transformation.

Transfer: One-time uptake is established; sustained copying/transmission of this separate plasmid is not guaranteed without suitable replication. Uptake alone does not establish stability.
  - Understanding focus (DE): Ein passender Vektor kann Fremd-DNA in eine geeignete Wirtszelle übertragen; Plasmid- und Viruswege sind Alternativen mit unterschiedlichen Voraussetzungen. Klonierung bezeichnet hier die Vermehrung gleicher rekombinanter DNA bzw. davon tragender Zellklone; Übertragung bedeutet nicht automatisch Chromosomenintegration oder Expression.
  - Understanding focus (EN): A suitable vector can deliver foreign DNA to an appropriate host; plasmid and viral routes are alternatives with different requirements. Cloning here multiplies identical recombinant DNA or carrier-cell clones; delivery does not automatically mean chromosomal integration or expression.
- `viral-vector-specified-limit`
  - Task demand (DE): Schematische Materialkarte: Ein veränderter Virusvektor trägt Fremd-DNA und kann sie in den angegebenen Zelltyp übertragen. Der hier vorgegebene Vektor ist nicht selbst vermehrungsfähig; die übertragene DNA bleibt im Modell vorübergehend außerhalb der Chromosomen. Ein anderes Kontrollmodell mit Plasmid erlaubt DNA-Kopierung und Weitergabe in Bakterien. Es werden weder reale Infektionen noch gentechnische Versuche ausgeführt.

Erkläre den Virusweg als Alternative zum Plasmid und begrenze die Aussage, jeder erfolgreiche Transfer sei schon stabile Klonierung. Unterscheide Träger, DNA, Wirtszelle und Zellklon.

Frische Variation: Eine ergänzte Karte belegt nun stabile Integration der übertragenen DNA in eine Wirtszelle und Weitergabe an deren Tochterzellen. Welche Klonierungsaussage wird zusätzlich möglich?
  - Task demand (EN): Schematic card: a modified viral vector carries foreign DNA and can deliver it to the specified cell type. This stipulated vector cannot reproduce itself; the transferred DNA remains temporarily outside chromosomes in the model. A separate plasmid control supports copying and inheritance in bacteria. No actual infection or genetic engineering is performed.

Explain viral delivery as an alternative to plasmids and bound the claim that any successful transfer is stable cloning. Distinguish carrier, DNA, host and cell clone.

Fresh variation: An added card establishes stable integration in one host and inheritance by its daughter cells. What additional cloning claim becomes possible?
  - Expected performance (DE): Der Virusvektor vermittelt die Aufnahme der Fremd-DNA in den angegebenen Zelltyp. Das Prinzip der Trägerübertragung ähnelt dem Plasmidweg, seine konkreten Eigenschaften sind aber anders. Das Material belegt nur vorübergehende DNA-Präsenz und keine eigenständige Vektorvermehrung oder stabile Weitergabe. Klonierung braucht darüber hinaus gesicherte Kopierung bzw. passende Zellklon-Vermehrung. Nicht alle Virusvektoren verhalten sich gleich; insbesondere Integration folgt hier nicht aus dem Wort Virus.

Transfer: Bei Vermehrung dieser Zelle kann nun ein Zellklon mit stabil weitergegebener Fremd-DNA entstehen. Das belegt noch keine gleiche Proteinproduktion in jeder Tochter und keinen frei vermehrungsfähigen Virus.
  - Expected performance (EN): The viral vector enables delivery into the specified cells. Carrier-mediated introduction resembles the plasmid principle but the specified properties differ. The card establishes temporary DNA presence, not autonomous vector reproduction or stable inheritance. Cloning additionally needs established copying or suitable expansion of carrier-cell clones. Viral vectors are not all identical; integration does not follow here simply from the word virus.

Transfer: Expansion of that cell can now produce a clone with stably inherited foreign DNA. This still proves neither equal protein production in every daughter nor autonomous viral replication.
  - Understanding focus (DE): Ein passender Vektor kann Fremd-DNA in eine geeignete Wirtszelle übertragen; Plasmid- und Viruswege sind Alternativen mit unterschiedlichen Voraussetzungen. Klonierung bezeichnet hier die Vermehrung gleicher rekombinanter DNA bzw. davon tragender Zellklone; Übertragung bedeutet nicht automatisch Chromosomenintegration oder Expression.
  - Understanding focus (EN): A suitable vector can deliver foreign DNA to an appropriate host; plasmid and viral routes are alternatives with different requirements. Cloning here multiplies identical recombinant DNA or carrier-cell clones; delivery does not automatically mean chromosomal integration or expression.
## Page 7: PCR einsetzen

- Full learning-goal ID: `a3f483ce-126e-595c-999c-aa4d95106221`
- Goal fingerprint: `sha256:62285f011baa5598cb0bcd050fa24ea3a677b9ac15bbed32be6491a27b732869`
- Page fingerprint: `sha256:95dd85404c97f3234ebb47f30cbe17fe92886acbe05726e86b74e385305f97b3`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.2 Gene und Gentechnik

### Canonical description

Die lernende Person kann Prinzip und Anwendungen der Polymerase-Kettenreaktion beschreiben.

### Visualization

/assets/goal-visualizations/biologie/a3f483ce-126e-595c-999c-aa4d95106221/a3f483ce-126e-595c-999c-aa4d95106221.png

- original digest: `sha256:ec52f2dc1947a99263c623119a32c87276f25e4131d293cb30cfd9597774357a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gentechnische Methoden erläutern — `523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)
- NGS-Workflows einordnen — `3f969b9e-68b0-5442-b8e4-df4e35e83087` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1dd1fee493b0225b03aca36d45a7551d717e4a66d6fa03a137d95816cb67ff58`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `cycle-and-target`
  - Essential understanding (DE): PCR verbindet Strangtrennung, passende Primerbindung und DNA-Polymerase-Verlängerung; die Primer begrenzen das gezielt vervielfältigte DNA-Gebiet.
  - Essential understanding (EN): PCR combines strand separation, matching primer binding and DNA-polymerase extension; primers delimit the selectively amplified region.
  - Observable performance (DE): Beschreibt die drei Schritte, antiparallele Verlängerungsrichtungen und die Kopierung eines bestimmten Zielabschnitts.
  - Observable performance (EN): Describes the three steps, opposite extension directions and copying of a specified target region.
- `applications-and-controls`
  - Essential understanding (DE): Vervielfältigte DNA erleichtert nachfolgende Untersuchung, aber Kontrollen und Zielfassung begrenzen die Aussage.
  - Essential understanding (EN): Amplified DNA enables subsequent analysis, but controls and target choice bound the inference.
  - Observable performance (DE): Erläutert die Verwendung im gegebenen Analysefall und passt die Schlussfolgerung bei Kontamination, fehlender Kontrolle oder geänderter Bindestelle an.
  - Observable performance (EN): Explains the supplied analytical use and revises conclusions for contamination, failed controls or changed binding sites.

**Coverage expectations**

- required expectations: `cycle-and-target`, `applications-and-controls`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-content-contexts`: 150bp-Ziel mit gegenläufigen Primerverlängerungen gegenüber kontrolliertem Ziel-DNA-Nachweis in einer Wasserprobe. / 150bp target with opposite primer extensions versus controlled target-DNA detection in a water sample.
- `fresh-content-premise`: Nach außen zeigende Primer gegenüber neu positiver vorlagenfreier Kontrolle; Folgerungen eigenständig anpassen. / Outward-pointing primers versus newly positive no-template control; revise inference independently.

**Application cases**

- `pcr-target-cycle-analysis`
  - Task demand (DE): Ein Modell zeigt zwei komplementäre DNA-Stränge und ein Primerpaar, das einen 150-bp-Abschnitt begrenzt. Die Primer binden an gegenüberliegenden Strängen an entgegengesetzten Enden; Verlängerung führt in den gewählten Abschnitt hinein. Ein Zyklus umfasst Trennung, Primerbindung und Verlängerung durch DNA-Polymerase. Wiederholung erhöht die Zahl der Zielkopien. Danach soll das Zielstück größenanalytisch untersucht werden.

Beschreibe Prinzip und Anwendung der PCR. Ordne die drei Zyklusschritte, erkläre die Rolle beider Primer und unterscheide Vervielfältigung vom späteren Größennachweis.

Frische Variation: Ein neues Primerpaar bindet an dieselben Vorlagen, seine verlängerbaren Enden zeigen jedoch voneinander weg aus dem gewählten Bereich. Ist dieser Bereich durch diese Paarung wie zuvor begrenzt?
  - Task demand (EN): A model shows complementary DNA strands and primers delimiting a 150-bp region. Primers bind opposite strands at opposite ends; extension proceeds into the chosen region. A cycle includes separation, primer binding and DNA-polymerase extension. Repetition increases target-copy number. Subsequent analysis examines its size.

Describe PCR principle and application. Order the three cycle stages, explain both primers and distinguish amplification from subsequent size detection.

Fresh variation: A new primer pair binds the same templates but its extendable ends point away from each other and out of the chosen region. Is that region delimited as before?
  - Expected performance (DE): Strangtrennung macht die Vorlagen zugänglich. Passende Primer binden an den gegenüberliegenden Vorlagen; Polymerase verlängert von den Primerenden aus in 5′→3′-Richtung. Wegen der antiparallelen Vorlagen laufen die beiden Verlängerungen räumlich gegensinnig in den Zielbereich. Wiederholte Zyklen vervielfältigen gezielt die primerbegrenzte DNA, im idealen Modell annähernd verdoppelnd; reale Effizienz ist nicht unbegrenzt. Mehr Kopien erleichtern Untersuchung. PCR selbst ist nicht die Geltrennung und vervielfältigt keine Proteine.

Transfer: Nein: Die Verlängerungsrichtungen begrenzen den gewünschten inneren Abschnitt nicht wie zuvor. Bloße Bindung zweier Primer genügt nicht; Bindestellen und Orientierung müssen zum Ziel passen.
  - Expected performance (EN): Separation exposes templates. Matching primers bind opposite templates; polymerase extends from primer ends in the 5′→3′ direction. Antiparallel templates make the extensions spatially opposite, into the target. Repeated cycles selectively amplify primer-bounded DNA, approximately doubling in an ideal model; real efficiency is not unlimited. Copies facilitate analysis. PCR is not gel separation and does not amplify proteins.

Transfer: No: the extension directions do not delimit the intended internal region as before. Two primers merely binding is insufficient; position and orientation must fit the target.
  - Understanding focus (DE): PCR verbindet Strangtrennung, passende Primerbindung und DNA-Polymerase-Verlängerung; die Primer begrenzen das gezielt vervielfältigte DNA-Gebiet. Vervielfältigte DNA erleichtert nachfolgende Untersuchung, aber Kontrollen und Zielfassung begrenzen die Aussage.
  - Understanding focus (EN): PCR combines strand separation, matching primer binding and DNA-polymerase extension; primers delimit the selectively amplified region. Amplified DNA enables subsequent analysis, but controls and target choice bound the inference.
- `pcr-monitoring-controls`
  - Task demand (DE): Didaktischer Nachweisfall ohne diagnostische Freigabe: Ein spezifisches Primerpaar soll ein gegebenes DNA-Ziel im Wasserprobenmaterial vervielfältigen. Die Positivkontrolle enthält das passende Ziel, die Negativkontrolle keine Vorlage. Ergebnis: Positivkontrolle und Probe zeigen das erwartete Zielsignal; Negativkontrolle bleibt leer. Der Nachweis betrifft nur die untersuchte DNA, nicht automatisch lebende Organismen oder einen Gesundheitsbefund.

Erläutere die PCR-Anwendung mithilfe ihres Zyklus und der Kontrollen. Welche Aussage tragen diese Ergebnisse, welche stärkere Behauptung tragen sie nicht?

Frische Variation: Frische Daten: Nun zeigt auch die vorlagenfreie Negativkontrolle das erwartete Signal, während die Probe weiterhin positiv ist. Wie ändern sich die zulässigen Aussagen?
  - Task demand (EN): Teaching detection case without diagnostic approval: specific primers amplify a stipulated DNA target in a water sample. The positive control contains matching target; the negative control has no template. Positive control and sample show the expected signal, negative control is empty. This detects tested DNA, not necessarily living organisms or a health condition.

Explain this PCR application through the cycle and controls. What inference do the results support and what stronger claim do they not support?

Fresh variation: Fresh data: the no-template negative control now also shows the expected signal, while the sample remains positive. How do justified conclusions change?
  - Expected performance (DE): Die Zyklen aus Strangtrennung, Primerbindung und Verlängerung vervielfältigen passendes Zielmaterial, sodass ein Signal untersucht werden kann. Die funktionierende Positivkontrolle stützt die grundsätzliche Nachweisfähigkeit; die leere Negativkontrolle zeigt keinen Kontaminationsnachweis in diesem Kontrollansatz. Das Probesignal ist mit vorhandener Ziel-DNA vereinbar. Daraus folgt nicht automatisch, dass ein bestimmter Organismus lebend vorhanden ist, seine Menge exakt bekannt ist oder eine gesundheitliche Bewertung zulässig wäre.

Transfer: Kontamination oder eine andere unspezifische Signalquelle ist zu klären. Das Probesignal kann nicht mehr sicher ausschließlich der Probe zugeordnet werden; eine unveränderte Nachweisbehauptung wäre überzogen. Eine erneute kontrollierte Prüfung ist nötig.
  - Expected performance (EN): Cycles of separation, primer binding and extension amplify matching target for detection. The working positive control supports assay functionality; the empty negative control does not show contamination in that control. The sample signal is compatible with target DNA. It does not automatically establish a living organism, an exact quantity or an authorized health assessment.

Transfer: Contamination or another nonspecific source needs clarification. The sample signal can no longer confidently be attributed solely to its sample; repeating the unchanged detection claim would overstate evidence. Controlled rechecking is needed.
  - Understanding focus (DE): PCR verbindet Strangtrennung, passende Primerbindung und DNA-Polymerase-Verlängerung; die Primer begrenzen das gezielt vervielfältigte DNA-Gebiet. Vervielfältigte DNA erleichtert nachfolgende Untersuchung, aber Kontrollen und Zielfassung begrenzen die Aussage.
  - Understanding focus (EN): PCR combines strand separation, matching primer binding and DNA-polymerase extension; primers delimit the selectively amplified region. Amplified DNA enables subsequent analysis, but controls and target choice bound the inference.
## Page 8: Biotechnologische Medikamentenproduktion

- Full learning-goal ID: `27b22c33-908c-5fa8-9d9f-a08aff8da143`
- Goal fingerprint: `sha256:889dbf64f06401e707f59acd1c60fe50b27045f095d79f4d6348c1e2df419914`
- Page fingerprint: `sha256:825b52b9a466bf99abbbdbc6cb5412a95adc60deef75d56c64a98ba0b7d70346`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.4 Anwendungsgebiete der Gentechnik und ihre gesellschaftlichen Herausforderungen

### Canonical description

Die lernende Person kann ein Beispiel biotechnologischer Medikamentenherstellung erläutern.

### Visualization

/assets/goal-visualizations/biologie/27b22c33-908c-5fa8-9d9f-a08aff8da143/27b22c33-908c-5fa8-9d9f-a08aff8da143.png

- original digest: `sha256:aaae7462ae4f2807244f504e84e986c69a9ededb1fc5c4e2b68ef4a1ac55fbe5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- CRISPR/Cas erläutern — `f53d0a0b-d9b8-5012-92b5-3a021ab6c30b` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Biologie bearbeiten — `1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8551de65b92ccfd962df02beca2791b0fc5e3f6df3353e0c7250560812e4f595`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `gene-expression-host`
  - Essential understanding (DE): Ein passendes rekombinantes DNA-Konstrukt ermöglicht einer geeigneten Wirtszelle die Bildung eines gewünschten Proteins.
  - Essential understanding (EN): A suitable recombinant DNA construct lets an appropriate host produce the desired protein.
  - Observable performance (DE): Verknüpft Gen, Expressionssignale, Wirtszelle und Proteinprodukt am gegebenen Herstellungsbeispiel.
  - Observable performance (EN): Connects gene, expression signals, host and protein product in the supplied production example.
- `production-purification`
  - Essential understanding (DE): Vermehrung der Produzenten, Proteinbildung und anschließende Aufarbeitung sind verschiedene Schritte; Zellmasse ist kein fertiges Medikament.
  - Essential understanding (EN): Producer growth, protein production and subsequent processing are distinct; cell mass is not the finished medicine.
  - Observable performance (DE): Ordnet Kultivierung, Proteinbildung, Trennung/Reinigung und Qualitätsprüfung kausal und erklärt einen gegebenen Ausfall.
  - Observable performance (EN): Orders cultivation, protein production, separation/purification and quality checking causally and explains a supplied failure.
- `host-product-fit`
  - Essential understanding (DE): Der Wirt muss die erforderlichen Expressions- und Proteinverarbeitungsschritte leisten; ein Gen allein garantiert kein funktionsfähiges Produkt.
  - Essential understanding (EN): The host must support the required expression and protein-processing steps; a gene alone guarantees no functional product.
  - Observable performance (DE): Leitet aus einer geänderten Wirts- oder Produktanforderung eine begründete Herstellungsgrenze ab.
  - Observable performance (EN): Infers a justified production limit from a changed host or product requirement.

**Coverage expectations**

- required expectations: `gene-expression-host`, `production-purification`, `host-product-fit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-content-contexts`: Insulin-Vorläuferkette im Bakterium gegenüber einem Protein mit benötigter Zucker-Modifikation; passende Signale und Verarbeitung getrennt begründen. / Bacterial insulin-precursor production versus a protein requiring sugar modification; justify signals and processing separately.
- `fresh-content-premise`: Expressionssignalverlust versus neu belegte Verarbeitung bei weiterhin ungeklärter Expression. / Lost expression signal versus newly established processing while expression remains unresolved.

**Application cases**

- `insulin-production-chain`
  - Task demand (DE): Vereinfachtes Herstellungsmodell: Eine intronfreie DNA-Sequenz für ein Insulin-Vorläuferprotein wird mit bakterientauglichen Expressionssignalen in einen Plasmidvektor eingebaut. Geeignete Produktionsbakterien tragen diesen Vektor. Im geschlossenen Bioreaktor erhalten sie kontrollierte Bedingungen; danach wird das Protein getrennt, zum funktionsfähigen Produkt verarbeitet, gereinigt und auf Identität/Reinheit geprüft. Das ist eine didaktische Ablaufkarte, keine Laboranleitung.

Erläutere an diesem Beispiel, warum DNA-Veränderung, Zellvermehrung, Proteinproduktion und Aufarbeitung zusammengehören. Prüfe die Behauptung: Viele Bakterien bedeuten schon viel gebrauchsfertiges Insulin.

Frische Variation: In einer neuen Charge ist die Zellmasse groß, aber das Plasmid hat sein passendes Expressionssignal verloren. Welche Stufe fällt aus, welche Beobachtung bleibt möglich?
  - Task demand (EN): Simplified production model: an intron-free coding sequence for an insulin precursor is put in a plasmid with bacterial expression signals. Suitable production bacteria carry it. A closed bioreactor supplies controlled conditions; the protein is then separated, processed into the functional product, purified and checked for identity/purity. This is a teaching flow, not a laboratory protocol.

Explain why DNA modification, cell growth, protein production and processing belong together in this example. Assess: many bacteria already mean much ready-to-use insulin.

Fresh variation: A new batch has large biomass but its plasmid has lost the required expression signal. Which stage fails and what can still be observed?
  - Expected performance (DE): Die eingebrachte codierende Sequenz liefert die Information; passende Regulationssignale und der Wirt ermöglichen die Expression. Vermehrung erhöht die Zahl möglicher Produzenten, beweist aber weder starke Expression noch ein korrekt verarbeitetes Produkt. Nach der Bildung müssen Vorläuferverarbeitung, Abtrennung und Reinigung erfolgen; die Prüfung beurteilt das erhaltene Produkt. Zellmasse und Arzneimittel sind deshalb verschiedene Größen. Das Beispiel erläutert Herstellung und behauptet keine klinische Wirksamkeitsprüfung.

Transfer: Die Zellen können sich weiterhin vermehren. Ohne das erforderliche Signal ist die geplante Proteinexpression nicht gesichert; Reinigung kann fehlendes Protein nicht erzeugen. Zellmasse genügt nicht als Herstellungsnachweis.
  - Expected performance (EN): The introduced coding sequence supplies information; suitable regulation and the host enable expression. Growth increases potential producers but proves neither strong expression nor correct product processing. Production must be followed by precursor processing, separation and purification; checks address the obtained product. Biomass and medicine are distinct quantities. This example explains manufacture, not clinical efficacy testing.

Transfer: Cells may still multiply. Without the required signal the planned protein expression is not established; purification cannot create missing protein. Biomass alone is insufficient production evidence.
  - Understanding focus (DE): Ein passendes rekombinantes DNA-Konstrukt ermöglicht einer geeigneten Wirtszelle die Bildung eines gewünschten Proteins. Vermehrung der Produzenten, Proteinbildung und anschließende Aufarbeitung sind verschiedene Schritte; Zellmasse ist kein fertiges Medikament. Der Wirt muss die erforderlichen Expressions- und Proteinverarbeitungsschritte leisten; ein Gen allein garantiert kein funktionsfähiges Produkt.
  - Understanding focus (EN): A suitable recombinant DNA construct lets an appropriate host produce the desired protein. Producer growth, protein production and subsequent processing are distinct; cell mass is not the finished medicine. The host must support the required expression and protein-processing steps; a gene alone guarantees no functional product.
- `medicine-host-processing-transfer`
  - Task demand (DE): Modell eines zweiten Proteinmedikaments: Das bereitgestellte Funktionsprofil verlangt eine bestimmte Zucker-Modifikation des Proteins. Wirt B bildet zwar die Aminosäurekette, besitzt diese Verarbeitung aber nicht. Wirt E besitzt laut Material passende Expressions- und Verarbeitungssysteme. In beiden Fällen sind anschließende Reinigung und Produktprüfung vorgesehen; Mengen- oder klinische Daten liegen nicht vor.

Erläutere die biotechnologische Herstellung am Beispiel und begründe eine Wirtswahl. Vergleiche mit dem Insulinmodell und erkläre, warum die DNA-Sequenz als einzige Angabe nicht reicht.

Frische Variation: Eine ergänzte Materialkarte bescheinigt B nun die benötigte Verarbeitung, nennt aber kein funktionierendes Expressionssignal. Ändert das die sichere Herstellungsentscheidung?
  - Task demand (EN): Model of another protein medicine: the supplied functional specification requires a particular sugar modification. Host B produces the amino-acid chain but lacks this processing. Host E has suitable expression and processing systems according to the material. Both routes include purification and product testing; no yield or clinical data are supplied.

Explain manufacture in this example and justify host choice. Compare with the insulin model and explain why the coding sequence alone is insufficient.

Fresh variation: An added card now gives B the required processing but does not establish a working expression signal. Does that establish production suitability?
  - Expected performance (DE): Das Gen muss eingebracht und mit passenden Signalen exprimiert werden. Für das vorgegebene Produkt ist zusätzlich die besondere Verarbeitung nötig; E erfüllt diese Bedingung, B laut Material nicht. Die Zellkultivierung erzeugt Produzenten und das Protein wird danach gereinigt sowie auf geforderte Eigenschaften geprüft. Im Insulinmodell war eine andere Verarbeitungskette beschrieben. Nicht jedes Proteinmedikament lässt sich unverändert in jedem Bakterium herstellen; aus der Eignung folgt noch keine höhere Ausbeute oder klinische Freigabe.

Transfer: Die Verarbeitungslücke ist geschlossen, die Expression bleibt offen. Beide Bedingungen müssen passen; B ist deshalb noch kein sicher geeigneter Produzent.
  - Expected performance (EN): The gene must be introduced and expressed with appropriate signals. This specified product additionally needs processing; E meets that requirement, B does not according to the material. Cultivation supplies producers; protein is then purified and checked for the required properties. The insulin model described another processing chain. Not every protein medicine can be made unchanged in every bacterium; suitability alone proves neither higher yield nor clinical approval.

Transfer: The processing gap is closed but expression remains unresolved. Both conditions are required; B is not yet established as a suitable producer.
  - Understanding focus (DE): Ein passendes rekombinantes DNA-Konstrukt ermöglicht einer geeigneten Wirtszelle die Bildung eines gewünschten Proteins. Vermehrung der Produzenten, Proteinbildung und anschließende Aufarbeitung sind verschiedene Schritte; Zellmasse ist kein fertiges Medikament. Der Wirt muss die erforderlichen Expressions- und Proteinverarbeitungsschritte leisten; ein Gen allein garantiert kein funktionsfähiges Produkt.
  - Understanding focus (EN): A suitable recombinant DNA construct lets an appropriate host produce the desired protein. Producer growth, protein production and subsequent processing are distinct; cell mass is not the finished medicine. The host must support the required expression and protein-processing steps; a gene alone guarantees no functional product.
## Page 9: Evo-Devo Perspektiven

- Full learning-goal ID: `9b40dae5-6d89-5714-ac96-373e72a7045e`
- Goal fingerprint: `sha256:9e485ea10ef815b7af13dec2b4174817e195c44e5676461b28f9c4ef36546bb0`
- Page fingerprint: `sha256:5574aed4e1cf6f6b16eaaaf1dc4582ea855f7703def5d128afa8b0a8596d29e7`
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
## Page 10: Biotechnologische Nutzbarkeit von Mikroorganismen erklären

- Full learning-goal ID: `4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf`
- Goal fingerprint: `sha256:17ff1f333f69288bc2d8c5bf99b3805568012aa03dcce49e157e00a9cb492557`
- Page fingerprint: `sha256:d449f0c8bb29f2e4f478c94cb284182295ca097b08955d2cc3afdef6d6a41961`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Mikroorganismen, Lebensmittel und Biotechnologie (Sek I)

### Canonical description

Die lernende Person kann die biotechnologische Nutzbarkeit von Mikroorganismen erklären, indem sie Grundbauplan, Fortpflanzung und Stoffwechsel beschreibt.

### Visualization

/assets/goal-visualizations/biologie/4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf/4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf.png

- original digest: `sha256:fe10f2dded34d54a39c013830e7094b62afca7df43e535ae4550c1135119b0a3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Pflanzen- und Tierzellen vergleichen — `b1dff57f-329e-5264-b2b9-2db71a0b2172` (outside this book)
- Bedeutung von Fotosynthese und Zellatmung erklären — `8678d0b5-8b74-5b01-8143-91bfea1e4482` (outside this book)

### Direct reverse prerequisites outside this book

- Lebensmittelverderb durch Mikroorganismen erklären — `39ba4385-0144-5e20-ba11-e3714756583b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:268a3821fd9caa14ed1bc31dae8d084a6ab9f179e85bc65faf5053e58d49a0b3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `cell-design-use`
  - Essential understanding (DE): Mikroorganismen besitzen unterschiedliche Zellbaupläne, die bei einer konkreten Nutzung berücksichtigt werden.
  - Essential understanding (EN): Microorganisms have different cellular designs relevant to a particular use.
  - Observable performance (DE): Unterscheidet am Beispiel eukaryotische Hefe und prokaryotische Bakterien und verbindet Zellbau mit ihrer Nutzung.
  - Observable performance (EN): Distinguishes eukaryotic yeast from prokaryotic bacteria and relates cellular design to use.
- `reproduction-production`
  - Essential understanding (DE): Vermehrung vergrößert unter passenden Bedingungen eine Kultur; Hefe-Knospung und bakterielle Zweiteilung sind verschieden.
  - Essential understanding (EN): Reproduction expands a culture under suitable conditions; yeast budding and bacterial binary fission differ.
  - Observable performance (DE): Erklärt die gegebene Vermehrungsweise und ihren Nutzen für eine Kultur, ohne unbegrenztes Wachstum zu behaupten.
  - Observable performance (EN): Explains the given reproductive mode and its value for a culture without claiming unlimited growth.
- `metabolism-product`
  - Essential understanding (DE): Bestimmte Stoffwechselwege setzen Substrate in nutzbare Produkte um; der Weg und seine Bedingungen bestimmen die Nutzung.
  - Essential understanding (EN): Specific metabolic pathways turn substrates into useful products; pathway and conditions determine use.
  - Observable performance (DE): Verknüpft im gegebenen Lebensmittel- oder Produktionsfall Zucker, Gärungsprodukt und Nutzung und beurteilt einen geänderten Stoffwechsel.
  - Observable performance (EN): Connects sugar, fermentation product and use in the supplied food or production case and assesses a changed metabolism.

**Coverage expectations**

- required expectations: `cell-design-use`, `reproduction-production`, `metabolism-product`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `distinct-content-contexts`: Hefeknospung mit alkoholischer Gärung und CO₂-Teiglockerung gegenüber bakterieller Zweiteilung mit Milchsäure-Säuerung; jeweils alle3Biologieaspekte. / Yeast budding/alcoholic fermentation/CO₂ dough aeration versus bacterial binary fission/lactic-acid acidification; all3biological aspects in each.
- `fresh-content-premise`: Fehlendes CO₂-Produkt gegenüber fehlendem nutzbaren Zucker bei gleichem lebenden Produzenten. / Absent CO₂ product versus absent usable sugar with the same viable producer.

**Application cases**

- `yeast-dough-three-dimensions`
  - Task demand (DE): Hefe ist ein einzelliger Pilz mit Zellkern und Zellwand. In der gegebenen Kultur vermehrt sie sich durch Knospung. Bei der alkoholischen Gärung setzt sie Zucker zu Ethanol und CO₂ um; das CO₂ lockert Brotteig. Die Materialkarte beschreibt diesen Weg ohne Sauerstoffbedarf. Nahrung, Temperatur und Platz können die Vermehrung begrenzen.

Erkläre die biotechnologische Nutzbarkeit der Hefe anhand aller drei Aspekte Zellbau, Fortpflanzung und Stoffwechsel. Begründe, warum nicht schon jede beliebige Einzelle Brotteig lockert.

Frische Variation: Eine andere einzellige Kultur wächst durch Zweiteilung und bildet aus Zucker im Material nur Milchsäure, kein CO₂. Ist sie für dieselbe Teiglockerung gleich geeignet?
  - Task demand (EN): Yeast is a unicellular fungus with a nucleus and cell wall. The supplied culture reproduces by budding. Alcoholic fermentation converts sugar into ethanol and CO₂; CO₂ aerates bread dough. The card describes this pathway without an oxygen requirement. Nutrients, temperature and space may limit growth.

Explain yeast usefulness through all three aspects: cellular design, reproduction and metabolism. Explain why just any unicellular organism does not necessarily aerate bread dough.

Fresh variation: Another unicellular culture divides by binary fission and converts sugar only to lactic acid in the material, not CO₂. Is it equally suitable for this dough aeration?
  - Expected performance (DE): Der eukaryotische Zellbau und die einzellige Lebensweise erlauben eine Kultur von Hefezellen; sie sind keine kernlosen Bakterien. Knospung vermehrt passende Produzenten, sofern Bedingungen genügen. Entscheidend für den Teig ist ihr konkret gegebener Gärungsweg: Zucker wird umgesetzt und CO₂ entsteht als lockertes Gas; Ethanol ist ein weiteres Produkt. Einzelligkeit allein besagt nichts über diesen Stoffwechsel. Grenzen von Nahrung oder Temperatur können Wachstum und Produktion begrenzen.

Transfer: Die andere Vermehrungsweise ist kein Ausschluss für Biotechnologie. Für genau diese Nutzung fehlt jedoch das CO₂-Produkt; Zellzahl oder Einzelligkeit ersetzen es nicht. Für eine Säuerung könnte die Kultur geeignet sein.
  - Expected performance (EN): The eukaryotic, unicellular design supports a yeast culture; yeast is not a nucleus-free bacterium. Budding multiplies suitable producers if conditions permit. Its specified fermentation is decisive for dough: sugar conversion produces CO₂ that aerates it; ethanol is another product. Being unicellular alone says nothing about this pathway. Nutrient or temperature limits may constrain growth and production.

Transfer: Its reproductive mode does not exclude biotechnology. This particular use lacks the required CO₂ product; cell number or unicellularity does not replace it. The culture may instead suit acidification.
  - Understanding focus (DE): Mikroorganismen besitzen unterschiedliche Zellbaupläne, die bei einer konkreten Nutzung berücksichtigt werden. Vermehrung vergrößert unter passenden Bedingungen eine Kultur; Hefe-Knospung und bakterielle Zweiteilung sind verschieden. Bestimmte Stoffwechselwege setzen Substrate in nutzbare Produkte um; der Weg und seine Bedingungen bestimmen die Nutzung.
  - Understanding focus (EN): Microorganisms have different cellular designs relevant to a particular use. Reproduction expands a culture under suitable conditions; yeast budding and bacterial binary fission differ. Specific metabolic pathways turn substrates into useful products; pathway and conditions determine use.
- `lactic-bacteria-three-dimensions`
  - Task demand (DE): Gegeben sind Milchsäurebakterien mit Zellmembran/Zellwand, aber ohne Zellkern. Sie vermehren sich unter passenden Kulturbedingungen durch Zweiteilung. Der vereinfachte Stoffwechselweg setzt Zucker zu Milchsäure um; dadurch sinkt der pH und ein Lebensmittel wird gesäuert. Es wird kein CO₂-produzierender Gärungsweg behauptet.

Erkläre die Nutzung mit allen drei geforderten biologischen Besonderheiten und vergleiche die Rolle der Milchsäure mit dem CO₂ im Hefefall. Beurteile: Ein Zellkern ist für jede biotechnologische Produktion notwendig.

Frische Variation: Die Ausgangskultur bleibt lebensfähig, aber ohne nutzbaren Zucker entsteht laut Zusatzkarte keine Milchsäure. Was muss für die gewünschte Nutzung geändert werden?
  - Task demand (EN): Supplied lactic-acid bacteria have a membrane/cell wall but no nucleus. Under suitable culture conditions they reproduce by binary fission. The simplified pathway converts sugar to lactic acid, lowering pH and acidifying food. No CO₂-producing pathway is claimed.

Explain use through all three biological features and compare lactic acid with CO₂ in the yeast case. Assess: every biotechnological producer must have a nucleus.

Fresh variation: The starting culture remains viable but without usable sugar produces no lactic acid according to an added card. What must change for the desired use?
  - Expected performance (DE): Der prokaryotische Zellbau unterscheidet sich vom Hefebau, erlaubt aber eigene Stoffwechsel- und Vermehrungsfunktionen. Zweiteilung kann Produzenten vermehren; benötigte Bedingungen bleiben erforderlich. Milchsäure bewirkt hier Säuerung, während CO₂ im Hefefall lockert. Die Eignung ergibt sich aus dem jeweiligen Produkt und Zellverhalten, nicht aus einem für alle Mikroorganismen vorgeschriebenen Zellkern.

Transfer: Ein passendes Stoffwechselsubstrat muss bereitgestellt werden; lebende Zellen oder mögliche Zweiteilung beweisen noch keine Produktbildung. Der Zellbau bleibt derselbe, während die Produktionsbedingungen unpassend sind.
  - Expected performance (EN): Prokaryotic design differs from yeast but supports metabolism and reproduction. Binary fission can multiply producers; suitable conditions are still required. Lactic acid acidifies here whereas yeast CO₂ aerates. Suitability follows from product and cellular function, not a supposedly universal nuclear requirement.

Transfer: A suitable metabolic substrate is needed; living cells or possible division alone do not demonstrate product formation. Cellular design is unchanged while production conditions are unsuitable.
  - Understanding focus (DE): Mikroorganismen besitzen unterschiedliche Zellbaupläne, die bei einer konkreten Nutzung berücksichtigt werden. Vermehrung vergrößert unter passenden Bedingungen eine Kultur; Hefe-Knospung und bakterielle Zweiteilung sind verschieden. Bestimmte Stoffwechselwege setzen Substrate in nutzbare Produkte um; der Weg und seine Bedingungen bestimmen die Nutzung.
  - Understanding focus (EN): Microorganisms have different cellular designs relevant to a particular use. Reproduction expands a culture under suitable conditions; yeast budding and bacterial binary fission differ. Specific metabolic pathways turn substrates into useful products; pathway and conditions determine use.
## Page 11: Biologische und kulturelle Evolution des Menschen rekonstruieren

- Full learning-goal ID: `430b2b73-641a-5122-bb6d-162b0d1eaf2d`
- Goal fingerprint: `sha256:74a602fbbd7cc955d9ea04970b89ddbe1d7ba848ef1c7dc863a92e60be56a385`
- Page fingerprint: `sha256:e859e101052c858421795bc3b18ecf20b19ca49e22f87b1c428f55d172b692b2`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Vergangenheit und Zukunft des Menschen (Sek I)

### Canonical description

Die lernende Person kann aus Merkmalen fossiler Funde Hypothesen zur biologischen Evolution des modernen Menschen ableiten, eine zeitliche Reihenfolge rekonstruieren und die Bedeutung kultureller Evolution für den heutigen Menschen analysieren.

### Visualization

/assets/goal-visualizations/biologie/430b2b73-641a-5122-bb6d-162b0d1eaf2d/430b2b73-641a-5122-bb6d-162b0d1eaf2d.png

- original digest: `sha256:b20b0029048d60835c529f271930ead1a4bbfe80a5fbc087c31044d1ce6fe3fb`
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

Status: `needs_human_review`; profile fingerprint: `sha256:c42bc5b8cbb1ed915115f5d797e33533b916cec21081317b86521bb4dc7715db`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `essential-1`
  - Essential understanding (DE): Fossilmerkmale und Altersintervalle erlauben begrenzte Hypothesen/Chronologien zur biologischen Evolution; Alter allein beweist keine direkte Ahnenreihe.
  - Essential understanding (EN): Fossil traits/age intervals support bounded hypotheses and chronologies; age alone proves no direct ancestor series.
  - Observable performance (DE): Rekonstruiert Fundfolge, leitet Merkmals-/Habitathypothesen ab und prüft Überlappung, Suchbias und konkurrierende Verzweigungen.
  - Observable performance (EN): Reconstructs sequence, infers trait/habitat hypotheses and assesses overlap, search bias and alternative branching.
- `essential-2`
  - Essential understanding (DE): Kulturelle Wissensweitergabe beeinflusst heutige Menschen und Biosphäre, ohne erlernte Verfahren automatisch als neue erbliche Allele zu behandeln.
  - Essential understanding (EN): Cultural knowledge transmission affects humans/biosphere today without turning learned practices automatically into inherited alleles.
  - Observable performance (DE): Analysiert konkret technische/Nahrungs-/Siedlungs- und Landwirtschaftsfolgen mit Nutzen/Grenzen und hält unsichere Werkzeughersteller/Sprache offen.
  - Observable performance (EN): Analyses technical/food/settlement/farming consequences with benefits/limits and leaves tool makers/language uncertain.

**Coverage expectations**

- required expectations: `essential-1`, `essential-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `two-distinct-material-contexts`: Unterschiedliche Sach-/Belegkontexte mit eigener Begründung: human-reconstruction-fossil-mosaic und human-reconstruction-environment-hypotheses. / Distinct subject/evidence contexts with independent reasoning: human-reconstruction-fossil-mosaic and human-reconstruction-environment-hypotheses.
- `changed-premise-or-counterevidence`: Neue Merkmalslücke,Kontextänderung oder Gegenevidenz verändert die zulässige Folgerung;es genügt keine Wiederholung einer Musterantwort. / A missing trait,context change or counterevidence changes the justified inference;repeating a worked answer is insufficient.

**Application cases**

- `human-reconstruction-fossil-mosaic`
  - Task demand (DE): Hypothetische Fossilkarten, keine echten Fundarten: F 1 Alter 3,0–2,6 Mio.Jahre, Becken/Bein mit Zweibeinindikatoren, kleiner Hirnschädel; F 2 Alter 1,8–1,5 Mio., ebenfalls Zweibeinindikatoren, größerer Hirnschädel; F 3 Alter 0,30–0,20 Mio., noch größerer Hirnschädel. Merkmale und Datierungen sind vereinfacht. Werkzeuge liegen bei F 2 in derselben Schicht, Hersteller nicht sicher. Moderne Zusatzkarte: schriftlich/sozial übertragene Verfahren verändern Ernährung und Siedlung, mit Ressourcenverbrauch.

Auftrag: Rekonstruiere zeitliche Folge und eine begründete Hypothese zur biologischen Evolution, prüfe einen direkten F 1→F 2→F 3-Stammbaum und analysiere kulturelle Bedeutung für Menschen und Umwelt heute.

Frische Variation: Neuer F 4-Fund 1,7–1,4 Mio.Jahre hat kleinen Hirnschädel und Zweibeinindikatoren. Wie revidierst du die lineare Hypothese?
  - Task demand (EN): Hypothetical fossil cards, not real taxa: F 1 age 3.0–2.6 million years, pelvis/leg with bipedal indicators, small braincase; F 2 age 1.8–1.5 million, same indicators, larger braincase; F 3 age 0.30–0.20 million, larger still. Traits/dates simplified. Tools occur in the F 2 layer but maker is uncertain. Modern card: socially/written transmitted practices alter diet/settlement with resource use.

Task: Reconstruct chronology and a justified biological-evolution hypothesis, test direct F 1→F 2→F 3 ancestry and analyse cultural significance for humans/environment today.

Fresh variation: New F 4 at 1.7–1.4 million years has a small braincase and bipedal indicators. Revise the linear hypothesis.
  - Expected performance (DE): Die Intervalle ordnen F 1 vor F 2 vor F 3. Im Modell könnten Zweibeinigkeit und Hirnschädelvergrößerung zeitlich versetzt verändert worden sein; Merkmale bilden ein Mosaik. Alter und Ähnlichkeit beweisen keine direkte Ahnenreihe, verzweigte Linien bleiben möglich. Werkzeuge belegen eine technische Aktivität, nicht sicher Hersteller oder Sprache. Kulturelle Wissensweitergabe ermöglicht Ernährung/Siedlung jenseits einzelner genetischer Änderungen, verändert aber auch Ressourcen und Biosphäre; Nutzen und Folgen unterscheiden.

Transfer: F 4 überlappt F 2 und zeigt keine zwingende einheitliche Größenzunahme in allen Linien. Koexistenz/Verzweigung ist möglich; keine Art als minderwertige Stufe abwerten. Zusätzliche Merkmale und Fundkontexte prüfen.
  - Expected performance (EN): Intervals order F 1 before F 2 before F 3. In the model bipedality and braincase enlargement may change at different times, forming a mosaic. Age/similarity do not prove direct ancestry; branching remains possible. Tools establish technical activity, not certain maker or language. Cultural knowledge transmission enables diet/settlement beyond individual genetic changes but affects resources/biosphere; distinguish benefits and consequences.

Transfer: F 4 overlaps F 2 and precludes obligatory uniform enlargement across all lineages. Coexistence/branching is possible; no taxon is an inferior step. Assess more traits and contexts.
  - Understanding focus (DE): Fossilmerkmale und Altersintervalle erlauben begrenzte Hypothesen/Chronologien zur biologischen Evolution; Alter allein beweist keine direkte Ahnenreihe. Kulturelle Wissensweitergabe beeinflusst heutige Menschen und Biosphäre, ohne erlernte Verfahren automatisch als neue erbliche Allele zu behandeln.
  - Understanding focus (EN): Fossil traits/age intervals support bounded hypotheses and chronologies; age alone proves no direct ancestor series. Cultural knowledge transmission affects humans/biosphere today without turning learned practices automatically into inherited alleles.
- `human-reconstruction-environment-hypotheses`
  - Task demand (DE): Konstruierte Fundserie: vor 2,0 Mio.Jahren Funde mit Zweibeinindikatoren sowohl aus offenem als auch aus waldreichem Habitat; vor 1,5 Mio.Jahren mehr offene Fundstellen, aber deren Erhaltung/Suche ist intensiver. Hypothese H 1: ausschließlich Savannenleben erzeugte Zweibeinigkeit. H 2: verschiedene Lebensräume und Funktionen könnten beteiligt sein. Moderne Karte: Landwirtschaft/gespeichertes Wissen erhöhen lokale Nahrungsmenge, verringern aber im Modell Wildartenlebensraum. Keine echte Datensammlung.

Auftrag: Ordne Zeiten und Merkmale, beurteile beide Evolutionshypothesen und analysiere eine heutige kulturell vermittelte Umweltwirkung ohne erworbene Merkmale genetisch zu vererben.

Frische Variation: Ein fehlender Wald-Fossilfund wird als Beweis „im Wald gab es keine Zweibeinigkeit“ verwendet. Formuliere die angemessene Grenze.
  - Task demand (EN): Constructed fossil series:2.0 million years ago, bipedal indicators occur in both open and forest-rich habitats;1.5 million years ago more open sites, but preservation/search is stronger there. H 1: only savannah life produced bipedality. H 2: multiple habitats/functions may be involved. Modern card: farming/stored knowledge increase local food but reduce wild-species habitat in the model. No actual data collection.

Task: Order dates/traits, evaluate both evolutionary hypotheses and analyse a modern culturally transmitted environmental effect without treating acquired traits as genetic inheritance.

Fresh variation: Absence of a forest fossil is taken to prove “there was no bipedality in forests”. State the proper limit.
  - Expected performance (DE): Die frühe Reihe enthält beide Habitattypen, H 1 ist als ausschließliche Erklärung nicht gestützt. Mehr spätere offene Fundstellen können Such-/Erhaltungsbias sein; H 2 bleibt eine prüfbare Alternative, keine bewiesene Gesamtursache. Zweibeinindikatoren begründen Funktionshypothesen, keine direkte Ahnenschaft. Landwirtschaft ist kulturell weitergegebenes Verhalten mit Nutzen und Biosphärenfolgen; erlernte Methode ist kein dadurch neu erworbenes vererbbares Allel.

Transfer: Fehlende Funde können fehlende Erhaltung oder Suche bedeuten. Abwesenheit eines Belegs ist hier kein sicherer Abwesenheitsbeweis; Datierung, Sedimentkontext und Suchintensität müssen berücksichtigt werden.
  - Expected performance (EN): The early series includes both habitats, so H 1 as an exclusive account is unsupported. More later open sites may reflect search/preservation bias; H 2 remains testable, not a proven complete cause. Bipedal indicators support functional hypotheses, not direct ancestry. Farming is culturally transmitted behaviour with benefits and biosphere impacts; a learned method is not a newly acquired inherited allele.

Transfer: Missing finds may reflect preservation/search. Lack of evidence is not a certain absence claim here; assess dates, sediment context and search intensity.
  - Understanding focus (DE): Fossilmerkmale und Altersintervalle erlauben begrenzte Hypothesen/Chronologien zur biologischen Evolution; Alter allein beweist keine direkte Ahnenreihe. Kulturelle Wissensweitergabe beeinflusst heutige Menschen und Biosphäre, ohne erlernte Verfahren automatisch als neue erbliche Allele zu behandeln.
  - Understanding focus (EN): Fossil traits/age intervals support bounded hypotheses and chronologies; age alone proves no direct ancestor series. Cultural knowledge transmission affects humans/biosphere today without turning learned practices automatically into inherited alleles.
