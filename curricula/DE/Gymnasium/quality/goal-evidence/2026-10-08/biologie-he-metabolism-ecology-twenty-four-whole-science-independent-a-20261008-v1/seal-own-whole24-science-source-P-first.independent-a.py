#!/usr/bin/env python3
"""Record personally read scientific judgments; technical assertions are distinct."""
import hashlib
import json
import pathlib
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OWN = pathlib.Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1'
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(path.read_text())

def relative(path):
    return str(path.relative_to(ROOT))

def binding(path):
    data = path.read_bytes()
    return {'path': relative(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, value):
    with (OWN / name).open('x') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')

first_path = AUTHOR / 'whole24-source-science-P14-author.first-input.freeze.json'
entry_path = AUTHOR / 'neutral-whole24-source-science-and-whole48-independent-review.author.entry.json'
assert binding(first_path)['sha256'] == '7f3ead8c17cbc6752948e6120ca973038287669ab24467f887f72aa682ab5e8a'
assert binding(entry_path)['sha256'] == 'a3b7eaa3e6b4b1a5aedc7e16121115dd810d1caadc83bcfe05fbadbdd2b1a371'
first = read(first_path)
portability_path = AUTHOR / 'checks/first-author-whole24-required-portability-and-genuine-baseline-history.actual.json'
portability = read(portability_path)
dependencies = {r['path']: r for r in first['ownFiles'] + portability['requiredFiles'] + [binding(first_path), binding(entry_path), binding(portability_path)]}
for row in dependencies.values():
    assert binding(ROOT / row['path']) == {**row, 'sha256': row['sha256'].removeprefix('sha256:')}, row['path']
paths = sorted(dependencies)
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(paths)+'\n', text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout and not ignored.stderr
assert not any((ROOT / path).is_symlink() and not (ROOT / path).exists() for path in paths)

whole_path = AUTHOR / 'rebase-current/selected24.current-whole-goals.context.exact.json'
cases_path = AUTHOR / 'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json'
profiles_path = AUTHOR / 'P24.whole48-complete-DEEN-author.candidates.json'
source_path = AUTHOR / 'source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json'
proposals_path = AUTHOR / 'source/whole24.actual-primary-components-source-kind-operator-atom.author-proposals.json'
whole = read(whole_path)
cases = read(cases_path)['cases']
profiles = read(profiles_path)['goals']
sources = read(source_path)
proposals = read(proposals_path)['whole24Proposals']
assert len(whole['wholeGoals']) == len(profiles) == len(proposals) == 24 and len(cases) == 48
assert len(sources['sourceGoals']) == 45 and len(sources['matchedEdgesData']) == 50
assert sum(len(s['allPartnerRows']) for s in sources['sourceGoals']) == 293
profile_by_id = {p['goalId']: p for p in profiles}
for case in cases:
    for language in ['de', 'en']:
        assert ' '.join(c['criterion'][language] for c in case['scoring']['criteria'][:4]) == case['modelResponse'][language]
        assert case['scoring']['criteria'][4]['criterion'][language] == case['freshTransfer']['modelResponse'][language]
    assert sum(c['points'] for c in case['scoring']['criteria']) == case['scoring']['maximumPoints'] == 10
    assert case['evidence']['status'] == 'ai_candidate' and case['evidence']['humanReviewStatus'] == 'needs_human_review'
    assert case['evidence']['performedExperiment'] is False and case['evidence']['actualLearnerPerformance'] is False
    prof = profile_by_id[case['goalId']]['profile']
    brief = next(b for b in prof['applicationCaseBriefs'] if b['id'] == case['caseId'])
    for lang, suffix in [('de', 'De'), ('en', 'En')]:
        assert brief['taskDemand'+suffix] == case['material'][lang]+' '+case['task'][lang]+(' Frischer, getrennt zu beantwortender Konzepttransfer: ' if lang == 'de' else ' Fresh concept transfer, answered separately: ')+case['freshTransfer']['task'][lang]
        assert brief['expectedPerformance'+suffix] == case['modelResponse'][lang]+' Transfer: '+case['freshTransfer']['modelResponse'][lang]

reasons = {
 1:'Light-dependent ATP/NADPH supply and stromal fixation/reduction/regeneration are coupled correctly. Both contexts distinguish limiting CO2/light, brief reserves, respiration and net/gross flux; dark reaction is not a night-only process.',
 2:'C6 -> two C3 -> two C2 plus two CO2 -> four cycle CO2 is correct; locations, terminal O2, NAD+ regeneration and indirect inhibition are causally distinguished. Neither mitochondrial CO2 nor an ATP residual is confused with terminal oxygen reduction.',
 3:'Pigment/protein antenna transfers excitation energy to reaction-center charge separation, rather than creating ATP directly or transporting an antenna electron to NADPH. Absorption and action spectra and conditional wavelength benefit are correctly separated.',
 4:'Two photon-driven energy elevations, PSII water electrons, intervening proton coupling, PSI reduction and a closed cyclic ATP-producing route are consistent; cyclic electron return does not simultaneously export net NADPH/O2.',
 5:'Mesophyll initial C4 fixation and bundle-sheath CO2 concentration are spatially coupled; ATP trade-off, C3 environmental comparison, photorespiration and CAM temporal distinction are accurate conditional explanations.',
 6:'Carbon-isotope pulse/chase, short-time compound identification, rapid quenching, carbon pool mass/fraction and limits of first-label inference are correct. Both current descriptions concern describing tracer experiments, not claiming learner tracer execution.',
 7:'NADH electron entry through I versus II, I/III/IV proton pumping, terminal oxygen and electrochemical return through ATP synthase are correct. Uncoupling is distinguished from a full electron-chain block; no fixed universal ATP yield is imposed.',
 8:'Alcoholic versus lactate product and CO2 differences, net two glycolytic ATP and NAD+ regeneration are correct. Explanation and an independently executed investigation remain distinct assessable competencies; honest synthetic observations do not make the combined goal semantically atomic.',
 9:'Temperature, substrate, replication, biomass normalization and confounding explanations are sound. The first task explicitly asks for a hypothesis that its whole model/scoring never states. Both fermentation designs omit O2 regime/product-specific confirmation; yeast CO2 alone is compatible with respiration. Whole P is not ready.',
10:'Receptor agonism/antagonism, dose/time, sensitive developmental windows and cell/organism/population inference are correctly separated. No reported receptor activity is equated with a proven real waterbody risk or clinical recommendation.',
11:'Individual uptake/loss and trophic concentration increases are distinguished with comparable tissue/exposure assumptions. An individual time course cannot prove biomagnification, which need not occur for every pollutant.',
12:'Expected occupied patches 4 - 0.4 + 1.2 = 4.8 follows the stated external-pool independent model, explicitly not Levins cp. Integer realizations, variation, independent seeds, corridor benefits and disease counter-effects are differentiated.',
13:'Sexual reproductive isolation, morphological diagnostics and phylogenetic lineage criteria have distinct uses. Cryptic forms, fossils, asexual organisms, gene-tree/species-history conflict and nonconclusive individual hybrids are represented without deterministic species splitting.',
14:'Relative fitness 0.25/0.5/1 and s=0.75/0.5/0, survival x offspring 1.6/2.4 and normalized 2/3 versus 1 are arithmetically correct. Environment, inheritance, life-history stages and reproductive rather than moral fitness are explicit.',
15:'Habitat constraints, threat removal, origin/genetic diversity, monitoring/recruitment and trade-offs support one integrated restoration/reintroduction planning judgment. Release count or short-term survival is not equated with a self-sustaining successful reintroduction.',
16:'Endocrine mechanism and pollutant persistence/transfer are genuinely separable axes; receptor activity neither establishes persistence nor follows from it. The two-axis examples are sound but cannot resolve the compound whole atomicity finding.',
17:'Local lambda >1 versus <1 excludes migration from source/sink classification; occupancy is not demographic productivity. Directional dispersal, functional connectivity, colonization and the absence of net creation by redistribution are correct under stated model assumptions.',
18:'Different forward/reverse lake thresholds demonstrate model hysteresis; history matters at intermediate loading. Reinforcing plant/moisture/soil feedback does not by itself establish an observed threshold. Restoration and adaptive interventions remain reasoned possibilities, not measured success.',
19:'Linear predictions 95/75/55, residuals -1/+2/-1, finite valid interval, nonnegative real counts, area normalization and separate validation are correct. Correlation/software fit is not made causal. This is a simple authored ecological data-model exercise, not literal original compulsory bioinformatics.',
20:'Equal-weight means 50/55, minima 20/50 and changed means 74/59 are correct; value weights, costs, risk tolerance and species-specific corridor access are separate explicit assumptions. Scenarios are conditional, not guaranteed forecasts.',
21:'Rubisco oxygenation competes with carbon fixation; multi-organelle salvage, energy cost, partial carbon recovery and disruptive 2-phosphoglycolate removal are correct. Photorespiration is neither all respiration nor universally pointless/beneficial.',
22:'ATP/NADPH supply, light-linked enzyme activation, CO2 availability and temperature effects are distinct controls. A net respiratory counterflow is not an unambiguous decrease in Calvin fixation; the redox mechanism is an authored bounded explanation.',
23:'Shared acetyl-CoA pathways and reversible product feedback represent a network with capacity-limited rerouting. A regulatory node has a causal flux role, rather than mere diagram degree; no unlimited compensation or necessary mutation is asserted.',
24:'Immediate resistance and later recovery are separately operationalized; equal richness/counts do not guarantee function recovery. Response diversity, shared threats and explicitly selected functions/time/value criteria support conditional resilience management.'
}
findings = [
 {'findingId':'A24-ATOM08', 'ordinal':8, 'status':'HOLD', 'gate':'A/wholeP', 'reason':reasons[8], 'minimumRemedy':'Review a scope-preserving conceptual/practical split or an equally explicit source-faithful atomarity remedy. Do not remove the original practical operator or require human release approval for machine QA.'},
 {'findingId':'A24-ATOM16', 'ordinal':16, 'status':'HOLD', 'gate':'A/wholeSource/wholeP', 'reason':reasons[16], 'minimumRemedy':'Separate endocrine evaluation from persistence/trophic-transfer evaluation with preserved source roles. Original HE Q4.1 hormonal substances are not a literal standalone persistence duty.'},
 {'findingId':'A24-BY-CHROMATOGRAPHY03', 'ordinal':3, 'status':'HOLD', 'gate':'wholeSourceUnion', 'sourceGoalId':'2cc41e62-ec79-5add-9d43-2499b4e147b2', 'actualPrimary':'BY13 EA/GA 3.1 competence: separate photosynthetic pigments in leaf extract by chromatography; EA lines332-334, GA lines297-299 in actual official page', 'wholeCurrentPartnerIds':['ec782ce3-475e-5628-b3fe-947d72e74a74','fc89ed54-1a78-55a9-8e54-751d6d46dad6'], 'reason':'The first partner explains light harvesting; the second experimentally establishes light dependence. Neither current whole description performs pigment separation. Original source union is therefore not wholly covered by the retained two partners. The LHC cases themselves remain scientifically sound.', 'minimumRemedy':'Correct bounded source roles and preserve an explicit pending chromatographic separation obligation with an actually appropriate reviewed companion. Do not pretend a different light experiment is pigment separation.'},
 {'findingId':'A24-P09-HYPOTHESIS', 'ordinal':9, 'caseIds':['he-metabolism-ecology24-09-case-1'], 'status':'REVISE', 'gate':'P', 'reason':'The whole task requests a testable hypothesis. Its response and all four primary scoring criteria state variable roles/controls/maximal supplied value/limitations, but no hypothesis. Variable identification alone does not answer the hypothesis demand.', 'minimumRemedy':'Add an explicit testable temperature hypothesis plus a matching 10-point criterion, keeping whole controlled-model data and independent transfer.'},
 {'findingId':'A24-P09-FERMENTATION-IDENTIFICATION', 'ordinal':9, 'caseIds':['he-metabolism-ecology24-09-case-1','he-metabolism-ecology24-09-case-2'], 'status':'REVISE', 'gate':'P', 'reason':'Both designs use yeast CO2 but state no controlled oxygen regime or fermentative product confirmation. CO2 can also result from aerobic yeast respiration. The data interpretation is correct; fermentation-specific attribution needs an explicit discriminating design/control.', 'minimumRemedy':'Specify a safe controlled low-O2/anaerobic model and a product-specific confirmation/control, or explicitly restrict the inference to undifferentiated CO2-producing metabolism. Preserve the goal planning/evaluation scope and do not claim an executed learner experiment.'},
 {'findingId':'A24-REGIONAL01-02-SCOPE', 'ordinals':[1,2], 'status':'HOLD', 'gate':'wholeSource', 'reason':'Actual BB/BE pages29/30 and NW pages22/30 name basic photosynthesis meaning/word reaction schema and basic cellular-respiration energy transformation. They are not literal whole obligations for light/dark reaction modeling or glycolysis/cycle/chain. Existing many-to-one regional rows must state bounded contribution without claiming universal complete advanced-stage equivalence. Remaining MV/SH/SN/ST/TH original source spans were inventoried, but are not newly independently approved in this first pass.', 'minimumRemedy':'Target the concrete retained regional roles/source scopes and retain every actual source obligation and genuinely reviewed historical partner. Do not reopen unrelated accepted whole goals or claim all293 partners newly reviewed.'}
]
optional = {11,12,13,14,17,18,19,24}
clear = {4,5,6,7,10,15,20,21,22,23}
judgments = []
case_judgments = []
for index, goal in enumerate(whole['wholeGoals'],1):
    assert goal['id'] == proposals[index-1]['goalId']
    own_cases = [case for case in cases if case['goalId'] == goal['id']]
    assert len(own_cases) == 2
    source_keys = [edge['sourceKey'] for edge in sources['matchedEdgesData'] if edge['goalId'] == goal['id']]
    assert len(source_keys) == len(set(source_keys))
    p_status = 'HOLD_COMPOUND' if index in {8,16} else 'REVISE' if index==9 else 'KEEP_SCIENTIFIC_E1_G1_CANDIDATE'
    source_status = 'HOLD_REGIONAL_SCOPE' if index in {1,2} else 'HOLD_BY_CHROMATOGRAPHY_UNION' if index==3 else 'HOLD_COMPOUND' if index in {8,16} else 'KEEP_AUTHORED_NONMANDATORY_BOUNDARY_NO_WHOLE_CLOSURE' if index in optional else 'KEEP_BOUNDED_PRIMARY_PROPOSAL'
    judgments.append({'ordinal':index,'goalId':goal['id'],'wholeCurrentGoal':goal,'sourceKeys':source_keys,'scienceDescriptionVerdict':'HOLD_COMPOUND' if index in {8,16} else 'KEEP','scienceReason':reasons[index],'semanticAtomicityVerdict':'SPLIT_REVIEW' if index in {8,16} else 'atomic','semanticKindDecision':'Retain current curricularAtomic identity for this first pass; optional-source labeling does not delete current targets or alter the denominator. Compound8/16 are explicitly not accepted as strict current atoms.','memoryDecision':'KEEP existing no_memory_needed; reasoning/model/data/management performance is the competency, not an isolated recall list. Existing current card/visibility baseline is retained rather than falsely claimed as a new reviewer run.','sourceVerdict':source_status,'sourcePrimaryProposal':proposals[index-1],'positiveUnderstandingVerdict':p_status,'wholeCaseIds':[case['caseId'] for case in own_cases],'positiveProfileInput':binding(profiles_path),'clearForNextNativeAuthorSubset':index in clear,'D':'PENDING_TRUE_CURRENT_NATIVE_PAGE_REVIEW','V':'PENDING_ACTUAL_RASTER_REVIEW','machineApproved':False,'humanApproval':False,'humanTrial':False})
    for case in own_cases:
        case_judgments.append({'caseId':case['caseId'],'goalId':goal['id'],'wholeBilingualInputSha256':hashlib.sha256(json.dumps(case,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'scientificCaseVerdict':'REVISE' if index==9 else 'KEEP_WITH_EXPLICIT_WHOLE_COMPOUND_HOLD' if index in {8,16} else 'KEEP','reason':reasons[index],'materialTaskModelFreshTransferBothLanguagesPersonallyRead':True,'allTenPointCriteriaScientificAssessment':'Criteria exactly mirror personally read whole model and fresh model; reasoned 2/1/0 rule is appropriate, except explicit P9 completeness finding. This technical equality is not itself the scientific approval.','modelSynthetic':True,'actualLearnerPerformance':False,'performedExperiment':False,'evidenceLevel':'E1','maximumClaimScope':'G1','status':'ai_candidate','humanReviewStatus':'needs_human_review'})

source_judgments=[]
for ordinal, source in enumerate(sources['sourceGoals'],1):
    matched=[j for j in judgments if source['sourceKey'] in j['sourceKeys']]
    he=all('/DE-HE/' in source['mappingPath'] or 'hessen_biology_upper_secondary.' in source['mappingPath'] for _ in [0])
    by='/DE-BY/' in source['mappingPath']
    primary_read = he or by or ordinal in {1,2,3,4,37,38}
    verdict = 'HOLD_SPECIFIC_CHROMATOGRAPHY_UNION' if ordinal==6 else 'INDEPENDENT_BOUNDED_PRIMARY_AND_OPERATOR_READ_CURRENT_ROW_REMEDIATION_PENDING' if he else 'INDEPENDENT_WHOLE_OFFICIAL_BY_COMPONENT_READ_ROLE_LIMITS_RETAINED' if by else 'HOLD_VERIFIED_LOWER_STAGE_SCOPE' if ordinal in {1,2,3,4,37,38} else 'HOLD_PRIMARY_ORIGINAL_TARGETED_RECHECK_NOT_CLAIMED'
    source_judgments.append({'sourceKey':source['sourceKey'],'exactWholeSourceInput':source,'selectedTargetIds':[j['goalId'] for j in matched],'selectedTargetSourceVerdicts':[j['sourceVerdict'] for j in matched],'reviewVerdict':verdict,'wholeOfficialRelevantScopePersonallyRead':primary_read,'allPartnerRowsPreservedCount':len(source['allPartnerRows']),'allPartnerRowBodyInventoryExact':True,'wholePartnerScienceNewlyApproved':False,'wholeSourceUniversalClosureClaimed':False})

write('whole24-science-source-class-AM-P.independent-a.first.verdicts.json',{'schemaVersion':1,'reviewedAt':NOW,'reviewer':'Codex independent A; neither Bio24 source/case author nor root raster author','authorEntry':binding(entry_path),'authorFirstSeal':binding(first_path),'peerCurrentBReadBeforeFirstSeal':False,'ownJudgments':judgments,'findings':findings,'clearNextNativeAuthorOrdinals':sorted(clear),'sourceOptionalNamedMandatoryFalseOrdinals':sorted(optional),'actualCurrentWholeTargetsPreserved':392,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
write('whole48-complete-DEEN-case-and-profile-science.independent-a.first.json',{'schemaVersion':1,'wholeCases':binding(cases_path),'wholeProfiles':binding(profiles_path),'cases':case_judgments,'actualScoringTechnicalAssertionsPassed':48,'caseKEEP':46,'caseREVISE':2,'wholePScientificKEEP':21,'wholePCompoundHOLD':2,'wholePRevision':1,'sourceOnlyNativeAuthorP14NotIndependentScienceApproval':True,'noTwoTaskRuntimeQuota':True,'profileMinimumDemonstrationsIsCandidateWitnessCoverageNotRuntimePolicy':True,'approved':0,'humanReviewStatus':'needs_human_review'})
write('whole45-source50-edges293-partners.independent-a.first.source-inventory-and-boundaries.json',{'schemaVersion':1,'input':binding(source_path),'sourceDuties':source_judgments,'sourceDutiesCount':45,'targetEdges':50,'partnerRows':293,'actualRetained29WholeMappingExtractionSnapshots':binding(AUTHOR/'rebase-current/actual-full29-portable-source-snapshots.exact.json'),'existingTwelveUnselectedDecisionDifferencesPreserved':sources['existingPartnerDecisionDifferences'],'oldWhole144NeuroGK2HoldPreserved':True,'newWhole144OrRegionalUniversalApproval':False,'sourceOriginalsPendingAreRealHoldsNotClosed':True})
write('actual-primary-whole-scope-reading.independent-a.receipt.json',{'schemaVersion':1,'reviewedAt':NOW,'method':'Personally read complete original physical-page text extracted with PyMuPDF and actual official BY web scope; normalized author descriptions not used as original quotes.','HE':{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','originalPdfSHA256':'52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558','physicalPages':[42,44,45,46,47,48],'printedPages':[42,44,45,46,47,48],'officialPdfLocalPathObservation':'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','liveRequiredRawPDF':False,'wholePortableTexts':[binding(AUTHOR/f'primary/current-HE-physical-page-{page:03d}.whole-official.txt') for page in [42,44,45,46,47,48]]},'BY':[{'url':f'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/{mode}','wholeOfficialRelevantScopes':['3.1','3.2','3.3','4.1','4.2','4.3'],'actualWebWholeScopesRead':True,'portableText':binding(AUTHOR/f'primary/BY13-{code}-official.actual-text.txt')} for mode,code in [('erhoeht','EA'),('grundlegend','GA')]],'additionalActualOriginals':[{'officialLocalPdfObservation':'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf','sha256':'e9a386033898659b9c2fe865886f00632403f2242c91e0844afed811a906d1b9','wholePhysicalAndPrintedPages':[25,26,29,30],'scope':'BE/BB original3.2/3.3, binding content versus suggested basal concepts and experiments; basic principle does not literally require full current advanced goal.'},{'officialLocalPdfObservation':'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf','sha256':'536d51639cab388fc2966540fc9f9538327ea024e9d906a76792cee335b354a5','wholePhysicalAndPrintedPages':[22,30],'scope':'IF1 word equation/photosynthesis meaning; IF4 basic respiration/photosynthesis, not literal glycolysis/TCA/chain.'}],'MV_SH_SN_ST_THOriginalNewScienceApproval':False,'unreadOriginalDutiesExplicitlyHeld':True,'thirdPartySourceRightsNotRelicensed':True})
write('English6-smallest-author-wording-proposal.independent-a.decision.json',{'goalId':'ce6550f0-4ec3-5dd9-ab02-0296da98a371','wholeCurrentDescriptionEn':'The learner can describe tracer experiments to best explain the Calvin cycle.','proposedDescriptionEn':'The learner can describe tracer experiments used to elucidate the Calvin cycle.','verdict':'ACCEPT_BOUNDED_MEANING_CLARIFICATION_PROPOSAL_WITHOUT_NEW_CONTENT','reason':'Elucidation faithfully expresses zur Aufklärung and BY describe the tracer method. Current cases correctly use method, sequence and limited inference; they do not assert superiority of one tracer experiment. No independent new science performance, actual experiment or runtime quota is created.','currentWholeProfileCasesScienceKEEP':True,'canonicalChangeApplied':False,'requiredIfAdopted':'Genuine exact new whole-goal/source/class/A/M and affected D/P context bindings; no hash-only reapproval.','other23GoalBodiesUnchanged':True})
write('author-first-inputs-scoring-portability.own-actual.check.json',{'checkedAt':NOW,'ownAuthorFilesCompared':len(first['ownFiles']),'requiredAuthorInputsCompared':len(portability['requiredFiles']),'uniqueRequiredInputsCompared':len(dependencies),'requiredInputs':list(dependencies.values()),'digestOrSizeFailures':0,'ignoredRequiredFiles':[],'brokenRequiredSymlinks':[],'actualGitCheckIgnoreExit':ignored.returncode,'all48CriterionBodiesEqualReadModelAndFreshBodies':True,'all48ProfileBriefsEqualWholeCases':True,'whole24IndependentScienceNotDerivedFromChecks':True,'ownNoNativeD_VOrPerformedExperimentClaims':True,'activeWrites':0})
write('neutral-whole24-science-source-P-independent-a.first.entry.json',{'schemaVersion':1,'authorEntry':binding(entry_path),'authorInputSeal':binding(first_path),'ownWholeFirstVerdicts':binding(OWN/'whole24-science-source-class-AM-P.independent-a.first.verdicts.json'),'ownWhole48CaseProfileVerdicts':binding(OWN/'whole48-complete-DEEN-case-and-profile-science.independent-a.first.json'),'ownSource45Boundaries':binding(OWN/'whole45-source50-edges293-partners.independent-a.first.source-inventory-and-boundaries.json'),'ownPrimaryReceipt':binding(OWN/'actual-primary-whole-scope-reading.independent-a.receipt.json'),'ownEnglish6BoundedProposal':binding(OWN/'English6-smallest-author-wording-proposal.independent-a.decision.json'),'ownTechnicalInputCheck':binding(OWN/'author-first-inputs-scoring-portability.own-actual.check.json'),'reviewScope':'Genuine whole scientific/source/class/Memory/P first pass only. Actual raster/width/PDF and native finalD/P/V remain pending.','nextNativeAuthorOrdinals':sorted(clear),'whole48ScientificallyRead':True,'currentPeerBRead':False,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
write('whole24-science-source-P.independent-a.first.freeze.json',{'schemaVersion':1,'sealedAt':NOW,'kind':'Immutable genuine independent first Science/Source/Class/AM/P judgment, before current peer-B verdicts','ownFiles':[binding(path) for path in sorted(OWN.iterdir()) if path.is_file()],'authorInputSeal':binding(first_path),'peerCurrentBReadBeforeSeal':False,'authorOrActiveWrites':0,'newNativeD_VVerdictsOrRuns':0,'sourceOrWholeCompoundHoldsUnclosed':True,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'firstSeal':binding(OWN/'whole24-science-source-P.independent-a.first.freeze.json'),'neutralEntry':binding(OWN/'neutral-whole24-science-source-P-independent-a.first.entry.json'),'clearNextNativeAuthorOrdinals':sorted(clear),'scienceDescriptionKEEP':22,'compoundHOLD':2,'wholePKEEP':21,'wholePRevision':1,'whole48CasesReviewed':48,'portableUniqueInputsChecked':len(dependencies),'activeWrites':0},ensure_ascii=False))
