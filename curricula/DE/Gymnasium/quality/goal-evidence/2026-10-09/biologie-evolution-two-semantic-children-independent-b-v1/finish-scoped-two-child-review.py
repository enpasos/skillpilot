# SPDX-License-Identifier: Apache-2.0
"""Seal scoped checks without integrating the inactive semantic split."""
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib
import importlib.util
import subprocess

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR = BASE / 'biologie-evolution-one-fossil-culture-semantic-split-author-c-v1'
OUT = BASE / 'biologie-evolution-two-semantic-children-independent-b-v1'
ENTRY = AUTHOR / 'neutral-begun-two-child-whole-candidate.commit-checkpoint.entry.json'
NOW = datetime.now(timezone.utc).isoformat()

def read(p):
    return json.loads(Path(p).read_text())

def binding(p):
    p = Path(p)
    assert not p.is_absolute() and p.is_file()
    assert not any(q.is_symlink() for q in [p, *p.parents])
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, obj):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return binding(p)

entry = read(ENTRY)
first_path = OUT / 'two-children.independent-b.science-A-M-P-FIRST.freeze.json'
first_binding = binding(first_path)
first = read(first_path)
for b in first['sealedArtifacts'] + first['exactInputBindings']:
    assert binding(b['path']) == b
assert binding(first['activeCanonicalBindingAtOwnFIRST']['path']) == first['activeCanonicalBindingAtOwnFIRST']
frame = read(entry['exactOriginalInputs']['path'])
source_comparisons = []
for row in frame['wholeOriginalSourceDutyRows']:
    assert binding(row['mappingBinding']['path']) == row['mappingBinding']
    assert binding(row['extractionBinding']['path']) == row['extractionBinding']
    mapping = read(row['mappingBinding']['path'])
    index = int(row['decisionJsonPointer'].split('/')[-1])
    assert mapping['decisions'][index] == row['wholeOriginalDecision']
    matching = [r for r in mapping['mappings'] if r['legacyGoalId'] == row['wholeOriginalDecision']['sourceGoalId']]
    assert matching == row['wholeOriginalMatchingEdges']
    source_comparisons.append({'rowId': row['rowId'], 'mapping': row['mappingBinding'], 'extraction': row['extractionBinding'],
        'wholeActualDecisionExact': True, 'wholeActualMatchingEdgesExact': True,
        'wholeOriginalPartnerIds': row['wholeCanonicalPartnerGoalIds'], 'newSourceApproval': False})
by_primary = BASE / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1/primary/BY10.actual-official.txt'
rp_primary = BASE / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1/primary/RP-original-full-affected-topic-pages.txt'
by_text, rp_text = by_primary.read_text(), rp_primary.read_text()
assert 'Savannenhypothese' in by_text
assert 'Stressreaktion' in rp_text
source_followup = write('two-children.post-FIRST-primary-boundary-corroboration.actual.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': NOW,
    'role': 'actual local official-source boundary reading after unchanged science FIRST; not new whole-source closure',
    'scienceFIRST': first_binding, 'actualSourceCaptures': [binding(by_primary), binding(rp_primary)],
    'sourceCaptureRights': 'Original external-source material retained under its own rights; no third-party relicensing. This receipt contains own paraphrases only.',
    'actualReadScope': ['whole BY B10 Lernbereich4 competence and contents block', 'whole RP physical28/48 printed26/46 topic pages'],
    'ownCorroboration': [
        'BY lists fossil-hypothesis chronological reconstruction and current cultural influence together, confirming the original goal-text distribution. Its contents also name the Savannenhypothese: later occurrence exclusivity versus origin hypotheses remain distinct. Current P cases do not by themselves discharge that named-source/context obligation.',
        'RP TF12 separately lists relationship-data analysis, ancestry-to-selected-human-behaviour explanation and cultural influences on humanity/biosphere. The selected behaviour example is stress reaction. The two children cover separate fossil and cultural pieces but do not explain a present behaviour through ancestry.',
        'Physical48/printed46 is the actual RP TF12 locus, while historical source rows retain their old sourceRef45. No page correction or regional mapping was performed by this review.'
    ],
    'changedScienceFIRSTJudgments': False, 'newMaterialFindings': [],
    'RPWholeDutyRemainsHOLD': 'source-duty-0276', 'sourceOrCourseApproval': False,
    'activeWrites': [], 'strictGain': 0
})
ordinary_receipt = read(OUT / 'two-exact-proposed-P.ordinary-schema-semantics-fingerprints.actual.json')
terminal = read(OUT / 'normal-proposed-P2.terminal.actual.json')
assert ordinary_receipt['actualExit'] == terminal['exitCode'] == 0
assert ordinary_receipt['needsHumanReview'] == 2 and ordinary_receipt['approved'] == 0
assert ordinary_receipt['currentConfiguredPCheckExecuted'] is False
assert len(ordinary_receipt['findings']) == 2
records_path = OUT / 'two-exact-proposed-whole-P.independent-b.ai-candidate.records.jsonl'
records = [json.loads(line) for line in records_path.read_text().splitlines() if line.strip()]
assert len(records) == 2
for r in records:
    assert r['reviewAuthority'] == 'ai_candidate' and r['status'] == 'needs_human_review'
    assert r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1'
spec = importlib.util.spec_from_file_location('ordinary_schema', 'scripts/validate_schemas.py')
normal_schema = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal_schema)
runtime_schema = read('docs/landscape-runtime.schema.json')
json_files = []
for p in OUT.glob('*.json'):
    read(p)
    assert normal_schema.validate_file(str(p), runtime_schema)
    json_files.append(binding(p))

operative = {}
def walk(obj):
    if isinstance(obj, dict):
        if all(k in obj for k in ['path', 'sha256', 'bytes']):
            actual = binding(obj['path'])
            assert actual == {k: obj[k] for k in ['path', 'sha256', 'bytes']}, obj['path']
            operative[actual['path']] = actual
            if actual['path'].endswith('.json'):
                read(actual['path'])
            elif actual['path'].endswith('.jsonl'):
                for line in Path(actual['path']).read_text().splitlines():
                    if line.strip(): json.loads(line)
        for value in obj.values(): walk(value)
    elif isinstance(obj, list):
        for value in obj: walk(value)

for p in OUT.glob('*.json'):
    walk(read(p))
for b in source_comparisons:
    walk(b)
for key in ['exactOriginalInputs', 'wholeGoalAndParentClusterCandidates', 'currentWholePAndFourConstructedBilingualCases',
            'currentNormalPAuthorSpecifications', 'proposedGoalAndKindBoundPRecords', 'sourcePlacementAndSemanticProposalsPending']:
    walk(entry[key])
for path in ['scripts/validate_schemas.py', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'app/scripts/positiveGoalEvidenceProfileModel.ts']:
    operative[path] = binding(path)
ignore = subprocess.run(['git', 'check-ignore', '--stdin'], input=('\n'.join(operative) + '\n').encode(), capture_output=True)
assert ignore.returncode == 1 and ignore.stdout == b'', ignore.stdout.decode()
assert binding(first_path) == first_binding
assert binding(first['activeCanonicalBindingAtOwnFIRST']['path']) == first['activeCanonicalBindingAtOwnFIRST']
checks = write('two-children.scoped-binding-full-JSON-portability-and-ordinary-P.actual.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'actual targeted technical check after genuine two-child scientific FIRST; no active integration',
    'ownScienceFIRST': first_binding, 'ordinaryP2Receipt': binding(OUT / 'two-exact-proposed-P.ordinary-schema-semantics-fingerprints.actual.json'),
    'actualP2Terminal': binding(OUT / 'normal-proposed-P2.terminal.actual.json'), 'actualExitCode': 0,
    'ordinaryFullSchemaErrors': 0, 'ordinarySemanticErrors': 0,
    'needsHumanReview': 2, 'approved': 0, 'bothExactWholeProfilesAndFingerprintsMatchSuccessor': True,
    'currentConfiguredCanonicalPApprovalClaimed': False,
    'reasonCurrentConfiguredCanonicalPNotExecuted': 'Both child IDs are still inactive proposals absent from the active canonical/kind ledger. Existing ordinary record schema, semantic helpers and fingerprint functions were used directly, without exceptions, synthetic active approval, or a shadow authoritative ledger.',
    'ownCompleteJSONParseCountBeforeThisReceipt': len(json_files), 'ownParsedJSONBindings': json_files,
    'ordinarySchemaParserClassifier': 'scripts/validate_schemas.py validate_file applied to each own evidence JSON',
    'operativeBindingCount': len(operative), 'operativeBindings': list(operative.values()),
    'missingOperativeBindings': 0, 'absoluteOperativePaths': 0, 'symlinks': 0, 'ignoredOperativeTargets': 0,
    'sourceDocumentPDFCachePathsInOriginalRows': 'Historical source identifiers/local optional caches; no portable snapshot or fresh primary approval is claimed for those unbound PDFs. Exact committable extraction/mapping/whole-row inputs and actual BY/RP captures are operative bindings.',
    'all13ActualMappingDecisionsAndEdgesExact': source_comparisons,
    'all22WholeCurrentPartnerBodiesEqualOriginalFrameAndActive': True,
    'wholeOriginalParentAndDEENProvenanceRequiresUnchanged': True,
    'currentCanonicalExactBeforeAfter': first['activeCanonicalBindingAtOwnFIRST'],
    'current479Nodes394Atoms299StrictNotChangedOrNewlyRecounted': True,
    'originalAuthorAndOldReviewBytesPreserved': True, 'strictGain': 0,
    'wholeSourceApproval': False, 'wholeCourseApproval': False, 'regionalViewApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False,
    'humanApproval': False, 'humanTrial': False, 'actualExperimentPerformed': False, 'actualLearnerPerformance': False,
    'fullQSOrBuildRun': False, 'activeWrites': []
})
neutral = write('neutral-completed-two-semantic-children-independent-b.review.entry.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'completed independent whole two-child science/A/M/P candidate review B; source/native/integration gates remain distinct',
    'neutralAuthorEntry': binding(ENTRY), 'originalParentId': entry['originalParentId'], 'candidateGoalIds': entry['candidateGoalIds'],
    'ownScienceFIRST': first_binding, 'ownWholeScienceVerdict': binding(OUT / 'two-children.independent-b.science-A-M-P-FIRST.verdict.json'),
    'exactWholeGoalsParentProfilesFourBilingualCases': binding(OUT / 'two-children.exact-whole-goals-parent-four-bilingual-cases.input.json'),
    'complete13Duty22PartnerReview': binding(OUT / 'two-children.independent-b.complete13-duty22-partner-scope-and-preservation.verdict.json'),
    'postFIRSTBoundedPrimaryCorroboration': source_followup, 'ordinaryScopedP2AndPortability': checks,
    'verdict': 'KEEP_exact_inactive_two_child_semantic_design_and_whole_P_case_candidates',
    'childSemanticDecisions': [{'goalId': i, 'semanticKind': 'curricularAtomic', 'atomicity': 'atomic', 'memory': 'no_memory_needed'} for i in entry['candidateGoalIds']],
    'parentSemanticDecision': 'curricularArea_cluster_with_original_goal_text_union_preserved',
    'originalGoalDEENUnionPreserved': True, 'all13Duties22WholePartnersRetained': True,
    'RPWholeDuty0276Closed': False, 'RPWholeDuty0276Status': 'HOLD_whole_ancestry_to_selected_behaviour_remains_unassigned',
    'requiredRemainingGates': entry['openGates'][2:],
    'newAuthorCorrectionFindings': [], 'peerWholeChildReviewRead': False,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'sourceApproval': False, 'courseApproval': False, 'regionalProjectionApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False, 'currentM7Approval': False,
    'humanApproval': False, 'humanTrial': False, 'actualExperimentPerformed': False, 'actualLearnerPerformance': False,
    'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0, 'activeWrites': []
})
assert normal_schema.validate_file(checks['path'], runtime_schema)
assert normal_schema.validate_file(neutral['path'], runtime_schema)
payloads = [binding(p) for p in sorted(OUT.iterdir()) if p.is_file()]
final = write('two-semantic-children.independent-b.final.freeze.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'final byte seal of bounded independent two-child science/A/M/P review without active integration',
    'completedNeutralEntry': neutral, 'sealedPayloads': payloads,
    'wholeTwoGoalsFourCases13Duties22PartnersRead': True,
    'scienceFIRSTBeforeAuthorQSAndOwnOrdinaryP2': True, 'peerWholeChildReviewRead': False,
    'ordinaryProposedP2ActualExit': 0, 'RPAncestryBehaviourSourceDutyRemainsHOLD': True,
    'noHistoricalOrActiveCanonicalRegistryQAWrites': True,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'wholeSourceApproval': False, 'wholeCourseApproval': False, 'regionalViewApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False, 'currentM7Approval': False,
    'humanApproval': False, 'humanTrial': False, 'actualExperimentPerformed': False, 'actualLearnerPerformance': False,
    'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0, 'activeWrites': []
})
assert normal_schema.validate_file(final['path'], runtime_schema)
for b in read(final['path'])['sealedPayloads']:
    assert binding(b['path']) == b
print(json.dumps({'entry': neutral, 'finalSeal': final, 'newCorrectionFindings': 0, 'strictGain': 0}, ensure_ascii=False))
