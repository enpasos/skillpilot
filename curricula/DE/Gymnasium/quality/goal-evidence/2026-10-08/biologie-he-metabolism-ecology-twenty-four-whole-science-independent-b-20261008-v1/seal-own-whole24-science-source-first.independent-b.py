from pathlib import Path
import hashlib
import json
import subprocess
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    with (OWN / name).open('x') as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write('\n')

now = datetime.now(timezone.utc).isoformat()
entry = read(AUTHOR / 'neutral-whole24-source-science-and-whole48-independent-review.author.entry.json')
first = AUTHOR / 'whole24-source-science-P14-author.first-input.freeze.json'
assert bind(first)['sha256'] == '7f3ead8c17cbc6752948e6120ca973038287669ab24467f887f72aa682ab5e8a'
assert bind(AUTHOR / 'neutral-whole24-source-science-and-whole48-independent-review.author.entry.json')['sha256'] == 'a3b7eaa3e6b4b1a5aedc7e16121115dd810d1caadc83bcfe05fbadbdd2b1a371'
source = read(AUTHOR / 'source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json')
proposals = read(AUTHOR / 'source/whole24.actual-primary-components-source-kind-operator-atom.author-proposals.json')['whole24Proposals']
case_input = read(AUTHOR / 'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json')
cases = case_input['cases']
profiles = read(AUTHOR / 'P24.whole48-complete-DEEN-author.candidates.json')['goals']
canon = read(AUTHOR / 'rebase-current/canonical.current476.exact.json')
goals = {g['id']: g for g in canon['goals']}
current_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current = {g['id']: g for g in read(current_path)['goals']}
context = read(AUTHOR / 'rebase-current/selected24.current-whole-goals.context.exact.json')
assert len(cases) == 48 and len(profiles) == 24 and len(source['sourceGoals']) == 45
assert sum(len(s['allPartnerRows']) for s in source['sourceGoals']) == 293
for goal in context['wholeGoals']:
    assert goals[goal['id']] == goal == current[goal['id']]
for item in context['contexts']:
    for field in ['wholePrerequisites', 'wholeParents', 'wholeConsumers']:
        for related in item[field]:
            assert goals[related['id']] == related
for c in cases:
    assert c['wholeCurrentGoal'] == goals[c['goalId']]
    assert c['scoring']['maximumPoints'] == 10
    assert len(c['scoring']['criteria']) == 5
    assert sum(x['points'] for x in c['scoring']['criteria']) == 10
    for lang in ['de', 'en']:
        assert ' '.join(x['criterion'][lang] for x in c['scoring']['criteria'][:4]) == c['modelResponse'][lang]
        assert c['scoring']['criteria'][4]['criterion'][lang] == c['freshTransfer']['modelResponse'][lang]
    assert c['evidence'] == {'level':'E1','maximumClaimScope':'G1','kind':'synthetic-author-witness','status':'ai_candidate','humanReviewStatus':'needs_human_review','humanTrial':False,'performedExperiment':False,'actualLearnerPerformance':False}
    assert c['freshTransfer']['performed'] is False
    assert c['freshTransfer']['independentAdministrationRequired'] is True
    assert c['freshTransfer']['releaseModelOnlyAfterSubmission'] is True

profile_checks = []
for ordinal, candidate in enumerate(profiles, 1):
    pair = cases[(ordinal-1)*2:ordinal*2]
    profile = candidate['profile']
    assert candidate['goalId'] == entry['goalIds'][ordinal-1]
    assert candidate['evidenceLevel'] == 'E1' and candidate['maximumClaimScope'] == 'G1'
    core, transfer = profile['expectations']
    coverage = profile['coverageExpectations']
    assert coverage == {'requiredExpectationIds':[core['id'],transfer['id']],'alternativeExpectationGroups':[],'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True}
    for lang, suffix in [('de','De'),('en','En')]:
        assert core['essentialUnderstanding'+suffix] == ' '.join(x['criterion'][lang] for x in pair[0]['scoring']['criteria'][:2])
        assert transfer['essentialUnderstanding'+suffix] == ' '.join(x['criterion'][lang] for x in pair[1]['scoring']['criteria'][2:4])
        assert core['observablePerformance'+suffix] == pair[0]['task'][lang]
        assert transfer['observablePerformance'+suffix] == pair[1]['task'][lang]+' '+pair[1]['freshTransfer']['task'][lang]
        delimiter = ' Gegenkontext: ' if lang == 'de' else ' Contrasting context: '
        assert profile['variationAxes'][0]['text'+suffix] == pair[0]['material'][lang]+delimiter+pair[1]['material'][lang]
        for c, brief in zip(pair, profile['applicationCaseBriefs']):
            assert brief['id'] == c['caseId']
            intro = ' Frischer, getrennt zu beantwortender Konzepttransfer: ' if lang == 'de' else ' Fresh concept transfer, answered separately: '
            assert brief['taskDemand'+suffix] == c['material'][lang]+' '+c['task'][lang]+intro+c['freshTransfer']['task'][lang]
            assert brief['expectedPerformance'+suffix] == c['modelResponse'][lang]+' Transfer: '+c['freshTransfer']['modelResponse'][lang]
            assert brief['understandingFocus'+suffix] == core['essentialUnderstanding'+suffix]+' '+transfer['essentialUnderstanding'+suffix]
    profile_checks.append({'ordinal':ordinal,'goalId':candidate['goalId'],'wholeTwoDEENCasesAndFreshTransfersBoundExactly':True,'archetypeActuallyRead':profile['archetype'],'wholeExpectationsAndObservablePerformanceActuallyRead':True,'technicalDuplicationCheckIsNotScienceApproval':True})
write('actual-whole24-current-context-whole48-and-full24-profile-bindings.independent-b.json', {
    'schemaVersion':1,'checkedAt':now,'currentCanonicalObserved':bind(current_path),'frozenCanonical':bind(AUTHOR/'rebase-current/canonical.current476.exact.json'),
    'wholeCurrentSelected24BodiesEqual':True,'allFrozenWholeContextsBound':True,'whole48DEENModelsRubricsAndFreshTransfersActuallyRead':True,
    'rubricSentenceIdentityAndTenPointTotals':True,'profiles':profile_checks,'checksDoNotReplaceScienceReview':True,'currentPeerRead':False,'activeWrites':0})

# Complete bounded original pages really read by this reviewer. Raw ignored PDFs
# are observations, not portable operative inputs; retain actual full TXT bytes.
pdf_pages = [
    ('BB', 'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf', [29,30]),
    ('BE', 'curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf', [29,30]),
    ('MV', 'curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf', [20,21,22]),
    ('NW', 'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf', [21,22,29,30,31]),
    ('SH', 'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Biologie_Sekundarstufe_2023_barrierearm.pdf', [26,27,28,33]),
    ('SN', 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf', [37,38,39]),
    ('ST', 'curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf', [28,29,30,31,32,33,34,35,36,37]),
    ('TH', 'curricula/DE/Gymnasium/input/TH/LP_GY_Biologie_2024.pdf', [23,24,26,27])]
primary_dir = OWN / 'whole-official-primary-pages'
primary_dir.mkdir(exist_ok=False)
primary_receipts=[]
for region, relative, numbers in pdf_pages:
    raw = ROOT / relative
    doc = next(s['sourceDocument'] for s in source['sourceGoals'] if s['sourceDocument'].get('path',s['sourceDocument'].get('localPath')) == relative)
    for page in numbers:
        argv = ['pdftotext','-f',str(page),'-l',str(page),'-layout',relative,'-']
        started=datetime.now(timezone.utc).isoformat()
        result=subprocess.run(argv,cwd=ROOT,capture_output=True,check=False)
        assert result.returncode==0
        path=primary_dir/f'{region}-physical-page-{page:03}.whole-original.txt'
        with path.open('xb') as stream: stream.write(result.stdout)
        stderr=primary_dir/f'{region}-physical-page-{page:03}.stderr.actual.txt'
        with stderr.open('xb') as stream: stream.write(result.stderr)
        primary_receipts.append({'region':region,'physicalPage':page,'argv':argv,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,
            'localOriginalPdfObservation':{'path':relative,'sha256':bind(raw)['sha256'],'bytes':raw.stat().st_size,'operativePortableInput':False},'officialUrl':doc['url'],'wholeText':bind(path),'stderr':bind(stderr),
            'actualWholeBoundedPageRead':True,'notNormalizedExtractionOrSearchSnippet':True,'notNewApprovalOfOtherUnchangedHistoricalGoals':True})
write('actual-regional-original-whole-page-reading.independent-b.receipt.json', {'schemaVersion':1,'checkedAt':now,'wholeOriginalBoundedPageReads':primary_receipts,
    'HEWholeActualPrimaryPages':bind(OWN/'actual-preparatory-whole-primary-pages.independent-b.receipt.json'),
    'BYActualFullBoundedOfficialReading':['BY13EA/GA LB1.1-1.4,LB3.1-3.3,LB4.1-4.3','BY12GA LB3.1-3.2 and LB4'],
    'BYPortableWholeTexts':[bind(AUTHOR/'primary'/f) for f in ['BY13-EA-official.actual-text.txt','BY13-GA-official.actual-text.txt','BY12-GA-official.actual-text.txt']],
    'rawIgnoredPdfHtmlRequired':False,'webRefreshClaim':False,'currentPeerRead':False,'activeWrites':0})

findings=[
    {'findingId':'BIO24-B-S01-BY-PLANT-CONSEQUENCES','ordinal':1,'lane':'source_operator','sourceGoalId':'b342744e-60c2-5ce2-b281-5eb19943a1ce','status':'HOLD',
     'actualDefect':'The full BY EA/GA factor competency also requires judging consequences for wild/crop plants. The sole exact mapped whole goal explains reactions/factors. The two present cases do not require a concrete plant/crop consequence judgment.',
     'minimalRequiredChange':'Retain the whole original duty; add a bounded plant/crop consequence judgment and its expectation to the actual witness or establish a reviewed scope-preserving partner role. Do not erase the operator or mark a link universal.'},
    {'findingId':'BIO24-B-S02-BY-COMPARISON','ordinal':2,'lane':'source_operator','sourceGoalId':'b1a59da6-a2e7-5cb1-94ae-84d59a40f303','status':'HOLD',
     'actualDefect':'The sole exact BY partner must also compare respiration with photosynthesis and derive fundamental metabolic principles. Current P2 discusses respiration and pathway inhibition, not that comparison.',
     'minimalRequiredChange':'Preserve the comparison/derivation operator and close it with a concrete material-based case/expectation or a genuinely reviewed partner. A generic predecessor link alone does not discharge it.'},
    {'findingId':'BIO24-B-S03-BY-CHROMATOGRAPHY','ordinal':3,'lane':'source_operator','sourceGoalId':'2cc41e62-ec79-5add-9d43-2499b4e147b2','status':'HOLD',
     'actualDefect':'The full BY EA/GA primary explicitly requires chromatographic separation. Both partial partners were read: light-harvesting explanation and fc89ed54 light-dependence demonstration. Neither whole goal requires chromatographic separation; their union leaves the original method duty open.',
     'minimalRequiredChange':'Keep both useful bounded explanatory partners and explicitly preserve/map the chromatographic-method duty. Do not call theoretical pigment explanation the actual separation operation.'},
    {'findingId':'BIO24-B-P05-CAM-MATERIAL','ordinal':5,'lane':'P_material_and_transfer','caseId':'he-metabolism-ecology24-05-case-1','status':'HOLD',
     'actualDefect':'The separate fresh transfer asks how CAM differs while no supplied material establishes CAM temporal organization. HE/BY C4 components do not impose a new CAM prior-knowledge quota.',
     'minimalRequiredChange':'Supply the CAM temporal organization explicitly in the fresh material, or use a variation derivable from the current C4 material. Keep the rest of both valid C4 cases.'},
    {'findingId':'BIO24-B-A08-PRACTICAL-SCOPE','ordinal':8,'lane':'A_source_P_scope','status':'HOLD',
     'actualDefect':'Whole goal combines explanation of both fermentation routes with experimental investigation. Both witnesses ask explanation/design/interpretation and acknowledge absent execution; practical manipulation/protocol performance is not represented sufficiently. This is a genuine separate procedural assessment axis, not a keyword test.',
     'minimalRequiredChange':'Obtain a scope-preserving atomicity decision for conceptual and procedural duties, or define a genuinely integrated investigation witness that covers its observable procedure/protocol. Keep mandatory practical operators. No performed learner experiment or human approval is a prerequisite to this machine QA decision.'},
    {'findingId':'BIO24-B-P12-QA-META','ordinal':12,'lane':'P_scoring','caseId':'he-metabolism-ecology24-12-case-1','criterionId':'c4','status':'HOLD',
     'actualDefect':'A 2-point biological criterion includes the statement that this is not a named official metapopulation requirement. That is reviewer metadata, not goal-specific learner performance.',
     'minimalRequiredChange':'Remove the curricular metadata sentence from answer/rubric and operative P expectation, keeping its scientific model-boundary reasoning and the metadata in the separate QA dossier.'},
    {'findingId':'BIO24-B-A16-INDEPENDENT-AXES','ordinal':16,'lane':'A_source_P_scope','status':'HOLD',
     'actualDefect':'Endocrine receptor activity and persistence/food-chain burden are independently variable mechanisms. The full original names hormone-like environmental substances, not a separate persistent-pollutant quota. The actual cases correctly separate A/B properties, but the joined whole competence still needs a scope-preserving decision.',
     'minimalRequiredChange':'Resolve the compound via genuinely reviewed reusable duties or a scope-preserving split/integrated risk-assessment decision. Preserve both axes and current denominator truth until integration.'},
    {'findingId':'BIO24-B-P16-QA-META','ordinal':16,'lane':'P_scoring','status':'HOLD',
     'actualDefect':'Both whole cases and P expectations ask learners to identify official-source and atomicity/compound-HOLD boundaries. These are curriculum-review decisions rather than observable biology competence.',
     'minimalRequiredChange':'Move source/class/atomicity audit statements outside learner material/task/model/scoring/P; retain scientific receptor/exposure/persistence reasoning.'},
    {'findingId':'BIO24-B-P17-QA-META','ordinal':17,'lane':'P_scoring','caseId':'he-metabolism-ecology24-17-case-2','criterionId':'c4','status':'HOLD',
     'actualDefect':'The 2-point criterion and transfer expectation include that metapopulation is an author elaboration. This is not a learner-science performance criterion.',
     'minimalRequiredChange':'Remove only that metadata from answer/rubric/P, retaining habitat quality, distance and species-specific model limits.'},
    {'findingId':'BIO24-B-P19-QA-META','ordinal':19,'lane':'P_scoring','caseId':'he-metabolism-ecology24-19-case-1','criterionId':'c4','status':'HOLD',
     'actualDefect':'The learner criterion includes that this data-model elaboration is not a named official bioinformatics point. Scientific data validation is appropriate; official-point classification is reviewer metadata.',
     'minimalRequiredChange':'Remove the curricular sentence from answer/rubric and bound P case, keeping uncertainty, held-out validation and no unjustified extrapolation.'},
    {'findingId':'BIO24-B-S41-ST-PRACTICAL-UNION','ordinal':2,'lane':'retained_regional_union_boundary','status':'HOLD_OF_COMPLETE_UNION_CLAIM',
     'sourceOrdinal':41,'actualDefect':'Actual whole ST p30-31 requires yeast fermentation experiments under different conditions to be planned, performed and recorded; temperature is a compulsory experiment. The retained union has explanatory microbial and human-glucose-comparison partners, but none of its whole bodies requires that yeast-temperature procedure.',
     'minimalRequiredChange':'Preserve those bounded partners and the actual original practical obligation; do not count this Bio24 respiration witness as a new completion of the whole ST union. A separate duty must remain visible pending genuine scope-preserving remediation.'}]
write('whole24-concrete-first-findings.independent-b.json',{'schemaVersion':1,'reviewer':'codex-independent-b-flora_fauna','reviewedAt':now,'findings':findings,'currentPeerRead':False,'authorLabelsAreNotVerdicts':True,'activeWrites':0,'humanApproval':False,'humanTrial':False,'strictGainClaimed':0})

# Reviewer-authored substantive reasoning, after actual complete case reading.
reasoning=[
 ('Thylakoid ATP/NADPH and stromal fixation/reduction/regeneration are distinguished correctly; controlled light/CO2 limitations and net versus gross/respiration transfers test causal boundaries.','One coherent coupling/factor explanation; no source-derived extra plant judgment is silently claimed.'),
 ('Cytosolic glycolysis, mitochondrial oxidative decarboxylation/TCA/chain, carbon and NAD regeneration are consistent; short-lived glycolytic ATP does not prove intact chain, and anaerobic regeneration does not restore normal mitochondrial respiration.','One route-coupling competence; the missing BY comparison is kept separate.'),
 ('Antenna proteins/pigments transfer excitation rather than the same electron; reaction-center charge separation is distinct from downstream ATP synthesis. Absorption versus action spectra and limited wavelength advantages are correctly distinguished.','One structural-functional antenna competence; chromatography remains a separate source method.'),
 ('Water replacement at PSII, two excitations, intermediate energy transfer, NADPH and proton-gradient ATP are consistent. Cyclic PSI produces neither net NADPH nor O2 and cannot replace linear reducing power.','One energetic representation/interpretation of light reactions.'),
 ('C4 spatial PEPC-to-bundle Rubisco concentration reduces oxygenation at an additional ATP cost; hot/dry and low-light examples correctly refute universal superiority. Raised C3 CO2 can reduce the comparative benefit.','One C3/C4 mechanism/adaptation comparison; unsupported CAM transfer held.'),
 ('13CO2 pulse/pulse-chase tracks carbon compounds, not the oxygen gas signal. Timing, quenching, separation, pool size versus label fraction and absolute labeled amount are interpreted conservatively.','One tracer-based pathway-reconstruction explanation; actual current English is awkward but still asks explanation, not performing a radioisotope experiment.'),
 ('I/III/IV pumping versus II entry is represented consistently; terminal O2 and a proton gradient couple transport to ATP. Uncoupling separates O2 consumption/heat from ATP, unlike full electron-flow blockade.','One energetic chain-coupling modeling competence.'),
 ('Both fermentations regenerate NAD+ and allow glycolytic ATP; alcoholic CO2 versus lactate formation, specific product controls and nonspecific pH are biologically sound. Supplied observations are honestly not personal performance.','Separate conceptual and observable procedural axes remain unresolved; old generic atomic label is not decisive.'),
 ('Independent temperature/concentration/strain variables, matched starts, blanks, replicates and cell-density normalization are appropriate. Highest tested temperature is not a universal optimum; substrate inhibition/osmotic hypotheses need separate tests.','Plan and interpretation form one coherent investigation-design competence. It does not discharge an original perform/protocol duty.'),
 ('Agonist/antagonist/receptor controls support the supplied mechanism without equating a reporter with population effects. Timing of developmental exposure and delayed reproductive endpoints refute dose-total or adult-negative shortcuts.','One mechanistic explanation of hormone-like substances; no real animal exposure is required or claimed.'),
 ('Comparable body/trophic concentrations support the stated accumulation pattern, with intake/slow loss distinct from food-chain magnification. Within-individual time increase is not trophic proof; tissue/age comparability and exposure matter.','One accumulation mechanism/comparison competence; named mandatory primary claim excluded.'),
 ('Patch loss0.4 plus colonization1.2 gives expected4.8; a realized patch count is integer. External-pool colonization is distinguished from an occupancy-dependent model; identical random seed is reproduction, not independent sampling.','One stochastic population-model application; scientific reasoning valid, curricular grading metadata held.'),
 ('Reproductive isolation, diagnostic morphology and lineage criteria conflict legitimately; cryptic species, asexual/fossil limits, gene-tree versus species history and occasional hybrids are treated without automatic species conclusions.','One criterion-comparison competence; all three names are an authored elaboration of the bounded original species context.'),
 ('Relative contributions1/2/4 normalize to.25/.5/1 with s.75/.5/0. Survival times surviving-offspring production gives A1.6/B2.4, relative2/3 and s1/3; eggs alone do not show surviving reproductive contribution.','One quantitative fitness-curve interpretation; no mandatory named fitness-curve bullet invented.'),
 ('Restoration first addresses cause, food and habitat; reintroduction/genetic/pathogen risks, recruitment monitoring, control evidence and values are separate. A connectivity remedy is conditional on actual species and pathogen context.','One evidence-based restoration/reintroduction assessment, a bounded method for original ecosystem management.'),
 ('Short-lived receptor-active A and persistent reporter-negative B separate endocrine action from fate/burden. Adult-negative assays do not exclude developmental effects. This sound distinction does not by itself unify the separate whole competence axes.','Needs a scope-preserving atomicity/source decision; reviewer-HOLD metadata is also unsuitable learner evidence.'),
 ('Lambda1.2 source and.8 sink are distinct from observed occupancy sustained by migration; source surplus, distance, habitat quality and absent external source constrain colonization. Corridors cannot guarantee unlimited growth when all local rates are below1.','One source/sink/colonization model; internal curricular elaboration wording is excluded from learner scoring.'),
 ('Forward threshold6/recovery3 establish hysteresis; the state at4 depends on history. Feedback/soil-water-vegetation cases support preventive or coordinated intervention without inferring an exact universal tipping threshold.','One tipping-feedback interpretation and consequent management response.'),
 ('Predictions95/75/55 and residuals−1/+2/−1 are correct. Independent data, units, area normalization, missing-data handling, fit versus causation and unphysical extrapolation are substantively tested.','One simple data-model application; not a mandatory named bioinformatics curriculum point.'),
 ('Equal-weight means50/55, worst values20/50 and costs10/14 show distinct criteria; .9/.1 weighting changes the preference and is not a probability claim without assumption. Species-inaccessible corridors require changed recommendations.','One conditional scenario-management comparison with transparent ecological and value criteria.'),
 ('Rubisco oxygenation forms a C2 salvage substrate; recovery involves multiple organelles, energy and CO2 loss. C4 concentration and salvage function are not identical; blocking salvage does not stop oxygenation or remove all carbon loss.','One photorespiration mechanism/significance competence, bounded by C4 and Calvin original context.'),
 ('ATP/NADPH supply, light-linked redox activation, CO2 supply and temperature are separate controls. Light-independent does not mean unlimited nighttime fixation, and lower net uptake under increased respiration is not a Calvin-regulation measurement.','One regulatory analysis; enzyme-level context is genuine, a named redox-control quota is not claimed.'),
 ('Acetyl-CoA connects anabolic/catabolic routes; ATP demand and reversible feedback govern branches. S/A/B/P/Q are explicit model substances; limited capacity prevents an unsupported numeric flux conclusion and inhibition relief needs no mutation.','One network/regulatory-node representation and interpretation.'),
 ('Immediate resistance and recovery over time are distinguished for the supplied function. Functional resources, response diversity, shared correlated threats, bottlenecks, time horizon and monitored adaptation limit species-count shortcuts.','One resilience-based management competence, explicitly authored elaboration rather than a named mandatory primary.'),
]
held={1,2,3,5,8,12,16,17,19}
rows=[]
M=read(AUTHOR/'AM/M.selected24.current-row-decisions-and-author-limit.json')['wholeSelectedRows']
A=read(AUTHOR/'AM/A.selected24.current-row-decisions-and-author-limit.json')['wholeSelectedRows']
for ordinal,(scientific,atomic) in enumerate(reasoning,1):
    ident=entry['goalIds'][ordinal-1]
    proposal=proposals[ordinal-1]
    primary_checks=[]
    for component in proposal['actualPrimaryComponents']:
        page=ROOT/component['wholeOriginalPagePath']
        lines=page.read_text().splitlines()
        actual='\n'.join(lines[component['firstTextLine1Based']-1:component['lastTextLine1Based']])
        assert actual==component['originalText']
        assert 'sha256:'+bind(page)['sha256']==component['wholeOriginalPageSha256']
        primary_checks.append({'recordId':component['recordId'],'wholePage':bind(page),'exactOriginalText':component['originalText'],'courseScope':component['actualOriginalCourseScope'],'wholeHeaderActuallyRead':True})
    rows.append({'ordinal':ordinal,'goalId':ident,'wholeCurrentGoal':goals[ident],
        'ownVerdict':'HOLD' if ordinal in held else 'KEEP_SCIENCE_SOURCE_CANDIDATE',
        'wholeTwoDEENCasesAndFreshTransfersRead':[c['caseId'] for c in cases[(ordinal-1)*2:ordinal*2]],
        'substantiveScientificReason':scientific,'semanticAtomicityReason':atomic,
        'atomicityDecision':'needs_developer_review' if ordinal in {8,16} else 'retain_current_atomic',
        'sourceKindDecision':'HOLD_COMPOUND' if ordinal in {8,16} else 'approve_bounded_proposal_only',
        'boundedSourceKind':proposal['proposedSourceKind'],'actualOriginalTopic':proposal['proposedActualPrimaryTopic'],
        'primaryComponentsActuallyRead':primary_checks,'mandatoryNamedWholeGoal':False,'normalizedNumberIsOfficialQuote':False,
        'PScienceVerdict':'HOLD' if ordinal in {5,8,12,16,17,19} else 'KEEP_current_whole_goal_scope',
        'PRegionalSourceComplete':False if ordinal in {1,2,3,8,16} else 'bounded_source_kind_only_pending_native_D_V',
        'findingIds':[x['findingId'] for x in findings if x.get('ordinal')==ordinal],
        'unchangedHistoricalAMRecords':{'A':next(r for r in A if r['goalId']==ident),'M':next(r for r in M if r['goalId']==ident)},
        'memoryDecision':'retain_current_no_memory_needed','memoryReason':'The whole unchanged goal assesses causal explanation, model/data application or reasoned assessment. Its current no-memory decision is retained, not bulk newly authored; no new card or visibility obligation is introduced.',
        'D_V_status':'pending_actual_raster_native_review','evidenceLevel':'E1','maximumClaimScope':'G1','reviewAuthority':'ai_candidate','humanReviewStatus':'needs_human_review'})
write('whole24-whole48-science-source-P-A-M.independent-b.first.verdicts.json',{
    'schemaVersion':1,'reviewer':'codex-independent-b-flora_fauna','reviewedAt':now,'role':'Own complete first blind whole-goal Science/Source/P review; no raster/D/V release',
    'authorFirstSeal':bind(first),'currentPeerRead':False,'whole24GoalCount':24,'whole48CaseCount':48,
    'entries':rows,'scienceSourceCandidateClearOrdinals':sorted(set(range(1,25))-held),'scienceSourceCandidateHeldOrdinals':sorted(held),
    'ownPScienceClearCount':18,'ownOverallClearCandidateCount':15,'nativeD_VApproved':0,'performedExperiments':0,'actualLearnerEvidence':False,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0,
    'whole144Reviewed':False,'originalEvolution18SourceV3GenuineBaselineRetained':True,'originalFull144NeuroGK2HoldRetained':True})

source_reviews=[]
BY_holds={'b342744e-60c2-5ce2-b281-5eb19943a1ce':'BIO24-B-S01-BY-PLANT-CONSEQUENCES','b1a59da6-a2e7-5cb1-94ae-84d59a40f303':'BIO24-B-S02-BY-COMPARISON','2cc41e62-ec79-5add-9d43-2499b4e147b2':'BIO24-B-S03-BY-CHROMATOGRAPHY'}
for index,s in enumerate(source['sourceGoals'],1):
    original=s['wholeRetainedExtractionGoal']; ident=original['id']; partners=s['allPartnerRows'];selected=[r['canonicalGoalId'] for r in partners if r['canonicalGoalId'] in entry['goalIds']]
    if index in [1,3]:
        reason='Full BB/BE original3.2 permits ecological photosynthesis/energy/cycle component roles. The seven partner union is preserved; advanced light/Calvin detail is not claimed as named lower-stage compulsory wording.'
    elif index in [2,4]:
        reason='Full BB/BE3.3 names the principle of cellular energy conversion. Aerobic/anaerobic detail in the normalized row is a bounded author elaboration, not an exact original quotation; all three explanatory partners remain, with no compulsory glycolytic/TCA quota inferred.'
    elif 5<=index<=11:
        reason='Full actual BY EA/GA original competency and its complete operator chain were read against every original partner. Named experimental separation, plant consequences and respiration comparison are not replaced by generic links.'
    elif 12<=index<=35:
        proposal=proposals[index-12]
        reason=f"HE normalized row is not an official literal numbered quote. Actual whole-page components support {proposal['proposedSourceKind']} in {proposal['proposedActualPrimaryTopic']}; original GK/LK scope and named-versus-method distinctions are preserved."
    elif index==36:
        reason='Actual MV class8 original distinguishes assimilation/dissimilation and fermentation/respiration as energy processes, with separate circulation/gas-exchange bodies. Current1/2 are explanatory partial roles; no advanced full-goal or entire17-partner fresh approval is claimed.'
    elif index in [37,38]:
        reason='Actual NW IF1/4 requires photosynthesis principle and its significance; IF4 also juxtaposes respiration, ecological cycles and historical-experiment explanation. The broad union and method partners remain; a current advanced explanatory goal is only its bounded component.'
    elif index==39:
        reason='Actual SH SE5/6 covers photosynthesis/respiration connection, carbon/energy/ecology; SE1-4 and SE7-8 remain separate system and sustainability partner duties. Current1/2 supply bounded explanatory components, not a full28-partner or named molecular quota approval.'
    elif index==40:
        reason='Actual SN class9 distinguishes linked light reactions, respiration, equations, reaction conditions and plant significance, plus specific measurement/microscopy operations. The selected explanation roles are partial; retained practical partners are not upgraded from written material.'
    elif index==41:
        reason='Actual ST microorganisms duty includes planning, performing and recording yeast-fermentation experiments and compulsory temperature variation. The complete retained20-partner union has no whole procedural yeast-temperature goal; theoretical human-glucose comparison does not close it.'
    elif index==42:
        reason='Actual ST human system duty names energy provision for muscle and complete human-system partners; only a bounded respiration component is assigned to current2. Separate nutrient/breathing experiments and reproductive duties are preserved without a new whole-union approval.'
    elif index==43:
        reason='Actual ST plant systems has photosynthesis/environmental factors, plant-water experiments, harvest-data interpretation and agricultural measures. Current1 is a bounded reaction/factor explanatory partner; those practical/crop-evaluation operations stay separate and are not discharged by its present P1.'
    elif index==44:
        reason='Actual TH human pages explicitly require respiration equations/oxygen-energy meaning alongside separate systems and practical work. Current2 is a bounded mechanism component; all54 other original partner obligations remain unchanged, with no full human-union approval inferred.'
    else:
        reason='Actual TH plant/fungal pages include photosynthesis factor/yield measures, respiration/storage measures, yeast fermentation and practical product detection. Current1/2 are partial reaction explanations; yield/storage/practical operators cannot disappear through a broader label or be counted as witnessed by this candidate.'
    status='HOLD_source_operator' if ident in BY_holds or index==41 else 'retain_bounded_component_and_all_other_partner_duties'
    if 12<=index<=35 and index-11 in [8,16]: status='HOLD_compound_source_atom'
    source_reviews.append({'sourceOrdinal':index,'sourceKey':s['sourceKey'],'sourceGoalId':ident,'wholeSourceRow':original,'sourceInput':bind(ROOT/s['sourceExtractionPath']),
        'mappingInput':bind(ROOT/s['mappingPath']),'everyOriginalPartnerRow':partners,'everyPartnerWholeBodyBoundAgainstCurrentCanonical':True,
        'selectedCurrentGoalIds':selected,'ownScopedVerdict':status,'ownSubstantiveReason':reason,'newWholeOtherHistoricalPartnerScienceApproval':False,
        'findingId':BY_holds.get(ident),'officialNormalizedQuoteClaim':False,'operatorDeletionAuthorized':False})
write('whole45-duty-all293-original-partners.independent-b.first.verdicts.json',{'schemaVersion':1,'reviewedAt':now,'reviewer':'codex-independent-b-flora_fauna','wholeDutyCount':45,'allPartnerRowCount':293,
    'actualReadUniquePartnerWholeGoals':len({r['canonicalGoalId'] for s in source['sourceGoals'] for r in s['allPartnerRows']}),'entries':source_reviews,
    'reviewBoundary':'Every source row and all original roles/whole partner bodies inspected; retained historical P/D/A/M/V science not restarted. Whole original bounded affected primaries read. No all-partner approval, no erasure of regional operators.',
    'currentPeerRead':False,'full144Approval':False,'activeWrites':0,'humanApproval':False,'humanTrial':False})

author_seal=read(first)
portable=read(ROOT/author_seal['requiredPortableInputs']['path'])['requiredFiles']
required=author_seal['ownFiles']+portable+[bind(first)]
by_path={b['path']:b for b in required}
for b in by_path.values():
    assert bind(ROOT/b['path'])==b
own_files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('whole24-whole48-source-science-independent-b.first.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),
    'kind':'First independent blind complete Science/Source/P/A/M verdict; no raster/native D/V approval',
    'files':sorted(by_path.values(),key=lambda x:x['path'])+own_files,'ownAuthorEntry':bind(AUTHOR/'neutral-whole24-source-science-and-whole48-independent-review.author.entry.json'),
    'currentPeerRead':False,'ownClearCandidateOrdinals':sorted(set(range(1,25))-held),'ownHeldCandidateOrdinals':sorted(held),'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'ownFirstSeal':bind(OWN/'whole24-whole48-source-science-independent-b.first.freeze.json'),'ownClearCandidateOrdinals':sorted(set(range(1,25))-held),'ownHeldCandidateOrdinals':sorted(held),'caseCount':48,'sourceDutyCount':45,'partnerCount':293,'currentPeerRead':False},ensure_ascii=False,indent=2))
