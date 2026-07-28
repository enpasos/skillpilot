# Curriculum Graph - Physikum Medizin (Uni Heidelberg)

This document maps the Heidelberg preclinical curriculum (Physikum, 1st-4th semester)
into a SkillPilot competence graph.

## Scope
- Program: Humanmedizin, vorklinischer Abschnitt (1.-4. Fachsemester)
- Institution: Medizinische Fakultaet Heidelberg
- Output: `SkillLandscape` JSON under `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/json/`

## Step 0: Extract the source (done)

### PDFs
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/HeiCuMed_Vorklinische_Kurse.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/Studienordnung_Medizin_Heidelberg_1._und_2._Studienjahr_Staatsexamen__2020-09-29_.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_physik_Mai2014_2.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_physiol_Januar2014.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_anat_Januar2014.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_biol_Januar2014.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_ch_bch_Januar2014.pdf`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/gk08n_2.pdf`

### Raw text extracts (phase 0)
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/HeiCuMed_Vorklinische_Kurse.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/Studienordnung_Medizin_Heidelberg_1._und_2._Studienjahr_Staatsexamen__2020-09-29_.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_physik_Mai2014_2.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_physiol_Januar2014.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_anat_Januar2014.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_biol_Januar2014.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/GK_ch_bch_Januar2014.raw.txt`
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/input/impp/gk08n_2.raw.txt`

The raw extracts are retained for auditability; structured extraction uses PDF layout data.

### 0.1 Data Extraction Scripts
- `tmp/parse_impp_layout.py`: PDF layout extraction to structured JSON (`impp_*.json`) for all IMPP catalogs above.

## Step 1: Structured outline (in progress)

### 1.1 Root and phase clusters

Root
- `PHYSIKUM_MED_HEIDELBERG`

Phase clusters (Level 1)
- `FS1` (1. Fachsemester)
- `FS2` (2. Fachsemester)
- `FS3` (3. Fachsemester)
- `FS4` (4. Fachsemester)
- `SEMUe` (semesteruebergreifend)

### 1.2 Course clusters and atomic goals

FS1

1) Praktikum der Chemie fuer Mediziner
- Atomic goals (understanding)
  - Explain fundamentals of general, inorganic, and organic chemistry relevant to medicine.
  - Relate chemical principles to later courses (biochemistry, physiology, pharmacology).
- Atomic goals (skills)
  - Apply core lab procedures from the chemistry practical in a structured workflow.
- Exam node
  - Chemie Leistungsnachweis (written exam).

2) Medizinische Terminologie
- Atomic goals (understanding)
  - Explain the genesis and structure of medical terminology.
  - Interpret terms using Latin/Greek word components.
  - Apply basic Medical English terminology.
- Atomic goals (skills)
  - Use vocabulary and declension knowledge to parse and translate clinical terms.
- Exam node
  - Terminologie Leistungsnachweis (written MC exam).

3) Makroskopische Anatomie
- Atomic goals (understanding)
  - Describe macroscopic anatomy of the human body.
  - Relate structure and function with clinical relevance.
  - Interpret basic radiological imaging (CT data sets) to localize structures.
- Atomic goals (skills)
  - Identify structures on skeletons, preparations, cadavers, and CT images.
- Exam nodes
  - Makroskopische Anatomie: written MC exams (2).
  - Makroskopische Anatomie: oral exams (3).

FS2

4) Praktikum der Physik fuer Mediziner
- Atomic goals (understanding)
  - Explain core physics laws (IMPP catalog) and relevant mathematical methods.
- Atomic goals (skills)
  - Conduct basic physics experiments and document protocols.
  - Analyze experimental data and discuss results using scientific argumentation.
- Exam node
  - Physik Leistungsnachweis (3-hour written exam).
- IMPP detail (GK-1 Physik, Mai 2014)
  - 1 Grundbegriffe des Messens und der quantitativen Beschreibung (1.1-1.4)
  - 2 Mechanik (2.1-2.8)
  - 3 Struktur der Materie (3.1-3.2)
  - 4 Waermelehre (4.1-4.6)
  - 5 Elektrizitaetslehre (5.1-5.10)
  - 6 Schwingungen und Wellen (6.1-6.4)
  - 7 Optik (7.1-7.4)
  - 8 Ionisierende Strahlung (8.1-8.4)

5) Integrierter Kurs 2. Fachsemester (Zellen, Gewebe und Funktionen)

5a) Zellbiologie und Gewebelehre
- Atomic goals (understanding)
  - Explain cell compartmentalization, nucleus/chromosomes, mitosis and meiosis.
  - Describe organelles, cytoskeleton, and cell contacts.
  - Describe structure and function of the four basic tissues.
- Atomic goals (skills)
  - Identify cellular structures in microscopy/EM images.
  - Explain selected disease mechanisms using cell biology concepts.

5b) Biochemie/Molekularbiologie
- Atomic goals (understanding)
  - Describe biomolecule building blocks and core biochemical principles.
  - Explain bioenergetics and catalysis.
  - Explain carbohydrate metabolism, citric acid cycle, and respiratory chain.
  - Explain nucleotide structure and metabolism.
  - Explain genetic information transfer.
  - Explain tumor biochemistry and biochemistry of viruses.
- Atomic goals (skills)
  - Use pipette, centrifuge, and photometer safely and correctly.
  - Perform enzymatic optical tests and electrophoresis.
  - Perform qualitative and quantitative biomolecule analyses (absorption photometry).

5c) Zellphysiologie
- Atomic goals (understanding)
  - Explain membrane potential, receptors, and ion channels.
  - Explain cellular homeostasis and action potentials.
  - Explain muscle physiology (sliding filament theory, muscle mechanics).
- Atomic goals (skills)
  - Apply basic physiology practical methods to validate core concepts.
- IMPP detail (GK-1 Physiologie, Januar 2014)
  - 1 Allgemeine und Zellphysiologie (1.1-1.6)
  - 13 Muskulatur (13.1-13.3)

5d) Humangenetik
- Atomic goals (understanding)
  - Explain genome structure, inheritance laws, and regulation of genetic information.
  - Explain DNA/RNA structure, variability, replication, telomeres, transcription/splicing, translation.
  - Explain mitochondrial genome inheritance and cell cycle regulation.
  - Explain chromosome structure, analysis, anomalies, X-inactivation, and prenatal diagnostics.
  - Apply Mendelian laws to monogenic disorders; calculate risks and penetrance.
  - Explain genotype-phenotype relationships and multifactorial inheritance.
  - Explain population genetics (Hardy-Weinberg), modifiers, and epigenetic processes.
  - Explain mutation types, trinucleotide expansion, and DNA repair mechanisms.
- Atomic goals (skills)
  - Perform PCR, gel electrophoresis, deletion analysis, and microsatellite analysis.
  - Perform sequencing and sequence analysis.
  - Perform chromosome banding and FISH.
  - Interpret diagnostic methods and findings in clinical context.

- Exam node
  - Integrierter Kurs 2: written MC exam (end of semester).

FS3

6) Integrierter Kurs 3. Fachsemester (Funktionssysteme Teil 1 - vegetative Systeme)

6a) Mikroskopische Anatomie (Organe und Organsysteme)
- Atomic goals (understanding)
  - Explain microanatomy and function of blood and lymphatic organs.
  - Explain microanatomy and function of heart, lung, and vessels.
  - Explain microanatomy and function of digestive tract and liver-related structures.
  - Explain microanatomy and function of kidney and urinary system.
  - Explain microanatomy and function of endocrine system.
  - Explain microanatomy and function of male/female reproductive organs.
  - Explain basic embryological development relevant to organ systems.
- Atomic goals (skills)
  - Identify key organ structures in histology preparations.

6b) Biochemie/Molekularbiologie (vegetative Systeme)
- Atomic goals (understanding)
  - Explain biochemical aspects of blood, immune system, liver, digestion, and endocrine system.
  - Explain metabolism of lipoproteins, lipids, and amino acids.
  - Explain biotransformation reactions.
  - Explain synthesis and action of hormones.
- Atomic goals (skills)
  - Perform analyses of blood components (iron, hemoglobin, transferrin).
  - Perform lipid analysis and urea quantification.
  - Explain and perform gel filtration and TLC methods.
  - Calculate transferrin saturation, enzyme activities, and substrate concentrations.

6c) Physiologie (vegetative Systeme)
- Atomic goals (understanding)
  - Explain mechanisms of cardiovascular system, blood, and respiration.
  - Explain mechanisms of water balance, kidney function, and digestion.
  - Explain mechanisms of energy and heat balance.
- Atomic goals (skills)
  - Perform and interpret basic diagnostics: ECG, blood pressure, blood gas analysis.
  - Perform and interpret lung function tests and spiroergometry.
  - Perform and interpret renal clearance measurements.
  - Integrate physiology with biochemistry and anatomy for vegetative systems.
- IMPP detail (GK-1 Physiologie, Januar 2014)
  - 2 Blut und Immunsystem (2.1-2.5)
  - 3 Herz (3.1-3.4)
  - 4 Blutkreislauf (4.1-4.5)
  - 5 Atmung (5.1-5.10)
  - 6 Arbeits- und Leistungsphysiologie (6.1-6.3)
  - 7 Ernährung, Verdauungstrakt, Leber (7.1-7.6)
  - 8 Energie- und Wärmehaushalt (8.1-8.2)
  - 9 Wasser- und Elektrolythaushalt, Nierenfunktion (9.1-9.2)
  - 10 Hormonelle Regulation (10.1-10.3)
  - 11 Sexualentwicklung und Reproduktionsphysiologie (11.1-11.11)

- Exam node
  - Integrierter Kurs 3: written MC exam plus practical protocol review.

FS4

7) Integrierter Kurs 4. Fachsemester (Funktionssysteme Teil 2 - Sinnesorgane und ZNS)

7a) Anatomie (Sinnesorgane und ZNS)
- Atomic goals (understanding)
  - Explain neurons, glia, and key principles of sensory and motor systems.
  - Explain auditory, visual, proprioceptive, and somatosensory systems.
  - Explain pain mechanisms, spinal cord, brainstem, vestibular system, thalamus, cortex.
  - Explain limbic system, hypothalamus, autonomic nervous system.
  - Explain hemispheric dominance, language, and neuroanatomical disease patterns.
- Atomic goals (skills)
  - Identify histology of eye structures and accessory organs.
  - Identify histology of inner ear structures (cochlea, Corti organ, vestibular organ).
  - Identify histology of spinal cord, cerebellum, hippocampus, neocortex.

7b) Biochemie/Molekularbiologie (Sinnesorgane und ZNS)
- Atomic goals (understanding)
  - Explain biochemical mechanisms of neurotransmission and exocytosis.
  - Explain biochemical mechanisms of sensory perception.
  - Explain protein folding and degradation in neurodegenerative disease contexts.
- Atomic goals (skills)
  - Perform quantitative and qualitative protein analysis.
  - Perform SDS-PAGE and immunoblotting to detect specific proteins.

7c) Physiologie (Sinnesorgane und ZNS)
- Atomic goals (understanding)
  - Explain key functional mechanisms of sensory organs and CNS.
  - Integrate physiology with anatomy and biochemistry for nervous system topics.
- Atomic goals (skills)
  - Perform and interpret visual acuity, perimetry, color vision tests.
  - Perform and interpret audiometry and nystagmus assessment.
  - Perform and interpret reflex tests, EMG, evoked potentials, EEG.
  - Perform muscle mechanics experiments and diagnostics.
- IMPP detail (GK-1 Physiologie, Januar 2014)
  - 12 Funktionsprinzipien des Nervensystems (12.1-12.6)
  - 14 Vegetatives Nervensystem (VNS) (14.1-14.3)
  - 15 Motorik (15.1-15.9)
  - 16 Somatoviszerale Sensorik (16.1-16.6)
  - 17 Visuelles System (17.1-17.4)
  - 18 Auditorisches System (18.1-18.5)
  - 19 Chemische Sinne (19.1-19.3)
  - 20 Integrative Leistungen des Zentralnervensystems (20.1-20.2)

- Exam node
  - Integrierter Kurs 4: written MC exam plus practical protocol review.

SEMUe (semesteruebergreifend)

8) Integriertes Seminar (interdisziplinaer, AeAppO)
- Atomic goals (understanding)
  - Integrate anatomy, biochemistry, and physiology in clinical cases.
  - Explain pathophysiological mechanisms for selected topics:
    - Muskelerkrankungen, Immunregulationsstoerungen, Saeure-Basen-Stoerungen,
      Stoerungen des Eisenstoffwechsels, Adipositas, Cancerogenese,
      Mukoviszidose, zentralmotorische Stoerungen, chronischer Schmerz.
- Atomic goals (skills)
  - Present clinical cases in short talks and discuss mechanisms in groups.

9) Berufsfelderkundung (HeiPrax A, Semester 1-2)
- Atomic goals (understanding)
  - Understand primary care workflows and key problems in ambulatory care.
  - Recognize how preclinical content applies to real patient cases.
  - Understand cooperation with other health professions.
  - Understand principles of evidence-based and individualized medicine in GP practice.
- Atomic goals (skills)
  - Conduct basic patient interaction and reflection on physician behavior.
  - Perform basic communication, anamnesis, and physical exam techniques.
  - Apply hand hygiene and basic blood draw techniques.
  - Apply problem-oriented learning (POL) in small-group settings.
  - Identify anatomical structures on the living body (AaLPLUS).
- Exam node
  - No exam (attendance-based).

10) Einfuehrung in die klinische Medizin (HeiPrax A, Semester 3-4)
- Atomic goals (understanding)
  - Deepen primary care workflows and apply clinical reasoning in early cases.
  - Relate preclinical knowledge to patient problems and clinical examples.
- Atomic goals (skills)
  - Conduct patient interaction, anamnesis, and physical exam techniques.
  - Apply hand hygiene and basic blood draw techniques.
  - Apply problem-oriented learning (POL).
  - Identify anatomical structures on the living body (AaLPLUS).
- Exam node
  - Formative OSCE (semester 4).

11) Medizinische Psychologie / Medizinische Soziologie
- Atomic goals (understanding)
  - Explain disease development and medical action from a psychosocial perspective.
  - Explain health promotion and maintenance concepts.
  - Explain psychological aspects of diagnosis and therapy.
  - Explain counseling and psychotherapy basics.
  - Explain professional cooperation and team dynamics.
- Atomic goals (skills)
  - Apply structured communication and interview techniques.
  - Practice self- and other-perception in clinical interactions.
- Exam node
  - Schriftliche Semesterleistung (exam).

12) Vorklinisches Wahlfach
- Atomic goals (understanding)
  - Gain depth in a self-selected topic beyond required curriculum content.
- Atomic goals (skills)
  - Complete the selected elective and meet its specific requirements.
- Exam node
  - Wahlfach Leistungsnachweis (if defined by the chosen elective).

## Step 2: Encode as JSON (done)

JSON output:
- `curricula/DE/BW/Uni_Heidelberg/Physikum_Medizin/json/DE_BAW_U_HEIDELBERG_PHYSIKUM_MED.de.json`

Notes:
- Stable IDs are generated via UUIDv5 using the landscapeId as namespace and `shortKey` as name.
- `shortKey` is included for every node to keep IDs reproducible.
- `phase` uses `S1`-`S4` and `S0` (semesteruebergreifend) to match validation rules.

## Step 3: Add `requires` relations (pending)

From the Studienordnung (section 2) and course descriptions:

- Zellen/Gewebe + Humangenetik requires:
  - Makroskopische Anatomie
  - Praktikum der Chemie fuer Mediziner

- Funktionssysteme Teil 1 & 2 requires:
  - Makroskopische Anatomie
  - Praktikum der Chemie fuer Mediziner
  - Praktikum der Physik fuer Mediziner
  - Zellbiologie, Zellphysiologie, Biochemie/Molekularbiologie, Humangenetik

- Seminar Medizinische Psychologie/Soziologie requires:
  - bestandenes Exam der Vorlesung Psychosoziale Grundlagen

- Integrated Seminar requires:
  - Makroskopische Anatomie, Chemie, Physik, Zellbiologie, Zellphysiologie,
    Biochemie/Molekularbiologie, Humangenetik

Use cluster-level `requires` where possible to keep the graph minimal.

## Step 4: Validate (pending)

1) Run `npm run validate:graph` from `app/`.
2) Confirm no cycles in `contains` or `requires`.
3) Ensure prerequisites match section 2 of the Studienordnung.

## Step 5: Register the curriculum (pending)

If this is a root curriculum:
- Add it to `curricula/curriculum_manifest.json`.

If this is a sub-curriculum:
- Ensure the parent landscape contains the root node ID.
