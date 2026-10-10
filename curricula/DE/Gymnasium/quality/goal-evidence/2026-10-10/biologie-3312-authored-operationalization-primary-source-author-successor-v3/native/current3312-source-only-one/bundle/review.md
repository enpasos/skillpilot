# AI review input: Biologie –3312 aktueller Quellen-Nachfolger

- Book ID: `biologie-3312-authored-source-current-native-one-20261010-v3`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:3ebc1abe79bf927e6dcf5fa2528f2bcd8e6d20560521a73e5b3c14492e1b642f`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Komplexe Rückkopplungen oder Signalwege beschreiben

- Full learning-goal ID: `3312b2bb-bc90-5c0f-a859-4b4f9b8ff117`
- Goal fingerprint: `sha256:847802f46d349cd279fd77082132002edadd3d513f8c06ade08acd2e10fcaea2`
- Page fingerprint: `sha256:830292aaf5646eade0bbc909aa76fab93d8ac2fd9bc122867e22e3b07e538211`
- Topic path: Biologie – kanonische maschinelle Prüfsicht > Biologie > Genetik und Gentechnik > Q1.5 Modelle zur Steuerung der Genaktivität

### Canonical description

Die lernende Person kann komplexe Rückkopplungen oder Signalwege beschreiben.

### Visualization

/assets/goal-visualizations/biologie/3312b2bb-bc90-5c0f-a859-4b4f9b8ff117/3312b2bb-bc90-5c0f-a859-4b4f9b8ff117.png

- original digest: `sha256:c90516fa6c9531aaf2940e5759cebaa6f7a8ee3d98782ba72b29ee2b46f69147`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Biologie? - Relevanz und Orientierung — `2d451684-6e53-565e-a987-f362da919d2c` (outside this book)
- Regulationsmodelle vergleichen — `52ecc72a-a65b-53a0-851e-86defe769fa7` (outside this book)

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
