# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-final-context-d-001`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:7056a7074602bb01f2882dac59de1adc7c8b5b3fca7507f622f2f6403086e087`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Substituenteneffekte in Farbstoff-Molekülen erklären

- Full learning-goal ID: `64b03eff-a967-54a1-ace3-89cb7650a65c`
- Goal fingerprint: `sha256:23107fd252d6de260d1442743fd7c0634a63900dfaa6b8c4cc390cd552c383aa`
- Page fingerprint: `sha256:83b08c4249885f6673dfe6b8f8d5fc74a4ad1524d5516381aa3959d0d1872147`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das Donator-Akzeptor-Konzept auf Farbstoff-Moleküle anwenden und den Einfluss funktioneller Gruppen auf die Farbigkeit der zugehörigen Stoffe erklären.

### Visualization

/assets/goal-visualizations/chemie/64b03eff-a967-54a1-ace3-89cb7650a65c/64b03eff-a967-54a1-ace3-89cb7650a65c.png

- original digest: `sha256:e19b74bece5c2f2eed2ce21fffda0213a36ccc3ebd20a97f66182f00dde976d1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ebaa1177481b6340d23a8ad9c5082c9a212dd814ca209fcf8edccaf32d307410`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Donor und Akzeptor beeinflussen ein gekoppeltes π-System; der Effekt hängt von Stellung und Kopplung ab.
  - Essential understanding (EN): Donor and acceptor groups affect a coupled pi system; the effect depends on position and coupling.
  - Observable performance (DE): Identifiziert Gruppen und verknüpft elektronischen Effekt mit Spektren.
  - Observable performance (EN): Identifies groups and connects electronic effects to spectra.
- `e2`
  - Essential understanding (DE): Protonierung oder unterbrochene Konjugation kann einen Donoreffekt verändern; eine Rotverschiebung ist keine universelle Gruppenregel.
  - Essential understanding (EN): Protonation or interrupted conjugation can alter donation; a red shift is not a universal group rule.
  - Observable performance (DE): Begründet einen veränderten Übergang anhand konkreter Bedingungen.
  - Observable performance (EN): Explains a changed transition under specific conditions.
- `hb-auxochrome-antiauxochrome-explicit-use`
  - Essential understanding (DE): Auxochrom/Antiauxochrom sind im historischen Schulmodell gekoppelte Donor-/Akzeptorrollen, keine universellen modernen Stoffklassen.
  - Essential understanding (EN): Auxochrome/antiauxochrome are coupled donor/acceptor roles in the historical school model,not universal modern classes.
  - Observable performance (DE): Die lernende Person gebraucht beide Namen am Molekül,begründet Protonierung und überträgt bei unterbrochener Konjugation begrenzt.
  - Observable performance (EN): The learner uses both names for the molecule,explains protonation and transfers with limits after interrupted conjugation.

**Coverage expectations**

- required expectations: `e1`, `e2`, `hb-auxochrome-antiauxochrome-explicit-use`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Donorprotonierung und Spektraländerung / Donor protonation and spectrum change
- `v2`: Konjugation versus sp³-Unterbrechung / Conjugation versus sp³ interruption
- `hb-auxochrome-antiauxochrome-explicit-use-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `64b03eff-case-1`
  - Task demand (DE): Papiermodell eines planaren Donor–π–Akzeptor-Farbstoffs: para-(CH₃)₂N–C₆H₄–CH=CH–C₆H₄–NO₂. Gleicher Lösungsmittelzustand; λmax neutral 510 nm, nach Protonierung des Aminostickstoffs 430 nm. Die Nitrogruppe bleibt unverändert.
1. Kennzeichne Donor und Akzeptor im neutralen Molekül und begründe die Kopplung über das π-System.
2. Erkläre die Änderung des Aminodonors bei Protonierung und ordne die angegebene Verschiebungsrichtung sowie die Änderung der Übergangsenergie zu.
  - Task demand (EN): Paper model of a planar donor–pi–acceptor dye: para-(CH₃)₂N–C₆H₄–CH=CH–C₆H₄–NO₂. Same solvent conditions; neutral λmax 510 nm and 430 nm after protonation at the amino nitrogen. The nitro group remains unchanged.
1. Identify donor and acceptor in the neutral molecule and explain coupling through the pi system.
2. Explain the amino donor change on protonation and identify the stated shift direction and transition-energy change.
  - Expected performance (DE): 1. –N(CH₃)₂ kann sein freies Elektronenpaar in das gekoppelte π-System einspeisen (+M); –NO₂ zieht über Mesomerie Elektronendichte ab (−M). Die sp²-Brücke ermöglicht Kopplung der beiden Enden.
2. Nach H⁺-Bindung ist das Paar in einer N–H-Bindung gebunden; der neutrale +M-Donor steht nicht mehr so zur Verfügung. 510→430 nm ist hypsochrom; nach ΔE=hc/λ steigt die Übergangsenergie. Das erklärt diesen angegebenen Fall, keine universelle Regel für alle protonierten Farbstoffe.
  - Expected performance (EN): 1. –N(CH₃)₂ can donate its lone pair into the coupled pi system (+M); –NO₂ withdraws electron density through resonance (−M). The sp² bridge couples the two ends.
2. After H⁺ bonding the pair forms the N–H bond, so the neutral +M donor is no longer available in the same way. 510→430 nm is hypsochromic; ΔE=hc/λ increases. This explains the supplied case rather than a universal rule for all protonated dyes.
  - Understanding focus (DE): –N(CH₃)₂ kann sein freies Elektronenpaar in das gekoppelte π-System einspeisen (+M); –NO₂ zieht über Mesomerie Elektronendichte ab (−M). Die sp²-Brücke ermöglicht Kopplung der beiden Enden. / Nach H⁺-Bindung ist das Paar in einer N–H-Bindung gebunden; der neutrale +M-Donor steht nicht mehr so zur Verfügung. 510→430 nm ist hypsochrom; nach ΔE=hc/λ steigt die Übergangsenergie.
  - Understanding focus (EN): –N(CH₃)₂ can donate its lone pair into the coupled pi system (+M); –NO₂ withdraws electron density through resonance (−M). The sp² bridge couples the two ends. / After H⁺ bonding the pair forms the N–H bond, so the neutral +M donor is no longer available in the same way. 510→430 nm is hypsochromic; ΔE=hc/λ increases.
- `64b03eff-case-2`
  - Task demand (DE): Zwei idealisierte Moleküle besitzen dieselben Amino-Donor- und Nitro-Akzeptor-Endgruppen. A hat eine planare –CH=CH–Brücke und λmax 500 nm. B hat –CH₂–CH₂– als Brücke und λmax 330 nm; Konzentration und Lösungsmittel sind gleich.
1. Erkläre, welche Brücke Donor und Akzeptor mesomer koppelt, und begründe die Unterbrechung bei der anderen.
2. Verknüpfe die zwei Absorptionsmaxima mit Übergangsenergie und sichtbarer Farbigkeit; beurteile die Aussage „Eine Nitrogruppe macht jedes Molekül farbig“.
  - Task demand (EN): Two idealized molecules have the same amino donor and nitro acceptor end groups. A has a planar –CH=CH– bridge and λmax 500 nm. B has a –CH₂–CH₂– bridge and λmax 330 nm; concentration and solvent are equal.
1. Explain which bridge couples donor and acceptor by resonance and why the other interrupts it.
2. Connect both absorption maxima to transition energy and visible color; assess the claim “A nitro group makes every molecule colored”.
  - Expected performance (DE): 1. A besitzt benachbarte p-Orbitale über die sp²-Brücke. Bei B unterbrechen sp³-C die durchgehende Konjugation; die Endgruppen allein bilden kein langes gekoppeltes π-System.
2. 500 nm liegt im sichtbaren Bereich und entspricht einer kleineren ΔE als 330 nm im UV. A kann durch sichtbare Absorption farbig sein; B wäre im gegebenen Modell ohne weitere sichtbare Banden farblos. Die Nitrogruppe allein garantiert keine sichtbare Absorption.
  - Expected performance (EN): 1. A has adjacent p orbitals through its sp² bridge. In B sp³ carbons interrupt continuous conjugation; end groups alone do not make a long coupled pi system.
2. 500 nm is visible and corresponds to a smaller ΔE than ultraviolet 330 nm. A can be colored by visible absorption; B would be colorless in the given model without other visible bands. A nitro group alone does not guarantee visible absorption.
  - Understanding focus (DE): A besitzt benachbarte p-Orbitale über die sp²-Brücke. Bei B unterbrechen sp³-C die durchgehende Konjugation; die Endgruppen allein bilden kein langes gekoppeltes π-System. / 500 nm liegt im sichtbaren Bereich und entspricht einer kleineren ΔE als 330 nm im UV. A kann durch sichtbare Absorption farbig sein; B wäre im gegebenen Modell ohne weitere sichtbare Banden farblos. Die Nitrogruppe allein garantiert keine sichtbare Absorption.
  - Understanding focus (EN): A has adjacent p orbitals through its sp² bridge. In B sp³ carbons interrupt continuous conjugation; end groups alone do not make a long coupled pi system. / 500 nm is visible and corresponds to a smaller ΔE than ultraviolet 330 nm. A can be colored by visible absorption; B would be colorless in the given model without other visible bands. A nitro group alone does not guarantee visible absorption.
- `hb-colour-three-terms-64b0`
  - Task demand (DE): Konjugiertes Modell (CH3)2N–C6H4–CH=CH–C6H4–NO2, beide Substituenten para zur Vinylbrücke. Aminisches freies Elektronenpaar kann als Donor koppeln, Nitro ist hier Akzeptor. Fiktive Spektren im gleichen Lösungsmittel:gekoppeltes Stammgerüst ohne beide Substituenten350 nm;gekoppeltes Donor/Akzeptor-System500 nm;protonierter Amindonor410 nm. Chromophor=Molekülteil, auf den der betrachtete Absorptionsübergang näherungsweise lokalisiert ist. Historischer HB-Schulgebrauch hier:gekoppelter Amindonor Auxochrom, elektronenziehender Nitro-Substituent Antiauxochrom. Keine universellen disjunkten modernen Stoffklassen:IUPAC kennzeichnet Auxochrom als überholt; Nitro kann andernorts selbst Chromophorbestandteil sein. hc=1240 eV·nm. Einzelbande bestimmt keine eindeutige vollständige Wahrnehmungsfarbe.
Nenne alle drei HB-Begriffe ausdrücklich, erkläre und markiere Rollen im Molekül, ohne Nichtüberlappung zu erfinden. Zeichne Energieniveaus, berechne Lücken350/500 nm und erkläre Protonierung unter Vorgaben. Trenne Bandverschiebung und sichere Farbbestimmung.
Frisch erst nach eigener Antwort: Vinylbrücke wird–CH2–CH2–;neues Modell λmax330 nm. Bleiben Fernwirkung und sichtbare gemeinsame Bande zwingend?
Ganzes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/5
  - Task demand (EN): Conjugated model (CH3)2N–C6H4–CH=CH–C6H4–NO2,both substituents para to vinyl bridge. Amine lone pair can couple as donor,nitro is acceptor here. Fictional spectra in same solvent:coupled parent without both substituents350 nm;coupled donor/acceptor500 nm;protonated amine410 nm. Chromophore=molecular part on which the particular absorption transition is approximately localized. Historical HB school usage here:coupled amine donor auxochrome,electron-withdrawing nitro substituent antiauxochrome. Not universal disjoint modern classes:IUPAC labels auxochrome obsolete;nitro can itself belong to a chromophore elsewhere. hc=1240 eV·nm. A single band determines no unique full perceived colour.
Explicitly name all three HB terms,explain/mark roles without inventing non-overlap. Draw levels,calculate gaps350/500 nm and explain protonation under the givens. Distinguish band shift from definitive colour.
Fresh only after own response: Vinyl bridge becomes–CH2–CH2–;new model λmax330 nm. Must long-range effects and joint visible band remain?
Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/5
  - Expected performance (DE): Gekoppeltes π-System trägt den betrachteten Chromophor; Amin=Auxochrom/Donor und Nitro=Antiauxochrom/Akzeptor in dieser historischen Konvention.1240/350=3,54 eV;1240/500=2,48 eV. Kopplung vermindert im Vergleich die relevante Lücke; Protonierung bindet das freie Paar und vermindert Donorfunktion, hier kürzere Wellenlänge. Gruppenname allein beweist keinen universellen Effekt.
Nein:sp3 unterbricht π-Kopplung. Lokale Chromophore können bleiben;gemeinsame D–π–A-Bande/Gruppenwirkungen nicht übertragen.330 nm ist UV;keine genaue sichtbare Farbe daraus.
  - Expected performance (EN): Coupled π system carries the relevant chromophore;amine=auxochrome/donor,nitro=antiauxochrome/acceptor in this historical convention.1240/350=3.54 eV;1240/500=2.48 eV. Coupling lowers the relevant gap in this comparison;protonation binds the pair and reduces donation,giving shorter wavelength here. Group naming alone proves no universal effect.
No:sp3 interrupts π coupling. Local chromophores may remain;joint D–π–A band/group effects do not transfer.330 nm is UV;no exact visible colour follows.
  - Understanding focus (DE): Auxochrom/Antiauxochrom sind im historischen Schulmodell gekoppelte Donor-/Akzeptorrollen, keine universellen modernen Stoffklassen.
  - Understanding focus (EN): Auxochrome/antiauxochrome are coupled donor/acceptor roles in the historical school model,not universal modern classes.
