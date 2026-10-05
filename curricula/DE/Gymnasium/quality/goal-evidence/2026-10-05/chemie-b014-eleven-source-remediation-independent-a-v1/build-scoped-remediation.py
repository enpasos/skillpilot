"""Inactive independent source/A/M candidate; never writes operative inputs."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).parent
PRIOR = OWN.parent / 'chemie-b014-eleven-current-source-description-candidate-v1'
if (OWN / 'independent-source-a-m.freeze.manifest.json').exists():
    raise SystemExit('Frozen candidate must not be overwritten')

def read(p):
    return json.loads(Path(p).read_text())

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def binding(p):
    p = Path(p)
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p)}

stamp = datetime.now(timezone.utc).isoformat()
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical = read(canonical_path)
goals = {g['id']: g for g in canonical['goals']}
route_input = read(PRIOR / 'eleven-current-source-clause-routes-and-holds.json')
target_ids = [r['goalId'] for r in route_input['rows']]
split_ids = [i for i in target_ids if i.startswith(('496', 'f1ed', 'b477'))]
atomic_ids = [i for i in target_ids if i not in split_ids]
lookup = lambda prefix: next(i for i in goals if i.startswith(prefix))
gid = {p: lookup(p) for p in ['04fa', '496', '16da', 'f093', 'fd797', 'efa24', '28bb', 'f1ed', '02634', '1c142', 'b477', '22133', 'b781', '8be14', 'c224', '965ca', 'b508', 'fd309', 'd2ccd', '48115', 'a9c22', 'e7c363', 'bcf8', '1dc15', '8a2ad', '53fd', '4285', '11bea', '277a3']}
he_path = ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json'
by_path = ROOT / 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
g9_path = ROOT / 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json'
hb_path = ROOT / 'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json'
extractions = [read(p) for p in [he_path, by_path, g9_path, hb_path]]
source_index = {g['id']: (p, e, g) for p, e in zip([he_path, by_path, g9_path, hb_path], extractions) for g in e['sourceGoals']}
normative = []
for row in route_input['rows']:
    for source in row['substantiveCurrentSourceCandidateRoutes']:
        p, e, current = source_index[source['sourceGoalId']]
        assert current['sourceText'] == source['fullCurrentClause']
        normative.append({'goalId': row['goalId'], **binding(p), 'sourceExtractionPath': str(p.relative_to(ROOT)),
            'sourceLandscapeId': source['sourceLandscapeId'], 'sourceGoalId': current['id'],
            'sourceSpan': current['sourceSpan'], 'sourceText': current['sourceText'],
            'parentBulletText': current.get('parentBulletText'), 'operatorQualifier': source['operatorQualifier']})

candidate = copy.deepcopy(canonical)
cmap = {g['id']: g for g in candidate['goals']}
text_changes = {
    gid['fd797']: (
        'Die lernende Person kann die Elektrolyse an geeigneten Beispielen einschließlich einer wässrigen Kupfer(II)-chloridlösung anhand der Ionenwanderung und Elektrodenreaktionen erklären, die Stoffmengenverhältnisse der Produkte begründen und den erzwungenen Vorgang mit einem galvanischen Element vergleichen.',
        'The learner can explain electrolysis through suitable examples including an aqueous copper(II) chloride solution using ion migration and electrode reactions, justify the product amount ratios and compare the forced process with a galvanic cell.'),
    gid['efa24']: (
        'Die lernende Person kann an einer geeigneten reversibel arbeitenden elektrochemischen Zelle freiwillige und erzwungene Redoxvorgänge beim Entladen und Laden vergleichen und Alltagsformulierungen zu leeren Batterien oder geladenen Akkus fachlich beurteilen.',
        'The learner can compare spontaneous and forced redox processes during discharging and charging in a suitable reversibly operating electrochemical cell and critically assess everyday statements about empty batteries or charged rechargeable cells.'),
    gid['28bb']: (
        'Die lernende Person kann typische anorganische Säuren und Basen mit Namen und Formeln angeben und ihre Wirkung in Wasser nach dem Arrhenius-Konzept erklären.',
        'The learner can state the names and formulas of typical inorganic acids and bases and explain their behaviour in water using the Arrhenius concept.'),
    gid['02634']: (
        'Die lernende Person kann eine Säure-Base-Titration mit geeigneter Maßlösung und begründetem Indikator fachgerecht planen und durchführen und aus dokumentierten Volumina unter Berücksichtigung der Reaktionsstöchiometrie die Konzentration der Probe bestimmen.',
        'The learner can correctly plan and carry out an acid-base titration using a suitable standard solution and a justified indicator and determine the sample concentration from recorded volumes while accounting for reaction stoichiometry.'),
    gid['1c142']: (
        'Die lernende Person kann Protonenübertragungen mit dem Brønsted-Konzept beschreiben, Protolysegleichungen formulieren, korrespondierende Säure-Base-Paare einschließlich der Rolle von Wasser als Ampholyt identifizieren und Säuren und Basen als Teilchen von sauren und basischen Lösungen als Stoffgemischen unterscheiden.',
        'The learner can describe proton transfers using the Brønsted concept, formulate protolysis equations, identify conjugate acid-base pairs including the role of water as an ampholyte and distinguish acids and bases as species from acidic and basic solutions as mixtures.'),
}
for i, (de, en) in text_changes.items():
    cmap[i]['description'], cmap[i]['descriptionEn'] = de, en
    # Accessibility describes the changed actual goal but does not approve its picture.
    for link in cmap[i].get('resourceLinks', []):
        if link.get('type') == 'goal-visualization':
            link['altText'] = f'Didaktische Visualisierung zum Lernziel "{cmap[i]["title"]}". {de}'
cmap[gid['16da']]['requires'] = [gid['04fa']]
cmap[gid['1c142']]['requires'] = [gid['28bb'], gid['e7c363']]
replacement_sources = {
    gid['04fa']: 'he-chem-sekii-e-1-b01-a01-76c838e1',
    gid['496']: 'a64c4974-d9ba-5580-a109-c17a19556047',
    gid['16da']: 'he-chem-sekii-e-1-b05-a01-f455805a',
    gid['f093']: 'he-chem-sekii-e-1-b07-a01-e3d57612',
    gid['fd797']: 'he-chem-sekii-e-1-b09-a01-45b22583',
    gid['28bb']: 'he-chem-sekii-e-2-b01-a01-4b89f4d7',
    gid['f1ed']: 'he-chem-sekii-e-2-b02-a01-c32ee65f',
    gid['02634']: 'he-chem-sekii-e-2-b04-a01-803d5801',
    gid['1c142']: 'he-chem-sekii-e-2-b05-a01-0713a913',
    gid['b477']: 'hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-037-a5df318f',
}
provenance_deltas = []
for i, sid in replacement_sources.items():
    p, e, s = source_index[sid]
    source_landscape = e['sourceLandscapeId']
    title = e.get('title', '')
    after = {'sourceLandscapeId': source_landscape, 'sourceLandscapeTitle': title, 'sourceGoalId': sid,
        'sourceRef': s['sourceRef'], 'sourceSpan': s['sourceSpan']}
    before = goals[i]['extendedData']['provenance']
    old_source_exists = before['sourceGoalId'] in source_index
    assert not old_source_exists
    provenance_deltas.append({'goalId': i, 'before': before, 'after': after,
        'sourceBinding': binding(p), 'sourceText': s['sourceText'],
        'candidateBoundary': 'Split survivor provenance only; original aggregate goal is not source-complete or atomic.' if i in split_ids else 'Provenance resolves an actual content origin; broader source rows remain explicitly grouped or partial.',
        'appliedToEightGoalSnapshot': i in atomic_ids})
    if i in atomic_ids:
        cmap[i]['extendedData']['provenance'] = after
write('eight-complete-text-source-prerequisite-deltas.json', {'status': 'inactive_independent_remediation_candidate',
    'authority': 'ai_candidate', 'reviewer': 'codex-independent-source-a-m-review', 'PRead': False,
    'informedExposure': 'Prior informed author findings and proposals read; own source/A/M judgments. Not blind final-book D2.',
    'rows': [{'goalId': i, 'before': goals[i], 'after': cmap[i], 'changedFields': [k for k in cmap[i] if cmap[i].get(k) != goals[i].get(k)],
        'A': 'atomic', 'M': 'memory_required_separate_card_lane' if i == gid['28bb'] else 'no_memory_needed',
        'candidateStatus': 'PASS_source_and_semantic_atom_candidate; final D/P/V and adoption pending'} for i in atomic_ids],
    'strictClosureAdded': 0, 'activeMutations': False})
write('eight-full-runtime.validation-snapshot.json', candidate)
write('ten-current-provenance-before-after-candidate.json', {'status': 'inactive_candidate', 'rows': provenance_deltas,
    'obsoleteIdsResolvedToExistingCurrentSourceIds': 10, 'threeSplitOriginalsRemainHOLD': split_ids,
    'noHashOnlyScientificApproval': True})
write('bounded-current-source-bindings.json', {'status': 'independent_source_candidate', 'bindings': normative,
    'primaryScope': ['HE retained page35', 'HE April2026 pages35/38/47', 'HE G9 physical18/19/25', 'HB original printed23', 'BY9.6/BY10.4/.5/BY10NTG2/.3/BY13GA3'],
    'noGlobalSourceMigrationApproval': True, 'notAllJurisdictionsReviewed': True})

prereq = [
    {'goalId': gid['16da'], 'before': goals[gid['16da']]['requires'], 'after': cmap[gid['16da']]['requires'],
     'reason': 'Ordering supplied deposition/cell observations requires the actual electron donor/acceptor roles from04fa. bcf8 is the separate older metal/nonmetal oxidation route and carries a broad inherited cluster whose required-member closure reimports496 through1f30; it is not a necessary prior oxygen-transfer performance for this electron-transfer inference. Given species/cell observations and04fa provide the concrete retained foundation. BY9 half-equation portion remains jointly carried by existing221, not claimed by16da alone.'},
    {'goalId': gid['1c142'], 'before': goals[gid['1c142']]['requires'], 'after': cmap[gid['1c142']]['requires'],
     'reason': 'Proton transfer needs aqueous acid/base concepts and molecular formula interpretation; manufacturing a specified concentration and logarithmic strong-solution pH are independent skills. The concrete foundation28+e7 retains the prerequisite knowledge.'},
    {'goalId': gid['02634'], 'before': goals[gid['02634']]['requires'], 'after': goals[gid['02634']]['requires'],
     'reason': 'Keep f1 until its retained concentration/preparation survivor and existing strong-pH reuse are independently integrated. The analytic workflow genuinely needs concentration preparation; do not delete to mask split debt.'},
    {'goalId': gid['efa24'], 'before': goals[gid['efa24']]['requires'], 'after': goals[gid['efa24']]['requires'],
     'reason': 'Both cell processes are needed to compare charging/discharging. Retain these real prerequisites; current E placement is proven separately from the BY9 source metadata. A reviewed lower-secondary source/view route remains a separate integration action.'},
]
write('bounded-prerequisite-edge-cases.json', {'status': 'inactive_candidate', 'rows': prereq})

atlas = read(PRIOR / 'current-source-witnesses.json')
mapping_inputs = [b for b in atlas['inputBindings'] if '/mapping/' in b['path'] and any(t in b['path'] for t in ['DE-HE/', 'DE-BY/', 'DE-HB/'])]
reuses = []
for prefix in ['22133','b781','8be14','c224','965ca','b508','fd309','d2ccd','48115','1dc15','8a2ad','277a3']:
    i = gid[prefix]
    mappings = []
    for m in mapping_inputs:
        x = read(ROOT / m['path'])
        mappings.extend([{'mappingPath': m['path'], **r} for r in x.get('mappings', []) if r['canonicalGoalId'] == i])
    reuses.append({'goalId': i, 'fullCurrentGoal': goals[i],
        'currentCanonicalParents': [{'id': p['id'], 'title': p['title']} for p in canonical['goals'] if i in p.get('contains', [])],
        'currentMappings': mappings,
        'nativeSourceScopeWitnesses': [{'scopeKey': s['key'], 'scopePath': s['path'], 'jurisdiction': s['jurisdiction'], 'stage': s['stage'], 'courseProfile': s['courseProfile'],
            'witnesses': [w for w in s['witnesses'] if w['goalId'] == i]} for s in atlas['scopes'] if any(w['goalId'] == i for w in s['witnesses'])],
        'scientificReuseApproval': 'Candidate reuse only; source/placement deltas below and dependent D/A/M/V checks required.'})
write('exact-current-companion-reuse-and-placement-witnesses.json', {'status': 'inactive_candidate', 'rows': reuses})

groups = [
 {'sourceGoalId': 'he-chem-sekii-e-1-b06-a01-5428c244', 'replacementTargets': [gid['8be14'], gid['b781']], 'matchTypes': ['partial','partial'],
  'supportingCellMechanismTarget': gid['f093'], 'retainedWidth': 'Numeric cell voltage from supplied standard reduction potentials, reference hydrogen half-cell setup/function/reference convention. Qualitative f093 is not the whole voltage clause.',
  'remainingAction': 'Native current views include Q3 subtree; source applies E and GK/LK. Reuse b781 with GK/LK metadata and earlier placement; preserve Q3 mappings. Native compile the move only with reviewed companion snapshot, then rebind affected pages.'},
 {'sourceGoalId': 'he-chem-sekii-q3-3-b03-a01-27ea846d', 'replacementTargets': [gid['8be14'], gid['b781']], 'matchTypes': ['partial','partial'],
  'retainedWidth': 'Reference half-cell plus standard potential interpretation and numeric potential differences. No Nernst/temperature/pH extensions.'},
 {'sourceGoalId': 'he-chem-sekii-q3-3-b02-a01-f4d24c56', 'replacementTargets': [gid['f093']], 'matchTypes': ['exact'],
  'retainedWidth': 'Daniell element is an actual required Q3 example of the retained cell mechanism; no new atom.'},
 {'sourceGoalId': 'he-chem-sekii-q3-3-b04-a01-a7519947', 'replacementTargets': [gid['fd797']], 'matchTypes': ['exact'],
  'retainedWidth': 'Revised aqueous CuCl2 wording explicitly retains Cu/Cl2 electrode processes; molten NaCl stays a correct supplementary image example, not evidence of aqueous product choice.'},
 {'sourceGoalId': 'he-chem-sekii-e-2-b01-a01-4b89f4d7', 'replacementTargets': [gid['28bb'],gid['965ca']], 'matchTypes': ['partial','partial'],
  'supportingNotWholeCarrier': [gid['d2ccd'],gid['b508']],
  'retainedWidth': '28 names/formulas of five named acids and four named hydroxides/solutions plus Arrhenius explanation. 965 names/ratio formulas of chlorides,sulfates,nitrates,carbonates,phosphates; supplied polyatomic-ion formulas/charges used for reasoning.',
  'requiredSelectedExamples': ['NaCl','Na2SO4','NaNO3','Na2CO3','Na3PO4','CaCl2','CaSO4','Ca(NO3)2','CaCO3','Ca3(PO4)2'],
  'remainingAction': 'Bound a current965 task/page to phosphate as well as the four existingb508 classes; review actual source and A/M/V of965. b508 is already closed and stays unchanged. RootMemory covers nine acid/base facts only; no salt-recall claim from those18cards.'},
 {'sourceGoalId': 'he-chem-sekii-e-2-b04-a01-803d5801', 'replacementTargets': [gid['02634']], 'matchTypes': ['exact'],
  'removeIncorrectTargets': [gid['f1ed'],'680c7dc6-9af5-58fb-86f5-e003aa78d0f5'],
  'retainedWidth': 'Plan/conduct/document HCl(aq)-NaOH(aq) endpoint titration and concentration via reaction stoichiometry; no universal equivalence-pH7 assumption.'},
 {'sourceGoalId': 'he-chem-sekii-e-2-b06-a01-a508fe05', 'replacementTargets': [gid['1c142']], 'matchTypes': ['exact'],
  'removeIncorrectTargets': [gid['f1ed']], 'retainedWidth': 'Ionic protolysis equations including hydronium/hydroxide formation.'},
 {'sourceGoalId': 'he-chem-sekii-e-1-b08-a01-0bba4a7b', 'replacementTargets': [gid['22133']], 'matchTypes': ['exact'],
  'removeIncorrectTargets': [gid['04fa']], 'retainedWidth': 'Oxidation-number-based aqueous half-equation balancing in existing221, separate from496 assignments/recognition.'},
 {'sourceGoalId': 'he-chem-sekii-e-2-b03-a01-b6eb2233', 'replacementTargets': [gid['c224'],gid['d2ccd'],gid['fd309']], 'matchTypes': ['partial','partial','partial'],
  'retainedWidth': 'Strong acid/base pH calculation with justified dilute complete-protolysis model plus indicator evidence and relative hydronium/hydroxide concentration. Supply pKw when temperature differs; pH+pOH14 only25C ideal dilute convention.',
  'remainingAction': 'Reuse currentc224 after bounded text/model and prerequisite/earlier placement correction; fd309 needs excess/relative-concentration wording, as both ion species exist in aqueous solutions. f1 remains HOLD until actual reuse companion integration.'},
]
for group in groups:
    p,e,s=source_index[group['sourceGoalId']]
    group['sourceExtractionPath']=str(p.relative_to(ROOT));group['sourceBinding']=binding(p)
    group['sourceText']=s['sourceText'];group['sourceSpan']=s['sourceSpan']
    group['operativeAdoption']=False;group['candidateMappingOnly']=True
write('nine-complete-source-row-remediation-groups.json', {'status':'inactive_candidate','groups':groups,
    'noCompleteSourceApprovalWithoutCompanionReviews':True})

split_templates=read(PRIOR/'eleven-description-deltas-and-split-templates.json')['proposals']
split_templates=[copy.deepcopy(s) for s in split_templates if s['fromGoalId'] in split_ids]
for s in split_templates:
    s['status']='HOLD_aggregate_until_exact_companion_reuse_and_current_dual_D_P_A_M_V'
    if s['fromGoalId']==gid['f1ed']:
        s['templates'][1]['id']=None
        s['templates'][1]['existingReuseFirstGoalId']=gid['c224']
        s['templates'][1]['noNewAtomIfExistingReuseApproved']=True
        s['templates'][0]['requiresCandidate']=[gid['28bb'],gid['53fd'],gid['8a2ad']]
    if s['fromGoalId']==gid['b477']:
        s['templates'][2]['existingReuseFirstGoalId']=gid['277a3']
        s['templates'][2]['noNewAtomIfExistingReuseApproved']=True
        s['exactPrimaryOperatorFoundOutsideContentClause']={
            'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg',
            'section':'C10 Lernbereich1 process competence and contents: properties, explanatory power, limits/extensions of models',
            'boundary':'Generic modelling reflection is genuinely normative; acid/base specialization is an authored application, not a literal acid/base content operator. Requires exact current modelling-goal reuse review or a new independently reviewed atom.'}
write('three-split-holds-with-existing-reuse-first-solutions.json', {'status':'inactive_candidate','rows':split_templates,
    'newOrdinaryIdsAllocated':[],'strictClosureAdded':0})

companion_deltas=[]
for prefix, req in [('b781',[gid['f093']]),('8be14',[gid['16da'],gid['f093'],gid['b781']]),('c224',[gid['28bb'],gid['1c142'],gid['1dc15']])]:
    i=gid[prefix];after=copy.deepcopy(goals[i]);after['requires']=req
    if prefix=='b781':
        after['tags']=list(dict.fromkeys(['GK',*after['tags']]))
        after['core']=True
    if prefix=='c224':
        after['description']='Die lernende Person kann den pH-Wert hinreichend verdünnter wässriger Lösungen starker Säuren und Basen aus ihrer Stoffmengenkonzentration unter begründeten Modellannahmen bestimmen und gemessene pH-Werte auf Plausibilität prüfen.'
        after['descriptionEn']='The learner can determine the pH of sufficiently dilute aqueous solutions of strong acids and bases from their amount concentration using justified model assumptions and check measured pH values for plausibility.'
    companion_deltas.append({'goalId':i,'before':goals[i],'after':after,
        'placementBefore':next(p['id'] for p in canonical['goals'] if i in p.get('contains',[])),
        'placementCandidate':('f97b9c87-16d0-58fd-bcb2-c51574aa36d0' if prefix=='c224' else 'cd7f484a-ac2e-55bb-b904-61d743e87821'),
        'notAppliedToEightSnapshot':True,
        'metadataScopeBoundary':'GK tag and earlier placement are supported by targeted HE clauses, but no blanket extension to each other jurisdiction is approved; preserve exact regional profile mapping and review affected source/applicability before adoption.',
        'integrationGate':'Separate actual source/A/M/image and current twoD/P reviews; targeted book/consumer/context rebind before active adoption.'})
write('three-complete-companion-text-prerequisite-placement-deltas.json',{'status':'inactive_reuse_candidates','rows':companion_deltas,
    'sameStableIds':True,'newOrdinaryAtoms':0,'noMetadataStageShiftAloneClaimedAsScientificReview':True})

reason_a={
 '04fa':'One electron-transfer interpretation ties oxidation/reduction and donor/acceptor agent roles. Assignments must name the actual particle, e.g. Ag+ is acceptor, not deposited Ag metal.',
 '16da':'One relative-series inference from deposition/cell observations; paired species are named correctly. Oxidation-number assignment is a separable prerequisite routine and is not needed to interpret supplied electron-transfer observations.',
 'f093':'One galvanic-cell causal model connects electrodes, external electron flow, ionic charge compensation, reaction and qualitative voltage. Numeric voltage/reference half-cell are preserved by separate existing IDs, not inserted as independent performance here.',
 'fd797':'One forced aqueous CuCl2 electrolysis workflow links ion migration, Cu2+ reduction, chloride oxidation, product amount ratios and energy-direction comparison. Actual conditions/electrodes are supplied; chloride-to-chlorine product choice is appropriate under stated school conditions, not every dilute aqueous chloride.',
 'efa24':'One conditional charge/discharge/reversibility comparison. The suitable reversible chemistry clause prevents a claim that arbitrary primary batteries are rechargeable.',
 '28bb':'Names and formulas are compact support for one Arrhenius aqueous-ion explanation. The named hydroxide substance and aqueous solution are distinguished. The separate salts part of the broad source clause is explicitly preserved by existing965, not lost or counted here.',
 '02634':'One analytical workflow: planning, controlled performance, justified indicator endpoint, recorded volumes and concentration via reaction stoichiometry. Indicator transition/weak-system details are supplied where needed; endpoint does not universally equal pH7.',
 '1c142':'One proton-transfer model links donor/acceptor roles, ionic equation, conjugate pairs, water ampholyte and distinction between a species and a mixture. No quantitative concentration-preparation or logarithmic pH performance is smuggled in.',
}
reason_m={
 '04fa':'Electron donor/acceptor meanings are inferred from a given transfer; no mandatory independent memorized reagent catalogue.',
 '16da':'Relative order is reconstructed from supplied observations/cell data; no fixed memorized metal series is required.',
 'f093':'Charge flow/polarity follows the described half-reactions and charge compensation; no potential-value recall catalogue is needed.',
 'fd797':'Electrolyte/phase/electrode conditions and reactions ground the explanation; product molar ratio follows balanced electron transfer instead of a memorized product list.',
 'efa24':'Rechargeability is reasoned from the specified reversible chemistry; no additional instant vocabulary catalogue.',
 '02634':'Indicator transition data are supplied and selected meaningfully; documented measurements and reaction stoichiometry provide the assessment evidence.',
 '1c142':'Proton movement defines roles and conjugate pairs in the given examples; no separate memorized pair list is specified.',
}
for gate, scope, reasons in [('a',atomic_ids,reason_a),('m',[i for i in atomic_ids if i!=gid['28bb']],reason_m)]:
    rows=[]
    for i in scope:
        key=next(p for p in reasons if i.startswith(p))
        row={'schemaVersion':1,'ruleVersion':'v1','landscapeId':canonical['landscapeId'],'reviewedAt':stamp,
            'reviewer':'codex-independent-source-a-m-candidate','reviewId':f'chemie-b014-{gate}-source-remediation-independent-a-20261005-v1',
            'goalId':i,'fingerprint':'native_write_fingerprint_pending','reason':reasons[key]}
        if gate=='a':row.update(status='atomic',semanticAtomic=True)
        else:row.update(status='no_memory_needed',memoryUseful=False,memoryGoalIds=[],deckIds=[])
        rows.append(row)
    (OWN/f'{gate}-scoped.review.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
    cfg={'schemaVersion':1,'ruleVersion':'v1','reviewId':rows[0]['reviewId'],'landscapeId':canonical['landscapeId'],
        'landscapePath':str((OWN/'eight-full-runtime.validation-snapshot.json').relative_to(ROOT)),
        'reviewPath':str((OWN/f'{gate}-scoped.review.jsonl').relative_to(ROOT)),
        'scope':{'label':'Eight semantic atoms' if gate=='a' else 'Seven actual reasoning-only atoms; required28 Memory has separate independent card lane', 'leafGoalIds':scope}}
    if gate=='m':
        (OWN/'m-scoped.cards.review.jsonl').write_text('\n')
        cfg['cardReviewPath']=str((OWN/'m-scoped.cards.review.jsonl').relative_to(ROOT))
    write(f'{gate}-scoped.config.json',cfg)
write('28-required-memory-separate-lane-reference.json', {'goalId':gid['28bb'],'ownSemanticDecision':'memory_required',
    'memoryGoalIds':['417e65ec-68be-5f2e-9452-c3ba9b1d362f'],'deckIds':['de_gymnasium_chemistry_arrhenius_names_formulas'],
    'sameOrdinaryGoalDescriptionAsRootMemoryCandidate':cmap[gid['28bb']]['description'],
    'independentCardLane':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1',
    'cardEvidenceNotDuplicated':True,'runtimeMemoryAdoptionAndFinalCurrentFingerprintRequired':True,
    'saltsNotApprovedByThisAcidBaseDeck':True})
write('operative-and-frozen-inputs.receipt.json',{'observedAt':stamp,'operativeBindings':[binding(canonical_path),*[binding(p) for p in [he_path,by_path,g9_path,hb_path]]],
    'priorFrozenManifest':binding(PRIOR/'frozen-source-d-am.receipt.json'),'priorFrozenFiles':read(PRIOR/'frozen-source-d-am.receipt.json')['files'],
    'actualPriorAuthorBytesRead':True,'PRead':False,'humanApproved':False,'activeMutations':False})
print(json.dumps({'eightCompleteGoalDeltas':len(atomic_ids),'tenCurrentProvenanceProposals':len(provenance_deltas),'sourceGroups':len(groups),'newOrdinaryIds':0,'strictClosureAdded':0}))
