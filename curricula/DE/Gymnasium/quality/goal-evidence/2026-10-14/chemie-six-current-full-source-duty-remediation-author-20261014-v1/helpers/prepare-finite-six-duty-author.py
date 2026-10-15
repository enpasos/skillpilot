#!/usr/bin/env python3
"""Bounded source-duty author proposal. No active writes or scientific votes."""
import copy
import hashlib
import json
import pathlib
import uuid

R = pathlib.Path(__file__).resolve().parents[1]
REPO = next(p for p in R.parents if (p / 'AGENTS.md').exists())
BASE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
RP_OLD = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-author-20261013-v3/candidate/two-full-classification-goals-and-dye-parent-whole-CAS.author.json'
F947_CASES = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-task-demand-complete-final-content-author-20261013-v10/positive/whole-two-cases.complete-explicit-demands.author.json'
E560 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1/candidate/two-whole-children-and-exact-parent-terminal-CAS.author.json'
PLASTIC = 'afad3a68-c643-5c49-8583-e5d8b1d8b56c'
DYE = 'fa21e8e1-b430-54ad-9647-f763bc4137ba'
EQ = '8546715e-b24c-54d9-8872-d75a48c1bdb8'
ORIENT = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
FUNCTIONAL = '7990387d-f254-5d3b-a589-a3e7ed9502a3'
BOND = '448815cc-4127-54b7-96bf-e54b3d2a38c5'
POLYPROFILE = '2652caef-b557-58b9-9b28-70db62625ce5'
RAD = '6eb14e47-187c-5ba1-8b08-a0ee95ad88a9'
COND = '9b942490-ad8f-52ba-8c5a-f8a9792b7db5'
PU = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c'

def write(rel, obj):
    p = R / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return p

def binding(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return {'path': str(p.relative_to(REPO)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def whole_hash(o):
    return 'sha256:' + hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

supplied = json.loads((R / 'inputs/six-whole-source-cells.actual-before.json').read_text())
assert binding(REPO / BASE)['sha256'] == supplied['activeWholeCurrent402Canonical']['rawSHA256']
base = json.loads((REPO / BASE).read_text())
idx = {g['id']: g for g in base['goals']}
assert len(idx) == 523
bindings = []
frozen = {}
def pin(rel):
    if rel in frozen:
        return frozen[rel]
    p = REPO / rel
    dest = R / 'inputs/frozen-regular-originals' / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(p.read_bytes())
    bindings.append({'original': binding(p), 'frozenRegularCopy': binding(dest)})
    frozen[rel] = dest
    return dest

pin(BASE)
rp_body = json.loads(pin(RP_OLD).read_text())['newWholeGoals'][0]
assert rp_body['id'] == 'd72cbb62-0b65-5b9a-aece-70c23d4e618a'
pin(F947_CASES)
pin(E560)
for row in supplied['rows']:
    for x in row['actualInstalledSourceCells']:
        p = pin(x['sourceExtraction']['path'])
        assert binding(p)['sha256'] == x['sourceExtraction']['rawSHA256']
    for x in row['actualInstalledDeferralRecords']:
        p = pin(x['mappingCarrier']['path'])
        assert binding(p)['sha256'] == x['mappingCarrier']['rawSHA256']
write('inputs/finite-whole-input-bindings.actual.json', {'role': 'Exact original regular files frozen before author changes', 'bindings': bindings})

def new(parent, key, title, title_en, desc, desc_en, state, courses, phase, area, requires, source_row):
    gid = str(uuid.uuid5(uuid.UUID(parent), key))
    source = source_row['actualInstalledSourceCells'][0]
    return {
        'id': gid, 'shortKey': key, 'title': title, 'titleEn': title_en,
        'description': desc, 'descriptionEn': desc_en,
        'weight': 1, 'type': 'atomic', 'tags': [*courses, 'canonical', 'SekII'],
        'contains': [], 'requires': requires, 'examples': [], 'resourceLinks': [],
        'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB2',
                          'processCompetencies': ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
                          'guidingIdeas': ['BC_AUFBAU', 'BC_REAKTION'], 'phase': phase,
                          'area': area, 'topicCode': key.upper().replace('_', '.')},
        'applicability': {'jurisdiction': [state]},
        'extendedData': {'applicabilityMappingInheritance': 'boundary', 'provenance': {
            'sourceLandscapeId': source['sourceLandscapeId'],
            'sourceGoalId': source_row['sourceGoalId'],
            'sourceGoalIds': [source_row['sourceGoalId']],
            'authorCandidateOnly': True,
            'sourceDutyAndScopeStatus': 'author_proposal_pending_two_independent_source_reviews_and_selection_semantics'
        }}
    }

sil = new(PLASTIC, 'canonical_chemistry_upper_silicone_oil_resin_rubber_structure_use',
    'Siliconöle, Siliconharze und Siliconkautschuke strukturbezogen erklären',
    'Explain silicone oils, resins and rubbers through structure',
    'Die lernende Person kann an ausgewählten Beispielen die Herstellung und den Bau von Siliconölen, Siliconharzen und Siliconkautschuken beschreiben und ihre Eigenschaften sowie passende Anwendungen aus Kettenstruktur, Funktionalität der Ausgangsstoffe und Vernetzungsgrad erklären.',
    'The learner can describe the manufacture and molecular constitution of selected silicone oils, silicone resins and silicone rubbers, and explain their properties and appropriate applications using chain structure, starting-material functionality and degree of crosslinking.',
    'DE-HB', ['GK','LK'], 'Q2', 'Kunststoffchemie', [POLYPROFILE], supplied['rows'][1])
mechanism = new(PLASTIC, 'canonical_chemistry_upper_polyaddition_urethane_mechanism',
    'Polyaddition am Urethanbildungsmechanismus erklären',
    'Explain polyaddition through the urethane-formation mechanism',
    'Die lernende Person kann den Mechanismus der Polyaddition am Beispiel der Reaktion von Hydroxy- und Isocyanatgruppen auf Teilchenebene erklären, dabei Elektronenpaarverschiebungen und Protonenübertragung bis zur Urethanbindung darstellen und die wiederholte Gruppenreaktion bifunktioneller Ausgangsstoffe zur Kettenbildung ohne Abspaltung eines kleinen Moleküls verknüpfen.',
    'The learner can explain the mechanism of polyaddition at particle level using the reaction of hydroxyl and isocyanate groups, represent electron-pair shifts and proton transfer leading to the urethane linkage, and connect repeated group reactions of bifunctional starting materials to chain formation without elimination of a small molecule.',
    'DE-RP', ['GK','LK'], 'Q2', 'Kunststoffchemie', [FUNCTIONAL, BOND], supplied['rows'][3])
fix = new(EQ, 'canonical_chemistry_upper_silver_bromide_film_fixing_complexation',
    'Filmfixierung durch Silberbromid-Komplexbildung erklären',
    'Explain film fixing through silver-bromide complex formation',
    'Die lernende Person kann das Fixieren eines Schwarz-Weiß-Films auf Stoff- und Teilchenebene erläutern, indem sie das Auflösen des verbliebenen Silberbromids durch Bildung löslicher Silber-Ligand-Komplexe erklärt und es vom verbleibenden metallischen Silberbild sowie von Belichtung und Entwicklung unterscheidet.',
    'The learner can explain the fixing of a black-and-white film at substance and particle levels by accounting for the dissolution of residual silver bromide through soluble silver–ligand complexes and distinguishing it from the remaining metallic-silver image, exposure and development.',
    'DE-SN', ['GK'], 'Q1', 'Gleichgewichte und Komplexbildung', [BOND, ORIENT], supplied['rows'][4])
conditions = new(PLASTIC, 'canonical_chemistry_upper_polymer_reaction_conditions_compare',
    'Reaktionsbedingungen der Kunststoffsynthesen vergleichen',
    'Compare reaction conditions of polymer syntheses',
    'Die lernende Person kann an ausgewählten Beispielen die Reaktionsbedingungen von radikalischer Kettenpolymerisation, Polykondensation und Polyaddition vergleichen und die Unterschiede anhand der jeweiligen Gruppenreaktion sowie geeigneter Angaben zu Initiierung oder Katalyse, Temperatur und erforderlicher Reaktionsführung begründen.',
    'The learner can compare the reaction conditions of radical chain polymerization, polycondensation and polyaddition using selected examples and justify differences through the corresponding group reaction and suitable information about initiation or catalysis, temperature and required reaction control.',
    'DE-TH', ['LK'], 'Q2', 'Kunststoffchemie', [RAD, COND, PU], supplied['rows'][5])
new_goals = [sil, mechanism, fix, conditions]
all_additions = new_goals + [copy.deepcopy(rp_body)]
assert all(g['id'] not in idx for g in all_additions)
candidate = copy.deepcopy(base)
cidx = {g['id']:g for g in candidate['goals']}
parent_additions = {PLASTIC:[sil['id'], mechanism['id'], conditions['id']], EQ:[fix['id']], DYE:[rp_body['id']]}
parent_cas = []
for parent, children in parent_additions.items():
    before = copy.deepcopy(cidx[parent])
    cidx[parent]['contains'] += children
    cidx[parent]['weight'] += len(children)
    parent_cas.append({'expectedBeforeWholeGoal':before,'proposedAfterWholeGoal':copy.deepcopy(cidx[parent]),
                       'allowedChangedFields':['contains','weight'], 'addedChildren':children,
                       'weightBoundary':'Only additive local increments; prior historical weights and ancestor policy are not reinterpreted.'})
candidate['goals'] += all_additions
write('candidate/canonical528.current402-plus-five-duty-atoms.author.inactive.json', candidate)
write('candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json', {
    'role':'Inactive author proposal; no reviewed semantic-kind classifications or independent decisions',
    'baseCanonicalBinding':binding(R/'inputs/frozen-regular-originals'/BASE),
    'idDerivation':{'method':'UUIDv5','namespacePerNewGoal':'its existing visible parent UUID','namePerNewGoal':'its exact shortKey'},
    'newWholeGoals':new_goals,'reusedExactPendingWholeGoals':[rp_body],
    'reusedRPOriginalBinding':binding(R/'inputs/frozen-regular-originals'/RP_OLD),
    'existingWholeGoalCAS':parent_cas,
    'noExistingAtomicBodyOrRequiresChanged':True,
    'noAssessmentTerminalChange':True,
    'terminalBoundary':'Optional modules cannot be appended to the generic global capstone. Local selected terminal assessment is future reviewed work, not silently inferred.',
    'noCompositionViewOrDefaultRegistration':True,
    'noNewD_P_A_M_VAuthorityRows':True,
    'semanticKindProposals':[{'goalId':g['id'],'proposedKind':'curricularAtomic','decisionStatus':'proposal_not_independent_review'} for g in all_additions],
    'protectedSubjectsUnchanged':['Mathematik','Physik','Biologie'],
    'actualStrictClosureNetGain':0,'activeWrites':False
})

specs = [
    (supplied['rows'][0], [POLYPROFILE], False,
     'Whole literal duty describes monomer-to-macromolecule formation. The existing complete 2652 goal includes this linking explanation; no mechanism triad is inferred from this general clause.',
     '2652 also assesses structure-dependent properties and uses. This source is a bounded formation component, not a claim that the single HB19 clause alone entails the whole broader target. HB19 neighbouring bullets remain separate unchanged sources.'),
    (supplied['rows'][1], [sil['id']], True,
     'Whole silicone duty preserves manufacture, constitution, properties and applications of all THREE oil/resin/rubber families. Existing e560 and pending a96/641 are not a full resin/application witness; nano is not invented from this clause.',
     'Vertiefungen below the compulsory table, with no exclusive LK marking: optional selected deepening for GK/LK, not a mandatory two-course grant. Actual selected option is unresolved.'),
    (supplied['rows'][2], [rp_body['id']], True,
     'The exact existing pending d72 classification atom introduces azo AND at least TWO further classes. No synthesis mechanism is required for these other classes. This covers the selected whole class-breadth duty without recreating the prior candidate.',
     'RP6.2 Leistungsfach Additum is elective/WP dependent. This source supports the OTHER-class breadth component; source #1 supplies the distinct introduction/classification operationalization, and #2 separately supplies azo synthesis mechanism. Neither neighbouring cell is deleted or newly cleared.'),
    (supplied['rows'][3], [mechanism['id']], True,
     'Whole duty explicitly says mechanism. f947 has urethane equation/repeat/groups/water side route but no obligatory elementary electron-pair/proton-transfer demonstration. The new bounded atom adds that missing coherent mechanism, not extra generic resin families.',
     'Vertiefungs-/Verzahnungsmöglichkeiten spans course columns. Optional selected polyaddition mechanism can belong to GK or LK; actual selection unresolved. No widening of existing LK-only f947.'),
    (supplied['rows'][4], [fix['id']], True,
     'Whole cell requires knowledge of film fixing via AgBr dissolution by complex formation. New target explains soluble Ag complexes and preserves Ag0 image; EDTA titration, silver nanoparticle packaging and generic ion detection are not substitutes.',
     'Wahlbereich1 is optional GK11. Its neighbouring actual experiment clause remains an independent practical duty, not inferred from this paper explanation. Choice unresolved; no LK grant.'),
    (supplied['rows'][5], [conditions['id']], False,
     'Whole right-column condition-comparison operator refers to the THREE preceding polymer routes, not a rate experiment or lab execution. A comparison goal is added, using given example-specific conditions; no universal temperature or moisture rule is asserted.',
     'TH eA/right-column-only entitlement maps technically to LK. It does not grant TH GK; neighbouring monomer/polymer-structure comparisons remain separate unchanged cells.')
]
source_cas = []
duty_plans = []
for row, targets, optional, content, scope in specs:
    exact_cells = copy.deepcopy(row['actualInstalledSourceCells'])
    items = []
    for rec in row['actualInstalledDeferralRecords']:
        carrier = json.loads(pin(rec['mappingCarrier']['path']).read_text())
        current = [d for d in carrier['decisions'] if d['sourceGoalId']==row['sourceGoalId']]
        assert len(current)==1 and current[0]==rec['wholeDecision']
        links = [m for m in carrier['mappings'] if m.get('reviewDecisionId')==row['sourceGoalId'] or m.get('legacyGoalId')==row['sourceGoalId']]
        assert not links
        conditional = copy.deepcopy(current[0])
        conditional.update(decision='mapped', canonicalGoalIds=targets, matchType='partial',
            rationale='AUTHOR PROPOSAL ONLY; not independent science approval. '+content+' '+scope,
            reviewer='Codex bounded source-duty author; independent reviews and operative scope checks pending')
        edges = [{'legacyGoalId':row['sourceGoalId'],'canonicalGoalId':gid,'matchType':'partial','reviewDecisionId':row['sourceGoalId']} for gid in targets]
        items.append({'mappingCarrierOriginalBinding':rec['mappingCarrier'],
                      'mappingCarrierFrozenBinding':binding(pin(rec['mappingCarrier']['path'])),
                      'expectedBeforeWholeDecision':copy.deepcopy(current[0]),
                      'expectedBeforeAllMappingsForSourceCell':links,
                      'operativeAfterWholeDecision':copy.deepcopy(current[0]),
                      'operativeAfterAllMappingsForSourceCell':links,
                      'NONOPERATIVEConditionalAfterWholeDecision':conditional,
                      'NONOPERATIVEConditionalAfterAllMappingsForSourceCell':edges,
                      'applyCondition':'Two fresh whole-source reviews plus scope/prerequisite checks'+(' and an actual explicit selected-program condition representable without unconditional default projection.' if optional else '.'),
                      'originalWholeSourceDutyMustRemain':True,
                      'allOtherWholeDecisionsAndMappingsMustBeByteContentExact':True})
    source_cas.append({'sourceGoalId':row['sourceGoalId'],'exactWholeInstalledSourceCells':exact_cells,'wholeCarrierCAS':items})
    duty_plans.append({'sourceGoalId':row['sourceGoalId'],'proposedWholeDutyComponents':targets,
                       'wholeSourceContentAuthorStatus':'candidate_full_literal_duty_retained_pending_independent_reviews',
                       'scopeStatus':'HOLD_actual_optional_choice_unresolved' if optional else 'HOLD_two_fresh_source_reviews_and_bounded_scope_check',
                       'optional':optional,'fullDutyRationale':content,'scopeAndNeighbourBoundary':scope,
                       'newAutomaticSourceCoverage':False,'currentOperativeCellUnchanged':True})
write('candidate/six-full-source-cell-and-seven-carrier-CAS.author.json', {'role':'Exact full-duty CAS; nonoperative conditional alternatives are not installed source decisions', 'wholeCells':source_cas,'sourceExtractionChanges':[], 'allSourceLiteralsRawAndNormalMetadataUnchanged':True,'noWholeSourceReviewVotes':True})
write('AUTHOR.six-whole-duty-component-plans-and-scope-holds.json', {'role':'Author judgment only; no positive source science authority', 'sixWholeDutyPlans':duty_plans,
    'courseIssueCount':7,'actualAutomaticCourseGrantCount':0,
    'perNativeSourceTupleAuthorScope':[{'sourceGoalId':r['sourceGoalId'],'courseLevel':r['actualInstalledSourceCells'][0]['wholeSourceCell']['courseLevel'],'operativeStatus':'unchanged_HOLD'} for r in supplied['rows']],
    'potentialNewAtoms':4,'exactReusedPendingAtoms':1,'current402CandidateProposedDenominator':407,
    'pending407CombinedProposedDenominatorIfAllFiveDistinctAdditionsAccepted':412,
    'currentStrictNativeDenominatorUnchanged':402,'actualStrictNetGain':0,
    'noteCountIdentity':'This inactive 407 is current402 + four genuinely new duties + one exact prior pending RP atom. It is not the different already-pending 407 e594/recycling/e560 candidate.',
    'sourceUnionCannotBeClaimedFromConditionalPlans':True,
    'remainingHolds':['Two fresh independent whole-source science reviews for six duties',
        'Four actual optional selected-program conditions: HB silicone, RP6.2 Additum, RP optional polyaddition, SN GK11 photography',
        'Native graph/SEM/D/P/A/M/V and selected terminal assessment for proposed new/reused atoms',
        'Whole goal-specific prerequisites in operative selected composition views; tags do not prove them',
        'Current 25 unsupported goals /58 state tuples are a separate integration diagnosis; no broad edits here'],
    'noTechnicalEngineOrCheckerChange':True,'noHumanApprovalOrTrialClaim':True})

write('AUTHOR.four-whole-goal-scientific-teaching-boundaries.json', {'license':'CC-BY-4.0','authorOnly':True,'entries':[
 {'goalId':sil['id'],'fullDuty':['manufacture','constitution','properties','applications','oils','resins','rubbers'],
  'chemistry':'Hydrolysis/condensation of suitably functional silane precursors can form Si–O–Si skeletons. Mainly difunctional chain-forming units with controlled ends permit oils; multifunctional units yield resin networks; suitably crosslinked flexible siloxane chains produce rubbers. Cure can also use addition routes: not every silicone is made by one universal process.',
  'manufacturePropertyUseExamples':'Use given representative precursor functionality and route. Flowing uncrosslinked oil can suit lubrication; more rigid resin networks can suit coating/binder duties; lightly crosslinked flexible chains can suit seals. Chemical substitution, crosslink density, service conditions and grade-specific data limit each claim.',
  'avoid':'Do not claim silicone oil is never oligomeric, every resin is fully brittle, every rubber is PDMS or every silicone must universally withstand all temperatures. Full oil/resin/rubber coverage cannot be replaced by only PDMS oil versus one elastomer. Nano and cosmetics are not new HB34 literal demands.'},
 {'goalId':mechanism['id'],'fullDuty':['nucleophile/electrophile','electron-pair shifts','proton transfer','urethane product','repeated bifunctional reaction','no eliminated small molecule'],
  'chemistry':'At a suitable schematic level, alcohol O attacks electrophilic C in R–N=C=O, with redistribution of pi electrons and proton transfer to N leading to R–NH–C(=O)–O–Rprime. A charge-balanced zwitterionic addition representation followed by a justified proton-transfer route is acceptable; catalysts/solvent and transfer partners may change microscopic steps.',
  'avoid':'The product equation alone is not a mechanism. Do not invent water elimination from the dry urethane step, identify polyaddition with radical chain growth, or present a free uncatalysed intramolecular proton jump as the unique universal microscopic route. Do not infer completed kinetics from a correct arrow scheme.'},
 {'goalId':fix['id'],'fullDuty':['residual AgBr','ligand binding to Ag(I)','soluble complex removal','Ag(0) image distinction','fixing versus exposure/development'],
  'chemistry':'A suitable supplied fixing example is AgBr(s)+2 S2O3^2−(aq) -> [Ag(S2O3)2]^3−(aq)+Br−(aq). Complexation binds dissolved Ag(I) and favours further AgBr dissolution. This is not reduction of all silver species and does not itself form the metallic image; fixing removes undeveloped light-sensitive halide under appropriate bath conditions.',
  'avoid':'No EDTA water-hardness titration, silver nanoparticle packaging, claim of destroying the whole Ag(0) image, prescribed learner experiment, or universal insolubility/oxidation claim. Neighbouring experimental fixing work remains a separate actual practical duty.'},
 {'goalId':conditions['id'],'fullDuty':['radical chain polymerization','polycondensation','polyaddition','explicit comparison','example-specific reaction conditions','chemical justification'],
  'chemistry':'Compare given chosen systems: suitable radical initiation by heat/light with an initiator and conditions limiting inhibition; step-growth condensation with suitable catalysis/temperature and handling of a small-molecule product where relevant; chosen isocyanate–OH polyaddition with control of moisture, reaction heat and functional-group proportions. Condensation implementations and other polyaddition families differ: conditions are not universal class labels.',
  'avoid':'Do not claim all polymerizations require heat, all polycondensations require the same temperature, all polyadditions are moisture-sensitive, all catalysts shift thermodynamic equilibrium, or initiation and catalysis are the same operation. Executing a kinetics experiment does not establish three-route comparison.'}
]})
print('Prepared finite six-duty author candidate:', len(candidate['goals']), 'whole nodes; 4 new + 1 exact reused pending atom; no operative source grants.')
