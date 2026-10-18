# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-current450-bound-context-d-005`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:269aee944149745f1c008f0ad56d909294798132e77c7b320067c804c9cc9859`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Fetthärtung als katalytische Addition erklären

- Full learning-goal ID: `17772924-46b6-5747-a77b-a8c6944d109d`
- Goal fingerprint: `sha256:b65b7d1fe7e14cb19cde0d81bd78292060bbce2cac94c1be8251dd573bcfd2f5`
- Page fingerprint: `sha256:977413c4da0d083bfec083194fef8da528dc9cd124cb0b23f7bf93972407c0d3`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die katalytische Hydrierung ungesättigter Fettsäurereste in einem gegebenen Fettmodell als Addition von Wasserstoff bilanzieren und aus dem veränderten Sättigungsgrad begrenzte Aussagen zu Packung und Konsistenz ableiten, wobei sie erhaltene Esterbindungen, vollständige und teilweise Hydrierung sowie die Grenzen von Gesundheits- und Eigenschaftsaussagen unterscheidet.

### Visualization

/assets/goal-visualizations/chemie/17772924-46b6-5747-a77b-a8c6944d109d/17772924-46b6-5747-a77b-a8c6944d109d.png

- original digest: `sha256:2d8d6d0eed41d2df5123e0718014f5224619893966db7432cbf1278faf4cc545`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Fette über Struktur und Eigenschaften erklären — `2f3cdec5-f845-5b0f-841e-8b1d47de0281` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)

### Direct reverse prerequisites outside this book

- Fettkennzahlen und Hydrierung am Strukturmodell erklären — `95cff878-b85e-53d8-84bc-132c8bf4cf71` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fb610f0510995b58ff890c4acaa47b0daacf01ad4b88312316ebd36a389058b6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `hb-bio-fat-hydrogenation-addition-and-packing`
  - Essential understanding (DE): Drei C=C benötigen 3molH2 pro mol Triacylglycerid; jedes Doppelbindungs-C erhält ein H, keine Abspaltung kleiner Moleküle: Addition. Estergerüst bleibt. Katalytische Oberflächenreaktion nicht als H+-Carbokation/Br--Mechanismus darstellen. Q verbraucht 3molH2 und behält drei C=C; IZ sinkt, aber exakter neuer IZ-Wert verlangt auch die geänderte Masse. Teilhydrierung ist nicht gleich vollständige Sättigung; mögliche trans-Bildung nicht als zwingender alleiniger Reaktionsweg oder pauschales Gesundheitsurteil ausgeben.
  - Essential understanding (EN): Three C=C consume 3 molH2 per mol triacylglyceride; each double-bond carbon gains H, with no small molecule eliminated: addition. Ester framework remains. Do not replace surface catalysis with a H+/carbocation/Br- mechanism. Q consumes 3molH2 and retains three C=C; IV falls but its exact new value also needs the changed mass. Partial hydrogenation is not full saturation; possible trans formation is neither the sole mandatory pathway nor enough for a blanket health judgement.
  - Observable performance (DE): Zeichne die Bilanz für die vollständige Fetthärtung mit Stoffmengenverhältnis und markiere addierte H-Atome. Begründe den Bezug zwischen Struktur, Packung und Konsistenz. Trenne katalytische Hydrierung von Esterhydrolyse und vom bereits bekannten ionischen HX-Additionsmechanismus. Übertrage auf Q: Verbrauch, verbleibende C=C und Grenzen einer Konsistenz-/Gesundheitsaussage.
  - Observable performance (EN): Draw the complete hardening balance with molar ratio and added H atoms. Link structure, packing and consistency. Distinguish catalytic hydrogenation from ester hydrolysis and the previously known ionic HX-addition mechanism. Transfer to Q: consumption, remaining C=C and limits of consistency/health claims.

**Coverage expectations**

- required expectations: `hb-bio-fat-hydrogenation-addition-and-packing`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `existing-whole-material-fresh-variation`: Die bereits vorhandene frische Variation bleibt vollständig verbindlich. Ausreichend unabhängige Belege können in einem reichhaltigen Fall entstehen; dieselbe Antwort zählt nicht zweimal. Keine zusätzliche Aufgabenquote. / The pre-existing fresh variation remains fully binding. Sufficient independent evidence may arise within a rich case; the same answer does not count twice. No additional task quota.

**Application cases**

- `fat-hydrogenation-three-double-bonds-baseline`
  - Task demand (DE): Papiermodell, ausdrücklich KEIN H2-/Katalysator-Schülerversuch. Ein Triacylglycerid trägt drei C18:1-cis-Reste, je eine –CH=CH–-Gruppe. Vollständige katalytische Hydrierung addiert H2 an jede C=C und ergibt –CH2–CH2–; drei Esterbindungen bleiben unverändert. Katalysator ist im Reaktionsschema über dem Pfeil angegeben und wird nicht stöchiometrisch verbraucht. Im Modell erhöht die vollständige Sättigung gleich langer cis-Reste die regelmäßige Packbarkeit und meist den Schmelzbereich; natürliche Fettgemische verhalten sich komplexer. Bei teilweiser technischer Hydrierung können Doppelbindungen verbleiben und cis/trans-Isomerisierung auftreten.
Zeichne die Bilanz für die vollständige Fetthärtung mit Stoffmengenverhältnis und markiere addierte H-Atome. Begründe den Bezug zwischen Struktur, Packung und Konsistenz. Trenne katalytische Hydrierung von Esterhydrolyse und vom bereits bekannten ionischen HX-Additionsmechanismus.
Ganzes zugeordnetes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/3
  - Task demand (EN): Paper model only, explicitly NO student H2/catalyst experiment. A triacylglyceride has three C18:1-cis residues, one –CH=CH– each. Full catalytic hydrogenation adds H2 across every C=C, yielding –CH2–CH2–; the three ester bonds remain. Catalyst is written above the arrow and is not consumed stoichiometrically. Complete saturation of equal-length cis residues generally improves regular packing and raises melting range in this model; natural mixtures are more complex. Partial industrial hydrogenation may retain double bonds and produce cis/trans isomerisation.
Draw the complete hardening balance with molar ratio and added H atoms. Link structure, packing and consistency. Distinguish catalytic hydrogenation from ester hydrolysis and the previously known ionic HX-addition mechanism.
Complete assigned material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/3
  - Expected performance (DE): Drei C=C benötigen 3molH2 pro mol Triacylglycerid; jedes Doppelbindungs-C erhält ein H, keine Abspaltung kleiner Moleküle: Addition. Estergerüst bleibt. Katalytische Oberflächenreaktion nicht als H+-Carbokation/Br--Mechanismus darstellen. Q verbraucht 3molH2 und behält drei C=C; IZ sinkt, aber exakter neuer IZ-Wert verlangt auch die geänderte Masse. Teilhydrierung ist nicht gleich vollständige Sättigung; mögliche trans-Bildung nicht als zwingender alleiniger Reaktionsweg oder pauschales Gesundheitsurteil ausgeben.
  - Expected performance (EN): Three C=C consume 3 molH2 per mol triacylglyceride; each double-bond carbon gains H, with no small molecule eliminated: addition. Ester framework remains. Do not replace surface catalysis with a H+/carbocation/Br- mechanism. Q consumes 3molH2 and retains three C=C; IV falls but its exact new value also needs the changed mass. Partial hydrogenation is not full saturation; possible trans formation is neither the sole mandatory pathway nor enough for a blanket health judgement.
  - Understanding focus (DE): Fetthärtung als katalytische Addition; ursprüngliche vollständige Stoff-/Operatorpflichten im neuen eigenen Ziel erhalten.
  - Understanding focus (EN): Fat hardening as catalytic addition; original complete substance/operator duties retained in their own goal.
- `fat-hydrogenation-fresh-partial-q`
  - Task demand (DE): Erst anschließend neue Probe Q: Sie startet mit sechs C=C pro Triacylglycerid; ein idealer Prozess setzt drei davon um. Leite H2-Verbrauch und verbleibende C=C ab. Was lässt sich gegenüber vollständiger Hydrierung begründet über Iodzahl, Packung und Konsistenz aussagen, welche Angaben fehlen und warum folgt keine pauschale Gesundheitsaussage?
curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/3
  - Task demand (EN): Then introduce fresh Q:it starts with six C=C per triacylglyceride; an ideal process reacts three. Infer H2 consumption and remaining C=C. What can be justified about iodine value, packing and consistency compared with full hydrogenation, what information is absent, and why does no blanket health judgment follow?
curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/3
  - Expected performance (DE): Drei C=C benötigen 3molH2 pro mol Triacylglycerid; jedes Doppelbindungs-C erhält ein H, keine Abspaltung kleiner Moleküle: Addition. Estergerüst bleibt. Katalytische Oberflächenreaktion nicht als H+-Carbokation/Br--Mechanismus darstellen. Q verbraucht 3molH2 und behält drei C=C; IZ sinkt, aber exakter neuer IZ-Wert verlangt auch die geänderte Masse. Teilhydrierung ist nicht gleich vollständige Sättigung; mögliche trans-Bildung nicht als zwingender alleiniger Reaktionsweg oder pauschales Gesundheitsurteil ausgeben.
  - Expected performance (EN): Three C=C consume 3 molH2 per mol triacylglyceride; each double-bond carbon gains H, with no small molecule eliminated: addition. Ester framework remains. Do not replace surface catalysis with a H+/carbocation/Br- mechanism. Q consumes 3molH2 and retains three C=C; IV falls but its exact new value also needs the changed mass. Partial hydrogenation is not full saturation; possible trans formation is neither the sole mandatory pathway nor enough for a blanket health judgement.
  - Understanding focus (DE): Fetthärtung als katalytische Addition; ursprüngliche vollständige Stoff-/Operatorpflichten im neuen eigenen Ziel erhalten.
  - Understanding focus (EN): Fat hardening as catalytic addition; original complete substance/operator duties retained in their own goal.
## Page 2: Molare Masse von Gasen bestimmen

- Full learning-goal ID: `199570f4-b3c3-5e12-877d-ced97e9f6968`
- Goal fingerprint: `sha256:d2328b01e8ede20152f26e9ec4206c44526caedda05cfc9b72f94d6d279d22a2`
- Page fingerprint: `sha256:ffeabfd49c4a92e5b06c0d0d98b9c6fcb8e97248e5b17f9019bbfa00955532db`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann molare Massen gasförmiger Stoffe aus ihrer Formel oder aus Masse und Gasvolumen bei bekannten Bedingungen bestimmen und als Masse pro Stoffmenge deuten.

### Visualization

/assets/goal-visualizations/chemie/199570f4-b3c3-5e12-877d-ced97e9f6968/199570f4-b3c3-5e12-877d-ced97e9f6968.jpg

- original digest: `sha256:5b6d378fc8dbb33aa766d61a7c824a7b9f26d5e69b4474c6811183782dd37169`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Molares Volumen von Gasen nutzen — `2924f784-5261-54e8-93ee-49ac3b3cd300` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e4aef84611ec3bb3f5bc9e4c83d576e6d0886647f056103f7dfe092d2947c50b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `gas-molar-mass-from-composition-or-state-data`
  - Essential understanding (DE): Die molare Masse eines reinen Gases ist stoffbezogen und kann aus Formel/Atommassen oder aus Masse und Volumen mit passendem Vm erschlossen werden. rho·Vm hat Einheit g/mol, sofern beide Angaben denselben Zustand betreffen. Ein Druck-/Temperaturwechsel verändert die Dichte und Vm, nicht die molare Masse derselben unveränderten Gasart. Ein passender Wert allein beweist keine eindeutige Stoffidentität.
  - Essential understanding (EN): The molar mass of a pure gas is substance-specific and can be inferred from formula/atomic masses or from mass and volume with the appropriate molar volume. Density multiplied by molar volume has unit g/mol if both refer to the same state. Pressure or temperature changes affect density and molar volume but not an unchanged gas species’ molar mass. Agreement in molar mass alone does not uniquely identify a substance.
  - Observable performance (DE): Die lernende Person verknüpft Gasdaten und Zusammensetzung konsistent, begründet Zustand und Einheiten und trennt passende Formel-Hypothese von eindeutiger Identifikation.
  - Observable performance (EN): The learner links gas data and composition consistently, explains state and units and distinguishes a compatible formula hypothesis from unique identification.

**Coverage expectations**

- required expectations: `gas-molar-mass-from-composition-or-state-data`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `data-route`: Formelsumme wird mit unabhängigen Masse-/Volumendaten verglichen. / A formula-based molar mass is compared with independent mass/volume data.
- `pressure-change`: Frische Gasdaten stammen aus einem Zustand mit anderem molarem Volumen. / Fresh gas data come from a state with a different molar volume.

**Application cases**

- `carbon-dioxide-cross-check`
  - Task demand (DE): Eine reine CO2-Probe wiegt1,10g und besitzt bei den angegebenen idealen Modellbedingungen0,600L. Hier gilt Vm=24,0L/mol. Atombezogene molare Massen: C12,0g/mol, O16,0g/mol. Bestimme M unabhängig über die Formel und die Gasdaten, prüfe die Übereinstimmung und erkläre die Einheit des aus Dichte und Vm entstehenden Ergebnisses.
  - Task demand (EN): A pure CO2 sample weighs1.10g and occupies0.600L under the stated ideal-model conditions, where Vm=24.0L/mol. Atom-based molar masses are C12.0g/mol and O16.0g/mol. Determine molar mass independently from the formula and gas data, check agreement and explain the unit obtained from density and molar volume.
  - Expected performance (DE): Formelweg:12,0+2·16,0=44,0g/mol. Gasweg:n=0,0250mol, M=1,10g/0,0250mol=44,0g/mol; alternativ rho≈1,833g/L mal24,0L/mol. Beide Wege stimmen in den gerundeten Daten überein. Die Liter kürzen sich; Dichte allein hat eine andere Einheit und ist nicht M.
  - Expected performance (EN): Formula route:12.0+2×16.0=44.0g/mol. Gas route:n=0.0250mol and M=1.10g/0.0250mol=44.0g/mol, or density≈1.833g/L multiplied by24.0L/mol. The routes agree within the rounded data. Litres cancel; density alone has a different unit and is not molar mass.
  - Understanding focus (DE): Zwei Begründungswege und Zustands-/Einheitenkontrolle statt bloßer Zahlenpassung.
  - Understanding focus (EN): Two reasoning routes and state/unit checks replace mere numerical agreement.
- `unknown-gas-new-state-fresh`
  - Task demand (DE): Frischer Fall: Ein reines unbekanntes Gas wiegt1,60g und hat bei ZustandB0,300L. FürB ist Vm=12,0L/mol angegeben, für einen anderen ZustandA24,0L/mol. Kandidatenformeln sind SO2 und CO2, mit atombezogenen Massen S32,0,C12,0,O16,0 jeweils g/mol. Bestimme M und beurteile die Kandidaten sowie die Aussage „Aus M allein ist SO2 eindeutig bewiesen“. Begründe, welchen Vm-Wert du verwendest.
  - Task demand (EN): Fresh case: a pure unknown gas weighs1.60g and occupies0.300L at stateB, where Vm=12.0L/mol; a different stateA has24.0L/mol. Candidate formulas are SO2 and CO2, using atom-based molar masses S32.0,C12.0,O16.0g/mol. Determine molar mass, evaluate the candidates and the claim “M alone proves SO2 uniquely”. Explain which molar volume you select.
  - Expected performance (DE): Die B-Probe enthält0,0250mol, also M=64,0g/mol. SO2 passt dazu, CO2 mit44,0g/mol nicht. A-Daten unzulässig aufB übertragen ergäben128g/mol. Der passende64-Wert macht SO2 unter diesen Kandidaten plausibel, ist aber allein kein eindeutiger Identitätsnachweis; weitere Stoffinformationen wären erforderlich.
  - Expected performance (EN): The B sample contains0.0250mol, so M=64.0g/mol. SO2 is compatible while CO2 at44.0g/mol is not. Incorrectly applying A data toB would give128g/mol. The matching64 value makes SO2 plausible among the listed candidates but is not a unique identification without further substance information.
  - Understanding focus (DE): Frische Zustandsauswahl und begrenzte Identitätsinferenz werden selbstständig begründet.
  - Understanding focus (EN): Fresh state selection and the limit of identity inference require independent reasoning.
## Page 3: Fettkennzahlen strukturbezogen auswerten

- Full learning-goal ID: `78621f85-a873-51ba-924a-2c9e077c5acb`
- Goal fingerprint: `sha256:1b9702eb8502d40eeada5415418c1d933c0a9ffc3b80c1a8818b4489f37518ef`
- Page fingerprint: `sha256:1357eab24ec37ac702a107cf6b838c8c834d5c89f76452cab09ac3356872d3c8`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Verseifungszahl und Iodzahl aus gegebenen stöchiometrischen Modellen mit Einheiten herleiten und auswerten, die Kennzahlen mit Estergruppen und Doppelbindungen pro Fettmasse verknüpfen und daraus unter offengelegten Annahmen begrenzte Aussagen zu Zusammensetzung und oxidativer Haltbarkeit ableiten, ohne eine eindeutige Molekülstruktur, cis/trans-Verteilung oder Haltbarkeitsdauer vorzutäuschen.

### Visualization

/assets/goal-visualizations/chemie/78621f85-a873-51ba-924a-2c9e077c5acb/78621f85-a873-51ba-924a-2c9e077c5acb.png

- original digest: `sha256:d597a2c9b029a887df48f7fac1a304834b8539a515f3423cb7781481ba921d63`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Fette über Struktur und Eigenschaften erklären — `2f3cdec5-f845-5b0f-841e-8b1d47de0281` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)

### Direct reverse prerequisites outside this book

- Fettkennzahlen und Hydrierung am Strukturmodell erklären — `95cff878-b85e-53d8-84bc-132c8bf4cf71` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:121b406a658a67299975603cfd66c29139c2f9475520501a230ab35a2a8deeae`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `data`

**Positive understanding expectations**

- `hb-bio-fat-indices-structure-stoichiometry`
  - Essential understanding (DE): VZ=3×56,1×1000/M mg KOH/g: A≈190,2; B≈188,9; C≈263,4. IZ=n(C=C)×253,8×100/M g I2/100g: A≈86,0; B=C=0. D massenbezogen VZ≈226,8; IZ≈43,0. C hat kürzere Reste und mehr Triester-Moleküle/Gramm, keine höhere Ungesättigtheit. Keine Vertauschung g/mg oder 1g/100g. Realgemische, freie Säuren oder unvollständiger Umsatz begrenzen die einfache M-Deutung; nicht aus VZ allein eine Kettenlänge eindeutig bestimmen.
  - Essential understanding (EN): SV=3×56.1×1000/M mg KOH/g: A≈190.2, B≈188.9, C≈263.4. IV=n(C=C)×253.8×100/M g I2/100g: A≈86.0, B=C=0. Mass-weighted D gives SV≈226.8 and IV≈43.0. Shorter C residues mean more triester molecules per gram, not more unsaturation. Do not confuse g/mg or 1g/100g. Mixtures, free acids or incomplete conversion limit the simple molar-mass inference; SV alone does not identify an exact chain length.
  - Observable performance (DE): Leite beide Kennzahlen mit Einheiten aus den Stoffmengenverhältnissen ab und berechne A–C. Stelle die Kennzahlen den Strukturmerkmalen gegenüber: Zahl/Masse von Estergruppen versus Doppelbindungen. Berechne D und erkläre, warum der Kennzahlwert eines Gemisches keine einzige Molekülstruktur identifiziert. Prüfe die Aussage „hohe Verseifungszahl bedeutet viele Doppelbindungen“.
  - Observable performance (EN): Derive both values with units from consumption stoichiometry and calculate A–C. Link each index to its structural basis: ester groups per mass versus double bonds per mass. Calculate D and explain why a mixture index does not identify one molecular structure. Test the claim that high saponification value means many double bonds.
- `hb-bio-fat-indices-composition-durability-transfer`
  - Essential understanding (DE): U deutlich mehr C=C pro Masse als S/K; K bei gleichen Triesterannahmen im Mittel kleinere Molekülmasse/kürzere Reste als U/S. U/S ähnliche VZ beweist nicht gleiche Einzelzusammensetzung. Unter gleichen Lagerbedingungen kann U oxidationsanfälliger sein; keine sichere Haltbarkeit allein aus IZ. U1/U2 zeigen Verpackungs-/Umgebungsgrenze; X verletzt die reine Triesterannahme, da auch freie Säuren KOH verbrauchen. Y gleiche IZ bestimmt keine cis/trans-Geometrie und keinen Schmelzpunkt. Klare Wenn-dann-Aussagen und benannte fehlende Parameter sind erforderlich.
  - Essential understanding (EN): U has more C=C per mass than S/K; under the same triester assumptions K has lower average molar mass/shorter residues. Similar U/S SV does not prove identical components. Under equal storage U may be more oxidation-sensitive, but IV alone gives no shelf life. U1/U2 expose environmental/packaging limits; X violates the pure-triester assumption because free acids also consume KOH. Equal IV for Y determines neither cis/trans geometry nor melting point. Require conditional claims and named missing parameters.
  - Observable performance (DE): Leite für U/S/K begründete relative Aussagen zu Ungesättigtheit und mittlerer Restlänge ab. Formuliere eine bedingte Oxidations-/Haltbarkeitserwartung, ohne ein Verfallsdatum zu erfinden. Übertrage auf U1/U2, X und Y: Was bleibt aus den Kennzahlen ableitbar und welche Zusatzdaten fehlen? Nenne einen sinnvollen kontrollierten Vergleich, ohne neue Lagerexperimente als bereits durchgeführt auszugeben.
  - Observable performance (EN): Infer bounded relative unsaturation and average residue length for U/S/K. State a conditional oxidation/shelf-life expectation without inventing expiry dates. Transfer to U1/U2, X and Y: what can the indices still support, and what additional information is needed? Propose a controlled comparison without claiming an experiment has occurred.

**Coverage expectations**

- required expectations: `hb-bio-fat-indices-structure-stoichiometry`, `hb-bio-fat-indices-composition-durability-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `existing-whole-material-fresh-variation`: Die bereits vorhandene frische Variation bleibt vollständig verbindlich. Ausreichend unabhängige Belege können in einem reichhaltigen Fall entstehen; dieselbe Antwort zählt nicht zweimal. Keine zusätzliche Aufgabenquote. / The pre-existing fresh variation remains fully binding. Sufficient independent evidence may arise within a rich case; the same answer does not count twice. No additional task quota.

**Application cases**

- `hb-bio-fat-indices-structure-stoichiometry`
  - Task demand (DE): Vollständig vorgegebene ideale Rechenmodelle, keine eigene Analysenvorschrift: Alle Proben sind reine Triacylglyceride ohne freie Fettsäuren und sonstige Zusätze. A: Glycerin mit drei C18:1-cis-9-Acylresten, gerundet M=885 g/mol, zusammen drei C=C; B: drei C18:0-Reste, M=891 g/mol, keine C=C; C: drei C12:0-Reste, M=639 g/mol, keine C=C. Pro mol Triacylglycerid werden bei vollständiger Verseifung 3 mol KOH verbraucht. KOH: 56,1 g/mol. Pro C=C wird im idealen Additionsmodell 1 mol I2-Äquivalent gebunden; I2:253,8 g/mol. Iodzahl = g gebundenes I2-Äquivalent pro 100 g Fett; Verseifungszahl = mg KOH pro 1 g Fett. Reale Iodzahlverfahren verwenden geeignete standardisierte Halogenreagenzien; hier wird keine direkte I2-Schülermethode vorgeschrieben.
Leite beide Kennzahlen mit Einheiten aus den Stoffmengenverhältnissen ab und berechne A–C. Stelle die Kennzahlen den Strukturmerkmalen gegenüber: Zahl/Masse von Estergruppen versus Doppelbindungen. Erkläre, warum der Kennzahlwert eines Gemisches keine einzige Molekülstruktur identifiziert. Prüfe die Aussage „hohe Verseifungszahl bedeutet viele Doppelbindungen“.
Ganzes zugeordnetes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/1
  - Task demand (EN): Fully supplied ideal calculation models, not an analytical laboratory recipe. All samples are pure triacylglycerides without free fatty acids or additives. A: glycerol with three C18:1-cis-9 acyl residues, rounded M=885 g/mol, three C=C total; B: three C18:0 residues, M=891 g/mol, no C=C; C: three C12:0 residues, M=639 g/mol, no C=C. Full saponification consumes 3 mol KOH per mol triacylglyceride. KOH M=56.1 g/mol. Each C=C binds one mol I2 equivalent in the ideal addition model; I2 M=253.8 g/mol. Iodine value is g I2 equivalent per 100 g fat; saponification value is mg KOH per g fat. Real standard iodine-value methods use suitable halogen reagents; no direct I2 student method is prescribed.
Derive both values with units from consumption stoichiometry and calculate A–C. Link each index to its structural basis: ester groups per mass versus double bonds per mass. Explain why a mixture index does not identify one molecular structure. Test the claim that high saponification value means many double bonds.
Complete assigned material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/1
  - Expected performance (DE): VZ=3×56,1×1000/M mg KOH/g: A≈190,2; B≈188,9; C≈263,4. IZ=n(C=C)×253,8×100/M g I2/100g: A≈86,0; B=C=0. D massenbezogen VZ≈226,8; IZ≈43,0. C hat kürzere Reste und mehr Triester-Moleküle/Gramm, keine höhere Ungesättigtheit. Keine Vertauschung g/mg oder 1g/100g. Realgemische, freie Säuren oder unvollständiger Umsatz begrenzen die einfache M-Deutung; nicht aus VZ allein eine Kettenlänge eindeutig bestimmen.
  - Expected performance (EN): SV=3×56.1×1000/M mg KOH/g: A≈190.2, B≈188.9, C≈263.4. IV=n(C=C)×253.8×100/M g I2/100g: A≈86.0, B=C=0. Mass-weighted D gives SV≈226.8 and IV≈43.0. Shorter C residues mean more triester molecules per gram, not more unsaturation. Do not confuse g/mg or 1g/100g. Mixtures, free acids or incomplete conversion limit the simple molar-mass inference; SV alone does not identify an exact chain length.
  - Understanding focus (DE): Verseifungszahl und Iodzahl aus Fettstruktur; ursprüngliche vollständige Stoff-/Operatorpflichten im neuen eigenen Ziel erhalten.
  - Understanding focus (EN): Saponification and iodine values from fat structure; original complete substance/operator duties retained in their own goal.
- `hb-bio-fat-indices-composition-durability-transfer`
  - Task demand (DE): Synthetische Vergleichsproben ohne freie Fettsäuren: U mit VZ190 mgKOH/g und IZ86 gI2/100g, S mit VZ189 und IZ0, K mit VZ263 und IZ0. Alle sind ausschließlich Triacylglyceridgemische. Gegeben: Mehr zugängliche C=C können die oxidative Veränderung unter sonst gleichen Bedingungen begünstigen; tatsächliche Haltbarkeit hängt zusätzlich von Sauerstoff, Licht, Temperatur, Antioxidantien und Verpackung ab. Die IZ misst weder vorhandene Oxidationsprodukte noch direkt eine Haltbarkeitszeit; VZ misst Verbrauchsmenge pro Masse.
Leite für U/S/K begründete relative Aussagen zu Ungesättigtheit und mittlerer Restlänge ab. Formuliere eine bedingte Oxidations-/Haltbarkeitserwartung, ohne ein Verfallsdatum zu erfinden. Nenne einen sinnvollen kontrollierten Vergleich, ohne neue Lagerexperimente als bereits durchgeführt auszugeben.
Ganzes zugeordnetes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/2
  - Task demand (EN): Synthetic samples without free fatty acids: U has SV190 mgKOH/g and IV86 gI2/100g, S SV189/IV0, K SV263/IV0. All contain only triacylglyceride mixtures. Given: more accessible C=C may favour oxidative change under otherwise equal conditions; actual shelf life additionally depends on oxygen, light, temperature, antioxidants and packaging. IV measures neither existing oxidation products nor time to spoilage; SV measures reagent consumption per mass.
Infer bounded relative unsaturation and average residue length for U/S/K. State a conditional oxidation/shelf-life expectation without inventing expiry dates. Propose a controlled comparison without claiming an experiment has occurred.
Complete assigned material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v3/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/2
  - Expected performance (DE): U deutlich mehr C=C pro Masse als S/K; K bei gleichen Triesterannahmen im Mittel kleinere Molekülmasse/kürzere Reste als U/S. U/S ähnliche VZ beweist nicht gleiche Einzelzusammensetzung. Unter gleichen Lagerbedingungen kann U oxidationsanfälliger sein; keine sichere Haltbarkeit allein aus IZ. U1/U2 zeigen Verpackungs-/Umgebungsgrenze; X verletzt die reine Triesterannahme, da auch freie Säuren KOH verbrauchen. Y gleiche IZ bestimmt keine cis/trans-Geometrie und keinen Schmelzpunkt. Klare Wenn-dann-Aussagen und benannte fehlende Parameter sind erforderlich.
  - Expected performance (EN): U has more C=C per mass than S/K; under the same triester assumptions K has lower average molar mass/shorter residues. Similar U/S SV does not prove identical components. Under equal storage U may be more oxidation-sensitive, but IV alone gives no shelf life. U1/U2 expose environmental/packaging limits; X violates the pure-triester assumption because free acids also consume KOH. Equal IV for Y determines neither cis/trans geometry nor melting point. Require conditional claims and named missing parameters.
  - Understanding focus (DE): Aus Kennzahlen begrenzt auf Zusammensetzung und Haltbarkeit schließen; ursprüngliche vollständige Stoff-/Operatorpflichten im neuen eigenen Ziel erhalten.
  - Understanding focus (EN): Bounded inference from fat indices to composition and durability; original complete substance/operator duties retained in their own goal.
## Page 4: Wasserhärte unterscheiden und Enthärtung erklären (LK)

- Full learning-goal ID: `8a491e3b-5d0b-51d3-9b14-0977ec035dd6`
- Goal fingerprint: `sha256:9f64e39c5bb8312b4c1e3803af1c3c18c01c8b0c4efe2361b004fd2c8b518836`
- Page fingerprint: `sha256:c140ea8152b597d89456bbbd1a925e41791192725e60035ace0ae2d62a73368d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann temporäre, permanente und Gesamthärte anhand der beteiligten Ionen unterscheiden und die Wirkung geeigneter Enthärtungsverfahren erklären.

### Visualization

/assets/goal-visualizations/chemie/8a491e3b-5d0b-51d3-9b14-0977ec035dd6/8a491e3b-5d0b-51d3-9b14-0977ec035dd6.png

- original digest: `sha256:74ff5fad17b184e2528bc6c4e2bd707f68a14963fcffac9164e7707435296d3b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Waschvorgänge beeinflussen — `1837690e-cfb1-5b1c-96c8-0fb40d6d5d69` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ead53129ee5ba2fd7aa7072ee84ecd0afa7974b4d7a5863d348f62ad9c1d46fe`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hardness-ion-classes`
  - Essential understanding (DE): Gesamthärte bezieht sich auf Calcium-/Magnesiumionen. Hydrogencarbonatanteile tragen zur temporären, andere geeignete Gegenionen zur permanenten Härte bei; Gegenionen allein ohne Härtebildner erzeugen keine Wasserhärte.
  - Essential understanding (EN): Total hardness concerns calcium/magnesium ions. Hydrogencarbonate portions contribute temporary hardness and other suitable counterions permanent hardness; counterions alone without hardness cations do not create hardness.
  - Observable performance (DE): Aus gegebenen Ionen-/Salzdaten temporäre, permanente und Gesamthärte im ausdrücklich vereinfachten Modell zuordnen und unterscheiden.
  - Observable performance (EN): Classify temporary, permanent and total hardness from supplied ion/salt data in an explicitly simplified model.
- `softening-process-limit`
  - Essential understanding (DE): Erhitzen kann einen Calciumhydrogencarbonatanteil als Calciumcarbonat entfernen. Ionenaustausch kann Härtebildner gegen Natrium ersetzen; enthärtetes Wasser ist deshalb nicht notwendig entsalzt.
  - Essential understanding (EN): Heating can remove a calcium hydrogencarbonate portion as calcium carbonate. Ion exchange can replace hardness cations with sodium; softened water is therefore not necessarily demineralized.
  - Observable performance (DE): Geeignete Verfahren aus der konkreten Ionenlage auswählen, Reaktionen/Austausch ladungsrichtig erklären und die jeweilige Resthärte oder verbleibenden Ionen beurteilen.
  - Observable performance (EN): Select suitable processes from the ion composition, explain reactions/exchange with correct charge balance and assess remaining hardness or ions.

**Coverage expectations**

- required expectations: `hardness-ion-classes`, `softening-process-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-chemical-case`: Hydrogencarbonat-/Sulfat-/Chloridgemische und Wechsel von Erhitzen zu Natrium-Ionenaustausch; Stoff-/Ladungsbilanzen und Grenzen. / Use hydrogencarbonate/sulfate/chloride mixtures and switch from heating to sodium ion exchange; track atom/charge balances and limits.

**Application cases**

- `calcium-carbonate-magnesium-sulfate`
  - Task demand (DE): Ein vereinfachtes Wasser enthält 1,0 mmol/L Ca(HCO₃)₂ und 0,5 mmol/L MgSO₄. Ordne die Härteanteile zu. Das Modell entfernt beim Erhitzen den Calciumhydrogencarbonatanteil vollständig, nicht das Magnesiumsulfat. Formuliere die Calciumreaktion und bestimme die verbleibende Härte.
  - Task demand (EN): Simplified water contains1.0 mmol/L Ca(HCO₃)₂ and0.5 mmol/L MgSO₄. Classify hardness portions. The model removes the calcium hydrogencarbonate portion completely by heating, not magnesium sulfate. Write calcium precipitation and determine remaining hardness.
  - Expected performance (DE): Temporär 1,0, permanent 0,5 und gesamt 1,5 mmol/L zweiwertige Härtebildner. Ca²⁺ +2 HCO₃⁻ → CaCO₃(s) +CO₂ +H₂O; nach der ausdrücklich vorgegebenen vollständigen Modellfällung verbleiben 0,5 mmol/L. Daraus wird keine universelle Magnesiumcarbonatfällung oder reale vollständige Enthärtung behauptet.
  - Expected performance (EN): Temporary1.0, permanent0.5 and total1.5 mmol/L divalent hardness cations. Ca²⁺ +2 HCO₃⁻ → CaCO₃(s) +CO₂ +H₂O; the explicitly complete model precipitation leaves0.5 mmol/L. This does not assert universal magnesium-carbonate precipitation or actual complete softening.
  - Understanding focus (DE): Härteanteile und begrenzte thermische Wirkung.
  - Understanding focus (EN): Hardness portions and bounded heating effect.
- `chloride-water-ion-exchange`
  - Task demand (DE): Frisch gegeben sind 0,75 mmol/L CaCl₂ und 0,25 mmol/L MgCl₂. Ein vorgegebenes Harz tauscht jedes zweiwertige Ion gegen zwei Na⁺ aus. Erkläre, warum bloßes Erhitzen hier nicht wie im vorigen Calciumhydrogencarbonatmodell wirkt; bilanziere Austausch und verbleibende Ionen.
  - Task demand (EN): Fresh water contains0.75 mmol/L CaCl₂ and0.25 mmol/L MgCl₂. Supplied resin exchanges each divalent ion for two Na⁺. Explain why heating does not act as in the preceding calcium-hydrogencarbonate model; balance exchange and remaining ions.
  - Expected performance (DE): Im Modell permanente Gesamthärte 1,0 mmol/L; kein Hydrogencarbonat für den genannten Fällungsweg. Vollständiger vorgegebener Austausch ersetzt Ca/Mg durch 2,0 mmol/L Na⁺ bei unverändertem Chlorid. Härte fällt im Modell auf null, aber das Wasser enthält weiterhin Ionen und ist nicht entsalzt.
  - Expected performance (EN): Model permanent total hardness is1.0 mmol/L; no hydrogencarbonate supports that precipitation route. Complete supplied exchange replaces Ca/Mg with2.0 mmol/L Na⁺ while chloride remains. Model hardness reaches zero but ions remain, so water is not demineralized.
  - Understanding focus (DE): Frischer Gegenion-/Verfahrenstransfer.
  - Understanding focus (EN): Fresh counterion and process transfer.
## Page 5: Wirkstoffforschung mit Analyse, Synthese und Molecular Modelling erklären

- Full learning-goal ID: `93a7ce4d-1c90-568c-9368-cac423011ef9`
- Goal fingerprint: `sha256:909207aa162f7b6a249abd619a665eb55b23c0f1fb5918b7bb9ea50742291f34`
- Page fingerprint: `sha256:06a8df6765c12e1a37cf1088012a6e0840b9422ebc9054dbc87f43564f2552dc`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an vorgegebenen Natur- und Wirkstoffbeispielen das Zusammenspiel von Analyse, Synthese und Molecular Modelling erläutern, indem sie die Beiträge und Grenzen der Verfahren einer Forschungsfrage zuordnet und begründet, wie experimentelle Befunde und Modellvorhersagen aufeinander zurückwirken.

### Visualization

/assets/goal-visualizations/chemie/93a7ce4d-1c90-568c-9368-cac423011ef9/93a7ce4d-1c90-568c-9368-cac423011ef9.png

- original digest: `sha256:0eaeed882abbcee08ff19f1c724a94aabca672ff8f198402e813347f4a6cc972`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Elemente, Verbindungen und Gemische unterscheiden — `42a84bca-d27e-581f-a43a-eee424f0504d` (outside this book)
- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- Wirkstoffisolierung und Forschungsrückkopplung erklären — `4cbc2b02-d8c9-510e-9f64-2bb98b7673ef` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:263b1fafb9e562fa5cffac12dbb2e80284352e1b2b3f42d51da85cd1261adaae`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `three-method-contributions`
  - Essential understanding (DE): Analyse identifiziert und charakterisiert Proben, Synthese stellt gezielt andere oder reine Kandidaten bereit, Molecular Modelling liefert begrenzte Struktur-/Bindungshypothesen.
  - Essential understanding (EN): Analysis identifies and characterizes specimens, synthesis deliberately supplies modified or pure candidates, and molecular modelling provides bounded structure/binding hypotheses.
  - Observable performance (DE): Die lernende Person ordnet in HB-W1 und HB-W2 alle drei Verfahren konkreten Angaben derselben Wirkstoff-Forschungsfrage zu; reine Methodenetiketten genügen nicht.
  - Observable performance (EN): The learner assigns all three methods to concrete inputs for the same active-ingredient research question in HB-W1 and HB-W2; method labels alone do not suffice.
- `research-feedback-and-revision`
  - Essential understanding (DE): Experimentelle Befunde und Modellannahmen beeinflussen die nächste Analyse-, Synthese- oder Modellentscheidung; Forschung ist keine feste Einbahnstraße.
  - Essential understanding (EN): Experimental findings and model assumptions inform the next analytical, synthetic or modelling decision; research is not a fixed one-way sequence.
  - Observable performance (DE): Sie erläutert eine begründete Rückkopplung im N/D-Fall und rekonstruiert im P/Q-Fall, wie der Widerspruch zur P-Vorhersage die Forschungsfrage und Modellannahmen ändert.
  - Observable performance (EN): The learner explains reasoned feedback in the N/D case and reconstructs how disagreement with the P prediction changes the research question and model assumptions in the P/Q case.
- `specimen-identity-versus-causal-effect`
  - Essential understanding (DE): Struktur-/Reinheitsanalyse und ein Proben-Assay beantworten verschiedene Fragen; ein Gemisch oder 98 % Reinheit sichern keine ausschließliche Wirkungszuordnung zum benannten Molekül.
  - Essential understanding (EN): Structure/purity analysis and a specimen assay answer different questions; a mixture or 98% purity does not establish exclusive attribution to the named molecule.
  - Observable performance (DE): Sie trennt Vorhersage, Identitätsbefund und Testbeobachtung, begrenzt die kausale D-Zuordnung und erklärt, weshalb die alte P/Q-Probe den Effekt nicht P zuordnen konnte.
  - Observable performance (EN): The learner separates prediction, identity findings and assay observation, limits causal attribution to D and explains why the earlier P/Q specimen could not assign the effect to P.
- `justified-next-test-and-reach`
  - Essential understanding (DE): Ein nächster Forschungsschritt muss die konkrete offene Zuordnung oder Modellannahme prüfen; nichtklinische Daten ersetzen keine klinische Wirksamkeit oder Sicherheit.
  - Essential understanding (EN): A next research step must test the specific open attribution or model assumption; nonclinical data do not replace clinical efficacy or safety evidence.
  - Observable performance (DE): Sie begründet passende, noch nicht ausgeführte Reinheits-/Verunreinigungs-/Kontrolltests und überträgt die Rückkopplung auf eine neu entdeckte Verunreinigung, ohne Mechanismus, Additivität oder Zulassung zu erfinden.
  - Observable performance (EN): The learner justifies appropriate unperformed purity/impurity/control tests and transfers feedback to a newly detected impurity without inventing mechanism, additivity or authorization.

**Coverage expectations**

- required expectations: `three-method-contributions`, `research-feedback-and-revision`, `specimen-identity-versus-causal-effect`, `justified-next-test-and-reach`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `agreement-versus-contradiction`: Vom D-Probenbefund zur P/Q-Widerlegung der ursprünglichen Zuordnung wechseln. / Change from the D-specimen result to P/Q evidence contradicting the original attribution.
- `specimen-composition`: 98-%-Probe, ungetrenntes Gemisch, bestätigte Reinsubstanz und später erkannte Verunreinigung unterscheiden. / Distinguish a 98% specimen, unseparated mixture, confirmed pure compound and later detected impurity.
- `method-direction`: Analyse verändert Modell-/Syntheseentscheidung und ein neuer Test verändert die nächste Fragestellung. / Analysis changes modelling/synthesis decisions and a new assay changes the next research question.

**Application cases**

- `hb-w1`
  - Task demand (DE): Erkläre Analyse, Synthese und Molecular Modelling im N/D-Forschungsweg einschließlich Rückkopplung und ungetesteter Verunreinigungen. Vollständiges Material, Auftrag, Lösung und vier Kriterien: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, Fall HB-W1.
  - Task demand (EN): Explain analysis, synthesis and molecular modelling in the N/D inquiry, including feedback and unassayed impurities. Complete material, task, solution and four criteria: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, case HB-W1.
  - Expected performance (DE): Modellvorschlag, Esterbildung, Struktur-/Reinheitsanalyse und Probenwirkung bleiben verschiedene Beiträge. 98 % Reinheit beweisen keine ausschließliche D-Kausalität; geeignete Kontrollen sind erst vorgeschlagen.
  - Expected performance (EN): Model proposal, ester formation, structure/purity analysis and specimen effect remain distinct contributions. 98% purity does not prove exclusive D causation; suitable controls are only proposed.
  - Understanding focus (DE): Alle drei domänenspezifischen Methoden und ihre begründete Rückkopplung sind obligatorisch.
  - Understanding focus (EN): All three domain-specific methods and their reasoned feedback are compulsory.
- `hb-w2`
  - Task demand (DE): Rekonstruiere den P/Q-Widerspruch zur Modellvorhersage und begründe einen nächsten Schritt bei neuer Verunreinigung. Vollständiges Material, Auftrag, Lösung und vier Kriterien: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, Fall HB-W2.
  - Task demand (EN): Reconstruct the P/Q disagreement with the model prediction and justify a next step after a new impurity. Complete material, task, solution and four criteria: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, case HB-W2.
  - Expected performance (DE): 35 % Gemischaktivität identifiziert P nicht; reines P ergibt 95 %, Q 20 %. Analytik/Synthese ermöglichen kontrollierte Zuordnung und veranlassen Modellkritik; Additivität/Mechanismus bleiben offen.
  - Expected performance (EN): 35% mixture activity does not identify P; pure P gives 95%, Q 20%. Analysis/synthesis enable controlled attribution and motivate model criticism; additivity/mechanism remain open.
  - Understanding focus (DE): Abweichender Befund muss die Forschungsfrage verändern können.
  - Understanding focus (EN): A divergent observation must be able to change the research question.
## Page 6: Aktivierungsenergie und Katalysatorwirkung erklären

- Full learning-goal ID: `945d69d5-92a7-5195-8f78-4e56f8e7b633`
- Goal fingerprint: `sha256:a8b53c0194a8877886e5ecda2a87ad511747442ce3eb497c6a8b401efa2faecd`
- Page fingerprint: `sha256:e4db9076c61dbd6144f22913476a832c6f05b909229a3948e361404d110bc192`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Aktivierungsenergie als Startvoraussetzung chemischer Reaktionen beschreiben, von endothermer Energiezufuhr unterscheiden und die Wirkung von Katalysatoren auf die Aktivierungsenergie erklären.

### Visualization

/assets/goal-visualizations/chemie/945d69d5-92a7-5195-8f78-4e56f8e7b633/945d69d5-92a7-5195-8f78-4e56f8e7b633.jpg

- original digest: `sha256:567ceaecf5dfe23401aa03e7f44a60497712725e4d57513e435f83d69d14324e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Exotherme und endotherme Reaktionen unterscheiden — `1286f2fe-89b7-4454-8e11-85b6abd6e278` (outside this book)
- Energieprofile chemischer Reaktionen deuten — `542d88e9-4cd3-5f90-bd20-b50ab030d72a` (outside this book)

### Direct reverse prerequisites outside this book

- Energieprofile von Katalyse und Erwärmung unterscheiden — `35709a35-ed66-5b6c-88cd-e01e8e8eed89` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1764875d35e9f2c193ff44fbd059a2e4f2db63a3856405c6afe29b388e45f37d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `activation-barrier-versus-reaction-energy`
  - Essential understanding (DE): Aktivierungsenergie ist die zu überwindende Barriere vom Eduktzustand zum reaktionsfähigen Übergangsbereich. Endotherm beschreibt dagegen eine höhere Produkt- als Eduktenergie. Ein Katalysator senkt die Barriere über einen anderen Weg, nicht die Differenz der Anfangs- und Endniveaus.
  - Essential understanding (EN): Activation energy is the barrier from reactants toward the reactive transition region. Endothermic instead means that products have a higher energy level than reactants. A catalyst lowers the barrier by another path, not the difference between initial and final levels.
  - Observable performance (DE): Die lernende Person vergleicht Energieprofile, markiert Barriere und Reaktionsenergie getrennt und erklärt, weshalb Erwärmen und Katalysieren unterschiedliche Eingriffe sind.
  - Observable performance (EN): The learner compares energy profiles, marks barrier and reaction energy separately, and explains why heating and catalysis are different interventions.

**Coverage expectations**

- required expectations: `activation-barrier-versus-reaction-energy`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `thermic-direction`: Exotherme und endotherme Produktniveaus werden variiert. / Exothermic and endothermic product levels are varied.
- `intervention`: Katalysator und Wärmezufuhr werden als unterschiedliche Eingriffe betrachtet. / Catalyst and heat supply are considered as different interventions.

**Application cases**

- `exothermic-catalyst-comparison`
  - Task demand (DE): Für eine neue exotherme Reaktion liegen zwei qualitative Profile mit denselben Edukt- und Produktniveaus, aber verschiedenen Gipfelhöhen vor. Erkläre, welches Profil einen katalysierten Weg darstellen kann und warum beide exotherm bleiben.
  - Task demand (EN): For a fresh exothermic reaction, two qualitative profiles have the same reactant and product levels but different peak heights. Explain which can represent a catalyzed path and why both remain exothermic.
  - Expected performance (DE): Die lernende Person ordnet den niedrigeren Gipfel dem katalysierten Weg zu, misst die Aktivierungsbarriere vom Eduktniveau und erklärt, dass die unveränderte niedrigere Produktlage dieselbe exotherme Reaktionsenergie bedeutet.
  - Expected performance (EN): The learner assigns the lower peak to the catalyzed path, measures the activation barrier from the reactant level, and explains that unchanged lower products mean the same exothermic reaction energy.
  - Understanding focus (DE): Barriere und Reaktionsenergie sind verschiedene Profilmerkmale.
  - Understanding focus (EN): Barrier and reaction energy are different profile features.
- `fresh-endothermic-heating-versus-catalyst`
  - Task demand (DE): Eine unabhängig beschriebene endotherme Reaktion startet bei 20 °C langsam. Zwei Vorschläge lauten: erwärmen oder einen passenden Katalysator verwenden. Erkläre mit einem qualitativen Profil, welche Barriereänderung nur der Katalysator bewirkt und warum die Reaktion in beiden Fällen endotherm bleibt.
  - Task demand (EN): An independently described endothermic reaction is slow at 20 °C. Two proposals are heating it or using a suitable catalyst. Use a qualitative profile to explain which barrier change only the catalyst causes and why the reaction stays endothermic in both cases.
  - Expected performance (DE): Die lernende Person hält das Produktniveau über dem Eduktniveau fest, beschreibt Erwärmen als zusätzliche verfügbare thermische Energie und den Katalysator als alternativen Weg mit niedrigerer Barriere. Sie setzt beides nicht mit einer geänderten Reaktionsenergie gleich.
  - Expected performance (EN): The learner keeps products above reactants, describes heating as providing more thermal energy and the catalyst as an alternative lower-barrier path, and does not equate either with changing reaction energy.
  - Understanding focus (DE): Kinetische Zugänglichkeit und energetische Bilanz werden getrennt.
  - Understanding focus (EN): Kinetic accessibility and energy balance are kept separate.
## Page 7: Kunststoffe und Metalle nachhaltig bewerten

- Full learning-goal ID: `4d7554d4-3f89-5c64-8a67-4b73b55b4442`
- Goal fingerprint: `sha256:dbba464d54aff5134b3ee941a756df3b080dedc5cbefb95d71702c6ca0a8699c`
- Page fingerprint: `sha256:2ea4414b0bc984ad1c420a4c13ee6c5b18221f62513f30dd0214ad866597a101`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Verwendung von Kunststoffen und Metallen mithilfe analoger und digitaler Quellen reflektieren und im Hinblick auf nachhaltige Entwicklung fachlich bewerten.

### Visualization

/assets/goal-visualizations/chemie/4d7554d4-3f89-5c64-8a67-4b73b55b4442/4d7554d4-3f89-5c64-8a67-4b73b55b4442.jpg

- original digest: `sha256:ceb9769414e24d9a7889995acba88793b5fb1e81d7198b9ad433f7b1baf22d12`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Kunststoffrohstoffe nachhaltig bewerten — `c21a611c-1069-5b32-b673-4f37a89b094f` (outside this book)
- Passiven und aktiven Korrosionsschutz bewerten — `94a62b39-d4a2-5882-99d1-6886ead07726` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fcbceca09219080407975f8ab216ac51cf38642a4b2ba57cb67d6f1fd4d8b525`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Werkstoffe müssen dieselbe Funktion über eine passende Nutzdauer erfüllen.
  - Essential understanding (EN): Materials must provide the same function over appropriate service life.
  - Observable performance (DE): energy20-09-a: Materialeigenschaften mit identischer Nutzfunktion verbinden. energy20-09-b: Gleiche Betriebsfunktion und Ersatzbedarf erhalten.
  - Observable performance (EN): energy20-09-a: Connect plastic/metal properties to the same service function. energy20-09-b: Maintain the same service function and replacement accounting.
- `e2`
  - Essential understanding (DE): Lebensdauer,Recyclingverluste und Allokation ändern eine Materialbilanz.
  - Essential understanding (EN): Lifetime,recovery losses and allocation change material accounting.
  - Observable performance (DE): energy20-09-a: 22Nutzungen mit beiden Vorketten herleiten. energy20-09-b: 150/120MJ und die alternative75MJ-Allokation trennen.
  - Observable performance (EN): energy20-09-a: Correctly derive22uses break-even with both upstream chains. energy20-09-b: Distinguish150/120MJ from explicit75MJ lifetime allocation.
- `e3`
  - Essential understanding (DE): Analoge/digitale Quellen und ökologische/soziale Kriterien brauchen kritische Gewichtung.
  - Essential understanding (EN): Analog/digital sources and environmental/social criteria need critical weighting.
  - Observable performance (DE): energy20-09-a: Analoge/digitale Urheberschaft, Grenzen und soziale Kriterien kritisch nutzen. energy20-09-b: Recyclingfähigkeit nicht mit realem Rücklauf gleichsetzen.
  - Observable performance (EN): energy20-09-a: Critique analog/digital authorship,boundaries and social criteria. energy20-09-b: Do not equate recyclability with actual recovery.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `energy20-09-a-transfer`: Die Flasche geht nach5 Nutzungen verloren und der Wiederbefüllort entfällt. Revidiere das Urteil mit Daten statt mit dem Materialnamen. / Refill access disappears and the steel bottle is lost after5uses. Revise the judgement from evidence instead of material identity.
- `energy20-09-b-transfer`: Ein repariertesPP-Teil hält1500h, Reparatur kostet10MJ. Lege einen fairen Rand offen und entscheide erneut. / A repairedPP part demonstrably lasts1500h;repair needs10MJ. Declare a boundary and decide again rather than retain the earlier ranking.

**Application cases**

- `energy20-09-a`
  - Task demand (DE): Ganzes eigenes Material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-09-a,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Bewerte Kunststoff und Metall mit beiden Quellenarten für dieselbe Nutzung. Leite denCO2-Breakeven ab und berücksichtige Gewicht, Reinigung und Zugang zum Wiederbefüllen, ohne fehlende Werte zu erfinden.
  - Task demand (EN): Whole own material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-09-a,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Compare plastic/metal for their use,critically using both source types,and derive carbon break-even reuse count. Also assess weight,cleaning and refill access without replacing unknown values with assumptions.
  - Expected performance (DE): Stahl:2+0,005n; PET:0,100n kgCO2e. Gleichheit bei n=2/0,095≈21,05, ab22 Nutzungen ist Stahl hier günstiger. Gleiches Volumen sichert nicht gleiche Hygiene oder Transportmasse. Analoge Quellen sind nicht automatisch besser; Herstellerinteresse verlangt Methodik-/Grenzprüfung, keine pauschale Ablehnung. Materialstruktur begründet Eignung, CO2 allein keine vollständige Nachhaltigkeit.
  - Expected performance (EN): Steel total2+0.005nkg;PET0.100nkg. Equality at n=2/0.095≈21.05;from22uses steel has the lower value here. Equal volume alone does not guarantee equal hygiene/transport mass;cleaning/durability must match. Printed is not automatically better;manufacturer data can be useful but need interest/boundary checks. CO2 alone is not complete sustainability;material structure informs use/reuse.
  - Understanding focus (DE): Die Flasche geht nach5 Nutzungen verloren und der Wiederbefüllort entfällt. Revidiere das Urteil mit Daten statt mit dem Materialnamen.
  - Understanding focus (EN): Refill access disappears and the steel bottle is lost after5uses. Revise the judgement from evidence instead of material identity.
- `energy20-09-b`
  - Task demand (DE): Ganzes eigenes Material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-09-b,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Berechne den Einsatz für1000h und erkläre die Unzulänglichkeit eines Vergleichs jeKilogramm. Prüfe die Kreislaufbehauptung und die Grenzen der Lebensdauerübertragung.
  - Task demand (EN): Whole own material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json #energy20-09-b,sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe. Calculate material/energy input for the service function and explain why per-kilogram comparison alone is unfair. Challenge the loop claim using a missing parameter and specify limits of lifetime transfer.
  - Expected performance (DE): Eine bereitgestellte Al-Einheit benötigt150MJ; PP zwei Einheiten120MJ und1kg Material. Lebensdauerallokation von Al ergäbe75MJ, ist aber eine andere ausdrücklich zu vereinbarende Grenze. Dieses Ergebnis darf nicht stillschweigend gewechselt werden. Recyclingfähigkeit garantiert keine vollständige Sammlung/Sortierung/Aufbereitung. Testlast, Umgebung und Reparatur begrenzen die Prognose; Interessen und wissenschaftliche Daten der Quellen sind getrennt zu prüfen.
  - Expected performance (EN): For1000h the specified supplied-part boundary uses oneAl part=150MJ;PP needs two parts=120MJ and1kg total material. Allocating half theAl lifetime would give75MJ,but is a different boundary requiring explicit agreement;do not silently change it. Collection/sorting/reprocessing losses mean recyclability does not establish100%closed-loop recovery. Test load,environment and repairability limit lifetime extrapolation. Source evaluation includes scientific properties and interests.
  - Understanding focus (DE): Ein repariertesPP-Teil hält1500h, Reparatur kostet10MJ. Lege einen fairen Rand offen und entscheide erneut.
  - Understanding focus (EN): A repairedPP part demonstrably lasts1500h;repair needs10MJ. Declare a boundary and decide again rather than retain the earlier ranking.
## Page 8: Stoffe nach Struktur und Eigenschaften ordnen

- Full learning-goal ID: `02dc29ae-4046-556a-b048-d64a0feb8f16`
- Goal fingerprint: `sha256:09e5cd176edc340413f74dff28f746aeae1913848577783c47ef0c3819fd5418`
- Page fingerprint: `sha256:6c4a5960f7c7eea4127cb2c5645b22914ad1bcf28ba9563a644e061d896cc52c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Ordnungsprinzipien für Stoffe beschreiben und begründen, Stoffe auf Stoff- und Teilchenebene unterscheiden und Eigenschaften auf Basis chemischer Strukturen und Gesetzmäßigkeiten erklären oder vorhersagen.

### Visualization

/assets/goal-visualizations/chemie/02dc29ae-4046-556a-b048-d64a0feb8f16/02dc29ae-4046-556a-b048-d64a0feb8f16.jpg

- original digest: `sha256:5547c43ac00c08822496cdde3e4006d17011672f7ba8be4982514afddc9925ff`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Fach- und Symbolsprache ebenengerecht verwenden — `95dc0ee5-a0af-5682-af32-d66e36fbeb50` (outside this book)

### Direct reverse prerequisites outside this book

- Stoffkarten mit Teilchenmodellen begründet ordnen — `ed0eadfa-cad8-5989-9ad9-e5173f3cbe16` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:40c345debce22fbd65fd6f4495ebc52ce4e48bc2b88b089796622951ed361d3a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Ordnungsprinzipien beruhen auf begründeten Struktur- und Eigenschaftskriterien. Stoffdaten und Teilchenmodelle ergänzen sich; Stoffklasse, Bindung und Wechselwirkung können Eigenschaften vorhersagen, aber eine einzige Eigenschaft oder Summenformel bestimmt nicht jede Eigenschaft.
  - Essential understanding (EN): Classification uses justified structural and property criteria. Substance data and particle models complement each other; classes, bonding and interactions can predict properties, but one property or molecular formula does not determine every property.
  - Observable performance (DE): Kupfer ist metallisch; mobile Elektronen transportieren Ladung auch im Feststoff. NaCl ist ein Ionenkristall: im Feststoff sind Ionen ortsgebunden, in Lösung und Schmelze beweglich, sodass die Schmelze leiten sollte. Zucker ist ein molekularer Stoff; die vorgegebenen neutralen gelösten Moleküle liefern keine ausreichenden beweglichen Ionen für die hier betrachtete Leitfähigkeit. Sichtbares Verschwinden beim Lösen allein trennt Salz und Zucker nicht. Die Stoffeigenschaft Leitfähigkeit wird über Ladungsträger auf Teilchenebene begründet.
  - Observable performance (EN): Copper is metallic; mobile electrons transport charge even in the solid. NaCl is an ionic crystal: ions are fixed in the solid but mobile in solution and melt, so the melt should conduct. Sugar is a molecular substance; the supplied neutral dissolved molecules provide no sufficient mobile ions for the conductivity considered here. Visible disappearance during dissolution alone does not distinguish salt from sugar. Conductivity at substance level is explained using charge carriers at particle level.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): Metall, Ionenkristall und molekularer Stoff gegenüber isomeren Molekülstoffen mit unterschiedlicher Wasserstoffbrückenfähigkeit. Ein funktionelles Strukturmerkmal erklärt einen kontrollierten Vergleich; es ersetzt keine vollständige Stoffidentifikation.
  - Essential understanding (EN): A metal, ionic crystal and molecular substance versus isomeric molecular substances with different hydrogen-bonding ability. One functional structural feature explains a controlled comparison; it does not replace complete substance identification.
  - Observable performance (DE): Ethanol ist ein Alkohol, Dimethylether ein Ether; es handelt sich um Konstitutionsisomere. Ethanol-Moleküle können untereinander O−H···O-Wasserstoffbrücken bilden; Dimethylether-Moleküle besitzen dafür keinen passenden H-Donator. Beide haben weitere Wechselwirkungen. Bei ähnlich großer Molekülmasse ist für Ethanol deshalb eine höhere Siedetemperatur plausibel. Die Summenformel reicht nicht aus; die Bindungsanordnung ist entscheidend. Ohne Messung folgt daraus kein genauer Zahlenwert und keine universelle Rangregel für beliebig verschieden große Moleküle.
  - Observable performance (EN): Ethanol is an alcohol and dimethyl ether an ether; they are constitutional isomers. Ethanol molecules can form O−H···O hydrogen bonds with one another; dimethyl ether molecules lack a suitable hydrogen donor. Both have additional interactions. At similar molecular mass, a higher boiling point is therefore plausible for ethanol. The molecular formula alone is insufficient; connectivity matters. This does not yield a precise measured value or a universal ordering for molecules of very different sizes.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: Metall, Ionenkristall und molekularer Stoff gegenüber isomeren Molekülstoffen mit unterschiedlicher Wasserstoffbrückenfähigkeit. / A metal, ionic crystal and molecular substance versus isomeric molecular substances with different hydrogen-bonding ability.
- `model-boundary`: Ein funktionelles Strukturmerkmal erklärt einen kontrollierten Vergleich; es ersetzt keine vollständige Stoffidentifikation. / One functional structural feature explains a controlled comparison; it does not replace complete substance identification.

**Application cases**

- `chem-next20-02dc29ae-case-1`
  - Task demand (DE): Vorgegebene Stoffe: Kupfer mit Metallgitter und beweglichen Elektronen; NaCl mit festem Na+/Cl−-Gitter; Zucker mit neutralen Molekülen. Im bereitgestellten Datensatz leitet Kupfer als Feststoff Strom, festes NaCl nicht; NaCl-Lösung leitet, reine Zuckerlösung nicht. Beide löslichen Feststoffe erscheinen nach dem Lösen nicht mehr als Kristalle. Ordne die Stoffe nach Aufbau und Leitfähigkeit. Trenne Beobachtung von Teilchenbegründung und sage für geschmolzenes NaCl unter dem gegebenen Modell die Leitfähigkeit voraus.
  - Task demand (EN): Supplied substances: copper with a metallic lattice and mobile electrons; NaCl with a fixed Na+/Cl− lattice; sugar consisting of neutral molecules. The supplied dataset shows solid copper conducts, solid NaCl does not, NaCl solution conducts and pure sugar solution does not. Neither soluble solid remains visibly crystalline after dissolution. Classify by structure and conductivity. Separate observations from particle explanations and predict conductivity of molten NaCl using the supplied model.
  - Expected performance (DE): Kupfer ist metallisch; mobile Elektronen transportieren Ladung auch im Feststoff. NaCl ist ein Ionenkristall: im Feststoff sind Ionen ortsgebunden, in Lösung und Schmelze beweglich, sodass die Schmelze leiten sollte. Zucker ist ein molekularer Stoff; die vorgegebenen neutralen gelösten Moleküle liefern keine ausreichenden beweglichen Ionen für die hier betrachtete Leitfähigkeit. Sichtbares Verschwinden beim Lösen allein trennt Salz und Zucker nicht. Die Stoffeigenschaft Leitfähigkeit wird über Ladungsträger auf Teilchenebene begründet.
  - Expected performance (EN): Copper is metallic; mobile electrons transport charge even in the solid. NaCl is an ionic crystal: ions are fixed in the solid but mobile in solution and melt, so the melt should conduct. Sugar is a molecular substance; the supplied neutral dissolved molecules provide no sufficient mobile ions for the conductivity considered here. Visible disappearance during dissolution alone does not distinguish salt from sugar. Conductivity at substance level is explained using charge carriers at particle level.
  - Understanding focus (DE): Löslichkeit allein identifiziert keine Bindungsart; die Aussagen über reine Lösungen gelten für das ausdrücklich vorgegebene Modell.
  - Understanding focus (EN): Solubility alone does not identify bonding type; statements about pure solutions apply to the explicitly supplied model.
- `chem-next20-02dc29ae-case-2`
  - Task demand (DE): Frischer Strukturvergleich: Ethanol CH3CH2OH und Dimethylether CH3OCH3 besitzen beide C2H6O. Gleiche äußere Bedingungen werden angenommen. Ethanol hat eine O−H-Gruppe; Dimethylether besitzt am O freie Elektronenpaare, aber keine O−H-Bindung. Ein Schüler behauptet, beide müssten wegen gleicher Summenformel gleich hoch sieden. Ordne beide Stoffklassen zu und begründe eine qualitative Siedetemperatur-Voraussage aus ihren Strukturen. Kennzeichne die Grenzen der Vorhersage.
  - Task demand (EN): Fresh structural comparison: ethanol CH3CH2OH and dimethyl ether CH3OCH3 both have C2H6O. Equal external conditions are assumed. Ethanol has an O−H group; dimethyl ether has oxygen lone pairs but no O−H bond. A learner claims they must have equal boiling points because their molecular formula is identical. Assign their compound classes and justify a qualitative boiling-point prediction from structure. State the prediction limits.
  - Expected performance (DE): Ethanol ist ein Alkohol, Dimethylether ein Ether; es handelt sich um Konstitutionsisomere. Ethanol-Moleküle können untereinander O−H···O-Wasserstoffbrücken bilden; Dimethylether-Moleküle besitzen dafür keinen passenden H-Donator. Beide haben weitere Wechselwirkungen. Bei ähnlich großer Molekülmasse ist für Ethanol deshalb eine höhere Siedetemperatur plausibel. Die Summenformel reicht nicht aus; die Bindungsanordnung ist entscheidend. Ohne Messung folgt daraus kein genauer Zahlenwert und keine universelle Rangregel für beliebig verschieden große Moleküle.
  - Expected performance (EN): Ethanol is an alcohol and dimethyl ether an ether; they are constitutional isomers. Ethanol molecules can form O−H···O hydrogen bonds with one another; dimethyl ether molecules lack a suitable hydrogen donor. Both have additional interactions. At similar molecular mass, a higher boiling point is therefore plausible for ethanol. The molecular formula alone is insufficient; connectivity matters. This does not yield a precise measured value or a universal ordering for molecules of very different sizes.
  - Understanding focus (DE): Ein funktionelles Strukturmerkmal erklärt einen kontrollierten Vergleich; es ersetzt keine vollständige Stoffidentifikation.
  - Understanding focus (EN): One functional structural feature explains a controlled comparison; it does not replace complete substance identification.
## Page 9: Chemische Sachverhalte fachlich diskutieren

- Full learning-goal ID: `1f354a60-be44-512b-8f8b-f67c8c456035`
- Goal fingerprint: `sha256:144352c350400f3b537d5a9f4c0bfc74dcb12ece511ce00e1360d6b298dab59b`
- Page fingerprint: `sha256:fafcc0ec162b259ebab2af846f553f8eea663b4636ae799b1c653a8649d48047`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann chemische Sachverhalte fachlich schlüssig erklären, begründet argumentieren, sich konstruktiv austauschen und den eigenen Standpunkt anhand fachlicher Argumente reflektieren oder korrigieren.

### Visualization

/assets/goal-visualizations/chemie/1f354a60-be44-512b-8f8b-f67c8c456035/1f354a60-be44-512b-8f8b-f67c8c456035.png

- original digest: `sha256:cff11eb28e56eb08b6007999a4560174b0c5e053ba99eb3c52577dfea0a73a9a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Chemische Fach- und Symbolsprache ebenengerecht verwenden — `95dc0ee5-a0af-5682-af32-d66e36fbeb50` (outside this book)

### Direct reverse prerequisites outside this book

- Katalyse und Leitfähigkeitsbelege im Dialog prüfen — `dd63beba-613b-5f9e-80f6-9b2552c2cc2a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9653f5938b27837644edba35b91c2f462e7d22abd4da3a72ba768647ce205ed5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `coherent-explanation-argument`
  - Essential understanding (DE): Eine fachliche Erklärung verbindet chemische Theorie mit Bedingungen und Daten; frühe Produktmenge und Leitfähigkeit sind keine voraussetzungslosen Gleichgewichts-/Konzentrationsbeweise.
  - Essential understanding (EN): A scientific explanation connects chemical theory with conditions and data; early product amount and conductivity are not unconditional proofs of equilibrium/concentration.
  - Observable performance (DE): Erklärt Geschwindigkeit versus Gleichgewicht bzw. Ionenkonzentration versus Temperatur und begründet den Standpunkt mit den konkreten Kontrolldaten.
  - Observable performance (EN): Explains rate versus equilibrium or ion concentration versus temperature and justifies a standpoint using the specific control data.
- `actual-constructive-exchange`
  - Essential understanding (DE): Konstruktiver Austausch nimmt tatsächliche Partnerbeiträge auf und beantwortet ihre fachliche Bedeutung; ein vorgedruckter Dialog ist kein Austausch.
  - Essential understanding (EN): Constructive exchange receives actual partner contributions and responds to their scientific meaning; a preprinted dialogue is not an exchange.
  - Observable performance (DE): Dokumentiert einen echten Dialog mit eigener Rückfrage, tatsächlicher Partnerantwort und passender Folgeantwort; klärt fehlende Daten respektvoll.
  - Observable performance (EN): Documents an actual dialogue with an own question, actual partner reply and appropriate follow-up; respectfully clarifies missing data.
- `own-standpoint-review`
  - Essential understanding (DE): Ein eigener Standpunkt wird anhand fachlicher Argumente ausdrücklich reflektiert und bei tragfähiger neuer Evidenz korrigiert.
  - Essential understanding (EN): An own standpoint is explicitly reflected on using scientific arguments and corrected when sound new evidence supports this.
  - Observable performance (DE): Benennt eigene Anfangsaussage und deren fachliche Prüfung; reagiert auf neue Katalysator- oder temperaturgleiche Daten mit begründeter Beibehaltung/Einschränkung/Korrektur.
  - Observable performance (EN): Names own initial statement and its scientific examination; responds to new catalyst or equal-temperature data with justified retention/restriction/correction.

**Coverage expectations**

- required expectations: `coherent-explanation-argument`, `actual-constructive-exchange`, `own-standpoint-review`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `partner-objection`: Eine neue Partnerbehauptung zur Hinreaktion verlangt responsive Erklärung beider Reaktionsrichtungen. / A new partner claim about the forward reaction needs a responsive explanation of both directions.
- `new-data`: Neue temperaturgleiche, geprüfte Daten können eine zuvor gerechtfertigte Einschränkung ändern. / New checked equal-temperature data can change a previously justified restriction.

**Application cases**

- `upper-scientific-discourse-catalyst-discussion`
  - Task demand (DE): Erkläre dem Partner fachlich den Unterschied von Geschwindigkeit und Gleichgewicht. Frage konstruktiv nach seinem Beleg, gehe auf seine Antwort ein und reflektiere/korrigiere einen eigenen Anfangssatz, falls nötig. Halte echten Dialog oder Moderatorprotokoll fest.
Frische Variation: Partner behauptet nun „Katalysator macht nur Hinreaktion schneller“: Reagiere fachlich und konstruktiv mit Blick auf Gleichgewicht.
  - Task demand (EN): Scientifically explain to the partner the difference between rate and equilibrium. Constructively ask about their evidence, respond to their reply and reflect/correct an initial own statement if needed. Retain an actual dialogue or moderator log.
Fresh variation: Partner now claims “a catalyst only speeds the forward reaction”: respond scientifically and constructively considering equilibrium.
  - Expected performance (DE): Beispiel Antwort: „Dein früher C-Wert zeigt eine höhere Annäherungsgeschwindigkeit. Für K brauchen wir die Gleichgewichtskonzentrationen; beide erreichen hier denselben C-Endwert. Welche A/B-Werte liegen dann vor?“ Rückfrage anerkennen: gleicher C-Wert allein braucht gleiche Bilanz/Volumen/Anfangsbedingungen; mit gegebenen Bedingungen unterstützt er gleiche Gleichgewichtslage. Eigene pauschale Aussage „Katalysatoren erzeugen mehr Produkt“ auf frühen Zeitpunkt begrenzen. Ein vorgeschriebener Beispiel-Dialog ersetzt keinen tatsächlichen Austausch.
Frischer Transfer: Fachliche Referenz für eine responsive Antwort: „Woran würdest du am Gleichgewicht erkennen, dass nur die Hinreaktion beschleunigt wird?“ Die tatsächliche Antwort aufnehmen. Ein geeigneter Katalysator ermöglicht einen alternativen Weg für Hin- und Rückrichtung. Würde bei gleichem Gleichgewicht nur eine Richtung dauerhaft schneller, entstünde ein Netto-Umsatz; das widerspräche gleicher Gleichgewichtslage. Gleiche Langzeitbedingungen und K bleiben, die Annäherung kann schneller sein. Die eigene Anfangsaussage „mehr Produkt“ auf den frühen Zeitpunkt einschränken bzw. eine richtige Aussage ausdrücklich anhand der Argumente beibehalten. Dies ist eine mögliche wissenschaftliche Reaktion, kein aufgezeichneter Dialog; tatsächliche Partnerantwort und eigene Folgeantwort müssen im Moderatorlog entstehen.
  - Expected performance (EN): Example reply: “Your early C value shows faster approach. For K we need equilibrium concentrations; both reach the same C endpoint here. What A/B values are then present?” Acknowledge the follow-up: equal C alone needs equal balance/volume/initial conditions; with the given conditions it supports the same equilibrium position. Restrict an own broad statement “catalysts make more product” to the early time. A prescribed example dialogue does not replace actual exchange.
Fresh transfer: Scientific reference for a responsive reply: “How would you recognise at equilibrium that only the forward reaction speeds up?” Receive the actual answer. A suitable catalyst permits an alternative pathway for forward and reverse directions. If only one direction remained faster at the same equilibrium, there would be net conversion, contradicting the unchanged equilibrium position. Equal long-time conditions and K remain; approach may be faster. Restrict an own initial “more product” statement to early time, or explicitly retain a correct statement from the arguments. This is a possible scientific response, not a recorded dialogue; actual partner reply and own follow-up must arise in the moderator log.
  - Understanding focus (DE): Theoriegestützte Erklärung, echter Austausch und eigene Standpunktreflexion bleiben drei beobachtbare Leistungen.
  - Understanding focus (EN): Theory-based explanation, actual exchange and own standpoint reflection remain three observable performances.
- `upper-scientific-discourse-conductivity-debate`
  - Task demand (DE): Führe einen fachlich konstruktiven Dialog: erkläre, argumentiere mit Kontrolle, höre/frage nach, reagiere auf eine echte Gegenfrage und überprüfe einen eigenen Standpunkt. Dokumentiere Beiträge getrennt nach Sprecher.
Frische Variation: Partner liefert neue Daten bei gleicher Temperatur: Prüfe die Evidenz und ändere deinen Standpunkt, wenn sie es trägt.
  - Task demand (EN): Conduct a scientifically constructive dialogue: explain, argue from the control, listen/ask, respond to an actual counter-question and review an own standpoint. Document contributions by speaker.
Fresh variation: Partner supplies new equal-temperature data: examine evidence and change your standpoint if supported.
  - Expected performance (DE): Kontrolle A35 ≈ B35 begrenzt Salzbehauptung, Temperatureffekt ist plausibel. Frage: „Vergleichen wir wirklich gleiche Temperaturen und Ionensorten?“ Partnerantwort aufnehmen und darauf antworten; bei eigener früherer Annahme gleicher Temperatur diese sichtbar korrigieren. Bei unbekannter Ionensorte reicht κ selbst temperaturgleich nicht für eindeutige NaCl-Menge. Modellantwort gibt fachliche Referenz, nicht einen erfundenen gelungenen Dialog.
Frischer Transfer: Frische offen synthetische Gesprächskarte: A und B bei 20 °C, gleiche bekannte Ionensorte/Matrix, geprüfte Standards, A=1800 und B=2100 µS/cm, Wiederholstreuung jeweils etwa ±3. Die alte Temperaturkonfundierung ist für diesen neuen Vergleich kontrolliert; 300 ist deutlich größer als die gegebene Streuung. Als Referenzantwort: „Damit nehme ich meine Temperaturerklärung für diese neue Differenz zurück. Unter geprüfter gleicher Matrix und passender Konzentrationskalibrierung spricht der Wert für mehr NaCl, bestimmt aber ohne Kalibrierung keine exakte Menge.“ Tatsächliche Partnerdaten zuerst auf ihre Bedingungen prüfen, Rückfrage stellen, Antwort aufnehmen und die eigene frühere Position ausdrücklich ändern/einschränken. Neue Karte ist keine echte Partnerreaktion oder Messung; ±3 ist keine Gesamtunsicherheit.
  - Expected performance (EN): A35 ≈ B35 control limits the salt claim; temperature effect is plausible. Ask: “Are we comparing equal temperatures and ion species?” Receive the partner’s answer and respond; visibly correct an earlier own equal-temperature assumption if present. For unknown ions even equal-temperature κ does not uniquely give NaCl amount. The reference gives scientific guidance, not an invented successful dialogue.
Fresh transfer: Fresh openly synthetic discussion card: A and B at 20 °C, the same known ion type/matrix, checked standards, A=1800 and B=2100 µS/cm, repeat scatter about ±3 each. The old temperature confound is controlled for this new comparison; 300 is much larger than the given scatter. Reference reply: “I withdraw my temperature explanation for this new difference. With checked equal matrix and appropriate concentration calibration this supports more NaCl, but without calibration does not determine its exact amount.” First inspect actual partner data for conditions, ask a follow-up, receive the reply and explicitly revise/restrict the own earlier position. The fresh card is no actual partner response or measurement; ±3 is not total uncertainty.
  - Understanding focus (DE): Eine fachlich tragfähige neue Bedingung verändert den eigenen Standpunkt; reale Wechselbeiträge bleiben erforderlich.
  - Understanding focus (EN): A scientifically sound new condition changes the own standpoint; actual exchanged contributions remain required.
## Page 10: Säure-Base-Eignung von Teilchenstrukturen erkennen

- Full learning-goal ID: `597ac03c-d25f-5c34-a87c-52c059c87295`
- Goal fingerprint: `sha256:138aa0f672f6dcbeff79b27e50aca652d4c0201df2a74589e0675a01d1c9d220`
- Page fingerprint: `sha256:098c16420728ed888cab2633efa69e0a74e2e1d5d9638282118409f5f718c0b9`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann in Formeldarstellungen strukturelle Voraussetzungen für die Eignung eines Teilchens als Säure oder Base erkennen.

### Visualization

/assets/goal-visualizations/chemie/597ac03c-d25f-5c34-a87c-52c059c87295/597ac03c-d25f-5c34-a87c-52c059c87295.jpg

- original digest: `sha256:c7bee3a32cfbeaf997ae8a66c2840e4109e92368512eb60e0e240744171b7412`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)
- Chemische Fach- und Symbolsprache ebenengerecht verwenden — `95dc0ee5-a0af-5682-af32-d66e36fbeb50` (outside this book)

### Direct reverse prerequisites outside this book

- Beeinflussung von Säure-Base-Reaktionen erklären — `9751b6d8-cde3-527b-b37c-babb6cee79d2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7d11bd1e9b863c1061058a6ccedb0c2a83952024a0511d0e7e681ad83266511b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Brønsted-Säure-Eignung verlangt ein unter den betrachteten Bedingungen abgebbares Proton, Base-Eignung ein protonenbindendes Elektronenpaar. Formalladung und H-Anzahl allein reichen nicht; geeignete Strukturen können amphoter handeln.
  - Essential understanding (EN): Brønsted acidity requires a proton that can be donated under the stated conditions, and basicity a proton-binding electron pair. Formal charge and hydrogen count alone are insufficient; suitable structures can act amphoterically.
  - Observable performance (DE): Das polarisierte H von HCl ist als abgebbares Proton geeignet; ein freies O-Elektronenpaar des Wassers bindet es: HCl + H2O → H3O+ + Cl−. Das freie N-Elektronenpaar ermöglicht NH3 die Protonenaufnahme: NH3 + H3O+ → NH4+ + H2O. NH3 ist dabei Base, H3O+ Säure. Es wandert ein Proton und kein neutrales H-Atom mit Elektron. Die Strukturprüfung ist stets an den Reaktionspartner und das Medium gebunden.
  - Observable performance (EN): Polarized H in HCl is suitable for proton donation; a water oxygen lone pair binds it: HCl + H2O → H3O+ + Cl−. The nitrogen lone pair permits proton acceptance by NH3: NH3 + H3O+ → NH4+ + H2O. NH3 acts as base and H3O+ as acid. A proton moves, not a neutral H atom with an electron. Structural suitability depends on the reaction partner and medium.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): HCl/NH3 anhand expliziter freier Elektronenpaare gegenüber H2O/CH4/Na+ im wässrigen Modell; strukturelle Eignung und Reaktionspartner. Die Brønsted-Grenze wird nicht mit einer Aussage verwechselt, dass Na+ niemals Lewis-Säure sein könne.
  - Essential understanding (EN): HCl/NH3 using explicit lone pairs versus H2O/CH4/Na+ in an aqueous model; structural suitability and reaction partners. The Brønsted boundary does not assert that Na+ can never act as a Lewis acid.
  - Observable performance (DE): Wasser kann mit seinem freien Elektronenpaar ein Proton aufnehmen oder ein O−H-Proton an eine geeignete Base abgeben: H3O+ bzw. OH− entstehen. CH4 hat zwar H-Atome, ist im gegebenen wässrigen Kontext aber kein wirksamer Protonendonator; H-Anzahl allein entscheidet nicht. Na+ besitzt kein Proton, das es als Brønsted-Säure abgeben könnte. Seine positive Ladung ersetzt die strukturelle Voraussetzung nicht. Wasser benötigt für die gewählte Funktion einen passenden Partner; Ampholyt ist keine Aussage über unbegrenzt starke Säure- und Basenwirkung.
  - Observable performance (EN): Water can accept a proton through a lone pair or donate an O−H proton to a suitable base, forming H3O+ or OH−. CH4 contains hydrogen but is not an effective proton donor in the specified aqueous context; hydrogen count alone does not decide. Na+ has no proton to donate as a Brønsted acid, so positive charge does not replace the structural requirement. Water needs an appropriate partner for the selected role; amphoterism does not imply unlimited acid and base strength.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: HCl/NH3 anhand expliziter freier Elektronenpaare gegenüber H2O/CH4/Na+ im wässrigen Modell; strukturelle Eignung und Reaktionspartner. / HCl/NH3 using explicit lone pairs versus H2O/CH4/Na+ in an aqueous model; structural suitability and reaction partners.
- `model-boundary`: Die Brønsted-Grenze wird nicht mit einer Aussage verwechselt, dass Na+ niemals Lewis-Säure sein könne. / The Brønsted boundary does not assert that Na+ can never act as a Lewis acid.

**Application cases**

- `chem-next20-597ac03c-case-1`
  - Task demand (DE): Gegebene Formeldarstellungen: H−Cl mit polarisierter Bindung Hδ+−Clδ−; NH3 mit drei N−H-Bindungen und einem freien N-Elektronenpaar; H2O mit zwei O−H-Bindungen und zwei freien O-Elektronenpaaren. Betrachtet werden Protonenübertragungen in Wasser, keine Lewis-Metallkomplexierung. Markiere die für Säure-/Base-Eignung relevanten Strukturelemente und formuliere HCl + H2O sowie NH3 + H3O+ mit korrekten Produkten und Ladungen.
  - Task demand (EN): Supplied formulas: H−Cl polarized as Hδ+−Clδ−; NH3 with three N−H bonds and one nitrogen lone pair; H2O with two O−H bonds and two oxygen lone pairs. Proton transfer in water is considered, not Lewis metal coordination. Identify structural features relevant to acid/base behavior and write HCl + H2O and NH3 + H3O+ with correct products and charges.
  - Expected performance (DE): Das polarisierte H von HCl ist als abgebbares Proton geeignet; ein freies O-Elektronenpaar des Wassers bindet es: HCl + H2O → H3O+ + Cl−. Das freie N-Elektronenpaar ermöglicht NH3 die Protonenaufnahme: NH3 + H3O+ → NH4+ + H2O. NH3 ist dabei Base, H3O+ Säure. Es wandert ein Proton und kein neutrales H-Atom mit Elektron. Die Strukturprüfung ist stets an den Reaktionspartner und das Medium gebunden.
  - Expected performance (EN): Polarized H in HCl is suitable for proton donation; a water oxygen lone pair binds it: HCl + H2O → H3O+ + Cl−. The nitrogen lone pair permits proton acceptance by NH3: NH3 + H3O+ → NH4+ + H2O. NH3 acts as base and H3O+ as acid. A proton moves, not a neutral H atom with an electron. Structural suitability depends on the reaction partner and medium.
  - Understanding focus (DE): Freies Elektronenpaar bedeutet Brønsted-Protonenaufnahmefähigkeit, nicht automatisch hohe Basenstärke in jedem Medium.
  - Understanding focus (EN): A lone pair supports Brønsted proton acceptance, not automatically strong basicity in every medium.
- `chem-next20-597ac03c-case-2`
  - Task demand (DE): Frischer Fall: H2O besitzt O−H-Bindungen und freie O-Elektronenpaare. CH4 besitzt nur vier wenig polare C−H-Bindungen und am C kein freies Elektronenpaar. Na+ besitzt kein abgebbares H; Lewis-Acidität von Metallkationen ist ausdrücklich nicht Gegenstand. Betrachtet werden typische wässrige Brønsted-Reaktionen. Erkläre die Ampholyt-Eignung von Wasser und widerlege „Jedes H-haltige Teilchen ist in Wasser eine wirksame Säure“ sowie „Jedes positive Ion ist eine Brønsted-Säure“.
  - Task demand (EN): Fresh case: H2O has O−H bonds and oxygen lone pairs. CH4 has four weakly polarized C−H bonds and no carbon lone pair. Na+ has no hydrogen to donate; Lewis acidity of metal cations is explicitly excluded. Typical aqueous Brønsted reactions are considered. Explain why water can be amphoteric and refute “Every H-containing particle is an effective aqueous acid” and “Every positive ion is a Brønsted acid.”
  - Expected performance (DE): Wasser kann mit seinem freien Elektronenpaar ein Proton aufnehmen oder ein O−H-Proton an eine geeignete Base abgeben: H3O+ bzw. OH− entstehen. CH4 hat zwar H-Atome, ist im gegebenen wässrigen Kontext aber kein wirksamer Protonendonator; H-Anzahl allein entscheidet nicht. Na+ besitzt kein Proton, das es als Brønsted-Säure abgeben könnte. Seine positive Ladung ersetzt die strukturelle Voraussetzung nicht. Wasser benötigt für die gewählte Funktion einen passenden Partner; Ampholyt ist keine Aussage über unbegrenzt starke Säure- und Basenwirkung.
  - Expected performance (EN): Water can accept a proton through a lone pair or donate an O−H proton to a suitable base, forming H3O+ or OH−. CH4 contains hydrogen but is not an effective proton donor in the specified aqueous context; hydrogen count alone does not decide. Na+ has no proton to donate as a Brønsted acid, so positive charge does not replace the structural requirement. Water needs an appropriate partner for the selected role; amphoterism does not imply unlimited acid and base strength.
  - Understanding focus (DE): Die Brønsted-Grenze wird nicht mit einer Aussage verwechselt, dass Na+ niemals Lewis-Säure sein könne.
  - Understanding focus (EN): The Brønsted boundary does not assert that Na+ can never act as a Lewis acid.
## Page 11: Reduzierende Kohlenhydrate und Glucose nachweisen

- Full learning-goal ID: `96d33fb6-ed14-50ab-b5c7-5ce0559d518a`
- Goal fingerprint: `sha256:ff4b5f2fb585a6a8fa3d4d30d2bd7ecc658cc65012a3f801d7f3fa83c45620d3`
- Page fingerprint: `sha256:81cc681e1071a57f8698d79d6dcdf153bc19b47b2ee3290978bb1bb19d1fa1f9`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewählte Nachweise für reduzierende Kohlenhydrate und für Glucose durchführen, auswerten und ihre unterschiedliche Aussagekraft anhand von Molekülstruktur und Enzymwirkung erklären.

### Visualization

/assets/goal-visualizations/chemie/96d33fb6-ed14-50ab-b5c7-5ce0559d518a/96d33fb6-ed14-50ab-b5c7-5ce0559d518a.png

- original digest: `sha256:fae7aa63c39e3debf1e06870a69b6283e013d6d0a96d96068a768d99fee3d351`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Reduzierende Kohlenhydrate nachweisen und erklären — `1d2e7b80-653d-57b8-a284-8ede5a353b73` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Naturstoffe – Kursauswahl — `0f0c6c98-13dc-5347-ac95-5b50c9c17bb6` (outside this book)
- Lernkarten - Naturstoffe — `31148286-b8db-57a7-8da2-2e0479240a2c` (outside this book)
- Zucker- und Glucosenachweise: Merkmale abrufen — `87d01187-21b5-59c3-8b9a-e8fd584afbd2` (outside this book)
- Reduzierende Zucker und Glucose betreut nachweisen — `994068b1-d8f2-5c18-ae36-808f3fa4f52f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:acfd0763fc1cb3d9259ee0461a4724ccb12f641ab41827aaa9a38dd1bd6aef3d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Reduktionsnachweise und enzymatische Glucosenachweise beantworten verschiedene analytische Fragen.
  - Essential understanding (EN): Reducing assays and enzymatic glucose assays answer different analytical questions.
  - Observable performance (DE): Reduzierendes Material ist angezeigt; ein positiver Benedictbefund identifiziert nicht Glucose. GOD ist im festgelegten Verfahren glucosespezifischer; Nachweisgrenze/Interferenz bleiben zu beachten.
  - Observable performance (EN): Reducing material is indicated; Benedict positivity does not identify glucose. GOD is more glucose-specific in the stated procedure; detection limits/interference remain relevant.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Maltose ist vorher reduzierend, Saccharose erst nach Hydrolyse positiv aufgrund zugänglicher Monosaccharide. Säurebehandlung wird vor alkalischem Test passend kontrolliert; Planung allein belegt keine Durchführung.
  - Observable performance (EN): Maltose reduces before, sucrose after hydrolysis due to accessible monosaccharides. Acid treatment needs appropriate control before alkaline testing; planning alone does not prove execution.
- `execution`
  - Essential understanding (DE): Ausführenundunterschiedliche Nachweisleistungvergleichen.
  - Essential understanding (EN): Execute and compare assay peRformance.
  - Observable performance (DE): Benedictkann Glucose/Fructosezeigen, GODnur Glucose imgeeigneten Messbereich. Positive/negative Kontrollentrennen Reagenzfehler; CuII→CuI/Reduktionsvermögen versus Enzymspezifität; Verdünnungfalls GOD-Skalaüberschritten.
  - Observable performance (EN): Benedict can indicate glucose/fructose; GOD specifically glucose within detection range. Controls separate reagent failure; Cu(II)/Cu(I) reducing behaviour versus enzyme specificity; dilute if GOD scale exceeded.

**Coverage expectations**

- required expectations: `structure-and-evidence`, `fresh-transfer`, `execution`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-a`
  - Task demand (DE): Ein Modellprotokoll zeigt Benedict positiv, GOD negativ; Vergleichsproben reagieren erwartungsgemäß. Was ist über reduzierende Zucker und Glucose belegt?
  - Task demand (EN): A model record shows Benedict positive, GOD negative, with valid controls. What is established about reducing sugars and glucose?
  - Expected performance (DE): Reduzierendes Material ist angezeigt; ein positiver Benedictbefund identifiziert nicht Glucose. GOD ist im festgelegten Verfahren glucosespezifischer; Nachweisgrenze/Interferenz bleiben zu beachten.
  - Expected performance (EN): Reducing material is indicated; Benedict positivity does not identify glucose. GOD is more glucose-specific in the stated procedure; detection limits/interference remain relevant.
  - Understanding focus (DE): Reduktionsnachweise und enzymatische Glucosenachweise beantworten verschiedene analytische Fragen.
  - Understanding focus (EN): Reducing assays and enzymatic glucose assays answer different analytical questions.
- `case-b-transfer`
  - Task demand (DE): Plane im freigegebenen Schullabor einen Vergleich von Maltose und Saccharose vor/nach Hydrolyse; erläutere erwartete reduzierende Befunde und notwendige Kontrollen.
  - Task demand (EN): Plan an authorised school-lab comparison of maltose and sucrose before/after hydrolysis; explain expected reducing results and controls.
  - Expected performance (DE): Maltose ist vorher reduzierend, Saccharose erst nach Hydrolyse positiv aufgrund zugänglicher Monosaccharide. Säurebehandlung wird vor alkalischem Test passend kontrolliert; Planung allein belegt keine Durchführung.
  - Expected performance (EN): Maltose reduces before, sucrose after hydrolysis due to accessible monosaccharides. Acid treatment needs appropriate control before alkaline testing; planning alone does not prove execution.
  - Understanding focus (DE): Reduktionsnachweise und enzymatische Glucosenachweise beantworten verschiedene analytische Fragen.
  - Understanding focus (EN): Reducing assays and enzymatic glucose assays answer different analytical questions.
- `execution-1`
  - Task demand (DE): Führe betreut einen Vergleich Glucose/Fructose/Wasser aus: je2mL1%Lösung. Benedict: je2mLbereitgestelltes Benedictreagenz, 5min80°C-Wasserbad. Parallel GOD-QUANTOFIX2seintauchen, abschütteln, 30sabwarten, Skalavergleichen. Protokolliere Zeit/Temperatur/Befunde undbegründe Selektivität.
  - Task demand (EN): Execute supervised glucose/fructose/water comparison: 2mL1%solutions. Benedict: add2ml provided reagent, 5min80°C water bath. Parallel QUANTOFIX GOD dip2s, shake off, wait30s, compare scale. Log time/temperature/findings, explaining selectivity.
  - Expected performance (DE): Benedictkann Glucose/Fructosezeigen, GODnur Glucose imgeeigneten Messbereich. Positive/negative Kontrollentrennen Reagenzfehler; CuII→CuI/Reduktionsvermögen versus Enzymspezifität; Verdünnungfalls GOD-Skalaüberschritten.
  - Expected performance (EN): Benedict can indicate glucose/fructose; GOD specifically glucose within detection range. Controls separate reagent failure; Cu(II)/Cu(I) reducing behaviour versus enzyme specificity; dilute if GOD scale exceeded.
  - Understanding focus (DE): Ausführenundunterschiedliche Nachweisleistungvergleichen.
  - Understanding focus (EN): Execute and compare assay peRformance.
## Page 12: Aldehyd- und Keton-Nachweise durchführen und deuten

- Full learning-goal ID: `973c12d9-d863-5292-8c68-9c80cdacf9e2`
- Goal fingerprint: `sha256:78a8148fa4f3fedf0e67de25bec42046482d83524c0f25e5f8e1522e866689b6`
- Page fingerprint: `sha256:07de8a3d065301ee5cc7fd51c688c52450eb3ec44fa659ca9c90c092690061cc`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann geeignete Nachweisreaktionen zur Unterscheidung von Aldehyden und Ketonen durchführen und deuten.

### Visualization

/assets/goal-visualizations/chemie/973c12d9-d863-5292-8c68-9c80cdacf9e2/973c12d9-d863-5292-8c68-9c80cdacf9e2.png

- original digest: `sha256:55a0215cb181abd7a07887b4e9beb531a4c59cf97f31d1f093dc1c8a2b348769`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Zucker strukturbezogen vergleichen — `68292f39-04e7-5924-b6a5-731c7f7f82ee` (page 13)

### Prerequisites outside this book

- Oxidationsprodukte von Alkanolen erklären — `5851b53a-162b-5c17-9269-510ee54ad846` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Propanal und Propanon praktisch nachweisen und unterscheiden — `27045f71-10ed-57d3-ac99-cfbe5d6b515a` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Aldehyd-/Keton- und Halogenidnachweise: Merkmale abrufen — `567b5b63-8cc5-562f-85d1-13e2bbda9b54` (outside this book)
- Fehling- und Tollens-Probe: typische Befunde abrufen — `fbe14075-5bc8-5ecb-be5b-34d5f1ccc439` (outside this book)
- Funktionelle Gruppen qualitativ nachweisen — `3de28598-672f-5753-8a45-8f559c2f9dc2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:13cd7b625a4116a2155eebe0b2824b70b564f31eee564cde239668d86b1ed006`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `structure-model-reasoning`
  - Essential understanding (DE): Die Fehling-Probe nutzt die reduzierende Wirkung geeigneter Aldehyde: Kupfer(II) wird unter vorgegebenen Bedingungen zu Cu2O reduziert; einfache Ketone verhalten sich anders.
  - Essential understanding (EN): Fehling testing uses suitable aldehyde reducing activity: copper(II) is reduced to Cu2O under specified conditions; simple ketones behave differently.
  - Observable performance (DE): Für den praktischen Leistungsanteil muss die Person eine tatsächlich beaufsichtigte Durchführung nach einem konkret lokal freigegebenen Lehrkraftprotokoll zeigen: freigegebene Nachweisbedingungen einhalten, Ethanal-/Propanon-Vergleich und Blindkontrolle angemessen behandeln, eigene tatsächliche Beobachtungen getrennt von der Deutung dokumentieren und Aldehydoxidation/Cu(II)-Reduktion begründen. Die beiden fiktiven Papierfälle reichen für diesen praktischen Nachweis nicht aus. Dieser Vertrag verlangt künftige beobachtbare Leistung; er behauptet keine bereits erfolgte Durchführung, menschliche Freigabe oder Erprobung.
  - Observable performance (EN): For the practical performance component, the learner must show actual supervised execution following a specific locally approved teacher protocol: follow its approved test conditions, appropriately handle ethanal/propanone comparison and a blank, document their own actual observations separately from interpretation and justify aldehyde oxidation/Cu(II) reduction. The two fictional paper cases do not suffice for this practical evidence. This contract requires future observable performance; it claims no prior execution, human approval or trial.
- `fresh-application-and-boundary`
  - Essential understanding (DE): Eine positive Fehling-Probe beweist bei beliebigen Gemischen nicht eindeutig einen einfachen Aldehyd; eine Papierdeutung beweist keine tatsächlich ausgeführte Experimentierkompetenz.
  - Essential understanding (EN): A positive Fehling test in arbitrary mixtures does not uniquely prove a simple aldehyde; paper interpretation does not establish actually demonstrated experimental competence.
  - Observable performance (DE): Positiv belegt hier eine reduzierende Wirkung unter den gegebenen Bedingungen, nicht die Identität Ethanal. Kontrollen und weitere selektive Information über Zusammensetzung/Struktur sind nötig; die Störstoffwarnung verhindert die eindeutige Aldehyd-Keton-Zuordnung im Gemisch. Eine bei reinen einfachen Vergleichsstoffen tragfähige Entscheidung wird nicht uneingeschränkt auf Gemische übertragen.
  - Observable performance (EN): Positive testing establishes reducing activity under the stated conditions, not ethanal identity. Controls and additional selective composition/structure information are needed; the interference warning prevents unique aldehyde/ketone assignment in the mixture. A decision valid for simple pure comparison substances is not transferred unrestrictedly to mixtures.

**Coverage expectations**

- required expectations: `structure-model-reasoning`, `fresh-application-and-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-variation`: Bekannter Aldehyd/Keton, positive und negative Kontrollen, unbekanntes Gemisch mit vorgegebener Störstoffwarnung. / Known aldehyde/ketone, positive and negative controls, unknown mixture with a supplied interference warning.
- `counterexample`: Eine positive Fehling-Probe beweist bei beliebigen Gemischen nicht eindeutig einen einfachen Aldehyd; eine Papierdeutung beweist keine tatsächlich ausgeführte Experimentierkompetenz. / A positive Fehling test in arbitrary mixtures does not uniquely prove a simple aldehyde; paper interpretation does not establish actually demonstrated experimental competence.

**Application cases**

- `chem-current15-973c12d9-case-1`
  - Task demand (DE): Fiktiver schulischer Nachweisfall; für eine tatsächliche Durchführung wäre ein gesondert freigegebenes Lehrkraftprotokoll nötig. Ethanal als Positivkontrolle, Propanon als Ketonvergleich, Blindansatz. Alle Ansätze werden nach demselben Lehrkraftprotokoll behandelt. Ethanal zeigt ziegelrotes Cu2O, Propanon und Blindansatz nicht. Keine Konzentrationen, Temperaturen oder private Durchführung werden vorgegeben. Erkläre Kontrollwahl, passende Durchführung nach Freigabe und fachliche Deutung; skizziere die Oxidation des Aldehyds und Reduktion des Kupfers. Der praktische Leistungsanteil muss später gesondert als tatsächliche beaufsichtigte Durchführung nach einem konkret lokal freigegebenen Lehrkraftprotokoll mit eigenen Beobachtungen gezeigt werden; erläutere, welche eigene Ausführung und Dokumentation dafür erforderlich sind. Die hier angegebenen Papierbeobachtungen erfüllen diesen Anteil nicht.
  - Task demand (EN): Fictional school test case; actual execution would require a separately approved teacher protocol. Ethanal positive control, propanone ketone comparison and blank. All follow the same teacher protocol. Ethanal yields brick-red Cu2O; propanone and blank do not. No concentrations, temperatures or private procedure are supplied. Explain controls, appropriate approved execution and interpretation; sketch aldehyde oxidation and copper reduction. The practical performance component must later be shown separately through actual supervised execution of a specific locally approved teacher protocol with independently observed results; explain what own execution and documentation this requires. The supplied paper observations do not fulfil this component.
  - Expected performance (DE): Ethanal wird in alkalischem Medium zu Ethanoat oxidiert, Cu(II) zu Cu(I) im Cu2O reduziert. Der Blindansatz prüft Eigenreaktion/Kontamination; der einfache Ketonvergleich zeigt keine gleiche reduzierende Wirkung. Eine spätere tatsächliche Durchführung muss unter dem freigegebenen Lehrkraftprotokoll mit eigener Beobachtung dokumentiert werden. Für den praktischen Anteil müssen die eigene beaufsichtigte Ausführung, die angemessene Behandlung des Vergleichs und der Kontrollen sowie tatsächlich selbst dokumentierte Beobachtungen nach dem konkret lokal freigegebenen Protokoll nachgewiesen werden. Erläuterung und fiktive Papierdaten allein genügen nicht. Weder ein solches heutiges Protokoll noch eine bereits erfolgte Durchführung wird durch dieses Material behauptet.
  - Expected performance (EN): Ethanal is oxidized to ethanoate in alkaline medium, Cu(II) reduced to Cu(I) in Cu2O. The blank tests background reaction/contamination; the simple ketone control does not show the same reducing behaviour. Later actual execution must follow the approved teacher protocol and document independent observation. The practical component requires demonstrated own supervised execution, appropriate handling of the comparison and controls, and actual independently documented observations following the specific locally approved protocol. Explanation and fictional paper data alone are insufficient. This material claims neither such a currently approved protocol nor a prior actual execution.
  - Understanding focus (DE): Die hier gelieferten fiktiven Beobachtungen ersetzen diesen praktischen Leistungsanteil nicht; kein Lernender wird als experimentell erfolgreich behauptet.
  - Understanding focus (EN): The fictional observations do not replace the practical performance component; no learner is claimed experimentally successful.
- `chem-current15-973c12d9-case-2`
  - Task demand (DE): Frischer unbekannter Lebensmittelmix zeigt im fiktiven Protokoll ebenfalls Cu2O. Der Materialhinweis sagt ausdrücklich: Reduzierende Zucker und bestimmte andere Stoffe können unter Testbedingungen ebenfalls positiv reagieren. Beurteile die Schlussfolgerung, die Probe sei sicher Ethanal; formuliere einen begrenzten Befund und eine passende Kontroll-/Zusatzprüfung.
  - Task demand (EN): A fresh unknown food mixture also gives Cu2O in the fictional protocol. The material note explicitly states: reducing sugars and certain other substances may also test positive. Evaluate the conclusion that the sample is certainly ethanal; state a bounded finding and an appropriate control/additional test.
  - Expected performance (DE): Positiv belegt hier eine reduzierende Wirkung unter den gegebenen Bedingungen, nicht die Identität Ethanal. Kontrollen und weitere selektive Information über Zusammensetzung/Struktur sind nötig; die Störstoffwarnung verhindert die eindeutige Aldehyd-Keton-Zuordnung im Gemisch.
  - Expected performance (EN): Positive testing establishes reducing activity under the stated conditions, not ethanal identity. Controls and additional selective composition/structure information are needed; the interference warning prevents unique aldehyde/ketone assignment in the mixture.
  - Understanding focus (DE): Eine bei reinen einfachen Vergleichsstoffen tragfähige Entscheidung wird nicht uneingeschränkt auf Gemische übertragen.
  - Understanding focus (EN): A decision valid for simple pure comparison substances is not transferred unrestrictedly to mixtures.
## Page 13: Zucker strukturbezogen vergleichen

- Full learning-goal ID: `68292f39-04e7-5924-b6a5-731c7f7f82ee`
- Goal fingerprint: `sha256:1e44fd0c3738901060390931258baa809e400be37e85cc73a3d9401ac4320d52`
- Page fingerprint: `sha256:7fc30de7f80baf27191a42c3702e061e88b08b762249746a41c9a5ecdefcb4f8`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewählte Zucker anhand ihres molekularen Baus vergleichen und daraus ihr chemisches Reaktionsverhalten begründen.

### Visualization

/assets/goal-visualizations/chemie/68292f39-04e7-5924-b6a5-731c7f7f82ee/68292f39-04e7-5924-b6a5-731c7f7f82ee.png

- original digest: `sha256:962a90624a2b7b2203bce57757cce401d6ef6b0627348723e6a53738a70d393e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Aldehyd- und Keton-Nachweise durchführen und deuten — `973c12d9-d863-5292-8c68-9c80cdacf9e2` (page 12)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Zucker in Alltag und Ernährung bewerten — `127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:635972c7efa540e2ec137b7d32d1bfbed3ead2fb2403ec4304b521b817de4605`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Das freie anomere Zentrum bestimmt Reduktionsfähigkeit; Testbedingungen und Umlagerung zählen.
  - Essential understanding (EN): A free anomeric centre governs reducing behaviour; conditions and rearrangements matter.
  - Observable performance (DE): Maltose besitzt ein freies anomeres Zentrum; in Saccharose sind beide anomeren Zentren gebunden. Der Unterschied begründet verschiedene Befunde, nicht bloß die Zahl der Zuckerbausteine.
  - Observable performance (EN): Maltose has a free anomeric centre; both are bound in sucrose. This explains different results, not merely the count of sugar units.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Unter alkalischen Bedingungen kann Keto-Enol-Umlagerung zu Aldosen auftreten. Reaktionsbedingungen und zugängliche Carbonylformen werden berücksichtigt.
  - Observable performance (EN): Alkaline conditions allow keto-enol rearrangement to aldoses. Conditions and accessible carbonyl forms must be considered.

**Coverage expectations**

- required expectations: `structure-and-evidence`, `fresh-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-and-conditions`: Material, Stoffstruktur, Messbedingung oder Bewertungsdossier wechseln wie in den zwei ausdrücklich ausgearbeiteten Fällen; quantitative Angaben sind synthetische Aufgabenwerte. / Material, molecular structure, measurement conditions or evaluation dossier vary as explicitly specified in the two worked cases; numerical values are synthetic task data.

**Application cases**

- `case-a`
  - Task demand (DE): Vergleiche Maltose und Saccharose anhand vollständig bereitgestellter Strukturformeln im reduzierenden Nachweis.
  - Task demand (EN): Compare maltose and sucrose in a reducing assay using complete supplied structures.
  - Expected performance (DE): Maltose besitzt ein freies anomeres Zentrum; in Saccharose sind beide anomeren Zentren gebunden. Der Unterschied begründet verschiedene Befunde, nicht bloß die Zahl der Zuckerbausteine.
  - Expected performance (EN): Maltose has a free anomeric centre; both are bound in sucrose. This explains different results, not merely the count of sugar units.
  - Understanding focus (DE): Das freie anomere Zentrum bestimmt Reduktionsfähigkeit; Testbedingungen und Umlagerung zählen.
  - Understanding focus (EN): A free anomeric centre governs reducing behaviour; conditions and rearrangements matter.
- `case-b-transfer`
  - Task demand (DE): Eine Fructoselösung reagiert bei alkalischem Reduktionstest positiv. Begründe, warum eine Ketose nicht automatisch negativ sein muss.
  - Task demand (EN): Fructose gives a positive alkaline reducing test. Explain why a ketose need not be negative.
  - Expected performance (DE): Unter alkalischen Bedingungen kann Keto-Enol-Umlagerung zu Aldosen auftreten. Reaktionsbedingungen und zugängliche Carbonylformen werden berücksichtigt.
  - Expected performance (EN): Alkaline conditions allow keto-enol rearrangement to aldoses. Conditions and accessible carbonyl forms must be considered.
  - Understanding focus (DE): Das freie anomere Zentrum bestimmt Reduktionsfähigkeit; Testbedingungen und Umlagerung zählen.
  - Understanding focus (EN): A free anomeric centre governs reducing behaviour; conditions and rearrangements matter.
## Page 14: Azofarbstoff-Synthese mechanistisch darstellen

- Full learning-goal ID: `981242bb-a729-5701-b02d-c2f7f489e5af`
- Goal fingerprint: `sha256:0be58bf33fa05f1b9682c236c8120bed257db35e3ea4b8d6333364670b55d5e4`
- Page fingerprint: `sha256:c108655914979988b890c67d46906750535f669c4252cbc0d93301d402f53b13`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die vollständige Syntheseroute eines Azofarbstoffs aus einem aromatischen primären Amin über Diazotierung und anschließende Azokupplung auf Teilchenebene mechanistisch darstellen und den Bindungsaufbau sowie die Atom- und Ladungsbilanz erklären.

### Visualization

/assets/goal-visualizations/chemie/981242bb-a729-5701-b02d-c2f7f489e5af/981242bb-a729-5701-b02d-c2f7f489e5af.png

- original digest: `sha256:a004f7bd97c3589e14c4585847b6451a9913eab1a6b71b3a9187c31f7b75c8bd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Elektrophile Substitution am Aromaten modellieren — `17ab1148-7383-5cab-8b91-73aff795f1e4` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Azofarbstoff-Synthese mechanistisch darstellen — `540a050a-0a38-5d8d-9f6b-997509a1f8e0` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b32e5f8cffd0b2d68e62922f40d6f4209780f2d4996b8d1994003cc617e0437b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.
  - Essential understanding (EN): Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.
  - Observable performance (DE): Stellt den begrenzten Diazotierungsweg mit Bilanz sowie den Kupplungsmechanismus aus den ausdrücklich gegebenen Zwischenstufen dar.
  - Observable performance (EN): Represents the bounded diazotization route and balance, then coupling, using the explicitly supplied intermediates.

**Coverage expectations**

- required expectations: `e1`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Aromatisches primäres Amin und Kupplungspartner / Aromatic primary amine and coupling partner
- `v2`: Elektronenpaarfluss, Ladungsbilanz und verfügbarer Donor / Electron-pair flow, charge balance and available donor

**Application cases**

- `981242bb-case-1`
  - Task demand (DE): Nur Papiermechanismen, keine Ausführung. Azo: [Ph–N≡N]⁺ und C₆H₅OH unter Bedingungen mit aktivem Phenol; das Produkt ist para-HO–C₆H₄–N=N–Ph. Vorgeschaltete Diazotierung im Papiermodell: Ar_D=Ph; Ar_D–NH₂ + HNO₂ in wässriger Säure bei0–5 °C. NO⁺ bezeichnet das nitrosierende Elektrophil. Die Zwischenstufen Ar_D–NH–N=O und Ar_D–N=N–OH sind als Strukturhilfen gegeben; einzelne Protonenübertragungen dürfen zu Sammelschritten zusammengefasst werden. Ar_D steht für den unveränderten Arylrest. Keine dirigierenden Effekte oder praktischen Ausführungsschritte werden zusätzlich geprüft.
1. Ergänze vor der Kupplung die Diazotierung auf Teilchenebene: beschreibe den Elektronenpaarfluss beim Angriff des Aminostickstoffs auf NO⁺, ordne die gegebenen N-N-Zwischenstufen bis zum Diazoniumion und erkläre die Rolle der Säure und der Wasserabspaltung. Formuliere die Gesamtgleichung mit Ar_D–NH₂, HNO₂ und H⁺ und prüfe Atom- und Gesamtladungsbilanz. Vollständige Einzelpfeile für jede Protonenübertragung sind nicht gefordert.
2. Stelle für die Azokupplung Elektronenpaarpfeile vom Ring zum terminalen Diazoniumnitrogen, die Verringerung von N≡N zu N=N, den σ-Komplex und die rearomatisierende Protonenabgabe dar; bilanziere die Gesamtladung.
  - Task demand (EN): Paper mechanisms only, no execution. Azo: Ph–N≡N⁺ and C₆H₅OH under conditions with reactive phenol; the product is para-HO–C₆H₄–N=N–Ph. Preceding diazotization in the paper model: Ar_D=Ph; Ar_D–NH₂ + HNO₂ in aqueous acid at0–5 °C. NO⁺ denotes the nitrosating electrophile. Ar_D–NH–N=O and Ar_D–N=N–OH are supplied structural guides; individual proton transfers may be grouped. Ar_D is the unchanged aryl group. No extra directing-effect or practical-execution requirement is assessed.
1. Complete diazotization before coupling at particle level: describe electron-pair flow when amino nitrogen attacks NO⁺, order the supplied N-N intermediates up to the diazonium ion, and explain acid and water-loss roles. Write the overall equation using Ar_D–NH₂, HNO₂ and H⁺ and check atom and net-charge balance. Separate arrows for every proton transfer are not required.
2. Show electron-pair arrows from the ring to terminal diazonium nitrogen, reduction of N≡N to N=N, the sigma complex and rearomatizing proton loss; balance overall charge.
  - Expected performance (DE): 1. Ein verfügbares N-Elektronenpaar des neutralen Aminanteils greift das N des nitrosierenden NO⁺ an und bildet die N-N-Bindung. Nach Protonenübertragung/Deprotonierung liegt Ar_D–NH–N=O vor; Protonenumlagerung ergibt Ar_D–N=N–OH. Säure ermöglicht die Bildung des Nitrosierungsreagenzes und protoniert die OH-Gruppe zu einer Wasserabgangsgruppe. Wasserabspaltung und Bildung der N≡N-Bindung ergeben [Ar_D–N≡N]⁺. Gesamt: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Außer dem unveränderten Ar_D stehen links wie rechts2 N,2 O und4 H; Gesamtladung jeweils+1. Diese verkürzte Teilchenfolge genügt hier; sie ist kein vollständiges Protonenübertragungsnetz und keine Versuchsaufzeichnung.
2. Ein Ring-π-Paar greift das terminale N von Ph–N≡N⁺ an; ein N≡N-π-Paar wird auf das an Ph gebundene N verschoben. Es entsteht ein positiv geladener Ring-σ-Komplex mit Ph–N=N–C-Bindung. Eine Base nimmt H⁺ am angegriffenen C ab; das C–H-Paar stellt die Ring-π-Bindung wieder her. PhN₂⁺ + C₆H₅OH → Ph–N=N–C₆H₄–OH + H⁺: +1 auf beiden Seiten.
  - Expected performance (EN): 1. An available N lone pair of the neutral amine fraction attacks nitrogen of nitrosating NO⁺ and forms the N-N bond. Proton transfer/deprotonation gives Ar_D–NH–N=O; proton rearrangement gives Ar_D–N=N–OH. Acid enables formation of the nitrosating reagent and protonates OH into a water leaving group. Water loss and formation of N≡N give [Ar_D–N≡N]⁺. Overall: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Apart from unchanged Ar_D, both sides contain2 N,2 O and4 H; net charge is+1 on both sides. This abbreviated particle sequence is sufficient here; it is neither a complete proton-transfer network nor an experiment record.
2. A ring pi pair attacks the terminal N of Ph–N≡N⁺; one N≡N pi pair moves onto the N bound to Ph. This gives a positively charged ring sigma complex with a Ph–N=N–C bond. A base removes H⁺ at the attacked carbon; its C–H pair restores the ring pi bond. PhN₂⁺ + C₆H₅OH → Ph–N=N–C₆H₄–OH + H⁺ has +1 on both sides.
  - Understanding focus (DE): Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.
  - Understanding focus (EN): Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.
- `981242bb-case-2`
  - Task demand (DE): Papiermodell: p-NO₂–C₆H₄–N₂⁺ koppelt an N,N-Dimethylanilin para zum Aminodonor. Gegenionen sind Zuschauer; keine Stoffe werden hergestellt. Vorgeschaltete Diazotierung im Papiermodell: Ar_D=p-NO₂–C₆H₄; Ar_D–NH₂ + HNO₂ in wässriger Säure bei0–5 °C. NO⁺ bezeichnet das nitrosierende Elektrophil. Die Zwischenstufen Ar_D–NH–N=O und Ar_D–N=N–OH sind als Strukturhilfen gegeben; einzelne Protonenübertragungen dürfen zu Sammelschritten zusammengefasst werden. Ar_D steht für den unveränderten Arylrest. Keine dirigierenden Effekte oder praktischen Ausführungsschritte werden zusätzlich geprüft.
1. Ergänze vor der Kupplung die Diazotierung auf Teilchenebene: beschreibe den Elektronenpaarfluss beim Angriff des Aminostickstoffs auf NO⁺, ordne die gegebenen N-N-Zwischenstufen bis zum Diazoniumion und erkläre die Rolle der Säure und der Wasserabspaltung. Formuliere die Gesamtgleichung mit Ar_D–NH₂, HNO₂ und H⁺ und prüfe Atom- und Gesamtladungsbilanz. Vollständige Einzelpfeile für jede Protonenübertragung sind nicht gefordert.
2. Zeichne den Azokupplungsmechanismus mit Elektronenpaarpfeilen, N=N-Verknüpfung, σ-Komplex-Ladung und Deprotonierung; erkläre, warum vollständige Protonierung des Aminodonors die Kupplung erschwert.
  - Task demand (EN): Paper model: p-NO₂–C₆H₄–N₂⁺ couples to N,N-dimethylaniline para to its amino donor. Counterions are spectators; no substances are made. Preceding diazotization in the paper model: Ar_D=p-NO₂–C₆H₄; Ar_D–NH₂ + HNO₂ in aqueous acid at0–5 °C. NO⁺ denotes the nitrosating electrophile. Ar_D–NH–N=O and Ar_D–N=N–OH are supplied structural guides; individual proton transfers may be grouped. Ar_D is the unchanged aryl group. No extra directing-effect or practical-execution requirement is assessed.
1. Complete diazotization before coupling at particle level: describe electron-pair flow when amino nitrogen attacks NO⁺, order the supplied N-N intermediates up to the diazonium ion, and explain acid and water-loss roles. Write the overall equation using Ar_D–NH₂, HNO₂ and H⁺ and check atom and net-charge balance. Separate arrows for every proton transfer are not required.
2. Draw azo coupling with electron-pair arrows, N=N linkage, sigma-complex charge and deprotonation; explain why complete protonation of the amino donor hinders coupling.
  - Expected performance (DE): 1. Ein verfügbares N-Elektronenpaar des neutralen Aminanteils greift das N des nitrosierenden NO⁺ an und bildet die N-N-Bindung. Nach Protonenübertragung/Deprotonierung liegt Ar_D–NH–N=O vor; Protonenumlagerung ergibt Ar_D–N=N–OH. Säure ermöglicht die Bildung des Nitrosierungsreagenzes und protoniert die OH-Gruppe zu einer Wasserabgangsgruppe. Wasserabspaltung und Bildung der N≡N-Bindung ergeben [Ar_D–N≡N]⁺. Gesamt: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Außer dem unveränderten Ar_D stehen links wie rechts2 N,2 O und4 H; Gesamtladung jeweils+1. Diese verkürzte Teilchenfolge genügt hier; sie ist kein vollständiges Protonenübertragungsnetz und keine Versuchsaufzeichnung.
2. π-Paar des Dimethylanilinrings→terminales Diazonium-N; N≡N-π-Paar→inneres N. Positiver σ-Komplex→H⁺-Abgabe mit C–H-Paar→Ring-π. Produkt p-NO₂–C₆H₄–N=N–C₆H₄–N(CH₃)₂, insgesamt Diazoniumpartner+ArH→Azofarbstoff+H⁺. Protoniertes –N⁺H(CH₃)₂ hat kein verfügbares freies Paar für den +M-Effekt, daher weniger aktivierter Ring.
  - Expected performance (EN): 1. An available N lone pair of the neutral amine fraction attacks nitrogen of nitrosating NO⁺ and forms the N-N bond. Proton transfer/deprotonation gives Ar_D–NH–N=O; proton rearrangement gives Ar_D–N=N–OH. Acid enables formation of the nitrosating reagent and protonates OH into a water leaving group. Water loss and formation of N≡N give [Ar_D–N≡N]⁺. Overall: Ar_DNH₂ + HNO₂ + H⁺ → [Ar_DN₂]⁺ + 2 H₂O. Apart from unchanged Ar_D, both sides contain2 N,2 O and4 H; net charge is+1 on both sides. This abbreviated particle sequence is sufficient here; it is neither a complete proton-transfer network nor an experiment record.
2. Dimethylaniline ring pi pair→terminal diazonium N; N≡N pi pair→inner N. Positive sigma complex→H⁺ loss with C–H pair→ring pi. Product: p-NO₂–C₆H₄–N=N–C₆H₄–N(CH₃)₂; overall diazonium partner+ArH→azo dye+H⁺. Protonated –N⁺H(CH₃)₂ lacks an available lone pair for +M donation, so the ring is less activated.
  - Understanding focus (DE): Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.
  - Understanding focus (EN): Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.
## Page 15: Einfache Bindungswinkel mit dem EPA-Modell erklären

- Full learning-goal ID: `9b56d01e-c2d7-51d8-b78e-237592c1ed20`
- Goal fingerprint: `sha256:f71621c4f2e0f579cd98db6c6036611adf4112ae572b40ea874dd0c5931741a9`
- Page fingerprint: `sha256:ca0b96b7d31b05a74ade0867d774bb53a2436c299510f17c659ee4973c2af1d6`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann zu bereits dargestellten Molekülgestalten und EPA-Elektronendomänen passende idealisierte einfache Bindungswinkel zuordnen, qualitative Winkelabweichungen durch freie Elektronenpaare begründen und die Grenzen solcher Modellwinkel gegenüber exakten Messwerten erläutern.

### Visualization

/assets/goal-visualizations/chemie/9b56d01e-c2d7-51d8-b78e-237592c1ed20/9b56d01e-c2d7-51d8-b78e-237592c1ed20.jpg

- original digest: `sha256:61cec509a1bb973b24037ac24ba88bb10efaec73a0d5cec3f208909b4f85be06`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Intermolekulare Kräfte vergleichen — `eb7537dd-d11b-50e9-a6d7-51a78e96fc4e` (outside this book)
- Stoffklasseneigenschaften bindungsbezogen vergleichen — `0b6a6a15-b355-5be8-abc9-4ef8df11bcb6` (outside this book)
- Hybridisierung zur Vorhersage organischer Bindungsverhältnisse nutzen — `37b4081a-244a-58d8-b448-88ed83344210` (outside this book)
- Bindungslängen und Molekülgeometrien modellgestützt begründen — `e8ec00a8-48d4-5fa3-9f0e-2ae365328a2e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b3234dde374351e1300028cbeb25f5528d244bcd32c1037a57d96d7fc135ba93`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `angle-only-increment`
  - Essential understanding (DE): Gegebene EPA-Grundanordnungen liefern idealisierte Winkelreferenzen. Freie Paare begründen qualitative Abweichungen, keine exakten Messwerte. Die Molekülgestalt wird vorausgesetzt und nicht erneut abgeschlossen.
  - Essential understanding (EN): Given VSEPR domain arrangements supply idealized angle references. Lone pairs explain qualitative deviations, not exact measurements. Molecular shape is assumed rather than completed again.
  - Observable performance (DE): Ordnet Referenzwinkel zu gegebenen Geometrien zu, begründet eine Winkelverkleinerung durch freie Paare und nennt die Idealisierungsgrenze. Gestaltklassifikation allein genügt nicht.
  - Observable performance (EN): Assigns reference angles to given geometries, justifies compression by lone pairs and states idealization limits. Shape classification alone is insufficient.

**Coverage expectations**

- required expectations: `angle-only-increment`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `given-angle-domain`: Vorgegebene lineare, planare und tetraedrische Domänen und Molekülgestalten. / Supplied linear, planar and tetrahedral domains and molecular shapes.
- `angle-model-boundary`: Freie Paare und Modellwinkel gegenüber Messbehauptungen. / Lone pairs and model angles versus measurement claims.

**Application cases**

- `epa-angle-only-tetrahedral-reference`
  - Task demand (DE): Alle Molekülgestalten und Elektronendomänen sind bereits gegeben; ihre erneute Ableitung oder Klassifikation wird nicht geprüft. Referenz: Vier Domänen sind ideal tetraedrisch angeordnet, mit 109,5°. CH4 ist tetraedrisch ohne freie Paare; H2O ist gewinkelt bei vier Domänen und zwei freien Paaren. Ordne den idealen CH4-Winkel zu und erkläre, weshalb der H–O–H-Winkel qualitativ kleiner sein kann. Welcher exakte Messwert folgt daraus nicht? Frischer Transfer: NH3 ist als trigonal-pyramidal mit vier Domänen und einem freien Paar gegeben. Begründe die Richtung der Winkelabweichung vom Referenzwert.
  - Task demand (EN): All molecular shapes and electron-domain counts are supplied; their derivation or classification is not assessed again. Reference: Four domains are ideally tetrahedral, with 109.5°. CH4 is tetrahedral without lone pairs; H2O is bent with four domains and two lone pairs. Assign the ideal CH4 angle and explain why H–O–H can be smaller. What exact measured value does this not establish? Fresh transfer: NH3 is given as trigonal pyramidal with four domains and one lone pair. Justify the direction of its angle deviation from the reference.
  - Expected performance (DE): CH4 hat im idealen tetraedrischen Modell 109,5°. Im einfachen EPA-Modell beanspruchen freie Paare mehr Raum und drücken Bindungsrichtungen zusammen; der H–O–H-Winkel ist gegenüber 109,5° verkleinert. Eine exakte gemessene Winkelzahl folgt daraus nicht. Für das vorgegebene NH3-Modell wird ebenfalls eine Verkleinerung gegenüber dem tetraedrischen Referenzwinkel begründet. Gestalten nur zu benennen genügt nicht.
  - Expected performance (EN): CH4 has 109.5° in the ideal tetrahedral model. In simple VSEPR, lone pairs occupy more space and compress bond directions; H–O–H is smaller than 109.5°. This does not supply an exact measured angle. For the given NH3 model, likewise justify a reduction from the tetrahedral reference. Merely naming shapes is insufficient.
  - Understanding focus (DE): Gefordert sind Winkelzuordnung, begründete Abweichung und Modellgrenze. Alle Gestalten sind Eingabedaten.
  - Understanding focus (EN): The performance is angle assignment, justified deviation and model limits. All shapes are input data.
- `epa-angle-only-linear-planar-transfer`
  - Task demand (DE): Gegebene Referenzen: linear 180°, trigonal-planar 120°, tetraedrische Domänen 109,5°. CO2 ist linear mit zwei Domänen am C; BH3 ist trigonal-planar mit drei Domänen am B; NH3 ist trigonal-pyramidal mit vier Domänen einschließlich eines freien Paars. Die Formen werden nicht erneut abgefragt. Ordne ideale Winkel zu, begründe, weshalb drei Bindungen bei BH3 und NH3 keine gleichen Winkel erzwingen, und prüfe: „EPA liefert für jedes Molekül den exakten gemessenen Winkel.“ Frische Variation: Eine Messung weicht vom idealen Referenzwinkel ab. Erkläre, weshalb weder Messung noch gesamtes Modell ohne weitere Prüfung verworfen werden dürfen.
  - Task demand (EN): Given references: linear 180°, trigonal planar 120°, tetrahedral domains 109.5°. CO2 is linear with two central-carbon domains; BH3 is trigonal planar with three boron domains; NH3 is trigonal pyramidal with four domains including one lone pair. Shapes are not assessed again. Assign ideal angles, explain why three bonds in BH3 and NH3 do not require equal angles, and assess: “VSEPR gives the exact measured angle for every molecule.” Fresh variation: A measurement differs from the ideal reference. Explain why neither the measurement nor the entire model should be discarded without further checks.
  - Expected performance (DE): CO2 gehört zum linearen 180°- und BH3 zum planaren 120°-Referenzwinkel. NH3 hat tetraedrische Domänen mit 109,5° als Ausgangsideal und einer freipaarbedingten Verkleinerung. Drei Bindungen machen NH3 nicht zu einem 120°-Fall. EPA ist ein idealisierendes Modell; Bedingungen, weitere Einflüsse und Messunsicherheit müssen geprüft werden. Eine Abweichung allein beweist weder einen Messfehler noch ein vollständiges Modellversagen.
  - Expected performance (EN): CO2 uses the linear 180° reference and BH3 the planar 120° reference. NH3 has tetrahedral domains with 109.5° as baseline and lone-pair compression. Three bonds do not make NH3 a 120° case. VSEPR is an idealized model; conditions, further influences and measurement uncertainty require checks. Deviation alone proves neither measurement error nor complete model failure.
  - Understanding focus (DE): Frischer Winkelvergleich ohne wiederholte Gestaltklassifikation.
  - Understanding focus (EN): A fresh angle comparison without repeated shape classification.
## Page 16: Chemische Daten quantitativ und hypothesenbezogen auswerten

- Full learning-goal ID: `9e3fae29-84d5-5600-bfb3-82d49ea3f1b5`
- Goal fingerprint: `sha256:408619305cdd19bcf108fe040dbfa37123e63ff33125ff45729764238cd6bcdf`
- Page fingerprint: `sha256:d7c933bc8b91a201b3542547b75c4ead408867c726ae66235b3ec9c782327797`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann für eine chemische Fragestellung geeignete mathematische Auswertungsverfahren und digitale Werkzeuge auswählen und begründet anwenden, quantitative Zusammenhänge unter Beachtung der Untersuchungsbedingungen interpretieren und daraus fachübergreifend begründete Schlüsse zur Stützung oder Falsifizierung der Ausgangshypothese ziehen.

### Visualization

/assets/goal-visualizations/chemie/9e3fae29-84d5-5600-bfb3-82d49ea3f1b5/9e3fae29-84d5-5600-bfb3-82d49ea3f1b5.png

- original digest: `sha256:470ca386b735383103c7b9c458015f4ea3354587bd8e41dde4cbb30fa97f3dc0`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Fragestellungen und Hypothesen theoriegestützt formulieren — `503dedcb-0efc-5e6b-bbc9-20761a0951f5` (outside this book)
- Chemische Daten auswerten und auf Hypothesen beziehen — `7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Eigene saure Proben qualitativ und quantitativ untersuchen — `ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:34f0d98671f0ea953c99d3e229d66387298d87dc243e64158a2ffc9bfd727298`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `actual-digital-analysis`
  - Essential understanding (DE): Digitale Auswertung macht Rechenweg, Rohdaten und Modellannahmen nachvollziehbar; eine gelesene fertige Grafik zeigt keine eigene Nutzung.
  - Essential understanding (EN): Digital evaluation makes computation, raw data and assumptions traceable; reading a completed chart does not show own tool use.
  - Observable performance (DE): Erstellt eine eigene Datei mit den markierten Modell-Rohdaten, Formeln, Scatterplot/Regression, Einheiten und überprüfbaren Zellbezügen für Kalibrierung und Kinetik.
  - Observable performance (EN): Creates an own file with labelled model raw data, formulas, scatterplot/regression, units and checkable cell references for calibration and kinetics.
- `mathematical-chemical-inference`
  - Essential understanding (DE): Lineare Kalibrierung und logarithmierte Konzentrations-Zeit-Beziehung beantworten unterschiedliche chemische Fragen unter begrenzten Modellannahmen.
  - Essential understanding (EN): Linear calibration and log concentration–time relations answer different chemical questions under bounded model assumptions.
  - Observable performance (DE): Ermittelt mit Offset die Modellkonzentration 7 mg/L sowie k≈0,05 min⁻¹ und Halbwertszeit≈13,86 min, interpretiert Residuen und stellt den mathematisch-chemischen Zusammenhang zur Hypothese her.
  - Observable performance (EN): Obtains model concentration 7 mg/L with an offset and k≈0.05 min⁻¹ and half-life≈13.86 min, interprets residuals and connects mathematics and chemistry to the hypothesis.
- `fresh-digital-decision`
  - Essential understanding (DE): Außerhalb kalibrierter Daten oder bei einer veränderten Datenreihe müssen Gültigkeit und Modellpassung erneut geprüft werden; Streuung ist nicht Gesamtunsicherheit.
  - Essential understanding (EN): Outside calibration data or after changing a dataset validity and model fit must be checked again; scatter is not total uncertainty.
  - Observable performance (DE): Bearbeitet A=0,650 als formal berechenbaren, aber nicht berichtbaren Bereichsfehler und c20=0,050 als neue markierte Datenversion; berechnet erneut, dokumentiert Residuen und begründet Unterstützung oder begrenzten Gegenbefund.
  - Observable performance (EN): Handles A=0.650 as a formally computable but unreportable range error and c20=0.050 as a new labelled data version; recalculates, documents residuals and justifies support or a bounded counterfinding.
- `hb-hb138-142-pressure-kinetics-own-digital-model-acquisition`
  - Essential understanding (DE): Nur entsprechende HB-Quellenroute; außerhalb dieses Scopes keine zusätzliche Abschlussbedingung. Eigene digitale Simulationserfassung ist von Messung und Fremddateneingabe zu trennen; Druckeffekte hängen von Partialdruck, Konzentration und gegebenem Geschwindigkeitsmodell ab.
  - Essential understanding (EN): Only the corresponding HB source route; no additional completion condition outside this scope. Own digital simulation acquisition differs from measurement or copying supplied data; pressure effects depend on partial pressure, concentration and the stipulated rate model.
  - Observable performance (DE): Erzeuge und erfasse tatsächlich selbst c(t)-Modellausgaben aus k=0,0500min−1 und c0=0,100/0,200mol/L mit selbst gewähltem Sampling. Kennzeichne Simulation/Herkunft, plotte und werte Rate/Halbwertszeit aus; beurteile die zweiteilige Druckhypothese. Variiere frisch Inertgas bei konstantem V/T und separat k=0,100min−1. Keine Messung oder Sensor-/Loggingpflicht behaupten. Vollständiger verbindlicher Fall: HB138-142-pressure-kinetics-own-digital-model-acquisition.
  - Observable performance (EN): Actually generate and record own c(t) model outputs from k=0.0500min−1 and c0=0.100/0.200mol/L with personally chosen sampling. Label simulation/provenance, plot and evaluate rate/half-life and the two-part pressure hypothesis. Freshly vary inert gas at fixed V/T and separately k=0.100min−1. Claim no measurement or sensor/logging requirement. Full binding case: HB138-142-pressure-kinetics-own-digital-model-acquisition.

**Coverage expectations**

- required expectations: `actual-digital-analysis`, `mathematical-chemical-inference`, `fresh-digital-decision`, `hb-hb138-142-pressure-kinetics-own-digital-model-acquisition`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `out-of-range`: Absorbanz überschreitet den oberen Standard; Gültigkeitsflag und weitere Messanforderung werden digital sichtbar. / Absorbance exceeds the upper standard; a validity flag and further measurement requirement are digitally visible.
- `changed-kinetics`: Ein einzelner Konzentrationswert ändert sich; alter Vergleich und neuer Fit werden getrennt. / One concentration reading changes; old comparison and new fit are kept separate.
- `hb-hb138-142-pressure-kinetics-own-digital-model-acquisition-fresh`: Frisch: Erhöhe durch Inertgas nur den Gesamtdruck bei festem V und T. Ändere danach in einer getrennten, gekennzeichneten Variante k auf 0,100 min−1. Erzeuge die betroffenen Serien erneut und ordne die Änderungen den Parametern zu. / Fresh: increase only total pressure by inert gas at fixed V/T, then in a separately labelled variant changek to0.100min−1. Actually regenerate/recalculate affected series and determine which change concerns pressure/concentration or the kinetic parameter.

**Application cases**

- `upper-quantitative-hypothesis-data-evaluation-digital-calibration`
  - Task demand (DE): Erzeuge tatsächlich eine Tabellenkalkulationsdatei mit Rohdaten, Streudiagramm, linearer Regression einschließlich Offset, Probenauswertung und dokumentiertem Verdünnungsfaktor. Begründe mathematische Wahl, Interpolation und Hypothesenbefund.
Frische Variation: Berechne digital neu für A = 0,650 und erkläre, warum die direkte Extrapolation keine gültige Analyse ist.
  - Task demand (EN): Actually create a spreadsheet file with raw data, scatter graph, linear regression including offset, sample evaluation and documented dilution factor. Justify mathematical choice, interpolation and hypothesis finding.
Fresh variation: Recalculate digitally for A = 0.650 and explain why direct extrapolation is not a valid analysis.
  - Expected performance (DE): Steigung 0,080 L/mg, Offset 0,010; A-Mittel 0,290, cverdünnt = 3,50 mg/L, cOriginal = 7,00 mg/L. Beispiel Zellformeln AVERAGE(Probenspalte), SLOPE(A;c), INTERCEPT(A;c), (Amean−b)/m*2; lokalisierte Äquivalente zulässig. U liegt innerhalb der Kalibration. Abweichungen ±0,001 A entsprechen hier ±0,0125 mg/L verdünnt (nur Streuungsbeitrag), nicht vollständiger Unsicherheit. Daten stützen die Bereichshypothese; Chemie/Optik und Mathematik verbinden Kalibration und Stoffkonzentration.
Frischer Transfer: Im digitalen Arbeitsblatt A=0,650 als neue Modellzeile kennzeichnen. Die formale Rechnung (0,650−0,010)/0,080=8,0 mg/L überschreitet die kalibrierten 0–6 mg/L; sie dient allein der Bereichsprüfung. Die Berichtsspalte erhält deshalb „außerhalb Kalibrierung / weiterer gültiger Wert erforderlich“, nicht 16 mg/L als abgesicherten Originalwert. Ein eigener Gültigkeitsflag vergleicht Absorbanz mit 0,010–0,490. Bekannte zusätzliche Verdünnung und tatsächlich neuer in-range-Wert mit geprüfter Kalibrierung wären erforderlich; dessen Absorbanz darf nicht aus der ungültigen Extrapolation vorhergesagt werden. Rohdaten, formale Rechenzelle, Sperrflag und begründete Entscheidung sind in einer tatsächlich eigenen Datei aufzubewahren. Die Autoren-Rechenreferenz ist keine Lernendendatei.
  - Expected performance (EN): Slope 0.080 L/mg, intercept 0.010; mean A 0.290, cdiluted = 3.50 mg/L, coriginal = 7.00 mg/L. Example cell formulas AVERAGE(sample column), SLOPE(A;c), INTERCEPT(A;c), (Amean−b)/m*2; localised equivalents accepted. U is within calibration. Deviations ±0.001 A correspond here to ±0.0125 mg/L diluted (scatter contribution only), not full uncertainty. Data support the interval hypothesis; chemistry/optics and mathematics connect calibration and concentration.
Fresh transfer: Label A=0.650 as a new model row in the digital workbook. The formal computation (0.650−0.010)/0.080=8.0 mg/L exceeds calibrated 0–6 mg/L and serves only the range check. The reporting column therefore receives “outside calibration / further valid reading required”, not 16 mg/L as a validated original value. An own validity flag compares absorbance with 0.010–0.490. A known additional dilution and actually new in-range reading with checked calibration would be needed; its absorbance must not be predicted from invalid extrapolation. Retain raw data, formal computation cell, blocking flag and justified decision in an actually own file. The author computation reference is not a learner file.
  - Understanding focus (DE): Digitale mathematische Auswertung zeigt eine echte Bereichsentscheidung statt ungeprüfter Extrapolation.
  - Understanding focus (EN): Digital mathematical evaluation shows a real range decision rather than unchecked extrapolation.
- `upper-quantitative-hypothesis-data-evaluation-digital-kinetics`
  - Task demand (DE): Wähle und erzeuge eine digitale quantitative Auswertung, prüfe die Hypothese über eine geeignete Linearisierung und Residuen, interpretiere k und Halbwertszeit und benenne Gültigkeitsbedingungen.
Frische Variation: Ersetze den 20-min-Wert durch 0,0500 mol/L; untersuche Residuum und mögliche Mess-/Temperaturfehler, bevor du das Modell verlässlich verwirfst.
  - Task demand (EN): Choose and create a digital quantitative evaluation, test the hypothesis using appropriate linearisation and residuals, interpret k and half-life and state validity conditions.
Fresh variation: Replace the 20-min value with 0.0500 mol/L; inspect the residual and possible measurement/temperature errors before reliably rejecting the model.
  - Expected performance (DE): LN(c/c0) ergibt ungefähr 0/−0,500/−1,000/−1,500; Regression gegen t liefert k ≈ 0,0500 min⁻¹, t1/2 = ln2/k ≈ 13,86 min. In der Tabellenkalkulation LN(B2/$B$2), Regression und Residuenformel verwenden; gerundete Eingangsdaten erzeugen kleine Residuen. Die Daten sind konsistent mit erster Ordnung unter isothermen Bedingungen, beweisen keine einzigartige Reaktionsmechanik. Eine krumme c-t-Kurve allein widerlegt erste Ordnung gerade nicht.
Frischer Transfer: Originaldaten unverändert halten; eine neue Modellversion setzt ausschließlich c(20)=0,050 mol/L. Dann ln(c/c0)=ln(0,5)=−0,69315 statt ungefähr −1. Gegen die alte idealisierte Gerade y=−0,05t beträgt die Abweichung +0,30685. Ein neuer Least-Squares-Fit aller vier gerundeten Werte liefert etwa y=0,03069−0,046935t; beim geänderten 20-min-Wert bleibt ein positives Residuum von etwa 0,21486. Der Fit absorbiert einen Teil der Abweichung und beweist keine eindeutige neue Kinetik. Eigenes Blatt mit getrennten Versionen, Formeln, beiden Linien und Residuen erstellen; Datenherkunft und mögliche Verfahrens-/Temperaturabweichung prüfen. Ohne Fehler-/Unabhängigkeitsdaten ist eine belastbare chemische Falsifikation begrenzt. Kein eigener Messwert wurde erzeugt.
  - Expected performance (EN): LN(c/c0) gives approximately 0/−0.500/−1.000/−1.500; regression against t yields k ≈ 0.0500 min⁻¹, t1/2 = ln2/k ≈ 13.86 min. Use spreadsheet LN(B2/$B$2), regression and a residual formula; rounded inputs generate small residuals. Data are consistent with first order under isothermal conditions, not proof of a unique reaction mechanism. A curved c-t graph alone does not refute first order.
Fresh transfer: Retain original data; a new model version changes only c(20)=0.050 mol/L. Then ln(c/c0)=ln(0.5)=−0.69315 rather than approximately −1. Against the old idealised line y=−0.05t the deviation is +0.30685. A new least-squares fit to all four rounded values gives about y=0.03069−0.046935t; the changed 20-min value retains a positive residual of about 0.21486. The fit absorbs part of the deviation and does not prove unique new kinetics. Create an own workbook with separate versions, formulas, both lines and residuals; examine data origin and possible procedural/temperature deviations. Without error/independence information reliable chemical falsification is bounded. No own measurement was generated.
  - Understanding focus (DE): Eine digitale neue Datenversion unterscheidet alten Modellvergleich, Neufit und belastbaren chemischen Gegenbefund.
  - Understanding focus (EN): A digital new data version distinguishes old-model comparison, refit and reliable chemical counterfinding.
- `hb138-142-pressure-kinetics-own-digital-model-acquisition`
  - Task demand (DE): Erzeuge und erfasse tatsächlich selbst c(t)-Modellausgaben aus k=0,0500min−1 und c0=0,100/0,200mol/L mit selbst gewähltem Sampling. Kennzeichne Simulation/Herkunft, plotte und werte Rate/Halbwertszeit aus; beurteile die zweiteilige Druckhypothese. Variiere frisch Inertgas bei konstantem V/T und separat k=0,100min−1. Keine Messung oder Sensor-/Loggingpflicht behaupten.
Frische Variation: Frisch: Erhöhe durch Inertgas nur den Gesamtdruck bei festem V und T. Ändere danach in einer getrennten, gekennzeichneten Variante k auf 0,100 min−1. Erzeuge die betroffenen Serien erneut und ordne die Änderungen den Parametern zu.
HB138-142-pressure-kinetics-own-digital-model-acquisition
  - Task demand (EN): Actually generate and record own c(t) model outputs from k=0.0500min−1 and c0=0.100/0.200mol/L with personally chosen sampling. Label simulation/provenance, plot and evaluate rate/half-life and the two-part pressure hypothesis. Freshly vary inert gas at fixed V/T and separately k=0.100min−1. Claim no measurement or sensor/logging requirement.
Fresh variation: Fresh: increase only total pressure by inert gas at fixed V/T, then in a separately labelled variant changek to0.100min−1. Actually regenerate/recalculate affected series and determine which change concerns pressure/concentration or the kinetic parameter.
HB138-142-pressure-kinetics-own-digital-model-acquisition
  - Expected performance (DE): Nur Referenzkontrolle, keine Messung: Bei t = 20 min ist cL = 0,0367879 mol/L und cH = 0,0735759 mol/L. Anfangsraten: 0,00500 bzw. 0,0100 mol/(L min). In diesem linearen Modell verdoppeln sich Konzentration und volumenspezifische Rate, während t1/2 = ln(2)/k ≈ 13,8629 min gleich bleibt. Die erste Teilhypothese gilt; die zweite wird im Modell widerlegt. Bei gleicher Temperatur wird aus Druck allein keine höhere mittlere Teilchengeschwindigkeit abgeleitet. Größere Dichte geeigneter Stoßpartner kann Zusammenstöße häufen; nicht jeder Stoß ist wirksam, und das jeweilige Geschwindigkeitsgesetz begrenzt die quantitative Aussage. Hier bedeutet mehr A pro Volumen mehr Umsetzungsereignisse pro Volumen bei festem k. Andere Mechanismen können andere Druckabhängigkeit zeigen. ln(c/c0) ist dimensionslos und hat Steigung −k. Eine endliche Intervallrate ist gemittelt, nicht automatisch die Anfangsrate. Modellgenerierte Daten bestätigen kein empirisches Naturgesetz.
Frischer Transfer: Inertgas ändert cA, pA und diesen Modellverlauf nicht. Doppeltes k halbiert t1/2 auf etwa 6,9315 min und verdoppelt die Anfangsrate bei gleichem c0. Dies ist keine gemessene Temperaturwirkung. Neue Version, Parameter und Modellherkunft bleiben nachvollziehbar; keine universelle Druck- oder RGT-Regel behaupten.
  - Expected performance (EN): Independent reference check, not own measurement: at20min,L=0.0367879mol/L,H=0.0735759mol/L; initial rates0.00500 and0.0100mol/(Lmin). In the stipulated linear modelc(t) and rate per volume double while half-life ln2/k≈13.8629min stays equal. Equal T means pressure alone does not imply greater mean molecular speed; more A per volume means more events per volume in this model. Multi-reactant mechanisms may give other pressure exponents; a rate alone does not identify mechanism. ln(c/c0) is dimensionless with slope−k. A finite interval rate is an interval average, not automatically exact initial rate. Synthetic acquisition is not experimental validation. The first prediction holds in this model; the second is refuted within the model. Generated data establish no empirical law. Greater density of suitable collision partners can increase collision frequency; not every collision is effective, and the applicable rate law limits the quantitative inference.
Fresh transfer: Inert gas changes neither cA/pA nor this model trajectory. Doublingk halves half-life to≈6.9315min and doubles initial rate at equalc0; this is not a measured temperature effect. Retain model provenance,new parameters and file version; claim no universal RGT/pressure rule.
  - Understanding focus (DE): Eigene digitale Simulationserfassung ist von Messung und Fremddateneingabe zu trennen; Druckeffekte hängen von Partialdruck, Konzentration und gegebenem Geschwindigkeitsmodell ab. Vollständige Aufgabe, Referenz, Transfer und Rubrik: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-lab-physical-material-author-20261017-v1/materials/HB138-142-pressure-kinetics-own-digital-model-acquisition.DE-EN.json
  - Understanding focus (EN): Own digital simulation acquisition differs from measurement or copying supplied data; pressure effects depend on partial pressure, concentration and the stipulated rate model. Complete task, reference, transfer and rubric: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-lab-physical-material-author-20261017-v1/materials/HB138-142-pressure-kinetics-own-digital-model-acquisition.DE-EN.json
## Page 17: Gefahrstoffkennzeichnungen deuten

- Full learning-goal ID: `9e656697-fc05-5aa9-9aca-871af2e89eb7`
- Goal fingerprint: `sha256:79a120a44dc6e946f1523025c55aef98cd38f09a800e7f0cecad4bf7443f34b7`
- Page fingerprint: `sha256:a0ab29a36a7658f84f6cc96ab012f5002788625d23addc66320e3d0ed50dcdf7`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Gefahrstoffkennzeichnungen anhand der Piktogramme und zugehörigen Warnhinweise deuten und fehlende Angaben in einer bereitgestellten Gefahrstoffinformation gezielt nachschlagen.

### Visualization

/assets/goal-visualizations/chemie/9e656697-fc05-5aa9-9aca-871af2e89eb7/9e656697-fc05-5aa9-9aca-871af2e89eb7.jpg

- original digest: `sha256:4155782869f57adc2905499420841e60cf9374317d5a66ea6ccb4c985bea3e85`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Arbeitsweisen der Chemie anwenden — `266a2b2a-9ee2-52f6-ae09-59343da9a60b` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Chemische Grundlagen — `1e372b97-6f1c-596c-8a8b-fc03193d784a` (outside this book)
- Bedeutung der GHS-Piktogramme abrufen — `91e4962c-3324-5c52-b192-505c4eb3c762` (outside this book)
- Stoffbezogene Schutzmaßnahmen begründen — `4b6d1824-20e4-597e-b639-fae401f740f0` (outside this book)
- Grundlegende Anforderungen von Lebewesen experimentell untersuchen — `07bf5fab-9379-5b3c-a6fc-b892fcfa9a49` (outside this book)
- Stoffe chemisch präparieren und aufarbeiten — `4d16601e-fa57-5bcb-a5b6-f308d5b8036a` (outside this book)
- Stoffgemische qualitativ und quantitativ analysieren — `57d2c98d-30b8-5123-b823-e56a4f22b191` (outside this book)
- Arznei- und Koerperpflegemittel herstellen und chemisch erklaeren — `7b443158-8ca9-5b8e-8328-a8fa56f6e26f` (outside this book)
- Unbekannte Reinstoffproben analytisch identifizieren — `7b80efe6-b77d-5ace-8886-973ba38e6f9e` (outside this book)
- Standortbezogene Lebensraumeignung mit Feld- und Wirkungsdaten beurteilen — `843484b9-1acf-54e0-a030-bc214b3b0656` (outside this book)
- Lebewesen mit Bestimmungsliteratur bestimmen — `9d6e1966-b10c-5a70-b215-df7007c95b07` (outside this book)
- Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren — `0f632595-5875-5a95-83d8-7de3180bdaa6` (outside this book)
- Reizantworten von Lebewesen kontrolliert untersuchen — `c8198159-2109-5ad0-9d37-252ebac0219d` (outside this book)
- Stoffe mit biotechnologischen Verfahren herstellen — `cb7125b7-8734-51c6-8306-9163114dc0cc` (outside this book)
- Werk- und Baustoffe herstellen und Eigenschaften pruefen — `dc4a26c7-8304-529d-8705-7333b2f038fc` (outside this book)
- Lebensmitteltechniken biologisch und chemisch erklaeren — `e6dcd3a0-264d-503b-aaac-a3e86eeb7059` (outside this book)
- Stoffe isolieren, reinigen und Ausbeute beurteilen — `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` (outside this book)
- Einflüsse auf Enzymreaktionen experimentell untersuchen — `dd59351e-3b16-5104-b7c6-ff9e402e4de7` (outside this book)
- Mikroskopische Praeparate herstellen und auswerten — `fec1563e-a34a-5fc1-93bb-03981f35ab13` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:45a37cfaf83be6e121fb9f019d4cdf82d09e2bd729ac083b2182015431c9bc9b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `label-with-bounded-information`
  - Essential understanding (DE): Ein Piktogramm weist auf bestimmte Gefahrenarten hin; dasselbe Symbol kann zu verschiedenen Gefahrenklassen und konkreten Warnungen gehören. Die konkrete Aussage ergibt sich zusammen mit dem zugehörigen Warnhinweis; Nachschlagen dient dieser selben Deutung und ist keine eigenständige freie Webrecherche.
  - Essential understanding (EN): A pictogram indicates particular types of hazard; the same symbol can apply to different hazard classes and specific warnings. Its specific meaning is read together with the associated hazard statement; lookup serves that interpretation rather than becoming a separate free web-research task.
  - Observable performance (DE): Die Person deutet zwei Kennzeichnungen und erklärt die unterschiedliche Aussage trotz gleichen Piktogramms; sie ergänzt eine konkret fehlende Information aus dem bereitgestellten Nachschlagematerial.
  - Observable performance (EN): The learner interprets two labels and explains their different meanings despite a shared pictogram, adding one missing detail from the supplied reference.

**Coverage expectations**

- required expectations: `label-with-bounded-information`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-material-and-boundaries`: Neue konkrete Stoffe, Angaben, Rollen oder unvollständige Informationen variieren; Antworten an die bereitgestellten Daten binden und die abgefragte Verständnisroutine vollständig zeigen. / Vary concrete substances, information, roles or incomplete evidence; ground answers in supplied data and demonstrate the complete understanding routine.

**Application cases**

- `label-same-exclamation-different-warning`
  - Task demand (DE): Zwei fiktive Unterrichtsetiketten, keine vollständigen Produktetiketten: A zeigt das rote Rauten-Piktogramm mit Ausrufezeichen und H315. B zeigt dieselbe Raute mit Ausrufezeichen und H319. Bereitgestellte Nachschlagetabelle: H315 = Verursacht Hautreizungen; H319 = Verursacht schwere Augenreizung. Die Stoffe werden nicht ausgegeben und nicht verwendet. Auf einem dritten Etikettenauszug C ist das Ausrufezeichen sichtbar; der Warnhinweis ist verdeckt. Es liegen keine weiteren Angaben zu C vor. Deute A und B mithilfe der Tabelle. Begründe, warum das gleiche Piktogramm keine identische konkrete Gefahr beweist. Welche Angabe musst du für C aus der bereitgestellten vollständigen Stoffinformation anfordern? Transfer: Neues Etikett D: Ausrufezeichen und H335. Nachschlageeintrag: Kann die Atemwege reizen. Deute D und vergleiche es mit B.
  - Task demand (EN): Two fictional teaching labels, not complete product labels: A shows the red-diamond exclamation-mark pictogram with H315. B shows the same exclamation-mark diamond with H319. Supplied lookup table: H315 = causes skin irritation; H319 = causes serious eye irritation. No substances are supplied or used. A third label excerpt C shows the exclamation mark but its hazard statement is covered. No other details about C are provided. Interpret A and B using the table. Explain why the same pictogram does not establish the same specific hazard. Which detail must you request for C from the supplied complete substance information? Transfer: New label D: exclamation mark and H335. Lookup entry: may cause respiratory irritation. Interpret D and compare it with B.
  - Expected performance (DE): A warnt vor Hautreizung, B vor schwerer Augenreizung. Das Piktogramm allein unterscheidet diese konkreten Warnungen nicht. Für C benötige ich den zugehörigen Warnhinweis beziehungsweise seinen H-Code und die eindeutige Zuordnung zur Stoffinformation; aus dem Ausrufezeichen allein entscheide ich nicht zwischen Haut und Augen. Transfer: D betrifft die Atemwege, B die Augen. Das gemeinsame Symbol erlaubt nicht, D nur als Augenwarnung zu lesen.
  - Expected performance (EN): A warns of skin irritation; B warns of serious eye irritation. The pictogram alone does not distinguish these specific warnings. For C I need the associated hazard statement or H-code and its unambiguous substance-information entry; the exclamation mark alone does not decide between skin and eye hazards. Transfer: D concerns the respiratory tract, B the eyes. Their shared symbol does not make D an eye-only warning.
  - Understanding focus (DE): Ein Piktogramm weist auf bestimmte Gefahrenarten hin; dasselbe Symbol kann zu verschiedenen Gefahrenklassen und konkreten Warnungen gehören. Die konkrete Aussage ergibt sich zusammen mit dem zugehörigen Warnhinweis; Nachschlagen dient dieser selben Deutung und ist keine eigenständige freie Webrecherche.
  - Understanding focus (EN): A pictogram indicates particular types of hazard; the same symbol can apply to different hazard classes and specific warnings. Its specific meaning is read together with the associated hazard statement; lookup serves that interpretation rather than becoming a separate free web-research task.
- `label-flame-and-bounded-lookup`
  - Task demand (DE): Fiktive Unterrichtsetiketten: L zeigt Flamme und H225; F zeigt Flamme und H228. In einem dritten Auszug M stehen Flamme und H226; dessen Klartext fehlt. Bereitgestellte Tabelle: H225 = Flüssigkeit und Dampf sind leicht entzündbar; H228 = entzündbarer Feststoff; H226 = Flüssigkeit und Dampf sind entzündbar. Diese Auszüge enthalten keine Angaben zur Entsorgung oder vollständigen Arbeitsfreigabe. Es wird keine reale Tätigkeit durchgeführt. Deute L und F und ergänze für M den fehlenden Klartext aus der Tabelle. Begründe an L und F, welche konkreten Informationen erst der Warnhinweis liefert. Beurteile die Behauptung: „Die Flamme beweist, dass jeder dieser Stoffe ein flüssiger Alkohol ist.“ Transfer: Ein weiterer Flammen-Auszug hat keinen lesbaren H-Code. Darfst du ihn mit H225 ergänzen, weil L dasselbe Symbol trägt?
  - Task demand (EN): Fictional teaching labels: L shows flame and H225; F shows flame and H228. A third excerpt M shows flame and H226 but omits its statement text. Supplied table: H225 = highly flammable liquid and vapour; H228 = flammable solid; H226 = flammable liquid and vapour. These excerpts provide no disposal information or complete permission to work. No real activity is performed. Interpret L and F and look up the missing statement for M. Use L and F to explain which specifics come from the statement. Assess the claim: “The flame proves that each substance is a liquid alcohol.” Transfer: Another flame excerpt has no readable H-code. May you fill it with H225 because L has the same symbol?
  - Expected performance (DE): L warnt vor einer leicht entzündbaren Flüssigkeit und ihrem Dampf; F vor einem entzündbaren Feststoff. Für M lautet der Tabelleneintrag: Flüssigkeit und Dampf sind entzündbar. Die Flamme kennzeichnet die Brennbarkeitsgefahr in diesen Auszügen; weder genaue Stoffidentität noch gleicher Aggregatzustand ergeben sich allein daraus. Die Alkoholbehauptung ist unbegründet. Transfer: Nein. Ich benötige den zum neuen Stoff gehörenden Warnhinweis; gleiche Symbole rechtfertigen keine Übernahme.
  - Expected performance (EN): L warns of a highly flammable liquid and its vapour; F of a flammable solid. The table supplies “flammable liquid and vapour” for M. The flame denotes the flammability hazard in these excerpts; exact identity and matching physical state do not follow from it alone. The alcohol claim is unsupported. Transfer: No. I need that substance’s own statement; matching symbols do not justify copying the statement.
  - Understanding focus (DE): Ein Piktogramm weist auf bestimmte Gefahrenarten hin; dasselbe Symbol kann zu verschiedenen Gefahrenklassen und konkreten Warnungen gehören. Die konkrete Aussage ergibt sich zusammen mit dem zugehörigen Warnhinweis; Nachschlagen dient dieser selben Deutung und ist keine eigenständige freie Webrecherche.
  - Understanding focus (EN): A pictogram indicates particular types of hazard; the same symbol can apply to different hazard classes and specific warnings. Its specific meaning is read together with the associated hazard statement; lookup serves that interpretation rather than becoming a separate free web-research task.
## Page 18: Stoffumsätze einfacher Molekülreaktionen berechnen

- Full learning-goal ID: `9f355f63-4fb7-5638-9538-6e8a246ec4b2`
- Goal fingerprint: `sha256:db331af99ad23d7bd35483cdfeb5c603576ba334f6d325f1ff4a08ca8f9258df`
- Page fingerprint: `sha256:3aa6288b06960559e636e155eb9cd964458a36f3114dfcd101573500782f2864`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Reaktionsgleichungen und Größengleichungen nutzen, um Stoffumsätze bei einfachen Molekülreaktionen zu berechnen.

### Visualization

/assets/goal-visualizations/chemie/9f355f63-4fb7-5638-9538-6e8a246ec4b2/9f355f63-4fb7-5638-9538-6e8a246ec4b2.jpg

- original digest: `sha256:6f633fde5ddf96c717c852816839edb73c62617bedc43d1060c71cd07ae7611a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)
- Stoffmenge und Einheit Mol nutzen — `1dc15fa2-fca4-56b0-b5c1-4d215613dde0` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d27450ca48369200b4dfdeb27fe904f5e88cde6e3db604703d5ad11eebc6098f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `b005-9f355f63-core`
  - Essential understanding (DE): Koeffizienten einer ausgeglichenen Molekülreaktion geben Stoffmengenverhältnisse an. Größenbeziehungen wie n=m/M führen von gegebener Masse zur Stoffmenge; bei zwei gegebenen Edukten bestimmt das begrenzende Edukt den maximalen Umsatz.
  - Essential understanding (EN): Coefficients of a balanced molecular reaction give amount-of-substance ratios. Relations such as n=m/M convert given mass to amount; with two supplied reactants, the limiting one sets maximum conversion.
  - Observable performance (DE): Die lernende Person berechnet aus korrekter Gleichung und gegebener Masse/Stoffmenge einen Produktumsatz, identifiziert den begrenzenden Stoff und prüft Einheiten sowie Rest.
  - Observable performance (EN): The learner computes product yield from a balanced equation and supplied mass/amount, identifies the limiting reactant and checks units and leftovers.

**Coverage expectations**

- required expectations: `b005-9f355f63-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `reaction`: Wasserbildung und Kohlenmonoxid-Oxidation haben beide das Koeffizientenverhältnis 2:1:2; die Stoffe und der jeweils begrenzende Reaktionspartner unterscheiden sich. / Water formation and carbon monoxide oxidation both have the coefficient ratio 2:1:2; the substances and the limiting reactant differ.
- `quantity`: Mol-Angaben und Masse-zu-Mol-Umrechnung werden verglichen. / Mole amounts and mass-to-mole conversion are compared.

**Application cases**

- `water-limiting-oxygen`
  - Task demand (DE): Für die Papierreaktion 2 H2 + O2 → 2 H2O stehen 3 mol H2 und 1 mol O2 zur Verfügung. Berechne maximale Stoffmenge und Masse des Wassers (M=18 g/mol) sowie einen Rest.
  - Task demand (EN): For the paper reaction 2 H2 + O2 → 2 H2O, 3 mol H2 and 1 mol O2 are available. Calculate maximum water amount and mass (M=18 g/mol) and a leftover.
  - Expected performance (DE): Die lernende Person erkennt O2 als begrenzend, erhält 2 mol H2O = 36 g und 1 mol H2 Rest; sie nutzt die Koeffizienten als Mol-Verhältnis, nicht als Gramm-Verhältnis.
  - Expected performance (EN): The learner identifies O2 as limiting, obtains 2 mol H2O = 36 g and 1 mol H2 left; coefficients are mole ratios, not gram ratios.
  - Understanding focus (DE): Andere Reaktion als Bestandsbild prüft Mol-Verhältnis und Masse.
  - Understanding focus (EN): A reaction different from the existing image tests mole ratios and mass.
- `fresh-carbon-monoxide-oxidation`
  - Task demand (DE): Ein neuer Papierdatensatz gibt 56 g CO (M=28 g/mol) und 1,5 mol O2 für 2 CO + O2 → 2 CO2 vor. Berechne maximale Stoffmenge und Masse CO2 (M=44 g/mol) sowie den O2-Rest; keine reale Gasarbeit.
  - Task demand (EN): A fresh paper data set supplies 56 g CO (M=28 g/mol) and 1.5 mol O2 for 2 CO + O2 → 2 CO2. Calculate maximum CO2 amount and mass (M=44 g/mol) plus leftover O2; no gas experiment.
  - Expected performance (DE): Die lernende Person rechnet 56/28=2 mol CO, benötigt 1 mol O2, erhält 2 mol CO2 = 88 g und 0,5 mol O2 Rest; sie führt keine gefährliche CO-Handlung aus.
  - Expected performance (EN): The learner converts 56/28=2 mol CO, needs 1 mol O2, obtains 2 mol CO2 = 88 g and 0.5 mol O2 left; no hazardous CO handling occurs.
  - Understanding focus (DE): Frischer Massen-Eingang prüft begrenzendes Edukt und Einheiten.
  - Understanding focus (EN): Fresh mass input tests limiting reactant and units.
## Page 19: Chemische Wirkungen in historischen und aktuellen Zusammenhängen bewerten

- Full learning-goal ID: `9f892457-c4e5-56da-830c-bf6cac0c98d7`
- Goal fingerprint: `sha256:b7df27d84a21ad178404ecd40ff623e2f16904fe7083870db5b282da4f2e8885`
- Page fingerprint: `sha256:b3912a0e34c4b1e16a09fc342729a985543660e69183a93b25009f560034c5e1`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann gesellschaftliche und ökologische Bedeutung sowie Auswirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse in historischen und aktuellen Zusammenhängen beschreiben und aus ökologischer, ökonomischer und sozialer Nachhaltigkeitsperspektive begründet bewerten. Dabei reflektiert sie auch mögliche Auswirkungen des eigenen Handelns.

### Visualization

/assets/goal-visualizations/chemie/9f892457-c4e5-56da-830c-bf6cac0c98d7/9f892457-c4e5-56da-830c-bf6cac0c98d7.png

- original digest: `sha256:e95031251b03b9b49f949095bc4645a7e8ed1decb31afaf5f8fb0ab02b6dbbd4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Quellen und Darstellungen kritisch prüfen — `36666b4a-97af-51fc-9983-56cdcc7a8229` (outside this book)
- Chemische Handlungsoptionen kriteriengeleitet bewerten — `1df17884-96ae-57d7-9da9-dbebd082596f` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Ammoniak: Erkenntnisse prüfen und Folgen abwägen — `b406eff8-3cd9-551b-a913-c6dda7223645` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:33ca2bef1f7ff4a30768b1e5c1569369efbec02957c9af29075944e7ed3805f4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `whole-historical-current-chain`
  - Essential understanding (DE): Chemische Produkte, Methoden, Verfahren und Erkenntnisse wirken in historischen UND aktuellen gesellschaftlichen Zusammenhängen zusammen.
  - Essential understanding (EN): Chemical products, methods, processes and knowledge interact in historical AND current societal settings.
  - Observable performance (DE): Ordnet für Ammoniak bzw. Kühlung jeweils Produkt, Analyse-/Kontrollmethode, technisches Verfahren und Wissen der historischen Entwicklung und dem heutigen Entscheidungskontext zu.
  - Observable performance (EN): Relates product, analysis/control method, technical process and knowledge for ammonia or cooling to historical development and today’s decision context.
- `three-perspective-evaluation`
  - Essential understanding (DE): Nachhaltigkeitsbewertung verbindet ökologische, ökonomische und soziale Perspektiven mit gleicher Bezugsleistung; gute Einzelindikatoren ersetzen keine Gesamtabwägung.
  - Essential understanding (EN): Sustainability evaluation combines environmental, economic and social perspectives for equal reference service; good individual indicators do not replace a full judgment.
  - Observable performance (DE): Bewertet Ressourcen/Verluste, Kosten und fairen Wissenszugang bzw. Ozon/Klima, Betrieb/Sicherheit und Zugang; trennt Modellzahlen, historische Quellen und fehlende Wirkungsdaten.
  - Observable performance (EN): Evaluates resources/losses, cost and fair knowledge access or ozone/climate, operation/safety and access; separates model numbers, historical sources and missing impact data.
- `own-action-and-fresh-change`
  - Essential understanding (DE): Eigenes Handeln beeinflusst eine begrenzte Wirkungskette; gleiche Wissenszugänge oder neue Leckagedaten verändern gezielt Teile der Bewertung.
  - Essential understanding (EN): Own action affects a bounded chain of impacts; equal knowledge access or new leakage data selectively changes parts of evaluation.
  - Observable performance (DE): Reflektiert eigene mögliche Informations-/Nutzungs-/Meldehandlungen und aktualisiert bei geteiltem Wissen bzw. neuer Leckage die ökologische, ökonomische und soziale Begründung ohne eigenmächtige chemische Anwendung.
  - Observable performance (EN): Reflects on own possible information/use/reporting actions and updates environmental, economic and social justification for shared knowledge or new leakage without unauthorised chemical application.
- `hb155-sugar-three-criteria-evaluation`
  - Essential understanding (DE): Bewertung industrieller Zuckergewinnung verknüpft Stoff-/Trennprozess mit ökologischen,ökonomischen und sozialen Kriterien unter gleicher Funktion/Systemgrenze.
  - Essential understanding (EN): Evaluation of industrial sugar production links substance/separation processes with environmental,economic and social criteria under equal function/boundary.
  - Observable performance (DE): Die lernende Person beschreibt die gebundene Zuckergewinnung,bewertet A/B nach allen drei Perspektiven mit offener Gewichtung/Unsicherheit und überträgt auf den neuen Wasserkreislauf C.
  - Observable performance (EN): The learner describes the bound sugar process,evaluates A/B across all three perspectives with explicit weighting/uncertainty and transfers to new water-loop C.

**Coverage expectations**

- required expectations: `whole-historical-current-chain`, `three-perspective-evaluation`, `own-action-and-fresh-change`, `hb155-sugar-three-criteria-evaluation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `knowledge-access`: Gleich zugängliche öffentliche Erkenntnisse verbessern Zugang, ohne Modell-Ressourcenwerte zu ändern. / Equally accessible public knowledge improves access without changing model resource figures.
- `new-emissions`: Neue Leckage verändert die Betriebs-Wirkungskette; Menge und Wirkungsfaktor bleiben getrennt. / New leakage changes the operating impact chain; emission amount and impact factor remain separate.
- `hb155-sugar-three-criteria-evaluation-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `upper-chemical-effects-sustainability-ammonia-lifecycle`
  - Task demand (DE): Beschreibe historische/aktuelle Bedeutung und Auswirkungen von Produkt, Methode, Verfahren und Erkenntnis. Bewerte ökologisch, ökonomisch und sozial, reflektiere eigenes mögliches Handeln und nenne Bilanzgrenzen.
Frische Variation: B wird durch öffentliche Wissensvermittlung gleichermaßen zugänglich: Welche soziale Bewertung ändert sich, welche chemischen Daten nicht?
  - Task demand (EN): Describe historical/current significance and impacts of product, method, process and knowledge. Assess ecological, economic and social aspects, reflect on possible own action and state balance limits.
Fresh variation: Public information makes B equally accessible: which social evaluation changes and which chemical data do not?
  - Expected performance (DE): Historische Produktion erweitert Düngerbereitstellung; heutige Bedarfs-/Stoffflusskenntnis ergänzt Mengenfrage. Produkt/Prozess können Versorgung ermöglichen, zugleich Rohstoff-/Energiebedarf und Verluste erzeugen; Methode/Erkenntnis unterstützen gezielteren Einsatz. B verringert Modellressourcen/Verluste, kostet mehr und braucht zugängliche Beratung; soziale Nachhaltigkeit verlangt Zugang und faire Lasten. Eigenes Handeln könnte Daten/Anwendungshinweise prüfen und Ressourcenverbrauch reflektieren, keine ungenehmigte Düngung. Zahlen sind Lehrindikatoren, keine vollständige reale Ökobilanz und keine historischen Messwerte.
Frischer Transfer: Gleich öffentlich zugängliche Erkenntnisse verbessern die soziale Wissenszugangsdimension, während die Modellzahlen A=10/8/4 und B=7/9/2 für Ressourcen/Kosten/Verlust unverändert bleiben. Historisch ermöglichte industrielles Ammoniak neue Stickstoffversorgung; aktuell gehören Produkt NH3, Herstellungsverfahren, Analyse-/Bedarfsmethoden und Wissen zu einer gemeinsamen Wirkungskette. Ökologisch bleibt B ressourcen-/verlustärmer im Modell; ökonomisch teurer; sozial entfällt die benannte Wissensasymmetrie, nicht jede Kosten-, Arbeits- oder Verteilungsfrage. Eigene Handlung kann begrenzte öffentliche Information und kritische Datenprüfung sein, keine eigenmächtige Düngerdosierung. Begründet priorisierte Bewertung aktualisieren und Quelle/Modellannahmen nennen; gleiches Wissen ist keine erfundene chemische Mengenänderung.
  - Expected performance (EN): Historical production expands fertiliser availability; current needs/material-flow knowledge supplements the quantity question. Product/process can support supply while causing resource/energy demand and losses; method/knowledge support more targeted use. B reduces model resources/losses, costs more and needs accessible advice; social sustainability requires access/fair burdens. Own action could check data/application guidance and reflect on resource consumption, not unauthorised fertilisation. Numbers are teaching indicators, not a complete real lifecycle assessment or historical measurements.
Fresh transfer: Equally accessible public knowledge improves social knowledge access while model A=10/8/4 and B=7/9/2 for resources/cost/loss remain unchanged. Historically industrial ammonia enabled new nitrogen supply; currently product NH3, production process, analysis/need methods and knowledge belong to one impact chain. Environmentally B remains less resource-/loss-intensive in the model; economically more costly; socially the named knowledge asymmetry disappears, not every cost, labour or distribution issue. Own action can be bounded public information and critical data checking, not unauthorised fertiliser dosing. Update justified prioritised evaluation and identify source/model assumptions; equal knowledge is not an invented chemical quantity change.
  - Understanding focus (DE): Historische/aktuelle Produkt-Methoden-Verfahrens-Wissenswirkung wird in allen drei Perspektiven und eigener Handlung überprüft.
  - Understanding focus (EN): Historical/current product–method–process–knowledge impacts are reviewed in all three perspectives and own action.
- `upper-chemical-effects-sustainability-cooling-substitutes`
  - Task demand (DE): Bewerte historische und aktuelle Wirkungen aller vier Bereiche aus ökologischer, ökonomischer und sozialer Perspektive. Reflektiere eigenes mögliches Verhalten, wissenschaftliche Grenzen und Zielkonflikte, ohne selbst an Kühlgeräten zu arbeiten.
Frische Variation: Neue Leckdaten verschlechtern Modell F: Überprüfe die Wirkungskette und dein Urteil statt nur den Stoffnamen zu wechseln.
  - Task demand (EN): Assess historical/current impacts of all four areas from ecological, economic and social perspectives. Reflect on possible own behaviour, scientific limits and conflicts without working on cooling equipment yourself.
Fresh variation: New leak data worsen model F: review the impact chain and judgment rather than only switching the substance label.
  - Expected performance (DE): Ersatzentwicklung kann Ozonfolgen verringern, doch Klima-, Sicherheits-, Kosten- und Zugangsfolgen bleiben getrennt zu prüfen. Produktwahl, Leckkontrolle, Rückgewinnung und Wirkungswissen haben verschiedene Hebel. F bietet ökologischen Modellvorteil, braucht sichere technische Lösung und finanzierbaren Zugang; soziale Verteilung/Verantwortung ergänzt Wirtschaftlichkeit. Eigenes Handeln: Nutzung/Bedarf prüfen, Schäden melden und fachgerechten Service/Sammlung nutzen, kein eigenmächtiges Eingreifen. Historischer Erfolg beweist nicht, dass jeder Ersatzstoff in allen Dimensionen nachhaltig ist.
Frischer Transfer: Neue höhere Leckage von F kann den Vorteil eines geringeren Klimawirkungsfaktors verkleinern oder aufheben; dafür braucht man tatsächlich freigesetzte Menge, Wirkungsfaktor, Zeit/Bezugsleistung und Unsicherheiten, nicht nur das Label. Keine neuen Zahlen sind vorgegeben, daher folgt keine sichere neue Rangfolge. Historisch und aktuell Produktwahl, Herstellungs-/Rückgewinnungsverfahren, Leckprüfmethode und atmosphärische Erkenntnisse verbinden. Ökologisch Emissionen und Energie erneut prüfen; ökonomisch Verluste, Wartung/Kosten und sozial Sicherheit/Zugang berücksichtigen. Methode/Leckdaten kritisch prüfen und sichere qualifizierte Reparatur/Rückgewinnung als Option abwägen. Eigenes Handeln beschränkt sich auf sachgerechte Nutzung/Fehlermeldung; keine Anlage öffnen. Ozonvorteil allein beweist weiterhin keine Gesamtnachhaltigkeit.
  - Expected performance (EN): Substitution can reduce ozone impacts, but climate, safety, cost and access consequences need separate assessment. Product choice, leak checks, recovery and effect knowledge provide different levers. F offers a model ecological advantage, requiring a safe technical solution and affordable access; social distribution/responsibility supplements profitability. Own action: review use/need, report damage and use qualified service/collection, no unauthorised intervention. Historical success does not prove every substitute sustainable in all dimensions.
Fresh transfer: New higher leakage of F may reduce or erase an advantage from its lower climate impact factor; this needs actual released amount, impact factor, time/reference service and uncertainties, not merely a label. No new numbers are supplied, so no definite new ranking follows. Connect product choice, production/recovery process, leak-check method and atmospheric knowledge historically and currently. Recheck emissions and energy environmentally; consider losses, maintenance/cost economically and safety/access socially. Critically check method/leak data and weigh safe qualified repair/recovery as options. Own action is confined to suitable use/fault reporting; do not open the system. Ozone benefit alone still does not establish overall sustainability.
  - Understanding focus (DE): Neue Betriebsdaten ändern eine begrenzte nachhaltige Wirkungskette und verlangen methodisch begründete Neubewertung.
  - Understanding focus (EN): New operating data change a bounded sustainability impact chain and require methodically justified reassessment.
- `hb-bio-beet-sugar-production-three-criteria-9f89`
  - Task demand (DE): Bearbeite den vollständigen unveränderten HB155-Zuckerfall einschließlich A/B-Urteil und C-Transfer.
  - Task demand (EN): Handle the complete unchanged HB155 sugar case including A/B judgment and C transfer.
  - Expected performance (DE): Stoff-/Trennprinzipien,gleichfunktionale Daten und drei Perspektiven verbinden;fehlender Sozialnachweis ist kein bewiesener Verstoß.
  - Expected performance (EN): Connect separation/substance principles,equal-function data and three perspectives;missing social evidence is no proven violation.
  - Understanding focus (DE): Bewertung industrieller Zuckergewinnung verknüpft Stoff-/Trennprozess mit ökologischen,ökonomischen und sozialen Kriterien unter gleicher Funktion/Systemgrenze.
  - Understanding focus (EN): Evaluation of industrial sugar production links substance/separation processes with environmental,economic and social criteria under equal function/boundary.
## Page 20: Geschlossene Puffersysteme

- Full learning-goal ID: `9fef5c29-62bc-5ada-b96b-6885bcb049cb`
- Goal fingerprint: `sha256:73fed7cc4495065b177881a98ad74f77b8d784a7c931aecc023f7e7d3cb2b930`
- Page fingerprint: `sha256:b38bfa5fa137653d0680c42f9fe22328bc074d1f73309db2207aaba9ef6fbb84`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das Phosphat-Puffersystem beschreiben und die Wirkung mithilfe von Le Chatelier begründen.

### Visualization

/assets/goal-visualizations/chemie/9fef5c29-62bc-5ada-b96b-6885bcb049cb/9fef5c29-62bc-5ada-b96b-6885bcb049cb.jpg

- original digest: `sha256:d51fe2463e00151b9a57ccc70f5ff3d0d913bb0020363eb4c9f9f30be4d8a603`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Le-Chatelier-Prinzip nutzen — `5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8a9cf59b9f5d20dcbe5217fc190ca0cf037d429ccfa861c0109c84bd4c6c5adf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `phosphate-gk-c1-r1`
  - Essential understanding (DE): Geschlossener Phosphatpuffer: Teilchen und Verschiebung
  - Essential understanding (EN): Closed phosphate buffer: particles and equilibrium shifts
  - Observable performance (DE): Partner, Gleichgewicht und beide Abfangreaktionen sind richtig und erklärt.
  - Observable performance (EN): Correctly explain partners, equilibrium and both buffering reactions.
- `phosphate-gk-c1-r2`
  - Essential understanding (DE): Geschlossener Phosphatpuffer: Teilchen und Verschiebung
  - Essential understanding (EN): Closed phosphate buffer: particles and equilibrium shifts
  - Observable performance (DE): Le Chatelier und Teilchenschema zeigen die korrekten Änderungen; kleiner pH-Effekt wird von unverändertem pH unterschieden.
  - Observable performance (EN): Le Chatelier and particle schemes show the correct changes, distinguishing a small pH change from no change.
- `phosphate-gk-c1-r3`
  - Essential understanding (DE): Geschlossener Phosphatpuffer: Teilchen und Verschiebung
  - Essential understanding (EN): Closed phosphate buffer: particles and equilibrium shifts
  - Observable performance (DE): Endliche Vorräte, Geschlossenheit und eine konkret begrenzte biologische Bedeutung werden getrennt beurteilt.
  - Observable performance (EN): Distinguish finite reserves, closed conditions and one bounded biological role.

**Coverage expectations**

- required expectations: `phosphate-gk-c1-r1`, `phosphate-gk-c1-r2`, `phosphate-gk-c1-r3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-versus-base`: Säurezugabe durch Basenzugabe an getrennten geschlossenen Phosphatportionen ersetzen. / Replace acid addition with base addition in separate closed phosphate portions.
- `reserve-boundary`: Begrenzte Last mit Erschöpfung und dem Missverständnis eines unveränderlichen pH vergleichen. / Compare limited loading with depletion and the misconception of invariant pH.

**Application cases**

- `phosphate-acid`
  - Task demand (DE): Erkläre für H2PO4−/HPO4²− im geschlossenen Modell die begrenzte Säurezugabe mit Gleichgewicht, Abfangreaktion und Teilchenschema.
  - Task demand (EN): Explain a limited acid addition to a closed H2PO4−/HPO4²− buffer using equilibrium, reaction and particle scheme.
  - Expected performance (DE): HPO4²−+H3O+→H2PO4−+H2O; das Gleichgewicht verschiebt zum protonierten Partner. Die Phosphatbilanz bleibt erhalten, der pH fällt begrenzt und bleibt nicht exakt gleich.
  - Expected performance (EN): HPO4²−+H3O+→H2PO4−+H2O; equilibrium shifts towards the protonated partner. Phosphate balance is conserved and pH falls modestly rather than remaining exactly fixed.
  - Understanding focus (DE): Le Chatelier an konkreten Partneränderungen statt bloßem Schlagwort.
  - Understanding focus (EN): Apply Le Chatelier through concrete partner changes rather than a slogan.
- `phosphate-base-and-limits`
  - Task demand (DE): Übertrage auf begrenzte OH−-Zugabe; widerlege unendliche Pufferreserve und grenze die Enzym-/Biologieanalogie ein.
  - Task demand (EN): Transfer to limited OH− addition, reject infinite reserve and bound the enzyme/biology analogy.
  - Expected performance (DE): H2PO4−+OH−→HPO4²−+H2O. Der pH steigt weniger als im ungepufferten Modell; endliche Partnerbestände begrenzen die Wirkung. Geschlossenheit bedeutet fehlenden weiteren Austausch, nicht unbegrenzte Stabilität oder ein Modell des gesamten Bluts.
  - Expected performance (EN): H2PO4−+OH−→HPO4²−+H2O. pH rises less than in the unbuffered model; finite partner amounts limit action. Closed means no further exchange, not unlimited stability or a model of the whole blood system.
  - Understanding focus (DE): Geänderte Belastungsrichtung und ehrliche Systemgrenzen ohne HH-Rechenpflicht.
  - Understanding focus (EN): Changed loading direction and explicit system limits without compulsory HH calculation.
