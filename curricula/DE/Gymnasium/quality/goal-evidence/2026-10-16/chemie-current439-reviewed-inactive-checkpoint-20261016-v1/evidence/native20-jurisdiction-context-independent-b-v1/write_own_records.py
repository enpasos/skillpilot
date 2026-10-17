import json,hashlib,datetime
from pathlib import Path
root=Path('/home/enpasos/projects/skillpilot')
out=root/'tmp/chemie-m7-resumed-20261016/native20-jurisdiction-context-independent-b-v1'
first=json.loads((out/'FIRST.scientific.json').read_text())
base=root/'tmp/chemie-m7-resumed-20261016/native20-jurisdiction-frozen-current641-review-capsule-v1/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-stable-jurisdiction-only-first20-private-L6-technical-20261016-v1/native-twenty/round-b'
c=json.loads((base/'description-review-campaign.json').read_text());batch=c['batches'][0]
inputs=[json.loads(x) for x in next((base/'batches').glob('*.input.jsonl')).read_text().splitlines()]
contentdir=root/'tmp/chemie-m7-resumed-20261016/native20-jurisdiction-content-only-own-first-inputs-v2-complete'
contents=[json.loads(x.read_text()) for x in sorted(contentdir.glob('CONTENT.*'))]
assert len(inputs)==len(contents)==len(first['records'])==20
for a,b in zip(inputs,contents):
 g=a['goal']
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','canonicalContext']:assert g[k]==b[k],(g['goalId'],k)
 assert g['reviewContext']['evidenceProfile']['profile']==b['wholeUnderstandingProfileBody']

chains=[
[
'Dokumentation erhält Rohwerte und macht Probe, Quelle, Größen, Einheiten, Bedingungen und Fehlstellen prüfbar; Beobachtung und berechnete oder modellierte Deutung bleiben getrennt.',
'Documentation preserves raw values and makes sample, source, quantities, units, conditions and missing fields auditable; observation stays distinct from calculated or model-based interpretation.',
'Die lernende Person erstellt selbst eine strukturierte Datentabelle und versieht eine daraus berechnete Konzentration mit Formel, Verdünnungskette und Herkunft, ohne Messungen oder Metadaten zu erfinden.',
'The learner constructs a structured data table and records the formula, dilution chain and provenance of a calculated concentration without inventing measurements or metadata.',
'Eine neue R2-Notiz wird als separates Ereignis erfasst; eine korrigierte Verdünnung ändert versioniert die Konzentrationsrechnung, während alte Rohdaten und fehlende Altbedingungen sichtbar erhalten bleiben.',
'A new R2 note is recorded as a separate event; a corrected dilution changes the versioned concentration calculation while preserving old raw data and visible gaps in earlier conditions.'
],
[
'Trend, Hypothesenstützung und Gültigkeitsbereich sind verschiedene Aussagen. Wiederholungsstreuung und kontrollierte Bedingungen bestimmen, wie stark ein Temperatur- oder Leitfähigkeitstrend gedeutet werden darf.',
'A trend, support for a hypothesis and its valid range are different claims. Repeat scatter and controlled conditions determine how strongly a temperature or conductivity trend can be interpreted.',
'Die lernende Person erstellt beschriftete Tabellen/Diagramme, berechnet passende Mittelwerte, erläutert die Beziehungen und begründet die Stützung der vorgegebenen Hypothese anhand aller Einzelwerte.',
'The learner constructs labelled tables or graphs, calculates suitable means, explains relationships and justifies support for the supplied hypothesis using all individual values.',
'Bei stark streuenden 50-°C-Zeiten oder einer wärmeren Leitfähigkeitsprobe prüft sie selbst die veränderten Bedingungen, erhält beide Rohwerte und grenzt Temperatur-, Konzentrations- und Löslichkeitsaussagen ab.',
'For widely scattered 50 °C times or a warmer conductivity sample, the learner independently checks changed conditions, preserves both raw values and distinguishes temperature, concentration and solubility claims.'
],
[
'Messantwort und eindeutige Stoffidentifikation sind nicht gleich. Selektivität, Blindproben, Temperatur, Matrix und Unsicherheit begrenzen die Schlussfolgerungen aus chemischen Daten.',
'A measurement response is not unique substance identification. Selectivity, blanks, temperature, matrix and uncertainty bound conclusions from chemical data.',
'Die lernende Person beurteilt die X/Y-Farbtestaussage und den A20/A35/B35-Leitfähigkeitsvergleich anhand ihrer Kontrollen und benennt jeweils eine tragfähige sowie eine unzulässige Schlussfolgerung.',
'The learner assesses the X/Y colour-test claim and A20/A35/B35 conductivity comparison using their controls and identifies both a supported and an unsupported conclusion for each.',
'Nach Ausschluss des bekannten Kreuzreaktanten oder Zugabe von Saccharose entwickelt sie eine passende neue Kontroll-/Validierungsstrategie, ohne verbleibende Interferenzen oder Matrixeffekte für erledigt zu erklären.',
'After removing the known cross-reactant or adding sucrose, the learner develops an appropriate new control or validation strategy without treating remaining interference or matrix effects as resolved.'
],
[
'Elektronenübergang erklärt die Ionenladungen und Edelgaskonfiguration; die gesamte Energiebilanz einschließlich Gitterbildung erklärt die Exothermie des gegebenen Salzbildungsfalls.',
'Electron transfer explains ion charges and noble-gas configurations; the complete energy balance including lattice formation explains exothermicity in the supplied salt-formation case.',
'Die lernende Person leitet Na+/Cl− mit ihren Elektronenverteilungen ab und bilanziert Atomisierung, Ionisierung, Elektronenaufnahme und Gitterbildung auf gemeinsamer Stoffmengenbasis.',
'The learner derives Na+/Cl− and their electron distributions and balances atomisation, ionisation, electron gain and lattice formation on a common amount basis.',
'Im MgO-Modell prüft sie das neue Zwei-Elektronen-Verhältnis und die Gesamtbilanz selbst; weder Edelgaskonfiguration noch große Gitterenergie werden allein als Garantie der spontanen Bildung ausgegeben.',
'In the MgO model the learner independently checks the new two-electron ratio and total balance; neither noble-gas configuration nor large lattice energy alone guarantees spontaneous formation.'
],
[
'Metallische Leitfähigkeit und Verformbarkeit erfordern im einfachen Modell mobile Elektronen und zusammenhaltende positive Atomrümpfe; isolierte neutrale Dalton-Kugeln erklären diese Kombination nicht.',
'Metallic conductivity and malleability require mobile electrons and cohesive positive cores in the simple model; isolated neutral Dalton spheres do not explain this combination.',
'Die lernende Person begründet für einen gebogenen leitenden Kupferstreifen die Modellwahl und verknüpft bewegliche Elektronen sowie verschiebbare Rümpfe mit den Beobachtungen.',
'The learner justifies the model choice for a bent conductive copper strip and links mobile electrons and shiftable cores to the observations.',
'Für Aluminium entwickelt sie denselben Zusammenhang aus neuen Stoffdaten und verwendet Graphit als Gegenbeispiel zum Schluss, jeder elektrische Leiter müsse ein Metall sein.',
'For aluminium the learner derives the same relationship from fresh material data and uses graphite to counter the claim that every electrical conductor must be a metal.'
],
[
'Diskrete kovalente Moleküle und ausgedehnte Ionengitter unterscheiden Teilchenart, Bindung und Formelinterpretation; die Metall/Nichtmetall-Faustregel ist auf geeignete einfache binäre Fälle begrenzt.',
'Discrete covalent molecules and extended ionic lattices differ in particle type, bonding and formula meaning; the metal/nonmetal rule is bounded to suitable simple binary cases.',
'Die lernende Person ordnet H2O-/NaCl-Reaktion und Teilchenmodell einander zu und erläutert Elektronenpaarbindung gegenüber Ionenanziehung sowie Atomzahl gegenüber Gitterverhältnis.',
'The learner matches H2O/NaCl reactions to particle models and explains shared-electron bonding versus ionic attraction and atom counts versus lattice ratios.',
'Für CO2 und MgO korrigiert sie die Behauptung, jede Verbindung bestehe aus Molekülen, anhand der neuen Elemente und gegebenen Teilchenstruktur statt nur anhand der Formelschreibweise.',
'For CO2 and MgO the learner corrects the claim that every compound consists of molecules using the new elements and supplied particle structures rather than formula appearance alone.'
],
[
'Eine Molekülformel zählt Atome je abgegrenztem Molekül; eine ionische Verhältnisformel beschreibt das kleinste Ionenverhältnis eines ausgedehnten Gitters, dessen Anziehung in viele Richtungen wirkt.',
'A molecular formula counts atoms in a discrete molecule; an ionic ratio formula gives the smallest ion ratio in an extended lattice whose attraction acts in many directions.',
'Die lernende Person erklärt H2O und NaCl aus ihren Teilchenbildern und verbindet gerichtete kovalente Bindung mit Molekülbegrenzung sowie Ionenanziehung mit fortgesetztem Gitter.',
'The learner explains H2O and NaCl using their particle diagrams, connecting directional covalent bonding with discrete molecules and ionic attraction with an extended lattice.',
'Sie erklärt am neuen Vergleich CO2/CaF2, weshalb gleiche 1:2-Ziffern weder die gleiche Teilchenanordnung noch diskrete CaF2-Moleküle beweisen.',
'For the fresh CO2/CaF2 comparison the learner explains why the same 1:2 numbers establish neither the same particle arrangement nor discrete CaF2 molecules.'
],
[
'Salzformeln bilanzieren elektrische Neutralität im kleinsten Ionenverhältnis; mehratomige Ionen bleiben erhalten. Gitterbindung und Ionenbeweglichkeit verbinden diesen Aufbau mit Stoffeigenschaften.',
'Salt formulas balance electrical neutrality at the smallest ion ratio while preserving polyatomic ions. Lattice bonding and ion mobility connect this structure with material properties.',
'Die lernende Person leitet MgCl2/Al2O3 ab, benennt sie und erklärt Leitfähigkeit in Feststoff, Schmelze oder Lösung sowie Sprödigkeit über den Ionenaufbau.',
'The learner derives and names MgCl2/Al2O3 and uses ionic structure to explain conduction in solid, melt or solution and brittleness.',
'Bei Nitrat und Ammoniumsulfat erhält sie die inneren Ionenformeln, begründet Klammern und Ladungsausgleich und setzt die Formelableitung nicht mit garantierter Wasserlöslichkeit gleich.',
'For nitrate and ammonium sulfate the learner preserves internal ion formulas, explains brackets and charge balance and does not confuse deriving a formula with guaranteed water solubility.'
],
[
'Korrespondierende Paare unterscheiden sich um ein Proton; Donator-/Akzeptorrollen hängen vom Partner ab. Vorgegebene relative Stärken erlauben eine qualitative Gleichgewichtspräferenz mit begrenzter Reichweite.',
'Conjugate pairs differ by one proton and donor/acceptor roles depend on the partner. Supplied relative strengths allow a qualitative equilibrium preference with limited reach.',
'Die lernende Person formuliert die reversible Essigsäure-Ammoniak-Protonenübertragung, prüft Atome/Ladung und begründet aus der gegebenen Stärkenordnung die bevorzugte Seite.',
'The learner writes the reversible acetic-acid/ammonia proton transfer, checks atoms and charge and justifies the favoured side from the supplied strength order.',
'Sie erklärt die wechselnde HCO3−-Rolle mit H3O+ beziehungsweise OH− und begrenzt beim Öffnen eines CO2-Systems die Aussagen, ohne eine neue Konstante, Vollständigkeit oder Reaktionsgeschwindigkeit zu erfinden.',
'The learner explains the changing HCO3− role with H3O+ versus OH− and bounds conclusions after opening a CO2 system without inventing a new constant, completion or reaction rate.'
],
[
'Akute Beeinträchtigung, längerfristige körperliche Schädigung und multifaktorielle Abhängigkeit sind verschiedene Risikodimensionen; Alltagsurteile brauchen begründete Gesundheits-, Sicherheits- und Teilhabekriterien.',
'Acute impairment, longer-term bodily harm and multifactorial dependence are different risk dimensions; everyday judgements need reasoned health, safety and inclusion criteria.',
'Die lernende Person prüft die Kaffee-Behauptung, begründet eine sichere Heimweg-/Veranstaltungsentscheidung und erklärt das Zusammenwirken individueller und sozialer Faktoren respektvoll.',
'The learner assesses the coffee claim, justifies a safe journey or event decision and respectfully explains interacting individual and social factors.',
'Sie überträgt das Urteil auf Trinken gegen Prüfungsstress oder unbelegte alkoholarme Werbung, benennt fehlende Angaben und entwickelt Hilfe-/Präventionsideen ohne Diagnose oder vermeintlich sichere Menge.',
'The learner transfers judgement to drinking for exam stress or unsupported low-alcohol advertising, identifies missing information and develops support or prevention ideas without diagnosis or a purported safe dose.'
],
[
'Ein planarer σ-Rahmen mit sechs seitlich überlappenden p-Orbitalen trägt Benzols delokalisierten Sechs-π-Elektronen-Zustand; Resonanzformeln sind Darstellungen desselben Zustands mit energetischer Stabilisierung.',
'A planar sigma framework with six laterally overlapping p orbitals supports benzene’s delocalised six-pi-electron state; resonance contributors represent that one energetically stabilised state.',
'Die lernende Person verknüpft Orbitalgeometrie und Kekulé-Darstellungen und begründet die 152-kJ/mol-Modellstabilisierung anhand der Hydrierungsdaten auf gemeinsamer Produktbasis.',
'The learner connects orbital geometry with Kekulé representations and justifies the modelled 152 kJ/mol stabilisation from hydrogenation data on a common product basis.',
'Am 1,3-Cyclohexadien erklärt sie das offene konjugierte Segment und die Unterbrechung durch sp3-C; daraus begründet sie den Unterschied zwischen lokaler Konjugation und zyklischer Aromatenstabilisierung.',
'For 1,3-cyclohexadiene the learner explains the open conjugated segment and interruption by sp3 carbons, distinguishing local conjugation from cyclic aromatic stabilisation.'
],
[
'Ein Silberhalogenidbefund kann freigesetztes Halogenid als Abgangsgruppenhinweis stützen; Probenzusammensetzung und Störionen begrenzen den Rückschluss auf eine Substitution.',
'A silver-halide result can support released halide as evidence about a leaving group; sample composition and interfering ions limit the inference about substitution.',
'Die lernende Person verbindet den hellgelben Silbernitratniederschlag einer Bromethan-Reaktionslösung begründet mit Bromid und C–Br-Spaltung, ohne die gesamte Produktstruktur daraus abzuleiten.',
'The learner connects the pale-yellow silver-nitrate precipitate from a bromoethane reaction solution with bromide and C–Br cleavage without deriving the whole product structure from it.',
'Enthält ein neuer Chlorethan-Ausgangsansatz bereits Chlorid, fordert sie eine geeignete Vorher-/Blindprobe und erklärt, warum weißer Niederschlag allein keine neu freigesetzten Chloridionen belegt.',
'When a new chloroethane starting sample already contains chloride, the learner requires an appropriate before/blank control and explains why a white precipitate alone does not establish newly released chloride.'
],
[
'Zwei beziehungsweise drei vollständige Carboxylgruppen definieren Di- beziehungsweise Tricarbonsäuren; zusätzliche Hydroxygruppen ändern diese Zählung nicht und Strukturformeln müssen valenzrichtig sein.',
'Two versus three complete carboxyl groups define di- versus tricarboxylic acids; additional hydroxyl groups do not change that count and structural formulas must have valid valences.',
'Die lernende Person markiert alle Carboxylgruppen in Oxal-/Citronensäure und verwendet passende Strukturformeln, in denen sie Hydroxygruppen und Carboxylgruppen unterscheidet.',
'The learner marks every carboxyl group in oxalic/citric acid and uses suitable structural formulas to distinguish hydroxyl from carboxyl groups.',
'Sie zeichnet HOOC–CH(OH)–CH(OH)–COOH valenzrichtig und begründet trotz der beiden zusätzlichen OH-Gruppen die Einordnung als Dicarbonsäure.',
'The learner draws HOOC–CH(OH)–CH(OH)–COOH with valid valences and explains why it remains a dicarboxylic acid despite the two additional OH groups.'
],
[
'Alkalische Acylhydrolyse umfasst OH−-Angriff am Carbonyl-C, tetraedrische Zwischenstufe, Abspaltung und Protonentransfer; Carboxylat/Alkohol sind die alkalischen Endprodukte und OH− wird netto verbraucht.',
'Alkaline acyl hydrolysis involves OH− attack at carbonyl C, a tetrahedral intermediate, elimination and proton transfer; carboxylate/alcohol are the alkaline products and OH− is consumed overall.',
'Die lernende Person stellt für Ethylethanoat den Elektronenfluss mit passenden Ladungen und Bindungsänderungen dar und erklärt den terminalen Protonenschritt anhand der Gesamtbilanz.',
'The learner represents electron flow for ethyl ethanoate with correct charges and bond changes and explains the final proton-transfer step using the overall balance.',
'Im vorgegebenen Methylpropanoat-Acylweg korrigiert sie Angriffsort, Zwischenstufenladung und falsches Säure-Endprodukt mit Gründen, statt nur die Produkte einer Vorlage zu ersetzen.',
'For the specified methyl-propanoate acyl pathway the learner corrects attack site, intermediate charge and incorrect acid endpoint with reasons rather than merely replacing template products.'
],
[
'Fett besitzt drei Esterbindungen, deren alkalische Hydrolyse Glycerin und Fettsäuresalze liefert. Aussalzen trennt bereits gebildete Seife von der wässrigen Phase; ein Protokolltext ersetzt keine Durchführung.',
'Fat has three ester bonds whose alkaline hydrolysis yields glycerol and fatty-acid salts. Salting out separates already formed soap from the aqueous phase; protocol text does not replace execution.',
'Die lernende Person führt eine freigegebene Seifenherstellung und Trennung betreut sachgerecht aus, dokumentiert eigene Handgriffe/Beobachtungen und erklärt den Stoffschluss über die Esterstruktur.',
'The learner correctly carries out an approved supervised soap preparation and separation, documents actual actions and observations and explains the products using ester structure.',
'Beim neuen Fett und kontrollierten Vergleich mit/ohne Salz begründet sie den Trenneffekt an eigenen Phasenbeobachtungen und unterscheidet ihn von der vorausgehenden Fettspaltung; eine Fallvariante ist keine Versuchszahlquote.',
'For a fresh fat and controlled with/without-salt comparison the learner explains separation using actual phase observations and distinguishes it from preceding fat cleavage; a case variant is not an experiment-count quota.'
],
[
'Hydrophile Köpfe und hydrophobe Reste bestimmen die Grenzflächenorientierung von Seifen. Normale Micellen, stabilisierte Öltröpfchen und Oberflächenadsorption erklären unterschiedliche Wirkungen desselben amphiphilen Aufbaus.',
'Hydrophilic heads and hydrophobic tails determine soap orientation at interfaces. Normal micelles, stabilised oil droplets and surface adsorption explain distinct effects of the same amphiphilic structure.',
'Die lernende Person richtet Moleküle an Luft/Wasser und Öl/Wasser begründet aus, zeichnet eine normale wässrige Micelle und deutet Dispersions-/Oberflächenspannungsdaten ohne Fettspaltung zu behaupten.',
'The learner justifies molecular orientation at air/water and oil/water interfaces, draws a normal aqueous micelle and interprets dispersion/surface-tension data without claiming fat cleavage.',
'Bei einem Wassertröpfchen in Öl leitet sie die umgekehrte räumliche Orientierung aus dem Phasenkontakt her und erklärt, warum die Zeichnung allein noch keine stabile inverse Micelle oder Emulsion beweist.',
'For a water droplet in oil the learner derives the reversed spatial orientation from phase contact and explains why the drawing alone does not establish a stable inverse micelle or emulsion.'
],
[
'Wirkstoffstruktur, Präparatzusammensetzung, Verkauf und recherchierter Gebrauch beantworten verschiedene Fragen. Chemische Gemeinsamkeiten ersetzen keine vollständige Quellenprüfung oder begrenzte Anwendungsbewertung.',
'Active-ingredient structure, formulation composition, sales and researched use answer different questions. Chemical similarities do not replace full source checking or bounded application evaluation.',
'Die lernende Person recherchiert ASS/Ibuprofen/Paracetamol mit Quellenorten, ordnet Carboxyl-, Ester-, Phenol- und Amidmerkmale zu und beurteilt Anwendungsbehauptungen sowie historische Gebrauchszahlen mit passenden Nennern.',
'The learner researches ASA/ibuprofen/paracetamol with source locations, assigns carboxyl, ester, phenol and amide features and assesses use claims and historical consumption figures with appropriate denominators.',
'Für ein Kombinationspräparat mit anderen Verkaufszeiträumen normiert sie Mengen/Personen, unterscheidet Prozentpunkte von relativer Änderung und widerlegt die automatische Gleichsetzung von mehr Wirkstoffen mit höherer Eignung.',
'For a combination product with different sales periods the learner normalises amounts and populations, distinguishes percentage points from relative change and rejects automatically equating more ingredients with greater suitability.'
],
[
'Die trockene NCO/OH-Reaktion bildet Urethan ohne Kleinmolekülabspaltung. Funktionalität, Äquivalentverhältnis, Umsatz und Wassernebenreaktion bestimmen Ketten-/Netzbildung sowie Prozessgrenzen.',
'The dry NCO/OH reaction forms urethane without eliminating a small molecule. Functionality, equivalent ratio, conversion and the water side reaction determine chain/network formation and process limits.',
'Die lernende Person erklärt Alkohol-O/NCO-C als Nucleophil/Elektrophil, stellt eine valenzrichtige Addition/Protonübertragung und Wiederholungseinheit dar und vergleicht Diol-/Triol-Äquivalente unter Umsatzvorbehalt.',
'The learner explains alcohol O/NCO C as nucleophile/electrophile, represents valence-correct addition/proton transfer and a repeat unit and compares diol/triol equivalents subject to conversion.',
'Im frischen Feuchtefall bilanziert sie CO2 und NCO-Verbrauch des gegebenen Zweischrittpfads, plant passende Trocken-/Feuchtkontrollen und trennt Blasenbeobachtung von Netzqualität und tatsächlich aufgefangener Gasmenge.',
'In the fresh moisture case the learner balances CO2 and NCO consumption for the supplied two-step route, designs matched dry/moist controls and separates bubbles from network quality and actually collected gas.'
],
[
'PLA besitzt ein Milchsäure-Estergerüst; direkte Kondensation und Lactid-Ringöffnung unterscheiden sich in der Wasserbilanz. Eigenschaften und Abbau hängen von Morphologie, Temperatur und Umgebung ab.',
'PLA has a lactic-acid ester backbone; direct condensation and lactide ring opening differ in water balance. Properties and degradation depend on morphology, temperature and environment.',
'Die lernende Person leitet einen endgruppenrichtigen PLA-Abschnitt und das Repetiermotiv ab und verknüpft gegebene Temperatur-/Eigenschaftsdaten mit einem begründeten vorläufigen Einsatzfeld.',
'The learner derives an end-group-correct PLA fragment and repeat motif and connects supplied temperature/property data to a reasoned provisional application.',
'Sie vergleicht amorphes und teilkristallines PLA für eine neue heiße Anwendung und erklärt, weshalb ein industrieller Folien-Kompostnachweis weder jedes Formteil noch Heimkompost oder Gewässer erfasst.',
'The learner compares amorphous and semicrystalline PLA for a fresh hot-service application and explains why an industrial film-composting result covers neither every moulding nor home compost or aquatic environments.'
],
[
'Copolymere enthalten mindestens zwei kovalent verknüpfte Monomerarten; Zusammensetzung, Sequenz und Morphologie beeinflussen das Eigenschaftsprofil. Eine Mischung getrennter Ketten ist kein Copolymer.',
'Copolymers contain at least two covalently linked monomer types; composition, sequence and morphology influence properties. A mixture of separate chains is not a copolymer.',
'Die lernende Person unterscheidet alternierende, statistische, Block- und Pfropfarchitektur von einem Blend und begründet anhand gegebener Daten einen Gehäusekompromiss zwischen Schlagzähigkeit und Steifigkeit.',
'The learner distinguishes alternating, statistical, block and graft architectures from a blend and uses supplied data to justify a housing trade-off between impact resistance and stiffness.',
'Bei gleichem Monomeranteil und geänderter Sequenz erklärt sie die physikalische Stützung einer Blockcopolymer-Manschette und fordert für 100 °C neue Daten, statt einen universellen Vorteil oder kovalente Vernetzung zu behaupten.',
'At equal monomer content but changed sequence the learner explains physical support in a block-copolymer sleeve and requires fresh evidence for 100 °C rather than asserting universal superiority or covalent crosslinking.'
]
]
fields=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
runid=first['reviewerId']
res=out/'results';res.mkdir(exist_ok=True)
records=[]
for i,(src,judgment,chain) in enumerate(zip(inputs,first['records'],chains),1):
 g=src['goal'];assert g['goalId']==judgment['goalId']
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'{runid}.{i:03d}','runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest']}
 r.update({k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
 r.update({'decision':judgment['decision'],'understandingEvidence':dict(zip(fields,chain)),'rationale':judgment['rationaleDe']+' '+judgment['profileRationaleDe'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
 records.append(r)
rf=res/(batch['batchId']+'.records.jsonl');assert not rf.exists();rf.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records))
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
meta={'schemaVersion':1,'reviewerId':runid,'provider':'OpenAI','modelIdentity':'Codex agent based on GPT-6','exactModelDeployment':'unknown_not_exposed','temperature':None,'topP':None,'seed':None,'samplingAvailability':'not exposed to this tool session; null values do not assert default sampling','reviewMethod':'Own complete scientific FIRST before original stock campaign metadata, then exact stock bindings only','blindBeforeScientificFirst':True,'otherRunResultOrRationaleFilesRead':False,'postFirstMetadataDisclosure':'The permitted stock batch embeds historical evidence-profile provenance/reason fields. These were first exposed after the immutable own FIRST seal; no other run result or rationale file was opened.','firstScientificDigest':sha((out/'FIRST.scientific.json').read_bytes()),'firstScientificPath':str((out/'FIRST.scientific.json').relative_to(root)),'stockCampaignDirectory':str(base.relative_to(root)),'status':'ai_candidate','authorityLimits':['No new source-coverage certification','No two-task or two-experiment quota','Current twenty jurisdiction binding only; later live-current parity check required','No A/M/V completion, M7, human approval or human trial']}
mf=out/'generation-parameters.json';mf.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI','model':'Codex agent based on GPT-6; exact deployment unknown/not exposed','modelVersion':'unknown_not_exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':sha(mf.read_bytes()),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':'review_prompt','digest':c['promptFingerprint']},{'role':'review_criteria','digest':c['criteriaFingerprint']},{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':datetime.datetime.fromtimestamp((root/first['inputsManifest']).stat().st_mtime,datetime.timezone.utc).isoformat(),'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':sha(rf.read_bytes()),'toolchainVersion':'codex-native20-jurisdiction-independent-b-v1'}
# Report a truthful lower bound on start: this run existed before its FIRST was sealed;
# filesystem metadata of the FIRST is direct evidence, rather than inventing an exact model-start timestamp.
run['startedAt']=datetime.datetime.fromtimestamp((out/'FIRST.scientific.json').stat().st_mtime,datetime.timezone.utc).isoformat()
uf=res/(batch['batchId']+'.run.json');uf.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
for f in [out/'FIRST.scientific.json',mf,uf]:json.loads(f.read_text())
parsed=[json.loads(x) for x in rf.read_text().splitlines()];assert len(parsed)==20 and len({r['goalId'] for r in parsed})==20
print(json.dumps({'runId':runid,'records':str(rf.relative_to(root)),'run':str(uf.relative_to(root)),'outputDigest':run['outputDigest'],'generationParametersFingerprint':run['generationParametersFingerprint'],'count':len(parsed)},ensure_ascii=False))
