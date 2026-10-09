import json, hashlib, math, pathlib, datetime

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OWN = BASE / 'chemie-b008-one-MV-KpKc-primary-independent-b-v1'
AUTHOR = BASE / 'chemie-b008-kp-kc-actual-MV-primary-author-root-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
REVIEWER = '/root/bio_science14_independent_b'

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def bind(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def put(name, v):
    p = OWN / name
    with p.open('x') as f:
        f.write(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

def digest(v):
    return 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

data_path = AUTHOR / 'one-whole-KpKc-goal-actual-MV-clause-and-original-gas-partner.author-candidate.json'
data = read(data_path)
first = read(OWN / 'one-MV-KpKc.independent-b.input.first.freeze.json')
assert all(bind(x['path']) == x for x in first['inputs'])
canon = read(data['actualInputs'][1]['path'])
goals = {g['id']: g for g in canon['goals']}
ext = read(data['actualInputs'][2]['path'])
mapping = read(data['actualInputs'][3]['path'])
sid = data['wholeOriginalSourceGoal']['id']
source = next(x for x in ext['sourceGoals'] if x['id'] == sid)
passage = next(x for x in ext['passages'] if x['id'] == source['passageId'])
old_decision = next(x for x in mapping['decisions'] if x['sourceGoalId'] == sid)
old_edges = [x for x in mapping['mappings'] if x['legacyGoalId'] == sid]
gas_id = data['wholeOriginalPartner']['id']
target_id = data['wholeCurrentProspectiveTarget']['id']
other_edges = [x for x in mapping['mappings'] if x['canonicalGoalId'] == gas_id and x['legacyGoalId'] != sid]
checks = {'targetWholeValueExactCanonical': data['wholeCurrentProspectiveTarget'] == goals[target_id],
          'gasWholeValueExactCanonical': data['wholeOriginalPartner'] == goals[gas_id],
          'sourceWholeValueExactOriginal': data['wholeOriginalSourceGoal'] == source,
          'passageWholeValueExactOriginal': data['wholeOriginalPassage'] == passage,
          'decisionWholeValueExactOriginal': data['wholeOriginalDecision'] == old_decision,
          'oldEdgesValueExactOriginal': [x['wholeOriginalEdge'] for x in data['wholeOriginalEdges']] == old_edges,
          'all12OtherGasEdgesUnchanged': data['allOtherOriginalGasPartnerMappingEdgesUnchanged'] == other_edges}
assert all(checks.values()), checks

R = 0.08314  # L bar mol^-1 K^-1, explicitly a rounded didactic constant
T = 300.0
RT = R * T
probes = []
for name, concentrations, exponents in [
    ('2NO2(g) <=> N2O4(g)', [0.2, 0.1], [-2, 1]),
    ('N2O4(g) <=> 2NO2(g)', [0.1, 0.2], [-1, 2]),
    ('H2(g) + I2(g) <=> 2HI(g)', [0.1, 0.2, 0.3], [-1, -1, 2])]:
    dn = sum(exponents)
    kc = math.prod(c ** n for c, n in zip(concentrations, exponents))
    pressures = [c * RT for c in concentrations]
    kp_direct = math.prod(p ** n for p, n in zip(pressures, exponents))
    kp_conversion = kc * RT ** dn
    assert math.isclose(kp_direct, kp_conversion, rel_tol=1e-12)
    assert math.isclose(kp_conversion / RT ** dn, kc, rel_tol=1e-12)
    probes.append({'reaction': name, 'deltaNuGas': dn, 'temperatureK': T, 'roundedR_L_bar_per_mol_K': R,
                   'concentrations_mol_per_L': concentrations, 'pressures_bar': pressures,
                   'dimensionalKc': kc, 'dimensionalKpDirect': kp_direct, 'dimensionalKpConverted': kp_conversion,
                   'KcUnits': '(mol/L)^' + str(dn), 'KpUnits': 'bar^' + str(dn),
                   'forwardAndReverseConsistent': True})

receipt = put('one-MV-KpKc.actual-primary-binding-and-own-numeric.receipt.json', {
    'schemaVersion': 1, 'createdAt': NOW, 'reviewer': REVIEWER,
    'actualInput': bind(data_path), 'neutralInputFIRST': bind(OWN / 'one-MV-KpKc.independent-b.input.first.freeze.json'),
    'allInputBytesStillExact': True, 'wholeValueCounterchecks': checks,
    'actualPrimaryPDF': data['actualInputs'][4],
    'ownActualPageTextRead': [5,7,26,27], 'ownActualPageImagesViewed': [26,27],
    'actualPageForClause': {'physical':27,'printed':23,'column':'Hinweise und Anregungen','courseBlock':'zusätzlich für den Leistungskurs'},
    'actualPage22DoesNotContainKpKcClause': True,
    'freshOfficialPrimaryURLVerified': 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_CHE_SEK2_erprobungsfassung.pdf',
    'primaryEdition': '2022 Erprobungsfassung; exact served edition, no general current-legal applicability assertion',
    'wholeTargetValueDigest': digest(data['wholeCurrentProspectiveTarget']),
    'wholeGasValueDigest': digest(data['wholeOriginalPartner']), 'wholeSourceValueDigest': digest(source),
    'otherOriginalGasEdges': {'count':len(other_edges),'unchanged':True,'sourceTextsReadForRetention':True,'newScientificApproval':False},
    'numericProbeScope': 'Own mathematical inspection of the proposed conversion mechanism; not authored learner evidence, not P cases, not measured experiments.',
    'numericProbes': probes,
    'normalizedDerivationCountercheck': 'Using p_i/p0 and c_i/c0, substitute p_i=c_iRT individually before multiplying powers: Kp/Kc=(RT*c0/p0)^deltaNuGas. Both ratios are dimensionless. This is not the unnormalised quotient formula unless the reference standards and unit conventions are explicitly fixed.',
    'normalSourceOrProtectedContextChecksExecuted': False, 'activeWrites':0,'strictGain':0,'humanApproval':False})

verdict = put('one-MV-KpKc.independent-b.scientific-first.verdict.json', {
    'schemaVersion':1, 'role':'Independent B first scientific clause/operator/partner verdict, one bounded inactive source candidate',
    'createdAt':NOW, 'reviewer':REVIEWER, 'reviewId':'chem-b008-one-MV-KpKc-independent-b-first-20261009',
    'authority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','generalizationLevel':'G1',
    'freshIndependentAOrRootJudgmentsRead':False,'priorAuthorHints':first['priorAuthorHints'],
    'wholeInput':bind(data_path), 'actualEvidence':receipt,'targetGoalId':target_id,'originalGasPartnerId':gas_id,
    'wholeTargetDEENRead':True,'wholeOriginalSourcePassageDecisionAndEdgesRead':True,'wholeOriginalGasDEENRead':True,
    'componentVerdict':'SUPPORTED_MV_LK_PARTIAL_CONVERSION_COMPONENT',
    'primaryScopeReason':'The actual page27/printed23 places the Kc/Kp relation in the right column of the grey LK-only block. The introductory physical5 page explains that right-column notes also specify necessary depth; the explicit derivation wording carries an operative requirement, even though it is not a separate left-column binding bullet. It is not the merely recommended computer simulation on physical26. Qualifikationsphase in this Gymnasium plan is years11/12, per physical7; do not infer BY/HE or GK placement from the current target tags.',
    'scienceReason':'For the same balanced gas reaction at a common fixed temperature, ideal partial pressures satisfy p_i=c_iRT. Multiplying gas stoichiometric powers gives unnormalised Kp=Kc(RT)^deltaNuGas, or normalised Kp=Kc(RT*c0/p0)^deltaNuGas. The negative/positive/zero examples were independently calculated. Gas mole change excludes pure solid/liquid terms. Pressure and concentration units and the units of R must match. High-pressure nonideality requires activity/fugacity treatment; thermodynamic dimensionless constants and dimensional classroom quotients cannot be conflated. Changing temperature cannot be assessed by changing RT while pretending the same Kc remains known.',
    'bilingualFidelity':'The entire current DE/EN goal demands conversion AND discussion of application limits. The descriptions agree. They do not explicitly demand deriving the relationship, whereas the actual primary operator does.',
    'oldEdgeVerdict':'SCIENTIFICALLY_INVALID_FOR_THIS_CLAUSE',
    'oldEdgeReason':'The whole580b description is identification of O2/CO2/H2 through simple detection reactions and chemical interpretation of observations. That cannot establish derivation or conversion of Kc/Kp. Gas as a shared word is no semantic correspondence; the old exact source009 edge may be preserved as historical input but cannot be counted as a current valid source witness.',
    'gasPartnerRetention':'Keep the full gas goal, its actual O2/CO2/H2 identification duties, all12 other original MV edges and other source/context evidence. Those12 edges were read for retention and byte/value checked, not newly granted scientific family approval. The narrower source009 replacement cannot silently erase unrelated gas obligations or certify all other old generic partial edges.',
    'wholeSourceOperatorVerdict':'HOLD',
    'wholeSourceOperatorRemedy':'Bind an executable derivation task and rubric that start with the ideal-gas relation and multiply stoichiometric powers, alongside conversion and justified unit/model limits. Current short goal text and author conditions alone are not operative case evidence; no such current D/P case is included in this single-source input.',
    'normalPlacementAndProtectedContextVerdict':'HOLD',
    'normalPlacementAndProtectedContextRemedy':'Author and validate explicit MV-LK Qualifikationsphase placement and corrected physical27/printed23/current context bindings, preserving historical printed22 extraction. Before active substitution perform the ordinary protected580b context check: Root disclosed this is among strict177 and outside the old eight context deltas. No independently verified successful protected-context successor is supplied here. Preserve the old baseline until that actual check and the complete ordinary source/Atlas gates finish.',
    'all395SourceAtlasApproval':False,'expected395Lowered':False,'originalSourceExtractionOrMappingsWritten':False,
    'newScientificClosures':0,'restoredBindings':0,'strictGain':0,'humanApproval':False,'humanTrial':False,
    'D_P_A_M_VApproval':False,'realLearnerPerformanceOrExperimentClaim':False,'activeWrites':0})

md=OWN/'one-MV-KpKc.independent-b.scientific-first.md'
with md.open('x') as f:
    f.write('# Independent B: actual MV Kp/Kc primary clause\n\n')
    f.write('Supported: bounded MV-LK conversion component under explicit ideal-gas, unit and standard-state conventions. The actual right-column clause in the grey LK block requires a derivation; the current short DE/EN conversion goal alone does not evidence that operator.\n\n')
    f.write('The original exact assignment to O2/CO2/H2 detection is scientifically invalid for this clause. Preserve the complete gas goal and its other edges as actual retained evidence; preservation is not a fresh scientific approval of those edges.\n\n')
    f.write('HOLD: executable derivation evidence, current MV placement/page binding, and the protected580b context successor. Root disclosed that gas goal belongs to strict177; no successful new normal context check is present in this input. Whole395/source-family, D/P/native/current strict gates remain open. No active writes or human claim; strictGain0.\n')

entry=put('completed-one-MV-KpKc.independent-b.entry.json', {
    'schemaVersion':1,'role':'Neutral completed actual independent OneMV scientific FIRST handoff','createdAt':NOW,'reviewer':REVIEWER,
    'inputFIRST':bind(OWN/'one-MV-KpKc.independent-b.input.first.freeze.json'),'scientificVerdict':verdict,'actualReceipt':receipt,'summary':bind(md),
    'authority':'ai_candidate','status':'needs_human_review','normalSourceApproval':False,'sourceAtlas395Approved':False,
    'nativeOrCurrentStrictApproval':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})

outputs=[bind(p) for p in OWN.rglob('*') if p.is_file() and p.name!='one-MV-KpKc.independent-b.scientific-first.freeze.json']
freeze=put('one-MV-KpKc.independent-b.scientific-first.freeze.json', {
    'schemaVersion':1,'role':'Immutable own OneMV scientific FIRST after actual whole primary/goal/source/partner reading',
    'createdAt':NOW,'reviewer':REVIEWER,'inputs':first['inputs'],'outputs':outputs,
    'freshIndependentAOrRootJudgmentsRead':False,'originalFirstsRewritten':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'completedEntry':entry,'firstFreeze':freeze,'outputs':len(outputs)},indent=2))
