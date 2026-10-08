from pathlib import Path
import copy, datetime, hashlib, json, urllib.parse

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
SNAP = OWN / 'input-snapshots' / 'author'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
AUTHOR_REL = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1'
OWN_REL = OWN.relative_to(ROOT).as_posix()
read = lambda p: json.loads(p.read_text())
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def save(name, obj):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write('\n')

goals = read(SNAP / 'current-eighteen-whole-DEEN-goals.actual.json')['wholeGoals']
cases = read(SNAP / 'eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json')['wholeCases']
profiles = [json.loads(s) for s in (SNAP / 'P18.whole-current-author.review.jsonl').read_text().splitlines()]
sources = read(SNAP / 'eighteen-whole-primary-source-duty-and-operative-binding-proposals.author.json')['wholeSourceNotes']
patch = read(SNAP / 'proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json')

# The complete demands and answers were read in both languages from the whole-case
# document. Check every occurrence in the native profiles, including expectations.
binding = []
for i, (g, row, note) in enumerate(zip(goals, profiles, sources)):
    assert g == note['wholeCurrentGoal']
    pair = [c for c in cases if c['goalId'] == g['id']]
    assert len(pair) == 2
    for j, (c, b) in enumerate(zip(pair, row['profile']['applicationCaseBriefs'])):
        assert c['id'] == b['id']
        for locale, suffix in [('de', 'De'), ('en', 'En')]:
            assert b['taskDemand' + suffix] == c['material'][locale] + ' ' + c['task'][locale]
            assert b['expectedPerformance' + suffix] == c['modelAnswer'][locale]
            assert row['profile']['expectations'][j]['observablePerformance' + suffix] == c['task'][locale]
    binding.append({'goalId': g['id'], 'goalFingerprint': row['goalFingerprint'], 'reviewInputFingerprint': row['reviewInputFingerprint'], 'profileFingerprint': row['profileFingerprint'], 'caseIds': [c['id'] for c in pair], 'wholeDEENCaseFieldsExact': True, 'wholeExpectationsTaskFieldsExact': True})

math = {
    'clock8_case1_singleBranchMyr': .024 / (2 * .0015),
    'clock8_case2_pairRateMyr': .020 / .004,
    'clock8_case2_conditionalSingleBranchMyr': .020 / (2 * .001),
    'population13_case1_A': (2 * 36 + 48) / 200,
    'population13_case2_A_after': (2 * (10 + 8) + 20 + 2) / 120,
    'HWE14_expected_counts': [.7 ** 2 * 1000, 2 * .7 * .3 * 1000, .3 ** 2 * 1000],
    'HWE14_observed_A': (2 * 530 + 340) / 2000,
    'HWE14_subgroup_conditional': [.5 ** 2, 2 * .5 * .5, .5 ** 2],
    'bottleneck15_A': [(2 * 25 + 50) / 200, (2 * 3 + 2) / 10],
    'founder15_no_a_probability': .6 ** 10,
    'sexual16_case1_expected_offspring': [.6 * 4, .9 * 2],
    'sexual16_case2_expected_offspring': [[.8 * 3, .8 * 1.5], [.3 * 3, .8 * 1.5]],
    'selection10_case2_D': [.8 * 1, .8 * 2, .8 * 1],
}
seq = {'A': 'GGAAAAAAAAAA', 'B': 'GGGGAAAAAAAA', 'C': 'GGGGAAAAAAAT'}
math['molecular18_case1_site_distances'] = {a + b: sum(x != y for x, y in zip(seq[a], seq[b])) for a, b in [('A', 'B'), ('A', 'C'), ('B', 'C')]}
fitness = {'000': 1, '100': 1.3, '010': .9, '001': .8, '110': 1.1, '101': 1, '011': 1.2, '111': 1.8}
neighbors = lambda a: [b for b in fitness if sum(x != y for x, y in zip(a, b)) == 1]
math['fitness11_case2_local_maxima'] = [a for a in fitness if all(fitness[a] > fitness[b] for b in neighbors(a))]
changed = dict(fitness, **{'110': 1.5})
math['fitness11_case2_environment_path'] = [changed[x] for x in ['000', '100', '110', '111']]
assert math['molecular18_case1_site_distances'] == {'AB': 2, 'AC': 3, 'BC': 1}
assert math['fitness11_case2_local_maxima'] == ['100', '111']
assert math['clock8_case1_singleBranchMyr'] == 8
save('independent-numeric-and-whole-profile-case-checks.actual.json', {'recordedAt': NOW, 'wholeBindings': binding, 'independentRecalculations': math, 'interpretation': 'Checks verify the stipulated synthetic models only; no experimental execution or learner evidence.'})

from bs4 import BeautifulSoup
index = BeautifulSoup(Path('/tmp/skillpilot-evolution18-independent-b-20261008/official-index.html').read_text(), 'html.parser')
links = [{'label': a.get_text(' ', strip=True), 'href': a['href'], 'resolvedUrl': urllib.parse.urljoin('https://kultus.hessen.de', a['href'])} for a in index.find_all('a', href=True) if 'biologie' in a['href'].lower()]
assert len(links) == 1 and links[0]['resolvedUrl'] == 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
save('current-official-index-relative-link-correction.actual.json', {'recordedAt': NOW, 'originalReportPreserved': 'independent-primary-retrieval-and-whole13-extraction.actual.json', 'initialAbsoluteStringSearchFalse': True, 'cause': 'Official HTML contains a relative href. The earlier literal absolute-URL search was too narrow; no missing-link inference was made.', 'parsedActualBiologyLinks': links, 'currentOfficialLinkVerified': True})

# These are independent whole-competency judgments, written before any peer read.
science = [
    'Both complete cases assess fossils, anatomical homology and organelle-origin evidence together. Analogy, side branches and multiple lines of evidence are distinguished; no progress ladder or direct-ancestor certainty.',
    'Both allopatric and sympatric starting conditions are compared with gene flow and reproductive isolation. Chromosome doubling and island separation are bounded mechanisms; a single variant does not automatically establish a species.',
    'Complete fossil-history, branching and dispersal competence is assessed. African origin/date is independently checked against Smithsonian; uncertainty and limited interbreeding remain explicit. Proposed phylogenetic wording is scientifically precise.',
    'Tools and language are both connected to transmission and cumulative learning. Biological learning prerequisites are separated from inheritance of acquired instructions; archaeology is not claimed to preserve speech.',
    'Exogenous and endogenous proximate factors are explained in two primate contexts. Confounding and direction of causation are addressed; reproductive context is represented without making animal manipulation compulsory.',
    'Both complete historical cases accurately criticize Nazi coercion and pseudoscientific hierarchy. USHMM confirms the bounded factual background. Naturalistic inference and fitness versus dignity are distinguished.',
    'Complete comparison of allopatric, sympatric and hybridization-related routes is assessed. Fertility recovery after doubling, introgression, incomplete barriers and persistence of a hybrid lineage are distinguished.',
    'Defined single-branch versus pairwise rates give 8, 5 and conditionally 10 Myr correctly. Rate heterogeneity invalidates the strict model; calibration and substitutions delimit accuracy. No averaged false precision.',
    'Human and cultural hypotheses are evaluated together using separate fossils, genes and learned technologies. Mosaic traits, branching, chronology and uncertain attribution prevent inevitable linear histories.',
    'All three modes have appropriate heritable differences in reproductive contribution. Survival times reproduction is calculated correctly; random storm outcomes do not establish selection or automatic speciation.',
    'Single-bit neighborhoods, accessible monotone paths and local versus global maxima are correct. The second graph has local maxima 100 and 111; the path from000 stops at100 until environment changes. This represents relative fitness without teleology.',
    'Reciprocal selection is distinguished from merely matching structures. The temporal host-parasite matrix is correctly interpreted with hereditary response and controls kept separate from proven historical causation.',
    'All genotype/allele counts use 2N. Immigration shifts p from0.4 to58/120 without equilibrium inference; dominant appearance is correctly separated from allele frequency.',
    'HWE expectations and observed heterozygote deficit are calculated correctly. Unchanged p does not imply equal genotype frequencies; q=sqrt(aa) is explicitly conditional in the unverified subgroup.',
    'Drift, founder sampling and bottleneck are explained and calculated. a remains in heterozygotes despite absentaa; .6^10 applies only to explicitly independent allele draws.',
    'Mate choice and competition are represented as two mechanisms. Expected contributions2.4/1.8 and2.4/1.2 versus0.9/1.2 are correct; environmental costs change the ranking and yield no human social prescription.',
    'Both cladistics and orthologous molecular methods are applied. Shared derived characters support rooted trees; convergent function, outgroups, orthology and conflicting histories are checked. The targeted terminology/typo corrections preserve this one inferential competence.',
    'Aligned sequences support the stated shared-derived-character tree and distances2/12,3/12,1/12. Conflicting loci leave species relationships unresolved; possible lineage sorting and gene flow are hypotheses, not established events.',
]
anchors = [
    ('cross_topic_operationalization', 'Q2.1 and Q2 overview plus E.1', 'Fossil interpretation and molecular homology are linked to separately named endosymbiosis. This whole atom is valid cross-topic evidence work, not a verbatim three-item Q2.1 obligation.'),
    ('didactic_specification', 'Q2.1 basic level', 'Allopatric/sympatric mechanisms concretize named isolation/speciation; they are not a separate printed mandatory bullet.'),
    ('direct_content_operationalization', 'Q2.1 elevated level', 'The whole current goal corresponds to named human fossil history, hypothetical trees and dispersal; origin appears in the bounded cases. The English wording needs its proposed targeted repair.'),
    ('direct_content_operationalization', 'Q2.1 elevated level', 'Tool use and language are explicit content. Transmission/feedback analysis is a defensible whole-goal implementation.'),
    ('bounded_component_operationalization', 'Q2.1 elevated level', 'Exogenous/endogenous social-behavior causes are explicit. This atom is not the sole whole witness of the original row that also names reproductive behavior.'),
    ('optional_topic_operationalization', 'Q2.2 elevated level; optional topic', 'The whole historical misuse atom is supported as optional Q2.2 LK content. National Socialism is an illustrative example, not a universal compulsory source example.'),
    ('didactic_specification', 'Q2.1 basic content with authored LK depth', 'Comparing routes and hybridization is a direct biologically meaningful deepening of speciation/isolation; no separate mandatory named hybridization theorem is claimed.'),
    ('additional_named_model_enrichment', 'Q2.1 molecular evidence context; no named original clock duty', 'Clocks extend evidence about relatedness to calibrated divergence-time estimation. Generic quantitative/model standards do not establish this entire named method as required source content. Accept only an explicit authored enrichment binding, with non-mandatory source status.'),
    ('didactic_specification', 'Q2.1 elevated human/cultural content and Q2 overview', 'Hypothesis evaluation deepens the explicit human/cultural topic and introductory statement about provisional ancestry. It is not a new Q2.2 requirement.'),
    ('didactic_specification', 'Q2.1 basic selection/fitness with authored LK depth', 'The three modes concretize selection. Q2.2.4 is an authored historical locator, not an original curriculum passage.'),
    ('additional_named_model_enrichment', 'Q2.1 fitness/selection context; no original fitness-landscape duty', 'An explicit genotype-neighborhood landscape adds a selected mathematical model. General fitness plus generic model standards do not make local/global optimization a named original duty. Bind as authored enrichment, not Q2.2.5 officialCompetency.'),
    ('didactic_specification', 'Q2.1 basic coevolution with authored LK depth', 'Coevolution is explicitly basic content. Canonical LK depth does not establish LK-only source applicability or a three-context compulsory case quota.'),
    ('didactic_specification', 'Q2.1 population/variation context and Q1 genetic prerequisites', 'Allele counting is necessary concrete language for population genetic systems and drift. Q1.1.6 is not an original numbered obligation; phaseQ1 is compatibility metadata.'),
    ('additional_named_model_enrichment', 'Q2.1 population genetics context; no original Hardy-Weinberg duty', 'The entire named equilibrium-calculation goal exceeds the stated population-genetic species concept. Its correctness and usefulness do not establish a normative source mandate. An explicit non-mandatory authored enrichment binding is required; Q1.1.7 must not be printed as an official original quote.'),
    ('didactic_specification', 'Q2.1 basic drift with authored LK quantitative depth', 'Bottleneck/founder counting is a direct demographic realization of explicit drift. Independent-binomial probability is case-specific and does not become a universal curriculum procedure.'),
    ('didactic_specification', 'Q2.1 basic behavior/fitness, authored LK depth', 'Mate choice/competition and cost-benefit reproductive contribution implement explicit behavior and fitness content. Q3.3.8 is not the actual original source location.'),
    ('didactic_specification', 'Q2.1 basic trees and molecular homologies, authored LK depth', 'Cladistics operationalizes ancestral/derived characters, and orthologous comparison implements molecular evidence. Q3.3.9 and individual family genealogy are incorrect operative locators/meanings.'),
    ('didactic_specification', 'Q2.1 basic molecular homologies/trees, authored LK depth', 'Interpreting homologous sequence patterns directly operationalizes molecular evidence. The entire competency is supported without mandatory software or claims that every gene tree equals species history.'),
]
judgments = []
for i, (g, profile, note, sc, anchor) in enumerate(zip(goals, profiles, sources, science, anchors), 1):
    role, span, rationale = anchor
    judgments.append({'ordinal': i, 'goalId': g['id'], 'titleDe': g['title'], 'sourceGoalId': note['sourceGoalId'], 'wholeBodyDecision': 'TARGETED_WORDING_REPAIR' if i in [3, 17] else 'KEEP', 'sciencePerformanceDecision': 'KEEP', 'scienceReason': sc, 'wholeSourceRoleDecision': role, 'actualOriginalScope': span, 'sourceReason': rationale, 'normativeNamedDutyClaim': False if role in ['didactic_specification', 'additional_named_model_enrichment'] else 'bounded_original_content_only', 'sourceRequiredWholeGoalDecision': 'HOLD_NAMED_ENRICHMENT_BINDING' if i in [8, 11, 14] else 'KEEP_WITH_TRUTHFUL_TYPED_REBIND', 'operativeBindingDecision': 'HOLD_UNTIL_SCHEMA_VALID_SOURCE_REBIND', 'sourceKindsOrDutyChangesMustBeSubstantive': True, 'sourcePages': note['wholeOriginalPhysicalPages'], 'profileBinding': binding[i-1], 'humanApproval': False})
save('first-whole-source-science-judgment.independent-b.json', {
    'schemaVersion': 1, 'recordedAt': NOW, 'reviewer': 'codex-evolution18-independent-b', 'independence': {'authorRole': False, 'peerAOpenedBeforeFirstSeal': False, 'currentPeerReviewReads': 0},
    'authorFreezeSha256': '5c85c1f442a80caa01e4107eea1c8788e72b03df1256605a57e0fddc44c3462b',
    'reviewedWholeInputs': {'DEENWholeGoals': 18, 'completeDEENWholeCases': 36, 'nativeV2WholeProfiles': 18, 'wholeOriginalPages': 13, 'independentlyRetrievedURLs': 8},
    'decisions': judgments,
    'counts': {'scienceKEEP': 18, 'wholeBodiesKEEP': 16, 'targetedWordRepairGoals': 2, 'truthfulBoundedSourceOperationalizations': 15, 'namedEnrichmentSourceHOLD': 3, 'operativeBindingsHeldUntilConcreteSchemaValidRebind': 18, 'fullSelectedDenominator': 18, 'retainedCanonicalAtomicDenominator': 391, 'hiddenGoals': 0, 'strictClosures': 0},
    'operativeRequiredWork': ['Replace the officialCompetency/original-quote interpretation for all18 author-derived rows in a guarded new source version, keeping original historical files intact.', 'Keep source content level separate from authored canonical LK depth. Q2.2 misuse is optional; other evolution content belongs toQ2.1 even when compatibility phase isQ1/Q3.', 'For clocks, Hardy-Weinberg and fitness landscapes, bind the entire named goal as selected non-mandatory authored enrichment. Generic S5/E12 may support teaching methods but do not manufacture named mandatory original duties.', 'Apply exactly3 wording changes on2whole goals; independently reviewed semantics remain one inferential goal with no new mandatory memory cards.', 'Materialize and validate genuine native P18 and affected2A/M/classification bindings on the exact corrected candidate; preserve unchanged16whole bodies and valid A/M rows.', 'Actual images, native current D/P/V and two independent actual raster/page inspections remain a later input version.'],
    'sourceComparison': 'Current PDFStand01.08.2025 is independently hash-matched52c278d6...; historical2024-11 is5b3d39... . Evolution content agrees across current41/42 and historic39/40; the current page42 omits the start ofQ2.3 present on historic40. They are not byte-identical editions.',
    'technicalChecksAtFirstJudgment': 'Independent calculations and full case/profile field identity passed; own native schema and standard P/A/M runs remain separately recorded later.',
    'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'actualImagesInspected': 0, 'humanApproval': False, 'humanTrial': False, 'learnerData': False, 'performedExperiments': 0, 'activeWrites': 0,
})

save('neutral-eighteen-whole-source-science-independent-b.entry.json', {'schemaVersion': 1, 'recordedAt': NOW, 'packetId': OWN.name, 'role': 'Independent whole source/science/performance reviewer B; first opinion written without peerA', 'sourceAuthorFreezeSha256': '5c85c1f442a80caa01e4107eea1c8788e72b03df1256605a57e0fddc44c3462b', 'firstJudgment': OWN_REL + '/first-whole-source-science-judgment.independent-b.json', 'inputVerification': OWN_REL + '/author-100-inputs-verified-and-snapshotted.actual.json', 'wholeOriginalRetrieval': OWN_REL + '/independent-primary-retrieval-and-whole13-extraction.actual.json', 'scientificChecks': OWN_REL + '/independent-numeric-and-whole-profile-case-checks.actual.json', 'exactWholeGoals': 18, 'exactWholeCases': 36, 'exactWholeProfiles': 18, 'sourceFirst': True, 'actualImagesInspected': 0, 'finalRasterReviewPending': True, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})

def remap(obj):
    if isinstance(obj, str) and obj.startswith(AUTHOR_REL + '/'):
        return OWN_REL + '/input-snapshots/author/' + obj[len(AUTHOR_REL) + 1:]
    if isinstance(obj, dict): return {k: remap(v) for k, v in obj.items()}
    if isinstance(obj, list): return [remap(x) for x in obj]
    return obj

cfg = remap(read(SNAP / 'P18.whole-current-author.config.json'))
cfg['reviewId'] = OWN.name
cfg['reviewPath'] = OWN_REL + '/P18.whole-original-independent-b.review.jsonl'
save('P18.whole-original-independent-b.config.json', cfg)
candidates = read(SNAP / 'P18.thirty-six-whole-DEEN-cases.author.candidates.json')
candidates.update(reviewId=OWN.name, reviewedAt=NOW, reviewer='codex-evolution18-independent-b')
for item, j in zip(candidates['goals'], judgments):
    item['reason'] = 'Independent whole DEEN goal, both complete DEEN cases and whole profile reviewed: ' + j['scienceReason'] + ' Operative source correction pending; no strict closure.'
    item['dissent'] = ['Whole source decision: ' + j['sourceRequiredWholeGoalDecision'] + '. ' + j['sourceReason'], '18current goals remain visible; no human approval, learner evidence, actual experiments or image review.', 'Two independent demonstrations can be evidenced within genuine multistep transfer; these two case templates are not a new mandatory task quota.']
save('P18.independent-b.candidates.json', candidates)
for label in ['A18', 'M18']:
    cfg = remap(read(SNAP / (label + '.exact-retained-current.config.json')))
    if 'reportPath' in cfg: cfg['reportPath'] = OWN_REL + '/' + label + '.retained-native.report.actual.md'
    save(label + '.retained-native.config.json', cfg)

print(json.dumps({'firstWholeJudgments': 18, 'scienceKEEP': 18, 'namedEnrichmentSourceHOLD': 3, 'peerRead': False, 'nativeOriginalConfigurationsPrepared': 3}))
