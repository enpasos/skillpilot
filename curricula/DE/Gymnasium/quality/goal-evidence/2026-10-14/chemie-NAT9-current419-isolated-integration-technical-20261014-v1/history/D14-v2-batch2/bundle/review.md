# AI review input: Chemie Q2.1 – Prüfmaterial

- Book ID: `chemie-q2-targeted-v2-2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:f28dc9d3bff7dccba7ab6802bd367e79c1714b7e1c2f70d6437891a69ca55de5`
- Selected goals: 14

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Aminocarbonsäuren nach Restfunktionalität klassifizieren

- Full learning-goal ID: `b47d542d-c2d7-5554-95dc-10b47ab622ab`
- Goal fingerprint: `sha256:d20eff71943cb24db354393c4bfee0af12c4128a1e482099132000822d09b788`
- Page fingerprint: `sha256:cf6ef9ab4dd463305a7825c19506945977af9d1ea7f57860b2b6d97ba813f6ed`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann Aminocarbonsäuren anhand der Funktionalität ihrer Seitenketten gruppieren und beobachtbare Eigenschaften aus den unterschiedlichen Resten erklären.

### Visualization

/assets/goal-visualizations/chemie/b47d542d-c2d7-5554-95dc-10b47ab622ab/b47d542d-c2d7-5554-95dc-10b47ab622ab.png

- original digest: `sha256:3f6caf83b5e380e9c1951b821dbc3d9e20ac0dcceae2784bc7e120037819ba87`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Aminocarbonsäuren elektrophoretisch trennen und auswerten — `d1244f5d-9a12-5b74-97fe-ae974f40af26` (page 2)

### Prerequisites outside this book

- Aminosäuren über Säure-Base-Verhalten erklären — `e9d34f34-2a43-5cc7-bcca-1d08e057531d` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:71e871fa45593980bf496cccf1f86b723f833126e60d534f3bcd058e2884db08`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Beobachtete Eigenschaftderfreien Aminosäureerklären.
  - Essential understanding (EN): Explain observed properties of free amino acids.
  - Observable performance (DE): Leucinrestunpolar, Lysinrestbasisch/bei7weitgehendprotoniert. Auch Leucinträgt NH3+/COO−undistnichtpauschalwasserunlöslich. Ladung, pH, Kristallgitter, Konzentration/Temperaturbeeinflussenfreie AA-Löslichkeit; Datenkeine Proteinpositionsregel.
  - Observable performance (EN): Leucine residue nonpolar, lysine basic/protonated near7. Leucine also has NH3+/COO− and is not absolutely insoluble. Charge, pH, lattice, concentration/temperature affect free amino acids; not protein position rule.
- `aspect-2`
  - Essential understanding (DE): pH-Variationüberfreie AA-Seitenkettenhinausdeuten.
  - Essential understanding (EN): Interpret ph variation beyond residue polarity.
  - Observable performance (DE): Beip H3 alpha COO−, NH3+, Seiten COOH: netto0; beip H8 beide COO−, NH3+: netto−1. Protonierung/Wasserkontakteverändernsich; beobachtete Löslichkeitbenötigtkontrollierte Mengen/Gitterbedingungen.
  - Observable performance (EN): At pH3alpha COO−, NH3+, side COOH net0; at pH8two COO−/NH3+net−1. Protonation/water interactions changes; solubility requires controlled amounts/lattice conditions.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Synthetischer Beobachtungsfall: freie Leucinlösungzeigtbei20°C, pH7 und20g/Lkeinen Feststoff, bei50g/LFeststoff; Lysin50g/Listklar. Ordne Seitenketteneinundbegründeunterschiedliche Löslichkeitunterdiesen Bedingungenmitgemeinsamenionisierbaren Gruppen; keine Allgemeinaussageunlöslich.
  - Task demand (EN): Synthetic observations: free leucine20g/L at20°C, pH7is clear, 50g/L has solid; lysine50g/L is clear. Classify sidechains and explain bounded solubility with shared ionisable groups; do not say insoluble.
  - Expected performance (DE): Leucinrestunpolar, Lysinrestbasisch/bei7weitgehendprotoniert. Auch Leucinträgt NH3+/COO−undistnichtpauschalwasserunlöslich. Ladung, pH, Kristallgitter, Konzentration/Temperaturbeeinflussenfreie AA-Löslichkeit; Datenkeine Proteinpositionsregel.
  - Expected performance (EN): Leucine residue nonpolar, lysine basic/protonated near7. Leucine also has NH3+/COO− and is not absolutely insoluble. Charge, pH, lattice, concentration/temperature affect free amino acids; not protein position rule.
  - Understanding focus (DE): Beobachtete Eigenschaftderfreien Aminosäureerklären.
  - Understanding focus (EN): Explain observed properties of free amino acids.
- `case-2`
  - Task demand (DE): Bei gleichem Temperatur/Material wechseltfreies Glutamat vonp H3 zup H8; mitbereitgestelltenp Ka2, 2; 4, 3; 9, 7werdengeladene Formen undgemessene Löslichkeitverglichen. Erkläre Netto-/Seitenkettenladungundwarumeine Änderungnichtnur Restpolaritätbeweist.
  - Task demand (EN): Compare free glutamate at pH3/8under same temperature/material using pKa2.2, 4.3, 9.7 and provided solubility observations. Explain sidechain/net charge and why change is not only residue polarity.
  - Expected performance (DE): Beip H3 alpha COO−, NH3+, Seiten COOH: netto0; beip H8 beide COO−, NH3+: netto−1. Protonierung/Wasserkontakteverändernsich; beobachtete Löslichkeitbenötigtkontrollierte Mengen/Gitterbedingungen.
  - Expected performance (EN): At pH3alpha COO−, NH3+, side COOH net0; at pH8two COO−/NH3+net−1. Protonation/water interactions changes; solubility requires controlled amounts/lattice conditions.
  - Understanding focus (DE): pH-Variationüberfreie AA-Seitenkettenhinausdeuten.
  - Understanding focus (EN): Interpret ph variation beyond residue polarity.
## Page 2: Aminocarbonsäuren elektrophoretisch trennen und auswerten

- Full learning-goal ID: `d1244f5d-9a12-5b74-97fe-ae974f40af26`
- Goal fingerprint: `sha256:d56ff914ba73cce41857f3277124d7c711138be5953bab37e8747d5c9f43f66b`
- Page fingerprint: `sha256:8324097cb54846b63d39b31d6d5be140caf462857f5b915e8bc91cb849292cee`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann Versuchsergebnisse der Elektrophorese von Aminosäuren und Proteinen auswerten und deren Wanderung anhand von Nettoladung und pH-Wert erklären; in Lehrplanrouten mit Planungsauftrag kann sie eine entsprechende Trennung planen.

### Visualization

/assets/goal-visualizations/chemie/d1244f5d-9a12-5b74-97fe-ae974f40af26/d1244f5d-9a12-5b74-97fe-ae974f40af26.jpg

- original digest: `sha256:f765c45a0cf548a2895811987937dd43cfc642483cff184d0f07e77e292763cd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Aminocarbonsäuren nach Restfunktionalität klassifizieren — `b47d542d-c2d7-5554-95dc-10b47ab622ab` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Aminosäuren über Säure-Base-Verhalten erklären — `e9d34f34-2a43-5cc7-bcca-1d08e057531d` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0eec457417844ede46d2387008627854e6cc27df2569cba5f214d1daa932cd8a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Auswertung gehört zu beiden Routen; Planung ist die ausdrücklich getrennte EA-Zusatzanforderung.
  - Essential understanding (EN): Evaluation applies to both routes; planning is the explicitly separated EA addition.
  - Observable performance (DE): Glycin bei pH7 oberhalb seines pI: leicht negative mittlere Nettoladung zur positiven Anode; Lysin unter pI: positive mittlere Ladung zur negativen Kathode; Glutamat: negativ zur Anode. pI allein liefert keine Mobilität oder eindeutige Stoffidentität. Nur EA/LK zusätzlich nachvollziehbarer Plan mit kontrolliertem pH, Anschlüssen und Referenzen.
  - Observable performance (EN): Above its pI, glycine has a slightly negative mean net charge toward the positive anode. Lysine below its pI migrates toward the negative cathode; glutamate toward the anode. pI alone gives neither mobility nor unique identity. Only EA/LK additionally supplies a coherent plan with controlled pH, connections and references.
- `aspect-2`
  - Essential understanding (DE): Neue Bedingungen und Kontrollen prüfen Auswertung; Planungsleistung bleibt routengebunden.
  - Essential understanding (EN): Changed conditions and controls assess evaluation; planning remains route-specific.
  - Observable performance (DE): Glycin bei pI6: mittlere Nettoladung etwa0, keine nennenswerte Nettowanderung; positiv geladenes Lysin müsste zur Kathode. Anschluss/Polbeschriftung und tatsächliche Potentiale prüfen; Orientierung ohne Referenz ist kein Stoffbeweis. EA-Plan legt Puffer, Standards, Anschlussprüfung und neue Ladungsrichtungen bei pH9 fest.
  - Observable performance (EN): Glycine near pI6 has approximately zero mean net charge; positively charged lysine should move toward the cathode. Check connections, polarity labels and actual potentials; position without references does not establish identity. The EA plan specifies buffer, standards, connection checks and changed charge directions at pH9.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-and-conditions`: Material, Stoffstruktur, Messbedingung oder Bewertungsdossier wechseln wie in den zwei ausdrücklich ausgearbeiteten Fällen; quantitative Angaben sind synthetische Aufgabenwerte. / Material, molecular structure, measurement conditions or evaluation dossier vary as explicitly specified in the two worked cases; numerical values are synthetic task data.

**Application cases**

- `case-1`
  - Task demand (DE): GA/GK- und EA/LK-Quellroute: Werte ein Elektropherogramm bei pH7 mit Glycin(pI6), Lysin(pI9,7) und Glutamat(pI3,2) aus. Erkläre mittlere Nettoladung, Richtung und Grenzen der Identifikation. Nur EA/LK-Route zusätzlich: Plane eine entsprechende Trennung mit Puffer, Referenzen und Elektrodenzuordnung.
  - Task demand (EN): GA/GK and EA/LK source routes: evaluate a pH7 electropherogram of glycine(pI6), lysine(pI9.7) and glutamate(pI3.2). Explain mean net charge, direction and identification limits. Only the EA/LK route additionally plans a separation using buffer, references and electrode assignment.
  - Expected performance (DE): Glycin bei pH7 oberhalb seines pI: leicht negative mittlere Nettoladung zur positiven Anode; Lysin unter pI: positive mittlere Ladung zur negativen Kathode; Glutamat: negativ zur Anode. pI allein liefert keine Mobilität oder eindeutige Stoffidentität. Nur EA/LK zusätzlich nachvollziehbarer Plan mit kontrolliertem pH, Anschlüssen und Referenzen.
  - Expected performance (EN): Above its pI, glycine has a slightly negative mean net charge toward the positive anode. Lysine below its pI migrates toward the negative cathode; glutamate toward the anode. pI alone gives neither mobility nor unique identity. Only EA/LK additionally supplies a coherent plan with controlled pH, connections and references.
  - Understanding focus (DE): Auswertung gehört zu beiden Routen; Planung ist die ausdrücklich getrennte EA-Zusatzanforderung.
  - Understanding focus (EN): Evaluation applies to both routes; planning is the explicitly separated EA addition.
- `case-2`
  - Task demand (DE): GA/GK und EA/LK: In einer dokumentierten zweiten Trennung bei pH6 wandert eine Glycin-Referenz kaum, eine Lysin-Referenz zur beschrifteten positiven Elektrode. Prüfe den vermuteten vertauschten Anschluss anhand der Referenzen und begründe eine Kontrollmessung. Nur EA/LK zusätzlich: Plane den überprüften Aufbau und den pH-Wechsel auf9.
  - Task demand (EN): GA/GK and EA/LK: in a documented second separation at pH6, glycine barely migrates while lysine moves toward the labelled positive electrode. Assess suspected reversed connections using the references and justify a control measurement. Only EA/LK additionally plans the corrected setup and a change to pH9.
  - Expected performance (DE): Glycin bei pI6: mittlere Nettoladung etwa0, keine nennenswerte Nettowanderung; positiv geladenes Lysin müsste zur Kathode. Anschluss/Polbeschriftung und tatsächliche Potentiale prüfen; Orientierung ohne Referenz ist kein Stoffbeweis. EA-Plan legt Puffer, Standards, Anschlussprüfung und neue Ladungsrichtungen bei pH9 fest.
  - Expected performance (EN): Glycine near pI6 has approximately zero mean net charge; positively charged lysine should move toward the cathode. Check connections, polarity labels and actual potentials; position without references does not establish identity. The EA plan specifies buffer, standards, connection checks and changed charge directions at pH9.
  - Understanding focus (DE): Neue Bedingungen und Kontrollen prüfen Auswertung; Planungsleistung bleibt routengebunden.
  - Understanding focus (EN): Changed conditions and controls assess evaluation; planning remains route-specific.
## Page 3: Proteinlöslichkeit und Denaturierung erklären

- Full learning-goal ID: `058dca74-1b57-5eb3-9c94-1c7b6cc795ad`
- Goal fingerprint: `sha256:0a7730571fc9116f1aa42f8b251b72bb933de758b8a62e3380f624165906eac8`
- Page fingerprint: `sha256:5e44f724cdc6374a8e06b5a14de33c1b57b4d19afa04593c0d0dbf0914720700`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann Löslichkeit und Denaturierung von Proteinen unter verschiedenen Reaktionsbedingungen erklären und Folgen für die Wirksamkeit von Enzymen in Stoffwechsel, Waschmitteln oder weiteren Kontexten ableiten.

### Visualization

/assets/goal-visualizations/chemie/058dca74-1b57-5eb3-9c94-1c7b6cc795ad/058dca74-1b57-5eb3-9c94-1c7b6cc795ad.jpg

- original digest: `sha256:8d4ac5181f2321fe1b0823d7907fc5a8c18ad37393469078572ea80e01361a5b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Proteinstruktur und Faltung — `065d764c-daec-5d35-95da-3e922d2029c7` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fcc18d728b15bde674e31b16284a03651c8248ae2d4bdca0a6c676a0b3c4fe8b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Durchführung alsbeobachtbare Fertigkeit plus Deutung.
  - Essential understanding (EN): Execution a san observable skill plus interpretation.
  - Observable performance (DE): Kontrolliertes Erhitzen bei identischen Volumina, Protokoll und Wasserkontrolle. Denaturierungkannhöhere Struktur/Aggregationändern; Fällungbeweistkeine Peptidhydrolyse. Beobachtung wirdtatsächlichnotiert, einunerwarteter Befundbegründetuntersucht.
  - Observable performance (EN): Controlled heating, equal volumes, log/water control. Denaturation can change higher structure/aggregation; precipitation does not prove peptide hydrolysis. Record real observations, investigate unexpected findings.
- `aspect-2`
  - Essential understanding (DE): Proteinlöslichkeit separatprüfbar erklären.
  - Essential understanding (EN): Explain protein solubility explicitly.
  - Observable performance (DE): Polare/geladene Oberflächenbilden H-Brücken/Ion-Dipol-Kontakte mit Wasser. Hohe Salzkonzentrationändert Hydratation/Wechselwirkungen undkann Aussalzenfördern; Protein-/pH-Abhängigkeit, nichteinuniverselles Salzgesetz. Reversibilitätbelegtkeine Peptidhydrolyse.
  - Observable performance (EN): Polar/charged surfaces form H-bonds/ion-dipole contacts with water. High salt changes hydration/interactions and can salt out; depends on protein/pH, no universal salt rule. Reversibility does not prove peptide hydrolysis.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Führe einen betreuten Denaturierungsvergleich aus: je2mL identisch verdünnte Eiklarlösung in A/B; A5min20°C, B5min80°C-Wasserbad; C2mLWasser5min80°C. Notiere Anfangszustand, tatsächliche Temperatur/Zeit, Trübung/Flocken nach Abkühlen. Erkläre Struktur-/Löslichkeitsänderung und Primärstrukturgrenze.
  - Task demand (EN): Execute supervised denaturation comparison: 2mL identical ly diluted eggwhite a/B; A5min20°C, B5min80°C water bath; C2ml water5min80°C. Log initial state, actual time/temperature, turbidity/aggregation after cooling; explain structure/solubility and primary structure limit.
  - Expected performance (DE): Kontrolliertes Erhitzen bei identischen Volumina, Protokoll und Wasserkontrolle. Denaturierungkannhöhere Struktur/Aggregationändern; Fällungbeweistkeine Peptidhydrolyse. Beobachtung wirdtatsächlichnotiert, einunerwarteter Befundbegründetuntersucht.
  - Expected performance (EN): Controlled heating, equal volumes, log/water control. Denaturation can change higher structure/aggregation; precipitation does not prove peptide hydrolysis. Record real observations, investigate unexpected findings.
  - Understanding focus (DE): Durchführung alsbeobachtbare Fertigkeit plus Deutung.
  - Understanding focus (EN): Execution a san observable skill plus interpretation.
- `case-2`
  - Task demand (DE): Synthetische kontrollierte Proteinproben: gleicherp H7/20°C, 0, 1mol/LNaCl bleibtklar, 2mol/LNaCl zeigt Fällung; nach Verdünnungin0, 1M wirdsie wiederklar. Erkläre Protein-Wasser-Kontakte, Salzabhängigkeit undwarumreversible Fällungkeinedauerhafte Denaturierungbeweist.
  - Task demand (EN): Synthetic controlled protein: pH7/20°C, .1M NaCl clear, 2M precipitates, redilution to.1M clear. Explain protein-water contacts, salt dependence and why reversible precipitation does not prove denaturation.
  - Expected performance (DE): Polare/geladene Oberflächenbilden H-Brücken/Ion-Dipol-Kontakte mit Wasser. Hohe Salzkonzentrationändert Hydratation/Wechselwirkungen undkann Aussalzenfördern; Protein-/pH-Abhängigkeit, nichteinuniverselles Salzgesetz. Reversibilitätbelegtkeine Peptidhydrolyse.
  - Expected performance (EN): Polar/charged surfaces form H-bonds/ion-dipole contacts with water. High salt changes hydration/interactions and can salt out; depends on protein/pH, no universal salt rule. Reversibility does not prove peptide hydrolysis.
  - Understanding focus (DE): Proteinlöslichkeit separatprüfbar erklären.
  - Understanding focus (EN): Explain protein solubility explicitly.
## Page 4: Außenfaktoren auf Enzymreaktionen erklären

- Full learning-goal ID: `b4ca3af2-77f1-59e8-955d-c4959e284242`
- Goal fingerprint: `sha256:a2157e7640be7b4bd25b7e2841ff6d1b288974aa9b0c3ead3ce713fc37a4150c`
- Page fingerprint: `sha256:64a8ad6d1cb17e8362c16d46c84405a702f480b42d3451498e73f26b7a2ce826`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann den Einfluss von Temperatur, pH-Wert, Konzentrationen und weiteren Außenfaktoren auf die Geschwindigkeit von Enzymreaktionen beschreiben.

### Visualization

/assets/goal-visualizations/chemie/b4ca3af2-77f1-59e8-955d-c4959e284242/b4ca3af2-77f1-59e8-955d-c4959e284242.png

- original digest: `sha256:82eb3a0402528dbb09b770454f7de93d035ed5b43a22146d8cc0a027cf314405`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Enzymreaktionen und Hemmung modellieren — `f7f35d71-927a-511c-a49e-65a66794a9bc` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Untersuchungen an Lebewesen sicher und hypothesengeleitet durchfuehren — `3351fe47-5b0c-5407-a3bf-05229cfbf0c5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a21b53887a6dc0e3147f4791cffc99099074497ba82c060cfc73edb5058c677c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Reaktionsrate hängt sowohl von Kollisionen als auch von Enzymzustand und Sättigung ab.
  - Essential understanding (EN): Rate depends on encounters, enzyme state and saturation.
  - Observable performance (DE): Mehr wirksame Begegnungen erhöhen zunächst Rate; Denaturierung kann bei Hitze absenken. Rückkühlen/Gleichmessung trennt reversible Kinetik und bleibenden Strukturverlust.
  - Observable performance (EN): More effective encounters initially increase rate; heat denaturation may lower it. Recooling/equal measurement separates reversible kinetics and persistent damage.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Sättigung begrenzt verfügbare aktive Zentren; pH beeinflusst Protonierung/Struktur. Plateau beweist keinen Substratverbrauch, weil Anfangsraten verglichen werden.
  - Observable performance (EN): Saturation limits available active sites; pH affects protonation and structure. A plateau does not prove substrate exhaustion because initial rates are compared.

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
  - Task demand (DE): Ein Datensatz zeigt steigende Enzymrate bis zu mäßiger Temperatur und danach starkes Absinken. Erkläre beide Bereiche und plane eine Rückkühlkontrolle.
  - Task demand (EN): A dataset shows enzyme rate increasing to moderate temperature and then sharply dropping. Explain both and plan recooling control.
  - Expected performance (DE): Mehr wirksame Begegnungen erhöhen zunächst Rate; Denaturierung kann bei Hitze absenken. Rückkühlen/Gleichmessung trennt reversible Kinetik und bleibenden Strukturverlust.
  - Expected performance (EN): More effective encounters initially increase rate; heat denaturation may lower it. Recooling/equal measurement separates reversible kinetics and persistent damage.
  - Understanding focus (DE): Reaktionsrate hängt sowohl von Kollisionen als auch von Enzymzustand und Sättigung ab.
  - Understanding focus (EN): Rate depends on encounters, enzyme state and saturation.
- `case-b-transfer`
  - Task demand (DE): Bei unveränderter Enzymmenge steigt die Anfangsrate mit Substratkonzentration bis zu einem Plateau; ein pH-Wechsel senkt sie. Begründe beide Einflüsse.
  - Task demand (EN): At fixed enzyme amount, initial rate rises with substrate to a plateau; a pH shift lowers it. Explain both influences.
  - Expected performance (DE): Sättigung begrenzt verfügbare aktive Zentren; pH beeinflusst Protonierung/Struktur. Plateau beweist keinen Substratverbrauch, weil Anfangsraten verglichen werden.
  - Expected performance (EN): Saturation limits available active sites; pH affects protonation and structure. A plateau does not prove substrate exhaustion because initial rates are compared.
  - Understanding focus (DE): Reaktionsrate hängt sowohl von Kollisionen als auch von Enzymzustand und Sättigung ab.
  - Understanding focus (EN): Rate depends on encounters, enzyme state and saturation.
## Page 5: Reduzierende Kohlenhydrate und Glucose nachweisen

- Full learning-goal ID: `96d33fb6-ed14-50ab-b5c7-5ce0559d518a`
- Goal fingerprint: `sha256:5e004f86532dec13242591f1ae3043ba488ae176a10d5ce272d6a4e373d4bcce`
- Page fingerprint: `sha256:986cc4259580c001495a671f45232b03e48d489da77da0414e4187f678a1d89d`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann Nachweise für reduzierende Kohlenhydrate und Glucose, etwa Benedict-, Tollens- oder GOD-Test, durchführen, auswerten und strukturbezogen erklären.

### Visualization

/assets/goal-visualizations/chemie/96d33fb6-ed14-50ab-b5c7-5ce0559d518a/96d33fb6-ed14-50ab-b5c7-5ce0559d518a.jpg

- original digest: `sha256:7ed87db97d140e8fdf2f44c33071ba95be9400db08a01050fcb5ec31eef7fe2e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Koordinative Bindung in der Fehling-Probe deuten — `363c5740-8a3c-50b8-8c3a-5548c80c36ea` (outside this book)
- Reduzierende Kohlenhydrate nachweisen und erklären — `1d2e7b80-653d-57b8-a284-8ede5a353b73` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Naturstoffe — `31148286-b8db-57a7-8da2-2e0479240a2c` (outside this book)

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
## Page 6: Nukleinsäuren als Biomoleküle einordnen

- Full learning-goal ID: `793189f8-78bd-5204-848b-fd2bbc12e458`
- Goal fingerprint: `sha256:ffe2befc5c766abd19167f8efe207e0014ac8cb3554fe0c62739274d2c49c496`
- Page fingerprint: `sha256:ed423c60f4c6e3c3dc20c213824e6d3288038856714d94785b0f24b2ea3bdf3a`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann Nukleinsäuren anhand grundlegender Strukturmerkmale als Biomoleküle einordnen und ihre biologische Funktion im Vergleich zu Fetten, Kohlenhydraten und Proteinen beschreiben.

### Visualization

/assets/goal-visualizations/chemie/793189f8-78bd-5204-848b-fd2bbc12e458/793189f8-78bd-5204-848b-fd2bbc12e458.png

- original digest: `sha256:5e25ad566dea09dcedc248e8d7c5cf684b9af216d8dfe2671c07d82ee1a503e5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Funktionelle Gruppen qualitativ nachweisen — `3de28598-672f-5753-8a45-8f559c2f9dc2` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6491721b0cf63a54cf1de32753e44364d90caf2ac383b1ef5dd18be7e7a35ffb`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Stoffklassenvergleichschließt Fetteein.
  - Essential understanding (EN): Class comparison includes fats.
  - Observable performance (DE): DNA/RNA: Nucleotide mit Zucker/Phosphat/Basen und Phosphodiesterbindungen; Protein: Aminosäuren/Peptidbindungen; Fett: Glycerin/Fettsäurereste drei Ester, kein Nucleotidpolymer. Information/Katalyse/Speicherung sindstrukturellbegründete Rollen.
  - Observable performance (EN): DNA/RNA: nucleotides/sugar-phosphate-base, phosphodiesters; proteins: amino acids/peptides; fats: glycerol/fatty acid residues, three esters, not nucleotide polymers. Explain information, catalytic, storage roles structurally.
- `aspect-2`
  - Essential understanding (DE): Neue Strukturenmitvollständigem Vergleicheinordnen.
  - Essential understanding (EN): Classify changed structures with complete comparison.
  - Observable performance (DE): A: Fett/Triacylglycerid; B: RNA.Nucleotidsequenzhatcodierbare Information, Fettresiduenbildenkeinenentsprechenden Basencode. Strukturbelegegehenvoreiner Größenregel.
  - Observable performance (EN): A triacylglycerol fat; B: RNA. Nucleotide sequence can encode information, fat residues do not form a corresponding base code. Use features, not size.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Vergleiche DNA, RNA, Proteine und Fette anhandvon Bausteinen, Bindungstypen und Funktionen. Nutze Strukturkarten mit Nucleotid, Peptid und Triacylglycerid undbegründe die Einordnung.
  - Task demand (EN): Compare dna, RNA, proteins and fats by units, linkages/functions using nucleotide, peptide and triacylglycerol cards.
  - Expected performance (DE): DNA/RNA: Nucleotide mit Zucker/Phosphat/Basen und Phosphodiesterbindungen; Protein: Aminosäuren/Peptidbindungen; Fett: Glycerin/Fettsäurereste drei Ester, kein Nucleotidpolymer. Information/Katalyse/Speicherung sindstrukturellbegründete Rollen.
  - Expected performance (EN): DNA/RNA: nucleotides/sugar-phosphate-base, phosphodiesters; proteins: amino acids/peptides; fats: glycerol/fatty acid residues, three esters, not nucleotide polymers. Explain information, catalytic, storage roles structurally.
  - Understanding focus (DE): Stoffklassenvergleichschließt Fetteein.
  - Understanding focus (EN): Class comparison includes fats.
- `case-2`
  - Task demand (DE): Ein unbekanntes Molekül besitzt Glycerin, dreilange Reste unddrei Ester, aberkeine Basen; einzweitesenthält Zucker-Phosphat-Kette mit Uracil. Identifiziere Stoffklassen undprüfeobjedesgroße Biomolekül Informationcodiert.
  - Task demand (EN): Unknown A has glycerol, three long residues/esters, no bases; B has a sugar-phosphate chain/uracil. Identify classes and assess all large biomolecules codify information.
  - Expected performance (DE): A: Fett/Triacylglycerid; B: RNA.Nucleotidsequenzhatcodierbare Information, Fettresiduenbildenkeinenentsprechenden Basencode. Strukturbelegegehenvoreiner Größenregel.
  - Expected performance (EN): A triacylglycerol fat; B: RNA. Nucleotide sequence can encode information, fat residues do not form a corresponding base code. Use features, not size.
  - Understanding focus (DE): Neue Strukturenmitvollständigem Vergleicheinordnen.
  - Understanding focus (EN): Classify changed structures with complete comparison.
## Page 7: Lebensmittelzusammensetzung recherchieren und kategorisieren

- Full learning-goal ID: `9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f`
- Goal fingerprint: `sha256:27b482798b04e63b6ed34c1f741514a765164a243284d52eebbb6aa93612cb03`
- Page fingerprint: `sha256:fd446a0811cfef6ace04030aaa14f957af607e21cccc34299fa985a6363caa74`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann die Zusammensetzung von Lebensmitteln aus geeigneten Quellen recherchieren und Lebensmittel nach selbstgewählten chemisch begründeten Kriterien kategorisieren.

### Visualization

/assets/goal-visualizations/chemie/9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f/9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f.jpg

- original digest: `sha256:86ce063494a4b075d1ae094dc90ee240bab205882ce51b5cc46654e34fc35dea`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Nahrungsmittelinhaltsstoffe strukturbezogen einordnen — `360fccb9-896d-5e67-bf5d-5732621604c9` (page 8)

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Chemische Informationen aus Quellen erschließen — `5b1bb5d9-07b1-5ba9-b320-cc97be917c60` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6d81f823c79352aed3e77d0fdd66157ccc5597a039b31a31e27d66bd7f219565`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Rechercheundquellenkritische Auswertungzeigen.
  - Essential understanding (EN): Show research and critical evaluation.
  - Observable performance (DE): Tatsächliche Quellenbeschaffungmit Fundstellen, gleichartige Bezugsgröße, Protein/Fett/Kohlenhydratund Mikronährstoffgrenzen. Deklaration/Datenbankbelegenkeinevollständige Molekülidentität; Werbung/Datenherkunftunterscheiden.
  - Observable performance (EN): Actual source acquisition with citations/equal units, protein/fat/carbohydrate and micronutrient limits. Labels/databases do not establish complete molecular identity; separate marketing/data provenance.
- `aspect-2`
  - Essential understanding (DE): Quellenerhebungeinesneuen Fallsprüfen.
  - Essential understanding (EN): Check source acquisition for a new case.
  - Observable performance (DE): Neue Quellen/Recherchewerdengezeigt. Bezugsgrößenkorrektumrechnen, Datenlückekeine Nullsetzen; Grenzeeines Vergleichsmit Quelleninteressenund Streuungbegründen.
  - Observable performance (EN): Show new source acquisition; correct unit conversion, missing data is not zero; bound comparison with source interests/variability.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Recherchiere selbst die Zusammensetzungzweierrealer Lebensmittel: finde Originalproduktdeklarationen undeineunabhängigeamtliche Datenquelle. Dokumentiere Suchbegriffe, URL, Abrufdatum, Autor und Auswahl; entnimm Nährstoffeje100g undje Portionundprüfeeine Werbeaussage.
  - Task demand (EN): Research composition of two real foods: find original product labels and an independent official data source. Log queries, URL, date, author/selection; extract nutrients per100g/portion and check a marketing claim.
  - Expected performance (DE): Tatsächliche Quellenbeschaffungmit Fundstellen, gleichartige Bezugsgröße, Protein/Fett/Kohlenhydratund Mikronährstoffgrenzen. Deklaration/Datenbankbelegenkeinevollständige Molekülidentität; Werbung/Datenherkunftunterscheiden.
  - Expected performance (EN): Actual source acquisition with citations/equal units, protein/fat/carbohydrate and micronutrient limits. Labels/databases do not establish complete molecular identity; separate marketing/data provenance.
  - Understanding focus (DE): Rechercheundquellenkritische Auswertungzeigen.
  - Understanding focus (EN): Show research and critical evaluation.
- `case-2`
  - Task demand (DE): Recherchiere einanderes Lebensmittelpaar mitunterschiedlichen Portionen. Sucheeinefehlende Angabegezieltin Originalquelleundprüfe Aussagen pro Portion versuspro100g. Protokolliere Suchwegundwelche Lückeverbleibt.
  - Task demand (EN): Research another food pair with different servings. Seek a missing value in the original source and compare per serving/per100g claims. Log search path/remaining gap.
  - Expected performance (DE): Neue Quellen/Recherchewerdengezeigt. Bezugsgrößenkorrektumrechnen, Datenlückekeine Nullsetzen; Grenzeeines Vergleichsmit Quelleninteressenund Streuungbegründen.
  - Expected performance (EN): Show new source acquisition; correct unit conversion, missing data is not zero; bound comparison with source interests/variability.
  - Understanding focus (DE): Quellenerhebungeinesneuen Fallsprüfen.
  - Understanding focus (EN): Check source acquisition for a new case.
## Page 8: Nahrungsmittelinhaltsstoffe strukturbezogen einordnen

- Full learning-goal ID: `360fccb9-896d-5e67-bf5d-5732621604c9`
- Goal fingerprint: `sha256:a7855c2a26ef7625f432dbaa6145b069f29e3ffa9fea23f172122c07af9da9c8`
- Page fingerprint: `sha256:df8f52afee12b00e17c1a24d110c75f107f95ed46a87d2cd95b6324e9bbc16e9`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann ausgewählte Inhaltsstoffe von Nahrungsmitteln anhand ihres submikroskopischen Baus vergleichen, Makro- und Mikronährstoffen zuordnen und ihre Bedeutung für den menschlichen Körper beschreiben.

### Visualization

/assets/goal-visualizations/chemie/360fccb9-896d-5e67-bf5d-5732621604c9/360fccb9-896d-5e67-bf5d-5732621604c9.png

- original digest: `sha256:391952ba84fce1b268707ce691a1472c6559b3bae89b4876cd625cb64aa7a688`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Lebensmittelzusammensetzung recherchieren und kategorisieren — `9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f` (page 7)

### Direct reverse prerequisites

- Lebensmittelinhaltsstoffe experimentell nachweisen — `8fe39739-2938-5e2c-8db2-08572b44569a` (page 9)
- Nahrungsbestandteile nach Polarität und Resorption einordnen — `9abd8069-17ad-5d30-9102-f8eff6055045` (page 11)
- Verdauungssäfte chemisch erklären — `3681e688-7880-5bb4-9ab9-ef78289345c8` (page 12)

### Prerequisites outside this book

- Struktur-Eigenschafts-Zusammenhänge ableiten — `5a30273a-98d5-5163-bb16-c250b7ed4e7f` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lebensmittelauswahl chemisch und nachhaltig bewerten — `47582f06-d724-5da9-acc6-16c91ab94f67` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2b1ada6be59ea896616b12ce7b7b369f26d0d9dd0e7d06eb82c990fc5dc40698`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Strukturklassifikationundkonkrete Mikronährstofffunktion.
  - Essential understanding (EN): Structure classification and specific micronutrient function.
  - Observable performance (DE): Fett: drei Ester/Resteketten; Protein: Peptidgruppen; Kohlenhydrat: OH/Carbonyl; Ascorbinsäure: Vitamin C, unterstützt Enzyme der Kollagenbildung; Ca2+: Mineralstoff, Bestandteilmineralischer Knochen/Zahnhartsubstanz. Mikro/Makrobeziehtsichauf Mengenbedarf, keine Größenregel.
  - Observable performance (EN): Fat: three esters/residue chains; protein: peptides; carbohydrate: OH/carbonyl. Vitamin C supports enzymes in collagen formation; Ca2+is a mineral component of bone/tooth hard material. Macro/micro concerns required amount, not molecule size.
- `aspect-2`
  - Essential understanding (DE): Neue Mikronährstoffechemisch/funktionellunterscheiden.
  - Essential understanding (EN): Distinguish new micronutrients chemically/functionally.
  - Observable performance (DE): B1: organischer Mikronährstoff, als Thiamindiphosphat Cofaktorvon Stoffwechselenzymen; NaCl: Ionenquelle, Na+unterstützt Ionen-/Wasserhaushaltund Erregungsleitung; Stärke: Glucosepolymer, Energiebereitstellungnach Abbau. Keine Mengeneinstufungaus Molekülgrößederived.
  - Observable performance (EN): B1: organic micronutrient, thiamine diphosphate cofactor; NaCl: ionic source, Na+supports ion/water balance and excitability; starch: glucose polymer, energy after cleavage. Required amount is not deduced from size.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Ordne Triacylglycerid, Peptid, Glucose, Ascorbinsäure undein Calciumsalz anhandihres Baus Makro-/Mikronährstoffen zu. Erkläre für Ascorbinsäure und Calcium jeeinespezifische Körperfunktion.
  - Task demand (EN): Classify triacylglycerol, peptide, glucose, ascorbic acid/calcium salt by structure and macro/micronutrients. Explain e specific body function for ascorbate and calcium.
  - Expected performance (DE): Fett: drei Ester/Resteketten; Protein: Peptidgruppen; Kohlenhydrat: OH/Carbonyl; Ascorbinsäure: Vitamin C, unterstützt Enzyme der Kollagenbildung; Ca2+: Mineralstoff, Bestandteilmineralischer Knochen/Zahnhartsubstanz. Mikro/Makrobeziehtsichauf Mengenbedarf, keine Größenregel.
  - Expected performance (EN): Fat: three esters/residue chains; protein: peptides; carbohydrate: OH/carbonyl. Vitamin C supports enzymes in collagen formation; Ca2+is a mineral component of bone/tooth hard material. Macro/micro concerns required amount, not molecule size.
  - Understanding focus (DE): Strukturklassifikationundkonkrete Mikronährstofffunktion.
  - Understanding focus (EN): Structure classification and specific micronutrient function.
- `case-2`
  - Task demand (DE): Vergleiche in einemneuen Modell ein Vitamin B1-Molekül, NaCl und Stärke. Benenneje Stoffklasse, Bezugzum Bau undeine Rolle; erklärewarum die Bezeichnung Mineralsalzkeineorganische Vitaminstruktur meint.
  - Task demand (EN): Compare vitamin B1, NaCl, starch in a new model. Classify by structure and give one role, distinguishing mineral salt from organic vitamin.
  - Expected performance (DE): B1: organischer Mikronährstoff, als Thiamindiphosphat Cofaktorvon Stoffwechselenzymen; NaCl: Ionenquelle, Na+unterstützt Ionen-/Wasserhaushaltund Erregungsleitung; Stärke: Glucosepolymer, Energiebereitstellungnach Abbau. Keine Mengeneinstufungaus Molekülgrößederived.
  - Expected performance (EN): B1: organic micronutrient, thiamine diphosphate cofactor; NaCl: ionic source, Na+supports ion/water balance and excitability; starch: glucose polymer, energy after cleavage. Required amount is not deduced from size.
  - Understanding focus (DE): Neue Mikronährstoffechemisch/funktionellunterscheiden.
  - Understanding focus (EN): Distinguish new micronutrients chemically/functionally.
## Page 9: Lebensmittelinhaltsstoffe experimentell nachweisen

- Full learning-goal ID: `8fe39739-2938-5e2c-8db2-08572b44569a`
- Goal fingerprint: `sha256:196fb7db626d312dace2dec0a177930eefd42c44a7fc18149aad7e9b1013e36f`
- Page fingerprint: `sha256:08c7dd5f6d65183114f2535833617a7cfff3eed1f42a9020390544327f29f9c3`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann experimentelle Untersuchungen an Lebensmitteln durchführen, um Makronährstoffe und weitere Bestandteile fachgerecht nachzuweisen.

### Visualization

/assets/goal-visualizations/chemie/8fe39739-2938-5e2c-8db2-08572b44569a/8fe39739-2938-5e2c-8db2-08572b44569a.jpg

- original digest: `sha256:c7c12cead33be7401108308275240a27957e04dc38ef9dbd13d11a2f233f717e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Nahrungsmittelinhaltsstoffe strukturbezogen einordnen — `360fccb9-896d-5e67-bf5d-5732621604c9` (page 8)

### Direct reverse prerequisites

- Lebensmittelinhaltsstoffe quantitativ bestimmen — `8da5c5cf-d346-5df9-b4c9-26938fc80a88` (page 10)
- Aminocarbonsäuren und Peptide nachweisen — `5c8f0bbb-103a-579f-87fc-c997afe4fd18` (page 13)

### Prerequisites outside this book

- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:dbaabd4c5731c2e71c98a3e711c131c7630d9250179f271980cd85b101ff895b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Kontrollierter Nachweisgangisteigene Durchführungsleistung.
  - Essential understanding (EN): Controlled assay panel is an execution skill.
  - Observable performance (DE): Durchführung und Kontrollentatsächlichdokumentieren; Iod Stärkedunkelblau, GODGlucosegrünblau, Biuretgeeignete Peptideviolett. Negativbefund/Deklarationerlaubenkeinevollständige Zusammensetzung; Methodenspezifität und Nachweisgrenzenbenennen.
  - Observable performance (EN): Document actual execution/controls. Iodine starch dark blue, GOD glucose green blue, biuret suitable peptides violet. Negative/label does not give complete composition; state specificity/limits.
- `aspect-2`
  - Essential understanding (DE): Fettzweigundkonkretenweiteren Bestandteilausführen.
  - Essential understanding (EN): Execute fat branch and one specific further constituent.
  - Observable performance (DE): Persistenterdurchscheinender Fettfleck gegenübergetrocknetem Wasserstützt Fett im Modell, keineexakte Fettmasseselektiver Beweis. Ascorbat reduziert DCPIPmit Entfärbung; andere Reduktionsmittel/Eigenfarbe/pH könnenstören. Kontrollen/Ausführungundbegrenzte Nachweise für Makro-/Mikronährstoffe dokumentieren.
  - Observable performance (EN): Persistent translucent oil spot vs dried water supports fat in the model, no precise mass or specific identity. Ascorbate reduces DCPIP, decolourising; other reductants, matrix colour/ph interfere. Document execution/controls and bounded macro/micronutrient results.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Führe betreut einen Lebensmittel-Nachweisgang aus. Je2mLgetrenntewässrige Modellproben, Glucose-/Stärke-/Proteinpositive Kontrollen, Wassernegative Kontrolle. Iod-Stärke: 1Tropfenbereitgestellte Lugollösung. Glucose: QUANTOFIXGlucose2seintauchen, abschütteln, nach30sSkalavergleichen. Protein: Biuret2mLProbe+1mLNaOH1M+10Tropfen CuSO4 0, 1M. Nutzegetrennte Pipetten, notiere Ausführung und Befunde.
  - Task demand (EN): Execute supervised a food assay panel using separate2ml aqueous models/positive glucose, starch, protein controls and water negative. Starch: one drop lugo l. Glucose: QUANTOFIX dip2s, shake off, compare scale after30s. Protein: biuret2ml sample+1mL1M NaOH+10drops.1M CuSO4. Use separate pipettes, log execution/findings.
  - Expected performance (DE): Durchführung und Kontrollentatsächlichdokumentieren; Iod Stärkedunkelblau, GODGlucosegrünblau, Biuretgeeignete Peptideviolett. Negativbefund/Deklarationerlaubenkeinevollständige Zusammensetzung; Methodenspezifität und Nachweisgrenzenbenennen.
  - Expected performance (EN): Document actual execution/controls. Iodine starch dark blue, GOD glucose green blue, biuret suitable peptides violet. Negative/label does not give complete composition; state specificity/limits.
  - Understanding focus (DE): Kontrollierter Nachweisgangisteigene Durchführungsleistung.
  - Understanding focus (EN): Controlled assay panel is an execution skill.
- `case-2`
  - Task demand (DE): Ergänze betreut den Lebensmittelgang: jeein Tropfen Modellprobe, Speiseölpositive Kontrolle, Wassernegative Kontrolle aufmarkiertes Filterpapier; nachvollständigem Trocknengegen Lichtvergleichen. Weiterer Bestandteil Vitamin C: je2mLklaregepuffertep H7Modellprobe, Ascorbatstandard0, 1g/L, Wasserblank+0, 10mLbereitgestelltes DCPIP0, 1g/L; Farbe/Zeitprotokollieren. Vergleichemitdemvorherigen Makronährstoffpanel.
  - Task demand (EN): Extend the supervised food panel: one drop sample, oil positive/water negative on separate paper areas, dry completely and compare translucency. Further constituent vitamin C: 2mL clear pH7buffered model, 0.1g/L ascorbate standard/water blank+.10ml provided0.1g/LDCPIP; log colour/time. Compare with macro-panel.
  - Expected performance (DE): Persistenterdurchscheinender Fettfleck gegenübergetrocknetem Wasserstützt Fett im Modell, keineexakte Fettmasseselektiver Beweis. Ascorbat reduziert DCPIPmit Entfärbung; andere Reduktionsmittel/Eigenfarbe/pH könnenstören. Kontrollen/Ausführungundbegrenzte Nachweise für Makro-/Mikronährstoffe dokumentieren.
  - Expected performance (EN): Persistent translucent oil spot vs dried water supports fat in the model, no precise mass or specific identity. Ascorbate reduces DCPIP, decolourising; other reductants, matrix colour/ph interfere. Document execution/controls and bounded macro/micronutrient results.
  - Understanding focus (DE): Fettzweigundkonkretenweiteren Bestandteilausführen.
  - Understanding focus (EN): Execute fat branch and one specific further constituent.
## Page 10: Lebensmittelinhaltsstoffe quantitativ bestimmen

- Full learning-goal ID: `8da5c5cf-d346-5df9-b4c9-26938fc80a88`
- Goal fingerprint: `sha256:88669bed33064c88ed05b4a23f759dc9f7c2784c52142c72fb86a22dc99f5168`
- Page fingerprint: `sha256:81a74411e13e0b56f1bdfb6d7576bac694638f106b41060a86a0ad35e622c9ed`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann geeignete experimentelle Verfahren auswählen und auswerten, um den Gehalt von Lebensmittelinhaltsstoffen zu bestimmen.

### Visualization

/assets/goal-visualizations/chemie/8da5c5cf-d346-5df9-b4c9-26938fc80a88/8da5c5cf-d346-5df9-b4c9-26938fc80a88.png

- original digest: `sha256:e1b3bfdcd2900af7a2330477035e86152cfe50ea172ab6ea07b0ff400fede63d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Lebensmittelinhaltsstoffe experimentell nachweisen — `8fe39739-2938-5e2c-8db2-08572b44569a` (page 9)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Reinstoffgehalt in Stoffgemischen bestimmen — `e313c1ee-a617-54ed-adea-c183da1e03d8` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5081af396c36261a73f6f02c156301de858da77eef1b1f3eeb0d9492ac3fc4ba`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Methodeauswählen, Kalibrationund Messgrößeverbinden.
  - Essential understanding (EN): Link methods election, calibration and quantity.
  - Observable performance (DE): Steigung0, 8L/g; Probe0, 30g/L, Original6g/L; 250mL1, 5g. Leerwert/Positivstandard, Verdünnung, Interferenz/Auslinearität prüfen. GOD/PODbeziehtsichauf Glucose, nicht Saccharose/Gesamtzucker; g/L=Massenkonzentration, nichtmol/L.
  - Observable performance (EN): Slope.8L/g; diluted.30g/L, original6g/L, 1.5g in250mL. Check blank/standard, dilution, interferences/linearity. GOD/POD is glucose-specific, not all sugars; g/L is mass not amount concentration.
- `aspect-2`
  - Essential understanding (DE): Neues Analyt/Messprinzipbegrenztauswählen.
  - Essential understanding (EN): Choose another analyte/principle with limits.
  - Observable performance (DE): 10µmol=1, 7612mg/10mL=17, 612mg/100mL. Realeandere Reduktionsmittel verursachenpositive Abweichung; Endpunkt/Standardisierung/Blindwert/Kontrolle nötig. Keine Spezifität alleinauseiner Titration.
  - Observable performance (EN): 10µmol=1.7612mg/10mL=17.612mg/100mL. Other real reductants bias upward; endpoint, standardisation, blank/controls necessary. Titration alone does not ensure specificity.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Wähle für Glucoseineinem Modellsaft denbereitgestellten GOD/POD-Farbtest stattunspezifischer Gesamtzuckerprobe. Synthetische Photometriedaten unteridentischen Bedingungen505nm/1cm: Standards0; 0, 10; 0, 20; 0, 40g/L mit Absorbanz0; 0, 08; 0, 16; 0, 32; 20fachverdünnte Probe0, 24. Erstelle Kalibration, berechne Original-Massenkonzentration und Massein250mL; begründedie Methode/Kontrollen.
  - Task demand (EN): Choose provided GOD/POD colour test for glucose in model juice rather than nonspecific total sugars. Synthetic505nm/1cm data: standards0, .10, .20, .40g/L absorbance0, .08, .16, .32; 20fold diluted sample.24. Calibrate, calculate original mass concentration/mass in250mL and justify method/controls.
  - Expected performance (DE): Steigung0, 8L/g; Probe0, 30g/L, Original6g/L; 250mL1, 5g. Leerwert/Positivstandard, Verdünnung, Interferenz/Auslinearität prüfen. GOD/PODbeziehtsichauf Glucose, nicht Saccharose/Gesamtzucker; g/L=Massenkonzentration, nichtmol/L.
  - Expected performance (EN): Slope.8L/g; diluted.30g/L, original6g/L, 1.5g in250mL. Check blank/standard, dilution, interferences/linearity. GOD/POD is glucose-specific, not all sugars; g/L is mass not amount concentration.
  - Understanding focus (DE): Methodeauswählen, Kalibrationund Messgrößeverbinden.
  - Understanding focus (EN): Link methods election, calibration and quantity.
- `case-2`
  - Task demand (DE): Wähle für Vitamin Cineineralsascorbinsäureexklusivreduzierenddefinierten Modelllösung Iodometrie statt Glucosetest.10, 00mLProbe verbrauchen2, 00mLI2 0, 00500mol/L; Verhältnis1: 1, MAscorbinsäure176, 12g/mol. Berechne mg/100mL undbeurteile die Übertragbarkeitaufrealen Saftmitanderen Reduktionsmitteln.
  - Task demand (EN): Choose iodometry for vitamin C in a model solution explicitly having ascorbate as the only reductant.10mL consume2mL.005MI2, 1: 1, M176.12g/mol. Calculate mg/100mL and assess real juice with other reductants.
  - Expected performance (DE): 10µmol=1, 7612mg/10mL=17, 612mg/100mL. Realeandere Reduktionsmittel verursachenpositive Abweichung; Endpunkt/Standardisierung/Blindwert/Kontrolle nötig. Keine Spezifität alleinauseiner Titration.
  - Expected performance (EN): 10µmol=1.7612mg/10mL=17.612mg/100mL. Other real reductants bias upward; endpoint, standardisation, blank/controls necessary. Titration alone does not ensure specificity.
  - Understanding focus (DE): Neues Analyt/Messprinzipbegrenztauswählen.
  - Understanding focus (EN): Choose another analyte/principle with limits.
## Page 11: Nahrungsbestandteile nach Polarität und Resorption einordnen

- Full learning-goal ID: `9abd8069-17ad-5d30-9102-f8eff6055045`
- Goal fingerprint: `sha256:88054c4e809b558c204f8bc2dc4ccab429c29af477ec6b21194148c18551ccd7`
- Page fingerprint: `sha256:f7fef1c4fc68881abb51b7f6a6ac0a20e59cb62477cbe97e61ab5611910ed95b`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann Nahrungsbestandteile als hydrophil, lipophil oder amphiphil einordnen und damit Vitaminresorption, Verweildauer im Körper sowie geeignete Lösemittel bei der Lebensmittelzubereitung begründen.

### Visualization

/assets/goal-visualizations/chemie/9abd8069-17ad-5d30-9102-f8eff6055045/9abd8069-17ad-5d30-9102-f8eff6055045.png

- original digest: `sha256:059cefda1c531447331fa4d1e3abbdc5b4eba2a0d7e7c42f349b762d77c96b8c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Nahrungsmittelinhaltsstoffe strukturbezogen einordnen — `360fccb9-896d-5e67-bf5d-5732621604c9` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Struktur-Eigenschafts-Zusammenhänge ableiten — `5a30273a-98d5-5163-bb16-c250b7ed4e7f` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Darreichungsformen von Arzneimitteln vergleichen — `a853069e-2ebb-5a19-8edf-b767cdb41ed7` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:16593189a7bd7d18788a8f7bb7783f1c6b036e3ba82401877e592cffa82f905e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Polarität beeinflusst Wechselwirkungen und Aufnahmebedingungen, entscheidet aber nicht allein über Verweildauer.
  - Essential understanding (EN): Polarity affects interactions and uptake conditions but does not alone determine residence time.
  - Observable performance (DE): Polare Gruppen begünstigen Wasserwechselwirkungen; lange unpolare Bereiche Öl. Amphiphile besitzen beides; relative Anteile und Ladung zählen.
  - Observable performance (EN): Polar groups favour interactions with water, long nonpolar regions with oil. Amphiphiles possess both; proportions and charge matter.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Lipophile Stoffe benötigen passende Transport-/Solubilisierungsbedingungen; Speicherung kann anders sein. Metabolismus, Transport und Ausscheidung begrenzen Schluss aus Polarität; keine individuelle Dosierungsempfehlung.
  - Observable performance (EN): Lipophiles need appropriate transport/solubilisation conditions and may differ in storage. Metabolism, transport and excretion limit polarity-based inference; no personal dosing advice.

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
  - Task demand (DE): Vergleiche Strukturkarten eines OH-reichen Stoffes, eines langkettigen unpolaren Moleküls und eines amphiphilen Stoffes hinsichtlich Wasser/Öl-Verteilung.
  - Task demand (EN): Compare OH-rich, long-chain nonpolar and amphiphilic structures for water/oil partition.
  - Expected performance (DE): Polare Gruppen begünstigen Wasserwechselwirkungen; lange unpolare Bereiche Öl. Amphiphile besitzen beides; relative Anteile und Ladung zählen.
  - Expected performance (EN): Polar groups favour interactions with water, long nonpolar regions with oil. Amphiphiles possess both; proportions and charge matter.
  - Understanding focus (DE): Polarität beeinflusst Wechselwirkungen und Aufnahmebedingungen, entscheidet aber nicht allein über Verweildauer.
  - Understanding focus (EN): Polarity affects interactions and uptake conditions but does not alone determine residence time.
- `case-b-transfer`
  - Task demand (DE): Ein bereitgestellter Text vergleicht wasserlösliches und fettlösliches Vitamin. Begründe Resorptionsbedingungen und eine Grenze der Aussage fettlöslich bleibt immer lange.
  - Task demand (EN): A supplied text compares water- and fat-soluble vitamins. Explain uptake conditions and a limit of fat-soluble always remains long.
  - Expected performance (DE): Lipophile Stoffe benötigen passende Transport-/Solubilisierungsbedingungen; Speicherung kann anders sein. Metabolismus, Transport und Ausscheidung begrenzen Schluss aus Polarität; keine individuelle Dosierungsempfehlung.
  - Expected performance (EN): Lipophiles need appropriate transport/solubilisation conditions and may differ in storage. Metabolism, transport and excretion limit polarity-based inference; no personal dosing advice.
  - Understanding focus (DE): Polarität beeinflusst Wechselwirkungen und Aufnahmebedingungen, entscheidet aber nicht allein über Verweildauer.
  - Understanding focus (EN): Polarity affects interactions and uptake conditions but does not alone determine residence time.
## Page 12: Verdauungssäfte chemisch erklären

- Full learning-goal ID: `3681e688-7880-5bb4-9ab9-ef78289345c8`
- Goal fingerprint: `sha256:56f10e051562ab0853afaa2ad8e23beed467d9a5d34cbbdc9163ff481a81c720`
- Page fingerprint: `sha256:59ea4c0514e08fb22a134bdb747492b6998f61e78eeeaf693fa825fc14912a4e`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann die Bedeutung verschiedener Verdauungssäfte aus chemischer Sicht erklären und Bezüge zu pH-Wert, Löslichkeit und Stoffumwandlung herstellen.

### Visualization

/assets/goal-visualizations/chemie/3681e688-7880-5bb4-9ab9-ef78289345c8/3681e688-7880-5bb4-9ab9-ef78289345c8.png

- original digest: `sha256:f0cb569c3e1b980117ced583e58367e1143985fcdc493461c71750013630e0ab`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Nahrungsmittelinhaltsstoffe strukturbezogen einordnen — `360fccb9-896d-5e67-bf5d-5732621604c9` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Lösungen berechnen und pH bestimmen — `f1ed86f0-534d-57d7-8952-a004a331cc54` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Individuelle Verdauungs- und Resorptionsunterschiede begründen — `0b5342b9-512d-573f-90d5-7522aee35efa` (outside this book)
- Magensäurebildung und Protonenpumpen-Hemmer erklären — `2fac2f0e-bccc-5511-b9fb-cc1bc3aeed00` (outside this book)
- Schmerzmittelwirkstoffe chemisch einordnen — `f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528` (outside this book)
- Carbonsäureester und Carbonsäureamide durch Kondensation bilden — `98ae3f8e-4800-5ff3-bd2c-89434c006143` (outside this book)
- Verdauungshilfsmittel chemisch beurteilen — `5f151e8c-a62e-5e8c-979d-dcf4eb025873` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d5a73aacff411322ca698d74408378444fa8bba10f47a1324369196f15768e07`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Verdauungssäfte schaffen verschiedene chemische Bedingungen; Emulgierung ist keine Hydrolyse.
  - Essential understanding (EN): Digestive fluids create distinct chemical conditions; emulsification is not hydrolysis.
  - Observable performance (DE): Säure kann Proteinstruktur verändern und geeignete Bedingungen für Pepsin schaffen; Gallensalze emulgieren Fett und vergrößern die Grenzfläche. Galle spaltet keine Esterbindung selbst.
  - Observable performance (EN): Acid can change protein structure and establish pepsin conditions; bile salts emulsify fat and enlarge interfaces. Bile itself does not cleave ester bonds.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Neutralisierung/Bufferung verändert Protonierungszustände und Enzymbedingungen; ein pH-Optimum ist enzymspezifisch. Verdauungssäfte wirken nicht austauschbar.
  - Observable performance (EN): Neutralisation/buffering affects protonation and enzyme conditions; pH optima are enzyme-specific. Digestive fluids are not interchangeable.

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
  - Task demand (DE): Erkläre die unterschiedlichen Beiträge von Magensäure und Gallenflüssigkeit zur Verdauung von Protein bzw. Fett.
  - Task demand (EN): Explain distinct contributions of stomach acid and bile to protein and fat digestion.
  - Expected performance (DE): Säure kann Proteinstruktur verändern und geeignete Bedingungen für Pepsin schaffen; Gallensalze emulgieren Fett und vergrößern die Grenzfläche. Galle spaltet keine Esterbindung selbst.
  - Expected performance (EN): Acid can change protein structure and establish pepsin conditions; bile salts emulsify fat and enlarge interfaces. Bile itself does not cleave ester bonds.
  - Understanding focus (DE): Verdauungssäfte schaffen verschiedene chemische Bedingungen; Emulgierung ist keine Hydrolyse.
  - Understanding focus (EN): Digestive fluids create distinct chemical conditions; emulsification is not hydrolysis.
- `case-b-transfer`
  - Task demand (DE): Begründe im Modell, warum ein alkalischer Verdauungssaft nach dem Magen für ein pH-empfindliches Enzym nötig sein kann.
  - Task demand (EN): Explain why alkaline digestive fluid after the stomach may be needed for a pH-sensitive enzyme.
  - Expected performance (DE): Neutralisierung/Bufferung verändert Protonierungszustände und Enzymbedingungen; ein pH-Optimum ist enzymspezifisch. Verdauungssäfte wirken nicht austauschbar.
  - Expected performance (EN): Neutralisation/buffering affects protonation and enzyme conditions; pH optima are enzyme-specific. Digestive fluids are not interchangeable.
  - Understanding focus (DE): Verdauungssäfte schaffen verschiedene chemische Bedingungen; Emulgierung ist keine Hydrolyse.
  - Understanding focus (EN): Digestive fluids create distinct chemical conditions; emulsification is not hydrolysis.
## Page 13: Aminocarbonsäuren und Peptide nachweisen

- Full learning-goal ID: `5c8f0bbb-103a-579f-87fc-c997afe4fd18`
- Goal fingerprint: `sha256:e083b6eae8abc5d5cbb34b6c9ad3c89024417f321db63204e5d8a3dab1439492`
- Page fingerprint: `sha256:e46212618c475a882e5c112683a3c1a1142c619ffc276325485959c0f3b28c9a`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann geeignete Nachweisreaktionen für Aminocarbonsäuren und Peptide durchführen und ihre Aussagekraft etwa bei Lebensmitteln auswerten.

### Visualization

/assets/goal-visualizations/chemie/5c8f0bbb-103a-579f-87fc-c997afe4fd18/5c8f0bbb-103a-579f-87fc-c997afe4fd18.jpg

- original digest: `sha256:3f86aca94888d3e305450dabffa3cca5e8ef183d4c306f189a7255a4841032d4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Lebensmittelinhaltsstoffe experimentell nachweisen — `8fe39739-2938-5e2c-8db2-08572b44569a` (page 9)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Peptidbindungen erklären — `197bc2c5-835e-59e7-9263-5684e89799cc` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Naturstoffe — `31148286-b8db-57a7-8da2-2e0479240a2c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0515a1dfea6fc4c3428b070c530ca5463d40c0bb91cb4e3a60388332b727d736`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Nachweise reagieren auf chemische Merkmale und erfordern Kontrollen sowie reale Durchführungsevidenz.
  - Essential understanding (EN): Assays respond to chemical features and require controls plus evidence of actual execution.
  - Observable performance (DE): Ninhydrin zeigt bei vielen freien Aminogruppen eine Färbung; Biuret verlangt mehrere geeignete Peptidbindungen, Glycin bleibt negativ. Reagenzien/Probeninterferenzen werden kontrolliert.
  - Observable performance (EN): Ninhydrin responds to many free amino groups; biuret requires multiple suitable peptide bonds and glycine is negative. Reagent/sample interferences are controlled.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Befunde stützen die jeweilige Stoffklasse, nicht die eindeutige Verbindung. Ein analysiertes fremdes Protokoll belegt keine eigene Versuchsdurchführung; hierfür sind beobachtetes Arbeiten und eigenes Protokoll nötig.
  - Observable performance (EN): Results support classes, not unique compounds. Analysing a supplied record does not demonstrate personally executing the experiment; observed practice and personal records are required.
- `execution`
  - Essential understanding (DE): Durchführen undchemische Selektivitätvergleichen.
  - Essential understanding (EN): Execute and compare chemical selectivity.
  - Observable performance (DE): Glycinmit Ninhydrinviolett, mit Biuretkein Proteinnachweis; Eiklar Biuretviolett. Richtige Proben/Kontrollen und Dokumentationder Reihenfolge zählen. Ninhydrin reagiertmitgeeigneten Aminogruppen, nichtproteinexklusiv; Prolin kannabweichen.
  - Observable performance (EN): Glycine ninhydrin violet, but not positive protein biuret; eggwhite biuret positive. Correct samples/controls and execution order count. Ninhydrin reacts with suitable amino groups, not exclusively proteins; proline can differ.

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
  - Task demand (DE): Plane in einem schulisch freigegebenen Verfahren Ninhydrin- und Biuret-Vergleich an Glycin und einem Protein samt Blindproben; begründe erwartete Befunde.
  - Task demand (EN): Plan school-authorised ninhydrin and biuret comparison of glycine and a protein with blanks; justify expected results.
  - Expected performance (DE): Ninhydrin zeigt bei vielen freien Aminogruppen eine Färbung; Biuret verlangt mehrere geeignete Peptidbindungen, Glycin bleibt negativ. Reagenzien/Probeninterferenzen werden kontrolliert.
  - Expected performance (EN): Ninhydrin responds to many free amino groups; biuret requires multiple suitable peptide bonds and glycine is negative. Reagent/sample interferences are controlled.
  - Understanding focus (DE): Nachweise reagieren auf chemische Merkmale und erfordern Kontrollen sowie reale Durchführungsevidenz.
  - Understanding focus (EN): Assays respond to chemical features and require controls plus evidence of actual execution.
- `case-b-transfer`
  - Task demand (DE): Werte ein bereitgestelltes Protokoll aus: Blindprobe ungefärbt, Glycin Ninhydrin positiv/Biuret negativ, Protein Biuret positiv. Welche Aussagen und welche Durchführungsevidenz fehlen?
  - Task demand (EN): Evaluate a supplied record: blank colourless, glycine ninhydrin positive/biuret negative, protein biuret positive. What conclusions and execution evidence remain absent?
  - Expected performance (DE): Befunde stützen die jeweilige Stoffklasse, nicht die eindeutige Verbindung. Ein analysiertes fremdes Protokoll belegt keine eigene Versuchsdurchführung; hierfür sind beobachtetes Arbeiten und eigenes Protokoll nötig.
  - Expected performance (EN): Results support classes, not unique compounds. Analysing a supplied record does not demonstrate personally executing the experiment; observed practice and personal records are required.
  - Understanding focus (DE): Nachweise reagieren auf chemische Merkmale und erfordern Kontrollen sowie reale Durchführungsevidenz.
  - Understanding focus (EN): Assays respond to chemical features and require controls plus evidence of actual execution.
- `execution-1`
  - Task demand (DE): Führe betreut zwei Nachweise aus. Ninhydrin: jeein Tropfen1%Glycin und Wasser aufgetrennte Filterpapierfelder; mitbereitgestellterethanolischer Ninhydrinlösung im Abzug nach Freigabe benetzen, trocknen undimwarmluftfreien80°C-Trockenschrank2min erwärmen. Biuret: je2mLverdünntes Eiklar, Glycin, Wasser +1mLNaOH1M +10Tropfen CuSO4 0, 1M, mischen. Protokolliere Ausführung, Kontrollen undtatsächliche Befunde.
  - Task demand (EN): Execute supervised two assays. Ninhydrin: one drop each1%glycine/water on separate paper fields; wet using provided ethanolic ninhydrin in hood, leave dry then warm2min80°C drying cabinet. Biuret: 2ml diluted eggwhite, glycine, water+1mL1M NaOH+10drops0.1M CuSO4, mix. Log execution, controls and actual findings.
  - Expected performance (DE): Glycinmit Ninhydrinviolett, mit Biuretkein Proteinnachweis; Eiklar Biuretviolett. Richtige Proben/Kontrollen und Dokumentationder Reihenfolge zählen. Ninhydrin reagiertmitgeeigneten Aminogruppen, nichtproteinexklusiv; Prolin kannabweichen.
  - Expected performance (EN): Glycine ninhydrin violet, but not positive protein biuret; eggwhite biuret positive. Correct samples/controls and execution order count. Ninhydrin reacts with suitable amino groups, not exclusively proteins; proline can differ.
  - Understanding focus (DE): Durchführen undchemische Selektivitätvergleichen.
  - Understanding focus (EN): Execute and compare chemical selectivity.
## Page 14: Proteinquellen nachhaltig und quellenkritisch bewerten

- Full learning-goal ID: `64a5bb87-358d-5a22-958a-f66ba5521cd5`
- Goal fingerprint: `sha256:ddfcb7137e59de6b7adabd1cb195c993d14905a9b3c8a71a49a37ffd32c3fb2c`
- Page fingerprint: `sha256:a80a66fe0062b936acbd505c9cfd1000a4560b11d7a829c6271b8feb318f8c48`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Naturstoffe und Synthesechemie > Q2.1 Naturstoffe

### Canonical description

Die lernende Person kann tierische und pflanzliche Proteinquellen recherchieren und anhand von Zusammensetzung, Funktion und Nachhaltigkeitskriterien vergleichen und bewerten.

### Visualization

/assets/goal-visualizations/chemie/64a5bb87-358d-5a22-958a-f66ba5521cd5/64a5bb87-358d-5a22-958a-f66ba5521cd5.jpg

- original digest: `sha256:f32491c7965c0538642f2d0c5e76640fabbe50bb11381b018a9d943d721e74b7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Lebensmittelauswahl chemisch und nachhaltig bewerten — `47582f06-d724-5da9-acc6-16c91ab94f67` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b1478d972911cecd7f10a48b648fce11878d51e3ac4dfd04c29851eaa2cdc35f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `aspect-1`
  - Essential understanding (DE): Recherche istprüfbare Quellenerhebung.
  - Essential understanding (EN): Research is assess able source acquisition.
  - Observable performance (DE): Rechercheprotokoll zeigt Quellenbeschaffung undquellenkritische Auswahl. Bezugsgrößen, Verarbeitung und Systemgrenzen explizit; Zahlenwiedergabemit Fundstelle. Vergleichbegründetmindestenszwei Kriterien und Unsicherheit, keinepauschale Rangfolge.
  - Observable performance (EN): Search log shows acquisition/critical selection. Explicit reference units, processing/system boundaries and traceable values. Comparison justifies at least two criteria/uncertainty, no blanket ranking.
- `aspect-2`
  - Essential understanding (DE): Neuer Rechercheweg prüft Transfer.
  - Essential understanding (EN): New search path checks transfer.
  - Observable performance (DE): Neue Quellen werden tatsächlichbeschafft undunabhängiginhaltlichgeprüft. Gleiche Portion/Funktion, Systemgrenzen, Interessenkonflikt und Datenlücke begründenbewusstbegrenztes Urteil.
  - Observable performance (EN): Actually acquire/check new sources independently. Equal portion/function, boundaries, conflicts of interest/data gaps justify bounded judgment.

**Coverage expectations**

- required expectations: `aspect-1`, `aspect-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-operator-context`: Die ausgearbeiteten Fälle wechseln Stoff, Kontrollprobe, pH, Bezugsgröße, Quellenweg oder Nutzungskontext. Werte sind ausdrücklich Aufgabenwerte; tatsächliche Durchführung/Recherche wird im individuellen Lernpfad nur anhand vorgelegter Arbeit beurteilt. / Worked cases vary substance, control, pH, unit, search path or use. Values are task data; actual individual execution/research is assessed only from submitted work.

**Application cases**

- `case-1`
  - Task demand (DE): Recherchiere selbst zwei Proteinlieferanten, einpflanzlich/eintierisch. Suche jeeinekonkrete Produktdeklaration undmindestens eineunabhängige Studie/amtliche Quellezu Herstellung oder Umweltwirkung. Dokumentiere Suchbegriffe, URL, Abrufdatum, Autor, Herkunft und Auswahlgrund; normiere Proteinmenge auf100g undbewerteuntergleicher Funktion.
  - Task demand (EN): Research one plant/one animal protein source yourself. Find actual product labels and at least one independent study/official source on production/environment. Log queries, URL, date, author, provenance/selection reason; norma lise protein per100g and evaluate equal function.
  - Expected performance (DE): Rechercheprotokoll zeigt Quellenbeschaffung undquellenkritische Auswahl. Bezugsgrößen, Verarbeitung und Systemgrenzen explizit; Zahlenwiedergabemit Fundstelle. Vergleichbegründetmindestenszwei Kriterien und Unsicherheit, keinepauschale Rangfolge.
  - Expected performance (EN): Search log shows acquisition/critical selection. Explicit reference units, processing/system boundaries and traceable values. Comparison justifies at least two criteria/uncertainty, no blanket ranking.
  - Understanding focus (DE): Recherche istprüfbare Quellenerhebung.
  - Understanding focus (EN): Research is assess able source acquisition.
- `case-2`
  - Task demand (DE): Recherchiere für einenneuen Anwendungsfall zweiandersverarbeitete Proteinprodukte. Prüfeeine Werbeaussage proteinreicher/nachhaltiger mit Originaldeklaration undandererunabhängiger Quelle. Zeige Suchweg, Fehlversuche/Auswahl undwelche Aussage Datenwirklichstützen.
  - Task demand (EN): Research two differently processed protein products for a new use. Check higher protein/more sustainable marketing against original label and another independent source. Show search path, failed searches/selection and bounded conclusion.
  - Expected performance (DE): Neue Quellen werden tatsächlichbeschafft undunabhängiginhaltlichgeprüft. Gleiche Portion/Funktion, Systemgrenzen, Interessenkonflikt und Datenlücke begründenbewusstbegrenztes Urteil.
  - Expected performance (EN): Actually acquire/check new sources independently. Equal portion/function, boundaries, conflicts of interest/data gaps justify bounded judgment.
  - Understanding focus (DE): Neuer Rechercheweg prüft Transfer.
  - Understanding focus (EN): New search path checks transfer.
