# AI review input: Chemie – gezielter aktueller Quellen- und Beschreibungskontext

- Book ID: `chemie-b007-413-current402-targeted-root-20261011-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:30382347eb218be51d529c024848c4319155b37e0f42c2c6856753683a694346`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Löslichkeit und Sättigung aus Daten erklären

- Full learning-goal ID: `413040cd-ba74-5227-948c-a778b0bd0f56`
- Goal fingerprint: `sha256:928b4de7f04bf78b3fc6178b54d20bc86f60b65f53c3f4102e50ba0ddceedaf7`
- Page fingerprint: `sha256:96ed61f26c8ac5fceb0856512f529c68050302c9471e2a68bac1a2939075c144`
- Topic path: Chemie > Chemische Grundlagen (Sek I) > Lösungen und Löslichkeit beschreiben

### Canonical description

Die lernende Person kann für einen vorgegebenen Stoff, ein Lösungsmittel und eine Temperatur aus Mengen- und Beobachtungsdaten erklären, ob eine Lösung gesättigt oder ungesättigt ist und welche zusätzliche Stoffmenge sich unter diesen Bedingungen noch lösen kann.

### Visualization

/assets/goal-visualizations/chemie/413040cd-ba74-5227-948c-a778b0bd0f56/413040cd-ba74-5227-948c-a778b0bd0f56.png

- original digest: `sha256:12ef7e530ae7d42c09907db1f9b32e62c8b6fe20f7980a883e9d6e865a1ffd3d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5d2165ed50a7def9e404465d2e2fbad92e7a73ad491d837bf885cc0f3e47ec12`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `understanding`
  - Essential understanding (DE): Die Löslichkeitsgrenze gilt für eine bestimmte Stoffkombination und Temperatur. Sättigung kann auch ohne sichtbaren Bodensatz vorliegen; Rühren verändert nicht automatisch die Gleichgewichtsgrenze.
  - Essential understanding (EN): A solubility limit applies to a specified substance pair and temperature. Saturation can occur without visible residue; stirring does not automatically change the equilibrium limit.
  - Observable performance (DE): Die lernende Person bestimmt aus der vorgegebenen Löslichkeit die Kapazität der jeweiligen Wassermenge, trennt gelöste Masse und Bodensatz und begründet ungesättigt beziehungsweise gesättigt einschließlich des klaren Grenzfalls. Sie bilanziert die zusätzliche Wassermenge, statt weitere Löslichkeit allein aus längerem Rühren oder aus einer Temperaturänderung ohne neue Daten zu behaupten.
  - Observable performance (EN): The learner derives capacity for the given water mass from the supplied solubility, distinguishes dissolved mass from residue and justifies unsaturated or saturated states including the clear limiting case. They balance additional water rather than claiming more solubility from stirring longer or from a temperature change without new data.

**Coverage expectations**

- required expectations: `understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-conditions`: Bei 20 °C wurden nur 20,0 g U in 80,0 g Wasser gegeben. Ein Mitschüler behauptet: „Dieser Stoff macht immer Bodensatz.“ Begründe den neuen Fall. / At 20 °C only 20.0 g U was added to 80.0 g water. A classmate claims “This substance always leaves residue.” Explain the new case.

**Application cases**

- `solubility-clear-saturated-countercase`
  - Task demand (DE): Bestimme für A und B die maximal lösbare Menge, begründe gesättigt/ungesättigt und berechne die zusätzlich lösbare Menge T. Beurteile „Ohne Bodensatz ist jede Lösung ungesättigt“.
  - Task demand (EN): Determine the maximum dissolvable amount for A and B, justify saturated/unsaturated and calculate how much more T can dissolve. Assess “Every solution without residue is unsaturated.”
  - Expected performance (DE): Für 40,0 g Wasser beträgt die Grenze 24,0 × 40,0/100,0 = 9,6 g T. A ist ungesättigt: noch 9,6 − 7,2 = 2,4 g können sich lösen. B ist bereits an der Grenze und damit gesättigt; zusätzlich 0 g. Dass B klar und ohne Bodensatz ist, ändert die Grenzmenge nicht. Die Behauptung ist falsch.
  - Expected performance (EN): For 40.0 g water the limit is 24.0 × 40.0/100.0 = 9.6 g T. A is unsaturated: another 9.6 − 7.2 = 2.4 g can dissolve. B is at the limit and saturated; another 0 g can dissolve. Its clear appearance without residue does not change the limiting amount. The claim is false.
  - Understanding focus (DE): Die Löslichkeitsgrenze gilt für eine bestimmte Stoffkombination und Temperatur. Sättigung kann auch ohne sichtbaren Bodensatz vorliegen; Rühren verändert nicht automatisch die Gleichgewichtsgrenze.
  - Understanding focus (EN): A solubility limit applies to a specified substance pair and temperature. Saturation can occur without visible residue; stirring does not automatically change the equilibrium limit.
- `solubility-residue-water-and-temperature`
  - Task demand (DE): Bestimme zunächst gelöste Menge, Rest und Sättigung. Kann bloß längeres Rühren den Rest unter denselben Gleichgewichtsbedingungen vollständig lösen? Bestimme dann den Zustand nach Änderung A. Nenne für B die fehlende entscheidende Angabe.
  - Task demand (EN): First determine dissolved amount, residue and saturation. Can simply stirring longer dissolve all residue under the same equilibrium conditions? Then determine the state after A and name the decisive missing value for B.
  - Expected performance (DE): Zunächst sind maximal 30,0 × 80,0/100,0 = 24,0 g gelöst; 32,0 − 24,0 = 8,0 g bleiben als Rest. Die Flüssigkeitsphase ist gesättigt. Noch mehr Rühren ändert unter den ausdrücklich bereits erreichten Gleichgewichtsbedingungen die Grenze nicht. Nach A: 120,0 g Wasser, Grenze 36,0 g; alle 32,0 g lösen sich, 4,0 g zusätzliche Kapazität, ungesättigt. Für B brauche ich die Löslichkeit bei 40 °C; ich darf die 20-°C-Grenze weder unverändert übernehmen noch eine bestimmte Zunahme erraten.
  - Expected performance (EN): Initially at most 30.0 × 80.0/100.0 = 24.0 g is dissolved; 32.0 − 24.0 = 8.0 g remains. The liquid phase is saturated. More stirring does not change the limit under explicitly attained equilibrium conditions. After A: 120.0 g water, limit 36.0 g; all 32.0 g dissolves, with 4.0 g further capacity, so unsaturated. B requires solubility at 40 °C; I may neither reuse the 20 °C limit unchanged nor guess a particular increase.
  - Understanding focus (DE): Die Löslichkeitsgrenze gilt für eine bestimmte Stoffkombination und Temperatur. Sättigung kann auch ohne sichtbaren Bodensatz vorliegen; Rühren verändert nicht automatisch die Gleichgewichtsgrenze.
  - Understanding focus (EN): A solubility limit applies to a specified substance pair and temperature. Saturation can occur without visible residue; stirring does not automatically change the equilibrium limit.
