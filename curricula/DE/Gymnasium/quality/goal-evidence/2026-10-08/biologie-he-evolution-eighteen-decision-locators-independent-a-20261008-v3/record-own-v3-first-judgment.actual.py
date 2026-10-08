from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
def read(p): return json.loads(Path(p).read_text())
def write(n, v):
    with (OWN/n).open('x') as f:
        f.write(json.dumps(v, ensure_ascii=False, indent=2)+'\n')
def binding(p):
    p = Path(p)
    return {'path': str(p.relative_to(OWN)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
now = datetime.now(timezone.utc).isoformat()
v3 = OWN/'input-snapshots/author-v3'
entry = read(v3/'neutral-eighteen-source-v3-locator-review.entry.json')
review = read(v3/'hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json')
prior = read(OWN/'prior-own-v2/operative-eighteen-independent-a.first-judgment.json')
changes = read(OWN/'independent-actual27-decision-fields-vs-own-sealed-values.actual.json')
native = read(OWN/'independent-v3-current476-native18-closed-and-full144-hold.actual.json')
contexts = read(OWN/'current392.sourceindex.after.actual.json')
scope_check = read(OWN/'current392-native-sourceindex-and-visible-scope-check.actual.json')
assert len(changes['actualFieldChanges']) == 27
assert sum(c['field']=='topicCode' for c in changes['actualFieldChanges']) == 9
assert sum(c['field']=='sourceSpan' for c in changes['actualFieldChanges']) == 18
assert native['native18ProjectionPassed'] and native['closedSchemasPassed'] == 3
assert scope_check['actualCurrentAtomicGoalCount'] == 392 and scope_check['all18WholeContextsExactToOwnPreviouslyReadV2']
assert not native['full144']['passed']
science_reasons = {
 '7008979d-7890-5f7b-ad07-27b8bb597cbe': 'Molecular homology is the actual Q2.1 duty; fossils and endosymbiosis retain the independently read Q2 overview/E.1 connections. The entire three-item authored goal is not presented as a literal Q2.1 bullet.',
 '002543f9-2d14-5c57-99b4-fb4bf7e53734': 'Allopatric and sympatric mechanisms remain valid didactic distinctions within the actual broad isolation/speciation duty. Mere spatial separation is insufficient evidence of completed speciation.',
 '302c6d6d-bf10-5dbc-adda-65e4b5c63e49': 'The actual human-evolution LK component and its hypothetical branching interpretation are retained. The previously reviewed English phylogenetic-tree repair remains separately bound; no pedigree or linear ladder is substituted.',
 '0c999ebb-b4cb-5da3-90a1-69e3c6614db1': 'Tools and language are explicit Q2.1 LK content. Material tools do not independently establish spoken language or its precise origin; cultural transmission is not inheritance of acquired instructions as genes.',
 'a305bb18-69a3-5d92-9cfa-abf94b2eb051': 'The original LK component also names reproductive behavior; the canonical proximate-cause atom is partial coverage. Complete cases retain reproductive context without claiming animal manipulation or whole-source coverage.',
 '934d496d-eda4-5835-96d6-389885b93a51': 'The actual National Socialism component lies in optional Q2.2 LK. Its corrected locator supports this retained authored target without making it a compulsory HE core duty or hiding its stable ID.',
 'c5ffd083-2596-5726-ac1c-a8e2c06c1139': 'Deeper speciation examples stay under actual Q2.1 isolation/speciation content. Hybridization is an authored scientific differentiation and does not itself establish a stable species or a separate original bullet.',
 '80b42b5f-4b20-5035-907f-974a4a88618b': 'Molecular clocks remain a nonmandatory authored model specialization of molecular evidence. Calibration and model limits are retained; general S5/E9/E12 competencies do not mandate this named model.',
 '3718c6fe-0b58-5ff7-996c-25ca45b609d2': 'Human-evolution depth is truthfully located in Q2.1 LK and keeps evidence-based hominin hypotheses and cultural feedback. It is not a separate numbered original specialization.',
 '6bfcb8da-e337-5395-a50a-848f6a3abf4d': 'Selection modes are scientifically valid authored model distinctions of the broad Q2.1 selection duty. Current LK depth does not make that underlying original duty LK-only.',
 '28b4ae51-e3f7-5abc-a363-022114f50f0f': 'Fitness landscapes remain a nonmandatory authored Q2.1 model specialization. The corrected locator removes the false Q2.2 attribution; no compulsory named landscape model or inevitable global optimum is claimed.',
 '9fb0a26b-abb0-505f-b92a-320b2e6290e9': 'Coevolution is explicitly named in the actual Q2.1 basic component. LK depth is an authored choice; alternate example systems do not become a three-category assessment quota.',
 '0f4f3635-c0e9-517c-9a9d-1635b0d5fab5': 'Allele-frequency counting is a valid quantitative population-genetic operationalization of the actual Q2.1 component. Retained phaseQ1 compatibility metadata is not an asserted original Q1.1 source location.',
 '3accc03b-3daf-5119-9f33-93af6f709919': 'Hardy-Weinberg remains a transparent nonmandatory authored model specialization; corrected Q2.1 location and general model competencies do not turn it into a named original compulsory theorem.',
 '05a4f839-6b10-581e-a942-ba4497e6a279': 'Drift is actual Q2.1 content. Bottleneck/founder counting and explicit sampling assumptions remain authored operationalizations, with no invented original Q1.1.8 duty.',
 '34b06272-e997-59af-b12b-0a5e05d7d45f': 'Sexual selection is a valid authored interpretation of actual Q2.1 reproductive behavior and fitness. No original Q3 duty, human prescription or worth hierarchy is claimed.',
 '35b016d8-ed2c-570c-ab64-ac39f8f962b2': 'Cladistics and molecular methods remain appropriate operationalizations of actual Q2.1 trees and molecular evidence, with orthology, outgroup and conflicting-data limits. The two prior wording repairs remain separately reviewed.',
 '4abd762a-3c24-5909-a5d4-c8dfbcfe6275': 'Sequence-based phylogeny operationalizes actual molecular homology and tree reasoning. Correct Q2.1 locator avoids invented Q3.3 numbering; gene-tree/species-tree equivalence and mandatory tooling are not asserted.'
}
decisions = {d['sourceGoalId']: d for d in review['decisions']}
evidence = {e['id']: e for e in contexts['evidence']}
documents = {d['id']: d for d in contexts['documents']}
judgments = []
for p in prior['judgments']:
    gid, sid = p['goalId'], p['sourceGoalId']
    d, row = decisions[sid], p['exactWholeNewSourceRow']
    assert d['topicCode'] == row['topicCode'] and d['sourceSpan'] == row['sourceSpan']
    assert d['matchType'] == 'partial' and not d['wholeOriginalSourceCoverage'] and not d['wholeCanonicalGoalApproval']
    current_context = contexts['goals'][gid]
    used_evidence = [evidence[i] for r in current_context for i in r['evidenceIds']]
    used_docs = {e['documentId'] for e in used_evidence}
    judgments.append({
      'ordinal': p['ordinal'], 'goalId': gid, 'sourceGoalId': sid,
      'sourceRoleScienceVerdict': 'KEEP own genuine sealed v2 bounded-source judgment',
      'operativeDecisionVerdict': 'accept_corrected_bounded_source_candidate',
      'reason': 'The actual new decision topicCode and sourceSpan now exactly match the inspected original location and my own previously sealed required values. '+science_reasons[gid],
      'exactCurrentDecisionFieldBindings': {k:d[k] for k in ('sourceGoalId','topicCode','sourceSpan','decision','canonicalGoalIds','matchType','sourceKind','wholeOriginalSourceCoverage','wholeCanonicalGoalApproval')},
      'actual27CorrectionsForThisDecision': [c for c in changes['actualFieldChanges'] if c['sourceGoalId']==sid],
      'exactWholeNewMappingDecision': d,
      'unchangedWholeSourceRow': row,
      'unchangedWholePassage': p['exactWholeNewPassage'],
      'unchangedWholeMappingEdges': p['exactWholeMappingEdges'],
      'current392WholeSourceIndexContext': current_context,
      'current392WholeSourceIndexEvidence': used_evidence,
      'current392WholeSourceIndexDocuments': [documents[i] for i in sorted(used_docs)],
      'whole18Science36CasesAndTwoWordRepairs': 'KEEP own original independently sealed full judgments; no restart',
      'sourceScopeMatchExactMeaning': 'facets only; never literal whole-source coverage or whole-goal approval',
      'reviewAuthority':'ai_candidate', 'status':'needs_human_review', 'evidenceLevel':'E1', 'maximumClaimScope':'G1', 'humanApproval':False
    })
assert [j['goalId'] for j in judgments] == entry['scopeGoalIds']
write('neutral-eighteen-source-v3-independent-a.first.entry.json', {
 'schemaVersion':1, 'role':'Independent A targeted genuine decision-locator followup; own first judgment before any peer followup input',
 'scopeGoalIds':entry['scopeGoalIds'], 'authorFirstInputSeal':binding(OWN/'input-snapshots/eighteen-decision-locators-v3.author-first-input.freeze.json'),
 'exactAuthorMapping':binding(v3/'hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json'),
 'judgmentPath':'eighteen-decision-locators-independent-a.first-judgment.json', 'peerBFollowupRead':False,
 'priorOwnScienceAndSourceJudgmentPreserved':True,'candidateOnly':True,'activeWrites':False,'humanApproval':False
})
code_paths = [
 'scripts/compile_curriculum_release_model.py', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookOriginalSources.ts',
 'app/scripts/goalBookModel.ts', 'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts',
 'app/src/utils/goalBookPublicationRegistry.ts', 'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json',
 *[f'contracts/curriculum-package/v1/{n}.schema.json' for n in ('source-to-canonical-mappings','official-source-index','source-goal-reference-index')]
]
code_bindings = []
for s in code_paths:
    target = OWN/'actual-native-code-bindings'/s
    target.parent.mkdir(parents=True,exist_ok=True)
    assert not target.exists()
    shutil.copyfile(ROOT/s,target)
    code_bindings.append({**binding(target),'originalRepositoryPath':s})
write('actual-current-native-code-and-schema-bindings.json',{'recordedAt':now,'files':code_bindings,'schemaOrRuntimeChanges':False})
write('eighteen-decision-locators-independent-a.first-judgment.json', {
 'schemaVersion':1,'recordedAt':now,'role':'Own independent A first scientific judgment of actual v3 operative decision locators',
 'peerBFollowupRead':False,'authorFirstSealSha256':'4e960b794005cde4727cc276599910affa233a36f13366ca53816065a07d58d4',
 'exactNewMappingSha256':changes['exactNewMappingSha256'],'ownPriorV2FirstSealSha256':changes['ownV2FirstJudgmentSealSha256'],
 'ownPriorV2FinalSealSha256':'ef887e6dd515e09a64df6cc8f5f14b06ce5bae75fa4f159252b8114d555b1626',
 'source18OperativeVerdict':'accept_corrected_bounded_source_candidates', 'acceptedGoalIds':entry['scopeGoalIds'],'remainingEvolution18OperativeHolds':[],
 'correctedTopicCodes':9,'correctedSourceSpans':18,'boundedPrimaryComponents':15,'nonMandatoryAuthoredModelSpecialisations':3,
 'optionalQ22GoalId':'934d496d-eda4-5835-96d6-389885b93a51',
 'sourceRows144ExtractionIdentityUnchanged':True,'other126DecisionsLiteralByteExact':True,'compatibility158EdgesExact':True,
 'reviewIdVersionChangeExplicitlyBound':changes['newReviewId'],
 'originalCurrentSourcePagesAndAll18WholeContexts':'Previously actually read in own v2; literal primary records checked again against exact unchanged pages; current392 whole contexts independently compared and identical',
 'native18ActualExitCode':0,'existingClosedSchemasPassed':3,'currentAtomicGoalCount':392,'currentWholeGoalCount':476,'sourceViews':22,
 'sourceIndexContextChangesVsCurrentBefore':18,'otherSourceIndexContextChanges':0,'currentVisibleSetsAndCountsExact':True,
 'current476SourceOnlyCandidateDifferences':native['onlyThreeReviewedTextDifferences'],
 'whole144Verdict':native['full144'],'fullBookModelBuilt':False,'whole144ReleaseProjectionPassed':False,
 'scientificDecisionIsOwnReasonedJudgment':True,'nativeSchemaPassAloneIsScientificApproval':False,
 'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1',
 'D_P_V_Approvals':0,'strictNewClosureCount':0,'humanApproval':False,'learnerEvidence':False,'performedExperiments':0,'activeWrites':False,
 'ownSetupFailurePreserved':'native-current392-sourceindex.terminal.actual.json records initial generated-output path declaration error; corrected book-local declarations keep native checks intact and return files only in memory',
 'judgments':judgments
})
files = [binding(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('independent-a.decision-locators-v3.first-judgment.freeze.json', {
 'schemaVersion':1,'role':'Independent A own v3 first judgment sealed before peer followup input','sealedAtUTC':datetime.now(timezone.utc).isoformat(),
 'peerBFollowupRead':False,'files':files,'actualOperative18Accept':True,'whole144HoldPreserved':True,'activeWrites':False,'humanApproval':False
})
seal = OWN/'independent-a.decision-locators-v3.first-judgment.freeze.json'
print(json.dumps({'firstSealSha256':hashlib.sha256(seal.read_bytes()).hexdigest(),'firstSealFiles':len(files),'operative18':'accepted bounded candidate','full144':'HOLD NeuroGK2','currentAtomic392':True,'peerBRead':False}))
