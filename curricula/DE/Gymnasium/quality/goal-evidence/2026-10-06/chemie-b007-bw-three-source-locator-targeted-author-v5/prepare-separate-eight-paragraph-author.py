"""Separate, authorized eight-paragraph locator proposal; no active writes/builds."""
from pathlib import Path
import copy
import datetime
import hashlib
import json

OWN = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[7]
URL = 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(name):
    return json.loads((OWN / name).read_text())

def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

original = read('inputs-original/BW-SekI.source-extraction.original.json')
candidate = copy.deepcopy(original)
candidate['sourceDocument']['url'] = URL
changes = [{'pointer': '/sourceDocument/url', 'before': original['sourceDocument']['url'], 'after': URL, 'changeKind': 'separate exact V2 URL correction'}]
source_ids = []
whole_source_rows = []
for index, goal in enumerate(candidate['sourceGoals']):
    if goal['topicCode'] == '3.2.1.2' and 3 <= goal['bulletIndex'] <= 10:
        before = copy.deepcopy(goal)
        assert goal['sourceRef'].endswith('S. 15.')
        goal['sourceRef'] = goal['sourceRef'].replace('S. 15.', 'S. 16.')
        source_ids.append(goal['id'])
        changes.append({'pointer': f'/sourceGoals/{index}/sourceRef', 'before': before['sourceRef'], 'after': goal['sourceRef'], 'sourceGoalId': goal['id'], 'paragraph': goal['sourceSpan'], 'actualPhysicalPage1Based': 18, 'actualPrintedPage': 16})
        whole_source_rows.append({'sourceGoalId': goal['id'], 'beforeWholeSourceGoal': before, 'afterWholeSourceGoal': goal})
assert len(source_ids) == 8 and len(changes) == 9
assert original['passages'] == candidate['passages']
unchanged_first_two = [g for g in original['sourceGoals'] if g['topicCode'] == '3.2.1.2' and g['bulletIndex'] in [1, 2]]
assert len(unchanged_first_two) == 2
assert all(g in candidate['sourceGoals'] and g['sourceRef'].endswith('S. 15.') for g in unchanged_first_two)
write('raw-candidates/BW-SekI-eight-paragraph-locators-and-V2-URL.separate-author-candidate.json', candidate)

mapping = read('inputs-original/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json')
rows = [{'pointer': f'/mappings/{i}', 'wholeUnchangedMappingRow': r} for i, r in enumerate(mapping['mappings']) if r['legacyGoalId'] in source_ids]
assert len(rows) == 15
mapped_ids = sorted({r['wholeUnchangedMappingRow']['canonicalGoalId'] for r in rows})
active = read('inputs-original/chemie-current-active-base-alternative.canonical.original.json')
goal_by_id = {g['id']: g for g in active['goals']}
assert set(mapped_ids).issubset(goal_by_id)

report_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json'
report_bytes = report_path.read_bytes()
report = json.loads(report_bytes)
chemistry = next(s for s in report['subjects'] if s['subject'] == 'chemie')
protected = set(chemistry['strictCompleteGoalIds'])
assert len(protected) == chemistry['strictComplete'] == 127
protected_rows = [{'goalId': i, 'wholeCurrentGoal': goal_by_id[i], 'withinFiveDirectCanonicalProvenanceLocatorFields': goal_by_id[i].get('extendedData', {}).get('provenance', {}).get('sourceGoalId') in source_ids, 'withinExistingDirectMappedTargets': i in mapped_ids} for i in sorted(protected)]
assert len([r for r in protected_rows if r['withinFiveDirectCanonicalProvenanceLocatorFields']]) == 4

report_binding = {'path': str(report_path.relative_to(ROOT)), 'sha256': hashlib.sha256(report_bytes).hexdigest(), 'bytes': len(report_bytes), 'use': 'Actual current strict membership/count127 only; no new interpretation of D/P/A/M/V scientific verdicts'}
write('current127-protected-membership-and-actual-whole-source-goal-binding.snapshot.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'reportBinding': report_binding, 'denominator': chemistry['denominator'], 'currentStrictCompleteCount': 127, 'all127WholeCurrentGoals': protected_rows, 'directSourceRefFieldDeltaGoalIds': [r['goalId'] for r in protected_rows if r['withinFiveDirectCanonicalProvenanceLocatorFields']], 'existingMappedTargetIntersection127': sorted(protected.intersection(mapped_ids)), 'remaining123WholeGoalsExactAgainstCurrentActiveMetadataOnlyAlternative': True, 'B007V4UsesSeparatePriorBaseAndDoesNotClaimCurrent127WholeEquality': True, 'gateSourceContextBindingEqualityNotClaimed': True, 'requiredFutureDeltaQS': 'Integrator must check current127 Goal/Page/Context/Source bindings for the exact selected source-extraction, canonical and URL candidate. Unchanged texts/science do not erase changed source attribution. No new whole science review requested or performed.'})
write('eight-paragraph-scalar-fields-and-actual-target-reach.separate-author-candidate.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'Separate authorized author metadata candidate; no silent expansion of original B007 subset', 'sourceCandidate': 'raw-candidates/BW-SekI-eight-paragraph-locators-and-V2-URL.separate-author-candidate.json', 'sourceBaseline': 'inputs-original/BW-SekI.source-extraction.original.json', 'changes': changes, 'eightWholeSourceGoalBeforeAfter': whole_source_rows, 'headingPassagePage15ExactlyPreserved': original['passages'][1], 'correctFirstTwoParagraphPage15ExactlyPreserved': unchanged_first_two, 'allOtherSourceRecordsAndFieldsExactlyPreserved': True, 'mappedRowCount': len(rows), 'mappedDistinctTargetCount': len(mapped_ids), 'exactExistingMappedRowsNotReapproved': rows, 'exactExistingMappingDecisionsNotReapproved': [d for d in mapping['decisions'] if d['sourceGoalId'] in source_ids], 'wholeCurrentMappedTargets': [goal_by_id[i] for i in mapped_ids], 'canonicalProvenanceFieldReachAcrossAllEightSourceIDs': 'Exactly the same five canonical sourceRef fields already explicitly corrected in the separate B007/current-active alternative. Other seven SourceGoal IDs have mapping routes but no direct provenance.sourceGoalId field in the current canonical.', 'canonicalCandidatesForThisOptionalEightScope': ['raw-candidates/chemie-B007-v4-base.canonical.author-candidate.json', 'raw-candidates/chemie-current-active-base-alternative.canonical.author-candidate.json'], 'currentProtected127DeltaInput': 'current127-protected-membership-and-actual-whole-source-goal-binding.snapshot.json', 'newScienceReviewOrNativeSourceContextRebuild': False, 'currentSourceBindingApproval': 'PENDING two independent source audits and actual later Delta-QS; 403/413/40-scope decisions remain HOLD', 'sourceHoldsCleared': 0, 'strictCompletionsAdded': 0, 'humanApproval': False, 'activeWrites': 0})
entrance = read('raw-source-review-input.author-candidate.json')
entrance['separateExplicitlyAuthorizedEightParagraphCandidate'] = 'raw-candidates/BW-SekI-eight-paragraph-locators-and-V2-URL.separate-author-candidate.json'
entrance['separateEightParagraphBeforeAfterAndActualReach'] = 'eight-paragraph-scalar-fields-and-actual-target-reach.separate-author-candidate.json'
entrance['currentProtected127DeltaQSInput'] = 'current127-protected-membership-and-actual-whole-source-goal-binding.snapshot.json'
entrance['scopeChoiceForIntegrator'] = 'Original B007 paragraph(3)-only subset and optional explicit eight-paragraph proposal remain separate. Pick one source candidate; do not merge or double-count their operations. Both retain heading and paragraphs(1)/(2) S.15. Neither is a source coverage or scientific approval.'
write('raw-source-review-input.author-candidate.json', entrance)
guard = read('actual-input-and-no-write-binding-guard.author.json')
guard['boundInputs'].append(report_binding)
guard['separateEightParagraphAuthorPreparation'] = {'sourceGoalSourceRefChanges': 8, 'additionalCanonicalSourceRefChangesBeyondB007Subset': 0, 'sourceDocumentURLChange': 1, 'mappingRowsActuallyBound': 15, 'mappedDistinctTargetsActuallyBound': len(mapped_ids), 'protectedCurrentStrictCount': 127, 'protectedCurrentWholeGoalChangedByLocatorCandidates': 4, 'protectedCurrentWholeGoalUnchanged': 123, 'scientificOrSourceContextReapproval': False, 'sourceHoldsCleared': 0, 'buildsOrGlobalRuns': 0}
for row in guard['boundInputs']:
    assert hashlib.sha256((ROOT / row['path']).read_bytes()).hexdigest() == row['sha256'], 'Current input changed: ' + row['path']
write('actual-input-and-no-write-binding-guard.author.json', guard)
print(json.dumps(guard['separateEightParagraphAuthorPreparation']))
