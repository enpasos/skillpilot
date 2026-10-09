import json, hashlib, pathlib, datetime

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OWN = BASE / 'chemie-b008-five-source-content-nine-program-independent-b-v1'
AUTHOR = BASE / 'chemie-b008-rest-twenty-source-content-and-program-author-root-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
REVIEWER = '/root/bio_science14_independent_b'

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def bind(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def put(name, obj):
    p = OWN / name
    with p.open('x') as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

def value_digest(v):
    return 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

content = read(AUTHOR / 'five-whole-content-source-candidates.with-original-partners.author-input.json')
program = read(AUTHOR / 'nine-whole-goals.actual-official-program-boundaries.author-input.json')
input_first = read(OWN / 'five-content-nine-program.independent-b.input.first.freeze.json')
assert all(bind(x['path']) == x for x in input_first['inputs'])
canon_path = content['currentProspectiveLandscape']['path']
canon = read(canon_path)
goals = {g['id']: g for g in canon['goals']}
errors = []
counterchecks = []
for i, x in enumerate(content['items']):
    ext = read(x['sourceExtraction']['path'])
    mp = read(x['mapping']['path'])
    sid = x['wholeOriginalSourceGoal']['id']
    original_source = next(g for g in ext['sourceGoals'] if g['id'] == sid)
    original_passage = next(g for g in ext['passages'] if g['id'] == original_source['passageId'])
    original_decision = next(g for g in mp['decisions'] if g['sourceGoalId'] == sid)
    original_edges = [g for g in mp['mappings'] if g['legacyGoalId'] == sid]
    checks = {'wholeTargetValueExactCanonical': x['wholeCurrentTarget'] == goals[x['goalId']],
              'wholeSourceValueExactOriginalExtraction': x['wholeOriginalSourceGoal'] == original_source,
              'wholePassageValueExactOriginalExtraction': x['wholeOriginalPassage'] == original_passage,
              'wholeDecisionValueExactOriginalMapping': x['originalDecisionUnchanged'] == original_decision,
              'allOriginalEdgesValueExact': x['originalMappingEdgesUnchanged'] == original_edges,
              'allPartnerAndDescendantBodiesValueExactCanonical': all(g == goals[g['id']] for g in x['wholeOriginalCurrentPartnersAndDescendants'])}
    if not all(checks.values()):
        errors.append({'goalId': x['goalId'], 'checks': checks})
    counterchecks.append({'goalId': x['goalId'], 'inputPointer': '/items/' + str(i),
                          'sourceGoalId': sid, 'checks': checks,
                          'originalEdgeCount': len(original_edges), 'wholePartnerAndDescendantCount': len(x['wholeOriginalCurrentPartnersAndDescendants']),
                          'wholeTargetValueDigest': value_digest(x['wholeCurrentTarget']),
                          'originalSourceValueDigest': value_digest(original_source),
                          'originalPartnerValueDigests': [{'goalId': g['id'], 'digest': value_digest(g)} for g in x['wholeOriginalCurrentPartnersAndDescendants']]})

program_checks = []
additional_inputs = {}
for i, x in enumerate(program['items']):
    routes = []
    for r in x['wholeActualRouteContexts']:
        ep = r['sourceExtractionPath']
        mp = r['mappingPath']
        additional_inputs[ep] = bind(ep)
        additional_inputs[mp] = bind(mp)
        ext = read(ep)
        mapping = read(mp)
        sid = r['sourceGoalId']
        sg = next(g for g in ext['sourceGoals'] if g['id'] == sid)
        pg = next(g for g in ext['passages'] if g['id'] == sg['passageId'])
        dec = next(g for g in mapping['decisions'] if g['sourceGoalId'] == sid)
        checks = {'sourceBodyValueExact': sg == r['wholeSourceGoal'], 'passageBodyValueExact': pg == r['wholePassage'],
                  'decisionValueExact': dec == r['wholeDecision'], 'allMappedPartnerIdsPresent': all(g in goals for g in dec['canonicalGoalIds']),
                  'targetInDecision': x['goalId'] in dec['canonicalGoalIds'],
                  'courseAndScopeRemainUnspecified': r['courseProfile'] == [] and r['ordinaryScopes'] == []}
        if not all(checks.values()):
            errors.append({'sourceGoalId': sid, 'checks': checks})
        routes.append({'sourceGoalId': sid, 'sourceSpan': r['sourceSpan'], 'checks': checks,
                       'wholeSourceValueDigest': value_digest(sg), 'wholePassageValueDigest': value_digest(pg),
                       'wholeDecisionValueDigest': value_digest(dec), 'stage': r['stage'], 'courseProfile': r['courseProfile'], 'ordinaryScopes': r['ordinaryScopes']})
    program_checks.append({'goalId': x['goalId'], 'inputPointer': '/items/' + str(i),
                           'wholeGoalValueExactCanonical': x['wholeCurrentProspectiveGoal'] == goals[x['goalId']],
                           'wholeGoalValueDigest': value_digest(x['wholeCurrentProspectiveGoal']), 'routes': routes})
assert not errors, errors

source_notes = [
    {
        'componentVerdict': 'SUPPORTED_BOUNDED_MECHANISM_AND_AUTHORED_TRANSFER',
        'primary': 'HE current 2026 PDF physical/printed39 Q1.2 LK, and whole Q1 binding rule physical38.',
        'science': 'SN1 ionisation with a carbocation intermediate and a unimolecular limiting step differs from concerted SN2 attack. Kinetic dependence follows those model mechanisms. Substrate, steric crowding, stabilising inductive effects and specified solvent conditions can discriminate them; neither substrate class nor solvent alone proves an exclusive real mechanism. Competing elimination and secondary substrates require conditions. Both DE/EN descriptions demand the same mechanism/kinetics/solvent/substrate interpretation.',
        'operativeScope': 'The primary clause explicitly requires SN1/SN2 with tertiary/primary examples and inductive/steric effects. Kinetic orders and a universal solvent rule are not separate literal bullets. The new goal supports that mechanism component and an authored extension; it does not name every source duty explicitly.',
        'partners': 'Retain the whole c2d3 cluster and donor/acceptor, haloalkane equation and halide-detection descendants. Their actual descriptions concern generic substitution, equations or observations; the historical exact c2d3 edge alone does not demonstrate advanced SN1/SN2 differentiation. No scientific approval is inherited from that label.',
        'remedy': 'For whole-clause closure bind executable tasks/rubrics explicitly requiring inductive as well as steric effects and conditional primary/tertiary mechanistic comparison; separately retain all original general-substitution/observation duties.'
    },
    {
        'componentVerdict': 'SUPPORTED_OPTIONAL_COMPARATIVE_TRANSFER_ONLY',
        'primary': 'RP2022 PDF physical/printed40, 3.3; visible Fundamentum/Additum table and separate grey optional deepening box.',
        'science': 'For comparable nucleophilic acyl substitution conditions, carbonyl electrophilicity and the leaving group explain the usual acid chloride > anhydride > ester reactivity order. Comparisons require specified nucleophile, solvent and acid/base conditions; hydrolysis kinetics under different catalysis cannot supply an unconditional order. Ester carbonyl resonance and poorer alkoxide leaving group support the distinction. The whole bilingual goal asks for comparable conditions.',
        'operativeScope': 'Acid chloride and anhydride occur as further possible derivative examples in optional Vertiefungs-/Verzahnungsmöglichkeiten, not as a mandatory LK Additum. The actual Additum separately requires the addition-elimination mechanism and acid/alkaline hydrolysis. The new three-derivative comparison is an authored optional transfer and cannot remove the original amide example.',
        'partners': 'All15 original partial edges and25 whole bodies remain. Protein/peptide/amino-acid, plastics, pharmacy/retrosynthesis/ASA extraction/analysis/COX/dosage and structure-property/recycling families have duties beyond this derivative comparison; neither the old broad 1:n rationale nor this new atom closes them.',
        'remedy': 'Current source metadata must bind physical40 and the optional subsection, preserving the historical S.21 reference as history. Never convert the original courseLevel LK tag into a mandatory universal RP-LK obligation. Whole3.3 and all other partner duties stay separate.'
    },
    {
        'componentVerdict': 'SUPPORTED_AUTHORED_INTRAMOLECULAR_ESTER_TRANSFER_ONLY',
        'primary': 'HE current2026 PDF physical/printed39 Q1.3 ester bullet, continuation40 for LK alkaline hydrolysis.',
        'science': 'A specified hydroxyacid can esterify intramolecularly to a cyclic ester with loss of water. Ring geometry/strain, entropy and equilibrium conditions affect formation and stability; specified comparative observations are necessary for a justified relative conclusion. DE/EN correctly bind the comparison to supplied structure, conditions and data, not an absolute ring-size rule.',
        'operativeScope': 'The primary specifies ester nomenclature/group/structural formulae, condensation and its mechanism. Lactone ring stability is a permissible authored application, not a literal mandatory lactone duty and not a new all-GK/LK obligation.',
        'partners': 'The whole70b ester-formation/properties and98ae ester/amide condensation mechanism bodies and both partial edges remain. The prior ester nomenclature/structural-representation and prerequisite-route gaps are explicitly present in the old decision; this review does not erase them.',
        'remedy': 'Retain the whole source group and its outstanding naming/structure/mechanism-path remedies. Any new source witness must label this goal as intramolecular transfer rather than complete coverage of the ester bullet.'
    },
    {
        'componentVerdict': 'SUPPORTED_AUTHORED_REDOX_DATA_EVALUATION_TRANSFER_ONLY',
        'primary': 'HE current2026 PDF physical/printed40 Q1.5 qualitative ascorbic antioxidant bullet; physical38 makes Q1.1–3 mandatory, not all Q1.5.',
        'science': 'Ascorbate can donate reducing equivalents and inhibit oxidative change; antioxidant behaviour alone does not establish antimicrobial efficacy. Supplied reaction/comparison data support a bounded redox preservation judgement, with matrix and conditions limiting conclusions. The bilingual descriptions preserve this distinction.',
        'operativeScope': 'The source requires a qualitative antioxidant detection when this thematic field is selected. Supplied-data evaluation supports an authored transfer and does not execute that detection. No literal universal LK transfer obligation is established.',
        'partners': 'The wholedb666 atom and exact historical edge retain carrying out qualitative ascorbic tests and explaining the observed reduction. Quantitative ascorbic determination and antimicrobial/product-use conclusions remain separate duties.',
        'remedy': 'Bind only the data-evaluation transfer component; preserve the actual qualitative-test operator and selected-Q1.5 applicability. Real learner experiment evidence requires genuine execution/observations, not a synthetic answer.'
    },
    {
        'componentVerdict': 'SUPPORTED_PARABEN_CONTEXT_ONLY_QUANTITATIVE_SOURCE_ROUTE_HOLD',
        'primary': 'HE current2026 PDF physical/printed40 Q1.5 LK: separate ascorbic quantitative and paraben-use bullets.',
        'science': 'A specified p-hydroxybenzoate ester can be an analytical target. Method selection must account for the ester/phenol groups, matrix selectivity and interference; a calibration or justified stoichiometry, dilution and controls can support an amount calculation. Merely identifying preservative use supplies none of those procedures. Both whole DE/EN descriptions correctly require planning AND carrying out controls.',
        'operativeScope': 'The actual paraben clause is use of p-hydroxybenzoic acid esters. The neighbouring quantitative clause explicitly names ascorbic acid. Paraben use supplies a context for an authored transfer; general quantitative competencies are mentioned in the rationale but no actual full general quantitative primary clause is included for this HE target. Therefore this single clause cannot establish quantitative source coverage.',
        'partners': 'Preserve the whole0d59 LK-only HE paraben-use evaluation atom and exact historical edge. Preserve both quantitative child goals independently; do not substitute paraben quantitation for use or ascorbic-specific quantitation for paraben.',
        'remedy': 'Before approving a competence source route, provide and independently read an actual scoped general quantitative analytical clause and a partial role combining it with the paraben-use context. Retain actual method selection, plan-and-execute controls, calibration/stoichiometry, dilution and limitations; any finite model action is not a physical learner experiment.'
    }
]

program_notes = {
    '3351': ('BcP12/13.6.1–2', 'Plan, perform and document investigations of organism requirements, with safe species/nature-protecting execution. Enzyme and responsiveness examples remain in the primary. The goal describes the operator family, but its OR examples cannot assert that every listed example is mandatory or performed.'),
    '7b44': ('BcP12/13.4.5', 'Actually produce a selected pharmaceutical OR personal-care preparation and explain the chemistry. Synthesis, purification, purity/yield and safe documentation of own preparation in neighbouring LB4 clauses remain with their partners; a supplied recipe or data set does not certify real production.'),
    'dc4a': ('BcP12/13.4.6', 'Produce engineering/construction materials; test properties under equal/comparable conditions and judge applications from those findings. A paper comparison does not replace manufacture or controlled tests.'),
    'e5a5': ('C11.1.11', 'The actual page is Chemie11(NTG); the five literal social/cultural/technological/ecological/economic dimensions describe AND assess knowledge development. The goal retains historical context as a sixth authored dimension. Empirical validity is not societal agreement. The old b3c9 cluster also carries product/process/method impacts and sustainability via9f892; those duties are preserved and not closed by this route.'),
    'e6dc': ('BcP12/13.4.4', 'Practically apply preparation/refining food techniques AND explain biological and chemical foundations. Ordinary conceptual food-composition work does not satisfy practical use.'),
    'ebe2': ('BcP12/13.7.1–3', 'Use identification literature, including field organisms; plan AND conduct hypothesis-led field investigations to characterise communities and abiotic factors qualitatively AND quantitatively. Then laboratory OR manipulative field investigation studies environmental effects and habitat suitability. The whole goal asks field AND laboratory; retain that stronger authored whole duty without relabelling the original source alternative as universally requiring both.'),
    'fb41': ('BcP12/13.1.5', 'Convert investigation results into a subject/audience/situation-appropriate representation AND reflect on that representation. LB1 must be considered at suitable points in the selected Praktikum; this is not a mandate to perform all six content areas or every example.'),
    'fec1': ('BcP12/13.5.1–3', 'Choose preparation/microscopy procedures for cellular functional units, investigate materials microscopically, prepare AND microscope safely, document and draw labelled structures. The whole DE/EN goal retains all three operative families. A labelled supplied image does not demonstrate producing and operating a real preparation.'),
    'ffeb': ('BcP12/13.4.7', 'Combine selected materials into a functional system and justify possible applications. Actual system construction is retained; naming a battery or proposing a system is not evidence of construction.')
}

source_results = []
for i, (x, note) in enumerate(zip(content['items'], source_notes)):
    source_results.append({'goalId': x['goalId'], 'wholeInputBinding': {'input': bind(AUTHOR / 'five-whole-content-source-candidates.with-original-partners.author-input.json'), 'pointer': '/items/' + str(i)},
                           'wholeGoalDEENRead': True, 'wholeOriginalSourceAndPassageRead': True,
                           'allOriginalPartnersAndDescendantsRead': True, 'actualPrimaryTextAndPageViewRead': True,
                           **note, 'wholeSourceVerdict': 'HOLD', 'normalSourceRouteApproval': False,
                           'otherJurisdictionsOrCourseProfilesApproved': False, 'POrNativeApproval': False})

program_results = []
for i, x in enumerate(program['items']):
    label, operative = program_notes[x['goalId'][:4]]
    c11 = x['goalId'].startswith('e5a5')
    program_results.append({'goalId': x['goalId'], 'wholeInputBinding': {'input': bind(AUTHOR / 'nine-whole-goals.actual-official-program-boundaries.author-input.json'), 'pointer': '/items/' + str(i)},
                            'wholeDEENRead': True, 'allWholeRouteSourcesPassagesDecisionsRead': True,
                            'primarySpan': label, 'operatorsAndPartnerDutyLimits': operative,
                            'scientificContentCorrespondence': 'SUPPORTED_CONDITIONAL_COMPONENT',
                            'programApplicabilityVerdict': 'HOLD',
                            'reason': ('C11 NTG introductory-year source has unspecified course profile; later12/13 GA/EA and GK/LK cannot be inferred from goal tags or phase. The actual current route still has empty courseProfile/ordinaryScopes; no executable program metadata successor is present.' if c11 else 'The optional additional subject Biologisch-chemisches Praktikum can be selected for two terms of one year or all four terms, normally two weekly lessons subject to school availability. Per schoolyear at least3 of6 LB2–7 must be practical, with biology/chemistry balance; enumerated competencies are suggestions, not all universally mandatory. The current route still has empty courseProfile/ordinaryScopes. Goal GK/LK tags and BY/HE applicability do not author a chosen optional program or establish HE coverage.'),
                            'remedy': ('Author an explicit C11 NTG program/year/track binding without invented GA/EA; preserve original partner b3c9 and9f892 duties and all existing full-goal material/source holds. Then run actual ordinary source/Atlas checks on the complete universe.' if c11 else 'Author and independently review explicit optional-Praktikum program/year/duration/selected-content metadata with the ≥3of6 and balance rule, LB1 consideration and retained practical operators. Do not make all8 atoms universal ordinary Chemie-GK/LK targets. Provide any actual HE program primary separately. Then actual ordinary source/Atlas checks must run on the complete universe.'),
                            'realLearnerOrPhysicalExecutionEstablished': False, 'POrNativeApproval': False})

receipt = put('five-content-nine-program.actual-whole-value-and-reading.receipt.json', {
    'schemaVersion': 1, 'role': 'Own technical receipt subordinate to actual scientific reading', 'createdAt': NOW,
    'inputFIRST': bind(OWN / 'five-content-nine-program.independent-b.input.first.freeze.json'),
    'all22InputBytesStillExact': True, 'additionalActualRouteInputs': list(additional_inputs.values()),
    'content': counterchecks, 'program': program_checks, 'errors': errors,
    'actualPDFPagesReadAndViewed': [{'pdf': x['actualPrimary'], 'physicalPage': x['actualPhysicalPage']} for x in content['items']],
    'additionalPDFBindingRuleReadAndViewed': 'HE physical38: Q1.1–3 mandatory; Q1.5 is not universally compulsory.',
    'actualOfficialWholeTextRead': program['actualOfficialSources'],
    'freshOfficialWebVerification': ['https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biolog-chem-praktikum', 'https://www.gymnasiale-oberstufe.bayern.de/faecherwahl-und-belegung/individuelle-schwerpunktsetzung/faecher-des-zusatzangebots', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie'],
    'readMethod': 'Complete scientific descriptions DE/EN, all original clauses, full surrounding source groups, mapped partners/descendants and original decision reasons. Repeated raw/source/parent strings and12/13 passage text were compared; identical repetitions reuse the actual read, while source IDs/year/profile/decision fields remain separately bound. Large exploratory print calls truncated and were followed by targeted whole text and partner reads; no unseen truncated text is claimed.',
    'readScopeLimits': 'No new P/native/V review; own authored19 P is not independently reviewed. Unchanged other subjects/floors/registries/source originals are not written or re-reviewed.',
    'normalSourceQAExecuted': False, 'normalSourceApproval': False, 'sourceAtlas395Approved': False,
    'historical497Versus496FailurePreserved': True, 'expected395Lowered': False, 'expected496Changed': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False})

verdict = put('five-content-nine-program.independent-b.scientific-first.verdict.json', {
    'schemaVersion': 1, 'role': 'Independent B first semantic/source/program verdict; bounded inactive candidates only',
    'createdAt': NOW, 'reviewer': REVIEWER, 'reviewId': 'chem-b008-five-content-nine-program-independent-b-first-20261009',
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'generalizationLevel': 'G1',
    'freshIndependentPeerJudgmentsRead': False,
    'priorAuthorPrimaryHintDisclosed': input_first['priorAuthorPrimaryHintDisclosed'],
    'evidence': receipt, 'sourceResults': source_results, 'programResults': program_results,
    'BcPWholePrimaryBoundary': {'optionalAdditionalSubject': True, 'duration': 'one full year(two terms) or both years(four terms)', 'normallyWeeklyLessons': 2, 'schoolAvailabilityRequired': True,
                              'minimumPracticalContentAreasPerSchoolyear': 3, 'contentAreaUniverse': [2,3,4,5,6,7], 'biologicalChemicalBalance': True,
                              'enumeratedContentSuggestionsNotAllMandatory': True, 'generalLB1AtSuitablePoints': True, 'all8AtomsUniversalChemGKOrLK': False},
    'retention': {'allOriginalClausesAndEdges': True, 'allWholePartnerBodies': True, 'canonical504': True, 'expectedSourceAtlasUniverse': 395,
                  'historical497Vs496Failure': True, 'sixOtherMissingContentRoutes': content['sixOtherMissingContentRoutesStillOpen'], 'wholeSourceOrCourseApprovals': 0},
    'outcomeScope': 'Five bounded scientific source relationships judged; nine explicit program HOLDs. Paraben context supported but quantitative competence route remains HOLD without an actual general quantitative clause. Original source-family obligations remain whole HOLD; no normal source route or active Atlas closure.',
    'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})

md = OWN / 'five-content-nine-program.independent-b.scientific-first.md'
with md.open('x') as f:
    f.write('# Independent B: five content roles and nine program boundaries\n\n')
    f.write('Actual complete DE/EN goals, original clauses, all mapped partners/descendants, decisions, four PDF page images and three complete official program pages were read independently. Fresh peer judgments were not read.\n\n')
    f.write('The five relationships support bounded authored components or contexts. Quantitative paraben source coverage still needs an actual general quantitative clause; the paraben-use bullet alone is insufficient. Whole source groups remain HOLD. RP derivative examples belong to optional deepening. HE Q1.5 is outside universally compulsory Q1.1–3.\n\n')
    f.write('All nine program bindings remain HOLD: eight optional Praktikum routes and one C11 NTG route currently lack explicit course/scope metadata. Praktikum: one or two full years, normally two weekly lessons; per year practical work from at least three of six areas, with biological/chemical balance. Content lists are suggestions; LB1 is considered at suitable points. No universal all-eight Chemie-GK/LK obligation follows.\n\n')
    f.write('Original clauses/edges/partners are unchanged. No active writes, ordinary source QA, Atlas395 clearance, native/P/V approval, human claim or strict gain. The real497/496 ordinary failure remains historical and unresolved.\n')

entry = put('completed-five-content-nine-program.independent-b.entry.json', {
    'schemaVersion': 1, 'role': 'Completed neutral independent B handoff of actual source/program FIRST',
    'createdAt': NOW, 'reviewer': REVIEWER, 'inputFIRST': bind(OWN / 'five-content-nine-program.independent-b.input.first.freeze.json'),
    'scientificVerdict': verdict, 'actualReceipt': receipt, 'summary': bind(md),
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'strictGain': 0,
    'normalSourceApproval': False, 'sourceAtlas395Approved': False, 'nativeApproval': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})

outputs = [bind(p) for p in OWN.rglob('*') if p.is_file() and p.name != 'five-content-nine-program.independent-b.scientific-first.freeze.json']
freeze = put('five-content-nine-program.independent-b.scientific-first.freeze.json', {
    'schemaVersion': 1, 'role': 'Immutable independent B FIRST after actual complete scientific source/program reading',
    'createdAt': NOW, 'reviewer': REVIEWER, 'inputs': input_first['inputs'] + list(additional_inputs.values()),
    'outputs': outputs, 'freshIndependentPeerJudgmentsRead': False, 'noOriginalFirstRewritten': True,
    'strictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})
print(json.dumps({'completedEntry': entry, 'firstFreeze': freeze, 'outputs': len(outputs)}, indent=2))
