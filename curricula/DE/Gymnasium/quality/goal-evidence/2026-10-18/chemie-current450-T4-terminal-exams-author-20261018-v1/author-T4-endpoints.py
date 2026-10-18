import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = str(OWN.relative_to(ROOT))
inputs = json.loads((OWN / 'INPUT.whole-current-eighteen-goals-and-P.json').read_text())
plan = json.loads((OWN / 'INPUT.exact-T4-plan-and-author-contract.json').read_text())['package']
transport = json.loads((OWN / 'INPUT.whole-selected-operative-materials.exact.json').read_text())['entries']
by_prefix = {r['goal']['id'][:8]: r for r in inputs['records']}
by_id = {r['goal']['id']: r for r in inputs['records']}


def dump(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def object_hash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def material(material_id):
    matches = [x for x in transport if x['wholeMaterial'].get('materialId', x['wholeMaterial'].get('id')) == material_id]
    assert len(matches) == 1, material_id
    return matches[0]


def from_native(prefix):
    record = by_prefix[prefix]
    return [{'caseId': b['id'], 'taskDe': b['taskDemandDe'], 'taskEn': b['taskDemandEn'], 'solutionDe': b['expectedPerformanceDe'], 'solutionEn': b['expectedPerformanceEn'], 'originalWholeBrief': copy.deepcopy(b), 'origin': {'inputPath': REL + '/INPUT.whole-current-eighteen-goals-and-P.json', 'goalId': record['goal']['id'], 'PRecordFile': record['PRecordFile'], 'PLine': record['PLine'], 'briefId': b['id']}} for b in record['wholePRecord']['profile']['applicationCaseBriefs']]


def from_card(material_id):
    entry = material(material_id)
    card = entry['wholeMaterial']
    return [{'caseId': material_id, 'taskDe': card['givens']['de'] + '\n\n' + card['learnerTask']['de'], 'taskEn': card['givens']['en'] + '\n\n' + card['learnerTask']['en'], 'solutionDe': card['modelSolution']['de'], 'solutionEn': card['modelSolution']['en'], 'origin': {'sourceFile': entry['sourceFile'], 'jsonPointer': entry['jsonPointer'], 'wholeObjectSHA256': entry['wholeObjectSHA256']}}, {'caseId': material_id + '-fresh', 'taskDe': card['freshTransfer']['task']['de'], 'taskEn': card['freshTransfer']['task']['en'], 'solutionDe': card['freshTransfer']['expected']['de'], 'solutionEn': card['freshTransfer']['expected']['en'], 'origin': {'sourceFile': entry['sourceFile'], 'jsonPointer': entry['jsonPointer'] + '/freshTransfer'}}]


def named_whole_case(case_id):
    entry = material(case_id)
    c = entry['wholeMaterial']
    return {'caseId': case_id, 'taskDe': c.get('materialDe', c.get('materialsDe', '')) + '\n\n' + c.get('taskDemandDe', c.get('taskDe', '')), 'taskEn': c.get('materialEn', c.get('materialsEn', '')) + '\n\n' + c.get('taskDemandEn', c.get('taskEn', '')), 'solutionDe': c.get('modelAnswerDe', c.get('workedReasoningDe', c.get('expectedPerformanceDe', ''))), 'solutionEn': c.get('modelAnswerEn', c.get('workedReasoningEn', c.get('expectedPerformanceEn', ''))), 'origin': {'sourceFile': entry['sourceFile'], 'jsonPointer': entry['jsonPointer'], 'wholeObjectSHA256': entry['wholeObjectSHA256']}}


# Each row below is a concrete scientific scoring claim, not a rule-based vote.
# Every criterion is essential; equivalent correct reasoning and sensible rounding count.
specs = {
 '87d8cc68': {
  'cases': from_card('hb-colour-energy-only-current87d8'),
  'criteria': [
   ('levels', ['e1'], 'Lokalisierter bandbezogener Chromophor, zwei passende Niveaus und aufwärts gerichtete Absorptionspfeile; 350/500nm entsprechen ungefähr3,54/2,48eV mit Einheit.', 'Locate the band-specific chromophore; correct levels and upward absorption arrows;350/500nm give about3.54/2.48eV with units.'),
   ('coupling', ['e2','hb-chromophore-explicit-use'], 'Gegebene kleinere Lücke des gekoppelten Systems und größerer Abstand bei protoniertem Donor begründet; Einzelbande von tatsächlicher Gesamtfarbe getrennt.', 'Explain the supplied smaller coupled-system gap and larger protonated-donor gap; distinguish a single band from full perceived colour.'),
   ('fresh', ['e1','e2','hb-chromophore-explicit-use'], 'Neuen sp3-Kopplungsbruch begründet auf lokale statt gemeinsame Delokalisierung übertragen;330nm alsUV erkannt, keine sichere genaue Farbe oder universelle Gruppenregel.', 'Independently explain the fresh sp3 coupling break and local versus joint delocalisation;330nm isUV, with no exact perceived-colour or universal-group inference.')],
  'levels':['AB2']},
 'c8f51eac': {'cases':from_native('c8f51eac'), 'criteria':[
  ('white',['e1'],'430–480nm-Reflexion erklärt Blau unter Weißlicht; absorbierte Anteile werden nicht als zum Auge reflektiert dargestellt.','Explain blue under white light through430–480nm reflection, without treating absorbed light as reflected to the eye.'),
  ('lamp',['e2'],'Unter590nm-Licht nahezu dunkel: keine angebotenen blauen Photonen und fast vollständige Absorption.','At590nm nearly dark: no incident blue photons and almost complete absorption.'),
  ('mixture',['e1'],'A mit5/5/80% undB mit5/40/80% getrennt begründet; gleicher Rotanteil ist keine gleiche reflektierte Mischung.','Explain A5/5/80% versusB5/40/80%; equal red reflection is not equal reflected mixture.'),
  ('green',['e2'],'B reflektiert bei550nm40% statt5%, wirkt unter gleicher Grünbeleuchtung heller; drei Bänder erlauben keine exakte Farbkoordinate.','At550nm B reflects40% instead of5% and is brighter under equal green illumination; three bands determine no exact colour coordinate.')], 'levels':['AB2']},
 'f0ba30a8': {'cases':from_native('f0ba30a8'), 'criteria':[
  ('maximum',['e1'],'Beide tabellierten Maxima500nm;0,90→0,45 betrifft Intensität, nicht Lage; Raster begrenzt exaktes Maximum.','Both grid maxima500nm;0.90→0.45 changes intensity, not position; sampling limits exact maximum.'),
  ('dilution',['e2'],'Bei gleichemε,l halbiert halbesc die Absorbanz; keine belegte molekulare Lückenänderung.','At fixedε,l, halvingc halves absorbance; no molecular-gap change is established.'),
  ('additivity',['e1'],'Alle drei Summen0,8+0=0,8;0,1+0,1=0,2;0+0,7=0,7 geprüft;450nmX/650nmY zugeordnet.','Check all sums0.8+0=0.8;0.1+0.1=0.2;0+0.7=0.7; assign450nmX/650nmY.'),
  ('selectivity',['e2'],'450/650nm als jeweils selektivere Modellstellen begründet; drei Punkte liefern keine eindeutige Stoffidentifikation.','Justify450/650nm as more selective model points; three readings provide no unique substance identification.')], 'levels':['AB2']},
 '64b03eff': {'cases':from_card('hb-colour-three-terms'), 'criteria':[
  ('roles',['e1','hb-auxochrome-antiauxochrome-explicit-use'],'Chromophor am gekoppeltenπ-System, Amin alsDonor/Auxochrom undNitro alsAkzeptor/Antiauxochrom in der angegebenen historischen Konvention erklärt; keine disjunkten universellen Stoffklassen.','Explain the coupledπ chromophore, amine donor/auxochrome and nitro acceptor/antiauxochrome within the supplied historical convention, without universal disjoint classes.'),
  ('protonation',['e1','e2'],'3,54/2,48eV für350/500nm und aufwärts gerichtete Pfeile; Protonierung bindet das freie Paar und erklärt hier500→410nm mit größerer Lücke; keine sichere Gesamtfarbe.','Give3.54/2.48eV for350/500nm and upward arrows; protonation binds the pair, explaining500→410nm with a larger gap here; no exact full colour.'),
  ('interruption',['e2','hb-auxochrome-antiauxochrome-explicit-use'],'Frischen sp3-Brückenfall selbstständig begründet: Fernkopplung unterbrochen, lokale Chromophore möglich,330nmUV; Gruppenbezeichnungen allein sichern keine gemeinsame sichtbare Bande.','Independently explain the fresh sp3 bridge: joint coupling interrupted, local chromophores possible,330nmUV; group names alone guarantee no joint visible band.')], 'levels':['AB2']},
 '34da1a4c': {'cases':from_native('34da1a4c'), 'criteria':[
  ('forms',['e1'],'HIn/In− echte protonenverschiedene Teilchenformen statt mesomere Grenzformeln; Konjugation vonIn− erklärt560nm-Bande.','HIn/In− are distinct protonation states, not resonance contributors; In− conjugation explains the560nm band.'),
  ('ph',['e2'],'Verhältnisse0,1 beipH6 und10 beipH8, richtige Dominanz und gradueller Übergang.','Ratios0.1 atpH6 and10 atpH8, correct dominant forms and gradual transition.'),
  ('redox',['e1'],'B+ +H+ +2e−→BH ladungsbilanziert; unterbrochene Delokalisierung erklärt Entfärbung, verbleibendes blaues Licht die oxidierte Erscheinung.','B+ +H+ +2e−→BH balances charge; interrupted delocalisation explains decolouring and remaining blue light the oxidised appearance.'),
  ('oxygen',['e2'],'Sauerstoff alsElektronenakzeptor ermöglicht Rückoxidation; Redoxsignal ohne definierteKalibrierung kein eindeutigerpH.','Oxygen as electron acceptor permits reoxidation; a redox signal without controlled calibration gives no uniquepH.')], 'levels':['AB2']},
 '53db04a0': {'cases':from_native('53db04a0'), 'criteria':[
  ('condense',['e2'],'Carbonylprotonierung, ersterπ-Angriff mitC=O-Paarverschiebung und Rearomatisierung,OH-Protonierung/Wasserabgang, zweiterRingangriff und erneuteRearomatisierung korrekt.','Correct carbonyl protonation, firstπ attack/C=O electron shift and rearomatisation, OH protonation/water loss, second arene attack and rearomatisation.'),
  ('oxidise',['e2'],'PhCHO+2ArH→PhCH(Ar)2+H2O und Leuko→Kation+H+ +2e− stimmen stofflich/ladungsmäßig; Oxidation vom Bindungsaufbau unterschieden.','PhCHO+2ArH→PhCH(Ar)2+H2O and leuco→cation+H+ +2e− conserve matter/charge; oxidation is distinguished from bond construction.'),
  ('fresh-route',['e2'],'Übertragung aufR=p-Methylphenyl einschließlich beiderRingangriffe, Kondensation und Oxidation mit ladungsrichtigem Zentral-C.','Transfer toR=p-methylphenyl includes both attacks, condensation and oxidation with correct central-carbon valence/charge.'),
  ('missing-aryl',['e2'],'X mitOH und nurzweiArylresten ist nichtLeuko; Oxidationshalbreaktion fügt keinenAr-Rest ein. FehlendeWasserabspaltung/zweiteC–C-Verknüpfung vorOxidation begründet.','X withOH and onlytwo aryl groups is not leuco; the oxidation half-equation adds noAr. Justify remaining water loss/secondC–C bond before oxidation.')], 'levels':['AB3']},
 '981242bb': {'cases':from_native('981242bb'), 'criteria':[
  ('diazotise',['e1'],'Amin-N-Paar greiftNO+ an; gegebeneN-N-Zwischenstufen, Protonenumlagerung,OH-Protonierung undWasserabgang bisDiazonium richtig geordnet.','AmineN pair attacksNO+; correctly order suppliedN-N intermediates, proton transfer, OH protonation and water loss to diazonium.'),
  ('balance',['e1'],'ArNH2+HNO2+H+→ArN2+ +2H2O erhält2N/2O/4H außerhalbAr undLadung+1; gleicherErhalt beimgeändertenAr.','ArNH2+HNO2+H+→ArN2+ +2H2O conserves2N/2O/4H outsideAr andcharge+1, including the changedAr.'),
  ('couple',['e1'],'BeimPhenolfall Ringπ→terminalesN, N≡N-Paar→inneresN, positiverσ-Komplex und C–H-Paar zurRearomatisierung; Kupplungsbilanz+1 korrekt.','For phenol show ringπ→terminalN, N≡N pair→innerN, positiveσ complex and C–H pair restoring aromaticity; coupling charge+1 is conserved.'),
  ('fresh-couple',['e1'],'NeuenNitroaryl/Dimethylanilinfall mitvollständigerN=N-Kupplung undRearomatisierung übertragen; protonierterAmindonor verliert verfügbares+M-Paar, keineZusatzpflicht dirigierenderEffekte.','Transfer completeN=N coupling/rearomatisation to nitroaryl/dimethylaniline; protonated amine loses its available+M pair, with no extra directing-effect duty.')], 'levels':['AB3']},
 'b208b1a5': {'cases':from_native('b208b1a5'), 'criteria':[
  ('ionic',['e1'],'AnionischeD-Gruppen undWoll-NH3+ ziehen sich an, H-Brücken aufbeidenFasern möglich; keinekovalenteFixierung imerstenFall.','AnionicD and woolNH3+ attract; H bonding is possible on both fibres; no covalent fixation in the first case.'),
  ('selection',['e2'],'Wolle unterdengegebenensaurenBedingungen bevorzugt, ohneWaschbeständigkeitsgarantie; pH/Wasser/Konkurrenz/Größe alsGrenze begründet.','Prefer wool under supplied acidic conditions without guaranteed wash fastness; justify a limit such aspH/water/competition/size.'),
  ('reactive',['e1'],'NeueCell–O–C-Bindung mitCl−-Abgang gegenüberintermolekularerEinlagerung desDispersionsfarbstoffs imPolyester unterschieden.','Distinguish newCell–O–C bonding withCl− leaving from intermolecular disperse-dye uptake in polyester.'),
  ('limits',['e2'],'IonischerstarkwasserlöslicherD ohneReaktivgruppe fürdiesenPolyester ungünstig; kovalenteFixierung verhindertnichtPhoto-/Faserabbau oderChemieänderung.','Ionic highly water-soluble dye without a reactive group is unfavourable for this polyester; covalent fixation prevents neither photodegradation/fibre damage nor chemical change.')], 'levels':['AB3']},
 'd815960a': {'cases':[named_whole_case('BW-B1'),named_whole_case('BW-B2')], 'criteria':[
  ('temporal1',['connected-three-perspectives'],'BW-B1 verbindet historischeSyntheseentwicklung, heutigeRedox/Löslichkeitsnutzung undbegründeteZukunftsfrage; keinbloßesDatum.','BW-B1 links historical synthesis development, current redox/solubility use and a justified future question, not just a date.'),
  ('chem1',['chemical-design-and-application-evidence'],'LöslicheLeukoaufnahme/Luftoxidation erklärt, keinekovalenteIndigo-Cellulosebindung; Analyseidentität vonProzessprüfung getrennt.','Explain soluble leuco uptake/air oxidation, with no covalent indigo–cellulose claim; distinguish identity analysis from process testing.'),
  ('tradeoff1',['conditional-comparison-and-limit'],'U/V Wasser100/70,Reduktionsmittel4/0,Energie10/20 undRetention0,95/0,80 alsZielkonflikt gedeutet; Gesamtaufwand/Skalierung fehlen.','InterpretU/V water100/70,reductant4/0,energy10/20 and retention0.95/0.80 as trade-offs; total inputs/scale-up are absent.'),
  ('future1',['future-question-from-current-gap'],'Konkreten kontrolliertenV-Test ausoffenerLeistung/Gesamtaufwand ableiten; gleichesIndigo belegtkeinegleicheNachhaltigkeit.','Derive a controlledV test from open performance/total-input questions; identical indigo establishes no equal sustainability.'),
  ('temporal2',['connected-three-perspectives'],'HistorischenIndustriewandel mitheutigemAzo-Projekt verbinden, ohneIndigo alsAzofarbstoff zuetikettieren.','Connect historical industrial change with the current azo project without calling indigo an azo dye.'),
  ('chem2',['chemical-design-and-application-evidence'],'Azo-Grundkörper,Ankergruppe,Spektren undWaschtest unterscheiden;500/505nm und90/60% tragentatsächlichverschiedeneInformation.','Distinguish azo core, anchor, spectra and washing tests;500/505nm and90/60% provide different information.'),
  ('limit2',['conditional-comparison-and-limit'],'VorhergesagteähnlicheAbsorption undgeplanteAbbaubarkeitC beweisen wedergleicheEignung nochharmloseProdukte.','Similar predicted absorption and planned degradability forC establish neither equal suitability nor harmless products.'),
  ('future2',['future-question-from-current-gap'],'PrüfbareC-Frage zuIdentität/realerLeistung/Waschbeständigkeit/Abbauprodukten mitoffenenDaten begründen.','Justify a testableC question about identity/actual performance/wash behaviour/degradation products and missing data.')], 'levels':['AB2','AB3']},
 '61da9d34': {'cases':from_native('61da9d34'), 'criteria':[
  ('research1',['e1'],'Tatsächlicher eigenerEFSA-Food-colours-Abruf mitURL,Abschnitt,Abrufdatum undkorrektemNutzen-/Prüfbefund; bloßerbeigefügterText odererfundenesAbrufdatum reichen nicht.','Actual ownEFSA Food-colours lookup withURL,section,date and correct benefit/assessment finding; a supplied passage or invented date is insufficient.'),
  ('oral',['e2'],'F/T imgleichenoralenGetränkekontext vergleichen, fehlendespassendesT-Dossier undoffeneIdentitäts-/Dosis-/Verwendungsdaten begründen; keinePauschalsicherheit.','CompareF/T for the same oral beverage use; explain missing matchedT dossier and identity/dose/use information; no blanket safety claim.'),
  ('research2',['e1'],'EigeneAbrufe beiderEFSA-Seiten undHerkunfts-/Stoffprüfbefund mitLocatoren; ÜbertragungsgrenzeOral→Haut erklärt.','Own lookups of bothEFSA pages, origin/substance-assessment findings with locators; explain the oral→skin transfer limit.'),
  ('skin',['e2'],'KeineNatur/Synthese-Gesundheitsrangfolge; N benötigtIdentität/Verunreinigungen, S hautbezogeneFreisetzungs-/Prüfdaten; gleicheFarbechtheit ersetztkeineToxikologie.','No health ranking from natural/synthetic origin; N needs identity/impurities andS skin-release/assessment data; equal fastness replaces no toxicology.')], 'levels':['AB3']},
 '223e33a4': {'cases':from_card('hb200-plant-oil-routes'), 'criteria':[
  ('routes',['hb200-plant-oil-production-generations'],'Pressen/Filtern trenntvorhandeneTriglyceride; Umesterung bildetFAME/Glycerin, GärungEthanol/CO2; alle3Rohstoff-/Stoffklassen-/Kernprozesse korrektunterschieden.','Pressing/filtering separates triglycerides; transesterification formsFAME/glycerol and fermentation ethanol/CO2; correctly distinguish allthree feedstocks/classes/processes.'),
  ('balance',['hb200-plant-oil-production-generations'],'30+70=100kg Saatbilanz, keineÖlrückgewinnungsquote ohneSaatölgehalt; gegebeneGenerationskonvention richtigangewandt, keineNachhaltigkeitsrangfolge ausGeneration.','30+70=100kg seed balance, no oil recovery fraction without seed oil content; apply the supplied generation convention without a sustainability ranking.'),
  ('fresh',['hb200-plant-oil-production-generations'],'Restholz/Synthesegas alsGen2/BTL stattFAME undgefiltertesRapsöl alsPflanzenöl stattBiodiesel erkannt; beideNeutralitätsclaims mitLCA-/Zeitgrenzen begründetverworfen.','Identify waste-wood/syngas as generation2/BTL rather thanFAME and filtered rapeseed oil as plant oil rather than biodiesel; reject both neutrality claims usingLCA/time limits.')], 'levels':['AB2']},
 'abfa609d': {'cases':from_card('hb201-btl-fischer-tropsch'), 'criteria':[
  ('chain',['hb-btl-fischer-tropsch'],'Vergasung,Reinigung/Verhältniseinstellung,FT undGemischaufarbeitung samtFunktion erklärt; keinreinerrealerOctanstrom fingiert.','Explain gasification, cleanup/ratio setting,FT and mixture upgrading with their functions; invent no pure actual octane stream.'),
  ('octane',['hb-btl-fischer-tropsch'],'8CO+17H2→C8H18+8H2O korrektbilanziert;20CO/44H2: CO limitiert,2,5molOctan/20molWasser/1,5molH2Rest.','Balance8CO+17H2→C8H18+8H2O; for20CO/44H2,CO limits, giving2.5mol octane/20mol water/1.5molH2 left.'),
  ('scope',['hb-btl-fischer-tropsch'],'BTL vonTriglyceridöl/FAME undGen1 getrennt; erneuerbar/Gen2 liefertkeineautomatischeCO2-Neutralität.','DistinguishBTL from triglyceride oil/FAME and generation1; renewable/generation2 is not automatically carbon-neutral.'),
  ('fresh',['hb-btl-fischer-tropsch'],'KohlefallCTL stattBTL;20CO/34H2: H2 limitiert,2molOctan/16molWasser/4molCORest; FT ändertnichtfossilenRohstoff oderbelegtLCA.','Coal givesCTL, notBTL;20CO/34H2:H2 limits, giving2mol octane/16mol water/4molCO left;FT neither changes fossil feedstock nor provesLCA.')], 'levels':['AB2']},
 '31cce65a': {'cases':from_card('hb199-greenhouse-energy-climate'), 'criteria':[
  ('mechanism',['hb-greenhouse-energy-balance'],'KurzwelligeEin-/Reflexion undlangwelligeAbsorption/Emission mitGegenstrahlung korrektgezeichnet/erklärt; natürlich/anthropogen getrennt, keineIR-Spiegelung oderEnergieerzeugung.','Correctly draw/explain shortwave input/reflection and longwave absorption/emission including downward emission; distinguish natural/human additions, with noIR-mirror or energy-creation claim.'),
  ('budget',['hb-greenhouse-energy-balance'],'ZustandI 100−30−70=0 undII 100−30−68=+2 alsanfänglicheSpeicherung gedeutet; wärmereAbstrahlung alsAnpassung, keinexakterTemperaturwert.','InterpretI100−30−70=0 andII100−30−68=+2 as initial storage; warmer emission is an adjustment, not an exact temperature prediction.'),
  ('judgment',['hb-greenhouse-energy-balance'],'Fossilzufluss→CO2-Bestand→IR-Bilanz→Klimafolgen erklärt; Minderung mitWirksamkeit/Zeit/Umsetzbarkeit/Verteilung bedingtbeurteilt, keinEinzelwetterbeweis.','Explain fossil input→CO2 stock→IR balance→climate effects; condition mitigation on effectiveness/timing/feasibility/distribution, without attributing one weather event.'),
  ('fresh',['hb-greenhouse-energy-balance'],'NeuerAlbedofall100−33−68=−1; CO2-IR-Wirkung undGesamtbilanz unterschieden, Trägheit/Rückkopplung/lokaleWirkung begrenzt stattuniversellerSoforterwärmung.','New albedo case100−33−68=−1; distinguishCO2IR effect from total balance and bound inertia/feedback/local response rather than universal instant warming.')], 'levels':['AB2','AB3']},
 'ebfa2c18': {'cases':[named_whole_case('energy20-20-a'),named_whole_case('energy20-20-b')], 'criteria':[
  ('reaction',['e1'],'BilanzierteNeutralisation vonAusbeute undProzessrand unterschieden; keineReaktionsatomökonomie fürsMischen.','Distinguish balanced neutralisation, actual yield and process boundary; no reaction atom economy for mixing.'),
  ('metricsA',['e2'],'Atomökonomie92,5%,Ausbeute81,08%; mitProzesswasserPMI5,222/E4,222,ohne600gProzesswasserPMI1,889/E0,889; Reaktionswasser bleibtAbfall.','Atom economy92.5%,yield81.08%; with process waterPMI5.222/E4.222, without600g process waterPMI1.889/E0.889; reaction water remains waste.'),
  ('identityA',['e3'],'PMI=E+1 nurfürgeschlossene Input=Produkt+Abfall-Grenze begründet; wederEnergie nochToxizität darausbestimmt.','JustifyPMI=E+1 for the closed input=product+waste boundary; neither energy nor toxicity follows.'),
  ('metricsB',['e1','e2'],'FormulierungPMI1,020408/E0,020408 undvorgelagerteMethylesterreaktion222/254=87,40% korrekt; Vergleich zu92,5%nurreineStöchiometrie.','Correct formulationPMI1.020408/E0.020408 and upstream ester reaction222/254=87.40%; comparison with92.5% ranks ideal stoichiometry only.'),
  ('limitsB',['e3'],'GleicheProdukt-/Nutzgrenze erforderlich; Massenkennzahlen sichernwederWaschfunktion nochNachhaltigkeit/Energie/Gefährlichkeit.','Require matched product/service boundaries; mass metrics guarantee neither laundry function nor sustainability/energy/hazard performance.'),
  ('freshA',['e1','e2','e3'],'BeiunveränderterGleichung bleibt92,5%Atomökonomie; halbiertesLösemittelvolumen alleinbestimmtkeinePMI-/E-Halbierung, daDichte,Massenrand,Ausbeute/Produkt-/Abfallmassen neu benötigtwerden.','Unchanged equation retains92.5% atom economy; halved solvent volume alone does not halvePMI/E, requiring density,boundary,yield/product/waste masses.'),
  ('freshB',['e3'],'ReinerWasserverlust ändertKonzentration undpotenziellDosierung/Nutzfunktion; gleicheMasse/PMI=E+1 beweistkeinegleicheLeistung.','Water-only loss changes concentration and potentially dosage/service; equal mass/PMI=E+1 proves no equal performance.')], 'levels':['AB3']},
}

# Classification cards contain actual data absent from the current short P brief.
classification = next(x for x in transport if x['wholeMaterial'].get('goalId','').startswith('d72c'))
cases = []
for c in classification['wholeMaterial']['cases']:
    cases.append({'caseId':c['id'],'taskDe':c['materialDe']+'\n\n'+c['taskDemandDe'],'taskEn':c['materialEn']+'\n\n'+c['taskDemandEn'],'solutionDe':c['modelAnswerDe'],'solutionEn':c['modelAnswerEn'],'origin':{'sourceFile':classification['sourceFile'],'jsonPointer':classification['jsonPointer'],'caseId':c['id']}})
cases += from_card('hb217-origin-and-polyene-classification-only')
specs['d72cbb62'] = {'cases':cases,'levels':['AB2'],'criteria':[
 ('families',['e1'],'Azo–N=N–,Triarylmethan-Cmit3Arylresten undglycosyliertesFlavylium alsAnthocyanin vorgestelltundA/B/C sowieP/Q/R richtigbegründetzugeordnet.','Introduce azo–N=N–,centralCwith3aryl groups for triarylmethane and glycosylated flavylium for anthocyanin; correctly justify A/B/C andP/Q/R assignments.'),
 ('origins',['e2'],'Gelöst/unlöslich imgenanntenMedium undsynthetisch/pflanzlich getrenntzugeordnet; keineWasserlöslichkeit ausStrukturklasse erraten.','Assign dissolved/insoluble application in the specified medium separately from synthetic/plant origin; infer no water solubility from family.'),
 ('uses',['e3'],'Textil-/Tinten-/Beschichtungs-/Indikatorverwendung vonStruktur undFärbemethode getrennt; nichtangegebeneTextilmethoden ausdrücklichoffen.','Separate textile/ink/coating/indicator use from structure and dyeing method; explicitly leave missing textile methods open.'),
 ('changes',['e4'],'IdentischsynthetischesC ändertHerkunft,nichtStruktur; P′ bleibtAzo/synthetisch,aberangegebeneLöslichkeit/Verwendung/Methodeändernsich; keineAzo-/Natur-Gesundheitsregel.','Identical syntheticC changes origin,not structure;P′ remains azo/synthetic while supplied solubility/use/method change; no blanket azo/natural-health rule.'),
 ('polyene',['hb217-origin-polyene-classification-only'],'Rotkohl-Anthocyaningemisch,synthetischerAzo- undβ-Carotin/Polyenfall nachHerkunft/Struktur/Verwendung getrennt; physikalischeExtraktion/Filtration versuschemischeSynthese erklärt.','Separate red-cabbage anthocyanin mixture,synthetic azo andβ-carotene/polyene by origin/structure/use; explain physical extraction/filtration versus synthesis.'),
 ('polyene-fresh',['e4','hb217-origin-polyene-classification-only'],'Identisches synthetischesβ-Carotin behältStrukturklasse; mehrereisolierteC=C erlaubenbreitenPolyenbegriff,aberbelegenkeineQualität/Anwendung/Farbe/Sicherheit/LCA. KeineEnergielückenpflicht.','Identical syntheticβ-carotene retains its family; multiple isolatedC=C allow the broad polyene label but establish no quality/use/colour/safety/LCA. No energy-gap duty.') ]}

history = material('basf-indigo-1897-actual-sources')
hc = named_whole_case('basf-indigo-1897-actual-sources')
fresh = history['wholeMaterial']['freshTransfer']
fresh_de = fresh['taskDe'].replace('Licht-/Waschechtheit', 'Farb- und Lichtechtheit')
fresh_en = fresh['taskEn'].replace('light/wash fastness', 'colourfastness and lightfastness')
fresh_de = fresh_de.replace('(Original-PDF im Quellenledger)', '(Quelle: https://www.basf.com/dam/jcr%3A9fcde8fa-d44c-393c-9cc6-88d97382ea7a/basf/www/global/images/about-us/history/BASF_Chronik_Gesamt_en.pdf, PDF-Blatt15, gedruckteS27)')
fresh_en = fresh_en.replace('(original PDF in the source ledger)', '(source: https://www.basf.com/dam/jcr%3A9fcde8fa-d44c-393c-9cc6-88d97382ea7a/basf/www/global/images/about-us/history/BASF_Chronik_Gesamt_en.pdf, PDFsheet15, printedp27)')
specs['188bd684'] = {'cases':[hc, {'caseId':'basf-indigo-1897-actual-sources-fresh-primary-precision','taskDe':fresh_de,'taskEn':fresh_en,'solutionDe':fresh['expectedPerformanceDe'],'solutionEn':fresh['expectedPerformanceEn'],'origin':{'sourceFile':history['sourceFile'],'jsonPointer':'/freshTransfer','newBoundedPrimaryWordingCorrection':True}}], 'levels':['AB3'], 'criteria':[
 ('mechanism',['e1'],'Forschung,chemischesVerfahren,Kapitalbindung undMarkteinführung anhandH1/H2 sachbezogenverknüpft.','Connect research,chemical process,committed capital and launch usingH1/H2.'),
 ('money',['e1'],'18MioGoldmark alszugeschriebeneBASF-Investition,nichtUmsatz/Gewinn oderheutigeEuro ausgewiesen;17JahreEntwicklungkeineRendite.','Identify18million gold marks as attributedBASF investment,not revenue/profit or current euros;17years of development establishes no return.'),
 ('source',['e2'],'Firmenrückschau undMuseum mitverschiedenerReichweite/Intention geprüft; H2 bestätigtkeineBASF-Geldsumme.','Assess company retrospective and museum for different scope/intent;H2 does not verifyBASF financial amount.'),
 ('judgment',['e2'],'BegründetepositiveIndustriewirkung undgesellschaftliche/wirtschaftlicheGrenze; Rentabilitäts-/Wohlfahrtsbilanz ohnezusätzlicheKosten/Erlösdaten offen.','Give a reasoned industrial contribution and social/economic limit; leave profitability/welfare unresolved without added cost/revenue data.'),
 ('fresh',['e1','e2'],'H3 neueFarb-/Lichtechtheit undinnerbetrieblicheKonkurrenz begrenzenDauermarktbehauptung; InvestitionbleibtnichtGewinn, FirmenquellekeinunabhängigerMarktbeweis.','UseH3 colour/lightfastness and in-house competition to limit permanent-market claims; investment remains distinct from profit and company history is no independent market proof.') ]}

# Explicitly ask and solve the current native fresh axes omitted from the short main briefs.
gc_source = [material('energy20-20-a')['wholeMaterial'],material('energy20-20-b')['wholeMaterial']]
for case, original in zip(specs['ebfa2c18']['cases'],gc_source):
    case['taskDe'] += '\n\nFrischer Transfer: ' + original['freshIndependentTransferDe']
    case['taskEn'] += '\n\nFresh transfer: ' + original['freshIndependentTransferEn']
specs['ebfa2c18']['cases'][0]['solutionDe'] += '\nTransfer: Die Atomökonomie bleibt92,5%,weil die Reaktionsgleichung unverändert bleibt. Halbiertes Lösemittelvolumen bestimmt ohne Dichte und neue tatsächlich abgegrenzte Input-, Produkt-/Abfallmassen keinen neuen PMI/E-Faktor. Auch bei gleicher Lösemittelart und daher halber Lösemittelmasse folgt keine Halbierung der gesamten Kennzahlen.'
specs['ebfa2c18']['cases'][0]['solutionEn'] += '\nTransfer: Atom economy remains92.5% because the equation is unchanged. Halving solvent volume determines no newPMI/E without density and newly bounded actual input/product/waste masses. Even for identical solvent and hence half its mass, total metrics do not halve.'
specs['ebfa2c18']['cases'][1]['solutionDe'] += '\nTransfer: Nur Wasserverlust erhöht bei sonst gleichem Ansatz den Massenanteil wirksamer Komponenten. Bei0,2kg reinem Wasserverlust bleiben8kg Tensid/Builder in9,8kg Produkt, also etwa81,63% statt80%. Gleiche Produktmasse kann deshalb eine andere Dosierung/Nutzfunktion haben; PMI=E+1 ist lediglich die gewählte Massenidentität.'
specs['ebfa2c18']['cases'][1]['solutionEn'] += '\nTransfer: Water-only loss increases the mass fraction of functional components. Losing0.2kg of water retains8kg surfactant/builder in9.8kg product, about81.63% rather than80%. Equal product mass can therefore change dosage/service;PMI=E+1 is only the selected mass identity.'

holds = {
 '63e0d92b': 'No actual bound complete vat/direct-dye school SOP body has yet been found: named formulations/concentrations, handling volumes and equipment, rinse/waste conditions and direct-dye specification are absent from both whole original cases. Local human clearance itself is not a machine-QS prerequisite. Preserve both genuine supervised-execution duties and blank records; author a concrete sourced SOP successor before this endpoint can be proposed ready.',
 'd742ecb0': 'No concrete bound surfactant/CMC/soil SOP body is supplied: A/B chemical identities/concentrations, instrument/measurement protocol, hardness levels, model-soil identity and quantitative matrix controls/calibration are unspecified. A future local clearance is not the machine blocker. Preserve actual planning, three actual measurement channels and fresh hardness repeat; add the missing operational design rather than substituting paper data.'
}

ordinary_goals = []
new_goals = []
authored_materials = []
rows = []
cluster_ops = {}
phase_parent = {'Q1':'4beeb141-2a59-5093-b599-e513403221b0','Q4':'b5f0201a-bc5b-5159-a36c-0925f198c32f','GLOBAL':'5964272f-e835-5a24-b2b1-c162be6b75cb'}
for family in plan['families']:
    for variant in family['boundedEndpointVariants']:
        assert len(variant['targetGoalIds']) == 1
        gid = variant['targetGoalIds'][0]
        record = by_id[gid]
        goal = record['goal']
        prefix = gid[:8]
        endpoint_id = variant['proposedNewEndpointId']
        parent = '5964272f-e835-5a24-b2b1-c162be6b75cb'
        base_row = {'familyId':family['familyId'],'ordinaryGoalId':gid,'newEndpointId':endpoint_id,'wholeOrdinaryGoalSHA256':object_hash(goal),'wholeCurrentProfileSHA256':object_hash(record['wholePRecord']['profile']),'PConfig':record['PConfig'],'PRecordFile':record['PRecordFile'],'PLine':record['PLine'],'proposedCanonicalParentId':parent,'actualExistingTargetViews':variant['currentTargetViews'],'officialSourceCredit':0,'newOrdinaryGoalCount':0,'authorNotIndependentReviewer':True}
        if prefix in holds:
            rows.append({**base_row,'authorDisposition':'HOLD_MISSING_CONCRETE_OPERATIONAL_MATERIAL','reason':holds[prefix],'newGoalObjectProposed':False})
            continue
        spec = specs[prefix]
        expectations = record['wholePRecord']['profile']['coverageExpectations']['requiredExpectationIds']
        covered = {e for row in spec['criteria'] for e in row[1]}
        assert set(expectations) <= covered, prefix
        criteria = []
        for key, expectation_ids, de, en in spec['criteria']:
            criteria.append({'id':prefix+'-'+key,'points':2,'expectationIds':expectation_ids,'fullCreditDe':de,'fullCreditEn':en,'partialCreditDe':'1 Punkt: fachlich richtiger wesentlicher Teil mit einer inhaltlichen Lücke;2 Punkte: alle genannten wissenschaftlichen Kernaussagen begründet erfüllt. Sinngleiche richtige Darstellungen und passende Rundung zählen.','partialCreditEn':'1 point: a correct substantial part with a content gap;2 points: all named scientific core claims are explained. Scientifically equivalent presentations and sensible rounding count.','zeroCreditDe':'0 Punkte: wesentliche Aussage fehlt oder widerspricht den Angaben; bloße Modellantwortkopie ist kein unabhängiger Nachweis.','zeroCreditEn':'0 points: essential claim missing or contradicted by givens; copying the model answer is not independent evidence.','essential':True})
        cases = spec['cases']
        material_record = {'endpointId':endpoint_id,'ordinaryGoalId':gid,'authorOnly':True,'status':'draft','licenseForOwnContent':'CC-BY-4.0','completeCases':cases,'rubric':criteria,'passingRule':'All essential criteria require full2point scientific credit; total max=passing. Equivalent correct reasoning counts; no exact-wording requirement. This designed assessment is not actual performance or mastery of its ordinary prerequisite.','maxPoints':2*len(criteria),'passingPoints':2*len(criteria),'wholeCurrentPInput':{'path':REL+'/INPUT.whole-current-eighteen-goals-and-P.json','goalId':gid,'profileSHA256':object_hash(record['wholePRecord']['profile'])},'blankLearnerRecord':{'responses':None,'actualSourcesRead':None,'freshTransferResponse':None,'earnedCriterionPoints':None},'actualLearnerPerformance':False,'humanApproval':False}
        authored_materials.append(material_record)
        header_de = 'Bearbeite die folgenden bereitgestellten Fälle selbstständig. Begründe deine Antworten aus den konkreten Angaben; vorgegebene Modellwerte sind keine eigenen Messungen. Eine reale Herstellung oder Durchführung wird hier nicht verlangt. Lösungen und Bewertung bleiben bis zur vollständigen Abgabe verdeckt.'
        header_en = 'Independently solve the supplied cases below. Justify answers using their actual givens; supplied model values are not personal measurements. No actual manufacture or laboratory execution is required here. Withhold solutions and grading until the complete submission.'
        if prefix == '61da9d34':
            header_de += ' Die ausdrücklich verlangten eigenen Quellenabrufe und Locatoraufzeichnungen bleiben echte bewertete Rechercheleistungen; beigefügte Angaben ersetzen sie nicht.'
            header_en += ' The explicitly demanded own source lookups and locator records remain assessed research actions; supplied information does not replace them.'
        tasks_de = header_de + '\n\n' + '\n\n'.join(f'Fall {i+1}\n{c["taskDe"]}' for i,c in enumerate(cases))
        tasks_en = header_en + '\n\n' + '\n\n'.join(f'Case {i+1}\n{c["taskEn"]}' for i,c in enumerate(cases))
        solutions_de = '\n\n'.join(f'Fall {i+1}\n{c["solutionDe"]}' for i,c in enumerate(cases))
        solutions_en = '\n\n'.join(f'Case {i+1}\n{c["solutionEn"]}' for i,c in enumerate(cases))
        dims = copy.deepcopy(goal['dimensionTags'])
        dims.update({'framework':'canonical-gymnasium-chemistry','demandLevel':spec['levels'][-1],'area':'Übungen: '+goal.get('dimensionTags',{}).get('area','Chemie'),'topicCode':'CANONICAL.CHEMISTRY.T4.LOCAL_ASSESSMENT.'+prefix.upper()})
        courses = [c for c in ['GK','LK'] if c in goal['tags']]
        scoring_steps = [{'id':c['id'],'points':c['points'],'description':'DE: '+c['fullCreditDe']+'\n'+c['partialCreditDe']+'\n'+c['zeroCreditDe']+'\nEN: '+c['fullCreditEn']+'\n'+c['partialCreditEn']+'\n'+c['zeroCreditEn']} for c in criteria]
        new_goal = {'id':endpoint_id,'shortKey':'canonical_chemistry_t4_local_assessment_'+prefix,'title':'Übung: '+goal['title'],'titleEn':'Practice: '+goal['titleEn'],'description':'Die lernende Person kann die vollständig bereitgestellten Aufgaben zu „'+goal['title']+'“ selbstständig bearbeiten, die erforderlichen Begründungen und den geänderten Fall darstellen und die Aussagegrenzen des Materials beachten.','descriptionEn':'The learner can independently solve the complete supplied tasks on “'+goal['titleEn']+'”, explain the required reasoning and changed case, and respect the material’s inference limits.','type':'atomic','nodeKind':'exam','weight':1,'contains':[],'requires':[gid],'tags':['SekII',*courses,'Practice','Assessment'],'applicability':copy.deepcopy(goal['applicability']),'dimensionTags':dims,'examples':[],'resourceLinks':[],'extendedData':{'applicabilityMappingInheritance':'boundary','applicabilityFromRequires':True,'assessmentGate':'Author-only draft. Independent current content/interface review and later explicit machine release remain pending. No human or actual learner approval.','authorProvenance':{'packagePath':REL,'sourceMaterialPath':REL+'/AUTHOR.complete-assessment-materials.pending.json','sourceInputPath':REL+'/INPUT.whole-current-eighteen-goals-and-P.json','ordinaryGoalId':gid,'ownMaterialLicense':'CC-BY-4.0'},'scopeBoundary':'Eligibility is own-assessment all-of requires support, not official source coverage. The exact existing ordinary target views bound countries/courses/stages and optional/own-acquisition topics; no new official duty or learner topic selection is inferred.','designedActualResearchRequired':prefix=='61da9d34'},'examData':{'reviewStatus':'draft','reviewNote':'Author-only concrete assessment design; all essential2point criteria must be fulfilled. Two independent content/interface decisions and actual integration are pending. No new ordinary D/P/A/M/V vote or learner performance is claimed.','coveredGoalIds':[gid],'coveredStrands':goal['dimensionTags'].get('guidingIdeas',[]) or ['STOFF_PROZESS_STRUKTUR'],'demandLevels':spec['levels'],'sourceArtifactPath':REL+'/AUTHOR.complete-assessment-materials.pending.json','taskContent':tasks_de,'taskContentEn':tasks_en,'solutionContent':solutions_de,'solutionContentEn':solutions_en,'scoring':{'maxPoints':2*len(criteria),'passingPoints':2*len(criteria),'steps':scoring_steps}}}
        new_goals.append(new_goal)
        cluster_ops.setdefault(parent,[]).append(endpoint_id)
        rows.append({**base_row,'authorDisposition':'AUTHOR_READY_FOR_TWO_INDEPENDENT_REVIEWS_NOT_RELEASED','newGoalObjectProposed':True,'selectedCaseIds':[c['caseId'] for c in cases],'allRequiredPExpectationIds':expectations,'actualScoringExpectationUnion':sorted(covered),'scoringPoints':[2*len(criteria),2*len(criteria)],'newGoalObjectSHA256':object_hash(new_goal),'newMaterialObjectSHA256':object_hash(material_record)})

canonical = json.loads((ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())
current_by_id = {g['id']:g for g in canonical['goals']}
for r in inputs['records']:
    assert r['goal'] == current_by_id[r['goal']['id']], r['goal']['id']
for g in new_goals:
    assert g['id'] not in current_by_id
contains = []
for parent_id, additions in cluster_ops.items():
    before = current_by_id[parent_id]
    contains.append({'parentId':parent_id,'beforeWholeParent':before,'beforeWholeParentSHA256':object_hash(before),'operation':'append_exact_reviewed_new_practice_children_after_existing_children','append':additions,'retainEveryOtherParentFieldExact':True,'phaseRationale':'Existing neutral SekII autonomy practice anchor596 groups these narrow source/profile-dependent tasks. Each task retains its actual Q4/GLOBAL dimension phase and only its existing ordinary target views receive explicit source/phase-local practice references. This avoids treating the energy/sustainability-specific Q4 practice cluster as an all-dye folder or adding unintended national/HE endpoints. No broad course admission or final-exam branch is created.'})
dump('AUTHOR.complete-assessment-materials.pending.json',{'artifactRole':'AUTHOR_ONLY_NOT_REVIEW_OR_RELEASE','packageId':'T4','assessments':authored_materials,'normalWrites':0,'newOrdinaryScientificFirstCompletions':0,'humanApproval':False,'learnerPerformance':False})
dump('AUTHOR.sixteen-whole-new-exam-goals.pending.json',{'artifactRole':'AUTHOR_ONLY_NOT_REVIEW_OR_RELEASE','goals':new_goals,'requiresAreGenuineOneGoalPreparatoryCompetences':True,'ordinaryGoalChanges':0,'normalWrites':0})
dump('AUTHOR.sparse-phase-practice-contains-appends.pending.json',{'operations':contains,'normalWrites':0,'noClusterRequiresChange':True})
dump('AUTHOR.eighteen-endpoint-dispositions-and-exact-input-CAS.json',{'packageId':'T4','records':rows,'readyForReview':len(new_goals),'holds':len(holds),'holdsAreMissingOperationalBodiesNotMissingLocalHumanApproval':True,'newOrdinaryScientificCompletions':0,'normalWrites':0})
print(json.dumps({'newExamDrafts':len(new_goals),'operationalMaterialHolds':len(holds),'phaseParentCount':len(contains),'normalWrites':0}))
