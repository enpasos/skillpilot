#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Author one bounded inactive Kp/Kc successor with actual finite worked cases."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
DAY = OUT.parent
GOAL_ID = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
SOURCE_ID = 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-009-dc7fb7b0'
GAS_ID = '580b3616-f121-5d82-ac6b-fc24f145fbdc'
NOW = datetime.now(timezone.utc).isoformat()

def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    path = OUT / name
    if path.exists():
        raise FileExistsError(path)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return bind(path)

prior_path = DAY / 'chemie-b008-kp-kc-actual-MV-primary-author-root-v1/one-whole-KpKc-goal-actual-MV-clause-and-original-gas-partner.author-candidate.json'
prior = json.loads(prior_path.read_text())
inputs = [prior_path, *[ROOT / x['path'] for x in prior['actualInputs']]]
for expected in prior['actualInputs']:
    assert bind(ROOT / expected['path']) == expected
source_path = next(p for p in inputs if p.name.endswith('.source-extraction.json'))
mapping_path = next(p for p in inputs if p.name.endswith('to_canonical_chemistry.review.json'))
canonical_path = next(p for p in inputs if p.name == 'canonical504-current26-resource-links.inactive.json')
source_before = json.loads(source_path.read_text())
mapping_before = json.loads(mapping_path.read_text())
canonical_before = json.loads(canonical_path.read_text())
source = copy.deepcopy(source_before)
mapping = copy.deepcopy(mapping_before)
canonical = copy.deepcopy(canonical_before)
goal = next(x for x in canonical['goals'] if x['id'] == GOAL_ID)
goal['description'] = 'Die lernende Person kann den Zusammenhang zwischen Kp und Kc aus der Zustandsgleichung idealer Gase herleiten, beide Konstanten mit passenden Einheiten umrechnen und die Gültigkeitsgrenzen des Modells begründen.'
goal['descriptionEn'] = 'The learner can derive the relationship between Kp and Kc from the ideal-gas equation, convert between the constants using consistent units, and justify the validity limits of the model.'
goal['applicability']['jurisdiction'].append('DE-MV')
source_goal = next(x for x in source['sourceGoals'] if x['id'] == SOURCE_ID)
old_span = source_goal['sourceSpan']
new_span = old_span.rsplit('S. ', 1)[0] + 'S. 23'
source_goal['sourceSpan'] = new_span
source_goal['sourceRef'] = source_goal['sourceRef'].rsplit('S. ', 1)[0] + 'S. 23'
# Raw extraction and the whole mixed-page passage remain unchanged as history.
assert source_goal['rawSourceSpan'] == old_span
source_binding = write('MV-one-clause-current-printed23.inactive-source-extraction.json', source)
decision = copy.deepcopy(prior['proposedCurrentDecision'])
decision['sourceSpan'] = new_span
decision['reviewedAt'] = NOW
decision['reviewer'] = '/root author candidate; two independent targeted successor reviews pending'
decision['rationale'] = ('Tatsächlich gelesener LK-Zusatzsatz in Hinweise und Anregungen, physischePDF27/gedruckte23. '
    'Dieser inaktive Nachfolger operationalisiert Herleitung aus p_i=c_iRT, Umrechnung bei gleicher Temperatur '
    'und passenden Einheiten sowie Gasstöchiometrie, Standardzustände und Idealitätsgrenzen in zwei ganzen '
    'bilingualen Fällen mit neuen Transferbedingungen. Partielle Route nur zu diesem Kp/Kc-Ziel; keine '
    'Freigabe des gesamten MWG-/Gasgleichgewichts-Passus. Die alte exakte Gasnachweis-Kante ist fachlich '
    'unbegründet; Gasnachweisziel und seine12 anderen originalen Quellkanten bleiben erhalten, deren '
    'fachliche Gültigkeit hier nicht neu geprüft oder behauptet wird. MV gilt ausschließlichLK/SekII; '
    'die vorhandene HE-Q3-Dimension wird nicht als MV-Halbjahresbezeichnung interpretiert. '
    'Unabhängige aktuelle Source/D/P/A/M/V-Prüfungen und normale Gesamtatlas-Prüfung bleiben offen.')
mapping['decisions'][60] = decision
mapping['mappings'][268] = copy.deepcopy(prior['proposedCurrentEdge'])
mapping['sourceExtractionPath'] = source_binding['path']
mapping['status'] = 'candidate'
mapping_binding = write('MV-one-clause-partial-KpKc.inactive-mapping.review.json', mapping)
canonical_binding = write('canonical504-one-KpKc-derived-MV-LK.inactive.json', canonical)
assert all(a == b for a, b in zip(source_before['passages'], source['passages']))
assert sum(a != b for a, b in zip(source_before['sourceGoals'], source['sourceGoals'])) == 1
assert sum(a != b for a, b in zip(mapping_before['decisions'], mapping['decisions'])) == 1
assert sum(a != b for a, b in zip(mapping_before['mappings'], mapping['mappings'])) == 1
assert sum(a != b for a, b in zip(canonical_before['goals'], canonical['goals'])) == 1
gas_before = next(x for x in canonical_before['goals'] if x['id'] == GAS_ID)
assert gas_before == next(x for x in canonical['goals'] if x['id'] == GAS_ID)

derivation_de = (
    'Für jede gasförmige Speziesi gilt im vorgegebenen idealen Modell p_iV=n_iRT, also p_i=c_iRT. '
    'Setze das in das stöchiometrische Produkt Kp=∏p_i^ν_i ein: '
    'Kp=∏(c_iRT)^ν_i=(∏c_i^ν_i)(RT)^(Σν_i)=Kc(RT)^Δn_g. '
    'ν_i ist für Produkte positiv, für Edukte negativ; Δn_g zählt nur die gasförmigen Spezies. '
    'Diese schulischen unnormierten Konstanten besitzen für Δn_g≠0 Einheiten. '
    'Dimensionslose Formen verwenden p_i/p° und c_i/c°: Kp*=Kc*(RTc°/p°)^Δn_g. '
    'Die Normierung darf nicht stillschweigend mit der unnormierten Definition vermischt werden. '
    'Gleiche Reaktionsrichtung, Gleichgewichtstemperatur inKelvin und zusammenpassende R-/Druck-/Volumen-/Konzentrationseinheiten sind nötig. '
    'Reine feste oder flüssige Phasen haben im idealisierten Standardmodell Aktivität1 und werden nicht inΔn_g gezählt. '
    'Bei nichtidealen Gasen sind Fugazitäten statt idealer Partialdrücke erforderlich. '
    'Die Umrechnung bei einem gegebenenT sagt nicht allein, wie die Gleichgewichtskonstante bei neuemT ist.'
)
derivation_en = (
    'For each gaseous speciesi in the supplied ideal model, p_iV=n_iRT gives p_i=c_iRT. '
    'Insert this into the stoichiometric product Kp=∏p_i^ν_i: '
    'Kp=∏(c_iRT)^ν_i=(∏c_i^ν_i)(RT)^(Σν_i)=Kc(RT)^Δn_g. '
    'Product exponents are positive and reactant exponents negative; Δn_g counts gaseous species only. '
    'These school-level unnormalised constants have units whenΔn_g≠0. '
    'Dimensionless definitions use p_i/p° and c_i/c°: Kp*=Kc*(RTc°/p°)^Δn_g. '
    'Do not silently mix normalised and unnormalised definitions. '
    'Reaction direction, equilibrium temperature inKelvin and consistent R/pressure/volume/concentration units must agree. '
    'Pure solids/liquids have activity1 in this idealised standard model and do not contribute toΔn_g. '
    'Nonideal gases require fugacities instead of ideal partial pressures. '
    'A conversion at one givenT alone does not determine the equilibrium constant at anotherT.'
)
case1 = {
    'id': 'ideal-dimer-derivation-and-unit-transfer',
    'materialDe': 'Konstruiertes Rechenmodell, keine Messung und keine Laboranleitung: N2O4(g)⇌2NO2(g), T=300K, R=0,08314L·bar·mol⁻¹·K⁻¹. Unnormiertes Kc=[NO2]²/[N2O4]=0,050mol·L⁻¹. Gleichgewichtsdrücke werden inbar angegeben; beide Gase werden ideal behandelt. Für eine separate dimensionslose Darstellung sind c°=1mol·L⁻¹ und p°=1bar gegeben.',
    'materialEn': 'Constructed calculation model, not a measurement or laboratory protocol: N2O4(g)⇌2NO2(g), T=300K, R=0.08314L·bar·mol⁻¹·K⁻¹. Unnormalised Kc=[NO2]²/[N2O4]=0.050mol·L⁻¹. Equilibrium pressures usebar and both gases are ideal. For a separate dimensionless representation, c°=1mol·L⁻¹ and p°=1bar.',
    'taskDe': 'Leite die Beziehung aus p_iV=n_iRT her, statt nur eine Formel einzusetzen. Begründe den Exponenten und berechne Kp samt Einheit. Stelle daneben die dimensionslose Beziehung mit den gegebenen Standardzuständen auf. Prüfe dann ein Blatt, das stattdessenR=8,314Pa·m³·mol⁻¹·K⁻¹, aber weiter0,050mol·L⁻¹ einsetzt und das Ergebnis alsbar beschriftet.',
    'taskEn': 'Derive the relation from p_iV=n_iRT rather than just quoting a formula. Justify the exponent and calculate Kp with units. Separately write the dimensionless relation using the supplied standard states. Evaluate a worksheet usingR=8.314Pa·m³·mol⁻¹·K⁻¹ with0.050mol·L⁻¹ unchanged and then labelling its resultbar.',
    'workedAnswerDe': derivation_de + ' HierΔn_g=2−1=1 undRT=24,942L·bar·mol⁻¹. Kp=0,050×24,942=1,2471bar. Für die Standardzustände istKc*=0,050 undRTc°/p°=24,942, alsoKp*=1,2471 ohne Einheit. Mit SI-R muss0,050mol·L⁻¹=50mol·m⁻³ verwendet werden:50×8,314×300=124710Pa=1,2471bar. Die ungeänderte L-Konzentration bewirkt einen Faktor1000; außerdem istPa nichtbar. Kelvin und die konsistente Definitionsform sind fachlich nötig, nicht bloße Schreibkonvention.',
    'workedAnswerEn': derivation_en + ' HereΔn_g=2−1=1 andRT=24.942L·bar·mol⁻¹. Kp=0.050×24.942=1.2471bar. With the standard statesKc*=0.050 andRTc°/p°=24.942, soKp*=1.2471 dimensionless. SI-R requires0.050mol·L⁻¹=50mol·m⁻³:50×8.314×300=124710Pa=1.2471bar. Keeping the L concentration creates a factor1000 error;Pa also is notbar. Kelvin and consistent definitions are substantive requirements.',
    'freshVariationDe': 'Neue Bedingung: Schreibe die umgekehrte Reaktion2NO2(g)⇌N2O4(g) bei demselben300K. Leite die neuen Konzentrations- und Druckprodukte mit ihren Einheiten her. Ein zweites Blatt benutzt27°C statt300K; ist seine Umrechnung zulässig?',
    'freshVariationEn': 'Fresh condition: reverse the reaction to2NO2(g)⇌N2O4(g) at the same300K. Derive the new concentration/pressure products and units. Another sheet uses27°C instead of300K in the formula; is that conversion valid?',
    'freshWorkedAnswerDe': 'Kc,rev=1/0,050=20L·mol⁻¹, Δn_g,rev=1−2=−1. Kp,rev=20/24,942=0,801860316bar⁻¹=1/(1,2471bar). Die reziproken Definitionen und negativen Exponenten erklären die Umkehrung, nicht bloß eine neue Zahlenregel.27°C ist näherungsweise300K, aber die Gasgleichung braucht absolute Temperatur; die Zahl27 einzusetzen ist falsch.',
    'freshWorkedAnswerEn': 'Kc,rev=1/0.050=20L·mol⁻¹ andΔn_g,rev=1−2=−1. Kp,rev=20/24.942=0.801860316bar⁻¹=1/(1.2471bar). Reciprocal definitions and negative exponents explain reversal.27°C is approximately300K, but the gas equation requires absolute temperature; inserting27 is wrong.',
}
case2 = {
    'id': 'zero-gas-difference-new-stoichiometry-and-model-limits',
    'materialDe': 'Zweites konstruiertes Gleichgewichtsmodell: CO(g)+H2O(g)⇌CO2(g)+H2(g), T=600K. Gegeben sindc(CO)=0,001, c(H2O)=0,002, c(CO2)=0,001 undc(H2)=0,0024mol·L⁻¹. R=0,08314L·bar·mol⁻¹·K⁻¹, alle Speziesgasförmig/ideal. Das Modell liefert Gleichgewichtsdaten, keine reale Apparatur oder gemessene Ausbeute.',
    'materialEn': 'Second constructed equilibrium model: CO(g)+H2O(g)⇌CO2(g)+H2(g) at600K. Suppliedc(CO)=0.001, c(H2O)=0.002, c(CO2)=0.001 andc(H2)=0.0024mol·L⁻¹. R=0.08314L·bar·mol⁻¹·K⁻¹; all species are gaseous/ideal. These are supplied equilibrium-model data, not an apparatus or measured yield.',
    'taskDe': 'Leite aus den vier idealen Partialdrücken die Druckproduktbeziehung her, berechne Kc und Kp und erkläre das Wegfallen desRT-Faktors. Beurteile die Behauptungen „Kp=Kc, daher temperaturunabhängig“ und „bei beliebig hohem Druck gilt immer diese ideale Umrechnung“.',
    'taskEn': 'Derive the pressure product from the four ideal partial pressures, calculateKc/Kp and explain why theRT factor cancels. Evaluate “Kp=Kc therefore temperature-independent” and “the ideal conversion always holds at arbitrarily high pressure”.',
    'workedAnswerDe': derivation_de + ' Kc=(0,001×0,0024)/(0,001×0,002)=1,2. Δn_g=(1+1)−(1+1)=0. Setzt man allep_i=c_iRT inKp=p(CO2)p(H2)/(p(CO)p(H2O)) ein, kürzen sich zweiRT im Zähler gegen zweiRT im Nenner:Kp=1,2. Hier sind auch die unnormierten Verhältnisse dimensionslos. Die ideale Summe der Partialdrücke ist(0,0064mol·L⁻¹)×(49,884L·bar·mol⁻¹)=0,3192576bar. Gleiche Werte an diesem600K belegen keine Temperaturunabhängigkeit; die Gleichgewichtslage selbst kann sich bei anderemT ändern. HoherDruck kann die Idealitätsannahme verletzen; Fugazitäten und zusätzliche thermodynamische Daten sind nötig.',
    'workedAnswerEn': derivation_en + ' Kc=(0.001×0.0024)/(0.001×0.002)=1.2. Δn_g=(1+1)−(1+1)=0. Insertingp_i=c_iRT intoKp=p(CO2)p(H2)/(p(CO)p(H2O)) cancels twoRT factors in numerator/denominator:Kp=1.2. These unnormalised ratios also are dimensionless. Ideal total pressure=(0.0064mol·L⁻¹)×(49.884L·bar·mol⁻¹)=0.3192576bar. Equality at600K establishes no temperature independence; the equilibrium constant itself can change withT. High pressure can invalidate ideality; fugacities and additional thermodynamic information are then required.',
    'freshVariationDe': 'Neue Reaktion1: N2(g)+3H2(g)⇌2NH3(g) bei500K, gegebenKc=0,400L²·mol⁻². Neue Reaktion2: C(s)+2H2(g)⇌CH4(g) bei demselben500K, reinerFeststoff mitAktivität1 und gegebenKc=c(CH4)/c(H2)²=0,200L·mol⁻¹. Leite jeweilsΔn_g undKp samtEinheit her. Ein Blatt zählt den Feststoff alsGas und erhält fürReaktion2 denExponenten−2; prüfe es.',
    'freshVariationEn': 'Fresh reaction1: N2(g)+3H2(g)⇌2NH3(g) at500K withKc=0.400L²·mol⁻². Fresh reaction2: C(s)+2H2(g)⇌CH4(g) at the same500K, pure solid activity1, suppliedKc=c(CH4)/c(H2)²=0.200L·mol⁻¹. DeriveΔn_g andKp with units for each. A sheet counts the solid asgas and uses−2 for reaction2; evaluate it.',
    'freshWorkedAnswerDe': 'RT=41,57L·bar·mol⁻¹. Reaktion1:Δn_g=2−(1+3)=−2, Kp=0,400/(41,57)²=0,00023147279bar⁻². Reaktion2:Δn_g=1−2=−1, dennC(s) ist keinGas. Kp=0,200/41,57=0,0048111619bar⁻¹. ReinerFeststoff hat hierAktivität1 und gehört weder ins Konzentrationsprodukt noch inΔn_g. Für beide gelten vorgegebeneT/Idealität/Einheiten; ohne neue Gleichgewichtsdaten darf keinWert bei einer anderenTemperatur behauptet werden.',
    'freshWorkedAnswerEn': 'RT=41.57L·bar·mol⁻¹. Reaction1:Δn_g=2−(1+3)=−2 andKp=0.400/(41.57)²=0.00023147279bar⁻². Reaction2:Δn_g=1−2=−1 becauseC(s) is notgas. Kp=0.200/41.57=0.0048111619bar⁻¹. The pure solid has activity1 and contributes neither to the concentration product nor toΔn_g. Both conversions require suppliedT/ideality/consistent units; no new-temperature constant is established.',
}

# Separate ordinary words and symbols without altering chemical expressions.
replacements = {'Speziesi': 'Spezies i', 'inKelvin': 'in Kelvin', 'gegebenenT': 'gegebenen T', 'neuemT': 'neuem T', 'whenΔn': 'when Δn', 'toΔn': 'to Δn', 'inKp': 'in Kp', 'auchR': 'auch R', 'stattR': 'statt R', 'alsGas': 'als Gas', 'alsgas': 'as gas', 'at600K': 'at 600K', 'spec ies': 'species', 'keinGas': 'kein Gas', 'notgas': 'not gas', 'reinerFeststoff': 'reiner Feststoff', 'anderemT': 'anderem T', 'andΔn': 'and Δn', 'mitAktivität': 'mit Aktivität', 'hierAktivität': 'hier Aktivität', 'gegebenKc': 'gegeben Kc', 'gegebenen Standardzustände': 'gegebenen Standardzustände'}
for case in [case1, case2]:
    for key, value in case.items():
        if key == 'id':
            continue
        for old, new in replacements.items():
            value = value.replace(old, new)
        case[key] = value

profile = {
    'archetype': 'modeling',
    'expectations': [
        {'id': 'ideal-partial-pressure-derivation', 'essentialUnderstandingDe': 'Der Zusammenhang folgt aus jedem idealen Partialdruck und den stöchiometrischen Exponenten des gleichen Gleichgewichts.', 'essentialUnderstandingEn': 'The relationship follows from each ideal partial pressure and the stoichiometric exponents of the same equilibrium.', 'observablePerformanceDe': 'Leitet p_i=c_iRT und Kp=Kc(RT)^Δn_g nachvollziehbar her und erklärt, warum nur Gase zu Δn_g beitragen.', 'observablePerformanceEn': 'Derives p_i=c_iRT and Kp=Kc(RT)^Δn_g explicitly and explains why only gases contribute to Δn_g.'},
        {'id': 'consistent-units-and-standard-states', 'essentialUnderstandingDe': 'Umrechnung setzt identische Reaktion und Temperatur sowie konsistente Einheiten/Definitionsformen voraus.', 'essentialUnderstandingEn': 'Conversion requires the same reaction and temperature plus consistent units/definitions.', 'observablePerformanceDe': 'Berechnet und kontrolliert Konstanten für positive, null und negative Δn_g; unterscheidet dimensionalen Schulansatz und dimensionslose Standardzustände und korrigiert eine echte Einheiten-/Richtungsabweichung.', 'observablePerformanceEn': 'Calculates/checks constants for positive, zero and negative Δn_g; distinguishes dimensional school definitions from dimensionless standard states and corrects a concrete unit/direction change.'},
        {'id': 'limits-and-independent-transfer', 'essentialUnderstandingDe': 'Idealität, reine Phasen und Temperaturbindung begrenzen die Schlussfolgerung; gleiche Zahlen an einem T sind keine universelle Aussage.', 'essentialUnderstandingEn': 'Ideality, pure phases and temperature binding limit inference; equal numbers at one T are not universal.', 'observablePerformanceDe': 'Begründet Grenzen bei Nichtidealität/Temperaturänderung, lässt einen reinen Feststoff korrekt aus und überträgt die Herleitung auf eine neue Gasstöchiometrie.', 'observablePerformanceEn': 'Justifies nonideality/temperature limits, correctly excludes a pure solid and transfers the derivation to new gas stoichiometry.'},
    ],
    'coverageExpectations': {'requiredExpectationIds': ['ideal-partial-pressure-derivation', 'consistent-units-and-standard-states', 'limits-and-independent-transfer'], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 1, 'freshVariationRequired': True, 'independentTransferRequired': True},
    'variationAxes': [
        {'id': 'gas-stoichiometry', 'textDe': 'Positive, null und negative Differenz gasförmiger Koeffizienten, umgekehrte Reaktion, ausgeschlossener Feststoff.', 'textEn': 'Positive/zero/negative gaseous coefficient differences, reversed reaction and an excluded solid.'},
        {'id': 'unit-definition', 'textDe': 'bar/L versus Pa/m³; dimensionale gegenüber standardzustandsnormierten Definitionen.', 'textEn': 'bar/L versus Pa/m³; dimensional versus standard-state-normalised definitions.'},
        {'id': 'model-domain', 'textDe': 'Absolute Temperatur, gleiche Gleichgewichtsbedingungen und Grenze zur Nichtidealität.', 'textEn': 'Absolute temperature, identical equilibrium conditions and the nonideality boundary.'},
    ],
    'applicationCaseBriefs': [
        {'id': case1['id'], 'taskDemandDe': case1['materialDe'] + ' ' + case1['taskDe'] + ' ' + case1['freshVariationDe'], 'taskDemandEn': case1['materialEn'] + ' ' + case1['taskEn'] + ' ' + case1['freshVariationEn'], 'expectedPerformanceDe': 'Vollständige Partialdruck-Herleitung; Δn_g=1, 1,2471bar; dimensionslose Standardzustände getrennt; SI-Konzentration50mol·m⁻³, 124710Pa; inverse Reaktion mitΔn_g=−1 und reziproken Einheiten. Neue Temperatur-/Einheitsbedingung selbst begründet.', 'expectedPerformanceEn': 'Complete partial-pressure derivation; Δn_g=1, 1.2471bar; dimensionless standard states separate; SI concentration50mol·m⁻³, 124710Pa; reversed reaction withΔn_g=−1 and reciprocal units. New temperature/unit conditions justified independently.', 'understandingFocusDe': 'Aus Modellannahmen herleiten und Definitionen/Einheiten kontrollieren, statt nur die Formel reproduzieren.', 'understandingFocusEn': 'Derive from assumptions and check definitions/units rather than merely reproduce a formula.'},
        {'id': case2['id'], 'taskDemandDe': case2['materialDe'] + ' ' + case2['taskDe'] + ' ' + case2['freshVariationDe'], 'taskDemandEn': case2['materialEn'] + ' ' + case2['taskEn'] + ' ' + case2['freshVariationEn'], 'expectedPerformanceDe': 'RT kürzt sich beiΔn_g=0; Kc=Kp=1,2 am gegebenen600K, keine Temperaturunabhängigkeit. Neue Koeffizienten−2 beim Ammoniakmodell,−1 beim Feststoff/Gas-Modell; Zahlen, Einheiten, Aktivität1 und Nichtidealitätsgrenzen korrekt begründet.', 'expectedPerformanceEn': 'RT cancels atΔn_g=0; Kc=Kp=1.2 at the supplied600K, with no temperature-independence inference. New coefficients−2 for ammonia and−1 for solid/gas; calculations, units, activity1 and nonideality bounds justified.', 'understandingFocusDe': 'Eine neue stöchiometrische und physikalische Bedingung eigenständig auf das Modell zurückführen.', 'understandingFocusEn': 'Independently connect new stoichiometric and physical conditions to the model.'},
    ],
}
material_binding = write('one-whole-KpKc-two-complete-derived-DEEN-cases.author-candidate.json', {
    'schemaVersion': 1, 'role': 'Actual author candidate whole goal/profile and two finite derived cases; independent current review pending',
    'createdAt': NOW, 'license': 'CC-BY-4.0', 'wholeCurrentGoal': goal, 'wholeProfile': profile,
    'wholeCases': [case1, case2], 'actualLearnerPerformance': False, 'actualExperimentPerformed': False,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False,
})
profile_binding = write('one-derived-positive-profile.author-candidate-set.json', {
    'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': 'chemie-one-MV-KpKc-derived-author-v2', 'reviewedAt': NOW, 'reviewer': '/root author; independent current source/D/P/A/M/V pending',
    'goals': [{'goalId': GOAL_ID, 'profile': profile, 'reason': 'Two complete bilingual finite derivations and independent fresh changes; no actual experiment or learner evidence.', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': []}],
})
checks = write('actual-one-clause-goal-partner-retention-and-numerical-model.author-check.json', {
    'schemaVersion': 1, 'role': 'Actual targeted author checks; not independent fachliche approval',
    'wholeSourceGoalsChanged': 1, 'wholePassagesChanged': 0, 'sourceSpan': new_span,
    'rawOriginalSourceSpanRetained': old_span, 'mappingDecisionsChanged': 1, 'mappingEdgesChanged': 1,
    'whole504GoalsChanged': 1, 'wholeGasPartnerExact': True, 'other503WholeGoalsExact': True,
    'all12OtherOriginalGasEdgesRetainedNotNewlyApproved': prior['allOtherOriginalGasPartnerMappingEdgesUnchanged'],
    'actualNumbers': {'RT300': .08314 * 300, 'Kp300': .05 * .08314 * 300, 'KpReverse300': 1 / (.05 * .08314 * 300), 'KpSI_Pa': 50 * 8.314 * 300, 'Kc600': .001 * .0024 / (.001 * .002), 'Ptotal600_bar': .0064 * .08314 * 600, 'RT500': .08314 * 500, 'KpAmmonia500': .4 / (.08314 * 500) ** 2, 'KpSolidGas500': .2 / (.08314 * 500)},
    'normal395496GuardsChanged': False, 'allOrdinarySourceAtlasApproval': False,
    'semanticAtomicityMemoryAndCurrentImageDecision': 'pending actual targeted independent review',
})
entry = write('neutral-one-derived-MV-LK-KpKc-source-and-material-successor.author-review.entry.json', {
    'schemaVersion': 1, 'role': 'Neutral bounded source/whole-goal/two-case author successor, inactivated', 'createdAt': NOW,
    'predecessorOriginalWholeSourceAndGasPartner': bind(prior_path), 'actualInputs': [bind(x) for x in inputs],
    'currentSourceExtraction': source_binding, 'currentMapping': mapping_binding, 'currentWholeCanonical504': canonical_binding,
    'currentWholeGoalProfileAndCases': material_binding, 'ordinaryPositiveProfileCandidateSet': profile_binding,
    'actualTechnicalAuthorChecks': checks,
    'actualMVProgrammeBinding': {'jurisdiction': 'DE-MV', 'stage': 'SekII', 'courseProfile': 'LK', 'programUnit': 'Qualifikationsphase', 'actualYears': [11, 12], 'sourceCourseBasis': 'Unchanged exact courseLevelLK and stage:SekII/course:LK metadata in the actual sourceGoal; printed23 LK additional block.', 'noInventedMVQ3Phase': True, 'normalCurrentSourceAtlasFacetAndViews': 'pending actual API materialization'},
    'protectedOriginal177GasGoal': {'goalId': GAS_ID, 'wholeGoalAnd12OtherEdgesRetained': True, 'actualAdditionalSourceContextReview': 'pending; not conflated with original8 requires/reverseRequires changes'},
    'originalPrimaryPDFAndHistoricalExtractionMappingReviewsPreserved': True,
    'existingJPGPixelsAndResourceLinkExactKEEP': True, 'independentCurrentImageBinding': 'pending targeted existing-image inspection after goal text change',
    'independentReviews': [], 'semanticAtomicityMemory': 'pending', 'currentNativeDAndP': 'pending',
    'normalSourceAtlas395': 'pending, existing nine programme/API blockers not bypassed',
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
seal = write('one-derived-MV-LK-KpKc.author-FIRST.freeze.json', {
    'schemaVersion': 1, 'role': 'Actual author outputs FIRST; no independent approval', 'createdAt': NOW,
    'inputs': [bind(x) for x in inputs], 'outputs': [source_binding, mapping_binding, canonical_binding, material_binding, profile_binding, checks, entry],
    'knownOriginalIndependentFindings': ['wrong source span22 instead23', 'missing actual derivation cases', 'missing MV-LK target applicability', 'protected original gas source-context change'],
    'authorScientificRoleNotIndependentReviewer': True,
})
print(json.dumps({'entry': entry, 'first': seal, 'actualNumbers': json.loads((ROOT / checks['path']).read_text())['actualNumbers']}, ensure_ascii=False))
