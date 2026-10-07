#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Serialize this reviewer's explicitly authored judgments; no canonical edits."""
from pathlib import Path
import json, hashlib, datetime

B = Path(__file__).resolve().parent
def read(path): return json.loads(path.read_text())
def digest(data): return 'sha256:' + hashlib.sha256(data).hexdigest()
def write(path, obj): path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
source = read(B/'inputs/native-d-seventeen/round-a/description-review-input.json')
campaign = read(B/'inputs/native-d-seventeen/round-a/description-review-campaign.json')
routing = read(B/'inputs/exact-current17-and-separate20-native-review-routing.author.raw.json')
live = read(B/'inputs/current-canonical-chemistry.at-review-start.json')
live_index = {g['id']: g for g in live['goals']}
author_index = {g['id']: g for g in routing['wholeGoals17']}
run_id = 'chemie-next17-current-independent-a-20261007-v1-d-run'

# Each row is a genuinely authored assessment of the supplied exact competence.
# Essential understanding, observable performance and transfer are bilingual.
J = {
'580b3616': {
 'essential': ['Ein positiver Gasnachweis verbindet eine spezifische Beobachtung mit einer Reaktion oder der Unterstützung einer Verbrennung; die Identifikation eines Bestandteils ist kein Reinheitsnachweis.', 'A positive gas test links a specific observation to a reaction or support for combustion; identifying a component does not establish purity.'],
 'performance': ['Die lernende Person ordnet im vorgegebenen O2/CO2/H2-Kandidatenraum Glimmspan, Kalkwasser und kleine beaufsichtigte Knallgasprobe zu und erklärt Verbrennungsförderung, Carbonatfällung und Wasserbildung.', 'Within the supplied O2/CO2/H2 candidate set, the learner assigns the glowing-splint, limewater and small supervised hydrogen tests and explains support for combustion, carbonate precipitation and water formation.'],
 'transfer': ['Bei einem unbekannten Gemisch deutet sie zwei nacheinander positive Nachweise, verwirft die Reinheitsbehauptung und begrenzt einen negativen Glimmspantest durch die unbekannte Nachweisgrenze.', 'For an unknown mixture, the learner interprets two successive positive tests, rejects a purity claim and limits a negative splint result by the unknown detection limit.'],
 'rationale': 'Keep: gas identification and chemical interpretation form one bounded analytical competence. Both descriptions agree. The full cases distinguish qualitative detection from quantity and purity; written interpretation does not demonstrate practical execution.',
 'p1': 'O2 supports combustion; CO2 + Ca(OH)2 gives CaCO3 and H2O; 2 H2 + O2 gives 2 H2O. Atom balances are correct. Air/limewater controls support baseline comparison, but the incidental damp-splint wording is not itself established by a separately stated moisture control.',
 'p2': 'Sequential CO2 and H2 detection disproves pure CO2. Negative splint response cannot exclude sub-threshold O2; atmospheric oxygen supplies the ignition test. This changes mixture composition and inference, rather than just numbers.',
 'negative': 'Gas bubbles or a positive CO2 test prove the entire sample is pure CO2; absence of splint relighting proves absolute absence of O2.',
 'note': 'Minor wording caution: do not turn the stated air control into a separately performed moisture-control experiment. Practical gas-test execution remains unobserved.',
},
'e313c1ee': {
 'essential': ['Ein Gehalt ist eine auf eine bestimmte Probenmasse bezogene Stoffmenge oder Masse; Trennung und Trocknung müssen für den gesuchten Stoff selektiv sein.', 'Content relates an amount or mass of a constituent to a defined sample basis; separation and drying must be selective for the constituent.'],
 'performance': ['Die lernende Person begründet Salz/Sand-Trennung durch Wasserlöslichkeit, berechnet 2,40 g/10,00 g = 24,0 % und bewertet Massekonstanz, Leerprobe, Wiederholung und Verluste beim Nachwaschen.', 'The learner justifies salt/sand separation by water solubility, calculates 2.40 g/10.00 g = 24.0%, and evaluates constant mass, blanks, replication and rinsing losses.'],
 'transfer': ['Beim Trocknungsverlust unterscheidet sie 7,0 % Wasser bezogen auf die feuchte Probe von einem nichtselektiven Verlust bei zusätzlichen flüchtigen Bestandteilen.', 'For drying loss, the learner distinguishes 7.0% water on a wet-sample basis from nonselective loss when another volatile component is present.'],
 'rationale': 'Keep: experimental determination, calculation and reliability assess the same measurement competence. The descriptions preserve method neutrality and agree across languages. Constituent identity and denominator are explicit in the cases.',
 'p1': '2.40/10.00 = 24.0%; repeats give 23.8–24.2%. Selective dissolution relies on the two-component assumption. Incomplete washing biases low; residual water biases high. Constant mass does not exclude other soluble material.',
 'p2': '(20.00−18.60)/20.00 = 7.0%, on the wet basis. An additional volatile organic component makes this total loss, not selective water content. Repeats and blanks do not recover lost chemical selectivity.',
 'negative': 'Every drying loss is water, and constant mass proves correct constituent identity and absence of systematic error.',
},
'0bf26276': {
 'essential': ['Eine pH-Änderung wirkt abhängig von Stoffen, Funktion und Randbedingungen des Systems; Nutzen und unerwünschte Folgen brauchen konkrete Kriterien.', 'Effects of a pH change depend on substances, function and system conditions; usefulness and adverse effects require concrete criteria.'],
 'performance': ['Die lernende Person erklärt Carbonatabbau beim Entkalken und deutet die gegebenen Enzymdaten, ohne eine allgemeine Enzymkurve oder Werkstoffverträglichkeit zu behaupten.', 'The learner explains carbonate removal in descaling and interprets the supplied enzyme data without claiming a universal enzyme curve or material compatibility.'],
 'transfer': ['Sie beurteilt eine saure Einleitung anhand einer gegebenen Gewässergrenze und Materialtabelle und begründet, warum gleicher pH weder gleiche Pufferkapazität noch gleiche Neutralisationsmenge festlegt.', 'The learner evaluates an acidic discharge against a supplied aquatic range and material table, and explains why equal pH determines neither equal buffer capacity nor equal neutralization demand.'],
 'rationale': 'Keep the bilingual competence: it correctly asks for contextual discussion and chemical estimation, without prescribing universal health or environmental conclusions. Historical physical page 5 has a pH-arrow defect and the current image link is withdrawn; this judgment does not accept that image or restore the page.',
 'p1': 'CaCO3 + 2 H3O+ → Ca2+ + CO2 + 3 H2O balances atoms and charge. The stated enzyme drops from 100% at pH7 to 20% at pH3; protonation is a plausible mechanism, not a proven universal causal curve.',
 'p2': 'pH5 is outside the supplied 6.5–8.5 model range and conflicts with the supplied material table. pH measures hydrogen-ion activity rather than all titratable acid equivalents, so composition and buffer capacity remain necessary.',
 'negative': 'Acidic always means harmful, or equal pH fixes the acid identity and the quantity of base required.',
},
'fd309753': {
 'decision': 'revise',
 'proposed': ['Die lernende Person kann saure und basische wässrige Lösungen auf Teilchenebene durch das jeweilige Überwiegen von Oxonium- oder Hydroxid-Ionen charakterisieren.', 'The learner can characterize acidic and basic aqueous solutions at particle level by the respective predominance of hydronium or hydroxide ions.'],
 'essential': ['In Wasser kommen Oxonium- und Hydroxid-Ionen zugleich vor; das relative Überwiegen charakterisiert sauer oder basisch, während Ladungsausgleich die Gesamtlösung neutral hält.', 'Hydronium and hydroxide ions coexist in water; relative predominance characterizes acidic or basic conditions, while charge balance keeps the whole solution electrically neutral.'],
 'performance': ['Die lernende Person deutet gleichvolumige Teilchenschemata anhand der relativen H3O+/OH−-Mengen und erklärt, warum der bloße Nachweis einer Ionenart nicht zur Klassifikation genügt.', 'The learner interprets equal-volume particle models by relative H3O+/OH− amounts and explains why merely detecting one ion species is insufficient for classification.'],
 'transfer': ['Bei vorgegebenen verdünnten Konzentrationen 10−5 und 10−9 mol/L erkennt sie das 10 000-fache Überwiegen von H3O+ und unterscheidet es von gleicher Konzentration in neutralem Wasser.', 'For supplied dilute concentrations of 10−5 and 10−9 mol/L, the learner recognizes 10,000-fold H3O+ predominance and distinguishes it from equal concentrations in neutral water.'],
 'rationale': 'Revise a concrete ambiguity shared by both languages: mere presence of H3O+ or OH− does not distinguish acidic and basic aqueous solutions because both species coexist. The official source uses presence wording, but the current candidate cases correctly use relative predominance. This bounded correction preserves the same particle-level competence and introduces no quantitative requirement.',
 'p1': 'A acidic, B basic and C neutral follow from relative counts in equal volumes, not the absence of a minority species. Spectator ions ensure charge balance. The schematic is explicitly not a concentration measurement.',
 'p2': '10−5/10−9 = 10^4 and their product is 10−14 in the stated dilute 25°C model. OH− presence alone does not establish basicity; temperature and activities limit universal pH7 claims.',
 'negative': 'Any solution containing OH− is basic, and an acidic solution contains no OH− at all.',
},
'c0f1bf09': {
 'essential': ['Ein Stoffkreislauf erhält Elemente über verschiedene Stoffformen, während chemische Umwandlungen von Transport und Zustandsänderung unterschieden werden; Nutzenergie kehrt nicht einfach zyklisch zurück.', 'A matter cycle conserves elements through different chemical forms while distinguishing chemical conversion from transport and phase change; usable energy does not simply return cyclically.'],
 'performance': ['Die lernende Person verfolgt Kohlenstoff durch molekularen CO2-Austausch, Photosynthese und Atmung, prüft die Atombilanz und unterscheidet Summenbilanz von Mechanismus.', 'The learner traces carbon through molecular CO2 exchange, photosynthesis and respiration, checks atom balance and distinguishes overall balance from mechanism.'],
 'transfer': ['Im Kalkkreislauf klassifiziert sie Kalzinierung, Hydratation und Carbonatisierung und widerlegt aus einer geschlossenen Stoffbilanz abgeleitete Behauptungen fehlenden Energiebedarfs oder gesicherter Klimaneutralität.', 'For the lime cycle, the learner classifies calcination, hydration and carbonation and rejects claims that closed material balances imply no energy demand or proven climate neutrality.'],
 'rationale': 'Keep the text: the various reaction types and physical steps support one cycle-modeling competence, rather than independently authored routines. Canonical SekII and the bounded BY12 source control scope; the historical breadcrumb incorrectly says SekI and remains an explicit page-context finding.',
 'p1': 'Both overall biological equations conserve six carbon atoms. The bounded molecular CO2 exchange is physical; hydration and acid-base chemistry of dissolved CO2 are explicitly outside that step. Reverse overall balances do not prove reverse mechanisms.',
 'p2': 'All three lime equations balance; physical transport preserves species while calcination/hydration/carbonation change them. Heat input and timing/losses prevent a bare material loop from proving net-zero emissions.',
 'negative': 'A matter cycle necessarily recycles all usable energy or makes every chemical step the exact microscopic reverse of another.',
},
'95dc0ee5': {
 'essential': ['Fachsprache trennt beobachtbare Stoffe von ihren Teilchenmodellen und verwendet Molekülformeln, Verhältnisformeln, Indizes, Koeffizienten und Ladungen entsprechend ihrer Bedeutung.', 'Technical language separates observable substances from particle models and uses molecular formulas, ratio formulas, subscripts, coefficients and charges according to their meanings.'],
 'performance': ['Die lernende Person korrigiert den Alltagssatz zum Lösen von NaCl: Ionen werden hydratisiert, das Verhältnis ist 1:1 und Natriummetall entsteht nicht; Beobachtung und Erklärung bleiben unterscheidbar.', 'The learner corrects everyday wording about dissolving NaCl: ions are hydrated, the ratio is 1:1 and sodium metal is not formed; observation and explanation remain distinguishable.'],
 'transfer': ['Bei der Wasserbildung erläutert sie 2 H2 + O2 → 2 H2O, trennt Koeffizient von Index und unterscheidet Cl− von einem neutralen Chloratom.', 'For water formation, the learner explains 2 H2 + O2 → 2 H2O, distinguishes coefficients from subscripts and differentiates Cl− from a neutral chlorine atom.'],
 'rationale': 'Keep: this is integrated chemical representation and communication across levels. The broad range is not a hidden list of separate naming courses; the prior symbol/formula goal supplies the basics. The languages preserve the same operations and particle categories.',
 'p1': 'NaCl(s) → Na+(aq) + Cl−(aq) conserves charge and distinguishes a crystal ratio from molecules. The explanation of conductivity through mobile ions and the rejection of sodium-metal production are appropriate.',
 'p2': 'The balanced equation has four H and two O atoms on both sides. Moving a subscript changes the substance; coefficients change amounts. Cl− has one additional electron relative to neutral Cl.',
 'negative': 'Dissolving NaCl destroys salt molecules or produces sodium metal; shifting subscripts is a permissible balancing method.',
},
'02dc29ae': {
 'essential': ['Stoffe lassen sich anhand begründeter Struktur- und Eigenschaftskriterien ordnen; Teilchenaufbau erklärt kontrollierte Eigenschaftsvergleiche, ohne jede Eigenschaft durch eine Summenformel festzulegen.', 'Substances can be classified by justified structural and property criteria; particle structure explains controlled property comparisons without making every property a function of molecular formula alone.'],
 'performance': ['Die lernende Person unterscheidet Metall, Ionenkristall und molekularen Stoff, trennt Leitfähigkeitsdaten von Ladungsträgermodellen und sagt die Leitfähigkeit einer NaCl-Schmelze begründet voraus.', 'The learner distinguishes a metal, ionic crystal and molecular substance, separates conductivity data from carrier models, and justifiably predicts conductivity of molten NaCl.'],
 'transfer': ['Sie vergleicht Ethanol mit Dimethylether bei gleicher Summenformel, erklärt unterschiedliche Wasserstoffbrückenfähigkeit und begrenzt daraus abgeleitete Siedetemperaturvorhersagen.', 'The learner compares ethanol and dimethyl ether with the same molecular formula, explains their different hydrogen-bonding capacity and limits derived boiling-point predictions.'],
 'rationale': 'Keep: classifying and predicting by structure is one coherent explanatory competence. The source is the bounded BY12 process clause and the canonical tag is SekII; the printed SekI breadcrumb is a separate unresolved context defect, not permission to downgrade demand.',
 'p1': 'Mobile electrons explain solid Cu conduction; fixed ions explain solid NaCl nonconduction and mobile ions predict melt conduction. Dissolved neutral sugar molecules are not equivalent to aqueous ionic charge carriers.',
 'p2': 'Ethanol and dimethyl ether are constitutional isomers; only ethanol self-associates as both an O−H donor and oxygen acceptor. Similar mass controls a plausible higher ethanol boiling point, not a numerical or universal rule.',
 'negative': 'Solubility alone determines bond type, or identical molecular formulas force identical boiling points.',
},
'9b5d6326': {
 'essential': ['Daltons Atomhypothese erklärt chemische Bilanzen durch Erhaltung und Umgruppierung von Atomen; empirisches Gesetz, prüfbare Hypothese und vereinfachtes Modell sind unterschiedliche wissenschaftliche Rollen.', 'Dalton’s atomic hypothesis explains chemical balances by conservation and rearrangement of atoms; empirical law, testable hypothesis and simplified model play different scientific roles.'],
 'performance': ['Die lernende Person unterscheidet eine gemessene Produktmasse vom Massenerhaltungsgesetz und von dessen Atomerklärung, prüft die H/O-Zählung und vermeidet einen endgültigen Beweis aus einem passenden Versuch.', 'The learner distinguishes measured product mass from the mass-conservation law and its atomic explanation, checks H/O counts and avoids claiming definitive proof from a single compatible experiment.'],
 'transfer': ['Bei Isotopen und nachgewiesenen Elektronen benennt sie Grenzen der historischen Gleichmassen- und Unteilbarkeitsannahmen und erhält das begrenzte Bilanzmodell gewöhnlicher chemischer Reaktionen.', 'For isotopes and detected electrons, the learner identifies limits of historical equal-mass and indivisibility assumptions while retaining the bounded balance model for ordinary chemical reactions.'],
 'rationale': 'Keep: both languages preserve the historical-model distinction. I independently inspected HE-G9 physical17/printed16: it explicitly pairs Dalton’s atomic hypothesis with distinguishing law, hypothesis and model. The BY8 atom-rearrangement and model-limits clauses support only their respective components, not every sibling clause.',
 'p1': '2.00 + 16.00 = 18.00 g is a consistent closed-system reference dataset. Four H and two O atoms are conserved. Empirical regularity and explanatory hypothesis remain distinct.',
 'p2': 'Different isotope masses and subatomic electrons limit historical claims without changing element identity or invalidating ordinary chemical atom balance. A proposed electronic structure remains a testable hypothesis.',
 'negative': 'One mass-conservation experiment conclusively proves that atoms are indivisible and all atoms of one element have equal mass.',
},
'22133f29': {
 'decision': 'revise',
 'proposed': ['Die lernende Person kann Oxidationszahlen nutzen, einfache Redoxteilgleichungen in wässrigen Lösungen formulieren und Redoxgleichungen fachlich korrekt erstellen.', 'The learner can use oxidation numbers, formulate simple redox half-equations in aqueous solutions, and write redox equations correctly.'],
 'essential': ['Redoxbilanzen koppeln Oxidationszahländerungen mit Elektronenabgabe und -aufnahme; Teil- und Gesamtgleichungen erhalten Atome und Gesamtladung im angegebenen wässrigen Milieu.', 'Redox balances connect oxidation-number changes with electron loss and gain; half and overall equations conserve atoms and total charge in the stated aqueous medium.'],
 'performance': ['Die lernende Person leitet für Zn/Cu2+ zwei Teilgleichungen her, kürzt zwei Elektronen und entdeckt eine falsche 1:2-Zn/Cu-Bilanz anhand der Ladung.', 'The learner derives both half-equations for Zn/Cu2+, cancels two electrons and detects an incorrect 1:2 Zn/Cu balance by charge conservation.'],
 'transfer': ['Für vorgegebenes MnO4−/Fe2+ in saurer Lösung gleicht sie O, H und Ladung aus, multipliziert die Fe-Teilgleichung mit fünf und überträgt die Produktannahme nicht auf basisches Milieu.', 'For supplied MnO4−/Fe2+ in acidic solution, the learner balances O, H and charge, multiplies the iron half-equation by five and does not transfer the product assumption to basic media.'],
 'rationale': 'Revise only the English omission of aqueous solutions. German already states the bounded environment and the actual BY10 redox-half-equation source explicitly includes it. Keeping German verbatim and restoring this phrase in English makes the languages equivalent without changing the goal.',
 'p1': 'Zn loses and Cu2+ gains two electrons, giving Zn + Cu2+ → Zn2+ + Cu. The supplied 1:2 draft has +4 versus +2 charge and is rejected.',
 'p2': 'MnO4− + 8 H+ + 5 Fe2+ → Mn2+ + 4 H2O + 5 Fe3+ has one Mn, five Fe, four O and eight H atoms and +17 charge on each side. The medium and products are explicitly supplied.',
 'negative': 'Changing ion charges or leaving uncancelled electrons in the overall equation is allowed; the same manganese product applies in any medium.',
},
'1f30d81c': {
 'essential': ['Redox verändert Oxidationszahlen durch Elektronenübertragung; Brønsted-Reaktionen übertragen Protonen, weshalb Gasentwicklung oder eine höhere Teilchenladung allein keinen Reaktionstyp beweist.', 'Redox changes oxidation numbers through electron transfer; Brønsted reactions transfer protons, so gas evolution or increased particle charge alone does not establish reaction type.'],
 'performance': ['Die lernende Person erklärt Mg/Säure als Redox und Carbonat/Säure als Protonenaufnahme mit Folgereaktion, prüft Oxidationszahlen und begründet den Unterschied trotz Gasbildung in beiden Fällen.', 'The learner explains Mg/acid as redox and carbonate/acid as proton uptake followed by reaction, checks oxidation numbers and justifies the distinction despite gas production in both.'],
 'transfer': ['Bei Zn/Cu2+ und NH3/H3O+ ohne Gasentwicklung unterscheidet sie Elektronen- von Protonendonator und erklärt, warum NH4+-Bildung keine Oxidation des Stickstoffs ist.', 'For Zn/Cu2+ and NH3/H3O+ without gas evolution, the learner distinguishes electron from proton donors and explains why NH4+ formation is not oxidation of nitrogen.'],
 'rationale': 'Keep: the descriptions specify the transferred entity and representative contrasting reactions. The full examples preserve charge and element balances and avoid treating every reaction performed in acid as pure protolysis.',
 'p1': 'Mg changes 0 to +II and H +I to 0. In CaCO3/acid, Ca +II and C +IV remain unchanged while protonated carbonate releases CO2. Both hydronium equations balance atoms and charge.',
 'p2': 'NH3 protonation changes total charge but leaves N at −III. Zn/Cu2+ changes oxidation states without gas. Donor/acceptor terminology specifies the transferred entity.',
 'negative': 'Gas bubbles prove redox; any increase in positive ion charge is oxidation.',
},
'7a05a1ce': {
 'essential': ['Ein Reaktionstyp beruht auf Bindungs- und Teilchenänderungen; Mechanismus und übertragene Einheit sind genauer als die Summengleichung, und Umkehrbarkeit verlangt passende Bedingungen.', 'A reaction type rests on bond and particle changes; mechanism and transferred entity are more specific than the overall equation, and reversibility requires suitable conditions.'],
 'performance': ['Die lernende Person klassifiziert Protolyse, Redox und eine ausdrücklich vorgegebene SN2-Substitution und unterscheidet Protonen-, Elektronen- und Elektronenpaardonatoren.', 'The learner classifies proton transfer, redox and an explicitly supplied SN2 substitution, distinguishing proton, electron and electron-pair donors.'],
 'transfer': ['Bei elektrophiler Addition und reversibler Essigsäureprotolyse nutzt sie die gesamte Schrittfolge und die Rückreaktionsbeobachtung, ohne aus Protonenbeteiligung reine Protolyse oder aus einem Pfeil leichte Umkehr abzuleiten.', 'For electrophilic addition and reversible acetic-acid proton transfer, the learner uses the whole step sequence and reverse-reaction observation without inferring pure protolysis from proton involvement or ready reversal from an arrow.'],
 'rationale': 'Keep the competence: it integrates known mechanisms to classify reaction types. Prerequisites already include substitution, addition and reversible ester reactions. The bounded BY12 clause and canonical SekII tag establish the reviewed scope; the SekI breadcrumb remains inaccurate.',
 'p1': 'The supplied concerted backside attack supports SN2 classification, while an overall substitution formula alone would not. Electron-pair donation is not equivalent to net electron transfer in redox.',
 'p2': 'Ethene/HBr has a protonation step within electrophilic addition. H3O+ reprotonates acetate in the stated reversible system. No reverse-condition or kinetic claim is invented for the addition.',
 'negative': 'A substitution product formula proves SN2, or every mechanism containing H+ is solely a Brønsted reaction.',
},
'a44af1fa': {
 'essential': ['Selektive Ionennachweise belegen unter kontrollierten Bedingungen einzelne Bestandteile; eine eindeutige Salzidentität braucht eine begrenzte Kandidatenmenge, und qualitative Befunde liefern keine Mengenanteile.', 'Selective ion tests establish individual constituents under controlled conditions; unique salt identity requires a bounded candidate set, and qualitative findings do not supply proportions.'],
 'performance': ['Die lernende Person wertet getrennte Chlorid-/Sulfatnachweise mit Leer- und Positivkontrollen aus, formuliert Fällungsgleichungen und entscheidet zwischen den vorgegebenen reinen Salzen.', 'The learner evaluates separate chloride/sulfate tests with blanks and positive controls, writes precipitation equations and distinguishes the supplied pure-salt candidates.'],
 'transfer': ['Bei einem unbekannten Produktgemisch prüft sie Etiketten anhand belegter Ionen und pH-Daten, verwirft eindeutige ursprüngliche Ionenpaarungen und lässt Stoffmengen und nicht geprüfte Bestandteile offen.', 'For an unknown product mixture, the learner evaluates labels using supported ions and pH data, rejects unique original ion pairing and leaves quantities and untested constituents unresolved.'],
 'rationale': 'Keep as bounded qualitative analysis: composition inference and product-label checking use the same analytical evidence. BY8 supports pure-salt analysis; the broader BY12 clause supports mixtures and product checks, without proving every SekI projection. Historical image defects and the withdrawn current link remain open.',
 'p1': 'Ag+ + Cl− → AgCl and Ba2+ + SO4^2− → BaSO4 conserve charge. Under the binary pure NaCl/Na2SO4 assumption the results identify NaCl; a sodium test cannot distinguish the two.',
 'p2': 'Sulfate detection contradicts no-sulfates. Na+/Cl− coexistence cannot reconstruct unique original salts. Independent calibrated pH2 and pH12 contradict neutral labels; neither sodium/chloride tests nor pH alone identify all acid/base components or amounts.',
 'negative': 'Detected solution ions uniquely pair into the original salts, and positive sodium/chloride tests prove a neutral pure NaCl solution.',
 'note': 'Practical execution remains unobserved. Full all-jurisdiction and stage/course projection source closure is not granted by these bounded BY clauses.',
},
'597ac03c': {
 'essential': ['Brønsted-Eignung hängt von einem unter den gegebenen Bedingungen abgebbaren Proton oder protonenbindenden Elektronenpaar ab; Ladung und H-Anzahl allein sind keine ausreichenden Kriterien.', 'Brønsted suitability depends on a donatable proton or a proton-binding electron pair under the stated conditions; charge and hydrogen count alone are insufficient criteria.'],
 'performance': ['Die lernende Person markiert polare H-Bindung und freie Elektronenpaare in HCl, Wasser und NH3 und erklärt passende Protonenabgabe oder -aufnahme ohne Übertragung eines neutralen H-Atoms.', 'The learner marks polarized H bonds and lone pairs in HCl, water and NH3, explaining appropriate proton donation or uptake without transferring a neutral H atom.'],
 'transfer': ['Für Wasser, CH4 und Na+ begründet sie Ampholyt-Eignung und Gegenbeispiele zur bloßen H-Zahl oder positiven Ladung, begrenzt auf typische wässrige Brønsted-Reaktionen.', 'For water, CH4 and Na+, the learner explains amphoteric suitability and counterexamples to hydrogen count or positive charge alone, bounded to typical aqueous Brønsted reactions.'],
 'rationale': 'Keep: the selected atomic child is structural suitability, not the sibling reversibility competence. I checked the explicit first component of official BY10 C10.4.6; it supports the child, but no current direct routing row is integrated. The tasks add no universal strength ranking.',
 'p1': 'HCl + H2O → H3O+ + Cl− and NH3 + H3O+ → NH4+ + H2O conserve atoms and charge. Proton uptake through O/N lone pairs and donation from polarized HCl match the supplied structures.',
 'p2': 'Water has donation and uptake sites; CH4 is not an effective acid in the specified aqueous context, and bare Na+ has no Brønsted proton. Lewis metal-ion acidity is explicitly excluded rather than denied.',
 'negative': 'Every H-containing species is an effective acid in water or every positive ion is a Brønsted acid.',
 'note': 'The explicit structural component supports a direct child route. Current mapping count is zero; this independent review records support, not an integrated route or whole-source approval.',
},
'9751b6d8': {
 'decision': 'revise',
 'proposed': ['Die lernende Person kann die Beeinflussung ausgewählter Säure-Base-Reaktionen mithilfe der Umkehrbarkeit von Protonenübergängen erklären.', 'The learner can explain influences on selected acid-base reactions using the reversibility of proton transfers.'],
 'essential': ['Zugabe oder Entzug beteiligter Teilchen verändert die Anteile korrespondierender Säure-Base-Formen durch Hin- und Rückübertragung von Protonen; Umkehrbarkeit bedeutet nicht gleiche Anteile.', 'Adding or removing participating species changes proportions of conjugate acid-base forms through forward and reverse proton transfer; reversibility does not mean equal proportions.'],
 'performance': ['Die lernende Person erklärt den gegebenen pH-Anstieg beim CO2-Entzug über die gekoppelten Rückreaktionen und den Verbrauch von H3O+, ohne einen unberechenbaren End-pH zu erfinden.', 'The learner explains the supplied pH rise during CO2 removal through coupled reverse reactions and H3O+ consumption without inventing an unsupported final pH.'],
 'transfer': ['Bei NH3/NH4+ beschreibt sie entgegengesetzte Protonenwege nach passender Säure- oder Basezugabe, bilanziert Ladungen und erklärt die geänderten Formanteile.', 'For NH3/NH4+, the learner describes opposite proton-transfer routes after suitable acid or base addition, balances charges and explains changed proportions of the forms.'],
 'rationale': 'Revise: proton transfers alone name the reaction class without the explanatory reversibility explicitly present in the bounded official C10-NTG.2.8 source, the direct prerequisite and both cases. The concise replacement restores this already claimed causal relation. The historical influence image is wrong and its current link is withdrawn; no restored binding is claimed.',
 'p1': 'CO2 removal drives carbonic-acid replacement and reverse protolysis; bicarbonate consumes H3O+. The observed pH increase is compatible with the bounded coupled model, not irreversible acid destruction.',
 'p2': 'NH3 + H3O+ → NH4+ + H2O and NH4+ + OH− → NH3 + H2O are balanced opposite proton-transfer routes. No electron-loss or elemental-change claim occurs.',
 'negative': 'Adding OH− must accumulate every product of the original acid-base equation, including BH+, or degassing permanently destroys all acid reactivity.',
 'note': 'The source clause directly supports influence through reversibility, but the selected child still has zero integrated direct mapping rows. A routing update remains separate.',
},
'88ee181f': {
 'essential': ['Neutralisation ist Protonenübertragung mit Stoff- und Ladungserhaltung; verbrauchte Säureäquivalente hängen vom Partner ab, während gelöste Zuschauer und Schadstoffe verbleiben können.', 'Neutralization is proton transfer with atom and charge conservation; acid-equivalent consumption depends on the partner while dissolved spectators and contaminants can remain.'],
 'performance': ['Die lernende Person erklärt H3O+ + OH− → 2 H2O und bilanziert die doppelte Säurebindung von Mg(OH)2; Neutralisation wird nicht mit Verschwinden aller Stoffe gleichgesetzt.', 'The learner explains H3O+ + OH− → 2 H2O and balances double acid-equivalent consumption by Mg(OH)2; neutralization is not equated with disappearance of all substances.'],
 'transfer': ['Für Carbonat als Säurebinder bilanziert sie CO2-Bildung und begründet bei neutralisiertem kupferhaltigem Abfall, warum pH7 allein keine Entsorgungsfreigabe ergibt.', 'For carbonate as an acid binder, the learner balances CO2 formation and explains why pH7 alone does not authorize disposal of neutralized copper-containing waste.'],
 'rationale': 'Keep: applications exemplify the same particle-level neutralization competence and both languages agree. The profiles explicitly avoid personal dosing and invented disposal rules; chemical balance remains distinct from environmental clearance.',
 'p1': 'H3O+ + OH− → 2 H2O and Mg(OH)2 + 2 H3O+ → Mg2+ + 4 H2O conserve atoms and charge. Equal strong-acid/base equivalents permit neutrality in the stated ideal model, while spectator ions remain.',
 'p2': 'CaCO3 + 2 H3O+ → Ca2+ + CO2 + 3 H2O is balanced and consumes two acid equivalents. Copper/unknown organics remain despite pH adjustment; composition and actual collection rules determine handling.',
 'negative': 'Neutral pH proves every solute has disappeared and automatically authorizes discharge or a medical dose.',
},
'7990387d': {
 'essential': ['Stoffklassen folgen der funktionellen Gruppe und ihrer Bindungsumgebung; eine Carboxy-OH-Gruppe ist keine eigenständige Alkoholgruppe und mehrere Funktionen können in einem Molekül vorkommen.', 'Compound classes follow functional groups and connectivity; a carboxyl OH is not an independent alcohol group, and several functions may occur in one molecule.'],
 'performance': ['Die lernende Person ordnet Ethanol, Ethanal, Propanon und Ethansäure anhand von Hydroxy-, Aldehyd-, Keton- und Carboxygruppe zu und begründet die Bindungsumgebung des Carbonyl-C.', 'The learner classifies ethanol, ethanal, propanone and ethanoic acid by hydroxy, aldehyde, ketone and carboxyl groups, justifying the carbonyl-carbon connectivity.'],
 'transfer': ['Bei einer Hydroxycarbonsäure erkennt sie beide Funktionen und bei Dimethylether das Fehlen aller vier hier behandelten Gruppen; sie verwirft eine vollständige, disjunkte Vierklasseneinteilung.', 'For a hydroxycarboxylic acid, the learner identifies both functions, and for dimethyl ether the absence of all four studied groups; the learner rejects an exhaustive mutually exclusive four-class scheme.'],
 'rationale': 'Keep: all four families use one functional-group classification routine with familiar context, independently distinguished from the successor naming goal. Both descriptions avoid claiming an exhaustive or mutually exclusive taxonomy.',
 'p1': 'The four supplied formulas identify the four classes. Aldehyde carbonyl has H while ketone carbonyl binds two carbon residues; carboxyl OH is part of the carboxyl group.',
 'p2': 'HOCH2CH2COOH combines a distinct alcoholic OH with carboxyl; CH3OCH3 is ether. The changed examples test multifunctionality and classification boundaries rather than recalling the picture.',
 'negative': 'Any oxygen-containing molecule is an alcohol, or each organic compound belongs to exactly one of the four families.',
},
'e14abd24': {
 'essential': ['Grundlegende IUPAC-Benennung ordnet eine bestimmte Konstitution Stammkette, Hauptgruppe, Positionszahlen und Verzweigungen zu; eine Summenformel allein bestimmt den Namen nicht.', 'Basic IUPAC naming assigns a definite connectivity to a parent chain, principal group, locants and branches; molecular formula alone does not fix the name.'],
 'performance': ['Die lernende Person benennt die vier vorgegebenen einfachen Vertreter, zählt Carbonyl-/Carboxyl-C zur Stammkette und begründet die niedrige Ketonpositionszahl.', 'The learner names the four supplied simple representatives, includes carbonyl/carboxyl carbon in the parent chain and justifies the lower ketone locant.'],
 'transfer': ['Für verzweigte Alkohol-, Keton- und Säurestrukturen gibt sie korrekte Namen, priorisiert die Hauptgruppe und konstruiert ein anderes Alkohol-Konstitutionsisomer ohne erfundene Stereodeskriptoren.', 'For branched alcohol, ketone and acid structures, the learner gives correct names, prioritizes the principal group and constructs another alcohol constitutional isomer without inventing stereodescriptors.'],
 'rationale': 'Keep: this is one systematic naming routine applied to the explicitly bounded four families. The bilingual text and actual BY9 nomenclature clause agree; complicated polyfunctional precedence and stereochemistry are not silently imported.',
 'p1': 'Ethanol, propanal, butan-2-one and propanoic acid correspond to the four formulas. Aldehyde/carboxyl carbon counts as C1; ketone numbering uses 2 rather than 3.',
 'p2': '3-Methylbutan-2-ol, 3-methylbutan-2-one, 2-methylpropanoic acid and butan-2-ol are correct. OH priority determines direction; butan-1-ol is a different four-carbon connectivity. No R/S is implied by the supplied condensed formulas.',
 'negative': 'Branch locants follow molecular formula alone, or substituent numbering overrides a lower principal-group locant.',
},
}

records = []
positive = []
current_comparison = []
profiles = read(B/'inputs/positive-evidence.seventeen.author-candidate-set.json')['goals']
profile_index = {g['goalId']: g for g in profiles}
cases = read(B/'inputs/thirty-four-complete-bilingual-material-cases.author-review17.json')['cases']
for i, g in enumerate(source['goals'], 1):
    j = J[g['goalId'][:8]]
    evidence = {}
    for field, key in [('essentialUnderstanding','essential'),('observablePerformance','performance'),('transferExpectation','transfer')]:
        evidence[field+'De'], evidence[field+'En'] = j[key]
    row = { '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': f'chemie-current17-independent-a-d-{i:02}',
        'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': source['bundleFingerprint'], 'bookDigest': source['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision': j.get('decision','keep'), 'understandingEvidence': evidence, 'rationale': j['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'}
    if j.get('proposed'):
        row['proposedDescriptionDe'], row['proposedDescriptionEn'] = j['proposed']
    records.append(row)
    original, current = author_index[g['goalId']], live_index[g['goalId']]
    delta = {k: {'author':original.get(k), 'currentAtReviewStart':current.get(k)}
             for k in sorted(set(original)|set(current)) if original.get(k)!=current.get(k)}
    current_comparison.append({'goalId':g['goalId'], 'wholeGoalDifferences':delta,
        'currentBindingDisposition':'historical_page_stale_after_image_withdrawal' if delta else 'whole_goal_unchanged_since_author_input',
        'currentPageRebuilt':False, 'strictDescriptionIntegrated':False})
    gcases = [c for c in cases if c['goalId']==g['goalId']]
    profile = profile_index[g['goalId']]
    p = {'goalId':g['goalId'], 'reviewAuthority':'ai_candidate', 'status':'needs_human_review',
        'evidenceLevel':'E1', 'maximumClaimScope':'G1',
        'judgment':'supported_as_written_candidate_with_recorded_limits',
        'inputProfileDigest': digest(json.dumps(profile,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()),
        'descriptionDecision':row['decision'], 'descriptionReplacementIsNotIntegrated': row['decision']=='revise',
        'currentBindingDisposition': current_comparison[-1]['currentBindingDisposition'],
        'profileNativeCurrentPassClaimed':False,
        'cases':[{'caseId':c['caseId'], 'bothLanguageBodiesReviewed':True,
                  'materialAndTaskReviewed':True, 'referenceResponseReviewed':True,
                  'judgment':'supported_reference_case',
                  'independentScientificRationale':j['p1' if n==0 else 'p2'],
                  'caseDigest':digest(json.dumps(c,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())}
                 for n,c in enumerate(gcases)],
        'ownNegativeResponse':j['negative'], 'negativeResponseJudgment':'insufficient_understanding',
        'negativeResponseReason':'This response contradicts the goal-specific distinction tested by the independently reviewed material and the stated model limitations.',
        'reviewLimits':j.get('note','No observed learner performance, practical execution, human approval or whole-jurisdiction source closure is established.'),
        'observedLearner':False, 'humanApproval':False}
    positive.append(p)
records_path = B/'results/description-review-records.jsonl'
records_path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
write(B/'results/description-review-records.json',records)
write(B/'results/positive-evidence-bounded-independent-review.json',{
    'contract':'bounded-independent-positive-evidence-review-v1', 'reviewer':'/root/chem17_current_independent_a',
    'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1',
    'goalCount':17,'completeCaseCount':34,'languageBodiesReviewed':68,
    'actualLearnerEvidence':False, 'humanApproval':False,
    'scope':'Independent analysis of full author materials, bilingual tasks, model answers and limitations; no native P integration or runtime learner outcome',
    'minimumDemonstrationsInterpretation':'Two distinct evidence demonstrations may occur within one suitable task; this review adds no task quota.',
    'judgments':positive})
write(B/'results/current-versus-historical-page-binding.json',{
    'reviewedHistoricalBundleFingerprint':source['bundleFingerprint'], 'reviewedHistoricalBookDigest':source['bookDigest'],
    'currentCanonDigest':digest((B/'inputs/current-canonical-chemistry.at-review-start.json').read_bytes()),
    'goals':current_comparison, 'changedWholeGoals':sum(bool(x['wholeGoalDifferences']) for x in current_comparison),
    'netStrictM7Gain':0, 'restoredBindings':0, 'humanApproval':False})
params={'reviewer':'/root/chem17_current_independent_a','modelIdentity':'GPT-6/Codex; exact serving variant not available',
        'samplingParameters':'not exposed','method':'actual separate agent review; own substantive judgments serialized by this file',
        'blindToPeerJudgments':True,'externalApiGeneration':False}
write(B/'results/reviewer-execution-context.json',params)
round_dir=B/'inputs/native-d-seventeen/round-a'
bundle_dir=B/'inputs/native-d-seventeen/bundle'
batch_path=next((round_dir/'batches').glob('*.input.jsonl'))
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
     'schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
     'batchId':campaign['batches'][0]['batchId'],'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],
     'bundleFingerprint':source['bundleFingerprint'],'bookDigest':source['bookDigest'],
     'provider':'OpenAI','model':'GPT-6/Codex; exact serving variant not exposed',
     'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2',
     'promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
     'generationParametersFingerprint':digest((B/'results/reviewer-execution-context.json').read_bytes()),
     'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
     'goalIds':[g['goalId'] for g in source['goals']],
     'inputArtifacts':[
         {'role':'description_review_batch_input_jsonl','digest':digest(batch_path.read_bytes())},
         {'role':'review_input_json','digest':digest((bundle_dir/'review-input.json').read_bytes())},
         {'role':'review_prompt','digest':campaign['promptFingerprint']},
         {'role':'review_criteria','digest':campaign['criteriaFingerprint']},
         {'role':'book_pdf','digest':digest((bundle_dir/'book.pdf').read_bytes())},
         {'role':'book_html','digest':digest((bundle_dir/'book.html').read_bytes())},
         {'role':'book_model','digest':digest((bundle_dir/'book-model.json').read_bytes())},
         {'role':'book_pdf_render_manifest','digest':digest((bundle_dir/'book.pdf.render-manifest.json').read_bytes())},
         {'role':'book_html_render_manifest','digest':digest((bundle_dir/'book.html.render-manifest.json').read_bytes())},
     ],
     'startedAt':read(B/'review-start.json')['startedAt'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
     'status':'completed','outputDigest':digest(records_path.read_bytes()),'toolchainVersion':'goal-description-review-v1'}
write(B/'results/description-review-run.json',run)
print('Serialized own independent D judgments:',len(records),'keep:',sum(r['decision']=='keep' for r in records),'revise:',sum(r['decision']=='revise' for r in records))
print('Bounded independent P judgments:',len(positive),'cases:',sum(len(p['cases']) for p in positive))
